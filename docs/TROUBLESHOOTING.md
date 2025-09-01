# 2FA Troubleshooting Guide

## Common Issues and Solutions

### 1. Duplicate Field Error

**Error**: `DuplicateFieldName: A field with the name 'emailVerified' was found multiple times`

**Solution**: This happens when fields are defined in both the Users collection and Better Auth plugin.

```bash
# The fix has been applied - all user fields are now managed by Better Auth plugin
# If you still see this error, check that src/collections/Users.ts has no field definitions
```

### 2. Server Won't Start

**Error**: Configuration or import errors

**Solutions**:
1. Run the setup script: `npm run setup:2fa`
2. Check your `.env` file has required variables
3. Ensure database connection is working

### 3. Email Not Sending

**Error**: Email verification/reset emails not being sent

**Solutions**:
1. Check SMTP configuration in `.env`:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```
2. For Gmail, use App Passwords instead of regular password
3. Check firewall/network settings

### 4. 2FA QR Code Not Working

**Error**: QR code won't scan or generate

**Solutions**:
1. Check that `NEXT_PUBLIC_SERVER_URL` is set correctly
2. Ensure `BETTER_AUTH_SECRET` is configured
3. Try manual entry with the secret key
4. Check browser console for JavaScript errors

### 5. Authentication Errors

**Error**: Login fails or 2FA verification fails

**Solutions**:
1. Check database connection
2. Verify Better Auth plugin configuration
3. Ensure secrets are properly set
4. Check browser network tab for API errors

### 6. Database Connection Issues

**Error**: Cannot connect to PostgreSQL

**Solutions**:
1. Verify `DATABASE_URI` format:
   ```bash
   DATABASE_URI=postgresql://username:password@localhost:5432/database_name
   ```
2. Ensure PostgreSQL is running
3. Check database credentials
4. Verify database exists

### 7. TypeScript Errors

**Error**: Type mismatches or import errors

**Solutions**:
1. Run type generation: `npm run generate:types`
2. Restart TypeScript server in your IDE
3. Check import paths are correct

## Environment Variables Checklist

Required variables for 2FA to work:

```bash
# Core Configuration
DATABASE_URI=postgresql://username:password@localhost:5432/jcl_cms
PAYLOAD_SECRET=your-payload-secret
BETTER_AUTH_SECRET=your-better-auth-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# SMTP Configuration (for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## Quick Setup Commands

```bash
# 1. Run setup script
npm run setup:2fa

# 2. Install dependencies (if needed)
npm install

# 3. Generate types
npm run generate:types

# 4. Start development server
npm run dev

# 5. Create first admin user
# Visit: http://localhost:3000/admin

# 6. Enable 2FA
# Visit: http://localhost:3000/profile
```

## Testing 2FA Setup

1. **Create Test User**:
   - Go to `/admin`
   - Create a new user account
   - Check email for verification link

2. **Enable 2FA**:
   - Login to user account
   - Go to `/profile`
   - Click "Enable Two-Factor Authentication"
   - Scan QR code with authenticator app
   - Verify with 6-digit code
   - Download backup codes

3. **Test Login with 2FA**:
   - Logout
   - Login with email/password
   - Enter 2FA code when prompted
   - Should successfully login

## Debug Mode

Enable debug logging by adding to your `.env`:

```bash
DEBUG=better-auth:*
NODE_ENV=development
```

## Getting Help

If you're still having issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a fresh database
4. Review the 2FA setup documentation: `docs/2FA_SETUP.md`
5. Check that all required packages are installed

## Common SMTP Providers

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
# Use App Password, not regular password
```

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```