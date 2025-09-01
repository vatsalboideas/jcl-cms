# Email Testing Guide

## Quick Email Test

To test if your email configuration is working:

### 1. Test Email API Endpoint

```bash
# Test the email configuration
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### 2. Check Email Configuration

```bash
# View current email configuration
curl http://localhost:3000/api/test-email
```

## Expected Logs

When emails are sent successfully, you should see logs like:

```
📧 Initializing email transport with config: {
  host: 'smtp-relay.brevo.com',
  port: '587',
  user: '77e9a3001@smtp-brevo.com',
  from: 'vatsal.soni@boideas.com'
}
✅ SMTP server is ready to send emails
📧 Testing email functionality - sending to: test@example.com
✅ Test email sent successfully to: test@example.com
```

## Troubleshooting

### If you see "❌ SMTP connection failed"

1. **Check your credentials**:
   - Verify `SMTP_USER` and `SMTP_PASSWORD` in `.env`
   - For Brevo, make sure you're using the correct SMTP credentials

2. **Check network connectivity**:
   - Ensure your server can reach `smtp-relay.brevo.com:587`
   - Check firewall settings

3. **Verify Brevo account**:
   - Login to your Brevo account
   - Check that SMTP is enabled
   - Verify daily sending limits

### If emails are not being received

1. **Check spam folder**
2. **Verify sender reputation**
3. **Check Brevo sending statistics**
4. **Test with different email providers**

## Current Configuration

Your current email setup:
- **Provider**: Brevo (formerly Sendinblue)
- **Host**: smtp-relay.brevo.com
- **Port**: 587
- **From**: vatsal.soni@boideas.com
- **User**: 77e9a3001@smtp-brevo.com

## 2FA Email Testing

To test 2FA emails:

1. **Create a test user**:
   - Go to `/admin`
   - Create a new user account

2. **Enable 2FA**:
   - Login as the test user
   - Go to `/profile`
   - Enable 2FA
   - Check for notification email

3. **Test verification emails**:
   - Create another user account
   - Check for email verification

## Email Templates

The system sends these types of emails:

1. **Email Verification** (new user signup)
2. **Password Reset** (forgot password)
3. **2FA Enabled Notification** (when 2FA is activated)

All emails use professional HTML templates with JCL CMS branding.

## Monitoring

Check the server logs for email activity:

```bash
# In development
npm run dev

# Look for these log patterns:
# 📧 Sending verification email to: user@example.com
# ✅ Verification email sent successfully to: user@example.com
# ❌ Failed to send verification email to user@example.com: error message
```