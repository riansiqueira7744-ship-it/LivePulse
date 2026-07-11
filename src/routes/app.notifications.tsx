import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, Filter } from "lucide-react";
import { Card, PageHeader } from "@/components/app-shell";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, type DbNotification } from "@/hooks/use-data";
import { NOTIFICATION_TONE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notificações — Livepulse" }] }),
});

type FilterKey = "all" | "unread" | DbNotification["type"];
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "Não lidas" },
  { key: "success", label: "Sucessos" },
  { key: "warning", label: "Alertas" },
  { key: "danger", label: "Críticas" },
  { key: "info", label: "Informações" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.round(hrs / 24)}d`;
}

function NotificationsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notificações"
        description={`${unread} não lidas · ${items.length} no total`}
        actions={
          <button onClick={() => markAll.mutate()} className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs">
            <CheckCheck className="mr-1 inline h-3.5 w-3.5" /> Marcar todas como lidas
          </button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition", filter === f.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
                {f.label}
              </button>
            ))}
          </div>
          <button className="ml-auto rounded-lg border border-border bg-background/50 p-2 text-muted-foreground"><Filter className="h-4 w-4" /></button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((n) => (
              <li key={n.id} className={cn("group flex items-start gap-4 px-2 py-4 transition hover:bg-background/40", !n.read && "bg-primary/[0.03]")}>
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", NOTIFICATION_TONE[n.type])}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold">{n.title}</h4>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{timeAgo(n.created_at)}</span>
                    {n.link && <Link to={n.link} className="font-medium text-primary hover:underline">Abrir</Link>}
                  </div>
                </div>
                {!n.read && (
                  <button onClick={() => markRead.mutate(n.id)} className="opacity-0 transition group-hover:opacity-100 rounded-md border border-border bg-card/60 p-1.5 text-muted-foreground hover:text-foreground" aria-label="Marcar como lida">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-12 text-center text-sm text-muted-foreground">Nenhuma notificação neste filtro.</li>
            )}
          </ul>
        )}
      </Card>
    </div>
  );
}
