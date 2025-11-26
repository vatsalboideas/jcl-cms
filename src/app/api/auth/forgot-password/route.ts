import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { enforceRateLimit } from '@/utils/rateLimiter'
import { logger } from '@/utils/logger'

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await enforceRateLimit({
      req,
      route: 'auth-forgot-password',
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many password reset attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter.toString(),
          },
        },
      )
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    const payloadClient = await getPayload({ config: await configPromise })
    await payloadClient.forgotPassword({
      collection: 'users',
      data: { email },
    })

    // Attempt to fetch the reset token and log the URL for debugging
    try {
      const users = await payloadClient.find({
        collection: 'users',
        where: {
          email: { equals: email },
        },
        limit: 1,
        overrideAccess: true,
        showHiddenFields: true,
      })

      const user = users.docs?.[0] as any
      const token = user?.resetPasswordToken
      if (token) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`
        logger.log('[DEBUG] Password reset link:', resetUrl)

        // In development, include the link in response to simplify testing
        if (process.env.NODE_ENV !== 'production') {
          return NextResponse.json({
            success: true,
            message: 'Reset link generated.',
            resetUrl,
          })
        }
      }
    } catch (e) {
      // Silently ignore token logging failures to avoid exposing details in prod
    }

    return NextResponse.json({ success: true, message: 'Reset link sent if the email exists.' })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to send reset link'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
