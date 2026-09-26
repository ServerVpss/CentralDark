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
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = steps.map((s, i) => ({
    id: s.id,
    type: "step",
    position: positions[s.id] ?? { x: 60 + (i % 3) * 360, y: 60 + Math.floor(i / 3) * 280 },
    data: {
      step: s,
      index: i,
      onChange: (patch) => d.onChangeStep(s.id, patch),
      onRemove: () => d.onRemoveStep(s.id),
      onAddBranch: () => d.onAddBranch(s.id),
      onRemoveBranch: (bid) => d.onRemoveBranch(s.id, bid),
      onUpdateBranch: (bid, p) => d.onUpdateBranch(s.id, bid, p),
    } satisfies StepNodeData,
  }));

  const edges: Edge[] = [];
  for (const s of steps) {
    if ((s.branches ?? []).length === 0 && s.next_step_id) {
      edges.push({
        id: `${s.id}-default-${s.next_step_id}`,
        source: s.id,
        sourceHandle: "default",
        target: s.next_step_id,
        animated: true,
        style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
      });
    }
    for (const b of s.branches ?? []) {
      if (b.next_step_id) {
        edges.push({
          id: `${s.id}-b-${b.id}-${b.next_step_id}`,
          source: s.id,
          sourceHandle: `b-${b.id}`,
          target: b.next_step_id,
          animated: true,
          label: b.label || b.keywords[0] || "",
          labelStyle: { fontSize: 10, fill: "hsl(var(--foreground))" },
          labelBgStyle: { fill: "hsl(var(--card))" },
          style: { stroke: "rgb(16,185,129)", strokeWidth: 2 },
        });
      }
    }
  }
  return { nodes, edges };
}

function Inner({ steps, onChange }: { steps: FlowStepUI[]; onChange: (next: FlowStepUI[]) => void }) {
  const rf = useReactFlow();

  const positions = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    steps.forEach((s, i) => {
      map[s.id] = { x: 60 + (i % 3) * 360, y: 60 + Math.floor(i / 3) * 280 };
    });
    return map;
  }, [steps]);

  const dispatchOnChange = useCallback(
    (id: string, patch: Partial<FlowStepUI>) => {
      onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    [steps, onChange],
  );
  const dispatchRemove = useCallback(
    (id: string) => {
      const next = steps.filter((s) => s.id !== id).map((s) => ({
        ...s,
        next_step_id: s.next_step_id === id ? null : s.next_step_id,
        branches: (s.branches ?? []).map((b) => (b.next_step_id === id ? { ...b, next_step_id: null } : b)),
      }));
      next.forEach((s) => {
        s.is_final = !s.next_step_id && (s.branches ?? []).every((b) => !b.next_step_id);
      });
      onChange(next);
    },
    [steps, onChange],
  );
  const dispatchAddBranch = useCallback(
    (id: string) => {
      onChange(
        steps.map((s) => {
          if (s.id !== id) return s;
          const newBranch: FlowBranchUI = {
            id: `b${Date.now().toString(36)}`,
            label: `Opção ${(s.branches?.length ?? 0) + 1}`,
            keywords: [],
            next_step_id: null,
          };
          return { ...s, branches: [...(s.branches ?? []), newBranch], is_final: false };
        }),
      );
    },
    [steps, onChange],
  );
  const dispatchRemoveBranch = useCallback(
    (id: string, bid: string) => {
      onChange(
        steps.map((s) =>
          s.id === id ? { ...s, branches: (s.branches ?? []).filter((b) => b.id !== bid) } : s,
        ),
      );
    },
    [steps, onChange],
  );
  const dispatchUpdateBranch = useCallback(
    (id: string, bid: string, patch: Partial<FlowBranchUI>) => {
      onChange(
        steps.map((s) =>
          s.id === id
            ? { ...s, branches: (s.branches ?? []).map((b) => (b.id === bid ? { ...b, ...patch } : b)) }
            : s,
        ),
      );
    },
    [steps, onChange],
  );

  const { nodes, edges } = useMemo(
    () =>
      buildNodesEdges(
        steps,
        {
          onChangeStep: dispatchOnChange,
          onRemoveStep: dispatchRemove,
          onAddBranch: dispatchAddBranch,
          onRemoveBranch: dispatchRemoveBranch,
          onUpdateBranch: dispatchUpdateBranch,
        },
        positions,
      ),
    [steps, positions, dispatchOnChange, dispatchRemove, dispatchAddBranch, dispatchRemoveBranch, dispatchUpdateBranch],
  );

  const onNodesChange = useCallback((_c: NodeChange[]) => {}, []);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updated = applyEdgeChanges(changes, edges);
      const removed = edges.filter((e) => !updated.find((u) => u.id === e.id));
      if (removed.length > 0) {
        let next = steps;
        for (const e of removed) {
          const handle = e.sourceHandle ?? "default";
          next = next.map((s) => {
            if (s.id !== e.source) return s;
            if (handle === "default") return { ...s, next_step_id: null, is_final: (s.branches ?? []).length === 0 };
            const bid = handle.replace(/^b-/, "");
            return {
              ...s,
              branches: (s.branches ?? []).map((b) => (b.id === bid ? { ...b, next_step_id: null } : b)),
            };
          });
        }
        onChange(next);
      }
    },
    [edges, steps, onChange],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target || conn.source === conn.target) return;
      const handle = conn.sourceHandle ?? "default";
      onChange(
        steps.map((s) => {
          if (s.id !== conn.source) return s;
          if (handle === "default") return { ...s, next_step_id: conn.target as string, is_final: false };
          const bid = handle.replace(/^b-/, "");
          return {
            ...s,
            is_final: false,
            branches: (s.branches ?? []).map((b) =>
              b.id === bid ? { ...b, next_step_id: conn.target as string } : b,
            ),
          };
        }),
      );
    },
    [steps, onChange],
  );

  const addStep = () => {
    const id = `s${Date.now().toString(36)}`;
    const last = steps[steps.length - 1];
    const next: FlowStepUI[] = steps.map((s) =>
      last && s.id === last.id && (s.branches ?? []).length === 0
        ? { ...s, next_step_id: id, is_final: false }
        : s,
    );
    next.push({ id, prompt: "", expected_keywords: [], next_step_id: null, is_final: true, branches: [] });
    onChange(next);
  };

  useEffect(() => {
    if (steps.length > 0) {
      setTimeout(() => rf.fitView({ padding: 0.2, duration: 200 }), 50);
    }
  }, [steps.length, rf]);

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-lg border bg-muted/20">
      <div className="flex items-center justify-between border-b bg-card px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Arraste nós, conecte bolinhas. <span className="text-emerald-500">Verde</span> = saída por palavra-chave (ex: "1=Vendas"). <span className="text-primary">Azul</span> = saída padrão.
        </p>
        <Button size="sm" variant="outline" onClick={addStep}>
          <Plus className="mr-1 h-3 w-3" /> Passo
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!bg-card" />
      </ReactFlow>
    </div>
  );
}

export function FlowTreeEditor(props: { steps: FlowStepUI[]; onChange: (n: FlowStepUI[]) => void }) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  );
}
