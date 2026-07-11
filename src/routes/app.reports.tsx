import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { FileBarChart, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Relatórios — Livepulse" }] }),
});

const templates = [
  { title: "Fechamento mensal", icon: Calendar },
  { title: "Performance de hosts", icon: TrendingUp },
  { title: "Análise financeira", icon: FileBarChart },
];

function ReportsPage() {
  return (
    <div>
      <PageHeader title="Relatórios" description="Gere relatórios com os dados da sua agência" actions={<button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Gerar novo</button>} />

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
        <div className="py-12 text-center text-sm text-muted-foreground">Nenhum relatório gerado ainda.</div>
      </Card>
    </div>
  );
}
