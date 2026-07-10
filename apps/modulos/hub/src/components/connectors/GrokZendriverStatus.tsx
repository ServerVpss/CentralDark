import { useEffect, useState } from 'react';

interface GrokSession {
  provider: string;
  mode: string;
  connected: boolean;
  lastLoginAt: string | null;
  cookieExpiresAt: string | null;
  cookieName: string;
  runner: string;
  note?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function diasRestantes(iso: string | null): { label: string; tone: 'ok' | 'warn' | 'err' } | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  const dias = Math.floor(ms / 86400000);
  if (dias < 0) return { label: `expirado há ${Math.abs(dias)}d`, tone: 'err' };
  if (dias <= 3) return { label: `expira em ${dias}d`, tone: 'warn' };
  return { label: `expira em ${dias}d`, tone: 'ok' };
}

export function GrokZendriverStatus() {
  const [data, setData] = useState<GrokSession | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    const carregar = () => {
      fetch('/grok-session.json', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((json: GrokSession) => { if (vivo) { setData(json); setErro(null); } })
        .catch((e: Error) => { if (vivo) setErro(e.message); })
        .finally(() => { if (vivo) setCarregando(false); });
    };
    carregar();
    const id = setInterval(carregar, 60_000);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  const status = data?.connected ? 'connected' : 'disconnected';
  const dot = data?.connected ? 'bg-emerald-400' : 'bg-zinc-500';
  const exp = diasRestantes(data?.cookieExpiresAt ?? null);
  const toneClass =
    exp?.tone === 'err' ? 'text-red-400' :
    exp?.tone === 'warn' ? 'text-amber-400' :
    exp?.tone === 'ok' ? 'text-emerald-400' : 'text-muted-foreground';

  return (
    <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">𝕏</span>
          <h4 className="font-semibold text-emerald-100">Grok · Zendriver</h4>
        </div>
        <span className="flex items-center gap-2 text-xs text-emerald-200/80">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {status}
        </span>
      </div>

      {carregando && <p className="text-xs text-muted-foreground">Carregando status…</p>}
      {erro && <p className="text-xs text-red-400">Falha ao ler grok-session.json: {erro}</p>}

      {data && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <dt className="text-emerald-200/60">Modo</dt>
          <dd className="text-emerald-50">{data.mode}</dd>

          <dt className="text-emerald-200/60">Último login</dt>
          <dd className="text-emerald-50">{formatDate(data.lastLoginAt)}</dd>

          <dt className="text-emerald-200/60">Cookie</dt>
          <dd className="text-emerald-50 font-mono">{data.cookieName}</dd>

          <dt className="text-emerald-200/60">Expira em</dt>
          <dd className={toneClass}>
            {formatDate(data.cookieExpiresAt)}
            {exp && <span className="ml-1 opacity-80">({exp.label})</span>}
          </dd>

          <dt className="text-emerald-200/60">Runner</dt>
          <dd className="text-emerald-50">{data.runner}</dd>

          {data.note && (
            <>
              <dt className="text-emerald-200/60">Nota</dt>
              <dd className="text-amber-200/90">{data.note}</dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
