module.exports = [
"[project]/open-sse/config/contextEditing.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Anthropic Context Editing — delegated, server-side compression for Claude.
 *
 * Unlike OmniRoute's local compression engines (which rewrite the request body
 * before it leaves the proxy), Context Editing asks the *provider* to clear
 * stale tool-use/tool-result blocks from the running context window. We only
 * attach a body param (`context_management.edits[]`); Claude does the clearing
 * against its own tokenizer. The beta is advertised via the `anthropic-beta:
 * context-management-2025-06-27` header, which OmniRoute already emits on Claude
 * requests (see `anthropicHeaders.ts`).
 *
 * This is a Claude-only capability by nature — other providers would reject the
 * param. Callers MUST gate invocation to the genuine Claude provider; this
 * module does not inspect the provider itself.
 *
 * Strategy ids and shapes are pinned from live Anthropic docs
 * (platform.claude.com/docs/en/build-with-claude/context-editing).
 */ /** Dated strategy id that clears old tool-use / tool-result pairs. */ __turbopack_context__.s([
    "CLEAR_THINKING_STRATEGY",
    ()=>CLEAR_THINKING_STRATEGY,
    "CLEAR_TOOL_USES_STRATEGY",
    ()=>CLEAR_TOOL_USES_STRATEGY,
    "CONTEXT_EDITING_DEFAULT_KEEP_TOOL_USES",
    ()=>CONTEXT_EDITING_DEFAULT_KEEP_TOOL_USES,
    "CONTEXT_EDITING_DEFAULT_TRIGGER_TOKENS",
    ()=>CONTEXT_EDITING_DEFAULT_TRIGGER_TOKENS,
    "applyContextEditingToBody",
    ()=>applyContextEditingToBody,
    "extractContextEditingTelemetry",
    ()=>extractContextEditingTelemetry
]);
const CLEAR_TOOL_USES_STRATEGY = "clear_tool_uses_20250919";
const CLEAR_THINKING_STRATEGY = "clear_thinking_20251015";
const CONTEXT_EDITING_DEFAULT_TRIGGER_TOKENS = 100000;
const CONTEXT_EDITING_DEFAULT_KEEP_TOOL_USES = 3;
function applyContextEditingToBody(body, opts) {
    if (!opts.enabled || !body || typeof body !== "object") return;
    const existing = body.context_management && typeof body.context_management === "object" ? body.context_management : {};
    const edits = Array.isArray(existing.edits) ? [
        ...existing.edits
    ] : [];
    const hasToolUseEdit = edits.some((edit)=>edit && edit.type === CLEAR_TOOL_USES_STRATEGY);
    if (!hasToolUseEdit) {
        edits.push({
            type: CLEAR_TOOL_USES_STRATEGY,
            trigger: {
                type: "input_tokens",
                value: CONTEXT_EDITING_DEFAULT_TRIGGER_TOKENS
            },
            keep: {
                type: "tool_uses",
                value: CONTEXT_EDITING_DEFAULT_KEEP_TOOL_USES
            }
        });
        // Anthropic requires clear_thinking edits to precede clear_tool_uses. Array
        // sort is stable in modern Node, so same-key edits keep their relative order.
        edits.sort((a, b)=>{
            const aRank = a && a.type === CLEAR_THINKING_STRATEGY ? 0 : 1;
            const bRank = b && b.type === CLEAR_THINKING_STRATEGY ? 0 : 1;
            return aRank - bRank;
        });
    }
    existing.edits = edits;
    body.context_management = existing;
}
/** Coerce a finite, non-negative integer; returns 0 for junk. */ function toClearedInt(value) {
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return Math.max(0, Math.floor(parsed));
    }
    return 0;
}
/** Read a nested property by key path without throwing on missing intermediates. */ function getNested(obj, keys) {
    let cur = obj;
    for (const key of keys){
        if (!cur || typeof cur !== "object") return undefined;
        cur = cur[key];
    }
    return cur;
}
function extractContextEditingTelemetry(responseBody) {
    if (!responseBody || typeof responseBody !== "object") return null;
    const candidates = [
        getNested(responseBody, [
            "context_management",
            "applied_edits"
        ]),
        getNested(responseBody, [
            "usage",
            "context_management",
            "applied_edits"
        ]),
        getNested(responseBody, [
            "usage",
            "applied_edits"
        ])
    ];
    const edits = candidates.find((c)=>Array.isArray(c));
    if (!Array.isArray(edits) || edits.length === 0) return null;
    let clearedInputTokens = 0;
    let clearedToolUses = 0;
    for (const entry of edits){
        if (!entry || typeof entry !== "object") continue;
        const edit = entry;
        clearedInputTokens += toClearedInt(edit.cleared_input_tokens ?? edit.clearedInputTokens);
        clearedToolUses += toClearedInt(edit.cleared_tool_uses ?? edit.clearedToolUses);
    }
    if (clearedInputTokens <= 0 && clearedToolUses <= 0) return null;
    return {
        editCount: edits.length,
        clearedInputTokens,
        clearedToolUses
    };
}
}),
];

//# sourceMappingURL=open-sse_config_contextEditing_ts_1h8luil._.js.map