import { isBusiness } from '@/access/isBusiness'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import { hasValidJWT } from '@/access/isLoggedIn'
import encryptionHooks from '@/utils/EnryptionHooks'
import type { CollectionConfig } from 'payload'
import Decrypt from '@/utils/DataDecrypt'

export const ContactForms: CollectionConfig = {
  slug: 'contactforms',
  access: {
    read: isBusiness,
    create: () => true, // Allow all
    update: isSuperAdminandAdmin,
    delete: isSuperAdminandAdmin,
  },

  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'First name is required'
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters long'
        }
        return true
      },
      hooks: encryptionHooks,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Last name is required'
        }
        if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters long'
        }
        return true
      },
      hooks: encryptionHooks,
    },
    {
      name: 'contactNumber',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Phone number is required'
        }
        // Basic phone number validation (adjust regex based on your requirements)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        // if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        //   return 'Please enter a valid phone number'
        // }
        return true
      },
      hooks: encryptionHooks,
    },
    {
      name: 'emailId',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Phone number is required'
        }
        // Basic phone number validation (adjust regex based on your requirements)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        // if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        //   return 'Please enter a valid phone number'
        // }
        return true
      },
      hooks: encryptionHooks,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Subject is required'
        }
        if (value.trim().length < 3) {
          return 'Subject must be at least 3 characters long'
        }
        if (value.trim().length > 200) {
          return 'Subject must be less than 200 characters'
        }
        return true
      },
      hooks: encryptionHooks,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return 'Message is required'
        }
        if (value.trim().length < 10) {
          return 'Message must be at least 10 characters long'
        }
        if (value.trim().length > 2000) {
          return 'Message must be less than 2000 characters'
        }
        return true
      },
      hooks: encryptionHooks,
    },
  ],
  custom: {
    'plugin-import-export': {
      ToCSVFunction: ({ value, columnName, row }: any) => {
        // add both `author_id` and the `author_email` to the csv export
        if (value && typeof value === 'object' && 'id' in value && 'email' in value) {
          row[`${columnName}_id`] = (value as { id: number | string }).id
          row[`${columnName}_email`] = (value as { email: string }).email
        }
      },
    },
  },
  // Additional collection-level hooks for server-side validation
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        try {
          // Only decrypt if the field exists and is encrypted
          if (data.firstName) {
            data.firstName = Decrypt(data.firstName)
          }

          if (data.lastName) {
            data.lastName = Decrypt(data.lastName)
          }

          if (data.contactNumber) {
            data.contactNumber = Decrypt(data.contactNumber)
          }

          if (data.emailId) {
            data.emailId = Decrypt(data.emailId)
          }

          if (data.subject) {
            data.subject = Decrypt(data.subject)
          }

          if (data.message) {
            data.message = Decrypt(data.message)
          }
        } catch (error) {
          console.error('Decryption error:', error)
          throw new Error('Failed to process encrypted data')
        }

        return data
      },
    ],
    afterChange: [
      // Override the response after form submission
      ({ operation }: { operation: 'create' | 'update' }) => {
        if (operation === 'create') {
          return {
            status: 'success',
            message: 'Your message has been submitted successfully',
          }
        }
      },
    ],
  },
}
