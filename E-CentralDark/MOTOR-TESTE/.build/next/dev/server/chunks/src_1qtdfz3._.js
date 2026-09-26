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
"[project]/src/domain/omnirouteResponseMeta.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "attachOmniRouteMetaHeaders",
    ()=>attachOmniRouteMetaHeaders,
    "attachOmniRouteMetaToResponse",
    ()=>attachOmniRouteMetaToResponse,
    "buildOmniRouteDecisionHeaderValue",
    ()=>buildOmniRouteDecisionHeaderValue,
    "buildOmniRouteResponseMetaHeaders",
    ()=>buildOmniRouteResponseMetaHeaders,
    "buildOmniRouteSseMetadataComment",
    ()=>buildOmniRouteSseMetadataComment,
    "formatOmniRouteCost",
    ()=>formatOmniRouteCost,
    "getOmniRouteTokenCounts",
    ()=>getOmniRouteTokenCounts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function toFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
function toNonNegativeInteger(value) {
    return Math.max(0, Math.round(toFiniteNumber(value)));
}
const INVALID_HEADER_VALUE_CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const ASCII_HEADER_VALUE_PATTERN = /^[\u0020-\u007e]*$/;
function toWellFormedUnicode(value) {
    let result = "";
    for(let i = 0; i < value.length; i += 1){
        const code = value.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff) {
            const next = value.charCodeAt(i + 1);
            if (next >= 0xdc00 && next <= 0xdfff) {
                result += value[i] + value[i + 1];
                i += 1;
            } else {
                result += "\uFFFD";
            }
            continue;
        }
        if (code >= 0xdc00 && code <= 0xdfff) {
            result += "\uFFFD";
            continue;
        }
        result += value[i];
    }
    return result;
}
function toHeaderValue(value) {
    const withoutControls = value.replace(INVALID_HEADER_VALUE_CONTROL_CHARS, "");
    if (ASCII_HEADER_VALUE_PATTERN.test(withoutControls)) return withoutControls;
    return encodeURIComponent(toWellFormedUnicode(withoutControls));
}
function getOmniRouteTokenCounts(usage) {
    if (!usage || typeof usage !== "object") {
        return {
            input: 0,
            output: 0
        };
    }
    return {
        input: toNonNegativeInteger(usage.input ?? usage.prompt_tokens ?? usage.input_tokens ?? usage.promptTokens ?? usage.inputTokens),
        output: toNonNegativeInteger(usage.output ?? usage.completion_tokens ?? usage.output_tokens ?? usage.completionTokens ?? usage.outputTokens)
    };
}
function formatOmniRouteCost(costUsd) {
    const normalized = toFiniteNumber(costUsd);
    return normalized > 0 ? normalized.toFixed(10) : "0.0000000000";
}
function buildOmniRouteDecisionHeaderValue({ strategy = null, provider = null, latencyMs = 0 }) {
    const hasStrategy = typeof strategy === "string" && strategy.trim().length > 0;
    const hasProvider = typeof provider === "string" && provider.trim().length > 0;
    if (!hasStrategy && !hasProvider) return null;
    const parts = [];
    if (hasStrategy) parts.push(`strategy=${strategy}`);
    if (hasProvider) parts.push(`provider=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(provider)}`);
    parts.push(`latency_ms=${toNonNegativeInteger(latencyMs)}`);
    return toHeaderValue(parts.join("; "));
}
function buildOmniRouteResponseMetaHeaders({ cacheHit = false, costUsd = 0, costSavedUsd = undefined, fallbackAttempts = 0, latencyMs = 0, model = null, provider = null, requestId = null, strategy = null, usage = null }) {
    const tokens = getOmniRouteTokenCounts(usage);
    const headers = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].cacheHit]: toHeaderValue(String(cacheHit)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].latencyMs]: toHeaderValue(String(toNonNegativeInteger(latencyMs))),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].responseCost]: toHeaderValue(formatOmniRouteCost(costUsd)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].tokensIn]: toHeaderValue(String(tokens.input)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].tokensOut]: toHeaderValue(String(tokens.output)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].version]: toHeaderValue(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["APP_CONFIG"].version)
    };
    if (typeof model === "string" && model.trim().length > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].model] = toHeaderValue(model);
    }
    if (typeof requestId === "string" && requestId.trim().length > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].requestId] = toHeaderValue(requestId);
    }
    if (typeof provider === "string" && provider.trim().length > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].provider] = toHeaderValue((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(provider));
    }
    // Cache-saved cost: emitted only when the caller passes a value (cache HITs), so
    // non-cache responses keep their existing header shape. `0` is a valid saved cost.
    if (costSavedUsd != null) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].costSaved] = toHeaderValue(formatOmniRouteCost(costSavedUsd));
    }
    const attempts = toNonNegativeInteger(fallbackAttempts);
    if (attempts > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].fallbackAttempts] = toHeaderValue(String(attempts));
    }
    const decisionValue = buildOmniRouteDecisionHeaderValue({
        strategy,
        provider,
        latencyMs
    });
    if (decisionValue !== null) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].decision] = decisionValue;
    }
    return headers;
}
function buildOmniRouteSseMetadataComment(options) {
    const headers = buildOmniRouteResponseMetaHeaders(options);
    const lines = Object.entries(headers).filter(([, value])=>typeof value === "string" && value.trim().length > 0).map(([name, value])=>`: ${name.toLowerCase()}=${value}`);
    return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}
function attachOmniRouteMetaHeaders(headers, meta) {
    const built = buildOmniRouteResponseMetaHeaders(meta);
    if (headers instanceof Headers) {
        for (const [name, value] of Object.entries(built))headers.set(name, value);
    } else {
        Object.assign(headers, built);
    }
}
function attachOmniRouteMetaToResponse(response, meta) {
    if (!response) return response;
    try {
        attachOmniRouteMetaHeaders(response.headers, meta);
        return response;
    } catch  {
        const cloned = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
        attachOmniRouteMetaHeaders(cloned.headers, meta);
        return cloned;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/usage.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaSnapshots.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/quotaResetEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
                remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safePercentage"])(q.remainingPercentage) ?? (q.total > 0 ? Math.round((q.total - (q.used || 0)) / q.total * 100) : 0),
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
    const requestedFamily = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(requestedModel);
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
    return quotaNames.filter((windowName)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(windowName) === requestedFamily);
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
    const filterWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCodexQuotaWindowFilterForModel"])(requestedModel);
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
            const remainingPercentage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safePercentage"])(quotaInfo.remainingPercentage) ?? (quotaInfo.total > 0 ? Math.round((quotaInfo.total - (quotaInfo.used || 0)) / quotaInfo.total * 100) : 0);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaResetEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordProviderQuotaResetEventIfChanged"])({
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
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveQuotaSnapshot"])({
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
        snapshots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLatestQuotaSnapshotsForConnection"])(connectionId);
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
        const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(entry.connectionId);
        if (!connection || connection.authType !== "oauth" || !connection.isActive) {
            cache.delete(entry.connectionId);
            return;
        }
        const proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(entry.connectionId);
        const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyInfo?.proxy || null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageForProvider"])(connection));
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$quotaSnapshots$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanupOldSnapshots"])();
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
"[project]/src/domain/prompts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Stage Prompts — Smart Auto-Pipeline
 *
 * Prompt templates for each pipeline stage with variable interpolation.
 * Reflect stage mandates structured JSON output for pass/fail decisions.
 *
 * @module domain/prompts
 */ __turbopack_context__.s([
    "STAGE_PROMPTS",
    ()=>STAGE_PROMPTS,
    "interpolate",
    ()=>interpolate,
    "renderPrompt",
    ()=>renderPrompt
]);
const STAGE_PROMPTS = {
    plan: {
        system: [
            "You are a planning assistant. Analyze the user's request and produce a clear,",
            "step-by-step execution plan. Break complex tasks into atomic steps.",
            "Identify dependencies, constraints, and potential failure points.",
            "Output the plan as numbered steps with brief explanations."
        ].join(" "),
        user: [
            "Create a detailed execution plan for the following request.\n",
            "Request: {original_request}"
        ].join("")
    },
    execute: {
        system: [
            "You are a capable assistant. Execute the given task accurately and completely.",
            "Follow any provided plan precisely. Produce clear, well-structured output."
        ].join(" "),
        user: [
            "{plan_context}\n",
            "Request: {original_request}"
        ].join("")
    },
    reflect: {
        system: [
            "You are a quality reviewer. Evaluate the execution output against the original request.",
            "You MUST respond with a JSON object in exactly this format:\n",
            '{"status":"pass","confirmation":"<brief explanation of why the output satisfies the request>"}\n',
            "OR\n",
            '{"status":"fail","issues":["<issue 1>","<issue 2>"],"corrected":"<corrected output>"}\n',
            "Be strict: only mark pass if the output fully satisfies the request.",
            "If there are any issues, omissions, or errors, mark as fail and provide a corrected version."
        ].join(" "),
        user: [
            "Original request: {original_request}\n\n",
            "Execution output:\n{execution_response}\n\n",
            "Evaluate the output and respond with the required JSON format."
        ].join("")
    },
    fix: {
        system: [
            "You are a corrective assistant. The previous execution had issues identified during review.",
            "Apply the corrections and improvements specified in the reflection.",
            "Produce a final, polished output that addresses all identified issues."
        ].join(" "),
        user: [
            "Original request: {original_request}\n\n",
            "Reflection feedback:\n{reflection_response}\n\n",
            "Produce the corrected output."
        ].join("")
    }
};
function interpolate(template, variables) {
    return template.replace(/\{(\w+)\}/g, (match, key)=>{
        return key in variables ? variables[key] : match;
    });
}
function renderPrompt(stage, variables) {
    const template = STAGE_PROMPTS[stage];
    if (!template) {
        throw new Error(`Unknown stage: ${stage}`);
    }
    return {
        system: interpolate(template.system, variables),
        user: interpolate(template.user, variables)
    };
}
}),
"[project]/src/domain/pipeline.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildPipelineConfig",
    ()=>buildPipelineConfig,
    "executePipeline",
    ()=>executePipeline,
    "parseReflectJson",
    ()=>parseReflectJson
]);
/**
 * Pipeline Engine — Smart Auto-Pipeline
 *
 * Pure pipeline engine that orchestrates multi-stage LLM execution.
 * No side effects — delegates execution to a caller-provided StageExecutor.
 *
 * @module domain/pipeline
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$prompts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/prompts.ts [instrumentation] (ecmascript)");
;
// ---------------------------------------------------------------------------
// Pipeline templates per task type
// ---------------------------------------------------------------------------
const TASK_STAGES = {
    code: [
        {
            name: "plan",
            fitnessTier: "best-reasoning"
        },
        {
            name: "execute",
            fitnessTier: "cheapest"
        },
        {
            name: "reflect",
            fitnessTier: "moderate"
        },
        {
            name: "fix",
            fitnessTier: "cheapest"
        }
    ],
    math: [
        {
            name: "execute",
            fitnessTier: "best-reasoning"
        },
        {
            name: "reflect",
            fitnessTier: "moderate"
        }
    ],
    reasoning: [
        {
            name: "execute",
            fitnessTier: "best-reasoning"
        },
        {
            name: "reflect",
            fitnessTier: "moderate"
        }
    ],
    creative: [
        {
            name: "execute",
            fitnessTier: "moderate"
        },
        {
            name: "reflect",
            fitnessTier: "best-reasoning"
        }
    ],
    medium: [
        {
            name: "execute",
            fitnessTier: "moderate"
        }
    ],
    simple: [
        {
            name: "execute",
            fitnessTier: "cheapest"
        }
    ]
};
function buildPipelineConfig(request, taskType) {
    const stageNames = TASK_STAGES[taskType] ?? TASK_STAGES.simple;
    return {
        request,
        taskType,
        stages: stageNames
    };
}
const JSON_BLOCK_RE = /```(?:json)?\s*([\s\S]*?)```/;
const JSON_OBJECT_RE = /\{[\s\S]*\}/;
function parseReflectJson(text) {
    if (!text || typeof text !== "string") return null;
    let jsonStr = text.trim();
    // Try extracting from markdown code block first
    const blockMatch = jsonStr.match(JSON_BLOCK_RE);
    if (blockMatch) {
        jsonStr = blockMatch[1].trim();
    } else {
        // Try extracting raw JSON object
        const objectMatch = jsonStr.match(JSON_OBJECT_RE);
        if (objectMatch) {
            jsonStr = objectMatch[0];
        }
    }
    try {
        const parsed = JSON.parse(jsonStr);
        if (typeof parsed !== "object" || parsed === null) return null;
        if (parsed.status === "pass" && typeof parsed.confirmation === "string") {
            return {
                status: "pass",
                confirmation: parsed.confirmation
            };
        }
        if (parsed.status === "fail") {
            const issues = Array.isArray(parsed.issues) ? parsed.issues.filter((i)=>typeof i === "string") : [];
            const corrected = typeof parsed.corrected === "string" ? parsed.corrected : "";
            return {
                status: "fail",
                issues,
                corrected
            };
        }
        return null;
    } catch  {
        return null;
    }
}
// ---------------------------------------------------------------------------
// Pipeline execution
// ---------------------------------------------------------------------------
async function executeStage(stage, request, context, executor) {
    const rendered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$prompts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["renderPrompt"])(stage.name, {
        original_request: request,
        ...context
    });
    const system = stage.systemOverride ?? rendered.system;
    const messages = [
        {
            role: "system",
            content: system
        },
        {
            role: "user",
            content: rendered.user
        }
    ];
    const start = Date.now();
    try {
        const result = await executor({
            messages,
            stream: false,
            fitnessTier: stage.fitnessTier
        });
        return {
            stage: stage.name,
            text: result.text,
            provider: result.provider,
            latencyMs: Date.now() - start,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens
        };
    } catch (err) {
        return {
            stage: stage.name,
            text: "",
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : String(err)
        };
    }
}
async function executePipeline(config, executor) {
    const { stages, request } = config;
    const results = [];
    let fallback = false;
    let reflectVerdict = null;
    let context = {};
    for(let i = 0; i < stages.length; i++){
        const stage = stages[i];
        // Skip fix if reflect passed
        if (stage.name === "fix" && reflectVerdict === "pass") {
            results.push({
                stage: "fix",
                text: "",
                latencyMs: 0,
                skipped: true
            });
            continue;
        }
        const result = await executeStage(stage, request, context, executor);
        results.push(result);
        // If a stage errored, mark fallback and break
        if (result.error) {
            fallback = true;
            break;
        }
        // Thread context forward
        if (stage.name === "plan") {
            context.plan_context = result.text;
        } else if (stage.name === "execute") {
            context.execution_response = result.text;
        } else if (stage.name === "reflect") {
            context.reflection_response = result.text;
            const parsed = parseReflectJson(result.text);
            if (parsed === null) {
                // Parse failure → conservative fail
                reflectVerdict = "fail";
            } else {
                reflectVerdict = parsed.status;
                if (parsed.status === "fail" && parsed.corrected) {
                    context.execution_response = parsed.corrected;
                }
            }
        } else if (stage.name === "fix") {
            context.execution_response = result.text;
        }
    }
    // Pick best available output: fix > reflect-corrected > execute > last successful
    const fixResult = results.find((r)=>r.stage === "fix" && !r.skipped && !r.error);
    const executeResult = results.find((r)=>r.stage === "execute" && !r.error);
    const lastSuccessful = [
        ...results
    ].reverse().find((r)=>!r.error && !r.skipped);
    const bestText = fixResult?.text || reflectVerdict === "fail" && context.execution_response || executeResult?.text || lastSuccessful?.text || "";
    return {
        text: bestText,
        stages: results,
        fallback,
        reflectVerdict
    };
}
}),
"[project]/src/middleware/promptInjectionGuard.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createInjectionGuard",
    ()=>createInjectionGuard,
    "withInjectionGuard",
    ()=>withInjectionGuard
]);
/**
 * Prompt Injection Guard — Express/Next.js middleware
 *
 * Legacy middleware facade that now delegates to the guardrail system.
 *
 * @module middleware/promptInjectionGuard
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$promptInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/promptInjection.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/guardrails/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cors.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function createInjectionGuard(options = {}) {
    /**
   * Check a request body for prompt injection.
   *
   * @param {Object} body - The parsed request body
   * @returns {{ blocked: boolean, result: Object }}
   */ return function guardRequest(body) {
        if (!body || typeof body !== "object") {
            return {
                blocked: false,
                result: {
                    flagged: false,
                    detections: [],
                    piiDetections: []
                }
            };
        }
        const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$promptInjection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["evaluatePromptInjection"])(body, options, {
            disabledGuardrails: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$guardrails$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDisabledGuardrails"])({
                body
            }),
            log: options.logger || console
        });
        return {
            blocked: decision.blocked,
            result: decision.result
        };
    };
}
function withInjectionGuard(handler, options = {}) {
    const guard = createInjectionGuard(options);
    return async function guardedHandler(request, context) {
        // Only apply to POST/PUT/PATCH
        if (![
            "POST",
            "PUT",
            "PATCH"
        ].includes(request.method)) {
            return handler(request, context);
        }
        // Hoist parsed body so it can be threaded to the downstream handler (#4041).
        let parsedBody = null;
        try {
            // Clone request so body can still be read by handler
            const cloned = request.clone();
            parsedBody = await cloned.json().catch(()=>null);
            if (parsedBody) {
                const { blocked, result } = guard(parsedBody);
                if (blocked) {
                    return new Response(JSON.stringify({
                        error: {
                            message: "Request blocked: potential prompt injection detected",
                            type: "injection_detected",
                            code: "SECURITY_001",
                            detections: result.detections.length
                        }
                    }), {
                        status: 400,
                        headers: {
                            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cors$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CORS_HEADERS"],
                            "Content-Type": "application/json"
                        }
                    });
                }
                // Attach sanitization result as header for downstream handlers.
                // Web Request headers may be immutable — never let this throw into the
                // outer security-check path (issue #8095).
                if (result.flagged) {
                    try {
                        request.headers.set("X-Injection-Flagged", "true");
                        request.headers.set("X-Injection-Detections", String(result.detections.length));
                    } catch  {
                    // immutable headers: detection still applied; metadata is best-effort
                    }
                }
            }
        } catch (error) {
            console.error("[SECURITY] Injection guard error:", error);
            return new Response(JSON.stringify({
                error: "Security check failed"
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        // Thread the already-parsed body to the handler as a third argument so downstream
        // handlers (e.g. /v1/responses) can reuse it without re-cloning+re-parsing the
        // request on the hot path (#4041). Handlers that don't accept a preParsedBody
        // simply ignore the extra argument — no signature change required for other routes.
        return handler(request, context, parsedBody);
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
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
"[project]/src/models/index.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
// Database Models - Export all from localDb
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_1qtdfz3._.js.map