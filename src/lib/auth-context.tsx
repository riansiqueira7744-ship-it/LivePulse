import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Agency, User, UserRole } from "@/types";
import { ROLE_ROUTES, ROLE_PERMISSIONS, type Permission } from "@/lib/constants";
import { mockAgencies } from "@/lib/mock-agencies";

// Mock authentication — persisted to localStorage. Ready to be swapped
// for a real Supabase session provider without touching consumers.

const STORAGE_KEY = "livepulse.auth";
const DEFAULT_AGENCY_ID = mockAgencies[0].id;

const MOCK_USERS: Record<UserRole, User> = {
  super_admin: {
    id: "usr_super_1",
    email: "founder@livepulse.io",
    name: "Bruno Falcão",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=super",
    role: "super_admin",
    agency_id: null,
    whatsapp: "+55 11 99999-0001",
    country: "BR",
    city: "São Paulo",
    locale: "pt-BR",
    created_at: "2024-11-01T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
  agency_owner: {
    id: "usr_owner_1",
    email: "carlos@livepulse.io",
    name: "Carlos Almeida",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=owner",
    role: "agency_owner",
    agency_id: DEFAULT_AGENCY_ID,
    whatsapp: "+55 11 98888-1010",
    country: "BR",
    city: "São Paulo",
    locale: "pt-BR",
    created_at: "2025-01-10T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
  manager: {
    id: "usr_mgr_1",
    email: "rafael@livepulse.io",
    name: "Rafael Costa",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=Rafael%20Costa",
    role: "manager",
    agency_id: DEFAULT_AGENCY_ID,
    whatsapp: "+55 11 97777-2020",
    country: "BR",
    city: "Rio de Janeiro",
    locale: "pt-BR",
    created_at: "2025-02-14T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
  host: {
    id: "usr_host_1",
    email: "ana@livepulse.io",
    name: "Ana Vitória",
    avatar_url: "https://api.dicebear.com/9.x/glass/svg?seed=Ana%20Vit%C3%B3ria",
    role: "host",
    agency_id: DEFAULT_AGENCY_ID,
    whatsapp: "+55 11 96666-3030",
    country: "BR",
    city: "Belo Horizonte",
    locale: "pt-BR",
    created_at: "2025-03-01T09:00:00Z",
    last_sign_in_at: new Date().toISOString(),
  },
};

interface AuthContextValue {
  user: User | null;
  currentAgency: Agency | null;
  isAuthenticated: boolean;
  signIn: (role?: UserRole) => void;
  signOut: () => void;
  switchRole: (role: UserRole) => void;
  switchAgency: (agencyId: string) => void;
  canAccess: (path: string) => boolean;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [agencyOverrideId, setAgencyOverrideId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
      else setUser(MOCK_USERS.agency_owner);
    } catch {
      setUser(MOCK_USERS.agency_owner);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo<AuthContextValue>(() => {
    const agencyId = agencyOverrideId ?? user?.agency_id ?? (user?.role === "super_admin" ? DEFAULT_AGENCY_ID : null);
    const currentAgency = agencyId ? mockAgencies.find((a) => a.id === agencyId) ?? null : null;

    return {
      user,
      currentAgency,
      isAuthenticated: !!user,
      signIn: (role = "agency_owner") => { setUser(MOCK_USERS[role]); setAgencyOverrideId(null); },
      signOut: () => { setUser(null); setAgencyOverrideId(null); },
      switchRole: (role) => { setUser(MOCK_USERS[role]); setAgencyOverrideId(null); },
      switchAgency: (id) => setAgencyOverrideId(id),
      canAccess: (path) => {
        if (!user) return false;
        const allowed = ROLE_ROUTES[user.role];
        if (allowed.includes("*")) return true;
        return allowed.some((p) => path === p || path.startsWith(p + "/"));
      },
      can: (permission) => !!user && ROLE_PERMISSIONS[user.role].includes(permission),
    };
  }, [user, agencyOverrideId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
