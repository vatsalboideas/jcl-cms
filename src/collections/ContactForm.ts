import { isBusiness } from '@/access/isBusiness'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import encryptionHooks from '@/utils/EnryptionHooks'
import type { CollectionConfig } from 'payload'

export const ContactForms: CollectionConfig = {
  slug: 'contactforms',
  access: {
    read: isBusiness,
    create: () => true,
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
      name: 'phoneNumber',
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
  // Additional collection-level hooks for server-side validation
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        // Additional server-side validation and sanitization
        console.log('Before validate hook - data:', data)

        // Sanitize text inputs
        if (data.firstName) {
          data.firstName = data.firstName.trim()
        }
        if (data.lastName) {
          data.lastName = data.lastName.trim()
        }
        if (data.phoneNumber) {
          data.phoneNumber = data.phoneNumber.trim()
        }
        if (data.subject) {
          data.subject = data.subject.trim()
        }
        if (data.message) {
          data.message = data.message.trim()
        }

        return data
      },
    ],
  },
}
