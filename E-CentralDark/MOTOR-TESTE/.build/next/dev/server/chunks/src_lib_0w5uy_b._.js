module.exports = [
"[project]/src/lib/tokenHealthCheckCopilot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGithubCopilotSubTokenIfNeeded",
    ()=>refreshGithubCopilotSubTokenIfNeeded
]);
// @ts-nocheck
/**
 * GitHub Copilot sub-token refresh helper for the proactive token health check.
 *
 * GitHub Copilot issues a short-lived (~30 min) API token separate from the
 * GitHub OAuth token. After a successful OAuth refresh, the health check must
 * also refresh this sub-token before it expires mid-session. The Copilot
 * token expiry is stored in providerSpecificData.copilotTokenExpiresAt (Unix
 * seconds). Extracted out of tokenHealthCheck.ts to keep that file under the
 * frozen file-size budget (see config/quality/file-size-baseline.json).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function refreshGithubCopilotSubTokenIfNeeded(params) {
    const { conn, result, proxyConfig, healthCheckLog, log, logWarn, logError, getConnectionLogLabel, logPrefix } = params;
    if (String(conn.provider || "").toLowerCase() !== "github") return;
    // Re-read the latest connection after the OAuth refresh (onPersist may have updated it).
    const latestConn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(conn.id).catch(()=>null) || conn;
    const accessTokenForCopilot = result.accessToken || latestConn.accessToken;
    if (!accessTokenForCopilot) return;
    const copilotExpiresAtRaw = latestConn.providerSpecificData?.copilotTokenExpiresAt ?? conn.providerSpecificData?.copilotTokenExpiresAt;
    const copilotExpiresAtMs = typeof copilotExpiresAtRaw === "number" && copilotExpiresAtRaw < 1e12 ? copilotExpiresAtRaw * 1000 // Unix seconds → ms
     : typeof copilotExpiresAtRaw === "string" ? new Date(copilotExpiresAtRaw).getTime() : typeof copilotExpiresAtRaw === "number" ? copilotExpiresAtRaw : 0;
    const copilotAboutToExpire = !copilotExpiresAtMs || copilotExpiresAtMs - Date.now() < 5 * 60 * 1000;
    if (!copilotAboutToExpire) return;
    log(`${logPrefix} Refreshing GitHub Copilot sub-token for ${getConnectionLogLabel(conn)}`);
    try {
        const copilotResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(accessTokenForCopilot, healthCheckLog, proxyConfig);
        if (copilotResult?.token) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                providerSpecificData: {
                    ...latestConn.providerSpecificData || {},
                    copilotToken: copilotResult.token,
                    copilotTokenExpiresAt: copilotResult.expiresAt
                }
            });
            log(`${logPrefix} ✓ GitHub Copilot sub-token refreshed for ${getConnectionLogLabel(conn)}`);
        } else {
            logWarn(`${logPrefix} ✗ GitHub Copilot sub-token refresh failed for ${getConnectionLogLabel(conn)}`);
        }
    } catch (copilotErr) {
        logError(`${logPrefix} Error refreshing Copilot sub-token:`, copilotErr?.message || copilotErr);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/tokenHealthCheck.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildRefreshFailureUpdate",
    ()=>buildRefreshFailureUpdate,
    "buildTransientRefreshRetryUpdate",
    ()=>buildTransientRefreshRetryUpdate,
    "checkConnection",
    ()=>checkConnection,
    "clearHealthCheckLogCache",
    ()=>clearHealthCheckLogCache,
    "clearRefreshCircuit",
    ()=>clearRefreshCircuit,
    "default",
    ()=>__TURBOPACK__default__export__,
    "extractResolvedProxyConfig",
    ()=>extractResolvedProxyConfig,
    "getRefreshBackoffUntil",
    ()=>getRefreshBackoffUntil,
    "initTokenHealthCheck",
    ()=>initTokenHealthCheck,
    "isInRefreshBackoff",
    ()=>isInRefreshBackoff,
    "shouldHideLogs",
    ()=>shouldHideLogs,
    "stopTokenHealthCheck",
    ()=>stopTokenHealthCheck,
    "sweep",
    ()=>sweep
]);
// @ts-nocheck
/**
 * Proactive Token Health Check Scheduler
 *
 * Background job that periodically refreshes OAuth tokens before they expire.
 * Each connection can configure its own `healthCheckInterval` (minutes).
 * Default: 60 minutes.  0 = disabled.
 *
 * The scheduler runs a lightweight sweep every TICK_MS (60 s).
 * For each eligible connection it calls the provider-specific refresh function,
 * updates the DB, and logs the result.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHealthCheckCopilot.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const LOG_PREFIX = "[HealthCheck]";
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
const TICK_MS = 60 * 1000; // sweep interval: every 60 seconds (restored — #7719 dropped the const but kept two call sites)
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_HEALTH_CHECK_INTERVAL_MIN = 60; // default per-connection interval
function isBuildProcess() {
    return typeof process !== "undefined" && process.env.NEXT_PHASE === "phase-production-build";
}
function getConnectionLogLabel(conn) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickMaskedDisplayValue"])([
        conn.name,
        conn.email
    ], conn.id || "-");
}
function extractResolvedProxyConfig(resolvedProxy) {
    if (resolvedProxy && typeof resolvedProxy === "object" && !Array.isArray(resolvedProxy) && "proxy" in resolvedProxy) {
        return resolvedProxy.proxy ?? null;
    }
    return resolvedProxy ?? null;
}
function getEffectiveTokenExpiryIso(conn) {
    if (!conn || typeof conn !== "object") return null;
    return conn.tokenExpiresAt || conn.expiresAt || null;
}
function getEffectiveTokenExpiryMs(conn) {
    const effectiveExpiry = getEffectiveTokenExpiryIso(conn);
    if (!effectiveExpiry) return 0;
    const expiryMs = new Date(effectiveExpiry).getTime();
    return Number.isFinite(expiryMs) ? expiryMs : 0;
}
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes
function getCopilotTokenExpiryMs(expiresAt) {
    if (typeof expiresAt === "number" && Number.isFinite(expiresAt)) {
        return expiresAt < 1e12 ? expiresAt * 1000 : expiresAt;
    }
    if (typeof expiresAt === "string" && expiresAt.trim()) {
        const parsed = new Date(expiresAt).getTime();
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
// Providers whose OAuth flow yields only a GitHub-style access token (no
// refresh_token) plus a short-lived Copilot sub-token: github.com Copilot and
// GHE Copilot (device-code flow against the enterprise host) both fit this
// shape. Keep both in sync — adding a github-token-only provider elsewhere
// (e.g. new GHE-flavored Copilot variant) must also list it here.
const GITHUB_ACCESS_TOKEN_ONLY_PROVIDERS = new Set([
    "github",
    "ghe-copilot"
]);
function isGitHubAccessTokenOnlyConnection(conn) {
    return GITHUB_ACCESS_TOKEN_ONLY_PROVIDERS.has(String(conn?.provider || "").toLowerCase()) && typeof conn?.accessToken === "string" && conn.accessToken.trim().length > 0;
}
/**
 * Resolve the Copilot token endpoint base URL for a connection. github.com
 * Copilot always uses api.github.com; GHE Copilot uses its own per-enterprise
 * host stored in providerSpecificData.gheUrl at connect time.
 */ function getCopilotTokenBaseUrl(conn) {
    if (String(conn?.provider || "").toLowerCase() === "ghe-copilot") {
        const gheUrl = conn?.providerSpecificData?.gheUrl;
        if (typeof gheUrl === "string" && gheUrl.trim().length > 0) {
            return `${gheUrl.trim().replace(/\/+$/, "")}/api/v3`;
        }
    }
    return "https://api.github.com";
}
function canClearGitHubNoRefreshTokenState(conn) {
    return !conn?.testStatus || conn.testStatus === "active" || conn.testStatus === "expired" && conn.errorCode === "no_refresh_token";
}
// ── Refresh circuit breaker ───────────────────────────────────────────────
// A refresh that returns null (network blip, dead proxy, unclassified error)
// leaves the connection active, so the next 60s sweep retries immediately —
// the production refresh loop (claude/aa5dd5cf 1352×, kimi 270×). We track
// consecutive failures and back off exponentially so a stuck connection stops
// hammering the upstream (and stops flooding the logs) instead of looping.
const REFRESH_CIRCUIT_BASE_MIN = 5;
const REFRESH_CIRCUIT_MAX_MIN = 240; // cap at 4h
const TRANSIENT_REFRESH_RETRY_MIN = 2; // flat 2-minute retry for network/timeout errors
function getRefreshBackoffUntil(streak, now) {
    const steps = Math.max(0, streak - 1);
    const backoffMin = Math.min(REFRESH_CIRCUIT_BASE_MIN * 2 ** steps, REFRESH_CIRCUIT_MAX_MIN);
    return new Date(new Date(now).getTime() + backoffMin * 60 * 1000).toISOString();
}
function isInRefreshBackoff(conn, nowMs) {
    const until = conn?.providerSpecificData?.refreshCircuit?.until;
    if (typeof until !== "string") return false;
    const untilMs = new Date(until).getTime();
    return Number.isFinite(untilMs) && untilMs > nowMs;
}
function buildRefreshFailureUpdate(conn, now) {
    const wasExpired = conn.testStatus === "expired";
    const retryCount = (conn.expiredRetryCount ?? 0) + (wasExpired ? 1 : 0);
    // Circuit breaker: increment the consecutive-failure streak and set an
    // exponential backoff window so the next sweep skips this connection instead
    // of retrying every 60s. Cleared by a successful refresh (clearRefreshCircuit).
    // Guard: providerSpecificData may be a primitive or null - treat as empty.
    const psd = typeof conn.providerSpecificData === "object" && conn.providerSpecificData !== null ? conn.providerSpecificData : {};
    const prevStreak = psd.refreshCircuit?.streak ?? 0;
    const streak = prevStreak + 1;
    return {
        lastHealthCheckAt: now,
        // A failed background refresh should not evict otherwise healthy accounts
        // from request routing. Keep non-expired connections active and only persist
        // the refresh error metadata for observability.
        testStatus: wasExpired ? "expired" : "active",
        lastError: "Health check: token refresh failed",
        lastErrorAt: now,
        lastErrorType: "token_refresh_failed",
        lastErrorSource: "oauth",
        errorCode: "refresh_failed",
        providerSpecificData: {
            ...psd,
            refreshCircuit: {
                streak,
                until: getRefreshBackoffUntil(streak, now),
                lastFailAt: now
            }
        },
        ...wasExpired ? {
            expiredRetryCount: retryCount,
            expiredRetryAt: now
        } : {}
    };
}
function buildTransientRefreshRetryUpdate(conn, now) {
    const wasExpired = conn.testStatus === "expired";
    const retryCount = (conn.expiredRetryCount ?? 0) + (wasExpired ? 1 : 0);
    // Preserve existing streak from any prior permanent failures so a transient
    // error does not reset the exponential backoff ladder.
    // Guard: providerSpecificData may be a primitive or null - treat as empty.
    const psd = typeof conn.providerSpecificData === "object" && conn.providerSpecificData !== null ? conn.providerSpecificData : {};
    const existingCircuit = psd.refreshCircuit;
    const existingStreak = existingCircuit?.streak ?? 0;
    const parsedExistingUntil = existingCircuit?.until ? new Date(existingCircuit.until).getTime() : 0;
    // Guard against NaN from malformed date strings - treat as no existing backoff.
    const existingUntil = Number.isFinite(parsedExistingUntil) ? parsedExistingUntil : 0;
    const transientUntil = new Date(now).getTime() + TRANSIENT_REFRESH_RETRY_MIN * 60 * 1000;
    // Use the longer of the two: preserve an existing permanent backoff
    // (e.g. 4h from exponential) or extend to the transient window.
    const useTransient = existingUntil <= transientUntil;
    const until = useTransient ? new Date(transientUntil).toISOString() : existingCircuit?.until ?? new Date(transientUntil).toISOString();
    return {
        lastHealthCheckAt: now,
        testStatus: wasExpired ? "expired" : "active",
        lastError: "Health check: token refresh transient error (network/timeout)",
        lastErrorAt: now,
        lastErrorType: "token_refresh_transient",
        lastErrorSource: "oauth",
        errorCode: "refresh_transient",
        providerSpecificData: {
            ...psd,
            refreshCircuit: {
                streak: existingStreak,
                until,
                lastFailAt: now,
                // Always set the transient flag for observability. When the existing
                // backoff is longer (useTransient=false), the transient error occurred
                // but the permanent backoff was preserved - flag it as false so
                // observers can distinguish this from a pure transient retry.
                transient: useTransient
            }
        },
        ...wasExpired ? {
            expiredRetryCount: retryCount,
            expiredRetryAt: now
        } : {}
    };
}
function clearRefreshCircuit(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return undefined;
    if (!("refreshCircuit" in providerSpecificData)) return undefined;
    const next = {
        ...providerSpecificData
    };
    delete next.refreshCircuit;
    return next;
}
/**
 * Concurrent-check batch size for the sweep, read per-call (not at module
 * load) so tests — and operators — can override it via HEALTHCHECK_BATCH_SIZE
 * without restarting the process. #7719 hardcoded this to a module-level
 * `const BATCH_SIZE = 20`, silently dropping the configurability restored
 * here (#7875). Falls back to DEFAULT_BATCH_SIZE on a missing/invalid value.
 */ function getConfiguredBatchSize() {
    const configured = parseInt(process.env.HEALTHCHECK_BATCH_SIZE || "", 10);
    return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_BATCH_SIZE;
}
function isEnvFlagEnabled(name) {
    const value = process.env[name];
    if (!value) return false;
    return TRUE_ENV_VALUES.has(value.trim().toLowerCase());
}
function isHealthCheckDisabled() {
    return isEnvFlagEnabled("OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
}
/**
 * Providers excluded from the PROACTIVE sweep, comma-separated, case-insensitive
 * (e.g. "codex,openai"). Targeted alternative to OMNIROUTE_DISABLE_TOKEN_HEALTHCHECK:
 * keeps rotating-token cascade providers (Codex/OpenAI share one Auth0 family) on the
 * reactive 401 path WITHOUT starving short-TTL providers (Kimi-coding) sweep-wide.
 */ function getHealthCheckSkipProviders() {
    const raw = process.env.OMNIROUTE_HEALTHCHECK_SKIP_PROVIDERS || "";
    return new Set(raw.split(",").map((s)=>s.trim().toLowerCase()).filter(Boolean));
}
// ── Logging helper ───────────────────────────────────────────────────────────
let cachedHideLogs = null;
let cacheTimestamp = 0;
let pendingHideLogs = null;
const CACHE_TTL = 30_000; // Cache settings for 30 seconds
async function shouldHideLogs() {
    if (isEnvFlagEnabled("OMNIROUTE_HIDE_HEALTHCHECK_LOGS") || isBuildProcess() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])()) {
        return true;
    }
    const now = Date.now();
    // Return cached value if valid
    if (cachedHideLogs !== null && now - cacheTimestamp < CACHE_TTL) {
        return cachedHideLogs;
    }
    // Return pending promise if a query is already in progress (request coalescing)
    if (pendingHideLogs !== null) {
        return pendingHideLogs;
    }
    // Create new promise for DB query
    pendingHideLogs = (async ()=>{
        try {
            const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
            cachedHideLogs = settings.hideHealthCheckLogs === true;
            cacheTimestamp = now;
            return cachedHideLogs;
        } catch  {
            return false;
        } finally{
            pendingHideLogs = null;
        }
    })();
    return pendingHideLogs;
}
function log(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.log(message, ...args);
    });
}
function logWarn(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.warn(message, ...args);
    });
}
function logError(message, ...args) {
    shouldHideLogs().then((hide)=>{
        if (!hide) console.error(message, ...args);
    });
}
function clearHealthCheckLogCache() {
    cachedHideLogs = null;
    cacheTimestamp = 0;
}
function getHCState() {
    if (!globalThis.__omnirouteTokenHC) {
        globalThis.__omnirouteTokenHC = {
            initialized: false,
            interval: null,
            initTimeout: null,
            sweeping: false
        };
    }
    return globalThis.__omnirouteTokenHC;
}
function initTokenHealthCheck() {
    const state = getHCState();
    if (state.initialized || isHealthCheckDisabled()) return;
    state.initialized = true;
    log(`${LOG_PREFIX} Starting proactive token health-check (tick every ${TICK_MS / 1000}s)`);
    const timer = setTimeout(()=>{
        state.initTimeout = null;
        sweep();
        state.interval = setInterval(sweep, TICK_MS);
        if (state.interval && typeof state.interval === "object" && "unref" in state.interval) {
            state.interval.unref?.();
        }
    }, 10_000);
    state.initTimeout = timer;
    if (timer && typeof timer === "object" && "unref" in timer) {
        timer.unref?.();
    }
}
function stopTokenHealthCheck() {
    const state = getHCState();
    if (state.initTimeout) {
        clearTimeout(state.initTimeout);
        state.initTimeout = null;
    }
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
    }
    state.initialized = false;
}
async function sweep() {
    const state = getHCState();
    if (state.sweeping) {
        return log(`${LOG_PREFIX} Sweep skipped — previous sweep still in progress`);
    }
    state.sweeping = true;
    try {
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            authType: "oauth"
        });
        if (!connections || connections.length === 0) return;
        const staggerMs = parseInt(process.env.HEALTHCHECK_STAGGER_MS || "3000", 10);
        const total = connections.length;
        // Process connections in concurrent batches. Within a single batch
        // connections are checked concurrently (same-epoch start) so the array
        // is drained faster and the event loop can service requests between
        // batches. The inter-batch stagger preserves the original burst-
        // prevention intent (Issue #1220) while reducing total sweep time from
        // O(total × staggerMs) to O(total ÷ batchSize × staggerMs).
        const batchSize = Math.min(getConfiguredBatchSize(), total);
        for(let offset = 0; offset < total; offset += batchSize){
            const batchEnd = Math.min(offset + batchSize, total);
            const batch = [];
            for(let i = offset; i < batchEnd; i++){
                const conn = connections[i];
                batch.push(checkConnection(conn).catch((err)=>{
                    logError(`${LOG_PREFIX} Error checking ${conn.name || conn.id}:`, err.message);
                }));
            }
            await Promise.all(batch);
            // Stagger between batches (not between individual connections) to
            // prevent sustained bursting while reducing total sweep duration.
            if (batchEnd < total) {
                if (staggerMs > 0) {
                    const jitterMin = parseInt(process.env.HEALTHCHECK_JITTER_MIN_MS || "500", 10);
                    const jitterMax = parseInt(process.env.HEALTHCHECK_JITTER_MAX_MS || "5000", 10);
                    const jitter = jitterMin + Math.random() * Math.max(0, jitterMax - jitterMin);
                    await new Promise((resolve)=>setTimeout(resolve, staggerMs + jitter));
                }
                // Yield a microtask so the event loop can service pending I/O
                // (DB contention, network responses) before the next batch starts.
                await new Promise((resolve)=>setTimeout(resolve, 0));
            }
        }
    } catch (err) {
        logError(`${LOG_PREFIX} Sweep error:`, err.message);
    } finally{
        state.sweeping = false;
    }
}
async function checkConnection(conn) {
    if (!conn?.id) return;
    const latestConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(conn.id) || conn;
    conn = latestConnection;
    // Per-provider opt-out of proactive refresh (e.g. Codex/OpenAI cascade
    // providers) — their token stays on the reactive, serialized 401 path while
    // other providers keep being refreshed proactively.
    if (getHealthCheckSkipProviders().has(String(conn.provider || "").toLowerCase())) {
        return;
    }
    // Determine interval (0 = disabled)
    const intervalMin = conn.healthCheckInterval ?? DEFAULT_HEALTH_CHECK_INTERVAL_MIN;
    if (intervalMin <= 0) return;
    if (!conn.isActive) return;
    // #8182: skip terminal connections (credits_exhausted / banned / expired).
    // These can never self-heal via a token refresh — probing them wastes
    // CPU and network on every sweep cycle. Mirrors isTerminalConnectionStatus
    // in src/sse/services/auth.ts and TERMINAL_CONNECTION_STATUSES in
    // src/lib/quota/connectionRecovery.ts.
    //
    // #5326 exception: a GitHub Copilot access-token-only connection parked in
    // "expired" with errorCode "no_refresh_token" is NOT actually terminal — it's
    // the exact target of the self-heal below (canClearGitHubNoRefreshTokenState),
    // which clears that stale status back to "active" once the Copilot sub-token
    // proves usable. Treating it as terminal here made that self-heal unreachable,
    // leaving healthy Copilot connections stuck at "expired" forever.
    const isRecoverableGithubCopilotNoRefresh = conn.testStatus === "expired" && conn.errorCode === "no_refresh_token" && isGitHubAccessTokenOnlyConnection(conn);
    const terminalStatuses = new Set([
        "credits_exhausted",
        "banned",
        "expired"
    ]);
    if (typeof conn.testStatus === "string" && terminalStatuses.has(conn.testStatus.toLowerCase()) && !isRecoverableGithubCopilotNoRefresh) {
        return;
    }
    // Deprecated upstream (see DEPRECATED_PROVIDERS in tokenRefresh): the provider is not
    // routable, so refreshing kept a credential alive that could never answer a request.
    // Surface that as a terminal state naming the migration, instead of the silent
    // `Skipping … (refresh unsupported)` that dropping it from supportsTokenRefresh alone
    // would produce — which would leave the row at "active" forever, doing nothing.
    //
    // Placed AFTER the terminal-status guard above, which makes this idempotent for free:
    // once marked "expired" the connection is skipped on every later sweep, so this writes
    // exactly once instead of rewriting the same reason each cycle.
    const deprecation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDeprecationNotice"])(String(conn.provider || ""));
    if (deprecation) {
        const now = new Date().toISOString();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            testStatus: "expired",
            lastHealthCheckAt: now,
            lastError: deprecation.reason,
            lastErrorAt: now,
            lastErrorType: "provider_deprecated",
            lastErrorSource: "oauth",
            errorCode: "provider_deprecated"
        });
        log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} is a deprecated provider; marking expired (migrate to ${deprecation.migrateTo})`);
        return;
    }
    if (!conn.refreshToken || typeof conn.refreshToken !== "string") {
        if (isGitHubAccessTokenOnlyConnection(conn)) {
            const now = new Date().toISOString();
            const providerSpecificData = conn.providerSpecificData || {};
            const hasCopilotToken = typeof providerSpecificData.copilotToken === "string" && providerSpecificData.copilotToken.trim().length > 0;
            const copilotExpiresAtMs = getCopilotTokenExpiryMs(providerSpecificData.copilotTokenExpiresAt);
            const copilotAboutToExpire = !hasCopilotToken || !copilotExpiresAtMs || copilotExpiresAtMs - Date.now() < TOKEN_EXPIRY_BUFFER;
            let refreshedProviderSpecificData = null;
            if (copilotAboutToExpire) {
                const hideLogs = await shouldHideLogs();
                const proxyResolution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(conn.id);
                const proxyConfig = extractResolvedProxyConfig(proxyResolution);
                const healthCheckLog = {
                    info: (tag, msg)=>{
                        if (!hideLogs) console.log(LOG_PREFIX, `[${tag}]`, msg);
                    },
                    warn: (tag, msg)=>{
                        if (!hideLogs) console.warn(LOG_PREFIX, `[${tag}]`, msg);
                    },
                    error: (tag, msg, extra)=>{
                        if (!hideLogs) console.error(LOG_PREFIX, `[${tag}]`, msg, extra || "");
                    }
                };
                const copilotResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshCopilotToken"])(conn.accessToken, healthCheckLog, proxyConfig, getCopilotTokenBaseUrl(conn));
                if (copilotResult?.token) {
                    refreshedProviderSpecificData = {
                        ...providerSpecificData,
                        copilotToken: copilotResult.token,
                        copilotTokenExpiresAt: copilotResult.expiresAt
                    };
                }
            }
            if (canClearGitHubNoRefreshTokenState(conn)) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                    lastHealthCheckAt: now,
                    testStatus: "active",
                    lastError: copilotAboutToExpire && !refreshedProviderSpecificData ? "Health check: Copilot token refresh failed" : null,
                    lastErrorAt: copilotAboutToExpire && !refreshedProviderSpecificData ? now : null,
                    lastErrorType: copilotAboutToExpire && !refreshedProviderSpecificData ? "token_refresh_failed" : null,
                    lastErrorSource: copilotAboutToExpire && !refreshedProviderSpecificData ? "oauth" : null,
                    errorCode: copilotAboutToExpire && !refreshedProviderSpecificData ? "refresh_failed" : null,
                    expiredRetryCount: null,
                    expiredRetryAt: null,
                    ...refreshedProviderSpecificData ? {
                        providerSpecificData: refreshedProviderSpecificData
                    } : {}
                });
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                    lastHealthCheckAt: now,
                    ...refreshedProviderSpecificData ? {
                        providerSpecificData: refreshedProviderSpecificData
                    } : {}
                });
            }
            // Steady-state ticks stay silent: this path runs once per TICK_MS (60s) for
            // EVERY github/ghe-copilot connection, so an unconditional line here emits
            // ~1440 entries/day per connection all saying the same nothing-changed thing.
            // Only report when the sweep actually did work — a Copilot sub-token refresh
            // attempt — so a genuine refresh failure still surfaces in the log.
            if (copilotAboutToExpire) {
                log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} Copilot token ${refreshedProviderSpecificData ? "refreshed" : "refresh FAILED"} (no refresh token; connection stays active)`);
            }
            return;
        }
        // #5326: a refresh-CAPABLE provider (e.g. antigravity/gemini) with no usable
        // refresh token can never self-heal via the sweep — it genuinely needs re-auth.
        // Silently skipping here left the row at testStatus="active" while the dashboard
        // badge (which derives expiry from tokenExpiresAt||expiresAt) showed a confusing
        // cosmetic "Token Expired". Surface reality as a terminal "expired" status instead.
        // Guard tightly so we do NOT clobber:
        //   - providers without refresh tokens (supportsTokenRefresh=false; #8407 devin-cli)
        //   - connections already in a terminal/specific state (expired/banned/credits_exhausted)
        //   - transient cooldown state (unavailable) owned by the request path
        const refreshCapableNeedsReauth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsTokenRefresh"])(conn.provider) && (!conn.testStatus || conn.testStatus === "active") && !(conn.apiKey && conn.apiKey.length > 0); // API-key-only connections don't need refresh tokens
        if (refreshCapableNeedsReauth) {
            const now = new Date().toISOString();
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                testStatus: "expired",
                lastHealthCheckAt: now,
                lastError: "No refresh token available — re-authenticate this account.",
                lastErrorAt: now,
                lastErrorType: "no_refresh_token",
                lastErrorSource: "oauth",
                errorCode: "no_refresh_token"
            });
            log(`${LOG_PREFIX} ${conn.provider}/${getConnectionLogLabel(conn)} has no refresh token; marking expired (needs re-auth)`);
        }
        return;
    }
    // Retry expired connections with exponential backoff up to EXPIRED_RETRY_MAX times.
    if (conn.testStatus === "expired") {
        const retryCount = conn.expiredRetryCount ?? 0;
        if (retryCount >= EXPIRED_RETRY_MAX) return;
        const lastRetry = conn.expiredRetryAt ? new Date(conn.expiredRetryAt).getTime() : 0;
        const backoffMs = EXPIRED_RETRY_BACKOFF_MIN * 60 * 1000 * Math.pow(2, retryCount);
        if (Date.now() - lastRetry < backoffMs) return;
        log(`${LOG_PREFIX} Retrying expired ${conn.provider}/${getConnectionLogLabel(conn)} (attempt ${retryCount + 1}/${EXPIRED_RETRY_MAX})`);
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supportsTokenRefresh"])(conn.provider)) {
        const now = new Date().toISOString();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            lastHealthCheckAt: now
        });
        log(`${LOG_PREFIX} Skipping ${conn.provider}/${getConnectionLogLabel(conn)} (refresh unsupported)`);
        return;
    }
    const intervalMs = intervalMin * 60 * 1000;
    const lastCheck = conn.lastHealthCheckAt ? new Date(conn.lastHealthCheckAt).getTime() : 0;
    // Prefer expiry-driven refresh when the provider returns a concrete expiry timestamp.
    // Rotating-token providers such as Codex should not be refreshed on a fixed hourly
    // cadence while the access token is still valid for days.
    const tokenExpiresAt = getEffectiveTokenExpiryMs(conn);
    const hasKnownExpiry = tokenExpiresAt > 0;
    const isAboutToExpire = hasKnownExpiry && tokenExpiresAt - Date.now() < TOKEN_EXPIRY_BUFFER;
    // ROTATING_REFRESH_PROVIDERS — providers whose refresh_tokens are SINGLE-USE
    // (each refresh consumes the old one and returns a new one). For these, refreshing
    // on a fixed interval — instead of strictly on imminent expiry — burns rotations
    // unnecessarily AND can trigger Auth0's token family revocation (especially OpenAI
    // Codex). 9router did not have this background sweep; it was introduced in OmniRoute
    // and is the root cause of "adding account B invalidates account A" reports.
    // The interval path is kept ONLY for non-rotating providers where token state can
    // drift silently (e.g. cookie-based, opaque sessions without expires_at).
    const ROTATING_REFRESH_PROVIDERS = new Set([
        "codex",
        "openai",
        "kimi-coding",
        "cline",
        "kiro",
        "amazon-q",
        "gitlab-duo",
        "claude"
    ]);
    const isRotatingProvider = ROTATING_REFRESH_PROVIDERS.has(String(conn.provider || "").toLowerCase());
    const shouldRefreshByInterval = !hasKnownExpiry && !isRotatingProvider && Date.now() - lastCheck >= intervalMs;
    if (!isAboutToExpire && !shouldRefreshByInterval) return;
    // Circuit breaker: if recent refreshes for this connection failed, wait out
    // the exponential backoff window instead of retrying every 60s tick. This is
    // what stops the refresh loop when getAccessToken keeps returning null
    // (dead proxy / network blip / unclassified upstream error).
    if (isInRefreshBackoff(conn, Date.now())) {
        return;
    }
    const reason = isAboutToExpire ? "token expiring soon" : `interval: ${intervalMin}min`;
    log(`${LOG_PREFIX} Refreshing ${conn.provider}/${getConnectionLogLabel(conn)} (${reason})`);
    const attemptedRefreshToken = conn.refreshToken;
    const attemptedAccessToken = conn.accessToken || null;
    const credentials = {
        connectionId: conn.id,
        refreshToken: attemptedRefreshToken,
        accessToken: attemptedAccessToken,
        expiresAt: getEffectiveTokenExpiryIso(conn),
        providerSpecificData: conn.providerSpecificData
    };
    const hideLogs = await shouldHideLogs();
    const proxyResolution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(conn.id);
    const proxyConfig = extractResolvedProxyConfig(proxyResolution);
    const healthCheckLog = {
        info: (tag, msg)=>{
            if (!hideLogs) console.log(LOG_PREFIX, `[${tag}]`, msg);
        },
        warn: (tag, msg)=>{
            if (!hideLogs) console.warn(LOG_PREFIX, `[${tag}]`, msg);
        },
        error: (tag, msg, extra)=>{
            if (!hideLogs) console.error(LOG_PREFIX, `[${tag}]`, msg, extra || "");
        }
    };
    let persistedResult = null;
    let result;
    try {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccessToken"])(conn.provider, credentials, healthCheckLog, proxyConfig, async (refreshResult)=>{
            const now = new Date().toISOString();
            const updateData = {
                accessToken: refreshResult.accessToken,
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: null,
                lastErrorAt: null,
                lastErrorType: null,
                lastErrorSource: null,
                errorCode: null,
                expiredRetryCount: null,
                expiredRetryAt: null
            };
            if (refreshResult.refreshToken) {
                updateData.refreshToken = refreshResult.refreshToken;
            }
            if (refreshResult.expiresAt) {
                updateData.expiresAt = refreshResult.expiresAt;
                updateData.tokenExpiresAt = refreshResult.expiresAt;
            } else if (refreshResult.expiresIn) {
                const expiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000).toISOString();
                updateData.expiresAt = expiresAt;
                updateData.tokenExpiresAt = expiresAt;
            }
            // Merge new providerSpecificData and ALWAYS clear the refresh circuit
            // breaker streak on a successful refresh.
            const mergedProviderData = {
                ...conn.providerSpecificData || {},
                ...refreshResult.providerSpecificData || {}
            };
            const clearedProviderData = clearRefreshCircuit(mergedProviderData);
            if (clearedProviderData !== undefined) {
                updateData.providerSpecificData = clearedProviderData;
            } else if (refreshResult.providerSpecificData) {
                updateData.providerSpecificData = mergedProviderData;
            }
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                // DB write failed after successful refresh - log but do not throw.
                // The outer catch would misclassify this as a network error.
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after successful refresh` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); token not persisted`);
                return;
            }
            // Mark as persisted AFTER the DB write succeeds.
            persistedResult = refreshResult;
        });
    } catch (err) {
        // If onPersist already wrote a successful result, do not overwrite it.
        if (persistedResult) {
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh error after successful persist` + ` (${err instanceof Error ? err.message : String(err)}); ignoring`);
            return;
        }
        // Classify: only network/timeout errors are transient. Programming errors
        // and DB failures fall through to the exponential backoff path.
        const errObj = typeof err === "object" && err !== null ? err : {};
        const errName = err instanceof Error ? err.name : String(errObj.name ?? "");
        const errMsg = err instanceof Error ? err.message : String(err);
        const errCode = String(errObj.code ?? "");
        // Also check err.cause for wrapped fetch errors.
        const errCause = errObj.cause instanceof Error ? errObj.cause.message : "";
        const errCauseCode = String(errObj.cause?.code ?? "");
        const combinedMsg = `${errMsg} ${errCause}`;
        const combinedCode = `${errCode} ${errCauseCode}`;
        const isTransientNetworkError = errName === "AbortError" || errName === "TimeoutError" || /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|ENOTCONN|ENOTFOUND|EAI_AGAIN|ERR_NETWORK|ERR_SOCKET|ERR_CONNECTION|socket hang up|fetch failed/i.test(combinedMsg) || /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|ENOTCONN|ENOTFOUND|EAI_AGAIN|ERR_NETWORK|ERR_SOCKET|ERR_CONNECTION/i.test(combinedCode);
        if (isTransientNetworkError) {
            const transientNow = new Date().toISOString();
            const updateData = buildTransientRefreshRetryUpdate(conn, transientNow);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after transient error` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); state not persisted`);
            }
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh transient error` + ` (${err instanceof Error ? err.message : String(err)}); retry in ${TRANSIENT_REFRESH_RETRY_MIN}min`);
        } else {
            // Non-transient error: apply standard exponential backoff.
            const failNow = new Date().toISOString();
            const updateData = buildRefreshFailureUpdate(conn, failNow);
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
            } catch (dbErr) {
                logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} DB write failed after permanent error` + ` (${dbErr instanceof Error ? dbErr.message : String(dbErr)}); state not persisted`);
            }
            logWarn(`${LOG_PREFIX} ~ ${conn.provider}/${getConnectionLogLabel(conn)} refresh error` + ` (${err instanceof Error ? err.message : String(err)}); applying exponential backoff`);
        }
        return;
    }
    const now = new Date().toISOString();
    // ─── Handle unrecoverable errors (e.g. refresh_token_reused) ───────────
    // OpenAI Codex uses rotating one-time-use refresh tokens.
    // Once used, the old token is permanently invalidated.
    // Retrying will never succeed → deactivate and stop the loop.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(result)) {
        const currentConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(conn.id);
        const credentialsChangedSinceSweep = !!currentConnection && (currentConnection.refreshToken !== attemptedRefreshToken || (currentConnection.accessToken || null) !== attemptedAccessToken);
        if (credentialsChangedSinceSweep) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now
            });
            logWarn(`${LOG_PREFIX} ! ${conn.provider}/${getConnectionLogLabel(conn)} changed during refresh; skipping stale deactivation`);
            return;
        }
        const accessTokenStillValid = getEffectiveTokenExpiryMs(currentConnection || conn) > Date.now() + TOKEN_EXPIRY_BUFFER;
        if (accessTokenStillValid) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: `Health check refresh failed (${result.error}). Re-authenticate before the current access token expires.`,
                lastErrorAt: now,
                lastErrorType: result.error,
                lastErrorSource: "oauth",
                errorCode: result.error
            });
            logWarn(`${LOG_PREFIX} ! ${conn.provider}/${getConnectionLogLabel(conn)} refresh token is invalid (${result.error}), but the current access token is still valid; keeping connection active`);
            return;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
            lastHealthCheckAt: now,
            testStatus: "expired",
            lastError: isRotatingProvider ? `Refresh token consumed (${result.error}). Please re-authenticate this account.` : `Refresh token rejected (${result.error}). Please re-authenticate this account.`,
            lastErrorAt: now,
            lastErrorType: result.error,
            lastErrorSource: "oauth",
            errorCode: result.error,
            isActive: false,
            // Only rotating-token providers (Codex/OpenAI/etc.) have single-use refresh
            // tokens that are genuinely consumed and worthless after a failed refresh, so
            // clearing them is safe. For non-rotating providers (Google: antigravity /
            // gemini) the stored refresh_token is the user's only recovery
            // artifact — nulling it caused #3679 (the connection reports "No valid refresh
            // token available" and can never recover even after re-activation). Preserve it.
            ...isRotatingProvider ? {
                refreshToken: null
            } : {}
        });
        logError(`${LOG_PREFIX} ✗ ${conn.provider}/${getConnectionLogLabel(conn)} — ` + `Refresh token is permanently invalid (${result.error}). ` + `Connection deactivated. Re-authenticate to restore.`);
        return;
    }
    if (result && result.accessToken) {
        // onPersist already wrote the core token fields atomically inside the mutex.
        // Only write the lastHealthCheckAt timestamp (and any fields onPersist may have
        // missed) here, to avoid a redundant full update that would race against another
        // concurrent refresh that already wrote fresh credentials.
        if (persistedResult) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, {
                lastHealthCheckAt: now
            });
        } else {
            // No onPersist (e.g. no connectionId — token-hash dedup path). Write all fields.
            const updateData = {
                accessToken: result.accessToken,
                lastHealthCheckAt: now,
                testStatus: "active",
                lastError: null,
                lastErrorAt: null,
                lastErrorType: null,
                lastErrorSource: null,
                errorCode: null,
                expiredRetryCount: null,
                expiredRetryAt: null
            };
            if (result.refreshToken) {
                updateData.refreshToken = result.refreshToken;
            }
            if (result.expiresAt) {
                updateData.expiresAt = result.expiresAt;
                updateData.tokenExpiresAt = result.expiresAt;
            } else if (result.expiresIn) {
                const expiresAt = new Date(Date.now() + result.expiresIn * 1000).toISOString();
                updateData.expiresAt = expiresAt;
                updateData.tokenExpiresAt = expiresAt;
            }
            if (result.providerSpecificData) {
                updateData.providerSpecificData = {
                    ...conn.providerSpecificData || {},
                    ...result.providerSpecificData
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
        }
        log(`${LOG_PREFIX} ✓ ${conn.provider}/${getConnectionLogLabel(conn)} refreshed`);
        // ── GitHub Copilot sub-token refresh ──────────────────────────────────────
        // Extracted to tokenHealthCheckCopilot.ts to keep this file under the
        // frozen file-size budget. See that file's header comment for context.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheckCopilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGithubCopilotSubTokenIfNeeded"])({
            conn,
            result,
            proxyConfig,
            healthCheckLog,
            log,
            logWarn,
            logError,
            getConnectionLogLabel,
            logPrefix: LOG_PREFIX
        });
    } else {
        const updateData = buildRefreshFailureUpdate(conn, now);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(conn.id, updateData);
        logWarn(`${LOG_PREFIX} ✗ ${conn.provider}/${getConnectionLogLabel(conn)} refresh failed` + (conn.testStatus === "expired" ? ` (${updateData.expiredRetryCount}/${EXPIRED_RETRY_MAX} expired retries used)` : ""));
    }
}
// Auto-start when imported
initTokenHealthCheck();
const __TURBOPACK__default__export__ = initTokenHealthCheck;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/config/runtimeSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyRuntimeSettings",
    ()=>applyRuntimeSettings,
    "buildRuntimeSettingsSnapshot",
    ()=>buildRuntimeSettingsSnapshot,
    "getAuthzBypassSnapshot",
    ()=>getAuthzBypassSnapshot,
    "resetRuntimeSettingsStateForTests",
    ()=>resetRuntimeSettingsStateForTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHealthCheck.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Default bypass policy: kill-switch on, `/api/mcp/` bypassable. Mirrors the
// pre-T-011 compile-time constant so the route guard works identically before
// the first `applyRuntimeSettings` call (e.g. cold-boot requests).
const DEFAULT_AUTHZ_BYPASS_SNAPSHOT = {
    enabled: true,
    prefixes: [
        "/api/mcp/"
    ]
};
const DEFAULT_RUNTIME_SETTINGS_SNAPSHOT = {
    payloadRules: null,
    modelAliases: {},
    backgroundDegradation: null,
    cliCompatProviders: [],
    alwaysPreserveClientCache: "auto",
    antigravitySignatureCacheMode: "enabled",
    usageTokenBuffer: null,
    hideHealthCheckLogs: false,
    modelsDevSyncEnabled: false,
    modelsDevSyncInterval: null,
    corsOrigins: "",
    ccBridgeTransforms: null,
    systemTransforms: null,
    authzBypass: DEFAULT_AUTHZ_BYPASS_SNAPSHOT,
    customBannedSignals: []
};
let lastAppliedSnapshot = null;
// Module-local mirror of the current bypass policy. Read by the route guard
// on every non-loopback hit to a LOCAL_ONLY path via `getAuthzBypassSnapshot`.
// Initialised to the default so cold-boot requests (before any
// `applyRuntimeSettings` call) behave identically to PR #2473.
let currentAuthzBypass = DEFAULT_AUTHZ_BYPASS_SNAPSHOT;
function isTruthyEnvFlag(value) {
    if (typeof value !== "string") return false;
    return new Set([
        "1",
        "true",
        "yes",
        "on"
    ]).has(value.trim().toLowerCase());
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function stableSerialize(value) {
    return JSON.stringify(canonicalize(value));
}
function canonicalize(value) {
    if (Array.isArray(value)) {
        return value.map((entry)=>canonicalize(entry));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.keys(value).sort((left, right)=>left.localeCompare(right)).map((key)=>[
                key,
                canonicalize(value[key])
            ]));
    }
    return value;
}
function parseStoredJson(value, field) {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn(`[HOT_RELOAD] Failed to parse persisted settings field "${field}":`, error instanceof Error ? error.message : error);
        return null;
    }
}
function normalizeStringArray(value) {
    if (!Array.isArray(value)) return [];
    return Array.from(new Set(value.map((entry)=>typeof entry === "string" ? entry.trim() : "").filter((entry)=>entry.length > 0)));
}
function normalizeStringRecord(value) {
    const record = toRecord(parseStoredJson(value, "modelAliases"));
    const entries = Object.entries(record).map(([key, entryValue])=>[
            key.trim(),
            typeof entryValue === "string" ? entryValue.trim() : ""
        ]).filter(([key, entryValue])=>key.length > 0 && entryValue.length > 0);
    return Object.fromEntries(entries);
}
function normalizeBackgroundDegradation(value) {
    const record = toRecord(parseStoredJson(value, "backgroundDegradation"));
    if (Object.keys(record).length === 0) return null;
    const degradationMap = Object.fromEntries(Object.entries(toRecord(record.degradationMap)).map(([key, entryValue])=>[
            key.trim(),
            typeof entryValue === "string" ? entryValue.trim() : ""
        ]).filter(([key, entryValue])=>key.length > 0 && entryValue.length > 0));
    const detectionPatterns = normalizeStringArray(record.detectionPatterns);
    return {
        enabled: record.enabled === true,
        degradationMap,
        detectionPatterns
    };
}
function normalizeNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
function normalizePayloadRules(value) {
    return parseStoredJson(value, "payloadRules");
}
function normalizeAuthzBypass(settings) {
    const enabled = settings.localOnlyManageScopeBypassEnabled === false ? false : settings.localOnlyManageScopeBypassEnabled === true ? true : DEFAULT_AUTHZ_BYPASS_SNAPSHOT.enabled;
    const rawPrefixes = settings.localOnlyManageScopeBypassPrefixes;
    const prefixes = Array.isArray(rawPrefixes) ? Array.from(new Set(rawPrefixes.map((entry)=>typeof entry === "string" ? entry.trim() : "").filter((entry)=>entry.length > 0 && entry.startsWith("/")))) : [
        ...DEFAULT_AUTHZ_BYPASS_SNAPSHOT.prefixes
    ];
    return {
        enabled,
        prefixes
    };
}
function getAuthzBypassSnapshot() {
    return currentAuthzBypass;
}
function buildRuntimeSettingsSnapshot(settings) {
    return {
        payloadRules: normalizePayloadRules(settings.payloadRules),
        modelAliases: normalizeStringRecord(settings.modelAliases),
        backgroundDegradation: normalizeBackgroundDegradation(settings.backgroundDegradation),
        cliCompatProviders: normalizeStringArray(settings.cliCompatProviders),
        alwaysPreserveClientCache: typeof settings.alwaysPreserveClientCache === "string" ? settings.alwaysPreserveClientCache : DEFAULT_RUNTIME_SETTINGS_SNAPSHOT.alwaysPreserveClientCache,
        antigravitySignatureCacheMode: typeof settings.antigravitySignatureCacheMode === "string" ? settings.antigravitySignatureCacheMode : DEFAULT_RUNTIME_SETTINGS_SNAPSHOT.antigravitySignatureCacheMode,
        usageTokenBuffer: settings.usageTokenBuffer ?? null,
        hideHealthCheckLogs: settings.hideHealthCheckLogs === true,
        modelsDevSyncEnabled: settings.modelsDevSyncEnabled === true,
        modelsDevSyncInterval: normalizeNumber(settings.modelsDevSyncInterval),
        corsOrigins: typeof settings.corsOrigins === "string" ? settings.corsOrigins : "",
        ccBridgeTransforms: parseStoredJson(settings.ccBridgeTransforms, "ccBridgeTransforms"),
        systemTransforms: parseStoredJson(settings.systemTransforms, "systemTransforms"),
        authzBypass: normalizeAuthzBypass(settings),
        customBannedSignals: normalizeStringArray(settings.customBannedSignals)
    };
}
function getPreviousSnapshot() {
    return lastAppliedSnapshot || DEFAULT_RUNTIME_SETTINGS_SNAPSHOT;
}
async function applyPayloadRulesSection(payloadRules) {
    const { clearPayloadRulesConfigOverride, setPayloadRulesConfig } = await __turbopack_context__.A("[project]/open-sse/services/payloadRules.ts [app-route] (ecmascript, async loader)");
    if (payloadRules === null || payloadRules === undefined) {
        clearPayloadRulesConfigOverride();
        return;
    }
    setPayloadRulesConfig(payloadRules);
}
async function applyModelAliasesSection(modelAliases) {
    const { setCustomAliases } = await __turbopack_context__.A("[project]/open-sse/services/modelDeprecation.ts [app-route] (ecmascript, async loader)");
    setCustomAliases(modelAliases);
}
async function applyBackgroundDegradationSection(backgroundDegradation) {
    const { getDefaultDegradationMap, getDefaultDetectionPatterns, setBackgroundDegradationConfig } = await __turbopack_context__.A("[project]/open-sse/services/backgroundTaskDetector.ts [app-route] (ecmascript, async loader)");
    if (!backgroundDegradation) {
        setBackgroundDegradationConfig({
            enabled: false,
            degradationMap: getDefaultDegradationMap(),
            detectionPatterns: getDefaultDetectionPatterns()
        });
        return;
    }
    setBackgroundDegradationConfig({
        enabled: backgroundDegradation.enabled === true,
        degradationMap: {
            ...getDefaultDegradationMap(),
            ...normalizeStringRecord(backgroundDegradation.degradationMap)
        },
        detectionPatterns: normalizeStringArray(backgroundDegradation.detectionPatterns).length > 0 ? normalizeStringArray(backgroundDegradation.detectionPatterns) : getDefaultDetectionPatterns()
    });
}
async function applyCliCompatProvidersSection(cliCompatProviders) {
    const { setCliCompatProviders } = await __turbopack_context__.A("[project]/open-sse/config/cliFingerprints.ts [app-route] (ecmascript, async loader)");
    setCliCompatProviders(cliCompatProviders);
}
async function applyCacheControlSection() {
    const { invalidateCacheControlSettingsCache } = await __turbopack_context__.A("[project]/src/lib/cacheControlSettings.ts [app-route] (ecmascript, async loader)");
    invalidateCacheControlSettingsCache();
}
async function applyUsageTrackingSection(newBuffer) {
    const { invalidateBufferTokensCache, setBufferTokensCache } = await __turbopack_context__.A("[project]/open-sse/utils/usageTracking.ts [app-route] (ecmascript, async loader)");
    if (typeof newBuffer === "number" && newBuffer >= 0) {
        // Set the value directly so the first request after a settings save gets the
        // correct count synchronously — no race window back to DEFAULT (2000).
        setBufferTokensCache(newBuffer);
    } else {
        invalidateBufferTokensCache();
    }
}
async function applyThoughtSignatureSection(mode) {
    const { setGeminiThoughtSignatureMode } = await __turbopack_context__.A("[project]/open-sse/services/geminiThoughtSignatureStore.ts [app-route] (ecmascript, async loader)");
    setGeminiThoughtSignatureMode(mode);
}
async function applyCorsOriginsSection(corsOrigins) {
    const { setRuntimeAllowedOrigins } = await __turbopack_context__.A("[project]/src/server/cors/origins.ts [app-route] (ecmascript, async loader)");
    setRuntimeAllowedOrigins(corsOrigins);
}
/**
 * Legacy alias for the v2 systemTransforms config. The `ccBridgeTransforms`
 * settings field carried the single-provider shape `{ enabled, pipeline }`
 * during Phase 2 (commit e3e962db, pre-release). v2 unifies everything under
 * `systemTransforms.providers[*]`. We migrate the legacy shape into the v2
 * registry on every reload so users with persisted Phase-2 data keep working.
 *
 * `setSystemTransformsConfig` accepts both shapes and routes legacy into
 * `providers[PROVIDER_CC_BRIDGE]`.
 */ async function applyCcBridgeTransformsSection(ccBridgeTransforms) {
    const { setSystemTransformsConfig } = await __turbopack_context__.A("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript, async loader)");
    if (ccBridgeTransforms && typeof ccBridgeTransforms === "object") {
        setSystemTransformsConfig(ccBridgeTransforms);
    }
}
/**
 * Swap the in-process bypass policy. Synchronous, O(1), no I/O — the SLA
 * (<50 ms hot-reload) is structurally satisfied by this shape.
 */ function applyAuthzBypassSection(snapshot) {
    currentAuthzBypass = {
        enabled: snapshot.enabled,
        prefixes: [
            ...snapshot.prefixes
        ]
    };
}
async function applySystemTransformsSection(systemTransforms) {
    const { setSystemTransformsConfig, resetSystemTransformsConfig } = await __turbopack_context__.A("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript, async loader)");
    if (systemTransforms === null || systemTransforms === undefined || typeof systemTransforms !== "object") {
        resetSystemTransformsConfig();
        return;
    }
    setSystemTransformsConfig(systemTransforms);
}
async function applyModelsDevSyncSection(previousSnapshot, currentSnapshot, force) {
    const { startPeriodicSync, stopPeriodicSync } = await __turbopack_context__.A("[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript, async loader)");
    const skipBackgroundSyncInTests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])() && process.env.OMNIROUTE_ENABLE_RUNTIME_BACKGROUND_TASKS !== "1" || isTruthyEnvFlag(process.env.OMNIROUTE_DISABLE_BACKGROUND_SERVICES);
    if (skipBackgroundSyncInTests) {
        stopPeriodicSync();
        return;
    }
    const wasEnabled = previousSnapshot.modelsDevSyncEnabled === true;
    const isEnabled = currentSnapshot.modelsDevSyncEnabled === true;
    const intervalChanged = previousSnapshot.modelsDevSyncInterval !== currentSnapshot.modelsDevSyncInterval;
    if (!isEnabled) {
        if (wasEnabled || force) {
            stopPeriodicSync();
        }
        return;
    }
    if (force) {
        stopPeriodicSync();
        startPeriodicSync(currentSnapshot.modelsDevSyncInterval || undefined);
        return;
    }
    if (!wasEnabled) {
        startPeriodicSync(currentSnapshot.modelsDevSyncInterval || undefined);
        return;
    }
    if (intervalChanged) {
        stopPeriodicSync();
        startPeriodicSync(currentSnapshot.modelsDevSyncInterval || undefined);
    }
}
async function applyRuntimeSettings(settings, options = {}) {
    const source = options.source || "runtime";
    const force = options.force === true;
    const hasBootstrappedSnapshot = lastAppliedSnapshot !== null;
    const currentSnapshot = buildRuntimeSettingsSnapshot(settings);
    const previousSnapshot = getPreviousSnapshot();
    const changes = [];
    const markChanged = (section)=>{
        changes.push({
            section,
            source
        });
    };
    const hasChanged = (currentValue, previousValue)=>stableSerialize(currentValue) !== stableSerialize(previousValue);
    if (force || hasChanged(currentSnapshot.payloadRules, previousSnapshot.payloadRules)) {
        await applyPayloadRulesSection(currentSnapshot.payloadRules);
        markChanged("payloadRules");
    }
    if (force || hasChanged(currentSnapshot.modelAliases, previousSnapshot.modelAliases)) {
        await applyModelAliasesSection(currentSnapshot.modelAliases);
        markChanged("modelAliases");
    }
    if (force || hasChanged(currentSnapshot.backgroundDegradation, previousSnapshot.backgroundDegradation)) {
        await applyBackgroundDegradationSection(currentSnapshot.backgroundDegradation);
        markChanged("backgroundDegradation");
    }
    if (force || hasChanged(currentSnapshot.cliCompatProviders, previousSnapshot.cliCompatProviders)) {
        await applyCliCompatProvidersSection(currentSnapshot.cliCompatProviders);
        markChanged("cliCompatProviders");
    }
    if (force || hasChanged(currentSnapshot.alwaysPreserveClientCache, previousSnapshot.alwaysPreserveClientCache)) {
        await applyCacheControlSection();
        markChanged("cacheControl");
    }
    if (force || hasChanged(currentSnapshot.usageTokenBuffer, previousSnapshot.usageTokenBuffer)) {
        const newBuffer = typeof currentSnapshot.usageTokenBuffer === "number" ? currentSnapshot.usageTokenBuffer : null;
        await applyUsageTrackingSection(newBuffer);
        markChanged("usageTracking");
    }
    if (force || currentSnapshot.hideHealthCheckLogs !== previousSnapshot.hideHealthCheckLogs) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearHealthCheckLogCache"])();
        markChanged("healthCheckLogs");
    }
    if (force || hasChanged(currentSnapshot.antigravitySignatureCacheMode, previousSnapshot.antigravitySignatureCacheMode)) {
        await applyThoughtSignatureSection(currentSnapshot.antigravitySignatureCacheMode);
        markChanged("thoughtSignature");
    }
    if (force || hasBootstrappedSnapshot && (currentSnapshot.modelsDevSyncEnabled !== previousSnapshot.modelsDevSyncEnabled || currentSnapshot.modelsDevSyncInterval !== previousSnapshot.modelsDevSyncInterval)) {
        await applyModelsDevSyncSection(previousSnapshot, currentSnapshot, force);
        markChanged("modelsDevSync");
    }
    if (force || hasChanged(currentSnapshot.corsOrigins, previousSnapshot.corsOrigins)) {
        await applyCorsOriginsSection(currentSnapshot.corsOrigins);
        markChanged("corsOrigins");
    }
    if (force || hasChanged(currentSnapshot.ccBridgeTransforms, previousSnapshot.ccBridgeTransforms)) {
        await applyCcBridgeTransformsSection(currentSnapshot.ccBridgeTransforms);
        markChanged("ccBridgeTransforms");
    }
    if (force || hasChanged(currentSnapshot.systemTransforms, previousSnapshot.systemTransforms)) {
        await applySystemTransformsSection(currentSnapshot.systemTransforms);
        markChanged("systemTransforms");
    }
    if (force || hasChanged(currentSnapshot.authzBypass, previousSnapshot.authzBypass)) {
        applyAuthzBypassSection(currentSnapshot.authzBypass);
        markChanged("authzBypass");
    }
    if (force || hasChanged(currentSnapshot.customBannedSignals, previousSnapshot.customBannedSignals)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setCustomBannedSignals"])(currentSnapshot.customBannedSignals);
        markChanged("bannedSignals");
    }
    lastAppliedSnapshot = currentSnapshot;
    return changes;
}
function resetRuntimeSettingsStateForTests() {
    lastAppliedSnapshot = null;
    currentAuthzBypass = DEFAULT_AUTHZ_BYPASS_SNAPSHOT;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_0w5uy_b._.js.map