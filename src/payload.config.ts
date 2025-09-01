import { importExportPlugin } from '@payloadcms/plugin-import-export'
// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import nodemailer from 'nodemailer'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CareerForms } from './collections/CareerForms'
import { ContactForms } from './collections/ContactForm'
import { Works } from './collections/Work'
import { InstaPosts } from './collections/InstaPosts'
import { Showreel } from './collections/Showreel'
import { plugins } from './plugins'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
// import { initCronJobs } from './cron'
// import { cleanupOldEntries } from './jobs/cleanupOldEntries'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL:
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'http://localhost:3000',
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
  },
  // Email configuration using Payload's nodemailer adapter
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM || 'noreply@jclcms.com',
    defaultFromName: 'JCL CMS',
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
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
    ...plugins,
    payloadCloudPlugin(),
    importExportPlugin({
      collections: ['contactforms', 'careerforms'],
      format: 'csv',
    }),
    // storage-adapter-placeholder
  ],
  // onInit: async () => {
  //   console.log('Payload CMS initialized, setting up cron jobs...')
  //   try {
  //     initCronJobs()
  //     console.log('Cron jobs initialized successfully')
  //   } catch (error) {
  //     console.error('Failed to initialize cron jobs:', error)
  //   }
  // },
})
