import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log(`📧 Testing admin invite email functionality for: ${email}`)

    // Use shared email templates
    const { html, text } = emailTemplates.testEmail(email)

    // Test the email sending directly
    await payload.sendEmail({
      to: email,
      subject: 'Test Admin Invitation - JCL CMS',
      html,
      text,
    })

    console.log(`✅ Test admin invite email sent successfully to: ${email}`)

    return NextResponse.json({
      success: true,
      message: `Test admin invite email sent successfully to ${email}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Failed to send test admin invite email:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
    })

    return NextResponse.json(
      {
        error: 'Failed to send test admin invite email',
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test admin invite email endpoint',
    usage: 'POST with { "email": "test@example.com" }',
  })
}
