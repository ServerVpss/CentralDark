import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { accountSurfaces, hubCapabilities, hubGaps, optionalAnalyticsPlugins, type HubCapability, type InventoryState } from './centraldark-hub-inventory';
import './centraldark-unified-hud.scss';

type LiveState = 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
type Tab = 'RESUMO' | 'CONTAS' | 'CAPACIDADES' | 'LACUNAS';

type RuntimeSnapshot = {
  app_name?: string;
  app_version?: string;
  house_root?: string;
  public_url?: string;
  one_system_only?: boolean;
  one_router_only?: boolean;
};

type HealthSnapshot = {
  status?: LiveState;
  endpoint?: string;
  route?: string;
  latency_ms?: number;
};

type GitHubSnapshot = {
  publicRepos?: number;
  privateRepos?: number;
  totalStars?: number;
  totalForks?: number;
  lastUpdated?: string;
  error?: string;
};

type CentralDarkBridge = {
  getRuntime?: () => Promise<RuntimeSnapshot>;
  getCentralHealth?: () => Promise<HealthSnapshot>;
  getHermesHealth?: () => Promise<HealthSnapshot>;
  getScreenpipeHealth?: () => Promise<HealthSnapshot>;
};

type HudEvent = {
  at: string;
  signature: string;
  message: string;
};

const LAYOUT_KEY = 'centraldark.unifiedHud.layout.v1';
const EVENTS_KEY = 'centraldark.unifiedHud.events.v1';
const MAX_EVENTS = 80;

function bridge(): CentralDarkBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { centraldark?: CentralDarkBridge }).centraldark;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function stateLabel(state: InventoryState) {
  switch (state) {
    case 'SOURCE_PROVED': return 'SOURCE';
    case 'RUNTIME_PROBE': return 'PROBE';
    case 'PARTIAL': return 'PARCIAL';
    case 'GAP': return 'GAP';
    case 'OPTIONAL_PLUGIN': return 'PLUGIN';
  }
}

function liveClass(state: LiveState | undefined) {
  return `cd-uhud-live cd-uhud-live--${(state ?? 'UNKNOWN').toLowerCase()}`;
}

function CapabilityRow({ item }: { item: HubCapability }) {
  return (
    <div className="cd-uhud-row">
      <div className="cd-uhud-row__main">
        <strong>{item.label}</strong>
        <small>{item.detail}</small>
        <code>{item.owner}</code>
      </div>
      <span className={`cd-uhud-tag cd-uhud-tag--${item.state.toLowerCase()}`}>{stateLabel(item.state)}</span>
    </div>
  );
}

export function CentralDarkUnifiedHud() {
  const rootRef = useRef<HTMLDivElement>(null);
  const previousSignature = useRef('');
  const dragRef = useRef<{ startX: number; startY: number; left: number; top: number } | null>(null);
  const [tab, setTab] = useState<Tab>('RESUMO');
  const [expanded, setExpanded] = useState(true);
  const [runtime, setRuntime] = useState<RuntimeSnapshot | null>(null);
  const [central, setCentral] = useState<HealthSnapshot>({ status: 'UNKNOWN' });
  const [screenpipe, setScreenpipe] = useState<HealthSnapshot>({ status: 'UNKNOWN' });
  const [github, setGithub] = useState<GitHubSnapshot | null>(null);
  const [events, setEvents] = useState<HudEvent[]>([]);
  const [changes, setChanges] = useState(0);
  const [position, setPosition] = useState({ left: 24, top: 92 });
  const [size, setSize] = useState({ width: 420, height: 520 });

  useEffect(() => {
    const layout = safeParse(localStorage.getItem(LAYOUT_KEY), { left: 24, top: 92, width: 420, height: 520 });
    const storedEvents = safeParse<HudEvent[]>(localStorage.getItem(EVENTS_KEY), []);
    setPosition({ left: layout.left, top: layout.top });
    setSize({ width: layout.width, height: layout.height });
    setEvents(storedEvents);
    setChanges(storedEvents.length);
    previousSignature.current = storedEvents[0]?.signature ?? '';
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (width < 320 || height < 180) return;
      setSize({ width, height });
      const current = safeParse(localStorage.getItem(LAYOUT_KEY), { left: position.left, top: position.top, width, height });
      localStorage.setItem(LAYOUT_KEY, JSON.stringify({ ...current, width, height }));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [position.left, position.top]);

  const persistPosition = useCallback((left: number, top: number) => {
    const safeLeft = Math.max(0, Math.min(left, Math.max(0, window.innerWidth - 120)));
    const safeTop = Math.max(0, Math.min(top, Math.max(0, window.innerHeight - 48)));
    setPosition({ left: safeLeft, top: safeTop });
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ left: safeLeft, top: safeTop, ...size }));
  }, [size]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      persistPosition(drag.left + event.clientX - drag.startX, drag.top + event.clientY - drag.startY);
    };
    const end = () => { dragRef.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
  }, [persistPosition]);

  const beginDrag = (event: ReactPointerEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    dragRef.current = { startX: event.clientX, startY: event.clientY, left: position.left, top: position.top };
  };

  const recordSnapshot = useCallback((message: string, signature: string) => {
    if (!signature || signature === previousSignature.current) return;
    previousSignature.current = signature;
    const entry: HudEvent = { at: new Date().toISOString(), signature, message };
    setEvents((current) => {
      const next = [entry, ...current].slice(0, MAX_EVENTS);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
      return next;
    });
    setChanges((value) => value + 1);
  }, []);

  const measure = useCallback(async () => {
    const api = bridge();
    let runtimeNext: RuntimeSnapshot | null = null;
    let centralNext: HealthSnapshot = { status: 'UNKNOWN' };
    let screenpipeNext: HealthSnapshot = { status: 'UNKNOWN' };
    let githubNext: GitHubSnapshot | null = null;

    if (api) {
      runtimeNext = await api.getRuntime?.().catch(() => null) ?? null;
      const centralProbe = api.getCentralHealth ?? api.getHermesHealth;
      centralNext = await centralProbe?.().catch(() => ({ status: 'UNKNOWN' as LiveState })) ?? { status: 'UNKNOWN' };
      screenpipeNext = await api.getScreenpipeHealth?.().catch(() => ({ status: 'UNKNOWN' as LiveState })) ?? { status: 'UNKNOWN' };
    }

    try {
      const response = await fetch('/api/github-stats', { credentials: 'same-origin' });
      githubNext = await response.json() as GitHubSnapshot;
      if (!response.ok) githubNext = { error: githubNext?.error ?? `HTTP ${response.status}` };
    } catch {
      githubNext = { error: 'UNAVAILABLE' };
    }

    setRuntime(runtimeNext);
    setCentral(centralNext);
    setScreenpipe(screenpipeNext);
    setGithub(githubNext);

    const signature = JSON.stringify({
      app: runtimeNext?.app_version ?? 'UNKNOWN',
      central: centralNext.status ?? 'UNKNOWN',
      screenpipe: screenpipeNext.status ?? 'UNKNOWN',
      github: githubNext?.error ? 'UNKNOWN' : `${githubNext?.publicRepos ?? 0}:${githubNext?.privateRepos ?? 0}`,
    });
    recordSnapshot('snapshot operacional mudou', signature);
  }, [recordSnapshot]);

  useEffect(() => {
    void measure();
    const timer = window.setInterval(() => void measure(), 10_000);
    return () => window.clearInterval(timer);
  }, [measure]);

  const observedSignals = useMemo(() => [
    runtime ? 'ONLINE' : 'UNKNOWN',
    central.status ?? 'UNKNOWN',
    screenpipe.status ?? 'UNKNOWN',
    github && !github.error ? 'ONLINE' : 'UNKNOWN',
  ], [runtime, central.status, screenpipe.status, github]);

  const passCount = observedSignals.filter((state) => state === 'ONLINE').length;
  const observablePct = Math.round((passCount / observedSignals.length) * 100);
  const totalRepos = (github?.publicRepos ?? 0) + (github?.privateRepos ?? 0);
  const adaptiveHeight = Math.min(780, Math.max(size.height, 460 + Math.min(events.length, 16) * 14));

  return (
    <section
      ref={rootRef}
      className={`cd-uhud ${expanded ? 'is-expanded' : 'is-collapsed'}`}
      style={{ left: position.left, top: position.top, width: size.width, height: expanded ? adaptiveHeight : 48 }}
      aria-label="CentralDark Hub HUD"
    >
      <header className="cd-uhud-head" onPointerDown={beginDrag}>
        <div>
          <span className="cd-uhud-kicker">CENTRALDARK · HUB HUD</span>
          <strong>Um lugar · todas as capacidades</strong>
        </div>
        <div className="cd-uhud-head__actions">
          <button type="button" onClick={() => void measure()} title="Remedir agora">↻</button>
          <button type="button" onClick={() => setExpanded((value) => !value)} title={expanded ? 'Recolher' : 'Expandir'}>{expanded ? '—' : '□'}</button>
        </div>
      </header>

      {expanded && (
        <>
          <div className="cd-uhud-stats">
            <div><span>Observável</span><strong>{observablePct}%</strong></div>
            <div><span>Mudanças</span><strong>{changes}</strong></div>
            <div><span>Eventos</span><strong>{events.length}</strong></div>
            <div><span>Repos</span><strong>{github?.error ? '?' : totalRepos}</strong></div>
          </div>

          <nav className="cd-uhud-tabs">
            {(['RESUMO', 'CONTAS', 'CAPACIDADES', 'LACUNAS'] as Tab[]).map((item) => (
              <button key={item} type="button" className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>
            ))}
          </nav>

          <div className="cd-uhud-body">
            {tab === 'RESUMO' && (
              <>
                <div className="cd-uhud-health-grid">
                  <div><span className={liveClass(runtime ? 'ONLINE' : 'UNKNOWN')} /><strong>CentralDark.exe</strong><small>{runtime?.app_version ?? 'UNKNOWN'}</small></div>
                  <div><span className={liveClass(central.status)} /><strong>Omni Router</strong><small>{central.status ?? 'UNKNOWN'}{central.latency_ms ? ` · ${central.latency_ms}ms` : ''}</small></div>
                  <div><span className={liveClass(screenpipe.status)} /><strong>Screenpipe</strong><small>{screenpipe.status ?? 'UNKNOWN'}{screenpipe.latency_ms ? ` · ${screenpipe.latency_ms}ms` : ''}</small></div>
                  <div><span className={liveClass(github && !github.error ? 'ONLINE' : 'UNKNOWN')} /><strong>GitHub stats</strong><small>{github?.error ? 'UNKNOWN' : `${totalRepos} repos`}</small></div>
                </div>
                <div className="cd-uhud-rule">SOURCE ≠ RUNTIME · UNKNOWN ≠ PASS · REALIDADE = JUIZ</div>
                <div className="cd-uhud-events">
                  <div className="cd-uhud-section-title"><span>Últimas mudanças observadas</span><strong>{events.length}/{MAX_EVENTS}</strong></div>
                  {events.length === 0 ? <p>Nenhuma mudança registrada neste navegador ainda.</p> : events.slice(0, 8).map((event) => (
                    <div key={`${event.at}-${event.signature}`} className="cd-uhud-event"><time>{new Date(event.at).toLocaleTimeString()}</time><span>{event.message}</span></div>
                  ))}
                </div>
              </>
            )}

            {tab === 'CONTAS' && (
              <div className="cd-uhud-list">
                {accountSurfaces.map((account) => (
                  <div key={account.id} className="cd-uhud-row">
                    <div className="cd-uhud-row__main"><strong>{account.label}</strong><small>{account.detail}</small><code>{account.accountModel}</code></div>
                    <span className={`cd-uhud-tag ${account.quota === 'ADAPTER_REQUIRED' ? 'cd-uhud-tag--gap' : 'cd-uhud-tag--source_proved'}`}>{account.quota}</span>
                  </div>
                ))}
                <p className="cd-uhud-note">Limites, plano, reset e tempo só ficam verdes quando houver adapter autorizado da própria conta/provedor. O HUD não raspa telas nem adivinha quota.</p>
              </div>
            )}

            {tab === 'CAPACIDADES' && <div className="cd-uhud-list">{hubCapabilities.map((item) => <CapabilityRow key={item.id} item={item} />)}</div>}

            {tab === 'LACUNAS' && (
              <div className="cd-uhud-list">
                {hubGaps.map((item) => <CapabilityRow key={item.id} item={item} />)}
                <div className="cd-uhud-section-title"><span>Plugins analíticos opcionais</span><strong>não-core</strong></div>
                {optionalAnalyticsPlugins.map((item) => <CapabilityRow key={item.id} item={item} />)}
              </div>
            )}
          </div>

          <footer className="cd-uhud-foot">
            <span>{runtime?.house_root ?? 'Casa não medida'}</span>
            <span>arraste pelo topo · redimensione pelo canto</span>
          </footer>
        </>
      )}
    </section>
  );
}
