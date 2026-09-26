module.exports = [
"[project]/open-sse/config/credentialLoader.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadProviderCredentials",
    ()=>loadProviderCredentials
]);
/**
 * Credential Loader — Reads provider credentials from an external JSON file.
 *
 * Loads `provider-credentials.json` from the data directory and merges it
 * over the hardcoded defaults in PROVIDERS. This keeps credentials out of
 * source control while maintaining backwards compatibility (hardcoded values
 * serve as defaults when the file is absent).
 *
 * Expected JSON structure:
 * {
 *   "claude": { "clientId": "..." },
 *   "gemini": { "clientId": "...", "clientSecret": "..." },
 *   ...
 * }
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
// Fields that can be overridden per provider
const CREDENTIAL_FIELDS = [
    "clientId",
    "clientSecret",
    "tokenUrl",
    "authUrl",
    "refreshUrl"
];
// TTL-based cache — reloads credentials from disk at most once per minute
const CONFIG_TTL_MS = 60_000;
let lastLoadTime = 0;
let cachedProviders = null;
function credGlobals() {
    return globalThis;
}
function resolveCredentialsPath() {
    let resolveDataDir;
    try {
        resolveDataDir = __turbopack_context__.r("[project]/src/lib/dataPaths.ts [app-route] (ecmascript)").resolveDataDir;
    } catch (err) {
        const fallbackDataDir = process.env.DATA_DIR || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "data");
        console.warn(`[CREDENTIALS] Could not load dataPaths module, using fallback: ${fallbackDataDir}`);
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(fallbackDataDir, "provider-credentials.json");
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(resolveDataDir(), "provider-credentials.json");
}
function loadProviderCredentials(providers) {
    if (cachedProviders && Date.now() - lastLoadTime < CONFIG_TTL_MS) {
        return cachedProviders;
    }
    const credPath = resolveCredentialsPath();
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(credPath)) {
        if (!credGlobals().__omnirouteCredNoFileLogged) {
            console.log("[CREDENTIALS] No external credentials file found, using defaults.");
            credGlobals().__omnirouteCredNoFileLogged = true;
        }
        cachedProviders = providers;
        lastLoadTime = Date.now();
        return providers;
    }
    try {
        const raw = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(credPath, "utf-8");
        const external = JSON.parse(raw);
        let overrideCount = 0;
        const mutableProviders = providers;
        for (const [providerKey, creds] of Object.entries(external)){
            if (!mutableProviders[providerKey]) {
                console.log(`[CREDENTIALS] Warning: unknown provider "${providerKey}" in credentials file, skipping.`);
                continue;
            }
            if (!creds || typeof creds !== "object") {
                console.log(`[CREDENTIALS] Warning: provider "${providerKey}" value must be an object, got ${typeof creds}. Skipping.`);
                continue;
            }
            const credentialOverrides = creds;
            for (const field of CREDENTIAL_FIELDS){
                if (credentialOverrides[field] !== undefined) {
                    mutableProviders[providerKey][field] = credentialOverrides[field];
                    overrideCount++;
                }
            }
        }
        const isReload = cachedProviders !== null;
        console.log(`[CREDENTIALS] ${isReload ? "Reloaded" : "Loaded"} external credentials: ${overrideCount} field(s) from ${credPath}`);
    } catch (err) {
        const reason = err instanceof SyntaxError ? "Invalid JSON format" : err.code || "read error";
        console.log(`[CREDENTIALS] Error reading credentials file (${reason}). Using defaults.`);
    }
    cachedProviders = providers;
    lastLoadTime = Date.now();
    return providers;
}
}),
"[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_DEFAULT_SYSTEM",
    ()=>ANTIGRAVITY_DEFAULT_SYSTEM,
    "ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE",
    ()=>ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE,
    "BACKOFF_STEPS_MS",
    ()=>BACKOFF_STEPS_MS,
    "CACHE_TTL",
    ()=>CACHE_TTL,
    "CLAUDE_SYSTEM_PROMPT",
    ()=>CLAUDE_SYSTEM_PROMPT,
    "CREDENTIAL_HEALTH_CACHE_TTL",
    ()=>CREDENTIAL_HEALTH_CACHE_TTL,
    "CREDENTIAL_HEALTH_CHECK_INTERVAL",
    ()=>CREDENTIAL_HEALTH_CHECK_INTERVAL,
    "DEFAULT_API_LIMITS",
    ()=>DEFAULT_API_LIMITS,
    "DEFAULT_MAX_TOKENS",
    ()=>DEFAULT_MAX_TOKENS,
    "DEFAULT_MIN_TOKENS",
    ()=>DEFAULT_MIN_TOKENS,
    "DEFAULT_PROVIDER_MAX_TOKENS",
    ()=>DEFAULT_PROVIDER_MAX_TOKENS,
    "FETCH_BODY_TIMEOUT_MS",
    ()=>FETCH_BODY_TIMEOUT_MS,
    "FETCH_TIMEOUT_MS",
    ()=>FETCH_TIMEOUT_MS,
    "HTTP_STATUS",
    ()=>HTTP_STATUS,
    "MAX_TOOLS_LIMIT",
    ()=>MAX_TOOLS_LIMIT,
    "OAUTH_ENDPOINTS",
    ()=>OAUTH_ENDPOINTS,
    "PROVIDERS",
    ()=>PROVIDERS,
    "PROVIDER_MAX_TOKENS",
    ()=>PROVIDER_MAX_TOKENS,
    "PROVIDER_PROFILES",
    ()=>PROVIDER_PROFILES,
    "RateLimitReason",
    ()=>RateLimitReason,
    "SKIP_PATTERNS",
    ()=>SKIP_PATTERNS,
    "SSE_HEARTBEAT_INTERVAL_MS",
    ()=>SSE_HEARTBEAT_INTERVAL_MS,
    "STREAM_IDLE_TIMEOUT_MS",
    ()=>STREAM_IDLE_TIMEOUT_MS,
    "STREAM_READINESS_MAX_TIMEOUT_MS",
    ()=>STREAM_READINESS_MAX_TIMEOUT_MS,
    "STREAM_READINESS_TIMEOUT_MS",
    ()=>STREAM_READINESS_TIMEOUT_MS,
    "STREAM_RECOVERY",
    ()=>STREAM_RECOVERY
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$credentialLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/credentialLoader.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
;
;
;
const upstreamTimeouts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUpstreamTimeoutConfig"])(process.env, (message)=>{
    console.warn(`[open-sse] ${message}`);
});
const FETCH_TIMEOUT_MS = upstreamTimeouts.fetchTimeoutMs;
const STREAM_IDLE_TIMEOUT_MS = upstreamTimeouts.streamIdleTimeoutMs;
const STREAM_READINESS_TIMEOUT_MS = upstreamTimeouts.streamReadinessTimeoutMs;
const STREAM_READINESS_MAX_TIMEOUT_MS = upstreamTimeouts.streamReadinessMaxTimeoutMs;
const ANTIGRAVITY_PRE_RESPONSE_TIMEOUT_CODE = "ANTIGRAVITY_PRE_RESPONSE_TIMEOUT";
const SSE_HEARTBEAT_INTERVAL_MS = upstreamTimeouts.sseHeartbeatIntervalMs;
const FETCH_BODY_TIMEOUT_MS = upstreamTimeouts.fetchBodyTimeoutMs;
// Provider configurations
// OAuth credentials read from env vars with hardcoded fallbacks for backward compatibility.
// Use provider-credentials.json or env vars to override in production.
// Lazy PROVIDERS: deferred until first property access to speed up startup.
// The Proxy defers `generateLegacyProviders()` + `loadProviderCredentials()`
// from module-evaluation time to the first read of any provider property.
let _providers = null;
function initProviders() {
    if (!_providers) {
        const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateLegacyProviders"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$credentialLoader$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadProviderCredentials"])(p);
        _providers = p;
    }
    return _providers;
}
const PROVIDERS = new Proxy({}, {
    get (_, prop) {
        if (typeof prop === 'symbol') return undefined;
        return Reflect.get(initProviders(), prop, _providers);
    },
    has (_, prop) {
        if (typeof prop === 'symbol') return false;
        return Reflect.has(initProviders(), prop);
    },
    ownKeys () {
        return Reflect.ownKeys(initProviders());
    },
    getOwnPropertyDescriptor (_, prop) {
        if (typeof prop === 'symbol') return undefined;
        return Object.getOwnPropertyDescriptor(initProviders(), prop);
    },
    set (_, prop, value) {
        if (typeof prop === 'symbol') return false;
        initProviders()[prop] = value;
        return true;
    },
    deleteProperty (_, prop) {
        if (typeof prop === 'symbol') return false;
        return Reflect.deleteProperty(initProviders(), prop);
    }
});
const CLAUDE_SYSTEM_PROMPT = "You are Claude Code, Anthropic's official CLI for Claude.";
const ANTIGRAVITY_DEFAULT_SYSTEM = "You are Antigravity, a powerful agentic AI coding assistant designed by the Google Deepmind team working on Advanced Agentic Coding.\n" + "You are pair programming with a USER to solve their coding task. The task may require creating a new codebase, modifying or debugging an existing codebase, or simply answering a question.\n" + "**Absolute paths only**\n" + "**Proactiveness**";
const OAUTH_ENDPOINTS = {
    google: {
        token: "https://oauth2.googleapis.com/token",
        auth: "https://accounts.google.com/o/oauth2/auth"
    },
    openai: {
        token: "https://auth.openai.com/oauth/token",
        auth: "https://auth.openai.com/oauth/authorize"
    },
    anthropic: {
        token: "https://api.anthropic.com/v1/oauth/token",
        auth: "https://api.anthropic.com/v1/oauth/authorize"
    },
    qoder: {
        token: process.env.QODER_OAUTH_TOKEN_URL || "",
        auth: process.env.QODER_OAUTH_AUTHORIZE_URL || ""
    },
    github: {
        token: "https://github.com/login/oauth/access_token",
        auth: "https://github.com/login/oauth/authorize",
        deviceCode: "https://github.com/login/device/code"
    }
};
const CACHE_TTL = {
    userInfo: 300,
    modelAlias: 3600
};
const DEFAULT_MAX_TOKENS = 64000;
const DEFAULT_MIN_TOKENS = 32000;
const PROVIDER_MAX_TOKENS = {
    groq: 16384,
    openai: 16384,
    anthropic: 65536,
    gemini: 65536,
    sensenova: 65536
};
const DEFAULT_PROVIDER_MAX_TOKENS = 32000;
const HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
    REQUEST_TIMEOUT: 408,
    RATE_LIMITED: 429,
    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};
;
const BACKOFF_STEPS_MS = [
    60_000,
    120_000,
    300_000,
    600_000,
    1_200_000
];
const RateLimitReason = {
    QUOTA_EXHAUSTED: "quota_exhausted",
    RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
    MODEL_CAPACITY: "model_capacity",
    SERVER_ERROR: "server_error",
    AUTH_ERROR: "auth_error",
    UNKNOWN: "unknown"
};
// ─── Provider Resilience Profiles ───────────────────────────────────────────
// Separate behavior for OAuth (low-limit, session-based) vs API Key (high-limit, metered)
// Circuit-breaker thresholds and reset windows are overridable via
// OMNIROUTE_CIRCUIT_BREAKER_* env vars so operators can dampen or harden
// behavior without recompiling.
function envInt(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || raw === null || raw === "") return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
const PROVIDER_PROFILES = {
    oauth: {
        transientCooldown: 5000,
        rateLimitCooldown: 60000,
        maxBackoffLevel: 8,
        circuitBreakerThreshold: envInt("OMNIROUTE_CIRCUIT_BREAKER_OAUTH_THRESHOLD", 8),
        circuitBreakerReset: envInt("OMNIROUTE_CIRCUIT_BREAKER_OAUTH_RESET_MS", 60000),
        // Provider-level circuit breaker (entire provider cooldown after repeated failures)
        providerFailureThreshold: 10,
        providerFailureWindowMs: 900000,
        providerCooldownMs: 300000,
        // Adaptive circuit breaker v2 settings
        degradationThreshold: 5,
        maxBackoffMultiplier: 8,
        backoffEscalationCount: 2
    },
    apikey: {
        transientCooldown: 3000,
        rateLimitCooldown: 0,
        maxBackoffLevel: 5,
        circuitBreakerThreshold: envInt("OMNIROUTE_CIRCUIT_BREAKER_API_KEY_THRESHOLD", 12),
        circuitBreakerReset: envInt("OMNIROUTE_CIRCUIT_BREAKER_API_KEY_RESET_MS", 30000),
        // Provider-level circuit breaker (entire provider cooldown after repeated failures)
        providerFailureThreshold: 15,
        providerFailureWindowMs: 1800000,
        providerCooldownMs: 600000,
        degradationThreshold: 7,
        maxBackoffMultiplier: 4,
        backoffEscalationCount: 3
    },
    // Local providers (localhost inference backends like Ollama, LM Studio, oMLX).
    // Not yet wired into getProviderProfile() — will be used when local provider_nodes
    // are integrated into the resilience layer. Kept here to avoid a second constants change.
    local: {
        transientCooldown: 2000,
        rateLimitCooldown: 5000,
        maxBackoffLevel: 3,
        circuitBreakerThreshold: envInt("OMNIROUTE_CIRCUIT_BREAKER_LOCAL_THRESHOLD", 2),
        circuitBreakerReset: envInt("OMNIROUTE_CIRCUIT_BREAKER_LOCAL_RESET_MS", 15000),
        // Provider-level circuit breaker (entire provider cooldown after repeated failures)
        providerFailureThreshold: 2,
        providerFailureWindowMs: 300000,
        providerCooldownMs: 60000
    }
};
const DEFAULT_API_LIMITS = {
    requestsPerMinute: 60,
    minTimeBetweenRequests: 350,
    concurrentRequests: 6
};
const SKIP_PATTERNS = [
    "Please write a 5-10 word title for the following conversation:"
];
const MAX_TOOLS_LIMIT = 128;
const CREDENTIAL_HEALTH_CHECK_INTERVAL = (()=>{
    const raw = process.env.CREDENTIAL_HEALTH_CHECK_INTERVAL;
    if (raw) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed) && parsed >= 10_000) return parsed;
    }
    return 300_000;
})();
const CREDENTIAL_HEALTH_CACHE_TTL = (()=>{
    const raw = process.env.CREDENTIAL_HEALTH_CACHE_TTL;
    if (raw) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed) && parsed >= 10_000) return parsed;
    }
    return 300_000;
})();
const STREAM_RECOVERY = {
    HOLDBACK_MS: 750,
    BUFFER_MAX_BYTES: 65536,
    EARLY_RETRY_MAX: 4
};
}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[project]/open-sse/utils/setupPolyfill.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
// Polyfill worker_threads.markAsUncloneable for Node.js < 21 compatibility (specifically Node 20.20.2)
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:worker_threads [external] (node:worker_threads, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__ = __turbopack_context__.i("[externals]/ws [external] (ws, esm_import, [project]/node_modules/ws)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"] && !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUncloneable) {
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUncloneable = function(obj) {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUntransferable) {
            try {
                __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$worker_threads__$5b$external$5d$__$28$node$3a$worker_threads$2c$__cjs$29$__["default"].markAsUntransferable(obj);
            } catch  {
            // no-op
            }
        }
    };
}
// Polyfill Promise.withResolvers for Node.js < 22 compatibility (specifically Node 20.20.2)
if (typeof Promise.withResolvers === "undefined") {
    Promise.withResolvers = function() {
        let resolve;
        let reject;
        const promise = new Promise((res, rej)=>{
            resolve = res;
            reject = rej;
        });
        return {
            promise,
            resolve,
            reject
        };
    };
}
// Polyfill WebSocket for Node.js < 22 compatibility (specifically Node 20.20.2)
if (typeof globalThis.WebSocket === "undefined") {
    globalThis.WebSocket = __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["WebSocket"];
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:timers [external] (node:timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:timers", () => require("node:timers"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/open-sse/utils/proxyFamily.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectIpLiteralFamily",
    ()=>detectIpLiteralFamily,
    "parseProxyFamily",
    ()=>parseProxyFamily,
    "stripIpv6Brackets",
    ()=>stripIpv6Brackets
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
;
function stripIpv6Brackets(host) {
    if (typeof host !== "string") return "";
    if (host.startsWith("[") && host.endsWith("]")) {
        return host.slice(1, -1);
    }
    return host;
}
function detectIpLiteralFamily(host) {
    const bare = stripIpv6Brackets(host);
    const v = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(bare);
    return v === 0 ? null : v;
}
function parseProxyFamily(value) {
    return value === "ipv4" || value === "ipv6" ? value : "auto";
}
}),
"[project]/open-sse/utils/socksConnectorWithFamily.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSocksFamilySocketOptions",
    ()=>buildSocksFamilySocketOptions,
    "createSocksDispatcherWithFamily",
    ()=>createSocksDispatcherWithFamily,
    "resolveSocksHandshakeTimeoutMs",
    ()=>resolveSocksHandshakeTimeoutMs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socks$2f$build$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/socks/build/index.js [app-route] (ecmascript)");
;
;
const DEFAULT_SOCKS_HANDSHAKE_TIMEOUT_MS = 10_000;
const MAX_SOCKS_HANDSHAKE_TIMEOUT_MS = 120_000;
function resolveSocksHandshakeTimeoutMs(env = process.env) {
    const raw = env.SOCKS_HANDSHAKE_TIMEOUT_MS;
    if (raw == null || raw.trim() === "") return DEFAULT_SOCKS_HANDSHAKE_TIMEOUT_MS;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_SOCKS_HANDSHAKE_TIMEOUT_MS;
    return Math.min(Math.floor(parsed), MAX_SOCKS_HANDSHAKE_TIMEOUT_MS);
}
function buildSocksFamilySocketOptions(family) {
    if (family === 6) return {
        family: 6,
        autoSelectFamily: false
    };
    if (family === 4) return {
        family: 4,
        autoSelectFamily: false
    };
    return {};
}
function resolvePort(protocol, port) {
    return port ? Number.parseInt(port, 10) : protocol === "http:" ? 80 : 443;
}
/**
 * Undici connector that tunnels through a single SOCKS5 proxy, pinning the family
 * of the TCP connection to the proxy host when `family` is set. Mirrors fetch-socks'
 * socksConnector but threads `socket_options` (which fetch-socks does not expose)
 * into SocksClient so Happy Eyeballs cannot pick IPv4 for an IPv6-only egress policy.
 */ function socksConnectorWithFamily(proxy, family, tlsOpts = {}) {
    const undiciConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildConnector"])(tlsOpts);
    const socketOptions = buildSocksFamilySocketOptions(family);
    return async (options, callback)=>{
        const { protocol, hostname, port, httpSocket } = options;
        try {
            const r = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socks$2f$build$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SocksClient"].createConnection({
                command: "connect",
                proxy,
                timeout: resolveSocksHandshakeTimeoutMs(),
                destination: {
                    host: hostname,
                    port: resolvePort(protocol, port)
                },
                existing_socket: httpSocket,
                socket_options: socketOptions
            });
            const sock = r.socket;
            if (protocol !== "https:") {
                return callback(null, sock.setNoDelay());
            }
            return undiciConnect({
                ...options,
                httpSocket: sock
            }, callback);
        } catch (error) {
            return callback(error, null);
        }
    };
}
function createSocksDispatcherWithFamily(proxy, family, agentOptions = {}) {
    const { connect, ...rest } = agentOptions;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agent"]({
        ...rest,
        connect: socksConnectorWithFamily(proxy, family, connect)
    });
}
}),
"[project]/open-sse/utils/proxyDispatcherCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__cacheProxyDispatcherForTest",
    ()=>__cacheProxyDispatcherForTest,
    "clearDispatcherCache",
    ()=>clearDispatcherCache,
    "createRoundRobinDispatcher",
    ()=>createRoundRobinDispatcher,
    "getDefaultCachedDispatcher",
    ()=>getDefaultCachedDispatcher,
    "getDispatcherCache",
    ()=>getDispatcherCache,
    "getRetryCachedDispatcher",
    ()=>getRetryCachedDispatcher,
    "setDefaultCachedDispatcher",
    ()=>setDefaultCachedDispatcher,
    "setDispatcherCacheEntry",
    ()=>setDispatcherCacheEntry,
    "setRetryCachedDispatcher",
    ()=>setRetryCachedDispatcher
]);
const DISPATCHER_CACHE_KEY = Symbol.for("omniroute.proxyDispatcher.cache");
const DEFAULT_DISPATCHER_KEY = Symbol.for("omniroute.proxyDispatcher.default");
const RETRY_DISPATCHER_KEY = Symbol.for("omniroute.proxyDispatcher.retry");
/** Upper bound on cached per-URL proxy dispatchers; oldest entries are evicted first. */ const MAX_DISPATCHER_CACHE_ENTRIES = 512;
/**
 * Direct upstream fan-out dispatcher.
 *
 * A single Undici Agent configured with `connections > 1` should be enough in
 * theory, but real Codex `/backend-api/codex/responses` streams on Node 24 have
 * still been observed queuing every subsequent same-origin request until the
 * previous stream emits trailers. Using several one-connection Agents gives
 * each long SSE stream an independent pool/client and prevents one stream from
 * monopolizing the effective queue while keeping pipelining disabled.
 */ class RoundRobinDispatcher {
    dispatchers;
    nextIndex = 0;
    constructor(dispatchers){
        this.dispatchers = dispatchers;
    }
    dispatch(options, handler) {
        const dispatcher = this.dispatchers[this.nextIndex % this.dispatchers.length];
        this.nextIndex = (this.nextIndex + 1) % this.dispatchers.length;
        return dispatcher.dispatch(options, handler);
    }
    close(callback) {
        const done = Promise.all(this.dispatchers.map((dispatcher)=>dispatcher.close())).then(()=>undefined);
        if (callback) {
            done.then(callback);
            return;
        }
        return done;
    }
    destroy(errorOrCallback, callback) {
        const callbackFn = typeof errorOrCallback === "function" ? errorOrCallback : callback;
        const error = typeof errorOrCallback === "function" ? null : errorOrCallback ?? null;
        const done = Promise.all(this.dispatchers.map((dispatcher)=>dispatcher.destroy(error))).then(()=>undefined);
        if (callbackFn) {
            done.then(callbackFn);
            return;
        }
        return done;
    }
}
function createRoundRobinDispatcher(dispatchers) {
    return new RoundRobinDispatcher(dispatchers);
}
function getDispatcherCache() {
    const globalWithCache = globalThis;
    if (!globalWithCache[DISPATCHER_CACHE_KEY]) {
        globalWithCache[DISPATCHER_CACHE_KEY] = new Map();
    }
    return globalWithCache[DISPATCHER_CACHE_KEY];
}
function getDefaultCachedDispatcher() {
    return globalThis[DEFAULT_DISPATCHER_KEY];
}
function setDefaultCachedDispatcher(dispatcher) {
    globalThis[DEFAULT_DISPATCHER_KEY] = dispatcher;
}
function getRetryCachedDispatcher() {
    return globalThis[RETRY_DISPATCHER_KEY];
}
function setRetryCachedDispatcher(dispatcher) {
    globalThis[RETRY_DISPATCHER_KEY] = dispatcher;
}
function closeDispatcher(dispatcher) {
    if (!dispatcher) return;
    try {
        const result = dispatcher.close();
        if (result && typeof result.catch === "function") {
            void result.catch(()=>{});
        }
    } catch  {}
}
function clearDispatcherCache() {
    const cache = getDispatcherCache();
    for (const dispatcher of cache.values()){
        closeDispatcher(dispatcher);
    }
    cache.clear();
    const globalWithCache = globalThis;
    closeDispatcher(globalWithCache[DEFAULT_DISPATCHER_KEY]);
    closeDispatcher(globalWithCache[RETRY_DISPATCHER_KEY]);
    delete globalWithCache[DEFAULT_DISPATCHER_KEY];
    delete globalWithCache[RETRY_DISPATCHER_KEY];
}
function __cacheProxyDispatcherForTest(key, dispatcher) {
    getDispatcherCache().set(key, dispatcher);
}
function setDispatcherCacheEntry(key, dispatcher) {
    const cache = getDispatcherCache();
    if (cache.size >= MAX_DISPATCHER_CACHE_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) {
            const evicted = cache.get(oldest);
            cache.delete(oldest);
            closeDispatcher(evicted);
        }
    }
    cache.set(key, dispatcher);
}
}),
"[project]/open-sse/utils/proxyDispatcher.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "RELAY_TYPES",
    ()=>RELAY_TYPES,
    "__createRoundRobinDispatcherForTest",
    ()=>__createRoundRobinDispatcherForTest,
    "__getDefaultDispatcherOptionsForTest",
    ()=>__getDefaultDispatcherOptionsForTest,
    "__getProxyDispatcherOptionsForTest",
    ()=>__getProxyDispatcherOptionsForTest,
    "__getSocksOptionsForTest",
    ()=>__getSocksOptionsForTest,
    "__resolveDispatcherFamilyForTest",
    ()=>__resolveDispatcherFamilyForTest,
    "buildRelayHeaders",
    ()=>buildRelayHeaders,
    "buildVercelRelayHeaders",
    ()=>buildVercelRelayHeaders,
    "createProxyDispatcher",
    ()=>createProxyDispatcher,
    "getDefaultDispatcher",
    ()=>getDefaultDispatcher,
    "getDefaultDispatcherConnectionLimit",
    ()=>getDefaultDispatcherConnectionLimit,
    "getProxyDispatcherConnectionLimit",
    ()=>getProxyDispatcherConnectionLimit,
    "getProxyRetryDispatcher",
    ()=>getProxyRetryDispatcher,
    "getRetryDispatcher",
    ()=>getRetryDispatcher,
    "isRelayType",
    ()=>isRelayType,
    "isSocks5ProxyEnabled",
    ()=>isSocks5ProxyEnabled,
    "normalizeProxyUrl",
    ()=>normalizeProxyUrl,
    "proxyConfigToUrl",
    ()=>proxyConfigToUrl,
    "proxyUrlForLogs",
    ()=>proxyUrlForLogs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/setupPolyfill.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$socks$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/fetch-socks/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$socksConnectorWithFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/socksConnectorWithFamily.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcherCache.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const SUPPORTED_PROTOCOLS = new Set([
    "http:",
    "https:",
    "socks5:"
]);
const RELAY_TYPES = new Set([
    "vercel",
    "deno",
    "cloudflare"
]);
function isRelayType(type) {
    return typeof type === "string" && RELAY_TYPES.has(type);
}
const DEFAULT_PROXY_DISPATCHER_CONNECTIONS = 32;
const MAX_PROXY_DISPATCHER_CONNECTIONS = 256;
function getDispatcherOptions() {
    const timeouts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUpstreamTimeoutConfig"])(process.env, (message)=>{
        console.warn(`[ProxyDispatcher] ${message}`);
    });
    return {
        headersTimeout: timeouts.fetchHeadersTimeoutMs,
        bodyTimeout: timeouts.fetchBodyTimeoutMs,
        connectTimeout: timeouts.fetchConnectTimeoutMs,
        keepAliveTimeout: timeouts.fetchKeepAliveTimeoutMs,
        // Without this, an upstream Keep-Alive: timeout=N header clamps
        // keepAliveTimeout UP to undici's default keepAliveMaxTimeout (600 s),
        // completely overriding the configured 1 s and restoring zombie-socket risk.
        keepAliveMaxTimeout: timeouts.fetchKeepAliveTimeoutMs,
        // 9router#1237: RFC 8305 Happy Eyeballs. undici does not
        // enable it by default, so when DNS returns both AAAA (IPv6) and A (IPv4)
        // and the IPv6 route is broken (e.g. NAT64 `64:ff9b::` without routing),
        // the direct egress connect hangs until ETIMEDOUT — even though `curl`
        // (which has Happy Eyeballs) reaches the same host. Race both families and
        // use whichever connects first. The proxy path pins family via `proxyTls`
        // and ProxyAgent ignores `connect`, so this only affects direct egress.
        // undici types `connect` as a union whose TcpNetConnectOpts member nominally
        // requires `port`; at runtime undici merges these into net.connect (the origin
        // already carries host:port), so the partial pin is valid — cast to suppress
        // the spurious missing-`port` error, mirroring the `proxyTls` cast below.
        connect: {
            autoSelectFamily: true,
            autoSelectFamilyAttemptTimeout: 1000
        }
    };
}
function getProxyDispatcherConnectionLimit(env = process.env) {
    const raw = env.OMNIROUTE_PROXY_DISPATCHER_CONNECTIONS;
    if (raw == null || raw.trim() === "") return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) {
        console.warn(`[ProxyDispatcher] Invalid OMNIROUTE_PROXY_DISPATCHER_CONNECTIONS="${raw}". Using default ${DEFAULT_PROXY_DISPATCHER_CONNECTIONS}.`);
        return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    }
    return Math.min(Math.floor(parsed), MAX_PROXY_DISPATCHER_CONNECTIONS);
}
function getProxyDispatcherOptions(env = process.env) {
    const options = getDispatcherOptions();
    // #9100: restore keep-alive on the proxy path. The previous hard-coded
    // keepAliveTimeout: 1 (1ms) destroyed the pooled socket right after every
    // response, forcing a fresh TCP+TLS+CONNECT handshake per request. Proxies
    // that throttle connection churn then serialized concurrent requests behind
    // ~30s stalls (5 concurrent → 1 fast + 4× ~29.5s). The socket now stays
    // alive for at least 30s (the default fetchKeepAliveTimeoutMs is 4s), and
    // keepAliveMaxTimeout is raised so an upstream Keep-Alive header cannot
    // clamp it back down to a sub-second value.
    //
    // Stale pooled sockets (a proxy that silently drops idle ones) are recovered
    // by the retry-once-with-fresh-socket path in proxyFetch.ts (mirrors the
    // direct-path #4252 fix) instead of by killing all idle sockets after 1ms.
    //
    // Pipelining 4 lets concurrent SSE streams multiplex over the pooled
    // connection instead of each opening its own socket (#4163 regression).
    return {
        ...options,
        connections: getProxyDispatcherConnectionLimit(env),
        keepAliveTimeout: Math.max(options.keepAliveTimeout, 30_000),
        keepAliveMaxTimeout: Math.max(options.keepAliveMaxTimeout, 60_000),
        pipelining: 4
    };
}
function getDefaultDispatcherConnectionLimit(env = process.env) {
    const raw = env.OMNIROUTE_DIRECT_DISPATCHER_CONNECTIONS;
    if (raw == null || raw.trim() === "") return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) {
        console.warn(`[ProxyDispatcher] Invalid OMNIROUTE_DIRECT_DISPATCHER_CONNECTIONS="${raw}". Using default ${DEFAULT_PROXY_DISPATCHER_CONNECTIONS}.`);
        return DEFAULT_PROXY_DISPATCHER_CONNECTIONS;
    }
    return Math.min(Math.floor(parsed), MAX_PROXY_DISPATCHER_CONNECTIONS);
}
function getDefaultDispatcherOptions(env = process.env) {
    const options = getDispatcherOptions();
    // #4580 — On the direct egress path, undici's default pipelining (1) let a long
    // SSE stream monopolize the single pooled socket per origin. Keep the public
    // connection-limit option here, but getDefaultDispatcher() fans it out across
    // independent one-connection Agents; in production traces, one multi-connection
    // Agent could still queue same-origin Codex streams behind prior trailers.
    return {
        ...options,
        connections: getDefaultDispatcherConnectionLimit(env),
        pipelining: 0
    };
}
function createRoundRobinDirectDispatcher(connectionLimit) {
    const baseOptions = getDispatcherOptions();
    const perAgentOptions = {
        ...baseOptions,
        connections: 1,
        pipelining: 0
    };
    const dispatchers = Array.from({
        length: connectionLimit
    }, ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agent"](perAgentOptions));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRoundRobinDispatcher"])(dispatchers);
}
function getDefaultDispatcher() {
    let dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultCachedDispatcher"])();
    if (!dispatcher) {
        dispatcher = createRoundRobinDirectDispatcher(getDefaultDispatcherConnectionLimit());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setDefaultCachedDispatcher"])(dispatcher);
    }
    return dispatcher;
}
function getRetryDispatcher() {
    let dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRetryCachedDispatcher"])();
    if (!dispatcher) {
        dispatcher = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agent"]({
            ...getDispatcherOptions(),
            keepAliveTimeout: 1,
            keepAliveMaxTimeout: 1,
            pipelining: 0
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setRetryCachedDispatcher"])(dispatcher);
    }
    return dispatcher;
}
/**
 * Extract the port from a proxy URL string before URL parsing.
 * `new URL("http://host:80")` strips port 80 since it's the HTTP default,
 * but proxy servers commonly listen on port 80/443, so we need to preserve it.
 */ function extractExplicitPort(urlStr) {
    try {
        const idx = urlStr.indexOf("://");
        if (idx === -1) return null;
        const authorityStart = idx + 3;
        const authorityEnd = urlStr.indexOf("/", authorityStart);
        const authority = authorityEnd === -1 ? urlStr.slice(authorityStart) : urlStr.slice(authorityStart, authorityEnd);
        const lastColon = authority.lastIndexOf(":");
        const atSign = authority.lastIndexOf("@");
        if (lastColon !== -1 && lastColon > atSign) {
            const portStr = authority.slice(lastColon + 1);
            if (/^\d+$/.test(portStr)) {
                const port = Number(portStr);
                if (Number.isInteger(port) && port >= 1 && port <= 65535) return String(port);
            }
        }
    } catch  {}
    return null;
}
function defaultPortForProtocol(protocol) {
    if (protocol === "https:" || protocol === "wss:") return "443";
    if (protocol === "socks5:") return "1080";
    return "8080";
}
function normalizePort(port, protocol) {
    if (!port) return defaultPortForProtocol(protocol);
    const parsed = Number(port);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("[ProxyDispatcher] Invalid proxy port");
    }
    return String(parsed);
}
/**
 * Build a proxy URL string manually from parsed URL components.
 * We cannot use URL.toString() because the URL serializer silently strips
 * default ports (80 for http, 443 for https). Proxy servers commonly
 * listen on these ports, so we must always include the port explicitly.
 */ function buildProxyUrlString(parsed, port) {
    const auth = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@` : "";
    return `${parsed.protocol}//${auth}${parsed.hostname}:${port}`;
}
function isSocks5ProxyEnabled() {
    const raw = (process.env.ENABLE_SOCKS5_PROXY ?? "").trim().toLowerCase();
    return ![
        "false",
        "0",
        "no",
        "off"
    ].includes(raw);
}
function proxyUrlForLogs(proxyUrl) {
    const explicitPort = extractExplicitPort(proxyUrl);
    const parsed = new URL(proxyUrl);
    const port = explicitPort || parsed.port || defaultPortForProtocol(parsed.protocol);
    return `${parsed.protocol}//${parsed.hostname}:${port}`;
}
function normalizeProxyUrl(proxyUrl, source = "proxy", { allowSocks5 = isSocks5ProxyEnabled() } = {}) {
    // Strip a trailing synthetic `?family=ipv4|ipv6` marker BEFORE anything else.
    // `extractExplicitPort` slices the authority off the raw string, so a marker
    // turns the port substring into e.g. `80?family=ipv6`, which fails the digit
    // test and silently falls back to the default port (8080 for http) — rewriting
    // an http:80 proxy to :8080. We work on the marker-free string for both port
    // extraction and URL parsing, then re-append the marker exactly once below.
    const familyMatch = proxyUrl.match(/\?family=(ipv4|ipv6)$/);
    const familySuffix = familyMatch ? familyMatch[0] : "";
    const baseUrl = familySuffix ? proxyUrl.slice(0, -familySuffix.length) : proxyUrl;
    // Extract the explicit port from the raw URL string BEFORE parsing,
    // because `new URL()` silently strips default ports (80 for http,
    // 443 for https), which are valid and common for proxy servers.
    const explicitPort = extractExplicitPort(baseUrl);
    let parsed;
    try {
        parsed = new URL(baseUrl);
    } catch  {
        throw new Error(`[ProxyDispatcher] Invalid ${source} URL`);
    }
    if (!SUPPORTED_PROTOCOLS.has(parsed.protocol)) {
        throw new Error(`[ProxyDispatcher] Unsupported ${source} protocol: ${parsed.protocol.replace(":", "")}`);
    }
    if (parsed.protocol === "socks5:" && !allowSocks5) {
        throw new Error("[ProxyDispatcher] SOCKS5 proxy is disabled (remove ENABLE_SOCKS5_PROXY=false to enable — it is ON by default)");
    }
    if (!parsed.hostname) {
        throw new Error(`[ProxyDispatcher] Invalid ${source} host`);
    }
    // Use the explicit port from the raw string if present, otherwise apply default.
    const port = explicitPort || normalizePort(parsed.port, parsed.protocol);
    // Build the URL string manually instead of using parsed.toString(),
    // which would strip default ports (80/443) and break the proxy connection.
    // Preserve a synthetic `?family=` directive (the only query param we emit)
    // so the connect-family pin survives normalization and reaches the dispatcher.
    // The directive may arrive either as the stripped trailing marker (familySuffix)
    // or as an inline query on `baseUrl`; resolve both, append the marker once.
    const fam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseProxyFamily"])((familyMatch ? familyMatch[1] : parsed.searchParams.get("family")) ?? undefined);
    const base = buildProxyUrlString(parsed, port);
    return fam === "auto" ? base : `${base}?family=${fam}`;
}
function buildVercelRelayHeaders(targetUrl, relayAuth) {
    const parsed = new URL(targetUrl);
    return {
        "x-relay-target": `${parsed.protocol}//${parsed.host}`,
        "x-relay-path": parsed.pathname + parsed.search,
        "x-relay-auth": relayAuth
    };
}
const buildRelayHeaders = buildVercelRelayHeaders;
function proxyConfigToUrl(proxyConfig, { allowSocks5 = isSocks5ProxyEnabled() } = {}) {
    if (!proxyConfig) return null;
    if (typeof proxyConfig === "string") {
        return normalizeProxyUrl(proxyConfig, "context proxy", {
            allowSocks5
        });
    }
    if (typeof proxyConfig !== "object" || Array.isArray(proxyConfig)) {
        throw new Error("[ProxyDispatcher] Invalid context proxy config");
    }
    const config = proxyConfig;
    // Partial / empty config object — treat as no proxy instead of crashing
    if (!config.host) return null;
    const type = String(config.type || "http").toLowerCase();
    // Edge-relay entries (vercel / deno / cloudflare) carry the relay URL in
    // `host` — no dispatcher needed; callers should use buildRelayHeaders() and
    // fetch the relay endpoint directly. All relay types share the exact same
    // x-relay-target / x-relay-path / x-relay-auth header spec (only the
    // deployment target differs).
    if (RELAY_TYPES.has(type)) {
        return config.host ? `https://${config.host}` : null;
    }
    const protocol = `${type}:`;
    if (!SUPPORTED_PROTOCOLS.has(protocol)) {
        throw new Error(`[ProxyDispatcher] Unsupported context proxy protocol: ${type}`);
    }
    if (protocol === "socks5:" && !allowSocks5) {
        throw new Error("[ProxyDispatcher] SOCKS5 proxy is disabled (remove ENABLE_SOCKS5_PROXY=false to enable — it is ON by default)");
    }
    const port = normalizePort(config.port, protocol);
    // Build the URL string manually to preserve the port through normalization.
    const auth = config.username ? `${encodeURIComponent(config.username)}:${config.password ? encodeURIComponent(config.password) : ""}@` : "";
    const proxyUrlStr = `${type}://${auth}${config.host}:${port}`;
    const fam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseProxyFamily"])(config.family);
    const normalized = normalizeProxyUrl(proxyUrlStr, "context proxy", {
        allowSocks5
    });
    return fam === "auto" ? normalized : `${normalized}?family=${fam}`;
}
/** Resolve the concrete connect family for a proxy URL, fail-closed on contradictions. */ function resolveDispatcherFamily(parsed) {
    const directive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseProxyFamily"])(parsed.searchParams.get("family") ?? undefined);
    const literal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectIpLiteralFamily"])(parsed.hostname);
    if (directive === "auto") return literal;
    const want = directive === "ipv6" ? 6 : 4;
    if (literal !== null && literal !== want) {
        throw new Error(`[ProxyDispatcher] Proxy family directive ${directive} contradicts ${literal === 6 ? "IPv6" : "IPv4"} literal host`);
    }
    return want;
}
function __resolveDispatcherFamilyForTest(proxyUrl) {
    return resolveDispatcherFamily(new URL(proxyUrl));
}
function __getProxyDispatcherOptionsForTest(env = process.env) {
    return getProxyDispatcherOptions(env);
}
function __getDefaultDispatcherOptionsForTest(env = process.env) {
    return getDefaultDispatcherOptions(env);
}
function __createRoundRobinDispatcherForTest(dispatchers) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRoundRobinDispatcher"])(dispatchers);
}
/**
 * Build a ProxyAgent / socks dispatcher for a normalized proxy URL using the
 * given options. Shared by the pooled dispatcher (keep-alive, pipelining 4)
 * and the retry dispatcher (fresh no-keep-alive socket, mirrors #4252).
 */ function buildProxyDispatcher(normalizedUrl, options) {
    const parsed = new URL(normalizedUrl);
    const family = resolveDispatcherFamily(parsed);
    parsed.searchParams.delete("family");
    const cleanUri = normalizedUrl.replace(/\?family=(ipv4|ipv6)$/, "");
    const explicitPort = extractExplicitPort(cleanUri);
    const port = explicitPort || normalizePort(parsed.port, parsed.protocol);
    if (parsed.protocol === "socks5:") {
        const socksOptions = {
            type: 5,
            host: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(parsed.hostname),
            port: Number(port)
        };
        if (parsed.username) socksOptions.userId = decodeURIComponent(parsed.username);
        if (parsed.password) socksOptions.password = decodeURIComponent(parsed.password);
        return family === null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fetch$2d$socks$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["socksDispatcher"])(socksOptions, options) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$socksConnectorWithFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSocksDispatcherWithFamily"])(socksOptions, family, options);
    }
    // ProxyAgent omits `connect`; the client->proxy socket is built from `proxyTls`.
    // undici 8.4.1 types `proxyTls?: buildConnector.BuildOptions`, a union whose
    // `TcpNetConnectOpts` member nominally requires `port` — so TS rejects a bare
    // `{ family, autoSelectFamily }` pin. At runtime undici merges these options into
    // net.connect (the uri already carries the host:port), so the partial pin is
    // valid; the cast suppresses the spurious missing-`port` error.
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProxyAgent"]({
        uri: cleanUri,
        // undici 8.6+ forwards plain-HTTP requests through the proxy as an origin
        // request (GET http://host/…) instead of a CONNECT tunnel; upstream proxies
        // that only speak CONNECT then reject it (501). OmniRoute tunnels ALL proxied
        // traffic (HTTP + HTTPS) via CONNECT, so force tunneling. Unknown option on
        // undici <8.6 → silently ignored (that version already tunneled by default).
        proxyTunnel: true,
        ...options,
        ...family !== null ? {
            proxyTls: {
                family,
                autoSelectFamily: false
            }
        } : {}
    });
}
function createProxyDispatcher(proxyUrl) {
    const normalizedUrl = normalizeProxyUrl(proxyUrl, "proxy dispatcher");
    const dispatcherCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDispatcherCache"])();
    let dispatcher = dispatcherCache.get(normalizedUrl);
    if (dispatcher) return dispatcher;
    dispatcher = buildProxyDispatcher(normalizedUrl, getProxyDispatcherOptions());
    // A concurrent caller may have built + cached the same URL while we were
    // building. If so, drop our duplicate (avoid leaking sockets) and reuse theirs.
    const winner = dispatcherCache.get(normalizedUrl);
    if (winner) {
        void dispatcher.close().catch(()=>{});
        return winner;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setDispatcherCacheEntry"])(normalizedUrl, dispatcher);
    return dispatcher;
}
function getProxyRetryDispatcher(proxyUrl) {
    const normalizedUrl = normalizeProxyUrl(proxyUrl, "proxy dispatcher");
    const dispatcherCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDispatcherCache"])();
    const retryKey = `retry:${normalizedUrl}`;
    let dispatcher = dispatcherCache.get(retryKey);
    if (dispatcher) return dispatcher;
    dispatcher = buildProxyDispatcher(normalizedUrl, {
        ...getProxyDispatcherOptions(),
        // Retry needs exactly one fresh socket (not the inherited connection pool).
        connections: 1,
        keepAliveTimeout: 1,
        keepAliveMaxTimeout: 1,
        pipelining: 0
    });
    const winner = dispatcherCache.get(retryKey);
    if (winner) {
        void dispatcher.close().catch(()=>{});
        return winner;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcherCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setDispatcherCacheEntry"])(retryKey, dispatcher);
    return dispatcher;
}
function __getSocksOptionsForTest(proxyUrl) {
    const normalizedUrl = normalizeProxyUrl(proxyUrl, "proxy dispatcher");
    const parsed = new URL(normalizedUrl);
    parsed.searchParams.delete("family");
    const explicitPort = extractExplicitPort(normalizedUrl);
    const port = explicitPort || normalizePort(parsed.port, parsed.protocol);
    const socksOptions = {
        type: 5,
        host: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(parsed.hostname),
        port: Number(port)
    };
    if (parsed.username) socksOptions.userId = decodeURIComponent(parsed.username);
    if (parsed.password) socksOptions.password = decodeURIComponent(parsed.password);
    return socksOptions;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/module [external] (module, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("module", () => require("module"));

module.exports = mod;
}),
"[project]/open-sse/utils/tlsClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/module [external] (module, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/utils/tlsClient.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
let createSession;
try {
    const loaded = __turbopack_context__.r("[externals]/wreq-js [external] (wreq-js, cjs, [project]/node_modules/wreq-js)");
    createSession = typeof loaded.createSession === "function" ? loaded.createSession : null;
} catch  {
    createSession = null;
}
/**
 * Get proxy URL from environment variables.
 * Priority: HTTPS_PROXY > HTTP_PROXY > ALL_PROXY
 */ function getProxyFromEnv() {
    return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy || undefined;
}
function normalizeHeaders(headers) {
    if (!headers) return undefined;
    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
    }
    if (Array.isArray(headers)) {
        return Object.fromEntries(headers.map(([key, value])=>[
                key,
                String(value)
            ]));
    }
    const normalized = {};
    for (const [key, value] of Object.entries(headers)){
        if (typeof value === "string") {
            normalized[key] = value;
        }
    }
    return normalized;
}
/**
 * TLS Client — Chrome 124 TLS fingerprint spoofing via wreq-js
 * Singleton instance used to disguise Node.js TLS handshake as Chrome browser.
 *
 * wreq-js natively supports proxy — TLS fingerprinting works through proxy.
 * Proxy URL is read from environment variables (HTTPS_PROXY, HTTP_PROXY, ALL_PROXY).
 */ class TlsClient {
    session = null;
    _libraryAvailable;
    failureCount = 0;
    maxFailures = 3;
    baseCooldownMs = 30_000;
    cooldownMs = 30_000;
    cooldownMultiplier = 1;
    MAX_COOLDOWN_MS = 600_000;
    circuitOpenUntil = 0;
    circuitTripped = false;
    constructor(){
        this._libraryAvailable = !!createSession;
    }
    get available() {
        if (!this._libraryAvailable) return false;
        if (!this.circuitTripped) return true;
        return Date.now() >= this.circuitOpenUntil;
    }
    recordFailure() {
        this.failureCount++;
        if (this.failureCount >= this.maxFailures) {
            this.circuitOpenUntil = Date.now() + this.cooldownMs;
            this.circuitTripped = true;
            // Close the stale session so the next half-open retry creates a
            // fresh one instead of reusing a broken connection.
            if (this.session) {
                Promise.resolve(this.session.close()).catch(()=>{});
                this.session = null;
            }
            console.warn(`[TlsClient] Circuit opened after ${this.failureCount} consecutive failures, cooling down for ${this.cooldownMs}ms`);
            // Double cooldown for the next trip: 30s → 60s → 120s → ... → 10 min max
            this.escalateCooldown();
        }
    }
    recordSuccess() {
        this.failureCount = 0;
        if (this.circuitTripped) {
            this.cooldownMultiplier = 1;
            this.cooldownMs = this.baseCooldownMs;
            console.log("[TlsClient] Circuit closed (success after cooldown)");
            this.circuitTripped = false;
        }
    }
    escalateCooldown() {
        this.cooldownMultiplier = Math.min(this.cooldownMultiplier * 2, 20);
        this.cooldownMs = Math.min(this.baseCooldownMs * this.cooldownMultiplier, this.MAX_COOLDOWN_MS);
    }
    checkCircuit() {
        if (!this.circuitTripped) return true;
        if (Date.now() >= this.circuitOpenUntil) {
            console.log("[TlsClient] Half-open: retrying after cooldown");
            // Don't call recordSuccess() here — that would reset failureCount.
            // Instead, let the fetch() call succeed or fail naturally.
            // If it succeeds, recordSuccess() in fetch() handles cleanup.
            // If it fails, recordFailure() finds failureCount still >= maxFailures
            // and re-opens with escalated cooldown.
            return true;
        }
        return false;
    }
    async getSession() {
        if (!this.checkCircuit()) return null;
        if (!this.available) return null;
        if (this.session) return this.session;
        const createSessionFn = createSession;
        if (!createSessionFn) return null;
        const proxy = getProxyFromEnv();
        const sessionOpts = {
            browser: "chrome_124",
            os: "macos"
        };
        if (proxy) {
            sessionOpts.proxy = proxy;
            console.log(`[TlsClient] Using proxy: ${proxy}`);
        }
        this.session = await createSessionFn(sessionOpts);
        console.log("[TlsClient] Session created (Chrome 124 TLS fingerprint)");
        return this.session;
    }
    /**
   * Fetch with Chrome 124 TLS fingerprint.
   * wreq-js Response is already fetch-compatible (headers, text(), json(), clone(), body).
   */ async fetch(url, options = {}) {
        if (!this.checkCircuit()) {
            throw new Error("wreq-js circuit open — skipping TLS request");
        }
        try {
            const session = await this.getSession();
            if (!session) throw new Error("wreq-js not available");
            const { timeoutMs } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTlsClientTimeoutConfig"])(process.env, (message)=>{
                console.warn(`[TlsClient] ${message}`);
            });
            const method = (options.method || "GET").toUpperCase();
            const wreqOptions = {
                method,
                headers: normalizeHeaders(options.headers),
                body: options.body,
                redirect: options.redirect === "manual" ? "manual" : "follow",
                timeout: timeoutMs
            };
            if (options.signal) {
                wreqOptions.signal = options.signal;
            }
            const response = await session.fetch(url, wreqOptions);
            this.recordSuccess();
            return response;
        } catch (err) {
            const isAbort = err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));
            if (!isAbort) {
                this.recordFailure();
            }
            throw err;
        }
    }
    async exit() {
        if (this.session) {
            await this.session.close();
            this.session = null;
        }
    }
    resetCircuit() {
        this.failureCount = 0;
        this.circuitTripped = false;
        this.circuitOpenUntil = 0;
    }
    getCircuitState() {
        return {
            available: this.available,
            circuitTripped: this.circuitTripped,
            failureCount: this.failureCount,
            circuitOpenUntil: this.circuitOpenUntil,
            coolDownRemainingMs: this.circuitOpenUntil > 0 ? Math.max(0, this.circuitOpenUntil - Date.now()) : 0
        };
    }
}
const tlsClient = new TlsClient();
const __TURBOPACK__default__export__ = tlsClient;
}),
"[project]/src/lib/proxyHealth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setProxyHealthTcpCheckForTesting",
    ()=>__setProxyHealthTcpCheckForTesting,
    "getAllProxyHealthStatuses",
    ()=>getAllProxyHealthStatuses,
    "getCachedProxyHealth",
    ()=>getCachedProxyHealth,
    "invalidateProxyHealth",
    ()=>invalidateProxyHealth,
    "isProxyReachable",
    ()=>isProxyReachable
]);
/**
 * T14: Proxy Fast-Fail — TCP health check with in-memory cache.
 *
 * When a configured HTTP/SOCKS5 proxy is unreachable, every request
 * through OmniRoute used to wait for the full PROXY_TIMEOUT_MS (30s)
 * before failing. This module detects dead proxies in <2s via a quick
 * TCP connection check, caching the result to avoid overhead per request.
 *
 * Ref: sub2api PR #1167 (fix: proxy-fast-fail)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFamily.ts [app-route] (ecmascript)");
;
;
// Configurable via env vars
const FAST_FAIL_TIMEOUT_MS = parseInt(process.env.PROXY_FAST_FAIL_TIMEOUT_MS ?? "2000", 10);
const HEALTH_CACHE_TTL_MS = parseInt(process.env.PROXY_HEALTH_CACHE_TTL_MS ?? "30000", 10);
const UNHEALTHY_CACHE_TTL_MS = parseInt(process.env.PROXY_HEALTH_UNHEALTHY_CACHE_TTL_MS ?? "2000", 10);
// In-memory cache: proxyUrl → health entry
const proxyHealthCache = new Map();
const proxyHealthInflight = new Map();
let tcpCheckImpl = tcpCheck;
async function isProxyReachable(proxyUrl, timeoutMs = FAST_FAIL_TIMEOUT_MS, cacheTtlMs = HEALTH_CACHE_TTL_MS) {
    const cached = proxyHealthCache.get(proxyUrl);
    if (cached && Date.now() - cached.checkedAt < cached.ttlMs) {
        return cached.healthy;
    }
    let url;
    try {
        url = new URL(proxyUrl);
    } catch  {
        // Malformed URL — treat as unreachable
        proxyHealthCache.set(proxyUrl, {
            healthy: false,
            checkedAt: Date.now(),
            ttlMs: cacheTtlMs
        });
        return false;
    }
    const host = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripIpv6Brackets"])(url.hostname);
    const port = parseInt(url.port || defaultPortForScheme(url.protocol), 10);
    if (!host || isNaN(port)) {
        proxyHealthCache.set(proxyUrl, {
            healthy: false,
            checkedAt: Date.now(),
            ttlMs: cacheTtlMs
        });
        return false;
    }
    const existingProbe = proxyHealthInflight.get(proxyUrl);
    if (existingProbe) {
        return existingProbe;
    }
    const probe = tcpCheckImpl(host, port, timeoutMs).then((healthy)=>{
        proxyHealthCache.set(proxyUrl, {
            healthy,
            checkedAt: Date.now(),
            ttlMs: healthy ? cacheTtlMs : Math.min(cacheTtlMs, UNHEALTHY_CACHE_TTL_MS)
        });
        return healthy;
    });
    proxyHealthInflight.set(proxyUrl, probe);
    try {
        return await probe;
    } finally{
        if (proxyHealthInflight.get(proxyUrl) === probe) {
            proxyHealthInflight.delete(proxyUrl);
        }
    }
}
function getCachedProxyHealth(proxyUrl) {
    const cached = proxyHealthCache.get(proxyUrl);
    if (!cached) return null;
    if (Date.now() - cached.checkedAt >= cached.ttlMs) return null; // stale
    return cached.healthy;
}
function invalidateProxyHealth(proxyUrl) {
    proxyHealthCache.delete(proxyUrl);
    proxyHealthInflight.delete(proxyUrl);
}
function getAllProxyHealthStatuses() {
    const now = Date.now();
    return [
        ...proxyHealthCache.entries()
    ].map(([proxyUrl, entry])=>({
            proxyUrl,
            healthy: entry.healthy,
            checkedAt: entry.checkedAt,
            stale: now - entry.checkedAt >= entry.ttlMs
        }));
}
// ─── Internals ────────────────────────────────────────────────────────────────
function defaultPortForScheme(protocol) {
    switch(protocol.replace(":", "").toLowerCase()){
        case "https":
            return "443";
        case "socks5":
        case "socks5h":
            return "1080";
        case "http":
        default:
            return "8080";
    }
}
function tcpCheck(host, port, timeoutMs) {
    return new Promise((resolve)=>{
        const socket = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["createConnection"])({
            host,
            port
        }, ()=>{
            socket.destroy();
            resolve(true);
        });
        socket.setTimeout(timeoutMs);
        socket.on("error", ()=>resolve(false));
        socket.on("timeout", ()=>{
            socket.destroy();
            resolve(false);
        });
    });
}
function __setProxyHealthTcpCheckForTesting(check) {
    tcpCheckImpl = check ?? tcpCheck;
}
}),
"[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__getRelayPoolAgentOptionsForTest",
    ()=>__getRelayPoolAgentOptionsForTest,
    "default",
    ()=>__TURBOPACK__default__export__,
    "describeFetchCause",
    ()=>describeFetchCause,
    "getOriginalFetch",
    ()=>getOriginalFetch,
    "isTlsFingerprintActive",
    ()=>isTlsFingerprintActive,
    "proxyFetch",
    ()=>proxyFetch,
    "resolveProxyForRequest",
    ()=>resolveProxyForRequest,
    "runWithAppliedProxyCapture",
    ()=>runWithAppliedProxyCapture,
    "runWithProxyContext",
    ()=>runWithProxyContext,
    "runWithProxyContextOrDirect",
    ()=>runWithProxyContextOrDirect,
    "runWithTlsTracking",
    ()=>runWithTlsTracking
]);
// @ts-nocheck
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/setupPolyfill.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcher.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/tlsClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/proxyHealth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$setupPolyfill$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
// #9100: relay egress (Vercel / Deno / Cloudflare edge functions) used to go
// through bare `originalFetch` — NO connection pooling, NO timeout, NO retry.
// Every relay request opened a fresh TCP+TLS handshake and a throttled edge
// relay serialized concurrent requests behind ~30s stalls. This module-level
// singleton Agent gives the relay path the same pooling the HTTP-proxy path
// gets from createProxyDispatcher: reused TCP connections per relay host.
//
// `connections: 4` removes head-of-line blocking on h1-only relays: undici never
// pipelines POST (SSE is POST), so a single socket would serialize every
// concurrent stream; 4 sockets give 4 parallel streams. h2 relays are
// unaffected — streams multiplex over one socket, so the pool stays at a single
// connection while streams drain. `allowH2: true` keeps that h2 fast path for
// Vercel / Deno / Cloudflare.
const RELAY_POOL_AGENT_OPTIONS = {
    keepAliveTimeout: 30_000,
    keepAliveMaxTimeout: 60_000,
    pipelining: 4,
    connections: 4,
    allowH2: true
};
const RELAY_POOL_AGENT = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agent"](RELAY_POOL_AGENT_OPTIONS);
// Retry path for a relay that just failed with a transient socket error: a
// FRESH socket (keep-alive disabled) so a stale pooled connection is recovered
// instead of re-hitting the dead one (mirrors the proxy/direct retry paths).
const RELAY_RETRY_AGENT = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Agent"]({
    keepAliveTimeout: 1,
    keepAliveMaxTimeout: 1,
    pipelining: 0,
    connections: 1,
    allowH2: true
});
// A hung relay must fail BEFORE the client/agent timeout (typically 30s) so the
// caller sees a relay-specific failure instead of a generic upstream timeout.
// Overridable via OMNIROUTE_RELAY_FETCH_TIMEOUT_MS (capped at 29s so the
// relay-specific timeout always fires first).
function readRelayFetchTimeoutMs() {
    const raw = process.env.OMNIROUTE_RELAY_FETCH_TIMEOUT_MS;
    if (raw == null || raw.trim() === "") return 25_000;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 1) {
        console.warn(`[ProxyFetch] Invalid OMNIROUTE_RELAY_FETCH_TIMEOUT_MS="${raw}". Using default 25000.`);
        return 25_000;
    }
    return Math.min(Math.floor(parsed), 29_000);
}
const RELAY_FETCH_TIMEOUT_MS = readRelayFetchTimeoutMs();
// Shared retry backoff for the direct / relay / proxy retry-once paths.
// Overridable via OMNIROUTE_RETRY_BACKOFF_MS (0 = retry immediately).
const RETRY_BACKOFF_MS = Math.max(Number(process.env.OMNIROUTE_RETRY_BACKOFF_MS) || 10, 0);
function isTlsFingerprintEnabled() {
    return process.env.ENABLE_TLS_FINGERPRINT === "true";
}
// #8376: transport-level connect-failure codes that mean "the configured upstream
// proxy (or the target itself, for direct egress) is unreachable" — as opposed to an
// ordinary upstream HTTP error. Read `.code` first (stable across undici/node
// versions); native fetch wraps the real socket error in `.cause`, so fall back to
// `.cause.code` when the top-level error is a bare "fetch failed" TypeError.
const PROXY_UNREACHABLE_ERROR_CODES = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENETUNREACH",
    "EHOSTUNREACH",
    "EPIPE",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_SOCKET"
]);
function isProxyUnreachableError(err) {
    if (!err || typeof err !== "object") return false;
    const code = err.code;
    if (typeof code === "string" && PROXY_UNREACHABLE_ERROR_CODES.has(code)) return true;
    const cause = err.cause;
    const causeCode = cause && typeof cause === "object" ? cause.code : undefined;
    if (typeof causeCode === "string" && PROXY_UNREACHABLE_ERROR_CODES.has(causeCode)) return true;
    const msg = err.message;
    return typeof msg === "string" && PROXY_UNREACHABLE_ERROR_CODES.has(msg);
}
/**
 * #8376: tag a connect-failure error with a stable `.code`/`.errorCode` BEFORE it is
 * rethrown, so chatCore's catch block (and, through the response body, the combo
 * provider-breaker predicate) can classify it as "proxy unreachable" instead of
 * falling through to a generic 502 that never trips the whole-provider breaker on a
 * homogeneous same-provider combo pool. No-op when the error isn't connect-shaped.
 */ function tagProxyUnreachable(err) {
    if (isProxyUnreachableError(err)) {
        const e = err;
        e.code = "PROXY_UNREACHABLE";
        e.errorCode = "proxy_unreachable";
    }
    return err;
}
const tlsFingerprintContext = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
const appliedProxyContext = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function runWithAppliedProxyCapture(sink, fn) {
    return appliedProxyContext.run(sink, fn);
}
function describeFetchCause(err) {
    const parts = [];
    const seen = new Set();
    let cur = err;
    for(let depth = 0; cur && depth < 5 && !seen.has(cur); depth++){
        seen.add(cur);
        const e = cur;
        const seg = [
            typeof e.name === "string" && e.name !== "Error" ? e.name : null,
            typeof e.message === "string" ? e.message.slice(0, 160) : null,
            e.code != null ? `code=${String(e.code)}` : null,
            e.syscall != null ? `syscall=${String(e.syscall)}` : null,
            e.errno != null ? `errno=${String(e.errno)}` : null,
            e.address != null ? `address=${String(e.address)}${e.port != null ? `:${String(e.port)}` : ""}` : null
        ].filter(Boolean).join(" ");
        if (seg) parts.push(seg);
        if (Array.isArray(e.errors)) {
            for (const sub of e.errors.slice(0, 4)){
                const s = sub ?? {};
                const subSeg = [
                    s.code != null ? `code=${String(s.code)}` : null,
                    s.syscall != null ? `syscall=${String(s.syscall)}` : null,
                    s.address != null ? `address=${String(s.address)}${s.port != null ? `:${String(s.port)}` : ""}` : null
                ].filter(Boolean).join(" ");
                if (subSeg) parts.push(`↳ ${subSeg}`);
                else if (typeof s.message === "string") parts.push(`↳ ${s.message.slice(0, 80)}`);
            }
        }
        cur = e.cause;
    }
    return parts.join(" | ") || String(err);
}
function isStreamLikeBody(body) {
    return body !== null && body !== undefined && typeof body === "object" && (typeof body.getReader === "function" || typeof body.stream === "function");
}
function requestHasNonReplayableBody(input, options) {
    if (isStreamLikeBody(options.body)) return true;
    if (typeof Request !== "undefined" && input instanceof Request) {
        if (input.bodyUsed) return true;
        if (input.body !== null) return true;
    }
    return false;
}
const isCloud = typeof caches !== "undefined" && typeof caches === "object";
const PATCH_STATE_KEY = Symbol.for("omniroute.proxyFetch.state");
function getPatchState() {
    const scopedGlobal = globalThis;
    if (!scopedGlobal[PATCH_STATE_KEY]) {
        scopedGlobal[PATCH_STATE_KEY] = {
            originalFetch: globalThis.fetch,
            proxyContext: new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"](),
            isPatched: false
        };
    }
    return scopedGlobal[PATCH_STATE_KEY];
}
const patchState = getPatchState();
const originalFetch = patchState.originalFetch;
const originalFetchWithDispatcher = originalFetch;
const proxyContext = patchState.proxyContext;
function noProxyMatch(targetUrl) {
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (!noProxy) return false;
    let target;
    try {
        target = new URL(targetUrl);
    } catch  {
        return false;
    }
    const hostname = target.hostname.toLowerCase();
    const port = target.port || (target.protocol === "https:" ? "443" : "80");
    const patterns = noProxy.split(",").map((p)=>p.trim().toLowerCase()).filter(Boolean);
    return patterns.some((pattern)=>{
        if (pattern === "*") return true;
        const [patternHost, patternPort] = pattern.split(":");
        if (patternPort && patternPort !== port) return false;
        if (!patternHost) return false;
        // Support wildcard matching (e.g. 192.168.* or *.local).
        // Uses a linear glob scan instead of dynamic RegExp to avoid ReDoS.
        if (patternHost.includes("*")) {
            const parts = patternHost.split("*");
            let pos = 0;
            let ok = hostname.startsWith(parts[0]);
            if (ok) {
                pos = parts[0].length;
                for(let i = 1; i < parts.length && ok; i++){
                    const seg = parts[i];
                    if (i === parts.length - 1) {
                        ok = seg === "" || hostname.endsWith(seg) && hostname.length - seg.length >= pos;
                    } else {
                        const idx = seg ? hostname.indexOf(seg, pos) : pos;
                        if (idx === -1) {
                            ok = false;
                        } else {
                            pos = idx + seg.length;
                        }
                    }
                }
            }
            if (ok) return true;
        }
        if (patternHost.startsWith(".")) {
            return hostname.endsWith(patternHost) || hostname === patternHost.slice(1);
        }
        return hostname === patternHost || hostname.endsWith(`.${patternHost}`);
    });
}
function isLocalAddress(hostname) {
    const host = hostname.replace(/^\[/, "").replace(/\]$/, "").replace(/^::ffff:/i, "");
    if (host === "localhost" || host === "0.0.0.0" || host === "127.0.0.1" || host === "::1") {
        return true;
    }
    if (host.endsWith(".local") || host.endsWith(".lan") || host.endsWith(".internal")) return true;
    // RFC1918 + loopback + link-local (169.254, incl. cloud metadata 169.254.169.254)
    // + CGNAT (100.64/10). 127/8 covers all loopback, not just 127.0.0.1.
    if (host.startsWith("192.168.")) return true;
    if (host.startsWith("10.")) return true;
    if (host.startsWith("127.")) return true;
    if (host.startsWith("169.254.")) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
    if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host)) return true;
    // IPv6 ULA (fc00::/7 → fc/fd prefix) and link-local (fe80::/10)
    if (/^f[cd][0-9a-f]*:/i.test(host) || host.startsWith("fe80:")) return true;
    return false;
}
function resolveEnvProxyUrl(targetUrl) {
    if (noProxyMatch(targetUrl)) return null;
    let protocol;
    try {
        protocol = new URL(targetUrl).protocol;
    } catch  {
        return null;
    }
    const proxyUrl = protocol === "https:" ? process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy : process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
    if (!proxyUrl) return null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeProxyUrl"])(proxyUrl, "environment proxy");
}
function resolveProxyForRequest(targetUrl) {
    let target;
    try {
        target = new URL(targetUrl);
    } catch  {
        target = null;
    }
    // Always bypass proxy for local/LAN addresses
    if (target && isLocalAddress(target.hostname.toLowerCase())) {
        return {
            source: "direct",
            proxyUrl: null
        };
    }
    const contextProxy = proxyContext.getStore();
    if (contextProxy) {
        // #9551: NO_PROXY must bypass context-proxy too
        if (target && noProxyMatch(targetUrl)) {
            return {
                source: "direct",
                proxyUrl: null
            };
        }
        return {
            source: "context",
            proxyUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyConfigToUrl"])(contextProxy)
        };
    }
    const envProxyUrl = resolveEnvProxyUrl(targetUrl);
    if (envProxyUrl) {
        return {
            source: "env",
            proxyUrl: envProxyUrl
        };
    }
    return {
        source: "direct",
        proxyUrl: null
    };
}
/**
 * A caller-initiated abort/timeout is not a proxy transport failure — it must
 * not be misreported as one. Prefer `signal.aborted` because
 * `AbortController.abort(reason)` may surface a custom Error rather than a
 * standard AbortError/TimeoutError name.
 * Ported from decolua/9router#2589 (`isCallerAbort`).
 */ function isCallerAbort(error, signal) {
    if (signal?.aborted === true) return true;
    const name = error?.name;
    return name === "AbortError" || name === "TimeoutError";
}
function getTargetUrl(input) {
    if (typeof input === "string") return input;
    if (input && typeof input.url === "string") return input.url;
    return String(input);
}
async function runWithProxyContext(proxyConfig, fn, opts) {
    if (typeof fn !== "function") {
        throw new TypeError("runWithProxyContext requires a callback function");
    }
    // Inherit existing context if no specific proxyConfig is provided
    const currentContext = proxyContext.getStore();
    const effectiveProxyConfig = proxyConfig || currentContext || null;
    const resolvedProxyUrl = effectiveProxyConfig ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyConfigToUrl"])(effectiveProxyConfig) : null;
    // The caller must opt in, and the runtime feature flag must also be enabled.
    // This fallback changes egress IP, so upgrades must not silently turn it on.
    const directFallbackOnUnreachable = opts?.directFallbackOnUnreachable === true && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isControlPlaneProxyDirectFallbackEnabled"])();
    // Run fn with the proxy context cleared so the request egresses directly.
    const runDirect = ()=>proxyContext.run(null, fn);
    // T14: Proxy Fast-Fail (non-blocking, #9100)
    // Perform a short TCP reachability check BEFORE issuing upstream requests.
    // Skip for edge-relay types (vercel / deno): proxyConfigToUrl returns
    // "https://<host>" which is the relay endpoint itself, not an HTTP proxy —
    // the actual routing is handled via x-relay-* headers below.
    //
    // Previously the probe was AWAITED before dispatch: every 30s healthy-TTL
    // window, the first request paid a full TCP+DNS round trip, and under
    // concurrent failures a throttled proxy turned that into queueing. Now the
    // probe fires WITHOUT awaiting and the request dispatches optimistically;
    // only if the probe resolves UNREACHABLE while the request is still in flight
    // do we fail fast with PROXY_UNREACHABLE (503).
    const isVercelRelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRelayType"])(effectiveProxyConfig?.type);
    let unreachableProbe = null;
    // Nested same-context call (the active proxyContext already IS this config):
    // skip the reachability probe and family pre-check — the outer scope already
    // ran them for this exact proxy, so re-probing only adds latency per layer.
    if (resolvedProxyUrl && !isVercelRelay && effectiveProxyConfig !== currentContext) {
        if (directFallbackOnUnreachable) {
            // Opt-in control-plane direct-fallback path: keep the BLOCKING probe —
            // this path must decide direct-vs-proxy BEFORE dispatch, so the probe
            // result is load-bearing here. Unchanged behavior.
            const reachable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isProxyReachable"])(resolvedProxyUrl);
            if (!reachable) {
                const proxyLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"])(resolvedProxyUrl);
                console.warn(`[ProxyFetch] Proxy unreachable (${proxyLabel}); using a direct connection for this request.`);
                return runDirect();
            }
        } else {
            // Fire the probe WITHOUT awaiting; dispatch optimistically below.
            unreachableProbe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyHealth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isProxyReachable"])(resolvedProxyUrl);
        }
    }
    // Fail-closed family check: when the proxy URL carries a ?family=ipv6|ipv4 marker
    // (set for HOSTNAME proxies by proxyConfigToUrl), verify the hostname actually has a
    // record in that family before egressing. Refuse early rather than silently fall back
    // to the other family. No-op for IP literals (their family is intrinsic).
    // Nested same-context call: skip the family pre-check too — the outer scope
    // already verified this exact proxy (mirrors the probe gate above).
    if (resolvedProxyUrl && !isVercelRelay && effectiveProxyConfig !== currentContext) {
        try {
            const u = new URL(resolvedProxyUrl);
            const fam = u.searchParams.get("family");
            if (fam === "ipv6" || fam === "ipv4") {
                const { assertHostnameSupportsFamily } = await __turbopack_context__.A("[project]/open-sse/utils/proxyFamilyResolve.ts [app-route] (ecmascript, async loader)");
                await assertHostnameSupportsFamily(u.hostname, fam === "ipv6" ? 6 : 4);
            }
        } catch (familyErr) {
            if (directFallbackOnUnreachable) {
                console.warn(`[ProxyFetch] Proxy family pre-check failed (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"])(resolvedProxyUrl)}); using a direct connection for this request.`);
                return runDirect();
            }
            const e = familyErr;
            e.code = e.code || "PROXY_FAMILY_UNAVAILABLE";
            e.statusCode = e.statusCode || 503;
            throw e;
        }
    }
    return proxyContext.run(effectiveProxyConfig, async ()=>{
        if (resolvedProxyUrl && effectiveProxyConfig !== currentContext) {
            // #9158: this fires on EVERY proxied request (innermost context wins).
            // Gate it behind the same env flag as the relay routing log so request
            // traffic doesn't spam stdout at production log levels.
            if (process.env.OMNIROUTE_PROXY_FETCH_DEBUG === "true") {
                console.log(`[ProxyFetch] Applied request proxy context: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"])(resolvedProxyUrl)}`);
            }
        }
        // #5217: record the proxy actually applied so a post-execution egress logger
        // reflects the real egress (executors that pin a per-account proxy internally
        // otherwise leave proxyInfo reading "direct"). Innermost runWithProxyContext
        // wins, which is exactly the per-account proxy the executor selected.
        if (effectiveProxyConfig) {
            const sink = appliedProxyContext.getStore();
            if (sink) sink.proxy = effectiveProxyConfig;
        }
        const requestPromise = Promise.resolve().then(()=>fn());
        if (!unreachableProbe) return requestPromise;
        // #9100: non-blocking fast-fail — race the background probe against the
        // request. Only if the probe resolves UNREACHABLE while the request is
        // still in flight do we abort it with PROXY_UNREACHABLE (503). If the
        // request already settled (or the probe found the proxy reachable), the
        // request wins and the stale probe result is ignored — the first dispatch
        // is NEVER gated on the probe.
        const winner = await Promise.race([
            unreachableProbe.then((reachable)=>({
                    kind: "probe",
                    reachable
                })),
            requestPromise.then((value)=>({
                    kind: "request",
                    value
                }))
        ]);
        if (winner.kind === "probe" && !winner.reachable) {
            // Proxy is dead and the request is still in flight → fail fast with the
            // standard PROXY_UNREACHABLE error (503). The in-flight request's own
            // result is discarded (its executor-level signal will still fire); the
            // caller observes this fast failure instead of the ~30s timeout stall.
            requestPromise.catch(()=>{});
            const proxyLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"])(resolvedProxyUrl);
            const err = new Error(`[Proxy Fast-Fail] Proxy unreachable: ${proxyLabel}`);
            err.code = "PROXY_UNREACHABLE";
            err.errorCode = "proxy_unreachable";
            err.statusCode = 503;
            throw err;
        }
        if (winner.kind === "probe") {
            // Probe said reachable but the request is still pending — keep waiting.
            return await requestPromise;
        }
        return winner.value;
    });
}
async function runWithProxyContextOrDirect(proxyConfig, fn) {
    return runWithProxyContext(proxyConfig, fn, {
        directFallbackOnUnreachable: true
    });
}
async function patchedFetch(input, options = {}, deps = {}) {
    if (options?.dispatcher) {
        // When a dispatcher is present, we MUST use the undici library fetch
        // to ensure version compatibility. Node 22 built-in fetch (undici v6)
        // is incompatible with undici v8 dispatchers (missing onRequestStart, etc.)
        const _undiciDispatcher = deps.undiciFetch ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"];
        return _undiciDispatcher(input, options);
    }
    const targetUrl = getTargetUrl(input);
    let resolved;
    try {
        resolved = resolveProxyForRequest(targetUrl);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ProxyFetch] Proxy configuration error: ${message}`);
        throw error;
    }
    const { source, proxyUrl } = resolved;
    if (!proxyUrl) {
        // TLS fingerprint spoofing for direct connections (no proxy configured)
        if (isTlsFingerprintEnabled() && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].available) {
            try {
                const store = tlsFingerprintContext.getStore();
                if (store) store.used = true;
                return await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].fetch(targetUrl, {
                    ...options,
                    headers: options.headers,
                    signal: options.signal ?? undefined
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[ProxyFetch] TLS fingerprint failed, falling back to native fetch: ${message}`);
                const store = tlsFingerprintContext.getStore();
                if (store) store.used = false;
            }
        }
        // Direct connection (no proxy) — use undici with custom dispatcher for timeout control.
        // Falls back to original native fetch if dispatcher initialization fails (#1054).
        // Retries once on transient dispatcher errors before falling back (fix: proxyfetch-undici-retry).
        //
        // Non-replayable body guard: if the body is stream-like (ReadableStream/Blob)
        // or the input is a Request that carries a body, the first dispatcher attempt
        // owns that body. Retrying or falling back to native fetch would replay a
        // consumed/locked body and can mask the original transport error with
        // "Response body object should not be disturbed or locked".
        const hasNonReplayableBody = requestHasNonReplayableBody(input, options);
        const maxAttempts = hasNonReplayableBody ? 1 : 2;
        const _undiciDirect = deps.undiciFetch ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"];
        const _nativeFallback = deps.nativeFetch ?? originalFetchWithDispatcher;
        let lastDispatcherError = null;
        for(let attempt = 0; attempt < maxAttempts; attempt++){
            try {
                return await _undiciDirect(input, {
                    ...options,
                    // #4252: first attempt uses the pooled keep-alive dispatcher; a retry
                    // (after a transient socket error) uses the no-keep-alive dispatcher so
                    // it opens a FRESH socket instead of grabbing another stale pooled one
                    // — the burst pattern was the retry re-hitting a dead pooled socket and
                    // then falling through to native fetch (which also pools) → 502.
                    dispatcher: attempt === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultDispatcher"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRetryDispatcher"])()
                });
            } catch (dispatcherError) {
                const msg = dispatcherError instanceof Error ? dispatcherError.message : String(dispatcherError);
                // CAUTION: Do NOT fallback to native fetch if the error is a version mismatch (invalid onRequestStart)
                // because the native fetch will definitely fail with the undici v8 dispatcher.
                if (msg.includes("onRequestStart")) {
                    console.error(`[ProxyFetch] Fatal version mismatch: Dispatcher (v8) vs Fetch (v6/native). Hardware upgrade or SOCKS5 config isolation required. Error: ${msg}`);
                    throw dispatcherError;
                }
                // Only retry/fallback for connection/dispatcher errors, not HTTP errors.
                // Prefer the .code property when available (more stable across undici
                // versions than message-string matching); fall back to substring match
                // for errors that lack a structured code.
                tagProxyUnreachable(dispatcherError);
                const errCode = dispatcherError?.code;
                if (msg.includes("fetch failed") || errCode === "ECONNREFUSED" || msg.includes("ECONNREFUSED") || typeof errCode === "string" && errCode.startsWith("UND_ERR") || msg.includes("UND_ERR")) {
                    if (attempt === 0 && maxAttempts > 1) {
                        // First failure — retry once after a short backoff before giving up.
                        // Delay is OMNIROUTE_RETRY_BACKOFF_MS (default 10ms): a fixed backoff
                        // beats random jitter here because the retry opens a fresh socket, so
                        // jitter was pure added latency with no herd benefit.
                        lastDispatcherError = dispatcherError;
                        await new Promise((r)=>setTimeout(r, RETRY_BACKOFF_MS));
                        continue;
                    }
                    if (hasNonReplayableBody) {
                        const detail = `dispatcher=[${describeFetchCause(dispatcherError)}] native=[skipped: non-replayable request body]`;
                        console.warn(`[ProxyFetch] skipping native fetch fallback for non-replayable body: ${detail}`);
                        if (dispatcherError instanceof Error) {
                            dispatcherError.proxyFetchDetail = detail;
                        }
                        throw tagProxyUnreachable(dispatcherError);
                    }
                    // All attempts exhausted — try proxy fallback before native fetch
                    if (source === "direct" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PROXY_AUTO_SELECT_ENABLED")) {
                        let targetHostname = "";
                        try {
                            targetHostname = new URL(targetUrl).hostname;
                        } catch  {
                        // ignore
                        }
                        if (targetHostname) {
                            const { findWorkingProxy } = await __turbopack_context__.A("[project]/open-sse/utils/proxyFallback.ts [app-route] (ecmascript, async loader)");
                            const fallbackProxyUrl = await findWorkingProxy(targetHostname, targetUrl);
                            if (fallbackProxyUrl) {
                                try {
                                    const dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createProxyDispatcher"])(fallbackProxyUrl);
                                    return await _undiciDirect(input, {
                                        ...options,
                                        dispatcher
                                    });
                                } catch  {
                                // Proxy also failed — fall through to native fetch
                                }
                            }
                        }
                    }
                    // Preserve original phrase intact for monitoring: "Undici dispatcher failed, falling back to native fetch"
                    // #4252: append the flattened err.cause (code/syscall/errno/address) — the bare
                    // "fetch failed" message hides what actually broke, making bursts undiagnosable.
                    console.warn(`[ProxyFetch] Undici dispatcher failed, falling back to native fetch (after retry): ${describeFetchCause(dispatcherError)}`);
                    try {
                        return await _nativeFallback(input, options);
                    } catch (nativeError) {
                        // #4252: both the undici dispatcher AND native fetch failed. Surface BOTH
                        // causes (server log) and tag the propagated error so the combo executor sees
                        // a diagnosable failure IMMEDIATELY instead of a bare "fetch failed" — the
                        // latter left jobs sitting until the 30s semaphore queue timeout, which then
                        // tripped the circuit breaker.
                        const detail = `dispatcher=[${describeFetchCause(dispatcherError)}] native=[${describeFetchCause(nativeError)}]`;
                        console.warn(`[ProxyFetch] native fetch fallback ALSO failed: ${detail}`);
                        if (nativeError instanceof Error) {
                            nativeError.proxyFetchDetail = detail;
                        }
                        tagProxyUnreachable(nativeError);
                        throw nativeError;
                    }
                }
                tagProxyUnreachable(dispatcherError);
                throw dispatcherError;
            }
        }
        // Should not be reached, but satisfy TypeScript control-flow.
        throw lastDispatcherError;
    }
    // Edge relay (vercel / deno): instead of routing through an HTTP proxy
    // dispatcher, we send x-relay-* headers to the edge function which forwards
    // the request upstream. Both backends share the same envelope shape.
    const contextProxy = proxyContext.getStore();
    if (contextProxy && typeof contextProxy === "object" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRelayType"])(contextProxy.type)) {
        const vc = contextProxy;
        if (!vc.relayAuth) {
            // Generic message without internal labels — this throw can bubble up to
            // catch blocks that put error.message in response bodies (combo per-model
            // timeout, executor catch-all). Don't leak "[ProxyFetch]" diagnostics.
            const label = vc.type === "vercel" ? "Vercel relay" : `${vc.type || "Edge"} relay`;
            throw new Error(`${label} configuration error: missing relayAuth`);
        }
        const targetUrl = getTargetUrl(input);
        const relayHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildVercelRelayHeaders"])(targetUrl, vc.relayAuth);
        const mergedHeaders = new Headers(options?.headers);
        for (const [k, v] of Object.entries(relayHeaders))mergedHeaders.set(k, v);
        // Pass host through proxyUrlForLogs so the same redaction policy applies
        // to relay routing logs (the rest of this module already follows that rule).
        const hostForLogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"])(vc.host ? `https://${vc.host}` : "");
        if (process.env.OMNIROUTE_PROXY_FETCH_DEBUG === "true") {
            console.debug(`[ProxyFetch] Routing via ${vc.type || "edge"} relay: ${hostForLogs}`);
        }
        // #9100/#9158: pooled, timed, retried relay egress. Bare `originalFetch` had
        // no pooling — a throttled relay serialized concurrent requests behind ~30s
        // stalls. Route through the module-level RELAY_POOL_AGENT (FOUR reused TCP
        // connections per relay host, pipelining 4 — a single connection let one
        // long SSE stream monopolize the pool, HOL-blocking every other request),
        // cap EACH attempt at RELAY_FETCH_TIMEOUT_MS (default 25s, before the typical
        // 30s client/agent timeout), and retry ONCE on transport failure through a
        // FRESH no-keep-alive RELAY_RETRY_AGENT. An internal per-attempt timeout is
        // NOT retried — it fails fast as RELAY_TIMEOUT (504). Do NOT fall back to
        // native fetch for the relay path: it has no pooling and would churn
        // connections again.
        const _undiciRelay = deps.undiciFetch ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"];
        const hasNonReplayableRelayBody = requestHasNonReplayableBody(input, options);
        const maxRelayAttempts = hasNonReplayableRelayBody ? 1 : 2;
        const relayUrl = `https://${vc.host}`;
        let lastRelayError = null;
        for(let attempt = 0; attempt < maxRelayAttempts; attempt++){
            // A fresh timeout signal per attempt: RELAY_FETCH_TIMEOUT_MS is per-try,
            // so a hung relay that survives the first attempt still gets a full
            // window on retry. Manual AbortController instead of
            // AbortSignal.any([...]) so the relay branch stays free of the literal
            // word `any` (T11 any-budget checker).
            const relayController = new AbortController();
            const relayTimer = setTimeout(()=>relayController.abort(), RELAY_FETCH_TIMEOUT_MS);
            const onCallerAbort = ()=>relayController.abort();
            options.signal?.addEventListener("abort", onCallerAbort, {
                once: true
            });
            try {
                return await _undiciRelay(relayUrl, {
                    ...options,
                    headers: mergedHeaders,
                    duplex: "half",
                    dispatcher: attempt === 0 ? RELAY_POOL_AGENT : RELAY_RETRY_AGENT,
                    signal: relayController.signal
                });
            } catch (relayError) {
                // #9158: classify an internal per-attempt timeout FIRST — a relay that
                // hangs past RELAY_FETCH_TIMEOUT_MS must fail fast as RELAY_TIMEOUT (504)
                // and NOT be retried, instead of surviving into the caller's ~30s stall.
                // The manual relayController fires only on this branch's own timer, so
                // `relayController.signal.aborted` alone cannot be a caller abort; when
                // BOTH fire, the caller abort wins (guarded by the check below).
                const isRelayTimeout = relayController.signal.aborted && options?.signal?.aborted !== true;
                if (isRelayTimeout) {
                    const timeoutErr = new Error(`[ProxyFetch] Relay timed out after ${RELAY_FETCH_TIMEOUT_MS}ms (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["proxyUrlForLogs"])(relayUrl)})`);
                    timeoutErr.code = "RELAY_TIMEOUT";
                    timeoutErr.errorCode = "relay_timeout";
                    timeoutErr.statusCode = 504;
                    throw timeoutErr;
                }
                if (isCallerAbort(relayError, options?.signal)) throw relayError;
                const msg = relayError instanceof Error ? relayError.message : String(relayError);
                const errCode = relayError?.code;
                const isTransportFailure = msg.includes("fetch failed") || errCode === "ECONNREFUSED" || msg.includes("ECONNREFUSED") || typeof errCode === "string" && errCode.startsWith("UND_ERR") || msg.includes("UND_ERR");
                if (attempt === 0 && maxRelayAttempts > 1 && isTransportFailure) {
                    lastRelayError = relayError;
                    // #9158: fixed OMNIROUTE_RETRY_BACKOFF_MS backoff — the retry uses a
                    // FRESH no-keep-alive RELAY_RETRY_AGENT (connections: 1, keepAliveTimeout:
                    // 1ms) instead of reusing the pooled agent, so a stale pooled socket
                    // that the relay half-closed is guaranteed a clean TCP handshake.
                    // Jitter is unnecessary: there is no herd on a per-host singleton.
                    await new Promise((r)=>setTimeout(r, RETRY_BACKOFF_MS));
                    continue;
                }
                throw relayError;
            } finally{
                clearTimeout(relayTimer);
                options.signal?.removeEventListener("abort", onCallerAbort);
            }
        }
        throw lastRelayError;
    }
    // #9100: proxy path — attempt 0 uses the pooled keep-alive dispatcher
    // (pipelining 4, ONE reused TCP connection per proxy host). A transient
    // socket error on a stale pooled socket is retried ONCE on a fresh
    // no-keep-alive dispatcher (mirrors the direct-path #4252 pattern) instead
    // of killing all idle sockets after 1ms or surfacing a bare 502.
    const _undiciProxy = deps.undiciFetch ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetch"];
    const hasNonReplayableProxyBody = requestHasNonReplayableBody(input, options);
    const maxProxyAttempts = hasNonReplayableProxyBody ? 1 : 2;
    let lastProxyError = null;
    for(let attempt = 0; attempt < maxProxyAttempts; attempt++){
        try {
            return await _undiciProxy(input, {
                ...options,
                dispatcher: attempt === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createProxyDispatcher"])(proxyUrl) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProxyRetryDispatcher"])(proxyUrl)
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            const errCode = error?.code;
            const isTransportFailure = msg.includes("fetch failed") || errCode === "ECONNREFUSED" || msg.includes("ECONNREFUSED") || typeof errCode === "string" && errCode.startsWith("UND_ERR") || msg.includes("UND_ERR");
            if (attempt === 0 && maxProxyAttempts > 1 && isTransportFailure) {
                lastProxyError = error;
                // #9158: fixed OMNIROUTE_RETRY_BACKOFF_MS backoff — the retry uses a
                // fresh no-keep-alive dispatcher (getProxyRetryDispatcher), so the old
                // random jitter was pure latency on every recovered request with no
                // herd risk (per-host pool).
                await new Promise((r)=>setTimeout(r, RETRY_BACKOFF_MS));
                continue;
            }
            // A caller abort/timeout must propagate unchanged and without a noisy
            // "Proxy request failed" log — it's not a proxy transport failure.
            if (!isCallerAbort(error, options?.signal)) {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[ProxyFetch] Proxy request failed (${source}, fail-closed): ${message}`);
            }
            throw error;
        }
    }
    throw lastProxyError;
}
async function proxyFetch(input, options = {}, deps = {}) {
    return patchedFetch(input, options, deps);
}
if (!isCloud && !patchState.isPatched) {
    globalThis.fetch = patchedFetch;
    patchState.isPatched = true;
}
async function runWithTlsTracking(fn) {
    const store = {
        used: false
    };
    const result = await tlsFingerprintContext.run(store, fn);
    return {
        result,
        tlsFingerprintUsed: store.used
    };
}
function isTlsFingerprintActive() {
    return isTlsFingerprintEnabled() && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].available;
}
function getOriginalFetch() {
    return originalFetch;
}
function __getRelayPoolAgentOptionsForTest() {
    return RELAY_POOL_AGENT_OPTIONS;
}
const __TURBOPACK__default__export__ = isCloud ? originalFetch : patchedFetch;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/refreshSerializer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetRefreshSerializerForTest",
    ()=>__resetRefreshSerializerForTest,
    "getRefreshSpacingMs",
    ()=>getRefreshSpacingMs,
    "rotationGroupFor",
    ()=>rotationGroupFor,
    "serializeRefresh",
    ()=>serializeRefresh,
    "wasRefreshTokenRotated",
    ()=>wasRefreshTokenRotated
]);
/**
 * Global OAuth refresh serialization, keyed by rotation group.
 *
 * Why this exists (Front 1 of the Codex multi-account cascade fix):
 * Providers that share a single Auth0 client_id — notably OpenAI Codex and the
 * `openai` provider — enforce "single active session per client_id". When two
 * *sibling* accounts under that client refresh their `refresh_token` at nearly
 * the same time, Auth0 treats it as token reuse and revokes the WHOLE
 * refresh_token family, so previously-healthy accounts suddenly fail with
 * `refresh_token_invalidated` / `refresh_token_reused` (openai/codex#9648).
 *
 * The per-connection mutex in tokenRefresh.ts does NOT help: the colliding
 * refreshes happen on DIFFERENT connections. This serializer forces the actual
 * network refresh to concurrency=1 across every connection in a rotation group,
 * so two siblings never POST to /oauth/token concurrently. Optional spacing
 * (CODEX_REFRESH_SPACING_MS) inserts a small gap between consecutive refreshes
 * in a group for extra safety. Non-rotating providers (Google, etc.) are not
 * serialized — their refresh_tokens are permanent and there is no cascade.
 */ // Providers mapped to the same string share one serialized lane. Codex and the
// raw `openai` provider use the same Auth0 backend, so they MUST share a lane.
const ROTATION_LOCK_GROUP = {
    codex: "openai-auth0",
    openai: "openai-auth0",
    claude: "anthropic-oauth",
    "gitlab-duo": "gitlab-duo",
    kiro: "kiro",
    "kimi-coding": "kimi-coding"
};
// Protective settle gap (ms) between two consecutive sibling refreshes when the
// env var is unset. Conservative by default; bursts are rare and correctness
// (not revoking the family) outweighs the extra wall-clock on a queued refresh.
const DEFAULT_REFRESH_SPACING_MS = 2000;
function getRefreshSpacingMs() {
    const rawEnv = process.env.CODEX_REFRESH_SPACING_MS;
    if (rawEnv === undefined || rawEnv === "") return DEFAULT_REFRESH_SPACING_MS;
    const raw = Number(rawEnv);
    // Explicit "0" opts out; anything unparseable falls back to the safe default.
    return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_REFRESH_SPACING_MS;
}
// Tail promise per group — each new refresh chains after the previous one.
const groupTail = new Map();
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
function rotationGroupFor(provider) {
    return ROTATION_LOCK_GROUP[provider] ?? null;
}
async function serializeRefresh(provider, fn) {
    const group = rotationGroupFor(provider);
    if (!group) return fn();
    const prevTail = groupTail.get(group) ?? Promise.resolve();
    let releaseMine;
    const mine = new Promise((resolve)=>{
        releaseMine = resolve;
    });
    const myTail = prevTail.then(()=>mine);
    groupTail.set(group, myTail);
    // Wait for our turn. Ignore a predecessor's rejection — its `finally` still
    // releases the lane, so the queue keeps flowing even after a failed refresh.
    await prevTail.catch(()=>{});
    try {
        return await fn();
    } finally{
        // Only pay the settle gap when a sibling is already queued behind us — a
        // lone refresh has nobody to collide with, so it must be released
        // immediately (zero added latency on the reactive request path).
        const hasSuccessor = groupTail.get(group) !== myTail;
        if (hasSuccessor) {
            const spacing = getRefreshSpacingMs();
            if (spacing > 0) await delay(spacing);
        }
        releaseMine();
        // Garbage-collect the lane when nobody chained after us.
        if (groupTail.get(group) === myTail) groupTail.delete(group);
    }
}
function wasRefreshTokenRotated(attemptedRefreshToken, latestRefreshToken) {
    return typeof attemptedRefreshToken === "string" && attemptedRefreshToken.length > 0 && typeof latestRefreshToken === "string" && latestRefreshToken.length > 0 && latestRefreshToken !== attemptedRefreshToken;
}
function __resetRefreshSerializerForTest() {
    groupTail.clear();
}
}),
"[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
// ─── Shared helpers for per-provider token-refresh modules ─────────────────
//
// Extracted from open-sse/services/tokenRefresh.ts (originally ported from
// KooshaPari's PR #7338, redone here on the current tip — see #7338 for the
// original provider-module-split idea). These helpers are used by more than
// one provider refresh function under ./providers/, plus by
// ../tokenRefresh.ts itself, so they live in one place to avoid duplication.
__turbopack_context__.s([
    "buildFormParams",
    ()=>buildFormParams,
    "extractOAuthErrorCode",
    ()=>extractOAuthErrorCode,
    "isUnrecoverableRefreshError",
    ()=>isUnrecoverableRefreshError,
    "readRefreshErrorBody",
    ()=>readRefreshErrorBody
]);
function buildFormParams(entries) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(entries)){
        if (typeof value === "string" && value.length > 0) {
            params.set(key, value);
        }
    }
    return params;
}
/**
 * OAuth2 error codes that mean the refresh token is permanently dead and
 * retrying will never succeed → callers must emit the unrecoverable sentinel
 * so the HealthCheck deactivates the account instead of looping every 60s.
 * Deliberately EXCLUDES transient codes (server_error, temporarily_unavailable,
 * slow_down) so we never deactivate an account over a recoverable blip.
 */ const UNRECOVERABLE_OAUTH_ERROR_CODES = new Set([
    "invalid_grant",
    "invalid_request",
    "refresh_token_reused",
    "invalid_token",
    "expired_token",
    "unauthorized_client",
    "access_denied"
]);
function extractOAuthErrorCode(raw, depth = 0) {
    if (raw == null || depth > 6) return null;
    if (typeof raw === "string") {
        const s = raw.trim();
        if (!s) return null;
        if (UNRECOVERABLE_OAUTH_ERROR_CODES.has(s)) return s;
        // The string may itself be JSON (a double-encoded body, or the raw text).
        if (s[0] === "{" || s[0] === "[" || s[0] === '"') {
            try {
                const nested = extractOAuthErrorCode(JSON.parse(s), depth + 1);
                if (nested) return nested;
            } catch  {
            // not valid JSON — fall through to the field scan
            }
        }
        // Safety net: a known code appearing as the value of an "error"/"error_code"
        // field inside otherwise-unparsed text. Scoped to avoid false positives.
        const m = s.match(/"error(?:_code)?"\s*:\s*"([a-z_]+)"/i);
        if (m && UNRECOVERABLE_OAUTH_ERROR_CODES.has(m[1])) return m[1];
        return null;
    }
    if (typeof raw === "object") {
        const o = raw;
        return extractOAuthErrorCode(o.error, depth + 1) ?? extractOAuthErrorCode(o.code, depth + 1) ?? extractOAuthErrorCode(o.error_code, depth + 1);
    }
    return null;
}
async function readRefreshErrorBody(response) {
    const rawText = await response.text().catch(()=>"");
    let parsed = rawText;
    try {
        parsed = JSON.parse(rawText);
    } catch  {
    // keep rawText as-is
    }
    const code = extractOAuthErrorCode(parsed) ?? extractOAuthErrorCode(rawText);
    return {
        rawText,
        code
    };
}
function isUnrecoverableRefreshError(result) {
    return result && typeof result === "object" && (result.error === "unrecoverable_refresh_error" || result.error === "refresh_token_reused" || result.error === "invalid_request" || result.error === "invalid_grant");
}
}),
"[project]/open-sse/services/tokenRefresh/rotationMap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_clearTokenRotationMap",
    ()=>_clearTokenRotationMap,
    "_getTokenRotationMapStats",
    ()=>_getTokenRotationMapStats,
    "getRefreshCacheKey",
    ()=>getRefreshCacheKey,
    "lookupRotation",
    ()=>lookupRotation,
    "recordRotation",
    ()=>recordRotation
]);
// @ts-nocheck
//
// Token Rotation Map (codex-multi-auth pattern) — extracted from
// open-sse/services/tokenRefresh.ts. See ../shared.ts for provenance notes.
//
// When a rotating-token provider (Codex, Kimi, GitLab Duo, etc.) refreshes,
// the old refresh_token is consumed and a new one is issued. Any subsequent
// caller arriving with the OLD token would, without protection, hit upstream
// and trigger "refresh_token_reused" — which Auth0 treats as a security event
// and invalidates the entire token family.
//
// This in-memory map caches RECENT rotations so a stale caller can be redirected
// to the new tokens WITHOUT touching upstream. The DB staleness check inside
// the per-connection mutex covers the same scenario when connectionId is known,
// but not all callers pass connectionId (e.g., legacy code paths, retries that
// snapshot credentials before the rotation lands in DB).
//
// Ported from ndycode/codex-multi-auth (lib/refresh-queue.ts:218-248), the only
// publicly known tool that reliably sustains multiple Codex OAuth accounts.
//
// Key format: `provider:sha256(oldRefreshToken)`
// Value: { result: tokens, expiresAt: ms_since_epoch }
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const CACHE_SECRET = "[REDIGIDO-PRESERVACAO]";
function getRefreshCacheKey(provider, refreshToken) {
    const tokenHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["pbkdf2Sync"])(refreshToken, CACHE_SECRET, 1000, 32, "sha256").toString("hex");
    return `${provider}:${tokenHash}`;
}
const tokenRotationMap = new Map();
const ROTATION_MAP_TTL_MS = 60 * 1000; // 60 seconds — long enough to catch in-flight stale callers
function cleanupRotationMap(now = Date.now()) {
    if (tokenRotationMap.size === 0) return;
    for (const [key, entry] of tokenRotationMap.entries()){
        if (entry.expiresAt <= now) tokenRotationMap.delete(key);
    }
}
function lookupRotation(provider, refreshToken) {
    cleanupRotationMap();
    const key = getRefreshCacheKey(provider, refreshToken);
    const entry = tokenRotationMap.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
        tokenRotationMap.delete(key);
        return undefined;
    }
    return entry;
}
function recordRotation(provider, oldRefreshToken, result) {
    if (!oldRefreshToken || !result.refreshToken || oldRefreshToken === result.refreshToken) {
        return;
    }
    const key = getRefreshCacheKey(provider, oldRefreshToken);
    tokenRotationMap.set(key, {
        result,
        expiresAt: Date.now() + ROTATION_MAP_TTL_MS
    });
}
function _getTokenRotationMapStats() {
    cleanupRotationMap();
    return {
        size: tokenRotationMap.size,
        entries: tokenRotationMap.size
    };
}
function _clearTokenRotationMap() {
    tokenRotationMap.clear();
}
}),
"[project]/open-sse/services/tokenRefresh/casGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_resetCasGuardStats",
    ()=>_resetCasGuardStats,
    "casGuardShouldSkipPersist",
    ()=>casGuardShouldSkipPersist,
    "getActiveCasGuard",
    ()=>getActiveCasGuard,
    "getCasGuardStats",
    ()=>getCasGuardStats,
    "runWithCasGuard",
    ()=>runWithCasGuard
]);
// @ts-nocheck
//
// Compare-and-swap (CAS) guard on the refresh persist — extracted from
// open-sse/services/tokenRefresh.ts. See ../shared.ts for provenance notes.
//
// #4038: Fix A makes [network refresh + DB write] atomic *for a single
// connection's mutex*. It does NOT protect against a THIRD writer (a sibling
// process, a concurrent HealthCheck, or a replica) landing a fresher rotation
// on the same `connection_id` between the moment the caller read the row and
// the moment this persist runs. Overwriting that fresher row reverts the
// sibling's rotation, the next caller loads the reverted (now-consumed)
// refresh_token, and Auth0/Anthropic revoke the whole token family (the 1352×
// claude/aa5dd5cf invalidation storm).
//
// The CAS guard carries the refresh_token the caller PRESENTED (the version
// token, since refresh_tokens rotate on every refresh) plus a `reread` of the
// row's current refresh_token. Right before persisting, `getAccessToken`
// re-reads and, if a concurrent writer already rotated the row past the
// presented token, SKIPS the persist so the DB stays at the fresher state. The
// caller still receives the new accessToken — upstream already authenticated
// the request; only the DB write is skipped. No active guard ⇒ behavior is
// byte-identical to before (opt-in).
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [app-route] (ecmascript)");
;
;
const casGuardStore = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
const casGuardStats = {
    skipped: 0,
    persisted: 0
};
function runWithCasGuard(guard, fn) {
    if (!guard) return fn();
    return casGuardStore.run(guard, fn);
}
function getActiveCasGuard() {
    return casGuardStore.getStore();
}
function getCasGuardStats() {
    return {
        ...casGuardStats
    };
}
function _resetCasGuardStats() {
    casGuardStats.skipped = 0;
    casGuardStats.persisted = 0;
}
async function casGuardShouldSkipPersist(log) {
    const guard = getActiveCasGuard();
    if (!guard || !guard.expectedRefreshToken) return false;
    let current;
    try {
        current = await guard.reread();
    } catch  {
        return false; // reread failed — fall through to persist (best-effort)
    }
    // wasRefreshTokenRotated is true iff both are non-empty AND current !== expected.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wasRefreshTokenRotated"])(guard.expectedRefreshToken, current)) {
        casGuardStats.skipped++;
        log?.warn?.("TOKEN_REFRESH", "CAS guard: skipping persist — a concurrent writer already rotated the refresh_token (#4038)");
        return true;
    }
    casGuardStats.persisted++;
    return false;
}
}),
"[project]/open-sse/services/tokenRefresh/circuitBreaker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
//
// Per-provider circuit breaker + refreshWithRetry — extracted from
// open-sse/services/tokenRefresh.ts. See ../shared.ts for provenance notes.
//
// refreshWithRetry wraps a refresh attempt with exponential backoff, a 30s
// per-attempt timeout, and a per-provider circuit breaker (5 consecutive
// failures → 30min pause). Unrecoverable refresh errors (invalid_grant,
// refresh_token_reused, …) short-circuit retries so the HealthCheck can
// deactivate the account instead of looping every 60s.
__turbopack_context__.s([
    "getCircuitBreakerStatus",
    ()=>getCircuitBreakerStatus,
    "isProviderBlocked",
    ()=>isProviderBlocked,
    "refreshWithRetry",
    ()=>refreshWithRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
;
// ─── Circuit Breaker State ──────────────────────────────────────────────────
const _circuitBreaker = {};
const CIRCUIT_BREAKER_THRESHOLD = 5; // consecutive failures before tripping
const CIRCUIT_BREAKER_COOLDOWN = 30 * 60 * 1000; // 30 minutes
const REFRESH_TIMEOUT_MS = 30_000; // 30s max per refresh attempt
function isProviderBlocked(provider) {
    const state = _circuitBreaker[provider];
    if (!state) return false;
    if (!state.blockedUntil) return false;
    if (state.blockedUntil > Date.now()) return true;
    // Cooldown expired — reset
    delete _circuitBreaker[provider];
    return false;
}
function getCircuitBreakerStatus() {
    const result = {};
    for (const [provider, state] of Object.entries(_circuitBreaker)){
        result[provider] = {
            failures: state.failures,
            blocked: state.blockedUntil > Date.now(),
            blockedUntil: state.blockedUntil > Date.now() ? new Date(state.blockedUntil).toISOString() : null,
            remainingMs: Math.max(0, state.blockedUntil - Date.now())
        };
    }
    return result;
}
/**
 * Record a successful refresh — resets circuit breaker for provider.
 */ function recordSuccess(provider) {
    if (_circuitBreaker[provider]) {
        delete _circuitBreaker[provider];
    }
}
/**
 * Record a failed refresh — increments circuit breaker counter.
 */ function recordFailure(provider, log = null) {
    if (!_circuitBreaker[provider]) {
        _circuitBreaker[provider] = {
            failures: 0,
            blockedUntil: 0
        };
    }
    _circuitBreaker[provider].failures++;
    if (_circuitBreaker[provider].failures >= CIRCUIT_BREAKER_THRESHOLD) {
        _circuitBreaker[provider].blockedUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN;
        log?.error?.("TOKEN_REFRESH", `🔴 Circuit breaker tripped for ${provider}: ${CIRCUIT_BREAKER_THRESHOLD} consecutive failures. ` + `Blocked for ${CIRCUIT_BREAKER_COOLDOWN / 60000}min. Provider needs re-authentication.`);
    }
}
/**
 * Execute a function with a timeout.
 */ async function withTimeout(fn, timeoutMs) {
    return await new Promise((resolve, reject)=>{
        const timer = setTimeout(()=>resolve(null), timeoutMs);
        if (typeof timer === "object" && "unref" in timer) {
            timer.unref?.();
        }
        fn().then((result)=>{
            clearTimeout(timer);
            resolve(result);
        }, (error)=>{
            clearTimeout(timer);
            reject(error);
        });
    });
}
async function refreshWithRetry(refreshFn, maxRetries = 3, log = null, provider = "unknown") {
    // Circuit breaker check
    if (isProviderBlocked(provider)) {
        log?.warn?.("TOKEN_REFRESH", `⚡ Circuit breaker active for ${provider}, skipping refresh`);
        return null;
    }
    for(let attempt = 0; attempt < maxRetries; attempt++){
        if (attempt > 0) {
            const delay = attempt * 1000;
            log?.debug?.("TOKEN_REFRESH", `Retry ${attempt}/${maxRetries} after ${delay}ms`);
            await new Promise((r)=>setTimeout(r, delay));
        }
        try {
            const result = await withTimeout(refreshFn, REFRESH_TIMEOUT_MS);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(result)) {
                log?.warn?.("TOKEN_REFRESH", `Unrecoverable refresh error for ${provider}: ${result.error} — skipping retries`);
                return result;
            }
            if (result) {
                recordSuccess(provider);
                return result;
            }
        } catch (error) {
            log?.warn?.("TOKEN_REFRESH", `Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
        }
    }
    // All retries exhausted — record failure for circuit breaker
    recordFailure(provider, log);
    log?.error?.("TOKEN_REFRESH", `All ${maxRetries} retry attempts failed for ${provider}`);
    return null;
}
}),
"[project]/src/lib/oauth/constants/oauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AGY_CONFIG",
    ()=>AGY_CONFIG,
    "ANTIGRAVITY_CONFIG",
    ()=>ANTIGRAVITY_CONFIG,
    "AWS_REGION_PATTERN",
    ()=>AWS_REGION_PATTERN,
    "CLAUDE_CONFIG",
    ()=>CLAUDE_CONFIG,
    "CLINE_CONFIG",
    ()=>CLINE_CONFIG,
    "CODEBUDDY_CN_CONFIG",
    ()=>CODEBUDDY_CN_CONFIG,
    "CODEX_CONFIG",
    ()=>CODEX_CONFIG,
    "CURSOR_CONFIG",
    ()=>CURSOR_CONFIG,
    "GHE_COPILOT_CONFIG",
    ()=>GHE_COPILOT_CONFIG,
    "GITHUB_CONFIG",
    ()=>GITHUB_CONFIG,
    "GITLAB_DUO_CONFIG",
    ()=>GITLAB_DUO_CONFIG,
    "GROK_BUILD_OAUTH_CONFIG",
    ()=>GROK_BUILD_OAUTH_CONFIG,
    "GROK_CLI_CONFIG",
    ()=>GROK_CLI_CONFIG,
    "KILOCODE_CONFIG",
    ()=>KILOCODE_CONFIG,
    "KIMI_CODING_CONFIG",
    ()=>KIMI_CODING_CONFIG,
    "KIRO_CONFIG",
    ()=>KIRO_CONFIG,
    "OAUTH_TIMEOUT",
    ()=>OAUTH_TIMEOUT,
    "OPENAI_CONFIG",
    ()=>OPENAI_CONFIG,
    "PROVIDERS",
    ()=>PROVIDERS,
    "QODER_CONFIG",
    ()=>QODER_CONFIG,
    "RAYCAST_CONFIG",
    ()=>RAYCAST_CONFIG,
    "TRAE_CONFIG",
    ()=>TRAE_CONFIG,
    "WINDSURF_CONFIG",
    ()=>WINDSURF_CONFIG,
    "XAI_OAUTH_CONFIG",
    ()=>XAI_OAUTH_CONFIG,
    "ZED_CONFIG",
    ()=>ZED_CONFIG,
    "ZED_HOSTED_CONFIG",
    ()=>ZED_HOSTED_CONFIG,
    "assertValidAwsRegion",
    ()=>assertValidAwsRegion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/grokBuild.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)");
;
;
;
;
;
const CLAUDE_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("claude_id", "CLAUDE_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://claude.ai/oauth/authorize",
    tokenUrl: "https://api.anthropic.com/v1/oauth/token",
    redirectUri: process.env.CLAUDE_CODE_REDIRECT_URI || "https://platform.claude.com/oauth/code/callback",
    scopes: [
        "org:create_api_key",
        "user:profile",
        "user:inference",
        "user:sessions:claude_code",
        "user:mcp_servers"
    ],
    codeChallengeMethod: "S256"
};
const CODEX_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("codex_id", "CODEX_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    scope: "openid profile email offline_access",
    codeChallengeMethod: "S256",
    // Additional OpenAI-specific params
    extraParams: {
        id_token_add_organizations: "true",
        codex_cli_simplified_flow: "true",
        originator: "codex_cli_rs",
        // prompt=login forces Auth0/OpenAI to RE-AUTHENTICATE the user instead of
        // silently reusing an existing browser session. This is THE KEY parameter
        // that enables multi-account OAuth on the same device + same client_id:
        // without it, OAuth flow #2 carries over session state from OAuth flow #1
        // and Auth0 invalidates the previous account's refresh_token family as a
        // "session takeover". With prompt=login, each OAuth flow creates an
        // isolated session that does not trample siblings.
        // Ported from ndycode/codex-multi-auth (auth.ts: forceNewLogin option) —
        // the only known tool that sustains multiple Codex OAuth accounts.
        prompt: "login"
    }
};
// Qoder OAuth Configuration (Authorization Code)
const QODER_OAUTH_AUTHORIZE_URL = process.env.QODER_OAUTH_AUTHORIZE_URL || "";
const QODER_OAUTH_TOKEN_URL = process.env.QODER_OAUTH_TOKEN_URL || "";
const QODER_OAUTH_USERINFO_URL = process.env.QODER_OAUTH_USERINFO_URL || "";
const QODER_OAUTH_CLIENT_ID = process.env.QODER_OAUTH_CLIENT_ID || "";
const QODER_OAUTH_CLIENT_SECRET = process.env.QODER_OAUTH_CLIENT_SECRET || "";
const QODER_OAUTH_ENABLED = !!QODER_OAUTH_AUTHORIZE_URL && !!QODER_OAUTH_TOKEN_URL && !!QODER_OAUTH_USERINFO_URL && !!QODER_OAUTH_CLIENT_ID && !!QODER_OAUTH_CLIENT_SECRET;
const QODER_CONFIG = {
    enabled: QODER_OAUTH_ENABLED,
    clientId: QODER_OAUTH_CLIENT_ID,
    clientSecret: QODER_OAUTH_CLIENT_SECRET,
    authorizeUrl: QODER_OAUTH_AUTHORIZE_URL,
    tokenUrl: QODER_OAUTH_TOKEN_URL,
    userInfoUrl: QODER_OAUTH_USERINFO_URL,
    extraParams: {
        loginMethod: "phone",
        type: "phone"
    }
};
const CODEBUDDY_CN_CONFIG = {
    baseUrl: "https://copilot.tencent.com",
    stateUrl: "https://copilot.tencent.com/v2/plugin/auth/state",
    tokenUrl: "https://copilot.tencent.com/v2/plugin/auth/token",
    refreshUrl: "https://copilot.tencent.com/v2/plugin/auth/token/refresh",
    userAgent: "CLI/2.63.2 CodeBuddy/2.63.2",
    platform: "CLI",
    pollInterval: 5000
};
const GROK_CLI_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    issuer: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_ISSUER"],
    deviceCodeUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_DEVICE_CODE_URL"],
    tokenUrl: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_TOKEN_URL"],
    scope: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_OAUTH_SCOPES"].join(" ")
};
const GROK_BUILD_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56122,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const XAI_OAUTH_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("grok_id", "GROK_OAUTH_CLIENT_ID"),
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    scope: "openid profile email offline_access grok-cli:access api:access",
    codeChallengeMethod: "S256",
    loopbackPort: 56121,
    callbackPath: "/callback",
    callbackHost: "127.0.0.1"
};
const KIMI_CODING_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("kimi_id", "KIMI_CODING_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://auth.kimi.com/api/oauth/device_authorization",
    tokenUrl: "https://auth.kimi.com/api/oauth/token"
};
const KILOCODE_CONFIG = {
    apiBaseUrl: "https://api.kilo.ai",
    initiateUrl: "https://api.kilo.ai/api/device-auth/codes",
    pollUrlBase: "https://api.kilo.ai/api/device-auth/codes"
};
const CLINE_CONFIG = {
    appBaseUrl: "https://app.cline.bot",
    apiBaseUrl: "https://api.cline.bot",
    authorizeUrl: "https://api.cline.bot/api/v1/auth/authorize",
    tokenExchangeUrl: "https://api.cline.bot/api/v1/auth/token",
    refreshUrl: "https://api.cline.bot/api/v1/auth/refresh"
};
const ANTIGRAVITY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v1/userinfo",
    // No "openid" scope — the working 9router flow requests only the Cloud Code /
    // userinfo scopes below. "openid" (with PKCE) routed Google into the hanging
    // `firstparty/nativeapp` consent. Match 9router exactly (antigravity login fix).
    scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/cclog",
        "https://www.googleapis.com/auth/experimentsandconfigs"
    ],
    // Antigravity specific
    apiEndpoint: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"][0],
    apiVersion: "v1internal",
    loadCodeAssistEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:loadCodeAssist`),
    onboardUserEndpoints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((baseUrl)=>`${baseUrl}/v1internal:onboardUser`),
    fetchAvailableModelsEndpoints: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])(),
    loadCodeAssistEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:loadCodeAssist`,
    onboardUserEndpoint: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:onboardUser`,
    fetchAvailableModelsEndpoint: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])()[0]
};
const AGY_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_id", "ANTIGRAVITY_OAUTH_CLIENT_ID"),
    clientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("antigravity_alt", "ANTIGRAVITY_OAUTH_CLIENT_SECRET"),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v1/userinfo",
    scopes: [
        ...ANTIGRAVITY_CONFIG.scopes
    ],
    // Reuse the antigravity Code Assist endpoints (identical backend).
    apiEndpoint: ANTIGRAVITY_CONFIG.apiEndpoint,
    apiVersion: ANTIGRAVITY_CONFIG.apiVersion,
    loadCodeAssistEndpoints: [
        ...ANTIGRAVITY_CONFIG.loadCodeAssistEndpoints
    ],
    onboardUserEndpoints: [
        ...ANTIGRAVITY_CONFIG.onboardUserEndpoints
    ],
    fetchAvailableModelsEndpoints: [
        ...ANTIGRAVITY_CONFIG.fetchAvailableModelsEndpoints
    ],
    loadCodeAssistEndpoint: ANTIGRAVITY_CONFIG.loadCodeAssistEndpoint,
    onboardUserEndpoint: ANTIGRAVITY_CONFIG.onboardUserEndpoint,
    fetchAvailableModelsEndpoint: ANTIGRAVITY_CONFIG.fetchAvailableModelsEndpoint
};
const OPENAI_CONFIG = {
    clientId: CODEX_CONFIG.clientId,
    authorizeUrl: "https://auth.openai.com/oauth/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    scope: "openid profile email offline_access",
    codeChallengeMethod: "S256",
    extraParams: {
        id_token_add_organizations: "true",
        originator: "openai_native",
        prompt: "login"
    }
};
const GITHUB_CONFIG = {
    clientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "https://github.com/login/device/code",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "https://api.github.com/copilot_internal/v2/token",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GHE_COPILOT_CONFIG = {
    clientId: process.env.GHE_COPILOT_OAUTH_CLIENT_ID || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("github_copilot_id", "GITHUB_OAUTH_CLIENT_ID"),
    deviceCodeUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    scopes: "read:user",
    apiVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_API_VERSION"],
    copilotTokenUrl: "",
    userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"],
    editorVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_EDITOR_VERSION"],
    editorPluginVersion: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_PLUGIN_VERSION"]
};
const GITLAB_DUO_ENDPOINTS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITLAB_DUO_DEFAULT_BASE_URL"]);
const GITLAB_DUO_CONFIG = {
    baseUrl: GITLAB_DUO_ENDPOINTS.root,
    clientId: process.env.GITLAB_DUO_OAUTH_CLIENT_ID || process.env.GITLAB_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GITLAB_DUO_OAUTH_CLIENT_SECRET || process.env.GITLAB_OAUTH_CLIENT_SECRET || "",
    authorizeUrl: GITLAB_DUO_ENDPOINTS.authorizeUrl,
    tokenUrl: GITLAB_DUO_ENDPOINTS.tokenUrl,
    userInfoUrl: GITLAB_DUO_ENDPOINTS.userUrl,
    directAccessUrl: GITLAB_DUO_ENDPOINTS.directAccessUrl,
    scope: "ai_features read_user",
    codeChallengeMethod: "S256"
};
const AWS_REGION_PATTERN = /^[a-z]{2}-[a-z]+-\d{1,2}$/;
function assertValidAwsRegion(region) {
    if (typeof region !== "string" || !AWS_REGION_PATTERN.test(region)) {
        throw new Error("Invalid region");
    }
    return region;
}
const KIRO_CONFIG = {
    // AWS SSO OIDC endpoints for Builder ID/IDC (Device Code Flow)
    ssoOidcEndpoint: "https://oidc.us-east-1.amazonaws.com",
    registerClientUrl: "https://oidc.us-east-1.amazonaws.com/client/register",
    deviceAuthUrl: "https://oidc.us-east-1.amazonaws.com/device_authorization",
    tokenUrl: "https://oidc.us-east-1.amazonaws.com/token",
    // AWS Builder ID default start URL
    startUrl: "https://view.awsapps.com/start",
    // Client registration params
    clientName: "kiro-oauth-client",
    clientType: "public",
    scopes: [
        "codewhisperer:completions",
        "codewhisperer:analysis",
        "codewhisperer:conversations"
    ],
    grantTypes: [
        "urn:ietf:params:oauth:grant-type:device_code",
        "refresh_token"
    ],
    issuerUrl: "https://identitycenter.amazonaws.com/ssoins-722374e8c3c8e6c6",
    // Social auth endpoints (Google/GitHub via AWS Cognito)
    socialAuthEndpoint: "https://prod.us-east-1.auth.desktop.kiro.dev",
    socialLoginUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/login",
    socialTokenUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/token",
    socialRefreshUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken",
    // Social device-code flow (Google/GitHub).
    // `socialClientId` is a public CLI identifier — Kiro's device endpoint accepts
    // any non-empty string and behaves like a User-Agent rather than a secret.
    // The env override exists so operators on locked-down builds can pin a
    // custom value if AWS ever starts enforcing this field (Hard Rule #11 spirit).
    socialClientId: process.env.KIRO_OAUTH_CLIENT_ID || "kiro-cli",
    socialDeviceAuthorizeUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/device/authorization",
    socialDevicePollUrl: "https://prod.us-east-1.auth.desktop.kiro.dev/oauth/device/poll",
    // Auth methods
    authMethods: [
        "builder-id",
        "idc",
        "google",
        "github",
        "import"
    ]
};
const CURSOR_CONFIG = {
    // API endpoints
    apiEndpoint: "https://api2.cursor.sh",
    chatEndpoint: "/aiserver.v1.ChatService/StreamUnifiedChatWithTools",
    modelsEndpoint: "/aiserver.v1.AiService/GetDefaultModelNudgeData",
    // Additional endpoints
    api3Endpoint: "https://api3.cursor.sh",
    agentEndpoint: "https://agent.api5.cursor.sh",
    agentNonPrivacyEndpoint: "https://agentn.api5.cursor.sh",
    // Client metadata
    clientVersion: "3.2.14",
    clientType: "ide",
    // Token storage locations (for user reference)
    tokenStoragePaths: {
        linux: "~/.config/Cursor/User/globalStorage/state.vscdb",
        macos: "/Users/<user>/Library/Application Support/Cursor/User/globalStorage/state.vscdb",
        windows: "%APPDATA%\\Cursor\\User\\globalStorage\\state.vscdb"
    },
    // Database keys
    dbKeys: {
        accessToken: "[REDIGIDO-PRESERVACAO]",
        machineId: "storage.serviceMachineId"
    }
};
const TRAE_CONFIG = {
    apiEndpoint: "https://api.trae.ai",
    clientType: "ide",
    tokenStoragePaths: {
        linux: "~/.config/Trae/User/globalStorage/state.vscdb",
        macos: "/Users/<user>/Library/Application Support/Trae/User/globalStorage/state.vscdb",
        windows: "%APPDATA%\\Trae\\User\\globalStorage\\state.vscdb"
    },
    // Chat completions path (mirrored from OpenAI-compatible providers)
    chatEndpoint: "/v1/chat/completions",
    // Trae website — users retrieve their token here after signing in
    webUrl: "https://trae.ai",
    // SOLO remote agent base — the executor's real upstream. Also set as the
    // provider registry baseUrl, which is the source of truth at request time.
    soloApiEndpoint: "https://core-normal.trae.ai/api/remote/v1",
    // SOLO model catalogue endpoint (relative to soloApiEndpoint).
    modelsEndpoint: "/models?functions=solo_agent_remote,solo_work_remote",
    // Authorization scheme: `Authorization: Cloud-IDE-JWT <token>` (RS256).
    authScheme: "Cloud-IDE-JWT",
    // Observed Cloud-IDE-JWT lifetime — drives default expiry hints.
    tokenLifetimeDays: 14,
    // Token storage note — solo.trae.ai exposes no public SQLite/keychain path,
    // so the token is captured via the /authorize flow or pasted manually.
    tokenNote: "Authorize via trae.ai in the popup, or sign in to solo.trae.ai and paste the Cloud-IDE-JWT from the Authorization header (~14-day lifetime)."
};
const RAYCAST_CONFIG = {
    apiEndpoint: "https://backend.raycast.com",
    chatEndpoint: "/api/v1/ai/chat_completions",
    modelsEndpoint: "/api/v1/ai/models",
    clientType: "macos-app",
    captureInstructions: "macOS only: use Auto-Import (Keychain + Raycast DB) or capture Bearer, X-Raycast-DeviceId, and optional X-Raycast-Signature JWT from backend.raycast.com traffic."
};
const WINDSURF_CONFIG = {
    // RETIRED 2026-05-29 — endpoint returns 404 post-rebrand. Phase 2 will replace.
    authorizeUrl: "https://app.devin.ai/editor/signin",
    // RETIRED 2026-05-29 — PKCE flow disabled, see header comment.
    codeChallengeMethod: "S256",
    // RETIRED 2026-05-29 — no callback server is started for windsurf/devin-cli.
    callbackPort: 0,
    // RETIRED 2026-05-29 — no callback path is registered for windsurf/devin-cli.
    callbackPath: "/auth/callback",
    // RETIRED 2026-05-29 — exchange endpoint no longer reached because PKCE is disabled.
    apiServerUrl: "https://server.codeium.com",
    // RETIRED 2026-05-29 — see apiServerUrl.
    exchangePath: "/exa.seat_management_pb.SeatManagementService/ExchangePKCEAuthorizationCode",
    // ── Active fields (still consumed by runtime) ─────────────────────────────
    // Inference server URL (gRPC-web requests go here)
    inferenceUrl: "https://server.self-serve.windsurf.com",
    // Primary login path: the user runs the "Windsurf: Provide Auth Token" command
    // inside the Windsurf/VS Code IDE (or clicks the Jupyter "Get Windsurf
    // Authentication Token" button), which opens this URL WITH an IDE-supplied
    // `?state=<xyz>` param and renders the token. Opening this bare URL directly
    // only shows a "Redirecting" page with no token (#3324).
    showAuthTokenUrl: "https://windsurf.com/show-auth-token",
    // Token refresh via Firebase Secure Token Service (reserved for Phase 2).
    // Default is the public Firebase Web client identifier embedded in the
    // Windsurf/Devin CLI binary; users may override via WINDSURF_FIREBASE_API_KEY.
    firebaseApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("windsurf_fb", "WINDSURF_FIREBASE_API_KEY"),
    firebaseTokenUrl: "https://securetoken.googleapis.com/v1/token",
    // IDE identity sent with every gRPC request
    ideName: "windsurf",
    ideVersion: "3.14.0",
    extensionVersion: "3.14.0"
};
const ZED_CONFIG = {
    importUrl: "/api/providers/zed/import",
    discoverUrl: "/api/providers/zed/discover",
    manualImportUrl: "/api/providers/zed/manual-import"
};
const ZED_HOSTED_CONFIG = {
    webBaseUrl: "https://zed.dev",
    cloudBaseUrl: "https://cloud.zed.dev",
    llmBaseUrl: "https://cloud.zed.dev",
    nativeSignInPath: "/native_app_signin",
    userInfoUrl: "https://cloud.zed.dev/client/users/me",
    llmTokenUrl: "https://cloud.zed.dev/client/llm_tokens",
    modelsUrl: "https://cloud.zed.dev/models",
    completionsUrl: "https://cloud.zed.dev/completions",
    defaultNativeAppPort: 58443
};
const OAUTH_TIMEOUT = 300000;
const PROVIDERS = {
    CLAUDE: "claude",
    CODEX: "codex",
    GEMINI: "gemini",
    QODER: "qoder",
    ANTIGRAVITY: "antigravity",
    AGY: "agy",
    KIMI_CODING: "kimi-coding",
    OPENAI: "openai",
    GITHUB: "github",
    GHE_COPILOT: "ghe-copilot",
    GITLAB_DUO: "gitlab-duo",
    KIRO: "kiro",
    AMAZON_Q: "amazon-q",
    CURSOR: "cursor",
    KILOCODE: "kilocode",
    CLINE: "cline",
    CLINEPASS: "clinepass",
    WINDSURF: "windsurf",
    DEVIN_CLI: "devin-cli",
    TRAE: "trae",
    CODEBUDDY_CN: "codebuddy-cn",
    GROK_CLI: "grok-cli",
    XAI_OAUTH: "xai-oauth",
    ZED: "zed",
    ZED_HOSTED: "zed-hosted"
};
}),
"[project]/open-sse/services/tokenRefresh/providers/windsurf.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshWindsurfToken",
    ()=>refreshWindsurfToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/constants/oauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshWindsurfToken(refreshToken, providerSpecificData, log, proxyConfig = null) {
    if (!refreshToken) {
        log?.warn?.("TOKEN_REFRESH", "No refresh token stored for Windsurf — token may be a long-lived API key");
        return null;
    }
    const authMethod = providerSpecificData?.authMethod || "import";
    // Long-lived Codeium API keys (import flow) have no expiry — nothing to refresh.
    if (authMethod === "import") {
        log?.debug?.("TOKEN_REFRESH", "Windsurf import token is long-lived — no refresh needed");
        return null;
    }
    // Firebase STS refresh for browser-flow tokens.
    // Resolves via WINDSURF_CONFIG.firebaseApiKey, which honors the
    // WINDSURF_FIREBASE_API_KEY env override and falls back to the embedded
    // public default in publicCreds.ts. See docs/security/PUBLIC_CREDS.md.
    const firebaseApiKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDSURF_CONFIG"].firebaseApiKey || "";
    if (!firebaseApiKey) {
        log?.warn?.("TOKEN_REFRESH", "Windsurf Firebase API key unavailable — skipping Firebase token refresh");
        return null;
    }
    const tokenUrl = `https://securetoken.googleapis.com/v1/token?key=${firebaseApiKey}`;
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken
                })
            }));
        if (!response.ok) {
            const errorText = await response.text();
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Windsurf Firebase token", {
                status: response.status,
                error: errorText.slice(0, 200)
            });
            // Firebase STS returns structured errors. Detect unrecoverable token states.
            try {
                const fbError = JSON.parse(errorText);
                const fbCode = typeof fbError?.error?.message === "string" ? fbError.error.message : typeof fbError?.error === "string" ? fbError.error : null;
                if (typeof fbCode === "string" && (fbCode.includes("USER_DISABLED") || fbCode.includes("TOKEN_EXPIRED") || fbCode.includes("INVALID_REFRESH_TOKEN") || fbCode.includes("USER_NOT_FOUND"))) {
                    log?.error?.("TOKEN_REFRESH", "Windsurf Firebase token is permanently invalid. Re-authentication required.", {
                        fbCode
                    });
                    return {
                        error: "unrecoverable_refresh_error",
                        code: fbCode
                    };
                }
            } catch  {
            // not JSON — fall through
            }
            return null;
        }
        const data = await response.json();
        const expiresIn = parseInt(data.expires_in ?? "3600", 10);
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Windsurf Firebase token", {
            expiresIn,
            hasNewIdToken: !!data.id_token
        });
        return {
            accessToken: data.id_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresIn
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing Windsurf token: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/codebuddyCn.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshCodebuddyCnToken",
    ()=>refreshCodebuddyCnToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function refreshCodebuddyCnToken(refreshToken, log, proxyConfig = null) {
    if (!refreshToken) return null;
    const { CODEBUDDY_CN_CONFIG } = await __turbopack_context__.A("[project]/src/lib/oauth/constants/oauth.ts [app-route] (ecmascript, async loader)");
    const oauth = CODEBUDDY_CN_CONFIG;
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(oauth.refreshUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "User-Agent": oauth.userAgent,
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Domain": "copilot.tencent.com",
                    "X-Refresh-Token": refreshToken,
                    "X-Auth-Refresh-Source": "plugin",
                    "X-Product": "SaaS"
                },
                body: "{}"
            }));
        if (!response.ok) {
            const errorText = await response.text();
            log?.error?.("TOKEN_REFRESH", "Failed to refresh CodeBuddy CN token", {
                status: response.status,
                error: errorText
            });
            return null;
        }
        const data = await response.json();
        if (data?.code !== 0 || !data?.data?.accessToken) {
            log?.error?.("TOKEN_REFRESH", "CodeBuddy CN token refresh returned no token", {
                code: data?.code,
                msg: data?.msg
            });
            return null;
        }
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed CodeBuddy CN token", {
            hasNewAccessToken: !!data.data.accessToken,
            hasNewRefreshToken: !!data.data.refreshToken,
            expiresIn: data.data.expiresIn
        });
        return {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken || refreshToken,
            expiresIn: data.data.expiresIn
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing CodeBuddy CN token: ${error?.message}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/cline.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshClineToken",
    ()=>refreshClineToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshClineToken(refreshToken, log, proxyConfig = null) {
    const endpoint = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].cline?.refreshUrl;
    if (!endpoint) {
        log?.warn?.("TOKEN_REFRESH", "No refresh URL configured for Cline");
        return null;
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    refreshToken,
                    grantType: "refresh_token",
                    clientType: "extension"
                })
            }));
        if (!response.ok) {
            const errorText = await response.text();
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Cline token", {
                status: response.status,
                error: errorText
            });
            const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
            if (code === "invalid_grant" || code === "invalid_request") {
                return {
                    error: "unrecoverable_refresh_error",
                    code
                };
            }
            return null;
        }
        const payload = await response.json();
        const data = payload?.data || payload;
        const expiresAtIso = data?.expiresAt;
        const expiresIn = expiresAtIso ? Math.max(1, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000)) : undefined;
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Cline token", {
            hasNewAccessToken: !!data?.accessToken,
            hasNewRefreshToken: !!data?.refreshToken,
            expiresIn
        });
        return {
            accessToken: data?.accessToken,
            refreshToken: data?.refreshToken || refreshToken,
            expiresIn
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing Cline token: ${error.message}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[project]/open-sse/utils/kimiDevice.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKimiDeviceModel",
    ()=>getKimiDeviceModel
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
;
;
let cachedDeviceModel = null;
function getKimiDeviceModel() {
    if (cachedDeviceModel !== null) return cachedDeviceModel;
    const type = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["type"])();
    const version = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["release"])();
    const architecture = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["arch"])();
    if (type === "Darwin") {
        let productVersion = version;
        try {
            productVersion = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["execFileSync"])("/usr/bin/sw_vers", [
                "-productVersion"
            ], {
                encoding: "utf8",
                timeout: 1000
            }).trim() || version;
        } catch  {
        // Fall back to the Darwin release when sw_vers is unavailable.
        }
        cachedDeviceModel = `macOS ${productVersion} ${architecture}`;
    } else if (type === "Windows_NT") {
        cachedDeviceModel = `Windows ${version} ${architecture}`;
    } else {
        cachedDeviceModel = `${type} ${version} ${architecture}`.trim();
    }
    return cachedDeviceModel;
}
}),
"[project]/open-sse/services/tokenRefresh/providers/kimiCoding.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshKimiCodingToken",
    ()=>refreshKimiCodingToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/runtime.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kimiDevice$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kimiDevice.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function refreshKimiCodingToken(refreshToken, providerSpecificData, log, proxyConfig = null) {
    const endpoint = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["kimi-coding"]?.refreshUrl || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["kimi-coding"]?.tokenUrl;
    if (!endpoint) {
        log?.warn?.("TOKEN_REFRESH", "No refresh URL configured for Kimi Coding");
        return null;
    }
    // Prefer stable device_id persisted at login time; fall back to a
    // deterministic hash of the refresh token so it is at least consistent
    // across refreshes for the same session.
    const stableDeviceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKimiDeviceId"])(providerSpecificData?.deviceId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKimiDeviceId"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["pbkdf2Sync"])(refreshToken, "kimi-device-id", 1000, 16, "sha256").toString("hex"));
    const osRelease = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["release"])();
    const persistedDeviceModel = typeof providerSpecificData?.deviceModel === "string" ? providerSpecificData.deviceModel.trim() : "";
    const deviceModel = persistedDeviceModel || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kimiDevice$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKimiDeviceModel"])();
    try {
        const params = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["kimi-coding"]?.clientId || ""
        });
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKimiCodeIdentityHeaders"])({
                        deviceId: stableDeviceId,
                        deviceName: providerSpecificData?.deviceName || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["hostname"])(),
                        deviceModel,
                        osVersion: providerSpecificData?.osVersion || osRelease
                    })
                },
                body: params
            }));
        if (!response.ok) {
            const errorText = await response.text();
            // Detect unrecoverable errors
            try {
                const parsed = JSON.parse(errorText);
                const errorCode = parsed?.error;
                if (errorCode === "invalid_grant" || errorCode === "invalid_request") {
                    log?.error?.("TOKEN_REFRESH", "Kimi Coding refresh token invalid. Re-authentication required.", {
                        errorCode
                    });
                    return {
                        error: "unrecoverable_refresh_error",
                        code: errorCode
                    };
                }
            } catch  {
            // not JSON — fall through
            }
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Kimi Coding token", {
                status: response.status,
                error: errorText.slice(0, 200)
            });
            return null;
        }
        const tokens = await response.json();
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Kimi Coding token", {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in
        });
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || refreshToken,
            expiresIn: tokens.expires_in,
            tokenType: tokens.token_type,
            scope: tokens.scope
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing Kimi Coding token: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/gitlabDuo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGitLabDuoToken",
    ()=>refreshGitLabDuoToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function refreshGitLabDuoToken(refreshToken, providerSpecificData, log, proxyConfig = null) {
    if (!refreshToken) {
        log?.warn?.("TOKEN_REFRESH", "No refresh token for GitLab Duo");
        return null;
    }
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveGitLabOAuthBaseUrl"])(providerSpecificData);
    const endpoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(baseUrl);
    const tokenUrl = endpoints.tokenUrl;
    // client_id from providerSpecificData (stored at login) or fall back to PROVIDERS config
    const clientId = providerSpecificData?.clientId || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["gitlab-duo"]?.clientId || process.env.GITLAB_DUO_OAUTH_CLIENT_ID || process.env.GITLAB_OAUTH_CLIENT_ID || "";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                    client_id: clientId
                })
            }));
        if (!response.ok) {
            const errorText = await response.text();
            // Detect unrecoverable token — GitLab returns standard OAuth2 error codes.
            try {
                const errorBody = JSON.parse(errorText);
                const errorCode = errorBody.error;
                if (errorCode === "invalid_grant" || errorCode === "invalid_request") {
                    log?.error?.("TOKEN_REFRESH", "GitLab Duo refresh token invalid. Re-authentication required.", {
                        errorCode
                    });
                    return {
                        error: "unrecoverable_refresh_error",
                        code: errorCode
                    };
                }
            } catch  {
            // not JSON — fall through
            }
            log?.error?.("TOKEN_REFRESH", "Failed to refresh GitLab Duo token", {
                status: response.status,
                error: errorText.slice(0, 200)
            });
            return null;
        }
        const tokens = await response.json();
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed GitLab Duo token", {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in
        });
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || refreshToken,
            expiresIn: tokens.expires_in
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing GitLab Duo token: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/claudeOAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshClaudeOAuthToken",
    ()=>refreshClaudeOAuthToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshClaudeOAuthToken(refreshToken, log, proxyConfig = null) {
    try {
        // Standard OAuth2 token refresh uses form-urlencoded (not JSON)
        const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].claude.clientId
        });
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].anthropic.token, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                    "anthropic-beta": "oauth-2025-04-20"
                },
                body: params.toString()
            }));
        if (!response.ok) {
            // Read + classify the body ONCE, shape-agnostic. A proxy/MITM can deliver
            // the invalid_grant 400 as a JSON string, a double-encoded string, a
            // nested {error:{code}}, or raw text — all must yield the sentinel so the
            // HealthCheck deactivates instead of looping every 60s.
            const { rawText, code } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readRefreshErrorBody"])(response);
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Claude OAuth token", {
                status: response.status,
                error: rawText.slice(0, 300)
            });
            if (code === "invalid_grant" || code === "invalid_request") {
                return {
                    error: "unrecoverable_refresh_error",
                    code
                };
            }
            return null;
        }
        const tokens = await response.json();
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Claude OAuth token", {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in
        });
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || refreshToken,
            expiresIn: tokens.expires_in
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing Claude token: ${error.message}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/google.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGoogleToken",
    ()=>refreshGoogleToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshGoogleToken(refreshToken, clientId, clientSecret, log, proxyConfig = null) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].google.token, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret
            })
        }));
    if (!response.ok) {
        const errorText = await response.text();
        log?.error?.("TOKEN_REFRESH", "Failed to refresh Google token", {
            status: response.status,
            error: errorText.slice(0, 200)
        });
        // Detect unrecoverable token (invalid_grant = revoked / expired refresh token)
        try {
            const errorBody = JSON.parse(errorText);
            if (errorBody.error === "invalid_grant") {
                log?.error?.("TOKEN_REFRESH", "Google refresh token invalid. Re-authentication required.", {
                    provider: "google"
                });
                return {
                    error: "unrecoverable_refresh_error",
                    code: "invalid_grant"
                };
            }
        } catch  {
        // not JSON — fall through
        }
        return null;
    }
    const tokens = await response.json();
    log?.info?.("TOKEN_REFRESH", "Successfully refreshed Google token", {
        hasNewAccessToken: !!tokens.access_token,
        hasNewRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in
    });
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresIn: tokens.expires_in
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/codeAssistSubscription.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Code Assist (loadCodeAssist) subscription tier extraction.
 * Mirrors Antigravity-Manager src-tauri/src/modules/quota.rs fetch_project_id().
 */ __turbopack_context__.s([
    "extractCodeAssistOnboardTierId",
    ()=>extractCodeAssistOnboardTierId,
    "extractCodeAssistSubscriptionTier",
    ()=>extractCodeAssistSubscriptionTier
]);
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function pickTierField(tier, field) {
    const record = toRecord(tier);
    const value = record[field];
    return typeof value === "string" && value.trim() ? value.trim() : null;
}
function isIneligible(subscription) {
    const ineligible = subscription.ineligibleTiers;
    return Array.isArray(ineligible) && ineligible.length > 0;
}
function findDefaultAllowedTier(subscription) {
    if (!Array.isArray(subscription.allowedTiers)) return null;
    for (const tierValue of subscription.allowedTiers){
        const tier = toRecord(tierValue);
        if (tier.isDefault) return tier;
    }
    return null;
}
function extractCodeAssistSubscriptionTier(subscriptionInfo) {
    const subscription = toRecord(subscriptionInfo);
    if (Object.keys(subscription).length === 0) return null;
    let tier = pickTierField(subscription.paidTier, "name") || pickTierField(subscription.paidTier, "id");
    if (!tier) {
        if (!isIneligible(subscription)) {
            tier = pickTierField(subscription.currentTier, "name") || pickTierField(subscription.currentTier, "id");
        } else {
            const defaultTier = findDefaultAllowedTier(subscription);
            if (defaultTier) {
                const name = pickTierField(defaultTier, "name");
                const id = pickTierField(defaultTier, "id");
                if (name) tier = `${name} (Restricted)`;
                else if (id) tier = `${id} (Restricted)`;
            }
        }
    }
    return tier;
}
function extractCodeAssistOnboardTierId(subscriptionInfo) {
    const subscription = toRecord(subscriptionInfo);
    const paidId = pickTierField(subscription.paidTier, "id");
    if (paidId) return paidId;
    if (!isIneligible(subscription)) {
        const currentId = pickTierField(subscription.currentTier, "id");
        if (currentId) return currentId;
    }
    const defaultTier = findDefaultAllowedTier(subscription);
    const defaultId = defaultTier ? pickTierField(defaultTier, "id") : null;
    if (defaultId) return defaultId;
    const currentId = pickTierField(subscription.currentTier, "id");
    if (currentId) return currentId;
    return "legacy-tier";
}
}),
"[project]/open-sse/services/antigravityProjectBootstrap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAntigravityProjectCache",
    ()=>clearAntigravityProjectCache,
    "ensureAntigravityProjectAssigned",
    ()=>ensureAntigravityProjectAssigned,
    "getAntigravityLoadCodeAssistUrls",
    ()=>getAntigravityLoadCodeAssistUrls,
    "getAntigravityProjectFromCache",
    ()=>getAntigravityProjectFromCache
]);
/**
 * Antigravity project bootstrap — loadCodeAssist + onboardUser.
 *
 * The Google Cloud Code Assist API (/v1internal:models) requires a prior
 * /v1internal:loadCodeAssist call to assign a project context to the
 * OAuth token. Without this bootstrap, :models returns 404.
 *
 * This module provides an idempotent ensureAntigravityProjectAssigned()
 * helper that is called once per access-token before every discovery
 * attempt. Results are memoized per-token for the process lifetime to
 * avoid redundant round-trips.
 *
 * When loadCodeAssist returns no project (account never onboarded),
 * the fallback calls onboardUser to create the project, then retries.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codeAssistSubscription.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [app-route] (ecmascript)");
;
;
;
const LOAD_CODE_ASSIST_PATH = "/v1internal:loadCodeAssist";
const BOOTSTRAP_TIMEOUT_MS = 8_000;
const ONBOARD_TIMEOUT_MS = 15_000;
const DEFAULT_TIER_ID = "legacy-tier";
function getAntigravityLoadCodeAssistUrls() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((base)=>`${base}${LOAD_CODE_ASSIST_PATH}`);
}
/** Max entries in the per-token caches (prevents unbounded growth). */ const MAX_CACHE_SIZE = 256;
/** LRU-style Map: deleting and re-inserting moves the key to the end. */ function evictOldest(cache) {
    if (cache.size >= MAX_CACHE_SIZE) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
    }
}
/** Per-token memoization cache (lives for the process lifetime). */ const projectCache = new Map();
/** Per-key lock to prevent concurrent onboard attempts for the same token. */ const onboardLocks = new Map();
function getProjectCacheKey(accessToken, clientProfile) {
    return `${clientProfile}:${accessToken}`;
}
/**
 * Attempt loadCodeAssist against each known base URL in order.
 * Returns the discovered project id and tier id, or null projectId if all endpoints fail.
 */ async function tryLoadCodeAssist(accessToken, fetchImpl, clientProfile, signal) {
    const urls = getAntigravityLoadCodeAssistUrls();
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken);
    for(let i = 0; i < urls.length; i++){
        const url = urls[i];
        if (signal?.aborted) throw signal.reason;
        try {
            const timeoutSignal = AbortSignal.timeout(BOOTSTRAP_TIMEOUT_MS);
            const response = await fetchImpl(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityLoadCodeAssistMetadata"])()
                }),
                signal: signal ? AbortSignal.any([
                    signal,
                    timeoutSignal
                ]) : timeoutSignal
            });
            if (!response.ok) {
                console.warn(`[models] antigravity loadCodeAssist failed at ${url} (${response.status}) — trying next`);
                continue;
            }
            const data = await response.json();
            // cloudaicompanionProject may be a plain string or an object with an id field.
            const raw = data.cloudaicompanionProject;
            const projectId = typeof raw === "string" ? raw.trim() : raw && typeof raw === "object" && typeof raw.id === "string" ? raw.id.trim() : "";
            const tierId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCodeAssistOnboardTierId"])(data) || DEFAULT_TIER_ID;
            if (projectId) {
                return {
                    projectId,
                    tierId
                };
            }
            // Continue to next URL if available — a different endpoint might
            // have the project. Only return empty when this is the last URL.
            if (i === urls.length - 1) {
                return {
                    projectId: null,
                    tierId
                };
            }
            console.warn(`[models] antigravity loadCodeAssist at ${url} returned no project id — trying next`);
        } catch (error) {
            if (signal?.aborted || error instanceof Error && error.name === "AbortError") {
                throw signal?.reason ?? error;
            }
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`[models] antigravity loadCodeAssist threw for ${url}: ${msg} — trying next`);
        }
    }
    return {
        projectId: null,
        tierId: DEFAULT_TIER_ID
    };
}
/**
 * Attempt onboardUser to create a Cloud Code project for the account.
 * Called when loadCodeAssist returns no project — the account has never
 * been onboarded. Returns true if any endpoint reports success.
 */ async function tryOnboardUser(accessToken, fetchImpl, clientProfile, tierId, signal) {
    const urls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityOnboardUrls"])();
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken);
    for (const url of urls){
        if (signal?.aborted) throw signal.reason;
        try {
            const timeoutSignal = AbortSignal.timeout(ONBOARD_TIMEOUT_MS);
            const response = await fetchImpl(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    tier_id: tierId,
                    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityLoadCodeAssistMetadata"])()
                }),
                signal: signal ? AbortSignal.any([
                    signal,
                    timeoutSignal
                ]) : timeoutSignal
            });
            if (response.ok) {
                return true;
            }
            console.warn(`[models] antigravity onboardUser failed at ${url} (${response.status}) — trying next`);
        } catch (error) {
            if (signal?.aborted || error instanceof Error && error.name === "AbortError") {
                throw signal?.reason ?? error;
            }
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`[models] antigravity onboardUser threw for ${url}: ${msg} — trying next`);
        }
    }
    return false;
}
/** Per-token memoization for accounts we already tried onboarding (avoid repeated calls). */ const onboardAttemptedCache = new Set();
function addToOnboardAttemptedCache(key) {
    if (onboardAttemptedCache.size >= MAX_CACHE_SIZE) {
        const oldest = onboardAttemptedCache.values().next().value;
        if (oldest !== undefined) onboardAttemptedCache.delete(oldest);
    }
    onboardAttemptedCache.add(key);
}
async function ensureAntigravityProjectAssigned(accessToken, fetchImpl = fetch, clientProfile = "ide", signal) {
    const cacheKey = getProjectCacheKey(accessToken, clientProfile);
    if (projectCache.has(cacheKey)) {
        const cached = projectCache.get(cacheKey);
        // Touch on read: delete+reinsert moves this entry to the end (LRU).
        projectCache.delete(cacheKey);
        projectCache.set(cacheKey, cached);
        return cached;
    }
    const { projectId: initialProjectId, tierId } = await tryLoadCodeAssist(accessToken, fetchImpl, clientProfile, signal);
    let projectId = initialProjectId;
    // loadCodeAssist is read-only — if the account was never onboarded, it returns
    // empty. Call onboardUser to create the project, then retry discovery.
    if (!projectId && !onboardAttemptedCache.has(cacheKey)) {
        // Per-key lock: concurrent calls for the same token share one onboard attempt.
        let lock = onboardLocks.get(cacheKey);
        if (!lock) {
            lock = (async ()=>{
                let aborted = false;
                try {
                    const onboarded = await tryOnboardUser(accessToken, fetchImpl, clientProfile, tierId, signal);
                    if (onboarded) {
                        const retry = await tryLoadCodeAssist(accessToken, fetchImpl, clientProfile, signal);
                        if (retry.projectId) {
                            evictOldest(projectCache);
                            projectCache.set(cacheKey, retry.projectId);
                            return true;
                        }
                    }
                    return false;
                } catch (e) {
                    aborted = signal?.aborted === true;
                    return false;
                } finally{
                    onboardLocks.delete(cacheKey);
                    if (!aborted) addToOnboardAttemptedCache(cacheKey);
                }
            })();
            onboardLocks.set(cacheKey, lock);
        }
        const success = await lock;
        if (success) {
            const cached = projectCache.get(cacheKey);
            if (cached) return cached;
        }
    }
    if (projectId) {
        evictOldest(projectCache);
        projectCache.set(cacheKey, projectId);
        return projectId;
    }
    return undefined;
}
function clearAntigravityProjectCache() {
    projectCache.clear();
    onboardAttemptedCache.clear();
    onboardLocks.clear();
}
function getAntigravityProjectFromCache(accessToken, clientProfile = "ide") {
    return projectCache.get(getProjectCacheKey(accessToken, clientProfile));
}
}),
"[project]/open-sse/services/antigravityProjectPersist.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "persistDiscoveredAntigravityProjectId",
    ()=>persistDiscoveredAntigravityProjectId
]);
/**
 * Persist a runtime-discovered Antigravity projectId back onto its connection row
 * (#8491).
 *
 * `ensureAntigravityProjectAssigned()` recovers a missing projectId via a
 * `loadCodeAssist` round-trip and hands it back to the caller for the in-flight
 * request only — nothing wrote it back to the connection record, so every
 * subsequent token refresh (or process restart) lost the discovery and forced a
 * fresh round-trip. This module is the single best-effort write path both call
 * sites (`open-sse/executors/antigravity.ts` and the models-discovery
 * normalizer) funnel through, mirroring the shape `mapAntigravityTokens()`
 * already persists at OAuth-exchange time (`src/lib/oauth/providers/antigravity.ts`).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function persistDiscoveredAntigravityProjectId(connectionId, discoveredProjectId, existingProviderSpecificData) {
    if (!connectionId || !discoveredProjectId) return;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
            projectId: discoveredProjectId,
            providerSpecificData: {
                ...existingProviderSpecificData || {},
                projectId: discoveredProjectId
            }
        });
    } catch  {
    // Non-fatal: persistence failure must never block the in-flight request.
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/codex.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshCodexToken",
    ()=>refreshCodexToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshCodexToken(refreshToken, log, proxyConfig = null) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].openai.token, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                // Body intentionally omits `scope`. RFC 6749 §6 makes scope optional on a
                // refresh_token grant (the server reuses the originally-granted scope when
                // absent). Including `scope` causes Auth0 (which OpenAI Codex OAuth is
                // built on) to treat the request as a re-scope, which can invalidate
                // sibling refresh_token families on the same client_id. Matches the
                // pattern used by ndycode/codex-multi-auth, the only known tool that
                // sustains multiple Codex accounts without cross-invalidation.
                body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                    client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].codex.clientId
                })
            }));
        if (!response.ok) {
            const errorText = await response.text();
            // Detect unrecoverable "refresh_token_reused" or "invalid_grant" error from OpenAI
            // This means the token was already consumed or has expired.
            // Retrying with the same token will never succeed.
            let errorCode = null;
            try {
                const parsed = JSON.parse(errorText);
                errorCode = parsed?.error?.code || (typeof parsed?.error === "string" ? parsed.error : null);
            } catch  {
            // not JSON, ignore
            }
            if (errorCode === "refresh_token_reused" || errorCode === "invalid_grant" || errorCode === "token_expired" || errorCode === "invalid_token") {
                log?.error?.("TOKEN_REFRESH", "Codex refresh token already used or invalid. Re-authentication required.", {
                    status: response.status,
                    errorCode
                });
                return {
                    error: "unrecoverable_refresh_error",
                    code: errorCode
                };
            }
            // Defense-in-depth (port from decolua/9router#1821): any 401 from OpenAI's
            // OAuth token endpoint means the refresh credential itself was rejected
            // (e.g. rotated away, or a payload variant whose code we do not yet
            // recognize — OpenAI has shipped both `token_expired` and the bare
            // "Could not validate your token" message). Retrying with the same dead
            // refresh token will never succeed; surface re-auth instead of looping.
            // 429 / 5xx remain transient and fall through to the retryable branch.
            if (response.status === 401) {
                const code = errorCode || "unauthorized";
                log?.error?.("TOKEN_REFRESH", "Codex OAuth token endpoint returned 401. Re-authentication required.", {
                    status: response.status,
                    errorCode: code
                });
                return {
                    error: "unrecoverable_refresh_error",
                    code
                };
            }
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Codex token", {
                status: response.status,
                error: errorText
            });
            return null;
        }
        const tokens = await response.json();
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Codex token", {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in
        });
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || refreshToken,
            expiresIn: tokens.expires_in
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing Codex token: ${error.message}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/kiroExternalIdp.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * kiroExternalIdp.ts — shared helpers for Kiro / Amazon Q **External IdP**
 * (enterprise "Your organization" SSO) accounts.
 *
 * Unlike AWS Builder ID / IAM Identity Center (which mint AWS SSO-OIDC tokens
 * refreshed at `oidc.{region}.amazonaws.com` and whose refresh token starts with
 * `aorAAAAAG`) or the Google/GitHub social flow (refreshed at the Kiro auth
 * service), an **External IdP** login federates through the organization's own
 * identity provider (most commonly Microsoft Entra ID). Its Kiro token file
 * (`~/.aws/sso/cache/kiro-auth-token.json`) looks like:
 *
 *   {
 *     "accessToken":  "<JWT issued by the org IdP, scp: codewhisperer:*>",
 *     "refreshToken": "<IdP refresh token, NOT aorAAAAAG…>",
 *     "authMethod":   "external_idp",
 *     "provider":     "ExternalIdp",
 *     "clientId":     "<IdP application (client) id — a public client, no secret>",
 *     "tokenEndpoint":"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
 *     "issuerUrl":    "https://login.microsoftonline.com/{tenant}/v2.0",
 *     "scopes":       "api://{clientId}/codewhisperer:conversations … offline_access"
 *   }
 *
 * Two consequences this module encodes (both verified against a live org token):
 *   1. The token is refreshed with a **standard public-client OAuth2
 *      `refresh_token` grant against `tokenEndpoint`** (form-encoded
 *      client_id + refresh_token + scope, NO client_secret) — see
 *      {@link buildExternalIdpRefreshParams}.
 *   2. At runtime the access token is sent to CodeWhisperer as a normal bearer
 *      but MUST carry the header `TokenType: EXTERNAL_IDP` so the service binds
 *      it to the Amazon Q Developer profile (without it every call returns
 *      `ValidationException: Invalid ARN <clientId>`). The profileArn itself is
 *      NOT discoverable via `ListAvailableProfiles` (it returns an empty list
 *      for these tokens); it is read from the Kiro IDE `profile.json` at import.
 */ /** authMethod marker persisted on External IdP connections. */ __turbopack_context__.s([
    "KIRO_EXTERNAL_IDP_AUTH_METHOD",
    ()=>KIRO_EXTERNAL_IDP_AUTH_METHOD,
    "KIRO_EXTERNAL_IDP_TOKEN_TYPE_HEADER",
    ()=>KIRO_EXTERNAL_IDP_TOKEN_TYPE_HEADER,
    "KIRO_EXTERNAL_IDP_TOKEN_TYPE_VALUE",
    ()=>KIRO_EXTERNAL_IDP_TOKEN_TYPE_VALUE,
    "buildExternalIdpRefreshParams",
    ()=>buildExternalIdpRefreshParams,
    "decodeJwtPayload",
    ()=>decodeJwtPayload,
    "emailFromExternalIdpToken",
    ()=>emailFromExternalIdpToken,
    "isExternalIdpAuthMethod",
    ()=>isExternalIdpAuthMethod,
    "normalizeScope",
    ()=>normalizeScope,
    "validateExternalIdpTokenEndpoint",
    ()=>validateExternalIdpTokenEndpoint
]);
const KIRO_EXTERNAL_IDP_AUTH_METHOD = "external_idp";
const KIRO_EXTERNAL_IDP_TOKEN_TYPE_HEADER = "TokenType";
const KIRO_EXTERNAL_IDP_TOKEN_TYPE_VALUE = "EXTERNAL_IDP";
/**
 * Allowlist of enterprise IdP token-endpoint host suffixes. The refresh token is
 * POSTed to this endpoint, so we constrain it to well-known identity providers
 * (SSRF guard — the value ultimately originates from an on-disk token file).
 * Microsoft Entra is by far the most common Kiro org IdP; the others cover the
 * major enterprise SSO vendors an org might federate Kiro through.
 */ const ALLOWED_IDP_HOST_SUFFIXES = [
    "login.microsoftonline.com",
    "login.microsoftonline.us",
    "login.partner.microsoftonline.cn",
    "login.microsoft.com",
    "login.windows.net",
    "sts.windows.net",
    ".okta.com",
    ".oktapreview.com",
    ".okta-emea.com",
    ".auth0.com",
    ".onelogin.com",
    ".pingidentity.com",
    ".pingone.com",
    "accounts.google.com",
    "oauth2.googleapis.com",
    ".amazoncognito.com"
];
function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function isExternalIdpAuthMethod(authMethod) {
    return normalizeString(authMethod).toLowerCase() === KIRO_EXTERNAL_IDP_AUTH_METHOD;
}
function validateExternalIdpTokenEndpoint(rawEndpoint) {
    const tokenEndpoint = normalizeString(rawEndpoint);
    if (!tokenEndpoint) throw new Error("tokenEndpoint is required for external_idp");
    let parsed;
    try {
        parsed = new URL(tokenEndpoint);
    } catch  {
        throw new Error("tokenEndpoint must be a valid URL");
    }
    if (parsed.protocol !== "https:") {
        throw new Error("tokenEndpoint must use https");
    }
    const host = parsed.hostname.toLowerCase();
    const allowed = ALLOWED_IDP_HOST_SUFFIXES.some((suffix)=>suffix.startsWith(".") ? host.endsWith(suffix) : host === suffix);
    if (!allowed) {
        throw new Error(`tokenEndpoint host is not an allowed identity provider: ${host}`);
    }
    return parsed.toString();
}
function normalizeScope(scopes) {
    if (Array.isArray(scopes)) {
        return scopes.map(normalizeString).filter(Boolean).join(" ");
    }
    return normalizeString(scopes);
}
function decodeJwtPayload(jwt) {
    try {
        if (typeof jwt !== "string") return null;
        const parts = jwt.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padding = (4 - base64.length % 4) % 4;
        const json = Buffer.from(`${base64}${"=".repeat(padding)}`, "base64").toString("utf8");
        return JSON.parse(json);
    } catch  {
        return null;
    }
}
function emailFromExternalIdpToken(accessToken) {
    const claims = decodeJwtPayload(accessToken);
    if (!claims) return null;
    const pick = (k)=>typeof claims[k] === "string" ? claims[k] : undefined;
    return pick("email") || pick("preferred_username") || pick("upn") || null;
}
function buildExternalIdpRefreshParams(refreshToken, providerSpecificData) {
    const psd = providerSpecificData || {};
    const clientId = normalizeString(psd.clientId ?? psd.client_id);
    const tokenEndpoint = validateExternalIdpTokenEndpoint(psd.tokenEndpoint ?? psd.token_endpoint);
    const scope = normalizeScope(psd.scope ?? psd.scopes);
    if (!refreshToken) throw new Error("refresh token is required for external_idp refresh");
    if (!clientId) throw new Error("clientId is required for external_idp refresh");
    if (!scope) throw new Error("scope is required for external_idp refresh");
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refreshToken,
        scope
    });
    return {
        tokenEndpoint,
        body
    };
}
}),
"[project]/open-sse/services/tokenRefresh/providers/kiro.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshKiroToken",
    ()=>refreshKiroToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/kiroExternalIdp.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshKiroToken(refreshToken, providerSpecificData, log, proxyConfig = null) {
    try {
        const authMethod = providerSpecificData?.authMethod;
        const clientId = providerSpecificData?.clientId;
        const clientSecret = providerSpecificData?.clientSecret;
        const region = providerSpecificData?.region;
        // Enterprise / Microsoft Entra "Your organization" (external_idp) logins refresh with a
        // standard PUBLIC-client OAuth2 refresh_token grant against the org IdP's own tokenEndpoint
        // (form-encoded client_id + refresh_token + scope, no client_secret) — NOT the AWS SSO OIDC
        // or Kiro social endpoints. The rotated refresh_token is persisted by the caller.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isExternalIdpAuthMethod"])(authMethod)) {
            let refreshRequest;
            try {
                refreshRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExternalIdpRefreshParams"])(refreshToken, providerSpecificData);
            } catch (cfgErr) {
                log?.error?.("TOKEN_REFRESH", `Invalid Kiro external_idp refresh config: ${cfgErr instanceof Error ? cfgErr.message : String(cfgErr)}`);
                return null;
            }
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(refreshRequest.tokenEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept: "application/json"
                    },
                    body: refreshRequest.body
                }));
            if (!response.ok) {
                const errorText = await response.text();
                let oauthErr;
                try {
                    oauthErr = JSON.parse(errorText)?.error;
                } catch  {
                /* not JSON */ }
                if (oauthErr === "invalid_grant" || oauthErr === "invalid_client") {
                    log?.error?.("TOKEN_REFRESH", "Kiro external_idp refresh token expired/invalid. Re-authentication required.", {
                        oauthErr
                    });
                    return {
                        error: "unrecoverable_refresh_error",
                        code: oauthErr
                    };
                }
                log?.error?.("TOKEN_REFRESH", "Failed to refresh Kiro external_idp token", {
                    status: response.status,
                    error: errorText.slice(0, 200)
                });
                return null;
            }
            const tokens = await response.json();
            log?.info?.("TOKEN_REFRESH", "Successfully refreshed Kiro external_idp token", {
                hasNewAccessToken: !!tokens.access_token,
                hasNewRefreshToken: !!tokens.refresh_token,
                expiresIn: tokens.expires_in
            });
            return {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || refreshToken,
                expiresIn: tokens.expires_in || 3600
            };
        }
        // AWS SSO OIDC (Builder ID or IDC)
        // If clientId and clientSecret exist, assume AWS SSO OIDC (default to builder-id if authMethod not specified).
        // Exception: imported social tokens (authMethod === "imported") carry a freshly-registered
        // clientId/clientSecret but their refresh token is Kiro-social-issued — the isolated OIDC client
        // cannot refresh it, so they must fall through to the social auth path (#2467).
        if (clientId && clientSecret && authMethod !== "imported") {
            const endpoint = `https://oidc.${region || "us-east-1"}.amazonaws.com/token`;
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        clientId: clientId,
                        clientSecret: clientSecret,
                        refreshToken: refreshToken,
                        grantType: "refresh_token"
                    })
                }));
            if (!response.ok) {
                const errorText = await response.text();
                // AWS SSO OIDC uses {"__type": "InvalidGrantException"} error format (not standard OAuth2).
                let awsErrorType;
                try {
                    const awsError = JSON.parse(errorText);
                    awsErrorType = awsError.__type || awsError.error;
                } catch  {
                // not JSON
                }
                // If the refresh token itself is expired/revoked, no amount of re-registration helps.
                if (awsErrorType === "InvalidGrantException" || awsErrorType === "ExpiredTokenException" || awsErrorType === "invalid_grant") {
                    log?.error?.("TOKEN_REFRESH", "Kiro AWS refresh token expired/invalid. Re-authentication required.", {
                        awsErrorType
                    });
                    return {
                        error: "unrecoverable_refresh_error",
                        code: awsErrorType
                    };
                }
                // Client credentials may be expired/invalid (DB import, TTL expiry, browser conflict).
                // Re-register a fresh OIDC client and retry once before giving up (#2524).
                log?.warn?.("TOKEN_REFRESH", "Kiro OIDC refresh failed, attempting client re-registration...", {
                    status: response.status,
                    error: errorText.slice(0, 200)
                });
                try {
                    const resolvedRegion = region || "us-east-1";
                    const regEndpoint = `https://oidc.${resolvedRegion}.amazonaws.com/client/register`;
                    const regRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(regEndpoint, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json"
                            },
                            body: JSON.stringify({
                                clientName: "kiro-oauth-client",
                                clientType: "public",
                                scopes: [
                                    "codewhisperer:completions",
                                    "codewhisperer:analysis",
                                    "codewhisperer:conversations"
                                ],
                                grantTypes: [
                                    "urn:ietf:params:oauth:grant-type:device_code",
                                    "refresh_token"
                                ],
                                issuerUrl: "https://identitycenter.amazonaws.com/ssoins-722374e8c3c8e6c6"
                            })
                        }));
                    if (regRes.ok) {
                        const newClient = await regRes.json();
                        const retryRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json"
                                },
                                body: JSON.stringify({
                                    clientId: newClient.clientId,
                                    clientSecret: newClient.clientSecret,
                                    refreshToken: refreshToken,
                                    grantType: "refresh_token"
                                })
                            }));
                        if (retryRes.ok) {
                            const retryTokens = await retryRes.json();
                            log?.info?.("TOKEN_REFRESH", "Kiro refresh recovered via client re-registration", {
                                hasNewAccessToken: !!retryTokens.accessToken,
                                expiresIn: retryTokens.expiresIn
                            });
                            return {
                                accessToken: retryTokens.accessToken,
                                refreshToken: retryTokens.refreshToken || refreshToken,
                                expiresIn: retryTokens.expiresIn,
                                _newClientId: newClient.clientId,
                                _newClientSecret: newClient.clientSecret,
                                _newClientSecretExpiresAt: newClient.clientSecretExpiresAt
                            };
                        }
                    }
                } catch (reRegErr) {
                    log?.warn?.("TOKEN_REFRESH", "Kiro client re-registration fallback failed", {
                        error: String(reRegErr)
                    });
                }
                log?.error?.("TOKEN_REFRESH", "Failed to refresh Kiro AWS token", {
                    status: response.status,
                    error: errorText.slice(0, 200)
                });
                return null;
            }
            const tokens = await response.json();
            log?.info?.("TOKEN_REFRESH", "Successfully refreshed Kiro AWS token", {
                hasNewAccessToken: !!tokens.accessToken,
                expiresIn: tokens.expiresIn
            });
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken || refreshToken,
                expiresIn: tokens.expiresIn
            };
        }
        // Social Auth (Google/GitHub) - use Kiro's refresh endpoint
        const tokenUrl = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].kiro.tokenUrl;
        if (!tokenUrl) {
            log?.error?.("TOKEN_REFRESH", "Missing Kiro token endpoint");
            return null;
        }
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            }));
        if (!response.ok) {
            const errorText = await response.text();
            // Also check for AWS-style errors on the social auth path (Kiro may relay them)
            try {
                const awsError = JSON.parse(errorText);
                const awsErrorType = awsError.__type || awsError.error;
                if (awsErrorType === "InvalidGrantException" || awsErrorType === "ExpiredTokenException" || awsErrorType === "invalid_grant") {
                    log?.error?.("TOKEN_REFRESH", "Kiro social refresh token expired/invalid. Re-authentication required.", {
                        awsErrorType
                    });
                    return {
                        error: "unrecoverable_refresh_error",
                        code: awsErrorType
                    };
                }
            } catch  {
            // not JSON — fall through
            }
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Kiro social token", {
                status: response.status,
                error: errorText.slice(0, 200)
            });
            return null;
        }
        const tokens = await response.json();
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Kiro social token", {
            hasNewAccessToken: !!tokens.accessToken,
            expiresIn: tokens.expiresIn
        });
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || refreshToken,
            expiresIn: tokens.expiresIn
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Network error refreshing Kiro token: ${error.message}`);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/qoder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshQoderToken",
    ()=>refreshQoderToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshQoderToken(refreshToken, log, proxyConfig = null) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].qoder.token || !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientId || !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientSecret) {
        log?.warn?.("TOKEN_REFRESH", "Qoder OAuth refresh skipped: browser OAuth is not configured in this environment");
        return null;
    }
    const basicAuth = btoa(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientId}:${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientSecret}`);
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].qoder.token, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                Authorization: `Basic ${basicAuth}`
            },
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientId,
                client_secret: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientSecret
            })
        }));
    if (!response.ok) {
        const errorText = await response.text();
        log?.error?.("TOKEN_REFRESH", "Failed to refresh Qoder token", {
            status: response.status,
            error: errorText
        });
        const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
        if (code === "invalid_grant" || code === "invalid_request") {
            return {
                error: "unrecoverable_refresh_error",
                code
            };
        }
        return null;
    }
    const tokens = await response.json();
    log?.info?.("TOKEN_REFRESH", "Successfully refreshed Qoder token", {
        hasNewAccessToken: !!tokens.access_token,
        hasNewRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in
    });
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresIn: tokens.expires_in
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/github.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGitHubToken",
    ()=>refreshGitHubToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshGitHubToken(refreshToken, log, proxyConfig = null) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].github.token, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFormParams"])({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].github.clientId,
                client_secret: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].github.clientSecret
            })
        }));
    if (!response.ok) {
        const errorText = await response.text();
        log?.error?.("TOKEN_REFRESH", "Failed to refresh GitHub token", {
            status: response.status,
            error: errorText
        });
        const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
        if (code === "invalid_grant" || code === "invalid_request") {
            return {
                error: "unrecoverable_refresh_error",
                code
            };
        }
        return null;
    }
    const tokens = await response.json();
    log?.info?.("TOKEN_REFRESH", "Successfully refreshed GitHub token", {
        hasNewAccessToken: !!tokens.access_token,
        hasNewRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in
    });
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresIn: tokens.expires_in
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh/providers/copilot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshCopilotToken",
    ()=>refreshCopilotToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function refreshCopilotToken(githubAccessToken, log, proxyConfig = null, baseUrl = "https://api.github.com") {
    try {
        const tokenUrl = `${baseUrl.replace(/\/+$/, "")}/copilot_internal/v2/token`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGitHubCopilotRefreshHeaders"])(`token ${githubAccessToken}`)
            }));
        if (!response.ok) {
            const errorText = await response.text();
            log?.error?.("TOKEN_REFRESH", "Failed to refresh Copilot token", {
                status: response.status,
                error: errorText
            });
            return null;
        }
        const data = await response.json();
        log?.info?.("TOKEN_REFRESH", "Successfully refreshed Copilot token", {
            hasToken: !!data.token,
            expiresAt: data.expires_at
        });
        return {
            token: data.token,
            expiresAt: data.expires_at
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", "Error refreshing Copilot token", {
            error: error.message
        });
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DEPRECATED_PROVIDERS",
    ()=>DEPRECATED_PROVIDERS,
    "REFRESH_LEAD_MS",
    ()=>REFRESH_LEAD_MS,
    "TOKEN_EXPIRY_BUFFER_MS",
    ()=>TOKEN_EXPIRY_BUFFER_MS,
    "formatProviderCredentials",
    ()=>formatProviderCredentials,
    "getAccessToken",
    ()=>getAccessToken,
    "getActiveOnPersist",
    ()=>getActiveOnPersist,
    "getAllAccessTokens",
    ()=>getAllAccessTokens,
    "getConnectionRefreshMutexStatus",
    ()=>getConnectionRefreshMutexStatus,
    "getDeprecationNotice",
    ()=>getDeprecationNotice,
    "getRefreshLeadMs",
    ()=>getRefreshLeadMs,
    "isDeprecatedProvider",
    ()=>isDeprecatedProvider,
    "refreshAccessToken",
    ()=>refreshAccessToken,
    "refreshTokenByProvider",
    ()=>refreshTokenByProvider,
    "runWithOnPersist",
    ()=>runWithOnPersist,
    "supportsTokenRefresh",
    ()=>supportsTokenRefresh
]);
// @ts-nocheck
//
// Per-provider refresh implementations live in ./tokenRefresh/providers/ (one
// file per provider) with shared helpers in ./tokenRefresh/shared.ts. This
// file keeps the orchestrator (refreshAccessToken, getAccessToken), the
// in-flight/rotation dedup maps, the CAS guard, and refreshWithRetry — the
// cross-provider plumbing. The provider-module split was originally proposed
// by KooshaPari in PR #7338, whose base was too old to merge as-is; this is an
// independent implementation of the same idea against the current tip, not a
// reuse of that diff. All previously-public exports are re-exported below so existing
// importers (open-sse/index.ts, executors, src/sse/services/tokenRefresh.ts,
// tests) are unaffected.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/rotationMap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/casGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/windsurf.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/codebuddyCn.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/cline.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/kimiCoding.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/gitlabDuo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/claudeOAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/google.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityProjectBootstrap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityProjectPersist.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/codex.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/kiro.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/qoder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/github.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;
const REFRESH_LEAD_MS = {
    // Rotating refresh tokens — minimize refresh frequency to avoid the
    // "refresh-invalidates-siblings" cascade documented for OpenAI Auth0.
    codex: 5 * 60 * 1000,
    openai: 5 * 60 * 1000,
    claude: 5 * 60 * 1000,
    "gitlab-duo": 5 * 60 * 1000,
    kiro: 5 * 60 * 1000,
    "kimi-coding": 5 * 60 * 1000,
    // Google OAuth refresh_tokens are permanent (non-rotating) — longer lead
    // is safe and reduces unnecessary upstream chatter.
    antigravity: 15 * 60 * 1000,
    agy: 15 * 60 * 1000
};
const DEPRECATED_PROVIDERS = {
    "gemini-cli": {
        migrateTo: "gemini",
        // The legacy path redeemed the token with PROVIDERS.gemini's client — the very same
        // public Gemini CLI / Code Assist OAuth client — which is why re-adding the account
        // under `gemini` is a real migration and not a suggestion to start over.
        reason: "The gemini-cli provider was discontinued and is not routable. Re-add this account " + "under the `gemini` provider — it uses the same Google OAuth client, so the same " + "login works and the account becomes usable again."
    }
};
function isDeprecatedProvider(provider) {
    return Boolean(provider) && Object.prototype.hasOwnProperty.call(DEPRECATED_PROVIDERS, provider);
}
function getDeprecationNotice(provider) {
    return isDeprecatedProvider(provider) ? DEPRECATED_PROVIDERS[provider] : null;
}
function getRefreshLeadMs(provider, providerSpecificData) {
    const override = providerSpecificData?.refreshLeadMs;
    if (typeof override === "number" && Number.isFinite(override) && override > 0) {
        return override;
    }
    return REFRESH_LEAD_MS[provider] ?? TOKEN_EXPIRY_BUFFER_MS;
}
// In-flight refresh promise cache to prevent race conditions
// Key: "provider:sha256(refreshToken)" → Value: Promise<result>
const refreshPromiseCache = new Map();
// Per-connection mutex: prevents parallel OAuth refresh for rotating tokens.
// Key: connectionId → Value: { promise, waiters }
// Primary dedup when credentials.connectionId is present; refreshPromiseCache is fallback.
const connectionRefreshMutex = new Map();
const onPersistStore = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function runWithOnPersist(onPersist, fn) {
    if (!onPersist) return fn();
    return onPersistStore.run(onPersist, fn);
}
function getActiveOnPersist() {
    return onPersistStore.getStore();
}
async function refreshAccessToken(provider, refreshToken, credentials, log, proxyConfig = null) {
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider];
    const refreshEndpoint = config?.refreshUrl || config?.tokenUrl;
    if (!config || !refreshEndpoint) {
        log?.warn?.("TOKEN_REFRESH", `No refresh endpoint configured for provider: ${provider}`);
        return null;
    }
    if (!refreshToken) {
        log?.warn?.("TOKEN_REFRESH", `No refresh token available for provider: ${provider}`);
        return null;
    }
    try {
        const params = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken
        });
        if (config.clientId) params.set("client_id", config.clientId);
        if (config.clientSecret) params.set("client_secret", config.clientSecret);
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(refreshEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                body: params
            }));
        if (!response.ok) {
            const errorText = await response.text();
            log?.error?.("TOKEN_REFRESH", `Failed to refresh token for ${provider}`, {
                status: response.status,
                error: errorText
            });
            const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
            if (code === "invalid_grant" || code === "invalid_request") {
                return {
                    error: "unrecoverable_refresh_error",
                    code
                };
            }
            return null;
        }
        const tokens = await response.json();
        log?.info?.("TOKEN_REFRESH", `Successfully refreshed token for ${provider}`, {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in
        });
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || refreshToken,
            expiresIn: tokens.expires_in
        };
    } catch (error) {
        log?.error?.("TOKEN_REFRESH", `Error refreshing token for ${provider}`, {
            error: error.message
        });
        return null;
    }
}
/**
 * Get access token for a specific provider (internal, does the actual work)
 */ async function _getAccessTokenInternal(provider, credentials, log, proxyConfig = null) {
    switch(provider){
        case "gemini-cli":
            {
                // Deprecated (see DEPRECATED_PROVIDERS). This used to refresh successfully against
                // PROVIDERS.gemini's client, but the provider is not routable, so the fresh token
                // had nowhere to go — periodic upstream calls maintaining an unusable credential.
                //
                // Return the ESTABLISHED unrecoverable contract, so every existing caller
                // (isUnrecoverableRefreshError, the manual-refresh route) already stops retrying —
                // but with a code that says WHY and a target to migrate to. A bare `null` here would
                // read as a transient failure and be retried forever.
                const notice = DEPRECATED_PROVIDERS[provider];
                log?.warn?.("TOKEN_REFRESH", `${provider} is deprecated — not refreshing; migrate this account to ${notice.migrateTo}`);
                return {
                    error: "unrecoverable_refresh_error",
                    code: "provider_deprecated",
                    migrateTo: notice.migrateTo,
                    reason: notice.reason
                };
            }
        case "gemini":
        case "antigravity":
        case "agy":
            {
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGoogleToken"])(credentials.refreshToken, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider].clientId, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider].clientSecret, log, proxyConfig);
                // Google One AI accounts get no projectId at OAuth exchange time.
                // Recover it via loadCodeAssist so downstream routing works.
                if (result?.accessToken && (provider === "antigravity" || provider === "agy") && !(credentials.projectId || credentials.providerSpecificData?.projectId)) {
                    try {
                        const discovered = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureAntigravityProjectAssigned"])(result.accessToken, fetch);
                        if (discovered) {
                            result.projectId = discovered;
                            result.providerSpecificData = {
                                ...credentials.providerSpecificData || {},
                                ...result.providerSpecificData || {},
                                projectId: discovered
                            };
                            if (credentials.connectionId) {
                                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistDiscoveredAntigravityProjectId"])(credentials.connectionId, discovered, credentials.providerSpecificData);
                            }
                            log?.info?.("TOKEN", "Antigravity projectId discovered during token refresh", {
                                projectId: discovered
                            });
                        }
                    } catch (discoveryError) {
                        const msg = discoveryError instanceof Error ? discoveryError.message : String(discoveryError);
                        log?.warn?.("TOKEN", `Antigravity projectId discovery failed: ${msg}`);
                    }
                }
                return result;
            }
        case "claude":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshClaudeOAuthToken"])(credentials.refreshToken, log, proxyConfig);
        case "codex":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshCodexToken"])(credentials.refreshToken, log, proxyConfig);
        case "qoder":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshQoderToken"])(credentials.refreshToken, log, proxyConfig);
        case "github":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGitHubToken"])(credentials.refreshToken, log, proxyConfig);
        case "kiro":
        case "amazon-q":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshKiroToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "cline":
        case "clinepass":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshClineToken"])(credentials.refreshToken, log, proxyConfig);
        case "kimi-coding":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshKimiCodingToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "gitlab-duo":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGitLabDuoToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "windsurf":
        case "devin-cli":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshWindsurfToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "codebuddy-cn":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshCodebuddyCnToken"])(credentials.refreshToken, log, proxyConfig);
        default:
            // Fallback to generic OAuth refresh for unknown providers
            return refreshAccessToken(provider, credentials.refreshToken, credentials, log, proxyConfig);
    }
}
function supportsTokenRefresh(provider) {
    const explicitlySupported = new Set([
        "gemini",
        "antigravity",
        "agy",
        "claude",
        "codex",
        "qoder",
        "github",
        "kiro",
        "amazon-q",
        "cline",
        "kimi-coding",
        "windsurf",
        // #8407: do NOT list "devin-cli" here. It is import-token / local-CLI owned
        // (`devin auth login`); connections never carry a refresh token. Leaving it
        // in this set made tokenHealthCheck treat it as refresh-capable and force
        // testStatus="expired" / errorCode="no_refresh_token". Keep it out of the
        // explicit set (same idea as not listing non-refresh local-CLI providers).
        "gitlab-duo",
        "codebuddy-cn"
    ]);
    if (explicitlySupported.has(provider)) return true;
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider];
    return !!(config?.refreshUrl || config?.tokenUrl);
}
async function getAccessToken(provider, credentials, log, proxyConfig = null, onPersist) {
    if (!credentials || !credentials.refreshToken || typeof credentials.refreshToken !== "string") {
        log?.warn?.("TOKEN_REFRESH", `No valid refresh token available for provider: ${provider}`);
        return null;
    }
    // If the caller did not pass onPersist explicitly, fall back to the active
    // AsyncLocalStorage store. This lets `runWithOnPersist(persistFn, () =>
    // executor.refreshCredentials(creds, log))` plumb the persist callback through
    // executors (e.g. CodexExecutor) without modifying their signature.
    const effectiveOnPersist = onPersist ?? getActiveOnPersist();
    const connectionId = credentials.connectionId;
    // ── Layer 1: per-connection mutex ──────────────────────────────────────────
    if (connectionId && typeof connectionId === "string") {
        const existing = connectionRefreshMutex.get(connectionId);
        if (existing) {
            existing.waiters++;
            log?.info?.("TOKEN_REFRESH", "Concurrent refresh detected — sharing in-flight refresh", {
                provider,
                connectionId,
                waiters: existing.waiters
            });
            return existing.promise;
        }
        const entry = {
            promise: null,
            waiters: 0
        };
        entry.promise = (async ()=>{
            const result = await _getAccessTokenWithStalenessCheck(provider, credentials, log, proxyConfig);
            // Invoke onPersist INSIDE the mutex so [network call + DB write] are one atomic step.
            // This prevents a concurrent waiter from reading stale credentials before the DB is updated.
            if (result?.accessToken && effectiveOnPersist) {
                // #4038: skip the persist if a concurrent writer already rotated this row past the
                // refresh_token we presented (compare-and-swap) — overwriting would revert it.
                if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["casGuardShouldSkipPersist"])(log)) {
                    return result;
                }
                try {
                    await effectiveOnPersist(result);
                } catch (persistErr) {
                    const { sanitizeErrorMessage } = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [app-route] (ecmascript, async loader)");
                    log?.error?.("TOKEN_REFRESH", `onPersist callback failed for ${provider}/${connectionId}: ${sanitizeErrorMessage(persistErr instanceof Error ? persistErr : new Error(String(persistErr)))}`);
                    throw persistErr;
                }
            }
            return result;
        })().finally(()=>{
            connectionRefreshMutex.delete(connectionId);
        });
        connectionRefreshMutex.set(connectionId, entry);
        return entry.promise;
    }
    // ── Layer 2: token-hash fallback (no connectionId) ─────────────────────────
    const cacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRefreshCacheKey"])(provider, credentials.refreshToken);
    if (refreshPromiseCache.has(cacheKey)) {
        log?.info?.("TOKEN_REFRESH", `Reusing in-flight refresh for ${provider}`);
        return refreshPromiseCache.get(cacheKey);
    }
    // Layer 2 has no per-connection mutex, so callers that pass an onPersist
    // callback expect it to fire after a successful refresh. Without this hook
    // the legacy `connectionId`-less path would silently swallow the callback,
    // leaving DB rows out of sync with rotated tokens (Codex/OpenAI). We still
    // resolve the promise to all waiters with the refreshed credentials.
    const refreshPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializeRefresh"])(provider, ()=>_getAccessTokenInternal(provider, credentials, log, proxyConfig)).then(async (result)=>{
        if (result?.accessToken && effectiveOnPersist) {
            // #4038: same compare-and-swap guard as Layer 1 — skip the persist if a concurrent
            // writer already rotated this row past the refresh_token we presented.
            if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["casGuardShouldSkipPersist"])(log)) {
                return result;
            }
            try {
                await effectiveOnPersist(result);
            } catch (persistErr) {
                const { sanitizeErrorMessage } = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [app-route] (ecmascript, async loader)");
                log?.error?.("TOKEN_REFRESH", `Layer 2 onPersist callback failed for ${provider}: ${sanitizeErrorMessage(persistErr instanceof Error ? persistErr : new Error(String(persistErr)))}`);
                throw persistErr;
            }
        } else if (result?.accessToken && !effectiveOnPersist) {
            log?.warn?.("TOKEN_REFRESH", `Layer 2 refresh succeeded for ${provider} without onPersist — DB row will not be updated with rotated token. Callers should pass connectionId for Layer 1 atomicity.`);
        }
        return result;
    }).finally(()=>{
        refreshPromiseCache.delete(cacheKey);
    });
    refreshPromiseCache.set(cacheKey, refreshPromise);
    return refreshPromise;
}
/**
 * Internal helper: performs the DB staleness check then calls the actual refresh.
 * Only called from the per-connection mutex path (Layer 1 above).
 */ async function _getAccessTokenWithStalenessCheck(provider, credentials, log, proxyConfig) {
    // ROTATION MAP CHECK (codex-multi-auth pattern): if this refresh_token was
    // rotated very recently (within ROTATION_MAP_TTL_MS), reuse the cached new
    // tokens INSTEAD of hitting upstream. Auth0 treats re-use of a rotated token
    // as a security event and revokes the entire token family — fatal for
    // multi-account Codex setups. The in-memory rotation map catches this even
    // when the caller bypasses the DB staleness path (no connectionId, stale
    // in-memory credentials in retries, etc.).
    const rotated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lookupRotation"])(provider, credentials.refreshToken);
    if (rotated) {
        log?.info?.("TOKEN_REFRESH", `Rotation map hit for ${provider}. Returning cached rotated tokens (avoids family-revoke).`);
        return rotated.result;
    }
    // RACE CONDITION PREVENTION:
    // If the credentials object in memory is stale (e.g. it waited in a semaphore while another
    // request refreshed the token), using its OLD refreshToken will cause the provider (e.g. OpenAI)
    // to reject it with 'refresh_token_reused' and revoke the new token family.
    // We MUST check if the DB has a newer token before proceeding with a network refresh.
    if (credentials.connectionId) {
        try {
            const { getProviderConnectionById } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [app-route] (ecmascript, async loader)");
            const dbConnection = await getProviderConnectionById(credentials.connectionId);
            if (dbConnection && dbConnection.refreshToken) {
                const now = Date.now();
                const dbExpiresAt = dbConnection.expiresAt ? new Date(dbConnection.expiresAt).getTime() : 0;
                if (dbConnection.refreshToken !== credentials.refreshToken) {
                    log?.info?.("TOKEN_REFRESH", `Stale token detected in memory for ${provider}. Using refreshed token from DB.`);
                    // If the DB token is not expired, we can just return it!
                    if (dbExpiresAt > now + 60000) {
                        // 60 seconds buffer
                        log?.info?.("TOKEN_REFRESH", `DB token is still valid. Skipping OAuth refresh.`);
                        return {
                            accessToken: dbConnection.accessToken,
                            refreshToken: dbConnection.refreshToken,
                            // Return absolute expiresAt so downstream callers do NOT recompute lifetime
                            // from a relative expiresIn value (which would incorrectly extend the TTL).
                            // expiresIn intentionally omitted here.
                            expiresAt: dbConnection.expiresAt
                        };
                    } else {
                        // DB token is also expired, but it's the NEWEST one. We must use it to refresh.
                        credentials.refreshToken = dbConnection.refreshToken;
                        credentials.accessToken = dbConnection.accessToken;
                    }
                }
            // NOTE: Fix F (skip when DB == memory and DB > now+60s) was intentionally
            // removed. The caller (checkAndRefreshToken) already decided to refresh
            // because the token is within TOKEN_EXPIRY_BUFFER_MS of expiry. Re-checking
            // with a tighter 60-second window here would skip legitimate refreshes and
            // let near-expired tokens hit the upstream. Layer-1 mutex (per-connection)
            // and Layer-2 dedup (token-hash) already prevent concurrent refreshes for
            // the import-burst scenario.
            }
        } catch (e) {
            log?.warn?.("TOKEN_REFRESH", `Failed to check DB for stale token: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    const oldRefreshToken = credentials.refreshToken;
    // Front 1: serialize the network refresh across all connections of the same
    // rotation group (e.g. Codex+openai share one Auth0 client) so two sibling
    // accounts never refresh concurrently and trip Auth0 family revocation.
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serializeRefresh"])(provider, ()=>_getAccessTokenInternal(provider, credentials, log, proxyConfig));
    // Record the rotation so subsequent stale callers can be redirected to the
    // new tokens without re-hitting upstream (which would trigger Auth0 family
    // revocation). Only records when the refresh actually rotated the token.
    if (result && typeof result === "object" && !("error" in result) && result.accessToken && result.refreshToken) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordRotation"])(provider, oldRefreshToken, result);
    }
    return result;
}
const refreshTokenByProvider = getAccessToken;
function formatProviderCredentials(provider, credentials, log) {
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider];
    if (!config) {
        log?.warn?.("TOKEN_REFRESH", `No configuration found for provider: ${provider}`);
        return null;
    }
    switch(provider){
        case "gemini":
            return {
                apiKey: credentials.apiKey,
                accessToken: credentials.accessToken,
                projectId: credentials.projectId
            };
        case "claude":
            return {
                apiKey: credentials.apiKey,
                accessToken: credentials.accessToken
            };
        case "codex":
        case "qoder":
        case "openai":
        case "openrouter":
            return {
                apiKey: credentials.apiKey,
                accessToken: credentials.accessToken
            };
        case "antigravity":
        case "agy":
            return {
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken
            };
        default:
            return {
                apiKey: credentials.apiKey,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken
            };
    }
}
async function getAllAccessTokens(userInfo, log) {
    const results = {};
    if (userInfo.connections && Array.isArray(userInfo.connections)) {
        for (const connection of userInfo.connections){
            if (connection.isActive && connection.provider) {
                const token = await getAccessToken(connection.provider, {
                    refreshToken: connection.refreshToken
                }, log);
                if (token) {
                    results[connection.provider] = token;
                }
            }
        }
    }
    return results;
}
function getConnectionRefreshMutexStatus() {
    const result = {};
    for (const [connectionId, entry] of connectionRefreshMutex.entries()){
        result[connectionId] = {
            waiters: entry.waiters
        };
    }
    return result;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/open-sse/config/providerErrorRules.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider-specific error rules.
 *
 * Different providers expose different quota signals:
 *   - Opencode: account-wide quota. A 429 with `x-ratelimit-remaining-requests: 0`
 *     means the whole organization is out — we must lock the connection, not
 *     a specific model, so the combo router falls back to a different provider.
 *   - Minimax: per-model quota. A 429 with `x-model-quota-remaining: <model>=0`
 *     means only that model is locked — the rest of the connection stays healthy.
 *
 * New providers register a `ProviderErrorRule[]` in `providerRuleRegistry`. Rules
 * are evaluated BEFORE the global ERROR_RULES in classifyError. If no rule
 * matches, behavior falls through to the existing global text/status rules.
 *
 * Adding a new provider = create one ProviderErrorRule[] and register it below.
 * No changes to classifyError, lockModel, or updateProviderConnection needed.
 */ __turbopack_context__.s([
    "getProviderErrorRuleMatch",
    ()=>getProviderErrorRuleMatch,
    "parseResetCountdownMs",
    ()=>parseResetCountdownMs,
    "providerRuleRegistry",
    ()=>providerRuleRegistry
]);
// ─── Opencode ───────────────────────────────────────────────────────────────────
// Opencode Go uses an account-wide quota. The body usually says "rate limit
// reached" but the presence of `x-ratelimit-remaining-requests: 0` is the
// tell. Without this rule, an exhausted org quota would be classified as
// RATE_LIMIT_EXCEEDED (~5s cooldown), causing the combo to keep retrying
// every model on the same provider until the 5h window resets.
//
// Scope note: `scope: "connection"` (not "provider") is correct because the
// upstream quota is per-account, and a single OmniRoute provider entry maps to
// one user account. Multiple OmniRoute connections under the same provider
// name mean the user has multiple upstream accounts — locking at the provider
// level would disable every one of them when only one is exhausted. See
// Issue #2 (Monthly quota exhausted treated as transient 429).
function buildOpencodeRules() {
    return [
        {
            id: "opencode-monthly-quota-resets-in",
            match: ({ status, body })=>{
                if (status !== 429) return null;
                // The exact body envelope we observe in the wild:
                //   "[429] Monthly usage limit reached. Resets in 13 days. To continue
                //    using this model now, enable usage from your available balance: ..."
                // Also covers the headers-less case where only the body carries the
                // reset hint (the opencode-quota-exhausted-headers rule above requires
                // headers, but the upstream sometimes omits them).
                const text = JSON.stringify(body ?? "").toLowerCase();
                if (!text.includes("monthly usage limit reached")) return null;
                const cooldownMs = parseResetCountdownMs(text);
                if (cooldownMs === null) return null;
                return {
                    reason: "quota_exhausted",
                    scope: "connection",
                    cooldownMs
                };
            }
        },
        {
            id: "opencode-quota-exhausted-headers",
            match: ({ status, headers })=>{
                if (status !== 429) return null;
                const remainingRequests = headers["x-ratelimit-remaining-requests"];
                if (remainingRequests === "0") {
                    return {
                        reason: "quota_exhausted",
                        scope: "connection"
                    };
                }
                const remainingTokens = headers["x-ratelimit-remaining-tokens"];
                if (remainingTokens === "0") {
                    return {
                        reason: "quota_exhausted",
                        scope: "connection"
                    };
                }
                return null;
            }
        },
        {
            id: "opencode-quota-exhausted-body",
            match: ({ status, body })=>{
                if (status !== 429) return null;
                const text = JSON.stringify(body ?? "").toLowerCase();
                if (text.includes("organization_quota_exceeded") || text.includes("account_quota_exceeded") || text.includes("plan_limit_reached")) {
                    return {
                        reason: "quota_exhausted",
                        scope: "connection"
                    };
                }
                return null;
            }
        }
    ];
}
// ─── Minimax ────────────────────────────────────────────────────────────────
// Minimax returns per-model quota info via custom headers. The body is generic
// "rate limit exceeded" so we MUST read the headers. Other models on the same
// connection stay healthy; only the named model gets locked.
function buildMinimaxRules() {
    return [
        {
            id: "minimax-per-model-quota",
            match: ({ status, headers })=>{
                if (status !== 429) return null;
                // Header pattern: "x-model-quota-remaining: haiku=0,sonnet=42,opus=100"
                const headerVal = headers["x-model-quota-remaining"];
                if (!headerVal) return null;
                // If any model reports 0 remaining, the request was rejected for that
                // model. We classify as quota_exhausted so lockModel is called with
                // scope=model instead of poisoning the whole connection.
                const exhausted = headerVal.split(",").some((pair)=>pair.split("=")[1]?.trim() === "0");
                if (exhausted) {
                    return {
                        reason: "quota_exhausted",
                        scope: "model"
                    };
                }
                return null;
            }
        }
    ];
}
// ─── Cloudflare Workers AI ─────────────────────────────────────────────────────
// Free tier = 10,000 Neurons/day, shared across the WHOLE account
// (docs/reference/FREE_TIERS.md; official: developers.cloudflare.com/
// workers-ai/platform/errors/). The exhaustion body doesn't match any
// QUOTA_PATTERNS keyword so it falls through to rate_limit and gets
// retried every ~60s against a budget that only resets at UTC midnight.
// Issue #6980.
function buildCloudflareAiRules() {
    return [
        {
            id: "cloudflare-ai-daily-neuron-allocation",
            match: ({ status, body })=>{
                if (status !== 429) return null;
                const text = JSON.stringify(body ?? "").toLowerCase();
                // Body: "you have used up your daily free allocation of 10,000 neurons,
                //        please upgrade to Cloudflare's Workers Paid plan..."
                if (!text.includes("daily free allocation")) return null;
                // No cooldownMs: recordModelLockoutFailure already sets
                // quota_exhausted without one to "next UTC midnight".
                return {
                    reason: "quota_exhausted",
                    scope: "connection"
                };
            }
        }
    ];
}
// ─── OpenRouter ─────────────────────────────────────────────────────────────
// #6842: OpenRouter returns 402 for both a negative account balance and a
// depleted per-key credit cap. The global `status_402` rule already maps this
// to `quota_exhausted` with a zero cooldown (immediate fallback to the next
// connection), but leaves the scope ambiguous and doesn't stop the SAME
// connection from being reselected instantly (credits genuinely need a
// top-up, not a timed wait). This explicit rule locks the whole connection
// (scope: "connection" — credits are account-wide, not per-model) for a real
// cooldown so combo routing skips it instead of hot-looping back onto it.
function buildOpenrouterRules() {
    return [
        {
            id: "openrouter-credit-exhausted-402",
            match: ({ status })=>{
                if (status !== 402) return null;
                return {
                    reason: "quota_exhausted",
                    scope: "connection",
                    cooldownMs: 2 * 60 * 1000
                };
            }
        }
    ];
}
const providerRuleRegistry = new Map([
    [
        "opencode",
        buildOpencodeRules()
    ],
    [
        "opencode-go",
        buildOpencodeRules()
    ],
    [
        "opencode-cli",
        buildOpencodeRules()
    ],
    [
        "minimax",
        buildMinimaxRules()
    ],
    [
        "minimax-passthrough",
        buildMinimaxRules()
    ],
    [
        "cloudflare-ai",
        buildCloudflareAiRules()
    ],
    [
        "openrouter",
        buildOpenrouterRules()
    ]
]);
function getProviderErrorRuleMatch(provider, status, headers, body) {
    if (!provider) return null;
    const rules = providerRuleRegistry.get(provider.toLowerCase());
    if (!rules) return null;
    // Normalize headers: accept either a `Headers` object (from `fetch()`) or
    // a plain record. Provider rules access headers via plain object indexing.
    const safeHeaders = !headers ? {} : typeof headers.get === "function" ? Object.fromEntries(headers.entries()) : Object.fromEntries(Object.entries(headers).map(([key, value])=>[
            key.toLowerCase(),
            value
        ]));
    for (const rule of rules){
        const match = rule.match({
            status,
            headers: safeHeaders,
            body
        });
        if (match) return match;
    }
    return null;
}
function parseResetCountdownMs(text) {
    if (typeof text !== "string" || text.length === 0) return null;
    const match = text.match(/resets?\s+in\s+(\d+)\s+(day|days|hour|hours|minute|minutes|second|seconds)\b/);
    if (!match) return null;
    const n = Number(match[1]);
    if (!Number.isFinite(n) || n <= 0) return null;
    const unit = match[2];
    switch(unit){
        case "day":
        case "days":
            return n * 86_400_000;
        case "hour":
        case "hours":
            return n * 3_600_000;
        case "minute":
        case "minutes":
            return n * 60_000;
        case "second":
        case "seconds":
            return n * 1_000;
        default:
            return null;
    }
}
}),
"[project]/open-sse/services/rotationConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classForStatus",
    ()=>classForStatus,
    "clearRotationErrorCounters",
    ()=>clearRotationErrorCounters,
    "evaluateRotationGate",
    ()=>evaluateRotationGate,
    "extractRotationContext",
    ()=>extractRotationContext,
    "gateFor",
    ()=>gateFor,
    "getGlobalRotationConfig",
    ()=>getGlobalRotationConfig,
    "isFallbackBlockedForStatus",
    ()=>isFallbackBlockedForStatus,
    "overrideFor",
    ()=>overrideFor,
    "rateLimitCooldownOverrideMs",
    ()=>rateLimitCooldownOverrideMs,
    "recordErrorAndCheckThreshold",
    ()=>recordErrorAndCheckThreshold,
    "resetGlobalRotationConfigForTest",
    ()=>resetGlobalRotationConfigForTest,
    "resolveRotationConfig",
    ()=>resolveRotationConfig,
    "rotationRateLimitFallback",
    ()=>rotationRateLimitFallback,
    "shouldForceFallbackFor400",
    ()=>shouldForceFallbackFor400
]);
/**
 * Runtime rotation configuration.
 *
 * OmniRoute's account-fallback engine (accountFallback.ts) historically rotated accounts using
 * only hardcoded constants (COOLDOWN_MS / BACKOFF_CONFIG / ERROR_RULES): every retryable error
 * cooled the account down immediately, on a fixed exponential backoff, with no operator control.
 *
 * A front-end/orchestrator (e.g. the VibeProxy desktop app) that manages the SAME set of accounts
 * needs the backend to rotate according to the operator's own rules. This module exposes those
 * rules as a runtime config, sourced from environment variables (so a supervising process can set
 * them per launch) with an optional per-connection override (read from a connection's
 * `providerSpecificData.rotationOverrides`).
 *
 * Config surface (all optional — defaults preserve the pre-existing engine behavior):
 *   - master enable                            OMNIROUTE_ROTATION_ENABLED               (default true)
 *   - rate-limit reset/cooldown seconds        OMNIROUTE_ROTATION_RATE_LIMIT_RESET_SECONDS (0 => engine default)
 *   - per-status fallback enable               OMNIROUTE_ROTATE_ON_{429,500,502,400}    (429/500/502 default true, 400 default false)
 *   - per-status threshold (errors in window)  OMNIROUTE_ROTATE_{status}_THRESHOLD      (default 1 => immediate, current behavior)
 *   - per-status window seconds                OMNIROUTE_ROTATE_{status}_WINDOW_SECONDS (default 120)
 *
 * Everything here is a pure function or a small in-memory sliding-window counter — no DB / IO on
 * the hot path — so it is cheap to consult per request and trivially unit-testable.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [app-route] (ecmascript)");
;
;
const GLOBAL_KEY = "__omniroute_rotation_config__";
const DEFAULT_WINDOW_MS = 120_000;
function envBool(name, dflt) {
    const raw = process.env[name];
    if (raw === undefined || raw === null || raw === "") return dflt;
    const v = raw.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
    if (v === "false" || v === "0" || v === "no" || v === "off") return false;
    return dflt;
}
function envInt(name, dflt, min = 0) {
    const raw = process.env[name];
    if (raw === undefined || raw === null || raw === "") return dflt;
    const n = Number.parseInt(raw.trim(), 10);
    if (!Number.isFinite(n)) return dflt;
    return Math.max(min, n);
}
function buildClass(enableEnv, thresholdEnv, windowEnv, enableDefault) {
    return {
        enabled: envBool(enableEnv, enableDefault),
        threshold: envInt(thresholdEnv, 1, 1),
        windowMs: envInt(windowEnv, DEFAULT_WINDOW_MS / 1000, 1) * 1000
    };
}
function buildFromEnv() {
    return {
        enabled: envBool("OMNIROUTE_ROTATION_ENABLED", true),
        rateLimitResetMs: envInt("OMNIROUTE_ROTATION_RATE_LIMIT_RESET_SECONDS", 0, 0) * 1000,
        disableTagWithoutReset: envBool("OMNIROUTE_ROTATION_DISABLE_TAG_WITHOUT_RESET", true),
        rateLimit429: buildClass("OMNIROUTE_ROTATE_ON_429", "OMNIROUTE_ROTATE_429_THRESHOLD", "OMNIROUTE_ROTATE_429_WINDOW_SECONDS", true),
        serverError500: buildClass("OMNIROUTE_ROTATE_ON_500", "OMNIROUTE_ROTATE_500_THRESHOLD", "OMNIROUTE_ROTATE_500_WINDOW_SECONDS", true),
        badGateway502: buildClass("OMNIROUTE_ROTATE_ON_502", "OMNIROUTE_ROTATE_502_THRESHOLD", "OMNIROUTE_ROTATE_502_WINDOW_SECONDS", true),
        badRequest400: buildClass("OMNIROUTE_ROTATE_ON_400", "OMNIROUTE_ROTATE_400_THRESHOLD", "OMNIROUTE_ROTATE_400_WINDOW_SECONDS", false)
    };
}
function getGlobalRotationConfig() {
    const g = globalThis;
    let cfg = g[GLOBAL_KEY];
    if (!cfg) {
        cfg = buildFromEnv();
        g[GLOBAL_KEY] = cfg;
    }
    return cfg;
}
function resetGlobalRotationConfigForTest() {
    const g = globalThis;
    delete g[GLOBAL_KEY];
    clearRotationErrorCounters();
}
function coerceBool(v, dflt) {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return envBoolFromString(v, dflt);
    return dflt;
}
function envBoolFromString(v, dflt) {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
    if (s === "false" || s === "0" || s === "no" || s === "off") return false;
    return dflt;
}
function coerceInt(v, dflt, min = 0) {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseInt(v, 10) : NaN;
    if (!Number.isFinite(n)) return dflt;
    return Math.max(min, Math.floor(n));
}
function resolveRotationConfig(overrides) {
    const base = getGlobalRotationConfig();
    if (!overrides || typeof overrides !== "object") return base;
    const cls = (src, enableKey, thrKey, winKey)=>({
            enabled: enableKey in overrides ? coerceBool(overrides[enableKey], src.enabled) : src.enabled,
            threshold: thrKey in overrides ? coerceInt(overrides[thrKey], src.threshold, 1) : src.threshold,
            windowMs: winKey in overrides ? coerceInt(overrides[winKey], src.windowMs / 1000, 1) * 1000 : src.windowMs
        });
    return {
        enabled: base.enabled,
        rateLimitResetMs: "rateLimitResetSeconds" in overrides ? coerceInt(overrides.rateLimitResetSeconds, base.rateLimitResetMs / 1000, 0) * 1000 : base.rateLimitResetMs,
        disableTagWithoutReset: base.disableTagWithoutReset,
        rateLimit429: cls(base.rateLimit429, "rotateOn429", "error429Threshold", "error429WindowSeconds"),
        serverError500: cls(base.serverError500, "rotateOn500", "error500Threshold", "error500WindowSeconds"),
        badGateway502: cls(base.badGateway502, "rotateOn502", "error502Threshold", "error502WindowSeconds"),
        badRequest400: cls(base.badRequest400, "rotateOn400", "error400Threshold", "error400WindowSeconds")
    };
}
function classForStatus(status, cfg) {
    if (status === 429) return cfg.rateLimit429;
    if (status === 502) return cfg.badGateway502;
    if (status >= 500 && status < 600) return cfg.serverError500;
    if (status === 400) return cfg.badRequest400;
    return null; // 401/402/403/404/… are not gated by this config
}
function isFallbackBlockedForStatus(status, cfg) {
    const c = classForStatus(status, cfg);
    if (c === null) return false; // ungated statuses: engine default
    if (c === cfg.badRequest400) return false; // 400 is additive, never restrictively blocked
    if (!cfg.enabled) return true; // master off blocks the gated 429/500/502 classes
    return !c.enabled; // per-class disable
}
function shouldForceFallbackFor400(status, cfg) {
    return status === 400 && cfg.enabled && cfg.badRequest400.enabled;
}
function rateLimitCooldownOverrideMs(cfg) {
    return cfg.rateLimitResetMs > 0 ? cfg.rateLimitResetMs : null;
}
// ── Sliding-window per-key error counter (for threshold-based fallback) ──────────────────────
const COUNTER_KEY = "__omniroute_rotation_counters__";
function counters() {
    const g = globalThis;
    let m = g[COUNTER_KEY];
    if (!m) {
        m = new Map();
        g[COUNTER_KEY] = m;
    }
    return m;
}
function clearRotationErrorCounters() {
    counters().clear();
}
function recordErrorAndCheckThreshold(key, status, cfg, nowMs = Date.now()) {
    const cls = classForStatus(status, cfg);
    if (cls === null) return true; // not gated => defer to engine (treat as immediate)
    if (cls.threshold <= 1) return true; // immediate rotation (historical behavior)
    const bucketKey = `${key}::${status}`;
    const list = counters().get(bucketKey) ?? [];
    const windowStart = nowMs - cls.windowMs;
    const pruned = list.filter((ts)=>ts >= windowStart);
    pruned.push(nowMs);
    counters().set(bucketKey, pruned);
    if (pruned.length >= cls.threshold) {
        counters().delete(bucketKey); // reset after reaching the threshold
        return true;
    }
    return false;
}
function evaluateRotationGate(status, rotationCfg, rotationKey) {
    if (isFallbackBlockedForStatus(status, rotationCfg)) {
        return {
            shouldFallback: false,
            cooldownMs: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (rotationKey && classForStatus(status, rotationCfg) && !recordErrorAndCheckThreshold(rotationKey, status, rotationCfg)) {
        return {
            shouldFallback: false,
            cooldownMs: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (shouldForceFallbackFor400(status, rotationCfg)) {
        const overrideMs = rateLimitCooldownOverrideMs(rotationCfg);
        const cooldownMs = overrideMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].rateLimit;
        return {
            shouldFallback: true,
            cooldownMs,
            baseCooldownMs: cooldownMs,
            newBackoffLevel: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
        };
    }
    return null;
}
function rotationRateLimitFallback(reason, rotationCfg) {
    if (reason !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED) return null;
    const overrideMs = rateLimitCooldownOverrideMs(rotationCfg);
    if (overrideMs === null) return null;
    return {
        shouldFallback: true,
        cooldownMs: overrideMs,
        baseCooldownMs: overrideMs,
        newBackoffLevel: 0,
        usedUpstreamRetryHint: false,
        reason
    };
}
function gateFor(status, account) {
    const { rotationOverrides, rotationKey } = extractRotationContext(account);
    return evaluateRotationGate(status, resolveRotationConfig(rotationOverrides), rotationKey);
}
function overrideFor(reason, account) {
    const { rotationOverrides } = extractRotationContext(account);
    return rotationRateLimitFallback(reason, resolveRotationConfig(rotationOverrides));
}
function extractRotationContext(account) {
    const rec = account && typeof account === "object" ? account : null;
    const psd = rec ? rec["providerSpecificData"] : undefined;
    const rotationOverrides = psd && typeof psd === "object" && psd.rotationOverrides && typeof psd.rotationOverrides === "object" ? psd.rotationOverrides : null;
    const id = rec ? rec["id"] : undefined;
    const rotationKey = typeof id === "string" && id.length > 0 ? id : null;
    return {
        rotationOverrides,
        rotationKey
    };
}
}),
"[project]/src/lib/resilience/settings/normalize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "normalizeComboCooldownWaitSettings",
    ()=>normalizeComboCooldownWaitSettings,
    "normalizeConnectionCooldownProfile",
    ()=>normalizeConnectionCooldownProfile,
    "normalizeLegacyConnectionCooldownProfile",
    ()=>normalizeLegacyConnectionCooldownProfile,
    "normalizeProviderBreakerProfile",
    ()=>normalizeProviderBreakerProfile,
    "normalizeProviderCooldownSettings",
    ()=>normalizeProviderCooldownSettings,
    "normalizeProviderQuotaOverrides",
    ()=>normalizeProviderQuotaOverrides,
    "normalizeProviderWindowDefaults",
    ()=>normalizeProviderWindowDefaults,
    "normalizeQuotaPreflightSettings",
    ()=>normalizeQuotaPreflightSettings,
    "normalizeQuotaShareConcurrencyLimitSettings",
    ()=>normalizeQuotaShareConcurrencyLimitSettings,
    "normalizeRequestQueueSettings",
    ()=>normalizeRequestQueueSettings,
    "normalizeStreamRecoverySettings",
    ()=>normalizeStreamRecoverySettings,
    "normalizeWaitForCooldownSettings",
    ()=>normalizeWaitForCooldownSettings,
    "parseFeatureFlagBoolean",
    ()=>parseFeatureFlagBoolean,
    "resolveBooleanFeatureFlag",
    ()=>resolveBooleanFeatureFlag,
    "resolveStreamRecoveryDefaults",
    ()=>resolveStreamRecoveryDefaults,
    "toBoolean",
    ()=>toBoolean,
    "toInteger",
    ()=>toInteger
]);
/**
 * resilience/settings/normalize — coercion + per-section normalizers (pure).
 *
 * Extracted verbatim from resilience/settings.ts. Pure functions: no DB, no
 * module state. Depends only on the feature-flag resolver and the settings
 * types. The host imports these for its resolve/merge/legacy orchestration.
 *
 * @module lib/resilience/settings/normalize
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toInteger(value, fallback, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
}
function toBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
function parseFeatureFlagBoolean(value, fallback) {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
        return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
        return false;
    }
    return fallback;
}
function resolveBooleanFeatureFlag(key, fallback) {
    try {
        return parseFeatureFlagBoolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])(key), fallback);
    } catch (error) {
        const envValue = process.env[key];
        if (typeof envValue === "string" && envValue.trim() !== "") {
            return parseFeatureFlagBoolean(envValue, fallback);
        }
        console.error(`[resilience] Failed to resolve ${key}, falling back to ${String(fallback)}:`, error instanceof Error ? error.message : error);
        return fallback;
    }
}
function resolveStreamRecoveryDefaults() {
    return {
        enabled: resolveBooleanFeatureFlag("STREAM_RECOVERY_ENABLED", false),
        continueMidStream: resolveBooleanFeatureFlag("STREAM_RECOVERY_MIDSTREAM_ENABLED", false)
    };
}
function normalizeRequestQueueSettings(next, fallback) {
    const record = asRecord(next);
    const requestsPerMinute = toInteger(record.requestsPerMinute, fallback.requestsPerMinute, {
        min: 1,
        max: 1_000_000
    });
    const minTimeBetweenRequestsMs = toInteger(record.minTimeBetweenRequestsMs, fallback.minTimeBetweenRequestsMs, {
        min: 0,
        max: 60 * 60 * 1000
    });
    const concurrentRequests = toInteger(record.concurrentRequests, fallback.concurrentRequests, {
        min: 1,
        max: 10_000
    });
    const maxWaitMs = toInteger(record.maxWaitMs, fallback.maxWaitMs, {
        min: 1,
        max: 24 * 60 * 60 * 1000
    });
    const maxQueueDepth = toInteger(record.maxQueueDepth, fallback.maxQueueDepth, {
        min: 0,
        max: 100_000
    });
    return {
        autoEnableApiKeyProviders: toBoolean(record.autoEnableApiKeyProviders, fallback.autoEnableApiKeyProviders),
        requestsPerMinute,
        minTimeBetweenRequestsMs,
        concurrentRequests,
        maxWaitMs,
        maxQueueDepth
    };
}
function normalizeConnectionCooldownProfile(next, fallback) {
    const record = asRecord(next);
    // useUpstream429BreakerHints uses a 3-state input contract:
    //   - boolean  → user override, store as-is
    //   - null     → explicit unset sentinel, drop key so the per-provider
    //                default in `providerHints.ts` resolves at runtime
    //   - omitted  → leave existing fallback value unchanged (partial-merge)
    // Never coerce via `toBoolean(value, fallback)` because that would
    // collapse the unset state.
    const hasHintsKey = Object.prototype.hasOwnProperty.call(record, "useUpstream429BreakerHints");
    const rawHints = record.useUpstream429BreakerHints;
    let useUpstream429BreakerHints;
    if (!hasHintsKey) {
        useUpstream429BreakerHints = fallback.useUpstream429BreakerHints;
    } else if (rawHints === null) {
        useUpstream429BreakerHints = undefined;
    } else if (typeof rawHints === "boolean") {
        useUpstream429BreakerHints = rawHints;
    } else {
        useUpstream429BreakerHints = fallback.useUpstream429BreakerHints;
    }
    const out = {
        baseCooldownMs: toInteger(record.baseCooldownMs, fallback.baseCooldownMs, {
            min: 0,
            max: 24 * 60 * 60 * 1000
        }),
        useUpstreamRetryHints: toBoolean(record.useUpstreamRetryHints, fallback.useUpstreamRetryHints),
        maxBackoffSteps: toInteger(record.maxBackoffSteps, fallback.maxBackoffSteps, {
            min: 0,
            max: 32
        })
    };
    // Only attach the key when defined — preserves omission across round-trips.
    if (useUpstream429BreakerHints !== undefined) {
        out.useUpstream429BreakerHints = useUpstream429BreakerHints;
    }
    return out;
}
function normalizeLegacyConnectionCooldownProfile(next, fallback) {
    const record = asRecord(next);
    const transientCooldown = toInteger(record.transientCooldown, fallback.baseCooldownMs, {
        min: 0,
        max: 24 * 60 * 60 * 1000
    });
    const legacyRateLimitCooldown = toInteger(record.rateLimitCooldown, transientCooldown, {
        min: 0,
        max: 24 * 60 * 60 * 1000
    });
    const useUpstreamRetryHints = typeof record.rateLimitCooldown === "number" ? record.rateLimitCooldown === 0 : fallback.useUpstreamRetryHints;
    return {
        baseCooldownMs: useUpstreamRetryHints ? transientCooldown : Math.max(transientCooldown, legacyRateLimitCooldown),
        useUpstreamRetryHints,
        maxBackoffSteps: toInteger(record.maxBackoffLevel, fallback.maxBackoffSteps, {
            min: 0,
            max: 32
        })
    };
}
function normalizeProviderBreakerProfile(next, fallback) {
    const record = asRecord(next);
    const failureThreshold = toInteger(record.failureThreshold, fallback.failureThreshold, {
        min: 1,
        max: 1000
    });
    const degradationThreshold = Math.min(toInteger(record.degradationThreshold, fallback.degradationThreshold, {
        min: 1,
        max: 1000
    }), failureThreshold <= 1 ? 1 : failureThreshold - 1);
    return {
        failureThreshold,
        degradationThreshold,
        resetTimeoutMs: toInteger(record.resetTimeoutMs, fallback.resetTimeoutMs, {
            min: 1000,
            max: 24 * 60 * 60 * 1000
        })
    };
}
function normalizeProviderWindowDefaults(next, fallback) {
    // Accept either an explicit object or fall back. Drop providers/windows
    // whose values are not a valid 0-100 integer so a malformed setting can't
    // accidentally disable cutoffs entirely.
    const rawProviders = asRecord(next ?? fallback);
    const out = {};
    for (const [provider, windows] of Object.entries(rawProviders)){
        if (!provider || typeof windows !== "object" || windows === null) continue;
        const windowMap = {};
        for (const [windowName, percent] of Object.entries(windows)){
            if (!windowName) continue;
            const parsed = typeof percent === "number" ? percent : typeof percent === "string" && percent.trim() !== "" ? Number(percent) : NaN;
            if (Number.isFinite(parsed)) {
                const clamped = Math.min(100, Math.max(0, Math.trunc(parsed)));
                windowMap[windowName] = clamped;
            }
        }
        if (Object.keys(windowMap).length > 0) {
            out[provider] = windowMap;
        }
    }
    return out;
}
function normalizeQuotaPreflightSettings(next, fallback) {
    const record = asRecord(next);
    // Remaining-% semantics: cutoff is the lowest acceptable remaining %, warn
    // is the higher "you're getting close" remaining %. So warn MUST be greater
    // than cutoff — otherwise the warn log would only fire after the request
    // is already blocked.
    const defaultThresholdPercent = toInteger(record.defaultThresholdPercent, fallback.defaultThresholdPercent, {
        min: 0,
        max: 99
    });
    const warnRaw = toInteger(record.warnThresholdPercent, fallback.warnThresholdPercent, {
        min: 0,
        max: 100
    });
    const warnThresholdPercent = warnRaw <= defaultThresholdPercent ? Math.min(100, defaultThresholdPercent + 1) : warnRaw;
    const providerWindowDefaults = normalizeProviderWindowDefaults(record.providerWindowDefaults, fallback.providerWindowDefaults);
    const enabled = typeof record.enabled === "boolean" ? record.enabled : fallback.enabled;
    return {
        enabled,
        defaultThresholdPercent,
        warnThresholdPercent,
        providerWindowDefaults
    };
}
function normalizeWaitForCooldownSettings(next, fallback) {
    const record = asRecord(next);
    const maxRetryWaitSec = toInteger(record.maxRetryWaitSec, fallback.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const maxRetries = toInteger(record.maxRetries, fallback.maxRetries, {
        min: 0,
        max: 10
    });
    const maxRetryWaitMs = maxRetryWaitSec * 1000;
    // Cumulative cap across all waits for one request (#7360 follow-up) — mirrors
    // comboCooldownWait.budgetMs. Floored at maxRetryWaitMs so at least one wait
    // can always fire; ceiling matches the same 5-minute give-up point.
    const budgetMs = toInteger(record.budgetMs, fallback.budgetMs, {
        min: maxRetryWaitMs,
        max: 5 * 60 * 1000
    });
    const enabled = toBoolean(record.enabled, fallback.enabled) && maxRetries > 0 && maxRetryWaitSec > 0;
    return {
        enabled,
        maxRetries,
        maxRetryWaitSec,
        maxRetryWaitMs,
        budgetMs
    };
}
function normalizeComboCooldownWaitSettings(next, fallback) {
    const record = asRecord(next);
    // Hard ceiling of 5 minutes on a single wait (#7360 follow-up — raised from
    // 90s now that streaming clients get an immediate synthetic keep-alive
    // event via withEarlyStreamKeepalive, so a long wait no longer risks a
    // client-side first-byte timeout). This layer exists for transient cooldowns
    // (including Gemini-class TPM/RPM windows, which report ~60s retry-after
    // live); anything the upstream itself reports as longer than this should
    // fall through to the existing 429 crystallization (and the cross-request
    // cooldown layers).
    const maxWaitMs = toInteger(record.maxWaitMs, fallback.maxWaitMs, {
        min: 0,
        max: 300000
    });
    const maxAttempts = toInteger(record.maxAttempts, fallback.maxAttempts, {
        min: 0,
        max: 10
    });
    // Budget can never be smaller than a single wait, otherwise no wait could
    // ever fire; floor it at maxWaitMs.
    const budgetMs = toInteger(record.budgetMs, fallback.budgetMs, {
        min: maxWaitMs,
        max: 5 * 60 * 1000
    });
    const enabled = toBoolean(record.enabled, fallback.enabled) && maxWaitMs > 0 && maxAttempts > 0;
    return {
        enabled,
        maxWaitMs,
        maxAttempts,
        budgetMs
    };
}
function normalizeQuotaShareConcurrencyLimitSettings(next, fallback) {
    const record = asRecord(next);
    return {
        enabled: toBoolean(record.enabled, fallback.enabled)
    };
}
function normalizeProviderCooldownSettings(next, fallback) {
    const record = asRecord(next);
    const enabled = toBoolean(record.enabled, fallback.enabled);
    const minRetryCooldownMs = toInteger(record.minRetryCooldownMs, fallback.minRetryCooldownMs, {
        min: 0,
        max: 60 * 60 * 1000
    });
    const maxRetryCooldownMs = toInteger(record.maxRetryCooldownMs, fallback.maxRetryCooldownMs, {
        min: minRetryCooldownMs,
        max: 24 * 60 * 60 * 1000
    });
    return {
        enabled,
        minRetryCooldownMs,
        maxRetryCooldownMs
    };
}
function normalizeStreamRecoverySettings(next, fallback) {
    const record = asRecord(next);
    return {
        enabled: toBoolean(record.enabled, fallback.enabled),
        continueMidStream: toBoolean(record.continueMidStream, fallback.continueMidStream)
    };
}
// #6846 Phase 1: parse a single provider's { rpm?, concurrency? } override entry,
// dropping non-positive/non-finite fields so a malformed value falls back to that
// provider's static default rather than disabling its budget outright (0 would
// mean "no cap" for rpm, mirroring the resolveRpm/resolveMaxConcurrent convention
// elsewhere in this file).
function normalizeProviderQuotaOverrideEntry(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const record = raw;
    const out = {};
    const rpm = typeof record.rpm === "number" ? record.rpm : Number(record.rpm);
    if (Number.isFinite(rpm) && rpm > 0) out.rpm = Math.trunc(rpm);
    const concurrency = typeof record.concurrency === "number" ? record.concurrency : Number(record.concurrency);
    if (Number.isFinite(concurrency) && concurrency > 0) out.concurrency = Math.trunc(concurrency);
    return Object.keys(out).length > 0 ? out : null;
}
function normalizeProviderQuotaOverrides(next, fallback) {
    const rawProviders = asRecord(next ?? fallback);
    const out = {};
    for (const [provider, entry] of Object.entries(rawProviders)){
        if (!provider) continue;
        const normalized = normalizeProviderQuotaOverrideEntry(entry);
        if (normalized) out[provider] = normalized;
    }
    return out;
}
}),
"[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_QUEUE_MAX_DEPTH",
    ()=>DEFAULT_REQUEST_QUEUE_MAX_DEPTH,
    "DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS",
    ()=>DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
    "DEFAULT_RESILIENCE_SETTINGS",
    ()=>DEFAULT_RESILIENCE_SETTINGS,
    "buildLegacyResilienceCompat",
    ()=>buildLegacyResilienceCompat,
    "isStreamRecoveryExplicitlyConfigured",
    ()=>isStreamRecoveryExplicitlyConfigured,
    "mergeResilienceSettings",
    ()=>mergeResilienceSettings,
    "resolveResilienceSettings",
    ()=>resolveResilienceSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings/normalize.ts [app-route] (ecmascript)");
;
;
const DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS = (()=>{
    const parsed = Number(process.env.RATE_LIMIT_MAX_WAIT_MS || "15000");
    return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 15000;
})();
const DEFAULT_REQUEST_QUEUE_MAX_DEPTH = (()=>{
    const parsed = Number(process.env.RATE_LIMIT_MAX_QUEUE_DEPTH || "0");
    return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
})();
const DEFAULT_RESILIENCE_SETTINGS = {
    requestQueue: {
        autoEnableApiKeyProviders: true,
        requestsPerMinute: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].requestsPerMinute,
        minTimeBetweenRequestsMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].minTimeBetweenRequests,
        concurrentRequests: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_API_LIMITS"].concurrentRequests,
        maxWaitMs: DEFAULT_REQUEST_QUEUE_MAX_WAIT_MS,
        maxQueueDepth: DEFAULT_REQUEST_QUEUE_MAX_DEPTH
    },
    connectionCooldown: {
        oauth: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.maxBackoffLevel
        },
        apikey: {
            baseCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.transientCooldown,
            useUpstreamRetryHints: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.rateLimitCooldown === 0,
            maxBackoffSteps: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.maxBackoffLevel
        }
    },
    providerBreaker: {
        oauth: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].oauth.circuitBreakerReset
        },
        apikey: {
            failureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerThreshold,
            degradationThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.degradationThreshold,
            resetTimeoutMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"].apikey.circuitBreakerReset
        }
    },
    // Wait at most 90s for a single connection cooldown (covers Gemini-class
    // TPM/RPM windows, which report ~60s retry-after live), at most 5 retry
    // cycles, never more than 300s (5 min) total (#7360 follow-up — raised now
    // that withEarlyStreamKeepalive gives streaming clients an immediate
    // synthetic keep-alive, eliminating the client-side first-byte-timeout risk
    // a long wait used to carry). Applies to direct (non-combo) model requests.
    waitForCooldown: {
        enabled: true,
        maxRetries: 5,
        maxRetryWaitSec: 90,
        maxRetryWaitMs: 90000,
        budgetMs: 300000
    },
    // Wait at most 90s for a single short transient cooldown (covers Gemini-class
    // TPM/RPM windows, which report ~60s retry-after live — #7360), at most 5
    // redispatch cycles, never more than 300s (5 min) total. Active for every
    // combo strategy when enabled, and only for transient (non quota_exhausted)
    // reasons.
    comboCooldownWait: {
        enabled: true,
        maxWaitMs: 90000,
        maxAttempts: 5,
        budgetMs: 300000
    },
    // FASE 2.1: serialize concurrent quota-share requests per connection when the
    // connection sets a max_concurrent cap, so a subscription account is not
    // flooded past its concurrency ceiling. Kill-switch only (default on); the cap
    // comes from each connection's max_concurrent.
    quotaShareConcurrencyLimit: {
        enabled: true
    },
    providerCooldown: {
        minRetryCooldownMs: Number(process.env.PROVIDER_COOLDOWN_MIN_MS || "5000"),
        maxRetryCooldownMs: Number(process.env.PROVIDER_COOLDOWN_MAX_MS || "300000"),
        // Opt-in (default OFF): this global cross-request cooldown overlaps the
        // existing Connection Cooldown / Provider Circuit Breaker layers, so it is
        // disabled by default and must be explicitly enabled by the operator until
        // its interaction with those layers is validated in production.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.PROVIDER_COOLDOWN_ENABLED || "").trim().toLowerCase())
    },
    quotaPreflight: {
        // Opt-in (default OFF): the auto-routing hard cutoff drops low-quota candidates
        // before scoring, overlapping the existing soft quota penalty + connection
        // cooldown, so it must be explicitly enabled by the operator until its
        // interaction with the scorer is validated in production.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.QUOTA_PREFLIGHT_CUTOFF_ENABLED || "").trim().toLowerCase()),
        // Remaining-% semantics. 2 = "stop when only 2% remaining" (= 98% used).
        // Uniform across all providers and windows; operators set per-window
        // overrides per connection via the Cutoff modal in Dashboard › Limits,
        // or per-(provider, window) globally via the providerWindowDefaults map
        // below (no factory seeds — keep behavior consistent across providers).
        defaultThresholdPercent: 2,
        warnThresholdPercent: 20,
        providerWindowDefaults: {}
    },
    streamRecovery: {
        // Opt-in (default OFF): the holdback that powers transparent early-retry adds
        // up to STREAM_RECOVERY.HOLDBACK_MS of time-to-first-token latency on every
        // streaming request, so it must be explicitly enabled by the operator.
        enabled: [
            "true",
            "1",
            "on"
        ].includes((process.env.STREAM_RECOVERY_ENABLED || "").trim().toLowerCase()),
        // Opt-in (default OFF): mid-stream continuation re-requests after a post-commit cut.
        continueMidStream: [
            "true",
            "1",
            "on"
        ].includes((process.env.STREAM_RECOVERY_MIDSTREAM_ENABLED || "").trim().toLowerCase())
    },
    // #6846 Phase 1: empty by default — nvidia (and any future header-less
    // provider registered in providerDefaultRateLimit.ts) uses its static
    // default until an operator adds an override here.
    providerQuotaOverrides: {}
};
function buildLegacyFallback(settings) {
    const profiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings.providerProfiles);
    const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings.rateLimitDefaults);
    const streamRecoveryDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveStreamRecoveryDefaults"])();
    const oauthLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(profiles.oauth);
    const apikeyLegacy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(profiles.apikey);
    const waitMaxRetrySec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(settings.maxRetryIntervalSec, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetryWaitSec, {
        min: 0,
        max: 300
    });
    const waitMaxRetries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(settings.requestRetry, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.maxRetries, {
        min: 0,
        max: 10
    });
    return {
        requestQueue: {
            autoEnableApiKeyProviders: DEFAULT_RESILIENCE_SETTINGS.requestQueue.autoEnableApiKeyProviders,
            requestsPerMinute: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.requestsPerMinute, DEFAULT_RESILIENCE_SETTINGS.requestQueue.requestsPerMinute, {
                min: 1,
                max: 1_000_000
            }),
            minTimeBetweenRequestsMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.minTimeBetweenRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.minTimeBetweenRequestsMs, {
                min: 0,
                max: 60 * 60 * 1000
            }),
            concurrentRequests: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(defaults.concurrentRequests, DEFAULT_RESILIENCE_SETTINGS.requestQueue.concurrentRequests, {
                min: 1,
                max: 10_000
            }),
            maxWaitMs: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxWaitMs,
            maxQueueDepth: DEFAULT_RESILIENCE_SETTINGS.requestQueue.maxQueueDepth
        },
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(oauthLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLegacyConnectionCooldownProfile"])(apikeyLegacy, DEFAULT_RESILIENCE_SETTINGS.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(oauthLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.oauth.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            },
            apikey: {
                failureThreshold: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerThreshold, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.failureThreshold, {
                    min: 1,
                    max: 1000
                }),
                degradationThreshold: DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.degradationThreshold,
                resetTimeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toInteger"])(apikeyLegacy.circuitBreakerReset, DEFAULT_RESILIENCE_SETTINGS.providerBreaker.apikey.resetTimeoutMs, {
                    min: 1000,
                    max: 24 * 60 * 60 * 1000
                })
            }
        },
        waitForCooldown: {
            enabled: waitMaxRetries > 0 && waitMaxRetrySec > 0,
            maxRetries: waitMaxRetries,
            maxRetryWaitSec: waitMaxRetrySec,
            maxRetryWaitMs: waitMaxRetrySec * 1000,
            budgetMs: Math.max(waitMaxRetrySec * 1000, DEFAULT_RESILIENCE_SETTINGS.waitForCooldown.budgetMs)
        },
        comboCooldownWait: DEFAULT_RESILIENCE_SETTINGS.comboCooldownWait,
        quotaShareConcurrencyLimit: DEFAULT_RESILIENCE_SETTINGS.quotaShareConcurrencyLimit,
        providerCooldown: DEFAULT_RESILIENCE_SETTINGS.providerCooldown,
        quotaPreflight: DEFAULT_RESILIENCE_SETTINGS.quotaPreflight,
        streamRecovery: streamRecoveryDefaults,
        providerQuotaOverrides: DEFAULT_RESILIENCE_SETTINGS.providerQuotaOverrides
    };
}
function isStreamRecoveryExplicitlyConfigured(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const streamRecoveryRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.streamRecovery);
    if (typeof streamRecoveryRecord.enabled === "boolean") {
        return true;
    }
    return (process.env.STREAM_RECOVERY_ENABLED || "").trim().length > 0;
}
function resolveResilienceSettings(settings) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(settings);
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(record.resilienceSettings);
    const fallback = buildLegacyFallback(record);
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(current.requestQueue, fallback.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).oauth, fallback.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.connectionCooldown).apikey, fallback.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).oauth, fallback.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(current.providerBreaker).apikey, fallback.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(current.waitForCooldown, fallback.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(current.comboCooldownWait, fallback.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(current.quotaShareConcurrencyLimit, fallback.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(current.providerCooldown, fallback.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(current.quotaPreflight, fallback.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(current.streamRecovery, fallback.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(current.providerQuotaOverrides, fallback.providerQuotaOverrides)
    };
}
function mergeResilienceSettings(current, updates) {
    return {
        requestQueue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRequestQueueSettings"])(updates.requestQueue, current.requestQueue),
        connectionCooldown: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.oauth, current.connectionCooldown.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeConnectionCooldownProfile"])(updates.connectionCooldown?.apikey, current.connectionCooldown.apikey)
        },
        providerBreaker: {
            oauth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.oauth, current.providerBreaker.oauth),
            apikey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderBreakerProfile"])(updates.providerBreaker?.apikey, current.providerBreaker.apikey)
        },
        waitForCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWaitForCooldownSettings"])(updates.waitForCooldown, current.waitForCooldown),
        comboCooldownWait: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboCooldownWaitSettings"])(updates.comboCooldownWait, current.comboCooldownWait),
        quotaShareConcurrencyLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaShareConcurrencyLimitSettings"])(updates.quotaShareConcurrencyLimit, current.quotaShareConcurrencyLimit),
        providerCooldown: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderCooldownSettings"])(updates.providerCooldown, current.providerCooldown),
        quotaPreflight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeQuotaPreflightSettings"])(updates.quotaPreflight, current.quotaPreflight),
        streamRecovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStreamRecoverySettings"])(updates.streamRecovery, current.streamRecovery),
        providerQuotaOverrides: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2f$normalize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProviderQuotaOverrides"])(updates.providerQuotaOverrides, current.providerQuotaOverrides)
    };
}
function buildLegacyResilienceCompat(settings) {
    return {
        profiles: {
            oauth: {
                transientCooldown: settings.connectionCooldown.oauth.baseCooldownMs,
                rateLimitCooldown: settings.connectionCooldown.oauth.useUpstreamRetryHints ? 0 : settings.connectionCooldown.oauth.baseCooldownMs,
                maxBackoffLevel: settings.connectionCooldown.oauth.maxBackoffSteps,
                circuitBreakerThreshold: settings.providerBreaker.oauth.failureThreshold,
                degradationThreshold: settings.providerBreaker.oauth.degradationThreshold,
                circuitBreakerReset: settings.providerBreaker.oauth.resetTimeoutMs
            },
            apikey: {
                transientCooldown: settings.connectionCooldown.apikey.baseCooldownMs,
                rateLimitCooldown: settings.connectionCooldown.apikey.useUpstreamRetryHints ? 0 : settings.connectionCooldown.apikey.baseCooldownMs,
                maxBackoffLevel: settings.connectionCooldown.apikey.maxBackoffSteps,
                circuitBreakerThreshold: settings.providerBreaker.apikey.failureThreshold,
                degradationThreshold: settings.providerBreaker.apikey.degradationThreshold,
                circuitBreakerReset: settings.providerBreaker.apikey.resetTimeoutMs
            }
        },
        defaults: {
            requestsPerMinute: settings.requestQueue.requestsPerMinute,
            minTimeBetweenRequests: settings.requestQueue.minTimeBetweenRequestsMs,
            concurrentRequests: settings.requestQueue.concurrentRequests
        }
    };
}
}),
"[project]/src/lib/resilience/modelLockoutSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MODEL_LOCKOUT_SETTINGS",
    ()=>DEFAULT_MODEL_LOCKOUT_SETTINGS,
    "resolveModelLockoutSettings",
    ()=>resolveModelLockoutSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/testProcess.ts [app-route] (ecmascript)");
;
const DEFAULT_MODEL_LOCKOUT_SETTINGS = {
    enabled: false,
    errorCodes: [
        403,
        404,
        429,
        502,
        503,
        504
    ],
    baseCooldownMs: 120_000,
    maxCooldownMs: 1_800_000,
    maxBackoffSteps: 10,
    useExponentialBackoff: true
};
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toInteger(value, fallback, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.trunc(parsed))) : fallback;
}
function toBoolean(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value === "true" || value === "1";
    return fallback;
}
function toNumberArray(value, fallback) {
    if (Array.isArray(value)) {
        const nums = value.map((v)=>typeof v === "number" ? v : Number(v)).filter((n)=>Number.isFinite(n) && n >= 100 && n <= 599);
        return nums.length > 0 ? nums : fallback;
    }
    return fallback;
}
function resolveModelLockoutSettings(settings) {
    const record = asRecord(settings);
    const raw = asRecord(record.modelLockout);
    const isTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$testProcess$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAutomatedTestProcess"])();
    const baseCooldownMs = toInteger(raw.baseCooldownMs, DEFAULT_MODEL_LOCKOUT_SETTINGS.baseCooldownMs, {
        min: isTest ? 0 : 5_000,
        max: 600_000
    });
    const maxCooldownMs = Math.max(toInteger(raw.maxCooldownMs, DEFAULT_MODEL_LOCKOUT_SETTINGS.maxCooldownMs, {
        min: isTest ? 0 : 5_000,
        max: 3_600_000
    }), baseCooldownMs // cap must be >= base or exponential backoff is meaningless
    );
    return {
        enabled: toBoolean(raw.enabled, DEFAULT_MODEL_LOCKOUT_SETTINGS.enabled),
        errorCodes: toNumberArray(raw.errorCodes, DEFAULT_MODEL_LOCKOUT_SETTINGS.errorCodes),
        baseCooldownMs,
        maxCooldownMs,
        maxBackoffSteps: toInteger(raw.maxBackoffSteps, DEFAULT_MODEL_LOCKOUT_SETTINGS.maxBackoffSteps, {
            min: 0,
            max: 20
        }),
        useExponentialBackoff: toBoolean(raw.useExponentialBackoff, DEFAULT_MODEL_LOCKOUT_SETTINGS.useExponentialBackoff)
    };
}
}),
"[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CircuitBreaker",
    ()=>CircuitBreaker,
    "CircuitBreakerOpenError",
    ()=>CircuitBreakerOpenError,
    "STATE",
    ()=>STATE,
    "__getCircuitRegistrySizeForTests",
    ()=>__getCircuitRegistrySizeForTests,
    "getAllCircuitBreakerStatuses",
    ()=>getAllCircuitBreakerStatuses,
    "getCircuitBreaker",
    ()=>getCircuitBreaker,
    "isLocalStreamLifecycleError",
    ()=>isLocalStreamLifecycleError,
    "resetAllCircuitBreakers",
    ()=>resetAllCircuitBreakers
]);
/**
 * Circuit Breaker — FASE-04 Observability & Resilience (v2.0)
 *
 * Implements the circuit breaker pattern with:
 * - States: CLOSED → DEGRADED → OPEN → HALF_OPEN → CLOSED
 * - Adaptive backoff: resetTimeout escalates on repeated open→probe→open cycles
 * - Failure-kind-aware thresholds: different limits per failure type
 * - Progressive degradation: high failure rate triggers warning before full open
 * - Transition history tracking for diagnostics
 * - DB persistence via domainState.js
 *
 * States:
 *   CLOSED    — Normal operation, requests pass through
 *   DEGRADED  — Failure rate elevated, requests pass through but warnings logged
 *   OPEN      — Requests are short-circuited
 *   HALF_OPEN — Probing: limited requests allowed to test recovery
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [app-route] (ecmascript)");
;
function isLocalStreamLifecycleError(error) {
    if (!error) return false;
    const errName = typeof error.name === "string" ? error.name : "";
    if (errName === "AbortError") return true;
    const message = typeof error === "string" ? error : typeof error.message === "string" ? error.message : "";
    if (!message) return false;
    return /controller is already closed/i.test(message) || /request_signal_aborted/i.test(message) || /client disconnected/i.test(message) || /operation was aborted/i.test(message);
}
const STATE = {
    CLOSED: "CLOSED",
    DEGRADED: "DEGRADED",
    OPEN: "OPEN",
    HALF_OPEN: "HALF_OPEN"
};
class CircuitBreaker {
    name;
    failureThreshold;
    resetTimeout;
    halfOpenRequests;
    onStateChange;
    isFailure;
    state;
    failureCount;
    successCount;
    lastFailureTime;
    halfOpenAllowed;
    cooldownByKind;
    classifyError;
    lastFailureKind;
    kindThresholds;
    degradationThreshold;
    maxBackoffMultiplier;
    backoffEscalationCount;
    /** Track failure counts per kind separately */ kindFailureCounts;
    /** How many times has the breaker gone from OPEN → HALF_OPEN → OPEN */ openCycleCount;
    /** State transition history */ transitionHistory;
    /** Max transition history entries */ maxTransitionHistory;
    constructor(name, options = {}){
        this.name = name;
        this.failureThreshold = options.failureThreshold ?? 5;
        this.resetTimeout = options.resetTimeout ?? 30000;
        this.halfOpenRequests = options.halfOpenRequests ?? 1;
        this.onStateChange = options.onStateChange || null;
        this.isFailure = options.isFailure || (()=>true);
        this.state = STATE.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.halfOpenAllowed = 0;
        this.cooldownByKind = options.cooldownByKind ?? {};
        this.classifyError = options.classifyError ?? null;
        this.lastFailureKind = null;
        this.kindThresholds = options.kindThresholds ?? {};
        this.degradationThreshold = options.degradationThreshold ?? Math.ceil(this.failureThreshold * 60 / 100);
        this.maxBackoffMultiplier = options.maxBackoffMultiplier ?? 16;
        this.backoffEscalationCount = options.backoffEscalationCount ?? 3;
        this.kindFailureCounts = {};
        this.openCycleCount = 0;
        this.transitionHistory = [];
        this.maxTransitionHistory = 20;
        this._restoreFromDb();
    }
    _restoreFromDb() {
        try {
            const saved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCircuitBreakerState"])(this.name);
            if (saved) {
                if (saved.state === STATE.CLOSED || saved.state === STATE.DEGRADED || saved.state === STATE.OPEN || saved.state === STATE.HALF_OPEN) {
                    this.state = saved.state;
                }
                this.failureCount = saved.failureCount;
                this.lastFailureTime = saved.lastFailureTime;
                const savedKind = saved.options?.lastFailureKind;
                if (savedKind === "rate_limit" || savedKind === "quota_exhausted" || savedKind === "transient") {
                    this.lastFailureKind = savedKind;
                }
                this.openCycleCount = saved.options?.openCycleCount ?? 0;
                this.kindFailureCounts = saved.options?.kindFailureCounts ?? {};
                if (this.state === STATE.HALF_OPEN) {
                    this.halfOpenAllowed = this.halfOpenRequests;
                }
            }
        } catch  {
        // DB may not be ready yet (build phase)
        }
    }
    _persistToDb() {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveCircuitBreakerState"])(this.name, {
                state: this.state,
                failureCount: this.failureCount,
                lastFailureTime: this.lastFailureTime,
                options: {
                    failureThreshold: this.failureThreshold,
                    resetTimeout: this.resetTimeout,
                    halfOpenRequests: this.halfOpenRequests,
                    lastFailureKind: this.lastFailureKind,
                    openCycleCount: this.openCycleCount,
                    kindFailureCounts: this.kindFailureCounts
                }
            });
        } catch  {
        // Non-critical
        }
    }
    /**
   * Get the effective reset timeout, escalated by open cycle count.
   * Each open→half_open→open cycle multiplies the timeout.
   */ _effectiveResetTimeout() {
        if (this.openCycleCount <= this.backoffEscalationCount) {
            return this.resetTimeout;
        }
        const escalationFactor = Math.pow(2, this.openCycleCount - this.backoffEscalationCount);
        return Math.min(this.resetTimeout * escalationFactor, this.resetTimeout * this.maxBackoffMultiplier);
    }
    async execute(fn) {
        this._refreshOpenState();
        if (this.state === STATE.OPEN) {
            throw new CircuitBreakerOpenError(`Circuit breaker "${this.name}" is OPEN. Try again later.`, this.name, this._timeUntilReset());
        }
        if (this.state === STATE.HALF_OPEN && this.halfOpenAllowed <= 0) {
            throw new CircuitBreakerOpenError(`Circuit breaker "${this.name}" is HALF_OPEN, no more probe requests allowed.`, this.name, this._timeUntilReset());
        }
        if (this.state === STATE.HALF_OPEN) {
            this.halfOpenAllowed--;
        }
        try {
            const result = await fn();
            this._onSuccess();
            return result;
        } catch (error) {
            if (this.isFailure(error)) {
                let kind;
                if (this.classifyError) {
                    try {
                        kind = this.classifyError(error);
                    } catch  {
                        kind = undefined;
                    }
                }
                this._onFailure(kind);
            }
            throw error;
        }
    }
    canExecute() {
        this._refreshOpenState();
        if (this.state === STATE.CLOSED || this.state === STATE.DEGRADED) return true;
        if (this.state === STATE.OPEN) return false;
        if (this.state === STATE.HALF_OPEN) return this.halfOpenAllowed > 0;
        return false;
    }
    getStatus() {
        this._refreshOpenState();
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
            retryAfterMs: this.getRetryAfterMs(),
            lastFailureKind: this.lastFailureKind,
            openCycleCount: this.openCycleCount,
            kindFailureCounts: {
                ...this.kindFailureCounts
            },
            degradationThreshold: this.degradationThreshold,
            effectiveResetTimeout: this._effectiveResetTimeout()
        };
    }
    getRetryAfterMs() {
        this._refreshOpenState();
        if (this.state === STATE.CLOSED || this.state === STATE.DEGRADED) return 0;
        return this._timeUntilReset();
    }
    reset() {
        this._transition(STATE.CLOSED, "manual-reset");
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.lastFailureKind = null;
        this.openCycleCount = 0;
        this.kindFailureCounts = {};
        this._persistToDb();
    }
    // ─── Internal ─────────────────────────────────
    _onSuccess() {
        if (this.state === STATE.OPEN) {
            this._transition(STATE.CLOSED, "success-recovery");
            this.failureCount = 0;
            this.successCount = 0;
            this.lastFailureTime = null;
            this.lastFailureKind = null;
            this.openCycleCount = 0;
            this.kindFailureCounts = {};
        } else if (this.state === STATE.HALF_OPEN) {
            this.successCount++;
            this._transition(STATE.CLOSED, "probe-success");
            this.failureCount = 0;
            this.lastFailureKind = null;
            this.openCycleCount = 0;
            this.kindFailureCounts = {};
        } else {
            // CLOSED or DEGRADED: reset counts
            this.failureCount = Math.max(0, this.failureCount - 1); // gradual recovery
            if (this.state === STATE.DEGRADED && this.failureCount <= this.degradationThreshold) {
                this._transition(STATE.CLOSED, "recovery");
            }
        }
        this._persistToDb();
    }
    _onFailure(kind) {
        const failureKind = kind ?? null;
        this.failureCount++;
        this.lastFailureTime = Date.now();
        this.lastFailureKind = failureKind;
        // Track per-kind failure counts
        if (failureKind) {
            this.kindFailureCounts[failureKind] = (this.kindFailureCounts[failureKind] || 0) + 1;
        }
        // Check kind-specific thresholds
        if (failureKind) {
            const kindConfig = this.kindThresholds[failureKind];
            if (kindConfig) {
                const kindCount = this.kindFailureCounts[failureKind] || 0;
                // Immediate open for critical failure kinds
                if (kindConfig.immediateOpen && kindCount >= (kindConfig.threshold || 1)) {
                    this._openCircuit(failureKind);
                    return;
                }
                // Kind-specific threshold reached
                if (kindCount >= (kindConfig.threshold || this.failureThreshold)) {
                    this._openCircuit(failureKind);
                    return;
                }
            }
        }
        // State transitions based on total failure count
        if (this.state === STATE.OPEN) {
        // Already OPEN — just update persistence
        } else if (this.state === STATE.HALF_OPEN) {
            // Probe failed: OPEN with cycle count escalation
            this.openCycleCount++;
            this._transition(STATE.OPEN, `probe-failed (cycle ${this.openCycleCount})`);
        } else if (this.state === STATE.DEGRADED) {
            // Degraded → Open when threshold reached
            if (this.failureCount >= this.failureThreshold) {
                this._openCircuit(failureKind);
            }
        } else {
            // CLOSED → DEGRADED or OPEN
            if (this.failureCount >= this.failureThreshold) {
                this._openCircuit(failureKind);
            } else if (this.failureCount >= this.degradationThreshold) {
                this._transition(STATE.DEGRADED, `elevated-failures (${this.failureCount}/${this.failureThreshold})`);
            }
        }
        this._persistToDb();
    }
    _openCircuit(kind) {
        this._transition(STATE.OPEN, kind ? `kind:${kind}` : undefined);
    }
    _shouldAttemptReset() {
        if (!this.lastFailureTime) return true;
        const cooldown = this._effectiveCooldown();
        return Date.now() - this.lastFailureTime >= cooldown;
    }
    _effectiveCooldown() {
        const baseTimeout = this._effectiveResetTimeout();
        if (this.lastFailureKind !== null) {
            const override = this.cooldownByKind[this.lastFailureKind];
            if (typeof override === "number" && Number.isFinite(override) && override >= 0) {
                return override;
            }
        }
        return baseTimeout;
    }
    _timeUntilReset() {
        if (!this.lastFailureTime) return 0;
        const cooldown = this._effectiveCooldown();
        return Math.max(0, cooldown - (Date.now() - this.lastFailureTime));
    }
    _refreshOpenState() {
        if (this.state === STATE.OPEN && this._shouldAttemptReset()) {
            this._transition(STATE.HALF_OPEN, "timeout-elapsed");
            this._persistToDb();
        }
    }
    _transition(newState, reason) {
        const oldState = this.state;
        this.state = newState;
        if (newState === STATE.HALF_OPEN) {
            this.halfOpenAllowed = this.halfOpenRequests;
        }
        // Record transition
        this.transitionHistory.push({
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            failureCount: this.failureCount,
            reason
        });
        if (this.transitionHistory.length > this.maxTransitionHistory) {
            this.transitionHistory.shift();
        }
        if (this.onStateChange && oldState !== newState) {
            this.onStateChange(this.name, oldState, newState);
        }
    }
}
class CircuitBreakerOpenError extends Error {
    circuitName;
    retryAfterMs;
    constructor(message, circuitName, retryAfterMs){
        super(message);
        this.name = "CircuitBreakerOpenError";
        this.circuitName = circuitName;
        this.retryAfterMs = retryAfterMs;
    }
}
// ─── Registry ─────────────────────────────────────
const MAX_REGISTRY_SIZE = 500;
const registry = new Map();
function __getCircuitRegistrySizeForTests() {
    return registry.size;
}
const _registrySweep = setInterval(()=>{
    const now = Date.now();
    for (const [name, breaker] of registry){
        const status = breaker.getStatus();
        if (status.state === STATE.CLOSED && status.failureCount === 0 && (!status.lastFailureTime || now - status.lastFailureTime > 30 * 60 * 1000)) {
            registry.delete(name);
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCircuitBreakerState"])(name);
            } catch  {}
        }
    }
}, 5 * 60_000);
if (typeof _registrySweep === "object" && "unref" in _registrySweep) {
    _registrySweep.unref?.();
}
/**
 * Enforce MAX_REGISTRY_SIZE before inserting a new breaker. The cap was previously declared
 * but never used — the only bound was the 5-min sweep, which evicts a breaker only if it is
 * CLOSED, has zero failures, AND has been idle for >30 min. With high-cardinality breaker
 * names that cap could be exceeded for up to 30 min. Evict idle CLOSED breakers (oldest first)
 * to make room; never evict OPEN/HALF_OPEN breakers, since those carry meaningful state. A
 * CLOSED breaker with zero failures is behaviorally identical to a freshly-created one, so
 * evicting and lazily recreating it later changes nothing.
 */ function evictColdBreakersIfNeeded() {
    if (registry.size < MAX_REGISTRY_SIZE) return;
    const candidates = [];
    for (const [name, breaker] of registry){
        const status = breaker.getStatus();
        if (status.state === STATE.CLOSED && status.failureCount === 0) {
            candidates.push({
                name,
                lastFailureTime: status.lastFailureTime || 0
            });
        }
    }
    candidates.sort((a, b)=>a.lastFailureTime - b.lastFailureTime);
    const target = registry.size - MAX_REGISTRY_SIZE + 1;
    for(let i = 0; i < candidates.length && i < target; i++){
        registry.delete(candidates[i].name);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCircuitBreakerState"])(candidates[i].name);
        } catch  {}
    }
}
function getCircuitBreaker(name, options) {
    if (!registry.has(name)) {
        evictColdBreakersIfNeeded();
        registry.set(name, new CircuitBreaker(name, options));
    }
    const breaker = registry.get(name);
    if (options) {
        if (typeof options.failureThreshold === "number") {
            breaker.failureThreshold = options.failureThreshold;
        }
        if (typeof options.resetTimeout === "number") {
            breaker.resetTimeout = options.resetTimeout;
        }
        if (typeof options.halfOpenRequests === "number") {
            breaker.halfOpenRequests = options.halfOpenRequests;
            if (breaker.state === STATE.HALF_OPEN) {
                breaker.halfOpenAllowed = Math.min(breaker.halfOpenAllowed, breaker.halfOpenRequests);
            }
        }
        if (typeof options.onStateChange === "function") {
            breaker.onStateChange = options.onStateChange;
        }
        if (typeof options.isFailure === "function") {
            breaker.isFailure = options.isFailure;
        }
        if (options.cooldownByKind) {
            breaker.cooldownByKind = {
                ...breaker.cooldownByKind,
                ...options.cooldownByKind
            };
        }
        if (typeof options.classifyError === "function") {
            breaker.classifyError = options.classifyError;
        }
        if (options.kindThresholds) {
            breaker.kindThresholds = {
                ...breaker.kindThresholds,
                ...options.kindThresholds
            };
        }
        if (typeof options.degradationThreshold === "number") {
            breaker.degradationThreshold = options.degradationThreshold;
        }
        if (typeof options.maxBackoffMultiplier === "number") {
            breaker.maxBackoffMultiplier = options.maxBackoffMultiplier;
        }
        if (typeof options.backoffEscalationCount === "number") {
            breaker.backoffEscalationCount = options.backoffEscalationCount;
        }
        breaker._persistToDb();
    }
    return breaker;
}
function getAllCircuitBreakerStatuses() {
    try {
        const persisted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadAllCircuitBreakerStates"])();
        for (const cb of persisted){
            if (!registry.has(cb.name)) {
                getCircuitBreaker(cb.name);
            }
        }
    } catch  {
    // Use registry only
    }
    return Array.from(registry.values()).map((cb)=>cb.getStatus());
}
function resetAllCircuitBreakers() {
    for (const cb of registry.values()){
        cb.reset();
    }
    registry.clear();
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteAllCircuitBreakerStates"])();
    } catch  {
    // Non-critical
    }
}
}),
"[project]/src/shared/utils/classify429.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 429 response classifier — distinguish rate-limit from quota-exhausted.
 *
 * Most LLM providers return HTTP 429 for two semantically different reasons:
 *
 * 1. **Rate-limit**: short transient back-off ("too many requests in
 *    the last minute"). Fix: wait the Retry-After window and retry.
 * 2. **Quota-exhausted**: long-period cap hit ("daily/monthly limit
 *    reached"). Fix: wait until the period rolls over (could be hours
 *    or days). Retrying every 60s wastes calls and burns alerts.
 *
 * The HTTP status alone cannot disambiguate. This helper inspects the
 * response body and headers to return a `FailureKind` the circuit
 * breaker can use to pick the right cooldown.
 *
 * Companion to OmniRoute issue #2100.
 *
 * @module shared/utils/classify429
 */ __turbopack_context__.s([
    "classify429",
    ()=>classify429,
    "classify429FromError",
    ()=>classify429FromError,
    "looksLikeQuotaExhausted",
    ()=>looksLikeQuotaExhausted,
    "parseRetryAfter",
    ()=>parseRetryAfter,
    "retryAfterFromResponse",
    ()=>retryAfterFromResponse
]);
/**
 * Heuristic regexes for "explicit quota exhausted" vs "rate-limited"
 * detection in 429 error bodies. A 429 alone never implies quota
 * exhausted — only an explicit keyword does.
 *
 * Patterns observed across OpenAI, Anthropic, Groq, Cerebras, Mistral,
 * Google Gemini, and OpenRouter free-tier responses.
 */ const QUOTA_PATTERNS = [
    /daily.*limit/i,
    /daily.*quota/i,
    /per.?day.*limit/i,
    /monthly.*limit/i,
    /monthly.*quota/i,
    /per.?month.*limit/i,
    /quota.*exceed/i,
    /exceed.*quota/i,
    /insufficient.*quota/i,
    /billing.*cap/i,
    /credit.*exhaust/i,
    /out of credits/i,
    /hard.?limit/i,
    /plan.*limit/i,
    // Antigravity / Cloud Code quota exhaustion ("Individual quota reached.
    // Contact your administrator to enable overages. Resets in 164h27m24s.").
    // None of the patterns above match it, so the 429 was misclassified as a
    // transient rate-limit and locked for only ~5s instead of the real window.
    // Keep these specific: a bare /quota reached/ would also flag transient
    // per-minute limits like "request quota reached, retry in 60s".
    /individual quota reached/i,
    /enable overages/i,
    /INSUFFICIENT_G1_CREDITS_BALANCE/i,
    // Google APIs return this generic RESOURCE_EXHAUSTED message when a
    // billing-period quota has been consumed. Keep the reset-window qualifier
    // so transient Google rate limits are not treated as long-term exhaustion.
    /resource has been exhausted.*reset after/i,
    // Cloudflare Workers AI daily neuron exhaustion (Issue #6980).
    // Body: "you have used up your daily free allocation of 10,000 neurons,
    //        please upgrade to Cloudflare's Workers Paid plan..."
    // No existing pattern matches "daily free allocation" — without this,
    // the 429 is misclassified as transient rate_limit and retried every
    // ~60s against a budget that only resets at UTC midnight.
    /daily free allocation/i,
    // Modal-hosted OpenAI-compatible endpoints (e.g. self-hosted Kimi K3).
    // Body: {"error":"usage limit reached"}, no nested "message"/"quota"/
    // "daily" wording. Without this pattern the 429 falls through to
    // "rate_limit" (short cooldown), so combo round-robin's per-conversation
    // session stickiness (#3825) keeps re-targeting the same exhausted
    // connection every turn instead of a long lockout that lets the sticky
    // target fail over to another account.
    //
    // Matches the "error" JSON key with "usage limit reached" as its value.
    // Extra sibling fields (e.g. {"error":"usage limit reached", "code":"..."})
    // still match. A different key like {"detail":"..."} or a qualified value
    // like {"error":"Per-minute usage limit reached"} does NOT match. Bare
    // string bodies without a JSON wrapper also do NOT match.
    // Trailing punctuation/whitespace before the closing quote is tolerated
    // because real API responses may include a period or trailing space.
    /"error"\s*:\s*"usage limit reached[.\s]*"/i
];
/**
 * Best-effort case-insensitive header lookup.
 */ function getHeader(headers, name) {
    if (!headers) return undefined;
    const target = name.toLowerCase();
    for (const [k, v] of Object.entries(headers)){
        if (k.toLowerCase() === target) return v;
    }
    return undefined;
}
/**
 * Coerce a body of unknown shape to a string for keyword scanning.
 * - string: returned as-is
 * - object: JSON-stringified (so nested error.message gets scanned)
 * - undefined/null: empty string
 */ function bodyToText(body) {
    if (typeof body === "string") return body;
    if (body == null) return "";
    try {
        return JSON.stringify(body);
    } catch  {
        return "";
    }
}
function looksLikeQuotaExhausted(body) {
    const text = bodyToText(body);
    if (!text) return false;
    return QUOTA_PATTERNS.some((pat)=>pat.test(text));
}
function classify429(response) {
    if (response.status !== 429) return "transient";
    if (looksLikeQuotaExhausted(response.body)) return "quota_exhausted";
    return "rate_limit";
}
function parseRetryAfter(headerValue) {
    if (!headerValue) return null;
    const trimmed = headerValue.trim();
    if (!trimmed) return null;
    // Groq-style relative: must check BEFORE plain int parse.
    const relMatch = trimmed.match(/^(\d+)([smh])$/i);
    if (relMatch) {
        const n = Number(relMatch[1]);
        const unit = relMatch[2].toLowerCase();
        if (Number.isFinite(n)) {
            if (unit === "s") return n;
            if (unit === "m") return n * 60;
            if (unit === "h") return n * 3600;
        }
    }
    // Pure integer seconds.
    if (/^\d+$/.test(trimmed)) {
        const n = Number(trimmed);
        return Number.isFinite(n) ? n : null;
    }
    // HTTP date.
    const ts = Date.parse(trimmed);
    if (Number.isFinite(ts)) {
        return Math.max(0, Math.floor((ts - Date.now()) / 1000));
    }
    return null;
}
function retryAfterFromResponse(response) {
    return parseRetryAfter(getHeader(response.headers, "retry-after"));
}
/**
 * Normalize an unknown headers-like value into a plain `Record<string, string>`.
 * Native `Headers` (from `fetch`) does NOT respond to `Object.entries` — it
 * exposes `.entries()` instead. Without this normalization, `getHeader` would
 * silently miss every header on a Headers instance.
 */ function normalizeHeaders(raw) {
    if (raw === null || typeof raw !== "object") return undefined;
    const maybeIter = raw.entries;
    if (typeof maybeIter === "function") {
        try {
            return Object.fromEntries(raw.entries());
        } catch  {
        // fall through to plain-object treatment
        }
    }
    return raw;
}
function classify429FromError(err) {
    if (err === null || typeof err !== "object") return undefined;
    const e = err;
    let status;
    let headers;
    let body;
    if (typeof e.status === "number") {
        status = e.status;
    }
    if (typeof e.statusCode === "number" && status === undefined) {
        status = e.statusCode;
    }
    if (e.response && typeof e.response === "object") {
        const resp = e.response;
        if (typeof resp.status === "number" && status === undefined) {
            status = resp.status;
        }
        if (resp.headers && typeof resp.headers === "object") {
            headers = normalizeHeaders(resp.headers);
        }
        if (resp.data !== undefined) {
            body = resp.data;
        } else if (typeof resp.body !== "undefined") {
            body = resp.body;
        }
    }
    if (headers === undefined && e.headers && typeof e.headers === "object") {
        headers = normalizeHeaders(e.headers);
    }
    if (body === undefined) {
        if (typeof e.body !== "undefined") {
            body = e.body;
        } else if (typeof e.message === "string") {
            body = e.message;
        }
    }
    if (typeof status !== "number") return undefined;
    return classify429({
        status,
        headers,
        body
    });
}
}),
"[project]/src/shared/utils/providerHints.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "defaultUseUpstream429BreakerHints",
    ()=>defaultUseUpstream429BreakerHints,
    "resolveUseUpstream429BreakerHints",
    ()=>resolveUseUpstream429BreakerHints
]);
/**
 * Per-provider default policy for upstream 429 hint trust.
 *
 * @see Issue #2100 follow-up — surface a user-overridable per-profile toggle
 * that decides whether the circuit breaker uses upstream 429 body / Retry-After
 * hints (`classify429`, `cooldownByKind`) to differentiate rate-limit from
 * quota-exhausted failure cooldowns.
 *
 * This helper returns the **default** answer for a given provider. The actual
 * runtime decision is the user override (if any) OR this default. See
 * `accountFallback.ts` / `chat.ts` / `chatHelpers.ts` for the resolution
 * call sites:
 *
 * ```ts
 * const userValue = providerProfile.useUpstream429BreakerHints; // boolean | undefined
 * const useHints  = userValue !== undefined
 *   ? userValue
 *   : defaultUseUpstream429BreakerHints(provider);
 * ```
 *
 * Default policy: direct cloud providers default `true` because their 429
 * bodies and `Retry-After` headers are authoritative. Reverse-proxy /
 * self-hosted / CLI-backed providers default `false` because forwarded 429
 * metadata is often unreliable or fabricated by the proxy.
 *
 * @module shared/utils/providerHints
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/upstream-proxy.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function defaultUseUpstream429BreakerHints(providerId) {
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$upstream$2d$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UPSTREAM_PROXY_PROVIDERS"], providerId)) {
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(providerId)) {
        return false;
    }
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SELF_HOSTED_CHAT_PROVIDER_IDS"].has(providerId)) {
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) {
        return false;
    }
    return true;
}
function resolveUseUpstream429BreakerHints(providerId, userValue) {
    if (userValue !== undefined) {
        return userValue;
    }
    return defaultUseUpstream429BreakerHints(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/config/codexQuotaScopes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_SPARK_DISPLAY_NAME",
    ()=>CODEX_SPARK_DISPLAY_NAME,
    "CODEX_SPARK_METERED_FEATURE",
    ()=>CODEX_SPARK_METERED_FEATURE,
    "CODEX_SPARK_MODEL_ID",
    ()=>CODEX_SPARK_MODEL_ID,
    "CODEX_SPARK_QUOTA_SESSION",
    ()=>CODEX_SPARK_QUOTA_SESSION,
    "CODEX_SPARK_QUOTA_WEEKLY",
    ()=>CODEX_SPARK_QUOTA_WEEKLY,
    "getCodexModelScope",
    ()=>getCodexModelScope,
    "getCodexQuotaWindowFilterForModel",
    ()=>getCodexQuotaWindowFilterForModel,
    "getCodexRateLimitKey",
    ()=>getCodexRateLimitKey,
    "isCodexSparkLimitDescriptor",
    ()=>isCodexSparkLimitDescriptor,
    "isCodexSparkQuotaKey",
    ()=>isCodexSparkQuotaKey,
    "toCodexBaseQuotaWindowName",
    ()=>toCodexBaseQuotaWindowName,
    "toCodexScopedQuotaWindowName",
    ()=>toCodexScopedQuotaWindowName
]);
const CODEX_SPARK_MODEL_ID = "gpt-5.3-codex-spark";
const CODEX_SPARK_DISPLAY_NAME = "GPT-5.3-Codex-Spark";
const CODEX_SPARK_METERED_FEATURE = "gpt_5_3_codex_spark";
const CODEX_SPARK_QUOTA_SESSION = `${CODEX_SPARK_METERED_FEATURE}_session`;
const CODEX_SPARK_QUOTA_WEEKLY = `${CODEX_SPARK_METERED_FEATURE}_weekly`;
const CODEX_SCOPE_PATTERNS = [
    {
        pattern: "codex-spark",
        scope: "spark"
    },
    {
        pattern: "spark",
        scope: "spark"
    },
    {
        pattern: "bengalfox",
        scope: "spark"
    },
    {
        pattern: "codex",
        scope: "codex"
    },
    {
        pattern: "gpt-5",
        scope: "codex"
    }
];
function getCodexModelScope(model) {
    const lower = String(model || "").toLowerCase();
    for (const { pattern, scope } of CODEX_SCOPE_PATTERNS){
        if (lower.includes(pattern)) return scope;
    }
    return "codex";
}
function getCodexRateLimitKey(accountId, model) {
    return `${accountId}:${getCodexModelScope(model)}`;
}
function isCodexSparkQuotaKey(key) {
    const normalized = String(key || "").trim().toLowerCase();
    if (!normalized) return false;
    return normalized === CODEX_SPARK_QUOTA_SESSION || normalized === CODEX_SPARK_QUOTA_WEEKLY || normalized === "codex-spark" || normalized === "codex-spark-weekly" || normalized.includes("codex-spark") || normalized.includes("codex_spark") || normalized.includes(CODEX_SPARK_METERED_FEATURE);
}
function isCodexSparkLimitDescriptor(...values) {
    return values.some((value)=>{
        if (typeof value !== "string") return false;
        const normalized = value.trim().toLowerCase();
        return normalized.includes("spark") || normalized.includes("bengalfox") || normalized.includes(CODEX_SPARK_METERED_FEATURE);
    });
}
function getCodexQuotaWindowFilterForModel(model) {
    if (!model) return undefined;
    const scope = getCodexModelScope(model);
    return (windowName)=>{
        const isSpark = isCodexSparkQuotaKey(windowName);
        return scope === "spark" ? isSpark : !isSpark;
    };
}
function toCodexScopedQuotaWindowName(baseWindowName, model) {
    if (!model || getCodexModelScope(model) !== "spark") return baseWindowName;
    const normalized = baseWindowName.trim().toLowerCase();
    if (normalized === "session") return CODEX_SPARK_QUOTA_SESSION;
    if (normalized === "weekly") return CODEX_SPARK_QUOTA_WEEKLY;
    return baseWindowName;
}
function toCodexBaseQuotaWindowName(windowName) {
    if (!windowName) return windowName;
    const normalized = windowName.trim().toLowerCase();
    if (normalized === CODEX_SPARK_QUOTA_SESSION || normalized === "codex-spark") return "session";
    if (normalized === CODEX_SPARK_QUOTA_WEEKLY || normalized === "codex-spark-weekly") {
        return "weekly";
    }
    return windowName;
}
}),
"[project]/open-sse/services/antigravityQuotaFamily.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAntigravityQuotaFamily",
    ()=>getAntigravityQuotaFamily,
    "getQuotaScopeLabelForProvider",
    ()=>getQuotaScopeLabelForProvider,
    "getQuotaScopedModelForProvider",
    ()=>getQuotaScopedModelForProvider
]);
const ANTIGRAVITY_PROVIDER_ID = "antigravity";
function normalizeModelId(model) {
    return String(model || "").trim().toLowerCase();
}
function getAntigravityQuotaFamily(model) {
    const normalized = normalizeModelId(model).replace(/^(antigravity|agy)\//, "");
    const slashIndex = normalized.indexOf("/");
    const bare = slashIndex >= 0 ? normalized.slice(slashIndex + 1) : normalized;
    if (bare.startsWith("gemini-") || bare.includes("/gemini-") || bare.includes("gemini")) {
        return "gemini";
    }
    if (bare.startsWith("claude-") || bare.startsWith("cloud-") || bare.includes("/claude-") || bare.includes("/cloud-") || bare.includes("anthropic")) {
        return "claude";
    }
    return "other";
}
function getQuotaScopedModelForProvider(provider, model) {
    if (!model) return null;
    if (provider !== "antigravity" && provider !== "agy") return model;
    const family = getAntigravityQuotaFamily(model);
    return family === "other" ? model : `family:${family}`;
}
function getQuotaScopeLabelForProvider(provider, model) {
    if (provider !== "antigravity" && provider !== "agy") return "model";
    return getAntigravityQuotaFamily(model) === "other" ? "model" : "family";
}
}),
"[project]/open-sse/config/geminiRateLimits.json.[json].cjs [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "gemini-2.5-flash": {
        "rpm": 5,
        "rpd": 20,
        "tpm": 250000
    },
    "gemini-2.5-pro": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "gemini-2-flash": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "gemini-2-flash-lite": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "gemini-2.5-flash-tts": {
        "rpm": 3,
        "rpd": 10,
        "tpm": 10000
    },
    "gemini-2.5-pro-tts": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "imagen-4-generate": {
        "rpm": -1,
        "rpd": 25,
        "tpm": -1
    },
    "imagen-4-ultra-generate": {
        "rpm": -1,
        "rpd": 25,
        "tpm": -1
    },
    "imagen-4-fast-generate": {
        "rpm": -1,
        "rpd": 25,
        "tpm": -1
    },
    "gemma-4-26b-it": {
        "rpm": 16000,
        "rpd": 14400,
        "tpm": 16000
    },
    "gemma-4-31b-it": {
        "rpm": 16000,
        "rpd": 14400,
        "tpm": 16000
    },
    "gemini-embedding-exp-03-07": {
        "rpm": 100,
        "rpd": 1000,
        "tpm": 30000
    },
    "gemini-3.5-flash": {
        "rpm": 5,
        "rpd": 20,
        "tpm": 250000
    },
    "gemini-3.1-flash-lite": {
        "rpm": 15,
        "rpd": 500,
        "tpm": 250000
    },
    "gemini-3.1-pro": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "gemini-2.5-flash-lite": {
        "rpm": 10,
        "rpd": 20,
        "tpm": 250000
    },
    "nano-banana-gemini-2.5-flash-preview-image": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "nano-banana-pro-gemini-3-pro-image": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "nano-banana-2-gemini-3.1-flash-image": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "lyria-3-clip": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "lyria-3-pro": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "veo-3-generate": {
        "rpm": 0,
        "rpd": 0,
        "tpm": -1
    },
    "veo-3-fast-generate": {
        "rpm": 0,
        "rpd": 0,
        "tpm": -1
    },
    "veo-3-lite-generate": {
        "rpm": 0,
        "rpd": 0,
        "tpm": -1
    },
    "gemini-3.1-flash-tts": {
        "rpm": 3,
        "rpd": 10,
        "tpm": 10000
    },
    "gemini-robotics-er-1.5-preview": {
        "rpm": 10,
        "rpd": 20,
        "tpm": 250000
    },
    "gemini-robotics-er-1.6-preview": {
        "rpm": 5,
        "rpd": 20,
        "tpm": 250000
    },
    "computer-use-preview": {
        "rpm": 0,
        "rpd": 0,
        "tpm": 0
    },
    "gemini-embedding-exp-04-07": {
        "rpm": 100,
        "rpd": 1000,
        "tpm": 30000
    },
    "gemini-3.5-live-translate": {
        "rpm": -1,
        "rpd": -1,
        "tpm": 20000
    },
    "gemini-2.5-flash-native-audio-dialog": {
        "rpm": -1,
        "rpd": -1,
        "tpm": 1000000
    },
    "gemini-3-flash-live": {
        "rpm": -1,
        "rpd": -1,
        "tpm": 65000
    }
};
}),
"[project]/open-sse/services/geminiRateLimitTracker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyGeminiQuotaMetricFromText",
    ()=>classifyGeminiQuotaMetricFromText,
    "getDailyRequestCount",
    ()=>getDailyRequestCount,
    "getMinuteRequestCount",
    ()=>getMinuteRequestCount,
    "getMinuteTokenCount",
    ()=>getMinuteTokenCount,
    "getModelRpd",
    ()=>getModelRpd,
    "getModelRpm",
    ()=>getModelRpm,
    "getModelTpm",
    ()=>getModelTpm,
    "incrementDailyRequestCount",
    ()=>incrementDailyRequestCount,
    "incrementMinuteRequestCount",
    ()=>incrementMinuteRequestCount,
    "incrementRequestCount",
    ()=>incrementRequestCount,
    "incrementTokenUsage",
    ()=>incrementTokenUsage,
    "isMinuteRateExhausted",
    ()=>isMinuteRateExhausted,
    "isRpdExhausted",
    ()=>isRpdExhausted,
    "isRpmExhausted",
    ()=>isRpmExhausted,
    "isTpmExhausted",
    ()=>isTpmExhausted,
    "resetCounters",
    ()=>resetCounters
]);
/**
 * In-memory request/token counters for Gemini models — tracks both RPD (daily),
 * RPM (sliding 60s window), and TPM (sliding 60s token window) so that 429
 * responses can be classified as either quota_exhausted (RPD hit),
 * rate_limit_exceeded (RPM hit), or token_rate_exceeded (TPM hit).
 *
 * Gemini returns identical error bodies for all three, so we rely on
 * published per-model limits from geminiRateLimits.json to distinguish them.
 *
 * Counters are incremented on every Gemini request so that once usage
 * reaches the published limit, subsequent 429s are correctly classified.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$geminiRateLimits$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/geminiRateLimits.json.[json].cjs [app-route] (ecmascript)");
;
const dailyCounts = new Map();
// ── RPM (sliding 60s window) state ───────────────────────────────────────────
const minuteWindows = new Map();
// ── TPM (sliding 60s token window) state ─────────────────────────────────────
const tokenWindows = new Map();
// ── Helpers ──────────────────────────────────────────────────────────────────
function toDateKey() {
    return new Date().toISOString().slice(0, 10);
}
function stripModelPrefix(modelId) {
    // Only strip the "gemini/" provider prefix, never "gemini-" which is part
    // of the actual model name (e.g. "gemini-2.5-flash", "gemini-3.5-live-translate").
    return modelId.replace(/^gemini\//, "").trim();
}
function lookupValue(modelId, field) {
    if (!modelId) return 0;
    const key = stripModelPrefix(modelId);
    const entry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$geminiRateLimits$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"][key];
    if (!entry) {
        for (const [knownKey, knownEntry] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$geminiRateLimits$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])){
            if (key.endsWith(knownKey) || knownKey.endsWith(key)) {
                const val = knownEntry[field];
                return typeof val === "number" && val > 0 ? val : 0;
            }
        }
        return 0;
    }
    const val = entry[field];
    return typeof val === "number" && val > 0 ? val : 0;
}
function getModelRpd(modelId) {
    return lookupValue(modelId, "rpd");
}
function incrementDailyRequestCount(modelId) {
    if (!modelId) return;
    const key = stripModelPrefix(modelId);
    const today = toDateKey();
    const existing = dailyCounts.get(key);
    if (existing && existing.date === today) {
        existing.count++;
    } else {
        dailyCounts.set(key, {
            date: today,
            count: 1
        });
    }
}
function getDailyRequestCount(modelId) {
    if (!modelId) return 0;
    const key = stripModelPrefix(modelId);
    const today = toDateKey();
    const entry = dailyCounts.get(key);
    if (entry && entry.date === today) return entry.count;
    return 0;
}
function isRpdExhausted(modelId) {
    const rpd = getModelRpd(modelId);
    if (rpd <= 0) return false;
    return getDailyRequestCount(modelId) >= rpd;
}
function getModelRpm(modelId) {
    return lookupValue(modelId, "rpm");
}
/** Prune timestamps older than 60 seconds from a model's window. */ function pruneMinuteWindow(key) {
    const now = Date.now();
    const cutoff = now - 60_000;
    const timestamps = minuteWindows.get(key);
    if (!timestamps) return;
    let i = 0;
    while(i < timestamps.length && timestamps[i] < cutoff)i++;
    if (i > 0) {
        minuteWindows.set(key, timestamps.slice(i));
    }
}
function pruneTokenWindow(key) {
    const now = Date.now();
    const cutoff = now - 60_000;
    const entries = tokenWindows.get(key);
    if (!entries) return;
    let i = 0;
    while(i < entries.length && entries[i] < cutoff)i += 2;
    if (i > 0) {
        tokenWindows.set(key, entries.slice(i));
    }
}
function incrementMinuteRequestCount(modelId) {
    if (!modelId) return;
    const key = stripModelPrefix(modelId);
    pruneMinuteWindow(key);
    const timestamps = minuteWindows.get(key) ?? [];
    timestamps.push(Date.now());
    minuteWindows.set(key, timestamps);
}
function getMinuteRequestCount(modelId) {
    if (!modelId) return 0;
    const key = stripModelPrefix(modelId);
    pruneMinuteWindow(key);
    return minuteWindows.get(key)?.length ?? 0;
}
function isRpmExhausted(modelId) {
    const rpm = getModelRpm(modelId);
    if (rpm <= 0) return false;
    return getMinuteRequestCount(modelId) >= rpm;
}
function getModelTpm(modelId) {
    return lookupValue(modelId, "tpm");
}
function incrementTokenUsage(modelId, promptTokens) {
    if (!modelId || !Number.isFinite(promptTokens) || promptTokens <= 0) return;
    const key = stripModelPrefix(modelId);
    pruneTokenWindow(key);
    const entries = tokenWindows.get(key) ?? [];
    entries.push(Date.now(), promptTokens);
    tokenWindows.set(key, entries);
}
function getMinuteTokenCount(modelId) {
    if (!modelId) return 0;
    const key = stripModelPrefix(modelId);
    pruneTokenWindow(key);
    const entries = tokenWindows.get(key);
    if (!entries) return 0;
    let total = 0;
    for(let i = 1; i < entries.length; i += 2){
        total += entries[i];
    }
    return total;
}
function isTpmExhausted(modelId) {
    const tpm = getModelTpm(modelId);
    if (tpm <= 0) return false;
    return getMinuteTokenCount(modelId) >= tpm;
}
function classifyGeminiQuotaMetricFromText(errorText) {
    if (!errorText) return null;
    const lower = errorText.toLowerCase();
    if (!lower.includes("generativelanguage.googleapis.com")) return null;
    if (lower.includes("_per_day") || lower.includes("per day")) return "rpd";
    if (lower.includes("input_token_count") || lower.includes("token_count")) return "tpm";
    if (lower.includes("_requests")) return "rpm";
    return null;
}
function incrementRequestCount(modelId) {
    incrementDailyRequestCount(modelId);
    incrementMinuteRequestCount(modelId);
}
function isMinuteRateExhausted(modelId) {
    return isRpmExhausted(modelId) || isTpmExhausted(modelId);
}
function resetCounters() {
    dailyCounts.clear();
    minuteWindows.clear();
    tokenWindows.clear();
}
}),
"[project]/open-sse/services/retryAfterJson.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_SHORT_RETRY_HINT_MS",
    ()=>MAX_SHORT_RETRY_HINT_MS,
    "parseDelayString",
    ()=>parseDelayString,
    "parseRetryHintFromJsonBody",
    ()=>parseRetryHintFromJsonBody
]);
function objectRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function positiveCappedMs(value, maxMs) {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.min(value, maxMs) : null;
}
function futureTimestampMs(value, maxMs) {
    if (typeof value !== "string") return null;
    const parsedTs = Date.parse(value);
    if (!Number.isFinite(parsedTs)) return null;
    const waitMs = parsedTs - Date.now();
    return waitMs > 0 ? Math.min(waitMs, maxMs) : null;
}
const MAX_SHORT_RETRY_HINT_MS = 24 * 60 * 60 * 1000; // 24h
function parseDelayString(value) {
    if (!value) return null;
    const str = String(value).trim();
    const msMatch = /^(\d+(?:\.\d+)?)\s*ms$/i.exec(str);
    if (msMatch) return Math.round(Number.parseFloat(msMatch[1]));
    const secMatch = /^(\d+(?:\.\d+)?)\s*s$/i.exec(str);
    if (secMatch) return Math.round(Number.parseFloat(secMatch[1]) * 1000);
    const minMatch = /^(\d+(?:\.\d+)?)\s*m$/i.exec(str);
    if (minMatch) return Math.round(Number.parseFloat(minMatch[1]) * 60 * 1000);
    const hrMatch = /^(\d+(?:\.\d+)?)\s*h$/i.exec(str);
    if (hrMatch) return Math.round(Number.parseFloat(hrMatch[1]) * 3600 * 1000);
    // Bare number → seconds
    const num = Number.parseFloat(str);
    return Number.isFinite(num) ? Math.round(num * 1000) : null;
}
// Gemini/Google RPC 429 bodies embed the short throttle hint as
// `error.details[].{"@type": ".../google.rpc.RetryInfo", "retryDelay": "26s"}`.
function retryInfoDetailsMs(details) {
    for (const detail of Array.isArray(details) ? details : []){
        const detailRecord = objectRecord(detail);
        const type = String(detailRecord["@type"] ?? "");
        if (!type.includes("RetryInfo")) continue;
        const ms = parseDelayString(detailRecord.retryDelay);
        if (ms !== null && ms > 0) return Math.min(ms, MAX_SHORT_RETRY_HINT_MS);
    }
    return null;
}
function parseRetryHintFromJsonBody(body, maxMs) {
    let parsed;
    try {
        parsed = JSON.parse(body);
    } catch  {
        return null;
    }
    const root = objectRecord(parsed);
    if (!Object.keys(root).length) return null;
    const errorObj = objectRecord(root.error);
    const retryInfoMs = retryInfoDetailsMs(errorObj.details ?? root.details);
    if (retryInfoMs !== null) return retryInfoMs;
    const isoHint = futureTimestampMs(errorObj.retryAfter ?? root.retryAfter, maxMs);
    if (isoHint !== null) return isoHint;
    return positiveCappedMs(errorObj.retry_after_ms ?? root.retry_after_ms ?? errorObj.retryAfterMs ?? root.retryAfterMs, maxMs);
}
}),
"[project]/open-sse/services/quotaTextCooldowns.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSessionQuotaFallback",
    ()=>buildSessionQuotaFallback,
    "buildSubscriptionQuotaFallback",
    ()=>buildSubscriptionQuotaFallback,
    "buildWeeklyQuotaFallback",
    ()=>buildWeeklyQuotaFallback,
    "isSessionUsageLimitText",
    ()=>isSessionUsageLimitText,
    "isSubscriptionQuotaText",
    ()=>isSubscriptionQuotaText,
    "isWeeklyUsageLimitText",
    ()=>isWeeklyUsageLimitText
]);
/**
 * Text-based quota-exhaustion classifiers for the account-fallback engine.
 *
 * Extracted out of `accountFallback.ts` (frozen at its file-size-baseline
 * cap — see `config/quality/file-size-baseline.json`) so a new quota-text
 * signal (Issue #3709) could be added without growing that file. These are
 * pure functions with no dependency back on `accountFallback.ts`, so there
 * is no circular import (`npm run check:cycles`).
 *
 * @module services/quotaTextCooldowns
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
;
function isSubscriptionQuotaText(lower, provider) {
    return lower.includes("usage limit reached") || lower.includes("usage limit has been") || lower.includes("claude pro usage limit") || lower.includes("you've reached your usage limit") || lower.includes("you have reached your usage limit") || provider === "claude" && lower.includes("this request would exceed your account's rate limit");
}
const SUBSCRIPTION_QUOTA_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
function buildSubscriptionQuotaFallback(errorStr, getUpstreamRetryHintMs, parseRetryFromErrorText, provider) {
    if (!isSubscriptionQuotaText(errorStr.toLowerCase(), provider)) return null;
    const hintMs = getUpstreamRetryHintMs();
    const bodyHint = parseRetryFromErrorText(errorStr);
    return {
        shouldFallback: true,
        cooldownMs: hintMs ?? SUBSCRIPTION_QUOTA_COOLDOWN_MS,
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED,
        usedUpstreamRetryHint: Boolean(hintMs),
        quotaResetHintMs: bodyHint ?? undefined
    };
}
// ─── Issue #3709 — Ollama Cloud weekly usage cap ───────────────────────────
//
// Ollama Cloud free-tier accounts have a hard WEEKLY request cap. On cap the
// upstream returns 429 "you (<account>) have reached your weekly usage
// limit". ollama-cloud is an apikey-category provider (not oauth), so the
// `shouldUseQuotaSignal` gate in `checkFallbackError` (oauth-only) skips the
// subscription-quota-text branch above for its 429s — without a dedicated,
// ungated check the account fell through to the generic 429 backoff
// (~1s, capped at 2min) and got retried every few minutes for the rest of
// the week (one account took 285x429 in 48h — issue #3709).
//
// The exact weekly reset anchor (UTC Monday? rolling 7d from first request?)
// is not publicly documented by Ollama, so this uses a fixed 24h cooldown —
// short enough to recover promptly once the real window resets, long enough
// to stop the every-5-minute retry storm. The phrase match is generic (not
// ollama-specific), so any other provider using the same wording benefits.
const WEEKLY_QUOTA_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
function isWeeklyUsageLimitText(lower) {
    return lower.includes("weekly usage limit") || lower.includes("weekly limit reached") || lower.includes("reached your weekly");
}
function buildWeeklyQuotaFallback(errorStr) {
    if (!isWeeklyUsageLimitText(errorStr.toLowerCase())) return null;
    return {
        shouldFallback: true,
        cooldownMs: WEEKLY_QUOTA_COOLDOWN_MS,
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED
    };
}
// ─── Issue #7071 — Ollama Cloud 5-hour SESSION usage cap ───────────────────
//
// Ollama Cloud also enforces a rolling 5-hour "session" usage cap, sibling to
// the weekly cap above (#3709/#6638). On cap the upstream returns 429 with a
// body like "you (<account>) have reached your session usage limit". Same
// root cause as the weekly gap: neither the generic subscription-quota-text
// classifier nor the weekly one recognize "session" wording, so the account
// fell through to the generic 429 backoff and got retried within the same
// 5-hour window instead of cooling down for it — combo/LKGP routing cycled
// back to the "exhausted" account instead of advancing to the next one.
//
// Patterns are scoped to "session ... usage limit" / "session limit reached"
// / "reached your session ... usage limit" phrasing (not a bare "session"
// match) so unrelated "session expired"/"session token invalid" auth errors
// from other providers are not misclassified as quota-exhausted.
const SESSION_QUOTA_COOLDOWN_MS = 5 * 60 * 60 * 1000; // 5 hours
function isSessionUsageLimitText(lower) {
    return lower.includes("session usage limit") || lower.includes("session limit reached") || lower.includes("reached your session") && lower.includes("usage limit");
}
function buildSessionQuotaFallback(errorStr) {
    if (!isSessionUsageLimitText(errorStr.toLowerCase())) return null;
    return {
        shouldFallback: true,
        cooldownMs: SESSION_QUOTA_COOLDOWN_MS,
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED
    };
}
}),
"[project]/open-sse/services/quotaResetParsing.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDayGranularityResetMs",
    ()=>parseDayGranularityResetMs,
    "shouldPreserveQuotaSignals",
    ()=>shouldPreserveQuotaSignals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/classify429.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
;
;
function shouldPreserveQuotaSignals(provider, errorText) {
    if (!provider) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "oauth") return true;
    return Boolean(errorText) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looksLikeQuotaExhausted"])(errorText);
}
function parseDayGranularityResetMs(msg, maxMs) {
    const dayMatch = /reset(?:s)?\s+in\s+(\d+)\s*day(?:s)?/i.exec(msg);
    if (!dayMatch) return null;
    const days = Number.parseInt(dayMatch[1], 10);
    if (!Number.isFinite(days) || days <= 0) return null;
    return Math.min(days * 24 * 3600 * 1000, maxMs);
}
}),
"[project]/open-sse/services/accountFallback/lockoutEviction.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * accountFallback/lockoutEviction.ts — model-lockout map eviction (cap enforcement).
 *
 * Extracted from services/accountFallback.ts (file-size gate, #6923): the bounded-growth
 * eviction sweep for the in-memory `modelLockouts` / `modelFailureState` maps. Pure w.r.t.
 * module state — operates only on the maps passed in by the caller — so it is independently
 * testable and reusable outside accountFallback.ts, which wraps evictLockoutOverflow() with
 * its own private map instances and re-exports MODEL_LOCKOUT_EVICTION_CAP.
 */ __turbopack_context__.s([
    "MODEL_LOCKOUT_EVICTION_CAP",
    ()=>MODEL_LOCKOUT_EVICTION_CAP,
    "evictLockoutOverflow",
    ()=>evictLockoutOverflow
]);
const MODEL_LOCKOUT_EVICTION_CAP = 1000;
function evictLockoutOverflow(modelLockouts, modelFailureState, cap = MODEL_LOCKOUT_EVICTION_CAP) {
    if (modelLockouts.size > cap) {
        const overflow = modelLockouts.size - cap;
        const now = Date.now();
        // Only expired entries are eviction candidates (oldest-first, up to the
        // overflow count) — active ones never appear in this list at all.
        const evictableKeys = [
            ...modelLockouts.entries()
        ].filter(([, entry])=>entry.until <= now).slice(0, overflow).map(([key])=>key);
        for (const key of evictableKeys){
            modelLockouts.delete(key);
            modelFailureState.delete(key);
        }
    }
    if (modelFailureState.size > cap) {
        const overflow = modelFailureState.size - cap;
        let evicted = 0;
        for (const key of modelFailureState.keys()){
            if (evicted >= overflow) break;
            if (!modelLockouts.has(key)) modelFailureState.delete(key);
            evicted++;
        }
    }
}
}),
"[project]/open-sse/services/accountFallback/cooldownCap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * accountFallback/cooldownCap.ts — absolute ceiling for exponentially-scaled cooldowns.
 *
 * Extracted from services/accountFallback.ts (file-size gate): a pure, one-purpose clamp
 * so the connection-level 429/retryable-error cooldown path (getScaledBaseCooldown, inside
 * checkFallbackError) applies the same absolute ceiling the model-lockout path
 * (recordModelLockoutFailure) already enforces. Fixes #8396 — after a sustained 429 burst
 * pushed backoffLevel high, `baseCooldownMs * 2^level` had no upper bound on this path and
 * could black a connection out for hours, long past any real rate-limit reset window.
 */ /**
 * Clamp an exponentially-scaled cooldown to `maxCooldownMs` (operator-configured, per
 * ProviderProfile) falling back to `fallbackMaxMs` (e.g. BACKOFF_CONFIG.max) when the
 * profile did not configure one. Never widens the cooldown, only bounds it — the
 * exponential backoff itself is untouched.
 */ __turbopack_context__.s([
    "capScaledCooldownMs",
    ()=>capScaledCooldownMs
]);
function capScaledCooldownMs(cooldownMs, maxCooldownMs, fallbackMaxMs) {
    const cap = typeof maxCooldownMs === "number" && maxCooldownMs > 0 ? maxCooldownMs : fallbackMaxMs;
    return Math.min(cooldownMs, cap);
}
}),
"[project]/open-sse/services/accountFallback/nonRetryableUpstream.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNonRetryableCloudflareError",
    ()=>isNonRetryableCloudflareError,
    "resolveApiKeyForbiddenFallback",
    ()=>resolveApiKeyForbiddenFallback
]);
/**
 * #8775 — Detect Cloudflare (and similar edge) errors that explicitly forbid
 * retries. When these bodies are misclassified as short AUTH_ERROR cooldowns,
 * OmniRoute waits 3× for a permanent client-signature ban and burns 21–33s
 * before falling through to the next combo tier.
 *
 * Kept as a pure helper so checkFallbackError stays within its file-size freeze
 * and every branch is unit-testable without DB/auth wiring.
 */ function tryParseJsonObject(text) {
    const trimmed = text.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
        }
    } catch  {
    // Body may be truncated HTML/JSON hybrids — fall through to string probes.
    }
    return null;
}
function hasCloudflareBanSignal(value) {
    if (typeof value === "number") return value === 1010;
    if (typeof value !== "string") return false;
    const lower = value.toLowerCase();
    return lower.includes("browser_signature_banned") || lower.includes("error 1010") || lower === "1010" || lower.includes("cloudflare");
}
function isNonRetryableCloudflareError(errorText) {
    if (typeof errorText !== "string" || errorText.length === 0) return false;
    const obj = tryParseJsonObject(errorText);
    if (obj) {
        const retryable = obj.retryable;
        const errorCode = obj.error_code ?? obj.errorCode;
        const errorName = typeof obj.error_name === "string" ? obj.error_name : "";
        const cloudflareError = obj.cloudflare_error === true || obj.cloudflareError === true;
        const ownerActionRequired = obj.owner_action_required === true || obj.ownerActionRequired === true;
        if (errorCode === 1010 || errorCode === "1010") return true;
        if (errorName.toLowerCase() === "browser_signature_banned") return true;
        if (retryable === false && (cloudflareError || ownerActionRequired)) return true;
        if (retryable === false && hasCloudflareBanSignal(obj.title ?? obj.type ?? obj.detail)) {
            return true;
        }
    }
    // Non-JSON / nested-string fallbacks (logs often stringify the body).
    if (/browser_signature_banned/i.test(errorText)) return true;
    if (/"error_code"\s*:\s*1010\b/.test(errorText)) return true;
    if (/"retryable"\s*:\s*false/.test(errorText) && (/"cloudflare_error"\s*:\s*true/.test(errorText) || /"owner_action_required"\s*:\s*true/.test(errorText) || /cloudflare/i.test(errorText))) {
        return true;
    }
    return false;
}
function resolveApiKeyForbiddenFallback(errorStr, buildRetryableFallback, authErrorReason) {
    if (isNonRetryableCloudflareError(errorStr)) {
        return {
            shouldFallback: true,
            cooldownMs: 0,
            reason: authErrorReason
        };
    }
    return buildRetryableFallback(authErrorReason);
}
}),
"[project]/open-sse/services/accountFallback/exactModelLock.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * accountFallback/exactModelLock.ts — exact-model (non-family-scoped) lockout key + entry math.
 *
 * Extracted from services/accountFallback.ts (file-size gate, #8630): pure helpers for the
 * opt-in "exact model" lockout scope introduced for Antigravity — a confirmed exhaustion on
 * one specific model (e.g. one Claude model) must not lock the whole quota family (Gemini or
 * other Claude models on the same account). Pure w.r.t. module state — accountFallback.ts
 * still owns the modelLockouts/modelFailureState maps, canonical-provider resolution, and the
 * cleanup timer; it calls into these with its own map instances.
 */ __turbopack_context__.s([
    "buildExactModelLockKey",
    ()=>buildExactModelLockKey,
    "clearMultiKeyLock",
    ()=>clearMultiKeyLock,
    "collectModelLockKeys",
    ()=>collectModelLockKeys,
    "computeExactModelLockEntry",
    ()=>computeExactModelLockEntry,
    "createGetModelLockKeys",
    ()=>createGetModelLockKeys,
    "createLockExactModel",
    ()=>createLockExactModel,
    "findLatestLockEntry",
    ()=>findLatestLockEntry,
    "isAnyKeyLocked",
    ()=>isAnyKeyLocked
]);
function buildExactModelLockKey(canonicalProvider, connectionId, model) {
    return `${canonicalProvider}:${connectionId}:exact:${model.trim().toLowerCase()}`;
}
function collectModelLockKeys(familyKey, notFoundKey, exactKey) {
    return Array.from(new Set([
        familyKey,
        notFoundKey,
        exactKey
    ]));
}
function createGetModelLockKeys(getModelLockKey, getCanonicalLockProvider) {
    return function getModelLockKeys(provider, connectionId, model) {
        return collectModelLockKeys(getModelLockKey(provider, connectionId, model), getModelLockKey(provider, connectionId, model, "not_found", 404), buildExactModelLockKey(getCanonicalLockProvider(provider), connectionId, model));
    };
}
function computeExactModelLockEntry(existing, reason, cooldownMs, metadata) {
    const now = Date.now();
    const newUntil = now + cooldownMs;
    if (existing && existing.until > newUntil) {
        if (!metadata.failureCount || metadata.failureCount <= existing.failureCount) return null;
        return {
            ...existing,
            failureCount: metadata.failureCount,
            lastFailureAt: metadata.lastFailureAt ?? existing.lastFailureAt,
            resetAfterMs: metadata.resetAfterMs ?? existing.resetAfterMs
        };
    }
    return {
        reason,
        until: newUntil,
        lockedAt: now,
        failureCount: metadata.failureCount ?? existing?.failureCount ?? 1,
        lastFailureAt: metadata.lastFailureAt ?? now,
        resetAfterMs: metadata.resetAfterMs ?? existing?.resetAfterMs ?? 0
    };
}
function clearMultiKeyLock(modelLockouts, modelFailureState, keys) {
    let cleared = false;
    for (const key of keys){
        cleared = modelLockouts.delete(key) || cleared;
        cleared = modelFailureState.delete(key) || cleared;
    }
    return cleared;
}
function isAnyKeyLocked(modelLockouts, cleanup, keys) {
    return keys.some((key)=>{
        cleanup(key);
        return modelLockouts.has(key);
    });
}
function findLatestLockEntry(modelLockouts, cleanup, keys) {
    return keys.map((key)=>{
        cleanup(key);
        return modelLockouts.get(key);
    }).filter((value)=>Boolean(value)).sort((a, b)=>b.until - a.until)[0];
}
function createLockExactModel(modelLockouts, ensureCleanupTimer, cleanupModelLockKey, getCanonicalLockProvider) {
    return function lockExactModel(provider, connectionId, model, reason, cooldownMs, metadata = {}) {
        if (!model) return;
        ensureCleanupTimer();
        const key = buildExactModelLockKey(getCanonicalLockProvider(provider), connectionId, model);
        cleanupModelLockKey(key);
        const next = computeExactModelLockEntry(modelLockouts.get(key), reason, cooldownMs, metadata);
        if (next) modelLockouts.set(key, next);
    };
}
}),
"[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ACCOUNT_DEACTIVATED_SIGNALS",
    ()=>ACCOUNT_DEACTIVATED_SIGNALS,
    "CONTEXT_OVERFLOW_PATTERNS",
    ()=>CONTEXT_OVERFLOW_PATTERNS,
    "CREDITS_EXHAUSTED_SIGNALS",
    ()=>CREDITS_EXHAUSTED_SIGNALS,
    "MODEL_ACCESS_DENIED_PATTERNS",
    ()=>MODEL_ACCESS_DENIED_PATTERNS,
    "OAUTH_INVALID_TOKEN_SIGNALS",
    ()=>OAUTH_INVALID_TOKEN_SIGNALS,
    "RATE_LIMIT_TEXT_PATTERNS",
    ()=>RATE_LIMIT_TEXT_PATTERNS,
    "applyErrorState",
    ()=>applyErrorState,
    "checkFallbackError",
    ()=>checkFallbackError,
    "classifyError",
    ()=>classifyError,
    "classifyErrorText",
    ()=>classifyErrorText,
    "classifyLockoutReason",
    ()=>classifyLockoutReason,
    "clearAllModelLockouts",
    ()=>clearAllModelLockouts,
    "clearModelLock",
    ()=>clearModelLock,
    "clearProviderFailure",
    ()=>clearProviderFailure,
    "cooldownUntilMs",
    ()=>cooldownUntilMs,
    "decayModelFailureCount",
    ()=>decayModelFailureCount,
    "evictModelLockoutOverflow",
    ()=>evictModelLockoutOverflow,
    "filterAvailableAccounts",
    ()=>filterAvailableAccounts,
    "formatRetryAfter",
    ()=>formatRetryAfter,
    "getAccountHealth",
    ()=>getAccountHealth,
    "getAllModelLockouts",
    ()=>getAllModelLockouts,
    "getBackoffDuration",
    ()=>getBackoffDuration,
    "getEarliestRateLimitedUntil",
    ()=>getEarliestRateLimitedUntil,
    "getMergedBannedSignals",
    ()=>getMergedBannedSignals,
    "getModelLockoutInfo",
    ()=>getModelLockoutInfo,
    "getModelLockoutSize",
    ()=>getModelLockoutSize,
    "getMsUntilTomorrow",
    ()=>getMsUntilTomorrow,
    "getProviderBreakerState",
    ()=>getProviderBreakerState,
    "getProviderCooldownRemainingMs",
    ()=>getProviderCooldownRemainingMs,
    "getProviderProfile",
    ()=>getProviderProfile,
    "getProvidersInCooldown",
    ()=>getProvidersInCooldown,
    "getQuotaCooldown",
    ()=>getQuotaCooldown,
    "getRuntimeProviderProfile",
    ()=>getRuntimeProviderProfile,
    "getUnavailableUntil",
    ()=>getUnavailableUntil,
    "hasPerModelQuota",
    ()=>hasPerModelQuota,
    "isAccountDeactivated",
    ()=>isAccountDeactivated,
    "isAccountUnavailable",
    ()=>isAccountUnavailable,
    "isCreditsExhausted",
    ()=>isCreditsExhausted,
    "isDailyQuotaExhausted",
    ()=>isDailyQuotaExhausted,
    "isModelLocked",
    ()=>isModelLocked,
    "isOAuthInvalidToken",
    ()=>isOAuthInvalidToken,
    "isProviderExhaustedReason",
    ()=>isProviderExhaustedReason,
    "isProviderFailureCode",
    ()=>isProviderFailureCode,
    "isProviderInCooldown",
    ()=>isProviderInCooldown,
    "lockExactModel",
    ()=>lockExactModel,
    "lockModel",
    ()=>lockModel,
    "lockModelIfPerModelQuota",
    ()=>lockModelIfPerModelQuota,
    "parseRetryAfterFromBody",
    ()=>parseRetryAfterFromBody,
    "parseRetryFromErrorText",
    ()=>parseRetryFromErrorText,
    "recordModelLockoutFailure",
    ()=>recordModelLockoutFailure,
    "recordProviderFailure",
    ()=>recordProviderFailure,
    "resetAccountState",
    ()=>resetAccountState,
    "selectLockoutCooldownMs",
    ()=>selectLockoutCooldownMs,
    "setCustomBannedSignals",
    ()=>setCustomBannedSignals,
    "shouldMarkAccountExhaustedFrom429",
    ()=>shouldMarkAccountExhaustedFrom429
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerErrorRules.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rotationConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rotationConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/modelLockoutSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/classify429.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerHints.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiRateLimitTracker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers/rateLimit.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/retryAfterJson.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaTextCooldowns.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaResetParsing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$lockoutEviction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/lockoutEviction.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$cooldownCap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/cooldownCap.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$nonRetryableUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/nonRetryableUpstream.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/exactModelLock.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function toJsonRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
// Provider-level failure tracking for circuit breaker behavior
// Error codes that count toward provider-level failure threshold.
// 429 is included: per-error-type cooldowns (rate_limit: 60s, quota_exhausted: 1h)
// prevent cascading provider trips at scale (Issue #1846 concern addressed),
// while still allowing the circuit breaker to open on sustained 429s and
// prevent infinite combo retries (Issue #3200).
const PROVIDER_FAILURE_ERROR_CODES = new Set([
    408,
    429,
    500,
    502,
    503,
    504
]);
// Per-connection failure deduplication: prevents rapid-fire failures from the
// same connection from counting multiple times toward the provider breaker.
const CONNECTION_FAILURE_DEDUP_MS = 5000;
const MAX_CONNECTION_FAILURE_DEDUP_ENTRIES = 10_000;
const lastConnectionFailure = new Map();
function pruneConnectionFailureDedupeEntries() {
    while(lastConnectionFailure.size > MAX_CONNECTION_FAILURE_DEDUP_ENTRIES){
        const oldestKey = lastConnectionFailure.keys().next().value;
        if (typeof oldestKey !== "string") return;
        lastConnectionFailure.delete(oldestKey);
    }
}
const _connectionFailureSweep = setInterval(()=>{
    const now = Date.now();
    for (const [key, ts] of lastConnectionFailure){
        if (now - ts > CONNECTION_FAILURE_DEDUP_MS) lastConnectionFailure.delete(key);
    }
}, 60_000);
if (typeof _connectionFailureSweep === "object" && "unref" in _connectionFailureSweep) {
    _connectionFailureSweep.unref?.();
}
const ACCOUNT_DEACTIVATED_SIGNALS = [
    "account_deactivated",
    "account has been deactivated",
    "account has been disabled",
    "your account has been suspended",
    "this account is deactivated",
    // AG (Antigravity/Google Cloud Code) permanent ban signals
    "verify your account to continue",
    "this service has been disabled in this account for violation",
    "this service has been disabled in this account"
];
// Custom banned signals — loaded from DB settings at runtime.
// Combined with ACCOUNT_DEACTIVATED_SIGNALS in isAccountDeactivated().
let _customBannedSignals = [];
function setCustomBannedSignals(signals) {
    _customBannedSignals = signals;
}
function getMergedBannedSignals() {
    if (_customBannedSignals.length === 0) return ACCOUNT_DEACTIVATED_SIGNALS;
    return [
        ...ACCOUNT_DEACTIVATED_SIGNALS,
        ..._customBannedSignals
    ];
}
const CREDITS_EXHAUSTED_SIGNALS = [
    "insufficient_quota",
    "billing_hard_limit_reached",
    "exceeded your current quota",
    "exceeded your current usage quota",
    "credit_balance_too_low",
    "your credit balance is too low",
    "credits exhausted",
    "out of credits",
    "payment required",
    "free tier of the model has been exhausted",
    // #8631: narrower than a bare "has been exhausted" — that generic phrase also
    // appears in Gemini's transient RPM/TPM 429 body ("Resource has been exhausted
    // (e.g. check quota)."), which must stay RATE_LIMIT_EXCEEDED, not terminal.
    // Anchoring on "tier" keeps free-tier depletion wording matched while excluding
    // Gemini's "resource has been exhausted" rate-limit phrasing.
    "tier has been exhausted",
    // #5239: providers (e.g. DeepSeek/GLM-style) return "Insufficient account balance"
    // on a depleted key. 402 is already terminalized by status, but catch non-402
    // out-of-credit bodies here too.
    "insufficient balance",
    "insufficient_balance",
    "insufficient account balance"
];
const OAUTH_INVALID_TOKEN_SIGNALS = [
    "invalid authentication credentials",
    "oauth 2",
    "login cookie",
    "valid authentication credential",
    "invalid credentials"
];
const CONTEXT_OVERFLOW_PATTERNS = [
    /\binput is too long\b/i,
    /\binput too long\b/i,
    /\bcontext.*(too long|exceeded|overflow|limit)/i,
    /\btoo many tokens\b/i,
    /\bprompt is too long\b/i,
    /\bcontext window/i,
    /\bmaximum context/i,
    /\bmax.*token/i,
    /\btoken limit/i,
    /\brequest too large\b/i
];
// Structured error codes that reliably indicate model access denied
// (more reliable than regex on human-readable messages).
// OpenAI:  { error: { code: "model_not_found", ... } }
// Anthropic: { error: { type: "not_found_error", ... } }
const MODEL_ACCESS_DENIED_CODES = new Set([
    "model_not_found",
    "deployment_not_found"
]);
const MODEL_ACCESS_DENIED_TYPES = new Set([
    "not_found_error"
]);
// Anthropic's permission_error is NOT exclusively model-access related: it also
// covers API-key scope, organization restrictions and feature gating. Treating it
// as model-access-denied unconditionally would make a genuinely auth-restricted key
// silently exhaust every combo target and hide the real error from the caller.
// So it only counts when the message text confirms it refers to the model.
const MODEL_ACCESS_AMBIGUOUS_TYPES = new Set([
    "permission_error"
]);
const MODEL_ACCESS_DENIED_PATTERNS = [
    /\binvalid model\b/i,
    /\bmodel.*not.*(?:available|found|supported|accessible)\b/i,
    /\bmodel.*(?:does not exist|doesn't exist)\b/i,
    // "does not support" / "unsupported model" — GitHub Copilot / OpenAI-compatible
    // often phrase model rejection this way without the "is not supported" word order.
    /\bmodel\b[\s\S]{0,80}?\b(?:does\s+not\s+support|doesn't\s+support|unsupported)\b/i,
    /\b(?:does\s+not\s+support|doesn't\s+support|unsupported)\b[\s\S]{0,80}?\bmodel\b/i,
    /\bunsupported\s+model\b/i,
    /\baccess.*denied.*model\b/i,
    /\bmodel.*access.*denied\b/i,
    /\bplease select a different model\b/i,
    // "...access to the requested model" / "model ... access" — bounded lookahead
    // (no nested quantifiers) so it stays ReDoS-safe while requiring BOTH an
    // access/permission word and "model" so a pure auth error never matches.
    /\b(?:access|permission)[\s\S]{0,60}?\bmodel\b/i,
    /\bmodel[\s\S]{0,60}?\b(?:access|permission)\b/i
];
// Pure credential/authentication failures — the key or token itself is bad, which
// is NOT a model-availability problem. Some providers phrase these as a 400 that
// also mentions the model (e.g. "invalid api key for model X"), which would
// otherwise trip MODEL_ACCESS_DENIED_PATTERNS above and trigger combo fallback
// across every target, masking the real "fix your credential" error. When the
// text clearly indicates a bad credential, the regex-based model-access detection
// is suppressed (structured codes/types like model_not_found are unaffected).
const AUTH_CREDENTIAL_ERROR_PATTERNS = [
    /\b(?:invalid|incorrect|expired|missing|revoked)\s+api[\s_-]?key\b/i,
    /\bapi[\s_-]?key\s+(?:is\s+)?(?:invalid|incorrect|expired|missing|revoked|not\s+valid)\b/i,
    /\bauthentication\s+(?:failed|error|required)\b/i,
    /\b(?:invalid|expired|missing|revoked)\s+(?:token|credentials?|bearer)\b/i,
    /\bunauthorized\b/i,
    /\bnot\s+authenticated\b/i
];
// Malformed request patterns — the model rejected the message format but a different
// provider/model in the combo may accept it.
const MALFORMED_REQUEST_PATTERNS = [
    /\bimproperly formed request\b/i,
    /\binvalid.*message.*format/i,
    /\bmessages must alternate\b/i,
    /\bempty (message|content)\b/i,
    // Tool call function name errors
    /\bfunction'?s? name (?:can't|can not|is|has) (?:blank|empty|missing)/i,
    /function.*name.*(?:blank|empty|missing)/i,
    /tool_call.*name.*(?:blank|empty|missing)/i
];
const RATE_LIMIT_TEXT_PATTERNS = [
    /high.?frequency/i,
    /non-compliant/i,
    /too many requests/i,
    /rate.?limit/i,
    /频繁/,
    /频率/
];
// Parameter validation errors — model-specific constraints (different models = different limits)
const PARAM_VALIDATION_PATTERNS = [
    /max_tokens.*illegal/i,
    /max_tokens.*must be/i,
    /max_tokens.*range/i,
    /parameter is illegal/i,
    /is illegal.*range/i
];
function isAccountDeactivated(errorText) {
    const lower = String(errorText || "").toLowerCase();
    return getMergedBannedSignals().some((sig)=>lower.includes(sig));
}
function isCreditsExhausted(errorText) {
    const lower = String(errorText || "").toLowerCase();
    return CREDITS_EXHAUSTED_SIGNALS.some((sig)=>lower.includes(sig));
}
function isOAuthInvalidToken(errorText) {
    const lower = String(errorText || "").toLowerCase();
    return OAUTH_INVALID_TOKEN_SIGNALS.some((sig)=>lower.includes(sig));
}
// ─── Resilience Profile Helper ──────────────────────────────────────────────
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function isCompatibleProvider(provider) {
    return typeof provider === "string" && (provider.startsWith("openai-compatible-") || provider.startsWith("anthropic-compatible-"));
}
function buildProviderProfile(category, settings) {
    const resilience = settings ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings) : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_RESILIENCE_SETTINGS"];
    const connectionCooldown = resilience.connectionCooldown[category];
    const providerBreaker = resilience.providerBreaker[category];
    return {
        baseCooldownMs: connectionCooldown.baseCooldownMs,
        useUpstreamRetryHints: connectionCooldown.useUpstreamRetryHints,
        useUpstream429BreakerHints: connectionCooldown.useUpstream429BreakerHints,
        maxCooldownMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveModelLockoutSettings"])(settings).maxCooldownMs,
        maxBackoffSteps: connectionCooldown.maxBackoffSteps,
        failureThreshold: providerBreaker.failureThreshold,
        resetTimeoutMs: providerBreaker.resetTimeoutMs,
        transientCooldown: connectionCooldown.baseCooldownMs,
        rateLimitCooldown: connectionCooldown.useUpstreamRetryHints ? 0 : connectionCooldown.baseCooldownMs,
        maxBackoffLevel: connectionCooldown.maxBackoffSteps,
        circuitBreakerThreshold: providerBreaker.failureThreshold,
        circuitBreakerReset: providerBreaker.resetTimeoutMs,
        degradationThreshold: providerBreaker.degradationThreshold,
        // Provider-level cooldown fields are not exposed in resilience settings yet.
        providerFailureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].providerFailureThreshold,
        providerFailureWindowMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].providerFailureWindowMs,
        maxBackoffMultiplier: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].maxBackoffMultiplier,
        backoffEscalationCount: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].backoffEscalationCount,
        providerCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].providerCooldownMs
    };
}
function getProviderProfile(provider) {
    const category = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider);
    return buildProviderProfile(category);
}
async function getRuntimeProviderProfile(provider) {
    try {
        const { getCachedSettings } = await __turbopack_context__.A("[project]/src/lib/db/readCache.ts [app-route] (ecmascript, async loader)");
        const settings = await getCachedSettings();
        const category = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider || "");
        return buildProviderProfile(category, settings);
    } catch  {
        return getProviderProfile(provider || "");
    }
}
// ─── Per-Model Lockout Tracking ─────────────────────────────────────────────
// In-memory map: "provider:connectionId:model" → { reason, until, lockedAt }
const modelLockouts = new Map();
const modelFailureState = new Map();
// Aliases (e.g. "cx" → "codex") must share lockout state with their canonical
// provider, otherwise a model locked via one spelling stays routable via the other.
const canonicalProviderCache = new Map();
function getCanonicalLockProvider(provider) {
    let canonical = canonicalProviderCache.get(provider);
    if (!canonical) {
        canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider);
        canonicalProviderCache.set(provider, canonical);
    }
    return canonical;
}
function getModelLockKey(provider, connectionId, model, reason, status) {
    const canonicalProvider = getCanonicalLockProvider(provider);
    const lockModel = reason === "not_found" || status === 404 ? model : canonicalProvider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQuotaScopedModelForProvider"])(canonicalProvider, model) || model;
    return `${canonicalProvider}:${connectionId}:${lockModel}`;
}
const buildExactKey = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildExactModelLockKey"]; // see exactModelLock.ts
const getModelLockKeys = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createGetModelLockKeys"](getModelLockKey, getCanonicalLockProvider);
function getFailureWindowMs(profile = null, fallbackMs = 30 * 60 * 1000) {
    const configured = profile?.resetTimeoutMs;
    return typeof configured === "number" && configured > 0 ? configured : fallbackMs;
}
function cleanupModelLockKey(key, now = Date.now()) {
    const entry = modelLockouts.get(key);
    if (entry && now > entry.until) {
        modelLockouts.delete(key);
    }
    const failure = modelFailureState.get(key);
    if (!failure) return;
    // The escalation window extends past the applied cooldown: a model that fails
    // again right after its lockout expires must keep escalating, not reset to 1.
    if (now - failure.lastFailureAt <= failure.resetAfterMs + (failure.lastCooldownMs ?? 0)) return;
    if (modelLockouts.has(key)) return;
    modelFailureState.delete(key);
}
function getModelLockBaseCooldown(status, fallbackCooldownMs, profile = null) {
    if (Number.isFinite(fallbackCooldownMs) && fallbackCooldownMs > 0) {
        return fallbackCooldownMs;
    }
    if (typeof profile?.baseCooldownMs === "number" && profile.baseCooldownMs >= 0) {
        return profile.baseCooldownMs;
    }
    return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED ? getQuotaCooldown(0) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transientInitial;
}
function getScaledCooldown(baseCooldownMs, failureCount, maxBackoffLevel = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].maxLevel) {
    const safeBase = Number.isFinite(baseCooldownMs) && baseCooldownMs > 0 ? baseCooldownMs : 1000;
    const exponent = Math.min(Math.max(0, failureCount - 1), Math.max(0, maxBackoffLevel));
    return safeBase * Math.pow(2, exponent);
}
// Auto-cleanup expired lockouts every 15 seconds (lazy init for Cloudflare Workers compatibility)
let _cleanupTimer = null;
function ensureCleanupTimer() {
    if (_cleanupTimer) return;
    try {
        _cleanupTimer = setInterval(()=>{
            const now = Date.now();
            for (const key of modelLockouts.keys())cleanupModelLockKey(key, now);
            for (const key of modelFailureState.keys())cleanupModelLockKey(key, now);
            evictModelLockoutOverflow();
        }, 15_000);
        if (typeof _cleanupTimer === "object" && "unref" in _cleanupTimer) {
            _cleanupTimer.unref?.(); // Don't prevent process exit (Node.js only)
        }
    } catch  {
    // Cloudflare Workers may not support setInterval outside handlers — skip cleanup timer
    }
}
function evictModelLockoutOverflow() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$lockoutEviction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evictLockoutOverflow"])(modelLockouts, modelFailureState);
}
function getModelLockoutSize() {
    return modelLockouts.size;
}
function lockModel(provider, connectionId, model, reason, cooldownMs, metadata = {}) {
    if (!model) return; // No model → skip model-level locking
    ensureCleanupTimer();
    const key = getModelLockKey(provider, connectionId, model, reason);
    cleanupModelLockKey(key);
    const newUntil = Date.now() + cooldownMs;
    // Preserve the longer cooldown if an existing lock has more time remaining.
    // Safe without a mutex: no await between get/set, so this runs atomically
    // within Node.js's single-threaded event loop.
    const existing = modelLockouts.get(key);
    if (existing && existing.until > newUntil) {
        if (metadata.failureCount && metadata.failureCount > existing.failureCount) {
            existing.failureCount = metadata.failureCount;
            existing.lastFailureAt = metadata.lastFailureAt ?? existing.lastFailureAt;
            existing.resetAfterMs = metadata.resetAfterMs ?? existing.resetAfterMs;
            modelLockouts.set(key, existing);
        }
        return;
    }
    const now = Date.now();
    modelLockouts.set(key, {
        reason,
        until: newUntil,
        lockedAt: now,
        failureCount: metadata.failureCount ?? existing?.failureCount ?? 1,
        lastFailureAt: metadata.lastFailureAt ?? now,
        resetAfterMs: metadata.resetAfterMs ?? existing?.resetAfterMs ?? 0
    });
}
const lockExactModel = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLockExactModel"](modelLockouts, ensureCleanupTimer, cleanupModelLockKey, getCanonicalLockProvider);
function selectLockoutCooldownMs(parsedCooldownMs, settings) {
    if (typeof parsedCooldownMs === "number" && parsedCooldownMs > settings.baseCooldownMs) {
        return parsedCooldownMs;
    }
    return settings.useExponentialBackoff ? 0 : settings.baseCooldownMs;
}
function recordModelLockoutFailure(provider, connectionId, model, reason, status, fallbackCooldownMs, profile = null, options = {}) {
    ensureCleanupTimer();
    const key = options.scope === "exact" ? buildExactKey(getCanonicalLockProvider(provider), connectionId, model) : getModelLockKey(provider, connectionId, model, reason, status);
    const now = Date.now();
    cleanupModelLockKey(key, now);
    // For daily quota exhaustion (quota_exhausted), set cooldown until tomorrow 00:00
    // Use exactCooldownMs to bypass exponential backoff, ensuring precise lock until midnight
    if (reason === "quota_exhausted" && typeof options.exactCooldownMs !== "number") {
        options = {
            ...options,
            exactCooldownMs: getMsUntilTomorrow()
        };
    }
    const resetAfterMs = getFailureWindowMs(profile);
    const previous = modelFailureState.get(key);
    // Escalation window extends past the previously applied cooldown so a model
    // that fails again right after its lockout expires keeps escalating.
    const withinWindow = previous && now - previous.lastFailureAt <= previous.resetAfterMs + (previous.lastCooldownMs ?? 0);
    const failureCount = withinWindow ? previous.failureCount + 1 : 1;
    const baseCooldownMs = getModelLockBaseCooldown(status, fallbackCooldownMs, profile);
    // Cap both exponential backoff and computed exact cooldowns (e.g. daily-quota
    // until-midnight, #7940/#7980) against maxCooldownMs so user-configured caps are
    // honored — EXCEPT an authoritative parsed upstream reset (#6863, e.g. Antigravity
    // "Resets in 92h27m28s"), which the upstream told us to wait and must be honored
    // exactly, never clamped down to maxCooldownMs.
    const maxCooldownMs = typeof options.maxCooldownMs === "number" && options.maxCooldownMs > 0 ? options.maxCooldownMs : null;
    const cooldownMs = typeof options.exactCooldownMs === "number" && options.exactCooldownMs > 0 ? maxCooldownMs !== null && !options.exactCooldownIsUpstreamReset ? Math.min(options.exactCooldownMs, maxCooldownMs) : options.exactCooldownMs : Math.min(getScaledCooldown(baseCooldownMs, failureCount, profile?.maxBackoffSteps ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].maxLevel), maxCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].max);
    modelFailureState.set(key, {
        failureCount,
        lastFailureAt: now,
        resetAfterMs,
        lastCooldownMs: cooldownMs
    });
    const lockFn = options.scope === "exact" ? lockExactModel : lockModel;
    lockFn(provider, connectionId, model, reason, cooldownMs, {
        failureCount,
        lastFailureAt: now,
        resetAfterMs
    });
    return {
        cooldownMs,
        failureCount,
        resetAfterMs
    };
}
function clearModelLock(provider, connectionId, model) {
    if (!model) return false;
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearMultiKeyLock"](modelLockouts, modelFailureState, getModelLockKeys(provider, connectionId, model));
}
function hasPerModelQuota(provider, _model = null, connectionPassthroughModels) {
    // Connection-level override takes precedence (e.g., user-configured ModelScope)
    if (typeof connectionPassthroughModels === "boolean") {
        return connectionPassthroughModels;
    }
    if (!provider) return false;
    if (getCanonicalLockProvider(provider) === "antigravity") return true;
    if (getCanonicalLockProvider(provider) === "codex") return true;
    if (provider === "gemini" || provider === "github") return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPassthroughProviders"])().has(provider)) return true;
    if (isCompatibleProvider(provider)) return true;
    return false;
}
function lockModelIfPerModelQuota(provider, connectionId, model, reason, cooldownMs, connectionPassthroughModels) {
    if (!hasPerModelQuota(provider, model, connectionPassthroughModels) || !model) return false;
    // Skip model-level lock if the entire provider is in circuit-breaker cooldown.
    // The provider cooldown already prevents all requests, so a model lock is redundant.
    if (isProviderInCooldown(provider)) return false;
    const lockFn = getCanonicalLockProvider(provider) === "antigravity" ? lockExactModel : lockModel;
    lockFn(provider, connectionId, model, reason, cooldownMs);
    return true;
}
function shouldMarkAccountExhaustedFrom429(provider, model = null, connectionPassthroughModels, failureKind) {
    // A plain 429 means transient rate limiting / high traffic for many OAuth providers.
    // Only connection-poison the quota cache when the upstream body explicitly says
    // the long-window quota is exhausted; otherwise fallback should try another account
    // without making this one look quota-depleted for 5 minutes.
    if (failureKind === "rate_limit" || failureKind === "transient") return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldPreserveQuotaSignals"])(provider) && !hasPerModelQuota(provider, model, connectionPassthroughModels);
}
function classifyLockoutReason(status) {
    if (status === 429) return "rate_limit";
    if (status === 403) return "quota_exhausted";
    return "unknown";
}
function decayModelFailureCount(provider, connectionId, model) {
    const key = getModelLockKey(provider, connectionId, model);
    const failure = modelFailureState.get(key);
    if (!failure) return {
        cleared: false,
        newFailureCount: 0
    };
    const newFailureCount = Math.floor(failure.failureCount / 2);
    if (newFailureCount === 0) {
        modelFailureState.delete(key);
        return {
            cleared: true,
            newFailureCount: 0
        };
    } else {
        modelFailureState.set(key, {
            ...failure,
            failureCount: newFailureCount
        });
        return {
            cleared: false,
            newFailureCount
        };
    }
}
function clearAllModelLockouts() {
    modelLockouts.clear();
    modelFailureState.clear();
}
function isModelLocked(provider, connectionId, model) {
    if (!model) return false;
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAnyKeyLocked"](modelLockouts, cleanupModelLockKey, getModelLockKeys(provider, connectionId, model));
}
function getModelLockoutInfo(provider, connectionId, model) {
    if (!model) return null;
    const entry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findLatestLockEntry"](modelLockouts, cleanupModelLockKey, getModelLockKeys(provider, connectionId, model));
    if (!entry) return null;
    return {
        reason: entry.reason,
        remainingMs: entry.until - Date.now(),
        lockedAt: new Date(entry.lockedAt).toISOString(),
        failureCount: entry.failureCount
    };
}
function getAllModelLockouts() {
    const now = Date.now();
    const active = [];
    for (const key of modelLockouts.keys()){
        cleanupModelLockKey(key, now);
    }
    for (const [key, entry] of modelLockouts){
        const [provider, connectionId, ...modelParts] = key.split(":");
        const model = modelParts.join(":");
        active.push({
            provider,
            connectionId,
            model,
            reason: entry.reason,
            remainingMs: entry.until - now,
            failureCount: entry.failureCount,
            lockedAt: new Date(entry.lockedAt).toISOString(),
            until: entry.until
        });
    }
    return active;
}
function getProviderBreaker(provider) {
    return provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider) : null;
}
function configureProviderBreaker(provider, profile) {
    if (!provider) return null;
    const resolvedProfile = {
        ...getProviderProfile(provider),
        ...profile
    };
    // Issue #2100 follow-up: resolve useUpstream429BreakerHints from the
    // provider profile (stored override) or fall back to per-provider default.
    // Stored value type is `boolean | undefined` — never `null` after PATCH.
    const userValue = resolvedProfile.useUpstream429BreakerHints;
    const useHints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveUseUpstream429BreakerHints"])(provider, userValue);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider, {
        failureThreshold: resolvedProfile.failureThreshold ?? resolvedProfile.circuitBreakerThreshold,
        resetTimeout: resolvedProfile.resetTimeoutMs ?? resolvedProfile.circuitBreakerReset,
        ...useHints ? {
            cooldownByKind: {
                rate_limit: 60_000,
                quota_exhausted: 3_600_000
            },
            classifyError: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classify429FromError"]
        } : {},
        degradationThreshold: resolvedProfile.degradationThreshold,
        maxBackoffMultiplier: resolvedProfile.maxBackoffMultiplier,
        backoffEscalationCount: resolvedProfile.backoffEscalationCount
    });
}
function isProviderInCooldown(provider) {
    const breaker = getProviderBreaker(provider);
    return breaker ? !breaker.canExecute() : false;
}
function getProviderCooldownRemainingMs(provider) {
    const breaker = getProviderBreaker(provider);
    if (!breaker || breaker.canExecute()) return null;
    const remaining = breaker.getRetryAfterMs();
    return remaining > 0 ? remaining : null;
}
function getProviderBreakerState(provider) {
    const breaker = getProviderBreaker(provider);
    return breaker?.getStatus?.() ?? null;
}
function recordProviderFailure(provider, log, connectionId, profile) {
    if (!provider) return;
    // Deduplicate rapid-fire failures from the same connection
    if (connectionId) {
        const dedupKey = `${provider}:${connectionId}`;
        const now = Date.now();
        const lastFailure = lastConnectionFailure.get(dedupKey);
        if (lastFailure && now - lastFailure < CONNECTION_FAILURE_DEDUP_MS) {
            return;
        }
        lastConnectionFailure.delete(dedupKey);
        lastConnectionFailure.set(dedupKey, now);
        pruneConnectionFailureDedupeEntries();
    }
    const breaker = configureProviderBreaker(provider, profile);
    if (!breaker) return;
    if (!breaker.canExecute()) return;
    breaker._onFailure();
    if (!breaker.canExecute()) {
        log?.warn?.(`[ProviderFailure] ${provider}: circuit breaker opened after repeated failures`);
    }
}
function clearProviderFailure(provider) {
    const breaker = getProviderBreaker(provider);
    breaker?.reset();
}
function getProvidersInCooldown() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllCircuitBreakerStatuses"])().filter((status)=>{
        const breaker = getProviderBreaker(status.name);
        return Boolean(breaker && !breaker.canExecute());
    }).map((status)=>({
            provider: status.name,
            failureCount: status.failureCount,
            cooldownRemainingMs: status.retryAfterMs || null,
            lastFailureAt: status.lastFailureTime
        }));
}
function isProviderFailureCode(status) {
    return PROVIDER_FAILURE_ERROR_CODES.has(status);
}
function isProviderExhaustedReason(result) {
    if (result.creditsExhausted || result.dailyQuotaExhausted) return true;
    return result.reason === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
}
function parseRetryAfterFromBody(responseBody) {
    let body;
    try {
        body = toJsonRecord(typeof responseBody === "string" ? JSON.parse(responseBody) : responseBody);
    } catch  {
        return {
            retryAfterMs: null,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (Object.keys(body).length === 0) {
        return {
            retryAfterMs: null,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    // Gemini: { error: { details: [{ retryDelay: "33s" }] } }
    const error = toJsonRecord(body.error);
    const details = error.details || body.details || [];
    for (const detail of Array.isArray(details) ? details : []){
        const detailRecord = toJsonRecord(detail);
        if (detailRecord.retryDelay) {
            return {
                retryAfterMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDelayString"])(detailRecord.retryDelay),
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
            };
        }
    }
    // OpenAI: "Please retry after 20s" in message
    const msg = String(error.message || body.message || "");
    const retryMatch = /retry\s+after\s+(\d+)\s*s/i.exec(msg);
    if (retryMatch) {
        return {
            retryAfterMs: Number.parseInt(retryMatch[1], 10) * 1000,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
        };
    }
    // Anthropic: error type classification
    const errorType = String(error.type || body.type || "");
    if (errorType === "rate_limit_error") {
        return {
            retryAfterMs: null,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
        };
    }
    // Classify by error message keywords
    const reason = classifyErrorText(msg || errorType);
    return {
        retryAfterMs: null,
        reason
    };
}
function parseRetryFromErrorText(errorText) {
    if (!errorText || typeof errorText !== "string") return null;
    const msg = String(errorText);
    const bodyHintMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRetryHintFromJsonBody"])(msg, MAX_PROVIDER_COOLDOWN_MS);
    if (bodyHintMs !== null) return bodyHintMs;
    // Gemini free-tier text fallback (no parseable JSON details present):
    // "Please retry in 26.660853464s." Short throttle hint — capped independently of
    // MAX_PROVIDER_COOLDOWN_MS, mirroring the JSON RetryInfo.retryDelay cap (#7940).
    const pleaseRetryMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDelayString"])(/please retry in\s+([\d.]+\s*s)/i.exec(msg)?.[1]);
    if (pleaseRetryMs !== null && pleaseRetryMs > 0) {
        return Math.min(pleaseRetryMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_SHORT_RETRY_HINT_MS"]);
    }
    // Issue #2321: parse embedded absolute ISO retry timestamps.
    const isoMatch = /\b(?:try again at|wait until|reset(?:s)? at|available at|retry after)\s+(\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/i.exec(msg);
    if (isoMatch) {
        const parsedTs = Date.parse(isoMatch[1]);
        if (Number.isFinite(parsedTs)) {
            const waitMs = parsedTs - Date.now();
            if (waitMs > 0) return waitMs;
        }
    }
    const match = /reset after (\d+h)?(\d+m)?(\d+s)?/i.exec(msg);
    if (match?.[1] || match?.[2] || match?.[3]) return computeDurationMs(match);
    // Variant without "reset after": "will reset after XhYmZs"
    const altMatch = /will reset after (\d+h)?(\d+m)?(\d+s)?/i.exec(msg);
    if (altMatch?.[1] || altMatch?.[2] || altMatch?.[3]) return computeDurationMs(altMatch);
    // Antigravity / Cloud Code phrasing: "Resets in 164h27m24s".
    const resetsInMatch = /resets? in (\d+h)?(\d+m)?(\d+s)?/i.exec(msg);
    if (resetsInMatch?.[1] || resetsInMatch?.[2] || resetsInMatch?.[3]) {
        return computeDurationMs(resetsInMatch);
    }
    // Gemini phrasing: "Please retry in 54.472178091s" (fractional seconds).
    const retryInSecMatch = /please retry in (\d+(?:\.\d+)?)\s*s/i.exec(msg);
    if (retryInSecMatch?.[1]) {
        const sec = Number.parseFloat(retryInSecMatch[1]);
        if (Number.isFinite(sec) && sec > 0) {
            return Math.min(Math.round(sec * 1000), MAX_PROVIDER_COOLDOWN_MS);
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDayGranularityResetMs"])(msg, MAX_PROVIDER_COOLDOWN_MS);
}
/**
 * Compute total milliseconds from regex match groups (Xh)(Ym)(Zs)
 * Capped at 30 days to prevent adversarial/buggy upstream from locking indefinitely.
 */ const MAX_PROVIDER_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
function computeDurationMs(match) {
    let totalMs = 0;
    if (match[1]) totalMs += Number.parseInt(match[1], 10) * 3600 * 1000; // hours
    if (match[2]) totalMs += Number.parseInt(match[2], 10) * 60 * 1000; // minutes
    if (match[3]) totalMs += Number.parseInt(match[3], 10) * 1000; // seconds
    return totalMs > 0 ? Math.min(totalMs, MAX_PROVIDER_COOLDOWN_MS) : null;
}
function classifyErrorText(errorText) {
    if (!errorText) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
    const lower = String(errorText).toLowerCase();
    if (lower.includes("quota exceeded") || lower.includes("quota depleted") || lower.includes("quota will reset") || lower.includes("your quota will reset") || lower.includes("quota has been exceeded") || lower.includes("hour quota") || lower.includes("billing") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looksLikeQuotaExhausted"])(lower) || // Issue #2321: Anthropic OAuth (Claude Code Pro/Team) 429 bodies surface
    // the subscription quota with phrases that contain neither "quota" nor
    // "billing". Without these patterns the error was classified as a
    // transient RATE_LIMIT_EXCEEDED (~5s base cooldown), which cascades all
    // Pro accounts into a tight retry loop until the 5h window resets.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSubscriptionQuotaText"])(lower)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
    }
    // T10: credits_exhausted signals
    if (isCreditsExhausted(lower)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
    }
    // T06: account_deactivated signals
    if (isAccountDeactivated(lower)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR;
    }
    const configuredRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matchErrorRuleByText"])(errorText);
    if (configuredRule?.reason) return configuredRule.reason;
    if (lower.includes("rate_limit")) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED;
    if (lower.includes("resource exhausted") || lower.includes("high demand")) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].MODEL_CAPACITY;
    if (lower.includes("unauthorized") || lower.includes("invalid api key") || lower.includes("authentication")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR;
    }
    if (lower.includes("server error") || lower.includes("internal error")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].SERVER_ERROR;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
}
function classifyError(status, errorText, context) {
    // Provider-specific rules take priority — they have the most accurate signal
    // (e.g. `x-ratelimit-remaining-requests: 0` is irrefutable account exhaustion).
    if (context?.provider) {
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderErrorRuleMatch"])(context.provider, status, context.headers ?? null, context.body);
        if (match) return match.reason;
    }
    // Text classification takes priority (more specific)
    const textReason = classifyErrorText(errorText);
    if (textReason !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN) return textReason;
    // Fall back to status code
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].UNAUTHORIZED || status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR;
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].PAYMENT_REQUIRED) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED;
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE || status === 529) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].MODEL_CAPACITY;
    }
    if (status >= 500) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].SERVER_ERROR;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
}
function getMsUntilTomorrow() {
    const nowMs = Date.now();
    const tomorrow = new Date(nowMs);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const ms = tomorrow.getTime() - nowMs;
    // Guard against DST edge cases: if ms is negative (shouldn't happen) or
    // unreasonably large (>25h due to spring-forward), cap at 24 hours.
    return ms > 0 && ms <= 25 * 60 * 60 * 1000 ? ms : 24 * 60 * 60 * 1000;
}
function isDailyQuotaExhausted(errorText) {
    if (!errorText) return false;
    const lower = errorText.toLowerCase();
    return lower.includes("today's quota") || lower.includes("daily quota") || lower.includes("try again tomorrow");
}
function getBackoffDuration(failureCount) {
    const idx = Math.min(failureCount, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BACKOFF_STEPS_MS"].length - 1);
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BACKOFF_STEPS_MS"][idx];
}
function getQuotaCooldown(backoffLevel = 0) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateBackoffCooldown"])(backoffLevel);
}
function checkFallbackError(status, errorText, backoffLevel = 0, _model = null, provider = null, headers = null, profileOverride = null, structuredError, rotation) {
    const svc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serviceSupervisorCooldown"])(status, headers);
    if (svc) return svc;
    const rg = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rotationConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gateFor"](status, rotation?.account);
    if (rg) return rg;
    const errorStr = (errorText || "").toString();
    const profile = profileOverride ?? (provider ? getProviderProfile(provider) : null);
    const maxBackoffSteps = profile?.maxBackoffSteps ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].maxLevel;
    const retryableStatuses = new Set([
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].REQUEST_TIMEOUT,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVER_ERROR,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT
    ]);
    function parseResetFromHeaders(headers) {
        if (!headers) return null;
        const recordHeaders = headers;
        // Retry-After header
        const retryAfter = typeof headers.get === "function" ? headers.get("retry-after") : recordHeaders["retry-after"] || recordHeaders["Retry-After"];
        if (retryAfter) {
            const seconds = Number.parseInt(retryAfter, 10);
            if (!Number.isNaN(seconds) && String(seconds) === String(retryAfter).trim()) {
                return Date.now() + seconds * 1000;
            }
            const date = new Date(retryAfter);
            if (!Number.isNaN(date.getTime())) return date.getTime();
        }
        // X-RateLimit-Reset
        const rlReset = typeof headers.get === "function" ? headers.get("x-ratelimit-reset") : recordHeaders["x-ratelimit-reset"] || recordHeaders["X-RateLimit-Reset"];
        if (rlReset) {
            const ts = Number.parseInt(rlReset, 10);
            if (!Number.isNaN(ts)) {
                return ts > 10000000000 ? ts : ts * 1000;
            }
        }
        return null;
    }
    function getUpstreamRetryHintMs() {
        if (!profile?.useUpstreamRetryHints) return null;
        const resetTime = parseResetFromHeaders(headers);
        if (resetTime) {
            const waitMs = Math.max(resetTime - Date.now(), 0);
            if (waitMs > 0) return waitMs;
        }
        const retryFromErrorText = parseRetryFromErrorText(errorStr);
        if (retryFromErrorText && retryFromErrorText > 0) {
            return retryFromErrorText;
        }
        return null;
    }
    function getScaledBaseCooldown(reason, level = backoffLevel) {
        void reason;
        const baseCooldownMs = typeof profile?.baseCooldownMs === "number" && profile.baseCooldownMs >= 0 ? profile.baseCooldownMs : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transientInitial;
        // #8396: cap against profile.maxCooldownMs, mirroring the model-lockout path.
        return {
            baseCooldownMs,
            cooldownMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$cooldownCap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capScaledCooldownMs"])(getScaledCooldown(baseCooldownMs, level + 1, maxBackoffSteps), profile?.maxCooldownMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].max),
            newBackoffLevel: Math.min(level + 1, maxBackoffSteps)
        };
    }
    function buildRetryableFallback(reason) {
        const upstreamRetryHintMs = getUpstreamRetryHintMs();
        if (typeof upstreamRetryHintMs === "number" && upstreamRetryHintMs > 0) {
            return {
                shouldFallback: true,
                cooldownMs: upstreamRetryHintMs,
                baseCooldownMs: upstreamRetryHintMs,
                newBackoffLevel: 0,
                usedUpstreamRetryHint: true,
                reason
            };
        }
        const ro = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rotationConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["overrideFor"](reason, rotation?.account);
        if (ro) return ro;
        const scaled = getScaledBaseCooldown(reason, backoffLevel);
        return {
            shouldFallback: true,
            cooldownMs: scaled.cooldownMs,
            baseCooldownMs: scaled.baseCooldownMs,
            newBackoffLevel: scaled.newBackoffLevel,
            usedUpstreamRetryHint: false,
            reason
        };
    }
    const isRateLimitStatus = status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED;
    const preserveQuota429 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldPreserveQuotaSignals"])(provider, errorText);
    const shouldUseQuotaSignal = !isRateLimitStatus || preserveQuota429;
    // Check error message FIRST - specific patterns take priority over status codes
    if (errorText) {
        // T06 (sub2api #1037): Permanent account deactivation — do NOT retry, mark as permanent failure
        if (isAccountDeactivated(errorStr)) {
            return {
                shouldFallback: true,
                cooldownMs: 365 * 24 * 60 * 60 * 1000,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR,
                permanent: true
            };
        }
        // Gemini-specific check — MUST run before isCreditsExhausted/
        // isDailyQuotaExhausted/the generic text classifier below: Gemini's free-
        // tier 429 boilerplate literally says "You exceeded your current quota,
        // please check your plan and billing details" for EVERY limit type
        // (RPM/TPM/RPD alike), which collides with CREDITS_EXHAUSTED_SIGNALS'
        // `"exceeded your current quota"` entry (added for OpenAI-style terminal
        // billing errors) — that generic check would otherwise short-circuit
        // straight to QUOTA_EXHAUSTED before this Gemini-specific block ever runs
        // (#7360). Gated on provider === "gemini" so it cannot affect any other
        // provider's genuine credits-exhausted classification.
        //
        // Preference order:
        //  1. The upstream error text's own metric name (authoritative — it is
        //     Google's own signal, e.g. "...free_tier_input_token_count..." = TPM).
        //     Required because the local per-model counters below only increment
        //     on a SUCCESSFUL response; a request that gets rejected — especially
        //     the first of several concurrent requests racing to trip the same
        //     per-minute limit — never contributes to the counter, so it can read
        //     0 at the exact moment it needs to report exhaustion.
        //  2. Local per-model counters, when the text names no metric.
        if (provider === "gemini" && status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && _model) {
            const metricClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classifyGeminiQuotaMetricFromText"])(errorStr);
            if (metricClass === "rpd") {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED);
            }
            if (metricClass === "rpm" || metricClass === "tpm") {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRpdExhausted"])(_model)) {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRpmExhausted"])(_model)) {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTpmExhausted"])(_model)) {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
            }
        }
        // T10 (sub2api #1169) + #8247: credits/quota exhausted; *-compatible-* nicknames stay model-scoped.
        if (shouldUseQuotaSignal && isCreditsExhausted(errorStr) && !isCompatibleProvider(provider)) {
            return {
                shouldFallback: true,
                cooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].paymentRequired ?? 3600 * 1000,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED,
                creditsExhausted: true
            };
        }
        // Daily quota exhausted — lock model until tomorrow
        if (shouldUseQuotaSignal && isDailyQuotaExhausted(errorStr)) {
            const msUntilTomorrow = getMsUntilTomorrow();
            // Cap at 24 hours to handle timezone edge cases
            const cooldownMs = Math.min(msUntilTomorrow, 24 * 60 * 60 * 1000);
            return {
                shouldFallback: true,
                cooldownMs,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED,
                dailyQuotaExhausted: true
            };
        }
        // Issue #2321 (5h subscription quota) + Issue #3709 (ollama-cloud weekly
        // cap): both classifiers live in quotaTextCooldowns.ts (this file is
        // frozen at its file-size-baseline cap). The weekly check runs
        // UNCONDITIONALLY (not gated by shouldUseQuotaSignal) because it targets
        // apikey-category providers like ollama-cloud, which the oauth-only
        // shouldUseQuotaSignal gate deliberately excludes from the subscription
        // check above.
        if (shouldUseQuotaSignal && !isCreditsExhausted(errorStr) && !isDailyQuotaExhausted(errorStr)) {
            const subResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSubscriptionQuotaFallback"])(errorStr, getUpstreamRetryHintMs, parseRetryFromErrorText, provider);
            if (subResult) return subResult;
        }
        const weeklyResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildWeeklyQuotaFallback"])(errorStr);
        if (weeklyResult) return weeklyResult;
        // Issue #7071 (session usage cap) is the same sibling gap as #3709 above —
        // runs UNCONDITIONALLY for the same reason: apikey-category providers
        // like ollama-cloud are excluded from the oauth-only shouldUseQuotaSignal
        // gate.
        const sessionResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSessionQuotaFallback"])(errorStr);
        if (sessionResult) return sessionResult;
        const quotaResetHintMs = parseRetryFromErrorText(errorStr);
        if (shouldUseQuotaSignal && quotaResetHintMs && classifyErrorText(errorStr) === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED) {
            const fallbackResult = buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED);
            return {
                ...fallbackResult,
                quotaResetHintMs
            };
        }
        // #2929: A route-restriction 403 (e.g. Fireworks Fire Pass keys returning
        // "Fire Pass API keys are not authorized for this route." on the /models
        // endpoint) means the key is valid but lacks access to THIS route — it still
        // serves chat. It must NOT cool down the connection or be classified as an
        // auth error, otherwise a single model-listing 403 marks the key unavailable.
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN && errorStr.toLowerCase().includes("not authorized for this route")) {
            return {
                shouldFallback: false,
                cooldownMs: 0,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
            };
        }
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN && provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "apikey" && !errorStr.toLowerCase().includes("has not been used in project") && !errorStr.toLowerCase().includes("hour quota") && !errorStr.toLowerCase().includes("quota has been exceeded")) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$nonRetryableUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveApiKeyForbiddenFallback"])(errorStr, buildRetryableFallback, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR);
        }
    }
    const configuredRule = isRateLimitStatus && !preserveQuota429 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matchErrorRuleByStatus"])(status) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findMatchingErrorRule"])(status, errorStr);
    if (configuredRule) {
        if (configuredRule.backoff) {
            // Provider-specific rules in `providerRuleRegistry` are MORE SPECIFIC
            // than the configured (global) rule, so we check them first. If a
            // provider rule matches, it overrides the configured rule's reason
            // (e.g. Opencode's `x-ratelimit-remaining-requests: 0` overrides
            // 429 → RATE_LIMIT_EXCEEDED). We do NOT call the full `classifyError`
            // here because its global status fallback would otherwise override
            // specific configured reasons (e.g. 503 → SERVER_ERROR would be
            // shadowed by 503 → MODEL_CAPACITY).
            const providerMatch = provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderErrorRuleMatch"])(provider, status, headers, structuredError ?? null) : null;
            const reason = providerMatch ? providerMatch.reason : configuredRule.reason ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
            // Fix C: thread `providerMatch.cooldownMs` through so a configured rule
            // like the "Monthly usage limit reached. Resets in N days." matcher can
            // declare an explicit cooldown (e.g. 13 days) and have it win over the
            // scaled backoff default returned by `buildRetryableFallback`. Without
            // this, the rule's reason is used but its cooldownMs is silently
            // dropped — which is exactly the user-visible bug where a 13-day
            // upstream quota reset was being treated as ~60s.
            const providerCooldownMs = providerMatch?.cooldownMs !== undefined && providerMatch.cooldownMs > 0 ? providerMatch.cooldownMs : undefined;
            const fallback = buildRetryableFallback(reason);
            if (providerCooldownMs !== undefined) {
                return {
                    ...fallback,
                    cooldownMs: providerCooldownMs,
                    baseCooldownMs: providerCooldownMs,
                    configuredCooldownMs: providerCooldownMs
                };
            }
            return fallback;
        }
        // #6842: non-backoff configured rules (e.g. status_402) previously never
        // consulted providerRuleRegistry, so a provider-specific rule (like
        // OpenRouter's credit-exhausted 402 lock) could never override the
        // generic zero-cooldown default. Mirror the backoff branch above so
        // provider rules win on cooldown/reason regardless of `backoff`.
        const providerMatch = provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderErrorRuleMatch"])(provider, status, headers, structuredError ?? null) : null;
        const cooldownMs = providerMatch?.cooldownMs ?? configuredRule.cooldownMs ?? 0;
        return {
            shouldFallback: true,
            cooldownMs,
            baseCooldownMs: cooldownMs,
            configuredCooldownMs: cooldownMs,
            reason: providerMatch?.reason ?? configuredRule.reason ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].NOT_ACCEPTABLE || retryableStatuses.has(status)) {
        return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].SERVER_ERROR);
    }
    // 400 — context overflow / malformed request / model access denied
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST) {
        // Check structured error codes first (more reliable, no false positives)
        // OpenAI:  error.code === "model_not_found"
        // Anthropic: error.type === "not_found_error" / "permission_error"
        const structuredCode = typeof structuredError?.code === "string" ? structuredError.code.toLowerCase() : "";
        const structuredType = typeof structuredError?.type === "string" ? structuredError.type.toLowerCase() : "";
        // A clear bad-credential error must never be reclassified as model-access
        // (which would silently exhaust every combo target). Structured detection
        // below still catches genuine model_not_found / not_found_error codes.
        const looksLikeAuthCredentialError = AUTH_CREDENTIAL_ERROR_PATTERNS.some((p)=>p.test(errorStr));
        const matchesModelAccessPattern = !looksLikeAuthCredentialError && MODEL_ACCESS_DENIED_PATTERNS.some((p)=>p.test(errorStr));
        const isModelAccessDeniedStructured = !!structuredError && (MODEL_ACCESS_DENIED_CODES.has(structuredCode) || MODEL_ACCESS_DENIED_TYPES.has(structuredType) || MODEL_ACCESS_AMBIGUOUS_TYPES.has(structuredType) && matchesModelAccessPattern);
        const isOverflow = CONTEXT_OVERFLOW_PATTERNS.some((p)=>p.test(errorStr));
        const isMalformed = MALFORMED_REQUEST_PATTERNS.some((p)=>p.test(errorStr));
        const isParamValidation = PARAM_VALIDATION_PATTERNS.some((p)=>p.test(errorStr));
        const isModelAccessDenied = isModelAccessDeniedStructured || matchesModelAccessPattern;
        const isNimDegraded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNimFunctionDegraded"])(errorStr);
        if (isOverflow || isMalformed || isParamValidation || isModelAccessDenied || isNimDegraded) {
            return {
                shouldFallback: true,
                cooldownMs: 0,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].MODEL_CAPACITY
            };
        }
        // Some providers (e.g. MiMoCode) signal throttling with a non-standard 400 whose
        // body carries rate-limit semantics ("Detected high-frequency non-compliant
        // requests from you.") instead of a 429. Detected here (AFTER malformed/overflow
        // detection above, so a genuinely malformed 400 still wins and keeps its #2101
        // zero-cooldown MODEL_CAPACITY classification), it is fallback-worthy at
        // connection-cooldown scope so combo can fail over to another target (#4976).
        if (RATE_LIMIT_TEXT_PATTERNS.some((p)=>p.test(errorStr))) {
            return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
        }
        // Generic 400 is not account-fallback-worthy. Combo routing may still try a
        // different provider/model because combo fallback is target-level orchestration.
        return {
            shouldFallback: false,
            cooldownMs: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    // All other errors - fallback with transient cooldown
    return {
        shouldFallback: true,
        cooldownMs: profile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transient,
        baseCooldownMs: profile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transient,
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
    };
}
function cooldownUntilMs(value) {
    if (value === null || value === undefined || value === "") return NaN;
    if (value instanceof Date) return value.getTime();
    if (typeof value === "number") return value;
    const raw = value.trim();
    if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);
    return new Date(raw).getTime();
}
function isAccountUnavailable(unavailableUntil) {
    if (!unavailableUntil) return false;
    const ms = cooldownUntilMs(unavailableUntil);
    return Number.isFinite(ms) && ms > Date.now();
}
function getUnavailableUntil(cooldownMs) {
    return new Date(Date.now() + cooldownMs).toISOString();
}
function getEarliestRateLimitedUntil(accounts) {
    let earliest = null;
    const now = Date.now();
    for (const acc of accounts){
        if (!acc.rateLimitedUntil) continue;
        const until = cooldownUntilMs(acc.rateLimitedUntil);
        if (!Number.isFinite(until) || until <= now) continue;
        if (!earliest || until < earliest) earliest = until;
    }
    if (!earliest) return null;
    return new Date(earliest).toISOString();
}
function formatRetryAfter(rateLimitedUntil) {
    if (!rateLimitedUntil) return "";
    const diffMs = new Date(rateLimitedUntil).getTime() - Date.now();
    if (diffMs <= 0) return "reset after 0s";
    const totalSec = Math.ceil(diffMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor(totalSec % 3600 / 60);
    const s = totalSec % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return `reset after ${parts.join(" ")}`;
}
function filterAvailableAccounts(accounts, excludeId = null) {
    const now = Date.now();
    return accounts.filter((acc)=>{
        if (excludeId && acc.id === excludeId) return false;
        if (acc.rateLimitedUntil) {
            const until = cooldownUntilMs(acc.rateLimitedUntil);
            if (Number.isFinite(until) && until > now) return false;
        }
        return true;
    });
}
function resetAccountState(account) {
    if (!account) return account;
    // Persist the cooldown clear so a successfully-retried connection is no longer
    // marked as rate-limited in `provider_connections.rate_limited_until`. Mirrors
    // Fix A: the in-memory AccountState and the DB row must agree so the cascade
    // survives the request boundary and `clearStaleCrashCooldowns` doesn't have
    // to rediscover what we already know is healthy.
    // Best-effort: a DB write failure must not crash the request path.
    const connId = account?.id;
    if (typeof connId === "string" && connId.length > 0) {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setConnectionRateLimitUntil"])(connId, null);
        } catch  {
        // ignore — best effort
        }
    }
    return {
        ...account,
        rateLimitedUntil: null,
        backoffLevel: 0,
        lastError: null,
        status: "active"
    };
}
function applyErrorState(account, status, errText, prov = null) {
    if (!account) return account;
    const lvl = account.backoffLevel || 0;
    const fallbackDecision = checkFallbackError(status, errText, lvl, null, prov, null, null, null, {
        account
    });
    const { cooldownMs, reason } = fallbackDecision;
    const newBackoffLevel = "newBackoffLevel" in fallbackDecision ? fallbackDecision.newBackoffLevel : undefined;
    // Cooldown may be overridden by a configured provider rule (see
    // `accountFallback.ts:1511-1540` provider-match branch + the
    // `providerMatch.cooldownMs` thread-through added by Fix C). When the
    // configured rule sets an explicit cooldownMs, it wins over the scaled
    // backoff default that `checkFallbackError` returned.
    const configuredCooldownMs = "configuredCooldownMs" in fallbackDecision ? fallbackDecision.configuredCooldownMs : undefined;
    const effectiveCooldownMs = typeof configuredCooldownMs === "number" && configuredCooldownMs > 0 ? configuredCooldownMs : cooldownMs;
    const nextState = {
        ...account,
        rateLimitedUntil: effectiveCooldownMs > 0 ? getUnavailableUntil(effectiveCooldownMs) : null,
        backoffLevel: newBackoffLevel ?? lvl,
        lastError: {
            status,
            message: errText,
            timestamp: new Date().toISOString(),
            reason
        },
        status: "error"
    };
    // Persist the cooldown to `provider_connections.rate_limited_until` so the
    // cascade survives the request boundary. Before Fix A the cooldown only
    // lived in the in-memory AccountState object returned here, which was
    // discarded the moment the request ended — the same exhausted key was
    // re-picked on the very next request.
    // Best-effort try/catch mirrors `open-sse/executors/antigravity.ts:343`
    // (`markConnectionQuotaExhausted`) so a DB failure can never crash the
    // chat path. See issue #1 (per-account 429 cascade not persisting).
    const connId = account?.id;
    if (typeof connId === "string" && connId.length > 0 && effectiveCooldownMs > 0 && nextState.rateLimitedUntil) {
        try {
            const untilMs = cooldownUntilMs(nextState.rateLimitedUntil);
            if (Number.isFinite(untilMs) && untilMs > Date.now()) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setConnectionRateLimitUntil"])(connId, untilMs);
            }
        } catch  {
        // ignore — best effort
        }
    }
    return nextState;
}
;
function getAccountHealth(account, model) {
    if (!account) return 0;
    let score = 100;
    score -= (account.backoffLevel || 0) * 10;
    if (account.lastError) score -= 20;
    if (account.rateLimitedUntil && isAccountUnavailable(account.rateLimitedUntil)) score -= 30;
    return Math.max(0, score);
}
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1uv2dlz._.js.map