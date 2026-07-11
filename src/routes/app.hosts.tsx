import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, currency } from "@/components/app-shell";
import { useHosts, useCreateHost, useUpdateHost, useDeleteHost, useManagers, type DbHost } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Search, Plus, MoreHorizontal, ArrowUpDown, X, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/hosts")({
  component: HostsPage,
  head: () => ({ meta: [{ title: "Hosts — Livepulse" }] }),
});

const statusColors: Record<DbHost["status"], string> = {
  active: "bg-success/15 text-success",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning",
};
const statusLabel: Record<DbHost["status"], string> = {
  active: "Ativo", inactive: "Inativo", pending: "Pendente",
};

const PLATFORMS: DbHost["platform"][] = ["tiktok", "kwai", "bigo", "other"];

function HostsPage() {
  const { can, currentAgency, user } = useAuth();
  const { data: hosts = [], isLoading } = useHosts();
  const { data: managers = [] } = useManagers();
  const createMut = useCreateHost();
  const updateMut = useUpdateHost();
  const deleteMut = useDeleteHost();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [editing, setEditing] = useState<DbHost | null>(null);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);

  const cats = ["Todas", ...Array.from(new Set(hosts.map((h) => h.category).filter(Boolean) as string[]))];
  const rows = hosts.filter((h) =>
    (cat === "Todas" || h.category === cat) &&
    (q === "" || h.nickname.toLowerCase().includes(q.toLowerCase()))
  );

  const scopeLabel = user?.role === "manager" ? `Seu time em ${currentAgency?.name ?? ""}` : user?.role === "host" ? "Seu perfil" : (currentAgency?.name ?? "Agência");

  return (
    <div>
      <PageHeader
        title="Hosts"
        description={`${scopeLabel} · ${hosts.length} cadastrados`}
        actions={can("hosts:manage") ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setInviting(true)} className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold hover:border-primary/50">
              <Search className="mr-1 inline h-3.5 w-3.5" /> Convidar por Livepulse ID
            </button>
            <button onClick={() => setCreating(true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              <Plus className="mr-1 inline h-3.5 w-3.5" /> Novo host
            </button>
          </div>
        ) : null}
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por nickname…" className="h-9 w-full rounded-lg border border-border bg-background/50 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
            {cats.map((c)=>(
              <button key={c} onClick={()=>setCat(c)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition", cat === c ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>{c}</button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Host</th>
                <th className="px-4 py-3 font-medium">Plataforma</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Gerente</th>
                <th className="px-4 py-3 text-right font-medium"><button className="inline-flex items-center gap-1">Ganhos <ArrowUpDown className="h-3 w-3" /></button></th>
                <th className="px-4 py-3 text-right font-medium">Horas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((h) => (
                <tr key={h.id} className="transition hover:bg-background/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={h.avatar_url ?? `https://api.dicebear.com/9.x/glass/svg?seed=${h.id}`} alt="" className="h-9 w-9 rounded-full" />
                      <span className="truncate font-medium">{h.nickname}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 uppercase text-xs text-muted-foreground">{h.platform}</td>
                  <td className="px-4 py-3"><span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs">{h.category ?? "—"}</span></td>
                  <td className="px-4 py-3"><span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", statusColors[h.status])}>{statusLabel[h.status]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{h.manager?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{currency(Number(h.earnings_total))}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{Number(h.live_hours)}h</td>
                  <td className="px-4 py-3">
                    {can("hosts:manage") && (
                      <div className="relative">
                        <button onClick={() => setMenu(menu === h.id ? null : h.id)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>
                        {menu === h.id && (
                          <div className="absolute right-0 top-8 z-10 w-40 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
                            <button onClick={() => { setEditing(h); setMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-card"><Edit className="h-3.5 w-3.5" />Editar</button>
                            <button onClick={() => { if (confirm("Excluir host?")) deleteMut.mutate(h.id, { onSuccess: () => toast.success("Host excluído") }); setMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-card"><Trash2 className="h-3.5 w-3.5" />Excluir</button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">Nenhum host cadastrado. Crie o primeiro para começar.</td></tr>
              )}
              {isLoading && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">Carregando…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {(creating || editing) && currentAgency && (
        <HostDrawer
          host={editing}
          managers={managers}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(payload) => {
            if (editing) updateMut.mutate({ id: editing.id, patch: payload }, { onSuccess: () => { toast.success("Salvo"); setEditing(null); } });
            else createMut.mutate({ ...payload, agency_id: currentAgency.id, nickname: payload.nickname ?? "" }, { onSuccess: () => { toast.success("Host criado"); setCreating(false); } });
          }}
        />
      )}
    </div>
  );
}

function HostDrawer({ host, managers, onClose, onSave }: { host: DbHost | null; managers: { id: string; name: string }[]; onClose: () => void; onSave: (p: Partial<DbHost>) => void }) {
  const [nickname, setNickname] = useState(host?.nickname ?? "");
  const [platform, setPlatform] = useState<DbHost["platform"]>(host?.platform ?? "tiktok");
  const [category, setCategory] = useState(host?.category ?? "");
  const [status, setStatus] = useState<DbHost["status"]>(host?.status ?? "active");
  const [managerId, setManagerId] = useState(host?.manager_id ?? "");
  const [whatsapp, setWhatsapp] = useState(host?.whatsapp ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{host ? "Editar host" : "Novo host"}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Input label="Nickname" value={nickname} onChange={setNickname} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Plataforma" value={platform} onChange={(v) => setPlatform(v as DbHost["platform"])} options={PLATFORMS.map((p) => ({ v: p, l: p.toUpperCase() }))} />
            <Select label="Status" value={status} onChange={(v) => setStatus(v as DbHost["status"])} options={[{v:"active",l:"Ativo"},{v:"pending",l:"Pendente"},{v:"inactive",l:"Inativo"}]} />
          </div>
          <Input label="Categoria" value={category} onChange={setCategory} placeholder="Ex.: Beleza, Games, Música…" />
          <Input label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="+55 11 9…" />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Gerente</label>
            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
              <option value="">— Sem gerente —</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
          <button onClick={() => onSave({ nickname, platform, category: category || null, status, manager_id: managerId || null, whatsapp: whatsapp || null })} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {host ? "Salvar" : "Criar host"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-2 text-sm">
        {options.map((o) => <option key={o.v} value={o.v} className="bg-popover">{o.l}</option>)}
      </select>
    </div>
  );
}
