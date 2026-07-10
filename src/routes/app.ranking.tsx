import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { useScopedHosts } from "@/lib/scoped-data";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Crown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/ranking")({
  component: RankingPage,
  head: () => ({ meta: [{ title: "Ranking — Livepulse" }] }),
});

function RankingPage() {
  const { user, currentAgency } = useAuth();
  const hosts = useScopedHosts();
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");
  const [cat, setCat] = useState<string>("Todas");
  const cats = ["Todas", ...Array.from(new Set(hosts.map((h) => h.category)))];
  const filtered = hosts.filter((h) => cat === "Todas" || h.category === cat);
  const sorted = [...filtered].sort((a,b)=>b.earnings-a.earnings);
  const podium = sorted.slice(0,3);
  const rest = sorted.slice(3);
  const icons = [Crown, Trophy, Medal];
  const colors = ["from-yellow-400 to-amber-500", "from-slate-200 to-slate-400", "from-amber-600 to-amber-800"];
  const periodLabel = period === "week" ? "Semana atual" : period === "month" ? "Novembro 2026" : "Q4 2026";
  const myPos = user?.role === "host" ? sorted.findIndex((h) => h.nickname === user.name) + 1 : 0;

  return (
    <div>
      <PageHeader
        title="Ranking"
        description={`${currentAgency?.name ?? "Agência"} · ${periodLabel}${myPos ? ` · Sua posição: #${myPos}` : ""}`}
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1">
            {(["week","month","quarter"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition", period === p ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
                {p === "week" ? "Semana" : p === "month" ? "Mês" : "Trimestre"}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card/40 p-1">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition", cat === c ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{c}</button>
        ))}
      </div>


      <div className="grid gap-4 md:grid-cols-3">
        {podium.map((h, i) => {
          const Icon = icons[i];
          return (
            <div key={h.id} className={`relative overflow-hidden rounded-2xl border border-border p-6 ${i === 0 ? "bg-gradient-to-b from-warning/20 to-card md:-mt-4 md:pt-10" : "bg-card/60"}`}>
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${colors[i]} opacity-30 blur-2xl`} />
              <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${colors[i]} text-background`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-display text-3xl font-bold text-muted-foreground/50">#{i+1}</div>
              </div>
              <img src={h.avatar} className="mt-4 h-16 w-16 rounded-full ring-2 ring-border" alt="" />
              <div className="mt-3 font-display text-xl font-semibold">{h.nickname}</div>
              <div className="text-xs text-muted-foreground">{h.category} · {h.manager}</div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ganhos</div>
                  <div className="font-display text-2xl font-bold gradient-text">{currency(h.earnings)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Horas</div>
                  <div className="font-semibold">{h.hours}h</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="mt-6" title="Classificação completa" action={<TrendingUp className="h-4 w-4 text-muted-foreground" />}>
        <div className="space-y-1.5">
          {rest.map((h, i) => (
            <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-3 transition hover:bg-background/60">
              <div className="w-8 text-center font-display text-lg font-semibold text-muted-foreground">#{i+4}</div>
              <img src={h.avatar} className="h-9 w-9 rounded-full" alt="" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{h.nickname}</div>
                <div className="text-xs text-muted-foreground">{h.category}</div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Horas</div>
                <div className="text-sm font-medium">{h.hours}h</div>
              </div>
              <div className="w-28 text-right font-display font-semibold">{currency(h.earnings)}</div>
              <div className={`hidden w-16 text-right text-xs font-semibold sm:block ${h.progress > 60 ? "text-success" : "text-muted-foreground"}`}>
                {h.progress > 60 ? `+${Math.round(Math.random()*15+2)}` : `−${Math.round(Math.random()*8+1)}`}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
