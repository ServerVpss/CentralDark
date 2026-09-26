# COMANDO - app.canais.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\app.canais.tsx
**SHA:** c2fd28b69fb37e5e
**Timestamp:** 2026-08-26T19:31:53.541589
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = async () => {

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Radio,
  MessageCircle,
  
  AlertTriangle,
  Zap,
  Trash2,
  Plus,
  Settings2,
  Stethoscope,
  Webhook,
  ShieldCheck,
  Clock,
  RefreshCw,
  Sparkles,
  FileText,
} from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";
import {
  getPublicMasterSettings,
  completeEmbeddedSignup,
  reconnectEmbeddedSignup,
} from "@/lib/master-settings.functions";
import {
  testWhatsAppConnection,
  deleteWhatsAppConnection,
  disconnectWhatsAppConnection,
  forceResetQrConnection,
  softReconnectQrConnection,
  getMyConnectionsWithWebhook,
  autoHealthCheckMyWhatsapp,
  logEmbeddedSignupBlocked,
} from "@/lib/whatsapp.functions";
import { syncQrConnectionsFromGateway, reapplyQrWebhook, getQrConnectionsDiagnostic } from "@/lib/multizap-qr.functions";


import { ConnectionDiagnostic } from "@/components/whatsapp/ConnectionDiagnostic";
import { ConnectionLogsSheet } from "@/components/whatsapp/ConnectionLogsSheet";
import { RegisterAndVerifyPhone } from "@/components/whatsapp/RegisterAndVerifyPhone";
import { VerifyPinPanel } from "@/components/whatsapp/VerifyPinPanel";
import { FriendlyErrorBox } from "@/components/whatsapp/FriendlyErrorBox";
import { ConnectWizard } from "@/components/whatsapp/ConnectWizard";
import { SecurityPausedBanner } from "@/components/workspace/SecurityPausedBanner";
import { WhatsAppConnectChoicePanel } from "@/components/whatsapp/WhatsAppConnectChoicePanel";
import { ConnectedChannelsSection } from "@/components/whatsapp/ConnectedChannelsSection";
import { WhatsAppQrConnectionModal } from "@/components/whatsapp/WhatsAppQrConnectionModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/canais")({ component: Page });

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const loc = useLocation();
  // Quando uma rota filha (ex.: /app/canais/meta) estiver ativa, renderiza só ela.
  if (loc.pathname !== "/app/canais" && loc.pathname !== "/app/canais/") {
    return <Outlet />;
  }
  return (
    <PageScaffold
      title="Canais"
      description="Conecte o WhatsApp da sua empresa para começar a atender."
      icon={Radio}
      adminHref="/admin/whatsapp"
    >
      {ws ? (
        <Content workspaceId={ws.id} />
      ) : (
        <div className="p-6 text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>
      )}
    </PageScaffold>
  );
}

type Conn = Awaited<ReturnType<typeof getMyConnectionsWithWebhook>>[number];

function whStatusBadge(s: "pending" | "approved" | "connected") {
  if (s === "connected")
    return {
      label: "Recebendo mensagens",
      cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    };
  if (s === "approved")
    return {
      label: "Conectado, aguardando 1ª mensagem",
      cls: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    };
  return {
    label: "Aguardando validação do PIN",
    cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  };
}

function Content({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const { data: ws } = useCurrentWorkspace();
  const [diagFor, setDiagFor] = useState<{ id: string; name: string; provider?: string | null; gatewayConnectionId?: string | null } | null>(null);
  const [logsFor, setLogsFor] = useState<{ id: string; name: string; provider?: string | null } | null>(null);

  const [resumePin, setResumePin] = useState<{ id: string; name: string } | null>(null);
  const [wizardAberto, setWizardAberto] = useState(false);
  const [manualWizardAberto, setManualWizardAberto] = useState(false);
  const [qrModalAberto, setQrModalAberto] = useState(false);
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(nul
```