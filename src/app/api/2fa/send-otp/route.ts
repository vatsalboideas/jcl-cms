import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { TwoFactorAuth } from '@/utils/TwoFactorAuth'

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

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: '2FA is not enabled for this user' },
        { status: 400 },
      )
    }

    // Generate OTP
    const otp = TwoFactorAuth.generateOTP()
    const expiresAt = TwoFactorAuth.generateOTPExpiry()

    // Log OTP in server logs for debugging as requested
    console.log(
      `[2FA] Generated OTP for ${user.email}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`,
    )

    // Save OTP to user record
    await payloadClient.update({
      collection: 'users',
      id: user.id,
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt.toISOString(),
      },
    })

    // Send email with OTP
    try {
      await payloadClient.sendEmail({
        to: user.email,
        from: {
          name: 'JCL CMS',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || '',
        },
        subject: 'Your JCL CMS Login Verification Code',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>JCL CMS - Login Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; }
              .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔐 JCL CMS</h1>
              <p>Two-Factor Authentication</p>
            </div>
            
            <div class="content">
              <h2>Hello ${user.firstName || 'User'}!</h2>
              
              <p>You've requested to log in to your JCL CMS account. To complete your login, please use the verification code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p><strong>Verification Code</strong></p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This code will expire in <strong>10 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              
              <p>Enter this code in the login verification screen to complete your authentication.</p>
              
              <p>If you have any questions or need assistance, please contact your system administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from JCL CMS. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} JCL CMS. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      })

      console.log(`[2FA] OTP email sent to ${user.email}`)
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          expiresAt,
        },
      })
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      console.error('[2FA] SMTP details check:', {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        hasPassword: Boolean(process.env.SMTP_PASSWORD),
      })

      // Clean up the OTP if email fails
      await payloadClient.update({
        collection: 'users',
        id: user.id,
        data: {
          otpCode: null,
          otpExpiresAt: null,
        },
      })

      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email' },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
