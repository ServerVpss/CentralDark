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

//# sourceMappingURL=src_lib_webhooks_05keaaz._.js.map