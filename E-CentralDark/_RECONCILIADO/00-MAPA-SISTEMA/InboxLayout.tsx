import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateBR, formatDateTimeBR, formatTimeBR } from "@/lib/datetime";
import {
  listTickets,
  listMessages,
  sendMessage,
  updateTicketStatus,
  markRead,
  assignTicket,
  claimTicket,
  createTicketWithMessage,
} from "@/lib/tickets.functions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateContactName } from "@/lib/contacts.functions";
import { logAdminInboxAction } from "@/lib/admin-inbox-audit.functions";
import { useSignedMediaUrl } from "@/lib/use-signed-media-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, Send, StickyNote, Clock, MessageCircle, Users, Plus,
  UserMinus, History, MoreVertical, ListFilter, ArrowUpDown, CheckSquare,
  Bot, Smile, Mic, Paperclip, X, FileText, Loader2, Pencil, Check,
  Sparkles, Trello,
} from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

function initials(name?: string | null, phone?: string | null) {
  if (name) return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  if (phone) return phone.slice(-2);
  return "??";
}

function maskPhone(p?: string | null) {
  if (!p) return "";
  const d = p.replace(/\D/g, "");
  if (d.length >= 12) {
    const cc = d.slice(0, 2);
    const ddd = d.slice(2, 4);
    const mid = d.slice(4, d.length - 4);
    const end = d.slice(-4);
    const maskedMid = "*".repeat(Math.max(0, mid.length));
    return `+${cc} (${ddd}) ${maskedMid}-${end}`;
  }
  return p;
}

function dayLabel(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) return formatDateBR(d, { weekday: "long", day: undefined, month: undefined, year: undefined }).replace(/-feira/, "-feira");
  return formatDateBR(d);
}

// Abas no padrão Underchat (ordem dos prints)
type TabKey = "critical" | "all" | "in_progress" | "mine" | "open" | "bot";
const TABS: { key: TabKey; icon: any; title: string; danger?: boolean }[] = [
  { key: "critical", icon: UserMinus, title: "Sem atendente", danger: true },
  { key: "all", icon: ListFilter, title: "Todos" },
  { key: "in_progress", icon: MessageCircle, title: "Em Atendimento" },
  { key: "mine", icon: Users, title: "Meus atendimentos" },
  { key: "open", icon: Clock, title: "Aguardando atendimento" },
  { key: "bot", icon: Bot, title: "ChatBot" },
];

export function InboxLayout({
  scope = "workspace",
  workspaceOverride,
  readOnly = false,
}: {
  scope?: "workspace" | "admin";
  workspaceOverride?: { id: string; name: string } | null;
  readOnly?: boolean;
}) {
  const { data: currentWs } = useCurrentWorkspace();
  const ws = (workspaceOverride ?? currentWs) as { id: string; name: string } | null;
  const { user } = useAuth();
  const qc = useQueryClient();
  const canMutate = !readOnly;

  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [isNote, setIsNote] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [showAgentsInfo, setShowAgentsInfo] = useState(false);
  const [confirmClaim, setConfirmClaim] = useState(false);

  const fetchTickets = useServerFn(listTickets);
  const fetchMessages = useServerFn(listMessages);
  const sendFn = useServerFn(sendMessage);
  const updateStatus = useServerFn(updateTicketStatus);
  const markReadFn = useServerFn(markRead);
  const updateNameFn = useServerFn(updateContactName);
  const assignFn = useServerFn(assignTicket);
  const claimFn = useServerFn(claimTicket);
  const logAdminFn = useServerFn(logAdminInboxAction);
  const isInterventionMode = scope === "admin" && !readOnly;

  // Detecta comando financeiro no corpo da mensagem (lado client — só pra
  // auditar action específico; o processamento real continua no parser
  // existente em chat-payments.functions.ts).
  function detectPaymentCommand(text: string): { command_type: string; amount?: number } | null {
    const t = text.trim().toLowerCase();
    const mPix = t.match(/^\/?pix\s+(\d+(?:[.,]\d{1,2})?)/);
    if (mPix) return { command_type: "pix_create", amount: Number(mPix[1].replace(",", ".")) };
    const mCob = t.match(/^\/?cobrar\s+(\d+(?:[.,]\d{1,2})?)/);
    if (mCob) return { command_type: "charge_create", amount: Number(mCob[1].replace(",", ".")) };
    if (/^\/?cancelar\s+pix\b/.test(t)) return { command_type: "pix_cancel" };
    if (/^\/?ver\s+pix\b/.test(t)) return { command_type: "pix_view" };
    if (/^\/?pendentes\b/.test(t)) return { command_type: "payments_pending" };
    if (/^\/?pagos\b/.test(t)) return { command_type: "payments_paid" };
    return null;
  }

  async function auditAdminAction(input: Record<string, unknown>) {
    if (!isInterventionMode || !ws) return;
    try { await logAdminFn({ data: input as never }); } catch (e) { console.error("[admin audit]", e); }
  }

  // Busca TUDO uma vez; filtra/categoriza client-side pra alimentar contadores das abas
  const ticketsQ = useQuery({
    queryKey: ["inbox-tickets-all", ws?.id, search],
    enabled: !!ws,
    queryFn: () => fetchTickets({ data: { workspaceId: ws!.id, filter: "all", search } }),
    refetchOnWindowFocus: false,
    refetchInterval: 30_000,
  });
  const allTickets = (ticketsQ.data?.tickets ?? []) as any[];

  // Setores (pra mostrar a faixa verde com o nome do setor)
  const sectorsQ = useQuery({
    queryKey: ["inbox-sectors", ws?.id],
    enabled: !!ws,
    queryFn: async () => {
      const { data } = await supabase.from("sectors").select("id,name,color").eq("workspace_id", ws!.id);
      return data ?? [];
    },
  });
  const sectorById = useMemo(() => {
    const m = new Map<string, { name: string; color: string | null }>();
    (sectorsQ.data ?? []).forEach((s: any) => m.set(s.id, { name: s.name, color: s.color }));
    return m;
  }, [sectorsQ.data]);

  // Atendentes (pra mostrar nome vertical no card)
  // Carrega em 2 passos pra evitar dependência de nome de FK no PostgREST.
  const profilesQ = useQuery({
    queryKey: ["inbox-profiles", ws?.id],
    enabled: !!ws,
    queryFn: async () => {
      const { data: members } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", ws!.id);
      const ids = Array.from(new Set((members ?? []).map((m: any) => m.user_id).filter(Boolean)));
      if (ids.length === 0) return [] as any[];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return ids.map((uid) => ({ user_id: uid, profile: byId.get(uid) ?? null }));
    },
  });
  const nameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    (profilesQ.data ?? []).forEach((p: any) => {
      const n = p.profile?.full_name || p.profile?.email || "";
      if (p.user_id && n) m.set(p.user_id, n);
    });
    return m;
  }, [profilesQ.data]);

  // Categoriza pra contadores e listagem por aba
  const buckets = useMemo(() => {
    const critical = allTickets.filter(t => t.priority === "high" || t.priority === "urgent" || !t.assignee_id && t.status === "open");
    const inProg = allTickets.filter(t => t.status === "in_progress");
    const mine = allTickets.filter(t => t.assignee_id === user?.id);
    const open = allTickets.filter(t => t.status === "open");
    const bot = allTickets.filter(t => !t.assignee_id && (t.last_author === "bot" || t.last_author === "ai"));
    return {
      all: allTickets,
      critical,
      in_progress: inProg,
      mine,
      open,
      bot,
    };
  }, [allTickets, user?.id]);

  const tickets: any[] = (buckets as any)[tab] ?? [];

  // Agrupamento visual: "Em Atendimento" + "Aguardando atendimento"
  const grouped = useMemo(() => {
    const emAtendimento = tickets.filter((t: any) => t.status === "in_progress" || (t.assignee_id && t.status !== "open"));
    const aguardando = tickets.filter((t: any) => t.status === "open");
    const outros = tickets.filter((t: any) => !emAtendimento.includes(t) && !aguardando.includes(t));
    return { emAtendimento, aguardando, outros };
  }, [tickets]);

  const messagesQ = useQuery({
    queryKey: ["inbox-messages", activeId],
    enabled: !!activeId,
    queryFn: () => fetchMessages({ data: { ticketId: activeId! } }),
    refetchOnWindowFocus: false,
  });
  const messages = messagesQ.data?.messages ?? [];

  const active = useMemo(
    () => allTickets.find((t: any) => t.id === activeId) ?? null,
    [allTickets, activeId],
  );

  // realtime
  useEffect(() => {
    if (!ws) return;
    const ch = supabase
      .channel(`ws:${ws.id}:inbox`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets", filter: `workspace_id=eq.${ws.id}` },
        () => qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages" },
        (p) => {
          qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
          if ((p.new as any)?.ticket_id === activeId) {
            qc.invalidateQueries({ queryKey: ["inbox-messages", activeId] });
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [ws, qc, activeId]);

  useEffect(() => {
    if (activeId) markReadFn({ data: { ticketId: activeId } }).catch(() => {});
  }, [activeId, markReadFn]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const sendM = useMutation({
    mutationFn: async () => {
      const text = body.trim();
      const res = await sendFn({ data: { ticketId: activeId!, body: text, isInternalNote: isNote } });
      if (isInterventionMode && ws && activeId) {
        const pay = detectPaymentCommand(text);
        if (pay && !isNote) {
          await auditAdminAction({
            workspace_id: ws.id,
            ticket_id: activeId,
            contact_id: active?.contact?.id,
            kind: "payment",
            payment: { command_type: pay.command_type, amount: pay.amount },
          });
        } else {
          await auditAdminAction({
            workspace_id: ws.id,
            ticket_id: activeId,
            contact_id: active?.contact?.id,
            kind: "message",
            message_meta: { has_media: false, is_internal_note: isNote, body_length: text.length },
          });
        }
      }
      return res;
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["inbox-messages", activeId] });
      qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao enviar")),
  });

  function detectMediaType(mime: string): "image" | "video" | "audio" | "document" {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "document";
  }

  async function handleFileSelected(file: File) {
    if (!ws || !activeId) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("Arquivo muito grande (limite 16MB)"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${ws.id}/${activeId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("whatsapp-media").upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      // Gera URL assinada de 24h para a Meta conseguir baixar o anexo.
      // No banco persistimos a URL pública convencional; na exibição o hook
      // useSignedMediaUrl re-assina (bucket é privado).
      const { data: signed, error: signErr } = await supabase.storage
        .from("whatsapp-media").createSignedUrl(path, 60 * 60 * 24);
      if (signErr || !signed?.signedUrl) throw signErr ?? new Error("Falha ao gerar URL temporária");
      const mediaType = detectMediaType(file.type);
      await sendFn({ data: { ticketId: activeId, body: body.trim() || undefined, isInternalNote: false, media: { type: mediaType, link: signed.signedUrl, caption: body.trim() || undefined, filename: mediaType === "document" ? file.name : undefined } } });
      await auditAdminAction({
        workspace_id: ws.id, ticket_id: activeId, contact_id: active?.contact?.id,
        kind: "message",
        message_meta: { has_media: true, is_internal_note: false, body_length: body.trim().length },
      });
      setBody("");
      qc.invalidateQueries({ queryKey: ["inbox-messages", activeId] });
      qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
      toast.success("Mídia enviada");
    } catch (e: any) {
      toast.error(friendlyError(e, "Falha ao enviar anexo"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const closeM = useMutation({
    mutationFn: async () => {
      const r = await updateStatus({ data: { ticketId: activeId!, status: "closed" } });
      if (ws && activeId) {
        await auditAdminAction({
          workspace_id: ws.id, ticket_id: activeId, contact_id: active?.contact?.id, kind: "close",
        });
      }
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
      toast.success("Atendimento encerrado");
      setActiveId(null);
    },
  });

  const attendM = useMutation({
    mutationFn: async () => {
      if (!activeId) throw new Error("Sem ticket");
      const r = await claimFn({ data: { ticketId: activeId } });
      if (ws) {
        await auditAdminAction({
          workspace_id: ws.id, ticket_id: activeId, contact_id: active?.contact?.id, kind: "claim",
        });
      }
      return r;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
      const hora = res?.claimedAt ? formatTimeBR(res.claimedAt, { hour: "2-digit", minute: "2-digit" }) : "agora";
      const quem = res?.agentName ? ` por ${res.agentName}` : "";
      toast.success(`Atendimento assumido${quem} às ${hora}`);
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao assumir")),
  });

  const renameM = useMutation({
    mutationFn: async (newName: string) => {
      const r = await updateNameFn({ data: { contactId: active!.contact!.id, name: newName } });
      if (ws && activeId) {
        await auditAdminAction({
          workspace_id: ws.id, ticket_id: activeId, contact_id: active?.contact?.id, kind: "rename_contact",
        });
      }
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
      setEditingName(false);
      toast.success("Nome atualizado");
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao atualizar nome")),
  });

  function startEditName() {
    setNameDraft(active?.contact?.name ?? "");
    setEditingName(true);
  }
  function submitEditName() {
    const v = nameDraft.trim();
    if (!v || v === active?.contact?.name) { setEditingName(false); return; }
    renameM.mutate(v);
  }

  if (!ws) return <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando workspace" /></div>;

  const tabTitle = TABS.find(t => t.key === tab)?.title ?? "Todos";
  const isAttending = !!active && active.assignee_id === user?.id;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* SIDEBAR */}
      <aside className={cn("flex w-full md:w-[340px] shrink-0 flex-col border-r bg-card", activeId && "hidden md:flex")}>
        {/* Busca + filtro */}
        <div className="flex items-center gap-2 p-3">
          <Avatar className="h-10 w-10 shrink-0 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {initials(ws.name)}
            </AvatarFallback>
          </Avatar>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar atendimento..." className="h-10 rounded-full bg-muted pl-9 text-sm border-0" />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border shrink-0">
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>

        {/* Abas em ícones (padrão Underchat) */}
        <div className="flex items-center gap-1 px-3 pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            const count = ((buckets as any)[t.key] ?? []).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                title={t.title}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isActive ? (t.danger ? "bg-destructive text-destructive-foreground" : "bg-primary/15 text-primary") : "text-muted-foreground hover:bg-muted",
                  t.danger && !isActive && "text-destructive",
                )}
              >
                <Icon className="h-5 w-5" />
                {count > 0 && t.key !== "critical" && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground border-2 border-card">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          {/* botão + (novo atendimento) à direita */}
          {ws && canMutate && (
            <NewTicketButton
              workspaceId={ws.id}
              onCreated={(id) => {
                setActiveId(id);
                qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
              }}
            />
          )}
        </div>


        {/* Cabeçalho da aba */}
        <div className="flex items-center justify-between border-y bg-muted/30 px-4 py-2">
          <p className="text-sm font-semibold text-foreground/80">{tabTitle}</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <button className="rounded p-1 hover:bg-muted" title="Ordenar"><ArrowUpDown className="h-3.5 w-3.5" /></button>
            <button className="rounded p-1 hover:bg-muted" title="Selecionar"><CheckSquare className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {ticketsQ.isLoading ? (
            <div className="p-4 text-xs text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <p className="text-xs text-muted-foreground">
                {tab === "bot" ? "Nenhum chat na ura" : "Nenhum atendimento aqui"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-3">
              {grouped.emAtendimento.length > 0 && (
                <Section title="Em Atendimento">
                  {grouped.emAtendimento.map(t => (
                    <TicketCard key={t.id} t={t} isActive={t.id === activeId} onClick={() => setActiveId(t.id)} sectorName={t.sector_id ? sectorById.get(t.sector_id)?.name : undefined} assigneeName={t.assignee_id ? nameByUserId.get(t.assignee_id) : undefined} />
                  ))}
                </Section>
              )}
              {grouped.aguardando.length > 0 && (
                <Section title="Aguardando atendimento">
                  {grouped.aguardando.map(t => (
                    <TicketCard key={t.id} t={t} isActive={t.id === activeId} onClick={() => setActiveId(t.id)} sectorName={t.sector_id ? sectorById.get(t.sector_id)?.name : undefined} assigneeName={t.assignee_id ? nameByUserId.get(t.assignee_id) : undefined} showSectorBand />
                  ))}
                </Section>
              )}
              {grouped.outros.length > 0 && (
                <Section title="Outros">
                  {grouped.outros.map(t => (
                    <TicketCard key={t.id} t={t} isActive={t.id === activeId} onClick={() => setActiveId(t.id)} sectorName={t.sector_id ? sectorById.get(t.sector_id)?.name : undefined} assigneeName={t.assignee_id ? nameByUserId.get(t.assignee_id) : undefined} />
                  ))}
                </Section>
              )}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* CONVERSA */}
      <main className={cn("relative flex flex-1 flex-col bg-background min-w-0", !activeId && "hidden md:flex")}>
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="h-10 w-10 opacity-30" />
            <p className="text-sm">Selecione um atendimento para começar</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex items-center justify-between border-b bg-card px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setActiveId(null)} className="text-destructive hover:text-destructive/80" title="Fechar"><X className="h-5 w-5" /></button>
                <Avatar className="h-9 w-9 shrink-0">
                  {active.contact?.avatar_url ? <AvatarImage src={active.contact.avatar_url} alt={active.contact?.name ?? ""} /> : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials(active.contact?.name, active.contact?.phone)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-1">
                      <Input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitEditName(); } if (e.key === "Escape") setEditingName(false); }} maxLength={120} className="h-7 text-sm" />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={submitEditName}><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(false)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  ) : (
                    <button onClick={canMutate ? startEditName : undefined} className="group flex items-center gap-1.5 text-left" disabled={!canMutate}>
                      <p className="truncate text-sm font-bold uppercase tracking-wide">{active.contact?.name ?? active.contact?.phone ?? "Sem nome"}</p>
                      {canMutate && <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />}
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground">{active.contact?.phone ?? "—"}</p>
                </div>
                <a
                  href="/app/kanban"
                  className="ml-2 hidden items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted md:inline-flex"
                  title="Abrir funil de vendas"
                >
                  <Trello className="h-3.5 w-3.5" />
                  Funil de vendas
                </a>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="rounded-full p-2 hover:bg-muted" title="Histórico"><History className="h-4 w-4" /></button>
                <button className="rounded-full p-2 hover:bg-muted" title="Buscar"><Search className="h-4 w-4" /></button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full p-2 hover:bg-muted"><MoreVertical className="h-4 w-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setShowAgentsInfo(true)}>
                      <Users className="mr-2 h-4 w-4 text-primary" /> Informações dos atendentes
                    </DropdownMenuItem>
                    {canMutate && (
                      <DropdownMenuItem onClick={() => closeM.mutate()} disabled={closeM.isPending} className="text-destructive focus:text-destructive">
                        <X className="mr-2 h-4 w-4" /> Encerrar Atendimento
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {messagesQ.isLoading ? (
                <p className="text-center text-xs text-muted-foreground"><LoadingDots size="sm" label="Carregando mensagens" /></p>
              ) : messages.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">Sem mensagens ainda</p>
              ) : (
                <>
                  <DateDivider iso={messages[0]?.created_at} />
                  {messages.map((m: any) => {
                    const author = m.author as string;
                    const mine = author === "agent" || author === "ai" || author === "bot" || author === "system";
                    const note = m.is_internal_note;
                    const bubbleClass = note
                      ? "border border-amber-300/40 bg-amber-100/40 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
                      : author === "ai"
                        ? "bg-purple-500/15 text-foreground"
                        : author === "bot"
                          ? "bg-sky-500/15 text-foreground"
                          : mine
                            ? "bg-[var(--chat-sent)] text-[var(--chat-sent-foreground)]"
                            : "bg-[var(--chat-received)] text-[var(--chat-received-foreground)]";
                    const authorLabel = author === "ai" ? { icon: Sparkles, text: "IA" } : author === "bot" ? { icon: Bot, text: "Chatbot" } : null;
                    return (
                      <div key={m.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                        {!mine && (
                          <Avatar className="h-7 w-7 shrink-0">
                            {active.contact?.avatar_url ? <AvatarImage src={active.contact.avatar_url} /> : null}
                            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">{initials(active.contact?.name, active.contact?.phone)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-sm", bubbleClass)}>
                          {note && <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-70"><StickyNote className="h-3 w-3" /> Nota interna</p>}
                          {!note && authorLabel && (
                            <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase opacity-80">
                              <authorLabel.icon className="h-3 w-3" /> {authorLabel.text}
                            </p>
                          )}
                          <MessageMedia message={m} />
                          {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                          {!m.body && !m.media_url && <p className="opacity-60">Mídia carregando…</p>}
                          <p className="mt-1 text-right text-[10px] opacity-60">{formatTimeBR(m.created_at, { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        {mine && (
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">{initials(ws.name)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Banner: conversa controlada por agente automatizado */}
            {(() => {
              const last = messages[messages.length - 1];
              const botActive = !active.assignee_id && last && (last.author === "bot" || last.author === "ai");
              if (!botActive) return null;
              return (
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-2 rounded-full bg-zinc-900/85 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
                    <Bot className="h-4 w-4" />
                    Esta conversa está sendo controlada por um agente automatizado
                  </div>
                </div>
              );
            })()}

            {/* Rodapé: Assumir controle OU Composer (oculto em modo leitura) */}
            {readOnly ? (
              <footer className="flex items-center justify-center gap-2 border-t bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Modo Master · somente leitura. Envio, encerramento e claim desabilitados.
              </footer>
            ) : !isAttending ? (
              <footer className="flex items-center justify-between border-t bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">Pronto pra entrar no atendimento?</p>
                <Button
                  onClick={() => setConfirmClaim(true)}
                  disabled={attendM.isPending}
                  className="bg-zinc-900 px-6 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {attendM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assumir controle"}
                </Button>
              </footer>
            ) : (
              <footer className="border-t bg-card">
                <div className="flex items-center gap-2 px-3 pt-2">
                  <button onClick={() => setIsNote(false)} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", !isNote ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>Resposta</button>
                  <button onClick={() => setIsNote(true)} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", isNote ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground")}>Nota interna</button>
                </div>
                <div className="flex items-end gap-2 p-3">
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isNote || uploading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" title="Anexar">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                  </button>
                  <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" title="Emoji"><Smile className="h-5 w-5" /></button>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={isNote ? "Nota visível só pra equipe…" : "Digite uma mensagem..."} rows={1} className="resize-none min-h-10 border-0 bg-muted/50 focus-visible:ring-1" disabled={uploading} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (body.trim()) sendM.mutate(); } }} />
                  {body.trim() ? (
                    <Button size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={sendM.isPending || uploading} onClick={() => sendM.mutate()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  ) : (
                    <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" title="Áudio"><Mic className="h-5 w-5" /></button>
                  )}
                </div>
              </footer>
            )}
          </>
        )}
      </main>

      {/* Modal: informações dos atendentes */}
      <Dialog open={showAgentsInfo} onOpenChange={setShowAgentsInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Informações dos atendentes</DialogTitle></DialogHeader>
          {active ? (
            <div className="space-y-3">
              {active.assignee_id ? (
                <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{initials(nameByUserId.get(active.assignee_id) ?? "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {nameByUserId.get(active.assignee_id) ?? "Atendente"}
                      <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">Atendente primário</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Entrou em: {formatDateTimeBR(active.opened_at)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum atendente atribuído.</p>
              )}
              <p className="text-xs text-muted-foreground border-t pt-3">Nenhum atendente secundário neste atendimento.</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgentsInfo(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClaim} onOpenChange={setConfirmClaim}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assumir controle da conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Você passa a ser o responsável por este atendimento. A ação fica registrada com seu nome e a hora exata da transição.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmClaim(false); attendM.mutate(); }}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Sim, assumir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-semibold text-primary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DateDivider({ iso }: { iso?: string }) {
  if (!iso) return null;
  const d = new Date(iso);
  return (
    <div className="flex justify-center py-2">
      <span className="rounded-full bg-muted px-3 py-0.5 text-[10px] text-muted-foreground">{formatDateBR(d)}</span>
    </div>
  );
}

function MessageMedia({ message }: { message: any }) {
  const url = useSignedMediaUrl(message.media_url as string | null | undefined);
  if (!url) return null;

  const rawMime = String(message.media_mime ?? message.kind ?? "").toLowerCase();
  const isImage = rawMime === "image" || rawMime.startsWith("image/");
  const isVideo = rawMime === "video" || rawMime.startsWith("video/");
  const isAudio = rawMime === "audio" || rawMime.startsWith("audio/");
  const isDocument = rawMime === "document" || rawMime === "file" || (!isImage && !isVideo && !isAudio);

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-1 block overflow-hidden rounded-xl bg-background/40">
        <img src={url} alt={message.body || "Mídia recebida"} className="max-h-72 w-full object-contain" loading="lazy" />
      </a>
    );
  }

  if (isVideo) {
    return <video src={url} controls playsInline preload="metadata" className="mb-1 max-h-80 w-full rounded-xl bg-background/50" />;
  }

  if (isAudio) {
    return <audio src={url} controls preload="metadata" className="mb-1 w-full min-w-56" />;
  }

  if (isDocument) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-1 flex items-center gap-2 rounded-lg border bg-background/30 p-2 text-xs hover:bg-background/50">
        <FileText className="h-4 w-4 shrink-0" />
        <span className="truncate">Abrir documento</span>
      </a>
    );
  }

  return null;
}

function TicketCard({
  t, isActive, onClick, sectorName, assigneeName, showSectorBand,
}: {
  t: any; isActive: boolean; onClick: () => void;
  sectorName?: string | null; assigneeName?: string | null; showSectorBand?: boolean;
}) {
  const c = t.contact;
  const rightLabel = assigneeName?.split(" ")[0] ?? "";
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border text-left transition-colors",
        isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card hover:bg-muted/40",
      )}
    >
      <div className="flex items-stretch">
        <div className="flex flex-1 items-start gap-3 p-3 pr-2">
          <Avatar className="h-10 w-10 shrink-0">
            {c?.avatar_url ? <AvatarImage src={c.avatar_url} alt={c?.name ?? c?.phone ?? ""} /> : null}
            <AvatarFallback className={cn("text-[11px] font-bold", isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {initials(c?.name, c?.phone)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn("truncate text-sm font-bold uppercase tracking-wide", isActive ? "text-primary-foreground" : "text-foreground")}>
                {c?.name ?? "—"}
              </p>
              {!isActive && c?.name && (
                <span className="shrink-0 rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-sky-400 uppercase">
                  Contato
                </span>
              )}
            </div>
            <p className={cn("truncate text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {maskPhone(c?.phone)}
            </p>
          </div>
          <span className={cn("shrink-0 self-start text-[11px]", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {dayLabel(t.last_message_at ?? t.opened_at)}
          </span>
        </div>
        {rightLabel && (
          <div className="flex w-6 shrink-0 items-center justify-center bg-zinc-900 text-white">
            <span className="-rotate-90 whitespace-nowrap text-[10px] font-semibold tracking-wider">
              {rightLabel}
            </span>
          </div>
        )}
      </div>
      {showSectorBand && sectorName && (
        <div className="bg-green-700 px-3 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-white">
          {sectorName}
        </div>
      )}
    </button>
  );
}

function NewTicketButton({ workspaceId, onCreated }: { workspaceId: string; onCreated: (ticketId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const createFn = useServerFn(createTicketWithMessage);

  const mut = useMutation({
    mutationFn: () => createFn({ data: { workspaceId, contactPhone: phone.trim(), contactName: name.trim() || undefined, body: body.trim() } }),
    onSuccess: (r: any) => {
      toast.success("Atendimento criado");
      onCreated(r.ticketId);
      setOpen(false); setPhone(""); setName(""); setBody("");
    },
    onError: (e: any) => toast.error(friendlyError(e, "Não consegui criar o atendimento")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        title="Novo atendimento"
        onClick={() => setOpen(true)}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
      >
        <Plus className="h-5 w-5" />
      </button>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo atendimento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Telefone *</label>
            <Input placeholder="+55 11 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Nome (opcional)</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Mensagem inicial *</label>
            <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={!phone.trim() || !body.trim() || mut.isPending}>
            {mut.isPending ? "Criando…" : "Criar atendimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

