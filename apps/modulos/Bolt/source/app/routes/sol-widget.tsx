import type { MetaFunction } from '@remix-run/cloudflare';
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

type Locale = 'pt-BR' | 'en' | 'es' | 'fr';
type HermesHealth = { status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN'; endpoint?: string; latency_ms?: number };
type RuntimeInfo = { hermes_base_url: string; house_root: string; public_url: string; widget_shortcut: string };
type CentralDarkBridge = {
  getRuntime(): Promise<RuntimeInfo>;
  getHermesHealth(): Promise<HermesHealth>;
  openIntent(intent: string): Promise<{ ok: boolean }>;
  showMain(): Promise<{ ok: boolean }>;
  hideWidget(): Promise<{ ok: boolean }>;
};

const copy = {
  'pt-BR': { title: 'SOL', subtitle: 'uma Casa · muitos braços', placeholder: 'Qual é a intenção, CHEFE?', send: 'Executar', open: 'Abrir CentralDark', online: 'Hermes acordado', offline: 'Hermes esperando o motor local', unknown: 'Medindo Hermes', speak: 'Ouvir SOL', hide: 'Esconder' },
  en: { title: 'SOL', subtitle: 'one House · many arms', placeholder: 'What is the intent, CHIEF?', send: 'Execute', open: 'Open CentralDark', online: 'Hermes is awake', offline: 'Hermes awaits the local engine', unknown: 'Measuring Hermes', speak: 'Hear SOL', hide: 'Hide' },
  es: { title: 'SOL', subtitle: 'una Casa · muchos brazos', placeholder: '¿Cuál es la intención, JEFE?', send: 'Ejecutar', open: 'Abrir CentralDark', online: 'Hermes está despierto', offline: 'Hermes espera el motor local', unknown: 'Midiendo Hermes', speak: 'Escuchar a SOL', hide: 'Ocultar' },
  fr: { title: 'SOL', subtitle: 'une Maison · plusieurs bras', placeholder: "Quelle est l'intention, CHEF ?", send: 'Exécuter', open: 'Ouvrir CentralDark', online: 'Hermes est éveillé', offline: 'Hermes attend le moteur local', unknown: 'Mesure de Hermes', speak: 'Écouter SOL', hide: 'Masquer' },
} as const;

export const meta: MetaFunction = () => [
  { title: 'SOL — CentralDark' },
  { name: 'description', content: 'Janela flutuante da SOL conectada ao mesmo organismo CentralDark.' },
];

function bridge() {
  return (window as Window & { centraldark?: CentralDarkBridge }).centraldark;
}

const noDrag = { WebkitAppRegion: 'no-drag' } as CSSProperties;

export default function SolWidget() {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const [health, setHealth] = useState<HermesHealth>({ status: 'UNKNOWN' });
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [intent, setIntent] = useState('');
  const [sending, setSending] = useState(false);
  const text = copy[locale];
  const statusText = useMemo(() => text[health.status.toLowerCase() as 'online' | 'offline' | 'unknown'], [health.status, text]);

  useEffect(() => {
    const api = bridge();
    if (!api) return;
    api.getRuntime().then(setRuntime).catch(() => setRuntime(null));
    const measure = () => api.getHermesHealth().then(setHealth).catch(() => setHealth({ status: 'UNKNOWN' }));
    measure();
    const timer = window.setInterval(measure, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = intent.trim();
    if (!clean || sending) return;
    setSending(true);
    try {
      await bridge()?.openIntent(clean);
      setIntent('');
    } finally {
      setSending(false);
    }
  }

  function speak() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${statusText}. ${text.subtitle}.`);
    utterance.lang = locale;
    window.speechSynthesis.speak(utterance);
  }

  const statusColor = health.status === 'ONLINE' ? '#4ade80' : health.status === 'OFFLINE' ? '#fbbf24' : '#94a3b8';

  return (
    <main style={{ minHeight: '100vh', padding: 10, color: '#ecfdf5', fontFamily: 'Geist, Inter, system-ui, sans-serif', background: 'transparent' }}>
      <section style={{ minHeight: 'calc(100vh - 20px)', borderRadius: 26, overflow: 'hidden', border: '1px solid rgba(52,211,153,.28)', background: 'radial-gradient(circle at 15% 0%, rgba(16,185,129,.24), transparent 36%), linear-gradient(145deg, rgba(3,16,12,.97), rgba(4,25,18,.95))', boxShadow: '0 24px 80px rgba(0,0,0,.52), inset 0 1px rgba(255,255,255,.05)' }}>
        <header style={{ WebkitAppRegion: 'drag', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' } as CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 14, display: 'grid', placeItems: 'center', fontWeight: 900, color: '#022c22', background: 'linear-gradient(135deg,#fbbf24,#34d399)' }}>S</div>
            <div><strong style={{ display: 'block', letterSpacing: '.18em' }}>{text.title}</strong><small style={{ color: '#86efac' }}>{text.subtitle}</small></div>
          </div>
          <button aria-label={text.hide} onClick={() => bridge()?.hideWidget()} style={{ ...noDrag, border: 0, width: 34, height: 34, borderRadius: 12, color: '#d1fae5', background: 'rgba(255,255,255,.06)', cursor: 'pointer' }}>×</button>
        </header>

        <div style={{ padding: '8px 18px 18px' }}>
          <div style={{ padding: 14, borderRadius: 18, background: 'rgba(6,78,59,.24)', border: '1px solid rgba(52,211,153,.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13 }}><span style={{ width: 9, height: 9, borderRadius: 999, background: statusColor, boxShadow: `0 0 18px ${statusColor}` }} />{statusText}</div>
            <div style={{ marginTop: 7, color: '#6ee7b7', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}>{runtime?.hermes_base_url ?? 'http://127.0.0.1:8787'}{health.latency_ms ? ` · ${health.latency_ms}ms` : ''}</div>
          </div>

          <form onSubmit={submit} style={{ marginTop: 16 }}>
            <textarea value={intent} onChange={(event) => setIntent(event.target.value)} placeholder={text.placeholder} maxLength={8000} rows={6} style={{ ...noDrag, boxSizing: 'border-box', width: '100%', resize: 'none', padding: 15, borderRadius: 18, border: '1px solid rgba(110,231,183,.22)', outline: 'none', color: '#ecfdf5', background: 'rgba(0,0,0,.24)', font: 'inherit', lineHeight: 1.45 }} />
            <button disabled={!intent.trim() || sending} style={{ ...noDrag, width: '100%', marginTop: 10, padding: '12px 14px', border: 0, borderRadius: 15, fontWeight: 800, color: '#022c22', background: 'linear-gradient(135deg,#fbbf24,#34d399)', cursor: 'pointer', opacity: !intent.trim() || sending ? .5 : 1 }}>{sending ? '…' : text.send}</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 12 }}>
            <button onClick={() => bridge()?.showMain()} style={{ ...noDrag, padding: 10, borderRadius: 13, border: '1px solid rgba(52,211,153,.18)', color: '#d1fae5', background: 'rgba(255,255,255,.05)', cursor: 'pointer' }}>{text.open}</button>
            <button onClick={speak} style={{ ...noDrag, padding: 10, borderRadius: 13, border: '1px solid rgba(52,211,153,.18)', color: '#d1fae5', background: 'rgba(255,255,255,.05)', cursor: 'pointer' }}>{text.speak}</button>
          </div>

          <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, color: '#6ee7b7', fontSize: 11 }}>
            <span>{runtime?.widget_shortcut ?? 'Ctrl+Shift+Space'}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} style={{ ...noDrag, border: 0, outline: 0, color: '#a7f3d0', background: '#0b2a20', borderRadius: 9, padding: '5px 8px' }}><option value="pt-BR">PT-BR</option><option value="en">EN</option><option value="es">ES</option><option value="fr">FR</option></select>
          </footer>
        </div>
      </section>
    </main>
  );
}
