import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Criar conta — Livepulse" }] }),
});

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || `agencia-${Date.now()}`;
}

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/app/dashboard",
          data: { name },
        },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) { toast.info("Verifique seu e-mail para confirmar a conta."); navigate({ to: "/login" }); return; }

      // Wait for a session (project may not require email confirmation)
      const session = data.session ?? (await supabase.auth.getSession()).data.session;
      if (!session) {
        toast.info("Cadastro criado. Confirme seu e-mail para acessar.");
        navigate({ to: "/login" });
        return;
      }

      // Create the agency
      const slug = slugify(agencyName);
      const { data: agency, error: agencyErr } = await supabase.from("agencies").insert({
        name: agencyName, slug, status: "trial", plan: "starter", owner_id: userId,
      }).select().single();
      if (agencyErr) throw agencyErr;

      // Link profile to agency
      await supabase.from("profiles").update({ agency_id: agency.id, name }).eq("id", userId);

      // Assign owner role
      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: userId, role: "agency_owner", agency_id: agency.id,
      });
      if (roleErr) throw roleErr;

      // Bootstrap subscription
      await supabase.from("subscriptions").insert({
        agency_id: agency.id, plan: "starter", status: "trial", price_monthly: 0, seats: 5,
      });

      toast.success(`Agência "${agencyName}" criada!`);
      navigate({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao criar conta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mesh-bg relative grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
              <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold">Livepulse</span>
          </Link>

          <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Crie sua agência</h1>
          <p className="mt-2 text-sm text-muted-foreground">Comece grátis. Sem cartão de crédito.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Field icon={<User className="h-4 w-4" />} label="Seu nome" value={name} onChange={setName} required />
            <Field icon={<Building2 className="h-4 w-4" />} label="Nome da agência" value={agencyName} onChange={setAgencyName} required />
            <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={email} onChange={setEmail} required />
            <Field icon={<Lock className="h-4 w-4" />} label="Senha" type="password" value={password} onChange={setPassword} required />

            <button type="submit" disabled={submitting} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
              {submitting ? "Criando…" : <>Criar conta <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border/60 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-2/10 to-transparent" />
        <div className="absolute inset-0 mesh-bg opacity-60" />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, icon, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; icon: React.ReactNode; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
    </div>
  );
}
