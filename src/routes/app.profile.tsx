import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { Mail, Phone, MapPin, Calendar, Award, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Perfil — Livepulse" }] }),
});

const badges = [
  { name: "Owner", color: "from-primary to-chart-2" },
  { name: "Early Adopter", color: "from-warning to-destructive" },
  { name: "100+ hosts", color: "from-success to-chart-2" },
];

function ProfilePage() {
  return (
    <div>
      <PageHeader title="Meu perfil" description="Suas informações e atividade" />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="text-center">
          <div className="relative mx-auto h-24 w-24">
            <img src="https://api.dicebear.com/9.x/glass/svg?seed=owner" className="h-24 w-24 rounded-2xl ring-2 ring-primary/40" alt="" />
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-success text-background ring-4 ring-card">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          </div>
          <div className="mt-4 font-display text-xl font-semibold">Carlos Almeida</div>
          <div className="text-sm text-muted-foreground">Owner · Livepulse Studio</div>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {badges.map((b)=>(
              <span key={b.name} className={`rounded-md bg-gradient-to-r ${b.color} px-2 py-0.5 text-[10px] font-semibold text-background`}>{b.name}</span>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> carlos@livepulse.io</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +55 11 98765-4321</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> São Paulo, BR</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Membro desde Jan 2024</div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <TrendingUp className="h-4 w-4 text-success" />
              <div className="mt-3 font-display text-3xl font-semibold">{currency(1284000)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Receita total gerida</div>
            </Card>
            <Card>
              <Award className="h-4 w-4 text-warning" />
              <div className="mt-3 font-display text-3xl font-semibold">48</div>
              <div className="mt-1 text-xs text-muted-foreground">Hosts sob sua gestão</div>
            </Card>
            <Card>
              <Calendar className="h-4 w-4 text-primary" />
              <div className="mt-3 font-display text-3xl font-semibold">142</div>
              <div className="mt-1 text-xs text-muted-foreground">Dias consecutivos ativo</div>
            </Card>
          </div>

          <Card title="Sobre">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fundador e CEO da Livepulse Studio. Atuo há mais de 6 anos no mercado de live streaming,
              tendo escalado agências de 10 para mais de 200 hosts. Apaixonado por sistemas, dados e cultura de time.
            </p>
          </Card>

          <Card title="Atividade recente">
            <div className="space-y-3">
              {["Você aprovou 2 novos cadastros","Bianca Souza atingiu 90% da meta","Relatório mensal gerado","Nova regra de comissão publicada"].map((a,i)=>(
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="text-sm">{a}<div className="text-[11px] text-muted-foreground">há {i+1}h</div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
