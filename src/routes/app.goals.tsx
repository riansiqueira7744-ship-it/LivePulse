import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { useScopedHosts } from "@/lib/scoped-data";
import { useAuth } from "@/lib/auth-context";
import { Target, TrendingUp, Trophy } from "lucide-react";

export const Route = createFileRoute("/app/goals")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "Metas — Livepulse" }] }),
});

function GoalsPage() {
  const { can, user, currentAgency } = useAuth();
  const hosts = useScopedHosts();
  const agencyTarget = user?.role === "host" ? (hosts[0]?.meta ?? 15000) : 250000;
  const current = user?.role === "host" ? (hosts[0]?.earnings ?? 0) : 197840;
  const pct = Math.min(100, Math.round((current / agencyTarget) * 100));
  const desc = user?.role === "host" ? "Sua meta pessoal · Novembro" : `${currentAgency?.name ?? "Agência"} · Progresso por host e gerente`;
  return (
    <div>
      <PageHeader
        title="Metas"
        description={desc}
        actions={can("goals:manage") ? (
          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Nova meta</button>
        ) : null}
      />


      <Card className="overflow-hidden">
        <div className="relative">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary">Meta da agência · Novembro</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-5xl font-semibold">{currency(current)}</span>
                <span className="text-muted-foreground">/ {currency(agencyTarget)}</span>
              </div>
              <div className="mt-4">
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div className="relative h-full rounded-full bg-gradient-to-r from-primary to-chart-2 shadow-glow" style={{ width: `${pct}%` }}>
                    <div className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{pct}% concluído</span>
                  <span>Faltam 12 dias · {currency(agencyTarget - current)}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-background/40 p-3 text-center">
                <Trophy className="mx-auto h-4 w-4 text-warning" />
                <div className="mt-1.5 font-display text-lg font-semibold">12</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Metas atingidas</div>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3 text-center">
                <Target className="mx-auto h-4 w-4 text-primary" />
                <div className="mt-1.5 font-display text-lg font-semibold">28</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Em andamento</div>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-3 text-center">
                <TrendingUp className="mx-auto h-4 w-4 text-success" />
                <div className="mt-1.5 font-display text-lg font-semibold">78%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Taxa de sucesso</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {hosts.slice(0, 8).map((h) => (
          <div key={h.id} className="rounded-2xl border border-border bg-card/60 p-4 transition hover:border-primary/30">
            <div className="flex items-center gap-3">
              <img src={h.avatar} className="h-10 w-10 rounded-full" alt="" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{h.nickname}</div>
                <div className="text-xs text-muted-foreground">{h.category} · {h.manager}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-semibold">{h.progress}%</div>
                <div className="text-[10px] text-muted-foreground">{currency(h.earnings)} / {currency(h.meta)}</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${h.progress > 70 ? "bg-gradient-to-r from-primary to-chart-2" : h.progress > 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${h.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
