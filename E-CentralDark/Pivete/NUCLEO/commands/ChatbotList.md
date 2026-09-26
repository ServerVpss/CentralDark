# COMANDO - ChatbotList.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\chatbot\ChatbotList.tsx
**SHA:** ddd725624d1a6414
**Timestamp:** 2026-08-26T19:31:36.474118
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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

        {isLoading
```