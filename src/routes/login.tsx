import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, Lock, ArrowRight, Github, Shield, UserCog, Radio } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Entrar — Livepulse" }] }),
});

const ROLES: { role: UserRole; label: string; icon: typeof Shield; desc: string }[] = [
  { role: "admin",   label: "Administrador", icon: Shield,  desc: "Acesso total" },
  { role: "manager", label: "Gerente",       icon: UserCog, desc: "Time e metas" },
  { role: "host",    label: "Host",          icon: Radio,   desc: "Painel pessoal" },
];

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(role);
    navigate({ to: "/app/dashboard" });
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

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium transition hover:bg-card">
              <Github className="h-4 w-4" /> Continuar com Google
            </button>
            <div className="relative py-1 text-center text-xs text-muted-foreground">
              <span className="relative z-10 bg-background px-2">ou com e-mail</span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input defaultValue="carlos@livepulse.io" className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu?</a>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="password" defaultValue="demopassword" className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Entrar como (demo)</label>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {ROLES.map(({ role: r, label, icon: Icon, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition",
                      role === r
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", role === r && "text-primary")} />
                    <span className="text-[11px] font-semibold leading-tight">{label}</span>
                    <span className="text-[10px] leading-tight opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
              Entrar <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Novo por aqui? <Link to="/" className="text-primary hover:underline">Solicite uma demo</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border/60 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-2/10 to-transparent" />
        <div className="absolute inset-0 mesh-bg opacity-60" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="glass max-w-md rounded-2xl p-6 shadow-glow">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> IA copiloto
            </div>
            <div className="mt-3 font-display text-2xl font-semibold leading-snug">
              "Faturamento cresceu 14% esta semana. Ana Vitória bate a meta em 3 dias."
            </div>
            <div className="mt-4 flex items-center gap-3">
              <img src="https://api.dicebear.com/9.x/glass/svg?seed=owner" className="h-8 w-8 rounded-full" alt="" />
              <div className="text-xs text-muted-foreground">Insight gerado hoje · 06:24</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
