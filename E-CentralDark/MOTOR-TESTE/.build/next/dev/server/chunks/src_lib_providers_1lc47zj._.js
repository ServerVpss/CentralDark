module.exports = [
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
"[project]/src/lib/providers/imageValidation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateImageProviderApiKey",
    ()=>validateImageProviderApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const IMAGE_PROVIDER_VALIDATION_ENDPOINTS = {
    "fal-ai": {
        baseUrl: "https://api.fal.ai",
        path: "/v1/models?limit=1"
    },
    "stability-ai": {
        path: "/v1/user/account"
    },
    "black-forest-labs": {
        path: "/v1/credits"
    },
    recraft: {
        path: "/v1/users/me"
    },
    topaz: {
        path: "/account/v1/credits/balance"
    }
};
function normalizeBaseUrl(baseUrl) {
    return (baseUrl || "").trim().replace(/\/$/, "");
}
function applyCustomUserAgent(headers, providerSpecificData = {}) {
    const customUserAgent = typeof providerSpecificData?.customUserAgent === "string" ? providerSpecificData.customUserAgent.trim() : "";
    if (customUserAgent) {
        headers["user-agent"] = customUserAgent;
    }
    return headers;
}
function toValidationErrorResult(error) {
    const message = error instanceof Error ? error.message : String(error || "Validation failed");
    const statusCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSafeOutboundFetchErrorStatus"])(error);
    return {
        valid: false,
        error: message || "Validation failed",
        unsupported: false,
        ...statusCode ? {
            statusCode
        } : {},
        ...error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "TIMEOUT" ? {
            timeout: true
        } : {},
        ...statusCode === 400 ? {
            securityBlocked: true
        } : {}
    };
}
function buildImageProviderValidationHeaders(imageProvider, apiKey, providerSpecificData = {}) {
    const headers = {
        Accept: "application/json"
    };
    if (apiKey) {
        switch(String(imageProvider?.authHeader || "").toLowerCase()){
            case "bearer":
                headers.Authorization = `Bearer ${apiKey}`;
                break;
            case "key":
                headers.Authorization = `Key ${apiKey}`;
                break;
            case "x-key":
                headers["x-key"] = apiKey;
                break;
            case "x-api-key":
                headers["X-API-Key"] = apiKey;
                break;
            case "none":
                break;
            default:
                headers.Authorization = `Bearer ${apiKey}`;
                break;
        }
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
async function validationRead(url, init) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationRead,
        guard: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderOutboundGuard"])(),
        ...init
    });
}
async function validateImageProviderApiKey({ provider, apiKey, providerSpecificData = {} }) {
    const imageProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getImageProvider"])(provider);
    const validationConfig = IMAGE_PROVIDER_VALIDATION_ENDPOINTS[provider];
    if (!imageProvider || !validationConfig) {
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    }
    try {
        const baseUrl = normalizeBaseUrl(providerSpecificData?.baseUrl || validationConfig.baseUrl || imageProvider.baseUrl);
        const url = `${baseUrl}${validationConfig.path}`;
        const response = await validationRead(url, {
            method: validationConfig.method || "GET",
            headers: buildImageProviderValidationHeaders(imageProvider, apiKey, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "image-provider"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key",
                method: "image-provider"
            };
        }
        if (response.status === 429) {
            return {
                valid: false,
                error: "Validation rate limited (429)",
                method: "image-provider"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`,
                method: "image-provider"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`,
            method: "image-provider"
        };
    } catch (error) {
        return toValidationErrorResult(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GEMINI_LIKE_FORMATS",
    ()=>GEMINI_LIKE_FORMATS,
    "OPENAI_LIKE_FORMATS",
    ()=>OPENAI_LIKE_FORMATS,
    "addModelsSuffix",
    ()=>addModelsSuffix,
    "normalizeAnthropicBaseUrl",
    ()=>normalizeAnthropicBaseUrl,
    "normalizeAzureOpenAIBaseUrl",
    ()=>normalizeAzureOpenAIBaseUrl,
    "normalizeBaseUrl",
    ()=>normalizeBaseUrl,
    "normalizeClaudeCodeCompatibleBaseUrl",
    ()=>normalizeClaudeCodeCompatibleBaseUrl,
    "normalizeDatabricksChatUrl",
    ()=>normalizeDatabricksChatUrl,
    "normalizeGigachatChatUrl",
    ()=>normalizeGigachatChatUrl,
    "normalizeHerokuChatUrl",
    ()=>normalizeHerokuChatUrl,
    "normalizeSnowflakeChatUrl",
    ()=>normalizeSnowflakeChatUrl,
    "resolveBaseUrl",
    ()=>resolveBaseUrl,
    "resolveChatUrl",
    ()=>resolveChatUrl
]);
// URL/format normalizers for provider key validation. Pure string helpers extracted from
// validation.ts (god-file decomposition): no I/O, no side effects — they only shape base URLs
// and chat endpoints per provider format. Behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const OPENAI_LIKE_FORMATS = new Set([
    "openai",
    "openai-responses"
]);
const GEMINI_LIKE_FORMATS = new Set([
    "gemini"
]);
function normalizeBaseUrl(baseUrl) {
    // Guard against a non-string baseUrl reaching .trim() / .replace() — see #2463
    // where NVIDIA NIM validation surfaced as `e.startsWith is not a function`
    // after the bundler renamed `baseUrl` to `e`. Any malformed providerSpecificData
    // (e.g. saved as object from a UI bug) would otherwise crash mid-validation.
    const value = typeof baseUrl === "string" ? baseUrl : "";
    return value.trim().replace(/\/$/, "");
}
function normalizeAzureOpenAIBaseUrl(baseUrl) {
    return normalizeBaseUrl(baseUrl).replace(/\/openai$/i, "").replace(/\/openai\/deployments\/[^/]+\/chat\/completions.*$/i, "");
}
function normalizeAnthropicBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripAnthropicMessagesSuffix"])(baseUrl || "");
}
function normalizeClaudeCodeCompatibleBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripClaudeCodeCompatibleEndpointSuffix"])(baseUrl || "");
}
function addModelsSuffix(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    // Endpoint URLs can carry request-only query flags (for example Kimi Code's
    // `/messages?beta=true`). A models probe targets a sibling path, so preserve
    // only the URL before the query/hash before replacing the endpoint suffix.
    const separatorIndex = normalized.search(/[?#]/);
    const endpoint = separatorIndex === -1 ? normalized : normalized.slice(0, separatorIndex);
    const suffixes = [
        "/chat/completions",
        "/responses",
        "/chat",
        "/messages"
    ];
    if (endpoint.endsWith("/models")) {
        return endpoint;
    }
    for (const suffix of suffixes){
        if (endpoint.endsWith(suffix)) {
            return `${endpoint.slice(0, -suffix.length)}/models`;
        }
    }
    return `${endpoint}/models`;
}
function resolveBaseUrl(entry, providerSpecificData = {}) {
    if (providerSpecificData?.baseUrl) return normalizeBaseUrl(providerSpecificData.baseUrl);
    if (entry?.baseUrl) return normalizeBaseUrl(entry.baseUrl);
    return "";
}
function resolveChatUrl(provider, baseUrl, providerSpecificData = {}) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(provider)) {
        if (providerSpecificData?.chatPath) {
            return `${normalized}${providerSpecificData.chatPath}`;
        }
        if (providerSpecificData?.apiType === "responses") {
            return `${normalized}/responses`;
        }
        return `${normalized}/chat/completions`;
    }
    if (normalized.endsWith("/chat/completions") || normalized.endsWith("/responses") || normalized.endsWith("/chat")) {
        return normalized;
    }
    if (normalized.endsWith("/v1")) {
        return `${normalized}/chat/completions`;
    }
    return normalized;
}
function normalizeHerokuChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    return normalized.endsWith("/v1/chat/completions") ? normalized : `${normalized}/v1/chat/completions`;
}
function normalizeDatabricksChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    return normalized.endsWith("/chat/completions") ? normalized : `${normalized}/chat/completions`;
}
function normalizeSnowflakeChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl).replace(/\/cortex\/inference:complete$/, "").replace(/\/api\/v2$/, "");
    if (!normalized) return "";
    return `${normalized}/api/v2/cortex/inference:complete`;
}
function normalizeGigachatChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl).replace(/\/chat\/completions$/, "");
    if (!normalized) return "";
    return `${normalized}/chat/completions`;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API",
    ()=>WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API,
    "fetchWithProxyFallback",
    ()=>fetchWithProxyFallback,
    "isRetryableProxyTarget",
    ()=>isRetryableProxyTarget,
    "isSecurityBlockError",
    ()=>isSecurityBlockError,
    "toValidationErrorResult",
    ()=>toValidationErrorResult,
    "toWebCookieValidationErrorResult",
    ()=>toWebCookieValidationErrorResult,
    "validationRead",
    ()=>validationRead,
    "validationWrite",
    ()=>validationWrite
]);
// Outbound fetch wrappers for provider validation: proxy-fallback, SSRF-aware proxy targeting, and
// error→result mapping. Extracted from validation.ts (god-file decomposition). Behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/proxyAutoSelector.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function fetchWithProxyFallback(url, init, presets, isLocal) {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            ...presets,
            guard: isLocal ? "none" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderValidationGuard"])(),
            ...init
        });
    } catch (err) {
        // Only attempt proxy fallback for retryable errors (network / timeout)
        // and only when the target is not a local / LAN address.
        const fetchErr = err;
        const isNetworkIssue = fetchErr?.code === "NETWORK_ERROR" || fetchErr?.code === "TIMEOUT";
        const isRetryable = fetchErr?.isRetryable !== false;
        const isValidTarget = !isLocal && isRetryableProxyTarget(url);
        if (isLocal || !isNetworkIssue || !isRetryable) throw err;
        if (!isValidTarget) throw err;
        const proxyUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectProxyForValidation"])(url);
        if (!proxyUrl) throw err;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            ...presets,
            guard: isLocal ? "none" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderValidationGuard"])(),
            ...init,
            proxyConfig: proxyUrl
        });
    }
}
function isRetryableProxyTarget(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        // Never proxy-fallback to a private/link-local/metadata host. Delegates to
        // the canonical SSRF guard (covers 169.254, 0.0.0.0, 172.16/12, CGNAT,
        // IPv6 fc/fd/fe80, .internal — gaps the previous inline check missed).
        return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPrivateHost"])(hostname);
    } catch  {
        return false;
    }
}
async function validationRead(url, init, isLocal = false) {
    return fetchWithProxyFallback(url, init, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationRead, isLocal);
}
async function validationWrite(url, init, isLocal = false) {
    return fetchWithProxyFallback(url, init, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationWrite, isLocal);
}
function isSecurityBlockError(error) {
    if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"])) return false;
    if (error.code === "URL_GUARD_BLOCKED" || error.code === "INVALID_URL") return true;
    if (error.code === "REDIRECT_BLOCKED") {
        if (!error.location) return false;
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isPrivateHost"])(new URL(error.location, error.url).hostname);
        } catch  {
            return false;
        }
    }
    return false;
}
// #7542 — web-cookie providers whose registry `baseUrl` is a POST-only streaming/completion
// endpoint (no real `/models` listing API), so the generic `/models` probe in
// validateWebCookieProvider() gets a redirect instead of a definitive 200/401/403. A blocked
// redirect there is not a session-expiry signal — the endpoint just isn't shaped for the probe
// — so it should degrade to "unsupported" the same way the discovery path already does for
// REDIRECT_BLOCKED (#6267's buildDiscoveryErrorFallbackResponse).
//
// Scoped to `lmarena` only (root-caused and regression-tested for #7542): the other web-cookie
// providers sharing a POST-only baseUrl shape (doubao-web, huggingchat, yuanbao-web,
// zenmux-free, zai-web) have not been individually verified to actually redirect on this probe
// rather than 404/405 — do not add them here without a proven repro per provider (see
// #7542 plan-file, "Risks").
const WEB_COOKIE_PROVIDERS_WITH_UNRELIABLE_MODELS_PROBE = new Set([
    "lmarena"
]);
const WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API = new Set([
    "huggingchat",
    "chatgpt-web",
    "grok-web",
    "notion-web",
    "t3-web",
    "yuanbao-web",
    "copilot-web",
    "copilot-m365-web"
]);
function toWebCookieValidationErrorResult(provider, error) {
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "REDIRECT_BLOCKED" && WEB_COOKIE_PROVIDERS_WITH_UNRELIABLE_MODELS_PROBE.has(provider)) {
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    }
    return toValidationErrorResult(error);
}
function toValidationErrorResult(error) {
    const message = error instanceof Error ? error.message : String(error || "Validation failed");
    const statusCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSafeOutboundFetchErrorStatus"])(error);
    return {
        valid: false,
        error: message || "Validation failed",
        unsupported: false,
        ...statusCode ? {
            statusCode
        } : {},
        ...error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "TIMEOUT" ? {
            timeout: true
        } : {},
        ...isSecurityBlockError(error) ? {
            securityBlocked: true
        } : {}
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "STANDARD_USER_AGENT",
    ()=>STANDARD_USER_AGENT,
    "applyCustomUserAgent",
    ()=>applyCustomUserAgent,
    "buildBearerHeaders",
    ()=>buildBearerHeaders,
    "buildClarifaiHeaders",
    ()=>buildClarifaiHeaders,
    "buildKeyHeaders",
    ()=>buildKeyHeaders,
    "buildRekaHeaders",
    ()=>buildRekaHeaders,
    "buildTokenHeaders",
    ()=>buildTokenHeaders,
    "directHttpsRequest",
    ()=>directHttpsRequest,
    "getCustomUserAgent",
    ()=>getCustomUserAgent,
    "withCustomUserAgent",
    ()=>withCustomUserAgent
]);
// Request-header builders + custom-UA handling + a direct (proxy-bypassing) HTTPS helper, extracted
// from validation.ts (god-file decomposition). Pure header construction except directHttpsRequest,
// which delegates to safeOutboundFetch with bypassProxyPatch. Behavior is byte-identical.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const STANDARD_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
function getCustomUserAgent(providerSpecificData = {}) {
    if (typeof providerSpecificData?.customUserAgent !== "string") return null;
    const customUserAgent = providerSpecificData.customUserAgent.trim();
    return customUserAgent || null;
}
function applyCustomUserAgent(headers, providerSpecificData = {}) {
    const customUserAgent = getCustomUserAgent(providerSpecificData);
    if (!customUserAgent) return headers;
    headers["User-Agent"] = customUserAgent;
    if ("user-agent" in headers) {
        headers["user-agent"] = customUserAgent;
    }
    return headers;
}
function withCustomUserAgent(init, providerSpecificData = {}) {
    return {
        ...init,
        headers: applyCustomUserAgent({
            ...init.headers || {}
        }, providerSpecificData)
    };
}
function directHttpsRequest(url, options, timeoutMs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        timeoutMs,
        bypassProxyPatch: true,
        allowRedirect: false,
        guard: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderValidationGuard"])(),
        retry: false
    }).then(async (response)=>({
            status: response.status,
            ok: response.ok,
            text: async ()=>await response.text()
        }));
}
function buildBearerHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildRekaHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
        headers["X-Api-Key"] = apiKey;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildClarifaiHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Key ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildKeyHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Key ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildTokenHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Token ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/webCookieAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGrokCookieHeader",
    ()=>buildGrokCookieHeader,
    "buildQwenCookieHeader",
    ()=>buildQwenCookieHeader,
    "extractCookieValue",
    ()=>extractCookieValue,
    "extractKimiAccessToken",
    ()=>extractKimiAccessToken,
    "extractKimiJwt",
    ()=>extractKimiJwt,
    "extractQwenToken",
    ()=>extractQwenToken,
    "normalizeSessionCookieHeader",
    ()=>normalizeSessionCookieHeader,
    "normalizeSessionCookieHeaders",
    ()=>normalizeSessionCookieHeaders,
    "stripCookieInputPrefix",
    ()=>stripCookieInputPrefix
]);
function stripCookieInputPrefix(rawValue) {
    const trimmed = (rawValue || "").trim();
    if (!trimmed) return "";
    const withoutBearer = trimmed.replace(/^bearer\s+/i, "");
    return withoutBearer.replace(/^cookie:/i, "").trim();
}
function normalizeSessionCookieHeader(rawValue, defaultCookieName) {
    const normalized = stripCookieInputPrefix(rawValue);
    if (!normalized) return "";
    if (normalized.includes("=")) {
        return normalized;
    }
    return `${defaultCookieName}=${normalized}`;
}
function extractCookieValue(rawValue, cookieName) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed) return "";
    if (trimmed.includes(";")) {
        const escaped = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = trimmed.match(new RegExp("(?:^|;\\s*)" + escaped + "=([^;\\s]+)"));
        return match ? match[1] : "";
    }
    const prefix = `${cookieName}=`;
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
    return trimmed;
}
function buildGrokCookieHeader(rawValue) {
    const sso = extractCookieValue(rawValue, "sso");
    if (!sso) return "";
    const parts = [
        `sso=${sso}`
    ];
    for (const name of [
        "sso-rw",
        "cf_clearance",
        "__cf_bm"
    ]){
        if (new RegExp("(?:^|;\\s*)" + name + "=").test(rawValue)) {
            const value = extractCookieValue(rawValue, name);
            if (value) parts.push(`${name}=${value}`);
        }
    }
    return parts.join("; ");
}
function buildQwenCookieHeader(rawValue) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed || !trimmed.includes("=")) return "";
    return trimmed;
}
function extractQwenToken(rawValue) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed) return "";
    if (!trimmed.includes("=")) return trimmed;
    const match = trimmed.match(/(?:^|;\s*)token=([^;\s]+)/);
    return match ? match[1] : "";
}
function extractKimiAccessToken(rawValue) {
    const raw = String(rawValue ?? "").trim();
    if (!raw) return "";
    const bearer = raw.match(/^(?:authorization:\s*)?bearer\s+([^;\s]+)/i);
    if (bearer) return bearer[1];
    const trimmed = stripCookieInputPrefix(raw);
    for (const key of [
        "access_token",
        "kimi-auth"
    ]){
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = trimmed.match(new RegExp(`(?:^|[\\s;])${escaped}=([^;\\s]+)`));
        if (match) return match[1];
    }
    return !trimmed.includes("=") && !trimmed.includes(";") ? trimmed : "";
}
function extractKimiJwt(rawValue) {
    return extractKimiAccessToken(rawValue);
}
function normalizeSessionCookieHeaders(rawValues, defaultCookieName) {
    const seen = new Set();
    const normalizedHeaders = [];
    for (const rawValue of rawValues){
        if (typeof rawValue !== "string") continue;
        const normalized = normalizeSessionCookieHeader(rawValue, defaultCookieName);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        normalizedHeaders.push(normalized);
    }
    return normalizedHeaders;
}
}),
"[project]/src/lib/providers/validation/webProvidersA.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// Web-cookie provider key validators (part A): deepseek-web, qwen-web, grok-web, chatgpt-web,
// perplexity-web, blackbox-web. Extracted from validation.ts (god-file decomposition) — top-level
// functions with no dispatcher-state captures; behavior is byte-identical to the original inline defs.
__turbopack_context__.s([
    "isGrokAntiBotBlock",
    ()=>isGrokAntiBotBlock,
    "validateBlackboxWebProvider",
    ()=>validateBlackboxWebProvider,
    "validateChatGptWebProvider",
    ()=>validateChatGptWebProvider,
    "validateDeepSeekWebProvider",
    ()=>validateDeepSeekWebProvider,
    "validateGrokWebProvider",
    ()=>validateGrokWebProvider,
    "validateKimiWebProvider",
    ()=>validateKimiWebProvider,
    "validatePerplexityWebProvider",
    ()=>validatePerplexityWebProvider,
    "validateQwenWebProvider",
    ()=>validateQwenWebProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/webCookieAuth.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function validateKimiWebProvider({ apiKey }) {
    const rawCred = String(apiKey ?? "").trim();
    if (!rawCred) {
        return {
            valid: false,
            error: "Missing Kimi access_token from www.kimi.com localStorage"
        };
    }
    const accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractKimiAccessToken"])(rawCred);
    if (!accessToken) {
        return {
            valid: false,
            error: "Could not find a Kimi access_token. Re-login at https://www.kimi.com and copy it from localStorage."
        };
    }
    try {
        const resp = await fetch("https://www.kimi.com/api/user", {
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: `Bearer ${accessToken}`,
                Origin: "https://www.kimi.com",
                Referer: "https://www.kimi.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
            }
        });
        if (resp.status === 401 || resp.status === 403) {
            return {
                valid: false,
                error: "Kimi session is invalid or expired — re-login at https://www.kimi.com and paste a fresh access_token"
            };
        }
        if (!resp.ok) {
            return {
                valid: false,
                error: `Kimi returned HTTP ${resp.status}`
            };
        }
        // Profile response: `{ id, name, email, region, ... }` at the top level.
        try {
            const data = await resp.json();
            if (!data?.id) {
                return {
                    valid: false,
                    error: "Kimi session token is invalid or expired — re-login at https://www.kimi.com and paste a fresh access_token"
                };
            }
        } catch  {
            return {
                valid: false,
                error: "Kimi returned invalid JSON response"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateDeepSeekWebProvider({ apiKey }) {
    if (!apiKey) {
        return {
            valid: false,
            error: "Missing userToken — paste the value from DevTools → Application → Local Storage → chat.deepseek.com → userToken"
        };
    }
    let token = apiKey;
    try {
        const parsed = JSON.parse(token);
        if (typeof parsed?.value === "string") token = parsed.value;
    } catch  {
    // not JSON, use as-is
    }
    try {
        const resp = await fetch("https://chat.deepseek.com/api/v0/users/current", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "*/*",
                Origin: "https://chat.deepseek.com",
                Referer: "https://chat.deepseek.com/",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                // Match the current chat.deepseek.com web client (v2.0.0): the legacy
                // X-App-Version build stamp was dropped, X-Client-Bundle-Id was added.
                // Keep aligned with FAKE_HEADERS in open-sse/executors/deepseek-web.ts.
                "X-Client-Bundle-Id": "com.deepseek.chat",
                "X-Client-Platform": "web",
                "X-Client-Version": "2.0.0"
            }
        });
        if (resp.status === 401 || resp.status === 403) {
            return {
                valid: false,
                error: "userToken is invalid or expired — get a fresh one from localStorage"
            };
        }
        if (!resp.ok) {
            return {
                valid: false,
                error: `DeepSeek returned HTTP ${resp.status}`
            };
        }
        const json = await resp.json();
        const bizData = json?.data?.biz_data || json?.biz_data;
        if (!bizData?.token) {
            return {
                valid: false,
                error: `DeepSeek did not return an access token: ${json?.msg || "unknown error"}`
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateQwenWebProvider({ apiKey }) {
    const rawCred = String(apiKey ?? "").trim();
    if (!rawCred) {
        return {
            valid: false,
            error: "Missing Qwen session — paste the full chat.qwen.ai Cookie header (must include token, cna and ssxmod_itna)"
        };
    }
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractQwenToken"])(rawCred);
    const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildQwenCookieHeader"])(rawCred);
    if (!token && !cookieHeader) {
        return {
            valid: false,
            error: "Could not find a Qwen token/cookie in the pasted value"
        };
    }
    try {
        const headers = {
            Accept: "*/*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            Origin: "https://chat.qwen.ai",
            Referer: "https://chat.qwen.ai/",
            source: "web",
            "bx-v": "2.5.36",
            // The Qwen SPA's `version` header is required by the v2 chat completion
            // endpoint; the validator sends it too so the probe matches a real
            // browser request as closely as possible. (The session probe endpoint
            // doesn't enforce it, but consistency with the executor avoids surprises
            // if Qwen ever tightens its WAF rules.)
            version: "0.2.66"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (cookieHeader) headers["Cookie"] = cookieHeader;
        // The trailing slash is significant: `/api/v1/auths` (no slash) answers 401,
        // `/api/v1/auths/` returns the user profile.
        const resp = await fetch("https://chat.qwen.ai/api/v1/auths/", {
            headers
        });
        const contentType = resp.headers.get("content-type") || "";
        if (resp.status === 401 || resp.status === 403) {
            return {
                valid: false,
                error: "Qwen session is invalid or expired — re-login at https://chat.qwen.ai and paste a fresh full Cookie header"
            };
        }
        // Alibaba's WAF / retired-v1 gateway answers with an HTML challenge page (or 504)
        // instead of JSON. A bearer token alone is no longer enough for the v2 endpoint.
        if (contentType.includes("text/html") || resp.status === 504) {
            return {
                valid: false,
                error: "Qwen blocked the request with its anti-bot WAF. Re-login at https://chat.qwen.ai and paste a fresh full Cookie header (must include cna, ssxmod_itna and token) — a bearer token alone is not accepted."
            };
        }
        if (!resp.ok) {
            return {
                valid: false,
                error: `Qwen returned HTTP ${resp.status}`
            };
        }
        // Parse JSON response and verify we have a real user object.
        // /api/v1/auths/ returns the user at the top level: {id, email, name, role, ...}.
        // We require `id` to be a non-empty string AND look like a real identifier
        // (uuid-ish or otherwise ≥8 chars) to avoid false-positives from upstream
        // error envelopes that happen to ship a top-level `id: "not_found"` style
        // field. Keep the legacy nested checks (data.user, user) for robustness in
        // case the upstream shape changes again.
        try {
            const data = await resp.json();
            const hasTopLevelUser = typeof data?.id === "string" && data.id.length >= 8 && typeof data?.email === "string";
            const hasNestedUser = typeof data?.user?.id === "string" && data.user.id.length > 0 || typeof data?.data?.user?.id === "string" && data.data.user.id.length > 0;
            if (!hasTopLevelUser && !hasNestedUser) {
                return {
                    valid: false,
                    error: "Qwen session token is invalid or expired — re-login at https://chat.qwen.ai and paste a fresh full Cookie header"
                };
            }
        } catch (parseError) {
            return {
                valid: false,
                error: "Qwen returned invalid JSON response"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function isGrokAntiBotBlock(body) {
    const text = (body || "").trim();
    if (!text) return true; // empty 403 body — pre-auth block, treat as anti-bot
    if (/anti-bot|forbidden|access denied|blocked|rate.?limit/i.test(text)) return true;
    // A structured upstream API error has a parseable JSON `error.message`; if one
    // is present this is a real upstream error, not an anti-bot block.
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed?.error?.message === "string") return false;
    } catch  {
        // Non-JSON 403 body with no recognizable structure → treat as anti-bot block.
        return true;
    }
    return false;
}
// Shared IP-reputation / anti-bot guidance (#3474, #5350). The request was rejected
// before (or independently of) auth — the cookie itself is likely fine. cf_clearance
// is pinned to the IP + TLS fingerprint + User-Agent that earned it and cannot be
// replayed from a different machine/IP, so an auth-shaped rejection after a
// cf_clearance was supplied is almost always this block, not a bad cookie.
const GROK_IP_REPUTATION_GUIDANCE = "Your sso cookie is likely fine — this is an IP-reputation block on the request, not an " + "auth failure. cf_clearance is pinned to the IP + TLS fingerprint + User-Agent that earned " + "it and cannot be replayed from a different machine/IP. Retry from a residential IP or " + "configure a proxy for grok-web.";
async function validateGrokWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractCookieValue"])(apiKey, "sso");
        if (!token) {
            return {
                valid: false,
                error: "Missing sso cookie — paste the value (or the full grok.com cookie line)"
            };
        }
        // Use the TLS-impersonating client — Cloudflare on grok.com pins
        // cf_clearance to JA3/JA4 + HTTP/2 SETTINGS, so plain Node fetch always
        // gets "Request rejected by anti-bot rules." regardless of cookies (#3180).
        const { tlsFetchGrok, TlsClientUnavailableError, isCloudflareChallenge } = await __turbopack_context__.A("[project]/open-sse/services/grokTlsClient.ts [instrumentation] (ecmascript, async loader)");
        // Generate the same Cloudflare-bypass headers the GrokWebExecutor uses.
        const randomHex = (n)=>{
            const a = new Uint8Array(n);
            crypto.getRandomValues(a);
            return Array.from(a, (b)=>b.toString(16).padStart(2, "0")).join("");
        };
        const statsigMsg = `e:TypeError: Cannot read properties of null (reading 'children')`;
        const traceId = randomHex(16);
        const spanId = randomHex(8);
        let response;
        try {
            response = await tlsFetchGrok("https://grok.com/rest/app-chat/conversations/new", {
                method: "POST",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-US,en;q=0.9",
                    Baggage: "sentry-environment=production,sentry-release=d6add6fb0460641fd482d767a335ef72b9b6abb8,sentry-public_key=b311e0f2690c81f25e2c4cf6d4f7ce1c",
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/json",
                    Cookie: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGrokCookieHeader"])(apiKey),
                    Origin: "https://grok.com",
                    Pragma: "no-cache",
                    Referer: "https://grok.com/",
                    "Sec-Ch-Ua": '"Google Chrome";v="149", "Chromium";v="149", "Not(A:Brand";v="24"',
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": '"macOS"',
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                    "x-statsig-id": btoa(statsigMsg),
                    "x-xai-request-id": crypto.randomUUID(),
                    traceparent: `00-${traceId}-${spanId}-00`
                }, providerSpecificData),
                body: JSON.stringify({
                    temporary: true,
                    modeId: "fast",
                    message: "test",
                    fileAttachments: [],
                    imageAttachments: [],
                    disableSearch: true,
                    enableImageGeneration: false,
                    returnImageBytes: false,
                    returnRawGrokInXaiRequest: false,
                    enableImageStreaming: false,
                    imageGenerationCount: 0,
                    forceConcise: true,
                    toolOverrides: {},
                    enableSideBySide: false,
                    sendFinalMetadata: false,
                    isReasoning: false,
                    disableTextFollowUps: true,
                    disableMemory: true,
                    forceSideBySide: false,
                    isAsyncChat: false,
                    disableSelfHarmShortCircuit: false
                }),
                timeoutMs: 15_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `TLS impersonation client unavailable: ${err.message}`
                };
            }
            throw err;
        }
        let errorDetail = "";
        try {
            errorDetail = (response.text || "").slice(0, 240);
        } catch  {}
        // Detect Cloudflare challenge pages even with a 200 status from tls-client-node
        if (isCloudflareChallenge(errorDetail)) {
            return {
                valid: false,
                error: "Grok validation blocked by Cloudflare anti-bot. Try a residential IP or proxy."
            };
        }
        if (response.status >= 200 && response.status < 300) {
            return {
                valid: true,
                error: null
            };
        }
        // Did the user actually supply a cf_clearance cookie? Detect it from the raw
        // input blob via a real cookie-pair match — NOT extractCookieValue, which
        // returns the whole bare value for any name when the input has no ";" (#5350).
        const suppliedCfClearance = /(?:^|;\s*)cf_clearance=[^;\s]+/.test(String(apiKey || ""));
        if (response.status === 401) {
            // With a cf_clearance supplied, a 401 is almost always an IP-reputation block
            // (the clearance can't be replayed from a different machine), not a bad cookie.
            if (suppliedCfClearance) {
                return {
                    valid: false,
                    error: `Grok returned 401. ${GROK_IP_REPUTATION_GUIDANCE}`
                };
            }
            return {
                valid: false,
                error: "Invalid SSO cookie — re-paste from grok.com DevTools → Cookies → sso"
            };
        }
        if (response.status === 403) {
            // Grok uses 403 for auth failures, entitlement issues, geo blocks,
            // anti-bot/IP-reputation rejections, and resource errors. Classify before
            // messaging — a misleading "invalid cookie" verdict on an IP-reputation
            // block (issue #3474) sends users chasing a cookie that is actually fine.
            //
            // 1. Auth-shaped → the cookie/session is the problem; re-paste it. But when a
            //    cf_clearance was supplied, this is almost always an IP-reputation block the
            //    edge surfaced as an auth failure — the clearance can't be replayed from a
            //    different machine, so re-pasting the cookie will not help (#5350).
            if (/invalid-credentials|unauthenticated|unauthorized/i.test(errorDetail)) {
                if (suppliedCfClearance) {
                    return {
                        valid: false,
                        error: `Grok returned 403. ${GROK_IP_REPUTATION_GUIDANCE}`
                    };
                }
                return {
                    valid: false,
                    error: "Invalid SSO cookie — re-paste from grok.com DevTools → Cookies → sso"
                };
            }
            // 2. Anti-bot / Cloudflare / IP-reputation block → the cookie is likely
            //    fine; the request was rejected before auth was even evaluated. This is
            //    not code-fixable: the datacenter/VPS IP is flagged. A Cloudflare
            //    challenge body, Grok's "anti-bot rules" rejection, or a bare/non-JSON
            //    forbidden body (no structured upstream `error.message`) all map here.
            if (isCloudflareChallenge(errorDetail) || isGrokAntiBotBlock(errorDetail)) {
                return {
                    valid: false,
                    error: `Grok returned 403 (anti-bot/Cloudflare block). ${GROK_IP_REPUTATION_GUIDANCE}`
                };
            }
            // 3. Structured upstream error (e.g. probe model renamed) → surface the body
            //    so the user/maintainer sees the real cause instead of a wrong verdict.
            return {
                valid: false,
                error: `Grok rejected validation (403)${errorDetail ? `: ${errorDetail.slice(0, 160)}` : ""}`
            };
        }
        if (response.status === 429) {
            return {
                valid: false,
                error: "Grok rate limited during validation (429)"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Grok unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Grok validation failed (${response.status})${errorDetail ? `: ${errorDetail}` : ""}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateChatGptWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Accept bare value, unchunked cookie, chunked (.0/.1) cookies, or full
        // "Cookie: ..." DevTools line. Pass through verbatim once recognised.
        let cookieHeader = String(apiKey || "").trim();
        if (/^cookie\s*:\s*/i.test(cookieHeader)) {
            cookieHeader = cookieHeader.replace(/^cookie\s*:\s*/i, "");
        }
        if (!/__Secure-next-auth\.session-token(?:\.\d+)?\s*=/.test(cookieHeader)) {
            cookieHeader = `__Secure-next-auth.session-token=${cookieHeader}`;
        }
        // Use the TLS-impersonating client — Cloudflare on chatgpt.com pins
        // cf_clearance to JA3/JA4 + HTTP/2 SETTINGS, so plain Node fetch always
        // gets cf-mitigated: challenge regardless of cookies.
        const { tlsFetchChatGpt, TlsClientUnavailableError } = await __turbopack_context__.A("[project]/open-sse/services/chatgptTlsClient.ts [instrumentation] (ecmascript, async loader)");
        let response;
        try {
            response = await tlsFetchChatGpt("https://chatgpt.com/api/auth/session", {
                method: "GET",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Cache-Control": "no-cache",
                    Cookie: cookieHeader,
                    Origin: "https://chatgpt.com",
                    Pragma: "no-cache",
                    Referer: "https://chatgpt.com/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:152.0) Gecko/20100101 Firefox/152.0"
                }, providerSpecificData),
                timeoutMs: 30_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `${err.message} (chatgpt-web requires this — without it, Cloudflare blocks every request)`
                };
            }
            throw err;
        }
        const contentType = response.headers.get("content-type") || "";
        const cfRay = response.headers.get("cf-ray");
        const cfMitigated = response.headers.get("cf-mitigated");
        if (response.status === 401 || response.status === 403) {
            const bodyText = response.text || "";
            if (cfMitigated || /just a moment|cloudflare|cf-chl|attention required/i.test(bodyText)) {
                return {
                    valid: false,
                    error: "Cloudflare blocked the validator — open chatgpt.com in your browser, then copy the FULL Cookie line from DevTools (Network → request → Cookie) including cf_clearance, __cf_bm, _cfuvid, and the session-token chunks."
                };
            }
            return {
                valid: false,
                error: "Invalid ChatGPT session cookie — re-paste __Secure-next-auth.session-token from chatgpt.com DevTools → Cookies"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `ChatGPT unavailable (${response.status})`
            };
        }
        if (response.status >= 400) {
            return {
                valid: false,
                error: `Validation failed: ${response.status}`
            };
        }
        if (!contentType.includes("json")) {
            return {
                valid: false,
                error: `ChatGPT returned non-JSON (${contentType || "no content-type"}${cfRay ? `, cf-ray=${cfRay}` : ""}) — paste the FULL Cookie line including cf_clearance, __cf_bm, _cfuvid alongside the session-token chunks.`
            };
        }
        let data = {};
        try {
            data = JSON.parse(response.text || "{}");
        } catch  {
            return {
                valid: false,
                error: "ChatGPT session response was not JSON — paste the FULL Cookie line including cf_clearance and __cf_bm."
            };
        }
        if (!data?.accessToken) {
            return {
                valid: false,
                error: "ChatGPT session expired — log into chatgpt.com and copy a fresh cookie"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validatePerplexityWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        let sessionToken = apiKey;
        let bearerToken = null;
        if (sessionToken.startsWith("__Secure-next-auth.session-token=")) {
            sessionToken = sessionToken.slice("__Secure-next-auth.session-token=".length);
        } else if (/^bearer\s+/i.test(sessionToken)) {
            bearerToken = sessionToken.replace(/^bearer\s+/i, "").trim();
            sessionToken = "";
        }
        const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
        const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            Origin: "https://www.perplexity.ai",
            Referer: "https://www.perplexity.ai/",
            // Firefox 148 — must match the firefox_148 TLS profile of perplexityTlsClient (issue #2459).
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:152.0) Gecko/20100101 Firefox/152.0",
            "X-App-ApiClient": "default",
            "X-App-ApiVersion": "client-1.11.0",
            ...bearerToken ? {
                Authorization: `Bearer ${bearerToken}`
            } : sessionToken ? {
                Cookie: `__Secure-next-auth.session-token=${sessionToken}`
            } : {}
        }, providerSpecificData);
        // Perplexity is behind Cloudflare Enterprise which pins JA3/JA4 to a real
        // browser handshake — plain fetch is challenged with a 403 page from
        // VPS/datacenter IPs even with a valid cookie. Use the Firefox-fingerprinted
        // TLS client so the validator's verdict reflects the cookie, not the IP (issue #2459).
        const { tlsFetchPerplexity, isCloudflareChallenge, TlsClientUnavailableError } = await __turbopack_context__.A("[project]/open-sse/services/perplexityTlsClient.ts [instrumentation] (ecmascript, async loader)");
        let response;
        try {
            response = await tlsFetchPerplexity("https://www.perplexity.ai/rest/sse/perplexity_ask", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    query_str: "test",
                    params: {
                        query_str: "test",
                        search_focus: "internet",
                        mode: "concise",
                        model_preference: "default",
                        sources: [
                            "web"
                        ],
                        attachments: [],
                        frontend_uuid: crypto.randomUUID(),
                        frontend_context_uuid: crypto.randomUUID(),
                        version: "client-1.11.0",
                        language: "en-US",
                        timezone,
                        search_recency_filter: null,
                        is_incognito: true,
                        use_schematized_api: true,
                        last_backend_uuid: null
                    }
                }),
                timeoutMs: 30_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `${err.message} perplexity-web requires it — without it Cloudflare blocks every request.`
                };
            }
            throw err;
        }
        if (response.status === 401 || response.status === 403) {
            if (isCloudflareChallenge(response.text)) {
                return {
                    valid: false,
                    error: "Cloudflare is blocking connections from this server's IP (TLS fingerprint rejected). " + "The session cookie may still be valid — install tls-client-node's native binary or route " + "perplexity-web through a residential proxy."
                };
            }
            return {
                valid: false,
                error: "Invalid Perplexity session cookie — re-paste __Secure-next-auth.session-token from perplexity.ai"
            };
        }
        if (response.status === 200 || response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Perplexity unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateBlackboxWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSessionCookieHeader"])(apiKey, "next-auth.session-token");
        const sessionHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            Accept: "application/json",
            Cookie: cookieHeader,
            Origin: "https://app.blackbox.ai",
            Referer: "https://app.blackbox.ai/",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        }, providerSpecificData);
        const sessionResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://app.blackbox.ai/api/auth/session", {
            method: "GET",
            headers: sessionHeaders
        });
        const sessionText = await sessionResponse.text();
        const sessionPayload = sessionText ? JSON.parse(sessionText) : null;
        const userEmail = sessionPayload?.user?.email;
        if (!sessionResponse.ok || !userEmail) {
            return {
                valid: false,
                error: "Invalid Blackbox session cookie — re-paste __Secure-authjs.session-token from app.blackbox.ai"
            };
        }
        const subscriptionHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            "Content-Type": "application/json",
            Accept: "application/json",
            Cookie: cookieHeader,
            Origin: "https://app.blackbox.ai",
            Referer: "https://app.blackbox.ai/",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        }, providerSpecificData);
        const subscriptionResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://app.blackbox.ai/api/check-subscription", {
            method: "POST",
            headers: subscriptionHeaders,
            body: JSON.stringify({
                email: userEmail
            })
        });
        const subscriptionText = await subscriptionResponse.text();
        const subscriptionPayload = subscriptionText ? JSON.parse(subscriptionText) : null;
        const explicitActive = subscriptionPayload?.hasActiveSubscription === true || subscriptionPayload?.isTrialSubscription === true || subscriptionPayload?.status === "PREMIUM";
        const explicitInactive = subscriptionPayload?.hasActiveSubscription === false || subscriptionPayload?.status === "FREE";
        const requiresAuthentication = subscriptionPayload?.requiresAuthentication === true || /login is required/i.test(subscriptionText || "");
        if (subscriptionResponse.status === 401 || subscriptionResponse.status === 403) {
            return {
                valid: false,
                error: "Invalid Blackbox session cookie — re-paste __Secure-authjs.session-token from app.blackbox.ai"
            };
        }
        if (requiresAuthentication) {
            return {
                valid: false,
                error: "Blackbox session expired — re-paste __Secure-authjs.session-token from app.blackbox.ai"
            };
        }
        if (subscriptionResponse.ok && explicitActive) {
            return {
                valid: true,
                error: null
            };
        }
        if (subscriptionResponse.ok && explicitInactive || subscriptionPayload?.previouslySubscribed) {
            return {
                valid: false,
                error: "Blackbox account authenticated, but no active paid subscription was detected for premium web models."
            };
        }
        if (subscriptionResponse.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (subscriptionResponse.status >= 500) {
            return {
                valid: false,
                error: `Blackbox unavailable (${subscriptionResponse.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${subscriptionResponse.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/metaAi.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Meta AI persisted-query request builder + base62/ID generators, extracted from validation.ts
// (god-file decomposition). Self-contained: uses only global crypto / Date / Math / Intl. The
// muse-spark-web validator (validation/webProvidersB.ts) consumes buildMetaAiValidationBody + the
// META_AI_* request consts. Behavior is byte-identical to the original inline defs.
__turbopack_context__.s([
    "META_AI_ASBD_ID",
    ()=>META_AI_ASBD_ID,
    "META_AI_BASE62_ALPHABET",
    ()=>META_AI_BASE62_ALPHABET,
    "META_AI_FRIENDLY_NAME",
    ()=>META_AI_FRIENDLY_NAME,
    "META_AI_REQUEST_ANALYTICS_TAGS",
    ()=>META_AI_REQUEST_ANALYTICS_TAGS,
    "META_AI_SEND_MESSAGE_DOC_ID",
    ()=>META_AI_SEND_MESSAGE_DOC_ID,
    "META_AI_USER_AGENT",
    ()=>META_AI_USER_AGENT,
    "buildMetaAiValidationBody",
    ()=>buildMetaAiValidationBody,
    "decodeMetaAiBase62",
    ()=>decodeMetaAiBase62,
    "encodeMetaAiBase62",
    ()=>encodeMetaAiBase62,
    "generateMetaAiConversationId",
    ()=>generateMetaAiConversationId,
    "generateMetaAiEventId",
    ()=>generateMetaAiEventId,
    "generateMetaAiNumericMessageId",
    ()=>generateMetaAiNumericMessageId,
    "randomMetaAiBigInt",
    ()=>randomMetaAiBigInt
]);
const META_AI_SEND_MESSAGE_DOC_ID = "29ae946c82d1f301196c6ca2226400b5";
const META_AI_FRIENDLY_NAME = "useEctoSendMessageSubscription";
const META_AI_REQUEST_ANALYTICS_TAGS = "graphservice";
const META_AI_ASBD_ID = "129477";
const META_AI_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const META_AI_BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function encodeMetaAiBase62(value, padLength) {
    let remaining = value;
    let encoded = "";
    while(remaining > 0n){
        encoded = META_AI_BASE62_ALPHABET[Number(remaining % 62n)] + encoded;
        remaining /= 62n;
    }
    return encoded.padStart(padLength, "0");
}
function decodeMetaAiBase62(value) {
    let decoded = 0n;
    for (const char of value){
        const index = META_AI_BASE62_ALPHABET.indexOf(char);
        if (index < 0) {
            throw new Error(`Invalid Meta AI base62 character: ${char}`);
        }
        decoded = decoded * 62n + BigInt(index);
    }
    return decoded;
}
function randomMetaAiBigInt(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    let result = 0n;
    for (const byte of bytes){
        result = result << 8n | BigInt(byte);
    }
    return result;
}
function generateMetaAiConversationId() {
    const timestamp = BigInt(Date.now()) & (1n << 44n) - 1n;
    const random = randomMetaAiBigInt(8) & (1n << 64n) - 1n;
    return `c.${encodeMetaAiBase62(timestamp << 64n | random, 19)}`;
}
function generateMetaAiEventId(conversationId) {
    if (!conversationId.startsWith("c.")) {
        return null;
    }
    try {
        const packedConversation = decodeMetaAiBase62(conversationId.slice(2));
        const conversationRandom = packedConversation & (1n << 64n) - 1n;
        const timestamp = BigInt(Date.now()) & (1n << 44n) - 1n;
        const eventRandom = randomMetaAiBigInt(4) & (1n << 32n) - 1n;
        return `e.${encodeMetaAiBase62(timestamp << 64n + 32n | conversationRandom << 32n | eventRandom, 25)}`;
    } catch  {
        return null;
    }
}
function generateMetaAiNumericMessageId() {
    return (BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000)) + (randomMetaAiBigInt(2) & 0xfffn)).toString();
}
function buildMetaAiValidationBody() {
    const conversationId = generateMetaAiConversationId();
    return {
        doc_id: META_AI_SEND_MESSAGE_DOC_ID,
        variables: {
            assistantMessageId: crypto.randomUUID(),
            attachments: null,
            clientLatitude: null,
            clientLongitude: null,
            clientTimezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
            clippyIp: null,
            content: "test",
            conversationId,
            conversationStarterId: null,
            currentBranchPath: "0",
            developerOverridesForMessage: null,
            devicePixelRatio: 1,
            entryPoint: "KADABRA__CHAT__UNIFIED_INPUT_BAR",
            imagineOperationRequest: null,
            isNewConversation: true,
            mentions: null,
            mode: "mode_fast",
            promptEditType: null,
            promptSessionId: crypto.randomUUID(),
            promptType: null,
            qplJoinId: null,
            requestedToolCall: null,
            // See muse-spark-web executor: RewriteOptionsInput was removed from
            // Meta's schema; sending `rewriteOptions` (even null) breaks the
            // persisted-query validation. Omit the field.
            turnId: crypto.randomUUID(),
            userAgent: META_AI_USER_AGENT,
            userEventId: generateMetaAiEventId(conversationId),
            userLocale: "en_US",
            userMessageId: crypto.randomUUID(),
            userUniqueMessageId: generateMetaAiNumericMessageId()
        }
    };
}
}),
"[project]/src/lib/providers/validation/webProvidersB.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractM365CredentialParts",
    ()=>extractM365CredentialParts,
    "validateAdaptaWebProvider",
    ()=>validateAdaptaWebProvider,
    "validateClaudeWebProvider",
    ()=>validateClaudeWebProvider,
    "validateCopilotM365WebProvider",
    ()=>validateCopilotM365WebProvider,
    "validateCopilotWebProvider",
    ()=>validateCopilotWebProvider,
    "validateDevinCloudAgentProvider",
    ()=>validateDevinCloudAgentProvider,
    "validateGeminiWebProvider",
    ()=>validateGeminiWebProvider,
    "validateInnerAiProvider",
    ()=>validateInnerAiProvider,
    "validateJulesProvider",
    ()=>validateJulesProvider,
    "validateMuseSparkWebProvider",
    ()=>validateMuseSparkWebProvider,
    "validateNotionWebProvider",
    ()=>validateNotionWebProvider,
    "validateT3WebProvider",
    ()=>validateT3WebProvider
]);
// Web-cookie provider key validators (part B): muse-spark-web, adapta-web, claude-web, gemini-web,
// copilot-web, t3-web, jules, devin (cloud-agent), inner-ai. Extracted from validation.ts (god-file
// decomposition) — top-level functions with no dispatcher-state captures; behavior is byte-identical
// to the inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/webCookieAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudAgent$2f$julesApi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudAgent/julesApi.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/metaAi.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function validateMuseSparkWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSessionCookieHeader"])(apiKey, "ecto_1_sess");
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://www.meta.ai/api/graphql", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "Content-Type": "application/json",
                Accept: "text/event-stream",
                "Accept-Language": "en-US,en;q=0.9",
                Cookie: cookieHeader,
                Origin: "https://www.meta.ai",
                Referer: "https://www.meta.ai/",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["META_AI_USER_AGENT"],
                "X-ASBD-ID": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["META_AI_ASBD_ID"],
                "X-FB-Friendly-Name": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["META_AI_FRIENDLY_NAME"],
                "X-FB-Request-Analytics-Tags": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["META_AI_REQUEST_ANALYTICS_TAGS"]
            }, providerSpecificData),
            body: JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildMetaAiValidationBody"])())
        });
        const responseText = await response.text();
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid Meta AI session cookie — re-paste ecto_1_sess from meta.ai"
            };
        }
        if (/authentication required to send messages|login is required|sign in/i.test(responseText)) {
            return {
                valid: false,
                error: "Invalid Meta AI session cookie — re-paste ecto_1_sess from meta.ai"
            };
        }
        if (response.status === 429 || /limit exceeded|rate limit|too many requests/i.test(responseText)) {
            return {
                valid: false,
                error: "Meta AI rate limited (429) — wait before retrying"
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Meta AI unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAdaptaWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = typeof apiKey === "string" ? apiKey.trim() : "";
        if (!raw) return {
            valid: false,
            error: "Paste your __client cookie from .clerk.agent.adapta.one"
        };
        const eqIdx = raw.indexOf("=");
        const clientJwt = eqIdx > 0 && !raw.startsWith("eyJ") ? raw.slice(eqIdx + 1).trim() : raw;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://clerk.agent.adapta.one/v1/client", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Cookie: `__client=${clientJwt}`,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                Origin: "https://agent.adapta.one"
            }, providerSpecificData)
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired __client cookie — re-paste from .clerk.agent.adapta.one"
            };
        }
        if (!response.ok) {
            return {
                valid: false,
                error: `Adapta Clerk returned HTTP ${response.status}`
            };
        }
        const body = await response.json().catch(()=>null);
        const sessions = body?.response?.sessions ?? [];
        const hasActive = sessions.some((s)=>s.status === "active");
        if (!hasActive) {
            return {
                valid: false,
                error: "No active Adapta session — your __client cookie may be expired"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateClaudeWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSessionCookieHeader"])(String(apiKey || ""), "sessionKey");
        if (!cookieHeader) {
            return {
                valid: false,
                error: "Paste your sessionKey cookie from claude.ai"
            };
        }
        const { tlsFetchClaude, TlsClientUnavailableError } = await __turbopack_context__.A("[project]/open-sse/services/claudeTlsClient.ts [instrumentation] (ecmascript, async loader)");
        let response;
        try {
            response = await tlsFetchClaude("https://claude.ai/api/organizations", {
                method: "GET",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Cache-Control": "no-cache",
                    Cookie: cookieHeader,
                    Origin: "https://claude.ai",
                    Pragma: "no-cache",
                    Referer: "https://claude.ai/new",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                    "anthropic-client-platform": "web_claude_ai"
                }, providerSpecificData),
                timeoutMs: 30_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `${err.message} (claude-web requires this — without it, Cloudflare blocks every request)`
                };
            }
            throw err;
        }
        if (response.status === 200) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired session cookie — re-paste sessionKey from claude.ai DevTools → Cookies"
            };
        }
        if (response.status === 429) {
            return {
                valid: false,
                error: "Claude Web API rate limited (429) — wait before retrying"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Claude.ai unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Claude.ai validation failed (${response.status})`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateGeminiWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your __Secure-1PSID cookie from gemini.google.com"
            };
        }
        // Accept full cookie blob or bare value
        let cookieHeader = raw;
        if (!raw.includes("=")) {
            cookieHeader = `__Secure-1PSID=${raw}`;
        }
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://gemini.google.com/app", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Accept: "text/html,application/xhtml+xml",
                Cookie: cookieHeader,
                Origin: "https://gemini.google.com",
                Referer: "https://gemini.google.com/"
            }, providerSpecificData)
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired __Secure-1PSID cookie — re-paste from gemini.google.com DevTools → Cookies"
            };
        }
        // 200/302 = valid, anything < 500 that isn't auth failure is acceptable
        if (response.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Gemini validation failed (${response.status})`
        };
    } catch (error) {
        // #7859: gemini.google.com/app answers EVERY session probe (valid or not) with a
        // 302 redirect (typically onward to accounts.google.com). validationRead() uses the
        // no-redirect preset, so safeOutboundFetch throws REDIRECT_BLOCKED before the
        // "200/302 = valid" status check above ever runs. A redirect to a PUBLIC host means
        // the redirect was never followed (no SSRF) and is exactly what a valid Gemini
        // session looks like here, so treat it as success. A redirect to a private/internal
        // host is a genuine SSRF signal and must stay invalid — isSecurityBlockError()
        // already makes that distinction.
        //
        // #9407: EXPIRED gemini sessions redirect to accounts.google.com/ServiceLogin,
        // which is a PUBLIC redirect (not SSRF) but represents a dead session. Inspect
        // the redirect target to distinguish between:
        //   - accounts.google.com/ServiceLogin — expired session → valid:false
        //   - other accounts.google.com paths — ambiguous, warn but treat as valid
        //   - non-Google redirects (e.g. gemini.google.com redirect loop) — valid
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "REDIRECT_BLOCKED" && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSecurityBlockError"])(error)) {
            const location = error.location ?? "";
            if (/accounts\.google\.com\/.*ServiceLogin/i.test(location)) {
                return {
                    valid: false,
                    error: "Session expired — re-paste __Secure-1PSID from gemini.google.com DevTools → Cookies"
                };
            }
            if (/accounts\.google\.com/i.test(location)) {
                return {
                    valid: true,
                    error: null,
                    warning: "Cookie accepted. Full verification requires browser test on first chat."
                };
            }
            return {
                valid: true,
                error: null
            };
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateCopilotWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your access_token from copilot.microsoft.com DevTools → Cookies"
            };
        }
        // Extract token — may be bare JWT, cookie string with access_token=, or Bearer prefix
        const { extractAccessToken } = await __turbopack_context__.A("[project]/open-sse/executors/copilot-web.ts [instrumentation] (ecmascript, async loader)");
        const token = extractAccessToken(raw);
        if (!token) {
            return {
                valid: false,
                error: "Could not extract access_token from input"
            };
        }
        // Probe Copilot's conversation API to verify token
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://copilot.microsoft.com/c/api/conversations?language=en", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                Origin: "https://copilot.microsoft.com",
                Referer: "https://copilot.microsoft.com/"
            }, providerSpecificData)
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired access_token — re-paste from copilot.microsoft.com DevTools → Cookies"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Copilot unavailable (${response.status})`
            };
        }
        // 200, 400, 404 etc. all indicate the token was accepted
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function extractM365CredentialParts(raw, providerSpecificData) {
    const text = raw.trim();
    const parts = {};
    for (const segment of text.split(/[;\n]/)){
        const index = segment.indexOf("=");
        if (index <= 0) continue;
        const key = segment.slice(0, index).trim();
        const value = segment.slice(index + 1).trim();
        if (key && value) parts[key] = value;
    }
    // Accept the current M365 web endpoint (m365.cloud.microsoft, including
    // regional subdomains) plus the two legacy hosts (substrate.office.com,
    // copilot.microsoft.com). The path still carries /m365Copilot/Chathub/<tenant>,
    // so extraction is unchanged. (OmniRoute issue #7078)
    if (/^wss:\/\//i.test(text)) {
        try {
            const url = new URL(text);
            const hostOk = /^(?:[\w-]+\.)*(?:m365\.cloud\.microsoft|copilot\.microsoft\.com|substrate\.office\.com)$/i.test(url.hostname);
            if (hostOk && url.pathname.startsWith("/m365Copilot/Chathub/")) {
                parts.access_token ||= url.searchParams.get("access_token") || "";
                parts.chathubPath ||= decodeURIComponent(url.pathname.split("/m365Copilot/Chathub/")[1] || "");
            }
        } catch  {
        // Fall through to the structured key/value parser result.
        }
    }
    return {
        accessToken: parts.access_token || parts.accessToken || (typeof providerSpecificData.access_token === "string" ? providerSpecificData.access_token : "") || (typeof providerSpecificData.accessToken === "string" ? providerSpecificData.accessToken : ""),
        chathubPath: parts.chathubPath || parts.userTenant || (typeof providerSpecificData.chathubPath === "string" ? providerSpecificData.chathubPath : "") || (typeof providerSpecificData.userTenant === "string" ? providerSpecificData.userTenant : "")
    };
}
async function validateCopilotM365WebProvider({ apiKey, providerSpecificData = {} }) {
    const { accessToken, chathubPath } = extractM365CredentialParts(String(apiKey || ""), providerSpecificData);
    if (!accessToken) {
        return {
            valid: false,
            error: "Could not extract access_token from the Microsoft 365 Copilot credential"
        };
    }
    if (!chathubPath || !chathubPath.includes("@")) {
        return {
            valid: false,
            error: "Could not extract the account-specific Chathub path from the credential"
        };
    }
    // The live provider uses a SignalR WebSocket. The generic web-cookie /models
    // probe builds an invalid wss://.../models URL, so validation here confirms
    // the captured credential shape and lets the executor perform the live check.
    return {
        valid: true,
        error: null,
        warning: "Credential format accepted. The session is verified when the provider sends a chat."
    };
}
async function validateT3WebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your Cookie header and convex-session-id from t3.chat"
            };
        }
        // The cookie field may contain "cookies=<Cookie header>\nconvexSessionId=<id>"
        // or just the Cookie header value. Try to parse.
        let cookieHeader = raw;
        let convexSessionId = "";
        if (raw.includes("convexSessionId") || raw.includes("convex-session-id")) {
            // Structured format: "cookies=...; convexSessionId=..."
            const parts = raw.split(/[,;\n]/).map((s)=>s.trim());
            const cookieParts = [];
            for (const part of parts){
                if (part.startsWith("convexSessionId=") || part.startsWith("convex-session-id=")) {
                    convexSessionId = part.split("=").slice(1).join("=");
                } else if (part.startsWith("cookies=")) {
                    cookieParts.push(part.slice("cookies=".length));
                } else if (part.includes("=")) {
                    cookieParts.push(part);
                }
            }
            if (cookieParts.length) cookieHeader = cookieParts.join("; ");
        }
        // Build final cookie with convex-session-id if found
        const finalCookie = convexSessionId ? `${cookieHeader}; convex-session-id=${convexSessionId}` : cookieHeader;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://t3.chat", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Accept: "text/html",
                Cookie: finalCookie
            }, providerSpecificData)
        });
        // t3.chat returns 200/302/404 for valid sessions, 5xx for down
        if (response.status >= 500) {
            return {
                valid: false,
                error: `t3.chat unavailable (${response.status})`
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateJulesProvider({ apiKey }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudAgent$2f$julesApi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildJulesApiUrl"])("/sources"), {
            method: "GET",
            headers: {
                "X-Goog-Api-Key": apiKey
            }
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        const errorText = await response.text().catch(()=>"");
        return {
            valid: false,
            error: errorText.trim() || `Jules API returned ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateDevinCloudAgentProvider({ apiKey }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.devin.ai/v1/sessions?limit=1", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        const errorText = await response.text().catch(()=>"");
        return {
            valid: false,
            error: errorText.trim() || `Devin API returned ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateNotionWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your token_v2 cookie value from notion.so"
            };
        }
        const cookieHeader = raw.includes("=") ? raw : `token_v2=${raw}`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://www.notion.so/api/v3/getSpaces", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "Content-Type": "application/json",
                Accept: "application/json",
                Cookie: cookieHeader,
                Origin: "https://www.notion.so",
                Referer: "https://www.notion.so/"
            }, providerSpecificData),
            body: "{}"
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired token_v2 cookie — re-paste from notion.so DevTools → Cookies"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Notion unavailable (${response.status})`
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Notion validation failed (${response.status})`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateInnerAiProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = typeof apiKey === "string" ? apiKey.trim() : "";
        if (!raw) {
            return {
                valid: false,
                error: "Paste your token cookie and email — format: eyJ... user@example.com"
            };
        }
        // Parse token and optional email (format: "TOKEN EMAIL")
        const eqIdx = raw.indexOf("=");
        const stripped = eqIdx > 0 && !raw.startsWith("eyJ") ? raw.slice(eqIdx + 1).trim() : raw;
        const lastSpace = stripped.lastIndexOf(" ");
        let token = stripped;
        let credEmail = "";
        if (lastSpace > 0) {
            const possibleEmail = stripped.slice(lastSpace + 1).trim();
            if (possibleEmail.includes("@")) {
                token = stripped.slice(0, lastSpace).trim();
                credEmail = possibleEmail;
            }
        }
        if (!credEmail) {
            return {
                valid: false,
                error: "Email is required — paste token followed by a space and your email: eyJ... user@example.com"
            };
        }
        // Validate JWT structure (3 parts separated by dots)
        const parts = token.split(".");
        if (parts.length < 3) {
            return {
                valid: false,
                error: "Invalid token format — paste only the token cookie value from .innerai.com (starts with eyJ…)"
            };
        }
        // Decode payload and check expiry
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        let payload = {};
        try {
            payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
        } catch  {
            return {
                valid: false,
                error: "Could not parse Inner.ai token — re-paste from DevTools"
            };
        }
        if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
            return {
                valid: false,
                error: "Inner.ai token has expired — re-login at app.innerai.com and re-paste the token cookie"
            };
        }
        // Verify the token carries at least one known Inner.ai identity field
        const hasIdentity = payload.device_id ?? payload.deviceId ?? payload["device-id"] ?? payload.did ?? payload.user_id ?? payload.userId ?? payload.sub;
        if (!hasIdentity) {
            return {
                valid: false,
                error: "Token does not look like an Inner.ai session token — re-paste from DevTools → Cookies → .innerai.com"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/directChatProbe.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateDirectChatProvider",
    ()=>validateDirectChatProvider
]);
// Generic "POST /chat/completions auth probe" used by several provider validators (command-code,
// nlpcloud + the enterprise-cloud validators). Extracted from validation.ts (god-file decomposition)
// into its own leaf so both the host dispatcher and validation/cloudProviders.ts can share it without
// a cycle. Behavior is byte-identical to the original inline def.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function validateDirectChatProvider({ url, headers, body, providerSpecificData = {}, isLocal = false }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(url, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])(headers, providerSpecificData),
            body: JSON.stringify(body)
        }, isLocal);
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/cloudProviders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateAzureAiProvider",
    ()=>validateAzureAiProvider,
    "validateAzureOpenAIProvider",
    ()=>validateAzureOpenAIProvider,
    "validateDataRobotProvider",
    ()=>validateDataRobotProvider,
    "validateDatabricksProvider",
    ()=>validateDatabricksProvider,
    "validateGigachatProvider",
    ()=>validateGigachatProvider,
    "validateHerokuProvider",
    ()=>validateHerokuProvider,
    "validateOciProvider",
    ()=>validateOciProvider,
    "validateSapProvider",
    ()=>validateSapProvider,
    "validateSnowflakeProvider",
    ()=>validateSnowflakeProvider,
    "validateWatsonxProvider",
    ()=>validateWatsonxProvider
]);
// Enterprise-cloud provider key validators: heroku, databricks, datarobot, snowflake, gigachat,
// azure-openai, azure-ai, watsonx, oci, sap. Extracted from validation.ts (god-file decomposition) —
// top-level functions with no dispatcher-state captures; behavior is byte-identical to the inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/directChatProbe.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gigachatAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/gigachatAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/azureAi.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/datarobot.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/oci.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/sap.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/watsonx.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function validateHerokuProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeHerokuChatUrl"])(baseUrl),
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
        body: {
            model: providerSpecificData.validationModelId || "claude-4-sonnet",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateDatabricksProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeDatabricksChatUrl"])(baseUrl),
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
        body: {
            model: providerSpecificData.validationModelId || "databricks-meta-llama-3-3-70b-instruct",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateDataRobotProvider({ apiKey, providerSpecificData = {} }) {
    const configuredBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DATAROBOT_DEFAULT_BASE_URL"];
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isDataRobotDeploymentUrl"])(configuredBaseUrl)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildDataRobotChatUrl"])(configuredBaseUrl),
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: {
                model: providerSpecificData.validationModelId || "datarobot-deployed-llm",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            },
            providerSpecificData
        });
    }
    const catalogUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildDataRobotCatalogUrl"])(configuredBaseUrl);
    if (!catalogUrl) {
        return {
            valid: false,
            error: "Invalid DataRobot base URL"
        };
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(catalogUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "gateway_catalog"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "gateway_catalog",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null,
                method: "gateway_catalog"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateSnowflakeProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    const usesProgrammaticAccessToken = typeof apiKey === "string" && apiKey.startsWith("pat/");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeSnowflakeChatUrl"])(baseUrl),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usesProgrammaticAccessToken ? apiKey.slice(4) : apiKey}`,
            "X-Snowflake-Authorization-Token-Type": usesProgrammaticAccessToken ? "PROGRAMMATIC_ACCESS_TOKEN" : "KEYPAIR_JWT"
        },
        body: {
            model: providerSpecificData.validationModelId || "llama3.3-70b",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateGigachatProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://gigachat.devices.sberbank.ru/api/v1";
    let token;
    try {
        token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gigachatAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getGigachatAccessToken"])({
            credentials: apiKey
        });
    } catch (error) {
        if (String(error?.message || "").match(/\b(401|403)\b/)) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeGigachatChatUrl"])(baseUrl),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.accessToken}`,
            Accept: "application/json"
        },
        body: {
            model: providerSpecificData.validationModelId || "GigaChat-2-Pro",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateAzureOpenAIProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!rawBaseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAzureOpenAIBaseUrl"])(rawBaseUrl);
    const apiVersion = typeof providerSpecificData.validationApiVersion === "string" && providerSpecificData.validationApiVersion.trim() ? providerSpecificData.validationApiVersion.trim() : "2024-12-01-preview";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        "api-key": apiKey
    }, providerSpecificData);
    const encodedVersion = encodeURIComponent(apiVersion);
    for (const probeUrl of [
        `${baseUrl}/openai/deployments?api-version=${encodedVersion}`,
        `${baseUrl}/openai/models?api-version=${encodedVersion}`
    ]){
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(probeUrl, {
                method: "GET",
                headers
            });
            if (response.ok) {
                return {
                    valid: true,
                    error: null,
                    method: "azure_probe"
                };
            }
            if (response.status === 401 || response.status === 403) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
            if (response.status === 400 || response.status === 404 || response.status === 405) {
                continue;
            }
            if (response.status === 429) {
                return {
                    valid: true,
                    error: null,
                    method: "azure_probe",
                    warning: "Rate limited, but credentials are valid"
                };
            }
            if (response.status >= 500) {
                return {
                    valid: false,
                    error: `Provider unavailable (${response.status})`
                };
            }
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    const deploymentId = typeof providerSpecificData.validationModelId === "string" ? providerSpecificData.validationModelId.trim() : "";
    if (!deploymentId) {
        return {
            valid: true,
            error: null,
            warning: "Azure key accepted, but no deployment name was provided for a chat probe. Set Model ID to validate a specific deployment."
        };
    }
    const chatUrl = `${baseUrl}/openai/deployments/${encodeURIComponent(deploymentId)}/chat/completions?api-version=${encodedVersion}`;
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: deploymentId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        })
    });
    if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
        return {
            valid: true,
            error: null,
            method: "chat_probe"
        };
    }
    if (response.status === 401 || response.status === 403) {
        return {
            valid: false,
            error: "Invalid API key"
        };
    }
    if (response.status === 404) {
        return {
            valid: true,
            error: null,
            method: "chat_probe",
            warning: "Azure credentials are valid, but the requested deployment was not found."
        };
    }
    if (response.status >= 500) {
        return {
            valid: false,
            error: `Provider unavailable (${response.status})`
        };
    }
    return {
        valid: false,
        error: `Validation failed: ${response.status}`
    };
}
function extractTargetDeployments(psd) {
    const deployments = [];
    if (Array.isArray(psd.deployments)) {
        for (const d of psd.deployments){
            if (typeof d === "string" && d.trim()) deployments.push(d.trim());
            else if (d && typeof d === "object" && typeof d.id === "string" && d.id.trim()) {
                deployments.push(d.id.trim());
            }
        }
    }
    if (Array.isArray(psd.models)) {
        for (const m of psd.models){
            if (typeof m === "string" && m.trim()) deployments.push(m.trim());
            else if (m && typeof m === "object" && typeof m.id === "string" && m.id.trim()) {
                deployments.push(m.id.trim());
            }
        }
    }
    if (Array.isArray(psd.validationModelIds)) {
        for (const id of psd.validationModelIds){
            if (typeof id === "string" && id.trim()) deployments.push(id.trim());
        }
    }
    if (typeof psd.validationModelId === "string" && psd.validationModelId.trim()) {
        const split = psd.validationModelId.split(",").map((s)=>s.trim()).filter(Boolean);
        for (const s of split){
            if (!deployments.includes(s)) deployments.push(s);
        }
    }
    return Array.from(new Set(deployments));
}
async function validateAzureAiProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AZURE_AI_DEFAULT_BASE_URL"];
    const modelsUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAzureAiModelsUrl"])(rawBaseUrl);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        "api-key": apiKey
    }, providerSpecificData);
    let modelsEndpointOk = false;
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(modelsUrl, {
            method: "GET",
            headers
        });
        if (response.ok) {
            modelsEndpointOk = true;
        } else if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        } else if (response.status === 429) {
            modelsEndpointOk = true;
        }
    } catch  {
    // Fall through to chat probe when /models is unavailable.
    }
    const targetDeployments = extractTargetDeployments(providerSpecificData);
    if (targetDeployments.length === 0) {
        if (modelsEndpointOk) {
            return {
                valid: true,
                error: null,
                method: "azure_ai_models"
            };
        }
        return {
            valid: false,
            error: "Endpoint /models unavailable. Provide a Model ID to validate via /chat/completions."
        };
    }
    const apiType = providerSpecificData.apiType === "responses" ? "responses" : "chat";
    const apiVersion = typeof providerSpecificData.apiVersion === "string" && providerSpecificData.apiVersion.trim() ? providerSpecificData.apiVersion.trim() : "2024-12-01-preview";
    const probeOne = async (deploymentId)=>{
        const chatUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAzureAiChatUrl"])(rawBaseUrl, apiType, deploymentId, apiVersion);
        const chatBody = apiType === "responses" ? {
            model: deploymentId,
            input: "test",
            max_output_tokens: 1
        } : {
            model: deploymentId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        };
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(chatBody)
            });
            if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
                return {
                    deploymentId,
                    valid: true,
                    status: "ok",
                    error: null
                };
            }
            if (response.status === 401 || response.status === 403) {
                return {
                    deploymentId,
                    valid: false,
                    status: "auth_error",
                    error: "Invalid API key"
                };
            }
            if (response.status === 404) {
                return {
                    deploymentId,
                    valid: false,
                    status: "not_found",
                    error: "Deployment not found"
                };
            }
            return {
                deploymentId,
                valid: false,
                status: "error",
                error: `Provider unavailable (${response.status})`
            };
        } catch (error) {
            const errRes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
            return {
                deploymentId,
                valid: false,
                status: "error",
                error: errRes.error || "Connection failed"
            };
        }
    };
    const settled = await Promise.allSettled(targetDeployments.map(probeOne));
    const deploymentResults = settled.map((res, i)=>res.status === "fulfilled" ? res.value : {
            deploymentId: targetDeployments[i],
            valid: false,
            status: "error",
            error: "Connection test failed"
        });
    const validCount = deploymentResults.filter((r)=>r.valid).length;
    const totalCount = deploymentResults.length;
    const hasAnyValid = validCount > 0 || modelsEndpointOk;
    if (!hasAnyValid) {
        const firstErr = deploymentResults.find((r)=>r.error)?.error || "Connection failed";
        return {
            valid: false,
            error: firstErr,
            method: "azure_ai_chat_probe",
            deployments: deploymentResults
        };
    }
    const warning = validCount < totalCount ? `${totalCount - validCount} of ${totalCount} deployment(s) failed connection test.` : null;
    return {
        valid: true,
        error: null,
        warning,
        method: modelsEndpointOk && targetDeployments.length === 0 ? "azure_ai_models" : "azure_ai_chat_probe",
        deployments: deploymentResults
    };
}
async function validateWatsonxProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WATSONX_DEFAULT_BASE_URL"];
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
    }, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildWatsonxModelsUrl"])(rawBaseUrl), {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "watsonx_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "watsonx_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to chat probe when /models is unavailable.
    }
    const validationModelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "ibm/granite-3-3-8b-instruct";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildWatsonxChatUrl"])(rawBaseUrl), {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: validationModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok || response.status === 400 || response.status === 404 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "watsonx_chat_probe",
                ...response.status === 404 ? {
                    warning: "watsonx credentials are valid, but the requested model is not enabled."
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing watsonx.ai"
    };
}
async function validateOciProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OCI_DEFAULT_BASE_URL"];
    const projectId = typeof providerSpecificData.projectId === "string" && providerSpecificData.projectId.trim() ? providerSpecificData.projectId.trim() : typeof providerSpecificData.project === "string" && providerSpecificData.project.trim() ? providerSpecificData.project.trim() : "";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...projectId ? {
            "OpenAI-Project": projectId
        } : {}
    }, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildOciModelsUrl"])(rawBaseUrl), {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "oci_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "oci_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to chat/responses probe when /models is unavailable.
    }
    const validationModelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "openai.gpt-oss-20b";
    const apiType = providerSpecificData.apiType === "responses" ? "responses" : "chat";
    const body = apiType === "responses" ? {
        model: validationModelId,
        input: "test",
        max_output_tokens: 1
    } : {
        model: validationModelId,
        messages: [
            {
                role: "user",
                content: "test"
            }
        ],
        max_tokens: 1
    };
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildOciChatUrl"])(rawBaseUrl, apiType), {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });
        if (response.ok || response.status === 400 || response.status === 404 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: apiType === "responses" ? "oci_responses_probe" : "oci_chat_probe",
                ...response.status === 404 ? {
                    warning: "OCI credentials are valid, but the requested model was not found."
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing OCI Generative AI"
    };
}
async function validateSapProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SAP_DEFAULT_BASE_URL"];
    const resourceGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSapResourceGroup"])(providerSpecificData);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "AI-Resource-Group": resourceGroup
    }, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildSapModelsUrl"])(rawBaseUrl), {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "sap_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "sap_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to deployment probe when the discovery API is unavailable.
    }
    const canProbeChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSapDeploymentUrl"])(rawBaseUrl) || /\/chat\/completions$/i.test((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(rawBaseUrl));
    if (!canProbeChat) {
        return {
            valid: false,
            error: "SAP validation needs either a reachable AI_API_URL or a deployment URL in providerSpecificData.baseUrl"
        };
    }
    const validationModelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "gpt-4o";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildSapChatUrl"])(rawBaseUrl), {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: validationModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok || response.status === 400 || response.status === 404 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "sap_chat_probe",
                ...response.status === 404 ? {
                    warning: "SAP credentials are valid, but the deployment URL or model was not found."
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing SAP Generative AI Hub"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/audioMiscProviders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAwsPollyBaseUrl",
    ()=>getAwsPollyBaseUrl,
    "getAwsPollyRegion",
    ()=>getAwsPollyRegion,
    "getAwsProviderString",
    ()=>getAwsProviderString,
    "validateAssemblyAIProvider",
    ()=>validateAssemblyAIProvider,
    "validateAwsPollyProvider",
    ()=>validateAwsPollyProvider,
    "validateBailianCodingPlanProvider",
    ()=>validateBailianCodingPlanProvider,
    "validateDeepgramProvider",
    ()=>validateDeepgramProvider,
    "validateElevenLabsProvider",
    ()=>validateElevenLabsProvider,
    "validateInworldProvider",
    ()=>validateInworldProvider,
    "validateKieProvider",
    ()=>validateKieProvider,
    "validateMaritalkProvider",
    ()=>validateMaritalkProvider,
    "validateNlpCloudProvider",
    ()=>validateNlpCloudProvider,
    "validateNousResearchProvider",
    ()=>validateNousResearchProvider,
    "validatePoeProvider",
    ()=>validatePoeProvider,
    "validateQwenCloudTokenPlanProvider",
    ()=>validateQwenCloudTokenPlanProvider,
    "validateRekaProvider",
    ()=>validateRekaProvider,
    "validateRevAiProvider",
    ()=>validateRevAiProvider,
    "validateRunwayProvider",
    ()=>validateRunwayProvider
]);
// Audio/speech + miscellaneous API-key provider validators: deepgram, assemblyai, elevenlabs,
// inworld, kie, aws-polly, bailian-coding-plan, reka, maritalk, nlpcloud, runwayml, nous-research,
// poe. Extracted from validation.ts (god-file decomposition) — top-level functions with no
// dispatcher-state captures; behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$poe$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/poe/index.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/directChatProbe.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/runway.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/maritalk.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$awsSigV4$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/awsSigV4.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function validateDeepgramProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://api.deepgram.com/v1/auth/token", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: `Token ${apiKey}`
            }, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAssemblyAIProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://api.assemblyai.com/v2/transcript?limit=1", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: apiKey,
                "Content-Type": "application/json"
            }, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateRevAiProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://api.rev.ai/speechtotext/v1/jobs?limit=1", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateElevenLabsProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Lightweight auth check endpoint
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://api.elevenlabs.io/v1/voices", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "xi-api-key": apiKey,
                "Content-Type": "application/json"
            }, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateInworldProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Inworld TTS lacks a simple key-introspection endpoint.
        // Send a minimal synth request and treat non-auth 4xx as auth-pass.
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.inworld.ai/tts/v1/voice", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: `Basic ${apiKey}`,
                "Content-Type": "application/json"
            }, providerSpecificData),
            body: JSON.stringify({
                text: "test",
                modelId: "inworld-tts-1.5-mini",
                audioConfig: {
                    audioEncoding: "MP3"
                }
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any other response indicates auth is accepted (payload/model may still be wrong)
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateKieProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Use credit check endpoint as requested by user based on Kie.ai docs.
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://api.kie.ai/api/v1/chat/credit", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid Kie.ai API key"
            };
        }
        // Fallback: if credits endpoint is 404/not supported, try minimal chat probe.
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.kie.ai/api/v1/chat/completions", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData.validationModelId || "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (chatRes.ok || chatRes.status >= 400 && chatRes.status < 500 && chatRes.status !== 401 && chatRes.status !== 403) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${chatRes.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function getAwsProviderString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function getAwsPollyRegion(providerSpecificData = {}) {
    return getAwsProviderString(providerSpecificData.region) || getAwsProviderString(providerSpecificData.awsRegion) || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
}
function getAwsPollyBaseUrl(providerSpecificData = {}, region) {
    return (getAwsProviderString(providerSpecificData.baseUrl) || `https://polly.${region}.amazonaws.com`).replace(/\/+$/, "");
}
async function validateAwsPollyProvider({ apiKey, providerSpecificData = {} }) {
    const accessKeyId = getAwsProviderString(providerSpecificData.accessKeyId) || getAwsProviderString(providerSpecificData.awsAccessKeyId);
    const secretAccessKey = getAwsProviderString(apiKey);
    if (!accessKeyId) {
        return {
            valid: false,
            error: "Missing AWS accessKeyId"
        };
    }
    if (!secretAccessKey) {
        return {
            valid: false,
            error: "Missing AWS Secret Access Key"
        };
    }
    const region = getAwsPollyRegion(providerSpecificData);
    const baseUrl = getAwsPollyBaseUrl(providerSpecificData, region).replace(/\/v1\/voices$/i, "");
    const url = `${baseUrl}/v1/voices?Engine=standard`;
    try {
        const signedHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$awsSigV4$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signAwsRequest"])({
            method: "GET",
            url,
            region,
            service: "polly",
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken: getAwsProviderString(providerSpecificData.sessionToken) || getAwsProviderString(providerSpecificData.awsSessionToken)
            }
        });
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(url, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])(signedHeaders, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateBailianCodingPlanProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlibabaProviderBaseUrl"])("bailian-coding-plan", providerSpecificData));
        const baseUrl = rawBaseUrl.endsWith("/messages") ? rawBaseUrl.slice(0, -"/messages".length) : rawBaseUrl;
        // bailian-coding-plan uses DashScope Anthropic-compatible messages endpoint
        // It does NOT expose /v1/models — use messages probe directly
        const messagesUrl = `${baseUrl}/messages`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(messagesUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            }, providerSpecificData),
            body: JSON.stringify({
                model: "qwen3-coder-plus",
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        });
        // 401/403 => invalid key
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Non-auth 4xx (e.g., 400 bad request) means auth passed but request was malformed
        if (response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateQwenCloudTokenPlanProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlibabaProviderBaseUrl"])("qwen-cloud-token-plan", providerSpecificData)).replace(/\/chat\/completions$/i, "");
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData.validationModelId || "qwen3.7-max",
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                warning: "Provider accepted the key but is rate limited (429)"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateRekaProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://api.reka.ai/v1";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRekaHeaders"])(apiKey, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(`${baseUrl}/models`, {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "reka_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "reka_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to the chat probe when /models is unavailable.
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: providerSpecificData.validationModelId || "reka-flash-3",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "reka_chat_probe"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Reka"
    };
}
async function validateMaritalkProvider({ apiKey, providerSpecificData = {} }) {
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])("maritalk");
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl || entry?.baseUrl);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildKeyHeaders"])(apiKey, providerSpecificData);
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildMaritalkModelsUrl"])(baseUrl), {
            method: "GET",
            headers
        });
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "maritalk_models"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (modelsRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "maritalk_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (modelsRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${modelsRes.status})`
            };
        }
    } catch  {
    // Fall through to the chat probe when /models cannot be reached.
    }
    const modelId = typeof providerSpecificData?.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : entry?.models?.[0]?.id || "sabia-4";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildMaritalkChatUrl"])(baseUrl),
        headers,
        body: {
            model: modelId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateNlpCloudProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://api.nlpcloud.io/v1";
    const baseUrl = rawBaseUrl.endsWith("/gpu") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/gpu`;
    const modelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "chatdolphin";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildTokenHeaders"])(apiKey, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(`${baseUrl}/${modelId}/chatbot`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                input: "test",
                context: "You are a concise assistant.",
                history: []
            })
        });
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "nlpcloud_chatbot",
                ...response.status === 429 ? {
                    warning: "Rate limited, but credentials are valid"
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing NLP Cloud"
    };
}
async function validateRunwayProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRunwayBaseUrl"])(providerSpecificData.baseUrl);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayApiUrl"])("/organization", baseUrl), {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayHeaders"])(apiKey)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "runway_organization"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "runway_organization",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Runway"
    };
}
async function validateNousResearchProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://inference-api.nousresearch.com/v1";
    const chatUrl = `${baseUrl}/chat/completions`;
    const modelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "Hermes-4-70B";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "nous_chat_completions"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "nous_chat_completions",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status === 402) {
            return {
                valid: false,
                error: "Payment required or API key missing"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        // #3881: any other non-auth 4xx (e.g. 400 model-not-found, 404, 422) means the
        // credentials were accepted — only the probe model/request shape was rejected.
        // Treat as valid (mirrors the longcat/nvidia validators) so a model rename upstream
        // can't make a working key read as "invalid".
        if (response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null,
                method: "nous_chat_completions",
                warning: `Credentials valid (probe returned ${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Nous Research"
    };
}
async function validatePoeProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$poe$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["POE_DEFAULT_BASE_URL"];
    const balanceUrl = new URL("/usage/current_balance", baseUrl).toString();
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(balanceUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "poe_current_balance"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "poe_current_balance",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Poe"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/searchProviders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SEARCH_VALIDATOR_CONFIGS",
    ()=>SEARCH_VALIDATOR_CONFIGS,
    "validateSearchProvider",
    ()=>validateSearchProvider
]);
// Web-search provider key validators + their per-provider request configs (serper, tavily, jina-reader,
// …). Extracted from validation.ts (god-file decomposition) — top-level functions/data with no
// dispatcher-state captures; behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function validateSearchProvider(url, init, providerSpecificData = {}, isLocal = false) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationWrite,
            guard: isLocal ? "none" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderOutboundGuard"])(),
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withCustomUserAgent"])(init, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null,
            unsupported: false
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key",
                unsupported: false
            };
        }
        // For provider setup we only need to confirm authentication passed.
        // Search providers may return non-auth statuses for exhausted credits,
        // rate limiting, or request-shape quirks while still accepting the key.
        if (response.status < 500) {
            return {
                valid: true,
                error: null,
                unsupported: false
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`,
            unsupported: false
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
const SEARCH_VALIDATOR_CONFIGS = {
    "serper-search": (apiKey)=>({
            url: "https://google.serper.dev/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey
                },
                body: JSON.stringify({
                    q: "test",
                    num: 1
                })
            }
        }),
    "brave-search": (apiKey)=>({
            url: "https://api.search.brave.com/res/v1/web/search?q=test&count=1",
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-Subscription-Token": apiKey
                }
            }
        }),
    "perplexity-search": (apiKey)=>({
            url: "https://api.perplexity.ai/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: "test",
                    max_results: 1
                })
            }
        }),
    "exa-search": (apiKey)=>({
            url: "https://api.exa.ai/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey
                },
                body: JSON.stringify({
                    query: "test",
                    numResults: 1
                })
            }
        }),
    "tavily-search": (apiKey)=>({
            url: "https://api.tavily.com/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: "test",
                    max_results: 1
                })
            }
        }),
    "google-pse-search": (apiKey, providerSpecificData = {})=>{
        const cx = providerSpecificData?.cx;
        if (!cx || typeof cx !== "string") {
            throw new Error("Programmable Search Engine ID (cx) is required");
        }
        return {
            url: `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=test&num=1`,
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        };
    },
    "linkup-search": (apiKey)=>({
            url: "https://api.linkup.so/v1/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    q: "test",
                    depth: "standard",
                    outputType: "searchResults",
                    maxResults: 1
                })
            }
        }),
    "searchapi-search": (apiKey)=>({
            url: `https://www.searchapi.io/api/v1/search?engine=google&q=test&api_key=${encodeURIComponent(apiKey)}`,
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        }),
    "youcom-search": (apiKey)=>({
            url: "https://ydc-index.io/v1/search?query=test&count=1",
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-API-Key": apiKey
                }
            }
        }),
    "searxng-search": (apiKey, providerSpecificData = {})=>{
        const baseUrl = typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim().replace(/\/+$/, "") : "http://localhost:8888/search";
        const searchUrl = baseUrl.endsWith("/search") ? baseUrl : `${baseUrl}/search`;
        const headers = {
            Accept: "application/json"
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }
        return {
            url: `${searchUrl}?q=test&format=json`,
            init: {
                method: "GET",
                headers
            }
        };
    },
    "ollama-search": (apiKey)=>({
            url: "https://ollama.com/api/web_search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: "test",
                    max_results: 1
                })
            }
        }),
    "zai-search": (apiKey, providerSpecificData = {})=>{
        const baseUrl = typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim().replace(/\/+$/, "") : "https://api.z.ai/api/mcp/web_search_prime/mcp";
        return {
            url: baseUrl,
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/call",
                    params: {
                        name: "web_search_prime",
                        arguments: {
                            search_query: "test"
                        }
                    },
                    id: 1
                })
            }
        };
    },
    // ── Web-fetch providers (#4401) ──
    // firecrawl / jina-reader were added as webFetch-kind providers in #2645 with their
    // own executors but no validator, so the dashboard "Validate" step returned
    // "Provider validation not supported" and accounts could not be added through the UI.
    // Probe each provider's real fetch endpoint with the same Bearer auth the executor
    // uses; validateSearchProvider maps 200/<500 → valid, 401/403 → invalid key,
    // >=500 → failure (a credit-exhausted / rate-limited key still validates).
    firecrawl: (apiKey, providerSpecificData = {})=>{
        const envBase = process.env.FIRECRAWL_BASE_URL?.trim();
        const baseUrl = envBase ? envBase.replace(/\/+$/, "") : typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim().replace(/\/+$/, "") : "https://api.firecrawl.dev";
        const headers = {
            "Content-Type": "application/json"
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }
        return {
            url: `${baseUrl}/v1/scrape`,
            init: {
                method: "POST",
                headers,
                body: JSON.stringify({
                    url: "https://example.com",
                    formats: [
                        "markdown"
                    ]
                })
            }
        };
    },
    "jina-reader": (apiKey)=>({
            url: "https://r.jina.ai/https://example.com",
            init: {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        }),
    tinyfish: (apiKey)=>({
            url: "https://api.fetch.tinyfish.ai",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey
                },
                body: JSON.stringify({
                    urls: [
                        "https://example.com"
                    ],
                    format: "markdown"
                })
            }
        })
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/embeddingProviders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateClarifaiProvider",
    ()=>validateClarifaiProvider,
    "validateEmbeddingApiProvider",
    ()=>validateEmbeddingApiProvider,
    "validateRerankApiProvider",
    ()=>validateRerankApiProvider
]);
// Embedding / rerank / clarifai provider key validators. Extracted from validation.ts (god-file
// decomposition) — top-level functions with no dispatcher-state captures; behavior is byte-identical
// to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function validateClarifaiProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://api.clarifai.com/v2/ext/openai/v1";
    const modelsUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelsSuffix"])(baseUrl);
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(modelsUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClarifaiHeaders"])(apiKey, providerSpecificData)
        });
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "clarifai_models"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        const chatUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveChatUrl"])("clarifai", baseUrl, providerSpecificData);
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClarifaiHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData?.validationModelId || "openai/chat-completion/models/gpt-oss-120b",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (chatRes.ok || chatRes.status === 400 || chatRes.status === 422 || chatRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "clarifai_chat_probe"
            };
        }
        if (chatRes.status === 401 || chatRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (chatRes.status === 404 || chatRes.status === 405) {
            return {
                valid: false,
                error: "Provider validation endpoint not supported"
            };
        }
        if (chatRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${chatRes.status})`
            };
        }
        return {
            valid: true,
            error: null,
            method: "clarifai_chat_probe"
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateEmbeddingApiProvider({ apiKey, providerSpecificData = {}, url, modelId }) {
    if (!url) {
        return {
            valid: false,
            error: "Missing embedding endpoint"
        };
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(url, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData?.validationModelId || modelId,
                input: [
                    "test"
                ]
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateRerankApiProvider({ apiKey, providerSpecificData = {}, url, modelId }) {
    if (!url) {
        return {
            valid: false,
            error: "Missing rerank endpoint"
        };
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(url, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData?.validationModelId || modelId,
                query: "test",
                documents: [
                    "test"
                ],
                top_n: 1,
                return_documents: false
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/cozeError.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractCozeValidationError",
    ()=>extractCozeValidationError
]);
// #5426 — Coze surfaces key-validation failures as a JSON envelope shaped like
// `{ "code": 4100, "msg": "...", "logId": "...", "from": "bot-api" }`. Left
// untranslated, that raw envelope (logId included) leaks verbatim into the
// connection-validation UI. This pure helper recognizes the Coze shape and
// composes a friendly, leak-free message so callers can surface it instead of
// the raw body. Kept in its own leaf module (no network deps) so it is unit-
// testable in isolation.
function asRecord(value) {
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
        } catch  {
            return null;
        }
    }
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function extractCozeValidationError(body) {
    const record = asRecord(body);
    if (!record) return null;
    const msg = typeof record.msg === "string" ? record.msg.trim() : "";
    const from = typeof record.from === "string" ? record.from : "";
    const logId = typeof record.logId === "string" ? record.logId.trim() : "";
    const looksLikeCoze = msg !== "" || from === "bot-api" || logId !== "";
    if (!looksLikeCoze) return null;
    const code = record.code;
    const codeStr = typeof code === "number" ? String(code) : typeof code === "string" && code.trim() !== "" ? code.trim() : "";
    const detail = msg || "the API key was rejected";
    return codeStr ? `Coze rejected the key: ${detail} (code ${codeStr})` : `Coze rejected the key: ${detail}`;
}
}),
"[project]/src/lib/providers/validation/openaiFormat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateBedrockProvider",
    ()=>validateBedrockProvider,
    "validateCommandCodeProvider",
    ()=>validateCommandCodeProvider,
    "validateGeminiLikeProvider",
    ()=>validateGeminiLikeProvider,
    "validateHuggingFaceProvider",
    ()=>validateHuggingFaceProvider,
    "validateOpenAICompatibleProvider",
    ()=>validateOpenAICompatibleProvider,
    "validateOpenAILikeProvider",
    ()=>validateOpenAILikeProvider
]);
// OpenAI/Gemini-format + Bedrock provider key validators (bedrock, openai-like, command-code, gemini-like, openai-compatible).
// Extracted from validation.ts (god-file decomposition) — top-level functions; behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/bedrock.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/directChatProbe.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cozeError$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/cozeError.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
async function validateBedrockProvider({ apiKey, providerSpecificData = {} }) {
    if (!apiKey) {
        return {
            valid: false,
            error: "Provider and API key required"
        };
    }
    try {
        const discovery = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["discoverBedrockNativeModels"])({
            apiKey,
            providerSpecificData,
            fetcher: (url, init)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(url, init)
        });
        return {
            valid: true,
            error: null,
            method: "bedrock_native_models",
            warning: discovery.warnings[0] || null
        };
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBedrockNativeAuthError"])(error)) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBedrockNativeApiError"])(error)) {
            if (error.status === 429) {
                return {
                    valid: true,
                    error: null,
                    warning: "Bedrock accepted the key but model discovery is rate limited",
                    method: "bedrock_native_models"
                };
            }
            if (typeof error.status === "number" && error.status >= 500) {
                return {
                    valid: false,
                    error: `Provider unavailable (${error.status})`
                };
            }
            if (typeof error.status === "number") {
                return {
                    valid: false,
                    error: `Bedrock validation failed: ${error.status}`
                };
            }
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateOpenAILikeProvider({ provider = "openai", apiKey, baseUrl, headers = {}, modelId = "gpt-3.5-turbo", providerSpecificData, modelsUrl = "", isLocal = false }) {
    try {
        // Guard against a non-string modelsUrl reaching .trim()/.startsWith() — a malformed
        // providerSpecificData / registry value would otherwise throw a TypeError mid-validation
        // ("trim is not a function" / "startsWith is not a function"). See #2463 class.
        const customModelsUrl = (typeof modelsUrl === "string" ? modelsUrl.trim() : "") || "";
        const endpointUrl = customModelsUrl ? customModelsUrl.startsWith("http") ? customModelsUrl : `${baseUrl.replace(/\/+$/, "")}/${customModelsUrl.replace(/^\/+/, "")}` : // so an OpenAI-style baseUrl validates against /v1/models, not /v1/chat/completions/models.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelsSuffix"])(baseUrl);
        const requestUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : endpointUrl;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(requestUrl, {
            headers: {
                ...headers,
                ...apiKey ? {
                    Authorization: `Bearer ${apiKey}`
                } : {}
            }
        }, isLocal);
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 401) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // #2929: A 403 on the models endpoint is not always a bad key. Some providers
        // (e.g. Fireworks Fire Pass `fpk_*` keys) return "...not authorized for this
        // route." on /models while still serving chat. Fall through to the chat probe
        // for such route-restriction 403s instead of declaring the key invalid.
        if (response.status === 403) {
            const forbiddenBody = await response.text().catch(()=>"");
            if (!/not authorized for this route/i.test(forbiddenBody)) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
        }
        const chatUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveChatUrl"])(provider, baseUrl, providerSpecificData);
        if (!chatUrl) {
            return {
                valid: false,
                error: `Validation failed: ${response.status}`
            };
        }
        const testModelId = providerSpecificData?.validationModelId || modelId;
        const testBody = {
            model: testModelId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        };
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: {
                ...headers,
                ...apiKey ? {
                    Authorization: `Bearer ${apiKey}`
                } : {}
            },
            body: JSON.stringify(testBody)
        }, isLocal);
        if (chatRes.ok) {
            return {
                valid: true,
                error: null
            };
        }
        // #5426: Coze answers the chat probe with a JSON envelope ({ code, msg,
        // logId, from }) on a bad key. Translate it into a friendly message so the
        // raw envelope (logId included) never leaks into the connection UI. Scoped
        // to provider === "coze" so a non-Coze error body that happens to carry a
        // `msg` field is never mislabeled, and other providers' response bodies are
        // never consumed here — they fall through to the canned handling below.
        if (provider === "coze") {
            const chatErrorBody = await chatRes.text().catch(()=>"");
            const cozeError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cozeError$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractCozeValidationError"])(chatErrorBody);
            if (cozeError) {
                return {
                    valid: false,
                    error: cozeError
                };
            }
        }
        if (chatRes.status === 401 || chatRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (chatRes.status === 404 || chatRes.status === 405) {
            return {
                valid: false,
                error: "Provider validation endpoint not supported"
            };
        }
        if (chatRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${chatRes.status})`
            };
        }
        // #7284: A 429 on the chat probe means the key is accepted but this connection
        // is rate/concurrency limited (e.g. always-throttled free tiers like opencode-zen).
        // Keep valid:true (the key works) but surface a warning so the connection Test
        // does not read as an unqualified green when real traffic will hit 429s.
        // Mirrors validateBedrockProvider's existing 429 precedent above.
        if (chatRes.status === 429) {
            return {
                valid: true,
                error: null,
                warning: "Provider accepted the key but is rate limited (429)"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateCommandCodeProvider({ apiKey, providerSpecificData = {} }) {
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])("command-code");
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(entry?.baseUrl || "https://api.commandcode.ai");
    const chatPath = entry?.chatPath || "/alpha/generate";
    const url = `${baseUrl}${chatPath.startsWith("/") ? chatPath : `/${chatPath}`}`;
    const validationModelId = providerSpecificData?.validationModelId || entry?.models?.find((model)=>model.id === "deepseek/deepseek-v4-flash")?.id || "deepseek/deepseek-v4-flash";
    const { COMMAND_CODE_VERSION } = await __turbopack_context__.A("[project]/open-sse/executors/commandCode.ts [instrumentation] (ecmascript, async loader)");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url,
        providerSpecificData,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "x-command-code-version": COMMAND_CODE_VERSION,
            "x-cli-environment": "external",
            "x-project-slug": "pi-cc",
            "x-taste-learning": "false",
            "x-co-flag": "false",
            "x-session-id": (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()
        },
        body: {
            config: {
                workingDir: "/workspace",
                date: new Date().toISOString().slice(0, 10),
                environment: "external",
                structure: [],
                isGitRepo: false,
                currentBranch: "",
                mainBranch: "",
                gitStatus: "",
                recentCommits: []
            },
            memory: "",
            taste: "",
            skills: "",
            permissionMode: "standard",
            params: {
                model: validationModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                tools: [],
                system: "",
                max_tokens: 1,
                stream: true
            }
        }
    });
}
async function validateHuggingFaceProvider({ apiKey }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://huggingface.co/api/whoami-v2", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "huggingface_whoami"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Non-auth, non-OK status — surface as a transient upstream failure rather
        // than declaring the (potentially valid) fine-grained token invalid.
        return {
            valid: false,
            error: `HuggingFace token check returned ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateGeminiLikeProvider({ apiKey, baseUrl, providerSpecificData = {}, authType = "query", isLocal = false }) {
    try {
        if (!baseUrl) {
            return {
                valid: false,
                error: "Missing base URL"
            };
        }
        const normalizedAuthType = String(authType || "query").toLowerCase();
        // Strip a trailing /models before appending — the default Gemini registry baseUrl is
        // `.../v1beta/models` (for the chat urlBuilder), so naively appending /models produced
        // `.../v1beta/models/models` → upstream 404 on connection validation (#2545).
        const baseForModels = String(baseUrl).replace(/\/models\/?$/, "").replace(/\/$/, "");
        const requestUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : `${baseForModels}/models`;
        // Use the correct auth header based on provider config:
        // - gemini (API key): x-goog-api-key
        // - Google OAuth access tokens (ya29.*): Bearer token
        const headers = {};
        let urlWithKey = requestUrl;
        if (typeof apiKey === "string" && apiKey.startsWith("ya29.")) {
            // A Google OAuth access token (ya29.*) must use Bearer auth even when the
            // connection is configured as an API-key provider. Checked first so authType
            // "apikey"/"header" doesn't shadow it with x-goog-api-key.
            headers["Authorization"] = `Bearer ${apiKey}`;
        } else if (normalizedAuthType === "header" || normalizedAuthType === "apikey") {
            headers["x-goog-api-key"] = apiKey;
        } else if (normalizedAuthType === "oauth" || normalizedAuthType === "bearer") {
            headers["Authorization"] = `Bearer ${apiKey}`;
        } else if (normalizedAuthType === "query") {
            urlWithKey = `${requestUrl}?key=${encodeURIComponent(apiKey)}`;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])(headers, providerSpecificData);
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(urlWithKey, {
            headers
        }, isLocal);
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 400 || response.status === 401 || response.status === 403) {
            const isAuthError = (body)=>{
                const message = (body?.error?.message || "").toLowerCase();
                const reason = body?.error?.details?.[0]?.reason || "";
                const status = body?.error?.status || "";
                const authPatterns = [
                    "api key not valid",
                    "api key expired",
                    "api key invalid",
                    "API_KEY_INVALID",
                    "API_KEY_EXPIRED",
                    "PERMISSION_DENIED",
                    "UNAUTHENTICATED"
                ];
                return authPatterns.some((p)=>message.includes(p.toLowerCase()) || reason === p || status === p);
            };
            try {
                const body = await response.json();
                if (isAuthError(body)) {
                    return {
                        valid: false,
                        error: "Invalid API key"
                    };
                }
                if (response.status === 401 || response.status === 403) {
                    return {
                        valid: false,
                        error: "Invalid API key"
                    };
                }
            } catch  {
                if (response.status === 401 || response.status === 403) {
                    return {
                        valid: false,
                        error: "Invalid API key"
                    };
                }
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateOpenAICompatibleProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "No base URL configured for OpenAI compatible provider"
        };
    }
    const validationModelId = typeof providerSpecificData?.validationModelId === "string" ? providerSpecificData.validationModelId.trim() : "";
    // Step 1: Try GET /models
    let modelsReachable = false;
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(`${baseUrl}/models`, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        modelsReachable = true;
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "models_endpoint"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Endpoint responded and auth seems valid, but quota is exhausted/rate-limited.
        if (modelsRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "models_endpoint",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // /models fetch failed (network error, etc.) — fall through to chat test
    }
    // T25: if /models cannot be used and no custom model was provided, return a
    // clear actionable message instead of a generic connection error.
    if (!validationModelId) {
        return {
            valid: false,
            error: "Endpoint /models unavailable. Provide a Model ID to validate via /chat/completions."
        };
    }
    // Step 2: Fallback — try a minimal chat completion request
    // Many providers don't expose /models but accept chat completions fine
    const apiType = providerSpecificData.apiType || "chat";
    const chatSuffix = apiType === "responses" ? "/responses" : "/chat/completions";
    const chatUrl = `${baseUrl}${chatSuffix}`;
    const testModelId = validationModelId;
    try {
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: testModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (chatRes.ok) {
            return {
                valid: true,
                error: null,
                method: "chat_completions"
            };
        }
        if (chatRes.status === 401 || chatRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (chatRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "chat_completions",
                warning: "Rate limited, but credentials are valid"
            };
        }
        // If /models was reachable but returned non-auth error, and chat succeeds
        // auth-wise, this still confirms credentials are valid.
        if (chatRes.status === 400) {
            return {
                valid: true,
                error: null,
                method: "inference_available",
                warning: "Model ID may be invalid, but credentials are valid"
            };
        }
        // #2032: a 404 on the chat probe commonly means the requested model id
        // does not exist at this provider (OpenAI-compatible `model_not_found`,
        // e.g. Featherless/OpenRouter-style `vendor/model` typos). Credentials
        // are still valid (the endpoint responded), but silently passing this
        // hides the bad model id from the user until a real request later trips
        // the per-model lockout — surface it as a warning at Check time instead.
        if (chatRes.status === 404) {
            let modelNotFoundDetail = "";
            try {
                const body = await chatRes.json();
                const err = body?.error;
                if (typeof err?.message === "string" && err.message.trim()) {
                    modelNotFoundDetail = `: ${err.message.trim()}`;
                }
            } catch  {
            // Non-JSON or unreadable body — fall through with the generic warning.
            }
            return {
                valid: true,
                error: null,
                method: "inference_available",
                warning: `Model ID may not exist at this provider (404)${modelNotFoundDetail}`
            };
        }
        // 4xx other than auth (e.g. 400 bad model, 422) usually means auth passed
        if (chatRes.status >= 400 && chatRes.status < 500) {
            return {
                valid: true,
                error: null,
                method: "inference_available"
            };
        }
        if (chatRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${chatRes.status})`
            };
        }
    } catch  {
    // Chat test also failed — fall through to simple connectivity check
    }
    // Step 3: Final fallback — simple connectivity check
    // For local providers (Ollama, LM Studio, etc.) that may not respond to
    // standard OpenAI endpoints but are still reachable
    if (!modelsReachable) {
        return {
            valid: false,
            error: "Connection failed while testing /chat/completions"
        };
    }
    try {
        const pingRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(baseUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        // If the server responds at all (even with an error page), it's reachable
        if (pingRes.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Provider unavailable (${pingRes.status})`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/anthropicFormat.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateAnthropicCompatibleProvider",
    ()=>validateAnthropicCompatibleProvider,
    "validateAnthropicLikeProvider",
    ()=>validateAnthropicLikeProvider,
    "validateClaudeCodeCompatibleProvider",
    ()=>validateClaudeCodeCompatibleProvider,
    "validateClaudeOAuthInline",
    ()=>validateClaudeOAuthInline
]);
// Anthropic/Claude-format provider key validators (anthropic-like, claude-oauth-inline, anthropic-compatible, claude-code-compatible).
// Extracted from validation.ts (god-file decomposition) — top-level functions; behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function validateAnthropicLikeProvider({ apiKey, baseUrl, modelId = "claude-3-5-sonnet-20240620", headers = {}, providerSpecificData = {}, isLocal = false }) {
    try {
        if (!baseUrl) {
            return {
                valid: false,
                error: "Missing base URL"
            };
        }
        if (typeof apiKey === "string" && apiKey.startsWith("sk-ant-oat")) {
            return validateClaudeOAuthInline({
                apiKey,
                modelId,
                providerSpecificData
            });
        }
        const probeUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelsSuffix"])(baseUrl);
        // Best-effort /models probe. It must not fail validation: canonical Claude
        // base URLs can already include a path/query (…/messages?beta=true).
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(probeUrl, {
                headers: {
                    "anthropic-version": "2023-06-01",
                    ...headers
                }
            }, isLocal);
        } catch  {
        // ignore probe failures
        }
        const requestUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : "";
        if (requestUrl) {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(requestUrl, {
                headers: {
                    "anthropic-version": "2023-06-01",
                    ...headers
                }
            }, isLocal);
            if (response.status === 401 || response.status === 403) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
        }
        const requestHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            "Content-Type": "application/json",
            ...headers
        }, providerSpecificData);
        if (!requestHeaders["x-api-key"] && !requestHeaders["X-API-Key"]) {
            requestHeaders["x-api-key"] = apiKey;
        }
        if (!requestHeaders["anthropic-version"] && !requestHeaders["Anthropic-Version"]) {
            requestHeaders["anthropic-version"] = "2023-06-01";
        }
        const testModelId = providerSpecificData?.validationModelId || modelId || "claude-3-5-sonnet-20241022";
        const chatResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(baseUrl, {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify({
                model: testModelId,
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        }, isLocal);
        if (chatResponse.status === 401 || chatResponse.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateClaudeOAuthInline({ apiKey, modelId, providerSpecificData = {} }) {
    const testModelId = providerSpecificData?.validationModelId || modelId || "claude-haiku-4-5-20251001";
    try {
        const { getExecutor } = await __turbopack_context__.A("[project]/open-sse/executors/index.ts [instrumentation] (ecmascript, async loader)");
        const { response } = await getExecutor("claude").execute({
            model: testModelId,
            body: {
                model: testModelId,
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            },
            stream: false,
            credentials: {
                accessToken: apiKey,
                providerSpecificData
            }
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid OAuth token"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAnthropicCompatibleProvider({ apiKey, providerSpecificData = {}, isLocal = false }) {
    let baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAnthropicBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "No base URL configured for Anthropic compatible provider"
        };
    }
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        Authorization: `Bearer ${apiKey}`
    }, providerSpecificData);
    // Step 1: Best-effort GET /models probe. /models is NOT part of the Anthropic API spec
    // and many compatible proxies either 404, 401, or 403 on /models even with a valid key —
    // so a 401/403 here must NOT mark the credentials invalid. Only a 2xx is a positive
    // signal that the proxy DOES implement /models AND the key was accepted; everything else
    // (including auth-shaped statuses) falls through to the authoritative POST /v1/messages
    // probe below. Ported from decolua/9router 584cf66a.
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinBaseUrlAndPath"])(baseUrl, providerSpecificData?.modelsPath || "/models"), {
            method: "GET",
            headers
        }, isLocal);
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null
            };
        }
    } catch  {
    // /models fetch failed — fall through to messages test
    }
    // Step 2: Authoritative probe — POST /v1/messages with max_tokens=1.
    const testModelId = providerSpecificData?.validationModelId || "claude-3-5-sonnet-20241022";
    try {
        const messagesRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinBaseUrlAndPath"])(baseUrl, providerSpecificData?.chatPath || "/messages"), {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: testModelId,
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        }, isLocal);
        if (messagesRes.status === 401 || messagesRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any other response (200, 400, 422, etc.) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateClaudeCodeCompatibleProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeClaudeCodeCompatibleBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "No base URL configured for CC Compatible provider"
        };
    }
    const modelsPath = providerSpecificData?.modelsPath || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_MODELS_PATH"];
    const chatPath = providerSpecificData?.chatPath || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH"];
    const defaultHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleHeaders"])(apiKey, false), providerSpecificData);
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, modelsPath), {
            method: "GET",
            headers: defaultHeaders
        });
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "models_endpoint"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
    } catch  {
    // Fall through to bridge request validation.
    }
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleValidationPayload"])(providerSpecificData?.validationModelId || "claude-sonnet-4-6");
    const sessionId = JSON.parse(payload.metadata.user_id).session_id;
    try {
        const messagesRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, chatPath), {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleHeaders"])(apiKey, true, sessionId), providerSpecificData),
            body: JSON.stringify(payload)
        });
        if (messagesRes.status === 401 || messagesRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (messagesRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "cc_bridge_request",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (messagesRes.status >= 400 && messagesRes.status < 500) {
            return {
                valid: true,
                error: null,
                method: "cc_bridge_request",
                warning: "Bridge request reached upstream, but the model or payload was rejected"
            };
        }
        return {
            valid: messagesRes.ok,
            error: messagesRes.ok ? null : `Validation failed: ${messagesRes.status}`,
            method: "cc_bridge_request"
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/webCookie.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "bytezValidationResultFromStatus",
    ()=>bytezValidationResultFromStatus,
    "validateBytezProvider",
    ()=>validateBytezProvider,
    "validateWebCookieProvider",
    ()=>validateWebCookieProvider
]);
// Web-cookie session-ping validator + Bytez auth-only probe. Extracted from validation.ts
// (god-file decomposition) — top-level functions with no dispatcher-state captures; behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function validateWebCookieProvider({ provider, apiKey, providerSpecificData: _providerSpecificData = {} }) {
    try {
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
        const cookieProvider = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][provider];
        if (!entry && !cookieProvider) {
            return {
                valid: false,
                error: "Provider not found in registry",
                unsupported: true
            };
        }
        // For web-cookie providers, apiKey contains the cookie string
        const cookie = (apiKey || "").trim();
        if (!cookie) {
            return {
                valid: false,
                error: "Cookie required for web-cookie provider",
                unsupported: false
            };
        }
        if (!entry) {
            // Providers listed in WEB_COOKIE_PROVIDERS without a providerRegistry entry (e.g.
            // gemini-business, poe-web, venice-web, v0-vercel-web) only expose a
            // marketing website URL, not a real API host. Probing `${website}/models`
            // does not reliably signal session validity for these —
            // live verification showed most return redirects or SPA 200s regardless of
            // cookie validity, which would silently report an expired/garbage cookie as
            // "OK" (worse than an honest "not supported"). Until each of these providers
            // has a verified, side-effect-free auth probe against its real API host, report
            // unsupported instead of a false positive.
            return {
                valid: false,
                error: "Provider validation not supported",
                unsupported: true
            };
        }
        // Attempt a minimal request to check if the session is valid
        // Use /models endpoint or a minimal completion request depending on the provider
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(entry.baseUrl || "");
        // Defense-in-depth: only an http(s) baseUrl without a query string is safe to
        // probe by blindly appending `/models`. A ws(s):// baseUrl (e.g. copilot-web) is
        // already rejected by the outbound URL guard downstream, but reject it explicitly
        // here for the honest "unsupported" result instead of a confusing security-block
        // message — this also covers a future http(s) baseUrl carrying a query string,
        // which the guard does not currently block (#7857 acceptance criteria).
        if (!/^https?:\/\//i.test(baseUrl) || baseUrl.includes("?")) {
            return {
                valid: false,
                error: "Provider validation not supported",
                unsupported: true
            };
        }
        const testUrl = `${baseUrl}/models`;
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(testUrl, {
            method: "GET",
            headers: {
                "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["STANDARD_USER_AGENT"],
                Cookie: cookie
            }
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(provider));
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "SESSION_EXPIRED",
                errorCode: "AUTH_007",
                unsupported: false
            };
        }
        // #7857: for providers whose baseUrl is a conversation/completion endpoint rather
        // than a real API root, the /models path never existed upstream — a redirect,
        // login-HTML 200, 404, 405, or 429 from it is not a meaningful auth signal and is
        // indistinguishable from a genuinely valid session. Report the same honest
        // "unsupported" result the !entry branch above already gives its no-registry
        // siblings, instead of a false `valid: true`.
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API"].has(provider)) {
            return {
                valid: false,
                error: "Provider validation not supported",
                unsupported: true
            };
        }
        // Any other response (200, 404, 405, 429, ...) means the cookie was accepted —
        // a 401/403 from the /models probe is the only definitive "session expired" signal
        // for web-cookie auth, so a non-auth status is treated as a valid session.
        return {
            valid: true,
            error: null,
            unsupported: false
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toWebCookieValidationErrorResult"])(provider, error);
    }
}
function bytezValidationResultFromStatus(status) {
    if (status === 200) {
        return {
            valid: true,
            error: null
        };
    }
    if (status === 401 || status === 403) {
        return {
            valid: false,
            error: "Invalid API key"
        };
    }
    return {
        valid: false,
        error: `Validation failed: ${status}`
    };
}
async function validateBytezProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])("https://api.bytez.com/models/v2/list/tasks", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        return bytezValidationResultFromStatus(res.status);
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/nvidiaValidationModel.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * NVIDIA NIM key-validation probe model (#3116).
 *
 * Key validation does a tiny chat/completions probe and only cares whether auth passes
 * (401/403 ⇒ bad key; anything else ⇒ key OK). The probe model therefore must be one
 * that responds quickly for every account. The previous default was the first model in
 * the catalog (`z-ai/glm-5.1`), which requires the "Public API Endpoints" account
 * permission and has had DEGRADED windows — accounts lacking that permission see the
 * probe HANG until the validation timeout, which surfaces as a misleading "Upstream
 * Error" on an otherwise-valid key.
 *
 * `meta/llama-3.1-8b-instruct` is a long-lived, universally-available NIM model (no
 * special permission), so it is a far more reliable auth probe. A connection may still
 * override it via `providerSpecificData.validationModelId`.
 */ __turbopack_context__.s([
    "NVIDIA_DEFAULT_VALIDATION_MODEL",
    ()=>NVIDIA_DEFAULT_VALIDATION_MODEL,
    "resolveNvidiaValidationModel",
    ()=>resolveNvidiaValidationModel
]);
const NVIDIA_DEFAULT_VALIDATION_MODEL = "meta/llama-3.1-8b-instruct";
function resolveNvidiaValidationModel(providerSpecificData) {
    const override = providerSpecificData?.validationModelId;
    if (typeof override === "string" && override.trim()) return override.trim();
    return NVIDIA_DEFAULT_VALIDATION_MODEL;
}
}),
"[project]/src/lib/providers/validation/kiro.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Kiro runtime probe — falls back to a generateAssistantResponse call when an API key
// cannot list profiles. Extracted from validation.ts (god-file decomposition) — top-level
// function with no dispatcher-state captures; behavior is byte-identical to the original
// inline def.
__turbopack_context__.s([
    "validateKiroApiKeyRuntimeProbe",
    ()=>validateKiroApiKeyRuntimeProbe
]);
async function validateKiroApiKeyRuntimeProbe({ apiKey, region, profileArn }) {
    const endpoint = region === "us-east-1" ? "https://codewhisperer.us-east-1.amazonaws.com/generateAssistantResponse" : `https://q.${region}.amazonaws.com/generateAssistantResponse`;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 15_000);
    try {
        const body = {
            ...profileArn ? {
                profileArn
            } : {},
            conversationState: {
                chatTriggerType: "MANUAL",
                conversationId: crypto.randomUUID(),
                currentMessage: {
                    userInputMessage: {
                        content: "ping",
                        modelId: "auto",
                        origin: "AI_EDITOR"
                    }
                },
                history: []
            },
            inferenceConfig: {
                maxTokens: 1
            }
        };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                tokentype: "API_KEY",
                "Content-Type": "application/x-amz-json-1.0",
                "X-Amz-Target": "AmazonCodeWhispererStreamingService.GenerateAssistantResponse",
                Accept: "application/vnd.amazon.eventstream",
                "Amz-Sdk-Request": "attempt=1; max=3",
                "Amz-Sdk-Invocation-Id": crypto.randomUUID()
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        await res.body?.cancel().catch(()=>undefined);
        if (res.ok) {
            return {
                valid: true,
                error: null,
                method: "kiro_generate_assistant_response"
            };
        }
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid Kiro API key or AWS region"
            };
        }
        if (res.status === 400 || res.status === 422 || res.status === 429) {
            return {
                valid: true,
                error: null,
                method: `kiro_generate_assistant_response_${res.status}`
            };
        }
        return {
            valid: false,
            error: `Kiro validation failed: ${res.status}`
        };
    } finally{
        clearTimeout(timeout);
    }
}
}),
"[project]/src/lib/providers/validation/specialtyInline.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildGitlawbValidators",
    ()=>buildGitlawbValidators,
    "buildOpengatewayValidator",
    ()=>buildOpengatewayValidator,
    "validateAuggieProvider",
    ()=>validateAuggieProvider,
    "validateGitlabProvider",
    ()=>validateGitlabProvider,
    "validateKiroProvider",
    ()=>validateKiroProvider,
    "validateLongcatProvider",
    ()=>validateLongcatProvider,
    "validateNvidiaProvider",
    ()=>validateNvidiaProvider,
    "validateQoderProvider",
    ()=>validateQoderProvider,
    "validateV0VercelProvider",
    ()=>validateV0VercelProvider,
    "validateVertexPartnerProvider",
    ()=>validateVertexPartnerProvider,
    "validateVertexProvider",
    ()=>validateVertexProvider,
    "validateXiaomiMimoProvider",
    ()=>validateXiaomiMimoProvider,
    "validateZaiProvider",
    ()=>validateZaiProvider
]);
// Inline specialty provider validators that previously lived as closures inside the
// SPECIALTY_VALIDATORS map in validation.ts. Extracted (god-file decomposition) as top-level
// functions taking `isLocal` where the original closure captured it; behavior is byte-identical
// to the original inline defs. The host dispatcher still owns the SPECIALTY_VALIDATORS map
// construction + dispatch — these are just the leaf validator bodies.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCli$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/qoderCli.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/services/kiro.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$nvidiaValidationModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/nvidiaValidationModel.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/kiro.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
async function validateV0VercelProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const configuredBaseUrl = typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim() : "https://api.v0.dev";
        const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(configuredBaseUrl).replace(/\/v1\/chat\/completions$/, "").replace(/\/v1$/, "");
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(`${root}/v1/chats?limit=1`, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        }, isLocal);
        if (res.ok) {
            return {
                valid: true,
                error: null,
                method: "v0_platform_chats_list"
            };
        }
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `v0 validation failed: ${res.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAuggieProvider() {
    const { checkAuggieCliVersion } = await __turbopack_context__.A("[project]/open-sse/executors/auggie.ts [instrumentation] (ecmascript, async loader)");
    const result = await checkAuggieCliVersion();
    if (!result.ok) {
        return {
            valid: false,
            error: result.error || "Auggie CLI not found. Install it and run `auggie login`.",
            unsupported: false
        };
    }
    return {
        valid: true,
        error: null,
        unsupported: false,
        method: result.version
    };
}
async function validateQoderProvider({ apiKey, providerSpecificData }) {
    // Bifurcate validation: PAT tokens use Cosy auth against api1.qoder.sh;
    // regular API keys validate against dashscope (OpenAI-compatible endpoint).
    const key = (apiKey || "").trim();
    if (key.startsWith("pt-")) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCli$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateQoderCliPat"])({
            apiKey: key,
            providerSpecificData
        });
    }
    // Non-PAT token → validate against dashscope (Alibaba Cloud).
    // The executor routes these tokens to dashscope.aliyuncs.com, so the
    // validation must test against dashscope, NOT the Cosy PAT endpoint.
    try {
        const dashscopeUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/models";
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationRead"])(dashscopeUrl, {
            headers: {
                Authorization: `Bearer ${key}`
            }
        }, false);
        if (res.ok) return {
            valid: true,
            error: null
        };
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid Qoder API key. Make sure you're using a valid API key from Qoder / Alibaba Cloud Dashscope."
            };
        }
        // 4xx/5xx other than auth — treat as valid bypass to prevent false
        // negatives from transient dashscope issues (consistent with PAT path).
        return {
            valid: true,
            error: null
        };
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(err);
    }
}
async function validateKiroProvider({ apiKey, providerSpecificData }) {
    try {
        const region = providerSpecificData?.region || "us-east-1";
        const credential = await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["KiroService"]().validateApiKey(apiKey, region);
        if (!credential.profileArn) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateKiroApiKeyRuntimeProbe"])({
                apiKey: credential.accessToken,
                region: credential.region,
                profileArn: providerSpecificData?.profileArn
            });
        }
        return {
            valid: true,
            error: null,
            method: "kiro_list_available_profiles"
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateGitlabProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const configuredBaseUrl = typeof providerSpecificData?.baseUrl === "string" ? providerSpecificData.baseUrl.trim() : "";
        const root = (configuredBaseUrl || "https://gitlab.com").replace(/\/$/, "");
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(`${root}/api/v4/code_suggestions/direct_access`, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: "{}"
        }, isLocal);
        if (res.status === 401) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateVertexProvider({ apiKey }) {
    try {
        const { parseSAFromApiKey, getAccessToken, isExpressApiKey } = await __turbopack_context__.A("[project]/open-sse/executors/vertex.ts [instrumentation] (ecmascript, async loader)");
        // Express-mode API keys are opaque strings sent directly as the ?key= query param — there is
        // no JWT to mint, so accept any non-empty Express key (the live chat/media call validates it).
        if (isExpressApiKey(apiKey)) {
            return {
                valid: true,
                error: null
            };
        }
        const sa = parseSAFromApiKey(apiKey);
        // Validates credentials by successfully successfully exchanging them for a JWT from Google Identity
        await getAccessToken(sa);
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return {
            valid: false,
            error: "Invalid Service Account JSON: " + error.message
        };
    }
}
async function validateVertexPartnerProvider({ apiKey }) {
    try {
        const { parseSAFromApiKey, getAccessToken, isExpressApiKey } = await __turbopack_context__.A("[project]/open-sse/executors/vertex.ts [instrumentation] (ecmascript, async loader)");
        if (isExpressApiKey(apiKey)) {
            return {
                valid: true,
                error: null
            };
        }
        const sa = parseSAFromApiKey(apiKey);
        await getAccessToken(sa);
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return {
            valid: false,
            error: "Invalid Service Account JSON: " + error.message
        };
    }
}
async function validateLongcatProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.longcat.chat/openai/v1/chat/completions", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: "LongCat-2.0",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, isLocal);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any non-auth response (200, 400, 422) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateNvidiaProvider({ apiKey, providerSpecificData }) {
    try {
        const baseUrlRaw = providerSpecificData?.baseUrl || "https://integrate.api.nvidia.com/v1/chat/completions";
        const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(baseUrlRaw);
        const chatBase = normalized.replace(/\/models$/, "");
        const chatUrl = normalized.endsWith("/chat/completions") ? normalized : `${chatBase}/chat/completions`;
        // #3116: probe a universally-available model rather than models[0]
        // (z-ai/glm-5.1), which requires the "Public API Endpoints" account permission
        // and can hang/be DEGRADED — making a *valid* key fail with "Upstream Error".
        const modelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$nvidiaValidationModel$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveNvidiaValidationModel"])(providerSpecificData);
        // #3226: use raw https (bypass the proxy/TLS-patched fetch) — the undici
        // dispatcher stalls against NVIDIA's endpoint, causing a 504 timeout.
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["directHttpsRequest"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, 20000);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any non-auth response (200, 400, 422, 429) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateZaiProvider({ apiKey, providerSpecificData }) {
    try {
        // providerSpecificData.baseUrl allows test overrides to point at a local
        // HTTP server; production always uses the fixed api.z.ai endpoint.
        const messagesUrl = providerSpecificData?.baseUrl ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl).split("?")[0]}?beta=true` : "https://api.z.ai/api/anthropic/v1/messages?beta=true";
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["directHttpsRequest"])(messagesUrl, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "glm-5.1",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, 20000);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (res.status === 404 || res.status === 405) {
            return {
                valid: false,
                error: "Provider validation endpoint not supported"
            };
        }
        if (res.status >= 500 && res.status !== 502) {
            return {
                valid: false,
                error: `Provider unavailable (${res.status})`
            };
        }
        // Any non-auth response (200, 400, 422, 429, 502) means auth passed;
        // 502 "job timed out" is z.ai's own server-side queue limit, not an auth error.
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateXiaomiMimoProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData?.baseUrl || "https://api.xiaomimimo.com/v1");
        const chatUrl = `${baseUrl.replace(/\/chat\/completions$/, "")}/chat/completions`;
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: "mimo-v2.5-pro",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, isLocal);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any non-auth response (200, 400, 422, 429) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function buildOpengatewayValidator(defaultBaseUrl, model) {
    return async ({ apiKey, providerSpecificData, isLocal })=>{
        try {
            const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData?.baseUrl || defaultBaseUrl);
            const chatUrl = `${baseUrl.replace(/\/chat\/completions$/, "")}/chat/completions`;
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
                method: "POST",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: "test"
                        }
                    ],
                    max_tokens: 1
                })
            }, isLocal);
            if (res.status === 401 || res.status === 403) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
            // Any non-auth response (200, 400, 422, 429) means auth passed
            return {
                valid: true,
                error: null
            };
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    };
}
function buildGitlawbValidators(configs, isLocal) {
    return Object.fromEntries(configs.map(([id, baseUrl, model])=>[
            id,
            ({ apiKey, providerSpecificData })=>buildOpengatewayValidator(baseUrl, model)({
                    apiKey,
                    providerSpecificData,
                    isLocal
                })
        ]));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateProviderApiKey",
    ()=>validateProviderApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/rerankRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modal$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modal.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/imageValidation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/webProvidersA.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/webProvidersB.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/cloudProviders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/audioMiscProviders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/searchProviders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/embeddingProviders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/openaiFormat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/anthropicFormat.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/webCookie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/specialtyInline.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function validateProviderApiKey({ provider, apiKey, providerSpecificData = {} }) {
    const requiresApiKey = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["providerAllowsOptionalApiKey"])(provider);
    const isLocal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(provider);
    if (!provider || requiresApiKey && !apiKey) {
        return {
            valid: false,
            error: "Provider and API key required",
            unsupported: false
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(provider)) {
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateOpenAICompatibleProvider"])({
                apiKey,
                providerSpecificData
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(provider)) {
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(provider)) {
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateClaudeCodeCompatibleProvider"])({
                    apiKey,
                    providerSpecificData
                });
            }
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAnthropicCompatibleProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    // buildOpengatewayValidator + buildGitlawbValidators now live in ./validation/specialtyInline
    // (god-file decomposition). The host still owns the SPECIALTY_VALIDATORS map below; only the
    // validator bodies were extracted as leaf functions taking `isLocal` where the original
    // closure captured it.
    // ── Specialty provider validation ──
    const SPECIALTY_VALIDATORS = {
        "v0-vercel": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateV0VercelProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        jules: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateJulesProvider"],
        // "devin" is the Cognition cloud-agent provider (distinct from the "devin-cli"
        // LLM/ACP provider, which is already registered in providerRegistry). Wired here
        // for parity with the "jules" cloud-agent entry above — see #6142.
        devin: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDevinCloudAgentProvider"],
        auggie: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAuggieProvider"],
        qoder: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateQoderProvider"],
        kiro: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateKiroProvider"],
        "command-code": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateCommandCodeProvider"],
        huggingface: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateHuggingFaceProvider"],
        // #5422: auth-only probe — Bytez 404s on every chat model until the account adds it to
        // its catalog, so the generic chat probe can't validate a fresh key.
        bytez: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateBytezProvider"],
        deepgram: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDeepgramProvider"],
        assemblyai: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAssemblyAIProvider"],
        "rev-ai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateRevAiProvider"],
        "fal-ai": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "fal-ai",
                apiKey,
                providerSpecificData
            }),
        "stability-ai": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "stability-ai",
                apiKey,
                providerSpecificData
            }),
        "black-forest-labs": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "black-forest-labs",
                apiKey,
                providerSpecificData
            }),
        recraft: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "recraft",
                apiKey,
                providerSpecificData
            }),
        topaz: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "topaz",
                apiKey,
                providerSpecificData
            }),
        elevenlabs: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateElevenLabsProvider"],
        inworld: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateInworldProvider"],
        kie: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateKieProvider"],
        "aws-polly": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAwsPollyProvider"],
        "bailian-coding-plan": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateBailianCodingPlanProvider"],
        "qwen-cloud-token-plan": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateQwenCloudTokenPlanProvider"],
        heroku: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateHerokuProvider"],
        databricks: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDatabricksProvider"],
        datarobot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDataRobotProvider"],
        watsonx: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateWatsonxProvider"],
        oci: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateOciProvider"],
        sap: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateSapProvider"],
        bedrock: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateBedrockProvider"],
        modal: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateOpenAILikeProvider"])({
                provider: "modal",
                apiKey,
                providerSpecificData,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData?.baseUrl || ""),
                modelId: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modal$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["MODAL_DEFAULT_VALIDATION_MODEL_ID"],
                isLocal
            }),
        "nous-research": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateNousResearchProvider"],
        poe: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validatePoeProvider"],
        clarifai: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateClarifaiProvider"],
        reka: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateRekaProvider"],
        maritalk: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateMaritalkProvider"],
        nlpcloud: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateNlpCloudProvider"],
        runwayml: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateRunwayProvider"],
        snowflake: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateSnowflakeProvider"],
        gigachat: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateGigachatProvider"],
        "deepseek-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateDeepSeekWebProvider"],
        "grok-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateGrokWebProvider"],
        "qwen-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateQwenWebProvider"],
        "kimi-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateKimiWebProvider"],
        "chatgpt-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateChatGptWebProvider"],
        "perplexity-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validatePerplexityWebProvider"],
        "blackbox-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateBlackboxWebProvider"],
        "muse-spark-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateMuseSparkWebProvider"],
        "inner-ai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateInnerAiProvider"],
        "adapta-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAdaptaWebProvider"],
        "claude-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateClaudeWebProvider"],
        "gemini-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateGeminiWebProvider"],
        "notion-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateNotionWebProvider"],
        "copilot-m365-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateCopilotM365WebProvider"],
        "copilot-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateCopilotWebProvider"],
        "t3-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateT3WebProvider"],
        "azure-openai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAzureOpenAIProvider"],
        "azure-ai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAzureAiProvider"],
        "voyage-ai": ({ apiKey, providerSpecificData })=>{
            const embeddingProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getEmbeddingProvider"])("voyage-ai");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateEmbeddingApiProvider"])({
                apiKey,
                providerSpecificData,
                url: embeddingProvider?.baseUrl,
                modelId: embeddingProvider?.models?.[0]?.id || "voyage-4-lite"
            });
        },
        "jina-ai": ({ apiKey, providerSpecificData })=>{
            const rerankProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRerankProvider"])("jina-ai");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateRerankApiProvider"])({
                apiKey,
                providerSpecificData,
                url: rerankProvider?.baseUrl,
                modelId: rerankProvider?.models?.[0]?.id || "jina-reranker-v3"
            });
        },
        gitlab: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateGitlabProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        vertex: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateVertexProvider"],
        "vertex-partner": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateVertexPartnerProvider"],
        longcat: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateLongcatProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        nvidia: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateNvidiaProvider"],
        zai: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateZaiProvider"],
        "xiaomi-mimo": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateXiaomiMimoProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        // Gitlawb Opengateway — Xiaomi MiMo compatible, same /models endpoint limitation.
        // Bypass /models probe in favor of chat/completions, matching xiaomi-mimo's pattern.
        // Uses a factory to share validation logic across Opengateway provider variants.
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGitlawbValidators"])([
            [
                "gitlawb",
                "https://opengateway.gitlawb.com/v1/xiaomi-mimo",
                "mimo-v2.5-pro"
            ],
            [
                "gitlawb-gmi",
                "https://opengateway.gitlawb.com/v1/gmi-cloud",
                "XiaomiMiMo/MiMo-V2.5-Pro"
            ]
        ], isLocal),
        // Search providers — use factored validator
        ...Object.fromEntries(Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SEARCH_VALIDATOR_CONFIGS"]).map(([id, configFn])=>[
                id,
                ({ apiKey, providerSpecificData })=>{
                    const { url, init } = configFn(apiKey, providerSpecificData);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateSearchProvider"])(url, init, providerSpecificData, isLocal);
                }
            ]))
    };
    if (SPECIALTY_VALIDATORS[provider]) {
        try {
            return await SPECIALTY_VALIDATORS[provider]({
                apiKey,
                providerSpecificData
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    // Web-cookie providers WITHOUT a dedicated specialty validator above fall back to the generic
    // session-ping check (AUTH_007 SESSION_EXPIRED on 401/403). Providers that DO have a rich
    // per-provider validator (grok-web, chatgpt-web, claude-web, …) are handled by
    // SPECIALTY_VALIDATORS first and must not be shadowed by this generic probe (issue: the
    // #4023 dispatch was placed too early and intercepted every web-cookie provider).
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][provider]) {
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateWebCookieProvider"])({
                provider,
                apiKey,
                providerSpecificData
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    if (!entry) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isSelfHostedChatProvider"])(provider)) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateOpenAILikeProvider"])({
                provider,
                apiKey,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBaseUrl"])(null, providerSpecificData),
                providerSpecificData,
                modelId: "local-model",
                modelsUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addModelsSuffix"])(providerSpecificData?.baseUrl || ""),
                isLocal
            });
        }
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    }
    const modelId = entry.models?.[0]?.id || null;
    // (#532) Use testKeyBaseUrl if defined — some providers validate keys on a different endpoint
    // than where requests are sent (e.g. opencode-go validates on zen/v1, not zen/go/v1)
    const validationEntry = entry.testKeyBaseUrl ? {
        ...entry,
        baseUrl: entry.testKeyBaseUrl
    } : entry;
    const usesAlibabaRegionalEndpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAlibabaRegionalProvider"])(provider);
    const baseUrl = usesAlibabaRegionalEndpoint ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlibabaProviderBaseUrl"])(provider, providerSpecificData, validationEntry.baseUrl) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveBaseUrl"])(validationEntry, providerSpecificData);
    try {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["OPENAI_LIKE_FORMATS"].has(entry.format)) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateOpenAILikeProvider"])({
                apiKey,
                baseUrl,
                headers: entry.headers || {},
                providerSpecificData,
                modelId,
                modelsUrl: usesAlibabaRegionalEndpoint ? "" : entry.testKeyModelsUrl || entry.modelsUrl,
                isLocal
            });
        }
        if (entry.format === "claude") {
            // Built-in CC-wire-image providers (e.g. agentrouter, #6056/#6255) gate
            // their WAF on the dynamic Claude-Code fingerprint (User-Agent,
            // `?beta=true` chat path, anthropic-beta/x-app/X-Stainless-* headers).
            // The real chat-request path already routes through
            // buildProviderUrl/buildProviderHeaders for this; the validation probe
            // must use the SAME wire image or a genuinely valid key gets 403'd as
            // "unauthorized client detected" (#6377).
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider)) {
                const requestBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildProviderUrl"])(provider, modelId, true, {
                    baseUrl
                });
                const requestHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildProviderHeaders"])(provider, {
                    apiKey
                }, true);
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAnthropicLikeProvider"])({
                    apiKey,
                    baseUrl: requestBaseUrl,
                    modelId,
                    headers: requestHeaders,
                    providerSpecificData,
                    isLocal
                });
            }
            const requestBaseUrl = `${baseUrl}${entry.urlSuffix || ""}`;
            const requestHeaders = {
                ...entry.headers || {}
            };
            if ((entry.authHeader || "").toLowerCase() === "x-api-key") {
                requestHeaders["x-api-key"] = apiKey;
            } else {
                requestHeaders["Authorization"] = `Bearer ${apiKey}`;
            }
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateAnthropicLikeProvider"])({
                apiKey,
                baseUrl: requestBaseUrl,
                modelId,
                headers: requestHeaders,
                providerSpecificData,
                isLocal
            });
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GEMINI_LIKE_FORMATS"].has(entry.format)) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["validateGeminiLikeProvider"])({
                apiKey,
                baseUrl,
                providerSpecificData,
                authType: entry.authType,
                isLocal
            });
        }
        if (entry.format === "antigravity") {
            const expiresAt = providerSpecificData?.tokenExpiresAt || providerSpecificData?.expiresAt || providerSpecificData?.expiry_date || providerSpecificData?.expiryDate;
            const expiryMs = typeof expiresAt === "number" ? expiresAt : typeof expiresAt === "string" && expiresAt.trim() ? Date.parse(expiresAt) : Number.NaN;
            if (Number.isFinite(expiryMs) && expiryMs > 0 && expiryMs < Date.now()) {
                return {
                    valid: false,
                    error: "Antigravity OAuth token has expired. Re-import or refresh the CLI login.",
                    unsupported: false
                };
            }
            return {
                valid: true,
                error: null,
                unsupported: false
            };
        }
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_providers_1lc47zj._.js.map