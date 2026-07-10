// Service layer — mocks today, Supabase-ready shape for tomorrow.
// All UI reads/writes must go through these functions so switching to
// a real backend is a single-file refactor per resource.

import { hosts, managers, payments, revenueSeries, categorySplit, alerts, activities, feed, aiInsights } from "@/lib/mock-data";
import { mockNotifications } from "@/lib/mock-notifications";
import { mockAgencies, mockSubscriptions } from "@/lib/mock-agencies";
import { mockChannels, mockMessages } from "@/lib/mock-chat";
import { mockBadges, mockAchievements, mockLevels } from "@/lib/mock-gamification";
import { mockBalances, mockLiveCoinsTx, mockLiveCoinsPackages } from "@/lib/mock-livecoins";
import { mockStoreItems } from "@/lib/mock-store";
import { mockSeasons } from "@/lib/mock-seasons";
import { mockFiles } from "@/lib/mock-files";
import { mockEvents } from "@/lib/mock-calendar";
import { mockBroadcasts } from "@/lib/mock-broadcasts";
import type { Notification } from "@/types";

const delay = <T,>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const hostsService = {
  list: (_agencyId?: string) => delay(hosts),
  get: (id: string) => delay(hosts.find((h) => h.id === id) ?? null),
};

export const managersService = {
  list: (_agencyId?: string) => delay(managers),
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

export const agenciesService = {
  list: () => delay(mockAgencies),
  get: (id: string) => delay(mockAgencies.find((a) => a.id === id) ?? null),
};

export const subscriptionsService = {
  list: () => delay(mockSubscriptions),
  getForAgency: (id: string) => delay(mockSubscriptions.find((s) => s.agency_id === id) ?? null),
};

export const chatService = {
  channels: (_agencyId?: string) => delay(mockChannels),
  messages: (channelId: string) => delay(mockMessages[channelId] ?? []),
};

export const gamificationService = {
  badges: () => delay(mockBadges),
  achievementsOf: (userId: string) => delay(mockAchievements.filter((a) => a.user_id === userId)),
  levels: () => delay(mockLevels),
};

export const liveCoinsService = {
  balanceOf: (userId: string) => delay(mockBalances[userId] ?? { user_id: userId, balance: 0, lifetime: 0 }),
  transactionsOf: (userId: string) => delay(mockLiveCoinsTx.filter((t) => t.user_id === userId)),
  packages: () => delay(mockLiveCoinsPackages),
};

export const storeService = {
  list: () => delay(mockStoreItems),
  byScope: (scope: "host" | "agency") => delay(mockStoreItems.filter((i) => i.scope === scope)),
};

export const seasonsService = {
  list: () => delay(mockSeasons),
  active: () => delay(mockSeasons.find((s) => s.status === "active") ?? null),
};

export const filesService = {
  list: (_agencyId?: string) => delay(mockFiles),
};

export const calendarService = {
  events: (_agencyId?: string) => delay(mockEvents),
};
