module.exports = [
"[project]/src/sse/services/headerReader.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readHeaderValue",
    ()=>readHeaderValue
]);
function readHeaderValue(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") {
        const value = headers.get(name) || headers.get(name.toLowerCase());
        return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    }
    const recordHeaders = headers;
    const value = recordHeaders[name] || recordHeaders[name.toLowerCase()] || recordHeaders[name.toUpperCase()];
    if (Array.isArray(value)) {
        return typeof value[0] === "string" && value[0].trim().length > 0 ? value[0].trim() : null;
    }
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
}),
"[project]/src/sse/services/googApiKeyAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractGoogApiKeyHeader",
    ()=>extractGoogApiKeyHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/headerReader.ts [instrumentation] (ecmascript)");
;
function extractGoogApiKeyHeader(headers) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-goog-api-key") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "X-Goog-Api-Key");
}
}),
"[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "debug",
    ()=>debug,
    "error",
    ()=>error,
    "info",
    ()=>info,
    "request",
    ()=>request,
    "warn",
    ()=>warn
]);
/**
 * SSE Logger — Thin wrapper around the shared Pino logger
 * for backward compatibility with existing SSE code.
 *
 * Migrated from direct console logging to structured Pino logging.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [instrumentation] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLogger"])("sse");
function debug(tag, message, data) {
    log.debug({
        tag,
        ...spreadData(data)
    }, message);
}
function info(tag, message, data) {
    log.info({
        tag,
        ...spreadData(data)
    }, message);
}
function warn(tag, message, data) {
    log.warn({
        tag,
        ...spreadData(data)
    }, message);
}
function error(tag, message, data) {
    log.error({
        tag,
        ...spreadData(data)
    }, message);
}
function request(method, path, extra) {
    log.info({
        tag: "HTTP",
        method,
        path,
        ...spreadData(extra)
    }, `📥 ${method} ${path}`);
}
// Helper to spread data into structured fields
function spreadData(data) {
    if (!data) return {};
    if (typeof data === "string") return {
        detail: data
    };
    if (typeof data === "object") return data;
    return {
        detail: String(data)
    };
}
}),
"[project]/src/sse/services/sessionAffinityPin.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applySessionAffinityPin",
    ()=>applySessionAffinityPin,
    "formatSessionKeyForLog",
    ()=>formatSessionKeyForLog,
    "resolveSessionAffinityTtlMs",
    ()=>resolveSessionAffinityTtlMs,
    "selectSessionAffinityConnection",
    ()=>selectSessionAffinityConnection
]);
/**
 * #5903 — session-affinity-pin resolution + TTL, extracted from auth.ts as a
 * pure leaf so the frozen god-file `auth.ts` does not grow.
 *
 * Problem: reset-aware (and other quota-scoring) combo strategies recompute a
 * "winner" connection on every request and hand it to getProviderCredentials
 * as `forcedConnectionId`. That id narrows the connection pool to exactly one
 * connection BEFORE session affinity is consulted, so an existing pin pointing
 * at a previously-selected account is never found and gets silently
 * deleted/re-pinned to the fresh winner — breaking "same session -> reuse
 * pinned account".
 *
 * Fix: when an active, non-expired affinity pin already exists for this
 * (session, provider) AND the pinned connection is still eligible, the pin wins
 * over the freshly recomputed `forcedConnectionId`. If the pin is ineligible
 * (rate-limited / exhausted / model-locked / etc.) the caller keeps its forced
 * connection, so the existing 429-driven `deleteSessionAccountAffinity`
 * failover still owns rotating away from a pin that stops working.
 *
 * This module stays decoupled from auth.ts internals: the three predicates that
 * live in (or would cause a cycle back into) auth.ts —
 * `isTerminalConnectionStatus`, `isCodexScopeUnavailable`, and the quota-policy
 * check wrapping `evaluateQuotaLimitPolicy` — are injected as callbacks.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function formatSessionKeyForLog(sessionKey) {
    return `${sessionKey.slice(0, 18)}...`;
}
function compareLruConnections(a, b) {
    if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
    if (!a.lastUsedAt) return -1;
    if (!b.lastUsedAt) return 1;
    const recencyDelta = new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
    if (recencyDelta !== 0) return recencyDelta;
    if ((a.consecutiveUseCount || 0) !== (b.consecutiveUseCount || 0)) {
        return (a.consecutiveUseCount || 0) - (b.consecutiveUseCount || 0);
    }
    return (a.priority || 999) - (b.priority || 999);
}
async function selectSessionAffinityConnection(provider, sessionKey, connections, ttlMs = 0) {
    if (!sessionKey || connections.length === 0 || ttlMs <= 0) return null;
    const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionAccountAffinity"])(sessionKey, provider, ttlMs);
    if (existing) {
        const connection = connections.find((candidate)=>candidate.id === existing.connectionId);
        if (connection) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["touchSessionAccountAffinity"])(sessionKey, provider, Date.now(), ttlMs);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
                lastUsedAt: new Date().toISOString(),
                consecutiveUseCount: (connection.consecutiveUseCount || 0) + 1
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `session_key=${formatSessionKeyForLog(sessionKey)} -> connection ${connection.id.slice(0, 8)} (affinity)`);
            return connection;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteSessionAccountAffinity"])(sessionKey, provider);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `affinity cleared for session_key=${formatSessionKeyForLog(sessionKey)} provider=${provider}`);
    }
    const connection = [
        ...connections
    ].sort(compareLruConnections)[0] ?? null;
    if (!connection) return null;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["upsertSessionAccountAffinity"])(sessionKey, provider, connection.id, Date.now(), ttlMs);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
        lastUsedAt: new Date().toISOString(),
        consecutiveUseCount: 1
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `new affinity created for session_key=${formatSessionKeyForLog(sessionKey)} -> connection ${connection.id.slice(0, 8)}`);
    return connection;
}
function resolveSessionAffinityTtlMs(_provider, options, settings) {
    const override = Number(options.sessionAffinityTtlMs);
    if (Number.isFinite(override) && override > 0) return override;
    const configured = Number(settings.sessionAffinityTtlMs ?? settings.codexSessionAffinityTtlMs);
    if (Number.isFinite(configured) && configured > 0) return configured;
    return 0;
}
/**
 * Mirrors the eligibility predicates applied later in getProviderCredentials
 * (availableConnections filter + quota policy + quota exhaustion) but scoped to
 * a single candidate connection. Pure/read-only.
 */ function isConnectionEligibleForAffinityPin(connection, params) {
    const { provider, requestedModel, options } = params;
    const allowSuppressed = options.allowSuppressedConnections === true;
    const allowRateLimited = allowSuppressed || options.allowRateLimitedConnections === true;
    if (params.excludedConnectionIds.has(connection.id)) return false;
    if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(requestedModel, connection.providerSpecificData)) {
        return false;
    }
    if (!allowSuppressed) {
        if (!allowRateLimited && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(connection.rateLimitedUntil)) return false;
        if (params.isTerminalConnectionStatus(connection)) return false;
        if (provider === "codex" && params.isCodexScopeUnavailable(connection, requestedModel)) {
            return false;
        }
        if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(provider, connection.id, requestedModel)) return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAccountQuotaExhausted"])(connection.id)) return false;
    if (options.bypassQuotaPolicy !== true && params.isQuotaPolicyBlocked(connection)) return false;
    return true;
}
function applySessionAffinityPin(params) {
    const { forcedConnectionId, options, sessionAffinityTtlMs, connections, provider } = params;
    const sessionKey = options.sessionKey;
    if (!forcedConnectionId || !sessionKey || sessionAffinityTtlMs <= 0) return null;
    const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionAccountAffinity"])(sessionKey, provider, sessionAffinityTtlMs);
    if (!pinned || pinned.connectionId === forcedConnectionId) return null;
    const pinnedConnection = connections.find((conn)=>conn.id === pinned.connectionId);
    if (!pinnedConnection || !isConnectionEligibleForAffinityPin(pinnedConnection, params)) {
        return null;
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["info"]("AUTH", `session affinity pin ${pinned.connectionId.slice(0, 8)}... overrides forcedConnectionId ${forcedConnectionId.slice(0, 8)}... (#5903)`);
    return pinned.connectionId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/noAuthProviderSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isNoAuthProviderBlockedBySettings",
    ()=>isNoAuthProviderBlockedBySettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/noAuthProviders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function isNoAuthProviderBlockedBySettings(providerId) {
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$noAuthProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isProviderBlockedByIdOrAlias"])(providerId, settings.blockedProviders);
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["warn"]("AUTH", `Could not read blocked provider settings for ${providerId}: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/noAuthProxyResolution.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveAccountProxies",
    ()=>resolveAccountProxies,
    "resolveAccountProxiesFromRegistry",
    ()=>resolveAccountProxiesFromRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/mappers.ts [instrumentation] (ecmascript)");
;
;
function normalizeRecord(rec) {
    const host = typeof rec.host === "string" ? rec.host.trim() : "";
    if (!host) return null;
    const username = typeof rec.username === "string" ? rec.username : "";
    const password = typeof rec.password === "string" ? rec.password : "";
    const type = typeof rec.type === "string" && rec.type ? rec.type : "socks5";
    const relayAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRelayProxyType"])(type) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$mappers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractRelayAuth"])(rec.notes) : undefined;
    const resolved = {
        type,
        host,
        port: Number(rec.port) || 0,
        ...username ? {
            username
        } : {},
        ...password ? {
            password
        } : {},
        ...relayAuth ? {
            relayAuth
        } : {}
    };
    return resolved;
}
async function resolveAccountProxies(entries, lookup) {
    if (!Array.isArray(entries)) return [];
    const out = [];
    for (const raw of entries){
        if (!raw || typeof raw !== "object") continue;
        const entry = raw;
        if (typeof entry.fingerprint !== "string") continue;
        // By-id reference (Proxy Pool): resolve to the live record so a pool edit
        // propagates to every referencing account. Unknown/deleted id → direct.
        if (typeof entry.proxyId === "string" && entry.proxyId) {
            let record = null;
            try {
                record = await lookup(entry.proxyId);
            } catch  {
                record = null;
            }
            out.push({
                fingerprint: entry.fingerprint,
                proxy: record ? normalizeRecord(record) : null
            });
            continue;
        }
        // Custom escape hatch / legacy inline proxy: pass through unchanged.
        if (entry.proxy && typeof entry.proxy === "object") {
            out.push({
                fingerprint: entry.fingerprint,
                proxy: normalizeRecord(entry.proxy)
            });
            continue;
        }
        out.push({
            fingerprint: entry.fingerprint,
            proxy: null
        });
    }
    return out;
}
async function resolveAccountProxiesFromRegistry(entries) {
    return resolveAccountProxies(entries, (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProxyById"])(id, {
            includeSecrets: true
        }));
}
}),
"[project]/src/sse/services/noAuthProviderSiblings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNoAuthHydrationProviderIds",
    ()=>getNoAuthHydrationProviderIds
]);
/**
 * #7993 — "OpenCode Free" is served by TWO distinct provider identities that
 * are never unified: the no-auth "opencode" provider (NOAUTH_PROVIDERS,
 * alias "oc" — the id the NoAuthAccountCard UI writes fingerprints +
 * accountProxies onto via a `provider_connections` row) and the
 * "opencode-zen" / "opencode-go" APIKEY_PROVIDERS gateways (which carry
 * `anonymousFallback: true` for the same public endpoint).
 *
 * A model string resolved to the canonical/full prefix ("opencode/<model>")
 * routes to "opencode-zen", not "opencode" (see the #2901 guard in
 * open-sse/services/model.ts). When that happens, credential hydration for
 * "opencode-zen" must still be able to find the user's proxy/fingerprint
 * config, which physically lives on the "opencode" connection row — this
 * sibling map lets `loadNoAuthProviderSpecificData()` look there too.
 */ const NOAUTH_SIBLING_PROVIDER_IDS = {
    "opencode-zen": [
        "opencode"
    ],
    "opencode-go": [
        "opencode"
    ]
};
function getNoAuthHydrationProviderIds(providerId) {
    return [
        providerId,
        ...NOAUTH_SIBLING_PROVIDER_IDS[providerId] || []
    ];
}
}),
"[project]/src/sse/services/requestResourceHealth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getResource404Bypass",
    ()=>getResource404Bypass
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/errorClassifier.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function getResource404Bypass(status, errorText, connectionId, logger) {
    if (status !== 404 || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isResourceNotFoundResponse"])(errorText)) return null;
    logger.info("AUTH", `${connectionId.slice(0, 8)} request-resource 404; skipping model/account cooldown`);
    return {
        shouldFallback: false,
        cooldownMs: 0
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearAccountError",
    ()=>clearAccountError,
    "clearRecoveredProviderState",
    ()=>clearRecoveredProviderState,
    "evaluateQuotaLimitPolicy",
    ()=>evaluateQuotaLimitPolicy,
    "extractApiKey",
    ()=>extractApiKey,
    "extractSessionAffinityKey",
    ()=>extractSessionAffinityKey,
    "getProviderCredentials",
    ()=>getProviderCredentials,
    "getProviderCredentialsWithQuotaPreflight",
    ()=>getProviderCredentialsWithQuotaPreflight,
    "isValidApiKey",
    ()=>isValidApiKey,
    "markAccountUnavailable",
    ()=>markAccountUnavailable,
    "resolveQuotaLimitPolicy",
    ()=>resolveQuotaLimitPolicy
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$googApiKeyAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/googApiKeyAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/lazyConnectionView.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityCredits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/modelLockoutSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/errorClassifier.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/sessionAffinityPin.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/noAuthProviderSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProxyResolution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/noAuthProxyResolution.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSiblings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/noAuthProviderSiblings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/requestResourceHealth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/shuffleDeck.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/sse/services/headerReader.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const MIN_QUOTA_THRESHOLD_PERCENT = 1;
const MAX_QUOTA_THRESHOLD_PERCENT = 100;
const NON_RETRYABLE_MODEL_LOCKOUT_REASONS = new Set([
    "not_found",
    "not_found_local"
]);
// Antigravity Gemini family 429 with no parseable upstream hint: seed the backoff at
// this base. Real upstream Retry-After hints still win — they flow through
// `exactCooldownMs` (usedUpstreamRetryHint), not this base. (#5222)
const ANTIGRAVITY_FAMILY_INFERRED_BASE_COOLDOWN_MS = 30_000;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toNullableNumber(value) {
    if (value === null || value === undefined) return null;
    const parsed = toNumber(value, Number.NaN);
    return Number.isFinite(parsed) ? parsed : null;
}
function toBooleanOrDefault(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
function normalizeSessionKey(value, prefix) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    const trimmed = value.trim();
    if (trimmed.length <= 180 && /^[A-Za-z0-9._:-]+$/.test(trimmed)) {
        return `${prefix}:${trimmed}`;
    }
    return `${prefix}:sha256:${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(trimmed).digest("hex")}`;
}
function extractTextForSessionHash(value) {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        const parts = value.map((item)=>{
            if (typeof item === "string") return item;
            const record = asRecord(item);
            if (typeof record.text === "string") return record.text;
            if (typeof record.content === "string") return record.content;
            return null;
        }).filter(Boolean);
        return parts.length > 0 ? parts.join("\n") : JSON.stringify(value);
    }
    if (value && typeof value === "object") return JSON.stringify(value);
    return null;
}
function getFirstInputText(body) {
    const record = asRecord(body);
    if (record.input !== undefined) {
        if (typeof record.input === "string") return record.input;
        if (Array.isArray(record.input)) {
            for (const item of record.input){
                const itemRecord = asRecord(item);
                const text = extractTextForSessionHash(itemRecord.content ?? item);
                if (text && text.trim().length > 0) return text;
            }
        }
        const text = extractTextForSessionHash(record.input);
        if (text && text.trim().length > 0) return text;
    }
    if (Array.isArray(record.messages)) {
        const userMessage = record.messages.find((message)=>asRecord(message).role === "user");
        const firstMessage = userMessage ?? record.messages[0];
        const text = extractTextForSessionHash(asRecord(firstMessage).content ?? firstMessage);
        if (text && text.trim().length > 0) return text;
    }
    return null;
}
function extractSessionAffinityKey(body, headers) {
    const headerKey = normalizeSessionKey((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-codex-session-id") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-session-id") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(headers, "x-omniroute-session"), "header");
    if (headerKey) return headerKey;
    const record = asRecord(body);
    const metadata = asRecord(record.metadata);
    const explicitKey = normalizeSessionKey(metadata.session_id, "metadata") ?? normalizeSessionKey(metadata.sessionId, "metadata") ?? normalizeSessionKey(record.conversation_id, "conversation") ?? normalizeSessionKey(record.session_id, "session") ?? normalizeSessionKey(record.prompt_cache_key, "prompt-cache");
    if (explicitKey) return explicitKey;
    const inputText = getFirstInputText(body);
    if (!inputText || inputText.trim().length === 0) return null;
    return `input:sha256:${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(inputText.slice(0, 4096)).digest("hex")}`;
}
function getCodexLimitPolicy(providerSpecificData) {
    const policy = asRecord(providerSpecificData.codexLimitPolicy);
    return {
        use5h: toBooleanOrDefault(policy.use5h, true),
        useWeekly: toBooleanOrDefault(policy.useWeekly, true)
    };
}
function normalizeQuotaThreshold(value, fallback = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_QUOTA_THRESHOLD_PERCENT"]) {
    const parsed = toNumber(value, fallback);
    return Math.min(MAX_QUOTA_THRESHOLD_PERCENT, Math.max(MIN_QUOTA_THRESHOLD_PERCENT, parsed));
}
function normalizeWindowName(windowName) {
    if (typeof windowName !== "string") return null;
    const normalized = windowName.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function uniqueWindows(windows) {
    return [
        ...new Set(windows)
    ];
}
function normalizeCodexWindowName(windowName) {
    if (typeof windowName !== "string") return null;
    const normalized = windowName.trim().toLowerCase();
    if (normalized === "session (5h)" || normalized === "5h" || normalized === "five_hour") {
        return "session";
    }
    if (normalized === "weekly (7d)" || normalized === "7d" || normalized === "seven_day") {
        return "weekly";
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexBaseQuotaWindowName"])(normalized);
}
function applyCodexWindowPolicy(rawWindows, providerSpecificData) {
    const codexPolicy = getCodexLimitPolicy(providerSpecificData);
    const normalizedRaw = rawWindows.map(normalizeCodexWindowName).filter(Boolean);
    // Preserve explicitly configured custom windows, but enforce canonical Codex windows
    // from toggles so weekly exhaustion is never skipped when useWeekly=true.
    let windows = [
        ...normalizedRaw
    ];
    windows = windows.filter((windowName)=>{
        if (windowName === "session") return codexPolicy.use5h;
        if (windowName === "weekly") return codexPolicy.useWeekly;
        return true;
    });
    if (codexPolicy.use5h) windows.push("session");
    if (codexPolicy.useWeekly) windows.push("weekly");
    return uniqueWindows(windows);
}
function getCodexScopeRateLimitedUntil(providerSpecificData, model) {
    if (!model) return null;
    const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model);
    const scopeMap = asRecord(providerSpecificData.codexScopeRateLimitedUntil);
    const value = scopeMap[scope];
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function isCodexScopeUnavailable(connection, model) {
    const until = getCodexScopeRateLimitedUntil(connection.providerSpecificData, model);
    if (!until) return false;
    return new Date(until).getTime() > Date.now();
}
function getEarliestCodexScopeRateLimitedUntil(connections, model) {
    let earliest = null;
    let earliestMs = Infinity;
    for (const conn of connections){
        const until = getCodexScopeRateLimitedUntil(conn.providerSpecificData, model);
        if (!until) continue;
        const ms = new Date(until).getTime();
        if (!Number.isFinite(ms) || ms <= Date.now()) continue;
        if (ms < earliestMs) {
            earliest = until;
            earliestMs = ms;
        }
    }
    return earliest;
}
function normalizeStatus(value) {
    return (value || "").trim().toLowerCase();
}
function isTerminalConnectionStatus(connection) {
    const status = normalizeStatus(connection.testStatus);
    return status === "credits_exhausted" || status === "banned" || status === "expired";
}
// #8200: cookie-auth providers (perplexity-web, grok-web, ...) use a rotating browser
// session, not a static API key — a 401 means "session needs a refresh", not "dead".
function isRecoverableCookieAuth401(provider, providerErrorType) {
    return providerErrorType !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].ACCOUNT_DEACTIVATED && provider != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider) in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"];
}
function resolveTerminalConnectionStatus(status, result, providerErrorType = null, provider = null) {
    if (result.creditsExhausted || status === 402) return "credits_exhausted";
    if (providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].PROJECT_ROUTE_ERROR || providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].OAUTH_INVALID_TOKEN) {
        return null;
    }
    if (result.permanent || providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].FORBIDDEN) {
        return "banned";
    }
    if ((providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].ACCOUNT_DEACTIVATED || providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].UNAUTHORIZED || status === 401) && !isRecoverableCookieAuth401(provider, providerErrorType)) {
        return "expired";
    }
    return null;
}
function resolveQuotaLimitPolicy(provider, providerSpecificData) {
    const rawPolicy = asRecord(providerSpecificData.limitPolicy);
    const rawWindows = Array.isArray(rawPolicy.windows) ? rawPolicy.windows : [];
    const windows = rawWindows.map(normalizeWindowName).filter(Boolean);
    if (provider === "codex") {
        const defaultWindows = applyCodexWindowPolicy(windows, providerSpecificData);
        const enabled = toBooleanOrDefault(rawPolicy.enabled, defaultWindows.length > 0);
        return {
            enabled,
            thresholdPercent: normalizeQuotaThreshold(rawPolicy.thresholdPercent),
            windows: defaultWindows
        };
    }
    return {
        enabled: toBooleanOrDefault(rawPolicy.enabled, false),
        thresholdPercent: normalizeQuotaThreshold(rawPolicy.thresholdPercent),
        windows
    };
}
function evaluateQuotaLimitPolicy(provider, connection, requestedModel = null) {
    const policy = resolveQuotaLimitPolicy(provider, connection.providerSpecificData);
    if (!policy.enabled || policy.windows.length === 0) {
        return {
            blocked: false,
            reasons: [],
            resetAt: null
        };
    }
    const reasons = [];
    const resetCandidates = [];
    for (const windowName of policy.windows){
        const effectiveWindowName = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexScopedQuotaWindowName"])(windowName, requestedModel) : windowName;
        const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaWindowStatus"])(connection.id, effectiveWindowName, policy.thresholdPercent);
        if (!status?.reachedThreshold) continue;
        reasons.push(`${effectiveWindowName} usage ${Math.round(status.usedPercentage)}%`);
        resetCandidates.push(status.resetAt);
    }
    return {
        blocked: reasons.length > 0,
        reasons,
        resetAt: getEarliestFutureDate(resetCandidates)
    };
}
function parseFutureDateMs(value) {
    if (!value) return null;
    // Tolerate numeric-epoch strings (e.g. "1781696905131.0") as well as ISO
    // strings — the rate_limited_until TEXT column can hold either (#3954).
    const ms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cooldownUntilMs"])(value);
    if (!Number.isFinite(ms) || ms <= Date.now()) return null;
    return ms;
}
function getEarliestFutureDate(candidates) {
    return candidates.map((candidate)=>({
            raw: candidate,
            ms: parseFutureDateMs(candidate)
        })).filter((entry)=>entry.ms !== null).sort((a, b)=>a.ms - b.ms)[0]?.raw || null;
}
function getCachedQuotaResetAt(connectionId) {
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaCache"])(connectionId);
    if (!entry?.quotas) return null;
    return getEarliestFutureDate(Object.values(entry.quotas).map((quota)=>quota.resetAt));
}
function isRetryableModelLockoutReason(reason) {
    return typeof reason === "string" && reason.length > 0 ? !NON_RETRYABLE_MODEL_LOCKOUT_REASONS.has(reason) : false;
}
function pushClampedPercentage(percentages, value) {
    if (Number.isFinite(value)) {
        percentages.push(Math.max(0, Math.min(100, value)));
    }
}
function isResetAtInPast(resetAt) {
    if (!resetAt) return false;
    const resetMs = new Date(resetAt).getTime();
    return Number.isFinite(resetMs) && resetMs <= Date.now();
}
function collectPolicyQuotaHeadroomPercentages(provider, connection, policy, requestedModel) {
    const percentages = [];
    const seenWindows = new Set();
    for (const windowName of policy.windows){
        const scopedWindow = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexScopedQuotaWindowName"])(windowName, requestedModel) : windowName;
        const normalizedWindow = normalizeWindowName(scopedWindow);
        if (!normalizedWindow || seenWindows.has(normalizedWindow)) continue;
        seenWindows.add(normalizedWindow);
        const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaWindowStatus"])(connection.id, normalizedWindow, policy.thresholdPercent);
        if (status) pushClampedPercentage(percentages, status.remainingPercentage);
    }
    return percentages;
}
function collectCachedQuotaHeadroomPercentages(provider, connection, requestedModel) {
    const quotaEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaCache"])(connection.id);
    const rawQuotas = quotaEntry?.quotas || {};
    const codexWindowFilter = provider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexQuotaWindowFilterForModel"])(requestedModel) : undefined;
    const percentages = [];
    for (const [quotaName, quota] of Object.entries(rawQuotas)){
        if (codexWindowFilter && !codexWindowFilter(quotaName)) continue;
        if (!quota || isResetAtInPast(toStringOrNull(quota.resetAt))) continue;
        pushClampedPercentage(percentages, toNumber(quota.remainingPercentage, Number.NaN));
    }
    return percentages;
}
function getConnectionQuotaHeadroomPercent(provider, connection, requestedModel = null) {
    const policy = resolveQuotaLimitPolicy(provider, connection.providerSpecificData);
    const policyPercentages = collectPolicyQuotaHeadroomPercentages(provider, connection, policy, requestedModel);
    const percentages = policyPercentages.length > 0 ? policyPercentages : collectCachedQuotaHeadroomPercentages(provider, connection, requestedModel);
    return percentages.length > 0 ? Math.min(...percentages) : null;
}
function getConnectionErrorPenalty(connection) {
    const errorType = normalizeStatus(connection.lastErrorType);
    const errorSource = normalizeStatus(connection.lastErrorSource);
    const numericErrorCode = toNumber(connection.errorCode, 0);
    let penalty = 0;
    if (connection.lastError) penalty += 6;
    if (errorType === "rate_limited" || errorType === "quota_exhausted" || errorType === "quota" || numericErrorCode === 429) {
        penalty += 24;
    } else if (numericErrorCode === 401 || numericErrorCode === 403 || errorSource === "oauth") {
        penalty += 18;
    } else if (numericErrorCode >= 500) {
        penalty += 10;
    }
    return penalty;
}
function getConnectionRecencyPenalty(connection) {
    if (!connection.lastUsedAt) return 0;
    const ageMs = Date.now() - new Date(connection.lastUsedAt).getTime();
    if (!Number.isFinite(ageMs)) return 0;
    if (ageMs < 15_000) return 3;
    if (ageMs < 60_000) return 2;
    if (ageMs < 5 * 60_000) return 1;
    return 0;
}
function getP2CConnectionScore(provider, connection, requestedModel = null, quotaResults) {
    let quotaBlocked;
    let quotaExhausted;
    if (connection.id && quotaResults?.has(connection.id)) {
        const cached = quotaResults.get(connection.id);
        quotaBlocked = cached.blocked;
        quotaExhausted = cached.exhausted;
    } else {
        quotaBlocked = evaluateQuotaLimitPolicy(provider, connection, requestedModel).blocked;
        quotaExhausted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isQuotaExhaustedForRequest"])(connection.id, provider, requestedModel);
    }
    const quotaHeadroomPercent = getConnectionQuotaHeadroomPercent(provider, connection, requestedModel);
    let quotaPenalty = 0;
    if (quotaHeadroomPercent !== null) {
        quotaPenalty += Math.round((100 - quotaHeadroomPercent) / 8);
        if (quotaHeadroomPercent <= 10) quotaPenalty += 10;
        else if (quotaHeadroomPercent <= 25) quotaPenalty += 4;
    } else if (!quotaBlocked && !quotaExhausted) {
        quotaPenalty += 4;
    }
    const score = (quotaExhausted ? 200 : 0) + (quotaBlocked ? 80 : 0) + getConnectionErrorPenalty(connection) + Math.min(40, (connection.backoffLevel || 0) * 8) + quotaPenalty + Math.min(12, (connection.consecutiveUseCount || 0) * 2) + getConnectionRecencyPenalty(connection) + Math.min(6, Math.max(0, connection.priority || 0) - 1);
    return {
        score,
        quotaHeadroomPercent
    };
}
function compareP2CConnections(provider, a, b, requestedModel = null, quotaResults) {
    const aScore = getP2CConnectionScore(provider, a, requestedModel, quotaResults);
    const bScore = getP2CConnectionScore(provider, b, requestedModel, quotaResults);
    if (aScore.score !== bScore.score) {
        return aScore.score - bScore.score;
    }
    const aHeadroom = aScore.quotaHeadroomPercent ?? -1;
    const bHeadroom = bScore.quotaHeadroomPercent ?? -1;
    if (aHeadroom !== bHeadroom) {
        return bHeadroom - aHeadroom;
    }
    if ((a.priority || 999) !== (b.priority || 999)) {
        return (a.priority || 999) - (b.priority || 999);
    }
    return a.id.localeCompare(b.id);
}
/**
 * Sentinel connection id used for the synthetic credentials of no-auth /
 * keyless providers. It is NOT a real DB row, so it
 * cannot carry cooldown state — the account-fallback loop must be able to
 * exclude it (#3061), otherwise it gets re-selected forever.
 */ const SYNTHETIC_NOAUTH_CONNECTION_ID = "noauth";
function buildSyntheticNoAuthCredentials(providerSpecificData = {}) {
    return {
        apiKey: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        projectId: null,
        defaultModel: null,
        copilotToken: null,
        providerSpecificData,
        connectionId: SYNTHETIC_NOAUTH_CONNECTION_ID,
        testStatus: "active",
        lastError: null,
        lastErrorType: null,
        lastErrorSource: null,
        errorCode: null,
        rateLimitedUntil: null,
        maxConcurrent: null
    };
}
/** Merge one connection's fingerprints/accountProxies into `hydrated`, first-wins. */ function mergeNoAuthProviderSpecificData(hydrated, conn) {
    const psd = conn.providerSpecificData;
    if (!psd || typeof psd !== "object") return;
    const record = psd;
    if (Array.isArray(record.fingerprints) && !Array.isArray(hydrated.fingerprints)) {
        hydrated.fingerprints = record.fingerprints;
    }
    if (Array.isArray(record.accountProxies) && !Array.isArray(hydrated.accountProxies)) {
        hydrated.accountProxies = record.accountProxies;
    }
}
/**
 * #4954 / #5217 (Gap 1) — no-auth providers persist a connection row whose
 * `providerSpecificData` carries `fingerprints` + `accountProxies`. Hydrate those
 * and resolve by-id Proxy Pool references to live records (./noAuthProxyResolution)
 * so the executor gets a resolved inline `proxy`. Best-effort: failures → empty.
 *
 * #7993: also checks sibling ids (e.g. "opencode-zen" -> "opencode") so a
 * proxy/fingerprint row saved under the no-auth id is still found when
 * credentials are hydrated for the apikey-gateway id that shares its public
 * endpoint.
 */ async function loadNoAuthProviderSpecificData(providerId) {
    try {
        const providerIdsToQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSiblings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNoAuthHydrationProviderIds"])(providerId);
        const hydrated = {};
        for (const pid of providerIdsToQuery){
            const connectionsRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
                provider: pid
            });
            const connections = (Array.isArray(connectionsRaw) ? connectionsRaw : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderConnection"]);
            for (const conn of connections)mergeNoAuthProviderSpecificData(hydrated, conn);
        }
        if (Array.isArray(hydrated.accountProxies)) {
            hydrated.accountProxies = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProxyResolution$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountProxiesFromRegistry"])(hydrated.accountProxies);
        }
        return hydrated;
    } catch  {
        return {};
    }
}
function providerCanUseSyntheticNoAuthFallback(providerId) {
    const providerDef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(providerId);
    const noAuthProviderDef = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"][providerId];
    const webCookieProviderDef = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][providerId];
    return providerDef?.anonymousFallback === true || noAuthProviderDef?.noAuth === true || webCookieProviderDef?.noAuth === true;
}
async function maybeSyntheticNoAuthFallback(providerId, excludedConnectionIds) {
    if (!providerCanUseSyntheticNoAuthFallback(providerId)) return null;
    if (excludedConnectionIds.has(SYNTHETIC_NOAUTH_CONNECTION_ID)) return null;
    // #4954: hydrate per-account proxy/rotation config off the connection row so
    // no-auth executors (opencode, mimocode) actually honor configured proxies.
    const providerSpecificData = await loadNoAuthProviderSpecificData(providerId);
    return buildSyntheticNoAuthCredentials(providerSpecificData);
}
function normalizeExcludedConnectionIds(excludeConnectionId, extraExcludedConnectionIds) {
    const normalized = new Set();
    if (typeof excludeConnectionId === "string" && excludeConnectionId.trim().length > 0) {
        normalized.add(excludeConnectionId.trim());
    }
    if (Array.isArray(extraExcludedConnectionIds)) {
        for (const connectionId of extraExcludedConnectionIds){
            if (typeof connectionId === "string" && connectionId.trim().length > 0) {
                normalized.add(connectionId.trim());
            }
        }
    }
    return normalized;
}
function formatConnectionPrefixesForLog(ids, max = 6) {
    const prefixes = Array.from(ids).filter((id)=>typeof id === "string" && id.length > 0).slice(0, max).map((id)=>`${id.slice(0, 8)}...`);
    return prefixes.length > 0 ? prefixes.join(",") : "none";
}
function buildQuotaPreflightRateLimitedResult(provider, blockedByPreflight) {
    const retryAfter = getEarliestFutureDate(blockedByPreflight.map((entry)=>entry.resetAt ?? null)) || new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const blockedSummary = blockedByPreflight.map((entry)=>{
        const percent = Number.isFinite(entry.quotaPercent) ? `${Math.round(entry.quotaPercent * 100)}%` : "quota exhausted";
        return `${entry.id.slice(0, 8)}(${percent})`;
    }).join("; ");
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | quota preflight filtered account(s): ${blockedSummary}`);
    return {
        allRateLimited: true,
        retryAfter,
        retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(retryAfter),
        lastError: `All ${provider} accounts blocked by quota preflight`,
        lastErrorCode: 429
    };
}
function quotaPreflightUnavailableUntil(resetAt) {
    const resetMs = parseFutureDateMs(resetAt ?? null);
    return new Date(resetMs ?? Date.now() + 5 * 60 * 1000).toISOString();
}
async function markQuotaPreflightAccountUnavailable(provider, connectionId, preflight, requestedModel) {
    const unavailableUntil = quotaPreflightUnavailableUntil(preflight.resetAt ?? null);
    const percentLabel = Number.isFinite(preflight.quotaPercent) ? `${Math.round(preflight.quotaPercent * 100)}%` : "exhausted";
    const modelLabel = requestedModel ? ` for ${requestedModel}` : "";
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
        rateLimitedUntil: unavailableUntil,
        testStatus: "unavailable",
        lastError: `Quota preflight blocked${modelLabel}: ${percentLabel}`,
        lastErrorType: "quota_exhausted",
        lastErrorSource: "quota_preflight",
        errorCode: 429,
        lastErrorAt: new Date().toISOString()
    });
    return unavailableUntil;
}
// Provider-scoped mutexes prevent race conditions during account selection without
// serializing unrelated providers behind a single global lock.
const selectionMutexes = new Map();
function getSelectionMutexKey(provider, options) {
    return [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider) || provider,
        options.forcedConnectionId ? `forced:${options.forcedConnectionId}` : "pool"
    ].join(":");
}
function createSelectionLock(key) {
    const currentMutex = selectionMutexes.get(key) ?? Promise.resolve();
    let resolveMutex;
    const nextMutex = new Promise((resolve)=>{
        resolveMutex = resolve;
    });
    selectionMutexes.set(key, nextMutex);
    return {
        wait: currentMutex,
        release: ()=>{
            resolveMutex?.();
            if (selectionMutexes.get(key) === nextMutex) {
                selectionMutexes.delete(key);
            }
        }
    };
}
// ─── Anti-Thundering Herd: per-connection mutex for markAccountUnavailable ───
// Prevents multiple concurrent requests from marking the same connection
// unavailable in parallel, which was the root cause of cascading 502 lockouts.
const markMutexes = new Map();
;
;
const PROVIDER_SEARCH_PAIRS = [
    [
        "nvidia",
        "nvidia_nim"
    ],
    [
        "kimi-coding",
        "kimi-coding-apikey"
    ],
    [
        "antigravity",
        "agy"
    ]
];
/**
 * Resolve provider aliases (e.g., nvidia -> nvidia_nim) for DB lookup
 */ async function getProviderSearchPool(provider) {
    const canonicalProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider);
    const canonicalAlias = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(canonicalProvider);
    const pair = PROVIDER_SEARCH_PAIRS.find((aliases)=>aliases.includes(provider));
    if (pair) return pair[0] === provider ? pair : [
        pair[1],
        pair[0]
    ];
    const searchPool = new Set([
        provider,
        canonicalProvider,
        canonicalAlias
    ].filter(Boolean));
    // Built-in providers already resolve through static ids/aliases. Only
    // compatible/custom providers need provider_nodes expansion back to the
    // generated internal connection ids. (#3058)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(canonicalProvider)) {
        return Array.from(searchPool);
    }
    // Custom provider nodes are referenced by user-facing prefixes in combos
    // (for example "78code/gpt-5.4"), but live credentials are stored under
    // internal provider ids like openai-compatible-responses-<uuid>.
    try {
        const providerNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])();
        for (const node of Array.isArray(providerNodes) ? providerNodes : []){
            const nodeRecord = asRecord(node);
            const nodePrefix = typeof nodeRecord.prefix === "string" ? nodeRecord.prefix.trim() : "";
            const nodeId = typeof nodeRecord.id === "string" ? nodeRecord.id.trim() : "";
            if (!nodePrefix || !nodeId) continue;
            if (nodePrefix === provider || nodePrefix === canonicalProvider || nodePrefix === canonicalAlias) {
                searchPool.add(nodeId);
            }
        }
    } catch  {
    // Best-effort alias expansion only.
    }
    return Array.from(searchPool);
}
async function getProviderCredentials(provider, excludeConnectionId = null, allowedConnections = null, requestedModel = null, options = {}) {
    const selectionLock = createSelectionLock(getSelectionMutexKey(provider, options));
    try {
        await selectionLock.wait;
        // No-auth providers (e.g. opencode) need no DB connection — return synthetic credentials
        // so the executor receives a valid credentials object without auth headers being added.
        const resolvedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider);
        const providerMaps = [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"]
        ];
        if (providerMaps.some((map)=>map[resolvedId]?.noAuth)) {
            if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$noAuthProviderSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isNoAuthProviderBlockedBySettings"])(resolvedId)) return null;
            // #3061: there is only one synthetic "noauth" connection for a no-auth
            // provider. If the caller already tried and excluded it (account-fallback
            // after a persistent upstream error), do NOT hand it back — that would let
            // the chat fallback loop re-select "noauth" forever (no real DB row → no
            // cooldown to brake it), writing logs every iteration until the disk fills.
            // Returning null here lets the handler stop after a single attempt.
            const excludedForNoAuth = normalizeExcludedConnectionIds(excludeConnectionId, options.excludeConnectionIds);
            return await maybeSyntheticNoAuthFallback(resolvedId, excludedForNoAuth);
        }
        const allowSuppressedConnections = options.allowSuppressedConnections === true;
        const allowRateLimitedConnections = allowSuppressedConnections || options.allowRateLimitedConnections === true;
        const bypassQuotaPolicy = options.bypassQuotaPolicy === true;
        let forcedConnectionId = typeof options.forcedConnectionId === "string" && options.forcedConnectionId.trim().length > 0 ? options.forcedConnectionId.trim() : null;
        const excludedConnectionIds = normalizeExcludedConnectionIds(excludeConnectionId, options.excludeConnectionIds);
        // Fetched early so the session-affinity-pin override (#5903) can consult
        // the TTL before forcedConnectionId narrows the connection pool.
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const sessionAffinityTtlMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveSessionAffinityTtlMs"])(provider, options, settings);
        // Fix #922: Check for aliases (nvidia/nvidia_nim) to ensure credentials are found
        const providersToSearch = await getProviderSearchPool(provider);
        const connectionResults = await Promise.all(providersToSearch.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedRawProviderConnections"])({
                provider: p,
                isActive: true
            })));
        const connectionsRaw = connectionResults.filter(Array.isArray).flat();
        let connections = (Array.isArray(connectionsRaw) ? connectionsRaw : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLazyConnectionView"]).filter((conn)=>conn.id.length > 0);
        // allowedConnections: restrict to specific connection IDs (from API key policy, #363)
        if (allowedConnections && allowedConnections.length > 0) {
            connections = connections.filter((conn)=>allowedConnections.includes(conn.id));
        }
        // #5903: an active session-affinity pin outranks a per-request reset-aware
        // forcedConnectionId (see sessionAffinityPin leaf for the full rationale).
        forcedConnectionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applySessionAffinityPin"])({
            forcedConnectionId,
            options,
            sessionAffinityTtlMs,
            connections,
            provider,
            requestedModel,
            excludedConnectionIds,
            isTerminalConnectionStatus,
            isCodexScopeUnavailable,
            isQuotaPolicyBlocked: (c)=>evaluateQuotaLimitPolicy(provider, c, requestedModel).blocked
        }) ?? forcedConnectionId;
        if (forcedConnectionId) {
            connections = connections.filter((conn)=>conn.id === forcedConnectionId);
        }
        const activeConnectionsCount = connections.length;
        const rawConnectionsCount = connectionsRaw.length;
        const blockedByForcedConnection = forcedConnectionId ? rawConnectionsCount - connections.length : 0;
        const blockedByAllowedConnections = allowedConnections && allowedConnections.length > 0 ? Math.max(0, rawConnectionsCount - connections.length - blockedByForcedConnection) : 0;
        const forcedIdForLog = forcedConnectionId ? `${forcedConnectionId.slice(0, 8)}...` : "none";
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | active=${activeConnectionsCount}, excluded=${excludedConnectionIds.size} (${formatConnectionPrefixesForLog(excludedConnectionIds)}), forcedId=${forcedIdForLog}, blocked_forced=${blockedByForcedConnection}, blocked_allowed=${blockedByAllowedConnections}`);
        if (provider === "antigravity" && (forcedConnectionId || allowedConnections?.length)) {
            const reasons = [];
            if (forcedConnectionId) reasons.push(`forcedConnectionId kept ${connections.length}`);
            if (allowedConnections?.length) {
                reasons.push(`allowedConnections=${allowedConnections.length}`);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} selection constrained: ${reasons.join(", ")}`);
        }
        if (connections.length === 0) {
            // Check all connections (including inactive) to see if rate limited
            // Fix #922: Also search aliases here
            const allConnectionsResults = await Promise.all(providersToSearch.map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
                    provider: p
                })));
            let allConnections = allConnectionsResults.filter(Array.isArray).flat().map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderConnection"]).filter((conn)=>conn.id.length > 0);
            if (allowedConnections && allowedConnections.length > 0) {
                allConnections = allConnections.filter((conn)=>allowedConnections.includes(conn.id));
            }
            if (forcedConnectionId) {
                allConnections = allConnections.filter((conn)=>conn.id === forcedConnectionId);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | all connections (incl inactive): ${allConnections.length}`);
            if (allConnections.length > 0) {
                const earliest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEarliestRateLimitedUntil"])(allConnections);
                if (earliest) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `${provider} | all ${allConnections.length} accounts rate limited (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)})`);
                    return {
                        allRateLimited: true,
                        retryAfter: earliest,
                        retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)
                    };
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `${provider} | ${allConnections.length} accounts found but none active`);
                allConnections.forEach((c)=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `  → ${c.id?.slice(0, 8)} | isActive=${c.isActive} | rateLimitedUntil=${c.rateLimitedUntil || "none"} | testStatus=${c.testStatus}`);
                });
                // If every existing connection is in a terminal state (expired/banned/
                // credits_exhausted), surface that as a re-auth signal instead of the
                // generic "No credentials" 400. The classic case is AWS SSO/Kiro
                // refresh tokens hitting their 90-day TTL: all connections flip to
                // is_active=0 with testStatus=banned|expired, and without this branch
                // the dashboard sees a misleading "bad_request" code.
                const terminalConnections = allConnections.filter(isTerminalConnectionStatus);
                if (terminalConnections.length === allConnections.length) {
                    const syntheticFallback = await maybeSyntheticNoAuthFallback(resolvedId, excludedConnectionIds);
                    if (syntheticFallback) return syntheticFallback;
                    const statusCounts = new Map();
                    for (const c of terminalConnections){
                        const key = normalizeStatus(c.testStatus) || "expired";
                        statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
                    }
                    const dominantStatus = [
                        ...statusCounts.entries()
                    ].sort((a, b)=>b[1] - a[1])[0]?.[0] || "expired";
                    return {
                        allExpired: true,
                        expiredCount: terminalConnections.length,
                        expiredStatus: dominantStatus
                    };
                }
            }
            const syntheticFallback = await maybeSyntheticNoAuthFallback(resolvedId, excludedConnectionIds);
            if (syntheticFallback) return syntheticFallback;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `No credentials for ${provider}`);
            return null;
        }
        // Auto-decay backoffLevel for accounts whose rateLimitedUntil has passed.
        // Without this, high backoffLevel permanently deprioritizes accounts even
        // after the rate limit window expires, creating a deadlock where the account
        // needs a successful request to reset but never gets selected.
        for (const c of connections){
            if (c.backoffLevel > 0 && !isTerminalConnectionStatus(c) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(c.rateLimitedUntil)) {
                c.backoffLevel = 0;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetConnectionBackoff"])(c.id).catch(()=>{});
            }
        }
        let modelLockedCount = 0;
        let familyLockedCount = 0;
        const connectionFilterStatus = new Map();
        // Filter out unavailable accounts and excluded connection
        const availableConnections = connections.filter((c)=>{
            if (excludedConnectionIds.has(c.id)) {
                connectionFilterStatus.set(c.id, "excluded");
                return false;
            }
            if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(requestedModel, c.providerSpecificData)) {
                connectionFilterStatus.set(c.id, "modelExcluded");
                return false;
            }
            if (!allowSuppressedConnections) {
                if (!allowRateLimitedConnections && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(c.rateLimitedUntil)) {
                    connectionFilterStatus.set(c.id, "rateLimited");
                    return false;
                }
                if (isTerminalConnectionStatus(c)) {
                    connectionFilterStatus.set(c.id, "terminalStatus");
                    return false;
                }
                if (provider === "codex" && isCodexScopeUnavailable(c, requestedModel)) {
                    connectionFilterStatus.set(c.id, "codexScopeLimited");
                    return false;
                }
                // Per-model lockout: if this specific model/family is locked on this connection, skip it
                if (requestedModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(provider, c.id, requestedModel)) {
                    connectionFilterStatus.set(c.id, "modelLocked");
                    if (provider === "antigravity" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaScopeLabelForProvider"])(provider, requestedModel) === "family") {
                        familyLockedCount += 1;
                    } else {
                        modelLockedCount += 1;
                    }
                    return false;
                }
            }
            connectionFilterStatus.set(c.id, "available");
            return true;
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | available: ${availableConnections.length}/${connections.length}`);
        if (provider === "antigravity") {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} selection candidates model=${requestedModel || "none"}: active=${activeConnectionsCount}, excluded=${excludedConnectionIds.size}, modelLocked=${modelLockedCount}, familyLocked=${familyLockedCount}, eligible=${availableConnections.length}`);
        }
        connections.forEach((c)=>{
            const status = connectionFilterStatus.get(c.id);
            const excluded = status === "excluded";
            const rateLimited = status === "rateLimited";
            const terminalStatus = status === "terminalStatus";
            const codexScopeLimited = status === "codexScopeLimited";
            const modelLocked = status === "modelLocked";
            const modelExcluded = status === "modelExcluded";
            if (excluded || rateLimited) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `  → ${c.id?.slice(0, 8)} | ${excluded ? "excluded" : ""} ${rateLimited ? `rateLimited until ${c.rateLimitedUntil}` : ""}${allowSuppressedConnections && rateLimited ? " (retained for combo live test)" : ""}`);
            } else if (modelExcluded) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `  → ${c.id?.slice(0, 8)} | excluded by per-account model rule for ${requestedModel}`);
            } else if (terminalStatus) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", allowSuppressedConnections ? `  → ${c.id?.slice(0, 8)} | retained terminal status=${c.testStatus} for combo live test` : `  → ${c.id?.slice(0, 8)} | skipped terminal status=${c.testStatus}`);
            } else if (codexScopeLimited) {
                const scopeUntil = getCodexScopeRateLimitedUntil(c.providerSpecificData, requestedModel);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", allowSuppressedConnections ? `  → ${c.id?.slice(0, 8)} | retained codex scope-limited account until ${scopeUntil} for combo live test` : `  → ${c.id?.slice(0, 8)} | codex scope-limited until ${scopeUntil}`);
            } else if (modelLocked) {
                const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelLockoutInfo"])(provider, c.id, requestedModel);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", allowSuppressedConnections ? `  → ${c.id?.slice(0, 8)} | retained model lockout for ${requestedModel} (${lockout?.remainingMs || 0}ms remaining) for combo live test` : `  → ${c.id?.slice(0, 8)} | model-locked for ${requestedModel} (${lockout?.remainingMs || 0}ms remaining)`);
            }
        });
        if (availableConnections.length === 0) {
            const cooldownStates = connections.map((connection)=>{
                const connectionCooldownMs = parseFutureDateMs(connection.rateLimitedUntil);
                const codexScopeCooldownMs = provider === "codex" ? parseFutureDateMs(getCodexScopeRateLimitedUntil(connection.providerSpecificData, requestedModel)) : null;
                const modelLockout = requestedModel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelLockoutInfo"])(provider, connection.id, requestedModel) : null;
                const retryableModelCooldownMs = modelLockout && modelLockout.remainingMs > 0 && isRetryableModelLockoutReason(modelLockout.reason) ? Date.now() + modelLockout.remainingMs : null;
                return {
                    connection,
                    connectionCooldownMs,
                    codexScopeCooldownMs,
                    retryableModelCooldownMs
                };
            });
            const cooldownCandidates = cooldownStates.flatMap((state)=>{
                const candidates = [];
                if (state.connectionCooldownMs !== null) {
                    candidates.push({
                        ms: state.connectionCooldownMs,
                        connection: state.connection
                    });
                }
                if (state.codexScopeCooldownMs !== null) {
                    candidates.push({
                        ms: state.codexScopeCooldownMs,
                        connection: state.connection
                    });
                }
                if (state.retryableModelCooldownMs !== null) {
                    candidates.push({
                        ms: state.retryableModelCooldownMs,
                        connection: state.connection
                    });
                }
                return candidates;
            }).sort((a, b)=>a.ms - b.ms);
            const allBlockedByModelCooldown = Boolean(requestedModel) && cooldownStates.length > 0 && cooldownStates.every((state)=>{
                const hasModelSpecificCooldown = state.codexScopeCooldownMs !== null || state.retryableModelCooldownMs !== null;
                return hasModelSpecificCooldown && state.connectionCooldownMs === null;
            });
            const earliestCandidate = cooldownCandidates[0];
            const earliest = earliestCandidate?.ms && Number.isFinite(earliestCandidate.ms) ? new Date(earliestCandidate.ms).toISOString() : null;
            if (earliest) {
                const earliestConn = earliestCandidate?.connection;
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", allBlockedByModelCooldown ? `${provider} | all ${connections.length} active accounts cooling down for model ${requestedModel} (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)}) | lastErrorCode=${earliestConn?.errorCode}, lastError=${earliestConn?.lastError?.slice(0, 50)}` : `${provider} | all ${connections.length} active accounts rate limited (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest)}) | lastErrorCode=${earliestConn?.errorCode}, lastError=${earliestConn?.lastError?.slice(0, 50)}`);
                return {
                    allRateLimited: true,
                    retryAfter: earliest,
                    retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(earliest),
                    lastError: earliestConn?.lastError || null,
                    lastErrorCode: allBlockedByModelCooldown ? 429 : earliestConn?.errorCode || null,
                    cooldownScope: allBlockedByModelCooldown ? "model" : "connection",
                    cooldownModel: allBlockedByModelCooldown ? requestedModel : null,
                    connectionsCount: connections.length
                };
            }
            const syntheticFallback = await maybeSyntheticNoAuthFallback(resolvedId, excludedConnectionIds);
            if (syntheticFallback) return syntheticFallback;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.warn("AUTH", `${provider} | all ${connections.length} accounts unavailable`);
            return null;
        }
        let policyEligibleConnections = availableConnections;
        const blockedByPolicy = [];
        const quotaResults = new Map();
        if (!bypassQuotaPolicy) {
            policyEligibleConnections = availableConnections.filter((connection)=>{
                const evaluation = evaluateQuotaLimitPolicy(provider, connection, requestedModel);
                quotaResults.set(connection.id, {
                    blocked: evaluation.blocked,
                    exhausted: false
                });
                if (!evaluation.blocked) return true;
                blockedByPolicy.push({
                    id: connection.id,
                    reasons: evaluation.reasons,
                    resetAt: evaluation.resetAt
                });
                return false;
            });
        } else if (availableConnections.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} | bypassing cached quota policy for this request`);
        }
        if (blockedByPolicy.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | quota policy filtered ${blockedByPolicy.length} account(s): ${blockedByPolicy.map((entry)=>`${entry.id.slice(0, 8)}(${entry.reasons.join(", ")})`).join("; ")}`);
        }
        if (policyEligibleConnections.length === 0 && availableConnections.length > 0) {
            const earliestResetAt = getEarliestFutureDate(blockedByPolicy.map((entry)=>entry.resetAt));
            const earliestResetMs = parseFutureDateMs(earliestResetAt);
            const retryAfter = earliestResetMs ? new Date(earliestResetMs).toISOString() : new Date(Date.now() + 5 * 60 * 1000).toISOString();
            return {
                allRateLimited: true,
                retryAfter,
                retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(retryAfter),
                lastError: `All ${provider} accounts reached configured quota threshold`,
                lastErrorCode: 429
            };
        }
        // Quota-aware: partition accounts with and without quota for the requested scope.
        const withQuota = [];
        const exhaustedQuota = [];
        for (const c of policyEligibleConnections){
            const exhausted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isQuotaExhaustedForRequest"])(c.id, provider, requestedModel);
            const existing = quotaResults.get(c.id);
            if (existing) existing.exhausted = exhausted;
            if (!exhausted) {
                withQuota.push(c);
            } else {
                exhaustedQuota.push(c);
            }
        }
        if (exhaustedQuota.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | quota-aware: ${withQuota.length} with quota, skipping ${exhaustedQuota.length} exhausted`);
        }
        if (withQuota.length === 0 && exhaustedQuota.length > 0) {
            // All remaining eligible accounts are exhausted
            const earliestResetAt = getEarliestFutureDate(exhaustedQuota.map((c)=>{
                const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaCache"])(c.id);
                return entry?.nextResetAt || null;
            }));
            const earliestResetMs = parseFutureDateMs(earliestResetAt);
            const retryAfter = earliestResetMs ? new Date(earliestResetMs).toISOString() : new Date(Date.now() + 5 * 60 * 1000).toISOString();
            return {
                allRateLimited: true,
                retryAfter,
                retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(retryAfter),
                lastError: `All ${provider} accounts have exhausted their quota`,
                lastErrorCode: 429
            };
        }
        const orderedConnections = withQuota;
        const providerStrategyOverrides = settings.providerStrategies || {};
        const providerOverride = providerStrategyOverrides[resolvedId] || {};
        const strategy = providerOverride.fallbackStrategy || settings.fallbackStrategy || "fill-first";
        let connection;
        const affinityConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectSessionAffinityConnection"])(provider, options.sessionKey, orderedConnections, sessionAffinityTtlMs);
        if (affinityConnection) {
            connection = affinityConnection;
        } else if (options.sessionKey) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `session_key=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$sessionAffinityPin$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["formatSessionKeyForLog"])(options.sessionKey)} has no available affinity target`);
        }
        if (connection) {
        // Session affinity selected a connection before global sticky routing.
        } else if (strategy === "round-robin") {
            const stickyLimit = toNumber(providerOverride.stickyRoundRobinLimit ?? settings.stickyRoundRobinLimit, 3);
            // If excluding account(s) (fallback scenario), skip sticky logic and go straight to LRU.
            // This prevents same-model retries from getting stuck on a failed account.
            const isFallbackScenario = excludeConnectionId !== null || excludedConnectionIds.size > 0;
            if (!isFallbackScenario) {
                // Sort by lastUsed (most recent first) to find current candidate
                const byRecency = [
                    ...orderedConnections
                ].sort((a, b)=>{
                    if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                    if (!a.lastUsedAt) return 1;
                    if (!b.lastUsedAt) return -1;
                    return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
                });
                const current = byRecency[0];
                const currentCount = current?.consecutiveUseCount || 0;
                if (current && current.lastUsedAt && currentCount < stickyLimit) {
                    // Stay with current account
                    connection = current;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} round-robin: staying with ${current.id?.slice(0, 8)}... (count=${currentCount}/${stickyLimit})`);
                    // Update lastUsedAt and increment count (await to ensure persistence)
                    const nextCount = (connection.consecutiveUseCount || 0) + 1;
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["touchConnectionLastUsed"])(connection.id, nextCount);
                    // Sync raw cache row so subsequent calls within TTL see fresh stats
                    for (const r of connectionsRaw){
                        if (r.id === connection.id) {
                            r.lastUsedAt = new Date().toISOString();
                            r.consecutiveUseCount = nextCount;
                            break;
                        }
                    }
                } else {
                    // Pick the least recently used (excluding current if possible)
                    // Also penalize accounts with high backoffLevel (previously rate-limited)
                    // so they don't get immediately re-selected after cooldown (#340)
                    const sortedByOldest = [
                        ...orderedConnections
                    ].sort((a, b)=>{
                        // Penalize previously rate-limited accounts (backoffLevel > 0)
                        const aBackoff = a.backoffLevel || 0;
                        const bBackoff = b.backoffLevel || 0;
                        if (aBackoff !== bBackoff) return aBackoff - bBackoff; // lower backoff first
                        if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                        if (!a.lastUsedAt) return -1;
                        if (!b.lastUsedAt) return 1;
                        return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
                    });
                    connection = sortedByOldest[0];
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.debug("AUTH", `${provider} round-robin: switching to LRU ${connection.id?.slice(0, 8)}... (current count=${currentCount} >= limit=${stickyLimit} or no lastUsedAt)`);
                    // Update lastUsedAt and reset count to 1 (await to ensure persistence)
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["touchConnectionLastUsed"])(connection.id, 1);
                    // Sync raw cache row so subsequent calls within TTL see fresh LRU stats
                    for (const r of connectionsRaw){
                        if (r.id === connection.id) {
                            r.lastUsedAt = new Date().toISOString();
                            r.consecutiveUseCount = 1;
                            break;
                        }
                    }
                }
            } else {
                // Fallback scenario: excluded an account due to failure
                // Always pick the least recently used to ensure proper cycling
                // Also penalize accounts with high backoffLevel (#340)
                const sortedByOldest = [
                    ...orderedConnections
                ].sort((a, b)=>{
                    const aBackoff = a.backoffLevel || 0;
                    const bBackoff = b.backoffLevel || 0;
                    if (aBackoff !== bBackoff) return aBackoff - bBackoff;
                    if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                    if (!a.lastUsedAt) return -1;
                    if (!b.lastUsedAt) return 1;
                    return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
                });
                connection = sortedByOldest[0];
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} round-robin: FALLBACK MODE - excluded_count=${excludedConnectionIds.size} excluded=${formatConnectionPrefixesForLog(excludedConnectionIds)} picked_lru=${connection.id?.slice(0, 8)}...`);
                // Update lastUsedAt and reset count to 1 (await to ensure persistence)
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["touchConnectionLastUsed"])(connection.id, 1);
                // Sync raw cache row so subsequent calls within TTL see fresh stats
                for (const r of connectionsRaw){
                    if (r.id === connection.id) {
                        r.lastUsedAt = new Date().toISOString();
                        r.consecutiveUseCount = 1;
                        break;
                    }
                }
            }
        } else if (strategy === "p2c") {
            const candidatePool = withQuota.length > 0 ? withQuota : orderedConnections;
            // Power of Two Choices: sample from the quota-eligible pool and compare
            // health instead of defaulting to random-first selection.
            if (candidatePool.length <= 2) {
                connection = [
                    ...candidatePool
                ].sort((a, b)=>compareP2CConnections(provider, a, b, requestedModel, quotaResults))[0];
            } else {
                const i = parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % candidatePool.length;
                let j = parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % (candidatePool.length - 1);
                if (j >= i) j++;
                const a = candidatePool[i];
                const b = candidatePool[j];
                connection = compareP2CConnections(provider, a, b, requestedModel, quotaResults) <= 0 ? a : b;
            }
        } else if (strategy === "random") {
            // Random: Fisher-Yates-inspired random pick
            const idx = parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % orderedConnections.length;
            connection = orderedConnections[idx];
        } else if (strategy === "least-used") {
            // Least Used: pick the one with oldest lastUsedAt
            const sorted = [
                ...orderedConnections
            ].sort((a, b)=>{
                if (!a.lastUsedAt && !b.lastUsedAt) return (a.priority || 999) - (b.priority || 999);
                if (!a.lastUsedAt) return -1;
                if (!b.lastUsedAt) return 1;
                return new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime();
            });
            connection = sorted[0];
        } else if (strategy === "cost-optimized") {
            // Cost Optimized: sort by priority ascending (lower = cheaper/preferred)
            // Future: can be enhanced with actual cost data per provider
            const sorted = [
                ...orderedConnections
            ].sort((a, b)=>(a.priority || 999) - (b.priority || 999));
            connection = sorted[0];
        } else if (strategy === "strict-random") {
            // Strict Random: shuffle deck — uses each account once before reshuffling
            const ids = orderedConnections.map((c)=>c.id);
            const selectedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getNextFromDeckSync"])(`conn:${provider}`, ids);
            connection = orderedConnections.find((c)=>c.id === selectedId) || orderedConnections[0];
        } else {
            // Default: fill-first (already sorted by priority in getProviderConnections)
            connection = orderedConnections[0];
        }
        if (provider === "antigravity" && connection) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} selected account=${connection.id?.slice(0, 8)}... eligible=${orderedConnections.length} excluded=${excludedConnectionIds.size}`);
        }
        const apiKeyHealth = connection.providerSpecificData?.apiKeyHealth;
        if (apiKeyHealth) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syncHealthFromDB"])(connection.id, apiKeyHealth);
        }
        return {
            apiKey: connection.apiKey,
            accessToken: connection.accessToken,
            refreshToken: connection.refreshToken,
            expiresAt: connection.tokenExpiresAt || connection.expiresAt || null,
            projectId: connection.projectId,
            // #474: surface the connection's configured defaultModel so the chat /
            // embeddings handlers can resolve a bare model name (e.g. an alias that
            // resolved to "auto") to a real provider model ID before the upstream call.
            defaultModel: connection.defaultModel || null,
            copilotToken: typeof connection.providerSpecificData.copilotToken === "string" ? connection.providerSpecificData.copilotToken : null,
            providerSpecificData: connection.providerSpecificData,
            // Fields the generic quota fetcher (open-sse/services/genericQuotaFetcher.ts)
            // needs to delegate to getUsageForProvider for any provider — kept aliased
            // (`id` + `connectionId`) for back-compat with callers that already use the
            // connectionId name.
            id: connection.id,
            provider: connection.provider,
            email: connection.email,
            connectionId: connection.id,
            // Include current status for optimization check
            testStatus: connection.testStatus,
            lastError: connection.lastError,
            lastErrorType: connection.lastErrorType,
            lastErrorSource: connection.lastErrorSource,
            errorCode: connection.errorCode,
            rateLimitedUntil: connection.rateLimitedUntil,
            maxConcurrent: connection.maxConcurrent,
            // Surface per-window quota overrides so the preflight latency gate in
            // getProviderCredentialsWithQuotaPreflight can see them. Without this,
            // user-set cutoffs would silently never enforce.
            quotaWindowThresholds: connection.quotaWindowThresholds ?? null
        };
    } finally{
        selectionLock.release();
    }
}
async function getProviderCredentialsWithQuotaPreflight(provider, excludeConnectionId = null, allowedConnections = null, requestedModel = null, options = {}) {
    // Credits-first requests intentionally skip both cached quota cutoffs and live
    // usage preflight. The user inference itself is the one credit-bearing request;
    // probing normal quota first would spend up to two extra credit calls.
    const bypassQuotaPolicy = options.bypassQuotaPolicy === true || provider === "antigravity" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCreditsMode"])() === "always";
    if (bypassQuotaPolicy) {
        return getProviderCredentials(provider, excludeConnectionId, allowedConnections, requestedModel, {
            ...options,
            bypassQuotaPolicy: true
        });
    }
    const blockedByPreflight = [];
    const excludedConnectionIds = normalizeExcludedConnectionIds(excludeConnectionId, options.excludeConnectionIds);
    const resilience = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])());
    const { defaultThresholdPercent, warnThresholdPercent, providerWindowDefaults } = resilience.quotaPreflight;
    const providerWindowMap = providerWindowDefaults[provider] || {};
    const providerHasDefaults = Object.keys(providerWindowMap).length > 0;
    // The factory default is "block at 2% remaining" — effectively "right
    // before 429." Skipping preflight at that level is a clean no-op. If an
    // operator has raised the global to anything stricter (e.g. 20% remaining
    // = stop at 80% used), preflight needs to run for every connection so the
    // tighter floor is honored.
    const FACTORY_NO_OP_REMAINING_PERCENT = 2;
    const globalDefaultIsRestrictive = defaultThresholdPercent > FACTORY_NO_OP_REMAINING_PERCENT;
    while(true){
        const credentials = await getProviderCredentials(provider, null, allowedConnections, requestedModel, {
            ...options,
            excludeConnectionIds: Array.from(excludedConnectionIds)
        });
        if (!credentials) {
            if (blockedByPreflight.length > 0) {
                return buildQuotaPreflightRateLimitedResult(provider, blockedByPreflight);
            }
            return null;
        }
        if ("allRateLimited" in credentials && credentials.allRateLimited || "allExpired" in credentials && credentials.allExpired) {
            if ("allRateLimited" in credentials && credentials.allRateLimited && blockedByPreflight.length > 0) {
                return buildQuotaPreflightRateLimitedResult(provider, blockedByPreflight);
            }
            return credentials;
        }
        const connectionId = credentials.connectionId;
        if (!connectionId) {
            return credentials;
        }
        // Cascading resolver: per-connection override → per-(provider, window)
        // default → global default. Used per-window when the fetcher exposes
        // multiple windows, and once (with window=null) for single-signal
        // fetchers. The warn fallback is uniform — windows don't need their own
        // warn levels in v1.
        const perConnectionWindowOverrides = credentials.quotaWindowThresholds || {};
        // Latency gate: skip the upstream usage fetch entirely when there's
        // nothing to enforce. Preflight is only worth its cost when at least
        // one of the following is true:
        //   • a per-connection override on this row
        //   • a per-(provider, window) default in resilience settings
        //   • the legacy `quotaPreflightEnabled` flag in providerSpecificData
        //   • the global default is stricter than the factory no-op level
        //     (factory = 2% remaining, basically "right before 429" — anything
        //     stricter means the operator wants enforcement everywhere)
        // Otherwise the resolver would return the factory default for every
        // window, and a near-exhausted account would still be caught by the
        // normal 429 → cooldown path.
        // Explicit per-connection opt-out always wins over global/provider defaults.
        // isQuotaPreflightEnabled is strict-=== true (back-compat), so it returns
        // false for both "not set" and "explicit false" — we need an explicit check
        // here to distinguish them.
        const legacyForceDisable = credentials.providerSpecificData?.quotaPreflightEnabled === false;
        if (legacyForceDisable) return credentials;
        const hasConnectionOverrides = Object.keys(perConnectionWindowOverrides).length > 0;
        const legacyForceEnable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isQuotaPreflightEnabled"])(credentials);
        if (!hasConnectionOverrides && !providerHasDefaults && !legacyForceEnable && !globalDefaultIsRestrictive) {
            return credentials;
        }
        // Returns the minimum-remaining cutoff for a window — matches the
        // dashboard's quota bars so the number the user types in the modal
        // means the same thing as the percentage rendered on the bar.
        const resolveMinRemainingPercent = (windowName)=>{
            if (windowName !== null) {
                const lookupWindowNames = provider === "codex" ? uniqueWindows([
                    windowName,
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toCodexBaseQuotaWindowName"])(windowName)
                ].filter(Boolean)) : [
                    windowName
                ];
                for (const lookupWindowName of lookupWindowNames){
                    const override = perConnectionWindowOverrides[lookupWindowName];
                    if (typeof override === "number") return override;
                    const providerDefault = providerWindowMap[lookupWindowName];
                    if (typeof providerDefault === "number") return providerDefault;
                }
            }
            return defaultThresholdPercent;
        };
        // #6842: openrouter also needs requestedModel, for the :free-window check.
        const modelAwarePreflight = provider === "codex" || provider === "openrouter";
        const preflightCredentials = requestedModel && modelAwarePreflight ? {
            ...credentials,
            requestedModel
        } : credentials;
        const preflight = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["preflightQuota"])(provider, connectionId, preflightCredentials, {
            resolveMinRemainingPercent,
            resolveWarnRemainingPercent: ()=>warnThresholdPercent
        });
        if (preflight.proceed) {
            return credentials;
        }
        const unavailableUntil = await markQuotaPreflightAccountUnavailable(provider, connectionId, preflight, requestedModel);
        blockedByPreflight.push({
            id: connectionId,
            quotaPercent: preflight.quotaPercent,
            resetAt: unavailableUntil
        });
        excludedConnectionIds.add(connectionId);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${provider} | preflight blocked ${connectionId.slice(0, 8)}${Number.isFinite(preflight.quotaPercent) ? ` at ${Math.round(preflight.quotaPercent * 100)}%` : ""} until ${unavailableUntil}`);
    }
}
async function markAccountUnavailable(connectionId, status, errorText, provider = null, model = null, providerProfile = null, options = {}) {
    const currentMutex = markMutexes.get(connectionId) || Promise.resolve();
    let resolveMutex;
    markMutexes.set(connectionId, new Promise((resolve)=>{
        resolveMutex = resolve;
    }));
    try {
        await currentMutex;
        const resourceBypass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$requestResourceHealth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResource404Bypass"])(status, errorText, connectionId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__);
        if (resourceBypass) return resourceBypass;
        // Read current connection to get backoffLevel
        const connectionsRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            provider
        });
        const connections = (Array.isArray(connectionsRaw) ? connectionsRaw : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$lazyConnectionView$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderConnection"]).filter((connection)=>connection.id.length > 0);
        const conn = connections.find((connection)=>connection.id === connectionId);
        const backoffLevel = conn?.backoffLevel || 0;
        // T06/T10/T36: terminal statuses should not be overwritten by transient cooldown state.
        if (conn && isTerminalConnectionStatus(conn)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${connectionId.slice(0, 8)} terminal status=${conn.testStatus}, skipping cooldown overwrite`);
            return {
                shouldFallback: true,
                cooldownMs: 0
            };
        }
        // ─── Anti-Thundering Herd Guard ─────────────────────────────────
        // If this connection was ALREADY marked unavailable by a prior concurrent
        // request (within the mutex window), skip re-marking to avoid resetting
        // the cooldown timer or double-incrementing the backoff level.
        // Uses cooldownUntilMs (not a raw `new Date()`) because `rate_limited_until`
        // can hold a numeric-epoch string (e.g. the Antigravity full-quota path) —
        // see #3954.
        const existingCooldownMs = conn?.rateLimitedUntil ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cooldownUntilMs"])(conn.rateLimitedUntil) : NaN;
        if (Number.isFinite(existingCooldownMs) && existingCooldownMs > Date.now()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${connectionId.slice(0, 8)} already marked unavailable (until ${conn?.rateLimitedUntil}), skipping duplicate mark`);
            return {
                shouldFallback: true,
                cooldownMs: existingCooldownMs - Date.now()
            };
        }
        // T09: Codex scope-aware lockout guard (codex vs spark independent pools).
        if (provider === "codex" && model) {
            const scopeRateLimitedUntil = getCodexScopeRateLimitedUntil(conn?.providerSpecificData || {}, model);
            if (scopeRateLimitedUntil && new Date(scopeRateLimitedUntil).getTime() > Date.now()) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `${connectionId.slice(0, 8)} already scope-limited for ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model)} (until ${scopeRateLimitedUntil}), skipping duplicate mark`);
                return {
                    shouldFallback: true,
                    cooldownMs: new Date(scopeRateLimitedUntil).getTime() - Date.now()
                };
            }
        }
        const effectiveProviderProfile = providerProfile || (provider ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRuntimeProviderProfile"])(provider) : null);
        // #4530 follow-up: the combo.ts lockout sites forward the admin-configured
        // maxCooldownMs cap to recordModelLockoutFailure, but the markAccountUnavailable
        // lockout sites (per-model quota, grok-web 403, local 404) never did, so the cap
        // fell back to BACKOFF_CONFIG.max here. Resolve it once and pass it at every site.
        const mlSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelLockoutSettings"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])());
        const fallbackResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkFallbackError"])(status, errorText, backoffLevel, model, provider, null, effectiveProviderProfile);
        // Read passthroughModels from connection config (user-configured per-model quota)
        const connProviderSpecificData = conn?.providerSpecificData || {};
        const connectionPassthroughModels = connProviderSpecificData.passthroughModels;
        // #2997: per-connection opt-out of the TRANSIENT connection cooldown. When set,
        // a recoverable failure records lastError/backoff but does NOT cool the
        // connection, so getProviderCredentials keeps selecting it. Terminal states
        // (banned/expired/credits_exhausted) are unaffected — they are resolved below
        // via resolveTerminalConnectionStatus() and still take the connection out.
        // NOTE: this first cut scopes the opt-out to the CONNECTION-level cooldown only;
        // per-model lockout branches (per-model quota 403/404, codex scope) are left
        // as-is — extending disableCooling to model lockout is a follow-up.
        const disableCooling = connProviderSpecificData.disableCooling === true;
        const isPerModelQuotaProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasPerModelQuota"])(provider, model, connectionPassthroughModels);
        const modelLockoutOptions = {
            maxCooldownMs: effectiveProviderProfile?.maxCooldownMs
        };
        if (isPerModelQuotaProvider && provider && provider !== "codex" && model && (status === 404 || status === 429 || status >= 500)) {
            const reason = status === 404 ? "not_found" : status === 429 && fallbackResult.reason === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED ? "quota_exhausted" : status === 429 ? "rate_limited" : "server_error";
            // #5976: a bare 500 is intermittent and NOT model-specific — skip
            // lockout/cooldown ONLY for the exact 500 (the contract its own tests pin:
            // combo-provider-cooldown-sibling.test.ts — "Gemini 503 should NOT skip
            // cooldown"). 502/503/504 keep the pre-#6216 model-lockout path: cooldownMs
            // 0 hot-loops the failing upstream (broke resilience-http-e2e on the PR).
            if (status === 500) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                    lastErrorType: reason,
                    lastError: `Model ${model} ${reason}`,
                    lastErrorAt: new Date().toISOString(),
                    errorCode: status
                }).catch(()=>{});
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Server error for ${provider}:${model} — ${status} ${reason} (no model lockout, connection stays active for sibling models)`);
                return {
                    shouldFallback: true,
                    cooldownMs: 0
                };
            }
            const usesExactAntigravityLock = provider === "antigravity";
            const quotaScope = usesExactAntigravityLock ? "model" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaScopeLabelForProvider"])(provider, model);
            const antigravityFamilyInferredBaseCooldownMs = !usesExactAntigravityLock && provider === "antigravity" && quotaScope === "family" && status === 429 ? ANTIGRAVITY_FAMILY_INFERRED_BASE_COOLDOWN_MS : null;
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, reason, status, status === 404 ? effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFoundLocal : antigravityFamilyInferredBaseCooldownMs ?? fallbackResult.baseCooldownMs ?? effectiveProviderProfile?.baseCooldownMs ?? 0, effectiveProviderProfile, {
                ...modelLockoutOptions,
                exactCooldownMs: fallbackResult.usedUpstreamRetryHint === true ? fallbackResult.cooldownMs : fallbackResult.quotaResetHintMs ?? null,
                maxCooldownMs: mlSettings.maxCooldownMs,
                scope: usesExactAntigravityLock ? "exact" : undefined,
                // #6863 vs #7940: exactCooldownMs above is only ever set from a genuine
                // upstream signal (Retry-After/reset header or a parsed quotaResetHintMs) —
                // never a synthetic estimate — so it must bypass maxCooldownMs instead of
                // being clamped down to a window the upstream already told us is wrong.
                exactCooldownIsUpstreamReset: fallbackResult.usedUpstreamRetryHint === true || typeof fallbackResult.quotaResetHintMs === "number"
            });
            // Update last error for observability (without changing terminal status)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: reason,
                lastError: `Model ${model} ${reason}`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Model-only lockout for ${provider}:${model} — ${status} ${reason} ${Math.ceil(lockout.cooldownMs / 1000)}s (failureCount=${lockout.failureCount}, connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        const result = fallbackResult;
        const { shouldFallback, cooldownMs: rawCooldownMs, newBackoffLevel, reason } = result;
        if (!shouldFallback) return {
            shouldFallback: false,
            cooldownMs: 0
        };
        const providerErrorType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyProviderError"])(status, errorText, provider);
        if (provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider) === "grok-web" && status === 403 && model) {
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, "forbidden", status, effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].serviceUnavailable, effectiveProviderProfile, {
                maxCooldownMs: mlSettings.maxCooldownMs
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: "forbidden",
                lastError: `Mode ${model} forbidden for this Grok account`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Mode-only lockout for ${provider}:${model} — 403 forbidden ${Math.ceil(lockout.cooldownMs / 1000)}s (connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        const terminalStatus = resolveTerminalConnectionStatus(status, result, providerErrorType, provider);
        const cachedQuotaResetAt = providerErrorType === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ERROR_TYPES"].QUOTA_EXHAUSTED || reason === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED ? getCachedQuotaResetAt(connectionId) : null;
        const cachedQuotaResetMs = parseFutureDateMs(cachedQuotaResetAt);
        const cooldownMs = terminalStatus ? 0 : cachedQuotaResetMs ? cachedQuotaResetMs - Date.now() : rawCooldownMs;
        // ── #3027: per-model subscription/permission 403 → model-only lockout ──
        if (isPerModelQuotaProvider && status === 403 && provider && model && !terminalStatus) {
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, "forbidden", status, fallbackResult.baseCooldownMs ?? effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].serviceUnavailable, effectiveProviderProfile, {
                ...modelLockoutOptions,
                exactCooldownMs: fallbackResult.usedUpstreamRetryHint === true ? fallbackResult.cooldownMs : null,
                maxCooldownMs: mlSettings.maxCooldownMs
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: "forbidden",
                lastError: `Model ${model} forbidden (per-model access/subscription)`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Model-only lockout for ${provider}:${model} — 403 forbidden ${Math.ceil(lockout.cooldownMs / 1000)}s (per-model quota provider, connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        // ── 404 model-only lockout: connection stays active ──
        // For local providers (detected by URL), a 404 means the specific model
        // doesn't exist or isn't available for this account — it should NOT lock
        // out the entire connection.
        const connBaseUrl = conn?.providerSpecificData?.baseUrl;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(connBaseUrl) && status === 404 && provider && model) {
            const lockout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"])(provider, connectionId, model, "not_found", status, status === 404 ? effectiveProviderProfile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFoundLocal : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].notFoundLocal, effectiveProviderProfile, {
                maxCooldownMs: mlSettings.maxCooldownMs
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                lastErrorType: "not_found",
                lastError: `Model ${model} not_found`,
                lastErrorAt: new Date().toISOString(),
                errorCode: status
            }).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Model-only lockout for ${provider}:${model} — 404 not_found ${Math.ceil(lockout.cooldownMs / 1000)}s (failureCount=${lockout.failureCount}, connection stays active)`);
            return {
                shouldFallback: true,
                cooldownMs: lockout.cooldownMs
            };
        }
        const errorMsg = typeof errorText === "string" ? errorText.slice(0, 100) : "Provider error";
        // T09: Codex per-scope lockout (do not block the whole account globally).
        if (provider === "codex" && status === 429 && model && conn) {
            const scope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model);
            const existingScopeMap = asRecord(conn.providerSpecificData.codexScopeRateLimitedUntil);
            const persistedScopeUntil = getCodexScopeRateLimitedUntil(conn.providerSpecificData, model);
            const scopeRateLimitedUntil = persistedScopeUntil || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnavailableUntil"])(cooldownMs);
            const scopeCooldownMs = Math.max(new Date(scopeRateLimitedUntil).getTime() - Date.now(), 0);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                testStatus: "unavailable",
                lastError: errorMsg,
                errorCode: status,
                lastErrorAt: new Date().toISOString(),
                backoffLevel: newBackoffLevel ?? backoffLevel,
                providerSpecificData: {
                    ...conn.providerSpecificData,
                    codexScopeRateLimitedUntil: {
                        ...existingScopeMap,
                        [scope]: scopeRateLimitedUntil
                    }
                }
            });
            if (scopeCooldownMs > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"])(provider, connectionId, model, reason || "unknown", scopeCooldownMs);
            }
            if (status && errorMsg) {
                console.error(`❌ ${provider} [${status}] (${scope}): ${errorMsg}`);
            }
            return {
                shouldFallback: true,
                cooldownMs: scopeCooldownMs
            };
        }
        const baseUpdate = {
            lastError: errorMsg,
            lastErrorType: providerErrorType,
            errorCode: status,
            lastErrorAt: new Date().toISOString(),
            backoffLevel: newBackoffLevel ?? backoffLevel
        };
        const persistUnavailableState = options.persistUnavailableState !== false;
        if (!persistUnavailableState) {
            // Combo-managed transient failure (e.g. 429): keep the connection clean in
            // the DB, but record an in-memory model lockout so credential selection
            // skips this exact provider+connection+model while it cools down — other
            // models on the same connection stay usable.
            if (provider && model && cooldownMs > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"])(provider, connectionId, model, reason || "unknown", cooldownMs);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                ...baseUpdate
            });
        } else if (cooldownMs > 0 && !disableCooling) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                ...baseUpdate,
                rateLimitedUntil: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnavailableUntil"])(cooldownMs),
                testStatus: "unavailable"
            });
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                ...baseUpdate,
                rateLimitedUntil: null,
                ...terminalStatus ? {
                    testStatus: terminalStatus
                } : {}
            });
        }
        // T-AUTODISABLE: If auto-disable setting is enabled and error is permanent/terminal,
        // mark account as inactive so it is never retried again.
        // Uses getCachedSettings() to avoid DB overhead on hot error path.
        // NOTE: For permanent bans we disable immediately — no threshold needed,
        // because a permanent ban (403 "Verify your account" / ToS violation) will
        // NEVER recover, so retrying is pointless regardless of attempt count.
        if (result.permanent) {
            try {
                const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
                const autoDisableEnabled = settings.autoDisableBannedAccounts ?? false;
                if (autoDisableEnabled) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
                        isActive: false
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Auto-disabled ${connectionId.slice(0, 8)} — permanent ban detected (autoDisableBannedAccounts=true)`);
                }
            } catch (e) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Auto-disable check failed (non-fatal): ${e}`);
            }
        }
        if (provider && status && errorMsg) {
            console.error(`❌ ${provider} [${status}]: ${errorMsg}`);
        }
        return {
            shouldFallback: true,
            cooldownMs
        };
    } finally{
        if (resolveMutex) resolveMutex();
        // Cleanup stale mutex entries (avoid memory leak)
        markMutexes.delete(connectionId);
    }
}
async function clearAccountError(connectionId, currentConnection) {
    // Only update if currently has error status
    const hasError = currentConnection.testStatus && currentConnection.testStatus !== "active" || currentConnection.lastError || currentConnection.rateLimitedUntil || currentConnection.errorCode || currentConnection.lastErrorType || currentConnection.lastErrorSource;
    if (!hasError) return; // Skip if already clean
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
        testStatus: "active",
        lastError: null,
        lastErrorAt: null,
        lastErrorType: null,
        lastErrorSource: null,
        errorCode: null,
        rateLimitedUntil: null,
        backoffLevel: 0
    });
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Account ${connectionId.slice(0, 8)} error cleared`);
}
async function clearRecoveredProviderState(credentials, expectedState) {
    if (!credentials?.connectionId) return {
        applied: false
    };
    if (expectedState) {
        const applied = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearConnectionErrorIfUnchanged"])(credentials.connectionId, expectedState);
        if (!applied) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Skipped recovery clear for ${credentials.connectionId.slice(0, 8)} — state changed concurrently (CAS miss)`);
            return {
                applied: false
            };
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__.info("AUTH", `Account ${credentials.connectionId.slice(0, 8)} error cleared (CAS)`);
        return {
            applied: true
        };
    }
    await clearAccountError(credentials.connectionId, credentials);
    return {
        applied: true
    };
}
function readNonEmptyUrlToken(request) {
    if (typeof request?.url !== "string" || request.url.trim().length === 0) return null;
    try {
        const url = new URL(request.url, "http://localhost");
        const segments = url.pathname.split("/").map((segment)=>segment.trim()).filter(Boolean);
        if (segments[0] === "vscode" && segments[1]) {
            const decodedSegment = decodeURIComponent(segments[1]).trim();
            if (decodedSegment.length > 0) return decodedSegment;
        }
        if (segments[0] === "api" && segments[1] === "v1" && segments[2] === "vscode") {
            if (segments[3] && segments[3] !== "raw" && segments[3] !== "combos") {
                const decodedSegment = decodeURIComponent(segments[3]).trim();
                if (decodedSegment.length > 0) return decodedSegment;
            }
            if ((segments[3] === "raw" || segments[3] === "combos") && segments[4]) {
                const decodedSegment = decodeURIComponent(segments[4]).trim();
                if (decodedSegment.length > 0) return decodedSegment;
            }
        }
    // NOTE: query-string token fallbacks (`?token=`/`?key=`/`?apiKey=`/`?api_key=`)
    // were intentionally REMOVED. They are a broad credential-in-URL surface that
    // leaks into access logs, Referer headers and proxy logs, and — because this
    // extractor also feeds management auth — would let `?token=<mgmt-key>`
    // authenticate management routes. The VS Code integration only needs the
    // path-scoped `/vscode/<token>/…` form above. (security review, #3300 follow-up)
    } catch  {
        return null;
    }
    return null;
}
function extractApiKey(request, opts) {
    const authHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "Authorization") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "authorization");
    if (typeof authHeader === "string") {
        const trimmedHeader = authHeader.trim();
        if (trimmedHeader.toLowerCase().startsWith("bearer ")) {
            return trimmedHeader.slice(7).trim() || null;
        }
    }
    // Issue #2225: Anthropic Messages API clients authenticate via x-api-key.
    // Gate the fallback on anthropic-version OR a claude-code/anthropic user-agent so we
    // don't trip up local-mode requests from non-Anthropic clients that send placeholder
    // x-api-key values (which would otherwise be rejected as Invalid API key).
    const anthropicVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "anthropic-version") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "Anthropic-Version");
    const userAgent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "user-agent") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "User-Agent");
    if (anthropicVersion || userAgent && /claude-code|claude-cli|anthropic/i.test(userAgent)) {
        const xApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "x-api-key") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$headerReader$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readHeaderValue"])(request?.headers, "X-Api-Key");
        if (typeof xApiKey === "string") {
            const trimmed = xApiKey.trim();
            if (trimmed.length > 0) return trimmed;
        }
    }
    const xGoogApiKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$googApiKeyAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractGoogApiKeyHeader"])(request?.headers); // Issue #7034
    if (xGoogApiKey) return xGoogApiKey;
    if (opts?.allowUrl === false) return null;
    return readNonEmptyUrlToken(request);
}
async function isValidApiKey(apiKey) {
    if (!apiKey) return false;
    // Persistent env-var key — always valid regardless of DB state (#1350)
    const envKey = process.env.OMNIROUTE_API_KEY || process.env.ROUTER_API_KEY;
    if (envKey && apiKey === envKey) return true;
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateApiKey"])(apiKey);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/cooldownAwareRetry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "computeClosestRetryAfter",
    ()=>computeClosestRetryAfter,
    "disableCooldownAwareRetry",
    ()=>disableCooldownAwareRetry,
    "getCooldownAwareRetryDecision",
    ()=>getCooldownAwareRetryDecision,
    "resolveCooldownAwareRetrySettings",
    ()=>resolveCooldownAwareRetrySettings,
    "waitForCooldownAwareRetry",
    ()=>waitForCooldownAwareRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const MAX_REQUEST_RETRY = 10;
const MAX_RETRY_INTERVAL_SEC = 300;
const MAX_BUDGET_MS = 5 * 60 * 1000;
function normalizeInteger(value, fallback, options) {
    const min = options.min ?? 0;
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.min(options.max, Math.max(min, Math.trunc(value)));
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return Math.min(options.max, Math.max(min, Math.trunc(parsed)));
        }
    }
    return fallback;
}
function resolveCooldownAwareRetrySettings(settings) {
    const waitForCooldown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings).waitForCooldown;
    const maxRetries = normalizeInteger(waitForCooldown.maxRetries, waitForCooldown.maxRetries, {
        min: 0,
        max: MAX_REQUEST_RETRY
    });
    const maxRetryWaitSec = normalizeInteger(waitForCooldown.maxRetryWaitSec, waitForCooldown.maxRetryWaitSec, {
        min: 0,
        max: MAX_RETRY_INTERVAL_SEC
    });
    const maxRetryWaitMs = maxRetryWaitSec * 1000;
    const budgetMs = normalizeInteger(waitForCooldown.budgetMs, waitForCooldown.budgetMs, {
        min: maxRetryWaitMs,
        max: MAX_BUDGET_MS
    });
    const enabled = Boolean(waitForCooldown.enabled) && maxRetries > 0 && maxRetryWaitSec > 0;
    return {
        enabled,
        maxRetries,
        maxRetryWaitSec,
        maxRetryWaitMs,
        budgetMs
    };
}
function disableCooldownAwareRetry(settings, disabled) {
    if (!disabled) return settings;
    return {
        ...settings,
        enabled: false,
        maxRetries: 0,
        maxRetryWaitSec: 0,
        maxRetryWaitMs: 0,
        budgetMs: 0
    };
}
function computeClosestRetryAfter(retryAfter) {
    if (!retryAfter) {
        return {
            retryAfter: null,
            retryAfterHuman: "",
            waitMs: null
        };
    }
    const retryTimeMs = new Date(retryAfter).getTime();
    if (!Number.isFinite(retryTimeMs)) {
        return {
            retryAfter: null,
            retryAfterHuman: "",
            waitMs: null
        };
    }
    const normalizedRetryAfter = new Date(retryTimeMs).toISOString();
    return {
        retryAfter: normalizedRetryAfter,
        retryAfterHuman: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"])(normalizedRetryAfter),
        waitMs: Math.max(retryTimeMs - Date.now(), 0)
    };
}
function getCooldownAwareRetryDecision({ retryAfter, settings, attempt, budgetLeftMs }) {
    const closest = computeClosestRetryAfter(retryAfter);
    const effectiveBudgetLeftMs = budgetLeftMs ?? settings.budgetMs;
    if (!settings.enabled || settings.maxRetries <= 0 || settings.maxRetryWaitMs <= 0 || attempt >= settings.maxRetries || closest.waitMs === null) {
        return {
            shouldRetry: false,
            retryAfter: closest.retryAfter,
            retryAfterHuman: closest.retryAfterHuman,
            waitMs: 0
        };
    }
    if (closest.waitMs > settings.maxRetryWaitMs || closest.waitMs > effectiveBudgetLeftMs) {
        return {
            shouldRetry: false,
            retryAfter: closest.retryAfter,
            retryAfterHuman: closest.retryAfterHuman,
            waitMs: closest.waitMs
        };
    }
    return {
        shouldRetry: true,
        retryAfter: closest.retryAfter,
        retryAfterHuman: closest.retryAfterHuman,
        waitMs: closest.waitMs
    };
}
async function waitForCooldownAwareRetry(waitMs, signal) {
    if (signal?.aborted) return false;
    if (!Number.isFinite(waitMs) || waitMs <= 0) return signal?.aborted !== true;
    return await new Promise((resolve)=>{
        let settled = false;
        let timeoutId = setTimeout(()=>{
            if (settled) return;
            settled = true;
            if (signal) {
                signal.removeEventListener("abort", onAbort);
            }
            timeoutId = null;
            resolve(true);
        }, waitMs);
        const onAbort = ()=>{
            if (settled) return;
            settled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            signal?.removeEventListener("abort", onAbort);
            resolve(false);
        };
        signal?.addEventListener("abort", onAbort, {
            once: true
        });
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/sse/services/model.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getCombo",
    ()=>getCombo,
    "getComboForModel",
    ()=>getComboForModel,
    "getModelInfo",
    ()=>getModelInfo
]);
// Re-export from open-sse with localDb integration
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/activeSyncedCatalog.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/registeredEffortVariants.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
/**
 * Reserved provider prefixes — built-in provider ids + aliases. User-defined
 * compatible-node prefixes must not be allowed to shadow these, otherwise a
 * node with prefix="cf" would hijack cloudflare-ai requests (and similar for
 * every built-in provider). Ported from upstream 9router 047fdc89.
 *
 * Built lazily so the registry is only walked once per process.
 */ let _reservedProviderPrefixes = null;
function getReservedProviderPrefixes() {
    if (_reservedProviderPrefixes) return _reservedProviderPrefixes;
    const reserved = new Set();
    for (const entry of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"])){
        if (entry?.id) reserved.add(entry.id);
        if (entry?.alias) reserved.add(entry.alias);
    }
    _reservedProviderPrefixes = reserved;
    return reserved;
}
/**
 * Fold `settings.wildcardAliases` ({pattern,target}[]) — the store the Settings
 * UI's "Wildcard Pattern" mode writes to (ModelAliasesUnified.tsx::addWildcardAlias
 * -> PATCH /api/settings) — into `pattern -> target` map entries so the T13
 * wildcard step in getModelInfoCore() (which treats every key of the merged alias
 * map as a candidate glob pattern) can see them (#7693). Without this the
 * feature persists but is never consulted at request time.
 */ function buildWildcardAliasMap(settings) {
    const wildcardEntries = Array.isArray(settings.wildcardAliases) ? settings.wildcardAliases : [];
    const wildcardMap = {};
    for (const entry of wildcardEntries){
        if (entry && typeof entry.pattern === "string" && typeof entry.target === "string") {
            wildcardMap[entry.pattern] = entry.target;
        }
    }
    return wildcardMap;
}
/**
 * Build a combined model alias map that merges all alias stores:
 * 1. DB-namespace aliases (key_value WHERE namespace='modelAliases') — set via
 *    /api/models/alias/ and seeded at startup.
 * 2. Settings-based exact aliases (settings.modelAliases) — set via the Settings UI and
 *    /api/settings/model-aliases/ (stored as a JSON blob in namespace='settings').
 * 3. Settings-based wildcard aliases (settings.wildcardAliases) — set via the Settings
 *    UI's "Wildcard Pattern" mode, PATCH /api/settings (#7693).
 *
 * Settings-based exact aliases take priority over DB-namespace aliases so that UI
 * configuration always wins. Without this merge, aliases configured via the Settings
 * UI were never consulted during provider routing, causing provider inference (e.g.
 * /^gpt-/ → openai) to silently override them (issue #2618 / #2208). Wildcard entries
 * are folded in last: they are keyed by pattern string (containing `*`/`?`), which
 * cannot collide with a real model id, so ordering never affects exact-alias lookups.
 */ async function getCombinedModelAliases() {
    const [dbAliases, settings] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelAliases"])().catch(()=>({})),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])().catch(()=>({}))
    ]);
    const settingsAliases = settings.modelAliases && typeof settings.modelAliases === "object" && !Array.isArray(settings.modelAliases) ? settings.modelAliases : {};
    const wildcardMap = buildWildcardAliasMap(settings);
    return {
        ...dbAliases,
        ...settingsAliases,
        ...wildcardMap
    };
}
// Providers that already own a native `-{effort}` suffix mechanism — never
// double-resolve the generic synced suffix on top of theirs (#7694, mirrors the
// catalog-side skip list in `open-sse/utils/syncedEffortVariants.ts`).
const SYNCED_EFFORT_SKIP_PROVIDER_PREFIXES = [
    "codex",
    "kimi"
];
function isSyncedEffortSkippedProvider(providerId) {
    return SYNCED_EFFORT_SKIP_PROVIDER_PREFIXES.some((prefix)=>providerId.startsWith(prefix));
}
/**
 * #7694: when `modelId` has no direct synced-model match, try stripping a trailing
 * `-{effort}` token by testing it against each candidate synced model's OWN declared
 * `supportedThinkingEfforts` (`splitSyncedEffortSuffix`) — never a blind/global effort
 * list, so a model id that legitimately ends in an effort-like token is left untouched
 * unless some synced model's real tier list says otherwise. Returns the original
 * `modelId` with `effort: null` when nothing matches or the provider already owns its
 * own suffix mechanism.
 */ function resolveSyncedModelIdAndEffort(providerId, modelId, syncedModels) {
    if (isSyncedEffortSkippedProvider(providerId) || !Array.isArray(syncedModels)) {
        return {
            modelId,
            effort: null
        };
    }
    if (findSyncedModelMeta(syncedModels, modelId)) return {
        modelId,
        effort: null
    };
    for (const candidate of syncedModels){
        if (typeof candidate?.id !== "string" || !Array.isArray(candidate.supportedThinkingEfforts)) {
            continue;
        }
        const attempt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["splitSyncedEffortSuffix"])(modelId, candidate.supportedThinkingEfforts);
        if (attempt.effort && attempt.baseModel === candidate.id) {
            return {
                modelId: attempt.baseModel,
                effort: attempt.effort
            };
        }
    }
    return {
        modelId,
        effort: null
    };
}
function findCustomModelMeta(models, modelId) {
    if (!Array.isArray(models)) return undefined;
    return models.find((model)=>model.id === modelId) ?? models.find((model)=>typeof model.id === "string" && model.id.toLowerCase() === modelId.toLowerCase());
}
function findSyncedModelMeta(models, modelId) {
    return Array.isArray(models) ? models.find((model)=>model.id === modelId) : undefined;
}
function resolveRuntimeFormats(customMatch, syncedMatch) {
    const apiFormat = customMatch?.apiFormat === "responses" || syncedMatch?.apiFormat === "responses" ? "responses" : undefined;
    const targetFormat = typeof customMatch?.targetFormat === "string" ? customMatch.targetFormat : typeof syncedMatch?.targetFormat === "string" ? syncedMatch.targetFormat : undefined;
    return {
        ...apiFormat ? {
            apiFormat
        } : {},
        ...targetFormat ? {
            targetFormat
        } : {}
    };
}
function copySyncedThinkingMetadata(metadata, syncedMatch) {
    if (typeof syncedMatch?.supportsThinking === "boolean") {
        metadata.supportsThinking = syncedMatch.supportsThinking;
    }
    if (syncedMatch?.alwaysThinking === true) metadata.alwaysThinking = true;
    if (Array.isArray(syncedMatch?.supportedThinkingEfforts)) {
        metadata.supportedThinkingEfforts = syncedMatch.supportedThinkingEfforts;
    }
    if (typeof syncedMatch?.defaultThinkingEffort === "string") {
        metadata.defaultThinkingEffort = syncedMatch.defaultThinkingEffort;
    }
}
function buildRuntimeModelMeta(customMatch, syncedMatch) {
    const metadata = resolveRuntimeFormats(customMatch, syncedMatch);
    copySyncedThinkingMetadata(metadata, syncedMatch);
    return metadata;
}
async function lookupModelMeta(providerId, modelId) {
    try {
        const [customModels, liveCatalog] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCustomModels"])(providerId),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getActiveSyncedCatalog"])(providerId)
        ]);
        const syncedModels = liveCatalog.models;
        // #7694: no direct match on the raw modelId? try a synced-declared `-{effort}`
        // suffix before falling back to the literal id, so `<prefix>/<model>-<tier>`
        // resolves to the real base model + a resolved effort.
        const { modelId: resolvedModelId, effort } = resolveSyncedModelIdAndEffort(providerId, modelId, syncedModels);
        // Custom models remain explicit operator overrides even when live discovery
        // is authoritative for the provider.
        const customMatch = findCustomModelMeta(customModels, resolvedModelId);
        const syncedMatch = findSyncedModelMeta(syncedModels, resolvedModelId);
        const effortBaseModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRegisteredProviderEffortBaseModelId"])(providerId, modelId);
        const liveBackedEffortVariant = effortBaseModelId !== null && syncedModels.some((model)=>model.id === effortBaseModelId);
        const available = !liveCatalog.authoritative || Boolean(customMatch || syncedMatch || liveBackedEffortVariant);
        const metadata = buildRuntimeModelMeta(customMatch, syncedMatch);
        if (effort) metadata.resolvedThinkingEffort = effort;
        return {
            modelId: resolvedModelId,
            metadata,
            available
        };
    } catch  {
        return {
            modelId,
            metadata: {},
            available: true
        };
    }
}
/**
 * When a custom provider node is matched by its raw internal `node.id` (e.g. a combo
 * step addressing `<connId>/...` — see #2778), `parsed.model` was never split on the
 * node's own `prefix`, unlike the alias-addressing path where `parseModel` already
 * strips it. If the caller naively concatenates `owned_by` (the node's prefix, as
 * listed by /api/models) with the raw model id, the resulting model string carries a
 * redundant leading `${node.prefix}/` segment that the upstream provider does not
 * recognize, causing a 400. Strip it so `<connId>/<prefix>/<rawModelId>` normalizes to
 * the same `<rawModelId>` the bare alias form resolves to (#6772).
 */ function stripRedundantNodePrefix(model, nodePrefix) {
    if (typeof nodePrefix !== "string" || !nodePrefix) return model;
    const redundant = `${nodePrefix}/`;
    return model.startsWith(redundant) ? model.slice(redundant.length) : model;
}
async function getModelInfo(modelStr) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseModel"])(modelStr);
    const { extendedContext } = parsed;
    const attachRuntimeModelMeta = async (info)=>{
        if (!info?.provider || !info?.model) return info;
        const providerId = String(info.provider);
        const requestedModelId = String(info.model);
        const { modelId, metadata, available } = await lookupModelMeta(providerId, requestedModelId);
        if (!available) {
            return {
                provider: null,
                model: requestedModelId,
                extendedContext: info.extendedContext,
                errorType: "model_not_found",
                errorMessage: `Model '${requestedModelId}' is not available in the active live catalog for provider '${providerId}'.`
            };
        }
        const resolvedInfo = modelId !== info.model ? {
            ...info,
            model: modelId
        } : info;
        return Object.keys(metadata).length > 0 ? {
            ...resolvedInfo,
            ...metadata
        } : resolvedInfo;
    };
    // Check custom provider nodes first (for both alias and non-alias formats)
    if (parsed.providerAlias || parsed.provider) {
        // Ensure prefixToCheck is always a concise identifier, not a full model string
        const prefixToCheck = parsed.providerAlias || parsed.provider;
        // Compatible-node prefixes are user-defined. They must not be allowed to
        // shadow built-in provider ids/aliases (e.g. `cf` → cloudflare-ai). When
        // prefixToCheck matches a built-in registry id/alias, skip the compatible-
        // node prefix lookup so the request still routes to the built-in provider.
        // Internal UUID-prefixed node ids (e.g. "openai-compatible-responses-...")
        // are never in the reserved set, so the #2778 combo path still works.
        // Ported from upstream 9router 047fdc89.
        const reserved = getReservedProviderPrefixes();
        const isReservedPrefix = typeof prefixToCheck === "string" && reserved.has(prefixToCheck);
        if (!isReservedPrefix) {
            // Check OpenAI Compatible nodes
            // Match by node.prefix (user-defined alias) OR node.id (internal UUID id stored by
            // combo steps), so that combo targets using the internal node id still resolve
            // correctly (#2778).
            const openaiNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])({
                type: "openai-compatible"
            });
            const matchedOpenAI = openaiNodes.find((node)=>node.prefix === prefixToCheck || node.id === prefixToCheck);
            if (matchedOpenAI) {
                const normalizedModel = stripRedundantNodePrefix(parsed.model, matchedOpenAI.prefix);
                const { modelId, metadata } = await lookupModelMeta(matchedOpenAI.id, normalizedModel);
                return {
                    provider: matchedOpenAI.id,
                    model: modelId,
                    extendedContext,
                    ...metadata
                };
            }
            // Check Anthropic Compatible nodes
            const anthropicNodes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderNodes"])({
                type: "anthropic-compatible"
            });
            const matchedAnthropic = anthropicNodes.find((node)=>node.prefix === prefixToCheck || node.id === prefixToCheck);
            if (matchedAnthropic) {
                const normalizedModel = stripRedundantNodePrefix(parsed.model, matchedAnthropic.prefix);
                const { modelId, metadata } = await lookupModelMeta(matchedAnthropic.id, normalizedModel);
                return {
                    provider: matchedAnthropic.id,
                    model: modelId,
                    extendedContext,
                    ...metadata
                };
            }
        }
        // stripModelPrefix: if enabled, strip provider prefix and re-resolve
        // the bare model name using existing heuristics (claude-* → anthropic, etc.)
        try {
            const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedSettings"])();
            if (settings.stripModelPrefix === true) {
                const strippedResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelInfoCore"])(parsed.model, getCombinedModelAliases);
                return {
                    ...strippedResult,
                    extendedContext
                };
            }
        } catch  {
        // If settings read fails, fall through to normal resolution
        }
    }
    if (!parsed.isAlias) {
        return await attachRuntimeModelMeta(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelInfoCore"])(modelStr, null));
    }
    return await attachRuntimeModelMeta(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelInfoCore"])(modelStr, getCombinedModelAliases));
}
async function getCombo(modelStr) {
    // Try exact match first (supports combos actually named "combo/ANY")
    let combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByName"])(modelStr);
    if (combo && combo.models && combo.models.length > 0) {
        return combo;
    }
    // Fallback: Strip combo/ prefix if present
    if (modelStr.startsWith("combo/")) {
        const nameToSearch = modelStr.substring(6);
        combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByName"])(nameToSearch);
        if (combo && combo.models && combo.models.length > 0) {
            return combo;
        }
    }
    // #4446: the opencode-plugin publishes combos as ModelV2 `id: combo.id`, and
    // the OpenCode `--model` dispatch path forwards a lowercased bare slug. The
    // exact, case-sensitive name match above misses both a combo addressed by its
    // stored id (UUID/slug) and a lowercased display name (e.g. "master-light" for
    // a combo named "MASTER-LIGHT"). These two fallbacks only run after the exact
    // match fails, so they never re-route a combo that already resolves today.
    combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboById"])(modelStr);
    if (combo && combo.models && combo.models.length > 0) {
        return combo;
    }
    combo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getComboByNameInsensitive"])(modelStr);
    if (combo && combo.models && combo.models.length > 0) {
        return combo;
    }
    return null;
}
async function getComboForModel(modelStr) {
    // 1. Existing behavior — exact combo name match
    let combo = await getCombo(modelStr);
    if (combo) return combo;
    // Client context tags are ignored only after exact lookup, preserving literal
    // combo names such as "Claude [1m]" while allowing "Claude[500k]" to use "Claude".
    const baseModelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripContextWindowSuffix"])(modelStr);
    if (baseModelStr && baseModelStr !== modelStr) {
        combo = await getCombo(baseModelStr);
        if (combo) return combo;
    }
    // 2. NEW — check model-combo mappings table (pattern match)
    try {
        const { resolveComboForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const mapped = await resolveComboForModel(baseModelStr || modelStr);
        if (mapped && mapped.models?.length > 0) {
            return mapped;
        }
    } catch  {
    // If the mappings table doesn't exist yet (pre-migration), continue gracefully
    }
    return null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_sse_09d6j09._.js.map