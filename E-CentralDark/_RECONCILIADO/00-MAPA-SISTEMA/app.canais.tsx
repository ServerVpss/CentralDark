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
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(null);
  const settingsFn = useServerFn(getPublicMasterSettings);
  const embedFn = useServerFn(completeEmbeddedSignup);
  const reconnectFn = useServerFn(reconnectEmbeddedSignup);
  const testFn = useServerFn(testWhatsAppConnection);
  const delFn = useServerFn(deleteWhatsAppConnection);
  const disconnectFn = useServerFn(disconnectWhatsAppConnection);
  const forceResetFn = useServerFn(forceResetQrConnection);
  const softReconnectFn = useServerFn(softReconnectQrConnection);

  const connFn = useServerFn(getMyConnectionsWithWebhook);

  const healthFn = useServerFn(autoHealthCheckMyWhatsapp);

  const { data: settings } = useQuery({
    queryKey: ["master-public-settings"],
    queryFn: () => settingsFn(),
  });

  const { data: connections, isLoading } = useQuery({
    queryKey: ["my-wa-connections-wh", workspaceId],
    queryFn: () => connFn({ data: { workspaceId } }),
    refetchInterval: 15_000,
  });

  // Diagnóstico das conexões QR/WuzAPI — usado pelo card pra mostrar
  // se webhook + eventos estão realmente ativos. Sem expor token/secret.
  const diagFn = useServerFn(getQrConnectionsDiagnostic);
  const { data: qrDiagData, isError: qrDiagIsError, refetch: qrDiagRefetch, isFetching: qrDiagFetching } = useQuery({
    queryKey: ["qr-diagnostic", workspaceId],
    queryFn: () => diagFn({ data: { workspace_id: workspaceId } }),
    refetchInterval: 20_000,
    retry: false,
  });
  type QrDiag = NonNullable<typeof qrDiagData>["connections"][number];
  // Indexa o diagnóstico por TODOS os IDs possíveis (local + gateway).
  // O diagnóstico vem chaveado por connection_id do Gateway, mas o card
  // procura por c.id local — sem esse cruzamento, ele nunca achava o
  // diagnóstico e caía no fallback de "Conectado".
  const qrDiagnostics = (() => {
    const map: Record<string, QrDiag> = {};
    const byGateway: Record<string, QrDiag> = {};
    for (const d of qrDiagData?.connections ?? []) {
      byGateway[d.connection_id] = d;
      map[d.connection_id] = d;
    }
    for (const c of (connections ?? []) as Array<{
      id: string;
      phone_number_id?: string | null;
      baileys_session_id?: string | null;
      session_data?: { gateway_connection_id?: string | null } | null;
    }>) {
      const gid =
        c.session_data?.gateway_connection_id ||
        c.baileys_session_id ||
        c.phone_number_id ||
        null;
      const found = (gid && byGateway[gid]) || undefined;
      if (found) map[c.id] = found;
    }
    return map;
  })();
  // Diagnóstico considerado indisponível quando:
  // - a chamada falhou (qrDiagIsError), ou
  // - o gateway respondeu mas marcou gateway_available=false
  const qrDiagUnavailable = qrDiagIsError || (qrDiagData && qrDiagData.gateway_available === false);
  const qrDiagErrorMsg =
    (qrDiagData && qrDiagData.gateway_available === false ? qrDiagData.error : null) ?? null;
  const { data: isSuperAdmin } = useIsSuperAdmin();


  // 🤖 Robô silencioso: a cada 5 minutos confere a saúde de cada número
  // junto à Meta (token, número, status) e corrige automaticamente sem
  // mostrar toast nem pedir clique. Se algo der errado, o card já mostra.
  useQuery({
    queryKey: ["wa-auto-health", workspaceId],
    queryFn: async () => {
      const r = await healthFn({ data: { workspaceId } });
      qc.invalidateQueries({ queryKey: ["my-wa-connections-wh", workspaceId] });
      return r;
    },
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const refresh = () => {
    // Após conectar/desconectar QR, atualizar tudo que depende do estado real:
    // lista de canais, diagnóstico do gateway e dashboard (home/status).
    qc.invalidateQueries({ queryKey: ["my-wa-connections-wh", workspaceId] });
    qc.invalidateQueries({ queryKey: ["qr-diagnostic", workspaceId] });
    qc.invalidateQueries({ queryKey: ["workspace-home"] });
    qc.invalidateQueries({ queryKey: ["admin-home"] });
  };

  // Auto-sincroniza conexões do gateway WuzAPI (QR MultiZap) silenciosamente:
  // ao montar a página e a cada 30s, traz qualquer canal conectado no gateway
  // que ainda não esteja salvo localmente. Sem botão, sem toast — só funciona.
  const syncQrFn = useServerFn(syncQrConnectionsFromGateway);
  const syncPausedUntilRef = useRef(0);
  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    const run = async () => {
      if (Date.now() < syncPausedUntilRef.current) return;
      try {
        const r = await syncQrFn({ data: { workspace_id: workspaceId } });
        if (!cancelled && r.synced > 0) refresh();
      } catch {
        // silencioso — se o gateway estiver fora, não polui a UI
      }
    };
    void run();
    const id = setInterval(run, 30_000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const embedM = useMutation({
    mutationFn: (args: { code: string; mode: "new" | "migration" | "business_app"; pin?: string }) =>
      embedFn({ data: { workspaceId, code: args.code, name: "WhatsApp", mode: args.mode, pin: args.pin } }),
    onSuccess: (r) => {
      if (r.mode === "migration") {
        toast.success(`Migração concluída: ${r.displayPhoneNumber}`);
      } else {
        toast.success(`Conectado: ${r.displayPhoneNumber}`);
      }
      refresh();
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });
  const testM = useMutation({
    mutationFn: (id: string) => testFn({ data: { id } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(friendlyToastMessage(r.error ?? "Falhou"));
      if (r.mode === "qr") toast.success(`Gateway OK (${r.latency_ms ?? "?"}ms)`);
      else toast.success("Conexão OK!");
    },
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onMutate: () => {
      syncPausedUntilRef.current = Date.now() + 15_000;
    },
    onSuccess: () => {
      toast.success("Conexão removida.");
      refresh();
    },
  });
  const disconnectM = useMutation({
    mutationFn: (id: string) => disconnectFn({ data: { id } }),
    onSuccess: (r: { ok: boolean; gateway_logout_error?: string | null }) => {
      if (r?.gateway_logout_error) {
        toast.warning(
          "Marcamos como desconectado, mas o servidor WhatsApp não confirmou o logout. Se persistir, use Reconectar pra forçar QR novo.",
        );
      } else {
        toast.success("WhatsApp desconectado.");
      }
      refresh();
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });
  const forceResetM = useMutation({
    mutationFn: (id: string) => forceResetFn({ data: { id } }),
    onMutate: () => {
      // Pausa o auto-sync para o tombstone pegar antes do próximo poll.
      syncPausedUntilRef.current = Date.now() + 15_000;
    },
    onSuccess: () => {
      toast.success("Sessão antiga apagada. Abrindo assistente pra escanear QR novo…");
      refresh();
      // Abre o assistente de nova conexão; ele criará uma conexão limpa.
      setQrModalAberto(true);
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });
  const reconnectM = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      reconnectFn({ data: { connectionId: id, code } }),
    onSuccess: () => {
      toast.success("Conexão renovada! Agora a chave fica válida por mais tempo.");
      refresh();
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });
  const reapplyWebhookFn = useServerFn(reapplyQrWebhook);
  const reapplyM = useMutation({
    mutationFn: (id: string) => reapplyWebhookFn({ data: { connection_id: id } }),
    onSuccess: () => {
      toast.success("Recebimento reparado! Webhook e eventos reativados.");
      refresh();
      qc.invalidateQueries({ queryKey: ["qr-diagnostic", workspaceId] });
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  // Reconectar SESSÃO (preserva pareamento — não pede QR novo).
  // Chama /disconnect + /restart no Gateway. Confirmação no clique (UI).
  const softReconnectM = useMutation({
    mutationFn: (id: string) => softReconnectFn({ data: { id } }),
    onMutate: () => { syncPausedUntilRef.current = Date.now() + 10_000; },
    onSuccess: () => {
      toast.success("Sessão reiniciada. O WhatsApp deve voltar em alguns segundos.");
      refresh();
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });


  // Detecta o erro "can't onboard customers right now" (e variações) que
  // significa que a empresa/app na Meta ainda não está habilitada pra
  // Embedded Signup — NÃO é falha técnica do MultiZap.
  const isOnboardingBlocked = (msg: string | undefined | null) => {
    if (!msg) return false;
    const m = msg.toLowerCase();
    return (
      m.includes("can't onboard") ||
      m.includes("cannot onboard") ||
      m.includes("not able to onboard") ||
      m.includes("onboard customers")
    );
  };

  const ONBOARDING_BLOCKED_MSG =
    "Sua empresa Meta ainda não está habilitada para onboarding via Embedded Signup. " +
    "Verifique a Central de Segurança, permissões do app (whatsapp_business_management e " +
    "whatsapp_business_messaging) e a configuração de Provedor de Tecnologia no Business Manager.";

  const handleMaybeBlocked = (raw: string | undefined | null): boolean => {
    if (!isOnboardingBlocked(raw)) return false;
    toast.error(ONBOARDING_BLOCKED_MSG, { duration: 12000 });
    void logEmbeddedSignupBlocked({
      data: {
        workspaceId,
        rawMessage: raw ?? undefined,
        errorCode: "embedded_signup_onboarding_blocked",
      },
    }).catch(() => { /* log silencioso */ });
    return true;
  };

  const openMetaOAuth = async (
    _popupName: string,
    onCode: (code: string) => void,
    onErrorMsg: string,
  ) => {
    if (!settings?.embedded_ready || !settings.meta_app_id || !settings.meta_config_id) {
      toast.error("Master ainda não configurou o App da Meta. Avise o suporte.");
      return;
    }

    // Listener pra capturar eventos do Embedded Signup (cancel / erro com motivo).
    const sessionHandler = (ev: MessageEvent) => {
      if (typeof ev.origin !== "string" || !ev.origin.endsWith("facebook.com")) return;
      try {
        const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP" && data?.event === "ERROR") {
          const errMsg = data?.data?.error_message as string | undefined;
          if (handleMaybeBlocked(errMsg)) return;
          toast.error(errMsg ?? onErrorMsg);
        }
      } catch {
        /* mensagem não é JSON do embedded signup — ignora */
      }
    };
    window.addEventListener("message", sessionHandler);

    try {
      const { fbLoginWithConfig } = await import("@/lib/fb-sdk");
      const { code } = await fbLoginWithConfig(settings.meta_app_id, settings.meta_config_id);
      onCode(code);
      refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : onErrorMsg;
      if (handleMaybeBlocked(msg)) return;
      toast.error(msg);
    } finally {
      window.removeEventListener("message", sessionHandler);
    }
  };


  const startReconnect = (connectionId: string, displayName: string) => {
    toast.info(
      `Reconectando ${displayName}… autorize na janela do Facebook. Vamos salvar uma chave de longa duração.`,
    );
    void openMetaOAuth(
      "meta_reconnect",
      (code) => reconnectM.mutate({ id: connectionId, code }),
      "Falha ao reconectar pela Meta.",
    );
  };

  const startEmbedded = (mode: "new" | "migration" | "business_app", pin?: string) => {
    if (mode === "migration") {
      toast.info("Vou abrir a Meta. Se o PIN for aceito, a migração entra no número em segundos.");
    } else {
      toast.info("Concluindo... Se nada acontecer, cole o código manualmente.");
    }
    void openMetaOAuth(
      "meta_signup",
      (code) => embedM.mutate({ code, mode, pin }),
      mode === "migration" ? "Falha ao migrar pela Meta." : "Falha ao conectar pela Meta.",
    );
  };

  const isQrGatewayConn = (c: Conn) => c.provider === "wuzapi_gateway" || c.provider === "multizap_qr";
  const pendentes = (connections ?? []).filter((c) => c.status !== "connected" && !isQrGatewayConn(c));
  const ativadosAll = (connections ?? []).filter((c) => c.status === "connected" || isQrGatewayConn(c));

  // Para QR/WuzAPI só é "ativo de verdade" se o diagnóstico confirmar
  // logged_in + session_connected. Se já temos diagnóstico (não está carregando)
  // e ele indica sessão morta, a conexão vai pra "Conexões antigas / inativas".
  // Se ainda não temos diagnóstico, mantemos em ativos pra não sumir na 1ª renderização.
  const diagLoaded = !!qrDiagData && !qrDiagUnavailable;
  const isQrTrulyActive = (c: Conn) => {
    if (!isQrGatewayConn(c)) return true; // Meta: já filtrado por status
    const d = qrDiagnostics[c.id];
    if (!d) return !diagLoaded; // sem diag ainda → otimista; com diag e sem match → inativo
    return !!(d.logged_in && d.session_connected);
  };
  const ativados = ativadosAll.filter(isQrTrulyActive);
  const inativosAntigos = ativadosAll.filter((c) => !isQrTrulyActive(c));

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
      <SecurityPausedBanner workspaceId={workspaceId} />
      {/* Auto-sync silencioso roda em background — sem botão. */}



      {ativados.length === 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">O que cada status quer dizer</CardTitle>
            <CardDescription>Em linguagem simples — sem termos técnicos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <StatusLegend
              color="amber"
              title="Aguardando código"
              what="O número foi cadastrado, mas falta confirmar o código de 6 dígitos que a Meta mandou por SMS ou ligação."
              next="Clique em “Reenviar PIN” no número e digite os 6 dígitos."
            />
            <StatusLegend
              color="blue"
              title="Conectado, esperando 1ª mensagem"
              what="Tá tudo ligado certinho. Só falta alguém te mandar uma mensagem pra começar a aparecer no chat."
              next="Peça a um amigo ou cliente pra mandar um “oi” no seu WhatsApp."
            />
            <StatusLegend
              color="emerald"
              title="Recebendo mensagens"
              what="Funcionando 100%. As mensagens caem direto no seu painel em tempo real."
              next="Vá pra aba Chat e comece a atender."
            />
          </CardContent>
        </Card>
      )}

      {pendentes.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Números esperando você confirmar o código
            </CardTitle>
            <CardDescription>
              O WhatsApp já mandou um código de 6 dígitos no telefone. Se o código expirou (uns 10
              minutos), peça outro pelo botão "Reenviar PIN".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendentes.map((c) => (
              <NumberRow
                key={c.id}
                c={c}
                onResumePin={() =>
                  setResumePin({ id: c.id, name: c.display_phone_number ?? c.name })
                }
                onDiag={() => setDiagFor({ id: c.id, name: c.display_phone_number ?? c.name, provider: c.provider, gatewayConnectionId: c.phone_number_id })}
                onLogs={() => setLogsFor({ id: c.id, name: c.display_phone_number ?? c.name, provider: c.provider })}

                onDelete={() => {
                  setConfirmDel({ id: c.id, name: c.display_phone_number ?? c.name });
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {ativados.length > 0 && (
        <ConnectedChannelsSection
          connections={ativados}
          workspaceName={ws?.name}
          diagnostics={qrDiagnostics}
          diagnosticUnavailable={!!qrDiagUnavailable}
          diagnosticError={qrDiagErrorMsg}
          diagnosticRefreshing={qrDiagFetching}
          isSuperAdmin={!!isSuperAdmin}
          onRetryDiagnostic={() => qrDiagRefetch()}
          onConnectNew={() => setWizardAberto(true)}
          onTest={(id) => testM.mutate(id)}
          testingId={testM.isPending ? (testM.variables as string) : null}
          onReconnect={(c) =>
            c.onboarding_mode === "embedded"
              ? startReconnect(c.id, c.display_phone_number ?? c.name)
              : forceResetM.mutate(c.id)
          }
          onSoftReconnect={(c) => softReconnectM.mutate(c.id)}
          onDisconnect={(c) => disconnectM.mutate(c.id)}
          onReapplyWebhook={(c) => reapplyM.mutate(c.id)}
          reapplyingId={reapplyM.isPending ? (reapplyM.variables as string) : null}
          reconnectingId={
            reconnectM.isPending
              ? (reconnectM.variables?.id ?? null)
              : forceResetM.isPending
                ? (forceResetM.variables as string)
                : null
          }
          softReconnectingId={softReconnectM.isPending ? (softReconnectM.variables as string) : null}
          onDelete={(c) => {
            setConfirmDel({ id: c.id, name: c.display_phone_number ?? c.name });
          }}

        />
      )}

      {inativosAntigos.length > 0 && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Conexões antigas / inativas
            </CardTitle>
            <CardDescription>
              Estas conexões aparecem no sistema mas não estão logadas no WhatsApp.
              Reconecte ou apague se não for usar mais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectedChannelsSection
              connections={inativosAntigos}
              workspaceName={ws?.name}
              diagnostics={qrDiagnostics}
              diagnosticUnavailable={!!qrDiagUnavailable}
              diagnosticError={qrDiagErrorMsg}
              diagnosticRefreshing={qrDiagFetching}
              isSuperAdmin={!!isSuperAdmin}
              onRetryDiagnostic={() => qrDiagRefetch()}
              onConnectNew={() => setWizardAberto(true)}
              onTest={(id) => testM.mutate(id)}
              testingId={testM.isPending ? (testM.variables as string) : null}
              onReconnect={(c) =>
                c.onboarding_mode === "embedded"
                  ? startReconnect(c.id, c.display_phone_number ?? c.name)
                  : forceResetM.mutate(c.id)
              }
              onSoftReconnect={(c) => softReconnectM.mutate(c.id)}
              onDisconnect={(c) => disconnectM.mutate(c.id)}
              onReapplyWebhook={(c) => reapplyM.mutate(c.id)}
              reapplyingId={reapplyM.isPending ? (reapplyM.variables as string) : null}
              reconnectingId={
                reconnectM.isPending
                  ? (reconnectM.variables?.id ?? null)
                  : forceResetM.isPending
                    ? (forceResetM.variables as string)
                    : null
              }
              softReconnectingId={softReconnectM.isPending ? (softReconnectM.variables as string) : null}
              onDelete={(c) => {
                setConfirmDel({ id: c.id, name: c.display_phone_number ?? c.name });
              }}

            />
          </CardContent>
        </Card>
      )}



      <ConectarSection
        wizardAberto={wizardAberto}
        setWizardAberto={setWizardAberto}
        manualWizardAberto={manualWizardAberto}
        setManualWizardAberto={setManualWizardAberto}
        ativados={ativados}
        settings={settings}
        embedPending={embedM.isPending}
        startEmbedded={startEmbedded}
        workspaceId={workspaceId}
        refresh={refresh}
      />

      <WhatsAppQrConnectionModal
        open={qrModalAberto}
        onOpenChange={setQrModalAberto}
        workspaceId={workspaceId}
        onConnected={refresh}
      />


      <Dialog open={!!diagFor} onOpenChange={(v) => !v && setDiagFor(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">Diagnóstico — {diagFor?.name}</DialogTitle>
          </DialogHeader>
          {diagFor && (
            <ConnectionDiagnostic
              connectionId={diagFor.id}
              provider={diagFor.provider}
              workspaceId={workspaceId}
              gatewayConnectionId={diagFor.gatewayConnectionId}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConnectionLogsSheet
        open={!!logsFor}
        onOpenChange={(v) => !v && setLogsFor(null)}
        connectionId={logsFor?.id ?? null}
        connectionName={logsFor?.name}
        provider={logsFor?.provider}
      />


      <Dialog open={!!resumePin} onOpenChange={(v) => !v && setResumePin(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-6 w-6 text-emerald-500" /> Confirmar código
            </DialogTitle>
            <p className="text-sm font-medium text-foreground">{resumePin?.name}</p>
            <DialogDescription className="text-base leading-relaxed">
              Peça um novo código por <strong>SMS</strong> ou <strong>ligação</strong> e digite os 6
              dígitos abaixo. Enquanto não confirmar, o número fica esperando.
            </DialogDescription>
          </DialogHeader>
          {resumePin && (
            <VerifyPinPanel
              connectionId={resumePin.id}
              onDone={() => {
                setResumePin(null);
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remover este número?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block font-medium text-foreground">{confirmDel?.name}</span>
              <span className="block">
                Essa conexão será desligada e removida da sua lista. Conversas antigas continuam no
                histórico, mas você não vai mais receber nem enviar mensagens por este número até
                reconectar.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDel) delM.mutate(confirmDel.id);
                setConfirmDel(null);
              }}
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



function NumberRow({
  c,
  onResumePin,
  onTest,
  testing,
  onReconnect,
  reconnecting,
  onDiag,
  onLogs,
  onDelete,
}: {
  c: Conn;
  onResumePin?: () => void;
  onTest?: () => void;
  testing?: boolean;
  onReconnect?: () => void;
  reconnecting?: boolean;
  onDiag: () => void;
  onLogs: () => void;
  onDelete: () => void;
}) {
  const wh = whStatusBadge(c.webhookStatus);
  const [showTech, setShowTech] = useState(false);
  return (
    <div className="rounded-lg border p-3 sm:p-4 space-y-3">
      {/* Topo: avatar + número + badges */}
      <div className="flex items-start gap-3">
        {c.profile_picture_url ? (
          <img
            src={c.profile_picture_url}
            alt="Foto do perfil comercial"
            className="h-10 w-10 shrink-0 rounded-full border object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted">
            <WhatsAppIcon className="h-5 w-5 text-emerald-500" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
            <WhatsAppIcon className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="break-all">{c.display_phone_number ?? c.name}</span>
            {c.onboarding_mode === "embedded" && (
              <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-600">
                1 clique
              </span>
            )}
            {c.connection_mode === "migration" && (
              <span className={cn(
                "rounded px-2 py-0.5 text-[10px]",
                c.migration_status === "done"
                  ? "bg-emerald-500/15 text-emerald-600"
                  : c.migration_status === "failed"
                    ? "bg-red-500/15 text-red-600"
                    : "bg-amber-500/15 text-amber-700",
              )}>
                {c.migration_status === "done"
                  ? "migrado"
                  : c.migration_status === "failed"
                    ? "falhou"
                    : "migrando…"}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-medium",
                wh.cls,
              )}
            >
              <Webhook className="h-3 w-3" /> {wh.label}
            </span>
            <span className="text-muted-foreground break-words">
              {c.lastEventAt
                ? `${formatDateTimeBR(c.lastEventAt)}${c.lastSignatureValid === false ? " · ⚠ chave" : ""}`
                : "Sem atividade ainda"}
            </span>
          </div>
          {c.last_error && <FriendlyErrorBox error={c.last_error} />}
          {c.webhookStatus !== "connected" && (
            <>
              <button
                type="button"
                onClick={() => setShowTech((v) => !v)}
                className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
              >
                {showTech ? "Ocultar" : "Ver"} detalhes técnicos
              </button>
              {showTech && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
                  <span className="break-all">
                    <span className="font-medium text-foreground">WABA:</span>{" "}
                    {c.waba_id ?? "—"}
                  </span>
                  <span className="break-all">
                    <span className="font-medium text-foreground">ID do número:</span>{" "}
                    {c.phone_number_id ?? "—"}
                  </span>
                  <span>Qualidade: {c.quality_rating ?? "—"}</span>
                </div>
              )}
              <MetaSetupChecklist
                connectionId={c.id}
                webhookUrl={c.webhookUrl}
                verifyToken={c.verifyToken}
              />
            </>
          )}
        </div>
      </div>

      {/* Ações: grid 2 cols no mobile, linha no desktop */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
        {onResumePin && (
          <Button size="sm" onClick={onResumePin} className="col-span-2 bg-amber-600 hover:bg-amber-700 sm:col-span-1">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Reenviar PIN
          </Button>
        )}
        {onReconnect && (
          <Button
            size="sm"
            onClick={onReconnect}
            disabled={reconnecting}
            className="col-span-2 bg-emerald-600 hover:bg-emerald-700 sm:col-span-1"
          >
            <RefreshCw className={cn("mr-1 h-3.5 w-3.5", reconnecting && "animate-spin")} />
            {reconnecting ? "Reconectando…" : "Reconectar"}
          </Button>
        )}
        <Button size="sm" variant="outline" asChild className="sm:variant-ghost">
          <Link to="/app/canais/perfil/$connectionId" params={{ connectionId: c.id }}>
            <Settings2 className="mr-1 h-3.5 w-3.5 text-violet-500" /> Perfil
          </Link>
        </Button>
        <Button size="sm" variant="outline" onClick={onDiag}>
          <Stethoscope className="mr-1 h-3.5 w-3.5 text-blue-500" /> Diagnóstico
        </Button>
        <Button size="sm" variant="outline" onClick={onLogs}>
          <FileText className="mr-1 h-3.5 w-3.5 text-cyan-500" /> Logs
        </Button>
        {onTest && (
          <Button size="sm" variant="outline" onClick={onTest} disabled={testing}>
            <Zap className="mr-1 h-3.5 w-3.5" /> Testar
          </Button>
        )}
        <Button size="sm" variant="outline" className="text-red-500" onClick={onDelete}>
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
        </Button>
      </div>
    </div>
  );
}


function StatusLegend({
  color,
  title,
  what,
  next,
}: {
  color: "amber" | "blue" | "emerald";
  title: string;
  what: string;
  next: string;
}) {
  const map = {
    amber: { dot: "bg-amber-500", ring: "border-amber-500/40" },
    blue: { dot: "bg-blue-500", ring: "border-blue-500/40" },
    emerald: { dot: "bg-emerald-500", ring: "border-emerald-500/40" },
  }[color];
  return (
    <div className={cn("rounded-lg border bg-background p-3", map.ring)}>
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", map.dot)} />
        <p className="font-semibold text-lg">{title}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{what}</p>
      <p className="mt-2 text-xs">
        <span className="font-medium">Próximo passo:</span> {next}
      </p>
    </div>
  );
}

type MasterSettings = Awaited<ReturnType<typeof getPublicMasterSettings>>;

function ConectarSection({
  wizardAberto,
  setWizardAberto,
  manualWizardAberto,
  setManualWizardAberto,
  ativados,
  settings,
  embedPending,
  startEmbedded,
  workspaceId,
  refresh,
}: {
  wizardAberto: boolean;
  setWizardAberto: (v: boolean) => void;
  manualWizardAberto: boolean;
  setManualWizardAberto: (v: boolean) => void;
  ativados: Conn[];
  settings: MasterSettings | undefined;
  embedPending: boolean;
  startEmbedded: (mode: "new" | "migration" | "business_app", pin?: string) => void;
  workspaceId: string;
  refresh: () => void;
}) {
  if (wizardAberto) {
    return (
      <ConnectWizard
        open={wizardAberto}
        onOpenChange={setWizardAberto}
        conectando={embedPending}
        onConectar={(info) => {
          if (info.modo === "sem_numero" && info.subModo === "twilio") {
            setWizardAberto(false);
            return;
          }
          // Traduz a escolha do wizard pro modo real do backend.
          // - trocar_fornecedor => migration (exige PIN)
          // - transferir (app pro API) => business_app (Meta trata como onboarding novo)
          // - resto => new
          const mode: "new" | "migration" | "business_app" =
            info.status === "trocar_fornecedor"
              ? "migration"
              : info.status === "transferir"
                ? "business_app"
                : "new";
          setWizardAberto(false);
          startEmbedded(mode, info.pin);
        }}
      />
    );
  }

  const card = (
    <div className="space-y-4">

      {/* Painel premium de escolha: Embedded Signup (Meta) + QR Code Próprio (WuzAPI) */}
      <WhatsAppConnectChoicePanel
        workspaceId={workspaceId}
        onConnected={refresh}
        embeddedReady={!!settings?.embedded_ready}
        embeddedPending={embedPending}
        onEmbeddedSignupClick={() => setWizardAberto(true)}
      />







      {/* Opções secundárias: Embedded Signup (beta) + modo avançado */}
      {(settings?.embedded_signup_enabled || settings?.manual_mode_enabled) && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              <Settings2 className="mr-2 h-4 w-4" /> Outras opções de conexão (beta / avançado)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outras formas de conectar</CardTitle>
                <CardDescription>
                  O modo principal acima já cobre Meta Cloud API. Estas opções existem para casos específicos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {settings?.embedded_signup_enabled && (
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      onClick={() => setWizardAberto(true)}
                      disabled={!settings.embedded_ready || embedPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {embedPending ? "Conectando…" : "Embedded Signup (beta)"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Login com Facebook · requer empresa habilitada como Provedor de Tecnologia
                    </p>
                    {!settings.embedded_ready && (
                      <div className="rounded-lg border bg-amber-500/10 p-3 text-sm">
                        <div className="flex items-center gap-2 font-medium text-amber-700">
                          <AlertTriangle className="h-4 w-4" /> Aguardando configuração
                        </div>
                        <p className="text-xs text-muted-foreground">
                          O administrador da plataforma ainda não configurou o App da Meta. Avise o suporte.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {settings?.manual_mode_enabled && (
                  <div className="space-y-3">
                    <div className="rounded-lg border p-4 text-sm space-y-2">
                      <p>Cadastro técnico via PIN/SMS direto na Meta (avançado).</p>
                      <p className="text-muted-foreground">
                        Configurações extras em{" "}
                        <Link to="/app/configuracoes" className="underline">
                          Configurações
                        </Link>
                        .
                      </p>
                    </div>
                    <RegisterAndVerifyPhone workspaceId={workspaceId} onConnected={refresh} />
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

    </div>
  );

  if (ativados.length === 0) return card;
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Adicionar outro número
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">{card}</CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================
// Checklist de configuração na Meta — confirma manualmente que
// o usuário configurou Webhook URL, Verify token e eventos.
// Estado persiste no localStorage por conexão.
// ============================================================
const META_EVENTS = [
  { key: "messages", label: "messages (mensagens recebidas)" },
  { key: "message_status", label: "message_status (entregue/lido)" },
  { key: "message_template_status_update", label: "message_template_status_update (templates)" },
] as const;

type ChecklistState = {
  webhook: boolean;
  token: boolean;
  events: Record<string, boolean>;
};

function loadChecklist(id: string): ChecklistState {
  try {
    const raw = localStorage.getItem(`meta-setup:${id}`);
    if (raw) return JSON.parse(raw) as ChecklistState;
  } catch {
    // ignora
  }
  return { webhook: false, token: false, events: {} };
}

function MetaSetupChecklist({
  connectionId,
  webhookUrl,
  verifyToken,
}: {
  connectionId: string;
  webhookUrl: string;
  verifyToken: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChecklistState>(() => loadChecklist(connectionId));

  function save(next: ChecklistState) {
    setState(next);
    try {
      localStorage.setItem(`meta-setup:${connectionId}`, JSON.stringify(next));
    } catch {
      // ignora
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copiado`),
      () => toast.error("Não consegui copiar"),
    );
  }

  const eventsOk = META_EVENTS.every((e) => state.events[e.key]);
  const total = 2 + META_EVENTS.length;
  const done = (state.webhook ? 1 : 0) + (state.token ? 1 : 0) + META_EVENTS.filter((e) => state.events[e.key]).length;
  const allOk = state.webhook && state.token && eventsOk;

  return (
    <div className="mt-2 rounded-md border border-dashed bg-muted/30 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left text-xs font-medium"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className={cn("h-3.5 w-3.5", allOk ? "text-emerald-500" : "text-amber-500")} />
          Checklist de configuração na Meta
        </span>
        <span className={cn("text-[11px]", allOk ? "text-emerald-600" : "text-muted-foreground")}>
          {done}/{total} {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-xs">
          {/* Webhook URL */}
          <div className="space-y-1">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={state.webhook}
                onChange={(e) => save({ ...state, webhook: e.target.checked })}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-foreground">Webhook URL</span> configurada na Meta
              </span>
            </label>
            <div className="flex items-center gap-2 pl-6">
              <code className="flex-1 truncate rounded bg-background px-2 py-1 text-[11px]">{webhookUrl}</code>
              <Button size="sm" variant="ghost" onClick={() => copy(webhookUrl, "Webhook URL")}>
                Copiar
              </Button>
            </div>
          </div>

          {/* Verify token */}
          <div className="space-y-1">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={state.token}
                onChange={(e) => save({ ...state, token: e.target.checked })}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-foreground">Verify token</span> colado igualzinho na Meta
              </span>
            </label>
            <div className="flex items-center gap-2 pl-6">
              <code className="flex-1 truncate rounded bg-background px-2 py-1 text-[11px]">
                {verifyToken || "—"}
              </code>
              <Button
                size="sm"
                variant="ghost"
                disabled={!verifyToken}
                onClick={() => copy(verifyToken, "Verify token")}
              >
                Copiar
              </Button>
            </div>
          </div>

          {/* Eventos */}
          <div className="space-y-1">
            <p className="font-medium text-foreground">Eventos marcados na Meta</p>
            <div className="space-y-1 pl-2">
              {META_EVENTS.map((ev) => (
                <label key={ev.key} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={!!state.events[ev.key]}
                    onChange={(e) =>
                      save({ ...state, events: { ...state.events, [ev.key]: e.target.checked } })
                    }
                    className="mt-0.5"
                  />
                  <span>{ev.label}</span>
                </label>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Onde: developers.facebook.com → seu app → WhatsApp → Configuração → Webhook.
          </p>
        </div>
      )}
    </div>
  );
}
