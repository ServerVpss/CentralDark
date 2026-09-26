module.exports = [
"[project]/src/lib/quota/saturationSignals.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setAnthropicSaturationDepsForTests",
    ()=>__setAnthropicSaturationDepsForTests,
    "__setGenericUsageFetcherForTests",
    ()=>__setGenericUsageFetcherForTests,
    "_clearRateLimitHeaders",
    ()=>_clearRateLimitHeaders,
    "_clearSaturationCache",
    ()=>_clearSaturationCache,
    "getSaturation",
    ()=>getSaturation,
    "getTokenHeaderSaturation",
    ()=>getTokenHeaderSaturation,
    "storeRateLimitHeaders",
    ()=>storeRateLimitHeaders
]);
/**
 * saturationSignals.ts — Read the current global saturation signal (0..1)
 * for a provider/connection/dimension combination.
 *
 * Strategy (per provider):
 *   codex            → codexQuotaFetcher (dual 5h + weekly window)
 *   bailian          → bailianQuotaFetcher (triple 5h + weekly + monthly window)
 *   anthropic/claude → REAL plan-window utilization from GET /api/oauth/usage
 *                      (the same path usage.ts already uses): window "5h" →
 *                      five_hour.utilization, "weekly" → seven_day.utilization.
 *                      Falls back to the per-minute REQUEST rate-limit headers
 *                      (anthropic-ratelimit-requests-*) only when no OAuth plan
 *                      window is available (e.g. API-key Claude connections).
 *   default          → getUsageForProvider (open-sse/services/usage.ts)
 *
 * Cache: in-memory Map, TTL = 30 seconds. The 30s TTL is what keeps the
 * NON-OFFICIAL, rate-limited oauth/usage endpoint from being polled per
 * request (it returns 429 under load) — never call it on the hot path without
 * this cache. usage.ts adds its own 429 cooldown on top.
 * Fail-open: on any error, return 0 (generous mode) and log pino.warn.
 * Hard Rule #12: no stack traces propagated to return values.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/accountBuckets.ts [app-route] (ecmascript)");
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("quota:saturation");
// ---------------------------------------------------------------------------
// In-memory cache (Map<cacheKey, CacheEntry>)
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 30_000; // 30 seconds
const _cache = new Map();
const _rateLimitHeaders = new Map();
const _tokenHeaders = new Map();
const RL_HEADER_TTL_MS = 5 * 60 * 1000; // 5 minutes
function _clearRateLimitHeaders() {
    _rateLimitHeaders.clear();
    _tokenHeaders.clear();
}
/**
 * Parse an OpenAI rate-limit reset DURATION string into milliseconds.
 * OpenAI reports token/request resets as Go-style durations, e.g. "6m0s",
 * "1s", "1h30m15s", "1.5s". Returns null when unparseable.
 */ function parseDurationMs(raw) {
    const s = raw.trim();
    if (!s) return null;
    // Bounded, non-overlapping segments to avoid ReDoS (PII learning #1).
    const re = /(\d+(?:\.\d+)?)(ms|h|m|s)/g;
    let total = 0;
    let matched = false;
    let m;
    while((m = re.exec(s)) !== null){
        matched = true;
        const value = Number(m[1]);
        if (!Number.isFinite(value)) return null;
        switch(m[2]){
            case "h":
                total += value * 3_600_000;
                break;
            case "m":
                total += value * 60_000;
                break;
            case "s":
                total += value * 1000;
                break;
            case "ms":
                total += value;
                break;
        }
    }
    return matched ? total : null;
}
/**
 * Normalize a token-reset header value to epoch ms.
 *   - Anthropic: RFC3339 timestamp ("2026-01-01T00:00:30Z") → Date.parse.
 *   - OpenAI: duration ("6m0s") → now + parsed ms.
 * Returns null when absent or unparseable.
 */ function normalizeTokenReset(raw, nowMs) {
    if (!raw) return null;
    const s = raw.trim();
    if (!s) return null;
    // RFC3339 / ISO-8601 if it looks like a date (YYYY-MM-DD with a time sep).
    if (/\d{4}-\d{2}-\d{2}/.test(s) && /[T:]/.test(s)) {
        const t = Date.parse(s);
        if (Number.isFinite(t)) return t;
    }
    // Otherwise treat as an OpenAI-style duration relative to now.
    const durMs = parseDurationMs(s);
    return durMs === null ? null : nowMs + durMs;
}
/**
 * Pick the first present {limit, remaining[, reset]} triple from a list of
 * header-key candidates, in priority order. Returns null when none are usable
 * (missing keys, non-finite, or limit <= 0).
 */ function pickTokenTriple(headers, candidates) {
    for (const c of candidates){
        const limitStr = headers[c.limit];
        const remainingStr = headers[c.remaining];
        if (limitStr === undefined || remainingStr === undefined) continue;
        const limit = Number(limitStr);
        const remaining = Number(remainingStr);
        if (Number.isFinite(limit) && limit > 0 && Number.isFinite(remaining)) {
            return {
                limit,
                remaining,
                reset: headers[c.reset]
            };
        }
    }
    return null;
}
function storeRateLimitHeaders(connectionId, provider, headers) {
    const key = `${provider}:${connectionId}`;
    // ── REQUEST headers (legacy path, unchanged) ──────────────────────────────
    // Anthropic: anthropic-ratelimit-requests-limit / anthropic-ratelimit-requests-remaining
    const limitStr = headers["anthropic-ratelimit-requests-limit"] ?? headers["x-ratelimit-limit-requests"] ?? headers["x-ratelimit-limit"];
    const remainingStr = headers["anthropic-ratelimit-requests-remaining"] ?? headers["x-ratelimit-remaining-requests"] ?? headers["x-ratelimit-remaining"];
    if (limitStr && remainingStr) {
        const limit = Number(limitStr);
        const remaining = Number(remainingStr);
        if (Number.isFinite(limit) && limit > 0 && Number.isFinite(remaining)) {
            _rateLimitHeaders.set(key, {
                limit,
                remaining,
                ts: Date.now()
            });
        }
    }
    // ── TOKEN headers (universal proactive saturation) ────────────────────────
    // Anthropic base tokens, then OpenAI x-ratelimit-*-tokens, then anthropic
    // input/output variants as a fallback. First usable triple wins.
    const tokenTriple = pickTokenTriple(headers, [
        {
            limit: "anthropic-ratelimit-tokens-limit",
            remaining: "anthropic-ratelimit-tokens-remaining",
            reset: "anthropic-ratelimit-tokens-reset"
        },
        {
            limit: "x-ratelimit-limit-tokens",
            remaining: "x-ratelimit-remaining-tokens",
            reset: "x-ratelimit-reset-tokens"
        },
        {
            limit: "anthropic-ratelimit-input-tokens-limit",
            remaining: "anthropic-ratelimit-input-tokens-remaining",
            reset: "anthropic-ratelimit-input-tokens-reset"
        },
        {
            limit: "anthropic-ratelimit-output-tokens-limit",
            remaining: "anthropic-ratelimit-output-tokens-remaining",
            reset: "anthropic-ratelimit-output-tokens-reset"
        }
    ]);
    if (tokenTriple) {
        const now = Date.now();
        _tokenHeaders.set(key, {
            limit: tokenTriple.limit,
            remaining: tokenTriple.remaining,
            resetAt: normalizeTokenReset(tokenTriple.reset, now),
            ts: now
        });
    }
}
function getTokenHeaderSaturation(provider, connectionId) {
    const entry = _tokenHeaders.get(`${provider}:${connectionId}`);
    if (!entry || Date.now() - entry.ts > RL_HEADER_TTL_MS) return null;
    if (!(entry.limit > 0)) return null;
    const used = entry.limit - entry.remaining;
    const saturation = Math.min(1, Math.max(0, used / entry.limit));
    return {
        saturation,
        resetAt: entry.resetAt
    };
}
function cacheKey(connectionId, provider, dim) {
    return `${provider}:${connectionId}:${dim.unit}:${dim.window}`;
}
function _clearSaturationCache() {
    _cache.clear();
}
// ---------------------------------------------------------------------------
// Provider-specific extractors
// ---------------------------------------------------------------------------
/**
 * Map QuotaWindow to the Codex window keys returned by the fetcher.
 */ function codexWindowKey(window) {
    switch(window){
        case "5h":
            return "session"; // CODEX_WINDOW_SESSION
        case "weekly":
            return "weekly"; // CODEX_WINDOW_WEEKLY
        default:
            return "session";
    }
}
async function fetchCodexSaturation(connectionId, dim, connection) {
    // Dynamic import — codexQuotaFetcher lives in open-sse workspace
    const mod = await __turbopack_context__.A("[project]/open-sse/services/codexQuotaFetcher.ts [app-route] (ecmascript, async loader)");
    // #6379: pass the loaded connection snapshot through so fetchCodexQuota can
    // read its accessToken/workspaceId even when this connection was never
    // registered via registerCodexConnection() (e.g. during headroom ranking,
    // which runs BEFORE any request is dispatched for the candidate). Without
    // this, fetchCodexQuota returns null for every candidate and saturation
    // fails open to 0 across the board — headroom then can't tell accounts
    // apart and keeps the original combo order.
    const quota = await mod.fetchCodexQuota(connectionId, connection);
    if (!quota) return 0;
    const winKey = codexWindowKey(dim.window);
    const windows = quota.windows;
    const win = windows[winKey];
    if (win && typeof win.percentUsed === "number") {
        return Math.min(1, Math.max(0, win.percentUsed));
    }
    // fallback to overall percentUsed
    return Math.min(1, Math.max(0, quota.percentUsed ?? 0));
}
async function fetchBailianSaturation(connectionId, dim) {
    const mod = await __turbopack_context__.A("[project]/open-sse/services/bailianQuotaFetcher.ts [app-route] (ecmascript, async loader)");
    const quota = await mod.fetchBailianQuota(connectionId);
    if (!quota) return 0;
    const q = quota;
    let pct = 0;
    switch(dim.window){
        case "5h":
            pct = q.window5h?.percentUsed ?? 0;
            break;
        case "weekly":
            pct = q.windowWeekly?.percentUsed ?? 0;
            break;
        case "monthly":
            pct = q.windowMonthly?.percentUsed ?? 0;
            break;
        default:
            pct = q.percentUsed ?? 0;
    }
    return Math.min(1, Math.max(0, pct));
}
/**
 * Per-minute REQUEST rate-limit headers fallback. Used only when the OAuth
 * plan-window utilization is unavailable (e.g. API-key Claude connections that
 * have no /api/oauth/usage data). This signal reflects TPM/RPM bursts, NOT the
 * 5h/weekly plan window, so it is a weak last resort.
 */ function anthropicHeaderSaturation(connectionId) {
    const entry = _rateLimitHeaders.get(`anthropic:${connectionId}`);
    if (!entry || Date.now() - entry.ts > RL_HEADER_TTL_MS) return 0;
    const used = entry.limit - entry.remaining;
    return Math.min(1, Math.max(0, used / entry.limit));
}
let _anthropicDepsOverride = null;
function __setAnthropicSaturationDepsForTests(deps) {
    _anthropicDepsOverride = deps;
}
async function defaultAnthropicDeps() {
    const [localDbMod, usageMod] = await Promise.all([
        __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/open-sse/services/usage.ts [app-route] (ecmascript, async loader)")
    ]);
    return {
        loadConnection: (connectionId)=>localDbMod.getCachedProviderConnectionById(connectionId),
        fetchUsage: (conn)=>usageMod.getUsageForProvider(conn)
    };
}
/**
 * Map a QuotaWindow to the Claude usage quota key produced by getClaudeUsage
 * (usage.ts). "session (5h)" carries five_hour.utilization and "weekly (7d)"
 * carries seven_day.utilization.
 */ function claudeUsageKeyForWindow(window) {
    switch(window){
        case "5h":
            return "session (5h)";
        case "weekly":
        case "monthly":
            // Anthropic exposes a 7-day plan window, not a monthly one — treat the
            // longer requested window as the weekly plan saturation.
            return "weekly (7d)";
        default:
            return null;
    }
}
/**
 * Extract the plan utilization (0..1) for the requested window from a
 * getClaudeUsage() result, or null when the OAuth plan window is unavailable
 * (e.g. legacy/admin API-key shape with no per-window quotas).
 */ function planUtilizationFromUsage(usage, window) {
    if (!usage || typeof usage !== "object") return null;
    const quotas = usage.quotas;
    if (!quotas || typeof quotas !== "object" || Array.isArray(quotas)) return null;
    const key = claudeUsageKeyForWindow(window);
    if (!key) return null;
    const entry = quotas[key];
    if (!entry || typeof entry !== "object") return null;
    // getClaudeUsage stores `used` = utilization (% used, 0..100).
    const used = entry.used;
    if (typeof used !== "number" || !Number.isFinite(used)) return null;
    return Math.min(1, Math.max(0, used / 100));
}
async function fetchAnthropicSaturation(connectionId, dim) {
    // Try the REAL plan-window utilization first (5h / weekly), via the same
    // /api/oauth/usage path usage.ts already uses. This is the signal fairShare
    // actually needs for Claude Pro/Max — the per-minute request headers do not
    // reflect the plan window. Any failure here falls back to the header path,
    // and ultimately fails open (0).
    try {
        const deps = _anthropicDepsOverride ?? await defaultAnthropicDeps();
        const conn = await deps.loadConnection(connectionId);
        // Only OAuth connections have plan-window usage; API-key Claude does not.
        const hasOauthToken = !!conn && typeof conn.accessToken === "string" && conn.accessToken.length > 0 && (conn.authType === undefined || conn.authType === "oauth");
        if (hasOauthToken) {
            const usage = await deps.fetchUsage(conn);
            // Update the per-window saturating buckets (Phase 3 #3) off the request
            // hot path — this runs behind the 30s saturation cache. Fail-open: any
            // bucket error must never affect the primary 0..1 saturation signal.
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateAccountBuckets"])(connectionId, usage, Date.now());
            } catch  {
            // intentionally swallowed — buckets are additive, never gate-breaking
            }
            const util = planUtilizationFromUsage(usage, dim.window);
            if (util !== null) return util;
        }
    } catch (err) {
        log.warn({
            err: err?.message,
            connectionId
        }, "anthropic oauth/usage saturation failed — falling back to rate-limit headers");
    }
    // Fallback: per-minute REQUEST rate-limit headers (weak, TPM/RPM only).
    return anthropicHeaderSaturation(connectionId);
}
let _genericUsageFetcherOverride = null;
function __setGenericUsageFetcherForTests(fetcher) {
    _genericUsageFetcherOverride = fetcher;
}
async function defaultGenericUsageFetch(connectionId, provider) {
    const mod = await __turbopack_context__.A("[project]/open-sse/services/usage.ts [app-route] (ecmascript, async loader)");
    const conn = {
        id: connectionId,
        provider
    };
    return mod.getUsageForProvider(conn);
}
async function fetchGenericSaturation(connectionId, provider) {
    // 1. Real usage percent is authoritative when present (a provider that
    //    actually reports utilization beats the burst-window token headers).
    try {
        const fetcher = _genericUsageFetcherOverride ?? defaultGenericUsageFetch;
        const result = await fetcher(connectionId, provider);
        if (result && typeof result === "object") {
            const obj = result;
            const pct = typeof obj.percentUsed === "number" ? obj.percentUsed : typeof obj.used_percent === "number" ? obj.used_percent : null;
            if (pct !== null && Number.isFinite(pct)) {
                return Math.min(1, Math.max(0, pct));
            }
        }
    } catch  {
    // fall through to the token-header complement
    }
    // 2. Complement/fallback: proactive TOKEN-header saturation (universal, rides
    //    on every response). Fail-open to 0 when no fresh token-header data.
    return getTokenHeaderSaturation(provider, connectionId)?.saturation ?? 0;
}
async function getSaturation(connectionId, provider, dim, connection) {
    const key = cacheKey(connectionId, provider, dim);
    const cached = _cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.value;
    }
    let value = 0;
    try {
        switch(provider){
            case "codex":
                value = await fetchCodexSaturation(connectionId, dim, connection);
                break;
            case "bailian":
                value = await fetchBailianSaturation(connectionId, dim);
                break;
            case "anthropic":
            case "claude":
                value = await fetchAnthropicSaturation(connectionId, dim);
                break;
            default:
                value = await fetchGenericSaturation(connectionId, provider);
                break;
        }
    } catch (err) {
        log.warn({
            err: err?.message,
            connectionId,
            provider
        }, "saturation fetch failed — failing open with 0");
        value = 0;
    }
    _cache.set(key, {
        value,
        ts: Date.now()
    });
    return value;
}
}),
];

//# sourceMappingURL=src_lib_quota_saturationSignals_ts_0lz37kc._.js.map