import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Building2, CreditCard, LogOut, RefreshCw, MessageCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { WHATSAPP_SUPPORT, PLAN_LABELS } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/pending-payment")({
  component: PendingPaymentPage,
  head: () => ({ meta: [{ title: "Pagamento pendente — Livepulse" }] }),
});

type Sub = { id: string; plan: string; status: string; price_monthly: number; total_price: number | null; billing_period: string | null };
type Agency = { id: string; name: string; status: string };

function PendingPaymentPage() {
  const navigate = useNavigate();
  const { user, loading, refresh, signOut } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const load = async () => {
    if (!user) return;
    const { data: ags } = await supabase.from("agencies").select("id,name,status").eq("owner_id", user.id).limit(1);
    const a = ags?.[0] ?? null;
    setAgency(a);
    if (a) {
      const { data: subs } = await supabase.from("subscriptions").select("id,plan,status,price_monthly,total_price,billing_period").eq("agency_id", a.id).order("created_at", { ascending: false }).limit(1);
      setSub(subs?.[0] ?? null);
      if (a.status === "active") { toast.success("Sua agência foi ativada!"); navigate({ to: "/app/dashboard" }); }
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const refreshStatus = async () => {
    setReloading(true);
    await refresh();
    await load();
    setReloading(false);
    toast.message("Status atualizado");
  };

  const planLabel = sub ? (PLAN_LABELS[sub.plan] ?? sub.plan) : "";
  const amount = sub ? (Number(sub.total_price ?? sub.price_monthly)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
  const message = agency && sub
    ? `Olá! Acabei de solicitar uma conta de Agência no Livepulse. Minha agência é ${agency.name}, escolhi o plano ${planLabel} no valor de ${amount} e desejo realizar o pagamento para ativar meu acesso.`
    : "Olá! Acabei de solicitar uma conta de Agência no Livepulse e desejo realizar o pagamento para ativar meu acesso.";
  const waHref = `https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(message)}`;

  if (loading || !user) return <div className="mesh-bg grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
              <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold">Livepulse</span>
          </Link>
          <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>

        <div className="mt-10 rounded-3xl border border-warning/40 bg-warning/5 p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-warning/15 text-warning">
            <Clock className="h-6 w-6" />
          </div>
          <div className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-warning">Solicitação recebida</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">Finalize o pagamento para ativar sua Agência</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Recebemos sua solicitação. A ativação é feita manualmente pela nossa equipe após a confirmação do pagamento.
          </p>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card/60 p-6">
          <Row icon={<Building2 className="h-4 w-4" />} label="Agência" value={agency?.name ?? "—"} />
          <Row icon={<CreditCard className="h-4 w-4" />} label="Plano" value={planLabel || "—"} />
          <Row label="Valor" value={amount || "—"} />
          <Row label="Período" value={billingLabel(sub?.billing_period)} />
          <Row label="Status" value={<span className="rounded-md bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">Aguardando pagamento</span>} />
        </div>

        <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-base font-semibold text-white shadow-glow transition hover:opacity-90">
          <MessageCircle className="h-5 w-5" /> Falar no WhatsApp e realizar pagamento
        </a>

        <button onClick={refreshStatus} disabled={reloading} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/60 text-sm font-medium hover:bg-card disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${reloading ? "animate-spin" : ""}`} /> Atualizar status
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Após a confirmação do pagamento, seu painel será liberado pelo administrador.
        </p>
      </div>
    </div>
  );
}

function billingLabel(bp?: string | null) {
  if (!bp) return "—";
  return { monthly: "Mensal", quarterly: "Trimestral", semiannual: "Semestral", annual: "Anual", lifetime: "Vitalício" }[bp] ?? bp;
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
