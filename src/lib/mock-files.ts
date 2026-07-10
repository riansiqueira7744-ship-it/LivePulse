import type { FileAsset } from "@/types";

const AGC = "agc_livepulse_studio";

export const mockFiles: FileAsset[] = [
  { id: "fl_1", agency_id: AGC, name: "Playbook Livepulse.pdf", kind: "pdf", size_bytes: 2_840_000, folder: "Treinamentos", uploaded_by: "usr_owner_1", uploaded_at: new Date(Date.now()-86400_000*7).toISOString(), url: "#" },
  { id: "fl_2", agency_id: AGC, name: "Onboarding Hosts.pdf", kind: "pdf", size_bytes: 1_120_000, folder: "Treinamentos", uploaded_by: "usr_owner_1", uploaded_at: new Date(Date.now()-86400_000*14).toISOString(), url: "#" },
  { id: "fl_3", agency_id: AGC, name: "Aula 01 — Retenção.mp4", kind: "video", size_bytes: 128_400_000, folder: "Aulas", uploaded_by: "usr_mgr_1", uploaded_at: new Date(Date.now()-86400_000*2).toISOString(), url: "#" },
  { id: "fl_4", agency_id: AGC, name: "Contrato Padrão.docx", kind: "doc", size_bytes: 220_000, folder: "Contratos", uploaded_by: "usr_owner_1", uploaded_at: new Date(Date.now()-86400_000*30).toISOString(), url: "#" },
  { id: "fl_5", agency_id: AGC, name: "Identidade Visual.zip", kind: "other", size_bytes: 18_400_000, folder: "Marca", uploaded_by: "usr_owner_1", uploaded_at: new Date(Date.now()-86400_000*60).toISOString(), url: "#" },
  { id: "fl_6", agency_id: AGC, name: "Post Instagram 01.png", kind: "image", size_bytes: 840_000, folder: "Marca", uploaded_by: "usr_mgr_1", uploaded_at: new Date(Date.now()-86400_000).toISOString(), url: "#" },
];
