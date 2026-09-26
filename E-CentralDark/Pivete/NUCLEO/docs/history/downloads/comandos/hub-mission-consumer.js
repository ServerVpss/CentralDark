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
async function releaseClaimBeforeDispatch(missionId, reason) {
    const now = new Date().toISOString();
    const rows = await rest(`/rest/v1/hub_missions?id=eq.${encodeURIComponent(missionId)}&state=eq.running&claimed_by=eq.${encodeURIComponent(WORKER_ID)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: {
            state: "queued",
            claimed_by: null,
            claimed_at: null,
            execution_status: String(reason || "PRE_DISPATCH_REQUEUED").slice(0, 120),
            updated_at: now,
        },
    });
    if (!Array.isArray(rows) || rows.length !== 1)
        throw new Error("HUB_MISSION_RELEASE_CLAIM_FAILED");
}
async function renewClaim(missionId) {
    const now = new Date().toISOString();
    const rows = await rest(`/rest/v1/hub_missions?id=eq.${encodeURIComponent(missionId)}&state=eq.running&claimed_by=eq.${encodeURIComponent(WORKER_ID)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: { claimed_at: now, updated_at: now, execution_status: "executing" },
    });
    if (!Array.isArray(rows) || rows.length !== 1)
        throw new Error("HUB_MISSION_HEARTBEAT_FAILED");
}
function startClaimHeartbeat(missionId) {
    const intervalMs = Math.max(MIN_POLL_MS, Math.min(60_000, Math.floor(staleMs() / 3)));
    let stopped = false;
    const heartbeat = setInterval(() => {
        if (stopped)
            return;
        void renewClaim(missionId).catch((err) => {
            log.error("hub_mission_heartbeat_error", { missionId, error: safeError(err) });
        });
    }, intervalMs);
    heartbeat.unref?.();
    return () => {
        stopped = true;
        clearInterval(heartbeat);
    };
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
function sanitizedReceipt(result) {
    const payload = unwrapResult(result);
    return sanitizeOutgoingText(JSON.stringify({
        isError: result?.isError === true,
        payload,
    })).slice(0, 4_000);
}
async function appendReceiptEvent(mission, status, receiptText) {
    const rows = await rest("/rest/v1/hub_mission_events", {
        method: "POST",
        prefer: "return=representation",
        body: {
            mission_id: mission.id,
            type: "execution_receipt",
            status: String(status || "UNKNOWN").slice(0, 80),
            message: receiptText,
        },
    });
    if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.id) {
        throw new Error("HUB_MISSION_RECEIPT_EVENT_FAILED");
    }
    return rows[0];
}
async function appendEvidence(mission, receiptSha, receiptEventId) {
    await rest("/rest/v1/hub_evidence", {
        method: "POST",
        prefer: "return=minimal",
        body: {
            mission_id: mission.id,
            type: "mcp_tool_receipt",
            url_path: `/rest/v1/hub_mission_events?id=eq.${encodeURIComponent(receiptEventId)}`,
            sha: receiptSha,
            revision: mission.branch_sha || null,
            origin: `CentralDark-MCP:${mission.capability}`.slice(0, 200),
            status: "pending",
        },
    });
}
async function publishWorkCandidates(mission, payload, receiptSha) {
    const normalized = extractWorkCandidates(payload, mission);
    const stats = {
        totalObserved: normalized.totalObserved,
        accepted: normalized.accepted.length,
        rejected: normalized.rejected.length,
        truncated: normalized.truncated === true,
        created: 0,
        deduped: 0,
        failed: 0,
    };
    for (const candidate of normalized.accepted) {
        try {
            const rows = await rest("/rest/v1/rpc/publish_hub_work_candidate", {
                method: "POST",
                prefer: "return=representation",
                body: {
                    p_parent_mission_id: mission.id,
                    p_worker_id: WORKER_ID,
                    p_work_fingerprint: candidate.work_fingerprint,
                    p_capability: candidate.capability,
                    p_input: candidate.input,
                    p_branch_sha: candidate.branch_sha,
                    p_title: candidate.title,
                    p_target: candidate.target,
                    p_risk: candidate.risk,
                    p_receipt_sha: receiptSha,
                },
            });
            if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.mission_id || typeof rows[0]?.created !== "boolean") {
                throw new Error("WORK_CANDIDATE_PUBLISH_READBACK_FAILED");
            }
            if (rows[0].created)
                stats.created += 1;
            else
                stats.deduped += 1;
        }
        catch (err) {
            stats.failed += 1;
            log.error("hub_work_candidate_publish_error", {
                missionId: mission.id,
                fingerprint: candidate.work_fingerprint,
                error: safeError(err),
            });
        }
    }
    return stats;
}
async function finalizeMission(missionId, ok, executionStatus) {
    const finishedAt = new Date().toISOString();
    const rows = await rest(`/rest/v1/hub_missions?id=eq.${encodeURIComponent(missionId)}&state=eq.running&claimed_by=eq.${encodeURIComponent(WORKER_ID)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: {
            state: ok ? "done" : "failed",
            finished_at: finishedAt,
            execution_status: String(executionStatus || (ok ? "done" : "failed")).slice(0, 120),
            updated_at: finishedAt,
        },
    });
    if (!Array.isArray(rows) || rows.length !== 1) {
        throw new Error("HUB_MISSION_FINALIZE_READBACK_FAILED");
    }
    return rows[0];
}
async function markPostDispatchUnknown(missionId, reason) {
    const now = new Date().toISOString();
    try {
        await rest(`/rest/v1/hub_missions?id=eq.${encodeURIComponent(missionId)}&state=eq.running&claimed_by=eq.${encodeURIComponent(WORKER_ID)}`, {
            method: "PATCH",
            prefer: "return=minimal",
            body: {
                execution_status: "POST_DISPATCH_OUTCOME_UNKNOWN",
                updated_at: now,
            },
        });
    }
    catch { /* melhor esforço: não fabricar failed após efeito potencial */ }
    try {
        await appendEvent(missionId, "reconciliation_required", "unknown", reason);
    }
    catch { /* estado remoto será reconciliado; replay continua proibido */ }
}
async function recoverStaleClaims() {
    const now = Date.now();
    if (now - lastStaleSweepAtMs < STALE_SWEEP_INTERVAL_MS)
        return 0;
    lastStaleSweepAtMs = now;
    state.lastStaleSweepAt = new Date(now).toISOString();
    const cutoff = new Date(now - staleMs()).toISOString();
    const query = [
        "select=id,claimed_by,claimed_at,capability,execution_status",
        "state=eq.running",
        "execution_status=neq.STALE_CLAIM_UNPROVEN",
        `claimed_at=lt.${encodeURIComponent(cutoff)}`,
        "order=claimed_at.asc",
        "limit=20",
    ].join("&");
    const staleRows = await rest(`/rest/v1/hub_missions?${query}`);
    if (!Array.isArray(staleRows) || staleRows.length === 0)
        return 0;
    let unproven = 0;
    for (const row of staleRows) {
        const updatedAt = new Date().toISOString();
        const rows = await rest(`/rest/v1/hub_missions?id=eq.${encodeURIComponent(row.id)}&state=eq.running&claimed_at=lt.${encodeURIComponent(cutoff)}`, {
            method: "PATCH",
            prefer: "return=representation",
            body: {
                execution_status: "STALE_CLAIM_UNPROVEN",
                updated_at: updatedAt,
            },
        });
        if (!Array.isArray(rows) || rows.length !== 1)
            continue;
        unproven += 1;
        try {
            await appendEvent(row.id, "stale_claim", "unknown", `claim obsoleto; worker liveness não provado; replay automático proibido; previous_worker=${String(row.claimed_by || "unknown").slice(0, 120)}; capability=${String(row.capability || "unknown").slice(0, 64)}`);
        }
        catch (err) {
            log.error("hub_mission_stale_event_error", { missionId: row.id, error: safeError(err) });
        }
    }
    state.staleUnprovenCount += unproven;
    return unproven;
}
function unwrapResult(result) {
    const first = result?.content?.find?.((item) => item?.type === "text" && typeof item.text === "string");
    if (!first)
        return result ?? {};
    try {
        return JSON.parse(first.text);
    }
    catch {
        return { text: first.text.slice(0, 500) };
    }
}
function classifyResult(result) {
    const payload = unwrapResult(result);
    const textOnly = payload && typeof payload === "object" && Object.keys(payload).length === 1 && typeof payload.text === "string";
    if (textOnly)
        return { ok: false, status: "RESULTADO_NAO_ESTRUTURADO", payload };
    const explicitStatus = payload?.status ?? payload?.executionStatus ?? null;
    const normalized = explicitStatus == null ? "" : String(explicitStatus).trim().toUpperCase();
    const blockedFamily = /^(BLOQUEADO|BLOCKED|FAIL|FAILED|FALHOU|ERRO|ERROR|UNKNOWN|UNPROVEN|INDETERMINADO|INDETERMINATE)/.test(normalized);
    const explicitSuccess = payload?.ok === true || /^(OK|SUCCESS|PASS|DONE|EXECUTED|EXECUTADO)$/.test(normalized);
    const failed = result?.isError === true || payload?.ok === false || payload?.executionStatus === "blocked" || blockedFamily;
    if (failed)
        return { ok: false, status: normalized || "FAILED", payload };
    if (!explicitSuccess)
        return { ok: false, status: "RESULTADO_SEM_STATUS_COMPROVADO", payload };
    return { ok: true, status: normalized || "OK", payload };
}
function receiptHash(result) {
    const serialized = typeof result === "string" ? result : JSON.stringify(result ?? null);
    return createHash("sha256").update(serialized).digest("hex");
}
async function dispatchMission(mission) {
    if (!CAPABILITY_RE.test(String(mission.capability || ""))) {
        return { isError: true, content: [{ type: "text", text: JSON.stringify({ ok: false, status: "CAPABILITY_INVALID" }) }] };
    }
    const dispatcher = mcpAdminTools.find((tool) => tool.name === "mcp_admin_call");
    if (!dispatcher)
        throw new Error("MCP_ADMIN_DISPATCHER_NOT_LOADED");
    const ctx = Object.freeze({
        token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "",
        admin: true,
        autoMission: true,
        callerUser: WORKER_ID,
        oauthScope: "admin",
        correlationId: mission.id,
    });
    return dispatcher.handler({
        tool: mission.capability,
        input: mission.input && typeof mission.input === "object" ? mission.input : {},
    }, ctx);
}
async function processOneMission() {
    const mission = await claimNextMission();
    if (!mission)
        return false;
    state.lastMissionId = mission.id;
    try {
        await appendEvent(mission.id, "claimed", "running", `worker=${WORKER_ID}; scope=${String(mission.writer_scope || "unknown").slice(0, 200)}; capability=${mission.capability}`);
    }
    catch (err) {
        await releaseClaimBeforeDispatch(mission.id, "CLAIM_EVENT_WRITE_FAILED_REQUEUED");
        throw err;
    }
    const revision = revisionVerdict(mission.branch_sha, runtimeHead());
    if (!revision.ok) {
        try {
            await appendEvent(mission.id, "revision_gate", "blocked", revision.status);
        }
        catch { /* best effort */ }
        await finalizeMission(mission.id, false, revision.status);
        state.lastExecutionStatus = revision.status;
        state.lastError = revision.status;
        return true;
    }
    let dispatchStarted = false;
    const stopHeartbeat = startClaimHeartbeat(mission.id);
    try {
        dispatchStarted = true;
        const result = await dispatchMission(mission);
        const verdict = classifyResult(result);
        const receiptText = sanitizedReceipt(result);
        const sha = receiptHash(receiptText);
        const receiptEvent = await appendReceiptEvent(mission, verdict.status, receiptText);
        await appendEvidence(mission, sha, receiptEvent.id);
        await appendEvent(mission.id, "execution", verdict.status, `scope=${String(mission.writer_scope || "unknown").slice(0, 200)}; capability=${mission.capability}; receipt_sha256=${sha}; evidence_status=pending`);
        let discoveryStatus = "NO_WORK_CANDIDATES";
        if (verdict.ok) {
            try {
                const discovery = await publishWorkCandidates(mission, verdict.payload, sha);
                if (discovery.totalObserved > 0) {
                    discoveryStatus = discovery.failed > 0
                        ? "WORK_DISCOVERY_UNPROVEN"
                        : "WORK_CANDIDATES_PENDING";
                    await appendEvent(mission.id, "work_discovery", discovery.failed > 0 ? "unproven" : "pending", `observed=${discovery.totalObserved}; accepted=${discovery.accepted}; created=${discovery.created}; deduped=${discovery.deduped}; rejected=${discovery.rejected}; failed=${discovery.failed}; truncated=${discovery.truncated}`);
                }
            }
            catch (err) {
                discoveryStatus = "WORK_DISCOVERY_UNPROVEN";
                try {
                    await appendEvent(mission.id, "work_discovery", "unproven", safeError(err));
                }
                catch { /* derivação falhou; resultado original continua mensurado */ }
            }
        }
        const finalStatus = verdict.ok
            ? `${verdict.status}:EVIDENCE_PENDING:${discoveryStatus}`
            : verdict.status;
        await finalizeMission(mission.id, verdict.ok, finalStatus);
        state.lastExecutionStatus = finalStatus;
        state.lastError = verdict.ok ? null : verdict.status;
        return true;
    }
    catch (err) {
        const reason = safeError(err);
        if (dispatchStarted) {
            await markPostDispatchUnknown(mission.id, reason);
            state.lastExecutionStatus = "POST_DISPATCH_OUTCOME_UNKNOWN";
            state.lastError = reason;
        }
        else {
            try {
                await appendEvent(mission.id, "execution_error", "failed", reason);
            }
            catch { /* best effort */ }
            try {
                await finalizeMission(mission.id, false, "CONSUMER_ERROR_PRE_DISPATCH");
            }
            catch { /* sem efeito externo iniciado */ }
            state.lastExecutionStatus = "CONSUMER_ERROR_PRE_DISPATCH";
            state.lastError = reason;
        }
        throw err;
    }
    finally {
        stopHeartbeat();
    }
}
async function tick() {
    if (tickRunning)
        return;
    tickRunning = true;
    state.lastPollAt = new Date().toISOString();
    try {
        await recoverStaleClaims();
        const processed = await processOneMission();
        state.status = processed ? "processed" : "idle";
        if (!processed)
            state.lastError = null;
    }
    catch (err) {
        state.status = "error";
        state.lastError = safeError(err);
        log.error("hub_mission_consumer_error", { error: state.lastError, workerId: WORKER_ID });
    }
    finally {
        tickRunning = false;
    }
}
export function startHubMissionConsumer() {
    if (timer)
        return getHubMissionConsumerStatus();
    if (String(process.env.HUB_MISSION_CONSUMER_ENABLED || "true").toLowerCase() === "false") {
        state.enabled = false;
        state.status = "disabled";
        state.reason = "HUB_MISSION_CONSUMER_ENABLED=false";
        return getHubMissionConsumerStatus();
    }
    const { restUrl, serviceRoleKey } = restConfig();
    if (!restUrl) {
        state.enabled = false;
        state.status = "disabled";
        state.reason = "SUPABASE_URL_MISSING";
        return getHubMissionConsumerStatus();
    }
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
    log.info("hub_mission_consumer_started", {
        workerId: WORKER_ID,
        pollMs: pollMs(),
        staleMs: staleMs(),
        requestTimeoutMs: requestTimeoutMs(),
    });
    return getHubMissionConsumerStatus();
}
export function getHubMissionConsumerStatus() {
    return { ...state, pollMs: pollMs(), staleMs: staleMs(), requestTimeoutMs: requestTimeoutMs() };
}
export const __test = Object.freeze({
    classifyResult,
    receiptHash,
    safeError,
    restConfig,
    revisionVerdict,
});
//# sourceMappingURL=hub-mission-consumer.js.map