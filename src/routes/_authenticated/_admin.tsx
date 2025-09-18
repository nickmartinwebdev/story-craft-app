import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuth } from "../../auth/context";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const auth = useAuth();

  // Check if user has admin role
  const hasAdminRole =
    auth.user?.roles?.includes("admin") || auth.user?.role === "admin";

  if (!hasAdminRole) {
    throw redirect({
      to: "/unauthorized",
      search: {
        redirect: window.location.href,
        reason: "insufficient_permissions",
      },
    });
  }

  return (
    <div>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Admin Area:</strong> You have administrative privileges.
      </div>
      <Outlet />
    </div>
  );
}
