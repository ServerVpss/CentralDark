// Painel lateral do "Histórico do atendimento" — mostra mensagens, eventos e erros
// numa única linha do tempo. Usado no /app/chat e no espelho /admin.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTicketTimeline } from "@/lib/timeline.functions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  MessageCircle, AlertTriangle, Activity, Bot, FileText,
  Image as ImageIcon, Video as VideoIcon, Mic, MapPin, Loader2,
} from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

type TimelineItem = {
  kind: "message" | "event" | "error" | "ai";
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_name: string | null;
  severity: string | null;
  area: string | null;
  title: string;
  payload: any;
};

function formatTime(iso: string) {
  return formatDateTimeBR(iso, { day: "2-digit", month: "2-digit", year: undefined, hour: "2-digit", minute: "2-digit" });
}

function iconForMessageKind(kind?: string) {
  switch (kind) {
    case "image": return <ImageIcon className="h-3.5 w-3.5" />;
    case "video": return <VideoIcon className="h-3.5 w-3.5" />;
    case "audio": return <Mic className="h-3.5 w-3.5" />;
    case "document": return <FileText className="h-3.5 w-3.5" />;
    case "location": return <MapPin className="h-3.5 w-3.5" />;
    default: return <MessageCircle className="h-3.5 w-3.5" />;
  }
}

function labelForEvent(type: string): string {
  const map: Record<string, string> = {
    assigned: "Atendimento assumido",
    unassigned: "Atendente removido",
    transferred: "Transferido",
    sector_changed: "Setor alterado",
    status_changed: "Status alterado",
    closed: "Atendimento encerrado",
    reopened: "Atendimento reaberto",
    marked_read: "Mensagens marcadas como lidas",
    internal_note: "Nota interna adicionada",
    tag_added: "Tag adicionada",
    tag_removed: "Tag removida",
    media_render_success: "Mídia renderizada com sucesso",
    media_render_failed: "Falha ao renderizar mídia",
    media_download_failed: "Falha ao baixar mídia",
    unsupported_message_received: "Mensagem em formato desconhecido recebida",
  };
  return map[type] ?? type;
}

export function TicketTimelinePanel({ ticketId, title = "Histórico do atendimento" }: { ticketId: string; title?: string }) {
  const fetchTimeline = useServerFn(getTicketTimeline);

  const q = useQuery({
    queryKey: ["ticket-timeline", ticketId],
    queryFn: () => fetchTimeline({ data: { ticketId } }),
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
  });

  const items = (q.data?.timeline ?? []) as TimelineItem[];

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Mensagens, eventos e erros do sistema</p>
        </div>
        {q.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        {q.isLoading ? (
          <p className="px-2 py-4 text-xs text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
        ) : items.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">Nenhum registro ainda.</p>
        ) : (
          <ol className="relative ml-2 space-y-3 border-l border-border pl-4">
            {items.map((it) => (
              <li key={`${it.kind}-${it.id}`} className="relative">
                <span
                  className={cn(
                    "absolute -left-[22px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card",
                    it.kind === "message" && "bg-primary",
                    it.kind === "event" && "bg-sky-500",
                    it.kind === "ai" && "bg-violet-500",
                    it.kind === "error" && (it.severity === "critical" ? "bg-destructive" : "bg-amber-500"),
                  )}
                />
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 text-muted-foreground">
                    {it.kind === "message" && iconForMessageKind(it.payload?.kind)}
                    {it.kind === "event" && <Activity className="h-3.5 w-3.5" />}
                    {it.kind === "ai" && <Bot className="h-3.5 w-3.5" />}
                    {it.kind === "error" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {it.kind === "message" && (it.payload?.author === "customer" ? "Cliente" : it.payload?.is_internal_note ? "Nota interna" : (it.actor_name ?? "Atendente"))}
                        {it.kind === "event" && labelForEvent(it.title)}
                        {it.kind === "ai" && `IA · ${it.title}`}
                        {it.kind === "error" && `Erro · ${it.area ?? "sistema"}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(it.created_at)}</span>
                      {it.kind === "error" && it.severity && (
                        <Badge variant={it.severity === "critical" ? "destructive" : "secondary"} className="h-4 px-1.5 text-[9px] uppercase">
                          {it.severity}
                        </Badge>
                      )}
                    </div>
                    <p className={cn("mt-0.5 text-xs", it.kind === "error" ? "text-amber-600" : "text-foreground/80", "break-words")}>
                      {it.kind === "message" && (it.title || `[${it.payload?.kind ?? "mídia"}]`)}
                      {it.kind === "event" && (it.payload && Object.keys(it.payload).length ? Object.entries(it.payload).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "—")}
                      {it.kind === "ai" && `${it.payload?.input_tokens ?? 0} entrada · ${it.payload?.output_tokens ?? 0} saída · ${it.payload?.latency_ms ?? 0}ms`}
                      {it.kind === "error" && it.title}
                    </p>
                    {it.kind === "error" && it.payload?.context && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground">Detalhes técnicos</summary>
                        <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted/50 p-2 text-[10px]">{JSON.stringify(it.payload.context, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </ScrollArea>
    </div>
  );
}
