# MISSAO - app.notificacoes-config.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\routes\app.notificacoes-config.tsx
**SHA:** 4bace0d24f79a692
**Timestamp:** 2026-08-26T19:33:56.918286
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- quiet_hours_start: "22:00",
- quiet_hours_start: (prefs.quiet_hours_start ?? "22:00").slice(0, 5),
- <Input type="time" value={local.quiet_hours_start} onChange={(e) => setLocal((p) => ({ ...p, quiet_hours_start: e.target.value }))} />

### Ouro Bruto (primeiros 5000 chars)
```
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
            <h2 className="font-semibold
```