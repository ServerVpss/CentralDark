module.exports = [
"[project]/open-sse/services/autoCombo/providerDiversity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Provider Diversity Tracking via Shannon Entropy
 *
 * Measures and tracks how evenly distributed requests are across providers.
 * A system routing 90% of traffic to one provider has a catastrophic single
 * point of failure. This module provides a diversity score [0..1] that can
 * be used as a scoring factor in auto-combo selection.
 *
 * Shannon entropy normalized to [0..1]:
 *   - 0.0 = all requests go to one provider (maximum risk)
 *   - 1.0 = perfectly even distribution (minimum risk)
 *
 * @see https://en.wikipedia.org/wiki/Entropy_(information_theory)
 */ /** Rolling window entry for provider usage tracking */ __turbopack_context__.s([
    "calculateDiversityScore",
    ()=>calculateDiversityScore,
    "configureDiversity",
    ()=>configureDiversity,
    "getDiversityReport",
    ()=>getDiversityReport,
    "getProviderDiversityBoost",
    ()=>getProviderDiversityBoost,
    "recordProviderUsage",
    ()=>recordProviderUsage,
    "resetDiversity",
    ()=>resetDiversity
]);
const DEFAULT_CONFIG = {
    windowSize: 200,
    ttlMs: 3_600_000
};
/** In-memory rolling window of recent provider usage */ let usageWindow = [];
let config = {
    ...DEFAULT_CONFIG
};
function configureDiversity(userConfig) {
    config = {
        ...DEFAULT_CONFIG,
        ...userConfig
    };
}
function recordProviderUsage(provider) {
    const now = Date.now();
    usageWindow.push({
        provider,
        timestamp: now
    });
    // Prune by window size
    if (usageWindow.length > config.windowSize) {
        usageWindow = usageWindow.slice(-config.windowSize);
    }
    // Prune by TTL
    const cutoff = now - config.ttlMs;
    usageWindow = usageWindow.filter((e)=>e.timestamp >= cutoff);
}
function calculateDiversityScore() {
    if (usageWindow.length === 0) return 1.0; // No data = assume diverse
    const now = Date.now();
    const cutoff = now - config.ttlMs;
    const recent = usageWindow.filter((e)=>e.timestamp >= cutoff);
    if (recent.length === 0) return 1.0;
    // Count occurrences per provider
    const counts = new Map();
    for (const entry of recent){
        counts.set(entry.provider, (counts.get(entry.provider) || 0) + 1);
    }
    const total = recent.length;
    const nUnique = counts.size;
    if (nUnique <= 1) return 0.0;
    // Shannon entropy
    let entropy = 0;
    for (const count of counts.values()){
        const p = count / total;
        entropy -= p * Math.log2(p);
    }
    // Normalize by maximum possible entropy
    const maxEntropy = Math.log2(nUnique);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
}
function getProviderDiversityBoost(provider) {
    if (usageWindow.length === 0) return 0.5; // No data = neutral
    const now = Date.now();
    const cutoff = now - config.ttlMs;
    const recent = usageWindow.filter((e)=>e.timestamp >= cutoff);
    if (recent.length === 0) return 0.5;
    const total = recent.length;
    const providerCount = recent.filter((e)=>e.provider === provider).length;
    // Inverse usage share: providers used less get higher boost
    const usageShare = providerCount / total;
    return Math.max(0, 1 - usageShare);
}
function getDiversityReport() {
    const now = Date.now();
    const cutoff = now - config.ttlMs;
    const recent = usageWindow.filter((e)=>e.timestamp >= cutoff);
    const counts = new Map();
    for (const entry of recent){
        counts.set(entry.provider, (counts.get(entry.provider) || 0) + 1);
    }
    const providers = {};
    for (const [provider, count] of counts){
        providers[provider] = {
            count,
            share: recent.length > 0 ? count / recent.length : 0
        };
    }
    return {
        score: calculateDiversityScore(),
        totalRequests: recent.length,
        providers,
        windowSize: config.windowSize,
        ttlMs: config.ttlMs
    };
}
function resetDiversity() {
    usageWindow = [];
    config = {
        ...DEFAULT_CONFIG
    };
}
}),
"[project]/open-sse/services/autoCombo/taskFitness.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearUserFitnessOverride",
    ()=>clearUserFitnessOverride,
    "getModelsDevTierFitness",
    ()=>getModelsDevTierFitness,
    "getStaticFitnessTableScore",
    ()=>getStaticFitnessTableScore,
    "getTaskFitness",
    ()=>getTaskFitness,
    "getTaskFitnessWithSource",
    ()=>getTaskFitnessWithSource,
    "getTaskTypes",
    ()=>getTaskTypes,
    "invalidateFitnessCache",
    ()=>invalidateFitnessCache,
    "setUserFitnessOverride",
    ()=>setUserFitnessOverride
]);
/**
 * Task Fitness Lookup Table
 *
 * Maps model patterns × task types → fitness score [0..1].
 * Supports wildcards and prefix matching.
 *
 * Resolution chain (highest → lowest priority):
 * 1. User override — DB `model_intelligence` where source='user_override'
 * 2. Arena ELO — DB `model_intelligence` where source='arena_elo'
 * 3. Models.dev tier — derived from `model_capabilities` table capability data
 * 4. Static FITNESS_TABLE — existing hardcoded lookup (current behavior)
 * 5. Wildcard boosts — existing pattern matching boosts (current behavior)
 */ // ─── Static fitness table (unchanged, fallback layer 4) ─────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/modelIntelligence.ts [instrumentation] (ecmascript)");
;
;
const FITNESS_TABLE = {
    coding: {
        "claude-sonnet": 0.95,
        "claude-opus": 0.92,
        "claude-haiku": 0.78,
        "gpt-4o": 0.9,
        "gpt-4o-mini": 0.8,
        "gpt-4-turbo": 0.88,
        o1: 0.93,
        o3: 0.95,
        "o4-mini": 0.88,
        codex: 0.98,
        "gemini-pro": 0.85,
        "gemini-flash": 0.8,
        "gemini-2.5-pro": 0.92,
        "gemini-2.5-flash": 0.82,
        "deepseek-coder": 0.9,
        "deepseek-v3": 0.85,
        "deepseek-r1": 0.88,
        "deepseek-chat": 0.84,
        "deepseek-v3.2": 0.86,
        qwen: 0.78,
        llama: 0.72,
        mistral: 0.75,
        mixtral: 0.77,
        // Grok-4 fast — good code, ultra-low latency (1143ms P50)
        "grok-4-fast": 0.8,
        "grok-4": 0.82,
        "grok-3": 0.8,
        // Kimi K2.5 — agentic with tool calling, good at code tasks
        "kimi-k2": 0.82,
        // GLM-5.1 / GLM-5 — Z.AI reasoning models, 200K context / 128k output
        "glm-5.1": 0.78,
        "glm-5": 0.78,
        // MiniMax M2.5 — reasoning support helps complex code
        "minimax-m2.5": 0.75,
        "minimax-m2": 0.72
    },
    review: {
        "claude-sonnet": 0.92,
        "claude-opus": 0.95,
        "claude-haiku": 0.7,
        "gpt-4o": 0.88,
        "gpt-4o-mini": 0.72,
        o1: 0.9,
        o3: 0.92,
        "gemini-pro": 0.9,
        "gemini-2.5-pro": 0.93,
        "gemini-flash": 0.75,
        "deepseek-r1": 0.85,
        "deepseek-v3": 0.8
    },
    planning: {
        "claude-opus": 0.95,
        "claude-sonnet": 0.9,
        "gpt-4o": 0.88,
        o1: 0.92,
        o3: 0.95,
        "gemini-2.5-pro": 0.93,
        "gemini-pro": 0.88,
        "deepseek-r1": 0.85
    },
    analysis: {
        "claude-opus": 0.95,
        "claude-sonnet": 0.92,
        "gemini-2.5-pro": 0.95,
        "gemini-pro": 0.88,
        "gemini-3.1-pro": 0.95,
        "gpt-4o": 0.85,
        o1: 0.9,
        o3: 0.93,
        "deepseek-r1": 0.88,
        "deepseek-chat": 0.8,
        "kimi-k2": 0.82,
        "glm-5.1": 0.82,
        "glm-5": 0.78,
        "minimax-m2.5": 0.76
    },
    debugging: {
        "claude-sonnet": 0.93,
        "claude-opus": 0.9,
        "gpt-4o": 0.88,
        o1: 0.85,
        "deepseek-coder": 0.9,
        "deepseek-v3": 0.82,
        "gemini-flash": 0.78,
        codex: 0.92
    },
    documentation: {
        "claude-sonnet": 0.9,
        "claude-opus": 0.88,
        "gpt-4o": 0.92,
        "gpt-4o-mini": 0.85,
        "gemini-pro": 0.88,
        "gemini-flash": 0.82,
        "deepseek-v3": 0.78
    },
    default: {
        "claude-sonnet": 0.85,
        "claude-opus": 0.85,
        "gpt-4o": 0.85,
        "gemini-pro": 0.8,
        "gemini-3.1-pro": 0.85,
        "deepseek-v3": 0.75,
        "deepseek-chat": 0.74,
        "gemini-flash": 0.72,
        // New models from ClawRouter analysis (2026-03-17):
        "grok-4-fast": 0.72,
        "grok-4": 0.74,
        "grok-3": 0.73,
        "kimi-k2": 0.76,
        "glm-5.1": 0.75,
        "glm-5": 0.7,
        "minimax-m2.5": 0.7
    }
};
// Wildcard patterns: model substrings → task type boosts
const WILDCARD_BOOSTS = [
    {
        pattern: "coder",
        taskType: "coding",
        boost: 0.15
    },
    {
        pattern: "code",
        taskType: "coding",
        boost: 0.1
    },
    {
        pattern: "fast",
        taskType: "coding",
        boost: 0.05
    },
    {
        pattern: "thinking",
        taskType: "planning",
        boost: 0.1
    },
    {
        pattern: "thinking",
        taskType: "analysis",
        boost: 0.1
    }
];
// ─── Models.dev tier → task fitness mapping (resolution layer 3) ────────
/**
 * Intelligence tier derived from models.dev capability data.
 * Tier assignment rules:
 * - `reasoning === true` → "premium"
 * - `tool_call === true && context >= 128000` → "standard"
 * - `tool_call === true` → "fast"
 * - everything else → "budget"
 */ const TIER_TASK_FITNESS = {
    premium: {
        coding: 0.92,
        review: 0.93,
        planning: 0.94,
        analysis: 0.95,
        debugging: 0.9,
        documentation: 0.88,
        default: 0.85
    },
    standard: {
        coding: 0.85,
        review: 0.84,
        planning: 0.85,
        analysis: 0.85,
        debugging: 0.82,
        documentation: 0.85,
        default: 0.78
    },
    fast: {
        coding: 0.78,
        review: 0.72,
        planning: 0.7,
        analysis: 0.72,
        debugging: 0.75,
        documentation: 0.8,
        default: 0.72
    },
    budget: {
        coding: 0.65,
        review: 0.6,
        planning: 0.55,
        analysis: 0.58,
        debugging: 0.6,
        documentation: 0.7,
        default: 0.55
    }
};
// ─── DB access helpers ──────────────────────────────────────────────────
const _intelligenceCache = new Map();
function queryModelIntelligence(model, category, source) {
    const cacheKey = `${model}:${category}:${source}`;
    if (_intelligenceCache.has(cacheKey)) {
        return _intelligenceCache.get(cacheKey);
    }
    try {
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelIntelligenceBySource"])(model, source, category);
        if (entry) {
            _intelligenceCache.set(cacheKey, entry.score);
            return entry.score;
        }
        return null;
    } catch  {
        return null;
    }
}
// ─── Models.dev capability → tier → fitness resolution ──────────────────
let _capabilitiesCache = null;
function deriveTierFromCapabilities(cap) {
    if (cap.reasoning === true) return "premium";
    if (cap.tool_call === true && (cap.limit_context ?? 0) >= 128000) return "standard";
    if (cap.tool_call === true) return "fast";
    return "budget";
}
function loadModelCapabilities() {
    if (_capabilitiesCache) return _capabilitiesCache;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='model_capabilities'").get();
        if (!tableExists) return null;
        const rows = db.prepare("SELECT * FROM model_capabilities").all();
        const cache = {};
        for (const row of rows){
            const modelId = typeof row.model_id === "string" ? row.model_id : "";
            if (!modelId) continue;
            cache[modelId.toLowerCase()] = {
                tool_call: row.tool_call === true || row.tool_call === 1 ? true : row.tool_call === false || row.tool_call === 0 ? false : null,
                reasoning: row.reasoning === true || row.reasoning === 1 ? true : row.reasoning === false || row.reasoning === 0 ? false : null,
                limit_context: typeof row.limit_context === "number" ? row.limit_context : null
            };
        }
        _capabilitiesCache = cache;
        return cache;
    } catch  {
        return null;
    }
}
function getModelsDevTierFitness(model, taskType) {
    const normalizedModel = model.toLowerCase();
    const normalizedTask = taskType.toLowerCase();
    const dbScore = queryModelIntelligence(normalizedModel, normalizedTask, "models_dev_tier");
    if (dbScore !== null) return dbScore;
    const caps = loadModelCapabilities();
    if (!caps) return null;
    const capRow = caps[normalizedModel];
    if (!capRow) return null;
    const tier = deriveTierFromCapabilities(capRow);
    const tierScores = TIER_TASK_FITNESS[tier];
    if (!tierScores) return null;
    return tierScores[normalizedTask] ?? tierScores.default ?? null;
}
function getStaticFitnessTableScore(model, taskType) {
    const normalizedModel = model.toLowerCase();
    const normalizedTask = taskType.toLowerCase();
    const table = FITNESS_TABLE[normalizedTask] || FITNESS_TABLE.default;
    const sortedEntries = Object.entries(table).sort((a, b)=>b[0].length - a[0].length);
    for (const [pattern, score] of sortedEntries){
        if (normalizedModel.includes(pattern)) return score;
    }
    return null;
}
function lookupStaticFitnessTable(normalizedModel, normalizedTask) {
    return getStaticFitnessTableScore(normalizedModel, normalizedTask);
}
function lookupWildcardBoosts(normalizedModel, normalizedTask) {
    let baseScore = 0.5;
    for (const wc of WILDCARD_BOOSTS){
        if (normalizedModel.includes(wc.pattern) && normalizedTask === wc.taskType) {
            baseScore += wc.boost;
        }
    }
    return Math.min(1.0, baseScore);
}
function getTaskFitness(model, taskType) {
    return getTaskFitnessWithSource(model, taskType).score;
}
function getTaskFitnessWithSource(model, taskType) {
    const normalizedModel = model.toLowerCase();
    const normalizedTask = taskType.toLowerCase();
    const userOverride = queryModelIntelligence(normalizedModel, normalizedTask, "user_override");
    if (userOverride !== null) {
        return {
            score: userOverride,
            source: "user_override"
        };
    }
    // Try arena_elo with the literal model id first (e.g. "mimo-v2.5"). If that's
    // a miss and the model id carries a "-free" suffix (e.g. "mimo-v2.5-free"),
    // try the un-suffixed base id so free-tier variants inherit the arena_elo
    // score of their paid counterpart. This is what operators expect: the
    // upstream's `mimo-v2.5` is benchmarked once, and `mimo-v2.5-free` should
    // pick up the same signal rather than falling through to the wildcard 0.5
    // and losing every free-vs-paid comparison.
    const arenaElo = queryModelIntelligence(normalizedModel, normalizedTask, "arena_elo");
    if (arenaElo !== null) {
        return {
            score: arenaElo,
            source: "arena_elo"
        };
    }
    const arenaEloBase = lookupFreeAliasArenaElo(normalizedModel, normalizedTask);
    if (arenaEloBase !== null) {
        return {
            score: arenaEloBase,
            source: "arena_elo_free_alias"
        };
    }
    const tierScore = getModelsDevTierFitness(normalizedModel, normalizedTask);
    if (tierScore !== null) {
        return {
            score: tierScore,
            source: "models_dev_tier"
        };
    }
    const staticScore = lookupStaticFitnessTable(normalizedModel, normalizedTask);
    if (staticScore !== null) {
        return {
            score: staticScore,
            source: "fitness_table"
        };
    }
    return {
        score: lookupWildcardBoosts(normalizedModel, normalizedTask),
        source: "wildcard_boost"
    };
}
/** Suffix used to mark free-tier model variants (e.g. "mimo-v2.5-free"). */ const FREE_SUFFIX = "-free";
/**
 * Strip a trailing "-free" suffix from the model id and re-query arena_elo.
 * Returns `null` when the original id has no "-free" suffix, when the base id
 * is identical to the original, or when no arena_elo row exists for the base.
 *
 * Examples:
 *   "mimo-v2.5-free"   → look up "mimo-v2.5"
 *   "deepseek-v4-flash-free" → look up "deepseek-v4-flash"
 *   "big-pickle"       → no "-free" suffix → return null (skip)
 */ function lookupFreeAliasArenaElo(normalizedModel, normalizedTask) {
    if (!normalizedModel.endsWith(FREE_SUFFIX)) return null;
    const baseId = normalizedModel.slice(0, -FREE_SUFFIX.length);
    if (baseId.length === 0 || baseId === normalizedModel) return null;
    return queryModelIntelligence(baseId, normalizedTask, "arena_elo");
}
function setUserFitnessOverride(model, category, score) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setUserFitnessOverrideEntry"])(model.toLowerCase(), category.toLowerCase(), score);
        invalidateFitnessCache();
    } catch (err) {
        throw new Error(`Failed to set user fitness override for ${model}/${category}: ${err instanceof Error ? err.message : String(err)}`);
    }
}
function clearUserFitnessOverride(model, category) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$modelIntelligence$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteUserFitnessOverrideEntry"])(model.toLowerCase(), category.toLowerCase());
        invalidateFitnessCache();
    } catch (err) {
        throw new Error(`Failed to clear user fitness override for ${model}/${category}: ${err instanceof Error ? err.message : String(err)}`);
    }
}
function getTaskTypes() {
    return Object.keys(FITNESS_TABLE).filter((k)=>k !== "default");
}
function invalidateFitnessCache() {
    _capabilitiesCache = null;
    _intelligenceCache.clear();
}
}),
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
"[project]/open-sse/services/autoCombo/chaosEngine.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHAOS_DEFAULTS",
    ()=>CHAOS_DEFAULTS,
    "dispatchChaosFromCombo",
    ()=>dispatchChaosFromCombo,
    "handleChaosChat",
    ()=>handleChaosChat,
    "runChaosPanel",
    ()=>runChaosPanel,
    "serializeChaosPart",
    ()=>serializeChaosPart
]);
/**
 * Chaos Engine — parallel multi-model dispatch for the `auto/chaos` auto-model.
 *
 * Goal: pick the N most *stable* connected models, fan the same prompt out to
 * all of them in parallel, then return a single merged SSE stream so an IDE that
 * can only issue ONE request / hold ONE agent still receives all N model answers
 * at once.
 *
 * Design notes:
 *   - Selection is done by the caller (virtualFactory → createVirtualAutoCombo)
 *     which already scores candidates with the `chaos-mode` weight pack (health +
 *     stability dominant), so `models` here is already the proven-stable set.
 *   - Dispatch is fully parallel. A slow/hung model is bounded by
 *     `panelHardTimeoutMs` and, crucially, its underlying request is *aborted* on
 *     timeout (not merely resolved-to-fallback) so the connection is released.
 *   - Broadcast is PROGRESSIVE: each panel model's answer is enqueued onto the
 *     SSE stream the moment that model lands — the client does not wait for the
 *     whole panel to finish before receiving the first part. Each part is wrapped
 *     in an SSE `omni-chaos-part` event carrying its own model id. IDEs that
 *     understand the protocol can render several panels; IDEs that don't just see
 *     the canonical final block (the highest-scoring model's answer is used as the
 *     final response chunk).
 *   - Unlike fusion, chaos does NOT run a separate judge synthesis call — it
 *     surfaces raw per-model outputs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
;
const CHAOS_DEFAULTS = {
    /** Absolute cap on wall time for the whole panel. */ panelHardTimeoutMs: 120_000,
    /** If fewer than this many succeed, fall back to a plain single-model answer. */ minPanel: 1
};
function serializeChaosPart(part, isFinal) {
    const meta = {
        type: "omni-chaos-part",
        model: part.model,
        index: part.index,
        ok: part.ok,
        final: isFinal,
        ...part.error ? {
            error: part.error
        } : {}
    };
    return `: chaos ${part.index} ${part.ok ? "ok" : "fail"} ${part.model}\n` + `event: omni-chaos-part\n` + `data: ${JSON.stringify(meta)}\n\n`;
}
/**
 * Promise that resolves to `fallback` after `ms`, calling `onTimeout` (e.g. to
 * abort the underlying request) so a slow/hung model releases its connection
 * instead of leaking a dangling fetch.
 */ function withTimeout(p, ms, fallback, onTimeout) {
    if (!Number.isFinite(ms) || ms <= 0) return p;
    return new Promise((resolve)=>{
        const timer = setTimeout(()=>{
            onTimeout?.();
            resolve(fallback);
        }, ms);
        p.then((v)=>{
            clearTimeout(timer);
            resolve(v);
        }, ()=>{
            clearTimeout(timer);
            resolve(fallback);
        });
    });
}
/** Encoded SSE string builder — avoids re-encoding the same separator. */ const SSE_SEP = "\n\n";
const SSE_DONE = "data: [DONE]\n\n";
/**
 * Build a standard OpenAI-style chat.completion.chunk SSE data line.
 */ function chatChunk(id, model, content, finishReason = "stop") {
    return `data: ${JSON.stringify({
        id,
        object: "chat.completion.chunk",
        model,
        choices: [
            {
                index: 0,
                delta: {
                    role: "assistant",
                    content
                },
                finish_reason: finishReason
            }
        ]
    })}` + SSE_SEP;
}
/**
 * Run the chaos panel. Returns the ordered parts plus a recommended "primary"
 * part (highest index of a successful model, or the first success) that callers
 * can use as the canonical response body for non-aware clients.
 *
 * Each panel call gets its own AbortController; `withTimeout` aborts it on
 * timeout so the underlying request is cancelled, not merely superseded.
 */ /**
 * Shared per-model dispatch: wraps a single chaos panel call with timeout + abort.
 * Used by both runChaosPanel and handleChaosChat to avoid code duplication.
 */ function dispatchOnePanelModel(opts) {
    const { body, model, index, handleSingleModel, ctrl, hardTimeout, log, onResult } = opts;
    return withTimeout((async ()=>{
        try {
            const res = await handleSingleModel(body, model, {
                modelAbortSignal: ctrl.signal
            });
            const text = await extractText(res);
            log?.info?.(`CHAOS panel ${index} (${model}) ok=${res.ok} status=${res.status} textLen=${text.length}`);
            const part = {
                model,
                index,
                ok: true,
                text
            };
            await onResult?.(part);
            return part;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            log?.warn?.(`CHAOS panel ${index} (${model}) failed:`, msg);
            const part = {
                model,
                index,
                ok: false,
                text: "",
                error: msg
            };
            await onResult?.(part);
            return part;
        }
    })(), hardTimeout, {
        model,
        index,
        ok: false,
        text: "",
        error: "chaos-panel-timeout"
    }, ()=>ctrl.abort());
}
async function runChaosPanel(opts) {
    const { body, models, handleSingleModel, log, tuning } = opts;
    const panel = Array.isArray(models) ? models.filter(Boolean) : [];
    const hardTimeout = tuning?.panelHardTimeoutMs ?? CHAOS_DEFAULTS.panelHardTimeoutMs;
    if (panel.length === 0) {
        return {
            parts: [],
            primary: null
        };
    }
    const controllers = panel.map(()=>new AbortController());
    const calls = panel.map((model, index)=>dispatchOnePanelModel({
            body,
            model,
            index,
            handleSingleModel,
            ctrl: controllers[index],
            hardTimeout,
            log
        }));
    const parts = await Promise.all(calls);
    // Release all abort controllers (those not already aborted by timeout).
    for (const ac of controllers){
        if (!ac.signal.aborted) ac.abort();
    }
    const successes = parts.filter((p)=>p.ok);
    const primary = successes.length > 0 ? successes[successes.length - 1] : null;
    log?.info?.(`CHAOS panel complete: ${successes.length}/${parts.length} succeeded`);
    return {
        parts,
        primary
    };
}
/**
 * Pull assistant text out of an OpenAI-style OR Anthropic-style Response body.
 * Clones the response first (body is single-consume; fusion.ts does the same),
 * then tries JSON first and falls back to SSE concat — content-type headers are
 * not reliable here because OmniRoute may force a streaming envelope internally.
 */ async function extractText(res) {
    // Include error status info when non-200, so the dispatch caller can log it.
    if (!res.ok) {
        try {
            const errBody = await res.clone().text();
            return errBody.trim() || `(HTTP ${res.status})`;
        } catch  {
            return `(HTTP ${res.status})`;
        }
    }
    let raw;
    try {
        raw = await res.clone().text();
    } catch  {
        return "";
    }
    const trimmed = raw.trim();
    if (trimmed.startsWith("{")) {
        try {
            const parsed = JSON.parse(trimmed);
            const fromJson = firstTextFromOpenAI(parsed);
            if (fromJson) return fromJson;
            if (typeof parsed?.content === "string") {
                return parsed.content;
            }
        } catch  {
        /* fall through to SSE / raw */ }
    }
    const sse = concatSseText(raw);
    if (sse) return sse;
    return trimmed.length > 0 && !trimmed.startsWith("data:") ? trimmed : "";
}
function firstTextFromOpenAI(obj) {
    if (!obj || typeof obj !== "object") return "";
    const o = obj;
    const choices = o.choices;
    if (Array.isArray(choices) && choices.length > 0) {
        const msg = choices[0]?.message;
        if (msg && typeof msg.content === "string") return msg.content;
        const delta = choices[0]?.delta;
        if (delta && typeof delta.content === "string") return delta.content;
    }
    if (typeof o.content === "string") return o.content;
    return "";
}
/**
 * Concatenate assistant text out of an SSE byte stream.
 *
 * Supports BOTH wire formats OmniRoute may emit:
 *   - OpenAI: `data: {"choices":[{"delta":{"content":"..."}}]}`
 *   - Anthropic: `data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"..."}}`
 *     (also accepts the older `delta:{"content":"..."}` proxy shape and a
 *     top-level `content` token).
 */ function concatSseText(sse) {
    const out = [];
    for (const line of sse.split("\n")){
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
            const json = JSON.parse(payload);
            const choices = json?.choices;
            if (Array.isArray(choices) && choices.length > 0) {
                const delta = choices[0]?.delta;
                if (delta?.content) {
                    out.push(String(delta.content));
                    continue;
                }
                const message = choices[0]?.message;
                if (message?.content) {
                    out.push(String(message.content));
                    continue;
                }
            }
            // Anthropic Messages streaming delta shapes.
            const delta = json?.delta;
            if (delta && typeof delta.text === "string") {
                out.push(String(delta.text));
            } else if (delta && typeof delta.content === "string") {
                out.push(String(delta.content));
            } else if (typeof json?.content === "string") {
                out.push(String(json.content));
            }
        } catch  {
        /* ignore non-JSON lines */ }
    }
    return out.join("");
}
async function handleChaosChat(opts) {
    const { body, models, handleSingleModel, log, comboName, primaryModel, tuning } = opts;
    const panel = Array.isArray(models) ? models.filter(Boolean) : [];
    const hardTimeout = tuning?.panelHardTimeoutMs ?? CHAOS_DEFAULTS.panelHardTimeoutMs;
    const minPanel = tuning?.minPanel ?? CHAOS_DEFAULTS.minPanel;
    if (panel.length === 0) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["errorResponse"])(400, "Chaos combo has no models");
    }
    // Single-model chaos degrades to a direct answer.
    if (panel.length === 1) {
        return handleSingleModel(body, panel[0]);
    }
    const chunkId = `chaos-${comboName ?? "panel"}`;
    const stream = new ReadableStream({
        async start (controller) {
            const enc = new TextEncoder();
            let closed = false;
            let enqueueChain = Promise.resolve();
            const safeEnqueue = (s)=>{
                enqueueChain = enqueueChain.then(()=>{
                    if (closed) return;
                    try {
                        controller.enqueue(enc.encode(s));
                    } catch  {
                    /* stream already errored/closed */ }
                });
                return enqueueChain;
            };
            const abortControllers = [];
            const modelPromises = panel.map((model, index)=>{
                const ctrl = new AbortController();
                abortControllers.push(ctrl);
                return dispatchOnePanelModel({
                    body,
                    model,
                    index,
                    handleSingleModel,
                    ctrl,
                    hardTimeout,
                    log,
                    onResult: async (part)=>{
                        await safeEnqueue(serializeChaosPart(part, false));
                    }
                });
            });
            const allParts = await Promise.all(modelPromises);
            const successes = allParts.filter((p)=>p.ok);
            // Clean up all abort controllers to release references.
            for (const ac of abortControllers){
                if (!ac.signal.aborted) ac.abort();
            }
            if (successes.length === 0) {
                const errText = "All chaos panel models failed";
                await safeEnqueue(chatChunk(chunkId, panel[0], errText));
                await safeEnqueue(SSE_DONE);
                await enqueueChain;
                closed = true;
                controller.close();
                return;
            }
            // If fewer than minPanel succeeded, still return the best we have.
            // The primary is the explicit primaryModel if it succeeded, else the
            // last successful part (by construction that's the top-scored stable model).
            const primaryPart = primaryModel && allParts.find((p)=>p.model === primaryModel && p.ok) || allParts.filter((p)=>p.ok).slice(-1)[0] || successes[0];
            // Final canonical answer (non-aware clients consume this).
            await safeEnqueue(chatChunk(chunkId, primaryPart?.model ?? panel[0], primaryPart?.text ?? ""));
            await safeEnqueue(SSE_DONE);
            await enqueueChain;
            closed = true;
            controller.close();
        }
    });
    return new Response(stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-OmniRoute-Chaos": "true",
            "X-OmniRoute-Chaos-Panel": String(panel.length),
            "X-OmniRoute-Chaos-Primary": primaryModel ?? ""
        }
    });
}
function dispatchChaosFromCombo(args) {
    const { cfg, comboModels, comboName, body, handleSingleModel, log } = args;
    if (!cfg.chaos || typeof cfg.chaos !== "object" || !cfg.chaos.enabled) {
        return null;
    }
    const chaosCfg = cfg.chaos;
    const chaosModels = (comboModels || []).map((m)=>{
        if (typeof m === "string") return m;
        if (m && typeof m === "object") {
            const obj = m;
            if (typeof obj.model === "string") return obj.model;
        }
        return null;
    }).filter((m)=>Boolean(m));
    // Enforce minPanel: if configured and pool < minPanel, degrades to single model.
    const minPanel = chaosCfg.tuning?.minPanel ?? 1;
    const effectiveModels = chaosModels.length >= minPanel ? chaosModels : chaosModels.slice(0, 1);
    log.info("CHAOS", `dispatching parallel panel of ${effectiveModels.length} stable models`);
    return handleChaosChat({
        body,
        models: effectiveModels,
        handleSingleModel,
        log,
        comboName,
        primaryModel: chaosCfg.judgeModel,
        tuning: chaosCfg.tuning
    });
}
}),
"[project]/open-sse/services/autoCombo/autoPrefix.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VALID_VARIANTS",
    ()=>VALID_VARIANTS,
    "parseAutoPrefix",
    ()=>parseAutoPrefix
]);
const VALID_VARIANTS = [
    "coding",
    "fast",
    "cheap",
    "offline",
    "smart",
    "lkgp",
    "chaos"
];
function parseAutoPrefix(model) {
    // Guard against null/undefined (called with non-string inputs)
    if (typeof model !== "string") {
        return {
            valid: false,
            error: "Not an auto-prefixed model"
        };
    }
    if (!model.startsWith("auto")) {
        return {
            valid: false,
            error: "Not an auto-prefixed model"
        };
    }
    const parts = model.split("/");
    if (parts.length === 1) {
        if (parts[0] === "auto") {
            return {
                valid: true,
                variant: undefined
            }; // Default auto
        } else {
            return {
                valid: false,
                error: "Invalid auto prefix format"
            };
        }
    }
    if (parts.length === 2) {
        if (parts[0] !== "auto") {
            return {
                valid: false,
                error: "Invalid auto prefix format"
            };
        }
        const variantStr = parts[1];
        if (variantStr === "" || VALID_VARIANTS.includes(variantStr)) {
            return {
                valid: true,
                variant: variantStr === "" ? undefined : variantStr
            };
        } else {
            return {
                valid: false,
                error: `Invalid auto variant: ${variantStr}`
            };
        }
    }
    return {
        valid: false,
        error: "Invalid auto prefix format"
    };
}
}),
"[project]/open-sse/services/autoCombo/pipelineRouter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FITNESS_TIERS",
    ()=>FITNESS_TIERS,
    "buildPipelineResponse",
    ()=>buildPipelineResponse,
    "handlePipelineCombo",
    ()=>handlePipelineCombo
]);
/**
 * Pipeline Router — Smart Auto-Pipeline Orchestrator
 *
 * Bridges combo routing with the multi-stage pipeline engine.
 * Classifies prompt intent, selects pipeline template, executes stages
 * through a stageExecutor that wraps handleChatCore.
 *
 * @module services/autoCombo/pipelineRouter
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/intentClassifier.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$pipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/pipeline.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/taskFitness.ts [instrumentation] (ecmascript)");
;
;
;
const FITNESS_TIERS = {
    "best-reasoning": {
        minFitness: 0.85
    },
    cheapest: {
        maxFitness: 0.75
    },
    moderate: {
        minFitness: 0.6,
        maxFitness: 0.9
    }
};
// ---------------------------------------------------------------------------
// Intent → TaskType mapping
// ---------------------------------------------------------------------------
const INTENT_TO_TASK = {
    code: "code",
    math: "math",
    reasoning: "reasoning",
    creative: "creative",
    medium: "medium",
    simple: "simple"
};
// ---------------------------------------------------------------------------
// Model resolver — maps fitness tiers to actual model strings
// ---------------------------------------------------------------------------
/**
 * Resolve a fitness tier to a concrete model string using the available models
 * from the combo's candidate pool. Falls back to sensible defaults.
 */ function resolveModelForTier(tier, availableModels, taskType) {
    // Score each available model for this task type and tier
    const scored = availableModels.map((model)=>({
            model,
            fitness: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTaskFitness"])(model, taskType)
        })).sort((a, b)=>b.fitness - a.fitness);
    const tierConfig = FITNESS_TIERS[tier];
    if (!tierConfig) return scored[0]?.model ?? "deepseek-chat";
    // Filter by fitness threshold
    const filtered = scored.filter(({ fitness })=>{
        if (tierConfig.minFitness !== undefined && fitness < tierConfig.minFitness) return false;
        if (tierConfig.maxFitness !== undefined && fitness > tierConfig.maxFitness) return false;
        return true;
    });
    // Return best match in tier, or fall back to best available
    return filtered[0]?.model ?? scored[0]?.model ?? "deepseek-chat";
}
// ---------------------------------------------------------------------------
// Stage executor factory
// ---------------------------------------------------------------------------
/**
 * Create a stageExecutor that wraps handleChatCore for pipeline stage execution.
 *
 * - Intermediate stages (stream:false): buffer the response, extract text
 * - Final stage (stream:true): return raw Response for SSE streaming
 * - Each stage gets a model override based on its fitness tier
 */ function createStageExecutor(body, handleChatCore, log, availableModels, taskType) {
    return async ({ messages, stream, fitnessTier })=>{
        // Resolve model for this stage's fitness tier
        const model = fitnessTier ? resolveModelForTier(fitnessTier, availableModels, taskType) : undefined;
        // Build a modified request body with pipeline stage messages
        const stageBody = {
            ...body,
            messages,
            stream
        };
        log.info("PIPELINE", `Stage: tier=${fitnessTier}, model=${model}, stream=${stream}`);
        const response = await handleChatCore(stageBody, model);
        // Final stage: return raw Response for streaming
        if (stream) {
            return {
                text: "",
                response
            };
        }
        // Intermediate stage: buffer and extract text
        if (!response.ok) {
            const errorText = await response.text().catch(()=>"unknown error");
            log.warn("PIPELINE", `Stage returned ${response.status}: ${errorText.slice(0, 200)}`);
            return {
                text: ""
            };
        }
        try {
            const json = await response.json();
            // OpenAI chat completions format: choices[0].message.content
            const content = json?.choices?.[0]?.message?.content;
            if (typeof content === "string") {
                return {
                    text: content
                };
            }
            // Fallback: try to extract any text field
            return {
                text: JSON.stringify(json)
            };
        } catch  {
            log.warn("PIPELINE", "Failed to parse stage response as JSON");
            return {
                text: ""
            };
        }
    };
}
// ---------------------------------------------------------------------------
// Token estimation
// ---------------------------------------------------------------------------
/**
 * Rough token estimate from message content (4 chars ≈ 1 token).
 */ function estimateTokens(messages) {
    let total = 0;
    for (const msg of messages){
        if (typeof msg.content === "string") {
            total += Math.ceil(msg.content.length / 4);
        } else if (Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (typeof part === "object" && part !== null && typeof part.text === "string") {
                    total += Math.ceil(part.text.length / 4);
                }
            }
        }
    }
    return total;
}
async function handlePipelineCombo({ body, combo, availableModels: routedModels, handleChatCore, log, settings, signal }) {
    const config = combo.config;
    const pipelineEnabled = config?.pipeline_enabled ?? settings.pipeline_enabled ?? false;
    if (!pipelineEnabled) {
        log.info("PIPELINE", "Pipeline disabled for this combo");
        // Fall through — caller should handle with standard combo logic
        throw new Error("PIPELINE_DISABLED");
    }
    // ── Token threshold check ────────────────────────────────────────────────
    const messages = body.messages || [];
    const tokenEstimate = estimateTokens(messages);
    const skipThreshold = config?.skip_pipeline_for_tokens_under ?? settings.skip_pipeline_for_tokens_under ?? 50;
    if (tokenEstimate < skipThreshold) {
        log.info("PIPELINE", `Token estimate ${tokenEstimate} < threshold ${skipThreshold}, skipping pipeline`);
        throw new Error("PIPELINE_TOKEN_THRESHOLD");
    }
    // ── Intent classification ─────────────────────────────────────────────────
    const lastUserMsg = [
        ...messages
    ].reverse().find((m)=>m.role === "user");
    const promptText = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : Array.isArray(lastUserMsg?.content) ? lastUserMsg.content.filter((b)=>b.type === "text").map((b)=>b.text || "").join(" ") : "";
    const systemMsg = messages.find((m)=>m.role === "system");
    const systemText = typeof systemMsg?.content === "string" ? systemMsg.content : undefined;
    const intent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyPromptIntent"])(promptText, systemText);
    const taskType = INTENT_TO_TASK[intent] ?? "simple";
    log.info("PIPELINE", `Intent: ${intent} → task: ${taskType}`);
    // ── Build pipeline config ─────────────────────────────────────────────────
    const pipelineConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$pipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildPipelineConfig"])(promptText, taskType);
    // ── Extract available models from combo ────────────────────────────────────
    // `combo.models` is an array of model-config entries (objects with a `.model`
    // field), not plain strings — older code cast it to `string[]` and passed the
    // raw objects to `getTaskFitness`, which then string-matched `"[object Object]"`
    // and always fell back to the default model. Normalize to model-name strings.
    const rawComboModels = combo.models;
    const comboModels = Array.isArray(rawComboModels) ? rawComboModels.map((entry)=>{
        if (typeof entry === "string") return entry;
        const model = entry?.model;
        return typeof model === "string" ? model : null;
    }).filter((model)=>typeof model === "string" && model.length > 0) : [];
    const availableModels = routedModels === undefined ? comboModels.length ? comboModels : [
        "deepseek-chat"
    ] : routedModels;
    if (availableModels.length === 0) throw new Error("PIPELINE_NO_MODELS");
    // ── Create stage executor ─────────────────────────────────────────────────
    const stageExecutor = createStageExecutor(body, handleChatCore, log, availableModels, taskType);
    // ── Execute pipeline ──────────────────────────────────────────────────────
    const maxReflectionLoops = config?.max_reflection_loops ?? settings.max_reflection_loops ?? 1;
    const wrappedExecutor = async (args)=>{
        // fitnessTier is now passed by the pipeline engine via StageExecutorArgs
        return stageExecutor({
            ...args,
            fitnessTier: args.fitnessTier
        });
    };
    let result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$pipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executePipeline"])(pipelineConfig, wrappedExecutor);
    // ── Handle reflection loops ───────────────────────────────────────────────
    // While the reflect stage reports "fail", re-run the whole pipeline up to
    // `maxReflectionLoops` times (previously this was a single `if`, so the
    // configured loop count above 1 was silently ignored). Each re-run is a fresh
    // pipeline that internally applies its own reflect→fix correction (see
    // executePipeline). The first retry that passes wins; if none pass we keep the
    // original result.
    let reflectionCount = 0;
    while(result.reflectVerdict === "fail" && reflectionCount < maxReflectionLoops){
        reflectionCount++;
        log.info("PIPELINE", `Reflection failed, re-running (loop ${reflectionCount}/${maxReflectionLoops})`);
        const retryConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$pipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildPipelineConfig"])(promptText, taskType);
        const retryResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$pipeline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["executePipeline"])(retryConfig, wrappedExecutor);
        // Adopt the retry only if it passed; otherwise keep scanning until the loop
        // budget is exhausted, then fall through with the original result.
        if (retryResult.reflectVerdict === "pass") {
            result = retryResult;
            break;
        }
    }
    // ── Return result ─────────────────────────────────────────────────────────
    // Check if the last stage has a streaming Response
    const lastStage = result.stages[result.stages.length - 1];
    // If result contains a Response (from streaming final stage), return it directly
    // This happens when the pipeline decides to stream the final output
    if (lastStage?.text === "" && result.text) {
        // Non-streaming result — return as PipelineResult
        return result;
    }
    log.info("PIPELINE", `Complete: ${result.stages.length} stages, fallback=${result.fallback}, verdict=${result.reflectVerdict}`);
    return result;
}
function buildPipelineResponse(result, body) {
    const model = typeof body.model === "string" && body.model.length > 0 ? body.model : "auto";
    const id = `chatcmpl-pipeline-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);
    const content = result.text ?? "";
    // Non-streaming: standard OpenAI chat.completion JSON body.
    if (body.stream !== true) {
        const payload = {
            id,
            object: "chat.completion",
            created,
            model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content
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
        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
    // Streaming: emit one content chunk, a terminal finish chunk, then [DONE].
    const chunk = (delta, finishReason)=>`data: ${JSON.stringify({
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
        })}\n\n`;
    const sse = chunk({
        role: "assistant",
        content
    }, null) + chunk({}, "stop") + "data: [DONE]\n\n";
    return new Response(sse, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        }
    });
}
}),
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
"[project]/open-sse/services/autoCombo/selfHealing.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Auto-Combo Self-Healing
 *
 * Features:
 *   - Temporary exclusion when score < 0.2
 *   - Circuit breaker awareness (OPEN → excluded, HALF_OPEN → probe)
 *   - Incident mode (>50% OPEN → exploitation only)
 *   - Cooldown recovery with progressive backoff
 */ __turbopack_context__.s([
    "SelfHealingManager",
    ()=>SelfHealingManager,
    "getSelfHealingManager",
    ()=>getSelfHealingManager
]);
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 min
const MAX_COOLDOWN_MS = 30 * 60 * 1000; // 30 min
const REENTRY_THRESHOLD = 0.3;
const EXCLUSION_THRESHOLD = 0.2;
const INCIDENT_MODE_THRESHOLD = 0.5; // >50% OPEN
class SelfHealingManager {
    exclusions = new Map();
    incidentMode = false;
    /**
   * Check if a provider is currently excluded.
   */ isExcluded(provider) {
        const entry = this.exclusions.get(provider);
        if (!entry) return false;
        if (Date.now() - entry.excludedAt > entry.cooldownMs) return false; // Cooldown expired
        return true;
    }
    /**
   * Evaluate provider health and potentially exclude or re-admit.
   */ evaluate(provider, score, circuitBreakerState) {
        const existing = this.exclusions.get(provider);
        // Re-admission: score above threshold and cooldown expired
        if (existing && score >= REENTRY_THRESHOLD && Date.now() - existing.excludedAt > existing.cooldownMs) {
            this.exclusions.delete(provider);
            return {
                excluded: false,
                reason: `Re-admitted: score ${score.toFixed(2)} >= ${REENTRY_THRESHOLD}`
            };
        }
        // Already excluded and still in cooldown
        if (this.isExcluded(provider)) {
            // Allow probe if HALF_OPEN
            if (circuitBreakerState === "HALF_OPEN" && existing) {
                existing.probeCount++;
                return {
                    excluded: false,
                    isProbe: true,
                    reason: `Probe request #${existing.probeCount}`
                };
            }
            return {
                excluded: true,
                reason: existing?.reason || "Excluded"
            };
        }
        // New exclusion: score too low
        if (score < EXCLUSION_THRESHOLD) {
            const cooldownMs = existing ? Math.min(existing.cooldownMs * 2, MAX_COOLDOWN_MS) : DEFAULT_COOLDOWN_MS;
            this.exclusions.set(provider, {
                provider,
                excludedAt: Date.now(),
                cooldownMs,
                reason: `Score ${score.toFixed(2)} < ${EXCLUSION_THRESHOLD}`,
                probeCount: 0
            });
            return {
                excluded: true,
                reason: `Excluded: score ${score.toFixed(2)} below threshold`
            };
        }
        // Circuit breaker OPEN → auto-exclude
        if (circuitBreakerState === "OPEN") {
            this.exclusions.set(provider, {
                provider,
                excludedAt: Date.now(),
                cooldownMs: DEFAULT_COOLDOWN_MS,
                reason: "Circuit breaker OPEN",
                probeCount: 0
            });
            return {
                excluded: true,
                reason: "Circuit breaker OPEN"
            };
        }
        return {
            excluded: false
        };
    }
    /**
   * Record probe result. After 3 successful probes, fully re-admit.
   */ recordProbeResult(provider, success) {
        const entry = this.exclusions.get(provider);
        if (!entry) return;
        if (success && entry.probeCount >= 3) {
            this.exclusions.delete(provider);
        } else if (!success) {
            entry.cooldownMs = Math.min(entry.cooldownMs * 2, MAX_COOLDOWN_MS);
            entry.excludedAt = Date.now();
            entry.probeCount = 0;
        }
    }
    /**
   * Update incident mode based on circuit breaker states.
   */ updateIncidentMode(circuitBreakerStates) {
        const total = circuitBreakerStates.length;
        if (total === 0) {
            this.incidentMode = false;
            return false;
        }
        const openCount = circuitBreakerStates.filter((s)=>s === "OPEN").length;
        this.incidentMode = openCount / total > INCIDENT_MODE_THRESHOLD;
        return this.incidentMode;
    }
    isInIncidentMode() {
        return this.incidentMode;
    }
    getExclusions() {
        return [
            ...this.exclusions.values()
        ];
    }
    getStatus() {
        const now = Date.now();
        return {
            exclusionCount: this.exclusions.size,
            incidentMode: this.incidentMode,
            exclusions: [
                ...this.exclusions.values()
            ].map((e)=>({
                    provider: e.provider,
                    reason: e.reason,
                    remainingMs: Math.max(0, e.cooldownMs - (now - e.excludedAt))
                }))
        };
    }
}
let _instance = null;
function getSelfHealingManager() {
    if (!_instance) _instance = new SelfHealingManager();
    return _instance;
}
}),
"[project]/open-sse/services/autoCombo/engine.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "BudgetExceededError",
    ()=>BudgetExceededError,
    "selectProvider",
    ()=>selectProvider
]);
/**
 * Auto-Combo Engine — The `auto` combo type that self-manages provider selection.
 *
 * Features:
 *   - Scoring-based provider selection from candidate pool
 *   - Bandit exploration (configurable rate, default 5%)
 *   - Budget cap enforcement
 *   - Self-healing integration
 *   - Mode pack support
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/scoring.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/taskFitness.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modePacks.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$selfHealing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/selfHealing.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/intentClassifier.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
class BudgetExceededError extends Error {
    budgetCap;
    cheapestCostUsd;
    constructor(budgetCap, cheapestCostUsd){
        super(`No candidate fits within the configured budget cap of $${budgetCap.toFixed(4)} ` + `(cheapest available candidate costs $${cheapestCostUsd.toFixed(4)})`), this.budgetCap = budgetCap, this.cheapestCostUsd = cheapestCostUsd;
        this.name = "BudgetExceededError";
    }
}
const TIER_PREFERENCES = {
    smart: {
        top: 0.5,
        mid: 0.3,
        rest: 0.2
    },
    fast: {
        top: 0.3,
        mid: 0.5,
        rest: 0.2
    },
    cheap: {
        top: 0.2,
        mid: 0.3,
        rest: 0.5
    },
    coding: {
        top: 0.6,
        mid: 0.25,
        rest: 0.15
    },
    default: {
        top: 0.45,
        mid: 0.35,
        rest: 0.2
    }
};
function tierPreferencesForName(name) {
    const key = name.toLowerCase();
    if (TIER_PREFERENCES[key]) return TIER_PREFERENCES[key];
    for (const prefix of Object.keys(TIER_PREFERENCES)){
        if (key.startsWith(`${prefix}-`) || key.includes(prefix)) return TIER_PREFERENCES[prefix];
    }
    return TIER_PREFERENCES.default;
}
const SCORE_EPSILON = 1e-4;
const CLEAR_WINNER_THRESHOLD = 0.1;
class ScoreTierRotator {
    comboName;
    tierCounters;
    rrCounter;
    constructor(comboName){
        this.comboName = comboName;
        this.tierCounters = new Map();
        this.rrCounter = 0;
    }
    pick(candidates) {
        if (candidates.length === 0) {
            throw new Error(`ScoreTierRotator: no candidates to pick from for combo=${this.comboName}`);
        }
        if (candidates.length === 1) return candidates[0];
        const tiers = groupIntoTiers(candidates);
        const best = candidates[0].score;
        const worst = candidates[candidates.length - 1].score;
        if (tiers.top.length > 0 && best - worst >= CLEAR_WINNER_THRESHOLD) {
            return this.pickFromPool(tiers.top);
        }
        const prefs = tierPreferencesForName(this.comboName);
        const chosen = chooseTierWeighted(tiers, prefs, (pool)=>this.pickFromPool(pool), ()=>this.advance(tiers, prefs, candidates));
        return chosen;
    }
    advance(tiers, prefs, candidates) {
        const order = [
            "top",
            "mid",
            "rest"
        ];
        for (const tier of order){
            if (tiers[tier].length > 0 && prefs[tier] > 0) {
                const idx = this.tierCounters.get(tier) ?? 0;
                const picked = tiers[tier][idx % tiers[tier].length];
                this.tierCounters.set(tier, idx + 1);
                return picked;
            }
        }
        return tiers.top[0] ?? tiers.mid[0] ?? tiers.rest[0] ?? candidates[0];
    }
    pickFromPool(pool) {
        if (pool.length === 0) throw new Error("pickFromPool: empty pool");
        if (pool.length === 1) return pool[0];
        const picked = pool[this.rrCounter % pool.length];
        this.rrCounter = (this.rrCounter + 1) % pool.length;
        return picked;
    }
}
function groupIntoTiers(candidates) {
    if (candidates.length === 0) return {
        top: [],
        mid: [],
        rest: []
    };
    const best = candidates[0].score;
    const worst = candidates[candidates.length - 1].score;
    const range = best - worst;
    const top = [];
    const mid = [];
    const rest = [];
    for (const c of candidates){
        const delta = best - c.score;
        if (delta <= SCORE_EPSILON) top.push(c);
        else if (range <= SCORE_EPSILON || delta <= range * 0.3) mid.push(c);
        else rest.push(c);
    }
    if (mid.length === 0 && rest.length > 0) {
        const half = Math.ceil(rest.length / 2);
        mid.push(...rest.splice(0, half));
    }
    return {
        top,
        mid,
        rest
    };
}
function chooseTierWeighted(tiers, prefs, pickFromPool, fallback) {
    const active = {
        top: tiers.top.length > 0 ? prefs.top : 0,
        mid: tiers.mid.length > 0 ? prefs.mid : 0,
        rest: tiers.rest.length > 0 ? prefs.rest : 0
    };
    const total = active.top + active.mid + active.rest;
    if (total <= 0) return fallback();
    const r = Math.random() * total;
    let acc = 0;
    if (active.top > 0 && (acc += active.top) >= r) return pickFromPool(tiers.top);
    if (active.mid > 0 && (acc += active.mid) >= r) return pickFromPool(tiers.mid);
    if (active.rest > 0) return pickFromPool(tiers.rest);
    return fallback();
}
const comboRotators = new Map();
function getRotator(comboName) {
    let r = comboRotators.get(comboName);
    if (!r) {
        r = new ScoreTierRotator(comboName);
        comboRotators.set(comboName, r);
    }
    return r;
}
function selectProvider(config, candidates, taskType = "default", promptMessages) {
    const healer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$selfHealing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSelfHealingManager"])();
    // ── Intent classification (ClawRouter Feature #10/11) ────────────────────
    // When taskType is generic ('default'), attempt to classify the prompt intent
    // using the multilingual intentClassifier for better task fitness scoring.
    let effectiveTaskType = taskType;
    if ((taskType === "default" || taskType === "") && promptMessages?.length) {
        // Extract text from last user message for classification
        const lastUserMsg = [
            ...promptMessages
        ].reverse().find((m)=>m.role === "user");
        if (lastUserMsg) {
            const text = typeof lastUserMsg.content === "string" ? lastUserMsg.content : Array.isArray(lastUserMsg.content) ? lastUserMsg.content.filter((b)=>b.type === "text").map((b)=>b.text || "").join(" ") : "";
            if (text.length > 10) {
                const intent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyPromptIntent"])(text);
                effectiveTaskType = intent; // 'code' | 'reasoning' | 'simple' | 'medium'
            }
        }
    }
    // Resolve weights from mode pack or config
    let weights = config.weights;
    if (config.modePack) {
        const pack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModePack"])(config.modePack);
        if (pack) weights = pack;
    }
    weights = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeScoringWeights"])(weights);
    // Filter out excluded providers
    const excluded = [];
    const pool = candidates.filter((c)=>{
        // Pool filter
        if (config.candidatePool.length > 0 && !config.candidatePool.includes(c.provider)) return false;
        // Self-healing exclusion
        const evaluation = healer.evaluate(c.provider, 0.5, c.circuitBreakerState);
        if (evaluation.excluded) {
            excluded.push(c.provider);
            return false;
        }
        return true;
    });
    if (pool.length === 0) {
        // Fallback: allow all candidates regardless of exclusions
        pool.push(...candidates);
        excluded.length = 0;
    }
    // Score all providers (using classified intent if available)
    const scored = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scorePool"])(pool, effectiveTaskType, weights, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTaskFitness"]);
    // Apply self-healing re-evaluation with actual scores
    const finalCandidates = scored.filter((s)=>{
        const eval_ = healer.evaluate(s.provider, s.score, "CLOSED");
        if (eval_.excluded) {
            excluded.push(s.provider);
            return false;
        }
        return true;
    });
    const candidates_ = finalCandidates.length > 0 ? finalCandidates : scored;
    // Incident mode check
    const incidentMode = healer.isInIncidentMode();
    const effectiveExplorationRate = incidentMode ? 0 : config.explorationRate;
    // Selection: exploration vs exploitation
    let selected;
    const isExploration = Math.random() < effectiveExplorationRate && candidates_.length > 1;
    if (isExploration) {
        const idx = Math.floor(Math.random() * candidates_.length);
        selected = candidates_[idx];
    } else {
        const rotator = getRotator(config.name);
        selected = rotator.pick(candidates_);
    }
    // Budget cap enforcement
    if (config.budgetCap) {
        const costMap = new Map();
        for (const c of candidates){
            costMap.set(`${c.provider}\0${c.model}`, c.costPer1MTokens);
        }
        const estimatedCostFor = (s)=>{
            const cost = costMap.get(`${s.provider}\0${s.model}`) ?? 0;
            return cost / 1_000_000 * 1000;
        };
        if (estimatedCostFor(selected) > config.budgetCap) {
            const budgetOk = candidates_.filter((s)=>estimatedCostFor(s) <= config.budgetCap);
            if (budgetOk.length > 0) {
                const rotator = getRotator(`${config.name}#budget`);
                selected = rotator.pick(budgetOk);
            } else {
                const cheapest = [
                    ...candidates_
                ].sort((a, b)=>estimatedCostFor(a) - estimatedCostFor(b))[0];
                if (config.budgetFallback === "strict") {
                    throw new BudgetExceededError(config.budgetCap, cheapest ? estimatedCostFor(cheapest) : 0);
                }
                if (cheapest) selected = cheapest;
            }
        }
    }
    return {
        provider: selected.provider,
        model: selected.model,
        score: selected.score,
        isExploration,
        factors: selected.factors,
        excluded,
        connectionId: selected.connectionId
    };
} // ============ Auto-Combo Config Schema Reference ============
 // Note: AutoCombos are now persisted natively in the SQLite DB via src/lib/db/combos.ts
 // using the combo.strategy = "auto" | "lkgp" type, with parameters nested inside combo.config
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/requestControls.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseRequestBudgetCap",
    ()=>parseRequestBudgetCap,
    "parseRequestBudgetFallback",
    ()=>parseRequestBudgetFallback,
    "resolveRequestAutoControls",
    ()=>resolveRequestAutoControls,
    "resolveRequestModePack",
    ()=>resolveRequestModePack
]);
/**
 * Per-request Auto-Combo routing controls (#6023 / #6024 / #6025 / #3470).
 *
 * These let a caller steer an `auto` combo on a single request via response-safe
 * request headers, without changing the combo's stored config:
 *
 *   X-OmniRoute-Mode:            fast | balanced | quality | <raw mode-pack name>  (#6024/#6025)
 *   X-OmniRoute-Budget:          <max USD per request>                             (#6023)
 *   X-OmniRoute-Budget-Fallback: cheapest | strict                                 (#3470)
 *
 * All resolvers are pure so they can be unit-tested and reused by the entry
 * handler (src/sse/handlers/chat.ts) and the combo router (open-sse/services/combo.ts).
 * The resolved values feed the auto-combo engine's existing `config.modePack` /
 * `config.budgetCap` / `config.budgetFallback` inputs.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modePacks.ts [instrumentation] (ecmascript)");
;
/**
 * Friendly latency-vs-quality preset aliases (#6024). These map human-facing
 * preset names to the concrete scoring mode packs the engine already ships.
 * `balanced`/`default` are handled specially (they mean "no pack" = default weights).
 */ const MODE_PACK_ALIASES = {
    fast: "ship-fast",
    fastest: "ship-fast",
    speed: "ship-fast",
    quality: "quality-first",
    best: "quality-first",
    cheap: "cost-saver",
    cost: "cost-saver",
    saver: "cost-saver",
    reliable: "reliability-first",
    offline: "offline-friendly"
};
function resolveRequestModePack(input) {
    const noOverride = {
        override: false,
        modePack: undefined
    };
    if (typeof input !== "string") return noOverride;
    const key = input.trim().toLowerCase();
    if (!key) return noOverride;
    if (key === "balanced" || key === "default") return {
        override: true,
        modePack: undefined
    };
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODE_PACKS"], key)) {
        return {
            override: true,
            modePack: key
        };
    }
    const alias = MODE_PACK_ALIASES[key];
    if (alias) return {
        override: true,
        modePack: alias
    };
    return noOverride;
}
function parseRequestBudgetCap(input) {
    const n = typeof input === "number" ? input : typeof input === "string" ? Number(input.trim()) : NaN;
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return n;
}
function parseRequestBudgetFallback(input) {
    if (typeof input !== "string") return undefined;
    const key = input.trim().toLowerCase();
    if (key === "strict" || key === "block" || key === "hard") return "strict";
    if (key === "cheapest" || key === "cheapest-viable" || key === "soft") return "cheapest";
    return undefined;
}
function resolveRequestAutoControls(headers) {
    const modeHeader = headers.get("x-omniroute-mode")?.trim() || null;
    const budgetHeader = headers.get("x-omniroute-budget")?.trim() || null;
    const budgetFallbackHeader = headers.get("x-omniroute-budget-fallback")?.trim() || null;
    const mode = resolveRequestModePack(modeHeader);
    const budgetCap = parseRequestBudgetCap(budgetHeader);
    const budgetFallback = parseRequestBudgetFallback(budgetFallbackHeader);
    return {
        ...mode.override && modeHeader ? {
            mode: modeHeader
        } : {},
        ...budgetCap !== undefined ? {
            budgetCap
        } : {},
        ...budgetFallback !== undefined ? {
            budgetFallback
        } : {}
    };
}
}),
"[project]/open-sse/services/autoCombo/speedRanking.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Speed-optimized Provider×Model Ranking
 *
 * Pure, framework-free scoring function that ranks provider×model candidates by
 * the speed/reliability combination most likely to make a request feel "fast":
 *
 *   - lower avg Time-To-First-Token (TTFT)        — perceived responsiveness
 *   - higher avg tokens-per-second (TPS)          — generation throughput
 *   - lower avg end-to-end (E2E) latency          — full completion time
 *   - lower p95 latency                           — tail-risk backup metric
 *   - higher circuit-breaker health               — must be reachable
 *   - lower failure / error rate                  — speed without flake
 *   - lower latency standard deviation (stability)— consistent, not bursty
 *
 * Every metric is optional; missing telemetry is treated as the pool median
 * (i.e. 0.5 in [0..1]) so a brand-new provider/model does not get crushed, but
 * also does not get a free pass on a metric we have no data for.  This mirrors
 * the behavior of the existing `LatencyStrategyImpl` and is intentional — the
 * function is the canonical ranking for the "fastest reliable provider-model"
 * UX in the playground + MCP `omniroute_pick_fastest_model` tool, and is
 * reused by the runtime `LatencyStrategyImpl` so the runtime router picks the
 * same winner as the user-facing preview.
 *
 * Optional weights override defaults so callers (tests, dashboards, future
 * `modePacks.speed-first`) can rebalance without duplicating the math.
 */ __turbopack_context__.s([
    "DEFAULT_SPEED_WEIGHTS",
    ()=>DEFAULT_SPEED_WEIGHTS,
    "pickFastest",
    ()=>pickFastest,
    "rankBySpeed",
    ()=>rankBySpeed
]);
const DEFAULT_SPEED_WEIGHTS = {
    ttft: 0.25,
    tps: 0.2,
    e2e: 0.18,
    p95: 0.12,
    health: 0.05,
    reliability: 0.15,
    stability: 0.05
};
/** Human-readable label for each weight key — used in `reason` strings. */ const FACTOR_LABEL = {
    ttft: "ttft",
    tps: "tps",
    e2e: "e2e",
    p95: "p95",
    health: "health",
    reliability: "reliability",
    stability: "stability"
};
function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
}
function positiveFinite(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}
function toBoundedRate(value) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
    return Math.min(1, value);
}
/**
 * Pool-relative maximum for "lower is better" metrics.  Returns at least
 * `floor` so a candidate with the only positive measurement does not divide
 * by zero.
 */ function poolMax(values, readMetric, floor = 1) {
    let max = floor;
    for (const value of values){
        const v = readMetric(value);
        if (v != null && v > max) max = v;
    }
    return max;
}
/**
 * Pool-relative maximum for "higher is better" metrics.  Returns at least
 * `floor` so a missing metric does not yield Infinity downstream.
 */ function poolMaxHigherBetter(values, readMetric, floor = 0.000_001) {
    let max = floor;
    for (const value of values){
        const v = readMetric(value);
        if (v != null && v > max) max = v;
    }
    return max;
}
/** 1 - (value / max), clamped to [0..1]. Missing → 0.5 (pool median). */ function lowerIsBetter(value, max) {
    if (value == null) return 0.5;
    if (!Number.isFinite(value) || value < 0) return 0;
    if (!Number.isFinite(max) || max <= 0) return 1;
    return clamp01(1 - value / max);
}
/** value / max, clamped to [0..1]. Missing → 0.5. */ function higherIsBetter(value, max) {
    if (value == null) return 0.5;
    if (!Number.isFinite(value) || value < 0) return 0;
    if (!Number.isFinite(max) || max <= 0) return 0;
    return clamp01(value / max);
}
function healthScoreFor(state) {
    if (state === "CLOSED") return 1;
    if (state === "HALF_OPEN") return 0.5;
    return 0; // OPEN — caller is expected to filter these out beforehand, but be defensive.
}
function speedPoolMaxima(pool) {
    return {
        ttft: poolMax(pool, (c)=>positiveFinite(c.avgTtftMs) ?? positiveFinite(c.p95LatencyMs)),
        e2e: poolMax(pool, (c)=>positiveFinite(c.avgE2ELatencyMs) ?? positiveFinite(c.p95LatencyMs)),
        p95: poolMax(pool, (c)=>positiveFinite(c.p95LatencyMs)),
        tps: poolMaxHigherBetter(pool, (c)=>positiveFinite(c.avgTokensPerSecond)),
        stdDev: poolMax(pool, (c)=>positiveFinite(c.latencyStdDev), 0.001)
    };
}
function speedFactorsFor(candidate, maxima, failureRate) {
    return {
        ttft: lowerIsBetter(positiveFinite(candidate.avgTtftMs) ?? positiveFinite(candidate.p95LatencyMs), maxima.ttft),
        tps: higherIsBetter(positiveFinite(candidate.avgTokensPerSecond), maxima.tps),
        e2e: lowerIsBetter(positiveFinite(candidate.avgE2ELatencyMs) ?? positiveFinite(candidate.p95LatencyMs), maxima.e2e),
        p95: lowerIsBetter(positiveFinite(candidate.p95LatencyMs), maxima.p95),
        health: healthScoreFor(candidate.circuitBreakerState),
        reliability: clamp01(1 - failureRate),
        stability: lowerIsBetter(positiveFinite(candidate.latencyStdDev), maxima.stdDev)
    };
}
function weightedSpeedScore(factors, weights) {
    return factors.ttft * weights.ttft + factors.tps * weights.tps + factors.e2e * weights.e2e + factors.p95 * weights.p95 + factors.health * weights.health + factors.reliability * weights.reliability + factors.stability * weights.stability;
}
function applySpeedPenalties(weightedSum, factors) {
    const reliabilityMultiplier = Math.max(0.05, Math.pow(0.25 + 0.75 * factors.reliability, 2));
    const stabilityMultiplier = Math.max(0.05, Math.pow(0.25 + 0.75 * factors.stability, 2));
    return clamp01(weightedSum * reliabilityMultiplier * stabilityMultiplier * Math.max(0.25, factors.health));
}
function speedReason(candidate, factors, metrics) {
    const reasonParts = [
        `ttft=${metrics.avgTtftMs == null ? "n/a" : `${Math.round(metrics.avgTtftMs)}ms`}`,
        `tps=${metrics.avgTokensPerSecond == null ? "n/a" : metrics.avgTokensPerSecond.toFixed(1)}`,
        `e2e=${metrics.avgE2ELatencyMs == null ? "n/a" : `${Math.round(metrics.avgE2ELatencyMs)}ms`}`,
        `p95=${metrics.p95LatencyMs == null ? "n/a" : `${Math.round(metrics.p95LatencyMs)}ms`}`,
        `failRate=${(metrics.failureRate * 100).toFixed(2)}%`,
        `cb=${candidate.circuitBreakerState}`
    ];
    return `SpeedRanking[${FACTOR_LABEL.ttft}=${factors.ttft.toFixed(2)}, ${FACTOR_LABEL.tps}=${factors.tps.toFixed(2)}, ${FACTOR_LABEL.e2e}=${factors.e2e.toFixed(2)}, ${FACTOR_LABEL.p95}=${factors.p95.toFixed(2)}, ${FACTOR_LABEL.reliability}=${factors.reliability.toFixed(2)}, ${FACTOR_LABEL.health}=${factors.health.toFixed(2)}, ${FACTOR_LABEL.stability}=${factors.stability.toFixed(2)}] → ${reasonParts.join(", ")}`;
}
function rankBySpeed(candidates, weights = DEFAULT_SPEED_WEIGHTS, options = {}) {
    if (candidates.length === 0) return [];
    const pool = options.includeUnhealthy ? [
        ...candidates
    ] : candidates.filter((c)=>c.circuitBreakerState !== "OPEN");
    if (pool.length === 0) return [];
    const maxima = speedPoolMaxima(pool);
    const ranked = pool.map((candidate)=>{
        const p95 = positiveFinite(candidate.p95LatencyMs);
        const ttft = positiveFinite(candidate.avgTtftMs);
        const e2e = positiveFinite(candidate.avgE2ELatencyMs);
        const tps = positiveFinite(candidate.avgTokensPerSecond);
        const stdDev = positiveFinite(candidate.latencyStdDev);
        const failureRate = toBoundedRate(candidate.failureRate ?? (typeof candidate.errorRate === "number" ? candidate.errorRate : 0));
        const factors = speedFactorsFor(candidate, maxima, failureRate);
        const score = applySpeedPenalties(weightedSpeedScore(factors, weights), factors);
        const metrics = {
            avgTtftMs: ttft,
            avgTokensPerSecond: tps,
            avgE2ELatencyMs: e2e,
            p95LatencyMs: p95,
            latencyStdDev: stdDev,
            failureRate,
            circuitBreakerState: candidate.circuitBreakerState
        };
        return {
            provider: candidate.provider,
            model: candidate.model,
            score,
            factors,
            metrics,
            reason: speedReason(candidate, factors, metrics)
        };
    });
    return ranked.sort((a, b)=>b.score - a.score);
}
function pickFastest(candidates, weights = DEFAULT_SPEED_WEIGHTS) {
    const ranked = rankBySpeed(candidates, weights);
    return ranked.length > 0 ? ranked[0] : null;
}
}),
"[project]/open-sse/services/autoCombo/routerStrategy.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * RouterStrategy — Pluggable Routing Strategy System
 *
 * Inspired by ClawRouter commit 14c83c258 "refactor: extract routing into pluggable RouterStrategy system".
 * Provides a RouterStrategy interface and built-in implementations:
 *   - RulesStrategy (default): wraps the existing 6-factor scoring engine
 *   - CostStrategy: always picks cheapest available model
 *   - LatencyStrategy: prioritizes low p95 latency with reliability weighting
 *   - SLAStrategy: prefers candidates that satisfy latency/error/cost SLOs
 *   - LKGPStrategy: tries last known good provider first
 */ __turbopack_context__.s([
    "getStrategy",
    ()=>getStrategy,
    "listStrategies",
    ()=>listStrategies,
    "registerStrategy",
    ()=>registerStrategy,
    "selectWithStrategy",
    ()=>selectWithStrategy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/scoring.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/taskFitness.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/number.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$speedRanking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/speedRanking.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// ── RulesStrategy: wraps 6-factor scoring engine ────────────────────────────
function toSpeedCandidate(c) {
    return {
        // Identity
        provider: c.provider,
        model: c.model,
        // Resource state
        quotaRemaining: c.quotaRemaining,
        quotaTotal: c.quotaTotal,
        circuitBreakerState: c.circuitBreakerState,
        // Costs
        costPer1MTokens: c.costPer1MTokens,
        // Latency metrics
        p95LatencyMs: c.p95LatencyMs,
        avgTtftMs: c.avgTtftMs,
        avgE2ELatencyMs: c.avgE2ELatencyMs,
        avgTokensPerSecond: c.avgTokensPerSecond,
        latencyStdDev: c.latencyStdDev,
        // Reliability
        errorRate: c.errorRate,
        failureRate: c.failureRate,
        // Tier signals (forwarded so weights stay available for downstream tuning)
        accountTier: c.accountTier,
        quotaResetIntervalSecs: c.quotaResetIntervalSecs,
        contextAffinity: c.contextAffinity,
        resetWindowAffinity: c.resetWindowAffinity,
        connectionPoolSize: c.connectionPoolSize,
        connectionId: c.connectionId
    };
}
class RulesStrategyImpl {
    name = "rules";
    description = "6-factor weighted scoring: quota, health, cost, latency, taskFit, stability";
    select(pool, context) {
        const eligible = pool.filter((c)=>c.circuitBreakerState !== "OPEN");
        const ranked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scorePool"])(eligible.length > 0 ? eligible : pool, context.taskType, undefined, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTaskFitness"]);
        const best = ranked[0];
        if (!best) throw new Error("[RulesStrategy] No candidates to score");
        return {
            provider: best.provider,
            model: best.model,
            strategy: this.name,
            reason: `RulesStrategy: score=${best.score.toFixed(3)} (quota=${best.factors.quota.toFixed(2)}, health=${best.factors.health.toFixed(2)}, cost=${best.factors.costInv.toFixed(2)}, taskFit=${best.factors.taskFit.toFixed(2)})`,
            candidatesConsidered: ranked.length,
            finalScore: best.score,
            connectionId: best.connectionId
        };
    }
}
// ── CostStrategy: always picks cheapest healthy provider ─────────────────────
class CostStrategyImpl {
    name = "cost";
    description = "Always selects cheapest available provider (by costPer1MTokens)";
    select(pool, context) {
        const healthy = pool.filter((c)=>c.circuitBreakerState !== "OPEN");
        const candidates = healthy.length > 0 ? healthy : pool;
        const sorted = [
            ...candidates
        ].sort((a, b)=>a.costPer1MTokens - b.costPer1MTokens);
        const best = sorted[0];
        if (!best) throw new Error("[CostStrategy] No candidates available");
        return {
            provider: best.provider,
            model: best.model,
            strategy: this.name,
            reason: `CostStrategy: cheapest at $${best.costPer1MTokens.toFixed(3)}/1M tokens`,
            candidatesConsidered: candidates.length,
            finalScore: best.costPer1MTokens === 0 ? 1.0 : 1 / best.costPer1MTokens
        };
    }
}
// ── LatencyStrategy: prioritize low latency + reliability ───────────────────
class LatencyStrategyImpl {
    name = "latency";
    description = "Prioritizes the fastest reliable provider-model pair using TTFT, TPS, E2E latency, health, fail rate, and stability";
    select(pool, context) {
        const ranked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$speedRanking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rankBySpeed"])(pool.map(toSpeedCandidate));
        const winner = ranked[0];
        if (!winner) {
            throw new Error("[LatencyStrategy] No candidates available after speed ranking");
        }
        return {
            provider: winner.provider,
            model: winner.model,
            strategy: this.name,
            reason: latencyDecisionReason(winner),
            candidatesConsidered: ranked.length,
            finalScore: winner.score
        };
    }
}
function metricString(value, digits = 0) {
    return value == null ? "n/a" : value.toFixed(digits);
}
function latencyDecisionReason(winner) {
    const metrics = winner.metrics;
    const e2e = metrics.avgE2ELatencyMs ?? metrics.p95LatencyMs;
    return `LatencyStrategy(score=${winner.score.toFixed(3)}): ` + `ttft=${metricString(metrics.avgTtftMs)}ms ` + `tps=${metricString(metrics.avgTokensPerSecond, 1)} ` + `e2e=${metricString(e2e)}ms ` + `p95=${metricString(metrics.p95LatencyMs)}ms ` + `failRate=${((metrics.failureRate ?? 0) * 100).toFixed(2)}% ` + `stability=${metricString(metrics.latencyStdDev)}ms ` + `cb=${metrics.circuitBreakerState ?? "n/a"}`;
}
// ── SLAStrategy: favor targets that meet latency/error/cost SLOs ───────────
const DEFAULT_SLA_TARGET_P95_MS = 2_000;
const DEFAULT_SLA_MAX_ERROR_RATE = 0.05;
function toPositiveFinite(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : undefined;
}
function toFiniteRate(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue >= 0 ? Math.min(1, numericValue) : undefined;
}
function inverseNormalized(value, maxValue) {
    if (!Number.isFinite(value) || value < 0) return 0;
    if (!Number.isFinite(maxValue) || maxValue <= 0) return 1;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(1 - value / maxValue);
}
function scoreAtOrBelowThreshold(value, threshold) {
    // A zero threshold is an intentional zero-tolerance policy.
    if (threshold <= 0) return value === 0 ? 1 : 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clamp01"])(threshold / Math.max(value, 0.000_001));
}
function getHealthScore(candidate) {
    if (candidate.circuitBreakerState === "CLOSED") return 1;
    if (candidate.circuitBreakerState === "HALF_OPEN") return 0.5;
    return 0;
}
function getSlaViolationScore(candidate, policy) {
    let violation = candidate.circuitBreakerState === "OPEN" ? 1 : 0;
    if (candidate.p95LatencyMs > policy.targetP95Ms) {
        violation += (candidate.p95LatencyMs - policy.targetP95Ms) / policy.targetP95Ms;
    }
    if (candidate.errorRate > policy.maxErrorRate) {
        violation += policy.maxErrorRate > 0 ? (candidate.errorRate - policy.maxErrorRate) / policy.maxErrorRate : candidate.errorRate;
    }
    if (policy.maxCostPer1MTokens > 0 && candidate.costPer1MTokens > policy.maxCostPer1MTokens) {
        violation += (candidate.costPer1MTokens - policy.maxCostPer1MTokens) / policy.maxCostPer1MTokens;
    }
    return violation;
}
class SLAStrategyImpl {
    name = "sla-aware";
    description = "Selects the provider most likely to satisfy latency, error-rate, and cost SLOs";
    select(pool, context) {
        const healthy = pool.filter((c)=>c.circuitBreakerState !== "OPEN");
        const candidates = healthy.length > 0 ? healthy : pool;
        if (candidates.length === 0) throw new Error("[SLAStrategy] No candidates available");
        const maxCost = Math.max(...candidates.map((c)=>c.costPer1MTokens), 0.001);
        const maxStdDev = Math.max(...candidates.map((c)=>c.latencyStdDev), 0.001);
        const policy = {
            targetP95Ms: toPositiveFinite(context.sla?.targetP95Ms) ?? DEFAULT_SLA_TARGET_P95_MS,
            maxErrorRate: toFiniteRate(context.sla?.maxErrorRate) ?? DEFAULT_SLA_MAX_ERROR_RATE,
            maxCostPer1MTokens: toPositiveFinite(context.sla?.maxCostPer1MTokens) ?? 0,
            hardConstraints: context.sla?.hardConstraints === true
        };
        const scored = candidates.map((candidate)=>{
            const latencyScore = scoreAtOrBelowThreshold(candidate.p95LatencyMs, policy.targetP95Ms);
            const errorScore = scoreAtOrBelowThreshold(candidate.errorRate, policy.maxErrorRate);
            const costScore = policy.maxCostPer1MTokens > 0 ? scoreAtOrBelowThreshold(candidate.costPer1MTokens, policy.maxCostPer1MTokens) : inverseNormalized(candidate.costPer1MTokens, maxCost);
            const stabilityScore = inverseNormalized(candidate.latencyStdDev, maxStdDev);
            const healthScore = getHealthScore(candidate);
            const violationScore = getSlaViolationScore(candidate, policy);
            return {
                candidate,
                violationScore,
                score: latencyScore * 0.35 + errorScore * 0.35 + healthScore * 0.15 + costScore * 0.1 + stabilityScore * 0.05
            };
        }).sort((a, b)=>{
            if (policy.hardConstraints) {
                return a.violationScore - b.violationScore || b.score - a.score;
            }
            return b.score - a.score;
        });
        const best = scored[0];
        if (!best) throw new Error("[SLAStrategy] No candidates available after scoring");
        const anyCompliant = scored.some((entry)=>entry.violationScore === 0);
        const fallbackNote = !anyCompliant ? "; no candidate met all SLA constraints" : "";
        return {
            provider: best.candidate.provider,
            model: best.candidate.model,
            strategy: this.name,
            reason: `SLAStrategy: p95=${best.candidate.p95LatencyMs}ms/${policy.targetP95Ms}ms, errorRate=${(best.candidate.errorRate * 100).toFixed(2)}%/${(policy.maxErrorRate * 100).toFixed(2)}%, cost=$${best.candidate.costPer1MTokens.toFixed(3)}/1M${fallbackNote}`,
            candidatesConsidered: candidates.length,
            finalScore: best.score
        };
    }
}
// ── LKGPStrategy: tries last known good provider first ───────────────────────
class LKGPStrategyImpl {
    name = "lkgp";
    description = "Tries last known good provider first, then falls back to rules";
    select(pool, context) {
        if (context.lkgpEnabled === false) {
            return getStrategy("rules").select(pool, context);
        }
        if (context.lastKnownGoodProvider) {
            const candidates = pool.filter((c)=>c.provider === context.lastKnownGoodProvider && c.circuitBreakerState !== "OPEN");
            if (candidates.length > 0) {
                const best = candidates[0];
                return {
                    provider: best.provider,
                    model: best.model,
                    strategy: this.name,
                    reason: `LKGP: using last known good provider ${best.provider}`,
                    candidatesConsidered: 1,
                    finalScore: 1.0
                };
            }
        }
        // Fallback to rules strategy
        return getStrategy("rules").select(pool, context);
    }
}
// ── Registry ──────────────────────────────────────────────────────────────────
const strategyRegistry = new Map();
const rulesStrategy = new RulesStrategyImpl();
const costStrategy = new CostStrategyImpl();
const latencyStrategy = new LatencyStrategyImpl();
const slaStrategy = new SLAStrategyImpl();
const lkgpStrategy = new LKGPStrategyImpl();
strategyRegistry.set("rules", rulesStrategy);
strategyRegistry.set("cost", costStrategy);
strategyRegistry.set("eco", costStrategy); // alias
strategyRegistry.set("latency", latencyStrategy);
strategyRegistry.set("fast", latencyStrategy); // alias
strategyRegistry.set("sla-aware", slaStrategy);
strategyRegistry.set("sla", slaStrategy); // alias
strategyRegistry.set("lkgp", lkgpStrategy);
function getStrategy(name) {
    const strategy = strategyRegistry.get(name);
    if (!strategy) {
        console.warn(`[RouterStrategy] Strategy '${name}' not found, falling back to 'rules'`);
        return rulesStrategy;
    }
    return strategy;
}
function registerStrategy(name, strategy) {
    if (strategyRegistry.has(name)) {
        console.warn(`[RouterStrategy] Overwriting strategy '${name}'`);
    }
    strategyRegistry.set(name, strategy);
}
function listStrategies() {
    return [
        ...strategyRegistry.entries()
    ].map(([name, s])=>({
            name,
            description: s.description
        }));
}
function selectWithStrategy(pool, context, strategyName = "rules") {
    return getStrategy(strategyName).select(pool, context);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/autoCombo/complexityRouter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildComplexityRoutingHint",
    ()=>buildComplexityRoutingHint,
    "classifyRequestComplexity",
    ()=>classifyRequestComplexity,
    "escalateTier",
    ()=>escalateTier
]);
/**
 * complexityRouter.ts — Request-complexity classification for tier-aware routing.
 *
 * 2026 strategy: route by the intrinsic difficulty of the *request* (not only by
 * provider stats), so trivial prompts can use cheap models and hard/reasoning
 * prompts escalate to capable ones. Built on the existing specificity detector
 * (codeComplexity / mathComplexity / reasoningDepth / contextSize / toolCalling
 * / domainSpecificity), adding an explicit tool-use → minimum-tier escalation:
 * a request carrying tool/function schemas (or agentic tool-calling signals)
 * should not be routed below the "cheap" tier even when the prose looks
 * trivial, because function-calling reliability matters more than raw cost.
 *
 * The classification maps to a `recommendedTier` that feeds the auto-router's
 * tier-affinity / specificity-match scoring factors (see scoreAutoTargets,
 * gated by config.complexityAwareRouting).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$specificityDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/specificityDetector.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/manifestAdapter.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const TIER_ORDER = [
    "free",
    "cheap",
    "premium"
];
function escalateTier(tier, floor) {
    return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(floor) ? tier : floor;
}
function classifyRequestComplexity(input) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$specificityDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["analyzeSpecificity"])(input);
    const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$specificityDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSpecificityLevel"])(result.score);
    const explicitTools = Array.isArray(input.tools) && input.tools.length > 0;
    const hasToolUse = explicitTools || result.breakdown.toolCalling > 0;
    let recommendedTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$specificityDetector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRecommendedMinTier"])(level);
    // Tool-using / agentic requests need reliable function calling — floor at "cheap".
    if (hasToolUse) recommendedTier = escalateTier(recommendedTier, "cheap");
    return {
        score: result.score,
        level,
        recommendedTier,
        hasToolUse,
        signals: result.rulesTriggered
    };
}
function buildComplexityRoutingHint(modelTargets, body, log) {
    try {
        const ruleInput = {
            messages: Array.isArray(body?.messages) ? body.messages : [],
            tools: Array.isArray(body?.tools) ? body.tools : undefined,
            model: typeof body?.model === "string" ? body.model : undefined
        };
        const hint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateRoutingHints"])(modelTargets, ruleInput);
        // Tool-use escalation: floor the recommended tier at "cheap" so scoring
        // favors function-calling-reliable models for agentic requests.
        const classification = classifyRequestComplexity(ruleInput);
        hint.recommendedMinTier = escalateTier(hint.recommendedMinTier, classification.recommendedTier);
        log.info("COMBO", `Complexity-aware routing: level=${classification.level} score=${classification.score} minTier=${hint.recommendedMinTier} tools=${classification.hasToolUse}`);
        return hint;
    } catch  {
        return null; // fail-open: scoring stays tier-neutral
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/open-sse/services/autoCombo/builtinCatalog.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AUTO_SUFFIX_VARIANTS",
    ()=>AUTO_SUFFIX_VARIANTS,
    "AUTO_TEMPLATE_VARIANTS",
    ()=>AUTO_TEMPLATE_VARIANTS,
    "VALID_AUTO_VARIANTS",
    ()=>VALID_AUTO_VARIANTS,
    "createBuiltinAutoCombo",
    ()=>createBuiltinAutoCombo,
    "isPaidTierAutoId",
    ()=>isPaidTierAutoId,
    "isRecognizedBuiltinAuto",
    ()=>isRecognizedBuiltinAuto,
    "resolveAutoVariant",
    ()=>resolveAutoVariant
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$autoPrefix$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/autoPrefix.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/suffixComposition.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modelFamily.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const VALID_AUTO_VARIANTS = new Set(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$autoPrefix$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["VALID_VARIANTS"]);
const AUTO_TEMPLATE_VARIANTS = {
    "auto/best-coding": "coding",
    "auto/best-reasoning": "smart",
    "auto/best-fast": "fast",
    "auto/best-vision": "smart",
    "auto/best-chat": undefined,
    "auto/best-coding-fast": "fast",
    "auto/pro-coding": "coding",
    "auto/pro-reasoning": "smart",
    "auto/pro-vision": "smart",
    "auto/pro-chat": undefined,
    "auto/pro-fast": "fast",
    "auto/coding": "coding",
    "auto/fast": "fast",
    "auto/chat": undefined,
    // #4235 Phase A: these are valid variants (parseAutoPrefix accepts them) and
    // the README advertises them, but they were missing from this catalog so
    // `/v1/models` + the dashboard never listed them. Surface them explicitly.
    "auto/cheap": "cheap",
    "auto/offline": "offline",
    "auto/smart": "smart",
    "auto/claude-opus": "smart",
    "auto/claude-sonnet": "coding",
    "auto/best-free": "cheap",
    // Chaos mode — parallel dispatch to top-N stable models
    "auto/best-chaos": "chaos",
    "auto/chaos": "chaos"
};
const AUTO_SUFFIX_VARIANTS = [
    "auto/coding:fast",
    "auto/coding:cheap",
    "auto/coding:free",
    "auto/coding:pro",
    "auto/coding:reliable",
    "auto/reasoning",
    "auto/reasoning:pro",
    "auto/vision",
    "auto/multimodal"
];
function resolveAutoVariant(modelStr, suffix) {
    if (Object.prototype.hasOwnProperty.call(AUTO_TEMPLATE_VARIANTS, modelStr)) {
        return {
            recognized: true,
            variant: AUTO_TEMPLATE_VARIANTS[modelStr]
        };
    }
    if (VALID_AUTO_VARIANTS.has(suffix)) {
        return {
            recognized: true,
            variant: suffix
        };
    }
    return {
        recognized: false
    };
}
function isRecognizedBuiltinAuto(modelStr, suffix) {
    return resolveAutoVariant(modelStr, suffix).recognized || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoSuffix"])(suffix).valid || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isValidModelFamily"])(suffix);
}
function isPaidTierAutoId(autoId) {
    if (typeof autoId !== "string" || !autoId.startsWith("auto/")) return false;
    const suffix = autoId.slice("auto/".length);
    if (suffix.startsWith("pro-")) return true;
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoSuffix"])(suffix);
    return parsed.valid && parsed.tier === "pro";
}
async function createBuiltinAutoCombo(modelStr, suffix) {
    const { createVirtualAutoCombo } = await __turbopack_context__.A("[project]/open-sse/services/autoCombo/virtualFactory.ts [instrumentation] (ecmascript, async loader)");
    const resolved = resolveAutoVariant(modelStr, suffix);
    if (resolved.recognized) {
        const spec = modelStr === "auto/best-free" ? {
            tier: "free"
        } : undefined;
        const virtualCombo = await createVirtualAutoCombo(resolved.variant, spec);
        virtualCombo.name = modelStr;
        virtualCombo.id = modelStr;
        return virtualCombo;
    }
    // #4235 Phase B: `auto/<category>[:<tier>]` (e.g. auto/coding:fast, auto/vision).
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$suffixComposition$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseAutoSuffix"])(suffix);
    if (parsed.valid) {
        const virtualCombo = await createVirtualAutoCombo(undefined, {
            category: parsed.category,
            tier: parsed.tier
        });
        virtualCombo.name = modelStr;
        virtualCombo.id = modelStr;
        return virtualCombo;
    }
    // #6453: `auto/<family>` (e.g. auto/glm, auto/minimax, auto/zai, auto/mimo,
    // auto/gemma, auto/llama, auto/gemini) — spans whatever installed backends
    // currently expose that model family, degrading gracefully as backends rotate.
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modelFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isValidModelFamily"])(suffix)) {
        const virtualCombo = await createVirtualAutoCombo(undefined, {
            family: suffix
        });
        virtualCombo.name = modelStr;
        virtualCombo.id = modelStr;
        return virtualCombo;
    }
    throw new Error(`Unknown built-in auto combo: ${modelStr}`);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_autoCombo_1d1qiwd._.js.map