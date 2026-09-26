(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hasFixedQuotaOrder",
    ()=>hasFixedQuotaOrder,
    "parseQuotaData",
    ()=>parseQuotaData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [app-client] (ecmascript)");
;
;
const GLM_QUOTA_ORDER = {
    session: 0,
    weekly: 1,
    mcp_monthly: 2
};
const CODEX_QUOTA_ORDER = {
    session: 0,
    weekly: 1,
    gpt_5_3_codex_spark_session: 2,
    gpt_5_3_codex_spark_weekly: 3,
    banked_reset_credits: 4
};
const GLM_FAMILY_PROVIDERS = [
    "glm",
    "glm-cn",
    "glmt",
    "opencode-go"
];
function hasFixedQuotaOrder(providerId) {
    const id = String(providerId || "").toLowerCase();
    return id === "codex" || GLM_FAMILY_PROVIDERS.includes(id);
}
function quotaEntries(data) {
    return data?.quotas && typeof data.quotas === "object" ? Object.entries(data.quotas) : [];
}
function isUnlimitedEmpty(quota) {
    return Boolean(quota?.unlimited && (!quota?.total || quota.total <= 0));
}
function isPastResetWindow(resetAt) {
    if (!resetAt) return false;
    const resetTime = typeof resetAt === "number" ? resetAt : typeof resetAt === "string" ? Date.parse(resetAt) : NaN;
    return Number.isFinite(resetTime) && Date.now() >= resetTime;
}
function getResetAdjustedQuota(quota) {
    const usedRaw = Number(quota?.used || 0);
    const totalRaw = Number(quota?.total || 0);
    const total = Number.isFinite(totalRaw) ? totalRaw : 0;
    const remainingRaw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safePercentage"])(quota?.remainingPercentage);
    const hasPendingUsage = usedRaw > 0 || remainingRaw !== undefined && remainingRaw < 100;
    const staleAfterReset = isPastResetWindow(quota?.resetAt || null) && hasPendingUsage;
    return {
        staleAfterReset,
        total,
        used: staleAfterReset ? 0 : usedRaw,
        remainingPercentage: staleAfterReset && total > 0 ? 100 : remainingRaw
    };
}
function normalizeQuotaEntry(name, quota = {}, extras = {}) {
    const adjusted = getResetAdjustedQuota(quota);
    const remaining = Number(quota?.remaining);
    return {
        name,
        used: Number.isFinite(adjusted.used) ? adjusted.used : 0,
        total: adjusted.total,
        ...Number.isFinite(remaining) ? {
            remaining
        } : {},
        resetAt: quota?.resetAt || null,
        staleAfterReset: adjusted.staleAfterReset,
        ...adjusted.remainingPercentage !== undefined ? {
            remainingPercentage: adjusted.remainingPercentage
        } : {},
        ...quota?.extraCreditsInferred !== undefined ? {
            extraCreditsInferred: Number(quota.extraCreditsInferred) || 0
        } : {},
        ...quota?.overPlan !== undefined ? {
            overPlan: quota.overPlan === true
        } : {},
        ...quota?.displayName !== undefined ? {
            displayName: String(quota.displayName)
        } : {},
        ...quota?.isPercentageOnly !== undefined ? {
            isPercentageOnly: quota.isPercentageOnly === true
        } : {},
        ...extras
    };
}
function parseGeneric(data) {
    return quotaEntries(data).map(([name, quota])=>normalizeQuotaEntry(name, quota));
}
function parseGithub(data) {
    return quotaEntries(data).filter(([, quota])=>!isUnlimitedEmpty(quota)).map(([name, quota])=>normalizeQuotaEntry(name, quota));
}
function parseGlmFamily(data) {
    return quotaEntries(data).map(([name, quota])=>normalizeQuotaEntry(name, quota, {
            displayName: quota?.displayName,
            details: Array.isArray(quota?.details) ? quota.details : undefined,
            isPercentageOnly: Number(quota?.total || 0) === 100 && quota?.remainingPercentage !== undefined
        }));
}
function buildCreditsQuota(name, remaining, remainingPercentage, extra = {}) {
    return {
        name,
        used: 0,
        total: 0,
        remaining,
        resetAt: null,
        unlimited: false,
        isCredits: true,
        remainingPercentage,
        creditCount: remaining,
        ...extra
    };
}
function parseAntigravityQuota(modelKey, quota) {
    if (modelKey === "credits") {
        const remaining = Number(quota?.remaining ?? 0);
        return buildCreditsQuota("credits", remaining, remaining > 50 ? 100 : remaining > 10 ? 60 : 20);
    }
    if (modelKey === "models" || isUnlimitedEmpty(quota)) return null;
    return normalizeQuotaEntry(modelKey, quota, {
        modelKey,
        isPercentageOnly: quota?.fractionReported === true,
        ...quota?.quotaSource ? {
            quotaSource: quota.quotaSource
        } : {},
        ...quota?.fractionReported !== undefined ? {
            fractionReported: quota.fractionReported
        } : {}
    });
}
function parseAntigravity(data) {
    return quotaEntries(data).map(([modelKey, quota])=>parseAntigravityQuota(modelKey, quota)).filter(Boolean);
}
function buildBankedResetCreditsQuota(count) {
    return {
        name: "banked_reset_credits",
        used: 0,
        total: 0,
        remaining: count,
        resetAt: null,
        unlimited: false,
        isResetCredits: true,
        remainingPercentage: 100,
        creditCount: count
    };
}
function parseCodex(data) {
    const quotas = quotaEntries(data).map(([quotaType, quota])=>normalizeQuotaEntry(quotaType, quota, {
            displayName: quota?.displayName,
            isPercentageOnly: true
        }));
    const bankedResetCredits = Number(data?.bankedResetCredits);
    if (Number.isFinite(bankedResetCredits) && bankedResetCredits > 0) {
        quotas.push(buildBankedResetCreditsQuota(bankedResetCredits));
    }
    return quotas;
}
function buildClaudeExtraUsageQuota(extraUsage) {
    const monthlyLimit = Number(extraUsage?.monthly_limit ?? 0);
    const usedCredits = Number(extraUsage?.used_credits ?? 0);
    const utilization = Number(extraUsage?.utilization ?? 0);
    const remainingPercentage = Number.isFinite(utilization) ? Math.max(0, 100 - utilization) : undefined;
    const remaining = Number.isFinite(monthlyLimit) ? Math.max(0, monthlyLimit - usedCredits) : 0;
    return buildCreditsQuota("extra_usage", remaining, remainingPercentage ?? 100, {
        used: Number.isFinite(usedCredits) ? usedCredits : 0,
        total: Number.isFinite(monthlyLimit) ? monthlyLimit : 0,
        currency: extraUsage?.currency
    });
}
// #6806: some Claude plans (e.g. "default_raven_enterprise") return no
// five_hour/seven_day utilization windows at all — only a credit-billing
// extraUsage block — so quotas can be {} while extraUsage still holds real,
// actionable usage data. Fold it in instead of falling back to "No quota data".
function parseClaude(data) {
    if (data?.message) return [
        {
            name: "error",
            used: 0,
            total: 0,
            resetAt: null,
            message: data.message
        }
    ];
    const quotas = quotaEntries(data).map(([name, quota])=>normalizeQuotaEntry(name, quota, {
            isPercentageOnly: true
        }));
    if (data?.extraUsage?.is_enabled) {
        quotas.push(buildClaudeExtraUsageQuota(data.extraUsage));
    }
    return quotas;
}
function parseDeepseekQuota(quotaKey, quota) {
    const match = quotaKey.match(/^credits(?:_([a-z]{3}))?$/);
    if (!match) return normalizeQuotaEntry(quotaKey, quota);
    const remaining = Number(quota?.remaining ?? 0);
    const currency = quota?.currency ?? (match[1] ? match[1].toUpperCase() : "USD");
    return buildCreditsQuota(currency, remaining, remaining > 20 ? 100 : remaining > 5 ? 60 : 20, {
        currency
    });
}
function parseDeepseek(data) {
    return quotaEntries(data).map(([quotaKey, quota])=>parseDeepseekQuota(quotaKey, quota));
}
function parseProviderQuotas(providerId, data) {
    if (providerId === "github") return parseGithub(data);
    if ([
        "glm",
        "glm-cn",
        "glmt",
        "opencode-go"
    ].includes(providerId)) return parseGlmFamily(data);
    if (providerId === "antigravity" || providerId === "agy") return parseAntigravity(data);
    if (providerId === "codex") return parseCodex(data);
    if (providerId === "claude") return parseClaude(data);
    if (providerId === "deepseek") return parseDeepseek(data);
    return parseGeneric(data);
}
function sortProviderModelOrder(provider, quotas) {
    const modelOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModelsByProviderId"])(provider);
    if (modelOrder.length === 0) return;
    const orderMap = new Map(modelOrder.map((m, i)=>[
            m.id,
            i
        ]));
    quotas.sort((a, b)=>(orderMap.get(a.modelKey || a.name) ?? 999) - (orderMap.get(b.modelKey || b.name) ?? 999));
}
function sortGlmOrder(providerId, quotas) {
    if (!GLM_FAMILY_PROVIDERS.includes(providerId)) return;
    quotas.sort((a, b)=>(GLM_QUOTA_ORDER[a.name] ?? 99) - (GLM_QUOTA_ORDER[b.name] ?? 99));
}
function sortCodexOrder(providerId, quotas) {
    if (providerId !== "codex") return;
    quotas.sort((a, b)=>(CODEX_QUOTA_ORDER[a.name] ?? 99) - (CODEX_QUOTA_ORDER[b.name] ?? 99));
}
function parseQuotaData(provider, data) {
    if (!data || typeof data !== "object") return [];
    const providerId = String(provider || "").toLowerCase();
    try {
        const normalizedQuotas = parseProviderQuotas(providerId, data);
        sortProviderModelOrder(provider, normalizedQuotas);
        sortGlmOrder(providerId, normalizedQuotas);
        sortCodexOrder(providerId, normalizedQuotas);
        return normalizedQuotas;
    } catch (error) {
        console.error(`Error parsing quota data for ${provider}:`, error);
        return [];
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STATUS_EMOJI",
    ()=>STATUS_EMOJI,
    "buildProviderLimitsResolvedPlans",
    ()=>buildProviderLimitsResolvedPlans,
    "buildProviderOptions",
    ()=>buildProviderOptions,
    "calculatePercentage",
    ()=>calculatePercentage,
    "collectHiddenQuotaModelIds",
    ()=>collectHiddenQuotaModelIds,
    "compareProviderGroups",
    ()=>compareProviderGroups,
    "compareQuotaConnections",
    ()=>compareQuotaConnections,
    "computeCanEditCutoff",
    ()=>computeCanEditCutoff,
    "computeCanRedeemResetCredit",
    ()=>computeCanRedeemResetCredit,
    "filterHiddenModelQuotas",
    ()=>filterHiddenModelQuotas,
    "filterQuotasByVisibility",
    ()=>filterQuotasByVisibility,
    "formatCountdown",
    ()=>formatCountdown,
    "formatQuotaLabel",
    ()=>formatQuotaLabel,
    "formatResetTime",
    ()=>formatResetTime,
    "getBarColor",
    ()=>getBarColor,
    "getHiddenQuotaRows",
    ()=>getHiddenQuotaRows,
    "getNextResetSummary",
    ()=>getNextResetSummary,
    "getQuotaRemainingPercentage",
    ()=>getQuotaRemainingPercentage,
    "getQuotaVisibilityKey",
    ()=>getQuotaVisibilityKey,
    "getStatusColor",
    ()=>getStatusColor,
    "getStatusEmoji",
    ()=>getStatusEmoji,
    "hasQuotaCutoffOverrides",
    ()=>hasQuotaCutoffOverrides,
    "isPercentageOnlyQuota",
    ()=>isPercentageOnlyQuota,
    "matchesProviderFilter",
    ()=>matchesProviderFilter,
    "normalizePlanTier",
    ()=>normalizePlanTier,
    "resolvePlanValue",
    ()=>resolvePlanValue,
    "shouldShowQuotaUsageCount",
    ()=>shouldShowQuotaUsageCount,
    "topQuotas",
    ()=>topQuotas,
    "worstStatus",
    ()=>worstStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-client] (ecmascript)");
;
;
const PROVIDER_PLAN_FALLBACKS = new Set([
    "claude code",
    "kimi coding",
    "kiro",
    "amazon q",
    "openai codex",
    "codex",
    "github copilot"
]);
const QUOTA_LABEL_MAP = {
    chat: "Chat",
    completions: "Completions",
    premium_interactions: "Premium",
    session: "Session",
    weekly: "Weekly",
    code_review: "Code Review",
    code_review_weekly: "Code Review Weekly",
    gpt_5_3_codex_spark_session: "GPT-5.3-Codex-Spark Session",
    gpt_5_3_codex_spark_weekly: "GPT-5.3-Codex-Spark Weekly",
    agentic_request: "Agentic",
    agentic_request_freetrial: "Agentic (Trial)",
    credits: "AI Credits",
    models: "Models",
    mcp_monthly: "Monthly",
    "search-prime": "Web Search",
    "web-reader": "Web Reader",
    zread: "Zread",
    "5 Hours Quota": "5 Hours",
    "Weekly Quota": "Weekly",
    "Monthly Tools": "Monthly Tools",
    tokens: "Tokens",
    time_limit: "Time Limit",
    banked_reset_credits: "Banked Reset Credits",
    gemini_weekly: "Gemini Weekly",
    claude_gpt_weekly: "Claude & GPT Weekly"
};
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function isClaudeOrganizationTypeLabel(value) {
    return /^default_claude(?:_ai)?$/i.test(value.trim());
}
function normalizePlanCandidate(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase() === "unknown") return null;
    if (PROVIDER_PLAN_FALLBACKS.has(trimmed.toLowerCase())) return null;
    if (isClaudeOrganizationTypeLabel(trimmed)) return null;
    return trimmed;
}
function escapeRegExpToken(token) {
    return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Match tier tokens as whole words (avoids MINIMAX → Max, APPROVE → Pro, etc.). */ function hasTierToken(upper, token) {
    const escaped = escapeRegExpToken(token.toUpperCase());
    const pattern = new RegExp(`(?:^|[^A-Z])${escaped}(?:[^A-Z]|$)`);
    return pattern.test(upper);
}
function toTitleCaseWords(value) {
    return value.split(/[\s_-]+/).filter(Boolean).map((part)=>part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function formatQuotaLabel(name) {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) return "";
    const mapped = QUOTA_LABEL_MAP[trimmed];
    if (mapped) return mapped;
    if (/^session\s*\(\d+[hm]\)$/i.test(trimmed)) {
        return "Session";
    }
    if (/^weekly\s*\(\d+d\)$/i.test(trimmed)) {
        return "Weekly";
    }
    const weeklyModelMatch = trimmed.match(/^weekly\s+(.+?)\s*\(\d+d\)$/i);
    if (weeklyModelMatch) {
        return `Weekly ${toTitleCaseWords(weeklyModelMatch[1])}`;
    }
    return trimmed;
}
function formatResetTime(date) {
    if (!date) return "-";
    try {
        const resetDate = typeof date === "string" ? new Date(date) : date;
        const now = new Date();
        const diffMs = resetDate - now;
        if (diffMs <= 0) return "-";
        const totalMinutes = Math.ceil(diffMs / (1000 * 60));
        // < 60 minutes: show only minutes
        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        }
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        // < 24 hours: show hours and minutes
        if (totalHours < 24) {
            return `${totalHours}h ${remainingMinutes}m`;
        }
        // >= 24 hours: show days, hours, and minutes
        const days = Math.floor(totalHours / 24);
        const remainingHours = totalHours % 24;
        return `${days}d ${remainingHours}h ${remainingMinutes}m`;
    } catch (error) {
        return "-";
    }
}
function getStatusColor(percentage) {
    if (percentage > 70) return "green";
    if (percentage >= 30) return "yellow";
    return "red"; // 0-29% including 0% (out of quota) - show red
}
function getStatusEmoji(percentage) {
    if (percentage > 70) return "🟢";
    if (percentage >= 30) return "🟡";
    return "🔴"; // 0-29% including 0% (out of quota) - show red
}
function calculatePercentage(used, total) {
    if (!total || total === 0) return 0;
    if (!used || used < 0) return 100;
    if (used >= total) return 0;
    return Math.round((total - used) / total * 100);
}
function resolvePlanValue(plan, providerSpecificData, providerId) {
    const livePlan = normalizePlanCandidate(plan);
    if (String(providerId || "").toLowerCase() === "grok-cli") return livePlan || null;
    const psd = toRecord(providerSpecificData);
    const persistedCandidates = [
        psd.workspacePlanType,
        psd.plan,
        psd.subscriptionTier,
        psd.subscription,
        psd.tier,
        psd.accountTier,
        // Claude OAuth bootstrap: rate_limit_tier has the Max 5x/20x multiplier.
        psd.organizationRateLimitTier,
        psd.rateLimitTier,
        psd.organizationType,
        // Codex OAuth bootstrap: chatgpt_plan_type is captured at import time
        // (src/lib/oauth/services/codexImport.ts) and is the only source of the
        // plan when the live Codex usage endpoint omits plan_type/planType (the
        // usage service then reports the literal string "unknown" — see
        // open-sse/services/usage/codex.ts).
        psd.chatgptPlanType
    ];
    if (livePlan && normalizePlanTier(livePlan).key !== "free") {
        return livePlan;
    }
    for (const candidate of persistedCandidates){
        const normalized = normalizePlanCandidate(candidate);
        if (normalized) return normalized;
    }
    return livePlan || null;
}
function buildProviderLimitsResolvedPlans(connections, quotaData) {
    const out = {};
    for (const conn of connections){
        out[conn.id] = resolvePlanValue(quotaData[conn.id]?.plan, conn.providerSpecificData, conn.provider);
    }
    return out;
}
function unknownPlanTier(raw = null) {
    return {
        key: "unknown",
        label: "Unknown",
        variant: "default",
        rank: 0,
        raw
    };
}
function formatUnknownPlanLabel(raw) {
    return raw.toLowerCase().split(/[\s_-]+/).map((part)=>part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function matchClaudePlanTier(raw, upper) {
    const match = upper.match(/(?:DEFAULT_)?CLAUDE_(MAX|PRO|TEAM|ENTERPRISE|FREE)(?:_(\d+X))?/);
    if (!match) return null;
    const multiplier = match[2] ? ` ${match[2].toLowerCase()}` : "";
    const tiers = {
        MAX: {
            key: "ultra",
            label: `Max${multiplier}`,
            variant: "success",
            rank: 4,
            raw
        },
        PRO: {
            key: "pro",
            label: "Pro",
            variant: "success",
            rank: 3,
            raw
        },
        TEAM: {
            key: "team",
            label: "Team",
            variant: "info",
            rank: 6,
            raw
        },
        ENTERPRISE: {
            key: "enterprise",
            label: "Enterprise",
            variant: "info",
            rank: 7,
            raw
        },
        FREE: {
            key: "free",
            label: "Free",
            variant: "default",
            rank: 1,
            raw
        }
    };
    return tiers[match[1]];
}
function matchKeywordPlanTier(raw, upper) {
    if (upper.includes("PRO+") || upper.includes("PRO PLUS") || upper.includes("PROPLUS")) return {
        key: "plus",
        label: "Pro+",
        variant: "success",
        rank: 4,
        raw
    };
    if (upper.includes("ENTERPRISE") || upper.includes("CORP") || upper.includes("ORG")) return {
        key: "enterprise",
        label: "Enterprise",
        variant: "info",
        rank: 7,
        raw
    };
    if (upper.includes("TEAM") || upper.includes("CHATGPTTEAM")) return {
        key: "team",
        label: "Team",
        variant: "info",
        rank: 6,
        raw
    };
    if (upper.includes("BUSINESS") || upper.includes("STANDARD") || upper.includes("BIZ")) return {
        key: "business",
        label: "Business",
        variant: "warning",
        rank: 5,
        raw
    };
    if (upper.includes("STUDENT")) return {
        key: "pro",
        label: "Student",
        variant: "success",
        rank: 3,
        raw
    };
    if (upper.includes("ULTRA")) return {
        key: "ultra",
        label: "Ultra",
        variant: "success",
        rank: 4,
        raw
    };
    return null;
}
function matchTokenPlanTier(raw, upper) {
    if (hasTierToken(upper, "MAX")) return {
        key: "ultra",
        label: "Max",
        variant: "success",
        rank: 4,
        raw
    };
    if (hasTierToken(upper, "PRO") || hasTierToken(upper, "PREMIUM")) return {
        key: "pro",
        label: "Pro",
        variant: "success",
        rank: 3,
        raw
    };
    if (hasTierToken(upper, "STARTER")) return {
        key: "lite",
        label: "Starter",
        variant: "primary",
        rank: 2,
        raw
    };
    if (hasTierToken(upper, "LITE") || hasTierToken(upper, "LIGHT")) return {
        key: "lite",
        label: "Lite",
        variant: "primary",
        rank: 2,
        raw
    };
    if (hasTierToken(upper, "PLUS") || hasTierToken(upper, "PAID")) return {
        key: "plus",
        label: "Plus",
        variant: "success",
        rank: 2,
        raw
    };
    return null;
}
function matchFreePlanTier(raw, upper) {
    return upper.includes("FREE") || upper.includes("BASIC") || upper.includes("TRIAL") || upper.includes("LEGACY") ? {
        key: "free",
        label: "Free",
        variant: "default",
        rank: 1,
        raw
    } : null;
}
function normalizePlanTier(plan) {
    const raw = typeof plan === "string" ? plan.trim() : "";
    if (!raw) return unknownPlanTier(null);
    const upper = raw.toUpperCase();
    // Provider names that are not real plan tiers — treat as unknown
    if (PROVIDER_PLAN_FALLBACKS.has(raw.toLowerCase())) return unknownPlanTier(raw);
    // Match Anthropic bootstrap strings (claude_max, default_claude_max_20x, etc.)
    // before the generic PRO/TEAM checks so underscored values don't fall through.
    const matched = matchClaudePlanTier(raw, upper) || matchKeywordPlanTier(raw, upper) || matchTokenPlanTier(raw, upper) || matchFreePlanTier(raw, upper);
    return matched || {
        ...unknownPlanTier(raw),
        label: formatUnknownPlanLabel(raw) || "Unknown"
    };
}
function computeCanEditCutoff(quotas) {
    return quotas.some((q)=>q && typeof q.name === "string" && !q.isCredits);
}
function computeCanRedeemResetCredit(provider, quotas) {
    return provider === "codex" && quotas.some((q)=>q?.isResetCredits && Number(q.creditCount ?? q.remaining ?? 0) > 0);
}
function hasQuotaCutoffOverrides(connection) {
    const overrides = connection.quotaWindowThresholds || null;
    return !!overrides && Object.keys(overrides).length > 0;
}
const STATUS_EMOJI = {
    critical: "🔴",
    alert: "🟡",
    ok: "🟢",
    empty: "⚪"
};
const QUOTA_BAR_GREEN_THRESHOLD = 50;
const QUOTA_BAR_YELLOW_THRESHOLD = 20;
function quotaRemainingPercent(q) {
    return getQuotaRemainingPercentage(q);
}
function quotaStatus(q) {
    const pct = quotaRemainingPercent(q);
    if (pct <= QUOTA_BAR_YELLOW_THRESHOLD) return "critical";
    if (pct <= QUOTA_BAR_GREEN_THRESHOLD) return "alert";
    return "ok";
}
function worstStatus(quotas) {
    if (!quotas || quotas.length === 0) return "empty";
    let worst = "ok";
    for (const q of quotas){
        const s = quotaStatus(q);
        if (s === "critical") return "critical";
        if (s === "alert" && worst === "ok") worst = "alert";
    }
    return worst;
}
const STATUS_ORDER = {
    critical: 0,
    alert: 1,
    ok: 2
};
function topQuotas(quotas, n = 3, providerId) {
    const filtered = quotas.filter(Boolean);
    // Providers with a deterministic fixed-window order (codex, glm family — see
    // quotaParsing.ts's sortCodexOrder()/sortGlmOrder()) must keep the order
    // parseQuotaData() already established rather than being re-sorted by
    // status/remaining-%, which would undo it (#6687's collapsed-card sibling, #7764).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasFixedQuotaOrder"])(providerId)) {
        return filtered.slice(0, n);
    }
    return [
        ...filtered
    ].sort((a, b)=>{
        const sa = STATUS_ORDER[quotaStatus(a)];
        const sb = STATUS_ORDER[quotaStatus(b)];
        if (sa !== sb) return sa - sb;
        return quotaRemainingPercent(a) - quotaRemainingPercent(b);
    }).slice(0, n);
}
function getQuotaRemainingPercentage(q) {
    if (q?.unlimited) return 100;
    if (q?.remainingPercentage !== undefined) return Number(q.remainingPercentage);
    return calculatePercentage(q?.used, q?.total);
}
function isPercentageOnlyQuota(q) {
    return q?.isPercentageOnly === true || q?.fractionReported === true;
}
function shouldShowQuotaUsageCount(q) {
    const total = Number(q?.total || 0);
    return total > 0 && q?.unlimited !== true && !isPercentageOnlyQuota(q);
}
function getBarColor(remainingPercentage) {
    if (remainingPercentage > QUOTA_BAR_GREEN_THRESHOLD) {
        return {
            bar: "#22c55e",
            text: "#22c55e",
            bg: "rgba(34,197,94,0.12)"
        };
    }
    if (remainingPercentage > QUOTA_BAR_YELLOW_THRESHOLD) {
        return {
            bar: "#eab308",
            text: "#eab308",
            bg: "rgba(234,179,8,0.12)"
        };
    }
    return {
        bar: "#ef4444",
        text: "#ef4444",
        bg: "rgba(239,68,68,0.12)"
    };
}
function formatCountdown(resetAt) {
    if (!resetAt) return null;
    try {
        const diff = new Date(resetAt).getTime() - Date.now();
        if (diff <= 0) return null;
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor(diff % 3_600_000 / 60_000);
        if (h >= 24) {
            const d = Math.floor(h / 24);
            return `${d}d ${h % 24}h ${m}m`;
        }
        return `${h}h ${m}m`;
    } catch  {
        return null;
    }
}
function getNextResetSummary(quotas) {
    if (!quotas || quotas.length === 0) return null;
    const now = Date.now();
    let soonest = Number.POSITIVE_INFINITY;
    let soonestIso = null;
    for (const q of quotas){
        if (!q?.resetAt) continue;
        const ts = new Date(q.resetAt).getTime();
        if (!Number.isFinite(ts) || ts <= now) continue;
        if (ts < soonest) {
            soonest = ts;
            soonestIso = typeof q.resetAt === "string" ? q.resetAt : new Date(ts).toISOString();
        }
    }
    return soonestIso ? formatCountdown(soonestIso) : null;
}
function addQuotaModelIdVariants(out, provider, modelId) {
    const raw = modelId.trim().toLowerCase();
    const providerId = provider.trim().toLowerCase();
    if (!raw) return;
    out.add(raw);
    if (!providerId) return;
    const prefix = `${providerId}/`;
    if (raw.startsWith(prefix)) {
        const stripped = raw.slice(prefix.length);
        if (stripped) out.add(stripped);
    } else {
        out.add(`${providerId}/${raw}`);
    }
}
function collectHiddenQuotaModelIds(provider, payload) {
    const hidden = new Set();
    const data = toRecord(payload);
    const collect = (entries)=>{
        if (!Array.isArray(entries)) return;
        for (const entry of entries){
            const record = toRecord(entry);
            if (record.isHidden !== true && record.isDeleted !== true) continue;
            if (typeof record.id === "string") addQuotaModelIdVariants(hidden, provider, record.id);
        }
    };
    collect(data.models);
    collect(data.modelCompatOverrides);
    return Array.from(hidden);
}
function filterHiddenModelQuotas(provider, quotas, hiddenModelIds) {
    if (!Array.isArray(quotas)) return [];
    if (!hiddenModelIds || hiddenModelIds.length === 0) return quotas;
    const hidden = new Set(hiddenModelIds.map((id)=>id.trim().toLowerCase()).filter((id)=>id.length > 0));
    if (hidden.size === 0) return quotas;
    return quotas.filter((quota)=>{
        if (!quota || quota.isCredits) return true;
        const modelId = typeof quota.modelKey === "string" ? quota.modelKey : typeof quota.modelId === "string" ? quota.modelId : "";
        if (!modelId) return true;
        const candidates = new Set();
        addQuotaModelIdVariants(candidates, provider, modelId);
        return !Array.from(candidates).some((candidate)=>hidden.has(candidate));
    });
}
function getQuotaVisibilityKey(quota) {
    if (!quota || typeof quota !== "object") return "";
    return String(quota.modelKey || quota.name || "").trim();
}
function getProviderHiddenQuotaSet(provider, quotaVisibility) {
    const hidden = quotaVisibility?.[provider]?.hidden;
    return new Set(Array.isArray(hidden) ? hidden.map(String) : []);
}
function filterQuotasByVisibility(provider, quotas = [], quotaVisibility = {}) {
    if (!Array.isArray(quotas) || quotas.length === 0) return [];
    const hidden = getProviderHiddenQuotaSet(provider, quotaVisibility);
    if (hidden.size === 0) return quotas;
    return quotas.filter((quota)=>!hidden.has(getQuotaVisibilityKey(quota)));
}
function getHiddenQuotaRows(provider, quotas = [], quotaVisibility = {}) {
    if (!Array.isArray(quotas) || quotas.length === 0) return [];
    const hidden = getProviderHiddenQuotaSet(provider, quotaVisibility);
    if (hidden.size === 0) return [];
    return quotas.filter((quota)=>hidden.has(getQuotaVisibilityKey(quota)));
}
function matchesProviderFilter(connection, providerFilter) {
    if (!providerFilter || providerFilter === "all") return true;
    if (!connection || typeof connection.provider !== "string") return false;
    return connection.provider === providerFilter;
}
function buildProviderOptions(connections, compare = (a, b)=>a.localeCompare(b)) {
    const seen = new Set();
    for (const conn of connections){
        if (conn && typeof conn.provider === "string" && conn.provider) {
            seen.add(conn.provider);
        }
    }
    return Array.from(seen).sort(compare);
}
/** Label/name key: providers-page `getProviderSortLabel` — case-insensitive display name. */ function quotaConnLabel(conn) {
    const name = typeof conn.name === "string" ? conn.name : "";
    const provider = typeof conn.provider === "string" ? conn.provider : "";
    return (name || provider).toLowerCase();
}
/** Technical tiebreak key: providers-page `providerId.localeCompare(...)` — ASCII on purpose. */ function quotaConnTiebreak(conn) {
    const email = typeof conn.email === "string" ? conn.email : "";
    const id = typeof conn.id === "string" ? conn.id : String(conn.id ?? "");
    return email || id;
}
function providerRank(provider, providerOrder) {
    const key = typeof provider === "string" ? provider : "";
    return providerOrder[key] ?? 99;
}
function compareQuotaConnections(a, b, opts) {
    const cmp = opts.compare ?? ((x, y)=>x.localeCompare(y));
    const labels = opts.providerLabels ?? {};
    const ra = providerRank(a.provider, opts.providerOrder);
    const rb = providerRank(b.provider, opts.providerOrder);
    if (ra !== rb) return ra - rb;
    const pa = typeof a.provider === "string" ? a.provider : "";
    const pb = typeof b.provider === "string" ? b.provider : "";
    const providerLabelCmp = cmp(labels[pa] ?? pa, labels[pb] ?? pb);
    if (providerLabelCmp !== 0) return providerLabelCmp;
    if (pa !== pb) return pa < pb ? -1 : 1;
    if (opts.accountCompare) {
        const acc = opts.accountCompare(a, b);
        if (acc !== 0) return acc;
    }
    const accountLabelCmp = cmp(quotaConnLabel(a), quotaConnLabel(b));
    if (accountLabelCmp !== 0) return accountLabelCmp;
    const ta = quotaConnTiebreak(a);
    const tb = quotaConnTiebreak(b);
    return ta < tb ? -1 : ta > tb ? 1 : 0;
}
function compareProviderGroups(a, b, opts) {
    const cmp = opts.compare ?? ((x, y)=>x.localeCompare(y));
    const labels = opts.providerLabels ?? {};
    const ra = providerRank(a, opts.providerOrder);
    const rb = providerRank(b, opts.providerOrder);
    if (ra !== rb) return ra - rb;
    const labelCmp = cmp(labels[a] ?? a, labels[b] ?? b);
    if (labelCmp !== 0) return labelCmp;
    return a < b ? -1 : a > b ? 1 : 0;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/useQuotaVisibility.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useQuotaVisibility",
    ()=>useQuotaVisibility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useQuotaVisibility(tr, notify) {
    _s();
    const [quotaVisibility, setQuotaVisibility] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // Load persisted per-operator quota row visibility once on mount. Best
    // effort — a fetch failure just leaves every row visible (safe default).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useQuotaVisibility.useEffect": ()=>{
            let alive = true;
            fetch("/api/settings", {
                cache: "no-store"
            }).then({
                "useQuotaVisibility.useEffect": (r)=>r.ok ? r.json() : {}
            }["useQuotaVisibility.useEffect"]).then({
                "useQuotaVisibility.useEffect": (s)=>{
                    if (alive) setQuotaVisibility(s?.quotaVisibility || {});
                }
            }["useQuotaVisibility.useEffect"]).catch({
                "useQuotaVisibility.useEffect": ()=>{}
            }["useQuotaVisibility.useEffect"]);
            return ({
                "useQuotaVisibility.useEffect": ()=>{
                    alive = false;
                }
            })["useQuotaVisibility.useEffect"];
        }
    }["useQuotaVisibility.useEffect"], []);
    const persistQuotaVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotaVisibility.useCallback[persistQuotaVisibility]": async (next, previous)=>{
            setQuotaVisibility(next);
            try {
                const response = await fetch("/api/settings", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        quotaVisibility: next
                    })
                });
                if (!response.ok) throw new Error("Failed to update quota visibility");
            } catch  {
                setQuotaVisibility(previous);
                notify.error(tr("quotaVisibilityUpdateFailed", "Failed to update quota visibility"));
            }
        }
    }["useQuotaVisibility.useCallback[persistQuotaVisibility]"], [
        notify,
        tr
    ]);
    const toggleQuotaKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotaVisibility.useCallback[toggleQuotaKey]": (provider, quotaRow, hide)=>{
            const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getQuotaVisibilityKey"])(quotaRow);
            if (!provider || !key) return;
            const previous = quotaVisibility;
            const providerVisibility = previous[provider] || {};
            const hidden = new Set(providerVisibility.hidden || []);
            if (hide) hidden.add(key);
            else hidden.delete(key);
            const next = {
                ...previous,
                [provider]: {
                    ...providerVisibility,
                    hidden: [
                        ...hidden
                    ]
                }
            };
            persistQuotaVisibility(next, previous);
        }
    }["useQuotaVisibility.useCallback[toggleQuotaKey]"], [
        quotaVisibility,
        persistQuotaVisibility
    ]);
    const handleHideQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotaVisibility.useCallback[handleHideQuota]": (provider, quotaRow)=>toggleQuotaKey(provider, quotaRow, true)
    }["useQuotaVisibility.useCallback[handleHideQuota]"], [
        toggleQuotaKey
    ]);
    const handleShowQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotaVisibility.useCallback[handleShowQuota]": (provider, quotaRow)=>toggleQuotaKey(provider, quotaRow, false)
    }["useQuotaVisibility.useCallback[handleShowQuota]"], [
        toggleQuotaKey
    ]);
    return {
        quotaVisibility,
        handleHideQuota,
        handleShowQuota
    };
}
_s(useQuotaVisibility, "BsCRtzxJqz6HTbQDRcHgekOjLtw=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translateUsageOrFallback",
    ()=>translateUsageOrFallback
]);
function translateUsageOrFallback(t, key, fallback, values) {
    try {
        if (typeof t.has === "function" && !t.has(key)) {
            return fallback;
        }
        const translated = values ? t(key, values) : t(key);
        if (!translated || translated === key || translated === `usage.${key}`) {
            return fallback;
        }
        return translated;
    } catch  {
        return fallback;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaCutoffModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function QuotaCutoffModal({ isOpen, onClose, connectionId, connectionName, provider, windows, current, providerDefaults, globalDefaultPercent, onSave }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const tr = (key, fallback, values)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, key, fallback, values);
    // Local draft: string per window so empty-string means "inherit".
    const [drafts, setDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const wasOpenRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const seededConnectionIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Reset drafts whenever the modal opens against a new connection.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuotaCutoffModal.useEffect": ()=>{
            const shouldSeed = isOpen && (!wasOpenRef.current || seededConnectionIdRef.current !== connectionId);
            wasOpenRef.current = isOpen;
            if (!shouldSeed) return;
            seededConnectionIdRef.current = connectionId;
            const initial = {};
            for (const w of windows){
                const persisted = current?.[w.key];
                initial[w.key] = typeof persisted === "number" ? String(persisted) : "";
            }
            setDrafts(initial);
            setError(null);
        }
    }["QuotaCutoffModal.useEffect"], [
        isOpen,
        connectionId,
        windows,
        current
    ]);
    const resolveDefaultFor = (windowKey)=>typeof providerDefaults[windowKey] === "number" ? providerDefaults[windowKey] : globalDefaultPercent;
    const buildPatch = ()=>{
        const patch = {};
        for (const w of windows){
            const raw = (drafts[w.key] ?? "").trim();
            if (raw === "") {
                // Only emit an explicit null when there was previously an override
                // to clear; otherwise just omit the key.
                if (current?.[w.key] !== undefined) patch[w.key] = null;
                continue;
            }
            const n = Number(raw);
            if (!Number.isInteger(n) || n < 0 || n > 100) return "invalid";
            if (current?.[w.key] !== n) patch[w.key] = n;
        }
        return patch;
    };
    const handleSave = async ()=>{
        const patch = buildPatch();
        if (patch === "invalid") {
            setError(tr("quotaThresholdInvalid", "Enter a whole number from 0 to 100."));
            return;
        }
        if (Object.keys(patch).length === 0) {
            onClose();
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSave(patch);
            onClose();
        } catch (err) {
            setError(err?.message || "Failed to save");
        } finally{
            setSaving(false);
        }
    };
    const handleResetAll = async ()=>{
        setSaving(true);
        setError(null);
        try {
            await onSave(null);
            onClose();
        } catch (err) {
            setError(err?.message || "Failed to save");
        } finally{
            setSaving(false);
        }
    };
    const hasAnyOverride = current !== null && current !== undefined && Object.keys(current).length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        isOpen: isOpen,
        onClose: onClose,
        title: tr("quotaCutoffsTitle", `Quota cutoffs for ${connectionName} (${provider})`, {
            name: connectionName,
            provider
        }),
        size: "md",
        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                hasAnyOverride && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    variant: "ghost",
                    onClick: handleResetAll,
                    disabled: saving,
                    children: tr("quotaCutoffsResetAll", "Reset all")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                    lineNumber: 157,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    variant: "ghost",
                    onClick: onClose,
                    disabled: saving,
                    children: tr("cancel", "Cancel")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                    lineNumber: 161,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    onClick: handleSave,
                    loading: saving,
                    children: tr("save", "Save")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                    lineNumber: 164,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-text-muted mb-4",
                children: tr("quotaCutoffsExplainer", "Override the minimum remaining quota percentage where this account stops being selected for each quota window. Leave blank to inherit the provider default.")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    windows.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-text-muted italic",
                        children: tr("quotaCutoffsNoWindows", "No quota windows are available for this account yet.")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                        lineNumber: 178,
                        columnNumber: 11
                    }, this),
                    windows.map((w)=>{
                        const persisted = current?.[w.key];
                        const resolvedDefault = resolveDefaultFor(w.key);
                        const placeholder = `${resolvedDefault}`;
                        const isOverride = typeof persisted === "number" && (drafts[w.key] ?? "") === String(persisted);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-medium text-text-main",
                                            children: w.displayName
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                                            lineNumber: 191,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] text-text-muted",
                                            children: tr("quotaCutoffsDefaultHint", `Default min remaining: ${resolvedDefault}%`, {
                                                default: resolvedDefault
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                                            lineNumber: 192,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                                    lineNumber: 190,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            min: 0,
                                            max: 100,
                                            step: 1,
                                            value: drafts[w.key] ?? "",
                                            placeholder: placeholder,
                                            disabled: saving,
                                            onChange: (e)=>setDrafts((prev)=>({
                                                        ...prev,
                                                        [w.key]: e.target.value
                                                    })),
                                            className: `w-20 px-2 py-1 text-sm text-center rounded-md border bg-transparent text-text-main focus:outline-none focus:border-primary/60 disabled:opacity-50 ${isOverride ? "border-primary/40" : "border-border"}`
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                                            lineNumber: 199,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-text-muted",
                                            children: "%"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                                            lineNumber: 212,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                                    lineNumber: 198,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, w.key, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                            lineNumber: 189,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 text-sm text-red-500 flex items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[16px]",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                        lineNumber: 220,
                        columnNumber: 11
                    }, this),
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
                lineNumber: 219,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
}
_s(QuotaCutoffModal, "VPralBXtoIEu+nuIT0h8WeOUXiY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = QuotaCutoffModal;
var _c;
__turbopack_context__.k.register(_c, "QuotaCutoffModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaCardHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/ProviderIcon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const STATUS_DOT_CLASS = {
    critical: "bg-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.16)]",
    alert: "bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.2)]",
    ok: "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]",
    empty: "bg-slate-300 shadow-[0_0_0_2px_rgba(148,163,184,0.18)]"
};
function QuotaCardHeader({ connection, providerLabel, cardStatus, tierMeta, resolvedPlan, emailsVisible, hasStaleData, onToggleActive, togglingActive }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const isActive = connection.isActive ?? true;
    const toggleActiveLabel = isActive ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "deactivateAccount", "Deactivate account (stop routing)") : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "activateAccount", "Activate account (resume routing)");
    const accountName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
        connection.name,
        connection.displayName,
        connection.email
    ], emailsVisible, connection.provider);
    // OAuth token expiry — informative only. Shown small/blue for connections that
    // expose a concrete token expiry (e.g. Codex), so an operator can see at a
    // glance when the access token rotates. Hidden for API-key / no-expiry connections.
    const tokenExpiryIso = connection.authType === "oauth" ? connection.tokenExpiresAt || connection.expiresAt || null : null;
    const tokenExpiryMs = tokenExpiryIso ? new Date(tokenExpiryIso).getTime() : NaN;
    const hasTokenExpiry = Number.isFinite(tokenExpiryMs);
    const tokenCountdown = hasTokenExpiry ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatCountdown"])(tokenExpiryIso) : null;
    const tokenExpiryLabel = !hasTokenExpiry ? null : tokenCountdown ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "tokenExpiresIn", `Token expires in ${tokenCountdown}`, {
        time: tokenCountdown
    }) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "tokenExpired", "Token expired");
    const tokenExpiryTitle = hasTokenExpiry ? new Date(tokenExpiryMs).toLocaleString() : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-[62px] items-center justify-between gap-2 px-3 py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-w-0 flex-1 items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex size-7 shrink-0 items-center justify-center",
                        title: cardStatus,
                        "aria-label": cardStatus,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `block size-3.5 rounded-full ${STATUS_DOT_CLASS[cardStatus]}`
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$ProviderIcon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            providerId: connection.provider,
                            size: 24,
                            type: "color"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 flex-1 flex-col justify-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-4 min-w-0 items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate text-[12px] font-semibold leading-4 text-text-main",
                                        title: providerLabel,
                                        children: providerLabel
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex h-4 shrink-0 items-center",
                                        title: resolvedPlan ? t("rawPlanWithValue", {
                                            plan: resolvedPlan
                                        }) : t("noPlanFromProvider"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            variant: tierMeta.variant,
                                            size: "sm",
                                            dot: true,
                                            className: "h-4 px-1.5 py-0 leading-4",
                                            children: tierMeta.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                            lineNumber: 101,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    hasStaleData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined shrink-0 text-[12px] leading-4 text-amber-500",
                                        title: t("staleQuotaTooltip"),
                                        children: "schedule"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-text-muted truncate",
                                title: accountName ?? "",
                                children: accountName
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            tokenExpiryLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-[10px] truncate ${tokenCountdown ? "text-sky-500" : "text-rose-500"}`,
                                title: tokenExpiryTitle,
                                children: tokenExpiryLabel
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-0.5 self-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    disabled: togglingActive,
                    onClick: (e)=>{
                        e.stopPropagation();
                        if (togglingActive) return;
                        onToggleActive(!isActive);
                    },
                    title: toggleActiveLabel,
                    "aria-label": toggleActiveLabel,
                    className: `p-1 rounded-md cursor-pointer transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed ${isActive ? "text-text-muted" : "text-rose-500"}`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[14px]",
                        children: isActive ? "toggle_on" : "toggle_off"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
_s(QuotaCardHeader, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = QuotaCardHeader;
var _c;
__turbopack_context__.k.register(_c, "QuotaCardHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/grokBilling.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GROK_BUILD_ADDITIONAL_CREDITS_URL",
    ()=>GROK_BUILD_ADDITIONAL_CREDITS_URL,
    "buildGrokBillingCardRows",
    ()=>buildGrokBillingCardRows,
    "formatGrokMinorUnits",
    ()=>formatGrokMinorUnits,
    "sanitizeGrokBillingStatus",
    ()=>sanitizeGrokBillingStatus
]);
const GROK_BUILD_ADDITIONAL_CREDITS_URL = "https://grok.com/build?_s=usage";
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function minorUnits(value) {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}
function sanitizeGrokBillingStatus(value) {
    const billing = toRecord(value);
    if (!billing || billing.currency !== "USD") return undefined;
    if (billing.additionalCreditsUrl !== GROK_BUILD_ADDITIONAL_CREDITS_URL) return undefined;
    const rawAutoTopUp = toRecord(billing.autoTopUp);
    if (!rawAutoTopUp || typeof rawAutoTopUp.available !== "boolean") return undefined;
    const available = rawAutoTopUp.available;
    const enabled = available && typeof rawAutoTopUp.enabled === "boolean" ? rawAutoTopUp.enabled : undefined;
    const extraCreditsMinorUnits = minorUnits(billing.extraCreditsMinorUnits);
    const thresholdMinorUnits = enabled === true ? minorUnits(rawAutoTopUp.thresholdMinorUnits) : undefined;
    const amountMinorUnits = enabled === true ? minorUnits(rawAutoTopUp.amountMinorUnits) : undefined;
    const maxMonthlyMinorUnits = enabled === true ? minorUnits(rawAutoTopUp.maxMonthlyMinorUnits) : undefined;
    return {
        currency: "USD",
        ...extraCreditsMinorUnits !== undefined ? {
            extraCreditsMinorUnits
        } : {},
        autoTopUp: {
            available,
            ...enabled !== undefined ? {
                enabled
            } : {},
            ...thresholdMinorUnits !== undefined ? {
                thresholdMinorUnits
            } : {},
            ...amountMinorUnits !== undefined ? {
                amountMinorUnits
            } : {},
            ...maxMonthlyMinorUnits !== undefined ? {
                maxMonthlyMinorUnits
            } : {}
        },
        additionalCreditsUrl: GROK_BUILD_ADDITIONAL_CREDITS_URL
    };
}
function formatGrokMinorUnits(value, currency, locales) {
    if (value === undefined) return null;
    return new Intl.NumberFormat(locales, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}
const fallbackTranslation = (_key, fallback)=>fallback;
function buildGrokBillingCardRows(billing, locales, translate = fallbackTranslation) {
    const rows = [];
    const extraCredits = formatGrokMinorUnits(billing.extraCreditsMinorUnits, billing.currency, locales);
    if (extraCredits !== null) {
        rows.push({
            kind: "balance",
            label: translate("grokExtraUsageCredits", "Extra Usage Credits"),
            value: extraCredits
        });
    }
    const autoTopUp = billing.autoTopUp;
    let autoTopUpValue;
    if (!autoTopUp.available) {
        autoTopUpValue = translate("grokAutoTopUpUnavailable", "Unavailable");
    } else if (!autoTopUp.enabled) {
        autoTopUpValue = translate("grokAutoTopUpDisabled", "Disabled");
    } else {
        const threshold = formatGrokMinorUnits(autoTopUp.thresholdMinorUnits, billing.currency, locales);
        const amount = formatGrokMinorUnits(autoTopUp.amountMinorUnits, billing.currency, locales);
        const maximum = formatGrokMinorUnits(autoTopUp.maxMonthlyMinorUnits, billing.currency, locales);
        autoTopUpValue = [
            translate("grokAutoTopUpEnabled", "Enabled"),
            threshold ? `${translate("grokAutoTopUpAt", "at")} ${threshold}` : null,
            amount ? `${translate("grokAutoTopUpAdd", "add")} ${amount}` : null,
            maximum ? `${translate("grokAutoTopUpMax", "max")} ${maximum}/${translate("grokAutoTopUpMonth", "month")}` : null
        ].filter((part)=>part !== null).join(" · ");
    }
    rows.push({
        kind: "status",
        label: translate("grokAutoTopUp", "Auto Top-Up"),
        value: autoTopUpValue
    });
    rows.push({
        kind: "link",
        label: translate("grokAdditionalCredits", "Additional Credits"),
        href: billing.additionalCreditsUrl,
        target: "_blank",
        rel: "noreferrer noopener"
    });
    return rows;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaMiniBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaMiniBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
"use client";
;
;
;
function QuotaMiniBar({ percent, size = "xs", className }) {
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBarColor"])(percent);
    const heightCls = size === "sm" ? "h-1.5" : "h-1";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-full overflow-hidden bg-black/[0.06] dark:bg-white/[0.06]", heightCls, className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full rounded-full transition-[width] duration-300 ease-out",
            style: {
                width: `${Math.min(100, Math.max(0, percent))}%`,
                background: colors.bar
            }
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaMiniBar.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaMiniBar.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = QuotaMiniBar;
var _c;
__turbopack_context__.k.register(_c, "QuotaMiniBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaCardExpanded,
    "getVisibleQuotas",
    ()=>getVisibleQuotas,
    "resolveQuotaDisplayOrder",
    ()=>resolveQuotaDisplayOrder,
    "shouldShowLoadingPlaceholder",
    ()=>shouldShowLoadingPlaceholder,
    "sortQuotasByRemaining",
    ()=>sortQuotasByRemaining
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$grokBilling$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/grokBilling.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaMiniBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaMiniBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const CURRENCY_SYMBOLS = {
    USD: "$",
    CNY: "¥",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    KRW: "₩",
    INR: "₹"
};
const DEFAULT_VISIBLE_ROWS = 3;
function GrokBillingDetails({ billing }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$grokBilling$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildGrokBillingCardRows"])(billing, locale, (key, fallback)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, key, fallback));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1.5 border-t border-border/40 pt-2 text-[11px] text-text-main",
        children: rows.map((row)=>row.kind === "link" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: row.href,
                target: row.target,
                rel: row.rel,
                className: "inline-flex w-fit items-center gap-1 font-medium text-primary hover:underline",
                children: [
                    row.label,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "open_in_new"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this)
                ]
            }, row.kind, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 41,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex justify-between gap-2 ${row.kind === "status" ? "items-start" : "items-center"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: row.label
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 58,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `font-semibold ${row.kind === "status" ? "text-right" : "tabular-nums"}`,
                        children: row.value
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 59,
                        columnNumber: 13
                    }, this)
                ]
            }, row.kind, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 52,
                columnNumber: 11
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(GrokBillingDetails, "ibHvjDxkLpek5QWjIfNYywjof5I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"]
    ];
});
_c = GrokBillingDetails;
function sortQuotasByRemaining(quotas) {
    return [
        ...quotas
    ].sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getQuotaRemainingPercentage"])(b) - (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getQuotaRemainingPercentage"])(a));
}
function resolveQuotaDisplayOrder(providerId, quotas) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasFixedQuotaOrder"])(providerId) ? [
        ...quotas
    ] : sortQuotasByRemaining(quotas);
}
function getVisibleQuotas(sortedQuotas, expanded) {
    return expanded ? sortedQuotas : sortedQuotas.slice(0, DEFAULT_VISIBLE_ROWS);
}
function shouldShowLoadingPlaceholder(loading, quotaCount, message) {
    return loading && quotaCount === 0 && !message;
}
function QuotaDetailRow({ q, onHideQuota, onOpenResetCredits, loadingResetCredits = false }) {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const canHide = typeof onHideQuota === "function" && !q.isCredits && !q.isResetCredits;
    if (q.isResetCredits) {
        const count = Number(q.creditCount ?? q.remaining ?? 0);
        const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBarColor"])(q.remainingPercentage ?? 100);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-[34px] items-center justify-between gap-2 py-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "flex min-w-0 flex-1 items-center gap-1.5 text-[12px] font-medium leading-none text-text-main",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex size-6 shrink-0 items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[15px] leading-none",
                                style: {
                                    color: colors.text
                                },
                                children: "restart_alt"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "truncate leading-none",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "resetCreditsLabel", "Reset credits")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 163,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    disabled: !onOpenResetCredits || loadingResetCredits,
                    onClick: (event)=>{
                        event.stopPropagation();
                        onOpenResetCredits?.();
                    },
                    "aria-label": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "viewResetCredits", "View reset credits"),
                    className: "inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-[12px] font-bold leading-none tabular-nums hover:bg-black/[0.05] disabled:cursor-default dark:hover:bg-white/[0.05]",
                    style: {
                        color: colors.text
                    },
                    children: [
                        loadingResetCredits && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined animate-spin text-[12px]",
                            children: "progress_activity"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 179,
                            columnNumber: 13
                        }, this),
                        count.toLocaleString(undefined, {
                            maximumFractionDigits: 0
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[13px]",
                            children: "chevron_right"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 184,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                    lineNumber: 167,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
            lineNumber: 153,
            columnNumber: 7
        }, this);
    }
    if (q.isCredits) {
        const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBarColor"])(q.remainingPercentage ?? 0);
        const sym = CURRENCY_SYMBOLS[q.currency] ?? q.currency ?? "";
        const amount = (q.creditCount ?? q.remaining ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-[34px] items-center justify-between gap-2 py-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "flex min-w-0 flex-1 items-center gap-1.5 text-[12px] font-medium leading-none text-text-main",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex size-6 shrink-0 items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[15px] leading-none",
                                style: {
                                    color: colors.text
                                },
                                children: "paid"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 200,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "truncate leading-none",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatQuotaLabel"])(q.name) || t("creditsLabel")
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 208,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "inline-flex h-6 shrink-0 items-center text-[12px] font-bold leading-none tabular-nums",
                    style: {
                        color: colors.text
                    },
                    children: [
                        sym,
                        amount
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                    lineNumber: 212,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
            lineNumber: 198,
            columnNumber: 7
        }, this);
    }
    const pctRaw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getQuotaRemainingPercentage"])(q);
    const pct = Math.round(pctRaw);
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBarColor"])(pct);
    const cd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatCountdown"])(q.resetAt);
    const label = q.displayName || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatQuotaLabel"])(q.name);
    const usedNum = Number(q.used || 0);
    const totalNum = Number(q.total || 0);
    const showUsage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shouldShowQuotaUsageCount"])(q);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1 py-1",
        title: q.modelKey || q.name,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[12px] font-medium text-text-main truncate",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[12px] font-bold tabular-nums shrink-0",
                        style: {
                            color: colors.text
                        },
                        children: q.unlimited ? "∞" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "percentLeft", `${pct}% left`, {
                            pct
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this),
                    canHide && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: (e)=>{
                            e.stopPropagation();
                            onHideQuota?.(q);
                        },
                        className: "inline-flex size-5 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-black/5 hover:text-text-main dark:hover:bg-white/5",
                        title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "hideQuotaRow", "Hide this quota row"),
                        "aria-label": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "hideQuotaRow", "Hide this quota row"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[13px] leading-none",
                            children: "visibility_off"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 253,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            !q.unlimited && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaMiniBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                percent: pct,
                size: "sm"
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 259,
                columnNumber: 24
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2 text-[10px] text-text-muted tabular-nums",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: showUsage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                usedNum.toLocaleString(),
                                " / ",
                                totalNum.toLocaleString()
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 261,
                        columnNumber: 9
                    }, this),
                    q.staleAfterReset ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        title: t("refreshing"),
                        children: "⟳"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 269,
                        columnNumber: 11
                    }, this) : cd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "⏱ ",
                            t("resetsIn"),
                            " ",
                            cd
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 271,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 260,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
        lineNumber: 233,
        columnNumber: 5
    }, this);
}
_s1(QuotaDetailRow, "h6+q2O3NJKPY5uL0BIJGLIanww8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c1 = QuotaDetailRow;
function QuotaCardExpanded({ quotas, providerId, loading, error, message, billing, refreshedAt, hasStaleData, onRefresh, onOpenCutoff, onOpenCost, onOpenResetCredits, canEditCutoff, hasCutoffOverrides, canRedeemResetCredit = false, redeemingResetCredit = false, loadingResetCredits = false, hiddenQuotaRows = [], onHideQuota, onShowQuota }) {
    _s2();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const tr = (key, fallback, values)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, key, fallback, values);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sortedQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCardExpanded.useMemo[sortedQuotas]": ()=>resolveQuotaDisplayOrder(providerId, quotas)
    }["QuotaCardExpanded.useMemo[sortedQuotas]"], [
        quotas,
        providerId
    ]);
    const visibleQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCardExpanded.useMemo[visibleQuotas]": ()=>getVisibleQuotas(sortedQuotas, expanded)
    }["QuotaCardExpanded.useMemo[visibleQuotas]"], [
        sortedQuotas,
        expanded
    ]);
    const hiddenCount = sortedQuotas.length - visibleQuotas.length;
    const refreshedLabel = refreshedAt ? new Date(refreshedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-t border-border bg-bg-subtle/30 px-3 py-2.5 flex flex-col gap-1.5",
        children: [
            shouldShowLoadingPlaceholder(loading, sortedQuotas.length, message) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-text-muted flex items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined animate-spin text-[13px]",
                        children: "progress_activity"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 330,
                        columnNumber: 11
                    }, this),
                    t("loadingQuotas")
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 329,
                columnNumber: 9
            }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-red-500 flex items-start gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[13px]",
                        children: "error"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 337,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 338,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 336,
                columnNumber: 9
            }, this) : quotas.length === 0 && message ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-text-muted italic",
                title: message,
                children: message
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 341,
                columnNumber: 9
            }, this) : quotas.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-text-muted italic",
                children: t("noQuotaData")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 345,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col divide-y divide-border/40",
                children: visibleQuotas.map((q, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QuotaDetailRow, {
                        q: q,
                        onHideQuota: onHideQuota,
                        onOpenResetCredits: q.isResetCredits ? onOpenResetCredits : undefined,
                        loadingResetCredits: loadingResetCredits
                    }, `${q.name}-${q.modelKey ?? ""}-${i}`, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 349,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 347,
                columnNumber: 9
            }, this),
            providerId === "grok-cli" && billing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GrokBillingDetails, {
                billing: billing
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 360,
                columnNumber: 48
            }, this),
            hiddenQuotaRows.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-1 border-t border-border/40 pt-1.5 text-[10px] text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: "visibility_off"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 364,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: tr("hiddenQuotaRowsLabel", "Hidden:")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 365,
                        columnNumber: 11
                    }, this),
                    hiddenQuotaRows.map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: (e)=>{
                                e.stopPropagation();
                                onShowQuota?.(q);
                            },
                            className: "rounded-md border border-border px-1.5 py-0.5 transition-colors hover:bg-black/5 hover:text-text-main dark:hover:bg-white/5",
                            title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, "showQuotaRow", "Show this quota row"),
                            children: q.displayName || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatQuotaLabel"])(q.name)
                        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getQuotaVisibilityKey"])(q), false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                            lineNumber: 367,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 363,
                columnNumber: 9
            }, this),
            !error && sortedQuotas.length > DEFAULT_VISIBLE_ROWS && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: (e)=>{
                    e.stopPropagation();
                    setExpanded((prev)=>!prev);
                },
                className: "inline-flex items-center justify-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-border bg-bg-subtle hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[12px]",
                        children: expanded ? "expand_less" : "expand_more"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 392,
                        columnNumber: 11
                    }, this),
                    expanded ? tr("showLessQuotas", "Show less") : tr("showMoreQuotas", `Show ${hiddenCount} more`, {
                        count: hiddenCount
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 384,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2 pt-1.5 border-t border-border/40",
                children: [
                    refreshedLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-[10px] tabular-nums ${hasStaleData ? "text-amber-500" : "text-text-muted"}`,
                        title: hasStaleData ? t("staleQuotaTooltip") : `${tr("lastRefreshed", "Last refreshed")}: ${refreshedLabel}`,
                        children: [
                            tr("updatedShort", "Updated"),
                            " ",
                            refreshedLabel
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 403,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 ml-auto",
                        children: [
                            canRedeemResetCredit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: loading || redeemingResetCredit || loadingResetCredits,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onOpenResetCredits?.();
                                },
                                className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-primary/40 text-primary bg-bg-subtle hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined text-[12px] ${redeemingResetCredit || loadingResetCredits ? "animate-spin" : ""}`,
                                        children: redeemingResetCredit || loadingResetCredits ? "progress_activity" : "restart_alt"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                        lineNumber: 427,
                                        columnNumber: 15
                                    }, this),
                                    tr("manageResetCredits", "View credits")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                lineNumber: 418,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: !canEditCutoff,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onOpenCutoff();
                                },
                                className: `inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border bg-bg-subtle hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${hasCutoffOverrides ? "border-primary/40 text-primary" : "border-border"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[12px]",
                                        children: "tune"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                        lineNumber: 448,
                                        columnNumber: 13
                                    }, this),
                                    tr("editCutoffs", "Edit cutoffs")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                lineNumber: 437,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onOpenCost();
                                },
                                className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-border bg-bg-subtle hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[12px]",
                                        children: "bar_chart"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                        lineNumber: 459,
                                        columnNumber: 13
                                    }, this),
                                    t("usdCost")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                lineNumber: 451,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: loading,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onRefresh();
                                },
                                className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-border bg-bg-subtle hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined text-[12px] ${loading ? "animate-spin" : ""}`,
                                        children: "refresh"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                        lineNumber: 471,
                                        columnNumber: 13
                                    }, this),
                                    tr("forceRefresh", "Refresh now")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                                lineNumber: 462,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                        lineNumber: 416,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
                lineNumber: 401,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx",
        lineNumber: 327,
        columnNumber: 5
    }, this);
}
_s2(QuotaCardExpanded, "ffZonr8xMxwOgbnY9VXXS/vPoqo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c2 = QuotaCardExpanded;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "GrokBillingDetails");
__turbopack_context__.k.register(_c1, "QuotaDetailRow");
__turbopack_context__.k.register(_c2, "QuotaCardExpanded");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProviderUsdCostModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function formatUsd(value) {
    const numeric = Number(value || 0);
    const abs = Math.abs(numeric);
    const digits = abs > 0 && abs < 0.01 ? 6 : abs < 1 ? 4 : 2;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(numeric);
}
function formatDateTime(value, fallback) {
    if (!value) return fallback;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return fallback;
    return date.toLocaleString([], {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function formatPercent(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}
function ProviderUsdCostModal({ isOpen, onClose, connection, providerLabel, accountLabel }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usageLimits");
    const [payload, setPayload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [simulatedPercent, setSimulatedPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(25);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderUsdCostModal.useEffect": ()=>{
            if (!isOpen || !connection?.provider) return;
            let alive = true;
            async function load() {
                setLoading(true);
                setError(null);
                try {
                    const params = new URLSearchParams({
                        provider: String(connection.provider)
                    });
                    if (connection.id) params.set("connectionId", String(connection.id));
                    const response = await fetch(`/api/usage/provider-window-costs?${params.toString()}`);
                    if (!response.ok) {
                        const body = await response.json().catch({
                            "ProviderUsdCostModal.useEffect.load": ()=>({})
                        }["ProviderUsdCostModal.useEffect.load"]);
                        throw new Error(body.error || `HTTP ${response.status}`);
                    }
                    const data = await response.json();
                    if (alive) setPayload(data);
                } catch (loadError) {
                    if (alive) {
                        setError(loadError instanceof Error ? loadError.message : t("loadUsdCostsFailed"));
                        setPayload(null);
                    }
                } finally{
                    if (alive) setLoading(false);
                }
            }
            void load();
            return ({
                "ProviderUsdCostModal.useEffect": ()=>{
                    alive = false;
                }
            })["ProviderUsdCostModal.useEffect"];
        }
    }["ProviderUsdCostModal.useEffect"], [
        isOpen,
        connection?.id,
        connection?.provider,
        t
    ]);
    const maxCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderUsdCostModal.useMemo[maxCost]": ()=>Math.max(...(payload?.rows || []).map({
                "ProviderUsdCostModal.useMemo[maxCost]": (row)=>row.costUsd
            }["ProviderUsdCostModal.useMemo[maxCost]"]), 0)
    }["ProviderUsdCostModal.useMemo[maxCost]"], [
        payload
    ]);
    const simulatedUsd = payload?.estimatedFullQuotaUsd !== null && payload?.estimatedFullQuotaUsd !== undefined ? payload.estimatedFullQuotaUsd * simulatedPercent / 100 : null;
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-lg border border-border bg-surface shadow-xl",
            onClick: (event)=>event.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-4 border-b border-border px-5 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "m-0 text-lg font-semibold text-text-main",
                                    children: t("usdCost")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs text-text-muted",
                                    children: [
                                        providerLabel,
                                        " · ",
                                        accountLabel || connection?.id
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                            lineNumber: 143,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-subtle text-text-main hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
                            "aria-label": t("close"),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[18px]",
                                children: "close"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                            lineNumber: 149,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-y-auto px-5 py-4",
                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-sm text-text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined animate-spin text-[16px]",
                                children: "progress_activity"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 162,
                                columnNumber: 15
                            }, this),
                            t("loadingUsdCosts")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                        lineNumber: 161,
                        columnNumber: 13
                    }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: "error"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 169,
                                columnNumber: 15
                            }, this),
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                        lineNumber: 168,
                        columnNumber: 13
                    }, this) : payload ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2 md:grid-cols-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-md border border-border bg-bg-subtle px-3 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                children: t("used")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 176,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-lg font-semibold tabular-nums text-text-main",
                                                children: formatUsd(payload.totalCostUsd)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 179,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 175,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-md border border-border bg-bg-subtle px-3 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                children: t("quotaUsed")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 184,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-lg font-semibold tabular-nums text-text-main",
                                                children: formatPercent(payload.quotaUsedPercent)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 187,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 183,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-md border border-border bg-bg-subtle px-3 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                children: t("estimatedFullQuota")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 192,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-lg font-semibold tabular-nums text-text-main",
                                                children: payload.estimatedFullQuotaUsd === null ? "n/a" : formatUsd(payload.estimatedFullQuotaUsd)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 195,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 191,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-md border border-border bg-bg-subtle px-3 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] uppercase tracking-wide text-text-muted",
                                                children: t("rows")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 202,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-lg font-semibold tabular-nums text-text-main",
                                                children: payload.rows.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 205,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 201,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 174,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-md border border-border bg-surface px-3 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    t("window"),
                                                    ": ",
                                                    formatDateTime(payload.windowStartAt, t("unknown")),
                                                    " →",
                                                    " ",
                                                    formatDateTime(payload.windowResetAt, t("unknown"))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 213,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: payload.windowStartSource === "recorded_reset_event" ? t("fromRecordedReset", {
                                                    quota: payload.quotaName || t("weeklyQuota")
                                                }) : payload.windowStartSource === "observed_snapshot_reset" ? t("fromObservedReset", {
                                                    quota: payload.quotaName || t("weeklyQuota")
                                                }) : payload.windowSource === "provider_weekly_reset" ? t("fromReset", {
                                                    quota: payload.quotaName || t("weeklyQuota")
                                                }) : t("fallbackRollingDaysShort", {
                                                    days: 7
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 217,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 212,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between gap-3 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-text-main",
                                                        children: t("quotaEstimator")
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "tabular-nums text-text-main",
                                                        children: [
                                                            simulatedPercent,
                                                            "% =",
                                                            " ",
                                                            simulatedUsd === null ? "n/a" : formatUsd(simulatedUsd)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 228,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "range",
                                                min: "1",
                                                max: "100",
                                                step: "1",
                                                value: simulatedPercent,
                                                onChange: (event)=>setSimulatedPercent(Number(event.target.value)),
                                                className: "w-full accent-[var(--color-primary,#E54D5E)]",
                                                disabled: payload.estimatedFullQuotaUsd === null
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 235,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 227,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 211,
                                columnNumber: 15
                            }, this),
                            payload.rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-md border border-border px-3 py-8 text-center text-sm text-text-muted",
                                children: t("noApiKeyUsage")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 249,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: payload.rows.map((row)=>{
                                    const barPercent = maxCost > 0 ? Math.max(4, row.costUsd / maxCost * 100) : 0;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-md border border-border bg-surface px-3 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start justify-between gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "truncate text-sm font-semibold text-text-main",
                                                                children: row.apiKeyName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                                lineNumber: 263,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-0.5 text-[11px] text-text-muted",
                                                                children: t("requestTokenCounts", {
                                                                    requests: row.requests.toLocaleString(),
                                                                    tokens: row.totalTokens.toLocaleString()
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                                lineNumber: 266,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                        lineNumber: 262,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-right",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-semibold tabular-nums text-text-main",
                                                                children: formatUsd(row.costUsd)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                                lineNumber: 274,
                                                                columnNumber: 29
                                                            }, this),
                                                            row.limitUsd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-0.5 text-[11px] tabular-nums text-text-muted",
                                                                children: [
                                                                    formatPercent(row.limitUsedPercent),
                                                                    " of ",
                                                                    formatUsd(row.limitUsd),
                                                                    row.limitPeriod ? ` ${row.limitPeriod}` : ""
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                                lineNumber: 278,
                                                                columnNumber: 31
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-0.5 text-[11px] text-text-muted",
                                                                children: t("noUsdLimit")
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                                lineNumber: 283,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                        lineNumber: 273,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 261,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 h-2 overflow-hidden rounded-sm bg-border/60",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full rounded-sm bg-[var(--color-primary,#E54D5E)]",
                                                    style: {
                                                        width: `${barPercent}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                                lineNumber: 289,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, row.apiKeyKey, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                        lineNumber: 257,
                                        columnNumber: 23
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                                lineNumber: 253,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                        lineNumber: 173,
                        columnNumber: 13
                    }, this) : null
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
                    lineNumber: 159,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
            lineNumber: 138,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, this);
}
_s(ProviderUsdCostModal, "gpDIOK+95hlMtW8+VHb0pRXmuNk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = ProviderUsdCostModal;
var _c;
__turbopack_context__.k.register(_c, "ProviderUsdCostModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$parts$2f$QuotaCardHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$parts$2f$QuotaCardExpanded$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/parts/QuotaCardExpanded.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$ProviderUsdCostModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/ProviderUsdCostModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const STATUS_BORDER = {
    critical: "#ef4444",
    alert: "#eab308",
    ok: "#22c55e",
    empty: "transparent"
};
const EMPTY_QUOTAS = [];
function QuotaCard({ connection, quota, loading, error, refreshedAt, emailsVisible, providerLabel, onRefresh, onOpenCutoff, onOpenResetCredits, onToggleActive, togglingActive, redeemingResetCredit = false, loadingResetCredits = false, quotaVisibility, onHideQuota, onShowQuota }) {
    _s();
    const isActive = connection.isActive ?? true;
    const [costModalOpen, setCostModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const rawQuotas = quota?.quotas ?? EMPTY_QUOTAS;
    const quotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCard.useMemo[quotas]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["filterQuotasByVisibility"])(connection.provider, rawQuotas, quotaVisibility)
    }["QuotaCard.useMemo[quotas]"], [
        connection.provider,
        rawQuotas,
        quotaVisibility
    ]);
    const hiddenQuotaRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCard.useMemo[hiddenQuotaRows]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenQuotaRows"])(connection.provider, rawQuotas, quotaVisibility)
    }["QuotaCard.useMemo[hiddenQuotaRows]"], [
        connection.provider,
        rawQuotas,
        quotaVisibility
    ]);
    const cardStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCard.useMemo[cardStatus]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["worstStatus"])(quotas)
    }["QuotaCard.useMemo[cardStatus]"], [
        quotas
    ]);
    const tierMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCard.useMemo[tierMeta]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizePlanTier"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePlanValue"])(quota?.plan ?? null, connection.providerSpecificData ?? null, connection.provider))
    }["QuotaCard.useMemo[tierMeta]"], [
        quota?.plan,
        connection.providerSpecificData,
        connection.provider
    ]);
    const resolvedPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCard.useMemo[resolvedPlan]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePlanValue"])(quota?.plan ?? null, connection.providerSpecificData ?? null, connection.provider)
    }["QuotaCard.useMemo[resolvedPlan]"], [
        quota?.plan,
        connection.providerSpecificData,
        connection.provider
    ]);
    const accountLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotaCard.useMemo[accountLabel]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                connection.name,
                connection.displayName,
                connection.email
            ], emailsVisible, connection.provider) || connection.id || connection.provider
    }["QuotaCard.useMemo[accountLabel]"], [
        connection,
        emailsVisible
    ]);
    const hasOverrides = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasQuotaCutoffOverrides"])(connection);
    const hasStaleData = !!quota?.stale;
    const displayRefreshedAt = quota?.stale?.since || refreshedAt;
    const canEditCutoff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["computeCanEditCutoff"])(quotas);
    const canRedeemResetCredit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["computeCanRedeemResetCredit"])(connection.provider, quotas);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        padding: "none",
        className: `flex flex-col overflow-hidden transition-opacity ${isActive ? "" : "opacity-60"}`,
        style: {
            borderLeft: `3px solid ${STATUS_BORDER[cardStatus]}`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$parts$2f$QuotaCardHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                connection: connection,
                providerLabel: providerLabel,
                cardStatus: cardStatus,
                tierMeta: tierMeta,
                resolvedPlan: resolvedPlan,
                emailsVisible: emailsVisible,
                hasStaleData: hasStaleData,
                onToggleActive: onToggleActive,
                togglingActive: togglingActive
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCard.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$parts$2f$QuotaCardExpanded$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                quotas: quotas,
                providerId: connection.provider,
                loading: loading,
                error: error,
                message: quota?.message ?? null,
                billing: connection.provider === "grok-cli" ? quota?.billing ?? quota?.raw?.billing : null,
                refreshedAt: displayRefreshedAt,
                hasStaleData: hasStaleData,
                onRefresh: onRefresh,
                onOpenCutoff: onOpenCutoff,
                onOpenCost: ()=>setCostModalOpen(true),
                onOpenResetCredits: onOpenResetCredits,
                hiddenQuotaRows: hiddenQuotaRows,
                onHideQuota: onHideQuota,
                onShowQuota: onShowQuota,
                canEditCutoff: canEditCutoff,
                hasCutoffOverrides: hasOverrides,
                canRedeemResetCredit: canRedeemResetCredit,
                redeemingResetCredit: redeemingResetCredit,
                loadingResetCredits: loadingResetCredits
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCard.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$ProviderUsdCostModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: costModalOpen,
                onClose: ()=>setCostModalOpen(false),
                connection: connection,
                providerLabel: providerLabel,
                accountLabel: accountLabel
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCard.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCard.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
_s(QuotaCard, "EzOura6TN1UuPkomwFOjWxBzq5k=");
_c = QuotaCard;
var _c;
__turbopack_context__.k.register(_c, "QuotaCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_LABEL",
    ()=>PROVIDER_LABEL,
    "PROVIDER_ORDER",
    ()=>PROVIDER_ORDER,
    "TIER_FILTERS",
    ()=>TIER_FILTERS
]);
const PROVIDER_LABEL = {
    antigravity: "Antigravity",
    github: "GitHub Copilot",
    kiro: "Kiro AI",
    "amazon-q": "Amazon Q",
    codex: "OpenAI Codex",
    claude: "Claude Code",
    glm: "GLM (Z.AI)",
    zai: "Z.AI",
    glmt: "GLM Thinking",
    "opencode-go": "OpenCode Go",
    "ollama-cloud": "Ollama Cloud",
    "kimi-coding": "Kimi Coding",
    minimax: "MiniMax",
    "minimax-cn": "MiniMax CN",
    nanogpt: "NanoGPT",
    deepseek: "DeepSeek",
    "xai-oauth": "xAI OAuth (Grok)",
    xao: "xAI OAuth (Grok)",
    "grok-cli": "Grok Build"
};
const PROVIDER_ORDER = {
    antigravity: 1,
    github: 3,
    codex: 4,
    claude: 5,
    kiro: 6,
    glm: 7,
    zai: 8,
    glmt: 9,
    "opencode-go": 10,
    "ollama-cloud": 11,
    "kimi-coding": 12,
    minimax: 13,
    "minimax-cn": 14,
    nanogpt: 15,
    "xai-oauth": 16,
    xao: 16,
    "grok-cli": 17
};
const TIER_FILTERS = [
    {
        key: "all",
        labelKey: "tierAll"
    },
    {
        key: "enterprise",
        labelKey: "tierEnterprise"
    },
    {
        key: "team",
        labelKey: "tierTeam"
    },
    {
        key: "business",
        labelKey: "tierBusiness"
    },
    {
        key: "ultra",
        labelKey: "tierUltra"
    },
    {
        key: "pro",
        labelKey: "tierPro"
    },
    {
        key: "plus",
        labelKey: "tierPlus"
    },
    {
        key: "lite",
        labelKey: "tierLite"
    },
    {
        key: "free",
        labelKey: "tierFree"
    },
    {
        key: "unknown",
        labelKey: "tierUnknown"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/turkishText.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compareTr",
    ()=>compareTr,
    "matchesAnyToken",
    ()=>matchesAnyToken,
    "matchesSearch",
    ()=>matchesSearch,
    "normalizeForSearch",
    ()=>normalizeForSearch
]);
/**
 * Türkçe-güvenli metin normalizasyonu, arama ve sıralama yardımcıları.
 *
 * JavaScript'in locale-bağımsız `toLowerCase()`'i Türkçe `İ/I/ı/i`
 * karakterlerini bozar: `"İ".toLowerCase()` → `"i̇"` (U+0069 U+0307
 * combining dot above). Bu, `toLowerCase().includes()` tabanlı aramada
 * Türkçe girdileri eşleşmez kılar.
 *
 * Saf fonksiyonlar — yan etki ve bağımlılık yok.
 *
 * @module shared/utils/turkishText
 */ /** NFD ile katlanmayan Türkçe harfler için açık eşleme. */ const TR_FOLD = {
    ı: "i",
    ş: "s",
    ğ: "g",
    ü: "u",
    ö: "o",
    ç: "c"
};
function normalizeForSearch(input) {
    if (!input) return "";
    let s = input.toLocaleLowerCase("tr"); // İ→i, I→ı (Türkçe-güvenli)
    s = s.replace(/[ışğüöç]/g, (ch)=>TR_FOLD[ch] ?? ch); // açık Türkçe fold
    s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); // kalan aksanları sil
    return s.trim();
}
function matchesSearch(text, query) {
    const q = normalizeForSearch(query);
    if (!q) return true;
    return normalizeForSearch(text).includes(q);
}
function matchesAnyToken(text, query) {
    const q = normalizeForSearch(query);
    if (!q) return true;
    const normalizedText = normalizeForSearch(text);
    if (normalizedText.includes(q)) return true;
    return q.split(/\s+/).filter(Boolean).some((token)=>normalizedText.includes(token));
}
const trCollator = new Intl.Collator("tr", {
    sensitivity: "base",
    numeric: true
});
function compareTr(a, b) {
    return trCollator.compare(a ?? "", b ?? "");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaCardGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function QuotaCardGrid({ connections, quotaData, loading, errors, lastRefreshedAt, emailsVisible, providerLabels, renderInlineQuotaSummary: _renderInlineQuotaSummary, onRefresh, onOpenCutoff, onOpenResetCredits, onToggleActive, togglingActiveId, redeemingResetCreditId = null, loadingResetCreditsId = null, quotaVisibility, onHideQuota, onShowQuota }) {
    if (connections.length === 0) return null;
    // Group connections by provider (preserving in-group order), then order the
    // groups deterministically: PROVIDER_ORDER rank → label (locale-aware) →
    // key. Without this the group order followed first-appearance in the
    // status/reset-sorted list, so groups shuffled whenever quota refreshed.
    const groups = new Map();
    for (const conn of connections){
        const list = groups.get(conn.provider) ?? [];
        list.push(conn);
        groups.set(conn.provider, list);
    }
    const orderedProviders = [
        ...groups.keys()
    ].sort((a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compareProviderGroups"])(a, b, {
            providerOrder: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_ORDER"],
            providerLabels,
            compare: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compareTr"]
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "columns-1 2xl:columns-2 gap-6 [column-fill:_balance]",
        children: orderedProviders.map((provider)=>{
            const conns = groups.get(provider);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 break-inside-avoid mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-semibold text-text-main flex items-center gap-2",
                        children: [
                            providerLabels[provider] || provider,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-normal text-text-muted",
                                children: [
                                    "(",
                                    conns.length,
                                    " account",
                                    conns.length !== 1 ? "s" : "",
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx",
                        lineNumber: 77,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3",
                        children: conns.map((conn)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                connection: conn,
                                quota: quotaData[conn.id],
                                loading: !!loading[conn.id],
                                error: errors[conn.id] || null,
                                refreshedAt: lastRefreshedAt[conn.id],
                                emailsVisible: emailsVisible,
                                providerLabel: providerLabels[conn.provider] || conn.provider,
                                onRefresh: ()=>onRefresh(conn.id, conn.provider),
                                onOpenCutoff: ()=>onOpenCutoff(conn),
                                onOpenResetCredits: ()=>onOpenResetCredits?.(conn.id, conn.provider),
                                onToggleActive: (nextActive)=>onToggleActive(conn.id, nextActive),
                                togglingActive: togglingActiveId === conn.id,
                                redeemingResetCredit: redeemingResetCreditId === conn.id,
                                loadingResetCredits: loadingResetCreditsId === conn.id,
                                quotaVisibility: quotaVisibility,
                                onHideQuota: onHideQuota ? (q)=>onHideQuota(conn.provider, q) : undefined,
                                onShowQuota: onShowQuota ? (q)=>onShowQuota(conn.provider, q) : undefined
                            }, conn.id, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx",
                                lineNumber: 85,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx",
                        lineNumber: 83,
                        columnNumber: 13
                    }, this)
                ]
            }, provider, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx",
                lineNumber: 76,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_c = QuotaCardGrid;
var _c;
__turbopack_context__.k.register(_c, "QuotaCardGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CodexResetCreditsModal,
    "getCodexResetCreditExpiryLabel",
    ()=>getCodexResetCreditExpiryLabel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function formatRelativeExpiry(expiresAt) {
    if (!expiresAt) return null;
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (!Number.isFinite(diffMs)) return null;
    if (diffMs <= 0) return "0m";
    const minutes = Math.max(1, Math.ceil(diffMs / 60_000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.ceil(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.ceil(hours / 24)}d`;
}
function getCodexResetCreditExpiryLabel(expiresAt, locale) {
    if (!expiresAt) return {
        absolute: null,
        relative: null
    };
    const date = new Date(expiresAt);
    if (!Number.isFinite(date.getTime())) return {
        absolute: null,
        relative: null
    };
    return {
        absolute: date.toLocaleString(locale, {
            dateStyle: "medium",
            timeStyle: "short"
        }),
        relative: formatRelativeExpiry(expiresAt)
    };
}
function ResetCreditModalFooter({ confirming, loading, onBack, onClose, onConfirm, tr }) {
    if (!confirming) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            variant: "ghost",
            onClick: onClose,
            disabled: loading,
            children: tr("close", "Close")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                variant: "ghost",
                onClick: onBack,
                disabled: loading,
                children: tr("back", "Back")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                onClick: onConfirm,
                loading: loading,
                children: tr("confirmRedeemResetCreditButton", "Redeem credit")
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = ResetCreditModalFooter;
function ResetCreditConfirmation({ credit, tr }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-amber-500",
                            children: "warning"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-semibold text-text-main",
                                    children: tr("confirmRedeemResetCreditTitle", "Redeem this reset credit?")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm text-text-muted",
                                    children: tr("confirmRedeemResetCredit", "Redeeming immediately resets the eligible Codex usage windows and permanently consumes this credit.")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CreditSummary, {
                credit: credit,
                tr: tr
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_c1 = ResetCreditConfirmation;
function ResetCreditList({ availableCount, credits, loading, onSelect, tr }) {
    if (credits.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-lg border border-border p-5 text-center text-sm text-text-muted",
            children: availableCount > 0 ? tr("resetCreditsDetailsUnavailable", "Credit details are currently unavailable. Refresh and try again.") : tr("noResetCreditsAvailable", "No reset credits are available.")
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
            lineNumber: 126,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: credits.map((credit, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 rounded-lg border border-border bg-bg-subtle/40 p-3 sm:flex-row sm:items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CreditSummary, {
                        credit: credit,
                        tr: tr,
                        recommended: index === 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        size: "sm",
                        className: "shrink-0",
                        onClick: ()=>onSelect(credit.selectionToken),
                        disabled: loading,
                        children: tr("redeemThisResetCredit", "Redeem")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this)
                ]
            }, credit.selectionToken, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 140,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_c2 = ResetCreditList;
function CodexResetCreditsModal({ credits, availableCount, isOpen, loading, onClose, onRedeem }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const tr = (key, fallback, values)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, key, fallback, values);
    const [selectedCreditId, setSelectedCreditId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [confirming, setConfirming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedCredit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CodexResetCreditsModal.useMemo[selectedCredit]": ()=>credits.find({
                "CodexResetCreditsModal.useMemo[selectedCredit]": (credit)=>credit.selectionToken === selectedCreditId
            }["CodexResetCreditsModal.useMemo[selectedCredit]"]) ?? null
    }["CodexResetCreditsModal.useMemo[selectedCredit]"], [
        credits,
        selectedCreditId
    ]);
    const close = ()=>{
        if (loading) return;
        setConfirming(false);
        setSelectedCreditId(null);
        onClose();
    };
    const beginRedeem = (selectionToken)=>{
        setSelectedCreditId(selectionToken);
        setConfirming(true);
    };
    const confirmRedeem = async ()=>{
        if (!selectedCreditId) return;
        await onRedeem(selectedCreditId);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        isOpen: isOpen,
        onClose: close,
        title: tr("resetCreditsModalTitle", "Codex reset credits"),
        size: "lg",
        closeOnOverlay: !loading,
        footer: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResetCreditModalFooter, {
            confirming: confirming,
            loading: loading,
            onBack: ()=>setConfirming(false),
            onClose: close,
            onConfirm: confirmRedeem,
            tr: tr
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
            lineNumber: 203,
            columnNumber: 9
        }, this),
        children: confirming && selectedCredit ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResetCreditConfirmation, {
            credit: selectedCredit,
            tr: tr
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
            lineNumber: 214,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-text-muted",
                    children: tr("resetCreditsModalExplainer", "Credits are ordered by expiration. Automatic redemption always uses the credit that expires first.")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                    lineNumber: 217,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResetCreditList, {
                    availableCount: availableCount,
                    credits: credits,
                    loading: loading,
                    onSelect: beginRedeem,
                    tr: tr
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                    lineNumber: 223,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
            lineNumber: 216,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
        lineNumber: 196,
        columnNumber: 5
    }, this);
}
_s(CodexResetCreditsModal, "U56ZLoVqntS0blt/pm8x4J5Fv94=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c3 = CodexResetCreditsModal;
function CreditSummary({ credit, recommended = false, tr }) {
    const { absolute: expiry, relative: relativeExpiry } = getCodexResetCreditExpiryLabel(credit.expiresAt);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-w-0 flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium text-text-main",
                        children: credit.title || tr("resetCreditDefaultTitle", "Full reset")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this),
                    recommended && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary",
                        children: tr("resetCreditExpiresFirst", "Expires first")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 256,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 251,
                columnNumber: 7
            }, this),
            credit.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-xs leading-relaxed text-text-muted",
                children: credit.description
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 262,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex items-center gap-1.5 text-xs text-text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[15px]",
                        children: "schedule"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this),
                    expiry ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            tr("resetCreditExpiresAt", `Expires ${expiry}`, {
                                date: expiry
                            }),
                            relativeExpiry ? ` (${relativeExpiry})` : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 267,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: tr("resetCreditNoExpiry", "No expiration date")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx",
        lineNumber: 250,
        columnNumber: 5
    }, this);
}
_c4 = CreditSummary;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "ResetCreditModalFooter");
__turbopack_context__.k.register(_c1, "ResetCreditConfirmation");
__turbopack_context__.k.register(_c2, "ResetCreditList");
__turbopack_context__.k.register(_c3, "CodexResetCreditsModal");
__turbopack_context__.k.register(_c4, "CreditSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/useVisibleQuotaData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useVisibleQuotaData",
    ()=>useVisibleQuotaData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
;
;
function getProviderKey(connections) {
    const providers = new Set();
    for (const conn of connections){
        if (typeof conn?.provider === "string" && conn.provider) providers.add(conn.provider);
    }
    return Array.from(providers).sort().join("|");
}
function useVisibleQuotaData(connections, quotaData) {
    _s();
    const [hiddenModelsByProvider, setHiddenModelsByProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const providerKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useVisibleQuotaData.useMemo[providerKey]": ()=>getProviderKey(connections)
    }["useVisibleQuotaData.useMemo[providerKey]"], [
        connections
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useVisibleQuotaData.useEffect": ()=>{
            if (!providerKey) return;
            let alive = true;
            const providers = providerKey.split("|").filter(Boolean);
            Promise.all(providers.map({
                "useVisibleQuotaData.useEffect": async (provider)=>{
                    try {
                        const response = await fetch(`/api/provider-models?provider=${encodeURIComponent(provider)}`);
                        if (!response.ok) return [
                            provider,
                            []
                        ];
                        const data = await response.json();
                        return [
                            provider,
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["collectHiddenQuotaModelIds"])(provider, data)
                        ];
                    } catch  {
                        return [
                            provider,
                            []
                        ];
                    }
                }
            }["useVisibleQuotaData.useEffect"])).then({
                "useVisibleQuotaData.useEffect": (entries)=>{
                    if (alive) setHiddenModelsByProvider(Object.fromEntries(entries));
                }
            }["useVisibleQuotaData.useEffect"]);
            return ({
                "useVisibleQuotaData.useEffect": ()=>{
                    alive = false;
                }
            })["useVisibleQuotaData.useEffect"];
        }
    }["useVisibleQuotaData.useEffect"], [
        providerKey
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useVisibleQuotaData.useMemo": ()=>{
            const next = {};
            for (const conn of connections){
                const data = quotaData[conn.id];
                if (!data) continue;
                next[conn.id] = {
                    ...data,
                    quotas: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["filterHiddenModelQuotas"])(conn.provider, data.quotas, hiddenModelsByProvider[conn.provider])
                };
            }
            return next;
        }
    }["useVisibleQuotaData.useMemo"], [
        connections,
        hiddenModelsByProvider,
        quotaData
    ]);
}
_s(useVisibleQuotaData, "4zJWHqmJIBPKXxu3uPGlDlr+Y+0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/useCodexResetCreditRedemption.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCodexResetCreditRedemption",
    ()=>useCodexResetCreditRedemption
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/notificationStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
function createIdempotencyKey() {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function getRequestErrorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
}
function useOpenCodexResetCredits(loadingResetCreditsId, redeemingResetCreditId, setErrors, setLoadingResetCreditsId, setResetCreditPicker, idempotencyKeysRef, tr) {
    _s();
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useOpenCodexResetCredits.useCallback": async (connectionId, provider)=>{
            if (provider !== "codex" || loadingResetCreditsId || redeemingResetCreditId) return;
            setLoadingResetCreditsId(connectionId);
            setErrors({
                "useOpenCodexResetCredits.useCallback": (prev)=>({
                        ...prev,
                        [connectionId]: null
                    })
            }["useOpenCodexResetCredits.useCallback"]);
            try {
                const response = await fetch(`/api/usage/codex-reset-credit?connectionId=${encodeURIComponent(connectionId)}`, {
                    cache: "no-store"
                });
                const data = await response.json().catch({
                    "useOpenCodexResetCredits.useCallback": ()=>({})
                }["useOpenCodexResetCredits.useCallback"]);
                if (!response.ok) throw new Error(data.error || response.statusText);
                idempotencyKeysRef.current = {};
                setResetCreditPicker({
                    connectionId,
                    provider,
                    credits: Array.isArray(data.credits) ? data.credits : [],
                    availableCount: Number.isFinite(Number(data.availableCount)) ? Number(data.availableCount) : 0
                });
            } catch (error) {
                const message = getRequestErrorMessage(error, tr("resetCreditsLoadFailed", "Failed to load reset credits"));
                setErrors({
                    "useOpenCodexResetCredits.useCallback": (prev)=>({
                            ...prev,
                            [connectionId]: message
                        })
                }["useOpenCodexResetCredits.useCallback"]);
                notify.error(message);
            } finally{
                setLoadingResetCreditsId(null);
            }
        }
    }["useOpenCodexResetCredits.useCallback"], [
        idempotencyKeysRef,
        loadingResetCreditsId,
        notify,
        redeemingResetCreditId,
        setErrors,
        setLoadingResetCreditsId,
        setResetCreditPicker,
        tr
    ]);
}
_s(useOpenCodexResetCredits, "OrQg5Z4A1zUd+JD1+5wTl95/FHA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"]
    ];
});
function useRedeemCodexResetCredit(state) {
    _s1();
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRedeemCodexResetCredit.useCallback": async (selectionToken)=>{
            const picker = state.resetCreditPicker;
            if (!picker || state.redeemingResetCreditId || !selectionToken) return;
            const idempotencyKey = state.idempotencyKeysRef.current[selectionToken] ?? (state.idempotencyKeysRef.current[selectionToken] = createIdempotencyKey());
            state.setRedeemingResetCreditId(picker.connectionId);
            state.setErrors({
                "useRedeemCodexResetCredit.useCallback": (prev)=>({
                        ...prev,
                        [picker.connectionId]: null
                    })
            }["useRedeemCodexResetCredit.useCallback"]);
            try {
                const response = await fetch("/api/usage/codex-reset-credit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        connectionId: picker.connectionId,
                        idempotencyKey,
                        creditId: selectionToken
                    })
                });
                const data = await response.json().catch({
                    "useRedeemCodexResetCredit.useCallback": ()=>({})
                }["useRedeemCodexResetCredit.useCallback"]);
                if (!response.ok) throw new Error(data.error || response.statusText);
                const usage = data.usage || {};
                state.setQuotaData({
                    "useRedeemCodexResetCredit.useCallback": (prev)=>({
                            ...prev,
                            [picker.connectionId]: {
                                quotas: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseQuotaData"])(picker.provider, usage),
                                plan: usage.plan || null,
                                message: usage.message || null,
                                raw: usage,
                                stale: usage._stale ? {
                                    since: usage._staleSince,
                                    reason: usage._staleReason
                                } : null
                            }
                        })
                }["useRedeemCodexResetCredit.useCallback"]);
                state.setLastRefreshedAt({
                    "useRedeemCodexResetCredit.useCallback": (prev)=>({
                            ...prev,
                            [picker.connectionId]: new Date().toISOString()
                        })
                }["useRedeemCodexResetCredit.useCallback"]);
                state.setResetCreditPicker(null);
                state.idempotencyKeysRef.current = {};
                notify.success(state.tr("resetCreditRedeemed", "Reset redeemed"));
            } catch (error) {
                const message = getRequestErrorMessage(error, state.tr("resetCreditRedeemFailed", "Failed to redeem reset credit"));
                state.setErrors({
                    "useRedeemCodexResetCredit.useCallback": (prev)=>({
                            ...prev,
                            [picker.connectionId]: message
                        })
                }["useRedeemCodexResetCredit.useCallback"]);
                notify.error(message);
            } finally{
                state.setRedeemingResetCreditId(null);
            }
        }
    }["useRedeemCodexResetCredit.useCallback"], [
        notify,
        state
    ]);
}
_s1(useRedeemCodexResetCredit, "OrQg5Z4A1zUd+JD1+5wTl95/FHA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"]
    ];
});
function useCodexResetCreditRedemption(tr, setErrors, setQuotaData, setLastRefreshedAt) {
    _s2();
    const [redeemingResetCreditId, setRedeemingResetCreditId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingResetCreditsId, setLoadingResetCreditsId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [resetCreditPicker, setResetCreditPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const idempotencyKeysRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const openCodexResetCredits = useOpenCodexResetCredits(loadingResetCreditsId, redeemingResetCreditId, setErrors, setLoadingResetCreditsId, setResetCreditPicker, idempotencyKeysRef, tr);
    const redeemCodexResetCredit = useRedeemCodexResetCredit({
        idempotencyKeysRef,
        redeemingResetCreditId,
        resetCreditPicker,
        setErrors,
        setLastRefreshedAt,
        setQuotaData,
        setRedeemingResetCreditId,
        setResetCreditPicker,
        tr
    });
    return {
        closeResetCreditPicker: ()=>setResetCreditPicker(null),
        loadingResetCreditsId,
        openCodexResetCredits,
        redeemCodexResetCredit,
        redeemingResetCreditId,
        resetCreditPicker
    };
}
_s2(useCodexResetCreditRedemption, "qylAE4x2tV96DaZWGKfKL6vCdCM=", false, function() {
    return [
        useOpenCodexResetCredits,
        useRedeemCodexResetCredit
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/formatters.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatAutoRefreshCountdown",
    ()=>formatAutoRefreshCountdown
]);
function formatAutoRefreshCountdown(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/fetchTimeout.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FetchTimeoutError",
    ()=>FetchTimeoutError,
    "fetchWithTimeout",
    ()=>fetchWithTimeout,
    "getConfiguredTimeout",
    ()=>getConfiguredTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Fetch Timeout — T-25
 *
 * Wraps fetch() with an AbortController-based timeout.
 * Default timeout is 120 seconds (FETCH_TIMEOUT_MS env var).
 *
 * @module shared/utils/fetchTimeout
 */ const DEFAULT_TIMEOUT_MS = parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.OMNIROUTE_DEFAULT_FETCH_TIMEOUT_MS || "", 10) || 120000; // 2 minutes
const FETCH_TIMEOUT_MS = parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.FETCH_TIMEOUT_MS || "", 10) || DEFAULT_TIMEOUT_MS;
async function fetchWithTimeout(url, options = {}) {
    const { timeoutMs = FETCH_TIMEOUT_MS, signal: externalSignal, fetchFn, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    // If an external signal was provided, wire it to abort our controller too
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", ()=>controller.abort(), {
                once: true
            });
        }
    }
    try {
        const doFetch = fetchFn || globalThis.fetch;
        const response = await doFetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        return response;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new FetchTimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`, timeoutMs, String(url));
        }
        throw error;
    } finally{
        clearTimeout(timeoutId);
    }
}
class FetchTimeoutError extends Error {
    timeoutMs;
    url;
    constructor(message, timeoutMs, url){
        super(message);
        this.name = "FetchTimeoutError";
        this.timeoutMs = timeoutMs;
        this.url = url;
    }
}
function getConfiguredTimeout() {
    return FETCH_TIMEOUT_MS;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/shared/utils/providerQuotaVisibility.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isProviderQuotaVisible",
    ()=>isProviderQuotaVisible,
    "supportsProviderQuota",
    ()=>supportsProviderQuota
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-client] (ecmascript) <locals>");
;
function isProviderQuotaVisible(connection) {
    return connection.quotaVisible !== false;
}
function supportsProviderQuota(providerId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["USAGE_SUPPORTED_PROVIDERS"].includes(providerId);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProviderLimits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/utils.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/quotaParsing.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/emailPrivacyStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/notificationStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/useQuotaVisibility.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaCutoffModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCutoffModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaCardGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/QuotaCardGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$CodexResetCreditsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/CodexResetCreditsModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useVisibleQuotaData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/useVisibleQuotaData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useCodexResetCreditRedemption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/useCodexResetCreditRedemption.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$formatters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/formatters.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/i18nFallback.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/turkishText.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/fetchTimeout.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/providerQuotaVisibility.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
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
// Bound the two first-paint requests so a stalled connection cannot wedge
// `initialLoading` on `true` and freeze the quota page on its skeleton forever
// (same infinite-skeleton class as the providers page). A `try/catch` degrades a
// *rejection* to a default, but only a timeout/abort can rescue a `fetch()` that
// never settles (browser connection-pool starvation under the RSC prefetch storm).
const PROVIDER_LIMITS_FETCH_TIMEOUT_MS = 20_000;
const LS_PURCHASE_FILTER = "omniroute:limits:purchaseFilter";
const LS_STATUS_FILTER = "omniroute:limits:statusFilter";
const LS_ENV_FILTER = "omniroute:limits:envFilter";
const LS_PROVIDER_FILTER = "omniroute:limits:providerFilter";
const MIN_FETCH_INTERVAL_MS = 30000;
const QUOTA_BAR_GREEN_THRESHOLD = 50;
const QUOTA_BAR_YELLOW_THRESHOLD = 20;
const PURCHASE_TYPES = [
    {
        key: "all",
        labelKey: "purchaseAll",
        fallback: "All"
    },
    {
        key: "oauth-sub",
        labelKey: "purchaseOauthSub",
        fallback: "Subscription"
    },
    {
        key: "oauth-free",
        labelKey: "purchaseOauthFree",
        fallback: "OAuth Free"
    },
    {
        key: "apikey",
        labelKey: "purchaseApiKey",
        fallback: "API Key"
    }
];
function getPurchaseType(authType, tierKey) {
    if (authType === "apikey") return "apikey";
    if (authType === "oauth") {
        if (tierKey === "free" || tierKey === "unknown") return "oauth-free";
        return "oauth-sub";
    }
    return "oauth-free";
}
function getWorstStatus(quotas) {
    if (!quotas || quotas.length === 0) return "empty";
    let worst = "ok";
    for (const q of quotas){
        const pct = q.unlimited ? 100 : q.remainingPercentage ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calculatePercentage"])(q.used, q.total);
        if (pct <= QUOTA_BAR_YELLOW_THRESHOLD) return "critical";
        if (pct <= QUOTA_BAR_GREEN_THRESHOLD && worst === "ok") worst = "alert";
    }
    return worst;
}
function getSoonestResetMs(quotas) {
    if (!quotas || quotas.length === 0) return Number.POSITIVE_INFINITY;
    const now = Date.now();
    let soonest = Number.POSITIVE_INFINITY;
    for (const q of quotas){
        if (!q?.resetAt) continue;
        const ts = new Date(q.resetAt).getTime();
        if (Number.isFinite(ts) && ts > now && ts < soonest) soonest = ts;
    }
    return soonest;
}
function shouldAutoRefreshQuota(provider, cached) {
    const quotas = cached?.quotas;
    if (!Array.isArray(quotas) || quotas.length === 0) return true;
    if (provider !== "antigravity" && provider !== "agy") return false;
    return quotas.some((q)=>q && typeof q.modelKey === "string" && q.modelKey.startsWith("gemini-") && !q.isCredits && q.quotaSource !== "retrieveUserQuota");
}
const getQuotaBarWidthClass = (pct)=>{
    if (pct <= 10) return "w-[10%]";
    if (pct <= 20) return "w-1/5";
    if (pct <= 30) return "w-[30%]";
    if (pct <= 40) return "w-2/5";
    if (pct <= 50) return "w-1/2";
    if (pct <= 60) return "w-3/5";
    if (pct <= 70) return "w-[70%]";
    if (pct <= 80) return "w-4/5";
    if (pct <= 90) return "w-[90%]";
    return "w-full";
};
const getQuotaToneClasses = (pct)=>{
    if (pct <= QUOTA_BAR_YELLOW_THRESHOLD) return "bg-red-500 text-red-500";
    if (pct <= QUOTA_BAR_GREEN_THRESHOLD) return "bg-yellow-500 text-yellow-500";
    return "bg-green-500 text-green-500";
};
const STATUS_TONE = {
    all: {
        bar: "var(--color-text-muted)",
        text: "var(--color-text-main)",
        bg: "var(--color-bg-subtle)",
        ring: "var(--color-border)",
        dot: "var(--color-text-muted)"
    },
    critical: {
        bar: "#ef4444",
        text: "#ef4444",
        bg: "rgba(239,68,68,0.10)",
        ring: "rgba(239,68,68,0.40)",
        dot: "#ef4444"
    },
    alert: {
        bar: "#eab308",
        text: "#eab308",
        bg: "rgba(234,179,8,0.10)",
        ring: "rgba(234,179,8,0.40)",
        dot: "#eab308"
    },
    ok: {
        bar: "#22c55e",
        text: "#22c55e",
        bg: "rgba(34,197,94,0.10)",
        ring: "rgba(34,197,94,0.40)",
        dot: "#22c55e"
    },
    empty: {
        bar: "var(--color-text-muted)",
        text: "var(--color-text-muted)",
        bg: "var(--color-bg-subtle)",
        ring: "var(--color-border)",
        dot: "var(--color-text-muted)"
    }
};
// Worst aggregate across a list of statuses — drives the group header dot.
function aggregateWorst(statuses) {
    let worst = "empty";
    for (const s of statuses){
        if (s === "critical") return "critical";
        if (s === "alert" && worst !== "alert") worst = "alert";
        if (s === "ok" && worst === "empty") worst = "ok";
    }
    return worst;
}
function ProviderLimits({ showFilters = true, autoRefreshInterval = 0 }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("usage");
    const tr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[tr]": (key, fallback, values)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$i18nFallback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translateUsageOrFallback"])(t, key, fallback, values)
    }["ProviderLimits.useCallback[tr]"], [
        t
    ]);
    const emailsVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        "ProviderLimits.useEmailPrivacyStore[emailsVisible]": (s)=>s.emailsVisible
    }["ProviderLimits.useEmailPrivacyStore[emailsVisible]"]);
    const notify = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    const [connections, setConnections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [togglingActiveId, setTogglingActiveId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [quotaData, setQuotaData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [lastRefreshedAt, setLastRefreshedAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [refreshingAll, setRefreshingAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [initialLoading, setInitialLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [tierFilter, setTierFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const { quotaVisibility, handleHideQuota, handleShowQuota } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuotaVisibility"])(tr, notify);
    const resetCreditRedemption = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useCodexResetCreditRedemption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCodexResetCreditRedemption"])(tr, setErrors, setQuotaData, setLastRefreshedAt);
    const [purchaseTypeFilter, setPurchaseTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ProviderLimits.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const saved = localStorage.getItem(LS_PURCHASE_FILTER);
            return saved && PURCHASE_TYPES.some({
                "ProviderLimits.useState": (p)=>p.key === saved
            }["ProviderLimits.useState"]) ? saved : "all";
        }
    }["ProviderLimits.useState"]);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ProviderLimits.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const saved = localStorage.getItem(LS_STATUS_FILTER);
            if (saved === "all" || saved === "critical" || saved === "alert" || saved === "ok") return saved;
            return "all";
        }
    }["ProviderLimits.useState"]);
    const [envFilter, setEnvFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ProviderLimits.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem(LS_ENV_FILTER) || "all";
        }
    }["ProviderLimits.useState"]);
    const [providerFilter, setProviderFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ProviderLimits.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem(LS_PROVIDER_FILTER) || "all";
        }
    }["ProviderLimits.useState"]);
    const lastFetchTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const staleProbeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const lastRefreshAllAtRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(Date.now());
    const autoRefreshIntervalMs = autoRefreshInterval > 0 ? autoRefreshInterval * 1000 : 0;
    const [autoRefreshClock, setAutoRefreshClock] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ProviderLimits.useState": ()=>Date.now()
    }["ProviderLimits.useState"]);
    const [cutoffModalConn, setCutoffModalConn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [cutoffModalWindows, setCutoffModalWindows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [providerWindowDefaults, setProviderWindowDefaults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [globalThresholdDefault, setGlobalThresholdDefault] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(98);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderLimits.useEffect": ()=>{
            let alive = true;
            fetch("/api/providers/quota-windows").then({
                "ProviderLimits.useEffect": (r)=>r.ok ? r.json() : null
            }["ProviderLimits.useEffect"]).then({
                "ProviderLimits.useEffect": (data)=>{
                    if (!alive || !data) return;
                    setProviderWindowDefaults(data.defaults?.providerWindowDefaults || {});
                    if (typeof data.defaults?.globalThresholdPercent === "number") {
                        setGlobalThresholdDefault(data.defaults.globalThresholdPercent);
                    }
                }
            }["ProviderLimits.useEffect"]).catch({
                "ProviderLimits.useEffect": ()=>{
                /* fail silent — modal still works with empty defaults */ }
            }["ProviderLimits.useEffect"]);
            return ({
                "ProviderLimits.useEffect": ()=>{
                    alive = false;
                }
            })["ProviderLimits.useEffect"];
        }
    }["ProviderLimits.useEffect"], []);
    const saveQuotaWindowThresholds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[saveQuotaWindowThresholds]": async (connectionId, patch)=>{
            const res = await fetch(`/api/providers/${connectionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    quotaWindowThresholds: patch
                })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const newValue = data?.connection?.quotaWindowThresholds ?? null;
            setConnections({
                "ProviderLimits.useCallback[saveQuotaWindowThresholds]": (prev)=>prev.map({
                        "ProviderLimits.useCallback[saveQuotaWindowThresholds]": (c)=>c.id === connectionId ? {
                                ...c,
                                quotaWindowThresholds: newValue
                            } : c
                    }["ProviderLimits.useCallback[saveQuotaWindowThresholds]"])
            }["ProviderLimits.useCallback[saveQuotaWindowThresholds]"]);
        }
    }["ProviderLimits.useCallback[saveQuotaWindowThresholds]"], []);
    const fetchConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[fetchConnections]": async ()=>{
            try {
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchWithTimeout"])("/api/providers/client", {
                    timeoutMs: PROVIDER_LIMITS_FETCH_TIMEOUT_MS
                });
                if (!response.ok) throw new Error("Failed");
                const data = await response.json();
                const list = data.connections || [];
                setConnections(list);
                return list;
            } catch  {
                setConnections([]);
                return [];
            }
        }
    }["ProviderLimits.useCallback[fetchConnections]"], []);
    // Toggle a connection's active state straight from the quota overview, so an
    // operator can park an account that is being routed to despite low quota.
    // Mirrors saveQuotaWindowThresholds: PUT /api/providers/[id] + optimistic state.
    const handleToggleActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[handleToggleActive]": async (connectionId, nextActive)=>{
            setTogglingActiveId(connectionId);
            try {
                const res = await fetch(`/api/providers/${connectionId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        isActive: nextActive
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setConnections({
                    "ProviderLimits.useCallback[handleToggleActive]": (prev)=>prev.map({
                            "ProviderLimits.useCallback[handleToggleActive]": (c)=>c.id === connectionId ? {
                                    ...c,
                                    isActive: nextActive
                                } : c
                        }["ProviderLimits.useCallback[handleToggleActive]"])
                }["ProviderLimits.useCallback[handleToggleActive]"]);
                notify.success(nextActive ? tr("accountActivated", "Account activated") : tr("accountDeactivated", "Account deactivated"));
            } catch  {
                notify.error(tr("toggleActiveFailed", "Failed to update account status"));
            } finally{
                setTogglingActiveId(null);
            }
        }
    }["ProviderLimits.useCallback[handleToggleActive]"], [
        notify,
        tr
    ]);
    const applyCachedQuotaState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[applyCachedQuotaState]": (connectionList, caches)=>{
            const nextQuotaData = {};
            const nextLastRefreshedAt = {};
            for (const conn of connectionList){
                const cached = caches?.[conn.id];
                if (!cached) continue;
                nextQuotaData[conn.id] = {
                    quotas: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseQuotaData"])(conn.provider, cached),
                    plan: cached.plan || null,
                    message: cached.message || null,
                    raw: cached
                };
                if (cached.fetchedAt) {
                    nextLastRefreshedAt[conn.id] = cached.fetchedAt;
                }
            }
            setQuotaData(nextQuotaData);
            setLastRefreshedAt(nextLastRefreshedAt);
        }
    }["ProviderLimits.useCallback[applyCachedQuotaState]"], []);
    const fetchCachedProviderLimits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[fetchCachedProviderLimits]": async ()=>{
            try {
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchWithTimeout"])("/api/usage/provider-limits", {
                    timeoutMs: PROVIDER_LIMITS_FETCH_TIMEOUT_MS
                });
                if (!response.ok) throw new Error("Failed");
                const data = await response.json();
                return data.caches || {};
            } catch  {
                return {};
            }
        }
    }["ProviderLimits.useCallback[fetchCachedProviderLimits]"], []);
    const fetchQuota = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[fetchQuota]": async (connectionId, provider, options = {})=>{
            const force = options?.force === true;
            const now = Date.now();
            const lastFetch = lastFetchTimeRef.current[connectionId] || 0;
            if (!force && now - lastFetch < MIN_FETCH_INTERVAL_MS) {
                return;
            }
            lastFetchTimeRef.current[connectionId] = now;
            setLoading({
                "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                        ...prev,
                        [connectionId]: true
                    })
            }["ProviderLimits.useCallback[fetchQuota]"]);
            setErrors({
                "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                        ...prev,
                        [connectionId]: null
                    })
            }["ProviderLimits.useCallback[fetchQuota]"]);
            try {
                const response = await fetch(`/api/usage/${connectionId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch({
                        "ProviderLimits.useCallback[fetchQuota]": ()=>({})
                    }["ProviderLimits.useCallback[fetchQuota]"]);
                    const errorMsg = errorData.error || response.statusText;
                    if (response.status === 404) return;
                    if (response.status === 401) {
                        // The on-demand path already attempts a forced, serialized re-mint
                        // before surfacing a 401, so a 401 here means the token is genuinely
                        // dead — make that actionable instead of a silent empty card.
                        const reauthMsg = /re-?authenticat|sign in|log in/i.test(errorMsg) ? errorMsg : `${errorMsg} — re-authenticate this account.`;
                        setQuotaData({
                            "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                                    ...prev,
                                    [connectionId]: {
                                        quotas: [],
                                        message: reauthMsg
                                    }
                                })
                        }["ProviderLimits.useCallback[fetchQuota]"]);
                        setErrors({
                            "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                                    ...prev,
                                    [connectionId]: reauthMsg
                                })
                        }["ProviderLimits.useCallback[fetchQuota]"]);
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${errorMsg}`);
                }
                const data = await response.json();
                const parsedQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$quotaParsing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseQuotaData"])(provider, data);
                const hasStaleAfterReset = parsedQuotas.some({
                    "ProviderLimits.useCallback[fetchQuota].hasStaleAfterReset": (q)=>q?.staleAfterReset === true
                }["ProviderLimits.useCallback[fetchQuota].hasStaleAfterReset"]);
                if (hasStaleAfterReset) {
                    const lastProbeAt = staleProbeRef.current[connectionId] || 0;
                    if (Date.now() - lastProbeAt >= MIN_FETCH_INTERVAL_MS) {
                        staleProbeRef.current[connectionId] = Date.now();
                        setTimeout({
                            "ProviderLimits.useCallback[fetchQuota]": ()=>{
                                fetchQuota(connectionId, provider, {
                                    force: true
                                }).catch({
                                    "ProviderLimits.useCallback[fetchQuota]": ()=>{}
                                }["ProviderLimits.useCallback[fetchQuota]"]);
                            }
                        }["ProviderLimits.useCallback[fetchQuota]"], 5000);
                    }
                }
                setQuotaData({
                    "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                            ...prev,
                            [connectionId]: {
                                quotas: parsedQuotas,
                                plan: data.plan || null,
                                message: data.message || null,
                                raw: data,
                                stale: data._stale ? {
                                    since: data._staleSince,
                                    reason: data._staleReason
                                } : null
                            }
                        })
                }["ProviderLimits.useCallback[fetchQuota]"]);
                setLastRefreshedAt({
                    "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                            ...prev,
                            [connectionId]: new Date().toISOString()
                        })
                }["ProviderLimits.useCallback[fetchQuota]"]);
            } catch (error) {
                setErrors({
                    "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                            ...prev,
                            [connectionId]: error.message || "Failed to fetch quota"
                        })
                }["ProviderLimits.useCallback[fetchQuota]"]);
            } finally{
                setLoading({
                    "ProviderLimits.useCallback[fetchQuota]": (prev)=>({
                            ...prev,
                            [connectionId]: false
                        })
                }["ProviderLimits.useCallback[fetchQuota]"]);
            }
        }
    }["ProviderLimits.useCallback[fetchQuota]"], []);
    const refreshProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[refreshProvider]": async (connectionId, provider)=>{
            await fetchQuota(connectionId, provider, {
                force: true
            });
        }
    }["ProviderLimits.useCallback[refreshProvider]"], [
        fetchQuota
    ]);
    const refreshingAllRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const refreshAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[refreshAll]": async ()=>{
            if (refreshingAllRef.current) return;
            refreshingAllRef.current = true;
            const now = Date.now();
            lastRefreshAllAtRef.current = now;
            setAutoRefreshClock(now);
            setRefreshingAll(true);
            try {
                const response = await fetch("/api/usage/provider-limits", {
                    method: "POST"
                });
                if (!response.ok) {
                    const errorData = await response.json().catch({
                        "ProviderLimits.useCallback[refreshAll]": ()=>({})
                    }["ProviderLimits.useCallback[refreshAll]"]);
                    const errorMsg = errorData.error || response.statusText;
                    throw new Error(errorMsg);
                }
                const data = await response.json();
                const connectionList = await fetchConnections();
                applyCachedQuotaState(connectionList, data.caches || {});
                setErrors(data.errors || {});
            } catch (error) {
                console.error("Error refreshing all:", error);
            } finally{
                refreshingAllRef.current = false;
                setRefreshingAll(false);
            }
        }
    }["ProviderLimits.useCallback[refreshAll]"], [
        applyCachedQuotaState,
        fetchConnections
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderLimits.useEffect": ()=>{
            if (autoRefreshIntervalMs <= 0) return;
            const tick = {
                "ProviderLimits.useEffect.tick": ()=>setAutoRefreshClock(Date.now())
            }["ProviderLimits.useEffect.tick"];
            tick();
            const timer = window.setInterval(tick, 1000);
            const handleVisibilityChange = {
                "ProviderLimits.useEffect.handleVisibilityChange": ()=>{
                    if (document.visibilityState === "visible") tick();
                }
            }["ProviderLimits.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "ProviderLimits.useEffect": ()=>{
                    window.clearInterval(timer);
                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                }
            })["ProviderLimits.useEffect"];
        }
    }["ProviderLimits.useEffect"], [
        autoRefreshIntervalMs
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderLimits.useEffect": ()=>{
            if (autoRefreshIntervalMs <= 0) return;
            if (document.visibilityState !== "visible") return;
            if (refreshingAllRef.current) return;
            if (autoRefreshClock - lastRefreshAllAtRef.current >= autoRefreshIntervalMs) {
                void refreshAll();
            }
        }
    }["ProviderLimits.useEffect"], [
        autoRefreshClock,
        autoRefreshIntervalMs,
        refreshAll
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderLimits.useEffect": ()=>{
            const init = {
                "ProviderLimits.useEffect.init": async ()=>{
                    setInitialLoading(true);
                    const [connectionList, caches] = await Promise.all([
                        fetchConnections(),
                        fetchCachedProviderLimits()
                    ]);
                    applyCachedQuotaState(connectionList, caches);
                    setInitialLoading(false);
                }
            }["ProviderLimits.useEffect.init"];
            init().catch({
                "ProviderLimits.useEffect": ()=>{
                    setInitialLoading(false);
                }
            }["ProviderLimits.useEffect"]);
        }
    }["ProviderLimits.useEffect"], [
        applyCachedQuotaState,
        fetchCachedProviderLimits,
        fetchConnections
    ]);
    const filteredConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[filteredConnections]": ()=>connections.filter({
                "ProviderLimits.useMemo[filteredConnections]": (conn)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$providerQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isProviderQuotaVisible"])(conn) && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["USAGE_SUPPORTED_PROVIDERS"].includes(conn.provider) && (conn.authType === "oauth" || conn.authType === "apikey")
            }["ProviderLimits.useMemo[filteredConnections]"])
    }["ProviderLimits.useMemo[filteredConnections]"], [
        connections
    ]);
    const sortedConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[sortedConnections]": ()=>{
            return [
                ...filteredConnections
            ].sort({
                "ProviderLimits.useMemo[sortedConnections]": (a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compareQuotaConnections"])(a, b, {
                        providerOrder: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_ORDER"],
                        providerLabels: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_LABEL"],
                        compare: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compareTr"]
                    })
            }["ProviderLimits.useMemo[sortedConnections]"]);
        }
    }["ProviderLimits.useMemo[sortedConnections]"], [
        filteredConnections
    ]);
    const visibleQuotaData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useVisibleQuotaData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVisibleQuotaData"])(sortedConnections, quotaData);
    const resolvedPlanByConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[resolvedPlanByConnection]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildProviderLimitsResolvedPlans"])(sortedConnections, quotaData)
    }["ProviderLimits.useMemo[resolvedPlanByConnection]"], [
        sortedConnections,
        quotaData
    ]);
    const tierByConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[tierByConnection]": ()=>{
            const out = {};
            for (const conn of sortedConnections){
                out[conn.id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizePlanTier"])(resolvedPlanByConnection[conn.id]);
            }
            return out;
        }
    }["ProviderLimits.useMemo[tierByConnection]"], [
        sortedConnections,
        resolvedPlanByConnection
    ]);
    const tierCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[tierCounts]": ()=>{
            const counts = {
                all: sortedConnections.length,
                enterprise: 0,
                team: 0,
                business: 0,
                ultra: 0,
                pro: 0,
                plus: 0,
                lite: 0,
                free: 0,
                unknown: 0
            };
            for (const conn of sortedConnections){
                const tierKey = tierByConnection[conn.id]?.key || "unknown";
                counts[tierKey] = (counts[tierKey] || 0) + 1;
            }
            return counts;
        }
    }["ProviderLimits.useMemo[tierCounts]"], [
        sortedConnections,
        tierByConnection
    ]);
    const purchaseTypeByConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[purchaseTypeByConnection]": ()=>{
            const out = {};
            for (const conn of sortedConnections){
                const tierKey = tierByConnection[conn.id]?.key || "unknown";
                out[conn.id] = getPurchaseType(conn.authType, tierKey);
            }
            return out;
        }
    }["ProviderLimits.useMemo[purchaseTypeByConnection]"], [
        sortedConnections,
        tierByConnection
    ]);
    const statusByConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[statusByConnection]": ()=>{
            const out = {};
            for (const conn of sortedConnections){
                out[conn.id] = getWorstStatus(visibleQuotaData[conn.id]?.quotas);
            }
            return out;
        }
    }["ProviderLimits.useMemo[statusByConnection]"], [
        sortedConnections,
        visibleQuotaData
    ]);
    const purchaseTypeCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[purchaseTypeCounts]": ()=>{
            const counts = {
                all: sortedConnections.length,
                "oauth-sub": 0,
                "oauth-free": 0,
                apikey: 0
            };
            for (const conn of sortedConnections){
                const key = purchaseTypeByConnection[conn.id];
                if (key && key !== "all") counts[key] = (counts[key] || 0) + 1;
            }
            return counts;
        }
    }["ProviderLimits.useMemo[purchaseTypeCounts]"], [
        sortedConnections,
        purchaseTypeByConnection
    ]);
    const statusCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[statusCounts]": ()=>{
            const counts = {
                all: sortedConnections.length,
                critical: 0,
                alert: 0,
                ok: 0,
                empty: 0
            };
            for (const conn of sortedConnections){
                const key = statusByConnection[conn.id] || "empty";
                counts[key] = (counts[key] || 0) + 1;
            }
            return counts;
        }
    }["ProviderLimits.useMemo[statusCounts]"], [
        sortedConnections,
        statusByConnection
    ]);
    // Unique env tags from connections.providerSpecificData.tag — drives the
    // env chip filter. If no tag is set on any connection, the row hides.
    const envTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[envTags]": ()=>{
            const tags = new Set();
            for (const conn of sortedConnections){
                const tag = conn.providerSpecificData?.tag?.trim();
                if (tag) tags.add(tag);
            }
            return [
                ...tags
            ].sort({
                "ProviderLimits.useMemo[envTags]": (a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compareTr"])(a, b)
            }["ProviderLimits.useMemo[envTags]"]);
        }
    }["ProviderLimits.useMemo[envTags]"], [
        sortedConnections
    ]);
    const envCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[envCounts]": ()=>{
            const counts = {
                all: sortedConnections.length
            };
            for (const conn of sortedConnections){
                const tag = conn.providerSpecificData?.tag?.trim() || "";
                if (!tag) continue;
                counts[tag] = (counts[tag] || 0) + 1;
            }
            return counts;
        }
    }["ProviderLimits.useMemo[envCounts]"], [
        sortedConnections
    ]);
    const visibleConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[visibleConnections]": ()=>{
            const filtered = sortedConnections.filter({
                "ProviderLimits.useMemo[visibleConnections].filtered": (conn)=>{
                    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["matchesProviderFilter"])(conn, providerFilter)) return false;
                    const tierKey = tierByConnection[conn.id]?.key || "unknown";
                    if (tierFilter !== "all" && tierKey !== tierFilter) return false;
                    if (purchaseTypeFilter !== "all" && purchaseTypeByConnection[conn.id] !== purchaseTypeFilter) return false;
                    if (statusFilter !== "all" && statusByConnection[conn.id] !== statusFilter) return false;
                    if (envFilter !== "all") {
                        const tag = conn.providerSpecificData?.tag?.trim() || "";
                        if (tag !== envFilter) return false;
                    }
                    return true;
                }
            }["ProviderLimits.useMemo[visibleConnections].filtered"]);
            // Provider rank stays the outer sort key so each group keeps its fixed
            // slot (mirrors dashboard/providers determinism); "critical first, then
            // alert, then ok, then empty; tiebreak by soonest reset" only orders
            // accounts inside their own provider group.
            const statusRank = {
                critical: 0,
                alert: 1,
                ok: 2,
                empty: 3,
                all: 4
            };
            return [
                ...filtered
            ].sort({
                "ProviderLimits.useMemo[visibleConnections]": (a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compareQuotaConnections"])(a, b, {
                        providerOrder: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_ORDER"],
                        providerLabels: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_LABEL"],
                        compare: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compareTr"],
                        accountCompare: {
                            "ProviderLimits.useMemo[visibleConnections]": (x, y)=>{
                                const sx = statusRank[statusByConnection[x.id] || "empty"];
                                const sy = statusRank[statusByConnection[y.id] || "empty"];
                                if (sx !== sy) return sx - sy;
                                const rx = getSoonestResetMs(visibleQuotaData[x.id]?.quotas);
                                const ry = getSoonestResetMs(visibleQuotaData[y.id]?.quotas);
                                return rx - ry;
                            }
                        }["ProviderLimits.useMemo[visibleConnections]"]
                    })
            }["ProviderLimits.useMemo[visibleConnections]"]);
        }
    }["ProviderLimits.useMemo[visibleConnections]"], [
        sortedConnections,
        tierByConnection,
        tierFilter,
        purchaseTypeFilter,
        purchaseTypeByConnection,
        statusFilter,
        statusByConnection,
        envFilter,
        providerFilter,
        visibleQuotaData
    ]);
    // Distinct provider keys present in the current connection set (after the
    // upstream OAuth/api-key + USAGE_SUPPORTED_PROVIDERS filter), sorted via
    // the i18n-aware comparator so the dropdown follows the locale's collation.
    const providerOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProviderLimits.useMemo[providerOptions]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildProviderOptions"])(sortedConnections, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$turkishText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compareTr"])
    }["ProviderLimits.useMemo[providerOptions]"], [
        sortedConnections
    ]);
    // Auto-fetch LIVE quota on open for visible connections that have no cached
    // quota yet (e.g. a Codex account whose access_token expired — its per-connection
    // live fetch refreshes the token serialized/cascade-safe and surfaces real quota).
    // Scoped to what's on screen and to the entries actually missing data (the ones
    // that already have cache render instantly and are not re-fetched), and runs once
    // per page open so it never loops on the quotaData it writes.
    const autoLiveFetchedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProviderLimits.useEffect": ()=>{
            if (initialLoading || autoLiveFetchedRef.current || visibleConnections.length === 0) return;
            autoLiveFetchedRef.current = true;
            for (const conn of visibleConnections){
                const cached = quotaData[conn.id];
                if (shouldAutoRefreshQuota(conn.provider, cached)) {
                    void fetchQuota(conn.id, conn.provider, {
                        force: true
                    }).catch({
                        "ProviderLimits.useEffect": ()=>{}
                    }["ProviderLimits.useEffect"]);
                }
            }
        }
    }["ProviderLimits.useEffect"], [
        initialLoading,
        visibleConnections,
        quotaData,
        fetchQuota
    ]);
    const handleSetPurchaseFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[handleSetPurchaseFilter]": (value)=>{
            setPurchaseTypeFilter(value);
            try {
                localStorage.setItem(LS_PURCHASE_FILTER, value);
            } catch  {
            /* ignore */ }
        }
    }["ProviderLimits.useCallback[handleSetPurchaseFilter]"], []);
    const handleSetStatusFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[handleSetStatusFilter]": (value)=>{
            setStatusFilter(value);
            try {
                localStorage.setItem(LS_STATUS_FILTER, value);
            } catch  {
            /* ignore */ }
        }
    }["ProviderLimits.useCallback[handleSetStatusFilter]"], []);
    const handleSetEnvFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[handleSetEnvFilter]": (value)=>{
            setEnvFilter(value);
            try {
                localStorage.setItem(LS_ENV_FILTER, value);
            } catch  {
            /* ignore */ }
        }
    }["ProviderLimits.useCallback[handleSetEnvFilter]"], []);
    const handleSetProviderFilter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ProviderLimits.useCallback[handleSetProviderFilter]": (value)=>{
            setProviderFilter(value);
            try {
                localStorage.setItem(LS_PROVIDER_FILTER, value);
            } catch  {
            /* ignore */ }
        }
    }["ProviderLimits.useCallback[handleSetProviderFilter]"], []);
    const renderInlineQuotaSummary = (quotas)=>{
        if (!quotas || quotas.length === 0) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted",
            children: quotas.slice(0, 3).map((q, index)=>{
                const pct = q.unlimited ? 100 : Math.round(q.remainingPercentage ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["calculatePercentage"])(q.used, q.total));
                const cd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatCountdown"])(q.resetAt);
                const tone = getQuotaToneClasses(pct);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "inline-flex items-center gap-1",
                    title: q.displayName || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatQuotaLabel"])(q.name),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `tabular-nums ${tone.split(" ")[1]}`,
                            children: q.unlimited ? "∞" : `${pct}%`
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                            lineNumber: 775,
                            columnNumber: 15
                        }, this),
                        !q.unlimited && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "h-1 w-14 rounded-sm bg-border/60 overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `block h-full ${tone.split(" ")[0]} ${getQuotaBarWidthClass(pct)}`
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 780,
                                columnNumber: 19
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                            lineNumber: 779,
                            columnNumber: 17
                        }, this),
                        cd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: `⏱ ${cd}`
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                            lineNumber: 785,
                            columnNumber: 21
                        }, this) : null
                    ]
                }, `${q.name || "quota"}-${q.modelKey || ""}-${index}`, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                    lineNumber: 770,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
            lineNumber: 762,
            columnNumber: 7
        }, this);
    };
    if (initialLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                    lineNumber: 796,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                    lineNumber: 797,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
            lineNumber: 795,
            columnNumber: 7
        }, this);
    }
    if (sortedConnections.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            padding: "lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "material-symbols-outlined text-[64px] opacity-15",
                        children: "cloud_off"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 806,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mt-4 text-lg font-semibold text-text-main",
                        children: t("noProviders")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 807,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm text-text-muted max-w-[400px] mx-auto",
                        children: t("connectProvidersForQuota")
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 808,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                lineNumber: 805,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
            lineNumber: 804,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between flex-wrap gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-text-main m-0",
                                children: t("providerLimits")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 821,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[13px] text-text-muted",
                                children: [
                                    t("accountsCount", {
                                        count: visibleConnections.length
                                    }),
                                    visibleConnections.length !== sortedConnections.length && ` ${t("filteredFromCount", {
                                        count: sortedConnections.length
                                    })}`
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 822,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 820,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: refreshAll,
                        disabled: refreshingAll,
                        className: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-bg-subtle border border-border text-text-main text-[13px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                        title: autoRefreshIntervalMs > 0 ? tr("autoRefreshing", "Auto-refreshing") : t("refreshAll"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `material-symbols-outlined text-[16px] ${refreshingAll ? "animate-spin" : ""}`,
                                children: autoRefreshIntervalMs > 0 ? "schedule" : "refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 837,
                                columnNumber: 11
                            }, this),
                            refreshingAll ? tr("refreshing", "Refreshing") : autoRefreshIntervalMs > 0 ? `${tr("autoRefreshing", "Auto-refreshing")} ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$formatters$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatAutoRefreshCountdown"])(Math.max(0, autoRefreshIntervalMs - (autoRefreshClock - lastRefreshAllAtRef.current)))}` : t("refreshAll")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 829,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                lineNumber: 819,
                columnNumber: 7
            }, this),
            showFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 sm:grid-cols-4 gap-2",
                        children: [
                            "all",
                            "critical",
                            "alert",
                            "ok"
                        ].map((key)=>{
                            const tone = STATUS_TONE[key];
                            const labelMap = {
                                all: tr("statTotal", "Total"),
                                critical: tr("statCritical", "Critical"),
                                alert: tr("statAlert", "Alert"),
                                ok: tr("statHealthy", "Healthy")
                            };
                            const active = statusFilter === key;
                            const count = statusCounts[key] || 0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleSetStatusFilter(key),
                                className: "text-left rounded-lg px-3 py-2.5 border transition-colors cursor-pointer",
                                style: {
                                    background: active ? tone.bg : "var(--color-surface)",
                                    borderColor: active ? tone.ring : "var(--color-border)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[11px] uppercase tracking-wider font-semibold text-text-muted",
                                                children: labelMap[key]
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                                lineNumber: 881,
                                                columnNumber: 21
                                            }, this),
                                            key !== "all" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-1.5 h-1.5 rounded-full",
                                                style: {
                                                    background: tone.dot
                                                },
                                                "aria-hidden": true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                                lineNumber: 885,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                        lineNumber: 880,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-0.5 text-2xl font-bold tabular-nums",
                                        style: {
                                            color: key === "all" ? "var(--color-text-main)" : tone.text
                                        },
                                        children: count
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                        lineNumber: 892,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, key, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 870,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 858,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] uppercase tracking-wider text-text-muted font-semibold mr-1",
                                children: tr("filterPurchaseTypeLabel", "Type")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 905,
                                columnNumber: 13
                            }, this),
                            PURCHASE_TYPES.map((type)=>{
                                const count = purchaseTypeCounts[type.key] || 0;
                                if (type.key !== "all" && count === 0) return null;
                                const active = purchaseTypeFilter === type.key;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleSetPurchaseFilter(type.key),
                                    className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer",
                                    style: {
                                        border: active ? "1px solid var(--color-primary, #E54D5E)" : "1px solid var(--color-border)",
                                        background: active ? "rgba(229,77,94,0.1)" : "transparent",
                                        color: active ? "var(--color-primary, #E54D5E)" : "var(--color-text-muted)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: tr(type.labelKey, type.fallback)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 925,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "opacity-85",
                                            children: count
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 926,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, type.key, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                    lineNumber: 913,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 904,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] uppercase tracking-wider text-text-muted font-semibold mr-1",
                                children: tr("filterTierLabel", "Tier")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 934,
                                columnNumber: 13
                            }, this),
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TIER_FILTERS"].map((tier)=>{
                                if (tier.key !== "all" && !tierCounts[tier.key]) return null;
                                const active = tierFilter === tier.key;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTierFilter(tier.key),
                                    className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer",
                                    style: {
                                        border: active ? "1px solid var(--color-primary, #E54D5E)" : "1px solid var(--color-border)",
                                        background: active ? "rgba(229,77,94,0.1)" : "transparent",
                                        color: active ? "var(--color-primary, #E54D5E)" : "var(--color-text-muted)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: tier.label || t(tier.labelKey)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 953,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "opacity-85",
                                            children: tierCounts[tier.key] || 0
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 954,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, tier.key, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                    lineNumber: 941,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 933,
                        columnNumber: 11
                    }, this),
                    providerOptions.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] uppercase tracking-wider text-text-muted font-semibold mr-1",
                                children: tr("filterProviderLabel", "Provider")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 965,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: providerFilter === "all" || providerOptions.includes(providerFilter) ? providerFilter : "all",
                                onChange: (event)=>handleSetProviderFilter(event.target.value),
                                "aria-label": tr("filterProviderAriaLabel", "Filter quota providers"),
                                className: "h-8 rounded-full border border-border bg-transparent px-3 text-xs font-semibold text-text-muted cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: tr("filterProviderAll", "All providers")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                        lineNumber: 978,
                                        columnNumber: 17
                                    }, this),
                                    providerOptions.map((provider)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: provider,
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_LABEL"][provider] || provider
                                        }, provider, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 980,
                                            columnNumber: 19
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 968,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 964,
                        columnNumber: 13
                    }, this),
                    envTags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] uppercase tracking-wider text-text-muted font-semibold mr-1",
                                children: tr("filterEnvLabel", "Env")
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 991,
                                columnNumber: 15
                            }, this),
                            [
                                "all",
                                ...envTags
                            ].map((tag)=>{
                                const count = envCounts[tag] || 0;
                                const active = envFilter === tag;
                                const label = tag === "all" ? tr("filterEnvAll", "All") : tag;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleSetEnvFilter(tag),
                                    className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer",
                                    style: {
                                        border: active ? "1px solid var(--color-primary, #E54D5E)" : "1px solid var(--color-border)",
                                        background: active ? "rgba(229,77,94,0.1)" : "transparent",
                                        color: active ? "var(--color-primary, #E54D5E)" : "var(--color-text-muted)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 1011,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "opacity-85",
                                            children: count
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                            lineNumber: 1012,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, tag, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                    lineNumber: 999,
                                    columnNumber: 19
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 990,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3",
                children: [
                    visibleConnections.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-6 px-4 text-center text-text-muted text-[13px] rounded-lg border border-border bg-surface",
                        children: [
                            t("noAccountsForTierFilter"),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: (()=>{
                                    const tier = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TIER_FILTERS"].find((tier)=>tier.key === tierFilter);
                                    return tier?.label || t(tier?.labelKey || "tierUnknown");
                                })()
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                                lineNumber: 1026,
                                columnNumber: 13
                            }, this),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 1024,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaCardGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        connections: visibleConnections,
                        quotaData: visibleQuotaData,
                        loading: loading,
                        errors: errors,
                        lastRefreshedAt: lastRefreshedAt,
                        emailsVisible: emailsVisible,
                        providerLabels: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROVIDER_LABEL"],
                        renderInlineQuotaSummary: (quota)=>renderInlineQuotaSummary(quota.quotas),
                        onRefresh: refreshProvider,
                        onOpenCutoff: (conn)=>{
                            const windows = (visibleQuotaData[conn.id]?.quotas || []).filter((q)=>q && typeof q.name === "string" && !q.isCredits);
                            setCutoffModalWindows(windows);
                            setCutoffModalConn(conn);
                        },
                        onOpenResetCredits: resetCreditRedemption.openCodexResetCredits,
                        onToggleActive: handleToggleActive,
                        togglingActiveId: togglingActiveId,
                        quotaVisibility: quotaVisibility,
                        onHideQuota: handleHideQuota,
                        onShowQuota: handleShowQuota,
                        redeemingResetCreditId: resetCreditRedemption.redeemingResetCreditId,
                        loadingResetCreditsId: resetCreditRedemption.loadingResetCreditsId
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                        lineNumber: 1036,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                lineNumber: 1022,
                columnNumber: 7
            }, this),
            resetCreditRedemption.resetCreditPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$CodexResetCreditsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: true,
                credits: resetCreditRedemption.resetCreditPicker.credits,
                availableCount: resetCreditRedemption.resetCreditPicker.availableCount,
                loading: resetCreditRedemption.redeemingResetCreditId !== null,
                onClose: resetCreditRedemption.closeResetCreditPicker,
                onRedeem: resetCreditRedemption.redeemCodexResetCredit
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                lineNumber: 1065,
                columnNumber: 9
            }, this),
            cutoffModalConn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$QuotaCutoffModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: !!cutoffModalConn,
                onClose: ()=>{
                    setCutoffModalConn(null);
                    setCutoffModalWindows([]);
                },
                connectionId: cutoffModalConn.id,
                connectionName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                    cutoffModalConn.name,
                    cutoffModalConn.displayName,
                    cutoffModalConn.email
                ], emailsVisible, cutoffModalConn.provider) || cutoffModalConn.provider,
                provider: cutoffModalConn.provider,
                windows: cutoffModalWindows.map((q)=>({
                        key: q.name,
                        displayName: q.displayName || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatQuotaLabel"])(q.name)
                    })),
                current: cutoffModalConn.quotaWindowThresholds || null,
                providerDefaults: providerWindowDefaults[cutoffModalConn.provider] || {},
                globalDefaultPercent: globalThresholdDefault,
                onSave: async (patch)=>{
                    await saveQuotaWindowThresholds(cutoffModalConn.id, patch);
                    setCutoffModalConn((prev)=>{
                        if (!prev) return prev;
                        if (patch === null) return {
                            ...prev,
                            quotaWindowThresholds: null
                        };
                        const next = {
                            ...prev.quotaWindowThresholds || {}
                        };
                        for (const [k, v] of Object.entries(patch)){
                            if (v === null) delete next[k];
                            else next[k] = v;
                        }
                        return {
                            ...prev,
                            quotaWindowThresholds: Object.keys(next).length === 0 ? null : next
                        };
                    });
                }
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
                lineNumber: 1076,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx",
        lineNumber: 817,
        columnNumber: 5
    }, this);
}
_s(ProviderLimits, "EpshTZsKWvRiWf6M2YGH7swmM8U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$emailPrivacyStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useQuotaVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuotaVisibility"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useCodexResetCreditRedemption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCodexResetCreditRedemption"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$useVisibleQuotaData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVisibleQuotaData"]
    ];
});
_c = ProviderLimits;
var _c;
__turbopack_context__.k.register(_c, "ProviderLimits");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/dashboard/quota/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotaPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Loading.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(dashboard)/dashboard/usage/components/ProviderLimits/index.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function QuotaPage() {
    _s();
    const [autoRefreshEnabled, setAutoRefreshEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [autoRefreshInterval, setAutoRefreshInterval] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(180);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuotaPage.useEffect": ()=>{
            fetch("/api/settings").then({
                "QuotaPage.useEffect": (r)=>r.ok ? r.json() : {}
            }["QuotaPage.useEffect"]).then({
                "QuotaPage.useEffect": (data)=>{
                    if (typeof data.autoRefreshProviderQuota === "boolean") {
                        setAutoRefreshEnabled(data.autoRefreshProviderQuota);
                    }
                    if (typeof data.autoRefreshProviderQuotaInterval === "number") {
                        setAutoRefreshInterval(data.autoRefreshProviderQuotaInterval);
                    }
                }
            }["QuotaPage.useEffect"]).catch({
                "QuotaPage.useEffect": ()=>{
                /* keep defaults */ }
            }["QuotaPage.useEffect"]);
        }
    }["QuotaPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
            fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Loading$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardSkeleton"], {}, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/quota/page.tsx",
                lineNumber: 29,
                columnNumber: 27
            }, this),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$dashboard$292f$dashboard$2f$usage$2f$components$2f$ProviderLimits$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                autoRefreshInterval: autoRefreshEnabled ? autoRefreshInterval : 0
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/quota/page.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/quota/page.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/dashboard/quota/page.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(QuotaPage, "mNcP+lFsZvzqHHuDlTM40Hjsz6Q=");
_c = QuotaPage;
var _c;
__turbopack_context__.k.register(_c, "QuotaPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_08byu8h._.js.map