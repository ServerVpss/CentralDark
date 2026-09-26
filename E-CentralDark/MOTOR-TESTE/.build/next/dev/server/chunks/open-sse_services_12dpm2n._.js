module.exports = [
"[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/antigravityVersion.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/antigravityHeaders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityVersion.ts [instrumentation] (ecmascript)");
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
function antigravityIdeUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedAntigravityIdeVersion"])()) {
    return `antigravity/ide/${version} ${ANTIGRAVITY_OS_TYPE}/${ANTIGRAVITY_ARCH}`;
}
function antigravityCliUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedAntigravityCliVersion"])(), authMethod = "consumer") {
    return `antigravity/cli/${version} (aidev_client; os_type=${ANTIGRAVITY_OS_TYPE}; arch=${ANTIGRAVITY_ARCH}; auth_method=${authMethod})`;
}
function antigravityIdeNodeUserAgent(version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityVersion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedAntigravityIdeVersion"])()) {
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
"[project]/open-sse/services/notionWebFallbackModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/notionWebModels.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/notionWebFallbackModels.ts [instrumentation] (ecmascript)");
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
function buildNotionFriendlyToCodenameMap(models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"]) {
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
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionWebFallbackModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOTION_WEB_FALLBACK_MODELS"],
        ...extraModels
    ]);
    // Unknown ids pass through as-is so a freshly discovered codename still works
    // before the fallback table is updated.
    return map.get(m) || map.get(m.toLowerCase()) || map.get(slugifyNotionDisplayName(m)) || m;
}
;
}),
"[project]/open-sse/services/promptqlModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/hyperagentModels.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/wildcardRouter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/compression/adaptiveCompression/types.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/modelDeprecation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/ccWireImageBuiltins.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/reasoningCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningCache.ts [instrumentation] (ecmascript)");
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setReasoningCache"])(key, provider, model, reasoning, TTL_MS);
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
        dbResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningCache"])(toolCallId);
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
        dbStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningCacheStats"])();
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningCacheEntries"])(opts);
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearAllReasoningCache"])(provider);
    } catch  {
        return 0;
    }
}
function deleteReasoningCacheEntry(toolCallId) {
    if (!toolCallId) return 0;
    const existedInMemory = memoryCache.delete(toolCallId);
    let deletedFromDb = 0;
    try {
        deletedFromDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteReasoningCache"])(toolCallId);
    } catch  {
    // Memory delete already happened; DB delete can be retried by a later cleanup.
    }
    return deletedFromDb + (existedInMemory && deletedFromDb === 0 ? 1 : 0);
}
function cleanupReasoningCache() {
    purgeExpiredMemory();
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanupExpiredReasoning"])();
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
"[project]/open-sse/services/claudeCodeCCH.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xxhash$2d$wasm$2f$esm$2f$xxhash$2d$wasm$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xxhash-wasm/esm/xxhash-wasm.js [instrumentation] (ecmascript)");
;
const CCH_SEED = 0x6e52736ac806831en;
const CCH_PATTERN = /\bcch=([0-9a-f]{5});/;
let xxhashPromise = null;
let xxhash64Fn = null;
async function ensureXxhash() {
    if (xxhash64Fn) return;
    if (!xxhashPromise) {
        xxhashPromise = (async ()=>{
            const hasher = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xxhash$2d$wasm$2f$esm$2f$xxhash$2d$wasm$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"])();
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
"[project]/open-sse/services/claudeCodeCompatibleBeta.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/claudeCodeExtraRemap.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/claudeCodeToolRemapper.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeExtraRemap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeExtraRemap.ts [instrumentation] (ecmascript)");
;
const TOOL_RENAME_MAP = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeExtraRemap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["EXTRA_TOOL_RENAME_MAP"],
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
"[project]/open-sse/services/claudeCodeConstraints.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/claudeCodeCompatibleThinkingDisplay.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/claudeCodeObfuscation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/ccBridgeTransforms.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [instrumentation] (ecmascript)");
;
;
const CCH_SALT = "59cf53e54c78";
const CCH_POSITIONS = [
    4,
    7,
    20
];
const DEFAULT_CLAUDE_CODE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
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
        buildRevision: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_BUILD_REVISION"]
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
"[project]/open-sse/services/systemTransforms.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccBridgeTransforms.ts [instrumentation] (ecmascript)");
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
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_PARAGRAPH_REMOVAL_ANCHORS"],
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
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_IDENTITY_PREFIXES"],
            ...OPENWEBUI_IDENTITY_PREFIXES,
            ...HERMES_IDENTITY_PREFIXES
        ]
    },
    // Replace the "Here is some useful information about the environment you are
    // running in:" billing-gate trigger phrase + the "if OpenCode honestly"
    // phrase-shape filter (DEFAULT_TEXT_REPLACEMENTS from ccBridgeTransforms.ts).
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_TEXT_REPLACEMENTS"].map((r)=>({
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
    ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_CC_BRIDGE_PIPELINE"]
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
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCcBridgeTransformPipeline"])(body, config);
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
"[project]/open-sse/services/ccOpenAiMediaBlocks.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/model.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/registeredEffortVariants.ts [instrumentation] (ecmascript)");
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
for (const [id, alias] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
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
for (const [aliasOrId, models] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"])){
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
        if (next in __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"]) return next;
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
    const providerAlias = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][providerId] || providerId;
    const models = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerAlias] || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_MODELS"][providerId] || [];
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
        const { getCachedProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const conns = await getCachedProviderConnections();
        const providers = conns.map(getProviderIdFromConnection).filter((provider)=>Boolean(provider));
        return new Set(providers);
    } catch  {
        return null;
    }
}
async function getActiveSyncedProvidersForModel(modelId) {
    try {
        const { getActiveProvidersWithSyncedModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const providers = await getActiveProvidersWithSyncedModel(modelId);
        return providers.map(resolveProviderAlias).filter((provider)=>typeof provider === "string");
    } catch  {
        return [];
    }
}
async function reconcileInferredProvidersWithActiveCatalog(providerIds, modelId) {
    const uniqueProviders = Array.from(new Set(providerIds));
    try {
        const { reconcileProvidersWithActiveSyncedCatalog } = await __turbopack_context__.A("[project]/src/lib/db/models/activeSyncedCatalog.ts [instrumentation] (ecmascript, async loader)");
        const reconciliations = await Promise.all(uniqueProviders.map(async (provider)=>{
            const effortBaseModelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$registeredEffortVariants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRegisteredProviderEffortBaseModelId"])(provider, modelId);
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
        const { getCachedSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
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
        const aliasesForHint = candidatesToUse.map((p)=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"][p] || p);
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
        const wildcardMatch = parsed.model ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveWildcardAlias"])(parsed.model, aliasEntries) : null;
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
"[project]/open-sse/services/learnedThinkingCaps.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/jsonSize.ts [instrumentation] (ecmascript)");
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
    return Math.ceil((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$jsonSize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["jsonLength"])(node) / CHARS_PER_TOKEN) + imageTokens;
}
function getTokenLimit(provider, model = null) {
    return resolveTokenLimit(provider, model).limit;
}
function getComboTargetTokenLimit(options) {
    let parsedProvider = options.parsedProvider;
    let parsedModel = options.parsedModel;
    if ((parsedProvider === undefined || parsedModel === undefined) && Object.prototype.hasOwnProperty.call(options, "modelStr")) {
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseModel"])(options.modelStr);
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
        const dbLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelContextLimit"])(provider, model);
        if (dbLimit && dbLimit > 0) return {
            limit: dbLimit,
            specific: true
        };
    }
    // 3. Check registry for provider default
    const registryEntry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"][provider];
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
"[project]/open-sse/services/claudeCodeFingerprint.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/runtimeTimeouts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/claudeCodeCompatibleIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/claudeHelper.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCCH.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleBeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatibleBeta.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeConstraints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleThinkingDisplay$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatibleThinkingDisplay.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeObfuscation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccOpenAiMediaBlocks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccOpenAiMediaBlocks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeFingerprint$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeFingerprint.ts [instrumentation] (ecmascript)");
// Legacy (deprecated, kept for transitional API consumers).
// The base executor is still used internally by systemTransforms.ts;
// these exports let downstream code reference the building blocks directly
// while we migrate UI + settings to the v2 shape.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccBridgeTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccBridgeTransforms.ts [instrumentation] (ecmascript)");
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
const CLAUDE_CODE_COMPATIBLE_ANTHROPIC_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTHROPIC_VERSION_HEADER"];
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
const CLAUDE_CODE_COMPATIBLE_STAINLESS_TIMEOUT_SECONDS = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$runtimeTimeouts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getStainlessTimeoutSeconds"])(process.env);
function supportsClaudeXHighEffort(model) {
    return typeof model === "string" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsXHighEffort"])("claude", model);
}
function isClaudeCodeCompatibleProvider(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX) || // Built-in providers (e.g. agentrouter) that adopt the dynamic CC wire image
    // while keeping their own registry baseUrl + auth (#6056).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider);
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
        "anthropic-beta": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleBeta$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveClaudeCodeCompatibleAnthropicBeta"])({
            redactThinking: options.redactThinking === true
        }),
        "anthropic-dangerous-direct-browser-access": "true",
        "x-app": "cli",
        "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_COMPATIBLE_USER_AGENT"],
        "X-Stainless-Retry-Count": "0",
        "X-Stainless-Timeout": String(CLAUDE_CODE_COMPATIBLE_STAINLESS_TIMEOUT_SECONDS),
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_COMPATIBLE_STAINLESS_PACKAGE_VERSION"],
        "X-Stainless-OS": "MacOS",
        "X-Stainless-Arch": "arm64",
        "X-Stainless-Runtime": "node",
        "X-Stainless-Runtime-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_COMPATIBLE_STAINLESS_RUNTIME_VERSION"],
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["remapToolNamesInRequest"])(body);
    // Step 3-4: Thinking constraints
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceThinkingTemperature"])(body);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["disableThinkingIfToolChoiceForced"])(body);
    // Step 5: Cache control
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceCacheControlLimit"])(body);
    // Step 5b: Config-driven system transforms (issue #2260, v2)
    // Normalizes system blocks to classifier-correct structure regardless of
    // source client (OpenCode, Cline, Cursor, Continue, Open WebUI, raw API).
    // Routed via the generic per-provider DSL so the same pipeline shape covers
    // the CC bridge, the native `claude` path, and any other configured
    // provider. Idempotent on re-run.
    {
        const transformResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applySystemTransformPipeline"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CC_BRIDGE"], body);
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
            const fixed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])(b.messages);
            const adjacent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolAdjacency"])(fixed);
            // fixToolAdjacency can leave orphan tool_result blocks behind when it
            // strips a tool_use whose tool_result wasn't in the next message.
            // Re-pair to drop those orphans (discussion #2410).
            const cleaned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])(adjacent);
            b.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingAssistantOrphanToolUse"])(cleaned);
        }
    }
    // Step 6: Obfuscation (optional, per-provider setting)
    if (enableObfuscation) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["obfuscateInBody"])(body);
    }
    // Step 7: Serialize with CCH placeholder (strip internal sentinel fields)
    delete body["_claudeCodeRequiresLowercaseToolNames"];
    const serialized = JSON.stringify(body);
    // Step 8: Sign with xxHash64
    const bodyString = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(serialized);
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsClaudeMaxEffort"])(model) ? "max" : "high";
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
    const media = role === "user" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccOpenAiMediaBlocks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collectClaudeMediaBlocks"])(message?.content) : [];
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
    const prepared = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["prepareClaudeRequest"])({
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccOpenAiMediaBlocks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertOpenAiMediaBlock"])(record) ?? record;
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleThinkingDisplay$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyClaudeCodeCompatibleThinkingDisplay"])(thinking, {
            normalizedBody,
            summarizeThinking
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatibleThinkingDisplay$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyClaudeCodeCompatibleThinkingDisplay"])({
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
"[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/alternateFormats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clineAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [instrumentation] (ecmascript)");
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider);
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
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].openai,
            format: apiType === "responses" ? "openai-responses" : "openai",
            baseUrl: OPENAI_COMPATIBLE_DEFAULTS.baseUrl
        };
    }
    if (isAnthropicCompatible(provider)) {
        return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].anthropic,
            format: "claude",
            baseUrl: ANTHROPIC_COMPATIBLE_DEFAULTS.baseUrl
        };
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider] || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].openai;
}
function getProviderFallbackCount(provider) {
    const config = getProviderConfig(provider);
    return config.baseUrls?.length || 1;
}
function buildProviderUrl(provider, model, stream = true, options = {}) {
    // Built-in CC-wire-image providers (e.g. agentrouter): keep the registry's
    // OWN baseUrl (NOT the CC family's anthropic default) but adopt the CC chat
    // path so the request still targets `<registry-baseUrl>?beta=true` (#6056).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider)) {
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
        const config = getProviderConfig(provider);
        const baseUrl = options?.baseUrl || entry?.baseUrl || config.baseUrl;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH"]);
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
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH"]);
        }
        return buildAnthropicCompatibleUrl(baseUrl);
    }
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
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
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    const headers = {
        "Content-Type": "application/json",
        ...config.headers
    };
    // Add auth header
    // Specific override for Anthropic Compatible
    if (isClaudeCodeCompatible(provider)) {
        const token = credentials.apiKey || credentials.accessToken || "";
        const ccRequestDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClaudeCodeCompatibleRequestDefaults"])(credentials?.providerSpecificData);
        const ccHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleHeaders"])(token, stream, credentials?.providerSpecificData?.ccSessionId, {
            redactThinking: ccRequestDefaults.redactThinking === true
        });
        // Built-in CC-wire-image providers (e.g. agentrouter): adopt the CC wire
        // image headers but keep the registry's OWN auth scheme (e.g. x-api-key)
        // instead of the CC family's Bearer auth (#6056).
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider)) {
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
        Object.assign(headers, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClineHeaders"])(credentials.apiKey || credentials.accessToken));
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
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    if (entry) {
        // Per-connection override (providerSpecificData.targetFormat), only valid
        // when it matches an alternate declared by the provider.
        const alternate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlternateFormat"])(entry, providerSpecificData);
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
"[project]/open-sse/services/proxyAutoSelector.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearProxySelectionCache",
    ()=>clearProxySelectionCache,
    "selectProxyForValidation",
    ()=>selectProxyForValidation
]);
/**
 * proxyAutoSelector.ts — Validation-layer proxy auto-selection service
 *
 * Wraps the low-level proxy fallback engine for use in the provider validation
 * pipeline. When a direct validation request fails with a connectivity error,
 * this service finds a working proxy and lets the caller retry with it.
 *
 * Proxies are discovered and returned for the current request only — they are
 * NOT persisted to the proxy registry. Short-term caching (5-minute TTL) is
 * handled by the in-memory cache in proxyFallback.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFallback.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function selectProxyForValidation(targetUrl) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PROXY_AUTO_SELECT_ENABLED")) return null;
    if (!targetUrl) return null;
    let hostname;
    try {
        hostname = new URL(targetUrl).hostname;
        if (!hostname) return null;
    } catch  {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findWorkingProxy"])(hostname, targetUrl);
}
function clearProxySelectionCache() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearProxyFallbackCache"])();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/gigachatAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGigachatAccessToken",
    ()=>getGigachatAccessToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const DEFAULT_GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const DEFAULT_GIGACHAT_SCOPE = "GIGACHAT_API_PERS";
const CACHE_SKEW_MS = 60_000;
const tokenCache = new Map();
const inflightRequests = new Map();
function getCacheKey(credentials, authUrl, scope) {
    return `${authUrl}::${scope}::${credentials}`;
}
function isFreshToken(token) {
    if (!token?.accessToken || !token?.expiresAt) return false;
    const expiresAtMs = new Date(token.expiresAt).getTime();
    return Number.isFinite(expiresAtMs) && expiresAtMs - Date.now() > CACHE_SKEW_MS;
}
function normalizeExpiry(rawExpiry) {
    if (typeof rawExpiry === "number" && Number.isFinite(rawExpiry)) {
        return new Date(rawExpiry).toISOString();
    }
    if (typeof rawExpiry === "string" && rawExpiry.trim().length > 0) {
        const numericValue = Number(rawExpiry);
        if (Number.isFinite(numericValue)) {
            return new Date(numericValue).toISOString();
        }
        const dateMs = Date.parse(rawExpiry);
        if (Number.isFinite(dateMs)) {
            return new Date(dateMs).toISOString();
        }
    }
    return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}
async function getGigachatAccessToken(options = {}) {
    const credentials = (options.credentials || "").trim();
    if (!credentials) {
        throw new Error("Missing GigaChat credentials");
    }
    const authUrl = (options.authUrl || DEFAULT_GIGACHAT_AUTH_URL).trim();
    const scope = (options.scope || DEFAULT_GIGACHAT_SCOPE).trim();
    const cacheKey = getCacheKey(credentials, authUrl, scope);
    const cached = tokenCache.get(cacheKey);
    if (isFreshToken(cached)) {
        return cached;
    }
    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
        return inflight;
    }
    const requestPromise = (async ()=>{
        const response = await fetch(authUrl, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                RqUID: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                scope
            }).toString(),
            signal: options.signal
        });
        if (!response.ok) {
            const bodyText = await response.text();
            throw new Error(`GigaChat token request failed: ${response.status} ${bodyText}`.trim());
        }
        const data = await response.json();
        const accessToken = typeof data.tok === "string" ? data.tok : typeof data.access_token === "string" ? data.access_token : "";
        if (!accessToken) {
            throw new Error("GigaChat token response missing access token");
        }
        const token = {
            accessToken,
            expiresAt: normalizeExpiry(data.exp ?? data.expires_at)
        };
        tokenCache.set(cacheKey, token);
        return token;
    })();
    inflightRequests.set(cacheKey, requestPromise);
    try {
        return await requestPromise;
    } finally{
        inflightRequests.delete(cacheKey);
    }
}
}),
"[project]/open-sse/services/bedrock.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BedrockNativeApiError",
    ()=>BedrockNativeApiError,
    "buildBedrockNativeHeaders",
    ()=>buildBedrockNativeHeaders,
    "discoverBedrockNativeModels",
    ()=>discoverBedrockNativeModels,
    "isBedrockNativeApiError",
    ()=>isBedrockNativeApiError,
    "isBedrockNativeAuthError",
    ()=>isBedrockNativeAuthError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/bedrock.ts [instrumentation] (ecmascript)");
;
class BedrockNativeApiError extends Error {
    status;
    url;
    body;
    constructor(message, options){
        super(message);
        this.name = "BedrockNativeApiError";
        this.status = typeof options.status === "number" ? options.status : null;
        this.url = options.url;
        this.body = options.body ?? null;
    }
}
function isBedrockNativeApiError(error) {
    return error instanceof BedrockNativeApiError;
}
function isBedrockNativeAuthError(error) {
    return isBedrockNativeApiError(error) && (error.status === 401 || error.status === 403);
}
function buildBedrockNativeHeaders(apiKey, extraHeaders = {}) {
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...apiKey ? {
            Authorization: "Bearer " + apiKey
        } : {},
        ...extraHeaders
    };
}
async function readJsonOrText(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch  {
        return text;
    }
}
function getErrorMessage(body, fallback) {
    if (body && typeof body === "object") {
        const record = body;
        const message = record.message || record.Message || record.error || record.errorMessage;
        if (typeof message === "string" && message.trim()) return message.trim();
    }
    if (typeof body === "string" && body.trim()) return body.trim();
    return fallback;
}
async function fetchBedrockJson(fetcher, url, apiKey, init = {}) {
    const headers = buildBedrockNativeHeaders(apiKey, {
        ...init.headers || {}
    });
    const response = await fetcher(url, {
        ...init,
        method: init.method || "GET",
        headers
    });
    const body = await readJsonOrText(response);
    if (!response.ok) {
        throw new BedrockNativeApiError(getErrorMessage(body, "Bedrock API request failed with " + response.status), {
            status: response.status,
            url,
            body
        });
    }
    return body;
}
async function fetchInferenceProfiles(fetcher, region, apiKey) {
    const summaries = [];
    let nextToken = null;
    do {
        const data = await fetchBedrockJson(fetcher, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBedrockNativeInferenceProfilesUrl"])(region, {
            nextToken
        }), apiKey);
        const record = data && typeof data === "object" ? data : {};
        const pageSummaries = Array.isArray(record.inferenceProfileSummaries) ? record.inferenceProfileSummaries : [];
        summaries.push(...pageSummaries);
        nextToken = typeof record.nextToken === "string" && record.nextToken ? record.nextToken : null;
    }while (nextToken)
    return {
        inferenceProfileSummaries: summaries
    };
}
async function discoverBedrockNativeModels({ apiKey, providerSpecificData, fetcher = fetch }) {
    const region = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBedrockRegion"])(providerSpecificData);
    const foundationModelsResponse = await fetchBedrockJson(fetcher, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBedrockNativeModelsUrl"])(region), apiKey);
    let inferenceProfilesResponse = {
        inferenceProfileSummaries: []
    };
    const warnings = [];
    try {
        inferenceProfilesResponse = await fetchInferenceProfiles(fetcher, region, apiKey);
    } catch (error) {
        if (isBedrockNativeAuthError(error)) {
            throw error;
        }
        const message = error instanceof Error ? error.message : String(error || "unknown error");
        warnings.push("Bedrock inference profiles unavailable: " + message);
    }
    return {
        region,
        foundationModelsResponse,
        inferenceProfilesResponse,
        models: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBedrockDiscoveredModels"])(foundationModelsResponse, inferenceProfilesResponse),
        warnings
    };
}
}),
"[project]/open-sse/services/qoderCliResolve.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntime.ts [instrumentation] (ecmascript)");
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
    const getStatus = deps.getStatus || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCliRuntimeStatus"];
    const shouldUseShell = deps.shouldUseShell || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldUseShellForCommand"];
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
        const candidates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKnownToolPaths"])("qoder");
        if (candidates.length > 0) {
            searchedHint = ` Searched: ${candidates.slice(0, 6).join(", ")}.`;
        }
    } catch  {
    /* best-effort — the path list is only advisory for the error message */ }
    return `Qoder CLI (qodercli) was not found on the OmniRoute host (${runError}).` + searchedHint + " Install it from https://qoder.com, or set CLI_QODER_BIN to the absolute path " + "of the qodercli binary (e.g. %APPDATA%\\npm\\qodercli.cmd on Windows). " + "PAT auth is driven through the local qodercli binary.";
}
}),
"[project]/open-sse/services/qoderCli.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntime.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qoder$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/qoder/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCliResolve$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/qoderCliResolve.ts [instrumentation] (ecmascript)");
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
const QODER_STATIC_MODELS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$qoder$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["qoderProvider"].models.map(({ id, name })=>({
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
    const { command, useShell } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCliResolve$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveQoderCliInvocation"])(options.command);
    const env = {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLookupEnv"])()
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
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCliResolve$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildQoderCliNotFoundHint"])(run.error),
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
"[project]/open-sse/services/kiroExternalIdp.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/refreshSerializer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/tokenRefresh/rotationMap.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/tokenRefresh/casGuard.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [instrumentation] (ecmascript)");
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wasRefreshTokenRotated"])(guard.expectedRefreshToken, current)) {
        casGuardStats.skipped++;
        log?.warn?.("TOKEN_REFRESH", "CAS guard: skipping persist — a concurrent writer already rotated the refresh_token (#4038)");
        return true;
    }
    casGuardStats.persisted++;
    return false;
}
}),
"[project]/open-sse/services/tokenRefresh/circuitBreaker.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
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
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(result)) {
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
"[project]/open-sse/services/tokenRefresh/providers/windsurf.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshWindsurfToken",
    ()=>refreshWindsurfToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/constants/oauth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    const firebaseApiKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WINDSURF_CONFIG"].firebaseApiKey || "";
    if (!firebaseApiKey) {
        log?.warn?.("TOKEN_REFRESH", "Windsurf Firebase API key unavailable — skipping Firebase token refresh");
        return null;
    }
    const tokenUrl = `https://securetoken.googleapis.com/v1/token?key=${firebaseApiKey}`;
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
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
"[project]/open-sse/services/tokenRefresh/providers/codebuddyCn.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshCodebuddyCnToken",
    ()=>refreshCodebuddyCnToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function refreshCodebuddyCnToken(refreshToken, log, proxyConfig = null) {
    if (!refreshToken) return null;
    const { CODEBUDDY_CN_CONFIG } = await __turbopack_context__.A("[project]/src/lib/oauth/constants/oauth.ts [instrumentation] (ecmascript, async loader)");
    const oauth = CODEBUDDY_CN_CONFIG;
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(oauth.refreshUrl, {
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
"[project]/open-sse/services/tokenRefresh/providers/cline.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshClineToken",
    ()=>refreshClineToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshClineToken(refreshToken, log, proxyConfig = null) {
    const endpoint = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].cline?.refreshUrl;
    if (!endpoint) {
        log?.warn?.("TOKEN_REFRESH", "No refresh URL configured for Cline");
        return null;
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
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
            const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
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
"[project]/open-sse/services/tokenRefresh/providers/kimiCoding.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/runtime.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kimiDevice$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kimiDevice.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function refreshKimiCodingToken(refreshToken, providerSpecificData, log, proxyConfig = null) {
    const endpoint = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["kimi-coding"]?.refreshUrl || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["kimi-coding"]?.tokenUrl;
    if (!endpoint) {
        log?.warn?.("TOKEN_REFRESH", "No refresh URL configured for Kimi Coding");
        return null;
    }
    // Prefer stable device_id persisted at login time; fall back to a
    // deterministic hash of the refresh token so it is at least consistent
    // across refreshes for the same session.
    const stableDeviceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeKimiDeviceId"])(providerSpecificData?.deviceId) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeKimiDeviceId"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["pbkdf2Sync"])(refreshToken, "kimi-device-id", 1000, 16, "sha256").toString("hex"));
    const osRelease = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["release"])();
    const persistedDeviceModel = typeof providerSpecificData?.deviceModel === "string" ? providerSpecificData.deviceModel.trim() : "";
    const deviceModel = persistedDeviceModel || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kimiDevice$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKimiDeviceModel"])();
    try {
        const params = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["kimi-coding"]?.clientId || ""
        });
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildKimiCodeIdentityHeaders"])({
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
"[project]/open-sse/services/tokenRefresh/providers/gitlabDuo.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGitLabDuoToken",
    ()=>refreshGitLabDuoToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function refreshGitLabDuoToken(refreshToken, providerSpecificData, log, proxyConfig = null) {
    if (!refreshToken) {
        log?.warn?.("TOKEN_REFRESH", "No refresh token for GitLab Duo");
        return null;
    }
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveGitLabOAuthBaseUrl"])(providerSpecificData);
    const endpoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])(baseUrl);
    const tokenUrl = endpoints.tokenUrl;
    // client_id from providerSpecificData (stored at login) or fall back to PROVIDERS config
    const clientId = providerSpecificData?.clientId || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"]["gitlab-duo"]?.clientId || process.env.GITLAB_DUO_OAUTH_CLIENT_ID || process.env.GITLAB_OAUTH_CLIENT_ID || "";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
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
"[project]/open-sse/services/tokenRefresh/providers/claudeOAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshClaudeOAuthToken",
    ()=>refreshClaudeOAuthToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshClaudeOAuthToken(refreshToken, log, proxyConfig = null) {
    try {
        // Standard OAuth2 token refresh uses form-urlencoded (not JSON)
        const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].claude.clientId
        });
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].anthropic.token, {
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
            const { rawText, code } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readRefreshErrorBody"])(response);
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
"[project]/open-sse/services/tokenRefresh/providers/google.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGoogleToken",
    ()=>refreshGoogleToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshGoogleToken(refreshToken, clientId, clientSecret, log, proxyConfig = null) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].google.token, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
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
"[project]/open-sse/services/codeAssistSubscription.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/antigravityProjectBootstrap.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codeAssistSubscription.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [instrumentation] (ecmascript)");
;
;
;
const LOAD_CODE_ASSIST_PATH = "/v1internal:loadCodeAssist";
const BOOTSTRAP_TIMEOUT_MS = 8_000;
const ONBOARD_TIMEOUT_MS = 15_000;
const DEFAULT_TIER_ID = "legacy-tier";
function getAntigravityLoadCodeAssistUrls() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"].map((base)=>`${base}${LOAD_CODE_ASSIST_PATH}`);
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
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken);
    for(let i = 0; i < urls.length; i++){
        const url = urls[i];
        if (signal?.aborted) throw signal.reason;
        try {
            const timeoutSignal = AbortSignal.timeout(BOOTSTRAP_TIMEOUT_MS);
            const response = await fetchImpl(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityLoadCodeAssistMetadata"])()
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
            const tierId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractCodeAssistOnboardTierId"])(data) || DEFAULT_TIER_ID;
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
    const urls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityOnboardUrls"])();
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken);
    for (const url of urls){
        if (signal?.aborted) throw signal.reason;
        try {
            const timeoutSignal = AbortSignal.timeout(ONBOARD_TIMEOUT_MS);
            const response = await fetchImpl(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    tier_id: tierId,
                    metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityLoadCodeAssistMetadata"])()
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
"[project]/open-sse/services/antigravityProjectPersist.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function persistDiscoveredAntigravityProjectId(connectionId, discoveredProjectId, existingProviderSpecificData) {
    if (!connectionId || !discoveredProjectId) return;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
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
"[project]/open-sse/services/tokenRefresh/providers/codex.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshCodexToken",
    ()=>refreshCodexToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshCodexToken(refreshToken, log, proxyConfig = null) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].openai.token, {
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
                body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
                    grant_type: "refresh_token",
                    refresh_token: refreshToken,
                    client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].codex.clientId
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
"[project]/open-sse/services/tokenRefresh/providers/kiro.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshKiroToken",
    ()=>refreshKiroToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/kiroExternalIdp.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isExternalIdpAuthMethod"])(authMethod)) {
            let refreshRequest;
            try {
                refreshRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildExternalIdpRefreshParams"])(refreshToken, providerSpecificData);
            } catch (cfgErr) {
                log?.error?.("TOKEN_REFRESH", `Invalid Kiro external_idp refresh config: ${cfgErr instanceof Error ? cfgErr.message : String(cfgErr)}`);
                return null;
            }
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(refreshRequest.tokenEndpoint, {
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
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
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
                    const regRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(regEndpoint, {
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
                        const retryRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(endpoint, {
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
        const tokenUrl = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].kiro.tokenUrl;
        if (!tokenUrl) {
            log?.error?.("TOKEN_REFRESH", "Missing Kiro token endpoint");
            return null;
        }
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
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
"[project]/open-sse/services/tokenRefresh/providers/qoder.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshQoderToken",
    ()=>refreshQoderToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshQoderToken(refreshToken, log, proxyConfig = null) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].qoder.token || !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientId || !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientSecret) {
        log?.warn?.("TOKEN_REFRESH", "Qoder OAuth refresh skipped: browser OAuth is not configured in this environment");
        return null;
    }
    const basicAuth = btoa(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientId}:${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientSecret}`);
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].qoder.token, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                Authorization: `Basic ${basicAuth}`
            },
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientId,
                client_secret: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].qoder.clientSecret
            })
        }));
    if (!response.ok) {
        const errorText = await response.text();
        log?.error?.("TOKEN_REFRESH", "Failed to refresh Qoder token", {
            status: response.status,
            error: errorText
        });
        const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
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
"[project]/open-sse/services/tokenRefresh/providers/github.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshGitHubToken",
    ()=>refreshGitHubToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function refreshGitHubToken(refreshToken, log, proxyConfig = null) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_ENDPOINTS"].github.token, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFormParams"])({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].github.clientId,
                client_secret: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].github.clientSecret
            })
        }));
    if (!response.ok) {
        const errorText = await response.text();
        log?.error?.("TOKEN_REFRESH", "Failed to refresh GitHub token", {
            status: response.status,
            error: errorText
        });
        const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
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
"[project]/open-sse/services/tokenRefresh/providers/copilot.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "refreshCopilotToken",
    ()=>refreshCopilotToken
]);
// @ts-nocheck
// Extracted from open-sse/services/tokenRefresh.ts — see ../shared.ts for
// provenance notes (ported idea from KooshaPari's PR #7338, redone on tip).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function refreshCopilotToken(githubAccessToken, log, proxyConfig = null, baseUrl = "https://api.github.com") {
    try {
        const tokenUrl = `${baseUrl.replace(/\/+$/, "")}/copilot_internal/v2/token`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(tokenUrl, {
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getGitHubCopilotRefreshHeaders"])(`token ${githubAccessToken}`)
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
"[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/rotationMap.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/casGuard.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/windsurf.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/codebuddyCn.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/cline.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/kimiCoding.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/gitlabDuo.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/claudeOAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/google.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityProjectBootstrap.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityProjectPersist.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/codex.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/kiro.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/qoder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/github.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/providers/copilot.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$copilot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider];
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
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, ()=>fetch(refreshEndpoint, {
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
            const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractOAuthErrorCode"])(errorText);
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
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$google$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshGoogleToken"])(credentials.refreshToken, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider].clientId, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider].clientSecret, log, proxyConfig);
                // Google One AI accounts get no projectId at OAuth exchange time.
                // Recover it via loadCodeAssist so downstream routing works.
                if (result?.accessToken && (provider === "antigravity" || provider === "agy") && !(credentials.projectId || credentials.providerSpecificData?.projectId)) {
                    try {
                        const discovered = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectBootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureAntigravityProjectAssigned"])(result.accessToken, fetch);
                        if (discovered) {
                            result.projectId = discovered;
                            result.providerSpecificData = {
                                ...credentials.providerSpecificData || {},
                                ...result.providerSpecificData || {},
                                projectId: discovered
                            };
                            if (credentials.connectionId) {
                                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityProjectPersist$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["persistDiscoveredAntigravityProjectId"])(credentials.connectionId, discovered, credentials.providerSpecificData);
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
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$claudeOAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshClaudeOAuthToken"])(credentials.refreshToken, log, proxyConfig);
        case "codex":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codex$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCodexToken"])(credentials.refreshToken, log, proxyConfig);
        case "qoder":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$qoder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshQoderToken"])(credentials.refreshToken, log, proxyConfig);
        case "github":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$github$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshGitHubToken"])(credentials.refreshToken, log, proxyConfig);
        case "kiro":
        case "amazon-q":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshKiroToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "cline":
        case "clinepass":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$cline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshClineToken"])(credentials.refreshToken, log, proxyConfig);
        case "kimi-coding":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$kimiCoding$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshKimiCodingToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "gitlab-duo":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$gitlabDuo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshGitLabDuoToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "windsurf":
        case "devin-cli":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$windsurf$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshWindsurfToken"])(credentials.refreshToken, credentials.providerSpecificData, log, proxyConfig);
        case "codebuddy-cn":
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$providers$2f$codebuddyCn$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["refreshCodebuddyCnToken"])(credentials.refreshToken, log, proxyConfig);
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
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider];
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
                if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["casGuardShouldSkipPersist"])(log)) {
                    return result;
                }
                try {
                    await effectiveOnPersist(result);
                } catch (persistErr) {
                    const { sanitizeErrorMessage } = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript, async loader)");
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
    const cacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRefreshCacheKey"])(provider, credentials.refreshToken);
    if (refreshPromiseCache.has(cacheKey)) {
        log?.info?.("TOKEN_REFRESH", `Reusing in-flight refresh for ${provider}`);
        return refreshPromiseCache.get(cacheKey);
    }
    // Layer 2 has no per-connection mutex, so callers that pass an onPersist
    // callback expect it to fire after a successful refresh. Without this hook
    // the legacy `connectionId`-less path would silently swallow the callback,
    // leaving DB rows out of sync with rotated tokens (Codex/OpenAI). We still
    // resolve the promise to all waiters with the refreshed credentials.
    const refreshPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeRefresh"])(provider, ()=>_getAccessTokenInternal(provider, credentials, log, proxyConfig)).then(async (result)=>{
        if (result?.accessToken && effectiveOnPersist) {
            // #4038: same compare-and-swap guard as Layer 1 — skip the persist if a concurrent
            // writer already rotated this row past the refresh_token we presented.
            if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$casGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["casGuardShouldSkipPersist"])(log)) {
                return result;
            }
            try {
                await effectiveOnPersist(result);
            } catch (persistErr) {
                const { sanitizeErrorMessage } = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript, async loader)");
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
    const rotated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lookupRotation"])(provider, credentials.refreshToken);
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
            const { getProviderConnectionById } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
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
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeRefresh"])(provider, ()=>_getAccessTokenInternal(provider, credentials, log, proxyConfig));
    // Record the rotation so subsequent stale callers can be redirected to the
    // new tokens without re-hitting upstream (which would trigger Auth0 family
    // revocation). Only records when the refresh actually rotated the token.
    if (result && typeof result === "object" && !("error" in result) && result.accessToken && result.refreshToken) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$rotationMap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordRotation"])(provider, oldRefreshToken, result);
    }
    return result;
}
const refreshTokenByProvider = getAccessToken;
function formatProviderCredentials(provider, credentials, log) {
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"][provider];
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
];

//# sourceMappingURL=open-sse_services_12dpm2n._.js.map