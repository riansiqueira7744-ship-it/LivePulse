// Domain types — DB-ready models for future Supabase integration.
// All tenant-scoped resources carry `agency_id`. `super_admin` is the Livepulse owner
// and is not bound to a single agency.

export type UUID = string;
export type ISODate = string;

export type UserRole = "super_admin" | "agency_owner" | "manager" | "host";

export type Locale = "pt-BR" | "en" | "es" | "fr" | "it" | "de";

export interface User {
  id: UUID;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  agency_id: UUID | null;         // null for super_admin
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  locale: Locale;
  created_at: ISODate;
  last_sign_in_at: ISODate | null;
}

// ---------- Agencies / SaaS ----------

export type AgencyStatus = "active" | "trial" | "suspended" | "canceled";
export type PlanTier = "starter" | "growth" | "scale" | "enterprise";

export interface Agency {
  id: UUID;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string;
  owner_id: UUID;
  status: AgencyStatus;
  plan: PlanTier;
  hosts_count: number;
  managers_count: number;
  mrr: number;
  created_at: ISODate;
}

export interface Subscription {
  id: UUID;
  agency_id: UUID;
  plan: PlanTier;
  status: AgencyStatus;
  price_monthly: number;
  seats: number;
  next_invoice_at: ISODate;
  started_at: ISODate;
}

// ---------- Hosts / Managers ----------

export type HostStatus = "online" | "offline" | "at-risk";
export type HostLevel = "rookie" | "rising" | "star" | "elite";
export type HostCategory = "Beauty" | "Gaming" | "Music" | "Talk" | "Dance" | "Lifestyle";
export type StreamingPlatform = "TikTok" | "Kwai" | "BIGO" | "Shopee" | "Instagram" | "YouTube";

export interface HostRecord {
  id: UUID;
  agency_id: UUID;
  code: string;
  nickname: string;
  avatar_url: string;
  category: HostCategory;
  status: HostStatus;
  level: HostLevel;
  country: string;
  city: string | null;
  whatsapp: string | null;
  platform: StreamingPlatform;
  platform_id: string;
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
  agency_id: UUID;
  name: string;
  email: string;
  whatsapp: string | null;
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

// ---------- Finance ----------

export type TxKind = "revenue" | "expense" | "payment";
export type TxStatus = "paid" | "pending" | "processing" | "failed";

export interface FinancialTx {
  id: UUID;
  agency_id: UUID;
  kind: TxKind;
  description: string;
  amount: number;
  status: TxStatus;
  category: string;
  reference_id: UUID | null;
  created_at: ISODate;
}

export interface Commission {
  id: UUID;
  agency_id: UUID;
  beneficiary_id: UUID;
  beneficiary_type: "manager" | "host";
  percentage: number;
  base_amount: number;
  amount: number;
  status: TxStatus;
  period: string;
  paid_at: ISODate | null;
}

// ---------- Goals ----------

export type GoalPeriod = "weekly" | "monthly" | "quarterly";
export type GoalScope = "agency" | "manager" | "host";

export interface Goal {
  id: UUID;
  agency_id: UUID;
  name: string;
  description: string | null;
  scope: GoalScope;
  scope_id: UUID | null;
  metric: "hours" | "diamonds" | "revenue" | "goals";
  period: GoalPeriod;
  target: number;
  achieved: number;
  progress: number;
  reward: string | null;
  starts_at: ISODate;
  ends_at: ISODate;
}

// ---------- Chat ----------

export type ChatChannelKind = "agency" | "team" | "dm" | "support";

export interface ChatChannel {
  id: UUID;
  agency_id: UUID | null;    // null for super_admin ↔ owner support DMs
  kind: ChatChannelKind;
  name: string;
  members: UUID[];
  last_message_at: ISODate;
  unread: number;
}

export interface ChatMessage {
  id: UUID;
  channel_id: UUID;
  author_id: UUID;
  author_name: string;
  author_avatar: string;
  content: string;
  attachments: { name: string; url: string; kind: "image" | "pdf" | "file" }[];
  pinned: boolean;
  created_at: ISODate;
}

// ---------- Gamification ----------

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: UUID;
  code: string;
  name: string;
  emoji: string;
  description: string;
  rarity: BadgeRarity;
}

export interface Achievement {
  id: UUID;
  user_id: UUID;
  badge_id: UUID;
  unlocked_at: ISODate;
}

export interface LevelInfo {
  level: number;
  name: string;
  xp_required: number;
  perks: string[];
}

// ---------- LiveCoins ----------

export type LiveCoinsTxType = "purchase" | "reward" | "spend" | "gift";

export interface LiveCoinsBalance {
  user_id: UUID;
  balance: number;
  lifetime: number;
}

export interface LiveCoinsTx {
  id: UUID;
  user_id: UUID;
  type: LiveCoinsTxType;
  amount: number;
  description: string;
  created_at: ISODate;
}

// ---------- Store ----------

export type StoreCategory = "frame" | "badge" | "theme" | "effect" | "title" | "custom";
export type StoreScope = "host" | "agency";

export interface StoreItem {
  id: UUID;
  name: string;
  description: string;
  scope: StoreScope;
  category: StoreCategory;
  price: number;
  preview_url: string;
  rarity: BadgeRarity;
  featured: boolean;
}

// ---------- Seasons ----------

export interface Season {
  id: UUID;
  name: string;
  starts_at: ISODate;
  ends_at: ISODate;
  status: "upcoming" | "active" | "ended";
  rewards: string[];
  participants: number;
}

// ---------- Files ----------

export type FileKind = "pdf" | "video" | "doc" | "image" | "other";

export interface FileAsset {
  id: UUID;
  agency_id: UUID;
  name: string;
  kind: FileKind;
  size_bytes: number;
  folder: string;
  uploaded_by: UUID;
  uploaded_at: ISODate;
  url: string;
}

// ---------- Calendar ----------

export type CalendarEventKind = "event" | "goal" | "meeting" | "payment" | "training";

export interface CalendarEvent {
  id: UUID;
  agency_id: UUID;
  title: string;
  kind: CalendarEventKind;
  starts_at: ISODate;
  ends_at: ISODate;
  attendees: UUID[];
  color: string;
}

// ---------- Notifications / Settings ----------

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
  agency_id: UUID;
  company_name: string;
  timezone: string;
  currency: "BRL" | "USD" | "EUR";
  language: Locale;
  theme: "dark" | "light";
}
