import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkPassword, translateAuthError } from "@/lib/password";
import { PasswordHints } from "./signup.host";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Nova senha — Livepulse" }] }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pw = checkPassword(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.valid) { toast.error("A senha precisa ter no mínimo 8 caracteres, com letra e número."); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { toast.error(translateAuthError(error.message)); return; }
    toast.success("Senha atualizada!");
    navigate({ to: "/app/dashboard" });
  };

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Definir nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Insira sua nova senha.</p>

        <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nova senha</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className={`h-11 w-full rounded-xl border ${password && !pw.valid ? "border-destructive/60" : "border-border"} bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20`} />
            </div>
            <PasswordHints pw={pw} />
          </div>
          <button type="submit" disabled={submitting || !pw.valid} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
            {submitting ? "Salvando…" : <>Salvar senha <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
