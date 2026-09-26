import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plug, Plus, Trash2, Copy, Eye, KeyRound, Webhook as WebhookIcon, RefreshCw, Ban } from "lucide-react";
import { PageScaffold } from "@/components/page-scaffold";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { formatDateBR, formatDateTimeBR } from "@/lib/datetime";
import {
  listWebhooks, upsertWebhook, deleteWebhook, revealWebhookSecret, listWebhookDeliveries,
  listApiTokens, createApiToken, revokeApiToken, deleteApiToken, listIntegrationEvents,
} from "@/lib/integration.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/app/integracao")({ component: Page });

function Page() {
  const { data: ws } = useCurrentWorkspace();
  return (
    <PageScaffold
      title="Integração"
      description="Webhooks de saída, tokens de API e conexões externas."
      icon={Plug}
      adminHref="/admin/integracao"
    >
      {ws ? <Content workspaceId={ws.id} /> : <div className="p-6"><LoadingDots size="sm" label="Carregando" /></div>}
    </PageScaffold>
  );
}

function Content({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="p-6">
      <Tabs defaultValue="webhooks">
        <TabsList>
          <TabsTrigger value="webhooks"><WebhookIcon className="mr-2 h-4 w-4" />Webhooks</TabsTrigger>
          <TabsTrigger value="tokens"><KeyRound className="mr-2 h-4 w-4" />Tokens de API</TabsTrigger>
          <TabsTrigger value="entregas">Entregas</TabsTrigger>
        </TabsList>
        <TabsContent value="webhooks"><WebhooksTab workspaceId={workspaceId} /></TabsContent>
        <TabsContent value="tokens"><TokensTab workspaceId={workspaceId} /></TabsContent>
        <TabsContent value="entregas"><DeliveriesTab workspaceId={workspaceId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function WebhooksTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listWebhooks);
  const eventsFn = useServerFn(listIntegrationEvents);
  const upsertFn = useServerFn(upsertWebhook);
  const delFn = useServerFn(deleteWebhook);
  const revealFn = useServerFn(revealWebhookSecret);

  const { data, isLoading } = useQuery({ queryKey: ["wh", workspaceId], queryFn: () => listFn({ data: { workspaceId } }) });
  const { data: evs } = useQuery({ queryKey: ["wh-events"], queryFn: () => eventsFn() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ id?: string; name: string; targetUrl: string; events: string[]; active: boolean }>({ name: "", targetUrl: "", events: [], active: true });

  const saveM = useMutation({
    mutationFn: () => upsertFn({ data: { workspaceId, ...form } }),
    onSuccess: (r: any) => {
      if (r.secret) toast.success(`Webhook criado. Segredo: ${r.secret.slice(0, 16)}…`);
      else toast.success("Webhook salvo");
      setOpen(false); setForm({ name: "", targetUrl: "", events: [], active: true });
      qc.invalidateQueries({ queryKey: ["wh", workspaceId] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { workspaceId, id } }),
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["wh", workspaceId] }); },
  });

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Webhooks de saída</CardTitle>
          <CardDescription>Receba eventos do MultiZap na sua URL HTTP.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Novo webhook</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{form.id ? "Editar webhook" : "Novo webhook"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>URL de destino</Label><Input placeholder="https://meuapp.com/webhook" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} /></div>
              <div>
                <Label>Eventos</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(evs?.events ?? []).map((ev) => (
                    <label key={ev} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.events.includes(ev)} onCheckedChange={(c) => setForm({ ...form, events: c ? [...form.events, ev] : form.events.filter((x) => x !== ev) })} />
                      <span className="font-mono text-xs">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Ativo</Label></div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveM.mutate()} disabled={!form.name || !form.targetUrl || form.events.length === 0 || saveM.isPending}>{saveM.isPending ? "Salvando…" : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingDots size="sm" label="Carregando" /> : !data?.webhooks.length ? (
          <p className="text-sm text-muted-foreground">Nenhum webhook ainda. Clique em "Novo webhook" pra começar.</p>
        ) : (
          <ul className="divide-y">
            {data.webhooks.map((w: any) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{w.name}</span>
                    {w.active ? <Badge variant="default">ativo</Badge> : <Badge variant="secondary">desativado</Badge>}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">{w.target_url}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(w.events ?? []).map((e: string) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{w.forward_count} envios · {w.error_count} erros</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={async () => {
                    const r = await revealFn({ data: { workspaceId, id: w.id } });
                    if (r.secret) { navigator.clipboard.writeText(r.secret); toast.success("Segredo copiado"); }
                  }}><Eye className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { setForm({ id: w.id, name: w.name, targetUrl: w.target_url, events: w.events ?? [], active: w.active }); setOpen(true); }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Remover este webhook?")) delM.mutate(w.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TokensTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listApiTokens);
  const createFn = useServerFn(createApiToken);
  const revokeFn = useServerFn(revokeApiToken);
  const delFn = useServerFn(deleteApiToken);

  const { data, isLoading } = useQuery({ queryKey: ["tok", workspaceId], queryFn: () => listFn({ data: { workspaceId } }) });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<("read" | "write" | "admin")[]>(["read", "write"]);
  const [newToken, setNewToken] = useState<string | null>(null);

  const createM = useMutation({
    mutationFn: () => createFn({ data: { workspaceId, name, scopes } }),
    onSuccess: (r) => { setNewToken(r.token); setName(""); qc.invalidateQueries({ queryKey: ["tok", workspaceId] }); },
    onError: (e) => toast.error(friendlyError(e)),
  });
  const revokeM = useMutation({ mutationFn: (id: string) => revokeFn({ data: { workspaceId, id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["tok", workspaceId] }) });
  const delM = useMutation({ mutationFn: (id: string) => delFn({ data: { workspaceId, id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["tok", workspaceId] }) });

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tokens de API</CardTitle>
          <CardDescription>Use no header <code className="rounded bg-muted px-1">Authorization: Bearer …</code> pra integrar com a API.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setNewToken(null); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Novo token</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{newToken ? "Token gerado" : "Novo token de API"}</DialogTitle></DialogHeader>
            {newToken ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Copie agora — não mostraremos novamente.</p>
                <div className="flex items-center gap-2 rounded-md border bg-muted p-2 font-mono text-xs break-all">{newToken}</div>
                <Button size="sm" onClick={() => { navigator.clipboard.writeText(newToken); toast.success("Copiado"); }}><Copy className="mr-2 h-4 w-4" />Copiar</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Integração n8n" /></div>
                <div>
                  <Label>Permissões</Label>
                  <div className="mt-2 flex gap-3">
                    {(["read", "write", "admin"] as const).map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={scopes.includes(s)} onCheckedChange={(c) => setScopes(c ? [...scopes, s] : scopes.filter((x) => x !== s))} />{s}
                      </label>
                    ))}
                  </div>
                </div>
                <DialogFooter><Button onClick={() => createM.mutate()} disabled={!name || createM.isPending}>{createM.isPending ? "Gerando…" : "Gerar token"}</Button></DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingDots size="sm" label="Carregando" /> : !data?.tokens.length ? (
          <p className="text-sm text-muted-foreground">Nenhum token gerado ainda.</p>
        ) : (
          <ul className="divide-y">
            {data.tokens.map((t: any) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.name}</span>
                    {t.revoked && <Badge variant="destructive">revogado</Badge>}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{t.token_prefix}…</p>
                  <p className="text-xs text-muted-foreground">{(t.scopes ?? []).join(", ")} · {t.use_count} usos{t.expires_at ? ` · expira em ${formatDateBR(t.expires_at)}` : ""}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!t.revoked && <Button size="sm" variant="ghost" onClick={() => revokeM.mutate(t.id)}><Ban className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Apagar definitivamente?")) delM.mutate(t.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DeliveriesTab({ workspaceId }: { workspaceId: string }) {
  const listFn = useServerFn(listWebhookDeliveries);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["wh-del", workspaceId], queryFn: () => listFn({ data: { workspaceId } }) });
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Últimas entregas</CardTitle><CardDescription>100 últimos disparos de webhook.</CardDescription></div>
        <Button size="sm" variant="ghost" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingDots size="sm" label="Carregando" /> : !data?.deliveries.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma entrega registrada ainda.</p>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="text-left text-muted-foreground"><th className="py-2">Quando</th><th>Evento</th><th>Status</th><th>HTTP</th><th>Latência</th></tr></thead>
            <tbody className="divide-y">
              {data.deliveries.map((d: any) => (
                <tr key={d.id}>
                  <td className="py-2">{formatDateTimeBR(d.created_at)}</td>
                  <td className="font-mono">{d.event}</td>
                  <td>{d.status === "ok" ? <Badge variant="default">ok</Badge> : <Badge variant="destructive">{d.status}</Badge>}</td>
                  <td>{d.http_status ?? "—"}</td>
                  <td>{d.latency_ms ? `${d.latency_ms}ms` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
