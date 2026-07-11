import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { useGoals, useHosts, useCreateGoal, useUpdateGoal, useDeleteGoal, type DbGoal } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth-context";
import { Plus, X, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/goals")({
  component: GoalsPage,
  head: () => ({ meta: [{ title: "Metas — Livepulse" }] }),
});

function GoalsPage() {
  const { can, currentAgency } = useAuth();
  const { data: goals = [], isLoading } = useGoals();
  const { data: hosts = [] } = useHosts();
  const createMut = useCreateGoal();
  const updateMut = useUpdateGoal();
  const deleteMut = useDeleteGoal();

  const [editing, setEditing] = useState<DbGoal | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Metas"
        description={`${currentAgency?.name ?? "Agência"} · ${goals.length} metas`}
        actions={can("goals:manage") ? (
          <button onClick={() => setCreating(true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="mr-1 inline h-3.5 w-3.5" /> Nova meta</button>
        ) : null}
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Carregando…</div>
      ) : goals.length === 0 ? (
        <Card><div className="py-8 text-center text-sm text-muted-foreground">Nenhuma meta cadastrada. Crie a primeira!</div></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.progress) / Number(g.target)) * 100));
            return (
              <div key={g.id} className="rounded-2xl border border-border bg-card/60 p-4 transition hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{g.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.period === "weekly" ? "Semanal" : g.period === "monthly" ? "Mensal" : "Trimestral"}
                      {g.host?.nickname && ` · ${g.host.nickname}`}
                    </div>
                  </div>
                  {can("goals:manage") && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(g)} className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-background/40"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm("Excluir meta?")) deleteMut.mutate(g.id, { onSuccess: () => toast.success("Excluída") }); }} className="grid h-7 w-7 place-items-center rounded-md border border-border text-destructive hover:bg-background/40"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-2xl font-semibold">{currency(Number(g.progress))}</span>
                  <span className="text-xs text-muted-foreground">/ {currency(Number(g.target))}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${pct > 70 ? "bg-gradient-to-r from-primary to-chart-2" : pct > 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-right text-xs text-muted-foreground">{pct}%</div>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && currentAgency && (
        <GoalDrawer
          goal={editing}
          hosts={hosts.map((h) => ({ id: h.id, nickname: h.nickname }))}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(payload) => {
            if (editing) updateMut.mutate({ id: editing.id, patch: payload }, { onSuccess: () => { toast.success("Salvo"); setEditing(null); } });
            else createMut.mutate({ ...payload, agency_id: currentAgency.id, title: payload.title ?? "", target: Number(payload.target ?? 0) }, { onSuccess: () => { toast.success("Meta criada"); setCreating(false); } });
          }}
        />
      )}
    </div>
  );
}

function GoalDrawer({ goal, hosts, onClose, onSave }: { goal: DbGoal | null; hosts: { id: string; nickname: string }[]; onClose: () => void; onSave: (p: Partial<DbGoal>) => void }) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [target, setTarget] = useState<number>(Number(goal?.target ?? 0));
  const [progress, setProgress] = useState<number>(Number(goal?.progress ?? 0));
  const [period, setPeriod] = useState<DbGoal["period"]>(goal?.period ?? "monthly");
  const [hostId, setHostId] = useState<string>(goal?.host_id ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{goal ? "Editar meta" : "Nova meta"}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Input label="Título" value={title} onChange={setTitle} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Alvo</label>
              <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Progresso</label>
              <input type="number" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Período</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as DbGoal["period"])} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Host (opcional)</label>
            <select value={hostId} onChange={(e) => setHostId(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
              <option value="">— Meta da agência —</option>
              {hosts.map((h) => <option key={h.id} value={h.id}>{h.nickname}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
          <button onClick={() => onSave({ title, target, progress, period, host_id: hostId || null })} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {goal ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
