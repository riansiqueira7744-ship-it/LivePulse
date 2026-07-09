export type Host = {
  id: string;
  nickname: string;
  avatar: string;
  category: "Beauty" | "Gaming" | "Music" | "Talk" | "Dance" | "Lifestyle";
  status: "online" | "offline" | "at-risk";
  starHost: boolean;
  earnings: number;
  hours: number;
  manager: string;
  meta: number;
  progress: number;
};

const avatars = (seed: string) =>
  `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

export const hosts: Host[] = ([
  { id: "LV-0421", nickname: "Ana Vitória", category: "Beauty", status: "online", starHost: true, earnings: 12840, hours: 128, manager: "Rafael Costa", meta: 15000, progress: 86 },
  { id: "LV-0388", nickname: "João Mendes", category: "Gaming", status: "at-risk", starHost: false, earnings: 4210, hours: 62, manager: "Marina Alves", meta: 10000, progress: 42 },
  { id: "LV-0512", nickname: "Camila Rocha", category: "Dance", status: "online", starHost: true, earnings: 18490, hours: 154, manager: "Rafael Costa", meta: 20000, progress: 92 },
  { id: "LV-0210", nickname: "Pedro Lins", category: "Music", status: "offline", starHost: false, earnings: 3120, hours: 48, manager: "Igor Martins", meta: 8000, progress: 39 },
  { id: "LV-0678", nickname: "Bianca Souza", category: "Lifestyle", status: "online", starHost: true, earnings: 22150, hours: 172, manager: "Marina Alves", meta: 25000, progress: 89 },
  { id: "LV-0334", nickname: "Lucas Prado", category: "Talk", status: "online", starHost: false, earnings: 6780, hours: 84, manager: "Igor Martins", meta: 10000, progress: 68 },
  { id: "LV-0741", nickname: "Renata Lima", category: "Beauty", status: "at-risk", starHost: false, earnings: 2890, hours: 38, manager: "Rafael Costa", meta: 8000, progress: 36 },
  { id: "LV-0819", nickname: "Marcos Vieira", category: "Gaming", status: "online", starHost: true, earnings: 15320, hours: 141, manager: "Igor Martins", meta: 18000, progress: 85 },
  { id: "LV-0902", nickname: "Julia Neves", category: "Dance", status: "online", starHost: false, earnings: 8940, hours: 96, manager: "Marina Alves", meta: 12000, progress: 74 },
  { id: "LV-0155", nickname: "Fernanda Reis", category: "Music", status: "offline", starHost: false, earnings: 1980, hours: 22, manager: "Rafael Costa", meta: 6000, progress: 33 },
  { id: "LV-0567", nickname: "Thiago Melo", category: "Talk", status: "online", starHost: true, earnings: 19870, hours: 166, manager: "Marina Alves", meta: 22000, progress: 90 },
  { id: "LV-0284", nickname: "Larissa Duarte", category: "Lifestyle", status: "online", starHost: false, earnings: 5410, hours: 71, manager: "Igor Martins", meta: 9000, progress: 60 },
] as Omit<Host, "avatar">[]).map((h) => ({ ...h, avatar: avatars(h.nickname) }));

export const managers = [
  { name: "Rafael Costa", avatar: avatars("Rafael Costa"), hosts: 5, revenue: 42840, growth: 18.4, target: 50000 },
  { name: "Marina Alves", avatar: avatars("Marina Alves"), hosts: 4, revenue: 68870, growth: 24.1, target: 65000 },
  { name: "Igor Martins", avatar: avatars("Igor Martins"), hosts: 4, revenue: 34960, growth: -3.2, target: 40000 },
  { name: "Beatriz Cunha", avatar: avatars("Beatriz Cunha"), hosts: 6, revenue: 51230, growth: 12.7, target: 55000 },
];

export const revenueSeries = Array.from({ length: 30 }).map((_, i) => ({
  day: `${i + 1}`,
  receita: Math.round(3200 + Math.sin(i / 3) * 800 + Math.random() * 1200 + i * 60),
  despesa: Math.round(1200 + Math.random() * 500 + i * 20),
  lucro: 0,
})).map((d) => ({ ...d, lucro: d.receita - d.despesa }));

export const categorySplit = [
  { name: "Beauty", value: 32, color: "oklch(0.72 0.19 305)" },
  { name: "Gaming", value: 24, color: "oklch(0.68 0.18 240)" },
  { name: "Dance", value: 18, color: "oklch(0.72 0.17 155)" },
  { name: "Music", value: 14, color: "oklch(0.78 0.16 75)" },
  { name: "Talk", value: 8, color: "oklch(0.65 0.22 25)" },
  { name: "Lifestyle", value: 4, color: "oklch(0.68 0.16 220)" },
];

export const payments = [
  { id: "PG-9812", host: "Camila Rocha", amount: 4890, date: "Hoje, 14:20", status: "Pago" },
  { id: "PG-9811", host: "Bianca Souza", amount: 5210, date: "Hoje, 12:04", status: "Pago" },
  { id: "PG-9810", host: "Ana Vitória", amount: 3140, date: "Ontem, 22:18", status: "Pago" },
  { id: "PG-9809", host: "Thiago Melo", amount: 4780, date: "Ontem, 19:50", status: "Processando" },
  { id: "PG-9808", host: "Marcos Vieira", amount: 3860, date: "Ontem, 17:12", status: "Pago" },
];

export const alerts = [
  { level: "success", title: "Meta mensal 78% atingida", desc: "Faltam 12 dias para o fechamento.", time: "há 2h" },
  { level: "warning", title: "3 hosts em risco de churn", desc: "Queda de performance nas últimas 2 semanas.", time: "há 4h" },
  { level: "info", title: "Novo cadastro aprovado", desc: "Larissa Duarte se juntou à equipe de Igor.", time: "há 6h" },
  { level: "danger", title: "Despesa acima do previsto", desc: "Categoria 'Equipamento' 22% acima da média.", time: "há 1d" },
];

export const activities = [
  { user: "Camila Rocha", action: "atingiu 90% da meta", time: "há 5min" },
  { user: "Rafael Costa", action: "adicionou 2 novos hosts", time: "há 22min" },
  { user: "Sistema", action: "gerou relatório semanal", time: "há 1h" },
  { user: "Bianca Souza", action: "recebeu badge Star Host", time: "há 3h" },
];

export const feed = [
  { author: "Rafael Costa", role: "Gerente", avatar: avatars("Rafael Costa"), time: "há 15 min", content: "Time, atingimos R$ 42k este mês! Vamos fechar a semana com força total. 🚀", likes: 24, comments: 8 },
  { author: "Ana Vitória", role: "Star Host", avatar: avatars("Ana Vitória"), time: "há 1h", content: "Dica: manter o horário fixo aumentou meus ganhos em 38% no último mês.", likes: 61, comments: 19 },
  { author: "Bianca Souza", role: "Star Host", avatar: avatars("Bianca Souza"), time: "há 3h", content: "Alguém topa uma live conjunta sexta 21h? Vou puxar um bate-papo sobre metas.", likes: 42, comments: 27 },
];

export const aiInsights = [
  { type: "growth", title: "Faturamento cresceu 14% esta semana", detail: "Impulsionado pelas categorias Beauty e Dance. Sugerimos aumentar investimento em Beauty em +12%.", confidence: 92 },
  { type: "risk", title: "3 hosts com sinais claros de churn", detail: "João, Renata e Fernanda estão 30%+ abaixo do baseline. Recomendo uma call de retenção esta semana.", confidence: 87 },
  { type: "opportunity", title: "Sua melhor janela é entre 20h e 23h", detail: "78% da receita acontece neste intervalo. Hosts offline nesse período estão perdendo em média R$ 480/dia.", confidence: 95 },
  { type: "goal", title: "Ana Vitória vai bater a meta em 3 dias", detail: "No ritmo atual, atingirá R$ 15k até quinta. Considere destravar bônus antecipado.", confidence: 89 },
];
