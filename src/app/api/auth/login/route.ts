import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Create a Payload instance bound to our config
    const payloadClient = await getPayload({ config: await configPromise })

    // Verify credentials with Payload
    let loginResult: any
    try {
      loginResult = await payloadClient.login({
        collection: 'users',
        data: { email, password },
        req,
      })
    } catch (e: any) {
      const message = typeof e?.message === 'string' ? e.message : 'Invalid credentials'
      return NextResponse.json({ success: false, message }, { status: 401 })
    }

    const { user, token } = loginResult || {}
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    // If 2FA is enabled, stage the token and require OTP verification
    if (user.twoFactorEnabled) {
      await payloadClient.update({
        collection: 'users',
        id: user.id,
        data: {
          pendingLoginToken: token,
          otpCode: null,
          otpExpiresAt: null,
        },
      })

      return NextResponse.json({
        success: true,
        requires2FA: true,
        message: '2FA verification required. Please check your email for OTP.',
        data: { email: user.email },
      })
    }

    // 2FA not enabled — set auth cookie and return token and user info
    const isProduction = process.env.NODE_ENV === 'production'

    // Detect if request is actually HTTPS
    const forwardedProto = req.headers.get('x-forwarded-proto')
    let protocol = forwardedProto || req.nextUrl.protocol || ''
    const origin = req.headers.get('origin') || req.headers.get('referer') || ''

    if (!protocol && origin) {
      try {
        const originUrl = new URL(origin)
        protocol = originUrl.protocol
      } catch (_e) {
        // Ignore parsing errors
      }
    }

    const isActuallyHTTPS = protocol === 'https:' || protocol === 'https'
    const forceSecure = process.env.FORCE_SECURE_COOKIE === 'true'
    const isSecure = forceSecure || (isProduction && isActuallyHTTPS)

    const response = NextResponse.json({
      success: true,
      requires2FA: false,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })
    // Set admin auth cookie so Payload Admin logs in
    response.cookies.set('payload-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
