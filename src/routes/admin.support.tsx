import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { PageHeader } from "@/components/app-shell";
import { mockAgencies } from "@/lib/mock-agencies";
import { Search, Pin, PinOff, CheckCircle2, Paperclip, Image as ImageIcon, FileText, Send, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Suporte — Super Admin · Livepulse" }] }),
});

interface SupportMsg {
  id: string;
  author: "owner" | "super";
  author_name: string;
  content: string;
  attachments: { name: string; kind: "image" | "pdf" | "file" }[];
  created_at: string;
}

interface Conversation {
  id: string;
  agency_id: string;
  status: "open" | "resolved";
  pinned: boolean;
  unread: number;
  online: boolean;
  messages: SupportMsg[];
}

const initialConversations: Conversation[] = mockAgencies.map((a, i) => ({
  id: `conv_${a.id}`,
  agency_id: a.id,
  status: i === 3 ? "resolved" : "open",
  pinned: i === 0,
  unread: [3, 0, 1, 0, 2][i] ?? 0,
  online: i % 2 === 0,
  messages: [
    { id: `m${i}_1`, author: "owner", author_name: "Dono", content: `Olá, tudo bem? Preciso de ajuda com o plano da ${a.name}.`, attachments: [], created_at: new Date(Date.now() - 86400_000 - i * 3600_000).toISOString() },
    { id: `m${i}_2`, author: "super", author_name: "Suporte Livepulse", content: "Claro! Estou aqui para ajudar. Pode me passar mais detalhes?", attachments: [], created_at: new Date(Date.now() - 3600_000 * 3 - i * 3600_000).toISOString() },
    { id: `m${i}_3`, author: "owner", author_name: "Dono", content: "Segue o print do erro que apareceu.", attachments: [{ name: "erro.png", kind: "image" }], created_at: new Date(Date.now() - 1800_000 - i * 3600_000).toISOString() },
  ],
}));

function SupportPage() {
  const [convs, setConvs] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string>(initialConversations[0].id);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const active = convs.find((c) => c.id === activeId)!;
  const activeAgency = mockAgencies.find((a) => a.id === active.agency_id)!;

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [activeId, active.messages.length]);

  const filtered = useMemo(() => {
    const rank = (c: Conversation) => (c.pinned ? 0 : 1);
    return [...convs]
      .filter((c) => {
        const a = mockAgencies.find((x) => x.id === c.agency_id)!;
        return !q || a.name.toLowerCase().includes(q.toLowerCase());
      })
      .sort((a, b) => rank(a) - rank(b) || (b.unread - a.unread));
  }, [convs, q]);

  const update = (id: string, patch: Partial<Conversation>) =>
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const openConversation = (id: string) => { setActiveId(id); update(id, { unread: 0 }); };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const msg: SupportMsg = { id: `m_${Date.now()}`, author: "super", author_name: user?.name ?? "Suporte", content: text, attachments: [], created_at: new Date().toISOString() };
    update(active.id, { messages: [...active.messages, msg] });
    setDraft("");
  };

  return (
    <div>
      <PageHeader title="Suporte" description="Chat privado entre Super Admin e Donos das agências" />

      <div className="grid h-[calc(100vh-14rem)] min-h-[520px] gap-4 rounded-2xl border border-border bg-card/40 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex flex-col overflow-hidden border-r border-border">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar agência…" className="h-9 w-full rounded-lg border border-border bg-background/40 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const a = mockAgencies.find((x) => x.id === c.agency_id)!;
              const last = c.messages[c.messages.length - 1];
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={cn("flex w-full items-start gap-3 border-b border-border/50 px-3 py-2.5 text-left transition hover:bg-card/60", isActive && "bg-card/80")}
                >
                  <div className="relative">
                    <img src={a.logo_url ?? ""} className="h-9 w-9 rounded-lg border border-border" alt="" />
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{a.name}</span>
                      {c.pinned && <Pin className="h-3 w-3 text-warning" />}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{last.content}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {c.status === "resolved" && <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">Resolvido</span>}
                    </div>
                  </div>
                  {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">{c.unread}</span>}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma conversa encontrada.</div>}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex items-center gap-3 border-b border-border p-3">
            <img src={activeAgency.logo_url ?? ""} className="h-9 w-9 rounded-lg border border-border" alt="" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{activeAgency.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Circle className={cn("h-2 w-2 fill-current", active.online ? "text-success" : "text-muted-foreground")} />
                {active.online ? "Online agora" : "Offline"}
              </div>
            </div>
            <button onClick={() => update(active.id, { pinned: !active.pinned })} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 text-xs font-medium hover:text-warning">
              {active.pinned ? <><PinOff className="h-3.5 w-3.5" /> Desafixar</> : <><Pin className="h-3.5 w-3.5" /> Fixar</>}
            </button>
            <button onClick={() => update(active.id, { status: active.status === "open" ? "resolved" : "open" })} className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
              active.status === "resolved" ? "border-warning/40 bg-warning/10 text-warning" : "border-success/40 bg-success/10 text-success"
            )}>
              <CheckCircle2 className="h-3.5 w-3.5" /> {active.status === "resolved" ? "Reabrir" : "Marcar resolvida"}
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {active.messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2", m.author === "super" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] rounded-2xl px-3.5 py-2.5", m.author === "super" ? "bg-primary text-primary-foreground" : "border border-border bg-card")}>
                  <div className="text-[11px] font-semibold opacity-70">{m.author_name}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                  {m.attachments.map((att, i) => (
                    <div key={i} className={cn("mt-2 flex items-center gap-2 rounded-lg border p-2 text-xs", m.author === "super" ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border bg-background/40")}>
                      {att.kind === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : att.kind === "pdf" ? <FileText className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
                      <span className="truncate font-medium">{att.name}</span>
                    </div>
                  ))}
                  <div className="mt-1 text-[10px] opacity-60">{new Date(m.created_at).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</div>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-border p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background/40 p-2">
              <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground" title="Anexar"><Paperclip className="h-4 w-4" /></button>
              <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground" title="Imagem"><ImageIcon className="h-4 w-4" /></button>
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={`Responder para ${activeAgency.name}…`}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none"
              />
              <button onClick={send} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-40" disabled={!draft.trim()}>
                <Send className="h-3.5 w-3.5" /> Enviar
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
