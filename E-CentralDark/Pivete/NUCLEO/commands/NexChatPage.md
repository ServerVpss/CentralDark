# COMANDO - NexChatPage.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\nexchat\NexChatPage.tsx
**SHA:** a534edf49a3792b2
**Timestamp:** 2026-08-26T19:31:38.265242
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- borderRadius: 999, fontSize: 12, display: "flex", alignItems: "center", gap: 6,
- background: "var(--nx-surface)", gap: 12, flexWrap: "wrap",

### Ouro Bruto (primeiros 5000 chars)
```
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
  const lastAt = t.last_message_at ? new 
```