import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { formatDateTimeBR, formatTimeBR } from "@/lib/datetime";
import {
  adminWhatsAppOverview, upsertWhatsAppConnection, deleteWhatsAppConnection, testWhatsAppConnection,
  adminValidateWebhook, adminTestSignature, adminRecentWebhookEvents, adminConversationsWindowStatus,
  adminSendTestMessage, adminGetWebhookSummary, rotateWhatsAppAccessToken,
} from "@/lib/whatsapp.functions";
import { listAllWorkspaces } from "@/lib/admin.functions";
import { getPublicMasterSettings, reconnectEmbeddedSignup } from "@/lib/master-settings.functions";
import { MessageCircle, AlertTriangle, CheckCircle2, Activity, Plus, Trash2, Zap, Pencil, ShieldCheck, Webhook, Clock, ListOrdered, Send, History, Stethoscope, RefreshCw } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ConnectionDiagnostic } from "@/components/whatsapp/ConnectionDiagnostic";
import { RegisterAndVerifyPhone } from "@/components/whatsapp/RegisterAndVerifyPhone";
import { VerifyPinPanel } from "@/components/whatsapp/VerifyPinPanel";
import { ForwardTargetsSection } from "@/components/whatsapp/ForwardTargetsSection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { classifyWebhookEvent, eventLabel, LEVEL_BADGE, LEVEL_TEXT } from "@/lib/webhook-event-style";
import { friendlyError } from "@/lib/friendly-error";
import { translateWhatsAppError } from "@/lib/whatsapp-error-translate";
import { getFbLoginStatus } from "@/lib/fb-sdk";
import { LoadingDots } from "@/components/ui/loading-dots";
import { AdminQrConnectionsSection } from "@/components/admin/AdminQrConnectionsSection";

export const Route = createFileRoute("/admin/whatsapp/")({ component: AdminWhatsApp });

type ConnRow = {
  id: string; workspace_id: string; name: string;
  phone_number_id: string | null;
  display_phone_number: string | null; status: string;
  provider?: string | null;
  quality_rating: string | null; messaging_tier: string | null;
  error_count: number; last_error: string | null; last_error_at: string | null;
  last_webhook_at: string | null; created_at: string;
  onboarding_mode?: string | null;
  sent24h?: number; recv24h?: number; failed24h?: number;
};


type UpsertVars = {
  id?: string; workspaceId: string; name: string; phone?: string;
  phone_number_id: string; waba_id: string; access_token: string;
  app_secret: string; verify_token: string; display_phone_number?: string;
};

function statusColor(s: string | null) {
  if (s === "connected") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
  if (s === "throttled") return "text-amber-500 bg-amber-500/10 border-amber-500/30";
  if (s === "error") return "text-red-500 bg-red-500/10 border-red-500/30";
  return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
}
function statusLabel(s: string | null) {
  if (s === "connected") return "Funcionando";
  if (s === "throttled") return "Devagar (limite)";
  if (s === "error") return "Com erro";
  if (s === "pending") return "Aguardando código";
  return "Desligado";
}
function qualityColor(q: string | null) {
  if (q === "GREEN") return "text-emerald-500";
  if (q === "YELLOW") return "text-amber-500";
  if (q === "RED") return "text-red-500";
  return "text-zinc-400";
}
function qualityLabel(q: string | null) {
  if (q === "GREEN") return "Boa 🟢";
  if (q === "YELLOW") return "Atenção 🟡";
  if (q === "RED") return "Ruim 🔴";
  return "—";
}
function tierLabel(t: string | null) {
  if (!t) return "—";
  // Meta: TIER_50 / 250 / 1K / 10K / 100K / UNLIMITED
  const map: Record<string, string> = {
    TIER_50: "até 50/dia",
    TIER_250: "até 250/dia",
    TIER_1K: "até 1.000/dia",
    TIER_10K: "até 10 mil/dia",
    TIER_100K: "até 100 mil/dia",
    TIER_UNLIMITED: "sem limite",
  };
  return map[t] ?? t;
}

function AdminWhatsApp() {
  const qc = useQueryClient();
  const fn = useServerFn(adminWhatsAppOverview);
  const wsFn = useServerFn(listAllWorkspaces);
  const upsertFn = useServerFn(upsertWhatsAppConnection);
  const delFn = useServerFn(deleteWhatsAppConnection);
  const testFn = useServerFn(testWhatsAppConnection);

  const { data, isLoading } = useQuery<ConnRow[]>({
    queryKey: ["admin-wa-overview"], queryFn: () => fn(), refetchInterval: 30_000,
  });
  const { data: workspaces } = useQuery({ queryKey: ["admin-ws-list"], queryFn: () => wsFn() });
  const whFn = useServerFn(adminGetWebhookSummary);
  const { data: webhookSummary } = useQuery({
    queryKey: ["admin-wa-webhook-summary"], queryFn: () => whFn(), refetchInterval: 15_000,
  });
  const whMap = new Map((webhookSummary ?? []).map((w) => [w.connectionId, w]));

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ConnRow | null>(null);
  const [eventsFor, setEventsFor] = useState<ConnRow | null>(null);
  const [windowOpenFor, setWindowOpenFor] = useState<ConnRow | null>(null);
  const [testFor, setTestFor] = useState<ConnRow | null>(null);
  const [diagFor, setDiagFor] = useState<ConnRow | null>(null);
  const [resumePinFor, setResumePinFor] = useState<ConnRow | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerWs, setRegisterWs] = useState<string>("");
  const [rotateFor, setRotateFor] = useState<ConnRow | null>(null);
  const [rotateToken, setRotateToken] = useState("");
  const rotateFn = useServerFn(rotateWhatsAppAccessToken);
  const rotateM = useMutation({
    mutationFn: (vars: { id: string; access_token: string }) => rotateFn({ data: vars }),
    onSuccess: () => { toast.success("Chave atualizada."); setRotateFor(null); setRotateToken(""); qc.invalidateQueries({ queryKey: ["admin-wa-overview"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const validateFn = useServerFn(adminValidateWebhook);
  const sigFn = useServerFn(adminTestSignature);

  const upsertM = useMutation({
    mutationFn: (vars: UpsertVars) => upsertFn({ data: vars }),
    onSuccess: () => { toast.success("Conexão salva."); setOpen(false); setEdit(null); qc.invalidateQueries({ queryKey: ["admin-wa-overview"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Conexão removida."); qc.invalidateQueries({ queryKey: ["admin-wa-overview"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const testM = useMutation({
    mutationFn: (id: string) => testFn({ data: { id } }),
    onSuccess: (r) => {
      if (!r.ok) toast.error(r.error ?? "Falhou");
      else if (r.mode === "qr") toast.success(`Gateway OK (${r.latency_ms ?? "?"}ms)`);
      else toast.success(`OK: ${r.display_phone_number ?? "número validado"} • ${r.quality_rating ?? "—"}`);
      qc.invalidateQueries({ queryKey: ["admin-wa-overview"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const validateM = useMutation({
    mutationFn: (id: string) => validateFn({ data: { id } }),
    onSuccess: (r) => r.ok
      ? toast.success("Tudo certo — a Meta consegue falar com a gente.")
      : toast.error(`A Meta não conseguiu validar (erro ${r.status}). Confira se o "código de verificação" está igual nos dois lados.`),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const sigM = useMutation({
    mutationFn: (id: string) => sigFn({ data: { id } }),
    onSuccess: (r) => r.ok
      ? toast.success("Segurança das mensagens recebidas: OK.")
      : toast.error(`Falha na verificação de segurança (válida=${r.validStatus} inválida=${r.invalidStatus}).`),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const settingsFn = useServerFn(getPublicMasterSettings);
  const reconnectFn = useServerFn(reconnectEmbeddedSignup);
  const { data: settings } = useQuery({ queryKey: ["master-public-settings"], queryFn: () => settingsFn() });
  const reconnectM = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) => reconnectFn({ data: { connectionId: id, code } }),
    onSuccess: () => { toast.success("Conexão renovada! O número voltou a funcionar."); qc.invalidateQueries({ queryKey: ["admin-wa-overview"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const startReconnect = async (c: ConnRow) => {
    if (!settings?.embedded_ready || !settings.meta_app_id || !settings.meta_config_id) {
      toast.error("Configure o App da Meta em Configurações antes de reconectar.");
      return;
    }

    // Verifica se o admin já tem sessão no Facebook — evita popup quebrado.
    let loggedIn = false;
    try {
      const r = await getFbLoginStatus(settings.meta_app_id);
      loggedIn = r.loggedIntoFacebook;
    } catch {
      // ignora — segue o fluxo
    }
    if (!loggedIn) {
      toast.info("Escolha entrar com Facebook ou WhatsApp Business na janela que vai abrir.", { duration: 5000 });
    }

    const redirect = encodeURIComponent(`${window.location.origin}/oauth/meta-callback`);
    const oauthUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${settings.meta_app_id}&config_id=${settings.meta_config_id}&redirect_uri=${redirect}&response_type=code&scope=whatsapp_business_management,whatsapp_business_messaging&auth_type=rerequest`;
    // Embrulha no loginpage do Business pra SEMPRE mostrar o seletor Facebook/WhatsApp Business.
    const url = `https://business.facebook.com/business/loginpage/?next=${encodeURIComponent(oauthUrl)}`;
    const popup = window.open(url, "meta_reconnect", "width=600,height=700");
    if (!popup) { toast.error("Permita popups para reconectar."); return; }
    const handler = (ev: MessageEvent) => {
      if (ev.data?.type === "meta_signup_code" && typeof ev.data.code === "string") {
        reconnectM.mutate({ id: c.id, code: ev.data.code });
        window.removeEventListener("message", handler);
        popup.close();
      } else if (ev.data?.type === "meta_signup_error") {
        toast.error(ev.data.description ?? ev.data.error ?? "Falha ao reconectar pela Meta.");
        window.removeEventListener("message", handler);
        popup.close();
      }
    };
    window.addEventListener("message", handler);
    toast.info(`Reconectando ${c.display_phone_number ?? c.name}… autorize na janela do Facebook.`);
  };

  const totals = (data ?? []).reduce(
    (acc, c) => ({ conn: acc.conn + 1, sent: acc.sent + (c.sent24h ?? 0), recv: acc.recv + (c.recv24h ?? 0), failed: acc.failed + (c.failed24h ?? 0) }),
    { conn: 0, sent: 0, recv: 0, failed: 0 },
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <WhatsAppIcon className="h-6 w-6 text-emerald-500" /> WhatsApp dos clientes
          </h1>
          <p className="text-sm text-muted-foreground">Veja todos os números conectados, se estão recebendo mensagens e cadastre novos em nome de qualquer cliente.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setRegisterWs(""); setRegisterOpen(true); }}>
            <ShieldCheck className="mr-1 h-4 w-4" /> Cadastrar e validar por código
          </Button>
          <Button onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar número (chaves manuais)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Números conectados" value={totals.conn} icon={Activity} />
        <Stat label="Mensagens enviadas (24h)" value={totals.sent} icon={CheckCircle2} />
        <Stat label="Mensagens recebidas (24h)" value={totals.recv} icon={MessageCircle} />
        <Stat label="Falhas no envio (24h)" value={totals.failed} icon={AlertTriangle} alert />
      </div>

      {/* WhatsApp QR (MultiZap-Gateway) — espelho master de todos os workspaces */}
      <AdminQrConnectionsSection />

      <div className="overflow-hidden rounded-xl border bg-card">

        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Empresa (cliente)</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3">Recebendo mensagens?</th>
              <th className="px-4 py-3">Reputação</th>
              <th className="px-4 py-3">Limite Meta</th>
              <th className="px-4 py-3 text-right">Enviadas / Recebidas / Falhas (24h)</th>
              <th className="px-4 py-3">Último problema</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>}
            {!isLoading && (data ?? []).length === 0 && (
              <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Nenhuma conexão. Clique em "Adicionar número".</td></tr>
            )}
            {(data ?? []).map((c) => {
              const wh = whMap.get(c.id);
              const whStatus = wh?.webhookStatus ?? (c.status === "connected" ? (c.last_webhook_at ? "connected" : "approved") : "pending");
              const whCls = whStatus === "connected" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                : whStatus === "approved" ? "text-blue-500 bg-blue-500/10 border-blue-500/30"
                : "text-amber-500 bg-amber-500/10 border-amber-500/30";
              const whLabel = whStatus === "connected" ? "Sim, recebendo" : whStatus === "approved" ? "Pronto, sem msg ainda" : "Falta validar código";
              const wsName = (workspaces ?? []).find((w) => w.id === c.workspace_id)?.name ?? c.workspace_id.slice(0, 8);
              return (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.display_phone_number ?? c.phone_number_id}</div>
                </td>
                <td className="px-4 py-3 text-xs">{wsName}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", statusColor(c.status))}>{statusLabel(c.status)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", whCls)}>
                    <Webhook className="h-3 w-3" /> {whLabel}
                  </span>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {wh?.lastEventAt ? `Última atividade: ${formatDateTimeBR(wh.lastEventAt)}` : "sem atividade"}
                  </div>
                </td>
                <td className={cn("px-4 py-3 font-medium", qualityColor(c.quality_rating))}>{qualityLabel(c.quality_rating)}</td>
                <td className="px-4 py-3 text-xs">{tierLabel(c.messaging_tier)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {c.sent24h ?? 0} / {c.recv24h ?? 0} / <span className={(c.failed24h ?? 0) > 0 ? "text-red-500 font-medium" : ""}>{c.failed24h ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-xs max-w-xs">
                  {c.last_error ? (
                    <span title={c.last_error} className="block truncate text-red-500 dark:text-red-400 cursor-help">
                      {translateWhatsAppError(c.last_error)?.title ?? c.last_error}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {c.status !== "connected" && (
                      <Button size="icon" variant="ghost" title="Reenviar código de 6 dígitos" onClick={() => setResumePinFor(c)}><ShieldCheck className="h-4 w-4 text-amber-500" /></Button>
                    )}
                    {(() => {
                      const tokenExpired = !!c.last_error && /expir|oauth|access token|sessão|session|invalid_token|token.*inv/i.test(c.last_error);
                      if (c.onboarding_mode === "embedded") {
                        return (
                          <Button
                            size="sm"
                            variant={tokenExpired ? "destructive" : "ghost"}
                            title="Reconectar (renovar chave da Meta sem apagar o número)"
                            onClick={() => startReconnect(c)}
                            disabled={reconnectM.isPending}
                            className={cn("h-9 gap-1.5 px-2", !tokenExpired && "text-emerald-600 hover:text-emerald-700")}
                          >
                            <RefreshCw className={cn("h-4 w-4", reconnectM.isPending && "animate-spin")} />
                            <span className="text-xs font-medium">{reconnectM.isPending ? "Reconectando…" : "Reconectar"}</span>
                          </Button>
                        );
                      }
                      // modo manual: destacar "Colar nova chave" quando expirado
                      if (tokenExpired) {
                        return (
                          <Button
                            size="sm"
                            variant="destructive"
                            title="A chave expirou — cole uma nova chave da Meta"
                            onClick={() => { setRotateFor(c); setRotateToken(""); }}
                            className="h-9 gap-1.5 px-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="text-xs font-medium">Colar nova chave</span>
                          </Button>
                        );
                      }
                      return null;
                    })()}
                    <Button size="icon" variant="ghost" title="Diagnóstico (ver tudo sobre este número)" onClick={() => setDiagFor(c)}><Stethoscope className="h-4 w-4 text-blue-500" /></Button>
                    <Button size="icon" variant="ghost" title="Testar conexão com a Meta" onClick={() => testM.mutate(c.id)} disabled={testM.isPending}><Zap className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Verificar se a Meta consegue falar com a gente" onClick={() => validateM.mutate(c.id)} disabled={validateM.isPending}><Webhook className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Verificar segurança das mensagens recebidas" onClick={() => sigM.mutate(c.id)} disabled={sigM.isPending}><ShieldCheck className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Mandar mensagem de teste" onClick={() => setTestFor(c)}><Send className="h-4 w-4 text-emerald-500" /></Button>
                    <Button size="icon" variant="ghost" title="Histórico de mensagens recebidas" onClick={() => setEventsFor(c)}><ListOrdered className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Conversas abertas (regra das 24h do WhatsApp)" onClick={() => setWindowOpenFor(c)}><Clock className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Editar chaves" onClick={() => { setEdit(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Link
                      to="/admin/auditoria"
                      search={{ entity: "whatsapp_connections", entityId: c.id, workspaceId: c.workspace_id }}
                      title="Histórico de alterações"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                    ><History className="h-4 w-4" /></Link>
                    <Button size="icon" variant="ghost" title="Remover número" onClick={() => { if (confirm(`Remover ${c.name}?`)) delM.mutate(c.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      <ForwardTargetsSection />

      <ConnectionDialog
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) setEdit(null); }}
        edit={edit}
        workspaces={workspaces ?? []}
        onSubmit={(v) => upsertM.mutate(v)}
        pending={upsertM.isPending}
      />
      <EventsDialog conn={eventsFor} onClose={() => setEventsFor(null)} />
      <WindowDialog conn={windowOpenFor} onClose={() => setWindowOpenFor(null)} />
      <TestSendDialog conn={testFor} onClose={() => setTestFor(null)} />
      <Dialog open={!!diagFor} onOpenChange={(v) => !v && setDiagFor(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle className="truncate pr-6">Diagnóstico — {diagFor?.name}</DialogTitle></DialogHeader>
          {diagFor && (
            <ConnectionDiagnostic
              connectionId={diagFor.id}
              isMaster
              provider={diagFor.provider}
              workspaceId={diagFor.workspace_id}
              gatewayConnectionId={diagFor.phone_number_id}
            />
          )}

        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar um WhatsApp pra um cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Para qual cliente é este número?</Label>
              <Select value={registerWs} onValueChange={setRegisterWs}>
                <SelectTrigger><SelectValue placeholder="Escolha o cliente…" /></SelectTrigger>
                <SelectContent>
                  {(workspaces ?? []).map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                O número fica no painel desse cliente. Tudo o que você fizer aqui é registrado no histórico.
              </p>
            </div>
            {registerWs ? (
              <RegisterAndVerifyPhone
                workspaceId={registerWs}
                onConnected={() => { setRegisterOpen(false); qc.invalidateQueries({ queryKey: ["admin-wa-overview"] }); }}
              />
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Escolha um cliente acima para começar.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resumePinFor} onOpenChange={(v) => !v && setResumePinFor(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-6 w-6 text-emerald-500" /> Confirmar código
            </DialogTitle>
            <p className="text-sm font-medium text-foreground">
              {resumePinFor?.display_phone_number ?? resumePinFor?.name}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Peça um código novo por <strong>SMS</strong> ou <strong>ligação</strong> e digite os 6 dígitos.
              O número fica esperando até confirmar.
            </p>
          </DialogHeader>
          {resumePinFor && (
            <VerifyPinPanel
              connectionId={resumePinFor.id}
              onDone={() => { setResumePinFor(null); qc.invalidateQueries({ queryKey: ["admin-wa-overview"] }); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rotateFor} onOpenChange={(v) => { if (!v) { setRotateFor(null); setRotateToken(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Colar nova chave da Meta — {rotateFor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Só cole a <b>chave de acesso (token)</b> nova aqui embaixo. O resto (número, WABA, App Secret) já está salvo e não precisa enviar de novo.
            </p>
            <div>
              <Label>Token de acesso novo *</Label>
              <Input
                type="password"
                autoFocus
                value={rotateToken}
                onChange={(e) => setRotateToken(e.target.value)}
                placeholder="Ex.: EAAG..."
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Chave longa que começa com "EAA". Gere em business.facebook.com → Configurações da Empresa → Usuários do Sistema → Gerar Token. Marque "Token permanente".</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRotateFor(null); setRotateToken(""); }}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!rotateFor) return;
                if (rotateToken.trim().length < 20) { toast.error("Cole a chave completa (começa com EAA)."); return; }
                rotateM.mutate({ id: rotateFor.id, access_token: rotateToken.trim() });
              }}
              disabled={rotateM.isPending}
            >
              {rotateM.isPending ? "Salvando…" : "Salvar nova chave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventsDialog({ conn, onClose }: { conn: ConnRow | null; onClose: () => void }) {
  const fn = useServerFn(adminRecentWebhookEvents);
  const { data } = useQuery({
    queryKey: ["wa-events", conn?.id],
    enabled: !!conn,
    queryFn: () => fn({ data: { connectionId: conn!.id, limit: 50 } }),
    refetchInterval: 5000,
  });
  return (
    <Dialog open={!!conn} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>O que chegou da Meta — {conn?.name}</DialogTitle></DialogHeader>
        <div className="text-xs text-muted-foreground mb-2">
          Lista das mensagens e avisos que a Meta mandou pra esta conexão. Atualiza sozinho a cada 5 segundos.
        </div>
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground"><tr>
            <th className="py-1">Quando</th><th>O que veio</th><th>Resposta</th><th>Detalhe</th>
          </tr></thead>
          <tbody>
            {(data ?? []).map((e) => {
              const level = classifyWebhookEvent(e.event_type, e.status_code);
              return (
                <tr key={e.id} className="border-t">
                  <td className="py-1.5">{formatDateTimeBR(e.created_at)}</td>
                  <td>
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${LEVEL_BADGE[level]}`}>
                      {eventLabel(e.event_type)}
                    </span>
                  </td>
                  <td className={`font-mono ${LEVEL_TEXT[level]}`}>{e.status_code === 200 ? "OK" : e.status_code}</td>
                  <td className={`${level === "error" ? "text-red-600" : "text-muted-foreground"} max-w-xs truncate`}>{e.error ?? (e.event_type === "accepted_no_signature" ? "App Secret opcional não configurado" : "")}</td>
                </tr>
              );
            })}
            {!data?.length && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Nada chegou ainda. Quando o cliente conectar o WhatsApp e mandar a primeira mensagem, aparece aqui.</td></tr>}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}

function WindowDialog({ conn, onClose }: { conn: ConnRow | null; onClose: () => void }) {
  const fn = useServerFn(adminConversationsWindowStatus);
  const { data } = useQuery({
    queryKey: ["wa-window", conn?.id],
    enabled: !!conn,
    queryFn: () => fn({ data: { connectionId: conn!.id, limit: 50 } }),
  });
  return (
    <Dialog open={!!conn} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Conversas abertas (regra das 24h) — {conn?.name}</DialogTitle></DialogHeader>
        <div className="text-xs text-muted-foreground mb-2">
          Regra do WhatsApp: depois que o cliente manda uma mensagem, a empresa tem <b>24 horas</b> pra responder com texto livre. Passou disso, só dá pra mandar mensagens prontas (templates aprovados pela Meta).
        </div>
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground"><tr>
            <th className="py-1">Cliente</th><th>Pode mandar texto?</th><th>Tempo restante</th><th>Última mensagem</th><th>Última recusa</th>
          </tr></thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.ticketId} className="border-t">
                <td className="py-1.5">{c.contactName ?? c.contactPhone}</td>
                <td>
                  <span className={cn("rounded px-2 py-0.5 font-medium",
                    c.inWindow ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600")}>
                    {c.inWindow ? "✓ Sim, livre" : "⚠ Só mensagem pronta"}
                  </span>
                </td>
                <td>{c.inWindow ? `${Math.floor(c.minutesUntilExpiry / 60)}h ${c.minutesUntilExpiry % 60}m` : "—"}</td>
                <td className="text-muted-foreground">{c.lastMessageAt ? formatDateTimeBR(c.lastMessageAt) : "—"}</td>
                <td className="text-red-500 max-w-xs truncate" title={c.lastBlock?.reason}>
                  {c.lastBlock ? `${formatTimeBR(c.lastBlock.at)} — ${c.lastBlock.reason}` : "—"}
                </td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nenhuma conversa aberta agora.</td></tr>}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, icon: Icon, alert }: { label: string; value: number; icon: typeof Activity; alert?: boolean }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", alert && value > 0 && "border-red-500/40 bg-red-500/5")}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", alert && value > 0 ? "text-red-500" : "text-muted-foreground")} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ConnectionDialog({ open, onOpenChange, edit, workspaces, onSubmit, pending }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  edit: ConnRow | null;
  workspaces: Array<{ id: string; name: string }>;
  onSubmit: (v: {
    id?: string; workspaceId: string; name: string; phone?: string;
    phone_number_id: string; waba_id: string; access_token: string;
    app_secret: string; verify_token: string; display_phone_number?: string;
  }) => void;
  pending: boolean;
}) {
  const [form, setForm] = useState({
    workspaceId: edit?.workspace_id ?? "",
    name: edit?.name ?? "",
    phone: edit?.display_phone_number ?? "",
    phone_number_id: edit?.phone_number_id ?? "",
    waba_id: "",
    access_token: "",
    app_secret: "",
    verify_token: "",
  });

  // Reset when edit/open changes
  const key = edit?.id ?? "new";
  const lastKey = (ConnectionDialog as unknown as { _k?: string })._k;
  if (lastKey !== key) {
    (ConnectionDialog as unknown as { _k?: string })._k = key;
    setTimeout(() => setForm({
      workspaceId: edit?.workspace_id ?? "",
      name: edit?.name ?? "",
      phone: edit?.display_phone_number ?? "",
      phone_number_id: edit?.phone_number_id ?? "",
      waba_id: "",
      access_token: "",
      app_secret: "",
      verify_token: "",
    }), 0);
  }

  const submit = () => {
    if (!form.workspaceId || !form.name || !form.phone_number_id || !form.waba_id || !form.access_token || !form.app_secret || !form.verify_token) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    onSubmit({ id: edit?.id, ...form, display_phone_number: form.phone });
  };

  const webhookUrl = edit ? `${window.location.origin}/api/public/whatsapp/webhook/${edit.id}` : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{edit ? "Editar chaves do WhatsApp" : "Adicionar WhatsApp colando as chaves"}</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Use este formulário quando o cliente já tem WhatsApp Business cadastrado direto na Meta e te enviou as 5 chaves. Cada campo embaixo explica o que é e onde achar.
        </p>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Cliente (empresa) *</Label>
            <Select value={form.workspaceId} onValueChange={(v) => setForm({ ...form, workspaceId: v })}>
              <SelectTrigger><SelectValue placeholder="Escolha o cliente..." /></SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-muted-foreground">Onde o número vai aparecer dentro do sistema.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Apelido do número *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Atendimento Principal" />
              <p className="mt-1 text-[11px] text-muted-foreground">Nome só pra você identificar dentro do painel.</p>
            </div>
            <div>
              <Label>Telefone (como aparece pro cliente)</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+55 84 9904-3351" />
              <p className="mt-1 text-[11px] text-muted-foreground">Formato amigável. Ex.: +55 84 99999-0000.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID do número (Phone Number ID) *</Label>
              <Input value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} placeholder="Ex.: 1183861441468281" />
              <p className="mt-1 text-[11px] text-muted-foreground">Número longo que a Meta gera. Fica em business.facebook.com → WhatsApp → Visão geral, embaixo do telefone.</p>
            </div>
            <div>
              <Label>ID da Conta WhatsApp Business (WABA) *</Label>
              <Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} placeholder="Ex.: 984831340717737" />
              <p className="mt-1 text-[11px] text-muted-foreground">Identifica a conta inteira (pode ter vários números). Mesmo lugar, no topo da página.</p>
            </div>
          </div>
          <div>
            <Label>Token de acesso (chave permanente) *</Label>
            <Input type="password" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} placeholder="Ex.: EAAG..." />
            <p className="mt-1 text-[11px] text-muted-foreground">Chave longa que começa com "EAA". Gere em Configurações da Empresa → Usuários do Sistema → Gerar Token. Marque "Token permanente".</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Senha do app (App Secret) *</Label>
              <Input type="password" value={form.app_secret} onChange={(e) => setForm({ ...form, app_secret: e.target.value })} placeholder="32 caracteres misturados" />
              <p className="mt-1 text-[11px] text-muted-foreground">Em developers.facebook.com → seu App → Configurações → Básico → "Chave Secreta do App".</p>
            </div>
            <div>
              <Label>Código de verificação (você inventa) *</Label>
              <Input value={form.verify_token} onChange={(e) => setForm({ ...form, verify_token: e.target.value })} placeholder="Ex.: minha-senha-secreta-2026" />
              <p className="mt-1 text-[11px] text-muted-foreground">Uma palavra/frase que VOCÊ escolhe. Vai colar a mesma na Meta no próximo passo. Ex.: <span className="font-mono">meu-token-x9k2</span>.</p>
            </div>
          </div>

          {webhookUrl && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              <p className="font-semibold text-amber-600 mb-1">Cole este link na Meta (campo "URL de retorno de chamada"):</p>
              <code className="block break-all text-xs">{webhookUrl}</code>
              <p className="mt-2 text-muted-foreground">Lá na Meta também tem o campo "Token de verificação" — use o mesmo "Código de verificação" que você digitou acima. Marque a caixinha <b>messages</b> na lista de eventos.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={pending}>{pending ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestSendDialog({ conn, onClose }: { conn: ConnRow | null; onClose: () => void }) {
  const sendFn = useServerFn(adminSendTestMessage);
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const [text, setText] = useState("Olá! Esta é uma mensagem de teste enviada antes de ativar o atendimento.");
  const [templateName, setTemplateName] = useState("hello_world");
  const [templateLang, setTemplateLang] = useState("en_US");
  const [result, setResult] = useState<{ ok: boolean; message?: string; messageId?: string | null; code?: string } | null>(null);

  const m = useMutation({
    mutationFn: () => sendFn({ data: {
      connectionId: conn!.id,
      to,
      ...(mode === "text" ? { text } : { templateName, templateLang }),
    } }),
    onSuccess: (r) => {
      setResult(r);
      if (r.ok) toast.success(`Enviado. ID: ${r.messageId ?? "—"}`);
      else toast.error(r.message ?? "Falhou");
    },
    onError: (e: Error) => { setResult({ ok: false, message: e.message }); toast.error(friendlyError(e)); },
  });

  return (
    <Dialog open={!!conn} onOpenChange={(v) => { if (!v) { onClose(); setResult(null); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mandar mensagem de teste — {conn?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">
            Manda uma mensagem de verdade pra um número seu, antes de soltar o atendimento. <b>Texto livre</b> só funciona se a pessoa tiver te mandado mensagem nas últimas 24h. <b>Mensagem pronta</b> (template) funciona sempre.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="test-to">Número que vai receber (com código do país)</Label>
            <Input id="test-to" placeholder="Ex.: 5584999999999" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>Texto livre</Button>
            <Button type="button" size="sm" variant={mode === "template" ? "default" : "outline"} onClick={() => setMode("template")}>Mensagem pronta (template)</Button>
          </div>
          {mode === "text" ? (
            <div className="space-y-1.5">
              <Label htmlFor="test-text">Mensagem</Label>
              <Textarea id="test-text" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="test-tpl">Nome do template</Label>
                <Input id="test-tpl" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="test-lang">Idioma</Label>
                <Input id="test-lang" value={templateLang} onChange={(e) => setTemplateLang(e.target.value)} />
              </div>
            </div>
          )}
          {result && (
            <div className={cn(
              "rounded-md border p-2 text-xs",
              result.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                       : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
            )}>
              {result.ok
                ? <>✓ Mensagem enviada com sucesso. <span className="font-mono">{result.messageId}</span></>
                : <>✗ {result.code ? `[${result.code}] ` : ""}{result.message}</>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { onClose(); setResult(null); }}>Fechar</Button>
          <Button disabled={!to.trim() || m.isPending} onClick={() => m.mutate()}>
            <Send className="mr-1 h-4 w-4" /> Enviar teste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
