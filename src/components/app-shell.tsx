import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PLAN_LABELS, ROLE_LABELS } from "@/lib/constants";

export function AgencyContextBadge({ className }: { className?: string }) {
  const { currentAgency, user } = useAuth();
  if (!currentAgency || !user) return null;
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 text-xs", className)}>
      <div className="grid h-5 w-5 place-items-center rounded-md bg-primary/15 text-primary">
        <Building2 className="h-3 w-3" />
      </div>
      <span className="font-medium">{currentAgency.name}</span>
      <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {PLAN_LABELS[currentAgency.plan]}
      </span>
      <span className="hidden text-muted-foreground sm:inline">· {ROLE_LABELS[user.role]}</span>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <div className="mb-2"><AgencyContextBadge /></div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}


export function StatCard({
  label, value, delta, deltaLabel, icon, positive, gradient,
}: { label: string; value: string; delta?: string; deltaLabel?: string; icon?: ReactNode; positive?: boolean; gradient?: boolean }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border p-5 transition hover:border-primary/30",
      gradient ? "bg-gradient-to-br from-primary/10 via-card to-card" : "bg-card/60"
    )}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {icon && <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</div>
      {delta && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold", positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 p-5", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export const currency = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
