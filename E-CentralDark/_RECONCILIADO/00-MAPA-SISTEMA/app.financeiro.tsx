import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFinanceiroOverview,
  listFinanceiroPix,
  listFinanceiroLedger,
  listCollectionEvents,
  pauseCollection,
  resumeCollection,
  cancelPixFromFinance,
} from "@/lib/financeiro.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Wallet, TrendingUp, TrendingDown, Receipt, Clock, XCircle, CheckCircle2,
  Pause, Play, Ban, Copy,
} from "lucide-react";

export const Route = createFileRoute("/app/financeiro")({
  component: FinanceiroPage,
});

const BRL = (n: number) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDT = (s: string | null | undefined) => (s ? new Date(s).toLocaleString("pt-BR") : "—");

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDENTE: "outline",
  COMPLETO: "default",
  EXPIRADO: "secondary",
  CANCELADO: "destructive",
};

const CHANNEL_LABEL: Record<string, string> = {
  meta_cloud: "Meta Cloud API",
  wuzapi_gateway: "MultiZap QR / WuzAPI",
  baileys_selfhosted: "Baileys",
};

function FinanceiroPage() {
  const wsQuery = useCurrentWorkspace();
  const workspaceId = wsQuery.data?.id;
  if (!workspaceId) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <Skeleton className="h-32" />
      </div>
    );
  }
  return <FinanceiroBody workspaceId={workspaceId} />;
}

function FinanceiroBody({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const fetchOverview = useServerFn(getFinanceiroOverview);
  const fetchPix = useServerFn(listFinanceiroPix);
  const fetchLedger = useServerFn(listFinanceiroLedger);
  const fetchEvents = useServerFn(listCollectionEvents);
  const pauseFn = useServerFn(pauseCollection);
  const resumeFn = useServerFn(resumeCollection);
  const cancelFn = useServerFn(cancelPixFromFinance);

  const [status, setStatus] = useState<"PENDENTE" | "COMPLETO" | "EXPIRADO" | "CANCELADO" | "all">("all");
  const [channel, setChannel] = useState<"meta_cloud" | "wuzapi_gateway" | "baileys_selfhosted" | "all">("all");
  const [period, setPeriod] = useState<"today" | "yesterday" | "week" | "month" | "all">("month");

  const range = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "yesterday") { start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0); }
    else if (period === "week") start.setDate(start.getDate() - 7);
    else if (period === "month") start.setDate(start.getDate() - 30);
    else return {};
    return { from: start.toISOString(), to: now.toISOString() };
  }, [period]);

  const overviewQ = useQuery({
    queryKey: ["fin-overview", workspaceId],
    queryFn: () => fetchOverview({ data: { workspaceId } }),
    refetchInterval: 30_000,
  });

  const pixQ = useQuery({
    queryKey: ["fin-pix", workspaceId, status, channel, period],
    queryFn: () =>
      fetchPix({
        data: { workspaceId, status, channel, ...range, limit: 50, offset: 0 },
      }),
    refetchInterval: 20_000,
  });

  const ledgerQ = useQuery({
    queryKey: ["fin-ledger", workspaceId, period],
    queryFn: () => fetchLedger({ data: { workspaceId, ...range, limit: 50, offset: 0 } }),
  });

  const eventsQ = useQuery({
    queryKey: ["fin-events", workspaceId],
    queryFn: () => fetchEvents({ data: { workspaceId, limit: 50 } }),
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["fin-pix"] });
    qc.invalidateQueries({ queryKey: ["fin-overview"] });
    qc.invalidateQueries({ queryKey: ["fin-events"] });
  };

  const pauseMut = useMutation({
    mutationFn: (pixId: string) => pauseFn({ data: { workspaceId, pixId } }),
    onSuccess: () => { toast.success("Cobrança pausada."); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const resumeMut = useMutation({
    mutationFn: (pixId: string) => resumeFn({ data: { workspaceId, pixId } }),
    onSuccess: () => { toast.success("Cobrança reativada."); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancelMut = useMutation({
    mutationFn: (pixId: string) => cancelFn({ data: { workspaceId, pixId } }),
    onSuccess: () => { toast.success("PIX cancelado."); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const o = overviewQ.data;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" />
          Financeiro
        </h1>
        <p className="text-muted-foreground text-sm">
          Caixa, cobranças PIX e fluxo financeiro do workspace.
        </p>
      </header>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Entradas hoje" value={BRL(o?.entradas_hoje ?? 0)} tone="success" loading={overviewQ.isLoading} />
        <MetricCard icon={<TrendingDown className="h-4 w-4" />} label="Saídas hoje" value={BRL(o?.saidas_hoje ?? 0)} tone="destructive" loading={overviewQ.isLoading} />
        <MetricCard icon={<Wallet className="h-4 w-4" />} label="Lucro bruto" value={BRL(o?.lucro_bruto ?? 0)} loading={overviewQ.isLoading} />
        <MetricCard icon={<CheckCircle2 className="h-4 w-4" />} label="PIX pagos hoje" value={String(o?.pix_pagos_hoje ?? 0)} sub={BRL(o?.pix_pagos_hoje_valor ?? 0)} loading={overviewQ.isLoading} />
        <MetricCard icon={<Clock className="h-4 w-4" />} label="PIX pendentes" value={String(o?.pix_pendentes ?? 0)} loading={overviewQ.isLoading} />
        <MetricCard icon={<XCircle className="h-4 w-4" />} label="PIX expirados" value={String(o?.pix_expirados ?? 0)} loading={overviewQ.isLoading} />
        <MetricCard icon={<Receipt className="h-4 w-4" />} label="Ticket médio" value={BRL(o?.ticket_medio ?? 0)} loading={overviewQ.isLoading} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Receita semana" value={BRL(o?.receita_semana ?? 0)} loading={overviewQ.isLoading} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Receita mês" value={BRL(o?.receita_mes ?? 0)} loading={overviewQ.isLoading} />
      </div>

      <Tabs defaultValue="pix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pix">Cobranças PIX</TabsTrigger>
          <TabsTrigger value="caixa">Fluxo de caixa</TabsTrigger>
          <TabsTrigger value="eventos">Eventos de cobrança</TabsTrigger>
        </TabsList>

        {/* ===== PIX ===== */}
        <TabsContent value="pix" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="week">7 dias</SelectItem>
                <SelectItem value="month">30 dias</SelectItem>
                <SelectItem value="all">Tudo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="PENDENTE">Pendentes</SelectItem>
                <SelectItem value="COMPLETO">Pagos</SelectItem>
                <SelectItem value="EXPIRADO">Expirados</SelectItem>
                <SelectItem value="CANCELADO">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos canais</SelectItem>
                <SelectItem value="meta_cloud">Meta Cloud API</SelectItem>
                <SelectItem value="wuzapi_gateway">MultiZap QR / WuzAPI</SelectItem>
                <SelectItem value="baileys_selfhosted">Baileys</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {pixQ.isLoading ? (
                <div className="p-6"><Skeleton className="h-64" /></div>
              ) : (pixQ.data?.rows.length ?? 0) === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  Nenhuma cobrança encontrada para este filtro.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Gateway</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Criado</TableHead>
                        <TableHead>Expira</TableHead>
                        <TableHead>Pago em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pixQ.data?.rows.map((r) => {
                        const meta = (r.metadata ?? {}) as { collection_paused?: boolean };
                        const paused = !!meta.collection_paused;
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div className="font-medium">{r.contact_name ?? "—"}</div>
                              <div className="text-xs text-muted-foreground">{r.contact_phone ?? ""}</div>
                            </TableCell>
                            <TableCell className="font-mono">{BRL(Number(r.amount))}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>{r.status}</Badge>
                                {paused && <Badge variant="secondary" className="text-xs">Pausada</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{r.provider}</TableCell>
                            <TableCell className="text-xs">{CHANNEL_LABEL[r.connection_provider ?? ""] ?? (r.connection_provider ?? "—")}</TableCell>
                            <TableCell className="text-xs">{fmtDT(r.created_at)}</TableCell>
                            <TableCell className="text-xs">{fmtDT(r.expires_at)}</TableCell>
                            <TableCell className="text-xs">{fmtDT(r.paid_at)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {r.copy_paste && (
                                  <Button size="icon" variant="ghost" title="Copiar PIX"
                                    onClick={() => { navigator.clipboard.writeText(r.copy_paste!); toast.success("PIX copiado."); }}>
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {r.status === "PENDENTE" && (
                                  <>
                                    {paused ? (
                                      <Button size="icon" variant="ghost" title="Reativar cobrança"
                                        onClick={() => resumeMut.mutate(r.id)} disabled={resumeMut.isPending}>
                                        <Play className="h-3.5 w-3.5" />
                                      </Button>
                                    ) : (
                                      <Button size="icon" variant="ghost" title="Pausar cobrança"
                                        onClick={() => pauseMut.mutate(r.id)} disabled={pauseMut.isPending}>
                                        <Pause className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    <Button size="icon" variant="ghost" title="Cancelar PIX"
                                      onClick={() => { if (confirm("Cancelar este PIX?")) cancelMut.mutate(r.id); }}
                                      disabled={cancelMut.isPending}>
                                      <Ban className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Caixa ===== */}
        <TabsContent value="caixa">
          <Card>
            <CardContent className="p-0">
              {ledgerQ.isLoading ? (
                <div className="p-6"><Skeleton className="h-64" /></div>
              ) : (ledgerQ.data?.rows.length ?? 0) === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  Nenhuma entrada/saída registrada no período.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerQ.data?.rows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Badge variant={r.type === "income" ? "default" : "destructive"}>
                              {r.type === "income" ? "Entrada" : "Saída"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{r.source}</TableCell>
                          <TableCell className="font-mono">{BRL(Number(r.amount))}</TableCell>
                          <TableCell className="text-xs max-w-md truncate">{r.description}</TableCell>
                          <TableCell className="text-xs">{fmtDT(r.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Eventos ===== */}
        <TabsContent value="eventos">
          <Card>
            <CardHeader><CardTitle className="text-base">Histórico de cobrança automática</CardTitle></CardHeader>
            <CardContent className="p-0">
              {eventsQ.isLoading ? (
                <div className="p-6"><Skeleton className="h-64" /></div>
              ) : (eventsQ.data?.rows.length ?? 0) === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  Nenhum evento de cobrança ainda.
                </div>
              ) : (
                <div className="divide-y">
                  {eventsQ.data?.rows.map((r) => (
                    <div key={r.id} className="p-3 flex items-start gap-3 text-sm">
                      <Badge variant="outline" className="shrink-0">{r.event_type}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">{fmtDT(r.created_at)} · {r.status}</div>
                        {r.message_body && <div className="text-xs mt-1 whitespace-pre-wrap line-clamp-3">{r.message_body}</div>}
                        {r.error_message && <div className="text-xs text-destructive mt-1">{r.error_message}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  icon, label, value, sub, tone, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "destructive";
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
        {loading ? <Skeleton className="h-6 w-20" /> : (
          <>
            <div className={`text-lg font-bold ${tone === "success" ? "text-green-500" : tone === "destructive" ? "text-destructive" : ""}`}>
              {value}
            </div>
            {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
