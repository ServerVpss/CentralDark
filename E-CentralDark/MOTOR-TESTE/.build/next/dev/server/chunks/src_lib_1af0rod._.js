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
"[project]/src/lib/quota/fairShare.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * fairShare.ts — Work-conserving fair-share algorithm for quota allocation.
 *
 * Implements a multi-dimension, 3-policy (hard/soft/burst) fair-share decision
 * engine. Two modes:
 *   - Generous: globalUsedPercent < saturationThreshold → allow borrowing from
 *     unallocated pool while global capacity remains.
 *   - Strict:   globalUsedPercent >= saturationThreshold → enforce fatias estritas
 *     (hard policy blocks at fair_share, soft penalises, burst still allows
 *     if there is global headroom).
 *
 * Cap absoluto is always enforced regardless of mode or policy.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ __turbopack_context__.s([
    "decideFairShare",
    ()=>decideFairShare
]);
// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function dimensionKeyString(key) {
    return `${key.poolId}:${key.unit}:${key.window}`;
}
const KNOWN_POLICIES = new Set([
    "hard",
    "soft",
    "burst"
]);
/**
 * Fail-safe policy normalization. Any value outside the known
 * `hard | soft | burst` set (e.g. a corrupted DB row that reached this engine
 * through an unchecked `row.policy as Policy` cast) is treated as the most
 * restrictive policy, `hard`. This closes a fail-OPEN hole: an unknown policy
 * used to fall through every `switch` case and return a silent `allow`.
 */ function normalizePolicy(policy) {
    return KNOWN_POLICIES.has(policy) ? policy : "hard";
}
function decideFairShare(input) {
    const { dimensions, allocation, consumedByThisKey, saturationThreshold } = input;
    // Empty plan → always allow
    if (dimensions.length === 0) {
        return {
            kind: "allow",
            reason: "ok"
        };
    }
    // Fail-safe: an unknown/corrupted policy is treated as `hard` (most
    // restrictive) so it can never silently bypass fair-share enforcement.
    const effectivePolicy = normalizePolicy(allocation.policy);
    let anyPenalized = false;
    for (const dim of dimensions){
        const dKey = dimensionKeyString(dim.key);
        const consumed = consumedByThisKey[dKey] ?? 0;
        const fairShare = allocation.weight / 100 * dim.limit;
        // ── Cap absoluto (intransponível, sempre) ──────────────────────────────
        if (allocation.capValue !== undefined && allocation.capUnit === dim.key.unit && consumed >= allocation.capValue) {
            return {
                kind: "block",
                reason: "cap-absolute"
            };
        }
        // ── Teto global intransponível ─────────────────────────────────────────
        // If the pool's global limit is already reached AND this key's request
        // would exceed it (burst mode without borrow room), block as "global-saturated".
        if (dim.consumedTotal >= dim.limit) {
            if (effectivePolicy !== "burst") {
                return {
                    kind: "block",
                    reason: "global-saturated"
                };
            }
            // burst also blocked when no room at all
            return {
                kind: "block",
                reason: "global-saturated"
            };
        }
        const isStrict = dim.globalUsedPercent >= saturationThreshold;
        if (isStrict) {
            // ── Strict mode ────────────────────────────────────────────────────
            // effectivePolicy is normalized (unknown → hard), so these cases are
            // exhaustive and an unknown policy is enforced as hard.
            switch(effectivePolicy){
                case "hard":
                    // Hard: block once consumed >= fair_share
                    if (consumed >= fairShare) {
                        return {
                            kind: "block",
                            reason: "fair-share"
                        };
                    }
                    break;
                case "soft":
                    // Soft: allow but penalise if above fair_share
                    if (consumed >= fairShare) {
                        anyPenalized = true;
                    }
                    break;
                case "burst":
                    break;
            }
        } else {
            // ── Generous mode ──────────────────────────────────────────────────
            // There is slack — allow borrowing up to the global limit.
            // effectivePolicy is normalized (unknown → hard).
            switch(effectivePolicy){
                case "hard":
                    // Hard in generous mode: allow if global limit not reached AND
                    // the key is within global limit (which we know because
                    // consumedTotal < limit was checked above).
                    // Only block if key has consumed >= global limit itself
                    // (very unlikely but safe).
                    if (consumed >= dim.limit) {
                        return {
                            kind: "block",
                            reason: "global-saturated"
                        };
                    }
                    break;
                case "soft":
                    // Soft in generous mode: allow but mark penalised if past fair_share
                    if (consumed >= fairShare) {
                        anyPenalized = true;
                    }
                    break;
                case "burst":
                    break;
            }
        }
    }
    // All dimensions passed → allow
    return {
        kind: "allow",
        reason: "ok",
        penalized: anyPenalized || undefined
    };
}
}),
"[project]/src/lib/db/providerPlans.ts [app-route] (ecmascript) <export getPlan as getProviderPlan>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getProviderPlan",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlan"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [app-route] (ecmascript)");
}),
"[project]/src/lib/quota/planRegistry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKnownPlan",
    ()=>getKnownPlan,
    "knownProviders",
    ()=>knownProviders
]);
const KNOWN_PLANS = {
    codex: {
        provider: "codex",
        dimensions: [
            {
                unit: "percent",
                window: "5h",
                limit: 100
            },
            {
                unit: "percent",
                window: "weekly",
                limit: 100
            }
        ]
    },
    // Claude Code (Pro / Max 5x / Max 20x) is a percentage-of-plan quota over a 5h
    // rolling window + a weekly cap, shared across Claude and Claude Code. The exact
    // token caps are not published and vary by task, so % is the practical unit; the
    // provider reports % used and fair-share attributes it across keys by local count.
    claude: {
        provider: "claude",
        dimensions: [
            {
                unit: "percent",
                window: "5h",
                limit: 100
            },
            {
                unit: "percent",
                window: "weekly",
                limit: 100
            }
        ]
    },
    glm: {
        provider: "glm",
        dimensions: [
            // limit=0 = desconhecido; documentado. Mantido para correta detecção pelo planResolver.
            // Sliding window / fair-share devem tratar limit=0 como "manual obrigatório".
            {
                unit: "tokens",
                window: "5h",
                limit: Number.EPSILON
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: Number.EPSILON
            }
        ]
    },
    minimax: {
        provider: "minimax",
        // MiniMax token plan (platform.minimax.io/docs/token-plan): monthly allowance
        // enforced over 5h-rolling + weekly windows. Tiers (M3): Plus ~1.633B ($20),
        // Max ~5.053B ($50), Ultra ~9.796B ($120). EPSILON = pick your tier in "Limite".
        dimensions: [
            {
                unit: "tokens",
                window: "5h",
                limit: Number.EPSILON
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: Number.EPSILON
            }
        ]
    },
    // DeepSeek is prepaid in USD — its balance API is already wired (deepseekQuotaFetcher)
    // and shown on the quota page. fair-share supports the `usd` unit (COUNTABLE_UNITS),
    // so set a USD budget here ("fixado por valor"); the proxy sums each key's USD cost.
    deepseek: {
        provider: "deepseek",
        dimensions: [
            {
                unit: "usd",
                window: "monthly",
                limit: Number.EPSILON
            }
        ]
    },
    bailian: {
        provider: "bailian",
        dimensions: [
            {
                unit: "percent",
                window: "5h",
                limit: 100
            },
            {
                unit: "percent",
                window: "weekly",
                limit: 100
            },
            {
                unit: "percent",
                window: "monthly",
                limit: 100
            }
        ]
    },
    kimi: {
        provider: "kimi",
        dimensions: [
            {
                unit: "requests",
                window: "hourly",
                limit: 1500
            }
        ]
    },
    // Kimi "coding" plan connections register under the `kimi-coding` slug, which
    // exposes no upstream balance API. EPSILON = "unknown, set the real plan limit
    // manually in the Wizard 'Limite' step" (same convention as glm/minimax).
    "kimi-coding": {
        provider: "kimi-coding",
        dimensions: [
            {
                unit: "tokens",
                window: "5h",
                limit: Number.EPSILON
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: Number.EPSILON
            }
        ]
    },
    // Xiaomi MiMo token plan (platform.xiaomimimo.com/token-plan) is a MONTHLY
    // allowance with no balance API. Default seeds the "lite" plan's 4.1B-token
    // monthly cap so the Wizard pre-fills a usable fair-share limit; adjust in the
    // "Limite" step to match the connection's actual plan.
    "xiaomi-mimo": {
        provider: "xiaomi-mimo",
        dimensions: [
            {
                unit: "tokens",
                window: "monthly",
                limit: 4_100_000_000
            }
        ]
    },
    // Xiaomi MiMo Token Plan (token-plan-sgp): same MONTHLY allowance with no
    // balance API as the regular account plan. Adjust in the Wizard's "Limite"
    // step when the connection is on a different plan.
    "xiaomi-mimo-token-plan": {
        provider: "xiaomi-mimo-token-plan",
        dimensions: [
            {
                unit: "tokens",
                window: "monthly",
                limit: 4_100_000_000
            }
        ]
    },
    alibaba: {
        provider: "alibaba",
        dimensions: [
            {
                unit: "requests",
                window: "monthly",
                limit: 90_000
            }
        ]
    },
    // Grok Build (xAI) — rate limits from x-ratelimit-* headers:
    // Daily: 864 requests, 18M tokens (from API headers)
    // Weekly: derived from daily * 7
    // #6844: this static estimate is now the fallback used only when the live
    // grok-cli quota fetcher (open-sse/services/grokCliQuotaFetcher.ts) returns
    // null (both credentials missing and upstream fetch/parse failures fail
    // open to this static plan) — the shared weekly percent-based credit pool
    // it estimates is not observable from local request/token counters alone.
    "grok-cli": {
        provider: "grok-cli",
        dimensions: [
            {
                unit: "requests",
                window: "daily",
                limit: 864
            },
            {
                unit: "tokens",
                window: "daily",
                limit: 18_000_000
            },
            {
                unit: "requests",
                window: "weekly",
                limit: 6048
            },
            {
                unit: "tokens",
                window: "weekly",
                limit: 126_000_000
            }
        ]
    }
};
function getKnownPlan(provider) {
    return KNOWN_PLANS[provider] ?? null;
}
function knownProviders() {
    return Object.keys(KNOWN_PLANS);
}
}),
"[project]/src/lib/quota/planResolver.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolvePlan",
    ()=>resolvePlan
]);
/**
 * planResolver.ts — Resolve the quota plan for a provider connection.
 *
 * Precedence (highest to lowest):
 *   1. Manual DB override (provider_plans table via getProviderPlan)
 *   2. Known catalog (planRegistry.ts)
 *   3. Empty plan (no dimensions — manual configuration required)
 *
 * Runtime signals (upstream response headers) are accepted for future
 * extensibility but ignored in v1.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__getPlan__as__getProviderPlan$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [app-route] (ecmascript) <export getPlan as getProviderPlan>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/planRegistry.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function resolvePlan(connectionId, provider, _runtimeSignals) {
    // 1. Manual DB override
    try {
        const dbPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__getPlan__as__getProviderPlan$3e$__["getProviderPlan"])(connectionId);
        if (dbPlan && dbPlan.dimensions.length > 0) {
            return {
                connectionId: dbPlan.connectionId,
                provider: dbPlan.provider,
                dimensions: dbPlan.dimensions,
                source: dbPlan.source
            };
        }
    } catch  {
    // DB not available (e.g. test env without migration) — fall through
    }
    // 2. Known catalog
    const catalogPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKnownPlan"])(provider);
    if (catalogPlan) {
        return {
            connectionId: null,
            provider: catalogPlan.provider,
            dimensions: catalogPlan.dimensions,
            source: "auto"
        };
    }
    // 3. Empty (manual configuration required)
    return {
        connectionId: null,
        provider,
        dimensions: [],
        source: "manual"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/src/lib/quota/storeFactory.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getQuotaStore",
    ()=>getQuotaStore,
    "getQuotaStoreSync",
    ()=>getQuotaStoreSync,
    "resetQuotaStoreSingleton",
    ()=>resetQuotaStoreSingleton
]);
/**
 * storeFactory.ts — Lazy singleton factory for QuotaStore.
 *
 * Driver selection precedence (highest to lowest):
 *   1. DB setting `quotaStore.driver` (read via getSettings())
 *   2. Env `QUOTA_STORE_DRIVER`
 *   3. Default: "sqlite"
 *
 * Redis URL precedence:
 *   1. DB setting `quotaStore.redisUrl`
 *   2. Env `QUOTA_STORE_REDIS_URL`
 *
 * If driver=redis but URL is absent/invalid → fallback to sqlite + pino.warn.
 * Never throws — always returns a valid QuotaStore.
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("quota:factory");
// ---------------------------------------------------------------------------
// Singleton state
// ---------------------------------------------------------------------------
let _store = null;
function resetQuotaStoreSingleton() {
    _store = null;
}
async function readDbSettings() {
    try {
        // Lazy import to avoid circular deps and to keep the module loadable
        // in environments without a DB (e.g. partial test setups).
        const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
        const settings = await getSettings();
        const raw = settings["quotaStore"];
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const obj = raw;
            return {
                driver: typeof obj.driver === "string" ? obj.driver : undefined,
                redisUrl: typeof obj.redisUrl === "string" ? obj.redisUrl : undefined
            };
        }
    } catch  {
    // DB not available — fall through to env
    }
    return {};
}
async function getQuotaStore() {
    if (_store) return _store;
    // Read settings
    const dbSettings = await readDbSettings();
    const driver = dbSettings.driver ?? process.env.QUOTA_STORE_DRIVER ?? "sqlite";
    const redisUrl = dbSettings.redisUrl ?? process.env.QUOTA_STORE_REDIS_URL ?? "";
    if (driver === "redis") {
        if (!redisUrl) {
            log.warn("QUOTA_STORE_DRIVER=redis but no Redis URL configured — falling back to sqlite");
        } else {
            try {
                const { getRedisQuotaStore } = await __turbopack_context__.A("[project]/src/lib/quota/redisQuotaStore.ts [app-route] (ecmascript, async loader)");
                // Validate ioredis is available by attempting a mock import
                // The actual connection is lazy; we just need the class to instantiate.
                const store = getRedisQuotaStore(redisUrl);
                _store = store;
                log.info({
                    redisUrl: redisUrl.replace(/:[^:@]*@/, ":***@")
                }, "QuotaStore: using Redis driver");
                return _store;
            } catch (err) {
                log.warn({
                    err: err?.message
                }, "Redis QuotaStore unavailable — falling back to sqlite");
            // Fall through to sqlite
            }
        }
    }
    // Default: SQLite
    const { getSqliteQuotaStore } = await __turbopack_context__.A("[project]/src/lib/quota/sqliteQuotaStore.ts [app-route] (ecmascript, async loader)");
    _store = getSqliteQuotaStore();
    log.info("QuotaStore: using SQLite driver");
    return _store;
}
function getQuotaStoreSync() {
    if (!_store) {
        throw new Error("QuotaStore has not been initialised yet. Call getQuotaStore() first.");
    }
    return _store;
}
}),
"[project]/src/lib/quota/QuotaStore.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * QuotaStore.ts — Public façade for the Quota Sharing Engine.
 *
 * Re-exports the interface types from types.ts and the factory from
 * storeFactory.ts so consumers have a single import point.
 *
 * Usage:
 *   import { getQuotaStore } from "@/lib/quota/QuotaStore";
 *   import type { QuotaStore, EnforceDecision } from "@/lib/quota/QuotaStore";
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F6).
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/storeFactory.ts [app-route] (ecmascript)");
;
}),
"[project]/src/lib/quota/enforce.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * enforce.ts — Quota Share enforcement for the hot path.
 *
 * Two entry points:
 *   - enforceQuotaShare(input): EnforceDecision — PRE-request check.
 *   - recordConsumption(input): void — POST-response tracker (fire-and-forget via spendRecorder).
 *
 * Design principles (Group B decisions):
 *   - B16: fail-open — any error from store/plan/saturation is caught and treated as "allow".
 *   - B25: 429 message is sanitized (routed through buildErrorBody in chatCore hook, not here).
 *   - B29: recordConsumption failures never propagate to the caller (drift is acceptable).
 *
 * Part of: Group B — Quota Sharing Engine (plan 22, frente F7).
 */ __turbopack_context__.s([
    "enforceQuotaShare",
    ()=>enforceQuotaShare,
    "recordConsumption",
    ()=>recordConsumption
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/dimensions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$fairShare$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/fairShare.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/planResolver.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$saturationSignals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/saturationSignals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$QuotaStore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/quota/QuotaStore.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/storeFactory.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaModelCaps.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SATURATION_THRESHOLD = Number(process.env.QUOTA_SATURATION_THRESHOLD ?? "0.5");
/**
 * Units for which the store tracks a real pool-wide aggregate (sum of per-key
 * consumption via quota_consumption rows). For these units, globalUsedPercent
 * (the saturation signal from the upstream provider) is always 0 because no
 * external API reports a "percent used" for raw request/token/usd counters.
 *
 * Using globalUsedPercent × effectiveLimit for countable units would always
 * yield consumedTotal = 0, meaning the pool never saturates and per-key
 * overage is never blocked. We use store.poolConsumedTotal() instead, which
 * sums the actual consumption across all keys in the pool window.
 *
 * "percent" dimensions remain driven by the saturation signal because that IS
 * the authoritative consumption measure (the upstream provider percentage).
 */ const COUNTABLE_UNITS = new Set([
    "requests",
    "tokens",
    "usd"
]);
async function enforceQuotaShare(input) {
    // 1. Find pools that contain this apiKeyId.
    let allocations;
    try {
        allocations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAllocationsForApiKey"])(input.apiKeyId);
    } catch  {
        // DB not available or migration not run — fail-open
        return {
            kind: "allow"
        };
    }
    if (!allocations.length) {
        // No pool assignment → no restriction
        return {
            kind: "allow"
        };
    }
    // 2. Filter to pool that belongs to the same connectionId.
    let pool = null;
    let poolAllocation = null;
    for (const { poolId, allocation } of allocations){
        let p = null;
        try {
            p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(poolId);
        } catch  {
            continue;
        }
        // D2: match if the input connectionId is ANY member of the pool, not only
        // the legacy primary. Fall back to connectionId equality for rows that
        // have not yet been backfilled (connectionIds empty/undefined).
        if (p && (Array.isArray(p.connectionIds) ? p.connectionIds.includes(input.connectionId) : p.connectionId === input.connectionId)) {
            pool = p;
            poolAllocation = allocation;
            break;
        }
    }
    if (!pool || !poolAllocation) {
        // API key is in pools but none matches this connection → no restriction
        return {
            kind: "allow"
        };
    }
    // Obtain the store early — needed for both the model-cap pre-check (step 3b)
    // and the pool-level dimension loop (step 4).
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQuotaStore"])();
    // 3. Resolve the provider plan (dimensions).
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePlan"])(input.connectionId, input.provider);
    // 3b. Per-(key, model) model-cap pre-check (Fase 3 #7).
    //
    // If the caller provides a model name, look for a cap row in
    // quota_allocation_model_caps for (pool.id, apiKeyId, model). When found and
    // the cap value is real (> EPSILON), peek the per-model consumption bucket and
    // block ONLY this model if the cap is reached. Other models in the same pool
    // remain unaffected — cap is per-model, not global.
    //
    // Consumption is stored in quota_consumption using a model-scoped dimension key:
    //   poolId  = "${pool.id}:model:${model}"  (distinct from pool-level rows)
    //   unit    = cap.capUnit
    //   window  = "hourly"  (rate-limiting window; fixed for model caps)
    //
    // Fail-open per B16: any error reading the cap or peeking the store → skip check.
    if (input.model) {
        let modelCap = null;
        try {
            modelCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCap"])(pool.id, input.apiKeyId, input.model);
        } catch  {
        // DB error — fail-open per B16
        }
        if (modelCap && modelCap.capValue > Number.EPSILON) {
            const modelBucketPoolId = `${pool.id}:model:${input.model}`;
            const modelDimKey = {
                poolId: modelBucketPoolId,
                unit: modelCap.capUnit,
                window: "hourly"
            };
            const modelConsumed = await store.peek(input.apiKeyId, modelDimKey).catch(()=>0);
            if (modelConsumed >= modelCap.capValue) {
                try {
                    const { notifyWebhookEvent } = await __turbopack_context__.A("[project]/src/lib/webhookDispatcher.ts [app-route] (ecmascript, async loader)");
                    notifyWebhookEvent("quota.exceeded", {
                        apiKeyId: input.apiKeyId,
                        provider: input.provider,
                        connectionId: input.connectionId,
                        reason: "model-cap",
                        model: input.model
                    });
                } catch  {
                // webhook is best-effort
                }
                return {
                    kind: "block",
                    reason: `Model cap reached for your API key on ${input.provider}/${input.model} [model-cap]`,
                    httpStatus: 429
                };
            }
        }
    }
    if (!plan.dimensions.length) {
        // No dimensions configured → nothing to enforce
        return {
            kind: "allow"
        };
    }
    // 3a. Compute the account multiplier: a pool with N same-type connections has an
    // effective budget of perAccountLimit × N per dimension. Consumption is already
    // pool-keyed (shared bucket) — only the limit scales, never the consumption.
    const accountCount = Array.isArray(pool.connectionIds) && pool.connectionIds.length > 0 ? pool.connectionIds.length : 1;
    // 4. For each active dimension, peek consumption and saturation.
    const dimensionsInfo = [];
    const consumedByThisKey = {};
    for (const dim of plan.dimensions){
        // Skip placeholder dimensions whose limit is unknown (Number.EPSILON / 0 — the
        // "configure manually" seed for glm/minimax/kimi-coding/deepseek in planRegistry.ts).
        // An unconfigured limit is NOT a real cap: enforcing it would block every request
        // after the first one, because decideFairShare's global-saturated gate fires as soon
        // as consumedTotal exceeds ~EPSILON. The real cap kicks in once a limit is set via
        // the Wizard "Limite" step (provider_plans override).
        if (!(dim.limit > Number.EPSILON)) continue;
        const dimKey = {
            poolId: pool.id,
            unit: dim.unit,
            window: dim.window
        };
        const dimKeyStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dimKey);
        const consumedThisKey = await store.peek(input.apiKeyId, dimKey).catch(()=>0);
        consumedByThisKey[dimKeyStr] = consumedThisKey;
        // Global saturation signal — fail-open: 0 (generous mode)
        const globalUsedPercent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$saturationSignals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSaturation"])(input.connectionId, input.provider, dim).catch(()=>0);
        // Effective limit = per-account plan limit × number of accounts in the pool.
        // This is the summed budget: N accounts contribute N × L capacity to the shared bucket.
        const effectiveLimit = dim.limit * accountCount;
        // Derive consumedTotal based on the unit type:
        //   - Countable units (requests/tokens/usd): use the real store aggregate so the
        //     pool can actually saturate and block per-key overage. The saturation signal
        //     (globalUsedPercent) is always 0 for these units — using it would permanently
        //     keep consumedTotal at 0 and never trigger the block path.
        //   - percent dimensions: the saturation signal IS the consumed signal (the upstream
        //     provider returns a utilisation percentage, not raw counts).
        let consumedTotal;
        if (COUNTABLE_UNITS.has(dim.unit)) {
            // Real pool-wide aggregate (sum of per-key consumption across all apiKeyIds).
            consumedTotal = await store.poolConsumedTotal(pool.id, dimKey).catch(()=>0);
        } else {
            // percent (account-quota window): the saturation signal is authoritative.
            consumedTotal = globalUsedPercent * effectiveLimit;
        }
        dimensionsInfo.push({
            key: dimKey,
            limit: effectiveLimit,
            consumedTotal,
            globalUsedPercent
        });
    }
    // 5. Apply the fair-share algorithm across all dimensions.
    // Equal-split fallback: when ALL allocations in the pool have weight 0 (e.g. newly
    // added keys whose weight was never set), treat each as an equal share so the pool
    // is usable without requiring a re-save. Original non-zero weights are kept as-is.
    const poolTotalWeight = Array.isArray(pool.allocations) ? pool.allocations.reduce((s, a)=>s + (Number.isFinite(a.weight) ? a.weight : 0), 0) : 0;
    const allocCount = Array.isArray(pool.allocations) ? pool.allocations.length : 0;
    const effectiveWeight = poolTotalWeight > 0 ? poolAllocation.weight : allocCount > 0 ? 100 / allocCount : 0;
    const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$fairShare$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decideFairShare"])({
        dimensions: dimensionsInfo,
        allocation: {
            ...poolAllocation,
            weight: effectiveWeight
        },
        consumedByThisKey,
        saturationThreshold: SATURATION_THRESHOLD
    });
    if (decision.kind === "block") {
        // Fire webhook (fire-and-forget, never blocks the response)
        try {
            const { notifyWebhookEvent } = await __turbopack_context__.A("[project]/src/lib/webhookDispatcher.ts [app-route] (ecmascript, async loader)");
            notifyWebhookEvent("quota.exceeded", {
                apiKeyId: input.apiKeyId,
                provider: input.provider,
                connectionId: input.connectionId,
                reason: decision.reason
            });
        } catch  {
        // webhook dispatch is best-effort
        }
        return {
            kind: "block",
            reason: messageForReason(decision.reason, input.provider),
            httpStatus: 429,
            retryAfterSeconds: decision.retryAfterMs ? Math.ceil(decision.retryAfterMs / 1000) : undefined
        };
    }
    // "allow" — may be penalized (soft policy overage)
    return {
        kind: "allow",
        deprioritize: decision.penalized === true
    };
}
async function recordConsumption(input) {
    let allocations;
    try {
        allocations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAllocationsForApiKey"])(input.apiKeyId);
    } catch  {
        return; // DB not available — silent no-op
    }
    if (!allocations.length) return;
    // Find the pool matching this connection
    let poolId = null;
    for (const { poolId: pid } of allocations){
        let p = null;
        try {
            p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])(pid);
        } catch  {
            continue;
        }
        // D2: membership check — same logic as enforceQuotaShare above.
        if (p && (Array.isArray(p.connectionIds) ? p.connectionIds.includes(input.connectionId) : p.connectionId === input.connectionId)) {
            poolId = pid;
            break;
        }
    }
    if (!poolId) return;
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePlan"])(input.connectionId, input.provider);
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQuotaStore"])();
    // Pool-level dimension consumption (existing behaviour).
    for (const dim of plan.dimensions){
        const dimKey = {
            poolId,
            unit: dim.unit,
            window: dim.window
        };
        const cost = costForUnit(input.cost, dim.unit);
        if (cost > 0) {
            await store.consume(input.apiKeyId, dimKey, cost).catch(()=>{
            // Fail-open per B29 — drift expected; teto global do fetcher corrige
            });
        }
    }
    // Per-(key, model) consumption tracking (Fase 3 #7).
    // When the caller provides a model name, increment the model-scoped bucket so
    // that the next enforceQuotaShare call sees an up-to-date per-model count.
    // Only runs when a cap row actually exists (no cap → no bucket to maintain).
    if (input.model) {
        let modelCap = null;
        try {
            modelCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelCap"])(poolId, input.apiKeyId, input.model);
        } catch  {
        // DB not available — silent no-op per B29
        }
        if (modelCap && modelCap.capValue > Number.EPSILON) {
            const cost = costForUnit(input.cost, modelCap.capUnit);
            if (cost > 0) {
                const modelBucketPoolId = `${poolId}:model:${input.model}`;
                const modelDimKey = {
                    poolId: modelBucketPoolId,
                    unit: modelCap.capUnit,
                    window: "hourly"
                };
                await store.consume(input.apiKeyId, modelDimKey, cost).catch(()=>{
                // Fail-open per B29
                });
            }
        }
    }
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function messageForReason(reason, provider) {
    switch(reason){
        case "fair-share":
            return `Quota share limit reached for your API key on ${provider}`;
        case "cap-absolute":
            return `Absolute quota cap reached for your API key on ${provider}`;
        case "global-saturated":
            return `Provider ${provider} quota window is saturated; no shared capacity available`;
        default:
            return "Quota share enforcement blocked the request";
    }
}
function costForUnit(cost, unit) {
    switch(unit){
        case "tokens":
            return cost.tokens ?? 0;
        case "usd":
            return cost.usd ?? 0;
        case "requests":
            return cost.requests ?? 1;
        case "percent":
            // percent is a global signal; not incremented locally
            return 0;
        default:
            return 0;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_1af0rod._.js.map