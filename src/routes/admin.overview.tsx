import { createFileRoute } from "@tanstack/react-router";
import { Avatar } from "@/components/avatar";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { useAgencies, useSubscriptions } from "@/hooks/use-data";
import { AGENCY_STATUS_LABELS, PLAN_LABELS } from "@/lib/constants";
import { Building2, Users, TrendingUp, CreditCard, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/overview")({
  component: OverviewPage,
  head: () => ({ meta: [{ title: "Visão Geral — Super Admin · Livepulse" }] }),
});

function OverviewPage() {
  const { data: agencies = [] } = useAgencies();
  const { data: subs = [] } = useSubscriptions();

  const total = agencies.length;
  const active = agencies.filter((a) => a.status === "active").length;
  const trial = agencies.filter((a) => a.status === "trial").length;
  const suspended = agencies.filter((a) => a.status === "suspended").length;
  const totalUsers = agencies.reduce((acc, a) => acc + a.hosts_count + a.managers_count, 0);
  const mrr = subs.filter((s) => s.status === "active").reduce((acc, s) => acc + Number(s.price_monthly), 0);

  return (
    <div>
      <PageHeader title="Visão Geral" description="Métricas globais da plataforma Livepulse" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Agências" value={String(total)} icon={<Building2 className="h-4 w-4" />} gradient positive delta="total" />
        <StatCard label="Ativas" value={String(active)} icon={<CheckCircle2 className="h-4 w-4" />} positive delta="em produção" />
        <StatCard label="Em teste" value={String(trial)} icon={<Activity className="h-4 w-4" />} positive delta="trials abertos" />
        <StatCard label="Suspensas" value={String(suspended)} icon={<AlertTriangle className="h-4 w-4" />} positive delta="alertas" />
        <StatCard label="Usuários totais" value={totalUsers.toLocaleString("pt-BR")} icon={<Users className="h-4 w-4" />} positive delta="hosts + gerentes" />
        <StatCard label="Receita mensal (MRR)" value={currency(mrr)} icon={<TrendingUp className="h-4 w-4" />} positive gradient delta="ativas" />
        <StatCard label="Assinaturas" value={String(subs.length)} icon={<CreditCard className="h-4 w-4" />} positive delta="registradas" />
      </div>

      <Card className="mt-6" title="Agências recentes">
        {agencies.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma agência cadastrada ainda.</div>
        ) : (
          <div className="divide-y divide-border">
            {agencies.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <img src={a.logo_url ?? `https://api.dicebear.com/9.x/glass/svg?seed=${a.slug}`} alt="" className="h-9 w-9 rounded-lg border border-border" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{PLAN_LABELS[a.plan]} · {currency(Number(a.mrr))}/mês</div>
                </div>
                <span className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                  a.status === "active" ? "bg-success/15 text-success"
                    : a.status === "trial" ? "bg-primary/15 text-primary"
                    : a.status === "suspended" ? "bg-warning/15 text-warning"
                    : "bg-destructive/15 text-destructive"
                )}>{AGENCY_STATUS_LABELS[a.status === "cancelled" ? "canceled" : a.status]}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
