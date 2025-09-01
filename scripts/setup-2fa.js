#!/usr/bin/env node

/**
 * Setup script for 2FA configuration
 * This script helps configure the required environment variables for 2FA
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🔐 JCL CMS 2FA Setup Script')
console.log('============================\n')

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ .env file created from .env.example\n')
  } else {
    console.log('❌ No .env.example file found. Please create a .env file manually.\n')
    process.exit(1)
  }
}

// Generate BETTER_AUTH_SECRET if not present
let envContent = fs.readFileSync(envPath, 'utf8')

if (
  !envContent.includes('BETTER_AUTH_SECRET=') ||
  envContent.includes('BETTER_AUTH_SECRET=YOUR_BETTER_AUTH_SECRET_HERE')
) {
  const betterAuthSecret = crypto.randomBytes(32).toString('hex')

  if (envContent.includes('BETTER_AUTH_SECRET=YOUR_BETTER_AUTH_SECRET_HERE')) {
    envContent = envContent.replace(
      'BETTER_AUTH_SECRET=YOUR_BETTER_AUTH_SECRET_HERE',
      `BETTER_AUTH_SECRET=${betterAuthSecret}`,
    )
  } else {
    envContent += `\nBETTER_AUTH_SECRET=${betterAuthSecret}\n`
  }

  console.log('🔑 Generated BETTER_AUTH_SECRET')
}

// Generate PAYLOAD_SECRET if not present or is placeholder
if (
  !envContent.includes('PAYLOAD_SECRET=') ||
  envContent.includes('PAYLOAD_SECRET=YOUR_SECRET_HERE')
) {
  const payloadSecret = crypto.randomBytes(32).toString('hex')

  if (envContent.includes('PAYLOAD_SECRET=YOUR_SECRET_HERE')) {
    envContent = envContent.replace(
      'PAYLOAD_SECRET=YOUR_SECRET_HERE',
      `PAYLOAD_SECRET=${payloadSecret}`,
    )
  } else {
    envContent += `\nPAYLOAD_SECRET=${payloadSecret}\n`
  }

  console.log('🔑 Generated PAYLOAD_SECRET')
}

// Set default NEXT_PUBLIC_SERVER_URL if not present
if (!envContent.includes('NEXT_PUBLIC_SERVER_URL=')) {
  envContent += `\nNEXT_PUBLIC_SERVER_URL=http://localhost:3000\n`
  console.log('🌐 Set default NEXT_PUBLIC_SERVER_URL')
}

// Write updated .env file
fs.writeFileSync(envPath, envContent)

console.log('\n✅ Environment configuration updated!')
console.log('\n📝 Next Steps:')
console.log('1. Configure your database connection (DATABASE_URI)')
console.log('2. Set up SMTP settings for email verification:')
console.log('   - SMTP_HOST (e.g., smtp.gmail.com)')
console.log('   - SMTP_PORT (e.g., 587)')
console.log('   - SMTP_USER (your email)')
console.log('   - SMTP_PASSWORD (your app password)')
console.log('   - SMTP_FROM (sender email)')
console.log('3. Run: npm run dev')
console.log('4. Visit: http://localhost:3000/admin to create your first user')
console.log('5. Enable 2FA from your profile page: http://localhost:3000/profile')

console.log('\n🔒 2FA Features Available:')
console.log('- Email verification for new accounts')
console.log('- Google Authenticator / TOTP support')
console.log('- Backup codes for account recovery')
console.log('- Role-based access control')

console.log('\n📚 Documentation: docs/2FA_SETUP.md')
console.log('🎉 Setup complete! Happy coding!')
