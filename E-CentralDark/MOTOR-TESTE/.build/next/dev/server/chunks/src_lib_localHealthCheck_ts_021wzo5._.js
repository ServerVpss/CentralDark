module.exports = [
"[project]/src/lib/localHealthCheck.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAllHealthStatuses",
    ()=>getAllHealthStatuses,
    "getHealthStatus",
    ()=>getHealthStatus,
    "initLocalHealthCheck",
    ()=>initLocalHealthCheck,
    "isNodeHealthy",
    ()=>isNodeHealthy,
    "stopLocalHealthCheck",
    ()=>stopLocalHealthCheck,
    "sweep",
    ()=>sweep
]);
/**
 * Local Provider Health Check
 *
 * Background polling of local provider_nodes (localhost) to detect
 * when they are up or down. Uses GET /models with a 5s timeout.
 *
 * Health status is stored in-memory (no DB migration needed).
 * Backoff schedule: 30s → 60s → 120s → 300s max on consecutive failures.
 * Resets to 30s on first success after failure.
 *
 * Uses Promise.allSettled so one slow/down node doesn't block others.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// ── Config ───────────────────────────────────────────────────────────────
const BACKOFF_SCHEDULE = [
    30_000,
    60_000,
    120_000,
    300_000
];
const CHECK_TIMEOUT_MS = 5_000;
const INITIAL_DELAY_MS = 15_000; // Wait for server boot before first sweep
const LOG_PREFIX = "[LocalHealthCheck]";
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
function isBuildProcess() {
    return typeof process !== "undefined" && process.env.NEXT_PHASE === "phase-production-build";
}
function getLHCState() {
    if (!globalThis.__omnirouteLocalHC) {
        globalThis.__omnirouteLocalHC = {
            initialized: false,
            sweepTimer: null,
            healthCache: new Map(),
            sweepInProgress: false
        };
    }
    return globalThis.__omnirouteLocalHC;
}
const healthCache = getLHCState().healthCache;
// ── Helpers ──────────────────────────────────────────────────────────────
function isEnvFlagEnabled(name) {
    const value = process.env[name];
    if (!value) return false;
    return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}
function isLocalHealthCheckDisabled() {
    return isEnvFlagEnabled("OMNIROUTE_DISABLE_LOCAL_HEALTHCHECK") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
}
function isLocalhostUrl(baseUrl) {
    try {
        const u = new URL(baseUrl);
        // Block credentials in URL to prevent SSRF via user@host (e.g., http://localhost@evil.com)
        if (u.username || u.password) return false;
        // Note: URL.hostname returns "[::1]" WITH brackets for IPv6 — both forms checked.
        // Verified: node -e "new URL('http://[::1]:8080').hostname" → "[::1]"
        // Strictly matching 172.16.0.0/12 (Docker/local) and explicitly blocking ::1 per SSRF hardening
        return u.hostname === "localhost" || u.hostname === "127.0.0.1" || /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(u.hostname);
    } catch  {
        return false;
    }
}
function getNextInterval(failures) {
    return BACKOFF_SCHEDULE[Math.min(failures, BACKOFF_SCHEDULE.length - 1)];
}
// ── Core ─────────────────────────────────────────────────────────────────
async function checkNode(node) {
    const url = `${node.baseUrl.replace(/\/+$/, "")}/models`;
    const start = Date.now();
    const prev = healthCache.get(node.id);
    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(CHECK_TIMEOUT_MS)
        });
        // Consume/cancel response body to free resources
        res.body?.cancel().catch(()=>{});
        const isHealthy = res.ok || res.status === 401; // 401 = server up but auth required
        return {
            nodeId: node.id,
            prefix: node.prefix,
            isHealthy,
            lastCheck: new Date(),
            consecutiveFailures: isHealthy ? 0 : (prev?.consecutiveFailures ?? 0) + 1,
            responseTimeMs: Date.now() - start,
            lastError: isHealthy ? undefined : `HTTP ${res.status}`
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Connection failed";
        return {
            nodeId: node.id,
            prefix: node.prefix,
            isHealthy: false,
            lastCheck: new Date(),
            consecutiveFailures: (prev?.consecutiveFailures ?? 0) + 1,
            responseTimeMs: Date.now() - start,
            lastError: message
        };
    }
}
async function sweep() {
    const state = getLHCState();
    if (state.sweepInProgress) return;
    state.sweepInProgress = true;
    try {
        let nodes;
        try {
            const raw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
            nodes = (Array.isArray(raw) ? raw : []).filter((n)=>typeof n.baseUrl === "string" && isLocalhostUrl(n.baseUrl));
        } catch (err) {
            console.error(LOG_PREFIX, "Failed to load provider_nodes:", err);
            return;
        }
        // Prune stale entries for deleted nodes
        const currentNodeIds = new Set(nodes.map((n)=>n.id));
        for (const key of healthCache.keys()){
            if (!currentNodeIds.has(key)) healthCache.delete(key);
        }
        if (nodes.length === 0) return;
        const results = await Promise.allSettled(nodes.map((node)=>checkNode(node)));
        for (const result of results){
            if (result.status === "fulfilled") {
                const status = result.value;
                const prev = healthCache.get(status.nodeId);
                // Log state transitions
                if (prev && prev.isHealthy !== status.isHealthy) {
                    const emoji = status.isHealthy ? "✅" : "❌";
                    console.log(LOG_PREFIX, `${emoji} ${status.prefix} is now ${status.isHealthy ? "healthy" : "unhealthy"}${status.lastError ? ` (${status.lastError})` : ""} [${status.responseTimeMs}ms]`);
                }
                healthCache.set(status.nodeId, status);
            }
        }
    } finally{
        state.sweepInProgress = false;
        scheduleSweep();
    }
}
function scheduleSweep() {
    const state = getLHCState();
    if (!state.initialized) return;
    if (state.sweepTimer) clearTimeout(state.sweepTimer);
    // Use the maximum consecutive failures across all nodes to determine interval
    let maxFailures = 0;
    for (const status of healthCache.values()){
        if (status.consecutiveFailures > maxFailures) {
            maxFailures = status.consecutiveFailures;
        }
    }
    const interval = getNextInterval(maxFailures);
    state.sweepTimer = setTimeout(sweep, interval);
}
function getHealthStatus(nodeId) {
    return healthCache.get(nodeId);
}
function isNodeHealthy(nodeId) {
    const status = healthCache.get(nodeId);
    return status?.isHealthy ?? true;
}
function getAllHealthStatuses() {
    return Object.fromEntries(healthCache);
}
function initLocalHealthCheck() {
    const state = getLHCState();
    if (state.initialized || isLocalHealthCheckDisabled()) return;
    state.initialized = true;
    console.log(LOG_PREFIX, `Starting local provider health check (initial delay ${INITIAL_DELAY_MS / 1000}s)`);
    state.sweepTimer = setTimeout(()=>{
        sweep().catch((err)=>console.error(LOG_PREFIX, "Initial sweep failed:", err));
    }, INITIAL_DELAY_MS);
}
function stopLocalHealthCheck() {
    const state = getLHCState();
    if (state.sweepTimer) {
        clearTimeout(state.sweepTimer);
        state.sweepTimer = null;
    }
    state.initialized = false;
}
// Auto-initialize on first import (same pattern as tokenHealthCheck.ts:272)
initLocalHealthCheck();
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_localHealthCheck_ts_021wzo5._.js.map