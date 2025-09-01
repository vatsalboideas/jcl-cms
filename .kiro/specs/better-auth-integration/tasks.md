# Implementation Plan

- [ ] 1. Update role definitions and type system
  - Enhance the UserRoles utility to include all six roles with proper TypeScript types
  - Create role permission interfaces and type definitions
  - Update payload-types.ts generation to include new role options
  - _Requirements: 2.1, 2.3_

- [ ] 2. Configure Enhanced Better Auth Setup
  - Update Better Auth configuration in src/lib/auth.ts with additional user fields
  - Add role field with proper validation and default values
  - Configure admin plugin with role-based access
  - Add session management with role information
  - _Requirements: 1.1, 1.2, 6.1, 6.2_

- [ ] 3. Enhance Payload Auth Plugin Configuration
  - Update plugin configuration in src/plugins/index.ts to support all user roles
  - Configure role synchronization between Better Auth and Payload
  - Add proper field mappings for firstName, lastName, and role
  - Set up bidirectional sync options
  - _Requirements: 1.1, 1.3, 4.1, 4.2_

- [ ] 4. Update Users Collection with Role Support
  - Modify src/collections/Users.ts to include all role fields and validation
  - Add proper access controls based on user roles
  - Implement role field with select options for all six roles
  - Add firstName and lastName fields with validation
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 5. Implement Role-Based Access Control System
  - Create comprehensive access control functions for each role type
  - Update existing access files (isAdmin.ts, isSuperAdmin.ts, etc.) to work with new role system
  - Implement role hierarchy and permission checking utilities
  - Add access control validation middleware
  - _Requirements: 3.1, 3.2, 3.5, 3.6, 5.2_

- [ ] 6. Update Media Collection with Role-Based Access
  - Modify src/collections/Media.ts to implement role-based media access
  - Configure HR users to access only PDF files
  - Configure Content users to access only image files
  - Update media read access controls with proper role filtering
  - _Requirements: 3.3, 3.4_

- [ ] 7. Create User Synchronization Service
  - Implement sync service to keep Better Auth and Payload user data consistent
  - Add hooks for user creation, update, and role changes
  - Implement error handling and retry logic for sync failures
  - Add logging for sync operations and failures
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Implement JWT Middleware with Role Validation
  - Update src/utils/jwtMiddleware.ts to include role information in tokens
  - Add role validation for API endpoints
  - Implement proper HTTP status codes for authentication failures
  - Add middleware for protecting routes based on user roles
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Update Collection Access Controls
  - Modify all collection files to use new role-based access system
  - Update CareerForms.ts, ContactForm.ts, Work.ts, InstaPosts.ts, Showreel.ts
  - Implement proper CRUD permissions for each role
  - Add role-based filtering for collection queries
  - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [ ] 10. Create Session Management Integration
  - Implement session sharing between Better Auth and Payload
  - Add session validation that works across both systems
  - Configure session expiration and renewal policies
  - Add "remember me" functionality with proper duration limits
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11. Add Role Permission Validation Utilities
  - Create utility functions for checking role permissions
  - Implement role hierarchy validation (SuperAdmin > Admin > etc.)
  - Add permission checking for specific actions and resources
  - Create role-based query filters for collections
  - _Requirements: 2.4, 3.1, 5.2_

- [ ] 12. Implement Error Handling and Recovery
  - Add comprehensive error handling for authentication failures
  - Implement sync failure recovery with exponential backoff
  - Add proper logging for authentication and authorization events
  - Create fallback mechanisms for when sync fails
  - _Requirements: 1.4, 4.4, 5.3_

- [ ] 13. Create Migration Script for Existing Users
  - Write migration script to add role field to existing users
  - Set appropriate default roles based on current user permissions
  - Ensure data integrity during migration
  - Add rollback capability for migration
  - _Requirements: 2.2, 2.4_

- [ ] 14. Add Comprehensive Testing Suite
  - Write unit tests for role validation functions
  - Create integration tests for Better Auth + Payload Auth flow
  - Add end-to-end tests for role-based access scenarios
  - Test user synchronization between systems
  - _Requirements: All requirements validation_

- [ ] 15. Update Environment Configuration
  - Add necessary environment variables for Better Auth configuration
  - Update database schema for new user fields
  - Configure session and cookie settings
  - Add security configurations for production deployment
  - _Requirements: 1.1, 6.1, 6.4_