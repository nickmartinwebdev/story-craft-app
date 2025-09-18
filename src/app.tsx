import * as React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { useAuth } from "./auth/context";

// Component that provides auth context to the router
function AuthAwareApp() {
  const auth = useAuth();

  // Pass the auth state to the router context
  return <RouterProvider router={router} context={{ auth }} />;
}

// Main App component
function App() {
  return <AuthAwareApp />;
}

export default App;
