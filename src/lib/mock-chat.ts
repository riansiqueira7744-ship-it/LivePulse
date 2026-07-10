import type { ChatChannel, ChatMessage } from "@/types";

const AGC = "agc_livepulse_studio";

export const mockChannels: ChatChannel[] = [
  { id: "ch_general", agency_id: AGC, kind: "agency", name: "# geral", members: ["usr_owner_1","usr_mgr_1","usr_host_1"], last_message_at: new Date().toISOString(), unread: 3 },
  { id: "ch_hosts", agency_id: AGC, kind: "agency", name: "# hosts", members: ["usr_owner_1","usr_host_1"], last_message_at: new Date(Date.now()-3600_000).toISOString(), unread: 0 },
  { id: "ch_team_rafael", agency_id: AGC, kind: "team", name: "Time Rafael", members: ["usr_mgr_1","usr_host_1"], last_message_at: new Date(Date.now()-7200_000).toISOString(), unread: 1 },
  { id: "ch_dm_owner_rafael", agency_id: AGC, kind: "dm", name: "Rafael Costa", members: ["usr_owner_1","usr_mgr_1"], last_message_at: new Date(Date.now()-1800_000).toISOString(), unread: 0 },
  { id: "ch_support_1", agency_id: null, kind: "support", name: "Suporte Livepulse", members: ["usr_super_1","usr_owner_1"], last_message_at: new Date(Date.now()-900_000).toISOString(), unread: 2 },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  ch_general: [
    { id: "m1", channel_id: "ch_general", author_id: "usr_owner_1", author_name: "Carlos Almeida", author_avatar: "https://api.dicebear.com/9.x/glass/svg?seed=owner", content: "Bom dia time! 🚀 Semana começa forte, foco nas metas.", attachments: [], pinned: true, created_at: new Date(Date.now()-86400_000).toISOString() },
    { id: "m2", channel_id: "ch_general", author_id: "usr_mgr_1", author_name: "Rafael Costa", author_avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Rafael%20Costa", content: "Bora! Time A já tá com 68% da meta semanal.", attachments: [], pinned: false, created_at: new Date(Date.now()-3600_000*4).toISOString() },
    { id: "m3", channel_id: "ch_general", author_id: "usr_host_1", author_name: "Ana Vitória", author_avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Ana%20Vit%C3%B3ria", content: "Vou entrar 20h hoje, quem topa cross live?", attachments: [], pinned: false, created_at: new Date(Date.now()-3600_000).toISOString() },
  ],
  ch_support_1: [
    { id: "s1", channel_id: "ch_support_1", author_id: "usr_owner_1", author_name: "Carlos Almeida", author_avatar: "https://api.dicebear.com/9.x/glass/svg?seed=owner", content: "Podemos habilitar mais um seat no plano Scale?", attachments: [], pinned: false, created_at: new Date(Date.now()-3600_000*2).toISOString() },
    { id: "s2", channel_id: "ch_support_1", author_id: "usr_super_1", author_name: "Suporte Livepulse", author_avatar: "https://api.dicebear.com/9.x/glass/svg?seed=super", content: "Claro Carlos, já liberado. Qualquer coisa é só chamar 🙌", attachments: [], pinned: false, created_at: new Date(Date.now()-900_000).toISOString() },
  ],
};
