import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Activity, Cpu, Server, Wifi } from 'lucide-react';

interface HealthData {
  status?: 'healthy' | 'degraded' | 'down' | string;
  uptime?: number;
  cpu?: number;
  memory?: number;
  lastCheck?: string;
  services?: { name: string; status: string }[];
}

interface HealthCardProps {
  health: HealthData | null;
}

export function HealthCard({ health }: HealthCardProps) {
  const status = health?.status ?? 'down';

  const statusColor =
    {
      healthy: 'bg-green-500',
      degraded: 'bg-yellow-500',
      down: 'bg-red-500',
    }[status] ?? 'bg-gray-500';

  const statusLabel =
    {
      healthy: 'Saudável',
      degraded: 'Degradado',
      down: 'Indisponível',
    }[status] ?? status;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Saúde do Sistema</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${statusColor}`} />
          <span className="text-lg font-bold">{statusLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span>Uptime: {Math.floor((health?.uptime ?? 0) / 3600)}h</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span>CPU: {health?.cpu ?? '—'}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <span>RAM: {health?.memory ?? '—'}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Último: {health?.lastCheck ?? '—'}</span>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          {(health?.services ?? []).map((svc) => (
            <div key={svc.name} className="flex items-center justify-between text-xs">
              <span>{svc.name}</span>
              <Badge variant={svc.status === 'healthy' ? 'default' : 'destructive'}>
                {svc.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
