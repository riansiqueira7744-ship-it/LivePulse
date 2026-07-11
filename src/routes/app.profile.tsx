import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/lib/auth-context";
import { profileService } from "@/services";
import { Mail, Phone, MapPin, Upload, Trash2, Save } from "lucide-react";
import { useState, useRef } from "react";
import { ROLE_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Perfil — Livepulse" }] }),
});

function ProfilePage() {
  const { user, currentAgency, refresh } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [city, setCity] = useState(user?.city ?? "");

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const onPickFile = () => fileRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null); setUploading(true);
    try {
      await profileService.uploadAvatar(user.id, file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar foto");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const removePhoto = async () => {
    setError(null); setUploading(true);
    try {
      await profileService.removeAvatar(user.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao remover foto");
    } finally { setUploading(false); }
  };

  const save = async () => {
    setError(null); setSaving(true);
    try {
      await profileService.update(user.id, {
        name: name.trim() || null,
        whatsapp: whatsapp.trim() || null,
        country: country.trim() || null,
        city: city.trim() || null,
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Meu perfil" description="Suas informações pessoais" />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="text-center">
          <div className="mx-auto">
            <Avatar src={user.avatar_url} name={user.name} size={96} rounded="2xl" className="mx-auto ring-2 ring-primary/40" />
          </div>
          <div className="mt-4 font-display text-xl font-semibold">{user.name || "Complete seu perfil"}</div>
          <div className="text-sm text-muted-foreground">
            {ROLE_LABELS[user.role]}{currentAgency ? ` · ${currentAgency.name}` : ""}
          </div>
          {user.livepulse_id && (
            <div className="mt-3 inline-flex rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
              {user.livepulse_id}
            </div>
          )}

          <div className="mt-5 flex justify-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button
              onClick={onPickFile}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" /> {uploading ? "Enviando…" : user.avatar_url ? "Trocar foto" : "Enviar foto"}
            </button>
            {user.avatar_url && (
              <button
                onClick={removePhoto}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>

          <div className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {user.whatsapp || "—"}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {[user.city, user.country].filter(Boolean).join(", ") || "—"}</div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Dados pessoais">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" value={name} onChange={setName} placeholder="Seu nome" />
              <Field label="E-mail" value={user.email} onChange={() => {}} disabled />
              <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="+55 11 …" />
              <Field label="País" value={country} onChange={setCountry} placeholder="BR" />
              <Field label="Cidade" value={city} onChange={setCity} placeholder="São Paulo" />
            </div>
            {error && <div className="mt-3 text-xs text-destructive">{error}</div>}
            <div className="mt-4 flex justify-end">
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                <Save className="h-3.5 w-3.5" /> {saving ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background/40 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      />
    </div>
  );
}
