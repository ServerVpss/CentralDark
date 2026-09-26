# OUTRO - FlowCanvas.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\src\components\dashboard\FlowCanvas.tsx
**SHA:** f0854d52c49318c0
**Timestamp:** 2026-08-26T19:30:53.682689
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap={20}

### Ouro Bruto (primeiros 5000 chars)
```
import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Handle,
  Position,
  BackgroundVariant
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import { toast } from "sonner";

// Custom Node Component to keep the Cyber/Hacker style
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="min-w-[200px] rounded-lg border border-primary/40 bg-card/95 backdrop-blur shadow-[0_0_15px_hsl(var(--primary)/0.15)] overflow-hidden">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-background" />
      <div className="bg-primary/10 px-3 py-2 border-b border-primary/20 flex items-center justify-between">
        <span className="font-bold text-[10px] tracking-widest text-primary uppercase">
          {data.type || "Node"}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">#{data.id}</span>
      </div>
      <div className="p-3 text-sm text-foreground space-y-2">
        <div className="font-bold tracking-wide">{data.title}</div>
        <div className="space-y-1">
          {data.lines?.map((line: string, i: number) => (
            <div key={i} className="text-xs text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded truncate border border-border/50">
              {line}
            </div>
          ))}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-2 border-background" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 250, y: 50 },
    data: { id: "1", type: "Gatilho", title: "Mensagem Recebida", lines: ["Quando: Qualquer mensagem", "Ignorar: Grupos"] },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 100, y: 250 },
    data: { id: "2", type: "Condição", title: "Verificar Horário", lines: ["Horário Comercial", "08:00 - 18:00"] },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 400, y: 250 },
    data: { id: "3", type: "Ação", title: "Auto Resposta", lines: ["Enviar Menu Principal", "Esperar input"] },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 } },
];

export function FlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 } }, eds)),
    []
  );

  const addNode = () => {
    const id = String(nodes.length + 1);
    const newNode: Node = {
      id,
      type: "custom",
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: { id, type: "Ação", title: `Nova Ação ${id}`, lines: ["Configurar ação..."] },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success(`Node ${id} adicionado ao fluxo`);
  };

  return (
    <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm border-glow overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-display font-bold text-sm tracking-wide">Editor de Fluxo Visual</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addNode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition"
          >
            <Plus className="w-3 h-3" /> Adicionar Node
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative w-full h-full" style={{ minHeight: '400px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background/20"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap=
```