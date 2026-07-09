import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, Users, Target, Activity, AlertTriangle,
  CheckCircle2, Info, XCircle, Sparkles, ArrowRight,
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { hosts, revenueSeries, categorySplit, payments, alerts, activities } from "@/lib/mock-data";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Livepulse" }] }),
});

const alertIcons: Record<string, any> = {
  success: CheckCircle2, warning: AlertTriangle, info: Info, danger: XCircle,
};
const alertColors: Record<string, string> = {
  success: "text-success bg-success/10", warning: "text-warning bg-warning/10",
  info: "text-chart-2 bg-chart-2/10", danger: "text-destructive bg-destructive/10",
};

function Dashboard() {
  const topHosts = [...hosts].sort((a,b)=>b.earnings-a.earnings).slice(0,5);
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da agência · Novembro 2026"
        actions={
          <>
            <button className="hidden rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs md:block">Últimos 30 dias</button>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Exportar</button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard gradient label="Receita do mês" value={currency(197840)} delta="+18.4%" deltaLabel="vs. mês anterior" positive icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Lucro" value={currency(84210)} delta="+22.1%" deltaLabel="margem 42.6%" positive icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Hosts ativos" value="48" delta="+3" deltaLabel="novos esta semana" positive icon={<Users className="h-4 w-4" />} />
        <StatCard label="Meta mensal" value="78%" delta="12d" deltaLabel="para o fechamento" positive icon={<Target className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Receita vs. Despesa" action={<span className="text-xs text-muted-foreground">Diário · R$</span>}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.19 305)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.19 305)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.18 240)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.68 0.18 240)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v/1000}k`} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.018 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="receita" stroke="oklch(0.72 0.19 305)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="despesa" stroke="oklch(0.68 0.18 240)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribuição por categoria">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySplit} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none">
                  {categorySplit.map((c,i)=><Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.19 0.018 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {categorySplit.map((c)=>(
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-medium text-muted-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Top Hosts do mês" className="lg:col-span-2" action={<a className="text-xs text-primary" href="/app/hosts">Ver todos</a>}>
          <div className="space-y-2">
            {topHosts.map((h, i) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3 transition hover:bg-background/60">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">#{i+1}</div>
                <img src={h.avatar} className="h-9 w-9 shrink-0 rounded-full" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{h.nickname}</span>
                    {h.starHost && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-warning">Star</span>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{h.category} · {h.hours}h · {h.manager}</div>
                </div>
                <div className="hidden w-32 sm:block">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2" style={{ width: `${h.progress}%` }} />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-muted-foreground">{h.progress}% da meta</div>
                </div>
                <div className="w-24 shrink-0 text-right font-display text-sm font-semibold">{currency(h.earnings)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Alertas inteligentes" action={<Sparkles className="h-3.5 w-3.5 text-primary" />}>
          <div className="space-y-2">
            {alerts.map((a, i) => {
              const Icon = alertIcons[a.level];
              return (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3">
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${alertColors[a.level]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{a.desc}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground/70">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Últimos pagamentos" className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">ID</th>
                  <th className="px-4 py-2.5 font-medium">Host</th>
                  <th className="px-4 py-2.5 font-medium">Data</th>
                  <th className="px-4 py-2.5 text-right font-medium">Valor</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((p)=>(
                  <tr key={p.id} className="transition hover:bg-background/40">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.host}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-4 py-3 text-right font-semibold">{currency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${p.status === "Pago" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Atividade recente" action={<Activity className="h-3.5 w-3.5 text-muted-foreground" />}>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{a.user}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>
                  <div className="text-[10.5px] text-muted-foreground/70">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-xs text-muted-foreground hover:bg-background/40">
            Ver linha do tempo <ArrowRight className="h-3 w-3" />
          </button>
        </Card>
      </div>
    </div>
  );
}
