# Two-Factor Authentication (2FA) Setup Guide

## Overview
This implementation adds comprehensive 2FA support to your JCL CMS with both TOTP (Time-based One-Time Password) and email-based OTP authentication.

## Features
- ✅ TOTP-based 2FA (Google Authenticator, Authy, etc.)
- ✅ Email-based OTP for login
- ✅ Backup codes for account recovery
- ✅ QR code generation for easy setup
- ✅ Secure token verification
- ✅ Admin interface integration

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

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

## Email Setup (Brevo SMTP)

Since you're already using Brevo SMTP, you just need to:

1. **Use your existing Brevo credentials** in the `.env` file
2. **Ensure SMTP is enabled** in your Brevo account
3. **Use the same credentials** you're already using for other emails

**Brevo SMTP Details:**
- **Host**: `smtp-relay.brevo.com`
- **Port**: `587` (or `465` for SSL)
- **Security**: `false` for port 587, `true` for port 465

## API Endpoints

### 1. Setup 2FA
```http
POST /api/2fa/setup
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
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

### 2. Verify 2FA Setup
```http
POST /api/2fa/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}
```

### 3. Send OTP for Login
```http
POST /api/2fa/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 4. Verify OTP
```http
POST /api/2fa/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### 5. Use Backup Code
```http
POST /api/2fa/backup-code
Content-Type: application/json

{
  "email": "user@example.com",
  "backupCode": "A1B2C3D4E5F6G7H8"
}
```

### 6. Disable 2FA
```http
POST /api/2fa/disable
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}
```

## User Flow

### Setting Up 2FA
1. User requests 2FA setup via `/api/2fa/setup`
2. System generates secret and QR code
3. User scans QR code with authenticator app
4. User enters token from app to verify setup
5. System enables 2FA and generates backup codes

### Logging In with 2FA
1. User enters email/password
2. If 2FA is enabled, system sends OTP via email
3. User enters OTP or uses backup code
4. System verifies and grants access

## Database Schema Changes

The Users collection now includes these new fields:
- `twoFactorEnabled`: Boolean flag for 2FA status
- `twoFactorSecret`: TOTP secret key
- `twoFactorBackupCodes`: Array of backup codes
- `twoFactorVerified`: Whether 2FA has been verified
- `otpCode`: Temporary OTP for email verification
- `otpExpiresAt`: OTP expiration timestamp

## Security Features

- **TOTP Verification**: Uses speakeasy library with 2-time-step tolerance
- **OTP Expiration**: 10-minute expiry for email OTPs
- **Backup Codes**: 10 unique 16-character codes for recovery
- **Secure Storage**: Secrets and codes are stored securely in database
- **Access Control**: Sensitive fields are read-only in admin interface

## Testing

1. **Setup 2FA**:
   ```bash
   curl -X POST http://localhost:3000/api/2fa/setup \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com"}'
   ```

2. **Send OTP**:
   ```bash
   curl -X POST http://localhost:3000/api/2fa/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com"}'
   ```

## Troubleshooting

### Email Not Sending
- Check Brevo SMTP credentials
- Verify SMTP is enabled in Brevo account
- Check if you're using the correct port (587 or 465)
- Ensure your Brevo account has sending permissions

### QR Code Not Working
- Ensure authenticator app supports TOTP
- Try manual entry with the secret key
- Check if QR code is properly generated

### OTP Expired
- Request new OTP via `/api/2fa/send-otp`
- OTPs expire after 10 minutes

### Backup Codes Not Working
- Each backup code can only be used once
- Generate new backup codes if all are used
- Check code format (16 characters, uppercase letters and numbers)

## 🚀 **Ready to Test!**

Since you already have Brevo SMTP configured, your 2FA system should work immediately! Just:

1. **Add your Brevo credentials** to `.env` file
2. **Restart your application** (`npm run dev`)
3. **Test the 2FA setup** with a user account

Your existing Brevo setup will handle all the 2FA emails automatically! 📧✨
