# COMANDO - admin.sistema.manutencao.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.sistema.manutencao.tsx
**SHA:** b67a47cc2f018c3d
**Timestamp:** 2026-08-26T19:31:50.853490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: start || cfg.data?.maintenance_window_start || "03:00",
- maintenance_window_start: eff.start,

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminGetMaintenanceSettings,
  adminUpdateMaintenanceSettings,
  adminListMaintenanceSchedules,
  adminCreateMaintenanceSchedule,
  adminCancelMaintenanceSchedule,
} from "@/lib/maintenance.functions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeBR } from "@/lib/datetime";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/sistema/manutencao")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const getCfg = useServerFn(adminGetMaintenanceSettings);
  const setCfg = useServerFn(adminUpdateMaintenanceSettings);
  const listFn = useServerFn(adminListMaintenanceSchedules);
  const createFn = useServerFn(adminCreateMaintenanceSchedule);
  const cancelFn = useServerFn(adminCancelMaintenanceSchedule);

  const cfg = useQuery({
    queryKey: ["maintenance-settings"],
    queryFn: () => getCfg(),
  });
  const list = useQuery({
    queryKey: ["maintenance-schedules"],
    queryFn: () => listFn(),
    refetchInterval: 15_000,
  });

  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [warn, setWarn] = useState<number | "">("");

  const eff = {
    enabled: enabled ?? cfg.data?.maintenance_window_enabled ?? false,
    start: start || cfg.data?.maintenance_window_start || "03:00",
    end: end || cfg.data?.maintenance_window_end || "05:00",
    warn:
      warn === ""
        ? (cfg.data?.maintenance_banner_minutes_before ?? 10)
        : Number(warn),
  };

  const save = useMutation({
    mutationFn: async () =>
      setCfg({
        data: {
          maintenance_window_enabled: eff.enabled,
          maintenance_window_start: eff.start,
          maintenance_window_end: eff.end,
          maintenance_banner_minutes_before: eff.warn,
        },
      }),
    onSuccess: () => {
      toast.success("Janela atualizada.");
      qc.invalidateQueries({ queryKey: ["maintenance-settings"] });
      setEnabled(null);
      setStart("");
      setEnd("");
      setWarn("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  // Form agendamento
  const [newType, setNewType] = useState<"wuzapi_update" | "gateway_deploy" | "custom">("wuzapi_update");
  const [newWhen, setNewWhen] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      if (!newWhen) throw new Error("Escolha data e hora.");
      return createFn({
        data: { type: newType, scheduled_for: new Date(newWhen).toISOString(), notes: newNotes || undefined },
      });
    },
    onSuccess: () => {
      toast.success("Agendado.");
      setNewWhen("");
      setNewNotes("");
      qc.invalidateQueries({ queryKey: ["maintenance-schedules"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Cancelado.");
      qc.invalidateQueries({ queryKey: ["maintenance-schedules"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const labelType = (t: string) =>
    t === "wuzapi_update" ? "Atualizar WuzAPI" : t === "gateway_deploy" ? "Deploy Gateway" : "Outra";
  const tone = (s: string): "default" | "secondary" | "destructive" | "outline" =>
    s === "done" ? "secondary" : s === "failed" ? "destructive" : s === "running" ? "default" : "outline";
  const labelStatus = (s: string) =>
    ({ pending: "Pendente", running: "Rodando", done: "Concluído", failed: "Falhou", cancelled: "Cancelado" })[s] ?? s;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Wrench className="h-6 w-6" /> Janela de manutenção
        </h1>
        <p className="text-sm text-muted-foreground">
          Define o horário seguro pra rodar atualizações automaticamente e mostra aviso aos atendentes em <span className="font-mono">/app/chat</span>.
        </p>
      </div>

      {/* Configuração da janela */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
        </CardHeader>
        <CardContent classNam
```