module.exports = [
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
];

//# sourceMappingURL=src_lib_1jum56f._.js.map