import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatCard, currency } from "@/components/app-shell";
import { revenueSeries } from "@/lib/mock-data";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Download, ArrowUp, ArrowDown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

export const Route = createFileRoute("/app/finance")({
  component: FinancePage,
  head: () => ({ meta: [{ title: "Financeiro — Livepulse" }] }),
});

const txs = [
  { id: "TX-1042", desc: "Repasse TikTok Live · Semana 45", type: "in", amount: 48920, date: "07/11", cat: "Receita plataforma" },
  { id: "TX-1041", desc: "Comissão gerente · Marina Alves", type: "out", amount: 4840, date: "07/11", cat: "Comissão" },
  { id: "TX-1040", desc: "Pagamento host · Bianca Souza", type: "out", amount: 5210, date: "07/11", cat: "Repasse host" },
  { id: "TX-1039", desc: "Assinatura software · Livepulse Growth", type: "out", amount: 697, date: "05/11", cat: "SaaS" },
  { id: "TX-1038", desc: "Repasse Bigo Live · Semana 45", type: "in", amount: 21440, date: "05/11", cat: "Receita plataforma" },
  { id: "TX-1037", desc: "Bônus Star Host · Ana Vitória", type: "out", amount: 1500, date: "04/11", cat: "Bônus" },
  { id: "TX-1036", desc: "Equipamento streaming · Ring lights", type: "out", amount: 2380, date: "03/11", cat: "Equipamento" },
];

function FinancePage() {
  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Fluxo de caixa em tempo real"
        actions={<button className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs"><Download className="mr-1 inline h-3.5 w-3.5" /> Exportar CSV</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard gradient label="Entradas" value={currency(197840)} delta="+18.4%" deltaLabel="mês" positive icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Saídas" value={currency(113630)} delta="+9.1%" deltaLabel="mês" positive={false} icon={<TrendingDown className="h-4 w-4" />} />
        <StatCard label="Lucro líquido" value={currency(84210)} delta="+22.1%" deltaLabel="margem 42.6%" positive icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Saldo em caixa" value={currency(348920)} delta="+R$ 84k" deltaLabel="este mês" positive icon={<PiggyBank className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Fluxo de caixa · 30 dias">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={revenueSeries}>
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v/1000}k`} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.018 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="receita" fill="oklch(0.72 0.19 305)" radius={[6,6,0,0]} />
                <Bar dataKey="despesa" fill="oklch(0.28 0.05 285)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Evolução do lucro">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={revenueSeries}>
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v/1000}k`} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.018 265)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                <Line dataKey="lucro" stroke="oklch(0.72 0.17 155)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4" title="Movimentações">
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Descrição</th>
                <th className="px-4 py-2.5 font-medium">Categoria</th>
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {txs.map((t) => (
                <tr key={t.id} className="transition hover:bg-background/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`grid h-7 w-7 place-items-center rounded-lg ${t.type === "in" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {t.type === "in" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
                      </div>
                      <span className="font-medium">{t.desc}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs">{t.cat}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.type === "in" ? "text-success" : "text-foreground"}`}>{t.type === "in" ? "+" : "−"} {currency(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
