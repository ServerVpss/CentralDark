import React, { useState } from 'react';
import { HealthCard } from './HealthCard';
import { AlertBanner } from './AlertBanner';
import { StatusTimeline } from './StatusTimeline';
import { useHealth } from '@/hooks/useHealth';

export function DashboardTab() {
  const { health, alerts, timeline, loading } = useHealth();
  const [showAlerts, setShowAlerts] = useState(true);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {showAlerts && alerts.length > 0 && (
        <div className="relative">
          <AlertBanner alerts={alerts} onDismiss={() => setShowAlerts(false)} />
        </div>
      )}
      <HealthCard health={health} />
      <StatusTimeline entries={timeline} />
    </div>
  );
}
