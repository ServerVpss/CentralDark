module.exports = [
"[project]/src/types/databaseSettings.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Database performance optimization settings stored in SQLite key-value pairs.
 * User-configurable aggregation, retention, and optimization settings.
 */ __turbopack_context__.s([
    "DEFAULT_DATABASE_SETTINGS",
    ()=>DEFAULT_DATABASE_SETTINGS
]);
const DEFAULT_DATABASE_SETTINGS = {
    logs: {
        detailedLogsEnabled: false,
        callLogPipelineEnabled: false,
        maxDetailSizeKb: 10,
        ringBufferSize: 500
    },
    backup: {
        autoBackupEnabled: false,
        autoBackupFrequency: "never",
        keepLastNBackups: 5
    },
    cache: {
        semanticCacheEnabled: true,
        semanticCacheMaxSize: 100,
        semanticCacheTTL: 1800000,
        promptCacheEnabled: true,
        promptCacheStrategy: "auto",
        alwaysPreserveClientCache: "auto",
        // Keep in sync with CATALOG_CACHE_TTL_MS_DEFAULT
        // (src/app/api/v1/models/catalogCache.ts) — this value is what actually takes
        // effect, since catalog.ts reads it as `dbSettings.cache?.modelCatalogCacheTtlMs
        // ?? CATALOG_CACHE_TTL_MS_DEFAULT` and the `??` never falls through while a
        // default is declared here. Guarded by tests/unit/v1-models-catalog-ttl.test.ts.
        modelCatalogCacheTtlMs: 60_000
    },
    retention: {
        quotaSnapshots: 7,
        compressionAnalytics: 30,
        mcpAudit: 30,
        a2aEvents: 30,
        callLogs: 30,
        usageHistory: 30,
        memoryEntries: 30,
        domainCostHistory: 30,
        compressionCacheStats: 30,
        xpAuditLog: 30,
        compressionRunTelemetry: 30,
        autoCleanupEnabled: true
    },
    aggregation: {
        enabled: true,
        rawDataRetentionDays: 30,
        granularity: "daily"
    },
    optimization: {
        autoVacuumMode: "FULL",
        scheduledVacuum: "weekly",
        vacuumHour: 2,
        pageSize: 4096,
        cacheSize: 65536,
        optimizeOnStartup: true
    }
};
}),
"[project]/src/domain/connectionModelRules.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionExcludedModels",
    ()=>getConnectionExcludedModels,
    "hasEligibleConnectionForModel",
    ()=>hasEligibleConnectionForModel,
    "isModelExcludedByConnection",
    ()=>isModelExcludedByConnection,
    "normalizeExcludedModelPatterns",
    ()=>normalizeExcludedModelPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [instrumentation] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePattern(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || normalized === "**") return null;
    return normalized;
}
function toPatternList(value) {
    if (Array.isArray(value)) {
        return value.map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    if (typeof value === "string") {
        return value.split(",").map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    return [];
}
function uniquePatterns(patterns) {
    return Array.from(new Set(patterns));
}
function getModelMatchCandidates(modelId) {
    const normalized = modelId.trim();
    if (!normalized) return [];
    const withoutExtendedContext = normalized.endsWith("[1m]") ? normalized.slice(0, -4) : normalized;
    const lastSlashIndex = withoutExtendedContext.lastIndexOf("/");
    const rawModel = lastSlashIndex >= 0 ? withoutExtendedContext.slice(lastSlashIndex + 1) : withoutExtendedContext;
    return Array.from(new Set([
        normalized,
        withoutExtendedContext,
        rawModel
    ].filter(Boolean)));
}
function normalizeExcludedModelPatterns(value) {
    return uniquePatterns(toPatternList(value));
}
function getConnectionExcludedModels(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeExcludedModelPatterns(data.excludedModels ?? data.excluded_models);
}
function isModelExcludedByConnection(modelId, providerSpecificData) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return false;
    const candidates = getModelMatchCandidates(modelId);
    const excludedModels = getConnectionExcludedModels(providerSpecificData);
    if (candidates.length === 0 || excludedModels.length === 0) return false;
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/domain/tagRouter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionRoutingTags",
    ()=>getConnectionRoutingTags,
    "matchesRoutingTags",
    ()=>matchesRoutingTags,
    "normalizeRoutingTagMatchMode",
    ()=>normalizeRoutingTagMatchMode,
    "normalizeRoutingTags",
    ()=>normalizeRoutingTags,
    "resolveRequestRoutingTags",
    ()=>resolveRequestRoutingTags
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeSingleRoutingTag(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}
function normalizeRoutingTags(value) {
    const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    const deduped = new Set();
    for (const rawValue of rawValues){
        const normalized = normalizeSingleRoutingTag(rawValue);
        if (normalized) deduped.add(normalized);
    }
    return Array.from(deduped);
}
function normalizeRoutingTagMatchMode(value) {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : typeof value === "number" ? "" : "";
    return normalized === "all" ? "all" : "any";
}
function getConnectionRoutingTags(providerSpecificData) {
    return normalizeRoutingTags(asRecord(providerSpecificData).tags);
}
function matchesRoutingTags(connectionTags, requestTags, matchMode = "any") {
    if (requestTags.length === 0) return true;
    if (connectionTags.length === 0) return false;
    const tagSet = new Set(connectionTags);
    if (matchMode === "all") {
        return requestTags.every((tag)=>tagSet.has(tag));
    }
    return requestTags.some((tag)=>tagSet.has(tag));
}
function resolveRequestRoutingTags(body) {
    const metadata = asRecord(body?.metadata);
    return {
        tags: normalizeRoutingTags(metadata.tags),
        matchMode: normalizeRoutingTagMatchMode(metadata.tag_match_mode ?? metadata.tagMatchMode)
    };
}
}),
"[project]/src/domain/costRules.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkBudget",
    ()=>checkBudget,
    "deleteBudget",
    ()=>deleteBudget,
    "getBudget",
    ()=>getBudget,
    "getBudgetWindow",
    ()=>getBudgetWindow,
    "getCostSummary",
    ()=>getCostSummary,
    "getDailyTotal",
    ()=>getDailyTotal,
    "recordCost",
    ()=>recordCost,
    "resetCostData",
    ()=>resetCostData,
    "setBudget",
    ()=>setBudget,
    "syncAllBudgetSchedules",
    ()=>syncAllBudgetSchedules
]);
/**
 * Cost Rules — Domain Layer (T-19)
 *
 * Business rules for cost management: budget thresholds,
 * scheduled reset windows, and cost summaries per API key.
 *
 * State is persisted in SQLite via domainState.ts.
 *
 * @module domain/costRules
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/spend/batchWriter.ts [instrumentation] (ecmascript)");
;
;
const VALID_RESET_INTERVALS = new Set([
    "daily",
    "weekly",
    "monthly"
]);
const RESET_TIME_REGEX = /^(\d{2}):(\d{2})$/;
/** @type {Map<string, NormalizedBudgetConfig>} In-memory cache for budgets */ const budgets = new Map();
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function toCostEntries(value) {
    if (!Array.isArray(value)) return [];
    const entries = [];
    for (const item of value){
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const record = item;
        const cost = toNumber(record.cost, Number.NaN);
        const timestamp = toNumber(record.timestamp, Number.NaN);
        if (!Number.isFinite(cost) || !Number.isFinite(timestamp)) continue;
        entries.push({
            cost,
            timestamp
        });
    }
    return entries;
}
function sumEntries(entries) {
    return entries.reduce((sum, entry)=>sum + entry.cost, 0);
}
function normalizeResetInterval(value) {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (VALID_RESET_INTERVALS.has(normalized)) {
            return normalized;
        }
    }
    return "daily";
}
function normalizeResetTime(value) {
    if (typeof value === "string") {
        const match = value.trim().match(RESET_TIME_REGEX);
        if (match) {
            const hours = Math.min(Math.max(parseInt(match[1], 10), 0), 23);
            const minutes = Math.min(Math.max(parseInt(match[2], 10), 0), 59);
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }
    }
    return "00:00";
}
function normalizeTimestamp(value) {
    const numeric = toNumber(value, Number.NaN);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}
function normalizeBudgetConfig(config) {
    return {
        dailyLimitUsd: Math.max(0, toNumber(config.dailyLimitUsd)),
        weeklyLimitUsd: Math.max(0, toNumber(config.weeklyLimitUsd)),
        monthlyLimitUsd: Math.max(0, toNumber(config.monthlyLimitUsd)),
        warningThreshold: Math.min(Math.max(toNumber(config.warningThreshold, 0.8), 0), 1),
        resetInterval: normalizeResetInterval(config.resetInterval),
        resetTime: normalizeResetTime(config.resetTime),
        budgetResetAt: normalizeTimestamp(config.budgetResetAt),
        lastBudgetResetAt: normalizeTimestamp(config.lastBudgetResetAt),
        warningEmittedAt: normalizeTimestamp(config.warningEmittedAt),
        warningPeriodStart: normalizeTimestamp(config.warningPeriodStart)
    };
}
function getResetTimeParts(resetTime) {
    const match = resetTime.match(RESET_TIME_REGEX);
    if (!match) return [
        0,
        0
    ];
    return [
        parseInt(match[1], 10),
        parseInt(match[2], 10)
    ];
}
function getUtcDateMs(year, month, day, hours, minutes) {
    return Date.UTC(year, month, day, hours, minutes, 0, 0);
}
function getBudgetWindow(resetInterval, resetTime = "00:00", now = Date.now()) {
    const current = new Date(now);
    const [hours, minutes] = getResetTimeParts(normalizeResetTime(resetTime));
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();
    const day = current.getUTCDate();
    if (resetInterval === "weekly") {
        const daysSinceMonday = (current.getUTCDay() + 6) % 7;
        const thisWeekReset = getUtcDateMs(year, month, day - daysSinceMonday, hours, minutes);
        return now >= thisWeekReset ? {
            periodStartAt: thisWeekReset,
            nextResetAt: getUtcDateMs(year, month, day - daysSinceMonday + 7, hours, minutes)
        } : {
            periodStartAt: getUtcDateMs(year, month, day - daysSinceMonday - 7, hours, minutes),
            nextResetAt: thisWeekReset
        };
    }
    if (resetInterval === "monthly") {
        const thisMonthReset = getUtcDateMs(year, month, 1, hours, minutes);
        return now >= thisMonthReset ? {
            periodStartAt: thisMonthReset,
            nextResetAt: getUtcDateMs(year, month + 1, 1, hours, minutes)
        } : {
            periodStartAt: getUtcDateMs(year, month - 1, 1, hours, minutes),
            nextResetAt: thisMonthReset
        };
    }
    const todayReset = getUtcDateMs(year, month, day, hours, minutes);
    return now >= todayReset ? {
        periodStartAt: todayReset,
        nextResetAt: getUtcDateMs(year, month, day + 1, hours, minutes)
    } : {
        periodStartAt: getUtcDateMs(year, month, day - 1, hours, minutes),
        nextResetAt: todayReset
    };
}
function getActiveBudgetLimit(budget) {
    if (budget.resetInterval === "monthly") {
        return budget.monthlyLimitUsd > 0 ? budget.monthlyLimitUsd : budget.dailyLimitUsd;
    }
    if (budget.resetInterval === "weekly") {
        return budget.weeklyLimitUsd > 0 ? budget.weeklyLimitUsd : budget.dailyLimitUsd;
    }
    return budget.dailyLimitUsd;
}
function getBudgetWindowTotal(apiKeyId, periodStartAt) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadCostTotal"])(apiKeyId, periodStartAt) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, periodStartAt);
    } catch  {
        return 0;
    }
}
function getBudgetWindowRangeTotal(apiKeyId, periodStartAt, periodEndAt) {
    try {
        return sumEntries(toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadCostEntriesInRange"])(apiKeyId, periodStartAt, periodEndAt))) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, periodStartAt, periodEndAt);
    } catch  {
        return 0;
    }
}
function emitBudgetWarning(apiKeyId, budget, projectedTotal, activeLimitUsd, nextResetAt) {
    const percentage = activeLimitUsd > 0 ? (projectedTotal / activeLimitUsd * 100).toFixed(1) : "0.0";
    console.warn(`[BudgetWarning] ${apiKeyId} reached ${percentage}% of ${budget.resetInterval} budget ($${projectedTotal.toFixed(4)} / $${activeLimitUsd.toFixed(2)}) — next reset ${new Date(nextResetAt).toISOString()}`);
}
function syncBudgetSchedule(apiKeyId, config, now = Date.now(), options = {}) {
    const normalized = normalizeBudgetConfig(config);
    const window = getBudgetWindow(normalized.resetInterval, normalized.resetTime, now);
    const resetRolled = normalized.lastBudgetResetAt !== null && window.periodStartAt > normalized.lastBudgetResetAt;
    if (resetRolled && options.logReset !== false) {
        const previousSpend = getBudgetWindowRangeTotal(apiKeyId, normalized.lastBudgetResetAt, window.periodStartAt);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveBudgetResetLog"])({
                apiKeyId,
                resetInterval: normalized.resetInterval,
                previousSpend,
                resetAt: window.periodStartAt,
                nextResetAt: window.nextResetAt,
                periodStart: window.periodStartAt,
                periodEnd: window.nextResetAt
            });
        } catch  {
        // Non-fatal: budget logic still proceeds even if logging fails.
        }
    }
    const updated = {
        ...normalized,
        budgetResetAt: window.nextResetAt,
        lastBudgetResetAt: window.periodStartAt,
        warningEmittedAt: resetRolled ? null : normalized.warningEmittedAt,
        warningPeriodStart: resetRolled ? null : normalized.warningPeriodStart
    };
    const changed = normalized.budgetResetAt !== updated.budgetResetAt || normalized.lastBudgetResetAt !== updated.lastBudgetResetAt || normalized.warningEmittedAt !== updated.warningEmittedAt || normalized.warningPeriodStart !== updated.warningPeriodStart || normalized.dailyLimitUsd !== updated.dailyLimitUsd || normalized.weeklyLimitUsd !== updated.weeklyLimitUsd || normalized.monthlyLimitUsd !== updated.monthlyLimitUsd || normalized.warningThreshold !== updated.warningThreshold || normalized.resetInterval !== updated.resetInterval || normalized.resetTime !== updated.resetTime;
    if (changed && options.persist !== false) {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveBudget"])(apiKeyId, updated);
        } catch  {
        // Non-critical: in-memory cache still works.
        }
    }
    budgets.set(apiKeyId, updated);
    return updated;
}
function setBudget(apiKeyId, config) {
    return syncBudgetSchedule(apiKeyId, config, Date.now(), {
        logReset: false,
        persist: true
    });
}
function getBudget(apiKeyId) {
    const cached = budgets.get(apiKeyId);
    if (cached) {
        return syncBudgetSchedule(apiKeyId, cached);
    }
    try {
        const fromDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadBudget"])(apiKeyId);
        if (fromDb) {
            return syncBudgetSchedule(apiKeyId, fromDb);
        }
    } catch  {
    // DB may not be ready.
    }
    return null;
}
function deleteBudget(apiKeyId) {
    budgets.delete(apiKeyId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["discardSpendBatchEntries"])(apiKeyId);
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteBudget"])(apiKeyId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteCostEntries"])(apiKeyId);
    } catch  {
    // Non-critical.
    }
}
function recordCost(apiKeyId, cost) {
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].increment(apiKeyId, cost, Date.now());
    } catch  {
    // Non-critical.
    }
}
function syncAllBudgetSchedules(now = Date.now()) {
    let processed = 0;
    let resetCount = 0;
    try {
        const allBudgets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadAllBudgets"])();
        for (const [apiKeyId, budget] of Object.entries(allBudgets)){
            processed += 1;
            const synced = syncBudgetSchedule(apiKeyId, budget, now, {
                logReset: true,
                persist: true
            });
            if (budget.lastBudgetResetAt !== synced.lastBudgetResetAt) {
                resetCount += 1;
            }
        }
    } catch  {
    // Non-critical.
    }
    return {
        processed,
        resetCount
    };
}
function checkBudget(apiKeyId, additionalCost = 0) {
    const budget = getBudget(apiKeyId);
    if (!budget) {
        return {
            allowed: true,
            dailyUsed: 0,
            dailyLimit: 0,
            warningReached: false,
            remaining: 0,
            periodUsed: 0,
            activeLimitUsd: 0,
            resetInterval: null,
            resetTime: null,
            budgetResetAt: null,
            lastBudgetResetAt: null,
            periodStartAt: null
        };
    }
    const window = getBudgetWindow(budget.resetInterval, budget.resetTime);
    const periodUsed = getBudgetWindowTotal(apiKeyId, window.periodStartAt);
    const projectedTotal = periodUsed + additionalCost;
    const activeLimitUsd = getActiveBudgetLimit(budget);
    const warningReached = activeLimitUsd > 0 && projectedTotal >= activeLimitUsd * budget.warningThreshold;
    const remaining = Math.max(activeLimitUsd - projectedTotal, 0);
    if (warningReached && budget.warningPeriodStart !== window.periodStartAt) {
        const updatedBudget = {
            ...budget,
            warningEmittedAt: Date.now(),
            warningPeriodStart: window.periodStartAt
        };
        budgets.set(apiKeyId, updatedBudget);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveBudget"])(apiKeyId, updatedBudget);
            emitBudgetWarning(apiKeyId, updatedBudget, projectedTotal, activeLimitUsd, window.nextResetAt);
        } catch  {
        // Non-critical.
        }
    }
    if (activeLimitUsd > 0 && projectedTotal > activeLimitUsd) {
        return {
            allowed: false,
            reason: `${budget.resetInterval[0].toUpperCase()}${budget.resetInterval.slice(1)} budget exceeded: $${projectedTotal.toFixed(4)} / $${activeLimitUsd.toFixed(2)}`,
            dailyUsed: periodUsed,
            dailyLimit: activeLimitUsd,
            warningReached: true,
            remaining,
            periodUsed,
            activeLimitUsd,
            resetInterval: budget.resetInterval,
            resetTime: budget.resetTime,
            budgetResetAt: window.nextResetAt,
            lastBudgetResetAt: window.periodStartAt,
            periodStartAt: window.periodStartAt
        };
    }
    return {
        allowed: true,
        dailyUsed: periodUsed,
        dailyLimit: activeLimitUsd,
        warningReached,
        remaining,
        periodUsed,
        activeLimitUsd,
        resetInterval: budget.resetInterval,
        resetTime: budget.resetTime,
        budgetResetAt: window.nextResetAt,
        lastBudgetResetAt: window.periodStartAt,
        periodStartAt: window.periodStartAt
    };
}
function getDailyTotal(apiKeyId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    try {
        return sumEntries(toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, todayStart.getTime()))) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, todayStart.getTime());
    } catch  {
        return 0;
    }
}
function getCostSummary(apiKeyId) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const budget = getBudget(apiKeyId);
    const window = budget ? getBudgetWindow(budget.resetInterval, budget.resetTime) : null;
    try {
        const dailyEntries = [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, todayStart.getTime())),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, todayStart.getTime())
        ];
        const monthlyEntries = [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, monthStart.getTime())),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, monthStart.getTime())
        ];
        const periodEntries = window !== null ? [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, window.periodStartAt)),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, window.periodStartAt)
        ] : [];
        const dailyTotal = sumEntries(dailyEntries);
        const monthlyTotal = sumEntries(monthlyEntries);
        const periodTotal = sumEntries(periodEntries);
        const activeLimitUsd = budget ? getActiveBudgetLimit(budget) : 0;
        return {
            dailyTotal,
            monthlyTotal,
            totalEntries: monthlyEntries.length,
            budget,
            totalCostToday: dailyTotal,
            totalCostMonth: monthlyTotal,
            totalCostPeriod: periodTotal,
            activeLimitUsd,
            resetInterval: budget?.resetInterval ?? null,
            resetTime: budget?.resetTime ?? null,
            budgetResetAt: window?.nextResetAt ?? budget?.budgetResetAt ?? null,
            lastBudgetResetAt: window?.periodStartAt ?? budget?.lastBudgetResetAt ?? null,
            periodStartAt: window?.periodStartAt ?? null,
            nextResetAt: window?.nextResetAt ?? null,
            dailyLimitUsd: budget?.dailyLimitUsd ?? 0,
            weeklyLimitUsd: budget?.weeklyLimitUsd ?? 0,
            monthlyLimitUsd: budget?.monthlyLimitUsd ?? 0,
            warningThreshold: budget?.warningThreshold ?? null
        };
    } catch  {
        return {
            dailyTotal: 0,
            monthlyTotal: 0,
            totalEntries: 0,
            budget,
            totalCostToday: 0,
            totalCostMonth: 0,
            totalCostPeriod: 0,
            activeLimitUsd: budget ? getActiveBudgetLimit(budget) : 0,
            resetInterval: budget?.resetInterval ?? null,
            resetTime: budget?.resetTime ?? null,
            budgetResetAt: budget?.budgetResetAt ?? null,
            lastBudgetResetAt: budget?.lastBudgetResetAt ?? null,
            periodStartAt: budget?.lastBudgetResetAt ?? null,
            nextResetAt: budget?.budgetResetAt ?? null,
            dailyLimitUsd: budget?.dailyLimitUsd ?? 0,
            weeklyLimitUsd: budget?.weeklyLimitUsd ?? 0,
            monthlyLimitUsd: budget?.monthlyLimitUsd ?? 0,
            warningThreshold: budget?.warningThreshold ?? null
        };
    }
}
function resetCostData() {
    budgets.clear();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resetSpendBatchWriterForTests"])();
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteAllCostData"])();
    } catch  {
    // Non-critical.
    }
}
}),
"[project]/src/mitm/inspector/types.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "InterceptedRequestSchema",
    ()=>InterceptedRequestSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const InterceptedRequestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid(),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "agent-bridge",
        "custom-host",
        "http-proxy",
        "system-proxy",
        "tproxy"
    ]),
    agent: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    method: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    host: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    requestHeaders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    requestBody: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    requestSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    responseHeaders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    responseBody: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    responseSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int(),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("in-flight"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("error")
    ]),
    proxyLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    upstreamLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    totalLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sourceModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    mappedModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    detectedKind: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "llm",
        "app",
        "unknown"
    ]).optional(),
    contextKey: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    annotation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sessionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid().optional(),
    note: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    pid: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative().optional(),
    processName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/providers/[id]/test/mistralAmbiguousAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * #7638: Mistral's quota-exhausted response is `401 {"detail":"Unauthorized"}` — byte-identical
 * to a genuinely revoked key. Unlike other providers, a bare Mistral 401 with no auth-specific
 * signal in the body cannot be trusted as a hard auth failure; the generic 401/403 branch in
 * classifyFailure() delegates here so it can return an ambiguous diagnosis instead of asserting
 * "Invalid API key" outright.
 * A message that DOES carry an explicit auth signal (e.g. "Invalid API key") still falls
 * through to the normal `upstream_auth_error` result — only the contentless case is ambiguous.
 */ __turbopack_context__.s([
    "classifyAmbiguousOrAuthError",
    ()=>classifyAmbiguousOrAuthError
]);
function isMistralAmbiguous401(provider, normalized) {
    if (provider !== "mistral") return false;
    const hasAuthSignal = normalized.includes("invalid api key") || normalized.includes("token invalid") || normalized.includes("revoked") || normalized.includes("access denied");
    return !hasAuthSignal;
}
function classifyAmbiguousOrAuthError(provider, normalized, message, numericStatus) {
    if (numericStatus === 401 && isMistralAmbiguous401(provider, normalized)) {
        return {
            type: "upstream_ambiguous_auth_or_quota",
            source: "upstream",
            message: message || null,
            code: String(numericStatus)
        };
    }
    return {
        type: "upstream_auth_error",
        source: "upstream",
        message: message || null,
        code: String(numericStatus)
    };
}
}),
"[project]/src/app/api/providers/[id]/test/oauthTestConfig.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OAUTH_TEST_CONFIG",
    ()=>OAUTH_TEST_CONFIG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)");
;
const CLINE_OAUTH_TEST_CONFIG = {
    // Cline does not expose a stable lightweight auth probe. Validate token
    // presence/expiry here; real connectivity is exercised by chat requests.
    checkExpiry: true,
    refreshable: true
};
// Shared api.x.ai chat probe for apikey `xai` and OAuth `xai-oauth` / alias `xao`.
const XAI_CHAT_OAUTH_TEST_CONFIG = {
    url: "https://api.x.ai/v1/chat/completions",
    method: "POST",
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    extraHeaders: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: "grok-4.3",
        messages: [
            {
                role: "user",
                content: "ping"
            }
        ],
        max_tokens: 1,
        stream: false,
        reasoning: {
            effort: "high"
        }
    }),
    refreshable: true
};
const OAUTH_TEST_CONFIG = {
    claude: {
        // Claude doesn't have userinfo, we verify token exists and not expired
        checkExpiry: true,
        refreshable: true
    },
    codex: {
        // Port of decolua/9router#347: probe the real Codex /responses endpoint instead
        // of relying on `checkExpiry`. Codex OAuth tokens are ChatGPT session tokens
        // (not OpenAI API keys) — api.openai.com/v1/models rejects them with 403.
        // Hitting the actual endpoint with a minimal invalid body returns 400 when
        // auth is accepted (the body is the reason for the failure) and 401/403 when
        // the token is bad. That is a real auth signal — checkExpiry alone could not
        // distinguish a revoked-but-not-yet-expired token from a working one.
        url: "https://chatgpt.com/backend-api/codex/responses",
        method: "POST",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
        extraHeaders: {
            "Content-Type": "application/json",
            originator: "codex-cli",
            "User-Agent": "codex-cli/1.0.18 (macOS; arm64)"
        },
        // Minimal invalid body — triggers a fast 400 without consuming quota.
        // #7521: probe with a ChatGPT-account-supported model. "gpt-5.3-codex" is a
        // codex-only id that ChatGPT accounts reject with a 400 for the WRONG reason
        // (unsupported model, not "auth ok, body invalid") — collapsing the auth signal
        // so a bad token looks the same as a good one. "gpt-5.5" is served for
        // ChatGPT sessions; `input: []` still yields the intended 400.
        body: JSON.stringify({
            model: "gpt-5.5",
            input: [],
            stream: false,
            store: false
        }),
        // 400 = bad request, but auth was accepted; only 401/403 means the token is bad.
        acceptStatuses: [
            400
        ],
        refreshable: true
    },
    antigravity: {
        url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        method: "GET",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
        refreshable: true
    },
    // `agy` is a separate connection id that shares the Antigravity backend and the same
    // Google OAuth token lifecycle (tokenRefresh.ts routes it to refreshGoogleToken), but
    // it was missing here — so "Test Connection" fell through to "Provider test not
    // supported", recorded testStatus="error", and painted the home topology node red on a
    // perfectly good account. Probe the same userinfo endpoint as antigravity.
    agy: {
        url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        method: "GET",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
        refreshable: true
    },
    xai: XAI_CHAT_OAUTH_TEST_CONFIG,
    "xai-oauth": XAI_CHAT_OAUTH_TEST_CONFIG,
    xao: XAI_CHAT_OAUTH_TEST_CONFIG,
    github: {
        url: "https://api.github.com/user",
        method: "GET",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
        extraHeaders: {
            "User-Agent": "OmniRoute",
            Accept: "application/vnd.github+json"
        }
    },
    "gitlab-duo": {
        getUrl: (connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitLabOAuthEndpoints"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveGitLabOAuthBaseUrl"])(connection?.providerSpecificData)).directAccessUrl,
        method: "POST",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
        refreshable: true
    },
    cursor: {
        checkExpiry: true
    },
    "kimi-coding": {
        checkExpiry: true,
        refreshable: true
    },
    kilocode: {
        // Kilo OAuth does not expose a stable user-info endpoint in all environments.
        // Validate using token presence/expiry as a lightweight auth check.
        checkExpiry: true
    },
    cline: CLINE_OAUTH_TEST_CONFIG,
    // ClinePass reuses the same WorkOS OAuth flow and token lifecycle as Cline.
    clinepass: CLINE_OAUTH_TEST_CONFIG,
    kiro: {
        checkExpiry: true,
        refreshable: true
    },
    "amazon-q": {
        checkExpiry: true,
        refreshable: true
    },
    "codebuddy-cn": {
        // Upstream test endpoint mirrors "tokenExists: true" from the CodeBuddy port —
        // validate auth via token presence + refresh path. Live connectivity is
        // verified through real /v2/chat/completions traffic.
        checkExpiry: true,
        refreshable: true
    },
    "devin-cli": {
        // Same gap as grok-cli #7610: absent from this table, so "Test Connection"
        // always fell through to "Provider test not supported" and left a working
        // connection showing a red ERR badge. There is no HTTP probe to hit — the
        // executor drives the local `devin` binary over ACP stdio and the binary
        // owns its own credentials (`devin auth login`), so there is no refresh
        // token to rotate either. Validate on token presence/expiry; real
        // connectivity is proven by every chat/completions request.
        checkExpiry: true
    },
    "grok-cli": {
        // #7610: was entirely absent from OAUTH_TEST_CONFIG, so "Test Connection"
        // always fell through to the generic "Provider test not supported" branch
        // below. Grok Build's cli-chat-proxy endpoint doesn't expose a lightweight
        // userinfo probe, and it enforces cli-specific headers (see
        // GrokCliExecutor.buildHeaders) that this shared prober doesn't send — so
        // mirror cline/kilocode's checkExpiry pattern instead of a live probe.
        // Real connectivity is still validated on every chat/completions request.
        checkExpiry: true,
        refreshable: true
    },
    "ghe-copilot": {
        // GHE Copilot: probe the enterprise user-info endpoint derived from gheUrl
        // (stored in providerSpecificData).
        getUrl: (connection)=>{
            const gheUrl = connection?.providerSpecificData?.gheUrl || connection?.gheUrl || "";
            const base = gheUrl.replace(/\/+$/, "");
            return `${base}/api/v3/user`;
        },
        method: "GET",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
        extraHeaders: {
            "User-Agent": "OmniRoute",
            Accept: "application/vnd.github+json"
        },
        refreshable: true
    }
};
}),
"[project]/src/app/api/providers/[id]/test/cliRuntimeProviderMap.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Maps a provider id to the CLI tool id whose local runtime must be present
// for the connection-test path to authenticate against a local CLI auth file.
// kilocode is intentionally absent: the provider uses OAuth device flow + direct
// HTTPS to api.kilo.ai and never depends on the kilocode CLI binary at runtime
// (#2404). CLI-tools integration for Kilo (configuring the VSCode extension to
// point at OmniRoute) lives in /api/cli-tools/kilo-settings and keeps its own
// runtime check there.
__turbopack_context__.s([
    "CLI_RUNTIME_PROVIDER_MAP",
    ()=>CLI_RUNTIME_PROVIDER_MAP
]);
const CLI_RUNTIME_PROVIDER_MAP = {
    cline: "cline",
    qoder: "qoder"
};
}),
"[project]/src/app/api/providers/[id]/test/route.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "classifyFailure",
    ()=>classifyFailure,
    "testOAuthConnection",
    ()=>testOAuthConnection,
    "testSingleConnection",
    ()=>testSingleConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/validation/helpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$machineId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/machineId.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudSync.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/providers/validation.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/services/cliRuntime.ts [instrumentation] (ecmascript)");
// Use the shared open-sse token refresh with built-in dedup/race-condition cache
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHealthCheck.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/proxyLogger.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/gitlab.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$mistralAmbiguousAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/providers/[id]/test/mistralAmbiguousAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$oauthTestConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/providers/[id]/test/oauthTestConfig.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$cliRuntimeProviderMap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/providers/[id]/test/cliRuntimeProviderMap.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
// Bound the OAuth probe so a hung upstream can't block the connection-test queue
// forever (#1449). Mirrors the 30s timeout the API-key path uses via validateProviderApiKey.
const OAUTH_TEST_TIMEOUT_MS = 30_000;
;
/** POST body is optional; when present, only known fields are validated. */ const providerConnectionTestBodySchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    validationModelId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(500).optional()
});
function toSafeMessage(value, fallback = "Unknown error") {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
}
function makeDiagnosis(type, source, message, code = null) {
    return {
        type,
        source,
        message: message || null,
        code: code ?? null
    };
}
/**
 * A provider/account that the upstream has deactivated (vs. a revoked/expired token).
 * #1444: a Codex account can have a perfectly healthy OAuth refresh while its ChatGPT
 * account is deactivated, in which case the API returns 401 — mislabeling that as
 * "Token invalid or revoked" hides the real cause. Mirrors the deactivation phrases the
 * account-fallback classifier already trusts.
 */ function isAccountDeactivatedMessage(text) {
    const n = (text || "").toLowerCase();
    return n.includes("account_deactivated") || n.includes("deactivat") && n.includes("account");
}
function classifyFailure({ error, statusCode = null, refreshFailed = false, unsupported = false, provider }) {
    const message = toSafeMessage(error, "Connection test failed");
    const normalized = message.toLowerCase();
    const numericStatus = Number.isFinite(statusCode) ? Number(statusCode) : null;
    if (unsupported) {
        return makeDiagnosis("unsupported", "validation", message, "unsupported");
    }
    if (refreshFailed || normalized.includes("refresh failed")) {
        return makeDiagnosis("token_refresh_failed", "oauth", message, "refresh_failed");
    }
    // #1444: a deactivated account is distinct from a revoked/expired token — surface it
    // as account_deactivated (which the dashboard renders as "Account Deactivated") before
    // the generic 401/403 branch below would mark it "upstream_auth_error".
    if (isAccountDeactivatedMessage(normalized)) {
        return makeDiagnosis("account_deactivated", "account", message, "account_deactivated");
    }
    if (numericStatus === 401 || numericStatus === 403) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$mistralAmbiguousAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["classifyAmbiguousOrAuthError"])(provider, normalized, message, numericStatus);
    }
    if (numericStatus === 429) {
        return makeDiagnosis("upstream_rate_limited", "upstream", message, "429");
    }
    if (numericStatus && numericStatus >= 500) {
        return makeDiagnosis("upstream_unavailable", "upstream", message, String(numericStatus));
    }
    if (normalized.includes("token expired") || normalized.includes("expired")) {
        return makeDiagnosis("token_expired", "oauth", message, "token_expired");
    }
    if (normalized.includes("invalid api key") || normalized.includes("token invalid") || normalized.includes("revoked") || normalized.includes("access denied") || normalized.includes("unauthorized") || normalized.includes("forbidden")) {
        return makeDiagnosis("upstream_auth_error", "upstream", message, numericStatus ? String(numericStatus) : "auth_failed");
    }
    if (normalized.includes("rate limit") || normalized.includes("quota") || normalized.includes("too many requests")) {
        return makeDiagnosis("upstream_rate_limited", "upstream", message, numericStatus ? String(numericStatus) : "rate_limited");
    }
    if (normalized.includes("fetch failed") || normalized.includes("network") || normalized.includes("timeout") || normalized.includes("econn") || normalized.includes("enotfound") || normalized.includes("socket")) {
        return makeDiagnosis("network_error", "upstream", message, "network_error");
    }
    return makeDiagnosis("upstream_error", "upstream", message, numericStatus ? String(numericStatus) : "upstream_error");
}
function hasQoderToken(connection) {
    if (typeof connection?.apiKey === "string" && connection.apiKey.trim().length > 0) return true;
    const psd = connection?.providerSpecificData;
    if (psd && typeof psd === "object") {
        const pat = psd.personalAccessToken ?? psd.pat ?? psd.accessToken;
        if (typeof pat === "string" && pat.trim().length > 0) return true;
    }
    return false;
}
async function getProviderRuntimeStatus(connection) {
    const provider = typeof connection?.provider === "string" ? connection.provider : "";
    let toolId = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$cliRuntimeProviderMap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLI_RUNTIME_PROVIDER_MAP"][provider];
    // Issue #2247: detect Qoder in OAuth/CLI-flavored mode with a PAT pasted
    // BEFORE the CLI-runtime early-return below, otherwise the disambiguation
    // message never reaches the user (they keep seeing the generic "CLI not
    // installed" + 401 cascade). For Qoder, this short-circuits the runtime
    // check entirely with an actionable diagnosis.
    const isQoderOauthWithToken = provider === "qoder" && connection?.authType !== "apikey" && hasQoderToken(connection);
    if (isQoderOauthWithToken) {
        const message = "Qoder OAuth/Local CLI mode is selected but a Personal Access Token is stored on this connection. Switch this connection to API Key auth instead.";
        return {
            installed: false,
            runnable: false,
            reason: "qoder_oauth_with_token",
            diagnosis: makeDiagnosis("runtime_error", "local", message, "qoder_oauth_with_token"),
            error: message
        };
    }
    if (provider === "qoder" && connection?.authType !== "apikey") {
        toolId = null;
    }
    if (!toolId) return null;
    try {
        const runtime = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$services$2f$cliRuntime$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCliRuntimeStatus"])(toolId);
        if (runtime.installed && runtime.runnable) {
            return runtime;
        }
        const runtimeMessage = runtime.installed ? `Local CLI runtime is installed but not runnable (${runtime.reason || "healthcheck_failed"})` : "Local CLI runtime is not installed";
        return {
            ...runtime,
            diagnosis: makeDiagnosis("runtime_error", "local", runtimeMessage, runtime.reason || "runtime_error"),
            error: runtimeMessage
        };
    } catch (error) {
        const runtimeMessage = `Failed to check local CLI runtime: ${error?.message || "runtime_check_failed"}`;
        return {
            installed: false,
            runnable: false,
            reason: "runtime_check_failed",
            diagnosis: makeDiagnosis("runtime_error", "local", runtimeMessage, "runtime_check_failed"),
            error: runtimeMessage
        };
    }
}
/**
 * Refresh OAuth token using the shared open-sse getAccessToken.
 * This shares the in-flight promise cache with the SSE layer,
 * preventing race conditions where two code paths attempt to
 * refresh the same token concurrently.
 *
 * @returns {object} { accessToken, expiresIn, refreshToken } or null if failed
 */ async function refreshOAuthToken(connection) {
    const { provider, refreshToken } = connection;
    if (!refreshToken) return null;
    try {
        // Fix B: Pass connectionId + accessToken + expiresAt so getAccessToken enters
        // the per-connection mutex (Layer 1) instead of falling through to the
        // token-hash fallback (Layer 2). Without connectionId, parallel dashboard
        // batch-tests would each acquire a separate Layer-2 lock keyed by token hash
        // and concurrently POST the same refresh_token to Codex/OpenAI, triggering
        // refresh_token_reused on rotating providers.
        const credentials = {
            connectionId: connection.id,
            accessToken: connection.accessToken,
            refreshToken,
            expiresAt: connection.expiresAt,
            providerSpecificData: connection.providerSpecificData || {}
        };
        // Fix A: onPersist runs INSIDE the mutex inside getAccessToken so the DB
        // write happens before the lock releases. This prevents a concurrent caller
        // from reading the stale refresh_token between the network call and the DB
        // update.
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccessToken"])(provider, credentials, console, null, async (refreshed)=>{
            if (!refreshed?.accessToken) return;
            const update = {
                accessToken: refreshed.accessToken
            };
            if (refreshed.refreshToken) update.refreshToken = refreshed.refreshToken;
            if (refreshed.expiresAt) {
                update.expiresAt = refreshed.expiresAt;
                update.tokenExpiresAt = refreshed.expiresAt;
            } else if (refreshed.expiresIn) {
                const expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
                update.expiresAt = expiresAt;
                update.tokenExpiresAt = expiresAt;
            }
            if (refreshed.providerSpecificData) {
                update.providerSpecificData = {
                    ...connection.providerSpecificData || {},
                    ...refreshed.providerSpecificData
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, update);
        });
        return result; // { accessToken, expiresIn, refreshToken } or null
    } catch (err) {
        console.log(`Error refreshing ${provider} token:`, err.message);
        return null;
    }
}
/**
 * Check if token is expired or about to expire (within 5 minutes)
 */ function isTokenExpired(connection) {
    const expiresAtValue = connection.expiresAt || connection.tokenExpiresAt;
    if (!expiresAtValue) return false;
    const expiresAt = new Date(expiresAtValue).getTime();
    const buffer = 5 * 60 * 1000; // 5 minutes
    return expiresAt <= Date.now() + buffer;
}
/**
 * Sync to cloud if enabled
 */ async function syncToCloudIfEnabled() {
    try {
        const cloudEnabled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloudEnabled"])();
        if (!cloudEnabled) return;
        const machineId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$machineId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConsistentMachineId"])();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syncToCloud"])(machineId);
    } catch (error) {
        console.log("Error syncing to cloud after token refresh:", error);
    }
}
async function testOAuthConnection(connection, timeoutMs = OAUTH_TEST_TIMEOUT_MS) {
    const config = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$providers$2f5b$id$5d2f$test$2f$oauthTestConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OAUTH_TEST_CONFIG"][connection.provider];
    if (!config) {
        const error = "Provider test not supported";
        return {
            valid: false,
            error,
            refreshed: false,
            diagnosis: classifyFailure({
                error,
                unsupported: true
            })
        };
    }
    // Check if token exists
    if (!connection.accessToken) {
        // If the refresh token is also missing on a refreshable provider,
        // this means re-authentication is needed (e.g. after refresh_token_reused)
        if (config.refreshable && !connection.refreshToken) {
            const error = "Refresh token expired. Please re-authenticate this account.";
            return {
                valid: false,
                error,
                refreshed: false,
                diagnosis: makeDiagnosis("reauth_required", "oauth", error, "reauth_required")
            };
        }
        const error = "No access token";
        return {
            valid: false,
            error,
            refreshed: false,
            diagnosis: makeDiagnosis("auth_missing", "local", error, "missing_access_token")
        };
    }
    let accessToken = connection.accessToken;
    let refreshed = false;
    let newTokens = null;
    // Auto-refresh if token is expired and provider supports refresh.
    // Front 2: NEVER burn a rotating provider's single-use refresh_token from a
    // connection test. Under a shared Auth0 client (Codex/OpenAI) a test-time
    // refresh can cascade-invalidate sibling accounts' refresh_token families
    // (openai/codex#9648). Leave rotation to the reactive, mutex-guarded 401 path.
    const tokenExpired = isTokenExpired(connection);
    const isRotatingProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rotationGroupFor"])(connection.provider) !== null;
    if (config.refreshable && tokenExpired && connection.refreshToken && !isRotatingProvider) {
        const tokens = await refreshOAuthToken(connection);
        if (tokens) {
            accessToken = tokens.accessToken;
            refreshed = true;
            newTokens = tokens;
        } else {
            // Refresh failed
            const error = "Token expired and refresh failed";
            return {
                valid: false,
                error,
                refreshed: false,
                diagnosis: classifyFailure({
                    error,
                    refreshFailed: true
                })
            };
        }
    }
    // For providers that only check expiry (no test endpoint available)
    if (config.checkExpiry) {
        // If we already refreshed successfully, token is valid
        if (refreshed) {
            return {
                valid: true,
                error: null,
                refreshed,
                newTokens,
                diagnosis: makeDiagnosis("ok", "oauth", null, null)
            };
        }
        // Check if token is expired (no refresh available)
        if (tokenExpired) {
            // Front 2: for rotating providers we intentionally did NOT refresh above.
            // An expired access_token here is recoverable on next real use via the
            // reactive 401 path, so don't report the account as broken (which would
            // tempt the operator to re-test and never resolve). Keep it active.
            if (isRotatingProvider && connection.refreshToken) {
                return {
                    valid: true,
                    error: null,
                    refreshed: false,
                    newTokens: null,
                    diagnosis: makeDiagnosis("ok", "oauth", null, null)
                };
            }
            const error = "Token expired";
            return {
                valid: false,
                error,
                refreshed: false,
                diagnosis: classifyFailure({
                    error
                })
            };
        }
        return {
            valid: true,
            error: null,
            refreshed: false,
            newTokens: null,
            diagnosis: makeDiagnosis("ok", "local", null, null)
        };
    }
    // Call test endpoint
    try {
        const headers = {
            [config.authHeader]: `${config.authPrefix}${accessToken}`,
            ...config.extraHeaders
        };
        const url = typeof config.getUrl === "function" ? config.getUrl(connection) : config.url;
        const fetchInit = {
            method: config.method,
            headers,
            signal: AbortSignal.timeout(timeoutMs)
        };
        // Port of decolua/9router#347: providers like Codex must send a body so the
        // upstream returns 400 (auth ok) instead of 405/415.
        if (config.body) fetchInit.body = config.body;
        const res = await fetch(url, fetchInit);
        // Port of decolua/9router#347: some providers (Codex) intentionally trigger a
        // 400 because the probe body is invalid. A 400 from such a provider means auth
        // succeeded; only 401/403 means the token is bad.
        const accepted = res.ok || Array.isArray(config.acceptStatuses) && config.acceptStatuses.includes(res.status);
        if (accepted) {
            return {
                valid: true,
                error: null,
                refreshed,
                newTokens,
                diagnosis: makeDiagnosis("ok", "upstream", null, null)
            };
        }
        if (connection.provider === "gitlab-duo") {
            const gitlabText = await res.text();
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$gitlab$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isGitLabDirectAccessDisabled"])(res.status, gitlabText)) {
                return {
                    valid: true,
                    error: null,
                    refreshed,
                    newTokens,
                    diagnosis: makeDiagnosis("ok", "upstream", null, null)
                };
            }
        }
        // If 401/403 and we haven't tried refresh yet, only attempt refresh
        // if the token is actually expired. This prevents corrupting valid tokens
        // when the upstream returns transient 401/403 errors (rate-limiting, etc.).
        if ((res.status === 401 || res.status === 403) && !refreshed && isTokenExpired(connection) && connection.refreshToken && typeof connection.refreshToken === "string") {
            const tokens = await refreshOAuthToken(connection);
            if (tokens) {
                // Retry with new token
                const retryInit = {
                    method: config.method,
                    headers: {
                        [config.authHeader]: `${config.authPrefix}${tokens.accessToken}`,
                        ...config.extraHeaders
                    },
                    signal: AbortSignal.timeout(timeoutMs)
                };
                if (config.body) retryInit.body = config.body;
                const retryRes = await fetch(url, retryInit);
                const retryAccepted = retryRes.ok || Array.isArray(config.acceptStatuses) && config.acceptStatuses.includes(retryRes.status);
                if (retryAccepted) {
                    return {
                        valid: true,
                        error: null,
                        refreshed: true,
                        newTokens: tokens,
                        diagnosis: makeDiagnosis("ok", "upstream", null, null)
                    };
                }
                // #1444: a fresh token that still gets a 401 because the account itself was
                // deactivated must be labeled account_deactivated, not a generic auth error.
                const retryBody = await retryRes.text().catch(()=>"");
                const error = isAccountDeactivatedMessage(retryBody) ? "Account deactivated by the provider" : `API returned ${retryRes.status} after token refresh`;
                return {
                    valid: false,
                    error,
                    refreshed: true,
                    statusCode: retryRes.status,
                    diagnosis: classifyFailure({
                        error,
                        statusCode: retryRes.status
                    })
                };
            }
            const error = "Token expired and refresh failed";
            return {
                valid: false,
                error,
                refreshed: false,
                statusCode: 401,
                diagnosis: classifyFailure({
                    error,
                    statusCode: 401,
                    refreshFailed: true
                })
            };
        }
        // #1444: read a 401/403 body so a deactivated account is labeled distinctly from a
        // revoked token. (The body is unread here for non-gitlab providers; the guard keeps
        // it safe if it was already consumed.)
        const bodyText = res.status === 401 || res.status === 403 ? await res.text().catch(()=>"") : "";
        const error = isAccountDeactivatedMessage(bodyText) ? "Account deactivated by the provider" : res.status === 401 ? "Token invalid or revoked" : res.status === 403 ? "Access denied" : `API returned ${res.status}`;
        return {
            valid: false,
            error,
            refreshed,
            statusCode: res.status,
            diagnosis: classifyFailure({
                error,
                statusCode: res.status
            })
        };
    } catch (err) {
        // AbortSignal.timeout(...) surfaces as an AbortError/TimeoutError once the probe
        // exceeds its deadline (#1449). Report it with a clear, actionable message instead
        // of leaking the raw "The operation was aborted" text.
        const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
        const error = isTimeout ? `Test timed out after ${Math.round(timeoutMs / 1000)}s` : toSafeMessage(err?.message, "Connection test failed");
        return {
            valid: false,
            error,
            refreshed,
            diagnosis: classifyFailure({
                error
            })
        };
    }
}
/**
 * Test API key connection
 */ async function testApiKeyConnection(connection) {
    const requiresApiKey = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["providerAllowsOptionalApiKey"])(connection.provider);
    if (requiresApiKey && !connection.apiKey) {
        const error = "Missing API key";
        return {
            valid: false,
            error,
            diagnosis: makeDiagnosis("auth_missing", "local", error, "missing_api_key")
        };
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateProviderApiKey"])({
        provider: connection.provider,
        apiKey: connection.apiKey,
        providerSpecificData: connection.providerSpecificData
    });
    if (result.unsupported) {
        const error = "Provider test not supported";
        return {
            valid: false,
            error,
            diagnosis: classifyFailure({
                error,
                unsupported: true,
                provider: connection.provider
            })
        };
    }
    const error = result.valid ? null : result.error || "Invalid API key";
    const diagnosis = result.valid ? makeDiagnosis("ok", "upstream", null, null) : classifyFailure({
        error,
        statusCode: result.statusCode,
        provider: connection.provider
    });
    return {
        valid: !!result.valid,
        error,
        warning: result.warning || null,
        diagnosis,
        ...Array.isArray(result.deployments) ? {
            deployments: result.deployments
        } : {}
    };
}
async function testSingleConnection(connectionId, validationModelId) {
    const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connectionId);
    if (!connection) {
        return {
            valid: false,
            error: "Connection not found",
            diagnosis: null,
            latencyMs: 0
        };
    }
    const provider = typeof connection.provider === "string" ? connection.provider : "";
    if (!provider) {
        return {
            valid: false,
            error: "Connection provider is invalid",
            diagnosis: makeDiagnosis("validation_error", "local", "Connection provider is invalid", "provider_invalid"),
            latencyMs: 0
        };
    }
    // Resolve proxy for this connection (key → combo → provider → global → direct)
    let proxyInfo = null;
    try {
        proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionId);
    } catch (proxyErr) {
        console.log(`[ConnectionTest] Failed to resolve proxy for ${connectionId}:`, proxyErr?.message);
    }
    let result;
    const startTime = Date.now();
    const runtime = await getProviderRuntimeStatus(connection);
    if (runtime?.diagnosis) {
        result = {
            valid: false,
            error: runtime.error,
            refreshed: false,
            diagnosis: runtime.diagnosis
        };
    } else if (connection.authType === "apikey") {
        const enrichedConnection = validationModelId ? {
            ...connection,
            providerSpecificData: {
                ...connection.providerSpecificData || {},
                validationModelId
            }
        } : connection;
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, ()=>testApiKeyConnection(enrichedConnection));
    } else {
        result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, ()=>testOAuthConnection(connection));
    }
    const latencyMs = Date.now() - startTime;
    // Build update data
    const now = new Date().toISOString();
    const diagnosis = result.diagnosis || (result.valid ? makeDiagnosis("ok", "local", null, null) : classifyFailure({
        error: result.error,
        statusCode: result.statusCode,
        provider
    }));
    const updateData = {
        testStatus: result.valid ? "active" : "error",
        lastError: result.valid ? null : result.error,
        lastErrorAt: result.valid ? null : now,
        lastTested: now,
        lastErrorType: result.valid ? null : diagnosis.type,
        lastErrorSource: result.valid ? null : diagnosis.source,
        errorCode: result.valid ? null : diagnosis.code || result.statusCode || null,
        rateLimitedUntil: result.valid ? null : connection.rateLimitedUntil || null
    };
    if (result.valid) {
        updateData.backoffLevel = 0;
        const psd = connection?.providerSpecificData;
        updateData.providerSpecificData = {
            ...psd || {},
            apiKeyHealth: {}
        };
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["removeConnectionHealth"])(connectionId);
        } catch  {}
    }
    // If token was refreshed, update tokens in DB
    if (result.refreshed && result.newTokens) {
        updateData.accessToken = result.newTokens.accessToken;
        if (result.newTokens.refreshToken) {
            updateData.refreshToken = result.newTokens.refreshToken;
        }
        if (result.newTokens.expiresIn) {
            updateData.expiresAt = new Date(Date.now() + result.newTokens.expiresIn * 1000).toISOString();
        }
    }
    // Update status in db
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, updateData);
    // Sync to cloud if token was refreshed
    if (result.refreshed) {
        await syncToCloudIfEnabled();
    }
    // Log to Logger tab (call_logs table)
    try {
        const hideLogs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHealthCheck$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldHideLogs"])();
        if (!hideLogs) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/api/providers/test",
                status: result.valid ? 200 : result.statusCode || 401,
                model: "connection-test",
                provider,
                connectionId,
                duration: latencyMs,
                error: result.valid ? null : result.error || null,
                sourceFormat: "test",
                targetFormat: "test"
            }).catch(()=>{});
        }
    } catch  {}
    // Log to Proxy tab (proxy_logs table)
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$proxyLogger$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["logProxyEvent"])({
            status: result.valid ? "success" : "error",
            proxy: proxyInfo?.proxy || null,
            level: proxyInfo?.level || "provider-test",
            levelId: proxyInfo?.levelId || null,
            provider,
            targetUrl: `${provider}/connection-test`,
            latencyMs,
            error: result.valid ? null : result.error || null,
            connectionId,
            comboId: null,
            account: connectionId?.slice(0, 8) || null,
            tlsFingerprint: false
        });
    } catch  {}
    return {
        valid: result.valid,
        error: result.error,
        warning: result.warning || null,
        refreshed: result.refreshed || false,
        diagnosis,
        latencyMs,
        statusCode: result.statusCode || null,
        runtime: runtime || null,
        testedAt: now
    };
}
async function POST(request, { params }) {
    try {
        const { id } = await params;
        let rawBody = {};
        try {
            rawBody = await request.json();
        } catch  {
        // Empty or non-JSON body — treat as {}
        }
        const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateBody"])(providerConnectionTestBodySchema, rawBody);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isValidationFailure"])(validation)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: validation.error
            }, {
                status: 400
            });
        }
        const { validationModelId } = validation.data;
        const data = await testSingleConnection(id, validationModelId);
        if (data.error === "Connection not found") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Connection not found"
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.log("Error testing connection:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Test failed"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_0jtsjpm._.js.map