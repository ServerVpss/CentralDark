// Diagnóstico específico de conexão WhatsApp QR (MultiZap / WuzAPI Gateway).
// NÃO mostra nada de Meta (sem token, sem phone_number_id, sem template).
// Mostra: ping do Gateway, status da sessão no Gateway, webhook, última atividade,
// e ações: reiniciar sessão, reaplicar webhook, deslogar.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  pingQrGateway,
  getQrConnectionsDiagnostic,
  reapplyQrWebhook,
  restartQrConnection,
  logoutQrConnection,
} from "@/lib/multizap-qr.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Webhook,
  LogOut,
  RotateCcw,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeBR } from "@/lib/datetime";

function StatusIcon({ status }: { status: "ok" | "warn" | "error" }) {
  if (status === "ok") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

export function QrDiagnosticPanel({
  workspaceId,
  gatewayConnectionId,
}: {
  workspaceId: string;
  gatewayConnectionId: string;
}) {
  const qc = useQueryClient();
  const pingFn = useServerFn(pingQrGateway);
  const diagFn = useServerFn(getQrConnectionsDiagnostic);
  const reapplyFn = useServerFn(reapplyQrWebhook);
  const restartFn = useServerFn(restartQrConnection);
  const logoutFn = useServerFn(logoutQrConnection);

  const ping = useQuery({
    queryKey: ["qr-gateway-ping"],
    queryFn: () => pingFn(),
    refetchInterval: 30_000,
  });

  const diag = useQuery({
    queryKey: ["qr-diag", workspaceId],
    queryFn: () => diagFn({ data: { workspace_id: workspaceId } }),
    refetchInterval: 30_000,
  });

  const thisConn = diag.data?.connections?.find((c) => c.connection_id === gatewayConnectionId);

  const restartM = useMutation({
    mutationFn: () => restartFn({ data: { connection_id: gatewayConnectionId } }),
    onSuccess: () => {
      toast.success("Sessão reiniciada.");
      qc.invalidateQueries({ queryKey: ["qr-diag", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reapplyM = useMutation({
    mutationFn: () => reapplyFn({ data: { connection_id: gatewayConnectionId } }),
    onSuccess: () => {
      toast.success("Webhook reaplicado.");
      qc.invalidateQueries({ queryKey: ["qr-diag", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const logoutM = useMutation({
    mutationFn: () => logoutFn({ data: { connection_id: gatewayConnectionId } }),
    onSuccess: () => {
      toast.success("Sessão deslogada.");
      qc.invalidateQueries({ queryKey: ["qr-diag", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Status geral
  const gatewayOk = ping.data?.reachable === true;
  const sessionOk = !!thisConn?.session_connected && !!thisConn?.logged_in;
  const webhookOk = !!thisConn?.webhook_configured && !!thisConn?.events_configured;
  const overall =
    !gatewayOk ? "error"
    : !sessionOk ? "warn"
    : !webhookOk ? "warn"
    : "ok";

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className={`rounded-lg border p-3 text-sm ${
        overall === "ok" ? "bg-emerald-500/10 border-emerald-500/30"
        : overall === "warn" ? "bg-amber-500/10 border-amber-500/30"
        : "bg-red-500/10 border-red-500/30"
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">
            {overall === "ok" ? "✅ Tudo funcionando"
            : overall === "warn" ? "⚠️ Atenção"
            : "❌ Gateway fora do ar"}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              ping.refetch();
              diag.refetch();
            }}
            disabled={ping.isFetching || diag.isFetching}
          >
            {(ping.isFetching || diag.isFetching)
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="ml-1">Testar agora</span>
          </Button>
        </div>
      </div>

      {/* Card Gateway */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-4 w-4" /> Gateway MultiZap
          </CardTitle>
          <CardDescription>Servidor que faz a ponte com o WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-3 rounded border p-3">
            <StatusIcon status={gatewayOk ? "ok" : "error"} />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {gatewayOk ? "Gateway online" : "Gateway inacessível"}
              </div>
              <div className="text-xs text-muted-foreground">
                {gatewayOk
                  ? `Resposta em ${ping.data?.latency_ms ?? "?"}ms`
                  : (ping.data?.error?.message ?? "Sem resposta do servidor.")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Sessão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sessão do WhatsApp</CardTitle>
          <CardDescription>Status do número no servidor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {diag.isLoading && (
            <div className="text-sm text-muted-foreground">Verificando…</div>
          )}
          {!diag.isLoading && !thisConn && diag.data?.gateway_available && (
            <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              Esta conexão não está mais na lista do Gateway. Tente reiniciar a sessão.
            </div>
          )}
          {!diag.isLoading && !diag.data?.gateway_available && (
            <div className="rounded border border-red-500/30 bg-red-500/5 p-3 text-sm">
              Gateway indisponível agora. Tente novamente em alguns segundos.
            </div>
          )}
          {thisConn && (
            <>
              <div className="flex items-start gap-3 rounded border p-3">
                <StatusIcon status={sessionOk ? "ok" : "warn"} />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {sessionOk ? "Sessão ativa e logada" : "Sessão não está ativa"}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1">
                    <span>Conectada: <Badge variant={thisConn.session_connected ? "default" : "secondary"}>{thisConn.session_connected ? "sim" : "não"}</Badge></span>
                    <span>Logada: <Badge variant={thisConn.logged_in ? "default" : "secondary"}>{thisConn.logged_in ? "sim" : "não"}</Badge></span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded border p-3">
                <StatusIcon status={webhookOk ? "ok" : "warn"} />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {webhookOk ? "Webhook configurado" : "Webhook pendente"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {thisConn.events.length > 0
                      ? `Eventos: ${thisConn.events.join(", ")}`
                      : "Nenhum evento assinado."}
                  </div>
                  {thisConn.last_webhook_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Último evento: {formatDateTimeBR(thisConn.last_webhook_at)}
                      {thisConn.last_webhook_kind ? ` (${thisConn.last_webhook_kind})` : ""}
                    </div>
                  )}
                  {thisConn.error && (
                    <div className="text-xs text-red-600 mt-1">{thisConn.error}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações</CardTitle>
          <CardDescription>Reiniciar sessão, reaplicar webhook, deslogar.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => restartM.mutate()}
            disabled={restartM.isPending}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            {restartM.isPending ? "Reiniciando…" : "Reiniciar sessão"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => reapplyM.mutate()}
            disabled={reapplyM.isPending}
          >
            <Webhook className="mr-1 h-3.5 w-3.5" />
            {reapplyM.isPending ? "Aplicando…" : "Reaplicar webhook"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => logoutM.mutate()}
            disabled={logoutM.isPending}
          >
            <LogOut className="mr-1 h-3.5 w-3.5" />
            {logoutM.isPending ? "Deslogando…" : "Deslogar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
