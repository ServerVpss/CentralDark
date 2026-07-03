import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface TimelineEntry {
  id: string;
  event: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  timestamp: string;
  details?: string;
}

interface StatusTimelineProps {
  entries: TimelineEntry[];
  loading?: boolean;
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'pending': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    success: { label: 'Sucesso', variant: 'default' },
    error: { label: 'Erro', variant: 'destructive' },
    warning: { label: 'Alerta', variant: 'secondary' },
    pending: { label: 'Pendente', variant: 'outline' },
  };
  const m = map[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={m.variant}>{m.label}</Badge>;
};

export function StatusTimeline({ entries, loading }: StatusTimelineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando eventos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Nenhum evento registrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Linha do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 border-l-2 border-border pl-4 pb-4 last:pb-0">
              <div className="mt-0.5">{statusIcon(entry.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{entry.event}</span>
                  {statusBadge(entry.status)}
                </div>
                {entry.details && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(entry.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
