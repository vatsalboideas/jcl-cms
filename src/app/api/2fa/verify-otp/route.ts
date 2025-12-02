import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TwoFactorAuth } from '@/utils/TwoFactorAuth'
import { enforceRateLimit } from '@/utils/rateLimiter'
import { logger } from '@/utils/logger'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    const mask = (value?: string | null) => {
      if (!value) return 'none'
      const str = value.toString()
      if (str.length <= 2) return '*'.repeat(str.length)
      return `${'*'.repeat(str.length - 2)}${str.slice(-2)}`
    }

    logger.log('[2FA][Verify OTP] Request triggered', {
      email: email || 'missing',
      ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent'),
    })

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 },
      )
    }

    const rateLimit = await enforceRateLimit({
      req,
      route: '2fa-verify-otp',
      limit: 5,
      windowMs: 5 * 60 * 1000,
    })

    logger.log('[2FA][Verify OTP] Global rate limit status', {
      identifier: rateLimit.identifier,
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
    })

    if (!rateLimit.allowed) {
      logger.warn('[2FA][Verify OTP] Global rate limit hit', {
        identifier: rateLimit.identifier,
        retryAfter: rateLimit.retryAfter,
      })
      return NextResponse.json(
        {
          success: false,
          message: 'Too many verification attempts. Please wait before retrying.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter.toString(),
          },
        },
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const accountRateLimit = await enforceRateLimit({
      req,
      route: '2fa-verify-otp-account',
      limit: 5,
      windowMs: 5 * 60 * 1000,
      identifierOverride: `user:${normalizedEmail}`,
    })

    logger.log('[2FA][Verify OTP] Account rate limit status', {
      email: normalizedEmail,
      identifier: accountRateLimit.identifier,
      remaining: accountRateLimit.remaining,
      limit: accountRateLimit.limit,
    })

    if (!accountRateLimit.allowed) {
      logger.warn('[2FA][Verify OTP] Account rate limit hit', {
        email: normalizedEmail,
        identifier: accountRateLimit.identifier,
        retryAfter: accountRateLimit.retryAfter,
      })
      return NextResponse.json(
        {
          success: false,
          message:
            'Too many verification attempts for this account. Please wait before trying again.',
          retryAfter: accountRateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': accountRateLimit.retryAfter.toString(),
          },
        },
      )
    }

    // Validate OTP format
    if (!TwoFactorAuth.validateOTPFormat(otp)) {
      logger.warn('[2FA][Verify OTP] Invalid OTP format received', {
        email: normalizedEmail,
      })
      return NextResponse.json({ success: false, message: 'Invalid OTP format' }, { status: 400 })
    }

    const payloadClient = await getPayload({ config: await configPromise })

    // Find the user
    const users = await payloadClient.find({
      collection: 'users',
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      showHiddenFields: true,
    })

    if (!users.docs.length) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]

    // Maximum number of invalid OTP attempts allowed for a single OTP value.
    // This should stay in sync with the per-account rate limit (currently 5).
    const MAX_INVALID_OTP_ATTEMPTS = 5

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: '2FA is not enabled for this user' },
        { status: 400 },
      )
    }

    // Check if test mode is enabled
    const testMode = process.env.TEST_MODE === 'true' || process.env.OTP_TEST_MODE === 'true'
    const TEST_OTP = '123456'

    // If test mode is enabled and user is using test OTP, skip OTP existence/expiry checks
    const isUsingTestOTP = testMode && otp === TEST_OTP

    // Check if OTP exists and is not expired (skip if using test OTP in test mode)
    if (!isUsingTestOTP) {
      if (!user.otpCode || !user.otpExpiresAt) {
        return NextResponse.json(
          { success: false, message: 'No OTP found. Please request a new one.' },
          { status: 400 },
        )
      }

      // At this point TypeScript knows otpExpiresAt is not null/undefined
      const otpExpiresAt = user.otpExpiresAt
      if (TwoFactorAuth.isOTPExpired(otpExpiresAt)) {
        // Clean up expired OTP
        await payloadClient.update({
          collection: 'users',
          id: user.id,
          data: {
            otpCode: null,
            otpExpiresAt: null,
          },
        })

        return NextResponse.json(
          { success: false, message: 'OTP has expired. Please request a new one.' },
          { status: 400 },
        )
      }
    }

    // If the user has already exhausted invalid attempts for this OTP, force them
    // to request a new one. This ensures the last "correct" OTP cannot be used
    // once the invalid-attempts threshold has been crossed.
    const currentFailedAttempts =
      (user as { otpFailedAttempts?: number | null }).otpFailedAttempts ?? 0
    if (currentFailedAttempts >= MAX_INVALID_OTP_ATTEMPTS && !isUsingTestOTP) {
      logger.warn('[2FA][Verify OTP] OTP locked due to too many invalid attempts', {
        email: normalizedEmail,
        currentFailedAttempts,
      })

      // Clear OTP so it cannot be used again
      await payloadClient.update({
        collection: 'users',
        id: user.id,
        data: {
          otpCode: null,
          otpExpiresAt: null,
        },
        overrideAccess: true,
        showHiddenFields: true,
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Too many invalid attempts for this code. Please request a new OTP to continue.',
        },
        { status: 400 },
      )
    }

    // Verify OTP
    // In test mode, accept the test OTP (123456) or the actual OTP
    // In production mode, only accept the actual OTP
    const isValidOTP = testMode
      ? otp === TEST_OTP || (user.otpCode && user.otpCode === otp)
      : user.otpCode === otp

    if (!isValidOTP) {
      const nextFailedAttempts = currentFailedAttempts + 1

      logger.warn('[2FA][Verify OTP] OTP mismatch', {
        email: normalizedEmail,
        provided: mask(otp),
        stored: mask(user.otpCode),
        testMode,
        currentFailedAttempts,
        nextFailedAttempts,
      })

      // Increment failed-attempt counter; if we cross the limit, also invalidate the OTP
      const shouldInvalidateOTP = nextFailedAttempts >= MAX_INVALID_OTP_ATTEMPTS

      await payloadClient.update({
        collection: 'users',
        id: user.id,
        data: {
          otpFailedAttempts: nextFailedAttempts,
          ...(shouldInvalidateOTP
            ? {
                otpCode: null,
                otpExpiresAt: null,
              }
            : {}),
        },
        overrideAccess: true,
        showHiddenFields: true,
      })

      const message = shouldInvalidateOTP
        ? 'Too many invalid attempts for this code. Please request a new OTP to continue.'
        : 'Invalid OTP'

      return NextResponse.json({ success: false, message }, { status: 400 })
    }

    // Clear the OTP and return pending login token, if present
    const updated = await payloadClient.update({
      collection: 'users',
      id: user.id,
      data: {
        otpCode: null,
        otpExpiresAt: null,
        // Clear failed-attempt counter after successful verification
        otpFailedAttempts: 0,
      },
      overrideAccess: true,
      showHiddenFields: true,
    })

    const tokenToReturn = updated.pendingLoginToken || user.pendingLoginToken

    if (!tokenToReturn) {
      logger.error('[OTP Verify] No pending login token found for user:', user.email, user.id)
      return NextResponse.json(
        { success: false, message: 'No pending login session found. Please login again.' },
        { status: 400 },
      )
    }

    // Clear pendingLoginToken after use
    await payloadClient.update({
      collection: 'users',
      id: user.id,
      data: {
        pendingLoginToken: null,
      },
      overrideAccess: true,
    })

    // Set admin auth cookie so Payload Admin logs in
    const isProduction = process.env.NODE_ENV === 'production'

    // Get domain from environment variable first, then from request origin
    let cookieDomain: string | undefined = process.env.COOKIE_DOMAIN || undefined
    const origin = req.headers.get('origin') || req.headers.get('referer') || ''

    // Detect if request is actually HTTPS (check protocol from request)
    // Check x-forwarded-proto header (for proxies/load balancers), URL protocol, or origin
    const forwardedProto = req.headers.get('x-forwarded-proto')
    let protocol = forwardedProto || req.nextUrl.protocol || ''

    // Also check origin URL if available
    if (!protocol && origin) {
      try {
        const originUrl = new URL(origin)
        protocol = originUrl.protocol
      } catch (_e) {
        // Ignore parsing errors
      }
    }

    const isActuallyHTTPS = protocol === 'https:' || protocol === 'https'

    // Only set secure flag if actually using HTTPS (or force via env var)
    // In development, never use secure cookies unless forced
    const forceSecure = process.env.FORCE_SECURE_COOKIE === 'true'
    const isSecure = forceSecure || (isProduction && isActuallyHTTPS)

    // Helper function to check if a string is an IP address
    const isIPAddress = (hostname: string): boolean => {
      // IPv4 regex
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
      // IPv6 regex (simplified)
      const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
      return ipv4Regex.test(hostname) || ipv6Regex.test(hostname)
    }

    // In production, extract domain from origin if not set via env var
    if (!cookieDomain && isProduction && origin) {
      try {
        const url = new URL(origin)
        const hostname = url.hostname

        // Don't set domain for IP addresses or localhost
        if (
          !isIPAddress(hostname) &&
          !hostname.includes('localhost') &&
          !hostname.includes('127.0.0.1') &&
          hostname.includes('.') // Must have at least one dot (e.g., example.com)
        ) {
          // Extract root domain (e.g., example.com from app.example.com)
          const hostnameParts = hostname.split('.')
          // Only extract if we have at least 2 parts and it's a valid domain
          if (hostnameParts.length >= 2 && hostnameParts.every((part) => part.length > 0)) {
            cookieDomain = '.' + hostnameParts.slice(-2).join('.')
          }
        }
      } catch (e) {
        logger.warn('[OTP Verify] Could not parse origin for cookie domain:', e)
      }
    }

    // Log cookie settings for debugging
    logger.log('[OTP Verify] Setting cookie:', {
      secure: isSecure,
      sameSite: 'lax',
      domain: cookieDomain || 'not set',
      path: '/',
      hasToken: !!tokenToReturn,
      tokenLength: tokenToReturn?.length,
      protocol: protocol || 'unknown',
      forwardedProto: forwardedProto || 'not set',
      isActuallyHTTPS,
    })

    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token: tokenToReturn,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })

    // Set cookie with proper expiration (30 days)
    interface CookieOptions {
      httpOnly: boolean
      sameSite: 'lax' | 'strict' | 'none'
      secure: boolean
      path: string
      maxAge: number
      domain?: string
    }

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }

    // Only set domain in production if we have a valid domain
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain
    }

    response.cookies.set('payload-token', tokenToReturn, cookieOptions)

    // Also set a response header to help with debugging
    response.headers.set('X-Auth-Set', 'true')

    return response
  } catch (error) {
    logger.error('Verify OTP error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
