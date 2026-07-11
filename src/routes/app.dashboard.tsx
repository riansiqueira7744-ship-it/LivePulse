import { createFileRoute } from "@tanstack/react-router";
import { Avatar } from "@/components/avatar";
import { useMemo } from "react";
import { Wallet, TrendingUp, Users, Target } from "lucide-react";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { useHosts, useGoals, useFinance } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Livepulse" }] }),
});

function Dashboard() {
  const { user, currentAgency } = useAuth();
  const { data: hosts = [] } = useHosts();
  const { data: goals = [] } = useGoals();
  const { data: txs = [] } = useFinance();

  const revenue = useMemo(() => txs.filter((t) => t.type === "revenue").reduce((s, t) => s + Number(t.amount), 0), [txs]);
  const outflow = useMemo(() => txs.filter((t) => t.type !== "revenue").reduce((s, t) => s + Number(t.amount), 0), [txs]);
  const profit = revenue - outflow;
  const activeHosts = hosts.filter((h) => h.status === "active").length;
  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + Math.min(100, Math.round((Number(g.progress) / Math.max(1, Number(g.target))) * 100)), 0) / goals.length) : 0;
  const topHosts = [...hosts].sort((a, b) => Number(b.earnings_total) - Number(a.earnings_total)).slice(0, 5);

  const canSeeFinance = user?.role !== "manager" && user?.role !== "host";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${currentAgency?.name ?? "Agência"} · ${hosts.length} hosts · ${activeHosts} ativos`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canSeeFinance ? (
          <>
            <StatCard gradient label="Receita" value={currency(revenue)} icon={<Wallet className="h-4 w-4" />} positive delta="acumulado" />
            <StatCard label="Lucro líquido" value={currency(profit)} icon={<TrendingUp className="h-4 w-4" />} positive delta="mês" />
          </>
        ) : (
          <>
            <StatCard gradient label="Meus ganhos" value={currency(hosts.reduce((s, h) => s + Number(h.earnings_total), 0))} icon={<Wallet className="h-4 w-4" />} positive delta="mês" />
            <StatCard label="Horas do mês" value={`${hosts.reduce((s, h) => s + Number(h.live_hours), 0)}h`} icon={<TrendingUp className="h-4 w-4" />} positive delta="acumulado" />
          </>
        )}
        <StatCard label="Hosts ativos" value={String(activeHosts)} icon={<Users className="h-4 w-4" />} positive delta="online" />
        <StatCard label="Progresso médio das metas" value={`${avgProgress}%`} icon={<Target className="h-4 w-4" />} positive delta="ativas" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Top Hosts" action={<a className="text-xs text-primary" href="/app/hosts">Ver todos</a>}>
          {topHosts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Nenhum host cadastrado ainda.</div>
          ) : (
            <div className="space-y-2">
              {topHosts.map((h, i) => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3 transition hover:bg-background/60">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">#{i + 1}</div>
                  <img src={h.avatar_url ?? `https://api.dicebear.com/9.x/glass/svg?seed=${h.id}`} className="h-9 w-9 shrink-0 rounded-full" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{h.nickname}</div>
                    <div className="truncate text-xs text-muted-foreground">{h.category ?? "—"} · {Number(h.live_hours)}h</div>
                  </div>
                  <div className="w-24 shrink-0 text-right font-display text-sm font-semibold">{currency(Number(h.earnings_total))}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Metas em andamento">
          {goals.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Sem metas ativas.</div>
          ) : (
            <div className="space-y-2.5">
              {goals.slice(0, 6).map((g) => {
                const pct = Math.min(100, Math.round((Number(g.progress) / Math.max(1, Number(g.target))) * 100));
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-medium">{g.title}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
