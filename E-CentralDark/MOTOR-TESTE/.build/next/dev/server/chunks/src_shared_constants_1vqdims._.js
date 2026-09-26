module.exports = [
"[project]/src/shared/constants/pricing/shared-tiers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pricing data — shared per-MTok tier constants (god-file decomposition). Pure data; merged by the barrel.
 */ __turbopack_context__.s([
    "CLAUDE_FABLE_5_PRICING",
    ()=>CLAUDE_FABLE_5_PRICING,
    "CLAUDE_OPUS_46_PRICING",
    ()=>CLAUDE_OPUS_46_PRICING,
    "CLAUDE_OPUS_4_PRICING",
    ()=>CLAUDE_OPUS_4_PRICING,
    "CLAUDE_OPUS_5_PRICING",
    ()=>CLAUDE_OPUS_5_PRICING,
    "CLAUDE_SONNET_46_PRICING",
    ()=>CLAUDE_SONNET_46_PRICING,
    "CLAUDE_SONNET_4_PRICING",
    ()=>CLAUDE_SONNET_4_PRICING,
    "CLAUDE_SONNET_5_PRICING",
    ()=>CLAUDE_SONNET_5_PRICING,
    "GLM_PRICING",
    ()=>GLM_PRICING,
    "GPT_5_3_CODEX_PRICING",
    ()=>GPT_5_3_CODEX_PRICING,
    "GPT_5_5_PRICING",
    ()=>GPT_5_5_PRICING,
    "GPT_5_6_LUNA_PRICING",
    ()=>GPT_5_6_LUNA_PRICING,
    "GPT_5_6_SOL_PRICING",
    ()=>GPT_5_6_SOL_PRICING,
    "GPT_5_6_TERRA_PRICING",
    ()=>GPT_5_6_TERRA_PRICING
]);
const GPT_5_3_CODEX_PRICING = {
    input: 5.0,
    output: 20.0,
    cached: 2.5,
    reasoning: 30.0,
    cache_creation: 5.0
};
const GPT_5_5_PRICING = {
    input: 5.0,
    output: 30.0,
    cached: 0.5,
    reasoning: 30.0,
    cache_creation: 5.0
};
const GPT_5_6_SOL_PRICING = {
    input: 5.0,
    output: 30.0,
    cached: 0.5,
    reasoning: 30.0,
    cache_creation: 6.25
};
const GPT_5_6_TERRA_PRICING = {
    input: 2.5,
    output: 15.0,
    cached: 0.25,
    reasoning: 15.0,
    cache_creation: 3.125
};
const GPT_5_6_LUNA_PRICING = {
    input: 1.0,
    output: 6.0,
    cached: 0.1,
    reasoning: 6.0,
    cache_creation: 1.25
};
const CLAUDE_FABLE_5_PRICING = {
    input: 15.0,
    output: 75.0,
    cached: 7.5,
    reasoning: 112.5,
    cache_creation: 15.0
};
const CLAUDE_OPUS_5_PRICING = {
    input: 5.0,
    output: 25.0,
    cached: 0.5,
    reasoning: 25.0,
    cache_creation: 6.25
};
const CLAUDE_OPUS_4_PRICING = {
    input: 15.0,
    output: 75.0,
    cached: 7.5,
    reasoning: 112.5,
    cache_creation: 15.0
};
const CLAUDE_SONNET_4_PRICING = {
    input: 3.0,
    output: 15.0,
    cached: 1.5,
    reasoning: 15.0,
    cache_creation: 3.0
};
const CLAUDE_OPUS_46_PRICING = {
    input: 5.0,
    output: 25.0,
    cached: 2.5,
    reasoning: 37.5,
    cache_creation: 5.0
};
const CLAUDE_SONNET_46_PRICING = {
    input: 3.0,
    output: 15.0,
    cached: 1.5,
    reasoning: 22.5,
    cache_creation: 3.0
};
const CLAUDE_SONNET_5_PRICING = {
    input: 3.0,
    output: 15.0,
    cached: 1.5,
    reasoning: 22.5,
    cache_creation: 3.0
};
const GLM_PRICING = {
    "glm-5.2": {
        input: 1.2,
        output: 5,
        cached: 0.3,
        reasoning: 5,
        cache_creation: 1.2
    },
    "glm-5.2-high": {
        input: 1.2,
        output: 5,
        cached: 0.3,
        reasoning: 5,
        cache_creation: 1.2
    },
    "glm-5.2-max": {
        input: 1.2,
        output: 5,
        cached: 0.3,
        reasoning: 5,
        cache_creation: 1.2
    },
    "glm-5.1": {
        input: 1.2,
        output: 5,
        cached: 0.3,
        reasoning: 5,
        cache_creation: 1.2
    },
    "glm-5": {
        input: 1.0,
        output: 3.2,
        cached: 0.2,
        reasoning: 4.8,
        cache_creation: 1.0
    },
    "glm-5-turbo": {
        input: 1.2,
        output: 4.0,
        cached: 0.24,
        reasoning: 4.0,
        cache_creation: 1.2
    },
    "glm-4.7-flash": {
        input: 0,
        output: 0,
        cached: 0,
        reasoning: 0,
        cache_creation: 0
    },
    "glm-4.7": {
        input: 0.6,
        output: 2.2,
        cached: 0.11,
        reasoning: 2.2,
        cache_creation: 0.6
    },
    "glm-4.6": {
        input: 0.6,
        output: 2.2,
        cached: 0.11,
        reasoning: 2.2,
        cache_creation: 0.6
    },
    "glm-4.6v": {
        input: 0.3,
        output: 0.9,
        cached: 0.05,
        reasoning: 0.9,
        cache_creation: 0.3
    },
    "glm-4.5v": {
        input: 0.6,
        output: 1.8,
        cached: 0.11,
        reasoning: 1.8,
        cache_creation: 0.6
    },
    "glm-4.5": {
        input: 0.6,
        output: 2.2,
        cached: 0.11,
        reasoning: 2.2,
        cache_creation: 0.6
    },
    "glm-4.5-air": {
        input: 0.2,
        output: 1.1,
        cached: 0.03,
        reasoning: 1.1,
        cache_creation: 0.2
    }
};
}),
"[project]/src/shared/constants/pricing/oauth-subscriptions.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PRICING_OAUTH",
    ()=>DEFAULT_PRICING_OAUTH
]);
/**
 * Pricing data — oauth-subscriptions family (OAuth / IDE subscription aliases (cc, codex, antigravity, copilot, kiro…)).
 * Pure data; merged by default-pricing.ts via spread (god-file decomposition; semantic split).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/shared-tiers.ts [middleware] (ecmascript)");
;
const DEFAULT_PRICING_OAUTH = {
    cc: {
        "claude-fable-5": {
            input: 10.0,
            output: 50.0,
            cached: 1.0,
            reasoning: 50.0,
            cache_creation: 12.5
        },
        "claude-opus-5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_5_PRICING"],
        "claude-opus-4-8": {
            input: 5.0,
            output: 25.0,
            cached: 0.5,
            reasoning: 25.0,
            cache_creation: 6.25
        },
        "claude-opus-4-7": {
            input: 5.0,
            output: 25.0,
            cached: 0.5,
            reasoning: 25.0,
            cache_creation: 6.25
        },
        "claude-opus-4-6": {
            input: 5.0,
            output: 25.0,
            cached: 0.5,
            reasoning: 25.0,
            cache_creation: 6.25
        },
        "claude-sonnet-4-6": {
            input: 3.0,
            output: 15.0,
            cached: 0.3,
            reasoning: 15.0,
            cache_creation: 3.75
        },
        "claude-sonnet-5": {
            input: 3.0,
            output: 15.0,
            cached: 0.3,
            reasoning: 15.0,
            cache_creation: 3.75
        },
        "claude-opus-4-5-20251101": {
            input: 5.0,
            output: 25.0,
            cached: 0.5,
            reasoning: 25.0,
            cache_creation: 6.25
        },
        "claude-sonnet-4-5-20250929": {
            input: 3.0,
            output: 15.0,
            cached: 0.3,
            reasoning: 15.0,
            cache_creation: 3.75
        },
        "claude-haiku-4-5-20251001": {
            input: 1.0,
            output: 5.0,
            cached: 0.1,
            reasoning: 5.0,
            cache_creation: 1.25
        }
    },
    cx: {
        "codex-auto-review": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        // Codex uses credits per 1M tokens. OmniRoute stores the dollar-equivalent
        // values below at the documented conversion of 25 credits per USD.
        "gpt-5.6-sol": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol-ultra": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol-max": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol-xhigh": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol-high": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol-medium": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol-low": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-terra": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-terra-ultra": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-terra-max": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-terra-xhigh": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-terra-high": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-terra-medium": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-terra-low": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-luna": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        "gpt-5.6-luna-max": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        "gpt-5.6-luna-xhigh": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        "gpt-5.6-luna-high": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        "gpt-5.6-luna-medium": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        "gpt-5.6-luna-low": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        // GPT 5.5
        "gpt-5.5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        "gpt5.5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        "gpt-5.5-xhigh": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        "gpt-5.5-high": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        "gpt-5.5-medium": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        "gpt-5.5-low": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        "gpt-5.5-none": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        // GPT 5.3 Codex family (all same pricing tier)
        "gpt-5.3-codex-spark": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_3_CODEX_PRICING"],
        "gpt-5.3-codex": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_3_CODEX_PRICING"],
        "gpt-5.3-codex-xhigh": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_3_CODEX_PRICING"],
        "gpt-5.3-codex-high": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_3_CODEX_PRICING"],
        "gpt-5.3-codex-low": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_3_CODEX_PRICING"],
        "gpt-5.3-codex-none": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_3_CODEX_PRICING"],
        "gpt-5.1-codex-mini-high": {
            input: 1.5,
            output: 6.0,
            cached: 0.75,
            reasoning: 9.0,
            cache_creation: 1.5
        },
        "gpt-5.2-codex": {
            input: 5.0,
            output: 20.0,
            cached: 2.5,
            reasoning: 30.0,
            cache_creation: 5.0
        },
        "gpt-5.2": {
            input: 5.0,
            output: 20.0,
            cached: 2.5,
            reasoning: 30.0,
            cache_creation: 5.0
        },
        "gpt-5.1-codex-max": {
            input: 8.0,
            output: 32.0,
            cached: 4.0,
            reasoning: 48.0,
            cache_creation: 8.0
        },
        "gpt-5.1-codex": {
            input: 4.0,
            output: 16.0,
            cached: 2.0,
            reasoning: 24.0,
            cache_creation: 4.0
        },
        "gpt-5.1-codex-mini": {
            input: 1.5,
            output: 6.0,
            cached: 0.75,
            reasoning: 9.0,
            cache_creation: 1.5
        },
        "gpt-5.1": {
            input: 4.0,
            output: 16.0,
            cached: 2.0,
            reasoning: 24.0,
            cache_creation: 4.0
        },
        "gpt-5-codex": {
            input: 3.0,
            output: 12.0,
            cached: 1.5,
            reasoning: 18.0,
            cache_creation: 3.0
        },
        "gpt-5-codex-mini": {
            input: 1.0,
            output: 4.0,
            cached: 0.5,
            reasoning: 6.0,
            cache_creation: 1.0
        }
    },
    if: {
        "qwen3-coder-plus": {
            input: 1.0,
            output: 4.0,
            cached: 0.5,
            reasoning: 6.0,
            cache_creation: 1.0
        },
        "kimi-k2": {
            input: 1.0,
            output: 4.0,
            cached: 0.5,
            reasoning: 6.0,
            cache_creation: 1.0
        },
        "kimi-k2-thinking": {
            input: 1.5,
            output: 6.0,
            cached: 0.75,
            reasoning: 9.0,
            cache_creation: 1.5
        },
        "deepseek-r1": {
            input: 0.75,
            output: 3.0,
            cached: 0.375,
            reasoning: 4.5,
            cache_creation: 0.75
        },
        "deepseek-v3.2-chat": {
            input: 0.28,
            output: 0.42,
            cached: 0.014,
            reasoning: 0.63,
            cache_creation: 0.28
        },
        "deepseek-v3.2": {
            input: 0.28,
            output: 0.42,
            cached: 0.014,
            reasoning: 0.63,
            cache_creation: 0.28
        },
        "deepseek-v3.2-reasoner": {
            input: 0.55,
            output: 2.19,
            cached: 0.14,
            reasoning: 2.19,
            cache_creation: 0.55
        },
        // Short-form aliases (Mar 2026)
        "deepseek-3.1": {
            input: 0.27,
            output: 1.1,
            cached: 0.07,
            reasoning: 2.2,
            cache_creation: 0.27
        },
        "deepseek-3.2": {
            input: 0.27,
            output: 1.1,
            cached: 0.07,
            reasoning: 2.2,
            cache_creation: 0.27
        },
        "minimax-m2": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        },
        "glm-4.6": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        },
        "glm-4.7": {
            input: 0.75,
            output: 3.0,
            cached: 0.375,
            reasoning: 4.5,
            cache_creation: 0.75
        }
    },
    ag: {
        "gemini-3.1-pro-low": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        // Antigravity 2.0.4+ exposes Gemini 3.5 Flash as three public client ids
        // (see ANTIGRAVITY_PUBLIC_MODELS in open-sse/config/antigravityModelAliases.ts):
        //   gemini-3.5-flash-extra-low → "Gemini 3.5 Flash (Low)"
        //   gemini-3-flash-agent   → "Gemini 3.5 Flash (High)"
        //   gemini-3.5-flash-low   → "Gemini 3.5 Flash (Medium)"
        // Without these rows, getPricingForModel("ag", id) returns null and downstream
        // cost and quota calculations silently fall back to $0.
        "gemini-3.5-flash-extra-low": {
            input: 0.5,
            output: 3.0,
            cached: 0.03,
            reasoning: 4.5,
            cache_creation: 0.5
        },
        "gemini-3-flash-agent": {
            input: 0.5,
            output: 3.0,
            cached: 0.03,
            reasoning: 4.5,
            cache_creation: 0.5
        },
        "gemini-3.5-flash-low": {
            input: 0.5,
            output: 3.0,
            cached: 0.03,
            reasoning: 4.5,
            cache_creation: 0.5
        },
        // `gemini-pro-agent` is the callable Antigravity id for Gemini 3.1 Pro (High).
        "gemini-pro-agent": {
            input: 4.0,
            output: 18.0,
            cached: 0.5,
            reasoning: 27.0,
            cache_creation: 4.0
        },
        // Gemini 3.6 Flash (released 2026-07-21) - three tier variants like 3.5 Flash
        // (see ANTIGRAVITY_PUBLIC_MODELS / MODEL_SPECS which already carry the catalog
        // entries). Without these rows, getPricingForModel("ag", id) returns null and
        // downstream cost and quota calculations silently fall back to $0.
        // Pricing: $1.50 input / $7.50 output / $0.15 cached per MTok. Thinking tokens
        // billed at output rate.
        "gemini-3.6-flash-low": {
            input: 1.5,
            output: 7.5,
            cached: 0.15,
            reasoning: 7.5,
            cache_creation: 1.5
        },
        "gemini-3.6-flash-medium": {
            input: 1.5,
            output: 7.5,
            cached: 0.15,
            reasoning: 7.5,
            cache_creation: 1.5
        },
        "gemini-3.6-flash-high": {
            input: 1.5,
            output: 7.5,
            cached: 0.15,
            reasoning: 7.5,
            cache_creation: 1.5
        },
        "claude-sonnet-4-6": {
            input: 3.0,
            output: 15.0,
            cached: 0.3,
            reasoning: 22.5,
            cache_creation: 3.0
        },
        "claude-opus-4-6-thinking": {
            input: 5.0,
            output: 25.0,
            cached: 0.5,
            reasoning: 37.5,
            cache_creation: 5.0
        },
        "gpt-oss-120b-medium": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        }
    },
    gh: {
        "claude-opus-5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_5_PRICING"],
        "gpt-5": {
            input: 3.0,
            output: 12.0,
            cached: 1.5,
            reasoning: 18.0,
            cache_creation: 3.0
        },
        "gpt-5-mini": {
            input: 0.75,
            output: 3.0,
            cached: 0.375,
            reasoning: 4.5,
            cache_creation: 0.75
        },
        "gpt-5.1-codex": {
            input: 4.0,
            output: 16.0,
            cached: 2.0,
            reasoning: 24.0,
            cache_creation: 4.0
        },
        "gpt-5.1-codex-max": {
            input: 8.0,
            output: 32.0,
            cached: 4.0,
            reasoning: 48.0,
            cache_creation: 8.0
        },
        "gpt-4.1": {
            input: 2.5,
            output: 10.0,
            cached: 1.25,
            reasoning: 15.0,
            cache_creation: 2.5
        },
        "claude-4.5-sonnet": {
            input: 3.0,
            output: 15.0,
            cached: 0.3,
            reasoning: 22.5,
            cache_creation: 3.0
        },
        "claude-4.5-opus": {
            input: 5.0,
            output: 25.0,
            cached: 0.5,
            reasoning: 37.5,
            cache_creation: 5.0
        },
        "claude-4.5-haiku": {
            input: 0.5,
            output: 2.5,
            cached: 0.05,
            reasoning: 3.75,
            cache_creation: 0.5
        },
        "gemini-3-pro": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "gemini-3-flash": {
            input: 0.5,
            output: 3.0,
            cached: 0.03,
            reasoning: 4.5,
            cache_creation: 0.5
        },
        "gemini-2.5-pro": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "grok-code-fast-1": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        }
    },
    kiro: {
        "claude-sonnet-4.5": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 15.0,
            cache_creation: 3.0
        },
        "claude-haiku-4.5": {
            input: 0.5,
            output: 2.5,
            cached: 0.25,
            reasoning: 2.5,
            cache_creation: 0.5
        },
        "claude-sonnet-5": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 15.0,
            cache_creation: 3.0
        },
        "deepseek-v3.2": {
            input: 0.27,
            output: 1.1,
            cached: 0.07,
            reasoning: 1.1,
            cache_creation: 0.27
        },
        // Registry exposes this model as "deepseek-3.2" (no "v") — keep both keys priced.
        "deepseek-3.2": {
            input: 0.27,
            output: 1.1,
            cached: 0.07,
            reasoning: 1.1,
            cache_creation: 0.27
        },
        "minimax-m2.1": {
            input: 0.4,
            output: 1.6,
            cached: 0.1,
            reasoning: 1.6,
            cache_creation: 0.4
        },
        // MiniMax M2.5 — cheaper than M2.1, reasoning + tools
        "minimax-m2.5": {
            input: 0.27,
            output: 0.95,
            cached: 0.135,
            reasoning: 1.425,
            cache_creation: 0.27
        },
        "glm-5": {
            input: 1.0,
            output: 3.2,
            cached: 0.2,
            reasoning: 4.8,
            cache_creation: 1.0
        },
        "qwen3-coder-next": {
            input: 2.0,
            output: 8.0,
            cached: 0.5,
            reasoning: 8.0,
            cache_creation: 2.0
        },
        // Kiro's GPT-5.6 family (kiro.dev/changelog/models, 2026-07-14) — same
        // per-tier rates the codex/openai aliases already bill at.
        "gpt-5.6-sol": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-terra": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-luna": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"]
    }
};
}),
"[project]/src/shared/constants/pricing/frontier-labs.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PRICING_FRONTIER",
    ()=>DEFAULT_PRICING_FRONTIER
]);
/**
 * Pricing data — frontier-labs family (first-party frontier model labs).
 * Pure data; merged by default-pricing.ts via spread (god-file decomposition; semantic split).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/shared-tiers.ts [middleware] (ecmascript)");
;
const DEFAULT_PRICING_FRONTIER = {
    openai: {
        "gpt-5.6": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-sol": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_SOL_PRICING"],
        "gpt-5.6-terra": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_TERRA_PRICING"],
        "gpt-5.6-luna": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_6_LUNA_PRICING"],
        "gpt-5.5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        // The -pro tier mirrors its base family pricing until OpenAI publishes a
        // distinct pro rate; without these rows the openai provider's gpt-5.x-pro
        // models (in the registry) resolved to $0 and tripped the catalog pricing gate.
        "gpt-5.5-pro": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GPT_5_5_PRICING"],
        // gpt-5.4 family (public API tier, with a lower nano tier). Without these rows the openai
        // provider's gpt-5.4* models resolved to $0.
        "gpt-5.4": {
            input: 5.0,
            output: 20.0,
            cached: 2.5,
            reasoning: 30.0,
            cache_creation: 5.0
        },
        "gpt-5.4-pro": {
            input: 5.0,
            output: 20.0,
            cached: 2.5,
            reasoning: 30.0,
            cache_creation: 5.0
        },
        "gpt-5.4-mini": {
            input: 1.5,
            output: 6.0,
            cached: 0.75,
            reasoning: 9.0,
            cache_creation: 1.5
        },
        "gpt-5.4-nano": {
            input: 0.4,
            output: 1.6,
            cached: 0.2,
            reasoning: 2.4,
            cache_creation: 0.4
        },
        "gpt-4.1": {
            input: 2.0,
            output: 8.0,
            cached: 0.5,
            reasoning: 12.0,
            cache_creation: 2.0
        },
        "gpt-4.1-mini": {
            input: 0.4,
            output: 1.6,
            cached: 0.1,
            reasoning: 2.4,
            cache_creation: 0.4
        },
        "gpt-4.1-nano": {
            input: 0.1,
            output: 0.4,
            cached: 0.025,
            reasoning: 0.6,
            cache_creation: 0.1
        },
        "gpt-4o": {
            input: 2.5,
            output: 10.0,
            cached: 1.25,
            reasoning: 15.0,
            cache_creation: 2.5
        },
        "gpt-4o-2024-11-20": {
            input: 2.5,
            output: 10.0,
            cached: 1.25,
            reasoning: 15.0,
            cache_creation: 2.5
        },
        "gpt-4o-mini": {
            input: 0.15,
            output: 0.6,
            cached: 0.075,
            reasoning: 0.9,
            cache_creation: 0.15
        },
        o3: {
            input: 2.0,
            output: 8.0,
            cached: 0.5,
            reasoning: 12.0,
            cache_creation: 2.0
        },
        "o3-mini": {
            input: 1.1,
            output: 4.4,
            cached: 0.55,
            reasoning: 6.6,
            cache_creation: 1.1
        },
        "o4-mini": {
            input: 1.1,
            output: 4.4,
            cached: 0.275,
            reasoning: 6.6,
            cache_creation: 1.1
        },
        "gpt-4-turbo": {
            input: 10.0,
            output: 30.0,
            cached: 5.0,
            reasoning: 45.0,
            cache_creation: 10.0
        },
        o1: {
            input: 15.0,
            output: 60.0,
            cached: 7.5,
            reasoning: 90.0,
            cache_creation: 15.0
        },
        "o1-mini": {
            input: 3.0,
            output: 12.0,
            cached: 1.5,
            reasoning: 18.0,
            cache_creation: 3.0
        }
    },
    anthropic: {
        "claude-sonnet-4-20250514": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 15.0,
            cache_creation: 3.0
        },
        "claude-opus-4-20250514": {
            input: 15.0,
            output: 75.0,
            cached: 7.5,
            reasoning: 112.5,
            cache_creation: 15.0
        },
        "claude-3-5-sonnet-20241022": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 15.0,
            cache_creation: 3.0
        },
        // Claude 4.5 Haiku — modelo eco mais recente da Anthropic (2025-10)
        "claude-haiku-4-5-20251001": {
            input: 1.0,
            output: 5.0,
            cached: 0.5,
            reasoning: 7.5,
            cache_creation: 1.0
        },
        "claude-haiku-4.5": {
            input: 1.0,
            output: 5.0,
            cached: 0.5,
            reasoning: 7.5,
            cache_creation: 1.0
        },
        // Claude Sonnet 4.6 — maxOutput 64k tokens, $3/$15/M
        "claude-sonnet-4-6-20251031": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 22.5,
            cache_creation: 3.0
        },
        "claude-sonnet-4.6": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 22.5,
            cache_creation: 3.0
        },
        // Claude Opus 4.6 — mais barato que Opus 4 ($5/$25 vs $15/$75)
        "claude-opus-4-6-20251031": {
            input: 5.0,
            output: 25.0,
            cached: 2.5,
            reasoning: 37.5,
            cache_creation: 5.0
        },
        "claude-opus-4.6": {
            input: 5.0,
            output: 25.0,
            cached: 2.5,
            reasoning: 37.5,
            cache_creation: 5.0
        },
        // Common model IDs (without dates) used across providers
        // Intentional duplicates of dot-notation variants (e.g. claude-opus-4.6)
        // to cover hyphen-notation IDs (claude-opus-4-6) used by some clients
        "claude-fable-5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_FABLE_5_PRICING"],
        "claude-opus-5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_5_PRICING"],
        "claude-sonnet-5": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_SONNET_5_PRICING"],
        "claude-opus-4.8": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_4_PRICING"],
        "claude-opus-4-8": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_4_PRICING"],
        "claude-opus-4-7": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_4_PRICING"],
        "claude-opus-4-6": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_46_PRICING"],
        "claude-sonnet-4-6": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_SONNET_46_PRICING"],
        "claude-opus-4-5-20251101": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_4_PRICING"],
        "claude-sonnet-4-5-20250929": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_SONNET_4_PRICING"],
        "claude-sonnet-4": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_SONNET_4_PRICING"],
        "claude-opus-4": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_OPUS_4_PRICING"]
    },
    gemini: {
        // Gemini 3.1 Pro — novo flagship Google (2026-03-17)
        // Context: 1.050.000 tokens | Max Output: 65.536
        "gemini-3.1-pro": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "gemini-3-1-pro": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "gemini-3-pro-preview": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "gemini-3.1-pro-preview": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "gemini-2.5-pro": {
            input: 2.0,
            output: 12.0,
            cached: 0.25,
            reasoning: 18.0,
            cache_creation: 2.0
        },
        "gemini-2.5-flash": {
            input: 0.3,
            output: 2.5,
            cached: 0.03,
            reasoning: 3.75,
            cache_creation: 0.3
        },
        // Gemini 2.5 Flash Lite — preco corrigido: $0.10/$0.40 (ClawRouter)
        "gemini-2.5-flash-lite": {
            input: 0.1,
            output: 0.4,
            cached: 0.025,
            reasoning: 0.6,
            cache_creation: 0.1
        }
    },
    deepseek: {
        "deepseek-chat": {
            input: 0.28,
            output: 0.42,
            cached: 0.014,
            reasoning: 0.42,
            cache_creation: 0.28
        },
        "deepseek-v3": {
            input: 0.28,
            output: 0.42,
            cached: 0.014,
            reasoning: 0.42,
            cache_creation: 0.28
        },
        "deepseek-v3.2": {
            input: 0.28,
            output: 0.42,
            cached: 0.014,
            reasoning: 0.42,
            cache_creation: 0.28
        },
        "deepseek-reasoner": {
            input: 0.55,
            output: 2.19,
            cached: 0.14,
            reasoning: 2.19,
            cache_creation: 0.55
        },
        "deepseek-r1": {
            input: 0.55,
            output: 2.19,
            cached: 0.14,
            reasoning: 2.19,
            cache_creation: 0.55
        },
        // DeepSeek V4 Pro — promo until 2026-05-31, then list ($0.145 / $3.48)
        "deepseek-v4-pro": {
            input: 0.435,
            output: 0.87,
            cached: 0.0036,
            reasoning: 0.87,
            cache_creation: 0.435
        },
        "deepseek-v4-flash": {
            input: 0.07,
            output: 0.28,
            cached: 0.014,
            reasoning: 0.28,
            cache_creation: 0.07
        }
    },
    blackbox: {
        "gpt-4o": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gemini-2.5-flash": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "claude-sonnet-4": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-v3": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        blackboxai: {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "blackboxai-pro": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    xai: {
        "grok-3": {
            input: 3.0,
            output: 15.0,
            cached: 1.5,
            reasoning: 22.5,
            cache_creation: 3.0
        },
        "grok-3-mini": {
            input: 0.3,
            output: 0.5,
            cached: 0.15,
            reasoning: 0.75,
            cache_creation: 0.3
        },
        // Grok-4 Fast Family — ultrabaratos ($0.20/$0.50/M)
        "grok-4-fast-non-reasoning": {
            input: 0.2,
            output: 0.5,
            cached: 0.1,
            reasoning: 0.0,
            cache_creation: 0.2
        },
        "grok-4-fast-reasoning": {
            input: 0.2,
            output: 0.5,
            cached: 0.1,
            reasoning: 0.75,
            cache_creation: 0.2
        },
        "grok-4-1-fast-non-reasoning": {
            input: 0.2,
            output: 0.5,
            cached: 0.1,
            reasoning: 0.0,
            cache_creation: 0.2
        },
        "grok-4-1-fast-reasoning": {
            input: 0.2,
            output: 0.5,
            cached: 0.1,
            reasoning: 0.75,
            cache_creation: 0.2
        },
        "grok-4-0709": {
            input: 0.2,
            output: 1.5,
            cached: 0.1,
            reasoning: 2.25,
            cache_creation: 0.2
        }
    }
};
}),
"[project]/src/shared/constants/pricing/inference-hosts.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pricing data — inference-hosts family (serverless GPU / OSS-model hosts + aggregator gateways).
 * Pure data; merged by default-pricing.ts via spread (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "DEFAULT_PRICING_INFERENCE",
    ()=>DEFAULT_PRICING_INFERENCE
]);
const DEFAULT_PRICING_INFERENCE = {
    agentrouter: {
        auto: {
            input: 2.0,
            output: 8.0
        }
    },
    openrouter: {
        auto: {
            input: 2.0,
            output: 8.0,
            cached: 1.0,
            reasoning: 12.0,
            cache_creation: 2.0
        }
    },
    // Cheaper Inference resale rates — captured from GET /v1/models on 2026-07-31
    // (the catalog reports discount_percent "30.00" against model-maker list price).
    // USD per 1M tokens. `reasoning` mirrors `output`: the gateway bills reasoning
    // tokens at the output rate. Live drift is available via GET /v1/pricing/changes,
    // which is intentionally not auto-synced.
    cheaperinference: {
        "aion-labs.aion-2-0": {
            input: 0.56,
            output: 1.12,
            cached: 0.175,
            reasoning: 1.12,
            cache_creation: 0.56
        },
        "claude-fable-5": {
            input: 7.0,
            output: 35.0,
            cached: 0.84,
            reasoning: 35.0,
            cache_creation: 10.5
        },
        "claude-haiku-4.5": {
            input: 1.0,
            output: 5.0,
            cached: 0.1,
            reasoning: 5.0,
            cache_creation: 1.0
        },
        "claude-opus-4-7-fast": {
            input: 21.0,
            output: 105.0,
            cached: 2.1,
            reasoning: 105.0,
            cache_creation: 21.0
        },
        "claude-opus-4-8-fast": {
            input: 7.0,
            output: 35.0,
            cached: 0.7,
            reasoning: 35.0,
            cache_creation: 7.0
        },
        "claude-opus-4.5": {
            input: 3.5,
            output: 17.5,
            cached: 0.42,
            reasoning: 17.5,
            cache_creation: 3.5
        },
        "claude-opus-4.6": {
            input: 3.5,
            output: 17.5,
            cached: 0.42,
            reasoning: 17.5,
            cache_creation: 3.5
        },
        "claude-opus-4.7": {
            input: 3.5,
            output: 17.5,
            cached: 0.42,
            reasoning: 17.5,
            cache_creation: 3.5
        },
        "claude-opus-4.8": {
            input: 4.2,
            output: 21.0,
            cached: 0.42,
            reasoning: 21.0,
            cache_creation: 5.25
        },
        "claude-opus-5": {
            input: 3.5,
            output: 17.5,
            cached: 0.35,
            reasoning: 17.5,
            cache_creation: 4.375
        },
        "claude-opus-5-fast": {
            input: 7.0,
            output: 35.0,
            cached: 0.7,
            reasoning: 35.0,
            cache_creation: 8.75
        },
        "claude-sonnet-4.5": {
            input: 2.1,
            output: 10.5,
            cached: 0.2625,
            reasoning: 10.5,
            cache_creation: 3.2812
        },
        "claude-sonnet-4.6": {
            input: 2.1,
            output: 10.5,
            cached: 0.252,
            reasoning: 10.5,
            cache_creation: 3.15
        },
        "claude-sonnet-5": {
            input: 1.4,
            output: 7.0,
            cached: 0.14,
            reasoning: 7.0,
            cache_creation: 1.75
        },
        "deepseek-v4-flash": {
            input: 0.098,
            output: 0.196,
            cached: 0.0196,
            reasoning: 0.196,
            cache_creation: 0.098
        },
        "deepseek-v4-pro": {
            input: 0.3045,
            output: 0.609,
            cached: 0.231,
            reasoning: 0.609,
            cache_creation: 0.3045
        },
        "gemini-2.5-flash": {
            input: 0.21,
            output: 1.75,
            cached: 0.021,
            reasoning: 1.75,
            cache_creation: 0.0583
        },
        "gemini-3-5-flash": {
            input: 1.05,
            output: 6.3,
            cached: 0.1085,
            reasoning: 6.3,
            cache_creation: 0.0602
        },
        "gemini-3-flash-preview": {
            input: 0.35,
            output: 2.1,
            cached: 0.049,
            reasoning: 2.1,
            cache_creation: 0.35
        },
        "gemini-3.1-flash-lite": {
            input: 0.2485,
            output: 1.4913,
            cached: 0.0249,
            reasoning: 1.4913,
            cache_creation: 0.0828
        },
        "gemini-3.1-pro": {
            input: 2.0,
            output: 12.0,
            cached: 0.2,
            reasoning: 12.0,
            cache_creation: 0.375
        },
        "gemini-3.1-pro-preview": {
            input: 1.4,
            output: 8.4,
            cached: 0.4375,
            reasoning: 8.4,
            cache_creation: 1.4
        },
        "glm-4.5": {
            input: 0.42,
            output: 1.54,
            cached: 0.077,
            reasoning: 1.54,
            cache_creation: 0.42
        },
        "glm-4.5-air": {
            input: 0.14,
            output: 0.77,
            cached: 0.021,
            reasoning: 0.77,
            cache_creation: 0.14
        },
        "glm-4.6": {
            input: 0.42,
            output: 1.54,
            cached: 0.21,
            reasoning: 1.54,
            cache_creation: 0.42
        },
        "glm-4.7": {
            input: 0.42,
            output: 1.54,
            cached: 0.11,
            reasoning: 1.54,
            cache_creation: 0.42
        },
        "glm-5": {
            input: 0.7,
            output: 2.24,
            cached: 0.2,
            reasoning: 2.24,
            cache_creation: 0.7
        },
        "glm-5.1": {
            input: 0.98,
            output: 3.08,
            cached: 0.2275,
            reasoning: 3.08,
            cache_creation: 0.98
        },
        "glm-5.2": {
            input: 0.77,
            output: 2.42,
            cached: 0.11,
            reasoning: 2.42,
            cache_creation: 0.77
        },
        "google/gemini-3.5-flash-lite": {
            input: 0.3,
            output: 2.5,
            cached: 0.03,
            reasoning: 2.5,
            cache_creation: 0.3
        },
        "gpt-5.4": {
            input: 1.75,
            output: 10.5,
            cached: 0.2191,
            reasoning: 10.5,
            cache_creation: 1.75
        },
        "gpt-5.4-mini": {
            input: 0.525,
            output: 3.15,
            cached: 0.0656,
            reasoning: 3.15,
            cache_creation: 0.525
        },
        "gpt-5.5": {
            input: 3.5,
            output: 21.0,
            cached: 0.4375,
            reasoning: 21.0,
            cache_creation: 3.5
        },
        "gpt-5.6-luna": {
            input: 0.4,
            output: 2.4,
            cached: 0.05,
            reasoning: 2.4,
            cache_creation: 0.4
        },
        "gpt-5.6-sol": {
            input: 3.5,
            output: 21.0,
            cached: 0.4375,
            reasoning: 21.0,
            cache_creation: 3.5
        },
        "gpt-5.6-terra": {
            input: 1.0,
            output: 6.0,
            cached: 0.125,
            reasoning: 6.0,
            cache_creation: 1.0
        },
        "grok-4.5": {
            input: 1.4,
            output: 4.2,
            cached: 0.35,
            reasoning: 4.2,
            cache_creation: 1.4
        },
        "kimi-k3": {
            input: 2.1,
            output: 10.5,
            cached: 0.2625,
            reasoning: 10.5,
            cache_creation: 2.1
        },
        "minimax-m2.7": {
            input: 0.168,
            output: 0.672,
            cached: 0.0525,
            reasoning: 0.672,
            cache_creation: 0.168
        }
    },
    synthetic: {
        "hf:openai/gpt-oss-120b": {
            input: 0.1,
            output: 0.1,
            cached: 0.1,
            reasoning: 0,
            cache_creation: 0
        },
        "hf:zai-org/GLM-5.2": {
            input: 1.4,
            output: 4.4,
            cached: 1.4,
            reasoning: 0,
            cache_creation: 0
        },
        "hf:moonshotai/Kimi-K2.7-Code": {
            input: 0.95,
            output: 4,
            cached: 0.95,
            reasoning: 0,
            cache_creation: 0
        },
        "hf:Qwen/Qwen3.6-27B": {
            input: 0.45,
            output: 3.6,
            cached: 0.45,
            reasoning: 0,
            cache_creation: 0
        },
        "hf:MiniMaxAI/MiniMax-M3": {
            input: 0.6,
            output: 1.2,
            cached: 0.6,
            reasoning: 0,
            cache_creation: 0
        },
        "hf:zai-org/GLM-4.7-Flash": {
            input: 0.1,
            output: 0.5,
            cached: 0.1,
            reasoning: 0,
            cache_creation: 0
        },
        "hf:nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4": {
            input: 0.3,
            output: 1,
            cached: 0.3,
            reasoning: 0,
            cache_creation: 0
        }
    },
    groq: {
        "openai/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "llama-3.3-70b-versatile": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "meta-llama/llama-4-maverick-17b-128e-instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "qwen/qwen3-32b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    fireworks: {
        "accounts/fireworks/models/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "accounts/fireworks/models/deepseek-v3p1": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "accounts/fireworks/models/llama-v3p3-70b-instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "accounts/fireworks/models/qwen3-235b-a22b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    cerebras: {
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gemma-4-31b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "zai-glm-4.7": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "llama-3.3-70b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "llama-4-scout-17b-16e-instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "qwen-3-235b-a22b-instruct-2507": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "qwen-3-32b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    nvidia: {
        "nvidia/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "openai/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "moonshotai/kimi-k2.5": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "z-ai/glm4.7": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-ai/deepseek-v3.2": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "nvidia/llama-3.3-70b-instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "meta/llama-4-maverick-17b-128e-instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek/deepseek-r1": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    nebius: {
        "openai/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "meta-llama/Llama-3.3-70B-Instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    siliconflow: {
        "openai/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-ai/DeepSeek-V3.2": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-ai/DeepSeek-V3.1": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-ai/DeepSeek-R1": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "Qwen/Qwen3-235B-A22B-Instruct-2507": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "Qwen/Qwen3-Coder-480B-A35B-Instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "Qwen/Qwen3-32B": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "moonshotai/Kimi-K2.5": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "zai-org/GLM-4.7": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "baidu/ERNIE-4.5-300B-A47B": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    },
    hyperbolic: {
        "openai/gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "gpt-oss-120b": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "Qwen/QwQ-32B": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-ai/DeepSeek-R1": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "deepseek-ai/DeepSeek-V3": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "meta-llama/Llama-3.3-70B-Instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "meta-llama/Llama-3.2-3B-Instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "Qwen/Qwen2.5-72B-Instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "Qwen/Qwen2.5-Coder-32B-Instruct": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        },
        "NousResearch/Hermes-3-Llama-3.1-70B": {
            input: 0,
            output: 0,
            cached: 0,
            reasoning: 0,
            cache_creation: 0
        }
    }
};
}),
"[project]/src/shared/constants/pricing/regional.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PRICING_REGIONAL",
    ()=>DEFAULT_PRICING_REGIONAL
]);
/**
 * Pricing data — regional family (China + other regional providers (incl. GLM/Zhipu)).
 * Pure data; merged by default-pricing.ts via spread (god-file decomposition; semantic split).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/shared-tiers.ts [middleware] (ecmascript)");
;
const DEFAULT_PRICING_REGIONAL = {
    glm: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GLM_PRICING"],
    glmt: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$shared$2d$tiers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GLM_PRICING"],
    kimi: {
        "kimi-latest": {
            input: 1.0,
            output: 4.0,
            cached: 0.5,
            reasoning: 6.0,
            cache_creation: 1.0
        },
        // Kimi K2.5 — acesso direto via Moonshot API
        // Context: 262.144 tokens | Capabilities: reasoning, vision, agentic, tools
        "kimi-k2.5": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "kimi-k2.5-thinking": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "kimi-for-coding": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "moonshot-kimi-k2.5": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        }
    },
    kmc: {
        "kimi-k2.5": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "kimi-k2.5-thinking": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "kimi-latest": {
            input: 1.0,
            output: 4.0,
            cached: 0.5,
            reasoning: 6.0,
            cache_creation: 1.0
        }
    },
    kmca: {
        "kimi-k2.5": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "kimi-k2.5-thinking": {
            input: 0.6,
            output: 3.0,
            cached: 0.3,
            reasoning: 4.5,
            cache_creation: 0.6
        },
        "kimi-latest": {
            input: 1.0,
            output: 4.0,
            cached: 0.5,
            reasoning: 6.0,
            cache_creation: 1.0
        }
    },
    minimax: {
        // MiniMax M3 — new default model (upstream upgrade from M2.7).
        // Same api.minimax.io endpoint; pricing mirrors the M2.x base tier.
        "minimax-m3": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        },
        "MiniMax-M3": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        },
        "minimax-m2.1": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        },
        "MiniMax-M2.1": {
            input: 0.5,
            output: 2.0,
            cached: 0.25,
            reasoning: 3.0,
            cache_creation: 0.5
        },
        // MiniMax M2.5 — mais barato que M2.1, reasoning + tools
        // Context: 204.800 tokens | Max Output: 16.384 tokens
        "minimax-m2.5": {
            input: 0.27,
            output: 0.95,
            cached: 0.135,
            reasoning: 1.425,
            cache_creation: 0.27
        },
        "MiniMax-M2.5": {
            input: 0.27,
            output: 0.95,
            cached: 0.135,
            reasoning: 1.425,
            cache_creation: 0.27
        },
        // T12: MiniMax M2.7 — new default model (sub2api PR #1120)
        // Upgraded from M2.5, same API endpoint api.minimax.io
        // Pricing estimated, check https://platform.minimaxi.com/document/Price
        "minimax-m2.7": {
            input: 0.4,
            output: 1.6,
            cached: 0.2,
            reasoning: 2.4,
            cache_creation: 0.4
        },
        "MiniMax-M2.7": {
            input: 0.4,
            output: 1.6,
            cached: 0.2,
            reasoning: 2.4,
            cache_creation: 0.4
        },
        "minimax-m2.7-highspeed": {
            input: 0.4,
            output: 1.6,
            cached: 0.2,
            reasoning: 2.4,
            cache_creation: 0.4
        }
    },
    zai: {
        "glm-5": {
            input: 0.38,
            output: 1.98,
            cached: 0.19,
            reasoning: 2.97,
            cache_creation: 0.38
        },
        "glm-5-turbo": {
            input: 1.2,
            output: 4.0,
            cached: 0.6,
            reasoning: 6.0,
            cache_creation: 1.2
        },
        "glm-4.7": {
            input: 0.38,
            output: 1.98,
            cached: 0.19,
            reasoning: 2.97,
            cache_creation: 0.38
        }
    }
};
}),
"[project]/src/shared/constants/pricing/default-pricing.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PRICING",
    ()=>DEFAULT_PRICING
]);
/**
 * Pricing data — DEFAULT_PRICING barrel (god-file decomposition). Merges the semantic family files
 * via spread; preserves every entry. Keys are grouped by provider family (was partN order);
 * pricing lookups are by-key (getPricingForModel) so this is a cosmetic-only ordering change.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$oauth$2d$subscriptions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/oauth-subscriptions.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$frontier$2d$labs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/frontier-labs.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$inference$2d$hosts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/inference-hosts.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$regional$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/regional.ts [middleware] (ecmascript)");
;
;
;
;
const DEFAULT_PRICING = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$oauth$2d$subscriptions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING_OAUTH"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$frontier$2d$labs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING_FRONTIER"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$inference$2d$hosts$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING_INFERENCE"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$regional$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING_REGIONAL"]
};
}),
"[project]/src/shared/constants/pricing.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultPricing",
    ()=>getDefaultPricing,
    "getPricingForModel",
    ()=>getPricingForModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$default$2d$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/default-pricing.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [middleware] (ecmascript)");
;
;
function getPricingForModel(provider, model) {
    if (!provider || !model) return null;
    const providerPricing = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$default$2d$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING"][provider];
    if (!providerPricing) return null;
    const modelPricing = providerPricing[model];
    if (!modelPricing || typeof modelPricing !== "object") return null;
    return modelPricing;
}
function getDefaultPricing() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$default$2d$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING"];
}
;
}),
"[project]/src/shared/constants/pricing.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PRICING",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$default$2d$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DEFAULT_PRICING"],
    "formatCost",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["formatCost"],
    "getDefaultPricing",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultPricing"],
    "getPricingForModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPricingForModel"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$pricing$2f$default$2d$pricing$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/pricing/default-pricing.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$formatting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/formatting.ts [middleware] (ecmascript)");
}),
];

//# sourceMappingURL=src_shared_constants_1vqdims._.js.map