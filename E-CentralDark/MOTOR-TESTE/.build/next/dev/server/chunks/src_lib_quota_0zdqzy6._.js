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
"[project]/src/lib/quota/sqliteQuotaStore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SqliteQuotaStore",
    ()=>SqliteQuotaStore,
    "getSqliteQuotaStore",
    ()=>getSqliteQuotaStore
]);
/**
 * sqliteQuotaStore.ts — SQLite-backed QuotaStore implementation.
 *
 * Uses a Sliding Window Counter with 2 buckets per (apiKeyId, dimensionKey):
 *   effective = prev × (1 − elapsed/window) + curr
 *   currentBucketIndex = Math.floor(nowMs / WINDOW_MS[window])
 *   currentBucketStartMs = currentBucketIndex × WINDOW_MS[window]
 *   elapsed = nowMs − currentBucketStartMs
 *
 * Concurrency: per-(apiKeyId|dimensionKey) in-memory mutex prevents races on
 * the read-modify-write sequence (same anti-thundering-herd pattern used by
 * auth.ts::markAccountUnavailable). UPSERT in incrementBucket is still atomic
 * at the SQLite level.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaConsumption.ts [app-route] (ecmascript)");
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
// In-memory mutex (anti-thundering-herd, same pattern as auth.ts)
// ---------------------------------------------------------------------------
const _mutexes = new Map();
function mutexKey(apiKeyId, dimKey) {
    return `${apiKeyId}|${dimKey}`;
}
async function withMutex(key, fn) {
    const current = _mutexes.get(key) ?? Promise.resolve();
    let resolve;
    const next = new Promise((res)=>{
        resolve = res;
    });
    _mutexes.set(key, next);
    try {
        await current;
        return await fn();
    } finally{
        resolve();
        // Clean up only if this promise is still the active one
        if (_mutexes.get(key) === next) {
            _mutexes.delete(key);
        }
    }
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
class SqliteQuotaStore {
    /**
   * Increment consumption for (apiKeyId, dim) by `cost` and return the
   * new sliding-window effective value.
   */ async consume(apiKeyId, dim, cost) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        return withMutex(mutexKey(apiKeyId, dimKey), async ()=>{
            // UPSERT is atomic at the DB level
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["incrementBucket"])(apiKeyId, dimKey, currentBucket, cost, nowMs);
            // Read fresh pair to compute effective
            const { curr, prev } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPair"])(apiKeyId, dimKey, currentBucket);
            return slidingWindowEffective(curr, prev, nowMs, windowMs);
        });
    }
    /**
   * Peek at the current effective consumption without modifying any counters.
   */ async peek(apiKeyId, dim) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const { curr, prev } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPair"])(apiKeyId, dimKey, currentBucket);
        return slidingWindowEffective(curr, prev, nowMs, windowMs);
    }
    /**
   * Return the real pool-wide consumption for a dimension in the current
   * sliding window, summed across ALL apiKeyIds that share the same
   * dimensionKey (i.e. same poolId + unit + window).
   *
   * Uses the same 2-bucket sliding-window formula as peek(), applied once
   * to the pool totals so the result is consistent with per-key semantics.
   */ async poolConsumedTotal(poolId, dim) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const { currTotal, prevTotal } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sumPoolDimension"])(dimKey, currentBucket);
        return slidingWindowEffective(currTotal, prevTotal, nowMs, windowMs);
    }
    /**
   * Return a PoolUsageSnapshot for the given pool, aggregating per-key
   * consumption across all dimensions and computing fairShare / deficit /
   * borrowing flags.
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
        // QuotaPool does not carry dimension definitions — those live in the
        // ProviderPlan, resolved separately. Without a plan we cannot enumerate
        // dimension keys here, so this lightweight snapshot returns no dimensions.
        // The REST route (F8) calls poolUsageWithDimensions() with the resolved
        // plan to produce the full per-dimension response.
        return {
            poolId,
            generatedAt: new Date(nowMs).toISOString(),
            dimensions: []
        };
    }
    /**
   * Build a PoolUsageSnapshot for a given pool with explicit dimensions from
   * the provider plan. This is the richer version used by REST routes (F8)
   * that already resolved the plan.
   *
   * This method is not part of the QuotaStore interface but is available on
   * the concrete class for callers that have plan data.
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
        // Burn rate: derive from the sliding window (single-snapshot, no history needed).
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
   * Clear consumption counters for (apiKeyId, dim). Test-only.
   * Implemented by writing a large negative delta to bring curr + prev to 0,
   * OR by directly zeroing out the bucket rows.
   *
   * We zero by reading current and then applying -curr as delta.
   * The previous bucket is left as-is (its weight will decay naturally).
   */ async clear(apiKeyId, dim) {
        const nowMs = Date.now();
        const dimKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dim);
        const windowMs = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WINDOW_MS"][dim.window];
        const currentBucket = Math.floor(nowMs / windowMs);
        const prevBucket = currentBucket - 1;
        await withMutex(mutexKey(apiKeyId, dimKey), async ()=>{
            // Zero current bucket
            const currVal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBucket"])(apiKeyId, dimKey, currentBucket);
            if (currVal !== 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["incrementBucket"])(apiKeyId, dimKey, currentBucket, -currVal, nowMs);
            }
            // Zero previous bucket
            const prevVal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBucket"])(apiKeyId, dimKey, prevBucket);
            if (prevVal !== 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["incrementBucket"])(apiKeyId, dimKey, prevBucket, -prevVal, nowMs);
            }
        });
    }
}
// Singleton per process
let _instance = null;
function getSqliteQuotaStore() {
    if (!_instance) {
        _instance = new SqliteQuotaStore();
    }
    return _instance;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_quota_0zdqzy6._.js.map