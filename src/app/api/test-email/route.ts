import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await request.json()
    const { to, subject = 'Test Email from JCL CMS' } = body

    if (!to) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log(`📧 Testing email functionality - sending to: ${to}`)

    // Test Payload's email service
    await payload.sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Test Successful! 🎉</h2>
          <p>This is a test email from JCL CMS to verify that the email configuration is working correctly.</p>
          <div style="background: #f0f8ff; border: 1px solid #0066cc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Email Configuration Status:</strong> ✅ Working
          </div>
          <p><strong>SMTP Details:</strong></p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT}</li>
            <li>From: ${process.env.SMTP_FROM}</li>
          </ul>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toISOString()}<br>
            From: JCL CMS Email Service
          </p>
        </div>
      `,
      text: `
        Email Test Successful!
        
        This is a test email from JCL CMS to verify that the email configuration is working correctly.
        
        SMTP Details:
        - Host: ${process.env.SMTP_HOST}
        - Port: ${process.env.SMTP_PORT}
        - From: ${process.env.SMTP_FROM}
        
        If you received this email, your SMTP configuration is working correctly!
        
        Sent at: ${new Date().toISOString()}
        From: JCL CMS Email Service
      `,
    })

    console.log(`✅ Test email sent successfully to: ${to}`)

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Failed to send test email:', {
      error: error.message,
      code: error.code,
      command: error.command,
    })

    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    usage: 'POST with { "to": "email@example.com" }',
    smtpConfig: {
      host: process.env.SMTP_HOST || 'Not configured',
      port: process.env.SMTP_PORT || 'Not configured',
      from: process.env.SMTP_FROM || 'Not configured',
      user: process.env.SMTP_USER || 'Not configured',
    },
  })
}
