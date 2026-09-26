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
"[project]/src/server/auth/loginGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOGIN_GUARD_TUNABLES",
    ()=>LOGIN_GUARD_TUNABLES,
    "checkLoginGuard",
    ()=>checkLoginGuard,
    "clearLoginAttempts",
    ()=>clearLoginAttempts,
    "getLoginGuardSizeForTests",
    ()=>getLoginGuardSizeForTests,
    "recordLoginFailure",
    ()=>recordLoginFailure,
    "resetLoginGuardForTests",
    ()=>resetLoginGuardForTests
]);
/**
 * Login brute-force guard.
 *
 * Tracks failed `/api/auth/login` attempts per client IP in process memory
 * and returns lockout decisions. Single-process scope is intentional — this
 * is a defense-in-depth check that pairs with Cloudflare/reverse-proxy rate
 * limiting, not a substitute for it.
 *
 * Tunables:
 *   - failure threshold: 5 within `WINDOW_MS`
 *   - lockout duration: `LOCKOUT_MS`
 *   - sliding window: `WINDOW_MS`
 *
 * The guard is a no-op when `enabled` is false; the caller decides based on
 * the `bruteForceProtection` setting (default true).
 */ const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const FAILURE_THRESHOLD = 5;
const attempts = new Map();
// Above this many tracked IPs, opportunistically drop entries whose window has elapsed and
// that are not currently locked. Without this the map only ever grew (entries were deleted
// only on a *successful* login), so every distinct IP that ever failed a login leaked a
// permanent entry — unbounded under distributed brute-force. Expired/unlocked entries are
// already treated as "allowed", so removing them never changes a guard decision.
const PRUNE_THRESHOLD = 256;
function pruneExpiredAttempts(now) {
    for (const [key, state] of attempts){
        const windowElapsed = now - state.firstAttemptAt > WINDOW_MS;
        const notLocked = !state.lockedUntil || state.lockedUntil <= now;
        if (windowElapsed && notLocked) attempts.delete(key);
    }
}
function nowMs() {
    return Date.now();
}
function clientKey(rawIp) {
    const ip = (rawIp || "").trim();
    return ip || "__unknown__";
}
function checkLoginGuard(rawIp, options) {
    if (!options.enabled) return {
        allowed: true
    };
    const state = attempts.get(clientKey(rawIp));
    if (!state) return {
        allowed: true
    };
    const now = nowMs();
    if (state.lockedUntil && state.lockedUntil > now) {
        return {
            allowed: false,
            retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000)
        };
    }
    return {
        allowed: true
    };
}
function recordLoginFailure(rawIp, options) {
    if (!options.enabled) return {
        allowed: true
    };
    const key = clientKey(rawIp);
    const now = nowMs();
    // Keep the map from growing without bound as distinct IPs fail logins over time.
    if (attempts.size > PRUNE_THRESHOLD) pruneExpiredAttempts(now);
    const existing = attempts.get(key);
    if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
        attempts.set(key, {
            count: 1,
            firstAttemptAt: now,
            lockedUntil: null
        });
        return {
            allowed: true
        };
    }
    const nextCount = existing.count + 1;
    if (nextCount >= FAILURE_THRESHOLD) {
        const lockedUntil = now + LOCKOUT_MS;
        attempts.set(key, {
            count: nextCount,
            firstAttemptAt: existing.firstAttemptAt,
            lockedUntil
        });
        return {
            allowed: false,
            retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000)
        };
    }
    attempts.set(key, {
        count: nextCount,
        firstAttemptAt: existing.firstAttemptAt,
        lockedUntil: null
    });
    return {
        allowed: true
    };
}
function clearLoginAttempts(rawIp) {
    attempts.delete(clientKey(rawIp));
}
function resetLoginGuardForTests() {
    attempts.clear();
}
function getLoginGuardSizeForTests() {
    return attempts.size;
}
const LOGIN_GUARD_TUNABLES = Object.freeze({
    WINDOW_MS,
    LOCKOUT_MS,
    FAILURE_THRESHOLD
});
}),
"[project]/src/app/api/auth/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "authRouteInternals",
    ()=>authRouteInternals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/compliance/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ipUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ipUtils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$managementPassword$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/managementPassword.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/validation/schemas.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$misc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/validation/schemas/misc.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/validation/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2f$loginGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/auth/loginGuard.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$managementPassword$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$misc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$managementPassword$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$misc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
// SECURITY: No hardcoded fallback — JWT_SECRET must be configured.
if (!process.env.JWT_SECRET) {
    console.error("[SECURITY] FATAL: JWT_SECRET is not set. Login authentication is disabled.");
}
function getJwtSecret() {
    return new TextEncoder().encode(process.env.JWT_SECRET || "");
}
const authRouteInternals = {
    getCookieStore: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"]
};
async function POST(request) {
    const auditContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAuditRequestContext"])(request);
    try {
        // Fail-fast if JWT_SECRET is not configured
        if (!process.env.JWT_SECRET) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
                action: "auth.login.misconfigured",
                actor: "system",
                target: "dashboard-auth",
                resourceType: "auth_session",
                status: "failed",
                ipAddress: auditContext.ipAddress || undefined,
                requestId: auditContext.requestId,
                metadata: {
                    reason: "missing_jwt_secret"
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Server misconfigured: JWT_SECRET not set. Contact administrator."
            }, {
                status: 500
            });
        }
        let rawBody;
        try {
            rawBody = await request.json();
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: {
                    message: "Invalid request",
                    details: [
                        {
                            field: "body",
                            message: "Invalid JSON body"
                        }
                    ]
                }
            }, {
                status: 400
            });
        }
        // Zod validation
        const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateBody"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$schemas$2f$misc$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginSchema"], rawBody);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$validation$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidationFailure"])(validation)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: validation.error
            }, {
                status: 400
            });
        }
        const password = typeof validation.data.password === "string" ? validation.data.password : "";
        if (!password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid password payload"
            }, {
                status: 400
            });
        }
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedSettings"])();
        const bruteForceEnabled = settings.bruteForceProtection !== false;
        const clientIp = auditContext.ipAddress || null;
        const guardCheck = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2f$loginGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkLoginGuard"])(clientIp, {
            enabled: bruteForceEnabled
        });
        if (!guardCheck.allowed) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
                action: "auth.login.locked",
                actor: "anonymous",
                target: "dashboard-auth",
                resourceType: "auth_session",
                status: "failed",
                ipAddress: clientIp || undefined,
                requestId: auditContext.requestId,
                metadata: {
                    retryAfterSeconds: guardCheck.retryAfterSeconds || 0
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Too many failed attempts. Try again later."
            }, {
                status: 429,
                headers: guardCheck.retryAfterSeconds ? {
                    "Retry-After": String(guardCheck.retryAfterSeconds)
                } : {}
            });
        }
        const passwordState = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$managementPassword$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensurePersistentManagementPasswordHash"])({
            settings,
            source: "auth.login"
        });
        const storedHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$managementPassword$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStoredManagementPassword"])(passwordState.settings);
        if (!storedHash) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
                action: "auth.login.setup_required",
                actor: "anonymous",
                target: "dashboard-auth",
                resourceType: "auth_session",
                status: "failed",
                ipAddress: auditContext.ipAddress || undefined,
                requestId: auditContext.requestId,
                metadata: {
                    reason: "missing_persisted_password"
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No password configured. Complete onboarding first.",
                needsSetup: true
            }, {
                status: 403
            });
        }
        const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$managementPassword$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyManagementPassword"])(password, storedHash);
        if (isValid) {
            const forceSecureCookie = process.env.AUTH_COOKIE_SECURE === "true";
            const forwardedProtoHeader = request.headers.get("x-forwarded-proto") || "";
            const forwardedProto = forwardedProtoHeader.split(",")[0].trim().toLowerCase();
            const isHttpsRequest = forwardedProto === "https" || request.nextUrl?.protocol === "https:";
            const useSecureCookie = forceSecureCookie || isHttpsRequest;
            const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
                authenticated: true
            }).setProtectedHeader({
                alg: "HS256"
            }).setExpirationTime("30d").sign(getJwtSecret());
            const cookieStore = await authRouteInternals.getCookieStore();
            cookieStore.set("auth_token", token, {
                httpOnly: true,
                secure: useSecureCookie,
                sameSite: "lax",
                path: "/",
                // 30 days — bound the cookie lifetime to the JWT's 30d expiry so the browser
                // drops it on the same schedule the token stops being valid (Seg3 hardening).
                maxAge: 60 * 60 * 24 * 30
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
                action: "auth.login.success",
                actor: "admin",
                target: "dashboard-auth",
                resourceType: "auth_session",
                status: "success",
                ipAddress: auditContext.ipAddress || undefined,
                requestId: auditContext.requestId,
                metadata: {
                    hasStoredPassword: Boolean(storedHash),
                    passwordMigrated: passwordState.migrated,
                    secureCookie: useSecureCookie
                }
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2f$loginGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearLoginAttempts"])(clientIp);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        }
        const failureDecision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2f$loginGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordLoginFailure"])(clientIp, {
            enabled: bruteForceEnabled
        });
        // #8336: tag the origin scope so the audit view can distinguish a mistyped
        // password from the host itself / the LAN (loopback / private) from a
        // genuinely external attempt, instead of every failure reading as intrusion.
        const sourceScope = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ipUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classifyIpScope"])(auditContext.ipAddress);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
            action: "auth.login.failed",
            actor: "anonymous",
            target: "dashboard-auth",
            resourceType: "auth_session",
            status: "failed",
            ipAddress: auditContext.ipAddress || undefined,
            requestId: auditContext.requestId,
            metadata: {
                reason: "invalid_password",
                lockedOut: failureDecision.allowed === false,
                sourceScope,
                internalOrigin: sourceScope === "loopback" || sourceScope === "private"
            }
        });
        if (!failureDecision.allowed) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Too many failed attempts. Try again later."
            }, {
                status: 429,
                headers: failureDecision.retryAfterSeconds ? {
                    "Retry-After": String(failureDecision.retryAfterSeconds)
                } : {}
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid password"
        }, {
            status: 401
        });
    } catch (error) {
        console.error("[AUTH] Login failed:", error);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logAuditEvent"])({
            action: "auth.login.error",
            actor: "system",
            target: "dashboard-auth",
            resourceType: "auth_session",
            status: "failed",
            ipAddress: auditContext.ipAddress || undefined,
            requestId: auditContext.requestId,
            metadata: {
                message: error instanceof Error ? error.message : "unknown_error"
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_170sw2t._.js.map