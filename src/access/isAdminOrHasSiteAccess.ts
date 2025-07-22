import { Access } from 'payload'
import { User } from '../payload-types'

export const isAdminOrHasSiteAccess =
  (siteIDFieldName: string = 'site'): Access =>
  ({ req }) => {
    const user: User | undefined | null = req.user
    // Need to be logged in
    if (user) {
      // If user has role of 'admin'
      if (user.role === 'admin') return true
    }
    // Reject everyone else
    return false
  }
