import React, { useState } from 'react';
import { HealthCard } from './HealthCard';
import { AlertBanner } from './AlertBanner';
import { StatusTimeline } from './StatusTimeline';
import { ApiCardsGrid } from './ApiCardsGrid';
import { AbacusApiCard } from './AbacusApiCard';
import { AbacusRouteLLMCard } from './AbacusRouteLLMCard';
import { MegazordHubCard } from './MegazordHubCard';
import { useHealth } from '@/hooks/useHealth';
import type { HubDeploySnapshot } from '@/hooks/useHubAutoRefresh';

export function DashboardTab({ deploy }: { deploy: HubDeploySnapshot | null }) {
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
      <section className="rounded-xl border border-border bg-card p-4" role="status" aria-live="polite" data-owner="status.github.head">
        <h2 className="text-base font-semibold">🚀 Radar de deploy · main → VPS</h2>
        <p className="mt-1 text-sm font-medium">
          {!deploy ? 'Consultando a esteira...' :
           deploy.state === 'SENSOR_BLOCKED' ? 'Sensor indisponível — sem falsa conclusão' :
           deploy.state === 'PENDING' ? 'Novo SHA: deploy pendente' :
           deploy.state === 'QUEUED' ? 'Deploy na fila do runner' :
           deploy.state === 'RUNNING' ? 'Deploy em execução' :
           deploy.state === 'FAILED' ? 'Deploy falhou — conferir job' :
           'CI terminou; runtime da VPS ainda sem readback'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          SHA main: {deploy?.mainSha?.slice(0, 12) ?? 'não medido'} ·
          Workflow: {deploy?.runStatus ?? 'não medido'} ·
          Conferido: {deploy?.verifiedAt ?? 'aguardando'}
        </p>
        {deploy?.reason && <p className="mt-1 text-xs text-amber-600">Pendência: {deploy.reason}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Commit e CI não comprovam deploy. PASS de runtime só com SHA, health e receipt.</p>
        <a className="mt-2 inline-block text-sm underline underline-offset-2" target="_blank" rel="noreferrer"
          href={deploy?.runUrl || deploy?.workflowUrl || 'https://github.com/ServerVpss/CentralDark/actions/workflows/vps-exec-selfhosted.yml'}>
          Abrir esteira canônica no GitHub ↗
        </a>
      </section>
      <HealthCard health={health} />
      <MegazordHubCard />
      <AbacusRouteLLMCard />
      <AbacusApiCard />
      <ApiCardsGrid />
      <StatusTimeline entries={timeline} />
    </div>
  );
}
