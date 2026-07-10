import type { LiveCoinsBalance, LiveCoinsTx } from "@/types";

export const mockBalances: Record<string, LiveCoinsBalance> = {
  usr_owner_1: { user_id: "usr_owner_1", balance: 18420, lifetime: 42890 },
  usr_mgr_1:   { user_id: "usr_mgr_1",   balance: 6240,  lifetime: 12340 },
  usr_host_1:  { user_id: "usr_host_1",  balance: 3480,  lifetime: 8940 },
};

export const mockLiveCoinsTx: LiveCoinsTx[] = [
  { id: "lc_1", user_id: "usr_host_1", type: "reward",   amount: 500,  description: "Meta semanal atingida",       created_at: new Date(Date.now()-86400_000*2).toISOString() },
  { id: "lc_2", user_id: "usr_host_1", type: "spend",    amount: -200, description: "Moldura Neon comprada",        created_at: new Date(Date.now()-86400_000*3).toISOString() },
  { id: "lc_3", user_id: "usr_host_1", type: "purchase", amount: 2000, description: "Pacote Premium (R$ 49,90)",   created_at: new Date(Date.now()-86400_000*7).toISOString() },
  { id: "lc_4", user_id: "usr_host_1", type: "gift",     amount: 300,  description: "Presente de Carlos Almeida", created_at: new Date(Date.now()-86400_000*10).toISOString() },
  { id: "lc_5", user_id: "usr_host_1", type: "reward",   amount: 800,  description: "Top 5 da temporada",         created_at: new Date(Date.now()-86400_000*14).toISOString() },
];

export const mockLiveCoinsPackages = [
  { id: "pk_1", coins: 500,   price: 14.90, bonus: 0,   featured: false },
  { id: "pk_2", coins: 2000,  price: 49.90, bonus: 200, featured: true },
  { id: "pk_3", coins: 5000,  price: 99.90, bonus: 800, featured: false },
  { id: "pk_4", coins: 12000, price: 199.90, bonus: 2400, featured: false },
];
