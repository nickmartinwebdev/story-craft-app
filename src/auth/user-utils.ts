import type { PublicUser } from "../db/schema";
import type { UserRole, UserPermission } from "./types";
import {
  ROLE_PERMISSIONS,
  getRolePermissions,
  DEFAULT_USER_ROLE,
  DEFAULT_USER_ROLES,
  DEFAULT_USER_PERMISSIONS,
} from "./types";

/**
 * Utility functions for working with user roles and permissions
 */

/**
 * Initialize default roles and permissions for a new user
 */
export function initializeUserRoles(
  user: Partial<PublicUser>,
): Partial<PublicUser> {
  return {
    ...user,
    role: user.role || DEFAULT_USER_ROLE,
    roles: user.roles || DEFAULT_USER_ROLES,
    permissions: user.permissions || DEFAULT_USER_PERMISSIONS,
  };
}

/**
 * Check if a user has a specific role
 */
export function userHasRole(user: PublicUser | null, role: UserRole): boolean {
  if (!user) return false;

  return user.role === role || user.roles?.includes(role) || false;
}

/**
 * Check if a user has any of the specified roles
 */
export function userHasAnyRole(
  user: PublicUser | null,
  roles: UserRole[],
): boolean {
  if (!user) return false;

  return roles.some((role) => userHasRole(user, role));
}

/**
 * Check if a user has all of the specified roles
 */
export function userHasAllRoles(
  user: PublicUser | null,
  roles: UserRole[],
): boolean {
  if (!user) return false;

  return roles.every((role) => userHasRole(user, role));
}

/**
 * Check if a user has a specific permission
 */
export function userHasPermission(
  user: PublicUser | null,
  permission: UserPermission,
): boolean {
  if (!user) return false;

  return user.permissions?.includes(permission) || false;
}

/**
 * Check if a user has any of the specified permissions
 */
export function userHasAnyPermission(
  user: PublicUser | null,
  permissions: UserPermission[],
): boolean {
  if (!user) return false;

  return permissions.some((permission) => userHasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function userHasAllPermissions(
  user: PublicUser | null,
  permissions: UserPermission[],
): boolean {
  if (!user) return false;

  return permissions.every((permission) => userHasPermission(user, permission));
}

/**
 * Get all effective permissions for a user (from roles and direct permissions)
 */
export function getUserEffectivePermissions(
  user: PublicUser | null,
): UserPermission[] {
  if (!user) return [];

  // Get permissions from roles
  const rolePermissions = (user.roles || [])
    .filter((role): role is UserRole => role in ROLE_PERMISSIONS)
    .flatMap((role) => getRolePermissions(role));

  // Get direct permissions and filter to valid permissions
  const directPermissions = (user.permissions || []).filter(
    (permission): permission is UserPermission =>
      typeof permission === "string",
  );

  // Combine and deduplicate
  return [...new Set([...rolePermissions, ...directPermissions])];
}

/**
 * Check if user is admin
 */
export function isUserAdmin(user: PublicUser | null): boolean {
  return userHasRole(user, "admin");
}

/**
 * Check if user is moderator or admin
 */
export function isUserModerator(user: PublicUser | null): boolean {
  return userHasAnyRole(user, ["admin", "moderator"]);
}

/**
 * Check if user can manage other users
 */
export function canUserManageUsers(user: PublicUser | null): boolean {
  return (
    userHasAnyPermission(user, ["users:manage", "users:write"]) ||
    isUserAdmin(user)
  );
}

/**
 * Check if user can manage content
 */
export function canUserManageContent(user: PublicUser | null): boolean {
  return (
    userHasAnyPermission(user, ["content:manage", "content:moderate"]) ||
    isUserModerator(user)
  );
}

/**
 * Check if user can access admin area
 */
export function canUserAccessAdmin(user: PublicUser | null): boolean {
  return userHasPermission(user, "admin:access") || isUserAdmin(user);
}

/**
 * Validate role assignment (check if a user can assign a specific role)
 */
export function canAssignRole(
  assigner: PublicUser | null,
  targetRole: UserRole,
): boolean {
  if (!assigner) return false;

  // Only admins can assign admin role
  if (targetRole === "admin") {
    return isUserAdmin(assigner);
  }

  // Admins can assign any role, moderators can assign user/viewer/editor roles
  if (isUserAdmin(assigner)) {
    return true;
  }

  if (isUserModerator(assigner)) {
    return ["user", "viewer", "editor"].includes(targetRole);
  }

  return false;
}

/**
 * Get displayable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: "User",
    admin: "Administrator",
    moderator: "Moderator",
    editor: "Editor",
    viewer: "Viewer",
  };

  return roleNames[role] || role;
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    user: "blue",
    admin: "red",
    moderator: "orange",
    editor: "green",
    viewer: "gray",
  };

  return roleColors[role] || "gray";
}

/**
 * Get permission display name
 */
export function getPermissionDisplayName(permission: UserPermission): string {
  const [resource, action] = permission.split(":");
  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
  const actionName = action.charAt(0).toUpperCase() + action.slice(1);

  return `${resourceName}: ${actionName}`;
}

/**
 * Group permissions by resource for display
 */
export function groupPermissionsByResource(
  permissions: UserPermission[],
): Record<string, UserPermission[]> {
  return permissions.reduce(
    (groups, permission) => {
      const [resource] = permission.split(":");
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
      return groups;
    },
    {} as Record<string, UserPermission[]>,
  );
}

/**
 * Sanitize user data for frontend (remove sensitive fields)
 */
export function sanitizeUserForFrontend(user: any): PublicUser {
  const { password, ...publicUser } = user;
  return {
    ...publicUser,
    role: user.role || DEFAULT_USER_ROLE,
    roles: user.roles || DEFAULT_USER_ROLES,
    permissions: user.permissions || DEFAULT_USER_PERMISSIONS,
  };
}

/**
 * Create a new user with default role and permissions
 */
export function createUserWithDefaults(
  userData: Omit<
    PublicUser,
    "id" | "uuid" | "createdAt" | "updatedAt" | "role" | "roles" | "permissions"
  >,
): Partial<PublicUser> {
  return {
    ...userData,
    role: DEFAULT_USER_ROLE,
    roles: DEFAULT_USER_ROLES,
    permissions: DEFAULT_USER_PERMISSIONS,
    isActive: true,
  };
}

/**
 * Upgrade user role with appropriate permissions
 */
export function upgradeUserRole(
  user: PublicUser,
  newRole: UserRole,
): Partial<PublicUser> {
  const newRoles = [...new Set([...(user.roles || []), newRole])];
  const rolePermissions = getRolePermissions(newRole);
  const existingPermissions = (user.permissions || []).filter(
    (permission): permission is UserPermission =>
      typeof permission === "string",
  );
  const newPermissions = [
    ...new Set([...existingPermissions, ...rolePermissions]),
  ];

  return {
    ...user,
    role: newRole,
    roles: newRoles,
    permissions: newPermissions,
  };
}

/**
 * Downgrade user role (remove role and its permissions)
 */
export function downgradeUserRole(
  user: PublicUser,
  roleToRemove: UserRole,
): Partial<PublicUser> {
  const remainingRoles = (user.roles || []).filter(
    (role) => role !== roleToRemove,
  );
  const rolePermissions = getRolePermissions(roleToRemove);
  const existingPermissions = (user.permissions || []).filter(
    (permission): permission is UserPermission =>
      typeof permission === "string",
  );
  const remainingPermissions = existingPermissions.filter(
    (permission) => !rolePermissions.includes(permission),
  );

  // Set primary role to the highest remaining role
  const newPrimaryRole = remainingRoles.includes("admin")
    ? "admin"
    : remainingRoles.includes("moderator")
      ? "moderator"
      : remainingRoles.includes("editor")
        ? "editor"
        : remainingRoles.includes("viewer")
          ? "viewer"
          : "user";

  return {
    ...user,
    role: newPrimaryRole,
    roles: remainingRoles.length > 0 ? remainingRoles : [DEFAULT_USER_ROLE],
    permissions:
      remainingPermissions.length > 0
        ? remainingPermissions
        : DEFAULT_USER_PERMISSIONS,
  };
}
