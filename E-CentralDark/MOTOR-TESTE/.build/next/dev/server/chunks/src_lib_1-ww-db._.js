module.exports = [
"[project]/src/lib/webhooks/eventDescriptions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EVENT_DESCRIPTIONS",
    ()=>EVENT_DESCRIPTIONS
]);
const EVENT_DESCRIPTIONS = {
    "request.completed": {
        label: "Request Completed",
        emoji: "✅",
        description: "Triggered when an upstream request completes successfully (HTTP 2xx).",
        exampleData: {
            model: "claude-opus-4-7",
            provider: "claude",
            latencyMs: 1240,
            tokensIn: 142,
            tokensOut: 38
        }
    },
    "request.failed": {
        label: "Request Failed",
        emoji: "🚨",
        description: "Triggered when a request fails after all retries and fallback combo targets.",
        exampleData: {
            model: "claude-opus-4-7",
            provider: "claude",
            error: "503 Service Unavailable",
            attempts: 3
        }
    },
    "provider.error": {
        label: "Provider Error",
        emoji: "⚠️",
        description: "A provider tripped the circuit breaker due to repeated failures.",
        exampleData: {
            provider: "openai",
            model: "gpt-4o",
            errorCode: 503,
            consecutiveFailures: 3
        }
    },
    "provider.recovered": {
        label: "Provider Recovered",
        emoji: "✅",
        description: "A provider recovered from a circuit-breaker OPEN state.",
        exampleData: {
            provider: "openai",
            recoveredAfterMs: 60000
        }
    },
    "quota.exceeded": {
        label: "Quota Exceeded",
        emoji: "📊",
        description: "A usage threshold (e.g. 95% of quota) was reached.",
        exampleData: {
            quota: "daily_tokens",
            used: 950000,
            limit: 1000000,
            pct: 95
        }
    },
    "combo.switched": {
        label: "Combo Switched",
        emoji: "🔄",
        description: "Combo routing switched to a different target.",
        exampleData: {
            combo: "auto-fallback",
            fromModel: "gpt-4o",
            toModel: "claude-opus-4-7",
            reason: "provider.error"
        }
    },
    "test.ping": {
        label: "Test Ping",
        emoji: "🏓",
        description: "Manual test delivery to verify your webhook is reachable.",
        exampleData: {
            message: "Test ping from OmniRoute",
            webhookId: "preview"
        }
    }
};
}),
"[project]/src/lib/display/names.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/compatibleProviderId.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$compatibleProviderId$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCompatibleProviderConnectionId"])(providerId)) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return "CC Compatible";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(providerId)) return "Compatible (openai)";
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(providerId)) return "Compatible (anthropic)";
    }
    return providerId;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/webhooks/integrations/telegram.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildTelegramPayload",
    ()=>buildTelegramPayload,
    "buildTelegramUrl",
    ()=>buildTelegramUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$webhooks$2f$eventDescriptions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/webhooks/eventDescriptions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/display/names.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function escapeMd(s) {
    // Escape Telegram Markdown v1 special chars: _ * [ ] `
    // Hyphens and parentheses are safe in Markdown v1
    return s.replace(/[_*[\]`]/g, (c)=>`\\${c}`);
}
// Telegram bot token format: <numeric_id>:<alphanumeric_secret> (min 35 chars after colon)
const BOT_TOKEN_RE = /^\d+:[A-Za-z0-9_-]{35,}$/;
function buildTelegramUrl(botToken) {
    if (!BOT_TOKEN_RE.test(botToken)) {
        throw new Error("Invalid Telegram bot token format (expected <id>:<secret>)");
    }
    return `https://api.telegram.org/bot${botToken}/sendMessage`;
}
function buildTelegramPayload(event, data, chatId) {
    const desc = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$webhooks$2f$eventDescriptions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EVENT_DESCRIPTIONS"][event];
    const model = typeof data.model === "string" ? escapeMd(data.model) : null;
    const error = typeof data.error === "string" ? escapeMd(data.error) : null;
    const provider = typeof data.provider === "string" ? escapeMd(data.provider) : null;
    const combo = typeof data.combo === "string" ? escapeMd(data.combo) : null;
    const account = typeof data.account === "string" && data.account.trim().length > 0 ? escapeMd(data.account) : null;
    const accountId = typeof data.accountId === "string" ? data.accountId.trim() : null;
    const accountDisplay = account || (accountId ? escapeMd((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAccountDisplayName"])({
        id: accountId,
        name: null
    })) : null);
    const latencyMs = typeof data.latencyMs === "number" && Number.isFinite(data.latencyMs) ? data.latencyMs : null;
    const fallbackCount = typeof data.fallbackCount === "number" && Number.isFinite(data.fallbackCount) ? data.fallbackCount : null;
    const lines = [
        `${desc.emoji} *${desc.label}*`
    ];
    if (model) lines.push(`Model: \`${model}\``);
    if (provider) lines.push(`Provider: \`${provider}\``);
    if (accountDisplay) lines.push(`Account: \`${accountDisplay}\``);
    if (combo) lines.push(`Combo: \`${combo}\``);
    if (latencyMs !== null) lines.push(`Latency: \`${latencyMs}ms\``);
    if (fallbackCount !== null) lines.push(`Fallbacks: \`${fallbackCount}\``);
    if (error) lines.push(`Error: \`${error}\``);
    lines.push(`_OmniRoute · ${new Date().toISOString()}_`);
    return {
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "Markdown"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_1-ww-db._.js.map