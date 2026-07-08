import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Activity, AlertTriangle, CheckCircle2, XCircle,
  Github, ShieldCheck, FileText, Server, ListChecks,
  Sparkles, Database, Wrench, FolderTree, Brain, Package,
} from 'lucide-react';

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    version: string;
    is_deprecated: boolean;
    health_status?: 'healthy' | 'degraded' | 'down' | 'unknown';
  };
  onSelect?: (id: string) => void;
}

// Ícone + cor original por categoria (paleta esmeralda CentralDark)
const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; ring: string; bg: string }> = {
  github:     { icon: <Github      className="h-5 w-5" />, ring: 'ring-slate-500/40',   bg: 'bg-slate-500/10 text-slate-200' },
  admin:      { icon: <ShieldCheck className="h-5 w-5" />, ring: 'ring-rose-500/40',    bg: 'bg-rose-500/10 text-rose-300' },
  docs:       { icon: <FileText    className="h-5 w-5" />, ring: 'ring-sky-500/40',     bg: 'bg-sky-500/10 text-sky-300' },
  vps:        { icon: <Server      className="h-5 w-5" />, ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10 text-emerald-300' },
  pendencias: { icon: <ListChecks  className="h-5 w-5" />, ring: 'ring-amber-500/40',   bg: 'bg-amber-500/10 text-amber-300' },
  skills:     { icon: <Sparkles    className="h-5 w-5" />, ring: 'ring-violet-500/40',  bg: 'bg-violet-500/10 text-violet-300' },
  supabase:   { icon: <Database    className="h-5 w-5" />, ring: 'ring-teal-500/40',    bg: 'bg-teal-500/10 text-teal-300' },
  ops:        { icon: <Wrench      className="h-5 w-5" />, ring: 'ring-orange-500/40',  bg: 'bg-orange-500/10 text-orange-300' },
  fs:         { icon: <FolderTree  className="h-5 w-5" />, ring: 'ring-indigo-500/40',  bg: 'bg-indigo-500/10 text-indigo-300' },
  ia:         { icon: <Brain       className="h-5 w-5" />, ring: 'ring-fuchsia-500/40', bg: 'bg-fuchsia-500/10 text-fuchsia-300' },
};

const FALLBACK_STYLE = { icon: <Package className="h-5 w-5" />, ring: 'ring-muted', bg: 'bg-muted text-muted-foreground' };

export function ToolCard({ tool, onSelect }: ToolCardProps) {
  const healthIcon = {
    healthy: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    degraded: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    down: <XCircle className="h-4 w-4 text-rose-400" />,
    unknown: <Activity className="h-4 w-4 text-muted-foreground" />,
  };

  const healthColor = {
    healthy: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    degraded: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    down: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    unknown: 'bg-muted text-muted-foreground border border-border',
  };

  const style = CATEGORY_STYLE[tool.category] ?? FALLBACK_STYLE;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${tool.is_deprecated ? 'opacity-60' : ''}`}
      onClick={() => onSelect?.(tool.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${style.ring} ${style.bg}`}>
              {style.icon}
            </div>
            <CardTitle className="text-base font-semibold truncate">{tool.name}</CardTitle>
          </div>
          {tool.health_status && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs shrink-0 ${healthColor[tool.health_status]}`}>
              {healthIcon[tool.health_status]}
              <span>{tool.health_status}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{tool.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{tool.category}</Badge>
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tool.tags.length - 3}
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">v{tool.version}</span>
        </div>
        {tool.is_deprecated && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
            <AlertTriangle className="h-3 w-3" />
            <span>Depreciado — não recomendado para novos usos</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
