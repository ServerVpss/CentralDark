import React from 'react';
// O Vite incorpora exatamente este registro existente no build; nao ha lista
// paralela nem chamada de rede privilegiada no browser.
import registryJson from '../../../../../../MODULES/HUB/hub-connections.registry.json?raw';

type HubConnection = {
  id: string;
  label: string;
  owner: string;
  proof_state: string;
  status_surface: string;
  enabled: boolean;
  sector?: string;
  notes?: string;
};

function parseRegistry(raw: string): { connections: HubConnection[]; valid: boolean } {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return { connections: [], valid: false };
    const record = data as { schema?: string; connections?: unknown };
    if (record.schema !== 'centraldark.modules.hub.connections.v1' || !Array.isArray(record.connections)) {
      return { connections: [], valid: false };
    }
    const entries = record.connections as unknown[];
    const valid = entries.every((item) => {
      if (!item || typeof item !== 'object') return false;
      const entry = item as Partial<HubConnection>;
      return typeof entry.id === 'string' && typeof entry.label === 'string' &&
        typeof entry.owner === 'string' && typeof entry.status_surface === 'string' &&
        typeof entry.proof_state === 'string' && typeof entry.enabled === 'boolean';
    });
    if (!valid || new Set(entries.map((item) => (item as HubConnection).id)).size !== entries.length) {
      return { connections: [], valid: false };
    }
    return { connections: entries as HubConnection[], valid: true };
  } catch {
    return { connections: [], valid: false };
  }
}

const registry = parseRegistry(registryJson);

const controlFiles = [
  'MODULES/HUB/README.md',
  'MODULES/HUB/hub-connections.registry.json',
  'MODULES/HUB/controls/notifications-and-sensors.json',
  'MODULES/HUB/status-centraldark.routes.json',
  'MODULES/HUB/triggers/domain-expansion.trigger.json',
  'MODULES/HUB/playbooks/EXPANSAO-DE-DOMINIO.md',
];

export function MegazordHubCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MODULES/HUB</p>
        <h2 className="text-xl font-bold">🧩 Megazord de conexões</h2>
        <p className="text-sm text-muted-foreground">
          Zords são setores completos, plugáveis pelo contrato canônico. Este painel usa o registro real do HUB, sem criar outro cérebro.
        </p>
        <p className="text-xs text-muted-foreground">
          Catálogo incorporado no build, não saúde ao vivo. Mudanças no registro exigem novo build/deploy; só execução com prova recebe PASS operacional.
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-dashed border-border bg-background/60 p-3">
        <div className="text-sm font-semibold">😈🔨 EXPANSÃO DE DOMÍNIO</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Gatilho determinístico: medir setor, reutilizar owner, criar micro-delta, passar por CI/receipt e só promover PASS comprovado.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-1">UNKNOWN != PASS</span>
          <span className="rounded-full bg-muted px-2 py-1">CI_PENDING_IS_NOT_PASS</span>
          <span className="rounded-full bg-muted px-2 py-1">REUSE_BEFORE_CREATE</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-source="MODULES/HUB/hub-connections.registry.json">
        {!registry.valid && (
          <p className="text-sm text-amber-600" role="alert">
            REGISTRY_INVALID — sem estados inventados. Verifique o registro canônico do HUB.
          </p>
        )}
        {registry.connections.map((item) => (
          <div key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.sector ?? item.id}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-1">{item.enabled ? 'Cadastrado' : 'Nó candidato — não ativado'}</span>
              <span className="rounded-full bg-muted px-2 py-1">{item.proof_state}</span>
            </div>
            <p className="mt-2 break-all text-xs text-muted-foreground">{item.status_surface}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">Owner: {item.owner}</p>
            {item.notes && <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-border p-3">
        <div className="text-sm font-semibold">Arquivos editáveis</div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {controlFiles.map((file) => (
            <li key={file}><code>{file}</code></li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Regra: notificação ≠ PASS; commit ≠ deploy; CONFIG_BLOCKED ≠ READY; XP só promove com receipt validado.
      </div>
    </section>
  );
}
