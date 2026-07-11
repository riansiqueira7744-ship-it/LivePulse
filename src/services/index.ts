// Service layer — Supabase-backed CRUD for the operational core.
// Every read/write flows through here so future refactors stay isolated.

import { supabase } from "@/integrations/supabase/client";

// ---------- Types (DB row shape) ----------
export type DbAgency = {
  id: string; name: string; slug: string; logo_url: string | null;
  country: string | null; city: string | null;
  plan: "starter" | "growth" | "scale" | "enterprise";
  status: "active" | "trial" | "suspended" | "cancelled";
  mrr: number; hosts_count: number; managers_count: number;
  owner_id: string | null; created_at: string;
};

export type DbSubscription = {
  id: string; agency_id: string;
  plan: DbAgency["plan"];
  status: "active" | "trial" | "suspended" | "cancelled" | "past_due" | "awaiting_payment";
  price_monthly: number; currency: string; seats: number;
  trial_ends_at: string | null; current_period_end: string | null;
};

export type DbManager = {
  id: string; agency_id: string; user_id: string | null;
  name: string; email: string | null; whatsapp: string | null;
  avatar_url: string | null; team_size: number; status: string;
  created_at: string;
};

export type DbHost = {
  id: string; agency_id: string | null; user_id: string | null; manager_id: string | null;
  nickname: string; email: string | null; whatsapp: string | null;
  avatar_url: string | null;
  platform: "tiktok" | "kwai" | "bigo" | "other";
  platform_user_id: string | null;
  category: string | null; country: string | null; city: string | null;
  status: "active" | "inactive" | "pending";
  live_hours: number; gifts_total: number; earnings_total: number;
  score: number; joined_at: string | null; created_at: string; livepulse_id: string | null;
  agency_name: string | null;
  manager?: { name: string } | null;
  manager_name: string | null;
};

export type DbGoal = {
  id: string; agency_id: string; host_id: string | null;
  title: string; description: string | null;
  period: "weekly" | "monthly" | "quarterly";
  target: number; progress: number;
  status: "active" | "completed" | "failed" | "cancelled";
  starts_at: string; ends_at: string | null;
  host?: { nickname: string } | null;
};

export type DbTransaction = {
  id: string; agency_id: string; host_id: string | null; manager_id: string | null;
  type: "revenue" | "payout" | "commission" | "refund" | "adjustment";
  status: "pending" | "confirmed" | "paid" | "failed";
  amount: number; currency: string; description: string | null;
  reference: string | null; occurred_at: string; created_at: string;
};

export type DbRanking = {
  id: string; agency_id: string; host_id: string;
  period: "weekly" | "monthly" | "quarterly"; period_start: string;
  position: number; score: number; category: string | null;
  host?: { nickname: string; avatar_url: string | null; category: string | null } | null;
};

export type DbNotification = {
  id: string; user_id: string; agency_id: string | null;
  type: "info" | "success" | "warning" | "danger";
  title: string; body: string | null; read: boolean; link: string | null;
  created_at: string;
};

// ---------- AGENCIES ----------
export const agenciesService = {
  list: async () => {
    const { data, error } = await supabase.from("agencies").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbAgency[];
  },
  get: async (id: string) => {
    const { data, error } = await supabase.from("agencies").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as DbAgency | null;
  },
  create: async (payload: Partial<DbAgency>) => {
    const { data, error } = await supabase.from("agencies").insert(payload as any).select().single();
    if (error) throw error;
    return data as DbAgency;
  },
  update: async (id: string, patch: Partial<DbAgency>) => {
    const { data, error } = await supabase.from("agencies").update(patch as any).eq("id", id).select().single();
    if (error) throw error;
    return data as DbAgency;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("agencies").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- SUBSCRIPTIONS ----------
export const subscriptionsService = {
  list: async () => {
    const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbSubscription[];
  },
  upsert: async (payload: Partial<DbSubscription> & { agency_id: string }) => {
    const { data, error } = await supabase.from("subscriptions").upsert(payload as any, { onConflict: "agency_id" }).select().single();
    if (error) throw error;
    return data as DbSubscription;
  },
  update: async (id: string, patch: Partial<DbSubscription>) => {
    const { data, error } = await supabase.from("subscriptions").update(patch as any).eq("id", id).select().single();
    if (error) throw error;
    return data as DbSubscription;
  },
};

// ---------- HOSTS ----------
export const hostsService = {
  list: async () => {
    const { data, error } = await supabase.from("host_directory")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...row,
      id: row.id!,
      nickname: row.nickname ?? "",
      platform: (row.platform ?? "other") as DbHost["platform"],
      status: (row.status ?? "active") as DbHost["status"],
      live_hours: Number(row.live_hours ?? 0),
      gifts_total: Number(row.gifts_total ?? 0),
      earnings_total: Number(row.earnings_total ?? 0),
      score: Number(row.score ?? 0),
      created_at: row.created_at ?? "",
      updated_at: row.updated_at ?? "",
      manager: row.manager_name ? { name: row.manager_name } : null,
    })) as DbHost[];
  },
  create: async (payload: Partial<DbHost> & { agency_id: string; nickname: string }) => {
    const { data, error } = await supabase.from("hosts").insert(payload as any).select().single();
    if (error) throw error;
    return data as DbHost;
  },
  update: async (id: string, patch: Partial<DbHost>) => {
    const { data, error } = await supabase.from("hosts").update(patch as any).eq("id", id).select().single();
    if (error) throw error;
    return data as DbHost;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("hosts").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- MANAGERS ----------
export const managersService = {
  list: async () => {
    const { data, error } = await supabase.from("managers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbManager[];
  },
  create: async (payload: Partial<DbManager> & { agency_id: string; name: string }) => {
    const { data, error } = await supabase.from("managers").insert(payload as any).select().single();
    if (error) throw error;
    return data as DbManager;
  },
  update: async (id: string, patch: Partial<DbManager>) => {
    const { data, error } = await supabase.from("managers").update(patch as any).eq("id", id).select().single();
    if (error) throw error;
    return data as DbManager;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("managers").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- GOALS ----------
export const goalsService = {
  list: async () => {
    const { data, error } = await supabase.from("goals")
      .select("*, host:hosts(nickname)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbGoal[];
  },
  create: async (payload: Partial<DbGoal> & { agency_id: string; title: string; target: number }) => {
    const { data, error } = await supabase.from("goals").insert(payload as any).select().single();
    if (error) throw error;
    return data as DbGoal;
  },
  update: async (id: string, patch: Partial<DbGoal>) => {
    const { data, error } = await supabase.from("goals").update(patch as any).eq("id", id).select().single();
    if (error) throw error;
    return data as DbGoal;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- FINANCE ----------
export const financeService = {
  list: async () => {
    const { data, error } = await supabase.from("financial_transactions")
      .select("*").order("occurred_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbTransaction[];
  },
  create: async (payload: Partial<DbTransaction> & { agency_id: string; type: DbTransaction["type"]; amount: number }) => {
    const { data, error } = await supabase.from("financial_transactions").insert(payload as any).select().single();
    if (error) throw error;
    return data as DbTransaction;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("financial_transactions").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------- RANKINGS ----------
export const rankingsService = {
  latest: async (period: DbRanking["period"] = "monthly") => {
    const { data, error } = await supabase.from("rankings")
      .select("*, host:hosts(nickname, avatar_url, category)")
      .eq("period", period)
      .order("period_start", { ascending: false })
      .order("position", { ascending: true })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as DbRanking[];
  },
};

// ---------- NOTIFICATIONS ----------
export const notificationsService = {
  list: async () => {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbNotification[];
  },
  markRead: async (id: string) => {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) throw error;
  },
  markAllRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    if (error) throw error;
  },
};

// ---------- PROFILE ----------
export type DbProfile = {
  id: string; email: string | null; name: string | null; avatar_url: string | null;
  whatsapp: string | null; country: string | null; city: string | null;
  platform: string | null; platform_user_id: string | null;
  locale: string | null; livepulse_id: string | null; agency_id: string | null;
};

export const profileService = {
  get: async (id: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as DbProfile | null;
  },
  update: async (id: string, patch: Partial<DbProfile>) => {
    const { data, error } = await supabase.from("profiles").update(patch as never).eq("id", id).select().single();
    if (error) throw error;
    return data as DbProfile;
  },
  uploadAvatar: async (userId: string, file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    // Signed URL long-lived; bucket is private but any authenticated user can view.
    const { data: signed, error: signErr } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr) throw signErr;
    const url = signed.signedUrl;
    const { error: profErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    if (profErr) throw profErr;
    return url;
  },
  removeAvatar: async (userId: string) => {
    // Best-effort: remove all files under the user's folder.
    const { data: files } = await supabase.storage.from("avatars").list(userId);
    if (files && files.length) {
      await supabase.storage.from("avatars").remove(files.map((f) => `${userId}/${f.name}`));
    }
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    if (error) throw error;
  },
};

