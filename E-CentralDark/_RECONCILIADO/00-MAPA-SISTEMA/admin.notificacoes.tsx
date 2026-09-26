import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bell, Bot, Send, FileText, Trash2, Plus, RefreshCw, Play, AlertTriangle, CheckCircle2, XCircle, Filter, Pencil, CheckSquare, Square as SquareIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  masterListEventCatalog, masterUpsertRule, masterBulkUpsertRules,
  masterListTelegramBots, masterCreateTelegramBot, masterDeleteTelegramBot,
  masterDetectTelegramDestinations, masterListTelegramDestinations, masterTestTelegramDestination,
  masterUpdateTelegramDestination, masterDeleteTelegramDestination,
  masterListNotificationLogs, masterTestEvent,
} from "@/lib/notifications-master.functions";

export const Route = createFileRoute("/admin/notificacoes")({ component: NotificationsCenter });

type Severity = "info" | "warning" | "critical";

function NotificationsCenter() {
  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Central de Notificações
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure quais eventos do sistema notificam o master, por quais canais e para quem.
        </p>
      </header>

      <Tabs defaultValue="destinos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="destinos"><Bot className="h-4 w-4 mr-2" />Destinos</TabsTrigger>
          <TabsTrigger value="eventos"><Bell className="h-4 w-4 mr-2" />Eventos</TabsTrigger>
          <TabsTrigger value="regras"><Send className="h-4 w-4 mr-2" />Regras</TabsTrigger>
          <TabsTrigger value="logs"><FileText className="h-4 w-4 mr-2" />Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="destinos"><DestinosTab /></TabsContent>
        <TabsContent value="eventos"><EventosTab /></TabsContent>
        <TabsContent value="regras"><RegrasTab /></TabsContent>
        <TabsContent value="logs"><LogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// ABA 1: DESTINOS (Bots Telegram + chats detectados)
// ============================================================
function DestinosTab() {
  const qc = useQueryClient();
  const listBots = useServerFn(masterListTelegramBots);
  const listDests = useServerFn(masterListTelegramDestinations);
  const createBot = useServerFn(masterCreateTelegramBot);
  const deleteBot = useServerFn(masterDeleteTelegramBot);
  const detect = useServerFn(masterDetectTelegramDestinations);
  const testDest = useServerFn(masterTestTelegramDestination);
  const updateDest = useServerFn(masterUpdateTelegramDestination);
  const deleteDest = useServerFn(masterDeleteTelegramDestination);

  const bots = useQuery({ queryKey: ["notif-bots"], queryFn: () => listBots() });
  const dests = useQuery({ queryKey: ["notif-dests"], queryFn: () => listDests() });

  const [openNewBot, setOpenNewBot] = useState(false);
  const [newName, setNewName] = useState("");
  const [newToken, setNewToken] = useState("");
  const [editDest, setEditDest] = useState<{ id: string; title: string } | null>(null);

  const createMut = useMutation({
    mutationFn: () => createBot({ data: { name: newName, bot_token: newToken } }),
    onSuccess: () => {
      toast.success("Bot conectado!");
      setOpenNewBot(false); setNewName(""); setNewToken("");
      qc.invalidateQueries({ queryKey: ["notif-bots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBotMut = useMutation({
    mutationFn: (id: string) => deleteBot({ data: { id } }),
    onSuccess: () => { toast.success("Bot removido."); qc.invalidateQueries({ queryKey: ["notif-bots"] }); qc.invalidateQueries({ queryKey: ["notif-dests"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const detectMut = useMutation({
    mutationFn: (bot_id: string) => detect({ data: { bot_id } }),
    onSuccess: (r) => { toast.success(`${r.count} destino(s) detectado(s).`); qc.invalidateQueries({ queryKey: ["notif-dests"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const testMut = useMutation({
    mutationFn: (destination_id: string) => testDest({ data: { destination_id } }),
    onSuccess: (r) => { r.ok ? toast.success(r.message) : toast.error(r.message); qc.invalidateQueries({ queryKey: ["notif-dests"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateDestMut = useMutation({
    mutationFn: (p: { id: string; title: string }) => updateDest({ data: p }),
    onSuccess: () => { toast.success("Destino renomeado."); setEditDest(null); qc.invalidateQueries({ queryKey: ["notif-dests"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteDestMut = useMutation({
    mutationFn: (id: string) => deleteDest({ data: { id } }),
    onSuccess: () => { toast.success("Destino removido."); qc.invalidateQueries({ queryKey: ["notif-dests"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {/* BOTS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bots do Telegram</CardTitle>
            <CardDescription>Cadastre o bot que enviará as notificações.</CardDescription>
          </div>
          <Dialog open={openNewBot} onOpenChange={setOpenNewBot}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Novo bot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conectar bot do Telegram</DialogTitle>
                <DialogDescription>
                  Crie um bot com o @BotFather no Telegram e cole o token aqui.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Apelido (interno)</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Bot de alertas" />
                </div>
                <div className="space-y-1.5">
                  <Label>Token do bot</Label>
                  <Input value={newToken} onChange={(e) => setNewToken(e.target.value)} placeholder="123456789:ABC..." />
                  <p className="text-xs text-muted-foreground">O token é guardado de forma segura e nunca exposto.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenNewBot(false)}>Cancelar</Button>
                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !newName || !newToken}>
                  {createMut.isPending ? "Conectando..." : "Conectar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {bots.isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : !bots.data?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum bot cadastrado.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nome</TableHead><TableHead>@username</TableHead>
                <TableHead>Token</TableHead><TableHead>Último teste</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {bots.data.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.bot_username ? `@${b.bot_username}` : "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{b.bot_token_masked}</TableCell>
                    <TableCell>
                      {b.last_test_status === "ok" && <Badge variant="default" className="bg-emerald-600">OK</Badge>}
                      {b.last_test_status === "failed" && <Badge variant="destructive">Falhou</Badge>}
                      {!b.last_test_status && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => detectMut.mutate(b.id)} disabled={detectMut.isPending}>
                        <RefreshCw className="h-4 w-4 mr-1" />Detectar chats
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (confirm(`Remover o bot "${b.name}"? Isso apaga também os destinos detectados por ele.`)) deleteBotMut.mutate(b.id);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            💡 Para detectar chats: envie qualquer mensagem ao bot (ou adicione ele a um grupo) e clique em <strong>Detectar chats</strong>.
          </p>
        </CardContent>
      </Card>

      {/* DESTINOS */}
      <Card>
        <CardHeader>
          <CardTitle>Destinos detectados</CardTitle>
          <CardDescription>Chats e grupos onde os bots podem enviar mensagens. Você decide quais ficam.</CardDescription>
        </CardHeader>
        <CardContent>
          {dests.isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : !dests.data?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum destino ainda. Clique em <strong>Detectar chats</strong> em um bot.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nome / Título</TableHead><TableHead>Tipo</TableHead>
                <TableHead>Chat ID</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {dests.data.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.title ?? d.username ?? "(sem nome)"}</TableCell>
                    <TableCell><Badge variant="outline">{d.chat_type}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{d.chat_id}</TableCell>
                    <TableCell>
                      {d.can_send === true && <Badge className="bg-emerald-600">Envia OK</Badge>}
                      {d.can_send === false && <Badge variant="destructive">Bloqueado</Badge>}
                      {d.can_send === null && <span className="text-xs text-muted-foreground">Não testado</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => testMut.mutate(d.id)} disabled={testMut.isPending}>
                        <Send className="h-4 w-4 mr-1" />Testar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditDest({ id: d.id, title: d.title ?? "" })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (confirm(`Remover o destino "${d.title ?? d.chat_id}"? Ele não receberá mais notificações.`)) deleteDestMut.mutate(d.id);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Editar destino */}
      <Dialog open={!!editDest} onOpenChange={(o) => !o && setEditDest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear destino</DialogTitle>
            <DialogDescription>Mude o apelido que aparece nas listas (não muda nada no Telegram).</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Nome / Título</Label>
            <Input value={editDest?.title ?? ""} onChange={(e) => setEditDest((s) => s ? { ...s, title: e.target.value } : s)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDest(null)}>Cancelar</Button>
            <Button onClick={() => editDest && updateDestMut.mutate({ id: editDest.id, title: editDest.title })} disabled={updateDestMut.isPending || !editDest?.title}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ============================================================
// ABA 2: EVENTOS (catálogo dinâmico)
// ============================================================
function EventosTab() {
  const listCatalog = useServerFn(masterListEventCatalog);
  const testEvent = useServerFn(masterTestEvent);
  const cat = useQuery({ queryKey: ["notif-catalog"], queryFn: () => listCatalog() });
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState<string>("all");

  const testMut = useMutation({
    mutationFn: (event_key: string) => testEvent({ data: { event_key } }),
    onSuccess: () => toast.success("Evento de teste disparado!"),
    onError: (e: Error) => toast.error(e.message),
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (cat.data?.catalog ?? []).forEach((e: any) => set.add(e.category));
    return Array.from(set);
  }, [cat.data]);

  const filtered = useMemo(() => {
    return (cat.data?.catalog ?? []).filter((e: any) => {
      if (category !== "all" && e.category !== category) return false;
      if (filter && !`${e.event_key} ${e.title} ${e.description}`.toLowerCase().includes(filter.toLowerCase())) return false;
      return true;
    });
  }, [cat.data, filter, category]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo de eventos</CardTitle>
        <CardDescription>
          Eventos do sistema que podem disparar notificações. Novos eventos aparecem aqui automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Buscar evento..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {cat.isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Evento</TableHead><TableHead>Categoria</TableHead>
              <TableHead>Severidade padrão</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((e: any) => (
                <TableRow key={e.event_key}>
                  <TableCell>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{e.event_key}</div>
                    {e.description && <div className="text-xs text-muted-foreground mt-0.5">{e.description}</div>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                  <TableCell><SeverityBadge severity={e.severity_default} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => testMut.mutate(e.event_key)} disabled={testMut.isPending}>
                      <Play className="h-4 w-4 mr-1" />Disparar teste
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum evento encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// ABA 3: REGRAS (mapear evento → canais + destinos)
// ============================================================
function RegrasTab() {
  const qc = useQueryClient();
  const listCatalog = useServerFn(masterListEventCatalog);
  const listDests = useServerFn(masterListTelegramDestinations);
  const upsertRule = useServerFn(masterUpsertRule);
  const bulkUpsert = useServerFn(masterBulkUpsertRules);

  const cat = useQuery({ queryKey: ["notif-catalog"], queryFn: () => listCatalog() });
  const dests = useQuery({ queryKey: ["notif-dests"], queryFn: () => listDests() });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const mut = useMutation({
    mutationFn: (data: { event_key: string; in_app_enabled: boolean; telegram_enabled: boolean; min_severity: Severity; telegram_destination_ids: string[] }) =>
      upsertRule({ data }),
    onSuccess: () => { toast.success("Regra salva."); qc.invalidateQueries({ queryKey: ["notif-catalog"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkMut = useMutation({
    mutationFn: (data: { event_keys: string[]; in_app_enabled?: boolean; telegram_enabled?: boolean; min_severity?: Severity; telegram_destination_ids?: string[] }) =>
      bulkUpsert({ data }),
    onSuccess: (r: any) => { toast.success(`${r?.count ?? 0} regra(s) atualizada(s).`); qc.invalidateQueries({ queryKey: ["notif-catalog"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const ruleByKey = useMemo(() => {
    const m = new Map<string, any>();
    (cat.data?.rules ?? []).forEach((r: any) => m.set(r.event_key, r));
    return m;
  }, [cat.data]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    (cat.data?.catalog ?? []).forEach((e: any) => s.add(e.category));
    return Array.from(s).sort();
  }, [cat.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (cat.data?.catalog ?? []).filter((e: any) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (!q) return true;
      return e.title?.toLowerCase().includes(q) || e.event_key?.toLowerCase().includes(q);
    });
  }, [cat.data, search, categoryFilter]);

  const filteredKeys = useMemo(() => filtered.map((e: any) => e.event_key), [filtered]);
  const allDestIds = useMemo(() => (dests.data ?? []).map((d: any) => d.id), [dests.data]);

  if (cat.isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  const runBulk = (patch: { in_app_enabled?: boolean; telegram_enabled?: boolean; min_severity?: Severity; telegram_destination_ids?: string[] }) => {
    if (filteredKeys.length === 0) { toast.error("Nenhum evento na lista atual."); return; }
    bulkMut.mutate({ event_keys: filteredKeys, ...patch });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras de notificação</CardTitle>
        <CardDescription>
          Para cada evento, escolha onde notificar (sino do master, Telegram) e quais destinos receberão.
          Use as ações em massa abaixo para configurar vários eventos de uma vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Buscar por nome ou chave..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              Ações em massa
              <Badge variant="secondary">{filteredKeys.length} evento(s)</Badge>
            </div>
            {bulkMut.isPending && <span className="text-xs text-muted-foreground">Aplicando...</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="default" disabled={bulkMut.isPending} onClick={() => runBulk({ telegram_enabled: true, telegram_destination_ids: allDestIds })}>
              <Send className="h-3 w-3 mr-1" /> Ativar Telegram em todos
            </Button>
            <Button size="sm" variant="outline" disabled={bulkMut.isPending} onClick={() => runBulk({ telegram_enabled: false })}>
              <XCircle className="h-3 w-3 mr-1" /> Desativar Telegram em todos
            </Button>
            <Button size="sm" variant="default" disabled={bulkMut.isPending} onClick={() => runBulk({ in_app_enabled: true })}>
              <Bell className="h-3 w-3 mr-1" /> Ativar sino em todos
            </Button>
            <Button size="sm" variant="outline" disabled={bulkMut.isPending} onClick={() => runBulk({ in_app_enabled: false })}>
              <SquareIcon className="h-3 w-3 mr-1" /> Desativar sino em todos
            </Button>
            <Button size="sm" variant="secondary" disabled={bulkMut.isPending || allDestIds.length === 0} onClick={() => runBulk({ telegram_destination_ids: allDestIds })}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Aplicar todos destinos
            </Button>
            <Select onValueChange={(v) => runBulk({ min_severity: v as Severity })}>
              <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder="Definir severidade mínima..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Severidade mínima: Info</SelectItem>
                <SelectItem value="warning">Severidade mínima: Aviso</SelectItem>
                <SelectItem value="critical">Severidade mínima: Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {allDestIds.length === 0 && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Nenhum destino Telegram cadastrado. Cadastre na aba "Destinos" primeiro.
            </p>
          )}
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento encontrado com esse filtro.</p>
            )}
            {filtered.map((e: any) => (
              <RuleRow
                key={e.event_key}
                event={e}
                rule={ruleByKey.get(e.event_key)}
                destinations={dests.data ?? []}
                onSave={(payload) => mut.mutate(payload)}
                saving={mut.isPending}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function RuleRow({ event, rule, destinations, onSave, saving }: {
  event: any; rule: any; destinations: any[];
  onSave: (p: { event_key: string; in_app_enabled: boolean; telegram_enabled: boolean; min_severity: Severity; telegram_destination_ids: string[] }) => void;
  saving: boolean;
}) {
  const [inApp, setInApp] = useState<boolean>(rule?.in_app_enabled ?? true);
  const [tg, setTg] = useState<boolean>(rule?.telegram_enabled ?? false);
  const [sev, setSev] = useState<Severity>((rule?.min_severity as Severity) ?? (event.severity_default as Severity) ?? "info");
  const [destIds, setDestIds] = useState<string[]>(rule?.telegram_destination_ids ?? []);

  const dirty =
    inApp !== (rule?.in_app_enabled ?? true) ||
    tg !== (rule?.telegram_enabled ?? false) ||
    sev !== ((rule?.min_severity as Severity) ?? "info") ||
    JSON.stringify(destIds.sort()) !== JSON.stringify(((rule?.telegram_destination_ids ?? []) as string[]).sort());

  const toggleDest = (id: string) => {
    setDestIds((curr) => curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]);
  };

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{event.title}</span>
            <Badge variant="outline" className="text-xs">{event.category}</Badge>
            <SeverityBadge severity={event.severity_default} />
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">{event.event_key}</div>
        </div>
        {dirty && (
          <Button size="sm" onClick={() => onSave({ event_key: event.event_key, in_app_enabled: inApp, telegram_enabled: tg, min_severity: sev, telegram_destination_ids: destIds })} disabled={saving}>
            Salvar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Switch checked={inApp} onCheckedChange={setInApp} id={`inapp-${event.event_key}`} />
          <Label htmlFor={`inapp-${event.event_key}`} className="cursor-pointer">Sino do master</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={tg} onCheckedChange={setTg} id={`tg-${event.event_key}`} />
          <Label htmlFor={`tg-${event.event_key}`} className="cursor-pointer">Telegram</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="shrink-0">Mín. severidade:</Label>
          <Select value={sev} onValueChange={(v) => setSev(v as Severity)}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {tg && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs">Destinos do Telegram ({destIds.length} selecionado{destIds.length !== 1 ? "s" : ""})</Label>
          {!destinations.length ? (
            <p className="text-xs text-muted-foreground">Nenhum destino cadastrado. Vá em <strong>Destinos</strong> primeiro.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {destinations.map((d) => {
                const selected = destIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDest(d.id)}
                    className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}
                  >
                    {d.title ?? d.username ?? d.chat_id}
                    <span className="ml-1 opacity-60">({d.chat_type})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ABA 4: LOGS
// ============================================================
function LogsTab() {
  const listLogs = useServerFn(masterListNotificationLogs);
  const [status, setStatus] = useState<"all" | "sent" | "failed" | "skipped">("all");
  const [eventKey, setEventKey] = useState("");

  const logs = useQuery({
    queryKey: ["notif-logs", status, eventKey],
    queryFn: () => listLogs({ data: { limit: 100, ...(status !== "all" && { status }), ...(eventKey && { event_key: eventKey }) } }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de notificação</CardTitle>
        <CardDescription>Todas as tentativas de envio, com explicação clara em caso de falha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Filtrar por evento (event_key)..." value={eventKey} onChange={(e) => setEventKey(e.target.value)} className="max-w-sm" />
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-40"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="skipped">Ignorado</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => logs.refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />Atualizar
          </Button>
        </div>

        {logs.isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : !logs.data?.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum log ainda.</p>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Quando</TableHead><TableHead>Evento</TableHead>
              <TableHead>Canal</TableHead><TableHead>Status</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {logs.data.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="font-mono text-xs">{l.event_key}</TableCell>
                  <TableCell><Badge variant="outline">{l.channel}</Badge></TableCell>
                  <TableCell>
                    {l.status === "sent" && <Badge className="bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Enviado</Badge>}
                    {l.status === "failed" && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>}
                    {l.status === "skipped" && <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Ignorado</Badge>}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {l.user_friendly_error && <div className="text-xs text-foreground">{l.user_friendly_error}</div>}
                    {l.technical_error && <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{l.technical_error}</div>}
                    {l.attempt_number > 1 && <Badge variant="outline" className="text-xs mt-1">Tentativa #{l.attempt_number}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// HELPERS
// ============================================================
function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "critical") return <Badge variant="destructive">Crítico</Badge>;
  if (severity === "warning") return <Badge className="bg-amber-500 hover:bg-amber-500/90">Aviso</Badge>;
  return <Badge variant="secondary">Info</Badge>;
}
