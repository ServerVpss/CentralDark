import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { hostname } from "node:os";
import { join } from "node:path";
import { open, stat } from "node:fs/promises";

type Kind = "tab_switch" | "focus" | "type" | "clear" | "round_trip" | "send" | "ack";
type Action = { at: string; kind: Kind; latency_ms: number; run_id: string; skill: string };
type Metric = { medianMs: number | null; p95Ms: number | null; count: number };
export type FocusTelemetry = {
  status: "OBSERVED" | "STALE" | "NO_EVENTS" | "NO_LOCAL_SOURCE" | "READ_ERROR";
  source: string; sampledAt: string; lastEventAt: string | null; windowHours: 24;
  actions: number | null; tabSwitches: Metric; roundTrips: Metric;
  focusActions: number | null; typeClearCycles: number | null;
  benchmarkRuns: number | null; ackEvents: number | null;
  physicalClicks: null; indirectNetworkConnections: null;
  skillUsage: { skill: string; benchmarkRuns: number }[];
  note: string;
};
const SOURCE = "Casa SEGREDO / MCP Desktop Commander / Windows UIAutomation";
function metric(values: number[]): Metric {
  if (!values.length) return { medianMs: null, p95Ms: null, count: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mid = (sorted.length - 1) / 2;
  const low = sorted[Math.floor(mid)] ?? 0;
  const high = sorted[Math.ceil(mid)] ?? low;
  const median = (low + high) / 2;
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0;
  return {
    medianMs: Math.round(median * 100) / 100,
    p95Ms: Math.round(p95 * 100) / 100,
    count: values.length,
  };
}
function blank(status: FocusTelemetry["status"], sampledAt: string): FocusTelemetry {
  return {
    status, sampledAt, source: SOURCE, lastEventAt: null, windowHours: 24,
    actions: null, tabSwitches: metric([]), roundTrips: metric([]),
    focusActions: null, typeClearCycles: null, benchmarkRuns: null,
    ackEvents: null, physicalClicks: null, indirectNetworkConnections: null,
    skillUsage: [],
    note: status === "NO_LOCAL_SOURCE"
      ? "Servidor fora da Casa: sem sincronização MCP autenticada desse sensor."
      : status === "READ_ERROR" ? "Falha na leitura local; nenhum valor inferido."
      : "Nenhum evento instrumentado nesta janela de 24 horas.",
  };
}
function parseAction(line: string, since: number, now: number): Action | null {
  try {
    const obj = JSON.parse(line.replace(/^\uFEFF/, "")) as Record<string, unknown>;
    if (obj["schema"] !== "centraldark.focus-telemetry.v2" || obj["verified"] !== true) return null;
    const at = typeof obj["at"] === "string" ? obj["at"] : "";
    const timestamp = Date.parse(at);
    if (!Number.isFinite(timestamp) || timestamp < since || timestamp > now + 5000) return null;
    const kinds: Kind[] = ["tab_switch", "focus", "type", "clear", "round_trip", "send", "ack"];
    if (typeof obj["kind"] !== "string" || !kinds.includes(obj["kind"] as Kind)) return null;
    const latency = obj["latency_ms"];
    if (typeof latency !== "number" || !Number.isFinite(latency) || latency < 0 || latency > 120000) return null;
    if (typeof obj["run_id"] !== "string" || !/^[0-9a-f]{32}$/.test(obj["run_id"])) return null;
    if (obj["skill"] !== "centraldark-operational-method") return null;
    return { at, kind: obj["kind"] as Kind, latency_ms: latency, run_id: obj["run_id"], skill: obj["skill"] };
  } catch { return null; }
}
async function aggregate(): Promise<FocusTelemetry> {
  const sampledAt = new Date().toISOString();
  if (process.platform !== "win32" || hostname().toUpperCase() !== "SEGREDO") {
    return blank("NO_LOCAL_SOURCE", sampledAt);
  }
  const appData = process.env["LOCALAPPDATA"];
  if (!appData) return blank("NO_LOCAL_SOURCE", sampledAt);
  const file = join(appData, "CentralDark", "telemetry", "focus-events.jsonl");
  const fileInfo = await stat(file).catch(() => null);
  if (!fileInfo?.isFile()) return blank("NO_EVENTS", sampledAt);
  try {
    const size = Math.min(fileInfo.size, 1024 * 1024);
    const start = fileInfo.size - size;
    const buffer = Buffer.alloc(size);
    const fd = await open(file, "r");
    try { await fd.read(buffer, 0, size, start); } finally { await fd.close(); }
    const lines = buffer.toString("utf8").split(/\r?\n/);
    if (start > 0) lines.shift();
    const now = Date.now();
    const since = now - 24 * 60 * 60 * 1000;
    const actions = lines.map((line) => parseAction(line, since, now)).filter((a): a is Action => a !== null);
    if (!actions.length) return blank("NO_EVENTS", sampledAt);
    const tabSwitches = actions.filter((a) => a.kind === "tab_switch");
    const roundTrips = actions.filter((a) => a.kind === "round_trip");
    const typeCounts = new Map<string, number>();
    const clearCounts = new Map<string, number>();
    for (const action of actions) {
      if (action.kind === "type") typeCounts.set(action.run_id, (typeCounts.get(action.run_id) ?? 0) + 1);
      if (action.kind === "clear") clearCounts.set(action.run_id, (clearCounts.get(action.run_id) ?? 0) + 1);
    }
    let cycles = 0;
    for (const [runId, count] of typeCounts) cycles += Math.min(count, clearCounts.get(runId) ?? 0);
    const runs = new Set(roundTrips.map((a) => a.run_id));
    const lastTime = Math.max(...actions.map((a) => Date.parse(a.at)));
    return {
      status: now - lastTime <= 5 * 60 * 1000 ? "OBSERVED" : "STALE",
      source: SOURCE, sampledAt, lastEventAt: new Date(lastTime).toISOString(), windowHours: 24,
      actions: actions.length,
      tabSwitches: metric(tabSwitches.map((a) => a.latency_ms)),
      roundTrips: metric(roundTrips.map((a) => a.latency_ms)),
      focusActions: actions.filter((a) => a.kind === "focus").length,
      typeClearCycles: cycles,
      benchmarkRuns: runs.size,
      ackEvents: actions.filter((a) => a.kind === "ack").length,
      physicalClicks: null, indirectNetworkConnections: null,
      skillUsage: runs.size ? [{ skill: "centraldark-operational-method", benchmarkRuns: runs.size }] : [],
      note: "Eventos instrumentados, não todos os cliques do SO. ACK na fonte não equivale a conexão de rede.",
    };
  } catch { return blank("READ_ERROR", sampledAt); }
}
export const lerTelemetriaFocoCentralDark = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FocusTelemetry> => {
    const { data: role, error } = await context.supabase.from("user_roles")
      .select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (error || !role) throw new Response("Proibido", { status: 403 });
    return aggregate();
  });
