import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins/admin'
import { betterAuthPlugin } from 'payload-auth'
import { Plugin } from 'payload'

export const plugins: Plugin[] = [
  betterAuthPlugin({
    disabled: false,
    disableDefaultPayloadAuth: true,
    hidePluginCollections: true,
    users: {
      allowedFields: ['name', 'role', 'emailVerified'],
      defaultRole: 'user',
      defaultAdminRole: 'admin',
      roles: ['business', 'hr', 'content', 'user', 'admin'],
    },
    accounts: {
      slug: 'userAccounts',
    },
    sessions: {
      slug: 'userSessions',
    },
    verifications: {
      slug: 'verifications',
    },

    betterAuthOptions: {
      emailVerification: {
        sendOnSignUp: true, // Enable email verification
        autoSignInAfterVerification: true,
      },
      appName: 'JCL CMS',
      baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
      trustedOrigins: [process.env.NEXT_PUBLIC_SERVER_URL!],
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Enable email verification
      },

      socialProviders: {
        // google: {
        //   clientId: process.env.GOOGLE_CLIENT_ID as string,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        // },
      },
      user: {
        additionalFields: {
          role: {
            type: 'string',
            defaultValue: 'user',
            input: false,
          },
        },
      },
      session: {
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60, // Cache duration in seconds
        },
      },
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ['google'],
        },
      },
      plugins: [admin(), nextCookies()],
    },
  }),
]
