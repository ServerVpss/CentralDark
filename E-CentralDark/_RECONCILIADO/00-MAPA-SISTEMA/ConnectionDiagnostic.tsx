import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  diagnoseWhatsAppConnection,
  listConnectionWebhookEvents,
  adminSubscribeWebhookOnMeta,
  adminSendTestMessage,
  testWhatsAppConnection,
  updateMetaCredentials,
} from "@/lib/whatsapp.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CheckCircle2, AlertTriangle, XCircle, Copy, Send, RefreshCw, Loader2, Info, KeyRound, Save, ShieldAlert, ExternalLink } from "lucide-react";
import { WabaWebhookAssistant } from "@/components/whatsapp/WabaWebhookAssistant";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";
import { classifyWebhookEvent, eventLabel, eventDescription, LEVEL_BADGE, LEVEL_TEXT } from "@/lib/webhook-event-style";
import { LoadingDots } from "@/components/ui/loading-dots";
import { QrDiagnosticPanel } from "@/components/whatsapp/QrDiagnosticPanel";

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado`));
}

function StatusIcon({ status }: { status: "ok" | "warn" | "error" }) {
  if (status === "ok") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

// Roteador: detecta o tipo de conexão (Meta Cloud vs MultiZap QR) e renderiza
// o painel correto. Conexões QR mostram o QrDiagnosticPanel (sem nada de Meta).
export function ConnectionDiagnostic({
  connectionId,
  isMaster = false,
  provider,
  workspaceId,
  gatewayConnectionId,
}: {
  connectionId: string;
  isMaster?: boolean;
  provider?: string | null;
  workspaceId?: string;
  gatewayConnectionId?: string | null;
}) {
  const p = (provider ?? "").toLowerCase();
  const isQr = p === "wuzapi_gateway" || p === "multizap_qr";
  if (isQr && workspaceId && gatewayConnectionId) {
    return (
      <QrDiagnosticPanel
        workspaceId={workspaceId}
        gatewayConnectionId={gatewayConnectionId}
      />
    );
  }
  return <MetaDiagnosticPanel connectionId={connectionId} isMaster={isMaster} />;
}

function MetaDiagnosticPanel({
  connectionId,
  isMaster = false,
}: {
  connectionId: string;
  isMaster?: boolean;
}) {

  const qc = useQueryClient();
  const diagnoseFn = useServerFn(diagnoseWhatsAppConnection);
  const eventsFn = useServerFn(listConnectionWebhookEvents);
  const subscribeFn = useServerFn(adminSubscribeWebhookOnMeta);
  const sendFn = useServerFn(adminSendTestMessage);
  const refreshFn = useServerFn(testWhatsAppConnection);
  const updateCredsFn = useServerFn(updateMetaCredentials);
  const [testTo, setTestTo] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const diag = useQuery({
    queryKey: ["wa-diag", connectionId],
    queryFn: () => diagnoseFn({ data: { id: connectionId } }),
    refetchInterval: 60_000,
  });

  // Avisa uma única vez quando o webhook é registrado automaticamente na Meta.
  const notifiedAutoRef = useRef(false);
  useEffect(() => {
    if (diag.data?.autoSubscribed && !notifiedAutoRef.current) {
      notifiedAutoRef.current = true;
      toast.success("Webhook registrado na Meta automaticamente!", {
        description: "Esta conexão já está pronta pra receber mensagens.",
        duration: 6000,
      });
    }
  }, [diag.data?.autoSubscribed]);

  const events = useQuery({
    queryKey: ["wa-events", connectionId],
    queryFn: () => eventsFn({ data: { connectionId, limit: 20 } }),
    refetchInterval: 30_000,
  });

  const subscribeM = useMutation({
    mutationFn: () => subscribeFn({ data: { id: connectionId } }),
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("Webhook registrado na Meta!");
        qc.invalidateQueries({ queryKey: ["wa-diag", connectionId] });
      } else {
        toast.error(friendlyToastMessage(r.error ?? "Falhou"));
      }
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  const refreshM = useMutation({
    mutationFn: () => refreshFn({ data: { id: connectionId } }),
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("Dados atualizados da Meta.");
        qc.invalidateQueries({ queryKey: ["wa-diag", connectionId] });
      } else toast.error(friendlyToastMessage(r.error ?? "Falhou"));
    },
  });

  const sendM = useMutation({
    mutationFn: () =>
      sendFn({
        data: {
          connectionId,
          to: testTo.replace(/\D/g, ""),
          templateName: "hello_world",
          templateLang: "en_US",
        },
      }),
    onSuccess: (r) => {
      if (r.ok) toast.success("Template enviado! Verifique o WhatsApp.");
      else toast.error(friendlyToastMessage(r.message ?? "Falhou"));
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  const saveCredsM = useMutation({
    mutationFn: () =>
      updateCredsFn({
        data: {
          id: connectionId,
          ...(appSecret.trim() ? { app_secret: appSecret.trim() } : {}),
          ...(accessToken.trim() ? { access_token: accessToken.trim() } : {}),
        },
      }),
    onSuccess: () => {
      toast.success("Credenciais salvas! Agora as mensagens da Meta vão ser aceitas.");
      setAppSecret("");
      setAccessToken("");
      qc.invalidateQueries({ queryKey: ["wa-diag", connectionId] });
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });


  const d = diag.data;

  return (
    <div className="space-y-4">
      {/* Resumo geral */}
      {d && (
        <div className={`rounded-lg border p-3 text-sm ${
          d.overall === "ok" ? "bg-emerald-500/10 border-emerald-500/30"
          : d.overall === "warn" ? "bg-amber-500/10 border-amber-500/30"
          : "bg-red-500/10 border-red-500/30"
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {d.overall === "ok" ? "✅ Tudo funcionando" : d.overall === "warn" ? "⚠️ Atenção" : "❌ Problemas detectados"}
              {" "}({d.okCount}/{d.total} OK)
            </span>
            <Button size="sm" variant="ghost" onClick={() => diag.refetch()} disabled={diag.isFetching}>
              {diag.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="ml-1">Testar agora</span>
            </Button>
          </div>
        </div>
      )}

      {/* Card Credenciais da Meta — App Secret é OPCIONAL.
          Sem App Secret = modo compatível (aviso amarelo discreto).
          Com App Secret salvo = card recolhido em verde. */}
      {d && !d.hasAppSecret ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-500" />
              App Secret (opcional)
            </CardTitle>
            <CardDescription>
              Não configurado. O MultiZap está operando em <strong>modo compatível</strong> — as mensagens da Meta estão sendo aceitas validando ID da conexão, verify token, phone_number_id e waba_id.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm flex gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-amber-300">Quer segurança máxima?</div>
                <div className="text-xs text-amber-300/80 mt-0.5">
                  Adicione o App Secret abaixo. Com ele, o MultiZap valida a assinatura criptográfica de cada mensagem que chega da Meta.
                </div>
              </div>
            </div>

            {/* Passo a passo */}
            <details className="rounded-md border border-emerald-500/30 bg-background/40">
              <summary className="cursor-pointer p-3 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                Como pegar o App Secret na Meta
              </summary>
              <ol className="space-y-2 text-sm p-3 pt-0">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">1</span>
                  <span>
                    Abra{" "}
                    <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1">
                      developers.facebook.com <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    e entre no seu app do WhatsApp.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">2</span>
                  <span>No menu da esquerda, vai em <strong>Configurações → Básico</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">3</span>
                  <span>Procura <strong>"Chave Secreta do App"</strong> e clica em <strong>Mostrar</strong> (vai pedir sua senha do Facebook).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">4</span>
                  <span>Copia o valor e cola aqui embaixo no campo <strong>App Secret</strong>.</span>
                </li>
              </ol>
            </details>

            <CredentialFields
              d={d}
              appSecret={appSecret}
              setAppSecret={setAppSecret}
              accessToken={accessToken}
              setAccessToken={setAccessToken}
              onSave={() => saveCredsM.mutate()}
              saving={saveCredsM.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <details className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 group">
          <summary className="flex cursor-pointer items-center justify-between gap-2 p-3 text-sm">
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">App Secret salvo — validação criptográfica ativa</span>
              <span className="text-emerald-400 text-xs">✓</span>
            </span>
            <span className="text-xs text-muted-foreground group-open:hidden">Trocar</span>
            <span className="text-xs text-muted-foreground hidden group-open:inline">Fechar</span>
          </summary>
          <div className="border-t border-emerald-500/20 p-3">
            {d && (
              <CredentialFields
                d={d}
                appSecret={appSecret}
                setAppSecret={setAppSecret}
                accessToken={accessToken}
                setAccessToken={setAccessToken}
                onSave={() => saveCredsM.mutate()}
                saving={saveCredsM.isPending}
              />
            )}
          </div>
        </details>
      )}

      {/* Assistente WABA — recolhido por padrão (só interessa se algo der ruim) */}
      <details className="rounded-lg border bg-card group">
        <summary className="flex cursor-pointer items-center justify-between gap-2 p-3 text-sm">
          <span className="font-medium">Assistente de WABA e webhook</span>
          <span className="text-xs text-muted-foreground group-open:hidden">Abrir</span>
          <span className="text-xs text-muted-foreground hidden group-open:inline">Fechar</span>
        </summary>
        <div className="border-t p-3">
          <WabaWebhookAssistant connectionId={connectionId} />
        </div>
      </details>


      {/* Card 1: URL e Token */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">URL e Token do Webhook</CardTitle>
          <CardDescription>Use no painel da Meta se precisar reconfigurar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">URL do webhook</div>
            <div className="flex gap-2">
              <Input readOnly value={d?.webhookUrl ?? "—"} className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={() => copy(d?.webhookUrl ?? "", "URL")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Verify Token</div>
            <div className="flex gap-2">
              <Input readOnly value={d?.verifyToken ?? "—"} className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={() => copy(d?.verifyToken ?? "", "Token")}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orientação Meta — recolhida por padrão. Útil só quando algo não chega. */}
      <details className="rounded-lg border border-amber-500/30 bg-amber-500/5 group">
        <summary className="flex cursor-pointer items-center justify-between gap-2 p-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Info className="h-4 w-4 text-amber-500" />
            Não está recebendo? Como verificar na Meta
          </span>
          <span className="text-xs text-muted-foreground group-open:hidden">Abrir</span>
          <span className="text-xs text-muted-foreground hidden group-open:inline">Fechar</span>
        </summary>
        <div className="border-t border-amber-500/20 p-3 space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">
            O webhook do WhatsApp é configurado <strong>por WABA</strong> (Conta do WhatsApp Business), não por número.
            Se outro app já estiver usando essa WABA, as mensagens vão pra lá em vez de chegar aqui.
          </p>
          <div>
            <div className="font-medium mb-1">Passo a passo pra apontar pra cá:</div>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Abra o <strong>Meta for Developers</strong> → seu app do MultiZap → <strong>WhatsApp</strong> → <strong>Configuração</strong>.</li>
              <li>Em <strong>Webhook</strong>, clique em <strong>Editar</strong> e cole a URL e o Verify Token mostrados acima.</li>
              <li>Em <strong>Campos do webhook</strong>, assine pelo menos <code>messages</code> (e <code>message_status_update</code> se quiser status de entrega).</li>
            </ol>
          </div>
          <div className="rounded border border-amber-500/30 bg-background/50 p-2 text-xs">
            ⚠️ Se essa mesma WABA já estiver registrada em outro app, você precisa
            <strong> remover o webhook de lá</strong> ou aceitar que os dois apps vão receber cópia (a Meta permite, mas duplica eventos).
          </div>
        </div>
      </details>


      {/* Card 2: Saúde */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Saúde da Conexão</CardTitle>
          <CardDescription>Quatro verificações em tempo real.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {diag.isLoading && <div className="text-sm text-muted-foreground">Verificando…</div>}
          {d?.checks.map((c) => (
            <div key={c.key} className="flex items-start gap-3 rounded border p-3">
              <StatusIcon status={c.status} />
              <div className="flex-1">
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.detail}</div>
              </div>
            </div>
          ))}
          {isMaster && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => refreshM.mutate()} disabled={refreshM.isPending}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Recarregar dados da Meta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Teste de envio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Teste de Envio</CardTitle>
          <CardDescription>Manda o template oficial <code>hello_world</code> pra confirmar que envio funciona.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="55 84 99999-9999"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
            />
            <Button onClick={() => sendM.mutate()} disabled={sendM.isPending || testTo.replace(/\D/g, "").length < 10}>
              <Send className="mr-1 h-3.5 w-3.5" />
              {sendM.isPending ? "Enviando…" : "Enviar"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use seu próprio número. O template <code>hello_world</code> é gratuito e oficial da Meta.
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Eventos recentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Últimos eventos do Webhook</CardTitle>
          <CardDescription>Tudo que a Meta enviou pra esta conexão.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.isLoading && <div className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>}
          {events.data && events.data.length === 0 && (
            <div className="rounded border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              Nenhum evento ainda. Envie uma mensagem pro número conectado pra ver aparecer aqui.
            </div>
          )}
          {events.data && events.data.length > 0 && (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {events.data.map((e) => {
                const level = classifyWebhookEvent(e.event_type, e.status_code);
                const desc = eventDescription(e.event_type);
                return (
                  <div key={e.id} className="flex items-start gap-2 rounded border p-2 text-xs">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${LEVEL_BADGE[level]}`}>
                      {eventLabel(e.event_type)}
                    </span>
                    <span className="text-muted-foreground">{e.http_method}</span>
                    <span className={LEVEL_TEXT[level]}>{e.status_code}</span>
                    {desc && <span className="text-muted-foreground truncate" title={desc}>{desc}</span>}
                    {e.error && level === "error" && <span className="text-red-600 truncate" title={e.error}>{e.error}</span>}
                    <span className="ml-auto whitespace-nowrap text-muted-foreground">{formatDateTimeBR(e.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Campos de App Secret / Access Token reaproveitados nos dois modos do card
// de credenciais (faltando vs. já salvo).
function CredentialFields({
  d,
  appSecret,
  setAppSecret,
  accessToken,
  setAccessToken,
  onSave,
  saving,
}: {
  d: { hasAppSecret: boolean; phoneNumberId?: string };
  appSecret: string;
  setAppSecret: (v: string) => void;
  accessToken: string;
  setAccessToken: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-foreground/80 mb-1 block">
          App Secret {d.hasAppSecret && <span className="text-emerald-400">✓ salvo</span>}
        </label>
        <Input
          type="password"
          placeholder={d.hasAppSecret ? "•••••••• (cole aqui só pra trocar)" : "Cole o App Secret da Meta aqui"}
          value={appSecret}
          onChange={(e) => setAppSecret(e.target.value)}
          className="font-mono text-xs"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground/80 mb-1 block">
          Access Token <span className="text-muted-foreground">(opcional — só se precisar trocar)</span>
        </label>
        <Input
          type="password"
          placeholder="Deixe vazio pra manter o atual"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          className="font-mono text-xs"
          autoComplete="off"
        />
      </div>

      {d.phoneNumberId && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Phone Number ID (só conferência)
          </label>
          <Input readOnly value={d.phoneNumberId} className="font-mono text-xs bg-muted/30" />
        </div>
      )}

      <Button
        onClick={onSave}
        disabled={saving || (!appSecret.trim() && !accessToken.trim())}
        className="w-full"
      >
        <Save className="mr-1.5 h-4 w-4" />
        {saving ? "Salvando…" : "Salvar credenciais"}
      </Button>
    </div>
  );
}
