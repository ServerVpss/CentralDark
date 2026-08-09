import { createHash } from "node:crypto";
import { log } from "./log.js";
import { mcpAdminTools } from "./tools/core/mcp-admin.js";

const CAPABILITY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const DEFAULT_PROJECT_REF = "lyoigsqluyktoclwdaft";
const DEFAULT_POLL_MS = 5_000;
const MIN_POLL_MS = 1_000;
const MAX_POLL_MS = 60_000;
const DEFAULT_STALE_MS = 30 * 60_000;
const MIN_STALE_MS = 5 * 60_000;
const MAX_STALE_MS = 24 * 60 * 60_000;
const STALE_SWEEP_INTERVAL_MS = 60_000;
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
  lastError: null,
};

function safeError(err) {
  return String(err?.message || err || "unknown_error")
    .replace(/(Bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .replace(/\b(sb_(?:secret|publishable)_[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9_-]+)\b/g, "[REDACTED]")
    .slice(0, 500);
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

function restConfig() {
  const projectRef = process.env.SUPABASE_PROJECT_REF || DEFAULT_PROJECT_REF;
  const restUrl = String(
    process.env.HUB_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    `https://${projectRef}.supabase.co`
  ).replace(/\/$/, "");
  const serviceRoleKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();
  return { restUrl, serviceRoleKey, projectRef };
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const { restUrl, serviceRoleKey } = restConfig();
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
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HUB_POSTGREST_${response.status}:${text.slice(0, 300)}`);
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function nextQueuedMission() {
  const query = [
    "select=id,title,capability,input,authorization,risk,branch_sha,rollback,created_at",
    "state=eq.queued",
    "authorization=eq.approved",
    "capability=not.is.null",
    "order=created_at.asc",
    "limit=1",
  ].join("&");
  const rows = await rest(`/rest/v1/hub_missions?${query}`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function claimMission(candidate) {
  const claimedAt = new Date().toISOString();
  const id = encodeURIComponent(candidate.id);
  const rows = await rest(
    `/rest/v1/hub_missions?id=eq.${id}&state=eq.queued&authorization=eq.approved`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: {
        state: "running",
        claimed_by: WORKER_ID,
        claimed_at: claimedAt,
        execution_status: "claimed",
        updated_at: claimedAt,
      },
    },
  );
  return Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
}

async function appendEvent(missionId, type, status, message) {
  await rest("/rest/v1/hub_mission_events", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      mission_id: missionId,
      type: String(type).slice(0, 80),
      status: status == null ? null : String(status).slice(0, 80),
      message: String(message || "").slice(0, 500),
    },
  });
}

async function appendEvidence(mission, receiptSha) {
  await rest("/rest/v1/hub_evidence", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      mission_id: mission.id,
      type: "mcp_tool_receipt",
      sha: receiptSha,
      revision: mission.branch_sha || null,
      origin: `CentralDark-MCP:${mission.capability}`.slice(0, 200),
      status: "pending",
    },
  });
}

async function finalizeMission(missionId, ok, executionStatus) {
  const finishedAt = new Date().toISOString();
  await rest(`/rest/v1/hub_missions?id=eq.${encodeURIComponent(missionId)}&state=eq.running&claimed_by=eq.${encodeURIComponent(WORKER_ID)}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      state: ok ? "done" : "failed",
      finished_at: finishedAt,
      execution_status: String(executionStatus || (ok ? "done" : "failed")).slice(0, 120),
      updated_at: finishedAt,
    },
  });
}

async function recoverStaleClaims() {
  const now = Date.now();
  if (now - lastStaleSweepAtMs < STALE_SWEEP_INTERVAL_MS) return 0;
  lastStaleSweepAtMs = now;
  state.lastStaleSweepAt = new Date(now).toISOString();

  const cutoff = new Date(now - staleMs()).toISOString();
  const query = [
    "select=id,claimed_by,claimed_at,capability",
    "state=eq.running",
    `claimed_at=lt.${encodeURIComponent(cutoff)}`,
    "order=claimed_at.asc",
    "limit=20",
  ].join("&");
  const staleRows = await rest(`/rest/v1/hub_missions?${query}`);
  if (!Array.isArray(staleRows) || staleRows.length === 0) return 0;

  let failed = 0;
  for (const row of staleRows) {
    const finishedAt = new Date().toISOString();
    const rows = await rest(
      `/rest/v1/hub_missions?id=eq.${encodeURIComponent(row.id)}&state=eq.running&claimed_at=lt.${encodeURIComponent(cutoff)}`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: {
          state: "failed",
          finished_at: finishedAt,
          execution_status: "STALE_CLAIM_UNPROVEN",
          updated_at: finishedAt,
        },
      },
    );
    if (!Array.isArray(rows) || rows.length !== 1) continue;
    failed += 1;
    try {
      await appendEvent(
        row.id,
        "stale_claim",
        "failed",
        `claim expirado; replay automático proibido; previous_worker=${String(row.claimed_by || "unknown").slice(0, 120)}; capability=${String(row.capability || "unknown").slice(0, 64)}`,
      );
    } catch (err) {
      log.error("hub_mission_stale_event_error", { missionId: row.id, error: safeError(err) });
    }
  }
  state.staleFailedCount += failed;
  return failed;
}

function unwrapResult(result) {
  const first = result?.content?.find?.((item) => item?.type === "text" && typeof item.text === "string");
  if (!first) return result ?? {};
  try { return JSON.parse(first.text); } catch { return { text: first.text.slice(0, 500) }; }
}

function classifyResult(result) {
  const payload = unwrapResult(result);
  const status = String(payload?.status || payload?.executionStatus || (payload?.ok === false ? "ERROR" : "OK"));
  const normalized = status.toUpperCase();
  const failed = result?.isError === true ||
    payload?.ok === false ||
    payload?.executionStatus === "blocked" ||
    ["BLOQUEADO", "FALHOU", "FAILED", "FAIL", "ERRO", "ERROR", "TOOL_NAO_ENCONTRADA", "AUDITORIA_STARTUP_INDISPONIVEL", "AUDITORIA_INDISPONIVEL"].includes(normalized);
  return { ok: !failed, status: normalized || (failed ? "FAILED" : "OK"), payload };
}

function receiptHash(result) {
  return createHash("sha256").update(JSON.stringify(result ?? null)).digest("hex");
}

async function dispatchMission(mission) {
  if (!CAPABILITY_RE.test(String(mission.capability || ""))) {
    return { isError: true, content: [{ type: "text", text: JSON.stringify({ ok: false, status: "CAPABILITY_INVALID" }) }] };
  }
  const dispatcher = mcpAdminTools.find((tool) => tool.name === "mcp_admin_call");
  if (!dispatcher) throw new Error("MCP_ADMIN_DISPATCHER_NOT_LOADED");

  const ctx = Object.freeze({
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "",
    admin: true,
    callerUser: WORKER_ID,
    oauthScope: "admin",
    correlationId: mission.id,
  });

  // `approved` nasce apenas no hub-command autenticado/admin. A tradução para
  // CONFIRMO ADMIN acontece aqui; a tool destrutiva ainda passa pelo guard
  // canônico e pode exigir confirmação própria adicional (ex.: run-once).
  return dispatcher.handler({
    tool: mission.capability,
    input: mission.input && typeof mission.input === "object" ? mission.input : {},
    confirmAdmin: "CONFIRMO ADMIN",
  }, ctx);
}

async function processOneMission() {
  const candidate = await nextQueuedMission();
  if (!candidate) return false;
  const mission = await claimMission(candidate);
  if (!mission) return false; // outra instância venceu o claim

  state.lastMissionId = mission.id;
  await appendEvent(mission.id, "claimed", "running", `worker=${WORKER_ID}; capability=${mission.capability}`);

  try {
    const result = await dispatchMission(mission);
    const verdict = classifyResult(result);
    const sha = receiptHash(result);

    // Receipt bruto não é persistido no banco: somente hash + metadados.
    // O executor não auto-valida a própria evidência; status fica pending.
    await appendEvidence(mission, sha);
    await appendEvent(mission.id, "execution", verdict.status, `capability=${mission.capability}; receipt_sha256=${sha}`);
    await finalizeMission(mission.id, verdict.ok, verdict.status);

    state.lastExecutionStatus = verdict.status;
    state.lastError = verdict.ok ? null : verdict.status;
    return true;
  } catch (err) {
    const reason = safeError(err);
    try { await appendEvent(mission.id, "execution_error", "failed", reason); } catch { /* best effort após falha */ }
    try { await finalizeMission(mission.id, false, "CONSUMER_ERROR"); } catch { /* estado será reconciliado por stale sweep */ }
    state.lastExecutionStatus = "CONSUMER_ERROR";
    state.lastError = reason;
    throw err;
  }
}

async function tick() {
  if (tickRunning) return;
  tickRunning = true;
  state.lastPollAt = new Date().toISOString();
  try {
    await recoverStaleClaims();
    const processed = await processOneMission();
    state.status = processed ? "processed" : "idle";
    if (!processed) state.lastError = null;
  } catch (err) {
    state.status = "error";
    state.lastError = safeError(err);
    log.error("hub_mission_consumer_error", { error: state.lastError, workerId: WORKER_ID });
  } finally {
    tickRunning = false;
  }
}

export function startHubMissionConsumer() {
  if (timer) return getHubMissionConsumerStatus();
  if (String(process.env.HUB_MISSION_CONSUMER_ENABLED || "true").toLowerCase() === "false") {
    state.enabled = false;
    state.status = "disabled";
    state.reason = "HUB_MISSION_CONSUMER_ENABLED=false";
    return getHubMissionConsumerStatus();
  }
  const { serviceRoleKey } = restConfig();
  if (!serviceRoleKey) {
    state.enabled = false;
    state.status = "disabled";
    state.reason = "SUPABASE_SERVICE_ROLE_KEY_MISSING";
    return getHubMissionConsumerStatus();
  }

  state.enabled = true;
  state.status = "starting";
  state.reason = null;
  void tick();
  timer = setInterval(() => { void tick(); }, pollMs());
  timer.unref?.();
  log.info("hub_mission_consumer_started", { workerId: WORKER_ID, pollMs: pollMs(), staleMs: staleMs() });
  return getHubMissionConsumerStatus();
}

export function getHubMissionConsumerStatus() {
  return { ...state, pollMs: pollMs(), staleMs: staleMs() };
}

export const __test = Object.freeze({ classifyResult, receiptHash, safeError });
