import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { useAgencies } from "@/hooks/use-data";
import { Avatar } from "@/components/avatar";
import { Search, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Suporte — Super Admin · Livepulse" }] }),
});

function SupportPage() {
  const { data: agencies = [] } = useAgencies();
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => agencies.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase())),
    [agencies, q],
  );
  const active = filtered.find((a) => a.id === activeId) ?? filtered[0] ?? null;

  return (
    <div>
      <PageHeader title="Suporte" description="Chat privado entre Super Admin e Donos das agências" />

      <div className="grid h-[calc(100vh-14rem)] min-h-[520px] gap-4 rounded-2xl border border-border bg-card/40 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex flex-col overflow-hidden border-r border-border">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar agência…" className="h-9 w-full rounded-lg border border-border bg-background/40 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((a) => {
              const isActive = a.id === active?.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveId(a.id)}
                  className={cn("flex w-full items-start gap-3 border-b border-border/50 px-3 py-2.5 text-left transition hover:bg-card/60", isActive && "bg-card/80")}
                >
                  <Avatar src={a.logo_url} name={a.name} size={36} rounded="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">Nenhuma mensagem</div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma agência cadastrada.</div>}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-border p-3">
                <Avatar src={active.logo_url} name={active.name} size={36} rounded="lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{active.name}</div>
                  <div className="text-xs text-muted-foreground">Sem histórico</div>
                </div>
              </header>
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium">Nenhuma mensagem ainda</div>
                <p className="max-w-xs text-xs text-muted-foreground">Quando o dono desta agência enviar uma mensagem, ela aparecerá aqui.</p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Nenhuma agência selecionada.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
