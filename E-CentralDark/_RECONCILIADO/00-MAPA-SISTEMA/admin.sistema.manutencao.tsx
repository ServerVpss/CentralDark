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
        <CardContent className="space-y-4">
          {cfg.isLoading ? (
            <LoadingDots size="sm" />
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Janela ativa</p>
                  <p className="text-xs text-muted-foreground">
                    Quando ligada, o banner aparece pra atendentes durante o horário e o cron pode rodar tarefas agendadas.
                  </p>
                </div>
                <Switch
                  checked={eff.enabled}
                  onCheckedChange={(v) => setEnabled(v)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Início (HH:MM)</Label>
                  <Input value={eff.start} onChange={(e) => setStart(e.target.value)} placeholder="03:00" />
                </div>
                <div>
                  <Label>Fim (HH:MM)</Label>
                  <Input value={eff.end} onChange={(e) => setEnd(e.target.value)} placeholder="05:00" />
                </div>
                <div>
                  <Label>Avisar antes (min)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={String(eff.warn)}
                    onChange={(e) => setWarn(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Novo agendamento */}
      <Card>
        <CardHeader>
          <CardTitle>Agendar manutenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Tipo</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wuzapi_update">Atualizar WuzAPI</SelectItem>
                  <SelectItem value="gateway_deploy">Deploy Gateway (manual)</SelectItem>
                  <SelectItem value="custom">Outra (manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quando</Label>
              <Input type="datetime-local" value={newWhen} onChange={(e) => setNewWhen(e.target.value)} />
            </div>
            <div>
              <Label>Observação (opcional)</Label>
              <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Ex.: pull asternic/wuzapi:latest" />
            </div>
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="mr-2 h-4 w-4" /> Agendar
          </Button>
          <p className="text-xs text-muted-foreground">
            Tipos diferentes de WuzAPI ficam como marcação (executar manualmente). O cron roda a cada 1 min e dispara o agendamento na hora marcada.
          </p>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Quando</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Fim</th>
                  <th className="px-3 py-2">Erro</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {list.isLoading && (
                  <tr><td colSpan={6} className="p-4 text-center"><LoadingDots size="sm" /></td></tr>
                )}
                {!list.isLoading && (list.data ?? []).length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum agendamento.</td></tr>
                )}
                {(list.data ?? []).map((r) => {
                  const row = r as {
                    id: string; type: string; status: string;
                    scheduled_for: string; finished_at: string | null; error: string | null;
                  };
                  return (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2">{labelType(row.type)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDateTimeBR(row.scheduled_for)}</td>
                      <td className="px-3 py-2"><Badge variant={tone(row.status)}>{labelStatus(row.status)}</Badge></td>
                      <td className="px-3 py-2 text-muted-foreground">{row.finished_at ? formatDateTimeBR(row.finished_at) : "—"}</td>
                      <td className="px-3 py-2 text-xs text-destructive">{row.error ?? ""}</td>
                      <td className="px-3 py-2 text-right">
                        {row.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => cancel.mutate(row.id)} disabled={cancel.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
