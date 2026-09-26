import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listFlows, upsertFlow, toggleFlow, deleteFlow } from "@/lib/flows.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, Zap, MessageSquare, Hand, ShieldQuestion, List, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { FlowTreeEditor, type FlowStepUI, type FlowBranchUI } from "./FlowTreeEditor";
import { LoadingDots } from "@/components/ui/loading-dots";

type Scope = "workspace" | "admin";
type Flow = Awaited<ReturnType<typeof listFlows>>[number];

const TYPE_META = {
  keyword: { label: "Palavra-chave", icon: Zap, color: "text-blue-500" },
  welcome: { label: "Boas-vindas", icon: Hand, color: "text-green-500" },
  fallback: { label: "Fallback", icon: ShieldQuestion, color: "text-amber-500" },
} as const;

export function FlowsPanel({ workspaceId, scope = "workspace" }: { workspaceId?: string; scope?: Scope }) {
  const fnList = useServerFn(listFlows);
  const fnUpsert = useServerFn(upsertFlow);
  const fnToggle = useServerFn(toggleFlow);
  const fnDelete = useServerFn(deleteFlow);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Flow | null>(null);

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ["flows", scope, workspaceId],
    queryFn: () => fnList({ data: { workspace_id: workspaceId, scope } }),
    enabled: scope === "admin" || !!workspaceId,
  });

  const stats = useMemo(() => ({
    total: flows.length,
    active: flows.filter((f) => f.active).length,
    hits: flows.reduce((s, f) => s + (f.hits_count ?? 0), 0),
  }), [flows]);

  type UpsertPayload = { id?: string; workspace_id: string; name: string; trigger_type: "keyword" | "welcome" | "fallback"; keywords: string[]; match_mode: "contains" | "exact" | "starts_with"; reply_message: string; active: boolean; priority: number; is_multi_step: boolean; steps: FlowStepUI[] };
  const upsert = useMutation({
    mutationFn: (data: UpsertPayload) => fnUpsert({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flows"] }); setOpen(false); setEditing(null); toast.success("Fluxo salvo"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => fnToggle({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => fnDelete({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flows"] }); toast.success("Removido"); },
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Fluxos" value={stats.total} />
        <Stat label="Ativos" value={stats.active} accent="text-green-500" />
        <Stat label="Disparos totais" value={stats.hits} accent="text-blue-500" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Respostas automáticas por palavra-chave. Mensagem do contato é comparada e a 1ª regra ativa que combinar dispara.
        </p>
        {scope === "workspace" && workspaceId && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Novo fluxo</Button>
            </DialogTrigger>
            <FlowDialog
              key={editing?.id ?? "new"}
              workspaceId={workspaceId}
              flow={editing}
              onSubmit={(data) => upsert.mutate(data)}
              loading={upsert.isPending}
            />
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>}
        {!isLoading && flows.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum fluxo criado. Comece com um "boas-vindas" ou uma palavra-chave como "preço".</p>
          </div>
        )}
        {flows.map((f) => {
          const meta = TYPE_META[f.trigger_type as keyof typeof TYPE_META] ?? TYPE_META.keyword;
          const Icon = meta.icon;
          return (
            <div key={f.id} className="flex items-start gap-3 rounded-lg border bg-card p-4 transition hover:border-primary/30">
              <div className={`mt-1 rounded-md bg-muted p-2 ${meta.color}`}><Icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{f.name}</p>
                  <Badge variant="outline" className="text-xs">{meta.label}</Badge>
                  {f.priority > 0 && <Badge variant="secondary" className="text-xs">prio {f.priority}</Badge>}
                  {scope === "admin" && (f as Flow & { workspace_id: string }).workspace_id && (
                    <span className="text-xs text-muted-foreground truncate">· ws {(f as Flow & { workspace_id: string }).workspace_id.slice(0, 8)}</span>
                  )}
                </div>
                {f.trigger_type === "keyword" && f.keywords?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {f.keywords.slice(0, 8).map((k) => <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>)}
                    {f.keywords.length > 8 && <span className="text-xs text-muted-foreground">+{f.keywords.length - 8}</span>}
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{f.reply_message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.hits_count ?? 0} disparos</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={f.active} onCheckedChange={(v) => toggle.mutate({ id: f.id, active: v })} disabled={scope === "admin"} />
                {scope === "workspace" && (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(f); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover fluxo?")) remove.mutate(f.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function FlowDialog({ workspaceId, flow, onSubmit, loading }: {
  workspaceId: string;
  flow: Flow | null;
  onSubmit: (d: { id?: string; workspace_id: string; name: string; trigger_type: "keyword" | "welcome" | "fallback"; keywords: string[]; match_mode: "contains" | "exact" | "starts_with"; reply_message: string; active: boolean; priority: number; is_multi_step: boolean; steps: FlowStepUI[] }) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(flow?.name ?? "");
  const [type, setType] = useState<"keyword" | "welcome" | "fallback">((flow?.trigger_type as "keyword" | "welcome" | "fallback") ?? "keyword");
  const [keywords, setKeywords] = useState((flow?.keywords ?? []).join(", "));
  const [matchMode, setMatchMode] = useState<"contains" | "exact" | "starts_with">((flow?.match_mode as "contains" | "exact" | "starts_with") ?? "contains");
  const [reply, setReply] = useState(flow?.reply_message ?? "");
  const [active, setActive] = useState(flow?.active ?? true);
  const [priority, setPriority] = useState(flow?.priority ?? 0);
  const flowAny = flow as (Flow & { is_multi_step?: boolean; steps?: FlowStepUI[] }) | null;
  const [isMulti, setIsMulti] = useState<boolean>(flowAny?.is_multi_step ?? false);
  const [steps, setSteps] = useState<FlowStepUI[]>(
    (flowAny?.steps ?? []).map((s) => ({ ...s, branches: s.branches ?? [] })),
  );

  const addStep = () => {
    const id = `s${Date.now().toString(36)}`;
    const last = steps[steps.length - 1];
    const newStep: FlowStepUI = { id, prompt: "", expected_keywords: [], next_step_id: null, is_final: true, branches: [] };
    const updated = steps.map((s) => ({ ...s }));
    if (last && (last.branches ?? []).length === 0) { updated[updated.length - 1].next_step_id = id; updated[updated.length - 1].is_final = false; }
    setSteps([...updated, newStep]);
  };
  const updateStep = (idx: number, patch: Partial<FlowStepUI>) => {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };
  const removeStep = (idx: number) => {
    const removedId = steps[idx]?.id;
    const next = steps.filter((_, i) => i !== idx).map((s) => ({
      ...s,
      next_step_id: s.next_step_id === removedId ? null : s.next_step_id,
      branches: (s.branches ?? []).map((b) => (b.next_step_id === removedId ? { ...b, next_step_id: null } : b)),
    }));
    setSteps(next);
  };
  const addBranch = (idx: number) => {
    const s = steps[idx];
    const nb: FlowBranchUI = { id: `b${Date.now().toString(36)}`, label: `Opção ${(s.branches?.length ?? 0) + 1}`, keywords: [], next_step_id: null };
    updateStep(idx, { branches: [...(s.branches ?? []), nb], is_final: false });
  };
  const removeBranch = (idx: number, bid: string) => {
    const s = steps[idx];
    updateStep(idx, { branches: (s.branches ?? []).filter((b) => b.id !== bid) });
  };
  const updateBranch = (idx: number, bid: string, patch: Partial<FlowBranchUI>) => {
    const s = steps[idx];
    updateStep(idx, { branches: (s.branches ?? []).map((b) => (b.id === bid ? { ...b, ...patch } : b)) });
  };

  const submit = () => {
    if (!name.trim() || !reply.trim()) { toast.error("Nome e mensagem inicial são obrigatórios"); return; }
    const kws = keywords.split(/[,\n]/).map((k) => k.trim()).filter(Boolean);
    if (type === "keyword" && kws.length === 0) { toast.error("Adicione ao menos 1 palavra-chave"); return; }
    if (isMulti && steps.length === 0) { toast.error("Adicione ao menos 1 passo ou desligue 'multi-passo'"); return; }
    if (isMulti && steps.some((s) => !s.prompt.trim())) { toast.error("Todos os passos precisam de pergunta"); return; }
    onSubmit({
      id: flow?.id, workspace_id: workspaceId, name: name.trim(), trigger_type: type,
      keywords: kws, match_mode: matchMode, reply_message: reply.trim(), active, priority,
      is_multi_step: isMulti, steps: isMulti ? steps : [],
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{flow ? "Editar fluxo" : "Novo fluxo"}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Saudação inicial" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tipo de gatilho</Label>
            <Select value={type} onValueChange={(v) => setType(v as "keyword" | "welcome" | "fallback")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">Palavra-chave</SelectItem>
                <SelectItem value="welcome">Boas-vindas (1ª msg)</SelectItem>
                <SelectItem value="fallback">Fallback (nada combinou)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prioridade</Label>
            <Input type="number" min={0} max={999} value={priority} onChange={(e) => setPriority(Number(e.target.value) || 0)} />
          </div>
        </div>
        {type === "keyword" && (
          <>
            <div>
              <Label>Palavras-chave (separadas por vírgula)</Label>
              <Textarea rows={2} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="preço, valor, quanto custa" />
            </div>
            <div>
              <Label>Modo de comparação</Label>
              <Select value={matchMode} onValueChange={(v) => setMatchMode(v as "contains" | "exact" | "starts_with")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contém a palavra</SelectItem>
                  <SelectItem value="exact">Mensagem exata</SelectItem>
                  <SelectItem value="starts_with">Começa com</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div>
          <Label>Mensagem de resposta {isMulti && <span className="text-xs text-muted-foreground">(usada quando o fluxo dispara — antes do passo 1)</span>}</Label>
          <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Olá! Obrigado pelo contato. Em que posso ajudar?" />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Multi-passo (sequência de perguntas)</p>
            <p className="text-xs text-muted-foreground">O cliente responde, sistema avança pro próximo passo automaticamente.</p>
          </div>
          <Switch checked={isMulti} onCheckedChange={setIsMulti} />
        </div>

        {isMulti && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <Tabs defaultValue="tree">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Passos do fluxo ({steps.length})</p>
                <TabsList>
                  <TabsTrigger value="tree"><GitBranch className="mr-1 h-3 w-3" />Árvore</TabsTrigger>
                  <TabsTrigger value="list"><List className="mr-1 h-3 w-3" />Lista</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tree" className="mt-3">
                <FlowTreeEditor steps={steps} onChange={setSteps} />
              </TabsContent>

              <TabsContent value="list" className="mt-3 space-y-2">
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={addStep}><Plus className="mr-1 h-3 w-3" />Passo</Button>
                </div>
                {steps.length === 0 && <p className="text-xs text-muted-foreground">Sem passos ainda. Clique em "Passo".</p>}
                {steps.map((s, idx) => (
                  <div key={s.id} className="space-y-2 rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Passo {idx + 1} {s.is_final && "(último)"}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => removeStep(idx)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                    <div>
                      <Label className="text-xs">Pergunta enviada ao cliente</Label>
                      <Textarea rows={2} value={s.prompt} onChange={(e) => updateStep(idx, { prompt: e.target.value })} placeholder="Qual seu nome?" />
                    </div>
                    {(s.branches ?? []).length === 0 && (
                      <div>
                        <Label className="text-xs">Palavras esperadas (vazio = aceita qualquer resposta)</Label>
                        <Input value={s.expected_keywords.join(", ")}
                          onChange={(e) => updateStep(idx, { expected_keywords: e.target.value.split(/[,\n]/).map((k) => k.trim()).filter(Boolean) })}
                          placeholder="sim, ok, claro" />
                      </div>
                    )}
                    <div className="rounded-md border bg-muted/20 p-2">
                      <div className="mb-1 flex items-center justify-between">
                        <Label className="text-xs">Saídas / branches ({(s.branches ?? []).length})</Label>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => addBranch(idx)}>
                          <GitBranch className="mr-1 h-3 w-3" />Adicionar saída
                        </Button>
                      </div>
                      {(s.branches ?? []).length === 0 && (
                        <p className="text-[11px] text-muted-foreground">Sem branches: o cliente sempre vai pro próximo passo. Adicione saídas pra ramificar (ex: "1=Vendas, 2=Suporte").</p>
                      )}
                      {(s.branches ?? []).map((b) => {
                        const targetIdx = steps.findIndex((x) => x.id === b.next_step_id);
                        return (
                          <div key={b.id} className="mt-2 grid grid-cols-12 gap-1">
                            <Input className="col-span-3 h-7 text-xs" value={b.label} onChange={(e) => updateBranch(idx, b.id, { label: e.target.value })} placeholder="Rótulo" />
                            <Input className="col-span-5 h-7 text-xs" value={b.keywords.join(", ")} onChange={(e) => updateBranch(idx, b.id, { keywords: e.target.value.split(/[,\n]/).map((k) => k.trim()).filter(Boolean) })} placeholder="palavras: 1, vendas" />
                            <Select value={b.next_step_id ?? "none"} onValueChange={(v) => updateBranch(idx, b.id, { next_step_id: v === "none" ? null : v })}>
                              <SelectTrigger className="col-span-3 h-7 text-xs"><SelectValue placeholder="→ passo" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— fim —</SelectItem>
                                {steps.filter((_, i) => i !== idx).map((x, i) => (
                                  <SelectItem key={x.id} value={x.id}>Passo {steps.indexOf(x) + 1}{x.prompt ? `: ${x.prompt.slice(0, 20)}` : ""}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="icon" variant="ghost" className="col-span-1 h-7 w-7" onClick={() => removeBranch(idx, b.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                            {targetIdx === -1 && b.next_step_id && <span className="col-span-12 text-[10px] text-amber-500">⚠ passo de destino não existe</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div><p className="text-sm font-medium">Ativo</p><p className="text-xs text-muted-foreground">Fluxo dispara em mensagens recebidas</p></div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
