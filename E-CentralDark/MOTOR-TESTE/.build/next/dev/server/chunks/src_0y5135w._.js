module.exports = [
"[project]/src/types/databaseSettings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/domain/connectionModelRules.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-route] (ecmascript)");
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
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/domain/tagRouter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/domain/costRules.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/domainState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/spend/batchWriter.ts [app-route] (ecmascript)");
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
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCostTotal"])(apiKeyId, periodStartAt) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, periodStartAt);
    } catch  {
        return 0;
    }
}
function getBudgetWindowRangeTotal(apiKeyId, periodStartAt, periodEndAt) {
    try {
        return sumEntries(toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCostEntriesInRange"])(apiKeyId, periodStartAt, periodEndAt))) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, periodStartAt, periodEndAt);
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveBudgetResetLog"])({
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveBudget"])(apiKeyId, updated);
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
        const fromDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadBudget"])(apiKeyId);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discardSpendBatchEntries"])(apiKeyId);
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteBudget"])(apiKeyId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCostEntries"])(apiKeyId);
    } catch  {
    // Non-critical.
    }
}
function recordCost(apiKeyId, cost) {
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].increment(apiKeyId, cost, Date.now());
    } catch  {
    // Non-critical.
    }
}
function syncAllBudgetSchedules(now = Date.now()) {
    let processed = 0;
    let resetCount = 0;
    try {
        const allBudgets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadAllBudgets"])();
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveBudget"])(apiKeyId, updatedBudget);
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
        return sumEntries(toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, todayStart.getTime()))) + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].getPendingCostTotal(apiKeyId, todayStart.getTime());
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
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, todayStart.getTime())),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, todayStart.getTime())
        ];
        const monthlyEntries = [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, monthStart.getTime())),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, monthStart.getTime())
        ];
        const periodEntries = window !== null ? [
            ...toCostEntries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadCostEntries"])(apiKeyId, window.periodStartAt)),
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["spendBatchWriter"].getBufferedEntries(apiKeyId, window.periodStartAt)
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spend$2f$batchWriter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resetSpendBatchWriterForTests"])();
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$domainState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteAllCostData"])();
    } catch  {
    // Non-critical.
    }
}
}),
"[project]/src/domain/quotaCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DEFAULT_QUOTA_THRESHOLD_PERCENT",
    ()=>DEFAULT_QUOTA_THRESHOLD_PERCENT,
    "__clearForTests",
    ()=>__clearForTests,
    "getQuotaCache",
    ()=>getQuotaCache,
    "getQuotaCacheStats",
    ()=>getQuotaCacheStats,
    "getQuotaWindowStatus",
    ()=>getQuotaWindowStatus,
    "isAccountQuotaExhausted",
    ()=>isAccountQuotaExhausted,
    "isQuotaExhaustedForRequest",
    ()=>isQuotaExhaustedForRequest,
    "markAccountExhaustedFrom429",
    ()=>markAccountExhaustedFrom429,
    "quotaSnapshotChanged",
    ()=>quotaSnapshotChanged,
    "setQuotaCache",
    ()=>setQuotaCache,
    "startBackgroundRefresh",
    ()=>startBackgroundRefresh,
    "stopBackgroundRefresh",
    ()=>stopBackgroundRefresh
]);
/**
 * Quota Cache — Domain Layer
 *
 * In-memory cache of provider quota data per connectionId.
 * Populated by:
 *   - Dashboard usage endpoint (GET /api/usage/[connectionId])
 *   - 429 responses marking account as exhausted
 *
 * Background refresh runs every 1 minute:
 *   - Active accounts (quota > 0%): refetch every 5 minutes
 *   - Exhausted accounts: refetch every 5 minutes (or immediately after resetAt passes)
 *
 * @changes
 * - [2026-07-24] [Composer] - Scope Antigravity per-model exhaustion to exact model + family weekly windows
 *
 * @module domain/quotaCache
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/usage.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
// ─── Constants ──────────────────────────────────────────────────────────────
const ACTIVE_TTL_MS = 5 * 60 * 1000; // 5 minutes for active accounts
const EXHAUSTED_TTL_MS = 5 * 60 * 1000; // 5 minutes for 429-sourced entries (no resetAt)
const EXHAUSTED_REFRESH_MS = 5 * 60 * 1000; // 5 minutes: recheck exhausted accounts (aligned with TTL)
const REFRESH_INTERVAL_MS = 60 * 1000; // Background tick every 1 minute
const DEFAULT_QUOTA_THRESHOLD_PERCENT = 99;
function getState() {
    if (!globalThis.__omnirouteQuotaCacheState) {
        globalThis.__omnirouteQuotaCacheState = {
            cache: new Map(),
            refreshingSet: new Set(),
            refreshTimer: null,
            tickRunning: false
        };
    }
    return globalThis.__omnirouteQuotaCacheState;
}
const MAX_CONCURRENT_REFRESHES = 5;
// ─── Helpers ────────────────────────────────────────────────────────────────
function isExhausted(quotas) {
    const entries = Object.values(quotas);
    if (entries.length === 0) return false;
    return entries.every((q)=>q.remainingPercentage <= 0);
}
/**
 * T08 — Auto-advance quota window.
 * If we know the window duration, advance past the expired window(s) to
 * avoid blocking requests when the quota reset already happened but the
 * background refresh hasn't run yet.
 */ function advancedWindowResetAt(entry, now) {
    if (!entry.nextResetAt) return null;
    const resetMs = parseDate(entry.nextResetAt);
    if (resetMs === null) return null;
    // If the window's resetAt is in the past, the quota has been renewed.
    // Eagerly mark as available so requests don't wait for the 5-min TTL.
    if (resetMs <= now) {
        return {
            exhausted: false
        };
    }
    return null;
}
function parseDate(value) {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : ms;
}
function clampPercent(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
}
function normalizeWindowKey(value) {
    if (typeof value !== "string") return "";
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function resolveQuotaWindow(quotas, windowName) {
    const direct = quotas[windowName];
    if (direct) return direct;
    const normalizedTarget = normalizeWindowKey(windowName);
    if (!normalizedTarget) return null;
    const prefixMatches = [];
    for (const [key, quota] of Object.entries(quotas)){
        const normalizedKey = normalizeWindowKey(key);
        if (!normalizedKey) continue;
        if (normalizedKey === normalizedTarget) return quota;
        // Support canonical selection of generic windows from labeled windows,
        // e.g. "weekly" from "weekly (7d)" or "session" from "session (5h)".
        if (normalizedKey.startsWith(`${normalizedTarget} `)) {
            prefixMatches.push({
                key,
                quota
            });
        }
    }
    // Deterministic fallback: choose the lexicographically first matching key.
    if (prefixMatches.length > 0) {
        prefixMatches.sort((a, b)=>a.key.localeCompare(b.key));
        return prefixMatches[0].quota;
    }
    return null;
}
function earliestResetAt(quotas) {
    let earliest = null;
    let earliestMs = Infinity;
    for (const q of Object.values(quotas)){
        if (!q.resetAt) continue;
        const ms = parseDate(q.resetAt);
        if (ms !== null && ms < earliestMs) {
            earliestMs = ms;
            earliest = q.resetAt;
        }
    }
    return earliest;
}
function quotaSnapshotChanged(prior, windowKey, remainingPercentage, exhausted) {
    if (!prior) return true;
    const priorWindow = prior.quotas?.[windowKey];
    if (!priorWindow) return true;
    return priorWindow.remainingPercentage !== remainingPercentage || (prior.exhausted ?? false) !== exhausted;
}
function normalizeQuotas(rawQuotas) {
    const result = {};
    for (const [key, q] of Object.entries(rawQuotas)){
        if (q && typeof q === "object") {
            result[key] = {
                remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safePercentage"])(q.remainingPercentage) ?? (q.total > 0 ? Math.round((q.total - (q.used || 0)) / q.total * 100) : 0),
                resetAt: q.resetAt || null
            };
        }
    }
    return result;
}
function __clearForTests() {
    getState().cache.clear();
}
function resolveAntigravityQuotaWindowsForModel(quotaNames, requestedModel) {
    const requestedFamily = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(requestedModel);
    const cleanRequestedModel = requestedModel.replace(/^(antigravity|agy)\//, "");
    const bareModel = cleanRequestedModel.includes("/") ? cleanRequestedModel.slice(cleanRequestedModel.lastIndexOf("/") + 1) : cleanRequestedModel;
    if (requestedFamily === "other") {
        return quotaNames.filter((windowName)=>{
            const bare = windowName.replace(/^(antigravity|agy)\//, "");
            return bare === bareModel || bare === cleanRequestedModel;
        });
    }
    const familyAggregates = requestedFamily === "gemini" ? [
        "gemini_weekly"
    ] : requestedFamily === "claude" ? [
        "claude_gpt_weekly"
    ] : [];
    const exactWindows = quotaNames.filter((windowName)=>{
        const bare = windowName.replace(/^(antigravity|agy)\//, "");
        return bare === bareModel;
    });
    const aggregateWindows = familyAggregates.filter((key)=>quotaNames.includes(key));
    const scoped = [
        ...exactWindows,
        ...aggregateWindows
    ];
    if (scoped.length > 0) return scoped;
    return quotaNames.filter((windowName)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(windowName) === requestedFamily);
}
function isAntigravityQuotaExhausted(connectionId, entry, requestedModel) {
    if (!requestedModel) return entry.exhausted;
    const quotaNames = Object.keys(entry.quotas || {});
    if (quotaNames.length === 0) return entry.exhausted;
    const matchingWindows = resolveAntigravityQuotaWindowsForModel(quotaNames, requestedModel);
    return matchingWindows.length > 0 && matchingWindows.every((windowName)=>getQuotaWindowStatus(connectionId, windowName, DEFAULT_QUOTA_THRESHOLD_PERCENT)?.reachedThreshold);
}
function isCodexQuotaExhausted(connectionId, entry, requestedModel) {
    if (!requestedModel) return entry.exhausted;
    const quotaNames = Object.keys(entry.quotas || {});
    if (quotaNames.length === 0) return entry.exhausted;
    const filterWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexQuotaWindowFilterForModel"])(requestedModel);
    const scopedWindowNames = quotaNames.filter((windowName)=>filterWindow?.(windowName));
    return scopedWindowNames.length > 0 && scopedWindowNames.every((windowName)=>getQuotaWindowStatus(connectionId, windowName, DEFAULT_QUOTA_THRESHOLD_PERCENT)?.reachedThreshold);
}
function isStandardQuotaExhausted(entry, now) {
    if (!entry.exhausted) return false;
    const age = now - entry.fetchedAt;
    if (!entry.nextResetAt && age > EXHAUSTED_TTL_MS) return false;
    return true;
}
function isQuotaExhaustedForRequest(connectionId, provider, requestedModel = null) {
    const entry = getState().cache.get(connectionId) || hydrateQuotaCacheFromSnapshots(connectionId);
    if (!entry) return false;
    const now = Date.now();
    const advanced = advancedWindowResetAt(entry, now);
    if (advanced) {
        entry.exhausted = false;
        return false;
    }
    if (provider === "antigravity" || provider === "agy") {
        return isAntigravityQuotaExhausted(connectionId, entry, requestedModel);
    }
    if (provider === "codex") {
        return isCodexQuotaExhausted(connectionId, entry, requestedModel);
    }
    // Standard (non-per-model-quota) providers: check connection-wide aggregate
    return isStandardQuotaExhausted(entry, now);
}
function setQuotaCache(connectionId, provider, rawQuotas) {
    const quotas = normalizeQuotas(rawQuotas);
    const exhausted = isExhausted(quotas);
    // #4438 — capture the prior entry BEFORE overwriting the cache so we can skip
    // redundant snapshot writes for idle connections whose quota didn't change.
    const prior = getState().cache.get(connectionId);
    const entry = {
        connectionId,
        provider,
        quotas,
        fetchedAt: Date.now(),
        exhausted,
        nextResetAt: exhausted ? earliestResetAt(quotas) : null
    };
    getState().cache.set(connectionId, entry);
    if (entry && rawQuotas) {
        for (const [windowKey, quotaInfo] of Object.entries(rawQuotas)){
            if (!quotaInfo || typeof quotaInfo !== "object") continue;
            const remainingPercentage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safePercentage"])(quotaInfo.remainingPercentage) ?? (quotaInfo.total > 0 ? Math.round((quotaInfo.total - (quotaInfo.used || 0)) / quotaInfo.total * 100) : 0);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordProviderQuotaResetEventIfChanged"])({
                provider,
                connectionId,
                windowKey,
                currentResetAt: quotaInfo.resetAt ?? null,
                currentRemainingPercentage: remainingPercentage,
                previousObservation: prior?.quotas?.[windowKey] ? {
                    resetAt: prior.quotas[windowKey].resetAt,
                    remainingPercentage: prior.quotas[windowKey].remainingPercentage
                } : null
            });
            // #5923 (Finding #5) — is_exhausted must reflect THIS window's own remaining
            // percentage, not the connection-wide AND-across-all-windows aggregate
            // (`entry.exhausted`). A connection with one 0% window and other non-zero
            // windows previously never flagged that window's row as exhausted.
            const windowExhausted = remainingPercentage <= 0;
            // #4438 — only persist on the first observation or a real change.
            if (!quotaSnapshotChanged(prior, windowKey, remainingPercentage, windowExhausted)) continue;
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveQuotaSnapshot"])({
                    provider,
                    connection_id: connectionId,
                    window_key: windowKey,
                    remaining_percentage: remainingPercentage,
                    is_exhausted: windowExhausted ? 1 : 0,
                    next_reset_at: quotaInfo.resetAt ?? null,
                    window_duration_ms: entry.windowDurationMs ?? null,
                    raw_data: null
                });
            } catch (error) {
                console.error("[quotaCache] Failed to save snapshot:", error);
            }
        }
    }
}
function getQuotaCache(connectionId) {
    return getState().cache.get(connectionId) || null;
}
function hydrateQuotaCacheFromSnapshots(connectionId) {
    const { cache } = getState();
    if (cache.has(connectionId)) return cache.get(connectionId) || null;
    let snapshots;
    try {
        snapshots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLatestQuotaSnapshotsForConnection"])(connectionId);
    } catch  {
        return null;
    }
    if (!snapshots.length) return null;
    const quotas = {};
    let provider = "";
    let fetchedAt = 0;
    let windowDurationMs = null;
    for (const snapshot of snapshots){
        const camelSnapshot = snapshot;
        const windowKey = camelSnapshot.windowKey ?? snapshot.window_key;
        if (!windowKey) continue;
        provider = provider || snapshot.provider || "";
        quotas[windowKey] = {
            remainingPercentage: clampPercent(Number(camelSnapshot.remainingPercentage ?? snapshot.remaining_percentage ?? 0)),
            resetAt: camelSnapshot.nextResetAt ?? snapshot.next_reset_at ?? null
        };
        const snapshotWindowDurationMs = camelSnapshot.windowDurationMs ?? snapshot.window_duration_ms ?? null;
        if (snapshotWindowDurationMs && snapshotWindowDurationMs > 0) {
            windowDurationMs = snapshotWindowDurationMs;
        }
        const createdAtVal = camelSnapshot.createdAt ?? snapshot.created_at;
        const createdAtMs = createdAtVal ? parseDate(createdAtVal) : null;
        if (createdAtMs !== null) fetchedAt = Math.max(fetchedAt, createdAtMs);
    }
    if (Object.keys(quotas).length === 0) return null;
    const exhausted = isExhausted(quotas);
    const entry = {
        connectionId,
        provider,
        quotas,
        fetchedAt: fetchedAt || Date.now(),
        exhausted,
        nextResetAt: exhausted ? earliestResetAt(quotas) : null,
        windowDurationMs
    };
    cache.set(connectionId, entry);
    return entry;
}
function isAccountQuotaExhausted(connectionId) {
    const entry = getState().cache.get(connectionId) || hydrateQuotaCacheFromSnapshots(connectionId);
    if (!entry) return false;
    if (!entry.exhausted) return false;
    const now = Date.now();
    // T08 — Auto window advance: if resetAt is in the past, eagerly treat as not exhausted.
    // This prevents stale exhaustion blocking when background refresh hasn't run yet.
    const advanced = advancedWindowResetAt(entry, now);
    if (advanced) {
        // Optimistically clear the exhausted flag so we unblock requests immediately.
        // The next background refresh will update with the real quota state.
        entry.exhausted = false;
        return false;
    }
    // Exhausted entries without resetAt expire after fixed TTL
    const age = now - entry.fetchedAt;
    if (!entry.nextResetAt && age > EXHAUSTED_TTL_MS) return false;
    return true;
}
function getQuotaWindowStatus(connectionId, windowName, thresholdPercent = DEFAULT_QUOTA_THRESHOLD_PERCENT) {
    const entry = getState().cache.get(connectionId) || hydrateQuotaCacheFromSnapshots(connectionId);
    if (!entry) return null;
    const now = Date.now();
    const window = resolveQuotaWindow(entry.quotas, windowName);
    if (!window) return null;
    const remainingPercentage = clampPercent(window.remainingPercentage);
    const usedPercentage = clampPercent(100 - remainingPercentage);
    let resetAt = window.resetAt || null;
    let windowExpired = false;
    if (resetAt) {
        const resetMs = parseDate(resetAt);
        if (resetMs !== null && resetMs <= now) {
            resetAt = null;
            windowExpired = true;
        }
    }
    return {
        remainingPercentage,
        usedPercentage,
        resetAt,
        // If reset time has already passed, avoid stale cached percentages blocking selection.
        reachedThreshold: windowExpired ? false : remainingPercentage <= 0 ? true : usedPercentage >= thresholdPercent
    };
}
function markAccountExhaustedFrom429(connectionId, provider) {
    getState().cache.set(connectionId, {
        connectionId,
        provider,
        quotas: {},
        fetchedAt: Date.now(),
        exhausted: true,
        nextResetAt: null
    });
}
// ─── Background Refresh ─────────────────────────────────────────────────────
async function refreshEntry(entry) {
    const { cache, refreshingSet } = getState();
    if (refreshingSet.has(entry.connectionId)) return;
    refreshingSet.add(entry.connectionId);
    try {
        const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(entry.connectionId);
        if (!connection || connection.authType !== "oauth" || !connection.isActive) {
            cache.delete(entry.connectionId);
            return;
        }
        const proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(entry.connectionId);
        const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageForProvider"])(connection));
        if (usage?.quotas) {
            setQuotaCache(entry.connectionId, entry.provider, usage.quotas);
        }
    } catch (err) {
        console.warn(`[QuotaCache] Refresh failed for ${entry.connectionId.slice(0, 8)}:`, err?.message || err);
    } finally{
        refreshingSet.delete(entry.connectionId);
    }
}
function needsRefresh(entry, now) {
    const age = now - entry.fetchedAt;
    if (entry.exhausted) {
        if (entry.nextResetAt) {
            const resetMs = parseDate(entry.nextResetAt);
            if (resetMs !== null && resetMs <= now) return true;
        }
        return age >= EXHAUSTED_REFRESH_MS;
    }
    return age >= ACTIVE_TTL_MS;
}
async function backgroundRefreshTick() {
    const state = getState();
    if (state.tickRunning) return;
    state.tickRunning = true;
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanupOldSnapshots"])();
        const now = Date.now();
        const pending = [
            ...state.cache.values()
        ].filter((e)=>needsRefresh(e, now));
        // Refresh in batches to avoid thundering herd
        for(let i = 0; i < pending.length; i += MAX_CONCURRENT_REFRESHES){
            const batch = pending.slice(i, i + MAX_CONCURRENT_REFRESHES);
            await Promise.allSettled(batch.map(refreshEntry));
        }
    } finally{
        state.tickRunning = false;
    }
}
function startBackgroundRefresh() {
    const state = getState();
    if (state.refreshTimer) return;
    state.refreshTimer = setInterval(backgroundRefreshTick, REFRESH_INTERVAL_MS);
    state.refreshTimer?.unref?.();
}
function stopBackgroundRefresh() {
    const state = getState();
    if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
        state.refreshTimer = null;
    }
}
function getQuotaCacheStats() {
    const entries = [];
    const { cache } = getState();
    for (const entry of cache.values()){
        entries.push({
            connectionId: entry.connectionId.slice(0, 8) + "...",
            provider: entry.provider,
            exhausted: entry.exhausted,
            nextResetAt: entry.nextResetAt,
            ageMs: Date.now() - entry.fetchedAt
        });
    }
    return {
        total: cache.size,
        entries
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/mitm/inspector/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/server/authz/headers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Header constants used by the authz pipeline.
 *
 * Middleware adds these headers to the upstream request after a successful
 * auth decision. Route handlers and downstream services read them through
 * the assertAuth() helper instead of re-running auth logic.
 *
 * All header names are lowercase to match Next.js / fetch semantics.
 *
 * IMPORTANT: these headers are stripped from incoming client requests
 * before classification (see pipeline.ts) so a remote caller cannot
 * pre-populate them and impersonate a privileged subject.
 */ __turbopack_context__.s([
    "AUTHZ_HEADER_AUTH_ID",
    ()=>AUTHZ_HEADER_AUTH_ID,
    "AUTHZ_HEADER_AUTH_KIND",
    ()=>AUTHZ_HEADER_AUTH_KIND,
    "AUTHZ_HEADER_AUTH_LABEL",
    ()=>AUTHZ_HEADER_AUTH_LABEL,
    "AUTHZ_HEADER_AUTH_SCOPES",
    ()=>AUTHZ_HEADER_AUTH_SCOPES,
    "AUTHZ_HEADER_PEER_LOCALITY",
    ()=>AUTHZ_HEADER_PEER_LOCALITY,
    "AUTHZ_HEADER_REQUEST_ID",
    ()=>AUTHZ_HEADER_REQUEST_ID,
    "AUTHZ_HEADER_ROUTE_CLASS",
    ()=>AUTHZ_HEADER_ROUTE_CLASS,
    "AUTHZ_TRUSTED_HEADERS",
    ()=>AUTHZ_TRUSTED_HEADERS,
    "CLI_TOKEN_HEADER",
    ()=>CLI_TOKEN_HEADER,
    "PEER_IP_HEADER",
    ()=>PEER_IP_HEADER,
    "VIA_PROXY_HEADER",
    ()=>VIA_PROXY_HEADER
]);
const AUTHZ_HEADER_REQUEST_ID = "x-request-id";
const AUTHZ_HEADER_ROUTE_CLASS = "x-omniroute-route-class";
const AUTHZ_HEADER_AUTH_KIND = "x-omniroute-auth-kind";
const AUTHZ_HEADER_AUTH_ID = "x-omniroute-auth-id";
const AUTHZ_HEADER_AUTH_LABEL = "x-omniroute-auth-label";
const AUTHZ_HEADER_AUTH_SCOPES = "x-omniroute-auth-scopes";
const CLI_TOKEN_HEADER = "[REDIGIDO-PRESERVACAO]";
const PEER_IP_HEADER = "x-omniroute-peer-ip";
const VIA_PROXY_HEADER = "x-omniroute-via-proxy";
const AUTHZ_HEADER_PEER_LOCALITY = "x-omniroute-peer-locality";
const AUTHZ_TRUSTED_HEADERS = [
    AUTHZ_HEADER_ROUTE_CLASS,
    AUTHZ_HEADER_AUTH_KIND,
    AUTHZ_HEADER_AUTH_ID,
    AUTHZ_HEADER_AUTH_LABEL,
    AUTHZ_HEADER_AUTH_SCOPES,
    AUTHZ_HEADER_PEER_LOCALITY
];
}),
"[project]/src/server/authz/accessScopes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_MUTATION_PREFIXES",
    ()=>ADMIN_MUTATION_PREFIXES,
    "ADMIN_SCOPE_PREFIXES",
    ()=>ADMIN_SCOPE_PREFIXES,
    "inferRequiredScope",
    ()=>inferRequiredScope
]);
const ADMIN_SCOPE_PREFIXES = [
    "/api/cli/tokens",
    "/api/oauth",
    "/api/auth",
    "/api/policy",
    "/api/services",
    "/api/mcp"
];
const ADMIN_MUTATION_PREFIXES = [
    "/api/providers",
    "/api/cli-tools/apply"
];
const READ_METHODS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);
function matchesPrefix(path, prefixes) {
    // Exact match or a true path-segment boundary (`pre/...`). A bare
    // `startsWith(pre)` would over-match lookalikes (e.g. "/api/auth" vs
    // "/api/authz-inventory"), so it is intentionally NOT used.
    return prefixes.some((pre)=>path === pre || path.startsWith(pre + "/"));
}
function inferRequiredScope(method, path) {
    const m = (method || "GET").toUpperCase();
    const p = path || "/";
    if (matchesPrefix(p, ADMIN_SCOPE_PREFIXES)) return "admin";
    const isMutation = !READ_METHODS.has(m);
    if (isMutation && matchesPrefix(p, ADMIN_MUTATION_PREFIXES)) return "admin";
    return isMutation ? "write" : "read";
}
}),
"[project]/src/server/authz/accessTokenAuth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACCESS_TOKEN_PREFIX",
    ()=>ACCESS_TOKEN_PREFIX,
    "evaluateAccessTokenAuth",
    ()=>evaluateAccessTokenAuth,
    "extractBearer",
    ()=>extractBearer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$accessTokens$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/accessTokens.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$accessTokens$2f$scopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/accessTokens/scopes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/authz/accessScopes.ts [app-route] (ecmascript)");
;
;
;
const ACCESS_TOKEN_PREFIX = "oma_";
function extractBearer(request) {
    const header = request.headers.get("authorization") || "";
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match ? match[1].trim() : null;
}
function safePathname(url) {
    try {
        return new URL(url).pathname;
    } catch  {
        return "/";
    }
}
function evaluateAccessTokenAuth(request) {
    const bearer = extractBearer(request);
    if (!bearer || !bearer.startsWith(ACCESS_TOKEN_PREFIX)) {
        return {
            kind: "absent"
        };
    }
    let verified;
    try {
        verified = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$accessTokens$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyAccessToken"])(bearer);
    } catch  {
        return {
            kind: "error"
        };
    }
    if (!verified) return {
        kind: "invalid"
    };
    const need = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$authz$2f$accessScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inferRequiredScope"])(request.method, safePathname(request.url));
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$accessTokens$2f$scopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scopeSatisfies"])(verified.scope, need)) {
        return {
            kind: "insufficient",
            have: verified.scope,
            need
        };
    }
    return {
        kind: "ok",
        scope: verified.scope,
        id: verified.id,
        name: verified.name
    };
}
}),
"[project]/src/models/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
// Database Models - Export all from localDb
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/usage/analytics/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/api/requireManagementAuth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/usageAnalytics.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2f$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/usageAnalytics/sources.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$callLogStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/callLogStats.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerDisplayNames$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/providerDisplayNames.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerDisplayNames$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerDisplayNames$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
function getRangeStartIso(range) {
    const end = new Date();
    const start = new Date(end);
    switch(range){
        case "1d":
            start.setDate(start.getDate() - 1);
            break;
        case "7d":
            start.setDate(start.getDate() - 7);
            break;
        case "30d":
            start.setDate(start.getDate() - 30);
            break;
        case "90d":
            start.setDate(start.getDate() - 90);
            break;
        case "180d":
            start.setDate(start.getDate() - 180);
            break;
        case "365d":
            start.setDate(start.getDate() - 365);
            break;
        case "ytd":
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            break;
        case "all":
        default:
            return null;
    }
    return start.toISOString();
}
const WEEKDAY_LABELS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];
function toStringValue(value, fallback = "") {
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}
function roundCost(value) {
    return Math.round(value * 1_000_000) / 1_000_000;
}
function normalizeServiceTier(value) {
    const tier = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (tier === "priority" || tier === "fast") return "priority";
    if (tier === "flex") return "flex";
    return "standard";
}
function getServiceTierLabelId(serviceTier) {
    return normalizeServiceTier(serviceTier);
}
function appendWhereCondition(whereClause, condition) {
    return whereClause ? `${whereClause} AND (${condition})` : `WHERE (${condition})`;
}
function findKeyInsensitive(obj, key) {
    if (!obj || !key) return undefined;
    return obj[key.toLowerCase()];
}
function uniqueValues(values) {
    const seen = new Set();
    const result = [];
    for (const value of values){
        const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        result.push(normalized);
    }
    return result;
}
function makeApiKeyUsageGroup(apiKeyId, fallbackName) {
    return apiKeyId ? `id:${apiKeyId}` : `name:${fallbackName}`;
}
function addApiKeyAlias(target, value) {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed) target.add(trimmed);
}
function stripCodexEffortSuffix(model) {
    return model.replace(/-(?:xhigh|high|medium|low|none)$/i, "");
}
function getPricingModelCandidates(model, normalizeModelName) {
    const normalizedModel = normalizeModelName(model);
    const lowerModel = model.toLowerCase();
    const lowerNormalized = normalizedModel.toLowerCase();
    const hyphenModel = lowerModel.replace(/\./g, "-");
    const hyphenNormalized = lowerNormalized.replace(/\./g, "-");
    const effortBaseModel = stripCodexEffortSuffix(lowerNormalized);
    return uniqueValues([
        lowerModel,
        lowerNormalized,
        hyphenModel,
        hyphenNormalized,
        effortBaseModel,
        effortBaseModel.replace(/\./g, "-"),
        lowerNormalized === "codex-auto-review" ? "gpt-5.5" : null
    ]);
}
function resolveModelPricing(pricingByProvider, providerAliasMap, providerRaw, model, normalizeModelName) {
    const pLower = (providerRaw || "").toLowerCase();
    let providerPricing = findKeyInsensitive(pricingByProvider, pLower);
    if (!providerPricing) {
        // providerAliasMap maps ID -> ALIAS. So if pLower is "codex", alias is "cx".
        const alias = providerAliasMap[pLower];
        if (alias) {
            providerPricing = findKeyInsensitive(pricingByProvider, alias);
        }
    }
    if (!providerPricing) {
        // In case pLower was ALIAS and we want to try the ID (reverse search values)
        for (const [id, alias] of Object.entries(providerAliasMap)){
            if (alias.toLowerCase() === pLower) {
                providerPricing = findKeyInsensitive(pricingByProvider, id);
                if (providerPricing) break;
            }
        }
    }
    if (!providerPricing) {
        const np = pLower.replace(/-cn$/, "");
        if (np && np !== pLower) {
            providerPricing = findKeyInsensitive(pricingByProvider, np);
        }
    }
    // Hardcoded known fallbacks
    if (!providerPricing) {
        if (pLower === "antigravity") providerPricing = findKeyInsensitive(pricingByProvider, "ag");
    }
    const modelCandidates = getPricingModelCandidates(model, normalizeModelName);
    const tryFind = (prov)=>{
        if (!prov || typeof prov !== "object") return null;
        for (const candidate of modelCandidates){
            const pricing = findKeyInsensitive(prov, candidate);
            if (pricing) return pricing;
        }
        return null;
    };
    let pricing = providerPricing ? tryFind(providerPricing) : null;
    if (!pricing) {
        // Global fallback: search all providers for this exact model (helps with aliases)
        for (const prov of Object.values(pricingByProvider)){
            const found = tryFind(prov);
            if (found) {
                pricing = found;
                break;
            }
        }
    }
    // Last resort fallback for historical usage (e.g. "gpt-4" missing, matches "gpt-4.1" or first available)
    if (!pricing && providerPricing && typeof providerPricing === "object") {
        for (const [key, val] of Object.entries(providerPricing)){
            const lm = model.toLowerCase();
            if (key.includes(lm) || lm.includes(key)) {
                pricing = val;
                break;
            }
        }
        if (!pricing) {
            const keys = Object.keys(providerPricing);
            if (keys.length > 0) pricing = providerPricing[keys[0]];
        }
    }
    return pricing;
}
function computeUsageRowCost(row, pricingByProvider, providerAliasMap, normalizeModelName, computeCostFromPricing) {
    const provider = toStringValue(row.provider);
    const model = toStringValue(row.model);
    if (!provider || !model) return 0;
    const serviceTier = normalizeServiceTier(row.serviceTier ?? row.service_tier);
    const pricing = resolveModelPricing(pricingByProvider, providerAliasMap, provider, model, normalizeModelName);
    if (!pricing) return 0;
    return computeCostFromPricing(pricing, {
        input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.promptTokens),
        output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.completionTokens),
        cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.cacheReadTokens),
        cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.cacheCreationTokens),
        reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.reasoningTokens)
    }, {
        provider,
        model,
        serviceTier,
        flatRateAsZero: true
    });
}
function computeUsageRowStandardCost(row, pricingByProvider, providerAliasMap, normalizeModelName, computeCostFromPricing) {
    return computeUsageRowCost({
        ...row,
        serviceTier: "standard",
        service_tier: "standard"
    }, pricingByProvider, providerAliasMap, normalizeModelName, computeCostFromPricing);
}
function computeUsageSavingsTokens(row, serviceTier, getCodexFastCostMultiplier) {
    const provider = toStringValue(row.provider);
    const model = toStringValue(row.model);
    const totalTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(row.totalTokens);
    if (!provider || !model || totalTokens <= 0) return 0;
    const standardMultiplier = getCodexFastCostMultiplier(provider, model, "standard");
    if (standardMultiplier <= 0) return 0;
    const actualMultiplier = getCodexFastCostMultiplier(provider, model, serviceTier);
    const savingsRatio = Math.max(0, (standardMultiplier - actualMultiplier) / standardMultiplier);
    return totalTokens * savingsRatio;
}
function formatUtcDate(date) {
    return date.toISOString().slice(0, 10);
}
function computeActivityStreak(activityMap) {
    const cursor = new Date();
    let streak = 0;
    while((activityMap[formatUtcDate(cursor)] || 0) > 0){
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
}
async function GET(request) {
    const authError = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$requireManagementAuth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["requireManagementAuth"])(request);
    if (authError) return authError;
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "30d";
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;
        const apiKeyIdsParam = searchParams.get("apiKeyIds") || "";
        const apiKeyIds = apiKeyIdsParam ? apiKeyIdsParam.split(",").filter(Boolean) : [];
        const sinceIso = startDate || getRangeStartIso(range);
        const untilIso = endDate || null;
        const presetsParam = searchParams.get("presets");
        const apiKeys = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeys"])();
        const currentApiKeyNames = new Map();
        for (const apiKey of apiKeys){
            if (typeof apiKey.id === "string" && typeof apiKey.name === "string") {
                currentApiKeyNames.set(apiKey.id, apiKey.name);
            }
        }
        // Raw-data cutoff: must match cleanupUsageHistory's rollup/delete boundary —
        // retention.usageHistory (src/lib/db/cleanup.ts), NOT aggregation.rawDataRetentionDays.
        const dbSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])();
        const rawRetentionDays = dbSettings.retention?.usageHistory ?? 30;
        const rawCutoff = new Date();
        rawCutoff.setDate(rawCutoff.getDate() - rawRetentionDays);
        const rawCutoffIso = rawCutoff.toISOString();
        const conditions = [];
        const params = {};
        if (sinceIso) {
            conditions.push("timestamp >= @since");
            params.since = sinceIso;
        }
        if (untilIso) {
            conditions.push("timestamp <= @until");
            params.until = untilIso;
        }
        let apiKeyWhere = "";
        if (apiKeyIds.length > 0) {
            const placeholders = apiKeyIds.map((_, i)=>`@apiKey${i}`);
            apiKeyIds.forEach((key, i)=>{
                params[`apiKey${i}`] = key;
            });
            apiKeyWhere = `(api_key_name IN (${placeholders.join(",")}) OR api_key_id IN (${placeholders.join(",")}))`;
            conditions.push(apiKeyWhere);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        // Build the UNION data source that merges recent raw rows with older aggregated history.
        // SQL is encapsulated in usageAnalytics.ts — the route only supplies filter parameters.
        const rawCutoffDate = rawCutoffIso.split("T")[0];
        const apiKeyParamEntries = {};
        apiKeyIds.forEach((key, i)=>{
            apiKeyParamEntries[`apiKey${i}`] = key;
        });
        const { unifiedSource, unifiedParams } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2f$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildUnifiedSource"])({
            sinceIso: sinceIso ?? null,
            untilIso: untilIso ?? null,
            rawCutoffDate,
            apiKeyWhere,
            apiKeyParams: apiKeyParamEntries
        });
        // Fetch pricing data for cost calculation (no rows loaded)
        const { getPricing } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
        const rawPricingByProvider = await getPricing();
        // Pre-process pricing data to lowercase keys for O(1) lookups
        const pricingByProvider = {};
        for (const [providerKey, providerVal] of Object.entries(rawPricingByProvider || {})){
            const lowerProvider = {};
            for (const [modelKey, modelVal] of Object.entries(providerVal || {})){
                lowerProvider[modelKey.toLowerCase()] = modelVal;
            }
            pricingByProvider[providerKey.toLowerCase()] = lowerProvider;
        }
        const { computeCostFromPricing, getCodexFastCostMultiplier, normalizeModelName } = await __turbopack_context__.A("[project]/src/lib/usage/costCalculator.ts [app-route] (ecmascript, async loader)");
        const { PROVIDER_ID_TO_ALIAS } = await __turbopack_context__.A("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript, async loader)");
        const summaryRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageSummary"])(unifiedSource, unifiedParams);
        const dailyRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDailyUsage"])(unifiedSource, unifiedParams);
        const dailyCostRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDailyCostRows"])(unifiedSource, unifiedParams);
        const heatmapStart = new Date();
        heatmapStart.setUTCDate(heatmapStart.getUTCDate() - 364);
        // Custom date range might need a wider heatmap window
        if (startDate) {
            const customStart = new Date(startDate);
            if (customStart.getTime() < heatmapStart.getTime()) {
                heatmapStart.setTime(customStart.getTime());
            }
        }
        // Heatmap needs its own whereClause if api keys are filtered
        const heatmapConditions = [
            "timestamp >= @heatmapStart"
        ];
        if (apiKeyWhere) heatmapConditions.push(apiKeyWhere);
        const heatmapParams = {
            heatmapStart: heatmapStart.toISOString()
        };
        if (apiKeyIds.length > 0) {
            apiKeyIds.forEach((key, i)=>{
                heatmapParams[`apiKey${i}`] = key;
            });
        }
        const heatmapRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHeatmapRows"])(heatmapConditions, heatmapParams);
        const modelRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelUsageRows"])(unifiedSource, unifiedParams);
        const providerCostRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCostRows"])(unifiedSource, unifiedParams);
        const providerRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderUsageRows"])(unifiedSource, unifiedParams);
        const accountCostWhereClause = whereClause.replace(/timestamp/g, "usage_history.timestamp").replace(/api_key_/g, "usage_history.api_key_");
        const accountCostRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccountCostRows"])(accountCostWhereClause, params);
        const accountRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccountUsageRows"])(accountCostWhereClause, params);
        const apiKeyWhereClause = appendWhereCondition(whereClause, "(api_key_id IS NOT NULL AND api_key_id != '') OR (api_key_name IS NOT NULL AND api_key_name != '')");
        const apiKeyRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApiKeyUsageRows"])(apiKeyWhereClause, params);
        const serviceTierRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getServiceTierUsageRows"])(unifiedSource, unifiedParams);
        const apiKeyMetadataRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApiKeyMetadataRows"])(apiKeyWhereClause, params);
        const apiKeyMetadata = new Map();
        for (const row of apiKeyMetadataRows){
            const apiKeyId = toStringValue(row.apiKeyId);
            const apiKeyGroupKey = toStringValue(row.apiKeyGroupKey, "unknown");
            const groupKey = makeApiKeyUsageGroup(apiKeyId, apiKeyGroupKey);
            const existing = apiKeyMetadata.get(groupKey) || {
                latestName: "",
                aliases: new Set()
            };
            const apiKeyName = toStringValue(row.apiKeyName);
            if (!existing.latestName && apiKeyName) existing.latestName = apiKeyName;
            addApiKeyAlias(existing.aliases, apiKeyName);
            apiKeyMetadata.set(groupKey, existing);
        }
        const weeklyRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getWeeklyPatternRows"])(unifiedSource, unifiedParams);
        const fallbackRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$callLogStats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFallbackStats"])(whereClause, params);
        const summary = {
            totalRequests: Number(summaryRow?.totalRequests || 0),
            promptTokens: Number(summaryRow?.promptTokens || 0),
            completionTokens: Number(summaryRow?.completionTokens || 0),
            totalTokens: Number(summaryRow?.totalTokens || 0),
            uniqueModels: Number(summaryRow?.uniqueModels || 0),
            uniqueAccounts: Number(summaryRow?.uniqueAccounts || 0),
            uniqueApiKeys: Number(summaryRow?.uniqueApiKeys || 0),
            successfulRequests: Number(summaryRow?.successfulRequests || 0),
            successRatePct: Number(summaryRow?.totalRequests || 0) > 0 ? Number((Number(summaryRow?.successfulRequests || 0) / Number(summaryRow?.totalRequests || 1) * 100).toFixed(2)) : 0,
            avgLatencyMs: Math.round(Number(summaryRow?.avgLatencyMs || 0)),
            totalCost: 0,
            firstRequest: summaryRow?.firstRequest || "",
            lastRequest: summaryRow?.lastRequest || "",
            fallbackCount: Number(fallbackRow?.fallbacks || 0),
            fastRequests: 0,
            standardRequests: 0,
            flexRequests: 0,
            fastCost: 0,
            standardCost: 0,
            flexCost: 0,
            flexSavings: 0,
            flexUsageSavingsTokens: 0,
            fastRequestSharePct: 0,
            fallbackRatePct: Number(fallbackRow?.fallback_eligible || 0) > 0 ? Number((Number(fallbackRow?.fallbacks || 0) / Number(fallbackRow?.fallback_eligible || 1) * 100).toFixed(2)) : 0,
            requestedModelCoveragePct: Number(fallbackRow?.total || 0) > 0 ? Number((Number(fallbackRow?.with_requested || 0) / Number(fallbackRow?.total || 1) * 100).toFixed(2)) : 0,
            streak: 0
        };
        const dailyByModelMap = {};
        const allModels = new Set();
        const dailyCostByDate = new Map();
        for (const row of dailyCostRows){
            const date = toStringValue(row.date);
            if (!date) continue;
            // Calculate costs
            const cost = computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
            dailyCostByDate.set(date, (dailyCostByDate.get(date) || 0) + cost);
            // Group tokens by model for the day
            const model = normalizeModelName(row.model);
            const tokens = Number(row.promptTokens) + Number(row.completionTokens);
            if (!dailyByModelMap[date]) dailyByModelMap[date] = {};
            dailyByModelMap[date][model] = (dailyByModelMap[date][model] || 0) + tokens;
            allModels.add(model);
        }
        const dailyTrend = dailyRows.map((row)=>({
                date: row.date,
                requests: Number(row.requests),
                promptTokens: Number(row.promptTokens),
                completionTokens: Number(row.completionTokens),
                totalTokens: Number(row.totalTokens),
                cost: roundCost(dailyCostByDate.get(toStringValue(row.date)) || 0)
            }));
        const activityMap = {};
        for (const row of heatmapRows){
            activityMap[row.date] = Number(row.totalTokens);
        }
        summary.streak = computeActivityStreak(activityMap);
        const modelMap = new Map();
        for (const row of modelRows){
            const model = row.model;
            const provider = row.provider;
            const short = normalizeModelName(model);
            const cost = computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
            // Keyed by model name alone (not provider) — the table renders one row per
            // model, so the same model served via multiple provider connections/accounts
            // must be merged here rather than producing duplicate `key={m.model}` rows.
            const key = short;
            const existing = modelMap.get(key) || {
                model: short,
                provider,
                rawModel: model,
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                latencyWeightedTotal: 0,
                successfulRequests: 0,
                lastUsed: "",
                cost: 0
            };
            const requests = Number(row.requests) || 0;
            existing.requests = Number(existing.requests || 0) + requests;
            existing.promptTokens = Number(existing.promptTokens || 0) + Number(row.promptTokens || 0);
            existing.completionTokens = Number(existing.completionTokens || 0) + Number(row.completionTokens || 0);
            existing.totalTokens = Number(existing.totalTokens || 0) + Number(row.totalTokens || 0);
            existing.latencyWeightedTotal = Number(existing.latencyWeightedTotal || 0) + Number(row.avgLatencyMs || 0) * requests;
            existing.successfulRequests = Number(existing.successfulRequests || 0) + Number(row.successfulRequests || 0);
            if (!existing.lastUsed || String(row.lastUsed || "") > String(existing.lastUsed || "")) {
                existing.lastUsed = row.lastUsed;
            }
            existing.cost = Number(existing.cost || 0) + cost;
            modelMap.set(key, existing);
        }
        const byModel = Array.from(modelMap.values()).map((row)=>({
                model: row.model,
                provider: row.provider,
                rawModel: row.rawModel,
                requests: Number(row.requests),
                promptTokens: Number(row.promptTokens),
                completionTokens: Number(row.completionTokens),
                totalTokens: Number(row.totalTokens),
                avgLatencyMs: Number(row.requests) > 0 ? Math.round(Number(row.latencyWeightedTotal || 0) / Number(row.requests)) : 0,
                successRatePct: Number(row.requests) > 0 ? Number(Number(row.successfulRequests || 0) / Number(row.requests) * 100).toFixed(2) : 0,
                lastUsed: row.lastUsed,
                cost: roundCost(Number(row.cost || 0))
            })).sort((left, right)=>Number(right.requests) - Number(left.requests)).slice(0, 50);
        const totalCost = Array.from(dailyCostByDate.values()).reduce((sum, cost)=>sum + cost, 0);
        summary.totalCost = roundCost(totalCost);
        const providerCostByProvider = new Map();
        for (const row of providerCostRows){
            const provider = toStringValue(row.provider);
            if (!provider) continue;
            const cost = computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
            providerCostByProvider.set(provider, (providerCostByProvider.get(provider) || 0) + cost);
        }
        const byProvider = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerDisplayNames$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildByProviderRows"])(providerRows, providerCostByProvider);
        const accountCostByAccount = new Map();
        for (const row of accountCostRows){
            const accountKey = toStringValue(row.accountKey, "unknown");
            const cost = computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
            accountCostByAccount.set(accountKey, (accountCostByAccount.get(accountKey) || 0) + cost);
        }
        const byAccount = accountRows.map((row)=>({
                account: toStringValue(row.account, "unknown"),
                requests: Number(row.requests),
                promptTokens: Number(row.promptTokens),
                completionTokens: Number(row.completionTokens),
                totalTokens: Number(row.totalTokens),
                avgLatencyMs: Math.round(Number(row.avgLatencyMs)),
                lastUsed: row.lastUsed,
                cost: roundCost(accountCostByAccount.get(toStringValue(row.accountKey, "unknown")) || 0)
            }));
        const apiKeyMap = new Map();
        for (const row of apiKeyRows){
            const apiKeyId = toStringValue(row.apiKeyId);
            const apiKeyGroupKey = toStringValue(row.apiKeyGroupKey, "unknown");
            const key = makeApiKeyUsageGroup(apiKeyId, apiKeyGroupKey);
            const metadata = apiKeyMetadata.get(key);
            const apiKeyName = (apiKeyId ? currentApiKeyNames.get(apiKeyId) : undefined) || metadata?.latestName || apiKeyId || apiKeyGroupKey || "Unknown API key";
            const existing = apiKeyMap.get(key) || {
                apiKey: apiKeyId && apiKeyName !== apiKeyId ? `${apiKeyName} (${apiKeyId})` : apiKeyName,
                apiKeyId: apiKeyId || null,
                apiKeyName,
                historicalApiKeyNames: Array.from(metadata?.aliases || []),
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                cost: 0
            };
            existing.requests += Number(row.requests);
            existing.promptTokens += Number(row.promptTokens);
            existing.completionTokens += Number(row.completionTokens);
            existing.totalTokens += Number(row.totalTokens);
            existing.cost += computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
            apiKeyMap.set(key, existing);
        }
        const byApiKey = Array.from(apiKeyMap.values()).map((row)=>({
                ...row,
                cost: roundCost(row.cost)
            })).sort((left, right)=>right.cost - left.cost);
        const serviceTierMap = new Map();
        for (const row of serviceTierRows){
            const serviceTier = normalizeServiceTier(row.serviceTier);
            const existing = serviceTierMap.get(serviceTier) || {
                serviceTier,
                label: getServiceTierLabelId(serviceTier),
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                cost: 0,
                savings: 0,
                usageSavingsTokens: 0
            };
            existing.requests += Number(row.requests || 0);
            existing.promptTokens += Number(row.promptTokens || 0);
            existing.completionTokens += Number(row.completionTokens || 0);
            existing.totalTokens += Number(row.totalTokens || 0);
            const actualCost = computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
            existing.cost += actualCost;
            if (serviceTier === "flex") {
                const standardCost = computeUsageRowStandardCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
                existing.savings += Math.max(0, standardCost - actualCost);
                existing.usageSavingsTokens += computeUsageSavingsTokens(row, serviceTier, getCodexFastCostMultiplier);
            }
            serviceTierMap.set(serviceTier, existing);
        }
        const byServiceTier = Array.from(serviceTierMap.values()).map((row)=>({
                ...row,
                cost: roundCost(row.cost),
                savings: roundCost(row.savings),
                usageSavingsTokens: Math.round(row.usageSavingsTokens)
            })).sort((left, right)=>{
            const order = {
                priority: 0,
                flex: 1,
                standard: 2
            };
            return order[left.serviceTier] - order[right.serviceTier];
        });
        const fastTier = serviceTierMap.get("priority");
        const flexTier = serviceTierMap.get("flex");
        const standardTier = serviceTierMap.get("standard");
        summary.fastRequests = fastTier?.requests || 0;
        summary.fastCost = roundCost(fastTier?.cost || 0);
        summary.flexRequests = flexTier?.requests || 0;
        summary.flexCost = roundCost(flexTier?.cost || 0);
        summary.flexSavings = roundCost(flexTier?.savings || 0);
        summary.flexUsageSavingsTokens = Math.round(flexTier?.usageSavingsTokens || 0);
        summary.standardRequests = standardTier?.requests || 0;
        summary.standardCost = roundCost(standardTier?.cost || 0);
        summary.fastRequestSharePct = summary.totalRequests > 0 ? Number((Number(summary.fastRequests) / Number(summary.totalRequests) * 100).toFixed(2)) : 0;
        const weeklyTokens = [
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];
        const weeklyCounts = [
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];
        const weeklyPattern = WEEKDAY_LABELS.map((day)=>({
                day,
                avgTokens: 0,
                totalTokens: 0
            }));
        for (const row of weeklyRows){
            const dayIdx = Number(row.dayOfWeek);
            if (dayIdx >= 0 && dayIdx <= 6) {
                const totalTokens = Number(row.totalTokens);
                const days = Number(row.days);
                weeklyTokens[dayIdx] = totalTokens;
                weeklyCounts[dayIdx] = Number(row.requests);
                weeklyPattern[dayIdx] = {
                    day: WEEKDAY_LABELS[dayIdx],
                    avgTokens: days > 0 ? Math.round(totalTokens / days) : 0,
                    totalTokens
                };
            }
        }
        const dailyByModel = Object.keys(dailyByModelMap).sort().map((date)=>({
                date,
                ...dailyByModelMap[date]
            }));
        const modelNames = Array.from(allModels);
        const analytics = {
            summary,
            dailyTrend,
            activityMap,
            byModel,
            byProvider,
            byApiKey,
            byAccount,
            byServiceTier,
            weeklyPattern,
            weeklyTokens,
            weeklyCounts,
            dailyByModel,
            modelNames,
            range
        };
        if (presetsParam) {
            const allowedRanges = new Set([
                "1d",
                "7d",
                "30d",
                "90d",
                "ytd",
                "all"
            ]);
            const presetRanges = presetsParam.split(",").map((preset)=>preset.trim()).filter((preset)=>allowedRanges.has(preset));
            const presetSummaries = {};
            for (const presetRange of presetRanges){
                if (presetRange === range) {
                    presetSummaries[presetRange] = {
                        totalCost: Number(analytics.summary?.totalCost || 0)
                    };
                    continue;
                }
                const presetSinceIso = getRangeStartIso(presetRange);
                const { unifiedSource: pSrc, unifiedParams: pParams } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2f$sources$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildPresetUnifiedSource"])({
                    sinceIso: presetSinceIso ?? null,
                    untilIso: null,
                    rawCutoffDate,
                    apiKeyWhere,
                    apiKeyParams: apiKeyParamEntries
                });
                const presetModelRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$usageAnalytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPresetCostModelRows"])(pSrc, pParams);
                let presetTotalCost = 0;
                for (const row of presetModelRows){
                    presetTotalCost += computeUsageRowCost(row, pricingByProvider, PROVIDER_ID_TO_ALIAS, normalizeModelName, computeCostFromPricing);
                }
                presetSummaries[presetRange] = {
                    totalCost: roundCost(presetTotalCost)
                };
            }
            analytics.presetSummaries = presetSummaries;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(analytics);
    } catch (error) {
        console.error("Error computing analytics:", error);
        // Surface the real (sanitized) reason so the dashboard can show it instead of a
        // generic placeholder (#3356). buildErrorBody strips stacks/absolute paths.
        const { buildErrorBody } = await __turbopack_context__.A("[project]/open-sse/utils/error.ts [app-route] (ecmascript, async loader)");
        const message = error instanceof Error ? error.message : String(error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(buildErrorBody(500, message || "Failed to compute analytics"), {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_0y5135w._.js.map