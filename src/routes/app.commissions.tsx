import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { useHosts } from "@/hooks/use-data";
import { Avatar } from "@/components/avatar";
import { Percent, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/app/commissions")({
  component: CommissionsPage,
  head: () => ({ meta: [{ title: "Comissões — Livepulse" }] }),
});

const tiers = [
  { name: "Bronze",   pct: 5,  color: "from-amber-600 to-amber-800",  min: "R$ 0",   max: "R$ 5k" },
  { name: "Prata",    pct: 8,  color: "from-slate-300 to-slate-500",  min: "R$ 5k",  max: "R$ 12k" },
  { name: "Ouro",     pct: 12, color: "from-yellow-400 to-amber-500", min: "R$ 12k", max: "R$ 20k" },
  { name: "Diamante", pct: 15, color: "from-cyan-300 to-primary",     min: "R$ 20k", max: "∞" },
];

function tierFor(earnings: number) {
  if (earnings >= 20000) return tiers[3];
  if (earnings >= 12000) return tiers[2];
  if (earnings >= 5000)  return tiers[1];
  return tiers[0];
}

function CommissionsPage() {
  const { data: hosts = [], isLoading } = useHosts();

  const totalPaid = hosts.reduce((s, h) => s + Math.round(Number(h.earnings_total) * tierFor(Number(h.earnings_total)).pct / 100), 0);
  const avgTicket = hosts.length ? Math.round(hosts.reduce((s, h) => s + Number(h.earnings_total), 0) / hosts.length) : 0;
  const withBonus = hosts.filter((h) => Number(h.earnings_total) >= 12000).length;

  return (
    <div>
      <PageHeader title="Comissões" description="Regras, tiers e pagamentos por host" actions={<button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Nova regra</button>} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Comissões calculadas" value={currency(totalPaid)} icon={<Percent className="h-4 w-4" />} />
        <StatCard label="Ticket médio host" value={currency(avgTicket)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Hosts com bônus" value={`${withBonus}/${hosts.length}`} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {tiers.map((t) => (
          <div key={t.name} className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${t.color} opacity-20 blur-2xl`} />
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Tier</div>
            <div className="mt-2 font-display text-2xl font-semibold">{t.name}</div>
            <div className="mt-4 font-display text-4xl font-bold gradient-text">{t.pct}%</div>
            <div className="mt-3 text-xs text-muted-foreground">{t.min} — {t.max} de ganhos</div>
          </div>
        ))}
      </div>

      <Card className="mt-4" title="Comissões por host">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : hosts.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Nenhum host cadastrado.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Host</th>
                  <th className="px-4 py-2.5 font-medium">Tier</th>
                  <th className="px-4 py-2.5 text-right font-medium">Ganhos</th>
                  <th className="px-4 py-2.5 text-right font-medium">Taxa</th>
                  <th className="px-4 py-2.5 text-right font-medium">Comissão</th>
                  <th className="px-4 py-2.5 text-right font-medium">Repasse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {hosts.map((h) => {
                  const e = Number(h.earnings_total);
                  const tier = tierFor(e);
                  const comm = Math.round(e * tier.pct / 100);
                  return (
                    <tr key={h.id} className="transition hover:bg-background/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={h.avatar_url} name={h.nickname} size={32} />
                          <span className="font-medium">{h.nickname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md bg-gradient-to-r ${tier.color} px-2 py-0.5 text-[11px] font-semibold text-background`}>{tier.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{currency(e)}</td>
                      <td className="px-4 py-3 text-right font-medium">{tier.pct}%</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{currency(comm)}</td>
                      <td className="px-4 py-3 text-right">{currency(e - comm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
