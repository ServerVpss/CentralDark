module.exports = [
"[project]/src/lib/webhooks/eventDescriptions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/webhooks/integrations/discord.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildDiscordPayload",
    ()=>buildDiscordPayload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$webhooks$2f$eventDescriptions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/webhooks/eventDescriptions.ts [instrumentation] (ecmascript)");
;
const EVENT_COLORS = {
    "request.completed": 0x22c55e,
    "request.failed": 0xef4444,
    "provider.error": 0xf97316,
    "provider.recovered": 0x22c55e,
    "quota.exceeded": 0xeab308,
    "combo.switched": 0x3b82f6,
    "test.ping": 0x8b5cf6
};
function buildDiscordPayload(event, data) {
    const desc = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$webhooks$2f$eventDescriptions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["EVENT_DESCRIPTIONS"][event];
    const model = typeof data.model === "string" ? data.model : null;
    const error = typeof data.error === "string" ? data.error : null;
    const lines = [];
    if (model) lines.push(`**Model:** \`${model}\``);
    if (error) lines.push(`**Error:** \`${error}\``);
    if (lines.length === 0) lines.push(desc.description);
    return {
        embeds: [
            {
                title: `${desc.emoji} ${desc.label}`,
                description: lines.join("\n"),
                color: EVENT_COLORS[event] ?? 0x6366f1,
                footer: {
                    text: `OmniRoute · ${new Date().toISOString()}`
                }
            }
        ]
    };
}
}),
];

//# sourceMappingURL=src_lib_webhooks_15z1ap5._.js.map