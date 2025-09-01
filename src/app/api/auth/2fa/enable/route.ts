import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload()
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { totpSecret, backupCodes } = body

    console.log(`🔐 Enabling 2FA for user: ${user.email}`)

    // Update user with 2FA settings
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: totpSecret,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    })

    // Send notification email using Payload's email service
    try {
      console.log(`📧 Sending 2FA enabled notification to: ${user.email}`)

      const { subject, html, text } = emailTemplates.twoFactorEnabled(
        user.firstName || user.name || user.email,
      )

      await payload.sendEmail({
        to: user.email,
        subject,
        html,
        text,
      })

      console.log(`✅ 2FA enabled notification sent successfully to: ${user.email}`)
    } catch (emailError: any) {
      console.error(`❌ Failed to send 2FA notification email:`, emailError.message)
      // Don't fail the 2FA enable process if email fails
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
    })
  } catch (error: unknown) {
    console.error('❌ 2FA enable error:', error.message)
    return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
  }
}
