import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailTransport } from '@/lib/email'

export async function GET() {
  try {
    console.log('🔍 Checking email configuration status...')

    // Check environment variables
    const envStatus = {
      SMTP_HOST: process.env.SMTP_HOST || '❌ Not configured',
      SMTP_PORT: process.env.SMTP_PORT || '❌ Not configured',
      SMTP_USER: process.env.SMTP_USER || '❌ Not configured',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ Configured' : '❌ Not configured',
      SMTP_FROM: process.env.SMTP_FROM || '❌ Not configured',
      SMTP_SECURE: process.env.SMTP_SECURE || 'false',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || '❌ Not configured',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? '✅ Configured' : '❌ Not configured',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✅ Configured' : '❌ Not configured',
      DATABASE_URI: process.env.DATABASE_URI ? '✅ Configured' : '❌ Not configured',
    }

    // Test email transport
    let transportStatus = '❌ Failed to test'
    try {
      const isWorking = await verifyEmailTransport()
      transportStatus = isWorking ? '✅ Working' : '❌ Connection failed'
    } catch (error) {
      transportStatus = `❌ Error: ${error.message}`
    }

    const status = {
      timestamp: new Date().toISOString(),
      environment: envStatus,
      transport: transportStatus,
      endpoints: {
        testEmail: '/api/test-email',
        testAdminInvite: '/api/test-admin-invite',
        testUsersInvite: '/api/test-users-invite',
        usersSendInvite: '/api/users/send-invite',
        adminSendInvite: '/api/admin/send-invite',
        emailStatus: '/api/email-status',
      },
      usage: {
        testBasicEmail: 'POST /api/test-email with {"to": "email@example.com"}',
        testUsersInvite: 'POST /api/test-users-invite with {"email": "email@example.com"}',
        usersSendInvite:
          'POST /api/users/send-invite with {"email": "email@example.com", "inviteUrl": "https://example.com/invite"}',
      },
    }

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('❌ Failed to check email status:', error)

    return NextResponse.json(
      {
        error: 'Failed to check email status',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'test-transport':
        const isWorking = await verifyEmailTransport()
        return NextResponse.json({
          success: true,
          transportWorking: isWorking,
          message: isWorking ? 'Email transport is working' : 'Email transport failed',
        })

      case 'check-env':
        const envVars = {
          SMTP_HOST: process.env.SMTP_HOST,
          SMTP_PORT: process.env.SMTP_PORT,
          SMTP_USER: process.env.SMTP_USER,
          SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***configured***' : null,
          SMTP_FROM: process.env.SMTP_FROM,
          SMTP_SECURE: process.env.SMTP_SECURE,
        }
        return NextResponse.json({
          success: true,
          environment: envVars,
        })

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            validActions: ['test-transport', 'check-env'],
          },
          { status: 400 },
        )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
