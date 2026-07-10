import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User, UserRole } from "@/types";
import { ROLE_ROUTES } from "@/lib/constants";

// Mock authentication — persisted to localStorage. Ready to be swapped
// for a real Supabase session provider without touching consumers.

const STORAGE_KEY = "livepulse.auth";

const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: "usr_admin_1",
    email: "carlos@livepulse.io",
    name: "Carlos Almeida",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=owner",
    role: "admin",
    created_at: "2025-01-10T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
  manager: {
    id: "usr_mgr_1",
    email: "rafael@livepulse.io",
    name: "Rafael Costa",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=Rafael%20Costa",
    role: "manager",
    created_at: "2025-02-14T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
  host: {
    id: "usr_host_1",
    email: "ana@livepulse.io",
    name: "Ana Vitória",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=Ana%20Vit%C3%B3ria",
    role: "host",
    created_at: "2025-03-01T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
};

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (role?: UserRole) => void;
  signOut: () => void;
  switchRole: (role: UserRole) => void;
  canAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
      else setUser(MOCK_USERS.admin); // default for prototype
    } catch {
      setUser(MOCK_USERS.admin);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    signIn: (role = "admin") => setUser(MOCK_USERS[role]),
    signOut: () => setUser(null),
    switchRole: (role) => setUser(MOCK_USERS[role]),
    canAccess: (path) => {
      if (!user) return false;
      const allowed = ROLE_ROUTES[user.role];
      if (allowed.includes("*")) return true;
      return allowed.some((p) => path === p || path.startsWith(p + "/"));
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
