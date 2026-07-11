import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Card, PageHeader } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Mail, Check, X, Building2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/invites")({
  component: InvitesPage,
  head: () => ({ meta: [{ title: "Convites — Livepulse" }] }),
});

type Invite = {
  id: string; agency_id: string; livepulse_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  message: string | null; created_at: string;
  agency?: { name: string; logo_url: string | null } | null;
};

function InvitesPage() {
  const { user, refresh } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("invitations")
      .select("id, agency_id, livepulse_id, status, message, created_at, agencies(name, logo_url)")
      .order("created_at", { ascending: false });
    setInvites(((data ?? []) as unknown as Array<Invite & { agencies?: { name: string; logo_url: string | null } | null }>)
      .map((r) => ({ ...r, agency: r.agencies ?? null })));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const accept = async (id: string) => {
    const { error } = await supabase.rpc("accept_invitation", { _invitation_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Convite aceito! Bem-vindo à agência.");
    await refresh();
    await load();
  };
  const decline = async (id: string) => {
    const { error } = await supabase.rpc("decline_invitation", { _invitation_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Convite recusado");
    await load();
  };
  const copyId = () => {
    if (!user?.livepulse_id) return;
    navigator.clipboard.writeText(user.livepulse_id);
    toast.success("Livepulse ID copiado");
  };

  const pending = invites.filter((i) => i.status === "pending");
  const history = invites.filter((i) => i.status !== "pending");

  return (
    <div>
      <PageHeader title="Convites" description="Convites de agências para você" />

      {user?.livepulse_id && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Seu Livepulse ID</div>
              <div className="mt-1 font-display text-2xl font-semibold tracking-tight">{user.livepulse_id}</div>
              <div className="mt-1 text-xs text-muted-foreground">Compartilhe com donos e gerentes para receber convites.</div>
            </div>
            <button onClick={copyId} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold hover:border-primary/50">
              <Copy className="h-3.5 w-3.5" /> Copiar ID
            </button>
          </div>
        </Card>
      )}

      <Card title="Pendentes">
        {loading ? <Empty msg="Carregando…" /> : pending.length === 0 ? <Empty msg="Nenhum convite pendente." /> : (
          <ul className="space-y-3">
            {pending.map((inv) => (
              <li key={inv.id} className="flex items-center gap-4 rounded-xl border border-border bg-background/40 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  {inv.agency?.logo_url ? <img src={inv.agency.logo_url} alt="" className="h-11 w-11 rounded-xl" /> : <Building2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{inv.agency?.name ?? "Agência"}</div>
                  <div className="text-xs text-muted-foreground">Recebido em {new Date(inv.created_at).toLocaleDateString("pt-BR")}</div>
                  {inv.message && <div className="mt-1 text-xs text-muted-foreground">"{inv.message}"</div>}
                </div>
                <button onClick={() => decline(inv.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-destructive/50 hover:text-destructive">
                  <X className="h-3.5 w-3.5" /> Recusar
                </button>
                <button onClick={() => accept(inv.id)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  <Check className="h-3.5 w-3.5" /> Aceitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {history.length > 0 && (
        <Card title="Histórico" className="mt-6">
          <ul className="space-y-2 text-sm">
            {history.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-2">
                <span>{inv.agency?.name ?? "Agência"}</span>
                <span className="text-xs text-muted-foreground">{inv.status} · {new Date(inv.created_at).toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="grid place-items-center py-10 text-center text-sm text-muted-foreground"><Mail className="mb-2 h-6 w-6" /> {msg}</div>;
}
