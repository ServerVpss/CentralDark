# COMANDO - FlowsPanel.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\flows\FlowsPanel.tsx
**SHA:** 357a5664e52c4333
**Timestamp:** 2026-08-26T19:31:37.181602
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const newStep: FlowStepUI = { id, prompt: "", expected_keywords: [], next_step_id: null, is_final: true, branches: [] };
- <Textarea rows={2} value={s.prompt} onChange={(e) => updateStep(idx, { prompt: e.target.value })} placeholder="Qual seu nome?" />

### Ouro Bruto (primeiros 5000 chars)
```
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
            <p className="text-sm text-muted-foreground">Nenhum fluxo criado. Comece com um "boas-vindas" ou
```