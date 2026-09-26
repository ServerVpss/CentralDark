module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/catalog/openrouterProviderStats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "computeProviderPopularity",
    ()=>computeProviderPopularity,
    "getOpenRouterProviderStats",
    ()=>getOpenRouterProviderStats,
    "initOpenRouterProviderStatsSync",
    ()=>initOpenRouterProviderStatsSync,
    "refreshOpenRouterProviderStats",
    ()=>refreshOpenRouterProviderStats
]);
/**
 * openrouterProviderStats.ts
 *
 * Enriches OmniRoute's provider directory with data scraped from OpenRouter's
 * *internal* frontend API (openrouter.ai/api/frontend/v1/*) — undocumented and
 * unversioned, unlike the public /api/v1/models consumed by openrouterCatalog.ts.
 * Three bulk endpoints, one request each, refreshed once/day — never per-model:
 *
 *   - all-providers      → provider directory (HQ, ToS/privacy, data policy, status page)
 *   - catalog/models      → model→provider endpoint mapping (for attribution)
 *   - rankings/models      → usage volume (tokens/requests) per model+variant
 *
 * catalog/models rows are joined against rankings/models by `permaslug+variant`
 * and the resulting usage is summed per `provider_slug` — that sum is the
 * popularity signal. All three responses can drift or disappear without notice
 * (nothing here is a documented contract), so every row is parsed defensively
 * with zod `.safeParse()` and skipped on failure rather than failing the batch,
 * and the whole refresh falls back to the last good cache on any fetch error
 * (same stale-if-error shape as openrouterCatalog.ts / arenaEloSync.ts).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const ALL_PROVIDERS_URL = "https://openrouter.ai/api/frontend/v1/all-providers";
const CATALOG_MODELS_URL = "https://openrouter.ai/api/frontend/v1/catalog/models";
const RANKINGS_URL = "https://openrouter.ai/api/frontend/v1/rankings/models?view=week";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 15_000;
function getTTL() {
    const env = process.env.OPENROUTER_PROVIDER_STATS_TTL_MS;
    const parsed = env ? parseInt(env, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
}
function getCacheFilePath() {
    const dataDir = process.env.DATA_DIR || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data");
    const cacheDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, "cache");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(cacheDir)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(cacheDir, {
            recursive: true
        });
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(cacheDir, "openrouter-provider-stats.json");
}
// ─── Response shapes (defensive — undocumented API) ─────────────────────────
const DataPolicySchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    training: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    retainsPrompts: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    termsOfServiceURL: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    privacyPolicyURL: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
}).partial().optional();
const ProviderDirectoryRowSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    slug: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    displayName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1).optional(),
    headquarters: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    statusPageUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    byokEnabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    dataPolicy: DataPolicySchema,
    icon: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
    }).partial().optional()
});
const CatalogEndpointRowSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    permaslug: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    endpoint: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        variant: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
        provider_slug: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)
    }).passthrough()
});
const RankingRowSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    model_permaslug: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    variant: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    total_prompt_tokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    total_completion_tokens: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    count: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional()
});
/** Parse an array response body with a zod row schema, skipping rows that fail validation. */ function parseRows(raw, schema) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const row of raw){
        const result = schema.safeParse(row);
        if (result.success) out.push(result.data);
    }
    return out;
}
async function fetchJson(url) {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "OmniRoute/2.0",
            Accept: "application/json"
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!res.ok) {
        throw new Error(`${url} returned ${res.status}: ${res.statusText}`);
    }
    return res.json();
}
function computeProviderPopularity(directoryRows, catalogRows, rankingRows) {
    const usageByKey = new Map();
    for (const row of rankingRows){
        const key = `${row.model_permaslug}::${row.variant ?? "standard"}`;
        const tokens = (row.total_prompt_tokens ?? 0) + (row.total_completion_tokens ?? 0);
        const existing = usageByKey.get(key);
        if (existing) {
            existing.tokens += tokens;
            existing.requests += row.count ?? 0;
        } else {
            usageByKey.set(key, {
                tokens,
                requests: row.count ?? 0
            });
        }
    }
    const bySlug = new Map();
    for (const row of catalogRows){
        const key = `${row.permaslug}::${row.endpoint.variant ?? "standard"}`;
        const usage = usageByKey.get(key);
        const slug = row.endpoint.provider_slug;
        const agg = bySlug.get(slug) ?? {
            modelCount: 0,
            totalTokens: 0,
            totalRequests: 0
        };
        agg.modelCount += 1;
        if (usage) {
            agg.totalTokens += usage.tokens;
            agg.totalRequests += usage.requests;
        }
        bySlug.set(slug, agg);
    }
    const directoryBySlug = new Map(directoryRows.map((row)=>[
            row.slug,
            row
        ]));
    const entries = Array.from(bySlug.entries()).map(([slug, agg])=>{
        const directory = directoryBySlug.get(slug);
        return {
            slug,
            displayName: directory?.displayName || directory?.name || slug,
            headquarters: directory?.headquarters,
            statusPageUrl: directory?.statusPageUrl ?? undefined,
            byokEnabled: directory?.byokEnabled,
            dataPolicy: directory?.dataPolicy,
            iconUrl: directory?.icon?.url,
            modelCount: agg.modelCount,
            totalTokens: agg.totalTokens,
            totalRequests: agg.totalRequests,
            popularityRank: 0
        };
    });
    entries.sort((a, b)=>b.totalTokens - a.totalTokens);
    entries.forEach((entry, index)=>{
        entry.popularityRank = index + 1;
    });
    return entries;
}
async function fetchFromAPI() {
    const [directoryRaw, catalogRaw, rankingRaw] = await Promise.all([
        fetchJson(ALL_PROVIDERS_URL),
        fetchJson(CATALOG_MODELS_URL),
        fetchJson(RANKINGS_URL)
    ]);
    const directoryRows = parseRows(directoryRaw?.data, ProviderDirectoryRowSchema);
    const catalogRows = parseRows(catalogRaw?.data, CatalogEndpointRowSchema);
    const rankingRows = parseRows(rankingRaw?.data, RankingRowSchema);
    return computeProviderPopularity(directoryRows, catalogRows, rankingRows);
}
function readCache() {
    const filePath = getCacheFilePath();
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) return null;
        return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, "utf8"));
    } catch  {
        return null;
    }
}
function writeCache(data) {
    const filePath = getCacheFilePath();
    const cache = {
        fetchedAt: new Date().toISOString(),
        data
    };
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, JSON.stringify(cache, null, 2), "utf8");
    } catch (err) {
        console.warn("[OpenRouterProviderStats] Failed to write cache:", err);
    }
}
async function getOpenRouterProviderStats() {
    const ttl = getTTL();
    const cache = readCache();
    const now = Date.now();
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
        console.warn("[OpenRouterProviderStats] Fetch failed, using stale cache:", err);
        if (cache) {
            return {
                data: cache.data,
                stale: true,
                cachedAt: cache.fetchedAt,
                fromCache: true
            };
        }
        return {
            data: [],
            stale: true,
            cachedAt: null,
            fromCache: false
        };
    }
}
async function refreshOpenRouterProviderStats() {
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
// ─── Periodic sync (mirrors arenaEloSync.ts's startPeriodicSync shape) ──────
let syncTimer = null;
function getEffectiveOpenRouterProviderStatsEnabled() {
    return process.env.OPENROUTER_PROVIDER_STATS_ENABLED !== "false";
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? getTTL();
    console.log(`[OpenRouterProviderStats] Starting periodic sync every ${interval / 1000}s`);
    refreshOpenRouterProviderStats().then((result)=>{
        if (result.ok) {
            console.log(`[OpenRouterProviderStats] Initial sync complete: ${result.data.length} providers`);
        } else {
            console.warn(`[OpenRouterProviderStats] Initial sync failed: ${result.error}`);
        }
    }).catch((err)=>{
        console.warn("[OpenRouterProviderStats] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        refreshOpenRouterProviderStats().catch((err)=>{
            console.warn("[OpenRouterProviderStats] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    syncTimer.unref();
}
function initOpenRouterProviderStatsSync() {
    if (!getEffectiveOpenRouterProviderStatsEnabled()) {
        console.log("[OpenRouterProviderStats] Disabled via OPENROUTER_PROVIDER_STATS_ENABLED=false.");
        return false;
    }
    startPeriodicSync();
    return true;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("zod-dcb22c6336e0bc69");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__14jka4s._.js.map