module.exports = [
"[project]/open-sse/utils/cacheControlPolicy.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cache Control Policy
 *
 * Determines when to preserve client-side prompt caching headers (cache_control)
 * vs. applying OmniRoute's own caching strategy.
 *
 * Client-side caching (e.g., Claude Code) is preserved when:
 * 1. Client is Claude Code or similar caching-aware client
 * 2. Provider supports prompt caching (Anthropic, etc.)
 *
 * Combo membership / routing strategy no longer gates preservation: rewriting a
 * caching-aware client's markers produced per-request breakpoint positions that
 * thrashed the provider prompt cache, while preserving them is never worse
 * (see shouldPreserveCacheControl).
 */ __turbopack_context__.s([
    "isClaudeCodeClient",
    ()=>isClaudeCodeClient,
    "isDeterministicStrategy",
    ()=>isDeterministicStrategy,
    "providerHonorsOpenAIFormatCacheControl",
    ()=>providerHonorsOpenAIFormatCacheControl,
    "providerSupportsCaching",
    ()=>providerSupportsCaching,
    "resolveConnectionCacheOverride",
    ()=>resolveConnectionCacheOverride,
    "shouldPreserveCacheControl",
    ()=>shouldPreserveCacheControl,
    "trackCacheMetrics",
    ()=>trackCacheMetrics,
    "updateCacheTokenMetrics",
    ()=>updateCacheTokenMetrics
]);
/**
 * Routing strategies that are deterministic (same request → same provider)
 */ const DETERMINISTIC_STRATEGIES = new Set([
    "priority",
    "cost-optimized"
]);
/**
 * Providers that support prompt caching
 */ const CACHING_PROVIDERS = new Set([
    "claude",
    "anthropic",
    "zai",
    "deepseek",
    // Kimi Code's OpenAI protocol requires prompt_cache_key for Coding Plan
    // cache affinity. The OAuth card and hidden API-key compatibility ID share
    // the same upstream API.
    "kimi-coding",
    "kimi-coding-apikey",
    // #3088 — Xiaomi MiMo honors OpenAI-format cache_control breakpoints. Without
    // this entry, shouldPreserveCacheControl() returns false for Claude Code
    // clients and filterToOpenAIFormat() strips cache_control, so Xiaomi never
    // sees the cache hints and every request is a cache miss.
    "xiaomi-mimo",
    // #3955 — OpenAI / Codex / Azure-OpenAI use AUTOMATIC prefix caching: the longest
    // matching prefix of a request is cached upstream WITHOUT any explicit cache_control
    // markers. They must count as caching providers so the cache-aware compression guard
    // preserves the cacheable prefix (system prompt / earliest messages) instead of
    // rewriting it and forcing a cache miss. This also activates the intended
    // `prompt_cache_key` cache-routing hint for OpenAI in chatCore.
    "openai",
    "codex",
    "azure",
    // #2069 — DashScope's OpenAI-compatible endpoints (Alibaba Model Studio and
    // Qwen Cloud pay-as-you-go, upstream "alicode"/"alicode-intl") natively honor
    // `cache_control: {type:"ephemeral"}` breakpoints. Without these entries
    // shouldPreserveCacheControl() returns false for Claude Code clients and the
    // OpenAI-format translator strips cache_control, so DashScope never sees the
    // hints and every request is a cache miss.
    "alibaba",
    "alibaba-cn",
    "qwen-cloud"
]);
/**
 * Providers that honor EXPLICIT `cache_control` breakpoints carried inside an
 * OpenAI-format request body (i.e. the markers must be passed THROUGH the
 * Claude→OpenAI translation instead of stripped).
 *
 * This is a strict subset of CACHING_PROVIDERS and deliberately excludes
 * `openai` / `codex` / `azure`: those use AUTOMATIC prefix caching (#3955) and
 * do NOT accept explicit `cache_control` fields in the request — forwarding the
 * markers there is meaningless at best and a 400 "unknown field" at worst, and
 * it broke the chatCore "strips cache markers for non-Claude providers" test.
 * Claude-format providers re-inject markers via prepareClaudeRequest, so they
 * are not listed here either.
 */ const OPENAI_FORMAT_CACHE_CONTROL_PROVIDERS = new Set([
    // #2069 — DashScope OpenAI-compatible endpoints accept ephemeral breakpoints.
    "alibaba",
    "alibaba-cn",
    "qwen-cloud",
    // #3088 — Xiaomi MiMo honors OpenAI-format cache_control breakpoints.
    "xiaomi-mimo"
]);
function resolveConnectionCacheOverride(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return null;
    const cache = providerSpecificData.cache;
    if (!cache || typeof cache !== "object" || Array.isArray(cache)) return null;
    const record = cache;
    const result = {};
    if (typeof record.supportsPromptCaching === "boolean") {
        result.supportsPromptCaching = record.supportsPromptCaching;
    }
    if (record.cacheControlPassthrough === "strip" || record.cacheControlPassthrough === "openai-format" || record.cacheControlPassthrough === "claude-format") {
        result.cacheControlPassthrough = record.cacheControlPassthrough;
    }
    return Object.keys(result).length > 0 ? result : null;
}
function providerHonorsOpenAIFormatCacheControl(provider, connectionCacheOverride) {
    if (connectionCacheOverride?.cacheControlPassthrough === "openai-format") return true;
    if (connectionCacheOverride?.cacheControlPassthrough === "strip") return false;
    if (!provider) return false;
    return OPENAI_FORMAT_CACHE_CONTROL_PROVIDERS.has(provider.toLowerCase());
}
function isClaudeCodeClient(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    // Claude Code user agents
    if (ua.includes("claude-code") || ua.includes("claude_code")) return true;
    if (ua.includes("claude-cli/")) return true;
    if (ua.includes("sdk-cli")) return true;
    if (ua.includes("anthropic") && ua.includes("cli")) return true;
    return false;
}
function providerSupportsCaching(provider, targetFormat, connectionCacheOverride) {
    if (typeof connectionCacheOverride?.supportsPromptCaching === "boolean") {
        return connectionCacheOverride.supportsPromptCaching;
    }
    if (!provider) return false;
    if (CACHING_PROVIDERS.has(provider.toLowerCase())) return true;
    // All Claude-protocol providers support prompt caching
    if (targetFormat === "claude") return true;
    return false;
}
function isDeterministicStrategy(strategy) {
    if (!strategy) return false;
    return DETERMINISTIC_STRATEGIES.has(strategy);
}
function shouldPreserveCacheControl({ userAgent, targetProvider, targetFormat, settings, connectionCacheOverride }) {
    // User override takes precedence
    if (settings?.alwaysPreserveClientCache === "always") {
        return true;
    }
    if (settings?.alwaysPreserveClientCache === "never") {
        return false;
    }
    // Auto mode: must be a caching-aware client…
    if (!isClaudeCodeClient(userAgent)) {
        return false;
    }
    // …talking to a provider that supports prompt caching.
    return providerSupportsCaching(targetProvider, targetFormat, connectionCacheOverride);
}
function trackCacheMetrics({ preserved, provider, strategy, metrics, inputTokens, cachedTokens, cacheCreationTokens }) {
    const now = new Date().toISOString();
    // Initialize metrics if empty
    if (!metrics) {
        metrics = {
            totalRequests: 0,
            requestsWithCacheControl: 0,
            totalInputTokens: 0,
            totalCachedTokens: 0,
            totalCacheCreationTokens: 0,
            tokensSaved: 0,
            estimatedCostSaved: 0,
            byProvider: {},
            byStrategy: {},
            lastUpdated: now
        };
    }
    // Increment total requests
    metrics.totalRequests++;
    // Track token counts
    const input = inputTokens || 0;
    const cached = cachedTokens || 0;
    const creation = cacheCreationTokens || 0;
    metrics.totalInputTokens += input;
    metrics.totalCachedTokens += cached;
    metrics.totalCacheCreationTokens += creation;
    // Calculate tokens saved (cached tokens are reused, not charged)
    if (cached > 0) {
        metrics.tokensSaved += cached;
    }
    // Only track requests where cache_control was preserved
    if (preserved) {
        metrics.requestsWithCacheControl++;
        // Initialize provider tracking
        if (!metrics.byProvider[provider]) {
            metrics.byProvider[provider] = {
                requests: 0,
                inputTokens: 0,
                cachedTokens: 0,
                cacheCreationTokens: 0
            };
        }
        metrics.byProvider[provider].requests++;
        metrics.byProvider[provider].inputTokens += input;
        metrics.byProvider[provider].cachedTokens += cached;
        metrics.byProvider[provider].cacheCreationTokens += creation;
        // Initialize strategy tracking
        if (strategy && !metrics.byStrategy[strategy]) {
            metrics.byStrategy[strategy] = {
                requests: 0,
                inputTokens: 0,
                cachedTokens: 0,
                cacheCreationTokens: 0
            };
        }
        if (strategy) {
            metrics.byStrategy[strategy].requests++;
            metrics.byStrategy[strategy].inputTokens += input;
            metrics.byStrategy[strategy].cachedTokens += cached;
            metrics.byStrategy[strategy].cacheCreationTokens += creation;
        }
    }
    metrics.lastUpdated = now;
    return metrics;
}
function updateCacheTokenMetrics({ metrics, provider, strategy, inputTokens, cachedTokens, cacheCreationTokens, costSaved }) {
    metrics.totalCachedTokens += cachedTokens;
    metrics.totalCacheCreationTokens += cacheCreationTokens;
    metrics.totalInputTokens += inputTokens;
    // Cached tokens are reused (saved), creation tokens are new cache writes
    metrics.tokensSaved += cachedTokens;
    if (costSaved !== undefined) {
        metrics.estimatedCostSaved += costSaved;
    }
    // Update provider tracking
    if (metrics.byProvider[provider]) {
        metrics.byProvider[provider].cachedTokens += cachedTokens;
        metrics.byProvider[provider].cacheCreationTokens += cacheCreationTokens;
        metrics.byProvider[provider].inputTokens += inputTokens;
    }
    // Update strategy tracking
    if (strategy && metrics.byStrategy[strategy]) {
        metrics.byStrategy[strategy].cachedTokens += cachedTokens;
        metrics.byStrategy[strategy].cacheCreationTokens += cacheCreationTokens;
        metrics.byStrategy[strategy].inputTokens += inputTokens;
    }
    metrics.lastUpdated = new Date().toISOString();
    return metrics;
}
}),
"[project]/open-sse/services/compression/cachingAware.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCachingContext",
    ()=>detectCachingContext,
    "getCacheAwareStrategy",
    ()=>getCacheAwareStrategy
]);
/**
 * Cache-aware strategy selection for AI model compression.
 * Implements logic to detect caching context from request body and adjust strategies accordingly.
 *
 * @file cachingAware.ts
 * @exports CachingContext, CacheAwareStrategy, detectCachingContext, getCacheAwareStrategy
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cacheControlPolicy.ts [instrumentation] (ecmascript)");
;
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function normalizeString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function inferProviderFromModel(model) {
    const normalized = normalizeString(model);
    if (!normalized) return null;
    const slashIndex = normalized.indexOf("/");
    if (slashIndex <= 0) return null;
    return normalized.slice(0, slashIndex).toLowerCase();
}
function hasOwnCacheControl(value) {
    return isRecord(value) && value.cache_control !== undefined && value.cache_control !== null;
}
function arrayHasCacheControl(values) {
    return Array.isArray(values) && values.some((value)=>hasCacheControl(value));
}
function hasCacheControl(value) {
    if (hasOwnCacheControl(value)) return true;
    if (Array.isArray(value)) return value.some((item)=>hasCacheControl(item));
    if (!isRecord(value)) return false;
    if (arrayHasCacheControl(value.system)) return true;
    if (arrayHasCacheControl(value.tools)) return true;
    if (arrayHasCacheControl(value.messages)) return true;
    if (arrayHasCacheControl(value.input)) return true;
    if (arrayHasCacheControl(value.contents)) return true;
    if (isRecord(value.request) && arrayHasCacheControl(value.request.contents)) return true;
    if (isRecord(value.content) || Array.isArray(value.content)) {
        return hasCacheControl(value.content);
    }
    return false;
}
function detectCachingContext(body, context = {}) {
    const bodyRecord = isRecord(body) ? body : {};
    const provider = normalizeString(context.provider)?.toLowerCase() ?? inferProviderFromModel(context.model) ?? inferProviderFromModel(bodyRecord.model);
    const targetFormat = normalizeString(context.targetFormat)?.toLowerCase() ?? null;
    return {
        hasCacheControl: hasCacheControl(body),
        provider,
        targetFormat,
        isCachingProvider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerSupportsCaching"])(provider, targetFormat, context.connectionCacheOverride)
    };
}
function getCacheAwareStrategy(strategy, ctx) {
    // #3955: a caching provider is enough on its own to protect the cacheable prefix.
    // OpenAI / Codex (and other automatic-prefix-cache providers) carry NO explicit
    // `cache_control` markers, yet the upstream still caches the longest matching prefix
    // (system prompt / earliest messages). Gating on `hasCacheControl` skipped the guard
    // for those providers, so a prefix-compressing mode rewrote the prefix → guaranteed
    // cache miss. Treat `isCachingProvider` alone as sufficient; the explicit
    // `cache_control` path is now a subset of this.
    if (ctx.isCachingProvider) {
        return {
            strategy: [
                "aggressive",
                "ultra"
            ].includes(strategy) ? "standard" : strategy,
            skipSystemPrompt: true,
            deterministicOnly: true
        };
    }
    // Return the original strategy with no modifications
    return {
        strategy,
        skipSystemPrompt: false,
        deterministicOnly: false
    };
}
}),
];

//# sourceMappingURL=open-sse_1zpzkdd._.js.map