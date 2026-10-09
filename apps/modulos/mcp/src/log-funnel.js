import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const LOG_ROOT = process.env.CENTRALDARK_LOG_ROOT || "/root/CentralDark/logs";
const EVENTS_DIR = path.join(LOG_ROOT, "events");
const SECTORS_DIR = path.join(LOG_ROOT, "sectors");
const SERVICES_DIR = path.join(LOG_ROOT, "services");
const SCHEMA = "centraldark.event.v1";

function safeSegment(value, fallback = "system") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(dir, 0o700); } catch {}
}

function appendSecure(file, line) {
  fs.appendFileSync(file, line, { encoding: "utf8", mode: 0o600, flag: "a" });
  try { fs.chmodSync(file, 0o600); } catch {}
}

function normalizeTags(tags) {
  const list = Array.isArray(tags) ? tags : [];
  return [...new Set(list.map((tag) => safeSegment(tag, "")).filter(Boolean))].slice(0, 32);
}

function badgeFor(level, kind) {
  if (kind === "agent_delegation") return "🔗";
  if (kind === "agent_tool_call" || kind === "mcp_tool_call") return "🛠️";
  if (kind === "scheduled_job") return "⏱️";
  if (String(level) === "error") return "🔴";
  if (String(level) === "warn") return "🟡";
  return "🟢";
}

export function getCentralLogLayout() {
  return {
    root: LOG_ROOT,
    unified: EVENTS_DIR,
    sectors: SECTORS_DIR,
    services: SERVICES_DIR,
    schema: SCHEMA,
  };
}

export function appendCentralEvent(input = {}) {
  try {
    const timestamp = input.timestamp || new Date().toISOString();
    const day = timestamp.slice(0, 10);
    const sector = safeSegment(input.sector);
    // A mesma evidência é pesquisável no stream global, por setor e por serviço.
    // Fonte explícita identifica o serviço; não criar outro logger ou servidor.
    const service = safeSegment(input.service || input.source || sector);
    const sectorDir = path.join(SECTORS_DIR, sector);
    const serviceDir = path.join(SERVICES_DIR, service);
    ensureDir(EVENTS_DIR);
    ensureDir(SECTORS_DIR);
    ensureDir(sectorDir);
    ensureDir(SERVICES_DIR);
    ensureDir(serviceDir);

    const event = {
      schema: SCHEMA,
      timestamp,
      event_id: input.event_id || randomUUID(),
      sector,
      service,
      source: String(input.source || "unknown").slice(0, 160),
      actor: input.actor == null ? null : String(input.actor).slice(0, 160),
      kind: String(input.kind || "event").slice(0, 120),
      level: String(input.level || "info").slice(0, 24),
      badge: input.badge == null
        ? badgeFor(input.level || "info", input.kind || "event")
        : String(input.badge).slice(0, 8),
      key: input.key == null ? null : String(input.key).slice(0, 240),
      tags: normalizeTags(input.tags),
      correlation_id: input.correlation_id == null ? null : String(input.correlation_id).slice(0, 160),
      run_id: input.run_id == null ? null : String(input.run_id).slice(0, 160),
      sha: input.sha == null ? null : String(input.sha).slice(0, 80),
      message: input.message == null ? null : String(input.message).slice(0, 2000),
      data: input.data && typeof input.data === "object" ? input.data : {},
    };

    const line = JSON.stringify(event) + "\n";
    const unifiedFile = path.join(EVENTS_DIR, `${day}.jsonl`);
    const sectorFile = path.join(sectorDir, `${day}.jsonl`);
    const serviceFile = path.join(serviceDir, `${day}.jsonl`);
    appendSecure(unifiedFile, line);
    appendSecure(sectorFile, line);
    appendSecure(serviceFile, line);

    return { ok: true, event_id: event.event_id, unifiedFile, sectorFile, serviceFile };
  } catch {
    return { ok: false };
  }
}
