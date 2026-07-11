import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, Lock, User, Phone, Globe, MapPin, Radio, IdCard, ArrowRight, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkPassword, translateAuthError } from "@/lib/password";

export const Route = createFileRoute("/signup/host")({
  component: HostSignup,
  head: () => ({ meta: [{ title: "Criar conta de Host — Grátis · Livepulse" }] }),
});

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "kwai", label: "Kwai" },
  { value: "bigo", label: "BIGO Live" },
  { value: "other", label: "Outra" },
];

function HostSignup() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: "", email: "", password: "",
    whatsapp: "", country: "Brasil", city: "",
    platform: "tiktok", platform_user_id: "",
  });
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const pw = checkPassword(f.password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) { toast.error("Aceite os Termos de Uso e a Política de Privacidade."); return; }
    if (!f.whatsapp.trim()) { toast.error("WhatsApp é obrigatório."); return; }
    if (!pw.valid) { toast.error("A senha precisa ter no mínimo 8 caracteres, com letra e número."); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: f.email, password: f.password,
        options: {
          emailRedirectTo: window.location.origin + "/app/dashboard",
          data: {
            name: f.name, account_type: "host",
            whatsapp: f.whatsapp, country: f.country, city: f.city,
            platform: f.platform, platform_user_id: f.platform_user_id,
          },
        },
      });
      if (error) throw error;
      const session = data.session ?? (await supabase.auth.getSession()).data.session;
      if (!session) {
        navigate({ to: "/confirm-email", search: { email: f.email, next: "" } });
        return;
      }
      toast.success("Sua conta de Host foi criada!");
      navigate({ to: "/app/dashboard" });
    } catch (err) {
      toast.error(translateAuthError((err as Error).message));
    } finally { setBusy(false); }
  };

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-lg px-6 py-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-[0_8px_24px_-8px] shadow-primary/60">
            <Zap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold">Livepulse</span>
        </Link>

        <div className="mt-8">
          <span className="inline-block rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-success">Grátis para sempre</span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Criar conta de Host</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ao criar, você recebe automaticamente um <b>Livepulse ID</b> permanente.</p>
        </div>

        <form className="mt-8 grid gap-4" onSubmit={submit} noValidate>
          <Field icon={<User className="h-4 w-4" />} label="Nome completo" value={f.name} onChange={set("name")} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={f.email} onChange={set("email")} required />
            <div>
              <label className="text-xs font-medium text-muted-foreground">Senha</label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="password" value={f.password} onChange={(e) => set("password")(e.target.value)}
                  className={`h-11 w-full rounded-xl border ${f.password && !pw.valid ? "border-destructive/60" : "border-border"} bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20`} />
              </div>
              <PasswordHints pw={pw} />
            </div>
          </div>
          <Field icon={<Phone className="h-4 w-4" />} label="WhatsApp (obrigatório)" value={f.whatsapp} onChange={set("whatsapp")} required placeholder="+55 11 9..." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field icon={<Globe className="h-4 w-4" />} label="País" value={f.country} onChange={set("country")} required />
            <Field icon={<MapPin className="h-4 w-4" />} label="Cidade" value={f.city} onChange={set("city")} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Plataforma de livestream</label>
              <div className="relative mt-1.5">
                <Radio className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select value={f.platform} onChange={(e) => set("platform")(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value} className="bg-popover">{p.label}</option>)}
                </select>
              </div>
            </div>
            <Field icon={<IdCard className="h-4 w-4" />} label="ID na plataforma" value={f.platform_user_id} onChange={set("platform_user_id")} required placeholder="@seuhandle" />
          </div>

          <TermsCheckbox value={terms} onChange={setTerms} />

          <button type="submit" disabled={busy || !terms || !pw.valid} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-60">
            {busy ? "Criando…" : <>Criar conta grátis <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Sem cartão. Sem cobrança. Ao criar, você começa <b>sem agência</b>. Donos e Gerentes podem convidar você pelo seu Livepulse ID.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/signup" className="text-primary hover:underline">← Voltar</Link>
          {" · "}
          <Link to="/login" className="text-primary hover:underline">Já tenho conta</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, icon, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; icon: React.ReactNode; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input required={required} placeholder={placeholder} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card/60 pl-10 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
    </div>
  );
}

export function PasswordHints({ pw }: { pw: ReturnType<typeof checkPassword> }) {
  const rules = [
    { ok: pw.minLength, label: "Mínimo de 8 caracteres" },
    { ok: pw.hasLetter, label: "Pelo menos uma letra" },
    { ok: pw.hasNumber, label: "Pelo menos um número" },
  ];
  return (
    <ul className="mt-2 grid gap-1 text-[11px]">
      {rules.map((r) => (
        <li key={r.label} className={`flex items-center gap-1.5 ${r.ok ? "text-success" : "text-muted-foreground"}`}>
          {r.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {r.label}
        </li>
      ))}
    </ul>
  );
}

export function TermsCheckbox({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border bg-card accent-primary" />
      <span>
        Li e aceito os <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Termos de Uso</a>
        {" e a "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade</a>.
      </span>
    </label>
  );
}
