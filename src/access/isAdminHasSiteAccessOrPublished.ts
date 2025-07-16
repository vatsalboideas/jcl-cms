// import { Access } from "payload/";

import { Access } from 'payload'

export const isAdminOrHasSiteAccessOrPublished: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.role?.includes('admin')) return true
    // If user has role of 'superAdmin'
    if (user.role?.includes('superAdmin')) return true
  }

  // Non-logged in users can only read published docs
  return {
    _status: {
      equals: 'published',
    },
  }
}
