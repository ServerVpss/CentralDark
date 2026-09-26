import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { listTickets } from "@/lib/tickets.functions";
import { listTicketFilterDims } from "@/lib/whatsapp.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateBR } from "@/lib/datetime";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Clock, MessageCircle, CheckCircle2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

type Props = {
  workspaceId: string;
  /** Pra onde mandar o usuário quando clicar num card */
  chatPath: "/app/chat" | "/admin/chat";
};

type ColumnDef = {
  id: "chatbot" | "aguardando" | "atendimento" | "fechado";
  title: string;
  /** classes da barra de cabeçalho da coluna */
  header: string;
  /** classes do badge de contagem */
  badge: string;
  /** classes da borda lateral do card */
  cardBorder: string;
  /** Match dos tickets do banco */
  match: (t: any) => boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const COLUMNS: ColumnDef[] = [
  {
    id: "chatbot",
    title: "ChatBot",
    header: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    badge: "bg-blue-500/25 text-blue-100",
    cardBorder: "border-l-blue-500",
    icon: Bot,
    // ChatBot: aberto, sem atendente humano
    match: (t) => t.status === "open" && !t.assignee_id,
  },
  {
    id: "aguardando",
    title: "Aguardando atendimento",
    header: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    badge: "bg-amber-500/25 text-amber-100",
    cardBorder: "border-l-amber-500",
    icon: Clock,
    match: (t) =>
      (t.status === "open" && !!t.assignee_id) ||
      t.status === "waiting_client",
  },
  {
    id: "atendimento",
    title: "Em Atendimento",
    header: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    badge: "bg-emerald-500/25 text-emerald-100",
    cardBorder: "border-l-emerald-500",
    icon: MessageCircle,
    match: (t) => t.status === "in_progress" || t.status === "critical",
  },
  {
    id: "fechado",
    title: "Fechado",
    header: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    badge: "bg-zinc-500/25 text-zinc-100",
    cardBorder: "border-l-zinc-500",
    icon: CheckCircle2,
    match: (t) => t.status === "closed" || t.status === "resolved",
  },
];

const DAYS_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
function relativeDay(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return DAYS_PT[d.getDay()];
  return formatDateBR(d);
}

function maskPhone(phone?: string | null) {
  if (!phone) return "";
  // mascara meio: +55 (35) ****-5676
  if (phone.length < 8) return phone;
  return phone.replace(/(\d{2,4})(\d{4})$/, "****-$2");
}

export function KanbanBoard({ workspaceId, chatPath }: Props) {
  const navigate = useNavigate();
  const [channel, setChannel] = useState<string>("__all__");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const dimsFn = useServerFn(listTicketFilterDims);
  const dimsQ = useQuery({
    queryKey: ["ticket-dims", workspaceId],
    queryFn: () => dimsFn({ data: { workspaceId } }),
  });

  const ticketsFn = useServerFn(listTickets);
  const ticketsQ = useQuery({
    queryKey: ["kanban-tickets", workspaceId, channel],
    queryFn: () =>
      ticketsFn({
        data: {
          workspaceId,
          filter: "all",
          limit: 100,
          phoneNumberId: channel === "__all__" ? null : channel,
        },
      }),
    refetchInterval: 30_000,
  });

  const tickets = ticketsQ.data?.tickets ?? [];

  // filtro client-side por nome/telefone
  const filtered = useMemo(() => {
    const n = name.trim().toLowerCase();
    const p = phone.trim().replace(/\D/g, "");
    return tickets.filter((t: any) => {
      if (n && !(t.contact?.name?.toLowerCase().includes(n))) return false;
      if (p && !(t.contact?.phone?.replace(/\D/g, "").includes(p))) return false;
      return true;
    });
  }, [tickets, name, phone]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = { chatbot: [], aguardando: [], atendimento: [], fechado: [] };
    for (const t of filtered) {
      const col = COLUMNS.find((c) => c.match(t));
      if (col) map[col.id].push(t);
    }
    return map;
  }, [filtered]);

  const clearFilters = () => {
    setChannel("__all__");
    setName("");
    setPhone("");
  };

  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kanban</h1>
        <Button variant="ghost" size="icon" onClick={goFullscreen} title="Tela cheia">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Barra de filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border bg-card/40 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Filtrar por canal</label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {dimsQ.data?.connections.map((c: any) => (
                <SelectItem key={c.id} value={c.phone_number_id ?? c.id}>
                  {c.display_phone_number ?? c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Filtrar por nome</label>
          <Input placeholder="Digite o nome" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Filtrar por telefone</label>
          <Input placeholder="Digite o telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button variant="secondary" className="w-full md:w-auto" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Colunas */}
      <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = grouped[col.id] ?? [];
          return (
            <div key={col.id} className="flex min-h-0 flex-col rounded-lg border bg-card/30">
              <div className={cn("flex items-center justify-between rounded-t-lg border-b px-3 py-2", col.header)}>
                <div className="flex items-center gap-2">
                  <col.icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{col.title}</span>
                </div>
                <span className={cn("rounded px-2 py-0.5 text-xs font-bold", col.badge)}>
                  {items.length}
                </span>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2 p-2">
                  {ticketsQ.isLoading && (
                    <p className="py-8 text-center text-xs text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
                  )}
                  {!ticketsQ.isLoading && items.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">Nenhum atendimento</p>
                  )}
                  {items.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => navigate({ to: chatPath })}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-md border border-l-4 bg-background/60 p-3 text-left transition hover:bg-background",
                        col.cardBorder,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={t.contact?.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-primary/15 text-primary text-xs">
                            {(t.contact?.name ?? t.contact?.phone ?? "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold">
                              {t.contact?.name || t.contact?.phone || "Sem nome"}
                            </p>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {relativeDay(t.last_message_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs text-muted-foreground">{maskPhone(t.contact?.phone)}</p>
                            {t.number ? (
                              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">#{t.number}</span>
                            ) : null}
                          </div>
                          {t.last_message_preview && (
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                              {t.last_message_preview}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Tag de setor/atendente na lateral direita */}
                      {(t.sector_name || t.assignee_name) && (
                        <div className="absolute right-0 top-0 h-full w-6 bg-primary/10 text-[10px] text-primary">
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                            {t.sector_name ?? t.assignee_name}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
