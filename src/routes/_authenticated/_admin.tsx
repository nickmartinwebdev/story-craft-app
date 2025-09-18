import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: ({ context, location }) => {
    // Check if user has admin role
    const hasAdminRole =
      context.auth.user?.roles?.includes("admin") ||
      context.auth.user?.role === "admin";

    if (!hasAdminRole) {
      throw redirect({
        to: "/unauthorized",
        search: {
          redirect: location.href,
          reason: "insufficient_permissions",
        },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Admin Area:</strong> You have administrative privileges.
      </div>
      <Outlet />
    </div>
  );
}
