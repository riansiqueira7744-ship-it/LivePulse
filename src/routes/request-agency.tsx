import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Building2, Phone, Globe, MapPin, ArrowRight, Check, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/request-agency")({
  component: RequestAgencyPage,
  head: () => ({ meta: [{ title: "Solicitar Agência — Livepulse" }] }),
});

type Plan = {
  id: string; slug: string; name: string; description: string | null;
  price_monthly: number; total_price: number; billing_period: string;
  savings_label: string | null; featured: boolean;
  license_limit: number | null; licenses_used: number; sort_order: number;
  max_hosts: number; max_managers: number;
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || `agencia-${Date.now()}`;
}

function RequestAgencyPage() {
  const navigate = useNavigate();
  const { user, loading, signOut, refresh } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [existingPending, setExistingPending] = useState(false);
  const [f, setF] = useState({
    agencyName: "", whatsapp: "", country: "Brasil", city: "", planSlug: "anual",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    // Pre-fill known user info
    setF((s) => ({
      ...s,
      whatsapp: s.whatsapp || (user.whatsapp ?? ""),
      country: user.country || s.country,
      city: s.city || (user.city ?? ""),
    }));
    // If already agency_owner, no need to request.
    if (user.role === "agency_owner" || user.role === "super_admin") {
      navigate({ to: "/app/dashboard" });
      return;
    }
    // If already has a pending request, jump to pending-payment.
    void (async () => {
      const { data } = await supabase.from("agencies").select("id,status").eq("owner_id", user.id).limit(1);
      if (data && data[0] && data[0].status !== "active") {
        setExistingPending(true);
        navigate({ to: "/pending-payment" });
      }
    })();
  }, [loading, user, navigate]);

  const loadPlans = async () => {
    setPlansLoading(true); setPlansError(null);
    const { data, error } = await supabase.from("plans").select("*").eq("active", true).order("sort_order");
    if (error) { setPlansError(error.message); setPlansLoading(false); return; }
    setPlans((data ?? []) as unknown as Plan[]);
    setPlansLoading(false);
  };

  useEffect(() => { void loadPlans(); }, []);

  const selected = plans.find((p) => p.slug === f.planSlug);
  const founderExhausted = plans.find((p) => p.slug === "founder" && p.license_limit && p.licenses_used >= p.license_limit);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!f.agencyName.trim()) { toast.error("Informe o nome da agência."); return; }
    if (!f.whatsapp.trim()) { toast.error("WhatsApp é obrigatório."); return; }
    if (!selected) { toast.error("Selecione um plano."); return; }
    if (selected.slug === "founder" && selected.license_limit && selected.licenses_used >= selected.license_limit) {
      toast.error("Todas as licenças Founder já foram utilizadas."); return;
    }
    setBusy(true);
    try {
      const slug = slugify(f.agencyName);
      const { data: agency, error: aerr } = await supabase.from("agencies").insert({
        name: f.agencyName, slug, status: "pending",
        plan: selected.slug, owner_id: user.id,
        country: f.country, city: f.city,
      }).select().single();
      if (aerr) throw aerr;

      // Update profile with contact + agency link (agency ties become effective on approval).
      await supabase.from("profiles").update({
        agency_id: agency.id,
        whatsapp: f.whatsapp,
        country: f.country,
        city: f.city,
      }).eq("id", user.id);

      const { error: serr } = await supabase.from("subscriptions").insert({
        agency_id: agency.id,
        plan: selected.slug,
        status: "awaiting_payment",
        billing_period: selected.billing_period,
        price_monthly: selected.price_monthly,
        total_price: selected.total_price,
        seats: selected.max_hosts,
        max_hosts: selected.max_hosts,
        max_managers: selected.max_managers,
      });
      if (serr) throw serr;

      await refresh();
      toast.success("Solicitação enviada! Aguardando confirmação de pagamento.");
      navigate({ to: "/pending-payment" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  if (loading || !user || existingPending) {
    return <div className="mesh-bg grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
              <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold">Livepulse</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Logado como <b className="text-foreground">{user.name || user.email}</b>{user.livepulse_id && <> · {user.livepulse_id}</>}</span>
            <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>

        <div className="mt-8">
          <span className="inline-block rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">Sua conta · Aprovação manual</span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Quero abrir minha Agência</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sua conta já existe. Preencha apenas os dados da agência. Após envio, ficará em <b>Aguardando pagamento</b>. A ativação é manual, após a confirmação.</p>
        </div>

        <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]" onSubmit={submit} noValidate>
          <div className="grid gap-4">
            <Field icon={<Building2 className="h-4 w-4" />} label="Nome da agência" value={f.agencyName} onChange={set("agencyName")} required />
            <Field icon={<Phone className="h-4 w-4" />} label="WhatsApp (obrigatório)" value={f.whatsapp} onChange={set("whatsapp")} required placeholder="+55 11 9..." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Globe className="h-4 w-4" />} label="País" value={f.country} onChange={set("country")} required />
              <Field icon={<MapPin className="h-4 w-4" />} label="Cidade" value={f.city} onChange={set("city")} required />
            </div>

            <button type="submit" disabled={busy || !selected} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
              {busy ? "Enviando solicitação…" : <>Solicitar Agência <ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">Sua conta continua a mesma. Nenhum novo login será criado.</p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Escolha um plano</div>
            {plansLoading && <div className="text-xs text-muted-foreground">Carregando planos…</div>}
            {plansError && !plansLoading && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                Não foi possível carregar os planos.
                <button type="button" onClick={() => void loadPlans()} className="ml-2 rounded-md border border-destructive/40 px-2 py-0.5 text-[11px] font-semibold hover:bg-destructive/10">Tentar novamente</button>
              </div>
            )}
            {!plansLoading && !plansError && plans.length === 0 && (
              <div className="text-xs text-muted-foreground">Nenhum plano disponível no momento.</div>
            )}
            {plans.map((p) => {
              const active = p.slug === f.planSlug;
              const isFounder = p.slug === "founder";
              const remaining = p.license_limit ? Math.max(0, p.license_limit - p.licenses_used) : null;
              const disabled = isFounder && remaining === 0;
              return (
                <button type="button" key={p.id} disabled={disabled} onClick={() => set("planSlug")(p.slug)}
                  className={`relative w-full rounded-xl border p-4 text-left transition disabled:opacity-50 ${active ? "border-primary/60 bg-primary/10" : "border-border bg-card/60 hover:border-primary/40"}`}>
                  {p.featured && <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Mais Popular</span>}
                  {isFounder && <span className="absolute -top-2 right-3 rounded-full bg-warning px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">Oferta Founder</span>}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.name}</div>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold">
                    R$ {Number(p.total_price).toLocaleString("pt-BR")}
                    {p.billing_period !== "lifetime" && <span className="text-xs font-normal text-muted-foreground"> {periodShort(p.billing_period)}</span>}
                  </div>
                  {p.billing_period !== "monthly" && p.billing_period !== "lifetime" && (
                    <div className="text-[11px] text-muted-foreground">
                      Equivale a R$ {Number(p.price_monthly).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}/mês
                    </div>
                  )}
                  {p.savings_label && <div className="mt-1 text-[11px] font-medium text-success">{p.savings_label}</div>}
                  {isFounder && remaining !== null && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {remaining} de {p.license_limit} vagas restantes
                    </div>
                  )}
                </button>
              );
            })}
            {founderExhausted && (
              <div className="rounded-lg border border-warning/40 bg-warning/5 p-2 text-[11px] text-warning">
                Todas as licenças Founder já foram utilizadas.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function periodShort(bp: string) {
  return { monthly: "/mês", quarterly: "/trimestre", semiannual: "/semestre", annual: "/ano", lifetime: "vitalício" }[bp] ?? "";
}

function Field({ label, value, onChange, icon, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; icon: React.ReactNode; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input required={required} placeholder={placeholder} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
    </div>
  );
}
