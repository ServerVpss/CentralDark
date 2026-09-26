// Painel master de monitoramento de notificações ao vivo.
// Mostra saúde fim-a-fim: webhook Meta → realtime → push OneSignal.
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  getMonitorHealth,
  listWebhookEvents,
  listPushEvents,
  listPushDevices,
  listWorkspacesLite,
  masterDeactivateDevice,
  masterPauseWorkspacePush,
  masterSendTestPush,
  masterReprocessWebhook,
  runEndToEndTest,
} from "@/lib/admin-monitor.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Activity, Webhook, Smartphone, Wifi, Play, RefreshCw, Pause, Send, PowerOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/monitor-notificacoes")({
  component: MonitorPage,
});

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `há ${s}s`;
  if (s < 3600) return `há ${Math.floor(s / 60)}min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)}h`;
  return formatDateTimeBR(iso);
}

function StatusDot({ status }: { status: "ok" | "warn" | "error" | string }) {
  const cls =
    status === "ok" ? "bg-emerald-500" : status === "warn" ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />;
}

function MonitorPage() {
  const [liveTick, setLiveTick] = useState(0);
  const [workspaceFilter, setWorkspaceFilter] = useState<string | undefined>();
  const [onlyInvalid, setOnlyInvalid] = useState(false);
  const [onlyActiveDevices, setOnlyActiveDevices] = useState(true);

  const getHealth = useServerFn(getMonitorHealth);
  const listWs = useServerFn(listWorkspacesLite);
  const listWh = useServerFn(listWebhookEvents);
  const listPush = useServerFn(listPushEvents);
  const listDevices = useServerFn(listPushDevices);
  const sendTest = useServerFn(masterSendTestPush);
  const pauseWs = useServerFn(masterPauseWorkspacePush);
  const deactivateDev = useServerFn(masterDeactivateDevice);
  const reprocess = useServerFn(masterReprocessWebhook);
  const runE2E = useServerFn(runEndToEndTest);

  // Tick a cada 10s pra refrescar saúde mesmo sem evento novo
  useEffect(() => {
    const i = setInterval(() => setLiveTick((t) => t + 1), 10000);
    return () => clearInterval(i);
  }, []);

  const health = useQuery({
    queryKey: ["monitor-health", liveTick],
    queryFn: () => getHealth(),
    refetchOnWindowFocus: false,
  });
  const workspaces = useQuery({
    queryKey: ["monitor-workspaces"],
    queryFn: () => listWs(),
    staleTime: 60_000,
  });
  const webhooks = useQuery({
    queryKey: ["monitor-webhooks", workspaceFilter, onlyInvalid],
    queryFn: () =>
      listWh({ data: { workspace_id: workspaceFilter ?? null, only_invalid: onlyInvalid, limit: 50 } }),
  });
  const pushEvents = useQuery({
    queryKey: ["monitor-push-events", workspaceFilter],
    queryFn: () => listPush({ data: { workspace_id: workspaceFilter ?? null, limit: 50 } }),
  });
  const devices = useQuery({
    queryKey: ["monitor-devices", workspaceFilter, onlyActiveDevices],
    queryFn: () =>
      listDevices({ data: { workspace_id: workspaceFilter ?? null, only_active: onlyActiveDevices, limit: 100 } }),
  });

  // Realtime: refetch ao receber novos eventos
  useEffect(() => {
    const ch = supabase
      .channel("admin:monitor-notifs")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_webhook_events" }, () => {
        webhooks.refetch();
        health.refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notification_events" }, () => {
        pushEvents.refetch();
        health.refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "push_subscriptions" }, () => {
        devices.refetch();
        health.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wsName = useMemo(() => {
    const m = new Map<string, string>();
    (workspaces.data ?? []).forEach((w) => m.set(w.id, w.name));
    return (id?: string | null) => (id ? m.get(id) ?? id.slice(0, 8) : "—");
  }, [workspaces.data]);

  const sendTestM = useMutation({
    mutationFn: (workspace_id: string) => sendTest({ data: { workspace_id } }),
    onSuccess: () => toast.success("Push de teste disparado"),
    onError: (e) => toast.error((e as Error).message),
  });
  const pauseM = useMutation({
    mutationFn: (vars: { workspace_id: string; paused: boolean }) => pauseWs({ data: vars }),
    onSuccess: (_d, v) => toast.success(v.paused ? "Push pausado" : "Push reativado"),
    onError: (e) => toast.error((e as Error).message),
  });
  const deactivateM = useMutation({
    mutationFn: (subscription_id: string) => deactivateDev({ data: { subscription_id } }),
    onSuccess: () => { toast.success("Dispositivo desativado"); devices.refetch(); },
    onError: (e) => toast.error((e as Error).message),
  });
  const reprocessM = useMutation({
    mutationFn: (event_id: string) => reprocess({ data: { event_id } }),
    onSuccess: () => toast.success("Reprocessamento solicitado"),
    onError: (e) => toast.error((e as Error).message),
  });
  const e2eM = useMutation({
    mutationFn: (workspace_id: string) => runE2E({ data: { workspace_id } }),
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Monitor de Notificações
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe ao vivo o fluxo Meta → Webhook → Realtime → Painel → Push.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> ao vivo
          </span>
          <Button size="sm" variant="outline" onClick={() => { health.refetch(); webhooks.refetch(); pushEvents.refetch(); devices.refetch(); }}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
        </div>
      </header>

      {/* Saúde */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhook Meta</CardTitle>
            <StatusDot status={health.data?.webhook.status ?? "warn"} />
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="text-2xl font-semibold">{health.data?.webhook.count_15min ?? 0}</div>
            <div className="text-muted-foreground text-xs">eventos nos últimos 15 min</div>
            <div className="text-xs">último: <span className="font-medium">{timeAgo(health.data?.webhook.last_event_at)}</span></div>
            {(health.data?.webhook.invalid_signature_15min ?? 0) > 0 && (
              <Badge variant="destructive" className="mt-1">{health.data?.webhook.invalid_signature_15min} assinaturas inválidas</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Wifi className="h-4 w-4" /> Realtime</CardTitle>
            <StatusDot status={health.data?.realtime.status ?? "ok"} />
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="text-2xl font-semibold">{liveTick > 0 ? "ativo" : "ativo"}</div>
            <div className="text-muted-foreground text-xs">canais assinados nesta tela: 3</div>
            <div className="text-xs">refresh automático a cada evento</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" /> Push OneSignal</CardTitle>
            <StatusDot status={health.data?.push.status ?? "warn"} />
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="text-2xl font-semibold">{health.data?.push.sent_1h ?? 0}</div>
            <div className="text-muted-foreground text-xs">enviados na última 1h</div>
            <div className="text-xs">{health.data?.push.active_devices ?? 0} devices ativos · {health.data?.push.users_with_push_on ?? 0} usuários com push ligado</div>
            {(health.data?.push.failed_1h ?? 0) > 0 && (
              <Badge variant="destructive" className="mt-1">{health.data?.push.failed_1h} falhas</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[240px]">
            <Select value={workspaceFilter ?? "__all"} onValueChange={(v) => setWorkspaceFilter(v === "__all" ? undefined : v)}>
              <SelectTrigger><SelectValue placeholder="Todas as empresas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Todas as empresas</SelectItem>
                {(workspaces.data ?? []).map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={onlyInvalid} onCheckedChange={setOnlyInvalid} /> Só assinaturas inválidas
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={onlyActiveDevices} onCheckedChange={setOnlyActiveDevices} /> Só devices ativos
          </label>
          {workspaceFilter && (
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => sendTestM.mutate(workspaceFilter)}>
                <Send className="h-4 w-4 mr-1" /> Push de teste
              </Button>
              <Button size="sm" variant="outline" onClick={() => pauseM.mutate({ workspace_id: workspaceFilter, paused: true })}>
                <Pause className="h-4 w-4 mr-1" /> Pausar push
              </Button>
              <Button size="sm" variant="outline" onClick={() => pauseM.mutate({ workspace_id: workspaceFilter, paused: false })}>
                Reativar
              </Button>
              <Button size="sm" onClick={() => e2eM.mutate(workspaceFilter)}>
                <Play className="h-4 w-4 mr-1" /> Teste ponta-a-ponta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado E2E */}
      {e2eM.data && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Resultado do teste ponta-a-ponta ({e2eM.data.total_ms} ms)</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {e2eM.data.steps.map((s) => (
              <div key={s.step} className="flex items-center gap-2">
                <StatusDot status={s.ok ? "ok" : "error"} />
                <span className="font-medium">{s.step}</span>
                <span className="text-muted-foreground">{s.ms}ms</span>
                {s.detail && <span className="text-xs text-red-500">{s.detail}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Abas */}
      <Tabs defaultValue="webhooks">
        <TabsList>
          <TabsTrigger value="webhooks">Webhook Meta</TabsTrigger>
          <TabsTrigger value="push">Eventos de Push</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[60vh]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-left">
                      <th className="p-2">Quando</th>
                      <th className="p-2">Empresa</th>
                      <th className="p-2">phone_number_id</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Assinatura</th>
                      <th className="p-2">Erro</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(webhooks.data ?? []).map((r) => (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="p-2 whitespace-nowrap">{timeAgo(r.created_at)}</td>
                        <td className="p-2">{wsName(r.workspace_id)}</td>
                        <td className="p-2 font-mono text-xs">{r.phone_number_id ?? "—"}</td>
                        <td className="p-2">{r.event_type}</td>
                        <td className="p-2">{r.status_code}</td>
                        <td className="p-2">{r.signature_valid ? <Badge variant="secondary">ok</Badge> : <Badge variant="destructive">inválida</Badge>}</td>
                        <td className="p-2 text-red-500 text-xs">{r.error ?? ""}</td>
                        <td className="p-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => reprocessM.mutate(r.id)}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!webhooks.data?.length && (
                      <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Sem eventos no filtro atual.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[60vh]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-left">
                      <th className="p-2">Quando</th>
                      <th className="p-2">Empresa</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Provedor</th>
                      <th className="p-2">Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pushEvents.data ?? []).map((r) => (
                      <tr key={r.id} className="border-t hover:bg-muted/30">
                        <td className="p-2 whitespace-nowrap">{timeAgo(r.created_at)}</td>
                        <td className="p-2">{wsName(r.workspace_id)}</td>
                        <td className="p-2">{r.type}</td>
                        <td className="p-2">
                          <Badge variant={r.status === "failed" || r.status === "skipped" ? "destructive" : "secondary"}>{r.status}</Badge>
                        </td>
                        <td className="p-2">{r.provider}</td>
                        <td className="p-2 text-red-500 text-xs">{r.error_message ?? ""}</td>
                      </tr>
                    ))}
                    {!pushEvents.data?.length && (
                      <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum evento de push.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[60vh]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-left">
                      <th className="p-2">Último uso</th>
                      <th className="p-2">Empresa</th>
                      <th className="p-2">SO</th>
                      <th className="p-2">Browser</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Ativo?</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(devices.data ?? []).map((d) => (
                      <tr key={d.id} className="border-t hover:bg-muted/30">
                        <td className="p-2 whitespace-nowrap">{timeAgo(d.last_seen_at)}</td>
                        <td className="p-2">{wsName(d.workspace_id)}</td>
                        <td className="p-2">{d.os ?? "—"}</td>
                        <td className="p-2">{d.browser ?? "—"}</td>
                        <td className="p-2">{d.device_type ?? "—"}</td>
                        <td className="p-2">{d.is_active ? <Badge variant="secondary">ativo</Badge> : <Badge variant="outline">inativo</Badge>}</td>
                        <td className="p-2 text-right">
                          {d.is_active && (
                            <Button size="sm" variant="ghost" onClick={() => deactivateM.mutate(d.id)}>
                              <PowerOff className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!devices.data?.length && (
                      <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum dispositivo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
