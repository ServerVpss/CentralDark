module.exports = [
"[project]/src/shared/network/outboundUrlGuard.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLOUD_METADATA_BLOCKED_MESSAGE",
    ()=>CLOUD_METADATA_BLOCKED_MESSAGE,
    "OutboundUrlGuardError",
    ()=>OutboundUrlGuardError,
    "PROVIDER_URL_BLOCKED_MESSAGE",
    ()=>PROVIDER_URL_BLOCKED_MESSAGE,
    "isCloudMetadataHost",
    ()=>isCloudMetadataHost,
    "isPrivateHost",
    ()=>isPrivateHost,
    "parseAndValidateNonMetadataUrl",
    ()=>parseAndValidateNonMetadataUrl,
    "parseAndValidatePublicUrl",
    ()=>parseAndValidatePublicUrl,
    "parseOutboundUrl",
    ()=>parseOutboundUrl
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
;
const PROVIDER_URL_BLOCKED_MESSAGE = "Blocked private or local provider URL";
const CLOUD_METADATA_BLOCKED_MESSAGE = "Blocked cloud-metadata endpoint";
class OutboundUrlGuardError extends Error {
    code;
    url;
    hostname;
    constructor(message, init){
        super(message);
        this.name = "OutboundUrlGuardError";
        this.code = init.code;
        this.url = init.url;
        this.hostname = init.hostname ?? null;
    }
}
function normalizeHost(hostname) {
    const normalized = hostname.trim().toLowerCase();
    if (normalized.startsWith("[") && normalized.endsWith("]")) {
        return normalized.slice(1, -1);
    }
    return normalized;
}
function isPrivateHost(hostname) {
    const normalized = normalizeHost(hostname);
    if (!normalized) return true;
    if (normalized === "localhost" || normalized === "0.0.0.0" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".localhost") || normalized.endsWith(".local") || // `.internal` is reserved for private use (ICANN-style) and is the
    // hostname suffix used by GCP/Azure metadata probes
    // (e.g. `metadata.google.internal`).
    normalized.endsWith(".internal") || normalized.startsWith("::ffff:")) {
        return true;
    }
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(normalized) === 4) {
        const octets = normalized.split(".").map((segment)=>parseInt(segment, 10));
        const [a, b] = octets;
        if (a === 0 || a === 10 || a === 127) return true;
        if (a === 169 && b === 254) return true;
        if (a === 192 && b === 168) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 100 && b >= 64 && b <= 127) return true;
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(normalized) === 6) {
        return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
    }
    return false;
}
const CLOUD_METADATA_HOSTNAMES = new Set([
    "169.254.169.254",
    "metadata.google.internal",
    "metadata.goog",
    "100.100.100.200",
    "fd00:ec2::254"
]);
function isCloudMetadataHost(hostname) {
    const host = normalizeHost(hostname);
    if (!host) return false;
    if (CLOUD_METADATA_HOSTNAMES.has(host)) return true;
    if (host.startsWith("169.254.")) return true; // IPv4 link-local /16
    return false;
}
function parseOutboundUrl(input) {
    let url;
    try {
        url = input instanceof URL ? input : new URL(String(input));
    } catch  {
        throw new OutboundUrlGuardError(`Invalid outbound URL: ${String(input)}`, {
            code: "OUTBOUND_URL_INVALID",
            url: String(input)
        });
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new OutboundUrlGuardError(`Invalid outbound URL protocol for ${url.toString()}`, {
            code: "OUTBOUND_URL_INVALID",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    if (url.username || url.password) {
        throw new OutboundUrlGuardError("Blocked outbound URL with embedded credentials", {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
}
function parseAndValidatePublicUrl(input) {
    const url = parseOutboundUrl(input);
    if (isPrivateHost(url.hostname)) {
        throw new OutboundUrlGuardError(PROVIDER_URL_BLOCKED_MESSAGE, {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
}
function parseAndValidateNonMetadataUrl(input) {
    const url = parseOutboundUrl(input);
    if (isCloudMetadataHost(url.hostname)) {
        throw new OutboundUrlGuardError(CLOUD_METADATA_BLOCKED_MESSAGE, {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
} // NOTE (#7682): `arePrivateProviderUrlsAllowed`, `areLocalProviderUrlsAllowed`,
 // `getProviderOutboundGuard`, `getProviderValidationGuard`, and `parseAndValidateWebhookUrl`
 // live in the sibling `./outboundUrlGuardPolicy.ts` module, NOT here. Those helpers need
 // `@/shared/utils/featureFlags` (which transitively pulls in the DB layer), and this file is
 // loaded by the packaged CLI (`omniroute setup-opencode` → cli-helper/config-generator/
 // opencode.ts) where no `tsconfig.json` is present to resolve the `@/*` path alias. Keeping
 // this module free of ANY `@/`-aliased import is what makes it safe to load from the CLI.
 // Do not add a `@/`-aliased import here — see docs/security/… (packaging) and #7682.
}),
"[project]/src/lib/usage/flatRateProviders.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isFlatRateProvider",
    ()=>isFlatRateProvider
]);
/**
 * Flat-rate (subscription / cookie-web) provider classification — issue #5552.
 *
 * Some providers are billed at a flat rate (a subscription or a coding plan),
 * not per token: cookie/web sessions (ChatGPT Web, grok-web, …) are backed by a
 * consumer subscription, and several "Coding Plan" providers (Codex, MiniMax
 * Coding, Kimi Coding, GLM Coding, …) bill a fixed monthly fee. These providers
 * still carry per-token pricing rows (used for pre-flight estimates), so cost
 * analytics computed from those rows shows an inflated dollar amount that does
 * not match the user's actual bill. For those providers analytics should show
 * $0 instead — see {@link module:lib/usage/costCalculator}.
 *
 * This is intentionally a DISPLAY-only signal: it is consulted by the analytics
 * surfaces (opt-in via the `flatRateAsZero` cost option), never by the budget /
 * quota / routing paths, so per-request cost estimation is unchanged.
 *
 * @module lib/usage/flatRateProviders
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [middleware] (ecmascript)");
;
/**
 * Dedicated subscription / coding-plan provider ids whose identity IS a
 * flat-rate plan. Kept explicit (not derived) because these entries sit in the
 * api-key / oauth categories alongside genuinely metered providers and carry
 * real per-token pricing rows.
 *
 * Deliberately EXCLUDED even though token-priced and sometimes grouped with the
 * above: `codex`/`cx` (OmniRoute actively tracks Codex token cost — Fast-tier
 * multipliers and GPT-5.x pricing — and Codex can be a metered API account, so
 * its analytics cost is intentional, not an artifact), `byteplus` (BytePlus
 * ModelArk is a metered inference host, billed per token — zeroing it would hide
 * real cost), `minimax-cn` (the metered Minimax China API, distinct from the
 * `minimax` "Minimax Coding" plan), and `glm-thinking` (metered tier, distinct
 * from the `glm` Coding plan).
 */ const FLAT_RATE_SUBSCRIPTION_PROVIDER_IDS = new Set([
    "minimax",
    "kimi-coding",
    "kimi-coding-apikey",
    "xiaomi-mimo",
    "bailian-coding-plan",
    "qwen-cloud-token-plan",
    "glm",
    "glm-cn"
]);
function isFlatRateProvider(providerId) {
    if (!providerId || typeof providerId !== "string") return false;
    const id = providerId.trim().toLowerCase();
    if (!id) return false;
    if (FLAT_RATE_SUBSCRIPTION_PROVIDER_IDS.has(id)) return true;
    return Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"], id);
}
}),
"[project]/src/lib/usage/costCalculator.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateCost",
    ()=>calculateCost,
    "calculateModalCost",
    ()=>calculateModalCost,
    "computeAudioCost",
    ()=>computeAudioCost,
    "computeCostFromPricing",
    ()=>computeCostFromPricing,
    "computeImageCost",
    ()=>computeImageCost,
    "computeRerankCost",
    ()=>computeRerankCost,
    "computeVideoCost",
    ()=>computeVideoCost,
    "getCodexFastCostMultiplier",
    ()=>getCodexFastCostMultiplier,
    "normalizeModelName",
    ()=>normalizeModelName
]);
/**
 * Cost Calculator — extracted from usageDb.js (T-15)
 *
 * Pure function for calculating request cost based on model pricing.
 * No DB interaction — pricing is fetched from localDb.
 *
 * @module lib/usage/costCalculator
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$flatRateProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/flatRateProviders.ts [middleware] (ecmascript)");
;
function normalizeModelName(model) {
    if (!model || !model.includes("/")) return model;
    const parts = model.split("/");
    return parts[parts.length - 1];
}
/**
 * xAI reports the exact provider-billed cost of a request in the chat-completions
 * `usage` object via `cost_in_usd_ticks` (port of decolua/9router#2453, capability
 * A — @ryanngit). Per the official docs — both
 * https://docs.x.ai/developers/cost-tracking and the API reference's usage schema
 * ("TICKS_IN_USD_CENT: i64 = 100_000_000") — there are 10_000_000_000 (1e10) ticks
 * per USD. Example from the docs: 37756000 ticks ≈ $0.0038.
 *
 * NOTE: this divisor is intentionally 1e10, not the 1e12 used by the upstream PR
 * (which under-reports cost 100x) — verified directly against the xAI docs.
 */ const USD_TICKS_PER_DOLLAR = 10_000_000_000;
/**
 * Extract an exact, provider-reported USD cost from a token/usage record when one
 * is present, so callers can trust it over the token × pricing estimate. Currently
 * only xAI's `cost_in_usd_ticks` field is handled — see comment above.
 */ function extractExactCostUsd(tokens) {
    const ticks = tokens?.cost_in_usd_ticks;
    if (typeof ticks === "number" && Number.isFinite(ticks) && ticks >= 0) {
        return ticks / USD_TICKS_PER_DOLLAR;
    }
    return null;
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function normalizeServiceTier(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function stripCodexEffortSuffix(model) {
    return model.replace(/-(?:ultra|max|xhigh|high|medium|low|none)$/i, "");
}
function getCodexFastCostMultiplier(provider, model, serviceTier) {
    const providerKey = normalizeServiceTier(provider);
    const tier = normalizeServiceTier(serviceTier);
    if (providerKey !== "codex" && providerKey !== "cx") {
        return 1;
    }
    // OpenAI Flex Processing is billed at a 50% token discount, like Batch,
    // while still using the Responses API with service_tier="flex".
    if (tier === "flex") return 0.5;
    if (tier !== "priority" && tier !== "fast") return 1;
    const modelKey = stripCodexEffortSuffix(normalizeModelName(String(model || "")).toLowerCase());
    const compactModelKey = modelKey.replace(/-/g, "");
    if (/^gpt-5\.6-(?:sol|terra|luna)$/.test(modelKey) || /^gpt5\.6(?:sol|terra|luna)$/.test(compactModelKey)) {
        return 1.5;
    }
    if (modelKey === "gpt-5.5" || compactModelKey === "gpt5.5") return 2.5;
    if (modelKey === "gpt-5.4" || compactModelKey === "gpt5.4") return 2;
    return 1;
}
function computeCostFromPricing(pricing, tokens, options = {}) {
    if (!tokens) return 0;
    // Trust an exact, provider-reported cost over the token × pricing estimate
    // when one is present — works even when no local pricing row exists yet.
    const exactCostUsd = extractExactCostUsd(tokens);
    if (exactCostUsd !== null) return exactCostUsd;
    if (!pricing) return 0;
    // Flat-rate (subscription / cookie-web) providers don't bill per token — their
    // per-token pricing rows exist only for estimation, so display surfaces opt in
    // to show $0 instead of an inflated estimate (#5552).
    if (options.flatRateAsZero && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$flatRateProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isFlatRateProvider"])(options.provider)) return 0;
    const inputPrice = toNumber(pricing.input, 0);
    const cachedPrice = toNumber(pricing.cached, inputPrice);
    const outputPrice = toNumber(pricing.output, 0);
    const reasoningPrice = toNumber(pricing.reasoning, outputPrice);
    const cacheCreationPrice = toNumber(pricing.cache_creation, inputPrice);
    let cost = 0;
    const inputTokens = tokens.input ?? tokens.prompt_tokens ?? tokens.input_tokens ?? 0;
    const cachedTokens = tokens.cacheRead ?? tokens.cached_tokens ?? tokens.cache_read_input_tokens ?? 0;
    const cacheCreationTokens = tokens.cacheCreation ?? tokens.cache_creation_input_tokens ?? 0;
    // prompt_tokens from extractors already includes cache_read + cache_creation,
    // so we must subtract BOTH cache types to avoid pricing cache at the full
    // input rate in addition to their dedicated cache_* rates below.
    const nonCachedInput = Math.max(0, inputTokens - cachedTokens - cacheCreationTokens);
    cost += nonCachedInput * (inputPrice / 1_000_000);
    if (cachedTokens > 0) cost += cachedTokens * (cachedPrice / 1_000_000);
    const outputTokens = tokens.output ?? tokens.completion_tokens ?? tokens.output_tokens ?? 0;
    cost += outputTokens * (outputPrice / 1_000_000);
    // completion_tokens is reasoning-inclusive. Reasoning is already billed at
    // the output rate above, so a dedicated price contributes only its premium.
    const reasoningTokens = tokens.reasoning ?? tokens.reasoning_tokens ?? 0;
    if (reasoningTokens > 0 && pricing.reasoning !== undefined && pricing.reasoning !== null) {
        cost += reasoningTokens * ((reasoningPrice - outputPrice) / 1_000_000);
    }
    if (cacheCreationTokens > 0) cost += cacheCreationTokens * (cacheCreationPrice / 1_000_000);
    return cost * getCodexFastCostMultiplier(options.provider, options.model, options.serviceTier);
}
async function calculateCost(provider, model, tokens, options = {}) {
    if (!tokens || !provider || !model) return 0;
    // Short-circuit before any pricing DB lookup when an exact, provider-reported
    // cost is present (currently xAI's `cost_in_usd_ticks` — see extractExactCostUsd).
    const exactCostUsd = extractExactCostUsd(tokens);
    if (exactCostUsd !== null) return exactCostUsd;
    try {
        const { getPricingForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [middleware] (ecmascript, async loader)");
        // Try exact match first, then normalized model name
        let pricing = await getPricingForModel(provider, model);
        if (!pricing) {
            const normalized = normalizeModelName(model);
            if (normalized !== model) {
                pricing = await getPricingForModel(provider, normalized);
            }
            const providerKey = normalizeServiceTier(provider);
            if (!pricing && (providerKey === "codex" || providerKey === "cx")) {
                const effortlessModel = stripCodexEffortSuffix(normalized);
                if (effortlessModel !== normalized) {
                    pricing = await getPricingForModel(provider, effortlessModel);
                }
            }
        }
        if (!pricing) return 0;
        const pricingRecord = pricing && typeof pricing === "object" && !Array.isArray(pricing) ? pricing : {};
        return computeCostFromPricing(pricingRecord, tokens, {
            provider,
            model,
            ...options
        });
    } catch (error) {
        console.error("Error calculating cost:", error);
        return 0;
    }
}
function computeImageCost(pricing, usage) {
    if (!pricing) return 0;
    const perImage = toNumber(pricing.output_cost_per_image ?? pricing.input_cost_per_image, 0);
    const n = Math.max(0, Math.floor(toNumber(usage.n, 0)));
    return perImage * n;
}
function computeAudioCost(pricing, usage) {
    if (!pricing) return 0;
    const seconds = toNumber(usage.seconds, 0);
    if (seconds > 0) {
        const perSecond = toNumber(pricing.input_cost_per_second ?? pricing.output_cost_per_second, 0);
        if (perSecond > 0) return perSecond * seconds;
    }
    const characters = toNumber(usage.characters, 0);
    if (characters > 0) {
        const perChar = toNumber(pricing.input_cost_per_character ?? pricing.output_cost_per_character, 0);
        // Round to 10 decimals to drop binary-FP artifacts (e.g. 0.000015 * 1000).
        if (perChar > 0) return Math.round(perChar * characters * 1e10) / 1e10;
    }
    return 0;
}
function computeRerankCost(pricing, usage) {
    if (!pricing) return 0;
    const perUnit = toNumber(pricing.search_unit_cost ?? pricing.input_cost_per_query, 0);
    const units = Math.max(0, toNumber(usage.searchUnits, 0));
    return perUnit * units;
}
function computeVideoCost(pricing, usage) {
    if (!pricing) return 0;
    const perSecond = toNumber(pricing.output_cost_per_video_per_second ?? pricing.input_cost_per_video_per_second, 0);
    const seconds = toNumber(usage.seconds, 0);
    return perSecond * seconds;
}
async function calculateModalCost(modality, provider, model, usage) {
    if (!provider || !model) return 0;
    try {
        const { getPricingForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [middleware] (ecmascript, async loader)");
        let pricing = await getPricingForModel(provider, model);
        if (!pricing) {
            const normalized = normalizeModelName(model);
            if (normalized !== model) pricing = await getPricingForModel(provider, normalized);
        }
        if (!pricing) return 0;
        const rec = pricing;
        switch(modality){
            case "image":
                return computeImageCost(rec, usage);
            case "audio":
                return computeAudioCost(rec, usage);
            case "rerank":
                return computeRerankCost(rec, usage);
            case "video":
                return computeVideoCost(rec, usage);
            default:
                return 0;
        }
    } catch (error) {
        console.error("Error calculating modal cost:", error);
        return 0;
    }
}
}),
"[project]/src/lib/display/names.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAccountDisplayName",
    ()=>getAccountDisplayName,
    "getProviderDisplayName",
    ()=>getProviderDisplayName
]);
/**
 * Centralized display name helpers for provider and account/connection labels.
 *
 * Prevents raw internal IDs (connection UUIDs, dynamic provider IDs) from
 * leaking into user-facing dashboards (Health, Analytics, Sessions, Rate-limits,
 * Quota, Compatible Provider pages, etc.).
 *
 * Priority order:
 *   — Account: name → displayName → email → short readble label
 *   — Provider: node.name → node.prefix → alias → readable ID
 *
 * @module lib/display/names
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/compatibleProviderId.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [middleware] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function getAccountDisplayName(conn) {
    if (!conn) return "Unknown Account";
    const name = typeof conn.name === "string" && conn.name.trim() || typeof conn.displayName === "string" && conn.displayName.trim() || typeof conn.email === "string" && conn.email.trim();
    if (name) return name;
    if (typeof conn.id === "string" && conn.id) {
        return `Account #${conn.id.slice(0, 6)}`;
    }
    return "Unknown Account";
}
function getProviderDisplayName(providerId, providerNode) {
    if (providerNode?.name?.trim()) return providerNode.name.trim();
    if (providerNode?.prefix?.trim()) return providerNode.prefix.trim();
    if (!providerId) return "Unknown Provider";
    // Simplify dynamic compatible provider IDs (all 4 generated shapes — #8326)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isCompatibleProviderConnectionId"])(providerId)) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return "CC Compatible";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(providerId)) return "Compatible (openai)";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(providerId)) return "Compatible (anthropic)";
    }
    return providerId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/aggregateHistory.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRawDataCutoffDate",
    ()=>getRawDataCutoffDate,
    "isAggregationEnabled",
    ()=>isAggregationEnabled,
    "rollupDailyUsage",
    ()=>rollupDailyUsage,
    "rollupHourlyQuota",
    ()=>rollupHourlyQuota,
    "rollupUsageHistoryBeforeDate",
    ()=>rollupUsageHistoryBeforeDate
]);
/**
 * Aggregation utility functions for usage data summarization.
 * Rolls up usage_history (and quota_snapshots) into daily summary tables.
 *
 * @module lib/usage/aggregateHistory
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [middleware] (ecmascript)");
;
;
async function rollupDailyUsage(fromDate, toDate) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = {
        processed: 0,
        inserted: 0,
        errors: 0
    };
    try {
        // Aggregate quota_snapshots by provider, model, and date
        const aggregateQuery = `
      INSERT INTO daily_usage_summary (provider, model, date, total_requests, total_input_tokens, total_output_tokens, total_cost)
      SELECT 
        provider,
        COALESCE(json_extract(raw_data, '$.model'), 'unknown') as model,
        DATE(created_at) as date,
        COUNT(*) as total_requests,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.input_tokens') AS INTEGER)), 0) as total_input_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.output_tokens') AS INTEGER)), 0) as total_output_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.cost') AS REAL)), 0.0) as total_cost
      FROM quota_snapshots
      WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
      GROUP BY provider, model, DATE(created_at)
      ON CONFLICT(provider, model, date) DO UPDATE SET
        total_requests = excluded.total_requests,
        total_input_tokens = excluded.total_input_tokens,
        total_output_tokens = excluded.total_output_tokens,
        total_cost = excluded.total_cost
    `;
        const stmt = db.prepare(aggregateQuery);
        const runResult = stmt.run(fromDate, toDate);
        result.processed = runResult.changes;
        result.inserted = runResult.changes;
        console.log(`[Aggregation] Daily rollup: ${result.inserted} rows for ${fromDate} to ${toDate}`);
    } catch (err) {
        console.error("[Aggregation] Daily rollup error:", err);
        result.errors++;
    }
    return result;
}
async function rollupHourlyQuota(fromDate, toDate) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = {
        processed: 0,
        inserted: 0,
        errors: 0
    };
    try {
        // Aggregate quota_snapshots by provider, model, and hour
        const aggregateQuery = `
      INSERT INTO hourly_usage_summary (provider, model, date_hour, total_requests, total_input_tokens, total_output_tokens, total_cost)
      SELECT 
        provider,
        COALESCE(json_extract(raw_data, '$.model'), 'unknown') as model,
        datetime(strftime('%Y-%m-%d %H:00:00', created_at)) as date_hour,
        COUNT(*) as total_requests,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.input_tokens') AS INTEGER)), 0) as total_input_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.output_tokens') AS INTEGER)), 0) as total_output_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.cost') AS REAL)), 0.0) as total_cost
      FROM quota_snapshots
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY provider, model, datetime(strftime('%Y-%m-%d %H:00:00', created_at))
      ON CONFLICT(provider, model, date_hour) DO UPDATE SET
        total_requests = excluded.total_requests,
        total_input_tokens = excluded.total_input_tokens,
        total_output_tokens = excluded.total_output_tokens,
        total_cost = excluded.total_cost
    `;
        const stmt = db.prepare(aggregateQuery);
        const runResult = stmt.run(fromDate, toDate);
        result.processed = runResult.changes;
        result.inserted = runResult.changes;
        console.log(`[Aggregation] Hourly rollup: ${result.inserted} rows for ${fromDate} to ${toDate}`);
    } catch (err) {
        console.error("[Aggregation] Hourly rollup error:", err);
        result.errors++;
    }
    return result;
}
async function rollupUsageHistoryBeforeDate(beforeDate) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = {
        processed: 0,
        inserted: 0,
        errors: 0
    };
    try {
        const aggregateQuery = `
      INSERT INTO daily_usage_summary (provider, model, date, total_requests, total_input_tokens, total_output_tokens, total_cost)
      SELECT
        LOWER(provider) as provider,
        LOWER(model) as model,
        DATE(timestamp) as date,
        COUNT(*) as total_requests,
        COALESCE(SUM(tokens_input), 0) as total_input_tokens,
        COALESCE(SUM(tokens_output), 0) as total_output_tokens,
        0.0 as total_cost
      FROM usage_history
      WHERE timestamp < ?
        AND provider IS NOT NULL AND provider != ''
        AND model IS NOT NULL AND model != ''
      GROUP BY LOWER(provider), LOWER(model), DATE(timestamp)
      ON CONFLICT(provider, model, date) DO UPDATE SET
        total_requests = daily_usage_summary.total_requests + excluded.total_requests,
        total_input_tokens = daily_usage_summary.total_input_tokens + excluded.total_input_tokens,
        total_output_tokens = daily_usage_summary.total_output_tokens + excluded.total_output_tokens
    `;
        const stmt = db.prepare(aggregateQuery);
        const runResult = stmt.run(beforeDate);
        result.processed = runResult.changes;
        result.inserted = runResult.changes;
        console.log(`[Aggregation] usage_history rollup: ${result.inserted} rows for dates before ${beforeDate}`);
    } catch (err) {
        console.error("[Aggregation] usage_history rollup error:", err);
        result.errors++;
    }
    return result;
}
async function getRawDataCutoffDate() {
    // The raw-data cutoff MUST match the actual rollup/delete boundary used by
    // cleanupUsageHistory (src/lib/db/cleanup.ts), which is driven by
    // retention.usageHistory — NOT aggregation.rawDataRetentionDays.
    // Using rawDataRetentionDays (default 7 per migration 046) creates a gap:
    // analytics floors raw data at day-7 while cleanup doesn't roll up until
    // day-30, so the window [day-30, day-7) is excluded from BOTH UNION legs.
    const rawDataRetentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])().retention.usageHistory;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rawDataRetentionDays);
    return cutoffDate.toISOString().split("T")[0];
}
async function isAggregationEnabled() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])().aggregation.enabled;
}
}),
"[project]/src/lib/usage/usageStats.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getConnectionSpendUsdSinceAdded",
    ()=>getConnectionSpendUsdSinceAdded,
    "getMonthlyProviderTokensForConnection",
    ()=>getMonthlyProviderTokensForConnection,
    "getUsageStats",
    ()=>getUsageStats
]);
/**
 * Usage Stats — extracted from usageDb.js (T-15)
 *
 * Aggregates usage data into stats for the dashboard:
 * totals, by provider/model/account/apiKey, 10-minute buckets.
 *
 * @module lib/usage/usageStats
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/display/names.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$aggregateHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/aggregateHistory.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrEmpty(value) {
    return typeof value === "string" ? value : "";
}
function buildUsageSourceSql(aggregationEnabled) {
    if (!aggregationEnabled) {
        return `
      SELECT
        provider,
        model,
        timestamp,
        connection_id,
        api_key_id,
        api_key_name,
        COALESCE(tokens_input, 0) as tokens_input,
        COALESCE(tokens_output, 0) as tokens_output,
        COALESCE(tokens_cache_read, 0) as tokens_cache_read,
        COALESCE(tokens_cache_creation, 0) as tokens_cache_creation,
        COALESCE(tokens_reasoning, 0) as tokens_reasoning,
        COALESCE(tokens_input, 0) as cost_tokens_input,
        COALESCE(tokens_output, 0) as cost_tokens_output,
        COALESCE(tokens_cache_read, 0) as cost_tokens_cache_read,
        COALESCE(tokens_cache_creation, 0) as cost_tokens_cache_creation,
        COALESCE(tokens_reasoning, 0) as cost_tokens_reasoning,
        0.0 as stored_cost,
        COALESCE(service_tier, 'standard') as service_tier,
        1 as request_count
      FROM usage_history
    `;
    }
    return `
    SELECT
      provider,
      model,
      timestamp,
      connection_id,
      api_key_id,
      api_key_name,
      COALESCE(tokens_input, 0) as tokens_input,
      COALESCE(tokens_output, 0) as tokens_output,
      COALESCE(tokens_cache_read, 0) as tokens_cache_read,
      COALESCE(tokens_cache_creation, 0) as tokens_cache_creation,
      COALESCE(tokens_reasoning, 0) as tokens_reasoning,
      COALESCE(tokens_input, 0) as cost_tokens_input,
      COALESCE(tokens_output, 0) as cost_tokens_output,
      COALESCE(tokens_cache_read, 0) as cost_tokens_cache_read,
      COALESCE(tokens_cache_creation, 0) as cost_tokens_cache_creation,
      COALESCE(tokens_reasoning, 0) as cost_tokens_reasoning,
      0.0 as stored_cost,
      COALESCE(service_tier, 'standard') as service_tier,
      1 as request_count
    FROM usage_history
    WHERE DATE(timestamp) >= ?

    UNION ALL

    SELECT
      provider,
      model,
      date || 'T12:00:00.000Z' as timestamp,
      NULL as connection_id,
      NULL as api_key_id,
      NULL as api_key_name,
      COALESCE(total_input_tokens, 0) as tokens_input,
      COALESCE(total_output_tokens, 0) as tokens_output,
      0 as tokens_cache_read,
      0 as tokens_cache_creation,
      0 as tokens_reasoning,
      0 as cost_tokens_input,
      0 as cost_tokens_output,
      0 as cost_tokens_cache_read,
      0 as cost_tokens_cache_creation,
      0 as cost_tokens_reasoning,
      COALESCE(total_cost, 0.0) as stored_cost,
      'standard' as service_tier,
      COALESCE(total_requests, 0) as request_count
    FROM daily_usage_summary
    WHERE date < ?
  `;
}
const AGGREGATE_FIELDS = `
  SUM(request_count) as request_count,
  COALESCE(SUM(tokens_input), 0) as tokens_input,
  COALESCE(SUM(tokens_output), 0) as tokens_output,
  COALESCE(SUM(tokens_cache_read), 0) as tokens_cache_read,
  COALESCE(SUM(tokens_cache_creation), 0) as tokens_cache_creation,
  COALESCE(SUM(tokens_reasoning), 0) as tokens_reasoning,
  COALESCE(SUM(cost_tokens_input), 0) as cost_tokens_input,
  COALESCE(SUM(cost_tokens_output), 0) as cost_tokens_output,
  COALESCE(SUM(cost_tokens_cache_read), 0) as cost_tokens_cache_read,
  COALESCE(SUM(cost_tokens_cache_creation), 0) as cost_tokens_cache_creation,
  COALESCE(SUM(cost_tokens_reasoning), 0) as cost_tokens_reasoning,
  COALESCE(SUM(stored_cost), 0.0) as stored_cost,
  MAX(timestamp) as last_used
`;
async function calculateAggregateCost(row) {
    const provider = toStringOrEmpty(row.provider) || "unknown";
    const model = toStringOrEmpty(row.model) || "unknown";
    const serviceTier = toStringOrEmpty(row.service_tier) || "standard";
    const storedCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.stored_cost);
    const calculatedCost = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, {
        input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_input ?? row.tokens_input),
        output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_output ?? row.tokens_output),
        cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_cache_read ?? row.tokens_cache_read),
        cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_cache_creation ?? row.tokens_cache_creation),
        reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_reasoning ?? row.tokens_reasoning)
    }, {
        provider,
        serviceTier,
        flatRateAsZero: true
    });
    return storedCost + calculatedCost;
}
function addUsage(bucket, requests, promptTokens, completionTokens, cost) {
    bucket.requests += requests;
    bucket.promptTokens += promptTokens;
    bucket.completionTokens += completionTokens;
    bucket.cost += cost;
}
function getApiKeyStatsKey(apiKeyId, apiKeyName) {
    return apiKeyId ? `id:${apiKeyId}` : `name:${apiKeyName || "unknown"}`;
}
function getMonthlyProviderTokensForConnection(provider, connectionId) {
    if (!provider || !connectionId) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date();
    const monthStartIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const row = db.prepare(`SELECT COALESCE(SUM(tokens_input), 0)
            + COALESCE(SUM(tokens_output), 0)
            + COALESCE(SUM(tokens_cache_read), 0)
            + COALESCE(SUM(tokens_cache_creation), 0)
            + COALESCE(SUM(tokens_reasoning), 0) AS total
       FROM usage_history
       WHERE provider = ? AND connection_id = ? AND timestamp >= ?`).get(provider, connectionId, monthStartIso);
    return Math.max(0, Number(row?.total ?? 0));
}
async function getConnectionSpendUsdSinceAdded(provider, connectionId) {
    if (!provider || !connectionId) return {
        costUsd: 0,
        requests: 0
    };
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`SELECT model,
          COALESCE(SUM(tokens_input), 0) AS input,
          COALESCE(SUM(tokens_output), 0) AS output,
          COALESCE(SUM(tokens_cache_read), 0) AS cacheRead,
          COALESCE(SUM(tokens_cache_creation), 0) AS cacheCreation,
          COALESCE(SUM(tokens_reasoning), 0) AS reasoning,
          COUNT(*) AS requests
       FROM usage_history
       WHERE connection_id = ? AND provider = ? AND success = 1
       GROUP BY model`).all(connectionId, provider);
    let costUsd = 0;
    let requests = 0;
    for (const row of rows){
        requests += Math.max(0, Number(row.requests ?? 0));
        const model = typeof row.model === "string" ? row.model : "";
        const tokens = {
            input: Number(row.input ?? 0),
            output: Number(row.output ?? 0),
            cacheRead: Number(row.cacheRead ?? 0),
            cacheCreation: Number(row.cacheCreation ?? 0),
            reasoning: Number(row.reasoning ?? 0)
        };
        costUsd += await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, tokens, {
            provider,
            model,
            flatRateAsZero: true
        });
    }
    return {
        costUsd: Math.max(0, costUsd),
        requests
    };
}
async function getUsageStats() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const aggregationEnabled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$aggregateHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isAggregationEnabled"])();
    const cutoffDate = aggregationEnabled ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$aggregateHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getRawDataCutoffDate"])() : null;
    const sourceSql = buildUsageSourceSql(aggregationEnabled);
    const sourceParams = aggregationEnabled && cutoffDate ? [
        cutoffDate,
        cutoffDate
    ] : [];
    const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [middleware] (ecmascript, async loader)");
    let allConnections = [];
    try {
        const loadedConnections = await getProviderConnections();
        allConnections = Array.isArray(loadedConnections) ? loadedConnections : [];
    } catch  {}
    const connectionMap = {};
    for (const connRaw of allConnections){
        const conn = asRecord(connRaw);
        const connectionId = toStringOrEmpty(conn.id);
        if (!connectionId) continue;
        connectionMap[connectionId] = toStringOrEmpty(conn.name) || toStringOrEmpty(conn.email) || connectionId;
    }
    const currentApiKeyNames = new Map();
    try {
        const apiKeys = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getApiKeys"])();
        for (const apiKey of apiKeys){
            if (typeof apiKey.id === "string" && typeof apiKey.name === "string") {
                currentApiKeyNames.set(apiKey.id, apiKey.name);
            }
        }
    } catch  {
    // Stats can still be computed from usage_history when api_keys is unavailable.
    }
    const pendingRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPendingRequests"])();
    const stats = {
        totalRequests: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalCost: 0,
        byProvider: {},
        byModel: {},
        byAccount: {},
        byApiKey: {},
        last10Minutes: [],
        pending: pendingRequests,
        activeRequests: []
    };
    // Build active requests
    for (const [connectionId, models] of Object.entries(pendingRequests.byAccount)){
        for (const [modelKey, count] of Object.entries(models)){
            if (count > 0) {
                const accountName = connectionMap[connectionId] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAccountDisplayName"])({
                    id: connectionId
                });
                const match = modelKey.match(/^(.*) \((.*)\)$/);
                stats.activeRequests.push({
                    model: match ? match[1] : modelKey,
                    provider: match ? match[2] : "unknown",
                    account: accountName,
                    count
                });
            }
        }
    }
    // 10-minute buckets
    const now = new Date();
    const currentMinuteStart = new Date(Math.floor(now.getTime() / 60000) * 60000);
    const bucketMap = {};
    for(let i = 0; i < 10; i++){
        const bucketTime = new Date(currentMinuteStart.getTime() - (9 - i) * 60 * 1000);
        const bucketKey = bucketTime.getTime();
        bucketMap[bucketKey] = {
            requests: 0,
            promptTokens: 0,
            completionTokens: 0,
            cost: 0
        };
        stats.last10Minutes.push(bucketMap[bucketKey]);
    }
    const tenMinutesAgo = new Date(currentMinuteStart.getTime() - 9 * 60 * 1000);
    const modelRows = db.prepare(`
        WITH usage_source AS (${sourceSql})
        SELECT provider, model, service_tier, ${AGGREGATE_FIELDS}
        FROM usage_source
        GROUP BY provider, model, service_tier
      `).all(...sourceParams);
    for (const rowRaw of modelRows){
        const row = asRecord(rowRaw);
        const provider = toStringOrEmpty(row.provider) || "unknown";
        const model = toStringOrEmpty(row.model) || "unknown";
        const timestamp = toStringOrEmpty(row.last_used) || new Date(0).toISOString();
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        stats.totalRequests += requestCount;
        stats.totalPromptTokens += promptTokens;
        stats.totalCompletionTokens += completionTokens;
        stats.totalCost += entryCost;
        // By Provider
        if (!stats.byProvider[provider]) {
            stats.byProvider[provider] = {
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                cost: 0
            };
        }
        addUsage(stats.byProvider[provider], requestCount, promptTokens, completionTokens, entryCost);
        // By Model
        const modelKey = ("TURBOPACK compile-time truthy", 1) ? `${model} (${provider})` : "TURBOPACK unreachable";
        if (!stats.byModel[modelKey]) {
            stats.byModel[modelKey] = {
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                cost: 0,
                rawModel: model,
                provider,
                lastUsed: timestamp
            };
        }
        addUsage(stats.byModel[modelKey], requestCount, promptTokens, completionTokens, entryCost);
        if (new Date(timestamp) > new Date(stats.byModel[modelKey].lastUsed || timestamp)) {
            stats.byModel[modelKey].lastUsed = timestamp;
        }
    }
    const accountRows = db.prepare(`
        WITH usage_source AS (${sourceSql})
        SELECT provider, model, connection_id, service_tier, ${AGGREGATE_FIELDS}
        FROM usage_source
        WHERE connection_id IS NOT NULL AND connection_id != ''
        GROUP BY provider, model, connection_id, service_tier
      `).all(...sourceParams);
    for (const rowRaw of accountRows){
        const row = asRecord(rowRaw);
        const provider = toStringOrEmpty(row.provider) || "unknown";
        const model = toStringOrEmpty(row.model) || "unknown";
        const timestamp = toStringOrEmpty(row.last_used) || new Date(0).toISOString();
        const connectionId = toStringOrEmpty(row.connection_id);
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        if (connectionId) {
            const accountName = connectionMap[connectionId] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAccountDisplayName"])({
                id: connectionId
            });
            const accountKey = `${model} (${provider} - ${accountName})`;
            if (!stats.byAccount[accountKey]) {
                stats.byAccount[accountKey] = {
                    requests: 0,
                    promptTokens: 0,
                    completionTokens: 0,
                    cost: 0,
                    rawModel: model,
                    provider,
                    connectionId,
                    accountName,
                    lastUsed: timestamp
                };
            }
            addUsage(stats.byAccount[accountKey], requestCount, promptTokens, completionTokens, entryCost);
            if (new Date(timestamp) > new Date(stats.byAccount[accountKey].lastUsed || timestamp)) {
                stats.byAccount[accountKey].lastUsed = timestamp;
            }
        }
    }
    const apiKeyRows = db.prepare(`
        WITH usage_source AS (${sourceSql})
        SELECT provider, model, api_key_id, api_key_name, service_tier, ${AGGREGATE_FIELDS}
        FROM usage_source
        WHERE (api_key_id IS NOT NULL AND api_key_id != '')
           OR (api_key_name IS NOT NULL AND api_key_name != '')
        GROUP BY provider, model, api_key_id, api_key_name, service_tier
      `).all(...sourceParams);
    for (const rowRaw of apiKeyRows){
        const row = asRecord(rowRaw);
        const timestamp = toStringOrEmpty(row.last_used) || new Date(0).toISOString();
        const apiKeyId = toStringOrEmpty(row.api_key_id) || null;
        const apiKeyName = toStringOrEmpty(row.api_key_name) || null;
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        if (apiKeyId || apiKeyName) {
            const key = getApiKeyStatsKey(apiKeyId, apiKeyName);
            const displayName = (apiKeyId ? currentApiKeyNames.get(apiKeyId) : undefined) || apiKeyName || apiKeyId || "unknown";
            if (!stats.byApiKey[key]) {
                stats.byApiKey[key] = {
                    requests: 0,
                    promptTokens: 0,
                    completionTokens: 0,
                    cost: 0,
                    apiKeyId,
                    apiKeyName: displayName,
                    historicalApiKeyNames: [],
                    lastUsed: timestamp
                };
            }
            const apiKeyStats = stats.byApiKey[key];
            if (apiKeyName && !apiKeyStats.historicalApiKeyNames?.includes(apiKeyName)) {
                apiKeyStats.historicalApiKeyNames?.push(apiKeyName);
            }
            apiKeyStats.apiKeyName = displayName;
            addUsage(apiKeyStats, requestCount, promptTokens, completionTokens, entryCost);
            if (new Date(timestamp) > new Date(apiKeyStats.lastUsed || timestamp)) {
                apiKeyStats.lastUsed = timestamp;
            }
        }
    }
    const recentRows = db.prepare(`
        SELECT
          strftime('%Y-%m-%dT%H:%M:00.000Z', timestamp) as minute,
          provider,
          model,
          COALESCE(service_tier, 'standard') as service_tier,
          COUNT(*) as request_count,
          COALESCE(SUM(tokens_input), 0) as tokens_input,
          COALESCE(SUM(tokens_output), 0) as tokens_output,
          COALESCE(SUM(tokens_cache_read), 0) as tokens_cache_read,
          COALESCE(SUM(tokens_cache_creation), 0) as tokens_cache_creation,
          COALESCE(SUM(tokens_reasoning), 0) as tokens_reasoning
        FROM usage_history
        WHERE timestamp >= ? AND timestamp <= ?
        GROUP BY minute, provider, model, service_tier
      `).all(tenMinutesAgo.toISOString(), now.toISOString());
    for (const rowRaw of recentRows){
        const row = asRecord(rowRaw);
        const minute = toStringOrEmpty(row.minute);
        const bucketKey = new Date(minute).getTime();
        if (!bucketMap[bucketKey]) continue;
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        addUsage(bucketMap[bucketKey], requestCount, promptTokens, completionTokens, entryCost);
    }
    return stats;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/callLogsBoundedQueries.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectReferencedArtifacts",
    ()=>collectReferencedArtifacts,
    "selectCallLogIdsBefore",
    ()=>selectCallLogIdsBefore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [middleware] (ecmascript) <locals>");
;
// #5618 — node:sqlite's StatementSync.all() materializes the ENTIRE result set as
// JS objects at once. On a large storage.sqlite (~170 MB+) an unbounded
// `SELECT … FROM call_logs` over the whole table blows the V8 heap during the
// startup cleanup pass (`cleanupExpiredLogs` → `rotateCallLogs`), crashing the
// daemon before it binds. These helpers page through call_logs in bounded chunks
// so peak memory stays flat regardless of table size.
const CALL_LOG_QUERY_PAGE = 5000;
function collectReferencedArtifacts() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const referenced = new Set();
    const stmt = db.prepare("SELECT artifact_relpath FROM call_logs WHERE artifact_relpath IS NOT NULL LIMIT ? OFFSET ?");
    for(let offset = 0;; offset += CALL_LOG_QUERY_PAGE){
        const rows = stmt.all(CALL_LOG_QUERY_PAGE, offset);
        for (const row of rows){
            if (typeof row.artifact_relpath === "string") referenced.add(row.artifact_relpath);
        }
        if (rows.length < CALL_LOG_QUERY_PAGE) break;
    }
    return referenced;
}
function selectCallLogIdsBefore(cutoff, limit = CALL_LOG_QUERY_PAGE) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT id FROM call_logs WHERE timestamp < ? ORDER BY timestamp ASC LIMIT ?").all(cutoff, limit);
    return rows.map((row)=>String(row.id));
}
}),
"[project]/src/lib/db/detailedLogs.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getRequestDetailLogByCallLogId",
    ()=>getRequestDetailLogByCallLogId,
    "getRequestDetailLogById",
    ()=>getRequestDetailLogById,
    "getRequestDetailLogCount",
    ()=>getRequestDetailLogCount,
    "getRequestDetailLogs",
    ()=>getRequestDetailLogs,
    "isDetailedLoggingEnabled",
    ()=>isDetailedLoggingEnabled,
    "resetRequestDetailLogsTableExistsCache",
    ()=>resetRequestDetailLogsTableExistsCache,
    "saveRequestDetailLog",
    ()=>saveRequestDetailLog
]);
/**
 * Detailed Request Logs DB Layer (#378)
 *
 * Legacy compatibility layer for detailed request logs.
 * New requests now store pipeline details inside unified call log artifacts.
 * This module remains available for reading historical request_detail_logs rows.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [middleware] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamPayloadCollector.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
let requestDetailLogsTableExistsCache;
function requestDetailLogsTableExists() {
    if (requestDetailLogsTableExistsCache !== undefined) {
        return requestDetailLogsTableExistsCache;
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'request_detail_logs'").get();
    requestDetailLogsTableExistsCache = Boolean(row?.name);
    return requestDetailLogsTableExistsCache;
}
function resetRequestDetailLogsTableExistsCache() {
    requestDetailLogsTableExistsCache = undefined;
}
async function isDetailedLoggingEnabled() {
    const envOverride = process.env.ENABLE_REQUEST_LOGS;
    if (envOverride !== undefined) {
        return envOverride.trim().toLowerCase() === "true";
    }
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const val = settings.call_log_pipeline_enabled;
        return val === true || val === "1" || val === "true";
    } catch  {
        return false;
    }
}
function saveRequestDetailLog(entry) {
    const noLogEnabled = Boolean(entry.no_log) || (entry.api_key_id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isNoLog"])(entry.api_key_id) : false);
    if (noLogEnabled || !requestDetailLogsTableExists()) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const id = entry.id ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const compactProviderResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["compactStructuredStreamPayload"])(entry.provider_response);
    const compactClientResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamPayloadCollector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["compactStructuredStreamPayload"])(entry.client_response);
    db.prepare(`
    INSERT INTO request_detail_logs
      (id, call_log_id, timestamp, client_request, translated_request,
       provider_response, client_response, provider, model, source_format, target_format, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, entry.call_log_id ?? null, timestamp, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.client_request)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.translated_request)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compactProviderResponse)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["serializePayloadForStorage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compactClientResponse)), entry.provider ?? null, entry.model ?? null, entry.source_format ?? null, entry.target_format ?? null, entry.duration_ms ?? 0);
}
function getRequestDetailLogs(limit = 50, offset = 0) {
    if (!requestDetailLogsTableExists()) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`
      SELECT * FROM request_detail_logs
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    return rows.map(mapDetailedLogRow);
}
function getRequestDetailLogById(id) {
    if (!requestDetailLogsTableExists()) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT * FROM request_detail_logs WHERE id = ?").get(id);
    return row ? mapDetailedLogRow(row) : null;
}
function getRequestDetailLogByCallLogId(callLogId) {
    if (!requestDetailLogsTableExists()) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`
      SELECT * FROM request_detail_logs
      WHERE call_log_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).get(callLogId);
    return row ? mapDetailedLogRow(row) : null;
}
function getRequestDetailLogCount() {
    if (!requestDetailLogsTableExists()) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT COUNT(*) as cnt FROM request_detail_logs").get();
    return row?.cnt ?? 0;
}
function mapDetailedLogRow(row) {
    return {
        id: typeof row.id === "string" ? row.id : undefined,
        call_log_id: typeof row.call_log_id === "string" ? row.call_log_id : null,
        timestamp: typeof row.timestamp === "string" ? row.timestamp : undefined,
        client_request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.client_request),
        translated_request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.translated_request),
        provider_response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.provider_response),
        client_response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.client_response),
        provider: typeof row.provider === "string" ? row.provider : null,
        model: typeof row.model === "string" ? row.model : null,
        source_format: typeof row.source_format === "string" ? row.source_format : null,
        target_format: typeof row.target_format === "string" ? row.target_format : null,
        duration_ms: typeof row.duration_ms === "number" ? row.duration_ms : 0
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/callLogApiKeyContext.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCallLogApiKeyContext",
    ()=>getCallLogApiKeyContext,
    "runWithCallLogApiKeyContext",
    ()=>runWithCallLogApiKeyContext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
;
const callLogApiKeyContext = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function runWithCallLogApiKeyContext(context, callback) {
    return callLogApiKeyContext.run(context, callback);
}
function getCallLogApiKeyContext() {
    return callLogApiKeyContext.getStore() ?? null;
}
}),
"[project]/src/lib/usage/callLogs/format.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "buildRequestSummary",
    ()=>buildRequestSummary,
    "normalizeDetailState",
    ()=>normalizeDetailState,
    "parseInlineError",
    ()=>parseInlineError,
    "protectPipelinePayloads",
    ()=>protectPipelinePayloads,
    "sanitizeErrorForLog",
    ()=>sanitizeErrorForLog,
    "toStoredErrorSummary",
    ()=>toStoredErrorSummary,
    "toStringOrNull",
    ()=>toStringOrNull,
    "truncateText",
    ()=>truncateText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [middleware] (ecmascript)");
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function truncateText(value, maxLength) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
}
function parseInlineError(value) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
function normalizeDetailState(value) {
    if (value === "ready" || value === "missing" || value === "corrupt" || value === "legacy-inline") {
        return value;
    }
    return "none";
}
function sanitizeErrorForLog(error) {
    if (error === null || error === undefined) return null;
    if (typeof error === "string") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizePII"])(error).text;
    if (error instanceof Error) {
        return {
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizePII"])(error.message).text,
            stack: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizePII"])(error.stack || "").text || undefined,
            name: error.name
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(error);
}
function toStoredErrorSummary(error) {
    const sanitized = sanitizeErrorForLog(error);
    if (sanitized === null || sanitized === undefined) return null;
    if (typeof sanitized === "string") {
        return truncateText(sanitized, 4000);
    }
    try {
        return truncateText(JSON.stringify(sanitized), 4000);
    } catch  {
        return truncateText(String(sanitized), 4000);
    }
}
function protectPipelinePayloads(payloads) {
    if (!payloads || typeof payloads !== "object") return null;
    const protectedPayloads = {};
    for (const [key, value] of Object.entries(payloads)){
        if (value === null || value === undefined) continue;
        if (key === "streamChunks" && value && typeof value === "object") {
            const chunks = value;
            const compacted = Object.fromEntries(Object.entries(chunks).filter(([, chunkValue])=>Array.isArray(chunkValue) && chunkValue.length > 0));
            if (Object.keys(compacted).length > 0) {
                protectedPayloads.streamChunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compacted);
            }
            continue;
        }
        protectedPayloads[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(value);
    }
    return Object.keys(protectedPayloads).length > 0 ? protectedPayloads : null;
}
function buildRequestSummary(requestType, requestBody) {
    if (requestType !== "search") return null;
    const body = asRecord(requestBody);
    if (Object.keys(body).length === 0) return null;
    const summary = {};
    if (typeof body.query === "string" && body.query.trim().length > 0) {
        summary.query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizePII"])(body.query).text;
    }
    const filters = Object.fromEntries(Object.entries(body).filter(([key])=>key !== "query" && key !== "provider"));
    if (Object.keys(filters).length > 0) {
        summary.filters = filters;
    }
    if (Object.keys(summary).length === 0) return null;
    return JSON.stringify(summary);
}
}),
"[project]/src/lib/usage/callLogs.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cleanupOrphanCallLogFiles",
    ()=>cleanupOrphanCallLogFiles,
    "cleanupOverflowCallLogFiles",
    ()=>cleanupOverflowCallLogFiles,
    "deleteCallLogsBefore",
    ()=>deleteCallLogsBefore,
    "exportCallLogsSince",
    ()=>exportCallLogsSince,
    "getCallLogById",
    ()=>getCallLogById,
    "getCallLogs",
    ()=>getCallLogs,
    "rotateCallLogs",
    ()=>rotateCallLogs,
    "saveCallLog",
    ()=>saveCallLog,
    "scheduleCallLogRotation",
    ()=>scheduleCallLogRotation,
    "trimCallLogsToMaxRows",
    ()=>trimCallLogsToMaxRows
]);
/**
 * Structured call log management.
 *
 * SQLite stores only summary metadata. Detailed request/response payloads live in
 * filesystem artifacts and are loaded only for explicit detail/export flows.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogsBoundedQueries.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/detailedLogs.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogApiKeyContext$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogApiKeyContext.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs/format.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const CALL_LOG_ROTATE_THROTTLE_MS = 60_000;
let lastCallLogRotationScheduledAt = 0;
let callLogRotateInFlight = false;
let callLogRotateScheduled = false;
const RESOLVED_ACCOUNT_SQL = "COALESCE(NULLIF(pc.name, ''), NULLIF(pc.email, ''), cl.account)";
let logIdCounter = 0;
function generateLogId() {
    logIdCounter++;
    return `${Date.now()}-${logIdCounter}`;
}
async function resolveAccountName(connectionId) {
    let account = connectionId ? connectionId.slice(0, 8) : "-";
    if (!connectionId) {
        return account;
    }
    try {
        const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [middleware] (ecmascript, async loader)");
        const connections = await getProviderConnections();
        const conn = connections.find((item)=>item.id === connectionId);
        if (conn) {
            account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(conn.name),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(conn.email)
            ], true, account);
        }
    } catch  {
    // Best-effort lookup only.
    }
    return account;
}
async function resolveProviderPrefix(providerId) {
    if (!providerId) return null;
    try {
        const { getProviderNodeById } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [middleware] (ecmascript, async loader)");
        const node = await getProviderNodeById(providerId);
        if (node && typeof node.prefix === "string" && node.prefix.trim().length > 0) {
            return node.prefix.trim();
        }
    } catch  {
    // Best-effort lookup only.
    }
    return null;
}
function isCompatibleProviderId(providerId) {
    if (!providerId) return false;
    return providerId.startsWith("openai-compatible-") || providerId.startsWith("anthropic-compatible-");
}
function applyNodePrefix(requestedModel, provider, nodePrefix) {
    if (!requestedModel || !provider || !nodePrefix) return requestedModel;
    if (requestedModel.startsWith(provider + "/")) {
        return nodePrefix + "/" + requestedModel.slice(provider.length + 1);
    }
    return requestedModel;
}
function buildArtifact(logEntry, requestBody, responseBody, error, pipelinePayloads) {
    return {
        schemaVersion: 5,
        summary: {
            id: logEntry.id,
            timestamp: logEntry.timestamp,
            method: logEntry.method,
            path: logEntry.path,
            status: logEntry.status,
            model: logEntry.model,
            requestedModel: logEntry.requestedModel,
            provider: logEntry.provider,
            account: logEntry.account,
            connectionId: logEntry.connectionId,
            duration: logEntry.duration,
            tokens: {
                in: logEntry.tokensIn,
                out: logEntry.tokensOut,
                cacheRead: logEntry.tokensCacheRead,
                cacheWrite: logEntry.tokensCacheCreation,
                reasoning: logEntry.tokensReasoning,
                compressed: logEntry.tokensCompressed
            },
            requestType: logEntry.requestType,
            sourceFormat: logEntry.sourceFormat,
            targetFormat: logEntry.targetFormat,
            apiKeyId: logEntry.apiKeyId,
            apiKeyName: logEntry.apiKeyName,
            comboName: logEntry.comboName,
            comboStepId: logEntry.comboStepId,
            comboExecutionKey: logEntry.comboExecutionKey
        },
        requestBody: requestBody ?? null,
        responseBody: responseBody ?? null,
        error: error ?? null,
        ...pipelinePayloads ? {
            pipeline: pipelinePayloads
        } : {}
    };
}
// #6187: extract the assistant message from a chat-completion-shaped response
// body so we can inspect its reasoning_content / <think> content.
function extractAssistantMessage(responseBody) {
    if (!responseBody || typeof responseBody !== "object") return responseBody;
    const choices = responseBody.choices;
    if (Array.isArray(choices) && choices.length > 0) {
        const first = choices[0];
        return first?.message ?? first?.delta ?? first;
    }
    return responseBody;
}
// #6187: decide the reasoning SOURCE and (char-only) count recorded alongside
// the usage-derived tokens_reasoning. Usage is authoritative when it reports
// non-zero reasoning tokens; otherwise we fall back to observed reasoning
// content so "reasoned but metered 0" stays distinguishable. reasoning_chars is
// a CHARACTER count, never a token count — it must not touch cost math.
function resolveReasoningObservation(usageReasoning, responseBody) {
    if (usageReasoning != null && usageReasoning > 0) {
        return {
            source: "usage",
            chars: null
        };
    }
    const observed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getObservedReasoning"])(extractAssistantMessage(responseBody));
    if (observed.chars > 0) {
        return {
            source: observed.source,
            chars: observed.chars
        };
    }
    return {
        source: null,
        chars: null
    };
}
function hasTable(tableName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName));
}
function readLegacyLogFromDisk(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"] || !entry.timestamp) return null;
    try {
        const date = new Date(entry.timestamp);
        if (Number.isNaN(date.getTime())) return null;
        const dateFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], dateFolder);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) return null;
        const time = `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
        const safeModel = (entry.model || "unknown").replace(/[/:]/g, "-");
        const expectedName = `${time}_${safeModel}_${entry.status}.json`;
        const exactPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, expectedName);
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(exactPath)) {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(exactPath, "utf8"));
        }
        const files = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir).filter((file)=>file.startsWith(time) && file.endsWith(`_${entry.status}.json`));
        if (files.length > 0) {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, files[0]), "utf8"));
        }
    } catch (error) {
        console.error("[callLogs] Failed to read legacy disk log:", error.message);
    }
    return null;
}
function clearArtifactReference(relativePath, nextState) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`
      UPDATE call_logs
      SET detail_state = ?,
          artifact_relpath = NULL,
          artifact_size_bytes = NULL,
          artifact_sha256 = NULL
      WHERE artifact_relpath = ?
    `).run(nextState, relativePath);
}
function listReferencedArtifacts() {
    // #5618: paged to avoid an unbounded `.all()` OOM on large call_logs tables.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collectReferencedArtifacts"])();
}
// #5217: SQLite caps a statement at SQLITE_MAX_VARIABLE_NUMBER bound params
// (~999 on many builds). Callers like trimCallLogsToMaxRows() passed up to 5000
// ids in one `IN (...)` → "too many SQL variables" aborted trimming. Chunk well
// under the limit so each DELETE/SELECT stays valid.
const DELETE_ID_CHUNK_SIZE = 500;
function deleteCallLogRowsByIds(ids) {
    if (ids.length === 0) {
        return {
            deletedRows: 0,
            deletedArtifacts: 0
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let deletedRows = 0;
    let deletedArtifacts = 0;
    for(let i = 0; i < ids.length; i += DELETE_ID_CHUNK_SIZE){
        const chunk = ids.slice(i, i + DELETE_ID_CHUNK_SIZE);
        const placeholders = chunk.map(()=>"?").join(", ");
        const rows = db.prepare(`SELECT artifact_relpath FROM call_logs WHERE id IN (${placeholders})`).all(...chunk);
        const result = db.prepare(`DELETE FROM call_logs WHERE id IN (${placeholders})`).run(...chunk);
        deletedRows += result.changes;
        for (const row of rows){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(row.artifact_relpath)) {
                deletedArtifacts++;
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])();
    return {
        deletedRows,
        deletedArtifacts
    };
}
function cleanupOrphanCallLogFiles(baseDir = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return 0;
    try {
        const referenced = listReferencedArtifacts();
        let deleted = 0;
        for (const file of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["listCallLogArtifactFiles"])(baseDir)){
            if (referenced.has(file.relativePath)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(file.relativePath)) {
                deleted++;
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])(baseDir);
        return deleted;
    } catch (error) {
        console.error("[callLogs] Failed to prune orphan request artifacts:", error.message);
        return 0;
    }
}
function cleanupOverflowCallLogFiles(baseDir = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], maxEntries) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return 0;
    const limit = maxEntries ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCallLogMaxEntries"])();
    if (!Number.isInteger(limit) || limit < 1) return 0;
    try {
        let deleted = 0;
        const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["listCallLogArtifactFiles"])(baseDir);
        for (const file of files.slice(limit)){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(file.relativePath)) {
                clearArtifactReference(file.relativePath, "missing");
                deleted++;
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])(baseDir);
        return deleted;
    } catch (error) {
        console.error("[callLogs] Failed to prune overflow request artifacts:", error.message);
        return 0;
    }
}
function deleteCallLogsBefore(cutoff) {
    // #5618: page the id selection so a large backlog never loads in one `.all()`.
    let deletedRows = 0;
    let deletedArtifacts = 0;
    for(;;){
        const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["selectCallLogIdsBefore"])(cutoff);
        if (ids.length === 0) break;
        const result = deleteCallLogRowsByIds(ids);
        deletedRows += result.deletedRows;
        deletedArtifacts += result.deletedArtifacts;
        if (result.deletedRows === 0) break;
    }
    return {
        deletedRows,
        deletedArtifacts
    };
}
function trimCallLogsToMaxRows(maxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])()) {
    if (!Number.isInteger(maxRows) || maxRows < 1) {
        return {
            deletedRows: 0,
            deletedArtifacts: 0
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let deletedRows = 0;
    let deletedArtifacts = 0;
    const batchSize = 5000;
    while(true){
        const currentCount = db.prepare("SELECT COUNT(*) AS cnt FROM call_logs").get();
        if (currentCount.cnt <= maxRows) break;
        const toDelete = Math.min(currentCount.cnt - maxRows, batchSize);
        const ids = db.prepare("SELECT id FROM call_logs ORDER BY timestamp ASC LIMIT ?").all(toDelete).map((row)=>String(row.id));
        const result = deleteCallLogRowsByIds(ids);
        deletedRows += result.deletedRows;
        deletedArtifacts += result.deletedArtifacts;
        if (result.deletedRows === 0) break;
    }
    return {
        deletedRows,
        deletedArtifacts
    };
}
function resolveProviderDisplay(provider, nodeName, nodePrefix) {
    const rawProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(provider);
    if (!rawProvider) return null;
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(nodeName)?.trim();
    if (name) return name;
    const prefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(nodePrefix)?.trim();
    if (prefix) return prefix;
    return null;
}
function mapSummaryRow(row) {
    const detailState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeDetailState"])(row.detail_state);
    const provider = row.provider;
    const nodeName = row.provider_node_name ?? null;
    const nodePrefix = row.provider_node_prefix ?? null;
    return {
        id: row.id,
        timestamp: row.timestamp,
        method: row.method,
        path: row.path,
        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.status),
        model: row.model,
        requestedModel: applyNodePrefix(row.requested_model, provider, nodePrefix),
        provider,
        providerDisplay: resolveProviderDisplay(provider, nodeName, nodePrefix),
        account: row.resolved_account || row.account,
        connectionId: row.connection_id,
        duration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.duration),
        tokens: {
            in: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_in),
            out: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_out),
            cacheRead: row.tokens_cache_read != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_cache_read) : null,
            cacheWrite: row.tokens_cache_creation != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_cache_creation) : null,
            reasoning: row.tokens_reasoning != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_reasoning) : null,
            compressed: row.tokens_compressed != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_compressed) : null
        },
        cacheSource: row.cache_source || "upstream",
        requestType: row.request_type,
        sourceFormat: row.source_format,
        targetFormat: row.target_format,
        apiKeyId: row.api_key_id,
        apiKeyName: row.api_key_name,
        comboName: row.combo_name,
        comboStepId: row.combo_step_id,
        comboExecutionKey: row.combo_execution_key,
        error: row.error_summary,
        detailState,
        artifactRelPath: row.artifact_relpath,
        artifactSizeBytes: row.artifact_size_bytes,
        artifactSha256: row.artifact_sha256,
        requestSummary: row.request_summary ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_summary) : null,
        hasRequestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.has_request_body) === 1,
        hasResponseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.has_response_body) === 1,
        hasPipelineDetails: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.has_pipeline_details) === 1,
        correlationId: row.correlation_id || null,
        modelPinned: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(row.model_pinned) === 1,
        sessionTag: row.session_tag || null
    };
}
function buildLegacyPipelinePayloads(id) {
    const detailed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getRequestDetailLogByCallLogId"])(id);
    if (!detailed) return null;
    return {
        clientRequest: detailed.client_request ?? null,
        providerRequest: detailed.translated_request ?? null,
        providerResponse: detailed.provider_response ?? null,
        clientResponse: detailed.client_response ?? null
    };
}
function getLegacyInlineDetail(id) {
    if (!hasTable("call_logs_v1_legacy")) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT request_body, response_body, error FROM call_logs_v1_legacy WHERE id = ?").get(id);
    if (!row) return null;
    return {
        requestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_body),
        responseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.response_body),
        error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseInlineError"])(row.error)
    };
}
async function saveCallLog(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["shouldPersistToDisk"]) return;
    try {
        const apiKeyContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogApiKeyContext$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCallLogApiKeyContext"])();
        // `||` (not `??`): an empty-string apiKeyId/apiKeyName is "unattributed",
        // same as before this fallback existed — it must not be persisted verbatim
        // nor block the request-scoped context.
        const apiKeyId = entry.apiKeyId || apiKeyContext?.apiKeyId || null;
        const apiKeyName = entry.apiKeyName || apiKeyContext?.apiKeyName || null;
        const noLogEnabled = Boolean(entry.noLog) || (apiKeyId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isNoLog"])(apiKeyId) : false);
        const protectedRequestBody = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.requestBody);
        const protectedResponseBody = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.responseBody);
        const protectedPipelinePayloads = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["protectPipelinePayloads"])(entry.pipelinePayloads ?? entry.pipeline ?? null);
        const protectedError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeErrorForLog"])(entry.error);
        const account = await resolveAccountName(entry.connectionId || null);
        const rawProvider = entry.provider || "-";
        const rawRequestedModel = entry.requestedModel || null;
        let resolvedRequestedModel = rawRequestedModel;
        if (rawRequestedModel && isCompatibleProviderId(rawProvider)) {
            const nodePrefix = await resolveProviderPrefix(rawProvider);
            resolvedRequestedModel = applyNodePrefix(rawRequestedModel, rawProvider, nodePrefix);
        }
        // #6187: usage-derived reasoning tokens stay UNCHANGED (cost math reads this),
        // while reasoning source/char-count are recorded separately for observability.
        const tokensReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getReasoningTokensOrNull"])(entry.tokens);
        const reasoningObservation = resolveReasoningObservation(tokensReasoning, entry.responseBody);
        const logEntry = {
            id: typeof entry.id === "string" && entry.id.length > 0 ? entry.id : generateLogId(),
            timestamp: typeof entry.timestamp === "string" ? entry.timestamp : new Date().toISOString(),
            method: entry.method || "POST",
            path: entry.path || "/v1/chat/completions",
            status: entry.status || 0,
            model: entry.model || "-",
            requestedModel: resolvedRequestedModel,
            provider: rawProvider,
            account,
            connectionId: entry.connectionId || null,
            duration: entry.duration || 0,
            tokensIn: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(entry.tokens)),
            tokensOut: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(entry.tokens)),
            tokensCacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getPromptCacheReadTokensOrNull"])(entry.tokens),
            tokensCacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getPromptCacheCreationTokensOrNull"])(entry.tokens),
            tokensReasoning,
            reasoningSource: reasoningObservation.source,
            reasoningChars: reasoningObservation.chars,
            tokensCompressed: entry.tokensCompressed != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toNumber"])(entry.tokensCompressed) : null,
            cacheSource: entry.cacheSource === "semantic" ? "semantic" : "upstream",
            requestType: entry.requestType || null,
            sourceFormat: entry.sourceFormat || null,
            targetFormat: entry.targetFormat || null,
            apiKeyId,
            apiKeyName,
            comboName: entry.comboName || null,
            comboStepId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboStepId),
            comboExecutionKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboExecutionKey) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboStepId),
            correlationId: entry.correlationId || null,
            modelPinned: entry.modelPinned ? 1 : 0,
            sessionTag: entry.sessionTag || null
        };
        const requestSummary = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildRequestSummary"])(logEntry.requestType, protectedRequestBody);
        const detailExpected = !noLogEnabled && (protectedRequestBody !== null || protectedResponseBody !== null || protectedError !== null || protectedPipelinePayloads !== null);
        let detailState = "none";
        let artifactRelPath = null;
        let artifactSizeBytes = null;
        let artifactSha256 = null;
        if (detailExpected) {
            const artifact = buildArtifact(logEntry, protectedRequestBody, protectedResponseBody, protectedError, protectedPipelinePayloads);
            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact);
            if (artifactResult) {
                detailState = "ready";
                artifactRelPath = artifactResult.relPath;
                artifactSizeBytes = artifactResult.sizeBytes;
                artifactSha256 = artifactResult.sha256;
            } else {
                detailState = "missing";
            }
        }
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare(`
      INSERT INTO call_logs (
        id, timestamp, method, path, status, model, requested_model, provider,
        account, connection_id, duration, tokens_in, tokens_out,
        tokens_cache_read, tokens_cache_creation, tokens_reasoning, tokens_compressed,
        reasoning_source, reasoning_chars,
        cache_source, request_type, source_format, target_format, api_key_id, api_key_name,
        combo_name, combo_step_id, combo_execution_key, error_summary, detail_state,
        artifact_relpath, artifact_size_bytes, artifact_sha256,
        has_request_body, has_response_body, has_pipeline_details, request_summary,
        correlation_id, model_pinned, session_tag
      )
      VALUES (
        @id, @timestamp, @method, @path, @status, @model, @requestedModel, @provider,
        @account, @connectionId, @duration, @tokensIn, @tokensOut,
        @tokensCacheRead, @tokensCacheCreation, @tokensReasoning, @tokensCompressed,
        @reasoningSource, @reasoningChars,
        @cacheSource, @requestType, @sourceFormat, @targetFormat, @apiKeyId, @apiKeyName,
        @comboName, @comboStepId, @comboExecutionKey, @errorSummary, @detailState,
        @artifactRelPath, @artifactSizeBytes, @artifactSha256,
        @hasRequestBody, @hasResponseBody, @hasPipelineDetails, @requestSummary,
        @correlationId, @modelPinned, @sessionTag
      )
    `).run({
            ...logEntry,
            errorSummary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStoredErrorSummary"])(protectedError),
            detailState,
            artifactRelPath,
            artifactSizeBytes,
            artifactSha256,
            hasRequestBody: protectedRequestBody !== null ? 1 : 0,
            hasResponseBody: protectedResponseBody !== null ? 1 : 0,
            hasPipelineDetails: protectedPipelinePayloads ? 1 : 0,
            requestSummary
        });
        scheduleCallLogRotation();
    } catch (error) {
        console.error("[callLogs] Failed to save call log:", error.message);
    }
}
function rotateCallLogs() {
    try {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"] || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"])) return;
        const retentionMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])() * 24 * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - retentionMs).toISOString();
        deleteCallLogsBefore(cutoff);
        trimCallLogsToMaxRows((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])());
        cleanupOverflowCallLogFiles(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getCallLogMaxEntries"])());
        cleanupOrphanCallLogFiles(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]);
    } catch (error) {
        console.error("[callLogs] Failed to rotate request artifacts:", error.message);
    }
}
function runScheduledCallLogRotation() {
    if (callLogRotateInFlight) return;
    callLogRotateInFlight = true;
    setImmediate(()=>{
        try {
            rotateCallLogs();
        } catch (error) {
            console.error("[callLogs] Failed to rotate request artifacts:", error.message);
        } finally{
            callLogRotateInFlight = false;
        }
    });
}
function scheduleCallLogRotation() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]) return;
    const elapsed = Date.now() - lastCallLogRotationScheduledAt;
    if (elapsed >= CALL_LOG_ROTATE_THROTTLE_MS) {
        lastCallLogRotationScheduledAt = Date.now();
        runScheduledCallLogRotation();
        return;
    }
    if (callLogRotateScheduled) return;
    callLogRotateScheduled = true;
    lastCallLogRotationScheduledAt = Date.now();
    const timer = setTimeout(()=>{
        callLogRotateScheduled = false;
        runScheduledCallLogRotation();
    }, CALL_LOG_ROTATE_THROTTLE_MS - elapsed);
    timer.unref?.();
}
if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["shouldPersistToDisk"] && ("TURBOPACK compile-time value", "development") !== "test") {
    scheduleCallLogRotation();
}
/**
 * Pushes a `column LIKE %value%` condition (mirrors the correlationId/sessionTag substring-match
 * precedent). Extracted so getCallLogs stays under the max-lines-per-function ratchet — #8249.
 */ function pushLikeFilter(conditions, params, column, paramKey, value) {
    if (!value) return;
    conditions.push(`cl.${column} LIKE @${paramKey}`);
    params[paramKey] = `%${value}%`;
}
async function getCallLogs(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = `
    SELECT cl.*,
      pn.name AS provider_node_name, pn.prefix AS provider_node_prefix,
      ${RESOLVED_ACCOUNT_SQL} AS resolved_account
    FROM call_logs cl
    LEFT JOIN provider_nodes pn ON pn.id = cl.provider
    LEFT JOIN provider_connections pc ON pc.id = cl.connection_id
  `;
    const conditions = [];
    const params = {};
    if (filter.status) {
        if (filter.status === "error") {
            conditions.push("(cl.status >= 400 OR cl.error_summary IS NOT NULL)");
        } else if (filter.status === "ok") {
            conditions.push("cl.status >= 200 AND cl.status < 300");
        } else {
            const statusCode = Number.parseInt(filter.status, 10);
            if (!Number.isNaN(statusCode)) {
                conditions.push("cl.status = @statusCode");
                params.statusCode = statusCode;
            }
        }
    }
    if (filter.model) {
        conditions.push("(cl.model LIKE @modelQ OR cl.requested_model LIKE @modelQ)");
        params.modelQ = `%${filter.model}%`;
    }
    if (filter.provider) {
        conditions.push("cl.provider LIKE @providerQ");
        params.providerQ = `%${filter.provider}%`;
    }
    if (filter.account) {
        conditions.push(`(cl.account LIKE @accountQ OR ${RESOLVED_ACCOUNT_SQL} LIKE @accountQ)`);
        params.accountQ = `%${filter.account}%`;
    }
    if (filter.apiKey) {
        conditions.push("(cl.api_key_name LIKE @apiKeyQ OR cl.api_key_id LIKE @apiKeyQ)");
        params.apiKeyQ = `%${filter.apiKey}%`;
    }
    pushLikeFilter(conditions, params, "correlation_id", "correlationId", filter.correlationId);
    pushLikeFilter(conditions, params, "session_tag", "sessionTag", filter.sessionTag);
    if (filter.combo) {
        conditions.push("cl.combo_name IS NOT NULL");
    }
    if (filter.since) {
        conditions.push("cl.timestamp >= @since");
        params.since = filter.since instanceof Date ? filter.since.toISOString() : String(filter.since);
    }
    if (filter.until) {
        conditions.push("cl.timestamp <= @until");
        params.until = filter.until instanceof Date ? filter.until.toISOString() : String(filter.until);
    }
    if (filter.search) {
        conditions.push(`(
      cl.model LIKE @searchQ OR cl.path LIKE @searchQ OR cl.account LIKE @searchQ OR
      ${RESOLVED_ACCOUNT_SQL} LIKE @searchQ OR
      cl.requested_model LIKE @searchQ OR cl.provider LIKE @searchQ OR
      cl.api_key_name LIKE @searchQ OR cl.api_key_id LIKE @searchQ OR
      cl.combo_name LIKE @searchQ OR CAST(cl.status AS TEXT) LIKE @searchQ
      OR cl.combo_step_id LIKE @searchQ OR cl.combo_execution_key LIKE @searchQ
      OR cl.error_summary LIKE @searchQ
      OR cl.correlation_id LIKE @searchQ
    )`);
        params.searchQ = `%${filter.search}%`;
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    const limit = Number.isInteger(filter.limit) && filter.limit > 0 ? filter.limit : 200;
    const offset = Number.isInteger(filter.offset) && filter.offset > 0 ? filter.offset : 0;
    sql += ` ORDER BY cl.timestamp DESC LIMIT @__limit OFFSET @__offset`;
    params.__limit = limit;
    params.__offset = offset;
    const rows = db.prepare(sql).all(params);
    return rows.map(mapSummaryRow);
}
async function getCallLogById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT cl.*,
        pn.name AS provider_node_name,
        pn.prefix AS provider_node_prefix,
        ${RESOLVED_ACCOUNT_SQL} AS resolved_account
       FROM call_logs cl
       LEFT JOIN provider_nodes pn ON pn.id = cl.provider
       LEFT JOIN provider_connections pc ON pc.id = cl.connection_id
       WHERE cl.id = ?`).get(id);
    if (!row) return null;
    const entry = mapSummaryRow(row);
    let detailState = entry.detailState;
    let artifactRelPath = entry.artifactRelPath;
    if (artifactRelPath) {
        const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["readCallArtifact"])(artifactRelPath);
        if (artifactResult.state === "ready" && artifactResult.artifact) {
            return {
                ...entry,
                detailState: "ready",
                requestBody: artifactResult.artifact.requestBody ?? null,
                responseBody: artifactResult.artifact.responseBody ?? null,
                error: artifactResult.artifact.error ?? entry.error,
                pipelinePayloads: artifactResult.artifact.pipeline ?? buildLegacyPipelinePayloads(id),
                hasPipelineDetails: Boolean(artifactResult.artifact.pipeline) || entry.hasPipelineDetails,
                active: false
            };
        }
        detailState = artifactResult.state;
        if (artifactResult.state === "missing") {
            clearArtifactReference(artifactRelPath, "missing");
            artifactRelPath = null;
        } else {
            db.prepare("UPDATE call_logs SET detail_state = ? WHERE id = ?").run("corrupt", id);
        }
    }
    if (detailState === "legacy-inline") {
        const legacyInline = getLegacyInlineDetail(id);
        if (legacyInline) {
            const legacyPipeline = buildLegacyPipelinePayloads(id);
            return {
                ...entry,
                detailState,
                artifactRelPath,
                ...legacyInline,
                pipelinePayloads: legacyPipeline,
                hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
                active: false
            };
        }
    }
    const legacyDisk = readLegacyLogFromDisk(entry);
    if (legacyDisk) {
        const legacyPipeline = buildLegacyPipelinePayloads(id);
        return {
            ...entry,
            detailState,
            artifactRelPath,
            requestBody: legacyDisk.requestBody ?? null,
            responseBody: legacyDisk.responseBody ?? null,
            error: legacyDisk.error ?? entry.error,
            pipelinePayloads: legacyPipeline,
            hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
            active: false
        };
    }
    const legacyPipeline = buildLegacyPipelinePayloads(id);
    return {
        ...entry,
        detailState,
        artifactRelPath,
        requestBody: null,
        responseBody: null,
        error: entry.error,
        pipelinePayloads: legacyPipeline,
        hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
        active: false
    };
}
async function exportCallLogsSince(since) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const ids = db.prepare("SELECT id FROM call_logs WHERE timestamp >= ? ORDER BY timestamp DESC").all(since).map((row)=>String(row.id));
    const logs = [];
    for (const id of ids){
        const log = await getCallLogById(id);
        if (log) logs.push(log);
    }
    return logs;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usageDb.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
/**
 * usageDb.js — Facade (T-15 decomposition)
 *
 * This file is now a thin re-export layer. All logic has been
 * extracted into focused modules under `./usage/`:
 *
 *   migrations.js     — Legacy file + JSON→SQLite migration
 *   usageHistory.js   — Usage tracking, request log, pending requests
 *   costCalculator.js — Cost calculation (pure function)
 *   usageStats.js     — Aggregated stats for dashboard
 *   callLogs.js       — Structured call log management
 *
 * Existing imports like `import { getUsageStats } from "@/lib/usageDb"`
 * continue to work unchanged.
 */ // Trigger migrations on module load (side-effect)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [middleware] (ecmascript)");
// Re-export everything for backward compatibility
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/usageStats.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageStats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [middleware] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripAnthropicMessagesSuffix"])(baseUrl || "");
}
function normalizeClaudeCodeCompatibleBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripClaudeCodeCompatibleEndpointSuffix"])(baseUrl || "");
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(provider)) {
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
"[project]/src/shared/constants/alibabaProviderRegions.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALIBABA_PROVIDER_ENDPOINTS",
    ()=>ALIBABA_PROVIDER_ENDPOINTS,
    "ALIBABA_PROVIDER_REGION_VALUES",
    ()=>ALIBABA_PROVIDER_REGION_VALUES,
    "getDefaultAlibabaProviderRegion",
    ()=>getDefaultAlibabaProviderRegion,
    "isAlibabaRegionalProvider",
    ()=>isAlibabaRegionalProvider,
    "normalizeAlibabaProviderRegion",
    ()=>normalizeAlibabaProviderRegion,
    "resolveAlibabaProviderBaseUrl",
    ()=>resolveAlibabaProviderBaseUrl,
    "resolveAlibabaProviderMediaBaseUrl",
    ()=>resolveAlibabaProviderMediaBaseUrl,
    "resolveAlibabaProviderModelsUrl",
    ()=>resolveAlibabaProviderModelsUrl,
    "resolveAlibabaProviderRegion",
    ()=>resolveAlibabaProviderRegion
]);
const ALIBABA_PROVIDER_REGION_VALUES = [
    "global-sg",
    "china-beijing"
];
const ALIBABA_PROVIDER_ENDPOINTS = {
    alibaba: {
        "global-sg": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        "china-beijing": "https://dashscope.aliyuncs.com/compatible-mode/v1"
    },
    "bailian-coding-plan": {
        "global-sg": "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1",
        "china-beijing": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1"
    },
    "qwen-cloud": {
        "global-sg": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        "china-beijing": "https://dashscope.aliyuncs.com/compatible-mode/v1"
    },
    "qwen-cloud-token-plan": {
        "global-sg": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
        "china-beijing": "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"
    }
};
const REGIONAL_PROVIDER_IDS = new Set([
    "alibaba",
    "alibaba-cn",
    "bailian-coding-plan",
    "qwen-cloud",
    "qwen-cloud-token-plan"
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function canonicalProviderFamily(providerId) {
    if (providerId === "alibaba-cn") return "alibaba";
    if (providerId === "alibaba" || providerId === "bailian-coding-plan" || providerId === "qwen-cloud" || providerId === "qwen-cloud-token-plan") {
        return providerId;
    }
    return null;
}
const SLASH_CHAR_CODE = 47;
/**
 * Strip every trailing "/" in linear time.
 *
 * Deliberately not a regex: `/\/+$/` has no left anchor, so the engine retries at
 * every start offset and each attempt re-walks the slash run before failing `$` —
 * quadratic on an endpoint made of many slashes (CodeQL js/polynomial-redos).
 * Connection base URLs are operator-supplied, so they reach this trim directly.
 */ function stripTrailingSlashes(value) {
    let end = value.length;
    while(end > 0 && value.charCodeAt(end - 1) === SLASH_CHAR_CODE)end--;
    return end === value.length ? value : value.slice(0, end);
}
function normalizeEndpoint(value) {
    return stripTrailingSlashes(value.trim()).replace(/\/(?:chat\/completions|messages)$/i, "").toLowerCase();
}
function isFamilyPresetUrl(family, value) {
    const normalized = normalizeEndpoint(value);
    return ALIBABA_PROVIDER_REGION_VALUES.some((region)=>normalizeEndpoint(ALIBABA_PROVIDER_ENDPOINTS[family][region]) === normalized);
}
function isAlibabaRegionalProvider(providerId) {
    return typeof providerId === "string" && REGIONAL_PROVIDER_IDS.has(providerId);
}
function getDefaultAlibabaProviderRegion(providerId) {
    return providerId === "alibaba-cn" ? "china-beijing" : "global-sg";
}
function normalizeAlibabaProviderRegion(value, fallback = "global-sg") {
    if (typeof value !== "string") return fallback;
    switch(value.trim().toLowerCase()){
        case "global-sg":
        case "global":
        case "international":
        case "singapore":
        case "ap-southeast-1":
            return "global-sg";
        case "china-beijing":
        case "china":
        case "cn":
        case "beijing":
        case "cn-beijing":
            return "china-beijing";
        default:
            return fallback;
    }
}
function resolveAlibabaProviderRegion(providerId, providerSpecificData) {
    const fallback = getDefaultAlibabaProviderRegion(providerId);
    return normalizeAlibabaProviderRegion(asRecord(providerSpecificData).region, fallback);
}
function resolveAlibabaProviderBaseUrl(providerId, providerSpecificData, fallback = "") {
    const family = canonicalProviderFamily(providerId);
    const data = asRecord(providerSpecificData);
    const configuredBaseUrl = typeof data.baseUrl === "string" && data.baseUrl.trim() ? data.baseUrl.trim() : "";
    if (!family) return configuredBaseUrl || fallback;
    if (configuredBaseUrl && !isFamilyPresetUrl(family, configuredBaseUrl)) {
        return configuredBaseUrl;
    }
    const region = resolveAlibabaProviderRegion(providerId, data);
    return ALIBABA_PROVIDER_ENDPOINTS[family][region];
}
function resolveAlibabaProviderModelsUrl(providerId, providerSpecificData, fallback = "") {
    const baseUrl = stripTrailingSlashes(resolveAlibabaProviderBaseUrl(providerId, providerSpecificData, fallback).trim()).replace(/\/(?:chat\/completions|messages|models)$/i, "");
    return baseUrl ? `${baseUrl}/models` : "";
}
function resolveAlibabaProviderMediaBaseUrl(providerId, providerSpecificData, fallback = "") {
    return stripTrailingSlashes(resolveAlibabaProviderBaseUrl(providerId, providerSpecificData, fallback).trim()).replace(/\/compatible-mode\/v1(?:\/(?:chat\/completions|models))?$/i, "/api/v1").replace(/\/apps\/anthropic(?:\/v1)?(?:\/messages)?$/i, "/api/v1");
}
}),
"[project]/src/shared/reasoning/effortStandardization.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CANONICAL_EFFORT_VALUES",
    ()=>CANONICAL_EFFORT_VALUES,
    "effortRequestSchema",
    ()=>effortRequestSchema,
    "extendCodexGpt56EffortValues",
    ()=>extendCodexGpt56EffortValues,
    "normalizeEffort",
    ()=>normalizeEffort,
    "normalizeReasoningRequest",
    ()=>normalizeReasoningRequest,
    "thinkingRequestSchema",
    ()=>thinkingRequestSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const CANONICAL_EFFORT_VALUES = [
    "none",
    "low",
    "medium",
    "high",
    "xhigh"
];
function extendCodexGpt56EffortValues(provider, model, baseValues) {
    const values = [
        ...baseValues
    ];
    const normalizedProvider = provider?.trim().toLowerCase();
    const normalizedModel = model?.trim().toLowerCase().replace(/^(?:codex|cx|kiro|kr)\//, "");
    if (!normalizedModel) return values;
    const match = normalizedModel.match(/^gpt-5\.6-(sol|terra|luna)(?:-(?:none|low|medium|high|xhigh|max|ultra))?$/);
    if (!match) return values;
    const isKiroProvider = normalizedProvider === "kiro" || normalizedProvider === "kr";
    if (isKiroProvider) {
        return values.includes("max") ? values : [
            ...values,
            "max"
        ];
    }
    if (normalizedProvider !== "codex" && normalizedProvider !== "cx") return values;
    const nativeValues = [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
    ];
    return match[1] === "luna" ? nativeValues : [
        ...nativeValues,
        "ultra"
    ];
}
/**
 * UI-facing tier synonyms mapped onto the canonical set. The issue (#6241) requested a
 * 5-tier UI vocabulary (Low / Medium / High / Extra / Max); that request collapses onto
 * the existing 5-value canonical set. "extra" and "max" are both synonyms for the top
 * reasoning tier and map to canonical `xhigh`. The per-provider mappers already down-shift
 * `xhigh` to `high` for models that do not support it (see
 * `open-sse/translator/request/openai-to-claude.ts`), so a caller can always request the
 * highest tier without knowing which models support `xhigh`.
 */ const EFFORT_TIER_ALIASES = {
    extra: "xhigh",
    max: "xhigh"
};
function normalizeEffort(value) {
    if (typeof value !== "string") return undefined;
    const lowered = value.trim().toLowerCase();
    if (!lowered) return undefined;
    if (lowered in EFFORT_TIER_ALIASES) return EFFORT_TIER_ALIASES[lowered];
    return CANONICAL_EFFORT_VALUES.includes(lowered) ? lowered : undefined;
}
const effortRequestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].preprocess((value)=>normalizeEffort(value) ?? value, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum(CANONICAL_EFFORT_VALUES));
const thinkingRequestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown())
]);
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeReasoningRequest(body) {
    if (!isPlainObject(body)) return body;
    const canonicalEffort = normalizeEffort(body.effort);
    const canonicalThinking = body.thinking;
    const hasCanonicalThinkingBool = typeof canonicalThinking === "boolean";
    if (canonicalEffort === undefined && !hasCanonicalThinkingBool) return body;
    const reasoning = body.reasoning;
    const clientSetReasoningEffort = body.reasoning_effort !== undefined;
    const clientSetReasoningObjEffort = isPlainObject(reasoning) && reasoning.effort !== undefined;
    const next = {
        ...body
    };
    // Canonical effort → the fields the mappers read. Skip entirely if the client already
    // expressed a reasoning effort (either shape) so client intent is preserved.
    if (canonicalEffort !== undefined && !clientSetReasoningEffort && !clientSetReasoningObjEffort) {
        next.reasoning_effort = canonicalEffort;
        next.reasoning = {
            ...isPlainObject(reasoning) ? reasoning : {},
            effort: canonicalEffort
        };
    }
    // Canonical boolean `thinking` → keep the truthy toggle the mappers read. Only when the
    // client did NOT provide an explicit object-shaped thinking config (that always wins).
    if (hasCanonicalThinkingBool) {
        next.thinking = canonicalThinking;
    }
    return next;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/reasoningRouting/policy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyReasoningRuleDirective",
    ()=>applyReasoningRuleDirective,
    "attachReasoningRuleDirective",
    ()=>attachReasoningRuleDirective,
    "extractReasoningIntent",
    ()=>extractReasoningIntent,
    "filterComboForReasoningDecision",
    ()=>filterComboForReasoningDecision,
    "globMatches",
    ()=>globMatches,
    "isCodexTarget",
    ()=>isCodexTarget,
    "resolveReasoningRoutingRule",
    ()=>resolveReasoningRoutingRule,
    "resolveReasoningSourceModels",
    ()=>resolveReasoningSourceModels,
    "validateCodexWsDecision",
    ()=>validateCodexWsDecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/combos.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/reasoningRoutingRules.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [middleware] (ecmascript)");
;
;
;
;
;
const EFFORTS = new Set([
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max",
    "ultra"
]);
const SCOPE_RANK = {
    apiKey: 4,
    combo: 3,
    model: 2,
    global: 1,
    connection: 0
};
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function effort(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return EFFORTS.has(normalized) ? normalized : null;
}
function thinkingLevelEffort(value) {
    if (value === false) return "none";
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    if ([
        "disabled",
        "off",
        "false"
    ].includes(normalized)) return "none";
    return effort(normalized);
}
function splitGenericEffortSuffix(model) {
    const claude = model.toLowerCase().includes("claude") ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["splitClaudeEffortSuffix"])(model) : null;
    if (claude?.effort) return {
        model: claude.baseModel,
        effort: claude.effort
    };
    return splitCodexEffortSuffix(model) ?? {
        model,
        effort: null
    };
}
function supportsCodexSuffix(candidate, normalizedBase) {
    if (candidate === "max") return /^gpt-5\.6-(?:sol|terra|luna)$/.test(normalizedBase);
    if (candidate === "ultra") return /^gpt-5\.6-(?:sol|terra)$/.test(normalizedBase);
    return true;
}
function splitCodexEffortSuffix(model) {
    const lower = model.toLowerCase();
    for (const candidate of [
        "ultra",
        "xhigh",
        "medium",
        "high",
        "none",
        "low",
        "max"
    ]){
        if (!lower.endsWith(`-${candidate}`)) continue;
        const baseModel = model.slice(0, -(candidate.length + 1));
        const normalizedBase = baseModel.toLowerCase().replace(/^(?:codex|cx)\//, "");
        if (/^gpt-[\w.-]+$/.test(normalizedBase) && supportsCodexSuffix(candidate, normalizedBase)) {
            return {
                model: baseModel,
                effort: candidate
            };
        }
    }
    return null;
}
function firstDefinedEffort(body, reasoning, thinking, thinkingConfig, suffixEffort) {
    const output = asRecord(body.output_config);
    const values = [
        effort(reasoning.effort),
        effort(body.reasoning_effort),
        effort(body.reasoningEffort),
        effort(body.effort),
        effort(output.effort),
        thinkingLevelEffort(body.thinkingLevel),
        thinkingLevelEffort(body.thinking_level),
        thinkingLevelEffort(thinkingConfig.thinkingLevel ?? thinkingConfig.thinking_level),
        body.thinking === false || thinking.type === "disabled" ? "none" : null,
        suffixEffort
    ];
    return values.find((value)=>value !== null) ?? null;
}
function hasNumericField(record, key) {
    return typeof record[key] === "number";
}
function detectThinkingBudget(body, reasoning, thinking, thinkingConfig) {
    const budgetFields = [
        [
            thinking,
            "budget_tokens"
        ],
        [
            thinking,
            "budgetTokens"
        ],
        [
            reasoning,
            "budget_tokens"
        ],
        [
            reasoning,
            "budgetTokens"
        ],
        [
            reasoning,
            "max_tokens"
        ],
        [
            body,
            "thinking_budget"
        ],
        [
            body,
            "thinkingBudget"
        ],
        [
            thinkingConfig,
            "thinkingBudget"
        ],
        [
            thinkingConfig,
            "thinking_budget"
        ]
    ];
    return budgetFields.some(([record, key])=>hasNumericField(record, key));
}
function hasReasoningSignal(body, reasoning, thinkingConfig, explicitEffort, hasBudget) {
    return explicitEffort !== null || [
        body.thinking,
        body.thinkingLevel,
        body.thinking_level,
        reasoning.effort,
        body.reasoning_effort,
        body.reasoningEffort,
        body.effort,
        asRecord(body.output_config).effort,
        thinkingConfig.thinkingLevel,
        thinkingConfig.thinking_level
    ].some((value)=>value !== undefined) || hasBudget;
}
function extractReasoningIntent(modelInput, bodyInput) {
    const body = asRecord(bodyInput);
    const rawModel = typeof modelInput === "string" ? modelInput.trim() : "";
    const suffixed = splitGenericEffortSuffix(rawModel);
    const reasoning = asRecord(body.reasoning);
    const thinking = asRecord(body.thinking);
    const generationConfig = asRecord(body.generationConfig);
    const thinkingConfig = asRecord(generationConfig.thinkingConfig ?? generationConfig.thinking_config);
    const explicitEffort = firstDefinedEffort(body, reasoning, thinking, thinkingConfig, suffixed.effort);
    const hasThinkingBudget = detectThinkingBudget(body, reasoning, thinking, thinkingConfig);
    const hasReasoningSignalValue = hasReasoningSignal(body, reasoning, thinkingConfig, explicitEffort, hasThinkingBudget);
    return {
        model: suffixed.model,
        effort: explicitEffort,
        sourceEffort: explicitEffort ?? (hasReasoningSignalValue ? "signal" : "missing"),
        hasReasoningSignal: hasReasoningSignalValue,
        hasThinkingBudget
    };
}
function globMatches(pattern, value) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(`^${escaped}$`, "i").test(value);
}
async function resolveReasoningSourceModels(model, resolve) {
    try {
        const resolved = await resolve(model);
        const resolvedModel = typeof resolved?.model === "string" && resolved.model.trim() ? resolved.model.trim() : null;
        const provider = typeof resolved?.provider === "string" && resolved.provider.trim() ? resolved.provider.trim() : null;
        const normalized = provider && resolvedModel ? `${provider}/${resolvedModel}` : resolvedModel || model;
        return {
            normalized,
            aliases: normalized.toLowerCase() === model.toLowerCase() ? [] : [
                model
            ]
        };
    } catch  {
        return {
            normalized: model,
            aliases: []
        };
    }
}
function tagsMatch(rule, requestTags) {
    if (rule.requestTags.length === 0) return true;
    const available = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeRoutingTags"])(requestTags));
    return rule.tagMatchMode === "all" ? rule.requestTags.every((tag)=>available.has(tag)) : rule.requestTags.some((tag)=>available.has(tag));
}
function modelMatches(rule, model) {
    if (!rule.modelPattern) return true;
    return globMatches(rule.modelPattern, model);
}
function isExactModelMatch(rule, model) {
    return !!rule.modelPattern && !/[?*]/.test(rule.modelPattern) && rule.modelPattern.toLowerCase() === model.toLowerCase();
}
function capabilityFor(model, targetEffort, requiresReasoning = Boolean(targetEffort && targetEffort !== "none")) {
    if (!requiresReasoning || targetEffort === "none") return "supported";
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(model);
    if (capabilities.supportsThinking === false) return "unsupported";
    if (targetEffort === "max" || targetEffort === "ultra") {
        const normalized = model.toLowerCase().replace(/^(?:codex|cx)\//, "");
        const supported = targetEffort === "ultra" ? /^gpt-5\.6-(?:sol|terra)(?:-|$)/.test(normalized) : /^gpt-5\.6-(?:sol|terra|luna)(?:-|$)/.test(normalized);
        if (supported) return "supported";
        if (capabilities.supportsThinking === null) return "unknown";
        return "unsupported";
    }
    return capabilities.supportsThinking === null ? "unknown" : "supported";
}
function inputModels(input) {
    return [
        input.sourceModel,
        ...input.sourceModelAliases ?? []
    ];
}
function scopeMatches(rule, input) {
    if (input.connectionOnly ? rule.scope !== "connection" : rule.scope === "connection") {
        return false;
    }
    if (rule.scope === "apiKey" && rule.apiKeyId !== input.apiKeyId) return false;
    if (rule.scope === "combo" && rule.comboId !== input.comboId) return false;
    if (rule.scope === "connection" && rule.connectionId !== input.connectionId) return false;
    return rule.sourceEffort === "any" || rule.sourceEffort === input.sourceEffort;
}
function ruleMatches(rule, input) {
    return scopeMatches(rule, input) && inputModels(input).some((model)=>modelMatches(rule, model)) && tagsMatch(rule, input.requestTags ?? []);
}
function exactMatchScore(rule, input) {
    return Number(inputModels(input).some((model)=>isExactModelMatch(rule, model)));
}
function compareRules(input) {
    return (a, b)=>SCOPE_RANK[b.scope] - SCOPE_RANK[a.scope] || b.priority - a.priority || exactMatchScore(b, input) - exactMatchScore(a, input) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}
function resolveTargetModel(rule, sourceModel, combo) {
    if (combo) return typeof combo.name === "string" ? combo.name : rule.targetComboId;
    return rule.targetKind === "model" && rule.targetModel ? rule.targetModel : sourceModel;
}
async function resolveTarget(rule, sourceModel) {
    if (rule.targetKind !== "combo" || !rule.targetComboId) {
        return {
            targetCombo: null,
            targetModel: resolveTargetModel(rule, sourceModel, null)
        };
    }
    const targetCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$combos$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getComboById"])(rule.targetComboId);
    if (!targetCombo) throw new Error("Reasoning routing target combo does not exist");
    return {
        targetCombo,
        targetModel: resolveTargetModel(rule, sourceModel, targetCombo)
    };
}
function resolveTargetEffort(rule, input) {
    const inherits = rule.effortMode === "inherit" || rule.effortMode === "default" && input.hasReasoningSignal;
    if (!inherits) return rule.targetEffort;
    return input.sourceEffort === "missing" || input.sourceEffort === "signal" ? null : input.sourceEffort;
}
function resolveCapability(targetCombo, targetModel, targetEffort, requiresReasoning) {
    if (!targetCombo) {
        return {
            capability: capabilityFor(targetModel, targetEffort, requiresReasoning),
            warnings: []
        };
    }
    const models = Array.isArray(targetCombo.models) ? targetCombo.models : [];
    const statuses = models.map((entry)=>{
        const record = asRecord(entry);
        const model = typeof entry === "string" ? entry : typeof record.model === "string" ? String(record.model) : null;
        return model ? capabilityFor(model, targetEffort, requiresReasoning) : "unknown";
    });
    const capability = statuses.length > 0 && statuses.every((status)=>status === "unsupported") ? "unsupported" : statuses.some((status)=>status === "unknown") ? "unknown" : "supported";
    const unsupportedCount = statuses.filter((status)=>status === "unsupported").length;
    const warnings = unsupportedCount > 0 && capability !== "unsupported" ? [
        `${unsupportedCount} incompatible combo target(s) will be skipped`
    ] : [];
    return {
        capability,
        warnings
    };
}
async function resolveReasoningRoutingRule(input) {
    const rules = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$reasoningRoutingRules$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getReasoningRoutingRules"])({
        enabledOnly: true
    });
    const candidates = rules.filter((rule)=>ruleMatches(rule, input)).sort(compareRules(input));
    const rule = candidates[0];
    if (!rule) return null;
    const { targetCombo, targetModel } = await resolveTarget(rule, input.sourceModel);
    const targetEffort = resolveTargetEffort(rule, input);
    const budgetAction = targetEffort === "none" ? "remove" : rule.budgetAction;
    const requiresReasoning = targetEffort !== "none" && (Boolean(targetEffort) || budgetAction === "set" || budgetAction === "preserve" && input.hasThinkingBudget === true);
    const capabilityResult = resolveCapability(targetCombo, input.capabilityModel || targetModel, targetEffort, requiresReasoning);
    const capability = capabilityResult.capability;
    const warnings = capabilityResult.warnings;
    if (capability === "unknown") warnings.push("Reasoning capability could not be verified");
    return {
        rule,
        sourceModel: input.sourceModel,
        sourceEffort: input.sourceEffort,
        targetModel,
        targetCombo,
        targetEffort,
        capability,
        requiresReasoning,
        warnings
    };
}
function clearReasoning(body) {
    delete body.reasoning_effort;
    delete body.reasoningEffort;
    delete body.reasoning;
    delete body.effort;
    delete body.thinking;
    delete body.thinkingLevel;
    delete body.thinking_level;
    delete body.thinking_budget;
    delete body.thinkingBudget;
    if (body.output_config && typeof body.output_config === "object") {
        const output = {
            ...asRecord(body.output_config)
        };
        delete output.effort;
        body.output_config = output;
    }
}
function clearDiscreteReasoning(body) {
    delete body.reasoning_effort;
    delete body.reasoningEffort;
    delete body.effort;
    delete body.thinkingLevel;
    delete body.thinking_level;
    if (body.reasoning && typeof body.reasoning === "object") {
        const reasoning = {
            ...asRecord(body.reasoning)
        };
        delete reasoning.effort;
        if (Object.keys(reasoning).length > 0) body.reasoning = reasoning;
        else delete body.reasoning;
    }
    if (body.output_config && typeof body.output_config === "object") {
        const output = {
            ...asRecord(body.output_config)
        };
        delete output.effort;
        if (Object.keys(output).length > 0) body.output_config = output;
        else delete body.output_config;
    }
    const thinking = asRecord(body.thinking);
    if (body.thinking !== undefined && typeof thinking.budget_tokens !== "number") {
        delete body.thinking;
    }
}
function removeBudgets(body) {
    delete body.thinking_budget;
    delete body.thinkingBudget;
    const thinking = {
        ...asRecord(body.thinking)
    };
    delete thinking.budget_tokens;
    delete thinking.budgetTokens;
    if (Object.keys(thinking).length > 0 && body.thinking !== undefined) body.thinking = thinking;
    else delete body.thinking;
    const reasoning = {
        ...asRecord(body.reasoning)
    };
    delete reasoning.budget_tokens;
    delete reasoning.budgetTokens;
    delete reasoning.max_tokens;
    if (Object.keys(reasoning).length > 0 && body.reasoning !== undefined) body.reasoning = reasoning;
    else if (body.reasoning !== undefined) delete body.reasoning;
    const generationConfig = {
        ...asRecord(body.generationConfig)
    };
    delete generationConfig.thinkingConfig;
    delete generationConfig.thinking_config;
    if (Object.keys(generationConfig).length > 0) body.generationConfig = generationConfig;
    else delete body.generationConfig;
}
function applyBudget(body, action, budget) {
    if (action === "preserve") return;
    removeBudgets(body);
    if (action === "remove") return;
    body.thinking = {
        type: "enabled",
        budget_tokens: budget
    };
}
function attachReasoningRuleDirective(bodyInput, decision) {
    const source = asRecord(bodyInput);
    const body = {
        ...source,
        model: decision.rule.scope === "connection" ? source.model : decision.targetModel
    };
    body._omnirouteReasoningRule = {
        id: decision.rule.id,
        effortMode: decision.rule.effortMode,
        targetEffort: decision.targetEffort,
        budgetAction: decision.targetEffort === "none" ? "remove" : decision.rule.budgetAction,
        budgetTokens: decision.rule.budgetTokens
    };
    body._omnirouteReasoningRouteTrace = {
        ruleId: decision.rule.id,
        ruleName: decision.rule.name,
        scope: decision.rule.scope,
        sourceModel: decision.sourceModel,
        targetModel: decision.targetModel,
        sourceEffort: decision.sourceEffort,
        targetEffort: decision.targetEffort,
        effortMode: decision.rule.effortMode,
        budgetAction: decision.targetEffort === "none" ? "remove" : decision.rule.budgetAction,
        capability: decision.capability,
        warnings: decision.warnings
    };
    return body;
}
function applyReasoningRuleDirective(bodyInput) {
    const source = asRecord(bodyInput);
    const directive = asRecord(source._omnirouteReasoningRule);
    if (!directive.id) return bodyInput;
    const body = {
        ...source
    };
    delete body._omnirouteReasoningRule;
    const effortMode = directive.effortMode;
    const targetEffort = effort(directive.targetEffort);
    if (effortMode === "force" && targetEffort === "none") clearReasoning(body);
    else if ((effortMode === "force" || effortMode === "default") && targetEffort) {
        if (effortMode === "force") clearDiscreteReasoning(body);
        body.reasoning_effort = targetEffort;
        body.reasoning = {
            ...asRecord(body.reasoning),
            effort: targetEffort
        };
        body.output_config = {
            ...asRecord(body.output_config),
            effort: targetEffort
        };
    }
    applyBudget(body, directive.budgetAction, typeof directive.budgetTokens === "number" ? directive.budgetTokens : null);
    return body;
}
function filterComboForReasoningDecision(comboInput, decision) {
    const combo = {
        ...asRecord(comboInput)
    };
    if (!Array.isArray(combo.models) || !decision.requiresReasoning) return {
        combo,
        removed: []
    };
    const removed = [];
    combo.models = combo.models.filter((entry)=>{
        const model = typeof entry === "string" ? entry : typeof asRecord(entry).model === "string" ? String(asRecord(entry).model) : null;
        if (!model) return true;
        if (capabilityFor(model, decision.targetEffort, true) !== "unsupported") return true;
        removed.push(model);
        return false;
    });
    return {
        combo: combo.models.length > 0 ? combo : null,
        removed
    };
}
function isCodexTarget(model) {
    return !model.includes("/") || /^(?:codex|cx)\//i.test(model);
}
function validateCodexWsDecision(decision) {
    if (decision.targetCombo) {
        const models = Array.isArray(decision.targetCombo.models) ? decision.targetCombo.models : [];
        const allCodex = models.length > 0 && models.every((entry)=>{
            const model = typeof entry === "string" ? entry : typeof asRecord(entry).model === "string" ? String(asRecord(entry).model) : "";
            return !!model && isCodexTarget(model);
        });
        if (!allCodex) return "Codex WebSocket reasoning rules require a Codex-only target";
        return "Codex WebSocket transport cannot execute combo targets";
    }
    return isCodexTarget(decision.targetModel) ? null : "Codex WebSocket reasoning rules require a Codex target model";
}
}),
"[project]/src/lib/memory/injection.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Memory Injection — prepend retrieved memories into the request message list.
 *
 * Injection strategy:
 *   1. If the provider supports system messages (most providers), inject as a
 *      leading system message so it takes effect without disrupting user turns.
 *   2. Otherwise (fallback for providers that reject system role), inject as the
 *      first user message prefixed with the memory context label.
 *
 * Format: "Memory context: <content>"
 */ __turbopack_context__.s([
    "formatMemoryContext",
    ()=>formatMemoryContext,
    "injectMemory",
    ()=>injectMemory,
    "providerSupportsSystemMessage",
    ()=>providerSupportsSystemMessage,
    "shouldInjectMemory",
    ()=>shouldInjectMemory,
    "systemMessageMustBeFirst",
    ()=>systemMessageMustBeFirst
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/logger.ts [middleware] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$logger$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["logger"])("MEMORY_INJECTION");
/**
 * Providers known NOT to support a top-level system-role message.
 * These receive memories injected as the first user message instead.
 */ const PROVIDERS_WITHOUT_SYSTEM_MESSAGE = new Set([
    "o1",
    "o1-mini",
    "o1-preview",
    "glm",
    "glmt",
    "glm-cn",
    "zai",
    "qianfan"
]);
function providerSupportsSystemMessage(provider) {
    if (!provider) return true;
    const normalized = provider.toLowerCase().trim();
    return !PROVIDERS_WITHOUT_SYSTEM_MESSAGE.has(normalized);
}
/**
 * Providers that accept a system-role message ONLY at index 0 (a `system`
 * message at any later position is rejected with HTTP 400). For these, the
 * cache-safe mid-array splice (which inserts memory just before the last user
 * turn) is unsafe in multi-turn conversations, so memory must be merged into /
 * prepended as the leading system message instead. See #6135.
 *
 * Populated with the Xiaomi MiMo endpoint (provider id `xiaomi-mimo`, registry
 * alias `mimo`, serving mimo-v2.5) confirmed live to 400 on a non-first system
 * message. Add other providers here only when they are documented as strict.
 */ const PROVIDERS_SYSTEM_MUST_BE_FIRST = new Set([
    "xiaomi-mimo",
    "mimo"
]);
function systemMessageMustBeFirst(provider) {
    if (!provider) return false;
    const normalized = provider.toLowerCase().trim();
    return PROVIDERS_SYSTEM_MUST_BE_FIRST.has(normalized);
}
function formatMemoryContext(memories) {
    if (!memories || memories.length === 0) return "";
    const content = memories.map((m)=>m.content.trim()).filter(Boolean).join("\n");
    return content ? `Memory context: ${content}` : "";
}
/**
 * #6135: place the memory as a leading system message for providers that reject
 * a non-first system role — merging into an existing index-0 system message when
 * present, else prepending. Split out of injectMemory to keep it flat.
 */ function injectSystemFirst(request, messages, memoryText, count) {
    log.info("memory.injection.injected", {
        count,
        strategy: "system-first",
        model: request.model
    });
    const first = messages[0];
    if (first && first.role === "system") {
        const merged = {
            ...first,
            content: `${memoryText}\n${first.content}`
        };
        return {
            ...request,
            messages: [
                merged,
                ...messages.slice(1)
            ]
        };
    }
    const memorySystemMessage = {
        role: "system",
        content: memoryText
    };
    return {
        ...request,
        messages: [
            memorySystemMessage,
            ...messages
        ]
    };
}
/**
 * Place a memory message at the #3890 cache-safe anchor (just before the last
 * user turn) when one exists, else prepend it. Shared by the system and user
 * injection strategies to keep injectMemory flat.
 */ function placeMessage(request, messages, msg, cacheSafeIndex) {
    if (cacheSafeIndex >= 0) {
        const next = [
            ...messages
        ];
        next.splice(cacheSafeIndex, 0, msg);
        return {
            ...request,
            messages: next
        };
    }
    return {
        ...request,
        messages: [
            msg,
            ...messages
        ]
    };
}
function injectMemory(request, memories, provider, options = {}) {
    if (!memories || memories.length === 0) {
        log.info("memory.injection.skipped", {
            reason: "no_memories",
            model: request.model
        });
        return request;
    }
    const memoryText = formatMemoryContext(memories);
    if (!memoryText) {
        log.info("memory.injection.skipped", {
            reason: "empty_context",
            model: request.model
        });
        return request;
    }
    const messages = Array.isArray(request.messages) ? [
        ...request.messages
    ] : [];
    // #3890: in a caching context, anchor the injection just before the LAST user message so
    // the cacheable prefix (system prompt + prior turns) is preserved byte-for-byte. Falls
    // back to a leading message when caching is off or there is no user turn to anchor on.
    const cacheSafeIndex = options.cacheSafe ? messages.findLastIndex((m)=>m.role === "user") : -1;
    const supportsSystem = providerSupportsSystemMessage(provider);
    // #6135: strict providers reject a system message at a non-zero index. Never
    // apply the cache-safe mid-array splice for these — keep the system message
    // first (extracted to injectSystemFirst to keep this function flat).
    if (supportsSystem && systemMessageMustBeFirst(provider)) {
        return injectSystemFirst(request, messages, memoryText, memories.length);
    }
    // Strategy 1 (system): prepend before existing system messages, preserving the
    // caller's own instructions. Strategy 2 (user, e.g. o1-mini): inject as a user
    // message. Both honor the #3890 cache-safe anchor via placeMessage.
    const role = supportsSystem ? "system" : "user";
    const memoryMessage = {
        role,
        content: memoryText
    };
    const base = supportsSystem ? "system" : "user";
    log.info("memory.injection.injected", {
        count: memories.length,
        strategy: cacheSafeIndex >= 0 ? `${base}-cache-safe` : base,
        model: request.model
    });
    return placeMessage(request, messages, memoryMessage, cacheSafeIndex);
}
function shouldInjectMemory(request, config) {
    if (config?.enabled === false) return false;
    return Array.isArray(request.messages) && request.messages.length > 0;
}
}),
"[project]/src/shared/constants/headers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OMNIROUTE_RESPONSE_HEADERS",
    ()=>OMNIROUTE_RESPONSE_HEADERS
]);
const OMNIROUTE_RESPONSE_HEADERS = {
    cache: "X-OmniRoute-Cache",
    cacheHit: "X-OmniRoute-Cache-Hit",
    compression: "X-OmniRoute-Compression",
    costSaved: "X-OmniRoute-Cost-Saved",
    decision: "X-OmniRoute-Decision",
    fallbackAttempts: "X-OmniRoute-Fallback-Attempts",
    latencyMs: "X-OmniRoute-Latency-Ms",
    model: "X-OmniRoute-Model",
    progress: "X-OmniRoute-Progress",
    provider: "X-OmniRoute-Provider",
    requestId: "X-OmniRoute-Request-Id",
    responseCost: "X-OmniRoute-Response-Cost",
    tokensIn: "[REDIGIDO-PRESERVACAO]",
    tokensOut: "[REDIGIDO-PRESERVACAO]",
    version: "X-OmniRoute-Version"
};
}),
"[project]/src/domain/omnirouteResponseMeta.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/appConfig.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    if (hasProvider) parts.push(`provider=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(provider)}`);
    parts.push(`latency_ms=${toNonNegativeInteger(latencyMs)}`);
    return toHeaderValue(parts.join("; "));
}
function buildOmniRouteResponseMetaHeaders({ cacheHit = false, costUsd = 0, costSavedUsd = undefined, fallbackAttempts = 0, latencyMs = 0, model = null, provider = null, requestId = null, strategy = null, usage = null }) {
    const tokens = getOmniRouteTokenCounts(usage);
    const headers = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].cacheHit]: toHeaderValue(String(cacheHit)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].latencyMs]: toHeaderValue(String(toNonNegativeInteger(latencyMs))),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].responseCost]: toHeaderValue(formatOmniRouteCost(costUsd)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].tokensIn]: toHeaderValue(String(tokens.input)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].tokensOut]: toHeaderValue(String(tokens.output)),
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].version]: toHeaderValue(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$appConfig$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["APP_CONFIG"].version)
    };
    if (typeof model === "string" && model.trim().length > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].model] = toHeaderValue(model);
    }
    if (typeof requestId === "string" && requestId.trim().length > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].requestId] = toHeaderValue(requestId);
    }
    if (typeof provider === "string" && provider.trim().length > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].provider] = toHeaderValue((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderAlias"])(provider));
    }
    // Cache-saved cost: emitted only when the caller passes a value (cache HITs), so
    // non-cache responses keep their existing header shape. `0` is a valid saved cost.
    if (costSavedUsd != null) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].costSaved] = toHeaderValue(formatOmniRouteCost(costSavedUsd));
    }
    const attempts = toNonNegativeInteger(fallbackAttempts);
    if (attempts > 0) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].fallbackAttempts] = toHeaderValue(String(attempts));
    }
    const decisionValue = buildOmniRouteDecisionHeaderValue({
        strategy,
        provider,
        latencyMs
    });
    if (decisionValue !== null) {
        headers[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OMNIROUTE_RESPONSE_HEADERS"].decision] = decisionValue;
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
"[project]/src/lib/services/registry.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Singleton registry of ServiceSupervisor instances. */ __turbopack_context__.s([
    "getSupervisor",
    ()=>getSupervisor,
    "registerSupervisor",
    ()=>registerSupervisor,
    "unregisterSupervisor",
    ()=>unregisterSupervisor
]);
const supervisors = new Map();
function registerSupervisor(supervisor) {
    supervisors.set(supervisor.getStatus().tool, supervisor);
}
function getSupervisor(tool) {
    return supervisors.get(tool) ?? null;
}
function unregisterSupervisor(tool) {
    supervisors.delete(tool);
}
async function stopAll() {
    // Drive every supervisor stop to completion before the process exits so the
    // DB status writes inside ServiceSupervisor.stop() flush. Otherwise the
    // event loop drains immediately on SIGTERM and rows are stuck in "running"
    // or "starting" until the next boot.
    await Promise.allSettled(Array.from(supervisors.values()).map((supervisor)=>supervisor.stop()));
}
function handleShutdownSignal(signal) {
    stopAll().catch(()=>{
    /* never throw out of a signal handler */ }).finally(()=>{
        // Re-raise the signal with the default disposition so the process exit
        // status reflects the original signal (128 + signal number) rather than
        // a synthetic process.exit() code.
        process.kill(process.pid, signal);
    });
}
process.once("SIGINT", ()=>handleShutdownSignal("SIGINT"));
process.once("SIGTERM", ()=>handleShutdownSignal("SIGTERM"));
}),
"[project]/src/lib/services/apiKey.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceApiKeyDecryptError",
    ()=>ServiceApiKeyDecryptError,
    "generateServiceApiKey",
    ()=>generateServiceApiKey,
    "getOrCreateApiKey",
    ()=>getOrCreateApiKey,
    "maskApiKey",
    ()=>maskApiKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/encryption.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/versionManager.ts [middleware] (ecmascript)");
;
;
;
function generateServiceApiKey(prefix = "nr") {
    return `${prefix}_${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("base64url")}`;
}
class ServiceApiKeyDecryptError extends Error {
    constructor(tool){
        super(`Stored API key for service '${tool}' could not be decrypted. ` + `STORAGE_ENCRYPTION_KEY may have changed, the row may be corrupted, ` + `or it was written on a different machine. Reinstall the service ` + `or rotate the key via POST /api/services/${tool}/rotate-key.`);
        this.name = "ServiceApiKeyDecryptError";
    }
}
async function getOrCreateApiKey(tool) {
    const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getServiceRow"])(tool);
    if (row?.apiKey) {
        const decrypted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["decrypt"])(row.apiKey);
        if (decrypted) return decrypted;
        // Fail loud: silently regenerating would mint a new key the embedded
        // service has never been told, causing every request to 401 with no
        // operator-facing signal.
        throw new ServiceApiKeyDecryptError(tool);
    }
    // Dario reuses this mechanism to generate+persist its DARIO_ADMIN_TOKEN
    // (any long random string works — it gates the /admin/* control plane).
    const prefix = tool === "9router" ? "nr" : tool === "mux" ? "mx" : tool === "dario" ? "da" : "cp";
    const key = generateServiceApiKey(prefix);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$versionManager$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["updateServiceField"])(tool, "apiKey", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$encryption$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encrypt"])(key) ?? key);
    return key;
}
function maskApiKey(plainKey) {
    const last4 = plainKey.slice(-4);
    return `nr_••••••••${last4}`;
}
}),
"[project]/src/lib/providers/webCookieAuth.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
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
];

//# sourceMappingURL=src_025lr7x._.js.map