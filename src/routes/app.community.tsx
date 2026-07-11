import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/avatar";
import { MessageSquare, Send, Image as ImageIcon, Calendar } from "lucide-react";

export const Route = createFileRoute("/app/community")({
  component: CommunityPage,
  head: () => ({ meta: [{ title: "Comunidade — Livepulse" }] }),
});

function CommunityPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Comunidade" description="Feed, eventos e treinamentos da sua agência" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-3">
              <Avatar src={user?.avatar_url} name={user?.name} size={40} />
              <div className="flex-1">
                <textarea rows={2} placeholder="Compartilhe algo com o time…" className="w-full resize-none rounded-xl border border-border bg-background/40 p-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><ImageIcon className="h-4 w-4" /></button>
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Calendar className="h-4 w-4" /></button>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"><Send className="h-3.5 w-3.5" /> Publicar</button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">Nenhuma publicação ainda</div>
                <p className="mt-1 text-sm text-muted-foreground">Seja o primeiro a compartilhar algo com o time.</p>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Próximos eventos">
            <div className="py-6 text-center text-xs text-muted-foreground">Nenhum evento programado.</div>
          </Card>

          <Card title="Treinamentos">
            <div className="py-6 text-center text-xs text-muted-foreground">Nenhum treinamento disponível.</div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
