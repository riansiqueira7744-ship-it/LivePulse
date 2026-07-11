import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Mail, Lock, ArrowRight, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Livepulse" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/app/dashboard" });
  }, [loading, isAuthenticated, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bem-vindo!");
    navigate({ to: "/app/dashboard" });
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app/dashboard" },
    });
    if (error) toast.error(error.message);
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

          <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesse o painel da sua agência.</p>

          <form className="mt-8 space-y-4" onSubmit={handleEmailLogin}>
            <button type="button" onClick={handleGoogle} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium transition hover:bg-card">
              <Chrome className="h-4 w-4" /> Continuar com Google
            </button>
            <div className="relative py-1 text-center text-xs text-muted-foreground">
              <span className="relative z-10 bg-background px-2">ou com e-mail</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueceu?</Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
              {submitting ? "Entrando…" : <>Entrar <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Novo por aqui? <Link to="/signup" className="text-primary hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border/60 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-2/10 to-transparent" />
        <div className="absolute inset-0 mesh-bg opacity-60" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="glass max-w-md rounded-2xl p-6 shadow-glow">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Livepulse
            </div>
            <div className="mt-3 font-display text-2xl font-semibold leading-snug">
              "O sistema operacional que substitui planilhas, PDFs e WhatsApp da sua agência."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
