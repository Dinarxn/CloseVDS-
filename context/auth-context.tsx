"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, ApiClientError } from "@/lib/api-client";

export interface User {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    workspaceName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentWorkspace = async (workspaceId: string): Promise<Workspace> => {
    try {
      const wsResponse = await api.get<{
        success?: boolean;
        workspace?: Workspace;
      }>("/workspaces/current");
      if (wsResponse?.workspace) {
        return wsResponse.workspace;
      }
    } catch {
      // Graceful fallback if workspace endpoint is transitioning
    }
    return {
      id: workspaceId,
      name: "Default Workspace",
      slug: "default-workspace",
    };
  };

  const refreshSession = useCallback(async () => {
    try {
      const response = await api.get<{
        success?: boolean;
        user?: User;
        workspace?: Workspace;
        data?: { user: User; workspace?: Workspace };
      }>("/auth/me");

      // Extract user & workspace whether returned directly or nested in data
      const authUser = response?.user || response?.data?.user;
      let authWorkspace = response?.workspace || response?.data?.workspace;

      if (authUser) {
        setUser(authUser);
        if (!authWorkspace) {
          authWorkspace = await fetchCurrentWorkspace(authUser.workspaceId);
        }
        setWorkspace(authWorkspace);
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem("closevds_token");
        }
        setUser(null);
        setWorkspace(null);
      }
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("closevds_token");
      }
      setUser(null);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Handle proactive session expiration emitted by api-client upon receiving HTTP 401
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleExpired = () => {
      setUser(null);
      setWorkspace(null);
    };
    window.addEventListener("closevds:session_expired", handleExpired);
    return () => {
      window.removeEventListener("closevds:session_expired", handleExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{
      success?: boolean;
      user?: User;
      token?: string;
      workspace?: Workspace;
      data?: { user: User; workspace?: Workspace; token?: string };
    }>("/auth/login", { email, password });

    const authUser = response?.user || response?.data?.user;
    let authWorkspace = response?.workspace || response?.data?.workspace;
    const authToken = response?.token || response?.data?.token;

    if (authToken && typeof window !== "undefined") {
      localStorage.setItem("closevds_token", authToken);
    }

    if (authUser) {
      setUser(authUser);
      if (!authWorkspace) {
        authWorkspace = await fetchCurrentWorkspace(authUser.workspaceId);
      }
      setWorkspace(authWorkspace);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    workspaceName?: string
  ) => {
    const response = await api.post<{
      success?: boolean;
      user?: User;
      token?: string;
      workspace?: Workspace;
      data?: { user: User; workspace?: Workspace; token?: string };
    }>("/auth/register", { name, email, password, workspaceName });

    const authUser = response?.user || response?.data?.user;
    let authWorkspace = response?.workspace || response?.data?.workspace;
    const authToken = response?.token || response?.data?.token;

    if (authToken && typeof window !== "undefined") {
      localStorage.setItem("closevds_token", authToken);
    }

    if (authUser) {
      setUser(authUser);
      if (!authWorkspace) {
        authWorkspace = await fetchCurrentWorkspace(authUser.workspaceId);
      }
      setWorkspace(authWorkspace);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Proceed with clearing local auth state even if server logout fails
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("closevds_token");
      }
      setUser(null);
      setWorkspace(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
