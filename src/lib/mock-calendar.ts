import type { CalendarEvent } from "@/types";

const AGC = "agc_livepulse_studio";
const today = new Date();
const at = (d: number, h: number, m = 0) => {
  const dt = new Date(today);
  dt.setDate(today.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

export const mockEvents: CalendarEvent[] = [
  { id: "ev_1", agency_id: AGC, title: "Reunião semanal — Gerentes", kind: "meeting",  starts_at: at(0, 10), ends_at: at(0, 11), attendees: ["usr_owner_1","usr_mgr_1"], color: "primary" },
  { id: "ev_2", agency_id: AGC, title: "Meta mensal fecha",           kind: "goal",     starts_at: at(3, 23, 59), ends_at: at(3, 23, 59), attendees: [], color: "chart-2" },
  { id: "ev_3", agency_id: AGC, title: "Treinamento — Retenção 2.0",   kind: "training", starts_at: at(1, 15), ends_at: at(1, 17), attendees: ["usr_host_1"], color: "success" },
  { id: "ev_4", agency_id: AGC, title: "Pagamento comissões",          kind: "payment",  starts_at: at(5, 9),  ends_at: at(5, 9),  attendees: [], color: "warning" },
  { id: "ev_5", agency_id: AGC, title: "Live especial — Aniversário",  kind: "event",    starts_at: at(2, 20), ends_at: at(2, 23), attendees: ["usr_host_1"], color: "chart-3" },
];
