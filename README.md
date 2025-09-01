# JCL CMS - Content Management System

A modern, feature-rich content management system built with Payload CMS, Next.js, and Better Auth. Features include user management, role-based access control, two-factor authentication, and comprehensive email functionality.

## ✨ Features

- **User Management**: Multi-role user system (SuperAdmin, Admin, Business, HR, Content, User)
- **Authentication**: Secure login with Better Auth integration
- **Two-Factor Authentication**: TOTP-based 2FA with backup codes
- **Email System**: Comprehensive email functionality for all user operations
- **Role-Based Access Control**: Granular permissions for different user roles
- **Media Management**: Advanced file upload and management
- **Content Collections**: Career forms, contact forms, work portfolios, and more

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd jcl-cms && cp .env.example .env` to copy the example environment variables
3. Run the setup scripts to configure the system:
   ```bash
   npm run setup:email    # Configure email and generate secrets
   npm run setup:2fa      # Setup 2FA configuration
   ```
4. Configure your SMTP settings in the `.env` file (see [Email Setup Guide](docs/EMAIL_SETUP.md))
5. `pnpm install && pnpm dev` to install dependencies and start the dev server
6. Open `http://localhost:3000` to open the app in your browser
7. Visit `http://localhost:3000/admin` to create your first admin user

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URI` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URI` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## 🚀 Quick Setup Commands

```bash
# Install dependencies
pnpm install

# Setup email configuration and generate secrets
npm run setup:email

# Setup 2FA configuration
npm run setup:2fa

# Start development server
pnpm dev

# Generate TypeScript types
pnpm run generate:types

# Build for production
pnpm run build
```

## 📧 Email Configuration

The email system is **required** for user operations. See the [Email Setup Guide](docs/EMAIL_SETUP.md) for detailed configuration instructions.

**Quick email setup:**
```bash
npm run setup:email
```

## 🔐 Two-Factor Authentication

2FA provides enhanced security for user accounts. See the [2FA Setup Guide](docs/2FA_SETUP.md) for configuration details.

**Quick 2FA setup:**
```bash
npm run setup:2fa
```

## 🧪 Testing

Test the email functionality step by step:

### 1. Check Environment Configuration
```bash
curl http://localhost:3000/api/env-check
```

### 2. Test Basic Email (Recommended First)
```bash
curl -X POST http://localhost:3000/api/simple-email-test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### 3. Test Other Email Endpoints
```bash
# Test basic email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'

# Test admin invite
curl -X POST http://localhost:3000/api/test-admin-invite \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test users invite (with sample data)
curl -X POST http://localhost:3000/api/test-users-invite \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test users send-invite (inviteUrl is optional)
curl -X POST http://localhost:3000/api/users/send-invite \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test invite link generation
curl -X POST http://localhost:3000/api/test-invite-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "role": "admin"}'
```

**Note**: Start with `/api/simple-email-test` as it has no complex dependencies and will help identify basic SMTP issues. The `/api/users/send-invite` endpoint now auto-generates invite URLs if none are provided.

### 4. Test the Complete Invite Flow
```bash
# 1. Generate a test invite link
curl -X POST http://localhost:3000/api/test-invite-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "role": "admin"}'

# 2. Copy the inviteUrl from the response and paste it in your browser
# 3. Fill out the profile creation form
# 4. You should be redirected to the admin panel
```

## 📚 Documentation

- [Email Setup Guide](docs/EMAIL_SETUP.md) - Configure email functionality
- [2FA Setup Guide](docs/2FA_SETUP.md) - Setup two-factor authentication
- [Email Testing Guide](docs/EMAIL_TESTING.md) - Test email functionality
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🏗️ Architecture

### Collections

- **Users**: Multi-role user management with Better Auth integration
- **Media**: File upload and management with image optimization
- **CareerForms**: Job application management
- **ContactForms**: Contact form submissions
- **Works**: Portfolio and work showcase
- **InstaPosts**: Social media integration
- **Showreel**: Video and media showcase

### Authentication

- **Better Auth**: Modern authentication with email/password and social providers
- **Role-Based Access Control**: Granular permissions for different user types
- **Two-Factor Authentication**: TOTP-based security with backup codes
- **Session Management**: Secure session handling with cookies

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
