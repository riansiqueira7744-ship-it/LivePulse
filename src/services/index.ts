// Service layer — mocks today, Supabase-ready shape for tomorrow.
// All UI reads/writes must go through these functions so switching to
// a real backend is a single-file refactor per resource.

import { hosts, managers, payments, revenueSeries, categorySplit, alerts, activities, feed, aiInsights } from "@/lib/mock-data";
import { mockNotifications } from "@/lib/mock-notifications";
import type { Notification } from "@/types";

const delay = <T,>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const hostsService = {
  list: () => delay(hosts),
  get: (id: string) => delay(hosts.find((h) => h.id === id) ?? null),
};

export const managersService = {
  list: () => delay(managers),
};

export const financeService = {
  payments: () => delay(payments),
  revenueSeries: () => delay(revenueSeries),
  categorySplit: () => delay(categorySplit),
};

export const dashboardService = {
  alerts: () => delay(alerts),
  activities: () => delay(activities),
  aiInsights: () => delay(aiInsights),
};

export const communityService = {
  feed: () => delay(feed),
};

export const notificationsService = {
  list: (): Promise<Notification[]> => delay(mockNotifications),
  unreadCount: () => mockNotifications.filter((n) => !n.read).length,
};
