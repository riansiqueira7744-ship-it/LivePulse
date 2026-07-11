import { Link, Outlet, useRouterState, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, UserCog, Wallet, Percent, Target, Trophy,
  Sparkles, FileBarChart, MessageSquare, Settings, User, Bell, Search, Mail,
  ChevronLeft, ChevronRight, LogOut, Zap, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/hooks/use-data";
import { ROLE_LABELS } from "@/lib/constants";
import { Avatar } from "@/components/avatar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/hosts", label: "Hosts", icon: Users },
  { to: "/app/managers", label: "Gerentes", icon: UserCog },
  { to: "/app/finance", label: "Financeiro", icon: Wallet },
  { to: "/app/commissions", label: "Comissões", icon: Percent },
  { to: "/app/goals", label: "Metas", icon: Target },
  { to: "/app/ranking", label: "Ranking", icon: Trophy },
  { to: "/app/ai", label: "IA", icon: Sparkles, badge: "Novo" },
  { to: "/app/reports", label: "Relatórios", icon: FileBarChart },
  { to: "/app/notifications", label: "Notificações", icon: Bell },
  { to: "/app/invites", label: "Convites", icon: Mail },
  { to: "/app/community", label: "Comunidade", icon: MessageSquare },
] as const;

const bottomNav = [
  { to: "/app/settings", label: "Configurações", icon: Settings },
  { to: "/app/profile", label: "Perfil", icon: User },
] as const;

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut, canAccess } = useAuth();
  const navigate = useNavigate();
  const { data: notifs = [] } = useNotifications();
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="mesh-bg grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>;
  }

  const visibleNav = nav.filter((item) => canAccess(item.to));

  return (
    <div className="mesh-bg min-h-screen">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl transition-all duration-300 md:flex",
            collapsed ? "w-[76px]" : "w-[260px]"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <Link to="/app/dashboard" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
                <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate font-display text-[15px] font-semibold leading-tight">Livepulse</div>
                  <div className="truncate text-[10.5px] uppercase tracking-widest text-muted-foreground">Agency OS</div>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
            {!collapsed && (
              <div className="px-2 pb-1.5 pt-3 text-[10.5px] font-medium uppercase tracking-widest text-muted-foreground/70">
                Operação
              </div>
            )}
            {visibleNav.map((item) => {
              const active = path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r bg-primary" />
                  )}
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && "badge" in item && item.badge && (
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {user.role === "super_admin" && (
            <div className="border-t border-sidebar-border px-3 py-2">
              {!collapsed && (
                <div className="px-2 pb-1.5 pt-1 text-[10.5px] font-medium uppercase tracking-widest text-warning/80">
                  Plataforma
                </div>
              )}
              <Link
                to="/admin/overview"
                className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-2.5 py-2 text-sm font-medium text-warning transition hover:bg-warning/15"
              >
                <Crown className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="flex-1 truncate">Super Admin</span>}
              </Link>
            </div>
          )}

          <div className="space-y-0.5 border-t border-sidebar-border p-3">
            {bottomNav.map((item) => {
              const active = path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
            {!collapsed && (
              <div className="mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar_url} name={user.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{user.name || user.email}</div>
                    <div className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</div>
                  </div>
                  <button
                    onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/70 px-4 backdrop-blur-xl md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Pesquisar hosts, gerentes, pagamentos…"
                  className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-16 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
              </div>
            </div>
            <Link
              to="/app/notifications"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/60 text-muted-foreground transition hover:text-foreground"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unread}
                </span>
              )}
            </Link>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1 md:flex">
              <Avatar src={user.avatar_url} name={user.name} size={24} />
              <span className="text-xs font-medium">{ROLE_LABELS[user.role]}</span>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
