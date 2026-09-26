# COMANDO - ChatbotFlowEditor.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\chatbot\ChatbotFlowEditor.tsx
**SHA:** e4d94bd6970b36a4
**Timestamp:** 2026-08-26T19:31:36.586373
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const nodeTypes = { start: StartNode, generic: GenericNode };

### Contratos
- const navigate = useNavigate();

### Gaps
- <Background gap={20} />

### Ouro Bruto (primeiros 5000 chars)
```
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
          { id: "opt_1", label
```