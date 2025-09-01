import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

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

      await payload.sendEmail({
        to: user.email,
        subject: 'Two-Factor Authentication Enabled - JCL CMS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">JCL CMS</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Content Management System</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
              <h2 style="color: #333; margin-top: 0;">🔒 Two-Factor Authentication Enabled</h2>
              <p>Hello ${user.firstName || user.name || user.email},</p>
              <p>Great news! Two-factor authentication has been successfully enabled on your JCL CMS account. Your account is now more secure.</p>
              <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>Security Enhancement:</strong> From now on, you'll need to enter a code from your authenticator app when signing in.
              </div>
              <p><strong>Important reminders:</strong></p>
              <ul>
                <li>Keep your backup codes in a safe place</li>
                <li>Don't share your authenticator app with anyone</li>
                <li>If you lose access to your authenticator, use your backup codes</li>
              </ul>
              <p>If you didn't enable 2FA on your account, please contact our support team immediately.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="font-size: 14px; color: #666;">Best regards,<br>The JCL CMS Team</p>
            </div>
          </div>
        `,
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
