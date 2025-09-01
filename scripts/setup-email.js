#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 JCL CMS Email Setup Script')
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

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8')

// Generate BETTER_AUTH_SECRET if not present
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

// Check for required SMTP variables
const requiredSmtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']
const missingSmtpVars = []

requiredSmtpVars.forEach((varName) => {
  if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your-`)) {
    missingSmtpVars.push(varName)
  }
})

if (missingSmtpVars.length > 0) {
  console.log('\n⚠️  MISSING REQUIRED SMTP CONFIGURATION:')
  missingSmtpVars.forEach((varName) => {
    console.log(`   - ${varName}`)
  })

  console.log('\n📧 Please configure your SMTP settings in the .env file:')
  console.log('\n   # Gmail Example:')
  console.log('   SMTP_HOST=smtp.gmail.com')
  console.log('   SMTP_PORT=587')
  console.log('   SMTP_SECURE=false')
  console.log('   SMTP_USER=your-email@gmail.com')
  console.log('   SMTP_PASSWORD=your-app-password')
  console.log('   SMTP_FROM=your-email@gmail.com')

  console.log('\n   # For Gmail, you need to:')
  console.log('   1. Enable 2-factor authentication')
  console.log('   2. Generate an App Password')
  console.log('   3. Use the App Password instead of your regular password')

  console.log('\n   # Outlook/Hotmail Example:')
  console.log('   SMTP_HOST=smtp-mail.outlook.com')
  console.log('   SMTP_PORT=587')
  console.log('   SMTP_SECURE=false')
  console.log('   SMTP_USER=your-email@outlook.com')
  console.log('   SMTP_PASSWORD=your-password')
  console.log('   SMTP_FROM=your-email@outlook.com')
} else {
  console.log('\n✅ All required SMTP variables are configured!')
}

// Write updated .env file
fs.writeFileSync(envPath, envContent)

console.log('\n✅ Environment configuration updated!')
console.log('\n📋 Next steps:')
console.log('1. Fill in your SMTP credentials in the .env file')
console.log('2. Start the development server: npm run dev')
console.log('3. Test email functionality:')
console.log('   curl -X POST http://localhost:3000/api/test-email \\')
console.log('     -H "Content-Type: application/json" \\')
console.log('     -d \'{"to": "your-email@example.com"}\'')
console.log('\n📚 For more help, see docs/EMAIL_TESTING.md')
console.log('\n🚀 Happy coding!')
