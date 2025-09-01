import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: isSuperAdmin,
    update: isAdminOrSelf,
    read: isAdminOrSelf,
    delete: isSuperAdmin,
  },
  auth: true,
  fields: [
    // All user fields (email, emailVerified, firstName, lastName, role, 2FA fields)
    // are provided by Better Auth plugin configuration in plugins/index.ts
    // This collection only defines access controls and hooks
  ],
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`New user created: ${doc.email}`)
          // User fields are managed by Better Auth plugin
        }
      },
    ],
  },
}
