import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Environment check endpoint called')

    const envVars = {
      // Core Configuration
      DATABASE_URI: process.env.DATABASE_URI ? '✅ Configured' : '❌ Missing',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? '✅ Configured' : '❌ Missing',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? '✅ Configured' : '❌ Missing',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || '❌ Missing',

      // SMTP Configuration
      SMTP_HOST: process.env.SMTP_HOST || '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT || '❌ Missing',
      SMTP_SECURE: process.env.SMTP_SECURE || 'false',
      SMTP_USER: process.env.SMTP_USER || '❌ Missing',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ Configured' : '❌ Missing',
      SMTP_FROM: process.env.SMTP_FROM || '❌ Missing',

      // Node Environment
      NODE_ENV: process.env.NODE_ENV || 'development',
    }

    const missingCritical = []
    const missingSmtp = []

    if (!process.env.DATABASE_URI) missingCritical.push('DATABASE_URI')
    if (!process.env.PAYLOAD_SECRET) missingCritical.push('PAYLOAD_SECRET')
    if (!process.env.BETTER_AUTH_SECRET) missingCritical.push('BETTER_AUTH_SECRET')
    if (!process.env.NEXT_PUBLIC_SERVER_URL) missingCritical.push('NEXT_PUBLIC_SERVER_URL')

    if (!process.env.SMTP_HOST) missingSmtp.push('SMTP_HOST')
    if (!process.env.SMTP_USER) missingSmtp.push('SMTP_USER')
    if (!process.env.SMTP_PASSWORD) missingSmtp.push('SMTP_PASSWORD')
    if (!process.env.SMTP_FROM) missingSmtp.push('SMTP_FROM')

    const status = {
      timestamp: new Date().toISOString(),
      environment: envVars,
      status: {
        critical:
          missingCritical.length === 0
            ? '✅ All critical variables configured'
            : `❌ Missing ${missingCritical.length} critical variables`,
        smtp:
          missingSmtp.length === 0
            ? '✅ All SMTP variables configured'
            : `❌ Missing ${missingSmtp.length} SMTP variables`,
        overall:
          missingCritical.length === 0 && missingSmtp.length === 0
            ? '✅ Ready to run'
            : '⚠️ Configuration incomplete',
      },
      missing: {
        critical: missingCritical,
        smtp: missingSmtp,
      },
      recommendations: {
        setup: missingCritical.length > 0 ? 'Run: npm run setup:2fa' : null,
        email: missingSmtp.length > 0 ? 'Run: npm run setup:email' : null,
        test:
          missingSmtp.length === 0
            ? 'Test email: POST /api/simple-email-test'
            : 'Configure SMTP first',
      },
    }

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('❌ Environment check failed:', error)

    return NextResponse.json(
      {
        error: 'Environment check failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
