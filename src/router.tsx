import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { PublicUser } from "./db/schema";

// Define the authentication context interface
export interface AuthState {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<boolean>;
  signout: () => void;
  refreshUser: () => Promise<void>;
}

// Define the router context interface
export interface MyRouterContext {
  auth: AuthState;
}

// Create the router instance
export const router = createTanstackRouter({
  routeTree,
  context: {
    // Initially undefined, will be set by the AuthAwareApp component
    auth: undefined!,
  },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
