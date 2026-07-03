import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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

export function ToolCard({ tool, onSelect }: ToolCardProps) {
  const healthIcon = {
    healthy: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    degraded: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    down: <XCircle className="h-4 w-4 text-red-500" />,
    unknown: <Activity className="h-4 w-4 text-gray-400" />,
  };

  const healthColor = {
    healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    down: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${tool.is_deprecated ? 'opacity-60' : ''}`}
      onClick={() => onSelect?.(tool.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{tool.name}</CardTitle>
          {tool.health_status && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${healthColor[tool.health_status]}`}>
              {healthIcon[tool.health_status]}
              <span>{tool.health_status}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
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
