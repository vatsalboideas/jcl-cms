import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'
import { TwoFactorAuth } from '@/utils/TwoFactorAuth'

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json(
        { success: false, message: 'Email and token are required' },
        { status: 400 },
      )
    }

    // Find the user
    const users = await payload.find({
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

    // Check if user has a 2FA secret
    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { success: false, message: '2FA not set up for this user' },
        { status: 400 },
      )
    }

    // Verify the token
    const isValid = TwoFactorAuth.verifyToken(token, user.twoFactorSecret)

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid 2FA token' }, { status: 400 })
    }

    // Disable 2FA
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        otpCode: null,
        otpExpiresAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    })
  } catch (error) {
    console.error('Disable 2FA error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
