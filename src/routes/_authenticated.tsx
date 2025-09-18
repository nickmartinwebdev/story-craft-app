import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuth } from "../auth/context";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const auth = useAuth();

  // Show loading while checking authentication
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!auth.isAuthenticated) {
    throw redirect({
      to: "/signin",
      search: {
        redirect: window.location.href,
      },
    });
  }

  return <Outlet />;
}
