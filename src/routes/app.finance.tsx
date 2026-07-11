import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { useFinance, useCreateTransaction, type DbTransaction } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth-context";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Download, ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/finance")({
  component: FinancePage,
  head: () => ({ meta: [{ title: "Financeiro — Livepulse" }] }),
});

const TYPES: DbTransaction["type"][] = ["revenue", "payout", "commission", "refund", "adjustment"];
const typeLabel: Record<DbTransaction["type"], string> = {
  revenue: "Receita", payout: "Repasse", commission: "Comissão", refund: "Reembolso", adjustment: "Ajuste",
};

function FinancePage() {
  const { user, loading, can, currentAgency } = useAuth();
  const navigate = useNavigate();
  const { data: txs = [], isLoading } = useFinance();
  const createMut = useCreateTransaction();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && user && (user.role === "manager" || user.role === "host")) {
      navigate({ to: "/app/dashboard" });
    }
  }, [loading, user, navigate]);

  const totals = useMemo(() => {
    let inflow = 0, outflow = 0;
    for (const t of txs) {
      const v = Number(t.amount);
      if (t.type === "revenue") inflow += v;
      else outflow += v;
    }
    return { inflow, outflow, net: inflow - outflow };
  }, [txs]);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description={`${currentAgency?.name ?? "Agência"} · Fluxo de caixa`}
        actions={
          <>
            {can("finance:manage") && (
              <button onClick={() => setCreating(true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="mr-1 inline h-3.5 w-3.5" /> Nova transação</button>
            )}
            {can("reports:export") && (
              <button className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs"><Download className="mr-1 inline h-3.5 w-3.5" /> Exportar CSV</button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard gradient label="Entradas" value={currency(totals.inflow)} icon={<TrendingUp className="h-4 w-4" />} positive delta="mês" />
        <StatCard label="Saídas" value={currency(totals.outflow)} icon={<TrendingDown className="h-4 w-4" />} positive={false} delta="mês" />
        <StatCard label="Lucro líquido" value={currency(totals.net)} icon={<Wallet className="h-4 w-4" />} positive delta="acumulado" />
        <StatCard label="Transações" value={String(txs.length)} icon={<PiggyBank className="h-4 w-4" />} positive delta="total" />
      </div>

      <Card className="mt-4" title="Movimentações">
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Descrição</th>
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {txs.map((t) => (
                <tr key={t.id} className="transition hover:bg-background/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`grid h-7 w-7 place-items-center rounded-lg ${t.type === "revenue" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {t.type === "revenue" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
                      </div>
                      <span className="font-medium">{t.description ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs">{typeLabel[t.type]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-xs">{t.status}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.type === "revenue" ? "text-success" : "text-foreground"}`}>{t.type === "revenue" ? "+" : "−"} {currency(Number(t.amount))}</td>
                </tr>
              ))}
              {!isLoading && txs.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">Nenhuma transação registrada.</td></tr>
              )}
              {isLoading && <tr><td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">Carregando…</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && currentAgency && (
        <TxDrawer
          onClose={() => setCreating(false)}
          onSave={(payload) => {
            createMut.mutate({ ...payload, agency_id: currentAgency.id, type: payload.type ?? "revenue", amount: Number(payload.amount ?? 0) }, { onSuccess: () => { toast.success("Registrada"); setCreating(false); } });
          }}
        />
      )}
    </div>
  );
}

function TxDrawer({ onClose, onSave }: { onClose: () => void; onSave: (p: Partial<DbTransaction>) => void }) {
  const [type, setType] = useState<DbTransaction["type"]>("revenue");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [occurred, setOccurred] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Nova transação</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as DbTransaction["type"])} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Valor (BRL)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Data</label>
            <input type="date" value={occurred} onChange={(e) => setOccurred(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
          <button onClick={() => onSave({ type, amount, description, occurred_at: occurred })} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Registrar</button>
        </div>
      </div>
    </div>
  );
}
