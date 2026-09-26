module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/catalog/openrouterCatalog.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOpenRouterCatalog",
    ()=>getOpenRouterCatalog,
    "refreshOpenRouterCatalog",
    ()=>refreshOpenRouterCatalog
]);
/**
 * openrouterCatalog.ts — Feature 09
 * Catálogo OpenRouter com cache persistente em arquivo JSON local.
 *
 * - TTL configurável via env OPENROUTER_CATALOG_TTL_MS (default: 24h)
 * - Fallback stale-if-error: retorna último snapshot válido se fetch falhar
 * - Atualização oportunista em background (não bloqueia o caller)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
function getTTL() {
    const env = process.env.OPENROUTER_CATALOG_TTL_MS;
    return env ? parseInt(env, 10) : DEFAULT_TTL_MS;
}
function getCacheFilePath() {
    const dataDir = process.env.DATA_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data");
    const cacheDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, "cache");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(cacheDir)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(cacheDir, {
            recursive: true
        });
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(cacheDir, "openrouter-catalog.json");
}
/** Read cached catalog from disk. Returns null if not found or unparseable. */ function readCache() {
    const filePath = getCacheFilePath();
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) return null;
        const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, "utf8");
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
/** Write catalog to disk cache. */ function writeCache(data) {
    const filePath = getCacheFilePath();
    const cache = {
        fetchedAt: new Date().toISOString(),
        data
    };
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, JSON.stringify(cache, null, 2), "utf8");
    } catch (err) {
        console.warn("[OpenRouterCatalog] Failed to write cache:", err);
    }
}
/** Fetch fresh catalog from OpenRouter API. */ async function fetchFromAPI() {
    const res = await fetch(OPENROUTER_API_URL, {
        headers: {
            "User-Agent": "OmniRoute/2.0",
            Accept: "application/json"
        },
        signal: AbortSignal.timeout(15_000)
    });
    if (!res.ok) {
        throw new Error(`OpenRouter API returned ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    const models = Array.isArray(json.data) ? json.data : [];
    return models;
}
async function getOpenRouterCatalog() {
    const ttl = getTTL();
    const cache = readCache();
    const now = Date.now();
    // Return cached data if still within TTL
    if (cache && cache.fetchedAt) {
        const age = now - new Date(cache.fetchedAt).getTime();
        if (age < ttl) {
            return {
                data: cache.data,
                stale: false,
                cachedAt: cache.fetchedAt,
                fromCache: true
            };
        }
    }
    // Cache expired or missing — attempt fresh fetch
    try {
        const data = await fetchFromAPI();
        writeCache(data);
        return {
            data,
            stale: false,
            cachedAt: null,
            fromCache: false
        };
    } catch (err) {
        console.warn("[OpenRouterCatalog] Fetch failed, using stale cache:", err);
        // Stale-if-error: return old cache if available
        if (cache) {
            return {
                data: cache.data,
                stale: true,
                cachedAt: cache.fetchedAt,
                fromCache: true
            };
        }
        // No cache at all — return empty with error signal
        return {
            data: [],
            stale: true,
            cachedAt: null,
            fromCache: false
        };
    }
}
async function refreshOpenRouterCatalog() {
    try {
        const data = await fetchFromAPI();
        writeCache(data);
        return {
            data,
            ok: true
        };
    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return {
            data: [],
            ok: false,
            error
        };
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1oym6ot._.js.map