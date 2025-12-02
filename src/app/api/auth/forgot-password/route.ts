import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import crypto from 'node:crypto'
import { enforceRateLimit } from '@/utils/rateLimiter'
import { logger } from '@/utils/logger'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    // Per-IP limit to stop a single client from hammering the endpoint
    const ipRateLimit = await enforceRateLimit({
      req,
      route: 'auth-forgot-password-ip',
      limit: 5,
      windowMs: 15 * 60 * 1000, // 5 requests per 15 minutes per IP
    })

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many password reset attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': ipRateLimit.retryAfter.toString(),
          },
        },
      )
    }

    // Per-email limit so a single account cannot be spammed from many IPs
    const emailRateLimit = await enforceRateLimit({
      req,
      route: 'auth-forgot-password-email',
      limit: 3,
      windowMs: 60 * 60 * 1000, // 3 reset emails per hour per email address
      identifierOverride: String(email).toLowerCase(),
    })

    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many reset links requested for this email. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': emailRateLimit.retryAfter.toString(),
          },
        },
      )
    }

    const payloadClient = await getPayload({ config: await configPromise })

    // Custom forgot-password flow using our own token + email instead of Payload's default
    try {
      const normalizedEmail = String(email).trim().toLowerCase()

      const users = await payloadClient.find({
        collection: 'users',
        where: {
          email: { equals: normalizedEmail },
        },
        limit: 1,
        overrideAccess: true,
        showHiddenFields: true,
      })

      const user = users.docs?.[0]

      if (user) {
        const token = crypto.randomBytes(32).toString('hex')
        const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

        // Store token in the same fields Payload uses so resetPassword() keeps working
        await payloadClient.update({
          collection: 'users',
          id: user.id,
          data: {
            resetPasswordToken: token,
            resetPasswordExpiration: expiration,
          },
          overrideAccess: true,
        })

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_SERVER_URL ||
          process.env.PAYLOAD_PUBLIC_SERVER_URL ||
          'http://localhost:3000'

        const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`

        // Send email via Payload's configured email adapter
        const subject = 'Password reset requested'
        const html = `
          <p>You requested to reset your password for JCL CMS.</p>
          <p>Click the link below to set a new password. This link will expire in 1 hour.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `

        const text =
          `You requested to reset your password for JCL CMS.\n\n` +
          `Use the link below to set a new password. This link will expire in 1 hour.\n\n` +
          `${resetUrl}\n\n` +
          `If you did not request this, you can safely ignore this email.`

        const sendEmail = (
          payloadClient as unknown as { sendEmail?: (args: unknown) => Promise<void> }
        ).sendEmail?.bind(payloadClient)

        if (typeof sendEmail === 'function') {
          await sendEmail({
            to: normalizedEmail,
            subject,
            html,
            text,
          })
        } else {
          logger.warn('[ForgotPassword] payload.sendEmail not available; reset email not sent')
        }

        logger.log('[ForgotPassword] Password reset link generated:', resetUrl)

        // In development, include the link in response to simplify testing
        if (process.env.NODE_ENV !== 'production') {
          return NextResponse.json({
            success: true,
            message: 'Reset link generated.',
            resetUrl,
          })
        }
      }
    } catch (e) {
      logger.error('[ForgotPassword] Failed to generate custom reset link:', e)
      // Do not leak details to client
    }

    return NextResponse.json({ success: true, message: 'Reset link sent if the email exists.' })
  } catch (error) {
    const message =
      typeof (error as Error)?.message === 'string'
        ? (error as Error).message
        : 'Failed to send reset link'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
