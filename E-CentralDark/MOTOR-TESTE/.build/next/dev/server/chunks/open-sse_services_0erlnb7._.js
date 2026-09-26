module.exports = [
"[project]/open-sse/services/apiKeyRotator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectionHasExtraKeys",
    ()=>connectionHasExtraKeys,
    "getAllKeyHealth",
    ()=>getAllKeyHealth,
    "getApiKeyCount",
    ()=>getApiKeyCount,
    "getInvalidKeyCount",
    ()=>getInvalidKeyCount,
    "getKeyHealthStats",
    ()=>getKeyHealthStats,
    "getRotatingApiKey",
    ()=>getRotatingApiKey,
    "getValidApiKey",
    ()=>getValidApiKey,
    "recordKeyFailure",
    ()=>recordKeyFailure,
    "recordKeySuccess",
    ()=>recordKeySuccess,
    "recordKeyTerminal",
    ()=>recordKeyTerminal,
    "removeConnectionHealth",
    ()=>removeConnectionHealth,
    "removeConnectionIndex",
    ()=>removeConnectionIndex,
    "resetKeyStatus",
    ()=>resetKeyStatus,
    "resetRotationIndex",
    ()=>resetRotationIndex,
    "resolveKeyForRequest",
    ()=>resolveKeyForRequest,
    "syncHealthFromDB",
    ()=>syncHealthFromDB,
    "trackConnectionExtraKeys",
    ()=>trackConnectionExtraKeys
]);
/**
 * apiKeyRotator.ts — T07: API Key Round-Robin with Health Tracking
 *
 * Rotates between a primary API key and extra API keys stored in
 * providerSpecificData.extraApiKeys[]. Uses round-robin by default.
 *
 * Extra keys are stored as plain strings in providerSpecificData.extraApiKeys.
 * Example: { extraApiKeys: ["sk-abc...", "sk-def...", "sk-ghi..."] }
 *
 * The in-memory rotation index resets on process restart, which is intentional —
 * it ensures even distribution across restarts without persistence overhead.
 *
 * Health tracking: monitors per-key authentication failures. Keys that fail
 * 3+ consecutive times are marked as "invalid" and skipped during rotation.
 * Health status is persisted in providerSpecificData.apiKeyHealth.
 */ // In-memory round-robin index per connection
const _keyIndexes = new Map();
// Tracks which connections have extra API keys (for A3 guard in chatCore.ts)
// Used to prevent disabling an entire connection when only one key fails.
const _connectionExtraKeys = new Map();
// Eviction limits to prevent unbounded memory growth under heavy load
const MAX_KEY_HEALTH_ENTRIES = 500;
const MAX_CONNECTION_EXTRA_KEYS = 500;
function trackConnectionExtraKeys(connectionId, extraKeys) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    if (!_connectionExtraKeys.has(connectionId) && _connectionExtraKeys.size >= MAX_CONNECTION_EXTRA_KEYS) {
        const oldest = _connectionExtraKeys.keys().next().value;
        if (oldest !== undefined) _connectionExtraKeys.delete(oldest);
    }
    _connectionExtraKeys.set(connectionId, validExtras.length > 0);
}
function connectionHasExtraKeys(connectionId, extraKeys) {
    // Direct data check is always authoritative
    if (extraKeys && extraKeys.length > 0) return true;
    // Fall back to in-memory cache (populated as side-effect during execution)
    return _connectionExtraKeys.get(connectionId) ?? false;
}
const _keyHealth = new Map();
const FAILURE_THRESHOLD = 2; // Mark as invalid after 2 consecutive failures
/**
 * Get or create health status for a specific key within a connection scope.
 */ function getOrCreateHealth(connectionId, keyId) {
    const scopedKey = `${connectionId}:${keyId}`;
    if (!_keyHealth.has(scopedKey)) {
        if (_keyHealth.size >= MAX_KEY_HEALTH_ENTRIES) {
            const oldest = _keyHealth.keys().next().value;
            if (oldest !== undefined) _keyHealth.delete(oldest);
        }
        _keyHealth.set(scopedKey, {
            status: "active",
            failures: 0,
            lastFailure: null,
            lastSuccess: null,
            totalRequests: 0,
            totalFailures: 0
        });
    }
    return _keyHealth.get(scopedKey);
}
function getValidApiKey(connectionId, primaryKey, extraKeys = [], health) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    // Build list of all keys with their IDs
    const allKeys = [];
    // Add primary key if valid
    if (primaryKey) {
        const primaryHealth = health?.["primary"] || getOrCreateHealth(connectionId, "primary");
        if (primaryHealth.status !== "invalid") {
            allKeys.push({
                key: primaryKey,
                keyId: "primary"
            });
        } else {
            console.warn(`[KeyRotator] Skipping invalid primary key for connection ${connectionId.slice(0, 8)}`);
        }
    }
    // Add extra keys if valid
    for(let i = 0; i < validExtras.length; i++){
        const keyId = `extra_${i}`;
        const keyHealth = health?.[keyId] || getOrCreateHealth(connectionId, keyId);
        if (keyHealth.status !== "invalid") {
            allKeys.push({
                key: validExtras[i],
                keyId
            });
        }
    }
    if (allKeys.length === 0) return null;
    if (allKeys.length === 1) {
        return {
            key: allKeys[0].key,
            keyId: allKeys[0].keyId
        };
    }
    // Round-robin among valid keys only
    const current = _keyIndexes.get(connectionId) ?? 0;
    const idx = current % allKeys.length;
    _keyIndexes.set(connectionId, current + 1);
    return {
        key: allKeys[idx].key,
        keyId: allKeys[idx].keyId
    };
}
function getRotatingApiKey(connectionId, primaryKey, extraKeys = []) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    if (validExtras.length === 0) return primaryKey;
    const allKeys = [
        primaryKey,
        ...validExtras
    ].filter(Boolean);
    if (allKeys.length <= 1) return primaryKey;
    const current = _keyIndexes.get(connectionId) ?? 0;
    const idx = current % allKeys.length;
    _keyIndexes.set(connectionId, current + 1);
    return allKeys[idx];
}
function recordKeyFailure(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures++;
    health.totalRequests++;
    health.totalFailures++;
    health.lastFailure = new Date().toISOString();
    if (health.failures >= FAILURE_THRESHOLD) {
        health.status = "invalid";
    } else if (health.failures > 0) {
        health.status = "warning";
    }
    return {
        ...health
    };
}
function recordKeyTerminal(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures = Math.max(health.failures + 1, FAILURE_THRESHOLD);
    health.totalRequests++;
    health.totalFailures++;
    health.lastFailure = new Date().toISOString();
    health.status = "invalid";
    return {
        ...health
    };
}
function recordKeySuccess(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures = 0;
    health.totalRequests++;
    health.lastSuccess = new Date().toISOString();
    health.status = "active";
    return {
        ...health
    };
}
function getInvalidKeyCount(health) {
    if (!health) return 0;
    return Object.values(health).filter((h)=>h.status === "invalid").length;
}
function getKeyHealthStats(connectionId, primaryKey, extraKeys = [], health) {
    const total = (primaryKey ? 1 : 0) + extraKeys.filter((k)=>k.trim().length > 0).length;
    const keys = [
        "primary",
        ...extraKeys.map((_, i)=>`extra_${i}`)
    ];
    let active = 0;
    let warning = 0;
    let invalid = 0;
    for (const keyId of keys){
        const h = health?.[keyId] || getOrCreateHealth(connectionId, keyId);
        if (h.status === "active") active++;
        else if (h.status === "warning") warning++;
        else if (h.status === "invalid") invalid++;
    }
    return {
        total,
        active,
        warning,
        invalid
    };
}
function resetKeyStatus(connectionId, keyId) {
    const health = getOrCreateHealth(connectionId, keyId);
    health.failures = 0;
    health.status = "active";
    health.lastFailure = null;
    return {
        ...health
    };
}
function getAllKeyHealth() {
    const result = {};
    for (const [keyId, health] of _keyHealth.entries()){
        result[keyId] = {
            ...health
        };
    }
    return result;
}
function syncHealthFromDB(connectionId, health) {
    if (!health) return;
    for (const [keyId, keyHealth] of Object.entries(health)){
        const scopedKey = `${connectionId}:${keyId}`;
        if (!_keyHealth.has(scopedKey) && _keyHealth.size >= MAX_KEY_HEALTH_ENTRIES) {
            const oldest = _keyHealth.keys().next().value;
            if (oldest !== undefined) _keyHealth.delete(oldest);
        }
        _keyHealth.set(scopedKey, keyHealth);
    }
}
function resetRotationIndex(connectionId) {
    _keyIndexes.delete(connectionId);
}
function getApiKeyCount(primaryKey, extraKeys = []) {
    const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
    return (primaryKey ? 1 : 0) + validExtras.length;
}
function resolveKeyForRequest(connectionId, primaryKey, extraKeys, selectedKeyId) {
    if (selectedKeyId) {
        const health = getOrCreateHealth(connectionId, selectedKeyId);
        if (health.status !== "invalid") {
            if (selectedKeyId === "primary" && primaryKey) {
                return {
                    key: primaryKey,
                    keyId: "primary"
                };
            }
            const match = /^extra_(\d+)$/.exec(selectedKeyId);
            if (match) {
                const idx = Number.parseInt(match[1], 10);
                if (idx >= 0 && idx < extraKeys.length && extraKeys[idx].trim().length > 0) {
                    return {
                        key: extraKeys[idx],
                        keyId: selectedKeyId
                    };
                }
            }
        }
    }
    return getValidApiKey(connectionId, primaryKey, extraKeys);
}
function removeConnectionHealth(connectionId) {
    for (const key of _keyHealth.keys()){
        if (key.startsWith(`${connectionId}:`)) {
            _keyHealth.delete(key);
        }
    }
}
function removeConnectionIndex(connectionId) {
    _keyIndexes.delete(connectionId);
    _connectionExtraKeys.delete(connectionId);
    for (const key of _keyHealth.keys()){
        if (key.startsWith(`${connectionId}:`)) {
            _keyHealth.delete(key);
        }
    }
}
}),
"[project]/open-sse/services/antigravityVersion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_CLI_FALLBACK_VERSION",
    ()=>ANTIGRAVITY_CLI_FALLBACK_VERSION,
    "ANTIGRAVITY_IDE_FALLBACK_VERSION",
    ()=>ANTIGRAVITY_IDE_FALLBACK_VERSION,
    "ANTIGRAVITY_VERSION_CACHE_TTL_MS",
    ()=>ANTIGRAVITY_VERSION_CACHE_TTL_MS,
    "ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS",
    ()=>ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS,
    "clearAntigravityVersionCaches",
    ()=>clearAntigravityVersionCaches,
    "getCachedAntigravityCliVersion",
    ()=>getCachedAntigravityCliVersion,
    "getCachedAntigravityIdeVersion",
    ()=>getCachedAntigravityIdeVersion,
    "resolveAntigravityCliVersion",
    ()=>resolveAntigravityCliVersion,
    "resolveAntigravityIdeVersion",
    ()=>resolveAntigravityIdeVersion,
    "seedAntigravityCliVersionCache",
    ()=>seedAntigravityCliVersionCache,
    "seedAntigravityIdeVersionCache",
    ()=>seedAntigravityIdeVersionCache
]);
const ANTIGRAVITY_IDE_RELEASE_FEED_URL = "https://antigravity-auto-updater-974169037036.us-central1.run.app/releases";
const ANTIGRAVITY_CLI_RELEASE_URL = "https://api.github.com/repos/google-antigravity/antigravity-cli/releases/latest";
const ANTIGRAVITY_VERSION_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS = 5_000;
const ANTIGRAVITY_IDE_FALLBACK_VERSION = "2.1.1";
const ANTIGRAVITY_CLI_FALLBACK_VERSION = "1.1.5";
const ideState = {
    cache: null,
    inFlight: null
};
const cliState = {
    cache: null,
    inFlight: null
};
function normalizeVersion(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim().replace(/^v/i, "");
    const match = trimmed.match(/^(\d+\.\d+\.\d+)\b/);
    return match ? match[1] : null;
}
function compareSemver(a, b) {
    const aParts = a.split(".").map((part)=>Number.parseInt(part, 10) || 0);
    const bParts = b.split(".").map((part)=>Number.parseInt(part, 10) || 0);
    for(let i = 0; i < 3; i += 1){
        if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
    }
    return 0;
}
function pickNewestVersion(...versions) {
    return versions.map((version)=>normalizeVersion(version)).filter((version)=>!!version).reduce((best, version)=>!best || compareSemver(version, best) > 0 ? version : best, null);
}
async function fetchJsonWithTimeout(fetchImpl, url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), ANTIGRAVITY_VERSION_FETCH_TIMEOUT_MS);
    try {
        const response = await fetchImpl(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": "OmniRoute-AntigravityVersion/1.0"
            },
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`Version source ${url} returned ${response.status}`);
        }
        return response.json();
    } finally{
        clearTimeout(timeoutId);
    }
}
function parseIdeReleaseFeed(payload) {
    if (!Array.isArray(payload)) return null;
    return pickNewestVersion(...payload.map((entry)=>entry?.version));
}
function parseCliRelease(payload) {
    if (!payload || typeof payload !== "object") return null;
    const release = payload;
    return normalizeVersion(release.tag_name ?? release.name);
}
async function resolveProductVersion(state, fallbackVersion, sourceUrl, parsePayload, fetchImpl) {
    const now = Date.now();
    if (state.cache && now - state.cache.fetchedAt < ANTIGRAVITY_VERSION_CACHE_TTL_MS) {
        return pickNewestVersion(state.cache.version, fallbackVersion) ?? fallbackVersion;
    }
    if (state.inFlight) {
        return state.inFlight;
    }
    state.inFlight = (async ()=>{
        let resolved = null;
        try {
            resolved = parsePayload(await fetchJsonWithTimeout(fetchImpl, sourceUrl));
        } catch  {
            resolved = null;
        }
        const version = pickNewestVersion(resolved, state.cache?.version, fallbackVersion) ?? fallbackVersion;
        if (resolved) {
            state.cache = {
                fetchedAt: Date.now(),
                version
            };
        }
        return version;
    })();
    try {
        return await state.inFlight;
    } finally{
        state.inFlight = null;
    }
}
function seedVersionCache(state, version, fetchedAt) {
    const normalized = normalizeVersion(version);
    if (!normalized) {
        throw new TypeError(`Invalid Antigravity version: ${version}`);
    }
    state.cache = {
        fetchedAt,
        version: normalized
    };
}
function resolveAntigravityIdeVersion(fetchImpl = fetch) {
    return resolveProductVersion(ideState, ANTIGRAVITY_IDE_FALLBACK_VERSION, ANTIGRAVITY_IDE_RELEASE_FEED_URL, parseIdeReleaseFeed, fetchImpl);
}
function resolveAntigravityCliVersion(fetchImpl = fetch) {
    return resolveProductVersion(cliState, ANTIGRAVITY_CLI_FALLBACK_VERSION, ANTIGRAVITY_CLI_RELEASE_URL, parseCliRelease, fetchImpl);
}
function getCachedAntigravityIdeVersion() {
    return ideState.cache?.version ?? ANTIGRAVITY_IDE_FALLBACK_VERSION;
}
function getCachedAntigravityCliVersion() {
    return cliState.cache?.version ?? ANTIGRAVITY_CLI_FALLBACK_VERSION;
}
function seedAntigravityIdeVersionCache(version, fetchedAt = Date.now()) {
    seedVersionCache(ideState, version, fetchedAt);
}
function seedAntigravityCliVersionCache(version, fetchedAt = Date.now()) {
    seedVersionCache(cliState, version, fetchedAt);
}
function clearAntigravityVersionCaches() {
    ideState.cache = null;
    ideState.inFlight = null;
    cliState.cache = null;
    cliState.inFlight = null;
}
}),
"[project]/open-sse/services/antigravityHeaders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANTIGRAVITY_IDE_NODE_API_CLIENT",
    ()=>ANTIGRAVITY_IDE_NODE_API_CLIENT,
    "ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT",
    ()=>ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT,
    "antigravityCliUserAgent",
    ()=>antigravityCliUserAgent,
    "antigravityIdeNodeUserAgent",
    ()=>antigravityIdeNodeUserAgent,
    "antigravityIdeUserAgent",
    ()=>antigravityIdeUserAgent,
    "getAntigravityContentHeaders",
    ()=>getAntigravityContentHeaders,
    "getAntigravityIdeNodeHeaders",
    ()=>getAntigravityIdeNodeHeaders,
    "getAntigravityLoadCodeAssistMetadata",
    ()=>getAntigravityLoadCodeAssistMetadata,
    "getAntigravityOAuthUserAgent",
    ()=>getAntigravityOAuthUserAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityVersion.ts [app-route] (ecmascript)");
;
const ANTIGRAVITY_IDE_NODE_API_CLIENT = "google-api-nodejs-client/10.3.0";
const ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT = "gl-node/22.21.1";
// Antigravity presents the native macOS desktop client fingerprint: the upstream
// backend expects the Mac build, so the OS/arch token is pinned to darwin/arm64
// regardless of the host OmniRoute happens to run on (#8098). The IDE / CLI /
// IDE-Node User-Agent split (#8013) is preserved — only the platform token is fixed.
const ANTIGRAVITY_OS_TYPE = "darwin";
const ANTIGRAVITY_ARCH = "arm64";
function withOptionalBearerAuth(headers, accessToken) {
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
}
function antigravityIdeUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedAntigravityIdeVersion"])()) {
    return `antigravity/ide/${version} ${ANTIGRAVITY_OS_TYPE}/${ANTIGRAVITY_ARCH}`;
}
function antigravityCliUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedAntigravityCliVersion"])(), authMethod = "consumer") {
    return `antigravity/cli/${version} (aidev_client; os_type=${ANTIGRAVITY_OS_TYPE}; arch=${ANTIGRAVITY_ARCH}; auth_method=${authMethod})`;
}
function antigravityIdeNodeUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedAntigravityIdeVersion"])()) {
    return `antigravity/${version} ${ANTIGRAVITY_OS_TYPE}/${ANTIGRAVITY_ARCH} ${ANTIGRAVITY_IDE_NODE_API_CLIENT}`;
}
function getAntigravityOAuthUserAgent(profile) {
    return profile === "cli" ? antigravityCliUserAgent() : antigravityIdeNodeUserAgent();
}
function getAntigravityContentHeaders(profile, accessToken) {
    return withOptionalBearerAuth({
        "Content-Type": "application/json",
        "User-Agent": profile === "cli" ? antigravityCliUserAgent() : antigravityIdeUserAgent()
    }, accessToken);
}
function getAntigravityIdeNodeHeaders(accessToken) {
    return withOptionalBearerAuth({
        "Content-Type": "application/json",
        "User-Agent": antigravityIdeNodeUserAgent(),
        "X-Goog-Api-Client": ANTIGRAVITY_IDE_NODE_X_GOOG_API_CLIENT
    }, accessToken);
}
function getAntigravityLoadCodeAssistMetadata() {
    return {
        ideType: "ANTIGRAVITY"
    };
}
}),
"[project]/open-sse/services/notionWebFallbackModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Notion Web fallback model catalog (seeded from the live AI picker).
 * Extracted from notionWebModels.ts to keep that module under the 800-line
 * file-size cap; notionWebModels.ts re-exports both symbols for consumers.
 */ __turbopack_context__.s([
    "NOTION_WEB_FALLBACK_MODELS",
    ()=>NOTION_WEB_FALLBACK_MODELS
]);
const NOTION_WEB_FALLBACK_MODELS = [
    {
        id: "notion-ai",
        name: "Notion AI (default)",
        owned_by: "notion"
    },
    {
        id: "gpt-5.6-sol",
        name: "GPT-5.6 Sol",
        owned_by: "openai",
        notionCodename: "orange-mousse"
    },
    {
        id: "gpt-5.6-terra",
        name: "GPT-5.6 Terra",
        owned_by: "openai",
        notionCodename: "orchid-muffin"
    },
    {
        id: "gpt-5.6-luna",
        name: "GPT-5.6 Luna",
        owned_by: "openai",
        notionCodename: "olive-jellyroll"
    },
    {
        id: "gpt-5.2",
        name: "GPT-5.2",
        owned_by: "openai",
        notionCodename: "oatmeal-cookie"
    },
    {
        id: "gpt-5.4",
        name: "GPT-5.4",
        owned_by: "openai",
        notionCodename: "oval-kumquat-medium"
    },
    {
        id: "gpt-5.5",
        name: "GPT-5.5",
        owned_by: "openai",
        notionCodename: "opal-quince-medium"
    },
    {
        id: "gpt-5.4-mini",
        name: "GPT-5.4 Mini",
        owned_by: "openai",
        notionCodename: "oregon-grape-medium"
    },
    {
        id: "gpt-5.4-nano",
        name: "GPT-5.4 Nano",
        owned_by: "openai",
        notionCodename: "otaheite-apple-medium"
    },
    {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        owned_by: "gemini",
        notionCodename: "vertex-gemini-3.5-flash"
    },
    {
        id: "gemini-3-flash",
        name: "Gemini 3 Flash",
        owned_by: "gemini",
        notionCodename: "gingerbread"
    },
    {
        id: "gemini-3.1-pro",
        name: "Gemini 3.1 Pro",
        owned_by: "gemini",
        notionCodename: "galette-medium-thinking"
    },
    {
        id: "sonnet-4.6",
        name: "Sonnet 4.6",
        owned_by: "anthropic",
        notionCodename: "almond-croissant-low"
    },
    {
        id: "sonnet-5",
        name: "Sonnet 5",
        owned_by: "anthropic",
        notionCodename: "angel-cake-high"
    },
    {
        id: "opus-4.6",
        name: "Opus 4.6",
        owned_by: "anthropic",
        notionCodename: "avocado-froyo-medium"
    },
    {
        id: "opus-4.7",
        name: "Opus 4.7",
        owned_by: "anthropic",
        notionCodename: "apricot-sorbet-high"
    },
    {
        id: "opus-4.8",
        name: "Opus 4.8",
        owned_by: "anthropic",
        notionCodename: "ambrosia-tart-high"
    },
    {
        id: "haiku-4.5",
        name: "Haiku 4.5",
        owned_by: "anthropic",
        notionCodename: "anthropic-haiku-4.5"
    },
    {
        id: "fable-5",
        name: "Fable 5",
        owned_by: "anthropic",
        notionCodename: "acai-budino-high"
    },
    {
        id: "kimi-k2.6",
        name: "Kimi K2.6",
        owned_by: "mystery",
        notionCodename: "fireworks-kimi-k2.6"
    },
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code",
        owned_by: "mystery",
        notionCodename: "fireworks-kimi-k2.7"
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        owned_by: "mystery",
        notionCodename: "baseten-deepseek-v4-pro"
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2",
        owned_by: "mystery",
        notionCodename: "baseten-glm-5.2"
    },
    {
        id: "grok-4.3",
        name: "Grok 4.3",
        owned_by: "xai",
        notionCodename: "xigua-mochi-medium"
    },
    {
        id: "grok-4.5",
        name: "Grok 4.5",
        owned_by: "xai",
        notionCodename: "strawberry-whoopiepie"
    },
    {
        id: "grok-build-0.1",
        name: "Grok Build 0.1",
        owned_by: "xai",
        notionCodename: "xinomavro-cake"
    }
];
}),
"[project]/open-sse/services/notionWebModels.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BROWSER_HEADERS",
    ()=>BROWSER_HEADERS,
    "NOTION_APP_ORIGIN",
    ()=>NOTION_APP_ORIGIN,
    "NOTION_CLIENT_VERSION",
    ()=>NOTION_CLIENT_VERSION,
    "NOTION_LEGACY_ORIGIN",
    ()=>NOTION_LEGACY_ORIGIN,
    "NOTION_MODELS_URL",
    ()=>NOTION_MODELS_URL,
    "NOTION_SPACES_URL",
    ()=>NOTION_SPACES_URL,
    "buildNotionFriendlyToCodenameMap",
    ()=>buildNotionFriendlyToCodenameMap,
    "buildNotionModelsDiscoveryBody",
    ()=>buildNotionModelsDiscoveryBody,
    "buildNotionModelsDiscoveryHeaders",
    ()=>buildNotionModelsDiscoveryHeaders,
    "catalogIdForNotionModel",
    ()=>catalogIdForNotionModel,
    "discoverNotionWebModels",
    ()=>discoverNotionWebModels,
    "extractNotionUserIdFromCookie",
    ()=>extractNotionUserIdFromCookie,
    "extractSpaceIdFromNotionCookie",
    ()=>extractSpaceIdFromNotionCookie,
    "fetchNotionWorkspaceCandidates",
    ()=>fetchNotionWorkspaceCandidates,
    "formatNotionDisabledModelsWarning",
    ()=>formatNotionDisabledModelsWarning,
    "getNotionModelsDiscoveryUrl",
    ()=>getNotionModelsDiscoveryUrl,
    "listNotionDisabledModels",
    ()=>listNotionDisabledModels,
    "normalizeNotionWebCookie",
    ()=>normalizeNotionWebCookie,
    "notionCodenameOf",
    ()=>notionCodenameOf,
    "parseNotionAvailableModels",
    ()=>parseNotionAvailableModels,
    "parseNotionGetSpaces",
    ()=>parseNotionGetSpaces,
    "pickFirstSpaceId",
    ()=>pickFirstSpaceId,
    "readCookieValue",
    ()=>readCookieValue,
    "resolveNotionCodename",
    ()=>resolveNotionCodename,
    "resolveNotionRuntimeWorkspace",
    ()=>resolveNotionRuntimeWorkspace,
    "resolveNotionSpaceIdFromGetSpaces",
    ()=>resolveNotionSpaceIdFromGetSpaces,
    "selectBestNotionSpaceId",
    ()=>selectBestNotionSpaceId,
    "slugifyNotionDisplayName",
    ()=>slugifyNotionDisplayName,
    "withFriendlyNotionAliases",
    ()=>withFriendlyNotionAliases
]);
/**
 * Notion AI Web model discovery helpers.
 *
 * Notion has no public model catalog API. The browser AI surface loads models via
 * cookie-auth `POST /api/v3/getAvailableModels` with body `{ spaceId }` (see
 * browser capture against app.notion.com). These helpers parse that response and
 * build the cookie/headers/body the models-discovery route needs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/notionWebFallbackModels.ts [app-route] (ecmascript)");
;
;
// Browser AI surface uses app.notion.com (live capture 2026-07-19). www.notion.so
// still works for many paths but can return a different space default / cookie
// domain behavior — prefer the same host the web picker uses.
const NOTION_APP_ORIGIN = "https://app.notion.com";
const NOTION_LEGACY_ORIGIN = "https://www.notion.so";
const NOTION_MODELS_URL = `${NOTION_APP_ORIGIN}/api/v3/getAvailableModels`;
const NOTION_SPACES_URL = `${NOTION_APP_ORIGIN}/api/v3/getSpaces`;
const NOTION_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
/** Recent Notion web client version — accepted loosely but required by some paths. */ const NOTION_CLIENT_VERSION = "23.13.20260719.1125";
/** Cap how many workspaces we probe for AI models when space_id is omitted. */ const NOTION_MAX_SPACE_PROBE = 8;
/** Cache auto-selected workspace per token so chat/inference reuses discovery. */ const NOTION_SPACE_CACHE = new Map();
const NOTION_SPACE_CACHE_TTL_MS = 30 * 60 * 1000;
const BROWSER_HEADERS = {
    "sec-ch-ua": '"Chromium";v="149", "Not)A;Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    priority: "u=1, i",
    "cache-control": "no-cache",
    pragma: "no-cache"
};
function notionTokenCacheKey(cookie) {
    // Prefer the token_v2 value only — ignore optional space/user parts.
    return readCookieValue(cookie, "token_v2") || normalizeNotionWebCookie(cookie);
}
function normalizeNotionWebCookie(raw) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return "";
    return trimmed.includes("=") ? trimmed : `token_v2=${trimmed}`;
}
function readCookieValue(cookie, name) {
    if (!cookie || !name) return "";
    const re = new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`, "i");
    const m = cookie.match(re);
    if (!m) return "";
    const raw = m[1].trim();
    // Malformed % sequences in cookie values must not throw (Gemini review).
    try {
        return decodeURIComponent(raw);
    } catch  {
        return raw;
    }
}
function extractSpaceIdFromNotionCookie(cookie) {
    return readCookieValue(cookie, "space_id") || readCookieValue(cookie, "spaceId") || "";
}
function extractNotionUserIdFromCookie(cookie) {
    return readCookieValue(cookie, "notion_user_id") || readCookieValue(cookie, "notion_user_id_v2") || readCookieValue(cookie, "user_id") || "";
}
/** Trim to a non-empty string, or fall back to `fallback`. */ function trimmedOrFallback(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
/** True when the row's `modelConfiguration.supportedReasoningEfforts` is a non-empty array. */ function rowSupportsReasoning(row) {
    const efforts = row.modelConfiguration?.supportedReasoningEfforts;
    return Array.isArray(efforts) && efforts.length > 0;
}
function slugifyNotionDisplayName(name) {
    // Keep dots so versioned labels stay readable ("GPT-5.6 Sol" → "gpt-5.6-sol",
    // not "gpt-5-6-sol"). Collapse other punctuation/spaces to single hyphens.
    return String(name || "").trim().toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/\.{2,}/g, ".").replace(/^[-.]+|[-.]+$/g, "");
}
function catalogIdForNotionModel(codename, displayName) {
    const slug = slugifyNotionDisplayName(displayName);
    if (slug && slug !== "notion-ai") return slug;
    return codename;
}
function listNotionDisabledModels(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return [];
    const list = data.models;
    if (!Array.isArray(list)) return [];
    const out = [];
    const seen = new Set();
    for (const entry of list){
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
        const row = entry;
        if (row.isDisabled !== true) continue;
        const codename = typeof row.model === "string" ? row.model.trim() : "";
        if (!codename || seen.has(codename)) continue;
        seen.add(codename);
        const name = trimmedOrFallback(row.modelMessage, codename);
        const reason = typeof row.disabledReason === "string" && row.disabledReason.trim() ? row.disabledReason.trim() : "disabled";
        out.push({
            id: catalogIdForNotionModel(codename, name),
            name,
            notionCodename: codename,
            reason
        });
    }
    return out;
}
function formatNotionDisabledModelsWarning(disabled) {
    if (!disabled.length) return "";
    const parts = disabled.map((d)=>{
        const reason = d.reason.replace(/_/g, " ");
        return `${d.name} (${reason})`;
    });
    return `Notion hid ${disabled.length} model(s) as unavailable for this account/workspace: ` + `${parts.join("; ")}. ` + `They appear in the web picker only when your plan unlocks them ` + `(e.g. Fable 5 requires a Notion Business or Enterprise plan).`;
}
/**
 * Parse one getAvailableModels list entry into a model, or `null` when the entry
 * should be skipped (disabled, malformed, or a duplicate already in `seen`).
 *
 * Plan-locked models (e.g. Fable 5 with `isDisabled: true` +
 * `disabledReason: business_or_enterprise_plan_required`) are skipped — they
 * cannot be used for inference. See `listNotionDisabledModels` for diagnostics.
 *
 * Catalog `id` is the real picker label slug; `notionCodename` is what
 * runInferenceTranscript requires.
 */ function parseNotionModelEntry(entry, seen) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const row = entry;
    // Notion still returns plan-locked models (Fable 5) with isDisabled=true.
    // Listing them in /v1/models would invite failed chat requests.
    if (row.isDisabled === true) return null;
    const codename = typeof row.model === "string" ? row.model.trim() : "";
    if (!codename) return null;
    const name = trimmedOrFallback(row.modelMessage, codename);
    const catalogId = catalogIdForNotionModel(codename, name);
    // Dedupe on both catalog id and codename so a second row with the same
    // label or the same food codename is not listed twice.
    if (seen.has(catalogId) || seen.has(codename)) return null;
    seen.add(catalogId);
    seen.add(codename);
    return {
        id: catalogId,
        name,
        owned_by: trimmedOrFallback(row.modelFamily, "notion"),
        ...catalogId !== codename ? {
            notionCodename: codename
        } : {},
        ...rowSupportsReasoning(row) ? {
            supportsReasoning: true
        } : {}
    };
}
function withFriendlyNotionAliases(models) {
    return models;
}
/** Ensure a stable default id always exists for clients that still request notion-ai. */ function withDefaultNotionModel(out, seen) {
    if (out.length === 0 || seen.has("notion-ai")) return out;
    return [
        {
            id: "notion-ai",
            name: "Notion AI (default)",
            owned_by: "notion"
        },
        ...out
    ];
}
function parseNotionAvailableModels(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return [];
    const list = data.models;
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const out = [];
    for (const entry of list){
        const model = parseNotionModelEntry(entry, seen);
        if (model) out.push(model);
    }
    return withFriendlyNotionAliases(withDefaultNotionModel(out, seen));
}
function buildNotionModelsDiscoveryHeaders(token) {
    const cookie = normalizeNotionWebCookie(token);
    const spaceId = extractSpaceIdFromNotionCookie(cookie);
    const userId = extractNotionUserIdFromCookie(cookie);
    const headers = {
        accept: "*/*",
        "content-type": "application/json",
        "user-agent": NOTION_USER_AGENT,
        origin: NOTION_APP_ORIGIN,
        referer: `${NOTION_APP_ORIGIN}/ai`,
        "notion-client-version": NOTION_CLIENT_VERSION,
        "notion-audit-log-platform": "web",
        ...cookie ? {
            cookie
        } : {},
        ...BROWSER_HEADERS
    };
    if (spaceId) headers["x-notion-space-id"] = spaceId;
    if (userId) headers["x-notion-active-user-header"] = userId;
    return headers;
}
function buildNotionModelsDiscoveryBody(token) {
    const cookie = normalizeNotionWebCookie(token);
    const spaceId = extractSpaceIdFromNotionCookie(cookie);
    return spaceId ? {
        spaceId
    } : {};
}
function getNotionModelsDiscoveryUrl() {
    return NOTION_MODELS_URL;
}
/**
 * Parse getSpaces JSON into a stable userId (top-level map key) and all space ids.
 * Shape: `{ [userId]: { space: { [spaceId]: {...} } } }`.
 */ /**
 * Reads one `{ [userKey]: { space: { [spaceId]: ... } } }` entry, pushing new
 * space ids into `spaceIds` and returning the userId it carries (if any).
 */ function collectUserSpaceEntry(key, value, spaceIds) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return "";
    const spaceMap = value.space;
    if (!spaceMap || typeof spaceMap !== "object" || Array.isArray(spaceMap)) return "";
    for (const id of Object.keys(spaceMap)){
        if (id && !spaceIds.includes(id)) spaceIds.push(id);
    }
    return key && !key.includes(" ") ? key : "";
}
/** Fallback spaceId extraction from the flat `{ spaces: [] }` / `{ spaceIds: [] }` shapes. */ function collectFallbackSpaceIds(root, spaceIds) {
    const fromArray = pickSpaceIdFromSpacesArray(root.spaces);
    if (fromArray) spaceIds.push(fromArray);
    const fromIds = pickSpaceIdFromSpaceIdsArray(root.spaceIds);
    if (fromIds && !spaceIds.includes(fromIds)) spaceIds.push(fromIds);
}
function parseNotionGetSpaces(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {
            userId: "",
            spaceIds: []
        };
    }
    const root = data;
    const spaceIds = [];
    let userId = "";
    for (const [key, value] of Object.entries(root)){
        const entryUserId = collectUserSpaceEntry(key, value, spaceIds);
        if (!userId && entryUserId) userId = entryUserId;
    }
    if (spaceIds.length === 0) {
        collectFallbackSpaceIds(root, spaceIds);
    }
    return {
        userId,
        spaceIds
    };
}
/** Common shape: { [userId]: { space_view: { ... }, space: { [spaceId]: ... } } } */ function pickSpaceIdFromUserMap(root) {
    return parseNotionGetSpaces(root).spaceIds[0] || "";
}
/** Flat shape: { spaces: [{ id }] } */ function pickSpaceIdFromSpacesArray(spaces) {
    if (!Array.isArray(spaces)) return "";
    for (const s of spaces){
        if (s && typeof s === "object" && typeof s.id === "string") {
            return s.id;
        }
    }
    return "";
}
/** Flat shape: { spaceIds: [] } */ function pickSpaceIdFromSpaceIdsArray(spaceIds) {
    return Array.isArray(spaceIds) && typeof spaceIds[0] === "string" ? spaceIds[0] : "";
}
function pickFirstSpaceId(data) {
    return parseNotionGetSpaces(data).spaceIds[0] || "";
}
function buildNotionBrowserHeaders(cookie, userId) {
    const headers = {
        accept: "*/*",
        "content-type": "application/json",
        "user-agent": NOTION_USER_AGENT,
        origin: NOTION_APP_ORIGIN,
        referer: `${NOTION_APP_ORIGIN}/ai`,
        "notion-client-version": NOTION_CLIENT_VERSION,
        "notion-audit-log-platform": "web",
        cookie,
        ...BROWSER_HEADERS
    };
    if (userId) headers["x-notion-active-user-header"] = userId;
    return headers;
}
async function fetchNotionWorkspaceCandidates(cookie, fetchImpl = fetch) {
    const normalized = normalizeNotionWebCookie(cookie);
    if (!normalized) return {
        userId: "",
        spaceIds: []
    };
    const userFromCookie = extractNotionUserIdFromCookie(normalized);
    try {
        const res = await fetchImpl(NOTION_SPACES_URL, {
            method: "POST",
            headers: buildNotionBrowserHeaders(normalized, userFromCookie || undefined),
            body: "{}"
        });
        if (!res.ok) return {
            userId: userFromCookie,
            spaceIds: []
        };
        const data = await res.json();
        const parsed = parseNotionGetSpaces(data);
        return {
            userId: userFromCookie || parsed.userId,
            spaceIds: parsed.spaceIds
        };
    } catch  {
        return {
            userId: userFromCookie,
            spaceIds: []
        };
    }
}
async function resolveNotionSpaceIdFromGetSpaces(cookie, fetchImpl = fetch) {
    const { spaceIds } = await fetchNotionWorkspaceCandidates(cookie, fetchImpl);
    return spaceIds[0] || "";
}
async function selectBestNotionSpaceId(opts) {
    const fetchImpl = opts.fetchImpl ?? fetch;
    const cookie = normalizeNotionWebCookie(opts.cookie);
    if (!cookie || opts.spaceIds.length === 0) return null;
    let best = null;
    for (const spaceId of opts.spaceIds.slice(0, NOTION_MAX_SPACE_PROBE)){
        if (!spaceId) continue;
        try {
            const headers = buildNotionBrowserHeaders(cookie, opts.userId || undefined);
            headers["x-notion-space-id"] = spaceId;
            const res = await fetchImpl(NOTION_MODELS_URL, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    spaceId
                }),
                signal: opts.signal ?? undefined
            });
            if (!res.ok) continue;
            const raw = await res.json();
            const models = parseNotionAvailableModels(raw);
            const enabled = models.filter((m)=>m.id !== "notion-ai").length;
            // Prefer workspaces where plan-locked models (e.g. Fable 5) are actually enabled.
            const disabled = listNotionDisabledModels(raw);
            const fableLocked = disabled.some((d)=>d.id === "fable-5" || d.notionCodename === "acai-budino-high");
            const fableEnabled = models.some((m)=>m.id === "fable-5" || m.notionCodename === "acai-budino-high");
            // Score: enabled models, plus a large bonus for unlocked Fable (or no Fable lock).
            let score = enabled * 10;
            if (fableEnabled) score += 1000;
            else if (fableLocked) score -= 50;
            if (!best || score > best.score) {
                best = {
                    spaceId,
                    models,
                    raw,
                    score
                };
            }
        } catch  {
        // try next space
        }
    }
    return best ? {
        spaceId: best.spaceId,
        models: best.models,
        raw: best.raw
    } : null;
}
async function resolveNotionRuntimeWorkspace(opts) {
    const cookie = normalizeNotionWebCookie(opts.cookie);
    const explicit = extractSpaceIdFromNotionCookie(cookie);
    const userId = extractNotionUserIdFromCookie(cookie);
    if (explicit) {
        return {
            spaceId: explicit,
            userId,
            fromCache: false
        };
    }
    const key = notionTokenCacheKey(cookie);
    const cached = NOTION_SPACE_CACHE.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return {
            spaceId: cached.spaceId,
            userId: cached.userId || userId,
            fromCache: true
        };
    }
    const fetchImpl = opts.fetchImpl ?? fetch;
    const candidates = await fetchNotionWorkspaceCandidates(cookie, fetchImpl);
    const best = await selectBestNotionSpaceId({
        cookie,
        spaceIds: candidates.spaceIds,
        userId: userId || candidates.userId || undefined,
        fetchImpl,
        signal: opts.signal
    });
    if (!best?.spaceId) {
        return {
            spaceId: candidates.spaceIds[0] || "",
            userId: userId || candidates.userId,
            fromCache: false
        };
    }
    const resolvedUser = userId || candidates.userId;
    NOTION_SPACE_CACHE.set(key, {
        spaceId: best.spaceId,
        userId: resolvedUser,
        expiresAt: Date.now() + NOTION_SPACE_CACHE_TTL_MS
    });
    return {
        spaceId: best.spaceId,
        userId: resolvedUser,
        fromCache: false
    };
}
/**
 * Discovery when the cookie already carries an explicit space_id — a single
 * targeted getAvailableModels call.
 */ async function discoverNotionModelsForExplicitSpace(opts) {
    const headers = buildNotionModelsDiscoveryHeaders(opts.cookie);
    headers["x-notion-space-id"] = opts.spaceId;
    if (opts.userId) headers["x-notion-active-user-header"] = opts.userId;
    const res = await opts.fetchImpl(NOTION_MODELS_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
            spaceId: opts.spaceId
        }),
        signal: opts.signal ?? undefined
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>"");
        throw new Error(`getAvailableModels failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    return {
        spaceId: opts.spaceId,
        models: parseNotionAvailableModels(data),
        data,
        spaceIdFromGetSpaces: false
    };
}
/**
 * Discovery when the cookie has no space_id — resolve via getSpaces, then probe
 * workspaces for the richest AI model list (so operators only need the raw
 * token_v2 value). Prefer the Business/AI workspace where Fable is unlocked
 * over a personal space where Fable is plan-locked (same model count otherwise).
 * Caches the winning workspace so inference reuses the same selection as /models.
 */ async function discoverNotionModelsViaGetSpaces(opts) {
    const candidates = await fetchNotionWorkspaceCandidates(opts.cookie, opts.fetchImpl);
    const userId = opts.userId || candidates.userId;
    if (candidates.spaceIds.length === 0) {
        throw new Error("Could not resolve a Notion workspace from token_v2 alone. " + "Re-copy a fresh token_v2 from app.notion.com (Application → Cookies), " + "or optionally paste space_id from Network → getAvailableModels → x-notion-space-id.");
    }
    const best = await selectBestNotionSpaceId({
        cookie: opts.cookie,
        spaceIds: candidates.spaceIds,
        userId: userId || undefined,
        fetchImpl: opts.fetchImpl,
        signal: opts.signal
    });
    if (!best || best.models.length === 0) {
        throw new Error("getAvailableModels returned no enabled models for any workspace visible to this token");
    }
    const key = notionTokenCacheKey(opts.cookie);
    NOTION_SPACE_CACHE.set(key, {
        spaceId: best.spaceId,
        userId: userId || "",
        expiresAt: Date.now() + NOTION_SPACE_CACHE_TTL_MS
    });
    return {
        spaceId: best.spaceId,
        models: best.models,
        data: best.raw,
        spaceIdFromGetSpaces: true
    };
}
async function discoverNotionWebModels(opts) {
    const fetchImpl = opts.fetchImpl ?? fetch;
    const cookie = normalizeNotionWebCookie(opts.token);
    if (!cookie) {
        throw new Error("Missing Notion token_v2 cookie");
    }
    const spaceIdFromCookie = extractSpaceIdFromNotionCookie(cookie);
    const userId = extractNotionUserIdFromCookie(cookie);
    const result = spaceIdFromCookie ? await discoverNotionModelsForExplicitSpace({
        cookie,
        spaceId: spaceIdFromCookie,
        userId,
        fetchImpl,
        signal: opts.signal
    }) : await discoverNotionModelsViaGetSpaces({
        cookie,
        userId,
        fetchImpl,
        signal: opts.signal
    });
    if (result.models.length === 0) {
        throw new Error("getAvailableModels returned no enabled models");
    }
    const disabledModels = listNotionDisabledModels(result.data);
    const warnings = [];
    const disabledWarning = formatNotionDisabledModelsWarning(disabledModels);
    if (disabledWarning) warnings.push(disabledWarning);
    // Auto space selection is silent when it works — no scary "paste space_id" nags.
    return {
        models: result.models,
        spaceId: result.spaceId,
        source: "api",
        disabledModels,
        spaceIdFromGetSpaces: result.spaceIdFromGetSpaces,
        ...warnings.length ? {
            warning: warnings.join(" ")
        } : {}
    };
}
function notionCodenameOf(model) {
    if (!model?.id || model.id === "notion-ai") return "";
    return (model.notionCodename || model.id).trim();
}
function buildNotionFriendlyToCodenameMap(models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"]) {
    const map = new Map();
    for (const m of models){
        if (!m?.id || m.id === "notion-ai") continue;
        const codename = notionCodenameOf(m);
        if (!codename) continue;
        // Catalog id (friendly slug) + its lowercase form.
        map.set(m.id, codename);
        map.set(m.id.toLowerCase(), codename);
        // Food codename itself (power users / cached clients).
        map.set(codename, codename);
        map.set(codename.toLowerCase(), codename);
        // Display label + slug (e.g. "Fable 5" / "fable-5").
        if (m.name) {
            map.set(m.name.toLowerCase(), codename);
            const slug = slugifyNotionDisplayName(m.name);
            if (slug) map.set(slug, codename);
        }
    }
    return map;
}
function resolveNotionCodename(model, extraModels = []) {
    let m = typeof model === "string" ? model.trim() : "";
    if (!m || m === "notion-ai") return "";
    // Strip provider prefixes added by /v1/models catalog.
    if (m.startsWith("notion-web/")) m = m.slice("notion-web/".length);
    else if (m.startsWith("nw/")) m = m.slice(3);
    if (!m || m === "notion-ai") return "";
    const map = buildNotionFriendlyToCodenameMap([
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"],
        ...extraModels
    ]);
    // Unknown ids pass through as-is so a freshly discovered codename still works
    // before the fallback table is updated.
    return map.get(m) || map.get(m.toLowerCase()) || map.get(slugifyNotionDisplayName(m)) || m;
}
;
}),
"[project]/open-sse/services/promptqlModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * PromptQL (prompt.ql.app) model catalog helpers.
 *
 * Live catalog: GraphQL `FetchLlmConfigs` against the playground Hasura endpoint.
 * Fallback: static seed captured 2026-07-20 (display_label / model_reference / model_id).
 */ __turbopack_context__.s([
    "PROMPTQL_FALLBACK_MODELS",
    ()=>PROMPTQL_FALLBACK_MODELS,
    "clientFacingPromptQlModelId",
    ()=>clientFacingPromptQlModelId,
    "discoverPromptQlModels",
    ()=>discoverPromptQlModels,
    "resolvePromptQlModel",
    ()=>resolvePromptQlModel,
    "stripPromptQlModelPrefix",
    ()=>stripPromptQlModelPrefix
]);
const PROMPTQL_FALLBACK_MODELS = [
    {
        id: "vertex-claude-fable-5",
        name: "Claude Fable 5",
        configId: "967e6517-1d6b-4e22-82fb-3463bab239c4",
        modelId: "anthropic/claude-fable-5"
    },
    {
        id: "bedrock-claude-opus-4-8",
        name: "Claude Opus 4.8",
        configId: "e97e7f50-9e4a-4685-bc14-1854f1f79782",
        modelId: "us.anthropic.claude-opus-4-8"
    },
    {
        id: "bedrock-claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        configId: "48105d83-9a45-4ec6-8b58-f3cf44094f92",
        modelId: "us.anthropic.claude-sonnet-4-5-20250929-v1:0"
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        configId: "5a23af33-b31b-4215-892c-20ef633a8848",
        modelId: "accounts/fireworks/models/deepseek-v4-pro"
    },
    {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro Preview",
        configId: "d2bda5cd-881b-4044-aeb9-02a83cc0ca27",
        modelId: "google/gemini-3.1-pro-preview"
    },
    {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        configId: "c3a25aa0-ca48-4577-b52d-71282aacb687",
        modelId: "google/gemini-3.5-flash"
    },
    {
        id: "glm-5.2",
        name: "GLM 5.2",
        configId: "64a1fa3d-bf2e-4bb9-8c2b-fa76c218d636",
        modelId: "accounts/fireworks/models/glm-5p2"
    },
    {
        id: "gpt-5.5",
        name: "GPT 5.5",
        configId: "1762fbce-d5bf-4bf4-ba3d-8b1201f8e204",
        modelId: "gpt-5.5"
    },
    {
        id: "gpt-5.6-luna",
        name: "GPT-5.6 Luna",
        configId: "a9c45ba7-87fa-49a1-8165-76b0864c3a55",
        modelId: "gpt-5.6-luna"
    },
    {
        id: "gpt-5.6-sol",
        name: "GPT-5.6 Sol",
        configId: "34c80712-def3-4db3-9e7a-f57b0324b43d",
        modelId: "gpt-5.6-sol"
    },
    {
        id: "gpt-5.6-terra",
        name: "GPT-5.6 Terra",
        configId: "04f1a08c-42b2-4371-b6d8-75c50b9bb990",
        modelId: "gpt-5.6-terra"
    },
    {
        id: "xai-grok-4-5",
        name: "Grok 4.5",
        configId: "068b2ef2-e432-422b-98e5-5863a1852c47",
        modelId: "grok-4.5"
    },
    {
        id: "kimi-k2.6",
        name: "Kimi K2.6",
        configId: "placeholder-kimi-k2.6",
        modelId: "accounts/fireworks/models/kimi-k2p6"
    },
    {
        id: "kimi-k2.7-code",
        name: "Kimi K2.7 Code",
        configId: "placeholder-kimi-k2.7-code",
        modelId: "accounts/fireworks/models/kimi-k2p7-code"
    },
    {
        id: "minimax-m3",
        name: "Minimax M3",
        configId: "placeholder-minimax-m3",
        modelId: "accounts/fireworks/models/minimax-m3",
        supportsVision: true
    }
];
const FETCH_LLM_CONFIGS = `
query FetchLlmConfigs {
  llm_config(
    where: {deleted_at: {_is_null: true}}
    order_by: {display_label: asc}
  ) {
    id
    display_label
    model_reference
    model_id
  }
}`;
function stripPromptQlModelPrefix(model) {
    let m = (model || "").trim();
    if (m.startsWith("promptql/")) m = m.slice("promptql/".length);
    else if (m.startsWith("pql/")) m = m.slice(4);
    return m;
}
function resolvePromptQlModel(model) {
    const raw = typeof model === "string" ? stripPromptQlModelPrefix(model) : "";
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const catalog = PROMPTQL_FALLBACK_MODELS;
    return catalog.find((m)=>m.id.toLowerCase() === lower) || catalog.find((m)=>m.name.toLowerCase() === lower) || catalog.find((m)=>(m.modelId || "").toLowerCase() === lower) || catalog.find((m)=>(m.configId || "").toLowerCase() === lower) || catalog.find((m)=>lower.includes(m.id.toLowerCase())) || null;
}
function clientFacingPromptQlModelId(model) {
    const resolved = resolvePromptQlModel(model);
    if (resolved) return resolved.id;
    const stripped = typeof model === "string" ? stripPromptQlModelPrefix(model) : "";
    return stripped || "promptql-default";
}
async function discoverPromptQlModels(opts) {
    const res = await fetch(opts.graphqlEndpoint, {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Bearer ${opts.token}`,
            origin: "https://prompt.ql.app",
            referer: "https://prompt.ql.app/"
        },
        body: JSON.stringify({
            query: FETCH_LLM_CONFIGS,
            operationName: "FetchLlmConfigs"
        }),
        signal: opts.signal ?? undefined
    });
    if (!res.ok) {
        throw new Error(`FetchLlmConfigs HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.errors?.length) {
        throw new Error(json.errors.map((e)=>e.message || "error").join("; "));
    }
    const rows = json.data?.llm_config || [];
    return rows.map((r)=>{
        const id = (r.model_reference || r.model_id || r.id || "").trim();
        if (!id) return null;
        return {
            id,
            name: (r.display_label || id).trim(),
            configId: r.id,
            modelId: r.model_id
        };
    }).filter((x)=>Boolean(x));
}
}),
"[project]/open-sse/services/hyperagentModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * HyperAgent (hyperagent.com) model catalog.
 *
 * Wire IDs were validated live against PATCH /api/threads/{id} (2026-07-21):
 *   Main modelId: fable-latest | opus-latest | sonnet-latest | claude-fable-5 |
 *                 claude-opus-4-8 | claude-sonnet-5
 *   Subagent (defaultSubagentModel): short family names only — fable | opus | sonnet | haiku
 *
 * Pricing keys like bare "fable" are NOT valid chat modelIds (API returns model_unknown).
 * Model is applied on the THREAD via PATCH, not in the /chat body.
 */ __turbopack_context__.s([
    "HYPERAGENT_DEFAULT_CONTEXT_LENGTH",
    ()=>HYPERAGENT_DEFAULT_CONTEXT_LENGTH,
    "HYPERAGENT_FALLBACK_MODELS",
    ()=>HYPERAGENT_FALLBACK_MODELS,
    "clientFacingHyperAgentModelId",
    ()=>clientFacingHyperAgentModelId,
    "resolveHyperAgentModel",
    ()=>resolveHyperAgentModel,
    "stripHyperAgentModelPrefix",
    ()=>stripHyperAgentModelPrefix,
    "wireHyperAgentModelId",
    ()=>wireHyperAgentModelId,
    "wireHyperAgentRuntimeId",
    ()=>wireHyperAgentRuntimeId,
    "wireHyperAgentSubagentModelId",
    ()=>wireHyperAgentSubagentModelId
]);
const HYPERAGENT_DEFAULT_CONTEXT_LENGTH = 1_000_000;
const HYPERAGENT_FALLBACK_MODELS = [
    {
        id: "fable-latest",
        name: "Fable 5",
        subagent: "fable",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "claude-fable-5",
        name: "Claude Fable 5",
        subagent: "fable",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "opus-latest",
        name: "Claude Opus Latest",
        subagent: "opus",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "claude-opus-4-8",
        name: "Claude Opus 4.8",
        subagent: "opus",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "sonnet-latest",
        name: "Claude Sonnet Latest",
        subagent: "sonnet",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    },
    {
        id: "claude-sonnet-5",
        name: "Claude Sonnet 5",
        subagent: "sonnet",
        runtimeId: "claude-agents-sdk",
        contextLength: HYPERAGENT_DEFAULT_CONTEXT_LENGTH
    }
];
function stripHyperAgentModelPrefix(model) {
    let m = (model || "").trim();
    if (m.startsWith("hyperagent/")) m = m.slice("hyperagent/".length);
    else if (m.startsWith("ha/")) m = m.slice(3);
    else if (m.startsWith("hyper/")) m = m.slice("hyper/".length);
    return m;
}
/** Alias / pretty-name / legacy pricing-key → catalog wire id. */ const ALIASES = {
    // Fable
    fable: "fable-latest",
    "fable-5": "fable-latest",
    fable5: "fable-latest",
    "claude-fable-5": "claude-fable-5",
    "claude-fable": "fable-latest",
    "fable-latest": "fable-latest",
    // Opus
    opus: "opus-latest",
    "opus-latest": "opus-latest",
    "opus-4-8": "claude-opus-4-8",
    "opus-4.8": "claude-opus-4-8",
    "claude-opus-4-8": "claude-opus-4-8",
    "claude-opus-4.8": "claude-opus-4-8",
    "claude-opus-latest": "opus-latest",
    // Sonnet
    sonnet: "sonnet-latest",
    "sonnet-latest": "sonnet-latest",
    "sonnet-5": "claude-sonnet-5",
    "claude-sonnet-5": "claude-sonnet-5",
    "claude-sonnet-latest": "sonnet-latest",
    // Haiku subagent only — map main requests to sonnet-latest as closest chat model
    haiku: "sonnet-latest",
    "haiku-4": "sonnet-latest",
    "claude-haiku-4": "sonnet-latest"
};
function resolveHyperAgentModel(model) {
    const raw = typeof model === "string" ? stripHyperAgentModelPrefix(model) : "";
    if (!raw) return null;
    const lower = raw.toLowerCase().trim();
    const compact = lower.replace(/[\s_]+/g, "-");
    const catalog = HYPERAGENT_FALLBACK_MODELS;
    // Exact wire id
    const byId = catalog.find((m)=>m.id.toLowerCase() === lower || m.id.toLowerCase() === compact);
    if (byId) return byId;
    // Pretty name
    const byName = catalog.find((m)=>m.name.toLowerCase() === lower);
    if (byName) return byName;
    // Alias table
    const aliasId = ALIASES[compact] || ALIASES[lower];
    if (aliasId) {
        const hit = catalog.find((m)=>m.id === aliasId);
        if (hit) return hit;
    }
    // Partial contains
    return catalog.find((m)=>compact.includes(m.id.toLowerCase())) || catalog.find((m)=>m.name.toLowerCase().includes(compact.replace(/-/g, " "))) || null;
}
function clientFacingHyperAgentModelId(model) {
    const resolved = resolveHyperAgentModel(model);
    if (resolved) return resolved.id;
    const stripped = typeof model === "string" ? stripHyperAgentModelPrefix(model) : "";
    return stripped || "opus-latest";
}
function wireHyperAgentModelId(model) {
    return clientFacingHyperAgentModelId(model);
}
function wireHyperAgentSubagentModelId(model) {
    const resolved = resolveHyperAgentModel(model);
    if (resolved?.subagent) return resolved.subagent;
    const wire = wireHyperAgentModelId(model).toLowerCase();
    if (wire.includes("fable")) return "fable";
    if (wire.includes("sonnet")) return "sonnet";
    if (wire.includes("haiku")) return "haiku";
    if (wire.includes("opus")) return "opus";
    return "opus";
}
function wireHyperAgentRuntimeId(model) {
    const resolved = resolveHyperAgentModel(model);
    return resolved?.runtimeId || "claude-agents-sdk";
}
}),
"[project]/open-sse/services/wildcardRouter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
/**
 * Wildcard Model Routing — Phase 8
 *
 * Glob-style wildcard matching for model aliases with specificity ranking.
 * Integrates into the existing model resolution pipeline.
 */ /**
 * Match a model name against a pattern with glob wildcards.
 * Supports * (wildcard sequence) and ? (single char).
 *
 * @param {string} model - Model name to match
 * @param {string} pattern - Pattern with wildcards
 * @returns {boolean}
 */ __turbopack_context__.s([
    "getSpecificity",
    ()=>getSpecificity,
    "resolveModel",
    ()=>resolveModel,
    "resolveWildcardAlias",
    ()=>resolveWildcardAlias,
    "wildcardMatch",
    ()=>wildcardMatch
]);
function wildcardMatch(model, pattern) {
    if (!model || !pattern) return false;
    if (pattern === "*") return true;
    if (pattern === model) return true;
    // Convert glob pattern to regex
    const regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(`^${regexStr}$`, "i");
    return regex.test(model);
}
function getSpecificity(pattern) {
    if (!pattern) return 0;
    let score = 0;
    // Exact segments (no wildcards) contribute most
    const segments = pattern.split(/[/*?]/);
    for (const seg of segments){
        if (seg.length > 0) score += seg.length * 10;
    }
    // Wildcards reduce specificity
    const wildcardCount = (pattern.match(/\*/g) || []).length;
    const questionCount = (pattern.match(/\?/g) || []).length;
    score -= wildcardCount * 50;
    score -= questionCount * 5;
    // Longer patterns tend to be more specific
    score += pattern.length;
    return score;
}
function resolveWildcardAlias(model, aliases) {
    if (!model || !aliases || !Array.isArray(aliases)) return null;
    const matches = [];
    for (const alias of aliases){
        const pattern = alias.pattern || alias.alias || alias.from;
        const target = alias.target || alias.model || alias.to;
        if (!pattern || !target) continue;
        if (wildcardMatch(model, pattern)) {
            matches.push({
                pattern,
                target,
                specificity: getSpecificity(pattern),
                ...alias
            });
        }
    }
    if (matches.length === 0) return null;
    // Sort by specificity (highest first)
    matches.sort((a, b)=>b.specificity - a.specificity);
    return matches[0];
}
function resolveModel(model, exactAliases = {}, wildcardAliases = []) {
    if (!model) return model;
    // 1. Check exact aliases first (fastest)
    if (exactAliases instanceof Map) {
        if (exactAliases.has(model)) return exactAliases.get(model);
    } else if (exactAliases[model]) {
        return exactAliases[model];
    }
    // 2. Check wildcard aliases
    const match = resolveWildcardAlias(model, wildcardAliases);
    if (match) return match.target;
    // 3. Return original
    return model;
}
}),
"[project]/open-sse/services/compression/adaptiveCompression/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Context-budget adaptive compression — shared types.
 *
 * Naming note: "adaptiveCompression"/"contextBudget" — NOT "headroom" (which is an
 * unrelated existing engine). "headroom" here = the budget signal (target − prompt tokens).
 */ /** Target-derivation policy (design D-C1). */ __turbopack_context__.s([
    "DEFAULT_CONTEXT_BUDGET",
    ()=>DEFAULT_CONTEXT_BUDGET
]);
const DEFAULT_CONTEXT_BUDGET = {
    mode: "off",
    policy: "reserve-output",
    outputReserve: 4096,
    safetyMargin: 1024,
    pct: 0.85,
    absoluteBudget: 0
};
}),
"[project]/open-sse/services/modelDeprecation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCustomAlias",
    ()=>addCustomAlias,
    "getAllAliases",
    ()=>getAllAliases,
    "getBuiltInAliases",
    ()=>getBuiltInAliases,
    "getCustomAliases",
    ()=>getCustomAliases,
    "getDeprecationNotice",
    ()=>getDeprecationNotice,
    "isDeprecated",
    ()=>isDeprecated,
    "removeCustomAlias",
    ()=>removeCustomAlias,
    "resolveModelAlias",
    ()=>resolveModelAlias,
    "setCustomAliases",
    ()=>setCustomAliases
]);
/**
 * Model Deprecation Auto-Forward — Feature 2
 *
 * Maps deprecated model IDs to their replacements so user configs
 * don't break when providers rename or retire models.
 *
 * Supports both built-in aliases (static) and custom aliases (persisted via Settings API).
 */ // ── Built-in Deprecation Aliases ────────────────────────────────────────────
// These are known renames/retirements across providers.
// Format: deprecated ID → current ID
const BUILT_IN_ALIASES = {
    // Gemini legacy → current
    "gemini-pro": "gemini-2.5-pro",
    "gemini-pro-vision": "gemini-2.5-pro",
    "gemini-1.5-pro": "gemini-2.5-pro",
    "gemini-1.5-flash": "gemini-2.5-flash",
    "gemini-1.0-pro": "gemini-2.5-pro",
    "gemini-2.0-flash": "gemini-2.5-flash",
    "gemini-2.0-flash-lite": "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview": "gemini-3.1-flash-lite",
    "gemini-3-pro-high": "gemini-3.1-pro-high",
    "gemini-3-pro-low": "gemini-3.1-pro-low",
    // Retired free Gemma (was in the gemini-free pool) → current gemini-free model
    "gemma-4": "gemini-3.1-flash-lite",
    // Claude legacy → current
    "claude-3-opus-20240229": "claude-opus-4-20250514",
    "claude-3-sonnet-20240229": "claude-sonnet-4-20250514",
    "claude-3-haiku-20240307": "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-latest": "claude-sonnet-4-20250514",
    "claude-3-5-haiku-latest": "claude-3-5-sonnet-20241022",
    // OpenAI legacy → current
    "gpt-4-turbo-preview": "gpt-4-turbo",
    "gpt-4-0125-preview": "gpt-4-turbo",
    "gpt-4-1106-preview": "gpt-4-turbo",
    "gpt-3.5-turbo-0125": "gpt-3.5-turbo",
    // Kimi/Moonshot — Fireworks long-path aliases (#265)
    "accounts/fireworks/models/kimi-k2p5": "moonshotai/Kimi-K2.5",
    "fireworks/accounts/fireworks/models/kimi-k2p5": "moonshotai/Kimi-K2.5",
    "kimi-k2p5": "moonshotai/Kimi-K2.5",
    "accounts/fireworks/models/kimi-k2": "moonshotai/Kimi-K2",
    "fireworks/accounts/fireworks/models/kimi-k2": "moonshotai/Kimi-K2",
    "kimi-k2": "moonshotai/Kimi-K2",
    // Mistral short aliases
    "mistral-large": "mistral-large-latest",
    "mistral-small": "mistral-small-latest",
    codestral: "codestral-latest",
    // Sweep 2026-06-19: codestral-2405 retired 2025-06-16 — forward to the current stable.
    "codestral-2405": "codestral-2508",
    // Llama short aliases
    "llama-3.3": "llama-3.3-70b-versatile",
    "llama-3-70b": "llama-3.3-70b-versatile",
    "llama-3-8b": "llama3-8b-8192"
};
// ── Custom Aliases (persisted via Settings API) ─────────────────────────────
//
// Backed by globalThis so the singleton store is shared across the SEPARATE webpack
// module graphs Next.js builds for `instrumentation.ts` (boot-time hydration via
// applyRuntimeSettings → setCustomAliases) and the app-route `GET /api/settings/model-aliases`.
// A plain module-level `let` is DUPLICATED per graph, so startup hydration lands on the
// instrumentation graph's copy while the API route reads an empty copy — the exact
// symptom #5777 patched at the route layer. Migrating the store to globalThis fixes the
// root cause (both instances read/write one store), mirroring the #5312 pattern already
// applied to thinkingBudget.ts and backgroundTaskDetector.ts (and systemPrompt.ts #2470).
const CUSTOM_ALIASES_GLOBAL_KEY = "__omniroute_customAliases__";
const _aliasStore = globalThis;
function customAliases() {
    if (!_aliasStore[CUSTOM_ALIASES_GLOBAL_KEY]) {
        _aliasStore[CUSTOM_ALIASES_GLOBAL_KEY] = {};
    }
    return _aliasStore[CUSTOM_ALIASES_GLOBAL_KEY];
}
function setCustomAliases(aliases) {
    _aliasStore[CUSTOM_ALIASES_GLOBAL_KEY] = {
        ...aliases
    };
}
function getCustomAliases() {
    return {
        ...customAliases()
    };
}
function getAllAliases() {
    return {
        ...BUILT_IN_ALIASES,
        ...customAliases()
    };
}
function resolveModelAlias(modelId) {
    if (!modelId) return modelId;
    // Check custom aliases first (higher priority)
    const custom = customAliases();
    if (custom[modelId]) return custom[modelId];
    // Then check built-in
    if (BUILT_IN_ALIASES[modelId]) return BUILT_IN_ALIASES[modelId];
    return modelId;
}
function getDeprecationNotice(modelId) {
    if (!modelId) return null;
    const resolved = resolveModelAlias(modelId);
    if (resolved === modelId) return null;
    return `Model "${modelId}" is deprecated. Forwarding to "${resolved}".`;
}
function isDeprecated(modelId) {
    return getDeprecationNotice(modelId) !== null;
}
function addCustomAlias(from, to) {
    customAliases()[from] = to;
}
function removeCustomAlias(from) {
    const custom = customAliases();
    if (custom[from]) {
        delete custom[from];
        return true;
    }
    return false;
}
function getBuiltInAliases() {
    return {
        ...BUILT_IN_ALIASES
    };
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
"[project]/open-sse/services/thinkingBudget.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Thinking Budget Control — Phase 2
 *
 * Provides proxy-level control over AI thinking/reasoning budgets.
 * Modes: auto, passthrough, custom, adaptive
 */ // Thinking budget modes
__turbopack_context__.s([
    "DEFAULT_THINKING_CONFIG",
    ()=>DEFAULT_THINKING_CONFIG,
    "EFFORT_BUDGETS",
    ()=>EFFORT_BUDGETS,
    "THINKING_LEVEL_MAP",
    ()=>THINKING_LEVEL_MAP,
    "ThinkingMode",
    ()=>ThinkingMode,
    "applyThinkingBudget",
    ()=>applyThinkingBudget,
    "ensureThinkingConfig",
    ()=>ensureThinkingConfig,
    "getThinkingBudgetConfig",
    ()=>getThinkingBudgetConfig,
    "hasThinkingCapableModel",
    ()=>hasThinkingCapableModel,
    "hydrateThinkingBudgetConfig",
    ()=>hydrateThinkingBudgetConfig,
    "normalizeThinkingLevel",
    ()=>normalizeThinkingLevel,
    "setThinkingBudgetConfig",
    ()=>setThinkingBudgetConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
const ThinkingMode = {
    AUTO: "auto",
    PASSTHROUGH: "passthrough",
    CUSTOM: "custom",
    ADAPTIVE: "adaptive"
};
;
const EFFORT_BUDGETS = {
    none: 0,
    low: 1024,
    medium: 10240,
    high: 131072,
    max: 131072,
    xhigh: 131072
};
const THINKING_LEVEL_MAP = {
    none: 0,
    low: 4096,
    medium: 8192,
    high: 24576,
    max: 131072,
    xhigh: 131072
};
const DEFAULT_THINKING_CONFIG = {
    mode: ThinkingMode.PASSTHROUGH,
    customBudget: 10240,
    effortLevel: "medium"
};
// In-memory config (loaded from DB on startup, or default).
//
// Backed by globalThis so the singleton is shared across the SEPARATE webpack
// module graphs Next.js builds for `instrumentation.ts` (boot-time hydration via
// hydrateThinkingBudgetConfig) and the app-route / open-sse executors (per-request
// reads in base.ts). A plain module-level `let` is DUPLICATED per graph, so the
// boot hydration would land on the instrumentation graph's copy and never reach
// base.ts — exactly the #5312 fix-A break proven on the VPS. Mirrors the same
// globalThis pattern systemPrompt.ts already uses for the Global System Prompt (#2470).
const GLOBAL_KEY = "__omniroute_thinkingBudget_config__";
const _store = globalThis;
function getConfig() {
    if (!_store[GLOBAL_KEY]) {
        _store[GLOBAL_KEY] = {
            ...DEFAULT_THINKING_CONFIG
        };
    }
    return _store[GLOBAL_KEY];
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function getStringField(record, key) {
    const value = record[key];
    return typeof value === "string" ? value : "";
}
function setThinkingBudgetConfig(config) {
    _store[GLOBAL_KEY] = {
        ...DEFAULT_THINKING_CONFIG,
        ...config
    };
}
function getThinkingBudgetConfig() {
    return {
        ...getConfig()
    };
}
function hydrateThinkingBudgetConfig(settings) {
    const tb = toRecord(settings).thinkingBudget;
    if (tb && typeof tb === "object" && !Array.isArray(tb)) {
        setThinkingBudgetConfig(tb);
        return true;
    }
    return false;
}
function normalizeThinkingLevel(body) {
    if (!body || typeof body !== "object") return body;
    const result = {
        ...body
    };
    // Handle top-level thinkingLevel or thinking_level string fields
    const levelStr = result.thinkingLevel || result.thinking_level;
    if (typeof levelStr === "string" && THINKING_LEVEL_MAP[levelStr.toLowerCase()] !== undefined) {
        const rawBudget = THINKING_LEVEL_MAP[levelStr.toLowerCase()];
        const budget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capThinkingBudget"])(getStringField(result, "model"), rawBudget);
        // Convert to Claude thinking format as canonical representation
        result.thinking = {
            type: budget > 0 ? "enabled" : "disabled",
            budget_tokens: budget
        };
        delete result.thinkingLevel;
        delete result.thinking_level;
    }
    // Handle Gemini's generationConfig.thinkingConfig.thinkingLevel
    const generationConfig = toRecord(result.generationConfig);
    const thinkingConfig = toRecord(generationConfig.thinkingConfig);
    const thinkingConfigSnake = toRecord(generationConfig.thinking_config);
    const geminiLevel = thinkingConfig.thinkingLevel || thinkingConfigSnake.thinkingLevel;
    if (typeof geminiLevel === "string" && THINKING_LEVEL_MAP[geminiLevel.toLowerCase()] !== undefined) {
        const rawBudget = THINKING_LEVEL_MAP[geminiLevel.toLowerCase()];
        const budget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capThinkingBudget"])(getStringField(result, "model"), rawBudget);
        result.generationConfig = {
            ...generationConfig,
            thinkingConfig: {
                ...thinkingConfig,
                thinkingBudget: budget
            }
        };
        // Clean up string variants
        const nextGenerationConfig = result.generationConfig;
        const nextThinkingConfig = toRecord(nextGenerationConfig.thinkingConfig);
        if (Object.keys(nextThinkingConfig).length > 0) {
            delete nextThinkingConfig.thinkingLevel;
            nextGenerationConfig.thinkingConfig = nextThinkingConfig;
        }
        if ("thinking_config" in nextGenerationConfig) {
            delete nextGenerationConfig.thinking_config;
        }
    }
    return result;
}
function ensureThinkingConfig(body) {
    if (!body || typeof body !== "object") return body;
    const bodyRecord = body;
    const model = getStringField(bodyRecord, "model");
    // Only auto-inject for models with -thinking suffix
    if (!model.endsWith("-thinking")) return body;
    // If thinking config already present, don't override
    if (bodyRecord.thinking) return body;
    const result = {
        ...bodyRecord
    };
    result.thinking = {
        type: "enabled",
        budget_tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultThinkingBudget"])(model) || EFFORT_BUDGETS.medium
    };
    return result;
}
function applyThinkingBudget(body, config = null) {
    const cfg = config || getConfig();
    if (!body || typeof body !== "object") return body;
    // Early exit: strip ALL reasoning/thinking params for models that don't support them.
    // Provider-specific Cloud Code restrictions should be handled at the executor boundary.
    const bodyRecord = body;
    const modelStr = typeof bodyRecord.model === "string" ? bodyRecord.model : "";
    if (modelStr && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supportsReasoning"])(modelStr)) {
        return stripThinkingConfig(body);
    }
    // Pre-processing: convert string thinkingLevel to numeric budget
    let processed = normalizeThinkingLevel(body);
    // Pre-processing: auto-inject thinking config for -thinking suffix models
    processed = ensureThinkingConfig(processed);
    switch(cfg.mode){
        case ThinkingMode.AUTO:
            return stripThinkingConfig(processed);
        case ThinkingMode.PASSTHROUGH:
            return processed;
        case ThinkingMode.CUSTOM:
            return setCustomBudget(processed, cfg.customBudget ?? DEFAULT_THINKING_CONFIG.customBudget);
        case ThinkingMode.ADAPTIVE:
            return applyAdaptiveBudget(processed, cfg);
        default:
            return processed;
    }
}
/**
 * AUTO mode: strip all thinking configuration, let provider decide
 */ function stripThinkingConfig(body) {
    const result = {
        ...toRecord(body)
    };
    // Claude format
    delete result.thinking;
    // OpenAI format
    delete result.reasoning_effort;
    delete result.reasoning;
    // Claude Code output_config.effort — strip the effort hint too, otherwise the
    // claude→openai translator re-injects reasoning_effort downstream (#3258).
    if (result.output_config && typeof result.output_config === "object") {
        const outputConfig = {
            ...toRecord(result.output_config)
        };
        delete outputConfig.effort;
        if (Object.keys(outputConfig).length === 0) {
            delete result.output_config;
        } else {
            result.output_config = outputConfig;
        }
    }
    // Gemini format
    if (result.generationConfig) {
        const generationConfig = {
            ...toRecord(result.generationConfig)
        };
        delete generationConfig.thinking_config;
        delete generationConfig.thinkingConfig;
        result.generationConfig = generationConfig;
    }
    return result;
}
/**
 * CUSTOM mode: set exact budget tokens
 */ function setCustomBudget(body, budget) {
    const result = {
        ...toRecord(body)
    };
    // If body already has thinking config in Claude format, update it
    if (result.thinking || hasThinkingCapableModel(result)) {
        result.thinking = {
            type: budget > 0 ? "enabled" : "disabled",
            budget_tokens: budget
        };
    }
    // OpenAI reasoning_effort mapping.
    // GPT-5/Codex accepts xhigh for the top tier; keep full budget aligned.
    if (result.reasoning_effort !== undefined || result.reasoning !== undefined) {
        if (budget <= 0) {
            delete result.reasoning_effort;
            delete result.reasoning;
        } else if (budget <= 1024) {
            result.reasoning_effort = "low";
        } else if (budget <= 10240) {
            result.reasoning_effort = "medium";
        } else if (budget < 131072) {
            result.reasoning_effort = "high";
        } else {
            result.reasoning_effort = "xhigh";
        }
    }
    // Gemini thinking_config
    const generationConfig = toRecord(result.generationConfig);
    if (generationConfig.thinking_config || generationConfig.thinkingConfig) {
        result.generationConfig = {
            ...generationConfig,
            thinking_config: {
                thinking_budget: budget
            }
        };
    }
    return result;
}
/**
 * ADAPTIVE mode: scale budget based on request complexity
 */ function applyAdaptiveBudget(body, cfg) {
    const bodyRecord = toRecord(body);
    const messages = Array.isArray(bodyRecord.messages) ? bodyRecord.messages : Array.isArray(bodyRecord.input) ? bodyRecord.input : [];
    const messageCount = messages.length;
    const tools = Array.isArray(bodyRecord.tools) ? bodyRecord.tools : [];
    const toolCount = tools.length;
    // Get last user message length
    let lastMsgLength = 0;
    for(let i = messages.length - 1; i >= 0; i--){
        const msg = messages[i];
        const msgRecord = toRecord(msg);
        if (msgRecord.role === "user") {
            lastMsgLength = typeof msgRecord.content === "string" ? msgRecord.content.length : JSON.stringify(msgRecord.content || "").length;
            break;
        }
    }
    // Calculate multiplier
    let multiplier = 1.0;
    if (messageCount > 10) multiplier += 0.5;
    if (toolCount > 3) multiplier += 0.5;
    if (lastMsgLength > 2000) multiplier += 0.3;
    const baseBudget = EFFORT_BUDGETS[typeof cfg.effortLevel === "string" ? cfg.effortLevel : "medium"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultThinkingBudget"])(getStringField(bodyRecord, "model")) || EFFORT_BUDGETS.medium;
    const budget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["capThinkingBudget"])(getStringField(bodyRecord, "model"), Math.ceil(baseBudget * multiplier));
    return setCustomBudget(body, budget);
}
function hasThinkingCapableModel(body) {
    const model = getStringField(toRecord(body), "model");
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(model);
    if (resolved.supportsThinking === true) return true;
    if (resolved.supportsThinking === false) return false;
    return model.includes("claude") || model.includes("o1") || model.includes("o3") || model.includes("o4") || model.includes("gemini") || model.endsWith("-thinking") || model.includes("thinking");
}
}),
"[project]/open-sse/services/openrouterFreeWindow.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearFreeWindowState",
    ()=>clearFreeWindowState,
    "correctFromRateLimitHeaders",
    ()=>correctFromRateLimitHeaders,
    "getFreeWindowStatus",
    ()=>getFreeWindowStatus,
    "isFreeVariantModel",
    ()=>isFreeVariantModel,
    "recordFreeWindowAttempt",
    ()=>recordFreeWindowAttempt,
    "resolveAccountKey",
    ()=>resolveAccountKey,
    "setPurchasedTier",
    ()=>setPurchasedTier
]);
/**
 * openrouterFreeWindow.ts — OpenRouter `:free`-variant local window tracker (#6842)
 *
 * OpenRouter's official monitoring API (`/api/v1/key`, `/api/v1/credits`) reports
 * USD spend, never request counts — so the `:free`-model per-account request
 * windows (docs/reference/FREE_TIERS.md) cannot be read from those endpoints.
 * This module tracks them locally instead:
 *
 *   - A UTC-day counter: 50 requests/day at $0 all-time purchased, 1000/day
 *     once $10+ has been purchased (operator-overridable via setPurchasedTier).
 *   - A 20 RPM rolling window (true rolling — timestamps pruned to the last 60s,
 *     not a fixed-bucket reset).
 *
 * Bucketed by ACCOUNT, not by connection/key — multiple OmniRoute connections
 * that share one upstream OpenRouter account must share one window. OmniRoute's
 * `provider_connections` are per-key, so callers resolve an account bucket key
 * via `resolveAccountKey()`: an explicit `providerSpecificData.openrouterAccountKey`
 * groups keys under one account; otherwise each connection gets its own bucket
 * (safe default — never worse than no tracking).
 *
 * State is in-memory only (module-level Map, not persisted). This is a
 * deliberate MVP scope: local counting is inherently best-effort (drifts on
 * process restart or multi-instance deployments sharing one OpenRouter
 * account) and is corrected from upstream `X-RateLimit-*` response headers on
 * every 429, which is authoritative. See the plan's "Risks" section — SQLite
 * persistence is a possible follow-up, not required for correctness here.
 */ const RPM_WINDOW_MS = 60_000;
const RPM_LIMIT = 20;
const DAILY_LIMIT_BASE = 50;
const DAILY_LIMIT_PURCHASED = 1000;
const accountWindows = new Map();
function utcDayKey(now) {
    return new Date(now).toISOString().slice(0, 10);
}
function nextUtcMidnightIso(now) {
    const date = new Date(now);
    const next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0);
    return new Date(next).toISOString();
}
function isFreeVariantModel(model) {
    return typeof model === "string" && model.endsWith(":free");
}
function resolveAccountKey(connectionId, connection) {
    const psd = connection?.providerSpecificData;
    const explicit = typeof psd?.openrouterAccountKey === "string" ? psd.openrouterAccountKey : "";
    return explicit.trim().length > 0 ? `acct:${explicit.trim()}` : `conn:${connectionId}`;
}
function getOrInitState(accountKey, now) {
    const dayKey = utcDayKey(now);
    const existing = accountWindows.get(accountKey);
    if (existing && existing.dayKey === dayKey) return existing;
    const fresh = {
        dayKey,
        dayCount: 0,
        purchasedAtLeast10: existing?.purchasedAtLeast10 ?? false,
        requestTimestamps: [],
        serverDailyLimit: null,
        serverDailyRemaining: null,
        serverResetAtMs: null
    };
    accountWindows.set(accountKey, fresh);
    return fresh;
}
function pruneRpmWindow(state, now) {
    const cutoff = now - RPM_WINDOW_MS;
    state.requestTimestamps = state.requestTimestamps.filter((ts)=>ts > cutoff);
}
function setPurchasedTier(accountKey, purchasedAtLeast10) {
    const state = getOrInitState(accountKey, Date.now());
    state.purchasedAtLeast10 = purchasedAtLeast10;
}
function recordFreeWindowAttempt(accountKey, now = Date.now()) {
    const state = getOrInitState(accountKey, now);
    pruneRpmWindow(state, now);
    state.dayCount += 1;
    state.requestTimestamps.push(now);
}
function getHeader(headers, name) {
    if (typeof headers.get === "function") {
        return headers.get(name);
    }
    const record = headers;
    return record[name] ?? record[name.toLowerCase()] ?? null;
}
function parseResetMsFromHeader(reset) {
    if (reset === null) return null;
    const resetNum = Number(reset);
    if (!Number.isFinite(resetNum)) return null;
    return resetNum > 10_000_000_000 ? resetNum : resetNum * 1000;
}
function parseRetryAfterMs(retryAfter, now) {
    if (retryAfter === null) return null;
    const seconds = Number(retryAfter);
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    return now + seconds * 1000;
}
function resolveResetMs(reset, retryAfter, now) {
    const headerResetMs = parseResetMsFromHeader(reset);
    const retryAfterMs = parseRetryAfterMs(retryAfter, now);
    if (retryAfterMs === null) return headerResetMs;
    return headerResetMs === null ? retryAfterMs : Math.max(headerResetMs, retryAfterMs);
}
function correctFromRateLimitHeaders(accountKey, headers, now = Date.now()) {
    const state = getOrInitState(accountKey, now);
    const limit = getHeader(headers, "x-ratelimit-limit");
    const remaining = getHeader(headers, "x-ratelimit-remaining");
    if (limit !== null && Number.isFinite(Number(limit))) {
        state.serverDailyLimit = Number(limit);
    }
    if (remaining !== null && Number.isFinite(Number(remaining))) {
        state.serverDailyRemaining = Number(remaining);
    }
    const resetMs = resolveResetMs(getHeader(headers, "x-ratelimit-reset"), getHeader(headers, "retry-after"), now);
    if (resetMs !== null) {
        state.serverResetAtMs = resetMs;
    }
}
function resolveDailyLimit(state) {
    if (state.serverDailyLimit !== null) return state.serverDailyLimit;
    return state.purchasedAtLeast10 ? DAILY_LIMIT_PURCHASED : DAILY_LIMIT_BASE;
}
function resolveDailyUsed(state, dailyLimit) {
    if (state.serverDailyRemaining !== null) {
        return Math.max(0, dailyLimit - state.serverDailyRemaining);
    }
    return state.dayCount;
}
function getFreeWindowStatus(accountKey, now = Date.now()) {
    const state = getOrInitState(accountKey, now);
    pruneRpmWindow(state, now);
    const dailyLimit = resolveDailyLimit(state);
    const dailyUsed = resolveDailyUsed(state, dailyLimit);
    const dailyResetAt = state.serverResetAtMs !== null ? new Date(state.serverResetAtMs).toISOString() : nextUtcMidnightIso(now);
    const rpmUsed = state.requestTimestamps.length;
    return {
        dailyLimit,
        dailyUsed,
        dailyRemaining: Math.max(0, dailyLimit - dailyUsed),
        dailyResetAt,
        rpmLimit: RPM_LIMIT,
        rpmUsed,
        rpmRemaining: Math.max(0, RPM_LIMIT - rpmUsed)
    };
}
function clearFreeWindowState() {
    accountWindows.clear();
}
}),
"[project]/open-sse/services/wafRateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configureWafRateLimit",
    ()=>configureWafRateLimit,
    "gateOutboundRequest",
    ()=>gateOutboundRequest,
    "getWafRateLimitConfig",
    ()=>getWafRateLimitConfig,
    "resetWafRateLimit",
    ()=>resetWafRateLimit
]);
/**
 * wafRateLimit.ts — Burst guard for agentrouter.org upstream WAF.
 *
 * The agentrouter.org gateway runs a content-filter WAF that becomes more
 * aggressive after bursts of requests from the same IP/key, returning
 * `400 content-blocked` for requests that would normally pass. After ~5-10
 * seconds of cooldown the filter relaxes again.
 *
 * To avoid tripping the WAF, we serialize outbound calls per provider and
 * enforce a minimum inter-request gap. The defaults are conservative and
 * meant to be a safety net — the upstream request rate from Claude Code is
 * inherently low (one human-paced request at a time), so this guard should
 * not affect normal traffic.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [app-route] (ecmascript)");
;
const state = new Map();
const DEFAULT_CONFIG = {
    // 500ms is enough to prevent the burst-sensitive WAF from activating
    // while staying well below human perception of latency.
    minGapMs: 500
};
let config = {
    ...DEFAULT_CONFIG
};
function configureWafRateLimit(overrides) {
    config = {
        ...config,
        ...overrides
    };
}
function getWafRateLimitConfig() {
    return {
        ...config
    };
}
async function gateOutboundRequest(bucketKey) {
    const now = Date.now();
    const bucket = state.get(bucketKey);
    if (!bucket) {
        state.set(bucketKey, {
            lastSentAt: now
        });
        return;
    }
    const elapsed = now - bucket.lastSentAt;
    const wait = config.minGapMs - elapsed;
    if (wait > 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["log"]?.debug?.("WAF_RATE_LIMIT", `Throttling outbound to ${bucketKey} — waiting ${wait}ms (min gap ${config.minGapMs}ms)`);
        await new Promise((resolve)=>setTimeout(resolve, wait));
    }
    state.set(bucketKey, {
        lastSentAt: Date.now()
    });
}
function resetWafRateLimit() {
    state.clear();
}
}),
"[project]/open-sse/services/sessionPool/fingerprintRotator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * FingerprintRotator — Browser fingerprint profiles for session diversity
 *
 * Each profile mimics a real browser user-agent + Sec-CH-UA headers.
 * Rotating through these prevents providers from associating requests
 * to a single browser identity for rate-limiting purposes.
 */ __turbopack_context__.s([
    "FingerprintRotator",
    ()=>FingerprintRotator
]);
// ─── Profiles ──────────────────────────────────────────────────────────────
const PROFILES = [
    {
        id: "chrome-mac",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
        acceptLanguage: "en-US,en;q=0.9",
        secChUa: '"Not-A.Brand";v="99", "Chromium";v="149", "Google Chrome";v="149"',
        secChUaPlatform: '"macOS"',
        secChUaMobile: "?0"
    },
    {
        id: "chrome-linux",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
        acceptLanguage: "en-US,en;q=0.9",
        secChUa: '"Not-A.Brand";v="99", "Chromium";v="149", "Google Chrome";v="149"',
        secChUaPlatform: '"Linux"',
        secChUaMobile: "?0"
    },
    {
        id: "chrome-win",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
        acceptLanguage: "en-US,en;q=0.9",
        secChUa: '"Not-A.Brand";v="99", "Chromium";v="149", "Google Chrome";v="149"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: "?0"
    },
    {
        id: "firefox-mac",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:152.0) Gecko/20100101 Firefox/152.0",
        acceptLanguage: "en-US,en;q=0.9"
    },
    {
        id: "firefox-linux",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0",
        acceptLanguage: "en-US,en;q=0.9"
    },
    {
        id: "safari-mac",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
        acceptLanguage: "en-US,en;q=0.9"
    },
    {
        id: "edge-mac",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
        acceptLanguage: "en-US,en;q=0.9",
        secChUa: '"Not-A.Brand";v="99", "Chromium";v="149", "Microsoft Edge";v="149"',
        secChUaPlatform: '"macOS"',
        secChUaMobile: "?0"
    },
    {
        id: "edge-win",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0",
        acceptLanguage: "en-US,en;q=0.9",
        secChUa: '"Not-A.Brand";v="99", "Chromium";v="149", "Microsoft Edge";v="149"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: "?0"
    }
];
class FingerprintRotator {
    index = 0;
    /** Get the next profile in round-robin order */ next() {
        const profile = PROFILES[this.index % PROFILES.length];
        this.index++;
        return profile;
    }
    /** Get a random profile */ random() {
        return PROFILES[Math.floor(Math.random() * PROFILES.length)];
    }
    /** Reset the round-robin counter */ reset() {
        this.index = 0;
    }
    /** Number of available profiles */ get count() {
        return PROFILES.length;
    }
    /** Build a Headers object from a fingerprint (with optional extras) */ buildHeaders(fingerprint, extra) {
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": fingerprint.acceptLanguage ?? "en-US,en;q=0.9",
            "User-Agent": fingerprint.userAgent,
            ...extra
        };
        if (fingerprint.secChUa) {
            headers["Sec-CH-UA"] = fingerprint.secChUa;
            headers["Sec-CH-UA-Mobile"] = fingerprint.secChUaMobile ?? "?0";
            headers["Sec-CH-UA-Platform"] = fingerprint.secChUaPlatform ?? '"Windows"';
        }
        return headers;
    }
    /** List all profiles */ listAll() {
        return [
            ...PROFILES
        ];
    }
}
}),
"[project]/open-sse/services/sessionPool/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Session — State machine for one pool session
 *
 * Lifecycle:
 *   active ──(429)──▶ cooldown ──(timeout)──▶ active
 *   active ──(5xx)──▶ dead ──(pruned)──▶ removed
 *   active ──(TTL)──▶ replaced with fresh session
 *
 * Each session tracks:
 *   - Fingerprint (UA + headers for one browser identity)
 *   - Request metrics (total, success, fail, inflight)
 *   - Cooldown state (exponential backoff on rate limits)
 */ __turbopack_context__.s([
    "Session",
    ()=>Session
]);
class Session {
    cooldownBase;
    cooldownMax;
    cooldownJitter;
    id;
    fingerprint;
    createdAt;
    status;
    inflight;
    totalRequests;
    successfulRequests;
    failedRequests;
    consecutiveFails;
    cooldownUntil;
    lastUsedAt;
    constructor(fingerprint, cooldownBase, cooldownMax, cooldownJitter){
        this.cooldownBase = cooldownBase;
        this.cooldownMax = cooldownMax;
        this.cooldownJitter = cooldownJitter;
        this.status = "active";
        this.inflight = 0;
        this.totalRequests = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
        this.consecutiveFails = 0;
        this.cooldownUntil = 0;
        this.lastUsedAt = 0;
        this.id = `sess-${fingerprint.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        this.fingerprint = fingerprint;
        this.createdAt = Date.now();
    }
    /** Whether this session can accept requests right now */ get isAvailable() {
        if (this.status === "dead") return false;
        if (this.status === "cooldown") {
            if (Date.now() >= this.cooldownUntil) {
                // Auto-recover from cooldown
                this.status = "active";
                this.consecutiveFails = 0;
                return true;
            }
            return false;
        }
        return true;
    }
    /** Mark a successful request */ markSuccess() {
        this.successfulRequests++;
        this.consecutiveFails = 0;
    }
    /** Enter cooldown with exponential backoff */ markCooldown() {
        this.consecutiveFails++;
        const base = Math.min(this.cooldownBase * Math.pow(2, this.consecutiveFails - 1), this.cooldownMax);
        const jitter = Math.random() * this.cooldownJitter;
        this.cooldownUntil = Date.now() + base + jitter;
        this.status = "cooldown";
    }
    /** Mark session as dead (non-recoverable error) */ markDead() {
        this.status = "dead";
    }
    /** Increment inflight counter and mark as used */ acquire() {
        this.inflight++;
        this.totalRequests++;
        this.lastUsedAt = Date.now();
    }
    /** Decrement inflight counter */ release() {
        this.inflight = Math.max(0, this.inflight - 1);
    }
    /** Milliseconds remaining in cooldown */ get cooldownRemaining() {
        if (this.status !== "cooldown") return 0;
        return Math.max(0, this.cooldownUntil - Date.now());
    }
    /** Age in milliseconds */ get age() {
        return Date.now() - this.createdAt;
    }
    /** Build headers for this session's fingerprint */ buildHeaders(extra) {
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": this.fingerprint.acceptLanguage ?? "en-US,en;q=0.9",
            "User-Agent": this.fingerprint.userAgent,
            ...extra
        };
        if (this.fingerprint.secChUa) {
            headers["Sec-CH-UA"] = this.fingerprint.secChUa;
            headers["Sec-CH-UA-Mobile"] = this.fingerprint.secChUaMobile ?? "?0";
            headers["Sec-CH-UA-Platform"] = this.fingerprint.secChUaPlatform ?? '"Windows"';
        }
        return headers;
    }
}
}),
"[project]/open-sse/services/sessionPool/sessionFactory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SessionFactory",
    ()=>SessionFactory
]);
/**
 * SessionFactory — Creates initialized Session instances
 *
 * For zero-auth providers (Pollinations, Puter): just assigns a fingerprint.
 * For cookie-based providers (ChatGPT Web, DeepSeek Web): would launch
 * headless Playwright, solve Turnstile, and extract cookies.
 *
 * Currently only zero-auth is implemented. Cookie-based provider support
 * is planned for Phase 3.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$fingerprintRotator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/fingerprintRotator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/session.ts [app-route] (ecmascript)");
;
;
class SessionFactory {
    config;
    rotator;
    constructor(config){
        this.config = config;
        this.rotator = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$fingerprintRotator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FingerprintRotator"]();
    }
    /**
   * Create a new session with the next available fingerprint.
   * For zero-auth providers, this is a lightweight operation
   * (just picks a fingerprint). For cookie-based providers this
   * would involve Playwright browser automation.
   */ createSession() {
        // Round-robin so each session in a warm pool gets a distinct fingerprint
        // (a pool of look-alike sessions defeats the purpose). The rotator still
        // exposes random() for callers that want unpredictability over time.
        const fingerprint = this.rotator.next();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Session"](fingerprint, this.config.cooldownBase, this.config.cooldownMax, this.config.cooldownJitter);
    }
    /** Reset the fingerprint rotator (e.g., after config change) */ resetRotator() {
        this.rotator.reset();
    }
    /** Number of available fingerprint profiles */ get profileCount() {
        return this.rotator.count;
    }
    /** Build headers from session fingerprint */ buildHeaders(session, extra) {
        return session.buildHeaders(extra);
    }
}
}),
"[project]/open-sse/services/sessionPool/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Session Pool — Type Definitions
 *
 * Core types for the anonymous session pool system:
 *   SessionPool  → manages N sessions, each with a unique browser fingerprint
 *   Fingerprint  → UA + headers for one browser-like identity
 *   Session      → state machine tracking one session through its lifecycle
 *   PoolConfig   → hot-reloadable pool parameters
 *   PoolStats    → real-time pool health snapshot
 */ // ─── Fingerprint Types ─────────────────────────────────────────────────────
__turbopack_context__.s([
    "DEFAULT_POOL_CONFIG",
    ()=>DEFAULT_POOL_CONFIG
]);
const DEFAULT_POOL_CONFIG = {
    minSessions: 6,
    maxSessions: 20,
    cooldownBase: 1_000,
    cooldownMax: 30_000,
    cooldownJitter: 5_000,
    requestTimeout: 30_000,
    requestJitter: 50
};
}),
"[project]/open-sse/services/sessionPool/sessionPool.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * SessionPool — Pool manager for anonymous web sessions
 *
 * Manages N sessions across N browser fingerprints, distributing requests
 * round-robin to avoid rate-limiting any single "browser identity."
 *
 * Key behaviors:
 *   - acquire(): Returns the next available session (round-robin)
 *   - reportSuccess(session): Updates metrics, marks session healthy
 *   - reportFailure(session, status): Cooldown on 429, dead on 5xx
 *   - Scalability: Round-robin across sessions prevents one session from
 *     being overused while others sit idle.
 *   - Auto-heal: Sessions in cooldown auto-recover after the backoff window.
 *   - Self-repair: Dead sessions are replaced on next acquire if below maxSessions.
 *   - Thread-safe for concurrent request patterns (each acquire/release pair
 *     is atomic within one async flow).
 *
 * Usage:
 *   const pool = new SessionPool("pollinations", poolConfig, factory);
 *   await pool.ensureMinSessions();
 *   const session = pool.acquire();
 *   try {
 *     const res = await fetch(url, { headers: session.buildHeaders() });
 *     if (!res.ok && res.status === 429) pool.reportCooldown(session);
 *     else pool.reportSuccess(session);
 *   } catch { pool.reportDead(session); }
 *   finally { session.release(); }
 */ __turbopack_context__.s([
    "SessionPool",
    ()=>SessionPool
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$timers$2f$promises__$5b$external$5d$__$28$node$3a$timers$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:timers/promises [external] (node:timers/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/sessionFactory.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/types.ts [app-route] (ecmascript)");
;
;
;
class SessionPool {
    provider;
    poolId;
    createdAt;
    sessions = [];
    index = 0;
    config;
    factory;
    // Aggregate stats
    totalRequests = 0;
    successfulRequests = 0;
    rate429count = 0;
    otherErrors = 0;
    // Track throughput
    startTime = Date.now();
    lastLog = 0;
    constructor(provider, config, factory){
        this.provider = provider;
        this.poolId = `pool-${provider}-${Date.now().toString(36)}`;
        this.createdAt = Date.now();
        this.config = {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_POOL_CONFIG"],
            ...config
        };
        this.factory = factory ?? new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SessionFactory"](this.config);
    }
    // ─── Pool Lifecycle ──────────────────────────────────────────────────
    /** Ensure the pool has at least minSessions ready */ async ensureMinSessions() {
        const needed = this.config.minSessions - this.sessions.length;
        if (needed <= 0) return;
        const promises = [];
        for(let i = 0; i < needed; i++){
            promises.push(Promise.resolve(this.createSession()));
        }
        await Promise.allSettled(promises);
    }
    /** Warm up the pool to a specific size (bypasses minSessions limit) */ async warmUp(count) {
        const target = Math.min(count, this.config.maxSessions);
        const needed = target - this.sessions.length;
        if (needed <= 0) return;
        const promises = [];
        for(let i = 0; i < needed; i++){
            promises.push(Promise.resolve(this.createSession()));
        }
        await Promise.allSettled(promises);
    }
    /** Graceful shutdown — mark all sessions dead */ async shutdown() {
        for (const s of this.sessions){
            s.markDead();
        }
        this.sessions = [];
    }
    // ─── Acquire / Release ───────────────────────────────────────────────
    /**
   * Acquire the next available session (round-robin with availability check).
   * Returns null if no sessions are available (all on cooldown/dead).
   */ acquire() {
        // First pass: try round-robin from current index
        if (this.sessions.length === 0) return null;
        const startIdx = this.index % this.sessions.length;
        for(let i = 0; i < this.sessions.length; i++){
            const idx = (startIdx + i) % this.sessions.length;
            const session = this.sessions[idx];
            if (session.isAvailable) {
                // Skip sessions that hit max inflight limit (safety valve)
                // For anonymous web providers we allow high concurrency per session
                this.index = (idx + 1) % this.sessions.length;
                session.acquire();
                this.totalRequests++;
                return session;
            }
        }
        // No ready sessions — try to create a new one if under max
        if (this.sessions.length < this.config.maxSessions) {
            const session = this.createSession();
            session.acquire();
            this.totalRequests++;
            return session;
        }
        // Last resort: wait for the nearest cooldown to expire (caller should retry)
        return null;
    }
    /**
   * Report a successful request. Updates metrics pool-wide and per-session.
   */ reportSuccess(session) {
        session.markSuccess();
        this.successfulRequests++;
    }
    /**
   * Report a rate-limit (429). Puts the session into exponential-backoff cooldown.
   */ reportCooldown(session) {
        session.markCooldown();
        this.rate429count++;
        this.maybeLog();
    }
    /**
   * Report a non-recoverable error. Marks session as dead.
   */ reportDead(session) {
        session.markDead();
        this.otherErrors++;
    }
    // ─── Health / Stats ──────────────────────────────────────────────────
    /** Count of available (active, not in cooldown) sessions */ get availableCount() {
        return this.sessions.filter((s)=>s.isAvailable).length;
    }
    /** Number of sessions currently in cooldown */ get cooldownCount() {
        return this.sessions.filter((s)=>s.status === "cooldown").length;
    }
    /** Number of dead sessions */ get deadCount() {
        return this.sessions.filter((s)=>s.status === "dead").length;
    }
    /** Total sessions managed */ get totalCount() {
        return this.sessions.length;
    }
    /** Current throughput in req/s */ get currentThroughput() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return elapsed > 0 ? this.totalRequests / elapsed : 0;
    }
    /** Snapshot for dashboard/API */ getStats() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return {
            provider: this.provider,
            sessions: {
                total: this.sessions.length,
                active: this.availableCount,
                cooldown: this.cooldownCount,
                dead: this.deadCount
            },
            requests: {
                total: this.totalRequests,
                success: this.successfulRequests,
                rate429: this.rate429count,
                otherErrors: this.otherErrors
            },
            throughput: this.currentThroughput.toFixed(1),
            successRate: this.totalRequests > 0 ? (this.successfulRequests / this.totalRequests * 100).toFixed(1) : "100.0",
            elapsed: elapsed.toFixed(0)
        };
    }
    /** Per-session details */ getSessionDetails() {
        return this.sessions.map((s)=>({
                id: s.id,
                fingerprint: s.fingerprint.id,
                status: s.status,
                totalRequests: s.totalRequests,
                successfulRequests: s.successfulRequests,
                successRate: s.totalRequests > 0 ? (s.successfulRequests / s.totalRequests * 100).toFixed(1) : "100.0",
                inflight: s.inflight,
                cooldownRemaining: s.cooldownRemaining > 0 ? `${(s.cooldownRemaining / 1000).toFixed(1)}s` : "0s",
                age: `${(s.age / 1000).toFixed(0)}s`
            }));
    }
    /** As acquire(), but blocks until a session is available */ async acquireBlocking(timeoutMs = 10_000) {
        const deadline = Date.now() + timeoutMs;
        // Fast path
        const fast = this.acquire();
        if (fast) return fast;
        // Wait-loop with backoff (50ms → 200ms)
        let delay = 50;
        while(Date.now() < deadline){
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$timers$2f$promises__$5b$external$5d$__$28$node$3a$timers$2f$promises$2c$__cjs$29$__["setTimeout"])(delay);
            const session = this.acquire();
            if (session) return session;
            delay = Math.min(delay * 2, 200);
        }
        throw new Error(`[SessionPool:${this.provider}] No session available after ${timeoutMs}ms timeout`);
    }
    /** As acquireBlocking(), but accepts arbitrary function to wrap */ async executeWithSession(fn, timeoutMs = 10_000) {
        const session = await this.acquireBlocking(timeoutMs);
        try {
            const result = await fn(session);
            return result;
        } finally{
            session.release();
        }
    }
    // ─── Internal ────────────────────────────────────────────────────────
    /** Create and register a new session */ createSession() {
        const session = this.factory.createSession();
        this.sessions.push(session);
        return session;
    }
    /** Periodic log of pool health (every 5s) */ maybeLog() {
        const now = Date.now();
        if (now - this.lastLog < 5_000) return;
        this.lastLog = now;
        const stats = this.getStats();
        if (stats.requests.total % 50 === 0) {
        // Rate-limited to avoid log spam
        }
    }
    /** Remove dead sessions and idle sessions older than maxIdleMs */ pruneDeadSessions(maxIdleMs = 300_000) {
        const now = Date.now();
        const before = this.sessions.length;
        this.sessions = this.sessions.filter((s)=>{
            if (s.status === "dead") return false;
            // Prune idle sessions older than maxIdleMs (default 5min)
            if (s.inflight === 0 && s.lastUsedAt > 0 && now - s.lastUsedAt > maxIdleMs) return false;
            return true;
        });
        // If we pruned sessions, ensure minimum
        if (this.sessions.length < before && this.sessions.length < this.config.minSessions) {
            this.ensureMinSessions();
        }
    }
    /** Start periodic pruning (every 60s) */ startAutoPrune(intervalMs = 60_000) {
        const timer = setInterval(()=>this.pruneDeadSessions(), intervalMs);
        timer.unref();
        return timer;
    }
}
}),
"[project]/open-sse/services/sessionPool/poolRegistry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pool Registry — Global registry for active session pools.
 *
 * Provides a rendezvous point between executors (which create pools)
 * and MCP tools / API handlers (which query pool state).
 *
 * Usage (executor side):
 *   PoolRegistry.register("pollinations", myPool);
 *
 * Usage (MCP tool / API side):
 *   const stats = PoolRegistry.getStats("pollinations");
 *   const all   = PoolRegistry.getAllStats();
 */ __turbopack_context__.s([
    "PoolRegistry",
    ()=>PoolRegistry
]);
class PoolRegistryImpl {
    pools = new Map();
    /** Register a pool for a provider. Overwrites any previous pool. */ register(provider, pool) {
        this.pools.set(provider, {
            pool,
            createdAt: Date.now()
        });
    }
    /** Unregister a pool */ unregister(provider) {
        return this.pools.delete(provider);
    }
    /** Get a pool by provider name */ getPool(provider) {
        return this.pools.get(provider)?.pool;
    }
    /** List all registered provider names */ listProviders() {
        return Array.from(this.pools.keys());
    }
    /** Get stats for a specific provider's pool */ getStats(provider) {
        const entry = this.pools.get(provider);
        if (!entry) return null;
        return {
            ...entry.pool.getStats(),
            createdAt: entry.createdAt
        };
    }
    /** Get stats for all registered pools */ getAllStats() {
        const result = [];
        for (const [, entry] of this.pools){
            result.push({
                ...entry.pool.getStats(),
                createdAt: entry.createdAt
            });
        }
        return result;
    }
    /** Get per-session details for a specific provider */ getSessionDetails(provider) {
        const entry = this.pools.get(provider);
        if (!entry) return null;
        return entry.pool.getSessionDetails();
    }
    /** Reset (shutdown + recreate) a pool */ resetPool(provider) {
        const entry = this.pools.get(provider);
        if (!entry) return false;
        entry.pool.shutdown();
        this.pools.delete(provider);
        return true;
    }
    /** Warm up a pool to a target session count */ async warmPool(provider, count) {
        const entry = this.pools.get(provider);
        if (!entry) return false;
        await entry.pool.warmUp(count);
        return true;
    }
    /** Count of registered pools */ get size() {
        return this.pools.size;
    }
}
const PoolRegistry = new PoolRegistryImpl();
}),
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
"[project]/open-sse/services/responsesInputSanitizer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isInternalAssistantMessage",
    ()=>isInternalAssistantMessage,
    "sanitizeResponsesInputItems",
    ()=>sanitizeResponsesInputItems
]);
const INTERNAL_ASSISTANT_PHASES = new Set([
    "commentary"
]);
const SERVER_ITEM_ID_PREFIX_BY_TYPE = {
    function_call: "fc_",
    message: "msg_",
    reasoning: "rs_"
};
const SERVER_ITEM_ID_PATTERN = /^(fc|msg|rs|resp)_/;
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function isResponsesMessageItem(record) {
    return record.type === "message" || !record.type && typeof record.role === "string";
}
function isInternalAssistantMessage(record) {
    if (!isResponsesMessageItem(record)) return false;
    if (record.role !== "assistant") return false;
    const phase = typeof record.phase === "string" ? record.phase.trim().toLowerCase() : "";
    if (!phase) return false;
    // Drop only known internal runtime frames. Visible assistant turns such as
    // `final` and `final_answer` must survive replay for Codex/OpenCode follow-ups.
    return INTERNAL_ASSISTANT_PHASES.has(phase);
}
// OpenAI Responses API enforces two constraints on name fields in input items:
//   1. Max 128 characters
//   2. Must match ^[a-zA-Z0-9_-]+$
// Sanitize after cloning so upstream never sees an invalid name.
function sanitizeFunctionName(name) {
    // Replace any character not in [a-zA-Z0-9_-] with underscore, then truncate.
    return name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
}
function sanitizeInputItemId(record) {
    if (typeof record.id !== "string") return record;
    const type = typeof record.type === "string" ? record.type : "";
    const expectedPrefix = SERVER_ITEM_ID_PREFIX_BY_TYPE[type];
    const hasExpectedPrefix = expectedPrefix ? record.id.startsWith(expectedPrefix) : SERVER_ITEM_ID_PATTERN.test(record.id);
    if (hasExpectedPrefix) return record;
    const next = {
        ...record
    };
    delete next.id;
    return next;
}
function imageUrlToText(value) {
    if (typeof value === "string") return value;
    const record = toRecord(value);
    return typeof record?.url === "string" ? record.url : "";
}
function sanitizeContentPart(part, role) {
    const record = toRecord(part);
    if (!record) return part;
    if (record.type === "image_url") {
        const url = imageUrlToText(record.image_url);
        // `output_text` is only a legal content-part type on assistant-role OUTPUT
        // items. Every other role (user, system, developer, ...) is input-side and
        // must use `input_image` -- otherwise the Codex/Responses backend rejects
        // the replayed history with "Invalid value: 'output_text'" (#8089).
        if (role !== "assistant") {
            const next = {
                type: "input_image",
                image_url: url
            };
            const image = toRecord(record.image_url);
            if (image?.detail !== undefined) next.detail = image.detail;
            return next;
        }
        return {
            type: "output_text",
            text: url ? `[Image: ${url}]` : "[Image]"
        };
    }
    if (role === "assistant" && record.type === "input_image") {
        const url = imageUrlToText(record.image_url);
        return {
            type: "output_text",
            text: url ? `[Image: ${url}]` : "[Image]"
        };
    }
    return part;
}
function sanitizeMessageContent(record) {
    if (!Array.isArray(record.content)) return record;
    const role = typeof record.role === "string" ? record.role.toLowerCase() : "";
    const content = record.content.map((part)=>sanitizeContentPart(part, role));
    return {
        ...record,
        content
    };
}
function sanitizeNestedOutputPart(part) {
    const record = toRecord(part);
    if (!record) return part;
    // `output` on replayed items is an input-side container. Its content uses
    // input content-part types even when the enclosing item originated from an
    // assistant/tool response. Converting an image placeholder to output_text
    // here makes Codex reject the request with the inverse 400.
    if (record.type === "output_text" || record.type === "refusal") {
        const next = {
            ...record,
            type: "input_text"
        };
        if (typeof next.text !== "string") {
            next.text = typeof record.refusal === "string" ? record.refusal : "";
        }
        delete next.annotations;
        delete next.logprobs;
        delete next.obfuscation;
        delete next.refusal;
        return next;
    }
    return sanitizeContentPart(part, "user");
}
function sanitizeOutputContent(record) {
    if (!Array.isArray(record.output)) return record;
    // Some clients replay previous Responses output items inside the next
    // Responses input. In that shape OpenAI validates `input[n].output[m].type`
    // against output content part types, so legacy Chat-style `image_url` parts
    // must be normalized here too, not only in message.content.
    const output = record.output.map(sanitizeNestedOutputPart);
    return {
        ...record,
        output
    };
}
function sanitizeInputItem(item) {
    const record = toRecord(item);
    if (!record) return item;
    let next = sanitizeInputItemId(record);
    if (isResponsesMessageItem(next)) {
        next = sanitizeMessageContent(next);
    }
    next = sanitizeOutputContent(next);
    if ((next.type === "function_call" || next.type === "function_call_output") && typeof next.name === "string" && !/^[a-zA-Z0-9_-]{1,128}$/.test(next.name)) {
        next = {
            ...next,
            name: sanitizeFunctionName(next.name)
        };
    }
    return next;
}
function sanitizeResponsesInputItems(items, clone = true, options = {}) {
    const dropInternalAssistantMessages = options.dropInternalAssistantMessages ?? true;
    const sanitized = [];
    for (const item of items){
        const record = toRecord(item);
        if (dropInternalAssistantMessages && record && isInternalAssistantMessage(record)) {
            continue;
        }
        const cloned = clone ? structuredClone(item) : item;
        sanitized.push(sanitizeInputItem(cloned));
    }
    return sanitized;
}
}),
"[project]/open-sse/services/antigravityClientProfile.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyAntigravityClientProfileHeaders",
    ()=>applyAntigravityClientProfileHeaders,
    "getAntigravityClientProfile",
    ()=>getAntigravityClientProfile,
    "removeHeaderCaseInsensitive",
    ()=>removeHeaderCaseInsensitive,
    "resolveAntigravityClientVersion",
    ()=>resolveAntigravityClientVersion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/antigravityClientProfile.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityVersion.ts [app-route] (ecmascript)");
;
;
;
;
const ABSENT_CONTENT_IDENTITY_HEADERS = [
    "x-client-name",
    "x-client-version",
    "x-machine-id",
    "x-vscode-sessionid",
    "X-Goog-Api-Client",
    "Client-Metadata"
];
function getAntigravityClientProfile(credentials) {
    const fromProviderData = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && !Array.isArray(credentials.providerSpecificData) ? credentials.providerSpecificData.clientProfile : undefined;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeAntigravityClientProfile"])(fromProviderData);
}
function resolveAntigravityClientVersion(profile) {
    return profile === "cli" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAntigravityCliVersion"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAntigravityIdeVersion"])();
}
function removeHeaderCaseInsensitive(headers, name) {
    const lowerName = name.toLowerCase();
    for (const key of Object.keys(headers)){
        if (key.toLowerCase() === lowerName) {
            delete headers[key];
        }
    }
}
function getProjectHeaderValue(body) {
    const project = body && typeof body === "object" ? body.project : null;
    if (typeof project !== "string" || project.trim().length === 0) return null;
    if (project === "test-project" || project === "project-id") return null;
    return project;
}
function applyAntigravityClientProfileHeaders(headers, credentials, body) {
    const profile = getAntigravityClientProfile(credentials);
    const identityHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(profile);
    removeHeaderCaseInsensitive(headers, "User-Agent");
    headers["User-Agent"] = identityHeaders["User-Agent"];
    for (const name of ABSENT_CONTENT_IDENTITY_HEADERS){
        removeHeaderCaseInsensitive(headers, name);
    }
    const project = getProjectHeaderValue(body);
    removeHeaderCaseInsensitive(headers, "x-goog-user-project");
    if (project) {
        headers["x-goog-user-project"] = project;
    }
    return profile;
}
}),
"[project]/open-sse/services/antigravityHeaderScrub.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scrubProxyAndFingerprintHeaders",
    ()=>scrubProxyAndFingerprintHeaders
]);
/**
 * Antigravity header scrubbing.
 *
 * Real Antigravity is a Node.js app. Its outbound HTTP requests never include
 * proxy tracing headers, Stainless SDK headers, or Chromium Sec-Ch-* headers.
 * Sending any of these reveals the request came through a third-party proxy.
 *
 * Based on CLIProxyAPI's ScrubProxyAndFingerprintHeaders (misc/header_utils.go).
 */ const HEADERS_TO_REMOVE = [
    // Proxy tracing
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-forwarded-port",
    "x-real-ip",
    "forwarded",
    "via",
    // Client identity (Stainless SDK — Claude Code specific, not Antigravity)
    "x-title",
    "x-stainless-lang",
    "x-stainless-package-version",
    "x-stainless-os",
    "x-stainless-arch",
    "x-stainless-runtime",
    "x-stainless-runtime-version",
    "x-stainless-timeout",
    "x-stainless-retry-count",
    "x-stainless-helper-method",
    "http-referer",
    "referer",
    // Browser / Chromium fingerprint (Electron clients, NOT Node.js)
    "sec-ch-ua",
    "sec-ch-ua-mobile",
    "sec-ch-ua-platform",
    "sec-fetch-mode",
    "sec-fetch-site",
    "sec-fetch-dest",
    "priority",
    // Encoding: Antigravity (Node.js) sends "gzip, deflate, br" by default;
    // Electron clients add "zstd" which is a fingerprint mismatch.
    "accept-encoding"
];
function scrubProxyAndFingerprintHeaders(headers) {
    const cleaned = {};
    let authorizationValue;
    for (const [key, value] of Object.entries(headers)){
        const lowerKey = key.toLowerCase();
        if (lowerKey.startsWith("x-omniroute-") || HEADERS_TO_REMOVE.includes(lowerKey)) {
            continue;
        }
        if (lowerKey === "authorization") {
            // Defer Authorization so it lands last in the serialized order — matches
            // the native Antigravity fingerprint where Authorization
            // is the final header before the body.
            authorizationValue = value;
            continue;
        }
        cleaned[key] = value;
    }
    // Set the standard Node.js accept-encoding
    cleaned["Accept-Encoding"] = "gzip, deflate, br";
    if (authorizationValue !== undefined) {
        cleaned["Authorization"] = authorizationValue;
    }
    return cleaned;
}
}),
"[project]/open-sse/services/antigravity429Engine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Antigravity 429 classification and retry decision engine.
 *
 * CLIProxyAPI classifies 429 responses into 4 categories and makes nuanced
 * retry decisions for each. OmniRoute previously had only 2 categories
 * (free tier vs RPM). This module brings full parity.
 *
 * Categories:
 *   - unknown:          Generic 429, exponential backoff
 *   - rate_limited:     Per-minute rate limit, short backoff + same auth retry
 *   - quota_exhausted:  Daily/plan quota gone, switch auth or long cooldown
 *   - soft_rate_limit:  Temporary burst limit, instant retry
 *
 * Decisions:
 *   - soft_retry:                    Wait briefly, retry same auth
 *   - instant_retry_same_auth:       Retry immediately on same auth
 *   - short_cooldown_switch_auth:    5min cooldown, try next account
 *   - full_quota_exhausted:          24h cooldown, skip this account
 */ __turbopack_context__.s([
    "FULL_QUOTA_COOLDOWN_MS",
    ()=>FULL_QUOTA_COOLDOWN_MS,
    "SHORT_COOLDOWN_MS",
    ()=>SHORT_COOLDOWN_MS,
    "classify429",
    ()=>classify429,
    "decide429",
    ()=>decide429,
    "isCreditsDisabled",
    ()=>isCreditsDisabled,
    "recordCreditsFailure",
    ()=>recordCreditsFailure
]);
const QUOTA_EXHAUSTED_KEYWORDS = [
    "quota_exhausted",
    "quota exhausted",
    // Antigravity native message: "Individual quota reached. Contact your administrator to enable overages."
    "quota reached",
    "enable overages",
    "individual quota"
];
const CREDITS_EXHAUSTED_KEYWORDS = [
    "google_one_ai",
    "insufficient credit",
    "insufficient credits",
    "not enough credit",
    "not enough credits",
    "credit exhausted",
    "credits exhausted",
    "credit balance",
    "minimumcreditamountforusage",
    "minimum credit amount for usage",
    "minimum credit",
    "insufficient_g1_credits_balance",
    "g1_credits"
];
const SHORT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const INSTANT_RETRY_THRESHOLD_MS = 3 * 1000; // 3 seconds
const FULL_QUOTA_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
function classify429(errorMessage) {
    const lower = (errorMessage || "").toLowerCase();
    // Cloud Code may report an exhausted-capacity message with a zero reset
    // window for a burst/RPM throttle. The explicit zero reset is stronger
    // evidence than the generic wording, so retry briefly instead of applying
    // the durable quota cooldown.
    if (/\breset\s+(?:after|in)\s+0s\b/.test(lower)) {
        return "rate_limited";
    }
    // Check for quota exhaustion first (most specific)
    for (const kw of QUOTA_EXHAUSTED_KEYWORDS){
        if (lower.includes(kw)) return "quota_exhausted";
    }
    // Check for credits exhaustion (also quota-related)
    for (const kw of CREDITS_EXHAUSTED_KEYWORDS){
        if (lower.includes(kw)) return "quota_exhausted";
    }
    // Check for RPM/rate limit indicators
    if (lower.includes("per minute") || lower.includes("rpm") || lower.includes("rate limit") || lower.includes("rate_limit") || lower.includes("too many requests")) {
        return "rate_limited";
    }
    // Check for free tier exhaustion
    if (lower.includes("free tier") || lower.includes("daily limit") || lower.includes("exhausted your capacity")) {
        return "quota_exhausted";
    }
    // Check for soft/burst limits
    if (lower.includes("try again") || lower.includes("temporarily")) {
        return "soft_rate_limit";
    }
    return "unknown";
}
function decide429(category, retryAfterMs) {
    switch(category){
        case "soft_rate_limit":
            return {
                kind: retryAfterMs && retryAfterMs <= INSTANT_RETRY_THRESHOLD_MS ? "instant_retry_same_auth" : "soft_retry",
                retryAfterMs: retryAfterMs ?? 2000,
                reason: "Soft rate limit — brief backoff"
            };
        case "rate_limited":
            return {
                kind: retryAfterMs && retryAfterMs <= SHORT_COOLDOWN_MS ? "soft_retry" : "short_cooldown_switch_auth",
                retryAfterMs: retryAfterMs ?? 60_000,
                reason: "RPM rate limit — switch auth if cooldown is long"
            };
        case "quota_exhausted":
            return {
                kind: "full_quota_exhausted",
                retryAfterMs: retryAfterMs ?? FULL_QUOTA_COOLDOWN_MS,
                reason: "Quota exhausted — skip this account"
            };
        default:
            return {
                kind: "soft_retry",
                retryAfterMs: retryAfterMs ?? 5000,
                reason: "Unknown 429 — generic backoff"
            };
    }
}
/**
 * Track credits failure state per auth key.
 * Auto-disables after repeated failures with 5h cooldown.
 */ const creditsFailureMap = new Map();
const CREDITS_DISABLE_THRESHOLD = 3;
const CREDITS_COOLDOWN_MS = 5 * 60 * 60 * 1000; // 5 hours
function recordCreditsFailure(authKey) {
    const state = creditsFailureMap.get(authKey) ?? {
        count: 0,
        disabledUntil: 0
    };
    state.count++;
    if (state.count >= CREDITS_DISABLE_THRESHOLD) {
        state.disabledUntil = Date.now() + CREDITS_COOLDOWN_MS;
        creditsFailureMap.set(authKey, state);
        return true; // disabled
    }
    creditsFailureMap.set(authKey, state);
    return false;
}
function isCreditsDisabled(authKey) {
    const state = creditsFailureMap.get(authKey);
    if (!state) return false;
    if (state.disabledUntil > Date.now()) return true;
    // Cooldown expired, reset
    creditsFailureMap.delete(authKey);
    return false;
}
;
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
"[project]/open-sse/services/antigravityCredits.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCreditsMode",
    ()=>getCreditsMode,
    "handleCreditsFailure",
    ()=>handleCreditsFailure,
    "injectCreditsField",
    ()=>injectCreditsField,
    "shouldRetryWithCredits",
    ()=>shouldRetryWithCredits,
    "shouldUseCreditsFirst",
    ()=>shouldUseCreditsFirst
]);
/**
 * Google One AI credits injection for Antigravity.
 *
 * When Antigravity returns a quota_exhausted 429, CLIProxyAPI retries the
 * request with `enabledCreditTypes: ["GOOGLE_ONE_AI"]` injected into the
 * body. This uses the user's Google One AI credit balance for the retry,
 * which is often available on Pro accounts.
 *
 * Based on CLIProxyAPI's antigravity_executor.go line 268.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravity429Engine.ts [app-route] (ecmascript)");
;
function injectCreditsField(body) {
    return {
        ...body,
        enabledCreditTypes: [
            "GOOGLE_ONE_AI"
        ]
    };
}
function shouldRetryWithCredits(authKey, creditsMode) {
    if (creditsMode !== "retry") return false;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCreditsDisabled"])(authKey)) return false;
    return true;
}
function handleCreditsFailure(authKey) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordCreditsFailure"])(authKey);
}
function getCreditsMode() {
    const raw = (process.env.ANTIGRAVITY_CREDITS || "").trim().toLowerCase();
    if (raw === "always" || raw === "retry") return raw;
    return "off";
}
function shouldUseCreditsFirst(authKey, creditsMode) {
    if (creditsMode !== "always") return false;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravity429Engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCreditsDisabled"])(authKey)) return false;
    return true;
}
}),
"[project]/open-sse/services/cloudCodeThinking.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shouldStripCloudCodeThinking",
    ()=>shouldStripCloudCodeThinking,
    "stripCloudCodeThinkingConfig",
    ()=>stripCloudCodeThinkingConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [app-route] (ecmascript)");
;
const CLOUD_CODE_REASONING_UNSUPPORTED_PATTERNS = [
    /^claude-/i,
    /^gpt-oss-/i,
    /^tab_/i
];
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function normalizeCloudCodeModel(model) {
    return String(model || "").trim().replace(/^models\//i, "").replace(/^antigravity\//i, "");
}
function stripGeminiThinkingConfig(value) {
    if (!isRecord(value)) return value;
    if (!("thinkingConfig" in value) && !("thinking_config" in value)) return value;
    const next = {
        ...value
    };
    delete next.thinkingConfig;
    delete next.thinking_config;
    return next;
}
function shouldStripCloudCodeThinking(provider, model) {
    if (!provider || !model) return false;
    const normalizedModel = normalizeCloudCodeModel(model);
    if (CLOUD_CODE_REASONING_UNSUPPORTED_PATTERNS.some((pattern)=>pattern.test(normalizedModel))) {
        return true;
    }
    const spec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelSpec"])(normalizedModel);
    if (typeof spec?.supportsThinking === "boolean") {
        return !spec.supportsThinking;
    }
    return false;
}
function stripCloudCodeThinkingConfig(body) {
    const next = {
        ...body
    };
    delete next.reasoning_effort;
    delete next.reasoning;
    delete next.thinking;
    if ("generationConfig" in next) {
        next.generationConfig = stripGeminiThinkingConfig(next.generationConfig);
    }
    if (isRecord(next.request)) {
        const request = {
            ...next.request
        };
        delete request.reasoning_effort;
        delete request.reasoning;
        delete request.thinking;
        if ("generationConfig" in request) {
            request.generationConfig = stripGeminiThinkingConfig(request.generationConfig);
        }
        next.request = request;
    }
    return next;
}
}),
"[project]/open-sse/services/antigravityIdentity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deriveAntigravitySessionId",
    ()=>deriveAntigravitySessionId,
    "generateAntigravityRequestId",
    ()=>generateAntigravityRequestId,
    "generateAntigravitySessionId",
    ()=>generateAntigravitySessionId,
    "getAntigravityAccountKey",
    ()=>getAntigravityAccountKey,
    "getAntigravityEnvelopeUserAgent",
    ()=>getAntigravityEnvelopeUserAgent,
    "getAntigravitySessionId",
    ()=>getAntigravitySessionId
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const FNV_OFFSET_I64 = -3750763034362895579n;
const FNV_PRIME_I64 = 1099511628211n;
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function getProviderDataString(credentials, key) {
    const data = credentials?.providerSpecificData;
    return data && typeof data === "object" ? toNonEmptyString(data[key]) : null;
}
function getAntigravityAccountKey(credentials) {
    return toNonEmptyString(credentials?.email) || getProviderDataString(credentials, "email") || getProviderDataString(credentials, "accountId") || toNonEmptyString(credentials?.connectionId) || null;
}
function getAntigravityEnvelopeUserAgent(_credentials) {
    return "antigravity";
}
function generateAntigravityRequestId() {
    return `agent/${Date.now()}/${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(4).toString("hex")}`;
}
function generateAntigravitySessionId() {
    const max = 18446744073709551615n; // 2^64 - 1
    const target = 9_000_000_000_000_000_000n;
    // Rejection sampling: discard values in [limit, max] that would cause modulo bias.
    // Accepted range [0, limit) divides evenly by target, so value % target is uniform.
    const limit = max - max % target;
    let value;
    do {
        value = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(8).readBigUInt64BE();
    }while (value >= limit)
    // lgtm[js/biased-cryptographic-random] — rejection sampling above eliminates bias
    return `-${(value % target).toString()}`; // nosemgrep: biased-cryptographic-random
}
function deriveAntigravitySessionId(accountKey) {
    const key = toNonEmptyString(accountKey);
    if (!key) return null;
    let hash = FNV_OFFSET_I64;
    for (const byte of Buffer.from(key, "utf8")){
        hash = BigInt.asIntN(64, hash ^ BigInt(byte));
        hash = BigInt.asIntN(64, hash * FNV_PRIME_I64);
    }
    return hash.toString();
}
function getAntigravitySessionId(credentials, fallback) {
    return deriveAntigravitySessionId(getAntigravityAccountKey(credentials)) || toNonEmptyString(fallback) || generateAntigravitySessionId();
}
}),
"[project]/open-sse/services/codexUsageQuotas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCodexUsageQuotas",
    ()=>buildCodexUsageQuotas,
    "getFieldValue",
    ()=>getFieldValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [app-route] (ecmascript)");
;
function getFieldValue(record, ...keys) {
    if (!record || typeof record !== "object") return null;
    const typed = record;
    for (const key of keys){
        if (typed[key] !== undefined && typed[key] !== null) return typed[key];
    }
    return null;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
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
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
function parseResetTime(resetValue) {
    if (!resetValue) return null;
    try {
        let date = null;
        if (resetValue instanceof Date) {
            date = resetValue;
        } else if (typeof resetValue === "number") {
            date = new Date(resetValue < 1e12 ? resetValue * 1000 : resetValue);
        } else if (typeof resetValue === "string") {
            // Numeric strings are Unix timestamps too (seconds or milliseconds).
            if (/^\d+$/.test(resetValue)) {
                const ts = Number(resetValue);
                date = new Date(ts < 1e12 ? ts * 1000 : ts);
            } else {
                date = new Date(resetValue);
            }
        }
        if (!date || date.getTime() <= 0) return null;
        return date.toISOString();
    } catch  {
        return null;
    }
}
function parseWindowReset(window) {
    const resetAt = toNumber(getFieldValue(window, "reset_at", "resetAt"), 0);
    const resetAfterSeconds = toNumber(getFieldValue(window, "reset_after_seconds", "resetAfterSeconds"), 0);
    if (resetAt > 0) return parseResetTime(resetAt * 1000);
    if (resetAfterSeconds > 0) return parseResetTime(Date.now() + resetAfterSeconds * 1000);
    return null;
}
function buildPercentageQuota(window, displayName) {
    const usedPercent = toNumber(getFieldValue(window, "used_percent", "usedPercent"), 0);
    return {
        used: usedPercent,
        total: 100,
        remaining: 100 - usedPercent,
        resetAt: parseWindowReset(window),
        unlimited: false,
        windowSeconds: toNullableNumber(getFieldValue(window, "limit_window_seconds", "limitWindowSeconds", "window_seconds", "windowSeconds")),
        ...displayName ? {
            displayName
        } : {}
    };
}
// A window whose duration is >= this is a weekly (or longer) window; <= the
// session threshold is a short rolling ("session") window. ChatGPT reports the
// window length in `limit_window_seconds`, so labels can follow the real
// duration instead of assuming primary=session / secondary=weekly by position.
const WEEKLY_MIN_WINDOW_SECONDS = 6 * 24 * 3600; // >= ~6d
const SESSION_MAX_WINDOW_SECONDS = 6 * 3600; // <= ~6h
/**
 * A never-started window: `used_percent === 0` and the reset still spans the
 * entire window (`reset_after_seconds >= limit_window_seconds`). ChatGPT
 * advertises latent per-feature ceilings (e.g. the spark bucket) to accounts
 * that have never used them; such a window recomputes its reset as
 * `now + full_window` on every fetch and is not actionable, so callers skip it.
 */ function isLatentWindow(window) {
    const usedPercent = toNumber(getFieldValue(window, "used_percent", "usedPercent"), NaN);
    const limitWindow = toNumber(getFieldValue(window, "limit_window_seconds", "limitWindowSeconds"), 0);
    const resetAfter = toNumber(getFieldValue(window, "reset_after_seconds", "resetAfterSeconds"), 0);
    return usedPercent === 0 && limitWindow > 0 && resetAfter >= limitWindow;
}
/**
 * Derive a duration-accurate label from the window's `limit_window_seconds`, so
 * e.g. a 7-day `primary_window` is labeled "Weekly" rather than "Session".
 * Returns undefined for durations that don't clearly map to either bucket.
 */ function windowDurationLabel(window) {
    const limitWindow = toNumber(getFieldValue(window, "limit_window_seconds", "limitWindowSeconds"), 0);
    if (limitWindow <= 0) return undefined;
    if (limitWindow >= WEEKLY_MIN_WINDOW_SECONDS) return "Weekly";
    if (limitWindow <= SESSION_MAX_WINDOW_SECONDS) return "Session";
    return undefined;
}
function findCodexSparkRateLimit(data) {
    const additionalRateLimits = getFieldValue(data, "additional_rate_limits", "additionalRateLimits");
    if (!Array.isArray(additionalRateLimits)) return {
        rateLimit: {}
    };
    for (const entryValue of additionalRateLimits){
        const entry = toRecord(entryValue);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexSparkLimitDescriptor"])(getFieldValue(entry, "limit_name", "limitName"), getFieldValue(entry, "metered_feature", "meteredFeature"), getFieldValue(entry, "limit_id", "limitId"), entry["id"], entry["name"], entry["title"], entry["model"], getFieldValue(entry, "model_id", "modelId"))) {
            const rawLimitName = getFieldValue(entry, "limit_name", "limitName");
            const limitName = typeof rawLimitName === "string" && rawLimitName.trim().length > 0 ? rawLimitName.trim() : undefined;
            return {
                rateLimit: toRecord(getFieldValue(entry, "rate_limit", "rateLimit")),
                ...limitName ? {
                    limitName
                } : {}
            };
        }
    }
    return {
        rateLimit: {}
    };
}
/**
 * Upstream parity (decolua/9router PR #836): some ChatGPT Codex plans report
 * the review-window rate limit inside `additional_rate_limits` rather than the
 * dedicated `code_review_rate_limit` block. Detect that descriptor so the
 * caller can fall back to it when the dedicated block is empty.
 */ function isCodexReviewLimitDescriptor(...values) {
    return values.some((value)=>{
        if (typeof value !== "string") return false;
        const normalized = value.trim().toLowerCase();
        if (!normalized) return false;
        return normalized === "code_review" || normalized === "codex_review" || normalized === "review" || normalized.includes("code_review") || normalized.includes("codex_review") || normalized.includes("code review");
    });
}
function findCodexReviewRateLimit(data) {
    const additionalRateLimits = getFieldValue(data, "additional_rate_limits", "additionalRateLimits");
    if (!Array.isArray(additionalRateLimits)) return {};
    for (const entryValue of additionalRateLimits){
        const entry = toRecord(entryValue);
        if (isCodexReviewLimitDescriptor(getFieldValue(entry, "limit_name", "limitName"), getFieldValue(entry, "metered_feature", "meteredFeature"), getFieldValue(entry, "limit_id", "limitId"), entry["id"], entry["name"])) {
            return toRecord(getFieldValue(entry, "rate_limit", "rateLimit"));
        }
    }
    return {};
}
/**
 * Codex "banked reset credits" — an eligibility-gated field some ChatGPT plans
 * expose on the /wham/usage payload: a count of extra rate-limit resets the
 * account has banked (available_count), plus an optional descriptor of which
 * window is currently blocking (rate_limit_reached_type). DISPLAY ONLY — this
 * reads the field defensively (many accounts will not have it) and never
 * throws; redemption is an unofficial mutating endpoint and out of scope
 * (issue #5199).
 */ function parseBankedResetCredits(data) {
    const resetCredits = toRecord(getFieldValue(data, "rate_limit_reset_credits", "rateLimitResetCredits"));
    const availableCount = getFieldValue(resetCredits, "available_count", "availableCount");
    const count = toNumber(availableCount, NaN);
    return Number.isFinite(count) ? count : undefined;
}
function parseRateLimitReachedType(data) {
    const reachedType = getFieldValue(data, "rate_limit_reached_type", "rateLimitReachedType");
    if (typeof reachedType === "string" && reachedType.trim().length > 0) return reachedType.trim();
    const reachedTypeObj = toRecord(reachedType);
    const type = getFieldValue(reachedTypeObj, "type");
    return typeof type === "string" && type.trim().length > 0 ? type.trim() : undefined;
}
function buildCodexUsageQuotas(dataValue) {
    const data = toRecord(dataValue);
    const rateLimit = toRecord(getFieldValue(data, "rate_limit", "rateLimit"));
    const quotas = {};
    const bankedResetCredits = parseBankedResetCredits(data);
    const rateLimitReachedType = parseRateLimitReachedType(data);
    // The `session`/`weekly` keys carry routing semantics (combo quota scoring,
    // preflight, cooldowns) and stay position-based. Only the display label is
    // corrected from the real window duration, so a `primary_window` that is
    // actually a 7-day window shows "Weekly" instead of "Session".
    const primaryWindow = toRecord(getFieldValue(rateLimit, "primary_window", "primaryWindow"));
    if (Object.keys(primaryWindow).length > 0) {
        const primaryLabel = windowDurationLabel(primaryWindow);
        quotas.session = buildPercentageQuota(primaryWindow, primaryLabel === "Weekly" ? primaryLabel : undefined);
    }
    const secondaryWindow = toRecord(getFieldValue(rateLimit, "secondary_window", "secondaryWindow"));
    if (Object.keys(secondaryWindow).length > 0) {
        const secondaryLabel = windowDurationLabel(secondaryWindow);
        quotas.weekly = buildPercentageQuota(secondaryWindow, secondaryLabel === "Session" ? secondaryLabel : undefined);
    }
    // Resolve the code-review rate limit block. ChatGPT Codex exposes the same
    // information under two different shapes depending on the plan tier
    // (decolua/9router PR #836):
    //   1. Dedicated `code_review_rate_limit` block at the top level (preferred).
    //   2. An entry inside `additional_rate_limits` with a `code_review` /
    //      `review` descriptor (fallback for plans that bucket every secondary
    //      limit into the same array).
    const dedicatedReviewRateLimit = toRecord(getFieldValue(data, "code_review_rate_limit", "codeReviewRateLimit"));
    const reviewRateLimit = Object.keys(dedicatedReviewRateLimit).length > 0 ? dedicatedReviewRateLimit : findCodexReviewRateLimit(data);
    const codeReviewWindow = toRecord(getFieldValue(reviewRateLimit, "primary_window", "primaryWindow"));
    if (getFieldValue(codeReviewWindow, "used_percent", "usedPercent") !== null || getFieldValue(codeReviewWindow, "remaining_count", "remainingCount") !== null) {
        quotas.code_review = buildPercentageQuota(codeReviewWindow);
    }
    const codeReviewSecondaryWindow = toRecord(getFieldValue(reviewRateLimit, "secondary_window", "secondaryWindow"));
    if (getFieldValue(codeReviewSecondaryWindow, "used_percent", "usedPercent") !== null || getFieldValue(codeReviewSecondaryWindow, "remaining_count", "remainingCount") !== null) {
        quotas.code_review_weekly = buildPercentageQuota(codeReviewSecondaryWindow);
    }
    const spark = findCodexSparkRateLimit(data);
    const sparkRateLimit = spark.rateLimit;
    // Prefer the payload's own `limit_name` so the label tracks whatever OpenAI
    // reports (e.g. as the spark model version bumps) rather than a hardcoded
    // constant; fall back to the constant when the field is absent.
    const sparkDisplayName = spark.limitName || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_SPARK_DISPLAY_NAME"];
    const sparkPrimaryWindow = toRecord(getFieldValue(sparkRateLimit, "primary_window", "primaryWindow"));
    // Skip latent (never-used, full-window) spark ceilings so they don't render as
    // a permanent 100% row with a meaningless always-full reset. Once the account
    // actually uses the spark model the window is no longer latent and appears.
    if (Object.keys(sparkPrimaryWindow).length > 0 && !isLatentWindow(sparkPrimaryWindow)) {
        quotas[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_SPARK_QUOTA_SESSION"]] = buildPercentageQuota(sparkPrimaryWindow, sparkDisplayName);
    }
    const sparkSecondaryWindow = toRecord(getFieldValue(sparkRateLimit, "secondary_window", "secondaryWindow"));
    if (Object.keys(sparkSecondaryWindow).length > 0 && !isLatentWindow(sparkSecondaryWindow)) {
        quotas[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_SPARK_QUOTA_WEEKLY"]] = buildPercentageQuota(sparkSecondaryWindow, `${sparkDisplayName} Weekly`);
    }
    return {
        rateLimit,
        quotas,
        ...bankedResetCredits !== undefined ? {
            bankedResetCredits
        } : {},
        ...rateLimitReachedType !== undefined ? {
            rateLimitReachedType
        } : {}
    };
}
}),
"[project]/open-sse/services/claudeUsageCooldown.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Per-token cooldown for the Claude OAuth usage endpoint
 * (`https://api.anthropic.com/api/oauth/usage`).
 *
 * Anthropic rate-limits this quota endpoint independently of `/v1/messages`.
 * When polled from multiple connections at once (dashboard auto-refresh + the
 * combo health-scheduler), it spams `429` and that surfaces as noisy provider
 * errors plus increased upstream load. Chat with the same token still works.
 *
 * We track a per-access-token "skip until" timestamp. When we see a `429`,
 * we suppress further OAuth-usage polls for that token until the cooldown
 * expires and the caller falls back to the legacy settings/org endpoint
 * (which is what `getClaudeUsage` does on every non-OK response).
 *
 * Pure helpers (no fetch, no timers) keep this TDD-friendly.
 *
 * Inspired-by upstream 9router commit `79df34ca`.
 */ __turbopack_context__.s([
    "OAUTH_USAGE_429_COOLDOWN_MS",
    ()=>OAUTH_USAGE_429_COOLDOWN_MS,
    "_resetClaudeOauthUsageCooldown",
    ()=>_resetClaudeOauthUsageCooldown,
    "isClaudeOauthUsageCoolingDown",
    ()=>isClaudeOauthUsageCoolingDown,
    "markClaudeOauthUsage429",
    ()=>markClaudeOauthUsage429
]);
const OAUTH_USAGE_429_COOLDOWN_MS = 180_000; // 3 minutes
const oauthCooldown = new Map();
function isClaudeOauthUsageCoolingDown(accessToken, now = Date.now()) {
    if (!accessToken) return false;
    const until = oauthCooldown.get(accessToken);
    if (until === undefined) return false;
    if (until > now) return true;
    // Lazy GC of expired entries — keeps the Map bounded by active tokens.
    oauthCooldown.delete(accessToken);
    return false;
}
function markClaudeOauthUsage429(accessToken, now = Date.now(), cooldownMs = OAUTH_USAGE_429_COOLDOWN_MS) {
    if (!accessToken) return;
    oauthCooldown.set(accessToken, now + cooldownMs);
}
function _resetClaudeOauthUsageCooldown() {
    oauthCooldown.clear();
}
}),
"[project]/open-sse/services/kiroRegion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared Amazon Q Developer (Kiro / AWS CodeWhisperer) region resolution.
 *
 * TWO DISTINCT REGIONS — verified against the AWS docs "Amazon Q Developer Pro Region support"
 * ("Supported Regions for the Q Developer console and Q Developer profile"):
 *
 *   • IdC / OIDC / token region — `providerSpecificData.region`. May be ANY of the ~30 IdC-
 *     supported AWS regions (us-east-1, us-west-2, ca-central-1, sa-east-1, eu-west-1/2/3,
 *     eu-central-1/2, eu-north-1, eu-south-1/2, ap-south-1/2, ap-east-1/2, ap-southeast-1..7,
 *     ap-northeast-1/2/3, me-central-1, me-south-1, af-south-1, il-central-1, …). Used ONLY for
 *     `oidc.{region}.amazonaws.com` token mint/refresh (see tokenRefresh.ts / oauth providers).
 *   • Q Developer PROFILE / RUNTIME region — where the `profileArn` lives and every CodeWhisperer
 *     runtime call is served (generateAssistantResponse, GetUsageLimits, ListAvailableModels,
 *     ListAvailableProfiles). AWS currently hosts the profile ONLY in us-east-1 and eu-central-1,
 *     REGARDLESS of the IdC region ("Regardless of the IAM Identity Center Region, data is stored
 *     in the Region where you create the Amazon Q Developer profile"). The AWS docs' own example:
 *     an IdC in us-west-1 → profile in us-east-1.
 *
 * Consequences enforced here:
 *   • The RUNTIME region is the region embedded in the `profileArn` (authoritative — whatever
 *     region AWS actually hosts the profile in), NOT the IdC region. Routing a runtime call to
 *     `q.{idcRegion}.amazonaws.com` for a non-profile IdC region (e.g. q.eu-north-1, which does
 *     not exist as a Q Developer runtime endpoint) is the root cause of the "Kiro IAM shows no
 *     limits + every request returns 502" failure.
 *   • profileArn discovery works for an IdC in ANY region: it probes the known profile regions
 *     (us-east-1 / eu-central-1) with the cross-region SSO token, AND the IdC's own region as a
 *     forward-compatible fallback (in case AWS ever co-locates or expands profile regions). The
 *     discovered ARN's region then drives every runtime call.
 */ // Canonical AWS region shape — kept local (identical to AWS_REGION_PATTERN in
// src/lib/oauth/constants/oauth.ts) so this open-sse module has no cross-tree import just to
// validate a string. Guards against SSRF via region injection (GHSA-6mwv-4mrm-5p3m): the value
// is interpolated into upstream URLs.
__turbopack_context__.s([
    "AWS_REGION_PATTERN",
    ()=>AWS_REGION_PATTERN,
    "KIRO_PROFILE_REGIONS",
    ()=>KIRO_PROFILE_REGIONS,
    "buildKiroProfileDiscoveryRegions",
    ()=>buildKiroProfileDiscoveryRegions,
    "discoverKiroProfileArnAcrossRegions",
    ()=>discoverKiroProfileArnAcrossRegions,
    "kiroRuntimeHost",
    ()=>kiroRuntimeHost,
    "regionFromKiroProfileArn",
    ()=>regionFromKiroProfileArn,
    "resolveKiroRuntimeRegion",
    ()=>resolveKiroRuntimeRegion
]);
const AWS_REGION_PATTERN = /^[a-z]{2}-[a-z]+-\d{1,2}$/;
const KIRO_PROFILE_REGIONS = [
    "us-east-1",
    "eu-central-1"
];
function kiroRuntimeHost(region) {
    return region === "us-east-1" ? "https://codewhisperer.us-east-1.amazonaws.com" : `https://q.${region}.amazonaws.com`;
}
function regionFromKiroProfileArn(profileArn) {
    if (typeof profileArn !== "string") return undefined;
    return profileArn.toLowerCase().match(/^arn:aws:codewhisperer:([a-z0-9-]+):/)?.[1];
}
function normalizeRegion(region) {
    return typeof region === "string" ? region.trim().toLowerCase() : "";
}
function resolveKiroRuntimeRegion(providerSpecificData) {
    const fromArn = regionFromKiroProfileArn(typeof providerSpecificData?.profileArn === "string" ? providerSpecificData.profileArn : undefined);
    if (fromArn) return fromArn;
    const stored = normalizeRegion(providerSpecificData?.region);
    if (stored && KIRO_PROFILE_REGIONS.includes(stored)) return stored;
    return "us-east-1";
}
function buildKiroProfileDiscoveryRegions(storedRegion) {
    const stored = normalizeRegion(storedRegion);
    const preferEu = /^(eu|af|me|il)-/.test(stored);
    const regions = preferEu ? [
        "eu-central-1",
        "us-east-1"
    ] : [
        "us-east-1",
        "eu-central-1"
    ];
    if (stored && AWS_REGION_PATTERN.test(stored) && !regions.includes(stored)) {
        regions.push(stored);
    }
    return regions;
}
async function listKiroProfileArnForRegion(accessToken, region, fetchImpl) {
    // Defensive: region comes from a hardcoded allowlist here, but validate before it is
    // interpolated into the runtime host (SSRF guard, GHSA-6mwv-4mrm-5p3m).
    if (!AWS_REGION_PATTERN.test(region)) return undefined;
    try {
        const response = await fetchImpl(`${kiroRuntimeHost(region)}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-amz-json-1.0",
                Accept: "application/json",
                "x-amz-target": "AmazonCodeWhispererService.ListAvailableProfiles",
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                maxResults: 10
            }),
            // Never let a hung/region-mismatched profile lookup block login or the quota refresh.
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) return undefined;
        const data = await response.json();
        const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
        // Prefer a profile whose ARN region matches the region we queried; else take the first.
        const matched = profiles.find((profile)=>{
            const arn = profile?.arn;
            return typeof arn === "string" && regionFromKiroProfileArn(arn) === region;
        }) || profiles[0];
        const arn = matched?.arn;
        return typeof arn === "string" && arn.length > 0 ? arn : undefined;
    } catch  {
        return undefined;
    }
}
async function discoverKiroProfileArnAcrossRegions(accessToken, storedRegion, fetchImpl) {
    const token = typeof accessToken === "string" ? accessToken.trim() : "";
    if (!token) return undefined;
    // Resolve fetch at call time (not module-load) so callers/tests that swap globalThis.fetch
    // are honored when no explicit implementation is injected.
    const doFetch = fetchImpl ?? globalThis.fetch;
    for (const region of buildKiroProfileDiscoveryRegions(storedRegion)){
        const arn = await listKiroProfileArnForRegion(token, region, doFetch);
        if (arn) return arn;
    }
    return undefined;
}
}),
"[project]/open-sse/services/adobeFireflyClient.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADOBE_FIREFLY_CREDITS_BALANCE_URL",
    ()=>ADOBE_FIREFLY_CREDITS_BALANCE_URL,
    "ADOBE_FIREFLY_GENERIC_IMAGE_MAX_REFS",
    ()=>ADOBE_FIREFLY_GENERIC_IMAGE_MAX_REFS,
    "ADOBE_FIREFLY_GPT_IMAGE_MAX_REFS",
    ()=>ADOBE_FIREFLY_GPT_IMAGE_MAX_REFS,
    "ADOBE_FIREFLY_IMAGE_MODELS",
    ()=>ADOBE_FIREFLY_IMAGE_MODELS,
    "ADOBE_FIREFLY_IMAGE_SUBMIT_URL",
    ()=>ADOBE_FIREFLY_IMAGE_SUBMIT_URL,
    "ADOBE_FIREFLY_IMAGE_TIMEOUT_MAX_MS",
    ()=>ADOBE_FIREFLY_IMAGE_TIMEOUT_MAX_MS,
    "ADOBE_FIREFLY_IMAGE_TIMEOUT_PER_REF_MS",
    ()=>ADOBE_FIREFLY_IMAGE_TIMEOUT_PER_REF_MS,
    "ADOBE_FIREFLY_IMAGE_UPLOAD_URL",
    ()=>ADOBE_FIREFLY_IMAGE_UPLOAD_URL,
    "ADOBE_FIREFLY_IMS_REFRESH_URL",
    ()=>ADOBE_FIREFLY_IMS_REFRESH_URL,
    "ADOBE_FIREFLY_IMS_SCOPE",
    ()=>ADOBE_FIREFLY_IMS_SCOPE,
    "ADOBE_FIREFLY_MAX_UPLOAD_BYTES",
    ()=>ADOBE_FIREFLY_MAX_UPLOAD_BYTES,
    "ADOBE_FIREFLY_MODELS_DISCOVERY_URL",
    ()=>ADOBE_FIREFLY_MODELS_DISCOVERY_URL,
    "ADOBE_FIREFLY_NANO_MAX_REFS",
    ()=>ADOBE_FIREFLY_NANO_MAX_REFS,
    "ADOBE_FIREFLY_VIDEO_MODELS",
    ()=>ADOBE_FIREFLY_VIDEO_MODELS,
    "ADOBE_FIREFLY_VIDEO_SUBMIT_URL",
    ()=>ADOBE_FIREFLY_VIDEO_SUBMIT_URL,
    "AdobeFireflyError",
    ()=>AdobeFireflyError,
    "DEFAULT_IMAGE_TIMEOUT_MS",
    ()=>DEFAULT_IMAGE_TIMEOUT_MS,
    "adobeFireflyApiKey",
    ()=>adobeFireflyApiKey,
    "adobeFireflyBalanceApiKey",
    ()=>adobeFireflyBalanceApiKey,
    "adobeFireflyExpressClientId",
    ()=>adobeFireflyExpressClientId,
    "adobeFireflyGenerateImage",
    ()=>adobeFireflyGenerateImage,
    "adobeFireflyGenerateVideo",
    ()=>adobeFireflyGenerateVideo,
    "adobeFireflyImageTimeoutMs",
    ()=>adobeFireflyImageTimeoutMs,
    "adobeFireflyMaxImageRefs",
    ()=>adobeFireflyMaxImageRefs,
    "buildAdobeArpSessionId",
    ()=>buildAdobeArpSessionId,
    "buildAdobeBalanceHeaders",
    ()=>buildAdobeBalanceHeaders,
    "buildAdobeDiscoveryHeaders",
    ()=>buildAdobeDiscoveryHeaders,
    "buildAdobeImagePayload",
    ()=>buildAdobeImagePayload,
    "buildAdobePollHeaders",
    ()=>buildAdobePollHeaders,
    "buildAdobeSubmitHeaders",
    ()=>buildAdobeSubmitHeaders,
    "buildAdobeSubmitNonce",
    ()=>buildAdobeSubmitNonce,
    "buildAdobeUploadHeaders",
    ()=>buildAdobeUploadHeaders,
    "buildAdobeVideoPayload",
    ()=>buildAdobeVideoPayload,
    "decodeAdobeJwtPayload",
    ()=>decodeAdobeJwtPayload,
    "discoverAdobeFireflyModels",
    ()=>discoverAdobeFireflyModels,
    "exchangeAdobeCookieForAccessToken",
    ()=>exchangeAdobeCookieForAccessToken,
    "extractAdobeAccountIdFromToken",
    ()=>extractAdobeAccountIdFromToken,
    "extractAdobeArpSessionId",
    ()=>extractAdobeArpSessionId,
    "extractAdobeCookieHeader",
    ()=>extractAdobeCookieHeader,
    "extractAdobeCredentialToken",
    ()=>extractAdobeCredentialToken,
    "extractAdobeMediaUrl",
    ()=>extractAdobeMediaUrl,
    "extractAdobeResultLink",
    ()=>extractAdobeResultLink,
    "extractAdobeSourceImageSources",
    ()=>extractAdobeSourceImageSources,
    "fetchAdobeCreditsBalance",
    ()=>fetchAdobeCreditsBalance,
    "formatAdobeSystemUnderLoadError",
    ()=>formatAdobeSystemUnderLoadError,
    "generateAdobeNonce",
    ()=>generateAdobeNonce,
    "isAdobeGuestAccessToken",
    ()=>isAdobeGuestAccessToken,
    "isAdobeJobFailed",
    ()=>isAdobeJobFailed,
    "isAdobeJobInProgress",
    ()=>isAdobeJobInProgress,
    "isAdobeTransientSubmitError",
    ()=>isAdobeTransientSubmitError,
    "isAdobeUserAccessToken",
    ()=>isAdobeUserAccessToken,
    "looksLikeAdobeCookieBlob",
    ()=>looksLikeAdobeCookieBlob,
    "looksLikeAdobeJwt",
    ()=>looksLikeAdobeJwt,
    "normalizeAdobeAspectRatio",
    ()=>normalizeAdobeAspectRatio,
    "normalizeAdobeOutputResolution",
    ()=>normalizeAdobeOutputResolution,
    "normalizeAdobePollUrl",
    ()=>normalizeAdobePollUrl,
    "parseAdobeCreditsBalance",
    ()=>parseAdobeCreditsBalance,
    "parseAdobeImageSourceBytes",
    ()=>parseAdobeImageSourceBytes,
    "parseAdobeModelsDiscovery",
    ()=>parseAdobeModelsDiscovery,
    "parseAdobeStorageUploadResponse",
    ()=>parseAdobeStorageUploadResponse,
    "pollAdobeJob",
    ()=>pollAdobeJob,
    "resolveAdobeAccessToken",
    ()=>resolveAdobeAccessToken,
    "resolveAdobeImageModel",
    ()=>resolveAdobeImageModel,
    "resolveAdobeSourceImageIds",
    ()=>resolveAdobeSourceImageIds,
    "resolveAdobeVideoModel",
    ()=>resolveAdobeVideoModel,
    "uploadAdobeFireflyImage",
    ()=>uploadAdobeFireflyImage
]);
/**
 * Adobe Firefly (unofficial) media client.
 *
 * Talks to the same Firefly 3P async APIs that firefly.adobe.com uses (live browser
 * captures in repo `adobe/`):
 *   POST https://firefly-3p.ff.adobe.io/v2/3p-images/generate-async
 *   POST https://firefly-3p.ff.adobe.io/v2/3p-videos/generate-async
 *   POST https://firefly-3p.ff.adobe.io/v2/models/discovery
 *   GET  https://firefly.adobe.io/v1/credits/balance
 * then polls BKS job result URLs rewritten from links.result.
 *
 * Auth is an Adobe IMS access token (Bearer, client_id = clio-playground-web).
 * Callers may pass either:
 *   - a raw IMS access_token JWT (from Authorization: Bearer on Firefly), or
 *   - a browser Cookie header from firefly.adobe.com (exchanged via IMS check/v6/token
 *     with client_id clio-playground-web; Express projectx_webapp as fallback).
 *
 * x-api-key on generate/discovery MUST match the token's IMS client
 * (`clio-playground-web`). Mismatch → HTTP 401 invalid token.
 *
 * Unofficial — tokens/cookies are short-lived; Adobe may change the wire contract.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
;
;
;
const ADOBE_FIREFLY_IMAGE_SUBMIT_URL = "https://firefly-3p.ff.adobe.io/v2/3p-images/generate-async";
const ADOBE_FIREFLY_VIDEO_SUBMIT_URL = "https://firefly-3p.ff.adobe.io/v2/3p-videos/generate-async";
const ADOBE_FIREFLY_IMAGE_UPLOAD_URL = "https://firefly-3p.ff.adobe.io/v2/storage/image";
const ADOBE_FIREFLY_MODELS_DISCOVERY_URL = "https://firefly-3p.ff.adobe.io/v2/models/discovery";
const ADOBE_FIREFLY_CREDITS_BALANCE_URL = "https://firefly.adobe.io/v1/credits/balance";
const ADOBE_FIREFLY_IMS_REFRESH_URL = "https://adobeid-na1.services.adobe.com/ims/check/v6/token?jslVersion=v2-v0.48.0-1-g1e322cb";
const ADOBE_FIREFLY_IMS_SCOPE = "AdobeID,firefly_api,openid,pps.read,pps.write,additional_info.projectedProductContext," + "additional_info.ownerOrg,uds_read,uds_write,ab.manage,read_organizations," + "additional_info.roles,account_cluster.read,creative_production,tk_platform," + "tk_platform_sync,profile";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36";
const DEFAULT_SEC_CH_UA = '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"';
const DEFAULT_POLL_INTERVAL_MS = 3000;
const DEFAULT_IMAGE_TIMEOUT_MS = 300_000;
const DEFAULT_VIDEO_TIMEOUT_MS = 300_000;
const ADOBE_FIREFLY_IMAGE_TIMEOUT_PER_REF_MS = 60_000;
const ADOBE_FIREFLY_IMAGE_TIMEOUT_MAX_MS = 600_000;
const ADOBE_FIREFLY_GPT_IMAGE_MAX_REFS = 2;
const ADOBE_FIREFLY_NANO_MAX_REFS = 4;
const ADOBE_FIREFLY_GENERIC_IMAGE_MAX_REFS = 2;
const FIREFLY_ORIGIN = "https://firefly.adobe.com";
const FIREFLY_REFERER = "https://firefly.adobe.com/";
function adobeFireflyMaxImageRefs(model) {
    const raw = String(model || "").toLowerCase();
    if (raw.includes("nano-banana") || raw.includes("nanobanana") || raw.includes("gemini-flash")) {
        return ADOBE_FIREFLY_NANO_MAX_REFS;
    }
    if (raw.includes("gpt-image") || raw.includes("gptimage")) {
        return ADOBE_FIREFLY_GPT_IMAGE_MAX_REFS;
    }
    return ADOBE_FIREFLY_GENERIC_IMAGE_MAX_REFS;
}
function adobeFireflyImageTimeoutMs(opts) {
    const explicit = Number(opts?.timeoutMs);
    if (Number.isFinite(explicit) && explicit > 0) {
        return Math.min(ADOBE_FIREFLY_IMAGE_TIMEOUT_MAX_MS, Math.floor(explicit));
    }
    const refs = Math.max(0, Math.floor(Number(opts?.refCount) || 0));
    const budget = DEFAULT_IMAGE_TIMEOUT_MS + refs * ADOBE_FIREFLY_IMAGE_TIMEOUT_PER_REF_MS;
    return Math.min(ADOBE_FIREFLY_IMAGE_TIMEOUT_MAX_MS, budget);
}
const ADOBE_FIREFLY_IMAGE_MODELS = {
    // Gemini 3.0 (Nano Banana Pro) — discovery: gemini-flash / nano-banana-2
    "nano-banana-pro": {
        upstreamModelId: "gemini-flash",
        upstreamModelVersion: "nano-banana-2",
        family: "nano"
    },
    // Gemini 2.5 (Nano Banana) — discovery: gemini-flash / nano-banana
    "nano-banana": {
        upstreamModelId: "gemini-flash",
        upstreamModelVersion: "nano-banana",
        family: "nano"
    },
    // Gemini 3.1 (Nano Banana 2) — discovery: gemini-flash / nano-banana-3
    "nano-banana-2": {
        upstreamModelId: "gemini-flash",
        upstreamModelVersion: "nano-banana-3",
        family: "nano"
    },
    // GPT Image 2 — discovery modelVersion "2" (get_models: modelDisplayName "GPT Image 2")
    "gpt-image": {
        upstreamModelId: "gpt-image",
        upstreamModelVersion: "2",
        family: "gpt-image"
    },
    // Explicit catalog alias so pickers show "gpt-image-2" distinctly
    "gpt-image-2": {
        upstreamModelId: "gpt-image",
        upstreamModelVersion: "2",
        family: "gpt-image"
    },
    "gpt-image-1.5": {
        upstreamModelId: "gpt-image",
        upstreamModelVersion: "1.5",
        family: "gpt-image"
    },
    "flux-2": {
        upstreamModelId: "flux",
        upstreamModelVersion: "2",
        family: "generic"
    },
    "flux-pro": {
        upstreamModelId: "flux",
        upstreamModelVersion: "fluxPro",
        family: "generic"
    },
    "flux-ultra": {
        upstreamModelId: "flux",
        upstreamModelVersion: "fluxUltra",
        family: "generic"
    },
    "seedream-4": {
        upstreamModelId: "seedream",
        upstreamModelVersion: "seedream_v4",
        family: "generic"
    },
    "seedream-5-lite": {
        upstreamModelId: "seedream",
        upstreamModelVersion: "seedream_v5_lite",
        family: "generic"
    },
    "runway-gen4-image": {
        upstreamModelId: "runway-gen4-image",
        upstreamModelVersion: "gen4_image",
        family: "generic"
    }
};
const ADOBE_FIREFLY_VIDEO_MODELS = {
    "sora-2": {
        engine: "sora2",
        upstreamModel: "openai:firefly:colligo:sora2",
        defaultDuration: 8,
        defaultResolution: "720p"
    },
    "sora-2-pro": {
        engine: "sora2-pro",
        upstreamModel: "openai:firefly:colligo:sora2-pro",
        defaultDuration: 8,
        defaultResolution: "720p"
    },
    "veo-3.1": {
        engine: "veo31-standard",
        upstreamModel: "google:firefly:colligo:veo31",
        modelId: "veo",
        modelVersion: "3.1-generate",
        defaultDuration: 6,
        defaultResolution: "720p"
    },
    "veo-3.1-fast": {
        engine: "veo31-fast",
        upstreamModel: "google:firefly:colligo:veo31-fast",
        modelId: "veo",
        modelVersion: "3.1-fast-generate",
        defaultDuration: 6,
        defaultResolution: "720p"
    },
    "veo-3.1-ref": {
        engine: "veo31-standard",
        upstreamModel: "google:firefly:colligo:veo31",
        modelId: "veo",
        modelVersion: "3.1-generate",
        referenceMode: "image",
        defaultDuration: 6,
        defaultResolution: "720p"
    },
    "kling-3": {
        engine: "kling3",
        upstreamModel: "kling:firefly:colligo:kling3",
        modelId: "kling",
        modelVersion: "kling_v3_standard_i2v",
        defaultDuration: 5,
        defaultResolution: "1080p"
    }
};
const NANO_SIZE_MAP = {
    "1K": {
        "1:1": {
            width: 1024,
            height: 1024
        },
        "16:9": {
            width: 1360,
            height: 768
        },
        "9:16": {
            width: 768,
            height: 1360
        },
        "4:3": {
            width: 1152,
            height: 864
        },
        "3:4": {
            width: 864,
            height: 1152
        },
        "1:8": {
            width: 384,
            height: 3072
        },
        "1:4": {
            width: 512,
            height: 2048
        },
        "4:1": {
            width: 2048,
            height: 512
        },
        "8:1": {
            width: 3072,
            height: 384
        }
    },
    "2K": {
        "1:1": {
            width: 2048,
            height: 2048
        },
        "16:9": {
            width: 2752,
            height: 1536
        },
        "9:16": {
            width: 1536,
            height: 2752
        },
        "4:3": {
            width: 2048,
            height: 1536
        },
        "3:4": {
            width: 1536,
            height: 2048
        },
        "1:8": {
            width: 768,
            height: 6144
        },
        "1:4": {
            width: 1024,
            height: 4096
        },
        "4:1": {
            width: 4096,
            height: 1024
        },
        "8:1": {
            width: 6144,
            height: 768
        }
    },
    "4K": {
        "1:1": {
            width: 4096,
            height: 4096
        },
        "16:9": {
            width: 5504,
            height: 3072
        },
        "9:16": {
            width: 3072,
            height: 5504
        },
        "4:3": {
            width: 4096,
            height: 3072
        },
        "3:4": {
            width: 3072,
            height: 4096
        },
        "1:8": {
            width: 1536,
            height: 12288
        },
        "1:4": {
            width: 2048,
            height: 8192
        },
        "4:1": {
            width: 8192,
            height: 2048
        },
        "8:1": {
            width: 12288,
            height: 1536
        }
    }
};
const GPT_SIZE_MAP = {
    "1K": {
        "1:1": {
            width: 1024,
            height: 1024
        },
        "5:4": {
            width: 1120,
            height: 896
        },
        "9:16": {
            width: 720,
            height: 1280
        },
        "21:9": {
            width: 1456,
            height: 624
        },
        "16:9": {
            width: 1280,
            height: 720
        },
        "4:3": {
            width: 1152,
            height: 864
        },
        "3:2": {
            width: 1248,
            height: 832
        },
        "4:5": {
            width: 896,
            height: 1120
        },
        "3:4": {
            width: 864,
            height: 1152
        },
        "2:3": {
            width: 832,
            height: 1248
        }
    },
    "2K": {
        "1:1": {
            width: 2048,
            height: 2048
        },
        "5:4": {
            width: 2240,
            height: 1792
        },
        "9:16": {
            width: 1440,
            height: 2560
        },
        "21:9": {
            width: 3024,
            height: 1296
        },
        "16:9": {
            width: 2560,
            height: 1440
        },
        "4:3": {
            width: 2304,
            height: 1728
        },
        "3:2": {
            width: 2496,
            height: 1664
        },
        "4:5": {
            width: 1792,
            height: 2240
        },
        "3:4": {
            width: 1728,
            height: 2304
        },
        "2:3": {
            width: 1664,
            height: 2496
        }
    },
    "4K": {
        "1:1": {
            width: 2880,
            height: 2880
        },
        "5:4": {
            width: 3200,
            height: 2560
        },
        "9:16": {
            width: 2160,
            height: 3840
        },
        "21:9": {
            width: 3696,
            height: 1584
        },
        "16:9": {
            width: 3840,
            height: 2160
        },
        "4:3": {
            width: 3264,
            height: 2448
        },
        "3:2": {
            width: 3504,
            height: 2336
        },
        "4:5": {
            width: 2560,
            height: 3200
        },
        "3:4": {
            width: 2448,
            height: 3264
        },
        "2:3": {
            width: 2336,
            height: 3504
        }
    }
};
const PIXEL_SIZE_TO_RATIO = {
    "1024x1024": "1:1",
    "1536x1536": "1:1",
    "2048x2048": "1:1",
    "1024x1792": "9:16",
    "1536x2752": "9:16",
    "1792x1024": "16:9",
    "2752x1536": "16:9",
    "2048x1536": "4:3",
    "1536x2048": "3:4",
    "1280x720": "16:9",
    "720x1280": "9:16",
    "1920x1080": "16:9",
    "1080x1920": "9:16"
};
class AdobeFireflyError extends Error {
    status;
    code;
    constructor(message, status = 502, code){
        super(message);
        this.name = "AdobeFireflyError";
        this.status = status;
        this.code = code;
    }
}
function adobeFireflyApiKey() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("adobe_firefly_api_key", "ADOBE_FIREFLY_API_KEY");
}
function adobeFireflyExpressClientId() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("adobe_firefly_express_client_id", "ADOBE_FIREFLY_EXPRESS_CLIENT_ID");
}
function adobeFireflyBalanceApiKey() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePublicCred"])("adobe_firefly_balance_api_key", "ADOBE_FIREFLY_BALANCE_API_KEY");
}
function decodeAdobeJwtPayload(token) {
    try {
        // Do not call extractAdobeCredentialToken here (would recurse via guest checks).
        let raw = String(token || "").trim().replace(/^bearer\s+/i, "").trim();
        // If a blob was passed, take the first JWT-shaped segment.
        const m = raw.match(/eyJ[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}/);
        if (m) raw = m[0];
        const part = raw.split(".")[1];
        if (!part) return null;
        const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
        const obj = JSON.parse(json);
        return obj && typeof obj === "object" ? obj : null;
    } catch  {
        return null;
    }
}
function extractAdobeAccountIdFromToken(token) {
    const payload = decodeAdobeJwtPayload(token);
    if (!payload) return "";
    const candidates = [
        payload.user_id,
        payload.aa_id,
        payload.sub,
        payload.id
    ];
    for (const c of candidates){
        if (typeof c === "string" && c.includes("@")) return c.trim();
    }
    for (const c of candidates){
        if (typeof c === "string" && c.trim()) return c.trim();
    }
    return "";
}
function looksLikeAdobeJwt(value) {
    const raw = value.trim();
    if (!raw) return false;
    // Avoid treating cookie blobs that happen to have two dots as JWT.
    if (raw.includes(";") || raw.includes("=") && !raw.startsWith("eyJ")) return false;
    // Allow a single space after optional Bearer prefix (stripped earlier).
    if (/\s/.test(raw) && !/^bearer\s+/i.test(raw)) return false;
    const token = raw.replace(/^bearer\s+/i, "").trim();
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    // Adobe IMS access tokens are sizable; reject tiny accidental 3-segment strings.
    if (token.length < 80) return false;
    return parts.every((p)=>p.length > 0 && /^[A-Za-z0-9_-]+$/.test(p));
}
function isAdobeGuestAccessToken(token) {
    const payload = decodeAdobeJwtPayload(token);
    if (!payload) return false;
    const userId = typeof payload.user_id === "string" ? payload.user_id : "";
    const aaId = typeof payload.aa_id === "string" ? payload.aa_id : "";
    const type = typeof payload.type === "string" ? payload.type.toLowerCase() : "";
    // Authenticated Firefly tokens always carry an @AdobeID (or similar) subject.
    if (userId.includes("@AdobeID") || aaId.includes("@AdobeID")) return false;
    if (userId.includes("@GuestID") || aaId.includes("@GuestID")) return true;
    if (type === "guest" || type.includes("guest")) return true;
    // Guest tokens from ims/check often omit type/user_id entirely.
    if (!userId && !aaId) return true;
    return false;
}
function isAdobeUserAccessToken(token) {
    return looksLikeAdobeJwt(token) && !isAdobeGuestAccessToken(token);
}
function extractAdobeCredentialToken(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    if (/^bearer\s+/i.test(value)) {
        const bare = value.replace(/^bearer\s+/i, "").trim().split(/\s+/)[0] || "";
        if (looksLikeAdobeJwt(bare)) return bare;
    }
    // access_token=... in cookie-ish or form paste
    const accessMatch = value.match(/(?:^|[;\s&])access_token=([^;\s&]+)/i);
    if (accessMatch?.[1]) {
        const t = decodeURIComponent(accessMatch[1].trim());
        if (looksLikeAdobeJwt(t)) return t;
    }
    // IMS sessionStorage / localStorage JSON: "tokenValue":"eyJ..."
    const tokenValueMatch = value.match(/"tokenValue"\s*:\s*"(eyJ[^"]+)"/i);
    if (tokenValueMatch?.[1] && looksLikeAdobeJwt(tokenValueMatch[1])) {
        return tokenValueMatch[1];
    }
    // Authorization: Bearer eyJ...
    const authMatch = value.match(/Authorization\s*:\s*Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/i);
    if (authMatch?.[1] && looksLikeAdobeJwt(authMatch[1])) return authMatch[1];
    // Any eyJ… JWT in the blob (HAR / multi-line). Prefer user AdobeID tokens.
    const jwtMatches = value.match(/eyJ[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}/g);
    if (jwtMatches && jwtMatches.length > 0) {
        const sorted = [
            ...jwtMatches
        ].sort((a, b)=>b.length - a.length);
        const user = sorted.find((t)=>looksLikeAdobeJwt(t) && isAdobeUserAccessToken(t));
        if (user) return user;
        const best = sorted[0];
        if (looksLikeAdobeJwt(best)) return best;
    }
    // Pure JWT
    if (looksLikeAdobeJwt(value)) return value.replace(/^bearer\s+/i, "").trim();
    // Cookie / other blob unchanged for IMS exchange
    return value;
}
function looksLikeAdobeCookieBlob(value) {
    const raw = String(value || "").trim();
    if (!raw || looksLikeAdobeJwt(raw)) return false;
    if (raw.includes(";") && raw.includes("=")) return true;
    if (/(?:^|[;\s])(?:aux_sid|ff_session|sherlockToken|forterToken|arkose)=/i.test(raw)) {
        return true;
    }
    return false;
}
function extractAdobeCookieHeader(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    if (looksLikeAdobeJwt(value)) return "";
    // Drop pure JWT lines and Authorization: Bearer lines
    const cleaned = value.split(/[\r\n]+/).map((line)=>line.trim()).filter((line)=>{
        if (!line) return false;
        if (/^authorization\s*:/i.test(line)) return false;
        if (/^bearer\s+/i.test(line)) return false;
        if (looksLikeAdobeJwt(line)) return false;
        // Drop standalone eyJ… segments
        if (/^eyJ[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}$/.test(line)) return false;
        return true;
    }).join("; ");
    // Also strip inline eyJ JWT tokens that may sit inside a cookie string
    const noJwt = cleaned.replace(/eyJ[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}/g, "").replace(/;\s*;/g, ";").replace(/^;\s*|\s*;$/g, "").trim();
    if (!noJwt || !looksLikeAdobeCookieBlob(noJwt)) return "";
    // Final safety: Cookie header must be single-line
    return noJwt.replace(/[\r\n]+/g, "; ").trim();
}
const GUEST_COOKIE_HELP = "Firefly page cookies alone only mint a GUEST IMS token (no AdobeID) — generate returns 401 and Limits 403. " + "Fix: open firefly.adobe.com signed-in → F12 → Network → click a request to firefly-3p.ff.adobe.io " + "(generate-async or models/discovery) → Request Headers → Authorization → copy the token AFTER 'Bearer ' " + "(starts with eyJ…). Paste that JWT as the credential. " + "Cookie-only works only if you also export IMS session cookies from adobelogin.com / adobeid-na1 " + "(Cookie-Editor → export all Adobe domains); firefly.adobe.com cookies by themselves are not enough.";
function normalizeAdobeAspectRatio(sizeOrRatio, fallback = "1:1") {
    if (typeof sizeOrRatio !== "string" || !sizeOrRatio.trim()) return fallback;
    let raw = sizeOrRatio.trim().replace(/_/g, ":");
    if (raw.toLowerCase() === "auto") return fallback;
    if (/^\d+:\d+$/.test(raw)) return raw;
    // Short ratio forms like 16x9 / 9x16
    const short = raw.match(/^(\d+)x(\d+)$/i);
    if (short) {
        const a = Number(short[1]);
        const b = Number(short[2]);
        if (a > 0 && b > 0 && a < 100 && b < 100) return `${a}:${b}`;
    }
    const lower = raw.toLowerCase();
    if (PIXEL_SIZE_TO_RATIO[lower]) return PIXEL_SIZE_TO_RATIO[lower];
    // Generic WxH pixel sizes → closest common ratio
    const pixel = lower.match(/^(\d+)x(\d+)$/);
    if (pixel) {
        const w = Number(pixel[1]);
        const h = Number(pixel[2]);
        if (w > 0 && h > 0) {
            if (Math.abs(w - h) / Math.max(w, h) < 0.08) return "1:1";
            if (w > h * 1.5) return "16:9";
            if (h > w * 1.5) return "9:16";
            if (w > h) return "4:3";
            return "3:4";
        }
    }
    return fallback;
}
function normalizeAdobeOutputResolution(quality, size) {
    const q = String(quality ?? "").trim().toLowerCase();
    if (q === "4k" || q === "ultra" || q === "high") return "4K";
    if (q === "2k" || q === "hd" || q === "standard" || q === "medium") return "2K";
    if (q === "1k" || q === "low") return "1K";
    const s = String(size ?? "").toLowerCase();
    if (s.includes("4k") || /4096|5504|3840/.test(s)) return "4K";
    if (s.includes("1k") || /1024x1024|768x1360|1360x768/.test(s)) return "1K";
    return "2K";
}
function resolveAdobeImageModel(model) {
    const raw = String(model || "").trim().toLowerCase().replace(/^adobe-firefly\//, "").replace(/^firefly\//, "");
    // Accept long catalog ids like firefly-nano-banana-pro-2k-16x9
    if (raw.includes("nano-banana2") || raw.includes("nano-banana-2") || raw.includes("nano-banana-3")) {
        return {
            id: "nano-banana-2",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["nano-banana-2"]
        };
    }
    if (raw.includes("nano-banana-pro")) {
        return {
            id: "nano-banana-pro",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["nano-banana-pro"]
        };
    }
    if (raw.includes("nano-banana")) {
        return {
            id: "nano-banana",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["nano-banana"]
        };
    }
    if (raw.includes("gpt-image-1.5") || raw.includes("gpt-image1.5")) {
        return {
            id: "gpt-image-1.5",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["gpt-image-1.5"]
        };
    }
    // Prefer explicit "2" / "gpt-image-2" before generic gpt-image
    if (raw === "gpt-image-2" || raw.includes("gpt-image-2") || raw.includes("gptimage2") || raw === "gpt-image" || raw.includes("gpt-image")) {
        // Bare gpt-image and gpt-image-2 both map to upstream version "2" (GPT Image 2).
        if (raw.includes("1.5")) {
            return {
                id: "gpt-image-1.5",
                spec: ADOBE_FIREFLY_IMAGE_MODELS["gpt-image-1.5"]
            };
        }
        const id = raw.includes("gpt-image-2") || raw.includes("gptimage2") ? "gpt-image-2" : "gpt-image";
        return {
            id: id,
            spec: ADOBE_FIREFLY_IMAGE_MODELS["gpt-image"]
        };
    }
    if (raw.includes("flux-ultra") || raw.includes("fluxultra")) {
        return {
            id: "flux-ultra",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["flux-ultra"]
        };
    }
    if (raw.includes("flux-pro") || raw.includes("fluxpro")) {
        return {
            id: "flux-pro",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["flux-pro"]
        };
    }
    if (raw.includes("flux")) {
        return {
            id: "flux-2",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["flux-2"]
        };
    }
    if (raw.includes("seedream-5") || raw.includes("seedream_v5")) {
        return {
            id: "seedream-5-lite",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["seedream-5-lite"]
        };
    }
    if (raw.includes("seedream")) {
        return {
            id: "seedream-4",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["seedream-4"]
        };
    }
    if (raw.includes("runway") && raw.includes("image")) {
        return {
            id: "runway-gen4-image",
            spec: ADOBE_FIREFLY_IMAGE_MODELS["runway-gen4-image"]
        };
    }
    if (raw in ADOBE_FIREFLY_IMAGE_MODELS) {
        const id = raw;
        return {
            id,
            spec: ADOBE_FIREFLY_IMAGE_MODELS[id]
        };
    }
    // Default to Nano Banana Pro (most common Firefly image path).
    return {
        id: "nano-banana-pro",
        spec: ADOBE_FIREFLY_IMAGE_MODELS["nano-banana-pro"]
    };
}
function resolveAdobeVideoModel(model) {
    const raw = String(model || "").trim().toLowerCase().replace(/^adobe-firefly\//, "").replace(/^firefly\//, "");
    if (raw.includes("sora2-pro") || raw.includes("sora-2-pro") || raw.includes("sora2_pro")) {
        return {
            id: "sora-2-pro",
            spec: ADOBE_FIREFLY_VIDEO_MODELS["sora-2-pro"]
        };
    }
    if (raw.includes("sora2") || raw.includes("sora-2") || raw.includes("sora")) {
        return {
            id: "sora-2",
            spec: ADOBE_FIREFLY_VIDEO_MODELS["sora-2"]
        };
    }
    if (raw.includes("veo31-ref") || raw.includes("veo-3.1-ref") || raw.includes("veo31_ref")) {
        return {
            id: "veo-3.1-ref",
            spec: ADOBE_FIREFLY_VIDEO_MODELS["veo-3.1-ref"]
        };
    }
    if (raw.includes("veo31-fast") || raw.includes("veo-3.1-fast") || raw.includes("veo31_fast")) {
        return {
            id: "veo-3.1-fast",
            spec: ADOBE_FIREFLY_VIDEO_MODELS["veo-3.1-fast"]
        };
    }
    if (raw.includes("veo31") || raw.includes("veo-3.1") || raw.includes("veo")) {
        return {
            id: "veo-3.1",
            spec: ADOBE_FIREFLY_VIDEO_MODELS["veo-3.1"]
        };
    }
    if (raw.includes("kling")) {
        return {
            id: "kling-3",
            spec: ADOBE_FIREFLY_VIDEO_MODELS["kling-3"]
        };
    }
    if (raw in ADOBE_FIREFLY_VIDEO_MODELS) {
        const id = raw;
        return {
            id,
            spec: ADOBE_FIREFLY_VIDEO_MODELS[id]
        };
    }
    return {
        id: "sora-2",
        spec: ADOBE_FIREFLY_VIDEO_MODELS["sora-2"]
    };
}
/**
 * Map OpenAI/VibeProxy quality tiers onto Firefly gpt-image `generationSettings.detailLevel`.
 * Wire range is integer 1–5 (discovery schema). Default is **maximal (5)** —
 * the SPA often defaults to 3, but detail is critical for GPT Image 2 output quality.
 * Explicit low/medium still honor the caller's choice.
 */ function gptDetailLevel(quality) {
    const q = String(quality ?? "high").trim().toLowerCase();
    if (q === "low" || q === "1k" || q === "1") return 1;
    if (q === "medium" || q === "2k" || q === "standard" || q === "hd" || q === "3") return 3;
    // high / 4k / ultra / auto / empty / unknown → max detail
    return 5;
}
function buildAdobeImagePayload(opts) {
    const ratio = opts.aspectRatio === "auto" ? "1:1" : opts.aspectRatio || "1:1";
    const seeds = [
        typeof opts.seed === "number" ? opts.seed : Math.floor(Date.now() % 999999)
    ];
    const negative = String(opts.negativePrompt || "").trim();
    const genSettings = {};
    if (negative) {
        genSettings.avoidKeywords = negative.replace(/;/g, ",").split(",").map((w)=>w.trim()).filter(Boolean);
    }
    if (opts.modelSpec.family === "gpt-image") {
        // Live firefly.adobe.com body (adobe/image_generate.txt) — no top-level size /
        // outputResolution; modelSpecificPayload.size is "auto".
        const payload = {
            n: 1,
            seeds,
            output: {
                storeInputs: true
            },
            prompt: opts.prompt,
            referenceBlobs: [],
            modelSpecificPayload: {
                size: "auto"
            },
            modelId: opts.modelSpec.upstreamModelId,
            modelVersion: opts.modelSpec.upstreamModelVersion,
            generationMetadata: {
                module: "text2image",
                submodule: "ff-image-generate"
            },
            generationSettings: {
                detailLevel: gptDetailLevel(opts.quality),
                ...genSettings
            }
        };
        if (opts.sourceImageIds?.length) {
            // gpt-image subject references (mask path uses separate mask blob when present).
            // Cap to wire-stable count — extra subject blobs stall colligo until poll 504.
            const refIds = opts.sourceImageIds.map((id)=>String(id)).filter(Boolean).slice(0, ADOBE_FIREFLY_GPT_IMAGE_MAX_REFS);
            payload.generationMetadata = {
                module: "image2image",
                submodule: "ff-image-generate"
            };
            payload.referenceBlobs = refIds.map((id)=>({
                    id,
                    usage: "subject"
                }));
            payload.modelSpecificPayload = {};
        }
        return payload;
    }
    // nano (Gemini Flash) + generic (Flux / Seedream / Runway image): same 3P image shape.
    // Live capture (web_providers/adobe_atach_images.txt): referenceBlobs with usage "general"
    // keep module "text2image" (not image2image) for nano multi-ref composition.
    const sizeMap = NANO_SIZE_MAP[opts.outputResolution] || NANO_SIZE_MAP["2K"];
    const pixel = sizeMap[ratio] || sizeMap["1:1"];
    const payload = {
        modelId: opts.modelSpec.upstreamModelId,
        modelVersion: opts.modelSpec.upstreamModelVersion,
        n: 1,
        prompt: opts.prompt,
        size: pixel,
        seeds,
        groundSearch: false,
        skipCai: false,
        output: {
            storeInputs: true
        },
        generationMetadata: {
            module: "text2image",
            submodule: "ff-image-generate"
        },
        modelSpecificPayload: {
            parameters: {
                addWatermark: false
            },
            aspectRatio: ratio
        },
        referenceBlobs: []
    };
    if (Object.keys(genSettings).length) payload.generationSettings = genSettings;
    if (opts.sourceImageIds?.length) {
        const maxRefs = opts.modelSpec.family === "generic" ? ADOBE_FIREFLY_GENERIC_IMAGE_MAX_REFS : ADOBE_FIREFLY_NANO_MAX_REFS;
        const refIds = opts.sourceImageIds.map((id)=>String(id)).filter(Boolean).slice(0, maxRefs);
        payload.referenceBlobs = refIds.map((id)=>({
                id,
                usage: "general"
            }));
        // Flux / Seedream / Runway image historically used image2image; nano keeps text2image.
        if (opts.modelSpec.family === "generic") {
            payload.generationMetadata = {
                module: "image2image",
                submodule: "ff-image-generate"
            };
        }
    }
    return payload;
}
function videoSize(aspectRatio, resolution) {
    const res = String(resolution || "720p").toLowerCase();
    const short = res.includes("1080") ? 1080 : res.includes("480") ? 480 : 720;
    const ratio = aspectRatio === "9:16" ? "9:16" : aspectRatio === "1:1" ? "1:1" : "16:9";
    if (ratio === "1:1") return {
        width: short,
        height: short
    };
    if (ratio === "9:16") return {
        width: Math.round(short * 9 / 16),
        height: short
    };
    return {
        width: Math.round(short * 16 / 9),
        height: short
    };
}
function buildAdobeVideoPayload(opts) {
    const seedVal = typeof opts.seed === "number" ? opts.seed : Math.floor(Date.now() % 999999);
    const aspect = opts.aspectRatio === "auto" ? "16:9" : opts.aspectRatio || "16:9";
    const duration = Math.max(1, Math.min(30, Math.floor(opts.duration || opts.modelSpec.defaultDuration)));
    const resolution = opts.resolution || opts.modelSpec.defaultResolution;
    const vidSize = videoSize(aspect, resolution);
    const engine = opts.modelSpec.engine;
    const sourceImageIds = opts.sourceImageIds || [];
    const negative = String(opts.negativePrompt || "");
    if (engine === "veo31-standard" || engine === "veo31-fast") {
        const payload = {
            n: 1,
            seeds: [
                seedVal
            ],
            modelId: "veo",
            modelVersion: opts.modelSpec.modelVersion || (engine === "veo31-fast" ? "3.1-fast-generate" : "3.1-generate"),
            output: {
                storeInputs: true
            },
            prompt: opts.prompt,
            size: vidSize,
            generateAudio: opts.generateAudio !== false,
            referenceBlobs: [],
            generationMetadata: {
                module: "text2video"
            },
            modelSpecificPayload: {
                parameters: {
                    durationSeconds: duration,
                    aspectRatio: aspect,
                    addWaterMark: false
                }
            }
        };
        if (sourceImageIds.length) {
            const refs = payload.referenceBlobs;
            if (opts.modelSpec.referenceMode === "image") {
                for (const imageId of sourceImageIds.slice(0, 3)){
                    refs.push({
                        id: String(imageId),
                        usage: "asset"
                    });
                }
            } else {
                sourceImageIds.slice(0, 2).forEach((imageId, idx)=>{
                    refs.push({
                        id: String(imageId),
                        usage: "general",
                        order: idx + 1
                    });
                });
            }
            payload.generationMetadata = {
                module: "image2video"
            };
        }
        if (negative) payload.negativePrompt = negative;
        return payload;
    }
    if (engine === "kling3") {
        const payload = {
            n: 1,
            seeds: [
                seedVal
            ],
            modelId: "kling",
            modelVersion: "kling_v3_standard_i2v",
            output: {
                storeInputs: true
            },
            prompt: opts.prompt,
            size: vidSize,
            generationMetadata: {
                module: sourceImageIds.length ? "image2video" : "text2video"
            },
            duration,
            generationSettings: {
                aspectRatio: aspect
            },
            referenceBlobs: []
        };
        if (sourceImageIds.length) {
            const refs = payload.referenceBlobs;
            sourceImageIds.slice(0, 2).forEach((imageId, idx)=>{
                refs.push({
                    id: String(imageId),
                    usage: "frame",
                    order: idx + 1
                });
            });
        }
        if (negative) payload.negativePrompt = negative;
        return payload;
    }
    // Sora 2 / Sora 2 Pro
    const promptJson = JSON.stringify({
        prompt: opts.prompt,
        duration,
        ...negative ? {
            negative_prompt: negative
        } : {}
    });
    const payload = {
        n: 1,
        seeds: [
            seedVal
        ],
        modelId: "sora",
        modelVersion: engine === "sora2-pro" ? "sora-2-pro" : "sora-2",
        size: vidSize,
        duration,
        fps: 24,
        prompt: promptJson,
        generationMetadata: {
            module: sourceImageIds.length ? "image2video" : "text2video"
        },
        model: opts.modelSpec.upstreamModel,
        generateLoop: false,
        transparentBackground: false,
        seed: String(seedVal),
        locale: "en-US",
        camera: {
            angle: "none",
            shotSize: "none",
            motion: null,
            promptStyle: null
        },
        negativePrompt: negative,
        jobMode: "standard",
        debugGenerationEndpoint: "",
        referenceBlobs: [],
        referenceFrames: [],
        referenceVideo: null,
        cameraMotionReferenceVideo: null,
        characterReference: null,
        editReferenceVideo: null,
        output: {
            storeInputs: true
        }
    };
    if (sourceImageIds.length) {
        const firstId = String(sourceImageIds[0]);
        payload.referenceBlobs = [
            {
                id: firstId,
                usage: "general",
                promptReference: 1
            }
        ];
        const frames = [
            {
                localBlobRef: firstId
            },
            null
        ];
        if (sourceImageIds.length > 1) {
            const lastId = String(sourceImageIds[1]);
            payload.referenceBlobs.push({
                id: lastId,
                usage: "general",
                promptReference: 2
            });
            frames[1] = {
                localBlobRef: lastId
            };
        }
        payload.referenceFrames = frames;
    }
    return payload;
}
function browserHeaders() {
    return {
        "user-agent": DEFAULT_USER_AGENT,
        origin: FIREFLY_ORIGIN,
        referer: FIREFLY_REFERER,
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": DEFAULT_SEC_CH_UA,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty"
    };
}
function generateAdobeNonce() {
    const bytes = new Uint8Array(32);
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        crypto.getRandomValues(bytes);
    } else {
        for(let i = 0; i < bytes.length; i++)bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, (b)=>b.toString(16).padStart(2, "0")).join("");
}
function buildAdobeSubmitNonce(accessToken, prompt) {
    const userId = extractAdobeAccountIdFromToken(accessToken);
    const promptPrefix = String(prompt || "").slice(0, 256);
    if (!userId || !promptPrefix) return "";
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(`${userId}-${promptPrefix}`, "utf8").digest("hex");
}
function buildAdobeArpSessionId() {
    const nowMs = Date.now();
    const rand = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16).toString("hex");
    const sid = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const pid = typeof process !== "undefined" && process.pid ? process.pid : 0;
    // Magic suffix is part of the wire contract reverse-engineered by adobe2api.
    const ftr = `${rand}_${nowMs}_${pid}_dUAL43-mnts-ants-d4_31ck__tt`;
    const raw = JSON.stringify({
        sid,
        ftr
    });
    return Buffer.from(raw, "utf-8").toString("base64");
}
function extractAdobeArpSessionId(cookieOrBlob) {
    const raw = String(cookieOrBlob || "");
    const m = raw.match(/(?:^|[;\s])sherlockToken=([^;]+)/i);
    if (m?.[1]) return decodeURIComponent(m[1].trim());
    const m2 = raw.match(/(?:^|[;\s])x-arp-session-id=([^;]+)/i);
    if (m2?.[1]) return decodeURIComponent(m2[1].trim());
    return "";
}
function buildAdobeSubmitHeaders(accessToken, extras) {
    // Live capture + working open-source clients (GPT2Image-Pro / adobe2api):
    // Authorization + x-api-key + deterministic x-nonce + ALWAYS x-arp-session-id.
    // Do NOT attach firefly.adobe.com page Cookie to firefly-3p (wrong origin / soft 408).
    void extras?.cookie;
    const deterministic = extras?.nonce || (extras?.prompt ? buildAdobeSubmitNonce(accessToken, extras.prompt) : "") || generateAdobeNonce();
    // Prefer pasted sherlockToken; otherwise mint a synthetic ARP session (required).
    const arp = extras?.arpSessionId && String(extras.arpSessionId).trim() || buildAdobeArpSessionId();
    const headers = {
        ...browserHeaders(),
        Authorization: `Bearer ${accessToken}`,
        // Must be clio-playground-web — same client_id that minted the IMS token.
        "x-api-key": adobeFireflyApiKey(),
        "content-type": "application/json",
        accept: "*/*",
        "cache-control": "no-cache",
        pragma: "no-cache",
        priority: "u=1, i",
        "x-nonce": deterministic,
        "x-arp-session-id": arp
    };
    return headers;
}
const ADOBE_FIREFLY_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
function buildAdobeUploadHeaders(accessToken, contentType, extras) {
    const base = buildAdobeSubmitHeaders(accessToken, {
        arpSessionId: extras?.arpSessionId,
        nonce: extras?.nonce,
        cookie: extras?.cookie,
        prompt: extras?.prompt || "upload"
    });
    const ct = String(contentType || "image/png").trim().toLowerCase() || "image/png";
    return {
        ...base,
        "content-type": ct.startsWith("image/") ? ct : "image/png"
    };
}
function extractAdobeSourceImageSources(body, max = 4) {
    if (!body || typeof body !== "object") return [];
    const b = body;
    const po = b.provider_options && typeof b.provider_options === "object" && !Array.isArray(b.provider_options) ? b.provider_options : {};
    const out = [];
    const seen = new Set();
    const push = (v)=>{
        if (out.length >= max) return;
        if (typeof v === "string") {
            const t = v.trim();
            if (!t || seen.has(t)) return;
            // Skip empty / clearly non-image
            if (t === "null" || t === "undefined") return;
            seen.add(t);
            out.push(t);
            return;
        }
        if (Array.isArray(v)) {
            for (const item of v){
                if (out.length >= max) break;
                push(item);
            }
            return;
        }
        if (v && typeof v === "object") {
            const o = v;
            if (typeof o.url === "string") push(o.url);
            else if (typeof o.image_url === "string") push(o.image_url);
            else if (o.image_url && typeof o.image_url === "object") {
                const inner = o.image_url.url;
                if (typeof inner === "string") push(inner);
            } else if (typeof o.b64_json === "string") {
                push(`data:image/png;base64,${o.b64_json}`);
            } else if (typeof o.base64 === "string") {
                push(`data:image/png;base64,${o.base64}`);
            }
        }
    };
    // Order matches MediaViewModel / OpenAI edit aliases (primary single fields first).
    const keys = [
        "image_url",
        "imageUrl",
        "input_image",
        "source_image",
        "promptImage",
        "prompt_image",
        "image",
        "images",
        "image_urls",
        "imageUrls",
        "input_images",
        "reference_images",
        "referenceImages",
        "reference_image"
    ];
    for (const k of keys){
        push(b[k]);
        push(po[k]);
    }
    // OpenAI chat-style content parts (rare on /v1/images but harmless).
    if (Array.isArray(b.messages)) {
        for (const msg of b.messages){
            if (!msg || typeof msg !== "object") continue;
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const part of content){
                if (!part || typeof part !== "object") continue;
                const p = part;
                if (p.type === "image_url" || p.type === "image") {
                    push(p.image_url ?? p.image ?? p.url);
                }
            }
        }
    }
    return out.slice(0, max);
}
function parseAdobeImageSourceBytes(source) {
    const trimmed = String(source || "").trim();
    if (!trimmed) {
        throw new AdobeFireflyError("Empty image reference", 400, "bad_image");
    }
    const dataUri = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,([\s\S]+)$/i.exec(trimmed);
    if (dataUri) {
        const mime = (dataUri[1] || "image/png").trim().toLowerCase() || "image/png";
        const isB64 = Boolean(dataUri[2]);
        const payload = dataUri[3] || "";
        if (!isB64) {
            throw new AdobeFireflyError("Image data URL must be base64-encoded (data:image/...;base64,...)", 400, "bad_image");
        }
        const buffer = Buffer.from(payload.replace(/\s/g, ""), "base64");
        if (!buffer.length) {
            throw new AdobeFireflyError("Image data URL decoded to empty bytes", 400, "bad_image");
        }
        if (buffer.length > ADOBE_FIREFLY_MAX_UPLOAD_BYTES) {
            throw new AdobeFireflyError(`Image reference too large (${buffer.length} bytes; max ${ADOBE_FIREFLY_MAX_UPLOAD_BYTES})`, 400, "bad_image");
        }
        return {
            buffer,
            contentType: mime.startsWith("image/") ? mime : "image/png"
        };
    }
    // Raw base64 without data: prefix
    if (!/^https?:\/\//i.test(trimmed) && /^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 64) {
        const buffer = Buffer.from(trimmed.replace(/\s/g, ""), "base64");
        if (buffer.length > 0 && buffer.length <= ADOBE_FIREFLY_MAX_UPLOAD_BYTES) {
            return {
                buffer,
                contentType: "image/png"
            };
        }
    }
    throw new AdobeFireflyError("Unsupported image reference (need data:image/...;base64,... or raw base64). " + "HTTP(S) URLs are resolved by the caller before upload.", 400, "bad_image");
}
function parseAdobeStorageUploadResponse(body) {
    if (!body || typeof body !== "object") return "";
    const images = body.images;
    if (Array.isArray(images) && images.length > 0) {
        const first = images[0];
        if (first && typeof first === "object") {
            const id = first.id;
            if (typeof id === "string" && id.trim()) return id.trim();
        }
    }
    const id = body.id;
    if (typeof id === "string" && id.trim()) return id.trim();
    return "";
}
async function uploadAdobeFireflyImage(opts) {
    const fetchImpl = opts.fetchImpl || fetch;
    const buffer = Buffer.isBuffer(opts.bytes) ? opts.bytes : Buffer.from(opts.bytes);
    if (!buffer.length) {
        throw new AdobeFireflyError("Cannot upload empty image", 400, "bad_image");
    }
    if (buffer.length > ADOBE_FIREFLY_MAX_UPLOAD_BYTES) {
        throw new AdobeFireflyError(`Image reference too large (${buffer.length} bytes; max ${ADOBE_FIREFLY_MAX_UPLOAD_BYTES})`, 400, "bad_image");
    }
    const sessionCookie = String(opts.sessionCookie || "").trim();
    const cookieHeader = extractAdobeCookieHeader(sessionCookie);
    const arpSessionId = extractAdobeArpSessionId(cookieHeader) || extractAdobeArpSessionId(sessionCookie);
    const contentType = opts.contentType && opts.contentType.trim() || (buffer[0] === 0xff && buffer[1] === 0xd8 ? "image/jpeg" : buffer[0] === 0x89 && buffer[1] === 0x50 ? "image/png" : "image/png");
    const resp = await fetchImpl(ADOBE_FIREFLY_IMAGE_UPLOAD_URL, {
        method: "POST",
        headers: buildAdobeUploadHeaders(opts.accessToken, contentType, {
            arpSessionId: arpSessionId || undefined,
            cookie: cookieHeader || undefined,
            prompt: opts.prompt || "upload"
        }),
        body: buffer
    });
    const text = await resp.text().catch(()=>"");
    if (resp.status === 401 || resp.status === 403) {
        throw new AdobeFireflyError("Adobe Firefly image upload unauthorized — paste a fresh IMS JWT", 401, "auth");
    }
    if (!resp.ok) {
        throw new AdobeFireflyError(`Adobe Firefly image upload failed (${resp.status}): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(text.slice(0, 300))}`, resp.status >= 400 && resp.status < 500 ? resp.status : 502, "upload");
    }
    let json = {};
    try {
        json = text ? JSON.parse(text) : {};
    } catch  {
        throw new AdobeFireflyError("Adobe Firefly image upload returned non-JSON body", 502, "upload");
    }
    const id = parseAdobeStorageUploadResponse(json);
    if (!id) {
        throw new AdobeFireflyError("Adobe Firefly image upload succeeded but no images[].id was returned", 502, "upload");
    }
    opts.log?.info?.("ADOBE-FIREFLY", `uploaded reference image id=${id} (${buffer.length} bytes)`);
    return id;
}
async function resolveAdobeSourceImageIds(opts) {
    const max = Math.max(1, Math.min(8, opts.max ?? 4));
    const sources = extractAdobeSourceImageSources(opts.body, max);
    if (!sources.length) return [];
    const fetchImpl = opts.fetchImpl || fetch;
    const ids = [];
    for (const src of sources){
        // Already a Firefly storage id (uuid)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(src)) {
            ids.push(src);
            continue;
        }
        let buffer;
        let contentType = "image/png";
        if (/^https?:\/\//i.test(src)) {
            const r = await fetchImpl(src, {
                method: "GET",
                headers: {
                    accept: "image/*,*/*"
                }
            });
            if (!r.ok) {
                throw new AdobeFireflyError(`Failed to download reference image (${r.status}): ${src.slice(0, 120)}`, 400, "bad_image");
            }
            const ab = await r.arrayBuffer();
            buffer = Buffer.from(ab);
            const ct = r.headers.get("content-type") || "";
            if (ct.toLowerCase().startsWith("image/")) {
                contentType = ct.split(";")[0].trim();
            }
        } else {
            const parsed = parseAdobeImageSourceBytes(src);
            buffer = parsed.buffer;
            contentType = parsed.contentType;
        }
        const id = await uploadAdobeFireflyImage({
            accessToken: opts.accessToken,
            bytes: buffer,
            contentType,
            sessionCookie: opts.sessionCookie,
            prompt: opts.prompt,
            fetchImpl,
            log: opts.log
        });
        ids.push(id);
    }
    return ids;
}
function isAdobeTransientSubmitError(status, bodyText) {
    if (status === 408 || status === 429 || status === 502 || status === 503 || status === 504) {
        return true;
    }
    const t = (bodyText || "").toLowerCase();
    return t.includes("timeout_error") || t.includes("system under load") || t.includes("try again") || t.includes("temporarily") || t.includes("overloaded");
}
function buildAdobePollHeaders(accessToken) {
    // Live adobe/status_check.txt: Bearer + accept only (no x-api-key, no Cookie).
    return {
        Authorization: `Bearer ${accessToken}`,
        accept: "*/*",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "user-agent": DEFAULT_USER_AGENT,
        referer: FIREFLY_REFERER
    };
}
function buildAdobeBalanceHeaders(accessToken) {
    const accountId = extractAdobeAccountIdFromToken(accessToken);
    const headers = {
        ...browserHeaders(),
        Authorization: `Bearer ${accessToken}`,
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": adobeFireflyBalanceApiKey()
    };
    if (accountId) headers["x-account-id"] = accountId;
    return headers;
}
function buildAdobeDiscoveryHeaders(accessToken) {
    return {
        ...browserHeaders(),
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": adobeFireflyApiKey(),
        "content-type": "application/json",
        // Missing Accept → HTTP 406 "Unsupported Accept Type or not allowed".
        accept: "*/*"
    };
}
function formatAdobeSystemUnderLoadError(kind, attempts) {
    return `Adobe Firefly ${kind} generation is currently unavailable (HTTP 408 "system under load", ` + `${attempts} attempt${attempts === 1 ? "" : "s"}). This is Adobe-side capacity/rate limiting ` + `— not an invalid token (credits/models may still work). Wait 1–2 minutes and retry, or paste a ` + `fresh IMS JWT from a browser request that just succeeded: firefly.adobe.com → F12 → Network → ` + `firefly-3p generate-async → Authorization → copy token after "Bearer ".`;
}
function extractAdobeResultLink(headers, body) {
    const get = (name)=>{
        if (typeof headers.get === "function") {
            return String(headers.get(name) || "").trim();
        }
        const rec = headers;
        const key = Object.keys(rec).find((k)=>k.toLowerCase() === name.toLowerCase());
        return String((key ? rec[key] : "") || "").trim();
    };
    const override = get("x-override-status-link");
    if (override) return override;
    const data = body && typeof body === "object" ? body : {};
    const links = data.links && typeof data.links === "object" ? data.links : {};
    const result = links.result;
    if (typeof result === "string" && result) return result;
    if (result && typeof result === "object") {
        const href = result.href;
        if (typeof href === "string" && href) return href;
    }
    if (typeof data.statusUrl === "string" && data.statusUrl) return data.statusUrl;
    if (typeof data.resultUrl === "string" && data.resultUrl) return data.resultUrl;
    return "";
}
function normalizeAdobePollUrl(rawUrl) {
    const url = String(rawUrl || "").trim();
    if (!url) return url;
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        if (!host.startsWith("firefly-epo")) return url;
        const path = parsed.pathname || "";
        const isJobPath = path.includes("/jobs/result/") || path.includes("/v2/status") || path.includes("/status/");
        if (!isJobPath) return url;
        const jobId = path.split("/").filter(Boolean).pop() || "";
        if (!jobId || jobId === "status" || jobId === "result") return url;
        const epoId = host.slice("firefly-epo".length).split(".")[0] || "";
        // 855232 → 8552 (browser BKS host); short ids kept as-is.
        const bksId = epoId.length > 4 ? epoId.slice(0, 4) : epoId;
        return `https://bks-epo${bksId}.adobe.io/v2/jobs/result/${jobId}?host=${host}`;
    } catch  {
        return url;
    }
}
function extractAdobeMediaUrl(latest, kind) {
    const body = latest && typeof latest === "object" ? latest : {};
    const outputs = Array.isArray(body.outputs) ? body.outputs : [];
    if (outputs.length > 0) {
        const first = outputs[0] && typeof outputs[0] === "object" ? outputs[0] : {};
        const media = kind === "image" ? first.image && typeof first.image === "object" ? first.image : null : first.video && typeof first.video === "object" ? first.video : null;
        const url = media && typeof media.presignedUrl === "string" ? media.presignedUrl : null;
        if (url) return url;
    }
    // Fallback recursive search for a presigned URL.
    const found = findPresignedUrl(latest, kind === "image" ? [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp"
    ] : [
        ".mp4",
        ".webm"
    ]);
    return found;
}
function findPresignedUrl(obj, exts) {
    if (!obj) return null;
    if (typeof obj === "string") {
        const s = obj.trim();
        if (/^https?:\/\//i.test(s) && (exts.some((e)=>s.toLowerCase().includes(e)) || s.includes("presigned") || s.includes("X-Amz"))) {
            return s;
        }
        return null;
    }
    if (Array.isArray(obj)) {
        for (const item of obj){
            const found = findPresignedUrl(item, exts);
            if (found) return found;
        }
        return null;
    }
    if (typeof obj === "object") {
        const rec = obj;
        if (typeof rec.presignedUrl === "string" && rec.presignedUrl) return rec.presignedUrl;
        for (const value of Object.values(rec)){
            const found = findPresignedUrl(value, exts);
            if (found) return found;
        }
    }
    return null;
}
function isAdobeJobInProgress(status) {
    const s = String(status || "").toUpperCase();
    return !s || s === "IN_PROGRESS" || s === "PENDING" || s === "RUNNING" || s === "QUEUED" || s === "PROCESSING" || s === "SUBMITTED";
}
function isAdobeJobFailed(status) {
    const s = String(status || "").toUpperCase();
    return s === "FAILED" || s === "CANCELLED" || s === "ERROR" || s === "CANCELED";
}
async function imsCheckToken(opts) {
    const form = new URLSearchParams({
        client_id: opts.clientId,
        scope: ADOBE_FIREFLY_IMS_SCOPE,
        guest_allowed: opts.guestAllowed ? "true" : "false"
    });
    const resp = await opts.fetchImpl(ADOBE_FIREFLY_IMS_REFRESH_URL, {
        method: "POST",
        headers: {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Cookie: opts.cookie,
            Origin: FIREFLY_ORIGIN,
            Referer: FIREFLY_REFERER,
            "User-Agent": DEFAULT_USER_AGENT
        },
        body: form.toString()
    });
    const text = await resp.text().catch(()=>"");
    let data = null;
    try {
        data = JSON.parse(text);
    } catch  {
        data = null;
    }
    if (!resp.ok) {
        return {
            state: "failed",
            status: resp.status,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(data?.error_description || data?.error || text.slice(0, 200) || `HTTP ${resp.status}`)
        };
    }
    const token = String(data?.access_token || "").trim();
    if (!token) {
        return {
            state: "failed",
            status: 401,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(data?.error_description || data?.error || "IMS response missing access_token")
        };
    }
    return {
        state: "ok",
        token,
        data: data || {}
    };
}
async function exchangeAdobeCookieForAccessToken(cookieHeader, fetchImpl = fetch) {
    const cookie = String(cookieHeader || "").trim();
    if (!cookie) {
        throw new AdobeFireflyError("Adobe Firefly cookie is empty", 401, "missing_cookie");
    }
    // HAR / mixed paste that already contains a user JWT
    const embedded = extractAdobeCredentialToken(cookie);
    if (embedded !== cookie && looksLikeAdobeJwt(embedded)) {
        if (isAdobeGuestAccessToken(embedded)) {
            throw new AdobeFireflyError(GUEST_COOKIE_HELP, 401, "guest_token");
        }
        return embedded;
    }
    const clientIds = [
        adobeFireflyApiKey(),
        adobeFireflyExpressClientId()
    ].filter((id, i, arr)=>id && arr.indexOf(id) === i);
    let sawEmptySession = false;
    let lastError = "";
    let lastStatus = 502;
    let guestTokenSeen = false;
    for (const clientId of clientIds){
        // 1) Authenticated session only (needs IMS cookies from adobelogin.com)
        const authed = await imsCheckToken({
            cookie,
            clientId,
            guestAllowed: false,
            fetchImpl
        });
        if (authed.state === "ok") {
            if (isAdobeGuestAccessToken(authed.token) || authed.data.account_type === "guest" || authed.data.guestId) {
                guestTokenSeen = true;
            } else {
                return authed.token;
            }
        } else {
            lastStatus = authed.status;
            lastError = authed.error;
            if (/session cookies are empty/i.test(authed.error)) sawEmptySession = true;
        }
        // 2) Guest path — never accept guest tokens for Firefly media/limits
        const guest = await imsCheckToken({
            cookie,
            clientId,
            guestAllowed: true,
            fetchImpl
        });
        if (guest.state === "ok") {
            if (guest.data.account_type === "guest" || guest.data.guestId || isAdobeGuestAccessToken(guest.token)) {
                guestTokenSeen = true;
                lastError = "IMS returned a guest token (no AdobeID session)";
                lastStatus = 401;
                continue;
            }
            return guest.token;
        }
        lastStatus = guest.status;
        lastError = guest.error;
        if (/session cookies are empty/i.test(guest.error)) sawEmptySession = true;
    }
    if (guestTokenSeen || sawEmptySession) {
        throw new AdobeFireflyError(GUEST_COOKIE_HELP, 401, "guest_token");
    }
    throw new AdobeFireflyError(`Adobe IMS token exchange failed (${lastStatus}): ${lastError || "no access_token"}. ${GUEST_COOKIE_HELP}`, lastStatus === 401 || lastStatus === 403 ? 401 : 502, "ims_refresh_failed");
}
async function resolveAdobeAccessToken(credentials, fetchImpl = fetch) {
    const psd = credentials?.providerSpecificData;
    const candidates = [];
    const push = (v)=>{
        if (typeof v === "string" && v.trim()) candidates.push(v.trim());
    };
    push(credentials?.apiKey);
    push(credentials?.accessToken);
    push(psd?.access_token);
    push(psd?.accessToken);
    push(psd?.cookie);
    if (candidates.length === 0) {
        throw new AdobeFireflyError("Adobe Firefly credentials missing. " + GUEST_COOKIE_HELP, 401, "missing_credentials");
    }
    for (const c of candidates){
        const extracted = extractAdobeCredentialToken(c);
        if (looksLikeAdobeJwt(extracted) && isAdobeUserAccessToken(extracted)) {
            return extracted;
        }
    }
    for (const c of candidates){
        const extracted = extractAdobeCredentialToken(c);
        if (looksLikeAdobeJwt(extracted) && isAdobeGuestAccessToken(extracted)) {
            throw new AdobeFireflyError(GUEST_COOKIE_HELP, 401, "guest_token");
        }
    }
    const cookieBlob = candidates.find((c)=>c.includes(";") || c.toLowerCase().includes("aux_sid") || c.toLowerCase().includes("ff_session")) || candidates[0];
    const token = await exchangeAdobeCookieForAccessToken(cookieBlob, fetchImpl);
    if (isAdobeGuestAccessToken(token)) {
        throw new AdobeFireflyError(GUEST_COOKIE_HELP, 401, "guest_token");
    }
    return token;
}
function readQuotaBlock(block) {
    if (!block || typeof block !== "object") return {
        total: 0,
        used: 0,
        available: 0
    };
    const q = block.quota && typeof block.quota === "object" ? block.quota : block;
    const total = Number(q.total ?? 0);
    const used = Number(q.used ?? 0);
    const available = Number(q.available ?? Math.max(0, total - used));
    return {
        total: Number.isFinite(total) ? total : 0,
        used: Number.isFinite(used) ? used : 0,
        available: Number.isFinite(available) ? available : 0
    };
}
function parseAdobeCreditsBalance(body) {
    const root = body && typeof body === "object" ? body : {};
    const totalBlock = readQuotaBlock(root.total);
    const credits = root.credits && typeof root.credits === "object" ? root.credits : {};
    const free = readQuotaBlock(credits.firefly_free_credit);
    const plan = readQuotaBlock(credits.firefly_plan_credit);
    // Prefer top-level total; fall back to free+plan sum when total missing.
    let total = totalBlock.total;
    let used = totalBlock.used;
    let remaining = totalBlock.available;
    if (total <= 0 && (free.total > 0 || plan.total > 0)) {
        total = free.total + plan.total;
        used = free.used + plan.used;
        remaining = free.available + plan.available;
    }
    if (remaining <= 0 && total > 0) remaining = Math.max(0, total - used);
    const availableUntil = root.total && typeof root.total === "object" && typeof root.total.availableUntil === "string" ? String(root.total.availableUntil) : null;
    return {
        total,
        used,
        remaining,
        availableUntil,
        freeTotal: free.total,
        freeUsed: free.used,
        freeRemaining: free.available,
        planTotal: plan.total,
        planUsed: plan.used,
        planRemaining: plan.available,
        raw: body
    };
}
async function fetchAdobeCreditsBalance(accessToken, fetchImpl = fetch) {
    const resp = await fetchImpl(ADOBE_FIREFLY_CREDITS_BALANCE_URL, {
        method: "GET",
        headers: buildAdobeBalanceHeaders(accessToken)
    });
    if (resp.status === 401 || resp.status === 403) {
        throw new AdobeFireflyError("Adobe Firefly balance: token invalid or expired", 401, "auth");
    }
    if (!resp.ok) {
        const text = await resp.text().catch(()=>"");
        throw new AdobeFireflyError(`Adobe Firefly balance failed (${resp.status}): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(text.slice(0, 200))}`, 502);
    }
    const data = await resp.json().catch(()=>({}));
    return parseAdobeCreditsBalance(data);
}
function parseAdobeModelsDiscovery(body) {
    const root = body && typeof body === "object" ? body : {};
    const models = Array.isArray(root.models) ? root.models : [];
    const out = [];
    for (const m of models){
        if (!m || typeof m !== "object") continue;
        const rec = m;
        const modelId = String(rec.modelId || "").trim();
        if (!modelId) continue;
        const versions = rec.modelVersions && typeof rec.modelVersions === "object" ? rec.modelVersions : {};
        for (const [ver, spec] of Object.entries(versions)){
            if (!spec || typeof spec !== "object") continue;
            const s = spec;
            if (s.enabled === false) continue;
            const mods = Array.isArray(s.outputModality) ? s.outputModality.map((x)=>String(x).toLowerCase()) : [];
            let modality = "unknown";
            if (mods.includes("image")) modality = "image";
            else if (mods.includes("video")) modality = "video";
            else if (mods.includes("audio")) modality = "audio";
            out.push({
                modelId,
                modelVersion: ver,
                displayName: String(s.modelDisplayName || s.modelCaiDisplayName || ver),
                modality,
                enabled: s.enabled !== false,
                healthStatus: typeof s.healthStatus === "string" ? s.healthStatus : undefined
            });
        }
    }
    return out;
}
async function discoverAdobeFireflyModels(accessToken, fetchImpl = fetch) {
    const resp = await fetchImpl(ADOBE_FIREFLY_MODELS_DISCOVERY_URL, {
        method: "POST",
        headers: buildAdobeDiscoveryHeaders(accessToken),
        body: JSON.stringify({
            filters: {
                resolveSchema: true
            }
        })
    });
    if (resp.status === 401 || resp.status === 403) {
        throw new AdobeFireflyError("Adobe Firefly model discovery: token invalid or expired", 401, "auth");
    }
    if (!resp.ok) {
        const text = await resp.text().catch(()=>"");
        throw new AdobeFireflyError(`Adobe Firefly model discovery failed (${resp.status}): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(text.slice(0, 200))}`, 502);
    }
    const data = await resp.json().catch(()=>({}));
    return parseAdobeModelsDiscovery(data);
}
async function sleep(ms) {
    await new Promise((resolve)=>setTimeout(resolve, ms));
}
async function pollAdobeJob(opts) {
    const fetchImpl = opts.fetchImpl || fetch;
    const deadline = Date.now() + opts.timeoutMs;
    const interval = opts.pollIntervalMs && opts.pollIntervalMs > 0 ? opts.pollIntervalMs : DEFAULT_POLL_INTERVAL_MS;
    let attempt = 0;
    let latest = {};
    while(Date.now() < deadline){
        attempt += 1;
        const pollResp = await fetchImpl(opts.pollUrl, {
            method: "GET",
            headers: buildAdobePollHeaders(opts.accessToken)
        });
        if (pollResp.status === 401 || pollResp.status === 403) {
            const accessError = pollResp.headers.get("x-access-error") || "";
            if (accessError === "taste_exhausted") {
                throw new AdobeFireflyError("Adobe Firefly quota exhausted for this account", 429, "quota_exhausted");
            }
            throw new AdobeFireflyError("Adobe Firefly token invalid or expired", 401, "auth");
        }
        if (!pollResp.ok) {
            const text = await pollResp.text().catch(()=>"");
            if (pollResp.status === 408 || pollResp.status === 429 || pollResp.status === 451 || pollResp.status >= 500 || isAdobeTransientSubmitError(pollResp.status, text)) {
                opts.log?.info?.("ADOBE-FIREFLY", `poll temporary ${pollResp.status}, attempt #${attempt}`);
                await sleep(interval);
                continue;
            }
            throw new AdobeFireflyError(`Adobe Firefly poll failed (${pollResp.status}): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(text.slice(0, 300))}`, 502);
        }
        latest = await pollResp.json().catch(()=>({}));
        const statusHeader = String(pollResp.headers.get("x-task-status") || "").toUpperCase();
        const statusVal = String((latest && typeof latest === "object" ? latest.status : "") || statusHeader || "").toUpperCase();
        const mediaUrl = extractAdobeMediaUrl(latest, opts.kind);
        if (mediaUrl) {
            return {
                mediaUrl,
                latest
            };
        }
        if (isAdobeJobFailed(statusVal)) {
            throw new AdobeFireflyError(`Adobe Firefly ${opts.kind} job failed: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(JSON.stringify(latest).slice(0, 300))}`, 502, "job_failed");
        }
        opts.log?.info?.("ADOBE-FIREFLY", `${opts.kind} pending #${attempt} status=${statusVal || "unknown"}`);
        await sleep(interval);
    }
    throw new AdobeFireflyError(`Adobe Firefly ${opts.kind} generation timed out`, 504, "timeout");
}
// Colligo often returns instant 408 with x-colligo-timeout:0.0 under load.
// Keep retries short: hammering Adobe with 8 long waits makes the Media page
// look broken while balance still works. SPA succeeds on a healthy queue/token.
const SUBMIT_MAX_ATTEMPTS = 4;
const SUBMIT_BASE_DELAY_MS = 1200;
async function adobeFireflyGenerateImage(opts) {
    const fetchImpl = opts.fetchImpl || fetch;
    const { spec } = resolveAdobeImageModel(opts.model);
    const aspectRatio = normalizeAdobeAspectRatio(opts.aspectRatio ?? opts.size, "1:1");
    const outputResolution = normalizeAdobeOutputResolution(opts.quality, opts.size);
    const payload = buildAdobeImagePayload({
        prompt: opts.prompt,
        aspectRatio,
        outputResolution,
        modelSpec: spec,
        quality: opts.quality,
        seed: opts.seed,
        sourceImageIds: opts.sourceImageIds,
        negativePrompt: opts.negativePrompt
    });
    const sessionCookie = String(opts.sessionCookie || "").trim();
    const cookieHeader = extractAdobeCookieHeader(sessionCookie);
    // Prefer real browser sherlockToken; buildAdobeSubmitHeaders mints synthetic ARP if empty.
    const arpSessionId = extractAdobeArpSessionId(cookieHeader) || extractAdobeArpSessionId(sessionCookie);
    let submitData = {};
    let submitHeaders = new Headers();
    let lastSubmitError = "";
    let sawSystemUnderLoad = false;
    for(let attempt = 1; attempt <= SUBMIT_MAX_ATTEMPTS; attempt++){
        // Deterministic x-nonce from user_id+prompt (adobe2api/GPT2Image-Pro). Fresh ARP each attempt.
        const submitResp = await fetchImpl(ADOBE_FIREFLY_IMAGE_SUBMIT_URL, {
            method: "POST",
            headers: buildAdobeSubmitHeaders(opts.accessToken, {
                arpSessionId: arpSessionId || undefined,
                prompt: opts.prompt,
                cookie: cookieHeader || undefined
            }),
            body: JSON.stringify(payload)
        });
        if (submitResp.status === 401 || submitResp.status === 403) {
            const accessError = submitResp.headers.get("x-access-error") || "";
            if (accessError === "taste_exhausted") {
                throw new AdobeFireflyError("Adobe Firefly quota exhausted for this account", 429, "quota_exhausted");
            }
            throw new AdobeFireflyError("Adobe Firefly token invalid or expired. Paste a fresh IMS JWT (Authorization: Bearer on firefly-3p), not page cookies alone.", 401, "auth");
        }
        if (!submitResp.ok) {
            const text = await submitResp.text().catch(()=>"");
            if (isAdobeTransientSubmitError(submitResp.status, text)) {
                sawSystemUnderLoad = true;
            }
            lastSubmitError = `Adobe Firefly image submit failed (${submitResp.status}): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(text.slice(0, 300))}`;
            if (isAdobeTransientSubmitError(submitResp.status, text) && attempt < SUBMIT_MAX_ATTEMPTS) {
                // Exponential backoff: 2s, 4s, 8s, 16s… capped at 45s (+ jitter)
                const delay = Math.min(45_000, SUBMIT_BASE_DELAY_MS * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 750);
                opts.log?.info?.("ADOBE-FIREFLY", `image submit transient ${submitResp.status}, retry ${attempt}/${SUBMIT_MAX_ATTEMPTS} in ${delay}ms`);
                await sleep(delay);
                continue;
            }
            if (sawSystemUnderLoad && isAdobeTransientSubmitError(submitResp.status, text)) {
                throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("image", attempt), 408, "system_under_load");
            }
            throw new AdobeFireflyError(lastSubmitError, submitResp.status >= 400 && submitResp.status < 500 ? submitResp.status : 502);
        }
        submitData = await submitResp.json().catch(()=>({}));
        submitHeaders = submitResp.headers;
        break;
    }
    let pollUrl = extractAdobeResultLink(submitHeaders, submitData);
    if (!pollUrl) {
        if (sawSystemUnderLoad) {
            throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("image", SUBMIT_MAX_ATTEMPTS), 408, "system_under_load");
        }
        throw new AdobeFireflyError(lastSubmitError || "Adobe Firefly image submit succeeded but no poll URL was returned", 502);
    }
    pollUrl = normalizeAdobePollUrl(pollUrl);
    const pollTimeoutMs = adobeFireflyImageTimeoutMs({
        timeoutMs: opts.timeoutMs,
        refCount: opts.sourceImageIds?.length ?? 0
    });
    const { mediaUrl, latest } = await pollAdobeJob({
        pollUrl,
        accessToken: opts.accessToken,
        kind: "image",
        timeoutMs: pollTimeoutMs,
        fetchImpl,
        log: opts.log
    });
    return {
        url: mediaUrl,
        latest
    };
}
async function adobeFireflyGenerateVideo(opts) {
    const fetchImpl = opts.fetchImpl || fetch;
    const { spec } = resolveAdobeVideoModel(opts.model);
    const aspectRatio = normalizeAdobeAspectRatio(opts.aspectRatio ?? opts.size, "16:9");
    const duration = typeof opts.duration === "number" ? opts.duration : typeof opts.duration === "string" && opts.duration.trim() ? Number(opts.duration) : spec.defaultDuration;
    const resolution = typeof opts.resolution === "string" && opts.resolution.trim() ? opts.resolution : typeof opts.quality === "string" && /p$/i.test(opts.quality) ? opts.quality : spec.defaultResolution;
    const payload = buildAdobeVideoPayload({
        prompt: opts.prompt,
        aspectRatio,
        duration: Number.isFinite(duration) ? Number(duration) : spec.defaultDuration,
        modelSpec: spec,
        resolution,
        seed: opts.seed,
        sourceImageIds: opts.sourceImageIds,
        negativePrompt: opts.negativePrompt,
        generateAudio: opts.generateAudio
    });
    const sessionCookie = String(opts.sessionCookie || "").trim();
    const cookieHeader = extractAdobeCookieHeader(sessionCookie);
    const arpSessionId = extractAdobeArpSessionId(cookieHeader) || extractAdobeArpSessionId(sessionCookie);
    let submitData = {};
    let submitHeaders = new Headers();
    let lastSubmitError = "";
    let sawSystemUnderLoad = false;
    for(let attempt = 1; attempt <= SUBMIT_MAX_ATTEMPTS; attempt++){
        const submitResp = await fetchImpl(ADOBE_FIREFLY_VIDEO_SUBMIT_URL, {
            method: "POST",
            headers: buildAdobeSubmitHeaders(opts.accessToken, {
                arpSessionId: arpSessionId || undefined,
                prompt: opts.prompt,
                cookie: cookieHeader || undefined
            }),
            body: JSON.stringify(payload)
        });
        if (submitResp.status === 401 || submitResp.status === 403) {
            const accessError = submitResp.headers.get("x-access-error") || "";
            if (accessError === "taste_exhausted") {
                throw new AdobeFireflyError("Adobe Firefly quota exhausted for this account", 429, "quota_exhausted");
            }
            throw new AdobeFireflyError("Adobe Firefly token invalid or expired. Paste a fresh IMS JWT (Authorization: Bearer on firefly-3p), not page cookies alone.", 401, "auth");
        }
        if (!submitResp.ok) {
            const text = await submitResp.text().catch(()=>"");
            if (isAdobeTransientSubmitError(submitResp.status, text)) {
                sawSystemUnderLoad = true;
            }
            lastSubmitError = `Adobe Firefly video submit failed (${submitResp.status}): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(text.slice(0, 300))}`;
            if (isAdobeTransientSubmitError(submitResp.status, text) && attempt < SUBMIT_MAX_ATTEMPTS) {
                const delay = Math.min(45_000, SUBMIT_BASE_DELAY_MS * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 750);
                opts.log?.info?.("ADOBE-FIREFLY", `video submit transient ${submitResp.status}, retry ${attempt}/${SUBMIT_MAX_ATTEMPTS} in ${delay}ms`);
                await sleep(delay);
                continue;
            }
            if (sawSystemUnderLoad && isAdobeTransientSubmitError(submitResp.status, text)) {
                throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("video", attempt), 408, "system_under_load");
            }
            throw new AdobeFireflyError(lastSubmitError, submitResp.status >= 400 && submitResp.status < 500 ? submitResp.status : 502);
        }
        submitData = await submitResp.json().catch(()=>({}));
        submitHeaders = submitResp.headers;
        break;
    }
    let pollUrl = extractAdobeResultLink(submitHeaders, submitData);
    if (!pollUrl) {
        if (sawSystemUnderLoad) {
            throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("video", SUBMIT_MAX_ATTEMPTS), 408, "system_under_load");
        }
        throw new AdobeFireflyError(lastSubmitError || "Adobe Firefly video submit succeeded but no poll URL was returned", 502);
    }
    pollUrl = normalizeAdobePollUrl(pollUrl);
    const { mediaUrl, latest } = await pollAdobeJob({
        pollUrl,
        accessToken: opts.accessToken,
        kind: "video",
        timeoutMs: opts.timeoutMs && opts.timeoutMs > 0 ? opts.timeoutMs : DEFAULT_VIDEO_TIMEOUT_MS,
        fetchImpl,
        log: opts.log
    });
    return {
        url: mediaUrl,
        format: "mp4",
        latest
    };
}
}),
"[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MinIntervalThrottle",
    ()=>MinIntervalThrottle,
    "getQuotaFetchThrottle",
    ()=>getQuotaFetchThrottle,
    "resetQuotaFetchThrottle",
    ()=>resetQuotaFetchThrottle,
    "resolveQuotaFetchMinIntervalMs",
    ()=>resolveQuotaFetchMinIntervalMs,
    "throttleQuotaFetch",
    ()=>throttleQuotaFetch
]);
/**
 * quotaFetchThrottle.ts — global min-interval throttle for upstream quota fetches (#6009).
 *
 * Problem: when many accounts on one IP fetch provider quota, firing all the
 * network calls in the same second looks like automation to the upstream and
 * — per router-for-me/CLIProxyAPI#2385 — can get a Codex OAuth token revoked.
 *
 * Solution: serialize the *actual network calls* through a single gate that
 * spaces each fetch start at least `minIntervalMs` (+ optional jitter) after the
 * previous one. Cache hits never reach the gate (the fetcher returns early), so
 * this only paces genuine upstream requests, and it is fail-open: `acquire()`
 * only ever awaits a timer, it cannot throw the quota fetch off its fail-open path.
 *
 * `minIntervalMs = 0` disables throttling entirely (byte-identical to before).
 */ const DEFAULT_MIN_INTERVAL_MS = 250;
const MAX_MIN_INTERVAL_MS = 5000;
const DEFAULT_JITTER_MS = 120;
const realClock = {
    now: ()=>Date.now(),
    sleep: (ms)=>new Promise((resolve)=>setTimeout(resolve, ms))
};
class MinIntervalThrottle {
    minIntervalMs;
    jitterMs;
    clock;
    rand;
    lastStart = 0;
    chain = Promise.resolve();
    constructor(options){
        this.minIntervalMs = Math.max(0, options.minIntervalMs);
        this.jitterMs = Math.max(0, options.jitterMs ?? 0);
        this.clock = options.clock ?? realClock;
        this.rand = options.rand ?? Math.random;
    }
    async acquire() {
        if (this.minIntervalMs <= 0) return; // throttling disabled — no serialization cost
        const prev = this.chain;
        let release;
        this.chain = new Promise((resolve)=>{
            release = resolve;
        });
        try {
            await prev;
            const now = this.clock.now();
            if (this.lastStart !== 0) {
                const jitter = this.jitterMs > 0 ? Math.floor(this.rand() * this.jitterMs) : 0;
                const wait = this.lastStart + this.minIntervalMs + jitter - now;
                if (wait > 0) await this.clock.sleep(wait);
            }
            this.lastStart = this.clock.now();
        } finally{
            release();
        }
    }
}
function resolveQuotaFetchMinIntervalMs(env = process.env) {
    const raw = env.OMNIROUTE_QUOTA_FETCH_MIN_INTERVAL_MS;
    if (raw === undefined || raw === null || raw.trim() === "") return DEFAULT_MIN_INTERVAL_MS;
    const n = Number(raw.trim());
    if (!Number.isFinite(n) || n < 0) return DEFAULT_MIN_INTERVAL_MS;
    return Math.min(Math.round(n), MAX_MIN_INTERVAL_MS);
}
// ─── Shared process-wide instance (used by the provider quota fetchers) ───────
let _sharedThrottle = null;
function getQuotaFetchThrottle() {
    if (!_sharedThrottle) {
        _sharedThrottle = new MinIntervalThrottle({
            minIntervalMs: resolveQuotaFetchMinIntervalMs(),
            jitterMs: DEFAULT_JITTER_MS
        });
    }
    return _sharedThrottle;
}
function throttleQuotaFetch() {
    return getQuotaFetchThrottle().acquire();
}
function resetQuotaFetchThrottle() {
    _sharedThrottle = null;
}
}),
"[project]/open-sse/services/newApiAggregatorQuotaFetcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * newApiAggregatorQuotaFetcher.ts — Generalized New-API / One-API / Sub2API
 * Aggregator Balance Quota Fetcher
 *
 * Generalizes the AgentRouter (agentrouterQuotaFetcher.ts) balance detection
 * so any OpenAI/Anthropic-compatible custom node pointing at a self-hosted
 * New-API / One-API / Sub2API gateway can report its balance.
 *
 * New-API (QuantumNous/new-api, a fork of One API) exposes:
 *
 *   GET {base}/api/user/self
 *     Authorization: Bearer {systemAccessToken}
 *     New-Api-User: {userId}
 *   -> { "data": { "quota": <int> } }  (raw New-API credit units)
 *
 * `quota_per_unit` (units per $1) defaults to 500000, overridable via
 * `providerSpecificData.quotaPerUnit`.
 *
 * Credentials: the System Access Token + New-Api-User id are read from
 * `connection.providerSpecificData.consoleApiKey` (reusing the existing generic
 * field, same precedent as AgentRouter/Bailian) and
 * `connection.providerSpecificData.newApiUserId` respectively.
 *
 * The `newApiAggregatorBalance` boolean flag in providerSpecificData must be
 * `true` for the fetcher to activate — this is the opt-in toggle.
 *
 * Cache: in-memory TTL (60s), same pattern as sibling fetchers.
 *
 * Registration: this module exports fetchNewApiAggregatorQuota for dynamic
 * dispatch; it does NOT self-register against a static provider key.
 * Dynamic dispatch is handled by quotaPreflight.ts + quotaMonitor.ts.
 */ __turbopack_context__.s([
    "fetchNewApiAggregatorQuota",
    ()=>fetchNewApiAggregatorQuota,
    "invalidateNewApiAggregatorQuotaCache",
    ()=>invalidateNewApiAggregatorQuotaCache,
    "isNewApiAggregatorBalanceConnection",
    ()=>isNewApiAggregatorBalanceConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)");
;
;
const SELF_PATH = "/api/user/self";
// New-API-wide default: units per $1. See #6850 — can be hardcoded rather
// than fetched from /api/status on every call.
const DEFAULT_QUOTA_PER_UNIT = 500_000;
const CACHE_TTL_MS = 60_000; // 60 seconds
const quotaCache = new Map();
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
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
/**
 * Strip trailing `/v1` (or `/v1/`) from a baseUrl so that node URLs like
 * `https://host/v1` still hit `{host}/api/user/self` rather than
 * `{host}/v1/api/user/self`.
 */ function stripV1Suffix(baseUrl) {
    return baseUrl.replace(/\/v1\/?$/, "");
}
function extractCredentials(connection) {
    const providerSpecificData = toRecord(connection?.providerSpecificData);
    const systemAccessToken = typeof providerSpecificData.consoleApiKey === "string" && providerSpecificData.consoleApiKey.trim().length > 0 ? providerSpecificData.consoleApiKey : null;
    const userId = typeof providerSpecificData.newApiUserId === "string" && providerSpecificData.newApiUserId.trim().length > 0 ? providerSpecificData.newApiUserId : null;
    const rawBaseUrl = typeof providerSpecificData.baseUrl === "string" && providerSpecificData.baseUrl.trim().length > 0 ? providerSpecificData.baseUrl.trim() : null;
    const baseUrl = rawBaseUrl ? stripV1Suffix(rawBaseUrl) : null;
    const rawQuotaPerUnit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(providerSpecificData.quotaPerUnit, 0);
    const quotaPerUnit = rawQuotaPerUnit > 0 ? rawQuotaPerUnit : DEFAULT_QUOTA_PER_UNIT;
    const aggregatorFlag = providerSpecificData.newApiAggregatorBalance === true;
    return {
        systemAccessToken,
        userId,
        baseUrl,
        quotaPerUnit,
        aggregatorFlag
    };
}
function parseNewApiAggregatorQuotaResponse(data, quotaPerUnit) {
    const obj = toRecord(data);
    const dataObj = toRecord(obj.data);
    const rawQuotaValue = "quota" in dataObj ? dataObj.quota : obj.quota;
    if (rawQuotaValue === undefined) return null;
    const rawQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(rawQuotaValue, -1);
    if (rawQuota < 0) return null;
    const dollarBalance = rawQuota / quotaPerUnit;
    const limitReached = rawQuota <= 0;
    // No known upstream "total" grant to compute a real percentage against — follow
    // DeepSeek's boolean-availability precedent (0% used = has balance, 100% = exhausted).
    const percentUsed = limitReached ? 1 : 0;
    return {
        used: percentUsed * 100,
        total: 100,
        percentUsed,
        resetAt: null,
        rawQuota,
        dollarBalance,
        limitReached
    };
}
async function fetchNewApiAggregatorQuota(connectionId, connection) {
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    const { systemAccessToken, userId, baseUrl, quotaPerUnit, aggregatorFlag } = extractCredentials(connection);
    if (!aggregatorFlag) return null;
    if (!systemAccessToken || !userId || !baseUrl) return null;
    const url = `${baseUrl}${SELF_PATH}`;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${systemAccessToken}`,
                "New-Api-User": userId,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(8_000)
        });
        if (response.status === 401 || response.status === 403) {
            quotaCache.delete(connectionId);
            return null;
        }
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        const quota = parseNewApiAggregatorQuotaResponse(data, quotaPerUnit);
        if (!quota) return null;
        quotaCache.set(connectionId, {
            quota,
            fetchedAt: Date.now()
        });
        return quota;
    } catch  {
        return null;
    }
}
function invalidateNewApiAggregatorQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function isNewApiAggregatorBalanceConnection(connection) {
    const providerSpecificData = toRecord(connection?.providerSpecificData);
    return providerSpecificData.newApiAggregatorBalance === true;
}
}),
"[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "evaluateQuotaCutoff",
    ()=>evaluateQuotaCutoff,
    "getAllProviderQuotaWindows",
    ()=>getAllProviderQuotaWindows,
    "getQuotaFetcher",
    ()=>getQuotaFetcher,
    "getQuotaWindows",
    ()=>getQuotaWindows,
    "isQuotaPreflightEnabled",
    ()=>isQuotaPreflightEnabled,
    "preflightQuota",
    ()=>preflightQuota,
    "registerQuotaFetcher",
    ()=>registerQuotaFetcher,
    "registerQuotaWindows",
    ()=>registerQuotaWindows,
    "resolveDynamicQuotaFetcher",
    ()=>resolveDynamicQuotaFetcher
]);
/**
 * quotaPreflight.ts — Feature 04
 * Quota Preflight & Troca Proativa de Conta
 *
 * Providers register quota fetchers via registerQuotaFetcher(). The caller
 * (`src/sse/services/auth.ts::getProviderCredentialsWithQuotaPreflight`) is
 * responsible for deciding WHEN to invoke preflight — calling it adds the
 * latency of an upstream usage fetch, so it should only run when there's
 * something to enforce (per-connection overrides, per-(provider, window)
 * defaults, or the legacy `quotaPreflightEnabled` flag).
 *
 * Threshold semantics are "minimum remaining %" — matching the dashboard's
 * quota bars, which show remaining (not used). A cutoff of 10 means "stop
 * using this connection when it has 10% or less remaining."
 *
 * `isQuotaPreflightEnabled` remains exported for back-compat so the caller
 * can honor the legacy flag, but `preflightQuota` itself no longer gates on
 * it — once you invoke preflight, it runs the fetcher and evaluates.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/compatibleProviderId.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$newApiAggregatorQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/newApiAggregatorQuotaFetcher.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/**
 * Registry of named quota windows per provider. Used by the dashboard to
 * discover which inputs to render in the cutoffs modal. Providers without
 * multiple windows can skip registration — preflight falls back to the
 * single-signal `percentUsed` path in that case.
 */ const quotaWindowsRegistry = new Map();
function registerQuotaWindows(provider, windows) {
    quotaWindowsRegistry.set(provider, [
        ...windows
    ]);
}
function getQuotaWindows(provider) {
    return quotaWindowsRegistry.get(provider) || quotaWindowsRegistry.get(provider.toLowerCase()) || [];
}
function getAllProviderQuotaWindows() {
    return Object.fromEntries(quotaWindowsRegistry);
}
// Thresholds use "minimum remaining %" semantics so the numbers match the
// dashboard's quota bars (which show remaining %). A cutoff of 2 means
// "block when only 2% remaining" (= 98% used). Warn fires earlier — at
// 20% remaining (= 80% used) by default.
const DEFAULT_MIN_REMAINING_PERCENT = 2;
const DEFAULT_WARN_REMAINING_PERCENT = 20;
const REMAINING_PERCENT_EPSILON = 1e-9;
const quotaFetcherRegistry = new Map();
function registerQuotaFetcher(provider, fetcher) {
    quotaFetcherRegistry.set(provider, fetcher);
}
function getQuotaFetcher(provider) {
    return quotaFetcherRegistry.get(provider) || quotaFetcherRegistry.get(provider.toLowerCase());
}
function isQuotaPreflightEnabled(connection) {
    const psd = connection?.providerSpecificData;
    return psd?.quotaPreflightEnabled === true;
}
function resolveOrDefault(resolver, window, fallbackPercent) {
    if (!resolver) return fallbackPercent;
    const raw = resolver(window);
    if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0 && raw <= 100) {
        return raw;
    }
    return fallbackPercent;
}
function remainingPercentFrom(percentUsed) {
    return Math.max(0, (1 - percentUsed) * 100);
}
function isRemainingAtOrBelowThreshold(remainingPercent, thresholdPercent) {
    return remainingPercent <= thresholdPercent + REMAINING_PERCENT_EPSILON;
}
function exhaustedResult(quotaPercent, resetAt) {
    return {
        proceed: false,
        reason: "quota_exhausted",
        quotaPercent,
        resetAt
    };
}
function limitReachedResult(quota) {
    return exhaustedResult(Number.isFinite(quota.percentUsed) ? quota.percentUsed : 1, quota.resetAt ?? null);
}
function quotaWindowCutoffResult(windows, thresholds) {
    let worstUsedPercent = 0;
    let worstWindow = null;
    let worstResetAt = null;
    for (const [windowName, windowInfo] of Object.entries(windows)){
        if (!Number.isFinite(windowInfo.percentUsed)) continue;
        const minRemainingPercent = resolveOrDefault(thresholds?.resolveMinRemainingPercent, windowName, DEFAULT_MIN_REMAINING_PERCENT);
        if (!isRemainingAtOrBelowThreshold(remainingPercentFrom(windowInfo.percentUsed), minRemainingPercent)) {
            continue;
        }
        if (windowInfo.percentUsed <= worstUsedPercent && worstWindow !== null) continue;
        worstUsedPercent = windowInfo.percentUsed;
        worstWindow = windowName;
        worstResetAt = windowInfo.resetAt ?? null;
    }
    return worstWindow === null ? null : exhaustedResult(worstUsedPercent, worstResetAt);
}
function quotaPercentCutoffResult(quota, thresholds) {
    if (!Number.isFinite(quota.percentUsed)) return {
        proceed: true
    };
    const minRemainingPercent = resolveOrDefault(thresholds?.resolveMinRemainingPercent, null, DEFAULT_MIN_REMAINING_PERCENT);
    const remainingPercent = remainingPercentFrom(quota.percentUsed);
    return isRemainingAtOrBelowThreshold(remainingPercent, minRemainingPercent) ? exhaustedResult(quota.percentUsed, quota.resetAt ?? null) : {
        proceed: true,
        quotaPercent: quota.percentUsed
    };
}
function evaluateQuotaCutoff(quota, thresholds) {
    if (!quota) return {
        proceed: true
    };
    if (quota.limitReached === true) return limitReachedResult(quota);
    const windows = quota.windows;
    if (windows && Object.keys(windows).length > 0) {
        return quotaWindowCutoffResult(windows, thresholds) ?? {
            proceed: true,
            quotaPercent: quota.percentUsed
        };
    }
    return quotaPercentCutoffResult(quota, thresholds);
}
function resolveDynamicQuotaFetcher(provider, connection) {
    // Dynamic dispatch only for compatible-provider connection IDs
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCompatibleProviderConnectionId"])(provider)) return undefined;
    // Connection must opt in via providerSpecificData.newApiAggregatorBalance
    const psd = connection?.providerSpecificData;
    if (!psd || psd.newApiAggregatorBalance !== true) return undefined;
    // Feature flag must be enabled
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("NEWAPI_AGGREGATOR_BALANCE")) return undefined;
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$newApiAggregatorQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchNewApiAggregatorQuota"];
}
async function preflightQuota(provider, connectionId, connection, thresholds) {
    // No legacy enable-flag gate here — the caller decides when to invoke us
    // (see file-level docstring). When there's no fetcher we proceed silently.
    let fetcher = getQuotaFetcher(provider);
    if (!fetcher) {
        // Dynamic fallback: for compatible-provider connections with the
        // aggregator flag + feature flag, use the generalized New-API fetcher.
        fetcher = resolveDynamicQuotaFetcher(provider, connection);
        if (!fetcher) {
            return {
                proceed: true
            };
        }
    }
    let quota = null;
    try {
        quota = await fetcher(connectionId, connection);
    } catch  {
        return {
            proceed: true
        };
    }
    if (!quota) {
        return {
            proceed: true
        };
    }
    if (quota.limitReached === true) {
        return limitReachedResult(quota);
    }
    // Per-window evaluation — only when the fetcher surfaces a windows map.
    // We block as soon as ANY single window's remaining quota drops to its
    // configured cutoff or below; warnings are logged independently per window.
    if (quota.windows && Object.keys(quota.windows).length > 0) {
        let worstUsedPercent = 0;
        let worstWindow = null;
        let worstResetAt = null;
        for (const [windowName, windowInfo] of Object.entries(quota.windows)){
            const minRemainingPercent = resolveOrDefault(thresholds?.resolveMinRemainingPercent, windowName, DEFAULT_MIN_REMAINING_PERCENT);
            const warnRemainingPercent = resolveOrDefault(thresholds?.resolveWarnRemainingPercent, windowName, DEFAULT_WARN_REMAINING_PERCENT);
            const remainingPercent = remainingPercentFrom(windowInfo.percentUsed);
            if (isRemainingAtOrBelowThreshold(remainingPercent, minRemainingPercent)) {
                // Track the most-depleted blocking window so the response can name it.
                if (windowInfo.percentUsed > worstUsedPercent) {
                    worstUsedPercent = windowInfo.percentUsed;
                    worstWindow = windowName;
                    worstResetAt = windowInfo.resetAt ?? null;
                } else if (worstWindow === null) {
                    worstWindow = windowName;
                    worstResetAt = windowInfo.resetAt ?? null;
                }
            } else if (isRemainingAtOrBelowThreshold(remainingPercent, warnRemainingPercent)) {
                console.warn(`[QuotaPreflight] ${provider}/${connectionId} ${windowName}: ${remainingPercent.toFixed(1)}% remaining — approaching cutoff`);
            }
        }
        if (worstWindow !== null) {
            const worstRemaining = remainingPercentFrom(worstUsedPercent);
            console.info(`[QuotaPreflight] ${provider}/${connectionId} ${worstWindow}: ${worstRemaining.toFixed(1)}% remaining — switching`);
            return {
                proceed: false,
                reason: "quota_exhausted",
                quotaPercent: worstUsedPercent,
                resetAt: worstResetAt
            };
        }
        return {
            proceed: true,
            quotaPercent: quota.percentUsed
        };
    }
    // Legacy single-signal path for fetchers that don't expose per-window data.
    const minRemainingPercent = resolveOrDefault(thresholds?.resolveMinRemainingPercent, null, DEFAULT_MIN_REMAINING_PERCENT);
    const warnRemainingPercent = resolveOrDefault(thresholds?.resolveWarnRemainingPercent, null, DEFAULT_WARN_REMAINING_PERCENT);
    const { percentUsed } = quota;
    const remainingPercent = remainingPercentFrom(percentUsed);
    if (isRemainingAtOrBelowThreshold(remainingPercent, minRemainingPercent)) {
        console.info(`[QuotaPreflight] ${provider}/${connectionId}: ${remainingPercent.toFixed(1)}% remaining — switching (cutoff ${minRemainingPercent}%)`);
        return {
            proceed: false,
            reason: "quota_exhausted",
            quotaPercent: percentUsed,
            resetAt: quota.resetAt ?? null
        };
    }
    if (isRemainingAtOrBelowThreshold(remainingPercent, warnRemainingPercent)) {
        console.warn(`[QuotaPreflight] ${provider}/${connectionId}: ${remainingPercent.toFixed(1)}% remaining — approaching cutoff`);
    }
    return {
        proceed: true,
        quotaPercent: percentUsed
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/sessionManager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkSessionLimit",
    ()=>checkSessionLimit,
    "clearSessions",
    ()=>clearSessions,
    "consumeToolFinishTime",
    ()=>consumeToolFinishTime,
    "extractExternalSessionId",
    ()=>extractExternalSessionId,
    "generateSessionId",
    ()=>generateSessionId,
    "getActiveSessionCount",
    ()=>getActiveSessionCount,
    "getActiveSessionCountForKey",
    ()=>getActiveSessionCountForKey,
    "getActiveSessions",
    ()=>getActiveSessions,
    "getAllActiveSessionCountsByKey",
    ()=>getAllActiveSessionCountsByKey,
    "getSessionConnection",
    ()=>getSessionConnection,
    "getSessionInfo",
    ()=>getSessionInfo,
    "isSessionRegisteredForKey",
    ()=>isSessionRegisteredForKey,
    "markToolFinish",
    ()=>markToolFinish,
    "registerKeySession",
    ()=>registerKeySession,
    "touchSession",
    ()=>touchSession,
    "unregisterKeySession",
    ()=>unregisterKeySession
]);
/**
 * Session Fingerprinting — Phase 5
 *
 * Generates stable session IDs for sticky routing,
 * prompt caching, and per-session tracking.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
// In-memory session store with metadata
// key: sessionId → { createdAt, lastActive, requestCount, connectionId? }
const sessions = new Map();
// Hard cap on active sessions to prevent memory exhaustion
const MAX_SESSIONS = 200;
// Auto-cleanup sessions older than 15 minutes (reduced from 30)
const SESSION_TTL_MS = 15 * 60 * 1000;
const _cleanupTimer = setInterval(()=>{
    const now = Date.now();
    // Evict expired sessions
    for (const [key, entry] of sessions){
        if (now - entry.lastActive > SESSION_TTL_MS) {
            sessions.delete(key);
            const keysToDelete = [];
            for (const [apiKeyId, sessionSet] of activeSessionsByKey){
                sessionSet.delete(key);
                if (sessionSet.size === 0) keysToDelete.push(apiKeyId);
            }
            for (const k of keysToDelete){
                activeSessionsByKey.delete(k);
            }
        }
    }
    // Hard cap: evict oldest if over limit
    while(sessions.size > MAX_SESSIONS){
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of sessions){
            if (entry.lastActive < oldestTime) {
                oldestTime = entry.lastActive;
                oldestKey = key;
            }
        }
        if (oldestKey === null) break;
        sessions.delete(oldestKey);
        const evictionKeys = [];
        for (const [apiKeyId, sessionSet] of activeSessionsByKey){
            sessionSet.delete(oldestKey);
            if (sessionSet.size === 0) evictionKeys.push(apiKeyId);
        }
        for (const k of evictionKeys){
            activeSessionsByKey.delete(k);
        }
    }
}, 60_000);
if (typeof _cleanupTimer === "object" && "unref" in _cleanupTimer) {
    _cleanupTimer.unref?.();
}
function generateSessionId(body, options = {}) {
    if (!body || typeof body !== "object") return null;
    const parts = [];
    // Model contributes to fingerprint
    if (body.model) parts.push(`model:${body.model}`);
    // Provider binding
    if (options.provider) parts.push(`provider:${options.provider}`);
    // System prompt hash (first 32 chars of system content)
    const systemPrompt = extractSystemPrompt(body);
    if (systemPrompt) {
        parts.push(`sys:${hashShort(systemPrompt)}`);
    }
    // First user message hash (identifies the conversation)
    const firstUser = extractFirstUserMessage(body);
    if (firstUser) {
        parts.push(`user0:${hashShort(firstUser)}`);
    }
    // Tools signature (sorted names)
    if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
        const toolNames = body.tools.map((t)=>t.name || t.function?.name || "").filter(Boolean).sort().join(",");
        if (toolNames) parts.push(`tools:${hashShort(toolNames)}`);
    }
    // Connection ID for sticky routing
    if (options.connectionId) parts.push(`conn:${options.connectionId}`);
    if (parts.length === 0) return null;
    const fingerprint = parts.join("|");
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(fingerprint).digest("hex").slice(0, 16);
}
function touchSession(sessionId, connectionId = null) {
    if (!sessionId) return;
    const existing = sessions.get(sessionId);
    if (existing) {
        existing.lastActive = Date.now();
        existing.requestCount++;
        if (connectionId) existing.connectionId = connectionId;
    } else {
        sessions.set(sessionId, {
            createdAt: Date.now(),
            lastActive: Date.now(),
            requestCount: 1,
            connectionId
        });
    }
}
function markToolFinish(sessionId) {
    if (!sessionId) return;
    const session = sessions.get(sessionId);
    if (session) session.lastToolFinishAt = Date.now();
}
function consumeToolFinishTime(sessionId) {
    if (!sessionId) return null;
    const session = sessions.get(sessionId);
    if (!session?.lastToolFinishAt) return null;
    const ts = session.lastToolFinishAt;
    session.lastToolFinishAt = undefined;
    return ts;
}
function getSessionInfo(sessionId) {
    if (!sessionId) return null;
    const entry = sessions.get(sessionId);
    if (!entry) return null;
    if (Date.now() - entry.lastActive > SESSION_TTL_MS) {
        sessions.delete(sessionId);
        return null;
    }
    return {
        ...entry
    };
}
function getSessionConnection(sessionId) {
    const info = getSessionInfo(sessionId);
    return info?.connectionId || null;
}
function getActiveSessionCount() {
    return sessions.size;
}
function getActiveSessions() {
    const now = Date.now();
    const result = [];
    for (const [id, entry] of sessions){
        if (now - entry.lastActive <= SESSION_TTL_MS) {
            result.push({
                sessionId: id,
                ...entry,
                ageMs: now - entry.createdAt
            });
        }
    }
    return result;
}
function clearSessions() {
    sessions.clear();
    activeSessionsByKey.clear();
}
// ─── T08: Per-API-Key Session Limit ─────────────────────────────────────────
// Tracks concurrent sticky sessions per API key and enforces max_sessions limits.
// Ref: sub2api PR #634 (fix: stabilize session hash + add user-level session limit)
// Map: apiKeyId → Set<sessionId>
const activeSessionsByKey = new Map();
function getActiveSessionCountForKey(apiKeyId) {
    return activeSessionsByKey.get(apiKeyId)?.size ?? 0;
}
function getAllActiveSessionCountsByKey() {
    const out = {};
    for (const [apiKeyId, sessionIds] of activeSessionsByKey){
        out[apiKeyId] = sessionIds.size;
    }
    return out;
}
function registerKeySession(apiKeyId, sessionId) {
    if (!activeSessionsByKey.has(apiKeyId)) {
        activeSessionsByKey.set(apiKeyId, new Set());
    }
    activeSessionsByKey.get(apiKeyId).add(sessionId);
}
function isSessionRegisteredForKey(apiKeyId, sessionId) {
    return activeSessionsByKey.get(apiKeyId)?.has(sessionId) === true;
}
function unregisterKeySession(apiKeyId, sessionId) {
    activeSessionsByKey.get(apiKeyId)?.delete(sessionId);
    // Clean up empty sets to avoid memory leaks
    if (activeSessionsByKey.get(apiKeyId)?.size === 0) {
        activeSessionsByKey.delete(apiKeyId);
    }
}
function checkSessionLimit(apiKeyId, maxSessions) {
    if (!maxSessions || maxSessions <= 0) return null; // unlimited
    const current = getActiveSessionCountForKey(apiKeyId);
    if (current < maxSessions) return null;
    return {
        code: "SESSION_LIMIT_EXCEEDED",
        message: `You have reached the maximum number of active sessions (${maxSessions}). ` + `Please close unused sessions or wait for them to expire.`,
        limit: maxSessions,
        current
    };
}
function extractExternalSessionId(headers) {
    if (!headers || typeof headers.get !== "function") return null;
    const h = headers;
    const raw = h.get("x-session-id") ?? // Preferred: hyphenated (passes through Nginx)
    h.get("x_session_id") ?? // Underscore variant (direct HTTP / custom clients)
    h.get("x-omniroute-session") ?? // OmniRoute-specific form
    h.get("session-id") ?? // Bare session-id
    null;
    if (!raw || !raw.trim()) return null;
    // Prefix "ext:" to ensure no collision with internal SHA-256 hash IDs
    return `ext:${raw.trim().slice(0, 64)}`; // max 64 chars to avoid abuse
}
// ─── Internal Helpers ───────────────────────────────────────────────────────
function hashShort(text) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(text).digest("hex").slice(0, 8);
}
function extractSystemPrompt(body) {
    if (!body || typeof body !== "object") return null;
    // Claude format: body.system
    if (body.system) {
        return typeof body.system === "string" ? body.system : JSON.stringify(body.system);
    }
    // OpenAI format: messages[0].role === "system"
    if (Array.isArray(body.messages)) {
        const sys = body.messages.find((m)=>m.role === "system" || m.role === "developer");
        if (sys) {
            return typeof sys.content === "string" ? sys.content : JSON.stringify(sys.content);
        }
    }
    return null;
}
function extractFirstUserMessage(body) {
    if (!body || typeof body !== "object") return null;
    const messages = body.messages || body.input || [];
    if (!Array.isArray(messages)) return null;
    for (const msg of messages){
        if (msg.role === "user") {
            return typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        }
    }
    return null;
}
}),
"[project]/open-sse/services/quotaMonitor.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearQuotaMonitors",
    ()=>clearQuotaMonitors,
    "getActiveMonitorCount",
    ()=>getActiveMonitorCount,
    "getQuotaMonitorSnapshot",
    ()=>getQuotaMonitorSnapshot,
    "getQuotaMonitorSnapshots",
    ()=>getQuotaMonitorSnapshots,
    "getQuotaMonitorSummary",
    ()=>getQuotaMonitorSummary,
    "isQuotaMonitorEnabled",
    ()=>isQuotaMonitorEnabled,
    "registerMonitorFetcher",
    ()=>registerMonitorFetcher,
    "startQuotaMonitor",
    ()=>startQuotaMonitor,
    "stopQuotaMonitor",
    ()=>stopQuotaMonitor
]);
/**
 * quotaMonitor.ts — Feature 06
 * Monitoramento de Quota em Sessão Ativa
 *
 * Toggle: providerSpecificData.quotaMonitorEnabled (default: false)
 * Polling adaptativo: NORMAL (60s) → CRITICAL (15s) → EXHAUSTED
 * timer.unref() garante que o processo pode fechar normalmente.
 * Alertas deduplicados por sessão (janela de 5min).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionManager.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const NORMAL_INTERVAL_MS = 60_000;
const CRITICAL_INTERVAL_MS = 15_000;
const WARN_THRESHOLD = 0.8;
const EXHAUSTION_THRESHOLD = 0.95;
const ALERT_SUPPRESS_WINDOW_MS = 5 * 60_000;
const activeMonitors = new Map();
const MAX_ALERT_ENTRIES = 500;
const alertSuppression = new Map();
const _alertSweep = setInterval(()=>{
    const now = Date.now();
    for (const [key, timestamp] of alertSuppression){
        if (now - timestamp > ALERT_SUPPRESS_WINDOW_MS) alertSuppression.delete(key);
    }
    while(alertSuppression.size > MAX_ALERT_ENTRIES){
        const oldestKey = alertSuppression.keys().next().value;
        if (oldestKey !== undefined) alertSuppression.delete(oldestKey);
        else break;
    }
}, 60_000);
if (typeof _alertSweep === "object" && "unref" in _alertSweep) {
    _alertSweep.unref?.();
}
// Registry mirror from quotaPreflight (same Map reference via re-export)
const quotaFetcherRegistry = new Map();
function registerMonitorFetcher(provider, fetcher) {
    quotaFetcherRegistry.set(provider, fetcher);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])(provider, fetcher);
}
function isQuotaMonitorEnabled(connection) {
    const psd = connection?.providerSpecificData;
    return psd?.quotaMonitorEnabled === true;
}
function suppressedAlert(sessionId, provider, accountId, percentUsed) {
    const key = `${sessionId}:${provider}:${accountId}`;
    const last = alertSuppression.get(key) ?? 0;
    if (Date.now() - last < ALERT_SUPPRESS_WINDOW_MS) return false;
    if (alertSuppression.size >= MAX_ALERT_ENTRIES && !alertSuppression.has(key)) {
        const oldestKey = alertSuppression.keys().next().value;
        if (oldestKey !== undefined) alertSuppression.delete(oldestKey);
    }
    alertSuppression.set(key, Date.now());
    console.warn(`[QuotaMonitor] session=${sessionId} ${provider}/${accountId}: ${(percentUsed * 100).toFixed(1)}% quota used`);
    return true;
}
function toIsoTimestamp(value) {
    return typeof value === "number" && Number.isFinite(value) ? new Date(value).toISOString() : null;
}
function getMonitorStatus(percentUsed) {
    if (!Number.isFinite(percentUsed)) return "idle";
    if (percentUsed >= EXHAUSTION_THRESHOLD) return "exhausted";
    if (percentUsed >= WARN_THRESHOLD) return "warning";
    return "healthy";
}
function toPublicSnapshot(sessionId, state) {
    return {
        sessionId,
        provider: state.provider,
        accountId: state.accountId,
        status: state.status,
        startedAt: new Date(state.startedAt).toISOString(),
        lastPolledAt: toIsoTimestamp(state.lastPolledAt),
        lastSuccessAt: toIsoTimestamp(state.lastSuccessAt),
        lastErrorAt: toIsoTimestamp(state.lastErrorAt),
        lastError: state.lastError,
        lastQuotaPercent: state.lastQuotaPercent,
        lastQuotaUsed: state.lastQuotaUsed,
        lastQuotaTotal: state.lastQuotaTotal,
        lastResetAt: state.lastResetAt,
        lastAlertAt: toIsoTimestamp(state.lastAlertAt),
        nextPollDelayMs: state.nextPollDelayMs,
        nextPollAt: toIsoTimestamp(state.nextPollAt),
        totalPolls: state.totalPolls,
        totalAlerts: state.totalAlerts,
        consecutiveFailures: state.consecutiveFailures
    };
}
function sortSnapshots(snapshots) {
    const severityRank = {
        exhausted: 5,
        warning: 4,
        error: 3,
        starting: 2,
        idle: 1,
        healthy: 0
    };
    return [
        ...snapshots
    ].sort((left, right)=>{
        const severityDelta = severityRank[right.status] - severityRank[left.status];
        if (severityDelta !== 0) return severityDelta;
        const quotaDelta = (right.lastQuotaPercent ?? -1) - (left.lastQuotaPercent ?? -1);
        if (quotaDelta !== 0) return quotaDelta;
        return (right.lastPolledAt ? Date.parse(right.lastPolledAt) : 0) - (left.lastPolledAt ? Date.parse(left.lastPolledAt) : 0);
    });
}
function scheduleNextPoll(sessionId, intervalMs) {
    const state = activeMonitors.get(sessionId);
    if (!state || state.stopped) return;
    state.nextPollDelayMs = intervalMs;
    state.nextPollAt = Date.now() + intervalMs;
    const { provider, accountId } = state;
    const timer = setTimeout(async ()=>{
        const current = activeMonitors.get(sessionId);
        if (!current || current.stopped) return;
        if (current.sessionBound && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionInfo"])(sessionId)) {
            stopQuotaMonitor(sessionId);
            return;
        }
        try {
            let fetcher = quotaFetcherRegistry.get(provider);
            // Dynamic fallback: for compatible-provider connections with the
            // aggregator flag + feature flag, use the generalized New-API fetcher.
            if (!fetcher && current.connectionSnapshot) {
                fetcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDynamicQuotaFetcher"])(provider, current.connectionSnapshot);
            }
            if (!fetcher) {
                current.status = current.lastQuotaPercent === null ? "idle" : current.status;
                scheduleNextPoll(sessionId, NORMAL_INTERVAL_MS);
                return;
            }
            current.lastPolledAt = Date.now();
            current.totalPolls += 1;
            const previousStatus = current.status;
            const quota = await fetcher(accountId, current.connectionSnapshot || undefined);
            const percentUsed = quota && typeof quota.percentUsed === "number" && Number.isFinite(quota.percentUsed) ? quota.percentUsed : null;
            current.lastSuccessAt = Date.now();
            current.lastError = null;
            current.lastErrorAt = null;
            current.consecutiveFailures = 0;
            current.lastQuotaPercent = percentUsed;
            current.lastQuotaUsed = quota && typeof quota.used === "number" && Number.isFinite(quota.used) ? quota.used : null;
            current.lastQuotaTotal = quota && typeof quota.total === "number" && Number.isFinite(quota.total) ? quota.total : null;
            current.lastResetAt = quota && typeof quota.resetAt === "string" && quota.resetAt.trim().length > 0 ? quota.resetAt : null;
            current.status = getMonitorStatus(percentUsed);
            if (percentUsed !== null && percentUsed >= EXHAUSTION_THRESHOLD) {
                const emittedAlert = suppressedAlert(sessionId, provider, accountId, percentUsed);
                if (emittedAlert) {
                    current.lastAlertAt = Date.now();
                    current.totalAlerts += 1;
                }
                if (emittedAlert || previousStatus !== "exhausted") {
                    console.info(`[QuotaMonitor] session=${sessionId}: marking ${accountId} for next-session cooldown`);
                }
                scheduleNextPoll(sessionId, CRITICAL_INTERVAL_MS);
            } else if (percentUsed !== null && percentUsed >= WARN_THRESHOLD) {
                const emittedAlert = suppressedAlert(sessionId, provider, accountId, percentUsed);
                if (emittedAlert) {
                    current.lastAlertAt = Date.now();
                    current.totalAlerts += 1;
                }
                scheduleNextPoll(sessionId, CRITICAL_INTERVAL_MS);
            } else {
                scheduleNextPoll(sessionId, NORMAL_INTERVAL_MS);
            }
        } catch (error) {
            current.lastErrorAt = Date.now();
            current.lastError = error instanceof Error ? error.message : String(error);
            current.consecutiveFailures += 1;
            current.status = "error";
            scheduleNextPoll(sessionId, NORMAL_INTERVAL_MS);
        }
    }, intervalMs);
    if (typeof timer.unref === "function") timer.unref();
    state.timer = timer;
}
function startQuotaMonitor(sessionId, provider, accountId, connection) {
    if (!isQuotaMonitorEnabled(connection)) return;
    const current = activeMonitors.get(sessionId);
    if (current && !current.stopped) {
        if (current.provider === provider && current.accountId === accountId) {
            current.connectionSnapshot = connection;
            current.sessionBound = current.sessionBound || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionInfo"])(sessionId) !== null;
            return;
        }
        stopQuotaMonitor(sessionId);
    }
    activeMonitors.set(sessionId, {
        timer: null,
        stopped: false,
        provider,
        accountId,
        connectionSnapshot: connection,
        sessionBound: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionInfo"])(sessionId) !== null,
        status: "starting",
        startedAt: Date.now(),
        lastPolledAt: null,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastError: null,
        lastQuotaPercent: null,
        lastQuotaUsed: null,
        lastQuotaTotal: null,
        lastResetAt: null,
        lastAlertAt: null,
        nextPollDelayMs: null,
        nextPollAt: null,
        totalPolls: 0,
        totalAlerts: 0,
        consecutiveFailures: 0
    });
    scheduleNextPoll(sessionId, NORMAL_INTERVAL_MS);
}
function stopQuotaMonitor(sessionId) {
    const state = activeMonitors.get(sessionId);
    if (!state) return;
    state.stopped = true;
    if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
    }
    activeMonitors.delete(sessionId);
    for (const key of alertSuppression.keys()){
        if (key.startsWith(`${sessionId}:`)) alertSuppression.delete(key);
    }
}
function getActiveMonitorCount() {
    return activeMonitors.size;
}
function getQuotaMonitorSnapshot(sessionId) {
    const state = activeMonitors.get(sessionId);
    if (!state || state.stopped) return null;
    return toPublicSnapshot(sessionId, state);
}
function getQuotaMonitorSnapshots() {
    const snapshots = [];
    for (const [sessionId, state] of activeMonitors){
        if (state.stopped) continue;
        snapshots.push(toPublicSnapshot(sessionId, state));
    }
    return sortSnapshots(snapshots);
}
function getQuotaMonitorSummary() {
    const snapshots = getQuotaMonitorSnapshots();
    const statusCounts = {
        starting: 0,
        idle: 0,
        healthy: 0,
        warning: 0,
        exhausted: 0,
        error: 0
    };
    const byProvider = {};
    for (const snapshot of snapshots){
        statusCounts[snapshot.status] += 1;
        byProvider[snapshot.provider] = (byProvider[snapshot.provider] || 0) + 1;
    }
    return {
        active: snapshots.length,
        alerting: statusCounts.warning + statusCounts.exhausted,
        exhausted: statusCounts.exhausted,
        errors: statusCounts.error,
        statusCounts,
        byProvider
    };
}
function clearQuotaMonitors() {
    for (const sessionId of [
        ...activeMonitors.keys()
    ]){
        stopQuotaMonitor(sessionId);
    }
    alertSuppression.clear();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/openrouterQuotaFetcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "fetchOpenrouterQuota",
    ()=>fetchOpenrouterQuota,
    "fetchOpenrouterQuotaWithFreeWindowPreflight",
    ()=>fetchOpenrouterQuotaWithFreeWindowPreflight,
    "invalidateOpenrouterQuotaCache",
    ()=>invalidateOpenrouterQuotaCache,
    "parseOpenrouterCreditsResponse",
    ()=>parseOpenrouterCreditsResponse,
    "parseOpenrouterKeyResponse",
    ()=>parseOpenrouterKeyResponse,
    "registerOpenrouterQuotaFetcher",
    ()=>registerOpenrouterQuotaFetcher
]);
/**
 * openrouterQuotaFetcher.ts — OpenRouter Key/Credits Quota Fetcher (#6842)
 *
 * Implements QuotaFetcher for the OpenRouter provider (quotaPreflight.ts + quotaMonitor.ts).
 *
 * OpenRouter exposes two official, documented monitoring endpoints
 * (https://openrouter.ai/docs/api/reference/limits):
 *
 *   GET https://openrouter.ai/api/v1/key
 *     -> { data: { limit, limit_remaining, limit_reset, usage, usage_daily,
 *                  usage_weekly, usage_monthly, is_free_tier, byok_usage,
 *                  include_byok_in_limit } }
 *     `limit`/`limit_remaining` are per-key USD credit caps — null means
 *     unlimited/never set. `limit_reset` is null when the cap never resets.
 *
 *   GET https://openrouter.ai/api/v1/credits
 *     -> { data: { total_credits, total_usage } }
 *     Account-level totals; upstream caches this endpoint for ~60s already.
 *
 * We fetch both (credits is a cheap second call, same auth) and merge into one
 * QuotaInfo. Graceful "unknown" on any fetch failure — quota tracking must
 * never block routing (mirrors deepseekQuotaFetcher.ts / bailianQuotaFetcher.ts).
 *
 * Cache: in-memory TTL (45s, inside the 30-60s window OpenRouter's own docs
 * recommend) keyed by connectionId, so combo preflight/monitor polling doesn't
 * hammer the upstream on every request.
 *
 * Registration: call registerOpenrouterQuotaFetcher() once at server startup.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterFreeWindow.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const OPENROUTER_CONFIG = {
    baseUrl: "https://openrouter.ai/api/v1",
    keyPath: "/key",
    creditsPath: "/credits"
};
// Cache TTL — inside OpenRouter's documented 30-60s window.
const CACHE_TTL_MS = 45_000;
const quotaCache = new Map();
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
// ─── Helpers ─────────────────────────────────────────────────────────────────
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toNullableNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
}
function toFiniteNumber(value, fallback = 0) {
    const n = toNullableNumber(value);
    return n === null ? fallback : n;
}
function toIsoOrNull(value) {
    const n = toNullableNumber(value);
    if (n === null) return null;
    const date = new Date(n < 1e12 ? n * 1000 : n);
    if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return null;
    return date.toISOString();
}
function parseOpenrouterKeyResponse(data) {
    const outer = toRecord(data);
    const inner = "data" in outer ? toRecord(outer.data) : outer;
    if (Object.keys(inner).length === 0) return null;
    return {
        limit: toNullableNumber(inner.limit),
        limitRemaining: toNullableNumber(inner.limit_remaining),
        limitReset: toIsoOrNull(inner.limit_reset),
        isFreeTier: inner.is_free_tier === true,
        usage: toFiniteNumber(inner.usage, 0),
        usageDaily: toFiniteNumber(inner.usage_daily, 0),
        usageWeekly: toFiniteNumber(inner.usage_weekly, 0),
        usageMonthly: toFiniteNumber(inner.usage_monthly, 0),
        byokUsage: toNullableNumber(inner.byok_usage),
        includeByokInLimit: inner.include_byok_in_limit === true
    };
}
function parseOpenrouterCreditsResponse(data) {
    const outer = toRecord(data);
    const inner = "data" in outer ? toRecord(outer.data) : outer;
    return {
        totalCredits: toNullableNumber(inner.total_credits),
        totalUsage: toNullableNumber(inner.total_usage)
    };
}
function buildQuotaFromParts(key, credits) {
    const hasCap = key.limit !== null && key.limitRemaining !== null;
    const limitReached = hasCap && key.limitRemaining <= 0;
    const percentUsed = hasCap && key.limit > 0 ? 1 - key.limitRemaining / key.limit : 0;
    const creditBalance = key.limitRemaining !== null ? key.limitRemaining : credits.totalCredits !== null && credits.totalUsage !== null ? credits.totalCredits - credits.totalUsage : null;
    return {
        used: percentUsed * 100,
        total: 100,
        percentUsed,
        resetAt: key.limitReset,
        limitReached,
        limit: key.limit,
        limitRemaining: key.limitRemaining,
        isFreeTier: key.isFreeTier,
        usage: key.usage,
        usageDaily: key.usageDaily,
        usageWeekly: key.usageWeekly,
        usageMonthly: key.usageMonthly,
        byokUsage: key.byokUsage,
        includeByokInLimit: key.includeByokInLimit,
        totalCredits: credits.totalCredits,
        totalUsage: credits.totalUsage,
        creditBalance
    };
}
// ─── Free-Window Preflight (#6842) ───────────────────────────────────────────
/**
 * Build a `limitReached` QuotaInfo from the local `:free`-window daily
 * counter — no upstream I/O, so this is safe to call on every preflight
 * without adding latency or spending a request.
 */ function buildFreeWindowExhaustedQuota(status) {
    const percentUsed = status.dailyLimit > 0 ? status.dailyUsed / status.dailyLimit : 1;
    return {
        used: status.dailyUsed,
        total: status.dailyLimit,
        percentUsed: Math.min(1, Math.max(0, percentUsed)),
        resetAt: status.dailyResetAt,
        limitReached: true
    };
}
/**
 * When the requested model is a `:free` variant and the locally-tracked
 * daily window is already exhausted, short-circuit before any network call:
 * the upstream `/key` + `/credits` fetch below only reports USD spend, never
 * the `:free` request count, so it cannot see this exhaustion on its own —
 * and dispatching the chat request itself would just spend a guaranteed 429.
 */ function checkFreeWindowExhausted(connectionId, connection, requestedModel) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFreeVariantModel"])(typeof requestedModel === "string" ? requestedModel : null)) {
        return null;
    }
    const accountKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAccountKey"])(connectionId, connection);
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFreeWindowStatus"])(accountKey);
    return status.dailyRemaining <= 0 ? buildFreeWindowExhaustedQuota(status) : null;
}
// ─── Core Fetcher ────────────────────────────────────────────────────────────
async function fetchJson(url, apiKey) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(8_000)
        });
        if (!response.ok) return {
            status: response.status,
            data: null
        };
        const data = await response.json();
        return {
            status: response.status,
            data
        };
    } catch  {
        return null;
    }
}
async function fetchOpenrouterQuota(connectionId, connection) {
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    const apiKey = typeof connection?.apiKey === "string" && connection.apiKey.trim().length > 0 ? connection.apiKey : null;
    if (!apiKey) return null;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const keyUrl = `${OPENROUTER_CONFIG.baseUrl}${OPENROUTER_CONFIG.keyPath}`;
        const keyResult = await fetchJson(keyUrl, apiKey);
        // 401/403 on the key endpoint: token invalid — remove from cache, fail open.
        if (!keyResult || keyResult.status === 401 || keyResult.status === 403) {
            quotaCache.delete(connectionId);
            return null;
        }
        if (keyResult.status !== 200) return null;
        const keyFields = parseOpenrouterKeyResponse(keyResult.data);
        if (!keyFields) return null;
        const creditsUrl = `${OPENROUTER_CONFIG.baseUrl}${OPENROUTER_CONFIG.creditsPath}`;
        const creditsResult = await fetchJson(creditsUrl, apiKey);
        const creditsFields = creditsResult && creditsResult.status === 200 ? parseOpenrouterCreditsResponse(creditsResult.data) : {
            totalCredits: null,
            totalUsage: null
        };
        const quota = buildQuotaFromParts(keyFields, creditsFields);
        quotaCache.set(connectionId, {
            quota,
            fetchedAt: Date.now()
        });
        return quota;
    } catch  {
        // Network error, timeout, etc. — fail open (graceful "unknown").
        return null;
    }
}
function invalidateOpenrouterQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
async function fetchOpenrouterQuotaWithFreeWindowPreflight(connectionId, connection) {
    const freeWindowExhausted = checkFreeWindowExhausted(connectionId, connection, connection?.requestedModel);
    return freeWindowExhausted ?? fetchOpenrouterQuota(connectionId, connection);
}
function registerOpenrouterQuotaFetcher() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])("openrouter", fetchOpenrouterQuotaWithFreeWindowPreflight);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])("openrouter", fetchOpenrouterQuotaWithFreeWindowPreflight);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/opencodeOllamaUsage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOllamaCloudUsage",
    ()=>getOllamaCloudUsage,
    "getOpenCodeGoUsage",
    ()=>getOpenCodeGoUsage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
;
// OpenCode Go does not expose a public quota API. There is no working
// opencode.ai endpoint to default to (see #7022) — the quota-by-API-key path
// below is opt-in only and activates exclusively when the operator sets
// OMNIROUTE_OPENCODE_GO_QUOTA_URL explicitly. Never hardcode a third-party
// host here (a previous default silently sent the user's API key to an
// unrelated Z.AI endpoint).
const OPENCODE_GO_QUOTA_URL = process.env.OMNIROUTE_OPENCODE_GO_QUOTA_URL?.trim() || "";
const OPENCODE_GO_DASHBOARD_BASE_URL = process.env.OMNIROUTE_OPENCODE_GO_DASHBOARD_URL ?? "https://opencode.ai/workspace";
const OPENCODE_GO_QUOTA_TOTALS = {
    session: 12,
    weekly: 30,
    mcp_monthly: 60
};
const OPENCODE_GO_QUOTA_ORDER = [
    "session",
    "weekly",
    "mcp_monthly"
];
const OPENCODE_GO_SCRAPED_NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
const OLLAMA_CLOUD_USAGE_URL = process.env.OMNIROUTE_OLLAMA_CLOUD_USAGE_URL ?? "https://ollama.com/settings";
const OLLAMA_CLOUD_SESSION_COOKIE = "__Secure-session";
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function toPercentage(value) {
    return Math.max(0, Math.min(100, toNumber(value, 0)));
}
function toTitleCase(value) {
    return value.trim().split(/[\s_-]+/).filter(Boolean).map((part)=>part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}
function roundCurrency(value) {
    return Math.round(value * 100) / 100;
}
function safeToIsoString(time) {
    if (!Number.isFinite(time) || time < 0 || time > 8.64e15) return null;
    try {
        return new Date(time).toISOString();
    } catch  {
        return null;
    }
}
function parseResetTime(resetValue) {
    const numeric = toNumber(resetValue, Number.NaN);
    if (Number.isFinite(numeric) && numeric > 0) return safeToIsoString(numeric);
    if (typeof resetValue !== "string" || !resetValue.trim()) return null;
    const parsed = Date.parse(resetValue);
    return Number.isFinite(parsed) ? safeToIsoString(parsed) : null;
}
function getProviderSpecificString(data, keys) {
    const obj = toRecord(data);
    for (const key of keys){
        const value = obj[key];
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
}
function resolveOpenCodeGoDashboardConfig(providerSpecificData) {
    const workspaceId = process.env.OMNIROUTE_OPENCODE_GO_WORKSPACE_ID?.trim() || process.env.OPENCODE_GO_WORKSPACE_ID?.trim() || getProviderSpecificString(providerSpecificData, [
        "openCodeGoWorkspaceId",
        "opencodeGoWorkspaceId",
        "workspaceId"
    ]);
    const authCookie = process.env.OMNIROUTE_OPENCODE_GO_AUTH_COOKIE?.trim() || process.env.OPENCODE_GO_AUTH_COOKIE?.trim() || getProviderSpecificString(providerSpecificData, [
        "openCodeGoAuthCookie",
        "opencodeGoAuthCookie",
        "authCookie"
    ]);
    if (!workspaceId && !authCookie) return {
        state: "none"
    };
    if (workspaceId && authCookie) return {
        state: "configured",
        workspaceId,
        authCookie
    };
    return {
        state: "incomplete",
        missing: workspaceId ? "OPENCODE_GO_AUTH_COOKIE" : "OPENCODE_GO_WORKSPACE_ID"
    };
}
function normalizeOpenCodeGoAuthCookie(value) {
    return value.trim().replace(/^auth=/i, "").trim();
}
function buildBearerAuthorization(value) {
    const token = value.trim().replace(/^Bearer\s+/i, "").trim();
    return token ? `Bearer ${token}` : "";
}
function getOpenCodeGoTokenQuotaName(limit, existingQuotas) {
    const unit = toNumber(limit.unit, 0);
    const number = toNumber(limit.number, 0);
    if (unit === 3 && number === 5) return "session";
    if (unit === 6 && number === 1) return "weekly";
    if (unit === 4 && number === 7 || unit === 3 && number >= 24 * 7) return "weekly";
    return existingQuotas.session ? "weekly" : "session";
}
function buildOpenCodeGoDollarQuota(quotaName, percentage, resetAt, usedOverride, details) {
    const total = OPENCODE_GO_QUOTA_TOTALS[quotaName];
    const percentUsed = toPercentage(percentage);
    const rawUsed = toNumber(usedOverride, Number.NaN);
    const used = roundCurrency(Number.isFinite(rawUsed) ? Math.max(0, Math.min(total, rawUsed)) : total * percentUsed / 100);
    const remaining = roundCurrency(Math.max(0, total - used));
    return {
        used,
        total,
        remaining,
        remainingPercentage: total > 0 ? Math.max(0, Math.min(100, Math.round(remaining / total * 100))) : 100,
        resetAt,
        unlimited: false,
        displayName: quotaName === "session" ? "5-hour rolling" : quotaName === "weekly" ? "Weekly" : "Monthly",
        currency: "USD",
        details
    };
}
function orderOpenCodeGoQuotas(quotas) {
    const ordered = {};
    for (const key of OPENCODE_GO_QUOTA_ORDER)if (quotas[key]) ordered[key] = quotas[key];
    for (const [key, quota] of Object.entries(quotas))if (!ordered[key]) ordered[key] = quota;
    return ordered;
}
function parseOpenCodeGoSsrWindow(html, field) {
    for (const candidate of [
        {
            usageIndex: 1,
            resetIndex: 2,
            pattern: String.raw`${field}:\$R\[\d+\]=\{[^}]*usagePercent:${OPENCODE_GO_SCRAPED_NUMBER}[^}]*resetInSec:${OPENCODE_GO_SCRAPED_NUMBER}[^}]*\}`
        },
        {
            usageIndex: 2,
            resetIndex: 1,
            pattern: String.raw`${field}:\$R\[\d+\]=\{[^}]*resetInSec:${OPENCODE_GO_SCRAPED_NUMBER}[^}]*usagePercent:${OPENCODE_GO_SCRAPED_NUMBER}[^}]*\}`
        }
    ]){
        const match = new RegExp(candidate.pattern).exec(html);
        if (!match) continue;
        const usagePercent = toNumber(match[candidate.usageIndex], Number.NaN);
        const resetInSec = toNumber(match[candidate.resetIndex], Number.NaN);
        if (Number.isFinite(usagePercent) && Number.isFinite(resetInSec)) {
            return {
                usagePercent,
                resetAt: safeToIsoString(Date.now() + Math.max(0, resetInSec) * 1000)
            };
        }
    }
    return null;
}
function parseOpenCodeGoHumanReset(value) {
    const text = value.toLowerCase().replace(/\s+/g, " ").trim();
    if ([
        "reset-now",
        "reset now",
        "now",
        "resets now"
    ].includes(text)) return 0;
    const days = text.match(/(\d+(?:\.\d+)?)\s*days?/);
    const hours = text.match(/(\d+(?:\.\d+)?)\s*hours?/);
    const minutes = text.match(/(\d+(?:\.\d+)?)\s*minutes?/);
    const seconds = text.match(/(\d+(?:\.\d+)?)\s*seconds?/);
    if (!days && !hours && !minutes && !seconds) return null;
    return toNumber(days?.[1], 0) * 86_400 + toNumber(hours?.[1], 0) * 3_600 + toNumber(minutes?.[1], 0) * 60 + toNumber(seconds?.[1], 0);
}
function parseOpenCodeGoDashboardHtml(html) {
    const usage = {
        session: parseOpenCodeGoSsrWindow(html, "rollingUsage") ?? undefined,
        weekly: parseOpenCodeGoSsrWindow(html, "weeklyUsage") ?? undefined,
        mcp_monthly: parseOpenCodeGoSsrWindow(html, "monthlyUsage") ?? undefined
    };
    if (usage.session || usage.weekly || usage.mcp_monthly) return usage;
    for (const content of html.split(/data-slot="usage-item"/).slice(1)){
        const label = content.match(/data-slot="usage-label">([^<]+)</)?.[1]?.trim().toLowerCase();
        const usagePercent = toNumber(content.match(/data-slot="usage-value">[^0-9]*(\d+(?:\.\d+)?)/)?.[1], Number.NaN);
        const resetMatch = content.match(/data-slot="(reset-time|reset-now)">([\s\S]*?)<\/span>/);
        if (!label || !Number.isFinite(usagePercent) || !resetMatch) continue;
        const resetInSec = resetMatch[1] === "reset-now" ? 0 : parseOpenCodeGoHumanReset(// Strip any HTML comment, INCLUDING an unterminated one (React SSR emits
        // <!--$--> / <!--/--> hydration markers). The `(?:-->|$)` arm consumes a
        // trailing "<!--" with no closing "-->" too, so no partial "<!--" can survive
        // (js/incomplete-multi-character-sanitization).
        resetMatch[2].replace(/<!--[\s\S]*?(?:-->|$)/g, "").replace(/Resets?\s*in\s*/i, ""));
        if (resetInSec === null || !Number.isFinite(resetInSec)) continue;
        const window = {
            usagePercent,
            resetAt: safeToIsoString(Date.now() + Math.max(0, resetInSec) * 1000)
        };
        if (label.includes("rolling")) usage.session = window;
        else if (label.includes("weekly")) usage.weekly = window;
        else if (label.includes("monthly")) usage.mcp_monthly = window;
    }
    return usage.session || usage.weekly || usage.mcp_monthly ? usage : null;
}
async function fetchOpenCodeGoDashboardUsage(config) {
    const url = `${OPENCODE_GO_DASHBOARD_BASE_URL.replace(/\/+$/, "")}/${encodeURIComponent(config.workspaceId)}/go`;
    const response = await fetch(url, {
        headers: {
            Accept: "text/html",
            Cookie: `auth=${normalizeOpenCodeGoAuthCookie(config.authCookie)}`,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Gecko/20100101 Firefox/152.0"
        },
        signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) return {
        usage: null,
        message: `OpenCode Go dashboard error (${response.status}).`
    };
    const usage = parseOpenCodeGoDashboardHtml(await response.text());
    return {
        usage,
        message: usage ? undefined : "OpenCode Go dashboard response did not contain quota windows."
    };
}
async function getOpenCodeGoUsage(apiKey, providerSpecificData) {
    const dashboardConfig = resolveOpenCodeGoDashboardConfig(providerSpecificData);
    if (dashboardConfig.state === "incomplete") {
        return {
            message: `OpenCode Go dashboard quota config is incomplete. Missing ${dashboardConfig.missing}.`
        };
    }
    if (dashboardConfig.state === "configured") {
        try {
            const dashboard = await fetchOpenCodeGoDashboardUsage(dashboardConfig);
            if (!dashboard.usage) {
                return {
                    message: dashboard.message || "OpenCode Go dashboard quota data unavailable."
                };
            }
            const quotas = {};
            for (const quotaName of OPENCODE_GO_QUOTA_ORDER){
                const usage = dashboard.usage[quotaName];
                if (usage) {
                    quotas[quotaName] = buildOpenCodeGoDollarQuota(quotaName, usage.usagePercent, usage.resetAt);
                }
            }
            return {
                plan: "OpenCode Go",
                quotas: orderOpenCodeGoQuotas(quotas)
            };
        } catch (error) {
            return {
                message: `OpenCode Go dashboard quota error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)}`
            };
        }
    }
    const token = apiKey.trim().replace(/^Bearer\s+/i, "");
    if (!token) {
        return {
            message: "OpenCode Go quota requires OPENCODE_GO_WORKSPACE_ID and OPENCODE_GO_AUTH_COOKIE. " + "The API key can be used for chat/models, but OpenCode Go does not expose quota via API key."
        };
    }
    if (!OPENCODE_GO_QUOTA_URL) {
        return {
            message: "OpenCode Go does not expose a public quota API. " + "Set OPENCODE_GO_WORKSPACE_ID and OPENCODE_GO_AUTH_COOKIE to enable dashboard quota scraping, " + "or set OMNIROUTE_OPENCODE_GO_QUOTA_URL to opt in to an explicit quota endpoint."
        };
    }
    try {
        const res = await fetch(OPENCODE_GO_QUOTA_URL, {
            headers: {
                Authorization: buildBearerAuthorization(token),
                "Accept-Language": "en-US,en",
                "Content-Type": "application/json",
                Accept: "application/json"
            }
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                return {
                    message: "OpenCode Go API key is valid for chat/models but cannot read quota from the configured " + "OMNIROUTE_OPENCODE_GO_QUOTA_URL endpoint. " + "Set OPENCODE_GO_WORKSPACE_ID and OPENCODE_GO_AUTH_COOKIE to enable dashboard quota scraping."
                };
            }
            return {
                message: `OpenCode Go quota API error (${res.status}). ` + "Set OMNIROUTE_OPENCODE_GO_QUOTA_URL to a working endpoint, or follow " + "https://github.com/anomalyco/opencode/issues/16017 for upstream status."
            };
        }
        let json;
        try {
            json = await res.json();
        } catch  {
            return {
                message: "OpenCode Go quota response parsing failed."
            };
        }
        const root = toRecord(json);
        if (toNumber(root.code, 200) === 401 || toNumber(root.code, 200) === 403 || root.success === false) {
            return {
                message: "OpenCode Go API key is valid for chat/models but cannot read quota from the configured " + "OMNIROUTE_OPENCODE_GO_QUOTA_URL endpoint. " + "Set OPENCODE_GO_WORKSPACE_ID and OPENCODE_GO_AUTH_COOKIE to enable dashboard quota scraping."
            };
        }
        const data = toRecord(root.data);
        const quotas = {};
        for (const limit of Array.isArray(data.limits) ? data.limits : []){
            const src = toRecord(limit);
            const type = String(src.type || "").toUpperCase();
            const resetAt = parseResetTime(src.nextResetTime);
            if (type === "TOKENS_LIMIT" || type === "TOKEN_LIMIT") {
                const quotaName = getOpenCodeGoTokenQuotaName(src, quotas);
                quotas[quotaName] = buildOpenCodeGoDollarQuota(quotaName, src.percentage, resetAt, undefined, Array.isArray(src.models) ? src.models.map((model)=>{
                    const modelInfo = toRecord(model);
                    return {
                        name: String(modelInfo.model || modelInfo.modelCode || "usage"),
                        used: toNumber(modelInfo.percentage, 0)
                    };
                }) : undefined);
            } else if (type === "TIME_LIMIT" || type === "TIME_USAGE_LIMIT") {
                quotas.mcp_monthly = buildOpenCodeGoDollarQuota("mcp_monthly", src.percentage, resetAt, src.currentValue, Array.isArray(src.usageDetails) ? src.usageDetails.map((item)=>{
                    const detail = toRecord(item);
                    return {
                        name: String(detail.modelCode || detail.name || "usage"),
                        used: toNumber(detail.usage, 0)
                    };
                }) : undefined);
            }
        }
        const levelRaw = typeof data.planName === "string" ? data.planName : typeof data.level === "string" ? data.level : "";
        const planLabel = toTitleCase(levelRaw.replace(/\s*plan$/i, ""));
        return {
            plan: planLabel ? /^opencode\s+go\b/i.test(planLabel) ? planLabel : `OpenCode Go ${planLabel}` : null,
            quotas: orderOpenCodeGoQuotas(quotas)
        };
    } catch (error) {
        return {
            message: `OpenCode Go quota API error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)}`
        };
    }
}
function resolveOllamaCloudConfig(providerSpecificData) {
    const cookie = process.env.OMNIROUTE_OLLAMA_USAGE_COOKIE?.trim() || process.env.OLLAMA_USAGE_COOKIE?.trim() || process.env.OLLAMA_CLOUD_USAGE_COOKIE?.trim() || getProviderSpecificString(providerSpecificData, [
        "ollamaUsageCookie",
        "ollamaCloudUsageCookie",
        "ollamaCloudCookie",
        "usageCookie",
        "cookie"
    ]);
    if (!cookie) return {
        state: "none"
    };
    if (cookie.includes("\r") || cookie.includes("\n")) {
        return {
            state: "invalid",
            error: "Ollama Cloud cookie contains invalid CRLF characters."
        };
    }
    return {
        state: "configured",
        cookie
    };
}
function normalizeOllamaCloudCookie(value) {
    const trimmed = value.trim();
    return trimmed.toLowerCase().startsWith(`${OLLAMA_CLOUD_SESSION_COOKIE.toLowerCase()}=`) ? trimmed.slice(OLLAMA_CLOUD_SESSION_COOKIE.length + 1).trim() : trimmed;
}
function extractOllamaUsagePercent(trackHtml) {
    const tagHeader = trackHtml.match(/^[^>]*/)?.[0] ?? "";
    const ariaMatch = tagHeader.match(/(\d+(?:\.\d+)?)%\s*used/);
    if (ariaMatch) {
        const pct = toNumber(ariaMatch[1], Number.NaN);
        if (Number.isFinite(pct) && pct >= 0 && pct <= 100) return pct;
    }
    const style = tagHeader.match(/style="([^"]*)"/)?.[1] ?? "";
    const pct = toNumber(style.match(/(?:^|;)\s*width\s*:\s*([0-9.]+)%/)?.[1], Number.NaN);
    return Number.isFinite(pct) && pct >= 0 && pct <= 100 ? pct : null;
}
function parseOllamaCloudSettingsHtml(html) {
    const parts = html.split(/\bdata-usage-track\b/);
    if (parts.length < 2) return null;
    const extractTime = (text)=>{
        const match = text.match(/class="[^"]*local-time[^"]*"[^>]*data-time="([^"]*)"/);
        return match?.[1] || null;
    };
    const sessionPercent = extractOllamaUsagePercent(parts[1]);
    const weeklyPercent = parts[2] ? extractOllamaUsagePercent(parts[2]) : null;
    if (sessionPercent === null && weeklyPercent === null) return null;
    return {
        ...sessionPercent !== null ? {
            session: {
                usagePercent: sessionPercent,
                resetAt: extractTime(parts[1])
            }
        } : {},
        ...weeklyPercent !== null ? {
            weekly: {
                usagePercent: weeklyPercent,
                resetAt: extractTime(parts[2])
            }
        } : {},
        planTier: html.match(/class="[^"]*capitalize[^"]*"[^>]*>([^<]*)</)?.[1]?.trim() || null
    };
}
async function fetchOllamaCloudUsageFromSettings(config) {
    const response = await fetch(OLLAMA_CLOUD_USAGE_URL, {
        redirect: "manual",
        headers: {
            Accept: "text/html",
            Cookie: `${OLLAMA_CLOUD_SESSION_COOKIE}=${normalizeOllamaCloudCookie(config.cookie)}`,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Gecko/20100101 Firefox/152.0"
        },
        signal: AbortSignal.timeout(10_000)
    });
    if (response.status >= 300 && response.status < 400) {
        return {
            usage: null,
            message: "Ollama Cloud authentication expired. Refresh the cookie."
        };
    }
    if (!response.ok) return {
        usage: null,
        message: `Ollama Cloud settings error (${response.status}).`
    };
    const usage = parseOllamaCloudSettingsHtml(await response.text());
    return {
        usage,
        message: usage ? undefined : "Ollama Cloud settings page did not contain usage quota tracks."
    };
}
async function getOllamaCloudUsage(providerSpecificData) {
    const config = resolveOllamaCloudConfig(providerSpecificData);
    if (config.state === "none") {
        return {
            message: "Ollama Cloud quota requires OLLAMA_USAGE_COOKIE. Copy the __Secure-session cookie from ollama.com/settings."
        };
    }
    if (config.state === "invalid") return {
        message: config.error
    };
    try {
        const result = await fetchOllamaCloudUsageFromSettings(config);
        if (!result.usage) return {
            message: result.message || "Ollama Cloud quota data unavailable."
        };
        const quotas = {};
        for (const key of [
            "session",
            "weekly"
        ]){
            const quota = result.usage[key];
            if (!quota) continue;
            const pct = toPercentage(quota.usagePercent);
            quotas[key] = {
                used: pct,
                total: 100,
                remaining: Math.max(0, 100 - pct),
                remainingPercentage: Math.max(0, 100 - pct),
                resetAt: quota.resetAt,
                unlimited: false,
                displayName: key === "session" ? "Session" : "Weekly"
            };
        }
        return {
            plan: result.usage.planTier ? `Ollama Cloud ${result.usage.planTier}` : "Ollama Cloud",
            quotas
        };
    } catch (error) {
        return {
            message: `Ollama Cloud quota error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)}`
        };
    }
}
}),
"[project]/open-sse/services/promptql/jwt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * PromptQL (prompt.ql.app) JWT / credential helpers.
 *
 * Shared between the executor (open-sse/executors/promptql.ts) and the usage/credits
 * service (open-sse/services/usage/promptql.ts) — previously copy-pasted between the
 * two, now a single source of truth (see PR #7911 review).
 *
 * Two live token shapes exist (verified 2026-07-21 against prompt.ql.app):
 *  1. **Playground enrich-token** (`iss: enrich-token`, `aud: promptql.hasura.io`)
 *     → project id in `https://promptql.hasura.io`.`x-hasura-project-id`
 *     → required for start_thread / send_thread_message / thread_events
 *  2. **DDN / lux project token** (`iss: https://auth.pro.hasura.io/ddn/token`)
 *     → project id is the JWT **`aud`** (UUID); no hasura namespace claims
 *     → works for data.pro.ql.app getCreditSummary (Limits), NOT for playground chat
 */ __turbopack_context__.s([
    "decodeJwtPayload",
    ()=>decodeJwtPayload,
    "extractProjectIdFromToken",
    ()=>extractProjectIdFromToken,
    "isDdnProjectPromptQlToken",
    ()=>isDdnProjectPromptQlToken,
    "isJwtExpired",
    ()=>isJwtExpired,
    "isPlaygroundPromptQlToken",
    ()=>isPlaygroundPromptQlToken,
    "issuerHostIsTrusted",
    ()=>issuerHostIsTrusted,
    "looksLikeUuid",
    ()=>looksLikeUuid,
    "normalizePromptQlToken",
    ()=>normalizePromptQlToken,
    "resolvePromptQlCredentials",
    ()=>resolvePromptQlCredentials
]);
function readStr(v) {
    if (typeof v !== "string") return "";
    const t = v.trim();
    return t.length ? t : "";
}
function readPs(data, keys) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return "";
    const rec = data;
    for (const k of keys){
        const v = readStr(rec[k]);
        if (v) return v;
    }
    return "";
}
function normalizePromptQlToken(raw) {
    const t = raw.trim().replace(/^Bearer\s+/i, "").trim();
    return t;
}
function decodeJwtPayload(token) {
    try {
        const part = token.split(".")[1];
        if (!part) return null;
        const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
        return JSON.parse(json);
    } catch  {
        return null;
    }
}
function looksLikeUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test((value || "").trim());
}
function extractProjectIdFromToken(token) {
    const payload = decodeJwtPayload(token);
    if (!payload) return "";
    const hasura = payload["https://promptql.hasura.io"];
    if (hasura && typeof hasura === "object" && !Array.isArray(hasura)) {
        const id = readStr(hasura["x-hasura-project-id"]);
        if (id && looksLikeUuid(id)) return id;
        if (id) return id;
    }
    const direct = readStr(payload.project_id) || readStr(payload.projectId);
    if (direct) return direct;
    // DDN lux JWT: aud is the project UUID (not "promptql.hasura.io")
    const aud = payload.aud;
    if (typeof aud === "string" && looksLikeUuid(aud)) return aud.trim();
    if (Array.isArray(aud)) {
        for (const a of aud){
            if (typeof a === "string" && looksLikeUuid(a)) return a.trim();
        }
    }
    return "";
}
function isPlaygroundPromptQlToken(token) {
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    const hasura = payload["https://promptql.hasura.io"];
    if (hasura && typeof hasura === "object" && !Array.isArray(hasura)) {
        const id = hasura["x-hasura-project-id"];
        if (typeof id === "string" && id.trim()) return true;
    }
    const iss = readStr(payload.iss).toLowerCase();
    if (iss === "enrich-token" || iss.includes("enrich-token")) return true;
    const aud = payload.aud;
    if (typeof aud === "string" && aud.toLowerCase() === "promptql.hasura.io") return true;
    return false;
}
/**
 * Hosts trusted as PromptQL DDN/lux token issuers. A bare `String.includes()` against
 * `iss` is spoofable (`https://auth.pro.hasura.io.evil.com/...` also "contains" the
 * trusted substring) — CodeQL js/incomplete-url-substring-sanitization, issue #8029.
 * Always parse `iss` as a URL and compare the hostname instead.
 */ const TRUSTED_DDN_ISSUER_HOSTS = [
    "auth.pro.hasura.io",
    "auth.pro.ql.app"
];
function issuerHostIsTrusted(iss) {
    try {
        const host = new URL(iss).hostname.toLowerCase();
        return TRUSTED_DDN_ISSUER_HOSTS.some((h)=>host === h || host.endsWith(`.${h}`));
    } catch  {
        return false;
    }
}
function isDdnProjectPromptQlToken(token) {
    if (!token || isPlaygroundPromptQlToken(token)) return false;
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    const iss = readStr(payload.iss);
    if (issuerHostIsTrusted(iss)) return true;
    // aud is a project UUID and no hasura claims → treat as DDN
    const aud = payload.aud;
    if (typeof aud === "string" && looksLikeUuid(aud)) return true;
    return false;
}
function isJwtExpired(token, skewSec = 30) {
    const payload = decodeJwtPayload(token);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : 0;
    if (!exp) return false;
    return Math.floor(Date.now() / 1000) >= exp - skewSec;
}
const DEFAULT_TZ = "UTC";
function resolvePromptQlCredentials(credentials) {
    const credRec = credentials;
    const direct = readStr(credentials?.apiKey) || readStr(credRec?.accessToken) || readStr(credRec?.token);
    const ps = credentials?.providerSpecificData;
    const token = normalizePromptQlToken(direct || readPs(ps, [
        "token",
        "jwt",
        "accessToken",
        "bearer",
        "apiKey"
    ]));
    // Prefer explicit PSD / connection.projectId, then JWT claims (hasura or aud).
    const projectId = readPs(ps, [
        "projectId",
        "project_id",
        "x-hasura-project-id"
    ]) || readStr(credRec?.projectId) || readStr(credRec?.project_id) || extractProjectIdFromToken(token);
    const cookie = readPs(ps, [
        "cookie",
        "sessionCookie",
        "authCookie"
    ]);
    const timezone = readPs(ps, [
        "timezone",
        "tz"
    ]) || DEFAULT_TZ;
    return {
        token,
        projectId,
        cookie,
        timezone
    };
}
}),
"[project]/open-sse/services/qoderCliResolve.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__clearQoderCliInvocationCache",
    ()=>__clearQoderCliInvocationCache,
    "buildQoderCliNotFoundHint",
    ()=>buildQoderCliNotFoundHint,
    "getQoderCliCommand",
    ()=>getQoderCliCommand,
    "resolveQoderCliInvocation",
    ()=>resolveQoderCliInvocation
]);
/**
 * qodercli command resolution (#6263).
 *
 * Extracted from `qoderCli.ts` (frozen at the file-size baseline) so the
 * Windows-aware resolution logic can grow without bloating the transport module.
 *
 * The bare `"qodercli"` name does not resolve on Windows, where npm installs the
 * CLI as a `qodercli.cmd` wrapper under `%APPDATA%\npm` (a user-PATH directory)
 * that `spawn` cannot find with `shell:false` and an unenriched env. OmniRoute
 * already has a Windows-aware resolver for this exact tool in `cliRuntime.ts`, so
 * we reuse it: `getCliRuntimeStatus("qoder")` returns an absolute `.cmd`/`.exe`
 * `commandPath`, and `shouldUseShellForCommand()` tells us whether it needs cmd.exe.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntime.ts [app-route] (ecmascript)");
;
;
function getQoderCliCommand() {
    const explicit = String(process.env.CLI_QODER_BIN || "").trim();
    return explicit || "qodercli";
}
// Resolving through cliRuntime does synchronous fs walks plus a `--version`
// healthcheck spawn; memoize the result so we don't repeat that on every chat /
// quota request. The install location is effectively static for a running host.
const QODER_RESOLVE_TTL_MS = 5 * 60 * 1000;
// Keyed on the fallback command (which folds in CLI_QODER_BIN) so changing the
// override — or a test pointing at a fresh stub — invalidates a stale entry
// instead of spawning a since-deleted binary.
let qoderInvocationCache = null;
function __clearQoderCliInvocationCache() {
    qoderInvocationCache = null;
}
async function resolveQoderCliInvocation(explicitCommand, deps = {}) {
    const explicit = String(explicitCommand || "").trim();
    const getStatus = deps.getStatus || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCliRuntimeStatus"];
    const shouldUseShell = deps.shouldUseShell || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldUseShellForCommand"];
    // Only the default path is cached; an explicit per-call command or an injected
    // resolver (tests) always resolves fresh and never touches the shared cache.
    const cacheable = !explicit && !deps.getStatus && !deps.shouldUseShell;
    const fallback = explicit || getQoderCliCommand();
    if (cacheable && qoderInvocationCache && qoderInvocationCache.key === fallback && qoderInvocationCache.expiresAt > Date.now()) {
        return {
            command: qoderInvocationCache.command,
            useShell: qoderInvocationCache.useShell
        };
    }
    let command = fallback;
    try {
        const status = await getStatus("qoder");
        if (status && status.installed && status.commandPath) {
            command = status.commandPath;
        }
    } catch  {
    /* fall back to the bare/explicit command — spawn will surface a real ENOENT */ }
    // On Windows, if explicit CLI_QODER_BIN / command is a bare binary name like "qodercli" or "qoder" (no path or extension),
    // spawn(cmd, { shell: false }) will fail with ENOENT post Node CVE-2024-27980.
    // Enabling shell: true for bare command names on win32 lets system PATH resolution find qodercli.cmd / qoder.cmd.
    const useShell = shouldUseShell(command) || process.platform === "win32" && !__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(command) && !__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(command).includes(".");
    const invocation = {
        command,
        useShell
    };
    if (cacheable) {
        qoderInvocationCache = {
            ...invocation,
            key: fallback,
            expiresAt: Date.now() + QODER_RESOLVE_TTL_MS
        };
    }
    return invocation;
}
function buildQoderCliNotFoundHint(runError) {
    let searchedHint = "";
    try {
        const candidates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKnownToolPaths"])("qoder");
        if (candidates.length > 0) {
            searchedHint = ` Searched: ${candidates.slice(0, 6).join(", ")}.`;
        }
    } catch  {
    /* best-effort — the path list is only advisory for the error message */ }
    return `Qoder CLI (qodercli) was not found on the OmniRoute host (${runError}).` + searchedHint + " Install it from https://qoder.com, or set CLI_QODER_BIN to the absolute path " + "of the qodercli binary (e.g. %APPDATA%\\npm\\qodercli.cmd on Windows). " + "PAT auth is driven through the local qodercli binary.";
}
}),
"[project]/open-sse/services/qoderCli.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QODER_STATIC_MODELS",
    ()=>QODER_STATIC_MODELS,
    "__clearQoderJobTokenCache",
    ()=>__clearQoderJobTokenCache,
    "__clearQoderModelNamesCache",
    ()=>__clearQoderModelNamesCache,
    "buildCosyHeadersForValidation",
    ()=>buildCosyHeadersForValidation,
    "buildQoderChunk",
    ()=>buildQoderChunk,
    "buildQoderCompletionPayload",
    ()=>buildQoderCompletionPayload,
    "buildQoderPrompt",
    ()=>buildQoderPrompt,
    "createQoderErrorResponse",
    ()=>createQoderErrorResponse,
    "exchangeQoderJobToken",
    ()=>exchangeQoderJobToken,
    "extractTextFromQoderEnvelope",
    ()=>extractTextFromQoderEnvelope,
    "getQoderCliConfigDir",
    ()=>getQoderCliConfigDir,
    "getQoderCliWorkspace",
    ()=>getQoderCliWorkspace,
    "getStaticQoderModels",
    ()=>getStaticQoderModels,
    "isQoderCliTransport",
    ()=>isQoderCliTransport,
    "isQoderPatToken",
    ()=>isQoderPatToken,
    "listQoderCliModels",
    ()=>listQoderCliModels,
    "mapQoderModelToLevel",
    ()=>mapQoderModelToLevel,
    "normalizeQoderModelKey",
    ()=>normalizeQoderModelKey,
    "normalizeQoderPatProviderData",
    ()=>normalizeQoderPatProviderData,
    "parseQoderCliFailure",
    ()=>parseQoderCliFailure,
    "parseQoderCliModelNames",
    ()=>parseQoderCliModelNames,
    "parseQoderCliResult",
    ()=>parseQoderCliResult,
    "parseQoderJobTokenResponse",
    ()=>parseQoderJobTokenResponse,
    "resolveQoderCliModel",
    ()=>resolveQoderCliModel,
    "resolveQoderJobToken",
    ()=>resolveQoderJobToken,
    "resolveQoderModelName",
    ()=>resolveQoderModelName,
    "runQoderCli",
    ()=>runQoderCli,
    "validateQoderCliPat",
    ()=>validateQoderCliPat
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntime.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qoder$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qoder/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCliResolve$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/qoderCliResolve.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MODELS_TIMEOUT_MS = 20_000;
const QODER_DEFAULT_MODEL = "qwen3.8-max-preview";
const QODER_MODEL_LEVELS = {
    "qwen3.8-max-preview": "qmodel_preview",
    "qwen3.7-max": "qmodel_latest",
    "qwen3.7-plus": "qmodel",
    "kimi-k3": "kmodel_latest",
    "kimi-k2.7-code": "kmodel",
    "glm-5.2": "gm51model",
    "deepseek-v4-pro": "dmodel",
    "deepseek-v4-flash": "dfmodel",
    "minimax-m3": "mmodel"
};
const QODER_STATIC_MODELS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qoder$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qoderProvider"].models.map(({ id, name })=>({
        id,
        name
    }));
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function getString(value) {
    return typeof value === "string" ? value : "";
}
function getQoderCliWorkspace() {
    const explicit = String(process.env.QODER_CLI_WORKSPACE || process.env.OMNIROUTE_QODER_WORKSPACE || "").trim();
    if (explicit) return explicit;
    const home = String(process.env.HOME || "").trim();
    return home || process.cwd();
}
function getQoderCliConfigDir() {
    const explicit = String(process.env.QODER_CLI_CONFIG_DIR || "").trim();
    if (explicit) return explicit;
    const dataDir = String(process.env.DATA_DIR || "").trim();
    const base = dataDir || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir() || __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), ".omniroute");
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(base, "qoder-cli");
}
// Memoized per resolved path so we don't hit synchronous disk I/O
// (fs.mkdirSync blocks the event loop) on every chat/quota request.
const ensuredQoderCliConfigDirs = new Set();
/** Ensure the qodercli config dir exists so it is a valid spawn cwd + cache root. */ function ensureQoderCliConfigDir() {
    const dir = getQoderCliConfigDir();
    if (ensuredQoderCliConfigDirs.has(dir)) return dir;
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
            recursive: true
        });
        ensuredQoderCliConfigDirs.add(dir);
    } catch  {
    /* best-effort — spawn will surface a real failure */ }
    return dir;
}
/**
 * Low-level qodercli spawn. The PAT (if any) is passed via the
 * `QODER_PERSONAL_ACCESS_TOKEN` env var — the only env var the official CLI
 * honors for headless PAT auth — and the prompt is piped through stdin so no
 * untrusted value is ever interpolated into a shell command (Hard Rule #13).
 */ async function spawnQoderCli(options) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    // #6263: resolve the real qodercli command (absolute .cmd/.exe on Windows) and
    // whether it needs a shell, then spawn with the cliRuntime-enriched env (PATH +
    // PATHEXT + APPDATA) so the npm `.cmd` wrapper under %APPDATA%\npm is found.
    const { command, useShell } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCliResolve$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveQoderCliInvocation"])(options.command);
    const env = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLookupEnv"])()
    };
    const token = String(options.token || "").trim();
    if (token) env.QODER_PERSONAL_ACCESS_TOKEN = token;
    return new Promise((resolve)=>{
        let stdout = "";
        let stderr = "";
        let settled = false;
        let timedOut = false;
        let child;
        try {
            child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])(command, options.args, {
                env,
                cwd: options.cwd || undefined,
                stdio: [
                    "pipe",
                    "pipe",
                    "pipe"
                ],
                windowsHide: true,
                ...useShell ? {
                    shell: true
                } : {}
            });
        } catch (err) {
            resolve({
                ok: false,
                code: null,
                stdout: "",
                stderr: "",
                timedOut: false,
                error: err.message
            });
            return;
        }
        const timer = setTimeout(()=>{
            timedOut = true;
            try {
                child.kill("SIGKILL");
            } catch  {
            /* already gone */ }
        }, timeoutMs);
        timer.unref?.();
        const onAbort = ()=>{
            try {
                child.kill("SIGKILL");
            } catch  {
            /* already gone */ }
        };
        if (options.signal) {
            if (options.signal.aborted) onAbort();
            else options.signal.addEventListener("abort", onAbort, {
                once: true
            });
        }
        const finish = (result)=>{
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            options.signal?.removeEventListener?.("abort", onAbort);
            resolve(result);
        };
        child.on("error", (err)=>{
            finish({
                ok: false,
                code: null,
                stdout,
                stderr,
                timedOut,
                error: err.message
            });
        });
        // If qodercli exits or closes stdin before we finish writing the prompt, the
        // write/end below can emit an ASYNC EPIPE/EINVAL on the stream (not caught by
        // the surrounding try/catch). Without a listener that becomes an unhandled
        // 'error' event that crashes the whole process — attach no-op handlers.
        child.stdin?.on("error", ()=>{});
        child.stdout?.on("error", ()=>{});
        child.stderr?.on("error", ()=>{});
        // Decode with a stateful UTF-8 reader so a multi-byte character (e.g. Chinese,
        // common in Qoder output) split across two chunks is not corrupted — Buffer
        // per-chunk toString() would mangle the boundary bytes.
        child.stdout?.setEncoding("utf8");
        child.stderr?.setEncoding("utf8");
        child.stdout?.on("data", (chunk)=>{
            stdout += chunk;
        });
        child.stderr?.on("data", (chunk)=>{
            stderr += chunk;
        });
        child.on("close", (code)=>{
            finish({
                ok: code === 0 && !timedOut,
                code,
                stdout,
                stderr,
                timedOut,
                error: timedOut ? "qodercli timed out" : null
            });
        });
        try {
            if (options.stdin != null) child.stdin?.write(options.stdin);
            child.stdin?.end();
        } catch  {
        /* stdin closed early — the child will surface its own error */ }
    });
}
async function runQoderCli(options) {
    const level = await resolveQoderCliModel(options.model, options.token, {
        command: options.command,
        signal: options.signal
    });
    const configDir = ensureQoderCliConfigDir();
    const cwd = String(options.workspace || "").trim() || configDir;
    const args = [
        "--print",
        "--output-format",
        "json",
        "--model",
        level,
        // Disable all built-in tools — OmniRoute only wants a plain LM reply, never
        // file-system access or command execution from the proxied CLI.
        "--tools",
        "",
        "--config-dir",
        configDir
    ];
    return spawnQoderCli({
        args,
        token: options.token,
        stdin: options.prompt,
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        command: options.command,
        cwd
    });
}
async function listQoderCliModels(options = {}) {
    const configDir = ensureQoderCliConfigDir();
    return spawnQoderCli({
        args: [
            "--list-models",
            "--config-dir",
            configDir
        ],
        token: options.token,
        signal: options.signal,
        timeoutMs: options.timeoutMs ?? DEFAULT_MODELS_TIMEOUT_MS,
        command: options.command,
        cwd: configDir
    });
}
function normalizeQoderModelKey(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function parseQoderCliModelNames(stdout) {
    return String(stdout || "").split("\n").map((line)=>line.replace(/\[[0-9;]*m/g, "").trim()) // strip ANSI colors
    .filter((line)=>line.length > 0 && line.toLowerCase() !== "model" && // header row
        !/invalid model|not logged in|please run|available model keys/i.test(line));
}
function resolveQoderModelName(requested, availableNames) {
    const normalized = normalizeQoderModelKey(requested);
    if (!normalized) return "auto";
    const match = (availableNames || []).find((name)=>normalizeQoderModelKey(name) === normalized);
    if (match) return match;
    return mapQoderModelToLevel(requested) || "auto";
}
// Per-token cache of the `--list-models` display names (the catalog is stable and
// per-account); TTL keeps it fresh without a CLI spawn on every request.
const QODER_MODEL_LIST_TTL_MS = 10 * 60 * 1000;
const qoderModelNamesCache = new Map();
const qoderModelNamesPending = new Map();
async function getCachedQoderCliModelNames(token, options = {}) {
    const key = String(token || "").trim() || "default";
    const now = options.now ?? Date.now();
    const cached = qoderModelNamesCache.get(key);
    if (cached && cached.expiresAt > now) return cached.names;
    let pending = qoderModelNamesPending.get(key);
    if (!pending) {
        pending = listQoderCliModels({
            token,
            command: options.command,
            signal: options.signal
        }).then((run)=>{
            const names = run.ok ? parseQoderCliModelNames(run.stdout) : [];
            // Only cache a non-empty success; a failed/empty list should retry next time.
            if (names.length > 0) {
                qoderModelNamesCache.set(key, {
                    names,
                    expiresAt: now + QODER_MODEL_LIST_TTL_MS
                });
            }
            return names;
        }).catch(()=>[]).finally(()=>qoderModelNamesPending.delete(key));
        qoderModelNamesPending.set(key, pending);
    }
    return pending;
}
async function resolveQoderCliModel(requested, token, options = {}) {
    let names = [];
    try {
        names = await getCachedQoderCliModelNames(token, options);
    } catch  {
        names = [];
    }
    return resolveQoderModelName(requested, names);
}
function __clearQoderModelNamesCache() {
    qoderModelNamesCache.clear();
    qoderModelNamesPending.clear();
}
function parseQoderCliResult(stdout) {
    const trimmed = String(stdout || "").trim();
    if (!trimmed) {
        return {
            text: "",
            isError: true,
            errorMessage: "qodercli produced no output"
        };
    }
    let parsed = null;
    try {
        const whole = JSON.parse(trimmed);
        if (whole && typeof whole === "object") parsed = whole;
    } catch  {
        for (const line of trimmed.split("\n").reverse()){
            const candidate = line.trim();
            if (!candidate.startsWith("{")) continue;
            try {
                const obj = JSON.parse(candidate);
                if (obj && typeof obj === "object") {
                    parsed = obj;
                    break;
                }
            } catch  {
            /* keep scanning earlier lines */ }
        }
    }
    if (!parsed) {
        return {
            text: "",
            isError: true,
            errorMessage: trimmed.slice(0, 300)
        };
    }
    const result = getString(parsed.result);
    const isError = parsed.is_error === true || getString(parsed.subtype).trim().toLowerCase() === "error";
    return {
        text: result,
        isError,
        errorMessage: isError ? result || "qodercli returned an error" : ""
    };
}
function normalizeQoderPatProviderData(providerSpecificData = {}) {
    return {
        ...providerSpecificData,
        authMode: "pat",
        transport: "qodercli"
    };
}
function isQoderCliTransport(providerSpecificData = {}) {
    const data = asRecord(providerSpecificData);
    const transport = getString(data.transport).trim().toLowerCase();
    const authMode = getString(data.authMode).trim().toLowerCase();
    if (transport === "http-legacy") return false;
    return transport === "qodercli" || authMode === "pat";
}
function getStaticQoderModels() {
    return QODER_STATIC_MODELS.map((model)=>({
            ...model
        }));
}
/** qodercli's `-m` accepts these level keys (see `qodercli --list-models`). */ const QODER_LEVEL_KEYS = new Set([
    "auto",
    ...Object.values(QODER_MODEL_LEVELS)
]);
function resolveQoderModelLevel(value) {
    const modelId = value.includes("/") ? value.slice(value.lastIndexOf("/") + 1) : value;
    return QODER_MODEL_LEVELS[modelId] ?? null;
}
function mapQoderModelToLevel(model) {
    const normalized = String(model || "").trim().toLowerCase();
    if (!normalized) return null;
    // Keep Qoder's retired pre-3.8 level as an alias for the current preview.
    if (normalized === "q35model_preview") return "qmodel_preview";
    // A caller may pass a qodercli level key directly (e.g. "gm51model") — honor it.
    if (QODER_LEVEL_KEYS.has(normalized)) return normalized;
    const currentLevel = resolveQoderModelLevel(normalized);
    if (currentLevel) return currentLevel;
    // Legacy public ids stay accepted without keeping the retired abstract tiers.
    if (normalized.includes("deepseek-r1")) return "dmodel";
    if (normalized.includes("glm")) return "gm51model"; // GLM-5.2 (`qoder/glm-5.2`)
    if (normalized.includes("minimax")) return "mmodel";
    if (normalized.includes("qwen3-max-preview")) return "qmodel_preview";
    if (normalized.includes("qwen3-max")) return "qmodel_latest";
    if (normalized.includes("kimi-k2")) return "kmodel";
    if (normalized.includes("qwen3-coder")) return "qmodel";
    if (normalized.includes("qoder-rome")) return "qmodel";
    return "auto";
}
function flattenMessageContent(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content.map((item)=>{
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        const record = item;
        const itemType = getString(record.type);
        if (itemType === "text" || itemType === "input_text") {
            return getString(record.text);
        }
        if (itemType === "image_url" || itemType === "input_image") {
            return "[Image omitted]";
        }
        return "";
    }).filter(Boolean).join("\n");
}
function formatMessage(message) {
    if (!message || typeof message !== "object") return "";
    const record = message;
    const role = getString(record.role).trim().toUpperCase() || "UNKNOWN";
    const base = flattenMessageContent(record.content);
    if (role === "TOOL") {
        const toolName = getString(record.name).trim();
        return `TOOL${toolName ? ` (${toolName})` : ""}:\n${base}`.trim();
    }
    const toolCalls = Array.isArray(record.tool_calls) ? record.tool_calls : [];
    if (toolCalls.length > 0) {
        const toolLines = toolCalls.map((toolCall)=>{
            const toolRecord = asRecord(toolCall);
            const functionRecord = asRecord(toolRecord.function);
            const toolName = getString(functionRecord.name).trim() || getString(toolRecord.name).trim() || "tool";
            const toolArgs = getString(functionRecord.arguments).trim() || getString(toolRecord.arguments).trim();
            return `TOOL_CALL ${toolName}: ${toolArgs}`.trim();
        }).filter(Boolean).join("\n");
        return `${role}:\n${base}\n${toolLines}`.trim();
    }
    return `${role}:\n${base}`.trim();
}
function buildQoderPrompt(body) {
    const requestBody = asRecord(body);
    const lines = [
        "You are answering an OmniRoute OpenAI-compatible request through the Qoder CLI transport.",
        "Respond as a plain language model only.",
        "Do not use your own tools, do not inspect files, and do not run commands.",
        "Do not mention the adapter unless the user explicitly asks."
    ];
    const tools = Array.isArray(requestBody.tools) ? requestBody.tools : [];
    if (tools.length > 0) {
        const toolNames = tools.map((tool)=>{
            const toolRecord = asRecord(tool);
            const functionRecord = toolRecord.type === "function" ? asRecord(toolRecord.function) : toolRecord;
            return getString(functionRecord.name).trim();
        }).filter(Boolean).join(", ");
        if (toolNames) {
            lines.push(`Caller-side tools are available externally: ${toolNames}.`);
            lines.push("Do not call those tools yourself. Answer in assistant text only.");
        }
    }
    const responseFormat = asRecord(requestBody.response_format);
    if (responseFormat.type === "json_object") {
        lines.push("Return only valid JSON.");
    } else if (responseFormat.type === "json_schema" && responseFormat.json_schema && typeof responseFormat.json_schema === "object") {
        const jsonSchema = asRecord(responseFormat.json_schema);
        if (jsonSchema.schema && typeof jsonSchema.schema === "object") {
            lines.push(`Return only valid JSON matching this schema:\n${JSON.stringify(jsonSchema.schema, null, 2)}`);
        }
    }
    const messages = Array.isArray(requestBody.messages) ? requestBody.messages : Array.isArray(requestBody.input) ? requestBody.input : [];
    if (messages.length > 0) {
        lines.push("Conversation transcript:");
        for (const message of messages){
            const formatted = formatMessage(message);
            if (formatted) lines.push(formatted);
        }
    }
    lines.push("Reply now with the assistant response only.");
    return lines.filter(Boolean).join("\n\n");
}
function extractTextFromQoderEnvelope(parsed) {
    const record = asRecord(parsed);
    const messageRecord = asRecord(record.message);
    const content = messageRecord.content ?? record.content ?? record.delta ?? record.text ?? null;
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content.map((item)=>{
        const itemRecord = asRecord(item);
        const itemType = getString(itemRecord.type).trim();
        if (itemType === "text" || !itemType) {
            return getString(itemRecord.text);
        }
        return "";
    }).filter(Boolean).join("");
}
function buildQoderCompletionPayload({ model, text }) {
    const created = Math.floor(Date.now() / 1000);
    return {
        id: `chatcmpl-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID()}`,
        object: "chat.completion",
        created,
        model: model || QODER_DEFAULT_MODEL,
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: text
                },
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        }
    };
}
function buildQoderChunk({ id, model, created, delta, finishReason = null }) {
    return {
        id,
        object: "chat.completion.chunk",
        created,
        model,
        choices: [
            {
                index: 0,
                delta,
                finish_reason: finishReason
            }
        ]
    };
}
function parseQoderCliFailure(stderrText, stdoutText = "") {
    const stderr = String(stderrText || "").trim();
    const stdout = String(stdoutText || "").trim();
    const combined = `${stderr}\n${stdout}`.trim() || "Qoder API request failed";
    const normalized = combined.toLowerCase();
    if (normalized.includes("invalid api key") || normalized.includes("invalid token") || normalized.includes("invalid personal token") || normalized.includes("personal access token") || normalized.includes("personal token format") || normalized.includes("exchangejobtoken failed") || normalized.includes("not logged in") || normalized.includes("please run /login") || normalized.includes("login required") || normalized.includes("unauthorized") && normalized.includes("qoder")) {
        return {
            status: 401,
            message: combined,
            code: "upstream_auth_error"
        };
    }
    if (normalized.includes("timed out") || normalized.includes("timeout")) {
        return {
            status: 504,
            message: combined,
            code: "timeout"
        };
    }
    return {
        status: 502,
        message: combined,
        code: "upstream_error"
    };
}
function createQoderErrorResponse(failure) {
    return new Response(JSON.stringify({
        error: {
            message: failure.message,
            type: failure.status === 401 ? "authentication_error" : "provider_error",
            code: failure.code
        }
    }), {
        status: failure.status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA8iMH5c02LilrsERw9t6Pv5Nc
4k6Pz1EaDicBMpdpxKduSZu5OANqUq8er4GM95omAGIOPOh+Nx0spthYA2BqGz+l
6HRkPJ7S236FZz73In/KVuLnwI8JJ2CbuJap8kvheCCZpmAWpb/cPx/3Vr/J6I17
XcW+ML9FoCI6AOvOzwIDAQAB
-----END PUBLIC KEY-----`;
function buildCosyHeadersForValidation(bodyStr, token) {
    const aesKeyBytes = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(16);
    const aesKeyStr = aesKeyBytes.toString("hex").slice(0, 16);
    const aesKeyBuf = Buffer.from(aesKeyStr, "utf8");
    const uid = "omniroute.user@qoder.sh";
    const userInfo = {
        uid: uid,
        security_oauth_token: token,
        name: "omniroute",
        aid: "",
        email: uid
    };
    const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv("aes-128-cbc", aesKeyBuf, aesKeyBuf);
    let ciphertext = cipher.update(JSON.stringify(userInfo), "utf8", "base64");
    ciphertext += cipher.final("base64");
    const encryptedKeyBuf = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].publicEncrypt({
        key: PUBLIC_KEY,
        padding: __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].constants.RSA_PKCS1_PADDING
    }, aesKeyBuf);
    const cosyKeyB64 = encryptedKeyBuf.toString("base64");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadStr = JSON.stringify({
        version: "v1",
        requestId: __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID(),
        info: ciphertext,
        cosyVersion: "0.12.3",
        ideVersion: ""
    });
    const payloadB64 = Buffer.from(payloadStr).toString("base64");
    const sigPath = "/api/v2/service/pro/sse/agent_chat_generation";
    const sigInput = `${payloadB64}\n${cosyKeyB64}\n${timestamp}\n${bodyStr}\n${sigPath}`;
    const sig = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("md5").update(sigInput).digest("hex");
    return {
        Authorization: `Bearer COSY.${payloadB64}.${sig}`,
        "Cosy-Key": cosyKeyB64,
        "Cosy-User": uid,
        "Cosy-Date": timestamp,
        "Content-Type": "application/json"
    };
}
// #4683: Qoder PATs (`pt-*`) cannot be used directly as the Cosy
// `security_oauth_token`. The official qodercli performs a two-step flow: it first
// exchanges the PAT for a short-lived job token (`jt-*`) at
// `openapi.qoder.sh/api/v1/jobToken/exchange`, then carries that `jt-*` in the Cosy
// envelope for chat. Passing the raw `pt-*` makes Cosy return a generic 500, which
// OmniRoute mis-surfaced as "PAT may not be valid for the chat API". We mirror the
// exchange here and cache the `jt-*` for its lifetime.
const QODER_JOB_TOKEN_EXCHANGE_URL = "https://openapi.qoder.sh/api/v1/jobToken/exchange";
// Refresh a little before the ~24h expiry to avoid using a just-expired token.
const QODER_JOB_TOKEN_DEFAULT_TTL_MS = 23 * 60 * 60 * 1000;
const QODER_JOB_TOKEN_MIN_TTL_MS = 60 * 1000;
const qoderJobTokenCache = new Map();
const qoderJobTokenPending = new Map();
function isQoderPatToken(token) {
    return typeof token === "string" && token.trim().startsWith("pt-");
}
function parseQoderJobTokenResponse(json) {
    const root = asRecord(json);
    const data = asRecord(root.data);
    const candidates = [
        root.job_token,
        root.jobToken,
        root.jt,
        root.token,
        data.job_token,
        data.jobToken,
        data.jt,
        data.token
    ];
    const jobToken = candidates.map(getString).find((v)=>v.trim().startsWith("jt-")) || "";
    if (!jobToken) return null;
    const expiresRaw = [
        root.expires_in,
        root.expiresIn,
        data.expires_in,
        data.expiresIn
    ].find((v)=>typeof v === "number" && Number.isFinite(v) && v > 0);
    // Qoder reports expiry in seconds; fall back to the default ~24h window.
    const expiresInMs = expiresRaw ? expiresRaw * 1000 : QODER_JOB_TOKEN_DEFAULT_TTL_MS;
    return {
        jobToken,
        expiresInMs: Math.max(expiresInMs, QODER_JOB_TOKEN_MIN_TTL_MS)
    };
}
async function exchangeQoderJobToken(pat, options = {}) {
    const fetchImpl = options.fetchImpl || fetch;
    const res = await fetchImpl(QODER_JOB_TOKEN_EXCHANGE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            personal_token: pat
        }),
        signal: options.signal || AbortSignal.timeout(15000)
    });
    if (!res || !res.ok) return null;
    let json = null;
    try {
        json = await res.json();
    } catch  {
        return null;
    }
    return parseQoderJobTokenResponse(json);
}
async function resolveQoderJobToken(token, options = {}) {
    const trimmed = (token || "").trim();
    if (!isQoderPatToken(trimmed)) return trimmed;
    const now = options.now ?? Date.now();
    const cached = qoderJobTokenCache.get(trimmed);
    if (cached && cached.expiresAt > now) return cached.jobToken;
    let pending = qoderJobTokenPending.get(trimmed);
    if (!pending) {
        pending = exchangeQoderJobToken(trimmed, {
            fetchImpl: options.fetchImpl
        }).finally(()=>{
            qoderJobTokenPending.delete(trimmed);
        });
        qoderJobTokenPending.set(trimmed, pending);
    }
    const exchanged = await pending;
    if (!exchanged) return trimmed; // graceful fallback — keep prior behavior
    qoderJobTokenCache.set(trimmed, {
        jobToken: exchanged.jobToken,
        expiresAt: now + exchanged.expiresInMs
    });
    return exchanged.jobToken;
}
function __clearQoderJobTokenCache() {
    qoderJobTokenCache.clear();
    qoderJobTokenPending.clear();
}
async function validateQoderCliPat({ apiKey, providerSpecificData = {} }) {
    // Resolve token: dashboard input → env var fallback
    const resolvedToken = apiKey?.trim() || String(process.env.QODER_PERSONAL_ACCESS_TOKEN || "").trim();
    if (!resolvedToken) {
        return {
            valid: false,
            error: "No Qoder token provided. Get your Personal Access Token from https://qoder.com/account/integrations or set QODER_PERSONAL_ACCESS_TOKEN env var.",
            unsupported: false
        };
    }
    // PAT format guidance: Qoder PATs should be non-empty strings.
    // Warn if the token looks like it might be an encrypted blob (from ~/.qoder/.auth/user)
    // rather than a proper PAT from the website.
    if (resolvedToken.length > 500) {
        return {
            valid: false,
            error: "Token appears to be an encrypted auth blob (from ~/.qoder/.auth/user). " + "Please use a Personal Access Token from https://qoder.com/account/integrations instead.",
            unsupported: false
        };
    }
    // Reference providerSpecificData so callers can still pass validation hints
    // (model id, etc.) without a signature change; the CLI resolves models itself.
    void providerSpecificData;
    // Validate by asking the local qodercli to list the models reachable for this
    // PAT. The official CLI signs the (WASM-based) Cosy request internally, which
    // the pure-HTTP path can no longer replicate — a raw Cosy call now returns a
    // generic 500 for every token, so it cannot distinguish valid from invalid.
    // `--list-models` authenticates without consuming any chat tokens.
    const run = await listQoderCliModels({
        token: resolvedToken
    });
    const combined = `${run.stdout}\n${run.stderr}`.trim();
    const normalized = combined.toLowerCase();
    if (run.error && /enoent|not found|no such file|spawn/i.test(run.error)) {
        return {
            valid: false,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCliResolve$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildQoderCliNotFoundHint"])(run.error),
            unsupported: false
        };
    }
    if (run.timedOut) {
        return {
            valid: false,
            error: "qodercli timed out while validating the token. Check network/proxy access from the OmniRoute host.",
            unsupported: false
        };
    }
    if (/not logged in|please run \/login|login required|unauthorized|forbidden|exchangejobtoken failed|personal token format|invalid[\s\w]{0,40}?(?:token|credential|api[\s_-]*key)/i.test(normalized)) {
        return {
            valid: false,
            error: "Qoder rejected this Personal Access Token (not authorized). " + "Check your token at https://qoder.com/account/integrations.",
            unsupported: false
        };
    }
    // A successful `--list-models` prints the catalog (a table headed by "MODEL").
    if (run.ok && normalized.includes("model")) {
        return {
            valid: true,
            error: null,
            unsupported: false
        };
    }
    return {
        valid: false,
        error: `qodercli validation failed: ${(combined || run.error || "unknown error").slice(0, 300)}`,
        unsupported: false
    };
}
}),
"[project]/open-sse/services/opencodeQuotaFetcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "OPENCODE_WINDOW_5H",
    ()=>OPENCODE_WINDOW_5H,
    "OPENCODE_WINDOW_MONTHLY",
    ()=>OPENCODE_WINDOW_MONTHLY,
    "OPENCODE_WINDOW_WEEKLY",
    ()=>OPENCODE_WINDOW_WEEKLY,
    "_hasWarned404",
    ()=>_hasWarned404,
    "_resetWarned404Urls",
    ()=>_resetWarned404Urls,
    "fetchOpencodeQuota",
    ()=>fetchOpencodeQuota,
    "invalidateOpencodeQuotaCache",
    ()=>invalidateOpencodeQuotaCache,
    "registerOpencodeQuotaFetcher",
    ()=>registerOpencodeQuotaFetcher
]);
/**
 * opencodeQuotaFetcher.ts — OpenCode Go / OpenCode / OpenCode Zen Quota Fetcher
 *
 * Implements QuotaFetcher for the opencode-go, opencode, and opencode-zen providers
 * (quotaPreflight.ts + quotaMonitor.ts).
 *
 * OpenCode Go has THREE independent quota windows per subscription:
 *   - 5-hour (rolling):  $12 of usage
 *   - Weekly:            $30 of usage
 *   - Monthly:           $60 of usage
 *
 * Upstream endpoint (defensive — no public API exists yet):
 *   GET https://opencode.ai/zen/go/v1/quota
 *   Authorization: Bearer <apiKey>
 *
 * Expected response shape:
 *   {
 *     quota: {
 *       window_5h:      { used: number, limit: number, reset_at: number | null },
 *       window_weekly:  { used: number, limit: number, reset_at: number | null },
 *       window_monthly: { used: number, limit: number, reset_at: number | null }
 *     }
 *   }
 *
 * NOTE: As of 2026, no public quota API exists for OpenCode Go / OpenCode Zen
 * (tracked upstream in anomalyco/opencode#16017, #18648, #31084). The default
 * endpoint currently returns HTTP 404. This fetcher is implemented defensively
 * so that the dashboard shows "No quota data" gracefully rather than crashing,
 * and so that when an endpoint is finally published, only the URL constant
 * needs to change.
 *
 * On a 404 response we log ONE console.warn (latched per process — not per
 * request) pointing at the upstream tracking issues, then cache the
 * "endpoint unavailable" result for 5 minutes to avoid hammering. On any other
 * non-200 / parse failure we return null (fail-open) silently. The first
 * call from each server boot is what the operator is most likely to see, so
 * we make it count.
 *
 * Cache: in-memory TTL (60s for success, 5 min for 404).
 *
 * Override: set OMNIROUTE_OPENCODE_QUOTA_URL to a working endpoint. If
 * OpenCode ships a public endpoint (likely in the form of the merged PR
 * #16513), the maintainer can update the default.
 *
 * Registration: call registerOpencodeQuotaFetcher() once at server startup.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// OpenCode quota endpoint — same key works across opencode, opencode-go, opencode-zen
// Default points at /zen/go/v1/quota which returns 404 today (no public quota API yet,
// tracked in anomalyco/opencode#16017).  Set OMNIROUTE_OPENCODE_QUOTA_URL to override.
const OPENCODE_QUOTA_URL = process.env.OMNIROUTE_OPENCODE_QUOTA_URL ?? "https://opencode.ai/zen/go/v1/quota";
// Cache TTL — matches Codex / DeepSeek / Bailian pattern (60s)
const CACHE_TTL_MS = 60_000;
// TTL for cached "endpoint unavailable" results (404) — longer to avoid hammering
// a non-existent endpoint
const NO_ENDPOINT_TTL_MS = 5 * 60_000; // 5 minutes
const OPENCODE_WINDOW_5H = "window_5h";
const OPENCODE_WINDOW_WEEKLY = "window_weekly";
const OPENCODE_WINDOW_MONTHLY = "window_monthly";
// In-memory cache: connectionId → { quota, fetchedAt }
const quotaCache = new Map();
// One-time 404 warning per URL (avoids spamming on every request)
const _warned404Urls = new Set();
function _resetWarned404Urls() {
    _warned404Urls.clear();
}
function _hasWarned404(url) {
    return _warned404Urls.has(url);
}
// Auto-cleanup stale entries every 5 minutes
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
// ─── Helpers ──────────────────────────────────────────────────────────────────
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function parseWindowResetAt(window) {
    const resetAt = toNumber(window["reset_at"] ?? window["resetAt"], 0);
    if (resetAt > 0) {
        // Unix timestamp in seconds (< 1e12) or milliseconds (>= 1e12)
        return new Date(resetAt < 1e12 ? resetAt * 1000 : resetAt).toISOString();
    }
    const resetAfterSeconds = toNumber(window["reset_after_seconds"] ?? window["resetAfterSeconds"], 0);
    if (resetAfterSeconds > 0) {
        return new Date(Date.now() + resetAfterSeconds * 1000).toISOString();
    }
    return null;
}
function parseWindowPercent(window) {
    const used = toNumber(window["used"] ?? window["used_amount"], 0);
    const limit = toNumber(window["limit"] ?? window["limit_amount"], 0);
    if (limit <= 0) return 0;
    return Math.max(0, Math.min(1, used / limit));
}
// ─── Response Parser ──────────────────────────────────────────────────────────
function parseOpencodeQuotaResponse(data) {
    const obj = toRecord(data);
    const quotaObj = toRecord(obj["quota"] ?? obj["data"] ?? obj["usage"]);
    // Look for windows under various possible keys
    const w5h = toRecord(quotaObj[OPENCODE_WINDOW_5H] ?? quotaObj["5h"] ?? quotaObj["hourly"] ?? quotaObj["short"]);
    const wWeekly = toRecord(quotaObj[OPENCODE_WINDOW_WEEKLY] ?? quotaObj["weekly"] ?? quotaObj["week"] ?? quotaObj["wk"]);
    const wMonthly = toRecord(quotaObj[OPENCODE_WINDOW_MONTHLY] ?? quotaObj["monthly"] ?? quotaObj["month"] ?? quotaObj["mo"]);
    const has5h = Object.keys(w5h).length > 0;
    const hasWeekly = Object.keys(wWeekly).length > 0;
    const hasMonthly = Object.keys(wMonthly).length > 0;
    // Need at least one window to be meaningful
    if (!has5h && !hasWeekly && !hasMonthly) return null;
    const percent5h = has5h ? parseWindowPercent(w5h) : 0;
    const percentWeekly = hasWeekly ? parseWindowPercent(wWeekly) : 0;
    const percentMonthly = hasMonthly ? parseWindowPercent(wMonthly) : 0;
    const resetAt5h = has5h ? parseWindowResetAt(w5h) : null;
    const resetAtWeekly = hasWeekly ? parseWindowResetAt(wWeekly) : null;
    const resetAtMonthly = hasMonthly ? parseWindowResetAt(wMonthly) : null;
    const worstPercent = Math.max(percent5h, percentWeekly, percentMonthly);
    const limitReached = Boolean(obj["limit_reached"] ?? quotaObj["limit_reached"]) || worstPercent >= 1;
    // Dominant reset: pick the window with the worst usage
    let dominantResetAt = null;
    if (worstPercent === percent5h) {
        dominantResetAt = resetAt5h ?? resetAtWeekly ?? resetAtMonthly;
    } else if (worstPercent === percentWeekly) {
        dominantResetAt = resetAtWeekly ?? resetAt5h ?? resetAtMonthly;
    } else {
        dominantResetAt = resetAtMonthly ?? resetAtWeekly ?? resetAt5h;
    }
    const window5h = {
        percentUsed: percent5h,
        resetAt: resetAt5h
    };
    const windowWeekly = {
        percentUsed: percentWeekly,
        resetAt: resetAtWeekly
    };
    const windowMonthly = {
        percentUsed: percentMonthly,
        resetAt: resetAtMonthly
    };
    const windows = {};
    if (has5h) windows[OPENCODE_WINDOW_5H] = window5h;
    if (hasWeekly) windows[OPENCODE_WINDOW_WEEKLY] = windowWeekly;
    if (hasMonthly) windows[OPENCODE_WINDOW_MONTHLY] = windowMonthly;
    return {
        used: worstPercent * 100,
        total: 100,
        percentUsed: worstPercent,
        resetAt: dominantResetAt,
        windows,
        window5h,
        windowWeekly,
        windowMonthly,
        limitReached
    };
}
async function fetchOpencodeQuota(connectionId, connection) {
    // Check cache first
    const cached = quotaCache.get(connectionId);
    if (cached) {
        // 404 sentinel — use longer TTL to avoid hammering a non-existent endpoint
        if (cached.noEndpoint && Date.now() - cached.fetchedAt < NO_ENDPOINT_TTL_MS) {
            return null;
        }
        if (cached.quota !== null && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.quota;
        }
    }
    // Extract API key from connection
    const apiKey = typeof connection?.apiKey === "string" && connection.apiKey.trim().length > 0 ? connection.apiKey : null;
    if (!apiKey) {
        return null;
    }
    try {
        // #6911: space concurrent upstream quota fetches (mirrors codexQuotaFetcher.ts).
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const response = await fetch(OPENCODE_QUOTA_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(8_000)
        });
        if (!response.ok) {
            if (response.status === 404) {
                // Upstream doesn't expose this endpoint. Warn once per URL per process so
                // operators know the dashboard will be empty for opencode-go connections.
                // Cache a 404 sentinel for NO_ENDPOINT_TTL_MS to avoid hammering.
                // See opencode issues #10448, #16017, #18648, #31084.
                if (!_warned404Urls.has(OPENCODE_QUOTA_URL)) {
                    _warned404Urls.add(OPENCODE_QUOTA_URL);
                    console.warn(`[opencodeQuotaFetcher] ${OPENCODE_QUOTA_URL} returned 404 — opencode-go usage API is not yet public. ` + `Set OMNIROUTE_OPENCODE_QUOTA_URL to a working endpoint, or follow ` + `https://github.com/anomalyco/opencode/issues/16017 for upstream status.`);
                }
                quotaCache.set(connectionId, {
                    quota: null,
                    fetchedAt: Date.now(),
                    noEndpoint: true
                });
                return null;
            }
            if (response.status === 401 || response.status === 403) {
                quotaCache.delete(connectionId);
            }
            return null;
        }
        let data;
        try {
            data = await response.json();
        } catch  {
            // Malformed JSON — fail open
            return null;
        }
        const quota = parseOpencodeQuotaResponse(data);
        if (!quota) return null;
        // Store in cache
        quotaCache.set(connectionId, {
            quota,
            fetchedAt: Date.now()
        });
        return quota;
    } catch  {
        // Network error, timeout, etc. — fail open
        return null;
    }
}
function invalidateOpencodeQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function registerOpencodeQuotaFetcher() {
    for (const provider of [
        "opencode-go",
        "opencode",
        "opencode-zen"
    ]){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])(provider, fetchOpencodeQuota);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])(provider, fetchOpencodeQuota);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaWindows"])(provider, [
            OPENCODE_WINDOW_5H,
            OPENCODE_WINDOW_WEEKLY,
            OPENCODE_WINDOW_MONTHLY
        ]);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/deepseekQuotaFetcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "fetchDeepseekQuota",
    ()=>fetchDeepseekQuota,
    "invalidateDeepseekQuotaCache",
    ()=>invalidateDeepseekQuotaCache,
    "registerDeepseekQuotaFetcher",
    ()=>registerDeepseekQuotaFetcher
]);
/**
 * deepseekQuotaFetcher.ts — DeepSeek Balance Quota Fetcher
 *
 * Implements QuotaFetcher for the DeepSeek provider (quotaPreflight.ts + quotaMonitor.ts).
 *
 * DeepSeek provides a balance API:
 *   GET https://api.deepseek.com/user/balance
 *
 * Response format:
 *   {
 *     "is_available": true,
 *     "balance_infos": [
 *       { "currency": "USD", "total_balance": "10.00", "granted_balance": "0.00", "topped_up_balance": "10.00" }
 *     ]
 *   }
 *
 * We prefer USD if available, otherwise use CNY. When balance is zero or is_available is false,
 * the account quota is considered exhausted.
 *
 * Cache: in-memory TTL (60s) to avoid hammering the balance API on every request.
 *
 * Registration: call registerDeepseekQuotaFetcher() once at server startup.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// DeepSeek API config
const DEEPSEEK_CONFIG = {
    baseUrl: "https://api.deepseek.com",
    balancePath: "/user/balance"
};
// Cache TTL — short enough to be reactive, long enough to avoid rate limits
const CACHE_TTL_MS = 60_000; // 60 seconds
// In-memory cache: connectionId → { quota, fetchedAt }
const quotaCache = new Map();
// Auto-cleanup stale entries every 5 minutes
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
// ─── Helpers ─────────────────────────────────────────────────────────────────
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toArray(value) {
    return Array.isArray(value) ? value : [];
}
// ─── Response Parser ─────────────────────────────────────────────────────────
function parseDeepseekQuotaResponse(data) {
    const obj = toRecord(data);
    // Check is_available field
    const isAvailable = obj.is_available ?? obj.isAvailable;
    const isAvailableBool = isAvailable === true;
    // Parse all balance infos
    const balanceInfos = parseAllBalanceInfos(obj);
    if (!balanceInfos || balanceInfos.length === 0) {
        return null;
    }
    // Check if any balance is exhausted
    const hasPositiveBalance = balanceInfos.some((b)=>b.balance > 0);
    const limitReached = !isAvailableBool || !hasPositiveBalance;
    // percentUsed is inverse: 0% used when balance is full, 100% when exhausted
    const percentUsed = limitReached ? 1 : 0;
    return {
        used: percentUsed * 100,
        total: 100,
        percentUsed,
        resetAt: null,
        balances: balanceInfos,
        isAvailable: isAvailableBool,
        limitReached,
        windowDaily: {
            percentUsed,
            resetAt: null
        }
    };
}
function parseAllBalanceInfos(data) {
    const obj = toRecord(data);
    const balanceInfos = toArray(obj.balance_infos);
    const results = [];
    for (const item of balanceInfos){
        const record = toRecord(item);
        const currency = typeof record.currency === "string" ? record.currency.toUpperCase() : "";
        const totalBalance = toNumber(record.total_balance ?? record.totalBalance, 0);
        const grantedBalance = toNumber(record.granted_balance ?? record.grantedBalance, 0);
        const toppedUpBalance = toNumber(record.topped_up_balance ?? record.toppedUpBalance, 0);
        if (currency) {
            results.push({
                currency,
                totalBalance,
                balance: totalBalance,
                grantedBalance,
                toppedUpBalance
            });
        }
    }
    return results;
}
async function fetchDeepseekQuota(connectionId, connection) {
    // Check cache first
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    // Extract API key from connection
    const apiKey = typeof connection?.apiKey === "string" && connection.apiKey.trim().length > 0 ? connection.apiKey : null;
    if (!apiKey) {
        return null;
    }
    const url = `${DEEPSEEK_CONFIG.baseUrl}${DEEPSEEK_CONFIG.balancePath}`;
    try {
        // #6911: space concurrent upstream quota fetches so N accounts on one IP do
        // not all hit the provider in the same second (mirrors codexQuotaFetcher.ts).
        // Cache hits above never reach here; this only paces genuine network calls.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(8_000)
        });
        // 401/403: token invalid — remove from cache
        if (response.status === 401 || response.status === 403) {
            quotaCache.delete(connectionId);
            return null;
        }
        if (!response.ok) {
            // Other errors — fail open
            return null;
        }
        const data = await response.json();
        const quota = parseDeepseekQuotaResponse(data);
        if (!quota) return null;
        // Store in cache
        quotaCache.set(connectionId, {
            quota,
            fetchedAt: Date.now()
        });
        return quota;
    } catch  {
        // Network error, timeout, etc. — fail open
        return null;
    }
}
function invalidateDeepseekQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function registerDeepseekQuotaFetcher() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])("deepseek", fetchDeepseekQuota);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])("deepseek", fetchDeepseekQuota);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/bailianQuotaFetcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "BAILIAN_WINDOW_5H",
    ()=>BAILIAN_WINDOW_5H,
    "BAILIAN_WINDOW_MONTHLY",
    ()=>BAILIAN_WINDOW_MONTHLY,
    "BAILIAN_WINDOW_WEEKLY",
    ()=>BAILIAN_WINDOW_WEEKLY,
    "fetchBailianQuota",
    ()=>fetchBailianQuota,
    "invalidateBailianQuotaCache",
    ()=>invalidateBailianQuotaCache,
    "registerBailianCodingPlanQuotaFetcher",
    ()=>registerBailianCodingPlanQuotaFetcher
]);
/**
 * bailianQuotaFetcher.ts — Alibaba Coding Plan (Bailian) Triple-Window Quota Fetcher
 *
 * Implements QuotaFetcher for the bailian-coding-plan provider (quotaPreflight.ts + quotaMonitor.ts).
 * This fetcher is specific to the Alibaba Coding Plan quota API.
 *
 * Bailian Coding Plan has THREE independent quota windows:
 *   - 5h:       short-term rate limit, resets every 5 hours
 *   - weekly:   weekly limit, resets every week
 *   - monthly:  monthly billing limit
 *
 * We return percentUsed = max(5h%, weekly%, monthly%) so the system switches accounts when
 * ANY window approaches exhaustion (95% threshold).
 *
 * [Oracle CONDITIONAL] consoleApiKey is bailian-coding-plan specific. Do NOT reuse for other providers.
 *
 * Cache: in-memory TTL (60s) to avoid hammering the usage API on every request.
 *
 * Registration: call registerBailianCodingPlanQuotaFetcher() once at server startup.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Bailian quota hosts (international / china fallback)
const BAILIAN_QUOTA_HOSTS = {
    international: "https://modelstudio.console.alibabacloud.com",
    china: "https://bailian.console.aliyun.com"
};
const BAILIAN_QUOTA_PATH = "/data/api.json?action=zeldaEasy.broadscope-bailian.codingPlan.queryCodingPlanInstanceInfoV2&product=broadscope-bailian&api=queryCodingPlanInstanceInfoV2";
// Cache TTL — short enough to be reactive, long enough to avoid rate limits
const CACHE_TTL_MS = 60_000; // 60 seconds
const BAILIAN_WINDOW_5H = "window_5h";
const BAILIAN_WINDOW_WEEKLY = "window_weekly";
const BAILIAN_WINDOW_MONTHLY = "window_monthly";
// In-memory cache: connectionId → { quota, fetchedAt }
const quotaCache = new Map();
// Auto-cleanup stale entries every 5 minutes
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
// ─── Helpers ─────────────────────────────────────────────────────────────────
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function getAuthKey(providerSpecificData, apiKey) {
    // [Oracle CONDITIONAL] consoleApiKey is bailian-coding-plan specific only
    const consoleKey = providerSpecificData?.consoleApiKey;
    if (typeof consoleKey === "string" && consoleKey.trim().length > 0) {
        return consoleKey;
    }
    return apiKey;
}
function getHost() {
    const configuredHost = process.env.ALIBABA_CODING_PLAN_HOST?.trim();
    if (!configuredHost) {
        return BAILIAN_QUOTA_HOSTS.international;
    }
    if (/^https?:\/\//i.test(configuredHost)) {
        return configuredHost;
    }
    return `https://${configuredHost}`;
}
function getQuotaUrl() {
    return process.env.ALIBABA_CODING_PLAN_QUOTA_URL || `${getHost()}${BAILIAN_QUOTA_PATH}`;
}
function buildHeaders(authKey) {
    return {
        Authorization: `Bearer ${authKey}`,
        "x-api-key": authKey,
        "X-DashScope-API-Key": authKey,
        "Content-Type": "application/json",
        Accept: "application/json"
    };
}
// ─── Response Parser ─────────────────────────────────────────────────────────
function parseBailianQuotaResponse(data) {
    const obj = toRecord(data);
    if (obj["code"] === "ConsoleNeedLogin") {
        // Caller will handle fallback — return null here to signal no usable data
        return null;
    }
    if (obj["code"] !== "Success" && obj["code"] !== "200") {
        return null;
    }
    const dataObj = toRecord(obj["data"]);
    const instanceInfos = dataObj["codingPlanInstanceInfos"];
    if (!Array.isArray(instanceInfos) || instanceInfos.length === 0) {
        return null;
    }
    const instance = toRecord(instanceInfos[0]);
    const quotaInfo = toRecord(instance["codingPlanQuotaInfo"]);
    if (Object.keys(quotaInfo).length === 0) {
        return null;
    }
    // Parse 5h window
    const used5h = toNumber(quotaInfo["per5HourUsedQuota"]);
    const total5h = toNumber(quotaInfo["per5HourTotalQuota"]);
    const resetAt5h = toNumber(quotaInfo["per5HourQuotaNextRefreshTime"]);
    const pct5h = total5h > 0 ? used5h / total5h : 0;
    // Parse weekly window
    const usedWeekly = toNumber(quotaInfo["perWeekUsedQuota"]);
    const totalWeekly = toNumber(quotaInfo["perWeekTotalQuota"]);
    const resetAtWeekly = toNumber(quotaInfo["perWeekQuotaNextRefreshTime"]);
    const pctWeekly = totalWeekly > 0 ? usedWeekly / totalWeekly : 0;
    // Parse monthly window
    const usedMonthly = toNumber(quotaInfo["perBillMonthUsedQuota"]);
    const totalMonthly = toNumber(quotaInfo["perBillMonthTotalQuota"]);
    const resetAtMonthly = toNumber(quotaInfo["perBillMonthQuotaNextRefreshTime"]);
    const pctMonthly = totalMonthly > 0 ? usedMonthly / totalMonthly : 0;
    // Most restrictive window = highest percentUsed
    const worstPercentUsed = Math.max(pct5h, pctWeekly, pctMonthly);
    const window5h = {
        percentUsed: pct5h,
        resetAt: resetAt5h > 0 ? new Date(resetAt5h * 1000).toISOString() : null
    };
    const windowWeekly = {
        percentUsed: pctWeekly,
        resetAt: resetAtWeekly > 0 ? new Date(resetAtWeekly * 1000).toISOString() : null
    };
    const windowMonthly = {
        percentUsed: pctMonthly,
        resetAt: resetAtMonthly > 0 ? new Date(resetAtMonthly * 1000).toISOString() : null
    };
    const windows = {
        [BAILIAN_WINDOW_5H]: window5h,
        [BAILIAN_WINDOW_WEEKLY]: windowWeekly,
        [BAILIAN_WINDOW_MONTHLY]: windowMonthly
    };
    // Dominant reset = reset time of the most restrictive window
    const dominantResetAt = worstPercentUsed === pct5h ? window5h.resetAt : worstPercentUsed === pctWeekly ? windowWeekly.resetAt : windowMonthly.resetAt;
    return {
        used: Math.round(worstPercentUsed * 100),
        total: 100,
        percentUsed: worstPercentUsed,
        resetAt: dominantResetAt,
        windows,
        window5h,
        windowWeekly,
        windowMonthly
    };
}
async function fetchBailianQuota(connectionId, connection) {
    // Check cache first
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    // Extract credentials from connection snapshot
    const providerSpecificData = connection?.providerSpecificData && typeof connection.providerSpecificData === "object" && !Array.isArray(connection.providerSpecificData) ? connection.providerSpecificData : undefined;
    const apiKey = typeof connection?.apiKey === "string" && connection.apiKey.trim().length > 0 ? connection.apiKey : "";
    const authKey = getAuthKey(providerSpecificData, apiKey);
    if (!authKey) {
        return null;
    }
    const headers = buildHeaders(authKey);
    try {
        const url = getQuotaUrl();
        // #6911: space concurrent upstream quota fetches (mirrors codexQuotaFetcher.ts).
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({}),
            signal: AbortSignal.timeout(8_000)
        });
        const rawData = await response.json();
        const obj = toRecord(rawData);
        // ConsoleNeedLogin → retry with China host exactly once
        if (obj["code"] === "ConsoleNeedLogin") {
            try {
                const chinaUrl = process.env.ALIBABA_CODING_PLAN_QUOTA_URL ? url : `${BAILIAN_QUOTA_HOSTS.china}${BAILIAN_QUOTA_PATH}`;
                // #6911: space this fallback fetch too — it is still a genuine upstream call.
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
                const retryResponse = await fetch(chinaUrl, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({}),
                    signal: AbortSignal.timeout(8_000)
                });
                const retryData = await retryResponse.json();
                const quota = parseBailianQuotaResponse(retryData);
                if (quota) {
                    quotaCache.set(connectionId, {
                        quota,
                        fetchedAt: Date.now()
                    });
                    return quota;
                }
                return null;
            } catch  {
                // China host also failed — fail open
                return null;
            }
        }
        const quota = parseBailianQuotaResponse(rawData);
        if (!quota) return null;
        quotaCache.set(connectionId, {
            quota,
            fetchedAt: Date.now()
        });
        return quota;
    } catch  {
        // Network error, timeout, etc. — fail open
        return null;
    }
}
function invalidateBailianQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function registerBailianCodingPlanQuotaFetcher() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])("bailian-coding-plan", fetchBailianQuota);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])("bailian-coding-plan", fetchBailianQuota);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaWindows"])("bailian-coding-plan", [
        BAILIAN_WINDOW_5H,
        BAILIAN_WINDOW_WEEKLY,
        BAILIAN_WINDOW_MONTHLY
    ]);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/firecrawlQuotaFetcher.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractFirecrawlApiKey",
    ()=>extractFirecrawlApiKey,
    "fetchFirecrawlQuota",
    ()=>fetchFirecrawlQuota,
    "getFirecrawlBaseUrl",
    ()=>getFirecrawlBaseUrl,
    "invalidateFirecrawlQuotaCache",
    ()=>invalidateFirecrawlQuotaCache,
    "parseFirecrawlCreditUsage",
    ()=>parseFirecrawlCreditUsage,
    "registerFirecrawlQuotaFetcher",
    ()=>registerFirecrawlQuotaFetcher
]);
/**
 * firecrawlQuotaFetcher.ts — Firecrawl team credit quota
 *
 * Live credit pool for the `firecrawl` connection (web fetch + search).
 *
 * Endpoint:
 *   GET https://api.firecrawl.dev/v2/team/credit-usage
 *   Authorization: Bearer <apiKey>
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       remainingCredits: number,
 *       planCredits: number,
 *       billingPeriodStart?: string,
 *       billingPeriodEnd?: string
 *     }
 *   }
 *
 * Fail-open: missing key or upstream errors return null.
 * Cache: 60s in-memory TTL keyed by connectionId.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/quotaMonitor.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaFetchThrottle.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const CREDIT_USAGE_URL = "https://api.firecrawl.dev/v2/team/credit-usage";
const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 8_000;
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
function extractFirecrawlApiKey(connection) {
    if (typeof connection?.apiKey === "string" && connection.apiKey.trim()) {
        return connection.apiKey.trim();
    }
    const credentials = toRecord(connection?.credentials);
    if (typeof credentials.apiKey === "string" && credentials.apiKey.trim()) {
        return credentials.apiKey.trim();
    }
    return null;
}
function parseFirecrawlCreditUsage(data) {
    const root = toRecord(data);
    const payload = toRecord(root.data);
    const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumberOrNull"])(payload.remainingCredits ?? payload.remaining_credits);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumberOrNull"])(payload.planCredits ?? payload.plan_credits);
    if (remaining === null || plan === null || plan < 0) return null;
    const planCredits = Math.max(0, plan);
    const remainingCredits = Math.max(0, remaining);
    const extraCreditsInferred = Math.max(0, remainingCredits - planCredits);
    const overPlan = extraCreditsInferred > 0;
    const used = planCredits > 0 ? Math.max(0, planCredits - remainingCredits) : 0;
    const percentUsed = planCredits > 0 ? used / planCredits : remainingCredits <= 0 ? 1 : 0;
    const resetRaw = payload.billingPeriodEnd ?? payload.billing_period_end;
    const resetAt = typeof resetRaw === "string" && resetRaw.trim() ? resetRaw.trim() : null;
    return {
        used,
        total: planCredits,
        percentUsed,
        resetAt,
        remainingCredits,
        planCredits,
        extraCreditsInferred,
        overPlan,
        limitReached: remainingCredits <= 0 || percentUsed >= 1
    };
}
function getFirecrawlBaseUrl(connection) {
    const envBase = process.env.FIRECRAWL_BASE_URL?.trim();
    if (envBase && !envBase.includes("api.firecrawl.dev")) {
        return envBase.replace(/\/+$/, "");
    }
    const providerData = toRecord(connection?.providerSpecificData);
    const connBase = typeof connection?.baseUrl === "string" ? connection.baseUrl : providerData?.baseUrl;
    if (typeof connBase === "string" && connBase.trim() && !connBase.includes("api.firecrawl.dev")) {
        return connBase.trim().replace(/\/+$/, "");
    }
    return null;
}
async function fetchFirecrawlQuota(connectionId, connection) {
    const cached = quotaCache.get(connectionId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.quota;
    }
    const customBase = getFirecrawlBaseUrl(connection);
    if (customBase) {
        return {
            used: 0,
            total: 0,
            percentUsed: 0,
            resetAt: null,
            remainingCredits: 0,
            planCredits: 0,
            extraCreditsInferred: 0,
            overPlan: false,
            limitReached: false
        };
    }
    const apiKey = extractFirecrawlApiKey(connection);
    if (!apiKey) {
        quotaCache.set(connectionId, {
            quota: null,
            fetchedAt: Date.now()
        });
        return null;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaFetchThrottle$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["throttleQuotaFetch"])();
        const response = await fetch(CREDIT_USAGE_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
        if (response.status === 401 || response.status === 403) {
            quotaCache.set(connectionId, {
                quota: null,
                fetchedAt: Date.now()
            });
            return null;
        }
        if (!response.ok) {
            return null;
        }
        const body = await response.json();
        const quota = parseFirecrawlCreditUsage(body);
        quotaCache.set(connectionId, {
            quota,
            fetchedAt: Date.now()
        });
        return quota;
    } catch  {
        quotaCache.set(connectionId, {
            quota: null,
            fetchedAt: Date.now()
        });
        return null;
    }
}
function invalidateFirecrawlQuotaCache(connectionId) {
    quotaCache.delete(connectionId);
}
function registerFirecrawlQuotaFetcher() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerQuotaFetcher"])("firecrawl", fetchFirecrawlQuota);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaMonitor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerMonitorFetcher"])("firecrawl", fetchFirecrawlQuota);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "USAGE_FETCHER_PROVIDERS",
    ()=>USAGE_FETCHER_PROVIDERS,
    "__testing",
    ()=>__testing,
    "getUsageForProvider",
    ()=>getUsageForProvider
]);
/**
 * Usage Fetcher - Get usage data from provider APIs
 *
 * This module is the dispatcher (orchestration) layer: it maps a provider name
 * to the per-provider usage fetcher leaf under `./usage/<provider>.ts` and
 * shapes the connection into the args each leaf expects. The provider-specific
 * fetcher/parser logic itself lives in those leaves so this file stays flat.
 * External consumers import `getUsageForProvider` / `USAGE_FETCHER_PROVIDERS`
 * (and the re-exported helpers) from here — the leaf split is an internal
 * implementation detail.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codeAssistSubscription.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/minimax.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$glm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/glm.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/antigravity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$cursor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/cursor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$kimi$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/kimi.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/codex.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$claude$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/claude.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/kiro.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$adobeFirefly$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/usage/adobeFirefly.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$openrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/openrouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeOllamaUsage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/opencodeOllamaUsage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$codebuddy$2d$cn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/codebuddy-cn.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$promptql$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/usage/promptql.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$hyperagent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/hyperagent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/github.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$crof$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/crof.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$nanogpt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/nanogpt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/qoder.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$opencode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/opencode.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/deepseek.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$bailian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/bailian.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$vertex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/vertex.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xiaomi$2d$mimo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/xiaomi-mimo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/xai.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xaiOauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/xaiOauth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$grokCli$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/grokCli.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$firecrawl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/firecrawl.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$openrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$opencode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$bailian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$grokCli$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$firecrawl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$openrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$opencode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$bailian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$grokCli$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$firecrawl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
;
;
;
;
;
;
const USAGE_FETCHER_PROVIDERS = [
    "github",
    "antigravity",
    "agy",
    "claude",
    "codex",
    "cursor",
    "kiro",
    "amazon-q",
    "kimi-coding",
    "kimi-coding-apikey",
    "qoder",
    "glm",
    "glm-cn",
    "zai",
    "glmt",
    "opencode-go",
    "ollama-cloud",
    "minimax",
    "minimax-cn",
    "crof",
    "bailian-coding-plan",
    "nanogpt",
    "deepseek",
    "opencode",
    "opencode-zen",
    "xiaomi-mimo",
    "xai",
    "xai-oauth",
    "xao",
    "grok-cli",
    "vertex",
    "vertex-partner",
    "codebuddy-cn",
    "openrouter",
    // PromptQL playground credits (data.pro.ql.app getCreditSummary)
    "promptql",
    "pql",
    // HyperAgent billing usage (creditBlocks USD)
    "hyperagent",
    "ha",
    // Firecrawl team credits (GET /v2/team/credit-usage)
    "firecrawl"
];
async function getUsageForProvider(connection, options = {}) {
    const { id, provider, accessToken, apiKey, providerSpecificData, projectId, email } = connection;
    switch(provider){
        case "github":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGitHubUsage"])(accessToken, providerSpecificData);
        case "antigravity":
        case "agy":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityUsage"])(provider, accessToken, providerSpecificData, projectId, id, options);
        case "claude":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$claude$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClaudeUsage"])(accessToken);
        case "codex":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexUsage"])(accessToken, providerSpecificData);
        case "cursor":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$cursor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCursorUsage"])(accessToken || "", providerSpecificData);
        case "kiro":
        case "amazon-q":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKiroUsage"])(accessToken, providerSpecificData);
        case "vertex":
        case "vertex-partner":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$vertex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getVertexUsage"])(id || "", provider);
        case "kimi-coding":
        case "kimi-coding-apikey":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$kimi$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKimiUsage"])(accessToken, apiKey, providerSpecificData);
        case "qoder":
            // Qoder PATs live in `apiKey` (decrypted) or `providerSpecificData.qoderPat`,
            // never in `accessToken`.
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQoderUsage"])(apiKey, providerSpecificData);
        case "glm":
        case "glm-cn":
        case "zai":
        case "glmt":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$glm$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGlmUsage"])(apiKey || "", {
                ...providerSpecificData || {},
                ...provider === "glm-cn" ? {
                    apiRegion: "china"
                } : {}
            });
        case "opencode-go":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeOllamaUsage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenCodeGoUsage"])(apiKey || "", providerSpecificData);
        case "ollama-cloud":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeOllamaUsage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOllamaCloudUsage"])(providerSpecificData);
        case "minimax":
        case "minimax-cn":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxUsage"])(apiKey || "", provider);
        case "crof":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$crof$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCrofUsage"])(apiKey || "");
        case "bailian-coding-plan":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$bailian$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBailianCodingPlanUsage"])(id || "", apiKey || "", providerSpecificData);
        case "nanogpt":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$nanogpt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNanoGptUsage"])(apiKey || "");
        case "deepseek":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$deepseek$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDeepseekUsage"])(id || "", apiKey || "");
        case "openrouter":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$openrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenrouterUsage"])(id || "", apiKey || "", providerSpecificData);
        case "opencode":
        case "opencode-zen":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$opencode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpencodeUsage"])(id || "", apiKey || "");
        case "xiaomi-mimo":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xiaomi$2d$mimo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getXiaomiMimoUsage"])(id || "");
        case "xai":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getXaiUsage"])(id || "");
        case "xai-oauth":
        case "xao":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xaiOauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getXaiOauthUsage"])(id || "", accessToken, connection);
        case "grok-cli":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$grokCli$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGrokCliUsage"])(accessToken);
        case "codebuddy-cn":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$codebuddy$2d$cn$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodeBuddyCnUsage"])(accessToken, apiKey, providerSpecificData);
        case "promptql":
        case "pql":
            // DDN lux JWTs carry projectId only in JWT aud; connection.projectId may be set by sync.
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$promptql$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPromptQlUsage"])(apiKey || accessToken, providerSpecificData, projectId);
        case "adobe-firefly":
        case "firefly":
            // Cookie or IMS JWT in apiKey/accessToken → GET firefly.adobe.io/v1/credits/balance
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$adobeFirefly$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAdobeFireflyUsage"])(apiKey, accessToken, providerSpecificData);
        case "hyperagent":
        case "ha":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$hyperagent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHyperAgentUsage"])(apiKey || accessToken, providerSpecificData);
        case "firecrawl":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$firecrawl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFirecrawlUsage"])(id || "", apiKey, connection);
        default:
            return {
                message: `Usage API not implemented for ${provider}`
            };
    }
}
const __testing = {
    parseResetTime: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"],
    parseQoderUserStatusUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$qoder$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseQoderUserStatusUsage"],
    formatGitHubQuotaSnapshot: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatGitHubQuotaSnapshot"],
    inferGitHubPlanName: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inferGitHubPlanName"],
    getAntigravityPlanLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityPlanLabel"],
    extractCodeAssistSubscriptionTier: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCodeAssistSubscriptionTier"],
    extractCodeAssistOnboardTierId: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCodeAssistOnboardTierId"],
    getMiniMaxPlanLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxPlanLabel"],
    inferMiniMaxPlanLabelFromTotals: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inferMiniMaxPlanLabelFromTotals"],
    getOpencodeUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$opencode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpencodeUsage"],
    getClaudePlanLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$claude$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClaudePlanLabel"],
    createQuotaFromUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQuotaFromUsage"],
    getMiniMaxQuotaResetAt: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxQuotaResetAt"],
    isMiniMaxTextQuotaModel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isMiniMaxTextQuotaModel"],
    getMiniMaxSessionTotal: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxSessionTotal"],
    getMiniMaxWeeklyTotal: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxWeeklyTotal"],
    createMiniMaxQuotaFromCount: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createMiniMaxQuotaFromCount"],
    createMiniMaxQuotaFromPercent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createMiniMaxQuotaFromPercent"],
    getMiniMaxRemainingPercent: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxRemainingPercent"],
    getMiniMaxUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxUsage"],
    getXiaomiMimoUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xiaomi$2d$mimo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getXiaomiMimoUsage"],
    getXaiUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getXaiUsage"],
    getXaiOauthUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$xaiOauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getXaiOauthUsage"],
    getFirecrawlUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$firecrawl$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFirecrawlUsage"],
    getVertexUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$vertex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getVertexUsage"],
    getMiniMaxAuthErrorMessage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxAuthErrorMessage"],
    getMiniMaxErrorSummary: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$minimax$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMiniMaxErrorSummary"],
    mapCodeAssistSubscriptionToPlanLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapCodeAssistSubscriptionToPlanLabel"],
    mapCodeAssistTierIdToLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapCodeAssistTierIdToLabel"],
    mapSubscriptionTierStringToPlanLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapSubscriptionTierStringToPlanLabel"],
    toDisplayLabel: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toDisplayLabel"],
    getKiroUsage: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKiroUsage"]
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/errorClassifier.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CONTEXT_OVERFLOW_REGEX",
    ()=>CONTEXT_OVERFLOW_REGEX,
    "CONTEXT_OVERFLOW_SIGNALS",
    ()=>CONTEXT_OVERFLOW_SIGNALS,
    "PROVIDER_ERROR_TYPES",
    ()=>PROVIDER_ERROR_TYPES,
    "classifyProviderError",
    ()=>classifyProviderError,
    "containsModelUnavailableMessage",
    ()=>containsModelUnavailableMessage,
    "isContextOverflow",
    ()=>isContextOverflow,
    "isEmptyContentResponse",
    ()=>isEmptyContentResponse,
    "isResourceNotFoundResponse",
    ()=>isResourceNotFoundResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaTextCooldowns.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Terminal stop signals where an empty content payload is still a legitimate,
// successful completion (truncated at the token limit, or a tool-call turn) —
// NOT a silent "fake success" failure. Used to avoid rewriting a valid HTTP 200
// (e.g. a Claude Code `max_tokens: 1` connectivity ping) into a synthetic 502.
const LEGIT_EMPTY_CLAUDE_STOP = new Set([
    "max_tokens",
    "tool_use"
]);
const LEGIT_EMPTY_OPENAI_FINISH = new Set([
    "length",
    "tool_calls",
    "content_filter"
]);
function isEmptyContentResponse(responseBody) {
    if (!responseBody || typeof responseBody !== "object") return false;
    const body = responseBody;
    if (Array.isArray(body.choices)) {
        const firstChoice = body.choices[0];
        if (!firstChoice) return true;
        const message = firstChoice.message;
        const delta = firstChoice.delta;
        const content = message?.content ?? delta?.content;
        const reasoningContent = message?.reasoning_content ?? delta?.reasoning_content;
        const hasToolCalls = Array.isArray(message?.tool_calls) && message.tool_calls.length > 0 || Array.isArray(delta?.tool_calls) && delta.tool_calls.length > 0;
        const hasContent = content !== null && content !== undefined && content !== "";
        const hasReasoning = reasoningContent !== null && reasoningContent !== undefined && reasoningContent !== "";
        // A response truncated at the token limit (finish_reason "length") is a valid,
        // successful completion even with empty text — do not flag it as a fake success.
        const finishReason = typeof firstChoice.finish_reason === "string" ? firstChoice.finish_reason : "";
        if (LEGIT_EMPTY_OPENAI_FINISH.has(finishReason)) return false;
        return !hasContent && !hasReasoning && !hasToolCalls;
    }
    if (Array.isArray(body.content)) {
        if (body.content.length > 0) return false;
        // Empty content array: a response truncated at max_tokens (or one that stopped
        // to emit a tool_use block) is a legitimate terminal state, not a silent
        // failure. Only flag empty content when no such terminal stop_reason is present.
        const stopReason = typeof body.stop_reason === "string" ? body.stop_reason : "";
        return !LEGIT_EMPTY_CLAUDE_STOP.has(stopReason);
    }
    if (typeof body.text === "string") {
        return body.text.trim() === "";
    }
    if ("content" in body) {
        const content = body.content;
        return content === null || content === undefined || content === "";
    }
    return false;
}
const PROVIDER_ERROR_TYPES = {
    RATE_LIMITED: "rate_limited",
    UNAUTHORIZED: "unauthorized",
    ACCOUNT_DEACTIVATED: "account_deactivated",
    FORBIDDEN: "forbidden",
    SERVER_ERROR: "server_error",
    QUOTA_EXHAUSTED: "quota_exhausted",
    PROJECT_ROUTE_ERROR: "project_route_error",
    CONTEXT_OVERFLOW: "context_overflow",
    OAUTH_INVALID_TOKEN: "oauth_invalid_token",
    EMPTY_CONTENT: "empty_content",
    MODEL_NOT_FOUND: "model_not_found"
};
const CONTEXT_OVERFLOW_SIGNALS = [
    "context overflow",
    "prompt too large",
    "context window",
    "maximum context",
    "exceeds context",
    "input too long",
    "token limit",
    "too many tokens",
    "context length",
    "exceed.*context",
    "messages exceed"
];
const CONTEXT_OVERFLOW_REGEX = new RegExp(CONTEXT_OVERFLOW_SIGNALS.join("|"), "i");
function isContextOverflow(errorText) {
    return CONTEXT_OVERFLOW_REGEX.test(String(errorText || ""));
}
// Matches phrasing like `Model minimax-m3-free is not supported` or
// `model "gpt-9" is not supported` — free-tier/aggregator providers name the
// specific model in the sentence instead of using a fixed fragment like
// "model not supported". Shared by modelFamilyFallback.ts's
// isModelUnavailableError() (400/403/404) and this module's 401 branch below,
// so the same phrasing locks the model out on either status. Bounded
// quantifier ({0,80}) keeps it ReDoS-safe. (#7268)
const MODEL_NAMED_UNSUPPORTED_REGEX = /\bmodel\b[^\n]{0,80}\bis not supported\b/i;
function containsModelUnavailableMessage(errorMessage) {
    return MODEL_NAMED_UNSUPPORTED_REGEX.test(String(errorMessage || "").toLowerCase());
}
function responseBodyToString(responseBody) {
    if (typeof responseBody === "string") return responseBody;
    if (responseBody !== null && typeof responseBody === "object") {
        try {
            return JSON.stringify(responseBody);
        } catch  {
            return "";
        }
    }
    return "";
}
// A provider can return 404 for request-scoped resources (Files API ids,
// response items, uploads, etc.). These failures describe the request payload,
// not provider/model health. Keep every expression bounded to avoid ReDoS on
// upstream-controlled error bodies.
const RESOURCE_NOT_FOUND_PATTERNS = [
    /\bfiles?\b[^\n]{0,160}\b(?:not found|does not exist)\b/i,
    /\b(?:not found|does not exist)\b[^\n]{0,160}\bfiles?\b/i,
    /\b(?:input[_ -]?file|file[_ -]?id|item|response|vector[_ -]?store|upload)\b[^\n]{0,160}\b(?:not found|does not exist)\b/i,
    /\b(?:not found|does not exist)\b[^\n]{0,160}\b(?:input[_ -]?file|file[_ -]?id|item|response|vector[_ -]?store|upload)\b/i,
    /\bfile-[a-z0-9_-]+\b[^\n]{0,160}\b(?:not found|does not exist)\b/i
];
function isResourceNotFoundResponse(responseBody) {
    const body = responseBodyToString(responseBody);
    return RESOURCE_NOT_FOUND_PATTERNS.some((pattern)=>pattern.test(body));
}
function shouldPreserveQuotaSignalsFor429(provider) {
    if (!provider) return true;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "oauth";
}
function classifyProviderError(statusCode, responseBody, provider) {
    const bodyStr = responseBodyToString(responseBody);
    const creditsExhausted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCreditsExhausted"])(bodyStr);
    const subscriptionQuotaExhausted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSubscriptionQuotaText"])(bodyStr.toLowerCase());
    const accountDeactivated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountDeactivated"])(bodyStr);
    const oauthInvalid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOAuthInvalidToken"])(bodyStr);
    const preserveQuota429 = shouldPreserveQuotaSignalsFor429(provider);
    if ((creditsExhausted || subscriptionQuotaExhausted) && [
        400,
        402,
        403
    ].includes(statusCode)) {
        return PROVIDER_ERROR_TYPES.QUOTA_EXHAUSTED;
    }
    if ((creditsExhausted || subscriptionQuotaExhausted) && statusCode === 429 && preserveQuota429) {
        return PROVIDER_ERROR_TYPES.QUOTA_EXHAUSTED;
    }
    // API-key providers route 429 cooldowns through the resilience-aware fallback layer.
    // OAuth providers keep their existing quota semantics because some of them encode
    // longer quota windows as 429 responses.
    if (statusCode === 429) {
        if (preserveQuota429 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isDailyQuotaExhausted"])(bodyStr)) {
            return PROVIDER_ERROR_TYPES.QUOTA_EXHAUSTED;
        }
        return PROVIDER_ERROR_TYPES.RATE_LIMITED;
    }
    // 404 — model or endpoint not found. Without classification the error
    // falls through to `return null`, so no cooldown/lockout is applied and the
    // retry/backoff loop keeps hammering the dead endpoint until the upstream
    // rate-limits it (404 + 429 storm). Classify as MODEL_NOT_FOUND so the model
    // gets locked via the cooldown layer and retries stop. Request-scoped
    // resource errors are excluded because retrying another account/model cannot
    // make an unknown file/item id valid. (#6827)
    if (statusCode === 404) {
        if (isResourceNotFoundResponse(responseBody)) return null;
        return PROVIDER_ERROR_TYPES.MODEL_NOT_FOUND;
    }
    if (statusCode === 401) {
        if (oauthInvalid) {
            return PROVIDER_ERROR_TYPES.OAUTH_INVALID_TOKEN;
        }
        // Some free-tier/aggregator providers return 401 (instead of 404) for a
        // model the account isn't entitled to, with a body like "Model X is not
        // supported". Without this check the error falls through to a generic
        // UNAUTHORIZED classification, which never triggers lockModel() in
        // chatCore.ts — auto-combo keeps re-selecting the same broken model on
        // every request. Detect the phrasing here, same as the 404 branch above
        // always does regardless of body content. (#7268)
        if (containsModelUnavailableMessage(bodyStr)) {
            return PROVIDER_ERROR_TYPES.MODEL_NOT_FOUND;
        }
        return accountDeactivated ? PROVIDER_ERROR_TYPES.ACCOUNT_DEACTIVATED : PROVIDER_ERROR_TYPES.UNAUTHORIZED;
    }
    if (statusCode === 402) return PROVIDER_ERROR_TYPES.QUOTA_EXHAUSTED;
    if (statusCode === 403 && accountDeactivated) {
        return PROVIDER_ERROR_TYPES.ACCOUNT_DEACTIVATED;
    }
    if (statusCode === 403) {
        // Cloud Code / Antigravity (Gemini Code Assist) 403s are almost always a
        // RECOVERABLE project-config issue — the Cloud AI Companion API not enabled
        // on the project ("has not been used in project …", SERVICE_DISABLED,
        // accessNotConfigured), a stale/mismatched project, or PERMISSION_DENIED on
        // the project — NOT an account ban. Real account bans are already caught by
        // isAccountDeactivated above (→ ACCOUNT_DEACTIVATED). Classifying these as
        // PROJECT_ROUTE_ERROR keeps the account active and recoverable once the
        // project/API is fixed, instead of permanently disabling it on a single
        // fixable 403 (which previously required a full OAuth reconnect). (antigravity-403)
        const p = (provider || "").toLowerCase();
        const isCloudCodeProvider = p === "antigravity" || p === "gemini-cli" || p.includes("cloudcode") || p.includes("cloud-code");
        const recoverableProject403 = bodyStr.includes("has not been used in project") || bodyStr.includes("SERVICE_DISABLED") || bodyStr.includes("accessNotConfigured") || bodyStr.includes("PERMISSION_DENIED") || /\bit is disabled\b/i.test(bodyStr) || isCloudCodeProvider;
        if (recoverableProject403) {
            return PROVIDER_ERROR_TYPES.PROJECT_ROUTE_ERROR;
        }
        if (provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "apikey") {
            return null;
        }
        // No-credential ("authType: none") providers — free, stateless per-request
        // token proxies like mimocode/theoldllm — have no real account/credential
        // to revoke. An unrecognized 403 from these is a transient upstream
        // rate-limit/blocklist signal, not an account ban: keep it recoverable so
        // the connection cooldown/retry layer handles it instead of a permanent
        // "banned" state on the first unmatched 403. (#6315, #6345)
        if (provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider)?.authType === "none") {
            return null;
        }
        return PROVIDER_ERROR_TYPES.FORBIDDEN;
    }
    if (statusCode >= 500) return PROVIDER_ERROR_TYPES.SERVER_ERROR;
    if (statusCode === 400) {
        if (isContextOverflow(bodyStr)) {
            return PROVIDER_ERROR_TYPES.CONTEXT_OVERFLOW;
        }
        // Some providers (e.g. Antigravity's Pro-fallback chain, #8136) return a
        // plain 400 for a model that is no longer available, instead of 404/401.
        // Without this check the error falls through to `return null`, so
        // lockModel() never fires and the same dead model gets retried on every
        // request. Detect the phrasing here, same as the 401 branch above (#7268).
        if (containsModelUnavailableMessage(bodyStr)) {
            return PROVIDER_ERROR_TYPES.MODEL_NOT_FOUND;
        }
    }
    return null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_0erlnb7._.js.map