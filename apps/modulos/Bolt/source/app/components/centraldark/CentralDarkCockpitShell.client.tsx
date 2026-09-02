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
  ['COGNITIVE_DEBT', 'rastro causal insuficiente; alguém teria de adivinhar'],
  ['HYPOTHESIS', 'estado candidato coexistindo até medição aplicável'],
  ['CANDIDATE', 'delta ainda não promovido'],
  ['LOCKED', 'consolidado / somente leitura'],
  ['REGRESSION', 'algo que funcionava regrediu'],
  ['OWNER', 'dono da ferida'],
] as const;

const cognitiveTheoryChecks = [
  ['INTENT', 'intenção reconstruível?'],
  ['DECISION', 'decisão explicável?'],
  ['OWNER', 'owner conhecido?'],
  ['RELATIONS', 'relações entre peças claras?'],
  ['REVERSIBLE', 'mudança reversível?'],
  ['HANDOFF', 'próximo agente continua sem adivinhar?'],
] as const;

const operationalInvariants = [
  ['CURRENT > HISTORY', 'estado vivo vence histórico'],
  ['UNKNOWN != PASS', 'ausência de prova não vira verde'],
  ['DOCUMENTED != EXECUTED', 'texto não prova runtime'],
  ['ACTION != PROOF', 'ação precisa de evidência'],
  ['REUSE_BEFORE_CREATE', 'reusar owner antes de criar'],
  ['ONE_SYSTEM_ONLY', 'nenhum braço vira segunda CentralDark'],
  ['ONE_WRITER_PER_SCOPE', 'mutação serial por escopo'],
  ['CONTINUE_BEFORE_RESTART', 'interrupção não abandona missão ativa'],
  ['OBSERVED_USER_REPORT != RUNTIME_PROOF', 'relato ou screenshot abre candidato; runtime aplicável decide PASS'],
  ['PROVIDER_PANEL != PROVIDER_PUBLIC_API', 'recurso visível no painel externo não implica capability disponível na API'],
  ['QUANTUM_ANALOGY != QUANTUM_RUNTIME', 'multi-hipótese é modelo clássico; não prova qubits'],
  ['ENTANGLEMENT != FTL_SIGNAL', 'correlação quântica não autoriza comunicação acima da luz'],
] as const;

const integratedCapabilitySurfaces = [
  {
    key: 'ACCOUNTS_HUB',
    label: 'Contas / Hub',
    icon: 'i-ph:key',
    owner: 'apps/modulos/oauth-broker/server.mjs',
    detail: 'providers + connections + OAuth/API-key; saúde viva ainda não medida pelo bridge do Cockpit',
  },
  {
    key: 'TELEGRAM',
    label: 'Bot Telegram',
    icon: 'i-ph:paper-plane-tilt',
    owner: 'apps/bot-telegram/ + checker existente',
    detail: 'runtime deve ser provado pelo checker/PM2 no alvo; presença de source não significa ONLINE',
  },
  {
    key: 'CLOUDFLARE',
    label: 'Cloudflare / DNS',
    icon: 'i-ph:cloud',
    owner: 'scripts/cloudflare/cf-sync.sh',
    detail: 'sync idempotente existente; token/DNS continuam UNKNOWN até --check/T1 no território correto',
  },
  {
    key: 'CONTABO_VPS',
    label: 'Contabo / VPS',
    icon: 'i-ph:server',
    owner: 'apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js + apps/modulos/oauth-broker/server.mjs',
    detail: 'Hub/Broker/MCP Admin já existem para instâncias, snapshots e audits; ações destrutivas exigem gate + receipt; painel externo não vira capability API por inferência',
  },
] as const;

const hypothesisStateDimensions = cognitiveTheoryChecks.length;
const hypothesisStateSpace = 2 ** hypothesisStateDimensions;

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
            <span className="cd-chip">Dívida cognitiva visível</span>
            <span className="cd-chip">Multi-hipótese clássica</span>
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
          <div className="cd-evidence"><span className="i-ph:git-pull-request" /><div><strong>GitHub</strong><small>PR #1381 · referência operacional</small></div></div>
        </section>

        <section className="cd-status-card cd-status-card--list" aria-label="Braços integrados no painel único">
          <div className="cd-status-line"><span>Braços integrados</span><strong>OWNER MAP</strong></div>
          {integratedCapabilitySurfaces.map(({ key, label, icon, owner, detail }) => (
            <div key={key} className="cd-evidence">
              <span className={icon} />
              <div><strong>{label}</strong><small>{owner} · {detail}</small></div>
              <strong className="cd-warning">RUNTIME UNKNOWN</strong>
            </div>
          ))}
          <p className="cd-status-copy">O Cockpit apenas projeta owners já existentes. Contas/Hub, Telegram, Cloudflare e Contabo/VPS continuam braços do mesmo organismo; source mapeado não vira saúde runtime nem cria backend paralelo.</p>
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

        <section className="cd-status-card cd-status-card--list" aria-label="Teoria do sistema e dívida cognitiva">
          <div className="cd-status-line"><span>Teoria do sistema</span><strong className="cd-warning">NÃO MEDIDA</strong></div>
          {cognitiveTheoryChecks.map(([key, question]) => (
            <div key={key} className="cd-evidence">
              <span className="i-ph:brain" />
              <div><strong>{key}</strong><small>{question}</small></div>
              <strong className="cd-warning">UNKNOWN</strong>
            </div>
          ))}
          <p className="cd-status-copy">CI verde sozinho não fecha este gate. Cada item permanece UNKNOWN até receipt/runtime fornecer evidência reconstruível.</p>
        </section>

        <section className="cd-status-card cd-status-card--list" aria-label="Matriz multi-hipótese clássica">
          <div className="cd-status-line"><span>Estado multi-hipótese</span><strong>CLÁSSICO</strong></div>
          <div className="cd-evidence"><span className="i-ph:circles-four" /><div><strong>Dimensões binárias modeladas</strong><small>{hypothesisStateDimensions} checks cognitivos</small></div><strong>{hypothesisStateDimensions}</strong></div>
          <div className="cd-evidence"><span className="i-ph:tree-structure" /><div><strong>Espaço combinatório</strong><small>2^{hypothesisStateDimensions} configurações lógicas representáveis</small></div><strong>{hypothesisStateSpace}</strong></div>
          <div className="cd-evidence"><span className="i-ph:git-branch" /><div><strong>Hipóteses ativas simultâneas</strong><small>bridge ainda não mede largura de busca/beam</small></div><strong className="cd-warning">UNKNOWN</strong></div>
          <div className="cd-evidence"><span className="i-ph:waveform" /><div><strong>Qubit físico</strong><small>analogia não reivindica hardware/estado quântico</small></div><strong>NÃO</strong></div>
          <div className="cd-evidence"><span className="i-ph:arrows-left-right" /><div><strong>Comunicação superluminal</strong><small>emaranhamento não transmite mensagem útil acima da luz</small></div><strong>NÃO</strong></div>
          <p className="cd-status-copy">A CentralDark pode manter hipóteses incompatíveis como CANDIDATE/UNKNOWN ao mesmo tempo e resolver cada uma por evidência + contraprova + Reality Judge. Com os {hypothesisStateDimensions} checks atuais, o HUD representa {hypothesisStateSpace} combinações lógicas possíveis; isso não significa processar todas em paralelo nem obter speedup quântico.</p>
        </section>

        <section className="cd-status-card cd-status-card--list" aria-label="Confirmações sistemáticas da Casa">
          <div className="cd-status-line"><span>Confirmações sistemáticas</span><strong>REGRA</strong></div>
          {operationalInvariants.map(([rule, explanation]) => (
            <div key={rule} className="cd-evidence">
              <span className="i-ph:shield-check" />
              <div><strong>{rule}</strong><small>{explanation}</small></div>
              <strong>REGRA</strong>
            </div>
          ))}
          <p className="cd-status-copy">REGRA não é PASS. O HUD só mostra verde quando a evidência aplicável ao estado/HEAD correspondente existir.</p>
        </section>

        <section className="cd-status-card">
          <div className="cd-status-line"><span>Modo atual</span><strong>{mode}</strong></div>
          <p className="cd-status-copy">O seletor muda a forma de operar. Não muda autoridade, identidade nem transforma seleção em execução.</p>
        </section>

        <section className="cd-status-card">
          <div className="cd-status-line"><span>Ponto fixo</span><strong className="cd-warning">AINDA NÃO</strong></div>
          <p className="cd-status-copy">Ponto fixo = o escopo terminou com prova, sem pendência material e sem dívida cognitiva material aberta. Esta tela preserva UNKNOWN em vez de pintar verde cedo.</p>
        </section>
      </aside>
    </div>
  );
}