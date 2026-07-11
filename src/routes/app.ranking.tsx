import { createFileRoute } from "@tanstack/react-router";
import { Avatar } from "@/components/avatar";
import { useMemo, useState } from "react";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { useHosts } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/ranking")({
  component: RankingPage,
  head: () => ({ meta: [{ title: "Ranking — Livepulse" }] }),
});

function RankingPage() {
  const { user, currentAgency } = useAuth();
  const { data: hosts = [] } = useHosts();
  const [cat, setCat] = useState<string>("Todas");
  const cats = useMemo(() => ["Todas", ...Array.from(new Set(hosts.map((h) => h.category).filter(Boolean) as string[]))], [hosts]);
  const filtered = hosts.filter((h) => cat === "Todas" || h.category === cat);
  const sorted = [...filtered].sort((a, b) => Number(b.earnings_total) - Number(a.earnings_total));
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const icons = [Crown, Trophy, Medal];
  const colors = ["from-yellow-400 to-amber-500", "from-slate-200 to-slate-400", "from-amber-600 to-amber-800"];
  const myPos = user?.role === "host" ? sorted.findIndex((h) => h.user_id === user.id) + 1 : 0;

  return (
    <div>
      <PageHeader
        title="Ranking"
        description={`${currentAgency?.name ?? "Agência"}${myPos ? ` · Sua posição: #${myPos}` : ""}`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card/40 p-1">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition", cat === c ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{c}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <Card><div className="py-8 text-center text-sm text-muted-foreground">Sem hosts para ranquear.</div></Card>
      ) : (
        <>
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
                    <div className="font-display text-3xl font-bold text-muted-foreground/50">#{i + 1}</div>
                  </div>
                  <img src={h.avatar_url ?? `https://api.dicebear.com/9.x/glass/svg?seed=${h.id}`} className="mt-4 h-16 w-16 rounded-full ring-2 ring-border" alt="" />
                  <div className="mt-3 font-display text-xl font-semibold">{h.nickname}</div>
                  <div className="text-xs text-muted-foreground">{h.category ?? "—"}</div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ganhos</div>
                      <div className="font-display text-2xl font-bold gradient-text">{currency(Number(h.earnings_total))}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Horas</div>
                      <div className="font-semibold">{Number(h.live_hours)}h</div>
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
                  <div className="w-8 text-center font-display text-lg font-semibold text-muted-foreground">#{i + 4}</div>
                  <img src={h.avatar_url ?? `https://api.dicebear.com/9.x/glass/svg?seed=${h.id}`} className="h-9 w-9 rounded-full" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{h.nickname}</div>
                    <div className="text-xs text-muted-foreground">{h.category ?? "—"}</div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Horas</div>
                    <div className="text-sm font-medium">{Number(h.live_hours)}h</div>
                  </div>
                  <div className="w-28 text-right font-display font-semibold">{currency(Number(h.earnings_total))}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
