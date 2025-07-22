// import type { CollectionConfig } from 'payload'

// export const CareerForms: CollectionConfig = {
//   slug: 'careerforms',
//   access: {
//     read: () => true,
//   },
//   fields: [
//     {
//       name: 'firstName',
//       type: 'text',
//       required: true,
//     },
//     {
//       name: 'lastName',
//       type: 'text',
//       required: true,
//     },
//     {
//       name: 'contactNumber',
//       type: 'text',
//       required: true,
//     },
//     {
//       name: 'portfolioLink',
//       type: 'text',
//       required: true,
//     },
//     {
//       name: 'message',
//       type: 'text',
//       required: true,
//     },
//     {
//       name: 'emailId',
//       type: 'email',
//       required: true,
//     },
//     {
//       name: 'resume',
//       type: 'upload',
//       relationTo: 'media',
//       required: true,
//       filterOptions: { and: [{ mimeType: { equals: 'application/pdf' } }] },
//       validate: (file: any) => {
//         console.log('Validating file:', file)
//         if (!file) return 'File is required'
//         if (file.mimeType !== 'application/pdf') {
//           return 'Only PDF files are allowed'
//         }
//         if (file.size > 5 * 1024 * 1024) {
//           return 'File size must be less than 5 MB'
//         }
//         return true
//       },
//     },
//   ],
// }
import { isHr } from '@/access/isHr'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import encryptionHooks from '@/utils/EnryptionHooks'
import type { CollectionConfig } from 'payload'
import { hasValidJWT } from '@/access/isLoggedIn'

export const CareerForms: CollectionConfig = {
  slug: 'careerforms',
  access: {
    read: isHr,
    create: () => true, // Allow all
    update: isSuperAdminandAdmin,
    delete: isSuperAdminandAdmin,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      hooks: encryptionHooks,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      hooks: encryptionHooks,
    },
    {
      name: 'contactNumber',
      type: 'text',
      required: true,
      hooks: encryptionHooks,
    },
    {
      name: 'portfolioLink',
      type: 'text',
      required: true,
      hooks: encryptionHooks,
    },
    {
      name: 'message',
      type: 'textarea', // Changed to textarea for better UX
      required: true,
      hooks: encryptionHooks,
    },
    {
      name: 'emailId',
      type: 'text',
      required: true,
      hooks: encryptionHooks,
    },
    {
      name: 'resume',
      type: 'upload',
      relationTo: 'media',
      required: true,
      // Multiple filter approaches for better compatibility
      filterOptions: {
        and: [{ mimeType: { equals: 'application/pdf' } }],
      },
      // Client-side validation
      validate: (file: any) => {
        console.log('Validating resume file:', file)

        // Check if file exists
        if (!file) {
          return 'Resume file is required'
        }

        // If file is an object with file properties (during upload)
        if (file.file) {
          const actualFile = file.file

          // MIME type validation
          if (actualFile.type && actualFile.type !== 'application/pdf') {
            return 'Only PDF files are allowed for resume'
          }

          // File size validation (5MB limit)
          if (actualFile.size && actualFile.size > 5 * 1024 * 1024) {
            return 'Resume file size must be less than 5 MB'
          }

          // File name validation
          if (actualFile.name && !actualFile.name.toLowerCase().endsWith('.pdf')) {
            return 'Resume file must have a .pdf extension'
          }
        }

        // If file is already uploaded (has mimeType property)
        if (file.mimeType && file.mimeType !== 'application/pdf') {
          return 'Only PDF files are allowed for resume'
        }

        // File size validation for uploaded files
        if (file.filesize && file.filesize > 5 * 1024 * 1024) {
          return 'Resume file size must be less than 5 MB'
        }

        return true
      },
      // hooks: encryptionHooks,
    },
  ],
  // Additional collection-level hooks for server-side validation
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        // Additional server-side validation
        console.log('Before validate hook - data:', data)

        // Sanitize text inputs
        if (data.firstName) {
          data.firstName = data.firstName.trim()
        }
        if (data.lastName) {
          data.lastName = data.lastName.trim()
        }
        if (data.message) {
          data.message = data.message.trim()
        }
        if (data.emailId) {
          data.emailId = data.emailId.trim().toLowerCase()
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        console.log('Before change hook - validating resume upload')

        // Additional server-side file validation
        if (data.resume && typeof data.resume === 'string') {
          // If resume is an ID, fetch the media document to validate
          try {
            const media = await req.payload.findByID({
              collection: 'media',
              id: data.resume,
            })

            if (media) {
              // Validate the actual uploaded file
              if (media.mimeType !== 'application/pdf') {
                throw new Error('Resume must be a PDF file')
              }

              if (media.filesize && media.filesize > 5 * 1024 * 1024) {
                throw new Error('Resume file size must be less than 5 MB')
              }
            }
          } catch (error) {
            console.error('Resume validation error:', error)
            throw error
          }
        }

        return data
      },
    ],
  },
}
