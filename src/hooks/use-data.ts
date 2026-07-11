// Centralised React Query hooks for the operational core.
// Keeps query keys consistent and cache invalidation predictable.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agenciesService, subscriptionsService, hostsService, managersService,
  goalsService, financeService, rankingsService, notificationsService,
  type DbAgency, type DbSubscription, type DbHost, type DbManager,
  type DbGoal, type DbTransaction, type DbRanking,
} from "@/services";

export const qk = {
  agencies: ["agencies"] as const,
  subscriptions: ["subscriptions"] as const,
  hosts: ["hosts"] as const,
  managers: ["managers"] as const,
  goals: ["goals"] as const,
  finance: ["finance"] as const,
  rankings: (period: DbRanking["period"]) => ["rankings", period] as const,
  notifications: ["notifications"] as const,
};

// ---- Reads ----
export const useAgencies = () => useQuery({ queryKey: qk.agencies, queryFn: agenciesService.list });
export const useSubscriptions = () => useQuery({ queryKey: qk.subscriptions, queryFn: subscriptionsService.list });
export const useHosts = () => useQuery({ queryKey: qk.hosts, queryFn: hostsService.list });
export const useManagers = () => useQuery({ queryKey: qk.managers, queryFn: managersService.list });
export const useGoals = () => useQuery({ queryKey: qk.goals, queryFn: goalsService.list });
export const useFinance = () => useQuery({ queryKey: qk.finance, queryFn: financeService.list });
export const useRankings = (period: DbRanking["period"] = "monthly") =>
  useQuery({ queryKey: qk.rankings(period), queryFn: () => rankingsService.latest(period) });
export const useNotifications = () => useQuery({ queryKey: qk.notifications, queryFn: notificationsService.list });

// ---- Writes ----
export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DbAgency>) => agenciesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agencies }),
  });
}
export function useUpdateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<DbAgency> }) => agenciesService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agencies }),
  });
}
export function useDeleteAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agenciesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agencies }),
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<DbSubscription> }) => subscriptionsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.subscriptions }),
  });
}

export function useCreateHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof hostsService.create>[0]) => hostsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.hosts }),
  });
}
export function useUpdateHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<DbHost> }) => hostsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.hosts }),
  });
}
export function useDeleteHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hostsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.hosts }),
  });
}

export function useCreateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof managersService.create>[0]) => managersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.managers }),
  });
}
export function useUpdateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<DbManager> }) => managersService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.managers }),
  });
}
export function useDeleteManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => managersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.managers }),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof goalsService.create>[0]) => goalsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}
export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<DbGoal> }) => goalsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}
export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.goals }),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof financeService.create>[0]) => financeService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.finance }),
  });
}
export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.finance }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}

export type { DbAgency, DbSubscription, DbHost, DbManager, DbGoal, DbTransaction, DbRanking };
export type { DbNotification } from "@/services";
