import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Recuperar senha — Livepulse" }] }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Se o e-mail existir, você receberá as instruções.");
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
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Recuperar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enviaremos um link para redefinir sua senha.</p>

        {sent ? (
          <div className="mt-8 rounded-xl border border-border bg-card/60 p-6 text-sm">
            Se o e-mail estiver cadastrado, um link chegará em instantes.
            <div className="mt-4"><Link to="/login" className="text-primary hover:underline">Voltar ao login</Link></div>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              {submitting ? "Enviando…" : <>Enviar link <ArrowRight className="h-4 w-4" /></>}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
