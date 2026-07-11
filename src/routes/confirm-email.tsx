import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, MailCheck, ExternalLink, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/password";

export const Route = createFileRoute("/confirm-email")({
  component: ConfirmEmailPage,
  validateSearch: (s: Record<string, unknown>) => ({
    email: typeof s.email === "string" ? s.email : "",
    next: typeof s.next === "string" ? s.next : "",
  }),
  head: () => ({ meta: [{ title: "Confirme seu e-mail — Livepulse" }] }),
});

function ConfirmEmailPage() {
  const { email, next } = useSearch({ from: "/confirm-email" });
  const [sending, setSending] = useState(false);

  const resend = async () => {
    if (!email) return toast.error("E-mail não informado.");
    setSending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setSending(false);
    if (error) toast.error(translateAuthError(error.message));
    else toast.success("Enviamos um novo link de confirmação.");
  };

  const openMail = () => {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      "gmail.com": "https://mail.google.com",
      "googlemail.com": "https://mail.google.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
      "live.com": "https://outlook.live.com",
      "yahoo.com": "https://mail.yahoo.com",
      "icloud.com": "https://www.icloud.com/mail",
    };
    window.open(map[domain] ?? `https://${domain}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-lg px-6 py-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>

        <div className="mt-12 rounded-3xl border border-border bg-card/60 p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">Confirme seu e-mail</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enviamos um link de confirmação para <b className="text-foreground">{email || "seu endereço"}</b>. Abra sua caixa de entrada e confirme o endereço antes de fazer login.
          </p>

          <div className="mt-8 space-y-3">
            {email && (
              <button onClick={openMail} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90">
                <ExternalLink className="h-4 w-4" /> Abrir meu e-mail
              </button>
            )}
            <button onClick={resend} disabled={sending} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${sending ? "animate-spin" : ""}`} /> Reenviar confirmação
            </button>
            <Link to="/login" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar para o login
            </Link>
          </div>

          {next === "pending-payment" && (
            <p className="mt-6 rounded-xl border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
              Após confirmar o e-mail e entrar, você verá a tela de pagamento pendente da sua Agência.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
