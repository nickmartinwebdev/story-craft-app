# Authentication System Documentation

This document describes the authentication system implementation using TanStack Router's recommended patterns for route protection and authentication context management.

## Overview

The authentication system provides:
- **Route-based authentication guards** using `beforeLoad` hooks
- **Automatic redirects** for unauthenticated users
- **Post-login redirect** functionality
- **Role-based access control** (RBAC) support
- **Permission-based route protection**
- **Type-safe authentication context**

## Architecture

### Core Components

1. **AuthProvider** (`src/auth/context.tsx`) - React context for authentication state
2. **Protected Route Layouts** (`src/routes/_authenticated.tsx`) - Route guards using `beforeLoad`
3. **Router Context** (`src/router.tsx`) - TanStack Router context integration
4. **Auth Guards** (`src/auth/guards.ts`) - Utility functions for role/permission checks

### Authentication Flow

```
User visits protected route → beforeLoad hook → Check auth status → Redirect or Allow
```

## Usage

### Basic Protected Routes

Create protected routes by placing them under the `_authenticated` layout:

```
src/routes/
├── _authenticated/
│   ├── dashboard.tsx       # Protected: requires authentication
│   ├── profile.tsx         # Protected: requires authentication
│   └── _admin/
│       └── users.tsx       # Protected: requires authentication + admin role
├── signin.tsx              # Public: sign in page
├── signup.tsx              # Public: sign up page
└── index.tsx              # Public: home page
```

### Creating Protected Routes

#### 1. Basic Authentication Guard

Place your route under `_authenticated/` directory:

```typescript
// src/routes/_authenticated/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  // Access auth context from route
  const { auth } = Route.useRouteContext()
  const { user, signout } = auth
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={signout}>Sign Out</button>
    </div>
  )
}
```

#### 2. Role-Based Protection

Create nested layouts for role-based access:

```typescript
// src/routes/_authenticated/_admin.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: ({ context, location }) => {
    // Check for admin role
    const hasAdminRole = context.auth.user?.roles?.includes('admin')
    
    if (!hasAdminRole) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.href,
          reason: 'admin_required',
        },
      })
    }
  },
  component: () => <Outlet />,
})
```

#### 3. Permission-Based Protection

Use custom permission checks:

```typescript
// src/routes/_authenticated/_users.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_users')({
  beforeLoad: ({ context, location }) => {
    const requiredPermissions = ['users:read', 'users:write']
    const userPermissions = context.auth.user?.permissions || []
    
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    )
    
    if (!hasPermission) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.href,
          reason: 'insufficient_permissions',
        },
      })
    }
  },
  component: () => <Outlet />,
})
```

### Authentication Context

Access authentication state in components:

```typescript
import { useAuth } from '../auth/context'

function MyComponent() {
  const { 
    user,           // Current user object
    isAuthenticated, // Boolean auth status
    isLoading,      // Loading state
    signin,         // Sign in function
    signup,         // Sign up function
    signout,        // Sign out function
    refreshUser     // Refresh user data
  } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  return <div>Hello, {user?.firstName}!</div>
}
```

### Route Context

In protected routes, access auth through route context:

```typescript
function ProtectedComponent() {
  const { auth } = Route.useRouteContext()
  // auth contains the same properties as useAuth()
  
  return <div>User: {auth.user?.email}</div>
}
```

## Authentication Guards

### Pre-built Guards

```typescript
import { authGuards } from '../auth/guards'

// Basic authentication
export const Route = createFileRoute('/_authenticated/profile')({
  beforeLoad: authGuards.authenticated,
  component: ProfileComponent,
})

// Admin only
export const Route = createFileRoute('/_authenticated/_admin/dashboard')({
  beforeLoad: authGuards.admin,
  component: AdminDashboard,
})

// Moderator or Admin
export const Route = createFileRoute('/_authenticated/_moderated/posts')({
  beforeLoad: authGuards.moderator,
  component: PostModeration,
})
```

### Custom Guards

```typescript
import { hasRole, hasPermission } from '../auth/guards'

const customGuard = ({ context, location }) => {
  const authContext = {
    user: context.auth.user,
    isAuthenticated: context.auth.isAuthenticated,
  }
  
  // Custom logic
  const canAccess = hasRole(authContext, 'editor') && 
                   hasPermission(authContext, 'content:edit')
  
  if (!canAccess) {
    throw redirect({
      to: '/unauthorized',
      search: { redirect: location.href },
    })
  }
}
```

## Login Flow with Redirects

### Sign In Page

```typescript
// src/routes/signin.tsx
export const Route = createFileRoute('/signin')({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || '/dashboard',
  }),
  component: SignInPage,
})

function SignInPage() {
  const search = useSearch({ from: '/signin' })
  const navigate = useNavigate()
  const { signin } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    const success = await signin(email, password)
    if (success) {
      navigate({ to: search.redirect })
    }
  }
}
```

### Automatic Redirect After Auth

When a user visits a protected route without being authenticated:

1. `beforeLoad` hook detects unauthenticated user
2. Redirects to `/signin?redirect=/original/path`
3. User signs in successfully
4. Automatically redirected to original path

## Error Handling

### Unauthorized Access

The `/unauthorized` route handles various unauthorized scenarios:

```typescript
// URL: /unauthorized?reason=insufficient_permissions&redirect=/admin/users

function UnauthorizedPage() {
  const search = useSearch({ from: '/unauthorized' })
  
  // Display appropriate error based on reason
  const message = getErrorMessage(search.reason)
  
  // Provide option to return to original destination
  return (
    <div>
      <h1>Access Denied</h1>
      <p>{message}</p>
      <button onClick={() => navigate({ to: search.redirect })}>
        Try Again
      </button>
    </div>
  )
}
```

## Best Practices

### 1. Route Organization

```
src/routes/
├── _authenticated/           # Requires authentication
│   ├── dashboard.tsx
│   ├── profile.tsx
│   ├── _admin/              # Requires admin role
│   │   ├── users.tsx
│   │   └── settings.tsx
│   └── _premium/            # Requires premium subscription
│       └── features.tsx
├── signin.tsx               # Public
├── signup.tsx               # Public
└── index.tsx               # Public
```

### 2. Loading States

Always handle loading states in protected routes:

```typescript
function ProtectedComponent() {
  const { auth } = Route.useRouteContext()
  
  if (auth.isLoading) {
    return <LoadingSpinner />
  }
  
  // auth.user is guaranteed to exist here
  return <div>Welcome, {auth.user.firstName}!</div>
}
```

### 3. Type Safety

Use TypeScript interfaces for authentication context:

```typescript
interface AuthState {
  user: PublicUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface MyRouterContext {
  auth: AuthState
}
```

### 4. Error Boundaries

Wrap your app in error boundaries to catch authentication errors:

```typescript
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}
```

## Testing Authentication

### Mock Authentication Context

```typescript
const mockAuth = {
  user: { id: '1', email: 'test@example.com', roles: ['user'] },
  isAuthenticated: true,
  isLoading: false,
  signin: vi.fn(),
  signout: vi.fn(),
}

render(
  <AuthProvider value={mockAuth}>
    <YourComponent />
  </AuthProvider>
)
```

### Test Protected Routes

```typescript
test('redirects unauthenticated users', async () => {
  const mockAuth = { isAuthenticated: false }
  
  render(<ProtectedRoute />, { authContext: mockAuth })
  
  expect(mockRedirect).toHaveBeenCalledWith('/signin')
})
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Token Refresh**: Implement token refresh logic for long-running sessions
3. **HTTPS Only**: Always use HTTPS in production
4. **XSS Protection**: Sanitize user inputs and use CSP headers
5. **Route Guards**: Never rely only on frontend guards - always validate on the server

## Migration Guide

If upgrading from manual authentication checks:

1. Remove `useEffect` auth checks from components
2. Move routes under `_authenticated` directory structure
3. Replace manual redirects with `beforeLoad` hooks
4. Update components to use route context instead of auth hooks
5. Test all protected routes to ensure proper redirection

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check that signin/signup routes are not under `_authenticated`
2. **Context Not Found**: Ensure `AuthProvider` wraps your router
3. **Types Not Working**: Verify router context interface matches auth state
4. **Redirects Not Working**: Check that `redirect` is imported from `@tanstack/react-router`

### Debug Authentication

```typescript
// Add to beforeLoad hooks for debugging
beforeLoad: ({ context, location }) => {
  console.log('Auth check:', {
    isAuthenticated: context.auth.isAuthenticated,
    user: context.auth.user,
    location: location.href
  })
  
  // Your auth logic here
}
```
