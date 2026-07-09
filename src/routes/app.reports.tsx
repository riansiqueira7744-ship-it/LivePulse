import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { FileBarChart, Download, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Relatórios — Livepulse" }] }),
});

const reports = [
  { title: "Fechamento mensal · Novembro", desc: "Receita, comissões e repasses consolidados", date: "01/12/2026", size: "2.4 MB", type: "PDF" },
  { title: "Performance por host · Semana 45", desc: "Ganhos, horas e ranking individual", date: "07/11/2026", size: "1.1 MB", type: "XLSX" },
  { title: "Análise de churn · Outubro", desc: "Hosts em risco e recomendações de retenção", date: "01/11/2026", size: "3.2 MB", type: "PDF" },
  { title: "Fluxo de caixa · Q4 2026", desc: "Projeção trimestral com cenários", date: "15/10/2026", size: "4.8 MB", type: "PDF" },
  { title: "Comissões por gerente · Outubro", desc: "Repasses e bonificações detalhados", date: "01/11/2026", size: "890 KB", type: "XLSX" },
];

const templates = [
  { title: "Fechamento mensal", icon: Calendar },
  { title: "Performance de hosts", icon: TrendingUp },
  { title: "Análise financeira", icon: FileBarChart },
];

function ReportsPage() {
  return (
    <div>
      <PageHeader title="Relatórios" description="Gerados automaticamente pela plataforma" actions={<button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Gerar novo</button>} />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.title} className="group flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-left transition hover:border-primary/40 hover:bg-card/60">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-muted-foreground">Template pronto</div>
              </div>
            </button>
          );
        })}
      </div>

      <Card title="Relatórios recentes">
        <div className="divide-y divide-border/60">
          {reports.map((r) => (
            <div key={r.title} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-bold ${r.type === "PDF" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                {r.type}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.title}</div>
                <div className="truncate text-xs text-muted-foreground">{r.desc}</div>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground md:block">
                <div>{r.date}</div>
                <div>{r.size}</div>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/40 hover:bg-background/70">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
