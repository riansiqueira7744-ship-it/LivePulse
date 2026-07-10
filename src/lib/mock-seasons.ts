import type { Season } from "@/types";

export const mockSeasons: Season[] = [
  {
    id: "sn_1",
    name: "Temporada 1 · Ignição",
    starts_at: "2026-01-01T00:00:00Z",
    ends_at:   "2026-03-31T23:59:59Z",
    status: "ended",
    rewards: ["Badge Ignição exclusivo", "5.000 LiveCoins", "Destaque no ranking"],
    participants: 128,
  },
  {
    id: "sn_2",
    name: "Temporada 2 · Aurora",
    starts_at: "2026-04-01T00:00:00Z",
    ends_at:   "2026-06-30T23:59:59Z",
    status: "ended",
    rewards: ["Moldura Aurora", "8.000 LiveCoins"],
    participants: 156,
  },
  {
    id: "sn_3",
    name: "Temporada 3 · Prisma",
    starts_at: "2026-07-01T00:00:00Z",
    ends_at:   "2026-09-30T23:59:59Z",
    status: "active",
    rewards: ["Moldura Prisma animada", "12.000 LiveCoins", "Título Lenda"],
    participants: 182,
  },
  {
    id: "sn_4",
    name: "Temporada 4 · Nova",
    starts_at: "2026-10-01T00:00:00Z",
    ends_at:   "2026-12-31T23:59:59Z",
    status: "upcoming",
    rewards: ["A ser anunciado"],
    participants: 0,
  },
];
