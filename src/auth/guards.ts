import type { PublicUser } from "../db/schema";
import type { UserRole, UserPermission } from "./types";

/**
 * Auth guard utilities for role-based and permission-based access control
 */

export interface AuthGuardContext {
  user: PublicUser | null;
  isAuthenticated: boolean;
}

/**
 * Check if user has a specific role
 */
export function hasRole(context: AuthGuardContext, role: string): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  // Check both single role field and roles array
  return (
    context.user.role === role || context.user.roles?.includes(role) || false
  );
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  context: AuthGuardContext,
  roles: string[],
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  return roles.some((role) => hasRole(context, role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(
  context: AuthGuardContext,
  roles: string[],
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  return roles.every((role) => hasRole(context, role));
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  context: AuthGuardContext,
  permission: string,
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  // Check permissions array on user object
  return context.user.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  context: AuthGuardContext,
  permissions: string[],
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  return permissions.some((permission) => hasPermission(context, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  context: AuthGuardContext,
  permissions: string[],
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  return permissions.every((permission) => hasPermission(context, permission));
}

/**
 * Check if user is an admin (has admin role)
 */
export function isAdmin(context: AuthGuardContext): boolean {
  return hasRole(context, "admin");
}

/**
 * Check if user owns a resource (user ID matches resource owner ID)
 */
export function isOwner(
  context: AuthGuardContext,
  resourceOwnerId: string,
): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  return context.user.uuid === resourceOwnerId;
}

/**
 * Check if user can access resource (is owner or has admin role)
 */
export function canAccessResource(
  context: AuthGuardContext,
  resourceOwnerId: string,
): boolean {
  return isOwner(context, resourceOwnerId) || isAdmin(context);
}

/**
 * Higher-order function to create auth guards for routes
 */
export function createAuthGuard(
  checker: (context: AuthGuardContext) => boolean,
  redirectTo: string = "/signin",
  errorMessage?: string,
) {
  return ({ context, location }: { context: any; location: any }) => {
    const authContext: AuthGuardContext = {
      user: context.auth.user,
      isAuthenticated: context.auth.isAuthenticated,
    };

    if (!checker(authContext)) {
      const searchParams = new URLSearchParams({
        redirect: location.href,
      });

      if (errorMessage) {
        searchParams.set("error", errorMessage);
      }

      throw new Error(`Redirect to ${redirectTo}?${searchParams.toString()}`);
    }
  };
}

/**
 * Pre-built auth guards for common scenarios
 */
export const authGuards = {
  authenticated: createAuthGuard(
    (context) => context.isAuthenticated,
    "/signin",
    "You must be logged in to access this page",
  ),

  admin: createAuthGuard(
    (context) => isAdmin(context),
    "/unauthorized",
    "You must be an admin to access this page",
  ),

  moderator: createAuthGuard(
    (context) => hasAnyRole(context, ["admin", "moderator"]),
    "/unauthorized",
    "You must be an admin or moderator to access this page",
  ),
};

/**
 * Type-safe role and permission checkers
 */
export function hasTypedRole(
  context: AuthGuardContext,
  role: UserRole,
): boolean {
  return hasRole(context, role);
}

export function hasTypedPermission(
  context: AuthGuardContext,
  permission: UserPermission,
): boolean {
  return hasPermission(context, permission);
}

export function hasAnyTypedRole(
  context: AuthGuardContext,
  roles: UserRole[],
): boolean {
  return hasAnyRole(context, roles);
}

export function hasAnyTypedPermission(
  context: AuthGuardContext,
  permissions: UserPermission[],
): boolean {
  return hasAnyPermission(context, permissions);
}
