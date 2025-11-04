import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TwoFactorAuth, TwoFactorConfig } from '@/utils/TwoFactorAuth'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
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

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: '2FA is already enabled for this user' },
        { status: 400 },
      )
    }

    // Generate 2FA secret
    const config: TwoFactorConfig = {
      issuer: 'JCL CMS',
      label: 'JCL CMS',
    }

    const secret = TwoFactorAuth.generateSecret(user.email, config)
    const qrCode = await TwoFactorAuth.generateQRCode(secret, user.email, config)

    // Update user with the secret
    await payloadClient.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorSecret: secret,
      },
    })

    return NextResponse.json({
      success: true,
      message: '2FA setup initiated',
      data: {
        secret,
        qrCode,
        manualEntryKey: secret,
      },
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
