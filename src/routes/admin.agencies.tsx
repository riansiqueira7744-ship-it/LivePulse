import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { mockAgencies } from "@/lib/mock-agencies";
import { AGENCY_STATUS_LABELS, PLAN_LABELS } from "@/lib/constants";
import type { Agency, AgencyStatus, PlanTier } from "@/types";
import { useAuth } from "@/lib/auth-context";
import {
  Search, Plus, Filter, MoreHorizontal, LogIn, Pause, Play, Ban, Trash2, Edit,
  Users, UserCog, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/agencies")({
  component: AgenciesPage,
  head: () => ({ meta: [{ title: "Agências — Super Admin · Livepulse" }] }),
});

const ALL_STATUSES: AgencyStatus[] = ["active", "trial", "suspended", "canceled"];
const ALL_PLANS: PlanTier[] = ["starter", "growth", "scale", "enterprise"];

function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>(mockAgencies);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AgencyStatus | "all">("all");
  const [plan, setPlan] = useState<PlanTier | "all">("all");
  const [country, setCountry] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<Agency | null>(null);
  const [creating, setCreating] = useState(false);
  const { switchAgency } = useAuth();
  const navigate = useNavigate();

  const countries = useMemo(() => Array.from(new Set(agencies.map((a) => a.country))), [agencies]);

  const filtered = agencies.filter((a) => {
    if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (status !== "all" && a.status !== status) return false;
    if (plan !== "all" && a.plan !== plan) return false;
    if (country !== "all" && a.country !== country) return false;
    return true;
  });

  const update = (id: string, patch: Partial<Agency>) =>
    setAgencies((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const remove = (id: string) => setAgencies((prev) => prev.filter((a) => a.id !== id));

  const access = (a: Agency) => { switchAgency(a.id); navigate({ to: "/app/dashboard" }); };

  return (
    <div>
      <PageHeader
        title="Agências"
        description={`${agencies.length} agências cadastradas na plataforma`}
        actions={
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> Nova agência
          </button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar agência…" className="h-9 w-full rounded-lg border border-border bg-background/40 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <SelectChip icon={<Filter className="h-3.5 w-3.5" />} label="Status" value={status} onChange={(v) => setStatus(v as AgencyStatus | "all")}
            options={[{ v: "all", l: "Todos" }, ...ALL_STATUSES.map((s) => ({ v: s, l: AGENCY_STATUS_LABELS[s] }))]} />
          <SelectChip label="Plano" value={plan} onChange={(v) => setPlan(v as PlanTier | "all")}
            options={[{ v: "all", l: "Todos" }, ...ALL_PLANS.map((p) => ({ v: p, l: PLAN_LABELS[p] }))]} />
          <SelectChip label="País" value={country} onChange={setCountry}
            options={[{ v: "all", l: "Todos" }, ...countries.map((c) => ({ v: c, l: c }))]} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Agência</th>
                <th className="py-2 pr-3 font-medium">Dono</th>
                <th className="py-2 pr-3 font-medium">Plano</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Equipe</th>
                <th className="py-2 pr-3 font-medium">MRR</th>
                <th className="py-2 pr-3 font-medium">País</th>
                <th className="py-2 pr-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="group border-b border-border/50 last:border-0 hover:bg-card/50">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <img src={a.logo_url ?? ""} className="h-9 w-9 rounded-lg border border-border" alt="" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{a.name}</div>
                        <div className="truncate text-xs text-muted-foreground">/{a.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground">{a.owner_id.replace("usr_owner_", "Owner #")}</td>
                  <td className="py-3 pr-3"><span className="rounded-md border border-border bg-card/60 px-2 py-0.5 text-[11px] font-semibold">{PLAN_LABELS[a.plan]}</span></td>
                  <td className="py-3 pr-3">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {a.hosts_count}</span>
                      <span className="inline-flex items-center gap-1"><UserCog className="h-3 w-3" /> {a.managers_count}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-semibold">{currency(a.mrr)}</td>
                  <td className="py-3 pr-3 text-xs">{a.country}</td>
                  <td className="py-3 pr-3 text-right">
                    <div className="relative inline-flex items-center gap-1">
                      <button onClick={() => access(a)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-2 py-1 text-[11px] font-semibold hover:border-primary/50 hover:text-primary">
                        <LogIn className="h-3 w-3" /> Acessar
                      </button>
                      <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)} className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card/60 hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === a.id && (
                        <div className="absolute right-0 top-8 z-10 w-48 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
                          <MenuItem icon={<Edit className="h-3.5 w-3.5" />} onClick={() => { setEditing(a); setOpenMenu(null); }}>Editar</MenuItem>
                          {a.status !== "active" && (
                            <MenuItem icon={<Play className="h-3.5 w-3.5" />} onClick={() => { update(a.id, { status: "active" }); setOpenMenu(null); }}>Reativar</MenuItem>
                          )}
                          {a.status === "active" && (
                            <MenuItem icon={<Pause className="h-3.5 w-3.5" />} onClick={() => { update(a.id, { status: "suspended" }); setOpenMenu(null); }}>Suspender</MenuItem>
                          )}
                          <MenuItem icon={<Ban className="h-3.5 w-3.5" />} onClick={() => { update(a.id, { status: "canceled" }); setOpenMenu(null); }}>Bloquear</MenuItem>
                          <MenuItem icon={<Trash2 className="h-3.5 w-3.5" />} danger onClick={() => { remove(a.id); setOpenMenu(null); }}>Excluir</MenuItem>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">Nenhuma agência encontrada com esses filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {(creating || editing) && (
        <AgencyDrawer
          agency={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(a) => {
            if (editing) update(editing.id, a);
            else setAgencies((prev) => [{ ...(a as Agency), id: `agc_${Date.now()}` }, ...prev]);
            setCreating(false); setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: AgencyStatus }) {
  const cls =
    status === "active"    ? "bg-success/15 text-success"
    : status === "trial"     ? "bg-primary/15 text-primary"
    : status === "suspended" ? "bg-warning/15 text-warning"
                              : "bg-destructive/15 text-destructive";
  return <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", cls)}>{AGENCY_STATUS_LABELS[status]}</span>;
}

function SelectChip({ icon, label, value, onChange, options }: { icon?: React.ReactNode; label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-1.5 text-xs">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-xs font-medium focus:outline-none">
        {options.map((o) => <option key={o.v} value={o.v} className="bg-popover">{o.l}</option>)}
      </select>
    </label>
  );
}

function MenuItem({ children, icon, onClick, danger }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-card", danger && "text-destructive")}>
      {icon}{children}
    </button>
  );
}

function AgencyDrawer({ agency, onClose, onSave }: { agency: Agency | null; onClose: () => void; onSave: (a: Partial<Agency>) => void }) {
  const [name, setName] = useState(agency?.name ?? "");
  const [slug, setSlug] = useState(agency?.slug ?? "");
  const [country, setCountry] = useState(agency?.country ?? "BR");
  const [plan, setPlan] = useState<PlanTier>(agency?.plan ?? "starter");
  const [status, setStatus] = useState<AgencyStatus>(agency?.status ?? "trial");

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">{agency ? "Editar agência" : "Nova agência"}</h2>
            <p className="text-xs text-muted-foreground">Preencha os dados abaixo</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Field label="Nome" value={name} onChange={setName} placeholder="Ex.: Neon Stars Agency" />
          <Field label="Slug" value={slug} onChange={setSlug} placeholder="neon-stars" />
          <Field label="País (ISO)" value={country} onChange={setCountry} placeholder="BR" />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Plano" value={plan} onChange={(v) => setPlan(v as PlanTier)} options={ALL_PLANS.map((p) => ({ v: p, l: PLAN_LABELS[p] }))} />
            <SelectField label="Status" value={status} onChange={(v) => setStatus(v as AgencyStatus)} options={ALL_STATUSES.map((s) => ({ v: s, l: AGENCY_STATUS_LABELS[s] }))} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
          <button
            onClick={() => onSave({ name, slug, country, plan, status, hosts_count: agency?.hosts_count ?? 0, managers_count: agency?.managers_count ?? 0, mrr: agency?.mrr ?? 0, owner_id: agency?.owner_id ?? "usr_owner_new", logo_url: agency?.logo_url ?? null, created_at: agency?.created_at ?? new Date().toISOString() })}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {agency ? "Salvar alterações" : "Criar agência"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20">
        {options.map((o) => <option key={o.v} value={o.v} className="bg-popover">{o.l}</option>)}
      </select>
    </div>
  );
}
