import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { emailTemplates } from '@/lib/email'

// Generate a default invite URL if none is provided
function generateInviteUrl(email: string, role: string = 'admin'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const token = Buffer.from(`${email}-${role}-${Date.now()}`).toString('base64')
  return `${baseUrl}/admin/invite?email=${encodeURIComponent(email)}&role=${role}&token=${token}&expires=${Date.now() + 7 * 24 * 60 * 60 * 1000}`
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await request.json()
    const { email, role = 'admin', inviteUrl: providedInviteUrl } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Generate invite URL if not provided
    const inviteUrl = providedInviteUrl || generateInviteUrl(email, role)
    console.log(`📧 Using invite URL: ${inviteUrl}`)

    console.log(`📧 Sending admin invite email to: ${email}`)

    const { subject, html, text } = emailTemplates.adminInvite(email, inviteUrl, role)

    await payload.sendEmail({
      to: email,
      subject,
      html,
      text,
    })

    console.log(`✅ Admin invite email sent successfully to: ${email}`)

    return NextResponse.json({
      success: true,
      message: `Admin invite email sent successfully to ${email}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Failed to send admin invite email:', {
      error: error.message,
      code: error.code,
    })

    return NextResponse.json(
      {
        error: 'Failed to send admin invite email',
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    )
  }
}
