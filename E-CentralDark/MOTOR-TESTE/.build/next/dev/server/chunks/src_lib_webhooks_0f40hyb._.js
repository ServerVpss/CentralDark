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
"[project]/src/lib/webhooks/integrations/slack.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSlackPayload",
    ()=>buildSlackPayload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$webhooks$2f$eventDescriptions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/webhooks/eventDescriptions.ts [app-route] (ecmascript)");
;
function buildSlackPayload(event, data) {
    const desc = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$webhooks$2f$eventDescriptions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EVENT_DESCRIPTIONS"][event];
    const model = typeof data.model === "string" ? data.model : null;
    const provider = typeof data.provider === "string" ? data.provider : null;
    const error = typeof data.error === "string" ? data.error : null;
    const titleParts = [
        `${desc.emoji} *${desc.label}*`
    ];
    if (model) titleParts.push(`on \`${model}\``);
    const lines = [
        titleParts.join(" ")
    ];
    if (error) lines.push(`*Error:* \`${error}\``);
    if (provider && !model) lines.push(`*Provider:* ${provider}`);
    const text = lines.join("\n");
    return {
        text,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text
                }
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `OmniRoute · ${new Date().toISOString()}`
                    }
                ]
            }
        ]
    };
}
}),
];

//# sourceMappingURL=src_lib_webhooks_0f40hyb._.js.map