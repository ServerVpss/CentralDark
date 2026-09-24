import React from 'react';

const connections = [
  { id: 'telegram-bot-api-security-sol', label: 'Telegram Bot API / Security-SOL', state: 'PASS parcial', surface: 'status.centraldark.telegram.bot' },
  { id: 'telegram-mtproto-user-bridge', label: 'Telegram MTProto user bridge', state: 'CONFIG_BLOCKED', surface: 'status.centraldark.telegram.mtproto' },
  { id: 'github-actions-email-signal', label: 'GitHub/Gmail event signal', state: 'EVENT_ONLY', surface: 'status.centraldark.github.email_signal' },
  { id: 'vps-runtime', label: 'VPS Runtime / PM2', state: 'PASS parcial', surface: 'status.centraldark.vps.runtime' },
  { id: 'mcp-centraldark', label: 'MCP CentralDark', state: 'PASS parcial', surface: 'status.centraldark.mcp.health' },
  { id: 'meta-lupa-reward-engine', label: 'Meta-Lupa XP/posterior', state: 'engine exists / binding pending', surface: 'status.centraldark.meta_lupa.score' },
];

const controlFiles = [
  'MODULES/HUB/README.md',
  'MODULES/HUB/hub-connections.registry.json',
  'MODULES/HUB/controls/notifications-and-sensors.json',
  'MODULES/HUB/status-centraldark.routes.json',
];

export function MegazordHubCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MODULES/HUB</p>
        <h2 className="text-xl font-bold">🧩 Megazord de conexões</h2>
        <p className="text-sm text-muted-foreground">
          Central visível/editável para sensores, notificações, MCP, IA e rotas do status.centraldark. Não é cérebro paralelo; aponta para owners reais.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {connections.map((item) => (
          <div key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.id}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-1">{item.state}</span>
              <span className="rounded-full bg-muted px-2 py-1">{item.surface}</span>
            </div>
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
