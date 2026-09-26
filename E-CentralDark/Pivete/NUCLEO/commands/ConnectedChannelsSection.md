# COMANDO - ConnectedChannelsSection.tsx
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\whatsapp\ConnectedChannelsSection.tsx
**SHA:** 7bf11937715a8af6
**Timestamp:** 2026-08-26T19:41:31.941857
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const eventsMissing = !!(isQr && diagnostic && (!diagnostic.events_configured || diagnostic.events.length === 0));
- Método: Embedded Signup
- Método: QR Code

### Ouro Bruto (primeiros 5000 chars)
```
// Seção "Seus canais conectados" — UI premium dark mode espelhando o print
// de referência. Mostra de forma cristalina: canal, provedor (Meta Cloud API
// vs MultiZap QR), método (Embedded Signup vs QR Code) e status.
//
// Não muda backend nem nomes de campos: apenas mapeia provider/connection_mode/
// onboarding_mode/status já existentes em whatsapp_connections para badges
// amigáveis. Tokens nunca aparecem aqui.
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Stethoscope,
  FileText,
  Zap,
  Trash2,
  Settings2,
  RefreshCw,
  ShieldCheck,
  QrCode,
  Sparkles,
  Smartphone,
  MoreHorizontal,
  Radio,
  CheckCircle2,
  QrCode as QrIcon,
  AlertTriangle,
  Info as InfoIcon,
  Webhook,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDateTimeBR } from "@/lib/datetime";

// ---------- Tipos ----------
export type ChannelConnection = {
  id: string;
  name: string;
  display_phone_number?: string | null;
  phone?: string | null;
  provider?: string | null;
  onboarding_mode?: string | null;
  connection_mode?: string | null;
  status: string;
  webhookStatus: "pending" | "approved" | "connected";
  lastEventAt?: string | null;
  last_error?: string | null;
  profile_picture_url?: string | null;
};

export type QrDiagnostic = {
  connection_id: string;
  session_connected: boolean;
  logged_in: boolean;
  webhook_configured: boolean;
  events_configured: boolean;
  events: string[];
  last_webhook_at: string | null;
  last_webhook_kind: string | null;
  error: string | null;
};

type ProviderKind = "meta" | "multizap_qr";
type MethodKind = "embedded" | "qr";

function resolveProvider(c: ChannelConnection): ProviderKind {
  const p = (c.provider ?? "").toLowerCase();
  const mode = (c.connection_mode ?? "").toLowerCase();
  if (p.includes("wuzapi") || p === "multizap_qr" || mode === "baileys") return "multizap_qr";
  return "meta";
}

function resolveMethod(c: ChannelConnection): MethodKind {
  if (resolveProvider(c) === "multizap_qr") return "qr";
  const ob = (c.onboarding_mode ?? "").toLowerCase();
  if (ob === "qr") return "qr";
  return "embedded";
}

type StatusKind = "connected" | "waiting_first" | "waiting_qr" | "disconnected" | "needs_reconnect" | "waiting_diagnostic" | "error";

function resolveStatus(c: ChannelConnection, diagnostic?: QrDiagnostic): StatusKind {
  if (c.last_error) return "error";
  const raw = (c.status ?? "").toLowerCase();
  const provider = resolveProvider(c);

  // MultiZap QR (WuzAPI/Baileys): o status local NÃO é confiável sozinho —
  // ele pode estar "connected" no banco enquanto a sessão já caiu no celular.
  // A fonte de verdade é o diagnóstico do Gateway.
  if (provider === "multizap_qr") {
    if (diagnostic) {
      const kind = (diagnostic.last_webhook_kind ?? "").toLowerCase();
      const sessionDead =
        diagnostic.logged_in === false ||
        diagnostic.session_connected === false ||
        kind.includes("logged_out") ||
        kind.includes("disconnect");
      if (sessionDead) return "needs_reconnect";
      if (diagnostic.logged_in && diagnostic.session_connected) return "connected";
      // Diagnóstico veio mas ainda não bateu — trata como aguardando.
      return "waiting_diagnostic";
    }
    // Sem diagnóstico: NUNCA mostra "Conectado" só pelo status local.
    if (raw.includes("qr") || raw === "pairing" || raw === "connecting") return "waiting_qr";
    if (raw.includes("disconnect") || raw === "logged_out" || raw === "closed") return "disconnected";
    return "waiting_diagnostic";
  }

  // Meta Cloud API: depende do webhook
  if (c.webhookStatus === "connected") return "connected";
  if (c.webhookStatus === "approved") return "waiting_first";
  if (raw.includes("qr")) return "waiting_qr";
  if (raw.includes("disconnect")) return "disconnected";
  return "waiting_qr";
}


// ---------- Seção principal ----------
export function ConnectedChannelsSection({
  connections,
  workspaceName,
  diagnostics,
  diagnosticUnavailable,
  diagnosticError,
  diagnosticRefreshing,
  isSuperAdmin,
  onRetryDiagnostic,
  onConnectNew,
  onTest,
  onReconnect,
  onSoftReconnect,
  onDisconnect,
  onReapplyWebhook,
  onDelete,
  testingId,
  reconnectingId,
  softReconnectingId,
  reapplyingId,
}: {
  connections: ChannelConnection[];
  workspaceName?: string | null;
  diagnostics?: Record<string, QrDiagnostic>;
  diagnosticUnavailable?: boolean;
  diagnosticError?: string | null;
  diagnosticRefreshing?: boolean;
  isSuperAdmin?: boolean;
  onRetryDiagnostic?: () => void;
  onConnectNew: () => void;
  onTest?: (id: string) => void;
  onReconnect?: (c: ChannelConnection) => void;
  onSoftReconnect?: (c: Channel
```