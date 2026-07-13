import { Badge } from "@/compartilhado/ui/badge";
import type { ToolCategory, ToolRisk } from "./mcp-adapter";
import {
  Server, Github, Brain, Database, Rocket, ScrollText,
  ShieldCheck, Sparkles, Plug, Boxes,
  Eye, Pencil, Terminal, Zap, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_META: Record<ToolCategory, { icon: LucideIcon; className: string }> = {
  VPS:           { icon: Server,      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  GitHub:        { icon: Github,      className: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30" },
  Consciência:   { icon: Brain,       className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30" },
  Supabase:      { icon: Database,    className: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30" },
  Deploy:        { icon: Rocket,      className: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  Logs:          { icon: ScrollText,  className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  Admin:         { icon: ShieldCheck, className: "bg-primary/10 text-primary border-primary/30" },
  Cognitivas:    { icon: Sparkles,    className: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30" },
  Integrações:   { icon: Plug,        className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30" },
  Outras:        { icon: Boxes,       className: "bg-muted text-muted-foreground border-border" },
};

const RISK_META: Record<ToolRisk, { icon: LucideIcon; className: string; label: string }> = {
  leitura:   { icon: Eye,      label: "Leitura",   className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  escrita:   { icon: Pencil,   label: "Escrita",   className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  execucao:  { icon: Terminal, label: "Execução",  className: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  deploy:    { icon: Zap,      label: "Deploy",    className: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30" },
  protegida: { icon: Lock,     label: "Protegida", className: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30" },
};

export function ToolCategoryBadge({ category }: { category: ToolCategory }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${meta.className}`}>
      <Icon className="w-3 h-3" aria-hidden />
      {category}
    </Badge>
  );
}

export function ToolRiskBadge({ risk }: { risk: ToolRisk }) {
  const meta = RISK_META[risk];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${meta.className}`}>
      <Icon className="w-3 h-3" aria-hidden />
      {meta.label}
    </Badge>
  );
}

export const CATEGORIES: ToolCategory[] = [
  "VPS", "GitHub", "Consciência", "Supabase", "Deploy",
  "Logs", "Admin", "Cognitivas", "Integrações", "Outras",
];
export const RISKS: ToolRisk[] = ["leitura", "escrita", "execucao", "deploy", "protegida"];
