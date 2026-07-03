import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface Decision {
  id: string;
  event_type: string;
  agent: string;
  action: string;
  target: string;
  result: 'approved' | 'vetoed' | 'pending' | 'error';
  veto_reason?: string;
  created_at: string;
}

interface DecisionRowProps {
  decision: Decision;
  onViewDetails?: (id: string) => void;
}

export function DecisionRow({ decision, onViewDetails }: DecisionRowProps) {
  const resultConfig = {
    approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-300' },
    vetoed: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    error: { icon: AlertTriangle, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  };

  const config = resultConfig[decision.result];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{decision.action} — {decision.target}</p>
          <p className="text-xs text-muted-foreground">
            {decision.agent} · {new Date(decision.created_at).toLocaleString('pt-BR')}
          </p>
          {decision.veto_reason && (
            <p className="text-xs text-red-600 mt-1">Motivo: {decision.veto_reason}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={config.color} variant="outline">
          {decision.result}
        </Badge>
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(decision.id)}>
            Detalhes
          </Button>
        )}
      </div>
    </div>
  );
}
