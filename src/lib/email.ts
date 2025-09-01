import nodemailer from 'nodemailer'

// Shared email transport configuration
export const createEmailTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP configuration is missing. Please check your environment variables.')
  }

  return nodemailer.createTransport({
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
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  })
}

// Verify email transport connection
export const verifyEmailTransport = async () => {
  const transport = createEmailTransport()

  try {
    await transport.verify()
    console.log('✅ Email transport verified successfully')
    return true
  } catch (error) {
    console.error('❌ Email transport verification failed:', error)
    return false
  }
}

// Get email transport instance
export const getEmailTransport = () => createEmailTransport()

// Email template helpers
export const emailTemplates = {
  adminInvite: (email: string, inviteUrl: string, role: string = 'admin') => ({
    subject: 'Admin Invitation - JCL CMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">You've been invited to JCL CMS Admin! 🎉</h2>
        <p>Hello,</p>
        <p>You have been invited to join the JCL CMS admin panel. Click the link below to accept your invitation and set up your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p><strong>Invitation Details:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Role: ${role}</li>
        </ul>
        <p style="color: #666; font-size: 14px;">
          This invitation link will expire in 7 days. If you have any questions, please contact your administrator.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 14px;">
          Sent at: ${new Date().toISOString()}<br>
          From: JCL CMS Admin System
        </p>
      </div>
    `,
    text: `
      You've been invited to JCL CMS Admin!
      
      Hello,
      
      You have been invited to join the JCL CMS admin panel.
      
      Accept your invitation: ${inviteUrl}
      
      Invitation Details:
      - Email: ${email}
      - Role: ${role}
      
      This invitation link will expire in 7 days.
      
      Sent at: ${new Date().toISOString()}
      From: JCL CMS Admin System
    `,
  }),

  twoFactorEnabled: (userName: string) => ({
    subject: 'Two-Factor Authentication Enabled - JCL CMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">JCL CMS</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">Content Management System</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">🔒 Two-Factor Authentication Enabled</h2>
          <p>Hello ${userName},</p>
          <p>Great news! Two-factor authentication has been successfully enabled on your JCL CMS account. Your account is now more secure.</p>
          <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Security Enhancement:</strong> From now on, you'll need to enter a code from your authenticator app when signing in.
          </div>
          <p><strong>Important reminders:</strong></p>
          <ul>
            <li>Keep your backup codes in a safe place</li>
            <li>Don't share your authenticator app with anyone</li>
            <li>If you lose access to your authenticator, use your backup codes</li>
          </ul>
          <p>If you didn't enable 2FA on your account, please contact our support team immediately.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 14px; color: #666;">Best regards,<br>The JCL CMS Team</p>
        </div>
      </div>
    `,
    text: `
      Two-Factor Authentication Enabled - JCL CMS
      
      Hello ${userName},
      
      Great news! Two-factor authentication has been successfully enabled on your JCL CMS account. Your account is now more secure.
      
      Security Enhancement: From now on, you'll need to enter a code from your authenticator app when signing in.
      
      Important reminders:
      - Keep your backup codes in a safe place
      - Don't share your authenticator app with anyone
      - If you lose access to your authenticator, use your backup codes
      
      If you didn't enable 2FA on your account, please contact our support team immediately.
      
      Best regards,
      The JCL CMS Team
    `,
  }),

  testEmail: (email: string) => ({
    subject: 'Test Email from JCL CMS',
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
  }),
}
