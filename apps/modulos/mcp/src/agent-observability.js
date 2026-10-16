import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { appendCentralEvent, getCentralLogLayout } from "./log-funnel.js";
import { sanitizeForLog } from "./audit-logger.js";

const layout = getCentralLogLayout();
const OBS_DIR = path.join(layout.root, "agent-patterns");
const CURSOR_FILE = path.join(OBS_DIR, "cursors.json");
const GROK_ROOT = process.env.CENTRALDARK_GROK_SESSIONS || "/root/.grok/sessions/%2Froot%2FCentralDark";
const GROK_UNIFIED = process.env.CENTRALDARK_GROK_UNIFIED || "/root/.grok/logs/unified.jsonl";
const HERMES_USAGE = process.env.CENTRALDARK_HERMES_USAGE || "/root/.hermes/cron/usage_audit.jsonl";
const HERMES_GATEWAY = process.env.CENTRALDARK_HERMES_GATEWAY || "/root/.hermes/logs/gateway.log";
const PM2_ROOT = process.env.CENTRALDARK_PM2_LOG_ROOT || "/root/.pm2/logs";
const INGEST_INTERVAL_MS = Number(process.env.CENTRALDARK_AGENT_INGEST_INTERVAL_MS || 60_000);
const MAX_TOTAL_BYTES = Number(process.env.CENTRALDARK_AGENT_INGEST_MAX_BYTES || 768 * 1024);
const MAX_SOURCE_BYTES = 256 * 1024;
const INITIAL_TAIL_BYTES = 16 * 1024;
const MAX_QUERY_BYTES_PER_DAY = 16 * 1024 * 1024;

let ingesting = false;
let lastScheduledAt = 0;
let lastStatus = {
  status: "NEVER_RUN",
  at: null,
  sources: 0,
  lines: 0,
  events: 0,
  bytes: 0,
  errors: [],
};

function ensureObsDir() {
  fs.mkdirSync(OBS_DIR, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(OBS_DIR, 0o700); } catch {}
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJsonSecure(file, value) {
  ensureObsDir();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
  fs.renameSync(tmp, file);
  try { fs.chmodSync(file, 0o600); } catch {}
}

function hashText(value) {
  return createHash("sha256").update(String(value || "")).digest("hex").slice(0, 16);
}

function safeStat(file) {
  try {
    const stat = fs.statSync(file);
    return stat.isFile() ? stat : null;
  } catch {
    return null;
  }
}

function listLatestFiles(dir, predicate, limit) {
  try {
    return fs.readdirSync(dir)
      .map((name) => path.join(dir, name))
      .filter((file) => predicate(file) && safeStat(file))
      .map((file) => ({ file, mtimeMs: safeStat(file)?.mtimeMs || 0 }))
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, limit)
      .map((item) => item.file);
  } catch {
    return [];
  }
}

function discoverSources() {
  const sources = [];

  if (safeStat(HERMES_USAGE)) {
    sources.push({ type: "hermes_usage", path: HERMES_USAGE, actor: "hermes", initialTailBytes: 64 * 1024 });
  }
  if (safeStat(HERMES_GATEWAY)) {
    sources.push({ type: "hermes_gateway", path: HERMES_GATEWAY, actor: "hermes", initialTailBytes: 32 * 1024 });
  }

  try {
    const sessionDirs = fs.readdirSync(GROK_ROOT);
    const grokUpdates = sessionDirs
      .map((name) => path.join(GROK_ROOT, name, "updates.jsonl"))
      .filter((file) => safeStat(file))
      .map((file) => ({ file, mtimeMs: safeStat(file)?.mtimeMs || 0 }))
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, 16);
    for (const item of grokUpdates) {
      sources.push({ type: "grok_updates", path: item.file, actor: "grok", initialTailBytes: 128 * 1024 });
    }
    const grokEvents = sessionDirs
      .map((name) => path.join(GROK_ROOT, name, "events.jsonl"))
      .filter((file) => safeStat(file))
      .map((file) => ({ file, mtimeMs: safeStat(file)?.mtimeMs || 0 }))
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, 16);
    for (const item of grokEvents) {
      sources.push({ type: "grok_events", path: item.file, actor: "grok", initialTailBytes: 192 * 1024 });
    }
  } catch {}

  if (safeStat(GROK_UNIFIED)) {
    sources.push({ type: "grok_unified", path: GROK_UNIFIED, actor: "grok", initialTailBytes: 192 * 1024 });
  }

  for (const file of listLatestFiles(
    PM2_ROOT,
    (file) => /\/(?:CentralDark|MCP-CentralDark|hermes-).+\.log$/i.test(file),
    96,
  )) {
    const name = path.basename(file);
    sources.push({
      type: "pm2_log",
      path: file,
      actor: name.replace(/-(?:error|err|out)(?:-\d+)?\.log$/i, ""),
      stream: /-(?:error|err)(?:-\d+)?\.log$/i.test(name) ? "error" : "out",
      initialTailBytes: 8 * 1024,
    });
  }

  return sources;
}

function readIncrement(file, previousOffset, byteBudget, initialTailBytes = INITIAL_TAIL_BYTES) {
  const stat = safeStat(file);
  if (!stat || byteBudget <= 0) return { lines: [], nextOffset: previousOffset || 0, bytes: 0 };

  const initialWindow = Math.max(1024, Number(initialTailBytes) || INITIAL_TAIL_BYTES);
  let start;
  if (Number.isFinite(previousOffset) && Number(previousOffset) <= stat.size) {
    start = Math.max(0, Number(previousOffset));
  } else {
    // Arquivo novo ou truncado/rotacionado: não herdar offset impossível.
    start = Math.max(0, stat.size - initialWindow);
  }

  const length = Math.min(MAX_SOURCE_BYTES, byteBudget, stat.size - start);
  if (length <= 0) return { lines: [], nextOffset: stat.size, bytes: 0 };

  const fd = fs.openSync(file, "r");
  const buffer = Buffer.alloc(length);
  let read = 0;
  try {
    read = fs.readSync(fd, buffer, 0, length, start);
  } finally {
    fs.closeSync(fd);
  }

  let chunk = buffer.subarray(0, read).toString("utf8");
  let consumedPrefixBytes = 0;
  if (start > 0 && previousOffset == null) {
    const firstNl = chunk.indexOf("\n");
    if (firstNl >= 0) {
      consumedPrefixBytes = Buffer.byteLength(chunk.slice(0, firstNl + 1));
      chunk = chunk.slice(firstNl + 1);
    }
  }

  const atEof = start + read >= stat.size;
  if (!atEof) {
    const lastNl = chunk.lastIndexOf("\n");
    if (lastNl < 0) {
      return { lines: [], nextOffset: start, bytes: read };
    }
    const complete = chunk.slice(0, lastNl + 1);
    const usedBytes = consumedPrefixBytes + Buffer.byteLength(complete);
    return {
      lines: complete.split("\n").filter(Boolean),
      nextOffset: start + usedBytes,
      bytes: read,
    };
  }

  return {
    lines: chunk.split("\n").filter(Boolean),
    nextOffset: stat.size,
    bytes: read,
  };
}

function commandFamily(command) {
  const text = String(command || "");
  const m = text.match(/(?:^|[\s;&|])(hermes|gh|git|curl|pm2|docker|node|python3?|systemctl|npm|npx|bash)\b/i);
  return m ? m[1].toLowerCase() : null;
}

function hermesAction(command) {
  const text = String(command || "");
  const m = text.match(/(?:^|[\s;&|])hermes\s+(cron|chat|fallback|status|auth|model|gateway|kanban)\b/i);
  return m ? m[1].toLowerCase() : null;
}

function normalizeGrok(line, source) {
  let record;
  try { record = JSON.parse(line); } catch { return []; }
  const update = record?.params?.update || {};
  const type = update.sessionUpdate;
  const sessionId = record?.params?.sessionId || null;
  const toolMeta = update?._meta?.["x.ai/tool"] || {};
  const rawTs = Number(record?.timestamp);
  const eventTimestamp = Number.isFinite(rawTs)
    ? new Date(rawTs < 1e12 ? rawTs * 1000 : rawTs).toISOString()
    : undefined;
  const out = [];

  if (type === "subagent_spawned") {
    out.push({
      timestamp: eventTimestamp,
      sector: "agents",
      source: "grok-cli",
      actor: "grok",
      kind: "subagent_spawned",
      key: `grok-subagent:${update.subagent_type || "unknown"}`,
      tags: ["agent", "grok", "subagent", update.model || "model-unknown"],
      correlation_id: sessionId,
      data: sanitizeForLog({
        source_file: source.path,
        parent_session_id: update.parent_session_id || sessionId,
        child_session_id: update.child_session_id || null,
        subagent_type: update.subagent_type || null,
        model: update.model || null,
        description: String(update.description || "").slice(0, 240),
        description_hash: hashText(update.description),
      }),
    });
  }

  if (type === "subagent_finished") {
    out.push({
      timestamp: eventTimestamp,
      sector: "agents",
      source: "grok-cli",
      actor: "grok",
      kind: "subagent_finished",
      key: `grok-subagent:${update.subagent_type || "unknown"}`,
      tags: ["agent", "grok", "subagent", "terminal"],
      correlation_id: sessionId,
      data: sanitizeForLog({
        source_file: source.path,
        child_session_id: update.child_session_id || null,
        subagent_type: update.subagent_type || null,
        status: update.status || null,
        tool_calls: update.tool_calls ?? null,
        turns: update.turns ?? null,
        duration_ms: update.duration_ms ?? null,
        tokens_used: update.tokens_used ?? null,
        will_wake: update.will_wake ?? null,
      }),
    });
  }

  if (type === "tool_call") {
    const raw = update.rawInput || {};
    const command = typeof raw.command === "string" ? raw.command : "";
    const toolName = toolMeta.name || update.title || "unknown";
    const action = hermesAction(command);
    const family = commandFamily(command);
    out.push({
      timestamp: eventTimestamp,
      sector: "agents",
      source: "grok-cli",
      actor: "grok",
      kind: "agent_tool_call",
      key: `grok-tool:${toolName}`,
      tags: ["agent", "grok", "tool-call", family || "no-command"],
      correlation_id: sessionId,
      data: sanitizeForLog({
        source_file: source.path,
        tool: toolName,
        namespace: toolMeta.namespace || null,
        read_only: toolMeta.read_only ?? null,
        command_family: family,
        target_file: raw.target_file ? String(raw.target_file).slice(0, 240) : null,
        description: raw.description ? String(raw.description).slice(0, 240) : null,
      }),
    });

    if (action) {
      out.push({
        timestamp: eventTimestamp,
        sector: "agents",
        source: "grok-cli",
        actor: "grok",
        kind: "agent_delegation",
        key: `delegation:grok:hermes:${action}`,
        tags: ["agent", "grok", "hermes", "delegation", action],
        correlation_id: sessionId,
        data: {
          from: "grok",
          to: "hermes",
          mode: "hermes-cli",
          action,
          command_family: "hermes",
          source_file: source.path,
        },
      });
    }
  }

  return out;
}

function grokEventTimestamp(record) {
  const value = record?.ts ?? record?.timestamp;
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value < 1e12 ? value * 1000 : value).toISOString();
  }
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

function normalizeGrokEvent(line, source) {
  let row;
  try { row = JSON.parse(line); } catch { return []; }
  if (!row || typeof row !== "object") return [];
  const type = String(row.type || "");
  const timestamp = grokEventTimestamp(row);
  const base = {
    timestamp,
    sector: "agents",
    source: "grok-cli-events",
    actor: "grok",
    correlation_id: row.session_id || null,
  };

  if (type === "tool_started" || type === "tool_completed") {
    const tool = String(row.tool_name || "unknown").slice(0, 120);
    return [{
      ...base,
      kind: type === "tool_started" ? "grok_tool_started" : "grok_tool_completed",
      level: row.outcome === "error" ? "error" : "info",
      key: `grok-tool-runtime:${tool}`,
      tags: ["agent", "grok", "tool", type],
      data: sanitizeForLog({
        source_file: source.path,
        tool,
        outcome: row.outcome || null,
        duration_ms: row.duration_ms ?? null,
        loop_index: row.loop_index ?? null,
      }),
    }];
  }

  if (type === "turn_started" || type === "turn_ended") {
    return [{
      ...base,
      kind: type === "turn_started" ? "grok_turn_started" : "grok_turn_ended",
      key: `grok-turn:${type}`,
      tags: ["agent", "grok", "turn", row.model_id || "model-unknown"],
      data: sanitizeForLog({
        source_file: source.path,
        model: row.model_id || null,
        turn_number: row.turn_number ?? null,
        yolo_mode: row.yolo_mode ?? null,
        session_relationship: row.session_relationship || null,
        outcome: row.outcome || null,
      }),
    }];
  }

  if (type === "loop_started") {
    return [{
      ...base,
      kind: "grok_loop_started",
      key: "grok-loop",
      tags: ["agent", "grok", "loop"],
      data: sanitizeForLog({ source_file: source.path, loop_index: row.loop_index ?? null }),
    }];
  }

  if (type === "permission_resolved") {
    return [{
      ...base,
      kind: "grok_permission_resolved",
      key: "grok-permission",
      tags: ["agent", "grok", "permission", row.decision || "unknown"],
      data: sanitizeForLog({ source_file: source.path, decision: row.decision || null, wait_ms: row.wait_ms ?? null }),
    }];
  }

  if (type === "phase_changed" && ["waiting_for_model", "tool_execution", "permission_prompt"].includes(row.phase)) {
    return [{
      ...base,
      kind: "grok_phase",
      key: `grok-phase:${row.phase}`,
      tags: ["agent", "grok", "phase", row.phase],
      data: sanitizeForLog({ source_file: source.path, phase: row.phase, loop_index: row.loop_index ?? null }),
    }];
  }

  if (type === "yolo_toggled") {
    return [{
      ...base,
      kind: "grok_yolo_toggled",
      key: "grok-yolo",
      tags: ["agent", "grok", "permission-mode"],
      data: sanitizeForLog({ source_file: source.path, enabled: row.enabled ?? null }),
    }];
  }

  if (type === "mcp_server_failed") {
    return [{
      ...base,
      sector: "mcp",
      kind: "grok_mcp_server_failed",
      level: "error",
      key: `grok-mcp:${row.server_name || "unknown"}`,
      tags: ["grok", "mcp", "failure", row.error_type || "unknown"],
      data: sanitizeForLog({
        source_file: source.path,
        server_name: row.server_name || null,
        error_type: row.error_type || null,
        transport: row.transport || null,
        duration_ms: row.duration_ms ?? null,
      }),
    }];
  }

  return [];
}

const GROK_UNIFIED_MESSAGES = new Set([
  "subagent spawn credentials",
  "subagent completed",
  "subagent failed",
  "subagent model resolved",
  "subagent read parent config (live)",
  "shell.turn.inference_retry",
  "shell.turn.inference_failed",
  "shell.task_wake.gate_cleared",
  "shell.task_wake.actor_admission",
  "shell.task_wake.bridge_admission",
  "shell.prompt.queued",
  "model changed",
  "agent initialized",
]);

function normalizeGrokUnified(line, source) {
  let row;
  try { row = JSON.parse(line); } catch { return []; }
  const message = String(row?.msg || "");
  if (!GROK_UNIFIED_MESSAGES.has(message)) return [];
  const ctx = row?.ctx && typeof row.ctx === "object" ? row.ctx : {};
  const timestamp = grokEventTimestamp(row);
  const ref = hashText(ctx.subagent_id || ctx.task_id || message);
  const common = {
    timestamp,
    sector: "agents",
    source: "grok-cli-unified",
    actor: "grok",
    correlation_id: row?.sid || null,
  };

  if (message.startsWith("subagent ")) {
    const terminal = message === "subagent completed" || message === "subagent failed";
    const failed = message === "subagent failed" || ctx.success === false;
    return [{
      ...common,
      kind: message === "subagent spawn credentials"
        ? "grok_subagent_spawn"
        : terminal
          ? (failed ? "grok_subagent_failed" : "grok_subagent_completed")
          : "grok_subagent_state",
      level: failed ? "error" : "info",
      key: `grok-subagent-runtime:${ref}`,
      tags: ["agent", "grok", "subagent", ctx.subagent_type || ctx.agent || "unknown", ctx.effective_model || ctx.child_model || "model-unknown"],
      data: sanitizeForLog({
        source_file: source.path,
        subagent_ref: ref,
        subagent_type: ctx.subagent_type || ctx.agent || null,
        model: ctx.effective_model || ctx.child_model || null,
        parent_model: ctx.parent_model || null,
        success: ctx.success ?? null,
        cancelled: ctx.cancelled ?? null,
        duration_ms: ctx.duration_ms ?? null,
        turns: ctx.turns ?? null,
        tool_calls: ctx.tool_calls ?? null,
        context_window: ctx.context_window ?? null,
        model_has_own_creds: ctx.model_has_own_creds ?? null,
      }),
    }];
  }

  if (message === "shell.turn.inference_retry" || message === "shell.turn.inference_failed") {
    const failed = message.endsWith("failed");
    return [{
      ...common,
      kind: failed ? "grok_inference_failed" : "grok_inference_retry",
      level: failed ? "error" : "warn",
      key: failed ? "grok-inference-failed" : "grok-inference-retry",
      tags: ["agent", "grok", "inference", failed ? "failure" : "retry"],
      data: sanitizeForLog({
        source_file: source.path,
        attempt: ctx.attempt ?? null,
        max_retries: ctx.max_retries ?? null,
        status_code: ctx.status_code ?? null,
        is_retryable: ctx.is_retryable ?? null,
        kind: ctx.kind || null,
        reason: ctx.reason || null,
      }),
    }];
  }

  return [{
    ...common,
    kind: "grok_runtime_signal",
    key: `grok-runtime:${message}`,
    tags: ["agent", "grok", "runtime-signal"],
    data: sanitizeForLog({
      source_file: source.path,
      signal: message,
      mode: ctx.mode || null,
      reason: ctx.reason || null,
      gate: ctx.gate ?? null,
      admitted: ctx.admitted ?? null,
      enqueued: ctx.enqueued ?? null,
      model: ctx.model || null,
    }),
  }];
}

function normalizeHermesUsage(line, source) {
  let row;
  try { row = JSON.parse(line); } catch { return []; }
  if (!row || !row.job_id) return [];
  const hasError = Boolean(row.error);
  const parsedTs = Date.parse(String(row.ts || ""));
  return [{
    timestamp: Number.isFinite(parsedTs) ? new Date(parsedTs).toISOString() : undefined,
    sector: "agents",
    source: "hermes-cron",
    actor: "hermes",
    kind: "scheduled_job",
    level: hasError ? "error" : "info",
    key: `hermes-job:${row.job_id}`,
    tags: ["agent", "hermes", "cron", row.model || "model-unknown", hasError ? "error" : "ok"],
    run_id: row.fire_id || null,
    data: sanitizeForLog({
      source_file: source.path,
      job_id: row.job_id,
      fire_id: row.fire_id || null,
      model: row.model || null,
      prompt_units: row.prompt_tokens ?? null,
      completion_units: row.completion_tokens ?? null,
      total_units: row.total_tokens ?? null,
      duration_ms: row.duration_ms ?? null,
      response_silent: row.response_silent ?? null,
      deliver_target: row.deliver_target || null,
      error: row.error || null,
    }),
  }];
}

function normalizeHermesGateway(line, source) {
  const match = String(line).match(/^(\S+\s+\S+)\s+(DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+([^:]+):\s*(.*)$/);
  if (!match) return [];
  const [, timestamp, levelRaw, component, message] = match;
  const level = levelRaw === "WARNING" ? "warn" : levelRaw.toLowerCase();
  const parsedTs = Date.parse(timestamp.replace(",", "."));
  return [{
    timestamp: Number.isFinite(parsedTs) ? new Date(parsedTs).toISOString() : undefined,
    sector: "hermes",
    source: "hermes-gateway",
    actor: "hermes",
    kind: "gateway_log",
    level,
    key: `hermes-gateway:${component}`,
    tags: ["hermes", "gateway", level],
    message: sanitizeForLog(String(message).slice(0, 1600)),
    data: sanitizeForLog({ source_file: source.path, component }),
  }];
}

function sectorFromService(name) {
  const low = String(name || "").toLowerCase();
  if (low.includes("hermes")) return "hermes";
  if (low.includes("mcp")) return "mcp";
  if (low.includes("guardiao")) return "guardiao";
  if (low.includes("deploy")) return "deploy";
  if (low.includes("hub")) return "hub";
  if (low.includes("oauth")) return "auth";
  if (low.includes("telegram") || low.includes("telepainel")) return "telegram";
  if (low.includes("grafo") || low.includes("graph")) return "graph";
  return "services";
}

function normalizePm2(line, source) {
  const text = String(line).trim();
  if (!text) return [];
  const level = source.stream === "error" ? "error" : /\b(error|fatal|exception|failed?)\b/i.test(text) ? "warn" : "info";
  const sector = sectorFromService(source.actor);
  return [{
    sector,
    source: "pm2",
    actor: source.actor,
    kind: source.stream === "error" ? "service_error" : "service_log",
    level,
    key: `pm2:${source.actor}:${source.stream}`,
    tags: ["pm2", sector, source.stream, level],
    message: sanitizeForLog(text.slice(0, 1800)),
    data: sanitizeForLog({ source_file: source.path, stream: source.stream }),
  }];
}

function normalizeLine(line, source) {
  if (source.type === "grok_updates") return normalizeGrok(line, source);
  if (source.type === "grok_events") return normalizeGrokEvent(line, source);
  if (source.type === "grok_unified") return normalizeGrokUnified(line, source);
  if (source.type === "hermes_usage") return normalizeHermesUsage(line, source);
  if (source.type === "hermes_gateway") return normalizeHermesGateway(line, source);
  if (source.type === "pm2_log") return normalizePm2(line, source);
  return [];
}

export async function ingestAgentLogs({ force = false } = {}) {
  if (ingesting) return { ...lastStatus, status: "ALREADY_RUNNING" };
  const now = Date.now();
  if (!force && lastStatus.at && now - Date.parse(lastStatus.at) < INGEST_INTERVAL_MS) {
    return { ...lastStatus, status: "RATE_LIMITED" };
  }

  ingesting = true;
  const cursors = readJson(CURSOR_FILE, {});
  const sources = discoverSources();
  let remaining = MAX_TOTAL_BYTES;
  let lines = 0;
  let events = 0;
  let bytes = 0;
  const errors = [];

  try {
    for (const source of sources) {
      if (remaining <= 0) break;
      const previous = Number.isFinite(cursors[source.path]) ? cursors[source.path] : null;
      let batch;
      try {
        batch = readIncrement(source.path, previous, remaining, source.initialTailBytes);
      } catch (error) {
        errors.push({ source: source.path, error: String(error).slice(0, 240) });
        continue;
      }

      let sourceOk = true;
      for (const line of batch.lines) {
        lines++;
        let normalized;
        try {
          normalized = normalizeLine(line, source);
        } catch (error) {
          errors.push({ source: source.path, error: String(error).slice(0, 240) });
          continue;
        }
        for (const event of normalized) {
          const result = appendCentralEvent(event);
          if (result.ok) events++;
          else sourceOk = false;
        }
      }

      if (sourceOk) cursors[source.path] = batch.nextOffset;
      bytes += batch.bytes;
      remaining -= batch.bytes;
    }

    writeJsonSecure(CURSOR_FILE, cursors);
    lastStatus = {
      status: errors.length ? "PARTIAL" : "OK",
      at: new Date().toISOString(),
      sources: sources.length,
      lines,
      events,
      bytes,
      errors: errors.slice(0, 20),
    };
    return { ...lastStatus };
  } finally {
    ingesting = false;
  }
}

export function scheduleAgentLogIngest() {
  const now = Date.now();
  if (ingesting || now - lastScheduledAt < INGEST_INTERVAL_MS) return false;
  lastScheduledAt = now;
  setImmediate(() => {
    ingestAgentLogs({ force: false }).catch((error) => {
      lastStatus = {
        ...lastStatus,
        status: "ERROR",
        at: new Date().toISOString(),
        errors: [{ source: "scheduler", error: String(error).slice(0, 240) }],
      };
    });
  });
  return true;
}

function dateKeysSince(sinceMinutes) {
  const now = Date.now();
  const cutoff = now - sinceMinutes * 60_000;
  const days = new Set();
  for (let t = cutoff; t <= now + 86_400_000; t += 86_400_000) {
    days.add(new Date(t).toISOString().slice(0, 10));
  }
  days.add(new Date(now).toISOString().slice(0, 10));
  return [...days].sort();
}

function readTail(file, maxBytes) {
  const stat = safeStat(file);
  if (!stat) return "";
  const start = Math.max(0, stat.size - maxBytes);
  const fd = fs.openSync(file, "r");
  const buffer = Buffer.alloc(stat.size - start);
  let read = 0;
  try { read = fs.readSync(fd, buffer, 0, buffer.length, start); } finally { fs.closeSync(fd); }
  let text = buffer.subarray(0, read).toString("utf8");
  if (start > 0) {
    const nl = text.indexOf("\n");
    if (nl >= 0) text = text.slice(nl + 1);
  }
  return text;
}

export function queryCentralLogs({
  since_minutes = 60,
  limit = 200,
  sector,
  tag,
  key,
  actor,
  kind,
} = {}) {
  const cutoff = Date.now() - Number(since_minutes) * 60_000;
  const rows = [];
  const normalizedSector = sector
    ? String(sector).trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "")
    : null;
  const selectedDir = normalizedSector ? path.join(layout.sectors, normalizedSector) : layout.unified;
  for (const day of dateKeysSince(Number(since_minutes))) {
    const file = path.join(selectedDir, `${day}.jsonl`);
    const text = readTail(file, MAX_QUERY_BYTES_PER_DAY);
    for (const line of text.split("\n")) {
      if (!line) continue;
      let row;
      try { row = JSON.parse(line); } catch { continue; }
      const ts = Date.parse(row.timestamp || "");
      if (!Number.isFinite(ts) || ts < cutoff) continue;
      if (normalizedSector && row.sector !== normalizedSector) continue;
      if (actor && row.actor !== actor) continue;
      if (kind && row.kind !== kind) continue;
      if (key && row.key !== key) continue;
      if (tag && !(Array.isArray(row.tags) && row.tags.includes(tag))) continue;
      rows.push(row);
    }
  }
  rows.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  return rows.slice(-Math.max(1, Math.min(Number(limit) || 200, 2000)));
}

function countBy(rows, selector) {
  const map = new Map();
  for (const row of rows) {
    const value = selector(row);
    if (!value) continue;
    map.set(value, (map.get(value) || 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function extractAgentPatterns({ agent = "all", since_minutes = 1440, limit = 1200 } = {}) {
  const ingest = await ingestAgentLogs({ force: true });
  const perLimit = Math.min(Number(limit) || 1200, 2000);
  const agentRows = queryCentralLogs({ since_minutes, limit: perLimit, sector: "agents" });
  const mcpRows = (agent === "all" || agent === "mcp")
    ? queryCentralLogs({ since_minutes, limit: perLimit, sector: "mcp", kind: "mcp_tool_call" })
    : [];
  const relevant = agent === "mcp"
    ? mcpRows
    : agent === "all"
      ? [...agentRows, ...mcpRows]
      : agentRows.filter((row) => row.actor === agent);

  const grokRuntimeTools = relevant.filter((row) => row.kind === "grok_tool_started");
  const legacyToolRows = relevant.filter((row) => row.kind === "agent_tool_call" || row.kind === "mcp_tool_call");
  const toolRows = grokRuntimeTools.length ? [...grokRuntimeTools, ...legacyToolRows.filter((row) => row.actor !== "grok")] : legacyToolRows;
  const grokRuntimeSubagents = relevant.filter((row) => row.kind === "grok_subagent_spawn");
  const legacySubagents = relevant.filter((row) => row.kind === "subagent_spawned");
  const subagentRows = grokRuntimeSubagents.length ? [...grokRuntimeSubagents, ...legacySubagents.filter((row) => row.actor !== "grok")] : legacySubagents;
  const delegationRows = relevant.filter((row) => row.kind === "agent_delegation");
  const scheduledRows = relevant.filter((row) => row.kind === "scheduled_job");
  const errorRows = relevant.filter((row) => row.level === "error" || /error|fail/i.test(row.kind || ""));

  const patterns = [];
  const grokHermes = delegationRows.filter((row) => row.actor === "grok" && row.data?.to === "hermes");
  if (grokHermes.length) {
    patterns.push({
      id: "GROK_DELEGATES_VIA_HERMES",
      status: "PROVEN",
      evidence_count: grokHermes.length,
      detail: "Grok executou comandos Hermes CLI (cron/chat/status/etc.), usando Hermes como scheduler/executor persistente.",
    });
  }

  const grokSubagents = subagentRows.filter((row) => row.actor === "grok");
  if (grokSubagents.length) {
    patterns.push({
      id: "GROK_OWNS_SUBAGENTS",
      status: "PROVEN",
      evidence_count: grokSubagents.length,
      detail: "Grok também cria subagentes próprios; isso é distinto de delegação para Hermes.",
    });
  }

  const grokPhaseRows = relevant.filter((row) => row.kind === "grok_phase");
  const grokLoopRows = relevant.filter((row) => row.kind === "grok_loop_started");
  const grokTurnRows = relevant.filter((row) => row.kind === "grok_turn_started");
  const grokRetryRows = relevant.filter((row) => row.kind === "grok_inference_retry");
  const grokInferenceFailures = relevant.filter((row) => row.kind === "grok_inference_failed");
  const grokPermissionRows = relevant.filter((row) => row.kind === "grok_permission_resolved");
  const grokBackgroundTools = grokRuntimeTools.filter((row) =>
    ["monitor", "scheduler_create", "scheduler_list", "get_command_or_subagent_output", "kill_command_or_subagent"].includes(row.data?.tool)
  );

  if (grokPhaseRows.length && grokLoopRows.length) {
    patterns.push({
      id: "GROK_RUNTIME_STATE_MACHINE",
      status: "PROVEN",
      evidence_count: grokPhaseRows.length + grokLoopRows.length,
      detail: "O runtime Grok expõe loops e fases observáveis (modelo, permissão e execução de tools), permitindo monitoramento por estado sem ler prompt bruto.",
    });
  }

  if (grokBackgroundTools.length) {
    patterns.push({
      id: "GROK_BACKGROUND_ORCHESTRATION",
      status: "PROVEN",
      evidence_count: grokBackgroundTools.length,
      detail: "O Grok usa monitor, scheduler e handles de background/subagentes como capacidades separadas e observáveis.",
    });
  }

  if (grokRetryRows.length || grokInferenceFailures.length) {
    patterns.push({
      id: "GROK_INFERENCE_RECOVERY_LOOP",
      status: "PROVEN",
      evidence_count: grokRetryRows.length + grokInferenceFailures.length,
      detail: "Retries e falhas de inferência são eventos estruturais mensuráveis; retry não é tratado como sucesso.",
    });
  }

  const hermesWithGrok = scheduledRows.filter((row) => row.actor === "hermes" && row.data?.model === "grok-4.6");
  if (hermesWithGrok.length) {
    patterns.push({
      id: "HERMES_EXECUTES_GROK_MODEL",
      status: "PROVEN",
      evidence_count: hermesWithGrok.length,
      detail: "Jobs persistentes do Hermes executaram o modelo grok-4.6.",
    });
  }

  const recurringJobs = countBy(scheduledRows, (row) => row.data?.job_id).filter((item) => item.count > 1);
  if (recurringJobs.length) {
    patterns.push({
      id: "HERMES_RECURRING_JOB_LOOP",
      status: "PROVEN",
      evidence_count: recurringJobs.reduce((sum, item) => sum + item.count, 0),
      detail: "O Hermes mantém jobs recorrentes identificáveis por job_id; repetição é mensurável no usage audit.",
    });
  }

  const tokensByModel = new Map();
  for (const row of scheduledRows) {
    const model = row.data?.model || "unknown";
    const total = Number(row.data?.total_units || 0);
    tokensByModel.set(model, (tokensByModel.get(model) || 0) + total);
  }

  const edges = countBy(delegationRows, (row) => {
    const from = row.data?.from || row.actor || "unknown";
    const to = row.data?.to || "unknown";
    const mode = row.data?.mode || "unknown";
    return `${from}->${to}:${mode}`;
  });

  return {
    status: "OK",
    window_minutes: Number(since_minutes),
    ingest,
    evidence_events: relevant.length,
    agents: countBy(relevant, (row) => row.actor),
    mcp_clients: countBy(mcpRows, (row) => row.data?.clientLabel || row.actor),
    mcp_callers: countBy(mcpRows, (row) => row.data?.callerUser),
    tools: countBy(toolRows, (row) => row.data?.tool || row.key),
    subagents: countBy(subagentRows, (row) => `${row.data?.subagent_type || "unknown"}:${row.data?.model || "unknown"}`),
    scheduled_jobs: countBy(scheduledRows, (row) => row.data?.job_id),
    models: countBy(scheduledRows, (row) => row.data?.model),
    token_volume_by_model: [...tokensByModel.entries()]
      .map(([model, total_units]) => ({ model, total_units }))
      .sort((a, b) => b.total_units - a.total_units),
    delegation_edges: edges,
    grok_runtime: {
      turns_started: grokTurnRows.length,
      loops_started: grokLoopRows.length,
      phases: countBy(grokPhaseRows, (row) => row.data?.phase),
      permissions: countBy(grokPermissionRows, (row) => row.data?.decision),
      background_tools: countBy(grokBackgroundTools, (row) => row.data?.tool),
      inference_retries: grokRetryRows.length,
      inference_failures: grokInferenceFailures.length,
      runtime_subagents_spawned: grokRuntimeSubagents.length,
      runtime_subagents_completed: relevant.filter((row) => row.kind === "grok_subagent_completed").length,
      runtime_subagents_failed: relevant.filter((row) => row.kind === "grok_subagent_failed").length,
    },
    errors: {
      count: errorRows.length,
      by_source: countBy(errorRows, (row) => row.source),
    },
    patterns,
    rules: {
      UNKNOWN_IS_NOT_PASS: true,
      RAW_PROMPTS_IN_GLOBAL_LOG: false,
      SECRETS_REDACTED: true,
      ONE_LOG_ROOT: layout.root,
    },
  };
}

export function getAgentObservabilityStatus() {
  const cursors = readJson(CURSOR_FILE, {});
  return {
    layout,
    cursor_file: CURSOR_FILE,
    tracked_sources: Object.keys(cursors).length,
    ingest_interval_ms: INGEST_INTERVAL_MS,
    max_bytes_per_cycle: MAX_TOTAL_BYTES,
    last_ingest: lastStatus,
    source_policy: {
      grok_sessions: GROK_ROOT,
      grok_unified: GROK_UNIFIED,
      hermes_usage: HERMES_USAGE,
      hermes_gateway: HERMES_GATEWAY,
      pm2: PM2_ROOT,
    },
    coverage: {
      mcp_tool_calls: "DIRECT_DUAL_WRITE",
      grok_cli_updates: "NORMALIZED_FROM_SESSION_UPDATES",
      grok_cli_events: "STRUCTURAL_ONLY_FROM_EVENTS_JSONL",
      grok_cli_unified: "STRUCTURAL_ALLOWLIST_ONLY_NO_PROMPTS",
      hermes_cron: "NORMALIZED_FROM_USAGE_AUDIT",
      hermes_gateway: "NORMALIZED_FROM_GATEWAY_LOG",
      pm2_services: "NORMALIZED_INCREMENTALLY",
      github_actions_full_job_logs: "PARTIAL_EXTERNAL_NOT_MIRRORED",
      remote_house_pc: "ONLY_WHEN_BRIDGE_ONLINE",
    },
  };
}


/**
 * Read-only weekly projection of the existing CentralDark event funnel.
 * Does not collect, persist, or export raw prompts, credentials or payloads.
 * It is explicitly a bounded sample, not a claim about every harness execution.
 */
export function summarizeHarnessWeekRows(rows, { now = Date.now(), capped = false } = {}) {
  const since = now - 7 * 24 * 60 * 60 * 1000;
  const unique = new Map();
  for (const row of rows) {
    if (!["mcp_tool_call", "agent_tool_call", "grok_tool_started"].includes(row?.kind)) continue;
    const ms = Date.parse(String(row.timestamp || ""));
    if (!Number.isFinite(ms) || ms < since || ms > now) continue;
    const payload = row.data && typeof row.data === "object" ? row.data : {};
    const callId = typeof payload.call_id === "string" && payload.call_id ? payload.call_id : null;
    const key = callId ? row.source + ":" + callId : (row.event_id || row.source + ":" + row.timestamp + ":" + row.key);
    if (unique.has(key)) continue;
    const outcome = payload.ok === true || ["PASS", "SUCCESS", "COMPLETED"].includes(String(payload.status || "").toUpperCase())
      ? "pass"
      : payload.ok === false || ["FAIL", "FAILED", "ERROR", "BLOCKED"].includes(String(payload.status || "").toUpperCase())
        ? "fail" : "unknown";
    const duration = Number(payload.durationMs ?? payload.duration_ms);
    const toolName = String(payload.toolName ?? payload.tool_name ?? (row.key?.startsWith("tool:") ? row.key.slice(5) : "unknown")).slice(0, 96);
    const source = row.kind === "mcp_tool_call" ? "MCP" : (row.actor || "agents").slice(0, 60);
    unique.set(key, { outcome, duration: Number.isFinite(duration) && duration >= 0 ? duration : null,
      toolName, source, day: new Date(ms).toISOString().slice(0, 10) });
  }
  const items = [...unique.values()];
  const pass = items.filter(x => x.outcome === "pass").length;
  const fail = items.filter(x => x.outcome === "fail").length;
  const unknown = items.length - pass - fail;
  const decided = pass + fail;
  const pct = n => decided ? Math.round(n / decided * 1000) / 10 : null;
  const counts = new Map();
  const sourceCounts = new Map();
  for (const item of items) {
    const current = counts.get(item.toolName) || { name: item.toolName, calls: 0, pass: 0, fail: 0, unknown: 0 };
    current.calls++;
    current[item.outcome]++;
    counts.set(item.toolName, current);
    const s = sourceCounts.get(item.source) || { name: item.source, calls: 0, pass: 0, fail: 0, unknown: 0 };
    s.calls++; s[item.outcome]++; sourceCounts.set(item.source, s);
  }
  const durations = items.map(x => x.duration).filter(x => x !== null);
  const daily = Array.from({length: 7}, (_, offset) => {
    const day = new Date(now - (6-offset)*86400000).toISOString().slice(0,10);
    const selected = items.filter(x => x.day === day);
    return { day, calls: selected.length, pass: selected.filter(x=>x.outcome==="pass").length,
      fail: selected.filter(x=>x.outcome==="fail").length,
      unknown: selected.filter(x=>x.outcome==="unknown").length };
  });
  return {
    schema: "centraldark.harness.weekly.v1", window: "rolling_7_days", timezone: "UTC",
    observedAt: new Date(now).toISOString(), since: new Date(since).toISOString(),
    coverage: capped ? "PARTIAL_CAPPED" : "PARTIAL_INSTRUMENTED", capped: Boolean(capped),
    totalObserved: items.length, pass, fail, unknown,
    successPctOfDecided: pct(pass), failurePctOfDecided: pct(fail),
    unknownPctOfObserved: items.length ? Math.round(unknown / items.length * 1000) / 10 : null,
    avgDurationMs: durations.length ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : null,
    durationSamples: durations.length, daily,
    bySource: [...sourceCounts.values()].sort((a,b)=>b.calls-a.calls || a.name.localeCompare(b.name)),
    topTools: [...counts.values()].sort((a,b)=>b.calls-a.calls || a.name.localeCompare(b.name)).slice(0, 12),
    note: "Somente eventos instrumentados MCP/agentes no funil existente; chamadas diretas de ferramentas ChatGPT/Browser/VS Code não são inferidas. Histórico pode estar truncado.",
  };
}

export function getHarnessWeeklySummary() {
  const limit = 2000;
  const mcp = queryCentralLogs({ since_minutes: 10080, limit, sector: "mcp", kind: "mcp_tool_call" });
  const agentEvents = queryCentralLogs({ since_minutes: 10080, limit, sector: "agents" })
    .filter(x => ["agent_tool_call","grok_tool_started"].includes(x.kind));
  return summarizeHarnessWeekRows([...mcp, ...agentEvents], { capped: mcp.length >= limit || agentEvents.length >= limit });
}

