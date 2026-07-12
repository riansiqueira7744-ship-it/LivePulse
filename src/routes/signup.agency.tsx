import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Mail, Lock, User, Building2, Phone, Globe, MapPin, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkPassword, translateAuthError } from "@/lib/password";
import { PasswordHints, TermsCheckbox } from "./signup.host";

export const Route = createFileRoute("/signup/agency")({
  component: AgencySignup,
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

function AgencySignup() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "", agencyName: "", email: "", password: "",
    whatsapp: "", country: "Brasil", city: "", planSlug: "anual",
  });
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const pw = checkPassword(f.password);

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
    if (!terms) { toast.error("Aceite os Termos de Uso e a Política de Privacidade."); return; }
    if (!f.whatsapp.trim()) { toast.error("WhatsApp é obrigatório."); return; }
    if (!pw.valid) { toast.error("A senha precisa ter no mínimo 8 caracteres, com letra e número."); return; }
    if (!selected) { toast.error("Selecione um plano."); return; }
    if (selected.slug === "founder" && selected.license_limit && selected.licenses_used >= selected.license_limit) {
      toast.error("Todas as licenças Founder já foram utilizadas."); return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: f.email, password: f.password,
        options: {
          emailRedirectTo: window.location.origin + "/pending-payment",
          data: {
            name: f.name, account_type: "agency_owner",
            whatsapp: f.whatsapp, country: f.country, city: f.city,
            agency_name: f.agencyName, plan_slug: selected.slug,
          },
        },
      });
      if (error) throw error;
      const userId = data.user?.id;
      const session = data.session ?? (await supabase.auth.getSession()).data.session;
      if (!userId) throw new Error("Cadastro incompleto.");

      // Create agency + subscription in pending state. Do NOT grant agency_owner role.
      const slug = slugify(f.agencyName);
      const { data: agency, error: aerr } = await supabase.from("agencies").insert({
        name: f.agencyName, slug, status: "pending",
        plan: selected.slug, owner_id: userId,
        country: f.country, city: f.city,
      }).select().single();
      if (aerr) throw aerr;

      await supabase.from("profiles").update({ agency_id: agency.id }).eq("id", userId);

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

      if (!session) {
        navigate({ to: "/confirm-email", search: { email: f.email, next: "pending-payment" } });
        return;
      }
      toast.success("Solicitação enviada! Aguardando confirmação de pagamento.");
      navigate({ to: "/pending-payment" });
    } catch (err) {
      toast.error(translateAuthError((err as Error).message));
    } finally { setBusy(false); }
  };

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>

        <div className="mt-8">
          <span className="inline-block rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">Conta paga · Aprovação manual</span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Solicitar sua Agência</h1>
          <p className="mt-2 text-sm text-muted-foreground">Após o cadastro, sua conta ficará em <b>Aguardando pagamento</b>. A ativação é feita manualmente pela nossa equipe após a confirmação.</p>
        </div>

        <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]" onSubmit={submit} noValidate>
          <div className="grid gap-4">
            <Field icon={<User className="h-4 w-4" />} label="Seu nome completo" value={f.name} onChange={set("name")} required />
            <Field icon={<Building2 className="h-4 w-4" />} label="Nome da agência" value={f.agencyName} onChange={set("agencyName")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={f.email} onChange={set("email")} required />
              <div>
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input required type="password" value={f.password} onChange={(e) => set("password")(e.target.value)}
                    className={`h-11 w-full rounded-xl border ${f.password && !pw.valid ? "border-destructive/60" : "border-border"} bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20`} />
                </div>
                <PasswordHints pw={pw} />
              </div>
            </div>
            <Field icon={<Phone className="h-4 w-4" />} label="WhatsApp (obrigatório)" value={f.whatsapp} onChange={set("whatsapp")} required placeholder="+55 11 9..." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Globe className="h-4 w-4" />} label="País" value={f.country} onChange={set("country")} required />
              <Field icon={<MapPin className="h-4 w-4" />} label="Cidade" value={f.city} onChange={set("city")} required />
            </div>

            <TermsCheckbox value={terms} onChange={setTerms} />

            <button type="submit" disabled={busy || !terms || !pw.valid} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
              {busy ? "Enviando…" : <>Solicitar Agência <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Escolha um plano</div>
            {plans.length === 0 && <div className="text-xs text-muted-foreground">Carregando planos…</div>}
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
            {f.planSlug === "founder" && (
              <div className="rounded-lg border border-border bg-card/40 p-3 text-[11px] text-muted-foreground">
                Licença vitalícia referente ao acesso às funcionalidades incluídas na V1, sujeita aos Termos de Uso, limites técnicos e política de uso justo. Serviços externos, integrações pagas e futuras funcionalidades premium podem ser cobrados separadamente.
              </div>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/signup" className="text-primary hover:underline">← Voltar</Link>
          {" · "}
          <Link to="/login" className="text-primary hover:underline">Já tenho conta</Link>
        </p>
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
