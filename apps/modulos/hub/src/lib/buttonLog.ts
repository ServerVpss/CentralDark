// Logger de botões do HUB — ring buffer local + persistência em Supabase HUB (TTL 30d).
import { hubClient } from "@/integrations/supabase/hub-client";

export type ButtonLogLevel = "info" | "ok" | "warn" | "error";

export interface ButtonLogEntry {
  id: string;
  ts: number;
  action: string;
  level: ButtonLogLevel;
  status?: number;
  latencyMs?: number;
  correlationId?: string;
  detail?: unknown;
  error?: string;
}

const KEY = "hub:buttonlog";
const MAX = 200;
const EVT = "hub:buttonlog:update";

function load(): ButtonLogEntry[] {
  try { const raw = sessionStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function save(entries: ButtonLogEntry[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(entries)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: entries }));
}

let buffer: ButtonLogEntry[] = typeof window !== "undefined" ? load() : [];

async function persistRemote(entry: ButtonLogEntry) {
  try {
    const { data: { session } } = await hubClient.auth.getSession();
    if (!session?.user) return;
    await hubClient.from("button_log_events").insert({
      client_id: entry.id,
      ts: new Date(entry.ts).toISOString(),
      action: entry.action,
      level: entry.level,
      status: entry.status ?? null,
      latency_ms: entry.latencyMs ?? null,
      correlation_id: entry.correlationId ?? null,
      error: entry.error ?? null,
      detail: entry.detail ?? null,
      user_id: session.user.id,
      user_email: session.user.email ?? null,
    });
  } catch { /* observabilidade nunca quebra UI */ }
}

function push(entry: ButtonLogEntry) {
  buffer = [entry, ...buffer].slice(0, MAX);
  save(buffer);
  const badge = entry.level === "error" ? "🔴" : entry.level === "warn" ? "🟡" : entry.level === "ok" ? "🟢" : "🪵";
  console.log(`[🪵 HUB] ${badge} ${entry.action}`, {
    status: entry.status, latencyMs: entry.latencyMs, correlationId: entry.correlationId, error: entry.error, detail: entry.detail,
  });
  void persistRemote(entry);
}

export function newCorrelationId(): string {
  return `cid_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function logButton(action: string, detail?: unknown, correlationId?: string) {
  push({ id: crypto.randomUUID(), ts: Date.now(), action, level: "info", detail, correlationId });
}

export function logWarn(action: string, error: string, detail?: unknown, correlationId?: string) {
  push({ id: crypto.randomUUID(), ts: Date.now(), action, level: "warn", error, detail, correlationId });
}

export interface TrackOptions { detail?: unknown; correlationId?: string; }

export async function trackAction<T>(action: string, fn: (correlationId: string) => Promise<T>, opts: TrackOptions = {}): Promise<T> {
  const correlationId = opts.correlationId ?? newCorrelationId();
  const t0 = performance.now();
  logButton(`${action}:start`, opts.detail, correlationId);
  try {
    const res = await fn(correlationId);
    const latencyMs = Math.round(performance.now() - t0);
    const status = res && typeof res === "object" && "status" in (res as any) && typeof (res as any).status === "number" ? (res as any).status as number : undefined;
    const ok = status === undefined ? true : status >= 200 && status < 400;
    push({ id: crypto.randomUUID(), ts: Date.now(), action: `${action}:done`, level: ok ? "ok" : "error", status, latencyMs, correlationId, detail: res });
    return res;
  } catch (e: any) {
    const latencyMs = Math.round(performance.now() - t0);
    push({ id: crypto.randomUUID(), ts: Date.now(), action: `${action}:fail`, level: "error", latencyMs, correlationId, error: e?.message ?? String(e), detail: opts.detail });
    throw e;
  }
}

export function getButtonLogs(): ButtonLogEntry[] { return [...buffer]; }
export function clearButtonLogs() { buffer = []; save(buffer); }
export const BUTTON_LOG_EVENT = EVT;
