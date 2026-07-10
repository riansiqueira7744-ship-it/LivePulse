import type { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  { id: "ntf_1", level: "success", title: "Meta mensal 78% atingida", description: "Faltam 12 dias para o fechamento do ciclo.", read: false, href: "/app/goals", created_at: "2026-07-10T12:00:00Z" },
  { id: "ntf_2", level: "warning", title: "3 hosts em risco de churn", description: "Queda de performance nas últimas 2 semanas.", read: false, href: "/app/hosts", created_at: "2026-07-10T10:20:00Z" },
  { id: "ntf_3", level: "info", title: "Novo cadastro aprovado", description: "Larissa Duarte se juntou à equipe de Igor.", read: false, href: "/app/hosts", created_at: "2026-07-10T08:12:00Z" },
  { id: "ntf_4", level: "danger", title: "Despesa acima do previsto", description: "Categoria 'Equipamento' 22% acima da média.", read: true, href: "/app/finance", created_at: "2026-07-09T21:40:00Z" },
  { id: "ntf_5", level: "success", title: "Pagamento processado", description: "Comissões de junho liberadas para 12 gerentes.", read: true, href: "/app/commissions", created_at: "2026-07-09T15:03:00Z" },
  { id: "ntf_6", level: "info", title: "Relatório semanal disponível", description: "Snapshot completo das últimas 7 datas.", read: true, href: "/app/reports", created_at: "2026-07-08T09:00:00Z" },
];
