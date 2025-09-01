import { NextRequest, NextResponse } from 'next/server'
import { getEmailTransport, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test users invite endpoint called')

    const body = await request.json()
    const { email = 'test@example.com' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log(`🧪 Testing users invite email for: ${email}`)

    // Create a sample invite URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/invite?token=sample-token-123`

    // Use shared email transport and templates
    const transport = getEmailTransport()
    const { subject, html, text } = emailTemplates.adminInvite(email, inviteUrl)

    console.log('🧪 Sending test email...')

    await transport.sendMail({
      from: `"JCL CMS" <${process.env.SMTP_FROM || 'noreply@jclcms.com'}>`,
      to: email,
      subject,
      html,
      text,
    })

    console.log(`✅ Test users invite email sent successfully to: ${email}`)

    return NextResponse.json({
      success: true,
      message: `Test users invite email sent successfully to ${email}`,
      timestamp: new Date().toISOString(),
      testData: {
        email,
        inviteUrl,
        subject,
      },
    })
  } catch (error: any) {
    console.error('❌ Failed to send test users invite email:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
    })

    return NextResponse.json(
      {
        error: 'Failed to send test users invite email',
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test users invite email endpoint',
    usage: 'POST with { "email": "test@example.com" }',
    description: 'This endpoint tests the users send-invite functionality with sample data',
    example: {
      email: 'test@example.com',
    },
    note: 'This will send a test admin invite email with a sample invite URL',
  })
}
