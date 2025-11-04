# 🚀 2FA Quick Start Guide

## ✅ What's Already Implemented

Your JCL CMS now has a complete 2FA system with:
- ✅ TOTP-based 2FA (Google Authenticator, Authy)
- ✅ Email-based OTP for login
- ✅ Backup codes for recovery
- ✅ QR code generation
- ✅ Secure API endpoints
- ✅ Database schema updates

## 🔧 Step 1: Configure Email Settings

Create a `.env` file in your project root:

```env
# Database Configuration
DATABASE_URI=postgresql://username:password@localhost:5432/jclcms

# Payload CMS Configuration
PAYLOAD_SECRET=your-super-secret-key-here

# Email Configuration for 2FA (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email@domain.com
SMTP_PASSWORD=your-brevo-smtp-password

# Node Options
NODE_OPTIONS=--no-deprecation --no-experimental-strip-types
```

## 📧 Step 2: Brevo SMTP Setup

Since you're already using Brevo SMTP, you just need to:

1. **Use your existing Brevo credentials** in the `.env` file
2. **Ensure SMTP is enabled** in your Brevo account
3. **Use the same credentials** you're already using for other emails

**Brevo SMTP Details:**
- **Host**: `smtp-relay.brevo.com`
- **Port**: `587` (or `465` for SSL)
- **Security**: `false` for port 587, `true` for port 465

## 👤 Step 3: Create a User

1. Start your application: `npm run dev`
2. Go to http://localhost:3000/admin
3. Create your first user or use an existing one
4. Note the user's email address

## 🔐 Step 4: Enable 2FA for a User

### Option A: Using the Admin Panel
1. Go to Users collection in admin panel
2. Edit the user you want to enable 2FA for
3. Check the "Two-Factor Authentication Enabled" checkbox
4. Save the user

### Option B: Using API (Recommended)
```bash
# Setup 2FA
curl -X POST http://localhost:3000/api/2fa/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "your-user@example.com"}'
```

This will return:
```json
{
  "success": true,
  "message": "2FA setup initiated",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP"
  }
}
```

## 📱 Step 5: Setup Authenticator App

1. **Scan QR Code**: Use the QR code from the API response
2. **Manual Entry**: Or enter the manual key in your authenticator app
3. **Get Token**: Generate a 6-digit token from your app

## ✅ Step 6: Verify 2FA Setup

```bash
# Verify with token from authenticator app
curl -X POST http://localhost:3000/api/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-user@example.com",
    "token": "123456"
  }'
```

This will return backup codes - **SAVE THESE SECURELY!**

## 🔄 Step 7: Test Login Flow

### Normal Login (2FA Required)
```bash
# Send OTP
curl -X POST http://localhost:3000/api/2fa/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-user@example.com"}'
```

### Verify OTP
```bash
# Verify OTP from email
curl -X POST http://localhost:3000/api/2fa/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-user@example.com",
    "otp": "123456"
  }'
```

### Use Backup Code (if needed)
```bash
# Use backup code
curl -X POST http://localhost:3000/api/2fa/backup-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-user@example.com",
    "backupCode": "A1B2C3D4E5F6G7H8"
  }'
```

## 🎯 Complete User Flow

### For New Users:
1. **Create Account** → Admin panel or API
2. **Setup 2FA** → `/api/2fa/setup`
3. **Scan QR Code** → Authenticator app
4. **Verify Setup** → `/api/2fa/verify`
5. **Save Backup Codes** → Store securely

### For Login:
1. **Enter Email/Password** → Normal login
2. **System Checks 2FA** → If enabled, sends OTP
3. **Enter OTP** → From email or authenticator
4. **Access Granted** → Login successful

## 🔧 Troubleshooting

### Email Not Sending
- ✅ Check Brevo SMTP credentials in `.env`
- ✅ Verify SMTP is enabled in Brevo account
- ✅ Check if you're using the correct port (587 or 465)
- ✅ Ensure your Brevo account has sending permissions

### QR Code Not Working
- ✅ Try manual entry with secret key
- ✅ Ensure authenticator app supports TOTP
- ✅ Check if QR code is properly generated

### OTP Expired
- ✅ Request new OTP via `/api/2fa/send-otp`
- ✅ OTPs expire after 10 minutes

### Backup Codes Not Working
- ✅ Each code can only be used once
- ✅ Check format (16 characters, uppercase)
- ✅ Generate new codes if all used

## 🛡️ Security Features

- **TOTP Verification**: 2-time-step tolerance (60 seconds)
- **OTP Expiration**: 10-minute expiry for email OTPs
- **Backup Codes**: 10 unique 16-character codes
- **Secure Storage**: All secrets stored securely
- **Access Control**: Sensitive fields read-only in admin

## 📚 API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/2fa/setup` | POST | Initialize 2FA setup |
| `/api/2fa/verify` | POST | Verify TOTP and enable 2FA |
| `/api/2fa/send-otp` | POST | Send email OTP |
| `/api/2fa/verify-otp` | POST | Verify email OTP |
| `/api/2fa/backup-code` | POST | Use backup code |
| `/api/2fa/disable` | POST | Disable 2FA |
| `/api/auth/login` | POST | Custom login with 2FA |

## 🎉 You're All Set!

Your JCL CMS now has enterprise-grade 2FA protection! Users can:
- ✅ Use authenticator apps (Google Authenticator, Authy)
- ✅ Receive email OTPs via Brevo SMTP
- ✅ Use backup codes for recovery
- ✅ Manage 2FA settings securely

The system is production-ready and follows security best practices! 🛡️

## 🚀 **Ready to Test!**

Since you already have Brevo SMTP configured, your 2FA system should work immediately! Just:

1. **Add your Brevo credentials** to `.env` file
2. **Restart your application** (`npm run dev`)
3. **Test the 2FA setup** with a user account

Your existing Brevo setup will handle all the 2FA emails automatically! 📧✨
