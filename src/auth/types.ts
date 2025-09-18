// Authentication types and role/permission definitions

/**
 * Available user roles in the system
 */
export type UserRole =
  | 'user'
  | 'admin'
  | 'moderator'
  | 'editor'
  | 'viewer'

/**
 * Available permissions in the system
 * Format: resource:action
 */
export type UserPermission =
  // User management permissions
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:manage'

  // Content management permissions
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  | 'content:publish'
  | 'content:moderate'
  | 'content:manage'

  // Story management permissions (specific to Story Craft app)
  | 'stories:read'
  | 'stories:write'
  | 'stories:delete'
  | 'stories:publish'
  | 'stories:manage'

  // Admin permissions
  | 'admin:access'
  | 'admin:settings'
  | 'admin:logs'
  | 'admin:backup'

  // Moderation permissions
  | 'moderation:reports'
  | 'moderation:users'
  | 'moderation:content'

  // Analytics permissions
  | 'analytics:view'
  | 'analytics:export'

  // System permissions
  | 'system:maintenance'
  | 'system:config'

/**
 * Role-based permission mappings
 * Defines what permissions each role should have by default
 */
export const ROLE_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  user: [
    'stories:read',
    'stories:write',
    'content:read',
  ],

  viewer: [
    'stories:read',
    'content:read',
  ],

  editor: [
    'stories:read',
    'stories:write',
    'stories:publish',
    'content:read',
    'content:write',
    'content:publish',
  ],

  moderator: [
    'stories:read',
    'stories:write',
    'stories:manage',
    'content:read',
    'content:write',
    'content:moderate',
    'users:read',
    'moderation:reports',
    'moderation:users',
    'moderation:content',
  ],

  admin: [
    'users:read',
    'users:write',
    'users:delete',
    'users:manage',
    'content:read',
    'content:write',
    'content:delete',
    'content:publish',
    'content:moderate',
    'content:manage',
    'stories:read',
    'stories:write',
    'stories:delete',
    'stories:publish',
    'stories:manage',
    'admin:access',
    'admin:settings',
    'admin:logs',
    'admin:backup',
    'moderation:reports',
    'moderation:users',
    'moderation:content',
    'analytics:view',
    'analytics:export',
    'system:maintenance',
    'system:config',
  ],
}

/**
 * Role hierarchy - roles that inherit permissions from other roles
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  user: [],
  viewer: [],
  editor: ['user'],
  moderator: ['editor', 'user'],
  admin: ['moderator', 'editor', 'user'],
}

/**
 * Helper function to get all permissions for a role including inherited ones
 */
export function getRolePermissions(role: UserRole): UserPermission[] {
  const directPermissions = ROLE_PERMISSIONS[role] || []
  const inheritedRoles = ROLE_HIERARCHY[role] || []

  const inheritedPermissions = inheritedRoles.flatMap(inheritedRole =>
    ROLE_PERMISSIONS[inheritedRole] || []
  )

  // Remove duplicates and return all permissions
  return [...new Set([...directPermissions, ...inheritedPermissions])]
}

/**
 * Helper function to check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: UserPermission): boolean {
  const rolePermissions = getRolePermissions(role)
  return rolePermissions.includes(permission)
}

/**
 * Helper function to get all permissions for multiple roles
 */
export function getMultipleRolesPermissions(roles: UserRole[]): UserPermission[] {
  const allPermissions = roles.flatMap(role => getRolePermissions(role))
  return [...new Set(allPermissions)]
}

/**
 * Route access definitions
 * Maps route patterns to required roles or permissions
 */
export const ROUTE_ACCESS_RULES = {
  // Admin routes
  '/dashboard/admin': ['admin'],
  '/dashboard/admin/*': ['admin'],

  // Moderator routes
  '/dashboard/moderation': ['admin', 'moderator'],
  '/dashboard/moderation/*': ['admin', 'moderator'],

  // Editor routes
  '/dashboard/stories/manage': ['admin', 'moderator', 'editor'],
  '/dashboard/content/publish': ['admin', 'moderator', 'editor'],

  // User routes (authenticated users only)
  '/dashboard': ['admin', 'moderator', 'editor', 'user', 'viewer'],
  '/dashboard/profile': ['admin', 'moderator', 'editor', 'user', 'viewer'],
  '/dashboard/stories': ['admin', 'moderator', 'editor', 'user'],
  '/dashboard/stories/new': ['admin', 'moderator', 'editor', 'user'],
} as const

/**
 * Permission-based access rules
 * For more granular control than role-based access
 */
export const PERMISSION_ACCESS_RULES = {
  '/api/users': ['users:read'],
  '/api/users/create': ['users:write'],
  '/api/users/delete': ['users:delete'],
  '/api/stories': ['stories:read'],
  '/api/stories/create': ['stories:write'],
  '/api/stories/publish': ['stories:publish'],
  '/api/admin': ['admin:access'],
} as const

/**
 * Default roles for new users
 */
export const DEFAULT_USER_ROLE: UserRole = 'user'
export const DEFAULT_USER_ROLES: UserRole[] = ['user']
export const DEFAULT_USER_PERMISSIONS: UserPermission[] = getRolePermissions(DEFAULT_USER_ROLE)
