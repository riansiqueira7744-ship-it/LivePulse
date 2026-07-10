import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Plus, Star, MoreHorizontal, ArrowUpDown, Download } from "lucide-react";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { type Host } from "@/lib/mock-data";
import { useScopedHosts } from "@/lib/scoped-data";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/hosts")({
  component: HostsPage,
  head: () => ({ meta: [{ title: "Hosts — Livepulse" }] }),
});

const statusColors: Record<Host["status"], string> = {
  online: "bg-success/15 text-success",
  offline: "bg-muted text-muted-foreground",
  "at-risk": "bg-destructive/15 text-destructive",
};
const statusLabel: Record<Host["status"], string> = {
  online: "Online", offline: "Offline", "at-risk": "Em risco",
};

function HostsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const cats = ["Todas", ...Array.from(new Set(allHosts.map((h) => h.category)))];
  const rows = allHosts.filter((h) =>
    (cat === "Todas" || h.category === cat) &&
    (q === "" || h.nickname.toLowerCase().includes(q.toLowerCase()) || h.id.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Hosts"
        description={`${allHosts.length} cadastrados · ${allHosts.filter(h=>h.status==="online").length} online agora`}
        actions={
          <>
            <button className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs"><Download className="mr-1 inline h-3.5 w-3.5" /> Exportar</button>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="mr-1 inline h-3.5 w-3.5" /> Novo host</button>
          </>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por nickname ou ID…" className="h-9 w-full rounded-lg border border-border bg-background/50 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
            {cats.map((c)=>(
              <button key={c} onClick={()=>setCat(c)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition", cat === c ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{c}</button>
            ))}
          </div>
          <button className="rounded-lg border border-border bg-background/50 p-2 text-muted-foreground"><Filter className="h-4 w-4" /></button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Host</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Gerente</th>
                <th className="px-4 py-3 text-right font-medium"><button className="inline-flex items-center gap-1">Ganhos <ArrowUpDown className="h-3 w-3" /></button></th>
                <th className="px-4 py-3 text-right font-medium">Horas</th>
                <th className="px-4 py-3 font-medium">Meta</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((h) => (
                <tr key={h.id} className="transition hover:bg-background/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={h.avatar} alt="" className="h-9 w-9 rounded-full" />
                        <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background", h.status === "online" ? "bg-success" : h.status === "at-risk" ? "bg-destructive" : "bg-muted-foreground")} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="truncate">{h.nickname}</span>
                          {h.starHost && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{h.id}</td>
                  <td className="px-4 py-3"><span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs">{h.category}</span></td>
                  <td className="px-4 py-3"><span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", statusColors[h.status])}>{statusLabel[h.status]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{h.manager}</td>
                  <td className="px-4 py-3 text-right font-semibold">{currency(h.earnings)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{h.hours}h</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", h.progress > 70 ? "bg-gradient-to-r from-primary to-chart-2" : h.progress > 40 ? "bg-warning" : "bg-destructive")} style={{ width: `${h.progress}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{h.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
