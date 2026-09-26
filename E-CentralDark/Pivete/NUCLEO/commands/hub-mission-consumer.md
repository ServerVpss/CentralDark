# COMANDO - hub-mission-consumer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\hub-mission-consumer.js
**SHA:** 0ff6658d08a53759
**Timestamp:** 2026-08-28T02:54:26.000879
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- p_risk: candidate.risk,

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { config } from "./config.js";
import { log } from "./log.js";
import { sanitizeOutgoingText } from "./lib/sanitize.js";
import { extractWorkCandidates } from "./lib/work-candidate.js";
import { mcpAdminTools } from "./tools/core/mcp-admin.js";
const CAPABILITY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SHA_RE = /^[0-9a-f]{40}$/i;
const DEFAULT_POLL_MS = 5_000;
const MIN_POLL_MS = 1_000;
const MAX_POLL_MS = 60_000;
const DEFAULT_STALE_MS = 30 * 60_000;
const MIN_STALE_MS = 5 * 60_000;
const MAX_STALE_MS = 24 * 60 * 60_000;
const STALE_SWEEP_INTERVAL_MS = 60_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
const MIN_REQUEST_TIMEOUT_MS = 1_000;
const MAX_REQUEST_TIMEOUT_MS = 60_000;
const WORKER_ID = String(process.env.HUB_MISSION_WORKER_ID || `centraldark-mcp-${process.pid}`).slice(0, 120);
let timer = null;
let tickRunning = false;
let lastStaleSweepAtMs = 0;
const state = {
    enabled: false,
    status: "not_started",
    reason: null,
    workerId: WORKER_ID,
    lastPollAt: null,
    lastMissionId: null,
    lastExecutionStatus: null,
    lastStaleSweepAt: null,
    staleFailedCount: 0,
    staleUnprovenCount: 0,
    lastError: null,
};
function safeError(err) {
    return sanitizeOutgoingText(String(err?.message || err || "unknown_error")).slice(0, 500);
}
function pollMs() {
    const raw = Number(process.env.HUB_MISSION_POLL_MS || DEFAULT_POLL_MS);
    if (!Number.isFinite(raw))
        return DEFAULT_POLL_MS;
    return Math.max(MIN_POLL_MS, Math.min(MAX_POLL_MS, Math.trunc(raw)));
}
function staleMs() {
    const raw = Number(process.env.HUB_MISSION_STALE_MS || DEFAULT_STALE_MS);
    if (!Number.isFinite(raw))
        return DEFAULT_STALE_MS;
    return Math.max(MIN_STALE_MS, Math.min(MAX_STALE_MS, Math.trunc(raw)));
}
function requestTimeoutMs() {
    const raw = Number(process.env.HUB_MISSION_REQUEST_TIMEOUT_MS || DEFAULT_REQUEST_TIMEOUT_MS);
    if (!Number.isFinite(raw))
        return DEFAULT_REQUEST_TIMEOUT_MS;
    return Math.max(MIN_REQUEST_TIMEOUT_MS, Math.min(MAX_REQUEST_TIMEOUT_MS, Math.trunc(raw)));
}
function restConfig() {
    const projectRef = String(process.env.SUPABASE_PROJECT_REF || "").trim();
    const explicitUrl = String(process.env.HUB_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    const restUrl = String(explicitUrl || (projectRef ? `https://${projectRef}.supabase.co` : "")).replace(/\/$/, "");
    const serviceRoleKey = String(process.env.HUB_SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        "").trim();
    return { restUrl, serviceRoleKey, projectRef };
}
async function rest(path, { method = "GET", body, prefer } = {}) {
    const { restUrl, serviceRoleKey } = restConfig();
    if (!restUrl)
        throw new Error("HUB_MISSION_SUPABASE_URL_MISSING");
    if (!serviceRoleKey)
        throw new Error("HUB_MISSION_SERVICE_ROLE_KEY_MISSING");
    const headers = {
        Accept: "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
    };
    if (body !== undefined)
        headers["Content-Type"] = "application/json";
    if (prefer)
        headers.Prefer = prefer;
    const response = await fetch(`${restUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(requestTimeoutMs()),
    });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`HUB_POSTGREST_${response.status}:${text.slice(0, 300)}`);
    }
    if (!text)
        return null;
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
function runtimeHead() {
    try {
        const head = execFileSync("git", ["rev-parse", "HEAD"], {
            cwd: config.vps.repoPath,
            encoding: "utf8",
            timeout: 5_000,
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        return SHA_RE.test(head) ? head.toLowerCase() : null;
    }
    catch {
        return null;
    }
}
function revisionVerdict(requestedSha, measuredSha) {
    const requested = String(requestedSha || "").trim().toLowerCase();
    const measured = String(measuredSha || "").trim().toLowerCase();
    if (!SHA_RE.test(requested))
        return { ok: false, status: "REVISION_REQUIRED_OR_INVALID" };
    if (!SHA_RE.test(measured))
        return { ok: false, status: "RUNTIME_REVISION_UNPROVEN" };
    if (requested !== measured)
        return { ok: false, status: "REVISION_MISMATCH" };
    return { ok: true, status: "REVISION_MATCH" };
}
async function claimNextMission() {
    const rows = await rest("/rest/v1/rpc/claim_next_hub_mission", {
        method: "POST",
        prefer: "return=representation",
        body: { p_worker_id: WORKER_ID },
    });
    return Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
}
as
```

---

# COMANDO - hub-mission-consumer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\hub-mission-consumer.js
**SHA:** 29a63215a85fa4a5
**Timestamp:** 2026-08-28T02:54:43.934246
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- p_risk: candidate.risk,

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { config } from "./config.js";
import { log } from "./log.js";
import { sanitizeOutgoingText } from "./lib/sanitize.js";
import { extractWorkCandidates } from "./lib/work-candidate.js";
import { mcpAdminTools } from "./tools/core/mcp-admin.js";

const CAPABILITY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SHA_RE = /^[0-9a-f]{40}$/i;
const DEFAULT_POLL_MS = 5_000;
const MIN_POLL_MS = 1_000;
const MAX_POLL_MS = 60_000;
const DEFAULT_STALE_MS = 30 * 60_000;
const MIN_STALE_MS = 5 * 60_000;
const MAX_STALE_MS = 24 * 60 * 60_000;
const STALE_SWEEP_INTERVAL_MS = 60_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
const MIN_REQUEST_TIMEOUT_MS = 1_000;
const MAX_REQUEST_TIMEOUT_MS = 60_000;
const WORKER_ID = String(process.env.HUB_MISSION_WORKER_ID || `centraldark-mcp-${process.pid}`).slice(0, 120);

let timer = null;
let tickRunning = false;
let lastStaleSweepAtMs = 0;
const state = {
  enabled: false,
  status: "not_started",
  reason: null,
  workerId: WORKER_ID,
  lastPollAt: null,
  lastMissionId: null,
  lastExecutionStatus: null,
  lastStaleSweepAt: null,
  staleFailedCount: 0,
  staleUnprovenCount: 0,
  lastError: null,
};

function safeError(err) {
  return sanitizeOutgoingText(String(err?.message || err || "unknown_error")).slice(0, 500);
}

function pollMs() {
  const raw = Number(process.env.HUB_MISSION_POLL_MS || DEFAULT_POLL_MS);
  if (!Number.isFinite(raw)) return DEFAULT_POLL_MS;
  return Math.max(MIN_POLL_MS, Math.min(MAX_POLL_MS, Math.trunc(raw)));
}

function staleMs() {
  const raw = Number(process.env.HUB_MISSION_STALE_MS || DEFAULT_STALE_MS);
  if (!Number.isFinite(raw)) return DEFAULT_STALE_MS;
  return Math.max(MIN_STALE_MS, Math.min(MAX_STALE_MS, Math.trunc(raw)));
}

function requestTimeoutMs() {
  const raw = Number(process.env.HUB_MISSION_REQUEST_TIMEOUT_MS || DEFAULT_REQUEST_TIMEOUT_MS);
  if (!Number.isFinite(raw)) return DEFAULT_REQUEST_TIMEOUT_MS;
  return Math.max(MIN_REQUEST_TIMEOUT_MS, Math.min(MAX_REQUEST_TIMEOUT_MS, Math.trunc(raw)));
}

function restConfig() {
  const projectRef = String(process.env.SUPABASE_PROJECT_REF || "").trim();
  const explicitUrl = String(process.env.HUB_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const restUrl = String(explicitUrl || (projectRef ? `https://${projectRef}.supabase.co` : "")).replace(/\/$/, "");
  const serviceRoleKey = String(
    process.env.HUB_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();
  return { restUrl, serviceRoleKey, projectRef };
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const { restUrl, serviceRoleKey } = restConfig();
  if (!restUrl) throw new Error("HUB_MISSION_SUPABASE_URL_MISSING");
  if (!serviceRoleKey) throw new Error("HUB_MISSION_SERVICE_ROLE_KEY_MISSING");
  const headers = {
    Accept: "application/json",
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${restUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(requestTimeoutMs()),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HUB_POSTGREST_${response.status}:${text.slice(0, 300)}`);
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function runtimeHead() {
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: config.vps.repoPath,
      encoding: "utf8",
      timeout: 5_000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return SHA_RE.test(head) ? head.toLowerCase() : null;
  } catch {
    return null;
  }
}

function revisionVerdict(requestedSha, measuredSha) {
  const requested = String(requestedSha || "").trim().toLowerCase();
  const measured = String(measuredSha || "").trim().toLowerCase();
  if (!SHA_RE.test(requested)) return { ok: false, status: "REVISION_REQUIRED_OR_INVALID" };
  if (!SHA_RE.test(measured)) return { ok: false, status: "RUNTIME_REVISION_UNPROVEN" };
  if (requested !== measured) return { ok: false, status: "REVISION_MISMATCH" };
  return { ok: true, status: "REVISION_MATCH" };
}

async function claimNextMission() {
  const rows = await rest("/rest/v1/rpc/claim_next_hub_mission", {
    method: "POST",
    prefer: "return=representation",
    body: { p_worker_id: WORKER_ID },
  });
  return Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
}

async function releaseClaimBeforeDispatch(missionId, reason) {
  const now = new Date().toISOString();
  const rows = await rest(
    `/rest/v1/hub_missions?id=eq.${encodeURIComponent(missionId)}&state=eq.running&claimed_by=eq.${encodeURIComponent(WORKER_ID)}`,
    {
      method: "PATCH",
      pref
```