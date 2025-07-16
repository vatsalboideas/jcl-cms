import { isContent } from '@/access/isContent'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import {
  FixedToolbarFeature,
  HTMLConverterFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Works: CollectionConfig = {
  slug: 'works',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'clientType', 'workType', 'slug'],
  },
  access: {
    read: isContent,
    create: isContent,
    update: isSuperAdminandAdmin,
    delete: isSuperAdminandAdmin,
  },
  fields: [
    // Basic Information
    {
      name: 'title',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Title is required'
        }
        if (value.trim().length < 3) {
          return 'Title must be at least 3 characters long'
        }
        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title',
      },
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Slug is required'
        }
        // Basic slug validation
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        if (!slugRegex.test(value)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens'
        }
        return true
      },
    },
    {
      name: 'link',
      type: 'text',
      required: true,
      //   validate: (value: string | null | undefined) => {
      //     if (!value || typeof value !== 'string' || value.trim().length === 0) {
      //       return 'Link is required'
      //     }
      //     try {
      //       new URL(value)
      //       return true
      //     } catch {
      //       return 'Please enter a valid URL'
      //     }
      //   },
    },

    // Classification Fields
    {
      name: 'clientType',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Client Type is required'
        }
        if (value.trim().length < 3) {
          return 'Client Type must be at least 3 characters long'
        }
        return true
      },
    },
    {
      name: 'workType',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Work Type is required'
        }
        if (value.trim().length < 3) {
          return 'Work Type must be at least 3 characters long'
        }
        return true
      },
    },

    // Media Fields
    {
      name: 'verticalImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Vertical orientation image (portrait)',
      },
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'squareImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Square orientation image (1:1 ratio)',
      },
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'horizontalImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Horizontal orientation image (landscape)',
      },
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },

    {
      name: 'websiteLink',
      type: 'text',
      admin: {
        description: 'Live website URL',
      },
      validate: (value: string | null | undefined) => {
        if (value && value.trim().length > 0) {
          try {
            new URL(value)
            return true
          } catch {
            return 'Please enter a valid URL'
          }
        }
        return true
      },
    },

    // Rich Text Field
    {
      name: 'detailsBody',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures, rootFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          HTMLConverterFeature(),
        ],
      }),
      admin: {
        description: 'Detailed description of the work/project',
      },
    },

    // Array of Objects - Details Data
    {
      name: 'detailsData',
      type: 'array',
      admin: {
        description: 'Project details, features, or sections',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || typeof value !== 'string' || value.trim().length === 0) {
              return 'Detail title is required'
            }
            return true
          },
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          admin: {
            description: 'Detailed description for this section',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for this detail section',
          },
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'video',
          type: 'text',
          admin: {
            description: 'Video URL (YouTube, Vimeo, etc.)',
          },
          validate: (value: string | null | undefined) => {
            if (value && value.trim().length > 0) {
              try {
                new URL(value)
                return true
              } catch {
                return 'Please enter a valid video URL'
              }
            }
            return true
          },
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description: 'Additional link for this section',
          },
          validate: (value: string | null | undefined) => {
            if (value && value.trim().length > 0) {
              try {
                new URL(value)
                return true
              } catch {
                return 'Please enter a valid URL'
              }
            }
            return true
          },
        },
      ],
    },
  ],

  // Collection-level hooks
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        console.log('Before validate hook - works data:', data)

        // Sanitize text inputs
        if (data.title) data.title = data.title.trim()
        if (data.slug) data.slug = data.slug.trim().toLowerCase()
        if (data.link) data.link = data.link.trim()
        if (data.detailsTitle) data.detailsTitle = data.detailsTitle.trim()
        if (data.websiteLink) data.websiteLink = data.websiteLink.trim()

        // Generate slug from title if not provided
        if (!data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        console.log('Before change hook - processing work submission')

        // Additional validation or processing
        return data
      },
    ],
  },
}
