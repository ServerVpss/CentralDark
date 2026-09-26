import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listWebhookTrace, getWebhookTraceTimeline } from "@/lib/webhook-trace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingDots } from "@/components/ui/loading-dots";
import { formatDateTimeBR } from "@/lib/datetime";

export const Route = createFileRoute("/admin/webhooks-log")({ component: WebhooksLogPage });

const STAGES = [
  { v: "", label: "Todas etapas" },
  { v: "crm_received", label: "CRM recebeu" },
  { v: "crm_saved", label: "CRM salvou" },
  { v: "failed", label: "Falhou" },
  { v: "gateway_in", label: "Gateway recebeu" },
  { v: "gateway_forward", label: "Gateway encaminhou" },
  { v: "chat_rendered", label: "Apareceu no chat" },
];

const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGES.map((s) => [s.v, s.label]));

function stageBadge(stage: string) {
  const ok = stage === "crm_saved" || stage === "chat_rendered" || stage === "gateway_forward";
  const bad = stage === "failed";
  const bg = bad ? "rgba(239,68,68,.15)" : ok ? "rgba(34,197,94,.15)" : "rgba(148,163,184,.15)";
  const color = bad ? "#ef4444" : ok ? "#22c55e" : "#94a3b8";
  return (
    <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
      {STAGE_LABEL[stage] ?? stage}
    </span>
  );
}

function WebhooksLogPage() {
  const [stage, setStage] = useState("");
  const [phone, setPhone] = useState("");
  const [correlationId, setCorrelationId] = useState("");
  const [sinceMinutes, setSinceMinutes] = useState(60 * 24);
  const [openTimeline, setOpenTimeline] = useState<string | null>(null);

  const listFn = useServerFn(listWebhookTrace);
  const timelineFn = useServerFn(getWebhookTraceTimeline);

  const q = useQuery({
    queryKey: ["webhook-trace", stage, phone, correlationId, sinceMinutes],
    queryFn: () => listFn({ data: {
      stage: stage || undefined,
      phone: phone || undefined,
      correlationId: correlationId || undefined,
      sinceMinutes,
      limit: 200,
    } as any }),
    refetchInterval: 15_000,
  });

  const timelineQ = useQuery({
    queryKey: ["webhook-trace-timeline", openTimeline],
    queryFn: () => timelineFn({ data: { correlationId: openTimeline! } }),
    enabled: !!openTimeline,
  });

  const rows = q.data?.rows ?? [];

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Logs de Webhook</h1>
        <p className="text-sm text-muted-foreground">
          Rastreamento de cada mensagem: Gateway → CRM → Chat. Clique numa linha para ver a linha do tempo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <Label>Etapa</Label>
          <Select value={stage || "__all__"} onValueChange={(v) => setStage(v === "__all__" ? "" : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas etapas</SelectItem>
              {STAGES.filter((s) => s.v).map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Telefone (4+ dígitos)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ex: 5511..." />
        </div>
        <div>
          <Label>Correlation ID</Label>
          <Input value={correlationId} onChange={(e) => setCorrelationId(e.target.value)} placeholder="ID da mensagem" />
        </div>
        <div>
          <Label>Janela</Label>
          <Select value={String(sinceMinutes)} onValueChange={(v) => setSinceMinutes(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="60">Última 1h</SelectItem>
              <SelectItem value="360">Últimas 6h</SelectItem>
              <SelectItem value="1440">Últimas 24h</SelectItem>
              <SelectItem value="10080">Últimos 7 dias</SelectItem>
              <SelectItem value="43200">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={() => q.refetch()} className="w-full">Atualizar</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">Data/Hora</th>
              <th className="text-left p-2">Etapa</th>
              <th className="text-left p-2">Telefone</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">HTTP</th>
              <th className="text-left p-2">Erro</th>
              <th className="text-left p-2">Correlation</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr><td colSpan={7} className="p-6 text-center"><LoadingDots size="sm" label="Carregando" /></td></tr>
            )}
            {!q.isLoading && rows.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum registro na janela escolhida.</td></tr>
            )}
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => setOpenTimeline(r.correlation_id)}>
                <td className="p-2 whitespace-nowrap">{formatDateTimeBR(r.created_at)}</td>
                <td className="p-2">{stageBadge(r.stage)}</td>
                <td className="p-2">{r.contact_phone ?? "—"} {r.is_group ? "👥" : ""}</td>
                <td className="p-2">{r.media_kind ?? "—"}</td>
                <td className="p-2">{r.http_status ?? "—"}</td>
                <td className="p-2 text-red-500 max-w-[200px] truncate">{r.error_reason ?? ""}</td>
                <td className="p-2 font-mono text-xs max-w-[200px] truncate">{r.correlation_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!openTimeline} onOpenChange={(o) => !o && setOpenTimeline(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Linha do tempo da mensagem</DialogTitle>
          </DialogHeader>
          {timelineQ.isLoading ? (
            <LoadingDots size="sm" label="Carregando" />
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              <div className="text-xs font-mono break-all text-muted-foreground">{openTimeline}</div>
              {(timelineQ.data?.rows ?? []).map((r: any, i: number) => (
                <div key={r.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    {stageBadge(r.stage)}
                    <span className="text-xs text-muted-foreground">{formatDateTimeBR(r.created_at)}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    {r.source && <div><b>Origem:</b> {r.source}</div>}
                    {r.http_status && <div><b>HTTP:</b> {r.http_status}</div>}
                    {r.error_reason && <div className="text-red-500"><b>Erro:</b> {r.error_reason}</div>}
                    {r.payload_summary && <pre className="bg-muted p-2 rounded mt-1 overflow-auto">{JSON.stringify(r.payload_summary, null, 2)}</pre>}
                  </div>
                </div>
              ))}
              {(timelineQ.data?.rows ?? []).length === 0 && <p className="text-muted-foreground">Sem etapas registradas.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
