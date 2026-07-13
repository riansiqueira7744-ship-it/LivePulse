import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { UserRole } from "@/types";
import { ROLE_ROUTES, ROLE_PERMISSIONS, type Permission } from "@/lib/constants";

// Real auth backed by Lovable Cloud. Loads profile + role + agency on session.
// Public API kept compatible with previous mock implementation so consumers
// don't change.
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  livepulse_id: string | null;
  agency_id: string | null;
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  locale: string;
}

export interface CurrentAgency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: string;
  status: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  currentAgency: CurrentAgency | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  canAccess: (path: string) => boolean;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type ProfileWithAgency = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  agency_id: string | null;
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  locale: string | null;
  livepulse_id?: string | null;
  agency: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    plan: string;
    status: string;
  } | null;
};

async function loadContext(
  userId: string,
  email: string,
): Promise<{ user: AuthUser; agency: CurrentAgency | null } | null> {
  // Single parallel batch: profile (with joined agency), roles, and owned agencies.
  // The profile join covers managers/hosts whose agency comes from profiles.agency_id.
  // The ownedAgencies query covers agency_owners whose agency_id may not be set on profile yet.
  const [{ data: profile }, { data: roles }, { data: ownedAgencies }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, agency:agencies!agency_id(id,name,slug,logo_url,plan,status)")
      .eq("id", userId)
      .maybeSingle() as unknown as Promise<{ data: ProfileWithAgency | null; error: unknown }>,
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("agencies").select("id,name,slug,logo_url,plan,status").eq("owner_id", userId),
  ]);

  // Priority: super_admin > agency_owner > manager > host
  const priority: UserRole[] = ["super_admin", "agency_owner", "manager", "host"];
  const rowRoles = (roles ?? []).map((r) => r.role as UserRole);
  let role: UserRole | undefined = priority.find((p) => rowRoles.includes(p));

  // Derive pending state: user owns an agency but has no operational role yet.
  const pendingAgency = (ownedAgencies ?? []).find((a) => a.status !== "active");
  if (!role && pendingAgency) role = "agency_pending";
  if (!role) role = "host"; // Fallback for auth users with no role.

  const agencyId = profile?.agency_id ?? pendingAgency?.id ?? null;

  const user: AuthUser = {
    id: userId,
    email,
    name: profile?.name ?? email.split("@")[0],
    avatar_url: profile?.avatar_url ?? null,
    role,
    livepulse_id: profile?.livepulse_id ?? null,
    agency_id: agencyId,
    whatsapp: profile?.whatsapp ?? null,
    country: profile?.country ?? null,
    city: profile?.city ?? null,
    locale: profile?.locale ?? "pt-BR",
  };

  // Resolve agency: prefer the joined profile agency, fall back to the pending-owner agency.
  let agency: CurrentAgency | null = null;
  if (profile?.agency) {
    agency = profile.agency as CurrentAgency;
  } else if (pendingAgency) {
    agency = pendingAgency as unknown as CurrentAgency;
  }

  return { user, agency };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agency, setAgency] = useState<CurrentAgency | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setUser(null);
      setAgency(null);
      setLoading(false);
      return;
    }
    const ctx = await loadContext(nextSession.user.id, nextSession.user.email ?? "");
    setUser(ctx?.user ?? null);
    setAgency(ctx?.agency ?? null);
    setLoading(false);
  };

  useEffect(() => {
    // Subscribe FIRST, then read the current session, to avoid missing events.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Defer async work to next tick to avoid deadlocks in the listener
      setTimeout(() => {
        if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setAgency(null);
          setLoading(false);
          return;
        }
        void hydrate(s);
      }, 0);
    });
    void supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      currentAgency: agency,
      session,
      loading,
      isAuthenticated: !!user,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refresh: async () => {
        const { data } = await supabase.auth.getSession();
        await hydrate(data.session);
      },
      canAccess: (path) => {
        if (!user) return false;
        const allowed = ROLE_ROUTES[user.role];
        if (allowed.includes("*")) return true;
        return allowed.some((p) => path === p || path.startsWith(p + "/"));
      },
      can: (permission) => !!user && ROLE_PERMISSIONS[user.role].includes(permission),
    }),
    [user, agency, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
