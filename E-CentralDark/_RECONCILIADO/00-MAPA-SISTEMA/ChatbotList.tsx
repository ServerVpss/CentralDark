import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { listFlows, upsertFlow, deleteFlow, duplicateFlow } from "@/lib/flows.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Settings, Pencil, Copy, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { ChatbotSettingsModal } from "./ChatbotSettingsModal";
import { LoadingDots } from "@/components/ui/loading-dots";

import { formatDateBR, formatTimeBR } from "@/lib/datetime";
type Scope = "workspace" | "admin";

export function ChatbotList({ workspaceId, scope = "workspace" }: { workspaceId?: string; scope?: Scope }) {
  const fnList = useServerFn(listFlows);
  const fnUpsert = useServerFn(upsertFlow);
  const fnDelete = useServerFn(deleteFlow);
  const fnDup = useServerFn(duplicateFlow);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"entrada" | "saida">("entrada");
  const [settingsForId, setSettingsForId] = useState<string | null>(null);

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ["flows", scope, workspaceId],
    queryFn: () => fnList({ data: { workspace_id: workspaceId, scope } }),
    enabled: scope === "admin" || !!workspaceId,
  });

  const totalPages = Math.max(1, Math.ceil(flows.length / pageSize));
  const visible = useMemo(() => flows.slice((page - 1) * pageSize, page * pageSize), [flows, page, pageSize]);

  const create = useMutation({
    mutationFn: () => fnUpsert({
      data: {
        workspace_id: workspaceId!,
        name: newName.trim(),
        trigger_type: "keyword",
        keywords: [],
        match_mode: "contains",
        reply_message: "Olá!",
        active: true,
        priority: 0,
        is_multi_step: true,
        steps: [],
        bot_type: newType,
        settings: {},
        graph: {},
      },
    }),
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: ["flows"] });
      setAddOpen(false);
      setNewName("");
      toast.success("ChatBot criado");
      navigate({ to: "/app/chatbot/$flowId/editor", params: { flowId: id } });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => fnDelete({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flows"] }); toast.success("ChatBot removido"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => fnDup({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flows"] }); toast.success("ChatBot duplicado"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const fmtDate = (iso: string) => `${formatDateBR(iso)} às ${formatTimeBR(iso)}`;

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="text-lg font-semibold">Chatbots</h2>
      </div>

      <div className="flex items-center gap-4 px-5 pt-5">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Mostrar</Label>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      <div className="px-5 pt-5">
        <div className="grid grid-cols-[1fr_120px_200px_180px] gap-4 px-4 py-3 border-b text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          <div>Nome</div>
          <div>Tipo</div>
          <div>Criado em</div>
          <div className="text-right">Ações</div>
        </div>

        {isLoading && <div className="py-10 text-center text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></div>}
        {!isLoading && visible.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">Nenhum chatbot ainda. Clique em "+ Adicionar".</div>
        )}

        <TooltipProvider>
          {visible.map((f) => (
            <div key={f.id} className="grid grid-cols-[1fr_120px_200px_180px] gap-4 items-center px-4 py-4 border-b last:border-b-0 hover:bg-accent/30">
              <div className="font-medium">{f.name}</div>
              <div>
                <Badge variant={(f.bot_type ?? "entrada") === "entrada" ? "default" : "secondary"}
                  className={(f.bot_type ?? "entrada") === "entrada" ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20" : ""}>
                  {(f.bot_type ?? "entrada") === "entrada" ? "Entrada" : "Saída"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{fmtDate(f.created_at)}</div>
              <div className="flex items-center justify-end gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setSettingsForId(f.id)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configurações</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" asChild>
                      <Link to={scope === "admin" ? "/admin/chatbots/$flowId/editor" : "/app/chatbot/$flowId/editor"} params={{ flowId: f.id }}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar ChatBot</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => duplicate.mutate(f.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Excluir "${f.name}"?`)) remove.mutate(f.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Mostrando {visible.length === 0 ? 0 : (page - 1) * pageSize + 1} a {(page - 1) * pageSize + visible.length} de {flows.length} {flows.length === 1 ? "entrada" : "entradas"}
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" disabled={page === 1} onClick={() => setPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="px-3 text-sm">{page}</div>
          <Button size="icon" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" disabled={page >= totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo ChatBot</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Atendimento inicial" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as "entrada" | "saida")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (responde mensagens recebidas)</SelectItem>
                  <SelectItem value="saida">Saída (dispara mensagens ativas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={() => create.mutate()} disabled={!newName.trim() || create.isPending || !workspaceId}>
              Criar e abrir editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {settingsForId && (
        <ChatbotSettingsModal
          flowId={settingsForId}
          open={!!settingsForId}
          onClose={() => setSettingsForId(null)}
        />
      )}
    </div>
  );
}
