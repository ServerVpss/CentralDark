module.exports = [
"[project]/open-sse/services/grokQuotaFetcher.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GROK_WINDOW_WEEKLY",
    ()=>GROK_WINDOW_WEEKLY,
    "fetchGrokBillingWithToken",
    ()=>fetchGrokBillingWithToken,
    "fetchGrokWebQuota",
    ()=>fetchGrokWebQuota,
    "grokBillingSnapshotToQuotaInfo",
    ()=>grokBillingSnapshotToQuotaInfo,
    "invalidateGrokWebQuotaCache",
    ()=>invalidateGrokWebQuotaCache,
    "registerGrokWebQuotaFetcher",
    ()=>registerGrokWebQuotaFetcher
]);
/**
 * grokQuotaFetcher.ts — Grok Web Weekly Quota Fetcher
 *
 * Implements QuotaFetcher for the grok-web provider (grok.com SSO/cookie
 * connections). Since grok-web uses cookie auth rather than an accessToken
 * stored in the provider connection, this fetcher reads the account-level
 * OIDC tokens from the local Grok CLI (~/.grok/auth.json) and calls the
 * same billing API that powers the grok CLI /usage command and third-party
 * quota widgets (pi-grok-usage, hermes-grok-usage).
 *
 * The billing endpoint returns a single weekly credit-usage percentage
 * that covers all Grok products (Chat, Build, Imagine, API) under the
 * SuperGrok / X Premium+ unified weekly pool.
 *
 * Registration: call registerGrokWebQuotaFetcher() once at server startup,
 * before registerGenericQuotaFetchers() — because the generic path doesn't
 * know how to resolve grok OIDC auth from a cookie-based connection.
 *
 * Shared billing helper: `fetchGrokBillingWithToken` / `grokBillingSnapshotToQuotaInfo`
 * are also used by `xaiOauthQuotaFetcher.ts` (connection OAuth token path).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
// ─── Constants ───────────────────────────────────────────────────────────────
const BILLING_URL = "https://cli-chat-proxy.grok.com/v1/billing?format=credits";
const DEFAULT_ISSUER = "https://auth.x.ai";
const FETCH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes — matches grok-web rate limit cooldown
const REQUEST_TIMEOUT_MS = 10_000;
const EXPIRY_SKEW_MS = 60_000; // refresh a bit before actual expiry
/**
 * Resolve the Grok auth.json path.
 * Controlled by the GROK_AUTH_PATH env var for testing; defaults to ~/.grok/auth.json.
 */ function getAuthPath() {
    const override = (process.env.GROK_AUTH_PATH || "").trim();
    return override || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])(), ".grok", "auth.json");
}
const GROK_WINDOW_WEEKLY = "weekly";
const quotaCache = new Map();
const CACHE_TTL_MS = 60_000; // 60 seconds — matches codexQuotaFetcher
const _cacheCleanup = setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of quotaCache){
        if (now - entry.fetchedAt > CACHE_TTL_MS * 5) {
            quotaCache.delete(key);
        }
    }
}, 5 * 60_000);
if (typeof _cacheCleanup === "object" && "unref" in _cacheCleanup) {
    _cacheCleanup.unref?.();
}
// ─── Auth helpers (mirrors pi-grok-usage / hermes-grok-usage patterns) ────────
function isAllowedXaiUrl(raw) {
    try {
        const url = new URL(raw);
        return url.protocol === "https:" && (url.hostname === "x.ai" || url.hostname.endsWith(".x.ai"));
    } catch  {
        return false;
    }
}
function readAuthFile() {
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(getAuthPath())) return null;
    try {
        const raw = JSON.parse((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(getAuthPath(), "utf8"));
        if (!raw || typeof raw !== "object") return null;
        return raw;
    } catch  {
        return null;
    }
}
function pickAuthEntry(file) {
    const now = Date.now();
    const scored = Object.entries(file).map(([entryId, e])=>{
        const token = typeof e?.key === "string" ? e.key.trim() : "";
        const exp = e?.expires_at ? Date.parse(e.expires_at) : Number.POSITIVE_INFINITY;
        const expired = Number.isFinite(exp) ? exp <= now + EXPIRY_SKEW_MS : false;
        const hasRefresh = typeof e?.refresh_token === "string" && e.refresh_token.length > 0;
        return {
            entryId,
            e,
            token,
            exp,
            expired,
            hasRefresh
        };
    }).filter((x)=>x.token.length > 0 || x.hasRefresh);
    if (scored.length === 0) return null;
    scored.sort((a, b)=>{
        if (a.expired !== b.expired) return a.expired ? 1 : -1;
        if (a.hasRefresh !== b.hasRefresh) return a.hasRefresh ? -1 : 1;
        return b.exp - a.exp;
    });
    const best = scored[0];
    const issuer = (best.e.oidc_issuer || DEFAULT_ISSUER).replace(/\/$/, "");
    return {
        entryId: best.entryId,
        token: best.token,
        refreshToken: best.e.refresh_token?.trim() || undefined,
        email: best.e.email,
        expiresAtMs: Number.isFinite(best.exp) ? best.exp : undefined,
        issuer,
        clientId: best.e.oidc_client_id?.trim() || undefined
    };
}
function writeRefreshedTokens(entryId, update) {
    const file = readAuthFile();
    if (!file || !file[entryId]) return;
    file[entryId] = {
        ...file[entryId],
        key: update.access,
        ...update.refresh ? {
            refresh_token: update.refresh
        } : {},
        expires_at: update.expiresAtIso
    };
    try {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(getAuthPath(), `${JSON.stringify(file, null, 2)}\n`, {
            encoding: "utf8"
        });
    } catch  {
    // Non-fatal: token is still valid in-memory this session
    }
}
async function discoverTokenEndpoint(issuer, signal) {
    const discoveryUrl = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
    if (!isAllowedXaiUrl(discoveryUrl)) {
        throw new Error("invalid oidc issuer");
    }
    const res = await fetch(discoveryUrl, {
        headers: {
            Accept: "application/json"
        },
        signal
    });
    if (!res.ok) throw new Error(`token refresh failed (discovery HTTP ${res.status})`);
    const json = await res.json();
    const endpoint = String(json.token_endpoint || "");
    if (!isAllowedXaiUrl(endpoint)) throw new Error("invalid token endpoint");
    return endpoint;
}
async function refreshAccessToken(auth, signal) {
    if (!auth.refreshToken) {
        throw new Error("auth expired — run `grok login`");
    }
    if (!auth.clientId) {
        throw new Error("auth missing client id — run `grok login`");
    }
    const tokenEndpoint = await discoverTokenEndpoint(auth.issuer, signal);
    const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": "omniroute-grok-usage/1.0"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: auth.clientId,
            refresh_token: auth.refreshToken
        }).toString(),
        signal
    });
    if (!res.ok) {
        throw new Error(`token refresh failed (HTTP ${res.status})`);
    }
    const payload = await res.json();
    const access = String(payload.access_token || "").trim();
    if (!access) throw new Error("token refresh failed (empty access token)");
    const expiresInSec = Number(payload.expires_in || 3600);
    const expiresAtMs = Date.now() + Math.max(60, expiresInSec) * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();
    const refresh = String(payload.refresh_token || auth.refreshToken).trim();
    try {
        writeRefreshedTokens(auth.entryId, {
            access,
            refresh,
            expiresAtIso
        });
    } catch  {
    // Non-fatal
    }
    return {
        ...auth,
        token: access,
        refreshToken: refresh,
        expiresAtMs
    };
}
function needsRefresh(auth) {
    if (!auth.token) return true;
    if (auth.expiresAtMs == null) return false;
    return auth.expiresAtMs <= Date.now() + EXPIRY_SKEW_MS;
}
async function resolveAuth(signal) {
    const file = readAuthFile();
    if (!file) throw new Error("no grok auth — run `grok login`");
    const auth = pickAuthEntry(file);
    if (!auth) throw new Error("no usable Grok credentials — run `grok login`");
    if (needsRefresh(auth)) {
        return refreshAccessToken(auth, signal);
    }
    return auth;
}
// ─── Billing fetch ───────────────────────────────────────────────────────────
function periodShort(type) {
    if (!type) return "";
    if (type.includes("WEEKLY")) return "weekly";
    if (type.includes("MONTHLY")) return "monthly";
    if (type.includes("DAILY")) return "daily";
    return "period";
}
function resetLocalLabel(endIso) {
    if (!endIso) return "";
    const end = new Date(endIso);
    if (Number.isNaN(end.getTime())) return "";
    const weekday = end.toLocaleDateString(undefined, {
        weekday: "short"
    });
    const hour = end.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    return `${weekday} ${hour.replace(/^24:/, "00:")}`;
}
async function fetchGrokBillingWithToken(token, signal) {
    const controller = signal ? null : new AbortController();
    const timeout = controller ? setTimeout(()=>controller.abort(), REQUEST_TIMEOUT_MS) : null;
    try {
        return await fetchBilling(token, signal ?? controller.signal);
    } finally{
        if (timeout) clearTimeout(timeout);
    }
}
function grokBillingSnapshotToQuotaInfo(snap) {
    return snapshotToQuotaInfo(snap);
}
async function fetchBilling(token, signal) {
    const res = await fetch(BILLING_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "User-Agent": "omniroute-grok-usage/1.0",
            "x-grok-client-mode": "cli"
        },
        signal
    });
    if (res.status === 401 || res.status === 403) {
        throw new Error(`auth ${res.status}`);
    }
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const cfg = data.config ?? {};
    const percent = Number(cfg.creditUsagePercent ?? 0);
    const endIso = cfg.currentPeriod?.end ?? cfg.billingPeriodEnd;
    const products = (cfg.productUsage ?? []).filter((p)=>p.product).map((p)=>({
            product: String(p.product),
            usagePercent: p.usagePercent
        }));
    return {
        percent: Number.isFinite(percent) ? percent : 0,
        periodLabel: periodShort(cfg.currentPeriod?.type),
        resetLabel: resetLocalLabel(endIso),
        endIso,
        products,
        onDemandUsed: Number(cfg.onDemandUsed?.val ?? 0),
        onDemandCap: Number(cfg.onDemandCap?.val ?? 0),
        prepaidBalance: Number(cfg.prepaidBalance?.val ?? 0),
        fetchedAt: Date.now()
    };
}
// ─── Core Fetcher ────────────────────────────────────────────────────────────
/**
 * Convert a UsageSnapshot into the preflight QuotaInfo contract.
 * Grok has a single weekly window; percentUsed = creditUsagePercent / 100.
 * The resetAt comes from currentPeriod.end.
 */ function snapshotToQuotaInfo(snap) {
    const percentUsed = Math.max(0, Math.min(1, snap.percent / 100));
    return {
        used: Math.round(snap.percent),
        total: 100,
        percentUsed,
        resetAt: snap.endIso ?? null,
        windows: {
            [GROK_WINDOW_WEEKLY]: {
                percentUsed,
                resetAt: snap.endIso ?? null
            }
        }
    };
}
async function fetchGrokWebQuota(connectionId, _connection) {
    // Check cache first
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            let auth;
            try {
                auth = await resolveAuth(controller.signal);
            } catch  {
                // No local grok auth — fail open
                quotaCache.set(connectionId, {
                    quota: null,
                    error: null,
                    fetchedAt: Date.now()
                });
                return null;
            }
            try {
                const snap = await fetchBilling(auth.token, controller.signal);
                const quota = snapshotToQuotaInfo(snap);
                quotaCache.set(connectionId, {
                    quota,
                    error: null,
                    fetchedAt: Date.now()
                });
                return quota;
            } catch (err) {
                const msg = err instanceof Error ? err.message : "";
                // One retry with token refresh on auth errors
                if (msg.startsWith("auth ") && auth.refreshToken) {
                    auth = await refreshAccessToken(auth, controller.signal);
                    const snap = await fetchBilling(auth.token, controller.signal);
                    const quota = snapshotToQuotaInfo(snap);
                    quotaCache.set(connectionId, {
                        quota,
                        error: null,
                        fetchedAt: Date.now()
                    });
                    return quota;
                }
                // Non-auth error — fail open
                quotaCache.set(connectionId, {
                    quota: null,
                    error: msg,
                    fetchedAt: Date.now()
                });
                return null;
            }
        } finally{
            clearTimeout(timeout);
        }
    } catch  {
        quotaCache.set(connectionId, {
            quota: null,
            error: null,
            fetchedAt: Date.now()
        });
        return null;
    }
}
function invalidateGrokWebQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function registerGrokWebQuotaFetcher() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])("grok-web", fetchGrokWebQuota);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])("grok-web", fetchGrokWebQuota);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["registerQuotaWindows"])("grok-web", [
        GROK_WINDOW_WEEKLY
    ]);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/xaiOauthQuotaFetcher.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractXaiOauthAccessToken",
    ()=>extractXaiOauthAccessToken,
    "fetchXaiOauthQuota",
    ()=>fetchXaiOauthQuota,
    "invalidateXaiOauthQuotaCache",
    ()=>invalidateXaiOauthQuotaCache,
    "registerXaiOauthQuotaFetcher",
    ()=>registerXaiOauthQuotaFetcher
]);
/**
 * xaiOauthQuotaFetcher.ts — Weekly quota for xAI OAuth (Grok) provider
 *
 * Live weekly pool for the `xai-oauth` provider (public alias `xao`).
 *
 * Endpoint (same unified weekly pool as grok-web / Grok CLI usage):
 *   GET https://cli-chat-proxy.grok.com/v1/billing?format=credits
 *   Authorization: Bearer <connection accessToken>
 *
 * Response mapping:
 *   creditUsagePercent (0–100, percent **used**) → QuotaInfo.percentUsed (0–1)
 *   currentPeriod.end → resetAt
 *
 * Auth comes from the OAuth connection (accessToken on the connection root or
 * under credentials), not from ~/.grok/auth.json.
 *
 * Fail-open: missing token or upstream errors return null — quota tracking must
 * never block routing.
 *
 * Cache: 60s in-memory TTL keyed by connectionId.
 *
 * Registration: registerXaiOauthQuotaFetcher() via quotaTrackersBatch side-effect
 * import (before registerGenericQuotaFetchers).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/grokQuotaFetcher.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 10_000;
/** Provider id + public alias (registry.alias). */ const XAI_OAUTH_PROVIDER_IDS = [
    "xai-oauth",
    "xao"
];
const quotaCache = new Map();
const _cacheCleanup = setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of quotaCache){
        if (now - entry.fetchedAt > CACHE_TTL_MS * 5) {
            quotaCache.delete(key);
        }
    }
}, 5 * 60_000);
if (typeof _cacheCleanup === "object" && _cacheCleanup && "unref" in _cacheCleanup) {
    _cacheCleanup.unref?.();
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function extractXaiOauthAccessToken(connection) {
    if (typeof connection?.accessToken === "string" && connection.accessToken.trim()) {
        return connection.accessToken.trim();
    }
    const credentials = toRecord(connection?.credentials);
    if (typeof credentials.accessToken === "string" && credentials.accessToken.trim()) {
        return credentials.accessToken.trim();
    }
    return null;
}
async function fetchXaiOauthQuota(connectionId, connection) {
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    const accessToken = extractXaiOauthAccessToken(connection);
    if (!accessToken) {
        quotaCache.set(connectionId, {
            quota: null,
            fetchedAt: Date.now()
        });
        return null;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const snap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["fetchGrokBillingWithToken"])(accessToken, controller.signal);
            const quota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["grokBillingSnapshotToQuotaInfo"])(snap);
            quotaCache.set(connectionId, {
                quota,
                fetchedAt: Date.now()
            });
            return quota;
        } finally{
            clearTimeout(timeout);
        }
    } catch  {
        // Fail-open: never disable the connection on quota fetch failure.
        // Provider Limits OAuth path refreshes tokens before a manual refresh.
        quotaCache.set(connectionId, {
            quota: null,
            fetchedAt: Date.now()
        });
        return null;
    }
}
function invalidateXaiOauthQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function registerXaiOauthQuotaFetcher() {
    for (const provider of XAI_OAUTH_PROVIDER_IDS){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])(provider, fetchXaiOauthQuota);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])(provider, fetchXaiOauthQuota);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["registerQuotaWindows"])(provider, [
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$grokQuotaFetcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GROK_WINDOW_WEEKLY"]
        ]);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_1iwscd8._.js.map