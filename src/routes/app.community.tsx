import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { feed } from "@/lib/mock-data";
import { Heart, MessageCircle, Share2, Calendar, GraduationCap, Trophy, Send, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/app/community")({
  component: CommunityPage,
  head: () => ({ meta: [{ title: "Comunidade — Livepulse" }] }),
});

const events = [
  { title: "Live Battle Mensal", date: "15 Nov · 20h", tag: "Competição" },
  { title: "Workshop: Retenção de audiência", date: "18 Nov · 19h", tag: "Treinamento" },
  { title: "AMA com Bianca Souza", date: "22 Nov · 21h", tag: "Live" },
];

const trainings = [
  { title: "Como bater a meta em 20 dias", lessons: 8, duration: "2h 40min" },
  { title: "Storytelling para streamers", lessons: 12, duration: "4h 15min" },
  { title: "Análise de métricas TikTok Live", lessons: 6, duration: "1h 50min" },
];

function CommunityPage() {
  return (
    <div>
      <PageHeader title="Comunidade" description="Feed, eventos e treinamentos da sua agência" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-3">
              <img src="https://api.dicebear.com/9.x/glass/svg?seed=owner" className="h-10 w-10 rounded-full" alt="" />
              <div className="flex-1">
                <textarea rows={2} placeholder="Compartilhe algo com o time…" className="w-full resize-none rounded-xl border border-border bg-background/40 p-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><ImageIcon className="h-4 w-4" /></button>
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Calendar className="h-4 w-4" /></button>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"><Send className="h-3.5 w-3.5" /> Publicar</button>
                </div>
              </div>
            </div>
          </Card>

          {feed.map((p, i) => (
            <Card key={i}>
              <div className="flex items-start gap-3">
                <img src={p.avatar} className="h-10 w-10 rounded-full" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.author}</span>
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">{p.role}</span>
                    <span className="text-xs text-muted-foreground">· {p.time}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{p.content}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1.5 transition hover:text-destructive"><Heart className="h-4 w-4" /> {p.likes}</button>
                    <button className="flex items-center gap-1.5 transition hover:text-foreground"><MessageCircle className="h-4 w-4" /> {p.comments}</button>
                    <button className="flex items-center gap-1.5 transition hover:text-foreground"><Share2 className="h-4 w-4" /> Compartilhar</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <Card title="Próximos eventos" action={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}>
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.title} className="rounded-xl border border-border/60 bg-background/30 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{e.tag}</div>
                  <div className="mt-1 text-sm font-medium">{e.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{e.date}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Treinamentos" action={<GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />}>
            <div className="space-y-2">
              {trainings.map((t) => (
                <div key={t.title} className="rounded-xl border border-border/60 bg-background/30 p-3">
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{t.lessons} aulas</span>
                    <span>·</span>
                    <span>{t.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Top da semana" action={<Trophy className="h-3.5 w-3.5 text-warning" />}>
            <div className="space-y-2">
              {feed.slice(0,3).map((p, i) => (
                <div key={p.author} className="flex items-center gap-3">
                  <div className="w-4 text-center text-xs font-bold text-muted-foreground">#{i+1}</div>
                  <img src={p.avatar} className="h-7 w-7 rounded-full" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
