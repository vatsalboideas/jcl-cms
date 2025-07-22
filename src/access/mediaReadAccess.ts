import { Access } from 'payload'
import { User } from '../payload-types'
import UserRoles from '../utils/RoleTypes'

export const mediaReadAccess: Access = ({ req, data }) => {
  const user: User | undefined | null = req.user
  if (!user || !user.role) return false

  // For list queries (no data), return a filter based on role
  if (!data) {
    if (user.role === UserRoles.ADMIN || user.role === UserRoles.SUPER_ADMIN) {
      return true // See all
    }
    if (user.role === UserRoles.HR) {
      // HR: Only see PDFs
      return {
        mimeType: { equals: 'application/pdf' },
      } as any
    }
    if (user.role === UserRoles.CONTENT) {
      // Content: Only see images
      return {
        OR: [
          { mimeType: { equals: 'image/jpeg' } },
          { mimeType: { equals: 'image/png' } },
          { mimeType: { equals: 'image/gif' } },
          { mimeType: { equals: 'image/webp' } },
          { mimeType: { equals: 'image/svg+xml' } },
        ],
      } as any
    }
    // Other roles: no access
    return false
  }

  // For single doc access, keep previous logic
  const mimeType = data.mimeType as string
  const isPDF = mimeType === 'application/pdf'
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(
    mimeType,
  )

  if (isPDF) {
    return (
      user.role === UserRoles.ADMIN ||
      user.role === UserRoles.SUPER_ADMIN ||
      user.role === UserRoles.HR
    )
  }

  if (isImage) {
    return (
      user.role === UserRoles.ADMIN ||
      user.role === UserRoles.SUPER_ADMIN ||
      user.role === UserRoles.CONTENT
    )
  }

  // Default: only admin and superAdmin
  return user.role === UserRoles.ADMIN || user.role === UserRoles.SUPER_ADMIN
}
