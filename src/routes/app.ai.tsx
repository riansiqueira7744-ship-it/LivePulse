import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { Sparkles, Send, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/ai")({
  component: AIPage,
  head: () => ({ meta: [{ title: "IA — Livepulse" }] }),
});

const prompts = [
  "Quais hosts estão em risco esta semana?",
  "Qual o melhor horário para postar?",
  "Preveja meu faturamento do próximo mês",
  "Sugira uma campanha para hosts de Beauty",
];

function AIPage() {
  const [msg, setMsg] = useState("");
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title="Copiloto IA"
        description="Seu consultor de negócios com acesso aos dados da agência"
        actions={<span className="inline-flex items-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-1 text-xs font-medium text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Online</span>}
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold">Livepulse Copilot</div>
            <div className="text-xs text-muted-foreground">Treinado com os dados da sua agência</div>
          </div>
        </div>

        <div className="my-6 space-y-4">
          <div className="flex gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
            <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-card border border-border p-4">
              <p className="text-sm leading-relaxed">
                Olá{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Assim que houver dados suficientes na sua agência, eu passo a gerar insights automáticos aqui.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pergunte qualquer coisa sobre hosts, metas, comissões, financeiro ou desempenho — respondo com base no que estiver registrado.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button key={p} onClick={()=>setMsg(p)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground">
                <Zap className="h-3 w-3" /> {p}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              value={msg}
              onChange={(e)=>setMsg(e.target.value)}
              placeholder="Pergunte qualquer coisa sobre sua agência…"
              className="h-14 w-full rounded-2xl border border-border bg-background/60 px-5 pr-14 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
