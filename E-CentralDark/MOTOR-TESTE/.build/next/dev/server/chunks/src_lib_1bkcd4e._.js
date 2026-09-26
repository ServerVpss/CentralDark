module.exports = [
"[project]/src/lib/quota/dimensions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/quota/fairShare.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/quota/planRegistry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/quota/planResolver.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__getPlan__as__getProviderPlan$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [instrumentation] (ecmascript) <export getPlan as getProviderPlan>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/planRegistry.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function resolvePlan(connectionId, provider, _runtimeSignals) {
    // 1. Manual DB override
    try {
        const dbPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__getPlan__as__getProviderPlan$3e$__["getProviderPlan"])(connectionId);
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
    const catalogPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKnownPlan"])(provider);
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
"[project]/src/lib/quota/accountBuckets.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * accountBuckets.ts — Saturating per-connection, per-window buckets.
 *
 * Tracks whether a connection has hit 100 % of a quota window (5h / 7d /
 * per-model 7d). Each bucket is lazily reset: on read, if now >= resetsAtMs
 * the entry is cleared and the connection is eligible again. No cron needed —
 * the reset is probed on the read path.
 *
 * Fail-open: missing entry → not saturated. All time input is injectable
 * (the `nowMs` param) so unit tests drive the clock deterministically — the
 * tested path never calls Date.now() implicitly.
 *
 * Complementary to connectionRecovery.ts: that module recovers DB-backed
 * request-error cooldowns (testStatus 'unavailable' + rateLimitedUntil); this
 * module tracks in-process plan-window utilization. Orthogonal concerns.
 *
 * Part of: Quota Sharing Engine — Phase 3 (#3 multi-window buckets).
 */ // ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
/** In-process state for one (connectionId, windowKey) pair. */ __turbopack_context__.s([
    "SATURATION_THRESHOLD_PCT",
    ()=>SATURATION_THRESHOLD_PCT,
    "_bucketCountForTest",
    ()=>_bucketCountForTest,
    "_clearBucketsForTest",
    ()=>_clearBucketsForTest,
    "isBucketSaturated",
    ()=>isBucketSaturated,
    "recordUsage",
    ()=>recordUsage,
    "updateAccountBuckets",
    ()=>updateAccountBuckets
]);
const SATURATION_THRESHOLD_PCT = 100;
// ---------------------------------------------------------------------------
// In-process store
// ---------------------------------------------------------------------------
/** Key: `${connectionId}::${windowKey}`. */ const _buckets = new Map();
function storeKey(connectionId, windowKey) {
    return `${connectionId}::${windowKey}`;
}
/**
 * Parse an ISO 8601 `resetAt` string to epoch ms. Returns 0 on any failure
 * (unknown reset time → the lazy reset cannot fire for that bucket).
 */ function parseResetAtMs(resetAt) {
    if (!resetAt) return 0;
    const ms = Date.parse(resetAt);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
}
function isBucketSaturated(connectionId, windowKey, nowMs = Date.now()) {
    if (!connectionId || !windowKey) return false; // fail-open
    const key = storeKey(connectionId, windowKey);
    const entry = _buckets.get(key);
    if (!entry) return false; // fail-open
    // Lazy reset: the window rolled over → the saturation is stale.
    if (entry.resetsAtMs > 0 && nowMs >= entry.resetsAtMs) {
        _buckets.delete(key);
        return false;
    }
    return entry.saturated;
}
function recordUsage(connectionId, windowKey, usedPct, resetAt, nowMs = Date.now()) {
    if (!connectionId || !windowKey) return;
    const key = storeKey(connectionId, windowKey);
    const resetsAtMs = parseResetAtMs(resetAt);
    // Stale signal: the window already reset — discard any state and bail.
    if (resetsAtMs > 0 && nowMs >= resetsAtMs) {
        _buckets.delete(key);
        return;
    }
    const saturated = Number.isFinite(usedPct) && usedPct >= SATURATION_THRESHOLD_PCT;
    if (!saturated) {
        // Below threshold → clear any stale saturation so the bucket is eligible.
        _buckets.delete(key);
        return;
    }
    _buckets.set(key, {
        saturated: true,
        resetsAtMs
    });
}
function updateAccountBuckets(connectionId, usageResult, nowMs = Date.now()) {
    if (!connectionId || !usageResult?.quotas) return;
    const { quotas } = usageResult;
    // Fixed windows.
    processQuotaEntry(connectionId, "5h", quotas["session (5h)"], nowMs);
    processQuotaEntry(connectionId, "7d", quotas["weekly (7d)"], nowMs);
    // Per-model weekly windows: "weekly <model> (7d)" → "7d:<model>".
    for (const [key, entry] of Object.entries(quotas)){
        const match = /^weekly (.+) \(7d\)$/.exec(key);
        if (match?.[1]) {
            processQuotaEntry(connectionId, `7d:${match[1]}`, entry, nowMs);
        }
    }
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function processQuotaEntry(connectionId, windowKey, entry, nowMs) {
    if (!entry || typeof entry.used !== "number") return;
    recordUsage(connectionId, windowKey, entry.used, entry.resetAt ?? null, nowMs);
}
function _clearBucketsForTest() {
    _buckets.clear();
}
function _bucketCountForTest() {
    return _buckets.size;
}
}),
"[project]/src/lib/quota/saturationSignals.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/accountBuckets.ts [instrumentation] (ecmascript)");
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLogger"])("quota:saturation");
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
    const mod = await __turbopack_context__.A("[project]/open-sse/services/codexQuotaFetcher.ts [instrumentation] (ecmascript, async loader)");
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
    const mod = await __turbopack_context__.A("[project]/open-sse/services/bailianQuotaFetcher.ts [instrumentation] (ecmascript, async loader)");
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
        __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/open-sse/services/usage.ts [instrumentation] (ecmascript, async loader)")
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
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["updateAccountBuckets"])(connectionId, usage, Date.now());
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
    const mod = await __turbopack_context__.A("[project]/open-sse/services/usage.ts [instrumentation] (ecmascript, async loader)");
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
"[project]/src/lib/quota/storeFactory.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [instrumentation] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLogger"])("quota:factory");
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
        const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)");
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
                const { getRedisQuotaStore } = await __turbopack_context__.A("[project]/src/lib/quota/redisQuotaStore.ts [instrumentation] (ecmascript, async loader)");
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
    const { getSqliteQuotaStore } = await __turbopack_context__.A("[project]/src/lib/quota/sqliteQuotaStore.ts [instrumentation] (ecmascript, async loader)");
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
"[project]/src/lib/quota/QuotaStore.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/storeFactory.ts [instrumentation] (ecmascript)");
;
}),
"[project]/src/lib/quota/enforce.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/dimensions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$fairShare$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/fairShare.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/planResolver.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$saturationSignals$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/saturationSignals.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$QuotaStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/quota/QuotaStore.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/storeFactory.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaModelCaps.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
        allocations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["listAllocationsForApiKey"])(input.apiKeyId);
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
            p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPool"])(poolId);
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
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaStore"])();
    // 3. Resolve the provider plan (dimensions).
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePlan"])(input.connectionId, input.provider);
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
            modelCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelCap"])(pool.id, input.apiKeyId, input.model);
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
                    const { notifyWebhookEvent } = await __turbopack_context__.A("[project]/src/lib/webhookDispatcher.ts [instrumentation] (ecmascript, async loader)");
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
        const dimKeyStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$dimensions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["dimensionKeyToString"])(dimKey);
        const consumedThisKey = await store.peek(input.apiKeyId, dimKey).catch(()=>0);
        consumedByThisKey[dimKeyStr] = consumedThisKey;
        // Global saturation signal — fail-open: 0 (generous mode)
        const globalUsedPercent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$saturationSignals$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSaturation"])(input.connectionId, input.provider, dim).catch(()=>0);
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
    const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$fairShare$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decideFairShare"])({
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
            const { notifyWebhookEvent } = await __turbopack_context__.A("[project]/src/lib/webhookDispatcher.ts [instrumentation] (ecmascript, async loader)");
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
        allocations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["listAllocationsForApiKey"])(input.apiKeyId);
    } catch  {
        return; // DB not available — silent no-op
    }
    if (!allocations.length) return;
    // Find the pool matching this connection
    let poolId = null;
    for (const { poolId: pid } of allocations){
        let p = null;
        try {
            p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPool"])(pid);
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
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$planResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePlan"])(input.connectionId, input.provider);
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$storeFactory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaStore"])();
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
            modelCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelCap"])(poolId, input.apiKeyId, input.model);
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
"[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_NAME",
    ()=>APP_NAME,
    "getDefaultDataDir",
    ()=>getDefaultDataDir,
    "getLegacyDotDataDir",
    ()=>getLegacyDotDataDir,
    "isSamePath",
    ()=>isSamePath,
    "resolveDataDir",
    ()=>resolveDataDir,
    "resolveWritableDataDir",
    ()=>resolveWritableDataDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
;
;
;
const APP_NAME = "omniroute";
function fallbackHomeDir() {
    const envHome = process.env.HOME || process.env.USERPROFILE;
    if (typeof envHome === "string" && envHome.trim().length > 0) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(envHome);
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir();
}
function safeHomeDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    } catch  {
        return fallbackHomeDir();
    }
}
function normalizeConfiguredPath(dir) {
    if (typeof dir !== "string") return null;
    const trimmed = dir.trim();
    if (!trimmed) return null;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(trimmed);
}
function getLegacyDotDataDir() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(safeHomeDir(), `.${APP_NAME}`);
}
function getDefaultDataDir() {
    const homeDir = safeHomeDir();
    const legacyDir = getLegacyDotDataDir();
    // Preserve legacy path if it exists to avoid data loss on updates (e.g., Windows migration)
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(legacyDir)) {
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(legacyDir).isDirectory()) {
                return legacyDir;
            }
        } catch  {
        // Ignore stat errors
        }
    }
    if ("TURBOPACK compile-time truthy", 1) {
        const appData = process.env.APPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(homeDir, "AppData", "Roaming");
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(appData, APP_NAME);
    }
    //TURBOPACK unreachable
    ;
    // Support XDG on Linux/macOS when explicitly configured.
    const xdgConfigHome = undefined;
}
function resolveDataDir({ isCloud = false } = {}) {
    if (isCloud) return "/tmp";
    const configured = normalizeConfiguredPath(process.env.DATA_DIR);
    if (configured) return configured;
    return getDefaultDataDir();
}
function resolveWritableDataDir({ isCloud = false } = {}) {
    const resolved = resolveDataDir({
        isCloud
    });
    // Cloud/serverless never owns a writable home dir; leave its sentinel alone.
    if (isCloud) return resolved;
    // No explicit override → already the default user dir; nothing to fall back to.
    const configured = normalizeConfiguredPath(process.env.DATA_DIR);
    if (!configured) return resolved;
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(resolved, {
            recursive: true
        });
        return resolved;
    } catch (err) {
        const code = err?.code;
        if (code === "EACCES" || code === "EPERM") {
            const fallback = getDefaultDataDir();
            console.warn(`[DATA_DIR] '${resolved}' is not writable (${code}) → falling back to '${fallback}'`);
            return fallback;
        }
        throw err;
    }
}
function isSamePath(a, b) {
    if (!a || !b) return false;
    const normalizedA = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(a);
    const normalizedB = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(b);
    if ("TURBOPACK compile-time truthy", 1) {
        return normalizedA.toLowerCase() === normalizedB.toLowerCase();
    }
    //TURBOPACK unreachable
    ;
}
}),
"[project]/src/lib/combos/steps.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @file steps.ts
 * @description Combo step normalization helpers for model, combo-ref, provider-wildcard, and routing metadata.
 *
 * @changes
 * - [2026-07-25] [Composer] - Preserve provider-wildcard steps during combo normalization
 */ __turbopack_context__.s([
    "COMBO_SCHEMA_VERSION",
    ()=>COMBO_SCHEMA_VERSION,
    "getComboModelProvider",
    ()=>getComboModelProvider,
    "getComboModelString",
    ()=>getComboModelString,
    "getComboStepTarget",
    ()=>getComboStepTarget,
    "getComboStepWeight",
    ()=>getComboStepWeight,
    "normalizeComboModels",
    ()=>normalizeComboModels,
    "normalizeComboRecord",
    ()=>normalizeComboRecord,
    "normalizeComboStep",
    ()=>normalizeComboStep
]);
const COMBO_SCHEMA_VERSION = 2;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function toTrimmedString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function toWeight(value) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : 0;
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, parsed));
}
function collectComboNames(allCombos) {
    const names = new Set();
    if (!allCombos) return names;
    if (!Array.isArray(allCombos) && typeof allCombos[Symbol.iterator] === "function" && !(isRecord(allCombos) && Array.isArray(allCombos.combos))) {
        for (const value of allCombos){
            const name = toTrimmedString(value);
            if (name) names.add(name);
        }
        return names;
    }
    const combosFromRecord = isRecord(allCombos) && Array.isArray(allCombos.combos) ? allCombos.combos : [];
    const combos = Array.isArray(allCombos) ? allCombos : combosFromRecord;
    for (const combo of combos){
        const name = typeof combo === "string" ? toTrimmedString(combo) : toTrimmedString(combo?.name);
        if (name) names.add(name);
    }
    return names;
}
function parseProviderId(model) {
    const trimmed = model.trim();
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex <= 0) return null;
    const providerId = trimmed.slice(0, slashIndex).trim();
    return providerId.length > 0 ? providerId : null;
}
function parseProviderWildcardPattern(target) {
    const trimmed = target.trim();
    const slashIndex = trimmed.indexOf("/");
    if (slashIndex <= 0) return null;
    const providerId = trimmed.slice(0, slashIndex).trim();
    const modelPattern = trimmed.slice(slashIndex + 1).trim();
    if (!providerId || !modelPattern.includes("*")) return null;
    return {
        providerId,
        modelPattern
    };
}
function toFullModelString(model, providerId) {
    const trimmedModel = model.trim();
    if (trimmedModel.includes("/")) return trimmedModel;
    const normalizedProviderId = toTrimmedString(providerId);
    return normalizedProviderId ? `${normalizedProviderId}/${trimmedModel}` : trimmedModel;
}
function slugify(value) {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "step";
}
function buildStepId(kind, comboName, index, seed) {
    const kindSlug = kind === "combo-ref" ? "ref" : kind === "provider-wildcard" ? "wildcard" : "model";
    const parts = [
        slugify(comboName || "combo"),
        kindSlug,
        String(index + 1),
        slugify(seed)
    ];
    return parts.join("-").slice(0, 200);
}
function shouldTreatAsComboRef(target, providerId, options) {
    if (providerId) return false;
    const comboNames = collectComboNames(options.allCombos);
    return comboNames.has(target) || target === toTrimmedString(options.comboName);
}
function getComboStepWeight(value) {
    if (typeof value === "string") return 0;
    if (!isRecord(value)) return 0;
    return toWeight(value.weight);
}
function getComboModelString(value) {
    if (typeof value === "string") return toTrimmedString(value);
    if (!isRecord(value) || value.kind === "combo-ref") return null;
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    return toFullModelString(rawModel, providerId);
}
function getComboModelProvider(value) {
    if (typeof value === "string") return parseProviderId(value);
    if (!isRecord(value) || value.kind === "combo-ref") return null;
    return toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(toTrimmedString(value.model) || "");
}
function getComboStepTarget(value, options = {}) {
    if (typeof value === "string") {
        const target = toTrimmedString(value);
        if (!target) return null;
        return shouldTreatAsComboRef(target, null, options) ? target : target;
    }
    if (!isRecord(value)) return null;
    if (value.kind === "combo-ref") return toTrimmedString(value.comboName);
    if (value.kind === "provider-wildcard") {
        const providerId = toTrimmedString(value.providerId);
        const modelPattern = toTrimmedString(value.modelPattern) || "*";
        return providerId ? `${providerId}/${modelPattern}` : null;
    }
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const isExplicitModel = value.kind === "model";
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    if (!isExplicitModel && shouldTreatAsComboRef(rawModel, providerId, options)) {
        return rawModel;
    }
    return toFullModelString(rawModel, providerId);
}
function normalizeComboStep(value, options = {}) {
    const comboName = toTrimmedString(options.comboName);
    const index = typeof options.index === "number" ? options.index : 0;
    if (typeof value === "string") {
        const target = toTrimmedString(value);
        if (!target) return null;
        if (shouldTreatAsComboRef(target, null, options)) {
            return {
                id: buildStepId("combo-ref", comboName, index, target),
                kind: "combo-ref",
                comboName: target,
                weight: 0
            };
        }
        const wildcardPattern = parseProviderWildcardPattern(target);
        if (wildcardPattern) {
            return {
                id: buildStepId("provider-wildcard", comboName, index, `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}`),
                kind: "provider-wildcard",
                providerId: wildcardPattern.providerId,
                modelPattern: wildcardPattern.modelPattern,
                weight: 0
            };
        }
        const providerId = parseProviderId(target);
        return {
            id: buildStepId("model", comboName, index, target),
            kind: "model",
            model: target,
            ...providerId ? {
                providerId
            } : {},
            weight: 0
        };
    }
    if (!isRecord(value)) return null;
    const explicitId = toTrimmedString(value.id);
    const weight = toWeight(value.weight);
    const label = toTrimmedString(value.label);
    const prompt = toTrimmedString(value.prompt);
    if (value.kind === "combo-ref") {
        const comboRefName = toTrimmedString(value.comboName);
        if (!comboRefName) return null;
        return {
            id: explicitId || buildStepId("combo-ref", comboName, index, comboRefName),
            kind: "combo-ref",
            comboName: comboRefName,
            weight,
            ...label ? {
                label
            } : {}
        };
    }
    if (value.kind === "provider-wildcard") {
        const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(toTrimmedString(value.model) || "");
        if (!providerId) return null;
        const modelPattern = toTrimmedString(value.modelPattern) || "*";
        const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
        const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
        return {
            id: explicitId || buildStepId("provider-wildcard", comboName, index, connectionId ? `${providerId}/${modelPattern}:${connectionId}` : `${providerId}/${modelPattern}`),
            kind: "provider-wildcard",
            providerId,
            modelPattern,
            ...connectionId !== undefined ? {
                connectionId
            } : {},
            weight,
            ...label ? {
                label
            } : {},
            ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
                allowedConnectionIds
            } : {}
        };
    }
    const rawModel = toTrimmedString(value.model);
    if (!rawModel) return null;
    const isExplicitModel = value.kind === "model";
    const providerId = toTrimmedString(value.providerId) || toTrimmedString(value.provider) || parseProviderId(rawModel);
    const wildcardPattern = parseProviderWildcardPattern(rawModel);
    if (wildcardPattern) {
        const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
        const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
        return {
            id: explicitId || buildStepId("provider-wildcard", comboName, index, connectionId ? `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}:${connectionId}` : `${wildcardPattern.providerId}/${wildcardPattern.modelPattern}`),
            kind: "provider-wildcard",
            providerId: wildcardPattern.providerId,
            modelPattern: wildcardPattern.modelPattern,
            ...connectionId !== undefined ? {
                connectionId
            } : {},
            weight,
            ...label ? {
                label
            } : {},
            ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
                allowedConnectionIds
            } : {}
        };
    }
    if (!isExplicitModel && shouldTreatAsComboRef(rawModel, providerId, options)) {
        return {
            id: explicitId || buildStepId("combo-ref", comboName, index, rawModel),
            kind: "combo-ref",
            comboName: rawModel,
            weight,
            ...label ? {
                label
            } : {}
        };
    }
    const model = toFullModelString(rawModel, providerId);
    const connectionId = value.connectionId === null ? null : toTrimmedString(value.connectionId) || undefined;
    const tags = Array.isArray(value.tags) ? value.tags.map((tag)=>toTrimmedString(tag)).filter((tag)=>!!tag) : undefined;
    const allowedConnectionIds = Array.isArray(value.allowedConnectionIds) ? value.allowedConnectionIds.map((connId)=>toTrimmedString(connId)).filter((connId)=>!!connId) : undefined;
    return {
        id: explicitId || buildStepId("model", comboName, index, connectionId ? `${model}:${connectionId}` : model),
        kind: "model",
        model,
        ...providerId ? {
            providerId
        } : {},
        ...connectionId !== undefined ? {
            connectionId
        } : {},
        weight,
        ...label ? {
            label
        } : {},
        ...prompt ? {
            prompt
        } : {},
        ...tags && tags.length > 0 ? {
            tags
        } : {},
        ...allowedConnectionIds && allowedConnectionIds.length > 0 ? {
            allowedConnectionIds
        } : {}
    };
}
function normalizeComboModels(models, options = {}) {
    const list = Array.isArray(models) ? models : [];
    return list.map((value, index)=>normalizeComboStep(value, {
            ...options,
            index
        })).filter((value)=>value !== null);
}
function normalizeComboRecord(combo, options = {}) {
    const comboName = toTrimmedString(combo.name);
    return {
        ...combo,
        version: COMBO_SCHEMA_VERSION,
        models: normalizeComboModels(combo.models, {
            comboName,
            allCombos: options.allCombos
        })
    };
}
}),
"[project]/src/lib/combos/invariants.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ComboInvariantError",
    ()=>ComboInvariantError,
    "validateComboInvariant",
    ()=>validateComboInvariant
]);
class ComboInvariantError extends Error {
}
const FAMILY_PATTERNS = [
    [
        "gpt",
        /^gpt(?:-|$)/i
    ],
    [
        "claude",
        /^claude(?:-|$)/i
    ],
    [
        "gemini",
        /^gemini(?:-|$)/i
    ],
    [
        "glm",
        /^glm(?:-|$)/i
    ],
    [
        "kimi",
        /^kimi(?:-|$)/i
    ],
    [
        "llama",
        /^llama(?:-|$)/i
    ],
    [
        "minimax",
        /^minimax(?:-|$)/i
    ],
    [
        "mistral",
        /^(?:mistral|mixtral)(?:-|$)/i
    ]
];
function strings(value) {
    return Array.isArray(value) ? value.filter((item)=>typeof item === "string") : [];
}
function modelFamily(model) {
    const bare = model.slice(model.lastIndexOf("/") + 1);
    return FAMILY_PATTERNS.find(([, pattern])=>pattern.test(bare))?.[0] ?? null;
}
function validateComboInvariant(combo) {
    const invariant = combo.invariant && typeof combo.invariant === "object" && !Array.isArray(combo.invariant) ? combo.invariant : {};
    const providers = new Set([
        ...strings(combo.allowedProviders),
        ...strings(invariant.allowedProviders)
    ]);
    const families = new Set([
        ...strings(combo.allowedModelFamilies),
        ...strings(invariant.allowedModelFamilies)
    ]);
    if (providers.size === 0 && families.size === 0) return;
    const targets = Array.isArray(combo.models) ? combo.models : [];
    targets.forEach((value, index)=>{
        if (!value || typeof value !== "object" || Array.isArray(value)) return;
        const target = value;
        if (target.kind === "combo-ref") return;
        const model = typeof target.model === "string" ? target.model : "";
        const provider = typeof target.providerId === "string" ? target.providerId : typeof target.provider === "string" ? target.provider : model.includes("/") ? model.slice(0, model.indexOf("/")) : "";
        const family = modelFamily(model);
        if (providers.size > 0 && !providers.has(provider) || families.size > 0 && (!family || !families.has(family))) {
            const targetName = model.includes("/") ? model : `${provider}/${model}`;
            throw new ComboInvariantError(`Combo "${String(combo.name ?? "unnamed")}" target ${index + 1} (${targetName}) violates its invariant`);
        }
    });
}
}),
"[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizePII",
    ()=>sanitizePII,
    "sanitizePIIChunk",
    ()=>sanitizePIIChunk,
    "sanitizePIIResponse",
    ()=>sanitizePIIResponse
]);
/**
 * Output PII Sanitization — L-3
 *
 * Scans LLM response text for PII patterns and optionally redacts them.
 * This is the OUTPUT-side counterpart to the input sanitizer.
 * Configurable via environment variables:
 *
 *   PII_RESPONSE_SANITIZATION=true|false  (default: false)
 *   PII_RESPONSE_SANITIZATION_MODE=redact|warn|block  (default: redact)
 *
 * @module lib/piiSanitizer
 */ // ── Configuration ──
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [instrumentation] (ecmascript)");
;
const isEnabled = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PII_RESPONSE_SANITIZATION");
const VALID_MODES = [
    "redact",
    "warn",
    "block",
    "off"
];
const getMode = ()=>{
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])("PII_RESPONSE_SANITIZATION_MODE");
    if (value === "" || value === undefined || value === null) return "redact";
    if (String(value) === "false") return "off";
    if (VALID_MODES.includes(value)) return value;
    console.error(`[PII] Invalid PII_RESPONSE_SANITIZATION_MODE: "${value}", defaulting to "redact"`);
    return "redact";
};
const PII_PATTERNS = [
    {
        name: "email",
        regex: /(?<=^|[^A-Za-z0-9])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?=$|[^A-Za-z0-9])/g,
        replacement: "[EMAIL_REDACTED]",
        severity: "medium"
    },
    {
        name: "ssn",
        regex: /(?<=^|[^A-Za-z0-9])\d{3}-\d{2}-\d{4}(?=$|[^A-Za-z0-9])/g,
        replacement: "[SSN_REDACTED]",
        severity: "high"
    },
    {
        name: "credit_card",
        regex: /(?<=^|[^A-Za-z0-9])(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{6}[-\s]?\d{4,5})(?=$|[^A-Za-z0-9])/g,
        replacement: "[CC_REDACTED]",
        severity: "high"
    },
    {
        name: "phone_us",
        regex: /(?<=^|[^A-Za-z0-9])(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?=$|[^A-Za-z0-9])/g,
        replacement: "[PHONE_REDACTED]",
        severity: "medium"
    },
    {
        name: "phone_br",
        regex: /(?<=^|[^A-Za-z0-9])(?:\+?55[-.\s]?)?\(?\d{2}\)?[-.\s]?(?:9\d{4}|[2-5]\d{3})[-.\s]?\d{4}(?=$|[^A-Za-z0-9])/g,
        replacement: "[PHONE_REDACTED]",
        severity: "medium"
    },
    {
        name: "cpf",
        regex: /(?<=^|[^A-Za-z0-9])\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?=$|[^A-Za-z0-9])/g,
        replacement: "[CPF_REDACTED]",
        severity: "high"
    },
    {
        name: "cnpj",
        regex: /(?<=^|[^A-Za-z0-9])\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}(?=$|[^A-Za-z0-9])/g,
        replacement: "[CNPJ_REDACTED]",
        severity: "high"
    },
    {
        name: "ip_address",
        regex: /(?<=^|[^A-Za-z0-9])(?:\d{1,3}\.){3}\d{1,3}(?=$|[^A-Za-z0-9])/g,
        replacement: "[IP_REDACTED]",
        severity: "low"
    },
    {
        name: "ipv6_address",
        regex: /(?<=^|[^A-Za-z0-9:])(?:[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){7}|(?:[0-9a-fA-F]{1,4}:){1,7}:|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|::|[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){2}:(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){3}:(?:[0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){4}:(?:[0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){5}:(?:[0-9a-fA-F]{1,4}:){0,1}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){6}:[0-9a-fA-F]{1,4})(?=$|[^A-Za-z0-9])(?!:[0-9a-fA-F:])/g,
        replacement: "[IP_REDACTED]",
        severity: "low"
    },
    {
        name: "aws_key",
        regex: /(?<=^|[^A-Za-z0-9])AKIA[0-9A-Z]{16}(?=$|[^A-Za-z0-9])/g,
        replacement: "[AWS_KEY_REDACTED]",
        severity: "high"
    },
    {
        name: "api_key_generic",
        regex: /(?<=^|[^A-Za-z0-9])(?:sk|pk|api|key|token)[_-][a-zA-Z0-9]{20,}(?=$|[^A-Za-z0-9])/gi,
        replacement: "[API_KEY_REDACTED]",
        severity: "high"
    }
];
function sanitizePII(text, isStreaming = false) {
    if (!isEnabled() || !text || typeof text !== "string") {
        return {
            text,
            detections: [],
            redacted: false
        };
    }
    const mode = getMode();
    const detections = [];
    // Build a map of clean character index to original character index.
    // Ignore zero-width and invisible formatting characters to prevent obfuscation bypasses.
    const IGNORED_CHARS = new Set([
        "\u200B",
        "\u200C",
        "\u200D",
        "\u200E",
        "\u200F",
        "\uFEFF",
        "\u2060",
        "\u00AD",
        // Bidirectional formatting controls
        "\u202A",
        "\u202B",
        "\u202C",
        "\u202D",
        "\u202E",
        "\u2066",
        "\u2067",
        "\u2068",
        "\u2069"
    ]);
    const cleanToOrig = [];
    let cleanText = "";
    for(let i = 0; i < text.length; i++){
        const char = text[i];
        if (IGNORED_CHARS.has(char)) {
        // Obfuscator / joiner, ignore in clean text
        } else {
            cleanToOrig.push(i);
            cleanText += char;
        }
    }
    cleanToOrig.push(text.length);
    const ranges = [];
    let endMatchIndex = undefined;
    for (const pattern of PII_PATTERNS){
        pattern.regex.lastIndex = 0;
        let match;
        while((match = pattern.regex.exec(cleanText)) !== null){
            const cleanStart = match.index;
            const cleanEnd = cleanStart + match[0].length;
            const start = cleanToOrig[cleanStart];
            const end = cleanToOrig[cleanEnd];
            // Perform checksum validation to minimize false positives
            if (pattern.name === "credit_card" && !isValidLuhn(match[0].replace(/[-\s]/g, ""))) {
                continue;
            }
            if (pattern.name === "cpf" && !isValidCPF(match[0])) {
                continue;
            }
            if (pattern.name === "cnpj" && !isValidCNPJ(match[0])) {
                continue;
            }
            if (isStreaming && cleanEnd === cleanText.length) {
                // Prevent premature redaction of variable-length PII touching the end of the streaming buffer.
                // Clamp maximum match length to 100 to prevent infinite buffer accumulation (OOM).
                const matchLength = cleanEnd - cleanStart;
                if (matchLength < 100) {
                    if (endMatchIndex === undefined || start < endMatchIndex) {
                        endMatchIndex = start;
                    }
                }
            } else {
                ranges.push({
                    start,
                    end,
                    replacement: pattern.replacement,
                    pattern: pattern.name
                });
            }
            if (!pattern.regex.global) {
                break;
            }
        }
    }
    const patternCounts = new Map();
    for (const range of ranges){
        patternCounts.set(range.pattern, (patternCounts.get(range.pattern) || 0) + 1);
    }
    for (const [name, count] of patternCounts.entries()){
        const patternDef = PII_PATTERNS.find((p)=>p.name === name);
        detections.push({
            pattern: name,
            count,
            severity: patternDef?.severity || "medium"
        });
    }
    if (detections.length > 0) {
        if (mode === "warn") {
            console.warn(`[PII] Detected PII in response: ${detections.map((d)=>`${d.pattern}(${d.count})`).join(", ")}`);
        } else if (mode === "block") {
            // Log the matched pattern types server-side, but never put them in the
            // thrown message — it can surface to the client via controller.error
            // (Hard Rule #12: no internal detail in response/stream errors).
            console.warn(`[PII] Blocked response due to PII detection: ${detections.map((d)=>d.pattern).join(", ")}`);
            throw new Error("[PII] Blocked response due to PII detection");
        }
    }
    let sanitized = text;
    if (mode === "redact" && ranges.length > 0) {
        // Sort ranges from right to left to avoid shifting offsets
        ranges.sort((a, b)=>b.start - a.start);
        // Merge overlapping or adjacent ranges
        const mergedRanges = [];
        for (const r of ranges){
            if (mergedRanges.length === 0) {
                mergedRanges.push(r);
            } else {
                const last = mergedRanges[mergedRanges.length - 1];
                if (r.end >= last.start) {
                    last.start = Math.min(r.start, last.start);
                    last.end = Math.max(r.end, last.end);
                } else {
                    mergedRanges.push(r);
                }
            }
        }
        for (const range of mergedRanges){
            sanitized = sanitized.slice(0, range.start) + range.replacement + sanitized.slice(range.end);
        }
    }
    return {
        text: mode === "redact" ? sanitized : text,
        detections,
        redacted: mode === "redact" && detections.length > 0,
        endMatchIndex
    };
}
function sanitizePIIChunk(chunk, isStopSignal = false) {
    if (!isEnabled()) return chunk;
    // If it's a stop signal, we are flushing the final chunk, so we shouldn't treat it as a partial streaming buffer (force redaction)
    const { text } = sanitizePII(chunk, !isStopSignal);
    return text;
}
function sanitizePIIResponse(response) {
    if (!isEnabled() || !response) return response;
    try {
        const visited = new WeakSet();
        // Deep sanitize the entire response object recursively
        const deepSanitize = (obj, depth = 0)=>{
            if (depth > 100) {
                throw new Error("Maximum sanitization depth exceeded");
            }
            if (!obj) return obj;
            if (typeof obj === "string") {
                return sanitizePII(obj).text;
            }
            if (typeof obj === "object") {
                if (visited.has(obj)) {
                    return "[CIRCULAR_REFERENCE_REDACTED]";
                }
                visited.add(obj);
                if (Array.isArray(obj)) {
                    for(let i = 0; i < obj.length; i++){
                        obj[i] = deepSanitize(obj[i], depth + 1);
                    }
                } else {
                    for (const key of Object.keys(obj)){
                        // Skip known non-PII system metadata keys to optimize performance
                        if ([
                            "id",
                            "model",
                            "object",
                            "created",
                            "finish_reason",
                            "finishReason",
                            "role",
                            "type",
                            "index",
                            "stop_reason"
                        ].includes(key)) {
                            continue;
                        }
                        obj[key] = deepSanitize(obj[key], depth + 1);
                    }
                }
            }
            return obj;
        };
        return deepSanitize(response);
    } catch (err) {
        if (err?.message?.startsWith("[PII] Blocked response")) {
            throw err;
        }
        // Fail secure — try raw string sanitization instead of failing open
        try {
            const serialized = JSON.stringify(response);
            const { text: sanitized } = sanitizePII(serialized);
            return JSON.parse(sanitized);
        } catch (fallbackErr) {
            // Suppress err.message — never surface upstream error detail to the client
            // (Hard Rule #12). The underlying error is available in server logs.
            console.warn("[PII] Sanitization fallback failed:", err?.message);
            throw new Error("[PII] Blocked response due to sanitization failure");
        }
    }
}
// ── Checksum Validation Helpers ──
function isValidLuhn(digits) {
    let sum = 0;
    let shouldDouble = false;
    for(let i = digits.length - 1; i >= 0; i--){
        let digit = parseInt(digits[i], 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
function isValidCPF(cpf) {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for(let i = 0; i < 9; i++){
        sum += parseInt(digits[i], 10) * (10 - i);
    }
    let rev = 11 - sum % 11;
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(digits[9], 10)) return false;
    sum = 0;
    for(let i = 0; i < 10; i++){
        sum += parseInt(digits[i], 10) * (11 - i);
    }
    rev = 11 - sum % 11;
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(digits[10], 10)) return false;
    return true;
}
function isValidCNPJ(cnpj) {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;
    let size = 12;
    let numbers = digits.substring(0, size);
    const tempDigits = digits.substring(size);
    let sum = 0;
    let pos = size - 7;
    for(let i = size; i >= 1; i--){
        sum += parseInt(numbers.charAt(size - i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(tempDigits.charAt(0), 10)) return false;
    size = 13;
    numbers = digits.substring(0, size);
    sum = 0;
    pos = size - 7;
    for(let i = size; i >= 1; i--){
        sum += parseInt(numbers.charAt(size - i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(tempDigits.charAt(1), 10)) return false;
    return true;
}
}),
"[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloneLogPayload",
    ()=>cloneLogPayload,
    "normalizePayloadForLog",
    ()=>normalizePayloadForLog,
    "parseStoredPayload",
    ()=>parseStoredPayload,
    "protectPayloadForLog",
    ()=>protectPayloadForLog,
    "redactPayload",
    ()=>redactPayload,
    "sanitizePayloadPII",
    ()=>sanitizePayloadPII,
    "serializePayloadForStorage",
    ()=>serializePayloadForStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
;
const SENSITIVE_KEYS = new Set([
    "api_key",
    "apiKey",
    "api-key",
    "authorization",
    "Authorization",
    "x-api-key",
    "X-Api-Key",
    "x-goog-api-key",
    "access_token",
    "accessToken",
    "refresh_token",
    "refreshToken",
    "password",
    "secret",
    "token"
]);
/**
 * True for any binary/opaque byte view (Uint8Array, Buffer, DataView, other
 * typed arrays). `Array.isArray()` returns false for these, so callers that
 * branch on it before recursing would otherwise fall into the generic-object
 * branch and enumerate one JS property key per decoded byte (#7297).
 */ function isOpaqueBinary(value) {
    return ArrayBuffer.isView(value);
}
function describeOpaqueBinary(value) {
    const byteLength = value.byteLength;
    return `[binary ${byteLength} bytes]`;
}
function cloneLogPayload(value) {
    if (value === null || value === undefined) return value;
    if (typeof globalThis.structuredClone === "function") {
        return globalThis.structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}
function normalizePayloadForLog(payload) {
    if (typeof payload !== "string") return payload;
    const trimmed = payload.trim();
    if (!trimmed) return "";
    try {
        return JSON.parse(trimmed);
    } catch  {
        return {
            _rawText: payload
        };
    }
}
function redactPayload(payload) {
    if (!payload || typeof payload !== "object") return payload;
    if (isOpaqueBinary(payload)) return describeOpaqueBinary(payload);
    if (Array.isArray(payload)) return payload.map(redactPayload);
    const redacted = {};
    for (const [key, value] of Object.entries(payload)){
        if (SENSITIVE_KEYS.has(key)) {
            redacted[key] = "[REDACTED]";
        } else if (typeof value === "string" && value.startsWith("Bearer ")) {
            redacted[key] = "Bearer [REDACTED]";
        } else if (typeof value === "object" && value !== null) {
            redacted[key] = redactPayload(value);
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}
function sanitizePayloadPII(payload) {
    if (typeof payload === "string") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(payload).text;
    }
    if (!payload || typeof payload !== "object") {
        return payload;
    }
    if (isOpaqueBinary(payload)) {
        return describeOpaqueBinary(payload);
    }
    if (Array.isArray(payload)) {
        return payload.map(sanitizePayloadPII);
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(payload)){
        sanitized[key] = sanitizePayloadPII(value);
    }
    return sanitized;
}
function protectPayloadForLog(payload) {
    if (payload === null || payload === undefined) return null;
    const normalized = normalizePayloadForLog(payload);
    const piiSanitized = sanitizePayloadPII(normalized);
    return redactPayload(piiSanitized);
}
function serializePayloadForStorage(payload, maxLength = 65536) {
    if (payload === null || payload === undefined) return null;
    const exact = JSON.stringify(payload);
    if (exact.length <= maxLength) {
        return exact;
    }
    return JSON.stringify({
        _truncated: true,
        _originalSize: exact.length,
        _preview: exact.slice(0, maxLength)
    });
}
function parseStoredPayload(value) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return {
            _rawText: value
        };
    }
}
}),
"[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAppLogFilePath",
    ()=>getAppLogFilePath,
    "getAppLogFormat",
    ()=>getAppLogFormat,
    "getAppLogLevel",
    ()=>getAppLogLevel,
    "getAppLogMaxFileSize",
    ()=>getAppLogMaxFileSize,
    "getAppLogMaxFiles",
    ()=>getAppLogMaxFiles,
    "getAppLogRetentionDays",
    ()=>getAppLogRetentionDays,
    "getAppLogRetentionDaysOverride",
    ()=>getAppLogRetentionDaysOverride,
    "getAppLogToFile",
    ()=>getAppLogToFile,
    "getCallLogMaxEntries",
    ()=>getCallLogMaxEntries,
    "getCallLogPipelineCaptureStreamChunks",
    ()=>getCallLogPipelineCaptureStreamChunks,
    "getCallLogPipelineMaxSizeBytes",
    ()=>getCallLogPipelineMaxSizeBytes,
    "getCallLogRetentionDays",
    ()=>getCallLogRetentionDays,
    "getCallLogRetentionDaysOverride",
    ()=>getCallLogRetentionDaysOverride,
    "getCallLogsTableMaxRows",
    ()=>getCallLogsTableMaxRows,
    "getChatLogArrayTailItems",
    ()=>getChatLogArrayTailItems,
    "getChatLogMaxDepth",
    ()=>getChatLogMaxDepth,
    "getChatLogMaxObjectKeys",
    ()=>getChatLogMaxObjectKeys,
    "getChatLogTextLimit",
    ()=>getChatLogTextLimit,
    "getProxyLogsTableMaxRows",
    ()=>getProxyLogsTableMaxRows,
    "isChatDebugFileEnabled",
    ()=>isChatDebugFileEnabled,
    "parseFileSize",
    ()=>parseFileSize
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_APP_LOG_RETENTION_DAYS = 7;
const DEFAULT_CALL_LOG_RETENTION_DAYS = 7;
const DEFAULT_APP_LOG_MAX_SIZE = 50 * 1024 * 1024;
const DEFAULT_APP_LOG_MAX_FILES = 20;
const DEFAULT_CALL_LOG_MAX_ENTRIES = 10000;
const DEFAULT_CALL_LOGS_TABLE_MAX_ROWS = 100000;
const DEFAULT_CALL_LOG_PIPELINE_MAX_SIZE_KB = 512;
const DEFAULT_PROXY_LOGS_TABLE_MAX_ROWS = 100000;
/**
 * Default app log path, anchored to DATA_DIR (never `process.cwd()`).
 *
 * The globally-installed CLI runs from an arbitrary working directory, so anchoring
 * the default to cwd made file logging silently no-op under an unrelated directory
 * (#6197). Computed lazily so a per-process/per-test `DATA_DIR` override is honoured
 * (the env var is read at call time, not at module load). Uses the pure
 * `resolveDataDir()` resolver — no directory creation side effects in a path getter.
 */ function getDefaultAppLogPath() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "logs", "application", "app.log");
}
function parsePositiveInt(value, fallback) {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function parseNonNegativeInt(value, fallback) {
    if (value === undefined || value === "") return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
function parseBoolean(value, fallback) {
    if (!value) return fallback;
    const normalized = value.trim().toLowerCase();
    if ([
        "1",
        "true",
        "yes",
        "on"
    ].includes(normalized)) return true;
    if ([
        "0",
        "false",
        "no",
        "off"
    ].includes(normalized)) return false;
    return fallback;
}
function parseFileSize(raw) {
    if (!raw) return DEFAULT_APP_LOG_MAX_SIZE;
    const match = raw.match(/^(\d+)\s*(k|m|g|kb|mb|gb)?$/i);
    if (!match) return DEFAULT_APP_LOG_MAX_SIZE;
    const num = parseInt(match[1], 10);
    const unit = (match[2] || "").toLowerCase();
    switch(unit){
        case "k":
        case "kb":
            return num * 1024;
        case "m":
        case "mb":
            return num * 1024 * 1024;
        case "g":
        case "gb":
            return num * 1024 * 1024 * 1024;
        default:
            return num;
    }
}
function getAppLogToFile() {
    return process.env.APP_LOG_TO_FILE !== "false";
}
function getAppLogFilePath() {
    return process.env.APP_LOG_FILE_PATH || getDefaultAppLogPath();
}
function getAppLogMaxFileSize() {
    return parseFileSize(process.env.APP_LOG_MAX_FILE_SIZE);
}
function getAppLogRetentionDays() {
    return parsePositiveInt(process.env.APP_LOG_RETENTION_DAYS, DEFAULT_APP_LOG_RETENTION_DAYS);
}
function getCallLogRetentionDays() {
    return parsePositiveInt(process.env.CALL_LOG_RETENTION_DAYS, DEFAULT_CALL_LOG_RETENTION_DAYS);
}
/**
 * Returns the explicit operator-set retention override (a positive integer), or `null`
 * when the env var is unset/empty/invalid. Callers give an explicit env var precedence
 * over the dashboard's database retention, while falling back to the dashboard (not the
 * hardcoded 7-day default) when the operator did not set the env var. (#4354)
 */ function parsePositiveIntOrNull(value) {
    if (value === undefined || value === "") return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function getAppLogRetentionDaysOverride() {
    return parsePositiveIntOrNull(process.env.APP_LOG_RETENTION_DAYS);
}
function getCallLogRetentionDaysOverride() {
    return parsePositiveIntOrNull(process.env.CALL_LOG_RETENTION_DAYS);
}
function getAppLogMaxFiles() {
    return parsePositiveInt(process.env.APP_LOG_MAX_FILES, DEFAULT_APP_LOG_MAX_FILES);
}
function getCallLogMaxEntries() {
    return parsePositiveInt(process.env.CALL_LOG_MAX_ENTRIES, DEFAULT_CALL_LOG_MAX_ENTRIES);
}
function getCallLogsTableMaxRows() {
    return parsePositiveInt(process.env.CALL_LOGS_TABLE_MAX_ROWS, DEFAULT_CALL_LOGS_TABLE_MAX_ROWS);
}
function getCallLogPipelineCaptureStreamChunks() {
    return parseBoolean(process.env.CALL_LOG_PIPELINE_CAPTURE_STREAM_CHUNKS, true);
}
function getCallLogPipelineMaxSizeBytes() {
    return parsePositiveInt(process.env.CALL_LOG_PIPELINE_MAX_SIZE_KB, DEFAULT_CALL_LOG_PIPELINE_MAX_SIZE_KB) * 1024;
}
function getProxyLogsTableMaxRows() {
    return parsePositiveInt(process.env.PROXY_LOGS_TABLE_MAX_ROWS, DEFAULT_PROXY_LOGS_TABLE_MAX_ROWS);
}
function getAppLogLevel(defaultLevel) {
    return process.env.APP_LOG_LEVEL || defaultLevel;
}
function getAppLogFormat(defaultFormat) {
    return process.env.APP_LOG_FORMAT || defaultFormat;
}
function getChatLogTextLimit() {
    return parsePositiveInt(process.env.CHAT_LOG_TEXT_LIMIT, 64 * 1024);
}
function getChatLogArrayTailItems() {
    return parsePositiveInt(process.env.CHAT_LOG_ARRAY_TAIL_ITEMS, 24);
}
function getChatLogMaxDepth() {
    return parsePositiveInt(process.env.CHAT_LOG_MAX_DEPTH, 6);
}
function getChatLogMaxObjectKeys() {
    return parseNonNegativeInt(process.env.CHAT_LOG_MAX_OBJECT_KEYS, 80);
}
function isChatDebugFileEnabled() {
    if (parseBoolean(process.env.CHAT_DEBUG_FILE, false)) return true;
    return process.env.APP_LOG_LEVEL?.trim().toLowerCase() === "debug";
}
}),
"[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CALL_LOGS_DIR",
    ()=>CALL_LOGS_DIR,
    "MAX_CALL_LOG_ARTIFACT_BYTES",
    ()=>MAX_CALL_LOG_ARTIFACT_BYTES,
    "buildArtifactRelativePath",
    ()=>buildArtifactRelativePath,
    "cleanupEmptyCallLogDirs",
    ()=>cleanupEmptyCallLogDirs,
    "deleteCallArtifact",
    ()=>deleteCallArtifact,
    "listCallLogArtifactFiles",
    ()=>listCallLogArtifactFiles,
    "purgeCallLogArtifactDirectory",
    ()=>purgeCallLogArtifactDirectory,
    "readCallArtifact",
    ()=>readCallArtifact,
    "writeCallArtifact",
    ()=>writeCallArtifact
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
;
;
;
const isCloud = typeof globalThis.caches === "object" && globalThis.caches !== null;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const DATA_DIR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])({
    isCloud
});
const CALL_LOGS_DIR = isCloud ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(DATA_DIR, "call_logs");
const MAX_CALL_LOG_ARTIFACT_BYTES = 512 * 1024;
const SIZE_LIMIT_EXCEEDED_REASON = "call_log_artifact_size_limit_exceeded";
const OMITTED_FOR_SIZE_LIMIT = "[omitted: call log artifact size limit exceeded]";
const STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT = "[stream chunks omitted: call log artifact size limit exceeded]";
function buildArtifactRelativePath(timestamp, id) {
    const parsed = new Date(timestamp);
    const safeTimestamp = (Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()).replace(/[:]/g, "-");
    const dateFolder = safeTimestamp.slice(0, 10);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].posix.join(dateFolder, `${safeTimestamp}_${id}.json`);
}
function computeArtifactChecksum(serialized) {
    const bytes = Buffer.from(serialized);
    let hash = 0x811c9dc5;
    for (const byte of bytes){
        hash ^= byte;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}
function truncateArtifactForStorage(artifact) {
    const pipeline = artifact.pipeline;
    if (!pipeline?.streamChunks) return artifact;
    return {
        ...artifact,
        pipeline: {
            ...pipeline,
            streamChunks: {
                provider: pipeline.streamChunks.provider?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined,
                openai: pipeline.streamChunks.openai?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined,
                client: pipeline.streamChunks.client?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined
            }
        }
    };
}
function omitOversizedPipeline(artifact) {
    if (!artifact.pipeline) return artifact;
    return {
        ...artifact,
        pipeline: {
            error: {
                _omniroute_truncated: true,
                reason: SIZE_LIMIT_EXCEEDED_REASON
            }
        }
    };
}
function getArtifactMaxBytes(artifact) {
    return artifact.pipeline ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogPipelineMaxSizeBytes"])() : MAX_CALL_LOG_ARTIFACT_BYTES;
}
function buildMinimalArtifactForSizeLimit(artifact) {
    return {
        schemaVersion: artifact.schemaVersion,
        summary: artifact.summary,
        requestBody: OMITTED_FOR_SIZE_LIMIT,
        responseBody: OMITTED_FOR_SIZE_LIMIT,
        error: artifact.error ? OMITTED_FOR_SIZE_LIMIT : null,
        pipeline: {
            error: {
                _omniroute_truncated: true,
                reason: SIZE_LIMIT_EXCEEDED_REASON
            }
        }
    };
}
function serializeFinalSizeLimitFallback(artifact, maxBytes) {
    const withSummary = JSON.stringify(buildMinimalArtifactForSizeLimit(artifact));
    if (Buffer.byteLength(withSummary) <= maxBytes) {
        return withSummary;
    }
    return JSON.stringify({
        schemaVersion: artifact.schemaVersion,
        _omniroute_truncated: true,
        reason: SIZE_LIMIT_EXCEEDED_REASON
    });
}
function serializeArtifactForStorage(artifact) {
    // Debug mode: write full untruncated payload
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isChatDebugFileEnabled"])()) {
        return JSON.stringify(artifact, null, 2);
    }
    const maxBytes = getArtifactMaxBytes(artifact);
    // Single-pass, non-pretty serialization on the hot path. Artifacts are machine-read via
    // JSON.parse (readCallArtifact), so pretty-printing only doubled the bytes and CPU of
    // serializing large request/response bodies on every request — a contributor to the
    // CPU-runaway. The debug path above keeps pretty output for human inspection.
    const serialized = JSON.stringify(artifact);
    if (Buffer.byteLength(serialized) <= maxBytes) {
        return serialized;
    }
    const truncated = JSON.stringify(truncateArtifactForStorage(artifact));
    if (Buffer.byteLength(truncated) <= maxBytes) {
        return truncated;
    }
    const withoutPipeline = JSON.stringify(omitOversizedPipeline(artifact));
    if (Buffer.byteLength(withoutPipeline) <= maxBytes) {
        return withoutPipeline;
    }
    const minimal = JSON.stringify({
        ...omitOversizedPipeline(artifact),
        requestBody: OMITTED_FOR_SIZE_LIMIT,
        responseBody: OMITTED_FOR_SIZE_LIMIT,
        error: artifact.error ? OMITTED_FOR_SIZE_LIMIT : null
    });
    if (Buffer.byteLength(minimal) <= maxBytes) {
        return minimal;
    }
    return serializeFinalSizeLimitFallback(artifact, maxBytes);
}
function writeCallArtifact(artifact, relativePath = buildArtifactRelativePath(artifact.summary.timestamp, artifact.summary.id)) {
    if (!CALL_LOGS_DIR || isBuildPhase) return null;
    const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
    const tmpPath = `${absPath}.${process.pid}.${Date.now()}.tmp`;
    try {
        const serialized = serializeArtifactForStorage(artifact);
        const sizeBytes = Buffer.byteLength(serialized);
        // Keep the legacy field name for storage compatibility, but use a non-cryptographic checksum
        // so artifact bookkeeping is not treated as password hashing by static analysis.
        const fileChecksum = computeArtifactChecksum(serialized);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(absPath), {
            recursive: true
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(tmpPath, serialized);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].renameSync(tmpPath, absPath);
        return {
            relPath: relativePath,
            sizeBytes,
            sha256: fileChecksum
        };
    } catch (error) {
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(tmpPath, {
                force: true
            });
        } catch  {
        // Best effort cleanup only.
        }
        console.error("[callLogs] Failed to write request artifact:", error.message);
        return null;
    }
}
function readCallArtifact(relativePath) {
    if (!CALL_LOGS_DIR || !relativePath) {
        return {
            artifact: null,
            state: "missing"
        };
    }
    try {
        const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(absPath)) {
            return {
                artifact: null,
                state: "missing"
            };
        }
        return {
            artifact: JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(absPath, "utf8")),
            state: "ready"
        };
    } catch (error) {
        console.error("[callLogs] Failed to read request artifact:", error.message);
        return {
            artifact: null,
            state: "corrupt"
        };
    }
}
function deleteCallArtifact(relativePath) {
    if (!CALL_LOGS_DIR || !relativePath) return false;
    try {
        const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(absPath)) return false;
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(absPath, {
            force: true
        });
        return true;
    } catch  {
        return false;
    }
}
function cleanupEmptyCallLogDirs(baseDir = CALL_LOGS_DIR) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return;
    try {
        for (const entry of __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(baseDir)){
            const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(baseDir, entry);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(entryPath);
            if (!stat.isDirectory()) continue;
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(entryPath).length === 0) {
                __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(entryPath, {
                    recursive: true,
                    force: true
                });
            }
        }
    } catch  {
    // Best effort only.
    }
}
function listCallLogArtifactFiles(baseDir = CALL_LOGS_DIR) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return [];
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(baseDir).flatMap((entry)=>{
        const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(baseDir, entry);
        try {
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(entryPath);
            if (!stat.isDirectory()) return [];
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(entryPath).filter((file)=>file.endsWith(".json")).map((file)=>{
                const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(entryPath, file);
                const fileStat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(absPath);
                return {
                    relativePath: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].posix.join(entry, file),
                    absPath,
                    mtimeMs: fileStat.mtimeMs
                };
            });
        } catch  {
            return [];
        }
    }).sort((a, b)=>b.mtimeMs - a.mtimeMs);
}
function purgeCallLogArtifactDirectory(baseDir = CALL_LOGS_DIR) {
    const result = {
        deletedArtifacts: 0,
        errors: 0
    };
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return result;
    try {
        result.deletedArtifacts = listCallLogArtifactFiles(baseDir).length;
    } catch  {
        result.deletedArtifacts = 0;
    }
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(baseDir, {
            recursive: true,
            force: true
        });
    } catch (error) {
        console.error("[callLogArtifacts] Failed to purge call log artifacts:", error);
        result.deletedArtifacts = 0;
        result.errors++;
    }
    return result;
}
}),
"[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveImportedUsageAccountIdentity",
    ()=>resolveImportedUsageAccountIdentity,
    "resolveOrphanedUsageAccountIdentity",
    ()=>resolveOrphanedUsageAccountIdentity,
    "resolveUsageAccountIdentity",
    ()=>resolveUsageAccountIdentity
]);
function identityString(value) {
    return typeof value === "string" && value ? value : null;
}
function displayString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function sanePriority(value) {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 4 ? value : null;
}
function toProviderSpecificData(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function resolveUsageAccountIdentity(connection) {
    const provider = identityString(connection?.provider) || "unknown";
    const connectionId = identityString(connection?.id) || "unknown";
    const authType = identityString(connection?.authType ?? connection?.auth_type);
    const email = identityString(connection?.email);
    const providerSpecificData = toProviderSpecificData(connection?.providerSpecificData ?? connection?.provider_specific_data);
    const workspaceId = identityString(providerSpecificData.workspaceId);
    const chatgptUserId = identityString(providerSpecificData.chatgptUserId);
    const username = identityString(providerSpecificData.username);
    let identityParts;
    if (authType === "oauth" && provider === "codex" && workspaceId && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && workspaceId && email) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "email",
            email
        ];
    } else if (authType === "oauth" && provider !== "codex" && email) {
        identityParts = username ? [
            "oauth",
            provider,
            "email",
            email,
            "username",
            username
        ] : [
            "oauth",
            provider,
            "email",
            email
        ];
    } else {
        identityParts = [
            "connection",
            provider,
            connectionId
        ];
    }
    const displayName = displayString(connection?.displayName ?? connection?.display_name);
    const displayEmail = displayString(connection?.email);
    const name = displayString(connection?.name);
    const id = displayString(connection?.id);
    return {
        accountKey: JSON.stringify(identityParts),
        accountLabel: displayName || displayEmail || name || id || "unknown",
        accountLabelPriority: displayName ? 4 : displayEmail ? 3 : name ? 2 : id ? 1 : 0
    };
}
function resolveOrphanedUsageAccountIdentity(provider, connectionId) {
    return resolveUsageAccountIdentity({
        provider,
        id: connectionId
    });
}
function resolveImportedUsageAccountIdentity(row, fallback) {
    return {
        accountKey: identityString(row.account_key ?? row.accountKey) || fallback.accountKey,
        accountLabel: displayString(row.account_label ?? row.accountLabel) || fallback.accountLabel,
        accountLabelPriority: sanePriority(row.account_label_priority ?? row.accountLabelPriority) ?? fallback.accountLabelPriority
    };
}
}),
"[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITLAB_DUO_DEFAULT_BASE_URL",
    ()=>GITLAB_DUO_DEFAULT_BASE_URL,
    "buildGitLabDirectGatewayUrl",
    ()=>buildGitLabDirectGatewayUrl,
    "buildGitLabOAuthEndpoints",
    ()=>buildGitLabOAuthEndpoints,
    "getCachedGitLabDirectAccess",
    ()=>getCachedGitLabDirectAccess,
    "isGitLabDirectAccessDisabled",
    ()=>isGitLabDirectAccessDisabled,
    "normalizeGitLabBaseUrl",
    ()=>normalizeGitLabBaseUrl,
    "parseGitLabDirectAccessDetails",
    ()=>parseGitLabDirectAccessDetails,
    "resolveGitLabOAuthBaseUrl",
    ()=>resolveGitLabOAuthBaseUrl
]);
const GITLAB_DUO_DEFAULT_BASE_URL = process.env.GITLAB_DUO_BASE_URL || process.env.GITLAB_BASE_URL || "https://gitlab.com";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeGitLabBaseUrl(baseUrl) {
    const raw = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (raw || GITLAB_DUO_DEFAULT_BASE_URL).replace(/\/$/, "");
}
function resolveGitLabOAuthBaseUrl(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeGitLabBaseUrl(data.baseUrl);
}
function buildGitLabOAuthEndpoints(baseUrl) {
    const root = normalizeGitLabBaseUrl(baseUrl);
    return {
        root,
        authorizeUrl: `${root}/oauth/authorize`,
        tokenUrl: `${root}/oauth/token`,
        userUrl: `${root}/api/v4/user`,
        directAccessUrl: `${root}/api/v4/code_suggestions/direct_access`,
        publicCompletionsUrl: `${root}/api/v4/code_suggestions/completions`
    };
}
function buildGitLabDirectGatewayUrl(baseUrl) {
    const normalized = normalizeGitLabBaseUrl(baseUrl);
    if (normalized.endsWith("/ai/v2/completions")) {
        return normalized;
    }
    if (normalized.endsWith("/ai/v2")) {
        return `${normalized}/completions`;
    }
    return `${normalized}/ai/v2/completions`;
}
function parseGitLabDirectAccessDetails(payload) {
    const data = asRecord(payload);
    const token = typeof data.token === "string" ? data.token.trim() : "";
    const baseUrl = typeof data.base_url === "string" ? data.base_url.trim() : "";
    if (!token || !baseUrl) {
        return null;
    }
    const rawHeaders = asRecord(data.headers);
    const headers = Object.fromEntries(Object.entries(rawHeaders).filter((entry)=>typeof entry[0] === "string" && typeof entry[1] === "string"));
    const expiresAt = typeof data.expires_at === "number" && Number.isFinite(data.expires_at) ? new Date(data.expires_at * 1000).toISOString() : null;
    return {
        token,
        baseUrl: normalizeGitLabBaseUrl(baseUrl),
        expiresAt,
        headers
    };
}
function getCachedGitLabDirectAccess(providerSpecificData, minValidityMs = 60_000) {
    const data = asRecord(providerSpecificData);
    const cache = data.gitlabDirectAccess ?? data.directAccessCache;
    const parsed = parseGitLabDirectAccessDetails(cache);
    if (!parsed) {
        return null;
    }
    if (!parsed.expiresAt) {
        return parsed;
    }
    const expiresAtMs = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now() + minValidityMs) {
        return null;
    }
    return parsed;
}
function isGitLabDirectAccessDisabled(status, bodyText) {
    return status === 403 && bodyText.toLowerCase().includes("direct connections are disabled");
}
}),
"[project]/src/lib/oauth/utils/codexConnectionSelection.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickCodexConnectionForUser",
    ()=>pickCodexConnectionForUser
]);
function toRecord(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function nonEmptyString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function readIdentity(connection) {
    const providerSpecificData = toRecord(connection.providerSpecificData ?? connection.provider_specific_data);
    return {
        workspaceId: nonEmptyString(providerSpecificData.workspaceId),
        userId: nonEmptyString(providerSpecificData.chatgptUserId),
        email: nonEmptyString(connection.email)
    };
}
function pickCodexConnectionForUser(workspaceMatches, userId, email) {
    const identities = workspaceMatches.map((connection)=>({
            connection,
            identity: readIdentity(connection)
        }));
    const exact = identities.find(({ identity })=>identity.userId === userId);
    if (exact) return exact.connection;
    if (identities.some(({ identity })=>identity.userId !== null)) return null;
    const normalizedEmail = nonEmptyString(email);
    const compatibleEmail = normalizedEmail ? identities.find(({ identity })=>identity.email === normalizedEmail) : null;
    return compatibleEmail?.connection || identities.find(({ identity })=>identity.email === null)?.connection || null;
}
}),
"[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_REASONING_EFFORT_VALUES",
    ()=>CODEX_REASONING_EFFORT_VALUES,
    "buildOpenAIStoreSessionId",
    ()=>buildOpenAIStoreSessionId,
    "ensureOpenAIStoreSessionFallback",
    ()=>ensureOpenAIStoreSessionFallback,
    "getClaudeCodeCompatibleRequestDefaults",
    ()=>getClaudeCodeCompatibleRequestDefaults,
    "getCodexRequestDefaults",
    ()=>getCodexRequestDefaults,
    "getProviderRequestDefaults",
    ()=>getProviderRequestDefaults,
    "isOpenAIResponsesStoreEnabled",
    ()=>isOpenAIResponsesStoreEnabled,
    "normalizeCacheOverride",
    ()=>normalizeCacheOverride,
    "normalizeClaudeCodeCompatibleContext1m",
    ()=>normalizeClaudeCodeCompatibleContext1m,
    "normalizeClaudeCodeCompatibleRedactThinking",
    ()=>normalizeClaudeCodeCompatibleRedactThinking,
    "normalizeClaudeCodeCompatibleSummarizeThinking",
    ()=>normalizeClaudeCodeCompatibleSummarizeThinking,
    "normalizeCodexReasoningEffort",
    ()=>normalizeCodexReasoningEffort,
    "normalizeCodexServiceTier",
    ()=>normalizeCodexServiceTier,
    "normalizeProviderSpecificData",
    ()=>normalizeProviderSpecificData,
    "normalizeRequestDefaults",
    ()=>normalizeRequestDefaults,
    "sanitizeProviderSpecificDataForResponse",
    ()=>sanitizeProviderSpecificDataForResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/openRouterPreset.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [instrumentation] (ecmascript)");
const CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX = "anthropic-compatible-cc-";
;
;
;
;
const CODEX_REASONING_EFFORT_VALUES = [
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
];
const CODEX_REASONING_EFFORT_SET = new Set(CODEX_REASONING_EFFORT_VALUES);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeString(value) {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
}
const BEDROCK_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/i;
function normalizeAwsRegion(value) {
    const normalized = normalizeString(value);
    if (!normalized || !BEDROCK_REGION_PATTERN.test(normalized)) return undefined;
    return normalized;
}
function hasNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function isClaudeCodeCompatibleProvider(provider) {
    return typeof provider === "string" && provider.startsWith(CLAUDE_CODE_COMPATIBLE_PROVIDER_PREFIX);
}
function normalizeCodexReasoningEffort(value) {
    const normalized = normalizeString(value);
    if (!normalized || !CODEX_REASONING_EFFORT_SET.has(normalized)) {
        return undefined;
    }
    return normalized;
}
function normalizeCodexServiceTier(value) {
    const normalized = normalizeString(value);
    if (!normalized) return undefined;
    if (normalized === "fast" || normalized === "priority") return "priority";
    if (normalized === "default" || normalized === "flex") return normalized;
    return undefined;
}
function normalizeClaudeCodeCompatibleContext1m(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleRedactThinking(value) {
    return value === true ? true : undefined;
}
function normalizeClaudeCodeCompatibleSummarizeThinking(value) {
    return value === true ? true : undefined;
}
function normalizeRequestDefaults(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    if (provider === "codex") {
        const reasoningEffort = normalizeCodexReasoningEffort(record.reasoningEffort);
        if (reasoningEffort) {
            normalized.reasoningEffort = reasoningEffort;
        } else {
            delete normalized.reasoningEffort;
        }
        const serviceTier = normalizeCodexServiceTier(record.serviceTier);
        if (serviceTier) {
            normalized.serviceTier = serviceTier;
        } else {
            delete normalized.serviceTier;
        }
    }
    if (isClaudeCodeCompatibleProvider(provider)) {
        const context1m = normalizeClaudeCodeCompatibleContext1m(record.context1m);
        if (context1m) {
            normalized.context1m = true;
        } else {
            delete normalized.context1m;
        }
        const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(record.redactThinking);
        if (redactThinking) {
            normalized.redactThinking = true;
        } else {
            delete normalized.redactThinking;
        }
        const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(record.summarizeThinking);
        if (summarizeThinking) {
            normalized.summarizeThinking = true;
        } else {
            delete normalized.summarizeThinking;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
const CACHE_PASSTHROUGH_VALUES = new Set([
    "strip",
    "openai-format",
    "claude-format"
]);
function normalizeCacheOverride(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        normalized.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (typeof record.cacheControlPassthrough === "string" && CACHE_PASSTHROUGH_VALUES.has(record.cacheControlPassthrough)) {
        normalized.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
// #6880 — extracted so normalizeProviderSpecificData() stays under the
// max-lines-per-function gate: normalizes the two nested-object sub-fields
// (requestDefaults, cache) in one pass.
function normalizeNestedSubObjects(provider, normalized) {
    if ("requestDefaults" in normalized) {
        const requestDefaults = normalizeRequestDefaults(provider, normalized.requestDefaults);
        if (requestDefaults) {
            normalized.requestDefaults = requestDefaults;
        } else {
            delete normalized.requestDefaults;
        }
    }
    if ("cache" in normalized) {
        const cache = normalizeCacheOverride(normalized.cache);
        if (cache) {
            normalized.cache = cache;
        } else {
            delete normalized.cache;
        }
    }
}
function normalizeProviderSpecificData(provider, value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const normalized = {
        ...record
    };
    normalizeNestedSubObjects(provider, normalized);
    if ("openaiStoreEnabled" in normalized && typeof normalized.openaiStoreEnabled !== "boolean") {
        delete normalized.openaiStoreEnabled;
    }
    if ("blockExtraUsage" in normalized && typeof normalized.blockExtraUsage !== "boolean") {
        delete normalized.blockExtraUsage;
    }
    // #2997: per-connection transient-cooldown opt-out — only persist a real boolean.
    if ("disableCooling" in normalized && typeof normalized.disableCooling !== "boolean") {
        delete normalized.disableCooling;
    }
    if ("autoFetchModels" in normalized && typeof normalized.autoFetchModels !== "boolean") {
        delete normalized.autoFetchModels;
    }
    if ("preset" in normalized) {
        const preset = provider === "openrouter" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$openRouterPreset$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenRouterPreset"])(normalized.preset) : null;
        if (preset) {
            normalized.preset = preset;
        } else {
            delete normalized.preset;
        }
    }
    if (provider === "bedrock" && "region" in normalized) {
        const region = normalizeAwsRegion(normalized.region);
        if (region) {
            normalized.region = region;
        } else {
            delete normalized.region;
        }
    }
    if ("tag" in normalized) {
        if (typeof normalized.tag === "string") {
            const trimmedTag = normalized.tag.trim();
            if (trimmedTag) {
                normalized.tag = trimmedTag;
            } else {
                delete normalized.tag;
            }
        } else {
            delete normalized.tag;
        }
    }
    if ("tags" in normalized) {
        const tags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(normalized.tags);
        if (tags.length > 0) {
            normalized.tags = tags;
        } else {
            delete normalized.tags;
        }
    }
    if ("excludedModels" in normalized || "excluded_models" in normalized) {
        const excludedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeExcludedModelPatterns"])(normalized.excludedModels ?? normalized.excluded_models);
        if (excludedModels.length > 0) {
            normalized.excludedModels = excludedModels;
        } else {
            delete normalized.excludedModels;
        }
        delete normalized.excluded_models;
    }
    // #8369: connection-level custom upstream headers — sanitize each key against the
    // forbidden-header denylist and drop entries with non-string or empty values.
    if ("customHeaders" in normalized) {
        const raw = normalized.customHeaders;
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const cleaned = {};
            for (const [key, value] of Object.entries(raw)){
                const trimmedKey = key.trim();
                if (!trimmedKey) continue;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isForbiddenCustomHeaderName"])(trimmedKey)) continue;
                if (typeof value === "string" && value.trim().length > 0) {
                    cleaned[trimmedKey] = value.trim();
                }
            }
            if (Object.keys(cleaned).length > 0) {
                normalized.customHeaders = cleaned;
            } else {
                delete normalized.customHeaders;
            }
        } else {
            delete normalized.customHeaders;
        }
    }
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}
function sanitizeProviderSpecificDataForResponse(value) {
    const record = asRecord(value);
    if (Object.keys(record).length === 0) return undefined;
    const sanitized = {
        ...record
    };
    delete sanitized.consoleApiKey;
    delete sanitized.secretAccessKey;
    delete sanitized.awsSecretAccessKey;
    delete sanitized.sessionToken;
    delete sanitized.awsSessionToken;
    delete sanitized.openCodeGoAuthCookie;
    delete sanitized.opencodeGoAuthCookie;
    delete sanitized.authCookie;
    delete sanitized.ollamaUsageCookie;
    delete sanitized.ollamaCloudUsageCookie;
    delete sanitized.ollamaCloudCookie;
    delete sanitized.usageCookie;
    return sanitized;
}
function isOpenAIResponsesStoreEnabled(providerSpecificData) {
    return asRecord(providerSpecificData).openaiStoreEnabled === true;
}
function buildOpenAIStoreSessionId(sessionId) {
    if (!hasNonEmptyString(sessionId)) return undefined;
    const normalized = String(sessionId).trim().replace(/^ext:/i, "").replace(/[^a-zA-Z0-9._:-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
    if (!normalized) return undefined;
    return `omniroute-session-${normalized}`;
}
function ensureOpenAIStoreSessionFallback(body, sessionId) {
    const explicitSessionId = body.session_id;
    const explicitConversationId = body.conversation_id;
    const promptCacheKey = body.prompt_cache_key ?? body.promptCacheKey;
    if (hasNonEmptyString(explicitSessionId) || hasNonEmptyString(explicitConversationId) || hasNonEmptyString(promptCacheKey)) {
        return body;
    }
    const fallbackSessionId = buildOpenAIStoreSessionId(sessionId);
    if (!fallbackSessionId) return body;
    return {
        ...body,
        session_id: fallbackSessionId
    };
}
function getProviderRequestDefaults(provider, providerSpecificData) {
    return normalizeRequestDefaults(provider, asRecord(providerSpecificData).requestDefaults) || {};
}
function getCodexRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("codex", providerSpecificData);
    const reasoningEffort = normalizeCodexReasoningEffort(defaults.reasoningEffort);
    const serviceTier = normalizeCodexServiceTier(defaults.serviceTier);
    return {
        ...reasoningEffort ? {
            reasoningEffort
        } : {},
        ...serviceTier ? {
            serviceTier
        } : {}
    };
}
function getClaudeCodeCompatibleRequestDefaults(providerSpecificData) {
    const defaults = getProviderRequestDefaults("anthropic-compatible-cc-default", providerSpecificData);
    const context1m = normalizeClaudeCodeCompatibleContext1m(defaults.context1m);
    const redactThinking = normalizeClaudeCodeCompatibleRedactThinking(defaults.redactThinking);
    const summarizeThinking = normalizeClaudeCodeCompatibleSummarizeThinking(defaults.summarizeThinking);
    return {
        ...context1m ? {
            context1m
        } : {},
        ...redactThinking ? {
            redactThinking
        } : {},
        ...summarizeThinking ? {
            summarizeThinking
        } : {}
    };
}
}),
"[project]/src/lib/compliance/noLog.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNoLog",
    ()=>isNoLog,
    "setNoLog",
    ()=>setNoLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
// #2650: extracted from compliance/index.ts to break the
// callLogs.ts → compliance/index.ts → callLogs.ts cycle that deadlocks
// the bundled MCP server under Node.js 24's stricter ESM evaluation.
function getDb() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    } catch  {
        return null;
    }
}
const noLogKeys = new Set();
const noLogDbCache = new Map();
let noLogColumnVerified = false;
let hasNoLogColumn = false;
const NO_LOG_CACHE_TTL_MS = 30_000;
const noLogIdsFromEnv = (process.env.NO_LOG_API_KEY_IDS || "").split(",").map((value)=>value.trim()).filter(Boolean);
for (const id of noLogIdsFromEnv){
    noLogKeys.add(id);
}
function setNoLog(apiKeyId, noLog) {
    if (noLog) {
        noLogKeys.add(apiKeyId);
    } else {
        noLogKeys.delete(apiKeyId);
    }
    noLogDbCache.set(apiKeyId, {
        value: noLog,
        timestamp: Date.now()
    });
}
function ensureNoLogColumn(db) {
    if (noLogColumnVerified) {
        return hasNoLogColumn;
    }
    try {
        const columns = db.prepare("PRAGMA table_info(api_keys)").all();
        hasNoLogColumn = columns.some((column)=>column.name === "no_log");
    } catch  {
        hasNoLogColumn = false;
    }
    noLogColumnVerified = true;
    return hasNoLogColumn;
}
function readNoLogFromDb(apiKeyId) {
    const db = getDb();
    if (!db || !apiKeyId) return false;
    if (!ensureNoLogColumn(db)) return false;
    const cached = noLogDbCache.get(apiKeyId);
    if (cached && Date.now() - cached.timestamp < NO_LOG_CACHE_TTL_MS) {
        return cached.value;
    }
    try {
        const row = db.prepare("SELECT no_log FROM api_keys WHERE id = ?").get(apiKeyId);
        const value = Boolean(row && Number(row.no_log) === 1);
        noLogDbCache.set(apiKeyId, {
            value,
            timestamp: Date.now()
        });
        return value;
    } catch  {
        return false;
    }
}
function isNoLog(apiKeyId) {
    if (!apiKeyId) return false;
    if (noLogKeys.has(apiKeyId)) return true;
    const persistedNoLog = readNoLogFromDb(apiKeyId);
    if (persistedNoLog) {
        noLogKeys.add(apiKeyId);
    }
    return persistedNoLog;
}
}),
"[project]/src/lib/pricingSync.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSyncedPricing",
    ()=>clearSyncedPricing,
    "fetchLiteLLMPricing",
    ()=>fetchLiteLLMPricing,
    "getSyncStatus",
    ()=>getSyncStatus,
    "getSyncedPricing",
    ()=>getSyncedPricing,
    "initPricingSync",
    ()=>initPricingSync,
    "saveSyncedPricing",
    ()=>saveSyncedPricing,
    "startPeriodicSync",
    ()=>startPeriodicSync,
    "stopPeriodicSync",
    ()=>stopPeriodicSync,
    "syncPricingFromSources",
    ()=>syncPricingFromSources,
    "transformToOmniRoute",
    ()=>transformToOmniRoute
]);
/**
 * pricingSync.ts — External pricing sync engine.
 *
 * Fetches pricing data from external sources (LiteLLM) and stores it
 * in a separate namespace (`pricing_synced`) so user overrides are
 * never touched.
 *
 * Resolution order: user overrides > synced external > hardcoded defaults
 *
 * Opt-in via PRICING_SYNC_ENABLED=true (default: false).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
;
;
;
// ─── Configuration ───────────────────────────────────────
const SUPPORTED_SOURCES = [
    "litellm"
];
const parsedInterval = parseInt(process.env.PRICING_SYNC_INTERVAL || "86400", 10);
const SYNC_INTERVAL_MS = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval * 1000 : 86400 * 1000;
const SYNC_SOURCES = (process.env.PRICING_SYNC_SOURCES || "litellm").split(",").map((s)=>s.trim()).filter((s)=>SUPPORTED_SOURCES.includes(s));
const LITELLM_PRICING_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
// ─── Provider mapping: LiteLLM provider → OmniRoute aliases ─────
const LITELLM_PROVIDER_MAP = {
    openai: [
        "openai",
        "cx"
    ],
    anthropic: [
        "anthropic",
        "cc"
    ],
    vertex_ai: [
        "gemini"
    ],
    "vertex_ai-anthropic_models": [
        "anthropic"
    ],
    google: [
        "gemini"
    ],
    deepseek: [
        "if"
    ],
    groq: [
        "groq"
    ],
    together_ai: [
        "openrouter"
    ],
    bedrock: [
        "kiro"
    ],
    fireworks_ai: [
        "fireworks"
    ],
    cerebras: [
        "cerebras"
    ],
    nvidia_nim: [
        "nvidia"
    ],
    siliconflow: [
        "siliconflow"
    ],
    "vertex_ai-language_models": [
        "gemini"
    ],
    "vertex_ai-mistral_models": [
        "mistral"
    ],
    gemini: [
        "gemini"
    ],
    bedrock_converse: [
        "kiro"
    ],
    cloudflare: [
        "cloudflare-ai"
    ],
    stability: [
        "stability-ai"
    ]
};
// ─── Periodic sync state ─────────────────────────────────
let syncTimer = null;
let lastSyncTime = null;
let lastSyncModelCount = 0;
let activeSyncIntervalMs = SYNC_INTERVAL_MS;
async function fetchLiteLLMPricing() {
    const response = await fetch(LITELLM_PRICING_URL, {
        signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
        throw new Error(`LiteLLM fetch failed [${response.status}]: ${response.statusText}`);
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch  {
        throw new Error(`LiteLLM returned invalid JSON (${text.slice(0, 100)}...)`);
    }
}
function transformToOmniRoute(raw) {
    const result = {};
    for (const [modelKey, info] of Object.entries(raw)){
        const NON_TOKEN_FIELDS = [
            "input_cost_per_second",
            "output_cost_per_second",
            "input_cost_per_image",
            "output_cost_per_image",
            "input_cost_per_pixel",
            "output_cost_per_pixel",
            "input_cost_per_character",
            "output_cost_per_character",
            "input_cost_per_video_per_second",
            "output_cost_per_video_per_second",
            "search_unit_cost",
            "ocr_cost_per_page"
        ];
        const hasToken = info.input_cost_per_token != null || info.output_cost_per_token != null;
        const hasNonToken = NON_TOKEN_FIELDS.some((f)=>info[f] != null);
        if (!hasToken && !hasNonToken) continue;
        const inputCost = (info.input_cost_per_token || 0) * 1_000_000;
        const outputCost = (info.output_cost_per_token || 0) * 1_000_000;
        const entry = {
            input: Math.round(inputCost * 1000) / 1000,
            output: Math.round(outputCost * 1000) / 1000
        };
        if (info.mode) entry.mode = info.mode;
        if (info.cache_read_input_token_cost != null) {
            entry.cached = Math.round(info.cache_read_input_token_cost * 1_000_000 * 1000) / 1000;
        }
        if (info.cache_creation_input_token_cost != null) {
            entry.cache_creation = Math.round(info.cache_creation_input_token_cost * 1_000_000 * 1000) / 1000;
        }
        for (const f of NON_TOKEN_FIELDS){
            const v = info[f];
            if (typeof v === "number" && Number.isFinite(v)) entry[f] = v;
        }
        // Extract model name (strip provider prefix from key)
        // LiteLLM keys look like: "openai/gpt-4o", "anthropic/claude-3-opus"
        const slashIdx = modelKey.indexOf("/");
        const modelName = slashIdx >= 0 ? modelKey.slice(slashIdx + 1) : modelKey;
        // Map to OmniRoute providers
        const litellmProvider = info.litellm_provider || "";
        const omniRouteProviders = LITELLM_PROVIDER_MAP[litellmProvider];
        if (omniRouteProviders) {
            for (const provider of omniRouteProviders){
                if (!result[provider]) result[provider] = {};
                result[provider][modelName] = entry;
            }
        } else if (litellmProvider) {
            // Use litellm_provider as-is for unknown providers
            if (!result[litellmProvider]) result[litellmProvider] = {};
            result[litellmProvider][modelName] = entry;
        }
    }
    return result;
}
// ─── DB: Synced pricing namespace ────────────────────────
function toRecord(value) {
    return value && typeof value === "object" ? value : {};
}
function getSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'pricing_synced'").all();
    const synced = {};
    for (const row of rows){
        const record = toRecord(row);
        const key = typeof record.key === "string" ? record.key : null;
        const rawValue = typeof record.value === "string" ? record.value : null;
        if (!key || rawValue === null) continue;
        try {
            synced[key] = JSON.parse(rawValue);
        } catch  {
            console.warn(`[PRICING_SYNC] Corrupted data for provider "${key}", skipping`);
        }
    }
    return synced;
}
function saveSyncedPricing(data) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const del = db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'");
    const insert = db.prepare("INSERT INTO key_value (namespace, key, value) VALUES ('pricing_synced', ?, ?)");
    const tx = db.transaction(()=>{
        del.run();
        for (const [provider, models] of Object.entries(data)){
            insert.run(provider, JSON.stringify(models));
        }
    });
    tx();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
function clearSyncedPricing() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'pricing_synced'").run();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["invalidateDbCache"])("pricing");
}
// ─── DB: Sync status namespace ───────────────────────────
//
// Persisted separately from `pricing_synced` because Next.js standalone
// builds load this module from independent webpack chunks (e.g. the
// instrumentation hook vs an API route handler) — each gets its OWN
// top-level module state. Module-level vars (`lastSyncTime`,
// `lastSyncModelCount`) are therefore invisible across those instances;
// persisting them to the DB lets any instance read the real status.
const SYNC_STATUS_NAMESPACE = "pricing_sync_status";
const SYNC_STATUS_KEY = "last_sync";
function readPersistedSyncStatus() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(SYNC_STATUS_NAMESPACE, SYNC_STATUS_KEY);
    const record = toRecord(row);
    const rawValue = typeof record.value === "string" ? record.value : null;
    if (!rawValue) return null;
    try {
        const parsed = JSON.parse(rawValue);
        if (typeof parsed.lastSyncTime !== "string") return null;
        return {
            lastSyncTime: parsed.lastSyncTime,
            lastSyncModelCount: typeof parsed.lastSyncModelCount === "number" ? parsed.lastSyncModelCount : 0
        };
    } catch  {
        return null;
    }
}
function writePersistedSyncStatus(lastSync, modelCount) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT INTO key_value (namespace, key, value) VALUES (?, ?, ?) " + "ON CONFLICT(namespace, key) DO UPDATE SET value = excluded.value").run(SYNC_STATUS_NAMESPACE, SYNC_STATUS_KEY, JSON.stringify({
        lastSyncTime: lastSync,
        lastSyncModelCount: modelCount
    }));
}
async function syncPricingFromSources(opts) {
    const requestedSources = opts?.sources || SYNC_SOURCES;
    const dryRun = opts?.dryRun ?? false;
    // Validate sources
    const validSources = requestedSources.filter((s)=>SUPPORTED_SOURCES.includes(s));
    const invalidSources = requestedSources.filter((s)=>!SUPPORTED_SOURCES.includes(s));
    if (validSources.length === 0) {
        const supported = SUPPORTED_SOURCES.join(", ");
        return {
            success: false,
            modelCount: 0,
            providerCount: 0,
            source: requestedSources.join(","),
            dryRun,
            error: `No valid sources provided. Supported: ${supported}. Invalid: ${invalidSources.join(", ")}`
        };
    }
    try {
        const aggregated = {};
        for (const source of validSources){
            if (source === "litellm") {
                const raw = await fetchLiteLLMPricing();
                const transformed = transformToOmniRoute(raw);
                for (const [provider, models] of Object.entries(transformed)){
                    if (!aggregated[provider]) aggregated[provider] = {};
                    Object.assign(aggregated[provider], models);
                }
            }
        }
        const modelCount = Object.values(aggregated).reduce((sum, models)=>sum + Object.keys(models).length, 0);
        const providerCount = Object.keys(aggregated).length;
        if (!dryRun) {
            saveSyncedPricing(aggregated);
            lastSyncTime = new Date().toISOString();
            lastSyncModelCount = modelCount;
            writePersistedSyncStatus(lastSyncTime, modelCount);
        }
        return {
            success: true,
            modelCount,
            providerCount,
            source: validSources.join(","),
            dryRun,
            ...invalidSources.length > 0 ? {
                warnings: [
                    `Unknown sources ignored: ${invalidSources.join(", ")}`
                ]
            } : {},
            ...dryRun ? {
                data: aggregated
            } : {}
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[PRICING_SYNC] Sync failed:", message);
        return {
            success: false,
            modelCount: 0,
            providerCount: 0,
            source: requestedSources.join(","),
            dryRun,
            error: message
        };
    }
}
function startPeriodicSync(intervalMs) {
    if (syncTimer) return; // Already running
    const interval = intervalMs ?? SYNC_INTERVAL_MS;
    activeSyncIntervalMs = interval;
    console.log(`[PRICING_SYNC] Starting periodic sync every ${interval / 1000}s`);
    // Initial sync (non-blocking)
    syncPricingFromSources().then((result)=>{
        if (result.success) {
            console.log(`[PRICING_SYNC] Initial sync complete: ${result.modelCount} models from ${result.providerCount} providers`);
        }
    }).catch((err)=>{
        console.warn("[PRICING_SYNC] Initial sync error:", err instanceof Error ? err.message : err);
    });
    syncTimer = setInterval(()=>{
        syncPricingFromSources().then((result)=>{
            if (result.success) {
                console.log(`[PRICING_SYNC] Periodic sync complete: ${result.modelCount} models`);
            }
        }).catch((err)=>{
            console.warn("[PRICING_SYNC] Periodic sync error:", err instanceof Error ? err.message : err);
        });
    }, interval);
    if (syncTimer && typeof syncTimer === "object" && "unref" in syncTimer) {
        syncTimer.unref?.();
    }
}
function stopPeriodicSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
        console.log("[PRICING_SYNC] Periodic sync stopped");
    }
}
function getSyncStatus() {
    const enabled = process.env.PRICING_SYNC_ENABLED === "true";
    // `lastSyncTime`/`lastSyncModelCount` are only reliably populated on the
    // module instance that performed the sync (see note above
    // writePersistedSyncStatus) — fall back to the persisted DB record so
    // status reads from a different module instance still see it.
    const persisted = lastSyncTime === null ? readPersistedSyncStatus() : null;
    const effectiveLastSync = lastSyncTime ?? persisted?.lastSyncTime ?? null;
    const effectiveModelCount = lastSyncTime !== null ? lastSyncModelCount : persisted?.lastSyncModelCount ?? 0;
    return {
        enabled,
        lastSync: effectiveLastSync,
        lastSyncModelCount: effectiveModelCount,
        nextSync: enabled && effectiveLastSync ? new Date(new Date(effectiveLastSync).getTime() + activeSyncIntervalMs).toISOString() : null,
        intervalMs: activeSyncIntervalMs,
        sources: SYNC_SOURCES
    };
}
async function initPricingSync() {
    if (process.env.PRICING_SYNC_ENABLED !== "true") {
        console.log("[PRICING_SYNC] Disabled (set PRICING_SYNC_ENABLED=true to enable)");
        return;
    }
    startPeriodicSync();
}
}),
"[project]/src/lib/gamification/xp.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * XP/Level Engine for OmniRoute Gamification
 *
 * Pure functions for XP calculations, level progression, and reward definitions.
 * No side effects or DB calls — all stateful logic lives in the persistence layer.
 */ // ─── XP Curve ────────────────────────────────────────────────────────────────
/**
 * XP required for a specific level (delta, not cumulative).
 * Polynomial curve: `xp_for_level(n) = floor(100 * n^1.5)`
 *
 * @param level - Target level (must be >= 1)
 * @returns XP needed to gain this level (0 for level 1)
 *
 * @example
 * xpForLevel(1)  // 0
 * xpForLevel(10) // 3162
 * xpForLevel(50) // 35355
 */ __turbopack_context__.s([
    "XP_REWARDS",
    ()=>XP_REWARDS,
    "calculateLevel",
    ()=>calculateLevel,
    "cumulativeXpForLevel",
    ()=>cumulativeXpForLevel,
    "getLevelTier",
    ()=>getLevelTier,
    "getLevelTitle",
    ()=>getLevelTitle,
    "xpForLevel",
    ()=>xpForLevel,
    "xpToNextLevel",
    ()=>xpToNextLevel
]);
function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}
function cumulativeXpForLevel(level) {
    if (level <= 1) return 0;
    let total = 0;
    for(let i = 2; i <= level; i++){
        total += xpForLevel(i);
    }
    return total;
}
function calculateLevel(totalXp) {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(Math.pow(totalXp * 2.5 / 100, 0.4)));
}
function xpToNextLevel(totalXp) {
    const currentLevel = calculateLevel(totalXp);
    const nextLevelXp = cumulativeXpForLevel(currentLevel + 1);
    return nextLevelXp - totalXp;
}
function getLevelTitle(level) {
    if (level >= 76) return "Legend";
    if (level >= 51) return "Master";
    if (level >= 26) return "Expert";
    if (level >= 11) return "Explorer";
    return "Beginner";
}
function getLevelTier(level) {
    if (level >= 76) return "diamond";
    if (level >= 51) return "platinum";
    if (level >= 26) return "gold";
    if (level >= 11) return "silver";
    return "bronze";
}
const XP_REWARDS = {
    /** Per API request routed through OmniRoute */ request: 1,
    /** Switching to a different provider */ provider_switch: 5,
    /** Switching to a different model */ model_switch: 3,
    /** Creating a new combo */ combo_create: 10,
    /** Using a combo for a request */ combo_use: 2,
    /** Per 1 000 tokens shared with another user */ token_share: 1,
    /** Redeeming an invite code */ invite_redeem: 50,
    /** Daily active usage (once per day) */ daily_login: 5,
    /** Per consecutive streak day (multiplied by streak length) */ streak_bonus: 2,
    /** Unlocking a badge */ badge_unlock: 10
};
}),
"[project]/src/lib/spend/batchWriter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SpendBatchWriter",
    ()=>SpendBatchWriter,
    "discardSpendBatchEntries",
    ()=>discardSpendBatchEntries,
    "flushSpendBatchWriter",
    ()=>flushSpendBatchWriter,
    "resetSpendBatchWriterForTests",
    ()=>resetSpendBatchWriterForTests,
    "spendBatchWriter",
    ()=>spendBatchWriter,
    "startSpendBatchWriter",
    ()=>startSpendBatchWriter,
    "stopSpendBatchWriter",
    ()=>stopSpendBatchWriter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [instrumentation] (ecmascript)");
;
const DEFAULT_FLUSH_INTERVAL_MS = 60_000;
const DEFAULT_MAX_BUFFER_SIZE = 1_000;
function getFlushIntervalMs() {
    const parsed = Number.parseInt(process.env.OMNIROUTE_SPEND_FLUSH_INTERVAL_MS || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FLUSH_INTERVAL_MS;
}
function getMaxBufferSize() {
    const parsed = Number.parseInt(process.env.OMNIROUTE_SPEND_MAX_BUFFER_SIZE || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BUFFER_SIZE;
}
function normalizeEntry(entry) {
    if (!entry?.apiKeyId || !Number.isFinite(entry.cost) || entry.cost <= 0) return null;
    return {
        apiKeyId: entry.apiKeyId,
        cost: entry.cost,
        timestamp: Number.isFinite(entry.timestamp) ? entry.timestamp : Date.now()
    };
}
class SpendBatchWriter {
    buffer = [];
    inFlightEntries = [];
    discardedApiKeyIds = new Set();
    timer = null;
    started = false;
    flushPromise = null;
    persistEntries;
    logger;
    flushIntervalMs;
    maxBufferSize;
    constructor(options = {}){
        this.persistEntries = options.persistEntries || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["batchSaveCostEntries"];
        this.logger = options.logger || console;
        this.flushIntervalMs = options.flushIntervalMs ?? getFlushIntervalMs();
        this.maxBufferSize = options.maxBufferSize ?? getMaxBufferSize();
    }
    start() {
        if (this.started) return;
        this.started = true;
        this.timer = setInterval(()=>{
            void this.flush();
        }, this.flushIntervalMs);
        this.timer.unref?.();
    }
    increment(apiKeyId, cost, timestamp = Date.now()) {
        const entry = normalizeEntry({
            apiKeyId,
            cost,
            timestamp
        });
        if (!entry) return;
        this.start();
        this.discardedApiKeyIds.delete(entry.apiKeyId);
        this.buffer.push(entry);
        if (this.buffer.length >= this.maxBufferSize) {
            void this.flush();
        }
    }
    getBufferedEntries(apiKeyId, sinceTimestamp = 0, untilTimestamp = Number.POSITIVE_INFINITY) {
        const matchesWindow = (entry)=>entry.apiKeyId === apiKeyId && entry.timestamp >= sinceTimestamp && entry.timestamp < untilTimestamp;
        return [
            ...this.inFlightEntries,
            ...this.buffer
        ].filter(matchesWindow);
    }
    getPendingCostTotal(apiKeyId, sinceTimestamp = 0, untilTimestamp = Number.POSITIVE_INFINITY) {
        return this.getBufferedEntries(apiKeyId, sinceTimestamp, untilTimestamp).reduce((sum, entry)=>sum + entry.cost, 0);
    }
    discardEntries(apiKeyId) {
        this.discardedApiKeyIds.add(apiKeyId);
        this.buffer = this.buffer.filter((entry)=>entry.apiKeyId !== apiKeyId);
        this.inFlightEntries = this.inFlightEntries.filter((entry)=>entry.apiKeyId !== apiKeyId);
    }
    async flush() {
        if (this.flushPromise) {
            return this.flushPromise;
        }
        if (this.buffer.length === 0) {
            return {
                flushedEntries: 0,
                uniqueKeys: 0,
                requeued: false
            };
        }
        const entriesToFlush = [
            ...this.buffer
        ];
        this.buffer = [];
        this.inFlightEntries = entriesToFlush;
        this.flushPromise = (async ()=>{
            const entriesToPersist = entriesToFlush.filter((entry)=>!this.discardedApiKeyIds.has(entry.apiKeyId));
            const uniqueKeys = new Set(entriesToPersist.map((entry)=>entry.apiKeyId)).size;
            try {
                if (entriesToPersist.length > 0) {
                    await this.persistEntries(entriesToPersist);
                }
                this.logger.log(`[SpendWriter] Flushed ${entriesToPersist.length} cost entr${entriesToPersist.length === 1 ? "y" : "ies"} across ${uniqueKeys} key(s)`);
                return {
                    flushedEntries: entriesToPersist.length,
                    uniqueKeys,
                    requeued: false
                };
            } catch (error) {
                this.buffer = [
                    ...entriesToPersist,
                    ...this.buffer
                ];
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`[SpendWriter] Flush error: ${message}`);
                return {
                    flushedEntries: 0,
                    uniqueKeys,
                    requeued: true
                };
            } finally{
                this.inFlightEntries = [];
                this.flushPromise = null;
            }
        })();
        return this.flushPromise;
    }
    async stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.started = false;
        return this.flush();
    }
    resetForTests() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.started = false;
        this.buffer = [];
        this.inFlightEntries = [];
        this.discardedApiKeyIds.clear();
        this.flushPromise = null;
    }
}
const spendBatchWriter = new SpendBatchWriter();
function startSpendBatchWriter() {
    spendBatchWriter.start();
}
async function flushSpendBatchWriter() {
    return spendBatchWriter.flush();
}
async function stopSpendBatchWriter() {
    return spendBatchWriter.stop();
}
function resetSpendBatchWriterForTests() {
    spendBatchWriter.resetForTests();
}
function discardSpendBatchEntries(apiKeyId) {
    spendBatchWriter.discardEntries(apiKeyId);
}
}),
"[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
/**
 * localDb.js — Re-export layer for backward compatibility.
 *
 * All 27+ consumer files import from "@/lib/localDb".
 * This thin layer re-exports everything from the domain-specific DB modules,
 * so zero consumer changes are needed.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccrBlocks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccrBlocks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCacheStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCacheStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionCombos$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionCombos.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionContextBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionContextBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionRunTelemetry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionRunTelemetry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelContextOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelContextOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$evals$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/evals.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricingSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pricingSync.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$skills$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/skills.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$registeredKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/registeredKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelComboMappings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelComboMappings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$files$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/files.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$batches$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/batches.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/autoCandidateOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhooks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhooks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$webhookDeliveries$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/webhookDeliveries.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$discoveryResults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/discoveryResults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$sessionAccountAffinity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/versionManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$syncTokens$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/syncTokens.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$upstreamProxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/upstreamProxy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerLimits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$creditBalance$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/creditBalance.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$compressionAnalytics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/compressionAnalytics.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/oneproxy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$gamification$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$featureFlags$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/featureFlags.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$middleware$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/middleware.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyGroups.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$relayProxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/relayProxies.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$freeProxies$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/freeProxies.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$playgroundPresets$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/playgroundPresets.ts [instrumentation] (ecmascript)");
// Plan 21 — Memory Engine Redesign
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$memoryVec$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/memoryVec.ts [instrumentation] (ecmascript)");
// T-A-F2: AgentBridge state/mappings/bypass + Inspector custom hosts/sessions
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeState.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeMappings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeMappings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeBypass$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeBypass.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorSessions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$omp$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/omp.ts [instrumentation] (ecmascript)");
// Quota Sharing — Group B (planos 16+22)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaPools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaPools.ts [instrumentation] (ecmascript)");
// Quota per-(key, model) caps — Group B Fase 3 #7
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaModelCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaModelCaps.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaGroups$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaGroups.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaConsumption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaConsumption.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerPlans$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerPlans.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$tokenLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/tokenLimits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$plugins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/plugins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeyContextSources$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeyContextSources.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$localCorpus$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/localCorpus.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageSummary$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageSummary.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelIntelligence.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$callLogStats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/callLogStats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/usageAnalytics.ts [instrumentation] (ecmascript) <locals>");
// ---------------------------------------------------------------------------
// usage_logs — auto-routing analytics (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageLogs.ts [instrumentation] (ecmascript)");
// ---------------------------------------------------------------------------
// semantic_cache — cache entries CRUD (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$semanticCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/semanticCache.ts [instrumentation] (ecmascript)");
// ---------------------------------------------------------------------------
// proxy_logs — export query (#3500 slice 4)
// ---------------------------------------------------------------------------
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxyLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxyLogs.ts [instrumentation] (ecmascript)");
// Provider param filters — denylist/allowlist config per provider/model (#6625)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$interceptionRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/interceptionRules.ts [instrumentation] (ecmascript)"); // Per-model web-search/web-fetch interception rules (#3384)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryAliases.ts [instrumentation] (ecmascript)"); // Claude Code discovery-alias gate (flag + per-provider/model overrides)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$ccDiscoveryMetrics$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/ccDiscoveryMetrics.ts [instrumentation] (ecmascript)"); // Claude Code discovery-alias usage counters (alias requests + discovery hits)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$functionalGatewayMirrors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/functionalGatewayMirrors.ts [instrumentation] (ecmascript)"); // Functional-gateway mirror gate (flag + per-provider/model overrides)
// Radar client — local feed cache + settings (opt-in, encrypted supporter key)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$radar$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/radar.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorSessions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/logRotation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cleanupOldLogs",
    ()=>cleanupOldLogs,
    "cleanupOverflowLogs",
    ()=>cleanupOverflowLogs,
    "closeLogRotation",
    ()=>closeLogRotation,
    "ensureLogDir",
    ()=>ensureLogDir,
    "getAppLogRotationCheckInterval",
    ()=>getAppLogRotationCheckInterval,
    "getLogConfig",
    ()=>getLogConfig,
    "initLogRotation",
    ()=>initLogRotation,
    "rotateIfNeeded",
    ()=>rotateIfNeeded
]);
/**
 * Log Rotation & Cleanup — manages application log file rotation.
 *
 * Handles:
 *   - Rotating log files when they exceed max size (startup + periodic during runtime)
 *   - Cleaning up old log files past retention period
 *   - Capping the number of rotated log files kept on disk
 *   - Creating the log directory on startup
 *
 * Configuration via env vars:
 *   - APP_LOG_TO_FILE: enable file logging (default: true)
 *   - APP_LOG_FILE_PATH: path to log file (default: logs/application/app.log)
 *   - APP_LOG_MAX_FILE_SIZE: max file size before rotation (default: 50MB)
 *   - APP_LOG_RETENTION_DAYS: days to keep old logs (default: 7)
 *   - APP_LOG_MAX_FILES: max number of rotated log files to keep (default: 20)
 *   - APP_LOG_ROTATION_CHECK_INTERVAL_MS: how often to check log size at runtime (default: 60000ms)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
;
;
const DEFAULT_ROTATION_CHECK_INTERVAL_MS = 60_000;
function parsePositiveInt(value, fallback) {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function getAppLogRotationCheckInterval() {
    return parsePositiveInt(process.env.APP_LOG_ROTATION_CHECK_INTERVAL_MS, DEFAULT_ROTATION_CHECK_INTERVAL_MS);
}
/** Module-level timer handle — cleared by closeLogRotation(). */ let rotationTimer = null;
function getLogConfig() {
    const logToFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogToFile"])();
    const logFilePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFilePath"])() || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "logs/application/app.log");
    const maxFileSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogMaxFileSize"])();
    const retentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogRetentionDays"])();
    const maxFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogMaxFiles"])();
    return {
        logToFile,
        logFilePath,
        maxFileSize,
        retentionDays,
        maxFiles
    };
}
function ensureLogDir(logFilePath) {
    const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir)) {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"])(dir, {
            recursive: true
        });
    }
}
function rotateIfNeeded(logFilePath, maxFileSize) {
    try {
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(logFilePath)) return;
        const stats = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"])(logFilePath);
        if (stats.size < maxFileSize) return;
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
        const ext = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["extname"])(logFilePath);
        const base = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath, ext);
        const now = new Date();
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
        const rotatedPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, `${base}.${ts}${ext}`);
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["renameSync"])(logFilePath, rotatedPath);
    } catch  {
    // If rotation fails, continue writing to the same file
    }
}
function cleanupOldLogs(logFilePath, retentionDays) {
    try {
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir)) return;
        const ext = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["extname"])(logFilePath);
        const base = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath, ext);
        const files = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdirSync"])(dir);
        const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
        for (const file of files){
            // Match rotated files like app.2026-02-19_030000.log
            if (file.startsWith(base + ".") && file.endsWith(ext) && file !== (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath)) {
                const filePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, file);
                try {
                    const stats = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"])(filePath);
                    if (stats.mtimeMs < cutoff) {
                        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["unlinkSync"])(filePath);
                    }
                } catch  {
                // Skip files we can't stat
                }
            }
        }
    } catch  {
    // Cleanup is best-effort
    }
}
function cleanupOverflowLogs(logFilePath, maxFiles) {
    try {
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["dirname"])(logFilePath);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(dir) || maxFiles < 1) return;
        const ext = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["extname"])(logFilePath);
        const base = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath, ext);
        const rotatedFiles = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdirSync"])(dir).filter((file)=>file !== (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["basename"])(logFilePath) && file.startsWith(base + ".") && file.endsWith(ext)).map((file)=>{
            const filePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(dir, file);
            try {
                return {
                    filePath,
                    mtimeMs: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"])(filePath).mtimeMs
                };
            } catch  {
                return null;
            }
        }).filter((entry)=>!!entry).sort((a, b)=>b.mtimeMs - a.mtimeMs);
        for (const entry of rotatedFiles.slice(maxFiles)){
            try {
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["unlinkSync"])(entry.filePath);
            } catch  {
            // Best effort only.
            }
        }
    } catch  {
    // Cleanup is best-effort
    }
}
function initLogRotation() {
    const config = getLogConfig();
    if (!config.logToFile) return;
    ensureLogDir(config.logFilePath);
    rotateIfNeeded(config.logFilePath, config.maxFileSize);
    cleanupOldLogs(config.logFilePath, config.retentionDays);
    cleanupOverflowLogs(config.logFilePath, config.maxFiles);
    const intervalMs = getAppLogRotationCheckInterval();
    rotationTimer = setInterval((filePath, maxSize, maxFiles)=>{
        rotateIfNeeded(filePath, maxSize);
        cleanupOverflowLogs(filePath, maxFiles);
    }, intervalMs, config.logFilePath, config.maxFileSize, config.maxFiles);
    rotationTimer.unref?.();
}
function closeLogRotation() {
    if (rotationTimer !== null) {
        clearInterval(rotationTimer);
        rotationTimer = null;
    }
}
}),
];

//# sourceMappingURL=src_lib_1bkcd4e._.js.map