import type { UserRole, HostStatus, TxStatus, NotificationLevel } from "@/types";

export const APP_NAME = "Livepulse";
export const APP_TAGLINE = "Agency OS";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
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

// Route access map for role-based guarding (mock; enforced by useAuth guard).
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ["*"],
  manager: [
    "/app/dashboard", "/app/hosts", "/app/finance", "/app/commissions",
    "/app/goals", "/app/ranking", "/app/reports", "/app/community",
    "/app/notifications", "/app/settings", "/app/profile", "/app/ai",
  ],
  host: [
    "/app/dashboard", "/app/goals", "/app/ranking", "/app/community",
    "/app/notifications", "/app/profile", "/app/settings",
  ],
};

export const CURRENCY_FMT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
