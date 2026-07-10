import type { Achievement, Badge, LevelInfo } from "@/types";

export const mockBadges: Badge[] = [
  { id: "bd_star", code: "STAR_HOST", name: "Host Destaque", emoji: "🔥", description: "Top 10% em performance no mês", rarity: "epic" },
  { id: "bd_top1", code: "TOP1_WEEK", name: "Top 1 Semana", emoji: "🏆", description: "Primeiro lugar do ranking semanal", rarity: "legendary" },
  { id: "bd_100h", code: "H100", name: "100 Horas", emoji: "💎", description: "Atingiu 100h de live no mês", rarity: "rare" },
  { id: "bd_king", code: "KING", name: "Rei da Live", emoji: "👑", description: "3 meses seguidos no Top 3", rarity: "legendary" },
  { id: "bd_rookie", code: "ROOKIE", name: "Estreante", emoji: "🌱", description: "Primeira semana completa", rarity: "common" },
  { id: "bd_streak", code: "STREAK", name: "Consistência", emoji: "⚡", description: "30 dias sem faltar", rarity: "rare" },
];

export const mockAchievements: Achievement[] = [
  { id: "ach_1", user_id: "usr_host_1", badge_id: "bd_star", unlocked_at: new Date(Date.now()-86400_000*3).toISOString() },
  { id: "ach_2", user_id: "usr_host_1", badge_id: "bd_100h", unlocked_at: new Date(Date.now()-86400_000*14).toISOString() },
  { id: "ach_3", user_id: "usr_host_1", badge_id: "bd_streak", unlocked_at: new Date(Date.now()-86400_000*30).toISOString() },
];

export const mockLevels: LevelInfo[] = [
  { level: 1, name: "Estreante",  xp_required: 0,     perks: ["Perfil básico"] },
  { level: 2, name: "Consistente", xp_required: 500,   perks: ["Moldura bronze"] },
  { level: 3, name: "Destaque",    xp_required: 1500,  perks: ["Badge exclusiva", "Emojis"] },
  { level: 4, name: "Elite",       xp_required: 3500,  perks: ["Moldura prata", "Título"] },
  { level: 5, name: "Lenda",       xp_required: 7000,  perks: ["Moldura ouro", "Efeitos"] },
  { level: 6, name: "Ícone",       xp_required: 15000, perks: ["Perfil premium", "LiveCoins bônus"] },
];
