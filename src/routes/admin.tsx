import { Link, Outlet, useRouterState, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Crown, LayoutDashboard, Building2, CreditCard, LifeBuoy, Megaphone,
  ChevronLeft, ChevronRight, LogOut, Search, Bell, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin/overview",      label: "Visão Geral",   icon: LayoutDashboard },
  { to: "/admin/agencies",      label: "Agências",      icon: Building2 },
  { to: "/admin/subscriptions", label: "Assinaturas",   icon: CreditCard },
  { to: "/admin/support",       label: "Suporte",       icon: LifeBuoy },
  { to: "/admin/broadcasts",    label: "Comunicados",   icon: Megaphone },
] as const;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (user.role !== "super_admin") { navigate({ to: "/app/dashboard" }); return; }
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== "super_admin") {
    return <div className="mesh-bg grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>;
  }

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
            <Link to="/admin/overview" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-warning to-primary shadow-[0_8px_24px_-8px] shadow-warning/60">
                <Crown className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate font-display text-[15px] font-semibold leading-tight">Livepulse</div>
                  <div className="truncate text-[10.5px] uppercase tracking-widest text-warning">Super Admin</div>
                </div>
              )}
            </Link>
            <button onClick={() => setCollapsed((c) => !c)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
            {!collapsed && (
              <div className="px-2 pb-1.5 pt-3 text-[10.5px] font-medium uppercase tracking-widest text-muted-foreground/70">Plataforma</div>
            )}
            {nav.map((item) => {
              const active = path.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}>
                  {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r bg-warning" />}
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-warning")} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-0.5 border-t border-sidebar-border p-3">
            <Link to="/app/dashboard" className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/75 transition hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
              <ArrowLeft className="h-[18px] w-[18px]" />
              {!collapsed && <span>Painel da agência</span>}
            </Link>
            {!collapsed && (
              <div className="mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
                <div className="flex items-center gap-3">
                  <img src={user.avatar_url ?? ""} alt="" className="h-9 w-9 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-warning">{ROLE_LABELS[user.role]}</div>
                  </div>
                  <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" aria-label="Sair">
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
                <input placeholder="Pesquisar agências, planos, tickets…" className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 md:flex">
              <span className="h-2 w-2 animate-pulse-ring rounded-full bg-warning" />
              <span className="text-xs font-medium">Modo Super Admin</span>
            </div>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/60 text-muted-foreground transition hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
