# Database Migration Guide: Adding Roles and Permissions with Drizzle

This guide shows how to add roles and permissions to your user model using Drizzle ORM's migration system.

## What Was Added

The following fields were added to the `users` table:
- `role` - Primary role (varchar, default: 'user')
- `roles` - Array of roles (JSON, default: [])
- `permissions` - Array of permissions (JSON, default: [])

## Migration Steps

### 1. Schema Updated ✅
The schema in `src/db/schema.ts` has been updated with:

```typescript
export const users = pgTable("users", {
  // ... existing fields
  role: varchar("role", { length: 50 }).default("user").notNull(),
  roles: json("roles").$type<string[]>().default([]).notNull(),
  permissions: json("permissions").$type<string[]>().default([]).notNull(),
  // ... rest of fields
});
```

### 2. Migration Generated ✅
Drizzle generated the migration file: `drizzle/0001_flaky_raza.sql`

```sql
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'user' NOT NULL;
ALTER TABLE "users" ADD COLUMN "roles" json DEFAULT '[]'::json NOT NULL;
ALTER TABLE "users" ADD COLUMN "permissions" json DEFAULT '[]'::json NOT NULL;
```

### 3. Migration Applied ✅
The migration has been applied to your database.

## Verify Migration

Check that the migration was successful:

```bash
# Connect to your database
npm run docker:logs  # Check if database is running
npm run db:studio    # Open Drizzle Studio to inspect the table
```

Or use SQL to verify:

```sql
-- Check table structure
\d users;

-- Check that existing users have default values
SELECT id, email, role, roles, permissions FROM users LIMIT 5;
```

## Create Your First Admin User

### Option 1: Using Drizzle Studio
1. Run `npm run db:studio`
2. Open the users table
3. Edit a user record and set:
   - `role`: `"admin"`
   - `roles`: `["admin", "user"]`
   - `permissions`: `["users:read", "users:write", "users:delete", "users:manage", "content:read", "content:write", "content:delete", "content:publish", "content:moderate", "content:manage", "stories:read", "stories:write", "stories:delete", "stories:publish", "stories:manage", "admin:access", "admin:settings", "moderation:reports", "moderation:users", "moderation:content", "analytics:view", "system:maintenance"]`

### Option 2: Using SQL
```sql
-- Make your user an admin (replace with your email)
UPDATE users 
SET 
    role = 'admin',
    roles = '["admin", "user"]',
    permissions = '["users:read", "users:write", "users:delete", "users:manage", "content:read", "content:write", "content:delete", "content:publish", "content:moderate", "content:manage", "stories:read", "stories:write", "stories:delete", "stories:publish", "stories:manage", "admin:access", "admin:settings", "moderation:reports", "moderation:users", "moderation:content", "analytics:view", "system:maintenance"]'
WHERE email = 'your-email@example.com';
```

### Option 3: Update via API endpoint
Create a simple script to update via your auth API (recommended for production):

```typescript
// You can add this to your auth API routes
const makeUserAdmin = async (userEmail: string) => {
  const adminPermissions = [
    'users:read', 'users:write', 'users:delete', 'users:manage',
    'content:read', 'content:write', 'content:delete', 'content:publish', 'content:moderate', 'content:manage',
    'stories:read', 'stories:write', 'stories:delete', 'stories:publish', 'stories:manage',
    'admin:access', 'admin:settings',
    'moderation:reports', 'moderation:users', 'moderation:content',
    'analytics:view', 'system:maintenance'
  ];

  await db.update(users)
    .set({
      role: 'admin',
      roles: ['admin', 'user'],
      permissions: adminPermissions
    })
    .where(eq(users.email, userEmail));
};
```

## Test the Authentication System

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Test route protection:**
   - Visit `/dashboard` (should redirect to signin if not logged in)
   - Sign in with your account
   - Visit `/test-auth` to see your authentication details
   - Try accessing `/admin` routes if you have admin permissions

3. **Test admin routes:**
   - If you made yourself admin, visit protected admin routes
   - You should see the admin layout with the red "Admin Area" banner

## Available Roles

The system supports these roles (defined in `src/auth/types.ts`):
- `user` - Basic authenticated user
- `viewer` - Read-only access
- `editor` - Can create and edit content
- `moderator` - Can moderate content and users
- `admin` - Full system access

## Role Hierarchy

Roles inherit permissions from lower-level roles:
- `admin` includes all `moderator`, `editor`, and `user` permissions
- `moderator` includes all `editor` and `user` permissions
- `editor` includes all `user` permissions

## Permission Categories

- `users:*` - User management (read, write, delete, manage)
- `content:*` - Content management (read, write, delete, publish, moderate, manage)
- `stories:*` - Story-specific permissions (read, write, delete, publish, manage)
- `admin:*` - Administrative functions (access, settings, logs, backup)
- `moderation:*` - Moderation tools (reports, users, content)
- `analytics:*` - Analytics access (view, export)
- `system:*` - System configuration (maintenance, config)

## Using Roles and Permissions in Code

### In Route Guards
```typescript
// Check for admin role
export const Route = createFileRoute('/_authenticated/_admin/users')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user?.roles?.includes('admin')) {
      throw redirect({ to: '/unauthorized' })
    }
  }
})
```

### In Components
```typescript
import { userHasRole, userHasPermission } from '../auth/user-utils'

function MyComponent() {
  const { auth } = Route.useRouteContext()
  
  const canManageUsers = userHasPermission(auth.user, 'users:manage')
  const isAdmin = userHasRole(auth.user, 'admin')
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canManageUsers && <UserManagementButton />}
    </div>
  )
}
```

## Future Migrations

For future database changes, always use Drizzle's migration system:

```bash
# 1. Update your schema in src/db/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Review the generated SQL in drizzle/ folder
# 4. Apply migration
npm run db:migrate
```

## Troubleshooting

### Common Issues

1. **Migration fails:**
   - Ensure database is running: `npm run docker:up`
   - Check database credentials in `.env`
   - Verify no existing columns with same names

2. **TypeScript errors:**
   - Restart TypeScript server in your IDE
   - Check that all imports are correct

3. **JSON parsing errors:**
   - Ensure JSON fields contain valid arrays
   - Default values should be proper JSON: `'[]'::json`

4. **Permission denied:**
   - Check database user has ALTER TABLE privileges
   - Verify connection string in `DATABASE_URL`

### Reset Migration (if needed)
```bash
# Only if you need to rollback
# This will remove the role columns
# ⚠️ This will delete role data!

# Generate rollback SQL
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users DROP COLUMN roles;  
ALTER TABLE users DROP COLUMN permissions;
```

## Next Steps

After successful migration:

1. ✅ Update signup process to assign default roles
2. ✅ Create admin interface for managing user roles  
3. ✅ Add role-based UI components
4. ✅ Set up logging for role/permission changes
5. ✅ Test all protected routes

The authentication system is now ready with full role-based access control!

For detailed usage information, see `AUTHENTICATION.md`.