import { isContent } from '@/access/isContent'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import type { CollectionConfig } from 'payload'

// Showreel Collection Schema
export const Showreel: CollectionConfig = {
  slug: 'showreel',
  access: {
    read: isContent,
    create: isContent,
    update: isSuperAdminandAdmin,
    delete: isSuperAdminandAdmin,
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  fields: [
    {
      name: 'videoLink',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Video link is required'
        }
        return true
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        if (data.videoLink) {
          data.videoLink = data.videoLink.trim()
        }
        return data
      },
    ],
  },
}
