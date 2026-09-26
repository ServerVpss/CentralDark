import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateBR, formatTimeBR, formatDateTimeBR } from "@/lib/datetime";
import {
  listTickets, getTicket, listMessages, sendMessage,
  updateTicketStatus, markRead, createTicketWithMessage, logMessageDiagnosticEvent,
  claimTicket, deleteTicket,
} from "@/lib/tickets.functions";
import { getPendingPixForTicket } from "@/lib/chat-payments.functions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TicketTimelinePanel } from "@/components/inbox/TicketTimelinePanel";
import { MessageStatusIcon } from "@/components/inbox/MessageStatusIcon";
import {
  enqueueMessage, retryMessage, removeFromQueue,
  getQueueSnapshot, getEmptyQueueSnapshot, subscribe as subscribeQueue, hydrateQueueFromStorage,
  type QueuedMessage,
} from "@/lib/chat-send-queue";
import { listTicketFilterDims, getTicketWindowStatus } from "@/lib/whatsapp.functions";
import { useSignedMediaUrl } from "@/lib/use-signed-media-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FriendlyErrorBox } from "@/components/whatsapp/FriendlyErrorBox";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  Search, Send, Plus, CheckSquare, Inbox as InboxIcon, ArrowUpDown, EyeOff, Eye,
  Filter as FilterIcon, MessageSquare, Clock, ArrowLeft, FileText, MapPin, Download, RefreshCw,
  X, Undo2, ArrowRightLeft, MoreVertical, Smile, Paperclip, Zap, Timer, Mic, Pencil, ListChecks,
  CheckCircle2, StickyNote, Receipt, Copy, Ban,
} from "lucide-react";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/inbox")({
  component: InboxPage,
  validateSearch: (search: Record<string, unknown>) => ({
    ticketId: typeof search.ticketId === "string" ? search.ticketId : undefined,
  }),
});


const STATUS_LABEL: Record<string, string> = {
  open: "Aberto", in_progress: "Em andamento", waiting_client: "Aguardando cliente",
  resolved: "Resolvido", closed: "Fechado", critical: "Crítico",
};

/* ============================================================
   PÁGINA PRINCIPAL — layout mobile-first estilo Underchat
   ============================================================ */
function InboxPage() {
  const { data: ws } = useCurrentWorkspace();
  const { ticketId: ticketIdFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(ticketIdFromUrl ?? null);
  const [mainTab, setMainTab] = useState<"ticket" | "atendimentos">("atendimentos");
  const [search, setSearch] = useState("");
  const [searchInContent, setSearchInContent] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // filtros reais
  const [phoneNumberId, setPhoneNumberId] = useState<string>("__all__");
  const [sectorId, setSectorId] = useState<string>("__all__");
  const [assigneeId, setAssigneeId] = useState<string>("__all__");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "all">("all");
  const [sortAsc, setSortAsc] = useState(false);

  // tab Atendendo / Aguardando
  const [statusTab, setStatusTab] = useState<"atendendo" | "aguardando">("atendendo");

  // abre conversa direto via ?ticketId=
  useEffect(() => {
    if (ticketIdFromUrl && ticketIdFromUrl !== activeId) {
      setActiveId(ticketIdFromUrl);
      setMainTab("ticket");
      navigate({ to: "/app/inbox", search: { ticketId: undefined }, replace: true });
    }
  }, [ticketIdFromUrl, activeId, navigate]);

  // quando abre um ticket, vai pra aba Ticket
  useEffect(() => {
    if (activeId) setMainTab("ticket");
  }, [activeId]);

  const dimsFn = useServerFn(listTicketFilterDims);
  const dimsQ = useQuery({
    queryKey: ["ticket-dims", ws?.id], enabled: !!ws,
    queryFn: () => dimsFn({ data: { workspaceId: ws!.id } }),
  });

  const fetchTickets = useServerFn(listTickets);
  const ticketsQ = useQuery({
    queryKey: ["tickets", ws?.id, statusFilter, search, phoneNumberId, sectorId, assigneeId],
    enabled: !!ws,
    queryFn: () => fetchTickets({ data: {
      workspaceId: ws!.id,
      filter: statusFilter === "all" ? "all" : statusFilter,
      search,
      phoneNumberId: phoneNumberId === "__all__" ? null : phoneNumberId,
      sectorId: sectorId === "__all__" ? null : sectorId,
      assigneeId: assigneeId === "__all__" ? null : assigneeId,
    } }),
    refetchOnWindowFocus: false,
    // Fallback anti-perda: revalida a cada 15s mesmo se realtime cair
    refetchInterval: 15_000,
  });
  const allTickets = ticketsQ.data?.tickets ?? [];

  // separa Atendendo (status in_progress / waiting_client) vs Aguardando (open / critical sem atendente)
  const { atendendoList, aguardandoList } = useMemo(() => {
    const at: any[] = [];
    const ag: any[] = [];
    for (const t of allTickets) {
      const isWaiting = t.status === "open" || (t.status === "critical" && !t.assignee_id);
      if (isWaiting) ag.push(t);
      else at.push(t);
    }
    const sort = (a: any, b: any) => {
      const da = new Date(a.last_message_at ?? a.opened_at).getTime();
      const db = new Date(b.last_message_at ?? b.opened_at).getTime();
      return sortAsc ? da - db : db - da;
    };
    return { atendendoList: at.sort(sort), aguardandoList: ag.sort(sort) };
  }, [allTickets, sortAsc]);

  const visibleTickets = statusTab === "atendendo" ? atendendoList : aguardandoList;

  // realtime — canal estável (não recria ao trocar de conversa)
  const activeIdRef = useRef(activeId);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => {
    if (!ws) return;
    const ch = supabase
      .channel(`ws:${ws.id}:tickets`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets", filter: `workspace_id=eq.${ws.id}` },
        () => qc.invalidateQueries({ queryKey: ["tickets"] }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `workspace_id=eq.${ws.id}` },
        (p) => {
          qc.invalidateQueries({ queryKey: ["tickets"] });
          const row = p.new as any;
          const currentActive = activeIdRef.current;
          if (row?.ticket_id && row.ticket_id === currentActive) {
            // Aplica imediato no cache (sem esperar requery) — chat atualiza junto com a notificação
            qc.setQueryData<{ messages: any[] }>(["messages", currentActive], (old) => {
              if (!old || !Array.isArray(old.messages)) return old;
              if (old.messages.some((m: any) => m.id === row.id)) return old;
              return { messages: [...old.messages, row] };
            });
            qc.invalidateQueries({ queryKey: ["messages", currentActive] });
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [ws, qc]);

  if (!ws) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <LoadingDots size="sm" label="Carregando workspace" />
      </div>
    );
  }

  // Layout: desktop = split (lista + conversa). Mobile = uma tela por vez (igual antes).
  const showingChatMobile = !!activeId && mainTab === "ticket";

  return (
    <div className="flex h-full bg-background">
      {/* ===== COLUNA ESQUERDA — LISTA DE ATENDIMENTOS ===== */}
      <aside
        className={cn(
          "flex flex-col min-w-0 bg-background",
          // Desktop: largura fixa, sempre visível
          "lg:flex lg:w-[400px] lg:shrink-0 lg:border-r",
          // Mobile: ocupa tudo, mas some quando o chat está aberto
          showingChatMobile ? "hidden lg:flex" : "flex w-full",
        )}
      >
        <div className="lg:hidden">
          <MainTabs current={mainTab} onChange={setMainTab} />
        </div>

      {/* busca */}
      <div className="border-b bg-card px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar atendimento e mensagens"
            className="h-7 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Switch
                    checked={searchInContent}
                    onCheckedChange={setSearchInContent}
                    className="data-[state=checked]:bg-primary"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Marque para pesquisar também nos conteúdos das mensagens (mais lento)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            aria-label="Filtros"
            className={cn("rounded-md p-1 transition", filtersOpen ? "text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <FilterIcon className="h-4 w-4" />
          </button>
        </div>

        {/* filtros expansíveis */}
        {filtersOpen && (
          <div className="mt-3 space-y-2">
            <Input placeholder="Filtro por Tags" className="h-9 rounded-lg bg-muted/30 text-sm" disabled />
            <Select value={phoneNumberId} onValueChange={setPhoneNumberId}>
              <SelectTrigger className="h-9 rounded-lg bg-muted/30 text-sm"><SelectValue placeholder="Filtro por Conexão" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas as conexões</SelectItem>
                {dimsQ.data?.connections.map((c: any) => (
                  <SelectItem key={c.id} value={c.phone_number_id ?? c.id}>{c.display_phone_number ?? c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="h-9 rounded-lg bg-muted/30 text-sm"><SelectValue placeholder="Filtro por Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-9 rounded-lg bg-muted/30 text-sm"><SelectValue placeholder="Filtro por Usuarios" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos atendentes</SelectItem>
                {dimsQ.data?.members.map((m: any) => (
                  <SelectItem key={m.user_id} value={m.user_id}>{m.full_name ?? m.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Data</p>
              <Input type="date" className="h-9 rounded-lg bg-muted/30 text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* barra de ações */}
      <div className="border-b bg-card px-3 py-2">
        <div className="flex items-center gap-1.5">
          <ActionIconBtn
            label="Todos"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            icon={<EyeOff className="h-4 w-4" />}
          />
          <NewTicketTrigger workspaceId={ws.id} onCreated={(id) => setActiveId(id)} />
          <ActionIconBtn
            label="Fechar Todos"
            onClick={() => handleCloseAll(visibleTickets, qc)}
            icon={<ListChecks className="h-4 w-4 text-emerald-600" />}
          />
          <ActionIconBtn
            label="Abertos"
            active={statusFilter === "open"}
            onClick={() => setStatusFilter("open")}
            icon={<InboxIcon className="h-4 w-4" />}
            badge
          />
          <ActionIconBtn
            label="Resolvidos"
            active={statusFilter === "resolved"}
            onClick={() => setStatusFilter("resolved")}
            icon={<CheckSquare className="h-4 w-4" />}
          />
          <ActionIconBtn
            label={sortAsc ? "Crescente" : "Decrescente"}
            onClick={() => setSortAsc((v) => !v)}
            icon={<ArrowUpDown className="h-4 w-4" />}
          />
          <Select value={sectorId} onValueChange={setSectorId}>
            <SelectTrigger className="ml-auto h-9 w-28 rounded-lg text-sm"><SelectValue placeholder="Filas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Filas</SelectItem>
              {dimsQ.data?.sectors.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* abas Atendendo / Aguardando */}
      <div className="border-b bg-card px-3 py-2">
        <div className="grid grid-cols-2 gap-2">
          <StatusTab
            label="Atendendo"
            count={atendendoList.length}
            icon={<MessageSquare className="h-4 w-4" />}
            active={statusTab === "atendendo"}
            onClick={() => setStatusTab("atendendo")}
          />
          <StatusTab
            label="Aguardando"
            count={aguardandoList.length}
            icon={<Clock className="h-4 w-4" />}
            active={statusTab === "aguardando"}
            onClick={() => setStatusTab("aguardando")}
          />
        </div>
      </div>

      {/* lista */}
      <ScrollArea className="flex-1 bg-muted/20">
        {ticketsQ.isLoading && (
          <div className="p-6 text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>
        )}
        {!ticketsQ.isLoading && visibleTickets.length === 0 && (
          <EmptyState dims={dimsQ.data} />
        )}
        <ul className="divide-y bg-card">
          {visibleTickets.map((t: any) => (
            <AttendanceListItem
              key={t.id}
              ticket={t}
              tab={statusTab}
              onOpen={() => setActiveId(t.id)}
            />
          ))}
        </ul>
      </ScrollArea>
      </aside>

      {/* ===== COLUNA DIREITA — CONVERSA OU HERO ===== */}
      <main
        className={cn(
          "flex flex-1 flex-col min-w-0 min-h-0",
          showingChatMobile ? "flex" : "hidden lg:flex",
        )}
      >
        {activeId ? (
          <ConversationPane
            ticketId={activeId}
            workspaceId={ws?.id ?? null}
            onBack={() => { setActiveId(null); setMainTab("atendimentos"); }}
          />
        ) : (
          <ChatHero />
        )}
      </main>
    </div>
  );
}

/* Hero da Central de Atendimentos — fallback simples para o caminho legado (tema não-NexChat) */
function ChatHero() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/10 px-6 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
        <MessageSquare className="h-10 w-10" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Central de Atendimentos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Selecione um ticket para começar a conversar.</p>
      </div>
    </div>
  );
}

/* ============================================================
   Componentes auxiliares da lista
   ============================================================ */
function MainTabs({ current, onChange }: { current: "ticket" | "atendimentos"; onChange: (t: "ticket" | "atendimentos") => void }) {
  return (
    <div className="grid grid-cols-2 border-b bg-card">
      <TabBtn
        label="Ticket"
        icon={<MessageSquare className="h-4 w-4" />}
        active={current === "ticket"}
        onClick={() => onChange("ticket")}
      />
      <TabBtn
        label="Atendimentos"
        icon={<MessageSquare className="h-4 w-4 rotate-180" />}
        active={current === "atendimentos"}
        onClick={() => onChange("atendimentos")}
      />
    </div>
  );
}

function TabBtn({ label, icon, active, onClick }: { label: string; icon: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition relative",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 bg-primary rounded-full" />}
    </button>
  );
}

function ActionIconBtn({
  label, icon, active, onClick, badge,
}: { label: string; icon: ReactNode; active?: boolean; onClick: () => void; badge?: boolean }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg border transition",
              active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-foreground hover:bg-muted",
            )}
          >
            {icon}
            {badge && active && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-primary-foreground whitespace-nowrap">
                {label}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusTab({
  label, count, icon, active, onClick,
}: { label: string; count: number; icon: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition",
        active ? "border-primary bg-primary/5 text-foreground" : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40",
      )}
    >
      <span className="relative">
        {icon}
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </span>
      {label}
      {active && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
    </button>
  );
}

function AttendanceListItem({
  ticket: t, tab, onOpen,
}: { ticket: any; tab: "atendendo" | "aguardando"; onOpen: () => void }) {
  const qc = useQueryClient();
  const claimFn = useServerFn(claimTicket);
  const statusFn = useServerFn(updateTicketStatus);

  const claimMut = useMutation({
    mutationFn: () => claimFn({ data: { ticketId: t.id } }),
    onSuccess: () => { toast.success("Atendimento aceito"); qc.invalidateQueries({ queryKey: ["tickets"] }); onOpen(); },
    onError: (e: any) => toast.error(friendlyToastMessage(e?.message ?? "Não consegui aceitar.")),
  });
  const closeMut = useMutation({
    mutationFn: () => statusFn({ data: { ticketId: t.id, status: "closed" } }),
    onSuccess: () => { toast.success("Atendimento fechado"); qc.invalidateQueries({ queryKey: ["tickets"] }); },
    onError: (e: any) => toast.error(friendlyToastMessage(e?.message ?? "Não consegui fechar.")),
  });

  const tags: { label: string; tone: "green" | "red" | "dark" | "gray" }[] = [];
  if (t.number) tags.push({ label: String(t.number), tone: "green" });
  if (t.sector?.name) {
    tags.push({ label: t.sector.name.toUpperCase(), tone: "dark" });
  } else if (tab === "aguardando") {
    tags.push({ label: "SEM FILA", tone: "gray" });
  }

  return (
    <li className={cn("relative bg-card", tab === "aguardando" && "border-l-4 border-l-emerald-500")}>
      <div className="flex gap-3 px-3 py-3">
        <button onClick={onOpen} className="shrink-0">
          <Avatar className="h-12 w-12">
            {t.contact?.avatar_url ? <AvatarImage src={t.contact.avatar_url} alt="" /> : null}
            <AvatarFallback className="bg-primary/15 text-primary text-sm">
              {(t.contact?.name ?? t.contact?.phone ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            <p className="truncate text-sm font-bold text-foreground">
              {t.contact?.name || t.contact?.phone || "Sem nome"}
            </p>
          </div>
          <p className="mt-0.5 truncate text-sm text-foreground/80">
            {t.last_message_preview || "(sem mensagens)"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {tags.map((tag, i) => (
              <TagPill key={i} tone={tag.tone}>{tag.label}</TagPill>
            ))}
          </div>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {t.unread_count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                {t.unread_count}
              </span>
            )}
            <span className="text-xs font-semibold text-muted-foreground">
              {t.last_message_at ? formatTime(t.last_message_at) : ""}
            </span>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={onOpen} className="text-primary">
                    <Eye className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">Espiar conversa</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-1">
            {tab === "aguardando" && (
              <IconActionBtn
                label="Aceitar"
                color="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => claimMut.mutate()}
                icon={<CheckCircle2 className="h-4 w-4 text-white" />}
              />
            )}
            <IconActionBtn
              label="Transferir"
              color="bg-blue-500 hover:bg-blue-600"
              onClick={() => toast.info("Transferir — em breve")}
              icon={<ArrowRightLeft className="h-4 w-4 text-white" />}
            />
            <IconActionBtn
              label={tab === "aguardando" ? "Ignorar" : "Fechar"}
              color="bg-orange-500 hover:bg-orange-600"
              onClick={() => closeMut.mutate()}
              icon={<X className="h-4 w-4 text-white" />}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function IconActionBtn({ label, color, icon, onClick }: { label: string; color: string; icon: ReactNode; onClick: () => void }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn("flex h-8 w-8 items-center justify-center rounded-md transition", color)}
            aria-label={label}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TagPill({ tone, children }: { tone: "green" | "red" | "dark" | "gray"; children: ReactNode }) {
  const map: Record<string, string> = {
    green: "bg-emerald-500 text-white",
    red: "bg-red-600 text-white",
    dark: "bg-slate-900 text-white",
    gray: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", map[tone])}>
      {children}
    </span>
  );
}

function EmptyState({ dims }: { dims: any }) {
  const connErr = dims?.connections.find((c: any) => c.last_error);
  const hasOk = dims?.connections.some((c: any) => c.status === "connected");
  return (
    <div className="space-y-3 p-5 text-sm text-muted-foreground">
      <div className="rounded-lg border bg-card p-4 text-center">
        <InboxIcon className="mx-auto mb-2 h-8 w-8 opacity-40" />
        <p className="font-medium text-foreground">Nenhum atendimento aqui.</p>
        <p className="mt-1 text-xs">Quando uma pessoa mandar mensagem no WhatsApp conectado, a conversa aparece nesta lista.</p>
      </div>
      {connErr?.last_error && <FriendlyErrorBox error={connErr.last_error} />}
      {!hasOk && !connErr && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          <p className="font-semibold text-amber-700 dark:text-amber-300">WhatsApp ainda não está liberado para receber.</p>
          <p className="mt-1">Vá em Canais e conclua a conexão.</p>
        </div>
      )}
    </div>
  );
}

function NewTicketTrigger({ workspaceId, onCreated }: { workspaceId: string; onCreated: (id: string) => void }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <NewTicketDialog workspaceId={workspaceId} onCreated={onCreated} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">Novo Ticket</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

async function handleCloseAll(tickets: any[], qc: ReturnType<typeof useQueryClient>) {
  if (!tickets.length) { toast.info("Nada para fechar"); return; }
  toast(`Fechar ${tickets.length} atendimento(s)?`, {
    description: "Essa ação encerra todos os tickets visíveis.",
    action: {
      label: "Fechar todos",
      onClick: async () => {
        let ok = 0;
        for (const t of tickets) {
          try {
            await supabase.from("tickets").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", t.id);
            ok++;
          } catch { /* ignora */ }
        }
        qc.invalidateQueries({ queryKey: ["tickets"] });
        toast.success(`${ok} atendimento(s) fechado(s)`);
      },
    },
    cancel: { label: "Cancelar", onClick: () => {} },
    duration: 10000,
  });
}

/* ============================================================
   Conversa (chat) — header e action bar estilo Underchat
   ============================================================ */
function ConversationPane({ ticketId, workspaceId, onBack }: { ticketId: string; workspaceId: string | null; onBack?: () => void }) {
  const fetchTicket = useServerFn(getTicket);
  const fetchMessages = useServerFn(listMessages);
  const sendFn = useServerFn(sendMessage);
  const updateStatusFn = useServerFn(updateTicketStatus);
  const markReadFn = useServerFn(markRead);
  const windowFn = useServerFn(getTicketWindowStatus);
  const deleteFn = useServerFn(deleteTicket);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [isNote, setIsNote] = useState(false);
  const [composerMenuOpen, setComposerMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [integrationEnabled, setIntegrationEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(`ticket-integration:${ticketId}`) !== "off";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIntegrationEnabled(localStorage.getItem(`ticket-integration:${ticketId}`) !== "off");
  }, [ticketId]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ticketQ = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => fetchTicket({ data: { ticketId } }),
  });
  const msgsQ = useQuery({
    queryKey: ["messages", ticketId],
    queryFn: () => fetchMessages({ data: { ticketId } }),
  });
  const windowQ = useQuery({
    queryKey: ["ticket-window", ticketId],
    queryFn: () => windowFn({ data: { ticketId } }),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    markReadFn({ data: { ticketId } }).catch(() => {});
  }, [ticketId, markReadFn]);

  useEffect(() => { hydrateQueueFromStorage(); }, []);

  const queueItems = useSyncExternalStore(
    useCallback((cb) => subscribeQueue(cb), []),
    useCallback(() => getQueueSnapshot(ticketId), [ticketId]),
    getEmptyQueueSnapshot,
  );

  useEffect(() => {
    if (!workspaceId) return;
    const channel = supabase
      .channel(`ws:${workspaceId}:ticket-msgs:${ticketId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        (payload) => {
          const updated = payload.new as { id: string; delivery?: string };
          qc.setQueryData<{ messages: any[] }>(["messages", ticketId], (old) => {
            if (!old) return old;
            return { messages: old.messages.map((m: any) => m.id === updated.id ? { ...m, delivery: updated.delivery ?? m.delivery } : m) };
          });
        })
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
        (p) => {
          const row = p.new as any;
          // Mete a mensagem no cache na hora (sem esperar refetch)
          qc.setQueryData<{ messages: any[] }>(["messages", ticketId], (old) => {
            if (!old || !Array.isArray(old.messages)) return old;
            if (old.messages.some((m: any) => m.id === row.id)) return old;
            return { messages: [...old.messages, row] };
          });
          // Revalida em background pra garantir mídia/status corretos
          qc.invalidateQueries({ queryKey: ["messages", ticketId] });
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticketId, workspaceId, qc]);

  const sendOnce = useCallback(
    (vars: { ticketId: string; body: string; isInternalNote: boolean }) => sendFn({ data: vars }),
    [sendFn],
  );

  // ===== PIX pendente do ticket (Etapa 3 — comandos PIX no chat)
  const pendingPixFn = useServerFn(getPendingPixForTicket);
  const pendingPixQ = useQuery({
    queryKey: ["pending-pix", ticketId],
    queryFn: () => pendingPixFn({ data: { ticketId } }),
    refetchInterval: 20_000,
  });
  const pendingPix = pendingPixQ.data?.pending ?? null;
  const [pixDialogOpen, setPixDialogOpen] = useState(false);
  const [pixAmount, setPixAmount] = useState("");

  const runCommand = useCallback((cmd: string) => {
    const localId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    enqueueMessage(
      { localId, ticketId, body: cmd, isInternalNote: false, createdAt: new Date().toISOString() },
      sendOnce, qc,
    );
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ["pending-pix", ticketId] });
      qc.invalidateQueries({ queryKey: ["messages", ticketId] });
    }, 1500);
  }, [ticketId, sendOnce, qc]);

  const handleGeneratePix = () => {
    const v = pixAmount.replace(",", ".").trim();
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Informe um valor válido. Ex: 50 ou 49,90");
      return;
    }
    runCommand(`/pix ${n}`);
    setPixDialogOpen(false);
    setPixAmount("");
    setComposerMenuOpen(false);
  };


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgsQ.data, queueItems.length]);

  const ticket = ticketQ.data?.ticket as any;
  const messages = msgsQ.data?.messages ?? [];

  const windowBlocks =
    !isNote &&
    ticket?.channel === "whatsapp" &&
    ticket?.connection_id &&
    windowQ.data?.status === "closed";
  const canSend = !!draft.trim() && !windowBlocks;

  const handleSend = () => {
    const body = draft.trim();
    if (!body || windowBlocks) return;
    setDraft("");
    const localId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    enqueueMessage(
      { localId, ticketId, body, isInternalNote: isNote, createdAt: new Date().toISOString() },
      sendOnce, qc,
    );
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleRetry = (localId: string) => retryMessage(ticketId, localId, sendOnce, qc);
  const handleDiscard = (localId: string) => removeFromQueue(ticketId, localId);

  const statusMut = useMutation({
    mutationFn: (status: string) => updateStatusFn({ data: { ticketId, status: status as any } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Status atualizado");
    },
    onError: (e: any) => toast.error(friendlyToastMessage(e?.message ?? "Não consegui mudar o status.")),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteFn({ data: { ticketId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Atendimento deletado");
      setConfirmDeleteOpen(false);
      if (onBack) onBack();
      else navigate({ to: "/app/inbox", search: { ticketId: undefined } });
    },
    onError: (e: any) => toast.error(friendlyToastMessage(e?.message ?? "Não consegui deletar.")),
  });

  const toggleIntegration = () => {
    const next = !integrationEnabled;
    setIntegrationEnabled(next);
    localStorage.setItem(`ticket-integration:${ticketId}`, next ? "on" : "off");
    toast.success(next ? "Integração habilitada para este atendimento" : "Integração desabilitada");
  };

  const exportPdf = () => {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) { toast.error("Habilite popups para exportar"); return; }
    const title = `Atendimento #${ticket.number ?? ""} — ${ticket.contact?.name ?? ticket.contact?.phone ?? ""}`;
    const rows = messages.map((m: any) => {
      const who = m.direction === "outbound" ? "Atendente" : (ticket.contact?.name ?? "Cliente");
      const when = formatDateTimeBR(m.created_at, { second: "2-digit" });
      const body = (m.body ?? m.caption ?? "").replace(/</g, "&lt;");
      return `<div class="msg ${m.direction}"><div class="meta">${who} · ${when}</div><div class="body">${body || "<i>(sem texto)</i>"}</div></div>`;
    }).join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:system-ui,sans-serif;padding:24px;color:#111}
h1{font-size:18px;margin:0 0 4px}
.sub{color:#666;font-size:12px;margin-bottom:20px}
.msg{margin:10px 0;padding:10px 12px;border-radius:10px;max-width:80%;background:#f1f1f1}
.msg.outbound{background:#dcf8c6;margin-left:auto}
.meta{font-size:11px;color:#555;margin-bottom:4px}
.body{white-space:pre-wrap;font-size:14px}
@media print{.no-print{display:none}}
</style></head><body>
<h1>${title}</h1>
<div class="sub">Telefone: ${ticket.contact?.phone ?? "—"} · Status: ${ticket.status} · Exportado em ${formatDateTimeBR(new Date(), { second: "2-digit" })}</div>
${rows || "<p>Sem mensagens.</p>"}
<script>setTimeout(()=>window.print(),300);</script>
</body></html>`);
    win.document.close();
  };

  if (!ticket) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <LoadingDots size="sm" label="Carregando" />
      </div>
    );
  }

  const assigneeLabel = ticket.assignee_id ? "Atribuído" : "Sem atendente";

  return (
    <div className="flex flex-1 flex-col min-w-0 min-h-0 h-full bg-background">
      {/* header do ticket */}
      <div className="shrink-0 border-b bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 lg:hidden" onClick={onBack} aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            {ticket.contact?.avatar_url ? <AvatarImage src={ticket.contact.avatar_url} alt="" /> : null}
            <AvatarFallback className="bg-primary/15 text-primary">
              {(ticket.contact?.name ?? ticket.contact?.phone ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">
              {ticket.contact?.name || ticket.contact?.phone}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              {ticket.number ? (
                <span className="shrink-0 font-semibold text-foreground/70">Ticket #{ticket.number}</span>
              ) : null}
              <span className="truncate">
                · {assigneeLabel}{ticket.contact?.phone ? ` · ${ticket.contact.phone}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* barra de ações */}
        <div className="mt-2 flex items-center gap-1.5">
          <ActionRoundBtn label="Fechar" color="text-red-500" onClick={() => statusMut.mutate("closed")}>
            <X className="h-5 w-5" />
          </ActionRoundBtn>
          <ActionRoundBtn label="Reabrir" color="text-orange-500" onClick={() => statusMut.mutate("open")}>
            <Undo2 className="h-5 w-5" />
          </ActionRoundBtn>
          <ActionRoundBtn label="Transferir" color="text-blue-500" onClick={() => toast.info("Transferir — em breve")}>
            <ArrowRightLeft className="h-5 w-5" />
          </ActionRoundBtn>
          <ActionRoundBtn label="Pesquisar" color="text-emerald-500" onClick={() => toast.info("Buscar na conversa — em breve")}>
            <Search className="h-5 w-5" />
          </ActionRoundBtn>
          <div className="ml-1 flex items-center gap-1.5">
            <Switch />
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted" aria-label="Mais ações">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-red-500 focus:text-red-500">
                  <X className="mr-2 h-4 w-4" />Deletar Ticket
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleIntegration}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  {integrationEnabled ? "Desabilitar integração" : "Habilitar integração"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLogsOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />Logs do Ticket
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPdf}>
                  <Download className="mr-2 h-4 w-4" />Exportar para PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* tags */}
        <div className="mt-2">
          <Input placeholder="Tags" className="h-9 rounded-lg bg-muted/30 text-sm" />
        </div>
      </div>

      {/* status selector compacto + indicador janela 24h */}
      <div className="shrink-0 flex items-center justify-between gap-2 border-b bg-card px-3 py-2">
        <WindowIndicator window={windowQ.data} />
        <Select value={ticket.status} onValueChange={(v) => statusMut.mutate(v)}>
          <SelectTrigger className="h-7 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 bg-[#efeae2] dark:bg-[#0b141a]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='%23000000' stroke-opacity='0.045' stroke-width='1.2'><circle cx='20' cy='20' r='6'/><path d='M50 15 q10 -8 20 0 t20 0'/><circle cx='95' cy='35' r='3'/><path d='M10 70 q15 -12 30 0'/><circle cx='70' cy='80' r='5'/><path d='M85 95 l8 8 M93 95 l-8 8'/><circle cx='40' cy='100' r='4'/></g></svg>\")",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {messages.map((m: any) => (
            <MessageBubble key={m.id} m={m} mineUserId={user?.id} />
          ))}
          {queueItems.map((q) => (
            <QueuedBubble key={q.localId} item={q} onRetry={() => handleRetry(q.localId)} onDiscard={() => handleDiscard(q.localId)} />
          ))}
          {messages.length === 0 && queueItems.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
          )}
        </div>
      </div>

      {/* composer */}
      <div className="sticky bottom-0 z-20 relative border-t bg-card p-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {!isNote && windowQ.data?.status === "closed" && (
          <p className="mb-2 text-center text-[11px] text-red-600 dark:text-red-400">
            ⚠ Fora da janela 24h — só templates aprovados são permitidos.
          </p>
        )}
        {!isNote && windowQ.data?.status === "warning" && (
          <p className="mb-2 text-center text-[11px] text-amber-600 dark:text-amber-400">
            Janela 24h expira em {windowQ.data.minutesRemaining} min
          </p>
        )}

        {/* Banner PIX pendente (Etapa 3) */}
        {pendingPix && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-700/40 dark:bg-emerald-950/30">
            <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">PIX pendente</span>
              <span className="ml-2 text-foreground">
                {Number(pendingPix.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              {pendingPix.expires_at && (
                <span className="ml-2 text-muted-foreground">
                  · expira {new Date(pendingPix.expires_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </span>
              )}
            </div>
            {pendingPix.copy_paste && (
              <Button
                size="sm" variant="ghost" className="h-7 px-2 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(pendingPix.copy_paste!);
                  toast.success("PIX copia e cola copiado");
                }}
              >
                <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
              </Button>
            )}
            <Button
              size="sm" variant="ghost"
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
              onClick={() => runCommand("/cancelar pix")}
            >
              <Ban className="mr-1 h-3.5 w-3.5" /> Cancelar
            </Button>
          </div>
        )}

        {composerMenuOpen && (
          <div className="absolute bottom-16 left-3 z-10 flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-lg">
            <div className="flex gap-3">
              <ComposerMenuBtn icon={<Smile className="h-5 w-5" />} onClick={() => toast.info("Emoji — em breve")} />
              <ComposerMenuBtn icon={<Paperclip className="h-5 w-5" />} onClick={() => toast.info("Anexo — em breve")} />
              <ComposerMenuBtn icon={<MapPin className="h-5 w-5" />} onClick={() => toast.info("Localização — em breve")} />
            </div>
            <div className="flex gap-3">
              <ComposerMenuBtn icon={<Pencil className="h-5 w-5" />} onClick={() => { setIsNote((v) => !v); setComposerMenuOpen(false); }} />
              <ComposerMenuBtn icon={<MessageSquare className="h-5 w-5" />} onClick={() => toast.info("Respostas rápidas — em breve")} />
            </div>
            <div className="border-t pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pagamentos</p>
              <div className="flex gap-3">
                <ComposerMenuBtn
                  icon={<Receipt className="h-5 w-5 text-emerald-600" />}
                  onClick={() => { setPixDialogOpen(true); }}
                />
                <ComposerMenuBtn
                  icon={<Eye className="h-5 w-5" />}
                  onClick={() => { runCommand("/ver pix"); setComposerMenuOpen(false); }}
                />
                <ComposerMenuBtn
                  icon={<Ban className="h-5 w-5 text-red-500" />}
                  onClick={() => { runCommand("/cancelar pix"); setComposerMenuOpen(false); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dialog gerar PIX */}
        <Dialog open={pixDialogOpen} onOpenChange={setPixDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Gerar PIX para este contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label htmlFor="pix-amount">Valor (R$)</Label>
              <Input
                id="pix-amount"
                inputMode="decimal"
                placeholder="50,00"
                value={pixAmount}
                onChange={(e) => setPixAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGeneratePix(); }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                A cobrança será criada via gateway configurado e a mensagem é enviada automaticamente ao contato.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPixDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGeneratePix}>
                <Receipt className="mr-2 h-4 w-4" /> Gerar PIX
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => setComposerMenuOpen((v) => !v)} aria-label="Mais">
            <Plus className="h-5 w-5" />
          </Button>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (canSend) handleSend(); }
            }}
            placeholder={isNote ? "Nota interna…" : windowBlocks ? "Fora da janela 24h" : "Digite sua mensagem"}
            rows={1}
            disabled={windowBlocks}
            className={cn("min-h-[40px] resize-none rounded-full border-0 bg-muted/40 px-4 py-2 text-sm shadow-none focus-visible:ring-1", isNote && "bg-amber-50 dark:bg-amber-950/20")}
          />
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => toast.info("Atalhos — em breve")} aria-label="Atalhos">
            <Zap className="h-5 w-5 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => toast.info("Mensagem temporária — em breve")} aria-label="Temporizador">
            <Timer className="h-5 w-5" />
          </Button>
          {canSend ? (
            <Button onClick={handleSend} className="h-10 w-10 shrink-0 rounded-full p-0" aria-label="Enviar">
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="secondary" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => toast.info("Áudio — em breve")} aria-label="Gravar áudio">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Button
            type="button"
            variant={isNote ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsNote((v) => !v)}
            className="h-7 gap-1 text-xs"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Nota interna
          </Button>
        </div>
      </div>

      {/* Confirmação de deletar */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar este atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar o ticket #{ticket.number} e todas as mensagens. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteMut.mutate(); }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logs / histórico do ticket */}
      <Sheet open={logsOpen} onOpenChange={setLogsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Logs do atendimento #{ticket.number}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <TicketTimelinePanel ticketId={ticketId} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ActionRoundBtn({ label, color, onClick, children }: { label: string; color: string; onClick: () => void; children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn("flex h-9 w-9 items-center justify-center rounded-md border bg-card transition hover:bg-muted", color)}
            aria-label={label}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ComposerMenuBtn({ icon, onClick }: { icon: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-muted"
    >
      {icon}
    </button>
  );
}

function MessageBubble({ m, mineUserId }: { m: any; mineUserId?: string }) {
  if (m.is_internal_note) {
    return (
      <div className="my-1 self-center rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
        <StickyNote className="mr-1 inline h-3 w-3" />
        {m.body}
      </div>
    );
  }
  const fromAgent = m.author === "agent" || m.author === "ai" || m.author === "bot";
  const mine = m.author_user_id === mineUserId;
  const hasMedia = !!m.media_url;
  const metaType = String(m.meta_message_type ?? m.kind ?? "text").toLowerCase();
  const raw = (m.raw_payload_sanitized ?? {}) as any;
  const msgPayload = raw?.message ?? raw ?? {};
  const isSticker = metaType === "sticker" || (hasMedia && (String(m.media_mime ?? "").includes("webp") || /figurinha/i.test(String(m.body ?? ""))));
  // Sticker: sem balão, imagem pequena solta
  if (isSticker && hasMedia) {
    return (
      <div className={cn("flex", fromAgent ? "justify-end" : "justify-start")}>
        <StickerImage url={m.media_url} />
      </div>
    );
  }
  if (isSticker && msgPayload?.sticker?.animated) {
    return <MessageCardShell m={m} fromAgent={fromAgent} mine={mine}><AnimatedStickerFallback message={m} /></MessageCardShell>;
  }
  // Caption visível só se for diferente das labels automáticas
  const autoLabels = /^(📷 Imagem|🎥 Vídeo|🎵 Áudio|🎙️ Mensagem de voz|📎 Documento|💫 Figurinha animada|🩹 Figurinha)$/;
  const showBody = m.body && !(hasMedia && autoLabels.test(String(m.body).trim()));
  const special = renderSpecialMessage(m);
  const mediaType = ["image", "video", "audio", "document"].includes(metaType) ? metaType : null;
  return (
    <div className={cn("flex", fromAgent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          fromAgent
            ? mine
              ? "bg-primary text-primary-foreground"
              : "bg-emerald-600 text-white"
            : "bg-card border",
        )}
      >
        {m.author === "ai" && <p className="mb-0.5 text-[10px] opacity-70">🤖 IA</p>}
        {special ?? <>{hasMedia ? <MediaRenderer message={m} /> : mediaType ? <MediaUnavailableCard message={m} /> : null}{showBody && !mediaType && <p className="whitespace-pre-wrap break-words">{m.body}</p>}</>}
        {!special && !hasMedia && !m.body && <UnsupportedFallback message={m} />}
        <p className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
          <span>{formatTimeBR(m.created_at, { hour: "2-digit", minute: "2-digit" })}</span>
          {fromAgent && <MessageStatusIcon status={m.delivery} />}
        </p>
      </div>
    </div>
  );
}

function QueuedBubble({
  item, onRetry, onDiscard,
}: {
  item: QueuedMessage;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const failed = item.status === "failed";
  return (
    <div className="flex justify-end">
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
        failed ? "border border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/30 dark:text-red-100"
               : "bg-primary/80 text-primary-foreground",
      )}>
        <p className="whitespace-pre-wrap break-words">{item.body}</p>
        <p className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-80">
          <span>{formatTimeBR(item.createdAt, { hour: "2-digit", minute: "2-digit" })}</span>
          <MessageStatusIcon status={failed ? "failed" : "pending"} />
        </p>
        {failed && (
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={onRetry}>
              <RefreshCw className="mr-1 h-3 w-3" /> Reenviar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onDiscard}>
              Descartar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageCardShell({ m, fromAgent, mine, children }: { m: any; fromAgent: boolean; mine: boolean; children: ReactNode }) {
  return (
    <div className={cn("flex", fromAgent ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", fromAgent ? (mine ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white") : "bg-card border")}>
        {children}
        <p className="mt-1 text-right text-[10px] opacity-60">
          {formatTimeBR(m.created_at, { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function renderSpecialMessage(message: any) {
  const metaType = String(message.meta_message_type ?? "").toLowerCase();
  const raw = (message.raw_payload_sanitized ?? {}) as any;
  const payload = raw?.message ?? raw ?? {};
  const body = String(message.body ?? "");

  if (metaType === "reaction") {
    const emoji = (payload?.reaction?.emoji ?? body.replace("Reação", "").trim()) || "❤️";
    return <InfoCard title={`${emoji} Reação recebida`} text={payload?.reaction?.message_id ? `Vinculada à mensagem ${payload.reaction.message_id}` : "Não consegui identificar a mensagem original."} />;
  }
  if (metaType === "button") {
    const btnText = payload?.button?.text ?? body.replace(/^Resposta de botão:\s*/i, "");
    return <InfoCard title="Resposta de botão" text={btnText || "—"} />;
  }
  if (metaType === "interactive") {
    const reply = payload?.interactive?.button_reply ?? payload?.interactive?.list_reply;
    const label = payload?.interactive?.list_reply ? "Opção selecionada" : "Botão selecionado";
    return <InfoCard title={label} text={(reply?.title ?? body) || "—"} />;
  }
  if (metaType === "location") return <LocationCard location={payload?.location} fallback={body} />;
  if (metaType === "contacts") return <ContactCard contacts={payload?.contacts} fallback={body} />;
  if (metaType === "order" || metaType === "system") return <InfoCard title={metaType === "order" ? "Pedido recebido" : "Mensagem de sistema"} text={body || "Recebido pelo WhatsApp."} />;
  if (metaType === "unsupported" || /Mensagem não suportada \(atualize o WhatsApp\)/i.test(body)) return <UnsupportedFallback message={message} />;
  return null;
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border bg-background/30 p-3"><p className="font-medium">{title}</p><p className="mt-1 whitespace-pre-wrap text-xs opacity-80">{text}</p></div>;
}

function LocationCard({ location, fallback }: { location: any; fallback: string }) {
  const lat = location?.latitude;
  const lng = location?.longitude;
  const url = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null;
  return (
    <div className="rounded-xl border bg-background/30 p-3">
      <p className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4" />Localização recebida</p>
      <p className="mt-1 text-xs opacity-80">{location?.name || location?.address || fallback || "Coordenadas recebidas."}</p>
      {lat && lng && <p className="mt-1 text-xs opacity-70">{lat}, {lng}</p>}
      {url && <Button asChild size="sm" variant="secondary" className="mt-2 h-8"><a href={url} target="_blank" rel="noreferrer">Abrir no mapa</a></Button>}
    </div>
  );
}

function ContactCard({ contacts, fallback }: { contacts: any[] | undefined; fallback: string }) {
  const first = contacts?.[0];
  const name = first?.name?.formatted_name ?? "Contato recebido";
  const phone = first?.phones?.[0]?.phone ?? first?.phones?.[0]?.wa_id ?? "";
  return <InfoCard title="Contato recebido" text={phone ? `${name}\n${phone}` : (fallback || name)} />;
}

function UnsupportedFallback({ message }: { message: any }) {
  const raw = message.raw_payload_sanitized ?? {};
  const type = message.meta_message_type ?? message.kind ?? "desconhecido";
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
      <p className="font-medium">Mensagem recebida, mas este tipo ainda não é exibido no MultiZap.</p>
      <details className="mt-2 text-xs opacity-80">
        <summary className="cursor-pointer font-medium">Ver detalhes técnicos</summary>
        <p className="mt-2">Tipo real: {String(type)}</p>
        <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-background/60 p-2 text-[10px]">{JSON.stringify(raw, null, 2)}</pre>
      </details>
    </div>
  );
}

function StickerImage({ url }: { url: string | null | undefined }) {
  const signed = useSignedMediaUrl(url);
  if (!signed) return null;
  return <img src={signed} alt="figurinha" className="h-32 w-32 object-contain" loading="lazy" />;
}

function AnimatedStickerFallback({ message }: { message: any }) {
  const signed = useSignedMediaUrl(message.media_url as string | null | undefined);
  return (
    <div className="rounded-xl border bg-background/30 p-3">
      <p className="font-medium">Sticker animado recebido</p>
      <p className="mt-1 text-xs opacity-80">Se ele não aparecer automaticamente, abra o arquivo recebido.</p>
      {signed && <Button asChild size="sm" variant="secondary" className="mt-2 h-8"><a href={signed} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Baixar</a></Button>}
    </div>
  );
}

function MediaUnavailableCard({ message }: { message: any }) {
  const qc = useQueryClient();
  const type = String(message.meta_message_type ?? message.kind ?? "mídia");
  const ticketId = message.ticket_id;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
      <p className="font-medium">Mídia recebida, mas não foi possível baixar agora.</p>
      <p className="mt-1 text-xs opacity-80">Tipo: {type}</p>
      <Button size="sm" variant="secondary" className="mt-2 h-8" onClick={() => qc.invalidateQueries({ queryKey: ticketId ? ["messages", ticketId] : ["messages"] })}>
        <RefreshCw className="mr-2 h-4 w-4" />Tentar baixar novamente
      </Button>
    </div>
  );
}

function MediaRenderer({ message }: { message: any }) {
  const logRender = useServerFn(logMessageDiagnosticEvent);
  const report = (eventType: "media_render_success" | "media_render_failed", detail?: string) => {
    logRender({ data: { messageId: message.id, eventType, detail } }).catch(() => {});
  };
  const url = useSignedMediaUrl(message.media_url as string | null | undefined);
  if (!url) return null;
  const mime = String(message.media_mime ?? message.kind ?? "").toLowerCase();
  const isImage = mime === "image" || mime.startsWith("image/");
  const isVideo = mime === "video" || mime.startsWith("video/");
  const isAudio = mime === "audio" || mime.startsWith("audio/");

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-1 block overflow-hidden rounded-xl bg-background/30">
        <img src={url} alt={message.body || "imagem"} className="max-h-72 w-full object-contain" loading="lazy" onLoad={() => report("media_render_success", "imagem carregada")} onError={() => report("media_render_failed", "imagem falhou")} />
      </a>
    );
  }
  if (isVideo) {
    return (
      <video
        src={url}
        controls
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => report("media_render_success", "vídeo carregado")}
        onError={() => report("media_render_failed", "vídeo falhou")}
        className="mb-1 max-h-80 w-full rounded-xl bg-background/50"
      />
    );
  }
  if (isAudio) {
    return <audio src={url} controls preload="metadata" className="mb-1 w-full min-w-56" onCanPlay={() => report("media_render_success", "áudio carregado")} onError={() => report("media_render_failed", "áudio falhou")} />;
  }
  const raw = (message.raw_payload_sanitized ?? {}) as any;
  const doc = raw?.message?.document ?? raw?.document ?? {};
  const filename = doc?.filename ?? String(message.body ?? "Documento").replace(/^📎\s*/, "");
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mb-1 flex items-center gap-2 rounded-lg border bg-background/30 p-2 text-xs hover:bg-background/50" onClick={() => report("media_render_success", "documento aberto") }>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate"><strong>{filename || "Documento"}</strong><br />{message.media_mime || "arquivo recebido"}</span>
      <Download className="h-4 w-4 shrink-0" />
    </a>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm">{value}</p>
    </div>
  );
}

function NewTicketDialog({ workspaceId, onCreated }: { workspaceId: string; onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const createFn = useServerFn(createTicketWithMessage);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => createFn({ data: { workspaceId, contactPhone: phone, contactName: name || undefined, body } }),
    onSuccess: (r) => {
      toast.success("Atendimento criado");
      qc.invalidateQueries({ queryKey: ["tickets"] });
      onCreated(r.ticketId);
      setOpen(false); setPhone(""); setName(""); setBody("");
    },
    onError: (e: any) => toast.error(friendlyToastMessage(e?.message ?? "Não consegui criar o atendimento.")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo atendimento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nt-phone">Telefone *</Label>
            <Input id="nt-phone" placeholder="+55 11 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nt-name">Nome (opcional)</Label>
            <Input id="nt-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nt-body">Mensagem inicial *</Label>
            <Textarea id="nt-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => mut.mutate()} disabled={!phone.trim() || !body.trim() || mut.isPending}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = formatDateBR(d) === formatDateBR(now);
  if (sameDay) return formatTimeBR(d);
  return formatDateBR(d, { day: "2-digit", month: "2-digit", year: undefined });
}

function WindowIndicator({ window: w }: { window: { status: string; minutesRemaining: number; hasConnection: boolean } | undefined }) {
  if (!w || !w.hasConnection || w.status === "no_channel" || w.status === "unknown") return null;
  const cfg =
    w.status === "open"
      ? { dot: "bg-emerald-500", text: "Janela 24h aberta", title: `Resta ${Math.floor(w.minutesRemaining / 60)}h ${w.minutesRemaining % 60}min` }
      : w.status === "warning"
      ? { dot: "bg-amber-500", text: `Expira em ${w.minutesRemaining}min`, title: "Janela 24h prestes a fechar" }
      : { dot: "bg-red-500", text: "Fora da janela 24h", title: "Apenas templates aprovados podem ser enviados" };
  return (
    <span title={cfg.title} className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[11px] font-medium">
      <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
      {cfg.text}
    </span>
  );
}
