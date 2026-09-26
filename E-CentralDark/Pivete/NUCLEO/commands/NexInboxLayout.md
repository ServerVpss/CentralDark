# COMANDO - NexInboxLayout.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\nexchat\NexInboxLayout.tsx
**SHA:** e012f0650197ceca
**Timestamp:** 2026-08-26T19:31:07.418527
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Gaps
- <div style={{ display: "flex", gap: 4, padding: "8px 10px 4px", flexWrap: "wrap" }}>
- gap: 6,
- borderRadius: 999, fontSize: 12, display: "flex", alignItems: "center", gap: 6,
- background: "var(--nx-surface)", gap: 8, color: "var(--nx-text-muted)", fontSize: 13,
- background: "var(--nx-surface)", gap: 12, flexWrap: "wrap",

### Ouro Bruto (primeiros 5000 chars)
```
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
function isJid
```