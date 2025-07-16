import { isContent } from '@/access/isContent'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import type { CollectionConfig } from 'payload'

export const InstaPosts: CollectionConfig = {
  slug: 'instaposts',
  access: {
    read: isContent,
    create: isContent,
    update: isSuperAdminandAdmin,
    delete: isSuperAdminandAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Name is required'
        }
        return true
      },
    },
    {
      name: 'postLink',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Post link is required'
        }
        return true
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        if (data.name) {
          data.name = data.name.trim()
        }
        if (data.postLink) {
          data.postLink = data.postLink.trim()
        }
        return data
      },
    ],
  },
}
