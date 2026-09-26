import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { AuditLog } from '@/types/audit';

interface DecisionRowProps {
  entry: AuditLog;
  onViewDetails?: (id: number) => void;
}

const decisionConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  allow: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-300' },
  deny: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
  require_approval: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
};

export function DecisionRow({ entry: decision, onViewDetails }: DecisionRowProps) {
  const config = decisionConfig[decision.decision] || { icon: AlertTriangle, color: 'bg-orange-100 text-orange-800 border-orange-300' };
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{decision.tool} · Tier {decision.tier}</p>
          <p className="text-xs text-muted-foreground">
            {decision.agent_identity} · {new Date(decision.ts).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={config.color} variant="outline">
          {decision.decision}
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
