import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Create router factory function for TanStack Start
export function createRouter() {
  return createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
}

// Create the router instance for legacy compatibility
export const router = createRouter();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
