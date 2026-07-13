import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Zap, ArrowRight, User, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup/agency")({
  component: AgencySignupRedirect,
  head: () => ({ meta: [{ title: "Solicitar Agência — Livepulse" }] }),
});

// A partir da V1: existe apenas UMA conta por pessoa.
// Este endpoint agora é um redirecionador — quem já tem conta vai direto para
// /request-agency; quem não tem, precisa criar a conta gratuita antes.
function AgencySignupRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) navigate({ to: "/request-agency", replace: true });
  }, [loading, user, navigate]);

  if (loading || user) {
    return <div className="mesh-bg grid min-h-screen place-items-center text-sm text-muted-foreground">Redirecionando…</div>;
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>

        <div className="mt-12 rounded-3xl border border-border bg-card/60 p-8">
          <span className="inline-block rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">Uma conta por pessoa</span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Para abrir sua Agência, use sua conta Livepulse</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            No Livepulse, cada pessoa possui apenas uma conta. Se você ainda não tem uma, crie sua conta gratuita.
            Depois de entrar, você poderá solicitar a criação da sua Agência em poucos cliques.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link to="/signup/host" className="group flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 p-4 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary"><User className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-semibold">Criar minha conta grátis</div>
                  <div className="text-[11px] text-muted-foreground">Depois solicito minha Agência</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login" className="group flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/40">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground"><Building2 className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-semibold">Já tenho conta</div>
                  <div className="text-[11px] text-muted-foreground">Entrar e solicitar Agência</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/signup" className="text-primary hover:underline">← Voltar</Link>
        </p>
      </div>
    </div>
  );
}
