module.exports = [
"[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * usage/scalars.ts — pure scalar + string coercion helpers for usage fetchers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the zero-dependency
 * primitives that the per-provider usage fetchers lean on to coerce raw upstream JSON
 * (numbers, percentages, snake/camel field lookups, display labels). Pure — no network,
 * no DB, no module state — so they live as a neutral leaf that usage.ts (and future
 * per-provider fetcher leaves) import without a cycle. Behavior-preserving move.
 */ __turbopack_context__.s([
    "clampPercentage",
    ()=>clampPercentage,
    "getFieldValue",
    ()=>getFieldValue,
    "pickFirstNonEmptyString",
    ()=>pickFirstNonEmptyString,
    "roundCurrency",
    ()=>roundCurrency,
    "toDisplayLabel",
    ()=>toDisplayLabel,
    "toNumber",
    ()=>toNumber,
    "toPercentage",
    ()=>toPercentage,
    "toRecord",
    ()=>toRecord,
    "toTitleCase",
    ()=>toTitleCase
]);
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function toPercentage(value) {
    return Math.max(0, Math.min(100, toNumber(value, 0)));
}
function toTitleCase(value) {
    return value.trim().split(/[\s_-]+/).filter(Boolean).map((part)=>part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}
function getFieldValue(source, snakeKey, camelKey) {
    const obj = toRecord(source);
    return obj[snakeKey] ?? obj[camelKey] ?? null;
}
function clampPercentage(value) {
    return Math.max(0, Math.min(100, value));
}
function roundCurrency(value) {
    return Math.round(value * 100) / 100;
}
function toDisplayLabel(value) {
    return value.replace(/^copilot[_\s-]*/i, "").split(/[\s_-]+/).filter(Boolean).map((part)=>{
        if (/^pro\+$/i.test(part)) return "Pro+";
        if (/^[a-z]{2,}$/.test(part)) return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        return part;
    }).join(" ").trim();
}
function pickFirstNonEmptyString(...values) {
    for (const value of values){
        if (typeof value !== "string") continue;
        const trimmed = value.trim();
        if (trimmed) return trimmed;
    }
    return undefined;
}
}),
"[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createQuotaFromUsage",
    ()=>createQuotaFromUsage,
    "parseResetTime",
    ()=>parseResetTime
]);
/**
 * usage/quota.ts — shared usage-quota shape + builders for the usage fetchers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the `UsageQuota` value
 * type every per-provider fetcher returns, plus the two pure builders that normalize
 * upstream reset timestamps and assemble a quota from used/total counts. Depends only on
 * the sibling scalar leaf — no network, no DB, no module state — so usage.ts and the
 * per-provider fetcher leaves (MiniMax, GLM, …) import it without a cycle.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
;
function parseResetTime(resetValue) {
    if (!resetValue) return null;
    try {
        let date;
        if (resetValue instanceof Date) {
            date = resetValue;
        } else if (typeof resetValue === "number") {
            date = new Date(resetValue < 1e12 ? resetValue * 1000 : resetValue);
        } else if (typeof resetValue === "string") {
            // Numeric strings are Unix timestamps too (seconds or milliseconds).
            // `new Date("1700000000")` otherwise returns Invalid Date.
            if (/^\d+$/.test(resetValue)) {
                const ts = Number(resetValue);
                date = new Date(ts < 1e12 ? ts * 1000 : ts);
            } else {
                date = new Date(resetValue);
            }
        } else {
            return null;
        }
        // Epoch-zero (1970-01-01) means no scheduled reset — treat as null
        if (date.getTime() <= 0) return null;
        return date.toISOString();
    } catch  {
        return null;
    }
}
function createQuotaFromUsage(usedValue, totalValue, resetValue) {
    const total = Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(totalValue, 0));
    const used = total > 0 ? Math.min(Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(usedValue, 0)), total) : 0;
    const remaining = total > 0 ? Math.max(total - used, 0) : 0;
    return {
        used,
        total,
        remaining,
        remainingPercentage: total > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(remaining / total * 100) : 0,
        resetAt: parseResetTime(resetValue),
        unlimited: false
    };
}
}),
"[project]/open-sse/services/usage/minimax.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createMiniMaxQuotaFromCount",
    ()=>createMiniMaxQuotaFromCount,
    "createMiniMaxQuotaFromPercent",
    ()=>createMiniMaxQuotaFromPercent,
    "getMiniMaxAuthErrorMessage",
    ()=>getMiniMaxAuthErrorMessage,
    "getMiniMaxErrorSummary",
    ()=>getMiniMaxErrorSummary,
    "getMiniMaxPlanLabel",
    ()=>getMiniMaxPlanLabel,
    "getMiniMaxQuotaResetAt",
    ()=>getMiniMaxQuotaResetAt,
    "getMiniMaxRemainingPercent",
    ()=>getMiniMaxRemainingPercent,
    "getMiniMaxSessionTotal",
    ()=>getMiniMaxSessionTotal,
    "getMiniMaxUsage",
    ()=>getMiniMaxUsage,
    "getMiniMaxWeeklyTotal",
    ()=>getMiniMaxWeeklyTotal,
    "inferMiniMaxPlanLabelFromTotals",
    ()=>inferMiniMaxPlanLabelFromTotals,
    "isMiniMaxTextQuotaModel",
    ()=>isMiniMaxTextQuotaModel
]);
/**
 * usage/minimax.ts — MiniMax (minimax / minimax-cn) usage fetcher + quota helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the full MiniMax family —
 * plan-label inference, per-window quota assembly, and the getMiniMaxUsage fetcher that
 * probes the coding-plan remains endpoints. Depends only on the sibling scalar/quota
 * leaves — no host coupling — so it lives as a co-located provider leaf. usage.ts imports
 * getMiniMaxUsage (dispatcher) + getMiniMaxPlanLabel/getMiniMaxSessionTotal (__testing).
 * Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
const MINIMAX_USAGE_CONFIG = {
    minimax: {
        usageUrls: [
            "https://www.minimax.io/v1/token_plan/remains",
            "https://api.minimax.io/v1/api/openplatform/coding_plan/remains"
        ]
    },
    "minimax-cn": {
        usageUrls: [
            "https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains",
            "https://api.minimaxi.com/v1/api/openplatform/coding_plan/remains"
        ]
    }
};
function inferMiniMaxPlanLabelFromTotals(models) {
    const maxSessionTotal = models.reduce((maxTotal, model)=>Math.max(maxTotal, getMiniMaxSessionTotal(model)), 0);
    if (maxSessionTotal >= 15_000) return "Max";
    if (maxSessionTotal >= 4_500) return "Plus";
    if (maxSessionTotal >= 1_500) return "Starter";
    return null;
}
function getMiniMaxPlanLabel(payload, models = []) {
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickFirstNonEmptyString"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "current_subscribe_title", "currentSubscribeTitle"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "plan_name", "planName"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "plan", "plan"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "current_plan_title", "currentPlanTitle"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "combo_title", "comboTitle"));
    if (!raw) return inferMiniMaxPlanLabelFromTotals(models) || "Coding Plan";
    const cleaned = raw.replace(/^minimax\s+/i, "").replace(/\bcoding\s+plan\b/gi, "").replace(/\s{2,}/g, " ").trim();
    return cleaned || inferMiniMaxPlanLabelFromTotals(models) || "Coding Plan";
}
function getMiniMaxQuotaResetAt(model, capturedAtMs, remainsTimeSnakeKey, remainsTimeCamelKey, endTimeSnakeKey, endTimeCamelKey) {
    const remainsMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, remainsTimeSnakeKey, remainsTimeCamelKey), 0);
    if (remainsMs > 0) {
        return new Date(capturedAtMs + remainsMs).toISOString();
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, endTimeSnakeKey, endTimeCamelKey));
}
function isMiniMaxTextQuotaModel(modelName) {
    const normalized = modelName.trim().toLowerCase();
    return normalized.startsWith("minimax-m") || normalized.startsWith("coding-plan") || // MiniMax Coding Plan surfaces the text/coding quota under model "general"
    // (media buckets like "video"/"image"/"music" are excluded).
    normalized === "general";
}
function getMiniMaxSessionTotal(model) {
    return Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, "current_interval_total_count", "currentIntervalTotalCount"), 0));
}
function getMiniMaxWeeklyTotal(model) {
    return Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, "current_weekly_total_count", "currentWeeklyTotalCount"), 0));
}
function pickMiniMaxRepresentativeModel(models, getTotal) {
    const withQuota = models.filter((model)=>getTotal(model) > 0);
    const pool = withQuota.length > 0 ? withQuota : models;
    if (pool.length === 0) return null;
    return pool.reduce((best, current)=>getTotal(current) > getTotal(best) ? current : best);
}
function createMiniMaxQuotaFromCount(total, count, resetAt, countMeansRemaining) {
    const used = countMeansRemaining ? Math.max(total - count, 0) : count;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQuotaFromUsage"])(used, total, resetAt);
}
function getMiniMaxRemainingPercent(model, snakeKey, camelKey) {
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, snakeKey, camelKey);
    if (raw === null || raw === undefined || raw === "") return null;
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(raw, NaN);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null;
}
function createMiniMaxQuotaFromPercent(remainingPercent, resetAt) {
    const clamped = Math.max(0, Math.min(100, remainingPercent));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQuotaFromUsage"])(100 - clamped, 100, resetAt);
}
/**
 * Build one MiniMax usage window (session or weekly) from the representative
 * model. Token Plan keys report request counts (`*_total_count`); Coding Plan
 * keys report zero counts and a `*_remaining_percent` instead — fall back to
 * that so the Coding Plan still surfaces a quota. The percent signal is keyed
 * off "counts == 0 + percent present", NOT the endpoint URL, because the
 * `token_plan/remains` and `coding_plan/remains` endpoints return identical
 * Coding-Plan payloads for a Coding Plan key.
 */ function buildMiniMaxWindow(models, getTotal, usageCountKeys, percentKeys, resetKeys, capturedAtMs, countMeansRemaining) {
    const model = pickMiniMaxRepresentativeModel(models, getTotal);
    if (!model) return null;
    const resetAt = getMiniMaxQuotaResetAt(model, capturedAtMs, ...resetKeys);
    const total = getTotal(model);
    if (total > 0) {
        const count = Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, ...usageCountKeys), 0));
        return createMiniMaxQuotaFromCount(total, count, resetAt, countMeansRemaining);
    }
    const remainingPercent = getMiniMaxRemainingPercent(model, ...percentKeys);
    return remainingPercent !== null ? createMiniMaxQuotaFromPercent(remainingPercent, resetAt) : null;
}
function getMiniMaxAuthErrorMessage(message) {
    const normalized = message.toLowerCase();
    if (normalized.includes("token plan") || normalized.includes("coding plan") || normalized.includes("active period") || normalized.includes("invalid api key") || normalized.includes("invalid key") || normalized.includes("subscription")) {
        return "MiniMax Token Plan API key invalid or inactive. Use an active Token Plan key.";
    }
    return "MiniMax access denied. Confirm the key is an active Token Plan API key.";
}
function getMiniMaxErrorSummary(status, message) {
    const compact = message.replace(/\s+/g, " ").trim();
    if (!compact) {
        return `MiniMax usage endpoint error (${status}).`;
    }
    if (compact.length <= 160) {
        return `MiniMax usage endpoint error (${status}): ${compact}`;
    }
    return `MiniMax usage endpoint error (${status}): ${compact.slice(0, 157)}...`;
}
async function getMiniMaxUsage(apiKey, provider) {
    if (!apiKey) {
        return {
            message: "MiniMax API key not available. Add a Token Plan API key."
        };
    }
    const usageUrls = MINIMAX_USAGE_CONFIG[provider].usageUrls;
    let lastErrorMessage = "";
    for(let index = 0; index < usageUrls.length; index += 1){
        const usageUrl = usageUrls[index];
        const canFallback = index < usageUrls.length - 1;
        try {
            const response = await fetch(usageUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            const rawText = await response.text();
            let payload = {};
            if (rawText) {
                try {
                    payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(rawText));
                } catch  {
                    payload = {};
                }
            }
            const baseResp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "base_resp", "baseResp"));
            const apiStatusCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(baseResp, "status_code", "statusCode"), 0);
            const apiStatusMessage = String((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(baseResp, "status_msg", "statusMsg") ?? "").trim();
            const combinedMessage = `${apiStatusMessage} ${rawText}`.trim();
            const authLikeStatusMessage = /token plan|coding plan|invalid api key|invalid key|unauthorized|inactive/i;
            if (response.status === 401 || response.status === 403 || apiStatusCode === 1004 || authLikeStatusMessage.test(apiStatusMessage)) {
                return {
                    message: getMiniMaxAuthErrorMessage(apiStatusMessage || combinedMessage)
                };
            }
            if (!response.ok) {
                lastErrorMessage = getMiniMaxErrorSummary(response.status, combinedMessage);
                if ((response.status === 404 || response.status === 405 || response.status >= 500) && canFallback) {
                    continue;
                }
                return {
                    message: `MiniMax connected. ${lastErrorMessage}`
                };
            }
            if (rawText && Object.keys(payload).length === 0) {
                return {
                    message: "MiniMax connected. Unable to parse usage response."
                };
            }
            if (apiStatusCode !== 0) {
                if (apiStatusMessage) {
                    return {
                        message: `MiniMax connected. ${apiStatusMessage}`
                    };
                }
                return {
                    message: "MiniMax connected. Upstream quota API returned an error."
                };
            }
            const capturedAtMs = Date.now();
            const modelRemains = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(payload, "model_remains", "modelRemains");
            const allModels = Array.isArray(modelRemains) ? modelRemains.map((item)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(item)) : [];
            const textModels = allModels.filter((model)=>{
                const modelName = String((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(model, "model_name", "modelName") ?? "");
                return isMiniMaxTextQuotaModel(modelName);
            });
            if (textModels.length === 0) {
                return {
                    message: "MiniMax connected. No text quota data was returned."
                };
            }
            const countMeansRemaining = usageUrl.includes("/coding_plan/remains");
            const quotas = {};
            const sessionQuota = buildMiniMaxWindow(textModels, getMiniMaxSessionTotal, [
                "current_interval_usage_count",
                "currentIntervalUsageCount"
            ], [
                "current_interval_remaining_percent",
                "currentIntervalRemainingPercent"
            ], [
                "remains_time",
                "remainsTime",
                "end_time",
                "endTime"
            ], capturedAtMs, countMeansRemaining);
            if (sessionQuota) {
                quotas["session (5h)"] = sessionQuota;
            }
            const weeklyQuota = buildMiniMaxWindow(textModels, getMiniMaxWeeklyTotal, [
                "current_weekly_usage_count",
                "currentWeeklyUsageCount"
            ], [
                "current_weekly_remaining_percent",
                "currentWeeklyRemainingPercent"
            ], [
                "weekly_remains_time",
                "weeklyRemainsTime",
                "weekly_end_time",
                "weeklyEndTime"
            ], capturedAtMs, countMeansRemaining);
            if (weeklyQuota) {
                quotas["weekly (7d)"] = weeklyQuota;
            }
            if (Object.keys(quotas).length === 0) {
                return {
                    message: "MiniMax connected. Unable to extract text quota usage."
                };
            }
            return {
                plan: getMiniMaxPlanLabel(payload, textModels),
                quotas
            };
        } catch (error) {
            lastErrorMessage = error.message;
            if (!canFallback) {
                break;
            }
        }
    }
    return {
        message: lastErrorMessage ? `MiniMax connected. Unable to fetch usage: ${lastErrorMessage}` : "MiniMax connected. Unable to fetch usage."
    };
}
}),
"[project]/open-sse/services/usage/glm.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGlmUsage",
    ()=>getGlmUsage,
    "glmMonthlyRemainingPercentage",
    ()=>glmMonthlyRemainingPercentage
]);
/**
 * usage/glm.ts — GLM (Zhipu) usage fetcher + quota helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the GLM family — token/window
 * quota naming, quota ordering, monthly-remaining math, and the getGlmUsage fetcher that
 * probes the Zhipu quota endpoint. Depends only on the sibling scalar/quota leaves plus the
 * GLM quota-URL config — no host coupling — so it lives as a co-located provider leaf.
 * usage.ts imports getGlmUsage (dispatcher) and re-exports glmMonthlyRemainingPercentage
 * (used by the glm-coding-plan-monthly test). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/glmProvider.ts [app-route] (ecmascript)");
;
;
function getGlmTokenQuotaName(limit, existingQuotas) {
    const unit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(limit.unit, 0);
    const number = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(limit.number, 0);
    if (unit === 3 && number === 5) return "session";
    if (unit === 6 && number === 1) return "weekly";
    if (unit === 4 && number === 7 || unit === 3 && number >= 24 * 7) return "weekly";
    return existingQuotas.session ? "weekly" : "session";
}
function getGlmQuotaDisplayName(quotaName) {
    if (quotaName === "session") return "5 Hours Quota";
    if (quotaName === "weekly") return "Weekly Quota";
    return quotaName;
}
const GLM_QUOTA_ORDER = [
    "5 Hours Quota",
    "Weekly Quota",
    "Monthly Tools",
    "Tokens",
    "Time Limit"
];
function getGlmQuotaLabel(type, unit) {
    const normalized = typeof type === "string" ? type.trim().toUpperCase() : "";
    const unitValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(unit, -1);
    switch(normalized){
        case "TOKENS_LIMIT":
        case "TOKEN_LIMIT":
            if (unitValue === 3) return "5 Hours Quota";
            if (unitValue === 6) return "Weekly Quota";
            return "Tokens";
        case "TIME_LIMIT":
        case "TIME_USAGE_LIMIT":
            if (unitValue === 5) return "Monthly Tools";
            return "Time Limit";
        default:
            return null;
    }
}
function orderGlmQuotas(quotas) {
    const ordered = {};
    for (const key of GLM_QUOTA_ORDER){
        if (quotas[key]) ordered[key] = quotas[key];
    }
    for (const [key, quota] of Object.entries(quotas)){
        if (!ordered[key]) ordered[key] = quota;
    }
    return ordered;
}
function glmMonthlyRemainingPercentage(total, remaining) {
    if (total > 0) {
        return Math.max(0, Math.min(100, Math.round(remaining / total * 100)));
    }
    return Math.max(0, Math.min(100, Math.round(remaining)));
}
function glmTeamQuotaIncompleteMessage(missing) {
    const fieldLabel = missing === "glmOrganizationId" ? "Organization ID" : "Project ID";
    return `GLM team plan quota requires both Organization ID and Project ID. Add the missing ${fieldLabel} on this connection.`;
}
function glmTeamQuotaHintMessage() {
    return "This API key appears to be a GLM Coding team plan. Add Organization ID and Project ID on this connection to view usage.";
}
function sanitizeGlmQuotaErrorMessage(msg) {
    if (typeof msg !== "string" || !msg.trim()) {
        return "Unable to fetch GLM quota.";
    }
    return msg.trim();
}
function shouldSuggestGlmTeamQuota(teamConfig, _providerSpecificData, _json, upstreamMsg) {
    if (teamConfig.state !== "none") return false;
    return /coding\s*plan|不存在.*plan|没有.*coding|团队|编码套餐/i.test(upstreamMsg);
}
async function getGlmUsage(apiKey, providerSpecificData) {
    if (!apiKey) {
        return {
            message: "API key not available. Add a coding plan API key to view usage."
        };
    }
    const teamConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGlmTeamQuotaConfig"])(providerSpecificData);
    if (teamConfig.state === "incomplete") {
        return {
            message: glmTeamQuotaIncompleteMessage(teamConfig.missing)
        };
    }
    const { url: quotaUrl, headers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$glmProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildGlmQuotaFetch"])(apiKey, providerSpecificData);
    const res = await fetch(quotaUrl, {
        headers
    });
    if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API key");
        throw new Error(`GLM quota API error (${res.status})`);
    }
    const json = await res.json();
    if (!json || typeof json !== "object") {
        throw new Error("Invalid JSON response from GLM quota API");
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(json.code, 200) === 401) {
        throw new Error("Invalid API key");
    }
    if (json.success === false) {
        const upstreamMsg = sanitizeGlmQuotaErrorMessage(json.msg ?? json.message);
        if (shouldSuggestGlmTeamQuota(teamConfig, providerSpecificData, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(json), upstreamMsg)) {
            return {
                message: glmTeamQuotaHintMessage()
            };
        }
        return {
            message: upstreamMsg
        };
    }
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(json.data);
    const limits = Array.isArray(data.limits) ? data.limits : [];
    const quotas = {};
    for (const limit of limits){
        const src = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(limit);
        const type = String(src.type || "").toUpperCase();
        const resetMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(src.nextResetTime, 0);
        const resetAt = resetMs > 0 ? new Date(resetMs).toISOString() : null;
        if (type === "TOKENS_LIMIT") {
            const quotaName = getGlmTokenQuotaName(src, quotas);
            const usedPercent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPercentage"])(src.percentage);
            const remaining = Math.max(0, 100 - usedPercent);
            quotas[quotaName] = {
                used: usedPercent,
                total: 100,
                remaining,
                remainingPercentage: remaining,
                resetAt,
                displayName: getGlmQuotaDisplayName(quotaName),
                details: Array.isArray(src.models) ? src.models.map((m)=>{
                    const modelInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(m);
                    return {
                        name: String(modelInfo.model || ""),
                        used: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(modelInfo.percentage, 0)
                    };
                }) : [],
                unlimited: false
            };
            continue;
        }
        if (type === "TIME_LIMIT") {
            const total = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(src.usage, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(src.total, 0));
            const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(src.remaining, Math.max(0, 100 - (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPercentage"])(src.percentage)));
            const used = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(src.currentValue, Math.max(0, total - remaining));
            const remainingPercentage = glmMonthlyRemainingPercentage(total, remaining);
            quotas["mcp_monthly"] = {
                used,
                total,
                remaining,
                remainingPercentage,
                resetAt,
                unlimited: false,
                displayName: "Monthly",
                details: Array.isArray(src.usageDetails) ? src.usageDetails.map((item)=>{
                    const detail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(item);
                    return {
                        name: String(detail.modelCode || detail.name || "usage"),
                        used: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(detail.usage, 0)
                    };
                }) : undefined
            };
        }
    }
    const levelRaw = typeof data.planName === "string" ? data.planName : typeof data.level === "string" ? data.level : "";
    const plan = levelRaw ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toTitleCase"])(levelRaw.replace(/\s*plan$/i, "")) : null;
    return {
        plan,
        quotas: orderGlmQuotas(quotas)
    };
}
}),
"[project]/open-sse/services/usage/antigravityWeeklyQuota.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAndParseAntigravityWeeklyQuotas",
    ()=>fetchAndParseAntigravityWeeklyQuotas,
    "fetchAntigravityUserQuotaSummaryCached",
    ()=>fetchAntigravityUserQuotaSummaryCached,
    "parseAntigravityWeeklyQuotas",
    ()=>parseAntigravityWeeklyQuotas
]);
/**
 * usage/antigravityWeeklyQuota.ts — Antigravity weekly-quota fetcher + parser (#4017).
 *
 * Antigravity enforces both a 5-hour window (already surfaced per-model by
 * `getAntigravityUsage()` via `retrieveUserQuota`) and a separate weekly window.
 * The weekly window is NOT part of the per-model `retrieveUserQuota` response —
 * it lives in a distinct upstream RPC, `v1internal:retrieveUserQuotaSummary`,
 * which groups models into families ("Gemini Models", "Claude and GPT models")
 * and reports one bucket per family per window (5h + weekly), keyed by a
 * `bucketId`/`displayName` pair rather than by individual modelId. There is no
 * dedicated window-type field on the bucket — the window is inferred from the
 * bucketId/displayName text (matches the reverse-engineered shape documented by
 * third-party Antigravity clients, since Google does not publish this API).
 *
 * This module is a small, self-contained leaf so `usage/antigravity.ts` stays a
 * thin caller: fetch (cached, best-effort) + pure parse, mirroring the existing
 * `fetchAntigravityUserQuotaCached` pattern.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [app-route] (ecmascript)");
;
;
;
const WEEKLY_QUOTA_CACHE_TTL_MS = 60 * 1000;
const _weeklyQuotaCache = new Map();
const _weeklyQuotaInflight = new Map();
// Self-contained purge timer — this leaf owns its own cache, so it owns the cleanup too
// (same pattern as usage/antigravity.ts's module-level caches).
const _weeklyQuotaCacheCleanupTimer = setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of _weeklyQuotaCache){
        if (now - entry.fetchedAt > WEEKLY_QUOTA_CACHE_TTL_MS) _weeklyQuotaCache.delete(key);
    }
}, 5 * 60 * 1000);
_weeklyQuotaCacheCleanupTimer.unref?.();
function buildCacheKey(accessToken, projectId, clientProfile) {
    return `${accessToken.substring(0, 16)}:${projectId || "default"}:${clientProfile}`;
}
async function fetchAntigravityUserQuotaSummaryCached(accessToken, projectId, clientProfile = "ide", options = {}) {
    if (!accessToken || !projectId) return null;
    const cacheKey = buildCacheKey(accessToken, projectId, clientProfile);
    const cached = _weeklyQuotaCache.get(cacheKey);
    if (!options.forceRefresh && cached && Date.now() - cached.fetchedAt < WEEKLY_QUOTA_CACHE_TTL_MS) {
        return cached.data;
    }
    const inflight = _weeklyQuotaInflight.get(cacheKey);
    if (inflight !== undefined) return inflight;
    const promise = (async ()=>{
        try {
            const response = await fetch("https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuotaSummary", {
                method: "POST",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken),
                body: JSON.stringify({
                    project: projectId
                }),
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) return null;
            const data = await response.json();
            _weeklyQuotaCache.set(cacheKey, {
                data,
                fetchedAt: Date.now()
            });
            return data;
        } catch  {
            return null;
        }
    })().finally(()=>{
        _weeklyQuotaInflight.delete(cacheKey);
    });
    _weeklyQuotaInflight.set(cacheKey, promise);
    return promise;
}
/** Matches a bucket's combined bucketId+displayName text against a window keyword. */ function bucketMatchesWindow(bucket, keyword) {
    const text = `${String(bucket.bucketId || "")} ${String(bucket.displayName || "")}`.toLowerCase();
    return keyword.test(text);
}
const WEEKLY_KEYWORD = /\bweekly\b/;
/** Turns a group displayName (e.g. "Gemini Models", "Claude and GPT models") into a quota key. */ function slugifyGroupWeeklyKey(displayName) {
    const cleaned = String(displayName || "").toLowerCase().replace(/\bmodels?\b/g, "").replace(/\band\b/g, " ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return cleaned ? `${cleaned}_weekly` : null;
}
function parseAntigravityWeeklyQuotas(summaryData) {
    const quotas = {};
    for (const groupValue of extractSummaryGroups(summaryData)){
        const entry = parseGroupWeeklyQuota((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(groupValue));
        if (entry) quotas[entry.key] = entry.quota;
    }
    return quotas;
}
/** Extracts `groups[]` from either observed response envelope (top-level or nested). */ function extractSummaryGroups(summaryData) {
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(summaryData);
    if (Array.isArray(root.groups)) return root.groups;
    const nested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(root.quotaSummary).groups;
    return Array.isArray(nested) ? nested : [];
}
/** Parses one model-family group into its weekly quota entry, or null when absent/invalid. */ function parseGroupWeeklyQuota(group) {
    const buckets = Array.isArray(group.buckets) ? group.buckets : [];
    const weeklyBucketValue = buckets.find((b)=>b && typeof b === "object" && bucketMatchesWindow((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(b), WEEKLY_KEYWORD));
    if (!weeklyBucketValue) return null;
    const weeklyBucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(weeklyBucketValue);
    if (weeklyBucket.disabled === true) return null;
    const key = slugifyGroupWeeklyKey(String(group.displayName || ""));
    if (!key) return null;
    const rawFraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(weeklyBucket.remainingFraction, -1);
    if (rawFraction < 0) return null;
    const remainingFraction = Math.max(0, Math.min(1, rawFraction));
    const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(weeklyBucket.resetTime);
    const isUnlimited = !resetAt && remainingFraction >= 1;
    const QUOTA_NORMALIZED_BASE = 1000;
    const total = QUOTA_NORMALIZED_BASE;
    const remaining = Math.round(total * remainingFraction);
    return {
        key,
        quota: {
            used: isUnlimited ? 0 : Math.max(0, total - remaining),
            total: isUnlimited ? 0 : total,
            resetAt,
            remainingPercentage: isUnlimited ? 100 : remainingFraction * 100,
            unlimited: isUnlimited,
            fractionReported: true,
            quotaSource: "retrieveUserQuota",
            displayName: String(group.displayName || "").trim() || undefined
        }
    };
}
async function fetchAndParseAntigravityWeeklyQuotas(accessToken, projectId, clientProfile = "ide", options = {}) {
    const data = await fetchAntigravityUserQuotaSummaryCached(accessToken, projectId, clientProfile, options);
    return parseAntigravityWeeklyQuotas(data);
}
}),
"[project]/open-sse/services/usage/antigravity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAntigravityPlanLabel",
    ()=>getAntigravityPlanLabel,
    "getAntigravityUsage",
    ()=>getAntigravityUsage,
    "mapCodeAssistSubscriptionToPlanLabel",
    ()=>mapCodeAssistSubscriptionToPlanLabel,
    "mapCodeAssistTierIdToLabel",
    ()=>mapCodeAssistTierIdToLabel,
    "mapSubscriptionTierStringToPlanLabel",
    ()=>mapSubscriptionTierStringToPlanLabel
]);
/**
 * usage/antigravity.ts — Antigravity (Gemini Code Assist) usage fetcher + quota helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the full Antigravity family —
 * local-usage fallback, code-assist tier/plan mapping, credit-balance probing, the user-quota
 * + available-models fetchers (with their module-level caches), and getAntigravityUsage. The
 * 4 data caches + their proactive TTL-purge setInterval move here as a self-contained unit
 * (previously the purge timer lived in usage.ts; that timer was
 * split so each module owns its own caches + cleanup). usage.ts imports getAntigravityUsage
 * (dispatcher) + getAntigravityPlanLabel/mapCodeAssist* (__testing). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityUpstream.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityModelAliases.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/agyModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityClientProfile.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/antigravity.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityCredits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityIdentity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codeAssistSubscription.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravityWeeklyQuota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/antigravityWeeklyQuota.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const ANTIGRAVITY_CONFIG = {
    quotaApiUrls: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityFetchAvailableModelsUrls"])(),
    loadProjectApiUrl: `${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_BOOTSTRAP_BASE_URLS"][0]}/v1internal:loadCodeAssist`,
    tokenUrl: "https://oauth2.googleapis.com/token",
    get clientId () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].antigravity.clientId;
    },
    get clientSecret () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].antigravity.clientSecret;
    }
};
const _antigravitySubCache = new Map();
const ANTIGRAVITY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ANTIGRAVITY_MODELS_CACHE_TTL_MS = 60 * 1000;
const ANTIGRAVITY_CREDIT_PROBE_TTL_MS = 5 * 60 * 1000;
const _antigravityAvailableModelsCache = new Map();
const _antigravityAvailableModelsInflight = new Map();
const _antigravityUserQuotaCache = new Map();
const _antigravityUserQuotaInflight = new Map();
const _antigravityCreditProbeCache = new Map();
const _antigravityCreditProbeInflight = new Map();
// ── Proactive TTL purging for the Antigravity module-level caches ──────────
// Split out of the shared usage.ts cleanup timer (god-file decomposition): this
// leaf owns its 4 data caches, so it owns their purge too. The 2 inflight Maps
// self-clean when their Promise settles, so they are NOT swept here.
const _antigravityCacheCleanupTimer = setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of _antigravitySubCache){
        if (now - entry.fetchedAt > ANTIGRAVITY_CACHE_TTL_MS) _antigravitySubCache.delete(key);
    }
    for (const [key, entry] of _antigravityAvailableModelsCache){
        if (now - entry.fetchedAt > ANTIGRAVITY_MODELS_CACHE_TTL_MS) _antigravityAvailableModelsCache.delete(key);
    }
    for (const [key, entry] of _antigravityUserQuotaCache){
        if (now - entry.fetchedAt > ANTIGRAVITY_MODELS_CACHE_TTL_MS) _antigravityUserQuotaCache.delete(key);
    }
    for (const [key, entry] of _antigravityCreditProbeCache){
        if (now - entry.fetchedAt > ANTIGRAVITY_CREDIT_PROBE_TTL_MS) _antigravityCreditProbeCache.delete(key);
    }
}, 5 * 60 * 1000); // every 5 minutes
_antigravityCacheCleanupTimer.unref?.(); // Don't prevent process exit
const ANTIGRAVITY_LOCAL_USAGE_WINDOW_MS = 5 * 60 * 60 * 1000;
const ANTIGRAVITY_LOCAL_USAGE_TOKENS_PER_UNIT = 1000;
// `toClientAntigravityQuotaModelId` was an inline if-ladder here; it is now the single
// source of truth in open-sse/config/antigravityModelAliases.ts (imported above), shared
// with the provider-limits cache sanitizer. (#3821-review LEDGER-5)
function getAntigravityLocalUsageUnits(provider, connectionId, modelId, resetAt) {
    if (!connectionId || !modelId || !resetAt) return 0;
    const resetMs = Date.parse(resetAt);
    if (!Number.isFinite(resetMs)) return 0;
    const windowStart = new Date(resetMs - ANTIGRAVITY_LOCAL_USAGE_WINDOW_MS).toISOString();
    const windowEnd = new Date(resetMs).toISOString();
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare(`SELECT COALESCE(SUM(
           COALESCE(tokens_input, 0) + COALESCE(tokens_output, 0) + COALESCE(tokens_reasoning, 0)
         ), 0) AS tokens
         FROM usage_history
         WHERE provider = ?
           AND connection_id = ?
           AND model = ?
           AND success = 1
           AND timestamp >= ?
           AND timestamp < ?`).get(provider, connectionId, modelId, windowStart, windowEnd);
        const tokens = Number(row?.tokens || 0);
        if (!Number.isFinite(tokens) || tokens <= 0) return 0;
        return Math.max(1, Math.ceil(tokens / ANTIGRAVITY_LOCAL_USAGE_TOKENS_PER_UNIT));
    } catch  {
        return 0;
    }
}
function applyLocalUsageFallback(quota, provider, connectionId, modelId) {
    if (quota.quotaSource !== "fetchAvailableModels" || quota.used > 0 || quota.unlimited) {
        return quota;
    }
    const localUsed = getAntigravityLocalUsageUnits(provider, connectionId, modelId, quota.resetAt);
    if (localUsed <= 0 || quota.total <= 0) return quota;
    const used = Math.min(quota.total, localUsed);
    return {
        ...quota,
        used,
        remainingPercentage: Math.max(0, (quota.total - used) / quota.total * 100),
        quotaSource: "localUsageHistory"
    };
}
function buildAntigravityUsageCacheKey(accessToken, projectId, clientProfile) {
    return `${accessToken.substring(0, 16)}:${projectId || "default"}:${clientProfile}`;
}
async function fetchAntigravityAvailableModelsCached(accessToken, projectId, clientProfile = "ide", options = {}) {
    if (!accessToken) throw new Error("Access token is required");
    const cacheKey = buildAntigravityUsageCacheKey(accessToken, projectId, clientProfile);
    const cached = _antigravityAvailableModelsCache.get(cacheKey);
    if (!options.forceRefresh && cached && Date.now() - cached.fetchedAt < ANTIGRAVITY_MODELS_CACHE_TTL_MS) {
        return cached.data;
    }
    const inflight = _antigravityAvailableModelsInflight.get(cacheKey);
    if (inflight) return inflight;
    const promise = (async ()=>{
        let response = null;
        let lastError = null;
        for (const quotaApiUrl of ANTIGRAVITY_CONFIG.quotaApiUrls){
            try {
                response = await fetch(quotaApiUrl, {
                    method: "POST",
                    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken),
                    body: JSON.stringify(projectId ? {
                        project: projectId
                    } : {}),
                    signal: AbortSignal.timeout(10000)
                });
                if (response.ok || response.status === 401 || response.status === 403) {
                    break;
                }
            } catch (error) {
                lastError = error;
            }
        }
        if (!response) {
            throw lastError || new Error("Antigravity API unavailable");
        }
        if (response.status === 403) {
            return {
                __antigravityForbidden: true
            };
        }
        if (!response.ok) {
            throw new Error(`Antigravity API error: ${response.status}`);
        }
        const data = await response.json();
        _antigravityAvailableModelsCache.set(cacheKey, {
            data,
            fetchedAt: Date.now()
        });
        return data;
    })().finally(()=>{
        _antigravityAvailableModelsInflight.delete(cacheKey);
    });
    _antigravityAvailableModelsInflight.set(cacheKey, promise);
    return promise;
}
async function fetchAntigravityUserQuotaCached(accessToken, projectId, clientProfile = "ide", options = {}) {
    if (!accessToken || !projectId) return null;
    const cacheKey = buildAntigravityUsageCacheKey(accessToken, projectId, clientProfile);
    const cached = _antigravityUserQuotaCache.get(cacheKey);
    if (!options.forceRefresh && cached && Date.now() - cached.fetchedAt < ANTIGRAVITY_MODELS_CACHE_TTL_MS) {
        return cached.data;
    }
    const inflight = _antigravityUserQuotaInflight.get(cacheKey);
    if (inflight) return inflight;
    const promise = (async ()=>{
        try {
            const response = await fetch("https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota", {
                method: "POST",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(clientProfile, accessToken),
                body: JSON.stringify({
                    project: projectId
                }),
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) return null;
            const data = await response.json();
            _antigravityUserQuotaCache.set(cacheKey, {
                data,
                fetchedAt: Date.now()
            });
            return data;
        } catch  {
            return null;
        }
    })().finally(()=>{
        _antigravityUserQuotaInflight.delete(cacheKey);
    });
    _antigravityUserQuotaInflight.set(cacheKey, promise);
    return promise;
}
function extractCodeAssistTierId(subscription) {
    const tierId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCodeAssistOnboardTierId"])(subscription);
    if (tierId === "legacy-tier") return "";
    const upper = tierId.toUpperCase();
    return mapCodeAssistTierIdToLabel(upper) ? upper : "";
}
function mapCodeAssistTierIdToLabel(tierId) {
    const upper = tierId.toUpperCase();
    if (upper.includes("ULTRA")) return "Ultra";
    if (upper.includes("PRO") || upper.includes("PREMIUM") || upper.includes("GOOGLE_ONE") || upper.includes("ONE_AI")) return "Pro";
    if (upper.includes("ENTERPRISE")) return "Enterprise";
    if (upper.includes("BUSINESS") || upper.includes("STANDARD")) return "Business";
    if (upper.includes("PLUS")) return "Plus";
    if (upper.includes("LITE") || upper.includes("LIGHT")) return "Lite";
    if (upper.includes("FREE") || upper.includes("INDIVIDUAL") || upper.includes("LEGACY")) return "Free";
    return null;
}
function mapSubscriptionTierStringToPlanLabel(tierText) {
    const upper = tierText.toUpperCase();
    if (upper.includes("ULTRA")) return "Ultra";
    if (upper.includes("PRO") || upper.includes("PREMIUM") || upper.includes("GOOGLE ONE")) return "Pro";
    if (upper.includes("ENTERPRISE")) return "Enterprise";
    if (upper.includes("STANDARD") || upper.includes("BUSINESS")) return "Business";
    if (upper.includes("PLUS")) return "Plus";
    if (upper.includes("LITE")) return "Lite";
    if (upper.includes("INDIVIDUAL") || upper.includes("FREE")) return "Free";
    // Strip a trailing "(RESTRICTED)" marker. Match the fixed literal anywhere then
    // trim, instead of /\s*\(RESTRICTED\)\s*$/ whose overlapping \s* runs backtrack
    // polynomially on whitespace-heavy upstream input (js/polynomial-redos).
    const normalizedId = upper.replace(/\(RESTRICTED\)/i, "").trim();
    if (normalizedId) {
        const mapped = mapCodeAssistTierIdToLabel(normalizedId);
        if (mapped) return mapped;
    }
    return null;
}
function mapCodeAssistSubscriptionToPlanLabel(subscriptionInfo) {
    const subscription = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(subscriptionInfo);
    if (Object.keys(subscription).length === 0) return "Free";
    const subscriptionTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCodeAssistSubscriptionTier"])(subscriptionInfo);
    if (subscriptionTier) {
        const mapped = mapSubscriptionTierStringToPlanLabel(subscriptionTier);
        if (mapped) return mapped;
        if (subscriptionTier.toLowerCase() !== "free") {
            return subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1).toLowerCase();
        }
    }
    const currentTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(subscription.currentTier);
    const tierName = String((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(currentTier, "name", "displayName") || subscription.subscriptionType || subscription.tier || "");
    const mappedName = tierName ? mapSubscriptionTierStringToPlanLabel(tierName) : null;
    if (mappedName) return mappedName;
    const tierId = extractCodeAssistTierId(subscription);
    if (tierId) {
        const mapped = mapCodeAssistTierIdToLabel(tierId);
        if (mapped) return mapped;
    }
    if (currentTier.upgradeSubscriptionType) return "Free";
    if (tierName) return tierName.charAt(0).toUpperCase() + tierName.slice(1).toLowerCase();
    return "Free";
}
const KNOWN_ANTIGRAVITY_PLAN_LABELS = new Set([
    "Ultra",
    "Pro",
    "Enterprise",
    "Business",
    "Plus",
    "Lite"
]);
function getAntigravityPlanLabel(subscriptionInfo, fallbackInfo) {
    const livePlan = mapCodeAssistSubscriptionToPlanLabel(subscriptionInfo);
    const fallbackPlan = mapCodeAssistSubscriptionToPlanLabel(fallbackInfo);
    if (KNOWN_ANTIGRAVITY_PLAN_LABELS.has(livePlan)) return livePlan;
    if (KNOWN_ANTIGRAVITY_PLAN_LABELS.has(fallbackPlan)) return fallbackPlan;
    if (livePlan !== "Free") return livePlan;
    return fallbackPlan !== "Free" ? fallbackPlan : livePlan;
}
/**
 * Proactive credit balance probe for Antigravity.
 *
 * Fires a minimal streamGenerateContent request with GOOGLE_ONE_AI credits enabled
 * and maxOutputTokens=1 to extract the `remainingCredits` field from the SSE stream.
 * This uses ~1 credit but lets us show the balance on the dashboard without waiting
 * for a real user request.
 *
 * Returns the credit balance, or null if the probe failed.
 */ async function probeAntigravityCreditBalance(accessToken, accountId, projectId, options = {}, providerSpecificData = {}) {
    if (!accessToken) return null;
    const clientProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])({
        providerSpecificData
    });
    const cacheKey = buildAntigravityUsageCacheKey(accessToken, projectId || accountId, clientProfile);
    const cached = _antigravityCreditProbeCache.get(cacheKey);
    if (!options.forceRefresh && cached && Date.now() - cached.fetchedAt < ANTIGRAVITY_CREDIT_PROBE_TTL_MS) {
        return cached.data;
    }
    const inflight = _antigravityCreditProbeInflight.get(cacheKey);
    if (inflight) return inflight;
    const promise = probeAntigravityCreditBalanceUncached(accessToken, accountId, projectId, providerSpecificData).then((data)=>{
        _antigravityCreditProbeCache.set(cacheKey, {
            data,
            fetchedAt: Date.now()
        });
        return data;
    }, (error)=>{
        _antigravityCreditProbeCache.set(cacheKey, {
            data: null,
            fetchedAt: Date.now()
        });
        throw error;
    }).finally(()=>{
        _antigravityCreditProbeInflight.delete(cacheKey);
    });
    _antigravityCreditProbeInflight.set(cacheKey, promise);
    return promise;
}
async function probeAntigravityCreditBalanceUncached(accessToken, accountId, projectId, providerSpecificData = {}) {
    try {
        if (!projectId) return null;
        // Try all base URLs (some accounts only work with specific endpoints)
        for (const baseUrl of __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityUpstream$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_RUNTIME_BASE_URLS"]){
            const url = `${baseUrl}/v1internal:streamGenerateContent?alt=sse`;
            const sessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravitySessionId"])({
                connectionId: accountId,
                projectId
            });
            const body = {
                project: projectId,
                model: "gemini-2-flash",
                userAgent: "antigravity",
                requestType: "agent",
                requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateAntigravityRequestId"])(),
                enabledCreditTypes: [
                    "GOOGLE_ONE_AI"
                ],
                request: {
                    model: "gemini-2-flash",
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: "hi"
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 1
                    },
                    sessionId
                }
            };
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                Accept: "text/event-stream"
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyAntigravityClientProfileHeaders"])(headers, {
                connectionId: accountId,
                projectId,
                providerSpecificData
            }, body);
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(10_000)
                });
                if (!res.ok) continue;
                // Read the full SSE response and scan for remainingCredits
                const rawSSE = await res.text();
                const lines = rawSSE.split("\n");
                for (const line of lines){
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const payload = trimmed.slice(5).trim();
                    if (payload === "[DONE]") break;
                    try {
                        const parsed = JSON.parse(payload);
                        if (Array.isArray(parsed?.remainingCredits)) {
                            const googleCredit = parsed.remainingCredits.find((c)=>c?.creditType === "GOOGLE_ONE_AI");
                            if (googleCredit) {
                                const balance = parseInt(googleCredit.creditAmount, 10);
                                if (!isNaN(balance)) {
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateAntigravityRemainingCredits"])(accountId, balance);
                                    return balance;
                                }
                            }
                        }
                    } catch  {
                    // Skip malformed SSE lines
                    }
                }
            } catch  {
            // Individual endpoint failure; try next
            }
        }
        return null;
    } catch  {
        // Probe is best-effort — don't let it break the usage fetch
        return null;
    }
}
async function getAntigravityUsage(provider, accessToken, providerSpecificData, connectionProjectId, connectionId, options = {}) {
    if (!accessToken) {
        return {
            plan: "Free",
            message: "Antigravity access token not available."
        };
    }
    let subscriptionInfo = null;
    try {
        const clientProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])({
            providerSpecificData
        });
        subscriptionInfo = await getAntigravitySubscriptionInfoCached(accessToken, providerSpecificData, options);
        const savedProjectId = typeof providerSpecificData?.projectId === "string" && providerSpecificData.projectId.trim() ? providerSpecificData.projectId.trim() : null;
        const subscriptionProject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(subscriptionInfo).cloudaicompanionProject;
        const projectId = savedProjectId || connectionProjectId || (typeof subscriptionProject === "string" ? subscriptionProject : typeof (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(subscriptionProject).id === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(subscriptionProject).id : null);
        // Derive accountId for credit balance cache.
        // Must match executor key: credentials.connectionId
        const accountId = connectionId || "unknown";
        // Read cached credit balance (hydrated from DB on first access)
        let creditBalance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityRemainingCredits"])(accountId);
        // Only an explicit refresh in always mode may proactively spend credits to discover
        // the balance. Automatic/scheduled refreshes must use the cached balance (if any)
        // rather than adding credit-bearing inference calls after normal user requests.
        const creditsMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityCredits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCreditsMode"])();
        if (options.forceRefresh === true && creditsMode === "always") {
            creditBalance = await probeAntigravityCreditBalance(accessToken, accountId, projectId, options, providerSpecificData || {});
        }
        const [data, userQuotaData, weeklyQuotas] = await Promise.all([
            fetchAntigravityAvailableModelsCached(accessToken, projectId, clientProfile, options),
            fetchAntigravityUserQuotaCached(accessToken, projectId, clientProfile, options),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$antigravityWeeklyQuota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAndParseAntigravityWeeklyQuotas"])(accessToken, projectId, clientProfile, options)
        ]);
        const dataObj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data);
        if (dataObj.__antigravityForbidden === true) {
            return {
                message: "Antigravity access forbidden. Check subscription."
            };
        }
        const modelEntries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.models);
        const userQuotaEntries = new Map();
        const userQuotaObj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(userQuotaData);
        if (Array.isArray(userQuotaObj.buckets)) {
            for (const bucketValue of userQuotaObj.buckets){
                const bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(bucketValue);
                const modelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toClientAntigravityQuotaModelId"])(String(bucket.modelId || "").trim());
                if (!modelId) continue;
                userQuotaEntries.set(modelId, bucket);
            }
        }
        const quotas = {};
        // Parse per-model quota info from fetchAvailableModels response.
        for (const [rawModelKey, infoValue] of Object.entries(modelEntries)){
            const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(infoValue);
            const quotaInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(info.quotaInfo);
            const modelKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toClientAntigravityQuotaModelId"])(rawModelKey);
            // Skip internal, excluded, and models without quota info
            if (!modelKey || info.isInternal === true || !(provider === "agy" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUserCallableAgyModelId"])(modelKey) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUserCallableAntigravityModelId"])(modelKey)) || Object.keys(quotaInfo).length === 0) {
                continue;
            }
            const liveQuota = userQuotaEntries.get(modelKey);
            const quotaSource = liveQuota || quotaInfo;
            const rawFraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(quotaSource.remainingFraction, -1);
            const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(quotaSource.resetTime);
            // Distinguish "upstream did not report remainingFraction" from "remaining is 0%".
            // fetchAvailableModels is a catalog view and can be stale/full; retrieveUserQuota is
            // the source of truth for actual Gemini consumption when it includes the model.
            const fractionReported = rawFraction >= 0;
            if (!fractionReported) {
                console.warn(`[Antigravity] model ${modelKey} returned no remainingFraction — quota unknown`);
            }
            const remainingFraction = fractionReported ? Math.max(0, Math.min(1, rawFraction)) : 0;
            // Models with no resetTime AND a reported full fraction are unlimited
            // (e.g. tab-completion models). Unreported fraction is NEVER unlimited.
            const isUnlimited = fractionReported && !resetAt && remainingFraction >= 1;
            const remainingPercentage = remainingFraction * 100;
            const QUOTA_NORMALIZED_BASE = 1000;
            const total = QUOTA_NORMALIZED_BASE;
            const remaining = Math.round(total * remainingFraction);
            const used = isUnlimited ? 0 : Math.max(0, total - remaining);
            quotas[modelKey] = applyLocalUsageFallback({
                used,
                total: isUnlimited ? 0 : total,
                resetAt,
                remainingPercentage: isUnlimited ? 100 : remainingPercentage,
                unlimited: isUnlimited,
                fractionReported,
                quotaSource: liveQuota ? "retrieveUserQuota" : "fetchAvailableModels"
            }, provider, connectionId, modelKey);
        }
        // Include retrieveUserQuota buckets not listed in the static/public Antigravity catalog yet.
        // This keeps Provider Limits honest when Google adds a new Gemini tier before our catalog is
        // updated. Hidden/internal catalog entries above are still filtered by the public pass.
        for (const [modelKey, bucket] of userQuotaEntries){
            if (quotas[modelKey] || !(provider === "agy" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUserCallableAgyModelId"])(modelKey) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isUserCallableAntigravityModelId"])(modelKey))) {
                continue;
            }
            const rawFraction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(bucket.remainingFraction, -1);
            if (rawFraction < 0) continue;
            const remainingFraction = Math.max(0, Math.min(1, rawFraction));
            const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(bucket.resetTime);
            const isUnlimited = !resetAt && remainingFraction >= 1;
            const QUOTA_NORMALIZED_BASE = 1000;
            const total = QUOTA_NORMALIZED_BASE;
            const remaining = Math.round(total * remainingFraction);
            quotas[modelKey] = {
                used: isUnlimited ? 0 : Math.max(0, total - remaining),
                total: isUnlimited ? 0 : total,
                resetAt,
                remainingPercentage: isUnlimited ? 100 : remainingFraction * 100,
                unlimited: isUnlimited,
                fractionReported: true,
                quotaSource: "retrieveUserQuota"
            };
        }
        return {
            plan: getAntigravityPlanLabel(subscriptionInfo, providerSpecificData),
            quotas: {
                ...quotas,
                ...weeklyQuotas,
                ...creditBalance !== null && {
                    credits: {
                        used: 0,
                        total: 0,
                        remaining: creditBalance,
                        unlimited: false,
                        resetAt: null
                    }
                }
            },
            subscriptionInfo
        };
    } catch (error) {
        return {
            plan: getAntigravityPlanLabel(subscriptionInfo, providerSpecificData),
            subscriptionInfo,
            message: `Antigravity error: ${error.message}`
        };
    }
}
/**
 * Get Antigravity subscription info (cached, 5 min TTL)
 * Prevents duplicate loadCodeAssist calls within the same quota cycle.
 */ async function getAntigravitySubscriptionInfoCached(accessToken, providerSpecificData, options = {}) {
    const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])({
        providerSpecificData
    });
    const cacheKey = `${accessToken.substring(0, 16)}:${profile}`;
    if (options.forceRefresh) {
        _antigravitySubCache.delete(cacheKey);
    } else {
        const cached = _antigravitySubCache.get(cacheKey);
        if (cached && Date.now() - cached.fetchedAt < ANTIGRAVITY_CACHE_TTL_MS) {
            return cached.data;
        }
    }
    const data = await getAntigravitySubscriptionInfo(accessToken, providerSpecificData);
    if (data != null) {
        _antigravitySubCache.set(cacheKey, {
            data,
            fetchedAt: Date.now()
        });
    }
    return data;
}
/**
 * Get Antigravity subscription info using correct Antigravity headers.
 * Must match the headers used in providers.js postExchange (not CLI headers).
 */ async function getAntigravitySubscriptionInfo(accessToken, providerSpecificData) {
    try {
        const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAntigravityClientProfile"])({
            providerSpecificData
        });
        const response = await fetch(ANTIGRAVITY_CONFIG.loadProjectApiUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityContentHeaders"])(profile, accessToken),
            body: JSON.stringify({
                metadata: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityLoadCodeAssistMetadata"])()
            })
        });
        if (!response.ok) return null;
        return await response.json();
    } catch  {
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage/cursor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCursorUsage",
    ()=>getCursorUsage
]);
/**
 * usage/cursor.ts — Cursor (Pro) usage fetcher + JWT/config helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Cursor family — the
 * dashboard usage-API config, the WorkOS JWT `sub` decoder, and the getCursorUsage fetcher
 * that probes the cursor.com/dashboard/spending endpoint. Depends only on the sibling
 * scalar/quota leaves — no host coupling — so it lives as a co-located provider leaf.
 * usage.ts imports getCursorUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
// Cursor dashboard usage API config
// The endpoint that powers https://cursor.com/dashboard/spending. Validates the WorkOS
// session via the WorkosCursorSessionToken cookie (format: `${userId}::${jwt}`) and
// rejects requests without a matching Origin/Referer (Invalid origin for state-changing request).
const CURSOR_USAGE_CONFIG = {
    usageUrl: "https://cursor.com/api/dashboard/get-current-period-usage",
    origin: "https://cursor.com",
    referer: "https://cursor.com/dashboard/spending",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
};
/**
 * Decode the `sub` claim of a Cursor JWT (the WorkOS user id).
 * Returns null if the token is not a parseable JWT.
 */ function decodeCursorJwtSub(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while(payload.length % 4 !== 0)payload += "=";
        const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
        const sub = decoded?.sub;
        return typeof sub === "string" && sub.length > 0 ? sub : null;
    } catch  {
        return null;
    }
}
async function getCursorUsage(accessToken, providerSpecificData) {
    if (!accessToken) {
        return {
            message: "Cursor access token missing. Re-import the connection from Cursor IDE."
        };
    }
    const storedUserId = (()=>{
        const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(providerSpecificData).userId;
        return typeof raw === "string" && raw.length > 0 ? raw : null;
    })();
    const userId = storedUserId || decodeCursorJwtSub(accessToken);
    if (!userId) {
        return {
            message: "Cursor token missing user id. Re-import the connection from Cursor IDE."
        };
    }
    try {
        const response = await fetch(CURSOR_USAGE_CONFIG.usageUrl, {
            method: "POST",
            redirect: "manual",
            headers: {
                Cookie: `WorkosCursorSessionToken=${userId}::${accessToken}`,
                Origin: CURSOR_USAGE_CONFIG.origin,
                Referer: CURSOR_USAGE_CONFIG.referer,
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": CURSOR_USAGE_CONFIG.userAgent
            },
            body: "{}"
        });
        // 3xx redirect to WorkOS authkit means the session cookie was rejected.
        if (response.status >= 300 && response.status < 400) {
            return {
                plan: "Cursor",
                message: "Cursor session expired. Re-import the token from Cursor IDE."
            };
        }
        if (!response.ok) {
            const errorText = (await response.text()).slice(0, 200);
            if (response.status === 401 || response.status === 403) {
                return {
                    plan: "Cursor",
                    message: "Cursor session unauthorized. Re-import the token from Cursor IDE."
                };
            }
            return {
                plan: "Cursor",
                message: `Cursor usage endpoint error (${response.status}): ${errorText}`
            };
        }
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await response.json());
        const planUsage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.planUsage);
        if (Object.keys(planUsage).length === 0) {
            return {
                plan: "Cursor",
                message: "Cursor connected. No active plan usage returned."
            };
        }
        const limitCents = Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(planUsage.limit, 0));
        const totalSpendCents = Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(planUsage.totalSpend, 0));
        const autoPercentUsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(planUsage.autoPercentUsed, 0));
        const apiPercentUsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(planUsage.apiPercentUsed, 0));
        const totalPercentUsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(planUsage.totalPercentUsed, 0));
        // billingCycleEnd is a numeric-string in ms; coerce so parseResetTime sees a number.
        const billingCycleEndMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(data.billingCycleEnd, 0);
        const resetAt = billingCycleEndMs > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(billingCycleEndMs) : null;
        // Convert cents → dollars rounded to 2 decimal places.
        const toDollars = (cents)=>Math.round(cents) / 100;
        const limitDollars = toDollars(limitCents);
        const buildWindow = (percentUsed, usedCentsOverride)=>{
            const usedCents = typeof usedCentsOverride === "number" ? usedCentsOverride : Math.round(limitCents * percentUsed / 100);
            const used = toDollars(Math.min(usedCents, limitCents));
            const remaining = toDollars(Math.max(limitCents - Math.min(usedCents, limitCents), 0));
            return {
                used,
                total: limitDollars,
                remaining,
                remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(100 - percentUsed),
                resetAt,
                unlimited: false
            };
        };
        const quotas = {
            Total: buildWindow(totalPercentUsed, totalSpendCents),
            "Auto + Composer": buildWindow(autoPercentUsed),
            API: buildWindow(apiPercentUsed)
        };
        return {
            plan: "Cursor Pro",
            quotas
        };
    } catch (error) {
        return {
            plan: "Cursor",
            message: `Cursor connected. Unable to fetch usage: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/kimi.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKimiUsage",
    ()=>getKimiUsage
]);
/**
 * usage/kimi.ts — Kimi Coding (kimi-coding / kimi-coding-apikey) usage fetcher + helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Kimi family — the coding
 * API config, membership-level → display-name mapping, and the getKimiUsage fetcher that
 * probes the official /v1/usages endpoint. Depends only on the sibling scalar/quota leaves
 * plus safePercentage — no host coupling — so it lives as a co-located provider leaf.
 * usage.ts imports getKimiUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kimi/coding/runtime.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
;
;
// Kimi Coding API config
const KIMI_CONFIG = {
    baseUrl: "https://api.kimi.com/coding/v1",
    usageUrl: "https://api.kimi.com/coding/v1/usages",
    apiVersion: "2023-06-01"
};
/**
 * Map Kimi membership level to display name
 * LEVEL_BASIC = Moderato, LEVEL_INTERMEDIATE = Allegretto,
 * LEVEL_ADVANCED = Allegro, LEVEL_STANDARD = Vivace
 */ function getKimiPlanName(level) {
    if (!level) return "";
    const normalizedLevel = String(level);
    const levelMap = {
        LEVEL_BASIC: "Moderato",
        LEVEL_INTERMEDIATE: "Allegretto",
        LEVEL_ADVANCED: "Allegro",
        LEVEL_STANDARD: "Vivace"
    };
    return levelMap[normalizedLevel] || normalizedLevel.replace("LEVEL_", "").toLowerCase();
}
async function getKimiUsage(accessToken, apiKey, providerSpecificData = {}) {
    // API key auth takes precedence — Kimi's /usages endpoint accepts the same
    // API key used for /messages (verified live: responds with
    // authentication.method = METHOD_API_KEY). OAuth flow falls through to the
    // Bearer + device-headers shape used by Kimi Coding OAuth.
    const useApiKey = typeof apiKey === "string" && apiKey.length > 0;
    const authHeaders = useApiKey ? {
        "x-api-key": apiKey
    } : {
        Authorization: `Bearer ${accessToken}`,
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildKimiCodeIdentityHeaders"])(providerSpecificData),
        "User-Agent": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kimi$2f$coding$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKimiCodeCliUserAgent"])()
    };
    try {
        const response = await fetch(KIMI_CONFIG.usageUrl, {
            method: "GET",
            headers: {
                ...authHeaders,
                "Content-Type": "application/json"
            }
        });
        const responseText = await response.text();
        if (!response.ok) {
            return {
                plan: "Kimi Coding",
                message: `Kimi Coding connected. API Error ${response.status}: ${responseText.slice(0, 100)}`
            };
        }
        let data;
        try {
            data = JSON.parse(responseText);
        } catch  {
            return {
                plan: "Kimi Coding",
                message: "Kimi Coding connected. Invalid JSON response from API."
            };
        }
        const quotas = {};
        const dataObj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data);
        // Parse Kimi usage response format
        // Format: { user: {...}, usage: { limit: "100", used: "92", remaining: "8", resetTime: "..." }, limits: [...] }
        const usageObj = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.usage);
        // Check for Kimi's actual usage fields (strings, not numbers)
        const usageLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(usageObj.limit || usageObj.Limit, 0);
        const usageUsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(usageObj.used || usageObj.Used, 0);
        const usageRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(usageObj.remaining || usageObj.Remaining, 0);
        const usageResetTime = usageObj.resetTime || usageObj.ResetTime || usageObj.reset_at || usageObj.resetAt;
        if (usageLimit > 0) {
            const percentRemaining = usageLimit > 0 ? usageRemaining / usageLimit * 100 : 0;
            quotas["Weekly"] = {
                used: usageUsed,
                total: usageLimit,
                remaining: usageRemaining,
                remainingPercentage: percentRemaining,
                resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(usageResetTime),
                unlimited: false
            };
        }
        // Also parse limits array for rate limits
        const limitsArray = Array.isArray(dataObj.limits) ? dataObj.limits : [];
        for(let i = 0; i < limitsArray.length; i++){
            const limitItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(limitsArray[i]);
            const window = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(limitItem.window);
            const detail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(limitItem.detail);
            const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(detail.limit || detail.Limit, 0);
            const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(detail.remaining || detail.Remaining, 0);
            const resetTime = detail.resetTime || detail.reset_at || detail.resetAt;
            if (limit > 0) {
                quotas["Ratelimit"] = {
                    used: limit - remaining,
                    total: limit,
                    remaining,
                    remainingPercentage: limit > 0 ? remaining / limit * 100 : 0,
                    resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(resetTime),
                    unlimited: false
                };
            }
        }
        // Check for quota windows (Claude-like format with utilization) as fallback
        const hasUtilization = (window)=>window && typeof window === "object" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safePercentage"])(window.utilization) !== undefined;
        const createQuotaObject = (window)=>{
            const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safePercentage"])(window.utilization);
            const used = 100 - remaining;
            return {
                used,
                total: 100,
                remaining,
                resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(window.resets_at),
                remainingPercentage: remaining,
                unlimited: false
            };
        };
        if (hasUtilization((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.five_hour))) {
            quotas["session (5h)"] = createQuotaObject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.five_hour));
        }
        if (hasUtilization((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.seven_day))) {
            quotas["weekly (7d)"] = createQuotaObject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.seven_day));
        }
        // Check for model-specific quotas
        for (const [key, value] of Object.entries(dataObj)){
            const valueRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(value);
            if (key.startsWith("seven_day_") && key !== "seven_day" && hasUtilization(valueRecord)) {
                const modelName = key.replace("seven_day_", "");
                quotas[`weekly ${modelName} (7d)`] = createQuotaObject(valueRecord);
            }
        }
        if (Object.keys(quotas).length > 0) {
            const userRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.user);
            const membershipLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(userRecord.membership).level;
            const planName = getKimiPlanName(membershipLevel);
            return {
                plan: planName || "Kimi Coding",
                quotas
            };
        }
        // No quota data in response
        const userRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataObj.user);
        const membershipLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(userRecord.membership).level;
        const planName = getKimiPlanName(membershipLevel);
        return {
            plan: planName || "Kimi Coding",
            message: "Kimi Coding connected. Usage tracked per request."
        };
    } catch (error) {
        return {
            message: `Kimi Coding connected. Unable to fetch usage: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/codex.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCodexUsage",
    ()=>getCodexUsage
]);
/**
 * usage/codex.ts — Codex (OpenAI / ChatGPT backend) usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Codex family — the ChatGPT
 * backend usage-API config and the getCodexUsage fetcher that reads the persisted workspace
 * binding and shapes quotas via buildCodexUsageQuotas. Depends only on the scalar leaf +
 * codexUsageQuotas — no host coupling — so it lives as a co-located provider leaf. usage.ts
 * imports getCodexUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexUsageQuotas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codexUsageQuotas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
;
;
// Codex (OpenAI) API config
const CODEX_CONFIG = {
    usageUrl: "https://chatgpt.com/backend-api/wham/usage"
};
async function getCodexUsage(accessToken, providerSpecificData = {}) {
    try {
        // Use persisted workspace ID from OAuth - NO FALLBACK
        const accountId = typeof providerSpecificData.workspaceId === "string" ? providerSpecificData.workspaceId : null;
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json"
        };
        if (accountId) {
            headers["chatgpt-account-id"] = accountId;
        }
        const response = await fetch(CODEX_CONFIG.usageUrl, {
            method: "GET",
            headers
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return {
                    message: `Codex token expired or access denied. Please re-authenticate the connection.`
                };
            }
            throw new Error(`Codex API error: ${response.status}`);
        }
        const data = await response.json();
        const { rateLimit, quotas, bankedResetCredits, rateLimitReachedType } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexUsageQuotas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCodexUsageQuotas"])(data);
        return {
            plan: String((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(data, "plan_type", "planType") || "unknown"),
            limitReached: Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(rateLimit, "limit_reached", "limitReached")),
            quotas,
            // Banked reset credits (display-only, eligibility-gated — issue #5199).
            // Absent for most accounts; never throws when the upstream omits it.
            ...bankedResetCredits !== undefined ? {
                bankedResetCredits
            } : {},
            ...rateLimitReachedType !== undefined ? {
                rateLimitReachedType
            } : {}
        };
    } catch (error) {
        return {
            message: `Failed to fetch Codex usage: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/claude.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getClaudePlanLabel",
    ()=>getClaudePlanLabel,
    "getClaudeUsage",
    ()=>getClaudeUsage
]);
/**
 * usage/claude.ts — Claude (Anthropic OAuth + legacy org) usage fetcher + plan-label helper.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Claude family — the API
 * config, the plan-label picker, the OAuth usage fetcher (getClaudeUsage) with its legacy
 * settings/org fallback (getClaudeUsageLegacy). Depends only on the sibling scalar/quota
 * leaves + Claude identity/cooldown helpers + safePercentage — no host coupling — so it
 * lives as a co-located provider leaf. usage.ts imports getClaudeUsage (dispatcher) +
 * getClaudePlanLabel (__testing). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/claudeIdentity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeUsageCooldown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeUsageCooldown.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
;
;
;
// Claude API config
const CLAUDE_CONFIG = {
    oauthUsageUrl: "https://api.anthropic.com/api/oauth/usage",
    usageUrl: "https://api.anthropic.com/v1/organizations/{org_id}/usage",
    settingsUrl: "https://api.anthropic.com/v1/settings",
    apiVersion: "2023-06-01"
};
function getClaudePlanLabel(...candidates) {
    for (const candidate of candidates){
        if (typeof candidate !== "string") continue;
        const trimmed = candidate.trim();
        if (!trimmed || trimmed.toLowerCase() === "claude code" || trimmed.toLowerCase() === "unknown") {
            continue;
        }
        return trimmed;
    }
    return null;
}
async function getClaudeUsage(accessToken) {
    if (!accessToken) {
        return {
            message: "Claude connected. Access token not available.",
            bootstrap: null
        };
    }
    // Refresh bootstrap in parallel; best-effort, failure non-fatal.
    const bootstrapPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchClaudeBootstrap"])(accessToken).catch(()=>null);
    // Skip OAuth usage call while this token is cooling down from a recent 429
    // (chat with the same token still works — only the quota endpoint is throttled).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeUsageCooldown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isClaudeOauthUsageCoolingDown"])(accessToken)) {
        const legacy = await getClaudeUsageLegacy(accessToken);
        return {
            ...legacy,
            bootstrap: await bootstrapPromise
        };
    }
    try {
        // Real CLI uses axios here, not Stainless — UA is `claude-code/<version>`
        // (not `claude-cli/...`) and the shape is simpler than /v1/messages.
        const ctrl = new AbortController();
        const timer = setTimeout(()=>ctrl.abort(), 10_000);
        let oauthResponse;
        try {
            oauthResponse = await fetch(CLAUDE_CONFIG.oauthUsageUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Accept-Encoding": "gzip, compress, deflate, br",
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "User-Agent": `claude-code/${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_VERSION"]}`,
                    "anthropic-beta": "oauth-2025-04-20"
                },
                signal: ctrl.signal
            });
        } finally{
            clearTimeout(timer);
        }
        if (oauthResponse.ok) {
            const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await oauthResponse.json());
            const quotas = {};
            // utilization = percentage USED (e.g., 90 means 90% used, 10% remaining)
            // Confirmed via user report #299: Claude.ai shows 87% used = OmniRoute must show 13% remaining.
            const hasUtilization = (window)=>window && typeof window === "object" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safePercentage"])(window.utilization) !== undefined;
            const createQuotaObject = (window)=>{
                const used = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safePercentage"])(window.utilization); // utilization = % used
                const remaining = Math.max(0, 100 - used);
                return {
                    used,
                    total: 100,
                    remaining,
                    resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(window.resets_at),
                    remainingPercentage: remaining,
                    unlimited: false
                };
            };
            const fiveHour = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.five_hour);
            if (hasUtilization(fiveHour)) {
                quotas["session (5h)"] = createQuotaObject(fiveHour);
            }
            const sevenDay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.seven_day);
            if (hasUtilization(sevenDay)) {
                quotas["weekly (7d)"] = createQuotaObject(sevenDay);
            }
            // Map Anthropic's internal codenames (e.g., omelette → Designer) for display.
            const MODEL_DISPLAY_NAMES = {
                omelette: "designer"
            };
            for (const [key, value] of Object.entries(data)){
                const valueRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(value);
                if (key.startsWith("seven_day_") && key !== "seven_day" && hasUtilization(valueRecord)) {
                    const codename = key.replace("seven_day_", "");
                    const modelName = MODEL_DISPLAY_NAMES[codename] || codename;
                    quotas[`weekly ${modelName} (7d)`] = createQuotaObject(valueRecord);
                }
            }
            const bootstrap = await bootstrapPromise;
            const plan = getClaudePlanLabel(typeof data.tier === "string" ? data.tier : null, typeof data.plan === "string" ? data.plan : null, typeof data.subscription_type === "string" ? data.subscription_type : null, bootstrap?.organization_rate_limit_tier) ?? undefined;
            return {
                ...plan ? {
                    plan
                } : {},
                quotas,
                extraUsage: data.extra_usage ?? null,
                bootstrap
            };
        }
        // Cool down OAuth usage polling after a 429 (quota endpoint only — chat is unaffected).
        if (oauthResponse.status === 429) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeUsageCooldown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markClaudeOauthUsage429"])(accessToken);
        }
        // Fallback: OAuth endpoint returned non-OK, try legacy settings/org endpoint
        console.warn(`[Claude Usage] OAuth endpoint returned ${oauthResponse.status}, falling back to legacy`);
        const legacy = await getClaudeUsageLegacy(accessToken);
        return {
            ...legacy,
            bootstrap: await bootstrapPromise
        };
    } catch (error) {
        return {
            message: `Claude connected. Unable to fetch usage: ${error.message}`,
            bootstrap: await bootstrapPromise
        };
    }
}
/**
 * Legacy Claude usage fetcher for API key / org admin users.
 * Uses /v1/settings + /v1/organizations/{org_id}/usage endpoints.
 */ async function getClaudeUsageLegacy(accessToken) {
    try {
        const settingsResponse = await fetch(CLAUDE_CONFIG.settingsUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "anthropic-version": CLAUDE_CONFIG.apiVersion
            }
        });
        if (settingsResponse.ok) {
            const settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await settingsResponse.json());
            const organizationId = typeof settings.organization_id === "string" ? settings.organization_id : "";
            if (organizationId) {
                const usageResponse = await fetch(CLAUDE_CONFIG.usageUrl.replace("{org_id}", organizationId), {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "anthropic-version": CLAUDE_CONFIG.apiVersion
                    }
                });
                if (usageResponse.ok) {
                    const usage = await usageResponse.json();
                    return {
                        plan: settings.plan || "Unknown",
                        organization: settings.organization_name,
                        quotas: usage
                    };
                }
            }
            return {
                plan: settings.plan || "Unknown",
                organization: settings.organization_name,
                message: "Claude connected. Usage details require admin access."
            };
        }
        return {
            message: "Claude connected. Usage API requires admin permissions."
        };
    } catch (error) {
        return {
            message: `Claude connected. Unable to fetch usage: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/kiro.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildKiroUsageResult",
    ()=>buildKiroUsageResult,
    "discoverKiroProfileArn",
    ()=>discoverKiroProfileArn,
    "getKiroUsage",
    ()=>getKiroUsage
]);
/**
 * usage/kiro.ts — Kiro / Amazon Q (AWS CodeWhisperer) usage fetcher + quota helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Kiro family — overage
 * detection, per-resource quota assembly (buildKiroQuota / buildKiroUsageResult), region-aware
 * profile-ARN discovery, the social-auth account marker, and the getKiroUsage fetcher that
 * calls GetUsageLimits on the region-matched CodeWhisperer endpoint. Depends only on the
 * sibling scalar/quota leaves — no host coupling — so it lives as a co-located provider leaf.
 * usage.ts imports getKiroUsage (dispatcher) + re-exports buildKiroUsageResult /
 * discoverKiroProfileArn (external kiro tests import them from services/usage) and pulls
 * getKiroUsage into __testing. Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroRegion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/kiroRegion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/kiroExternalIdp.ts [app-route] (ecmascript)");
;
;
;
;
const CODEWHISPERER_BASE_URL = process.env.OMNIROUTE_CODEWHISPERER_BASE_URL ?? "https://codewhisperer.us-east-1.amazonaws.com";
function isKiroOverageEnabled(data) {
    const overageConfiguration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.overageConfiguration);
    const overageStatus = String(overageConfiguration.overageStatus || "").trim().toUpperCase();
    return overageStatus === "ENABLED" || data.overageEnabled === true || overageConfiguration.overageEnabled === true;
}
function buildKiroQuota(used, total, resetAt, overageEnabled) {
    const remaining = total - used;
    if (!overageEnabled) {
        return {
            used,
            total,
            remaining,
            resetAt,
            unlimited: false
        };
    }
    return {
        used,
        total,
        remaining,
        remainingPercentage: 100,
        resetAt,
        unlimited: true
    };
}
function buildKiroUsageResult(data) {
    const usageList = Array.isArray(data.usageBreakdownList) ? data.usageBreakdownList : [];
    const quotaInfo = {};
    const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(data.nextDateReset || data.resetDate);
    const overageEnabled = isKiroOverageEnabled(data);
    usageList.forEach((breakdownValue)=>{
        const breakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(breakdownValue);
        const resourceType = typeof breakdown.resourceType === "string" ? breakdown.resourceType.toLowerCase() : "unknown";
        const used = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(breakdown.currentUsageWithPrecision, 0);
        const total = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(breakdown.usageLimitWithPrecision, 0);
        quotaInfo[resourceType] = buildKiroQuota(used, total, resetAt, overageEnabled);
        const freeTrialInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(breakdown.freeTrialInfo);
        if (Object.keys(freeTrialInfo).length > 0) {
            const freeUsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(freeTrialInfo.currentUsageWithPrecision, 0);
            const freeTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(freeTrialInfo.usageLimitWithPrecision, 0);
            quotaInfo[`${resourceType}_freetrial`] = buildKiroQuota(freeUsed, freeTotal, resetAt, overageEnabled);
        }
    });
    if (Object.keys(quotaInfo).length === 0) {
        return {
            message: "Kiro connected, but the account returned no usage breakdown. Some AWS IAM / Builder ID accounts don't expose per-resource quota via GetUsageLimits."
        };
    }
    return {
        plan: String((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.subscriptionInfo).subscriptionTitle || "").trim() || "Kiro",
        quotas: quotaInfo
    };
}
async function discoverKiroProfileArn(accessToken, usageBaseUrl, region, authMethod) {
    try {
        const isApiKey = authMethod === "api_key";
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-amz-json-1.0",
            "x-amz-target": "AmazonCodeWhispererService.ListAvailableProfiles",
            Accept: "application/json"
        };
        if (isApiKey) {
            headers.tokentype = "API_KEY";
        }
        const response = await fetch(usageBaseUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                maxResults: 10
            }),
            // Don't let a hung profile lookup block the usage/quota refresh indefinitely.
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) return undefined;
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await response.json());
        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        const normalizedRegion = region.toLowerCase();
        const matched = profiles.find((profile)=>{
            const arn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(profile).arn;
            return typeof arn === "string" && arn.toLowerCase().includes(`:${normalizedRegion}:`);
        }) || profiles[0];
        const arn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(matched).arn;
        return typeof arn === "string" && arn.length > 0 ? arn : undefined;
    } catch  {
        return undefined;
    }
}
/**
 * The three GetUsageLimits attempts (CodeWhisperer POST, regional GET, Q GET) tried in
 * order by getKiroUsage — extracted so the auth-method header variants (api_key
 * `tokentype`, external_idp `TokenType`) stay in one authHeaders object and the parent
 * function stays under the function-length gate.
 *
 * The POST variant (x-amz-json-1.0 + `x-amz-target: ...GetUsageLimits`) is tried FIRST: it
 * is the canonical AWS JSON-RPC shape used everywhere else in the Kiro integration
 * (discoverKiroProfileArn's ListAvailableProfiles call, kiroModels.ts fingerprinting) and,
 * critically, it is the only variant whose URL is built from the RUNTIME-region-resolved
 * `usageBaseUrl` (see resolveKiroRuntimeRegion in getKiroUsage) with the profileArn in the
 * payload — required for cross-region IAM Identity Center accounts (#6099) where the profile
 * lives in a different region than the IdC/token region. The two GET variants are
 * best-effort fallbacks (added for #6587 API-key auth) for accounts/regions where the POST
 * shape is rejected.
 */ function buildKiroUsageAttempts(opts) {
    const { authHeaders, usageParams, qParams, payload, usageBaseUrl, qBaseUrl } = opts;
    return [
        {
            name: "codewhisperer-post",
            run: ()=>fetch(usageBaseUrl, {
                    method: "POST",
                    headers: {
                        ...authHeaders,
                        "Content-Type": "application/x-amz-json-1.0",
                        "x-amz-target": "AmazonCodeWhispererService.GetUsageLimits"
                    },
                    body: JSON.stringify(payload)
                })
        },
        {
            name: "codewhisperer-get",
            run: ()=>fetch(`${CODEWHISPERER_BASE_URL}/getUsageLimits?${usageParams.toString()}`, {
                    method: "GET",
                    headers: {
                        ...authHeaders,
                        "x-amz-user-agent": "aws-sdk-js/1.0.0 KiroIDE",
                        "user-agent": "aws-sdk-js/1.0.0 KiroIDE"
                    }
                })
        },
        {
            name: "q-get",
            run: ()=>fetch(`${qBaseUrl}/getUsageLimits?${qParams.toString()}`, {
                    method: "GET",
                    headers: authHeaders
                })
        }
    ];
}
/**
 * Base auth headers for the usage endpoints, per auth method: long-lived API keys add
 * `tokentype: API_KEY`; enterprise / Microsoft Entra (external_idp) org accounts require
 * `TokenType: EXTERNAL_IDP` for CodeWhisperer to bind the bearer to the profile (without
 * it GetUsageLimits returns `ValidationException: Invalid ARN`).
 */ function buildKiroAuthHeaders(accessToken, isApiKey, providerSpecificData) {
    const authHeaders = {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
    };
    if (isApiKey) {
        authHeaders.tokentype = "API_KEY";
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isExternalIdpAuthMethod"])(providerSpecificData?.authMethod)) {
        authHeaders[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIRO_EXTERNAL_IDP_TOKEN_TYPE_HEADER"]] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIRO_EXTERNAL_IDP_TOKEN_TYPE_VALUE"];
    }
    return authHeaders;
}
/**
 * Runs the GetUsageLimits attempts in order until one succeeds. Collects per-attempt
 * errors and whether any endpoint rejected the token (401/403) so getKiroUsage can
 * pick the right user-facing message — extracted for the function-length gate.
 */ async function runKiroUsageAttempts(attempts) {
    let sawAuthError = false;
    let lastHttpFailure;
    const errors = [];
    for (const attempt of attempts){
        let response;
        try {
            response = await attempt.run();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(`${attempt.name}:${message}`);
            continue;
        }
        if (!response.ok) {
            const errorText = await response.text().catch(()=>"");
            if (response.status === 401 || response.status === 403) {
                sawAuthError = true;
            }
            lastHttpFailure = `Kiro API error (${response.status}): ${errorText}`;
            errors.push(`${attempt.name}:${response.status}${errorText ? `:${errorText}` : ""}`);
            continue;
        }
        return {
            data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await response.json()),
            sawAuthError,
            errors,
            lastHttpFailure
        };
    }
    return {
        sawAuthError,
        errors,
        lastHttpFailure
    };
}
function supportsProfilelessKiroUsage(authMethod) {
    return authMethod === "builder-id";
}
async function getKiroUsage(accessToken, providerSpecificData) {
    try {
        const authMethod = typeof providerSpecificData?.authMethod === "string" ? providerSpecificData.authMethod : undefined;
        const isApiKey = authMethod === "api_key";
        const supportsProfilelessUsage = supportsProfilelessKiroUsage(authMethod);
        let profileArn = typeof providerSpecificData?.profileArn === "string" ? providerSpecificData.profileArn : undefined;
        const storedRegion = typeof providerSpecificData?.region === "string" ? providerSpecificData.region.trim().toLowerCase() : undefined;
        // Enterprise IAM Identity Center logins and kiro-cli imports frequently don't persist a
        // profileArn. Discover it by probing the Q Developer PROFILE regions (us-east-1 / eu-central-1)
        // — NOT the IdC/token region. An IdC in eu-north-1 has no Q runtime host (q.eu-north-1 does not
        // exist); its profile lives in eu-central-1 (or us-east-1) and the SSO token works cross-region
        // against it. Without this, the quota card previously showed nothing ("no limits") for such
        // accounts because the single-region lookup at q.{idcRegion} always failed.
        // Builder ID sessions can call GetUsageLimits without a profile ARN. Their
        // ListAvailableProfiles request may be denied even while profile-less quota requests work, so
        // skip discovery only when the stored identity proves this is Builder ID.
        if (!profileArn && accessToken && !supportsProfilelessUsage) {
            profileArn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroRegion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["discoverKiroProfileArnAcrossRegions"])(accessToken, storedRegion);
        }
        if (!profileArn && !isApiKey && !supportsProfilelessUsage) {
            return {
                message: "Kiro connected. Profile ARN not available for quota tracking."
            };
        }
        // The RUNTIME region is the profileArn region (us-east-1 / eu-central-1), never the IdC token
        // region. Route GetUsageLimits to that region's host so quota resolves for cross-region IdC.
        const region = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroRegion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveKiroRuntimeRegion"])({
            region: storedRegion,
            profileArn
        });
        const usageBaseUrl = region === "us-east-1" ? CODEWHISPERER_BASE_URL : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroRegion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kiroRuntimeHost"])(region);
        const qBaseUrl = `https://q.${region}.amazonaws.com`;
        const authHeaders = buildKiroAuthHeaders(accessToken, isApiKey, providerSpecificData);
        const usageParams = new URLSearchParams({
            isEmailRequired: "true",
            origin: "AI_EDITOR",
            resourceType: "AGENTIC_REQUEST"
        });
        const qParams = new URLSearchParams({
            origin: "AI_EDITOR",
            ...profileArn ? {
                profileArn
            } : {},
            resourceType: "AGENTIC_REQUEST"
        });
        const payload = {
            origin: "AI_EDITOR",
            ...profileArn ? {
                profileArn
            } : {},
            resourceType: "AGENTIC_REQUEST"
        };
        const attempts = buildKiroUsageAttempts({
            authHeaders,
            usageParams,
            qParams,
            payload,
            usageBaseUrl,
            qBaseUrl
        });
        const outcome = await runKiroUsageAttempts(attempts);
        if (outcome.data) {
            return buildKiroUsageResult(outcome.data);
        }
        const { sawAuthError, errors } = outcome;
        if (sawAuthError) {
            // Social-auth Kiro accounts (added via /api/oauth/kiro/social-exchange with provider
            // Google or GitHub) use a different token format that AWS CodeWhisperer's GetUsageLimits
            // routinely rejects with 401/403, even when /messages still works. Surface a clear
            // "auth expired, chat may still work" message instead of a generic upstream-error blob
            // so the quota card matches what users with legacy social-auth accounts already see.
            // Inspired by https://github.com/decolua/9router/pull/620.
            if (isSocialAuthKiroAccount(providerSpecificData)) {
                return {
                    message: "Kiro quota API authentication expired. Chat may still work.",
                    quotas: {}
                };
            }
            return {
                message: "Kiro quota API rejected the current token. Chat may still work.",
                quotas: {}
            };
        }
        // Hard (non-auth) failure keeps the pre-#6587 reject semantics — callers and
        // tests/unit/usage-service-hardening.test.ts rely on the rejection; prefer the last
        // HTTP-status failure (most informative) over a network-level error.
        throw new Error(outcome.lastHttpFailure || (errors.length > 0 ? errors[errors.length - 1] : "no usage endpoint responded"));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch Kiro usage: ${message}`);
    }
}
/**
 * Was this Kiro connection added via the Google/GitHub social-auth device flow
 * (POST /api/oauth/kiro/social-exchange)? That route persists
 * `{ authMethod: "imported", provider: "Google" | "Github" }` on the connection.
 * Builder-ID / IDC / kiro-cli imports use different markers and should keep the
 * existing throw-on-failure behavior.
 */ function isSocialAuthKiroAccount(providerSpecificData) {
    if (!providerSpecificData || providerSpecificData.authMethod !== "imported") return false;
    const provider = typeof providerSpecificData.provider === "string" ? providerSpecificData.provider.toLowerCase() : "";
    return provider === "google" || provider === "github";
}
}),
"[project]/open-sse/services/usage/adobeFirefly.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAdobeFireflyCreditsQuota",
    ()=>buildAdobeFireflyCreditsQuota,
    "buildAdobeFireflyQuotasRecord",
    ()=>buildAdobeFireflyQuotasRecord,
    "getAdobeFireflyUsage",
    ()=>getAdobeFireflyUsage
]);
/**
 * Adobe Firefly credits balance → UsageQuota for Limits page.
 *
 * Live capture (adobe/balance.txt):
 *   GET https://firefly.adobe.io/v1/credits/balance
 *   Authorization: Bearer <IMS access_token>
 *   x-api-key: SunbreakWebUI1
 *   x-account-id: <user_id from JWT>
 *
 * Response shape:
 * {
 *   total: { quota: { total, used, available }, availableUntil },
 *   credits: {
 *     firefly_free_credit: { quota: { total, used, available } },
 *     firefly_plan_credit: { quota: { total, used, available } }
 *   }
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyClient.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
;
function oneQuota(used, total, remaining, resetAt, displayName) {
    const t = Math.max(0, total);
    const u = Math.max(0, Math.min(t, used));
    const r = remaining > 0 ? remaining : Math.max(0, t - u);
    const remainingPercentage = t > 0 ? Math.round(r / t * 1000) / 10 : r > 0 ? 100 : 0;
    return {
        used: u,
        total: t,
        remaining: r,
        remainingPercentage,
        resetAt,
        unlimited: false,
        displayName
    };
}
function buildAdobeFireflyCreditsQuota(balance) {
    const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(balance.availableUntil);
    return oneQuota(balance.used, balance.total, balance.remaining, resetAt, "Firefly credits");
}
function buildAdobeFireflyQuotasRecord(balance) {
    const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(balance.availableUntil);
    const quotas = {};
    // Aggregate first (what Limits primarily shows)
    if (balance.total > 0 || balance.remaining > 0) {
        quotas["firefly_total"] = oneQuota(balance.used, balance.total, balance.remaining, resetAt, "Firefly credits");
    }
    if (balance.freeTotal > 0) {
        quotas["firefly_free"] = oneQuota(balance.freeUsed, balance.freeTotal, balance.freeRemaining, resetAt, "Free credits");
    }
    if (balance.planTotal > 0) {
        quotas["firefly_plan"] = oneQuota(balance.planUsed, balance.planTotal, balance.planRemaining, resetAt, "Plan credits");
    }
    // Fallback if all zeros but we still got a parse
    if (Object.keys(quotas).length === 0) {
        quotas["firefly_total"] = oneQuota(0, 0, 0, resetAt, "Firefly credits");
    }
    return quotas;
}
async function getAdobeFireflyUsage(apiKey, accessToken, providerSpecificData, fetchImpl = fetch) {
    try {
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAdobeAccessToken"])({
            apiKey,
            accessToken,
            providerSpecificData: providerSpecificData
        }, fetchImpl);
        const balance = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAdobeCreditsBalance"])(token, fetchImpl);
        if (balance.total <= 0 && balance.remaining <= 0 && balance.planTotal <= 0 && balance.freeTotal <= 0) {
            return {
                message: "Adobe Firefly returned an empty credits balance. Paste a fresh IMS access_token JWT (Authorization: Bearer on firefly-3p generate/discovery) from a signed-in session — not firefly.adobe.com page cookies alone."
            };
        }
        return {
            quotas: buildAdobeFireflyQuotasRecord(balance),
            plan: balance.planTotal > 0 ? "Firefly plan" : "Firefly free"
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Surface a short Limits-friendly message for guest/cookie failures
        if (/guest|GUEST|Bearer|session cookies are empty|token invalid/i.test(msg)) {
            return {
                message: "Adobe Firefly Limits need a signed-in IMS JWT. Open firefly.adobe.com → F12 → Network → firefly-3p → Authorization → copy token after Bearer (eyJ…). Page Cookie alone only mints a guest token."
            };
        }
        return {
            message: msg || "Failed to fetch Adobe Firefly credits balance"
        };
    }
}
}),
"[project]/open-sse/services/usage/openrouter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getOpenrouterUsage",
    ()=>getOpenrouterUsage
]);
/**
 * usage/openrouter.ts — OpenRouter usage-dashboard builder (#6842)
 *
 * Extracted as a leaf module (not inlined in usage.ts) so the god-file stays
 * flat: this owns turning an OpenrouterQuota into the `UsageQuota` shape the
 * Dashboard → Usage page renders, mirroring getDeepseekUsage's pattern.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterQuotaFetcher.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterFreeWindow.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function buildCreditsQuota(quota) {
    if (quota.limit === null && quota.creditBalance === null) return null;
    return {
        used: quota.limit !== null ? quota.limit - (quota.limitRemaining ?? quota.limit) : 0,
        total: quota.limit ?? 0,
        remaining: quota.creditBalance ?? undefined,
        remainingPercentage: quota.limit !== null ? Math.round((1 - quota.percentUsed) * 100) : 100,
        resetAt: quota.resetAt ?? null,
        unlimited: quota.limit === null,
        currency: "USD"
    };
}
function buildFreeWindowQuota(connectionId, connection) {
    const accountKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAccountKey"])(connectionId, connection);
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFreeWindowStatus"])(accountKey);
    const dailyQuota = {
        used: status.dailyUsed,
        total: status.dailyLimit,
        remaining: status.dailyRemaining,
        remainingPercentage: Math.round(status.dailyRemaining / status.dailyLimit * 100),
        resetAt: status.dailyResetAt,
        unlimited: false,
        displayName: "Free-tier requests (daily)"
    };
    const rpmQuota = {
        used: status.rpmUsed,
        total: status.rpmLimit,
        remaining: status.rpmRemaining,
        remainingPercentage: Math.round(status.rpmRemaining / status.rpmLimit * 100),
        resetAt: null,
        unlimited: false,
        displayName: "Free-tier requests (per minute)"
    };
    return {
        dailyQuota,
        rpmQuota
    };
}
async function getOpenrouterUsage(connectionId, apiKey, providerSpecificData) {
    if (!apiKey) {
        return {
            message: "OpenRouter API key not available. Add a key to view usage."
        };
    }
    const connection = {
        apiKey,
        providerSpecificData: providerSpecificData ?? {}
    };
    const quota = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchOpenrouterQuota"])(connectionId, connection);
    const quotas = {};
    const { dailyQuota, rpmQuota } = buildFreeWindowQuota(connectionId, connection);
    quotas.free_daily = dailyQuota;
    quotas.free_rpm = rpmQuota;
    if (!quota) {
        return {
            plan: "OpenRouter (usage endpoint unreachable)",
            quotas,
            message: "OpenRouter connected. Balance/credit-cap data temporarily unavailable."
        };
    }
    const creditsQuota = buildCreditsQuota(quota);
    if (creditsQuota) quotas.credits = creditsQuota;
    return {
        plan: quota.isFreeTier ? "OpenRouter (Free Tier)" : "OpenRouter",
        quotas,
        isFreeTier: quota.isFreeTier,
        usageDaily: quota.usageDaily,
        usageWeekly: quota.usageWeekly,
        usageMonthly: quota.usageMonthly
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage/codebuddy-cn.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getCodeBuddyCnUsage",
    ()=>getCodeBuddyCnUsage
]);
/**
 * CodeBuddy CN usage handler — scoped to the "codebuddy-cn" provider.
 *
 * Quota lives behind a Tencent billing endpoint (POST, payload wrapped twice
 * under data.Response.Data). It mixes two credit types that must NOT be merged:
 *
 *  - Refill / base ("基础体验包"): recurring allowance whose cycle resets long
 *    before the resource itself expires (CycleEndTime << DeductionEndTime).
 *    Live numbers in the *Cycle* fields; resetAt = next refresh.
 *  - Bonus ("活动赠送包"): one-shot credits that run a single cycle and expire
 *    (CycleEndTime ≈ DeductionEndTime). Numbers in the plain Capacity fields.
 *
 * One quota row per package — cadence label (Monthly/Weekly/Daily) for refill
 * packs, "Bonus Pack N" for bonus packs (soonest-expiring first).
 */ const USAGE_URL = "https://copilot.tencent.com/v2/billing/meter/get-user-resource";
function parseResetTime(value) {
    if (!value) return null;
    try {
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "number") {
            const ts = value < 1e12 ? value * 1000 : value;
            const d = new Date(ts);
            return d.getTime() > 0 ? d.toISOString() : null;
        }
        if (typeof value === "string") {
            if (/^\d+$/.test(value)) {
                const n = Number(value);
                const d = new Date(n < 1e12 ? n * 1000 : n);
                return d.getTime() > 0 ? d.toISOString() : null;
            }
            const d = new Date(value);
            return Number.isNaN(d.getTime()) || d.getTime() <= 0 ? null : d.toISOString();
        }
        return null;
    } catch  {
        return null;
    }
}
// Prefer the *Precise string fields (exact), fall back to the numeric ones.
function num(precise, plain) {
    const n = Number(precise ?? plain);
    return Number.isFinite(n) ? n : 0;
}
// Label a refill pack by its cycle length (Monthly is the common CodeBuddy case).
function refillCadence(acc) {
    const start = parseResetTime(acc.CycleStartTime);
    const end = parseResetTime(acc.CycleEndTime);
    if (start && end) {
        const days = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
        if (days <= 1.5) return "Daily";
        if (days <= 10) return "Weekly";
    }
    return "Monthly";
}
function cycleEndMs(acc) {
    const r = parseResetTime(acc.CycleEndTime);
    return r ? new Date(r).getTime() : Number.POSITIVE_INFINITY;
}
function deductionEndMs(acc) {
    const v = acc.DeductionEndTime;
    if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
    if (typeof v === "string" && /^\d+$/.test(v)) {
        const n = Number(v);
        return n < 1e12 ? n * 1000 : n;
    }
    const r = parseResetTime(v);
    return r ? new Date(r).getTime() : Number.POSITIVE_INFINITY;
}
// Refill packs roll into a new cycle before the resource expires; bonus packs
// end at expiry. >2d gap between cycle end and validity end = refill.
const REFILL_GAP_MS = 2 * 24 * 60 * 60 * 1000;
function isRefill(acc) {
    const ce = cycleEndMs(acc);
    const de = deductionEndMs(acc);
    return Number.isFinite(ce) && Number.isFinite(de) && de - ce > REFILL_GAP_MS;
}
async function getCodeBuddyCnUsage(accessToken, apiKey, _providerSpecificData) {
    const token = accessToken || apiKey;
    if (!token) {
        return {
            message: "CodeBuddy CN credential not available."
        };
    }
    try {
        const response = await fetch(USAGE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": "CLI/2.108.1 CodeBuddy/2.108.1",
                "X-Product": "SaaS",
                "X-IDE-Type": "CLI",
                "X-IDE-Name": "CLI",
                "x-requested-with": "XMLHttpRequest",
                "x-codebuddy-request": "1"
            },
            body: "{}"
        });
        if (response.status === 401 || response.status === 403) {
            return {
                message: "CodeBuddy CN credential invalid or expired."
            };
        }
        if (!response.ok) {
            return {
                message: `CodeBuddy CN quota API error (${response.status}).`
            };
        }
        const json = await response.json();
        if (json?.code !== 0) {
            return {
                message: `CodeBuddy CN quota error: ${json?.msg || "unknown"}`
            };
        }
        const data = json?.data?.Response?.Data || {};
        const accountsRaw = Array.isArray(data.Accounts) ? data.Accounts : [];
        if (accountsRaw.length === 0) {
            return {
                message: "CodeBuddy CN connected. No credit package found."
            };
        }
        const byExpiry = (a, b)=>cycleEndMs(a) - cycleEndMs(b);
        const refills = accountsRaw.filter(isRefill).sort(byExpiry);
        const bonuses = accountsRaw.filter((a)=>!isRefill(a)).sort(byExpiry);
        const quotas = {};
        const seenRefill = {};
        refills.forEach((acc)=>{
            const base = refillCadence(acc);
            seenRefill[base] = (seenRefill[base] || 0) + 1;
            const name = seenRefill[base] > 1 ? `${base} ${seenRefill[base]}` : base;
            quotas[name] = {
                used: num(acc.CycleCapacityUsedPrecise, acc.CycleCapacityUsed),
                total: num(acc.CycleCapacitySizePrecise, acc.CycleCapacitySize),
                resetAt: parseResetTime(acc.CycleEndTime),
                unlimited: false
            };
        });
        bonuses.forEach((acc, i)=>{
            quotas[`Bonus Pack ${i + 1}`] = {
                used: num(acc.CapacityUsedPrecise, acc.CapacityUsed),
                total: num(acc.CapacitySizePrecise, acc.CapacitySize),
                resetAt: parseResetTime(acc.CycleEndTime),
                unlimited: false
            };
        });
        const basePkg = refills[0] || accountsRaw[0] || {};
        const plan = basePkg.PackageName || basePkg.SubProductName || "CodeBuddy CN";
        return {
            plan,
            quotas
        };
    } catch (error) {
        // Hard Rule #12: no raw err.message in any HTTP/SSE/executor response. Usage
        // handler returns a controlled string for the dashboard; do not include the
        // raw exception text in case it carries a path/stack snippet.
        return {
            message: "CodeBuddy CN error: failed to fetch quota."
        };
    }
}
const __TURBOPACK__default__export__ = getCodeBuddyCnUsage;
}),
"[project]/open-sse/services/usage/promptql.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * PromptQL project credit summary → UsageQuota for Limits page.
 *
 * Live GraphQL (data.pro.ql.app) — captured from prompt.ql.app SPA (ge_balance.txt):
 *   POST https://data.pro.ql.app/v1/graphql
 *   query getCreditSummary($project_id: uuid!) {
 *     promptql_project_credit_summary(where: {project_id: {_eq: $project_id}}) {
 *       remaining_credits_usd_micros   // e.g. 28484763 → $28.48 left
 *       total_drawn_usd_micros         // e.g. 21515237 → $21.52 used
 *       available_credits_usd_micros   // e.g. 50000000 → $50.00 total
 *       total_olus_used
 *       last_drawdown_at
 *     }
 *   }
 *
 * Browser SPA often uses session cookies (credentials:include). Headless OmniRoute
 * uses the playground JWT (Bearer). We send Bearer always when present and Cookie
 * when providerSpecificData.cookie is stored.
 */ __turbopack_context__.s([
    "buildPromptQlCreditsQuota",
    ()=>buildPromptQlCreditsQuota,
    "getPromptQlUsage",
    ()=>getPromptQlUsage,
    "microsToUsd",
    ()=>microsToUsd
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptql$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/promptql/jwt.ts [app-route] (ecmascript)");
;
;
const CREDITS_GQL = process.env.PROMPTQL_CREDITS_ENDPOINT || "https://data.pro.ql.app/v1/graphql";
const GET_CREDIT_SUMMARY = `
query getCreditSummary($project_id: uuid!) {
  promptql_project_credit_summary(where: {project_id: {_eq: $project_id}}) {
    project_id
    available_credits_usd_micros
    total_topup_usd_micros
    total_drawn_usd_micros
    remaining_credits_usd_micros
    total_olus_used
    last_drawdown_at
  }
}`;
function microsToUsd(micros) {
    const n = typeof micros === "number" ? micros : Number(micros);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n / 1_000_000 * 100) / 100;
}
function buildPromptQlCreditsQuota(row) {
    const available = microsToUsd(row.available_credits_usd_micros ?? 0);
    const remaining = microsToUsd(row.remaining_credits_usd_micros ?? 0);
    const drawn = microsToUsd(row.total_drawn_usd_micros ?? 0);
    // available = wallet top-line (e.g. $50); remaining + drawn should sum ≈ available
    const total = available > 0 ? available : remaining + drawn;
    const used = Math.max(0, Math.min(total, drawn > 0 ? drawn : Math.max(0, total - remaining)));
    const rem = remaining > 0 ? remaining : Math.max(0, total - used);
    const remainingPercentage = total > 0 ? Math.round(rem / total * 1000) / 10 : rem > 0 ? 100 : 0;
    return {
        used,
        total,
        remaining: rem,
        remainingPercentage,
        // last_drawdown is activity, not a hard reset — omit so UI doesn't show a false "Resets in…"
        resetAt: null,
        unlimited: false,
        currency: "USD",
        displayName: "Credits (USD)"
    };
}
function readPs(data, keys) {
    if (!data || typeof data !== "object") return "";
    const rec = data;
    for (const k of keys){
        const v = rec[k];
        if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
}
/**
 * data.pro.ql.app getCreditSummary accepts DDN/lux project JWTs (aud=project UUID).
 * Playground enrich-tokens (iss=enrich-token) are rejected with access-denied.
 * Prefer lux/ddn tokens for credits; fall back to apiKey when it is already DDN-shaped.
 */ function collectCreditsTokens(apiKey, providerSpecificData) {
    const out = [];
    const seen = new Set();
    const push = (raw)=>{
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptql$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePromptQlToken"])(raw);
        if (!t || seen.has(t)) return;
        seen.add(t);
        out.push(t);
    };
    // Explicit credits tokens first
    push(readPs(providerSpecificData, [
        "luxJwt",
        "ddnToken",
        "projectToken",
        "creditsToken",
        "luxToken"
    ]));
    push(apiKey || "");
    // Also allow nested vibeProxy bag (forward-compat)
    if (providerSpecificData && typeof providerSpecificData.vibeProxy === "object") {
        push(readPs(providerSpecificData.vibeProxy, [
            "luxJwt",
            "ddnToken"
        ]));
    }
    // Prefer DDN/lux tokens for data.pro.ql.app over enrich-tokens
    return out.sort((a, b)=>(isLikelyDdnToken(a) ? 0 : 1) - (isLikelyDdnToken(b) ? 0 : 1));
}
function isLikelyDdnToken(token) {
    const json = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptql$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decodeJwtPayload"])(token);
    if (!json) return false;
    const iss = typeof json.iss === "string" ? json.iss : "";
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptql$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["issuerHostIsTrusted"])(iss)) return true;
    if (iss.toLowerCase().includes("enrich-token")) return false;
    const aud = json.aud;
    if (typeof aud === "string" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptql$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["looksLikeUuid"])(aud)) return true;
    return false;
}
async function getPromptQlUsage(apiKey, providerSpecificData, connectionProjectId) {
    const cookie = readPs(providerSpecificData, [
        "cookie",
        "sessionCookie",
        "authCookie"
    ]);
    const tokens = collectCreditsTokens(apiKey, providerSpecificData);
    if (!tokens.length && !cookie) {
        return {
            message: "PromptQL JWT not available. Paste a Bearer token to view credits."
        };
    }
    const projectId = readPs(providerSpecificData, [
        "projectId",
        "project_id",
        "x-hasura-project-id"
    ]) || (typeof connectionProjectId === "string" ? connectionProjectId.trim() : "") || (tokens.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$promptql$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractProjectIdFromToken"])(tokens[0]) : "");
    if (!projectId) {
        return {
            message: "Missing projectId for PromptQL credits. Set providerSpecificData.projectId, or use a playground JWT (x-hasura-project-id) or a DDN JWT whose aud is the project UUID."
        };
    }
    try {
        const headersBase = {
            accept: "application/graphql-response+json, application/json",
            "content-type": "application/json",
            origin: "https://prompt.ql.app",
            referer: "https://prompt.ql.app/",
            "hasura-client-name": "hasura-console"
        };
        if (cookie) headersBase.cookie = cookie;
        // Try each token (DDN first). Enrich-only accounts get a clear dual-token message.
        let lastError = "";
        const tryTokens = tokens.length ? tokens : [
            ""
        ];
        for (const token of tryTokens){
            const headers = {
                ...headersBase
            };
            if (token) headers.authorization = `Bearer ${token}`;
            else if (!cookie) continue;
            const res = await fetch(CREDITS_GQL, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    query: GET_CREDIT_SUMMARY,
                    variables: {
                        project_id: projectId
                    },
                    operationName: "getCreditSummary"
                })
            });
            if (!res.ok) {
                const bodyText = await res.text().catch(()=>"");
                lastError = `HTTP ${res.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ""}`;
                continue;
            }
            const json = await res.json();
            if (json.errors?.length) {
                lastError = json.errors.map((e)=>e.message).join("; ");
                // access-denied on enrich-token → try next token
                if (/unauthorized|access-denied|JWT/i.test(lastError)) continue;
                return {
                    message: lastError,
                    plan: "PromptQL"
                };
            }
            const row = json.data?.promptql_project_credit_summary?.[0];
            if (!row) {
                lastError = "No credit summary for this project (empty promptql_project_credit_summary).";
                continue;
            }
            const credits = buildPromptQlCreditsQuota(row);
            return {
                plan: "PromptQL",
                quotas: {
                    credits
                },
                olusUsed: row.total_olus_used,
                remainingUsd: credits.remaining,
                drawnUsd: credits.used,
                availableUsd: credits.total
            };
        }
        // All tokens failed — if we only had enrich-token, explain dual-token requirement.
        const onlyEnrich = tokens.length > 0 && tokens.every((t)=>!isLikelyDdnToken(t));
        if (onlyEnrich) {
            return {
                message: "PromptQL credits need a DDN/project JWT (iss=auth.pro.hasura.io, aud=project UUID) — the playground enrich-token works for chat only. Store the DDN token as providerSpecificData.luxJwt (or paste it once so the app saves it), then refresh Limits.",
                plan: "PromptQL"
            };
        }
        return {
            message: lastError ? `PromptQL credits failed: ${lastError}` : "PromptQL credits failed with no usable token.",
            plan: "PromptQL"
        };
    } catch (err) {
        return {
            message: `PromptQL credits failed: ${err instanceof Error ? err.message : String(err)}`,
            plan: "PromptQL"
        };
    }
}
}),
"[project]/open-sse/services/usage/hyperagent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * HyperAgent billing usage → UsageQuota for Limits page.
 *
 * Live capture (hyperagent/get_balance.txt):
 *   GET https://hyperagent.com/api/settings/billing/usage
 *   credentials: include (session Cookie)
 *
 *   creditData.creditBlocks[]:
 *     initialUsd   → total ($500)
 *     remainingUsd → remaining ($499.56)
 *     usedUsd      → used
 *     expiryDate   → optional resetAt
 *
 *   plan.name → "Pay As You Go" etc.
 */ __turbopack_context__.s([
    "buildHyperAgentCreditsQuota",
    ()=>buildHyperAgentCreditsQuota,
    "getHyperAgentUsage",
    ()=>getHyperAgentUsage,
    "resolveHyperAgentCookie",
    ()=>resolveHyperAgentCookie,
    "roundUsd",
    ()=>roundUsd
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)");
;
const USAGE_URL = process.env.HYPERAGENT_USAGE_URL || "https://hyperagent.com/api/settings/billing/usage";
function readStr(v) {
    if (typeof v !== "string") return "";
    const t = v.trim();
    return t.length ? t : "";
}
function readPs(data, keys) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return "";
    const rec = data;
    for (const k of keys){
        const v = readStr(rec[k]);
        if (v) return v;
    }
    return "";
}
function roundUsd(n) {
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100) / 100;
}
function buildHyperAgentCreditsQuota(block) {
    const total = roundUsd((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(block.initialUsd));
    const remaining = roundUsd((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(block.remainingUsd));
    let used = roundUsd((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(block.usedUsd));
    if (used <= 0 && total > 0) used = roundUsd(Math.max(0, total - remaining));
    const rem = remaining > 0 || total <= 0 ? remaining : Math.max(0, total - used);
    const remainingPercentage = total > 0 ? Math.round(rem / total * 1000) / 10 : rem > 0 ? 100 : 0;
    const expiry = readStr(block.expiryDate) || null;
    return {
        used,
        total: total > 0 ? total : used + rem,
        remaining: rem,
        remainingPercentage,
        resetAt: expiry,
        unlimited: false,
        currency: "USD",
        displayName: "Credits (USD)"
    };
}
function normalizeCookie(raw) {
    const t = (raw || "").trim();
    if (!t) return "";
    // Accept bare session value — pass through; full Cookie header preferred.
    return t;
}
function resolveHyperAgentCookie(apiKey, providerSpecificData) {
    const direct = normalizeCookie(apiKey || "");
    if (direct) return direct;
    return normalizeCookie(readPs(providerSpecificData, [
        "cookie",
        "sessionCookie",
        "authCookie",
        "Cookie"
    ]));
}
async function getHyperAgentUsage(apiKey, providerSpecificData) {
    const cookie = resolveHyperAgentCookie(apiKey, providerSpecificData);
    if (!cookie) {
        return {
            message: "HyperAgent session cookie not available. Paste the full Cookie header from hyperagent.com (DevTools → Network → any request → Cookie)."
        };
    }
    try {
        const res = await fetch(USAGE_URL, {
            method: "GET",
            headers: {
                accept: "application/json",
                cookie,
                origin: "https://hyperagent.com",
                referer: "https://hyperagent.com/settings/billing",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"
            }
        });
        if (!res.ok) {
            const bodyText = await res.text().catch(()=>"");
            return {
                message: `HyperAgent usage HTTP ${res.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ""}`,
                plan: "HyperAgent"
            };
        }
        const json = await res.json();
        const blocks = json.creditData?.creditBlocks || [];
        const active = blocks.find((b)=>(b.status || "").toLowerCase() === "active") || blocks[0];
        if (!active) {
            return {
                message: "No active HyperAgent credit block (creditData.creditBlocks empty).",
                plan: json.plan?.name || "HyperAgent"
            };
        }
        const credits = buildHyperAgentCreditsQuota(active);
        const planName = readStr(json.plan?.name) || "HyperAgent";
        return {
            plan: planName,
            quotas: {
                credits
            },
            remainingUsd: credits.remaining,
            drawnUsd: credits.used,
            availableUsd: credits.total,
            totalCost: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(json.orbCostsAndUsage?.totalCost)
        };
    } catch (err) {
        return {
            message: `HyperAgent usage failed: ${err instanceof Error ? err.message : String(err)}`,
            plan: "HyperAgent"
        };
    }
}
}),
"[project]/open-sse/services/usage/github.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatGitHubQuotaSnapshot",
    ()=>formatGitHubQuotaSnapshot,
    "getGitHubUsage",
    ()=>getGitHubUsage,
    "inferGitHubPlanName",
    ()=>inferGitHubPlanName,
    "shouldDisplayGitHubQuota",
    ()=>shouldDisplayGitHubQuota
]);
/**
 * usage/github.ts — GitHub Copilot usage fetcher + quota/plan helpers.
 *
 * Extracted from services/usage.ts (god-file decomposition): the GitHub family —
 * the copilot_internal/user fetcher (getGitHubUsage), the paid/limited quota
 * snapshot formatter (formatGitHubQuotaSnapshot), the plan-name inference
 * (inferGitHubPlanName), and the display gate (shouldDisplayGitHubQuota).
 * Depends only on the sibling scalar/quota leaves + the GitHub internal-user
 * header profile — no host coupling — so it lives as a co-located provider leaf.
 * usage.ts imports getGitHubUsage (dispatcher) + re-exports the helpers via
 * __testing (existing usage-utils / usage-service-hardening suites read them
 * from there). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerHeaderProfiles.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
;
function shouldDisplayGitHubQuota(quota) {
    if (!quota) return false;
    if (quota.unlimited && quota.total <= 0) return false;
    return quota.total > 0 || quota.remainingPercentage !== undefined;
}
async function getGitHubUsage(accessToken, providerSpecificData) {
    try {
        if (!accessToken) {
            throw new Error("No GitHub access token available. Please re-authorize the connection.");
        }
        // copilot_internal/user API requires GitHub OAuth token, not copilotToken
        const response = await fetch("https://api.github.com/copilot_internal/user", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerHeaderProfiles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGitHubCopilotInternalUserHeaders"])(`token ${accessToken}`)
        });
        if (!response.ok) {
            const error = await response.text();
            if (response.status === 401 || response.status === 403) {
                return {
                    message: `GitHub token expired or permission denied. Please re-authenticate the connection.`
                };
            }
            throw new Error(`GitHub API error: ${error}`);
        }
        const data = await response.json();
        const dataRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data);
        // Handle different response formats (paid vs free)
        if (dataRecord.quota_snapshots) {
            // Paid plan format
            const snapshots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataRecord.quota_snapshots);
            const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(dataRecord, "quota_reset_date", "quotaResetDate"));
            const premiumQuota = formatGitHubQuotaSnapshot(snapshots.premium_interactions, resetAt);
            const chatQuota = formatGitHubQuotaSnapshot(snapshots.chat, resetAt);
            const completionsQuota = formatGitHubQuotaSnapshot(snapshots.completions, resetAt);
            const quotas = {};
            if (shouldDisplayGitHubQuota(premiumQuota)) {
                quotas.premium_interactions = premiumQuota;
            }
            if (shouldDisplayGitHubQuota(chatQuota)) {
                quotas.chat = chatQuota;
            }
            if (shouldDisplayGitHubQuota(completionsQuota)) {
                quotas.completions = completionsQuota;
            }
            return {
                plan: inferGitHubPlanName(dataRecord, premiumQuota),
                resetDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(dataRecord, "quota_reset_date", "quotaResetDate"),
                quotas
            };
        } else if (dataRecord.monthly_quotas || dataRecord.limited_user_quotas) {
            // Free/limited plan format. NOTE (#2876): the upstream field
            // `limited_user_quotas[name]` is the *remaining* count for the month
            // (it counts down toward 0 and resets on `limited_user_reset_date`),
            // NOT the used count. The pre-3.8.6 implementation inverted this and
            // showed "0% when not used / 100% when fully used" on the dashboard.
            // Confirmed against three independent upstream parsers:
            //   - robinebers/openusage  docs/providers/copilot.md (Free Tier table)
            //   - raycast/extensions    agent-usage/src/copilot/fetcher.ts (inline comment)
            //   - looplj/axonhub        frontend/src/components/quota-badges.tsx
            const monthlyQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataRecord.monthly_quotas);
            const remainingQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(dataRecord.limited_user_quotas);
            const resetDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(dataRecord, "limited_user_reset_date", "limitedUserResetDate");
            const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(resetDate);
            const quotas = {};
            const addLimitedQuota = (name)=>{
                const total = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(monthlyQuotas, name, name), 0);
                if (total <= 0) return null;
                const remainingRaw = Math.max(0, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(remainingQuotas, name, name), 0));
                const remaining = Math.min(remainingRaw, total);
                const used = Math.max(total - remaining, 0);
                quotas[name] = {
                    used,
                    total,
                    remaining,
                    remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(remaining / total * 100),
                    unlimited: false,
                    resetAt
                };
                return quotas[name];
            };
            const premiumQuota = addLimitedQuota("premium_interactions");
            addLimitedQuota("chat");
            addLimitedQuota("completions");
            return {
                plan: inferGitHubPlanName(dataRecord, premiumQuota),
                resetDate,
                quotas
            };
        }
        return {
            message: "GitHub Copilot connected. Unable to parse quota data."
        };
    } catch (error) {
        throw new Error(`Failed to fetch GitHub usage: ${error.message}`);
    }
}
function formatGitHubQuotaSnapshot(quota, resetAt = null) {
    const source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(quota);
    if (Object.keys(source).length === 0) return null;
    const unlimited = source.unlimited === true;
    const entitlement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(source.entitlement, Number.NaN);
    const totalValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(source.total, Number.NaN);
    const remainingValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(source.remaining, Number.NaN);
    const usedValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(source.used, Number.NaN);
    const percentRemainingValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(source, "percent_remaining", "percentRemaining"), Number.NaN);
    let total = Number.isFinite(totalValue) ? Math.max(0, totalValue) : Number.isFinite(entitlement) ? Math.max(0, entitlement) : 0;
    let remaining = Number.isFinite(remainingValue) ? Math.max(0, remainingValue) : undefined;
    let used = Number.isFinite(usedValue) ? Math.max(0, usedValue) : undefined;
    let remainingPercentage = Number.isFinite(percentRemainingValue) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(percentRemainingValue) : undefined;
    if (used === undefined && total > 0 && remaining !== undefined) {
        used = Math.max(total - remaining, 0);
    }
    if (remaining === undefined && total > 0 && used !== undefined) {
        remaining = Math.max(total - used, 0);
    }
    if (remainingPercentage === undefined && total > 0 && remaining !== undefined) {
        remainingPercentage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(remaining / total * 100);
    }
    if (total <= 0 && remainingPercentage !== undefined) {
        total = 100;
        used = 100 - remainingPercentage;
        remaining = remainingPercentage;
    }
    return {
        used: Math.max(0, used ?? 0),
        total,
        remaining,
        remainingPercentage,
        resetAt,
        unlimited
    };
}
function inferGitHubPlanName(data, premiumQuota) {
    const rawPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(data, "copilot_plan", "copilotPlan");
    const rawSku = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(data, "access_type_sku", "accessTypeSku");
    const planText = typeof rawPlan === "string" ? rawPlan.trim() : "";
    const skuText = typeof rawSku === "string" ? rawSku.trim() : "";
    const combined = `${skuText} ${planText}`.trim().toUpperCase();
    const monthlyQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(data, "monthly_quotas", "monthlyQuotas"));
    const premiumTotal = premiumQuota?.total || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(monthlyQuotas, "premium_interactions", "premiumInteractions"), 0);
    const chatTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFieldValue"])(monthlyQuotas, "chat", "chat"), 0);
    if (combined.includes("PRO+") || combined.includes("PRO_PLUS") || combined.includes("PROPLUS")) {
        return "Copilot Pro+";
    }
    if (combined.includes("ENTERPRISE")) return "Copilot Enterprise";
    if (combined.includes("BUSINESS")) return "Copilot Business";
    if (combined.includes("STUDENT")) return "Copilot Student";
    if (combined.includes("FREE")) return "Copilot Free";
    if (combined.includes("PRO")) return "Copilot Pro";
    if (premiumTotal >= 1400) return "Copilot Pro+";
    if (premiumTotal >= 900) return "Copilot Enterprise";
    if (premiumTotal >= 250) {
        if (combined.includes("INDIVIDUAL")) return "Copilot Pro";
        return "Copilot Business";
    }
    if (premiumTotal > 0 || chatTotal === 50) return "Copilot Free";
    if (skuText) {
        const label = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toDisplayLabel"])(skuText);
        return label ? `Copilot ${label}` : "GitHub Copilot";
    }
    if (planText) {
        const label = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toDisplayLabel"])(planText);
        return label ? `Copilot ${label}` : "GitHub Copilot";
    }
    return "GitHub Copilot";
}
}),
"[project]/open-sse/services/usage/crof.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCrofUsage",
    ()=>getCrofUsage
]);
/**
 * usage/crof.ts — CrofAI usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the CrofAI family —
 * the /usage_api/ endpoint config and the getCrofUsage fetcher that surfaces the
 * daily `usable_requests` subscription bucket plus the USD `credits` balance as
 * separate quotas. Depends only on the sibling scalar/quota leaves — no host
 * coupling — so it lives as a co-located provider leaf. usage.ts imports
 * getCrofUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
;
// Quota / usage upstream URLs (overridable for testing or relays).
const CROF_USAGE_URL = process.env.OMNIROUTE_CROF_USAGE_URL ?? "https://crof.ai/usage_api/";
async function getCrofUsage(apiKey) {
    if (!apiKey) {
        return {
            message: "CrofAI API key not available. Add a key to view usage."
        };
    }
    let response;
    try {
        response = await fetch(CROF_USAGE_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json"
            }
        });
    } catch (error) {
        return {
            message: `CrofAI connected. Unable to fetch usage: ${error.message}`
        };
    }
    const rawText = await response.text();
    if (response.status === 401 || response.status === 403) {
        return {
            message: "CrofAI connected. The API key was rejected by /usage_api/."
        };
    }
    if (!response.ok) {
        return {
            message: `CrofAI connected. /usage_api/ returned HTTP ${response.status}.`
        };
    }
    let payload = {};
    if (rawText) {
        try {
            payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(JSON.parse(rawText));
        } catch  {
            return {
                message: "CrofAI connected. Unable to parse /usage_api/ response."
            };
        }
    }
    const usableRequestsRaw = payload["usable_requests"];
    const usableRequests = usableRequestsRaw === null || usableRequestsRaw === undefined ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(usableRequestsRaw, 0);
    const credits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(payload["credits"], 0);
    const quotas = {};
    if (usableRequests !== null) {
        // CrofAI's /usage_api/ returns only the remaining count; the daily
        // allotment is not exposed. CrofAI Pro plan = 1,000 requests/day per
        // their pricing page, so use that as the baseline total. If the user
        // is on a plan with a higher cap we widen the total to whatever they
        // currently report so we never compute a negative `used`.
        // Without this, total=0 makes the dashboard's percentage formula read
        // 0% (interpreted as "depleted" → red) even on a fresh bucket.
        const CROF_DAILY_BASELINE = 1000;
        const remaining = Math.max(0, usableRequests);
        const total = Math.max(CROF_DAILY_BASELINE, remaining);
        const used = Math.max(0, total - remaining);
        // CrofAI also does not return a reset timestamp and the docs only say
        // "requests left today". The Crof.ai dashboard shows the daily bucket
        // resetting at ~05:00 UTC (verified against the live countdown on
        // 2026-04-25), so synthesize the next 05:00 UTC instant to match.
        // Swap for a real field if Crof ever exposes one.
        const now = new Date();
        const RESET_HOUR_UTC = 5;
        const todayResetMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), RESET_HOUR_UTC);
        const nextResetMs = todayResetMs > now.getTime() ? todayResetMs : todayResetMs + 24 * 60 * 60 * 1000;
        const nextResetIso = new Date(nextResetMs).toISOString();
        quotas["Requests Today"] = {
            used,
            total,
            remaining,
            resetAt: nextResetIso,
            unlimited: false,
            displayName: `Requests Today: ${remaining} left`
        };
    }
    // Credits are an open balance — render as unlimited so the UI shows the
    // dollar value rather than a misleading 0/0 bar.
    quotas["Credits"] = {
        used: 0,
        total: 0,
        remaining: 0,
        resetAt: null,
        unlimited: true,
        displayName: `Credits: $${credits.toFixed(4)}`
    };
    return {
        quotas
    };
}
}),
"[project]/open-sse/services/usage/nanogpt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getNanoGptUsage",
    ()=>getNanoGptUsage
]);
/**
 * usage/nanogpt.ts — NanoGPT usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the NanoGPT family —
 * the subscription usage-API config and the getNanoGptUsage fetcher that reads
 * daily/weekly token + daily image limits for PRO accounts. Depends only on the
 * sibling scalar/quota leaves — no host coupling — so it lives as a co-located
 * provider leaf. usage.ts imports getNanoGptUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
const NANOGPT_CONFIG = {
    usageUrl: "https://nano-gpt.com/api/subscription/v1/usage"
};
async function getNanoGptUsage(apiKey) {
    if (!apiKey) {
        return {
            message: "NanoGPT API key not available. Add a key to view usage."
        };
    }
    try {
        const res = await fetch(NANOGPT_CONFIG.usageUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        if (!res.ok) {
            if (res.status === 401) return {
                message: "Invalid NanoGPT API key."
            };
            return {
                message: `NanoGPT quota API error (${res.status})`
            };
        }
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await res.json());
        const quotas = {};
        // active -> PRO, otherwise FREE
        const plan = data.active ? "PRO" : "FREE";
        if (data.active) {
            // 1. Tokens limit
            // dailyInputTokens if exists, else weeklyInputTokens
            let tokenQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.dailyInputTokens);
            let tokenLabel = "Daily Tokens";
            if (!tokenQuota.resetAt) {
                const weeklyQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.weeklyInputTokens);
                if (weeklyQuota.remaining !== undefined) {
                    tokenQuota = weeklyQuota;
                    tokenLabel = "Weekly Tokens";
                }
            }
            if (tokenQuota.remaining !== undefined) {
                const used = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(tokenQuota.used, 0);
                const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(tokenQuota.remaining, 0);
                const total = used + remaining;
                quotas[tokenLabel] = {
                    used,
                    total,
                    remaining,
                    remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(100 - (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(tokenQuota.percentUsed, 0) * 100),
                    resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(tokenQuota.resetAt),
                    unlimited: false
                };
            }
            // 2. Images limit
            const imageQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(data.dailyImages);
            if (imageQuota.remaining !== undefined) {
                const used = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(imageQuota.used, 0);
                const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(imageQuota.remaining, 0);
                const total = used + remaining;
                quotas["Daily Images"] = {
                    used,
                    total,
                    remaining,
                    remainingPercentage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampPercentage"])(100 - (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(imageQuota.percentUsed, 0) * 100),
                    resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(imageQuota.resetAt),
                    unlimited: false
                };
            }
            if (Object.keys(quotas).length === 0) {
                return {
                    plan,
                    message: "NanoGPT connected, but no active limits found."
                };
            }
        }
        return {
            plan,
            quotas
        };
    } catch (error) {
        return {
            message: `NanoGPT connected. Unable to fetch usage: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/qoder.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getQoderUsage",
    ()=>getQoderUsage,
    "parseQoderUserStatusUsage",
    ()=>parseQoderUserStatusUsage
]);
/**
 * usage/qoder.ts — Qoder usage fetcher + status parser.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Qoder family —
 * the /api/v3/user/status endpoint config, the plan-label prettifier, the pure
 * status→quotas mapper (parseQoderUserStatusUsage), and the getQoderUsage
 * fetcher that exchanges the PAT for a short-lived job token then reads the
 * status endpoint. Depends only on the sibling scalar/quota leaves +
 * resolveQoderJobToken + sanitizeErrorMessage — no host coupling — so it lives
 * as a co-located provider leaf. usage.ts imports getQoderUsage (dispatcher) +
 * re-exports parseQoderUserStatusUsage (named export + __testing, used by the
 * qoder-usage-quota suite). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCli$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/qoderCli.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/scalars.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
;
;
;
const QODER_USER_STATUS_URL = "https://openapi.qoder.sh/api/v3/user/status";
/** Human-readable plan label from Qoder's `PLAN_TIER_*` enum / `userTag`. */ function prettifyQoderPlan(planRaw, userTag) {
    const tag = String(userTag || "").trim();
    if (tag) return tag;
    const stripped = String(planRaw || "").trim().replace(/^PLAN_TIER_/i, "");
    return stripped ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toTitleCase"])(stripped) : "Qoder";
}
function parseQoderUserStatusUsage(status) {
    const userType = String(status.userType || "").trim().toLowerCase();
    const planLabel = prettifyQoderPlan(String(status.plan || ""), String(status.userTag || ""));
    const isExceeded = status.isQuotaExceeded === true;
    const quotaNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(status.quota, 0);
    const resetAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(status.nextResetAt);
    // Team/enterprise seats draw from a pooled org quota rather than a per-user
    // counter, so `quota: 0` there means "pooled", not "exhausted".
    const isPooled = userType === "teams" || userType === "enterprise";
    const quotas = {};
    if (isExceeded) {
        // Genuinely out of quota — remainingPercentage 0 lets routing skip it until reset.
        quotas["Quota"] = {
            used: quotaNum,
            total: quotaNum,
            remaining: 0,
            remainingPercentage: 0,
            resetAt,
            unlimited: false,
            displayName: "Quota exceeded"
        };
    } else if (isPooled || quotaNum <= 0) {
        // Pooled/unlimited seat — MUST report 100% remaining. The quota→routing
        // conversion (src/domain/quotaCache.ts) ignores `unlimited` and would treat a
        // `total: 0` window as 0% (i.e. exhausted), wrongly 429-ing every request.
        quotas["Plan"] = {
            used: 0,
            total: 0,
            remaining: 0,
            remainingPercentage: 100,
            resetAt,
            unlimited: true,
            displayName: `${planLabel} plan · pooled quota`
        };
    } else {
        quotas["Requests"] = {
            used: 0,
            total: quotaNum,
            remaining: quotaNum,
            remainingPercentage: 100,
            resetAt,
            unlimited: false,
            displayName: `${quotaNum} requests left`
        };
    }
    return {
        plan: planLabel,
        quotas
    };
}
async function getQoderUsage(apiKey, providerSpecificData) {
    const token = (apiKey || "").trim() || String(providerSpecificData?.qoderPat || "").trim();
    if (!token) {
        return {
            message: "Qoder connected. Add a Personal Access Token to view quota."
        };
    }
    let jobToken;
    try {
        jobToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCli$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveQoderJobToken"])(token);
    } catch  {
        return {
            message: "Qoder connected. Unable to resolve a usage token."
        };
    }
    let response;
    try {
        response = await fetch(QODER_USER_STATUS_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jobToken}`,
                Accept: "application/json"
            },
            // @ts-ignore — AbortSignal.timeout is available on the Node runtime
            signal: AbortSignal.timeout(15000)
        });
    } catch (error) {
        return {
            message: `Qoder connected. Unable to fetch usage: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error.message)}`
        };
    }
    if (response.status === 401 || response.status === 403) {
        return {
            message: "Qoder connected. The token was rejected by the usage API — re-test the connection."
        };
    }
    if (!response.ok) {
        return {
            message: `Qoder connected. Usage API returned HTTP ${response.status}.`
        };
    }
    let status;
    try {
        status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$scalars$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecord"])(await response.json());
    } catch  {
        return {
            message: "Qoder connected. Unable to parse the usage response."
        };
    }
    return parseQoderUserStatusUsage(status);
}
}),
"[project]/open-sse/services/usage/opencode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getOpencodeUsage",
    ()=>getOpencodeUsage
]);
/**
 * usage/opencode.ts — OpenCode / OpenCode Zen usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the OpenCode family —
 * delegates to the dedicated opencodeQuotaFetcher and shapes the triple-window
 * ($12/5h, $30/wk, $60/mo) result into the standard `{ plan, quotas }` usage
 * response expected by the limits page. Depends only on the sibling scalar/quota
 * leaves + fetchOpencodeQuota + sanitizeErrorMessage — no host coupling — so it
 * lives as a co-located provider leaf. usage.ts imports getOpencodeUsage
 * (dispatcher + __testing). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/opencodeQuotaFetcher.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function getOpencodeUsage(connectionId, apiKey) {
    if (!apiKey) {
        return {
            message: "OpenCode API key not available. Add a key to view usage."
        };
    }
    try {
        const quota = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$opencodeQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchOpencodeQuota"])(connectionId, {
            apiKey
        });
        if (!quota) {
            return {
                message: "OpenCode connected. Unable to fetch quota data."
            };
        }
        const { window5h, windowWeekly, windowMonthly, limitReached } = quota;
        const quotas = {};
        // $12 / 5-hour rolling window
        quotas["window_5h"] = {
            used: window5h.percentUsed * 12,
            total: 12,
            remaining: (1 - window5h.percentUsed) * 12,
            remainingPercentage: (1 - window5h.percentUsed) * 100,
            resetAt: window5h.resetAt,
            unlimited: false,
            displayName: "$12 / 5-hour",
            currency: "USD"
        };
        // $30 / weekly window
        quotas["window_weekly"] = {
            used: windowWeekly.percentUsed * 30,
            total: 30,
            remaining: (1 - windowWeekly.percentUsed) * 30,
            remainingPercentage: (1 - windowWeekly.percentUsed) * 100,
            resetAt: windowWeekly.resetAt,
            unlimited: false,
            displayName: "$30 / week",
            currency: "USD"
        };
        // $60 / monthly window
        quotas["window_monthly"] = {
            used: windowMonthly.percentUsed * 60,
            total: 60,
            remaining: (1 - windowMonthly.percentUsed) * 60,
            remainingPercentage: (1 - windowMonthly.percentUsed) * 100,
            resetAt: windowMonthly.resetAt,
            unlimited: false,
            displayName: "$60 / month",
            currency: "USD"
        };
        return {
            plan: "OpenCode Go",
            quotas,
            limitReached
        };
    } catch (error) {
        return {
            message: `OpenCode error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage/deepseek.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getDeepseekUsage",
    ()=>getDeepseekUsage
]);
/**
 * usage/deepseek.ts — DeepSeek usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the DeepSeek family —
 * delegates to the dedicated deepseekQuotaFetcher and shapes the balance result
 * into the standard `{ plan, quotas }` usage response (all balances surfaced as
 * credits-style entries). Depends only on the sibling scalar/quota leaves +
 * fetchDeepseekQuota — no host coupling — so it lives as a co-located provider
 * leaf. usage.ts imports getDeepseekUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/deepseekQuotaFetcher.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function getDeepseekUsage(connectionId, apiKey) {
    try {
        const connection = {
            apiKey
        };
        const quota = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$deepseekQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchDeepseekQuota"])(connectionId, connection);
        if (!quota) {
            return {
                message: "DeepSeek API key not available. Add a key to view usage."
            };
        }
        const deepseekQuota = quota;
        const { balances, isAvailable, limitReached } = deepseekQuota;
        const quotas = {};
        // Show all balances as credits-style entries (e.g., credits_usd, credits_cny)
        // The UI will display them as "🪙 Balance (USD) $50.00"
        for (const balanceInfo of balances){
            const key = `credits_${balanceInfo.currency.toLowerCase()}`;
            quotas[key] = {
                used: 0,
                total: 0,
                remaining: balanceInfo.balance,
                remainingPercentage: 100,
                resetAt: null,
                unlimited: true,
                currency: balanceInfo.currency,
                grantedBalance: balanceInfo.grantedBalance,
                toppedUpBalance: balanceInfo.toppedUpBalance
            };
        }
        const plan = isAvailable ? "DeepSeek" : "DeepSeek (Insufficient Balance)";
        return {
            plan,
            quotas,
            isAvailable,
            limitReached
        };
    } catch (error) {
        return {
            message: `DeepSeek error: ${error.message}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage/bailian.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getBailianCodingPlanUsage",
    ()=>getBailianCodingPlanUsage
]);
/**
 * usage/bailian.ts — Bailian (Alibaba Token Plan) usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Bailian family —
 * delegates to the dedicated bailianQuotaFetcher and shapes the triple-window
 * (5h, weekly, monthly) worst-case quota into the standard usage response.
 * Depends only on the sibling scalar/quota leaves + fetchBailianQuota — no host
 * coupling — so it lives as a co-located provider leaf. usage.ts imports
 * getBailianCodingPlanUsage (dispatcher). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/bailianQuotaFetcher.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function getBailianCodingPlanUsage(connectionId, apiKey, providerSpecificData) {
    try {
        const connection = {
            apiKey,
            providerSpecificData
        };
        const quota = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bailianQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchBailianQuota"])(connectionId, connection);
        if (!quota) {
            return {
                message: "Alibaba Token Plan connected. Unable to fetch quota."
            };
        }
        const bailianQuota = quota;
        const used = bailianQuota.used;
        const total = bailianQuota.total;
        const remaining = Math.max(0, total - used);
        const remainingPercentage = Math.round(remaining);
        return {
            plan: "Alibaba Token Plan",
            used,
            total,
            remaining,
            remainingPercentage,
            resetAt: bailianQuota.resetAt,
            unlimited: false,
            displayName: "Alibaba Token Plan"
        };
    } catch (error) {
        return {
            message: `Alibaba Token Plan error: ${error.message}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage/vertex.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * usage/vertex.ts — Vertex AI self-tracked spend usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Vertex family —
 * Vertex AI exposes no usage/quota API for an API key or Service Account, so
 * OmniRoute self-tracks the USD it spent through the connection (summed from
 * usage_history via getConnectionSpendUsdSinceAdded) and surfaces a `spend`
 * quota entry plus a `$X used · N requests` message. Depends only on the
 * sibling scalar/quota leaves + the usageStats dynamic import — no host
 * coupling — so it lives as a co-located provider leaf. usage.ts imports
 * getVertexUsage (dispatcher + __testing). Behavior-preserving move.
 */ __turbopack_context__.s([
    "getVertexUsage",
    ()=>getVertexUsage
]);
async function getVertexUsage(connectionId, provider) {
    if (!connectionId) {
        return {
            message: "Vertex connected. Connection id unavailable for usage tracking."
        };
    }
    try {
        const { getConnectionSpendUsdSinceAdded } = await __turbopack_context__.A("[project]/src/lib/usage/usageStats.ts [app-route] (ecmascript, async loader)");
        const { costUsd, requests } = await getConnectionSpendUsdSinceAdded(provider, connectionId);
        const spend = {
            used: Number(costUsd.toFixed(6)),
            displayName: "Spend (USD)",
            quotaSource: "localUsageHistory",
            resetAt: null,
            unlimited: false
        };
        if (requests === 0) {
            return {
                plan: "Vertex AI",
                message: "Vertex connected. No usage recorded through OmniRoute yet for this account.",
                quotas: {
                    spend
                }
            };
        }
        const costStr = costUsd >= 1 ? costUsd.toFixed(2) : costUsd.toFixed(4);
        return {
            plan: "Vertex AI",
            message: `$${costStr} used since this account was added \u00b7 ${requests} request${requests === 1 ? "" : "s"}`,
            quotas: {
                spend
            }
        };
    } catch (error) {
        return {
            message: `Vertex usage tracking error: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/xiaomi-mimo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getXiaomiMimoUsage",
    ()=>getXiaomiMimoUsage
]);
/**
 * usage/xiaomi-mimo.ts — Xiaomi MiMo self-tracked monthly quota fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the Xiaomi MiMo family —
 * Xiaomi exposes plan usage only behind the console session cookie (the API key
 * cannot reach the `tokenPlan/usage` endpoint), so OmniRoute self-tracks the
 * tokens it routed to the connection in the current UTC month (from usage_history)
 * and compares them to the known Token Plan monthly limit. Depends only on the
 * sibling scalar/quota leaves + the usageStats dynamic import — no host coupling
 * — so it lives as a co-located provider leaf. usage.ts imports getXiaomiMimoUsage
 * (dispatcher + __testing). Behavior-preserving move.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
// Xiaomi MiMo Token Plan monthly limit (tokens). Keep in sync with the
// "xiaomi-mimo" preset in src/lib/quota/planRegistry.ts.
const XIAOMI_MIMO_MONTHLY_TOKEN_LIMIT = 4_100_000_000;
async function getXiaomiMimoUsage(connectionId) {
    if (!connectionId) {
        return {
            message: "Xiaomi MiMo: connection id unavailable for self-tracked quota."
        };
    }
    try {
        const { getMonthlyProviderTokensForConnection } = await __turbopack_context__.A("[project]/src/lib/usage/usageStats.ts [app-route] (ecmascript, async loader)");
        const used = getMonthlyProviderTokensForConnection("xiaomi-mimo", connectionId);
        const total = XIAOMI_MIMO_MONTHLY_TOKEN_LIMIT;
        const now = new Date();
        const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
        return {
            plan: "Xiaomi MiMo Token Plan (OmniRoute-tracked)",
            quotas: {
                monthly: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQuotaFromUsage"])(used, total, resetAt)
            }
        };
    } catch (error) {
        return {
            message: `Xiaomi MiMo self-tracked usage error: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/xai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * usage/xai.ts — xAI (Grok) self-tracked cumulative usage fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the xAI family —
 * xAI has no public per-account quota API (the billing console at console.x.ai
 * requires a session cookie, not an API key), so — exactly like the Xiaomi MiMo
 * self-track pattern — OmniRoute sums the tokens it itself routed to this
 * connection (from `usage_history`) instead of calling an upstream endpoint.
 * Unlike Xiaomi MiMo, xAI has no fixed monthly cap, so the aggregate is reported
 * as `unlimited: true` with `remaining: 100`. Depends only on the sibling
 * scalar/quota leaves + the usageStats dynamic import — no host coupling — so it
 * lives as a co-located provider leaf. usage.ts imports getXaiUsage (dispatcher
 * + __testing). Behavior-preserving move.
 */ __turbopack_context__.s([
    "getXaiUsage",
    ()=>getXaiUsage
]);
async function getXaiUsage(connectionId) {
    if (!connectionId) {
        return {
            message: "xAI: connection id unavailable for self-tracked usage."
        };
    }
    try {
        const { getMonthlyProviderTokensForConnection } = await __turbopack_context__.A("[project]/src/lib/usage/usageStats.ts [app-route] (ecmascript, async loader)");
        const used = getMonthlyProviderTokensForConnection("xai", connectionId);
        return {
            plan: "xAI / Grok (OmniRoute-tracked)",
            quotas: {
                monthly: {
                    used,
                    total: 0,
                    remaining: 100,
                    remainingPercentage: 100,
                    resetAt: null,
                    unlimited: true
                }
            }
        };
    } catch (error) {
        return {
            message: `xAI self-tracked usage error: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/xaiOauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getXaiOauthUsage",
    ()=>getXaiOauthUsage
]);
/**
 * usage/xaiOauth.ts — xAI OAuth (Grok) weekly quota fetcher.
 *
 * Extracted from services/usage.ts (god-file decomposition): the xAI OAuth
 * variant uses a live billing endpoint (`cli-chat-proxy.grok.com/v1/billing`)
 * with the connection's OAuth access token, falling back to OmniRoute's own
 * self-tracked token totals when the live quota is unavailable.
 *
 * `creditUsagePercent` is percent **used** (0–100), matching grok.com Usage.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
;
async function getXaiOauthUsage(connectionId, accessToken, connection) {
    if (!connectionId) {
        return {
            message: "xAI OAuth: connection id unavailable."
        };
    }
    try {
        const { fetchXaiOauthQuota } = await __turbopack_context__.A("[project]/open-sse/services/xaiOauthQuotaFetcher.ts [app-route] (ecmascript, async loader)");
        const live = await fetchXaiOauthQuota(connectionId, {
            ...connection || {},
            accessToken: accessToken || connection?.accessToken,
            credentials: {
                accessToken: accessToken || connection?.accessToken
            }
        });
        if (live && typeof live.percentUsed === "number") {
            // QuotaInfo.percentUsed is a 0–1 fraction used
            const usedPct = Math.round(Math.min(100, Math.max(0, live.percentUsed * 100)));
            return {
                plan: "xAI OAuth (Grok) · Weekly",
                quotas: {
                    weekly: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQuotaFromUsage"])(usedPct, 100, live.resetAt ?? null)
                }
            };
        }
    } catch (error) {
        console.warn("[usage] xai-oauth live quota failed, falling back to self-track:", error?.message || error);
    }
    try {
        const { getMonthlyProviderTokensForConnection } = await __turbopack_context__.A("[project]/src/lib/usage/usageStats.ts [app-route] (ecmascript, async loader)");
        const used = getMonthlyProviderTokensForConnection("xai-oauth", connectionId) || getMonthlyProviderTokensForConnection("xao", connectionId) || 0;
        return {
            plan: "xAI OAuth (Grok) · OmniRoute-tracked",
            message: "Live weekly quota unavailable; showing OmniRoute-routed token totals only.",
            quotas: {
                monthly: {
                    used,
                    total: 0,
                    remaining: 100,
                    remainingPercentage: 100,
                    resetAt: null,
                    unlimited: true
                }
            }
        };
    } catch (error) {
        return {
            message: `xAI OAuth usage error: ${error.message}`
        };
    }
}
}),
"[project]/open-sse/services/usage/grokCli.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__testing",
    ()=>__testing,
    "getGrokCliUsage",
    ()=>getGrokCliUsage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/grokBuild.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$grokBilling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/grokBilling.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const GROK_BUILD_FETCH_TIMEOUT_MS = 10_000;
const GROK_BUILD_MAX_RESPONSE_BYTES = 256 * 1024;
const optionalNonEmptyString = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().trim().min(1).max(256).optional().nullable().catch(undefined);
const optionalPercent = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().finite().min(0).max(100).optional().nullable().catch(undefined);
const centSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    val: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().finite().int().safe().optional()
}).passthrough().transform(({ val })=>({
        val: Math.abs(val ?? 0)
    }));
const userSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    userId: optionalNonEmptyString,
    subscriptionTier: optionalNonEmptyString
}).passthrough();
const productUsageSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    product: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().trim().min(1).max(128),
    usagePercent: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().finite().min(0).max(100)
}).passthrough();
const productUsageListSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).max(100).transform((items)=>items.flatMap((item)=>{
        const parsed = productUsageSchema.safeParse(item);
        return parsed.success ? [
            parsed.data
        ] : [];
    }));
const currentPeriodSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    type: optionalNonEmptyString,
    start: optionalNonEmptyString,
    end: optionalNonEmptyString
}).passthrough();
const billingConfigSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    creditUsagePercent: optionalPercent,
    currentPeriod: currentPeriodSchema.optional().nullable().catch(undefined),
    productUsage: productUsageListSchema.optional().nullable().catch(undefined),
    prepaidBalance: centSchema.optional().nullable().catch(undefined)
}).passthrough();
const billingSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    config: billingConfigSchema.optional().nullable().catch(undefined)
}).passthrough();
const autoTopUpRuleSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    minBeforeHittingSl: centSchema.optional().nullable().catch(undefined),
    topupAmount: centSchema.optional().nullable().catch(undefined),
    maxAmountPerMonth: centSchema.optional().nullable().catch(undefined)
}).passthrough();
const autoTopUpSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    rule: autoTopUpRuleSchema.optional().nullable().catch(undefined)
}).passthrough();
function finitePercent(value) {
    return Math.max(0, Math.min(100, value));
}
function normalizeProduct(value) {
    const compact = value.normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (compact === "grokbuild" || compact === "productgrokbuild") {
        return {
            key: "grok_build",
            displayName: "Grok Build"
        };
    }
    const slug = value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return {
        key: slug || "unknown",
        displayName: value
    };
}
function percentageQuota(used, resetAt, displayName) {
    const normalizedUsed = finitePercent(used);
    const remaining = 100 - normalizedUsed;
    return {
        ...displayName ? {
            displayName
        } : {},
        used: normalizedUsed,
        total: 100,
        remaining,
        remainingPercentage: remaining,
        resetAt,
        isPercentageOnly: true
    };
}
async function readBoundedJson(response, schema) {
    if (!response.ok) return null;
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > GROK_BUILD_MAX_RESPONSE_BYTES) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks = [];
    let size = 0;
    while(true){
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > GROK_BUILD_MAX_RESPONSE_BYTES) {
            await reader.cancel();
            return null;
        }
        chunks.push(value);
    }
    try {
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks){
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return schema.parse(JSON.parse(new TextDecoder().decode(bytes)));
    } catch  {
        return null;
    }
}
async function fetchGrokBuildJson(path, headers, schema) {
    try {
        const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_PROXY_BASE_URL"]}${path}`, {
            method: "GET",
            headers,
            redirect: "error",
            signal: AbortSignal.timeout(GROK_BUILD_FETCH_TIMEOUT_MS)
        });
        return await readBoundedJson(response, schema);
    } catch  {
        return null;
    }
}
function buildProductQuotas(productUsage, resetAt) {
    const quotas = {};
    for (const product of productUsage ?? []){
        const normalized = normalizeProduct(product.product);
        const baseKey = `product_${normalized.key}`;
        let key = baseKey;
        let suffix = 2;
        while(key in quotas){
            key = `${baseKey}_${suffix++}`;
        }
        quotas[key] = percentageQuota(product.usagePercent, resetAt, normalized.displayName);
    }
    return quotas;
}
function buildAutoTopUp(ruleResponse) {
    const rule = ruleResponse?.rule;
    if (!rule) return {
        available: false
    };
    const enabled = rule.enabled === true;
    return {
        available: true,
        enabled,
        ...enabled && rule.minBeforeHittingSl ? {
            thresholdMinorUnits: rule.minBeforeHittingSl.val
        } : {},
        ...enabled && rule.topupAmount ? {
            amountMinorUnits: rule.topupAmount.val
        } : {},
        ...enabled && rule.maxAmountPerMonth ? {
            maxMonthlyMinorUnits: rule.maxAmountPerMonth.val
        } : {}
    };
}
async function getGrokCliUsage(accessToken) {
    if (!accessToken) {
        return {
            message: "Grok Build usage unavailable"
        };
    }
    const baseHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGrokBuildModelsHeaders"])({
        token: accessToken
    });
    const user = await fetchGrokBuildJson("/user?include=subscription", baseHeaders, userSchema);
    const userId = user?.userId || null;
    const tier = user?.subscriptionTier || null;
    const billing = await fetchGrokBuildJson("/billing?format=credits", userId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGrokBuildModelsHeaders"])({
        token: accessToken,
        userId
    }) : baseHeaders, billingSchema);
    if (!billing?.config) {
        return {
            ...tier ? {
                plan: tier
            } : {},
            message: "Grok Build billing status unavailable"
        };
    }
    const config = billing.config;
    const resetAt = config.currentPeriod?.end || null;
    const quotas = {};
    if (config.creditUsagePercent != null) {
        quotas.weekly = percentageQuota(config.creditUsagePercent, resetAt);
    }
    Object.assign(quotas, buildProductQuotas(config.productUsage, resetAt));
    const autoTopUpResponse = userId ? await fetchGrokBuildJson("/auto-topup-rule", (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$grokBuild$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGrokBuildModelsHeaders"])({
        token: accessToken,
        userId
    }), autoTopUpSchema) : null;
    return {
        quotas,
        ...tier ? {
            plan: tier
        } : {},
        billing: {
            currency: "USD",
            ...config.prepaidBalance ? {
                extraCreditsMinorUnits: config.prepaidBalance.val
            } : {},
            autoTopUp: buildAutoTopUp(autoTopUpResponse),
            additionalCreditsUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$grokBilling$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GROK_BUILD_ADDITIONAL_CREDITS_URL"]
        }
    };
}
const __testing = {
    billingSchema,
    userSchema,
    autoTopUpSchema,
    readBoundedJson,
    networkPolicy: {
        method: "GET",
        redirect: "error",
        timeoutMs: GROK_BUILD_FETCH_TIMEOUT_MS,
        maxResponseBytes: GROK_BUILD_MAX_RESPONSE_BYTES
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/usage/firecrawl.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getFirecrawlUsage",
    ()=>getFirecrawlUsage
]);
/**
 * usage/firecrawl.ts — Firecrawl team credit usage for Provider Limits.
 *
 * GET /v2/team/credit-usage via firecrawlQuotaFetcher; shapes remaining/plan
 * credits into the standard `{ plan, quotas }` response.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$firecrawlQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/firecrawlQuotaFetcher.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/usage/quota.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$firecrawlQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$firecrawlQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function createFirecrawlPlanQuota(q) {
    if (q.overPlan) {
        return {
            used: 0,
            total: q.planCredits,
            remaining: q.remainingCredits,
            remainingPercentage: q.planCredits > 0 ? q.remainingCredits / q.planCredits * 100 : 100,
            resetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(q.resetAt),
            unlimited: false,
            extraCreditsInferred: q.extraCreditsInferred,
            overPlan: true
        };
    }
    return {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2f$quota$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQuotaFromUsage"])(q.used, q.total, q.resetAt),
        extraCreditsInferred: 0,
        overPlan: false
    };
}
async function getFirecrawlUsage(connectionId, apiKey, connection) {
    if (!connectionId) {
        return {
            message: "Firecrawl: connection id unavailable."
        };
    }
    const customBase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$firecrawlQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFirecrawlBaseUrl"])(connection);
    if (customBase) {
        return {
            plan: "Firecrawl · Self-Hosted Local",
            quotas: {},
            message: `Connected to self-hosted Firecrawl instance (${customBase})`
        };
    }
    try {
        const live = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$firecrawlQuotaFetcher$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchFirecrawlQuota"])(connectionId, connection);
        if (!live) {
            return {
                message: "Firecrawl API key not available or credit usage unavailable."
            };
        }
        const q = live;
        const monthly = createFirecrawlPlanQuota(q);
        return {
            plan: "Firecrawl · Monthly credits",
            quotas: {
                monthly
            },
            remainingCredits: q.remainingCredits,
            planCredits: q.planCredits,
            extraCreditsInferred: q.extraCreditsInferred,
            overPlan: q.overPlan,
            limitReached: q.limitReached
        };
    } catch (error) {
        return {
            message: `Firecrawl usage error: ${error.message}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_usage_1oxtxpr._.js.map