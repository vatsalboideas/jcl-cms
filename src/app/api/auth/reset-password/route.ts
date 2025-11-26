import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { enforceRateLimit } from '@/utils/rateLimiter'

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await enforceRateLimit({
      req,
      route: 'auth-reset-password',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many password reset submissions. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter.toString(),
          },
        },
      )
    }

    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 },
      )
    }

    const payloadClient = await getPayload({ config: await configPromise })
    await payloadClient.resetPassword({
      collection: 'users',
      data: { token, password },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, message: 'Password has been reset' })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to reset password'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
