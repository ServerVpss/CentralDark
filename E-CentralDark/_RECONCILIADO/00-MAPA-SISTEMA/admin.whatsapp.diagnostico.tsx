import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminWhatsAppDiagnostico } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeBR } from "@/lib/datetime";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Search } from "lucide-react";
import { classifyWebhookEvent, eventLabel, LEVEL_BADGE } from "@/lib/webhook-event-style";
import { LoadingDots } from "@/components/ui/loading-dots";
import { WuzapiConsole, PilotoParte2C, BackfillGruposParte2C } from "@/components/whatsapp/WuzapiConsole";

export const Route = createFileRoute("/admin/whatsapp/diagnostico")({
  component: DiagnosticoPage,
});

function fmtDate(s: string) {
  try {
    return formatDateTimeBR(s, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch { return s; }
}

function DiagnosticoPage() {
  const fn = useServerFn(adminWhatsAppDiagnostico);
  const [connectionId, setConnectionId] = useState<string>("all");
  const [direction, setDirection] = useState<"all" | "inbound" | "outbound">("all");
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-wa-diag", connectionId, direction, phone],
    queryFn: () => fn({
      data: {
        connectionId: connectionId === "all" ? null : connectionId,
        direction,
        phone: phone || null,
        limit: 200,
      },
    }),
    refetchInterval: 10000, // atualiza a cada 10s
  });

  const conns = data?.connections ?? [];
  const msgs = data?.messages ?? [];
  const events = data?.events ?? [];

  const grouped = useMemo(() => {
    const g: Record<string, typeof msgs> = {};
    for (const m of msgs) {
      const key = m.contact_phone || "?";
      g[key] = g[key] ?? [];
      g[key].push(m);
    }
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  }, [msgs]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diagnóstico WhatsApp</h1>
          <p className="text-sm text-muted-foreground">
            Rastreio completo de cada mensagem que entra ou sai. Use isso pra entender por que uma mensagem chegou (ou não) num número.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Atualizar
        </Button>
      </div>

      <PilotoParte2C />
      <BackfillGruposParte2C />

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <SummaryCard label="Conexões" value={data?.summary.connections ?? 0} />
        <SummaryCard label="Mensagens (recentes)" value={data?.summary.total_messages ?? 0} />
        <SummaryCard label="Recebidas" value={data?.summary.inbound ?? 0} accent="text-emerald-600" />
        <SummaryCard label="Enviadas" value={data?.summary.outbound ?? 0} accent="text-blue-600" />
        <SummaryCard label="Falhas" value={data?.summary.failed ?? 0} accent="text-rose-600" />
        <SummaryCard label="Webhooks suspeitos" value={data?.summary.events_invalid_sig ?? 0} accent="text-amber-600" />
      </div>

      {/* Conexões cadastradas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conexões cadastradas no sistema</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Nome da conexão</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>phone_number_id (Meta)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último webhook</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conns.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Nenhuma conexão.</TableCell></TableRow>
              )}
              {conns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.workspace_name}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.display_phone_number ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{c.phone_number_id ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "connected" ? "default" : "secondary"}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.last_webhook_at ? fmtDate(c.last_webhook_at) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Conexão</label>
            <Select value={connectionId} onValueChange={setConnectionId}>
              <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {conns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.display_phone_number ?? "?"})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Direção</label>
            <Select value={direction} onValueChange={(v) => setDirection(v as typeof direction)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tudo</SelectItem>
                <SelectItem value="inbound">Recebidas</SelectItem>
                <SelectItem value="outbound">Enviadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setPhone(phoneInput.trim()); }}
            className="flex items-end gap-2"
          >
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Telefone do contato</label>
              <Input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="ex: 5584..."
                className="w-[220px]"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              <Search className="h-4 w-4" /> Filtrar
            </Button>
            {phone && (
              <Button type="button" size="sm" variant="ghost" onClick={() => { setPhone(""); setPhoneInput(""); }}>
                Limpar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="mensagens">
        <TabsList>
          <TabsTrigger value="mensagens">Linha do tempo</TabsTrigger>
          <TabsTrigger value="por-contato">Agrupado por contato</TabsTrigger>
          <TabsTrigger value="webhooks">Eventos brutos da Meta</TabsTrigger>
        </TabsList>

        {/* TAB 1: linha do tempo */}
        <TabsContent value="mensagens">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              {isLoading ? (
                <div className="p-6 text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>
              ) : msgs.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">Nenhuma mensagem encontrada com os filtros atuais.</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead className="w-[130px] py-2">Quando</TableHead>
                        <TableHead className="w-[120px] py-2">Contato</TableHead>
                        <TableHead className="w-[200px] py-2">Conexão</TableHead>
                        <TableHead className="py-2">Conteúdo</TableHead>
                        <TableHead className="w-[90px] py-2">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {msgs.slice(0, 10).map((m) => (
                        <TableRow key={m.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="py-1.5 text-muted-foreground whitespace-nowrap">{fmtDate(m.created_at)}</TableCell>
                          <TableCell className="py-1.5 font-mono">
                            <div className="flex items-center gap-1.5">
                              {m.direction === "inbound" ? (
                                <ArrowDownLeft className="h-3 w-3 text-emerald-600 shrink-0" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 text-blue-600 shrink-0" />
                              )}
                              <span>{m.contact_phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <span className="truncate block">{m.connection_name}</span>
                            <span className="text-[10px] text-muted-foreground">{m.connection_display ?? m.connection_phone_number_id ?? "—"}</span>
                          </TableCell>
                          <TableCell className="py-1.5 max-w-[420px] truncate">{m.body_preview || <span className="text-muted-foreground italic">(sem texto — {m.message_type})</span>}</TableCell>
                          <TableCell className="py-1.5">
                            <StatusBadge status={m.status} error={m.error_message} small />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {msgs.length > 10 && (
                    <div className="px-3 py-2 text-[11px] text-muted-foreground border-t">
                      Mostrando as 10 mensagens mais recentes de {msgs.length}.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: agrupado por contato */}
        <TabsContent value="por-contato">
          <div className="space-y-3">
            {grouped.length === 0 && (
              <div className="text-sm text-muted-foreground p-4">Nenhum contato no recorte.</div>
            )}
            {grouped.map(([phoneKey, items]) => (
              <Card key={phoneKey}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono flex items-center justify-between">
                    <span>{phoneKey}</span>
                    <span className="text-xs text-muted-foreground font-sans">
                      {items.length} mensagens · {new Set(items.map((i) => i.connection_id)).size} conexão(ões) envolvida(s)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {items.slice(0, 8).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      {m.direction === "inbound" ? <ArrowDownLeft className="h-3 w-3 text-emerald-600" /> : <ArrowUpRight className="h-3 w-3 text-blue-600" />}
                      <span className="text-muted-foreground w-[120px]">{fmtDate(m.created_at)}</span>
                      <Badge variant="outline" className="text-[10px]">{m.connection_name}</Badge>
                      <span className="truncate flex-1">{m.body_preview}</span>
                      <StatusBadge status={m.status} error={m.error_message} small />
                    </div>
                  ))}
                  {items.length > 8 && (
                    <p className="text-xs text-muted-foreground italic">+{items.length - 8} mensagens mais antigas…</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: webhooks brutos */}
        <TabsContent value="webhooks">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conexão</TableHead>
                    <TableHead>phone_number_id que recebeu</TableHead>
                    <TableHead>Mensagens</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhum evento.</TableCell></TableRow>
                  )}
                  {events.map((e) => {
                    const level = classifyWebhookEvent(e.event_type, e.status_code);
                    return (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(e.created_at)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${LEVEL_BADGE[level]}`}>
                          {eventLabel(e.event_type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{e.connection_name}</TableCell>
                      <TableCell className="font-mono text-xs">{e.payload_summary.phone_number_id_recv ?? e.phone_number_id ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        {e.payload_summary.messages_count > 0 && <Badge className="mr-1">{e.payload_summary.messages_count} msg</Badge>}
                        {e.payload_summary.statuses_count > 0 && <Badge variant="secondary">{e.payload_summary.statuses_count} status</Badge>}
                      </TableCell>
                      <TableCell>
                        {level === "success" || level === "info" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
                         level === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-600" /> :
                         <XCircle className="h-4 w-4 text-rose-600" />}
                      </TableCell>
                      <TableCell>
                        <Badge variant={level === "error" ? "destructive" : level === "warning" ? "secondary" : "default"}>{e.status_code}</Badge>
                        {e.error && level === "error" && <p className="text-[10px] text-rose-600 mt-0.5">{e.error}</p>}
                      </TableCell>
                    </TableRow>
                  );})}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <WuzapiConsole />

      <Card className="border-amber-300/40 bg-amber-50/40 dark:bg-amber-900/10">

        <CardContent className="p-4 text-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Como ler isso
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-5">
            <li><b>Recebida (verde ↓)</b>: Meta entregou pra nós nesse número/conexão.</li>
            <li><b>Enviada (azul ↑)</b>: nós despachamos pro WhatsApp do contato. Se o status ficar em <i>queued</i> ou <i>failed</i>, o problema é de saída (token, janela 24h, rate-limit).</li>
            <li><b>"Eventos brutos da Meta"</b>: se uma mensagem do cliente NÃO aparece aqui, então a Meta não nos avisou — webhook na Meta tá apontando pra outro lugar ou número não tá inscrito.</li>
            <li><b>"Agrupado por contato"</b>: se o mesmo contato aparece com 2 conexões diferentes, é onde acontece o "cruzamento".</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${accent ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, error, small }: { status: string; error?: string | null; small?: boolean }) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "delivered" || status === "read" || status === "sent" ? "default"
      : status === "failed" ? "destructive"
      : "secondary";
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={variant} className={small ? "text-[10px]" : ""}>{status}</Badge>
      {error && <span className="text-[10px] text-rose-600 max-w-[180px] truncate" title={error}>{error}</span>}
    </div>
  );
}
