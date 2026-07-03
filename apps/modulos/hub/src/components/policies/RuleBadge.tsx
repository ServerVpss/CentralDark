import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';

interface RuleBadgeProps {
  ruleType: 'allow' | 'block' | 'require_veto';
  enabled: boolean;
}

export function RuleBadge({ ruleType, enabled }: RuleBadgeProps) {
  if (!enabled) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Shield className="w-3 h-3 mr-1" />
        Desativada
      </Badge>
    );
  }

  const config = {
    allow: { icon: ShieldCheck, label: 'Permitir', variant: 'success' as const },
    block: { icon: ShieldX, label: 'Bloquear', variant: 'destructive' as const },
    require_veto: { icon: AlertTriangle, label: 'Requer Veto', variant: 'warning' as const },
  };

  const { icon: Icon, label, variant } = config[ruleType];

  return (
    <Badge variant={variant}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
