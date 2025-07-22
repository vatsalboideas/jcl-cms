// import type { CollectionConfig } from 'payload'

// export const Media: CollectionConfig = {
//   slug: 'media',
//   access: {
//     read: () => true,
//   },
//   fields: [
//     {
//       name: 'alt',
//       type: 'text',
//       required: true,
//     },
//   ],
//   upload: true,

// // }
// import type { CollectionConfig } from 'payload'

// export const Media: CollectionConfig = {
//   slug: 'media',
//   access: {
//     read: () => true,
//   },
//   fields: [
//     {
//       name: 'alt',
//       type: 'text',
//       required: true,
//     },
//   ],
//   upload: {
//     // staticURL: '/media',
//     staticDir: 'media',
//     adminThumbnail: 'thumbnail',
//     mimeTypes: [
//       // Image formats
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'image/gif',
//       'image/webp',
//       'image/svg+xml',
//       // PDF format
//       'application/pdf',
//     ],
//     // 5MB file size limit (5 * 1024 * 1024 bytes)
//     crop: false,
//     focalPoint: false,
//   },
//   hooks: {
//     beforeChange: [
//       ({ data, req }) => {
//         // Check file size (5MB = 5 * 1024 * 1024 bytes)
//         const maxSize = 5 * 1024 * 1024

//         if (req.file && req.file.size > maxSize) {
//           throw new Error('File size must be less than 5MB')
//         }

//         return data
//       },
//     ],
//   },
// }

import type { CollectionConfig, User } from 'payload'
import fs from 'fs'
import path from 'path'
import { isSuperAdminandAdmin } from '@/access/isSuperAdminandAdmin'
import { mediaReadAccess } from '@/access/mediaReadAccess'
import UserRoles from '@/utils/RoleTypes'

// Define allowed file types with their extensions
const ALLOWED_FILE_TYPES = {
  // Image formats
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/svg+xml': ['svg'],
  // PDF format
  'application/pdf': ['pdf'],
}

// Updated PDF Security Check Function with more lenient rules
async function checkPDFSecurity(buffer: any) {
  try {
    const fileContent = buffer.toString()

    const securityChecks = {
      hasJavaScript: false,
      hasEncryption: false,
      hasEmbeddedFiles: false,
      hasAcroForms: false,
      suspiciousPatterns: [] as string[],
      headerCheck: false,
    }

    // Check PDF header
    const pdfHeader = buffer.slice(0, 5).toString()
    securityChecks.headerCheck = pdfHeader === '%PDF-'

    if (!securityChecks.headerCheck) {
      return {
        success: false,
        message: 'Invalid PDF format',
      }
    }

    // Check for dangerous patterns - Updated with less strict criteria
    const patterns = {
      // Only check for the most critical JavaScript-related patterns
      javascript: ['/OpenAction', '/AA'],

      // Reduced embedded file checks
      embedded: ['/EmbeddedFiles'],

      // Forms are now considered low risk
      forms: ['/AcroForm'],

      // Only check for the most dangerous actions
      other: ['/Launch'],
    }

    Object.entries(patterns).forEach(([category, patternList]) => {
      patternList.forEach((pattern) => {
        if (fileContent.includes(pattern)) {
          if (category === 'javascript') securityChecks.hasJavaScript = true
          if (category === 'embedded') securityChecks.hasEmbeddedFiles = true
          if (category === 'forms') securityChecks.hasAcroForms = true
          securityChecks.suspiciousPatterns.push(pattern)
        }
      })
    })

    // Check for encryption - now considered low risk
    if (fileContent.includes('/Encrypt')) {
      securityChecks.hasEncryption = true
    }

    // Updated risk assessment - only most dangerous features are high risk
    const isHighRisk = securityChecks.hasJavaScript && fileContent.includes('/OpenAction') // Only block if JavaScript has OpenAction

    const isMediumRisk =
      securityChecks.hasEmbeddedFiles ||
      (securityChecks.hasJavaScript && !fileContent.includes('/OpenAction')) // Other JavaScript is medium risk

    // Only fail for high-risk content
    if (isHighRisk) {
      return {
        success: false,
        message: 'PDF security check failed: High-risk content detected',
      }
    }

    // Medium risk content generates a warning but allows the file
    if (isMediumRisk) {
      return {
        success: true,
        warning: 'PDF contains potentially interactive content but is allowed',
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      message: 'Error checking PDF security: ' + error && error.message,
    }
  }
}

// File validation function
function validateFileType(filename: string, mimetype: string) {
  // Get file extension from original filename
  const extension = path.extname(filename).toLowerCase().slice(1)

  console.log(extension, 'extension')

  // Check if mimetype is allowed
  // @ts-ignore
  if (!ALLOWED_FILE_TYPES[mimetype]) {
    throw new Error(`File type not allowed: ${mimetype}`)
  }

  // Check if extension matches the allowed extensions for the mimetype
  // @ts-ignore
  const allowedExtensions = ALLOWED_FILE_TYPES[mimetype]
  if (!allowedExtensions.includes(extension)) {
    throw new Error(`Invalid file extension: .${extension} for mimetype ${mimetype}`)
  }

  return true
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // read: mediaReadAccess,
    read: ({ req: { user } }) => {
      if (!user || !user.role) return false
      if (user.role === UserRoles.ADMIN || user.role === UserRoles.SUPER_ADMIN) {
        return true
      }
      if (user.role === UserRoles.HR) {
        return {
          mimeType: {
            equals: 'application/pdf',
          },
        }
      }
      if (user.role === UserRoles.CONTENT) {
        return {
          mimeType: {
            in: Object.keys(ALLOWED_FILE_TYPES).filter((key) => key !== 'application/pdf'),
          },
        }
      }
      return false
    },
    create: () => true,
    update: isSuperAdminandAdmin,
    delete: isSuperAdminandAdmin,
  },
  // Removed admin.defaultFilter due to type error

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'securityStatus',
      type: 'select',
      options: [
        { label: 'Safe', value: 'safe' },
        { label: 'Warning', value: 'warning' },
        { label: 'Blocked', value: 'blocked' },
      ],
      admin: {
        readOnly: true,
        description: 'Security status of the uploaded file',
      },
    },
    {
      name: 'securityMessage',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Security check details',
      },
    },
  ],
  upload: {
    staticDir: 'media',
    adminThumbnail: 'thumbnail',
    mimeTypes: Object.keys(ALLOWED_FILE_TYPES),
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
    crop: false,
    focalPoint: false,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
    ],
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        // Debug: log incoming body and data
        console.log('beforeValidate - originalDoc:', originalDoc)
        console.log('beforeValidate - req.body:', req.body)
        console.log('beforeValidate - data:', data?.alt)
        // Create uploads directory if it doesn't exist
        if (data) {
          data.alt = data?.filename
        }
        const uploadDir = './uploads'
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        // Debug: log file and data
        // console.log('beforeChange - req.file:', req.file)
        // console.log('beforeChange - data:', data)
        // Check file size (5MB = 5 * 1024 * 1024 bytes)
        const maxSize = 5 * 1024 * 1024
        if (req.file && req.file.size > maxSize) {
          throw new Error('File size must be less than 5MB')
        }
        // Validate file type and extension if file is present
        if (req.file) {
          try {
            validateFileType(req.file.name, req.file.mimetype)
          } catch (error: any) {
            throw new Error(error.message)
          }
          // If it's a PDF, perform security checks
          if (req.file.mimetype === 'application/pdf') {
            try {
              const fileBuffer = req.file.data
              const securityResult = await checkPDFSecurity(fileBuffer)
              if (!securityResult.success) {
                // Block high-risk PDFs
                data.securityStatus = 'blocked'
                data.securityMessage = securityResult.message
                throw new Error(securityResult.message)
              } else if (securityResult.warning) {
                // Allow medium-risk PDFs with warning
                data.securityStatus = 'warning'
                data.securityMessage = securityResult.warning
                console.warn('PDF Security Warning:', securityResult.warning)
              } else {
                // Safe PDF
                data.securityStatus = 'safe'
                data.securityMessage = 'PDF passed all security checks'
              }
            } catch (error: any) {
              data.securityStatus = 'blocked'
              data.securityMessage = `PDF security check error: ${error.message}`
              throw new Error(`PDF security check failed: ${error.message}`)
            }
          } else {
            // Non-PDF files are considered safe after type validation
            data.securityStatus = 'safe'
            data.securityMessage = 'File type validated and approved'
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        // Log security status for monitoring
        console.log(`File uploaded: ${doc.filename}, Security Status: ${doc.securityStatus}`)
        if (doc.securityMessage) {
          console.log(`Security Message: ${doc.securityMessage}`)
        }
      },
    ],
  },
}
