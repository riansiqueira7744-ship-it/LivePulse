import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { mockAgencies, mockSubscriptions } from "@/lib/mock-agencies";
import { AGENCY_STATUS_LABELS, PLAN_LABELS } from "@/lib/constants";
import type { AgencyStatus, PlanTier, Subscription } from "@/types";
import { CreditCard, DollarSign, Users, TrendingUp, Play, Pause, CheckCircle2, Edit, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/subscriptions")({
  component: SubscriptionsPage,
  head: () => ({ meta: [{ title: "Assinaturas — Super Admin · Livepulse" }] }),
});

const ALL_STATUSES: AgencyStatus[] = ["active", "trial", "suspended", "canceled"];
const ALL_PLANS: PlanTier[] = ["starter", "growth", "scale", "enterprise"];

const history = [
  { id: "inv_1024", agency: "Livepulse Studio", amount: 1490, date: "01/07/2026", status: "Pago" },
  { id: "inv_1023", agency: "Horizon Media",    amount: 3490, date: "01/07/2026", status: "Pago" },
  { id: "inv_1022", agency: "Neon Stars",       amount: 690,  date: "01/07/2026", status: "Pago" },
  { id: "inv_1021", agency: "Aurora Creators",  amount: 690,  date: "01/07/2026", status: "Falhou" },
  { id: "inv_1020", agency: "Livepulse Studio", amount: 1490, date: "01/06/2026", status: "Pago" },
  { id: "inv_1019", agency: "Horizon Media",    amount: 3490, date: "01/06/2026", status: "Pago" },
];

function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(mockSubscriptions);
  const [status, setStatus] = useState<AgencyStatus | "all">("all");
  const [plan, setPlan] = useState<PlanTier | "all">("all");
  const [editing, setEditing] = useState<Subscription | null>(null);

  const totalMrr = subs.filter((s) => s.status === "active").reduce((a, s) => a + s.price_monthly, 0);
  const arr = totalMrr * 12;
  const activeCount = subs.filter((s) => s.status === "active").length;
  const trialCount = subs.filter((s) => s.status === "trial").length;

  const filtered = subs.filter((s) => (status === "all" || s.status === status) && (plan === "all" || s.plan === plan));

  const update = (id: string, patch: Partial<Subscription>) =>
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div>
      <PageHeader title="Assinaturas" description="Planos, faturamento recorrente e pagamentos" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={currency(totalMrr)} icon={<DollarSign className="h-4 w-4" />} gradient delta="+12,4%" positive />
        <StatCard label="ARR estimado" value={currency(arr)} icon={<TrendingUp className="h-4 w-4" />} delta="+18%" positive />
        <StatCard label="Assinaturas ativas" value={String(activeCount)} icon={<CreditCard className="h-4 w-4" />} delta="+1" positive />
        <StatCard label="Em trial" value={String(trialCount)} icon={<Users className="h-4 w-4" />} delta="+1" positive />
      </div>

      <Card className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SelectChip label="Status" value={status} onChange={(v) => setStatus(v as AgencyStatus | "all")}
            options={[{ v: "all", l: "Todos" }, ...ALL_STATUSES.map((s) => ({ v: s, l: AGENCY_STATUS_LABELS[s] }))]} />
          <SelectChip label="Plano" value={plan} onChange={(v) => setPlan(v as PlanTier | "all")}
            options={[{ v: "all", l: "Todos" }, ...ALL_PLANS.map((p) => ({ v: p, l: PLAN_LABELS[p] }))]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Agência</th>
                <th className="py-2 pr-3 font-medium">Plano</th>
                <th className="py-2 pr-3 font-medium">Valor/mês</th>
                <th className="py-2 pr-3 font-medium">Seats</th>
                <th className="py-2 pr-3 font-medium">Próxima fatura</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const agency = mockAgencies.find((a) => a.id === s.agency_id);
                return (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-card/50">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <img src={agency?.logo_url ?? ""} className="h-8 w-8 rounded-lg border border-border" alt="" />
                        <span className="font-medium">{agency?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3"><span className="rounded-md border border-border bg-card/60 px-2 py-0.5 text-[11px] font-semibold">{PLAN_LABELS[s.plan]}</span></td>
                    <td className="py-3 pr-3 font-semibold">{currency(s.price_monthly)}</td>
                    <td className="py-3 pr-3">{s.seats}</td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(s.next_invoice_at).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 pr-3">
                      <span className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        s.status === "active" ? "bg-success/15 text-success"
                        : s.status === "trial" ? "bg-primary/15 text-primary"
                        : s.status === "suspended" ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive"
                      )}>{AGENCY_STATUS_LABELS[s.status]}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(s)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-primary/50">
                          <Edit className="h-3 w-3" /> Editar
                        </button>
                        {s.status !== "active" ? (
                          <button onClick={() => update(s.id, { status: "active" })} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-success/50 hover:text-success">
                            <Play className="h-3 w-3" /> Reativar
                          </button>
                        ) : (
                          <button onClick={() => update(s.id, { status: "suspended" })} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-warning/50 hover:text-warning">
                            <Pause className="h-3 w-3" /> Suspender
                          </button>
                        )}
                        <button onClick={() => update(s.id, { next_invoice_at: new Date(Date.now() + 86400_000 * 30).toISOString() })} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-success/50 hover:text-success">
                          <CheckCircle2 className="h-3 w-3" /> Marcar pago
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Histórico de faturas" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Fatura</th>
                <th className="py-2 pr-3 font-medium">Agência</th>
                <th className="py-2 pr-3 font-medium">Valor</th>
                <th className="py-2 pr-3 font-medium">Data</th>
                <th className="py-2 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs">{h.id.toUpperCase()}</td>
                  <td className="py-2.5 pr-3">{h.agency}</td>
                  <td className="py-2.5 pr-3 font-semibold">{currency(h.amount)}</td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">{h.date}</td>
                  <td className="py-2.5 pr-3">
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", h.status === "Pago" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>{h.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Estrutura pronta para integração com gateway de pagamento (Stripe / Paddle) — hoje utilizando dados mock.</p>
      </Card>

      {editing && (
        <EditDrawer sub={editing} onClose={() => setEditing(null)} onSave={(patch) => { update(editing.id, patch); setEditing(null); }} />
      )}
    </div>
  );
}

function SelectChip({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-xs font-medium focus:outline-none">
        {options.map((o) => <option key={o.v} value={o.v} className="bg-popover">{o.l}</option>)}
      </select>
    </label>
  );
}

function EditDrawer({ sub, onClose, onSave }: { sub: Subscription; onClose: () => void; onSave: (p: Partial<Subscription>) => void }) {
  const [plan, setPlan] = useState<PlanTier>(sub.plan);
  const [price, setPrice] = useState<number>(sub.price_monthly);
  const [seats, setSeats] = useState<number>(sub.seats);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Editar plano</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Plano</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as PlanTier)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
              {ALL_PLANS.map((p) => <option key={p} value={p} className="bg-popover">{PLAN_LABELS[p]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Valor mensal (BRL)</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Seats</label>
            <input type="number" value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
          <button onClick={() => onSave({ plan, price_monthly: price, seats })} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Salvar</button>
        </div>
      </div>
    </div>
  );
}
