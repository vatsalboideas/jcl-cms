export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  USER = 'user',
  GUEST = 'guest',
}

export interface UserPermissions {
  canManageUsers: boolean
  canManageContent: boolean
  canPublishContent: boolean
  canAccessAnalytics: boolean
  canManageSettings: boolean
  canViewReports: boolean
  canModerateComments: boolean
  canAccessAPI: boolean
}

export interface UserProfile {
  avatar?: string
  bio?: string
  phoneNumber?: string
  company?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

export interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
  permissions: UserPermissions
  profile: UserProfile
  lastLogin?: Date
  loginAttempts?: number
  resetPasswordToken?: string
  resetPasswordExpiration?: Date
  emailVerificationToken?: string
  twoFactorEnabled?: boolean
  twoFactorSecret?: string
  apiKeys?: Array<{
    id: string
    name: string
    key: string
    permissions: string[]
    createdAt: Date
    lastUsed?: Date
    isActive: boolean
  }>
  createdAt: Date
  updatedAt: Date
}
