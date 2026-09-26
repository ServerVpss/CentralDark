// Layout fiel ao template NexChat (3 colunas no desktop), específico do /app/chat.
// Reusa dados reais do sistema (tickets, mensagens, PIX, realtime).
// Não é o NexInboxLayout (esse continua no /app/inbox e /admin/inbox).

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import {
  Search, Plus, MoreVertical, X, Sparkles, Bot, Phone, Video, Info,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeBR } from "@/lib/datetime";
import { friendlyError } from "@/lib/friendly-error";
import {
  listTickets, listMessages, sendMessage, updateTicketStatus,
  markRead, claimTicket, previewChannel,
} from "@/lib/tickets.functions";
import { getPendingPixForTicket } from "@/lib/chat-payments.functions";
import {
  NexChatShell, NexNavigationRail, NexChatHeader, NexMessageList,
  NexChatComposer, NexChatEmptyState, NexContactInfoSidebar, NexImageModal,
  NexPaymentCard, NexPixQrModal, NexConversationItem, NexConversationSkeleton,
  type NexConversation, type NexMessage, type NexChannelKind,
  type NexConnectionStatus, type NexPaymentInfo,
} from "@/components/nexchat";
import type { NexNavTab } from "@/components/nexchat/NexNavigationRail";
import { isMobileViewport, useIsMobileViewport } from "@/components/nexchat/use-is-mobile-viewport";
import { NexFeaturePanel } from "@/components/nexchat/NexFeaturePanel";
import { getFeatureStatus, isFeatureUsable, STATUS_LABEL, type NexFeatureKey } from "@/components/nexchat/feature-matrix";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  enqueueMessage, getEmptyQueueSnapshot, getQueueSnapshot, hydrateQueueFromStorage, subscribe as subscribeQueue,
} from "@/lib/chat-send-queue";

/* ---------------- Adaptadores (mesma lógica do NexInboxLayout) ---------------- */
function mapChannel(t: any): NexChannelKind | undefined {
  const raw = String(
    t?.connection?.provider ?? t?.connection_provider ?? t?.connection?.kind ?? t?.channel ?? "",
  ).toLowerCase();
  if (raw.includes("meta") || raw.includes("cloud")) return "meta";
  if (raw.includes("wuz")) return "wuzapi";
  if (raw.includes("qr") || raw.includes("baileys") || raw.includes("multizap")) return "multizap_qr";
  if (raw.includes("web")) return "webchat";
  // Fallback: ticket genérico "whatsapp" sem provider conhecido → assume MultiZap QR
  if (raw === "whatsapp") return "multizap_qr";
  return undefined;
}
function mapConnStatus(t: any): NexConnectionStatus | undefined {
  const raw = String(t?.connection_status ?? t?.connection?.status ?? "").toLowerCase();
  if (!raw) return undefined;
  if (raw.includes("conn") && !raw.includes("dis")) return "connected";
  if (raw.includes("dis")) return "disconnected";
  if (raw.includes("err") || raw.includes("fail")) return "error";
  return "pending";
}
type PresenceInfo = {
  online: boolean;
  state: string | null;       // composing | recording | online | offline | paused | ...
  lastSeenAt: number | null;
  updatedAt: number;          // recebimento do último evento (ms)
};

// Quanto tempo um "composing/recording" continua sendo exibido sem novo evento.
// A WuzAPI/Whatsmeow não manda "paused" garantido — então usamos timeout client-side.
const TYPING_TTL_MS = 12_000;

function presenceSubtitle(pres: PresenceInfo | undefined, nowMs: number): string | null {
  if (!pres) return null;
  const fresh = nowMs - pres.updatedAt < TYPING_TTL_MS;
  if (fresh && pres.state === "composing") return "digitando…";
  if (fresh && pres.state === "recording") return "gravando áudio…";
  if (pres.online) return "Online";
  if (pres.lastSeenAt) {
    try {
      return `visto por último ${formatTimeBR(new Date(pres.lastSeenAt).toISOString())}`;
    } catch { /* ignore */ }
  }
  return null;
}

// HOTFIX: nunca mostrar JID (@g.us / @lid / @s.whatsapp.net / @c.us / @broadcast) como título.
function isJidLike(s?: string | null): boolean {
  if (!s) return false;
  return /@(g\.us|lid|s\.whatsapp\.net|c\.us|broadcast)$/i.test(String(s).trim());
}

function ticketToConv(t: any, presenceMap?: Map<string, PresenceInfo>): NexConversation {
  const c = t.contact ?? {};
  const g = t.group ?? null;
  const phoneDigits = String(c.phone ?? "").replace(/\D+/g, "");
  const pres = phoneDigits && presenceMap ? presenceMap.get(phoneDigits) : undefined;
  const lastAt = t.last_message_at ? new Date(t.last_message_at).getTime() : 0;
  const heuristicOnline = lastAt > 0 && Date.now() - lastAt < 2 * 60 * 1000;
  const isOnline = pres ? pres.online : heuristicOnline;
  const ctype = normalizeConversationType(t);
  const isGroup = ctype === "group";
  // Nome do grupo: group.name (real) → subject → contact.name se não-JID → fallback bonito.
  // JID nunca pode aparecer como título.
  const groupNameSafe = (g?.name && !isJidLike(g.name)) ? g.name : null;
  const subjectSafe = (t.subject && !isJidLike(t.subject)) ? t.subject : null;
  const contactNameSafe = (c.name && !isJidLike(c.name)) ? c.name : null;
  const phoneSafe = (c.phone && !isJidLike(c.phone)) ? c.phone : null;
  const displayName = isGroup
    ? (groupNameSafe ?? subjectSafe ?? contactNameSafe ?? "Grupo WhatsApp")
    : (contactNameSafe ?? phoneSafe ?? "Sem nome");
  const displayAvatar = isGroup
    ? (g?.picture_url ?? c.avatar_url ?? null)
    : (c.avatar_url ?? null);
  // Preview de grupo: "Participante: mensagem" quando última msg foi de contato.
  const rawPreview = t.last_message_preview ?? t.last_message ?? "";
  const lastMessage =
    isGroup && t.last_sender_name && rawPreview
      ? `${t.last_sender_name}: ${rawPreview}`
      : rawPreview;
  return {
    id: t.id,
    contact: {
      id: c.id ?? t.id,
      name: displayName,
      phone: c.phone ?? null,
      avatarUrl: displayAvatar,
      channel: mapChannel(t),
      tags: t.tags ?? c.tags ?? [],
      isOnline: isGroup ? false : isOnline,
    },
    lastMessage,
    lastTime: t.last_message_at ? formatTimeBR(t.last_message_at) : "",
    unread: t.unread_count ?? 0,
    channel: mapChannel(t),
    connectionStatus: mapConnStatus(t),
    channelType: ctype,
    groupName: g?.name ?? null,
    groupPictureUrl: g?.picture_url ?? null,
    lastSenderName: t.last_sender_name ?? null,
  };
}
function dbMessageToNex(m: any, senderNameById?: Map<string, string>): NexMessage {
  const dir = String(m.author ?? m.direction ?? "").toLowerCase();
  const isOut = ["agent", "ai", "bot", "system", "outbound", "out", "me"].includes(dir);
  const isSystem = dir === "system" || m.kind === "system" || m.is_system === true;
  const isNote = m.is_internal_note === true;
  const author: NexMessage["author"] = isSystem
    ? "system"
    : isOut ? (dir === "ai" ? "ai" : dir === "bot" ? "bot" : "me") : "them";
  const mime = String(m.media_mime ?? m.kind ?? "").toLowerCase();
  let media: NexMessage["media"] | undefined;
  if (m.media_url) {
    if (mime === "image" || mime.startsWith("image/")) {
      media = { kind: "image", url: m.media_url, fileName: m.media_name ?? undefined };
    } else if (mime === "audio" || mime.startsWith("audio/")) {
      media = { kind: "audio", url: m.media_url, fileName: m.media_name ?? undefined };
    } else {
      media = { kind: "document", url: m.media_url, fileName: m.media_name ?? "documento" };
    }
  }
  const status: NexMessage["status"] | undefined =
    m.delivery === "read" || m.delivery === "delivered" || m.delivery === "sent" || m.delivery === "failed"
      ? m.delivery as any : undefined;
  const ctype: "group" | "private" | undefined =
    m.channel_type === "group" ? "group" : m.channel_type === "private" ? "private" : undefined;
  const senderName = m.sender_contact_id && senderNameById
    ? senderNameById.get(m.sender_contact_id) ?? null
    : null;
  return {
    id: m.id, author,
    body: isNote ? `📝 ${m.body ?? ""}` : (m.body ?? undefined),
    time: m.created_at ? formatTimeBR(m.created_at) : undefined,
    status, media,
    channelType: ctype,
    senderName,
  };
}
function pixToPayment(pend: any): NexPaymentInfo | null {
  if (!pend) return null;
  const s = String(pend.status ?? "").toUpperCase();
  const status: NexPaymentInfo["status"] =
    s === "PAGO" || s === "PAID" ? "paid"
    : s === "EXPIRADO" || s === "EXPIRED" ? "expired"
    : s === "CANCELADO" || s === "CANCELED" ? "canceled" : "pending";
  return {
    amount: Number(pend.amount ?? 0), status,
    gateway: pend.provider ?? "MisticPay",
    validUntil: pend.expires_at ? formatTimeBR(pend.expires_at) : undefined,
    pixCopyPaste: pend.copy_paste ?? undefined,
    qrImageUrl: pend.qrcode_url ?? (pend.qrcode_base64 ? `data:image/png;base64,${pend.qrcode_base64}` : undefined),
  };
}

type ListFilter = "all" | "unread" | "groups" | "channels";

function normalizeConversationType(t: any): "group" | "private" | undefined {
  const ticketType = String(t?.channel_type ?? "").toLowerCase();
  const lastType = String(t?.last_channel_type ?? "").toLowerCase();
  const chatId = String(t?.chat_id ?? t?.contact?.phone ?? "").toLowerCase();
  if (lastType === "group" || ticketType === "group" || t?.group_id || t?.group?.id || chatId.includes("@g.us")) return "group";
  if (ticketType === "private" || lastType === "private") return "private";
  return undefined;
}

function isGroupConversation(c: NexConversation): boolean {
  return c.channelType === "group" || !!c.groupName || !!c.groupPictureUrl || String(c.contact.phone ?? "").includes("@g.us");
}

const RAIL_TO_FEATURE: Partial<Record<NexNavTab, NexFeatureKey>> = {
  calls: "calls", status: "stories",
};

/* ============================================================
   NexChatPage — layout fiel ao template (Messenger-style)
   ============================================================ */
export function NexChatPage() {
  const { data: ws } = useCurrentWorkspace();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [railTab, setRailTab] = useState<NexNavTab>("chat");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobileChat, setIsMobileChat] = useState(false);
  // Observa breakpoint: ao sair do mobile, reseta o "chat fullscreen" pra lista voltar à esquerda no desktop.
  useIsMobileViewport(() => setIsMobileChat(false));

  // Abrir conversa direto via ?ticketId= (ex: clique em "Aceitar" da notificação)
  const search_ = useSearch({ strict: false }) as { ticketId?: string };
  const navigate_ = useNavigate();
  useEffect(() => {
    const tid = search_?.ticketId;
    if (tid && tid !== activeId) {
      setActiveId(tid);
      setRailTab("chat");
      if (isMobileViewport()) setIsMobileChat(true);
      navigate_({ to: "/app/chat", search: { ticketId: undefined }, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search_?.ticketId]);
  const [showInfo, setShowInfo] = useState(false);
  const [pixQrOpen, setPixQrOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState<string | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTickets = useServerFn(listTickets);
  const fetchMessages = useServerFn(listMessages);
  const sendFn = useServerFn(sendMessage);
  const updateStatus = useServerFn(updateTicketStatus);
  const markReadFn = useServerFn(markRead);
  const claimFn = useServerFn(claimTicket);
  const pendingPixFn = useServerFn(getPendingPixForTicket);
  const previewChannelFn = useServerFn(previewChannel);

  // Modal de confirmação Meta→QR (fallback fora da janela 24h).
  const [fallbackDialog, setFallbackDialog] = useState<{
    open: boolean;
    resolve?: (ok: boolean) => void;
  }>({ open: false });

  // Mostra modal e resolve com true/false. Único ponto que pode liberar confirmFallbackToQr.
  const askConfirmFallback = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setFallbackDialog({ open: true, resolve });
    });
  }, []);

  // Pré-checa canal antes de enviar. Se vier fallback Meta→QR, abre modal.
  // Retorna { ok, confirmFallbackToQr } ou null se atendente cancelou.
  const ensureChannelAllowed = useCallback(
    async (ticketId: string): Promise<{ confirmFallbackToQr: boolean } | null> => {
      try {
        const p = await previewChannelFn({ data: { ticketId } });
        if (!p.ok) {
          toast.error(p.message || "Sem canal disponível para enviar.");
          return null;
        }
        const isMetaToQr =
          p.reason === "fallback_qr" && p.currentProvider === "meta_cloud";
        if (isMetaToQr) {
          const ok = await askConfirmFallback();
          if (!ok) return null;
          return { confirmFallbackToQr: true };
        }
        return { confirmFallbackToQr: false };
      } catch (e: any) {
        toast.error(friendlyError(e, "Falha ao verificar canal"));
        return null;
      }
    },
    [previewChannelFn, askConfirmFallback],
  );

  // Tickets
  const ticketsQ = useQuery({
    queryKey: ["nex-chat-tickets", ws?.id],
    enabled: !!ws,
    queryFn: () => fetchTickets({ data: { workspaceId: ws!.id, filter: "all", search: "" } }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
  const allTickets = (ticketsQ.data?.tickets ?? []) as any[];

  // Membros (pra mostrar nome do atendente no painel direito)
  const membersQ = useQuery({
    queryKey: ["nex-chat-members", ws?.id],
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

  // Presença em tempo real (whatsapp_presence). Funciona só com gateways que emitem
  // presença (Baileys/Wuzapi). Meta Cloud não emite → cai no fallback heurístico.
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceInfo>>(new Map());

  useEffect(() => {
    if (!ws?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("whatsapp_presence")
        .select("contact_phone,state,last_seen_at")
        .eq("workspace_id", ws.id);
      if (cancelled) return;
      const m = new Map<string, PresenceInfo>();
      (data ?? []).forEach((r: any) => {
        const phone = String(r.contact_phone ?? "").replace(/\D+/g, "");
        if (!phone) return;
        const state = String(r.state ?? "");
        const online = ["online", "available", "composing", "recording"].includes(state);
        m.set(phone, {
          online,
          state: state || null,
          lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at).getTime() : null,
          updatedAt: Date.now(),
        });
      });
      setPresenceMap(m);
    })();
    const channel = supabase
      .channel(`presence-${ws.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_presence", filter: `workspace_id=eq.${ws.id}` },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (!row) return;
          const phone = String(row.contact_phone ?? "").replace(/\D+/g, "");
          if (!phone) return;
          setPresenceMap((prev) => {
            const next = new Map(prev);
            if (payload.eventType === "DELETE") {
              next.delete(phone);
            } else {
              const state = String(row.state ?? "");
              const online = ["online", "available", "composing", "recording"].includes(state);
              next.set(phone, {
                online,
                state: state || null,
                lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at).getTime() : null,
                updatedAt: Date.now(),
              });
            }
            return next;
          });
        })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [ws?.id]);

  // Stories = top 8 contatos mais recentes (visual fiel ao template)
  const stories = useMemo(() => allTickets.map((t) => ticketToConv(t, presenceMap)).filter((c) => !isGroupConversation(c)).slice(0, 8), [allTickets, presenceMap]);

  // Lista filtrada
  const conversations = useMemo(() => {
    const all = allTickets.map((t) => ticketToConv(t, presenceMap));
    return all.filter((c) => {
      if (search && !c.contact.name.toLowerCase().includes(search.toLowerCase())) return false;
      const isGroup = isGroupConversation(c);
      // REGRA CRM: "Todos" mostra só PRIVADOS (grupos ficam na aba Grupos).
      if (filter === "all" && isGroup) return false;
      // "Não Lidas": só privadas (grupos têm sua aba).
      if (filter === "unread" && (isGroup || !(c.unread && c.unread > 0))) return false;
      // "Grupos" → só grupos.
      if (filter === "groups" && !isGroup) return false;
      // "Canais" → só privados (DM); esconde grupos.
      if (filter === "channels" && isGroup) return false;
      return true;
    });
  }, [allTickets, filter, search, presenceMap]);

  const activeTicket = useMemo(
    () => allTickets.find((t) => t.id === activeId) ?? null,
    [allTickets, activeId],
  );
  const activeConv = activeTicket ? ticketToConv(activeTicket, presenceMap) : null;
  const isAttending = !!activeTicket && activeTicket.assignee_id === user?.id;

  // Tick a cada 5s pra expirar "digitando…/gravando…" no header (TYPING_TTL_MS).
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);
  const activePhoneDigits = String(activeTicket?.contact?.phone ?? "").replace(/\D+/g, "");
  const activePresence = activePhoneDigits ? presenceMap.get(activePhoneDigits) : undefined;
  const headerSubtitle = presenceSubtitle(activePresence, nowTick) ?? undefined;

  // Mensagens
  const messagesQ = useQuery({
    queryKey: ["nex-chat-messages", activeId],
    enabled: !!activeId,
    queryFn: () => fetchMessages({ data: { ticketId: activeId! } }),
    refetchOnWindowFocus: false,
  });
  // Map sender_contact_id → nome, pra renderizar "Fulano" acima das bolhas em grupo.
  const senderIds = useMemo(() => {
    const set = new Set<string>();
    for (const m of (messagesQ.data?.messages ?? []) as any[]) {
      if (m.sender_contact_id && m.author === "contact") set.add(m.sender_contact_id);
    }
    return Array.from(set);
  }, [messagesQ.data]);
  const sendersQ = useQuery({
    queryKey: ["nex-chat-senders", activeId, senderIds.sort().join(",")],
    enabled: !!activeId && senderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, phone")
        .in("id", senderIds);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
  const senderNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of (sendersQ.data ?? []) as any[]) {
      m.set(s.id, (s.name as string) || (s.phone as string) || "");
    }
    return m;
  }, [sendersQ.data]);
  const messages: NexMessage[] = useMemo(
    () => (messagesQ.data?.messages ?? []).map((m: any) => dbMessageToNex(m, senderNameById)),
    [messagesQ.data, senderNameById],
  );

  // Mídia compartilhada (URLs de imagem das últimas mensagens), pro painel direito
  const sharedMedia = useMemo(() => {
    const urls: string[] = [];
    for (let i = messages.length - 1; i >= 0 && urls.length < 12; i--) {
      const m = messages[i];
      if (m.media?.kind === "image" && m.media.url) urls.push(m.media.url);
    }
    return urls;
  }, [messages]);

  // PIX pendente
  const pixQ = useQuery({
    queryKey: ["nex-chat-pix", activeId],
    enabled: !!activeId,
    queryFn: () => pendingPixFn({ data: { ticketId: activeId! } }),
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
  });
  const payment = useMemo(() => pixToPayment(pixQ.data?.pending), [pixQ.data]);

  // Realtime — canal estável (não recria ao trocar de conversa). activeId via ref.
  const activeIdRef = useRef(activeId);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => {
    if (!ws) return;
    const ch = supabase
      .channel(`nex-chat-ws:${ws.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `workspace_id=eq.${ws.id}` },
        () => qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] }))
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages", filter: `workspace_id=eq.${ws.id}` },
        (p) => {
          const row = p.new as any;
          qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
          const currentActive = activeIdRef.current;
          if (row?.ticket_id && row.ticket_id === currentActive) {
            // Tenta inserir direto no cache da timeline aberta (sem flicker / sem perder a msg).
            // Só faz fallback de invalidate se o cache estiver vazio — invalidar logo após o
            // setQueryData descartava a mensagem recém-adicionada em tickets grandes.
            let appended = false;
            qc.setQueryData(["nex-chat-messages", currentActive], (old: any) => {
              if (!old || !Array.isArray(old.messages)) return old;
              if (old.messages.some((m: any) => m.id === row.id)) { appended = true; return old; }
              appended = true;
              return { ...old, messages: [...old.messages, row] };
            });
            if (!appended) {
              qc.invalidateQueries({ queryKey: ["nex-chat-messages", currentActive] });
            }
            qc.invalidateQueries({ queryKey: ["nex-chat-pix", currentActive] });
          }
        })
      .on("postgres_changes",
        { event: "*", schema: "public", table: "pix_transactions", filter: `workspace_id=eq.${ws.id}` },
        () => qc.invalidateQueries({ queryKey: ["nex-chat-pix"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [ws, qc]);


  useEffect(() => {
    if (activeId) markReadFn({ data: { ticketId: activeId } }).catch(() => {});
  }, [activeId, markReadFn]);

  useEffect(() => { hydrateQueueFromStorage(); }, []);
  const queueItems = useSyncExternalStore(
    useCallback((cb) => subscribeQueue(cb), []),
    useCallback(() => activeId ? getQueueSnapshot(activeId) : getEmptyQueueSnapshot(), [activeId]),
    getEmptyQueueSnapshot,
  );
  const visibleMessages = useMemo<NexMessage[]>(() => [
    ...messages,
    ...queueItems.map((q) => ({
      id: q.localId,
      author: "me" as const,
      body: q.body,
      time: formatTimeBR(q.createdAt),
      status: q.status === "failed" ? "failed" as const : "pending" as const,
    })),
  ], [messages, queueItems]);

  // Send
  const sendOnce = useCallback(
    async (vars: { ticketId: string; body: string; isInternalNote: boolean; confirmFallbackToQr?: boolean }) => {
      const result = await sendFn({ data: vars });
      qc.invalidateQueries({ queryKey: ["nex-chat-messages", vars.ticketId] });
      qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
      qc.invalidateQueries({ queryKey: ["nex-chat-pix", vars.ticketId] });
      return result;
    },
    [sendFn, qc],
  );
  async function queueTextSend(text: string) {
    if (!activeId) return;
    // Nota interna não passa pelo WhatsApp — pula a checagem de canal.
    let confirmFallbackToQr = false;
    if (!noteMode) {
      const allowed = await ensureChannelAllowed(activeId);
      if (!allowed) return; // sem canal ou atendente cancelou modal
      confirmFallbackToQr = allowed.confirmFallbackToQr;
    }
    enqueueMessage({
      localId: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ticketId: activeId,
      body: text,
      isInternalNote: noteMode,
      confirmFallbackToQr,
      createdAt: new Date().toISOString(),
    } as any, sendOnce, qc);
  }

  async function handleFile(file: File) {
    if (!ws || !activeId) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("Arquivo muito grande (limite 16MB)"); return; }
    // Mídia também precisa respeitar a regra Meta/QR.
    const allowed = await ensureChannelAllowed(activeId);
    if (!allowed) return;
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
        : t.startsWith("audio/") ? "audio" : "document";
      await sendFn({
        data: {
          ticketId: activeId, isInternalNote: false,
          confirmFallbackToQr: allowed.confirmFallbackToQr,
          media: { type: mediaType, link: signed.signedUrl, filename: mediaType === "document" ? file.name : undefined },
        },
      });
      qc.invalidateQueries({ queryKey: ["nex-chat-messages", activeId] });
      qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
      toast.success("Mídia enviada");
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
      qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao assumir")),
  });

  const closeM = useMutation({
    mutationFn: async () => updateStatus({ data: { ticketId: activeId!, status: "closed" } }),
    onSuccess: () => {
      toast.success("Atendimento encerrado");
      setActiveId(null); setIsMobileChat(false);
      qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
    },
    onError: (e: any) => toast.error(friendlyError(e, "Falha ao encerrar")),
  });

  if (!ws) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Carregando workspace…
      </div>
    );
  }

  // Banner bot
  const rawMsgs = (messagesQ.data?.messages ?? []) as any[];
  const lastMsg = rawMsgs.length > 0 ? rawMsgs[rawMsgs.length - 1] : null;
  const botActive = !!activeTicket && !activeTicket.assignee_id && !!lastMsg &&
    (lastMsg.author === "bot" || lastMsg.author === "ai");

  // Header actions fieis ao ChatWindow.tsx (busca/chamada/vídeo/info + menu).
  // Botões de chamada/vídeo respeitam matriz de capabilities por provider.
  const activeChannel = activeConv?.channel;
  const callStatus = activeChannel ? getFeatureStatus(activeChannel, "calls") : "coming_soon";
  const callOk = isFeatureUsable(callStatus);
  const callTooltip = callOk ? "Chamada de voz" : `Chamada — ${STATUS_LABEL[callStatus]}`;
  const videoTooltip = callOk ? "Chamada de vídeo" : `Vídeo — ${STATUS_LABEL[callStatus]}`;

  const headerActions = activeTicket ? (
    <>
      {!isAttending && (
        <button
          type="button" className="nx-btn" data-variant="primary"
          onClick={() => claimM.mutate()} disabled={claimM.isPending}
        >
          Assumir
        </button>
      )}
      <button
        type="button" className="nx-icon-btn" title="Buscar na conversa"
        onClick={() => toast.message("Busca na conversa em breve")}
      >
        <Search size={18} />
      </button>
      <button
        type="button" className="nx-icon-btn"
        data-disabled={!callOk ? "true" : undefined}
        title={callTooltip}
        onClick={() => callOk ? toast.message("Iniciando chamada…") : toast.message(callTooltip)}
      >
        <Phone size={18} />
      </button>
      <button
        type="button" className="nx-icon-btn"
        data-disabled={!callOk ? "true" : undefined}
        title={videoTooltip}
        onClick={() => callOk ? toast.message("Iniciando vídeo…") : toast.message(videoTooltip)}
      >
        <Video size={18} />
      </button>
      <button
        type="button" className="nx-icon-btn"
        title={showInfo ? "Ocultar informações" : "Mostrar informações"}
        onClick={() => setShowInfo((v) => !v)}
      >
        <Info size={18} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="nx-icon-btn" title="Mais ações">
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => closeM.mutate()} disabled={closeM.isPending}
          >
            <X className="mr-2 h-4 w-4" /> Encerrar atendimento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ) : undefined;

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex-1 overflow-hidden">
        <NexChatShell chatOpen={isMobileChat && !!activeConv}>
          {/* Rail */}
          {/* Rail: vertical no desktop, bottom nav no mobile (controlado por CSS) */}
          <NexNavigationRail
            active={railTab}
            onChange={(t) => {
              if (t === "groups") {
                setRailTab("chat");
                setFilter("groups");
                setIsMobileChat(false);
                return;
              }
              setRailTab(t);
              if (t === "chat") setIsMobileChat(false);
            }}
            onSettings={() => { window.location.href = "/app/personalizar"; }}
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
            {/* ===== Coluna esquerda — Messages ===== */}
            <aside
              className="nx-list nx-messenger-list"
              style={{ display: isMobileChat ? "none" : "flex" }}
            >
              {/* Header: título + menu */}
              <div className="nx-list-header" style={{ paddingBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="nx-list-title">Mensagens</div>
                  <button type="button" className="nx-icon-btn" title="Mais opções">
                    <MoreVertical size={18} />
                  </button>
                </div>
                {/* Busca */}
                <div className="nx-search">
                  <Search size={16} />
                  <input
                    placeholder="Buscar conversas…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Stories / Status horizontal */}
              <div className="nx-stories">
                <button type="button" className="nx-story nx-story-add" title="Meu status">
                  <span className="nx-story-avatar nx-story-add-ring">
                    <Plus size={20} />
                  </span>
                  <span className="nx-story-name">Meu status</span>
                </button>
                {stories.map((s) => {
                  const initials = s.contact.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <button
                      key={s.id} type="button" className="nx-story"
                      title={s.contact.name}
                      onClick={() => { setActiveId(s.id); if (isMobileViewport()) setIsMobileChat(true); }}
                    >
                      <span className="nx-story-avatar nx-story-ring">
                        {s.contact.avatarUrl
                          ? <img src={s.contact.avatarUrl} alt={s.contact.name} />
                          : <span>{initials}</span>}
                      </span>
                      <span className="nx-story-name">{s.contact.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tabs All / Unread / Groups / Channels */}
              <div className="nx-filters" style={{ padding: "8px 14px" }}>
                {(["all", "unread", "groups", "channels"] as ListFilter[]).map((f) => (
                  <button
                    key={f} type="button" className="nx-filter"
                    data-active={filter === f} onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : f === "groups" ? "Grupos" : "Canais"}
                  </button>
                ))}
              </div>

              {/* Ask AI card */}
              <Link
                to="/app/utilidades/agente-ia"
                className="nx-ask-ai"
                title="Abrir agente de IA"
              >
                <span className="nx-ask-ai-icon"><Sparkles size={18} /></span>
                <span className="nx-ask-ai-text">
                  <strong>Pergunte à IA</strong>
                  <small>POWERED BY MULTIZAP</small>
                </span>
              </Link>

              {/* Lista */}
              <div className="nx-list-scroll" style={{ flex: 1 }}>
                {ticketsQ.isLoading ? (
                  <NexConversationSkeleton rows={6} />
                ) : conversations.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--nx-text-muted)", fontSize: 13 }}>
                    Nenhuma conversa
                  </div>
                ) : (
                  conversations.map((c) => (
                    <NexConversationItem
                      key={c.id} conv={c} active={activeId === c.id}
                      onSelect={(id) => { setActiveId(id); if (isMobileViewport()) setIsMobileChat(true); setNoteMode(false); }}
                    />
                  ))
                )}
              </div>

              {/* Footer: Nova mensagem */}
              <div className="nx-list-footer">
                <Link to="/app/contatos" className="nx-new-msg-btn">
                  <Plus size={18} /> Nova mensagem
                </Link>
              </div>
            </aside>

            {/* ===== Centro — Conversa =====
                No mobile: esconde o centro quando nenhuma conversa está aberta (lista ocupa a tela).
                No desktop: SEMPRE mostra o centro (com empty state quando não há conversa selecionada). */}
            <main
              className="nx-chat"
              style={{
                display: !activeConv && !isMobileChat && isMobileViewport() ? "none" : undefined,
                position: "relative",
              }}
            >
              {activeConv && activeTicket ? (
                <>
                  <NexChatHeader
                    contact={activeConv.contact}
                    subtitle={headerSubtitle}
                    channel={activeConv.channel}
                    status={activeConv.connectionStatus}
                    onBack={() => setIsMobileChat(false)}
                    onToggleInfo={() => setShowInfo((v) => !v)}
                    rightActions={headerActions}
                  />
                  <NexMessageList
                    messages={visibleMessages}
                    contact={activeConv.contact}
                    onOpenImage={(url) => setImgOpen(url)}
                    onOpenQr={() => setPixQrOpen(true)}
                    onCopyPix={(code) => { navigator.clipboard?.writeText(code); toast.success("PIX copiado"); }}
                  />

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
                  {payment && payment.status === "pending" && (
                    <div style={{ padding: "8px 12px 0" }}>
                      <NexPaymentCard
                        payment={payment}
                        onCopyPix={(code) => { navigator.clipboard?.writeText(code); toast.success("PIX copiado"); }}
                        onOpenQr={() => setPixQrOpen(true)}
                      />
                    </div>
                  )}
                  <input
                    ref={fileRef} type="file" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  {!isAttending ? (
                    <footer style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", borderTop: "1px solid var(--nx-border)",
                      background: "var(--nx-surface)", gap: 12, flexWrap: "wrap",
                    }}>
                      <span style={{ fontSize: 13, color: "var(--nx-text-muted)" }}>
                        Pronto pra entrar no atendimento?
                      </span>
                      <button
                        type="button" className="nx-btn" data-variant="primary"
                        onClick={() => claimM.mutate()} disabled={claimM.isPending}
                      >
                        Assumir controle
                      </button>
                    </footer>
                  ) : (
                    <NexChatComposer
                      disabled={uploading}
                      onSend={queueTextSend}
                      onAttach={() => fileRef.current?.click()}
                      onPasteFile={(f) => handleFile(f)}
                      noteMode={noteMode}
                      onToggleNote={setNoteMode}
                    />
                  )}
                </>
              ) : (
                <NexChatEmptyState />
              )}
            </main>

            {/* ===== Direita — Contact Info Sidebar (fiel ao template) ===== */}
            {activeConv && showInfo && (
              <NexContactInfoSidebar
                contact={activeConv.contact}
                sector={activeTicket?.sector?.name ?? null}
                assignee={
                  activeTicket?.assignee_id
                    ? (nameByUserId.get(activeTicket.assignee_id) ?? "Atendente")
                    : (isAttending ? "Você" : null)
                }
                tags={activeConv.contact.tags ?? []}
                notes={activeTicket?.note ?? ""}
                mediaUrls={sharedMedia}
                onClose={() => setShowInfo(false)}
                onOpenImage={(url) => setImgOpen(url)}
              />
            )}
          </>)}
        </NexChatShell>
      </div>

      <NexPixQrModal
        open={pixQrOpen}
        onOpenChange={setPixQrOpen}
        qrImageUrl={payment?.qrImageUrl}
        pixCopyPaste={payment?.pixCopyPaste}
        amount={payment?.amount}
        onCopy={(code) => { navigator.clipboard?.writeText(code); toast.success("PIX copiado"); }}
      />
      <NexImageModal
        open={!!imgOpen} onOpenChange={(v) => !v && setImgOpen(null)}
        url={imgOpen ?? undefined}
      />

      {/* Confirmação obrigatória pra trocar Meta→QR fora da janela 24h */}
      <AlertDialog
        open={fallbackDialog.open}
        onOpenChange={(open) => {
          if (!open && fallbackDialog.resolve) fallbackDialog.resolve(false);
          setFallbackDialog({ open });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trocar para o canal QR?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta conversa veio pela <strong>META</strong>, mas a janela de 24h fechou.
              Não dá pra enviar texto livre pela META agora.
              <br /><br />
              Posso responder pelo <strong>QR</strong>. O cliente vai ver a mensagem chegando de
              outro número do WhatsApp. Confirma?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => { fallbackDialog.resolve?.(false); setFallbackDialog({ open: false }); }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { fallbackDialog.resolve?.(true); setFallbackDialog({ open: false }); }}
            >
              Confirmar e enviar pelo QR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

