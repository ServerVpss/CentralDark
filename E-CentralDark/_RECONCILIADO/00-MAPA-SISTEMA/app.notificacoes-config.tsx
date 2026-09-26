import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Smartphone, Volume2, Shield, Activity, PlayCircle } from "lucide-react";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  getMyPreferences,
  saveMyPreferences,
  listMyDevices,
  unregisterPushSubscription,
  sendTestPush,
  listNotificationEvents,
  getNotificationsConfig,
} from "@/lib/notifications.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { playNotificationSound, unlockSound } from "@/lib/notification-sound";

export const Route = createFileRoute("/app/notificacoes-config")({
  component: NotificacoesConfigPage,
});

function NotificacoesConfigPage() {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getMyPreferences);
  const savePrefs = useServerFn(saveMyPreferences);
  const fetchDevices = useServerFn(listMyDevices);
  const removeDevice = useServerFn(unregisterPushSubscription);
  const testPush = useServerFn(sendTestPush);
  const fetchEvents = useServerFn(listNotificationEvents);
  const fetchCfg = useServerFn(getNotificationsConfig);

  const { data: cfg } = useQuery({ queryKey: ["notifications-config"], queryFn: () => fetchCfg() });

  const { data: prefs } = useQuery({
    queryKey: ["notif-prefs", ws?.id],
    enabled: !!ws?.id,
    queryFn: () => fetchPrefs({ data: { workspace_id: ws!.id } }),
  });

  const { data: devices } = useQuery({
    queryKey: ["my-devices"],
    queryFn: () => fetchDevices(),
  });

  const { data: events } = useQuery({
    queryKey: ["notif-events", ws?.id],
    enabled: !!ws?.id,
    queryFn: () => fetchEvents({ data: { workspace_id: ws!.id, limit: 20 } }),
    refetchInterval: 10_000,
  });

  const [local, setLocal] = useState({
    push_enabled: true,
    sound_enabled: true,
    sound_volume: 70,
    sound_choice: "suave" as "suave" | "classico" | "alerta",
    notify_when_chat_open: false,
    notify_when_assigned_only: false,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
  });

  useEffect(() => {
    if (prefs) {
      setLocal({
        push_enabled: prefs.push_enabled ?? true,
        sound_enabled: prefs.sound_enabled ?? true,
        sound_volume: prefs.sound_volume ?? 70,
        sound_choice: (prefs.sound_choice as "suave" | "classico" | "alerta") ?? "suave",
        notify_when_chat_open: prefs.notify_when_chat_open ?? false,
        notify_when_assigned_only: prefs.notify_when_assigned_only ?? false,
        quiet_hours_enabled: prefs.quiet_hours_enabled ?? false,
        quiet_hours_start: (prefs.quiet_hours_start ?? "22:00").slice(0, 5),
        quiet_hours_end: (prefs.quiet_hours_end ?? "08:00").slice(0, 5),
      });
    }
  }, [prefs]);

  const saveMut = useMutation({
    mutationFn: () => savePrefs({ data: { workspace_id: ws!.id, ...local } }),
    onSuccess: () => {
      toast.success("Preferências salvas");
      qc.invalidateQueries({ queryKey: ["notif-prefs", ws?.id] });
    },
    onError: (e) => toast.error(`Erro: ${(e as Error).message}`),
  });

  const removeMut = useMutation({
    mutationFn: (external_id: string) => removeDevice({ data: { external_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-devices"] }),
  });

  const testMut = useMutation({
    mutationFn: () => testPush({ data: { workspace_id: ws!.id } }),
    onSuccess: () => toast.success("Notificação de teste enviada"),
    onError: (e) => toast.error(`Erro: ${(e as Error).message}`),
  });

  const handlePlaySound = async () => {
    await unlockSound();
    playNotificationSound(local.sound_choice, local.sound_volume);
  };

  const permission = typeof Notification !== "undefined" ? Notification.permission : "default";
  const swReady = typeof navigator !== "undefined" && "serviceWorker" in navigator;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="text-sm text-muted-foreground">Push, som e regras de quando ser avisado.</p>
      </header>

      {/* Push */}
      <Card className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-semibold">Push notifications</h2>
            <p className="text-xs text-muted-foreground">Avisa você mesmo com a aba fechada.</p>
          </div>
          <Switch
            checked={local.push_enabled}
            onCheckedChange={(v) => setLocal((p) => ({ ...p, push_enabled: v }))}
          />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Permissão do navegador:</span>
            <Badge variant={permission === "granted" ? "default" : "destructive"}>
              {permission === "granted" ? "Permitido" : permission === "denied" ? "Bloqueado" : "Não pedido"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Provider configurado:</span>
            <Badge variant={cfg?.push_configured ? "default" : "destructive"}>
              {cfg?.push_configured ? "OneSignal pronto" : "Faltam chaves OneSignal"}
            </Badge>
          </div>
          <Button onClick={() => testMut.mutate()} size="sm" disabled={!cfg?.push_configured || testMut.isPending}>
            Enviar notificação de teste
          </Button>
        </div>
      </Card>

      {/* Som */}
      <Card className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <Volume2 className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-semibold">Som interno</h2>
            <p className="text-xs text-muted-foreground">Toca quando você está com o MultiZap aberto.</p>
          </div>
          <Switch
            checked={local.sound_enabled}
            onCheckedChange={(v) => setLocal((p) => ({ ...p, sound_enabled: v }))}
          />
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Som</Label>
            <Select value={local.sound_choice} onValueChange={(v) => setLocal((p) => ({ ...p, sound_choice: v as "suave" | "classico" | "alerta" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="suave">Suave</SelectItem>
                <SelectItem value="classico">Clássico</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Volume: {local.sound_volume}%</Label>
            <Slider value={[local.sound_volume]} max={100} step={5} onValueChange={(v) => setLocal((p) => ({ ...p, sound_volume: v[0] }))} />
          </div>
          <Button variant="outline" size="sm" onClick={handlePlaySound}>
            <PlayCircle className="mr-1 h-4 w-4" /> Testar som
          </Button>
        </div>
      </Card>

      {/* Regras */}
      <Card className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-semibold">Regras</h2>
            <p className="text-xs text-muted-foreground">Quando e como ser avisado.</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <Label>Só notificar conversas atribuídas a mim</Label>
            <Switch checked={local.notify_when_assigned_only} onCheckedChange={(v) => setLocal((p) => ({ ...p, notify_when_assigned_only: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Notificar mesmo com a conversa aberta</Label>
            <Switch checked={local.notify_when_chat_open} onCheckedChange={(v) => setLocal((p) => ({ ...p, notify_when_chat_open: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Horário silencioso</Label>
            <Switch checked={local.quiet_hours_enabled} onCheckedChange={(v) => setLocal((p) => ({ ...p, quiet_hours_enabled: v }))} />
          </div>
          {local.quiet_hours_enabled && (
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs">Início</Label>
                <Input type="time" value={local.quiet_hours_start} onChange={(e) => setLocal((p) => ({ ...p, quiet_hours_start: e.target.value }))} />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Fim</Label>
                <Input type="time" value={local.quiet_hours_end} onChange={(e) => setLocal((p) => ({ ...p, quiet_hours_end: e.target.value }))} />
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending ? "Salvando..." : "Salvar preferências"}
        </Button>
      </div>

      {/* Dispositivos */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Meus dispositivos</h2>
        </div>
        {(!devices || devices.length === 0) ? (
          <p className="text-xs text-muted-foreground">Nenhum dispositivo inscrito ainda. Ative as notificações pra registrar.</p>
        ) : (
          <ul className="space-y-2">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div>
                  <p className="font-medium">{d.device_type ?? "device"} · {d.os ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">{d.browser ?? d.external_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.is_active ? "default" : "secondary"}>{d.is_active ? "Ativo" : "Inativo"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => removeMut.mutate(d.external_id ?? "")}>Remover</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Diagnóstico */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Diagnóstico</h2>
        </div>
        <div className="space-y-1 text-sm">
          <p>Service Worker: <Badge variant={swReady ? "default" : "destructive"}>{swReady ? "suportado" : "não suportado"}</Badge></p>
          <p>Provider: <Badge>OneSignal</Badge></p>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Últimos eventos</p>
          {(!events || events.length === 0) ? (
            <p className="text-xs text-muted-foreground">Nenhum evento ainda.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between border-b pb-1">
                  <span>{e.type} · <span className="text-muted-foreground">{formatDateTimeBR(e.created_at)}</span></span>
                  <Badge variant={e.status === "sent" ? "default" : e.status === "failed" ? "destructive" : "secondary"}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
