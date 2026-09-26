import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  addEdge, applyEdgeChanges, applyNodeChanges,
  type Node, type Edge, type Connection, type NodeChange, type EdgeChange, type NodeProps,
  Handle, Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { upsertFlow } from "@/lib/flows.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Flag, CheckCircle2, Menu as MenuIcon, Star, ArrowRightLeft, XCircle, Tag, MessageSquare,
  Shuffle, Database, Users, User, Bot, StickyNote, GitBranch, Settings, Code2, X,
  Type, Mic, Image as ImageIcon, Video, FileText, List, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { LoadingDots } from "@/components/ui/loading-dots";
import { ChatbotSettingsModal } from "./ChatbotSettingsModal";

// ===== Tipos =====

type NodeKind =
  | "start" | "menu" | "satisfaction" | "redirect" | "finalize" | "tag" | "message"
  | "random_message" | "data" | "distribution" | "contact" | "ai_agent" | "notes" | "conditional";

type MessageSubtype = "text" | "buttons" | "list" | "audio" | "image" | "video" | "document";
type ListSection = { title: string; rows: { id: string; title: string; description?: string }[] };

type NodeData = Record<string, unknown> & {
  kind: NodeKind;
  label?: string;
  text?: string;
  // message
  subtype?: MessageSubtype;
  buttons?: { id: string; label: string }[];
  list_button?: string;
  list_sections?: ListSection[];
  media_url?: string;
  caption?: string;
  // menu
  menu_header?: string;
  menu_footer?: string;
  options?: { id: string; label: string; description?: string; next?: string }[];
  // redirect
  redirect_to?: "sector" | "user";
  redirect_sector_id?: string;
  redirect_user_id?: string;
  // tag
  tag_id?: string;
  tag_action?: "add" | "remove";
  // ai_agent
  ai_agent_id?: string;
  // random
  random_group_id?: string;
  // satisfaction
  scale?: number;
  // data
  data_field?: "name" | "email" | "cpf" | "cnpj" | "phone" | "custom";
  data_custom_label?: string;
  // distribution
  distribution_strategy?: "round_robin" | "least_busy" | "random";
  distribution_sector_id?: string;
  // contact
  contact_name?: string;
  contact_phone?: string;
  // conditional
  cond_field?: string;
  cond_op?: "eq" | "neq" | "contains" | "gt" | "lt";
  cond_value?: string;
};

// ===== Catálogo =====

const BLOCK_CATALOG: { kind: NodeKind; label: string; icon: React.ComponentType<{ className?: string }>; color: string; section: "top" | "options" }[] = [
  { kind: "menu", label: "Menu", icon: MenuIcon, color: "bg-blue-500", section: "top" },
  { kind: "satisfaction", label: "Satisfação", icon: Star, color: "bg-amber-500", section: "top" },
  { kind: "message", label: "Mensagem", icon: MessageSquare, color: "bg-emerald-500", section: "options" },
  { kind: "random_message", label: "Mensagem Aleatória", icon: Shuffle, color: "bg-pink-500", section: "options" },
  { kind: "redirect", label: "Redirecionar", icon: ArrowRightLeft, color: "bg-cyan-500", section: "options" },
  { kind: "tag", label: "Etiqueta", icon: Tag, color: "bg-blue-500", section: "options" },
  { kind: "ai_agent", label: "Agente de IA", icon: Bot, color: "bg-indigo-500", section: "options" },
  { kind: "data", label: "Coletar Dados", icon: Database, color: "bg-cyan-500", section: "options" },
  { kind: "distribution", label: "Distribuição", icon: Users, color: "bg-teal-500", section: "options" },
  { kind: "contact", label: "Enviar Contato", icon: User, color: "bg-purple-500", section: "options" },
  { kind: "notes", label: "Anotação interna", icon: StickyNote, color: "bg-orange-400", section: "options" },
  { kind: "conditional", label: "Condicional", icon: GitBranch, color: "bg-emerald-600", section: "options" },
  { kind: "finalize", label: "Finalizar", icon: XCircle, color: "bg-red-500", section: "options" },
];

// ===== Defaults profissionais por tipo =====

function defaultData(kind: NodeKind): NodeData {
  switch (kind) {
    case "menu":
      return {
        kind: "menu",
        text: "Olá! 👋 Como podemos te ajudar hoje? Escolha uma das opções abaixo:",
        menu_header: "Atendimento",
        menu_footer: "Selecione uma opção",
        options: [
          { id: "opt_1", label: "Falar com vendas", description: "Quero conhecer produtos e preços" },
          { id: "opt_2", label: "Suporte técnico", description: "Já sou cliente e preciso de ajuda" },
          { id: "opt_3", label: "Financeiro", description: "Boletos, pagamentos e segunda via" },
        ],
      };
    case "message":
      return {
        kind: "message",
        subtype: "text",
        text: "Olá {{ name }}! 👋 Seja bem-vindo. Em instantes um atendente vai falar com você.",
        buttons: [
          { id: "btn_1", label: "Sim" },
          { id: "btn_2", label: "Não" },
        ],
        list_button: "Ver opções",
        list_sections: [
          { title: "Mais procurados", rows: [
            { id: "row_1", title: "Preços", description: "Tabela de preços atualizada" },
            { id: "row_2", title: "Horário", description: "Quando funcionamos" },
          ]},
        ],
        media_url: "",
        caption: "",
      };
    case "satisfaction":
      return {
        kind: "satisfaction",
        text: "Como você avalia o nosso atendimento? De 1 (muito ruim) a 5 (excelente).",
        scale: 5,
      };
    case "redirect":
      return {
        kind: "redirect",
        text: "Você será transferido em instantes. 🙌",
        redirect_to: "sector",
      };
    case "finalize":
      return {
        kind: "finalize",
        text: "Atendimento finalizado. Obrigado pelo contato! 💚",
      };
    case "tag":
      return {
        kind: "tag",
        text: "Marca o contato com uma etiqueta",
        tag_action: "add",
      };
    case "random_message":
      return {
        kind: "random_message",
        text: "Envia uma variação aleatória de um grupo de mensagens.",
      };
    case "data":
      return {
        kind: "data",
        text: "Pra continuar, me diga o seu nome:",
        data_field: "name",
        data_custom_label: "Informação",
      };
    case "distribution":
      return {
        kind: "distribution",
        text: "Distribui o atendimento entre atendentes disponíveis.",
        distribution_strategy: "round_robin",
      };
    case "contact":
      return {
        kind: "contact",
        text: "Enviar cartão de contato",
        contact_name: "Atendimento MultiZap",
        contact_phone: "+55 11 99999-0000",
      };
    case "ai_agent":
      return {
        kind: "ai_agent",
        text: "Conversar com agente de IA",
      };
    case "notes":
      return {
        kind: "notes",
        text: "Anotação interna (não enviada ao cliente).",
      };
    case "conditional":
      return {
        kind: "conditional",
        text: "Se a condição for verdadeira, segue por aqui.",
        cond_field: "{{ message }}",
        cond_op: "contains",
        cond_value: "preço",
      };
    default:
      return { kind } as NodeData;
  }
}

// ===== Card do bloco no canvas =====

function NodeShell({ children, color, icon: Icon, label, onDelete, badge, hasTarget = true, hasSource = true }: { children?: React.ReactNode; color: string; icon: React.ComponentType<{ className?: string }>; label: string; onDelete?: () => void; badge?: string; hasTarget?: boolean; hasSource?: boolean }) {
  return (
    <div className="rounded-lg bg-card border shadow-lg min-w-[220px] max-w-[300px]">
      {hasTarget && <Handle type="target" position={Position.Left} className="!bg-red-500 !w-3 !h-3" />}
      <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-t-md text-white ${color}`}>
        <div className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4" />{label}</div>
        <div className="flex items-center gap-1">
          {badge && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">{badge}</span>}
          {onDelete && <button onClick={onDelete} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>}
        </div>
      </div>
      {children && <div className="p-3 space-y-2 text-xs">{children}</div>}
      {hasSource && <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3" />}
    </div>
  );
}

function StartNode() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-md bg-emerald-500 flex items-center justify-center shadow-lg">
        <Flag className="h-6 w-6 text-white" />
      </div>
      <div className="mt-1 text-xs font-medium">Início</div>
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3" />
    </div>
  );
}

function subtypeBadge(d: NodeData): string | undefined {
  if (d.kind === "message") {
    const map: Record<MessageSubtype, string> = {
      text: "Texto", buttons: "Botões", list: "Lista", audio: "Áudio",
      image: "Imagem", video: "Vídeo", document: "Documento",
    };
    return map[d.subtype ?? "text"];
  }
  if (d.kind === "redirect") return d.redirect_to === "user" ? "Usuário" : "Setor";
  return undefined;
}

function GenericNode({ data, id }: NodeProps) {
  const d = data as NodeData;
  const meta = BLOCK_CATALOG.find((b) => b.kind === d.kind);
  const Icon = meta?.icon ?? CheckCircle2;
  const color = meta?.color ?? "bg-slate-500";
  const label = meta?.label ?? d.kind;
  return (
    <NodeShell
      color={color}
      icon={Icon}
      label={label}
      badge={subtypeBadge(d)}
      onDelete={() => window.dispatchEvent(new CustomEvent("node-delete", { detail: id }))}
      hasSource={d.kind !== "finalize"}
    >
      {d.text && <div className="break-words leading-relaxed text-foreground/80 line-clamp-3">{d.text}</div>}
      {d.kind === "menu" && d.options && (
        <div className="space-y-1">
          {d.options.slice(0, 4).map((o, i) => (
            <div key={o.id ?? i} className="rounded bg-muted/60 px-2 py-1">{i + 1}. {o.label}</div>
          ))}
          {d.options.length > 4 && <div className="text-muted-foreground">+ {d.options.length - 4}</div>}
        </div>
      )}
      {d.kind === "message" && d.subtype === "buttons" && d.buttons && (
        <div className="flex flex-wrap gap-1">
          {d.buttons.slice(0, 3).map((b) => (
            <span key={b.id} className="rounded-md border bg-background px-2 py-0.5">{b.label}</span>
          ))}
        </div>
      )}
      {d.kind === "message" && d.subtype === "list" && (
        <div className="rounded bg-muted/60 px-2 py-1">📋 {d.list_button ?? "Ver opções"}</div>
      )}
      {d.kind === "message" && d.subtype === "audio" && d.media_url && (
        <div className="rounded bg-muted/60 px-2 py-1 truncate">🎵 {d.media_url}</div>
      )}
    </NodeShell>
  );
}

const nodeTypes = { start: StartNode, generic: GenericNode };

// ===== Editor principal =====

export function ChatbotFlowEditor({ flowId, scope = "workspace" }: { flowId: string; scope?: "workspace" | "admin" }) {
  const navigate = useNavigate();
  const fnUpsert = useServerFn(upsertFlow);
  const qc = useQueryClient();

  const { data: flow, isLoading } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbot_flows").select("*").eq("id", flowId).single();
      if (error) throw error;
      return data;
    },
  });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showVars, setShowVars] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  // Listas auxiliares (etiquetas, setores, agentes, grupos aleatórios)
  const wsId = flow?.workspace_id;
  const { data: tags = [] } = useQuery({
    queryKey: ["tags-for-flow", wsId], enabled: !!wsId,
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("id,name,color").eq("workspace_id", wsId!).order("name");
      return data ?? [];
    },
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-for-flow", wsId], enabled: !!wsId,
    queryFn: async () => {
      const { data } = await supabase.from("sectors").select("id,name").eq("workspace_id", wsId!).order("name");
      return data ?? [];
    },
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["agents-for-flow", wsId], enabled: !!wsId,
    queryFn: async () => {
      const { data } = await supabase.from("ai_agent_configs").select("id,name,active").eq("workspace_id", wsId!).order("name");
      return data ?? [];
    },
  });
  const { data: randomGroups = [] } = useQuery({
    queryKey: ["random-groups-for-flow", wsId], enabled: !!wsId,
    queryFn: async () => {
      const { data } = await supabase.from("random_message_groups").select("id,name").eq("workspace_id", wsId!).order("name");
      return data ?? [];
    },
  });

  // Carrega grafo ou semeia com algo útil
  useEffect(() => {
    if (!flow) return;
    const g = (flow.graph as { nodes?: Node[]; edges?: Edge[] }) ?? {};
    if (g.nodes && g.nodes.length > 0) {
      setNodes(g.nodes);
      setEdges(g.edges ?? []);
    } else {
      // Pré-preencher fluxo novo
      const startNode: Node = { id: "start", type: "start", position: { x: 80, y: 200 }, data: { kind: "start" }, draggable: false, deletable: false };
      const welcome: Node = { id: "welcome", type: "generic", position: { x: 280, y: 80 }, data: defaultData("message") as Record<string, unknown> };
      const menu: Node = { id: "menu", type: "generic", position: { x: 600, y: 200 }, data: defaultData("menu") as Record<string, unknown> };
      const closing: Node = { id: "closing", type: "generic", position: { x: 920, y: 320 }, data: defaultData("finalize") as Record<string, unknown> };
      setNodes([startNode, welcome, menu, closing]);
      setEdges([
        { id: "e1", source: "start", target: "welcome", animated: true },
        { id: "e2", source: "welcome", target: "menu", animated: true },
        { id: "e3", source: "menu", target: "closing", animated: true },
      ]);
    }
  }, [flow]);

  useEffect(() => {
    const h = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      if (id === "start") return;
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((ed) => ed.source !== id && ed.target !== id));
    };
    window.addEventListener("node-delete", h);
    return () => window.removeEventListener("node-delete", h);
  }, []);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes((nds) => applyNodeChanges(c, nds)), []);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(c, eds)), []);
  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, animated: true }, eds)), []);

  const addBlock = (kind: NodeKind) => {
    const id = `${kind}_${Date.now()}`;
    const x = 300 + Math.random() * 200;
    const y = 100 + Math.random() * 300;
    setNodes((nds) => nds.concat({ id, type: "generic", position: { x, y }, data: defaultData(kind) as Record<string, unknown> }));
  };

  const updateNodeData = (id: string, patch: Partial<NodeData>) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
    setEditingNode((cur) => cur && cur.id === id ? { ...cur, data: { ...cur.data, ...patch } } : cur);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!flow) throw new Error("Fluxo não encontrado");
      return fnUpsert({
        data: {
          id: flow.id,
          workspace_id: flow.workspace_id,
          name: flow.name,
          trigger_type: (flow.trigger_type as "keyword" | "welcome" | "fallback") ?? "keyword",
          keywords: (flow.keywords as string[] | null) ?? [],
          match_mode: (flow.match_mode as "contains" | "exact" | "starts_with") ?? "contains",
          reply_message: flow.reply_message ?? "",
          active: flow.active ?? true,
          priority: flow.priority ?? 0,
          is_multi_step: flow.is_multi_step ?? true,
          steps: ((flow.steps as unknown) as never) ?? [],
          bot_type: (flow.bot_type as "entrada" | "saida") ?? "entrada",
          settings: (flow.settings as Record<string, unknown>) ?? {},
          graph: { nodes, edges } as unknown as Record<string, unknown>,
        },
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flows"] }); toast.success("Fluxo salvo"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (isLoading) return <div className="p-8"><LoadingDots size="sm" label="Carregando" /></div>;
  if (!flow) return <div className="p-8">Fluxo não encontrado.</div>;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <div>
          <h1 className="text-lg font-semibold">Editor de ChatBot</h1>
          <p className="text-xs text-muted-foreground">{flow.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowVars(true)}>
            <Code2 className="mr-2 h-4 w-4" /> Variáveis
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: scope === "admin" ? "/admin/chatbots" : "/app/chatbot" })}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Salvar</Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 border-r overflow-y-auto p-4 space-y-2 bg-card/30">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </Button>
          <p className="pt-2 text-[11px] text-muted-foreground">Dentro da janela de 24h o WhatsApp permite texto, áudio, mídias, botões e listas. Fora da janela, só templates aprovados.</p>
          <div className="pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Principais</div>
          {BLOCK_CATALOG.filter((b) => b.section === "top").map((b) => (
            <Button key={b.kind} className={`w-full ${b.color} hover:opacity-90 text-white`} onClick={() => addBlock(b.kind)}>
              <b.icon className="mr-2 h-4 w-4" /> {b.label}
            </Button>
          ))}
          <div className="pt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opções</div>
          {BLOCK_CATALOG.filter((b) => b.section === "options").map((b) => (
            <Button key={b.kind} className={`w-full ${b.color} hover:opacity-90 text-white`} onClick={() => addBlock(b.kind)}>
              <b.icon className="mr-2 h-4 w-4" /> {b.label}
            </Button>
          ))}
        </aside>

        <div className="flex-1 relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, n) => { if (n.id !== "start") setEditingNode(n); }}
              onNodeDoubleClick={(_, n) => { if (n.id !== "start") setEditingNode(n); }}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{ animated: true }}
            >
              <Background gap={20} />
              <Controls />
              <MiniMap zoomable pannable />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Variáveis */}
      <Dialog open={showVars} onOpenChange={setShowVars}>
        <DialogContent>
          <DialogHeader><DialogTitle>Variáveis disponíveis</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            {[
              { v: "{{ name }}", d: "Nome do contato" },
              { v: "{{ phone }}", d: "Telefone do contato" },
              { v: "{{ email }}", d: "E-mail do contato" },
              { v: "{{ user }}", d: "Atendente atribuído" },
              { v: "{{ sector }}", d: "Setor atribuído" },
              { v: "{{ company }}", d: "Nome da empresa" },
            ].map((x) => (
              <div key={x.v} className="flex justify-between border-b py-2">
                <code className="text-primary">{x.v}</code>
                <span className="text-muted-foreground">{x.d}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Configurações do fluxo */}
      {showSettings && (
        <ChatbotSettingsModal flowId={flow.id} open={showSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* Editor de bloco */}
      <NodeEditorDialog
        node={editingNode}
        onClose={() => setEditingNode(null)}
        update={updateNodeData}
        tags={tags}
        sectors={sectors}
        agents={agents}
        randomGroups={randomGroups}
      />
    </div>
  );
}

// ===== Modal de edição por tipo =====

function NodeEditorDialog({
  node, onClose, update, tags, sectors, agents, randomGroups,
}: {
  node: Node | null;
  onClose: () => void;
  update: (id: string, patch: Partial<NodeData>) => void;
  tags: { id: string; name: string; color: string }[];
  sectors: { id: string; name: string }[];
  agents: { id: string; name: string; active: boolean }[];
  randomGroups: { id: string; name: string }[];
}) {
  if (!node) return null;
  const d = node.data as NodeData;
  const set = (patch: Partial<NodeData>) => update(node.id, patch);

  const titleByKind: Record<string, string> = {
    menu: "Editar Menu", message: "Editar Mensagem", satisfaction: "Editar Satisfação",
    redirect: "Editar Redirecionamento", finalize: "Editar Finalização", tag: "Editar Etiqueta",
    random_message: "Editar Mensagem Aleatória", data: "Editar Coleta de Dados",
    distribution: "Editar Distribuição", contact: "Editar Contato", ai_agent: "Editar Agente de IA",
    notes: "Editar Anotação", conditional: "Editar Condicional",
  };

  return (
    <Dialog open={!!node} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{titleByKind[d.kind] ?? "Editar bloco"}</DialogTitle></DialogHeader>

        {d.kind === "message" && <MessageEditor data={d} set={set} />}
        {d.kind === "menu" && <MenuEditor data={d} set={set} />}
        {d.kind === "satisfaction" && <SatisfactionEditor data={d} set={set} />}
        {d.kind === "redirect" && <RedirectEditor data={d} set={set} sectors={sectors} />}
        {d.kind === "finalize" && <SimpleTextEditor data={d} set={set} label="Mensagem de encerramento" />}
        {d.kind === "tag" && <TagEditor data={d} set={set} tags={tags} />}
        {d.kind === "random_message" && <RandomEditor data={d} set={set} groups={randomGroups} />}
        {d.kind === "ai_agent" && <AiAgentEditor data={d} set={set} agents={agents} />}
        {d.kind === "data" && <DataEditor data={d} set={set} />}
        {d.kind === "distribution" && <DistributionEditor data={d} set={set} sectors={sectors} />}
        {d.kind === "contact" && <ContactEditor data={d} set={set} />}
        {d.kind === "notes" && <SimpleTextEditor data={d} set={set} label="Anotação interna" />}
        {d.kind === "conditional" && <ConditionalEditor data={d} set={set} />}

        <DialogFooter>
          <Button onClick={onClose}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Editores específicos =====

function SimpleTextEditor({ data, set, label }: { data: NodeData; set: (p: Partial<NodeData>) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={data.text ?? ""} onChange={(e) => set({ text: e.target.value })} rows={4} />
    </div>
  );
}

function MessageEditor({ data, set }: { data: NodeData; set: (p: Partial<NodeData>) => void }) {
  const sub = data.subtype ?? "text";
  const subtypes: { key: MessageSubtype; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "text", label: "Texto", icon: Type },
    { key: "buttons", label: "Botões", icon: List },
    { key: "list", label: "Lista", icon: MenuIcon },
    { key: "audio", label: "Áudio", icon: Mic },
    { key: "image", label: "Imagem", icon: ImageIcon },
    { key: "video", label: "Vídeo", icon: Video },
    { key: "document", label: "Documento", icon: FileText },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de mensagem</Label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {subtypes.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => set({ subtype: s.key })}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition ${sub === s.key ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Botões e Listas só funcionam dentro da janela de 24h ou via template Meta aprovado.</p>
      </div>

      {(sub === "text" || sub === "buttons" || sub === "list") && (
        <div>
          <Label>Mensagem</Label>
          <Textarea value={data.text ?? ""} onChange={(e) => set({ text: e.target.value })} rows={4} />
        </div>
      )}

      {sub === "buttons" && (
        <div className="space-y-2">
          <Label>Botões (até 3)</Label>
          {(data.buttons ?? []).map((b, i) => (
            <div key={b.id} className="flex gap-2">
              <Input
                value={b.label}
                onChange={(e) => {
                  const list = [...(data.buttons ?? [])];
                  list[i] = { ...b, label: e.target.value };
                  set({ buttons: list });
                }}
                placeholder={`Botão ${i + 1}`}
                maxLength={20}
              />
              <Button variant="outline" size="icon" onClick={() => set({ buttons: (data.buttons ?? []).filter((_, k) => k !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(data.buttons ?? []).length < 3 && (
            <Button variant="outline" size="sm" onClick={() => set({ buttons: [...(data.buttons ?? []), { id: `btn_${Date.now()}`, label: "Novo botão" }] })}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar botão
            </Button>
          )}
        </div>
      )}

      {sub === "list" && (
        <div className="space-y-3">
          <div>
            <Label>Texto do botão da lista</Label>
            <Input value={data.list_button ?? ""} onChange={(e) => set({ list_button: e.target.value })} maxLength={20} placeholder="Ver opções" />
          </div>
          {(data.list_sections ?? []).map((sec, si) => (
            <div key={si} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={sec.title}
                  onChange={(e) => {
                    const list = [...(data.list_sections ?? [])];
                    list[si] = { ...sec, title: e.target.value };
                    set({ list_sections: list });
                  }}
                  placeholder="Título da seção"
                />
                <Button variant="outline" size="icon" onClick={() => set({ list_sections: (data.list_sections ?? []).filter((_, k) => k !== si) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {sec.rows.map((row, ri) => (
                <div key={row.id} className="flex gap-2">
                  <Input
                    value={row.title}
                    onChange={(e) => {
                      const list = [...(data.list_sections ?? [])];
                      const rows = [...list[si].rows];
                      rows[ri] = { ...row, title: e.target.value };
                      list[si] = { ...list[si], rows };
                      set({ list_sections: list });
                    }}
                    placeholder="Título"
                    maxLength={24}
                  />
                  <Input
                    value={row.description ?? ""}
                    onChange={(e) => {
                      const list = [...(data.list_sections ?? [])];
                      const rows = [...list[si].rows];
                      rows[ri] = { ...row, description: e.target.value };
                      list[si] = { ...list[si], rows };
                      set({ list_sections: list });
                    }}
                    placeholder="Descrição (opcional)"
                    maxLength={72}
                  />
                  <Button variant="outline" size="icon" onClick={() => {
                    const list = [...(data.list_sections ?? [])];
                    list[si] = { ...list[si], rows: list[si].rows.filter((_, k) => k !== ri) };
                    set({ list_sections: list });
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => {
                const list = [...(data.list_sections ?? [])];
                list[si] = { ...list[si], rows: [...list[si].rows, { id: `row_${Date.now()}`, title: "Nova opção" }] };
                set({ list_sections: list });
              }}>
                <Plus className="mr-1 h-4 w-4" /> Adicionar linha
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set({ list_sections: [...(data.list_sections ?? []), { title: "Nova seção", rows: [{ id: `row_${Date.now()}`, title: "Opção" }] }] })}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar seção
          </Button>
        </div>
      )}

      {(sub === "audio" || sub === "image" || sub === "video" || sub === "document") && (
        <div className="space-y-3">
          <div>
            <Label>URL da mídia</Label>
            <Input value={data.media_url ?? ""} onChange={(e) => set({ media_url: e.target.value })} placeholder="https://..." />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {sub === "audio" && "Áudio em formato OGG/MP3. Para áudio gravado (voice note), use OGG/Opus."}
              {sub === "image" && "Formatos: JPG, PNG (até 5MB)."}
              {sub === "video" && "Formato MP4 (até 16MB)."}
              {sub === "document" && "PDF, DOCX, XLSX etc. (até 100MB)."}
            </p>
          </div>
          {sub !== "audio" && (
            <div>
              <Label>Legenda (opcional)</Label>
              <Input value={data.caption ?? ""} onChange={(e) => set({ caption: e.target.value })} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuEditor({ data, set }: { data: NodeData; set: (p: Partial<NodeData>) => void }) {
  const opts = data.options ?? [];
  return (
    <div className="space-y-4">
      <div>
        <Label>Texto principal</Label>
        <Textarea value={data.text ?? ""} onChange={(e) => set({ text: e.target.value })} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Cabeçalho (opcional)</Label>
          <Input value={data.menu_header ?? ""} onChange={(e) => set({ menu_header: e.target.value })} />
        </div>
        <div>
          <Label>Rodapé (opcional)</Label>
          <Input value={data.menu_footer ?? ""} onChange={(e) => set({ menu_footer: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Opções</Label>
        {opts.map((o, i) => (
          <div key={o.id ?? i} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
              <Input
                value={o.label}
                onChange={(e) => {
                  const list = [...opts]; list[i] = { ...o, label: e.target.value };
                  set({ options: list });
                }}
                placeholder="Texto da opção"
              />
              <Button variant="outline" size="icon" onClick={() => set({ options: opts.filter((_, k) => k !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={o.description ?? ""}
              onChange={(e) => {
                const list = [...opts]; list[i] = { ...o, description: e.target.value };
                set({ options: list });
              }}
              placeholder="Descrição (opcional)"
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => set({ options: [...opts, { id: `opt_${Date.now()}`, label: `Opção ${opts.length + 1}` }] })}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar opção
        </Button>
      </div>
    </div>
  );
}

function SatisfactionEditor({ data, set }: { data: NodeData; set: (p: Partial<NodeData>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Pergunta</Label>
        <Textarea value={data.text ?? ""} onChange={(e) => set({ text: e.target.value })} rows={3} />
      </div>
      <div>
        <Label>Escala</Label>
        <Select value={String(data.scale ?? 5)} onValueChange={(v) => set({ scale: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">1 a 3</SelectItem>
            <SelectItem value="5">1 a 5</SelectItem>
            <SelectItem value="10">1 a 10 (NPS)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function RedirectEditor({ data, set, sectors }: { data: NodeData; set: (p: Partial<NodeData>) => void; sectors: { id: string; name: string }[] }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Mensagem antes da transferência</Label>
        <Textarea value={data.text ?? ""} onChange={(e) => set({ text: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>Transferir para</Label>
        <Select value={data.redirect_to ?? "sector"} onValueChange={(v) => set({ redirect_to: v as "sector" | "user" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sector">Setor</SelectItem>
            <SelectItem value="user">Atendente específico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.redirect_to === "sector" && (
        <div>
          <Label>Setor</Label>
          <Select value={data.redirect_sector_id || undefined} onValueChange={(v) => set({ redirect_sector_id: v })}>
            <SelectTrigger><SelectValue placeholder="Escolha um setor" /></SelectTrigger>
            <SelectContent>
              {sectors.length === 0 && <SelectItem value="__none" disabled>Nenhum setor cadastrado</SelectItem>}
              {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function TagEditor({ data, set, tags }: { data: NodeData; set: (p: Partial<NodeData>) => void; tags: { id: string; name: string; color: string }[] }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Ação</Label>
        <Select value={data.tag_action ?? "add"} onValueChange={(v) => set({ tag_action: v as "add" | "remove" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Adicionar etiqueta</SelectItem>
            <SelectItem value="remove">Remover etiqueta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Etiqueta</Label>
        <Select value={data.tag_id || undefined} onValueChange={(v) => set({ tag_id: v })}>
          <SelectTrigger><SelectValue placeholder="Escolha uma etiqueta" /></SelectTrigger>
          <SelectContent>
            {tags.length === 0 && <SelectItem value="__none" disabled>Crie etiquetas em Utilidades → Etiquetas</SelectItem>}
            {tags.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function RandomEditor({ data, set, groups }: { data: NodeData; set: (p: Partial<NodeData>) => void; groups: { id: string; name: string }[] }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Grupo de mensagens aleatórias</Label>
        <Select value={data.random_group_id || undefined} onValueChange={(v) => set({ random_group_id: v })}>
          <SelectTrigger><SelectValue placeholder="Escolha um grupo" /></SelectTrigger>
          <SelectContent>
            {groups.length === 0 && <SelectItem value="__none" disabled>Crie grupos em Utilidades → Mensagens Aleatórias</SelectItem>}
            {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AiAgentEditor({ data, set, agents }: { data: NodeData; set: (p: Partial<NodeData>) => void; agents: { id: string; name: string; active: boolean }[] }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Agente de IA</Label>
        <Select value={data.ai_agent_id || undefined} onValueChange={(v) => set({ ai_agent_id: v })}>
          <SelectTrigger><SelectValue placeholder="Escolha um agente" /></SelectTrigger>
          <SelectContent>
            {agents.length === 0 && <SelectItem value="__none" disabled>Crie um agente em ChatBot → Agentes IA</SelectItem>}
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} {a.active ? "" : "(inativo)"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function DataEditor({ data, set }: { data: NodeData; set: (p: Partial<NodeData>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Pergunta enviada ao cliente</Label>
        <Textarea value={data.text ?? ""} onChange={(e) => set({ text: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>Tipo de dado</Label>
        <Select value={data.data_field ?? "name"} onValueChange={(v) => set({ data_field: v as NodeData["data_field"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="cnpj">CNPJ</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.data_field === "custom" && (
        <div>
          <Label>Nome do campo</Label>
          <Input value={data.data_custom_label ?? ""} onChange={(e) => set({ data_custom_label: e.target.value })} />
        </div>
      )}
    </div>
  );
}

function DistributionEditor({ data, set, sectors }: { data: NodeData; set: (p: Partial<NodeData>) => void; sectors: { id: string; name: string }[] }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Estratégia</Label>
        <Select value={data.distribution_strategy ?? "round_robin"} onValueChange={(v) => set({ distribution_strategy: v as NodeData["distribution_strategy"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="round_robin">Round-robin (alternar)</SelectItem>
            <SelectItem value="least_busy">Menos ocupado</SelectItem>
            <SelectItem value="random">Aleatório</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Setor</Label>
        <Select value={data.distribution_sector_id || undefined} onValueChange={(v) => set({ distribution_sector_id: v })}>
          <SelectTrigger><SelectValue placeholder="Escolha um setor" /></SelectTrigger>
          <SelectContent>
            {sectors.length === 0 && <SelectItem value="__none" disabled>Nenhum setor cadastrado</SelectItem>}
            {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ContactEditor({ data, set }: { data: NodeData; set: (p: Partial<NodeData>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Nome do contato</Label>
        <Input value={data.contact_name ?? ""} onChange={(e) => set({ contact_name: e.target.value })} />
      </div>
      <div>
        <Label>Telefone (formato internacional)</Label>
        <Input value={data.contact_phone ?? ""} onChange={(e) => set({ contact_phone: e.target.value })} placeholder="+55 11 99999-0000" />
      </div>
    </div>
  );
}

function ConditionalEditor({ data, set }: { data: NodeData; set: (p: Partial<NodeData>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Campo</Label>
        <Input value={data.cond_field ?? ""} onChange={(e) => set({ cond_field: e.target.value })} placeholder="{{ message }}" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Operador</Label>
          <Select value={data.cond_op ?? "contains"} onValueChange={(v) => set({ cond_op: v as NodeData["cond_op"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="eq">Igual a</SelectItem>
              <SelectItem value="neq">Diferente de</SelectItem>
              <SelectItem value="contains">Contém</SelectItem>
              <SelectItem value="gt">Maior que</SelectItem>
              <SelectItem value="lt">Menor que</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Valor</Label>
          <Input value={data.cond_value ?? ""} onChange={(e) => set({ cond_value: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
