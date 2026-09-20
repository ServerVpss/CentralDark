import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';

interface RuleBadgeProps {
  tier: number;
  needsApproval?: boolean;
  enabled?: boolean;
}

// Reflete a decisão do PDP (hub.pdp_evaluate): tier 4 nunca autoriza,
// needs_approval exige aprovação humana, senão é allow direto.
export function RuleBadge({ tier, needsApproval = false, enabled = true }: RuleBadgeProps) {
  if (!enabled) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Shield className="w-3 h-3 mr-1" />
        Desativada
      </Badge>
    );
  }

  if (tier >= 4) {
    return (
      <Badge variant="destructive">
        <ShieldX className="w-3 h-3 mr-1" />
        Tier 4 · Bloqueado
      </Badge>
    );
  }

  if (needsApproval) {
    return (
      <Badge variant="warning">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Requer Aprovação
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      <ShieldCheck className="w-3 h-3 mr-1" />
      Permitir · Tier {tier}
    </Badge>
  );
}
