import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Check, Pencil, X, Bot, Users, UserMinus, ListFilter, MessageCircle, Clock,
  Plus, MoreVertical, ArrowRightLeft, History, Sparkles,
  UserPlus, MessageSquarePlus, UsersRound, Megaphone, Tags, Zap, Star,
  SendHorizontal, CheckCheck, Settings as SettingsIcon, ListChecks, Shield, Home,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";


import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeBR, formatDateTimeBR } from "@/lib/datetime";
import {
  listTickets, listMessages, sendMessage, updateTicketStatus,
  markRead, claimTicket, assignTicket, createTicketWithMessage,
} from "@/lib/tickets.functions";
import { updateContactName } from "@/lib/contacts.functions";
import { getContactTimeline, getResolvedSendChannel } from "@/lib/contact-timeline.functions";
import { getPendingPixForTicket } from "@/lib/chat-payments.functions";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { useAvatarAutoRefresh } from "./use-avatar-auto-refresh";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NexChatShell, NexNavigationRail, NexConversationList,
  NexChatHeader, NexMessageList, NexChatComposer,
  NexContactPanel, NexEmptyState, NexChatEmptyState, NexImageModal,
  NexConversationSkeleton, NexPaymentCard, NexPixQrModal,
  type NexConversation, type NexMessage, type NexChannelKind,
  type NexConnectionStatus, type NexPaymentInfo,
} from "@/components/nexchat";
import { PixModal } from "@/components/pix/PixModal";
import type { NexNavTab } from "@/components/nexchat/NexNavigationRail";
import { isMobileViewport, useIsMobileViewport } from "@/components/nexchat/use-is-mobile-viewport";
import { NexFeaturePanel } from "@/components/nexchat/NexFeaturePanel";
import { getFeatureStatus, type NexFeatureKey } from "@/components/nexchat/feature-matrix";
import { logAdminInboxAction } from "@/lib/admin-inbox-audit.functions";
import { useWindowStatus } from "@/hooks/use-window-status";

// Detecta comando financeiro do robô (não persiste valores sensíveis).
function detectPaymentCommand(body: string): { command_type: string; amount?: number } | null {
  const txt = body.trim().toLowerCase();
  // /pix 50, /cobrar 50, cobrar 50, pix 50
  const m = txt.match(/^\/?(pix|cobrar)\s+([\d.,]+)/);
  if (m) {
    const amt = parseFloat(m[2].replace(".", "").replace(",", "."));
    return { command_type: m[1], amount: isFinite(amt) ? amt : undefined };
  }
  if (/^\/?ver\s+pix\b/.test(txt)) return { command_type: "ver_pix" };
  if (/^\/?cancelar\s+pix\b/.test(txt)) return { command_type: "cancelar_pix" };
  return null;
}

export interface NexInboxLayoutProps {
  scope?: "workspace" | "admin";
  workspaceOverride?: { id: string; name: string } | null;
  readOnly?: boolean;
}

// ---------------- Adaptadores ----------------

function mapProviderToChannel(raw: string | null | undefined): NexChannelKind | undefined {
  const s = String(raw ?? "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("meta") || s.includes("cloud")) return "meta";
  if (s.includes("wuz")) return "wuzapi";
  if (s.includes("qr") || s.includes("baileys") || s.includes("multizap")) return "multizap_qr";
  if (s.includes("web")) return "webchat";
  if (s === "whatsapp") return "multizap_qr";
  return undefined;
}
function mapChannel(t: any): NexChannelKind | undefined {
  return mapProviderToChannel(
    t?.connection?.provider ?? t?.connection_provider ?? t?.connection?.kind ?? t?.channel ?? "",
  );
}
function mapConnStatus(t: any): NexConnectionStatus | undefined {
  const raw = String(t?.connection_status ?? t?.connection?.status ?? "").toLowerCase();
  if (!raw) return undefined;
  if (raw.includes("conn") && !raw.includes("dis")) return "connected";
  if (raw.includes("dis")) return "disconnected";
  if (raw.includes("err") || raw.includes("fail")) return "error";
  return "pending";
}
// HOTFIX: nunca usar JID (@g.us / @lid / @s.whatsapp.net) como nome visível.
function isJidLike(s?: string | null): boolean {
  if (!s) return false;
  return /@(g\.us|lid|s\.whatsapp\.net|c\.us|broadcast)$/i.test(s.trim());
}
function ticketToConv(t: any): NexConversation {
  const c = t.contact ?? {};
  const g = t.group ?? null;
  const lastAuthor = String(t.last_author ?? "").toLowerCase();
  const fromContact = ["contact", "them", "customer", "inbound", "client"].includes(lastAuthor);
  const unread = t.unread_count ?? 0;
  // channelType: prioridade pra coluna do próprio ticket; depois última msg.
  const channelType: "private" | "group" | undefined =
    t.channel_type === "group" || t.last_channel_type === "group" || (typeof t.chat_id === "string" && t.chat_id.endsWith("@g.us"))
      ? "group"
      : t.channel_type === "private" || t.last_channel_type === "private"
      ? "private"
      : undefined;

  // Resolução de nome — grupo nunca pode mostrar JID.
  let displayName: string;
  if (channelType === "group") {
    const groupName = (g?.name && !isJidLike(g.name)) ? g.name : null;
    const subject = (t.subject && !isJidLike(t.subject)) ? t.subject : null;
    const contactName = (c.name && !isJidLike(c.name) && !isJidLike(c.phone)) ? c.name : null;
    displayName = groupName ?? subject ?? contactName ?? "Grupo WhatsApp";
  } else {
    const cname = (c.name && !isJidLike(c.name)) ? c.name : null;
    const cphone = (c.phone && !isJidLike(c.phone)) ? c.phone : null;
    displayName = cname ?? cphone ?? "Sem nome";
  }

  return {
    id: t.id,
    contact: {
      id: c.id ?? t.id,
      name: displayName,
      phone: c.phone ?? null,
      avatarUrl: channelType === "group" ? (g?.picture_url ?? c.avatar_url ?? null) : (c.avatar_url ?? null),
      channel: mapChannel(t),
      tags: t.tags ?? c.tags ?? [],
    },
    lastMessage: t.last_message_preview ?? t.last_message ?? "",
    lastTime: t.last_message_at ? formatTimeBR(t.last_message_at) : "",
    unread,
    waitingResponse: unread > 0 || fromContact,
    channel: mapChannel(t),
    connectionStatus: mapConnStatus(t),
    channelType,
    groupName: channelType === "group" ? displayName : null,
    groupPictureUrl: g?.picture_url ?? null,
    lastSenderName: t.last_sender_name ?? null,
  };
}
function dbMessageToNex(m: any): NexMessage {
  const dir = String(m.author ?? m.direction ?? "").toLowerCase();
  const isOut = ["agent", "ai", "bot", "system", "outbound", "out", "me"].includes(dir);
  const isSystem = dir === "system" || m.kind === "system" || m.is_system === true;
  const isNote = m.is_internal_note === true;
  const author: NexMessage["author"] = isSystem
    ? "system"
    : isOut
    ? (dir === "ai" ? "ai" : dir === "bot" ? "bot" : "me")
    : "them";

  const mime = String(m.media_mime ?? m.kind ?? "").toLowerCase();
  let media: NexMessage["media"] | undefined;
  if (m.media_url) {
    if (mime === "image" || mime.startsWith("image/")) {
      media = { kind: "image", url: m.media_url, fileName: m.media_name ?? undefined };
    } else if (mime === "audio" || mime.startsWith("audio/")) {
      media = { kind: "audio", url: m.media_url, fileName: m.media_name ?? undefined };
    } else {
      media = { kind: "document", url: m.media_url, fileName: m.media_name ?? "documento", sizeLabel: m.media_size_label ?? undefined };
    }
  }
  const status: NexMessage["status"] | undefined =
    m.delivery === "read" || m.delivery === "delivered" || m.delivery === "sent" || m.delivery === "failed"
      ? m.delivery as any
      : undefined;

  // Canal real da bolha — usa o provider salvo na própria mensagem;
  // se faltar, deriva da conexão resolvida (sem quebrar quando a conexão sumiu).
  const channel =
    mapProviderToChannel(m.provider) ??
    mapProviderToChannel(m.connection?.provider) ??
    undefined;
  const channelType: "private" | "group" | undefined =
    m.channel_type === "group" ? "group" : m.channel_type === "private" ? "private" : undefined;

  return {
    id: m.id,
    author,
    body: isNote ? `📝 ${m.body ?? ""}` : (m.body ?? undefined),
    time: m.created_at ? formatTimeBR(m.created_at) : undefined,
    status,
    media,
    channel,
    channelType,
  };
}

// PIX → NexPaymentInfo
function pixToPayment(pend: any): NexPaymentInfo | null {
  if (!pend) return null;
  const statusRaw = String(pend.status ?? "").toUpperCase();
  const status: NexPaymentInfo["status"] =
    statusRaw === "PAGO" || statusRaw === "PAID" ? "paid"
    : statusRaw === "EXPIRADO" || statusRaw === "EXPIRED" ? "expired"
    : statusRaw === "CANCELADO" || statusRaw === "CANCELED" ? "canceled"
    : "pending";
  return {
    amount: Number(pend.amount ?? 0),
    status,
    gateway: pend.provider ?? "MisticPay",
    validUntil: pend.expires_at ? formatTimeBR(pend.expires_at) : undefined,
    pixCopyPaste: pend.copy_paste ?? undefined,
    qrImageUrl: pend.qrcode_url ?? (pend.qrcode_base64 ? `data:image/png;base64,${pend.qrcode_base64}` : undefined),
  };
}

type TabKey = "critical" | "all" | "in_progress" | "mine" | "open" | "bot";
const TABS: { key: TabKey; icon: any; title: string; danger?: boolean }[] = [
  { key: "critical", icon: UserMinus, title: "Sem atendente", danger: true },
  { key: "all", icon: ListFilter, title: "Todos" },
  { key: "in_progress", icon: MessageCircle, title: "Em Atendimento" },
  { key: "mine", icon: Users, title: "Meus" },
  { key: "open", icon: Clock, title: "Aguardando" },
  { key: "bot", icon: Bot, title: "ChatBot" },
];

// ---------------- Componente principal ----------------

export function NexInboxLayout({
  scope = "workspace",
  workspaceOverride = null,
  readOnly = false,
}: NexInboxLayoutProps = {}) {
  const { data: currentWs } = useCurrentWorkspace();
  const ws = (workspaceOverride ?? currentWs) as { id: string; name: string } | null;
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = scope === "admin";
  const isIntervention = isAdmin && !readOnly;
  const canMutate = !readOnly;
  const navigate = useNavigate();
  const { data: isSuperAdmin } = useIsSuperAdmin();
  const notReady = (label: string) => toast.info(`${label} — função em preparação`);



  const [tab, setTab] = useState<TabKey>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgOpen, setImgOpen] = useState<string | null>(null);
  const [isMobileChat, setIsMobileChat] = useState(false);
  // Quando o viewport sai do mobile, garante que a lista de conversas volte à esquerda no desktop.
  useIsMobileViewport(() => setIsMobileChat(false));

  // Botão "voltar" do celular / app instalado (PWA): quando uma conversa está
  // aberta no mobile, o gesto/botão de voltar deve fechar a conversa em vez de
  // sair do app inteiro. Empilhamos um estado fantasma no histórico ao abrir a
  // conversa e ouvimos `popstate` pra reagir.
  useEffect(() => {
    if (typeof window === "undefined" || !isMobileChat) return;
    window.history.pushState({ __nxChatOpen: true }, "");
    const onPop = () => {
      setIsMobileChat(false);
      setActiveId(null); // limpa a conversa selecionada pra realmente voltar pra lista no celular
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isMobileChat]);

  // Fecha a conversa no mobile e também desempilha o estado fantasma, evitando
  // que o usuário precise apertar "voltar" duas vezes depois.
  const closeMobileChat = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.history.state &&
      (window.history.state as { __nxChatOpen?: boolean }).__nxChatOpen
    ) {
      window.history.back(); // dispara popstate → limpa flag + conversa ativa
    } else {
      setIsMobileChat(false);
      setActiveId(null); // sem estado fantasma, limpa direto pra voltar pra lista
    }
  }, []);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [noteMode, setNoteMode] = useState(false);
  const [pixQrOpen, setPixQrOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [confirmClaim, setConfirmClaim] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [agentsInfoOpen, setAgentsInfoOpen] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [railTab, setRailTab] = useState<NexNavTab>("chat");

  const RAIL_TO_FEATURE: Partial<Record<NexNavTab, NexFeatureKey>> = {
    groups: "groups",
    calls: "calls",
    status: "stories",
  };

  const fetchTickets = useServerFn(listTickets);
  const fetchTimeline = useServerFn(getContactTimeline);
  const fetchTicketMessages = useServerFn(listMessages);
  const resolveChannelFn = useServerFn(getResolvedSendChannel);
  const sendFn = useServerFn(sendMessage);
  const updateStatus = useServerFn(updateTicketStatus);
  const markReadFn = useServerFn(markRead);
  const claimFn = useServerFn(claimTicket);
  const assignFn = useServerFn(assignTicket);
  const createTicketFn = useServerFn(createTicketWithMessage);
  const renameFn = useServerFn(updateContactName);
  const pendingPixFn = useServerFn(getPendingPixForTicket);
  const auditFn = useServerFn(logAdminInboxAction);

  // Helper: dispara audit_log somente em modo intervenção. Nunca quebra a UI.
  async function audit(
    kind: "message" | "payment" | "claim" | "transfer" | "close" | "rename_contact",
    extra: Record<string, any> = {},
  ) {
    if (!isIntervention || !ws) return;
    try {
      await auditFn({
        data: {
          workspace_id: ws.id,
          ticket_id: activeId ?? undefined,
          contact_id: activeTicket?.contact?.id ?? undefined,
          channel: activeTicket?.channel ?? undefined,
          kind,
          ...extra,
        } as any,
      });
    } catch (e) {
      // Não bloquear ação por falha de auditoria; logar apenas.
      console.warn("[admin-inbox audit] falhou:", e);
    }
  }

  // Tickets
  const ticketsQ = useQuery({
    queryKey: ["nex-inbox-tickets", ws?.id],
    enabled: !!ws,
    queryFn: () => fetchTickets({ data: { workspaceId: ws!.id, filter: "all", search: "" } }),
    // Fallback rápido: se o Realtime falhar, a lista ainda atualiza em até 10s.
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
  const allTickets = (ticketsQ.data?.tickets ?? []) as any[];

  // Setores e membros (transferência + info)
  const sectorsQ = useQuery({
    queryKey: ["nex-inbox-sectors", ws?.id],
    enabled: !!ws,
    queryFn: async () => {
      const { data } = await supabase.from("sectors").select("id,name").eq("workspace_id", ws!.id);
      return (data ?? []) as { id: string; name: string }[];
    },
  });
  const membersQ = useQuery({
    queryKey: ["nex-inbox-members", ws?.id],
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
    (membersQ.data ?? []).forEach((p: any) => {
      const n = p.profile?.full_name || p.profile?.email || "";
      if (p.user_id && n) m.set(p.user_id, n);
    });
    return m;
  }, [membersQ.data]);

  // Buckets de abas
  const buckets = useMemo(() => {
    const critical = allTickets.filter((t) => t.priority === "high" || t.priority === "urgent" || (!t.assignee_id && t.status === "open"));
    const in_progress = allTickets.filter((t) => t.status === "in_progress");
    const mine = allTickets.filter((t) => t.assignee_id === user?.id);
    const open = allTickets.filter((t) => t.status === "open");
    const bot = allTickets.filter((t) => !t.assignee_id && (t.last_author === "bot" || t.last_author === "ai"));
    return { all: allTickets, critical, in_progress, mine, open, bot };
  }, [allTickets, user?.id]);

  const ticketsForTab = (buckets as any)[tab] as any[];
  // Fase 2 — 1 card por contato.
  // Dedup por contact_id: mantém o ticket mais recente como representante.
  // Histórico continua único (carregado por contact_id via getContactTimeline).
  // Tickets sem contact_id (legado) caem no fallback por ticket.id.
  const tickets = useMemo(() => {
    const seen = new Map<string, any>();
    const out: any[] = [];
    for (const t of ticketsForTab) {
      const key = t?.contact?.id ?? `__t:${t.id}`;
      if (seen.has(key)) continue;
      seen.set(key, t);
      out.push(t);
    }
    return out;
  }, [ticketsForTab]);
  const conversations = useMemo(() => tickets.map(ticketToConv), [tickets]);

  const activeTicket = useMemo(
    () => allTickets.find((t) => t.id === activeId) ?? null,
    [allTickets, activeId],
  );
  const activeConv = activeTicket ? ticketToConv(activeTicket) : null;
  const isAttending = !!activeTicket && activeTicket.assignee_id === user?.id;
  const windowStatus = useWindowStatus(activeId);
  const activeContactId = activeTicket?.contact?.id ?? null;
  const activeIsGroup = (activeConv?.channelType === "group");
  const activeGroupId: string | null = activeTicket?.group?.id ?? null;

  // Camada 2: ao abrir conversa, dispara refresh de foto em background
  // (throttle de 10 min por id, sem travar UI, sem mostrar erro).
  useAvatarAutoRefresh(
    activeIsGroup
      ? { kind: "group", id: activeGroupId, hasAvatar: !!activeTicket?.group?.picture_url }
      : { kind: "contact", id: activeContactId, hasAvatar: !!activeTicket?.contact?.avatar_url },
  );

  // Mensagens:
  // - Privado → timeline unificada por contato (junta META + QR antigo + QR novo).
  // - Grupo  → mensagens do próprio ticket de grupo (não mistura com privado).
  const messagesQ = useQuery<{ messages: any[] }>({
    queryKey: activeIsGroup
      ? ["nex-inbox-group-messages", activeId]
      : ["nex-inbox-timeline", activeContactId],
    enabled: activeIsGroup ? !!activeId : !!activeContactId,
    queryFn: async () =>
      activeIsGroup
        ? (await fetchTicketMessages({ data: { ticketId: activeId! } })) as { messages: any[] }
        : (await fetchTimeline({ data: { contactId: activeContactId! } })) as { messages: any[] },
    // Fallback: se o Realtime falhar (RLS, socket caído), a conversa aberta
    // ainda atualiza em até 4s. Só roda enquanto há conversa aberta.
    refetchInterval: (activeIsGroup ? !!activeId : !!activeContactId) ? 4_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
  const messages: NexMessage[] = useMemo(
    () => (messagesQ.data?.messages ?? []).map(dbMessageToNex),
    [messagesQ.data],
  );

  // Indicador do canal de envio (Fase 1 -> Fase 2).
  // Mostra "Respondendo via QR / META / Sem canal".
  const sendChannelQ = useQuery({
    queryKey: ["nex-inbox-send-channel", activeId],
    enabled: !!activeId,
    queryFn: () => resolveChannelFn({ data: { ticketId: activeId! } }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  // PIX pendente do ticket
  const pixQ = useQuery({
    queryKey: ["nex-inbox-pix", activeId],
    enabled: !!activeId,
    queryFn: () => pendingPixFn({ data: { ticketId: activeId! } }),
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
  });
  const payment = useMemo(() => pixToPayment(pixQ.data?.pending), [pixQ.data]);


  // Realtime — usa refs para evitar closure stale (lista de tickets, ticket
  // ativo e contato ativo mudam o tempo todo, mas o canal não pode ser
  // recriado a cada mudança senão perde eventos).
  const activeIdRef = useRef<string | null>(activeId);
  const activeContactIdRef = useRef<string | null>(activeContactId);
  const allTicketsRef = useRef(allTickets);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { activeContactIdRef.current = activeContactId; }, [activeContactId]);
  useEffect(() => { allTicketsRef.current = allTickets; }, [allTickets]);

  useEffect(() => {
    if (!ws) return;
    // Decide se um evento de ticket_messages pertence à conversa aberta.
    const belongsToOpen = (row: any): boolean => {
      const ticketId = row?.ticket_id;
      if (!ticketId) return false;
      if (ticketId === activeIdRef.current) return true;
      const contactId = activeContactIdRef.current;
      if (!contactId) return false;
      return allTicketsRef.current.some(
        (t) => t.id === ticketId && t.contact?.id === contactId,
      );
    };
    const refreshOpen = () => {
      const aId = activeIdRef.current;
      const cId = activeContactIdRef.current;
      if (cId) qc.invalidateQueries({ queryKey: ["nex-inbox-timeline", cId] });
      if (aId) {
        qc.invalidateQueries({ queryKey: ["nex-inbox-group-messages", aId] });
        qc.invalidateQueries({ queryKey: ["nex-inbox-pix", aId] });
      }
    };

    const ch = supabase
      .channel(`nex-ws:${ws.id}:inbox`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `workspace_id=eq.${ws.id}` },
        (p: any) => {
          qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
          // Força refetch da timeline do contato aberto sempre que QUALQUER
          // ticket do workspace mexer — cobre 3 casos:
          //  (a) ticket aberto recebeu mensagem nova (UPDATE de last_message_at);
          //  (b) webhook criou OUTRO ticket pro MESMO contato aberto (INSERT);
          //  (c) RLS de ticket_messages bloqueou o INSERT no realtime.
          // A query da timeline filtra por contact_id no server, então é seguro
          // invalidar — só refetch se há contato aberto.
          if (activeContactIdRef.current) refreshOpen();
          else if (activeIdRef.current) refreshOpen();
        })
      // Mensagem nova entra na conversa
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages" },
        (p) => {
          qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
          // Se bate com a conversa aberta, OU se há um contato aberto (ticket
          // novo ainda não está em allTickets — webhook acabou de criar),
          // força refetch da timeline do contato aberto. A query filtra por
          // contact_id no servidor, então é seguro.
          if (belongsToOpen(p.new) || activeContactIdRef.current) refreshOpen();
        })
      // Atualização de delivery (enviado → entregue → lido) ou edição
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "ticket_messages" },
        (p) => {
          if (belongsToOpen(p.new) || belongsToOpen(p.old) || activeContactIdRef.current) refreshOpen();
        })
      .on("postgres_changes",
        { event: "*", schema: "public", table: "pix_transactions", filter: `workspace_id=eq.${ws.id}` },
        () => qc.invalidateQueries({ queryKey: ["nex-inbox-pix"] }))
      .subscribe((status) => {
        console.log(`[nex-realtime] canal ws=${ws.id} → ${status}`);
      });

    // Ao voltar pra aba (visibilitychange), força re-sincronização — cobre o
    // caso do socket ter ficado mudo em background por muito tempo.
    const onVisible = () => {
      if (typeof document === "undefined" || document.visibilityState !== "visible") return;
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      refreshOpen();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      supabase.removeChannel(ch);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [ws, qc]);

  useEffect(() => {
    if (activeId) markReadFn({ data: { ticketId: activeId } }).catch(() => {});
  }, [activeId, markReadFn]);

  // Mutations
  const sendM = useMutation({
    mutationFn: async (text: string) =>
      sendFn({ data: { ticketId: activeId!, body: text, isInternalNote: noteMode } }),
    onSuccess: (_res, text) => {
      qc.invalidateQueries({ queryKey: ["nex-inbox-timeline", activeContactId] }); qc.invalidateQueries({ queryKey: ["nex-inbox-group-messages", activeId] });
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      qc.invalidateQueries({ queryKey: ["nex-inbox-pix", activeId] });
      // Audit em intervenção: comando financeiro vs mensagem comum.
      const cmd = detectPaymentCommand(text);
      if (cmd) {
        audit("payment", { payment: { command_type: cmd.command_type, amount: cmd.amount } });
      } else {
        audit("message", { message_meta: { has_media: false, is_internal_note: noteMode, body_length: text.length } });
      }
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao enviar")),
  });

  async function handleFile(file: File) {
    if (!ws || !activeId) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("Arquivo muito grande (limite 16MB)"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${ws.id}/${activeId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("whatsapp-media").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("whatsapp-media").createSignedUrl(path, 60 * 60 * 24);
      if (signErr || !signed?.signedUrl) throw signErr ?? new Error("Falha ao gerar URL temporária");
      const t = file.type;
      const mediaType: "image" | "video" | "audio" | "document" =
        t.startsWith("image/") ? "image"
        : t.startsWith("video/") ? "video"
        : t.startsWith("audio/") ? "audio"
        : "document";
      await sendFn({
        data: {
          ticketId: activeId,
          isInternalNote: false,
          media: { type: mediaType, link: signed.signedUrl, filename: mediaType === "document" ? file.name : undefined },
        },
      });
      qc.invalidateQueries({ queryKey: ["nex-inbox-timeline", activeContactId] }); qc.invalidateQueries({ queryKey: ["nex-inbox-group-messages", activeId] });
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      toast.success("Mídia enviada");
      audit("message", { message_meta: { has_media: true, is_internal_note: false, body_length: 0 } });
    } catch (e: any) {
      toast.error(friendlyError(e, "Falha ao enviar anexo"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const claimM = useMutation({
    mutationFn: async () => claimFn({ data: { ticketId: activeId! } }),
    onSuccess: () => {
      toast.success("Atendimento assumido");
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      audit("claim");
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao assumir")),
  });

  const closeM = useMutation({
    mutationFn: async () => updateStatus({ data: { ticketId: activeId!, status: "closed" } }),
    onSuccess: () => {
      toast.success("Atendimento encerrado");
      audit("close");
      setActiveId(null);
      setIsMobileChat(false);
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao encerrar")),
  });

  const renameM = useMutation({
    mutationFn: async (newName: string) =>
      renameFn({ data: { contactId: activeTicket!.contact!.id, name: newName } }),
    onSuccess: () => {
      toast.success("Nome atualizado");
      setEditingName(false);
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      audit("rename_contact");
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao renomear")),
  });

  const assignM = useMutation({
    mutationFn: async (args: { assigneeId: string | null; sectorId: string | null }) =>
      assignFn({ data: { ticketId: activeId!, assigneeId: args.assigneeId, sectorId: args.sectorId } }),
    onSuccess: (_r, args) => {
      toast.success("Atendimento transferido");
      setTransferOpen(false);
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      audit("transfer", { transfer_to_sector_id: args.sectorId ?? undefined });
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao transferir")),
  });

  const cancelPixM = useMutation({
    // Reusa o parser oficial: envia "/cancelar pix" como nota interna do agente
    // (o handler do chat detecta o comando e cancela; lógica server permanece intacta).
    mutationFn: async () => sendFn({ data: { ticketId: activeId!, body: "/cancelar pix", isInternalNote: false } }),
    onSuccess: () => {
      toast.success("Solicitação de cancelamento enviada");
      qc.invalidateQueries({ queryKey: ["nex-inbox-pix", activeId] });
      qc.invalidateQueries({ queryKey: ["nex-inbox-timeline", activeContactId] }); qc.invalidateQueries({ queryKey: ["nex-inbox-group-messages", activeId] });
      audit("payment", { payment: { command_type: "cancelar_pix" } });
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao cancelar PIX")),
  });

  if (!ws) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Carregando workspace…
      </div>
    );
  }

  // Ações de cabeçalho
  const headerActions = activeTicket ? (
    <>
      {canMutate && !isAttending && (
        <button
          type="button"
          className="nx-btn"
          data-variant="primary"
          onClick={() => setConfirmClaim(true)}
          disabled={claimM.isPending}
        >
          Assumir
        </button>
      )}
      {canMutate && (
        <button
          type="button"
          className="nx-btn"
          onClick={() => { setNameDraft(activeConv?.contact.name ?? ""); setEditingName(true); }}
          title="Renomear contato"
        >
          <Pencil size={14} />
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="nx-btn" title="Mais ações">
            <MoreVertical size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {canMutate && (
            <DropdownMenuItem onClick={() => setTransferOpen(true)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferir setor/atendente
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setAgentsInfoOpen(true)}>
            <Users className="mr-2 h-4 w-4" /> Informações dos atendentes
          </DropdownMenuItem>
          {canMutate && (
            <DropdownMenuItem onClick={() => { setNameDraft(activeConv?.contact.name ?? ""); setEditingName(true); }}>
              <Pencil className="mr-2 h-4 w-4" /> Renomear contato
            </DropdownMenuItem>
          )}
          {canMutate && <DropdownMenuSeparator />}
          {canMutate && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirmClose(true)}
              disabled={closeM.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Encerrar atendimento
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ) : undefined;

  // Banner bot quando última msg é do robô e sem atendente
  const rawMsgs = (messagesQ.data?.messages ?? []) as any[];
  const lastMsg = rawMsgs.length > 0 ? rawMsgs[rawMsgs.length - 1] : null;
  const botActive = !!activeTicket && !activeTicket.assignee_id && !!lastMsg &&
    (lastMsg.author === "bot" || lastMsg.author === "ai");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-hidden">
        <NexChatShell chatOpen={isMobileChat || !!activeConv}>
          {/* Navigation rail: vertical no desktop, bottom nav fixo no mobile (CSS cuida) */}
          <NexNavigationRail
            active={railTab}
            onChange={(t) => {
              if (t === "settings") {
                notReady("Configurações");
                return;
              }
              setRailTab(t);
            }}
            avatarFallback={(ws.name?.[0] ?? "M").toUpperCase()}
          />



          {railTab !== "chat" && RAIL_TO_FEATURE[railTab] ? (
            (() => {
              const feat = RAIL_TO_FEATURE[railTab]!;
              const ch = activeTicket ? mapChannel(activeTicket) : (allTickets[0] ? mapChannel(allTickets[0]) : undefined);
              const status = getFeatureStatus(ch, feat);
              return (
                <main className="nx-chat" style={{ flex: 1 }}>
                  <NexFeaturePanel feature={feat} status={status} channel={ch} />
                </main>
              );
            })()
          ) : (<>


          {/* Lista — escondida no mobile quando há chat aberto */}
          <div
            style={{ display: (isMobileChat || activeConv) ? "none" : "flex", width: "100%", flexDirection: "column", flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}
            className="nx-list-pane lg:!flex lg:max-w-[420px]"
          >
            {(() => {
              const tabsTopSlot = (
                <div style={{ display: "flex", gap: 4, padding: "8px 10px 4px", flexWrap: "wrap" }}>
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const isActive = tab === t.key;
                    const count = ((buckets as any)[t.key] ?? []).length;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        title={t.title}
                        className="nx-btn"
                        data-variant={isActive ? (t.danger ? "danger" : "primary") : undefined}
                        style={{ position: "relative", padding: "6px 8px" }}
                      >
                        <Icon size={14} />
                        {count > 0 && (
                          <span style={{
                            marginLeft: 4, fontSize: 10, fontWeight: 700,
                            background: "var(--nx-surface-hover)", padding: "0 5px",
                            borderRadius: 8, minWidth: 16, textAlign: "center",
                          }}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );

              const headerMenu = (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="nx-btn"
                      aria-label="Mais opções"
                      title="Mais opções"
                      style={{ padding: "6px 8px" }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuItem onClick={() => navigate({ to: "/app/contatos" })}>
                      <UserPlus className="mr-2 h-4 w-4" /> Novo contato
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => canMutate ? setNewTicketOpen(true) : notReady("Nova conversa")}>
                      <MessageSquarePlus className="mr-2 h-4 w-4" /> Nova conversa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => notReady("Novo grupo")}>
                      <UsersRound className="mr-2 h-4 w-4" /> Novo grupo
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: "/app/campanhas" })}>
                      <Megaphone className="mr-2 h-4 w-4" /> Campanhas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/app/utilidades/etiquetas" })}>
                      <Tags className="mr-2 h-4 w-4" /> Funis e etiquetas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/app/utilidades/mensagens-rapidas" })}>
                      <Zap className="mr-2 h-4 w-4" /> Respostas rápidas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => notReady("Mensagens favoritas")}>
                      <Star className="mr-2 h-4 w-4" /> Mensagens favoritas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => notReady("Atendimento em massa")}>
                      <Users className="mr-2 h-4 w-4" /> Atendimento em massa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => notReady("Selecionar conversas")}>
                      <ListChecks className="mr-2 h-4 w-4" /> Selecionar conversas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => notReady("Listas de transmissão")}>
                      <SendHorizontal className="mr-2 h-4 w-4" /> Listas de transmissão
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => notReady("Marcar todas como lidas")}>
                      <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como lidas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: "/app/configuracoes" })}>
                      <SettingsIcon className="mr-2 h-4 w-4" /> Configurações do inbox
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/app/utilidades/agente-ia" })}>
                      <Bot className="mr-2 h-4 w-4" /> Automação e IA
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isSuperAdmin ? (
                      <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                        <Shield className="mr-2 h-4 w-4" /> Painel Master
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate({ to: "/app" })}>
                        <Home className="mr-2 h-4 w-4" /> Voltar ao menu principal
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

              );

              return ticketsQ.isLoading ? (
                <aside className="nx-list" style={{ width: "100%" }}>
                  <NexConversationSkeleton rows={8} />
                </aside>
              ) : (
                <NexConversationList
                  title={TABS.find((t) => t.key === tab)?.title ?? "Todos"}
                  conversations={conversations}
                  selectedId={activeId}
                  onSelect={(id) => { setActiveId(id); if (isMobileViewport()) setIsMobileChat(true); setNoteMode(false); }}
                  emptyLabel={tab === "bot" ? "Nenhum chat com o bot" : "Nenhum atendimento aqui"}
                  topSlot={tabsTopSlot}
                  headerMenu={headerMenu}
                />
              );
            })()}



          </div>

          {/* Chat — no desktop sempre visível; no mobile, só quando há conversa aberta */}
          <main
            className={`nx-chat ${isMobileChat || activeConv ? "flex" : "hidden lg:flex"}`}
            style={{ flex: 1, flexDirection: "column", minWidth: 0, position: "relative" }}
          >


            {activeConv && activeTicket ? (
              <>
                <NexChatHeader
                  contact={activeConv.contact}
                  channel={activeConv.channel}
                  status={activeConv.connectionStatus}
                  onBack={closeMobileChat}
                  rightActions={headerActions}
                  onToggleInfo={() => setShowInfo((v) => !v)}
                />
                {windowStatus.label && (
                  <div
                    style={{
                      padding: "6px 16px",
                      borderBottom: "1px solid var(--nx-border)",
                      background: "var(--nx-surface)",
                      color: windowStatus.color,
                      fontSize: 12,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {windowStatus.label}
                  </div>
                )}
                <NexMessageList
                  messages={messages}
                  onOpenImage={(url) => setImgOpen(url)}
                  onOpenQr={() => setPixQrOpen(true)}
                  onCopyPix={(code) => { navigator.clipboard?.writeText(code); toast.success("PIX copiado"); }}
                />

                {/* Banner bot ativo */}
                {botActive && (
                  <div style={{
                    position: "absolute", left: "50%", top: "50%",
                    transform: "translate(-50%,-50%)", pointerEvents: "none",
                    background: "rgba(0,0,0,0.75)", color: "#fff", padding: "8px 14px",
                    borderRadius: 999, fontSize: 12, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Bot size={14} />
                    Esta conversa está sendo controlada por um agente automatizado
                  </div>
                )}

                {/* Card PIX pendente acima do composer */}
                {payment && payment.status === "pending" && (
                  <div style={{ padding: "8px 12px 0" }}>
                    <NexPaymentCard
                      payment={payment}
                      onCopyPix={(code) => { navigator.clipboard?.writeText(code); toast.success("PIX copiado"); }}
                      onOpenQr={() => setPixQrOpen(true)}
                      onCancel={canMutate && (isAttending || isIntervention) ? () => cancelPixM.mutate() : undefined}
                    />
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />

                {/* Indicador de canal de envio (Fase 2) */}
                {canMutate && (isAttending || isIntervention) && (() => {
                  const r = sendChannelQ.data as any;
                  if (!r) return null;
                  if (r.ok) {
                    const prov = String(r.provider ?? "").toLowerCase();
                    const isMeta = prov.includes("meta") || prov.includes("cloud");
                    return (
                      <div className="nx-send-channel-hint" data-tone={r.reason === "fallback_qr_outside_meta_window" ? "warn" : undefined}>
                        Respondendo via <strong style={{ marginLeft: 4 }}>{isMeta ? "META" : "QR"}</strong>
                        {r.connectionName ? ` · ${r.connectionName}` : ""}
                        {r.reason === "fallback_qr_outside_meta_window" ? " · fora da janela de 24h, usando QR" : ""}
                      </div>
                    );
                  }
                  return (
                    <div className="nx-send-channel-hint" data-tone="danger">
                      Sem canal disponível para responder este contato
                    </div>
                  );
                })()}


                {!canMutate ? (
                  <footer style={{
                    display: "flex", justifyContent: "center", alignItems: "center",
                    padding: "12px 16px", borderTop: "1px solid var(--nx-border)",
                    background: "var(--nx-surface)", gap: 8, color: "var(--nx-text-muted)", fontSize: 13,
                  }}>
                    Modo somente leitura · ações operacionais desativadas
                  </footer>
                ) : isIntervention ? (
                  <NexChatComposer
                    disabled={sendM.isPending || uploading}
                    onSend={(t) => sendM.mutate(t)}
                    onAttach={() => fileRef.current?.click()}
                    onPasteFile={(f) => handleFile(f)}
                    noteMode={noteMode}
                    onToggleNote={setNoteMode}
                    onSendPix={() => setPixOpen(true)}
                    channelKind={activeConv?.channel === "meta" ? "meta" : "qr"}
                    onQuickReply={() => toast.info("Respostas rápidas em breve")}
                    onTemplate={() => toast.info("Templates Meta em breve")}
                    outOfWindow={!windowStatus.canSend}
                  />
                ) : !isAttending ? (
                  <footer style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", borderTop: "1px solid var(--nx-border)",
                    background: "var(--nx-surface)", gap: 12, flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: 13, color: "var(--nx-text-muted)" }}>
                      Pronto pra entrar no atendimento?
                    </span>
                    <button
                      type="button"
                      className="nx-btn"
                      data-variant="primary"
                      onClick={() => setConfirmClaim(true)}
                      disabled={claimM.isPending}
                    >
                      Assumir controle
                    </button>
                  </footer>
                ) : (
                  <NexChatComposer
                    disabled={sendM.isPending || uploading}
                    onSend={(t) => sendM.mutate(t)}
                    onAttach={() => fileRef.current?.click()}
                    onPasteFile={(f) => handleFile(f)}
                    noteMode={noteMode}
                    onToggleNote={setNoteMode}
                    onSendPix={() => setPixOpen(true)}
                    channelKind={activeConv?.channel === "meta" ? "meta" : "qr"}
                    onQuickReply={() => toast.info("Respostas rápidas em breve")}
                    onTemplate={() => toast.info("Templates Meta em breve")}
                    outOfWindow={!windowStatus.canSend}
                  />
                )}
              </>
            ) : (
              <NexChatEmptyState />
            )}
          </main>

          <AnimatePresence initial={false}>
            {activeConv && showInfo && (
              <motion.div
                key="contact-panel"
                className="hidden lg:flex"
                initial={{ opacity: 0, x: 24, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: 24, width: 0 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <NexContactPanel
                  contact={activeConv.contact}
                  sector={activeTicket?.sector?.name ?? "—"}
                  assignee={activeTicket?.assignee_id ? (nameByUserId.get(activeTicket.assignee_id) ?? "Atendente") : (isAttending ? "Você" : "Sem atribuição")}
                  tags={activeConv.contact.tags ?? []}
                  notes={activeTicket?.note ?? ""}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </>)}
        </NexChatShell>
      </div>


      {/* QR Modal PIX */}
      <NexPixQrModal
        open={pixQrOpen}
        onOpenChange={setPixQrOpen}
        qrImageUrl={payment?.qrImageUrl}
        pixCopyPaste={payment?.pixCopyPaste}
        amount={payment?.amount}
        onCopy={(code) => { navigator.clipboard?.writeText(code); toast.success("PIX copiado"); }}
      />

      {/* Modal de envio de PIX (Fase 1) */}
      {ws && activeTicket && (
        <PixModal
          open={pixOpen}
          onClose={() => setPixOpen(false)}
          workspaceId={ws.id}
          ticketId={activeTicket.id}
        />
      )}

      {/* Imagem ampliada */}
      <NexImageModal
        open={!!imgOpen}
        onOpenChange={(o) => !o && setImgOpen(null)}
        url={imgOpen ?? undefined}
      />

      {/* Renomear contato */}
      <Dialog open={editingName} onOpenChange={setEditingName}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Renomear contato</DialogTitle></DialogHeader>
          <Input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={120} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingName(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                const v = nameDraft.trim();
                if (v && v !== activeConv?.contact.name) renameM.mutate(v);
                else setEditingName(false);
              }}
              disabled={renameM.isPending}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>




      <AlertDialog open={confirmClaim} onOpenChange={setConfirmClaim}>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assumir controle da conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Você passa a ser o responsável por este atendimento. A ação fica registrada com seu nome e a hora exata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmClaim(false); claimM.mutate(); }}>
              Sim, assumir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar encerrar */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              O ticket será marcado como encerrado. O cliente pode iniciar uma nova conversa a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmClose(false); closeM.mutate(); }}>
              Sim, encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transferir */}
      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        sectors={sectorsQ.data ?? []}
        members={membersQ.data ?? []}
        currentSectorId={activeTicket?.sector_id ?? null}
        currentAssigneeId={activeTicket?.assignee_id ?? null}
        onSubmit={(payload) => assignM.mutate(payload)}
        loading={assignM.isPending}
      />

      {/* Info atendentes */}
      <Dialog open={agentsInfoOpen} onOpenChange={setAgentsInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Informações dos atendentes</DialogTitle></DialogHeader>
          {activeTicket ? (
            <div className="space-y-3 text-sm">
              {activeTicket.assignee_id ? (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="font-semibold">
                    {nameByUserId.get(activeTicket.assignee_id) ?? "Atendente"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Setor: {activeTicket.sector?.name ?? "—"}
                  </div>
                  {activeTicket.opened_at && (
                    <div className="text-xs text-muted-foreground">
                      Aberto em: {formatDateTimeBR(activeTicket.opened_at)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum atendente atribuído.</p>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentsInfoOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Novo atendimento */}
      <NewTicketDialog
        open={newTicketOpen}
        onOpenChange={setNewTicketOpen}
        onCreate={async (payload) => {
          try {
            const r: any = await createTicketFn({ data: { workspaceId: ws.id, ...payload } });
            toast.success("Atendimento criado");
            setNewTicketOpen(false);
            qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
            if (r?.ticketId) { setActiveId(r.ticketId); if (isMobileViewport()) setIsMobileChat(true); }
          } catch (e: any) {
            toast.error(friendlyError(e, "Não consegui criar o atendimento"));
          }
        }}
      />
    </div>
  );
}

// ---------------- Sub-componentes ----------------

function TransferDialog({
  open, onOpenChange, sectors, members, currentSectorId, currentAssigneeId, onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sectors: { id: string; name: string }[];
  members: { user_id: string; profile?: { full_name?: string | null } }[];
  currentSectorId: string | null;
  currentAssigneeId: string | null;
  onSubmit: (p: { assigneeId: string | null; sectorId: string | null }) => void;
  loading?: boolean;
}) {
  const [sectorId, setSectorId] = useState<string | "">("");
  const [assigneeId, setAssigneeId] = useState<string | "">("");
  useEffect(() => {
    if (open) {
      setSectorId(currentSectorId ?? "");
      setAssigneeId(currentAssigneeId ?? "");
    }
  }, [open, currentSectorId, currentAssigneeId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Transferir atendimento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Setor</label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
            >
              <option value="">— Sem setor —</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Atendente</label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">— Sem atendente (fila) —</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profile?.full_name ?? "Atendente"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={loading}
            onClick={() => onSubmit({
              assigneeId: assigneeId || null,
              sectorId: sectorId || null,
            })}
          >
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewTicketDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: { contactPhone: string; contactName?: string; body: string }) => Promise<void>;
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!open) { setPhone(""); setName(""); setBody(""); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={!phone.trim() || !body.trim() || loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onCreate({
                  contactPhone: phone.trim(),
                  contactName: name.trim() || undefined,
                  body: body.trim(),
                });
              } finally { setLoading(false); }
            }}
          >
            {loading ? "Criando…" : "Criar atendimento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NexInboxLayout;
