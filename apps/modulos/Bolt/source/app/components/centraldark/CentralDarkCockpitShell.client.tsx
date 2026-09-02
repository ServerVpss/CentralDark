import { useEffect, useMemo, useState, type ReactNode } from 'react';
import './centraldark-cockpit.scss';

type HouseMode = 'OPERAR' | 'PLANEJAR' | 'TAREFA' | 'DELEGAR';
type LiveState = 'ONLINE' | 'OFFLINE' | 'UNKNOWN';

type RuntimeSnapshot = {
  app_name?: string;
  app_version?: string;
  house_root?: string;
  hermes_base_url?: string;
  screenpipe_base_url?: string;
  widget_shortcut?: string;
};

type HealthSnapshot = {
  status?: LiveState;
  endpoint?: string;
  latency_ms?: number;
};

type CentralDarkBridge = {
  getRuntime?: () => Promise<RuntimeSnapshot>;
  getHermesHealth?: () => Promise<HealthSnapshot>;
  getScreenpipeHealth?: () => Promise<HealthSnapshot>;
  toggleWidget?: () => Promise<unknown>;
};

const modes: Array<{ id: HouseMode; label: string; explanation: string }> = [
  { id: 'OPERAR', label: 'Operar', explanation: 'executar pelo menor conjunto suficiente' },
  { id: 'PLANEJAR', label: 'Planejar', explanation: 'organizar o caminho sem escrever ainda' },
  { id: 'TAREFA', label: 'Tarefa', explanation: 'fechar um alvo verificável de cada vez' },
  { id: 'DELEGAR', label: 'Delegar', explanation: 'distribuir capacidades sem multiplicar autoridade' },
];

const navItems = [
  ['i-ph:house', 'Início'],
  ['i-ph:list-checks', 'Meu trabalho'],
  ['i-ph:calendar-check', 'Automações'],
  ['i-ph:squares-four', 'Personalizar'],
] as const;

const visualWorkMarkers = [
  ['TODO', 'coisa para fazer'],
  ['FIXME', 'defeito confirmado'],
  ['UNKNOWN', 'ainda não medido'],
  ['BLOCKED', 'dependência impedindo avanço'],
  ['PROOF', 'falta prova'],
  ['COUNTERPROOF', 'falta contraprova'],
  ['CANDIDATE', 'delta ainda não promovido'],
  ['LOCKED', 'consolidado / somente leitura'],
  ['REGRESSION', 'algo que funcionava regrediu'],
  ['OWNER', 'dono da ferida'],
] as const;

function getBridge(): CentralDarkBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { centraldark?: CentralDarkBridge }).centraldark;
}

function StatusDot({ state }: { state: LiveState }) {
  return <span className={`cd-status-dot cd-status-dot--${state.toLowerCase()}`} aria-label={state} />;
}

function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="cd-progress" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}>
      <div className="cd-progress__fill" style={{ width: `${safe}%` }} />
    </div>
  );
}

export function CentralDarkCockpitShell({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HouseMode>('OPERAR');
  const [activeNav, setActiveNav] = useState('Meu trabalho');
  const [runtime, setRuntime] = useState<RuntimeSnapshot | null>(null);
  const [hermes, setHermes] = useState<HealthSnapshot>({ status: 'UNKNOWN' });
  const [screenpipe, setScreenpipe] = useState<HealthSnapshot>({ status: 'UNKNOWN' });

  useEffect(() => {
    const api = getBridge();
    if (!api) return;

    api.getRuntime?.().then(setRuntime).catch(() => setRuntime(null));
    api.getHermesHealth?.().then(setHermes).catch(() => setHermes({ status: 'UNKNOWN' }));
    api.getScreenpipeHealth?.().then(setScreenpipe).catch(() => setScreenpipe({ status: 'UNKNOWN' }));
  }, []);

  const readiness = useMemo(() => {
    const signals = [Boolean(runtime), hermes.status === 'ONLINE', screenpipe.status === 'ONLINE'];
    const closed = signals.filter(Boolean).length;
    return { closed, denominator: signals.length, pct: Math.round((closed / signals.length) * 100) };
  }, [runtime, hermes.status, screenpipe.status]);

  const modeInfo = modes.find((item) => item.id === mode) ?? modes[0];

  return (
    <div className="cd-cockpit">
      <aside className="cd-sidebar">
        <div className="cd-brand">
          <div className="cd-brand__mark">CD</div>
          <div className="cd-brand__copy"><strong>CentralDark</strong><small>cockpit da Casa</small></div>
        </div>

        <nav className="cd-nav" aria-label="Navegação principal">
          {navItems.map(([icon, label]) => (
            <button
              key={label}
              type="button"
              className={`cd-nav__item ${activeNav === label ? 'is-active' : ''}`}
              onClick={() => setActiveNav(label)}
            >
              <span className={`${icon} cd-nav__icon`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="cd-side-section">
          <div className="cd-side-section__title"><span>Sessões</span><span className="cd-muted">1 ativa</span></div>
          <div className="cd-session is-active">
            <span className="cd-live-dot" />
            <div><strong>CentralDark</strong><small>sessão atual</small></div>
          </div>
        </section>

        <section className="cd-side-section cd-side-section--grow">
          <div className="cd-side-section__title">Casa</div>
          <div className="cd-project is-active"><span className="i-ph:folder-open" /><span>ServerVpss/CentralDark</span></div>
          <div className="cd-project"><span className="i-ph:desktop" /><span>CentralDark Desktop</span></div>
          <div className="cd-project"><span className="i-ph:waveform" /><span>SOL · voz e widget</span></div>
        </section>

        <footer className="cd-sidebar__footer">
          <div className="cd-mini-status"><StatusDot state={hermes.status ?? 'UNKNOWN'} /><span>Hermes {hermes.status ?? 'UNKNOWN'}</span></div>
          <div className="cd-mini-status"><StatusDot state={screenpipe.status ?? 'UNKNOWN'} /><span>Screenpipe {screenpipe.status ?? 'UNKNOWN'}</span></div>
        </footer>
      </aside>

      <section className="cd-stage">
        <header className="cd-commandbar">
          <div className="cd-commandbar__group">
            <div className="cd-pill"><span className="i-ph:circles-three-plus" />CentralDark</div>
            <label className="cd-select">
              <span className="sr-only">Modo operacional</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as HouseMode)}>
                {modes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <div className="cd-pill cd-pill--muted"><span className="i-ph:cpu" />Motor automático</div>
          </div>

          <div className="cd-commandbar__group">
            <button type="button" className="cd-button" onClick={() => getBridge()?.toggleWidget?.()}>
              <span className="i-ph:waveform" /> SOL
            </button>
            <button type="button" className="cd-button cd-button--primary" disabled title="Interface reservada; criação de sessão ainda não ligada ao backend">
              <span className="i-ph:plus" /> Nova sessão
            </button>
          </div>
        </header>

        <div className="cd-modebar">
          <div><strong>{modeInfo.label}</strong><span>{modeInfo.explanation}</span></div>
          <div className="cd-chip-row">
            <span className="cd-chip">Writer único</span>
            <span className="cd-chip">Realidade julga</span>
            <span className="cd-chip">Reusar antes de criar</span>
          </div>
        </div>

        <main className="cd-workspace">{children}</main>
      </section>

      <aside className="cd-status-panel">
        <header className="cd-status-panel__header">
          <div><small>CENTRAL DE STATUS</small><strong>Nível observável</strong></div>
          <span className="cd-level">L{Math.max(1, readiness.closed)}</span>
        </header>

        <section className="cd-status-card">
          <div className="cd-status-line"><span>Prontidão deste cartão</span><strong>{readiness.pct}%</strong></div>
          <ProgressBar value={readiness.pct} />
          <small>{readiness.closed}/{readiness.denominator} sinais observáveis. Não é percentual global do projeto.</small>
        </section>

        <section className="cd-status-card cd-status-card--list">
          <div className="cd-evidence"><span className="i-ph:desktop" /><div><strong>Desktop</strong><small>{runtime ? 'DETECTADO' : 'UNKNOWN'}</small></div></div>
          <div className="cd-evidence"><span className="i-ph:lightning" /><div><strong>Hermes</strong><small>{hermes.status ?? 'UNKNOWN'}{typeof hermes.latency_ms === 'number' ? ` · ${hermes.latency_ms} ms` : ''}</small></div></div>
          <div className="cd-evidence"><span className="i-ph:eye" /><div><strong>Screenpipe</strong><small>{screenpipe.status ?? 'UNKNOWN'}{typeof screenpipe.latency_ms === 'number' ? ` · ${screenpipe.latency_ms} ms` : ''}</small></div></div>
          <div className="cd-evidence"><span className="i-ph:git-pull-request" /><div><strong>GitHub</strong><small>PR #1381 · mesmo Writer</small></div></div>
        </section>

        <section className="cd-status-card cd-status-card--list" aria-label="Mapa visual de pendências">
          <div className="cd-status-line"><span>Mapa visual de pendências</span><strong>VISUAL</strong></div>
          {visualWorkMarkers.map(([marker, explanation]) => (
            <div key={marker} className="cd-evidence">
              <span className="i-ph:list-checks" />
              <div><strong>{marker}</strong><small>{explanation}</small></div>
            </div>
          ))}
          <p className="cd-status-copy">Projeção visual inspirada em Todo Tree. Não cria tarefa, não muda owner, não executa, não prova runtime e não promove estado.</p>
        </section>

        <section className="cd-status-card">
          <div className="cd-status-line"><span>Modo atual</span><strong>{mode}</strong></div>
          <p className="cd-status-copy">O seletor muda a forma de operar. Não muda autoridade, identidade nem transforma seleção em execução.</p>
        </section>

        <section className="cd-status-card">
          <div className="cd-status-line"><span>Ponto fixo</span><strong className="cd-warning">AINDA NÃO</strong></div>
          <p className="cd-status-copy">Ponto fixo = o escopo terminou com prova e sem pendência material. Esta tela preserva UNKNOWN em vez de pintar verde cedo.</p>
        </section>
      </aside>
    </div>
  );
}
