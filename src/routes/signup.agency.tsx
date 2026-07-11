import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Mail, Lock, User, Building2, Phone, Globe, MapPin, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup/agency")({
  component: AgencySignup,
  head: () => ({ meta: [{ title: "Criar agência — Livepulse" }] }),
});

type Plan = {
  id: string; slug: string; name: string; description: string | null;
  price_monthly: number; currency: string; max_hosts: number; max_managers: number;
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || `agencia-${Date.now()}`;
}

function AgencySignup() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [f, setF] = useState({
    name: "", agencyName: "", email: "", password: "",
    whatsapp: "", country: "Brasil", city: "", planSlug: "starter",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    supabase.from("plans").select("*").eq("active", true).order("price_monthly")
      .then(({ data }) => { if (data) setPlans(data as Plan[]); });
  }, []);

  const selected = plans.find((p) => p.slug === f.planSlug);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.whatsapp.trim()) { toast.error("WhatsApp é obrigatório"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: f.email, password: f.password,
        options: {
          emailRedirectTo: window.location.origin + "/app/dashboard",
          data: {
            name: f.name, account_type: "agency_owner",
            whatsapp: f.whatsapp, country: f.country, city: f.city,
          },
        },
      });
      if (error) throw error;
      const userId = data.user?.id;
      const session = data.session ?? (await supabase.auth.getSession()).data.session;
      if (!userId || !session) {
        toast.info("Cadastro criado. Confirme seu e-mail e faça login para continuar.");
        navigate({ to: "/login" });
        return;
      }

      // Create agency
      const slug = slugify(f.agencyName);
      const { data: agency, error: aerr } = await supabase.from("agencies").insert({
        name: f.agencyName, slug, status: "trial",
        plan: f.planSlug as "starter" | "growth" | "scale" | "enterprise",
        owner_id: userId, country: f.country, city: f.city,
      }).select().single();
      if (aerr) throw aerr;

      // Link profile
      await supabase.from("profiles").update({ agency_id: agency.id }).eq("id", userId);

      // Owner role
      const { error: rerr } = await supabase.from("user_roles").insert({
        user_id: userId, role: "agency_owner", agency_id: agency.id,
      });
      if (rerr) throw rerr;

      // Subscription — awaiting_payment
      await supabase.from("subscriptions").insert({
        agency_id: agency.id,
        plan: f.planSlug as "starter" | "growth" | "scale" | "enterprise",
        status: "awaiting_payment",
        price_monthly: selected?.price_monthly ?? 0,
        seats: selected?.max_hosts ?? 5,
        max_hosts: selected?.max_hosts ?? 5,
        max_managers: selected?.max_managers ?? 2,
      });

      toast.success(`Agência "${f.agencyName}" criada! Aguardando confirmação de pagamento.`);
      navigate({ to: "/app/dashboard" });
    } catch (err) {
      toast.error((err as Error).message ?? "Falha ao criar agência");
    } finally { setBusy(false); }
  };

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>

        <div className="mt-8">
          <span className="inline-block rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">Conta paga</span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Criar sua agência</h1>
          <p className="mt-2 text-sm text-muted-foreground">Após o cadastro, sua conta ficará em <b>Aguardando pagamento</b>. Nossa equipe confirma e libera o acesso.</p>
        </div>

        <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]" onSubmit={submit}>
          <div className="grid gap-4">
            <Field icon={<User className="h-4 w-4" />} label="Seu nome completo" value={f.name} onChange={set("name")} required />
            <Field icon={<Building2 className="h-4 w-4" />} label="Nome da agência" value={f.agencyName} onChange={set("agencyName")} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={f.email} onChange={set("email")} required />
              <Field icon={<Lock className="h-4 w-4" />} label="Senha" type="password" value={f.password} onChange={set("password")} required />
            </div>
            <Field icon={<Phone className="h-4 w-4" />} label="WhatsApp (obrigatório)" value={f.whatsapp} onChange={set("whatsapp")} required placeholder="+55 11 9..." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Globe className="h-4 w-4" />} label="País" value={f.country} onChange={set("country")} required />
              <Field icon={<MapPin className="h-4 w-4" />} label="Cidade" value={f.city} onChange={set("city")} required />
            </div>

            <button type="submit" disabled={busy} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
              {busy ? "Criando…" : <>Criar agência <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Escolha um plano</div>
            {plans.length === 0 && <div className="text-xs text-muted-foreground">Carregando planos…</div>}
            {plans.map((p) => {
              const active = p.slug === f.planSlug;
              return (
                <button type="button" key={p.id} onClick={() => set("planSlug")(p.slug)}
                  className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-primary/60 bg-primary/10" : "border-border bg-card/60 hover:border-primary/40"}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.name}</div>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold">R$ {Number(p.price_monthly).toLocaleString("pt-BR")}<span className="text-xs font-normal text-muted-foreground">/mês</span></div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{p.max_hosts} hosts · {p.max_managers} gerentes</div>
                </button>
              );
            })}
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
