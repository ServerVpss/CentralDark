# COMANDO - FlowTreeEditor.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\flows\FlowTreeEditor.tsx
**SHA:** 8b38106df807b8b7
**Timestamp:** 2026-08-26T19:31:37.441546
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: string;
- onChange={(e) => onChange({ prompt: e.target.value })}
- next.push({ id, prompt: "", expected_keywords: [], next_step_id: null, is_final: true, branches: [] });

### Gaps
- <Background gap={16} size={1} />

### Ouro Bruto (primeiros 5000 chars)
```
import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Flag, GitBranch } from "lucide-react";

export type FlowBranchUI = {
  id: string;
  label: string;
  keywords: string[];
  next_step_id: string | null;
};

export type FlowStepUI = {
  id: string;
  prompt: string;
  expected_keywords: string[];
  next_step_id: string | null;
  is_final: boolean;
  branches: FlowBranchUI[];
};

type StepNodeData = {
  step: FlowStepUI;
  index: number;
  onChange: (patch: Partial<FlowStepUI>) => void;
  onRemove: () => void;
  onAddBranch: () => void;
  onRemoveBranch: (branchId: string) => void;
  onUpdateBranch: (branchId: string, patch: Partial<FlowBranchUI>) => void;
};

function StepNode({ data }: { data: StepNodeData }) {
  const { step, index, onChange, onRemove, onAddBranch, onRemoveBranch, onUpdateBranch } = data;
  const branches = step.branches ?? [];
  return (
    <div className="w-[300px] rounded-lg border-2 border-primary/40 bg-card p-3 shadow-md">
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          Passo {index + 1}
          {step.is_final && branches.length === 0 && <Flag className="ml-1 inline h-3 w-3 text-amber-500" />}
        </Badge>
        <button type="button" onClick={onRemove} className="rounded p-1 hover:bg-destructive/10" aria-label="Remover passo">
          <Trash2 className="h-3 w-3 text-destructive" />
        </button>
      </div>
      <Textarea
        rows={2}
        className="mb-2 text-xs nodrag"
        value={step.prompt}
        onChange={(e) => onChange({ prompt: e.target.value })}
        placeholder="Pergunta enviada ao cliente"
      />

      {branches.length === 0 && (
        <Input
          className="text-[11px] nodrag"
          value={step.expected_keywords.join(", ")}
          onChange={(e) =>
            onChange({
              expected_keywords: e.target.value.split(/[,\n]/).map((k) => k.trim()).filter(Boolean),
            })
          }
          placeholder="palavras esperadas (vazio = aceita qualquer)"
        />
      )}

      <div className="mt-2 space-y-1.5">
        {branches.map((b, i) => (
          <div key={b.id} className="relative rounded-md border bg-muted/30 p-1.5">
            <div className="flex items-center gap-1">
              <Input
                className="h-6 flex-1 text-[10px] nodrag"
                value={b.label}
                onChange={(e) => onUpdateBranch(b.id, { label: e.target.value })}
                placeholder={`Saída ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => onRemoveBranch(b.id)}
                className="rounded p-0.5 hover:bg-destructive/10"
                aria-label="Remover saída"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </div>
            <Input
              className="mt-1 h-6 text-[10px] nodrag"
              value={b.keywords.join(", ")}
              onChange={(e) =>
                onUpdateBranch(b.id, {
                  keywords: e.target.value.split(/[,\n]/).map((k) => k.trim()).filter(Boolean),
                })
              }
              placeholder="palavras: 1, vendas, comprar"
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`b-${b.id}`}
              style={{ top: "50%", right: -6 }}
              className="!bg-emerald-500 !w-3 !h-3"
            />
          </div>
        ))}
        <Button size="sm" variant="ghost" className="h-6 w-full text-[10px]" onClick={onAddBranch}>
          <GitBranch className="mr-1 h-3 w-3" /> Adicionar saída
        </Button>
      </div>

      {branches.length === 0 && (
        <Handle type="source" position={Position.Bottom} id="default" className="!bg-primary !w-3 !h-3" />
      )}
    </div>
  );
}

const nodeTypes = { step: StepNode };

type Dispatchers = {
  onChangeStep: (id: string, patch: Partial<FlowStepUI>) => void;
  onRemoveStep: (id: string) => void;
  onAddBranch: (id: string) => void;
  onRemoveBranch: (id: string, bid: string) => void;
  onUpdateBranch: (id: string, bid: string, patch: Partial<FlowBranchUI>) => void;
};

function buildNodesEdges(
  steps: FlowStepUI[],
  d: Dispatchers,
  positions: Record<string, { x: number; y: number }>,
): { nodes: Node[]; edges: 
```