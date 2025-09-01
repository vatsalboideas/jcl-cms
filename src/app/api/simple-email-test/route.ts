import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple email test endpoint called')

    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log(`🧪 Testing simple email to: ${to}`)

    // Check environment variables
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD ? '***configured***' : '❌ missing',
      from: process.env.SMTP_FROM,
      secure: process.env.SMTP_SECURE,
    }

    console.log('🧪 SMTP Config:', smtpConfig)

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        {
          error: 'SMTP configuration incomplete',
          missing: {
            SMTP_HOST: !process.env.SMTP_HOST,
            SMTP_USER: !process.env.SMTP_USER,
            SMTP_PASSWORD: !process.env.SMTP_PASSWORD,
            SMTP_FROM: !process.env.SMTP_FROM,
          },
          config: smtpConfig,
        },
        { status: 400 },
      )
    }

    // Create transport directly
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    console.log('🧪 Transport created, testing connection...')

    // Test connection
    try {
      await transport.verify()
      console.log('✅ SMTP connection verified')
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError)
      return NextResponse.json(
        {
          error: 'SMTP connection failed',
          details: verifyError.message,
        },
        { status: 500 },
      )
    }

    // Send test email
    const mailOptions = {
      from: `"JCL CMS Test" <${process.env.SMTP_FROM}>`,
      to: to,
      subject: 'Simple Email Test - JCL CMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Simple Email Test Successful! 🎉</h2>
          <p>This is a simple test email from JCL CMS.</p>
          <p><strong>To:</strong> ${to}</p>
          <p><strong>From:</strong> ${process.env.SMTP_FROM}</p>
          <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            If you received this email, your basic SMTP configuration is working!
          </p>
        </div>
      `,
      text: `
        Simple Email Test Successful!
        
        This is a simple test email from JCL CMS.
        
        To: ${to}
        From: ${process.env.SMTP_FROM}
        SMTP Host: ${process.env.SMTP_HOST}
        Timestamp: ${new Date().toISOString()}
        
        If you received this email, your basic SMTP configuration is working!
      `,
    }

    console.log('🧪 Sending email...')

    const result = await transport.sendMail(mailOptions)

    console.log('✅ Email sent successfully:', result.messageId)

    return NextResponse.json({
      success: true,
      message: `Simple test email sent successfully to ${to}`,
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        from: process.env.SMTP_FROM,
      },
    })
  } catch (error: any) {
    console.error('❌ Simple email test failed:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
    })

    return NextResponse.json(
      {
        error: 'Simple email test failed',
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple email test endpoint',
    usage: 'POST with { "to": "your-email@example.com" }',
    description: 'This endpoint tests basic SMTP functionality without complex dependencies',
    environment: {
      SMTP_HOST: process.env.SMTP_HOST || '❌ Not configured',
      SMTP_PORT: process.env.SMTP_PORT || '❌ Not configured',
      SMTP_USER: process.env.SMTP_USER || '❌ Not configured',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ Configured' : '❌ Not configured',
      SMTP_FROM: process.env.SMTP_FROM || '❌ Not configured',
    },
  })
}
