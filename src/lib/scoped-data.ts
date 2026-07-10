// Multi-tenant + role-aware data scoping for the operational core.
// Central place so switching to Supabase later means changing this file only.

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { hosts as allHosts, managers as allManagers, type Host } from "@/lib/mock-data";

export function useScopedHosts(): Host[] {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return [];
    // Multi-tenant: all mock hosts belong to the current agency in this MVP.
    // Role-aware filtering on top of tenant scope:
    if (user.role === "host") return allHosts.filter((h) => h.nickname === user.name);
    if (user.role === "manager") return allHosts.filter((h) => h.manager === user.name);
    return allHosts; // agency_owner, super_admin (impersonating)
  }, [user]);
}

export function useScopedManagers() {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return [];
    if (user.role === "manager") return allManagers.filter((m) => m.name === user.name);
    if (user.role === "host") {
      const mine = allHosts.find((h) => h.nickname === user.name);
      return mine ? allManagers.filter((m) => m.name === mine.manager) : [];
    }
    return allManagers;
  }, [user]);
}

export function useMyHostRecord(): Host | null {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user || user.role !== "host") return null;
    return allHosts.find((h) => h.nickname === user.name) ?? null;
  }, [user]);
}
