import UserRoles from '@/utils/RoleTypes'
import { Access } from 'payload'

export const isSuperAdminandAdmin: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.role?.includes(UserRoles.SUPER_ADMIN)) return true
    if (user.role?.includes(UserRoles.ADMIN)) return true
  }

  // Non-logged in users can only read published docs
  return false
}
