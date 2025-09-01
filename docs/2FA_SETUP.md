# Two-Factor Authentication (2FA) Setup Guide

This guide explains how to configure and use the Two-Factor Authentication system in JCL CMS.

## Overview

The 2FA system provides enhanced security through:
- **Email Verification**: Required for new user accounts
- **TOTP (Time-based One-Time Password)**: Using Google Authenticator, Authy, or similar apps
- **Backup Codes**: For account recovery when authenticator is unavailable
- **Role-based Access**: Different 2FA requirements based on user roles

## Environment Configuration

### Required Environment Variables

Add these variables to your `.env` file:

```bash
# Better Auth Secret (required)
BETTER_AUTH_SECRET=your-secret-key-here

# Server URL (required)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# SMTP Configuration (required for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### SMTP Setup Examples

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### Custom SMTP
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
```

## Features

### 1. Email Verification
- **Automatic**: Sent when users sign up
- **Required**: Users must verify email before full access
- **Expiration**: Verification links expire in 24 hours
- **Resend**: Users can request new verification emails

### 2. TOTP Authentication
- **Setup**: QR code generation for authenticator apps
- **Verification**: 6-digit codes with 30-second validity
- **Apps Supported**: Google Authenticator, Authy, Microsoft Authenticator, etc.
- **Backup Codes**: 8 single-use recovery codes generated during setup

### 3. User Management
- **Role-based Access**: Different 2FA requirements per role
- **Admin Controls**: Admins can view 2FA status (not secrets)
- **Self-service**: Users can enable/disable their own 2FA
- **Security Notifications**: Email alerts when 2FA is enabled/disabled

## User Workflow

### Enabling 2FA

1. **Access Profile**: Navigate to `/profile` or account settings
2. **Enable 2FA**: Click "Enable Two-Factor Authentication"
3. **Scan QR Code**: Use authenticator app to scan the displayed QR code
4. **Verify Setup**: Enter a 6-digit code from your app
5. **Save Backup Codes**: Download and securely store backup codes
6. **Confirmation**: 2FA is now active on your account

### Using 2FA

1. **Login**: Enter email and password as usual
2. **2FA Prompt**: System requests authenticator code
3. **Enter Code**: Provide 6-digit code from your app
4. **Alternative**: Use backup code if authenticator unavailable
5. **Access Granted**: Successfully logged in with 2FA

### Disabling 2FA

1. **Profile Settings**: Go to your profile page
2. **Disable 2FA**: Click "Disable 2FA" button
3. **Confirmation**: Confirm you want to disable 2FA
4. **Security Reduced**: Account returns to password-only authentication

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/forgot-password` - Request password reset

### 2FA Management
- `POST /api/auth/2fa/enable` - Enable 2FA for user
- `POST /api/auth/2fa/disable` - Disable 2FA for user
- `POST /api/auth/2fa/verify` - Verify TOTP code
- `POST /api/auth/2fa/backup-code` - Use backup code

### Email Verification
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email

## Components

### React Components
- `TwoFactorSetup` - 2FA enrollment wizard
- `TwoFactorManager` - 2FA management dashboard
- `TwoFactorVerification` - Login 2FA verification
- `LoginForm` - Enhanced login with 2FA support

### Hooks
- `useAuth` - Authentication state and methods
- `useSession` - Session management

## Security Features

### Password Security
- **Hashing**: Passwords hashed with Better Auth
- **Reset**: Secure password reset via email
- **Validation**: Strong password requirements

### 2FA Security
- **Secret Protection**: TOTP secrets encrypted in database
- **Backup Codes**: Single-use, securely generated
- **Rate Limiting**: Protection against brute force attacks
- **Session Management**: Secure session handling

### Email Security
- **Templates**: Professional HTML email templates
- **Expiration**: Time-limited verification links
- **Validation**: Email format and domain validation

## Database Schema

### User Fields Added
```typescript
{
  twoFactorEnabled: boolean,      // 2FA status
  twoFactorSecret: string,        // Encrypted TOTP secret
  twoFactorBackupCodes: string,   // Encrypted backup codes JSON
  emailVerified: boolean,         // Email verification status
  emailVerificationToken: string, // Verification token
  emailVerificationExpires: Date  // Token expiration
}
```

## Troubleshooting

### Common Issues

#### Email Not Sending
- Check SMTP credentials
- Verify SMTP_HOST and SMTP_PORT
- Ensure firewall allows SMTP traffic
- Check spam/junk folders

#### 2FA Code Invalid
- Verify device time synchronization
- Check authenticator app setup
- Try backup codes if available
- Ensure 6-digit code entry

#### QR Code Not Scanning
- Increase screen brightness
- Try manual entry with secret key
- Use different authenticator app
- Check camera permissions

### Error Messages

#### "Email service not configured"
- SMTP environment variables missing
- Check `.env` file configuration

#### "Invalid verification code"
- Code expired (30-second window)
- Device time synchronization issue
- Wrong authenticator app

#### "Backup code already used"
- Each backup code is single-use
- Generate new backup codes

## Best Practices

### For Users
1. **Backup Codes**: Store in secure, offline location
2. **Multiple Devices**: Set up authenticator on multiple devices
3. **Regular Updates**: Keep authenticator apps updated
4. **Secure Email**: Use secure email provider

### For Administrators
1. **Enforce 2FA**: Require for admin/sensitive roles
2. **Monitor Usage**: Track 2FA adoption rates
3. **Regular Audits**: Review user security settings
4. **Backup Plans**: Ensure account recovery procedures

### For Developers
1. **Environment Security**: Protect SMTP credentials
2. **Rate Limiting**: Implement on authentication endpoints
3. **Logging**: Monitor authentication attempts
4. **Updates**: Keep Better Auth plugin updated

## Migration Guide

### Existing Users
1. Users will be prompted to verify email on next login
2. 2FA is optional by default
3. Admins can enforce 2FA for specific roles
4. Existing sessions remain valid during transition

### Database Migration
The system automatically adds required fields to the users collection. No manual migration needed.

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Verify environment configuration
4. Test with different email providers
5. Contact development team

## Security Considerations

- Never store TOTP secrets in plain text
- Regularly rotate backup codes
- Monitor failed authentication attempts
- Use HTTPS in production
- Implement proper session management
- Regular security audits recommended