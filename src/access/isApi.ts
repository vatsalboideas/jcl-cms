import UserRoles from '@/utils/RoleTypes'
import { Access } from 'payload'

const apiOrigin = process.env.FRONTEND_URLS || ['']

export const isApi: Access = ({ req: { user, origin } }) => {
  // Need to be logged in
  //   console.log(origin, 'origin')

  if (user) {
    // If user has role of 'admin'
    if (user.role?.includes(UserRoles.BUSINESS)) return false
    if (user.role?.includes(UserRoles.USER)) return false
    if (user.role?.includes(UserRoles.HR)) return false
  }

  // Non-logged in users can only read published docs
  return true
}
