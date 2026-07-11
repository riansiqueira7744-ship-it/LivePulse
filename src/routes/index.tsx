import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Zap, Users, Wallet, Sparkles, MessageSquare, Trophy, Target,
  ArrowRight, Check, ChevronRight, Play, Shield, TrendingUp, BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Livepulse — Sistema Operacional para Agências de Live Streaming" },
      { name: "description", content: "A plataforma tudo-em-um para agências de live. Gerencie hosts, metas, financeiro e comissões com IA. Substitua Excel, PDFs e WhatsApp." },
    ],
  }),
});

function Landing() {
  return (
    <div className="mesh-bg min-h-screen">
      <Nav />
      <Hero />
      <Logos />
      <Features />
      <Screenshot />
      <Benefits />
      <Pricing />
      
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Recursos</a>
          <a href="#pricing" className="hover:text-foreground">Planos</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:block">Entrar</Link>
          <Link to="/app/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-[0_4px_16px_-4px] shadow-primary/50 hover:opacity-90">
            Demonstração <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 md:px-6 md:pt-24">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          Nova geração — IA nativa · Beta pública aberta
        </div>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          O sistema operacional das <br className="hidden md:block" />
          <span className="gradient-text">agências de live streaming</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Substitua Excel, PDFs e WhatsApp por uma plataforma única. Gerencie hosts, metas, comissões,
          financeiro e comunidade — com um copiloto de IA que trabalha por você.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/app/dashboard" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
            Explorar plataforma <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-medium backdrop-blur hover:bg-card">
            <Play className="h-4 w-4" /> Ver demo (2 min)
          </button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Sem cartão</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Setup em 5 min</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Migração assistida</span>
        </div>
      </div>

      {/* Hero mock */}
      <div className="relative mx-auto mt-16 max-w-6xl">
        <div className="absolute inset-x-10 -top-8 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="glass gradient-border relative overflow-hidden rounded-2xl shadow-[0_40px_80px_-20px] shadow-black/60">
          <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            <span className="ml-3 text-xs text-muted-foreground">app.livepulse.io/dashboard</span>
          </div>
          <div className="grid grid-cols-12 gap-4 p-4 md:p-6">
            <div className="col-span-3 hidden space-y-2 border-r border-border/60 pr-4 md:block">
              {["Dashboard","Hosts","Financeiro","Comissões","Metas","Ranking","IA"].map((l,i)=>(
                <div key={l} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${i===0 ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />{l}
                </div>
              ))}
            </div>
            <div className="col-span-12 space-y-4 md:col-span-9">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { l: "Receita mês", v: "R$ 197k", d: "+18.4%", c: "text-success" },
                  { l: "Lucro", v: "R$ 84k", d: "+22.1%", c: "text-success" },
                  { l: "Hosts ativos", v: "48", d: "+3", c: "text-success" },
                  { l: "Meta", v: "78%", d: "12d restantes", c: "text-muted-foreground" },
                ].map((k) => (
                  <div key={k.l} className="rounded-xl border border-border/60 bg-card/60 p-3">
                    <div className="text-[11px] text-muted-foreground">{k.l}</div>
                    <div className="mt-1 font-display text-xl font-semibold">{k.v}</div>
                    <div className={`text-[11px] ${k.c}`}>{k.d}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">Receita últimos 30 dias</div>
                  <div className="text-xs text-muted-foreground">Diária · R$</div>
                </div>
                <div className="flex h-28 items-end gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/70 to-chart-2/70" style={{ height: `${30 + Math.sin(i / 2) * 25 + Math.random() * 30}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  const items = ["TikTok Live", "Bigo Live", "Kick", "YouNow", "Kwai Live", "Meta Live"];
  return (
    <section className="border-y border-border/50 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Integra com as principais plataformas</div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((n) => (
            <span key={n} className="font-display text-lg font-semibold text-muted-foreground/70">{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Users, title: "Hosts", desc: "Cadastro completo, categorias, status e Star Host. Filtros e busca instantânea." },
    { icon: Wallet, title: "Financeiro", desc: "Entradas, saídas, fluxo de caixa e lucro em tempo real. Exportação com um clique." },
    { icon: Sparkles, title: "IA Copiloto", desc: "Análise diária do seu negócio. Detecção de churn, oportunidades e sugestões acionáveis." },
    { icon: Trophy, title: "Ranking", desc: "Competições internas, badges e reconhecimento automático de conquistas." },
    { icon: Target, title: "Metas", desc: "Metas por host, gerente e agência. Progresso em tempo real e alertas inteligentes." },
    { icon: MessageSquare, title: "Comunidade", desc: "Feed interno, treinamentos, eventos e cultura da agência num só lugar." },
  ];
  return (
    <section id="features" className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary">Plataforma completa</div>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Tudo que sua agência precisa. Zero planilhas.</h2>
          <p className="mt-4 text-muted-foreground">Módulos integrados que conversam entre si. Você abre um app, não dez.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 transition hover:border-primary/40 hover:bg-card">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <ChevronRight className="absolute right-5 top-6 h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Screenshot() {
  return (
    <section className="px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">IA nativa</div>
            <h2 className="mt-3 font-display text-4xl font-semibold">Um consultor de negócios trabalhando 24/7</h2>
            <p className="mt-4 text-muted-foreground">O copiloto Livepulse observa seus dados em tempo real e sugere ações. Detecta churn antes de acontecer, encontra o melhor horário de cada host e projeta metas com precisão.</p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Detecção automática de hosts em risco","Projeção de metas com 92% de acurácia","Recomendações de horário e categoria","Alertas inteligentes por WhatsApp e e-mail"].map((t)=>(
                <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Insight de hoje</span></div>
            {[
              { t: "Faturamento cresceu 14% na semana", d: "Impulsionado por Beauty e Dance", c: "success" },
              { t: "3 hosts com risco de churn", d: "Recomendo call de retenção", c: "warning" },
              { t: "Melhor janela: 20h–23h", d: "78% da receita ocorre aqui", c: "primary" },
            ].map((i) => (
              <div key={i.t} className="mt-2 rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-${i.c}`} />
                  <span className="text-sm font-medium">{i.t}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{i.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: TrendingUp, k: "+38%", v: "Aumento médio de receita" },
    { icon: Users, k: "-62%", v: "Redução no churn de hosts" },
    { icon: BarChart3, k: "12h", v: "Economizadas por semana" },
    { icon: Shield, k: "99.98%", v: "Uptime garantido" },
  ];
  return (
    <section className="px-4 py-16 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
        {items.map((i)=>{ const Icon = i.icon; return (
          <div key={i.v} className="rounded-2xl border border-border bg-card/60 p-6">
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-3xl font-semibold gradient-text">{i.k}</div>
            <div className="mt-1 text-sm text-muted-foreground">{i.v}</div>
          </div>
        );})}
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Starter", price: "R$ 297", desc: "Agências até 15 hosts", features: ["Dashboard completo","Financeiro básico","5 usuários","Suporte por chat"] },
    { name: "Growth", price: "R$ 697", desc: "Agências em expansão", features: ["Tudo do Starter","IA Copiloto ilimitada","Comunidade interna","Metas por host","API pública"], featured: true },
    { name: "Scale", price: "Custom", desc: "Operações enterprise", features: ["Tudo do Growth","White label","Multi-agência","Onboarding dedicado","SLA 99.99%"] },
  ];
  return (
    <section id="pricing" className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-primary">Planos</div>
          <h2 className="mt-3 font-display text-4xl font-semibold">Preço que cresce com você</h2>
          <p className="mt-3 text-muted-foreground">14 dias grátis em qualquer plano. Sem cartão de crédito.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((p)=>(
            <div key={p.name} className={`relative rounded-2xl border p-7 ${p.featured ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent shadow-glow" : "border-border bg-card/60"}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">Mais popular</div>}
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-4xl font-semibold">{p.price}</span>
                {p.price !== "Custom" && <span className="text-sm text-muted-foreground">/mês</span>}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{p.desc}</div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f)=>(<li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{f}</li>))}
              </ul>
              <Link to="/app/dashboard" className={`mt-7 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${p.featured ? "bg-primary text-primary-foreground shadow-glow hover:opacity-90" : "border border-border bg-card hover:bg-muted"}`}>
                Começar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



function FAQ() {
  const items = [
    { q: "Preciso migrar meus dados manualmente?", a: "Não. Nosso time importa suas planilhas gratuitamente em até 48h após o cadastro." },
    { q: "Funciona para agências de qualquer plataforma?", a: "Sim. Integramos TikTok, Bigo, Kick, Kwai, YouNow, Meta e outras. O que não integramos, importamos via CSV." },
    { q: "Meus hosts também acessam o sistema?", a: "Sim. Cada host tem um painel próprio com metas, ganhos e ranking. Gerentes têm outro perfil, donos outro." },
    { q: "A IA usa meus dados para treinar modelos?", a: "Nunca. Seus dados são seus. Não treinamos modelos com informações de clientes." },
    { q: "Posso cancelar quando quiser?", a: "Sim. Sem multa, sem burocracia. Cancelamento em 1 clique dentro do painel." },
  ];
  return (
    <section id="faq" className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-4xl font-semibold">Perguntas frequentes</h2>
        <div className="mt-10 space-y-2">
          {items.map((f, i) => (
            <details key={i} className="group rounded-xl border border-border bg-card/60 p-5 open:bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-chart-2/10 to-transparent p-12 text-center shadow-glow">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Pronto para profissionalizar sua agência?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Setup em 5 minutos. Migração assistida gratuita. Sem cartão de crédito.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/app/dashboard" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90">Explorar plataforma</Link>
          <Link to="/login" className="rounded-xl border border-border bg-card/60 px-6 py-3 text-sm font-semibold">Entrar</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 px-4 py-10 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-2"><Zap className="h-3.5 w-3.5 text-primary-foreground" /></div>
          <span className="font-display font-semibold">Livepulse</span>
          <span className="text-xs text-muted-foreground">© 2026</span>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Termos</a>
          <a href="#" className="hover:text-foreground">Privacidade</a>
          <a href="#" className="hover:text-foreground">Status</a>
          <a href="#" className="hover:text-foreground">Contato</a>
        </div>
      </div>
    </footer>
  );
}
