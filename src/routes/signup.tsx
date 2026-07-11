import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, User, Building2, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupChoice,
  head: () => ({ meta: [{ title: "Criar conta — Livepulse" }] }),
});

function SignupChoice() {
  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>

        <div className="mt-14 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Como você quer começar?</h1>
          <p className="mt-3 text-sm text-muted-foreground">Escolha o tipo de conta ideal para você</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card
            to="/signup/host"
            icon={<User className="h-5 w-5" />}
            badge="Grátis"
            title="Sou Host"
            desc="Crie sua conta gratuita, receba seu Livepulse ID e conecte-se a uma agência."
            perks={["Cadastro 100% grátis", "Livepulse ID único e permanente", "Receba convites de agências", "Perfil profissional"]}
            cta="Criar conta grátis"
          />
          <Card
            to="/signup/agency"
            icon={<Building2 className="h-5 w-5" />}
            badge="Assinatura"
            title="Sou uma Agência"
            desc="Gerencie hosts, gerentes, metas, comissões e financeiro em um só lugar."
            perks={["Painel completo de gestão", "Gerentes ilimitados no plano", "Financeiro e comissões", "Suporte dedicado"]}
            cta="Criar agência"
            highlight
          />
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

function Card({ to, icon, title, desc, perks, cta, badge, highlight }: { to: string; icon: React.ReactNode; title: string; desc: string; perks: string[]; cta: string; badge: string; highlight?: boolean }) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col rounded-2xl border p-6 transition hover:-translate-y-0.5 ${highlight ? "border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card shadow-glow" : "border-border bg-card/60 hover:border-primary/40"}`}
    >
      <div className="flex items-center justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">{icon}</div>
        <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{badge}</span>
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-success" /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
        {cta} <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
