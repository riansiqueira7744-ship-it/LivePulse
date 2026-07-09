import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { aiInsights } from "@/lib/mock-data";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, Send, Zap } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/ai")({
  component: AIPage,
  head: () => ({ meta: [{ title: "IA — Livepulse" }] }),
});

const iconFor: Record<string, any> = { growth: TrendingUp, risk: AlertTriangle, opportunity: Lightbulb, goal: Target };
const colorFor: Record<string, string> = {
  growth: "text-success bg-success/15",
  risk: "text-warning bg-warning/15",
  opportunity: "text-chart-2 bg-chart-2/15",
  goal: "text-primary bg-primary/15",
};

const prompts = [
  "Quais hosts estão em risco esta semana?",
  "Qual o melhor horário para postar?",
  "Preveja meu faturamento do próximo mês",
  "Sugira uma campanha para hosts de Beauty",
];

function AIPage() {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <PageHeader
        title="Copiloto IA"
        description="Seu consultor de negócios com acesso a todos os dados da agência"
        actions={<span className="inline-flex items-center gap-1.5 rounded-lg bg-success/15 px-2.5 py-1 text-xs font-medium text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Online</span>}
      />

      {/* Insights */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {aiInsights.map((i, idx) => {
          const Icon = iconFor[i.type];
          return (
            <div key={idx} className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 transition hover:border-primary/30">
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${colorFor[i.type].split(" ")[1]} blur-3xl opacity-40`} />
              <div className="relative flex items-start gap-4">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorFor[i.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{i.title}</h3>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{i.confidence}% confiança</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.detail}</p>
                  <button className="mt-3 text-xs font-semibold text-primary hover:underline">Ver detalhes →</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold">Livepulse Copilot</div>
            <div className="text-xs text-muted-foreground">Treinado com seus dados de agência</div>
          </div>
        </div>

        <div className="my-6 space-y-4">
          <div className="flex gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
            <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-card border border-border p-4">
              <p className="text-sm leading-relaxed">
                Bom dia, Carlos. Analisei seus dados desta manhã e tenho <strong>3 pontos importantes</strong> pra você:
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li>• Sua receita cresceu <span className="font-semibold text-success">14%</span> na semana — puxada por Beauty e Dance.</li>
                <li>• <span className="font-semibold text-warning">João, Renata e Fernanda</span> estão 30% abaixo do baseline. Sugiro call de retenção hoje.</li>
                <li>• Sua melhor janela é <span className="font-semibold">20h–23h</span>. Hosts offline nesse período perdem em média R$ 480/dia.</li>
              </ul>
              <p className="mt-3 text-sm">Quer que eu prepare um plano de ação?</p>
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
