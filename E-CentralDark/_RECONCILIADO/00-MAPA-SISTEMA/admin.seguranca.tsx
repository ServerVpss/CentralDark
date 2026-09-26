import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, AlertTriangle, ListChecks, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listSecurityEvents, getSecuritySummary } from "@/lib/security-events.functions";

export const Route = createFileRoute("/admin/seguranca")({ component: SegurancaPage });

function SegurancaPage() {
  const fetchEvents = useServerFn(listSecurityEvents);
  const fetchSummary = useServerFn(getSecuritySummary);

  const [kind, setKind] = useState<"all" | "blocked" | "check_failed">("all");
  const [operation, setOperation] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [periodHours, setPeriodHours] = useState<number>(24);

  const summary = useQuery({ queryKey: ["sec-summary"], queryFn: () => fetchSummary() });
  const events = useQuery({
    queryKey: ["sec-events", kind, operation, workspaceId, periodHours],
    queryFn: () => fetchEvents({ data: {
      kind,
      operation: operation || null,
      workspace_id: workspaceId || null,
      period_hours: periodHours,
      limit: 200,
    }}),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6" /> Segurança</h1>
          <p className="text-sm text-muted-foreground">Eventos de rate limit, bloqueios e falhas de checagem.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { summary.refetch(); events.refetch(); }}>
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Bloqueados (24h)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{summary.data?.blocked_24h ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500" /> Falhas de checagem (24h)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{summary.data?.check_failed_24h ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4" /> Bloqueios totais</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{summary.data?.blocked_total ?? "—"}</div></CardContent>
        </Card>
      </div>

      {summary.data?.top_operations?.length ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Operações mais bloqueadas (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.data.top_operations.map((o) => (
                <Badge key={o.operation} variant="secondary" className="text-sm">{o.operation} — {o.count}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle className="text-base">Filtros</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Tipo</label>
            <Select value={kind} onValueChange={(v) => setKind(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="blocked">Bloqueados (limite atingido)</SelectItem>
                <SelectItem value="check_failed">Falhas de checagem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Operação</label>
            <Input value={operation} onChange={(e) => setOperation(e.target.value)} placeholder="user.create, invite.accept..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Workspace (UUID)</label>
            <Input value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} placeholder="opcional" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Período</label>
            <Select value={String(periodHours)} onValueChange={(v) => setPeriodHours(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Última hora</SelectItem>
                <SelectItem value="24">Últimas 24h</SelectItem>
                <SelectItem value="168">Últimos 7 dias</SelectItem>
                <SelectItem value="720">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Eventos</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead>IP (hash)</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Carregando...</TableCell></TableRow>
                ) : (events.data ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Nenhum evento no período.</TableCell></TableRow>
                ) : (events.data ?? []).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(e.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      {e.action === "rate_limit_blocked"
                        ? <Badge variant="destructive">Bloqueado</Badge>
                        : <Badge className="bg-orange-500">Falha checagem</Badge>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{e.operation ?? "—"}</TableCell>
                    <TableCell className="text-xs">{e.actor_name ?? <span className="text-muted-foreground">anônimo</span>}</TableCell>
                    <TableCell className="text-xs">{e.workspace_name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{e.bucket ?? "—"}</TableCell>
                    <TableCell className="font-mono text-[10px]">{e.ip_hash ? e.ip_hash.slice(0, 12) + "…" : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {e.retry_after_seconds ? `Retry em ${e.retry_after_seconds}s` : ""}
                      {e.error ? <span className="text-red-500"> {e.error}</span> : ""}
                      {e.fail_mode ? <span className="ml-1">({e.fail_mode})</span> : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
