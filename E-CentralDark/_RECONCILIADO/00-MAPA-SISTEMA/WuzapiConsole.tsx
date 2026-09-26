// Console de diagnóstico WuzAPI/Gateway — restrito a super_admin.
// 3 abas:
//   1. Testes manuais → dispara chamadas whitelisted e mostra HTTP + JSON cru.
//   2. Histórico das ações → log local (em memória) das chamadas feitas no console.
//   3. Eventos recebidos → últimos N eventos crus de whatsapp_message_log.
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminGatewayRawCall,
  adminListConsoleEndpoints,
  adminListQrConnectionsForConsole,
  adminListWuzapiRawEvents,
} from "@/lib/gateway-console.functions";
import { refreshGroupInfo, backfillMissingGroupNames } from "@/lib/group-info.functions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Play, RefreshCw, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { formatDateTimeBR } from "@/lib/datetime";

type LogEntry = {
  id: string;
  at: string;
  endpoint_label: string;
  method: string;
  path: string;
  http_status: number | null;
  latency_ms: number;
  ok: boolean;
  raw_text: string;
  parse_ok: boolean;
  network_error: { kind: string; message: string } | null;
  request_body: string | null;
};

function statusColor(http: number | null, ok: boolean) {
  if (http === null) return "bg-rose-500/15 text-rose-600 border-rose-500/30";
  if (ok) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
  if (http >= 500) return "bg-rose-500/15 text-rose-600 border-rose-500/30";
  if (http >= 400) return "bg-amber-500/15 text-amber-600 border-amber-500/30";
  return "bg-muted text-foreground border-border";
}

function prettyJson(text: string, parseOk: boolean): string {
  if (!text) return "(corpo vazio)";
  if (!parseOk) return text;
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function WuzapiConsole() {
  const callFn = useServerFn(adminGatewayRawCall);
  const endpointsFn = useServerFn(adminListConsoleEndpoints);
  const connsFn = useServerFn(adminListQrConnectionsForConsole);
  const eventsFn = useServerFn(adminListWuzapiRawEvents);

  const endpoints = useQuery({ queryKey: ["gw-console-endpoints"], queryFn: () => endpointsFn() });
  const conns = useQuery({ queryKey: ["gw-console-conns"], queryFn: () => connsFn() });

  // Form state
  const [endpointId, setEndpointId] = useState<string>("gw_diag");
  const [connectionId, setConnectionId] = useState<string>("");
  const [bodyText, setBodyText] = useState<string>('{"jid":"120363409505417181@g.us"}');

  // Log local (em memória — sem persistir).
  const [log, setLog] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Eventos
  const [eventsConnFilter, setEventsConnFilter] = useState<string>("all");
  const events = useQuery({
    queryKey: ["gw-console-events", eventsConnFilter],
    queryFn: () => eventsFn({
      data: { connection_id: eventsConnFilter === "all" ? null : eventsConnFilter, limit: 50 },
    }),
    refetchInterval: 15_000,
  });

  const selectedEndpoint = useMemo(
    () => endpoints.data?.find((e) => e.id === endpointId),
    [endpoints.data, endpointId],
  );

  const needsConn = selectedEndpoint?.id?.startsWith("conn_") ?? false;
  const needsBody = selectedEndpoint?.needs_body ?? false;

  function buildPath(): string {
    if (!selectedEndpoint) return "";
    switch (selectedEndpoint.id) {
      case "gw_diag":         return "/__diag/wuzapi";
      case "gw_list":         return "/connections";
      case "conn_status":     return `/connections/${connectionId}/status`;
      case "conn_profile":    return `/connections/${connectionId}/profile-picture`;
      case "conn_group_info": return `/connections/${connectionId}/group-info`;
      default:                return "";
    }
  }

  const runM = useMutation({
    mutationFn: async () => {
      if (!selectedEndpoint) throw new Error("Selecione um endpoint.");
      if (needsConn && !connectionId) throw new Error("Selecione uma conexão.");
      let body: unknown = undefined;
      if (needsBody) {
        try {
          body = JSON.parse(bodyText || "{}");
        } catch {
          throw new Error("Body JSON inválido.");
        }
      }
      const res = await callFn({
        data: { method: selectedEndpoint.method as "GET" | "POST", path: buildPath(), body },
      });
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        at: res.called_at,
        endpoint_label: res.endpoint_label,
        method: res.method,
        path: res.path,
        http_status: res.http_status,
        latency_ms: res.latency_ms,
        ok: res.ok,
        raw_text: res.raw_text,
        parse_ok: res.parse_ok,
        network_error: res.network_error,
        request_body: needsBody ? bodyText : null,
      };
      setLog((prev) => [entry, ...prev].slice(0, 50));
      setExpanded((prev) => ({ ...prev, [entry.id]: true }));
      return entry;
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Terminal className="h-4 w-4" /> Console WuzAPI / Gateway
        </CardTitle>
        <CardDescription>
          Disparar chamadas no Gateway, ver resposta crua (HTTP + JSON) e acompanhar eventos recebidos pelo webhook. Apenas Super Admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="testes">
          <TabsList>
            <TabsTrigger value="testes">Testes manuais</TabsTrigger>
            <TabsTrigger value="historico">Histórico ({log.length})</TabsTrigger>
            <TabsTrigger value="eventos">Eventos recebidos</TabsTrigger>
          </TabsList>

          {/* ───── Testes manuais ───── */}
          <TabsContent value="testes" className="space-y-3 mt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Endpoint</label>
                <Select value={endpointId} onValueChange={setEndpointId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(endpoints.data || []).map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {needsConn && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Conexão</label>
                  <Select value={connectionId} onValueChange={setConnectionId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {(conns.data || []).map((c) => (
                        <SelectItem key={c.gateway_connection_id} value={c.gateway_connection_id}>
                          {c.name} {c.phone ? `(${c.phone})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {needsBody && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Body (JSON) — ex: <code>{`{"jid":"120363...@g.us"}`}</code> ou <code>{`{"phone":"5584..."}`}</code>
                </label>
                <Input
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => runM.mutate()} disabled={runM.isPending} size="sm">
                <Play className="h-3.5 w-3.5" /> {runM.isPending ? "Chamando…" : "Disparar"}
              </Button>
              {log.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setLog([]); setExpanded({}); }}>
                  <Trash2 className="h-3.5 w-3.5" /> Limpar histórico
                </Button>
              )}
            </div>

            {runM.error && (
              <div className="text-xs text-rose-600 border border-rose-500/30 bg-rose-500/5 rounded p-2">
                {(runM.error as Error).message}
              </div>
            )}

            {log[0] && <LogItem entry={log[0]} expanded onToggle={() => undefined} />}
          </TabsContent>

          {/* ───── Histórico ───── */}
          <TabsContent value="historico" className="mt-4">
            {log.length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center border rounded">
                Nenhuma chamada feita ainda. Use a aba "Testes manuais".
              </div>
            ) : (
              <ScrollArea className="h-[420px] pr-2">
                <div className="space-y-2">
                  {log.map((entry) => (
                    <LogItem
                      key={entry.id}
                      entry={entry}
                      expanded={!!expanded[entry.id]}
                      onToggle={() => setExpanded((p) => ({ ...p, [entry.id]: !p[entry.id] }))}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ───── Eventos recebidos ───── */}
          <TabsContent value="eventos" className="space-y-3 mt-4">
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1 max-w-sm">
                <label className="text-xs text-muted-foreground">Filtrar por conexão</label>
                <Select value={eventsConnFilter} onValueChange={setEventsConnFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {(conns.data || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="outline" onClick={() => events.refetch()} disabled={events.isFetching}>
                <RefreshCw className={events.isFetching ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              </Button>
            </div>
            {events.isLoading ? (
              <div className="text-sm text-muted-foreground p-4">Carregando…</div>
            ) : (events.data || []).length === 0 ? (
              <div className="text-sm text-muted-foreground p-6 text-center border rounded">
                Nenhum evento no recorte.
              </div>
            ) : (
              <ScrollArea className="h-[480px] pr-2">
                <div className="space-y-2">
                  {(events.data || []).map((ev) => (
                    <EventItem key={ev.id} ev={ev} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function LogItem({
  entry,
  expanded,
  onToggle,
}: {
  entry: LogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const httpLabel = entry.http_status ?? (entry.network_error ? entry.network_error.kind : "—");
  return (
    <div className="border rounded">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50 transition"
      >
        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Badge variant="outline" className="text-[10px]">{entry.method}</Badge>
        <code className="text-xs flex-1 truncate">{entry.path}</code>
        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-mono ${statusColor(entry.http_status, entry.ok)}`}>
          HTTP {httpLabel}
        </span>
        <span className="text-[10px] text-muted-foreground">{entry.latency_ms}ms</span>
      </button>
      {expanded && (
        <div className="border-t bg-muted/30 p-2 space-y-2">
          <div className="text-[10px] text-muted-foreground">
            {formatDateTimeBR(entry.at)} · {entry.endpoint_label}
          </div>
          {entry.request_body && (
            <div>
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Request body:</div>
              <pre className="text-[11px] bg-background border rounded p-2 overflow-x-auto font-mono">{entry.request_body}</pre>
            </div>
          )}
          {entry.network_error && (
            <div className="text-xs text-rose-600 border border-rose-500/30 bg-rose-500/5 rounded p-2">
              <b>{entry.network_error.kind}</b>: {entry.network_error.message}
            </div>
          )}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground mb-1">
              Response {entry.parse_ok ? "(JSON)" : "(texto cru)"}:
            </div>
            <pre className="text-[11px] bg-background border rounded p-2 overflow-x-auto font-mono whitespace-pre-wrap break-all max-h-[320px]">
              {prettyJson(entry.raw_text, entry.parse_ok)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function EventItem({ ev }: { ev: {
  id: string;
  created_at: string;
  direction: string;
  contact_phone: string;
  message_type: string;
  status: string;
  body_preview: string | null;
  error_message: string | null;
  raw_payload: unknown;
} }) {
  const [open, setOpen] = useState(false);
  const payloadStr = useMemo(() => {
    try { return JSON.stringify(ev.raw_payload, null, 2); } catch { return String(ev.raw_payload); }
  }, [ev.raw_payload]);
  return (
    <div className="border rounded">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-2 text-left hover:bg-muted/50 transition text-xs"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Badge variant={ev.direction === "inbound" ? "default" : "secondary"} className="text-[10px]">
          {ev.direction}
        </Badge>
        <Badge variant="outline" className="text-[10px]">{ev.message_type}</Badge>
        <span className="font-mono text-[11px]">{ev.contact_phone}</span>
        <span className="flex-1 truncate text-muted-foreground">{ev.body_preview ?? "—"}</span>
        <span className="text-[10px] text-muted-foreground">{formatDateTimeBR(ev.created_at)}</span>
      </button>
      {open && (
        <div className="border-t bg-muted/30 p-2 space-y-2">
          {ev.error_message && (
            <div className="text-[11px] text-rose-600">{ev.error_message}</div>
          )}
          <div>
            <div className="text-[10px] font-medium text-muted-foreground mb-1">Payload (sanitizado):</div>
            <pre className="text-[11px] bg-background border rounded p-2 overflow-x-auto font-mono whitespace-pre-wrap break-all max-h-[320px]">
              {payloadStr || "(vazio)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}


// ───────────────────────────────────────────────────────────────
// Piloto: atualiza dados (nome/participantes) de um grupo via WuzAPI.
const DEFAULT_PILOT_GROUP_ID = "80788cc9-f8c5-4634-a574-9b064f332490";

export function PilotoParte2C() {
  const fn = useServerFn(refreshGroupInfo);
  const [groupId, setGroupId] = useState(DEFAULT_PILOT_GROUP_ID);
  const [open, setOpen] = useState(false);
  const m = useMutation({
    mutationFn: (id: string) => fn({ data: { groupId: id } }),
  });
  const res = m.data;

  const statusLabel = m.isPending
    ? "rodando…"
    : res
      ? res.ok ? "ok" : `falhou (${res.reason ?? "—"})`
      : "—";
  const statusClass = m.isPending
    ? "text-muted-foreground"
    : res?.ok ? "text-emerald-600" : res ? "text-rose-600" : "text-muted-foreground";

  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px]">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground/80">Piloto · atualizar grupo:</span>
        <input
          value={groupId}
          onChange={(e) => setGroupId(e.target.value.trim())}
          placeholder="group_id (uuid)"
          className="h-6 px-2 text-[11px] rounded border bg-background w-[280px] font-mono"
        />
        <Button
          size="sm"
          variant="secondary"
          className="h-6 px-2 text-[11px]"
          onClick={() => groupId && m.mutate(groupId)}
          disabled={m.isPending || !groupId}
        >
          <Play className="h-3 w-3" />
          rodar
        </Button>
        <span className={statusClass}>{statusLabel}</span>
        {(res || m.error) && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground underline underline-offset-2 ml-auto"
          >
            {open ? "ocultar" : "detalhes"}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 border rounded p-2 bg-background/60 space-y-1 font-mono text-[10.5px]">
          {m.error && (
            <div className="text-rose-600">{(m.error as Error).message}</div>
          )}
          {res?.ok && res.changed && (
            <>
              <div>name: {res.changed.name ? `${JSON.stringify(res.changed.name.from)} → ${JSON.stringify(res.changed.name.to)}` : "sem mudança"}</div>
              <div>subject: {res.changed.subject ? `${JSON.stringify(res.changed.subject.from)} → ${JSON.stringify(res.changed.subject.to)}` : "sem mudança"}</div>
              <div>participant_count: {res.changed.participant_count ? `${res.changed.participant_count.from ?? "null"} → ${res.changed.participant_count.to}` : "sem mudança"}</div>
              <div>contato-espelho: {res.changed.contact_updated ? `id=${res.changed.contact_updated.contactId}` : "não atualizado"}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Backfill controlado: atualiza N grupos sem nome (super_admin only).
// Default 5, max 50. Só roda no clique — nunca automático.
export function BackfillGruposParte2C() {
  const fn = useServerFn(backfillMissingGroupNames);
  const [limit, setLimit] = useState(5);
  const [open, setOpen] = useState(false);
  const m = useMutation({
    mutationFn: (n: number) => fn({ data: { limit: n } }),
  });
  const res = m.data;

  const statusLabel = m.isPending
    ? "rodando…"
    : res
      ? res.ok
        ? `ok · processados=${res.processed} · atualizados=${res.updated} · falhas=${res.failed.length}`
        : `falhou (${res.reason ?? "—"})`
      : "—";
  const statusClass = m.isPending
    ? "text-muted-foreground"
    : res?.ok
      ? "text-emerald-600"
      : res
        ? "text-rose-600"
        : "text-muted-foreground";

  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px]">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground/80">Backfill · grupos sem nome:</span>
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">limite</span>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setLimit(Math.max(1, Math.min(50, Math.floor(n))));
            }}
            className="h-6 px-2 text-[11px] rounded border bg-background w-[60px] font-mono"
          />
        </label>
        <Button
          size="sm"
          variant="secondary"
          className="h-6 px-2 text-[11px]"
          onClick={() => m.mutate(limit)}
          disabled={m.isPending}
        >
          <Play className="h-3 w-3" />
          rodar backfill
        </Button>
        <span className={statusClass}>{statusLabel}</span>
        {(res || m.error) && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground underline underline-offset-2 ml-auto"
          >
            {open ? "ocultar" : "detalhes"}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 border rounded p-2 bg-background/60 space-y-1 font-mono text-[10.5px]">
          {m.error && <div className="text-rose-600">{(m.error as Error).message}</div>}
          {res?.ok && res.failed.length > 0 && (
            <>
              <div className="text-foreground/80">Falhas:</div>
              {res.failed.map((f) => (
                <div key={f.groupId} className="text-rose-600">
                  • {f.groupId} → {f.reason}
                </div>
              ))}
            </>
          )}
          {res?.ok && res.failed.length === 0 && res.processed > 0 && (
            <div className="text-emerald-600">Nenhuma falha.</div>
          )}
          {res?.ok && res.processed === 0 && (
            <div className="text-muted-foreground">Nenhum grupo "sem nome" encontrado no lote.</div>
          )}
        </div>
      )}
    </div>
  );
}
