module.exports = [
"[project]/open-sse/services/autoCombo/modePacks.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Mode Packs — Pre-defined weight profiles for Auto-Combo scoring.
 *
 * Each pack optimizes for a different priority:
 *   - ship-fast:       Prioritize latency and health
 *   - cost-saver:      Prioritize cost efficiency
 *   - quality-first:   Prioritize task fitness and stability
 *   - offline-friendly: Prioritize quota availability
 */ __turbopack_context__.s([
    "MODE_PACKS",
    ()=>MODE_PACKS,
    "getModePack",
    ()=>getModePack,
    "getModePackNames",
    ()=>getModePackNames
]);
const MODE_PACKS = {
    // Prioritize latency → health. tierPriority replaces 0.05 from stability.
    // tierAffinity/specificityMatch stay at 0 (manifest-routing-only weights).
    "ship-fast": {
        quota: 0.14,
        health: 0.28,
        costInv: 0.05,
        latencyInv: 0.32,
        taskFit: 0.1,
        stability: 0.0,
        tierPriority: 0.05,
        tierAffinity: 0,
        specificityMatch: 0,
        contextAffinity: 0.01,
        resetWindowAffinity: 0,
        connectionDensity: 0.05
    },
    // Prioritize cost. tierPriority replaces 0.05 from stability.
    "cost-saver": {
        quota: 0.14,
        health: 0.19,
        costInv: 0.37,
        latencyInv: 0.05,
        taskFit: 0.1,
        stability: 0.05,
        tierPriority: 0.05,
        tierAffinity: 0,
        specificityMatch: 0,
        contextAffinity: 0.0,
        resetWindowAffinity: 0,
        connectionDensity: 0.05
    },
    // Prioritize task fitness. tierPriority replaces 0.05 from latencyInv.
    "quality-first": {
        quota: 0.1,
        health: 0.18,
        costInv: 0.05,
        latencyInv: 0.05,
        taskFit: 0.37,
        stability: 0.15,
        tierPriority: 0.05,
        tierAffinity: 0,
        specificityMatch: 0,
        contextAffinity: 0.0,
        resetWindowAffinity: 0,
        connectionDensity: 0.05
    },
    // Prioritize quota availability. tierPriority replaces 0.05 from taskFit.
    "offline-friendly": {
        quota: 0.37,
        health: 0.28,
        costInv: 0.1,
        latencyInv: 0.05,
        taskFit: 0.0,
        stability: 0.1,
        tierPriority: 0.05,
        tierAffinity: 0,
        specificityMatch: 0,
        contextAffinity: 0.0,
        resetWindowAffinity: 0,
        connectionDensity: 0.05
    },
    // #4235 `:reliable` — prioritize healthy, low-variance providers (high availability).
    // health (circuit-breaker) + stability (latency std-dev) dominate; weights sum to 1.0.
    "reliability-first": {
        quota: 0.14,
        health: 0.37,
        costInv: 0.04,
        latencyInv: 0.05,
        taskFit: 0.1,
        stability: 0.2,
        tierPriority: 0.05,
        tierAffinity: 0,
        specificityMatch: 0,
        contextAffinity: 0.0,
        resetWindowAffinity: 0,
        connectionDensity: 0.05
    },
    // Chaos mode — priority: health > stability > taskFit > latency.
    // Selects top-N healthy providers for parallel dispatch. Favors providers with
    // closed circuit breakers, low latency variance, and high task fitness.
    // quota weight reduced (chaos fans out in parallel, quota diversity is secondary
    // to picking the most stable providers); connectionDensity boosted slightly to
    // prefer providers with multiple accounts (more resilient to per-account rate limits).
    "chaos-mode": {
        quota: 0.05,
        health: 0.42,
        costInv: 0.02,
        latencyInv: 0.03,
        taskFit: 0.2,
        stability: 0.18,
        tierPriority: 0.02,
        tierAffinity: 0,
        specificityMatch: 0,
        contextAffinity: 0.03,
        resetWindowAffinity: 0,
        connectionDensity: 0.05
    }
};
function getModePack(name) {
    return MODE_PACKS[name];
}
function getModePackNames() {
    return Object.keys(MODE_PACKS);
}
}),
"[project]/open-sse/services/tierTypes.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_TIER",
    ()=>PROVIDER_TIER
]);
const PROVIDER_TIER = {
    FREE: "free",
    CHEAP: "cheap",
    PREMIUM: "premium"
};
}),
"[project]/open-sse/services/providerCostData.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KNOWN_MODEL_PRICING",
    ()=>KNOWN_MODEL_PRICING,
    "getModelPricing",
    ()=>getModelPricing,
    "isExplicitlyFree",
    ()=>isExplicitlyFree
]);
const KNOWN_MODEL_PRICING = {
    "gpt-4o": {
        inputCostPer1M: 2.5,
        outputCostPer1M: 10.0,
        isFree: false
    },
    "gpt-4o-mini": {
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.6,
        isFree: false
    },
    "claude-fable-5": {
        inputCostPer1M: 15.0,
        outputCostPer1M: 75.0,
        isFree: false
    },
    "claude-opus-5": {
        inputCostPer1M: 5.0,
        outputCostPer1M: 25.0,
        isFree: false
    },
    "claude-opus-4-8": {
        inputCostPer1M: 15.0,
        outputCostPer1M: 75.0,
        isFree: false
    },
    "claude-opus-4-7": {
        inputCostPer1M: 15.0,
        outputCostPer1M: 75.0,
        isFree: false
    },
    "claude-sonnet-4-6": {
        inputCostPer1M: 3.0,
        outputCostPer1M: 15.0,
        isFree: false
    },
    "claude-sonnet-5": {
        inputCostPer1M: 3.0,
        outputCostPer1M: 15.0,
        isFree: false
    },
    "claude-haiku-4-5": {
        inputCostPer1M: 0.8,
        outputCostPer1M: 4.0,
        isFree: false
    },
    "gemini-2.5-flash": {
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.6,
        isFree: false
    },
    "gemini-2.5-pro": {
        inputCostPer1M: 1.25,
        outputCostPer1M: 5.0,
        isFree: false
    },
    "deepseek-chat": {
        inputCostPer1M: 0.27,
        outputCostPer1M: 1.1,
        isFree: false
    },
    "deepseek-reasoner": {
        inputCostPer1M: 0.55,
        outputCostPer1M: 2.19,
        isFree: false
    },
    "glm-4.7": {
        inputCostPer1M: 0.6,
        outputCostPer1M: 0.6,
        isFree: false
    },
    "glm-5.1": {
        inputCostPer1M: 0.5,
        outputCostPer1M: 0.5,
        isFree: false
    },
    "minimax-m2.1": {
        inputCostPer1M: 0.2,
        outputCostPer1M: 0.2,
        isFree: false
    },
    "grok-4-fast": {
        inputCostPer1M: 0.2,
        outputCostPer1M: 0.5,
        isFree: false
    },
    "kimi-k2-thinking": {
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        isFree: true
    },
    "qwen3-coder-plus": {
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        isFree: true
    },
    "longcat-2.0": {
        inputCostPer1M: 0.75,
        outputCostPer1M: 2.95,
        isFree: true,
        freeQuotaLimit: 10000000
    }
};
function getModelPricing(provider, model) {
    const directKey = model.toLowerCase();
    if (KNOWN_MODEL_PRICING[directKey]) {
        return KNOWN_MODEL_PRICING[directKey];
    }
    const providerKey = `${provider}/${model}`.toLowerCase();
    if (KNOWN_MODEL_PRICING[providerKey]) {
        return KNOWN_MODEL_PRICING[providerKey];
    }
    return {
        inputCostPer1M: 5.0,
        outputCostPer1M: 15.0,
        isFree: false
    };
}
function isExplicitlyFree(provider, config) {
    return config.freeProviders.includes(provider.toLowerCase());
}
}),
"[project]/open-sse/services/tierConfig.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DEFAULT_TIER_CONFIG",
    ()=>DEFAULT_TIER_CONFIG,
    "LEGACY_FREE_PROVIDERS",
    ()=>LEGACY_FREE_PROVIDERS,
    "deriveNoAuthFreeProviders",
    ()=>deriveNoAuthFreeProviders,
    "mergeTierConfig",
    ()=>mergeTierConfig,
    "modelTierOverrideSchema",
    ()=>modelTierOverrideSchema,
    "providerTierOverrideSchema",
    ()=>providerTierOverrideSchema,
    "tierConfigSchema",
    ()=>tierConfigSchema,
    "validateTierConfig",
    ()=>validateTierConfig
]);
/**
 * Tier configuration schema with Zod validation and sensible defaults.
 *
 * `freeProviders` is the union of two sources:
 *   1. Legacy explicit list (`LEGACY_FREE_PROVIDERS`) — keeps historical behavior
 *      for providers that aren't noAuth (e.g., groq, cerebras) so the old test
 *      suite and existing DB overrides keep working.
 *   2. Auto-derived from `NOAUTH_PROVIDERS` where `noAuth === true` AND
 *      `serviceKinds` is empty or includes "llm" (excludes free audio/video
 *      gateways like veo-free that would never feed the chat tier resolver).
 *      See `deriveNoAuthFreeProviders()`.
 *
 * The two are merged into `DEFAULT_TIER_CONFIG.freeProviders` at module load.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const providerTierOverrideSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    tier: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "free",
        "cheap",
        "premium"
    ])
});
const modelTierOverrideSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    provider: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    modelPattern: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
    tier: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "free",
        "cheap",
        "premium"
    ])
});
const tierConfigSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    version: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().default("1.0.0"),
    defaults: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        freeThreshold: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).default(0),
        cheapThreshold: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).default(1.0)
    }),
    providerOverrides: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(providerTierOverrideSchema).default([]),
    modelOverrides: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(modelTierOverrideSchema).default([]),
    freeProviders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).default([])
});
const LEGACY_FREE_PROVIDERS = [
    "kiro",
    "qoder",
    "pollinations",
    "longcat",
    "cloudflare-ai",
    "nvidia-nim",
    "cerebras",
    "groq"
];
function deriveNoAuthFreeProviders() {
    try {
        const ids = [];
        for (const def of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"])){
            if (!def || typeof def !== "object") continue;
            if (def.noAuth !== true) continue;
            const kinds = def.serviceKinds;
            const isLlm = !Array.isArray(kinds) || kinds.length === 0 || kinds.includes("llm");
            if (!isLlm) continue;
            if (typeof def.id === "string" && def.id.length > 0) {
                ids.push(def.id);
            }
        }
        return ids;
    } catch  {
        return [];
    }
}
const NOAUTH_FREE_PROVIDERS = deriveNoAuthFreeProviders();
const DEFAULT_TIER_CONFIG = {
    version: "1.0.0",
    defaults: {
        freeThreshold: 0,
        cheapThreshold: 1.0
    },
    providerOverrides: [],
    modelOverrides: [],
    freeProviders: [
        ...new Set([
            ...LEGACY_FREE_PROVIDERS,
            ...NOAUTH_FREE_PROVIDERS
        ])
    ]
};
function validateTierConfig(raw) {
    return tierConfigSchema.parse(raw);
}
function mergeTierConfig(userConfig) {
    if (!userConfig) return DEFAULT_TIER_CONFIG;
    return {
        ...DEFAULT_TIER_CONFIG,
        ...userConfig,
        defaults: {
            ...DEFAULT_TIER_CONFIG.defaults,
            ...userConfig.defaults
        },
        providerOverrides: [
            ...DEFAULT_TIER_CONFIG.providerOverrides,
            ...userConfig.providerOverrides || []
        ],
        modelOverrides: [
            ...DEFAULT_TIER_CONFIG.modelOverrides,
            ...userConfig.modelOverrides || []
        ],
        freeProviders: [
            ...new Set([
                ...DEFAULT_TIER_CONFIG.freeProviders,
                ...userConfig.freeProviders || []
            ])
        ]
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/tierResolver.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "classifyTier",
    ()=>classifyTier,
    "classifyTiers",
    ()=>classifyTiers,
    "clearTierCache",
    ()=>clearTierCache,
    "getTierConfig",
    ()=>getTierConfig,
    "getTierStats",
    ()=>getTierStats,
    "setTierConfig",
    ()=>setTierConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierTypes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tierTypes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCostData$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/providerCostData.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tierConfig.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
let dbPersistenceChecked = false;
const tierCache = new Map();
let currentConfig = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_TIER_CONFIG"];
function cacheKey(provider, model) {
    return `${provider}::${model}`;
}
function matchGlob(pattern, text) {
    const regexStr = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${regexStr}$`, "i").test(text);
}
function classifyTier(provider, model) {
    const key = cacheKey(provider, model);
    if (tierCache.has(key)) {
        return tierCache.get(key);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCostData$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isExplicitlyFree"])(provider, currentConfig)) {
        const assignment = {
            provider,
            model,
            tier: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierTypes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_TIER"].FREE,
            reason: `Provider '${provider}' is in explicit free providers list`,
            costPer1MInput: 0,
            costPer1MOutput: 0,
            hasFreeTier: true
        };
        tierCache.set(key, assignment);
        return assignment;
    }
    const providerOverride = currentConfig.providerOverrides.find((o)=>o.provider.toLowerCase() === provider.toLowerCase());
    if (providerOverride) {
        const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCostData$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelPricing"])(provider, model);
        const assignment = {
            provider,
            model,
            tier: providerOverride.tier,
            reason: `Provider-level override: '${provider}' → ${providerOverride.tier}`,
            costPer1MInput: pricing.inputCostPer1M,
            costPer1MOutput: pricing.outputCostPer1M,
            hasFreeTier: pricing.isFree,
            freeQuotaLimit: pricing.freeQuotaLimit
        };
        tierCache.set(key, assignment);
        return assignment;
    }
    const modelOverride = currentConfig.modelOverrides.find((o)=>o.provider.toLowerCase() === provider.toLowerCase() && matchGlob(o.modelPattern, model));
    if (modelOverride) {
        const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCostData$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelPricing"])(provider, model);
        const assignment = {
            provider,
            model,
            tier: modelOverride.tier,
            reason: `Model-level override: '${provider}/${model}' matches '${modelOverride.modelPattern}' → ${modelOverride.tier}`,
            costPer1MInput: pricing.inputCostPer1M,
            costPer1MOutput: pricing.outputCostPer1M,
            hasFreeTier: pricing.isFree,
            freeQuotaLimit: pricing.freeQuotaLimit
        };
        tierCache.set(key, assignment);
        return assignment;
    }
    const pricing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCostData$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelPricing"])(provider, model);
    let tier;
    let reason;
    if (pricing.isFree || pricing.inputCostPer1M <= currentConfig.defaults.freeThreshold) {
        tier = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierTypes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_TIER"].FREE;
        reason = `Cost-based: $${pricing.inputCostPer1M}/M input ≤ free threshold ($${currentConfig.defaults.freeThreshold}/M)`;
    } else if (pricing.inputCostPer1M <= currentConfig.defaults.cheapThreshold) {
        tier = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierTypes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_TIER"].CHEAP;
        reason = `Cost-based: $${pricing.inputCostPer1M}/M input ≤ cheap threshold ($${currentConfig.defaults.cheapThreshold}/M)`;
    } else {
        tier = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierTypes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PROVIDER_TIER"].PREMIUM;
        reason = `Cost-based: $${pricing.inputCostPer1M}/M input > cheap threshold ($${currentConfig.defaults.cheapThreshold}/M)`;
    }
    const assignment = {
        provider,
        model,
        tier,
        reason,
        costPer1MInput: pricing.inputCostPer1M,
        costPer1MOutput: pricing.outputCostPer1M,
        hasFreeTier: pricing.isFree,
        freeQuotaLimit: pricing.freeQuotaLimit
    };
    tierCache.set(key, assignment);
    return assignment;
}
function setTierConfig(config) {
    if (config === null || config === undefined) {
        try {
            const { loadTierConfig } = __turbopack_context__.r("[project]/src/lib/db/tierConfig.ts [instrumentation] (ecmascript)");
            currentConfig = loadTierConfig();
        } catch  {
            currentConfig = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_TIER_CONFIG"];
        }
    } else {
        currentConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeTierConfig"])(config);
    }
    tierCache.clear();
}
function getTierConfig() {
    return {
        ...currentConfig
    };
}
function clearTierCache() {
    tierCache.clear();
}
function classifyTiers(targets) {
    return targets.map((t)=>classifyTier(t.provider, t.model));
}
function getTierStats() {
    const stats = {
        free: 0,
        cheap: 0,
        premium: 0
    };
    for (const assignment of tierCache.values()){
        stats[assignment.tier]++;
    }
    return stats;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/scoring.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Auto-Combo Scoring Function
 *
 * Calculates a weighted score for each provider candidate.
 */ __turbopack_context__.s([
    "DEFAULT_WEIGHTS",
    ()=>DEFAULT_WEIGHTS,
    "calculateFactors",
    ()=>calculateFactors,
    "calculateScore",
    ()=>calculateScore,
    "calculateTierScore",
    ()=>calculateTierScore,
    "computePoolMaxima",
    ()=>computePoolMaxima,
    "normalizeScoringWeights",
    ()=>normalizeScoringWeights,
    "scorePool",
    ()=>scorePool,
    "validateWeights",
    ()=>validateWeights
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/number.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tierResolver.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const DEFAULT_WEIGHTS = {
    quota: 0.15,
    health: 0.2,
    costInv: 0.15,
    latencyInv: 0.12,
    taskFit: 0.08,
    stability: 0.05,
    tierPriority: 0.05,
    tierAffinity: 0.05,
    specificityMatch: 0.05,
    contextAffinity: 0.05,
    cacheAffinity: 0,
    resetWindowAffinity: 0,
    connectionDensity: 0.05
};
function normalizeScoringWeights(weights) {
    if (!weights) return {
        ...DEFAULT_WEIGHTS
    };
    const entries = Object.keys(DEFAULT_WEIGHTS);
    const sanitized = Object.fromEntries(entries.map((key)=>{
        const value = Number(weights?.[key]);
        return [
            key,
            Number.isFinite(value) && value >= 0 ? value : 0
        ];
    }));
    const total = entries.reduce((sum, key)=>sum + Number(sanitized[key] ?? 0), 0);
    if (total <= 0) return {
        ...DEFAULT_WEIGHTS
    };
    return Object.fromEntries(entries.map((key)=>[
            key,
            Number(sanitized[key] ?? 0) / total
        ]));
}
function calculateScore(factors, weights) {
    // clamp01 bounds the result to [0,1] and maps a non-finite sum (a NaN factor)
    // to 0, so a single bad input can't yield NaN (which sorts nondeterministically)
    // or a score >1 from float drift in weights that nominally sum to 1.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(weights.quota * factors.quota + weights.health * factors.health + weights.costInv * factors.costInv + weights.latencyInv * factors.latencyInv + weights.taskFit * factors.taskFit + weights.stability * factors.stability + weights.tierPriority * factors.tierPriority + (weights.tierAffinity ?? 0) * factors.tierAffinity + (weights.specificityMatch ?? 0) * factors.specificityMatch + (weights.contextAffinity ?? 0) * factors.contextAffinity + (weights.cacheAffinity ?? 0) * (factors.cacheAffinity ?? 0) + (weights.resetWindowAffinity ?? 0) * factors.resetWindowAffinity + (weights.connectionDensity ?? 0) * factors.connectionDensity);
}
function calculateTierScore(tier, quotaResetIntervalSecs) {
    const BASE_TIER_SCORES = {
        ultra: 1.0,
        pro: 0.67,
        standard: 0.33,
        free: 0.0
    };
    const baseScore = BASE_TIER_SCORES[tier?.toLowerCase() ?? ""] ?? 0.33;
    const resetBonus = quotaResetIntervalSecs != null && quotaResetIntervalSecs > 0 ? Math.max(0, 1 - quotaResetIntervalSecs / 2_592_000) : 0;
    return Math.min(1, baseScore * 0.8 + resetBonus * 0.2);
}
function calculateTierAffinity(candidate, hint) {
    if (!hint) return 0.5;
    try {
        const assignment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyTier"])(candidate.provider, candidate.model);
        const tierOrder = [
            "free",
            "cheap",
            "premium"
        ];
        const providerTierIdx = tierOrder.indexOf(assignment.tier);
        const minTierIdx = tierOrder.indexOf(hint.recommendedMinTier);
        if (providerTierIdx === minTierIdx) return 1.0;
        if (Math.abs(providerTierIdx - minTierIdx) === 1) return 0.7;
        return 0.3;
    } catch  {
        return 0.5;
    }
}
function calculateSpecificityMatch(candidate, hint) {
    if (!hint) return 0.5;
    try {
        const assignment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyTier"])(candidate.provider, candidate.model);
        const specificityScore = hint.specificity.score;
        if (assignment.tier === "free") return specificityScore <= 15 ? 0.9 : 0.2;
        if (assignment.tier === "cheap") return specificityScore > 15 && specificityScore <= 50 ? 0.9 : 0.4;
        if (assignment.tier === "premium") return specificityScore > 50 ? 0.9 : 0.3;
        return 0.5;
    } catch  {
        return 0.5;
    }
}
function computePoolMaxima(pool) {
    let maxCost = 0.001;
    let maxLatency = 1;
    let maxStdDev = 0.001;
    for (const p of pool){
        if (p.costPer1MTokens > maxCost) maxCost = p.costPer1MTokens;
        if (p.p95LatencyMs > maxLatency) maxLatency = p.p95LatencyMs;
        if (p.latencyStdDev > maxStdDev) maxStdDev = p.latencyStdDev;
    }
    return {
        maxCost,
        maxLatency,
        maxStdDev
    };
}
function calculateFactors(candidate, pool, taskType, getTaskFitness, manifestHint, precomputedMaxima) {
    const { maxCost, maxLatency, maxStdDev } = precomputedMaxima ?? computePoolMaxima(pool);
    // Every factor is contractually [0,1]. clamp01 guards against bad telemetry
    // (negative quota / cost / latency, NaN, out-of-range candidate-supplied
    // affinities) so a single bad input can't produce a negative or >1 factor
    // that distorts the weighted score.
    return {
        quota: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(candidate.quotaRemaining / 100),
        health: candidate.circuitBreakerState === "CLOSED" ? 1.0 : candidate.circuitBreakerState === "HALF_OPEN" ? 0.5 : 0.0,
        costInv: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(1 - candidate.costPer1MTokens / maxCost),
        latencyInv: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(1 - candidate.p95LatencyMs / maxLatency),
        taskFit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(getTaskFitness(candidate.model, taskType)),
        stability: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(1 - candidate.latencyStdDev / maxStdDev),
        tierPriority: calculateTierScore(candidate.accountTier, candidate.quotaResetIntervalSecs),
        tierAffinity: calculateTierAffinity(candidate, manifestHint),
        specificityMatch: calculateSpecificityMatch(candidate, manifestHint),
        contextAffinity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(candidate.contextAffinity ?? 0.5),
        cacheAffinity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(candidate.cacheAffinity ?? 0),
        resetWindowAffinity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(candidate.resetWindowAffinity ?? 0.5),
        connectionDensity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(((candidate.connectionPoolSize ?? 1) - 1) / 10)
    };
}
function scorePool(pool, taskType, weights = DEFAULT_WEIGHTS, getTaskFitness = ()=>0.5, manifestHint) {
    const poolMaxima = computePoolMaxima(pool);
    return pool.map((candidate)=>{
        const factors = calculateFactors(candidate, pool, taskType, getTaskFitness, manifestHint, poolMaxima);
        return {
            provider: candidate.provider,
            model: candidate.model,
            score: calculateScore(factors, weights),
            factors,
            connectionId: candidate.connectionId
        };
    }).sort((a, b)=>b.score - a.score);
}
function validateWeights(weights) {
    const sum = Object.values(weights).reduce((a, b)=>a + b, 0);
    return Math.abs(sum - 1.0) < 0.01;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/open-sse/services/autoCombo/providerRegistryAccessor.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getProviderRegistry",
    ()=>getProviderRegistry
]);
/**
 * Provides access to the provider REGISTRY. Used to enable mocking in tests.
 * The REGISTRY contains provider configuration including models and costs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/index.ts [instrumentation] (ecmascript)");
;
function getProviderRegistry() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REGISTRY"];
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
"[project]/open-sse/services/autoCombo/suffixComposition.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * #4235 Phase B — OpenRouter-style `auto/<category>:<tier>` composition.
 *
 * The built-in catalog (builtinCatalog.ts) historically mapped each `auto/*` id to
 * a single flat `AutoVariant` (coding/fast/cheap/offline/smart/lkgp). That conflates
 * two orthogonal axes the issue asks to separate:
 *
 *   - **category** (what kind of route): coding · reasoning · vision · chat · multimodal
 *     → a *candidate filter* (vision/reasoning/multimodal keep only capable models).
 *   - **tier** (how to optimize): fast · cheap/floor · free · reliable · pro
 *     → scoring *weights* (a mode pack) and, for free/pro, a model-tier *filter*
 *       via `classifyTier` (free → free models only, pro → premium models only).
 *
 * This module parses `auto/<category>[:<tier>]` and turns it into a weight variant +
 * an optional candidate filter, all without touching the core combo scorer
 * (`combo.ts::buildAutoCandidates`) — the filter is applied to the candidate pool in
 * `virtualFactory.createVirtualAutoCombo`, and the weights reuse the existing mode packs.
 */ __turbopack_context__.s([
    "AUTO_CATEGORIES",
    ()=>AUTO_CATEGORIES,
    "AUTO_TIERS",
    ()=>AUTO_TIERS,
    "buildAutoCandidateFilter",
    ()=>buildAutoCandidateFilter,
    "parseAutoSuffix",
    ()=>parseAutoSuffix,
    "tierToWeightVariant",
    ()=>tierToWeightVariant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tierResolver.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/visionModels.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const AUTO_CATEGORIES = [
    "coding",
    "reasoning",
    "vision",
    "chat",
    "multimodal"
];
const AUTO_TIERS = [
    "fast",
    "cheap",
    "floor",
    "free",
    "reliable",
    "pro"
];
const CATEGORY_SET = new Set(AUTO_CATEGORIES);
const TIER_SET = new Set(AUTO_TIERS);
function parseAutoSuffix(suffix) {
    if (typeof suffix !== "string" || suffix.length === 0) return {
        valid: false
    };
    const parts = suffix.split(":");
    if (parts.length > 2) return {
        valid: false
    };
    const [head, tail] = parts;
    if (tail !== undefined) {
        if (!CATEGORY_SET.has(head) || !TIER_SET.has(tail)) return {
            valid: false
        };
        return {
            valid: true,
            category: head,
            tier: tail
        };
    }
    if (CATEGORY_SET.has(head)) return {
        valid: true,
        category: head
    };
    return {
        valid: false
    };
}
function tierToWeightVariant(tier) {
    switch(tier){
        case "fast":
            return "fast";
        case "cheap":
        case "floor":
            return "cheap";
        case "reliable":
            return "reliability";
        default:
            return undefined;
    }
}
function buildAutoCandidateFilter(category, tier) {
    const checks = [];
    if (category === "vision" || category === "multimodal") {
        checks.push((c)=>{
            try {
                const caps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])({
                    provider: c.provider,
                    model: c.model
                });
                return caps.supportsVision === true || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isVisionModelId"])(c.model);
            } catch  {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$visionModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isVisionModelId"])(c.model);
            }
        });
    }
    if (category === "reasoning") {
        checks.push((c)=>{
            try {
                const caps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])({
                    provider: c.provider,
                    model: c.model
                });
                return caps.reasoning === true || caps.supportsThinking === true;
            } catch  {
                return false;
            }
        });
    }
    if (tier === "free") {
        checks.push((c)=>safeClassifyTier(c) === "free");
    }
    if (tier === "pro") {
        checks.push((c)=>safeClassifyTier(c) === "premium");
    }
    if (checks.length === 0) return null;
    return (candidate)=>checks.every((fn)=>fn(candidate));
}
function safeClassifyTier(c) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tierResolver$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyTier"])(c.provider, c.model).tier;
    } catch  {
        return "cheap";
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/modelFamily.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * #6453 — Provider-family auto combos.
 *
 * `auto/<family>` (e.g. `auto/glm`, `auto/minimax`) is a NEW axis alongside the
 * existing task-mode (`auto/best-coding`) and category:tier (`auto/coding:fast`)
 * combos: instead of grouping by routing intent, it groups by underlying MODEL
 * FAMILY and materializes an on-demand virtual combo spanning whatever installed
 * backends currently expose that family, degrading gracefully as backends
 * rotate — same on-demand mechanism (`createVirtualAutoCombo`), a different
 * candidate filter.
 *
 * Kept as a pure, dependency-free module so `detectModelFamily` is unit-testable
 * in isolation without touching the DB/registry-backed virtual factory.
 */ __turbopack_context__.s([
    "AUTO_FAMILY_IDS",
    ()=>AUTO_FAMILY_IDS,
    "FAMILY_PROVIDER_OVERRIDE",
    ()=>FAMILY_PROVIDER_OVERRIDE,
    "MODEL_FAMILIES",
    ()=>MODEL_FAMILIES,
    "buildFamilyCandidateFilter",
    ()=>buildFamilyCandidateFilter,
    "detectModelFamily",
    ()=>detectModelFamily,
    "isValidModelFamily",
    ()=>isValidModelFamily
]);
const MODEL_FAMILIES = [
    "glm",
    "minimax",
    "mimo",
    "zai",
    "gemma",
    "llama",
    "gemini"
];
const MODEL_FAMILY_SET = new Set(MODEL_FAMILIES);
/** Model-id prefix → family. Matched against the bare model id (provider prefix, if
 * any, stripped) so both `glm-5.2` and `zai/glm-5.2` resolve the same way. */ const FAMILY_ID_PATTERNS = [
    {
        family: "glm",
        pattern: /^glm-/i
    },
    {
        family: "minimax",
        pattern: /^minimax-/i
    },
    {
        family: "mimo",
        pattern: /^mimo-/i
    },
    {
        family: "gemma",
        pattern: /^gemma-/i
    },
    {
        family: "llama",
        pattern: /^llama-/i
    },
    {
        family: "gemini",
        pattern: /^gemini-/i
    }
];
const FAMILY_PROVIDER_OVERRIDE = {
    zai: "zai"
};
function isValidModelFamily(value) {
    return typeof value === "string" && MODEL_FAMILY_SET.has(value);
}
function detectModelFamily(modelId) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return null;
    const bare = modelId.includes("/") ? modelId.slice(modelId.lastIndexOf("/") + 1) : modelId;
    for (const { family, pattern } of FAMILY_ID_PATTERNS){
        if (pattern.test(bare)) return family;
    }
    return null;
}
function buildFamilyCandidateFilter(family) {
    const providerOverride = FAMILY_PROVIDER_OVERRIDE[family];
    if (providerOverride) {
        return (candidate)=>candidate.provider === providerOverride;
    }
    return (candidate)=>detectModelFamily(candidate.model) === family;
}
const AUTO_FAMILY_IDS = MODEL_FAMILIES.map((family)=>`auto/${family}`);
}),
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
"[project]/open-sse/services/autoCombo/paidModelFilter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "filterPaidOnlyCandidates",
    ()=>filterPaidOnlyCandidates
]);
/**
 * #6512 (follow-up to #6328 / #6495) — exclude paid-only backends from `auto/*`
 * candidate pools when the operator opts into the `hidePaidModels` setting.
 *
 * PR #6495 added `hidePaidModels` to hide paid models from the `GET /v1/models`
 * listing, but `auto/*` combos could still pick a paid-only backend into their
 * candidate pool → a 402/403 at request time, exactly what #6328 wanted to avoid.
 * This applies the SAME free-model predicate #6495 uses in `catalog.ts` to every
 * virtual auto-combo candidate pool.
 *
 * Kept as a pure, dependency-light function so the filter is unit-testable in
 * isolation without seeding the DB-backed virtual factory.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/freeModels.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
/** A candidate is kept only when its provider has documented free models AND the
 * selected model itself qualifies as free — mirrors `shouldHidePaid` in
 * `src/app/api/v1/models/catalog.ts`. */ function isFreeCandidate(candidate) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerHasFreeModels"])(candidate.provider) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$freeModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFreeModel"])(candidate.provider, {
        id: candidate.model
    });
}
function filterPaidOnlyCandidates(pool, hidePaidModels) {
    if (!hidePaidModels) return pool;
    return pool.filter(isFreeCandidate);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/candidateOverrides.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * #7819 (Level 2) — per-API-key candidate exclusions for `auto/*` channels.
 *
 * Pure, dependency-light filter kept separate from `virtualFactory.ts` so it
 * is unit-testable in isolation, mirroring `paidModelFilter.ts` in this same
 * directory (`filterPaidOnlyCandidates`). Fail-open by design: an empty
 * exclusion set is the identity function (near-zero overhead on the
 * unconfigured hot path), and any caller-side lookup failure should pass the
 * candidate pool through unfiltered rather than break routing.
 */ __turbopack_context__.s([
    "filterExcludedCandidates",
    ()=>filterExcludedCandidates
]);
function filterExcludedCandidates(pool, excludedConnectionIds) {
    if (!excludedConnectionIds || excludedConnectionIds.size === 0) return pool;
    return pool.flatMap((candidate)=>{
        if (Array.isArray(candidate.allowedConnectionIds)) {
            const allowedConnectionIds = candidate.allowedConnectionIds.filter((connectionId)=>!excludedConnectionIds.has(connectionId));
            if (allowedConnectionIds.length === 0) return [];
            if (allowedConnectionIds.length === candidate.allowedConnectionIds.length) {
                return [
                    candidate
                ];
            }
            return [
                {
                    ...candidate,
                    allowedConnectionIds
                }
            ];
        }
        return candidate.connectionId && excludedConnectionIds.has(candidate.connectionId) ? [] : [
            candidate
        ];
    });
}
}),
"[project]/open-sse/services/rotationConfig.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [instrumentation] (ecmascript)");
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
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (rotationKey && classForStatus(status, rotationCfg) && !recordErrorAndCheckThreshold(rotationKey, status, rotationCfg)) {
        return {
            shouldFallback: false,
            cooldownMs: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (shouldForceFallbackFor400(status, rotationCfg)) {
        const overrideMs = rateLimitCooldownOverrideMs(rotationCfg);
        const cooldownMs = overrideMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].rateLimit;
        return {
            shouldFallback: true,
            cooldownMs,
            baseCooldownMs: cooldownMs,
            newBackoffLevel: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
        };
    }
    return null;
}
function rotationRateLimitFallback(reason, rotationCfg) {
    if (reason !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED) return null;
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
"[project]/open-sse/services/antigravityQuotaFamily.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/geminiRateLimitTracker.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$geminiRateLimits$2e$json$2e5b$json$5d2e$cjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/geminiRateLimits.json.[json].cjs [instrumentation] (ecmascript)");
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
    const entry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$geminiRateLimits$2e$json$2e5b$json$5d2e$cjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"][key];
    if (!entry) {
        for (const [knownKey, knownEntry] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$geminiRateLimits$2e$json$2e5b$json$5d2e$cjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"])){
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
"[project]/open-sse/services/retryAfterJson.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/quotaTextCooldowns.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
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
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED,
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
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED
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
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED
    };
}
}),
"[project]/open-sse/services/quotaResetParsing.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDayGranularityResetMs",
    ()=>parseDayGranularityResetMs,
    "shouldPreserveQuotaSignals",
    ()=>shouldPreserveQuotaSignals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/classify429.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
;
;
function shouldPreserveQuotaSignals(provider, errorText) {
    if (!provider) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "oauth") return true;
    return Boolean(errorText) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["looksLikeQuotaExhausted"])(errorText);
}
function parseDayGranularityResetMs(msg, maxMs) {
    const dayMatch = /reset(?:s)?\s+in\s+(\d+)\s*day(?:s)?/i.exec(msg);
    if (!dayMatch) return null;
    const days = Number.parseInt(dayMatch[1], 10);
    if (!Number.isFinite(days) || days <= 0) return null;
    return Math.min(days * 24 * 3600 * 1000, maxMs);
}
}),
"[project]/open-sse/services/accountFallback/lockoutEviction.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/accountFallback/cooldownCap.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/accountFallback/nonRetryableUpstream.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/accountFallback/exactModelLock.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/errorConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerErrorRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rotationConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rotationConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/modelLockoutSettings.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/classify429.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerHints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiRateLimitTracker.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers/rateLimit.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/retryAfterJson.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaTextCooldowns.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaResetParsing.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$lockoutEviction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/lockoutEviction.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$cooldownCap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/cooldownCap.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$nonRetryableUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/nonRetryableUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/exactModelLock.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    const resilience = settings ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings) : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_RESILIENCE_SETTINGS"];
    const connectionCooldown = resilience.connectionCooldown[category];
    const providerBreaker = resilience.providerBreaker[category];
    return {
        baseCooldownMs: connectionCooldown.baseCooldownMs,
        useUpstreamRetryHints: connectionCooldown.useUpstreamRetryHints,
        useUpstream429BreakerHints: connectionCooldown.useUpstream429BreakerHints,
        maxCooldownMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$modelLockoutSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveModelLockoutSettings"])(settings).maxCooldownMs,
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
        providerFailureThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].providerFailureThreshold,
        providerFailureWindowMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].providerFailureWindowMs,
        maxBackoffMultiplier: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].maxBackoffMultiplier,
        backoffEscalationCount: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].backoffEscalationCount,
        providerCooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_PROFILES"][category].providerCooldownMs
    };
}
function getProviderProfile(provider) {
    const category = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider);
    return buildProviderProfile(category);
}
async function getRuntimeProviderProfile(provider) {
    try {
        const { getCachedSettings } = await __turbopack_context__.A("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript, async loader)");
        const settings = await getCachedSettings();
        const category = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider || "");
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
        canonical = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProviderId"])(provider);
        canonicalProviderCache.set(provider, canonical);
    }
    return canonical;
}
function getModelLockKey(provider, connectionId, model, reason, status) {
    const canonicalProvider = getCanonicalLockProvider(provider);
    const lockModel = reason === "not_found" || status === 404 ? model : canonicalProvider === "codex" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getQuotaScopedModelForProvider"])(canonicalProvider, model) || model;
    return `${canonicalProvider}:${connectionId}:${lockModel}`;
}
const buildExactKey = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildExactModelLockKey"]; // see exactModelLock.ts
const getModelLockKeys = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createGetModelLockKeys"](getModelLockKey, getCanonicalLockProvider);
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
    return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED ? getQuotaCooldown(0) : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transientInitial;
}
function getScaledCooldown(baseCooldownMs, failureCount, maxBackoffLevel = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].maxLevel) {
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$lockoutEviction$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["evictLockoutOverflow"])(modelLockouts, modelFailureState);
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
const lockExactModel = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createLockExactModel"](modelLockouts, ensureCleanupTimer, cleanupModelLockKey, getCanonicalLockProvider);
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
    const cooldownMs = typeof options.exactCooldownMs === "number" && options.exactCooldownMs > 0 ? maxCooldownMs !== null && !options.exactCooldownIsUpstreamReset ? Math.min(options.exactCooldownMs, maxCooldownMs) : options.exactCooldownMs : Math.min(getScaledCooldown(baseCooldownMs, failureCount, profile?.maxBackoffSteps ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].maxLevel), maxCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].max);
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearMultiKeyLock"](modelLockouts, modelFailureState, getModelLockKeys(provider, connectionId, model));
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPassthroughProviders"])().has(provider)) return true;
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPreserveQuotaSignals"])(provider) && !hasPerModelQuota(provider, model, connectionPassthroughModels);
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAnyKeyLocked"](modelLockouts, cleanupModelLockKey, getModelLockKeys(provider, connectionId, model));
}
function getModelLockoutInfo(provider, connectionId, model) {
    if (!model) return null;
    const entry = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$exactModelLock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findLatestLockEntry"](modelLockouts, cleanupModelLockKey, getModelLockKeys(provider, connectionId, model));
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
    return provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider) : null;
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
    const useHints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerHints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUseUpstream429BreakerHints"])(provider, userValue);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider, {
        failureThreshold: resolvedProfile.failureThreshold ?? resolvedProfile.circuitBreakerThreshold,
        resetTimeout: resolvedProfile.resetTimeoutMs ?? resolvedProfile.circuitBreakerReset,
        ...useHints ? {
            cooldownByKind: {
                rate_limit: 60_000,
                quota_exhausted: 3_600_000
            },
            classifyError: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classify429FromError"]
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAllCircuitBreakerStatuses"])().filter((status)=>{
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
    return result.reason === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
}
function parseRetryAfterFromBody(responseBody) {
    let body;
    try {
        body = toJsonRecord(typeof responseBody === "string" ? JSON.parse(responseBody) : responseBody);
    } catch  {
        return {
            retryAfterMs: null,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (Object.keys(body).length === 0) {
        return {
            retryAfterMs: null,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    // Gemini: { error: { details: [{ retryDelay: "33s" }] } }
    const error = toJsonRecord(body.error);
    const details = error.details || body.details || [];
    for (const detail of Array.isArray(details) ? details : []){
        const detailRecord = toJsonRecord(detail);
        if (detailRecord.retryDelay) {
            return {
                retryAfterMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseDelayString"])(detailRecord.retryDelay),
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
            };
        }
    }
    // OpenAI: "Please retry after 20s" in message
    const msg = String(error.message || body.message || "");
    const retryMatch = /retry\s+after\s+(\d+)\s*s/i.exec(msg);
    if (retryMatch) {
        return {
            retryAfterMs: Number.parseInt(retryMatch[1], 10) * 1000,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
        };
    }
    // Anthropic: error type classification
    const errorType = String(error.type || body.type || "");
    if (errorType === "rate_limit_error") {
        return {
            retryAfterMs: null,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED
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
    const bodyHintMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseRetryHintFromJsonBody"])(msg, MAX_PROVIDER_COOLDOWN_MS);
    if (bodyHintMs !== null) return bodyHintMs;
    // Gemini free-tier text fallback (no parseable JSON details present):
    // "Please retry in 26.660853464s." Short throttle hint — capped independently of
    // MAX_PROVIDER_COOLDOWN_MS, mirroring the JSON RetryInfo.retryDelay cap (#7940).
    const pleaseRetryMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseDelayString"])(/please retry in\s+([\d.]+\s*s)/i.exec(msg)?.[1]);
    if (pleaseRetryMs !== null && pleaseRetryMs > 0) {
        return Math.min(pleaseRetryMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$retryAfterJson$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MAX_SHORT_RETRY_HINT_MS"]);
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseDayGranularityResetMs"])(msg, MAX_PROVIDER_COOLDOWN_MS);
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
    if (!errorText) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
    const lower = String(errorText).toLowerCase();
    if (lower.includes("quota exceeded") || lower.includes("quota depleted") || lower.includes("quota will reset") || lower.includes("your quota will reset") || lower.includes("quota has been exceeded") || lower.includes("hour quota") || lower.includes("billing") || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$classify429$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["looksLikeQuotaExhausted"])(lower) || // Issue #2321: Anthropic OAuth (Claude Code Pro/Team) 429 bodies surface
    // the subscription quota with phrases that contain neither "quota" nor
    // "billing". Without these patterns the error was classified as a
    // transient RATE_LIMIT_EXCEEDED (~5s base cooldown), which cascades all
    // Pro accounts into a tight retry loop until the 5h window resets.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSubscriptionQuotaText"])(lower)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
    }
    // T10: credits_exhausted signals
    if (isCreditsExhausted(lower)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
    }
    // T06: account_deactivated signals
    if (isAccountDeactivated(lower)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR;
    }
    const configuredRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["matchErrorRuleByText"])(errorText);
    if (configuredRule?.reason) return configuredRule.reason;
    if (lower.includes("rate_limit")) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED;
    if (lower.includes("resource exhausted") || lower.includes("high demand")) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].MODEL_CAPACITY;
    if (lower.includes("unauthorized") || lower.includes("invalid api key") || lower.includes("authentication")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR;
    }
    if (lower.includes("server error") || lower.includes("internal error")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].SERVER_ERROR;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
}
function classifyError(status, errorText, context) {
    // Provider-specific rules take priority — they have the most accurate signal
    // (e.g. `x-ratelimit-remaining-requests: 0` is irrefutable account exhaustion).
    if (context?.provider) {
        const match = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderErrorRuleMatch"])(context.provider, status, context.headers ?? null, context.body);
        if (match) return match.reason;
    }
    // Text classification takes priority (more specific)
    const textReason = classifyErrorText(errorText);
    if (textReason !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN) return textReason;
    // Fall back to status code
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].UNAUTHORIZED || status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR;
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].PAYMENT_REQUIRED) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED;
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED;
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE || status === 529) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].MODEL_CAPACITY;
    }
    if (status >= 500) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].SERVER_ERROR;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
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
    const idx = Math.min(failureCount, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BACKOFF_STEPS_MS"].length - 1);
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BACKOFF_STEPS_MS"][idx];
}
function getQuotaCooldown(backoffLevel = 0) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateBackoffCooldown"])(backoffLevel);
}
function checkFallbackError(status, errorText, backoffLevel = 0, _model = null, provider = null, headers = null, profileOverride = null, structuredError, rotation) {
    const svc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serviceSupervisorCooldown"])(status, headers);
    if (svc) return svc;
    const rg = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rotationConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gateFor"](status, rotation?.account);
    if (rg) return rg;
    const errorStr = (errorText || "").toString();
    const profile = profileOverride ?? (provider ? getProviderProfile(provider) : null);
    const maxBackoffSteps = profile?.maxBackoffSteps ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].maxLevel;
    const retryableStatuses = new Set([
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].REQUEST_TIMEOUT,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVER_ERROR,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_GATEWAY,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE,
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT
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
        const baseCooldownMs = typeof profile?.baseCooldownMs === "number" && profile.baseCooldownMs >= 0 ? profile.baseCooldownMs : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transientInitial;
        // #8396: cap against profile.maxCooldownMs, mirroring the model-lockout path.
        return {
            baseCooldownMs,
            cooldownMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$cooldownCap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capScaledCooldownMs"])(getScaledCooldown(baseCooldownMs, level + 1, maxBackoffSteps), profile?.maxCooldownMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["BACKOFF_CONFIG"].max),
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
        const ro = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rotationConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["overrideFor"](reason, rotation?.account);
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
    const isRateLimitStatus = status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED;
    const preserveQuota429 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaResetParsing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPreserveQuotaSignals"])(provider, errorText);
    const shouldUseQuotaSignal = !isRateLimitStatus || preserveQuota429;
    // Check error message FIRST - specific patterns take priority over status codes
    if (errorText) {
        // T06 (sub2api #1037): Permanent account deactivation — do NOT retry, mark as permanent failure
        if (isAccountDeactivated(errorStr)) {
            return {
                shouldFallback: true,
                cooldownMs: 365 * 24 * 60 * 60 * 1000,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR,
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
        if (provider === "gemini" && status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && _model) {
            const metricClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyGeminiQuotaMetricFromText"])(errorStr);
            if (metricClass === "rpd") {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED);
            }
            if (metricClass === "rpm" || metricClass === "tpm") {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRpdExhausted"])(_model)) {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRpmExhausted"])(_model)) {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiRateLimitTracker$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isTpmExhausted"])(_model)) {
                return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
            }
        }
        // T10 (sub2api #1169) + #8247: credits/quota exhausted; *-compatible-* nicknames stay model-scoped.
        if (shouldUseQuotaSignal && isCreditsExhausted(errorStr) && !isCompatibleProvider(provider)) {
            return {
                shouldFallback: true,
                cooldownMs: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].paymentRequired ?? 3600 * 1000,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED,
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
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED,
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
            const subResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildSubscriptionQuotaFallback"])(errorStr, getUpstreamRetryHintMs, parseRetryFromErrorText, provider);
            if (subResult) return subResult;
        }
        const weeklyResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildWeeklyQuotaFallback"])(errorStr);
        if (weeklyResult) return weeklyResult;
        // Issue #7071 (session usage cap) is the same sibling gap as #3709 above —
        // runs UNCONDITIONALLY for the same reason: apikey-category providers
        // like ollama-cloud are excluded from the oauth-only shouldUseQuotaSignal
        // gate.
        const sessionResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaTextCooldowns$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildSessionQuotaFallback"])(errorStr);
        if (sessionResult) return sessionResult;
        const quotaResetHintMs = parseRetryFromErrorText(errorStr);
        if (shouldUseQuotaSignal && quotaResetHintMs && classifyErrorText(errorStr) === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED) {
            const fallbackResult = buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED);
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
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN && errorStr.toLowerCase().includes("not authorized for this route")) {
            return {
                shouldFallback: false,
                cooldownMs: 0,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
            };
        }
        if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].FORBIDDEN && provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "apikey" && !errorStr.toLowerCase().includes("has not been used in project") && !errorStr.toLowerCase().includes("hour quota") && !errorStr.toLowerCase().includes("quota has been exceeded")) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$nonRetryableUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveApiKeyForbiddenFallback"])(errorStr, buildRetryableFallback, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].AUTH_ERROR);
        }
    }
    const configuredRule = isRateLimitStatus && !preserveQuota429 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["matchErrorRuleByStatus"])(status) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findMatchingErrorRule"])(status, errorStr);
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
            const providerMatch = provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderErrorRuleMatch"])(provider, status, headers, structuredError ?? null) : null;
            const reason = providerMatch ? providerMatch.reason : configuredRule.reason ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN;
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
        const providerMatch = provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerErrorRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderErrorRuleMatch"])(provider, status, headers, structuredError ?? null) : null;
        const cooldownMs = providerMatch?.cooldownMs ?? configuredRule.cooldownMs ?? 0;
        return {
            shouldFallback: true,
            cooldownMs,
            baseCooldownMs: cooldownMs,
            configuredCooldownMs: cooldownMs,
            reason: providerMatch?.reason ?? configuredRule.reason ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].NOT_ACCEPTABLE || retryableStatuses.has(status)) {
        return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].SERVER_ERROR);
    }
    // 400 — context overflow / malformed request / model access denied
    if (status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST) {
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
        const isNimDegraded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isNimFunctionDegraded"])(errorStr);
        if (isOverflow || isMalformed || isParamValidation || isModelAccessDenied || isNimDegraded) {
            return {
                shouldFallback: true,
                cooldownMs: 0,
                reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].MODEL_CAPACITY
            };
        }
        // Some providers (e.g. MiMoCode) signal throttling with a non-standard 400 whose
        // body carries rate-limit semantics ("Detected high-frequency non-compliant
        // requests from you.") instead of a 429. Detected here (AFTER malformed/overflow
        // detection above, so a genuinely malformed 400 still wins and keeps its #2101
        // zero-cooldown MODEL_CAPACITY classification), it is fallback-worthy at
        // connection-cooldown scope so combo can fail over to another target (#4976).
        if (RATE_LIMIT_TEXT_PATTERNS.some((p)=>p.test(errorStr))) {
            return buildRetryableFallback(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].RATE_LIMIT_EXCEEDED);
        }
        // Generic 400 is not account-fallback-worthy. Combo routing may still try a
        // different provider/model because combo fallback is target-level orchestration.
        return {
            shouldFallback: false,
            cooldownMs: 0,
            reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
        };
    }
    // All other errors - fallback with transient cooldown
    return {
        shouldFallback: true,
        cooldownMs: profile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transient,
        baseCooldownMs: profile?.baseCooldownMs ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$errorConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COOLDOWN_MS"].transient,
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].UNKNOWN
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setConnectionRateLimitUntil"])(connId, null);
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
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$rateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setConnectionRateLimitUntil"])(connId, untilMs);
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
"[project]/open-sse/services/autoCombo/resilienceCandidateFilter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SYNTHETIC_NOAUTH_CONNECTION_ID",
    ()=>SYNTHETIC_NOAUTH_CONNECTION_ID,
    "filterResilienceBlockedCandidates",
    ()=>filterResilienceBlockedCandidates
]);
/**
 * #7623 — exclude models/connections the existing resilience runtime already
 * marked unavailable from `auto/*` candidate pools.
 *
 * Uses the same reads as dispatch-time account selection and the #7819
 * candidate inspector (`isModelLocked`, connection cooldown / testStatus).
 * Pure filter kept separate from `virtualFactory.ts` for unit testing, mirroring
 * `paidModelFilter.ts` and `candidateOverrides.ts` in this directory.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const SYNTHETIC_NOAUTH_CONNECTION_ID = "noauth";
const TERMINAL_CONNECTION_STATUSES = new Set([
    "banned",
    "expired",
    "credits_exhausted",
    "deactivated"
]);
function isConnectionResilienceBlocked(connection) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(connection.rateLimitedUntil)) return true;
    const status = connection.testStatus;
    if (status === "unavailable") return true;
    if (typeof status === "string" && TERMINAL_CONNECTION_STATUSES.has(status)) return true;
    return false;
}
function isConnectionEligibleForModel(provider, connectionId, model, connectionsById) {
    const connection = connectionsById.get(connectionId);
    if (connection && isConnectionResilienceBlocked(connection)) return false;
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(provider, connectionId, model);
}
function filterResilienceBlockedCandidates(pool, connectionsById) {
    if (!Array.isArray(pool) || pool.length === 0) return pool;
    let changed = false;
    const filtered = pool.flatMap((candidate)=>{
        if (candidate.connectionId === SYNTHETIC_NOAUTH_CONNECTION_ID) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(candidate.provider, SYNTHETIC_NOAUTH_CONNECTION_ID, candidate.model)) {
                changed = true;
                return [];
            }
            return [
                candidate
            ];
        }
        if (Array.isArray(candidate.allowedConnectionIds)) {
            const allowedConnectionIds = candidate.allowedConnectionIds.filter((connectionId)=>isConnectionEligibleForModel(candidate.provider, connectionId, candidate.model, connectionsById));
            if (allowedConnectionIds.length === 0) {
                changed = true;
                return [];
            }
            if (allowedConnectionIds.length === candidate.allowedConnectionIds.length) {
                return [
                    candidate
                ];
            }
            changed = true;
            return [
                {
                    ...candidate,
                    allowedConnectionIds
                }
            ];
        }
        if (candidate.connectionId) {
            if (!isConnectionEligibleForModel(candidate.provider, candidate.connectionId, candidate.model, connectionsById)) {
                changed = true;
                return [];
            }
        }
        return [
            candidate
        ];
    });
    return changed ? filtered : pool;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/virtualFactory.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "computeAdvertisedLimits",
    ()=>computeAdvertisedLimits,
    "createVirtualAutoCombo",
    ()=>createVirtualAutoCombo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modePacks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/scoring.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$providerRegistryAccessor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/providerRegistryAccessor.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/noauth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$providers$2f$webSessionCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/providers/webSessionCredentials.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/suffixComposition.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modelFamily.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/models/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/paidModelFilter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$candidateOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/candidateOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/autoCandidateOverrides.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/resilienceCandidateFilter.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function toExpiryMs(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed < 10_000_000_000 ? parsed * 1000 : parsed;
    }
    if (typeof value === "string") {
        const timestamp = new Date(value).getTime();
        return Number.isFinite(timestamp) ? timestamp : null;
    }
    return null;
}
function hasUsableOAuthToken(conn) {
    if (typeof conn.accessToken !== "string" || conn.accessToken.trim().length === 0) return false;
    const expiryMs = toExpiryMs(conn.tokenExpiresAt) ?? toExpiryMs(conn.expiresAt);
    return expiryMs === null || expiryMs > Date.now();
}
function hasProviderSpecificSessionData(conn) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$providers$2f$webSessionCredentials$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasUsableWebSessionCredential"])(conn.provider, conn.providerSpecificData);
}
function hasUsableConnectionCredential(conn) {
    const hasApiKey = typeof conn.apiKey === "string" && conn.apiKey.trim().length > 0;
    return hasApiKey || hasUsableOAuthToken(conn) || hasProviderSpecificSessionData(conn);
}
const SYNTHETIC_NOAUTH_CONNECTION_ID = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SYNTHETIC_NOAUTH_CONNECTION_ID"];
// Allowlist of no-auth (keyless) providers permitted to enter the `auto`/`auto-*`
// candidate pool. Narrowed to the backends verified to answer without any
// configuration on our reference egress (VPS .15): `opencode` and `felo-web`
// both return 200 there, while duckduckgo-web (429/VQD rate limit), theoldllm
// (403 Vercel egress block), chipotle (502), aihorde (401, anon key rejected)
// and the others are unreliable. The excluded providers stay fully usable via
// direct `<alias>/<model>` calls — they are just kept OUT of auto-routing until
// re-verified. Re-add an id here to bring it back into every auto/* pool.
//
// Scope (operator decision 2026-07-24, refs #8183/#6453/#7032): this allowlist
// targets public-HTTP-egress reliability for the category/tier and flat-variant
// `auto/*` pools (auto/best-free, auto/coding:fast, ...). It does NOT apply to
// `auto/<family>` pools (auto/glm, auto/zai, ...) — a family combo is an
// identity selector ("whatever genuinely serves GLM"), not a reliability-curated
// pool, so it admits any no-auth backend that genuinely serves the family (e.g.
// auggie, a local CLI subprocess with zero HTTP egress, belongs in auto/glm
// regardless of this list). See the `bypassAllowlist` param below.
const AUTO_COMBO_NOAUTH_ALLOWLIST = new Set([
    "opencode",
    "felo-web"
]);
function isChatAutoComboNoAuthProvider(providerDef, bypassAllowlist) {
    if (providerDef.noAuth !== true) return false;
    if (!bypassAllowlist && !AUTO_COMBO_NOAUTH_ALLOWLIST.has(providerDef.id)) return false;
    if (!Array.isArray(providerDef.serviceKinds) || providerDef.serviceKinds.length === 0) return true;
    return providerDef.serviceKinds.includes("llm");
}
function getNoAuthCandidates(excludedProviders, blockedProviders, disabledNoAuthProviders, noAuthProviderSpecificData, hiddenModelsMap, bypassAllowlist) {
    const registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$providerRegistryAccessor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderRegistry"])();
    const candidates = [];
    for (const providerDef of Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"])){
        if (!isChatAutoComboNoAuthProvider(providerDef, bypassAllowlist)) continue;
        const providerId = providerDef.id;
        if (!providerId || excludedProviders.has(providerId)) continue;
        if (blockedProviders.has(providerId) || typeof providerDef.alias === "string" && blockedProviders.has(providerDef.alias)) continue;
        // #6557: a no-auth provider with its OWN provider_connections row explicitly
        // disabled (isActive=false, the toggle on the main Providers grid card once an
        // Account/fingerprint exists) must not be routed to, even though it has no
        // entry in the separate `settings.blockedProviders` list.
        if (disabledNoAuthProviders.has(providerId) || typeof providerDef.alias === "string" && disabledNoAuthProviders.has(providerDef.alias)) continue;
        const providerInfo = registry[providerId];
        const registryModels = Array.isArray(providerInfo?.models) ? providerInfo.models : [];
        if (registryModels.length === 0) continue;
        // No-auth providers do not have provider_connections rows. Use the same
        // synthetic connection id returned by getProviderCredentials() so the
        // downstream combo path can still carry a stable target/account identity.
        // Prefer provider aliases because some canonical provider IDs are reserved
        // for credentialed tiers with different routing semantics.
        const registryAlias = typeof providerInfo?.alias === "string" && providerInfo.alias.trim().length > 0 ? providerInfo.alias : null;
        const routingPrefix = providerDef.alias || registryAlias || providerId;
        // #7622: honor the "Excluded Models" field (`providerSpecificData.excludedModels`)
        // already enforced at dispatch time (src/sse/services/auth.ts) for no-auth
        // providers' own provider_connections row (#6557), so an excluded model never
        // enters the auto-combo/fusion candidate pool in the first place.
        const providerSpecificData = noAuthProviderSpecificData.get(providerId) ?? (typeof providerDef.alias === "string" ? noAuthProviderSpecificData.get(providerDef.alias) : undefined);
        // #7620: honor the eye-icon "hidden" flag (isHidden, from the
        // modelCompatOverrides/customModels key_value namespaces) the same way the
        // credentialed-connection loop below does, so a hidden no-auth model never
        // enters the auto-combo/fusion candidate pool either.
        const hiddenModels = hiddenModelsMap.get(providerId) ?? (typeof providerDef.alias === "string" ? hiddenModelsMap.get(providerDef.alias) : undefined);
        for (const model of registryModels){
            const modelId = typeof model?.id === "string" && model.id.trim().length > 0 ? model.id : null;
            if (!modelId) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(modelId, providerSpecificData)) continue;
            if (hiddenModels?.has(modelId)) continue;
            candidates.push({
                provider: providerId,
                connectionId: SYNTHETIC_NOAUTH_CONNECTION_ID,
                model: modelId,
                modelStr: `${routingPrefix}/${modelId}`,
                costPer1MTokens: 0
            });
        }
    }
    return candidates;
}
/**
 * Creates a virtual AutoCombo configuration dynamically based on connected providers and a specified variant.
 * This combo is not persisted in the DB.
 */ /**
 * Aggregate the context window / max output to ADVERTISE for an auto combo.
 *
 * MAX across candidates (not min): the auto-combo context pre-filter
 * (combo.ts::filterTargetsByRequestCompatibility + the estimated-tokens
 * pre-filter) already routes oversized requests away from small-window
 * candidates, so advertising the largest window lets clients (e.g. opencode)
 * keep their smart auto-compaction calibrated to the best candidate instead
 * of compacting prematurely — or, worse, receiving 0 and disabling
 * compaction entirely (the "agent keeps forgetting things" bug).
 *
 * Unknown candidates resolve through getTokenLimit()'s fallback chain, so a
 * non-empty pool always yields a positive contextLength.
 *
 * maxOutputTokens has no such guaranteed fallback in getResolvedModelCapabilities()
 * — registry entries and models.dev sync data are both optional per model, so a
 * candidate pool whose members all lack that specific field (e.g. #6453's
 * provider-family combos, `auto/llama` and friends, over no-auth/free-tier
 * registry entries that were never annotated with maxOutputTokens) would
 * otherwise advertise `null`, which mirrors the `context: 0` bug this module's
 * docstring describes for contextLength (opencode disables smart auto-compaction
 * entirely when a limit is falsy). Fall back to a conservative generic default so
 * a non-empty pool always yields a positive maxOutputTokens too.
 */ const DEFAULT_ADVERTISED_MAX_OUTPUT_TOKENS = 8192;
function computeAdvertisedLimits(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
        return {
            contextLength: null,
            maxOutputTokens: null
        };
    }
    let contextLength = null;
    let maxOutputTokens = null;
    for (const candidate of candidates){
        const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTokenLimit"])(candidate.provider, candidate.model);
        if (Number.isFinite(limit) && limit > 0) {
            contextLength = contextLength === null ? limit : Math.max(contextLength, limit);
        }
        const output = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])({
            provider: candidate.provider,
            model: candidate.model
        }).maxOutputTokens;
        if (typeof output === "number" && Number.isFinite(output) && output > 0) {
            maxOutputTokens = maxOutputTokens === null ? output : Math.max(maxOutputTokens, output);
        }
    }
    if (maxOutputTokens === null) {
        maxOutputTokens = DEFAULT_ADVERTISED_MAX_OUTPUT_TOKENS;
    }
    return {
        contextLength,
        maxOutputTokens
    };
}
async function createVirtualAutoCombo(variant, spec, apiKeyId, autoChannel) {
    const [connections, disabledNoAuthConnections, settings] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
            isActive: true
        }),
        // #6557: no-auth providers (opencode/mimocode/etc.) don't get an isActive
        // filter applied above since their credential is synthetic, but a real
        // provider_connections row CAN exist for them (created via "Add Account")
        // and its own isActive=false must gate the auto-combo pool too — not just
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
            isActive: false
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])().catch(()=>({}))
    ]);
    const blockedProviders = new Set(Array.isArray(settings.blockedProviders) ? settings.blockedProviders : []);
    const disabledNoAuthProviders = new Set(disabledNoAuthConnections.filter((conn)=>conn.provider in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]).map((conn)=>conn.provider));
    const hiddenModelsMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])();
    // #7622: a no-auth provider's own provider_connections row (#6557) can carry
    // `providerSpecificData.excludedModels` regardless of its isActive state (the
    // dispatch-time enforcement in auth.ts does not gate on isActive either), so
    // gather it from BOTH the active and disabled connection lists.
    const noAuthProviderSpecificData = new Map();
    for (const conn of [
        ...connections,
        ...disabledNoAuthConnections
    ]){
        if (conn.provider in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$noauth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NOAUTH_PROVIDERS"]) {
            noAuthProviderSpecificData.set(conn.provider, conn.providerSpecificData);
        }
    }
    const validConnections = connections.filter(hasUsableConnectionCredential);
    const candidatePool = [];
    const registry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$providerRegistryAccessor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderRegistry"])();
    const connectionsByProvider = new Map();
    for (const conn of validConnections){
        const providerConnections = connectionsByProvider.get(conn.provider) ?? [];
        providerConnections.push(conn);
        connectionsByProvider.set(conn.provider, providerConnections);
    }
    // Build one logical candidate per provider/model and keep account fallback as an
    // allowlist on that candidate. This avoids both the old "first registry model per
    // connection" blind spot and a connections × models Cartesian candidate pool.
    for (const [providerId, providerConnections] of connectionsByProvider){
        const providerInfo = registry[providerId];
        const registryModelIds = Array.isArray(providerInfo?.models) ? providerInfo.models.map((model)=>typeof model?.id === "string" ? model.id.trim() : "").filter(Boolean) : [];
        const registryModelIdSet = new Set(registryModelIds);
        const defaultModelIds = providerConnections.map((conn)=>typeof conn.defaultModel === "string" ? conn.defaultModel.trim() : "").filter(Boolean);
        const modelIds = Array.from(new Set([
            ...registryModelIds,
            ...defaultModelIds
        ]));
        const hiddenModels = hiddenModelsMap.get(providerId);
        for (const modelId of modelIds){
            if (hiddenModels?.has(modelId)) continue;
            const allowedConnectionIds = providerConnections.filter((conn)=>{
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$connectionModelRules$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isModelExcludedByConnection"])(modelId, conn.providerSpecificData)) return false;
                // Registry models are provider-wide. A non-registry default (for a custom
                // or passthrough model) is scoped only to connections that selected it.
                return registryModelIdSet.has(modelId) || conn.defaultModel?.trim() === modelId;
            }).map((conn)=>conn.id);
            if (allowedConnectionIds.length === 0) continue;
            candidatePool.push({
                provider: providerId,
                connectionId: null,
                allowedConnectionIds,
                model: modelId,
                modelStr: `${providerId}/${modelId}`,
                costPer1MTokens: 0
            });
        }
    }
    candidatePool.push(...getNoAuthCandidates(new Set(validConnections.map((conn)=>conn.provider)), blockedProviders, disabledNoAuthProviders, noAuthProviderSpecificData, hiddenModelsMap, // #6453/#8183 (operator decision 2026-07-24): auto/<family> combos are an
    // identity selector, not a reliability-curated pool — bypass the no-auth
    // allowlist gate so any backend that genuinely serves the family (e.g.
    // auggie for auto/glm) is admitted. Category/tier and flat-variant pools
    // (spec.family unset) keep the allowlist gate intact.
    Boolean(spec?.family)));
    // #7623: honor existing model lockouts + connection cooldown/terminal state so
    // auto/* never advertises models the dispatch path would immediately skip.
    const connectionsById = new Map();
    for (const conn of [
        ...connections,
        ...disabledNoAuthConnections
    ]){
        connectionsById.set(conn.id, conn);
    }
    const resilienceFilteredPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$resilienceCandidateFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterResilienceBlockedCandidates"])(candidatePool, connectionsById);
    if (resilienceFilteredPool !== candidatePool) {
        candidatePool.length = 0;
        candidatePool.push(...resilienceFilteredPool);
    }
    // #6512 (follow-up to #6328/#6495): when the operator opts into `hidePaidModels`,
    // exclude paid-only backends from EVERY `auto/*` candidate pool — not just the
    // `/v1/models` listing — so auto-routing never picks a model that will 402/403.
    // If this empties the pool the existing graceful empty-pool path below handles it
    // (consistent with the opt-in intent). Default OFF → pool unchanged.
    const paidFilteredPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$paidModelFilter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterPaidOnlyCandidates"])(candidatePool, settings.hidePaidModels === true);
    if (paidFilteredPool !== candidatePool) {
        candidatePool.length = 0;
        candidatePool.push(...paidFilteredPool);
    }
    // #7819 (Level 2): per-API-key candidate exclusions. Fail-open — an absent
    // apiKeyId/autoChannel (every caller before #7819) or a DB lookup failure
    // both leave the pool untouched, so default (unconfigured) routing stays
    // byte-identical to pre-#7819 behavior.
    let excludedConnectionIds = new Set();
    if (apiKeyId && autoChannel) {
        try {
            excludedConnectionIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$autoCandidateOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getExcludedConnectionIds"])(apiKeyId, autoChannel);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", "Failed to load auto-candidate overrides; routing unfiltered", {
                err
            });
        }
    }
    const overrideFilteredPool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$candidateOverrides$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterExcludedCandidates"])(candidatePool, excludedConnectionIds);
    if (overrideFilteredPool !== candidatePool) {
        candidatePool.length = 0;
        candidatePool.push(...overrideFilteredPool);
    }
    if (candidatePool.length === 0) {
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", "No connected providers with valid credentials for virtual auto-combo");
        const emptyPool = [];
        const autoConfig = {
            candidatePool: emptyPool,
            weights: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_WEIGHTS"]
            },
            explorationRate: 0.05,
            routerStrategy: "lkgp"
        };
        return {
            id: `virtual-auto-${variant || "default"}`,
            name: `Auto ${variant || "Default"}`,
            type: "auto",
            strategy: "auto",
            models: [],
            candidatePool: emptyPool,
            weights: autoConfig.weights,
            explorationRate: autoConfig.explorationRate,
            routerStrategy: autoConfig.routerStrategy,
            autoConfig,
            config: {
                auto: autoConfig
            },
            advertisedContextLength: null,
            advertisedMaxOutputTokens: null
        };
    }
    // #4235 Phase B: narrow the pool by the `auto/<category>:<tier>` overlay
    // (vision/reasoning capability, free/premium model tier).
    //
    // Default behavior: when the filter yields zero candidates, return an EMPTY
    // pool — never silently fall back to the full pool. This makes
    // `auto/coding:free` actually mean "free tier only" and prevents a paid
    // expensive model from being picked just because no free provider is
    // connected. Operators who want the old "never break routing, lose the bias"
    // behavior can opt back in via the env var below.
    let effectivePool = candidatePool;
    // #6453: `auto/<family>` narrows by model family instead of category/tier. The
    // two overlays are mutually exclusive on the spec (family takes precedence when
    // both are somehow present, which callers never do in practice).
    const candidateFilter = spec?.family ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildFamilyCandidateFilter"])(spec.family) : spec ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAutoCandidateFilter"])(spec.category, spec.tier) : null;
    if (candidateFilter) {
        const narrowed = candidatePool.filter((c)=>candidateFilter({
                provider: c.provider,
                model: c.model
            }));
        const label = spec?.family ? `auto/${spec.family}` : `auto/${spec?.category ?? ""}${spec?.tier ? `:${spec.tier}` : ""}`;
        if (narrowed.length > 0) {
            effectivePool = narrowed;
        } else if (!spec?.family && (process.env.OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL === "true" || process.env.OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL === "1")) {
            // Opt-in legacy behavior (category/tier only): warn loudly, then keep the full pool.
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", `${label} matched no connected models; falling back to the full pool (OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL=true)`);
        } else {
            // Family combos always degrade to an empty pool when unavailable — a family
            // is a hard identity constraint, not a soft optimization bias, so there is
            // no sensible "fall back to the full pool" behavior for it.
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["defaultLogger"].warn("AUTO", `${label} matched no connected models; returning an empty pool.${spec?.family ? "" : ' Set OMNIROUTE_AUTO_FREE_FALLBACK_TO_FULL_POOL=true to restore the legacy "use full pool" behavior.'}`);
            effectivePool = [];
        }
    }
    let weights = {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_WEIGHTS"]
    };
    let explorationRate = 0.05; // Default exploration rate
    let routerStrategy = "lkgp"; // All auto variants use LKGP
    switch(variant){
        case "coding":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["quality-first"]
            };
            break;
        case "fast":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["ship-fast"]
            };
            break;
        case "cheap":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["cost-saver"]
            };
            break;
        case "offline":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["offline-friendly"]
            };
            break;
        case "smart":
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["quality-first"]
            };
            explorationRate = 0.1; // Override default exploration rate
            break;
        case "lkgp":
            break;
        case "chaos":
            // Chaos mode: select top-N most stable models and fan them out in parallel
            // (strategy "fusion"). Prioritize health + stability via the chaos-mode pack.
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["chaos-mode"]
            };
            explorationRate = 0; // no exploration — only the proven-stable set
            break;
        case undefined:
            break;
    }
    // #4235 Phase B: category/tier weight overlay. A non-chat category leans
    // quality-first; the tier then refines toward latency (fast), cost (cheap/floor)
    // or availability (reliable). free/pro keep the base weights — their bias is the
    // candidate filter above (free → free-tier models, pro → premium models).
    if (spec) {
        if (spec.category && spec.category !== "chat") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["quality-first"]
            };
        }
        const weightVariant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tierToWeightVariant"])(spec.tier);
        if (weightVariant === "fast") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["ship-fast"]
            };
        } else if (weightVariant === "cheap") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["cost-saver"]
            };
        } else if (weightVariant === "reliability") {
            weights = {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"]["reliability-first"]
            };
        }
    }
    const providerPool = [
        ...new Set(effectivePool.map((c)=>c.provider))
    ];
    const models = effectivePool.map((candidate, index)=>({
            id: `virtual-auto-${variant || "default"}-${index + 1}-${candidate.provider}`,
            kind: "model",
            model: candidate.modelStr,
            providerId: candidate.provider,
            connectionId: candidate.connectionId,
            ...candidate.allowedConnectionIds ? {
                allowedConnectionIds: candidate.allowedConnectionIds
            } : {},
            weight: 1,
            label: candidate.provider
        }));
    const autoConfig = {
        candidatePool: providerPool,
        weights,
        explorationRate,
        routerStrategy
    };
    // Chaos mode fans out to the top-N most stable models in parallel. Panel size
    // is capped to keep a single IDE request from fanning out to dozens of providers;
    // operators can override via env var OMNIROUTE_CHAOS_MAX_PANEL (default 5).
    //
    // Provider diversity: when multiple candidates from the same provider exist, only
    // the highest-scored model per provider is included. This prevents a single
    // provider from monopolizing the panel and gives the IDE truly diverse answers.
    const isChaos = variant === "chaos";
    const CHAOS_MAX_PANEL = (()=>{
        const env = process.env.OMNIROUTE_CHAOS_MAX_PANEL;
        const parsed = env ? parseInt(env, 10) : 5;
        return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10) : 5;
    })();
    let chaosModels;
    if (isChaos) {
        // Deduplicate by provider: keep first occurrence per provider (models are
        // already scored/sorted by health + stability from scoring).
        const seenProviders = new Set();
        const diverse = [];
        for (const m of models){
            if (seenProviders.has(m.providerId)) continue;
            seenProviders.add(m.providerId);
            diverse.push(m);
            if (diverse.length >= CHAOS_MAX_PANEL) break;
        }
        chaosModels = diverse.length > 0 ? diverse : models.slice(0, CHAOS_MAX_PANEL);
    } else {
        chaosModels = models;
    }
    const advertisedLimits = computeAdvertisedLimits(effectivePool);
    return {
        id: `virtual-auto-${variant || "default"}`,
        name: `Auto ${variant || "Default"}`,
        type: "auto",
        strategy: "auto",
        models: chaosModels,
        candidatePool: providerPool,
        weights,
        explorationRate,
        routerStrategy,
        autoConfig,
        // For chaos, stash the panel size + a flag so downstream handlers can detect
        // the broadcast mode and stream each panel model back to IDEs that opt in.
        config: {
            auto: autoConfig,
            ...isChaos ? {
                chaos: {
                    enabled: true,
                    panelSize: chaosModels.length,
                    judgeModel: chaosModels[0]?.model,
                    tuning: {
                        panelHardTimeoutMs: Number(process.env.OMNIROUTE_CHAOS_PANEL_TIMEOUT_MS) || undefined,
                        minPanel: Number(process.env.OMNIROUTE_CHAOS_MIN_PANEL) || undefined
                    }
                }
            } : {}
        },
        advertisedContextLength: advertisedLimits.contextLength,
        advertisedMaxOutputTokens: advertisedLimits.maxOutputTokens
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_1s9njbj._.js.map