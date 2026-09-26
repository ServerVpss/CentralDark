// Painel master: monitoramento ao vivo de saúde do sistema.
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Bell, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listMonitorHeartbeats,
  forceMonitorCheck,
  sendMonitorTestAlert,
} from "@/lib/monitor.functions";

export const Route = createFileRoute("/admin/monitor")({
  component: MonitorPage,
});

const STATUS_META: Record<string, { label: string; cls: string; Icon: any }> = {
  ok: { label: "Tudo certo", cls: "text-emerald-500", Icon: CheckCircle2 },
  warn: { label: "Atenção", cls: "text-amber-500", Icon: AlertTriangle },
  down: { label: "Fora do ar", cls: "text-red-500", Icon: XCircle },
  unknown: { label: "Não verificado", cls: "text-muted-foreground", Icon: HelpCircle },
};

function MonitorPage() {
  const listFn = useServerFn(listMonitorHeartbeats);
  const forceFn = useServerFn(forceMonitorCheck);
  const testFn = useServerFn(sendMonitorTestAlert);
  const qc = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["monitor-heartbeats"],
    queryFn: () => listFn({}),
    refetchInterval: 30_000,
  });

  const forceM = useMutation({
    mutationFn: () => forceFn({}),
    onSuccess: () => {
      toast.success("Checagem feita. Veja o resultado abaixo.");
      qc.invalidateQueries({ queryKey: ["monitor-heartbeats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testM = useMutation({
    mutationFn: () => testFn({}),
    onSuccess: (r) => {
      if (r.ok) toast.success("Mensagem de teste enviada pro Telegram.");
      else toast.error(`Falhou: ${r.error}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Pega o status mais recente de cada alvo
  const latestByTarget = new Map<string, any>();
  (rows ?? []).forEach((r) => {
    if (!latestByTarget.has(r.target)) latestByTarget.set(r.target, r);
  });
  const latest = Array.from(latestByTarget.values());

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Monitoramento ao vivo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Checagem automática a cada 2 minutos. Alertas saem no Telegram.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => testM.mutate()} disabled={testM.isPending}>
            <Bell className="h-4 w-4 mr-2" />
            {testM.isPending ? "Enviando…" : "Disparar teste no Telegram"}
          </Button>
          <Button onClick={() => forceM.mutate()} disabled={forceM.isPending}>
            {forceM.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Forçar checagem agora
          </Button>
        </div>
      </div>

      {/* Status atual por alvo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {latest.length === 0 && !isLoading && (
          <Card className="p-4 col-span-full text-sm text-muted-foreground">
            Nenhuma checagem registrada ainda. Clique em "Forçar checagem agora".
          </Card>
        )}
        {latest.map((r) => {
          const meta = STATUS_META[r.status] ?? STATUS_META.unknown;
          const Icon = meta.Icon;
          return (
            <Card key={r.target} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-muted-foreground">{r.target}</span>
                <Icon className={`h-5 w-5 ${meta.cls}`} />
              </div>
              <div className={`text-lg font-semibold ${meta.cls}`}>{meta.label}</div>
              <div className="text-xs text-muted-foreground">
                Resposta: {r.latency_ms}ms<br />
                Checado: {new Date(r.created_at).toLocaleString("pt-BR")}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Histórico */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b font-medium">Últimas 100 checagens</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Quando</th>
                <th className="text-left p-3">Alvo</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Resposta</th>
                <th className="text-left p-3">Alerta?</th>
                <th className="text-left p-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Carregando…
                  </td>
                </tr>
              )}
              {(rows ?? []).map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.unknown;
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 font-mono text-xs">{r.target}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={meta.cls}>
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="p-3">{r.latency_ms}ms</td>
                    <td className="p-3">
                      {r.alert_sent ? (
                        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/40">
                          enviado
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 max-w-md">
                      <pre className="text-[10px] text-muted-foreground truncate">
                        {JSON.stringify(r.details)}
                      </pre>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
