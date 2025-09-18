import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { notifications } from "@mantine/notifications";
import type { PublicUser } from "../db/schema";
import { sanitizeUserForFrontend } from "./user-utils";

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = "story-craft-token";

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setState((prev) => ({ ...prev, token }));
      refreshUser(token);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const refreshUser = async (token?: string) => {
    const authToken = token || state.token;
    if (!authToken) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          user: sanitizeUserForFrontend(data.user),
          token: authToken,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        // Token is invalid, clear it
        localStorage.removeItem(TOKEN_KEY);
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      localStorage.removeItem(TOKEN_KEY);
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const signin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setState({
          user: sanitizeUserForFrontend(data.user),
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        });

        notifications.show({
          title: "Success",
          message: data.message || "Signed in successfully",
          color: "green",
        });

        return true;
      } else {
        notifications.show({
          title: "Sign In Failed",
          message: data.error || "Failed to sign in",
          color: "red",
        });
        return false;
      }
    } catch (error) {
      console.error("Signin error:", error);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setState({
          user: sanitizeUserForFrontend(data.user),
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        });

        notifications.show({
          title: "Welcome!",
          message: data.message || "Account created successfully",
          color: "green",
        });

        return true;
      } else {
        notifications.show({
          title: "Sign Up Failed",
          message: data.error || "Failed to create account",
          color: "red",
        });
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred",
        color: "red",
      });
      return false;
    }
  };

  const signout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });

    notifications.show({
      title: "Signed Out",
      message: "You have been signed out successfully",
      color: "blue",
    });
  };

  const contextValue: AuthContextType = {
    ...state,
    signin,
    signup,
    signout,
    refreshUser: () => refreshUser(),
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
