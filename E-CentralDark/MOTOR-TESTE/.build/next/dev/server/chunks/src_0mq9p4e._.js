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
];

//# sourceMappingURL=src_0mq9p4e._.js.map