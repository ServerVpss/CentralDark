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
  onSoftReconnect?: (c: ChannelConnection) => void;
  onDisconnect?: (c: ChannelConnection) => void;
  onReapplyWebhook?: (c: ChannelConnection) => void;
  onDelete: (c: ChannelConnection) => void;
  testingId?: string | null;
  reconnectingId?: string | null;
  softReconnectingId?: string | null;
  reapplyingId?: string | null;
}) {

  const summary = useMemo(() => {
    const total = connections.length;
    let connected = 0;
    let waitingQr = 0;
    let withError = 0;
    for (const c of connections) {
      const s = resolveStatus(c, diagnostics?.[c.id]);
      if (s === "connected" || s === "waiting_first") connected++;
      else if (s === "waiting_qr") waitingQr++;
      else if (s === "error" || s === "disconnected" || s === "needs_reconnect") withError++;
    }
    return { total, connected, waitingQr, withError };
  }, [connections, diagnostics]);

  return (
    <section className="space-y-4">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground sm:text-2xl">
            Seus canais conectados
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja qual canal está ativo, o provedor usado e o método de conexão.
          </p>
        </div>
        <Button
          onClick={onConnectNew}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Conectar novo canal
        </Button>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:grid-cols-4 sm:p-4">
        <SummaryStat
          icon={<Radio className="h-5 w-5" />}
          label="Total de canais"
          value={summary.total}
          tone="emerald"
        />
        <SummaryStat
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Conectados"
          value={summary.connected}
          pct={pct(summary.connected, summary.total)}
          tone="emerald"
        />
        <SummaryStat
          icon={<QrIcon className="h-5 w-5" />}
          label="Aguardando QR"
          value={summary.waitingQr}
          pct={pct(summary.waitingQr, summary.total)}
          tone="amber"
        />
        <SummaryStat
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Com erro"
          value={summary.withError}
          pct={pct(summary.withError, summary.total)}
          tone="rose"
        />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {connections.map((c) => (
          <ConnectedChannelCard
            key={c.id}
            c={c}
            workspaceName={workspaceName ?? "—"}
            diagnostic={diagnostics?.[c.id]}
            diagnosticUnavailable={diagnosticUnavailable}
            diagnosticError={diagnosticError ?? null}
            diagnosticRefreshing={diagnosticRefreshing}
            isSuperAdmin={isSuperAdmin}
            onRetryDiagnostic={onRetryDiagnostic}
            onTest={onTest ? () => onTest(c.id) : undefined}
            testing={testingId === c.id}
            onReconnect={onReconnect ? () => onReconnect(c) : undefined}
            onSoftReconnect={onSoftReconnect ? () => onSoftReconnect(c) : undefined}
            onDisconnect={onDisconnect ? () => onDisconnect(c) : undefined}
            onReapplyWebhook={onReapplyWebhook ? () => onReapplyWebhook(c) : undefined}
            reapplying={reapplyingId === c.id}
            reconnecting={reconnectingId === c.id}
            softReconnecting={softReconnectingId === c.id}
            onDelete={() => onDelete(c)}

          />
        ))}
      </div>

      <p className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Seus dados estão protegidos com criptografia de ponta a ponta.
      </p>
    </section>
  );
}

function pct(n: number, total: number) {
  if (!total) return null;
  return Math.round((n / total) * 100);
}

// ---------- Stat card do topo ----------
function SummaryStat({
  icon,
  label,
  value,
  pct,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  pct?: number | null;
  tone: "emerald" | "amber" | "rose";
}) {
  const toneCls = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    rose: "bg-rose-500/10 text-rose-500",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneCls)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold leading-none text-foreground">{value}</p>
          {pct != null && (
            <span className="text-xs text-muted-foreground">{pct}%</span>
          )}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ---------- Card individual ----------
function ConnectedChannelCard({
  c,
  workspaceName,
  diagnostic,
  diagnosticUnavailable,
  diagnosticError,
  diagnosticRefreshing,
  isSuperAdmin,
  onRetryDiagnostic,
  onTest,
  testing,
  onReconnect,
  onSoftReconnect,
  onDisconnect,
  reconnecting,
  softReconnecting,
  onReapplyWebhook,
  reapplying,
  onDelete,
}: {
  c: ChannelConnection;
  workspaceName: string;
  diagnostic?: QrDiagnostic;
  diagnosticUnavailable?: boolean;
  diagnosticError?: string | null;
  diagnosticRefreshing?: boolean;
  isSuperAdmin?: boolean;
  onRetryDiagnostic?: () => void;
  onTest?: () => void;
  testing?: boolean;
  onReconnect?: () => void;
  onSoftReconnect?: () => void;
  onDisconnect?: () => void;
  reconnecting?: boolean;
  softReconnecting?: boolean;
  onReapplyWebhook?: () => void;
  reapplying?: boolean;
  onDelete: () => void;
}) {

  const provider = resolveProvider(c);
  const method = resolveMethod(c);
  const status = resolveStatus(c, diagnostic);
  const phone = c.display_phone_number ?? c.phone ?? "—";
  const isQr = provider === "multizap_qr";
  const eventsMissing = !!(isQr && diagnostic && (!diagnostic.events_configured || diagnostic.events.length === 0));
  // Mostra fallback quando: é QR, não tem diagnóstico carregado e o gateway
  // sinalizou indisponível (404/500/timeout). Some sozinho assim que voltar.
  const showDiagFallback = isQr && !diagnostic && !!diagnosticUnavailable;
  const [diagOpen, setDiagOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);


  return (
    <article
      className={cn(
        "rounded-2xl border bg-card/60 p-4 shadow-sm transition-colors sm:p-5",
        status === "connected" && "border-emerald-500/30",
        status === "waiting_first" && "border-amber-500/30",
        status === "waiting_qr" && "border-amber-500/30",
        status === "needs_reconnect" && "border-amber-500/40",
        status === "error" && "border-rose-500/40",
        status === "disconnected" && "border-border",
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
        {/* Avatar coluna esquerda no desktop, topo no mobile */}
        <div className="flex items-center gap-3 lg:flex-col lg:items-center lg:gap-2">
          <div className="relative">
            {c.profile_picture_url ? (
              <img
                src={c.profile_picture_url}
                alt=""
                className="h-16 w-16 rounded-full border border-border object-cover lg:h-20 lg:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 lg:h-20 lg:w-20">
                <WhatsAppIcon className="h-9 w-9 text-emerald-500 lg:h-11 lg:w-11" />
              </div>
            )}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card",
                status === "connected" && "bg-emerald-500",
                status === "waiting_first" && "bg-amber-400",
                status === "waiting_qr" && "bg-amber-400",
                status === "needs_reconnect" && "bg-amber-500",
                status === "error" && "bg-rose-500",
                status === "disconnected" && "bg-muted-foreground",
              )}
            />
          </div>
          <div className="min-w-0 flex-1 lg:text-center">
            <p className="truncate font-mono text-sm font-semibold text-foreground lg:text-base">
              {phone}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground lg:justify-center">
              {c.name}
              <Settings2 className="h-3 w-3 opacity-60" />
            </p>
          </div>
        </div>

        {/* Bloco central */}
        <div className="min-w-0 space-y-4">
          {/* Linha de badges + status + menu */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="emerald" icon={<WhatsAppIcon className="h-3.5 w-3.5" />}>
                WhatsApp
              </Badge>
              <ProviderBadge provider={provider} />
              <MethodBadge method={method} />
            </div>
            <div className="flex items-start gap-2">
              <StatusBadge status={status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/app/canais/perfil/$connectionId" params={{ connectionId: c.id }}>
                      <Settings2 className="mr-2 h-3.5 w-3.5" /> Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={onDelete}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-background/40 p-3 sm:grid-cols-3 lg:grid-cols-6">
            <Info label="Canal" value="WhatsApp" icon={<WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />} />
            <Info
              label="Provedor"
              value={provider === "meta" ? "Meta Cloud API" : "MultiZap QR"}
              icon={
                provider === "meta" ? (
                  <MetaLogo className="h-3.5 w-3.5 text-blue-400" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                )
              }
            />
            <Info
              label="Método"
              value={method === "embedded" ? "Embedded Signup" : "QR Code"}
              icon={
                method === "embedded" ? (
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                ) : (
                  <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                )
              }
            />
            <Info
              label="Última atividade"
              value={c.lastEventAt ? formatDateTimeBR(c.lastEventAt) : "—"}
              dot={c.lastEventAt ? "emerald" : "muted"}
            />
            <Info label="Workspace" value={workspaceName} />
            <Info label="Número" value={phone} mono />
          </div>

          {/* Alerta de recebimento desativado (apenas QR/WuzAPI) */}
          {isQr && eventsMissing && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div className="min-w-0">
                <p className="font-medium text-rose-200">Recebimento desativado</p>
                <p className="text-xs text-rose-300/90">
                  Os eventos do WhatsApp estão vazios. Clique em <span className="font-semibold">Reparar recebimento</span> para reativar sem perder a sessão.
                </p>
              </div>
            </div>
          )}

          {/* Fallback amigável: gateway sem /__diag/wuzapi (404/500/timeout).
              Some sozinho quando o diagnóstico voltar a chegar. */}
          {showDiagFallback && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-amber-200">
                    Diagnóstico indisponível no momento
                  </p>
                  <p className="mt-0.5 text-xs text-amber-100/80">
                    O Gateway ainda não retornou dados de diagnóstico. Rode o deploy da VPS ou tente novamente em instantes.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetryDiagnostic}
                      disabled={!onRetryDiagnostic || !!diagnosticRefreshing}
                    >
                      <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", diagnosticRefreshing && "animate-spin")} />
                      Tentar novamente
                    </Button>
                    {onReapplyWebhook && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onReapplyWebhook}
                        disabled={!!reapplying}
                      >
                        <Webhook className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                        Reparar recebimento
                      </Button>
                    )}
                    {onReconnect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onReconnect}
                        disabled={!!reconnecting}
                      >
                        <QrCode className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                        Reconectar com QR novo
                      </Button>
                    )}
                  </div>
                  {isSuperAdmin && diagnosticError && (
                    <div className="mt-3 rounded-lg border border-border/60 bg-background/40">
                      <button
                        type="button"
                        onClick={() => setTechOpen((v) => !v)}
                        className="flex w-full items-center justify-between px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <span>Ver detalhes técnicos (super admin)</span>
                        <span className="opacity-70">{techOpen ? "Ocultar" : "Abrir"}</span>
                      </button>
                      {techOpen && (
                        <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all border-t border-border/60 px-2.5 py-2 text-[11px] text-muted-foreground">
                          {diagnosticError}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Diagnóstico recolhido (apenas QR/WuzAPI com dados disponíveis) */}
          {isQr && diagnostic && (
            <div className="rounded-xl border border-border/60 bg-background/40">
              <button
                type="button"
                onClick={() => setDiagOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <span className="flex flex-wrap items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-foreground">Recebimento:</span>
                  <DiagBadge ok={diagnostic.session_connected} label="WhatsApp" />
                  <DiagBadge ok={diagnostic.webhook_configured} label="Webhook" />
                  <DiagBadge
                    ok={diagnostic.events_configured && diagnostic.events.length > 0}
                    label="Eventos"
                  />
                </span>
                <span className="opacity-70">{diagOpen ? "Ocultar" : "Ver diagnóstico"}</span>
              </button>
              {diagOpen && (
                <div className="space-y-2 border-t border-border/60 px-3 py-3 text-xs">
                  <DiagRow label="Status WhatsApp" value={diagnostic.session_connected ? "Conectado" : "Desconectado"} tone={diagnostic.session_connected ? "emerald" : "rose"} />
                  <DiagRow label="Logado" value={diagnostic.logged_in ? "Sim" : "Não"} tone={diagnostic.logged_in ? "emerald" : "amber"} />
                  <DiagRow label="Webhook configurado" value={diagnostic.webhook_configured ? "Sim" : "Não"} tone={diagnostic.webhook_configured ? "emerald" : "rose"} />
                  <DiagRow
                    label="Eventos configurados"
                    value={diagnostic.events_configured && diagnostic.events.length > 0 ? "Sim" : "Não"}
                    tone={diagnostic.events_configured && diagnostic.events.length > 0 ? "emerald" : "rose"}
                  />
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Eventos ativos</p>
                    {diagnostic.events.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {diagnostic.events.map((ev) => (
                          <span key={ev} className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
                            {ev}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-rose-300">Nenhum — use "Reparar recebimento".</p>
                    )}
                  </div>
                  <DiagRow
                    label="Último webhook recebido"
                    value={diagnostic.last_webhook_at ? `${formatDateTimeBR(diagnostic.last_webhook_at)}${diagnostic.last_webhook_kind ? ` (${diagnostic.last_webhook_kind})` : ""}` : "—"}
                    tone={diagnostic.last_webhook_at ? "emerald" : "muted"}
                  />
                  <DiagRow
                    label="Última mensagem recebida"
                    value={c.lastEventAt ? formatDateTimeBR(c.lastEventAt) : "—"}
                    tone={c.lastEventAt ? "emerald" : "muted"}
                  />
                  {diagnostic.error && (
                    <DiagRow label="Último erro" value={diagnostic.error} tone="rose" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/canais/perfil/$connectionId" params={{ connectionId: c.id }}>
                <Settings2 className="mr-1.5 h-3.5 w-3.5 text-violet-500" /> Perfil
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/canais/perfil/$connectionId" params={{ connectionId: c.id }} search={{ tab: "diagnostico" } as any}>
                <Stethoscope className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> Diagnóstico
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/canais/perfil/$connectionId" params={{ connectionId: c.id }} search={{ tab: "logs" } as any}>
                <FileText className="mr-1.5 h-3.5 w-3.5 text-cyan-500" /> Logs
              </Link>
            </Button>
            {onTest && (
              <Button variant="outline" size="sm" onClick={onTest} disabled={testing}>
                <Zap className={cn("mr-1.5 h-3.5 w-3.5 text-amber-500", testing && "animate-pulse")} /> Testar
              </Button>
            )}
            {isQr && onSoftReconnect && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined" && !window.confirm("Reconectar a sessão? Vai derrubar e religar essa conexão em alguns segundos — sem precisar escanear QR novo.")) return;
                  onSoftReconnect();
                }}
                disabled={softReconnecting}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                title="Reinicia a sessão preservando o pareamento. Não pede QR novo."
              >
                <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", softReconnecting && "animate-spin")} /> {softReconnecting ? "Reconectando…" : "Reconectar sessão"}
              </Button>
            )}
            {onReconnect ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onReconnect}
                disabled={reconnecting}
                className="text-emerald-500 hover:text-emerald-400"
                title={isQr ? "Reset completo: faz logout, apaga a sessão antiga e gera QR novo." : "Renova a sessão pela Meta."}
              >
                <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", reconnecting && "animate-spin")} /> {isQr ? "Trocar pra QR novo" : "Reconectar"}
              </Button>
            ) : null}

            {provider === "multizap_qr" && onDisconnect && (status === "connected" || status === "waiting_first") && (
              <Button variant="outline" size="sm" onClick={onDisconnect} className="text-amber-500 hover:text-amber-400">
                <Smartphone className="mr-1.5 h-3.5 w-3.5" /> Desconectar
              </Button>
            )}
            {provider === "multizap_qr" && onReapplyWebhook && (
              <Button
                variant={eventsMissing ? "default" : "outline"}
                size="sm"
                onClick={onReapplyWebhook}
                disabled={reapplying}
                className={cn(
                  eventsMissing
                    ? "bg-rose-600 text-white hover:bg-rose-500"
                    : "text-cyan-500 hover:text-cyan-400",
                )}
                title="Reativa o recebimento de mensagens sem reiniciar a sessão nem gerar QR novo."
              >
                <Webhook className={cn("mr-1.5 h-3.5 w-3.5", reapplying && "animate-pulse")} /> {reapplying ? "Reparando…" : "Reparar recebimento"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onDelete} className="text-rose-500 hover:text-rose-400">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remover
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ---------- Badges ----------
function Badge({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone: "emerald" | "blue" | "violet" | "cyan" | "amber" | "rose" | "muted";
  icon?: React.ReactNode;
}) {
  const cls = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    muted: "bg-muted text-muted-foreground border-border",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium",
        cls,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: ProviderKind }) {
  if (provider === "meta") {
    return (
      <Badge tone="blue" icon={<MetaLogo className="h-3.5 w-3.5" />}>
        Meta Cloud API
      </Badge>
    );
  }
  return (
    <Badge tone="violet" icon={<Sparkles className="h-3.5 w-3.5" />}>
      MultiZap QR
    </Badge>
  );
}

function MethodBadge({ method }: { method: MethodKind }) {
  if (method === "embedded") {
    return (
      <Badge tone="cyan" icon={<Sparkles className="h-3.5 w-3.5" />}>
        Método: Embedded Signup
      </Badge>
    );
  }
  return (
    <Badge tone="cyan" icon={<QrCode className="h-3.5 w-3.5" />}>
      Método: QR Code
    </Badge>
  );
}

function StatusBadge({ status }: { status: StatusKind }) {
  const map: Record<StatusKind, { label: string; sub?: string; dot: string; text: string }> = {
    connected: { label: "Conectado", sub: "Recebendo mensagens", dot: "bg-emerald-500", text: "text-emerald-400" },
    waiting_first: { label: "Aguardando 1ª mensagem", sub: "Sem atividade ainda", dot: "bg-amber-400", text: "text-amber-400" },
    waiting_qr: { label: "Aguardando QR", sub: "Escaneie no celular", dot: "bg-amber-400", text: "text-amber-400" },
    disconnected: { label: "Desconectado", dot: "bg-muted-foreground", text: "text-muted-foreground" },
    needs_reconnect: { label: "Precisa reconectar", sub: "Sessão caiu no WhatsApp", dot: "bg-amber-500", text: "text-amber-400" },
    waiting_diagnostic: { label: "Aguardando diagnóstico", sub: "Confirmando status no servidor", dot: "bg-slate-400", text: "text-slate-300" },
    error: { label: "Com erro", sub: "Verifique a conexão", dot: "bg-rose-500", text: "text-rose-400" },
  };
  const s = map[status];
  return (
    <div className="text-right">
      <p className={cn("inline-flex items-center gap-1.5 text-sm font-medium", s.text)}>
        <span className={cn("h-2 w-2 rounded-full", s.dot)} />
        {s.label}
      </p>
      {s.sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>}
    </div>
  );
}

function Info({
  label,
  value,
  icon,
  dot,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  dot?: "emerald" | "muted";
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1.5 truncate text-sm text-foreground",
          mono && "font-mono text-xs",
        )}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              dot === "emerald" ? "bg-emerald-500" : "bg-muted-foreground",
            )}
          />
        )}
        {icon}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function MetaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.2 13.1c1.4-2 2.7-3 4.3-3 2.6 0 4.5 2.1 4.5 5.8 0 2.2-.8 5-1.6 6.4l-.6 1.1-2.4-1.5.4-.8c.7-1.4 1.3-3.4 1.3-4.9 0-1.6-.7-2.4-1.7-2.4-1 0-1.8.6-3 2.4l-1.4 2.1-2.1-1.5 2.3-3.7Zm-9.3 12.8c-2.4 0-4.4-2.3-4.4-6 0-4.4 2.7-9.7 6.4-9.7 1.8 0 3.2 1 4.6 3.1l1.3 1.9-2.1 1.5-1.2-1.8c-.9-1.4-1.7-1.9-2.5-1.9-2 0-3.7 3.5-3.7 6.7 0 1.8.7 2.8 1.8 2.8 1 0 1.7-.5 2.7-1.9l1.3-1.9 2.1 1.6-1.4 2C14.3 25 12.8 25.9 10.9 25.9Z" />
    </svg>
  );
}

// ---------- Helpers de diagnóstico ----------
function DiagBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/40 bg-rose-500/10 text-rose-300",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-400" : "bg-rose-400")} />
      {label}
    </span>
  );
}

function DiagRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose" | "muted";
}) {
  const toneCls = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("max-w-[60%] truncate text-right text-xs", toneCls)} title={value}>
        {value}
      </span>
    </div>
  );
}
