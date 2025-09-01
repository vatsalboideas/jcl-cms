# Email Setup Guide for JCL CMS

This guide will help you set up and test the email functionality in JCL CMS. The email system is required for user operations like email verification, password reset, 2FA notifications, and admin invitations.

## 🚀 Quick Setup

### 1. Run the Email Setup Script

```bash
npm run setup:email
```

This script will:
- Generate required secrets (`BETTER_AUTH_SECRET`, `PAYLOAD_SECRET`)
- Set default server URL
- Check for missing SMTP configuration
- Provide examples for popular email providers

### 2. Configure Your SMTP Settings

Edit your `.env` file and add your SMTP credentials:

```bash
# Required SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

## 📧 Email Provider Setup

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Use the App Password** (16 characters) in `SMTP_PASSWORD`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Your 16-character app password
SMTP_FROM=your-email@gmail.com
```

### Outlook/Hotmail Setup

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

### Brevo (Sendinblue) Setup

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-username
SMTP_PASSWORD=your-brevo-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

### Custom SMTP Server

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

## 🧪 Testing Email Functionality

### 1. Test Basic Email Configuration

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### 2. Test Admin Invite Email

```bash
curl -X POST http://localhost:3000/api/test-admin-invite \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Check Email Configuration Status

```bash
curl http://localhost:3000/api/test-email
```

## 📋 Required Environment Variables

Make sure these variables are set in your `.env` file:

```bash
# Core Configuration
DATABASE_URI=postgresql://username:password@localhost:5432/jcl_cms
PAYLOAD_SECRET=your-payload-secret
BETTER_AUTH_SECRET=your-better-auth-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# SMTP Configuration (REQUIRED)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "SMTP connection failed"

**Symptoms**: Server logs show "❌ SMTP connection failed"

**Solutions**:
- Verify SMTP credentials are correct
- Check firewall settings
- Ensure SMTP port is open (587 or 465)
- For Gmail, use App Password, not regular password

#### 2. "Email not sending"

**Symptoms**: No error logs, but emails not received

**Solutions**:
- Check spam/junk folders
- Verify sender email reputation
- Test with different email providers
- Check SMTP provider's sending limits

#### 3. "Better Auth email not working"

**Symptoms**: User registration emails not sending

**Solutions**:
- Ensure `BETTER_AUTH_SECRET` is set
- Check Better Auth plugin configuration
- Verify email transport is configured

#### 4. "Payload email not working"

**Symptoms**: Admin invite emails not sending

**Solutions**:
- Check Payload email configuration
- Verify SMTP settings in payload.config.ts
- Test with test-email endpoint

### Debug Mode

Enable debug logging by adding to your `.env`:

```bash
DEBUG=better-auth:*
NODE_ENV=development
```

### Email Transport Verification

The system automatically verifies email transport on startup. Look for these logs:

```
✅ Email transport verified successfully
✅ SMTP server is ready to send emails
```

If you see errors, check your SMTP configuration.

## 📱 Email Types Supported

### 1. User Registration
- **Trigger**: New user signup
- **Template**: Email verification with activation link
- **Provider**: Better Auth plugin

### 2. Password Reset
- **Trigger**: User requests password reset
- **Template**: Password reset link
- **Provider**: Better Auth plugin

### 3. Two-Factor Authentication
- **Trigger**: 2FA enabled/disabled
- **Template**: Security notification
- **Provider**: Custom API route

### 4. Admin Invitations
- **Trigger**: Admin invites new user
- **Template**: Invitation with role details
- **Provider**: Custom API route

### 5. Test Emails
- **Trigger**: Manual testing
- **Template**: Configuration status
- **Provider**: Test endpoint

## 🚀 Production Deployment

### Environment Variables

For production, ensure these are properly set:

```bash
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com
```

### SMTP Provider Selection

**Recommended for production**:
- **SendGrid**: High deliverability, good for bulk emails
- **Mailgun**: Reliable, good for transactional emails
- **Brevo**: Good free tier, easy setup
- **AWS SES**: Cost-effective for high volume

### Security Considerations

- Use environment variables for all secrets
- Enable TLS/SSL for SMTP connections
- Use dedicated email accounts, not personal accounts
- Monitor email sending limits and reputation

## 📚 Additional Resources

- [Email Testing Guide](EMAIL_TESTING.md)
- [2FA Setup Guide](2FA_SETUP.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Better Auth Documentation](https://better-auth.com)
- [Payload CMS Email Documentation](https://payloadcms.com/docs/email/overview)

## 🆘 Getting Help

If you're still having issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple SMTP provider first (Gmail)
4. Check that all required packages are installed
5. Review the troubleshooting section above

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] SMTP credentials verified
- [ ] Test email sent successfully
- [ ] User registration emails working
- [ ] Admin invite emails working
- [ ] 2FA notification emails working
- [ ] Password reset emails working

Once all items are checked, your email system is fully configured and ready for production use!
