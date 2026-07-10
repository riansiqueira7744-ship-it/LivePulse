import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { useScopedManagers } from "@/lib/scoped-data";
import { useAuth } from "@/lib/auth-context";
import { TrendingUp, TrendingDown, Users, Plus } from "lucide-react";

export const Route = createFileRoute("/app/managers")({
  component: ManagersPage,
  head: () => ({ meta: [{ title: "Gerentes — Livepulse" }] }),
});

function ManagersPage() {
  const { can, user, currentAgency } = useAuth();
  const managers = useScopedManagers();
  const desc = user?.role === "manager" ? "Seu resumo pessoal" : `${currentAgency?.name ?? "Agência"} · ${managers.length} gerentes`;
  return (
    <div>
      <PageHeader
        title="Gerentes"
        description={desc}
        actions={can("managers:manage") ? (
          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="mr-1 inline h-3.5 w-3.5" /> Novo gerente</button>
        ) : null}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {managers.map((m) => {
          const pct = Math.min(100, Math.round((m.revenue / m.target) * 100));
          const positive = m.growth >= 0;
          return (
            <Card key={m.name}>
              <div className="flex items-center gap-4">
                <img src={m.avatar} className="h-14 w-14 rounded-xl" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">Gerente · {m.hosts} hosts vinculados</div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                  {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {positive ? "+" : ""}{m.growth}%
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Receita</div>
                  <div className="mt-1 font-display text-lg font-semibold">{currency(m.revenue)}</div>
                </div>
                <div className="rounded-xl bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Meta</div>
                  <div className="mt-1 font-display text-lg font-semibold">{currency(m.target)}</div>
                </div>
                <div className="rounded-xl bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Progresso</div>
                  <div className="mt-1 font-display text-lg font-semibold">{pct}%</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Meta mensal</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium hover:bg-background/40">
                <Users className="h-3.5 w-3.5" /> Ver equipe
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
