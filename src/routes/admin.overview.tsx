import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { mockAgencies, mockSubscriptions } from "@/lib/mock-agencies";
import { mockBroadcasts } from "@/lib/mock-broadcasts";
import { mockBalances } from "@/lib/mock-livecoins";
import { AGENCY_STATUS_LABELS, PLAN_LABELS } from "@/lib/constants";
import { Building2, Users, TrendingUp, CreditCard, Coins, LifeBuoy, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/overview")({
  component: OverviewPage,
  head: () => ({ meta: [{ title: "Visão Geral — Super Admin · Livepulse" }] }),
});

const growthSeries = Array.from({ length: 12 }).map((_, i) => {
  const base = 2400 + i * 320;
  return {
    month: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i],
    mrr: Math.round(base + Math.sin(i / 2) * 240),
    agencias: 8 + i,
  };
});

const supportTickets = [
  { id: "tk_1", agency: "Neon Stars", subject: "Como habilito Sign in with Apple?", status: "open", priority: "normal", opened: "há 2h" },
  { id: "tk_2", agency: "Prisma Live", subject: "Fatura de julho não chegou", status: "open", priority: "high", opened: "há 5h" },
  { id: "tk_3", agency: "Aurora Creators", subject: "Reativar conta suspensa", status: "open", priority: "high", opened: "há 1d" },
  { id: "tk_4", agency: "Horizon Media", subject: "Aumento de seats no Enterprise", status: "open", priority: "normal", opened: "há 2d" },
];

const alerts = [
  { level: "danger",  icon: AlertTriangle, title: "Aurora Creators está suspensa",        detail: "Falha em 2 tentativas de cobrança." },
  { level: "warning", icon: AlertTriangle, title: "Prisma Live termina o trial em 6 dias", detail: "Enviar oferta de upgrade." },
  { level: "success", icon: CheckCircle2,  title: "MRR cresceu 12,4% no mês",              detail: "Impulsionado por Horizon Media." },
];

const activities = [
  { who: "Horizon Media",   what: "fez upgrade para Enterprise", when: "há 8min" },
  { who: "Neon Stars",      what: "adicionou 4 novos hosts",     when: "há 22min" },
  { who: "Livepulse Studio", what: "fatura paga (R$ 1.490)",     when: "há 1h" },
  { who: "Prisma Live",     what: "iniciou trial",               when: "há 2h" },
  { who: "Aurora Creators", what: "conta suspensa por inadimplência", when: "há 5h" },
];

function OverviewPage() {
  const total = mockAgencies.length;
  const active = mockAgencies.filter((a) => a.status === "active").length;
  const trial = mockAgencies.filter((a) => a.status === "trial").length;
  const suspended = mockAgencies.filter((a) => a.status === "suspended").length;
  const totalUsers = mockAgencies.reduce((acc, a) => acc + a.hosts_count + a.managers_count, 0);
  const mrr = mockAgencies.reduce((acc, a) => acc + a.mrr, 0);
  const liveCoinsUsage = Object.values(mockBalances).reduce((acc, b) => acc + b.lifetime, 0);
  const openTickets = supportTickets.filter((t) => t.status === "open").length;
  const scheduledBroadcasts = mockBroadcasts.filter((b) => b.status === "scheduled").length;

  const planSplit = ["starter","growth","scale","enterprise"].map((p) => ({
    name: PLAN_LABELS[p as keyof typeof PLAN_LABELS],
    value: mockAgencies.filter((a) => a.plan === p).length,
    color: p === "starter" ? "oklch(0.68 0.16 220)" : p === "growth" ? "oklch(0.72 0.17 155)" : p === "scale" ? "oklch(0.72 0.19 305)" : "oklch(0.78 0.16 75)",
  })).filter((p) => p.value > 0);

  return (
    <div>
      <PageHeader
        title="Visão Geral"
        description="Métricas globais da plataforma Livepulse"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-warning">
            <Crown /> Super Admin
          </span>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Agências" value={String(total)} icon={<Building2 className="h-4 w-4" />} gradient delta="+2" deltaLabel="este mês" positive />
        <StatCard label="Ativas" value={String(active)} icon={<CheckCircle2 className="h-4 w-4" />} delta="+1" positive deltaLabel="vs mês passado" />
        <StatCard label="Em teste" value={String(trial)} icon={<Activity className="h-4 w-4" />} delta="+1" positive deltaLabel="novos trials" />
        <StatCard label="Suspensas" value={String(suspended)} icon={<AlertTriangle className="h-4 w-4" />} delta="-0" positive deltaLabel="churn contido" />
        <StatCard label="Usuários totais" value={totalUsers.toLocaleString("pt-BR")} icon={<Users className="h-4 w-4" />} delta="+18%" positive deltaLabel="MoM" />
        <StatCard label="Receita mensal (MRR)" value={currency(mrr)} icon={<TrendingUp className="h-4 w-4" />} delta="+12,4%" positive gradient />
        <StatCard label="Uso de LiveCoins" value={liveCoinsUsage.toLocaleString("pt-BR")} icon={<Coins className="h-4 w-4" />} delta="+34%" positive />
        <StatCard label="Tickets abertos" value={String(openTickets)} icon={<LifeBuoy className="h-4 w-4" />} delta={`${scheduledBroadcasts} comunicados`} positive deltaLabel="agendados" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title="Crescimento & MRR" action={<span className="text-xs text-muted-foreground">Últimos 12 meses</span>}>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={growthSeries}>
                <defs>
                  <linearGradient id="admMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.19 305)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.19 305)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.28 0.02 260 / .4)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "oklch(0.65 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.65 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(0.28 0.02 260)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="mrr" stroke="oklch(0.72 0.19 305)" fill="url(#admMrr)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Assinaturas por plano">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={planSplit} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {planSplit.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(0.28 0.02 260)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {planSplit.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</div>
                <span className="font-semibold">{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Assinaturas recentes" action={<a href="/admin/subscriptions" className="text-xs text-primary hover:underline">Ver todas</a>}>
          <div className="divide-y divide-border">
            {mockSubscriptions.slice(0, 5).map((s) => {
              const agency = mockAgencies.find((a) => a.id === s.agency_id)!;
              return (
                <div key={s.id} className="flex items-center gap-3 py-3">
                  <img src={agency.logo_url ?? ""} alt="" className="h-9 w-9 rounded-lg border border-border" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{agency.name}</div>
                    <div className="text-xs text-muted-foreground">{PLAN_LABELS[s.plan]} · {currency(s.price_monthly)}/mês</div>
                  </div>
                  <span className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    s.status === "active" ? "bg-success/15 text-success"
                    : s.status === "trial" ? "bg-primary/15 text-primary"
                    : s.status === "suspended" ? "bg-warning/15 text-warning"
                    : "bg-destructive/15 text-destructive"
                  )}>{AGENCY_STATUS_LABELS[s.status]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Alertas importantes">
          <div className="space-y-2">
            {alerts.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    a.level === "danger" ? "bg-destructive/15 text-destructive"
                    : a.level === "warning" ? "bg-warning/15 text-warning"
                    : "bg-success/15 text-success"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Tickets de suporte abertos">
          <div className="divide-y divide-border">
            {supportTickets.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className={cn("h-2 w-2 shrink-0 rounded-full", t.priority === "high" ? "bg-destructive" : "bg-primary")} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.subject}</div>
                  <div className="text-xs text-muted-foreground">{t.agency} · aberto {t.opened}</div>
                </div>
                <a href="/admin/support" className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-card">Abrir</a>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Atividades recentes">
          <div className="space-y-2.5">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-semibold">{a.who}</span>
                <span className="text-muted-foreground">{a.what}</span>
                <span className="ml-auto text-xs text-muted-foreground">{a.when}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Crown() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M12 3l3 5 5-3-2 11H6L4 5l5 3 3-5z" />
    </svg>
  );
}
