import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TwoFactorAuth } from '@/utils/TwoFactorAuth'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 },
      )
    }

    // Validate OTP format
    if (!TwoFactorAuth.validateOTPFormat(otp)) {
      return NextResponse.json({ success: false, message: 'Invalid OTP format' }, { status: 400 })
    }

    const payloadClient = await getPayload({ config: await configPromise })

    // Find the user
    const users = await payloadClient.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (!users.docs.length) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: '2FA is not enabled for this user' },
        { status: 400 },
      )
    }

    // Check if OTP exists and is not expired
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

    // Verify OTP
    if (user.otpCode !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 })
    }

    // Clear the OTP and return pending login token, if present
    const updated = await payloadClient.update({
      collection: 'users',
      id: user.id,
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    })

    const tokenToReturn = updated.pendingLoginToken || user.pendingLoginToken

    if (tokenToReturn) {
      // Clear pendingLoginToken after use
      await payloadClient.update({
        collection: 'users',
        id: user.id,
        data: {
          pendingLoginToken: null,
        },
      })
      // Set admin auth cookie so Payload Admin logs in
      const isSecure = process.env.NODE_ENV === 'production'
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
      response.cookies.set('payload-token', tokenToReturn, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
      })
      return response
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token: tokenToReturn || null,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
