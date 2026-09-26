module.exports = [
"[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS,
    "DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS",
    ()=>DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS,
    "DEFAULT_FETCH_CONNECT_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_CONNECT_TIMEOUT_MS,
    "DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_FETCH_TIMEOUT_MS",
    ()=>DEFAULT_FETCH_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS,
    "DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS",
    ()=>DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS,
    "DEFAULT_SSE_HEARTBEAT_INTERVAL_MS",
    ()=>DEFAULT_SSE_HEARTBEAT_INTERVAL_MS,
    "DEFAULT_STREAM_IDLE_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS,
    "DEFAULT_STREAM_READINESS_TIMEOUT_MS",
    ()=>DEFAULT_STREAM_READINESS_TIMEOUT_MS,
    "MAX_TIMER_TIMEOUT_MS",
    ()=>MAX_TIMER_TIMEOUT_MS,
    "getApiBridgeTimeoutConfig",
    ()=>getApiBridgeTimeoutConfig,
    "getMainServerTimeoutConfig",
    ()=>getMainServerTimeoutConfig,
    "getStainlessTimeoutSeconds",
    ()=>getStainlessTimeoutSeconds,
    "getTlsClientTimeoutConfig",
    ()=>getTlsClientTimeoutConfig,
    "getUpstreamTimeoutConfig",
    ()=>getUpstreamTimeoutConfig
]);
const DEFAULT_FETCH_TIMEOUT_MS = 600_000;
const DEFAULT_STREAM_IDLE_TIMEOUT_MS = 600_000;
const MAX_TIMER_TIMEOUT_MS = 2_147_483_647;
const DEFAULT_SSE_HEARTBEAT_INTERVAL_MS = 15_000;
const DEFAULT_STREAM_READINESS_TIMEOUT_MS = 80_000;
const DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS = 180_000;
const DEFAULT_FETCH_CONNECT_TIMEOUT_MS = 30_000;
const DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS = 4_000;
const DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS = 600_000;
const DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS = 300_000;
const DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS = 60_000;
const DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS = 5_000;
const DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS = 0;
const DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS = 65_000;
const DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS = 66_000;
function hasEnvValue(env, name) {
    const raw = env[name];
    return raw != null && raw.trim() !== "";
}
function readTimeoutMs(env, name, defaultValue, options = {}) {
    const raw = env[name];
    if (raw == null || raw.trim() === "") return defaultValue;
    const parsed = Number(raw);
    const isValid = Number.isFinite(parsed) && (options.allowZero ? parsed >= 0 : parsed > 0);
    if (!isValid) {
        options.logger?.(`Invalid ${name}="${raw}". Using default ${defaultValue}ms.`);
        return defaultValue;
    }
    return Math.floor(parsed);
}
function getUpstreamTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const fetchTimeoutMs = readTimeoutMs(env, "FETCH_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamIdleTimeoutMs = readTimeoutMs(env, "STREAM_IDLE_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_IDLE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_STREAM_READINESS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const streamReadinessMaxTimeoutMs = readTimeoutMs(env, "STREAM_READINESS_MAX_TIMEOUT_MS", DEFAULT_STREAM_READINESS_MAX_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const sseHeartbeatIntervalMs = readTimeoutMs(env, "SSE_HEARTBEAT_INTERVAL_MS", DEFAULT_SSE_HEARTBEAT_INTERVAL_MS, {
        allowZero: true,
        logger
    });
    return {
        fetchTimeoutMs,
        streamIdleTimeoutMs,
        streamReadinessTimeoutMs,
        streamReadinessMaxTimeoutMs,
        sseHeartbeatIntervalMs,
        fetchHeadersTimeoutMs: readTimeoutMs(env, "FETCH_HEADERS_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchBodyTimeoutMs: readTimeoutMs(env, "FETCH_BODY_TIMEOUT_MS", fetchTimeoutMs, {
            allowZero: true,
            logger
        }),
        fetchConnectTimeoutMs: readTimeoutMs(env, "FETCH_CONNECT_TIMEOUT_MS", DEFAULT_FETCH_CONNECT_TIMEOUT_MS, {
            allowZero: true,
            logger
        }),
        fetchKeepAliveTimeoutMs: readTimeoutMs(env, "FETCH_KEEPALIVE_TIMEOUT_MS", DEFAULT_FETCH_KEEPALIVE_TIMEOUT_MS, {
            logger
        })
    };
}
function getStainlessTimeoutSeconds(env = process.env, logger) {
    const { fetchTimeoutMs } = getUpstreamTimeoutConfig(env, logger);
    return Math.max(1, Math.ceil(fetchTimeoutMs / 1_000));
}
function getTlsClientTimeoutConfig(env = process.env, logger) {
    const upstream = getUpstreamTimeoutConfig(env, logger);
    return {
        timeoutMs: readTimeoutMs(env, "TLS_CLIENT_TIMEOUT_MS", upstream.fetchTimeoutMs, {
            allowZero: true,
            logger
        })
    };
}
function getApiBridgeTimeoutConfig(env = process.env, logger) {
    const sharedRequestTimeoutMs = hasEnvValue(env, "REQUEST_TIMEOUT_MS") ? readTimeoutMs(env, "REQUEST_TIMEOUT_MS", DEFAULT_FETCH_TIMEOUT_MS, {
        allowZero: true,
        logger
    }) : undefined;
    const proxyTimeoutMs = readTimeoutMs(env, "API_BRIDGE_PROXY_TIMEOUT_MS", sharedRequestTimeoutMs ?? DEFAULT_API_BRIDGE_PROXY_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const derivedRequestTimeoutMs = proxyTimeoutMs > 0 ? Math.max(proxyTimeoutMs, DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS) : DEFAULT_API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS;
    const serverRequestDefaultMs = sharedRequestTimeoutMs !== undefined ? sharedRequestTimeoutMs > 0 ? Math.max(sharedRequestTimeoutMs, derivedRequestTimeoutMs) : 0 : derivedRequestTimeoutMs;
    const serverKeepAliveTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const serverHeadersTimeoutMs = readTimeoutMs(env, "API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        proxyTimeoutMs,
        serverRequestTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_REQUEST_TIMEOUT_MS", serverRequestDefaultMs, {
            allowZero: true,
            logger
        }),
        serverHeadersTimeoutMs: serverHeadersTimeoutMs > 0 && serverKeepAliveTimeoutMs > 0 ? Math.max(serverHeadersTimeoutMs, serverKeepAliveTimeoutMs + 1_000) : serverHeadersTimeoutMs,
        serverKeepAliveTimeoutMs,
        serverSocketTimeoutMs: readTimeoutMs(env, "API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS", DEFAULT_API_BRIDGE_SERVER_SOCKET_TIMEOUT_MS, {
            allowZero: true,
            logger
        })
    };
}
function getMainServerTimeoutConfig(env = process.env, logger) {
    const keepAliveTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_KEEPALIVE_TIMEOUT_MS", DEFAULT_MAIN_SERVER_KEEPALIVE_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    const headersTimeoutMs = readTimeoutMs(env, "MAIN_SERVER_HEADERS_TIMEOUT_MS", DEFAULT_MAIN_SERVER_HEADERS_TIMEOUT_MS, {
        allowZero: true,
        logger
    });
    return {
        keepAliveTimeoutMs,
        // Node requires headersTimeout > keepAliveTimeout to avoid its internal
        // race-condition warning; keep both configurable but always coherent.
        headersTimeoutMs: headersTimeoutMs > 0 && keepAliveTimeoutMs > 0 ? Math.max(headersTimeoutMs, keepAliveTimeoutMs + 1_000) : headersTimeoutMs
    };
}
}),
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
"[project]/open-sse/config/providers/alternateFormats.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Protocolos alternativos declarados por um provedor.
 *
 * Alguns upstreams publicam o mesmo catalogo em mais de um protocolo (ex.: Xiaomi
 * MiMo expoe /v1/chat/completions e /anthropic/v1/messages no mesmo host). Trocar
 * de protocolo troca URL, header de auth e headers extras — por isso a alternativa
 * carrega os tres, nao so a URL.
 *
 * A escolha vive na conexao, em providerSpecificData.targetFormat, e so vale se
 * casar com uma alternativa declarada: valor desconhecido cai no formato padrao,
 * nunca produz uma URL/auth orfas.
 */ __turbopack_context__.s([
    "resolveAlternateFormat",
    ()=>resolveAlternateFormat
]);
function resolveAlternateFormat(entry, providerSpecificData) {
    const alternates = entry?.alternateFormats;
    if (!alternates?.length) return null;
    const requested = providerSpecificData?.targetFormat;
    if (typeof requested !== "string" || !requested) return null;
    return alternates.find((alt)=>alt.format === requested) ?? null;
}
}),
"[project]/open-sse/config/claudeCodeCompatibleIdentity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_CODE_COMPATIBLE_STAINLESS_PACKAGE_VERSION",
    ()=>CLAUDE_CODE_COMPATIBLE_STAINLESS_PACKAGE_VERSION,
    "CLAUDE_CODE_COMPATIBLE_STAINLESS_RUNTIME_VERSION",
    ()=>CLAUDE_CODE_COMPATIBLE_STAINLESS_RUNTIME_VERSION,
    "CLAUDE_CODE_COMPATIBLE_USER_AGENT",
    ()=>CLAUDE_CODE_COMPATIBLE_USER_AGENT,
    "CLAUDE_CODE_COMPATIBLE_VERSION",
    ()=>CLAUDE_CODE_COMPATIBLE_VERSION,
    "modelHasNativeContext1m",
    ()=>modelHasNativeContext1m
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [app-route] (ecmascript)");
;
const CLAUDE_CODE_COMPATIBLE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_CODE_COMPATIBLE_USER_AGENT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClaudeCodeUserAgent"])("sdk-cli");
const CLAUDE_CODE_COMPATIBLE_STAINLESS_PACKAGE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_SDK_PACKAGE_VERSION"];
const CLAUDE_CODE_COMPATIBLE_STAINLESS_RUNTIME_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_RUNTIME_VERSION"];
const CONTEXT_1M_NATIVE_MODELS = [
    "claude-opus-5"
];
function modelHasNativeContext1m(model) {
    const normalizedModel = String(model || "").trim().toLowerCase().replace(/-\d{8}$/, "");
    return CONTEXT_1M_NATIVE_MODELS.some((supported)=>normalizedModel === supported || normalizedModel.startsWith(`${supported}-`));
}
}),
"[project]/open-sse/config/defaultThinkingSignature.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Default signature for thinking mode when no signature from thinkingStore
__turbopack_context__.s([
    "DEFAULT_THINKING_CLAUDE_SIGNATURE",
    ()=>DEFAULT_THINKING_CLAUDE_SIGNATURE,
    "DEFAULT_THINKING_GEMINI_SIGNATURE",
    ()=>DEFAULT_THINKING_GEMINI_SIGNATURE,
    "DEFAULT_THINKING_TEXT",
    ()=>DEFAULT_THINKING_TEXT
]);
const DEFAULT_THINKING_CLAUDE_SIGNATURE = "EpwGCkYIChgCKkCzVUuRrg7CcglSUWEef4rH6o35g9UYS8ZPe0/VomQTBsFx6sttYNj5l8GqgW6ejuHyYqpFToxIbZl0bw17l5dJEgzCnqDO0Z8fRlMrNgsaDLS1cnCjC53KBqE0CCIwAADQdo1eO+7qPAmo8J4WR3JPmr92S97kmvr5K1iPMiOpkZNj8mEXW8uzBoOJs/9ZKoMFiqHJ3UObwaJDqFOW70E9oCwDoc6jesaWVAEdN5vWfKMpIkjFJjECdjIdkxyJNJ8Ib8yXVal3qwE7uThoPRqSZDdHB5mmwPEjWE/90cSYCbtX2YsJki1265CabBb8/QEkODXg4kgRrL+c8e8rRXz/dr1RswvaPuzEdGKHRNi9UooNUeOK4/ebx1KkP9YZttyohN9GWqlts36kOoW0Cfie/ABDgF9g534BPth/sstxDM6d79QlRmh6NxizyTF74DXJI34u0M4tTRchqE5pAq85SgdJaa+dix1yJPMji8m6nZkwJbscJb9rdc2MKyKWjz8QL2+rTSSuZ2F1k1qSsW0xNcI7qLcI12Vncfn/VqY6YOIZy/saZBR0ezXvN6g+UYbuIdyVg7AyIFZt3nbrO7/kmOEb2VKzygwklHGEIJHfFgMpH3JSrAzbZIowVHOF7VaJ+KXRFDCFin7hHTOiOsdg+1ij1mML9Z/x/9CP4b7OUcaQm1llDZPSHc6rZMNL3DdB+fW5YfmNgKU35S+7AMtA10nVILzDAk1UV4T2K9Do09JlI6rjOs9UuULlIN2Z0eE8YTlANR6uQcw7lMcdfqYE8tke4rDKc2dDiaS5vVe45VewICNpdXGN11yw8QqH7p27CR1HtN30e0tHXOR3bIwWk/Yb6O5fTaKG6Ri8e5ZCPvdD9HqepVi188nM0iTjJqL58F3ni04ECIhcbyaQWnuTes1Kw4CMwiZDLQkk8Hgz7HkUOf1btQTF/0nhD7ry0n0hAEg2PaDM3V6TjOjf4hEldRmeqERcQF1PfgKb6ZM12rlIIfUqKACczWJSzTV158+47HX36o0cgux6nFlv/DE+sEiRVxgB";
const DEFAULT_THINKING_GEMINI_SIGNATURE = "EuwGCukGAXLI2nxwZIq54WWSoL/YN0P3TsDZ7zRnLi8g0S4aVr2HUGxvaHKySuY6HAVzcE0GPGjXrytLIldxthSvfxgUlJh6Qa9Z+Oj5QZBlYdg6HaJ6yuY5R7waE6rdwBsRf7Ft2j3DJ9rMi9qhWFqApewYtPhls3VHtuvND3l8Rm09+lbAXQs6KKWEWrxNLKTBkfpMgXhRERc/TQRMZu1twAablm6/Zk1tsYRvfWKLsNbeKF+CCojJdXJKvnR/8Ouuoa+Y2Ti20hcW7aZIIjZDFYPU//k6Ybmhg69J/imbFai2ckhfLaisqdDkdoIiBJScTOUvYqP6AE9d4MsydSC+UlhIMk4hoP76R8vUSCZRMkjOaDXstf/QoVZKbt94wyRZgAJ1G0BqI8L5ow86kLpA4wJEtxsRGymOE4bKUvApveBakYDNM9APkf+LbtbzWSseGjoZcSlycF9iN8Q2XNYKRrHbv3Lr5Y8JjdH/5y/6SHkNehTEZugaeGnSPSyCTWto1kQgHpxdWmhkLfJGNUGLmue7Mesj4TSms4J33mRpYVhNB/J333FCqIP0hr/E7BkkjEn7yZ4X7SQlh+xKPurapsnHRwiKmtsilmEFrnTE9iQr+pMr6M29qqFNv1tr5yumbaJw8JW9sB15tNsRv+dW6BjNanbsKz7HCgKUBc8tGy+7YuhXzAfViyRefcjK7eZW0Fbyt7AbybJTKz78W8NH7ye6LAwzOebXpeZ4D43fNIt8bKh26qgduSQv/7o+pAflkuqHZ99YWgHQ8h8OkZFi3eOiSYjsjhdZ/czWOdoPI/OnqIldzMPF5YlrKBLFX8VhRKVmqgsmWf5PHGulHhMkVlS+XG2UIseGy69ARa93D78Gsa+1n1kJr7EEB7Rh+27vUMxVYLdz1yMSvE5nalTAlg/ZeG8+XQ0cHuAI3KbQpHW2Q++RdXfm5JzD5WdJZUU+Zn8t8UUn85BH4RxZLeE0qJikgSsKoYVBc6YhiMjhPgkR95ReimY4Z0xCJdRo1gjexOFeODZMpQF6Yxnoic7IrdgsFA3iePTbFnPp3IAM1fAThWhXJUn3QInUOTd5o1qmTmn6REbL15g/JQNl+dqUoPkhleeb2V3kjqp1okmO3wMZbPknR3S1LZNmlS72/iBQUm+n2b/RCn4PjmM2";
const DEFAULT_THINKING_TEXT = "...";
}),
"[project]/src/lib/db/reasoningCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupExpiredReasoning",
    ()=>cleanupExpiredReasoning,
    "clearAllReasoningCache",
    ()=>clearAllReasoningCache,
    "deleteReasoningCache",
    ()=>deleteReasoningCache,
    "getReasoningCache",
    ()=>getReasoningCache,
    "getReasoningCacheEntries",
    ()=>getReasoningCacheEntries,
    "getReasoningCacheStats",
    ()=>getReasoningCacheStats,
    "setReasoningCache",
    ()=>setReasoningCache
]);
/**
 * reasoningCache.ts — DB domain module for the Reasoning Replay Cache.
 *
 * Persists reasoning_content from thinking-mode models (DeepSeek V4, Kimi K2,
 * Qwen-Thinking, etc.) keyed by tool_call_id. Used for crash recovery and
 * dashboard visibility. The hot path uses the in-memory cache in
 * open-sse/services/reasoningCache.ts; this module is the persistence layer.
 *
 * @see Issue #1628
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
// ──────────────── Constants ────────────────
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
function toUnixEpochSeconds(dateMs) {
    return Math.floor(dateMs / 1000);
}
const EXPIRES_AT_EPOCH_SQL = `COALESCE(
  CASE
    WHEN typeof(expires_at) IN ('integer', 'real') THEN CAST(expires_at AS INTEGER)
    WHEN typeof(expires_at) = 'text' AND expires_at <> '' AND expires_at NOT GLOB '*[^0-9]*'
      THEN CAST(expires_at AS INTEGER)
    ELSE unixepoch(expires_at)
  END,
  0
)`;
function epochSecondsToIso(value) {
    const text = String(value);
    const seconds = typeof value === "number" || text !== "" && !/[^0-9]/.test(text) ? Number.parseInt(text, 10) : NaN;
    if (Number.isFinite(seconds) && seconds > 0) {
        return new Date(seconds * 1000).toISOString();
    }
    const parsedMs = Date.parse(text);
    if (Number.isFinite(parsedMs)) {
        return new Date(parsedMs).toISOString();
    }
    return String(value);
}
const MAX_ENTRY_BYTES = 10000;
function setReasoningCache(toolCallId, provider, model, reasoning, ttlMs = DEFAULT_TTL_MS) {
    if (reasoning.length > MAX_ENTRY_BYTES) {
        reasoning = reasoning.slice(0, MAX_ENTRY_BYTES);
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const expiresAt = toUnixEpochSeconds(Date.now() + ttlMs);
    const charCount = reasoning.length;
    db.prepare(`INSERT OR REPLACE INTO reasoning_cache
       (tool_call_id, provider, model, reasoning, char_count, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`).run(toolCallId, provider, model, reasoning, charCount, expiresAt);
}
function getReasoningCache(toolCallId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT reasoning, provider, model FROM reasoning_cache
       WHERE tool_call_id = ? AND ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`).get(toolCallId);
    return row ?? null;
}
function deleteReasoningCache(toolCallId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`DELETE FROM reasoning_cache WHERE tool_call_id = ?`).run(toolCallId);
    return result.changes;
}
function cleanupExpiredReasoning() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = db.prepare(`DELETE FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} <= unixepoch('now')`).run();
    return result.changes;
}
function clearAllReasoningCache(provider) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (provider) {
        const result = db.prepare(`DELETE FROM reasoning_cache WHERE provider = ?`).run(provider);
        return result.changes;
    }
    const result = db.prepare(`DELETE FROM reasoning_cache`).run();
    return result.changes;
}
function getReasoningCacheStats() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    // Total counts
    const totals = db.prepare(`SELECT COUNT(*) as total_entries, COALESCE(SUM(char_count), 0) as total_chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`).get();
    // By provider
    const providerRows = db.prepare(`SELECT provider, COUNT(*) as entries, COALESCE(SUM(char_count), 0) as chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')
       GROUP BY provider ORDER BY entries DESC`).all();
    const byProvider = {};
    for (const row of providerRows){
        byProvider[row.provider] = {
            entries: row.entries,
            chars: row.chars
        };
    }
    // By model
    const modelRows = db.prepare(`SELECT model, COUNT(*) as entries, COALESCE(SUM(char_count), 0) as chars
       FROM reasoning_cache WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')
       GROUP BY model ORDER BY entries DESC`).all();
    const byModel = {};
    for (const row of modelRows){
        byModel[row.model] = {
            entries: row.entries,
            chars: row.chars
        };
    }
    // Oldest/newest
    const oldest = db.prepare(`SELECT created_at FROM reasoning_cache
       WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now') ORDER BY created_at ASC LIMIT 1`).get();
    const newest = db.prepare(`SELECT created_at FROM reasoning_cache
       WHERE ${EXPIRES_AT_EPOCH_SQL} > unixepoch('now') ORDER BY created_at DESC LIMIT 1`).get();
    return {
        totalEntries: totals.total_entries,
        totalChars: totals.total_chars,
        byProvider,
        byModel,
        oldestEntry: oldest?.created_at ?? null,
        newestEntry: newest?.created_at ?? null
    };
}
function getReasoningCacheEntries(opts = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = opts.offset ?? 0;
    const conditions = [
        `${EXPIRES_AT_EPOCH_SQL} > unixepoch('now')`
    ];
    const params = [];
    if (opts.provider) {
        conditions.push("provider = ?");
        params.push(opts.provider);
    }
    if (opts.model) {
        conditions.push("model = ?");
        params.push(opts.model);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = db.prepare(`SELECT tool_call_id, provider, model, reasoning, char_count, created_at, expires_at
       FROM reasoning_cache ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`).all(...params, limit, offset);
    return rows.map((row)=>({
            toolCallId: row.tool_call_id,
            provider: row.provider,
            model: row.model,
            reasoning: row.reasoning,
            charCount: row.char_count,
            createdAt: row.created_at,
            expiresAt: epochSecondsToIso(row.expires_at)
        }));
}
}),
"[project]/open-sse/services/reasoningCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cacheReasoning",
    ()=>cacheReasoning,
    "cacheReasoningBatch",
    ()=>cacheReasoningBatch,
    "cacheReasoningByKey",
    ()=>cacheReasoningByKey,
    "cacheReasoningFromAssistantMessage",
    ()=>cacheReasoningFromAssistantMessage,
    "cleanupReasoningCache",
    ()=>cleanupReasoningCache,
    "clearReasoningCacheAll",
    ()=>clearReasoningCacheAll,
    "deleteReasoningCacheEntry",
    ()=>deleteReasoningCacheEntry,
    "getReasoningCacheServiceEntries",
    ()=>getReasoningCacheServiceEntries,
    "getReasoningCacheServiceStats",
    ()=>getReasoningCacheServiceStats,
    "isDeepSeekReasoningModel",
    ()=>isDeepSeekReasoningModel,
    "lookupReasoning",
    ()=>lookupReasoning,
    "recordReplay",
    ()=>recordReplay,
    "requiresReasoningReplay",
    ()=>requiresReasoningReplay
]);
/**
 * Reasoning Replay Cache — In-memory + DB hybrid service.
 *
 * Captures reasoning_content from thinking-mode model responses (DeepSeek V4,
 * Kimi K2, Qwen-Thinking, GLM, etc.) and re-injects it on subsequent turns
 * when clients omit it. This prevents the DeepSeek 400 error:
 * "The reasoning_content in the thinking mode must be passed back to the API."
 *
 * Architecture:
 *   Write: memory + DB in the same process
 *   Read:  memory first → DB fallback → miss
 *
 * @see Issue #1628
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningCache.ts [app-route] (ecmascript)");
;
// ──────────────── Provider/Model Detection ────────────────
const REASONING_REPLAY_PROVIDERS = new Set([
    "deepseek",
    "opencode-go",
    "siliconflow",
    "nebius",
    "deepinfra",
    "sambanova",
    "fireworks",
    "together",
    // Kimi Coding thinking-mode upstreams require reasoning_content replay under
    // the same strict multi-turn contract as DeepSeek.
    "kimi-coding",
    "kimi-coding-apikey",
    // Xiaomi MiMo enforces the same "pass back reasoning_content on subsequent
    // turns" contract as DeepSeek/Kimi-thinking. Without replay the upstream
    // 400s with "Param Incorrect: The reasoning_content in the thinking mode
    // must be passed back to the API."
    "xiaomi-mimo"
]);
const REASONING_REPLAY_MODEL_PATTERNS = [
    /deepseek-r1/i,
    /deepseek-reasoner/i,
    /deepseek-chat/i,
    /deepseek[-/]v4[-.](flash|pro)(-free)?/i,
    /zen\/deepseek-v4/i,
    // Match native kimi-kN and namespaced kimi/kN families without treating
    // generic aliases such as kimi-latest as strict thinking models.
    /kimi[-/]k\d/i,
    /qwq/i,
    /qwen.*think/i,
    /glm.*think/i,
    // MiMo (Xiaomi) thinking models — defensive match if a wildcard route
    // assigns a non-`xiaomi-mimo` provider ID to a mimo-* model alias.
    /^mimo[-.]?v\d/i
];
const DEEPSEEK_V4_MODEL_PATTERN = /deepseek[-/]v4[-.](flash|pro)/i;
function isDeepSeekReasoningModel(params) {
    if (params.thinkingEnabled !== true) return false;
    return DEEPSEEK_V4_MODEL_PATTERN.test(params.model);
}
function requiresReasoningReplay(params) {
    const normalizedProvider = params.provider.trim().toLowerCase();
    const normalizedModel = params.model.trim();
    const normalizedInterleavedField = typeof params.interleavedField === "string" ? params.interleavedField.trim().toLowerCase() : "";
    // Explicit model signal from models.dev (preferred source of truth).
    if (normalizedInterleavedField === "reasoning_content") return true;
    if (normalizedInterleavedField === "reasoning_details") return false;
    // DeepSeek legacy reasoner family has an inverse contract: do not replay.
    if (/deepseek-reasoner/i.test(normalizedModel) || /deepseek-r1/i.test(normalizedModel)) {
        return false;
    }
    // Explicit known contract: DeepSeek V4 thinking with tool calls requires replay.
    if (isDeepSeekReasoningModel(params)) return true;
    const useLegacyFallback = params.allowLegacyFallback !== false;
    if (!useLegacyFallback) return false;
    if (REASONING_REPLAY_PROVIDERS.has(normalizedProvider)) return true;
    return REASONING_REPLAY_MODEL_PATTERNS.some((p)=>p.test(normalizedModel));
}
const memoryCache = new Map();
const MAX_MEMORY_ENTRIES = 200;
const MAX_ENTRY_BYTES = 10000;
const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
// ──────────────── Counters ────────────────
let hits = 0;
let misses = 0;
let replays = 0;
// ──────────────── Core Operations ────────────────
/**
 * Evict the oldest entry from the memory cache when full.
 */ function evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [key, entry] of memoryCache){
        if (entry.createdAt < oldestTime) {
            oldestTime = entry.createdAt;
            oldestKey = key;
        }
    }
    if (oldestKey) memoryCache.delete(oldestKey);
}
/**
 * Remove expired entries from memory cache.
 */ function purgeExpiredMemory() {
    const now = Date.now();
    for (const [key, entry] of memoryCache){
        if (now >= entry.expiresAt) {
            memoryCache.delete(key);
        }
    }
}
function cacheReasoning(toolCallId, provider, model, reasoning) {
    cacheReasoningByKey(toolCallId, provider, model, reasoning);
}
function cacheReasoningByKey(key, provider, model, reasoning) {
    if (!key || !reasoning) return;
    if (reasoning.length > MAX_ENTRY_BYTES) {
        reasoning = reasoning.slice(0, MAX_ENTRY_BYTES);
    }
    const now = Date.now();
    // Memory write
    if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
        evictOldest();
    }
    memoryCache.set(key, {
        reasoning,
        provider,
        model,
        expiresAt: now + TTL_MS,
        createdAt: now
    });
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setReasoningCache"])(key, provider, model, reasoning, TTL_MS);
    } catch  {
    // DB persistence failure is non-fatal; memory cache still serves the hot path.
    }
}
function buildAssistantMessageCacheKey(requestId, messageIndex) {
    return `request:${requestId}:message:${messageIndex}`;
}
function cacheReasoningBatch(toolCallIds, provider, model, reasoning) {
    for (const id of toolCallIds){
        if (id) cacheReasoning(id, provider, model, reasoning);
    }
}
function cacheReasoningFromAssistantMessage(message, provider, model, context) {
    if (!message || message.role !== "assistant") {
        return 0;
    }
    const reasoning = typeof message.reasoning_content === "string" && message.reasoning_content.length > 0 ? message.reasoning_content : typeof message.reasoning === "string" && message.reasoning.length > 0 ? message.reasoning : "";
    if (!reasoning) return 0;
    const toolCallIds = Array.isArray(message.tool_calls) ? message.tool_calls.map((toolCall)=>typeof toolCall.id === "string" ? toolCall.id : "").filter((id)=>id.length > 0) : [];
    if (toolCallIds.length === 0) {
        const requestId = context?.requestId?.trim();
        const messageIndex = context?.messageIndex;
        if (!requestId || typeof messageIndex !== "number" || !Number.isInteger(messageIndex)) {
            return 0;
        }
        cacheReasoningByKey(buildAssistantMessageCacheKey(requestId, messageIndex), provider, model, reasoning);
        return 1;
    }
    cacheReasoningBatch(toolCallIds, provider, model, reasoning);
    return toolCallIds.length;
}
function lookupReasoning(toolCallId) {
    if (!toolCallId) {
        misses++;
        return null;
    }
    // 1. Check memory
    const mem = memoryCache.get(toolCallId);
    if (mem) {
        if (Date.now() < mem.expiresAt) {
            hits++;
            return mem.reasoning;
        }
        // Expired in memory — remove
        memoryCache.delete(toolCallId);
    }
    // 2. Fallback to DB
    let dbResult = null;
    try {
        dbResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReasoningCache"])(toolCallId);
    } catch  {
    // DB lookup failure is non-fatal; treat it as a cache miss.
    }
    if (dbResult) {
        hits++;
        let promotedReasoning = dbResult.reasoning;
        if (promotedReasoning.length > MAX_ENTRY_BYTES) {
            promotedReasoning = promotedReasoning.slice(0, MAX_ENTRY_BYTES);
        }
        // Promote back to memory for fast subsequent lookups
        memoryCache.set(toolCallId, {
            reasoning: promotedReasoning,
            provider: dbResult.provider,
            model: dbResult.model,
            expiresAt: Date.now() + TTL_MS,
            createdAt: Date.now()
        });
        return promotedReasoning;
    }
    // 3. Miss
    misses++;
    return null;
}
function recordReplay() {
    replays++;
}
function getReasoningCacheServiceStats() {
    // Purge expired memory entries before reporting
    purgeExpiredMemory();
    let dbStats = {
        totalEntries: 0,
        totalChars: 0,
        byProvider: {},
        byModel: {},
        oldestEntry: null,
        newestEntry: null
    };
    try {
        dbStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReasoningCacheStats"])();
    } catch  {
    // DB stats are unavailable; return memory counters with empty persisted stats.
    }
    const totalLookups = hits + misses;
    const replayRate = totalLookups > 0 ? (replays / totalLookups * 100).toFixed(1) : "0.0";
    return {
        memoryEntries: memoryCache.size,
        dbEntries: dbStats.totalEntries,
        totalEntries: dbStats.totalEntries,
        totalChars: dbStats.totalChars,
        hits,
        misses,
        replays,
        replayRate: `${replayRate}%`,
        byProvider: dbStats.byProvider,
        byModel: dbStats.byModel,
        oldestEntry: dbStats.oldestEntry,
        newestEntry: dbStats.newestEntry
    };
}
function getReasoningCacheServiceEntries(opts = {}) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReasoningCacheEntries"])(opts);
    } catch  {
        return [];
    }
}
function clearReasoningCacheAll(provider) {
    // Clear memory
    if (provider) {
        for (const [key, entry] of memoryCache){
            if (entry.provider === provider) memoryCache.delete(key);
        }
    } else {
        memoryCache.clear();
    }
    // Reset counters
    hits = 0;
    misses = 0;
    replays = 0;
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearAllReasoningCache"])(provider);
    } catch  {
        return 0;
    }
}
function deleteReasoningCacheEntry(toolCallId) {
    if (!toolCallId) return 0;
    const existedInMemory = memoryCache.delete(toolCallId);
    let deletedFromDb = 0;
    try {
        deletedFromDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteReasoningCache"])(toolCallId);
    } catch  {
    // Memory delete already happened; DB delete can be retried by a later cleanup.
    }
    return deletedFromDb + (existedInMemory && deletedFromDb === 0 ? 1 : 0);
}
function cleanupReasoningCache() {
    purgeExpiredMemory();
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanupExpiredReasoning"])();
    } catch  {
        return 0;
    }
}
// ──────────────── Auto-start periodic cleanup ────────────────
//
// server-init.ts was supposed to start the cleanup job, but that module is
// never imported anywhere (it is stranded/dead code).  As a result, the
// reasoning_cache SQLite table accumulates expired entries indefinitely.
//
// Fix: start the periodic cleanup directly from this module so it runs
// regardless of how the server boots.  On first import we run one
// immediate sweep, then schedule a 30-minute interval.
//
// See: src/lib/jobs/reasoningCacheCleanupJob.ts (the original job module,
// which also remains valid if server-init.ts ever gets wired in).
const DEFAULT_CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 min
function getCleanupIntervalMs() {
    const raw = process.env.OMNIROUTE_REASONING_CACHE_CLEANUP_INTERVAL_MS;
    const parsed = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) && parsed >= 60_000 ? parsed : DEFAULT_CLEANUP_INTERVAL_MS;
}
function startAutoCleanup() {
    // Run once immediately on boot
    try {
        const deleted = cleanupReasoningCache();
        if (deleted > 0) {
            console.log(`[ReasoningCache] boot cleanup removed ${deleted} expired entries`);
        }
    } catch (error) {
        console.error("[ReasoningCache] boot cleanup failed:", error);
    }
    // Schedule periodic cleanup
    const timer = setInterval(()=>{
        try {
            const deleted = cleanupReasoningCache();
            if (deleted > 0) {
                console.log(`[ReasoningCache] periodic cleanup removed ${deleted} expired entries`);
            }
        } catch (error) {
            console.error("[ReasoningCache] periodic cleanup failed:", error);
        }
    }, getCleanupIntervalMs());
    timer.unref?.();
}
// Start on module load — every consumer of reasoning cache benefits.
startAutoCleanup();
}),
"[project]/open-sse/utils/reasoningPlaceholder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Internal replay sentinel used when an upstream requires non-empty reasoning content but the
 * original reasoning summary is unavailable. It is valid request scaffolding, never user-visible
 * reasoning, so response translators must suppress it before emitting client-facing events.
 */ __turbopack_context__.s([
    "NON_ANTHROPIC_THINKING_PLACEHOLDER",
    ()=>NON_ANTHROPIC_THINKING_PLACEHOLDER,
    "isInternalReasoningPlaceholder",
    ()=>isInternalReasoningPlaceholder,
    "stripInternalReasoningPlaceholder",
    ()=>stripInternalReasoningPlaceholder
]);
const NON_ANTHROPIC_THINKING_PLACEHOLDER = "(prior reasoning summary unavailable)";
function isInternalReasoningPlaceholder(value) {
    return typeof value === "string" && value.trim() === NON_ANTHROPIC_THINKING_PLACEHOLDER;
}
function stripInternalReasoningPlaceholder(value) {
    if (!value.includes(NON_ANTHROPIC_THINKING_PLACEHOLDER)) return value;
    const stripped = value.replaceAll(NON_ANTHROPIC_THINKING_PLACEHOLDER, "");
    return stripped.trim() === "" ? "" : stripped;
}
}),
"[project]/open-sse/translator/helpers/claudeHelper.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyKimiCodingThinking",
    ()=>applyKimiCodingThinking,
    "fixToolUseOrdering",
    ()=>fixToolUseOrdering,
    "hasValidContent",
    ()=>hasValidContent,
    "prepareClaudeRequest",
    ()=>prepareClaudeRequest,
    "splitMisplacedToolResults",
    ()=>splitMisplacedToolResults
]);
// Claude helper functions for translator
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/defaultThinkingSignature.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/reasoningCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [app-route] (ecmascript)");
;
;
;
;
;
// MiniMax exposes a Claude-compatible endpoint but rejects Anthropic's extended
// `output_config` parameter (used to steer reasoning effort and structured output)
// with a generic 400 "invalid params" response. Strip the entire field before
// dispatching Claude-shape requests to these providers. Anthropic Claude and
// other Claude-compatible upstreams that do accept it are unaffected.
// Ported from upstream decolua/9router#820 by @hiepau1231.
const CLAUDE_FORMAT_PROVIDERS_WITHOUT_OUTPUT_CONFIG = new Set([
    "minimax",
    "minimax-cn"
]);
function applyKimiCodingThinking(result, body) {
    if (!body.thinking && !body.reasoning_effort) return;
    const requestedEffort = String(body.reasoning_effort ?? body.thinking?.effort ?? "on").toLowerCase();
    const disabled = body.thinking?.type === "disabled" || [
        "off",
        "none"
    ].includes(requestedEffort);
    result.thinking = {
        type: disabled ? "disabled" : "enabled"
    };
    if (!disabled && ![
        "on",
        "auto"
    ].includes(requestedEffort)) {
        const outputConfig = result.output_config && typeof result.output_config === "object" ? result.output_config : {};
        result.output_config = {
            ...outputConfig,
            effort: requestedEffort
        };
    }
}
function hasValidContent(msg) {
    if (typeof msg.content === "string" && msg.content.trim()) return true;
    if (Array.isArray(msg.content)) {
        return msg.content.some((block)=>block.type === "text" && block.text?.trim() || block.type === "tool_use" || block.type === "tool_result" || // #7777: media-only user turns are real content — dropping them
            // silently deletes vision input on the CC bridge / Claude paths.
            block.type === "image" || block.type === "document");
    }
    return false;
}
function splitMisplacedToolResults(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return messages;
    const out = [];
    const seenToolUseIds = new Set();
    const recordToolUseIds = (blocks)=>{
        for (const b of blocks){
            if (b?.type === "tool_use" && typeof b.id === "string") {
                seenToolUseIds.add(b.id);
            }
        }
    };
    for (const msg of messages){
        if (msg.role !== "assistant" || !Array.isArray(msg.content)) {
            out.push(msg);
            continue;
        }
        const toolResults = msg.content.filter((b)=>b?.type === "tool_result");
        if (toolResults.length === 0) {
            out.push(msg);
            recordToolUseIds(msg.content);
            continue;
        }
        const validToolResults = toolResults.filter((b)=>typeof b?.tool_use_id === "string" && seenToolUseIds.has(b.tool_use_id));
        const remaining = msg.content.filter((b)=>b?.type !== "tool_result");
        if (validToolResults.length > 0) {
            const prev = out[out.length - 1];
            if (prev && prev.role === "user" && Array.isArray(prev.content)) {
                out[out.length - 1] = {
                    ...prev,
                    content: [
                        ...prev.content,
                        ...validToolResults
                    ]
                };
            } else {
                out.push({
                    role: "user",
                    content: validToolResults
                });
            }
        }
        // Drop the assistant message entirely if only tool_result blocks remained.
        if (remaining.length > 0) {
            out.push({
                ...msg,
                content: remaining
            });
            recordToolUseIds(remaining);
        }
    }
    return out;
}
function fixToolUseOrdering(messages) {
    if (messages.length === 0) return messages;
    if (messages.length === 1 && !(Array.isArray(messages[0]?.content) && messages[0].content.some((block)=>block.type === "tool_result"))) {
        return messages;
    }
    // Pass 1: Fix assistant messages with tool_use - remove text after tool_use
    for (const msg of messages){
        if (msg.role === "assistant" && Array.isArray(msg.content)) {
            const hasToolUse = msg.content.some((b)=>b.type === "tool_use");
            if (hasToolUse) {
                // Keep only: thinking blocks + tool_use blocks (remove text blocks after tool_use)
                const newContent = [];
                let foundToolUse = false;
                for (const block of msg.content){
                    if (block.type === "tool_use") {
                        foundToolUse = true;
                        newContent.push(block);
                    } else if (block.type === "thinking" || block.type === "redacted_thinking") {
                        newContent.push(block);
                    } else if (!foundToolUse) {
                        // Keep text blocks BEFORE tool_use
                        newContent.push(block);
                    }
                // Skip text blocks AFTER tool_use
                }
                msg.content = newContent;
            }
        }
    }
    // Pass 2: Merge consecutive same-role messages
    const merged = [];
    for (const msg of messages){
        const last = merged[merged.length - 1];
        if (last && last.role === msg.role) {
            // Merge content arrays
            const lastContent = Array.isArray(last.content) ? last.content : [
                {
                    type: "text",
                    text: last.content
                }
            ];
            const msgContent = Array.isArray(msg.content) ? msg.content : [
                {
                    type: "text",
                    text: msg.content
                }
            ];
            // Put tool_result first, then other content
            const toolResults = [
                ...lastContent.filter((b)=>b.type === "tool_result"),
                ...msgContent.filter((b)=>b.type === "tool_result")
            ];
            const otherContent = [
                ...lastContent.filter((b)=>b.type !== "tool_result"),
                ...msgContent.filter((b)=>b.type !== "tool_result")
            ];
            last.content = [
                ...toolResults,
                ...otherContent
            ];
        } else {
            // Ensure content is array
            const content = Array.isArray(msg.content) ? msg.content : [
                {
                    type: "text",
                    text: msg.content
                }
            ];
            merged.push({
                role: msg.role,
                content: [
                    ...content
                ]
            });
        }
    }
    // Claude accepts tool_result only for a tool_use in the immediately previous
    // assistant message. Compacted cross-model history can retain an output after
    // dropping its call; keep that output as user text instead of sending an
    // invalid structured reference or discarding useful context.
    for(let i = 0; i < merged.length; i++){
        const msg = merged[i];
        if (msg.role !== "user" || !Array.isArray(msg.content)) continue;
        const previous = merged[i - 1];
        const validIds = new Set(previous?.role === "assistant" && Array.isArray(previous.content) ? previous.content.flatMap((block)=>block.type === "tool_use" && typeof block.id === "string" && block.id ? [
                block.id
            ] : []) : []);
        const pairedById = new Map();
        const otherContent = [];
        for (const block of msg.content){
            if (block.type !== "tool_result") {
                otherContent.push(block);
                continue;
            }
            const toolUseId = typeof block.tool_use_id === "string" ? block.tool_use_id : "";
            if (validIds.has(toolUseId) && !pairedById.has(toolUseId)) {
                pairedById.set(toolUseId, block);
                continue;
            }
            const serialized = typeof block.content === "string" ? block.content : JSON.stringify(block.content ?? "") ?? "";
            otherContent.push({
                type: "text",
                text: `[Unpaired tool result ${toolUseId || "unknown"}]\n${serialized}`
            });
        }
        const pairedResults = [
            ...validIds
        ].map((id)=>pairedById.get(id) ?? {
                type: "tool_result",
                tool_use_id: id,
                content: ""
            });
        msg.content = [
            ...pairedResults,
            ...otherContent
        ];
    }
    return merged;
}
function ensureMessageContentArray(msg) {
    if (Array.isArray(msg?.content)) return msg.content;
    if (typeof msg?.content === "string" && msg.content.trim()) {
        msg.content = [
            {
                type: "text",
                text: msg.content
            }
        ];
        return msg.content;
    }
    return [];
}
function markMessageCacheControl(msg, ttl) {
    const content = ensureMessageContentArray(msg);
    if (content.length === 0) return false;
    const lastIndex = content.length - 1;
    content[lastIndex].cache_control = ttl !== undefined ? {
        type: "ephemeral",
        ttl
    } : {
        type: "ephemeral"
    };
    return true;
}
/** True when the body carries at least one cache_control marker anywhere
 * (system blocks, message content blocks, or tools). Used to decide whether
 * preserve-mode has anything to preserve. */ function bodyHasAnyCacheControl(body) {
    if (Array.isArray(body.system)) {
        for (const block of body.system){
            if (block && typeof block === "object" && block.cache_control) return true;
        }
    }
    if (Array.isArray(body.messages)) {
        for (const msg of body.messages){
            if (!Array.isArray(msg?.content)) continue;
            for (const block of msg.content){
                if (block && typeof block === "object" && block.cache_control) return true;
            }
        }
    }
    if (Array.isArray(body.tools)) {
        for (const tool of body.tools){
            if (tool && typeof tool === "object" && tool.cache_control) return true;
        }
    }
    return false;
}
function prepareClaudeRequest(body, provider = null, preserveCacheControl = false, model = null, opts = {}) {
    // 0. Strip Anthropic `output_config` for providers that reject it on their
    // Claude-compatible endpoints (MiniMax). Must run before any downstream
    // processing so the field never reaches translateRequest/the executor.
    if (provider && CLAUDE_FORMAT_PROVIDERS_WITHOUT_OUTPUT_CONFIG.has(provider)) {
        delete body.output_config;
    }
    // preserveCacheControl means "the client manages its own cache markers".
    // A body with NO cache_control anywhere has nothing to preserve — shipping
    // it untouched would mean zero prompt-cache breakpoints (every token billed
    // uncached on every turn). The translator path opts into falling back to the
    // standard heuristic in that case; the claude-code-compatible relay path
    // keeps its long-standing "never supplement missing markers" contract
    // (cc-compatible-provider.test.ts) and does not pass the flag.
    if (preserveCacheControl && opts.fallbackToHeuristicWhenNoMarkers === true && !bodyHasAnyCacheControl(body)) {
        preserveCacheControl = false;
    }
    // 1. System: remove all cache_control, add only to last block with ttl 1h
    // In passthrough mode, preserve existing cache_control markers
    const supportsPromptCaching = provider === "claude" || provider?.startsWith?.("anthropic-compatible-");
    const isKimiCoding = provider === "kimi-coding" || provider === "kimi-coding-apikey";
    // Non-Anthropic Claude-shape providers (kimi-coding, glmt, zai, …) cannot
    // validate the synthetic redacted_thinking.data blob — they're not Anthropic
    // and don't speak its signature scheme. They expect plain `thinking { text }`
    // blocks with the original reasoning text, or fail with:
    //   "thinking is enabled but reasoning_content is missing in assistant
    //    tool call message at index N"
    // We use the same allowlist as prompt-caching: only Anthropic-native
    // upstreams get redacted_thinking. Everything else gets plain thinking blocks
    // backed by reasoningCache (real text) or a placeholder (cache miss).
    // Mixed-format providers (e.g. opencode-go) may have some models targeting
    // Anthropic's Messages API (targetFormat=claude) and others targeting OpenAI.
    // When the specific model targets Claude format, it's hitting a real Anthropic
    // endpoint that validates signatures — so it needs redacted_thinking too.
    const modelTargetsClaude = !!provider && !!model && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelTargetFormat"])(provider, model) === "claude";
    const supportsRedactedThinking = !isKimiCoding && (supportsPromptCaching || modelTargetsClaude);
    const systemBlocks = body.system;
    if (systemBlocks && Array.isArray(systemBlocks) && !preserveCacheControl) {
        body.system = systemBlocks.map((block, i)=>{
            const { cache_control, ...rest } = block;
            if (i === systemBlocks.length - 1 && supportsPromptCaching) {
                return {
                    ...rest,
                    cache_control: {
                        type: "ephemeral",
                        ttl: "1h"
                    }
                };
            }
            return rest;
        });
    }
    // 2. Messages: process in optimized passes
    if (body.messages && Array.isArray(body.messages)) {
        const len = body.messages.length;
        let filtered = [];
        // Pass 1: remove cache_control + filter empty messages
        // In passthrough mode, preserve existing cache_control markers
        for(let i = 0; i < len; i++){
            const msg = body.messages[i];
            // Remove cache_control from content blocks (skip in passthrough mode)
            if (Array.isArray(msg.content) && !preserveCacheControl) {
                for (const block of msg.content){
                    delete block.cache_control;
                }
            }
            // Keep final assistant even if empty, otherwise check valid content
            const isFinalAssistant = i === len - 1 && msg.role === "assistant";
            if (isFinalAssistant || hasValidContent(msg)) {
                filtered.push(msg);
            }
        }
        // Pass 1.4: Filter out tool_use blocks with empty names (causes Claude 400 error)
        // Apply to ALL roles (assistant tool_use + any user messages that may carry tool_use)
        // Also filter tool_result blocks with missing tool_use_id
        for (const msg of filtered){
            if (Array.isArray(msg.content)) {
                msg.content = msg.content.filter((block)=>block.type !== "tool_use" || block.name && block.name?.trim());
                msg.content = msg.content.filter((block)=>block.type !== "tool_result" || block.tool_use_id);
            }
        }
        // Tools: for non-Anthropic providers (MiniMax and other Anthropic-compatible
        // Claude-shape endpoints) strip Anthropic-only built-in tools (e.g.
        // web_search_20250305) and normalize OpenAI-wire-shape tools to the
        // Anthropic-native shape — fold `function.{name,description,parameters}`
        // into top-level `{name, description, input_schema}` and drop the stray
        // `type` field. Without this MiniMax rejects with code 2013 ("invalid
        // tool type"). Port of upstream decolua/9router@45240c19.
        if (body.tools && Array.isArray(body.tools) && provider !== "claude") {
            body.tools = body.tools.filter((tool)=>!tool.type || tool.type === "function").map((tool)=>{
                const t = tool;
                if (t.function) {
                    return {
                        name: t.function.name,
                        description: t.function.description,
                        input_schema: t.function.parameters
                    };
                }
                const { type: _type, ...rest } = t;
                return rest;
            });
        }
        // Also filter top-level tool declarations with empty names
        if (body.tools && Array.isArray(body.tools)) {
            body.tools = body.tools.filter((tool)=>tool.name && tool.name?.trim());
        }
        // Pass 1.45: Move stray tool_result blocks out of assistant messages
        // before any ordering fix runs (#2815).
        filtered = splitMisplacedToolResults(filtered);
        // Pass 1.5: Fix tool_use/tool_result ordering
        // Each tool_use must have tool_result in the NEXT message (not same message with other content)
        filtered = fixToolUseOrdering(filtered);
        body.messages = filtered;
        // Check if thinking is enabled AND last message is from user
        const lastMessage = filtered[filtered.length - 1];
        const lastMessageIsUser = lastMessage?.role === "user";
        const thinkingEnabled = body.thinking?.type === "enabled" && lastMessageIsUser;
        // Claude Code-style prompt caching:
        // - cache the second-to-last user turn for conversation reuse
        // - cache the last assistant turn so the next user turn can reuse it
        // Skip in passthrough mode to preserve client's cache_control markers
        if (!preserveCacheControl && supportsPromptCaching) {
            const userMessageIndexes = filtered.reduce((indexes, msg, index)=>{
                if (msg?.role === "user") indexes.push(index);
                return indexes;
            }, []);
            const secondToLastUserIndex = userMessageIndexes.length >= 2 ? userMessageIndexes[userMessageIndexes.length - 2] : -1;
            if (secondToLastUserIndex >= 0) {
                markMessageCacheControl(filtered[secondToLastUserIndex]);
            }
        }
        // Pass 2 (reverse): add cache_control to last assistant + handle thinking for Anthropic
        // Index of the LAST assistant message in the filtered array. Anthropic
        // enforces the latest assistant message's thinking blocks cannot be
        // modified — preserve them verbatim. Older assistant messages can be
        // rewritten to redacted_thinking { data } as before.
        let latestAssistantIndex = -1;
        for(let k = filtered.length - 1; k >= 0; k--){
            if (filtered[k]?.role === "assistant") {
                latestAssistantIndex = k;
                break;
            }
        }
        let lastAssistantProcessed = false;
        for(let i = filtered.length - 1; i >= 0; i--){
            const msg = filtered[i];
            const content = ensureMessageContentArray(msg);
            if (msg.role === "assistant" && content.length > 0) {
                // Add cache_control to last block of first (from end) assistant with content
                // Skip in passthrough mode to preserve client's cache_control markers
                if (!preserveCacheControl && supportsPromptCaching && !lastAssistantProcessed && markMessageCacheControl(msg)) {
                    lastAssistantProcessed = true;
                }
                // Handle thinking blocks for Anthropic-shape endpoints.
                // prepareClaudeRequest is only invoked when targetFormat === claude
                // (translator/index.ts:165-168), so any provider that lands here has
                // a Claude-format upstream: claude native, anthropic-compatible-*,
                // kimi-coding (api.kimi.com/coding/v1/messages), glmt, zai, etc.
                // All of these enforce the same body-shape contract for thinking mode:
                // when body.thinking.type === "enabled" and an assistant turn contains
                // a tool_use, the same content[] must include a thinking (or
                // redacted_thinking) block emitted before the tool_use. Without it,
                // the upstream rejects with errors like:
                //   "thinking is enabled but reasoning_content is missing in
                //    assistant tool call message at index N"  (kimi-coding)
                //   "Invalid signature in thinking block"     (claude native, on
                //                                              cross-provider replay)
                // Guard: never modify EXISTING thinking blocks in the latest assistant
                // message when sending to an Anthropic-native upstream. Anthropic returns
                // 400 "blocks in the latest assistant message cannot be modified" if any
                // field changes. Injecting a NEW thinking block (when none exists) is fine.
                // Older assistant messages can still be rewritten.
                // For non-Anthropic providers: only the text replacement is skipped
                // for the latest assistant (if it already has non-empty thinking text);
                // field cleanup (signature strip, type normalization) still runs.
                const isLatestAssistant = i === latestAssistantIndex;
                const latestThinkingBlocks = isLatestAssistant ? content.filter((b)=>b.type === "thinking" || b.type === "redacted_thinking") : [];
                const latestHasExistingThinking = latestThinkingBlocks.length > 0;
                // #6953: a synthetic thinking block with an EMPTY signature/data (fabricated by a
                // non-Anthropic provider leg, e.g. codex reasoning_content) is NOT a genuine Claude
                // replay signature. Forwarding it verbatim to a real Anthropic-native upstream always
                // 400s ("Invalid signature in thinking block"), permanently poisoning the combo onto
                // the non-Anthropic leg. Only skip the verbatim-preserve path when every thinking-ish
                // block on the latest assistant message carries a non-empty signature/data — older
                // turns are already sanitized below (redacted_thinking + DEFAULT_THINKING_CLAUDE_SIGNATURE);
                // the latest turn must go through the same sanitization when its signature is empty.
                const latestHasGenuineThinkingSignature = latestThinkingBlocks.every((b)=>b.type === "redacted_thinking" ? typeof b.data === "string" && b.data.length > 0 : typeof b.signature === "string" && b.signature.length > 0);
                if (latestHasExistingThinking && supportsRedactedThinking && latestHasGenuineThinkingSignature) {
                    continue;
                }
                let hasToolUse = false;
                let hasThinking = false;
                // Pre-collect tool_use ids in this content[] for reasoningCache
                // lookups when the upstream is a non-Anthropic Claude-shape provider.
                // The cache is keyed by tool_call_id which equals tool_use.id for
                // Anthropic-shape (the same value is reused across formats — see
                // claude-to-openai.ts:63 where openai tool_call.id = claude tool_use.id).
                const toolUseIds = [];
                if (!supportsRedactedThinking) {
                    for (const block of content){
                        if (block.type === "tool_use" && typeof block.id === "string") {
                            toolUseIds.push(block.id);
                        }
                    }
                }
                // Convert thinking blocks per provider type:
                //
                // Anthropic-native (claude, anthropic-compatible-*):
                //   Emit redacted_thinking { data } with synthetic blob. Anthropic
                //   accepts this as a valid placeholder for replay context without
                //   re-validating the original signature. Previous behavior — keep.
                //
                //   When requests cross provider boundaries (e.g., combo fallback) or
                //   when client-stored signatures (Capy) replay back to Anthropic, the
                //   original `thinking.signature` no longer validates: "Invalid
                //   signature in thinking block" 400. redacted_thinking accepts without
                //   signature validation — but Anthropic REQUIRES a `data` field.
                //   Field rules: redacted_thinking={type,data} ; thinking={type,thinking,signature}.
                //
                // Non-Anthropic Claude-shape (kimi-coding, glmt, zai, …):
                //   Emit plain thinking { thinking: <text> } using the real reasoning
                //   text from reasoningCache (captured on the prior assistant
                //   response). Falls back to NON_ANTHROPIC_THINKING_PLACEHOLDER if the
                //   cache misses (rare but possible after a process restart or TTL
                //   eviction). Empty text is treated as "missing" by kimi-coding so
                //   never emit an empty thinking field.
                let thinkingBlockIdx = 0;
                for (const block of content){
                    if (block.type === "thinking" || block.type === "redacted_thinking") {
                        if (isKimiCoding) {
                            if (block.type === "redacted_thinking") {
                                block.type = "thinking";
                                block.thinking = typeof block.thinking === "string" ? block.thinking : "";
                            }
                            delete block.data;
                            delete block.signature;
                        } else if (supportsRedactedThinking) {
                            block.type = "redacted_thinking";
                            block.data = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"];
                            delete block.thinking;
                            delete block.signature;
                        } else {
                            const existing = typeof block.thinking === "string" && block.thinking.length > 0 ? block.thinking : "";
                            let text = existing;
                            // For the latest assistant message on non-Anthropic upstreams,
                            // preserve the thinking text verbatim when it is already present.
                            // Cache lookups and the placeholder fallback only apply to older
                            // messages (or to the latest if the client sent empty text).
                            if (!text || !latestHasExistingThinking) {
                                if (!text) {
                                    const pairedToolUseId = toolUseIds[thinkingBlockIdx];
                                    if (pairedToolUseId) {
                                        const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lookupReasoning"])(pairedToolUseId);
                                        if (cached) {
                                            text = cached;
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordReplay"])();
                                        }
                                    }
                                }
                                block.type = "thinking";
                                block.thinking = text || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NON_ANTHROPIC_THINKING_PLACEHOLDER"];
                            } else {
                                // latestHasExistingThinking + non-empty text: preserve text, still clean up fields
                                block.type = "thinking";
                            }
                            delete block.data;
                            delete block.signature;
                        }
                        hasThinking = true;
                        thinkingBlockIdx++;
                    }
                    if (block.type === "tool_use") hasToolUse = true;
                }
                // Add precursor thinking block if thinking enabled + has tool_use but
                // no existing thinking-ish block. Required for Anthropic-shape
                // thinking-mode upstreams (claude, kimi-coding, glm, …) when the
                // assistant turn's content[] needs a thinking block in front of any
                // tool_use. Use the same provider-aware shape selection as above.
                if (thinkingEnabled && !hasThinking && hasToolUse) {
                    if (supportsRedactedThinking) {
                        content.unshift({
                            type: "redacted_thinking",
                            data: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"]
                        });
                    } else if (isKimiCoding) {
                        content.unshift({
                            type: "thinking",
                            thinking: ""
                        });
                    } else {
                        let text = "";
                        const firstToolUseId = toolUseIds[0];
                        if (firstToolUseId) {
                            const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lookupReasoning"])(firstToolUseId);
                            if (cached) {
                                text = cached;
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordReplay"])();
                            }
                        }
                        content.unshift({
                            type: "thinking",
                            thinking: text || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NON_ANTHROPIC_THINKING_PLACEHOLDER"]
                        });
                    }
                }
            }
        }
    }
    // 3. Tools: remove all cache_control, add only to last non-deferred tool with ttl 1h
    // Tools with defer_loading=true cannot have cache_control (API rejects it)
    // In passthrough mode, preserve existing cache_control markers
    if (body.tools && Array.isArray(body.tools) && !preserveCacheControl) {
        body.tools = body.tools.map((tool)=>{
            const { cache_control, ...rest } = tool;
            return rest;
        });
        if (supportsPromptCaching) {
            for(let i = body.tools.length - 1; i >= 0; i--){
                if (!body.tools[i].defer_loading) {
                    body.tools[i].cache_control = {
                        type: "ephemeral",
                        ttl: "1h"
                    };
                    break;
                }
            }
        }
    }
    return body;
}
}),
"[project]/open-sse/services/claudeCodeCCH.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CCH_PATTERN",
    ()=>CCH_PATTERN,
    "computeCCH",
    ()=>computeCCH,
    "signRequestBody",
    ()=>signRequestBody
]);
/**
 * Claude Code CCH (Client Content Hash) signing.
 *
 * Real Claude Code uses Bun/Zig to compute an xxHash64 integrity token over
 * the serialized request body. The server verifies this to confirm the request
 * came from a genuine Claude Code client.
 *
 * Algorithm:
 *   1. Serialize request body with cch=00000 placeholder
 *   2. xxHash64(body_bytes, seed) & 0xFFFFF
 *   3. Zero-padded 5-char lowercase hex
 *   4. Replace cch=00000 with computed value
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xxhash$2d$wasm$2f$esm$2f$xxhash$2d$wasm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xxhash-wasm/esm/xxhash-wasm.js [app-route] (ecmascript)");
;
const CCH_SEED = 0x6e52736ac806831en;
const CCH_PATTERN = /\bcch=([0-9a-f]{5});/;
let xxhashPromise = null;
let xxhash64Fn = null;
async function ensureXxhash() {
    if (xxhash64Fn) return;
    if (!xxhashPromise) {
        xxhashPromise = (async ()=>{
            const hasher = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xxhash$2d$wasm$2f$esm$2f$xxhash$2d$wasm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
            xxhash64Fn = hasher.h64Raw;
        })();
    }
    return xxhashPromise;
}
async function computeCCH(bodyBytes) {
    await ensureXxhash();
    const hash = xxhash64Fn(bodyBytes, CCH_SEED);
    const masked = hash & 0xfffffn;
    return masked.toString(16).padStart(5, "0");
}
async function signRequestBody(bodyString) {
    if (!CCH_PATTERN.test(bodyString)) return bodyString;
    const encoder = new TextEncoder();
    const bodyBytes = encoder.encode(bodyString);
    const token = await computeCCH(bodyBytes);
    return bodyString.replace(CCH_PATTERN, `cch=${token};`);
}
;
}),
"[project]/open-sse/services/claudeCodeCompatibleBeta.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_CODE_COMPATIBLE_ANTHROPIC_BETA",
    ()=>CLAUDE_CODE_COMPATIBLE_ANTHROPIC_BETA,
    "CLAUDE_CODE_COMPATIBLE_REDACT_THINKING_BETA",
    ()=>CLAUDE_CODE_COMPATIBLE_REDACT_THINKING_BETA,
    "resolveClaudeCodeCompatibleAnthropicBeta",
    ()=>resolveClaudeCodeCompatibleAnthropicBeta
]);
const CLAUDE_CODE_COMPATIBLE_BASE_BETAS = [
    "claude-code-20250219",
    "interleaved-thinking-2025-05-14",
    "effort-2025-11-24"
];
const CLAUDE_CODE_COMPATIBLE_REDACT_THINKING_BETA = "redact-thinking-2026-02-12";
function resolveClaudeCodeCompatibleAnthropicBeta(options = {}) {
    const betas = [
        ...CLAUDE_CODE_COMPATIBLE_BASE_BETAS
    ];
    if (options.redactThinking === true) {
        betas.push(CLAUDE_CODE_COMPATIBLE_REDACT_THINKING_BETA);
    }
    return betas.join(",");
}
const CLAUDE_CODE_COMPATIBLE_ANTHROPIC_BETA = resolveClaudeCodeCompatibleAnthropicBeta();
}),
"[project]/open-sse/services/claudeCodeExtraRemap.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extra tool name remapping for third-party agent detection bypass.
 *
 * Anthropic detects non-Claude-Code clients by checking for specific
 * tool names that only third-party agents use (e.g. subagents, session_status).
 * This module adds aliases for those tool names so they look like
 * legitimate Claude Code tools.
 *
 * Mapping: lowercase original → TitleCase alias (sent to Anthropic)
 * Response path reverses automatically via REVERSE_MAP in claudeCodeToolRemapper.ts
 *
 * To update: just add entries to EXTRA_TOOL_RENAME_MAP below.
 */ __turbopack_context__.s([
    "EXTRA_TOOL_RENAME_MAP",
    ()=>EXTRA_TOOL_RENAME_MAP
]);
const EXTRA_TOOL_RENAME_MAP = {
    subagents: "SubDispatch",
    session_status: "CheckStatus"
};
}),
"[project]/open-sse/services/claudeCodeToolRemapper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REVERSE_MAP",
    ()=>REVERSE_MAP,
    "TOOL_RENAME_MAP",
    ()=>TOOL_RENAME_MAP,
    "cloakThirdPartyToolNames",
    ()=>cloakThirdPartyToolNames,
    "isAnthropicServerToolType",
    ()=>isAnthropicServerToolType,
    "needsThirdPartyCloak",
    ()=>needsThirdPartyCloak,
    "remapToolNamesInRequest",
    ()=>remapToolNamesInRequest,
    "remapToolNamesInResponse",
    ()=>remapToolNamesInResponse
]);
/**
 * Claude Code tool name remapping.
 *
 * Anthropic uses tool name fingerprinting to detect third-party clients.
 * Real Claude Code uses TitleCase tool names (Bash, Read, Write, etc.)
 * while third-party clients like OpenCode use lowercase.
 *
 * This module remaps tool names in both directions:
 * - Request path: lowercase → TitleCase (before sending to Anthropic)
 * - Response path: TitleCase → lowercase (for clients expecting lowercase)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeExtraRemap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeExtraRemap.ts [app-route] (ecmascript)");
;
const TOOL_RENAME_MAP = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeExtraRemap$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EXTRA_TOOL_RENAME_MAP"],
    bash: "Bash",
    read: "Read",
    write: "Write",
    edit: "Edit",
    glob: "Glob",
    grep: "Grep",
    task: "Task",
    webfetch: "WebFetch",
    websearch: "WebSearch",
    todowrite: "TodoWrite",
    todoread: "TodoRead",
    question: "Question",
    skill: "Skill",
    multiedit: "MultiEdit",
    notebook: "Notebook",
    lsp: "Lsp",
    apply_patch: "ApplyPatch"
};
const REVERSE_MAP = {};
for (const [k, v] of Object.entries(TOOL_RENAME_MAP)){
    REVERSE_MAP[v] = k;
}
function getRequestToolNameMap(body) {
    const existing = body._toolNameMap instanceof Map ? body._toolNameMap : new Map();
    Object.defineProperty(body, "_toolNameMap", {
        value: existing,
        enumerable: false,
        configurable: true,
        writable: true
    });
    return existing;
}
function trackToolName(body, titleCaseName, originalName) {
    getRequestToolNameMap(body).set(titleCaseName, originalName);
}
/**
 * Names of Anthropic server-side tools declared in this request's tools[].
 * A server tool's `name` is a reserved literal validated against its `type`
 * (web_search_20250305 ⇒ "web_search", bash_20250124 ⇒ "bash", …), so every
 * rewrite below must leave both the declaration AND any history/tool_choice
 * reference to it untouched — renaming only one side produces
 * `Tool 'WebSearch' not found in provided tools` (history renamed, tools[]
 * preserved) or `tools.N.<type>.name: Input should be '<literal>'` (tools[]
 * renamed).
 */ function collectServerToolNames(tools) {
    const names = new Set();
    if (!Array.isArray(tools)) return names;
    for (const tool of tools){
        const t = tool;
        if (t && isAnthropicServerToolType(t.type) && typeof t.name === "string") {
            names.add(t.name);
        }
    }
    return names;
}
function remapToolNamesInRequest(body) {
    let hasLowercase = false;
    let hasTitleCase = false;
    const serverToolNames = collectServerToolNames(body.tools);
    // Remap tool definitions
    const tools = body.tools;
    if (Array.isArray(tools)) {
        for (const tool of tools){
            if (!tool) continue;
            // Server tools (bash_20250124 / web_search_20250305 / …) keep their
            // type-bound literal name.
            if (isAnthropicServerToolType(tool.type)) continue;
            const name = String(tool.name || "");
            if (TOOL_RENAME_MAP[name]) {
                const mapped = TOOL_RENAME_MAP[name];
                tool.name = mapped;
                trackToolName(body, mapped, name);
                hasLowercase = true;
            } else if (REVERSE_MAP[name]) {
                hasTitleCase = true;
            }
        }
    }
    // Remap tool_result references in messages
    const messages = body.messages;
    if (Array.isArray(messages)) {
        for (const msg of messages){
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const block of content){
                if (block.type === "tool_use" && typeof block.name === "string") {
                    if (serverToolNames.has(block.name)) continue;
                    const mapped = TOOL_RENAME_MAP[block.name];
                    if (mapped) {
                        const originalName = block.name;
                        block.name = mapped;
                        trackToolName(body, mapped, originalName);
                        hasLowercase = true;
                    } else if (REVERSE_MAP[block.name]) {
                        hasTitleCase = true;
                    }
                }
            }
        }
    }
    // Remap tool_choice
    const toolChoice = body.tool_choice;
    if (toolChoice?.type === "tool" && typeof toolChoice.name === "string" && !serverToolNames.has(toolChoice.name)) {
        const mapped = TOOL_RENAME_MAP[toolChoice.name];
        if (mapped) {
            const originalName = toolChoice.name;
            toolChoice.name = mapped;
            trackToolName(body, mapped, originalName);
            hasLowercase = true;
        } else if (REVERSE_MAP[toolChoice.name]) {
            hasTitleCase = true;
        }
    }
    // NOTE: do not set body._claudeCodeRequiresLowercaseToolNames here.
    // The flag has no readers and would leak into the outgoing Anthropic
    // request body, causing HTTP 400 (Extra inputs are not permitted).
    // The response-side remap is unconditional via remapToolNamesInResponse.
    return hasLowercase && !hasTitleCase;
}
function remapToolNamesInResponse(text, forceLowercase = true, toolNameMap) {
    if (!forceLowercase) return text;
    // Replace TitleCase tool names back to lowercase in SSE chunks
    if (toolNameMap?.size) {
        for (const [mapped, original] of toolNameMap.entries()){
            text = text.replaceAll(`"name":"${mapped}"`, `"name":"${original}"`);
            text = text.replaceAll(`"name": "${mapped}"`, `"name": "${original}"`);
        }
    }
    for (const [titleCase, lower] of Object.entries(REVERSE_MAP)){
        // Match in "name":"ToolName" patterns
        text = text.replaceAll(`"name":"${titleCase}"`, `"name":"${lower}"`);
        text = text.replaceAll(`"name": "${titleCase}"`, `"name": "${lower}"`);
    }
    return text;
}
;
/**
 * Anthropic fingerprints third-party agent harnesses by their tool NAMES on the
 * first-party Messages API (native Claude OAuth). Two failure modes, both
 * surfaced as a misleading `400 out of extra usage` placeholder (the SSE stream
 * is refused, not a real billing event):
 *   1. Specific blacklisted names (e.g. `mixture_of_agents`) are refused even in
 *      isolation.
 *   2. A large enough SET of recognizable snake_case agent tool names is
 *      refused collectively, even though each name passes on its own.
 *
 * `remapToolNamesInRequest` only normalizes the fixed set of Claude Code tool
 * names. This generalizes that cloak: any tool name that does not already look
 * like a genuine Claude Code tool (PascalCase, no separators) is deterministically
 * aliased — to its Claude Code canonical equivalent when one exists, otherwise to
 * a PascalCase form of the original. The per-request alias is tracked in the
 * non-enumerable `_toolNameMap`, so `remapToolNamesInResponse` restores the
 * caller's original names transparently. Disable with
 * `CLAUDE_DISABLE_TOOL_NAME_CLOAK=true`.
 */ const CLAUDE_BUILTIN_TOOL_NAMES = new Set(Object.values(TOOL_RENAME_MAP));
const HARNESS_CANONICAL_MAP = {
    read_file: "Read",
    write_file: "Write",
    search_files: "Grep",
    grep_search: "Grep",
    list_directory: "Glob",
    run_command: "Bash",
    terminal: "Bash",
    todo: "TodoWrite",
    todo_write: "TodoWrite",
    todo_read: "TodoRead",
    patch: "Edit",
    multi_edit: "MultiEdit"
};
function toPascalCaseToolName(name) {
    const parts = name.split(/[_\s-]+/).filter(Boolean);
    const pascal = parts.map((p)=>p.charAt(0).toUpperCase() + p.slice(1)).join("");
    return pascal || name;
}
function needsThirdPartyCloak(name) {
    if (!name) return false;
    if (CLAUDE_BUILTIN_TOOL_NAMES.has(name)) return false;
    // `mcp__<server>__<tool>` names are genuine Claude Code MCP tool names that
    // Anthropic accepts natively. Cloaking them to PascalCase is unnecessary and,
    // via round-trip asymmetry (a history tool_use keeping the original name while
    // tools[] is cloaked), produces "Tool reference 'mcp__…' not found in available
    // tools" 400s on the native claude OAuth path. Leave the MCP namespace alone.
    if (name.startsWith("mcp__")) return false;
    return /[a-z]/.test(name.charAt(0)) || name.includes("_") || name.includes("-");
}
/**
 * Anthropic server-side tool types whose `name` is a reserved literal that the
 * Messages API validates exactly (e.g. type `web_search_20250305` REQUIRES
 * `name: "web_search"`). These look like third-party harness tools to the name
 * cloak (`web_search` has a `_`, fails the PascalCase test) so without this
 * guard the cloak rewrites the name to `WebSearch` and Anthropic 400s with
 * `tools.N.web_search_20250305.name: Input should be 'web_search'`.
 *
 * Detection mirrors the codebase's existing convention: a versioned built-in
 * tool type carries an 8-digit date suffix (`web_search_20250305`,
 * `code_execution_20250522`, `bash_20250124`, …) — see
 * `stripVersionedToolModelPrefix` in executors/base.ts. The non-versioned
 * aliases (`web_search`, `web_search_preview`) are covered explicitly.
 */ const VERSIONED_SERVER_TOOL_TYPE = /^[a-z][a-z0-9_]*_\d{8}$/;
const NON_VERSIONED_SERVER_TOOL_TYPES = new Set([
    "web_search",
    "web_search_preview"
]);
function isAnthropicServerToolType(type) {
    if (typeof type !== "string" || type.length === 0) return false;
    return VERSIONED_SERVER_TOOL_TYPE.test(type) || NON_VERSIONED_SERVER_TOOL_TYPES.has(type);
}
function cloakThirdPartyToolNames(body, options) {
    // Operator kill-switch (documented in .env.example / ENVIRONMENT.md). Checked
    // here so every call site — native base.ts AND the CLIProxyAPI executor —
    // honours it, rather than each caller having to remember to guard.
    if (process.env.CLAUDE_DISABLE_TOOL_NAME_CLOAK === "true") {
        return new Map();
    }
    const shouldCloak = (name)=>needsThirdPartyCloak(name) && !(options?.skip ? options.skip(name) : false);
    const tools = body.tools;
    // Reserved literal names of declared server tools — never cloaked, neither
    // in tools[] (guarded below) nor in message-history / tool_choice references
    // (renaming only the reference yields "Tool 'WebSearch' not found in
    // provided tools").
    const serverToolNames = collectServerToolNames(tools);
    const used = new Set();
    if (Array.isArray(tools)) {
        for (const tool of tools){
            if (tool && typeof tool.name === "string") used.add(tool.name);
        }
    }
    const existingMap = body._toolNameMap instanceof Map ? body._toolNameMap : null;
    if (existingMap) {
        for (const alias of existingMap.keys())used.add(alias);
    }
    // Created lazily so genuine Claude Code traffic (nothing to cloak) does not
    // get an empty _toolNameMap attached to the request body.
    let nameMap = existingMap;
    const assigned = new Map(); // original -> alias
    const aliasFor = (original)=>{
        const existing = assigned.get(original);
        if (existing) return existing;
        // Prefer the established Claude Code rename maps (TOOL_RENAME_MAP spreads
        // EXTRA_TOOL_RENAME_MAP) so the CPA path matches the native path exactly:
        // subagents->SubDispatch, session_status->CheckStatus, webfetch->WebFetch, …
        // Then harness-canonical (read_file->Read), then a generic PascalCase.
        const base = TOOL_RENAME_MAP[original] ?? HARNESS_CANONICAL_MAP[original] ?? toPascalCaseToolName(original);
        let alias = base;
        let suffix = 2;
        while(alias !== original && used.has(alias)){
            alias = `${base}${suffix++}`;
        }
        used.delete(original);
        used.add(alias);
        assigned.set(original, alias);
        if (!nameMap) nameMap = getRequestToolNameMap(body);
        nameMap.set(alias, original);
        return alias;
    };
    // Non-mutating: clone changed entries rather than rewriting the caller's
    // objects in place (mirrors applyMcpToolNameRewrite — transformRequest must
    // not corrupt an input body that may be logged or replayed on fallback).
    if (Array.isArray(tools)) {
        body.tools = tools.map((tool)=>{
            // Never rewrite the reserved name of an Anthropic server-side tool — its
            // `type` (web_search_20250305, …) binds the API to an exact `name`.
            if (tool && isAnthropicServerToolType(tool.type)) {
                return tool;
            }
            if (tool && typeof tool.name === "string" && shouldCloak(tool.name)) {
                return {
                    ...tool,
                    name: aliasFor(tool.name)
                };
            }
            return tool;
        });
    }
    const messages = body.messages;
    if (Array.isArray(messages)) {
        body.messages = messages.map((message)=>{
            const content = message?.content;
            if (!Array.isArray(content)) return message;
            let changed = false;
            const newContent = content.map((block)=>{
                if (block?.type === "tool_use" && typeof block.name === "string" && !serverToolNames.has(block.name) && shouldCloak(block.name)) {
                    changed = true;
                    return {
                        ...block,
                        name: aliasFor(block.name)
                    };
                }
                return block;
            });
            return changed ? {
                ...message,
                content: newContent
            } : message;
        });
    }
    const toolChoice = body.tool_choice;
    if (toolChoice?.type === "tool" && typeof toolChoice.name === "string" && !serverToolNames.has(toolChoice.name) && shouldCloak(toolChoice.name)) {
        body.tool_choice = {
            ...toolChoice,
            name: aliasFor(toolChoice.name)
        };
    }
    return nameMap ?? new Map();
}
}),
"[project]/open-sse/services/claudeCodeConstraints.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Claude Code API constraints.
 *
 * Enforces Anthropic API requirements that real Claude Code handles:
 * 1. Sampling params under extended thinking: temperature=1 and top_p>=0.95
 *    (or unset) when thinking is enabled/adaptive
 * 2. Disable thinking when tool_choice forces a specific tool
 * 3. Enforce max 4 cache_control breakpoints
 * 4. Normalize cache_control TTL ordering
 */ /**
 * Anthropic's extended-thinking contract rejects non-default sampling params:
 * with thinking enabled/adaptive, `temperature` may only be 1 and `top_p` must
 * be >= 0.95 (or unset) — otherwise the Messages API returns HTTP 400
 * ("`temperature` may only be set to 1 ..." / "`top_p` must be greater than or
 * equal to 0.95 ..."). Clients such as the VS Code Copilot "Ollama" provider
 * routinely send other values (e.g. temperature 0.7, top_p 0.9), and thinking
 * can be injected by per-model requestDefaults *after* the request is built, so
 * normalize here: pin temperature to 1 and drop top_p (Anthropic's "unset"
 * branch — which also preserves the "never send both temperature and top_p"
 * invariant).
 */ __turbopack_context__.s([
    "disableThinkingIfToolChoiceForced",
    ()=>disableThinkingIfToolChoiceForced,
    "enforceCacheControlLimit",
    ()=>enforceCacheControlLimit,
    "enforceThinkingTemperature",
    ()=>enforceThinkingTemperature,
    "ensureCacheControlOnLastUserMessage",
    ()=>ensureCacheControlOnLastUserMessage
]);
function enforceThinkingTemperature(body) {
    const thinking = body.thinking;
    if (thinking?.type === "enabled" || thinking?.type === "adaptive") {
        body.temperature = 1;
        if (body.top_p !== undefined) {
            delete body.top_p;
        }
    }
}
function disableThinkingIfToolChoiceForced(body) {
    const toolChoice = body.tool_choice;
    if (!toolChoice) return;
    const isForced = toolChoice === "any" || typeof toolChoice === "object" && (toolChoice.type === "any" || toolChoice.type === "tool");
    if (isForced && body.thinking) {
        delete body.thinking;
        delete body.context_management;
    }
}
const MAX_CACHE_CONTROL_BLOCKS = 4;
function enforceCacheControlLimit(body) {
    let count = 0;
    // Count in system blocks
    const system = body.system;
    if (Array.isArray(system)) {
        for (const block of system){
            if (block.cache_control) count++;
        }
    }
    // Count in messages
    const messages = body.messages;
    if (Array.isArray(messages)) {
        for (const msg of messages){
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const block of content){
                if (block.cache_control) count++;
            }
        }
    }
    // Count in tools
    const tools = body.tools;
    if (Array.isArray(tools)) {
        for (const tool of tools){
            if (tool.cache_control) count++;
        }
    }
    if (count <= MAX_CACHE_CONTROL_BLOCKS) return;
    // Strip excess cache_control blocks from the end (keep first 4)
    let remaining = MAX_CACHE_CONTROL_BLOCKS;
    if (Array.isArray(system)) {
        for (const block of system){
            if (block.cache_control) {
                if (remaining > 0) {
                    remaining--;
                } else {
                    delete block.cache_control;
                }
            }
        }
    }
    if (Array.isArray(messages)) {
        for (const msg of messages){
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const block of content){
                if (block.cache_control) {
                    if (remaining > 0) {
                        remaining--;
                    } else {
                        delete block.cache_control;
                    }
                }
            }
        }
    }
    if (Array.isArray(tools)) {
        for (const tool of tools){
            if (tool.cache_control) {
                if (remaining > 0) {
                    remaining--;
                } else {
                    delete tool.cache_control;
                }
            }
        }
    }
}
function ensureCacheControlOnLastUserMessage(body) {
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) return;
    const system = body.system;
    const systemCacheControlCount = Array.isArray(system) ? system.filter((block)=>block.cache_control).length : 0;
    for (const message of messages){
        const content = message.content;
        if (Array.isArray(content) && content.some((block)=>block.cache_control)) {
            return;
        }
    }
    if (systemCacheControlCount >= MAX_CACHE_CONTROL_BLOCKS) return;
    // Find the last user message
    for(let i = messages.length - 1; i >= 0; i--){
        if (String(messages[i].role) === "user") {
            const content = messages[i].content;
            if (Array.isArray(content) && content.length > 0) {
                const lastBlock = content[content.length - 1];
                if (!lastBlock.cache_control) {
                    lastBlock.cache_control = {
                        type: "ephemeral"
                    };
                }
            }
            break;
        }
    }
}
}),
"[project]/open-sse/services/claudeCodeCompatibleThinkingDisplay.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyClaudeCodeCompatibleThinkingDisplay",
    ()=>applyClaudeCodeCompatibleThinkingDisplay
]);
const COPILOT_REASONING_SUMMARY_MARKER = "_omnirouteCopilotReasoningSummary";
function applyClaudeCodeCompatibleThinkingDisplay(thinking, options = {}) {
    if (thinking.type === "disabled") {
        return thinking;
    }
    const markerRequestsSummary = options.normalizedBody?.[COPILOT_REASONING_SUMMARY_MARKER] === "summarized";
    const connectionRequestsSummary = options.summarizeThinking === true;
    if (!markerRequestsSummary && !connectionRequestsSummary) {
        return thinking;
    }
    const hasExplicitDisplay = Object.prototype.hasOwnProperty.call(thinking, "display") && thinking.display !== undefined && thinking.display !== null && String(thinking.display).trim().length > 0;
    if (hasExplicitDisplay && !markerRequestsSummary) {
        return thinking;
    }
    return {
        ...thinking,
        display: "summarized"
    };
}
}),
"[project]/open-sse/services/claudeCodeObfuscation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSensitiveWords",
    ()=>getSensitiveWords,
    "obfuscateInBody",
    ()=>obfuscateInBody,
    "obfuscateSensitiveWords",
    ()=>obfuscateSensitiveWords,
    "setSensitiveWords",
    ()=>setSensitiveWords
]);
/**
 * Sensitive word obfuscation for Claude Code requests.
 *
 * Obfuscates configurable words in user messages to prevent detection
 * by upstream content filters. Uses zero-width characters to break
 * pattern matching while preserving readability.
 */ // Unicode zero-width joiner inserted between characters
const ZWJ = "\u200d";
const DEFAULT_SENSITIVE_WORDS = [
    "opencode",
    "open-code",
    "cline",
    "roo-cline",
    "roo_cline",
    "cursor",
    "windsurf",
    "aider",
    "continue.dev",
    "copilot",
    "avante",
    "codecompanion"
];
let sensitiveWords = [
    ...DEFAULT_SENSITIVE_WORDS
];
function setSensitiveWords(words) {
    sensitiveWords = words.length > 0 ? words : [
        ...DEFAULT_SENSITIVE_WORDS
    ];
}
function getSensitiveWords() {
    return [
        ...sensitiveWords
    ];
}
function obfuscateWord(word) {
    if (word.length <= 1) return word;
    // Insert ZWJ after first character
    return word[0] + ZWJ + word.slice(1);
}
// Per-word regex cache — obfuscateSensitiveWords recompiles one RegExp per word on every
// request body otherwise. Bounded by distinct configured words; global regexes are safe to
// reuse because String.replace resets lastIndex.
const _obfuscationRegexCache = new Map();
function getObfuscationRegex(word) {
    let regex = _obfuscationRegexCache.get(word);
    if (!regex) {
        if (_obfuscationRegexCache.size > 2000) _obfuscationRegexCache.clear();
        regex = new RegExp(escapeRegex(word), "gi");
        _obfuscationRegexCache.set(word, regex);
    }
    return regex;
}
function obfuscateSensitiveWords(text) {
    if (!text || sensitiveWords.length === 0) return text;
    let result = text;
    for (const word of sensitiveWords){
        if (!word) continue;
        // Case-insensitive replacement (cached: see getObfuscationRegex)
        const regex = getObfuscationRegex(word);
        result = result.replace(regex, (match)=>obfuscateWord(match));
    }
    return result;
}
function obfuscateInBody(body) {
    // System prompt (Claude format: string or array of blocks)
    if (typeof body.system === "string") {
        body.system = obfuscateSensitiveWords(body.system);
    } else if (Array.isArray(body.system)) {
        for (const block of body.system){
            if (typeof block.text === "string") {
                block.text = obfuscateSensitiveWords(block.text);
            }
        }
    }
    // Messages (all roles, not just user — system/assistant may also contain sensitive words)
    const messages = body.messages;
    if (Array.isArray(messages)) {
        for (const msg of messages){
            const content = msg.content;
            if (typeof content === "string") {
                msg.content = obfuscateSensitiveWords(content);
            } else if (Array.isArray(content)) {
                // Anthropic verifies a signature over a thinking turn. Mutating a text
                // sibling in that same turn invalidates it and makes the next request
                // fail with `Invalid signature in thinking block`.
                const blocks = content;
                const hasSignedThinking = blocks.some((block)=>block?.type === "thinking" || block?.type === "redacted_thinking");
                if (!hasSignedThinking) {
                    for (const block of blocks){
                        if (typeof block.text === "string") {
                            block.text = obfuscateSensitiveWords(block.text);
                        }
                    }
                }
            }
        }
    }
    // Tool descriptions (may contain URLs or names like "opencode")
    const tools = body.tools;
    if (Array.isArray(tools)) {
        for (const tool of tools){
            if (typeof tool.description === "string") {
                tool.description = obfuscateSensitiveWords(tool.description);
            }
            const fn = tool.function;
            if (fn && typeof fn.description === "string") {
                fn.description = obfuscateSensitiveWords(fn.description);
            }
        }
    }
}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
}),
"[project]/open-sse/services/ccBridgeTransforms.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CCH_POSITIONS",
    ()=>CCH_POSITIONS,
    "CCH_SALT",
    ()=>CCH_SALT,
    "CLAUDE_AGENT_SDK_IDENTITY",
    ()=>CLAUDE_AGENT_SDK_IDENTITY,
    "DEFAULT_CC_BRIDGE_PIPELINE",
    ()=>DEFAULT_CC_BRIDGE_PIPELINE,
    "DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG",
    ()=>DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG,
    "DEFAULT_CLAUDE_CODE_VERSION",
    ()=>DEFAULT_CLAUDE_CODE_VERSION,
    "DEFAULT_IDENTITY_PREFIXES",
    ()=>DEFAULT_IDENTITY_PREFIXES,
    "DEFAULT_PARAGRAPH_REMOVAL_ANCHORS",
    ()=>DEFAULT_PARAGRAPH_REMOVAL_ANCHORS,
    "DEFAULT_TEXT_REPLACEMENTS",
    ()=>DEFAULT_TEXT_REPLACEMENTS,
    "applyCcBridgeTransformPipeline",
    ()=>applyCcBridgeTransformPipeline,
    "buildBillingHeaderValue",
    ()=>buildBillingHeaderValue,
    "computeCchSha256FirstUser",
    ()=>computeCchSha256FirstUser,
    "computeDaystampVersionSuffix",
    ()=>computeDaystampVersionSuffix,
    "computeExMachinaVersionSuffix",
    ()=>computeExMachinaVersionSuffix,
    "extractFirstUserMessageText",
    ()=>extractFirstUserMessageText,
    "getCcBridgeTransformsConfig",
    ()=>getCcBridgeTransformsConfig,
    "resetCcBridgeTransformsConfig",
    ()=>resetCcBridgeTransformsConfig,
    "setCcBridgeTransformsConfig",
    ()=>setCcBridgeTransformsConfig
]);
/**
 * CC Bridge Transforms — config-driven request body normalization for the
 * Claude Code Compatible (`anthropic-compatible-cc-*`) bridge.
 *
 * Goal: ensure the final request body OmniRoute sends to Anthropic's
 * `/v1/messages?beta=true` endpoint has classifier-correct structure
 * regardless of which client (OpenCode, Cline, Cursor, Continue, raw API
 * consumer) supplied the prompt.
 *
 * Approach: an ordered pipeline of declarative `TransformOp` entries that
 * mutate the request body in place. Each op is idempotent; the executor is
 * pure (no I/O); new defenses can be added through Settings UI by appending
 * a new op — no new TypeScript needed.
 *
 * Reference implementation: ex-machina/opencode-anthropic-auth `transform.ts`
 * and `cch.ts`. Ported with the same defaults (paragraph anchors, identity
 * prefixes, text replacements, billing header algorithm) but generalised
 * behind a discriminated-union DSL so future fingerprints are configurable.
 *
 * Related: OmniRoute issue #2260.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [app-route] (ecmascript)");
;
;
const CCH_SALT = "59cf53e54c78";
const CCH_POSITIONS = [
    4,
    7,
    20
];
const DEFAULT_CLAUDE_CODE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_AGENT_SDK_IDENTITY = "You are a Claude agent, built on Anthropic's Claude Agent SDK.";
const DEFAULT_PARAGRAPH_REMOVAL_ANCHORS = [
    "github.com/anomalyco/opencode",
    "opencode.ai/docs",
    "github.com/cline/cline",
    "github.com/getcursor/cursor",
    "continue.dev"
];
const DEFAULT_IDENTITY_PREFIXES = [
    "You are OpenCode"
];
const DEFAULT_TEXT_REPLACEMENTS = [
    {
        match: "if OpenCode honestly",
        replacement: "if the assistant honestly"
    },
    {
        match: "Here is some useful information about the environment you are running in:",
        replacement: "Environment context you are running in:"
    }
];
const DEFAULT_CC_BRIDGE_PIPELINE = [
    // Sanitize caller-supplied system blocks first so dropped paragraphs do not
    // accidentally contain a stale billing header from a previous pass.
    {
        kind: "drop_paragraph_if_contains",
        needles: [
            ...DEFAULT_PARAGRAPH_REMOVAL_ANCHORS
        ]
    },
    {
        kind: "drop_paragraph_if_starts_with",
        prefixes: [
            ...DEFAULT_IDENTITY_PREFIXES
        ]
    },
    ...DEFAULT_TEXT_REPLACEMENTS.map((r)=>({
            kind: "replace_text",
            match: r.match,
            replacement: r.replacement,
            allOccurrences: true
        })),
    // Then prepend the SDK identity (becomes block[1] after billing prepend).
    {
        kind: "prepend_system_block",
        text: CLAUDE_AGENT_SDK_IDENTITY,
        idempotencyKey: "claude-agent-sdk-identity"
    },
    // Billing header always lands at block[0] — matches T4-200 fixture layout.
    {
        kind: "inject_billing_header",
        entrypoint: "sdk-cli",
        versionFormat: "ex-machina",
        cchAlgo: "sha256-first-user",
        buildRevision: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_BUILD_REVISION"]
    }
];
const DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG = {
    enabled: true,
    pipeline: DEFAULT_CC_BRIDGE_PIPELINE
};
function extractFirstUserMessageText(messages) {
    if (!Array.isArray(messages)) return "";
    for (const msg of messages){
        if (msg?.role !== "user") continue;
        if (typeof msg.content === "string") return msg.content;
        if (Array.isArray(msg.content)) {
            for (const block of msg.content){
                if (block?.type === "text" && typeof block.text === "string") {
                    return block.text;
                }
            }
        }
    }
    return "";
}
function sha256Hex(input) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(input, "utf8").digest("hex");
}
function pickCharsAtPositions(text, positions) {
    return positions.map((p)=>typeof text[p] === "string" ? text[p] : "\0").join("");
}
function computeExMachinaVersionSuffix(firstUserText, version) {
    const picks = pickCharsAtPositions(firstUserText, CCH_POSITIONS);
    return sha256Hex(`${CCH_SALT}${picks}${version}`).slice(0, 3);
}
function computeDaystampVersionSuffix(version, now = new Date()) {
    const dayStamp = now.toISOString().slice(0, 10);
    return sha256Hex(`${dayStamp}${version}`).slice(0, 3);
}
function computeCchSha256FirstUser(firstUserText) {
    return sha256Hex(firstUserText).slice(0, 5);
}
function buildBillingHeaderValue(messages, options) {
    const version = options.version || DEFAULT_CLAUDE_CODE_VERSION;
    const firstUserText = extractFirstUserMessageText(messages);
    const suffix = options.buildRevision ?? (options.versionFormat === "omniroute-daystamp" ? computeDaystampVersionSuffix(version, options.now) : computeExMachinaVersionSuffix(firstUserText, version));
    let cch;
    switch(options.cchAlgo){
        case "sha256-first-user":
            cch = computeCchSha256FirstUser(firstUserText);
            break;
        case "xxhash64-body":
        case "static-zero":
        default:
            cch = "00000";
            break;
    }
    return `x-anthropic-billing-header: cc_version=${version}.${suffix}; cc_entrypoint=${options.entrypoint}; cch=${cch};`;
}
function normalizeSystemToBlocks(system) {
    if (system === null || system === undefined) return [];
    if (typeof system === "string") {
        return system.length > 0 ? [
            {
                type: "text",
                text: system
            }
        ] : [];
    }
    if (Array.isArray(system)) {
        return system.filter((b)=>!!b && typeof b === "object").map((b)=>({
                ...b
            }));
    }
    if (typeof system === "object") {
        const block = system;
        return block && typeof block.text === "string" ? [
            {
                ...block
            }
        ] : [];
    }
    return [];
}
function isTextBlock(block) {
    return block.type === "text" && typeof block.text === "string";
}
function containsString(haystack, needle, caseSensitive) {
    if (caseSensitive) return haystack.includes(needle);
    return haystack.toLowerCase().includes(needle.toLowerCase());
}
function startsWithString(haystack, prefix, caseSensitive) {
    if (caseSensitive) return haystack.startsWith(prefix);
    return haystack.toLowerCase().startsWith(prefix.toLowerCase());
}
// ────────────────────────────────────────────────────────────────────────────
// Op executors
// ────────────────────────────────────────────────────────────────────────────
function applyDropParagraphIfContains(blocks, op) {
    const caseSensitive = op.caseSensitive !== false;
    const needles = op.needles || [];
    if (needles.length === 0) return blocks;
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        const paragraphs = block.text.split(/\n\n+/);
        const filtered = paragraphs.filter((p)=>!needles.some((n)=>containsString(p, n, caseSensitive)));
        return {
            ...block,
            text: filtered.join("\n\n")
        };
    });
}
function applyDropParagraphIfStartsWith(blocks, op) {
    const caseSensitive = op.caseSensitive !== false;
    const prefixes = op.prefixes || [];
    if (prefixes.length === 0) return blocks;
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        const paragraphs = block.text.split(/\n\n+/);
        const filtered = paragraphs.filter((p)=>!prefixes.some((prefix)=>startsWithString(p.trimStart(), prefix, caseSensitive)));
        return {
            ...block,
            text: filtered.join("\n\n")
        };
    });
}
function applyReplaceText(blocks, op) {
    if (!op.match) return blocks;
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        if (!block.text.includes(op.match)) return block;
        let next = block.text;
        if (op.allOccurrences) {
            next = next.split(op.match).join(op.replacement);
        } else {
            next = next.replace(op.match, op.replacement);
        }
        return {
            ...block,
            text: next
        };
    });
}
function applyReplaceRegex(blocks, op) {
    if (!op.pattern) return blocks;
    let regex;
    try {
        regex = new RegExp(op.pattern, op.flags ?? "u");
    } catch  {
        return blocks;
    }
    return blocks.map((block)=>{
        if (!isTextBlock(block)) return block;
        return {
            ...block,
            text: block.text.replace(regex, op.replacement)
        };
    });
}
function applyDropBlockIfContains(blocks, op) {
    const needles = op.needles || [];
    if (needles.length === 0) return blocks;
    return blocks.filter((block)=>{
        if (!isTextBlock(block)) return true;
        return !needles.some((n)=>block.text.includes(n));
    });
}
function applyPrependSystemBlock(blocks, op) {
    if (!op.text) return blocks;
    // Idempotency: skip if any text block already starts with idempotencyKey (when
    // set) or with op.text itself (default). Scans ALL blocks, not just the first.
    const prefix = op.idempotencyKey ?? op.text;
    const alreadyPresent = blocks.some((b)=>isTextBlock(b) && b.text.startsWith(prefix));
    if (alreadyPresent) return blocks;
    return [
        {
            type: "text",
            text: op.text
        },
        ...blocks
    ];
}
function applyAppendSystemBlock(blocks, op) {
    if (!op.text) return blocks;
    // Idempotency: skip if any text block already starts with idempotencyKey (when
    // set) or is an exact match of op.text (default). Scans ALL blocks.
    const prefix = op.idempotencyKey;
    const alreadyPresent = prefix ? blocks.some((b)=>isTextBlock(b) && b.text.startsWith(prefix)) : blocks.some((b)=>isTextBlock(b) && b.text === op.text);
    if (alreadyPresent) return blocks;
    return [
        ...blocks,
        {
            type: "text",
            text: op.text
        }
    ];
}
function applyInjectBillingHeader(body, blocks, op) {
    // No user message → no billing header (ex-machina parity, transform.ts:340).
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const hasUser = messages.some((m)=>m?.role === "user");
    if (!hasUser) return blocks;
    const headerValue = buildBillingHeaderValue(messages, {
        entrypoint: op.entrypoint,
        versionFormat: op.versionFormat,
        cchAlgo: op.cchAlgo,
        version: op.version,
        buildRevision: op.buildRevision
    });
    // Idempotency: replace any existing billing header block (ex-machina + native
    // OAuth path both rebuild on retry; see executors/base.ts issue #1712).
    const headerPrefix = "x-anthropic-billing-header:";
    const filtered = blocks.filter((b)=>!(isTextBlock(b) && b.text.startsWith(headerPrefix)));
    return [
        {
            type: "text",
            text: headerValue
        },
        ...filtered
    ];
}
function applyCcBridgeTransformPipeline(body, config = getCcBridgeTransformsConfig()) {
    if (!body || typeof body !== "object") {
        return {
            body,
            appliedOpKinds: []
        };
    }
    if (!config.enabled || !Array.isArray(config.pipeline) || config.pipeline.length === 0) {
        return {
            body,
            appliedOpKinds: []
        };
    }
    let blocks = normalizeSystemToBlocks(body.system);
    const appliedOpKinds = [];
    for (const op of config.pipeline){
        switch(op.kind){
            case "drop_paragraph_if_contains":
                blocks = applyDropParagraphIfContains(blocks, op);
                break;
            case "drop_paragraph_if_starts_with":
                blocks = applyDropParagraphIfStartsWith(blocks, op);
                break;
            case "replace_text":
                blocks = applyReplaceText(blocks, op);
                break;
            case "replace_regex":
                blocks = applyReplaceRegex(blocks, op);
                break;
            case "drop_block_if_contains":
                blocks = applyDropBlockIfContains(blocks, op);
                break;
            case "prepend_system_block":
                blocks = applyPrependSystemBlock(blocks, op);
                break;
            case "append_system_block":
                blocks = applyAppendSystemBlock(blocks, op);
                break;
            case "inject_billing_header":
                blocks = applyInjectBillingHeader(body, blocks, op);
                break;
            default:
                {
                    continue;
                }
        }
        appliedOpKinds.push(op.kind);
    }
    // Drop empty text blocks left behind by paragraph removal (matches
    // ex-machina sanitizeSystemText trim semantics).
    blocks = blocks.filter((b)=>!isTextBlock(b) || b.text.length > 0);
    body.system = blocks;
    return {
        body,
        appliedOpKinds
    };
}
// ────────────────────────────────────────────────────────────────────────────
// Runtime singleton (mirrors cliFingerprints `_cliCompatProviders` pattern).
// ────────────────────────────────────────────────────────────────────────────
let _runtimeConfig = DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG;
function setCcBridgeTransformsConfig(config) {
    if (!config) {
        _runtimeConfig = DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG;
        return;
    }
    _runtimeConfig = {
        enabled: config.enabled !== false,
        pipeline: Array.isArray(config.pipeline) ? config.pipeline : DEFAULT_CC_BRIDGE_PIPELINE
    };
}
function getCcBridgeTransformsConfig() {
    return _runtimeConfig;
}
function resetCcBridgeTransformsConfig() {
    _runtimeConfig = DEFAULT_CC_BRIDGE_TRANSFORMS_CONFIG;
}
}),
"[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE",
    ()=>DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE,
    "DEFAULT_CLAUDE_PIPELINE",
    ()=>DEFAULT_CLAUDE_PIPELINE,
    "DEFAULT_OBFUSCATE_WORDS",
    ()=>DEFAULT_OBFUSCATE_WORDS,
    "DEFAULT_SYSTEM_TRANSFORMS_CONFIG",
    ()=>DEFAULT_SYSTEM_TRANSFORMS_CONFIG,
    "HERMES_IDENTITY_PREFIXES",
    ()=>HERMES_IDENTITY_PREFIXES,
    "HERMES_PARAGRAPH_ANCHORS",
    ()=>HERMES_PARAGRAPH_ANCHORS,
    "OPENWEBUI_IDENTITY_PREFIXES",
    ()=>OPENWEBUI_IDENTITY_PREFIXES,
    "OPENWEBUI_PARAGRAPH_ANCHORS",
    ()=>OPENWEBUI_PARAGRAPH_ANCHORS,
    "PI_PARAGRAPH_ANCHORS",
    ()=>PI_PARAGRAPH_ANCHORS,
    "PROVIDER_CC_BRIDGE",
    ()=>PROVIDER_CC_BRIDGE,
    "PROVIDER_CLAUDE",
    ()=>PROVIDER_CLAUDE,
    "applySystemTransformPipeline",
    ()=>applySystemTransformPipeline,
    "applyTransformPipeline",
    ()=>applyTransformPipeline,
    "getSystemTransformsConfig",
    ()=>getSystemTransformsConfig,
    "resetSystemTransformsConfig",
    ()=>resetSystemTransformsConfig,
    "setSystemTransformsConfig",
    ()=>setSystemTransformsConfig
]);
/**
 * System Transforms — generic, per-provider, config-driven body normalization.
 *
 * Generalises the CC-bridge-only transforms (`ccBridgeTransforms.ts`) into
 * a per-provider registry so the same pipeline DSL can run against ANY
 * provider's request body: native `claude` OAuth, `anthropic-compatible-cc-*`
 * bridge, `gemini`, `codex`, `openai`, etc.
 *
 * Each provider has its own `{ enabled, pipeline }`. Defaults shipped:
 *   - `claude`: obfuscate_words ON (adds Open WebUI words on top of native
 *     ZWJ pass). Billing+sentinel handled by native code (executors/base.ts
 *     :753-782); DSL on this path does NOT inject billing.
 *   - `anthropic-compatible-cc-*`: full T4-200 pipeline (anchors + identity
 *     prefixes + replacements + prepend identity + inject_billing_header).
 *   - all other providers: `{ enabled: false, pipeline: [] }`.
 *
 * Adds a new op kind `obfuscate_words` (ZWJ insertion driven by configurable
 * word list, replaces the hardcoded `claudeCodeObfuscation.ts` defaults for
 * users who opt-in).
 *
 * Migration: legacy `ccBridgeTransforms` config (single-pipeline shape) is
 * accepted and normalized into `systemTransforms.providers["anthropic-compatible-cc-*"]`.
 *
 * Reference: OmniRoute issue #2260 + comment 4459544580 (Open WebUI bypass).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccBridgeTransforms.ts [app-route] (ecmascript)");
;
;
const DEFAULT_OBFUSCATE_WORDS = [
    // legacy hardcoded set
    "opencode",
    "open-code",
    "cline",
    "roo-cline",
    "roo_cline",
    "cursor",
    "windsurf",
    "aider",
    "continue.dev",
    "copilot",
    "avante",
    "codecompanion",
    // Open WebUI additions
    "openwebui",
    "open-webui",
    // Hermes additions (#8350)
    "hermes-agent",
    "hermes"
];
const OPENWEBUI_PARAGRAPH_ANCHORS = [
    "github.com/open-webui/open-webui",
    "openwebui.com",
    "docs.openwebui.com"
];
const OPENWEBUI_IDENTITY_PREFIXES = [
    "You are Open WebUI"
];
const PI_PARAGRAPH_ANCHORS = [
    "@earendil-works/pi-coding-agent",
    "/.pi/",
    "Pi documentation (read only when the user asks about pi itself"
];
const HERMES_PARAGRAPH_ANCHORS = [
    "hermes-agent.nousresearch.com",
    "github.com/NousResearch/hermes-agent"
];
const HERMES_IDENTITY_PREFIXES = [
    "You are Hermes Agent"
];
const PROVIDER_CLAUDE = "claude";
const PROVIDER_CC_BRIDGE = "anthropic-compatible-cc";
const DEFAULT_CLAUDE_PIPELINE = [
    // Drop paragraphs containing 3rd-party-agent anchors (anomalyco/opencode,
    // opencode.ai/docs, cline, getcursor/cursor, continue.dev, Open WebUI, Pi docs).
    {
        kind: "drop_paragraph_if_contains",
        needles: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_PARAGRAPH_REMOVAL_ANCHORS"],
            ...OPENWEBUI_PARAGRAPH_ANCHORS,
            ...PI_PARAGRAPH_ANCHORS,
            ...HERMES_PARAGRAPH_ANCHORS
        ]
    },
    // Drop "You are OpenCode" + "You are Open WebUI" + "You are Hermes Agent"
    // identity paragraphs.
    {
        kind: "drop_paragraph_if_starts_with",
        prefixes: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_IDENTITY_PREFIXES"],
            ...OPENWEBUI_IDENTITY_PREFIXES,
            ...HERMES_IDENTITY_PREFIXES
        ]
    },
    // Replace the "Here is some useful information about the environment you are
    // running in:" billing-gate trigger phrase + the "if OpenCode honestly"
    // phrase-shape filter (DEFAULT_TEXT_REPLACEMENTS from ccBridgeTransforms.ts).
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_TEXT_REPLACEMENTS"].map((r)=>({
            kind: "replace_text",
            match: r.match,
            replacement: r.replacement,
            allOccurrences: true
        })),
    // ZWJ obfuscation of sensitive client words (opencode, cline, cursor, …,
    // openwebui). Layers on top of the legacy `obfuscateInBody` pass at
    // `executors/base.ts:622` (which only covers `DEFAULT_SENSITIVE_WORDS`).
    {
        kind: "obfuscate_words",
        words: [
            ...DEFAULT_OBFUSCATE_WORDS
        ],
        targets: [
            "system",
            "messages",
            "tools"
        ]
    }
];
const DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE = [
    // Extra Open WebUI anchors (the base pipeline only carries OpenCode/Cline/
    // Cursor/Continue anchors).
    {
        kind: "drop_paragraph_if_contains",
        needles: [
            ...OPENWEBUI_PARAGRAPH_ANCHORS
        ]
    },
    {
        kind: "drop_paragraph_if_starts_with",
        prefixes: [
            ...OPENWEBUI_IDENTITY_PREFIXES
        ]
    },
    // ZWJ obfuscate Open WebUI words across system+messages+tools.
    {
        kind: "obfuscate_words",
        words: [
            "openwebui",
            "open-webui"
        ],
        targets: [
            "system",
            "messages",
            "tools"
        ]
    },
    // Base CC bridge pipeline (anchors + identity prefixes + replacements +
    // prepend SDK identity + inject billing header).
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_CC_BRIDGE_PIPELINE"]
];
const DEFAULT_SYSTEM_TRANSFORMS_CONFIG = {
    providers: {
        [PROVIDER_CLAUDE]: {
            // Enabled by default — matches the module-level docstring ("claude:
            // obfuscate_words ON …") and closes the native-OAuth third-party-agent
            // leak that surfaces as `[400] Third-party apps now draw from extra
            // usage` when opencode (or any non-claude-cli client) hits OmniRoute's
            // `/v1/chat/completions` endpoint with a `claude/*` model slug. User
            // overrides via Settings UI (setSystemTransformsConfig) still win.
            enabled: true,
            pipeline: DEFAULT_CLAUDE_PIPELINE
        },
        [PROVIDER_CC_BRIDGE]: {
            enabled: true,
            pipeline: DEFAULT_CC_BRIDGE_PROVIDER_PIPELINE
        }
    }
};
// ────────────────────────────────────────────────────────────────────────────
// Op: obfuscate_words (the only op kind beyond the base set).
// ────────────────────────────────────────────────────────────────────────────
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const ZWJ = "\u200d";
function obfuscateWord(word) {
    if (word.length <= 1) return word;
    return word[0] + ZWJ + word.slice(1);
}
/**
 * Stateless variant of `obfuscateSensitiveWords` — uses the supplied word
 * list instead of the module-level singleton, so concurrent requests with
 * different op configs do not race.
 */ // Per-word regex cache: obfuscateWithList runs over the whole request body on every
// request when obfuscation is enabled, recompiling one RegExp per word each time. The
// word list is stable per op config, so memoize. Bounded by distinct configured words
// (with a defensive cap). Global regexes are safe to reuse: String.replace resets lastIndex.
const _obfuscationRegexCache = new Map();
function getObfuscationRegex(word) {
    let regex = _obfuscationRegexCache.get(word);
    if (!regex) {
        if (_obfuscationRegexCache.size > 2000) _obfuscationRegexCache.clear();
        regex = new RegExp(escapeRegex(word), "gi");
        _obfuscationRegexCache.set(word, regex);
    }
    return regex;
}
function obfuscateWithList(text, words) {
    if (!text || words.length === 0) return text;
    let result = text;
    for (const word of words){
        if (!word) continue;
        const regex = getObfuscationRegex(word);
        result = result.replace(regex, (match)=>obfuscateWord(match));
    }
    return result;
}
function applyObfuscateWords(body, op) {
    const words = op.words || [];
    if (words.length === 0) return;
    const targets = op.targets && op.targets.length > 0 ? op.targets : [
        "system",
        "messages",
        "tools"
    ];
    if (targets.includes("system")) {
        if (typeof body.system === "string") {
            body.system = obfuscateWithList(body.system, words);
        } else if (Array.isArray(body.system)) {
            for (const block of body.system){
                if (typeof block.text === "string") {
                    block.text = obfuscateWithList(block.text, words);
                }
            }
        }
    }
    if (targets.includes("messages") && Array.isArray(body.messages)) {
        for (const msg of body.messages){
            const content = msg.content;
            if (typeof content === "string") {
                msg.content = obfuscateWithList(content, words);
            } else if (Array.isArray(content)) {
                // A signed Anthropic thinking turn covers its text siblings too. Leave
                // the entire turn byte-for-byte intact so its signature remains valid.
                const blocks = content;
                const hasSignedThinking = blocks.some((block)=>block?.type === "thinking" || block?.type === "redacted_thinking");
                if (!hasSignedThinking) {
                    for (const block of blocks){
                        if (typeof block.text === "string") {
                            block.text = obfuscateWithList(block.text, words);
                        }
                    }
                }
            }
        }
    }
    if (targets.includes("tools") && Array.isArray(body.tools)) {
        for (const tool of body.tools){
            if (typeof tool.description === "string") {
                tool.description = obfuscateWithList(tool.description, words);
            }
            const fn = tool.function;
            if (fn && typeof fn.description === "string") {
                fn.description = obfuscateWithList(fn.description, words);
            }
        }
    }
}
function isObfuscateWordsOp(op) {
    return op.kind === "obfuscate_words";
}
function applyTransformPipeline(body, pipeline) {
    if (!body || typeof body !== "object") return {
        body,
        appliedOpKinds: []
    };
    if (!Array.isArray(pipeline) || pipeline.length === 0) {
        return {
            body,
            appliedOpKinds: []
        };
    }
    const appliedOpKinds = [];
    let baseRun = [];
    const flushBaseRun = ()=>{
        if (baseRun.length === 0) return;
        const config = {
            enabled: true,
            pipeline: baseRun
        };
        // Local `RequestBody` interface is intentionally looser than the strict one
        // exported by ccBridgeTransforms — system transforms accept any shape.
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyCcBridgeTransformPipeline"])(body, config);
        appliedOpKinds.push(...result.appliedOpKinds);
        baseRun = [];
    };
    for (const op of pipeline){
        if (isObfuscateWordsOp(op)) {
            flushBaseRun();
            applyObfuscateWords(body, op);
            appliedOpKinds.push(op.kind);
        } else {
            baseRun.push(op);
        }
    }
    flushBaseRun();
    return {
        body,
        appliedOpKinds
    };
}
function applySystemTransformPipeline(providerId, body, config = getSystemTransformsConfig()) {
    if (!body || typeof body !== "object") return {
        body,
        appliedOpKinds: []
    };
    if (!config || !config.providers) return {
        body,
        appliedOpKinds: []
    };
    const providerConfig = resolveProviderConfig(providerId, config);
    if (!providerConfig || !providerConfig.enabled) {
        return {
            body,
            appliedOpKinds: []
        };
    }
    return applyTransformPipeline(body, providerConfig.pipeline);
}
function resolveProviderConfig(providerId, config) {
    if (!providerId) return undefined;
    const exact = config.providers[providerId];
    if (exact) return exact;
    // CC bridge providers (anthropic-compatible-cc-*) all share one config.
    if (providerId.startsWith(`${PROVIDER_CC_BRIDGE}-`) || providerId === PROVIDER_CC_BRIDGE) {
        return config.providers[PROVIDER_CC_BRIDGE];
    }
    return undefined;
}
// ────────────────────────────────────────────────────────────────────────────
// Runtime singleton.
// ────────────────────────────────────────────────────────────────────────────
// Backed by globalThis so the config is shared across the SEPARATE webpack module
// graphs Next.js builds for `instrumentation.ts` (boot-time hydration via
// applyRuntimeSettings → setSystemTransformsConfig) and the app-route / open-sse
// executors (per-request reads in base.ts / claudeCodeCompatible.ts). A module-local
// `let` is duplicated per graph, so a Settings-UI override applied at boot never
// reaches the request path (the #5312-class module-graph bug; the protective
// compiled default still runs, but operator customizations were silently dropped).
// Mirrors systemPrompt.ts (#2470) and thinkingBudget.ts (#5312).
const GLOBAL_KEY = "__omniroute_systemTransforms_config__";
const _store = globalThis;
function getStore() {
    if (!_store[GLOBAL_KEY]) {
        _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
    }
    return _store[GLOBAL_KEY];
}
function setSystemTransformsConfig(input) {
    if (!input || typeof input !== "object") {
        _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
        return;
    }
    const candidate = input;
    // Legacy shape: { enabled, pipeline } → migrate to per-provider map.
    if ("pipeline" in candidate && Array.isArray(candidate.pipeline)) {
        _store[GLOBAL_KEY] = {
            providers: {
                ...DEFAULT_SYSTEM_TRANSFORMS_CONFIG.providers,
                [PROVIDER_CC_BRIDGE]: {
                    enabled: candidate.enabled !== false,
                    pipeline: candidate.pipeline
                }
            }
        };
        return;
    }
    // Per-provider shape: { providers: Record<string, { enabled, pipeline }> }
    if ("providers" in candidate && candidate.providers && typeof candidate.providers === "object") {
        const next = {
            providers: {}
        };
        const providers = candidate.providers;
        for (const [providerId, providerEntry] of Object.entries(providers)){
            if (!providerEntry || typeof providerEntry !== "object") continue;
            const entry = providerEntry;
            next.providers[providerId] = {
                enabled: entry.enabled !== false,
                pipeline: Array.isArray(entry.pipeline) ? entry.pipeline : []
            };
        }
        // Merge defaults for any unset provider — keeps ZWJ on by default even
        // when the user only configured one provider explicitly.
        for (const [providerId, providerDefault] of Object.entries(DEFAULT_SYSTEM_TRANSFORMS_CONFIG.providers)){
            if (!next.providers[providerId]) {
                next.providers[providerId] = providerDefault;
            }
        }
        _store[GLOBAL_KEY] = next;
        return;
    }
    _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
}
function getSystemTransformsConfig() {
    return getStore();
}
function resetSystemTransformsConfig() {
    _store[GLOBAL_KEY] = DEFAULT_SYSTEM_TRANSFORMS_CONFIG;
}
}),
"[project]/open-sse/services/ccWireImageBuiltins.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Built-in provider ids that must adopt the dynamic Claude-Code wire image
 * (fingerprint headers/order + system transforms + `?beta=true` chat path)
 * WITHOUT inheriting the Claude-Code-Compatible family's default anthropic
 * baseUrl / Bearer auth.
 *
 * These providers keep their own registry `baseUrl` and auth scheme
 * (e.g. `agentrouter` → `https://agentrouter.org/v1/messages` + `x-api-key`),
 * while the two CC predicates (`isClaudeCodeCompatible` /
 * `isClaudeCodeCompatibleProvider`) and `applyFingerprint` treat them as CC
 * for the wire-image concerns only. The CC-baseUrl / CC-Bearer branches in
 * `buildProviderUrl` / `buildProviderHeaders` are guarded so the registry
 * baseUrl + auth are preserved.
 *
 * Single source of truth — imported by both predicates so they never diverge.
 * See issue #6056.
 */ __turbopack_context__.s([
    "CC_WIRE_IMAGE_BUILTINS",
    ()=>CC_WIRE_IMAGE_BUILTINS,
    "usesCcWireImage",
    ()=>usesCcWireImage
]);
const CC_WIRE_IMAGE_BUILTINS = new Set([
    "agentrouter"
]);
function usesCcWireImage(provider) {
    return typeof provider === "string" && CC_WIRE_IMAGE_BUILTINS.has(provider);
}
}),
"[project]/open-sse/services/ccOpenAiMediaBlocks.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectClaudeMediaBlocks",
    ()=>collectClaudeMediaBlocks,
    "convertOpenAiMediaBlock",
    ()=>convertOpenAiMediaBlock
]);
/**
 * OpenAI-format media parts reach the Claude-Code-compatible bridge
 * untranslated when the source client speaks OpenAI (chatCore skips the
 * OpenAI→Claude translator for CC-compatible providers), so `image_url` /
 * AI SDK `image` / Chat Completions `file` parts must become Claude blocks
 * before dispatch or the upstream silently ignores them (#7777).
 * Claude-native blocks (`image`/`document` carrying `source`) are left for
 * the caller to pass through unchanged.
 */ const DATA_URL_BASE64_PATTERN = /^data:([^;]+);base64,(.+)$/;
function convertOpenAiMediaBlock(record) {
    if (record.type === "image_url") {
        const rawUrl = typeof record.image_url === "string" ? record.image_url : readRecord(record.image_url)?.url;
        return claudeImageBlockFromUrl(rawUrl);
    }
    if (record.type === "image" && !readRecord(record.source) && typeof record.image === "string") {
        return claudeImageBlockFromUrl(record.image);
    }
    if (record.type === "file") {
        const file = readRecord(record.file);
        const fileData = toNonEmptyString(file?.file_data) || toNonEmptyString(file?.data);
        if (!fileData) return null;
        const title = toNonEmptyString(file?.filename);
        const match = fileData.match(DATA_URL_BASE64_PATTERN);
        if (match) {
            const mediaType = match[1];
            const source = {
                type: "base64",
                media_type: mediaType,
                data: match[2]
            };
            if (mediaType === "application/pdf") {
                return {
                    type: "document",
                    source,
                    ...title ? {
                        title
                    } : {}
                };
            }
            if (mediaType.startsWith("image/")) {
                return {
                    type: "image",
                    source
                };
            }
            return null;
        }
        if (/^https?:\/\//i.test(fileData)) {
            return {
                type: "document",
                source: {
                    type: "url",
                    url: fileData
                },
                ...title ? {
                    title
                } : {}
            };
        }
        return null;
    }
    return null;
}
function collectClaudeMediaBlocks(content) {
    if (!Array.isArray(content)) return [];
    const blocks = [];
    for (const part of content){
        const record = readRecord(cloneValue(part));
        if (!record) continue;
        const media = convertOpenAiMediaBlock(record);
        if (media) {
            blocks.push(media);
            continue;
        }
        if ((record.type === "image" || record.type === "document") && readRecord(record.source)) {
            blocks.push(record);
        }
    }
    return blocks;
}
function claudeImageBlockFromUrl(rawUrl) {
    const url = toNonEmptyString(rawUrl);
    if (!url) return null;
    const match = url.match(DATA_URL_BASE64_PATTERN);
    if (match) {
        return {
            type: "image",
            source: {
                type: "base64",
                media_type: match[1],
                data: match[2]
            }
        };
    }
    return {
        type: "image",
        source: {
            type: "url",
            url
        }
    };
}
function readRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function toNonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function cloneValue(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
}),
"[project]/open-sse/utils/registeredEffortVariants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRegisteredProviderEffortBaseModelId",
    ()=>getRegisteredProviderEffortBaseModelId,
    "isRegisteredProviderEffortVariant",
    ()=>isRegisteredProviderEffortVariant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
;
const REGISTERED_EFFORT_SUFFIXES = [
    "none",
    "low",
    "medium",
    "high",
    "max",
    "xhigh"
];
function getRegisteredProviderEffortBaseModelId(providerId, modelId) {
    const providerModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderModels"])(providerId);
    if (!providerModels.some((candidate)=>candidate.id === modelId)) {
        return null;
    }
    for (const effort of REGISTERED_EFFORT_SUFFIXES){
        const suffix = `-${effort}`;
        if (!modelId.endsWith(suffix)) continue;
        const baseModelId = modelId.slice(0, -suffix.length);
        return providerModels.some((candidate)=>candidate.id === baseModelId) ? baseModelId : null;
    }
    return null;
}
function isRegisteredProviderEffortVariant(providerId, modelId) {
    return getRegisteredProviderEffortBaseModelId(providerId, modelId) !== null;
}
}),
"[project]/open-sse/services/model.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_NATIVE_UNPREFIXED_MODELS",
    ()=>CODEX_NATIVE_UNPREFIXED_MODELS,
    "getModelInfoCore",
    ()=>getModelInfoCore,
    "normalizeCrossProxyModelId",
    ()=>normalizeCrossProxyModelId,
    "parseModel",
    ()=>parseModel,
    "resolveBareModelToConnectionDefault",
    ()=>resolveBareModelToConnectionDefault,
    "resolveCanonicalProviderModel",
    ()=>resolveCanonicalProviderModel,
    "resolveModelAliasFromMap",
    ()=>resolveModelAliasFromMap,
    "resolveProviderAlias",
    ()=>resolveProviderAlias,
    "splitSyncedEffortSuffix",
    ()=>splitSyncedEffortSuffix,
    "stripContextWindowSuffix",
    ()=>stripContextWindowSuffix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/registeredEffortVariants.ts [app-route] (ecmascript)");
;
;
;
// Client context-window tags are routing hints, not part of provider model IDs.
const CONTEXT_WINDOW_SUFFIX_RE = /\[(\d+)([kKmM])?\]\s*$/;
function stripContextWindowSuffix(modelStr) {
    if (typeof modelStr !== "string" || !modelStr) return modelStr;
    return modelStr.replace(CONTEXT_WINDOW_SUFFIX_RE, "").trimEnd();
}
// Derive alias→provider mapping from the single source of truth (PROVIDER_ID_TO_ALIAS)
// This prevents the two maps from drifting out of sync
const ALIAS_TO_PROVIDER_ID = {};
for (const [id, alias] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
    if (ALIAS_TO_PROVIDER_ID[alias]) {
        console.log(`[MODEL] Warning: alias "${alias}" maps to both "${ALIAS_TO_PROVIDER_ID[alias]}" and "${id}". Using "${id}".`);
    }
    ALIAS_TO_PROVIDER_ID[alias] = id;
}
// Manual alias overrides — maps slug-style prefixes to canonical provider IDs.
// These live outside the registry because they represent multiple providers
// or backward-compatible slug changes, not a single provider's display name.
// opencode/ → opencode-zen (the main free/open tier; opencode-go is a separate paid tier)
ALIAS_TO_PROVIDER_ID["opencode"] = "opencode-zen";
// xiaomi/ is the user-visible prefix for MiMo models; register it so
// parseModel("xiaomi/mimo-v2-flash") resolves provider = "xiaomi-mimo" instead
// of falling through to the identity fallback ("xiaomi").
ALIAS_TO_PROVIDER_ID["xiaomi"] = "xiaomi-mimo";
// llamacpp/ is the user-visible alias for the llama-cpp self-hosted provider.
// The canonical ID is "llama-cpp" (with a hyphen), but the catalog and user-facing
// prefix is "llamacpp". Register it so parseModel("llamacpp/<model>") resolves
// provider = "llama-cpp" instead of the identity fallback ("llamacpp").
ALIAS_TO_PROVIDER_ID["llamacpp"] = "llama-cpp";
// agy/ is the short alias for antigravity provider.
ALIAS_TO_PROVIDER_ID["agy"] = "antigravity";
// aq/ is the user-visible prefix for the Amazon Q (AWS Builder ID) provider.
// The canonical provider ID is "amazon-q". Register it so parseModel("aq/<model>")
// resolves provider = "amazon-q" instead of falling through to the identity fallback.
ALIAS_TO_PROVIDER_ID["aq"] = "amazon-q";
// Provider-scoped legacy model aliases. Used to normalize provider/model inputs
// and keep backward compatibility when upstream IDs change.
const PROVIDER_MODEL_ALIASES = {
    openai: {
        "gpt-4o-mini": "gpt-4o-mini"
    },
    github: {
        "claude-4.5-opus": "claude-opus-4-5-20251101",
        "claude-opus-4.5": "claude-opus-4-5-20251101",
        "gemini-3-pro": "gemini-3.1-pro-preview",
        "gemini-3-pro-preview": "gemini-3.1-pro-preview",
        "gemini-3-flash": "gemini-3-flash-preview",
        "raptor-mini": "oswe-vscode-prime"
    },
    gemini: {
        "gemini-3.1-pro": "gemini-3.1-pro-preview",
        "gemini-3-1-pro": "gemini-3.1-pro-preview"
    },
    nvidia: {
        "gpt-oss-120b": "openai/gpt-oss-120b",
        "nvidia/gpt-oss-120b": "openai/gpt-oss-120b",
        "gpt-oss-20b": "openai/gpt-oss-20b",
        "nvidia/gpt-oss-20b": "openai/gpt-oss-20b"
    },
    synthetic: {
        "syn:gpt-oss-120b": "hf:openai/gpt-oss-120b",
        "syn:large:text": "hf:zai-org/GLM-5.2",
        "syn:large:vision": "hf:moonshotai/Kimi-K2.7-Code",
        "syn:small:vision": "hf:Qwen/Qwen3.6-27B",
        "syn:minimax-m3": "hf:MiniMaxAI/MiniMax-M3",
        "syn:small:text": "hf:zai-org/GLM-4.7-Flash",
        "syn:nemotron-3-super": "hf:nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4"
    },
    // Antigravity public model ids already match the upstream wire ids. Keep this map
    // empty so the global resolver cannot rewrite them before routing or logging.
    antigravity: {},
    kiro: {
        "claude-opus-4-7": "claude-opus-4.7",
        "claude-opus-4-6": "claude-opus-4.6",
        "claude-sonnet-4-6": "claude-sonnet-4.6",
        "claude-sonnet-4-5": "claude-sonnet-4.5",
        "claude-haiku-4-5": "claude-haiku-4.5"
    }
};
const CROSS_PROXY_MODEL_ALIASES = {
    "gpt-oss:120b": "gpt-oss-120b",
    "deepseek-v3.2-chat": "deepseek-v3.2",
    "deepseek-v3-2": "deepseek-v3.2",
    "qwen3-coder:480b": "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    "claude-opus-4.5": "claude-opus-4-5-20251101",
    "anthropic/claude-opus-4.5": "claude-opus-4-5-20251101"
};
const CROSS_PROXY_MODEL_ALIASES_LOWER = Object.fromEntries(Object.entries(CROSS_PROXY_MODEL_ALIASES).map(([alias, canonical])=>[
        alias.toLowerCase(),
        canonical
    ]));
// Reverse index: modelId -> providerIds that expose this model
const MODEL_TO_PROVIDERS = new Map();
for (const [aliasOrId, models] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"])){
    const providerId = ALIAS_TO_PROVIDER_ID[aliasOrId] || aliasOrId;
    for (const modelEntry of models || []){
        const modelId = modelEntry?.id;
        if (!modelId) continue;
        const providers = MODEL_TO_PROVIDERS.get(modelId) || [];
        if (!providers.includes(providerId)) {
            providers.push(providerId);
            MODEL_TO_PROVIDERS.set(modelId, providers);
        }
    }
}
const KNOWN_MODEL_IDS = new Set(MODEL_TO_PROVIDERS.keys());
const CODEX_NATIVE_UNPREFIXED_MODELS = new Set([
    "codex-auto-review",
    "gpt-5.6-sol",
    "gpt-5.6-sol-ultra",
    "gpt-5.6-sol-max",
    "gpt-5.6-sol-xhigh",
    "gpt-5.6-sol-high",
    "gpt-5.6-sol-medium",
    "gpt-5.6-sol-low",
    "gpt-5.6-terra",
    "gpt-5.6-terra-ultra",
    "gpt-5.6-terra-max",
    "gpt-5.6-terra-xhigh",
    "gpt-5.6-terra-high",
    "gpt-5.6-terra-medium",
    "gpt-5.6-terra-low",
    "gpt-5.6-luna",
    "gpt-5.6-luna-max",
    "gpt-5.6-luna-xhigh",
    "gpt-5.6-luna-high",
    "gpt-5.6-luna-medium",
    "gpt-5.6-luna-low",
    "gpt-5.5",
    "gpt-5.5-xhigh",
    "gpt-5.5-high",
    "gpt-5.5-medium",
    "gpt-5.5-low",
    "gpt-5.3-codex-spark"
]);
function resolveProviderAlias(aliasOrId) {
    if (typeof aliasOrId !== "string") return null;
    // Follow the alias chain transitively so intermediate alias-only hops resolve
    // to the final target, but STOP as soon as a hop lands on a registered
    // provider id (#2901): "oc" must resolve to the no-auth "opencode" provider,
    // NOT continue through the manual "opencode" → "opencode-zen" slug override —
    // that override is for user-typed `opencode/` prefixes only. Without this
    // boundary the no-auth provider becomes unreachable by any prefix.
    // Guarded against infinite loops with both a depth limit and a seen-set.
    let current = aliasOrId;
    const seen = new Set();
    for(let i = 0; i < 10; i++){
        const next = ALIAS_TO_PROVIDER_ID[current];
        if (!next || next === current) return current;
        if (next in __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"]) return next;
        if (seen.has(next)) return next;
        seen.add(next);
        current = next;
    }
    return current;
}
function resolveBareModelToConnectionDefault(requestedModelStr, resolvedModel, connectionDefaultModel) {
    const fallback = typeof resolvedModel === "string" ? resolvedModel : null;
    if (typeof requestedModelStr !== "string" || requestedModelStr.includes("/")) {
        return fallback;
    }
    if (typeof connectionDefaultModel === "string" && connectionDefaultModel.length > 0) {
        return connectionDefaultModel;
    }
    return fallback;
}
function isCrossProxyModelCompatEnabled() {
    const raw = process.env.MODEL_ALIAS_COMPAT_ENABLED;
    return raw !== "false" && raw !== "0";
}
function normalizeCrossProxyModelId(modelId) {
    if (!modelId || typeof modelId !== "string" || !isCrossProxyModelCompatEnabled()) {
        return {
            modelId: typeof modelId === "string" ? modelId : null,
            applied: false,
            original: null
        };
    }
    const normalized = CROSS_PROXY_MODEL_ALIASES[modelId] || CROSS_PROXY_MODEL_ALIASES_LOWER[modelId.toLowerCase()];
    if (!normalized || normalized === modelId) {
        return {
            modelId,
            applied: false,
            original: null
        };
    }
    console.debug(`[MODEL] Cross-proxy alias applied: "${modelId}" → "${normalized}"`);
    return {
        modelId: normalized,
        applied: true,
        original: modelId
    };
}
/**
 * Resolve provider-specific legacy model alias to canonical model ID.
 */ function resolveProviderModelAlias(providerOrAlias, modelId) {
    if (!modelId || typeof modelId !== "string") return modelId;
    const providerId = resolveProviderAlias(providerOrAlias);
    if (typeof providerId !== "string") return modelId;
    const aliases = PROVIDER_MODEL_ALIASES[providerId];
    return aliases?.[modelId] || modelId;
}
function hasKnownProviderModel(providerOrAlias, modelId) {
    if (!providerOrAlias || !modelId) return false;
    const providerId = resolveProviderAlias(providerOrAlias);
    if (typeof providerId !== "string") return false;
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerId] || providerId;
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerAlias] || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerId] || [];
    if (models.some((entry)=>entry?.id === modelId)) return true;
    const aliases = PROVIDER_MODEL_ALIASES[providerId];
    if (aliases && Object.prototype.hasOwnProperty.call(aliases, modelId)) return true;
    const canonicalModel = resolveProviderModelAlias(providerId, modelId);
    if (canonicalModel === modelId) return false;
    return true;
}
function resolveInferredProviderModel(provider, modelId) {
    return resolveProviderModelAlias(provider, modelId);
}
function getInferredProvidersForModel(modelId, dynamicProviders = []) {
    return Array.from(new Set([
        ...MODEL_TO_PROVIDERS.get(modelId) || [],
        ...dynamicProviders
    ]));
}
function isProviderConnectionActive(connection) {
    if (connection.isActive !== undefined) {
        return connection.isActive !== false && connection.isActive !== 0;
    }
    if (connection.is_active !== undefined) {
        return connection.is_active !== false && connection.is_active !== 0;
    }
    return false;
}
function getProviderIdFromConnection(connection) {
    if (!connection || typeof connection !== "object") return null;
    const record = connection;
    if (typeof record.provider !== "string" || !record.provider) return null;
    if (!isProviderConnectionActive(record)) return null;
    return resolveProviderAlias(record.provider);
}
async function getActiveProviderSet() {
    try {
        const { getCachedProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const conns = await getCachedProviderConnections();
        const providers = conns.map(getProviderIdFromConnection).filter((provider)=>Boolean(provider));
        return new Set(providers);
    } catch  {
        return null;
    }
}
async function getActiveSyncedProvidersForModel(modelId) {
    try {
        const { getActiveProvidersWithSyncedModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const providers = await getActiveProvidersWithSyncedModel(modelId);
        return providers.map(resolveProviderAlias).filter((provider)=>typeof provider === "string");
    } catch  {
        return [];
    }
}
async function reconcileInferredProvidersWithActiveCatalog(providerIds, modelId) {
    const uniqueProviders = Array.from(new Set(providerIds));
    try {
        const { reconcileProvidersWithActiveSyncedCatalog } = await __turbopack_context__.A("[project]/src/lib/db/models/activeSyncedCatalog.ts [app-route] (ecmascript, async loader)");
        const reconciliations = await Promise.all(uniqueProviders.map(async (provider)=>{
            const effortBaseModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRegisteredProviderEffortBaseModelId"])(provider, modelId);
            const catalogModelId = effortBaseModelId ?? modelId;
            const reconciliation = await reconcileProvidersWithActiveSyncedCatalog([
                provider
            ], catalogModelId);
            return {
                provider,
                allowed: reconciliation.providers.includes(provider),
                excluded: reconciliation.excludedProviders.includes(provider)
            };
        }));
        return {
            providers: reconciliations.filter((result)=>result.allowed).map((result)=>result.provider),
            excludedProviders: reconciliations.filter((result)=>result.excluded).map((result)=>result.provider)
        };
    } catch  {
        return {
            providers: uniqueProviders,
            excludedProviders: []
        };
    }
}
function isTruthyEnv(value) {
    return typeof value === "string" && /^(1|true|yes|on)$/i.test(value.trim());
}
async function getPreferClaudeCodeForUnprefixedClaudeModels() {
    try {
        const { getCachedSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const settings = await getCachedSettings();
        if (typeof settings.preferClaudeCodeForUnprefixedClaudeModels === "boolean") {
            return settings.preferClaudeCodeForUnprefixedClaudeModels;
        }
    } catch  {
    // Standalone open-sse usage may not have the app DB layer available.
    }
    return isTruthyEnv(process.env.OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS);
}
function shouldPreferClaudeCodeForUnprefixedClaudeModel(modelId, activeProviders, preferClaudeCode) {
    if (!preferClaudeCode || !/^claude-/i.test(modelId)) {
        return false;
    }
    // If DB/provider state is unavailable in a lightweight runtime, honor the
    // explicit operator flag and let the normal credential path report any missing
    // Claude Code account. When state is available, avoid stealing traffic from
    // other Claude-family providers unless Claude Code is actually active.
    return activeProviders === null || activeProviders.size === 0 || activeProviders.has("claude");
}
function shouldTreatAsExactModelId(modelStr) {
    if (!modelStr || typeof modelStr !== "string" || !modelStr.includes("/")) return false;
    if (!KNOWN_MODEL_IDS.has(modelStr)) return false;
    const firstSlash = modelStr.indexOf("/");
    const providerOrAlias = modelStr.slice(0, firstSlash).trim();
    const providerScopedModel = modelStr.slice(firstSlash + 1).trim();
    return !hasKnownProviderModel(providerOrAlias, providerScopedModel);
}
function resolveCanonicalProviderModel(providerOrAlias, modelId) {
    if (!modelId || typeof modelId !== "string") {
        return {
            provider: resolveProviderAlias(providerOrAlias),
            model: modelId || null
        };
    }
    const provider = resolveProviderAlias(providerOrAlias);
    return {
        provider,
        model: resolveProviderModelAlias(provider, modelId)
    };
}
function parseModel(modelStr) {
    // Guard truthy non-strings (object/number/array), not just falsy values — a
    // malformed combo `modelStr` or providerSpecificData saved as an object would
    // otherwise reach `cleanStr.endsWith("[1m]")` and crash with
    // `endsWith is not a function`. Same class as #2359 / #2463.
    if (!modelStr || typeof modelStr !== "string") {
        return {
            provider: null,
            model: null,
            isAlias: false,
            providerAlias: null,
            extendedContext: false
        };
    }
    // Sanitize: reject strings with path traversal or control characters
    if (/\.\.[\/\\]/.test(modelStr) || /[\x00-\x1f]/.test(modelStr)) {
        console.log(`[MODEL] Warning: rejected malformed model string: "${modelStr.substring(0, 50)}"`);
        return {
            provider: null,
            model: null,
            isAlias: false,
            providerAlias: null,
            extendedContext: false
        };
    }
    // Extract the legacy [1m] marker while stripping all client context tags.
    let extendedContext = false;
    const cleanStripped = stripContextWindowSuffix(modelStr);
    let cleanStr = cleanStripped;
    if (/\[1m\]\s*$/i.test(modelStr)) {
        extendedContext = true;
    }
    cleanStr = cleanStr.trim();
    // Normalize known cross-proxy provider/model dialects before deciding whether
    // the slash belongs to a provider prefix or to the model ID itself.
    if (cleanStr.includes("/")) {
        cleanStr = normalizeCrossProxyModelId(cleanStr).modelId || cleanStr;
    }
    if (shouldTreatAsExactModelId(cleanStr)) {
        console.debug(`[MODEL] Treating "${cleanStr}" as an exact model id`);
        return {
            provider: null,
            model: cleanStr,
            isAlias: true,
            providerAlias: null,
            extendedContext
        };
    }
    // Check if standard format: provider/model or alias/model
    if (cleanStr.includes("/")) {
        const firstSlash = cleanStr.indexOf("/");
        const providerOrAlias = cleanStr.slice(0, firstSlash).trim();
        const model = cleanStr.slice(firstSlash + 1).trim();
        const provider = resolveProviderAlias(providerOrAlias);
        return {
            provider,
            model,
            isAlias: false,
            providerAlias: providerOrAlias,
            extendedContext
        };
    }
    // Alias format (model alias, not provider alias)
    return {
        provider: null,
        model: cleanStr,
        isAlias: true,
        providerAlias: null,
        extendedContext
    };
}
function splitSyncedEffortSuffix(modelId, knownEfforts) {
    if (typeof modelId !== "string" || !modelId || !Array.isArray(knownEfforts)) {
        return {
            baseModel: modelId,
            effort: null
        };
    }
    for (const effort of knownEfforts){
        if (typeof effort !== "string" || !effort) continue;
        const suffix = `-${effort}`;
        if (modelId.length > suffix.length && modelId.endsWith(suffix)) {
            return {
                baseModel: modelId.slice(0, -suffix.length),
                effort
            };
        }
    }
    return {
        baseModel: modelId,
        effort: null
    };
}
function resolveModelAliasFromMap(alias, aliases) {
    const resolved = resolveModelAliasTarget(alias, aliases);
    if (!resolved?.provider) return null;
    return {
        provider: resolved.provider,
        model: resolved.model
    };
}
function resolveModelAliasTarget(alias, aliases) {
    if (!alias || !aliases) return null;
    const resolved = aliases[alias];
    if (!resolved) return null;
    if (typeof resolved === "string") {
        return parseAliasTarget(resolved);
    }
    if (resolved && typeof resolved === "object" && typeof resolved.provider === "string" && typeof resolved.model === "string") {
        const normalizedPair = normalizeCrossProxyModelId(`${resolved.provider}/${resolved.model}`).modelId;
        if (normalizedPair && normalizedPair !== `${resolved.provider}/${resolved.model}`) {
            return parseAliasTarget(normalizedPair);
        }
        return {
            provider: resolveProviderAlias(resolved.provider),
            model: normalizeCrossProxyModelId(resolved.model).modelId || resolved.model
        };
    }
    return null;
}
function parseAliasTarget(target) {
    const normalizedTarget = normalizeCrossProxyModelId(target).modelId;
    if (!normalizedTarget || typeof normalizedTarget !== "string") return null;
    if (normalizedTarget.includes("/")) {
        if (shouldTreatAsExactModelId(normalizedTarget)) {
            return {
                model: normalizedTarget
            };
        }
        const firstSlash = normalizedTarget.indexOf("/");
        return {
            provider: resolveProviderAlias(normalizedTarget.slice(0, firstSlash)),
            model: normalizedTarget.slice(firstSlash + 1)
        };
    }
    return {
        model: normalizedTarget
    };
}
async function resolveModelByProviderInference(modelId, extendedContext) {
    const [activeProviders, activeSyncedProviders, preferClaudeCodeForUnprefixedClaudeModels] = await Promise.all([
        getActiveProviderSet(),
        getActiveSyncedProvidersForModel(modelId),
        getPreferClaudeCodeForUnprefixedClaudeModels()
    ]);
    // Codex-native bare ids prefer the ChatGPT subscription, but the preference is only
    // allowed to PREEMPT another provider when a codex connection is actually active.
    // Returning "codex" unconditionally (as this did once the set grew past
    // `codex-auto-review` to cover gpt-5.5 / the gpt-5.6-sol tiers) hands ids that OpenAI
    // also serves to a provider the operator may not have configured: an OpenAI-only
    // install fails with "no active credentials for provider: codex" on a model that
    // works, and an install whose codex connection is merely *inactive* fails the same way.
    // Ids only codex catalogs (e.g. `codex-auto-review`) keep resolving to codex with no
    // connection at all — there is no alternative to preempt, and "no codex credentials"
    // is the honest error. With codex active the preference still beats OpenAI, and an
    // explicit `openai/…` prefix remains the per-request override either way.
    if (CODEX_NATIVE_UNPREFIXED_MODELS.has(modelId)) {
        const codexNativeAlternatives = (MODEL_TO_PROVIDERS.get(modelId) || []).filter((p)=>p !== "codex");
        if (codexNativeAlternatives.length === 0 || activeProviders?.has("codex")) {
            return {
                provider: "codex",
                model: modelId,
                extendedContext
            };
        }
    }
    const candidateProviders = getInferredProvidersForModel(modelId, activeSyncedProviders);
    const { providers, excludedProviders } = await reconcileInferredProvidersWithActiveCatalog(candidateProviders, modelId);
    if (providers.length === 0 && excludedProviders.length > 0) {
        return {
            provider: null,
            model: modelId,
            extendedContext,
            errorType: "model_not_found",
            errorMessage: `Model '${modelId}' is not available in the active live catalog for provider(s): ${excludedProviders.join(", ")}.`
        };
    }
    const nonOpenAIProviders = providers.filter((p)=>p !== "openai");
    // Bare model IDs from Codex CLI do not preserve OmniRoute's `cx/` prefix.
    // Route overlapping models through Codex only for Codex-only installations;
    // when OpenAI is also active, preserve the historical OpenAI default below.
    // Models advertised only by an active synced Codex catalog still reach the
    // single-candidate path, covering future models without version-specific sets.
    if (activeProviders?.has("codex") && !activeProviders.has("openai") && providers.includes("codex")) {
        return {
            provider: "codex",
            model: resolveInferredProviderModel("codex", modelId),
            extendedContext
        };
    }
    // Outside the Codex subscription preference above, preserve the historical
    // OpenAI default whenever its catalog contains the bare model ID. Callers can
    // always make either route authoritative with an explicit provider prefix.
    if (providers.includes("openai")) {
        return {
            provider: "openai",
            model: modelId,
            extendedContext
        };
    }
    // Fallback for newly released OpenAI-family model IDs that may not be in the local
    // catalog yet. This must only fire when NO known provider catalogs the model id —
    // otherwise it hijacks cataloged open-weight models like "gpt-oss-120b" (served by
    // fireworks/cerebras/scaleway/byteplus) into provider "openai", which does not carry
    // them (#5852).
    if (providers.length === 0 && (/^gpt-/i.test(modelId) || /^o1/i.test(modelId) || /^o3/i.test(modelId))) {
        return {
            provider: "openai",
            model: modelId,
            extendedContext
        };
    }
    const candidatesToUse = nonOpenAIProviders;
    if (candidatesToUse.includes("claude") && shouldPreferClaudeCodeForUnprefixedClaudeModel(modelId, activeProviders, preferClaudeCodeForUnprefixedClaudeModels)) {
        return {
            provider: "claude",
            model: resolveInferredProviderModel("claude", modelId),
            extendedContext
        };
    }
    // Canonicalize candidates (deduplicate alias providers pointing to the same provider ID)
    const canonicalCandidates = Array.from(new Set(candidatesToUse.map((p)=>resolveProviderAlias(p)).filter((p)=>p !== null)));
    // Filter candidates by active connections configured in the database
    let activeCandidates = [];
    if (activeProviders && activeProviders.size > 0) {
        activeCandidates = canonicalCandidates.filter((p)=>activeProviders.has(p));
    }
    // An authoritative active live catalog excluded at least one static
    // candidate, and none of the remaining static candidates has an active
    // connection. Do not escape the live-catalog decision by selecting an
    // unrelated inactive provider that happens to share the same static model id.
    if (activeProviders && activeProviders.size > 0 && activeCandidates.length === 0 && excludedProviders.length > 0) {
        return {
            provider: null,
            model: modelId,
            extendedContext,
            errorType: "model_not_found",
            errorMessage: `Model '${modelId}' is not available in the active live catalog for provider(s): ${excludedProviders.join(", ")}.`
        };
    }
    // Auto-pick:
    // 1. If active providers match, pick from active candidates (first active provider).
    // 2. If no active providers filter applied, but canonical candidates deduplicate to 1 provider, pick it.
    const effectiveCandidates = activeCandidates.length > 0 ? activeCandidates : canonicalCandidates;
    if (effectiveCandidates.length >= 1) {
        if (activeCandidates.length > 0 || effectiveCandidates.length === 1) {
            const provider = effectiveCandidates[0];
            const canonicalModel = resolveInferredProviderModel(provider, modelId);
            return {
                provider,
                model: canonicalModel,
                extendedContext
            };
        }
    }
    if (candidatesToUse.length > 1) {
        const aliasesForHint = candidatesToUse.map((p)=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][p] || p);
        const hints = aliasesForHint.slice(0, 2).map((alias)=>`${alias}/${modelId}`);
        const message = `Ambiguous model '${modelId}'. Use provider/model prefix (ex: ${hints.join(" or ")}).`;
        console.warn(`[MODEL] ${message} Candidates: ${aliasesForHint.join(", ")}`);
        return {
            provider: null,
            model: modelId,
            errorType: "ambiguous_model",
            errorMessage: message,
            candidateProviders: candidatesToUse,
            candidateAliases: aliasesForHint
        };
    }
    // Fallback: infer provider from known model name prefixes before defaulting to openai
    // FIX #73: Models like claude-haiku-4-5-20251001 sent without provider prefix
    // would incorrectly route to OpenAI. Use heuristic prefix detection first.
    if (/^claude-/i.test(modelId)) {
        if (shouldPreferClaudeCodeForUnprefixedClaudeModel(modelId, activeProviders, preferClaudeCodeForUnprefixedClaudeModels)) {
            return {
                provider: "claude",
                model: modelId,
                extendedContext
            };
        }
        // Claude models → Anthropic provider (canonical source for Claude models)
        return {
            provider: "anthropic",
            model: modelId,
            extendedContext
        };
    }
    if (/^gemini-/i.test(modelId) || /^gemma-/i.test(modelId)) {
        // Gemini/Gemma models → Gemini provider
        return {
            provider: "gemini",
            model: modelId,
            extendedContext
        };
    }
    // Last resort: no provider could be inferred — return a clear error instead
    // of silently defaulting to "openai", which would produce a misleading
    // "No credentials for provider: openai" response when the model name
    // is unrecognised (e.g. a missing combo, a typo, or a bare model id
    // that doesn't exist in any provider's catalog).
    return {
        provider: null,
        model: modelId,
        extendedContext,
        errorType: "model_not_found",
        errorMessage: `Unable to determine provider for model '${modelId}'. Use a provider/model prefix (e.g. openai/${modelId}) or ensure the model is added as a combo entry.`
    };
}
async function getModelInfoCore(modelStr, aliasesOrGetter) {
    const parsed = parseModel(modelStr);
    const { extendedContext } = parsed;
    if (!parsed.isAlias) {
        const normalizedModel = normalizeCrossProxyModelId(parsed.model).modelId;
        const canonicalModel = resolveProviderModelAlias(parsed.provider, normalizedModel);
        return {
            provider: parsed.provider,
            model: canonicalModel,
            extendedContext
        };
    }
    // Get aliases (from object or function)
    const aliases = typeof aliasesOrGetter === "function" ? await aliasesOrGetter() : aliasesOrGetter;
    // Local alias map (user-provided 2nd arg) wins over all cross-proxy /
    // provider inference paths. When the alias target is a slashful string like
    // "openai/gpt-4o", parse it directly as <provider>/<model> and return
    // immediately — before shouldTreatAsExactModelId() or cross-proxy inference
    // can misclassify the target (e.g. because bazaarlink catalogs it verbatim).
    if (aliases && parsed.model) {
        const directTarget = aliases[parsed.model];
        if (typeof directTarget === "string") {
            const slashIdx = directTarget.indexOf("/");
            if (slashIdx !== -1) {
                const providerPart = directTarget.slice(0, slashIdx);
                const modelPart = directTarget.slice(slashIdx + 1);
                const provider = resolveProviderAlias(providerPart);
                const canonicalModel = resolveProviderModelAlias(provider, modelPart);
                return {
                    provider,
                    model: canonicalModel,
                    extendedContext
                };
            }
        }
    }
    // Resolve exact alias
    const resolved = resolveModelAliasTarget(parsed.model, aliases);
    if (resolved?.provider) {
        const canonicalModel = resolveProviderModelAlias(resolved.provider, resolved.model);
        return {
            provider: resolved.provider,
            model: canonicalModel,
            extendedContext
        };
    }
    if (resolved?.model) {
        return await resolveModelByProviderInference(resolved.model, extendedContext);
    }
    // T13: Try wildcard alias (glob patterns like "claude-sonnet-*" → "anthropic/claude-sonnet-4-...")
    if (aliases && typeof aliases === "object") {
        const aliasEntries = Object.entries(aliases).map(([pattern, target])=>({
                pattern,
                target: typeof target === "string" ? target : ""
            }));
        const wildcardMatch = parsed.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveWildcardAlias"])(parsed.model, aliasEntries) : null;
        if (wildcardMatch) {
            const target = wildcardMatch.target;
            if (target.includes("/")) {
                const firstSlash = target.indexOf("/");
                const providerOrAlias = target.slice(0, firstSlash);
                const targetModel = target.slice(firstSlash + 1);
                const provider = resolveProviderAlias(providerOrAlias);
                const canonicalModel = resolveProviderModelAlias(provider, targetModel);
                return {
                    provider,
                    model: canonicalModel,
                    extendedContext,
                    wildcardPattern: wildcardMatch.pattern
                };
            }
        }
    }
    const normalizedModelId = normalizeCrossProxyModelId(parsed.model).modelId;
    if (!normalizedModelId) {
        return {
            provider: null,
            model: null,
            extendedContext
        };
    }
    return await resolveModelByProviderInference(normalizedModelId, extendedContext);
}
}),
"[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized specifications for AI Models.
 * Contains maximum token caps and thinking budgets to prevent API errors
 * when clients request more than the model supports.
 */ __turbopack_context__.s([
    "MODEL_SPECS",
    ()=>MODEL_SPECS,
    "capMaxOutputTokens",
    ()=>capMaxOutputTokens,
    "capThinkingBudget",
    ()=>capThinkingBudget,
    "findModelSpecIdByExactOrAlias",
    ()=>findModelSpecIdByExactOrAlias,
    "getAuthoritativeContextWindow",
    ()=>getAuthoritativeContextWindow,
    "getAuthoritativeProviderContextWindow",
    ()=>getAuthoritativeProviderContextWindow,
    "getCanonicalModelSpecId",
    ()=>getCanonicalModelSpecId,
    "getDefaultThinkingBudget",
    ()=>getDefaultThinkingBudget,
    "getMaxEffortWhenThinkingDisabled",
    ()=>getMaxEffortWhenThinkingDisabled,
    "getModelSpec",
    ()=>getModelSpec,
    "isAdaptiveThinkingOnly",
    ()=>isAdaptiveThinkingOnly,
    "normalizeThinkingForModel",
    ()=>normalizeThinkingForModel,
    "resolveModelAlias",
    ()=>resolveModelAlias
]);
const BEDROCK_CLAUDE_ALIASES = (...modelIds)=>[
        ...new Set(modelIds.flatMap((modelId)=>[
                modelId,
                `anthropic.${modelId}`,
                `eu.anthropic.${modelId}`,
                `us.anthropic.${modelId}`,
                `global.anthropic.${modelId}`,
                `bedrock/anthropic.${modelId}`,
                `bedrock/eu.anthropic.${modelId}`,
                `bedrock/us.anthropic.${modelId}`,
                `bedrock/global.anthropic.${modelId}`
            ]))
    ];
// Provider discovery/sync sources can under-report GLM-5.2 IDs as 128K.
// Keep native/bare Z.AI GLM-5.2 context authoritative, but do not blindly apply
// it to every provider-wrapped alias: hosted providers can and do cap lower.
const AUTHORITATIVE_CONTEXT_WINDOW_MODEL_IDS = new Set([
    "glm-5.2",
    "glm-5.2-high",
    "glm-5.2-max"
]);
const AUTHORITATIVE_PROVIDER_CONTEXT_WINDOWS = new Map([
    [
        "cloudflare-ai/@cf/zai-org/glm-5.2",
        262144
    ],
    // Hugging Face Router has 1M-capable backends, but bare routing can select
    // lower-context providers (notably Together at 262K), so advertise a safe floor
    // unless the caller can pin a 1M-capable backend.
    [
        "huggingface/zai-org/glm-5.2",
        262144
    ],
    [
        "opencode/glm-5.2",
        1000000
    ],
    [
        "opencode-zen/glm-5.2",
        1000000
    ],
    [
        "opencode-go/glm-5.2",
        1000000
    ],
    [
        "zenmux/z-ai/glm-5.2",
        1000000
    ],
    [
        "zenmux/z-ai/glm-5.2-free",
        1000000
    ]
]);
const GPT_5_6_MODEL_SPEC = {
    maxOutputTokens: 128000,
    contextWindow: 1050000,
    // Reserve 32K for visible response: thinking + response must both fit
    // under maxOutputTokens. A cap equal to maxOutputTokens leaves zero room
    // for the actual response when thinking consumes the full budget.
    thinkingBudgetCap: 96000,
    supportsThinking: true,
    supportsTools: true,
    supportsVision: true
};
const GEMINI_35_FLASH_MODEL_SPEC = {
    maxOutputTokens: 65536,
    contextWindow: 1048576,
    supportsThinking: false,
    supportsTools: true,
    supportsVision: true
};
const MODEL_SPECS = {
    "gpt-5.6": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6"
        ]
    },
    "gpt-5.6-sol": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-sol"
        ]
    },
    "gpt-5.6-terra": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-terra"
        ]
    },
    "gpt-5.6-luna": {
        ...GPT_5_6_MODEL_SPEC,
        aliases: [
            "openai/gpt-5.6-luna"
        ]
    },
    "gpt-5.5": {
        maxOutputTokens: 128000,
        contextWindow: 1050000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "gpt-5.4": {
        maxOutputTokens: 131072,
        contextWindow: 409600,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-5.4"
        ]
    },
    // ── GPT-4o family ──────────────────────────────────────────────
    "gpt-4o-mini": {
        maxOutputTokens: 16384,
        contextWindow: 128000,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-4o-mini"
        ]
    },
    "gpt-4o": {
        maxOutputTokens: 16384,
        contextWindow: 128000,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "openai/gpt-4o"
        ]
    },
    // ── Gemini 2.5 and 3.5 Flash series ──────────────────────────────
    "gemini-2.5-flash": {
        maxOutputTokens: 65536,
        contextWindow: 1048576,
        // #3842: real Google max thinking budget for 2.5-flash is 24576; declaring the
        // cap makes capThinkingBudget() actually clamp instead of passing values through.
        thinkingBudgetCap: 24576,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true
    },
    "gemini-3.5-flash-extra-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        thinkingBudgetCap: 0
    },
    "gemini-3.5-flash-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3-flash-agent": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        thinkingBudgetCap: 0
    },
    // ── Gemini 3.6 Flash (Antigravity live tiers) ───────────────────
    // The model id itself selects the upstream 10k/4k/1k reasoning tier. Antigravity
    // still rejects client-supplied thinking parameters, so keep the explicit-parameter
    // capability aligned with the existing Gemini 3.5 tier ids.
    "gemini-3.6-flash-high": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3.6-flash-medium": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    "gemini-3.6-flash-low": {
        ...GEMINI_35_FLASH_MODEL_SPEC
    },
    // ── Gemini 3 Flash series ───────────────────────────────────────
    "gemini-3-flash": {
        maxOutputTokens: 65536,
        contextWindow: 1048576,
        defaultThinkingBudget: 0,
        thinkingBudgetCap: 0,
        supportsThinking: false,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite-preview"
        ]
    },
    // ── Gemini 3.1 Pro ───────────────────────────────────────────────
    "gemini-3.1-pro": {
        maxOutputTokens: 65535,
        contextWindow: 1048576,
        defaultThinkingBudget: 24576,
        thinkingBudgetCap: 32768,
        thinkingOverhead: 1000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-pro-agent",
            "gemini-3.1-pro-high",
            "gemini-3-pro-high",
            "gemini-3-pro-preview",
            "gemini-3.1-pro-preview",
            "gemini-3.1-pro-preview-customtools"
        ]
    },
    // ── Gemini 3.1 Pro Low (deprecated, kept for back-compat) ────────
    "gemini-3.1-pro-low": {
        maxOutputTokens: 65535,
        contextWindow: 1048576,
        defaultThinkingBudget: 8192,
        thinkingBudgetCap: 16000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "gemini-3-pro-low"
        ]
    },
    // ── Gemini 3.5 Flash ─────────────────────────────────────────────
    "gemini-3.5-flash": {
        ...GEMINI_35_FLASH_MODEL_SPEC,
        aliases: [
            "gemini-3.5-flash-high"
        ]
    },
    // ── Claude Opus 4.5 ─────────────────────────────────────────────
    "claude-opus-4-5": {
        maxOutputTokens: 32768,
        contextWindow: 200000,
        defaultThinkingBudget: 10000,
        thinkingBudgetCap: 32000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Claude Sonnet 4.5 ───────────────────────────────────────────
    "claude-sonnet-4-5": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-4-5", "claude-sonnet-4-5-20250929")
    },
    // ── Claude Opus 4.5 (full ID — overrides prefix match on claude-opus-4-5) ──
    "claude-opus-4-5-20251101": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        defaultThinkingBudget: 10000,
        thinkingBudgetCap: 32000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Claude Sonnet 4.6 ───────────────────────────────────────────
    "claude-sonnet-4-6": {
        maxOutputTokens: 64000,
        contextWindow: 1000000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-4-6", "claude-sonnet-4.6")
    },
    // ── Claude Sonnet 5 ─────────────────────────────────────────────
    "claude-sonnet-5": {
        // 1M context, 128K max output. Adaptive-thinking-only (manual
        // budget_tokens / thinking.type:"enabled" return 400; effort-steered);
        // unlike Fable 5 it still accepts thinking.type:"disabled".
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-sonnet-5")
    },
    // ── Claude Opus 4.6 ─────────────────────────────────────────────
    "claude-opus-4-6": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Anthropic accepts thinking.budget_tokens in [1024, 128000]; cap
        // a bit below to leave headroom for the visible response within
        // max_tokens (thinking + response must both fit under max_tokens).
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-6", "claude-opus-4.6")
    },
    // ── Claude Opus 4.7 ─────────────────────────────────────────────
    "claude-opus-4-7": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Opus 4.7 removed manual extended thinking: a fixed `thinking.budget_tokens`
        // (or `thinking.type:"enabled"`) returns 400. Reasoning is adaptive-only and
        // steered by `output_config.effort`. defaultThinkingBudget/thinkingBudgetCap
        // are retained only as caps for any legacy budget path; the request flow
        // collapses manual thinking to adaptive before dispatch (see adaptiveThinkingOnly).
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-7", "claude-opus-4.7")
    },
    // ── Claude Fable 5 ──────────────────────────────────────────────
    "claude-fable-5": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        // Fable 5 defaults to adaptive thinking and rejects `thinking.type:"disabled"` (#3554).
        rejectsThinkingDisabled: true,
        // …and, like Opus 4.7+, rejects manual budgets/`type:"enabled"` (adaptive-only).
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-fable-5")
    },
    // ── Claude Opus 5 ───────────────────────────────────────────────
    "claude-opus-5": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        maxEffortWhenThinkingDisabled: "high",
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-5")
    },
    // ── Claude Opus 4.8 ─────────────────────────────────────────────
    "claude-opus-4-8": {
        maxOutputTokens: 128000,
        contextWindow: 1000000,
        // Opus 4.8 inherits Opus 4.7's adaptive thinking constraints: no fixed
        // thinking budget requests, with effort controlled by output_config.
        defaultThinkingBudget: 32000,
        thinkingBudgetCap: 120000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        adaptiveThinkingOnly: true,
        aliases: BEDROCK_CLAUDE_ALIASES("claude-opus-4-8", "claude-opus-4.8", "claude-opus-4.8-fast")
    },
    // ── Claude Sonnet 4.5 ───────────────────────────────────────────
    "claude-sonnet-4-5-20250929": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "claude-sonnet-4.5"
        ]
    },
    // ── Claude Haiku 4.5 ────────────────────────────────────────────
    "claude-haiku-4-5-20251001": {
        maxOutputTokens: 64000,
        contextWindow: 200000,
        thinkingBudgetCap: 62000,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "claude-haiku-4.5"
        ]
    },
    // ── Kimi K3 (Moonshot API — 1M context/output, native vision) ────
    // `k3` is the Kimi Coding / kimi-coding-apikey wire id (#8250).
    "kimi-k3": {
        maxOutputTokens: 1048576,
        contextWindow: 1048576,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "k3"
        ]
    },
    // ── Kimi K2.6 (Moonshot API — 262K native) ──────────────────────
    "kimi-k2.6": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.6-thinking"
        ]
    },
    // ── Kimi K2.7 Code (Moonshot — 262K native, parity with K2.6) ───
    // #3761: importing this via Ollama Cloud's sparse /v1/models gave it no caps, so it
    // fell back to the 128K/8K defaults and lost vision/thinking. Pin the real values.
    "kimi-k2.7-code": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.7",
            "kimi-k2.7-code-thinking",
            "kimi-k2.7-code-highspeed"
        ]
    },
    // ── Kimi K2.5 (Moonshot — 262K native, parity with K2.6) ────────
    "kimi-k2.5": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "kimi-k2.5-thinking"
        ]
    },
    // ── Qwen3.x Plus / Max (Bailian — multimodal text/image/video, 1M context) ─
    "qwen3-max": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true,
        aliases: [
            "qwen3.7-max",
            "qwen3-max-2026-01-23"
        ]
    },
    "qwen3.8-max-preview": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "qwen3.6-plus": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    "qwen3.5-plus": {
        maxOutputTokens: 65536,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true,
        supportsVision: true
    },
    // ── Xiaomi MiMo V2.5 (1M context, consensus across 7+ sync sources) ──
    // Vision: ONLY mimo-v2.5 and mimo-v2-omni accept images per Xiaomi's docs
    // (mimo.mi.com .../image-understanding). The *-pro chat models are TEXT-ONLY;
    // models.dev mislabels them (hermes-agent#18884) — a hard override in
    // src/lib/modelCapabilities.ts also beats that wrong synced attachment.
    "mimo-v2.5-pro": {
        maxOutputTokens: 131072,
        contextWindow: 1048576,
        supportsTools: true,
        supportsVision: false
    },
    "mimo-v2.5": {
        maxOutputTokens: 131072,
        contextWindow: 1048576,
        supportsTools: true,
        supportsVision: true
    },
    "mimo-v2-pro": {
        maxOutputTokens: 131072,
        contextWindow: 262144,
        supportsTools: true,
        supportsVision: false
    },
    "mimo-v2-omni": {
        maxOutputTokens: 131072,
        contextWindow: 262144,
        supportsTools: true,
        supportsVision: true
    },
    "mimo-v2-flash": {
        maxOutputTokens: 65536,
        contextWindow: 262144,
        supportsTools: true
    },
    // ── Z.AI GLM-5.2 (1M context, 128K max output, effort tiers) ────
    "glm-5.2": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5.2-high": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5.2-max": {
        maxOutputTokens: 131072,
        contextWindow: 1000000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    // ── Z.AI GLM-5.x (200K context, 128K max output) ─────────────────
    "glm-5.1": {
        maxOutputTokens: 128000,
        contextWindow: 200000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    "glm-5": {
        maxOutputTokens: 128000,
        contextWindow: 200000,
        thinkingBudgetCap: 38912,
        supportsThinking: true,
        supportsTools: true
    },
    // ── MiniMax M3 (1M context, 512K max output) ─────────────────────
    // max output verified against MiniMax docs / OpenRouter / Artificial
    // Analysis (Nov 2025 launch): 1,048,576-token context, up to 512K output.
    "minimax-m3": {
        maxOutputTokens: 512000,
        contextWindow: 1048576,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M3",
            "MiniMaxAI/MiniMax-M3"
        ]
    },
    // ── MiniMax M2.x (200K context family) ───────────────────────────
    "minimax-m2.7": {
        maxOutputTokens: 131072,
        contextWindow: 204800,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M2.7",
            "MiniMaxAI/MiniMax-M2.7"
        ]
    },
    "minimax-m2.5": {
        maxOutputTokens: 131072,
        contextWindow: 200000,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true,
        aliases: [
            "MiniMax-M2.5"
        ]
    },
    // ── DeepSeek V4 (1M context, 384K max output) ────────────────────
    "deepseek-v4-pro": {
        maxOutputTokens: 384000,
        contextWindow: 1000000,
        // Reserve 4K for visible response: thinking + response must both fit
        // under maxOutputTokens. A cap equal to maxOutputTokens leaves zero room
        // for the actual response when thinking consumes the full budget.
        thinkingBudgetCap: 380000,
        supportsThinking: true,
        supportsTools: true
    },
    "deepseek-v4-flash": {
        maxOutputTokens: 384000,
        contextWindow: 1000000,
        thinkingBudgetCap: 380000,
        supportsThinking: true,
        supportsTools: true
    },
    // ── Tencent Hunyuan 3 Preview ────────────────────────────────────
    "hy3-preview": {
        maxOutputTokens: 262144,
        contextWindow: 262144,
        thinkingBudgetCap: 32768,
        supportsThinking: true,
        supportsTools: true
    },
    // Defaults
    __default__: {}
};
// #8697-adjacent: getCanonicalModelSpecId() re-scanned Object.keys/entries(MODEL_SPECS)
// up to 3 times per call (exact ci, alias ci, prefix) — the top hotspot in a full
// catalog-rebuild profile once the pricing-path bottlenecks were fixed. MODEL_SPECS is
// a static module constant (never mutated at runtime), so the lowercase index below is
// built once, lazily, on first use and never invalidated. Iteration order for the
// prefix-match candidates is preserved exactly (same Object.keys() insertion order) so
// resolution outcomes for ambiguous prefixes are unchanged.
let modelSpecIndex = null;
function getModelSpecIndex() {
    if (modelSpecIndex) return modelSpecIndex;
    const exactCi = new Map();
    const aliasCi = new Map();
    const aliasExact = new Map();
    const prefixCandidates = [];
    for (const [canonical, spec] of Object.entries(MODEL_SPECS)){
        const lowerCanonical = canonical.toLowerCase();
        if (!exactCi.has(lowerCanonical)) exactCi.set(lowerCanonical, canonical);
        for (const alias of spec.aliases || []){
            const lowerAlias = alias.toLowerCase();
            if (!aliasCi.has(lowerAlias)) aliasCi.set(lowerAlias, canonical);
            if (!aliasExact.has(alias)) aliasExact.set(alias, canonical);
        }
        if (canonical !== "__default__") prefixCandidates.push([
            lowerCanonical,
            canonical
        ]);
    }
    modelSpecIndex = {
        exactCi,
        aliasCi,
        aliasExact,
        prefixCandidates
    };
    return modelSpecIndex;
}
function findModelSpecIdByExactOrAlias(modelId) {
    const lower = modelId.toLowerCase();
    const index = getModelSpecIndex();
    const exactHit = index.exactCi.get(lower);
    if (exactHit && exactHit !== "__default__") return exactHit;
    const aliasHit = index.aliasCi.get(lower);
    if (aliasHit && aliasHit !== "__default__") return aliasHit;
    return null;
}
function getCanonicalModelSpecId(modelId) {
    if (MODEL_SPECS[modelId]) return modelId;
    // Case-insensitive lookups: upstream model ids are often capitalized
    // (e.g. "MiniMax-M2.7") while specs/aliases use lowercase ids (#3141).
    const lower = modelId.toLowerCase();
    const index = getModelSpecIndex();
    // Exact match (case-insensitive)
    const exactHit = index.exactCi.get(lower);
    if (exactHit) return exactHit;
    // Buscas por alias (case-insensitive)
    const aliasHit = index.aliasCi.get(lower);
    if (aliasHit) return aliasHit;
    // Prefix matching (case-insensitive) — same insertion-order iteration as before,
    // first match wins.
    for (const [lowerKey, canonical] of index.prefixCandidates){
        if (lower.startsWith(lowerKey)) return canonical;
    }
    return null;
}
function getModelSpec(modelId) {
    const canonical = getCanonicalModelSpecId(modelId);
    return canonical ? MODEL_SPECS[canonical] : undefined;
}
function getAuthoritativeContextWindow(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return null;
    const normalized = modelId.toLowerCase();
    for (const canonical of AUTHORITATIVE_CONTEXT_WINDOW_MODEL_IDS){
        if (canonical.toLowerCase() === normalized) return MODEL_SPECS[canonical]?.contextWindow ?? null;
    }
    return null;
}
function getAuthoritativeProviderContextWindow(provider, modelId) {
    if (typeof provider !== "string" || typeof modelId !== "string") return null;
    const key = `${provider}/${modelId}`.toLowerCase();
    return AUTHORITATIVE_PROVIDER_CONTEXT_WINDOWS.get(key) ?? null;
}
function normalizeThinkingForModel(body, modelId) {
    const thinking = body?.thinking;
    if (thinking && typeof thinking === "object" && thinking.type === "disabled" && getModelSpec(modelId)?.rejectsThinkingDisabled) {
        const { thinking: _omitted, ...rest } = body;
        return rest;
    }
    return body;
}
function capMaxOutputTokens(modelId, requested) {
    const spec = getModelSpec(modelId);
    const cap = spec?.maxOutputTokens;
    const hasRequested = typeof requested === "number" && Number.isFinite(requested);
    if (typeof cap !== "number") return hasRequested ? requested : undefined;
    return hasRequested ? Math.min(requested, cap) : cap;
}
function getDefaultThinkingBudget(modelId) {
    return getModelSpec(modelId)?.defaultThinkingBudget ?? 0;
}
function isAdaptiveThinkingOnly(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return false;
    return getModelSpec(modelId)?.adaptiveThinkingOnly === true;
}
function getMaxEffortWhenThinkingDisabled(modelId) {
    if (typeof modelId !== "string" || modelId.length === 0) return null;
    return getModelSpec(modelId)?.maxEffortWhenThinkingDisabled ?? null;
}
function capThinkingBudget(modelId, budget) {
    const cap = getModelSpec(modelId)?.thinkingBudgetCap ?? budget;
    return Math.min(budget, cap);
}
function resolveModelAlias(modelId) {
    const hit = getModelSpecIndex().aliasExact.get(modelId);
    return hit ?? modelId;
}
}),
"[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * modelsDevSync/transform — pure data model + transform layer.
 *
 * Extracted verbatim from modelsDevSync.ts. Holds the models.dev data-model
 * types, the provider-id mapping table, and the raw→OmniRoute transform
 * functions. Zero imports, no DB access, no module state — pure functions and
 * static data. The host (modelsDevSync.ts) imports these for its sync
 * orchestration and re-exports the originally-public symbols.
 *
 * @module lib/modelsDevSync/transform
 */ __turbopack_context__.s([
    "MODELS_DEV_PROVIDER_MAP",
    ()=>MODELS_DEV_PROVIDER_MAP,
    "mapProviderId",
    ()=>mapProviderId,
    "transformModelsDevToCapabilities",
    ()=>transformModelsDevToCapabilities,
    "transformModelsDevToPricing",
    ()=>transformModelsDevToPricing
]);
const MODELS_DEV_PROVIDER_MAP = {
    // Major providers
    openai: [
        "openai",
        "cx"
    ],
    anthropic: [
        "anthropic",
        "cc"
    ],
    google: [
        "gemini"
    ],
    "google-vertex": [
        "gemini",
        "vertex"
    ],
    "google-vertex-anthropic": [
        "anthropic",
        "cc",
        "vertex"
    ],
    vertex_ai: [
        "gemini",
        "vertex"
    ],
    deepseek: [
        "deepseek",
        "if"
    ],
    groq: [
        "groq"
    ],
    xai: [
        "xai"
    ],
    mistral: [
        "mistral"
    ],
    togetherai: [
        "together",
        "openrouter"
    ],
    together_ai: [
        "together",
        "openrouter"
    ],
    "fireworks-ai": [
        "fireworks"
    ],
    fireworks: [
        "fireworks"
    ],
    cerebras: [
        "cerebras"
    ],
    cohere: [
        "cohere"
    ],
    nvidia: [
        "nvidia"
    ],
    nebius: [
        "nebius"
    ],
    siliconflow: [
        "siliconflow"
    ],
    hyperbolic: [
        "hyperbolic"
    ],
    huggingface: [
        "hf",
        "huggingface"
    ],
    openrouter: [
        "openrouter"
    ],
    perplexity: [
        "pplx",
        "perplexity"
    ],
    // OAuth / special providers
    bedrock: [
        "kiro",
        "kr"
    ],
    "github-copilot": [
        "github",
        "gh"
    ],
    "github-models": [
        "github",
        "gh"
    ],
    kilo: [
        "kilocode",
        "kc",
        "kilo-gateway"
    ],
    kilocode: [
        "kilocode",
        "kc",
        "kilo-gateway"
    ],
    "kimi-for-coding": [
        "kimi-coding",
        "kmc",
        "kimi-coding-apikey",
        "kmca"
    ],
    // The `opencode` models.dev entry used to map only to "opencode-zen" because
    // that is the historical alias pair. But OmniRoute's catalog & combo targets
    // reference models under BOTH provider IDs:
    //   - `opencode-zen/big-pickle` (alias form)
    //   - `opencode/big-pickle`    (canonical id form, used by live API catalog
    //                               and by combos like "Opencode FREE Omni")
    // If we only store synced capabilities under "opencode-zen", the canonical
    // `opencode/<model>` lookup in getCanonicalModelMetadata returns null and
    // any combo that targets `opencode/...` ends up with no computed context.
    // Symmetric mapping keeps both lookup paths populated.
    opencode: [
        "opencode",
        "opencode-zen"
    ],
    "opencode-go": [
        "opencode-go",
        "opencode-zen"
    ],
    // Additional providers that may overlap with OmniRoute
    alibaba: [
        "ali",
        "alibaba"
    ],
    "alibaba-cn": [
        "ali-cn",
        "alibaba-cn",
        "alibaba-china"
    ],
    "alibaba-coding-plan": [
        "bcp",
        "bailian-coding-plan"
    ],
    zai: [
        "zai",
        "glm"
    ],
    "zai-coding-plan": [
        "zai",
        "glm"
    ],
    moonshotai: [
        "moonshot",
        "kimi"
    ],
    "moonshotai-cn": [
        "moonshot",
        "kimi"
    ],
    moonshot: [
        "moonshot",
        "kimi",
        "kimi-coding",
        "kmc",
        "kmca"
    ],
    minimax: [
        "minimax",
        "minimax-cn"
    ],
    "minimax-cn": [
        "minimax-cn"
    ],
    longcat: [
        "lc",
        "longcat"
    ],
    pollinations: [
        "pol",
        "pollinations"
    ],
    puter: [
        "pu",
        "puter"
    ],
    cloudflare: [
        "cf"
    ],
    scaleway: [
        "scw"
    ],
    ollama: [
        "ollamacloud",
        "ollama-cloud"
    ],
    blackbox: [
        "bb",
        "blackbox"
    ],
    cline: [
        "cl",
        "cline"
    ],
    cursor: [
        "cu",
        "cursor"
    ],
    github: [
        "gh",
        "github"
    ]
};
function mapProviderId(modelsDevProviderId) {
    return MODELS_DEV_PROVIDER_MAP[modelsDevProviderId] || [
        modelsDevProviderId
    ];
}
function transformModelsDevToPricing(raw) {
    const result = {};
    for (const [providerId, providerData] of Object.entries(raw)){
        const omniRouteProviders = mapProviderId(providerId);
        for (const [modelId, model] of Object.entries(providerData.models || {})){
            if (!model.cost) continue;
            // Must have at least input pricing
            if (model.cost.input == null) continue;
            const entry = {
                input: model.cost.input,
                output: model.cost.output ?? 0
            };
            if (model.cost.cache_read != null) {
                entry.cached = model.cost.cache_read;
            }
            if (model.cost.cache_write != null) {
                entry.cache_creation = model.cost.cache_write;
            }
            if (model.cost.reasoning != null) {
                entry.reasoning = model.cost.reasoning;
            }
            // Write to ALL mapped OmniRoute providers
            for (const omniProvider of omniRouteProviders){
                if (!result[omniProvider]) result[omniProvider] = {};
                result[omniProvider][modelId] = entry;
            }
        }
    }
    return result;
}
function transformModelsDevToCapabilities(raw) {
    const result = {};
    for (const [providerId, providerData] of Object.entries(raw)){
        const omniRouteProviders = mapProviderId(providerId);
        for (const [modelId, model] of Object.entries(providerData.models || {})){
            const modalitiesInput = model.modalities?.input ?? [];
            const modalitiesOutput = model.modalities?.output ?? [];
            // #8250: models.dev can ship attachment=false while modalities.input still
            // lists image/video (Kimi K3). Normalize at sync so persisted rows stay
            // internally consistent before resolve-time reconciliation.
            let attachment = model.attachment ?? null;
            if (attachment === false && [
                ...modalitiesInput,
                ...modalitiesOutput
            ].some((entry)=>{
                const lower = String(entry).toLowerCase();
                return lower.includes("image") || lower.includes("video");
            })) {
                attachment = true;
            }
            const cap = {
                tool_call: model.tool_call ?? null,
                reasoning: model.reasoning ?? null,
                attachment,
                structured_output: model.structured_output ?? null,
                temperature: model.temperature ?? null,
                modalities_input: JSON.stringify(modalitiesInput),
                modalities_output: JSON.stringify(modalitiesOutput),
                knowledge_cutoff: model.knowledge ?? null,
                release_date: model.release_date ?? null,
                last_updated: model.last_updated ?? null,
                status: model.status ?? null,
                family: model.family ?? null,
                open_weights: model.open_weights ?? null,
                limit_context: model.limit?.context ?? null,
                limit_input: model.limit?.input ?? null,
                limit_output: model.limit?.output ?? null,
                interleaved_field: typeof model.interleaved === "object" && model.interleaved?.field ? model.interleaved.field : model.interleaved === true ? "reasoning_content" : null
            };
            for (const omniProvider of omniRouteProviders){
                if (!result[omniProvider]) result[omniProvider] = {};
                result[omniProvider][modelId] = cap;
            }
        }
    }
    return result;
}
}),
"[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearModelsDevCapabilities",
    ()=>clearModelsDevCapabilities,
    "clearModelsDevPricing",
    ()=>clearModelsDevPricing,
    "ensureCapabilitiesTable",
    ()=>ensureCapabilitiesTable,
    "fetchModelsDev",
    ()=>fetchModelsDev,
    "getModelsDevPricing",
    ()=>getModelsDevPricing,
    "getSyncStatus",
    ()=>getSyncStatus,
    "getSyncedCapabilities",
    ()=>getSyncedCapabilities,
    "getSyncedCapability",
    ()=>getSyncedCapability,
    "initModelsDevSync",
    ()=>initModelsDevSync,
    "saveModelsDevCapabilities",
    ()=>saveModelsDevCapabilities,
    "saveModelsDevPricing",
    ()=>saveModelsDevPricing,
    "startPeriodicSync",
    ()=>startPeriodicSync,
    "stopPeriodicSync",
    ()=>stopPeriodicSync,
    "syncModelsDev",
    ()=>syncModelsDev
]);
/**
 * modelsDevSync.ts — Fetch model specs, pricing, and capabilities from models.dev
 *
 * models.dev (https://github.com/anomalyco/models.dev) is an open-source database
 * of AI model specifications maintained by the SST/OpenCode team (MIT license).
 *
 * API: https://models.dev/api.json
 * - 109 providers, 4,146+ models
 * - Data: pricing, capabilities, limits, modalities, metadata
 *
 * Resolution order (highest → lowest):
 *   1. User overrides (`pricing` namespace)
 *   2. models.dev sync (`models_dev_pricing` namespace)
 *   3. LiteLLM sync (`pricing_synced` namespace)
 *   4. Hardcoded defaults (`pricing.ts`)
 *
 * Opt-in via MODELS_DEV_SYNC_ENABLED=true (default: false).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)");
;
;
;
;
;
// ─── Configuration ───────────────────────────────────────
const MODELS_DEV_API_URL = "https://models.dev/api.json";
const parsedInterval = parseInt(process.env.MODELS_DEV_SYNC_INTERVAL || "86400", 10);
const SYNC_INTERVAL_MS = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval * 1000 : 86400 * 1000;
// ─── Periodic sync state ─────────────────────────────────
let syncTimer = null;
let activeSyncAbortController = null;
let activeSyncPromise = null;
let activePeriodicSyncToken = null;
let lastSyncTime = null;
let lastSyncModelCount = 0;
let lastSyncCapabilityCount = 0;
let activeSyncIntervalMs = SYNC_INTERVAL_MS;
let cachedData = null;
let cacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let cachedCapabilities = null;
let cachedCapabilitiesLoadedAll = false;
const MODELS_DEV_ABORT_ERROR = "AbortError";
function createAbortError() {
    const error = new Error("models.dev sync aborted");
    error.name = MODELS_DEV_ABORT_ERROR;
    return error;
}
function isAbortError(error) {
    return error instanceof Error && error.name === MODELS_DEV_ABORT_ERROR;
}
function createAbortedSyncResult(dryRun) {
    return {
        success: false,
        modelCount: 0,
        providerCount: 0,
        capabilityCount: 0,
        dryRun,
        error: "aborted"
    };
}
async function sleepWithAbort(ms, signal) {
    if (signal?.aborted) {
        throw createAbortError();
    }
    await new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>{
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = ()=>{
            clearTimeout(timeout);
            reject(createAbortError());
        };
        signal?.addEventListener("abort", onAbort, {
            once: true
        });
    });
}
async function fetchModelsDev(signal) {
    // Return cached data if still fresh
    if (cachedData && Date.now() - cacheTime < CACHE_TTL_MS) {
        return cachedData;
    }
    const response = await fetch(MODELS_DEV_API_URL, {
        signal: signal ?? AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`models.dev fetch failed [${response.status}]: ${response.statusText}`);
    }
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        cachedData = data;
        cacheTime = Date.now();
        return data;
    } catch  {
        throw new Error(`models.dev returned invalid JSON (${text.slice(0, 100)}...)`);
    }
}
// ─── DB: models.dev pricing namespace ────────────────────
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function mapCapabilityRecord(record) {
    return {
        tool_call: record.tool_call === 1 ? true : record.tool_call === 0 ? false : null,
        reasoning: record.reasoning === 1 ? true : record.reasoning === 0 ? false : null,
        attachment: record.attachment === 1 ? true : record.attachment === 0 ? false : null,
        structured_output: record.structured_output === 1 ? true : record.structured_output === 0 ? false : null,
        temperature: record.temperature === 1 ? true : record.temperature === 0 ? false : null,
        modalities_input: typeof record.modalities_input === "string" ? record.modalities_input : "[]",
        modalities_output: typeof record.modalities_output === "string" ? record.modalities_output : "[]",
        knowledge_cutoff: typeof record.knowledge_cutoff === "string" ? record.knowledge_cutoff : null,
        release_date: typeof record.release_date === "string" ? record.release_date : null,
        last_updated: typeof record.last_updated === "string" ? record.last_updated : null,
        status: typeof record.status === "string" ? record.status : null,
        family: typeof record.family === "string" ? record.family : null,
        open_weights: record.open_weights === 1 ? true : record.open_weights === 0 ? false : null,
        limit_context: typeof record.limit_context === "number" ? record.limit_context : null,
        limit_input: typeof record.limit_input === "number" ? record.limit_input : null,
        limit_output: typeof record.limit_output === "number" ? record.limit_output : null,
        interleaved_field: typeof record.interleaved_field === "string" ? record.interleaved_field : null
    };
}
// #8697: getModelsDevPricing() re-ran the SELECT + JSON.parse of ~180 blobs on
// every call — called once per catalog model (up to ~6091x) instead of once per
// request, freezing the whole server 41-54s on a cold /v1/models rebuild.
// Memoized here, invalidated via the same modelCatalogCacheVersion signal
// save/clearModelsDevPricing already bump through invalidateDbCache("pricing") —
// reusing the existing pattern (getCachedRawProviderConnections et al. in
// db/readCache.ts) instead of introducing a new invalidation mechanism.
let pricingMemo = null;
let pricingMemoVersion = -1; // -1: never equals a real cacheVersion (starts at 0), guarantees a miss on the first call
function getModelsDevPricing() {
    const currentVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCatalogCacheVersion"])();
    if (pricingMemo !== null && pricingMemoVersion === currentVersion) {
        return pricingMemo;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'models_dev_pricing'").all();
    const synced = {};
    for (const row of rows){
        const record = toRecord(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            synced[key] = JSON.parse(rawValue);
        } catch  {
            console.warn(`[MODELS_DEV] Corrupted pricing data for provider "${key}", skipping`);
        }
    }
    pricingMemo = synced;
    pricingMemoVersion = currentVersion;
    return synced;
}
function saveModelsDevPricing(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('models_dev_pricing', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearModelsDevPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'models_dev_pricing'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function ensureCapabilitiesTable() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.exec(`
    CREATE TABLE IF NOT EXISTS model_capabilities (
      provider TEXT NOT NULL,
      model_id TEXT NOT NULL,
      tool_call BOOLEAN,
      reasoning BOOLEAN,
      attachment BOOLEAN,
      structured_output BOOLEAN,
      temperature BOOLEAN,
      modalities_input TEXT,
      modalities_output TEXT,
      knowledge_cutoff TEXT,
      release_date TEXT,
      last_updated TEXT,
      status TEXT,
      family TEXT,
      open_weights BOOLEAN,
      limit_context INTEGER,
      limit_input INTEGER,
      limit_output INTEGER,
      interleaved_field TEXT,
      last_synced TEXT,
      PRIMARY KEY (provider, model_id)
    )
  `);
}
function getSyncedCapabilities(provider, modelId) {
    if (cachedCapabilitiesLoadedAll) {
        if (!provider) {
            return cachedCapabilities || {};
        }
        if (!modelId) {
            return cachedCapabilities?.[provider] ? {
                [provider]: cachedCapabilities[provider]
            } : {};
        }
        const providerCaps = cachedCapabilities?.[provider];
        return providerCaps?.[modelId] ? {
            [provider]: {
                [modelId]: providerCaps[modelId]
            }
        } : {};
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    let query = "SELECT * FROM model_capabilities";
    const params = [];
    if (provider) {
        query += " WHERE provider = ?";
        params.push(provider);
        if (modelId) {
            query += " AND model_id = ?";
            params.push(modelId);
        }
    }
    const rows = db.prepare(query).all(...params);
    const result = {};
    for (const row of rows){
        const record = toRecord(row);
        const prov = typeof record.provider === "string" ? record.provider : null;
        const mid = typeof record.model_id === "string" ? record.model_id : null;
        if (!prov || !mid) continue;
        if (!result[prov]) result[prov] = {};
        result[prov][mid] = mapCapabilityRecord(record);
    }
    if (!provider && !modelId) {
        cachedCapabilities = result;
        cachedCapabilitiesLoadedAll = true;
    }
    return result;
}
/**
 * Resolved providers/aliases to also try when looking up a synced capability.
 * Required because models.dev has historically stored capability rows under the
 * alias side of an alias pair (e.g. "opencode-zen") while the catalog & combo
 * targets reference the canonical id (e.g. "opencode"). Without this fallback,
 * combos whose targets use the canonical id (e.g. "Opencode FREE Omni" → all
 * `opencode/...` models) end up with `context_length: null` in the catalog.
 */ const SYNCED_CAPABILITY_FALLBACK_ALIASES = {
    opencode: [
        "opencode-zen"
    ],
    "opencode-zen": [
        "opencode"
    ],
    "opencode-go": [
        "opencode-zen"
    ]
};
function getSyncedCapability(provider, modelId) {
    if (!provider || !modelId) return null;
    // #8697-adjacent: this used to hit SQLite with a per-model SELECT on every cold
    // call, relying on some other caller (getSyncedCapabilities() with no args) to have
    // already warmed the whole-table cache first — no such caller sits in the /v1/models
    // catalog build path, so a cold rebuild ran one SQLite round-trip per model per call
    // site instead of one bulk read for the whole rebuild. Self-warm here instead of
    // depending on an external caller.
    if (!cachedCapabilitiesLoadedAll) {
        getSyncedCapabilities();
    }
    const lookupCached = (p)=>cachedCapabilities?.[p]?.[modelId] ?? null;
    const directCached = lookupCached(provider);
    if (directCached) return directCached;
    const fallbacks = SYNCED_CAPABILITY_FALLBACK_ALIASES[provider];
    if (fallbacks) {
        for (const alt of fallbacks){
            const found = lookupCached(alt);
            if (found) return found;
        }
    }
    return null;
}
function saveModelsDevCapabilities(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    const del = db.prepare("DELETE FROM model_capabilities");
    const insert = db.prepare(`
    INSERT INTO model_capabilities (
      provider, model_id, tool_call, reasoning, attachment, structured_output,
      temperature, modalities_input, modalities_output, knowledge_cutoff,
      release_date, last_updated, status, family, open_weights,
      limit_context, limit_input, limit_output, interleaved_field, last_synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const now = new Date().toISOString();
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            for (const [modelId, cap] of Object.entries(models)){
                insert.run(provider, modelId, cap.tool_call === null ? null : cap.tool_call ? 1 : 0, cap.reasoning === null ? null : cap.reasoning ? 1 : 0, cap.attachment === null ? null : cap.attachment ? 1 : 0, cap.structured_output === null ? null : cap.structured_output ? 1 : 0, cap.temperature === null ? null : cap.temperature ? 1 : 0, cap.modalities_input, cap.modalities_output, cap.knowledge_cutoff, cap.release_date, cap.last_updated, cap.status, cap.family, cap.open_weights === null ? null : cap.open_weights ? 1 : 0, cap.limit_context, cap.limit_input, cap.limit_output, cap.interleaved_field, now);
            }
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = data;
    cachedCapabilitiesLoadedAll = true;
}
function clearModelsDevCapabilities() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    ensureCapabilitiesTable();
    db.prepare("DELETE FROM model_capabilities").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    cachedCapabilities = {};
    cachedCapabilitiesLoadedAll = true;
}
async function syncModelsDev(opts) {
    const dryRun = opts?.dryRun ?? false;
    const syncCapabilities = opts?.syncCapabilities ?? true;
    const maxRetries = opts?.maxRetries ?? 3;
    const signal = opts?.signal;
    let lastError = null;
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        if (signal?.aborted) {
            return createAbortedSyncResult(dryRun);
        }
        try {
            const raw = await fetchModelsDev(signal);
            const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformModelsDevToPricing"])(raw);
            const capabilities = syncCapabilities ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformModelsDevToCapabilities"])(raw) : {};
            const modelCount = Object.values(pricing).reduce((sum, models)=>sum + Object.keys(models).length, 0);
            const providerCount = Object.keys(pricing).length;
            const capabilityCount = syncCapabilities ? Object.values(capabilities).reduce((sum, models)=>sum + Object.keys(models).length, 0) : 0;
            if (signal?.aborted) {
                return createAbortedSyncResult(dryRun);
            }
            if (!dryRun) {
                saveModelsDevPricing(pricing);
                if (syncCapabilities) {
                    ensureCapabilitiesTable();
                    saveModelsDevCapabilities(capabilities);
                }
                lastSyncTime = new Date().toISOString();
                lastSyncModelCount = modelCount;
                lastSyncCapabilityCount = capabilityCount;
            }
            return {
                success: true,
                modelCount,
                providerCount,
                capabilityCount,
                dryRun,
                ...dryRun ? {
                    data: {
                        pricing,
                        capabilities
                    }
                } : {}
            };
        } catch (err) {
            if (signal?.aborted || isAbortError(err)) {
                return createAbortedSyncResult(dryRun);
            }
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < maxRetries) {
                const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.warn(`[MODELS_DEV] Sync attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, lastError.message);
                try {
                    await sleepWithAbort(delayMs, signal);
                } catch (sleepError) {
                    if (signal?.aborted || isAbortError(sleepError)) {
                        return createAbortedSyncResult(dryRun);
                    }
                    throw sleepError;
                }
            }
        }
    }
    const message = lastError?.message || "Unknown error";
    console.warn(`[MODELS_DEV] Sync failed after ${maxRetries + 1} attempts:`, message);
    return {
        success: false,
        modelCount: 0,
        providerCount: 0,
        capabilityCount: 0,
        dryRun,
        error: message
    };
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? SYNC_INTERVAL_MS;
    activeSyncIntervalMs = interval;
    const syncToken = {
        stopped: false
    };
    activePeriodicSyncToken = syncToken;
    console.log(`[MODELS_DEV] Starting periodic sync every ${interval / 1000}s`);
    const launchSync = ()=>{
        if (syncToken.stopped) {
            return Promise.resolve(createAbortedSyncResult(false));
        }
        if (activeSyncPromise) return activeSyncPromise;
        const controller = new AbortController();
        activeSyncAbortController = controller;
        const promise = syncModelsDev({
            signal: controller.signal
        }).finally(()=>{
            if (activeSyncAbortController === controller) {
                activeSyncAbortController = null;
            }
            if (activeSyncPromise === promise) {
                activeSyncPromise = null;
            }
        });
        activeSyncPromise = promise;
        return promise;
    };
    // Initial sync (non-blocking)
    launchSync().then((result)=>{
        if (result.success) {
            console.log(`[MODELS_DEV] Initial sync complete: ${result.modelCount} pricing entries, ${result.capabilityCount} capabilities from ${result.providerCount} providers`);
        }
    }).catch((err)=>{
        console.warn("[MODELS_DEV] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        launchSync().then((result)=>{
            if (result.success) {
                console.log(`[MODELS_DEV] Periodic sync complete: ${result.modelCount} pricing entries`);
            }
        }).catch((err)=>{
            console.warn("[MODELS_DEV] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    if (syncTimer && typeof syncTimer === "object" && "unref" in syncTimer) {
        syncTimer.unref?.();
    }
}
function stopPeriodicSync() {
    if (activePeriodicSyncToken) {
        activePeriodicSyncToken.stopped = true;
        activePeriodicSyncToken = null;
    }
    if (activeSyncAbortController) {
        activeSyncAbortController.abort();
        activeSyncAbortController = null;
    }
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log("[MODELS_DEV] Periodic sync stopped");
    }
}
function getSyncStatus() {
    // If the sync timer is active, it's enabled.
    const enabled = syncTimer !== null;
    return {
        enabled,
        lastSync: lastSyncTime,
        lastSyncModelCount,
        lastSyncCapabilityCount,
        nextSync: syncTimer && lastSyncTime ? new Date(new Date(lastSyncTime).getTime() + activeSyncIntervalMs).toISOString() : null,
        intervalMs: activeSyncIntervalMs
    };
}
async function initModelsDevSync() {
    const { getSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
    const settings = await getSettings();
    if (settings.modelsDevSyncEnabled !== true) {
        console.log("[MODELS_DEV] Disabled (enable via Settings > AI)");
        return;
    }
    const interval = settings.modelsDevSyncInterval;
    startPeriodicSync(interval);
}
}),
"[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelContextOverride",
    ()=>getModelContextOverride,
    "getModelContextOverrideRecord",
    ()=>getModelContextOverrideRecord,
    "listModelContextOverrides",
    ()=>listModelContextOverrides,
    "removeModelContextOverride",
    ()=>removeModelContextOverride,
    "setModelContextOverride",
    ()=>setModelContextOverride
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
;
;
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function normalizeKey(provider, modelId) {
    const p = typeof provider === "string" ? provider.trim() : "";
    const m = typeof modelId === "string" ? modelId.trim() : "";
    if (!p || !m) return null;
    return {
        provider: p,
        modelId: m
    };
}
function toOverride(row) {
    return {
        provider: row.provider,
        modelId: row.model_id,
        realContext: row.real_context,
        source: row.source === "auto:discovery" ? "auto:discovery" : "manual",
        refreshedAt: row.refreshed_at
    };
}
function getModelContextOverrideRecord(provider, modelId) {
    const key = normalizeKey(provider, modelId);
    if (!key) return null;
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, real_context, source, refreshed_at " + "FROM model_context_overrides WHERE provider = ? AND model_id = ?").get(key.provider, key.modelId);
        return row ? toOverride(row) : null;
    } catch  {
        // Table may not exist yet (pre-migration) — fall through to the catalog.
        return null;
    }
}
function getModelContextOverride(provider, modelId) {
    const record = getModelContextOverrideRecord(provider, modelId);
    return record ? record.realContext : null;
}
function setModelContextOverride(provider, modelId, realContext, source = "manual") {
    const key = normalizeKey(provider, modelId);
    if (!key || !isPositiveInteger(realContext)) return false;
    const normalizedSource = source === "auto:discovery" ? "auto:discovery" : "manual";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("INSERT OR REPLACE INTO model_context_overrides " + "(provider, model_id, real_context, source, refreshed_at) " + "VALUES (?, ?, ?, ?, datetime('now'))").run(key.provider, key.modelId, realContext, normalizedSource);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return true;
}
function removeModelContextOverride(provider, modelId) {
    const key = normalizeKey(provider, modelId);
    if (!key) return false;
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM model_context_overrides WHERE provider = ? AND model_id = ?").run(key.provider, key.modelId);
    if (info.changes > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return info.changes > 0;
}
function listModelContextOverrides() {
    try {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, real_context, source, refreshed_at " + "FROM model_context_overrides ORDER BY refreshed_at DESC").all();
        return rows.map(toOverride);
    } catch  {
        return [];
    }
}
}),
"[project]/src/lib/db/modelCapabilityOverrides.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModelCapabilityOverride",
    ()=>getModelCapabilityOverride,
    "listModelCapabilityOverrides",
    ()=>listModelCapabilityOverrides,
    "parseModelOverrideTarget",
    ()=>parseModelOverrideTarget,
    "removeModelCapabilityOverride",
    ()=>removeModelCapabilityOverride,
    "setModelCapabilityOverride",
    ()=>setModelCapabilityOverride
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
;
;
function isSupportedKey(value) {
    return value === "max_input_tokens" || value === "max_output_tokens";
}
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function parseModelOverrideTarget(target) {
    const raw = typeof target === "string" ? target.trim() : "";
    const slashIndex = raw.indexOf("/");
    if (slashIndex <= 0 || slashIndex === raw.length - 1) return null;
    const provider = raw.slice(0, slashIndex).trim();
    const modelId = raw.slice(slashIndex + 1).trim();
    if (!provider || !modelId) return null;
    return {
        provider,
        modelId
    };
}
function toOverride(row) {
    if (!isSupportedKey(row.override_key)) return null;
    let parsedValue;
    try {
        parsedValue = JSON.parse(row.override_value);
    } catch  {
        return null;
    }
    if (!isPositiveInteger(parsedValue)) return null;
    return {
        provider: row.provider,
        modelId: row.model_id,
        target: `${row.provider}/${row.model_id}`,
        key: row.override_key,
        value: parsedValue,
        refreshedAt: row.refreshed_at
    };
}
function getModelCapabilityOverride(provider, modelId, key) {
    const target = parseModelOverrideTarget(`${provider || ""}/${modelId || ""}`);
    if (!target || !isSupportedKey(key)) return null;
    try {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, override_key, override_value, refreshed_at " + "FROM model_capability_overrides WHERE provider = ? AND model_id = ? AND override_key = ?").get(target.provider, target.modelId, key);
        const override = row ? toOverride(row) : null;
        return override?.value ?? null;
    } catch  {
        return null;
    }
}
function setModelCapabilityOverride(target, key, value) {
    const parsedTarget = parseModelOverrideTarget(target);
    if (!parsedTarget || !isSupportedKey(key) || !isPositiveInteger(value)) return false;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("INSERT OR REPLACE INTO model_capability_overrides " + "(provider, model_id, override_key, override_value, refreshed_at) " + "VALUES (?, ?, ?, ?, datetime('now'))").run(parsedTarget.provider, parsedTarget.modelId, key, JSON.stringify(value));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return true;
}
function removeModelCapabilityOverride(target, key) {
    const parsedTarget = parseModelOverrideTarget(target);
    if (!parsedTarget || !isSupportedKey(key)) return false;
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("DELETE FROM model_capability_overrides " + "WHERE provider = ? AND model_id = ? AND override_key = ?").run(parsedTarget.provider, parsedTarget.modelId, key);
    if (info.changes > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidateDbCache"])("model-capabilities");
    return info.changes > 0;
}
function listModelCapabilityOverrides() {
    try {
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])().prepare("SELECT provider, model_id, override_key, override_value, refreshed_at " + "FROM model_capability_overrides ORDER BY refreshed_at DESC").all();
        return rows.map(toOverride).filter((entry)=>entry !== null);
    } catch  {
        return [];
    }
}
}),
"[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Single source of truth for the model-id vision heuristic (#4072).
 *
 * Three code paths used to keep their own drifting lists, so the same model id
 * could get up to three different vision verdicts:
 *   - `src/lib/modelCapabilities.ts` — last-resort fallback in `resolveVisionCapability` (#4071)
 *   - `src/app/api/v1/models/catalog.ts` — `/v1/models` listing capability
 *   - `open-sse/services/compression/lite.ts` — gate that decides whether lite
 *     compression strips images
 *
 * Concrete bugs that caused:
 *   - `lite.ts` was missing pixtral / llava / qwen-vl / glm-4v / kimi-vl /
 *     mistral-medium-3, so lite compression stripped images for those real vision
 *     models and blinded them (same class as #4071 / #4012).
 *   - `catalog.ts` was too broad: bare `gemma` (text) and bare `kimi` (e.g.
 *     `kimi-k2`, text) produced false-positive `vision: true` in `/v1/models`.
 *
 * Keep this list CONSERVATIVE: a false positive in routing or compression
 * re-creates #4071 (an image routed to / kept for a model that cannot see it).
 * The zero-touch path for newly released vision models is the models.dev sync
 * (`modalities` / `attachment`), not this fallback — this list only needs the
 * stable, well-known vision families.
 */ __turbopack_context__.s([
    "VISION_MODEL_ID_FRAGMENTS",
    ()=>VISION_MODEL_ID_FRAGMENTS,
    "isVisionModelId",
    ()=>isVisionModelId
]);
const VISION_MODEL_ID_FRAGMENTS = [
    "pixtral",
    "llava",
    "bakllava",
    "qwen-vl",
    "qwen2-vl",
    "qwen2.5-vl",
    "qwen3-vl",
    "qvq",
    "internvl",
    "minicpm-v",
    "moondream",
    "mimo-vl",
    "kimi-vl",
    "glm-4v",
    "glm-4.5v",
    "glm-4.6v",
    "gpt-4o",
    "gpt-4.1",
    "gpt-4-turbo",
    "gpt-4-vision",
    "gpt-5",
    "gemini-1.5",
    "gemini-2",
    "gemini-3",
    "gemini-exp",
    "claude-3",
    "claude-fable",
    "claude-opus-4",
    "claude-sonnet-4",
    "claude-haiku-4",
    "claude-fable",
    "mistral-medium-3",
    "minimax-m3",
    "kimi-k2.",
    "-vision",
    "multimodal"
];
function isVisionModelId(modelId) {
    if (!modelId) return false;
    const normalized = String(modelId).toLowerCase();
    return VISION_MODEL_ID_FRAGMENTS.some((fragment)=>normalized.includes(fragment));
}
}),
"[project]/open-sse/services/learnedThinkingCaps.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GEMINI_FALLBACK_THINKING_CAP",
    ()=>GEMINI_FALLBACK_THINKING_CAP,
    "__test_resetLearnedThinkingCaps",
    ()=>__test_resetLearnedThinkingCaps,
    "getLearnedThinkingCap",
    ()=>getLearnedThinkingCap,
    "parseThinkingBudgetMax",
    ()=>parseThinkingBudgetMax,
    "recordLearnedThinkingCap",
    ()=>recordLearnedThinkingCap
]);
/**
 * Learned Thinking-Budget Caps — reactive cap memory for Gemini-family models.
 *
 * Proactive clamping (`capThinkingBudget` in src/lib/modelCapabilities.ts) only
 * knows caps for models registered in MODEL_SPECS. Any Gemini model outside the
 * registry (e.g. gemini-2.5-pro, or a Gemini id served through another provider)
 * initially gets no cap, so a high client budget (xhigh = 131072) goes straight
 * to the upstream and can bounce with:
 *
 *   400 GenerateContentRequest.generation_config.thinking_config.thinking_budget:
 *   thinking_budget must be in the range [-1, 65535]
 *
 * When base.ts's executor sees that 400 it calls `recordLearnedThinkingCap`,
 * which walks the failed budget down a step ladder and stores the surviving cap
 * in a module-level Map keyed "provider:model" (lowercased). Subsequent requests
 * for the same provider+model read the cap via `getLearnedThinkingCap` (consulted
 * by `capThinkingBudget`) so the 400→retry round-trip is paid at most once per
 * process per provider+model — not once per chat session.
 *
 * In-memory only (per operator decision): restart resets, the first request after
 * a restart may re-learn at the cost of one upstream 400.
 */ // Known Gemini thinking-budget ceilings, highest first. 32768 is the pro-tier
// cap; 24576 is the flash-tier cap (gemini-2.5-flash in MODEL_SPECS); 8192 is a
// conservative floor that every thinking-capable Gemini accepts. A failed budget
// walks to the first step strictly below it.
const GEMINI_STEPDOWN = [
    32768,
    24576,
    8192
];
const GEMINI_FALLBACK_THINKING_CAP = GEMINI_STEPDOWN[0];
// key: `${provider}:${model}` lowercased → highest budget known to be accepted.
const learnedCaps = new Map();
function buildKey(provider, model) {
    const p = typeof provider === "string" ? provider.trim().toLowerCase() : "";
    const m = typeof model === "string" ? model.trim().toLowerCase() : "";
    if (!p || !m) return "";
    return `${p}:${m}`;
}
function getLearnedThinkingCap(provider, model) {
    const key = buildKey(provider, model);
    if (!key) return null;
    return learnedCaps.get(key) ?? null;
}
function recordLearnedThinkingCap(provider, model, failedBudget) {
    const key = buildKey(provider, model);
    if (!key) return null;
    if (!Number.isFinite(failedBudget)) return null;
    const nextStep = GEMINI_STEPDOWN.find((step)=>step < failedBudget);
    if (nextStep === undefined) return null; // ladder exhausted
    const existing = learnedCaps.get(key);
    if (existing !== undefined && existing <= nextStep) {
        return existing; // already learned an equal-or-lower cap; keep it
    }
    learnedCaps.set(key, nextStep);
    return nextStep;
}
function parseThinkingBudgetMax(errText) {
    if (typeof errText !== "string" || !errText) return null;
    const match = /thinking_?budget[^\d-]*(?:must be in the range|range)[^\d-]*\[\s*-?\d+\s*,\s*(\d+)\s*\]/i.exec(errText);
    if (!match) return null;
    const max = Number(match[1]);
    return Number.isFinite(max) ? max : null;
}
function __test_resetLearnedThinkingCaps() {
    learnedCaps.clear();
}
}),
"[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "capMaxOutputTokens",
    ()=>capMaxOutputTokens,
    "capThinkingBudget",
    ()=>capThinkingBudget,
    "getDefaultThinkingBudget",
    ()=>getDefaultThinkingBudget,
    "getExplicitModelOutputCap",
    ()=>getExplicitModelOutputCap,
    "getModelContextLimit",
    ()=>getModelContextLimit,
    "getResolvedModelCapabilities",
    ()=>getResolvedModelCapabilities,
    "getResolvedModelContextOverride",
    ()=>getResolvedModelContextOverride,
    "isNonChatCatalogSurface",
    ()=>isNonChatCatalogSurface,
    "modelIdLikelyVision",
    ()=>modelIdLikelyVision,
    "resolveInputTokenCapForGate",
    ()=>resolveInputTokenCapForGate,
    "supportsMaxTokens",
    ()=>supportsMaxTokens,
    "supportsReasoning",
    ()=>supportsReasoning,
    "supportsToolCalling",
    ()=>supportsToolCalling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelsDevSync/transform.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelCapabilityOverrides.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [app-route] (ecmascript)");
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
const TOOL_CALLING_UNSUPPORTED_PATTERNS = [
    // Specialty / non-chat surfaces must never inherit optimistic tool defaults (#8016)
    "whisper",
    "tts-1",
    "gpt-4o-mini-tts",
    "omni-moderation",
    "moderation",
    "eleven_multilingual",
    "eleven_turbo",
    "seedance",
    "/veo",
    "veo-",
    "rerank",
    "embedding",
    "dall-e",
    "flux-",
    "stable-diffusion"
];
const REASONING_UNSUPPORTED_PATTERNS = [
    "antigravity/claude-sonnet-4-6",
    "antigravity/claude-sonnet-4-5",
    "antigravity/claude-sonnet-4",
    // Non-Claude antigravity models don't support thinking params (#1361)
    "antigravity/gemini-",
    "antigravity/gpt-oss-",
    "antigravity/gemini-3",
    "antigravity/tab_",
    // Specialty / non-chat surfaces (#8016)
    "whisper",
    "tts-1",
    "gpt-4o-mini-tts",
    "omni-moderation",
    "moderation",
    "eleven_multilingual",
    "eleven_turbo",
    "seedance",
    "/veo",
    "veo-",
    "rerank",
    "embedding",
    "dall-e",
    "flux-",
    "stable-diffusion"
];
/** Catalog/API surface types that are not chat completions. */ const NON_CHAT_SURFACE_TYPES = new Set([
    "audio",
    "video",
    "image",
    "moderation",
    "rerank",
    "embedding",
    "music"
]);
function isNonChatCatalogSurface(type) {
    return typeof type === "string" && NON_CHAT_SURFACE_TYPES.has(type);
}
const MAX_TOKENS_UNSUPPORTED_PATTERNS = [
    "o1-preview",
    "o1-mini",
    "o1",
    "o3-mini",
    "o3",
    "gpt-5.4",
    "gpt-5.5"
];
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function parseModalities(value) {
    if (typeof value !== "string" || value.trim().length === 0) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry)=>typeof entry === "string" && entry.length > 0) : [];
    } catch  {
        return [];
    }
}
function getRegistryModel(providerIdOrAlias, modelId) {
    if (!providerIdOrAlias || !modelId) return null;
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerIdOrAlias] || providerIdOrAlias;
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerAlias];
    if (!Array.isArray(models)) return null;
    return models.find((model)=>model?.id === modelId) || null;
}
function resolveCapabilityInput(input) {
    if (typeof input === "string") {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(input);
        const rawModel = toNonEmptyString(parsed.model);
        if (parsed.provider) {
            const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(parsed.provider, rawModel);
            return {
                provider: canonical.provider,
                model: toNonEmptyString(canonical.model),
                rawModel,
                lookupKey: input
            };
        }
        return {
            provider: null,
            model: rawModel,
            rawModel,
            lookupKey: input
        };
    }
    const rawProvider = toNonEmptyString(input.provider);
    const rawModel = toNonEmptyString(input.model);
    if (rawProvider) {
        const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(rawProvider, rawModel);
        return {
            provider: canonical.provider,
            model: toNonEmptyString(canonical.model),
            rawModel,
            lookupKey: rawModel ? `${canonical.provider}/${rawModel}` : canonical.provider
        };
    }
    return {
        provider: null,
        model: rawModel,
        rawModel,
        lookupKey: rawModel || ""
    };
}
function heuristicToolCalling(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return false;
    const blocked = TOOL_CALLING_UNSUPPORTED_PATTERNS.some((pattern)=>{
        if (normalized === pattern) return true;
        if (normalized.endsWith(`/${pattern}`)) return true;
        return normalized.includes(pattern);
    });
    return !blocked;
}
function heuristicReasoning(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return true;
    const blocked = REASONING_UNSUPPORTED_PATTERNS.some((pattern)=>normalized === pattern || normalized.endsWith(`/${pattern}`) || normalized.includes(pattern));
    return !blocked;
}
function heuristicMaxTokens(modelStr) {
    const normalized = String(modelStr || "").toLowerCase();
    if (!normalized) return true;
    const blocked = MAX_TOKENS_UNSUPPORTED_PATTERNS.some((pattern)=>normalized === pattern || normalized.endsWith(`/${pattern}`) || normalized.includes(pattern));
    return !blocked;
}
/** Last path segment of a path-shaped model id (`cline-pass/kimi-k3` → `kimi-k3`). */ function leafModelId(modelId) {
    if (!modelId || !modelId.includes("/")) return null;
    const leaf = modelId.split("/").filter(Boolean).pop() ?? null;
    return leaf && leaf !== modelId ? leaf : null;
}
function getStaticSpec(modelId, rawModel) {
    if (modelId) {
        const byCanonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(modelId);
        if (byCanonical) return byCanonical;
    }
    if (rawModel && rawModel !== modelId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(rawModel);
    }
    return undefined;
}
/**
 * #8032: vision-only leaf fallback for path-shaped routed ids.
 *
 * Must NOT live in getStaticSpec() — that helper also feeds supportsTools /
 * supportsThinking / contextWindow / maxOutputTokens. A shared leaf lookup
 * incorrectly promotes e.g. aihorde/deepseek/deepseek-v4-flash to the real
 * DeepSeek V4 Flash tool-calling spec (#8212 regression).
 */ function getVisionStaticSpec(modelId, rawModel) {
    const direct = getStaticSpec(modelId, rawModel);
    if (direct) return direct;
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const leaf = leafModelId(candidate);
        if (!leaf) continue;
        const byLeaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(leaf);
        if (byLeaf) return byLeaf;
    }
    return undefined;
}
function getAuthoritativeStaticContextWindow(provider, modelId, rawModel) {
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const providerContextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthoritativeProviderContextWindow"])(provider, candidate);
        if (typeof providerContextWindow === "number") return providerContextWindow;
    }
    for (const candidate of [
        modelId,
        rawModel
    ]){
        const contextWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthoritativeContextWindow"])(candidate);
        if (typeof contextWindow === "number") return contextWindow;
    }
    return null;
}
// #8697-adjacent: this used to rescan Object.entries(MODEL_SPECS) per candidate per
// call — the top hotspot in a full catalog-rebuild profile once the pricing-path and
// getCanonicalModelSpecId() bottlenecks were fixed. Reuses the lazy index already built
// for getCanonicalModelSpecId() (@/shared/constants/modelSpecs) instead of duplicating a
// second cache over the same static table.
function getStaticSpecCanonicalModelId(modelId, rawModel) {
    const candidates = [
        modelId,
        rawModel
    ].filter((candidate)=>typeof candidate === "string" && candidate.length > 0);
    for (const candidate of candidates){
        const hit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findModelSpecIdByExactOrAlias"])(candidate);
        if (hit) return hit;
    }
    return null;
}
/**
 * Strip a trailing `-latest` alias suffix from a model id (#4073). Returns the
 * short id (`pixtral-12b-latest` → `pixtral-12b`) or `null` when there is no
 * `-latest` suffix to drop. Used only as a last-resort synced-lookup fallback.
 */ function stripLatestAlias(modelId) {
    if (!modelId) return null;
    const stripped = modelId.replace(/-latest$/i, "");
    return stripped && stripped !== modelId ? stripped : null;
}
// #8697-adjacent: MODELS_DEV_PROVIDER_MAP is a static module constant, so the result
// of reverseModelsDevProviders() never changes for a given provider — memoized by
// provider key instead of rescanning Object.entries(MODELS_DEV_PROVIDER_MAP) on every
// call (called once per model in a catalog rebuild). Never evicted — bounded by the
// number of distinct providers ever queried (~50-100 in practice), negligible memory.
const reverseModelsDevProvidersCache = new Map();
function reverseModelsDevProviders(provider) {
    // models.dev may store capabilities under a different OmniRoute provider id
    // that also maps from the same upstream models.dev provider. Build reverse
    // candidates from MODELS_DEV_PROVIDER_MAP (e.g. openai ↔ cx).
    //
    // MODELS_DEV_PROVIDER_MAP's RHS is inconsistent: most providers list their
    // canonical id directly, but the OAuth CLI providers (codex/claude) only
    // list their alias (cx/cc), never the canonical id. Also probe the
    // provider's alias so a canonical id like "codex"/"claude" still matches
    // the map entries keyed only by "cx"/"cc" (#8429).
    const cached = reverseModelsDevProvidersCache.get(provider);
    if (cached) return cached;
    const out = new Set();
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][provider] || provider;
    for (const [modelsDevId, omniIds] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2f$transform$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODELS_DEV_PROVIDER_MAP"])){
        if (omniIds.includes(provider) || omniIds.includes(providerAlias) || modelsDevId === provider || modelsDevId === providerAlias) {
            out.add(modelsDevId);
            for (const id of omniIds)out.add(id);
        }
    }
    // Frozen: the result is now shared across every future call for this provider (via
    // the cache above) instead of a fresh array per call — freeze prevents an accidental
    // caller mutation (e.g. .push()) from corrupting the cache for everyone else.
    const result = Object.freeze([
        ...out
    ]);
    reverseModelsDevProvidersCache.set(provider, result);
    return result;
}
function getSyncedCapabilityForResolved(provider, model, rawModel) {
    if (!provider || !model) return null;
    const modelCandidates = Array.from(new Set([
        model,
        rawModel,
        getStaticSpecCanonicalModelId(model, rawModel)
    ].filter((value)=>typeof value === "string" && value.length > 0).flatMap((candidate)=>{
        const values = [
            candidate
        ];
        const stripped = stripLatestAlias(candidate);
        if (stripped) values.push(stripped);
        const leaf = leafModelId(candidate);
        if (leaf) values.push(leaf);
        // models.dev often stores OpenAI-family specialty models as qualified
        // ids under another mapped provider, e.g. vercel + "openai/whisper-1".
        if (!candidate.includes("/")) {
            values.push(`${provider}/${candidate}`);
        }
        return values;
    })));
    // Include common host providers that re-publish OpenAI specialty models under
    // qualified ids (observed: vercel/openai/whisper-1, vercel/openai/tts-1).
    const providerCandidates = Array.from(new Set([
        provider,
        ...reverseModelsDevProviders(provider),
        "vercel"
    ]));
    for (const prov of providerCandidates){
        for (const mid of modelCandidates){
            const found = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelsDevSync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedCapability"])(prov, mid);
            if (found) return found;
        }
    }
    return null;
}
function modelIdLikelyVision(modelId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isVisionModelId"])(modelId);
}
/**
 * Models that upstream catalogs (notably models.dev) mislabel as vision-capable but
 * are TEXT-ONLY per the vendor's own docs. Listed here so a wrong synced
 * `attachment:true` cannot route an image request to a blind model (the #4071 failure
 * mode). Keep this list tiny and doc-backed.
 *
 * Xiaomi MiMo: only `mimo-v2.5` and `mimo-v2-omni` accept images; the `*-pro` chat
 * models are text-only (mimo.mi.com .../image-understanding; hermes-agent#18884).
 * Anchored to the full id (`$`) and tolerant of a `provider/` prefix so `mimo-v2.5-pro`
 * never matches the multimodal `mimo-v2.5`, and `mimo-v2-pro` never matches `mimo-v2-omni`.
 */ const KNOWN_TEXT_ONLY_DESPITE_SYNC = [
    /(?:^|\/)mimo-v2\.5-pro$/i,
    /(?:^|\/)mimo-v2-pro$/i
];
function isKnownTextOnlyDespiteSync(modelId) {
    if (!modelId) return false;
    const id = String(modelId);
    return KNOWN_TEXT_ONLY_DESPITE_SYNC.some((pattern)=>pattern.test(id));
}
/** True when a modality list declares image and/or video input/output. */ function modalitiesDeclareVision(modalities) {
    return modalities.some((entry)=>{
        const lower = String(entry).toLowerCase();
        return lower.includes("image") || lower.includes("video");
    });
}
function resolveVisionCapability(spec, registryModel, synced, modalitiesInput, modalitiesOutput, modelId) {
    const allModalities = [
        ...modalitiesInput,
        ...modalitiesOutput
    ].map((entry)=>String(entry).toLowerCase());
    // Hard override FIRST: a wrong synced `attachment:true` (or image modality) must not
    // win for models the vendor documents as text-only. Beats every branch below so an
    // image request can never be routed to a blind model (#4071).
    if (isKnownTextOnlyDespiteSync(modelId)) return false;
    if (typeof synced?.attachment === "boolean") {
        // #8250: models.dev sometimes ships attachment=false alongside image/video
        // modalities (observed for Kimi K3). Prefer the richer modality signal over
        // the contradictory false flag so supportsVision / attachment / modalities
        // can be reconciled to a single vision-capable verdict.
        if (synced.attachment === false && modalitiesDeclareVision(allModalities)) {
            return true;
        }
        // #8032: attachment=false without modalities must not beat authoritative
        // registry/spec vision for path-shaped custom/routed ids (e.g. Cline Pass
        // `cp/cline-pass/kimi-k3` → MODEL_SPECS["kimi-k3"].supportsVision).
        if (synced.attachment === false) {
            if (registryModel?.supportsVision === true) return true;
            if (spec?.supportsVision === true) return true;
            return false;
        }
        return synced.attachment;
    }
    if (allModalities.some((entry)=>entry.includes("image"))) {
        return true;
    }
    if (allModalities.length > 0) {
        return false;
    }
    if (typeof registryModel?.supportsVision === "boolean") return registryModel.supportsVision;
    if (typeof spec?.supportsVision === "boolean") return spec.supportsVision;
    // Last resort: no capability data at all. Positively confirm known multimodal
    // families by model id so image requests can be routed to them; everything
    // else stays `null` (unknown).
    if (modelIdLikelyVision(modelId)) return true;
    return null;
}
/**
 * Issue #6524: an operator-set `max_output_tokens` capability override (see
 * `src/lib/db/modelCapabilityOverrides.ts`) is the manual escape hatch for a
 * wrong/stale synced `limit_output` value (e.g. a provider's models.dev catalog
 * row reporting `limit_output` equal to `limit_context`). It already won over the
 * synced value in `getResolvedModelCapabilities().maxOutputTokens` — this helper
 * makes `getExplicitModelOutputCap()` (used by the reasoning-token-buffer clamp)
 * consult the same override so both read paths agree.
 */ /**
 * Exact-match capability override lookup with intentional raw-alias fallback.
 *
 * An override may be stored under either the canonical model id or the exact
 * provider-scoped raw alias the operator used (e.g. `github/claude-opus-4.5`
 * resolving to canonical `claude-opus-4-5-20251101`). We consult the canonical
 * id first, then the raw alias — both are exact provider/model matches. There is
 * deliberately NO suffix/effort/family inheritance: an override for
 * `codex/gpt-5.6` never applies to `codex/gpt-5.6-high`.
 */ function getCapabilityOverride(resolved, key) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.model, key);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelCapabilityOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCapabilityOverride"])(resolved.provider, resolved.rawModel, key) : null;
}
function getContextOverride(resolved) {
    const canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.model);
    if (canonical !== null) return canonical;
    return resolved.rawModel && resolved.rawModel !== resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextOverride"])(resolved.provider, resolved.rawModel) : null;
}
function getResolvedModelContextOverride(input) {
    return getContextOverride(resolveCapabilityInput(input));
}
function getInputTokenCapabilityOverride(resolved) {
    return getCapabilityOverride(resolved, "max_input_tokens");
}
function getOutputTokenCapabilityOverride(resolved) {
    return getCapabilityOverride(resolved, "max_output_tokens");
}
function getExplicitModelOutputCap(input) {
    const resolved = resolveCapabilityInput(input);
    const maxTokenOverride = getOutputTokenCapabilityOverride(resolved);
    if (maxTokenOverride !== null) return maxTokenOverride;
    const synced = getSyncedCapabilityForResolved(resolved.provider, resolved.model, resolved.rawModel);
    if (synced && typeof synced.limit_output === "number") return synced.limit_output;
    const registryModel = getRegistryModel(resolved.provider, resolved.model);
    if (typeof registryModel?.maxOutputTokens === "number") return registryModel.maxOutputTokens;
    const spec = getStaticSpec(resolved.model, resolved.rawModel);
    return spec?.maxOutputTokens ?? null;
}
function getResolvedModelCapabilities(input, options) {
    // Reconciliation / auto-discovery needs the override-free catalog view so a
    // persisted override never feeds back into the comparison that (re)writes it.
    const usePersistedOverrides = options?.persistedOverrides !== false;
    const resolved = resolveCapabilityInput(input);
    const spec = getStaticSpec(resolved.model, resolved.rawModel);
    const registryModel = getRegistryModel(resolved.provider, resolved.model);
    const synced = getSyncedCapabilityForResolved(resolved.provider, resolved.model, resolved.rawModel);
    const modalitiesInput = parseModalities(synced?.modalities_input);
    const modalitiesOutput = parseModalities(synced?.modalities_output);
    const lookupKey = toNonEmptyString(resolved.provider && resolved.model ? `${resolved.provider}/${resolved.model}` : resolved.model || resolved.rawModel || resolved.lookupKey) || "";
    const reasoningDenied = !heuristicReasoning(lookupKey);
    // Provider-level fallback: a live-discovered model (passthroughModels
    // providers like AI Horde) has no per-model registry entry, synced
    // capability, or static spec — every source above resolves to null, so
    // toolCalling would otherwise fall through to heuristicToolCalling's
    // optimistic default (true). Reuse the same unsupportedParams signal the
    // request-time strip already relies on: if the provider declares "tools"
    // unsupported for every model it serves, that's authoritative here too.
    const providerDeniesTools = resolved.provider && resolved.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnsupportedParams"])(resolved.provider, resolved.model).includes("tools") : false;
    const supportsTools = synced?.tool_call ?? (typeof registryModel?.toolCalling === "boolean" ? registryModel.toolCalling : null) ?? (typeof spec?.supportsTools === "boolean" ? spec.supportsTools : null) ?? (providerDeniesTools ? false : null);
    const supportsThinking = reasoningDenied ? false : synced?.reasoning ?? (typeof registryModel?.supportsReasoning === "boolean" ? registryModel.supportsReasoning : null) ?? (typeof spec?.supportsThinking === "boolean" ? spec.supportsThinking : null);
    const authoritativeContextWindow = getAuthoritativeStaticContextWindow(resolved.provider, resolved.model, resolved.rawModel);
    // A persisted context-window override (operator-set or auto-discovered)
    // reflects the real *total* window and wins over every static/synced source.
    // `maxInputTokens` still follows its own precedence chain; only when that
    // chain has no narrower source does it naturally fall back to this window.
    const persistedContextWindow = usePersistedOverrides ? getContextOverride(resolved) : null;
    const contextWindow = persistedContextWindow ?? authoritativeContextWindow ?? synced?.limit_context ?? (typeof registryModel?.contextLength === "number" ? registryModel.contextLength : null) ?? spec?.contextWindow ?? null;
    const maxInputOverride = usePersistedOverrides ? getInputTokenCapabilityOverride(resolved) : null;
    const maxTokenOverride = usePersistedOverrides ? getOutputTokenCapabilityOverride(resolved) : null;
    // Vision consults leaf static metadata for path-shaped ids; other capability
    // fields keep using the non-leaf `spec` from getStaticSpec() above.
    const visionSpec = getVisionStaticSpec(resolved.model, resolved.rawModel);
    const supportsVision = resolveVisionCapability(visionSpec, registryModel, synced, modalitiesInput, modalitiesOutput, lookupKey);
    // #8250: when resolve promoted vision over a contradictory attachment=false,
    // expose attachment=true so catalog / Vision Bridge / clients see one verdict.
    let attachment = synced?.attachment ?? null;
    if (supportsVision === true && attachment === false) {
        attachment = true;
    }
    return {
        provider: resolved.provider,
        model: resolved.model,
        rawModel: resolved.rawModel,
        toolCalling: supportsTools ?? heuristicToolCalling(lookupKey),
        reasoning: supportsThinking ?? heuristicReasoning(lookupKey),
        supportsThinking,
        supportsTools,
        supportsVision,
        supportsMaxTokens: heuristicMaxTokens(lookupKey),
        attachment,
        structuredOutput: synced?.structured_output ?? null,
        temperature: synced?.temperature ?? null,
        contextWindow,
        maxInputTokens: (()=>{
            // Input cap is input-only. An explicit `max_input_tokens` override wins;
            // otherwise fall back to the existing per-source input limits, then to the
            // total window. The effective cap can never exceed the total window
            // (input + output), so clamp it — but never double-count a requested
            // output against this input cap.
            const candidate = maxInputOverride ?? (typeof registryModel?.maxInputTokens === "number" ? registryModel.maxInputTokens : null) ?? authoritativeContextWindow ?? synced?.limit_input ?? contextWindow;
            return candidate !== null && contextWindow !== null ? Math.min(candidate, contextWindow) : candidate;
        })(),
        maxOutputTokens: maxTokenOverride ?? synced?.limit_output ?? (typeof registryModel?.maxOutputTokens === "number" ? registryModel.maxOutputTokens : null) ?? spec?.maxOutputTokens ?? null,
        defaultThinkingBudget: spec?.defaultThinkingBudget ?? 0,
        thinkingBudgetCap: spec?.thinkingBudgetCap ?? null,
        thinkingOverhead: spec?.thinkingOverhead ?? null,
        adaptiveMaxTokens: spec?.adaptiveMaxTokens ?? null,
        family: synced?.family ?? null,
        status: synced?.status ?? null,
        openWeights: synced?.open_weights ?? null,
        knowledgeCutoff: synced?.knowledge_cutoff ?? null,
        releaseDate: synced?.release_date ?? null,
        lastUpdated: synced?.last_updated ?? null,
        modalitiesInput,
        modalitiesOutput,
        interleavedField: synced?.interleaved_field ?? (typeof registryModel?.interleavedField === "string" ? registryModel.interleavedField : null)
    };
}
function resolveInputTokenCapForGate(input, { isCombo = false } = {}) {
    const resolved = resolveCapabilityInput(input);
    // 1. An explicit `max_input_tokens` override always wins and is never bypassed.
    const explicitInputOverride = getInputTokenCapabilityOverride(resolved);
    if (explicitInputOverride !== null) return explicitInputOverride;
    // 2. Combo rescue: an exact persisted context override supersedes the smaller
    //    catalog/client input hint (mirrors contextOverrideGate.evaluateContextLimit).
    if (isCombo) {
        const contextOverride = getContextOverride(resolved);
        if (contextOverride !== null) return contextOverride;
    }
    // 3. Canonical chain (already clamped to the total window by the resolver).
    return getResolvedModelCapabilities(input).maxInputTokens;
}
function supportsToolCalling(input) {
    if (typeof input === "string" && !String(input || "").trim()) return false;
    return getResolvedModelCapabilities(input).toolCalling;
}
function supportsReasoning(input) {
    if (typeof input === "string" && !String(input || "").trim()) return true;
    return getResolvedModelCapabilities(input).reasoning;
}
function supportsMaxTokens(input) {
    if (typeof input === "string" && !String(input || "").trim()) return true;
    return getResolvedModelCapabilities(input).supportsMaxTokens;
}
function capMaxOutputTokens(input, requested) {
    const cap = getResolvedModelCapabilities(input).maxOutputTokens;
    const hasRequested = typeof requested === "number" && Number.isFinite(requested);
    if (cap === null) return hasRequested ? requested : null;
    return hasRequested ? Math.min(requested, cap) : cap;
}
function getDefaultThinkingBudget(input) {
    return getResolvedModelCapabilities(input).defaultThinkingBudget;
}
function capThinkingBudget(input, budget) {
    const resolved = getResolvedModelCapabilities(input);
    let cap = resolved.thinkingBudgetCap;
    const modelId = resolved.model ?? resolved.rawModel ?? "";
    const modelLower = modelId.toLowerCase();
    // Learned-cap lookup needs a concrete provider key (the executor records under
    // `this.provider`). When the input is a bare Gemini id, `resolved.provider` is
    // null — but bare Gemini ids always route to the native Gemini provider, so
    // default to "gemini". Without this a cap learned via the executor would be
    // invisible to bare-model callers. Provider-qualified inputs keep their own
    // provider, preserving per-provider independence.
    const providerForLearned = resolved.provider ?? (modelLower.includes("gemini") ? "gemini" : null);
    const learned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLearnedThinkingCap"])(providerForLearned, modelId);
    if (learned !== null) {
        cap = cap === null ? learned : Math.min(cap, learned);
    }
    if (cap === null && modelLower.includes("gemini")) {
        cap = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GEMINI_FALLBACK_THINKING_CAP"];
    }
    return Math.min(budget, cap ?? budget);
}
function getModelContextLimit(providerOrInput, modelId) {
    const resolved = typeof providerOrInput === "string" && modelId !== undefined ? getResolvedModelCapabilities({
        provider: providerOrInput,
        model: modelId
    }) : getResolvedModelCapabilities(providerOrInput);
    return resolved.contextWindow;
}
}),
"[project]/open-sse/utils/jsonSize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jsonLength",
    ()=>jsonLength
]);
/**
 * Serialized JSON length without materializing the JSON (#7847).
 *
 * Several hot-path call sites only need `JSON.stringify(body).length` — a readiness-timeout
 * threshold, a payload-size metric, a token estimate. On a 3.05 MiB agent request each of those
 * allocates a full 3 MiB string that is read once for its length and thrown away, and #7847
 * reports that class of transient allocation driving V8/cgroup OOM under concurrent long-context
 * traffic.
 *
 * `jsonLength()` walks the value and counts instead. Same O(n) scan, no allocation.
 *
 * It is EXACT, not an approximation: every consumer feeds a threshold, and an approximation
 * would silently shift routing and timeout decisions. `tests/unit/json-size-exactness.test.ts`
 * property-tests `jsonLength(x) === JSON.stringify(x).length` over generated structures.
 *
 * Anything outside the plain-JSON subset (Date, toJSON, class instances, Map, ...) falls back to
 * `JSON.stringify` for THAT SUBTREE only, so an exotic leaf never forces the multi-megabyte
 * message history back onto the allocating path.
 */ /** Length of a JSON-encoded string, including the surrounding quotes. */ function encodedStringLength(value) {
    let len = 2; // the quotes
    for(let i = 0; i < value.length; i++){
        const code = value.charCodeAt(i);
        if (code === 0x22 || code === 0x5c) {
            len += 2; // \" and \\
        } else if (code === 0x08 || code === 0x09 || code === 0x0a || code === 0x0c || code === 0x0d) {
            len += 2; // \b \t \n \f \r
        } else if (code < 0x20) {
            len += 6; // \u00XX
        } else if (code >= 0xd800 && code <= 0xdfff) {
            // Surrogates: a well-formed pair serializes as its two code units (2 chars); a LONE
            // surrogate is escaped as \uXXXX since ES2019 well-formed JSON.stringify.
            const isHigh = code <= 0xdbff;
            const next = isHigh ? value.charCodeAt(i + 1) : NaN;
            const paired = isHigh && next >= 0xdc00 && next <= 0xdfff;
            if (paired) {
                len += 2;
                i++; // consume the low surrogate
            } else {
                len += 6;
            }
        } else {
            len += 1;
        }
    }
    return len;
}
/** True for values JSON.stringify drops (object values) or renders as null (array items). */ function isOmitted(value) {
    return value === undefined || typeof value === "function" || typeof value === "symbol";
}
function isPlainContainer(value) {
    if (Array.isArray(value)) return true;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}
function jsonLength(value) {
    return lengthOf(value, new Set());
}
function lengthOf(value, seen) {
    if (value === null) return 4; // "null"
    const type = typeof value;
    if (type === "string") return encodedStringLength(value);
    if (type === "boolean") return value ? 4 : 5;
    if (type === "number") {
        // Non-finite numbers serialize as null.
        return Number.isFinite(value) ? String(value).length : 4;
    }
    if (type === "bigint") {
        // Match JSON.stringify, which throws rather than guessing an encoding.
        throw new TypeError("Do not know how to serialize a BigInt");
    }
    if (isOmitted(value)) return 0;
    if (type !== "object") return 0;
    const obj = value;
    // Delegate anything that is not a plain object/array — Date, class instances with toJSON,
    // Map, boxed primitives. Scoped to this subtree so the big arrays stay on the fast path.
    if (!isPlainContainer(obj) || typeof obj.toJSON === "function") {
        const encoded = JSON.stringify(obj);
        return encoded === undefined ? 0 : encoded.length;
    }
    if (seen.has(obj)) {
        throw new TypeError("Converting circular structure to JSON");
    }
    seen.add(obj);
    try {
        if (Array.isArray(obj)) {
            let len = 2; // []
            for(let i = 0; i < obj.length; i++){
                if (i > 0) len += 1; // comma
                const item = obj[i];
                // Omitted values render as null inside arrays rather than disappearing.
                len += isOmitted(item) ? 4 : lengthOf(item, seen);
            }
            return len;
        }
        let len = 2; // {}
        let first = true;
        for (const key of Object.keys(obj)){
            const item = obj[key];
            if (isOmitted(item)) continue; // the whole entry disappears
            if (!first) len += 1; // comma
            first = false;
            len += encodedStringLength(key) + 1 + lengthOf(item, seen); // "key":value
        }
        return len;
    } finally{
        seen.delete(obj);
    }
}
}),
"[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compressContext",
    ()=>compressContext,
    "estimateTokens",
    ()=>estimateTokens,
    "fixToolAdjacency",
    ()=>fixToolAdjacency,
    "fixToolPairs",
    ()=>fixToolPairs,
    "getComboTargetTokenLimit",
    ()=>getComboTargetTokenLimit,
    "getTokenLimit",
    ()=>getTokenLimit,
    "isInlineBase64ImageBlock",
    ()=>isInlineBase64ImageBlock,
    "pruneOlderInlineImages",
    ()=>pruneOlderInlineImages,
    "resolveComboContextLimit",
    ()=>resolveComboContextLimit,
    "stripTrailingAssistantForProvider",
    ()=>stripTrailingAssistantForProvider,
    "stripTrailingAssistantOrphanToolUse",
    ()=>stripTrailingAssistantOrphanToolUse
]);
/**
 * Context Manager — Phase 4
 *
 * Pre-flight context compression to prevent "prompt too long" errors.
 * 3 layers: trim tool messages, compress structured thinking, aggressive purification.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonSize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/jsonSize.ts [app-route] (ecmascript)");
;
;
;
;
// Default token limits per provider (fallbacks when not in registry)
const DEFAULT_LIMITS = {
    claude: 200000,
    openai: 128000,
    gemini: 1000000,
    codex: 400000,
    // HyperAgent Claude-family agents (fable/opus/sonnet) — 1M default; was falling
    // through to 128k and blocking normal agentic tool loops with huge catalogs.
    hyperagent: 1_000_000,
    ha: 1_000_000,
    default: 128000
};
// Environment variable overrides (highest priority)
function getEnvOverride(provider) {
    const envKey = `CONTEXT_LENGTH_${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
    const envValue = process.env[envKey];
    if (envValue) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    // Global override
    const globalValue = process.env.CONTEXT_LENGTH_DEFAULT;
    if (globalValue) {
        const parsed = parseInt(globalValue, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return null;
}
// Reserve tokens override from environment variable
function getReserveTokensOverride() {
    const envValue = process.env.CONTEXT_RESERVE_TOKENS;
    if (envValue) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return null;
}
// How many of the newest inline images to keep when pruning older ones (#8560).
function getKeepLatestImagesOverride() {
    const envValue = process.env.CONTEXT_KEEP_LATEST_IMAGES;
    if (envValue) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return null;
}
const DEFAULT_KEEP_LATEST_IMAGES = 2;
const IMAGE_REMOVED_PLACEHOLDER = "[Earlier image removed to fit context window]";
// Rough chars-per-token ratio for quick estimation
const CHARS_PER_TOKEN = 4;
// Bounded per-image token budget used in place of measuring the raw base64
// payload as text. In line with the owner's PoC (~1052 total for prompt +
// 1 image) and litellm's calculate_img_tokens() default-count fast-path —
// see #8368 research notes.
const IMAGE_TOKEN_ESTIMATE = 1200;
// Matches inline base64 data URLs, e.g. "data:image/png;base64,AAAA...".
// Deliberately scoped to `data:image/...;base64,` so remote (http/https)
// URLs and generic long base64 text strings stay on the text-estimation path.
const INLINE_BASE64_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;
function isInlineBase64ImageUrl(value) {
    return typeof value === "string" && INLINE_BASE64_IMAGE_RE.test(value);
}
// OpenAI chat.completions: { type: 'image_url', image_url: { url: 'data:...' } | 'data:...' }
function matchesOpenAIImageUrlShape(node) {
    const imageUrl = node.image_url;
    if (isInlineBase64ImageUrl(imageUrl)) return true;
    return !!imageUrl && typeof imageUrl === "object" && isInlineBase64ImageUrl(imageUrl.url);
}
// AI SDK: { type: 'image', image: 'data:...' } (also covers Responses API's
// { type: 'input_image', image_url: 'data:...' } via matchesOpenAIImageUrlShape above).
function matchesAiSdkImageShape(node) {
    return node.type === "image" && isInlineBase64ImageUrl(node.image);
}
// Claude: { type: 'image', source: { type: 'base64', data: '...' } }
function matchesClaudeSourceShape(node) {
    if (node.type !== "image") return false;
    const source = node.source;
    if (!source || typeof source !== "object") return false;
    const src = source;
    return src.type === "base64" && typeof src.data === "string";
}
// Gemini: { inlineData: { data: '...' } } | { inline_data: { data: '...' } }
function matchesGeminiInlineDataShape(node) {
    const inlineData = node.inlineData ?? node.inline_data;
    if (!inlineData || typeof inlineData !== "object") return false;
    return typeof inlineData.data === "string";
}
function isInlineBase64ImageBlock(node) {
    return matchesOpenAIImageUrlShape(node) || matchesAiSdkImageShape(node) || matchesClaudeSourceShape(node) || matchesGeminiInlineDataShape(node);
}
function replaceImageBlockWithPlaceholder(block) {
    // Responses API parts use input_text / input_image — keep that family so restore
    // does not rewrite a chat-completions-shaped part into a Responses input item.
    if (block.type === "input_image") {
        return {
            type: "input_text",
            text: IMAGE_REMOVED_PLACEHOLDER
        };
    }
    if (block.inlineData || block.inline_data) {
        return {
            text: IMAGE_REMOVED_PLACEHOLDER
        };
    }
    return {
        type: "text",
        text: IMAGE_REMOVED_PLACEHOLDER
    };
}
function pruneOlderInlineImages(messages, options = {}) {
    const keepLatest = options.keepLatest ?? getKeepLatestImagesOverride() ?? DEFAULT_KEEP_LATEST_IMAGES;
    const targetTokens = options.targetTokens;
    const locations = [];
    for(let messageIndex = 0; messageIndex < messages.length; messageIndex++){
        const content = messages[messageIndex]?.content;
        if (!Array.isArray(content)) continue;
        for(let contentIndex = 0; contentIndex < content.length; contentIndex++){
            const part = content[contentIndex];
            if (part && typeof part === "object" && !Array.isArray(part) && isInlineBase64ImageBlock(part)) {
                locations.push({
                    messageIndex,
                    contentIndex
                });
            }
        }
    }
    if (locations.length <= keepLatest) {
        return {
            messages,
            pruned: 0
        };
    }
    const prunable = locations.slice(0, Math.max(0, locations.length - keepLatest));
    const next = messages.map((message)=>{
        if (!Array.isArray(message.content)) return message;
        return {
            ...message,
            content: [
                ...message.content
            ]
        };
    });
    let pruned = 0;
    for (const location of prunable){
        if (targetTokens != null && estimateTokens(next) <= targetTokens) break;
        const content = next[location.messageIndex].content;
        const block = content[location.contentIndex];
        content[location.contentIndex] = replaceImageBlockWithPlaceholder(block);
        pruned += 1;
    }
    return {
        messages: next,
        pruned
    };
}
/**
 * Recursively walk a structured node, replacing every recognized inline
 * base64 image block with a short placeholder (so its bulk is excluded from
 * the char-count pass below) while accumulating a bounded per-image token
 * cost. Returns the accumulated image token cost; the caller measures the
 * placeholder-substituted structure with the normal char/4 heuristic.
 *
 * Non-image content (including remote image URLs and generic base64 text)
 * is left untouched and continues to flow through the text-estimation path.
 */ function extractImageTokens(node, seen) {
    if (node === null || typeof node !== "object") {
        return {
            node,
            tokens: 0
        };
    }
    // Guard against cycles in structured request bodies.
    if (seen.has(node)) return {
        node,
        tokens: 0
    };
    seen.add(node);
    if (Array.isArray(node)) {
        let tokens = 0;
        const out = node.map((item)=>{
            const record = item && typeof item === "object" && !Array.isArray(item) ? item : null;
            if (record && isInlineBase64ImageBlock(record)) {
                tokens += IMAGE_TOKEN_ESTIMATE;
                return {
                    __image_token_estimate__: IMAGE_TOKEN_ESTIMATE
                };
            }
            const result = extractImageTokens(item, seen);
            tokens += result.tokens;
            return result.node;
        });
        return {
            node: out,
            tokens
        };
    }
    const record = node;
    if (isInlineBase64ImageBlock(record)) {
        return {
            node: {
                __image_token_estimate__: IMAGE_TOKEN_ESTIMATE
            },
            tokens: IMAGE_TOKEN_ESTIMATE
        };
    }
    let tokens = 0;
    const out = {};
    for (const [key, value] of Object.entries(record)){
        const result = extractImageTokens(value, seen);
        out[key] = result.node;
        tokens += result.tokens;
    }
    return {
        node: out,
        tokens
    };
}
function estimateTokens(text) {
    if (!text) return 0;
    if (typeof text === "string") {
        return Math.ceil(text.length / CHARS_PER_TOKEN);
    }
    const { node, tokens: imageTokens } = extractImageTokens(text, new Set());
    // #7847: count the serialized length instead of building the string. Only `.length` was ever
    // used, and on a multi-megabyte agent body that string is a pure transient allocation.
    // jsonLength is exact (property-tested against JSON.stringify), so the estimate is unchanged.
    return Math.ceil((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonSize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonLength"])(node) / CHARS_PER_TOKEN) + imageTokens;
}
function getTokenLimit(provider, model = null) {
    return resolveTokenLimit(provider, model).limit;
}
function getComboTargetTokenLimit(options) {
    let parsedProvider = options.parsedProvider;
    let parsedModel = options.parsedModel;
    if ((parsedProvider === undefined || parsedModel === undefined) && Object.prototype.hasOwnProperty.call(options, "modelStr")) {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(options.modelStr);
        if (parsedProvider === undefined) parsedProvider = parsed.provider;
        if (parsedModel === undefined) parsedModel = parsed.model;
    }
    const provider = parsedProvider ?? options.targetProvider ?? options.provider ?? "unknown";
    return getTokenLimit(provider, parsedModel ?? null);
}
/**
 * Same chain as getTokenLimit, but also reports whether the limit came from
 * a provider/model-specific source (env override, synced DB, registry,
 * name heuristic, curated per-provider default) or only from the generic
 * catch-all default.
 */ function resolveTokenLimit(provider, model = null) {
    // 1. Check environment variable override first
    const envOverride = getEnvOverride(provider);
    if (envOverride) return {
        limit: envOverride,
        specific: true
    };
    const lowerModel = (model || "").toLowerCase();
    // 2. Check models.dev synced DB for per-model context limit
    if (model) {
        const dbLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextLimit"])(provider, model);
        if (dbLimit && dbLimit > 0) return {
            limit: dbLimit,
            specific: true
        };
    }
    // 3. Check registry for provider default
    const registryEntry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REGISTRY"][provider];
    if (registryEntry?.defaultContextLength) {
        return {
            limit: registryEntry.defaultContextLength,
            specific: true
        };
    }
    // 4. Check if model name hints at a known limit
    if (model) {
        if (lowerModel.includes("claude")) return {
            limit: DEFAULT_LIMITS.claude,
            specific: true
        };
        if (lowerModel.includes("gemini")) return {
            limit: DEFAULT_LIMITS.gemini,
            specific: true
        };
        if (lowerModel.includes("gpt") || lowerModel.includes("o1") || lowerModel.includes("o3") || lowerModel.includes("o4") || lowerModel.includes("codex")) return {
            limit: DEFAULT_LIMITS.codex,
            specific: true
        };
    }
    // 5. Fallback to DEFAULT_LIMITS or default
    if (DEFAULT_LIMITS[provider]) return {
        limit: DEFAULT_LIMITS[provider],
        specific: true
    };
    return {
        limit: DEFAULT_LIMITS.default,
        specific: false
    };
}
function resolveComboContextLimit(options) {
    const own = resolveTokenLimit(options.provider, options.model ?? null);
    if (own.specific) {
        return {
            limit: own.limit,
            source: "target"
        };
    }
    const knownTargets = (options.comboTargetLimits || []).filter((value)=>Number.isFinite(value) && value > 0);
    if (knownTargets.length > 0) {
        return {
            limit: Math.min(...knownTargets),
            source: "combo-min"
        };
    }
    return {
        limit: own.limit,
        source: "fallback"
    };
}
function compressContext(body, options = {}) {
    if (!body || !body.messages || !Array.isArray(body.messages)) {
        return {
            body,
            compressed: false,
            stats: {}
        };
    }
    const provider = options.provider || "default";
    const maxTokens = options.maxTokens || getTokenLimit(provider, body.model || options.model || null);
    const defaultReserveTokens = Math.min(16000, Math.max(256, Math.floor(maxTokens * 0.15)));
    const reserveTokens = Math.min(options.reserveTokens ?? getReserveTokensOverride() ?? defaultReserveTokens, Math.max(0, maxTokens - 1));
    const targetTokens = Math.max(0, maxTokens - reserveTokens);
    let messages = [
        ...body.messages
    ];
    // #8594: pass the structured messages array directly — estimateTokens walks it for
    // inline base64 image blocks (#8368) and substitutes a bounded per-image estimate.
    // JSON.stringify()-ing first forces the char/4 text path and mis-measures a ~500KB
    // image as ~125k tokens, triggering needless compression / context loss.
    let currentTokens = estimateTokens(messages);
    const stats = {
        original: currentTokens,
        layers: []
    };
    // Already fits
    if (currentTokens <= targetTokens) {
        return {
            body,
            compressed: false,
            stats: {
                original: currentTokens,
                final: currentTokens
            }
        };
    }
    // Layer 1: Trim tool_result/tool messages
    messages = trimToolMessages(messages, 2000); // Max 2000 chars per tool result
    currentTokens = estimateTokens(messages); // #8594: object-path keeps the #8368 image estimate
    stats.layers.push({
        name: "trim_tools",
        tokens: currentTokens
    });
    if (currentTokens <= targetTokens) {
        return {
            body: {
                ...body,
                messages
            },
            compressed: true,
            stats: {
                ...stats,
                final: currentTokens
            }
        };
    }
    // Layer 1.5: Drop oldest inline images while keeping the newest ones (#8560).
    const imagePrune = pruneOlderInlineImages(messages, {
        keepLatest: options.keepLatestImages,
        targetTokens
    });
    if (imagePrune.pruned > 0) {
        messages = imagePrune.messages;
        currentTokens = estimateTokens(messages);
        stats.layers.push({
            name: "prune_images",
            tokens: currentTokens
        });
        if (currentTokens <= targetTokens) {
            return {
                body: {
                    ...body,
                    messages
                },
                compressed: true,
                stats: {
                    ...stats,
                    final: currentTokens
                }
            };
        }
    }
    // Layer 2: Compress structured thinking blocks (remove from non-last assistant messages)
    messages = compressThinking(messages);
    currentTokens = estimateTokens(messages); // #8594: object-path keeps the #8368 image estimate
    stats.layers.push({
        name: "compress_thinking",
        tokens: currentTokens
    });
    if (currentTokens <= targetTokens) {
        return {
            body: {
                ...body,
                messages
            },
            compressed: true,
            stats: {
                ...stats,
                final: currentTokens
            }
        };
    }
    // Layer 3: Aggressive purification — drop oldest messages keeping system + last N pairs
    messages = purifyHistory(messages, targetTokens);
    currentTokens = estimateTokens(messages); // #8594: object-path keeps the #8368 image estimate
    stats.layers.push({
        name: "purify_history",
        tokens: currentTokens
    });
    return {
        body: {
            ...body,
            messages
        },
        compressed: true,
        stats: {
            ...stats,
            final: currentTokens
        }
    };
}
// ─── Layer 1: Trim Tool Messages ────────────────────────────────────────────
function trimToolMessages(messages, maxChars) {
    return messages.map((msg)=>{
        if (msg.role === "tool" && typeof msg.content === "string" && msg.content.length > maxChars) {
            return {
                ...msg,
                content: msg.content.slice(0, maxChars) + "\n... [truncated]"
            };
        }
        // Handle array content (Claude format with tool_result blocks)
        if (msg.role === "user" && Array.isArray(msg.content)) {
            return {
                ...msg,
                content: msg.content.map((block)=>{
                    if (block.type === "tool_result" && typeof block.content === "string" && block.content.length > maxChars) {
                        return {
                            ...block,
                            content: block.content.slice(0, maxChars) + "\n... [truncated]"
                        };
                    }
                    return block;
                })
            };
        }
        return msg;
    });
}
// ─── Layer 2: Compress Structured Thinking Blocks ───────────────────────────
function compressThinking(messages) {
    // Find last assistant message index
    let lastAssistantIdx = -1;
    for(let i = messages.length - 1; i >= 0; i--){
        if (messages[i].role === "assistant") {
            lastAssistantIdx = i;
            break;
        }
    }
    return messages.map((msg, i)=>{
        if (msg.role !== "assistant") return msg;
        if (i === lastAssistantIdx) return msg; // Keep thinking in last assistant msg
        // Remove thinking blocks from content array
        if (Array.isArray(msg.content)) {
            const filtered = msg.content.filter((block)=>block.type !== "thinking");
            if (filtered.length === 0) {
                return {
                    ...msg,
                    content: "[thinking compressed]"
                };
            }
            return {
                ...msg,
                content: filtered
            };
        }
        return msg;
    });
}
// ─── Layer 3: Aggressive Purification ───────────────────────────────────────
function purifyHistory(messages, targetTokens) {
    // Keep system message(s) and the last N message pairs
    const system = messages.filter((m)=>m.role === "system" || m.role === "developer");
    const nonSystem = messages.filter((m)=>m.role !== "system" && m.role !== "developer");
    // Binary search for how many messages to keep from the end
    let keep = nonSystem.length;
    while(keep > 2){
        let candidate = [
            ...system,
            ...nonSystem.slice(-keep)
        ];
        candidate = fixToolPairs(candidate);
        candidate = fixToolAdjacency(candidate);
        // Re-run pair fix: fixToolAdjacency may have stripped tool_use blocks, leaving
        // orphan tool_results that Claude rejects ("tool_result without preceding tool_use").
        candidate = fixToolPairs(candidate);
        candidate = stripTrailingAssistantOrphanToolUse(candidate);
        // #8594: measure the candidate structure directly so image-bearing turns are not
        // over-counted and pruned during the binary search.
        const tokens = estimateTokens(candidate);
        if (tokens <= targetTokens) break;
        keep = Math.max(2, Math.floor(keep * 0.7)); // Drop 30% each iteration
    }
    let result = [
        ...system,
        ...nonSystem.slice(-keep)
    ];
    result = fixToolPairs(result);
    result = fixToolAdjacency(result);
    // Re-run pair fix to drop any tool_result whose matching tool_use was removed by
    // fixToolAdjacency (discussion #2410 — orphan tool_result -> upstream 400).
    result = fixToolPairs(result);
    result = stripTrailingAssistantOrphanToolUse(result);
    // Add summary of dropped messages
    if (keep < nonSystem.length) {
        const dropped = nonSystem.length - keep;
        result.splice(system.length, 0, {
            role: "system",
            content: `[Context compressed: ${dropped} earlier messages removed to fit context window]`
        });
    }
    return result;
}
function fixToolPairs(messages) {
    // Pass 1: Collect all tool_result IDs from user/tool messages
    const toolResultIds = new Set();
    for (const msg of messages){
        if (msg.role === "tool" && msg.tool_call_id) {
            toolResultIds.add(msg.tool_call_id);
        }
        if (msg.role === "user" && Array.isArray(msg.content)) {
            for (const block of msg.content){
                if (block.type === "tool_result" && block.tool_use_id) {
                    toolResultIds.add(block.tool_use_id);
                }
            }
        }
    }
    // Pass 2: Filter assistant messages to remove tool_use without tool_result
    // (Exception: keep tool_use if the assistant message is the last message)
    const isLastMessage = (idx)=>idx === messages.length - 1;
    const filteredMessages = messages.map((msg, idx)=>{
        if (msg.role === "assistant" && !isLastMessage(idx)) {
            let modified = false;
            const newMsg = {
                ...msg
            };
            if (Array.isArray(newMsg.tool_calls)) {
                const filteredToolCalls = newMsg.tool_calls.filter((tc)=>!tc.id || toolResultIds.has(tc.id));
                if (filteredToolCalls.length !== newMsg.tool_calls.length) {
                    newMsg.tool_calls = filteredToolCalls;
                    modified = true;
                }
            }
            if (Array.isArray(newMsg.content)) {
                const filteredContent = newMsg.content.filter((block)=>block.type !== "tool_use" || !block.id || toolResultIds.has(block.id));
                if (filteredContent.length !== newMsg.content.length) {
                    newMsg.content = filteredContent;
                    modified = true;
                }
            }
            return modified ? newMsg : msg;
        }
        return msg;
    });
    // Pass 3: Collect all remaining tool_use IDs from assistant messages
    const toolCallIds = new Set();
    for (const msg of filteredMessages){
        if (msg.role === "assistant") {
            if (Array.isArray(msg.tool_calls)) {
                for (const tc of msg.tool_calls){
                    if (tc.id) toolCallIds.add(tc.id);
                }
            }
            if (Array.isArray(msg.content)) {
                for (const block of msg.content){
                    if (block.type === "tool_use" && block.id) {
                        toolCallIds.add(block.id);
                    }
                }
            }
        }
    }
    // Pass 4: Filter user/tool messages to remove tool_result without tool_use
    return filteredMessages.map((msg)=>{
        if (msg.role === "tool" && msg.tool_call_id) {
            if (!toolCallIds.has(msg.tool_call_id)) return null;
        }
        if (msg.role === "user" && Array.isArray(msg.content)) {
            const filteredContent = msg.content.filter((block)=>block.type !== "tool_result" || !block.tool_use_id || toolCallIds.has(block.tool_use_id));
            if (filteredContent.length !== msg.content.length) {
                if (filteredContent.length === 0) return null;
                return {
                    ...msg,
                    content: filteredContent
                };
            }
        }
        // Drop assistant messages if their content AND tool_calls became empty
        if (msg.role === "assistant") {
            const hasContent = typeof msg.content === "string" ? msg.content.trim().length > 0 : Array.isArray(msg.content) && msg.content.length > 0;
            const hasToolCalls = Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0;
            if (!hasContent && !hasToolCalls) {
                return null;
            }
        }
        return msg;
    }).filter(Boolean);
}
function fixToolAdjacency(messages) {
    if (messages.length <= 1) return messages;
    const result = [];
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        const nextMsg = messages[i + 1];
        if (msg.role !== "assistant" || !nextMsg) {
            result.push(msg);
            continue;
        }
        // Collect tool_result IDs from the NEXT message only
        const nextToolResultIds = new Set();
        if (nextMsg.role === "tool" && nextMsg.tool_call_id) {
            nextToolResultIds.add(String(nextMsg.tool_call_id));
        }
        if (nextMsg.role === "user" && Array.isArray(nextMsg.content)) {
            for (const block of nextMsg.content){
                if (block.type === "tool_result" && block.tool_use_id) {
                    nextToolResultIds.add(String(block.tool_use_id));
                }
            }
        }
        let modified = false;
        const newMsg = {
            ...msg
        };
        // Filter tool_use blocks in content array (Claude format)
        if (Array.isArray(newMsg.content)) {
            const filteredContent = newMsg.content.filter((block)=>block.type !== "tool_use" || !block.id || nextToolResultIds.has(String(block.id)));
            if (filteredContent.length !== newMsg.content.length) {
                newMsg.content = filteredContent;
                modified = true;
            }
        }
        // Filter tool_calls array (OpenAI format) — independently of content
        if (Array.isArray(newMsg.tool_calls)) {
            const filteredToolCalls = newMsg.tool_calls.filter((tc)=>!tc.id || nextToolResultIds.has(String(tc.id)));
            if (filteredToolCalls.length !== newMsg.tool_calls.length) {
                newMsg.tool_calls = filteredToolCalls;
                modified = true;
            }
        }
        if (modified) {
            // Drop assistant message if it became empty
            const hasContent = typeof newMsg.content === "string" ? newMsg.content.trim().length > 0 : Array.isArray(newMsg.content) && newMsg.content.length > 0;
            const hasToolCalls = Array.isArray(newMsg.tool_calls) && newMsg.tool_calls.length > 0;
            if (!hasContent && !hasToolCalls) continue;
            result.push(newMsg);
        } else {
            result.push(msg);
        }
    }
    return result;
}
function stripTrailingAssistantOrphanToolUse(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return messages;
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (!last || last.role !== "assistant") return messages;
    let modified = false;
    const newLast = {
        ...last
    };
    if (Array.isArray(newLast.tool_calls)) {
        const filteredCalls = newLast.tool_calls.filter(()=>false // remove all trailing tool_calls (none can be paired by definition)
        );
        if (filteredCalls.length !== newLast.tool_calls.length) {
            newLast.tool_calls = filteredCalls;
            modified = true;
        }
    }
    if (Array.isArray(newLast.content)) {
        const filteredContent = newLast.content.filter((block)=>block.type !== "tool_use");
        if (filteredContent.length !== newLast.content.length) {
            newLast.content = filteredContent;
            modified = true;
        }
    }
    if (!modified) return messages;
    // If the last message is now empty, drop it.
    const hasContent = typeof newLast.content === "string" ? newLast.content.trim().length > 0 : Array.isArray(newLast.content) && newLast.content.length > 0;
    const hasToolCalls = Array.isArray(newLast.tool_calls) && newLast.tool_calls.length > 0;
    const result = messages.slice(0, lastIdx);
    if (hasContent || hasToolCalls) result.push(newLast);
    return result;
}
/**
 * Providers that strictly require the last message to be `user` or `tool`.
 * A trailing `assistant` message with plain text content (no tool_use) is
 * valid for Anthropic/OpenAI (signals "continue from here") but rejected by
 * Mistral with: "Expected last role User or Tool … but got assistant" (#3396).
 */ const PROVIDERS_REQUIRING_USER_LAST_MESSAGE = new Set([
    "mistral"
]);
function stripTrailingAssistantForProvider(messages, provider) {
    if (!PROVIDERS_REQUIRING_USER_LAST_MESSAGE.has(provider)) return messages;
    if (!Array.isArray(messages) || messages.length === 0) return messages;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return messages;
    // Only strip when the message has NO tool_use / tool_calls (those are
    // handled by stripTrailingAssistantOrphanToolUse upstream of this call).
    const hasToolUse = Array.isArray(last.content) && last.content.some((b)=>b.type === "tool_use");
    const hasToolCalls = Array.isArray(last.tool_calls) && last.tool_calls.length > 0;
    if (hasToolUse || hasToolCalls) return messages;
    return messages.slice(0, messages.length - 1);
}
}),
"[project]/open-sse/services/claudeCodeFingerprint.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeFingerprint",
    ()=>computeFingerprint,
    "extractFirstUserMessageText",
    ()=>extractFirstUserMessageText
]);
/**
 * Claude Code fingerprint computation.
 *
 * The billing header includes a 3-char fingerprint derived from:
 *   SHA256(SALT + msg[4] + msg[7] + msg[20] + version)[:3]
 *
 * This fingerprint is computed from the first user message text and
 * included in cc_version=VERSION.FINGERPRINT in the billing header.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const FINGERPRINT_SALT = "59cf53e54c78";
function computeFingerprint(firstUserMessageText, version) {
    const indices = [
        4,
        7,
        20
    ];
    const chars = indices.map((i)=>firstUserMessageText[i] || "0").join("");
    const input = `${FINGERPRINT_SALT}${chars}${version}`;
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(input).digest("hex");
    return hash.slice(0, 3);
}
function extractFirstUserMessageText(messages) {
    if (!Array.isArray(messages)) return "";
    for (const msg of messages){
        if (String(msg?.role).toLowerCase() !== "user") continue;
        const content = msg?.content;
        if (typeof content === "string") return content;
        if (Array.isArray(content)) {
            for (const block of content){
                if (block && typeof block === "object" && "text" in block && typeof block.text === "string") {
                    return block.text;
                }
            }
        }
        return "";
    }
    return "";
}
}),
"[project]/open-sse/services/claudeCodeCompatible.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_CODE_COMPATIBLE_ANTHROPIC_VERSION",
    ()=>CLAUDE_CODE_COMPATIBLE_ANTHROPIC_VERSION,
    "CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH",
    ()=>CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH,
    "CLAUDE_CODE_COMPATIBLE_DEFAULT_MAX_TOKENS",
    ()=>CLAUDE_CODE_COMPATIBLE_DEFAULT_MAX_TOKENS,
    "CLAUDE_CODE_COMPATIBLE_DEFAULT_MODELS_PATH",
    ()=>CLAUDE_CODE_COMPATIBLE_DEFAULT_MODELS_PATH,
    "CLAUDE_CODE_COMPATIBLE_PREFIX",
    ()=>CLAUDE_CODE_COMPATIBLE_PREFIX,
    "CLAUDE_CODE_COMPATIBLE_STAINLESS_TIMEOUT_SECONDS",
    ()=>CLAUDE_CODE_COMPATIBLE_STAINLESS_TIMEOUT_SECONDS,
    "CONTEXT_1M_BETA_HEADER",
    ()=>CONTEXT_1M_BETA_HEADER,
    "appendAnthropicBetaHeader",
    ()=>appendAnthropicBetaHeader,
    "buildAndSignClaudeCodeRequest",
    ()=>buildAndSignClaudeCodeRequest,
    "buildClaudeCodeCompatibleHeaders",
    ()=>buildClaudeCodeCompatibleHeaders,
    "buildClaudeCodeCompatibleRequest",
    ()=>buildClaudeCodeCompatibleRequest,
    "buildClaudeCodeCompatibleValidationPayload",
    ()=>buildClaudeCodeCompatibleValidationPayload,
    "isClaudeCodeCompatibleProvider",
    ()=>isClaudeCodeCompatibleProvider,
    "joinBaseUrlAndPath",
    ()=>joinBaseUrlAndPath,
    "joinClaudeCodeCompatibleUrl",
    ()=>joinClaudeCodeCompatibleUrl,
    "modelSupportsContext1mBeta",
    ()=>modelSupportsContext1mBeta,
    "resolveClaudeCodeCompatibleEffort",
    ()=>resolveClaudeCodeCompatibleEffort,
    "resolveClaudeCodeCompatibleMaxTokens",
    ()=>resolveClaudeCodeCompatibleMaxTokens,
    "resolveClaudeCodeCompatibleSessionId",
    ()=>resolveClaudeCodeCompatibleSessionId,
    "stripAnthropicMessagesSuffix",
    ()=>stripAnthropicMessagesSuffix,
    "stripClaudeCodeCompatibleEndpointSuffix",
    ()=>stripClaudeCodeCompatibleEndpointSuffix
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/claudeCodeCompatibleIdentity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/claudeHelper.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCCH.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleBeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatibleBeta.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeConstraints.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleThinkingDisplay$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatibleThinkingDisplay.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeObfuscation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccOpenAiMediaBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccOpenAiMediaBlocks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeFingerprint$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeFingerprint.ts [app-route] (ecmascript)");
// Legacy (deprecated, kept for transitional API consumers).
// The base executor is still used internally by systemTransforms.ts;
// these exports let downstream code reference the building blocks directly
// while we migrate UI + settings to the v2 shape.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccBridgeTransforms.ts [app-route] (ecmascript)");
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
const CLAUDE_CODE_COMPATIBLE_PREFIX = "anthropic-compatible-cc-";
const CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH = "/v1/messages?beta=true";
const CLAUDE_CODE_COMPATIBLE_DEFAULT_MODELS_PATH = "/models";
const CLAUDE_CODE_COMPATIBLE_DEFAULT_MAX_TOKENS = 64000;
const CLAUDE_CODE_COMPATIBLE_ANTHROPIC_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"];
;
;
const CONTEXT_1M_BETA_HEADER = "context-1m-2025-08-07";
const CLAUDE_CODE_COMPATIBLE_DEFAULT_SYSTEM_BLOCKS = [
    {
        type: "text",
        text: "You are a Claude agent, built on Anthropic's Claude Agent SDK."
    }
];
const CONTEXT_1M_SUPPORTED_MODELS = [
    "claude-fable-5",
    "claude-sonnet-5",
    "claude-sonnet-4-6",
    "claude-opus-4-8",
    "claude-opus-4-7",
    "claude-opus-4-6"
];
const CLAUDE_CODE_COMPATIBLE_STAINLESS_TIMEOUT_SECONDS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStainlessTimeoutSeconds"])(process.env);
function supportsClaudeXHighEffort(model) {
    return typeof model === "string" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supportsXHighEffort"])("claude", model);
}
function isClaudeCodeCompatibleProvider(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX) || // Built-in providers (e.g. agentrouter) that adopt the dynamic CC wire image
    // while keeping their own registry baseUrl + auth (#6056).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider);
}
function stripAnthropicMessagesSuffix(baseUrl) {
    const normalized = String(baseUrl || "").trim().replace(/\/$/, "");
    if (!normalized) return "";
    return normalized.split("?")[0].replace(/\/messages$/i, "");
}
function stripClaudeCodeCompatibleEndpointSuffix(baseUrl) {
    const normalized = String(baseUrl || "").trim().replace(/\/$/, "");
    if (!normalized) return "";
    return normalized.split("?")[0].replace(/\/(?:v\d+\/)?messages$/i, "");
}
function joinNormalizedBaseUrlAndPath(baseUrl, path) {
    const normalizedBase = String(baseUrl || "").replace(/\/$/, "");
    const normalizedPath = String(path || "").startsWith("/") ? String(path) : `/${String(path || "")}`;
    const versionMatch = normalizedBase.match(/(\/v\d+)$/i);
    if (versionMatch && normalizedPath.toLowerCase().startsWith(`${versionMatch[1].toLowerCase()}/`)) {
        return `${normalizedBase}${normalizedPath.slice(versionMatch[1].length)}`;
    }
    return `${normalizedBase}${normalizedPath}`;
}
function joinBaseUrlAndPath(baseUrl, path) {
    return joinNormalizedBaseUrlAndPath(stripAnthropicMessagesSuffix(baseUrl), path);
}
function joinClaudeCodeCompatibleUrl(baseUrl, path) {
    return joinNormalizedBaseUrlAndPath(stripClaudeCodeCompatibleEndpointSuffix(baseUrl), path);
}
function appendAnthropicBetaHeader(headers, betaHeader) {
    const existingKey = Object.keys(headers).find((key)=>key.toLowerCase() === "anthropic-beta");
    if (!existingKey) {
        headers["anthropic-beta"] = betaHeader;
        return;
    }
    const existingValues = String(headers[existingKey] || "").split(",").map((value)=>value.trim()).filter(Boolean);
    if (!existingValues.includes(betaHeader)) {
        headers[existingKey] = [
            ...existingValues,
            betaHeader
        ].join(",");
    }
}
function modelSupportsContext1mBeta(model) {
    const normalizedModel = String(model || "").trim().toLowerCase().replace(/-\d{8}$/, "");
    return CONTEXT_1M_SUPPORTED_MODELS.some((supported)=>normalizedModel === supported || normalizedModel.startsWith(`${supported}-`));
}
function buildClaudeCodeCompatibleHeaders(apiKey, stream = false, sessionId, options = {}) {
    // These headers intentionally mirror Claude Code's wire image closely.
    // For CC-compatible relays, passing the upstream's client-gating checks is
    // more important than forwarding arbitrary caller-specific header shapes.
    return {
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
        Authorization: `Bearer ${apiKey}`,
        "anthropic-version": CLAUDE_CODE_COMPATIBLE_ANTHROPIC_VERSION,
        "anthropic-beta": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleBeta$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveClaudeCodeCompatibleAnthropicBeta"])({
            redactThinking: options.redactThinking === true
        }),
        "anthropic-dangerous-direct-browser-access": "true",
        "x-app": "cli",
        "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_COMPATIBLE_USER_AGENT"],
        "X-Stainless-Retry-Count": "0",
        "X-Stainless-Timeout": String(CLAUDE_CODE_COMPATIBLE_STAINLESS_TIMEOUT_SECONDS),
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_COMPATIBLE_STAINLESS_PACKAGE_VERSION"],
        "X-Stainless-OS": "MacOS",
        "X-Stainless-Arch": "arm64",
        "X-Stainless-Runtime": "node",
        "X-Stainless-Runtime-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_COMPATIBLE_STAINLESS_RUNTIME_VERSION"],
        "accept-encoding": "gzip, deflate, br, zstd",
        ...sessionId ? {
            "X-Claude-Code-Session-Id": sessionId
        } : {}
    };
}
function buildClaudeCodeCompatibleValidationPayload(model = "claude-sonnet-4-6") {
    const sessionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    return buildClaudeCodeCompatibleRequest({
        sourceBody: {
            max_tokens: 1
        },
        normalizedBody: {
            messages: [
                {
                    role: "user",
                    content: "ok"
                }
            ],
            max_tokens: 1
        },
        model,
        stream: true,
        sessionId,
        cwd: process.cwd(),
        now: new Date()
    });
}
function resolveClaudeCodeCompatibleSessionId(headers) {
    const raw = getHeader(headers, "x-claude-code-session-id") || getHeader(headers, "x-session-id") || getHeader(headers, "x_session_id") || getHeader(headers, "x-omniroute-session") || null;
    return raw && raw.trim() || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
}
function buildClaudeCodeCompatibleRequest({ sourceBody, normalizedBody, claudeBody, model, stream = false, cwd = process.cwd(), sessionId, preserveCacheControl = false, preserveClaudeMessages = false, summarizeThinking = false }) {
    const normalized = normalizedBody || {};
    const preparedClaudeBody = claudeBody ? preserveClaudeMessages ? prepareClaudeCodeCompatibleSemanticBody(claudeBody) : prepareClaudeCodeCompatibleBody(claudeBody, preserveCacheControl) : null;
    const normalizedMessages = Array.isArray(normalized.messages) ? normalized.messages : [];
    const extractedClaudeBody = !preparedClaudeBody && sourceBody ? extractClaudeBodyFromSource(sourceBody, preserveCacheControl) : null;
    const effectiveClaudeBody = preparedClaudeBody || extractedClaudeBody;
    const messages = effectiveClaudeBody ? preserveClaudeMessages && preparedClaudeBody ? cloneClaudeCodeCompatibleMessagesFromClaude(effectiveClaudeBody.messages, preserveCacheControl) : buildClaudeCodeCompatibleMessagesFromClaude(effectiveClaudeBody.messages, preserveCacheControl) : buildClaudeCodeCompatibleMessages(normalizedMessages);
    const system = buildClaudeCodeCompatibleSystemBlocks({
        messages: preserveClaudeMessages ? [] : normalizedMessages,
        systemBlocks: effectiveClaudeBody?.system,
        preserveCacheControl
    });
    const resolvedSessionId = sessionId || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const effort = resolveClaudeCodeCompatibleEffort(sourceBody, normalizedBody, model);
    const maxTokens = resolveClaudeCodeCompatibleMaxTokens(sourceBody, normalizedBody);
    const tools = preparedClaudeBody?.tools ? buildClaudeCodeCompatibleToolsFromClaude(preparedClaudeBody.tools, preserveCacheControl) : buildClaudeCodeCompatibleTools(normalizedBody, sourceBody);
    const toolChoice = tools.length > 0 ? buildClaudeCodeCompatibleToolChoice(normalizedBody?.["tool_choice"] ?? sourceBody?.["tool_choice"]) : undefined;
    const metadata = resolveClaudeCodeCompatibleMetadata({
        claudeBody,
        sourceBody,
        normalizedBody,
        cwd,
        sessionId: resolvedSessionId
    });
    const thinking = resolveClaudeCodeCompatibleThinking({
        claudeBody: preparedClaudeBody ?? claudeBody,
        sourceBody,
        normalizedBody,
        summarizeThinking
    });
    const outputConfig = resolveClaudeCodeCompatibleOutputConfig({
        claudeBody,
        sourceBody,
        normalizedBody,
        model,
        effort
    });
    return {
        model,
        messages,
        system,
        tools,
        metadata,
        max_tokens: maxTokens,
        thinking,
        output_config: outputConfig,
        ...toolChoice ? {
            tool_choice: toolChoice
        } : {},
        ...stream ? {
            stream: true
        } : {}
    };
}
async function buildAndSignClaudeCodeRequest(options) {
    const { apiKey, enableObfuscation = false, ...buildOptions } = options;
    // Step 1: Build base request
    const body = buildClaudeCodeCompatibleRequest(buildOptions);
    // Step 2: Remap tool names
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["remapToolNamesInRequest"])(body);
    // Step 3-4: Thinking constraints
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enforceThinkingTemperature"])(body);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disableThinkingIfToolChoiceForced"])(body);
    // Step 5: Cache control
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enforceCacheControlLimit"])(body);
    // Step 5b: Config-driven system transforms (issue #2260, v2)
    // Normalizes system blocks to classifier-correct structure regardless of
    // source client (OpenCode, Cline, Cursor, Continue, Open WebUI, raw API).
    // Routed via the generic per-provider DSL so the same pipeline shape covers
    // the CC bridge, the native `claude` path, and any other configured
    // provider. Idempotent on re-run.
    {
        const transformResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applySystemTransformPipeline"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CC_BRIDGE"], body);
        if (transformResult.appliedOpKinds.length > 0) {
            console.log(`[SystemTransforms] cc-bridge: ${transformResult.appliedOpKinds.join(", ")}`);
        }
    }
    // Step 5c: Guard against orphan tool_use / tool_result blocks.
    // Anthropic rejects requests where a tool_use has no matching tool_result
    // in the next user message (e.g. `messages.N: tool_use ids were found
    // without tool_result blocks immediately after: toolu_...`). Clients can
    // ship truncated histories mid-tool-call; fixToolPairs strips orphans
    // (preserving final-message tool_use for in-flight rounds), then
    // stripTrailingAssistantOrphanToolUse catches the case where the request
    // body itself ends on an unmatched assistant(tool_use) — invalid for an
    // upstream-send turn since the body must end on a user message.
    // Both are idempotent on clean histories.
    {
        const b = body;
        if (Array.isArray(b.messages)) {
            const fixed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixToolPairs"])(b.messages);
            const adjacent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixToolAdjacency"])(fixed);
            // fixToolAdjacency can leave orphan tool_result blocks behind when it
            // strips a tool_use whose tool_result wasn't in the next message.
            // Re-pair to drop those orphans (discussion #2410).
            const cleaned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fixToolPairs"])(adjacent);
            b.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripTrailingAssistantOrphanToolUse"])(cleaned);
        }
    }
    // Step 6: Obfuscation (optional, per-provider setting)
    if (enableObfuscation) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["obfuscateInBody"])(body);
    }
    // Step 7: Serialize with CCH placeholder (strip internal sentinel fields)
    delete body["_claudeCodeRequiresLowercaseToolNames"];
    const serialized = JSON.stringify(body);
    // Step 8: Sign with xxHash64
    const bodyString = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signRequestBody"])(serialized);
    // Build headers
    const sessionId = options.sessionId || resolveClaudeCodeCompatibleSessionId();
    const headers = buildClaudeCodeCompatibleHeaders(apiKey, options.stream ?? false, sessionId, {
        redactThinking: buildOptions.redactThinking === true
    });
    return {
        bodyString,
        headers
    };
}
;
;
;
;
;
;
;
function resolveClaudeCodeCompatibleEffort(sourceBody, normalizedBody, model) {
    const raw = readNestedString(sourceBody, [
        "output_config",
        "effort"
    ]) || readNestedString(sourceBody, [
        "reasoning",
        "effort"
    ]) || toNonEmptyString(sourceBody?.["reasoning_effort"]) || readNestedString(normalizedBody, [
        "output_config",
        "effort"
    ]) || readNestedString(normalizedBody, [
        "reasoning",
        "effort"
    ]) || toNonEmptyString(normalizedBody?.["reasoning_effort"]) || "";
    const normalizedEffort = raw.toLowerCase();
    if (!normalizedEffort) {
        return supportsClaudeXHighEffort(model) ? "xhigh" : "high";
    }
    if (normalizedEffort === "low") return "low";
    if (normalizedEffort === "medium") return "medium";
    if (normalizedEffort === "high") return "high";
    if (normalizedEffort === "none" || normalizedEffort === "disabled") return "low";
    if (normalizedEffort === "xhigh") {
        return supportsClaudeXHighEffort(model) ? "xhigh" : "high";
    }
    if (normalizedEffort === "max") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supportsClaudeMaxEffort"])(model) ? "max" : "high";
    }
    return supportsClaudeXHighEffort(model) ? "xhigh" : "high";
}
function resolveClaudeCodeCompatibleMaxTokens(sourceBody, normalizedBody) {
    const candidates = [
        sourceBody?.["max_tokens"],
        sourceBody?.["max_completion_tokens"],
        sourceBody?.["max_output_tokens"],
        normalizedBody?.["max_tokens"],
        normalizedBody?.["max_completion_tokens"],
        normalizedBody?.["max_output_tokens"]
    ];
    for (const candidate of candidates){
        const value = Number(candidate);
        if (Number.isFinite(value) && value > 0) {
            return Math.floor(value);
        }
    }
    return CLAUDE_CODE_COMPATIBLE_DEFAULT_MAX_TOKENS;
}
function buildClaudeCodeCompatibleMessages(messages) {
    const converted = messages.map((message)=>convertClaudeCodeCompatibleMessage(message)).filter((message)=>!!message && message.content.length > 0);
    const merged = [];
    for (const message of converted){
        const last = merged[merged.length - 1];
        if (last && last.role === message.role) {
            last.content.push(...message.content);
            continue;
        }
        merged.push({
            role: message.role,
            content: [
                ...message.content
            ]
        });
    }
    // CC-compatible sites we tested reject assistant-prefill shaped requests even
    // when Anthropic would normally allow them. Keep assistant/model history, but
    // drop trailing assistant turns so the upstream request ends on a user turn.
    while(merged.length > 0 && merged[merged.length - 1].role === "assistant"){
        merged.pop();
    }
    if (merged.length === 0) {
        const fallbackText = converted.flatMap((message)=>message.content).map((block)=>toNonEmptyString(block.text)).filter(Boolean).join("\n").trim();
        if (fallbackText) {
            return [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: fallbackText
                        }
                    ]
                }
            ];
        }
    }
    return merged;
}
function buildClaudeCodeCompatibleMessagesFromClaude(messages, preserveCacheControl) {
    const converted = Array.isArray(messages) ? messages.map((message)=>convertClaudeCodeCompatibleClaudeMessage(message, preserveCacheControl)).filter((message)=>!!message && message.content.length > 0) : [];
    const merged = [];
    let previousAssistantHadToolUse = false;
    for (const message of converted){
        const hasToolUse = message.content.some((block)=>block.type === "tool_use");
        const hasToolResult = message.content.some((block)=>block.type === "tool_result");
        const last = merged[merged.length - 1];
        const shouldKeepSeparate = hasToolUse || hasToolResult || previousAssistantHadToolUse || last?.content?.some((block)=>block.type === "tool_use") || last?.content?.some((block)=>block.type === "tool_result");
        if (last && last.role === message.role && !shouldKeepSeparate) {
            last.content.push(...message.content);
        } else {
            merged.push({
                role: message.role,
                content: [
                    ...message.content
                ]
            });
        }
        previousAssistantHadToolUse = message.role === "assistant" && hasToolUse;
    }
    while(merged.length > 0){
        const last = merged[merged.length - 1];
        const hasToolUse = last.content.some((block)=>block.type === "tool_use");
        if (last.role !== "assistant" || hasToolUse) {
            break;
        }
        merged.pop();
    }
    if (!preserveCacheControl) {
        for (const message of merged){
            stripCacheControlFromContentBlocks(message.content);
        }
    }
    if (merged.length === 0) {
        const fallbackText = converted.flatMap((message)=>message.content).map((block)=>contentToText(block)).filter(Boolean).join("\n").trim();
        if (fallbackText) {
            return [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: fallbackText
                        }
                    ]
                }
            ];
        }
    }
    return merged;
}
function cloneClaudeCodeCompatibleMessagesFromClaude(messages, preserveCacheControl) {
    const cloned = Array.isArray(messages) ? messages.map((message)=>cloneValue(message)).filter((message)=>{
        const role = String(message?.role || "").toLowerCase();
        return role !== "system" && role !== "developer";
    }) : [];
    if (!preserveCacheControl) {
        for (const message of cloned){
            if (Array.isArray(message.content)) {
                stripCacheControlFromContentBlocks(message.content);
            }
        }
    }
    return cloned;
}
function buildClaudeCodeCompatibleSystemBlocks({ messages, systemBlocks, preserveCacheControl }) {
    const customSystemBlocks = Array.isArray(systemBlocks) && systemBlocks.length > 0 ? systemBlocks.map((block)=>({
            ...block
        })) : extractCustomSystemBlocks(messages);
    const preparedCustomSystemBlocks = customSystemBlocks.map((systemBlock)=>{
        const preparedBlock = {
            ...systemBlock
        };
        if (!preserveCacheControl) {
            delete preparedBlock["cache_control"];
        }
        return preparedBlock;
    });
    const hasDefaultSystemBlock = containsDefaultSystemSkeleton(preparedCustomSystemBlocks);
    if (hasDefaultSystemBlock) return preparedCustomSystemBlocks;
    return [
        ...CLAUDE_CODE_COMPATIBLE_DEFAULT_SYSTEM_BLOCKS.map((block)=>({
                ...block
            })),
        ...preparedCustomSystemBlocks
    ];
}
function containsDefaultSystemSkeleton(blocks) {
    const skeleton = CLAUDE_CODE_COMPATIBLE_DEFAULT_SYSTEM_BLOCKS;
    if (skeleton.length === 0) return true;
    if (blocks.length < skeleton.length) return false;
    return blocks.some((_, startIndex)=>skeleton.every((defaultBlock, offset)=>{
            const candidateBlock = blocks[startIndex + offset];
            if (!candidateBlock) return false;
            return Object.entries(defaultBlock).every(([key, value])=>candidateBlock[key] === value);
        }));
}
function convertClaudeCodeCompatibleMessage(message) {
    const rawRole = String(message?.role || "").toLowerCase();
    const role = rawRole === "user" ? "user" : rawRole === "assistant" || rawRole === "model" ? "assistant" : null;
    if (!role) return null;
    const text = contentToText(message?.content);
    // #7777: keep the user-turn media parts that contentToText() above drops.
    const media = role === "user" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccOpenAiMediaBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectClaudeMediaBlocks"])(message?.content) : [];
    const content = [
        ...text ? [
            {
                type: "text",
                text
            }
        ] : [],
        ...media
    ];
    if (content.length === 0) return null;
    return {
        role,
        content
    };
}
function buildClaudeCodeCompatibleTools(normalizedBody, sourceBody) {
    const rawTools = Array.isArray(normalizedBody?.["tools"]) ? normalizedBody?.["tools"] : Array.isArray(sourceBody?.["tools"]) ? sourceBody?.["tools"] : [];
    return rawTools.map((tool)=>convertClaudeCodeCompatibleTool(tool)).filter((tool)=>!!tool).map((tool)=>({
            ...tool
        }));
}
function buildClaudeCodeCompatibleToolsFromClaude(tools, preserveCacheControl) {
    if (!Array.isArray(tools)) return [];
    return tools.map((tool)=>{
        const preparedTool = {
            ...tool
        };
        if (!preserveCacheControl) {
            delete preparedTool.cache_control;
        }
        return preparedTool;
    });
}
function convertClaudeCodeCompatibleTool(tool) {
    const rawTool = readRecord(tool);
    if (!rawTool) return null;
    const toolData = rawTool.type === "function" ? readRecord(rawTool.function) || rawTool : rawTool;
    const name = toNonEmptyString(toolData.name);
    if (!name) return null;
    const rawSchema = readRecord(toolData.parameters) || readRecord(toolData.input_schema) || {
        type: "object",
        properties: {},
        required: []
    };
    const inputSchema = rawSchema.type === "object" && !readRecord(rawSchema.properties) ? {
        ...rawSchema,
        properties: {}
    } : rawSchema;
    const converted = {
        name,
        description: toNonEmptyString(toolData.description) || "",
        input_schema: inputSchema
    };
    if (typeof toolData.defer_loading === "boolean") {
        converted.defer_loading = toolData.defer_loading;
    }
    return converted;
}
function buildClaudeCodeCompatibleToolChoice(choice) {
    if (!choice) return null;
    if (typeof choice === "string") {
        if (choice === "required") return {
            type: "any"
        };
        return null;
    }
    const rawChoice = readRecord(choice);
    if (!rawChoice) return null;
    if (rawChoice.type === "tool") {
        const name = toNonEmptyString(rawChoice.name);
        return name ? {
            type: "tool",
            name
        } : null;
    }
    if (rawChoice.type === "function") {
        const functionName = toNonEmptyString(readRecord(rawChoice.function)?.name) || toNonEmptyString(rawChoice.name);
        return functionName ? {
            type: "tool",
            name: functionName
        } : null;
    }
    if (rawChoice.type === "required" || rawChoice.type === "any") {
        return {
            type: "any"
        };
    }
    return null;
}
function prepareClaudeCodeCompatibleBody(claudeBody, preserveCacheControl) {
    void preserveCacheControl;
    const prepared = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["prepareClaudeRequest"])({
        system: normalizeClaudeSystemInput(claudeBody.system),
        messages: normalizeClaudeMessageInput(claudeBody.messages),
        tools: normalizeClaudeToolInput(claudeBody.tools),
        thinking: readRecord(claudeBody.thinking) || null
    }, CLAUDE_CODE_COMPATIBLE_PREFIX, true);
    return readRecord(prepared);
}
function prepareClaudeCodeCompatibleSemanticBody(claudeBody) {
    const rawMessages = Array.isArray(claudeBody.messages) ? claudeBody.messages : [];
    const systemBlocks = normalizeClaudeSystemInput(claudeBody.system);
    const systemFromMessages = extractCustomSystemBlocks(rawMessages);
    const mergedSystem = [
        ...systemBlocks,
        ...systemFromMessages
    ];
    const normalizedMessages = rawMessages.filter((message)=>{
        const role = String(message?.role || "").toLowerCase();
        return role !== "system" && role !== "developer";
    });
    const prepared = {
        system: mergedSystem,
        messages: normalizedMessages,
        tools: normalizeClaudeToolInput(claudeBody.tools),
        thinking: readRecord(cloneValue(claudeBody.thinking)) || null
    };
    const metadata = readRecord(cloneValue(claudeBody.metadata));
    if (metadata) prepared.metadata = metadata;
    const outputConfig = readRecord(cloneValue(claudeBody.output_config));
    if (outputConfig) prepared.output_config = outputConfig;
    return prepared;
}
function extractClaudeBodyFromSource(sourceBody, preserveCacheControl) {
    const rawMessages = Array.isArray(sourceBody.messages) ? sourceBody.messages : [];
    const hasSystemRoleMessages = rawMessages.some((message)=>{
        const role = String(message?.role || "").toLowerCase();
        return role === "system" || role === "developer";
    });
    const hasClaudeSystem = typeof sourceBody.system === "string" || Array.isArray(sourceBody.system) && sourceBody.system.length > 0;
    if (!hasClaudeSystem && !hasSystemRoleMessages) {
        return null;
    }
    const normalizedMessages = rawMessages.filter((message)=>{
        const role = String(message?.role || "").toLowerCase();
        return role !== "system" && role !== "developer";
    });
    return prepareClaudeCodeCompatibleBody({
        ...sourceBody,
        ...hasClaudeSystem ? {} : {
            system: extractCustomSystemBlocks(rawMessages)
        },
        messages: normalizedMessages
    }, preserveCacheControl);
}
function normalizeClaudeSystemInput(system) {
    if (typeof system === "string") {
        const text = system.trim();
        return text ? [
            {
                type: "text",
                text
            }
        ] : [];
    }
    if (!Array.isArray(system)) return [];
    return system.map((block)=>normalizeClaudeContentBlock(block)).filter((block)=>!!block);
}
function normalizeClaudeMessageInput(messages) {
    if (!Array.isArray(messages)) return [];
    return messages.map((message)=>{
        const record = readRecord(message);
        if (!record) return null;
        return {
            ...record,
            content: normalizeClaudeContentInput(record.content)
        };
    }).filter((message)=>!!message);
}
function normalizeClaudeToolInput(tools) {
    if (!Array.isArray(tools)) return [];
    return tools.map((tool)=>readRecord(cloneValue(tool))).filter((tool)=>!!tool);
}
function normalizeClaudeContentInput(content) {
    const blocks = normalizeClaudeContentBlocks(content);
    return blocks.length > 0 ? blocks : content;
}
function normalizeClaudeContentBlocks(content) {
    if (typeof content === "string") {
        const text = content.trim();
        return text ? [
            {
                type: "text",
                text
            }
        ] : [];
    }
    if (!Array.isArray(content)) {
        const block = normalizeClaudeContentBlock(content);
        return block ? [
            block
        ] : [];
    }
    return content.map((block)=>normalizeClaudeContentBlock(block)).filter((block)=>!!block);
}
function normalizeClaudeContentBlock(block) {
    const record = readRecord(cloneValue(block));
    if (!record) return null;
    if (record.type === "text" || typeof record.type !== "string" && typeof record.text === "string") {
        const text = toNonEmptyString(record.text);
        if (!text) return null;
        return {
            ...record,
            type: "text",
            text
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccOpenAiMediaBlocks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertOpenAiMediaBlock"])(record) ?? record;
}
function convertClaudeCodeCompatibleClaudeMessage(message, preserveCacheControl) {
    const rawRole = String(message?.role || "").toLowerCase();
    const role = rawRole === "user" ? "user" : rawRole === "assistant" ? "assistant" : null;
    if (!role) return null;
    const content = normalizeClaudeContentBlocks(message?.content).map((block)=>{
        if (preserveCacheControl) return block;
        const { cache_control, ...rest } = block;
        return rest;
    });
    if (content.length === 0) return null;
    return {
        role,
        content
    };
}
function extractCustomSystemBlocks(messages) {
    if (!Array.isArray(messages)) return [];
    return messages.filter((message)=>{
        const role = String(message?.role || "").toLowerCase();
        return role === "system" || role === "developer";
    }).map((message)=>contentToText(message?.content)).filter(Boolean).map((text)=>({
            type: "text",
            text
        }));
}
function stripCacheControlFromContentBlocks(content) {
    for (const block of content){
        delete block.cache_control;
    }
}
function resolveClaudeCodeCompatibleMetadata({ claudeBody, sourceBody, normalizedBody, cwd, sessionId }) {
    const metadata = readRecord(cloneValue(claudeBody?.metadata)) || readRecord(cloneValue(sourceBody?.metadata)) || readRecord(cloneValue(normalizedBody?.metadata)) || {};
    if (!toNonEmptyString(metadata.user_id)) {
        metadata.user_id = JSON.stringify({
            device_id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(String(cwd || "")).digest("hex"),
            account_uuid: "",
            session_id: sessionId
        });
    }
    return metadata;
}
function resolveClaudeCodeCompatibleThinking({ claudeBody, sourceBody, normalizedBody, summarizeThinking = false }) {
    const thinking = readRecord(cloneValue(claudeBody?.thinking)) || readRecord(cloneValue(sourceBody?.thinking)) || readRecord(cloneValue(normalizedBody?.thinking));
    if (thinking) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleThinkingDisplay$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyClaudeCodeCompatibleThinkingDisplay"])(thinking, {
            normalizedBody,
            summarizeThinking
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleThinkingDisplay$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyClaudeCodeCompatibleThinkingDisplay"])({
        type: "adaptive"
    }, {
        normalizedBody,
        summarizeThinking
    });
}
function resolveClaudeCodeCompatibleOutputConfig({ claudeBody, sourceBody, normalizedBody, model, effort }) {
    const outputConfig = readRecord(cloneValue(claudeBody?.output_config)) || readRecord(cloneValue(sourceBody?.output_config)) || readRecord(cloneValue(normalizedBody?.output_config)) || {};
    return {
        ...outputConfig,
        effort: resolveClaudeCodeCompatibleEffort(sourceBody, normalizedBody, model) || effort
    };
}
function cloneValue(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
function contentToText(content) {
    if (typeof content === "string") {
        return content.trim();
    }
    if (Array.isArray(content)) {
        return content.map((part)=>{
            if (!part || typeof part !== "object") return "";
            const record = part;
            if (record.type === "text" && typeof record.text === "string") {
                return record.text.trim();
            }
            if (typeof record.text === "string") {
                return record.text.trim();
            }
            return "";
        }).filter(Boolean).join("\n").trim();
    }
    if (content && typeof content === "object") {
        const record = content;
        if (typeof record.text === "string") return record.text.trim();
    }
    return "";
}
function getHeader(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === "function") {
        return headers.get(name);
    }
    const record = headers;
    const target = name.toLowerCase();
    for (const [key, value] of Object.entries(record)){
        if (key.toLowerCase() === target) {
            return value ?? null;
        }
    }
    return null;
}
function toNonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function readRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function readNestedString(source, path) {
    let current = source;
    for (const key of path){
        if (!current || typeof current !== "object" || Array.isArray(current)) {
            return null;
        }
        if (key === "__proto__" || key === "constructor" || key === "prototype") return null;
        if (!Object.prototype.hasOwnProperty.call(current, key)) return null;
        current = Reflect.get(current, key);
    }
    return toNonEmptyString(current);
}
}),
"[project]/package.json.[json].mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
"use turbopack no side effects";
const __TURBOPACK__default__export__ = JSON.parse("{\"name\":\"omniroute\",\"version\":\"3.8.50\",\"description\":\"Unified AI router with 290 providers, RTK+Caveman compression, auto fallback, MCP/A2A, desktop, PWA, and OpenAI-compatible APIs.\",\"type\":\"module\",\"bin\":{\"omniroute\":\"bin/omniroute.mjs\",\"omniroute-reset-password\":\"bin/reset-password.mjs\"},\"files\":[\"bin/\",\"dist/\",\"@omniroute/\",\"open-sse/\",\"src/domain/\",\"src/lib/\",\"src/models/\",\"src/mitm/\",\"src/server/\",\"src/shared/\",\"src/sse/\",\"src/types/\",\".env.example\",\"scripts/build/postinstall.mjs\",\"scripts/build/fixTlsClientNodeBinary.mjs\",\"scripts/build/fixPlaywrightAndroid.mjs\",\"bin/cli/runtime/\",\"scripts/postinstall.mjs\",\"scripts/build/postinstallSupport.mjs\",\"scripts/build/runtime-env.mjs\",\"scripts/build/colocateOptionals.mjs\",\"scripts/build/sync-env.mjs\",\"scripts/dev/responses-ws-proxy.mjs\",\"scripts/dev/tls-options.mjs\",\"scripts/check/check-supported-node-runtime.ts\",\"scripts/dev/sync-env.mjs\",\"scripts/build/native-binary-compat.mjs\",\"scripts/build/build-next-isolated.mjs\",\"scripts/build/runtime-env.mjs\",\"README.md\",\"LICENSE\",\"!**/node_modules/**\",\"!**/__tests__/**\",\"!**/*.test.ts\",\"!**/*.test.tsx\",\"!**/*.test.js\",\"!**/*.test.mjs\",\"!**/*.spec.ts\",\"!**/*.spec.tsx\"],\"workspaces\":[\"open-sse\"],\"engines\":{\"node\":\">=22.22.2 <23 || >=24.0.0 <27\"},\"keywords\":[\"ai\",\"router\",\"proxy\",\"openai\",\"claude\",\"anthropic\",\"gemini\",\"fallback\",\"cursor\",\"cline\",\"codex\",\"llm\",\"auto-fallback\"],\"license\":\"MIT\",\"author\":\"diegosouzapw\",\"repository\":{\"type\":\"git\",\"url\":\"https://github.com/diegosouzapw/OmniRoute\"},\"homepage\":\"https://omniroute.online\",\"scripts\":{\"dev\":\"node --max-old-space-size=8192 scripts/dev/run-next.mjs dev\",\"prebuild:docs\":\"node scripts/docs/gen-openapi-module.mjs\",\"gen:provider-reference\":\"bun scripts/docs/gen-provider-reference.ts\",\"bench:compression\":\"bun scripts/compression/benchmark.ts\",\"bench:heap-body\":\"node --expose-gc --import tsx/esm scripts/perf/request-body-heap.ts\",\"eval:compression\":\"node --import tsx scripts/compression-eval/index.ts\",\"eval:router\":\"node --import tsx scripts/router-eval/index.ts\",\"eval:router:compare\":\"node --import tsx scripts/router-eval/compare.ts\",\"eval:router:patch-compare\":\"node --import tsx scripts/router-eval/patch-compare.ts\",\"eval:router:search\":\"node --import tsx scripts/router-eval/search.ts\",\"eval:router:trends\":\"node --import tsx scripts/router-eval/trends.ts\",\"release:sync-changelog-i18n\":\"node scripts/release/sync-changelog-i18n.mjs\",\"build\":\"node scripts/build/build-next-isolated.mjs\",\"build:secure\":\"OMNIROUTE_BUILD_PROFILE=minimal node scripts/build/build-next-isolated.mjs\",\"build:backend\":\"cross-env OMNIROUTE_BUILD_BACKEND_ONLY=1 node scripts/build/build-next-isolated.mjs\",\"build:cli\":\"node --import tsx scripts/build/prepublish.ts\",\"build:release\":\"rm -rf .build dist && OMNIROUTE_BUILD_SHA=$(git rev-parse --short HEAD) npm run build && npm run build:cli && node scripts/build/write-build-sha.mjs\",\"build:native:tproxy\":\"cd src/mitm/tproxy/native && npx --yes node-gyp rebuild\",\"start\":\"node scripts/dev/run-next.mjs start\",\"homolog\":\"node scripts/homolog/run.mjs\",\"lint\":\"eslint . --cache --cache-location .eslintcache --suppressions-location config/quality/eslint-suppressions.json\",\"lint:json\":\"node scripts/quality/run-eslint-json.mjs\",\"lint:md\":\"npx --yes markdownlint-cli2 \\\"docs/**/*.md\\\" \\\"*.md\\\" \\\"!docs/i18n\\\" \\\"!docs/research\\\"\",\"lint:prose\":\"vale docs\",\"electron:dev\":\"concurrently \\\"npm run dev\\\" \\\"wait-on http://localhost:20128 && cd electron && npm run dev\\\"\",\"electron:build\":\"npm run build && cd electron && npm run build\",\"electron:build:win\":\"npm run build && cd electron && npm run build:win\",\"electron:build:mac\":\"npm run build && cd electron && npm run build:mac\",\"electron:build:linux\":\"npm run build && cd electron && npm run build:linux\",\"electron:smoke:packaged\":\"node scripts/dev/smoke-electron-packaged.mjs\",\"test\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-concurrency=20 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-concurrency=20 \\\"tests/unit/dashboard/**/*.test.ts\\\"\",\"test:unit\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=20 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=20 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:ci\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:ci:shard\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 --test-shard=$TEST_SHARD tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=4 --test-shard=$TEST_SHARD \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=$TEST_SHARD \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:unit:fast\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-isolation=none tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-isolation=none \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:scoped\":\"bash scripts/quality/test-scoped.sh\",\"test:scoped:staged\":\"bash scripts/quality/test-scoped.sh --staged\",\"test:unit:shard\":\"concurrently --kill-others-on-fail -n s1,s2 \\\"npm:test:unit:shard:1\\\" \\\"npm:test:unit:shard:2\\\"\",\"test:unit:shard:1\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=1/2 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=1/2 \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=1/2 \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:unit:shard:2\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=2/2 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=10 --test-shard=2/2 \\\"tests/unit/dashboard/**/*.test.ts\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=2/2 \\\"tests/unit/serial/**/*.test.ts\\\"\",\"test:bun:db\":\"bun test tests/unit/db-adapters/bunSqliteAdapter.test.ts tests/unit/db-adapters/driverFactory.test.ts tests/unit/db-adapters/cliSqlite.test.mjs\",\"test:plan3\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/plan3-p0.test.ts\",\"test:fixes\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/fixes-p1.test.ts\",\"test:security\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test tests/unit/security-fase01.test.ts\",\"test:property\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --test --test-force-exit tests/unit/correctness/*.property.test.ts\",\"check:cycles\":\"node scripts/check/check-cycles.mjs\",\"check:route-validation:t06\":\"node scripts/check/check-route-validation.mjs\",\"check:any-budget:t11\":\"node scripts/check/check-t11-any-budget.mjs\",\"check:docs-sync\":\"node scripts/check/check-docs-sync.mjs\",\"check:env-doc-sync\":\"node scripts/check/check-env-doc-sync.mjs\",\"check:docs-counts\":\"node scripts/check/check-docs-counts-sync.mjs\",\"check:deprecated-versions\":\"node scripts/check/check-deprecated-versions.mjs\",\"check:compression-budget\":\"bun scripts/check/check-compression-budget.ts\",\"check:router-eval\":\"node --import tsx scripts/check/check-router-eval-regression.ts\",\"check:doc-links\":\"node scripts/check/check-doc-links.mjs\",\"check:fabricated-docs\":\"node scripts/check/check-fabricated-docs.mjs --strict\",\"check:docs-all\":\"npm run check:docs-sync && npm run check:docs-counts && npm run check:env-doc-sync && npm run check:deprecated-versions && npm run check:doc-links && npm run check:fabricated-docs\",\"docs:render-diagrams\":\"node scripts/docs/render-diagrams.mjs\",\"i18n:run\":\"node scripts/i18n/run-translation.mjs\",\"i18n:run:dry\":\"node scripts/i18n/run-translation.mjs --dry-run\",\"i18n:check\":\"node scripts/i18n/check-translation-drift.mjs\",\"i18n:sync-ui\":\"node scripts/i18n/sync-ui-keys.mjs\",\"i18n:sync-ui:dry\":\"node scripts/i18n/sync-ui-keys.mjs --dry-run\",\"i18n:check-ui-coverage\":\"node scripts/i18n/check-ui-keys-coverage.mjs\",\"i18n:check-value-drift\":\"node scripts/i18n/check-ui-value-drift.mjs\",\"i18n:check-value-drift:warn\":\"node scripts/i18n/check-ui-value-drift.mjs --warn\",\"i18n:check-glossary\":\"node scripts/i18n/check-glossary-consistency.mjs\",\"check:node-runtime\":\"node --import tsx scripts/check/check-supported-node-runtime.ts\",\"check:pack-artifact\":\"node --import tsx scripts/build/validate-pack-artifact.ts\",\"check:pack-boot\":\"node scripts/check/check-pack-boot.mjs\",\"check:install-upgrade\":\"node scripts/check/check-install-upgrade.mjs\",\"check:pack-policy\":\"node --import tsx scripts/build/validate-pack-artifact.ts --policy-only\",\"check:cli-i18n\":\"node scripts/check/check-cli-i18n.mjs\",\"check:openapi-coverage\":\"node scripts/check/check-openapi-coverage.mjs\",\"check:openapi-security-tiers\":\"node scripts/check/check-openapi-security-tiers.mjs\",\"check:provider-consistency\":\"bun scripts/check/check-provider-consistency.ts\",\"check:provider-assets\":\"node scripts/check/check-provider-assets.mjs\",\"check:nvidia-catalog-drift\":\"node --import tsx/esm scripts/check/check-nvidia-catalog-drift.ts\",\"check:fetch-targets\":\"node scripts/check/check-fetch-targets.mjs\",\"check:openapi-routes\":\"node scripts/check/check-openapi-routes.mjs\",\"check:api-docs-refs\":\"node scripts/check/check-api-docs-refs.mjs\",\"check:openapi-breaking\":\"node scripts/check/check-openapi-breaking.mjs\",\"check:deps\":\"node scripts/check/check-deps.mjs\",\"check:file-size\":\"node scripts/check/check-file-size.mjs\",\"check:duplication\":\"node scripts/check/check-duplication.mjs\",\"check:tracked-artifacts\":\"node scripts/check/check-tracked-artifacts.mjs\",\"check:test-masking\":\"node scripts/check/check-test-masking.mjs\",\"check:test-runner-api\":\"node scripts/check/check-test-runner-api.mjs\",\"check:changelog-integrity\":\"node scripts/check/check-changelog-integrity.mjs\",\"sweep:stale-fragments\":\"node scripts/release/sweep-stale-fragments.mjs\",\"changelog:aggregate\":\"node scripts/release/aggregate-changelog.mjs\",\"check:agent-skills-sync\":\"node --import tsx/esm scripts/skills/generate-agent-skills.mjs\",\"check:build-scope\":\"node scripts/check/check-build-scope.mjs\",\"check:error-helper\":\"node scripts/check/check-error-helper.mjs\",\"check:migration-numbering\":\"node scripts/check/check-migration-numbering.mjs\",\"check:public-creds\":\"node scripts/check/check-public-creds.mjs\",\"check:db-rules\":\"node scripts/check/check-db-rules.mjs\",\"check:docs-symbols\":\"node scripts/check/check-docs-symbols.mjs\",\"check:known-symbols\":\"bun scripts/check/check-known-symbols.ts\",\"check:route-guard-membership\":\"node --import tsx scripts/check/check-route-guard-membership.ts\",\"check:test-discovery\":\"node scripts/check/check-test-discovery.mjs\",\"check:mutation-test-coverage\":\"node scripts/check/check-mutation-test-coverage.mjs --strict\",\"check:complexity\":\"node scripts/check/check-complexity.mjs\",\"check:dead-code\":\"node scripts/check/check-dead-code.mjs\",\"check:cognitive-complexity\":\"node scripts/check/check-cognitive-complexity.mjs\",\"check:complexity-ratchets\":\"node scripts/check/check-complexity-ratchets.mjs\",\"check:release-green\":\"node scripts/quality/validate-release-green.mjs\",\"check:ratchet-bank\":\"node scripts/quality/verify-ratchet-bank.mjs\",\"check:type-coverage\":\"node scripts/check/check-type-coverage.mjs\",\"check:lockfile\":\"node scripts/check/check-lockfile.mjs\",\"check:bundle-size\":\"node scripts/check/check-bundle-size.mjs\",\"check:circular-deps\":\"node scripts/check/check-circular-deps.mjs\",\"check:mutation-ratchet\":\"node scripts/check/check-mutation-ratchet.mjs\",\"check:rtl-ratchet\":\"node scripts/check/check-rtl-ratchet.mjs\",\"check:licenses\":\"node scripts/check/check-licenses.mjs\",\"check:pr-evidence\":\"node scripts/check/check-pr-evidence.mjs\",\"check:vuln-ratchet\":\"node scripts/check/check-vuln-ratchet.mjs\",\"check:codeql-ratchet\":\"node scripts/check/check-codeql-ratchet.mjs\",\"check:secrets\":\"node scripts/check/check-secrets.mjs\",\"check:workflows\":\"node scripts/check/check-workflows.mjs\",\"quality:collect\":\"node scripts/quality/collect-metrics.mjs\",\"quality:ratchet\":\"node scripts/quality/check-quality-ratchet.mjs\",\"quality:gate\":\"npm run quality:collect && npm run quality:ratchet -- --allow-missing\",\"quality:scan\":\"node scripts/quality/run-all-gates.mjs\",\"quality:scan:fast\":\"node scripts/quality/run-all-gates.mjs --fast\",\"audit:deps\":\"npm audit --audit-level=critical && (npm audit --audit-level=high || echo '::warning::high-severity advisories present (non-blocking)') && npm run audit:electron\",\"audit:electron\":\"npm --prefix electron audit --audit-level=critical && (npm --prefix electron audit --audit-level=high || echo '::warning::electron high-severity advisories present (non-blocking)')\",\"typecheck:core\":\"tsc --pretty false -p tsconfig.typecheck-core.json\",\"typecheck:noimplicit:core\":\"tsc --pretty false -p tsconfig.typecheck-noimplicit-core.json\",\"check:dashboard-typecheck\":\"node scripts/check/check-dashboard-typecheck.mjs\",\"backfill-aggregation\":\"node --import tsx src/scripts/backfillAggregation.ts\",\"env:sync\":\"node scripts/dev/sync-env.mjs\",\"test:integration\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/integration/*.test.ts \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:integration:ci\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 --test-shard=$TEST_SHARD tests/integration/*.test.ts \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:combo:matrix\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/integration/combo-matrix/*.test.ts\\\"\",\"test:combo:live\":\"cross-env RUN_COMBO_LIVE=1 DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/integration/combo-live/*.live.test.ts\\\"\",\"test:combo:live:vps\":\"node scripts/test/combo-live-vps.mjs\",\"test:combo:live:vps:failover\":\"node scripts/test/combo-live-vps.mjs --failover\",\"test:boundary:live\":\"cross-env RUN_BOUNDARY_LIVE=1 DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/boundary/*.live.test.ts\\\"\",\"test:heap\":\"node --expose-gc --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit tests/integration/heap-growth.test.ts\",\"test:chaos\":\"cross-env RUN_CHAOS_INT=1 node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/integration/resilience-chaos.test.ts\",\"test:e2e\":\"node scripts/dev/run-playwright-tests.mjs test tests/e2e/*.spec.ts\",\"test:protocols:e2e\":\"node scripts/dev/run-protocol-clients-tests.mjs\",\"test:vitest\":\"vitest run --config vitest.mcp.config.ts\",\"test:vitest:ui\":\"vitest run --config vitest.config.ts tests/unit/ui\",\"test:mutation\":\"stryker run\",\"test:ecosystem\":\"node scripts/dev/run-ecosystem-tests.mjs\",\"test:system\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 tests/e2e/system-failover.test.ts\",\"test:coverage\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true NODE_OPTIONS=--max-old-space-size=8192 c8 --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov --check-coverage --statements 60 --lines 60 --functions 60 --branches 60 npm run test:coverage:runner\",\"test:coverage:legacy\":\"c8 --output-dir coverage --exclude=open-sse --check-coverage --lines 50 --functions 50 --branches 50 node --import tsx/esm --test tests/unit/*.test.ts\",\"coverage:report\":\"cross-env NODE_OPTIONS=--max-old-space-size=8192 c8 report --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov\",\"coverage:summary\":\"node scripts/check/test-report-summary.mjs --input coverage/coverage-summary.json --output coverage/coverage-report.md\",\"check:pr-test-policy\":\"node scripts/check/check-pr-test-policy.mjs\",\"coverage:report:legacy\":\"c8 report --output-dir coverage --exclude=open-sse --reporter=text --reporter=text-summary\",\"test:all\":\"npm run test:unit && npm run test:vitest && npm run test:vitest:ui && npm run test:ecosystem && npm run test:e2e\",\"check\":\"npm run lint && npm run test\",\"prepublishOnly\":\"npm run build:cli-api && npm run build:cli && npm run check:pack-artifact\",\"postinstall\":\"node scripts/build/postinstall.mjs\",\"uninstall\":\"node scripts/build/uninstall.mjs\",\"uninstall:full\":\"node scripts/build/uninstall.mjs --full\",\"prepare\":\"husky\",\"system-info\":\"node scripts/dev/system-info.mjs\",\"build:cli-api\":\"node --import tsx/esm scripts/cli/generate-api-commands.mjs\",\"release:contributors\":\"node scripts/release/gen-contributors.mjs\",\"release:uncovered\":\"node scripts/release/list-uncovered-commits.mjs\",\"test:coverage:runner\":\"node --max-old-space-size=8192 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=8 tests/unit/*.test.ts \\\"tests/unit/{api,auth,authz,build,cli,cli-helper,combo,compression,correctness,cors,db,db-adapters,docs,gamification,guardrails,lib,mcp,memory,runtime,security,services,settings,shared,ui,usage}/**/*.test.ts\\\" \\\"tests/unit/**/*.test.mjs\\\" && cross-env DISABLE_SQLITE_AUTO_BACKUP=true NODE_OPTIONS=--max-old-space-size=8192 c8 --merge-async --output-dir coverage --exclude=tests/** --exclude=**/*.test.* --reporter=text-summary --reporter=html --reporter=json-summary --reporter=lcov --check-coverage --statements 60 --lines 60 --functions 60 --branches 60 node --max-old-space-size=8192 --import tsx --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=8 \\\"tests/unit/dashboard/**/*.test.ts\\\" && npm run test:unit:serial\",\"test:unit:serial\":\"cross-env DISABLE_SQLITE_AUTO_BACKUP=true node --max-old-space-size=4096 --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --import ./tests/_setup/isolateDataDir.ts --test --test-force-exit --test-concurrency=1 \\\"tests/unit/serial/**/*.test.ts\\\"\"},\"dependencies\":{\"@aws-sdk/client-bedrock-runtime\":\"^3.1073.0\",\"@dnd-kit/core\":\"^6.3.1\",\"@dnd-kit/sortable\":\"^10.0.0\",\"@dnd-kit/utilities\":\"^3.2.2\",\"@lobehub/icons\":\"^5.8.0\",\"@modelcontextprotocol/sdk\":\"^1.29.0\",\"@monaco-editor/react\":\"^4.7.0\",\"@ngrok/ngrok\":\"^1.7.0\",\"@swc/helpers\":\"0.5.23\",\"@toon-format/toon\":\"^4.1.0\",\"@types/mdx\":\"^2.0.13\",\"@xyflow/react\":\"^12.11.1\",\"axios\":\"^1.16.1\",\"bcryptjs\":\"^3.0.3\",\"bottleneck\":\"^2.19.5\",\"clsx\":\"^2.1.1\",\"commander\":\"^15.0.0\",\"csv-stringify\":\"^6.7.0\",\"dompurify\":\"^3.4.12\",\"express\":\"^5.2.1\",\"fetch-socks\":\"^1.3.3\",\"fflate\":\"^0.8.3\",\"fumadocs-core\":\"^16.10.5\",\"fumadocs-ui\":\"^16.10.5\",\"http-proxy-middleware\":\"^4.0.0\",\"https-proxy-agent\":\"^9.0.0\",\"ink\":\"^7.0.3\",\"ink-spinner\":\"^5.0.0\",\"ink-text-input\":\"^6.0.0\",\"ioredis\":\"^5.10.1\",\"jose\":\"^6.2.3\",\"js-yaml\":\"^5.2.2\",\"jsonc-parser\":\"^3.3.1\",\"lowdb\":\"^7.0.1\",\"lucide-react\":\"^1.21.0\",\"marked\":\"^18.0.4\",\"marked-terminal\":\"^7.3.0\",\"material-symbols\":\"^0.45.2\",\"mermaid\":\"^11.15.0\",\"monaco-editor\":\"^0.56.0\",\"next\":\"^16.2.11\",\"next-intl\":\"^4.12.0\",\"next-themes\":\"^0.4.6\",\"node-machine-id\":\"^1.1.12\",\"omniglyph\":\"^1.0.2\",\"open\":\"^11.0.0\",\"ora\":\"^9.4.1\",\"parse5\":\"^8.0.1\",\"pino\":\"^10.3.1\",\"pino-abstract-transport\":\"^3.0.0\",\"pino-pretty\":\"^13.1.3\",\"playwright\":\"1.62.0\",\"react\":\"19.2.8\",\"react-dom\":\"19.2.8\",\"react-is\":\"^19.2.6\",\"react-markdown\":\"^10.1.0\",\"react-reconciler\":\"^0.33.0\",\"recharts\":\"^3.8.1\",\"safe-regex\":\"^2.1.1\",\"selfsigned\":\"^5.5.0\",\"smol-toml\":\"1.7.1\",\"socks\":\"^2.8.7\",\"sql.js\":\"^1.14.1\",\"sqlite-vec\":\"^0.1.9\",\"tailwind-merge\":\"^3.6.0\",\"tsx\":\"^4.23.0\",\"undici\":\"^8.3.0\",\"update-notifier\":\"^7.3.1\",\"uuid\":\"^14.0.0\",\"ws\":\"^8.18.0\",\"xxhash-wasm\":\"^1.1.0\",\"yazl\":\"^3.3.1\",\"zod\":\"^4.4.3\",\"zustand\":\"^5.0.13\"},\"optionalDependencies\":{\"@atjsh/llmlingua-2\":\"2.0.3\",\"@huggingface/transformers\":\"3.5.2\",\"@tensorflow/tfjs\":\"4.22.0\",\"better-sqlite3\":\"^13.0.2\",\"js-tiktoken\":\"^1.0.20\",\"keytar\":\"^7.9.0\",\"tls-client-node\":\"^0.2.0\",\"wreq-js\":\"^2.3.1\"},\"devDependencies\":{\"@axe-core/playwright\":\"^4.11.3\",\"@cyclonedx/cyclonedx-npm\":\"6.0.0\",\"@playwright/test\":\"^1.60.0\",\"@size-limit/file\":\"^12.1.0\",\"@stryker-mutator/core\":\"^9.6.1\",\"@stryker-mutator/tap-runner\":\"^9.6.1\",\"@tailwindcss/postcss\":\"^4.3.0\",\"@testing-library/jest-dom\":\"^6.9.1\",\"@testing-library/react\":\"^16.3.2\",\"@types/better-sqlite3\":\"^7.6.13\",\"@types/bun\":\"latest\",\"@types/node\":\"^26.1.0\",\"@types/react\":\"^19.2.15\",\"@types/react-dom\":\"^19.2.3\",\"@types/safe-regex\":\"^1.1.6\",\"@types/ws\":\"^8.18.0\",\"@vitejs/plugin-react\":\"^6.0.2\",\"bun\":\"1.3.14\",\"c8\":\"^12.0.0\",\"concurrently\":\"^10.0.3\",\"cross-env\":\"^10.1.0\",\"ctrf\":\"^0.2.1\",\"dpdm\":\"^4.2.0\",\"eslint\":\"^9.39.4\",\"eslint-config-next\":\"16.2.10\",\"eslint-plugin-sonarjs\":\"^4.1.0\",\"fast-check\":\"^4.8.0\",\"fumadocs-mdx\":\"^15.0.7\",\"glob\":\"^13.0.6\",\"httpyac\":\"^6.16.7\",\"husky\":\"^9.1.7\",\"jscpd\":\"^4.2.5\",\"jsdom\":\"^29.1.1\",\"junit-to-ctrf\":\"^0.0.14\",\"knip\":\"^6.18.0\",\"license-checker-rseidelsohn\":\"^5.0.1\",\"lint-staged\":\"^17.0.8\",\"lockfile-lint\":\"^5.0.0\",\"node-loader\":\"^2.1.0\",\"playwright-ctrf-json-reporter\":\"^0.0.29\",\"prettier\":\"^3.8.3\",\"promptfoo\":\"^0.121.18\",\"size-limit\":\"^12.1.0\",\"tailwindcss\":\"^4.3.0\",\"type-coverage\":\"^2.29.7\",\"typescript\":\"^6.0.3\",\"typescript-eslint\":\"^8.59.4\",\"vitest\":\"^4.1.7\",\"wait-on\":\"^9.0.10\",\"wtfnode\":\"^0.10.1\"},\"lint-staged\":{\"*.{js,jsx,ts,tsx,mjs}\":[\"prettier --write\",\"eslint --fix --no-error-on-unmatched-pattern --no-warn-ignored --suppressions-location config/quality/eslint-suppressions.json\"],\"*.{json,md,yml,yaml,css}\":[\"prettier --write\"]},\"pnpm\":{\"onlyBuiltDependencies\":[\"@parcel/watcher\",\"@swc/core\",\"better-sqlite3\",\"esbuild\",\"omniroute\",\"sharp\"]},\"allowScripts\":{\"better-sqlite3\":true,\"esbuild\":true,\"@swc/core\":true,\"@parcel/watcher\":true,\"keytar\":true,\"protobufjs\":true,\"unrs-resolver\":true},\"overrides\":{\"dompurify\":\"^3.4.12\",\"fast-xml-parser\":\"^5.10.1\",\"sharp\":\"^0.35.0\",\"postcss\":\"^8.5.18\",\"ip-address\":\"^10.3.1\",\"qs\":\"^6.15.2\",\"uuid\":\"^14.0.0\",\"form-data\":\"^4.0.6\",\"vite\":\"^8.0.16\",\"protobufjs\":\"^7.6.5\",\"@babel/core\":\"^7.29.6\",\"hono\":\"^4.12.34\",\"@hono/node-server\":\"^2.0.5\",\"fast-uri\":\"^3.1.5\",\"body-parser\":\"^2.3.0\",\"@yarnpkg/parsers\":{\"js-yaml\":\"^4.2.0\"},\"jsdom\":{\"undici\":\"^7.29.0\"},\"node-gyp\":{\"undici\":\"^6.28.0\"},\"concurrently\":{\"shell-quote\":\"^1.9.0\"},\"adm-zip\":\"^0.6.0\",\"promptfoo\":{\"js-yaml\":\"^5.2.2\",\"@apidevtools/json-schema-ref-parser\":{\"js-yaml\":\"^4.2.0\"},\"undici\":\"^7.29.0\"},\"socket.io-parser\":\"^4.2.7\",\"tar\":\"^7.5.21\"}}");
}),
"[project]/src/shared/constants/appConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_CONFIG",
    ()=>APP_CONFIG,
    "THEME_CONFIG",
    ()=>THEME_CONFIG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/package.json.[json].mjs [app-route] (ecmascript)");
;
const APP_CONFIG = {
    name: "OmniRoute",
    description: "AI Gateway for Multi-Provider LLMs",
    version: __TURBOPACK__imported__module__$5b$project$5d2f$package$2e$json$2e5b$json$5d2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].version
};
const THEME_CONFIG = {
    storageKey: "theme",
    defaultTheme: "system"
};
}),
"[project]/src/shared/utils/clineAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyClineAuthHeaders",
    ()=>applyClineAuthHeaders,
    "applyClineProtocolHeaders",
    ()=>applyClineProtocolHeaders,
    "buildClineHeaders",
    ()=>buildClineHeaders,
    "buildClinepassHeaders",
    ()=>buildClinepassHeaders,
    "getClineAccessToken",
    ()=>getClineAccessToken,
    "getClineAuthorizationHeader",
    ()=>getClineAuthorizationHeader,
    "resolveClineTaskId",
    ()=>resolveClineTaskId
]);
/**
 * Cline (cline.bot) auth-shape helpers.
 *
 * Cline's API expects the bearer token to be prefixed with `workos:` (the
 * upstream auth provider), and a set of Cline client-identification headers
 * (HTTP-Referer / X-Title / X-CLIENT-* / X-PLATFORM*). Plain `Bearer <token>`
 * without the `workos:` prefix is rejected upstream, so every Cline request
 * must route its headers through `buildClineHeaders()`.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [app-route] (ecmascript)");
;
;
const APP_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APP_CONFIG"].version;
function cleanHeaderValue(value) {
    if (typeof value !== "string") return undefined;
    const cleaned = value.trim();
    if (!cleaned || cleaned.length > 256 || /[\r\n\0]/.test(cleaned)) return undefined;
    return cleaned;
}
function getHeaderCaseInsensitive(headers, name) {
    const key = Object.keys(headers ?? {}).find((candidate)=>candidate.toLowerCase() === name);
    return key ? cleanHeaderValue(headers?.[key]) : undefined;
}
function resolveClineTaskId(clientHeaders) {
    return getHeaderCaseInsensitive(clientHeaders, "x-task-id") ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
}
function applyClineProtocolHeaders(headers, context = {}) {
    const taskId = cleanHeaderValue(context.taskId) ?? getHeaderCaseInsensitive(headers, "x-task-id") ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const clientVersion = cleanHeaderValue(context.clientVersion) ?? APP_VERSION;
    const required = {
        "HTTP-Referer": "https://cline.bot",
        "X-Title": "Cline",
        "User-Agent": `Cline/${clientVersion}`,
        "X-IS-MULTIROOT": context.isMultiRoot === true ? "true" : "false",
        "X-CLIENT-TYPE": cleanHeaderValue(context.clientType) ?? "omniroute",
        "X-CLIENT-VERSION": clientVersion,
        "X-PLATFORM": cleanHeaderValue(context.platform) ?? process.platform ?? "unknown",
        "X-PLATFORM-VERSION": cleanHeaderValue(context.platformVersion) ?? process.version ?? "unknown",
        "X-CORE-VERSION": cleanHeaderValue(context.coreVersion) ?? APP_VERSION,
        "X-Task-ID": taskId
    };
    for (const [name, value] of Object.entries(required)){
        for (const existing of Object.keys(headers)){
            if (existing !== name && existing.toLowerCase() === name.toLowerCase()) {
                delete headers[existing];
            }
        }
        headers[name] = value;
    }
    return headers;
}
function getClineAccessToken(token) {
    if (typeof token !== "string") return "";
    const trimmed = token.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("workos:") ? trimmed : `workos:${trimmed}`;
}
function getClineAuthorizationHeader(token) {
    const accessToken = getClineAccessToken(token);
    return accessToken ? `Bearer ${accessToken}` : "";
}
function buildClineHeaders(token, extraHeaders = {}, context = {}) {
    const authorization = getClineAuthorizationHeader(token);
    const headers = applyClineProtocolHeaders({
        ...extraHeaders
    }, context);
    if (authorization) {
        headers.Authorization = authorization;
    }
    return headers;
}
function buildClinepassHeaders(credentials, effectiveKey, context = {}) {
    if (credentials?.accessToken) {
        return buildClineHeaders(credentials.accessToken, {}, context);
    }
    const headers = applyClineProtocolHeaders({}, context);
    const byokKey = effectiveKey || credentials?.apiKey;
    if (byokKey) headers.Authorization = `Bearer ${byokKey}`;
    return headers;
}
function applyClineAuthHeaders(headers, credentials, effectiveKey, clientHeaders, isClinepass) {
    const context = {
        taskId: resolveClineTaskId(clientHeaders)
    };
    const built = isClinepass ? buildClinepassHeaders(credentials, effectiveKey, context) : buildClineHeaders(effectiveKey || credentials?.accessToken, {}, context);
    Object.assign(headers, built);
    return headers;
}
}),
"[project]/open-sse/services/provider.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildProviderHeaders",
    ()=>buildProviderHeaders,
    "buildProviderUrl",
    ()=>buildProviderUrl,
    "detectFormat",
    ()=>detectFormat,
    "detectFormatFromEndpoint",
    ()=>detectFormatFromEndpoint,
    "detectFormatFromUrl",
    ()=>detectFormatFromUrl,
    "getOpenAICompatibleType",
    ()=>getOpenAICompatibleType,
    "getProviderConfig",
    ()=>getProviderConfig,
    "getProviderFallbackCount",
    ()=>getProviderFallbackCount,
    "getTargetFormat",
    ()=>getTargetFormat,
    "hasThinkingConfig",
    ()=>hasThinkingConfig,
    "isClaudeCodeCompatible",
    ()=>isClaudeCodeCompatible,
    "isLastMessageFromUser",
    ()=>isLastMessageFromUser,
    "normalizeThinkingConfig",
    ()=>normalizeThinkingConfig
]);
// @ts-nocheck
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/alternateFormats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clineAuth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const OPENAI_COMPATIBLE_PREFIX = "openai-compatible-";
const OPENAI_COMPATIBLE_DEFAULTS = {
    baseUrl: "https://api.openai.com/v1"
};
const ANTHROPIC_COMPATIBLE_PREFIX = "anthropic-compatible-";
const CLAUDE_CODE_COMPATIBLE_PREFIX = "anthropic-compatible-cc-";
const ANTHROPIC_COMPATIBLE_DEFAULTS = {
    baseUrl: "https://api.anthropic.com/v1"
};
function isOpenAICompatible(provider) {
    return typeof provider === "string" && provider.startsWith(OPENAI_COMPATIBLE_PREFIX);
}
function isAnthropicCompatible(provider) {
    return typeof provider === "string" && provider.startsWith(ANTHROPIC_COMPATIBLE_PREFIX);
}
function isClaudeCodeCompatible(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX) || // Built-in providers (e.g. agentrouter) that adopt the dynamic CC wire image
    // while keeping their own registry baseUrl + auth (#6056).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider);
}
function getOpenAICompatibleType(provider, providerSpecificData = null) {
    if (!isOpenAICompatible(provider)) return "chat";
    const configuredType = providerSpecificData && typeof providerSpecificData === "object" && typeof providerSpecificData.apiType === "string" ? providerSpecificData.apiType : null;
    if (configuredType === "responses" || configuredType === "chat" || configuredType === "embeddings" || configuredType === "audio-transcriptions" || configuredType === "audio-speech" || configuredType === "images-generations") {
        return configuredType;
    }
    if (provider.includes("responses")) return "responses";
    if (provider.includes("embeddings")) return "embeddings";
    if (provider.includes("audio-transcriptions")) return "audio-transcriptions";
    if (provider.includes("audio-speech")) return "audio-speech";
    if (provider.includes("images-generations")) return "images-generations";
    return "chat";
}
function buildOpenAICompatibleUrl(baseUrl, apiType) {
    const normalized = baseUrl.replace(/\/$/, "");
    let path = "/chat/completions";
    if (apiType === "responses") {
        path = "/responses";
    } else if (apiType === "embeddings") {
        path = "/embeddings";
    } else if (apiType === "audio-transcriptions") {
        path = "/audio/transcriptions";
    } else if (apiType === "audio-speech") {
        path = "/audio/speech";
    } else if (apiType === "images-generations") {
        path = "/images/generations";
    }
    return `${normalized}${path}`;
}
function buildAnthropicCompatibleUrl(baseUrl) {
    const normalized = baseUrl.replace(/\/$/, "");
    return `${normalized}/messages`;
}
function detectFormatFromEndpoint(body, endpointPath = "") {
    const path = String(endpointPath || "");
    if (/\/responses(?=\/|$)/i.test(path) || /^responses(?=\/|$)/i.test(path)) {
        return "openai-responses";
    }
    if (/\/messages(?=\/|$)/i.test(path) || /^messages(?=\/|$)/i.test(path)) {
        return "claude";
    }
    // Antigravity/cloudcode-compatible inbound endpoint (D4): the AgentBridge
    // proxy forwards the IDE's cloudcode envelope here. Path-based detection
    // (mirrors /messages → claude) makes the pipeline translate the request
    // antigravity→openai and the response openai→antigravity, so the IDE gets
    // a cloudcode reply regardless of which provider actually served it.
    if (/\/antigravity(?=\/|:|$)/i.test(path) || /^antigravity(?=\/|:|$)/i.test(path)) {
        return "antigravity";
    }
    if (/\/(?:chat\/completions|completions)(?=\/|$)/i.test(path) || /^(?:chat\/completions|completions)(?=\/|$)/i.test(path)) {
        if (body && typeof body === "object" && !Array.isArray(body) && body.input !== undefined && body.messages === undefined) {
            return "openai-responses";
        }
        return "openai";
    }
    return detectFormat(body);
}
function detectFormatFromUrl(body, requestUrl) {
    const rawUrl = typeof requestUrl === "string" ? requestUrl : "";
    let pathname = rawUrl;
    try {
        // Supplying a base URL keeps relative client endpoints (for example,
        // `/v1/messages`) valid while preserving pathname-only detection.
        pathname = new URL(rawUrl || "/", "http://omniroute.local").pathname;
    } catch  {
    // Fall back to the raw value; detectFormatFromEndpoint is intentionally
    // safe for unknown or malformed paths.
    }
    return detectFormatFromEndpoint(body, pathname);
}
function detectFormat(body) {
    // OpenAI Responses API:
    // - input can be string, array, or object (not only array)
    // - some clients send responses-specific fields even when input is omitted
    const hasInputField = Object.prototype.hasOwnProperty.call(body, "input") && body.input !== undefined;
    const hasResponsesSpecificFields = body.max_output_tokens !== undefined || body.previous_response_id !== undefined || body.reasoning !== undefined;
    if (hasInputField || hasResponsesSpecificFields) {
        return "openai-responses";
    }
    // Antigravity format: Gemini wrapped in body.request
    if (body.request?.contents && body.userAgent === "antigravity") {
        return "antigravity";
    }
    // Gemini format: has contents array
    if (body.contents && Array.isArray(body.contents)) {
        return "gemini";
    }
    // OpenAI-specific indicators (check BEFORE Claude)
    // These fields are OpenAI-specific and never appear in Claude format
    if (body.stream_options || // OpenAI streaming options
    body.response_format || // JSON mode, etc.
    body.logprobs !== undefined || // Log probabilities
    body.top_logprobs !== undefined || body.n !== undefined || // Number of completions
    body.presence_penalty !== undefined || // Penalties
    body.frequency_penalty !== undefined || body.logit_bias || // Token biasing
    body.user // User identifier
    ) {
        return "openai";
    }
    // Claude format: messages with content as array of objects with type
    // Claude requires content to be array with specific structure
    if (body.messages && Array.isArray(body.messages)) {
        const firstMsg = body.messages[0];
        // If content is array, check if it follows Claude structure
        if (firstMsg?.content && Array.isArray(firstMsg.content)) {
            const firstContent = firstMsg.content[0];
            // Claude format has specific types: text, image, tool_use, tool_result
            // OpenAI multimodal has: text, image_url (note the difference)
            if (firstContent?.type === "text" && !body.model?.includes("/")) {
                // Could be Claude or OpenAI multimodal
                // Check for Claude-specific fields
                if (body.system || body.anthropic_version || body["anthropic-version"]) {
                    return "claude";
                }
                // Check if image format is Claude (source.type) vs OpenAI (image_url.url)
                const hasClaudeImage = firstMsg.content.some((c)=>c.type === "image" && c.source?.type === "base64");
                const hasOpenAIImage = firstMsg.content.some((c)=>c.type === "image_url" && c.image_url?.url);
                if (hasClaudeImage) return "claude";
                if (hasOpenAIImage) return "openai";
                // If still unclear, check for tool format
                const hasClaudeTool = firstMsg.content.some((c)=>c.type === "tool_use" || c.type === "tool_result");
                if (hasClaudeTool) return "claude";
            }
        }
        // If content is string, it's likely OpenAI (Claude also supports this)
        // Check for other Claude-specific indicators
        if (body.system !== undefined || body.anthropic_version || body["anthropic-version"]) {
            return "claude";
        }
        // Additional Claude heuristic: max_tokens is a required Claude field
        // and Claude requests rarely include OpenAI-specific fields like
        // stream_options, response_format, or logprobs
        if (body.max_tokens && !body.stream_options && !body.response_format) {
            return "claude";
        }
    }
    // Default to OpenAI format
    return "openai";
}
function getProviderConfig(provider, providerSpecificData = null) {
    if (isOpenAICompatible(provider)) {
        const apiType = getOpenAICompatibleType(provider, providerSpecificData);
        return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].openai,
            format: apiType === "responses" ? "openai-responses" : "openai",
            baseUrl: OPENAI_COMPATIBLE_DEFAULTS.baseUrl
        };
    }
    if (isAnthropicCompatible(provider)) {
        return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].anthropic,
            format: "claude",
            baseUrl: ANTHROPIC_COMPATIBLE_DEFAULTS.baseUrl
        };
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider] || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].openai;
}
function getProviderFallbackCount(provider) {
    const config = getProviderConfig(provider);
    return config.baseUrls?.length || 1;
}
function buildProviderUrl(provider, model, stream = true, options = {}) {
    // Built-in CC-wire-image providers (e.g. agentrouter): keep the registry's
    // OWN baseUrl (NOT the CC family's anthropic default) but adopt the CC chat
    // path so the request still targets `<registry-baseUrl>?beta=true` (#6056).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider)) {
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
        const config = getProviderConfig(provider);
        const baseUrl = options?.baseUrl || entry?.baseUrl || config.baseUrl;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH"]);
    }
    if (isOpenAICompatible(provider)) {
        const providerSpecificData = options?.providerSpecificData || null;
        const apiType = getOpenAICompatibleType(provider, providerSpecificData);
        const baseUrl = options?.baseUrl || (typeof providerSpecificData?.baseUrl === "string" ? providerSpecificData.baseUrl : null) || OPENAI_COMPATIBLE_DEFAULTS.baseUrl;
        return buildOpenAICompatibleUrl(baseUrl, apiType);
    }
    if (isAnthropicCompatible(provider)) {
        const baseUrl = options?.baseUrl || ANTHROPIC_COMPATIBLE_DEFAULTS.baseUrl;
        if (isClaudeCodeCompatible(provider)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH"]);
        }
        return buildAnthropicCompatibleUrl(baseUrl);
    }
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    const config = getProviderConfig(provider);
    // Registry-driven URL building
    if (entry) {
        // Multi-URL providers (e.g. antigravity)
        if (entry.baseUrls) {
            const urlIndex = options?.baseUrlIndex || 0;
            const baseUrl = entry.baseUrls[urlIndex] || entry.baseUrls[0];
            if (entry.urlBuilder) return entry.urlBuilder(baseUrl, model, stream);
            return baseUrl;
        }
        // Custom URL builder (e.g. gemini, antigravity)
        if (entry.urlBuilder) {
            const baseUrl = entry.baseUrl || config.baseUrl;
            if (baseUrl) {
                return entry.urlBuilder(baseUrl, model, stream);
            }
        }
        // URL suffix (e.g. claude: ?beta=true)
        if (entry.urlSuffix) {
            return `${entry.baseUrl}${entry.urlSuffix}`;
        }
    }
    return config.baseUrl;
}
function buildProviderHeaders(provider, credentials, stream = true, body = null) {
    void body;
    const config = getProviderConfig(provider);
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    const headers = {
        "Content-Type": "application/json",
        ...config.headers
    };
    // Add auth header
    // Specific override for Anthropic Compatible
    if (isClaudeCodeCompatible(provider)) {
        const token = credentials.apiKey || credentials.accessToken || "";
        const ccRequestDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClaudeCodeCompatibleRequestDefaults"])(credentials?.providerSpecificData);
        const ccHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleHeaders"])(token, stream, credentials?.providerSpecificData?.ccSessionId, {
            redactThinking: ccRequestDefaults.redactThinking === true
        });
        // Built-in CC-wire-image providers (e.g. agentrouter): adopt the CC wire
        // image headers but keep the registry's OWN auth scheme (e.g. x-api-key)
        // instead of the CC family's Bearer auth (#6056).
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider)) {
            delete ccHeaders["Authorization"];
            const authHeader = entry?.authHeader || "bearer";
            if (authHeader === "x-api-key") {
                if (token) ccHeaders["x-api-key"] = token;
            } else if (authHeader === "key") {
                if (token) ccHeaders["Authorization"] = `Key ${token}`;
            } else {
                ccHeaders["Authorization"] = `Bearer ${token}`;
            }
        }
        return ccHeaders;
    }
    if (isAnthropicCompatible(provider)) {
        if (credentials.apiKey) {
            headers["x-api-key"] = credentials.apiKey;
        } else if (credentials.accessToken) {
            headers["Authorization"] = `Bearer ${credentials.accessToken}`;
        }
        if (!headers["anthropic-version"]) {
            headers["anthropic-version"] = "2023-06-01";
        }
    } else if (provider === "github") {
        // GitHub Copilot requires special dynamic headers (x-request-id)
        const githubToken = credentials.copilotToken || credentials.accessToken;
        headers["Authorization"] = `Bearer ${githubToken}`;
        headers["x-request-id"] = crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == "x" ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (!stream) {
            headers["Accept"] = "application/json";
        }
    } else if (provider === "cline") {
        // Cline's API requires the bearer token prefixed with `workos:` plus a set
        // of Cline client-identification headers; plain `Bearer <token>` is rejected
        // upstream. buildClineHeaders() emits both.
        Object.assign(headers, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildClineHeaders"])(credentials.apiKey || credentials.accessToken));
    } else if (entry) {
        // Registry-driven auth
        const authHeader = entry.authHeader || "bearer";
        if (authHeader === "x-api-key") {
            const token = credentials.apiKey || credentials.accessToken;
            if (token) {
                headers["x-api-key"] = token;
            }
        } else if (authHeader === "key") {
            const token = credentials.apiKey || credentials.accessToken;
            if (token) {
                headers["Authorization"] = `Key ${token}`;
            }
        } else if (authHeader === "x-goog-api-key") {
            if (credentials.apiKey) {
                headers["x-goog-api-key"] = credentials.apiKey;
            } else if (credentials.accessToken) {
                headers["Authorization"] = `Bearer ${credentials.accessToken}`;
            }
        } else {
            // bearer (default)
            headers["Authorization"] = `Bearer ${credentials.apiKey || credentials.accessToken}`;
        }
    } else {
        // Fallback for unknown providers
        headers["Authorization"] = `Bearer ${credentials.apiKey || credentials.accessToken}`;
    }
    // Stream accept header
    if (stream) {
        headers["Accept"] = "text/event-stream";
    }
    return headers;
}
function getTargetFormat(provider, providerSpecificData = null) {
    if (isOpenAICompatible(provider)) {
        return getOpenAICompatibleType(provider, providerSpecificData) === "responses" ? "openai-responses" : "openai";
    }
    if (isAnthropicCompatible(provider)) {
        return "claude";
    }
    // Registry-driven format lookup
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    if (entry) {
        // Per-connection override (providerSpecificData.targetFormat), only valid
        // when it matches an alternate declared by the provider.
        const alternate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAlternateFormat"])(entry, providerSpecificData);
        if (alternate) return alternate.format;
        return entry.format || "openai";
    }
    const config = getProviderConfig(provider);
    return config.format || "openai";
}
function isLastMessageFromUser(body) {
    const messages = body.messages || body.contents;
    if (!messages?.length) return true;
    const lastMsg = messages[messages.length - 1];
    return lastMsg?.role === "user";
}
function hasThinkingConfig(body) {
    return !!(body.reasoning_effort || body.thinking?.type === "enabled");
}
function normalizeThinkingConfig(body) {
    if (!isLastMessageFromUser(body)) {
        delete body.thinking;
    }
    return body;
}
}),
"[project]/src/shared/utils/cliCompat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeCliCompatProviderId",
    ()=>normalizeCliCompatProviderId
]);
function normalizeCliCompatProviderId(providerId) {
    const normalized = providerId.toLowerCase();
    if (normalized === "copilot") return "github";
    return normalized;
}
}),
"[project]/open-sse/config/cliFingerprints.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLI_FINGERPRINTS",
    ()=>CLI_FINGERPRINTS,
    "applyFingerprint",
    ()=>applyFingerprint,
    "getCliCompatProviders",
    ()=>getCliCompatProviders,
    "isCliCompatEnabled",
    ()=>isCliCompatEnabled,
    "orderFields",
    ()=>orderFields,
    "orderHeaders",
    ()=>orderHeaders,
    "setCliCompatProviders",
    ()=>setCliCompatProviders
]);
/**
 * CLI Fingerprint Definitions
 *
 * Defines per-provider "fingerprints" that control the exact ordering of HTTP headers
 * and JSON body fields to match the native CLI tools exactly.
 *
 * When `cliCompatMode` is enabled for a provider, OmniRoute reorders outgoing requests
 * to be indistinguishable from the real CLI binary, reducing account flagging risk.
 *
 * Header order and body field order were captured via mitmproxy traffic analysis.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cliCompat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cliCompat.ts [app-route] (ecmascript)");
;
;
;
const CLI_FINGERPRINTS = {
    codex: {
        headerOrder: [
            "Host",
            "Content-Type",
            "Authorization",
            "Accept",
            "User-Agent",
            "Accept-Encoding"
        ],
        bodyFieldOrder: [
            "model",
            "stream",
            "input",
            "instructions",
            "store",
            "reasoning",
            "prompt_cache_key",
            "tools",
            "tool_choice",
            "include",
            "service_tier",
            "client_metadata",
            "parallel_tool_calls",
            "metadata"
        ]
    },
    claude: {
        // Header order matching real claude-cli: Title-Case (Stainless) keys
        // alphabetically, then lowercase Anthropic keys alphabetically, then
        // transport headers added by Node fetch.
        headerOrder: [
            "Accept",
            "Authorization",
            "Content-Type",
            "User-Agent",
            "X-Claude-Code-Session-Id",
            "X-Stainless-Arch",
            "X-Stainless-Lang",
            "X-Stainless-OS",
            "X-Stainless-Package-Version",
            "X-Stainless-Retry-Count",
            "X-Stainless-Runtime",
            "X-Stainless-Runtime-Version",
            "X-Stainless-Timeout",
            "anthropic-beta",
            "anthropic-dangerous-direct-browser-access",
            "anthropic-version",
            "x-app",
            "x-client-request-id",
            "Connection",
            "Host",
            "Accept-Encoding",
            "Content-Length"
        ],
        bodyFieldOrder: [
            "model",
            "messages",
            "system",
            "tools",
            "tool_choice",
            "metadata",
            "max_tokens",
            "temperature",
            "thinking",
            "context_management",
            "output_config",
            "stream"
        ]
    },
    "claude-code-compatible": {
        headerOrder: [
            "Host",
            "Content-Type",
            "Authorization",
            "anthropic-version",
            "anthropic-beta",
            "anthropic-dangerous-direct-browser-access",
            "x-app",
            "User-Agent",
            "X-Claude-Code-Session-Id",
            "X-Stainless-Retry-Count",
            "X-Stainless-Timeout",
            "X-Stainless-Lang",
            "X-Stainless-Package-Version",
            "X-Stainless-OS",
            "X-Stainless-Arch",
            "X-Stainless-Runtime",
            "X-Stainless-Runtime-Version",
            "Accept",
            "accept-encoding",
            "Connection"
        ],
        bodyFieldOrder: [
            "model",
            "messages",
            "system",
            "tools",
            "tool_choice",
            "metadata",
            "max_tokens",
            "thinking",
            "output_config",
            "stream"
        ]
    },
    github: {
        headerOrder: [
            "Host",
            "Authorization",
            "X-Request-Id",
            "Vscode-Sessionid",
            "Vscode-Machineid",
            "Editor-Version",
            "Editor-Plugin-Version",
            "Copilot-Integration-Id",
            "Openai-Organization",
            "Openai-Intent",
            "Content-Type",
            "User-Agent",
            "Accept",
            "Accept-Encoding"
        ],
        bodyFieldOrder: [
            "messages",
            "model",
            "temperature",
            "top_p",
            "max_tokens",
            "n",
            "stream",
            "intent",
            "intent_threshold",
            "intent_content"
        ],
        userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GITHUB_COPILOT_CHAT_USER_AGENT"]
    },
    antigravity: {
        headerOrder: [
            "Accept",
            "Accept-Encoding",
            "Authorization",
            "Content-Type",
            "User-Agent",
            "x-goog-api-client",
            "x-client-name",
            "x-client-version",
            "x-machine-id",
            "x-vscode-sessionid",
            "Host",
            "Connection"
        ],
        bodyFieldOrder: [
            "project",
            "requestId",
            "request",
            "model",
            "userAgent",
            "requestType",
            "enabledCreditTypes"
        ],
        userAgent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityUserAgent"]
    }
};
function orderFields(obj, fieldOrder) {
    if (!fieldOrder?.length || !obj || typeof obj !== "object") return obj;
    const result = {};
    const remaining = new Set(Object.keys(obj));
    // First, add fields in the specified order
    for (const key of fieldOrder){
        if (key in obj) {
            result[key] = obj[key];
            remaining.delete(key);
        }
    }
    // Then append remaining fields in original order
    for (const key of remaining){
        result[key] = obj[key];
    }
    return result;
}
function orderHeaders(headers, headerOrder) {
    if (!headerOrder?.length || !headers) return headers;
    const result = {};
    const remaining = new Map();
    // Build case-insensitive lookup
    const headerMap = new Map();
    for (const [key, value] of Object.entries(headers)){
        headerMap.set(key.toLowerCase(), [
            key,
            value
        ]);
    }
    // Add ordered headers first
    for (const orderedKey of headerOrder){
        const entry = headerMap.get(orderedKey.toLowerCase());
        if (entry) {
            result[entry[0]] = entry[1];
            headerMap.delete(orderedKey.toLowerCase());
        }
    }
    // Add remaining headers
    for (const [, [key, value]] of headerMap){
        result[key] = value;
    }
    return result;
}
/**
 * Apply a CLI fingerprint to headers and body.
 * Returns { headers, bodyString } with the correct ordering.
 */ function stripInternalBodyFields(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const record = body;
    delete record._claudeCodeRequiresLowercaseToolNames;
    delete record._nativeCodexPassthrough;
    delete record._nativeXaiResponsesPassthrough;
    delete record._omnirouteResponsesStore;
    return body;
}
function applyFingerprint(provider, headers, body) {
    body = stripInternalBodyFields(body);
    const normalizedProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cliCompat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCliCompatProviderId"])(provider || "");
    const fingerprintKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(provider) ? "claude-code-compatible" : normalizedProvider;
    const fingerprint = CLI_FINGERPRINTS[fingerprintKey];
    if (!fingerprint) {
        return {
            headers,
            bodyString: JSON.stringify(body)
        };
    }
    // Apply user agent override
    if (fingerprint.userAgent) {
        headers["User-Agent"] = typeof fingerprint.userAgent === "function" ? fingerprint.userAgent() : fingerprint.userAgent;
    }
    // Apply extra headers
    if (fingerprint.extraHeaders) {
        Object.assign(headers, fingerprint.extraHeaders);
    }
    // Reorder headers
    const orderedHeaders = orderHeaders(headers, fingerprint.headerOrder);
    // Reorder body fields
    const orderedBody = body && typeof body === "object" && !Array.isArray(body) ? orderFields(body, fingerprint.bodyFieldOrder) : body;
    return {
        headers: orderedHeaders,
        bodyString: JSON.stringify(orderedBody)
    };
}
/**
 * Runtime cache for CLI compat providers set via Settings UI.
 * Updated by the settings API when users toggle providers.
 */ let _cliCompatProviders = new Set();
function setCliCompatProviders(providers) {
    _cliCompatProviders = new Set((providers || []).map((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cliCompat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCliCompatProviderId"])(p)).filter((provider)=>provider in CLI_FINGERPRINTS));
}
function getCliCompatProviders() {
    return Array.from(_cliCompatProviders);
}
function isCliCompatEnabled(provider) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(provider)) return true;
    const key = provider?.toLowerCase().replace(/[^a-z0-9]/g, "_");
    // 1. Check runtime cache (set via Settings UI)
    const normalizedProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cliCompat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCliCompatProviderId"])(provider || "");
    if (_cliCompatProviders.has(normalizedProvider)) return true;
    // 2. Check environment variable: CLI_COMPAT_<PROVIDER>=1
    const envKey = `CLI_COMPAT_${key?.toUpperCase()}`;
    if (process.env[envKey] === "1" || process.env[envKey] === "true") return true;
    // 3. Global enable: CLI_COMPAT_ALL=1
    if (process.env.CLI_COMPAT_ALL === "1" || process.env.CLI_COMPAT_ALL === "true") return true;
    return false;
}
}),
];

//# sourceMappingURL=_0l4iohj._.js.map