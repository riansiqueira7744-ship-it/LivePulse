import type { UserRole, HostStatus, TxStatus, NotificationLevel, PlanTier, AgencyStatus } from "@/types";

export const APP_NAME = "Livepulse";
export const APP_TAGLINE = "Agency OS";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  agency_owner: "Dono da Agência",
  manager: "Gerente",
  host: "Host",
};

export const HOST_STATUS_LABELS: Record<HostStatus, string> = {
  online: "Online",
  offline: "Offline",
  "at-risk": "Em risco",
};

export const TX_STATUS_LABELS: Record<TxStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  processing: "Processando",
  failed: "Falhou",
};

export const NOTIFICATION_TONE: Record<NotificationLevel, string> = {
  info: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
  enterprise: "Enterprise",
};

export const AGENCY_STATUS_LABELS: Record<AgencyStatus, string> = {
  active: "Ativa",
  trial: "Teste",
  suspended: "Suspensa",
  canceled: "Cancelada",
};

// Route access map for role-based guarding.
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  super_admin: ["*"],
  agency_owner: ["*"],
  manager: [
    "/app/dashboard", "/app/hosts", "/app/goals", "/app/ranking",
    "/app/community", "/app/chat", "/app/gamification", "/app/livecoins",
    "/app/store", "/app/seasons", "/app/files", "/app/calendar",
    "/app/notifications", "/app/settings", "/app/profile", "/app/ai",
    "/app/reports",
  ],
  host: [
    "/app/dashboard", "/app/goals", "/app/ranking", "/app/community",
    "/app/chat", "/app/gamification", "/app/livecoins", "/app/store",
    "/app/seasons", "/app/files", "/app/calendar", "/app/invites",
    "/app/notifications", "/app/profile", "/app/settings",
  ],
};

// Permission matrix — used by `can()` in auth-context.
export type Permission =
  | "agencies:manage" | "billing:manage" | "broadcasts:send" | "support:answer"
  | "hosts:manage" | "managers:manage" | "finance:read" | "finance:manage"
  | "goals:manage" | "reports:export" | "chat:agency" | "chat:support"
  | "files:manage" | "calendar:manage" | "livecoins:buy" | "store:buy";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "agencies:manage", "billing:manage", "broadcasts:send", "support:answer",
    "chat:support",
  ],
  agency_owner: [
    "hosts:manage", "managers:manage", "finance:read", "finance:manage",
    "goals:manage", "reports:export", "chat:agency", "chat:support",
    "files:manage", "calendar:manage", "livecoins:buy", "store:buy",
  ],
  manager: [
    "hosts:manage", "goals:manage", "chat:agency", "calendar:manage",
    "livecoins:buy", "store:buy",
  ],
  host: [
    "chat:agency", "livecoins:buy", "store:buy",
  ],
};

export const CURRENCY_FMT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const LOCALES: { code: import("@/types").Locale; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en",    label: "English",             flag: "🇺🇸" },
  { code: "es",    label: "Español",             flag: "🇪🇸" },
  { code: "fr",    label: "Français",            flag: "🇫🇷" },
  { code: "it",    label: "Italiano",            flag: "🇮🇹" },
  { code: "de",    label: "Deutsch",             flag: "🇩🇪" },
];
