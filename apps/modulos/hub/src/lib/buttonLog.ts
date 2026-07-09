// Logger de botões do HUB — registra QUALQUER clique/ação com contexto.
// Ring buffer em memória + sessionStorage + evento custom pro drawer viewer.
// Console sempre recebe uma linha marcada [🪵 HUB] pra ficar fácil de filtrar.

export type ButtonLogLevel = 'info' | 'ok' | 'warn' | 'error';

export interface ButtonLogEntry {
  id: string;
  ts: number;              // epoch ms
  action: string;          // ex.: 'abacus.sync-models'
  level: ButtonLogLevel;
  status?: number;         // HTTP status quando aplicável
  latencyMs?: number;
  detail?: unknown;        // payload / resposta resumida
  error?: string;
}

const KEY = 'hub:buttonlog';
const MAX = 200;
const EVT = 'hub:buttonlog:update';

function load(): ButtonLogEntry[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ButtonLogEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: ButtonLogEntry[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVT, { detail: entries }));
}

let buffer: ButtonLogEntry[] = typeof window !== 'undefined' ? load() : [];

function push(entry: ButtonLogEntry) {
  buffer = [entry, ...buffer].slice(0, MAX);
  save(buffer);
  const badge = entry.level === 'error' ? '🔴' : entry.level === 'warn' ? '🟡' : entry.level === 'ok' ? '🟢' : '🪵';
  // eslint-disable-next-line no-console
  console.log(
    `[🪵 HUB] ${badge} ${entry.action}`,
    {
      status: entry.status,
      latencyMs: entry.latencyMs,
      error: entry.error,
      detail: entry.detail,
    },
  );
}

export function logButton(action: string, detail?: unknown) {
  push({
    id: crypto.randomUUID(),
    ts: Date.now(),
    action,
    level: 'info',
    detail,
  });
}

/**
 * Envolve uma ação assíncrona e registra início, fim, latência e erro.
 * Se o resultado tiver `status` numérico (ex.: fetch/JSON `{status}`),
 * ele é capturado automaticamente.
 */
export async function trackAction<T>(action: string, fn: () => Promise<T>, detail?: unknown): Promise<T> {
  const t0 = performance.now();
  logButton(`${action}:start`, detail);
  try {
    const res = await fn();
    const latencyMs = Math.round(performance.now() - t0);
    const status = (res && typeof res === 'object' && 'status' in (res as any) && typeof (res as any).status === 'number')
      ? (res as any).status as number
      : undefined;
    const ok = status === undefined ? true : status >= 200 && status < 400;
    push({
      id: crypto.randomUUID(),
      ts: Date.now(),
      action: `${action}:done`,
      level: ok ? 'ok' : 'error',
      status,
      latencyMs,
      detail: res,
    });
    return res;
  } catch (e: any) {
    const latencyMs = Math.round(performance.now() - t0);
    push({
      id: crypto.randomUUID(),
      ts: Date.now(),
      action: `${action}:fail`,
      level: 'error',
      latencyMs,
      error: e?.message ?? String(e),
      detail,
    });
    throw e;
  }
}

export function getButtonLogs(): ButtonLogEntry[] {
  return [...buffer];
}

export function clearButtonLogs() {
  buffer = [];
  save(buffer);
}

export const BUTTON_LOG_EVENT = EVT;
