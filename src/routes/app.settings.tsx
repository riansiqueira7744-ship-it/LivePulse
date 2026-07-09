import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { useState } from "react";
import { Building2, Users, Shield, Palette, Globe, Bell, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Configurações — Livepulse" }] }),
});

const tabs = [
  { id: "profile", label: "Perfil", icon: Users },
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "team", label: "Equipe & Permissões", icon: Shield },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "language", label: "Idioma", icon: Globe },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Lock },
];

function SettingsPage() {
  const [active, setActive] = useState("company");
  return (
    <div>
      <PageHeader title="Configurações" description="Preferências da agência" />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={()=>setActive(t.id)} className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                active === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        <Card>
          {active === "company" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Dados da empresa</h3>
                <p className="text-xs text-muted-foreground">Aparecem nos relatórios e faturas.</p>
              </div>
              <Field label="Nome da agência" defaultValue="Livepulse Studio" />
              <Field label="CNPJ" defaultValue="42.198.331/0001-08" />
              <Field label="E-mail de contato" defaultValue="contato@livepulse.io" />
              <Field label="Site" defaultValue="https://livepulse.io" />
              <div className="flex justify-end gap-2 pt-4">
                <button className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Salvar alterações</button>
              </div>
            </div>
          )}
          {active === "appearance" && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold">Aparência</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Dark", "Light", "System"].map((t, i) => (
                  <div key={t} className={cn("cursor-pointer rounded-xl border-2 p-4 transition", i === 0 ? "border-primary" : "border-border hover:border-primary/40")}>
                    <div className={cn("mb-3 h-16 rounded-lg", i === 0 ? "bg-gradient-to-br from-background to-card" : i === 1 ? "bg-gradient-to-br from-white to-slate-200" : "bg-gradient-to-r from-background to-white")} />
                    <div className="text-sm font-medium">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {active === "notifications" && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Notificações</h3>
              {["Alertas de churn","Metas atingidas","Novos cadastros","Relatório semanal","Insights da IA"].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-sm">{n}</span>
                  <Toggle defaultChecked />
                </div>
              ))}
            </div>
          )}
          {active !== "company" && active !== "appearance" && active !== "notifications" && (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Em breve · Estamos finalizando esta seção.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input defaultValue={defaultValue} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  const [on, set] = useState(!!defaultChecked);
  return (
    <button onClick={()=>set(!on)} className={cn("relative h-6 w-11 rounded-full transition", on ? "bg-primary" : "bg-muted")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition", on ? "left-[calc(100%-1.375rem)]" : "left-0.5")} />
    </button>
  );
}
