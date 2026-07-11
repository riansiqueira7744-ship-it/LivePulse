import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader } from "@/components/app-shell";
import { useAgencies } from "@/hooks/use-data";
import type { Broadcast, BroadcastPriority, BroadcastStatus, BroadcastTarget } from "@/types";
import { Plus, Megaphone, Clock, Send, X, AlertTriangle, Info, AlertOctagon, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/avatar";

export const Route = createFileRoute("/admin/broadcasts")({
  component: BroadcastsPage,
  head: () => ({ meta: [{ title: "Comunicados — Super Admin · Livepulse" }] }),
});

const priorityIcon: Record<BroadcastPriority, typeof Info> = {
  info: Info, warning: AlertTriangle, critical: AlertOctagon,
};
const priorityCls: Record<BroadcastPriority, string> = {
  info: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};
const priorityLabel: Record<BroadcastPriority, string> = { info: "Informativo", warning: "Atenção", critical: "Crítico" };
const statusLabel: Record<BroadcastStatus, string> = { draft: "Rascunho", scheduled: "Agendado", sent: "Enviado" };
const statusCls: Record<BroadcastStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/15 text-warning",
  sent: "bg-success/15 text-success",
};

function BroadcastsPage() {
  const { data: agencies = [] } = useAgencies();
  // Broadcasts ainda não são persistidos: mantemos apenas em memória até termos a tabela.
  const [items, setItems] = useState<Broadcast[]>([]);
  const [status, setStatus] = useState<BroadcastStatus | "all">("all");
  const [composing, setComposing] = useState<Broadcast | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = items.filter((b) => status === "all" || b.status === status);
  const stats = {
    total: items.length,
    sent: items.filter((b) => b.status === "sent").length,
    scheduled: items.filter((b) => b.status === "scheduled").length,
    drafts: items.filter((b) => b.status === "draft").length,
  };

  const upsert = (b: Broadcast) => setItems((prev) => {
    const i = prev.findIndex((x) => x.id === b.id);
    if (i === -1) return [b, ...prev];
    const next = [...prev]; next[i] = b; return next;
  });
  const remove = (id: string) => setItems((prev) => prev.filter((b) => b.id !== id));

  return (
    <div>
      <PageHeader
        title="Comunicados"
        description="Envie mensagens globais para todas as agências ou grupos selecionados"
        actions={
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> Novo comunicado
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="Total" value={stats.total} icon={<Megaphone className="h-4 w-4" />} />
        <MiniStat label="Enviados" value={stats.sent} icon={<Send className="h-4 w-4" />} tone="success" />
        <MiniStat label="Agendados" value={stats.scheduled} icon={<Clock className="h-4 w-4" />} tone="warning" />
        <MiniStat label="Rascunhos" value={stats.drafts} icon={<Edit className="h-4 w-4" />} tone="muted" />
      </div>

      <Card className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["all","draft","scheduled","sent"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              status === s ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
            )}>
              {s === "all" ? "Todos" : statusLabel[s]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((b) => {
            const Icon = priorityIcon[b.priority];
            const audience = b.target === "all" ? "Todas as agências" : `${b.audience_ids.length} agências`;
            return (
              <div key={b.id} className="group flex items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary/30">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", priorityCls[b.priority])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{b.title}</h3>
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", statusCls[b.status])}>{statusLabel[b.status]}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", priorityCls[b.priority])}>{priorityLabel[b.priority]}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>📣 {audience}</span>
                    <span>👥 alcance: {b.reach}</span>
                    {b.sent_at && <span>Enviado em {new Date(b.sent_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
                    {b.scheduled_at && !b.sent_at && <span>Agendado para {new Date(b.scheduled_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => setComposing(b)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-primary/50">
                    <Edit className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => remove(b.id)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-destructive/50 hover:text-destructive">
                    <Trash2 className="h-3 w-3" /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Nenhum comunicado.</div>}
        </div>
      </Card>

      {(composing || creating) && (
        <ComposeDrawer
          agencies={agencies}
          broadcast={composing}
          onClose={() => { setComposing(null); setCreating(false); }}
          onSave={(b) => { upsert(b); setComposing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function MiniStat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone?: "success" | "warning" | "muted" }) {
  const cls = tone === "success" ? "bg-success/15 text-success" : tone === "warning" ? "bg-warning/15 text-warning" : tone === "muted" ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={cn("grid h-8 w-8 place-items-center rounded-lg", cls)}>{icon}</div>
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

type AgencyOption = { id: string; name: string; logo_url: string | null; country: string | null };

function ComposeDrawer({ agencies, broadcast, onClose, onSave }: { agencies: AgencyOption[]; broadcast: Broadcast | null; onClose: () => void; onSave: (b: Broadcast) => void }) {
  const [title, setTitle] = useState(broadcast?.title ?? "");
  const [message, setMessage] = useState(broadcast?.message ?? "");
  const [priority, setPriority] = useState<BroadcastPriority>(broadcast?.priority ?? "info");
  const [target, setTarget] = useState<BroadcastTarget>(broadcast?.target ?? "all");
  const [audience, setAudience] = useState<string[]>(broadcast?.audience_ids ?? []);
  const [scheduledAt, setScheduledAt] = useState<string>(broadcast?.scheduled_at?.slice(0, 16) ?? "");

  const toggle = (id: string) => setAudience((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const buildBroadcast = (status: BroadcastStatus): Broadcast => ({
    id: broadcast?.id ?? `bc_${Date.now()}`,
    title, message, priority, target,
    audience_ids: target === "selected" ? audience : [],
    status,
    scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
    sent_at: status === "sent" ? new Date().toISOString() : broadcast?.sent_at ?? null,
    created_at: broadcast?.created_at ?? new Date().toISOString(),
    reach: target === "all" ? agencies.length : audience.length,
  });

  const canSubmit = title.trim() && message.trim() && (target === "all" || audience.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">{broadcast ? "Editar comunicado" : "Novo comunicado"}</h2>
            <p className="text-xs text-muted-foreground">Comunique novidades, manutenções e ofertas</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Nova versão disponível" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mensagem</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Escreva a mensagem…" className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background/40 p-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as BroadcastPriority)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
                <option value="info" className="bg-popover">Informativo</option>
                <option value="warning" className="bg-popover">Atenção</option>
                <option value="critical" className="bg-popover">Crítico</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Agendar (opcional)</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Público</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTarget("all")} className={cn("rounded-lg border p-3 text-left text-xs transition", target === "all" ? "border-primary/60 bg-primary/10 text-foreground" : "border-border bg-card/60")}>
                <div className="text-sm font-semibold">Todas as agências</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{agencies.length} destinatários</div>
              </button>
              <button type="button" onClick={() => setTarget("selected")} className={cn("rounded-lg border p-3 text-left text-xs transition", target === "selected" ? "border-primary/60 bg-primary/10 text-foreground" : "border-border bg-card/60")}>
                <div className="text-sm font-semibold">Selecionar agências</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{audience.length} selecionadas</div>
              </button>
            </div>

            {target === "selected" && (
              <div className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border bg-background/40 p-2">
                {agencies.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">Nenhuma agência cadastrada.</div>}
                {agencies.map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-card">
                    <input type="checkbox" checked={audience.includes(a.id)} onChange={() => toggle(a.id)} className="h-4 w-4 accent-primary" />
                    <Avatar src={a.logo_url} name={a.name} size={24} rounded="md" />
                    <span className="flex-1 truncate">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground">{a.country ?? ""}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={() => onSave(buildBroadcast("draft"))} className="rounded-lg border border-border px-3 py-1.5 text-xs">Salvar rascunho</button>
          {scheduledAt && (
            <button disabled={!canSubmit} onClick={() => onSave(buildBroadcast("scheduled"))} className="rounded-lg bg-warning px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">Agendar</button>
          )}
          <button disabled={!canSubmit} onClick={() => onSave(buildBroadcast("sent"))} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
            <Send className="h-3.5 w-3.5" /> Enviar agora
          </button>
        </div>
      </div>
    </div>
  );
}
