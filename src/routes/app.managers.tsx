import { createFileRoute } from "@tanstack/react-router";
import { Avatar } from "@/components/avatar";
import { useState } from "react";
import { Card, PageHeader } from "@/components/app-shell";
import { useManagers, useCreateManager, useUpdateManager, useDeleteManager, type DbManager } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth-context";
import { Users, Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/managers")({
  component: ManagersPage,
  head: () => ({ meta: [{ title: "Gerentes — Livepulse" }] }),
});

function ManagersPage() {
  const { can, currentAgency } = useAuth();
  const { data: managers = [], isLoading } = useManagers();
  const createMut = useCreateManager();
  const updateMut = useUpdateManager();
  const deleteMut = useDeleteManager();

  const [editing, setEditing] = useState<DbManager | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PageHeader
        title="Gerentes"
        description={`${currentAgency?.name ?? "Agência"} · ${managers.length} gerentes`}
        actions={can("managers:manage") ? (
          <button onClick={() => setCreating(true)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="mr-1 inline h-3.5 w-3.5" /> Novo gerente</button>
        ) : null}
      />

      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Carregando…</div>
      ) : managers.length === 0 ? (
        <Card><div className="py-8 text-center text-sm text-muted-foreground">Nenhum gerente cadastrado ainda.</div></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {managers.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-4">
                <img src={m.avatar_url ?? `https://api.dicebear.com/9.x/glass/svg?seed=${m.id}`} className="h-14 w-14 rounded-xl" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">Gerente · {m.team_size} hosts vinculados</div>
                  {m.email && <div className="text-xs text-muted-foreground">{m.email}</div>}
                </div>
                {can("managers:manage") && (
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setEditing(m)} className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-card"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Excluir gerente?")) deleteMut.mutate(m.id, { onSuccess: () => toast.success("Excluído") }); }} className="grid h-8 w-8 place-items-center rounded-md border border-border text-destructive hover:bg-card"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium hover:bg-background/40">
                <Users className="h-3.5 w-3.5" /> Ver equipe
              </button>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && currentAgency && (
        <ManagerDrawer
          manager={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(payload) => {
            if (editing) updateMut.mutate({ id: editing.id, patch: payload }, { onSuccess: () => { toast.success("Salvo"); setEditing(null); } });
            else createMut.mutate({ ...payload, agency_id: currentAgency.id, name: payload.name ?? "" }, { onSuccess: () => { toast.success("Gerente criado"); setCreating(false); } });
          }}
        />
      )}
    </div>
  );
}

function ManagerDrawer({ manager, onClose, onSave }: { manager: DbManager | null; onClose: () => void; onSave: (p: Partial<DbManager>) => void }) {
  const [name, setName] = useState(manager?.name ?? "");
  const [email, setEmail] = useState(manager?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(manager?.whatsapp ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{manager ? "Editar gerente" : "Novo gerente"}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="E-mail" value={email} onChange={setEmail} />
          <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
          <button onClick={() => onSave({ name, email: email || null, whatsapp: whatsapp || null })} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            {manager ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
