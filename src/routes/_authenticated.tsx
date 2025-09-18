import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // Check if user is authenticated
    if (!context.auth.isAuthenticated) {
      // Redirect to signin page with return URL
      throw redirect({
        to: '/signin',
        search: {
          // Use the current location to power a redirect after login
          redirect: location.href,
        },
      })
    }
  },
  component: () => <Outlet />,
})
