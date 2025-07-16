import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import UserRoles from '@/utils/RoleTypes'
import type { CollectionConfig } from 'payload'

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
  fields: [
    // Email added by default
    // Add more fields as needed
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
  ],
}
