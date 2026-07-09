import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { hosts } from "@/lib/mock-data";
import { Percent, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/app/commissions")({
  component: CommissionsPage,
  head: () => ({ meta: [{ title: "Comissões — Livepulse" }] }),
});

const tiers = [
  { name: "Bronze", pct: 5, color: "from-amber-600 to-amber-800", min: "R$ 0", max: "R$ 5k" },
  { name: "Prata", pct: 8, color: "from-slate-300 to-slate-500", min: "R$ 5k", max: "R$ 12k" },
  { name: "Ouro", pct: 12, color: "from-yellow-400 to-amber-500", min: "R$ 12k", max: "R$ 20k" },
  { name: "Diamante", pct: 15, color: "from-cyan-300 to-primary", min: "R$ 20k", max: "∞" },
];

function CommissionsPage() {
  return (
    <div>
      <PageHeader title="Comissões" description="Regras, tiers e pagamentos por host" actions={<button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Nova regra</button>} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Comissões pagas (mês)" value={currency(34980)} delta="+12%" positive icon={<Percent className="h-4 w-4" />} />
        <StatCard label="Ticket médio host" value={currency(2914)} delta="+8%" positive icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Hosts com bônus" value="12/48" delta="+3" positive icon={<Users className="h-4 w-4" />} />
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
              {hosts.slice(0, 10).map((h) => {
                const tier = h.earnings >= 20000 ? tiers[3] : h.earnings >= 12000 ? tiers[2] : h.earnings >= 5000 ? tiers[1] : tiers[0];
                const comm = Math.round(h.earnings * tier.pct / 100);
                return (
                  <tr key={h.id} className="transition hover:bg-background/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={h.avatar} className="h-8 w-8 rounded-full" alt="" />
                        <span className="font-medium">{h.nickname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md bg-gradient-to-r ${tier.color} px-2 py-0.5 text-[11px] font-semibold text-background`}>{tier.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{currency(h.earnings)}</td>
                    <td className="px-4 py-3 text-right font-medium">{tier.pct}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{currency(comm)}</td>
                    <td className="px-4 py-3 text-right">{currency(h.earnings - comm)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
