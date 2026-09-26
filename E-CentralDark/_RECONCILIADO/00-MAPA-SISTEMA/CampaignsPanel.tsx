import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Plus, X, Play, Ban, Calendar, Users, AlertTriangle } from "lucide-react";
import { listCampaigns, createCampaign, cancelCampaign, runCampaignNow, type CampaignRow } from "@/lib/campaigns.functions";
import { listWhatsAppConnections } from "@/lib/whatsapp.functions";
import { listTemplates } from "@/lib/templates.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateTimeBR } from "@/lib/datetime";
const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho", scheduled: "Agendada", running: "Enviando",
  paused: "Pausada", completed: "Concluída", canceled: "Cancelada", failed: "Falhou",
};
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-zinc-500", scheduled: "bg-blue-500", running: "bg-amber-500",
  paused: "bg-orange-500", completed: "bg-emerald-600", canceled: "bg-zinc-600", failed: "bg-red-600",
};

export function CampaignsPanel({ scope }: { scope: "workspace" | "admin" }) {
  const list = useServerFn(listCampaigns);
  const create = useServerFn(createCampaign);
  const cancel = useServerFn(cancelCampaign);
  const run = useServerFn(runCampaignNow);
  const connList = useServerFn(listWhatsAppConnections);
  const ws = useCurrentWorkspace();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", scope],
    queryFn: () => list({ data: { scope } }),
  });

  const { data: connData } = useQuery({
    queryKey: ["wa-connections-for-campaigns", ws.data?.id],
    queryFn: () => connList({ data: { workspaceId: ws.data!.id } }),
    enabled: scope === "workspace" && !!ws.data?.id,
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => { toast.success("Campanha cancelada"); qc.invalidateQueries({ queryKey: ["campaigns"] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const runMut = useMutation({
    mutationFn: (id: string) => run({ data: { id } }),
    onSuccess: (r) => {
      toast.success(`Disparo iniciado: ${r.sent ?? 0} enviadas, ${r.failed ?? 0} falhas`);
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const campaigns = (data?.campaigns ?? []) as CampaignRow[];
  const stats = useMemo(() => ({
    total: campaigns.length,
    running: campaigns.filter((c) => c.status === "running").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    sent: campaigns.reduce((a, c) => a + (c.total_sent ?? 0), 0),
  }), [campaigns]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{scope === "admin" ? "Campanhas (todas as empresas)" : "Campanhas"}</h1>
          <p className="text-sm text-muted-foreground">
            Disparo em massa pelo WhatsApp · respeita janela de 24h e limite anti-ban.
          </p>
        </div>
        {scope === "workspace" && (
          <NewCampaignDialog
            connections={(connData ?? []).map((c) => ({ id: c.id, name: c.name, status: c.status }))}
            onCreated={() => qc.invalidateQueries({ queryKey: ["campaigns"] })}
            createFn={create}
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Agendadas</p><p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Enviando agora</p><p className="text-2xl font-bold text-amber-600">{stats.running}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Mensagens enviadas</p><p className="text-2xl font-bold text-emerald-600">{stats.sent}</p></Card>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando campanhas" /></p>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Send className="mx-auto mb-2 h-8 w-8 opacity-40" />
            Nenhuma campanha ainda. {scope === "workspace" && "Clique em \"Nova campanha\" para começar."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Nome</th>
                  <th>Status</th>
                  <th>Destinatários</th>
                  <th>Enviadas / Falhas</th>
                  <th>Agendamento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{c.message_body ?? c.template_name}</div>
                    </td>
                    <td><Badge className={`${STATUS_COLOR[c.status]} text-white`}>{STATUS_LABEL[c.status] ?? c.status}</Badge></td>
                    <td><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{c.total_recipients}</span></td>
                    <td>
                      <span className="text-emerald-600 font-medium">{c.total_sent}</span>
                      {" / "}
                      <span className="text-red-600 font-medium">{c.total_failed}</span>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {c.scheduled_at ? formatDateTimeBR(c.scheduled_at) : "—"}
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        {scope === "workspace" && (c.status === "draft" || c.status === "scheduled") && (
                          <Button size="sm" variant="outline" onClick={() => runMut.mutate(c.id)} disabled={runMut.isPending}>
                            <Play className="h-3 w-3 mr-1" />Enviar
                          </Button>
                        )}
                        {(c.status === "draft" || c.status === "scheduled" || c.status === "running" || c.status === "paused") && (
                          <Button size="sm" variant="ghost" onClick={() => cancelMut.mutate(c.id)} disabled={cancelMut.isPending}>
                            <Ban className="h-3 w-3 mr-1" />Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold mb-1">Anti-ban ativo</p>
            <p className="text-muted-foreground">
              Limite de 250 mensagens/hora por conexão. Fora da janela de 24h só é possível usar templates aprovados pela Meta.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Dialog de nova campanha ----------
function NewCampaignDialog({ connections, onCreated, createFn }: {
  connections: Array<{ id: string; name: string; status: string }>;
  onCreated: () => void;
  createFn: ReturnType<typeof useServerFn<typeof createCampaign>>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const [body, setBody] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateLang, setTemplateLang] = useState("pt_BR");
  const [tagsRaw, setTagsRaw] = useState("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");

  const ws = useCurrentWorkspace();
  const tplFn = useServerFn(listTemplates);
  const { data: templates = [] } = useQuery({
    queryKey: ["wa-templates-for-campaign", ws.data?.id],
    queryFn: () => tplFn({ data: { workspace_id: ws.data!.id, scope: "workspace" } }),
    enabled: open && !!ws.data?.id,
  });
  const approved = templates.filter((t) => t.status === "approved");

  const reset = () => {
    setName(""); setBody(""); setTemplateName(""); setTagsRaw("");
    setConnectionId(""); setScheduledAt(""); setMode("text");
  };

  const mut = useMutation({
    mutationFn: () => createFn({ data: {
      name,
      message_body: mode === "text" ? body : null,
      template_name: mode === "template" ? templateName : null,
      template_lang: mode === "template" ? templateLang : "pt_BR",
      connection_id: connectionId || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      segment: {
        tags: tagsRaw.split(",").map((s) => s.trim()).filter(Boolean),
        sector_id: null,
        only_with_tickets: false,
      },
    } }),
    onSuccess: (r) => {
      toast.success(`Campanha criada com ${r.campaign.total_recipients} destinatários`);
      reset(); setOpen(false); onCreated();
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const canSubmit = !!name && !!connectionId &&
    (mode === "text" ? !!body : !!templateName) && !mut.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" />Nova campanha</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova campanha</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Black Friday — promoção" />
          </div>
          <div>
            <Label>Tipo de mensagem</Label>
            <div className="flex gap-2 mt-1">
              <Button type="button" size="sm" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>
                Texto livre (24h)
              </Button>
              <Button type="button" size="sm" variant={mode === "template" ? "default" : "outline"} onClick={() => setMode("template")}>
                Template Meta (qualquer hora)
              </Button>
            </div>
          </div>

          {mode === "text" ? (
            <div>
              <Label>Mensagem</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                placeholder="Olá {{name}}, temos uma oferta exclusiva pra você..." />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Só funciona dentro da janela de 24h após a última mensagem do cliente.
              </p>
            </div>
          ) : (
            <div>
              <Label>Template aprovado pela Meta</Label>
              <Select value={templateName} onValueChange={(v) => {
                setTemplateName(v);
                const t = approved.find((x) => x.name === v);
                if (t) setTemplateLang(t.language);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={approved.length ? "Selecione um template..." : "Nenhum aprovado ainda"} />
                </SelectTrigger>
                <SelectContent>
                  {approved.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name} <span className="text-xs text-muted-foreground ml-2">({t.language})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Templates são gerenciados em <Badge variant="outline" className="ml-1">Utilidades → Templates</Badge>.
                Aprove na Meta antes de disparar.
              </p>
            </div>
          )}

          <div>
            <Label>Conexão WhatsApp</Label>
            <Select value={connectionId} onValueChange={setConnectionId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {connections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.status !== "connected" && <X className="inline h-3 w-3 text-red-500 ml-1" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Etiquetas (segmento) — separadas por vírgula</Label>
            <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="vip, lead-quente" />
            <p className="mt-1 text-[10px] text-muted-foreground">Vazio = todos os contatos não bloqueados.</p>
          </div>
          <div>
            <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" />Agendar (opcional)</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={!canSubmit}>
            {mut.isPending ? "Criando..." : "Criar campanha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
