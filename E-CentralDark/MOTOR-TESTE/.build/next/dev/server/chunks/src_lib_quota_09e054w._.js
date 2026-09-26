module.exports = [
"[project]/src/lib/quota/dimensions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PolicySchema",
    ()=>PolicySchema,
    "PoolAllocationSchema",
    ()=>PoolAllocationSchema,
    "ProviderPlanSchema",
    ()=>ProviderPlanSchema,
    "QuotaDimensionSchema",
    ()=>QuotaDimensionSchema,
    "QuotaPoolSchema",
    ()=>QuotaPoolSchema,
    "QuotaUnitSchema",
    ()=>QuotaUnitSchema,
    "QuotaWindowSchema",
    ()=>QuotaWindowSchema,
    "WINDOW_MS",
    ()=>WINDOW_MS,
    "dimensionKeyToString",
    ()=>dimensionKeyToString
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const QuotaUnitSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
    "percent",
    "requests",
    "tokens",
    "usd"
]);
const QuotaWindowSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
    "5h",
    "hourly",
    "daily",
    "weekly",
    "monthly"
]);
const PolicySchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
    "hard",
    "soft",
    "burst"
]);
const QuotaDimensionSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    unit: QuotaUnitSchema,
    window: QuotaWindowSchema,
    limit: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().positive()
});
const PoolAllocationSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    apiKeyId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).max(100),
    capValue: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().positive().optional(),
    capUnit: QuotaUnitSchema.optional(),
    policy: PolicySchema
});
const ProviderPlanSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    connectionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    dimensions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(QuotaDimensionSchema).min(1),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "auto",
        "manual"
    ])
});
const QuotaPoolSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    connectionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    createdAt: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    allocations: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(PoolAllocationSchema).default([])
});
const WINDOW_MS = {
    hourly: 60 * 60 * 1000,
    "5h": 5 * 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000
};
function dimensionKeyToString(k) {
    return `${k.poolId}:${k.unit}:${k.window}`;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/quota/burnRate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeBurnRate",
    ()=>computeBurnRate,
    "computeBurnRateFromWindow",
    ()=>computeBurnRateFromWindow
]);
/**
 * burnRate.ts — Burn-rate EMA estimator for quota consumption.
 *
 * Computes an exponential moving average (alpha=0.3) over a series of
 * (timestamp, consumed) samples and projects time to exhaustion.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ const EMA_ALPHA = 0.3;
function computeBurnRateFromWindow(consumedTotal, windowMs, remaining) {
    if (consumedTotal <= 0 || windowMs <= 0) {
        return {
            tokensPerSecond: 0,
            timeToExhaustionMs: null
        };
    }
    const nowMs = Date.now();
    const currentBucketIndex = Math.floor(nowMs / windowMs);
    const windowStartMs = currentBucketIndex * windowMs;
    const elapsedMs = Math.max(1, nowMs - windowStartMs); // avoid division by zero
    const safeRate = consumedTotal / (elapsedMs / 1000); // per second
    const timeToExhaustionMs = safeRate > 0 && remaining !== undefined && remaining >= 0 ? remaining / safeRate * 1000 : null;
    return {
        tokensPerSecond: safeRate,
        timeToExhaustionMs
    };
}
function computeBurnRate(history, remaining) {
    if (history.length < 2) {
        return {
            tokensPerSecond: 0,
            timeToExhaustionMs: null
        };
    }
    // Build EMA over consecutive deltas.
    let emaRate = 0;
    let initialized = false;
    for(let i = 1; i < history.length; i++){
        const deltaConsumed = history[i].consumed - history[i - 1].consumed;
        const deltaTs = history[i].ts - history[i - 1].ts; // ms
        if (deltaTs <= 0) continue; // skip duplicate or out-of-order timestamps
        const instantRate = deltaConsumed / (deltaTs / 1000); // per second
        if (!initialized) {
            emaRate = instantRate;
            initialized = true;
        } else {
            emaRate = EMA_ALPHA * instantRate + (1 - EMA_ALPHA) * emaRate;
        }
    }
    if (!initialized) {
        return {
            tokensPerSecond: 0,
            timeToExhaustionMs: null
        };
    }
    const safeRate = Math.max(0, emaRate);
    const timeToExhaustionMs = safeRate > 0 && remaining !== undefined && remaining >= 0 ? remaining / safeRate * 1000 : null;
    return {
        tokensPerSecond: safeRate,
        timeToExhaustionMs
    };
}
}),
"[project]/src/lib/quota/redisQuotaStore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "RedisQuotaStore",
    ()=>RedisQuotaStore,
    "getRedisClient",
    ()=>getRedisClient,
    "getRedisQuotaStore",
    ()=>getRedisQuotaStore,
    "resetRedisClient",
    ()=>resetRedisClient,
    "resetRedisQuotaStore",
    ()=>resetRedisQuotaStore
]);
/**
 * redisQuotaStore.ts — Optional Redis-backed QuotaStore implementation.
 *
 * Counter keys follow the pattern:
 *   omniroute:quota:<apiKeyId>:<dimensionKey>:<bucketIndex>
 *
 * Sliding window is maintained identically to the SQLite driver:
 *   effective = prev × (1 − elapsed/window) + curr
 *
 * Pool/allocation metadata (listAllocationsForApiKey, getPool) still lives in
 * SQLite (F2) — only the rolling counters are stored in Redis.
 *
 * ioredis is a SOFT dependency. If not installed, constructing a RedisQuotaStore
 * throws a clear error message.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/dimensions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$burnRate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/burnRate.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// ---------------------------------------------------------------------------
// Redis connection singleton
// ---------------------------------------------------------------------------
// Lazy singleton — created on first use
let _redisClient = null; // typed as unknown; cast via RedisLike below
async function getRedisClient(url) {
    if (_redisClient) {
        return _redisClient;
    }
    // Lazy dynamic require — ioredis is an optional dependency
    let Redis;
    try {
        const mod = await __turbopack_context__.A("[project]/node_modules/ioredis/built/index.js [app-route] (ecmascript, async loader)");
        Redis = mod.default ?? mod;
    } catch  {
        throw new Error("Redis driver requires ioredis package. Run npm install ioredis.");
    }
    _redisClient = new Redis(url);
    return _redisClient;
}
function resetRedisClient() {
    _redisClient = null;
}
// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------
const KEY_PREFIX = "omniroute:quota";
function bucketKey(apiKeyId, dimensionKey, bucketIndex) {
    return `${KEY_PREFIX}:${apiKeyId}:${dimensionKey}:${bucketIndex}`;
}
function ttlSeconds(windowMs) {
    // Keep both current + previous bucket alive → 2 × window
    return Math.ceil(2 * windowMs / 1000);
}
// ---------------------------------------------------------------------------
// Sliding window helpers
// ---------------------------------------------------------------------------
function slidingWindowEffective(curr, prev, nowMs, windowMs) {
    const currentBucketIndex = Math.floor(nowMs / windowMs);
    const currentBucketStartMs = currentBucketIndex * windowMs;
    const elapsed = nowMs - currentBucketStartMs;
    const weight = 1 - elapsed / windowMs;
    return prev * weight + curr;
}
class RedisQuotaStore {
    url;
    constructor(url){
        this.url = url;
    }
    async client() {
        return getRedisClient(this.url);
    }
    /**
   * Increment consumption by `cost` using INCRBYFLOAT (atomic) and refresh TTL.
   * Returns the new sliding-window effective value.
   */ async consume(apiKeyId, dim, cost) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const client = await this.client();
        const currKey = bucketKey(apiKeyId, dimKey, currentBucket);
        const prevKey = bucketKey(apiKeyId, dimKey, currentBucket - 1);
        const ttl = ttlSeconds(windowMs);
        // Atomic increment + refresh TTL
        const newCurrStr = await client.incrbyfloat(currKey, cost);
        await client.expire(currKey, ttl);
        // Also ensure prev key TTL is refreshed so it doesn't disappear prematurely
        await client.expire(prevKey, ttl);
        const newCurr = parseFloat(newCurrStr) || 0;
        // Read prev to compute sliding window
        const [prevStr] = await client.mget(prevKey);
        const prev = parseFloat(prevStr ?? "0") || 0;
        return slidingWindowEffective(newCurr, prev, nowMs, windowMs);
    }
    /**
   * Read the sliding-window effective value without modification.
   */ async peek(apiKeyId, dim) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const client = await this.client();
        const currKey = bucketKey(apiKeyId, dimKey, currentBucket);
        const prevKey = bucketKey(apiKeyId, dimKey, currentBucket - 1);
        const [currStr, prevStr] = await client.mget(currKey, prevKey);
        const curr = parseFloat(currStr ?? "0") || 0;
        const prev = parseFloat(prevStr ?? "0") || 0;
        return slidingWindowEffective(curr, prev, nowMs, windowMs);
    }
    /**
   * Return the real pool-wide consumption for a dimension in the current
   * sliding window, summed across ALL apiKeyIds in the pool's allocations.
   *
   * Strategy: pool/allocation metadata lives in SQLite (F2), so we fetch the
   * allocation list for the pool, then issue a single MGET for all
   * (apiKeyId, curr-bucket) and (apiKeyId, prev-bucket) keys. The Redis keys
   * are per-key counters — there is no pool-level aggregate key — so we read
   * each key's two buckets and sum the raw values before applying the
   * sliding-window formula once on the totals.
   *
   * If the pool does not exist or has no allocations, returns 0.
   * Keys absent in Redis are treated as 0 (MGET returns null).
   */ async poolConsumedTotal(poolId, dim) {
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(poolId);
        if (!pool || pool.allocations.length === 0) return 0;
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const prevBucket = currentBucket - 1;
        const client = await this.client();
        // Build [currKey0, prevKey0, currKey1, prevKey1, ...] for all allocated keys
        const redisKeys = [];
        for (const alloc of pool.allocations){
            redisKeys.push(bucketKey(alloc.apiKeyId, dimKey, currentBucket));
            redisKeys.push(bucketKey(alloc.apiKeyId, dimKey, prevBucket));
        }
        const values = await client.mget(...redisKeys);
        let currTotal = 0;
        let prevTotal = 0;
        for(let i = 0; i < values.length; i += 2){
            currTotal += parseFloat(values[i] ?? "0") || 0;
            prevTotal += parseFloat(values[i + 1] ?? "0") || 0;
        }
        return slidingWindowEffective(currTotal, prevTotal, nowMs, windowMs);
    }
    /**
   * Aggregate pool usage. Pool and allocation metadata come from SQLite (F2);
   * rolling counters come from Redis.
   */ async poolUsage(poolId) {
        const nowMs = Date.now();
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(poolId);
        if (!pool) {
            return {
                poolId,
                generatedAt: new Date(nowMs).toISOString(),
                dimensions: []
            };
        }
        // Pool dimensions are not directly available here (they come from plan
        // resolver). Return empty for now — REST routes (F8) call poolUsageWithDimensions.
        return {
            poolId,
            generatedAt: new Date(nowMs).toISOString(),
            dimensions: []
        };
    }
    /**
   * Build a PoolUsageSnapshot with explicit plan dimensions.
   * Mirrors SqliteQuotaStore.poolUsageWithDimensions().
   */ async poolUsageWithDimensions(poolId, planDimensions) {
        const nowMs = Date.now();
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(poolId);
        if (!pool) {
            return {
                poolId,
                generatedAt: new Date(nowMs).toISOString(),
                dimensions: []
            };
        }
        const { allocations } = pool;
        const totalWeight = allocations.reduce((sum, a)=>sum + a.weight, 0);
        const dimensionSnapshots = [];
        for (const planDim of planDimensions){
            const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][planDim.window];
            if (!windowMs) continue;
            let consumedTotal = 0;
            const perKey = [];
            for (const alloc of allocations){
                const dim = {
                    poolId,
                    unit: planDim.unit,
                    window: planDim.window
                };
                const consumed = await this.peek(alloc.apiKeyId, dim);
                consumedTotal += consumed;
                const effectiveWeight = totalWeight > 0 ? alloc.weight : 0;
                const fairShare = effectiveWeight / 100 * planDim.limit;
                const deficit = consumed - fairShare;
                const borrowing = consumed > fairShare;
                perKey.push({
                    apiKeyId: alloc.apiKeyId,
                    consumed,
                    fairShare,
                    deficit,
                    borrowing
                });
            }
            dimensionSnapshots.push({
                unit: planDim.unit,
                window: planDim.window,
                limit: planDim.limit,
                consumedTotal,
                perKey
            });
        }
        const tokenDim = dimensionSnapshots.find((d)=>d.unit === "tokens");
        let burnRate;
        if (tokenDim && tokenDim.consumedTotal > 0) {
            const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][tokenDim.window];
            const remaining = tokenDim.limit - tokenDim.consumedTotal;
            const rateResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$burnRate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeBurnRateFromWindow"])(tokenDim.consumedTotal, windowMs, remaining);
            burnRate = {
                tokensPerSecond: rateResult.tokensPerSecond,
                timeToExhaustionMs: rateResult.timeToExhaustionMs
            };
        }
        return {
            poolId,
            generatedAt: new Date(nowMs).toISOString(),
            dimensions: dimensionSnapshots,
            burnRate
        };
    }
    /**
   * Clear both current and previous bucket counters. Test-only.
   */ async clear(apiKeyId, dim) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const client = await this.client();
        const currKey = bucketKey(apiKeyId, dimKey, currentBucket);
        const prevKey = bucketKey(apiKeyId, dimKey, currentBucket - 1);
        await client.del(currKey, prevKey);
    }
}
// Singleton per URL
let _storeInstance = null;
let _storeUrl = null;
function getRedisQuotaStore(url) {
    if (!_storeInstance || _storeUrl !== url) {
        _storeInstance = new RedisQuotaStore(url);
        _storeUrl = url;
    }
    return _storeInstance;
}
function resetRedisQuotaStore() {
    _storeInstance = null;
    _storeUrl = null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_quota_09e054w._.js.map