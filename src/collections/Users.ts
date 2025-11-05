import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import UserRoles from '@/utils/RoleTypes'
import { ValidationError, type CollectionConfig } from 'payload'
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/
const REQUIRED_EMAIL_DOMAIN = 'boideas.com'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: isSuperAdmin,
    update: isSuperAdminandAdmin,
    read: isAdminOrSelf,
    delete: isSuperAdmin,
  },
  auth: true,
  hooks: {
    // beforeValidate: [
    //   async ({ data }) => {
    //     const pwd = data?.password
    //     if (!pwd) return

    //     const res = zxcvbn(pwd)
    //     console.log(res, 'res')
    //     if (res.score < 3) {
    //       // ✳️ Use Payload's ValidationError for proper UI message
    //       throw new ValidationError({
    //         errors: [
    //           {
    //             message:
    //               'Password too weak — ' +
    //               (res.feedback.warning || 'please choose a stronger password'),
    //             path: 'password',
    //           },
    //         ],
    //       })
    //     }
    //   },
    // ],
    beforeValidate: [
      async ({ data, operation }) => {
        // Validate email domain (backup validation in hooks)
        if (data?.email) {
          const email = data.email.toString().trim().toLowerCase()
          const emailParts = email.split('@')

          if (emailParts.length !== 2 || emailParts[1] !== REQUIRED_EMAIL_DOMAIN) {
            throw new ValidationError({
              errors: [
                {
                  message: `Email must be from the ${REQUIRED_EMAIL_DOMAIN} domain.`,
                  path: 'email',
                },
              ],
            })
          }
        }

        // Validate password
        const pwd = data?.password
        if (pwd) {
          if (!passwordRegex.test(pwd)) {
            throw new ValidationError({
              errors: [
                {
                  message:
                    'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.',
                  path: 'password',
                },
              ],
            })
          }
        }
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Validate email domain on update (only if email is being changed)
        if (data?.email && operation === 'update') {
          const newEmail = data.email.toString().trim().toLowerCase()
          const existingEmail = originalDoc?.email?.toString().trim().toLowerCase()

          // Only validate if email is actually being changed
          if (newEmail !== existingEmail) {
            const emailParts = newEmail.split('@')

            if (emailParts.length !== 2 || emailParts[1] !== REQUIRED_EMAIL_DOMAIN) {
              throw new ValidationError({
                errors: [
                  {
                    message: `Email must be from the ${REQUIRED_EMAIL_DOMAIN} domain.`,
                    path: 'email',
                  },
                ],
              })
            }
          }
        } else if (data?.email && operation === 'create') {
          // Validate email domain on create
          const email = data.email.toString().trim().toLowerCase()
          const emailParts = email.split('@')

          if (emailParts.length !== 2 || emailParts[1] !== REQUIRED_EMAIL_DOMAIN) {
            throw new ValidationError({
              errors: [
                {
                  message: `Email must be from the ${REQUIRED_EMAIL_DOMAIN} domain.`,
                  path: 'email',
                },
              ],
            })
          }
        }
      },
    ],
  },
  fields: [
    // Override email field to add domain validation
    {
      name: 'email',
      type: 'email',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string') {
          return 'Email is required'
        }
        const email = value.trim().toLowerCase()
        const emailParts = email.split('@')

        if (emailParts.length !== 2) {
          return 'Invalid email format'
        }

        if (emailParts[1] !== REQUIRED_EMAIL_DOMAIN) {
          return `Email must be from the ${REQUIRED_EMAIL_DOMAIN} domain.`
        }

        return true
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'SuperAdmin', value: UserRoles.SUPER_ADMIN },
        { label: 'Admin', value: UserRoles.ADMIN },
        { label: 'Businness', value: UserRoles.BUSINESS },
        { label: 'HR', value: UserRoles.HR },
        { label: 'Content', value: UserRoles.CONTENT },
        { label: 'User', value: UserRoles.USER },
      ],
      defaultValue: 'user',
      access: {
        create: ({ req: { user } }) => {
          // Only allow superAdmin to create users with roles other than 'user'
          return user?.role === UserRoles.SUPER_ADMIN
        },
        update: ({ req: { user } }) => {
          // Only allow superAdmin to update roles
          return user?.role === UserRoles.SUPER_ADMIN
        },
        // All read access to super admin and admin and the self can see itself
        read: ({ req: { user, user: reqUser } }) => {
          // Allow super admin, admin, or the user themselves to read the role field
          return (
            user?.role === UserRoles.SUPER_ADMIN ||
            user?.role === UserRoles.ADMIN ||
            (reqUser && user && reqUser.id === user.id) ||
            false
          )
        },
      },
    },
    // 2FA Fields
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      label: 'Two-Factor Authentication Enabled',
      defaultValue: true,
      access: {
        create: () => false,
        update: () => false,
        read: () => false,
      },
      admin: {
        description: 'Enable two-factor authentication for this user',
        hidden: true,
      },
    },
    {
      name: 'twoFactorSecret',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Secret key for 2FA (auto-generated)',
        hidden: true,
      },
      access: {
        read: () => false,
        update: () => false, // No one can update this directly
        create: () => false,
      },
    },
    {
      name: 'twoFactorBackupCodes',
      type: 'array',
      admin: {
        description: 'Backup codes for 2FA recovery',
        readOnly: true,
        hidden: true,
      },
      fields: [
        {
          name: 'code',
          type: 'text',
        },
        {
          name: 'used',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      access: {
        read: () => false,
        update: () => false, // No one can update this directly
        create: () => false,
      },
    },
    {
      name: 'twoFactorVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether 2FA has been verified',
        readOnly: true,
        hidden: true,
      },
      access: {
        read: () => false,
        update: () => false,
        create: () => false,
      },
    },
    {
      name: 'otpCode',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Temporary OTP code for login',
        hidden: true,
      },
      access: {
        read: () => false,
        update: () => false, // No one can update this directly
        create: () => false,
      },
    },
    {
      name: 'otpExpiresAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'OTP expiration time',
        hidden: true,
      },
      access: {
        read: () => false,
        update: () => false, // No one can update this directly
        create: () => false,
      },
    },
    {
      name: 'pendingLoginToken',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Temporarily holds JWT after password validation until OTP is verified',
        hidden: true,
      },
      access: {
        read: () => false,
        update: () => false,
        create: () => false,
      },
    },
  ],
}
