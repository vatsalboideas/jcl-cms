import UserRoles from '@/utils/RoleTypes'
import { Access } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.role?.includes(UserRoles.ADMIN)) {
      return true
    }
    if (user.role?.includes(UserRoles.SUPER_ADMIN)) {
      return true
    }

    // If any other type of user, only provide access to themselves
    return {
      id: {
        equals: user.id,
      },
    }
  }

  // Reject everyone else
  return false
}
