import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test invite link endpoint called')

    const body = await request.json()
    const { email, role = 'admin' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log(`🧪 Generating test invite link for: ${email}`)

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const token = Buffer.from(`${email}-${role}-${Date.now()}`).toString('base64')
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000

    const inviteUrl = `${baseUrl}/admin/invite?email=${encodeURIComponent(email)}&role=${role}&token=${token}&expires=${expires}`

    console.log(`🧪 Generated invite URL: ${inviteUrl}`)

    return NextResponse.json({
      success: true,
      message: 'Test invite link generated successfully',
      inviteUrl,
      testData: {
        email,
        role,
        token,
        expires,
        expiresAt: new Date(expires).toISOString(),
        baseUrl,
      },
      instructions: {
        step1: 'Copy the inviteUrl and paste it in your browser',
        step2: 'You should see the profile creation form',
        step3: 'Fill out the form to create your account',
        step4: 'You will be redirected to the admin panel',
      },
    })
  } catch (error: any) {
    console.error('❌ Test invite link failed:', {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: 'Failed to generate test invite link',
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test invite link generator',
    usage: 'POST with { "email": "test@example.com", "role": "admin" }',
    description:
      'This endpoint generates a test invite link that you can use to test the profile creation flow',
    example: {
      email: 'test@example.com',
      role: 'admin',
    },
    note: 'The generated link will work for 7 days and will take you to the profile creation page',
  })
}
