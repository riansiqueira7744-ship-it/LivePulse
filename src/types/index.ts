// Domain types — DB-ready models for future Supabase integration.
// These mirror the intended schema so services/hooks can swap mock -> real without refactors.

export type UUID = string;
export type ISODate = string;

export type UserRole = "admin" | "manager" | "host";

export interface User {
  id: UUID;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: ISODate;
  last_sign_in_at: ISODate | null;
}

export type HostStatus = "online" | "offline" | "at-risk";
export type HostLevel = "rookie" | "rising" | "star" | "elite";
export type HostCategory = "Beauty" | "Gaming" | "Music" | "Talk" | "Dance" | "Lifestyle";

export interface HostRecord {
  id: UUID;
  code: string;                  // LV-XXXX
  nickname: string;
  avatar_url: string;
  category: HostCategory;
  status: HostStatus;
  level: HostLevel;
  country: string;
  agency: string;
  manager_id: UUID;
  star_host: boolean;
  earnings: number;
  hours: number;
  target: number;
  progress: number;
  notes: string | null;
  created_at: ISODate;
}

export interface ManagerRecord {
  id: UUID;
  name: string;
  email: string;
  avatar_url: string;
  hosts_count: number;
  revenue: number;
  target: number;
  growth: number;
  commission_pct: number;
  permissions: ManagerPermission[];
  created_at: ISODate;
}

export type ManagerPermission =
  | "hosts:read" | "hosts:write"
  | "finance:read" | "finance:write"
  | "commissions:manage" | "reports:export";

export type TxKind = "revenue" | "expense" | "payment";
export type TxStatus = "paid" | "pending" | "processing" | "failed";

export interface FinancialTx {
  id: UUID;
  kind: TxKind;
  description: string;
  amount: number;
  status: TxStatus;
  category: string;
  reference_id: UUID | null;     // host_id or manager_id
  created_at: ISODate;
}

export interface Commission {
  id: UUID;
  beneficiary_id: UUID;
  beneficiary_type: "manager" | "host";
  percentage: number;
  base_amount: number;
  amount: number;
  status: TxStatus;
  period: string;                // "2026-07"
  paid_at: ISODate | null;
}

export type GoalPeriod = "weekly" | "monthly" | "quarterly";
export type GoalScope = "agency" | "manager" | "host";

export interface Goal {
  id: UUID;
  scope: GoalScope;
  scope_id: UUID | null;
  period: GoalPeriod;
  target: number;
  achieved: number;
  progress: number;
  starts_at: ISODate;
  ends_at: ISODate;
}

export type NotificationLevel = "info" | "success" | "warning" | "danger";

export interface Notification {
  id: UUID;
  level: NotificationLevel;
  title: string;
  description: string;
  read: boolean;
  href: string | null;
  created_at: ISODate;
}

export interface AgencySettings {
  id: UUID;
  company_name: string;
  timezone: string;
  currency: "BRL" | "USD" | "EUR";
  language: "pt-BR" | "en" | "es";
  theme: "dark" | "light";
}
