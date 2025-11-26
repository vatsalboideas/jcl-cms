import { importExportPlugin } from '@payloadcms/plugin-import-export'
// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'
import { logger } from '@/utils/logger'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CareerForms } from './collections/CareerForms'
import { ContactForms } from './collections/ContactForm'
import { Works } from './collections/Work'
import { InstaPosts } from './collections/InstaPosts'
import { Showreel } from './collections/Showreel'
// import { initCronJobs } from './cron'
// import { cleanupOldEntries } from './jobs/cleanupOldEntries'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Centralize SMTP configuration
const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com'
const smtpPort = parseInt(process.env.SMTP_PORT || '587')
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASSWORD
const smtpFrom = process.env.SMTP_FROM || smtpUser || ''

// Server URL for generating absolute URLs (password reset, email verification, etc.)
const serverURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'

export default buildConfig({
  serverURL,
  // jobs: {
  //   tasks: [
  //     {

  //     }
  //   ],
  //   autoRun: [
  //     {
  //       cron: '55 16 * * *', // Run at 4:55 PM every day (16:55)
  //     },
  //   ],
  // },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    routes: {
      login: '/auth/login',
    },
    components: {
      views: {
        login: {
          Component: './views/Login',
          path: '/auth/login',
        },
        resetPassword: {
          Component: './views/Login/ResetPassword',
          path: '/auth/reset-password',
        },
      },
    },
    // components: {
    //   views: {
    //     login: {
    //       Component: '',
    //       path: '',
    //     },
    //   },
    // },
  },
  email: nodemailerAdapter({
    defaultFromAddress: smtpFrom,
    defaultFromName: 'JCL CMS',
    // Brevo SMTP Configuration
    transport: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    }),
  }),
  collections: [Users, Media, CareerForms, ContactForms, Works, InstaPosts, Showreel],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  cors: ['*'],
  plugins: [
    payloadCloudPlugin(),
    importExportPlugin({
      collections: ['contactforms', 'careerforms'],
      format: 'csv',
    }),
    // storage-adapter-placeholder
  ],
  onInit: async () => {
    // Proactive SMTP verification for clearer startup diagnostics
    try {
      if (!smtpUser || !smtpPass) {
        logger.warn('[Email] SMTP_USER/SMTP_PASSWORD not set. Emails will fail until configured.')
      }
      if (!smtpFrom) {
        logger.warn(
          '[Email] No SMTP_FROM provided. Using SMTP_USER as from address. Ensure it is a verified sender.',
        )
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      })

      await transporter.verify()
      logger.log(`[Email] SMTP verified: host=${smtpHost} port=${smtpPort} secure=${smtpSecure}`)
    } catch (err) {
      logger.error('[Email] SMTP verification failed:', err)
    }
  },
})
