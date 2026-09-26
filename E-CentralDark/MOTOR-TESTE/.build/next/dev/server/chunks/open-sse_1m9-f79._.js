module.exports = [
"[project]/open-sse/translator/helpers/claudeHelper.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyKimiCodingThinking",
    ()=>applyKimiCodingThinking,
    "fixToolUseOrdering",
    ()=>fixToolUseOrdering,
    "hasValidContent",
    ()=>hasValidContent,
    "prepareClaudeRequest",
    ()=>prepareClaudeRequest,
    "splitMisplacedToolResults",
    ()=>splitMisplacedToolResults
]);
// Claude helper functions for translator
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/defaultThinkingSignature.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/reasoningCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [instrumentation] (ecmascript)");
;
;
;
;
;
// MiniMax exposes a Claude-compatible endpoint but rejects Anthropic's extended
// `output_config` parameter (used to steer reasoning effort and structured output)
// with a generic 400 "invalid params" response. Strip the entire field before
// dispatching Claude-shape requests to these providers. Anthropic Claude and
// other Claude-compatible upstreams that do accept it are unaffected.
// Ported from upstream decolua/9router#820 by @hiepau1231.
const CLAUDE_FORMAT_PROVIDERS_WITHOUT_OUTPUT_CONFIG = new Set([
    "minimax",
    "minimax-cn"
]);
function applyKimiCodingThinking(result, body) {
    if (!body.thinking && !body.reasoning_effort) return;
    const requestedEffort = String(body.reasoning_effort ?? body.thinking?.effort ?? "on").toLowerCase();
    const disabled = body.thinking?.type === "disabled" || [
        "off",
        "none"
    ].includes(requestedEffort);
    result.thinking = {
        type: disabled ? "disabled" : "enabled"
    };
    if (!disabled && ![
        "on",
        "auto"
    ].includes(requestedEffort)) {
        const outputConfig = result.output_config && typeof result.output_config === "object" ? result.output_config : {};
        result.output_config = {
            ...outputConfig,
            effort: requestedEffort
        };
    }
}
function hasValidContent(msg) {
    if (typeof msg.content === "string" && msg.content.trim()) return true;
    if (Array.isArray(msg.content)) {
        return msg.content.some((block)=>block.type === "text" && block.text?.trim() || block.type === "tool_use" || block.type === "tool_result" || // #7777: media-only user turns are real content — dropping them
            // silently deletes vision input on the CC bridge / Claude paths.
            block.type === "image" || block.type === "document");
    }
    return false;
}
function splitMisplacedToolResults(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return messages;
    const out = [];
    const seenToolUseIds = new Set();
    const recordToolUseIds = (blocks)=>{
        for (const b of blocks){
            if (b?.type === "tool_use" && typeof b.id === "string") {
                seenToolUseIds.add(b.id);
            }
        }
    };
    for (const msg of messages){
        if (msg.role !== "assistant" || !Array.isArray(msg.content)) {
            out.push(msg);
            continue;
        }
        const toolResults = msg.content.filter((b)=>b?.type === "tool_result");
        if (toolResults.length === 0) {
            out.push(msg);
            recordToolUseIds(msg.content);
            continue;
        }
        const validToolResults = toolResults.filter((b)=>typeof b?.tool_use_id === "string" && seenToolUseIds.has(b.tool_use_id));
        const remaining = msg.content.filter((b)=>b?.type !== "tool_result");
        if (validToolResults.length > 0) {
            const prev = out[out.length - 1];
            if (prev && prev.role === "user" && Array.isArray(prev.content)) {
                out[out.length - 1] = {
                    ...prev,
                    content: [
                        ...prev.content,
                        ...validToolResults
                    ]
                };
            } else {
                out.push({
                    role: "user",
                    content: validToolResults
                });
            }
        }
        // Drop the assistant message entirely if only tool_result blocks remained.
        if (remaining.length > 0) {
            out.push({
                ...msg,
                content: remaining
            });
            recordToolUseIds(remaining);
        }
    }
    return out;
}
function fixToolUseOrdering(messages) {
    if (messages.length === 0) return messages;
    if (messages.length === 1 && !(Array.isArray(messages[0]?.content) && messages[0].content.some((block)=>block.type === "tool_result"))) {
        return messages;
    }
    // Pass 1: Fix assistant messages with tool_use - remove text after tool_use
    for (const msg of messages){
        if (msg.role === "assistant" && Array.isArray(msg.content)) {
            const hasToolUse = msg.content.some((b)=>b.type === "tool_use");
            if (hasToolUse) {
                // Keep only: thinking blocks + tool_use blocks (remove text blocks after tool_use)
                const newContent = [];
                let foundToolUse = false;
                for (const block of msg.content){
                    if (block.type === "tool_use") {
                        foundToolUse = true;
                        newContent.push(block);
                    } else if (block.type === "thinking" || block.type === "redacted_thinking") {
                        newContent.push(block);
                    } else if (!foundToolUse) {
                        // Keep text blocks BEFORE tool_use
                        newContent.push(block);
                    }
                // Skip text blocks AFTER tool_use
                }
                msg.content = newContent;
            }
        }
    }
    // Pass 2: Merge consecutive same-role messages
    const merged = [];
    for (const msg of messages){
        const last = merged[merged.length - 1];
        if (last && last.role === msg.role) {
            // Merge content arrays
            const lastContent = Array.isArray(last.content) ? last.content : [
                {
                    type: "text",
                    text: last.content
                }
            ];
            const msgContent = Array.isArray(msg.content) ? msg.content : [
                {
                    type: "text",
                    text: msg.content
                }
            ];
            // Put tool_result first, then other content
            const toolResults = [
                ...lastContent.filter((b)=>b.type === "tool_result"),
                ...msgContent.filter((b)=>b.type === "tool_result")
            ];
            const otherContent = [
                ...lastContent.filter((b)=>b.type !== "tool_result"),
                ...msgContent.filter((b)=>b.type !== "tool_result")
            ];
            last.content = [
                ...toolResults,
                ...otherContent
            ];
        } else {
            // Ensure content is array
            const content = Array.isArray(msg.content) ? msg.content : [
                {
                    type: "text",
                    text: msg.content
                }
            ];
            merged.push({
                role: msg.role,
                content: [
                    ...content
                ]
            });
        }
    }
    // Claude accepts tool_result only for a tool_use in the immediately previous
    // assistant message. Compacted cross-model history can retain an output after
    // dropping its call; keep that output as user text instead of sending an
    // invalid structured reference or discarding useful context.
    for(let i = 0; i < merged.length; i++){
        const msg = merged[i];
        if (msg.role !== "user" || !Array.isArray(msg.content)) continue;
        const previous = merged[i - 1];
        const validIds = new Set(previous?.role === "assistant" && Array.isArray(previous.content) ? previous.content.flatMap((block)=>block.type === "tool_use" && typeof block.id === "string" && block.id ? [
                block.id
            ] : []) : []);
        const pairedById = new Map();
        const otherContent = [];
        for (const block of msg.content){
            if (block.type !== "tool_result") {
                otherContent.push(block);
                continue;
            }
            const toolUseId = typeof block.tool_use_id === "string" ? block.tool_use_id : "";
            if (validIds.has(toolUseId) && !pairedById.has(toolUseId)) {
                pairedById.set(toolUseId, block);
                continue;
            }
            const serialized = typeof block.content === "string" ? block.content : JSON.stringify(block.content ?? "") ?? "";
            otherContent.push({
                type: "text",
                text: `[Unpaired tool result ${toolUseId || "unknown"}]\n${serialized}`
            });
        }
        const pairedResults = [
            ...validIds
        ].map((id)=>pairedById.get(id) ?? {
                type: "tool_result",
                tool_use_id: id,
                content: ""
            });
        msg.content = [
            ...pairedResults,
            ...otherContent
        ];
    }
    return merged;
}
function ensureMessageContentArray(msg) {
    if (Array.isArray(msg?.content)) return msg.content;
    if (typeof msg?.content === "string" && msg.content.trim()) {
        msg.content = [
            {
                type: "text",
                text: msg.content
            }
        ];
        return msg.content;
    }
    return [];
}
function markMessageCacheControl(msg, ttl) {
    const content = ensureMessageContentArray(msg);
    if (content.length === 0) return false;
    const lastIndex = content.length - 1;
    content[lastIndex].cache_control = ttl !== undefined ? {
        type: "ephemeral",
        ttl
    } : {
        type: "ephemeral"
    };
    return true;
}
/** True when the body carries at least one cache_control marker anywhere
 * (system blocks, message content blocks, or tools). Used to decide whether
 * preserve-mode has anything to preserve. */ function bodyHasAnyCacheControl(body) {
    if (Array.isArray(body.system)) {
        for (const block of body.system){
            if (block && typeof block === "object" && block.cache_control) return true;
        }
    }
    if (Array.isArray(body.messages)) {
        for (const msg of body.messages){
            if (!Array.isArray(msg?.content)) continue;
            for (const block of msg.content){
                if (block && typeof block === "object" && block.cache_control) return true;
            }
        }
    }
    if (Array.isArray(body.tools)) {
        for (const tool of body.tools){
            if (tool && typeof tool === "object" && tool.cache_control) return true;
        }
    }
    return false;
}
function prepareClaudeRequest(body, provider = null, preserveCacheControl = false, model = null, opts = {}) {
    // 0. Strip Anthropic `output_config` for providers that reject it on their
    // Claude-compatible endpoints (MiniMax). Must run before any downstream
    // processing so the field never reaches translateRequest/the executor.
    if (provider && CLAUDE_FORMAT_PROVIDERS_WITHOUT_OUTPUT_CONFIG.has(provider)) {
        delete body.output_config;
    }
    // preserveCacheControl means "the client manages its own cache markers".
    // A body with NO cache_control anywhere has nothing to preserve — shipping
    // it untouched would mean zero prompt-cache breakpoints (every token billed
    // uncached on every turn). The translator path opts into falling back to the
    // standard heuristic in that case; the claude-code-compatible relay path
    // keeps its long-standing "never supplement missing markers" contract
    // (cc-compatible-provider.test.ts) and does not pass the flag.
    if (preserveCacheControl && opts.fallbackToHeuristicWhenNoMarkers === true && !bodyHasAnyCacheControl(body)) {
        preserveCacheControl = false;
    }
    // 1. System: remove all cache_control, add only to last block with ttl 1h
    // In passthrough mode, preserve existing cache_control markers
    const supportsPromptCaching = provider === "claude" || provider?.startsWith?.("anthropic-compatible-");
    const isKimiCoding = provider === "kimi-coding" || provider === "kimi-coding-apikey";
    // Non-Anthropic Claude-shape providers (kimi-coding, glmt, zai, …) cannot
    // validate the synthetic redacted_thinking.data blob — they're not Anthropic
    // and don't speak its signature scheme. They expect plain `thinking { text }`
    // blocks with the original reasoning text, or fail with:
    //   "thinking is enabled but reasoning_content is missing in assistant
    //    tool call message at index N"
    // We use the same allowlist as prompt-caching: only Anthropic-native
    // upstreams get redacted_thinking. Everything else gets plain thinking blocks
    // backed by reasoningCache (real text) or a placeholder (cache miss).
    // Mixed-format providers (e.g. opencode-go) may have some models targeting
    // Anthropic's Messages API (targetFormat=claude) and others targeting OpenAI.
    // When the specific model targets Claude format, it's hitting a real Anthropic
    // endpoint that validates signatures — so it needs redacted_thinking too.
    const modelTargetsClaude = !!provider && !!model && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelTargetFormat"])(provider, model) === "claude";
    const supportsRedactedThinking = !isKimiCoding && (supportsPromptCaching || modelTargetsClaude);
    const systemBlocks = body.system;
    if (systemBlocks && Array.isArray(systemBlocks) && !preserveCacheControl) {
        body.system = systemBlocks.map((block, i)=>{
            const { cache_control, ...rest } = block;
            if (i === systemBlocks.length - 1 && supportsPromptCaching) {
                return {
                    ...rest,
                    cache_control: {
                        type: "ephemeral",
                        ttl: "1h"
                    }
                };
            }
            return rest;
        });
    }
    // 2. Messages: process in optimized passes
    if (body.messages && Array.isArray(body.messages)) {
        const len = body.messages.length;
        let filtered = [];
        // Pass 1: remove cache_control + filter empty messages
        // In passthrough mode, preserve existing cache_control markers
        for(let i = 0; i < len; i++){
            const msg = body.messages[i];
            // Remove cache_control from content blocks (skip in passthrough mode)
            if (Array.isArray(msg.content) && !preserveCacheControl) {
                for (const block of msg.content){
                    delete block.cache_control;
                }
            }
            // Keep final assistant even if empty, otherwise check valid content
            const isFinalAssistant = i === len - 1 && msg.role === "assistant";
            if (isFinalAssistant || hasValidContent(msg)) {
                filtered.push(msg);
            }
        }
        // Pass 1.4: Filter out tool_use blocks with empty names (causes Claude 400 error)
        // Apply to ALL roles (assistant tool_use + any user messages that may carry tool_use)
        // Also filter tool_result blocks with missing tool_use_id
        for (const msg of filtered){
            if (Array.isArray(msg.content)) {
                msg.content = msg.content.filter((block)=>block.type !== "tool_use" || block.name && block.name?.trim());
                msg.content = msg.content.filter((block)=>block.type !== "tool_result" || block.tool_use_id);
            }
        }
        // Tools: for non-Anthropic providers (MiniMax and other Anthropic-compatible
        // Claude-shape endpoints) strip Anthropic-only built-in tools (e.g.
        // web_search_20250305) and normalize OpenAI-wire-shape tools to the
        // Anthropic-native shape — fold `function.{name,description,parameters}`
        // into top-level `{name, description, input_schema}` and drop the stray
        // `type` field. Without this MiniMax rejects with code 2013 ("invalid
        // tool type"). Port of upstream decolua/9router@45240c19.
        if (body.tools && Array.isArray(body.tools) && provider !== "claude") {
            body.tools = body.tools.filter((tool)=>!tool.type || tool.type === "function").map((tool)=>{
                const t = tool;
                if (t.function) {
                    return {
                        name: t.function.name,
                        description: t.function.description,
                        input_schema: t.function.parameters
                    };
                }
                const { type: _type, ...rest } = t;
                return rest;
            });
        }
        // Also filter top-level tool declarations with empty names
        if (body.tools && Array.isArray(body.tools)) {
            body.tools = body.tools.filter((tool)=>tool.name && tool.name?.trim());
        }
        // Pass 1.45: Move stray tool_result blocks out of assistant messages
        // before any ordering fix runs (#2815).
        filtered = splitMisplacedToolResults(filtered);
        // Pass 1.5: Fix tool_use/tool_result ordering
        // Each tool_use must have tool_result in the NEXT message (not same message with other content)
        filtered = fixToolUseOrdering(filtered);
        body.messages = filtered;
        // Check if thinking is enabled AND last message is from user
        const lastMessage = filtered[filtered.length - 1];
        const lastMessageIsUser = lastMessage?.role === "user";
        const thinkingEnabled = body.thinking?.type === "enabled" && lastMessageIsUser;
        // Claude Code-style prompt caching:
        // - cache the second-to-last user turn for conversation reuse
        // - cache the last assistant turn so the next user turn can reuse it
        // Skip in passthrough mode to preserve client's cache_control markers
        if (!preserveCacheControl && supportsPromptCaching) {
            const userMessageIndexes = filtered.reduce((indexes, msg, index)=>{
                if (msg?.role === "user") indexes.push(index);
                return indexes;
            }, []);
            const secondToLastUserIndex = userMessageIndexes.length >= 2 ? userMessageIndexes[userMessageIndexes.length - 2] : -1;
            if (secondToLastUserIndex >= 0) {
                markMessageCacheControl(filtered[secondToLastUserIndex]);
            }
        }
        // Pass 2 (reverse): add cache_control to last assistant + handle thinking for Anthropic
        // Index of the LAST assistant message in the filtered array. Anthropic
        // enforces the latest assistant message's thinking blocks cannot be
        // modified — preserve them verbatim. Older assistant messages can be
        // rewritten to redacted_thinking { data } as before.
        let latestAssistantIndex = -1;
        for(let k = filtered.length - 1; k >= 0; k--){
            if (filtered[k]?.role === "assistant") {
                latestAssistantIndex = k;
                break;
            }
        }
        let lastAssistantProcessed = false;
        for(let i = filtered.length - 1; i >= 0; i--){
            const msg = filtered[i];
            const content = ensureMessageContentArray(msg);
            if (msg.role === "assistant" && content.length > 0) {
                // Add cache_control to last block of first (from end) assistant with content
                // Skip in passthrough mode to preserve client's cache_control markers
                if (!preserveCacheControl && supportsPromptCaching && !lastAssistantProcessed && markMessageCacheControl(msg)) {
                    lastAssistantProcessed = true;
                }
                // Handle thinking blocks for Anthropic-shape endpoints.
                // prepareClaudeRequest is only invoked when targetFormat === claude
                // (translator/index.ts:165-168), so any provider that lands here has
                // a Claude-format upstream: claude native, anthropic-compatible-*,
                // kimi-coding (api.kimi.com/coding/v1/messages), glmt, zai, etc.
                // All of these enforce the same body-shape contract for thinking mode:
                // when body.thinking.type === "enabled" and an assistant turn contains
                // a tool_use, the same content[] must include a thinking (or
                // redacted_thinking) block emitted before the tool_use. Without it,
                // the upstream rejects with errors like:
                //   "thinking is enabled but reasoning_content is missing in
                //    assistant tool call message at index N"  (kimi-coding)
                //   "Invalid signature in thinking block"     (claude native, on
                //                                              cross-provider replay)
                // Guard: never modify EXISTING thinking blocks in the latest assistant
                // message when sending to an Anthropic-native upstream. Anthropic returns
                // 400 "blocks in the latest assistant message cannot be modified" if any
                // field changes. Injecting a NEW thinking block (when none exists) is fine.
                // Older assistant messages can still be rewritten.
                // For non-Anthropic providers: only the text replacement is skipped
                // for the latest assistant (if it already has non-empty thinking text);
                // field cleanup (signature strip, type normalization) still runs.
                const isLatestAssistant = i === latestAssistantIndex;
                const latestThinkingBlocks = isLatestAssistant ? content.filter((b)=>b.type === "thinking" || b.type === "redacted_thinking") : [];
                const latestHasExistingThinking = latestThinkingBlocks.length > 0;
                // #6953: a synthetic thinking block with an EMPTY signature/data (fabricated by a
                // non-Anthropic provider leg, e.g. codex reasoning_content) is NOT a genuine Claude
                // replay signature. Forwarding it verbatim to a real Anthropic-native upstream always
                // 400s ("Invalid signature in thinking block"), permanently poisoning the combo onto
                // the non-Anthropic leg. Only skip the verbatim-preserve path when every thinking-ish
                // block on the latest assistant message carries a non-empty signature/data — older
                // turns are already sanitized below (redacted_thinking + DEFAULT_THINKING_CLAUDE_SIGNATURE);
                // the latest turn must go through the same sanitization when its signature is empty.
                const latestHasGenuineThinkingSignature = latestThinkingBlocks.every((b)=>b.type === "redacted_thinking" ? typeof b.data === "string" && b.data.length > 0 : typeof b.signature === "string" && b.signature.length > 0);
                if (latestHasExistingThinking && supportsRedactedThinking && latestHasGenuineThinkingSignature) {
                    continue;
                }
                let hasToolUse = false;
                let hasThinking = false;
                // Pre-collect tool_use ids in this content[] for reasoningCache
                // lookups when the upstream is a non-Anthropic Claude-shape provider.
                // The cache is keyed by tool_call_id which equals tool_use.id for
                // Anthropic-shape (the same value is reused across formats — see
                // claude-to-openai.ts:63 where openai tool_call.id = claude tool_use.id).
                const toolUseIds = [];
                if (!supportsRedactedThinking) {
                    for (const block of content){
                        if (block.type === "tool_use" && typeof block.id === "string") {
                            toolUseIds.push(block.id);
                        }
                    }
                }
                // Convert thinking blocks per provider type:
                //
                // Anthropic-native (claude, anthropic-compatible-*):
                //   Emit redacted_thinking { data } with synthetic blob. Anthropic
                //   accepts this as a valid placeholder for replay context without
                //   re-validating the original signature. Previous behavior — keep.
                //
                //   When requests cross provider boundaries (e.g., combo fallback) or
                //   when client-stored signatures (Capy) replay back to Anthropic, the
                //   original `thinking.signature` no longer validates: "Invalid
                //   signature in thinking block" 400. redacted_thinking accepts without
                //   signature validation — but Anthropic REQUIRES a `data` field.
                //   Field rules: redacted_thinking={type,data} ; thinking={type,thinking,signature}.
                //
                // Non-Anthropic Claude-shape (kimi-coding, glmt, zai, …):
                //   Emit plain thinking { thinking: <text> } using the real reasoning
                //   text from reasoningCache (captured on the prior assistant
                //   response). Falls back to NON_ANTHROPIC_THINKING_PLACEHOLDER if the
                //   cache misses (rare but possible after a process restart or TTL
                //   eviction). Empty text is treated as "missing" by kimi-coding so
                //   never emit an empty thinking field.
                let thinkingBlockIdx = 0;
                for (const block of content){
                    if (block.type === "thinking" || block.type === "redacted_thinking") {
                        if (isKimiCoding) {
                            if (block.type === "redacted_thinking") {
                                block.type = "thinking";
                                block.thinking = typeof block.thinking === "string" ? block.thinking : "";
                            }
                            delete block.data;
                            delete block.signature;
                        } else if (supportsRedactedThinking) {
                            block.type = "redacted_thinking";
                            block.data = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"];
                            delete block.thinking;
                            delete block.signature;
                        } else {
                            const existing = typeof block.thinking === "string" && block.thinking.length > 0 ? block.thinking : "";
                            let text = existing;
                            // For the latest assistant message on non-Anthropic upstreams,
                            // preserve the thinking text verbatim when it is already present.
                            // Cache lookups and the placeholder fallback only apply to older
                            // messages (or to the latest if the client sent empty text).
                            if (!text || !latestHasExistingThinking) {
                                if (!text) {
                                    const pairedToolUseId = toolUseIds[thinkingBlockIdx];
                                    if (pairedToolUseId) {
                                        const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lookupReasoning"])(pairedToolUseId);
                                        if (cached) {
                                            text = cached;
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordReplay"])();
                                        }
                                    }
                                }
                                block.type = "thinking";
                                block.thinking = text || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NON_ANTHROPIC_THINKING_PLACEHOLDER"];
                            } else {
                                // latestHasExistingThinking + non-empty text: preserve text, still clean up fields
                                block.type = "thinking";
                            }
                            delete block.data;
                            delete block.signature;
                        }
                        hasThinking = true;
                        thinkingBlockIdx++;
                    }
                    if (block.type === "tool_use") hasToolUse = true;
                }
                // Add precursor thinking block if thinking enabled + has tool_use but
                // no existing thinking-ish block. Required for Anthropic-shape
                // thinking-mode upstreams (claude, kimi-coding, glm, …) when the
                // assistant turn's content[] needs a thinking block in front of any
                // tool_use. Use the same provider-aware shape selection as above.
                if (thinkingEnabled && !hasThinking && hasToolUse) {
                    if (supportsRedactedThinking) {
                        content.unshift({
                            type: "redacted_thinking",
                            data: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"]
                        });
                    } else if (isKimiCoding) {
                        content.unshift({
                            type: "thinking",
                            thinking: ""
                        });
                    } else {
                        let text = "";
                        const firstToolUseId = toolUseIds[0];
                        if (firstToolUseId) {
                            const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lookupReasoning"])(firstToolUseId);
                            if (cached) {
                                text = cached;
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordReplay"])();
                            }
                        }
                        content.unshift({
                            type: "thinking",
                            thinking: text || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NON_ANTHROPIC_THINKING_PLACEHOLDER"]
                        });
                    }
                }
            }
        }
    }
    // 3. Tools: remove all cache_control, add only to last non-deferred tool with ttl 1h
    // Tools with defer_loading=true cannot have cache_control (API rejects it)
    // In passthrough mode, preserve existing cache_control markers
    if (body.tools && Array.isArray(body.tools) && !preserveCacheControl) {
        body.tools = body.tools.map((tool)=>{
            const { cache_control, ...rest } = tool;
            return rest;
        });
        if (supportsPromptCaching) {
            for(let i = body.tools.length - 1; i >= 0; i--){
                if (!body.tools[i].defer_loading) {
                    body.tools[i].cache_control = {
                        type: "ephemeral",
                        ttl: "1h"
                    };
                    break;
                }
            }
        }
    }
    return body;
}
}),
"[project]/open-sse/translator/helpers/schemaCoercion.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "coerceSchemaNumericFields",
    ()=>coerceSchemaNumericFields,
    "coerceToolSchemas",
    ()=>coerceToolSchemas,
    "injectEmptyReasoningContentForToolCalls",
    ()=>injectEmptyReasoningContentForToolCalls,
    "injectOptionalEnumOmissionForTools",
    ()=>injectOptionalEnumOmissionForTools,
    "injectOptionalEnumOmissionSentinel",
    ()=>injectOptionalEnumOmissionSentinel,
    "sanitizeClaudeToolSchema",
    ()=>sanitizeClaudeToolSchema,
    "sanitizeClaudeToolSchemas",
    ()=>sanitizeClaudeToolSchemas,
    "sanitizeToolDescription",
    ()=>sanitizeToolDescription,
    "sanitizeToolDescriptions",
    ()=>sanitizeToolDescriptions,
    "sanitizeToolId",
    ()=>sanitizeToolId,
    "stripInvalidSchemaConstructs",
    ()=>stripInvalidSchemaConstructs,
    "stripUnsupportedRegexPatterns",
    ()=>stripUnsupportedRegexPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/reasoningCache.ts [instrumentation] (ecmascript)");
;
const NUMERIC_SCHEMA_FIELDS = [
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "minLength",
    "maxLength",
    "minItems",
    "maxItems",
    "minProperties",
    "maxProperties",
    "multipleOf"
];
// Fix (9router#1556): OpenAI/Codex's Responses API rejects JSON Schema `pattern`
// values that use regex lookaround (lookahead/lookbehind) with
// "Invalid JSON schema: regex lookaround is not supported.". IDE/SDK agent
// harnesses commonly emit lookahead patterns (e.g. `^(?=.*@).+$`), so any
// `pattern` field containing `(?=`, `(?!`, `(?<=`, or `(?<!` must be dropped
// before the schema reaches the Codex/OpenAI upstream.
const REGEX_LOOKAROUND_PATTERN = /\(\?<?[=!]/;
function hasUnsupportedRegexLookaround(pattern) {
    return typeof pattern === "string" && REGEX_LOOKAROUND_PATTERN.test(pattern);
}
function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function keepOpaqueObjectSchemasOpen(schema) {
    if (hasOwn(schema, "additionalProperties")) return;
    const properties = schema.properties;
    const isObjectSchema = schema.type === "object" || isPlainObject(properties);
    if (!isObjectSchema) return;
    if (properties === undefined) {
        schema.properties = {};
        schema.additionalProperties = true;
    } else if (isPlainObject(properties) && Object.keys(properties).length === 0) {
        schema.additionalProperties = true;
    }
}
function coerceNumericString(value) {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (trimmed.length === 0) return value;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
}
function mapRecordValues(record) {
    return Object.fromEntries(Object.entries(record).map(([key, value])=>[
            key,
            coerceSchemaNumericFields(value)
        ]));
}
function sanitizeDescriptionValue(value) {
    if (value === undefined) return undefined;
    if (value === null) return "";
    return typeof value === "string" ? value : String(value);
}
function coerceSchemaNumericFields(schema) {
    if (Array.isArray(schema)) {
        return schema.map((entry)=>coerceSchemaNumericFields(entry));
    }
    if (!isPlainObject(schema)) return schema;
    const result = {
        ...schema
    };
    // Fix #1782: Strip 'default' property to prevent upstream models from eagerly injecting optional fields
    if ("default" in result) {
        delete result.default;
    }
    // Fix (9router#1556): drop unsupported regex lookaround from `pattern`.
    if (hasUnsupportedRegexLookaround(result.pattern)) {
        delete result.pattern;
    }
    for (const field of NUMERIC_SCHEMA_FIELDS){
        if (field in result) {
            result[field] = coerceNumericString(result[field]);
        }
    }
    if (isPlainObject(result.properties)) {
        result.properties = mapRecordValues(result.properties);
    }
    if (isPlainObject(result.patternProperties)) {
        result.patternProperties = mapRecordValues(result.patternProperties);
    }
    if (isPlainObject(result.definitions)) {
        result.definitions = mapRecordValues(result.definitions);
    }
    if (isPlainObject(result.$defs)) {
        result.$defs = mapRecordValues(result.$defs);
    }
    if (isPlainObject(result.dependentSchemas)) {
        result.dependentSchemas = mapRecordValues(result.dependentSchemas);
    }
    if (result.items !== undefined) {
        result.items = coerceSchemaNumericFields(result.items);
    }
    if (result.additionalProperties && typeof result.additionalProperties === "object") {
        result.additionalProperties = coerceSchemaNumericFields(result.additionalProperties);
    }
    if (result.unevaluatedProperties && typeof result.unevaluatedProperties === "object") {
        result.unevaluatedProperties = coerceSchemaNumericFields(result.unevaluatedProperties);
    }
    if (Array.isArray(result.prefixItems)) {
        result.prefixItems = result.prefixItems.map((entry)=>coerceSchemaNumericFields(entry));
    }
    if (Array.isArray(result.anyOf)) {
        result.anyOf = result.anyOf.map((entry)=>coerceSchemaNumericFields(entry));
    }
    if (Array.isArray(result.oneOf)) {
        result.oneOf = result.oneOf.map((entry)=>coerceSchemaNumericFields(entry));
    }
    if (Array.isArray(result.allOf)) {
        result.allOf = result.allOf.map((entry)=>coerceSchemaNumericFields(entry));
    }
    if (isPlainObject(result.not)) {
        result.not = coerceSchemaNumericFields(result.not);
    }
    if (isPlainObject(result.if)) {
        result.if = coerceSchemaNumericFields(result.if);
    }
    if (isPlainObject(result.then)) {
        result.then = coerceSchemaNumericFields(result.then);
    }
    if (isPlainObject(result.else)) {
        result.else = coerceSchemaNumericFields(result.else);
    }
    keepOpaqueObjectSchemasOpen(result);
    return result;
}
// Sub-schema maps keyed by property name (each value is itself walked recursively).
const REGEX_STRIP_OBJECT_MAP_FIELDS = [
    "properties",
    "patternProperties",
    "definitions",
    "$defs"
];
// Sub-schema lists (each entry is itself walked recursively).
const REGEX_STRIP_ARRAY_MAP_FIELDS = [
    "prefixItems",
    "anyOf",
    "oneOf",
    "allOf"
];
/** Recursively strips unsupported regex lookaround from every value of an object map field. */ function stripRegexFromObjectMap(record) {
    return Object.fromEntries(Object.entries(record).map(([key, value])=>[
            key,
            stripUnsupportedRegexPatterns(value)
        ]));
}
function stripUnsupportedRegexPatterns(schema) {
    if (Array.isArray(schema)) {
        return schema.map((entry)=>stripUnsupportedRegexPatterns(entry));
    }
    if (!isPlainObject(schema)) return schema;
    const result = {
        ...schema
    };
    if (hasUnsupportedRegexLookaround(result.pattern)) {
        delete result.pattern;
    }
    for (const field of REGEX_STRIP_OBJECT_MAP_FIELDS){
        if (isPlainObject(result[field])) {
            result[field] = stripRegexFromObjectMap(result[field]);
        }
    }
    for (const field of REGEX_STRIP_ARRAY_MAP_FIELDS){
        if (Array.isArray(result[field])) {
            result[field] = result[field].map((entry)=>stripUnsupportedRegexPatterns(entry));
        }
    }
    if (result.items !== undefined) {
        result.items = stripUnsupportedRegexPatterns(result.items);
    }
    if (result.additionalProperties && typeof result.additionalProperties === "object") {
        result.additionalProperties = stripUnsupportedRegexPatterns(result.additionalProperties);
    }
    if (isPlainObject(result.not)) {
        result.not = stripUnsupportedRegexPatterns(result.not);
    }
    return result;
}
function sanitizeToolDescription(tool) {
    if (!isPlainObject(tool)) return tool;
    const result = {
        ...tool
    };
    if (isPlainObject(result.function) && "description" in result.function) {
        const description = sanitizeDescriptionValue(result.function.description);
        if (description !== undefined) {
            result.function = {
                ...result.function,
                description
            };
        }
    }
    if (!isPlainObject(result.function) && "description" in result) {
        const description = sanitizeDescriptionValue(result.description);
        if (description !== undefined) {
            result.description = description;
        }
    }
    if (Array.isArray(result.functionDeclarations)) {
        result.functionDeclarations = result.functionDeclarations.map((declaration)=>{
            if (!isPlainObject(declaration) || !("description" in declaration)) return declaration;
            const description = sanitizeDescriptionValue(declaration.description);
            return description === undefined ? declaration : {
                ...declaration,
                description
            };
        });
    }
    return result;
}
function coerceToolSchemas(tools) {
    if (!Array.isArray(tools)) return tools;
    return tools.map((tool)=>{
        if (!isPlainObject(tool)) return tool;
        const result = {
            ...tool
        };
        if (isPlainObject(result.function) && "parameters" in result.function) {
            result.function = {
                ...result.function,
                parameters: coerceSchemaNumericFields(result.function.parameters)
            };
        }
        if (result.input_schema !== undefined) {
            result.input_schema = coerceSchemaNumericFields(result.input_schema);
        }
        if ("parameters" in result && !isPlainObject(result.function)) {
            result.parameters = coerceSchemaNumericFields(result.parameters);
        }
        if (Array.isArray(result.functionDeclarations)) {
            result.functionDeclarations = result.functionDeclarations.map((declaration)=>{
                if (!isPlainObject(declaration) || !("parameters" in declaration)) return declaration;
                return {
                    ...declaration,
                    parameters: coerceSchemaNumericFields(declaration.parameters)
                };
            });
        }
        return result;
    });
}
// #7023 — Responses API strict mode forces every "optional" tool property into
// `required`, so a model that intends to OMIT an optional enum property (no declared
// `default`) must still emit a concrete value (e.g. Agent.isolation:"remote"). Neither
// #6992 op (drop-if-default / drop-if-empty) can catch this, so we widen such properties
// to accept `null` on the request side (OpenAI's own documented nullable-union idiom for
// this exact strict-mode limitation) and drop the key response-side when the model emits
// `null` (see pureHelpers.ts::isDroppableNullEntry). Scope: top-level
// `properties[key].enum` only — does not recurse into `items`/`anyOf`/`oneOf` branches
// (no real-world case beyond Agent.isolation is documented; extend with a concrete repro).
function shouldInjectNullOmission(key, propSchema, required) {
    return isPlainObject(propSchema) && Array.isArray(propSchema.enum) && !required.has(key) && !hasOwn(propSchema, "default");
}
function widenPropertyForNullOmission(propSchema) {
    const widened = {
        ...propSchema
    };
    const enumValues = propSchema.enum;
    widened.enum = enumValues.includes(null) ? enumValues : [
        ...enumValues,
        null
    ];
    if (typeof propSchema.type === "string") {
        widened.type = [
            propSchema.type,
            "null"
        ];
    } else if (Array.isArray(propSchema.type) && !propSchema.type.includes("null")) {
        widened.type = [
            ...propSchema.type,
            "null"
        ];
    }
    const note = "null = omit this parameter";
    widened.description = typeof propSchema.description === "string" && propSchema.description.length > 0 ? `${propSchema.description} (${note})` : note;
    return widened;
}
function injectOptionalEnumOmissionSentinel(schema) {
    if (!isPlainObject(schema) || !isPlainObject(schema.properties)) return schema;
    const required = new Set(Array.isArray(schema.required) ? schema.required : []);
    let changed = false;
    const nextProperties = {
        ...schema.properties
    };
    for (const [key, propSchema] of Object.entries(schema.properties)){
        if (!shouldInjectNullOmission(key, propSchema, required)) continue;
        nextProperties[key] = widenPropertyForNullOmission(propSchema);
        changed = true;
    }
    if (!changed) return schema;
    return {
        ...schema,
        properties: nextProperties
    };
}
function injectOptionalEnumOmissionForTools(tools) {
    if (!Array.isArray(tools)) return tools;
    return tools.map((tool)=>{
        if (!isPlainObject(tool)) return tool;
        const result = {
            ...tool
        };
        if ("parameters" in result && !isPlainObject(result.function)) {
            result.parameters = injectOptionalEnumOmissionSentinel(result.parameters);
        }
        return result;
    });
}
function sanitizeToolDescriptions(tools) {
    if (!Array.isArray(tools)) return tools;
    return tools.map((tool)=>sanitizeToolDescription(tool));
}
function sanitizeToolId(id) {
    if (!id) return `tool_${crypto.randomUUID().replace(/-/g, "_")}`;
    const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    return sanitized || `tool_${crypto.randomUUID().replace(/-/g, "_")}`;
}
function injectEmptyReasoningContentForToolCalls(messages, provider, model) {
    const normalizedProvider = String(provider ?? "");
    const normalizedModel = String(model ?? "");
    // Check if this provider/model requires reasoning replay (DeepSeek V4, Kimi K2, etc.)
    const needsReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requiresReasoningReplay"])({
        provider: normalizedProvider,
        model: normalizedModel,
        thinkingEnabled: true
    });
    if (!Array.isArray(messages) || !needsReasoning) {
        return messages;
    }
    return messages.map((message)=>{
        if (!isPlainObject(message)) return message;
        if (message.role !== "assistant" || !Array.isArray(message.tool_calls) || message.tool_calls.length === 0 || message.reasoning_content !== undefined) {
            return message;
        }
        return {
            ...message,
            reasoning_content: ""
        };
    });
}
/**
 * Anthropic's first-party Messages API strictly validates tool `input_schema`
 * against JSON Schema draft 2020-12. IDE/SDK agent harnesses that deep-truncate
 * their schemas emit invalid constructs — most commonly an array keyword
 * (`enum`, `required`, …) replaced by a placeholder string such as
 * `"[MaxDepth]"`, or an index-keyed object (`{"0":"a","1":"b"}`) where an array
 * is expected. Anthropic rejects these with
 * `tools.N.custom.input_schema: JSON schema is invalid` (surfaced as a
 * misleading `400 out of extra usage` placeholder when streaming). Non-Anthropic
 * targets (OpenAI/Codex) tolerate them, which is why the same request succeeds
 * on a fallback provider. This sanitizer coerces or drops the invalid
 * constructs so legitimate native-Claude-OAuth traffic is not spuriously
 * rejected. See Spec E (Claude Code OAuth wire compatibility).
 */ const SCHEMA_PLACEHOLDER_PATTERN = /^\[(?:MaxDepth|Truncated|Circular|Object|Array)\]$/;
const ARRAY_SCHEMA_KEYS = [
    "enum",
    "required",
    "anyOf",
    "oneOf",
    "allOf",
    "prefixItems"
];
const SCHEMA_ARRAY_OF_SCHEMAS = new Set([
    "anyOf",
    "oneOf",
    "allOf",
    "prefixItems"
]);
const SCHEMA_SLOT_KEYS = [
    "items",
    "additionalProperties",
    "propertyNames",
    "contains",
    "not",
    "if",
    "then",
    "else",
    "unevaluatedProperties",
    "additionalItems"
];
function coerceIndexedObjectToArray(value) {
    if (Array.isArray(value)) return value;
    if (isPlainObject(value)) {
        const keys = Object.keys(value);
        if (keys.length > 0 && keys.every((key, index)=>String(index) === key)) {
            return keys.map((key)=>value[key]);
        }
    }
    return null;
}
function isSchemaPlaceholder(value) {
    return typeof value === "string" && SCHEMA_PLACEHOLDER_PATTERN.test(value.trim());
}
function stripInvalidSchemaConstructs(schema) {
    if (Array.isArray(schema)) {
        return schema.map((entry)=>stripInvalidSchemaConstructs(entry));
    }
    if (!isPlainObject(schema)) {
        return isSchemaPlaceholder(schema) ? {} : schema;
    }
    const result = {};
    for (const [key, value] of Object.entries(schema)){
        // Coerce string-encoded numeric constraints (e.g. minimum: "5") to numbers —
        // Anthropic rejects the string form. Done here so the Claude sanitizer covers
        // every slot this function recurses into (incl. contains / propertyNames /
        // additionalItems, which coerceSchemaNumericFields does not visit).
        if (NUMERIC_SCHEMA_FIELDS.includes(key)) {
            result[key] = coerceNumericString(value);
            continue;
        }
        if (ARRAY_SCHEMA_KEYS.includes(key)) {
            const array = coerceIndexedObjectToArray(value);
            if (array === null) continue; // drop invalid non-array keyword (e.g. enum: "[MaxDepth]")
            result[key] = SCHEMA_ARRAY_OF_SCHEMAS.has(key) ? array.map((entry)=>stripInvalidSchemaConstructs(entry)) : array;
            continue;
        }
        if (SCHEMA_SLOT_KEYS.includes(key)) {
            // Boolean schemas are valid in JSON Schema (e.g. `additionalProperties: false`
            // locks down the object); coercing to {} would silently allow extras and
            // invite the model to hallucinate arguments. Only placeholder strings
            // (e.g. "[MaxDepth]") get replaced with the permissive {}.
            if (isPlainObject(value) || Array.isArray(value)) {
                result[key] = stripInvalidSchemaConstructs(value);
            } else if (typeof value === "boolean") {
                result[key] = value;
            } else if (isSchemaPlaceholder(value)) {
                result[key] = {};
            } else {
                result[key] = value;
            }
            continue;
        }
        if (key === "const") {
            if (isSchemaPlaceholder(value)) continue;
            result[key] = value;
            continue;
        }
        if (key === "properties" && isPlainObject(value)) {
            const properties = {};
            for (const [propName, propSchema] of Object.entries(value)){
                // Same boolean-preservation rule as SCHEMA_SLOT_KEYS above:
                // `{ properties: { onlyAdminCanSet: false } }` is a valid permission
                // gate and must not be silently turned into the permissive {}.
                if (isPlainObject(propSchema) || Array.isArray(propSchema)) {
                    properties[propName] = stripInvalidSchemaConstructs(propSchema);
                } else if (typeof propSchema === "boolean") {
                    properties[propName] = propSchema;
                } else if (isSchemaPlaceholder(propSchema)) {
                    properties[propName] = {};
                } else {
                    properties[propName] = propSchema;
                }
            }
            result[key] = properties;
            continue;
        }
        if ((key === "$defs" || key === "definitions" || key === "patternProperties" || key === "dependentSchemas") && isPlainObject(value)) {
            const defs = {};
            for (const [defName, defSchema] of Object.entries(value)){
                defs[defName] = stripInvalidSchemaConstructs(defSchema);
            }
            result[key] = defs;
            continue;
        }
        // Placeholders are only coerced to {} in subschema-expecting positions
        // (handled in the branches above). A placeholder in a scalar annotation
        // keyword (description / title / pattern / format) must stay scalar —
        // turning it into {} is itself invalid draft-2020-12 and would re-trigger
        // the very 400 this sanitizer prevents.
        result[key] = isPlainObject(value) || Array.isArray(value) ? stripInvalidSchemaConstructs(value) : value;
    }
    return result;
}
function sanitizeClaudeToolSchema(schema) {
    // stripInvalidSchemaConstructs now also coerces numeric-string constraints, so
    // it is the single pass for the Claude path. We deliberately do NOT compose
    // coerceSchemaNumericFields: it strips the valid `default` keyword (Fix #1782,
    // a translator concern) which on the native / passthrough surface would
    // silently alter tool schemas that were previously forwarded verbatim.
    return stripInvalidSchemaConstructs(schema);
}
function sanitizeClaudeToolSchemas(tools) {
    if (!Array.isArray(tools)) return tools;
    return tools.map((tool)=>{
        if (!isPlainObject(tool) || tool.input_schema === undefined) return tool;
        return {
            ...tool,
            input_schema: sanitizeClaudeToolSchema(tool.input_schema)
        };
    });
}
}),
"[project]/open-sse/executors/claudeIdentity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_CODE_STAINLESS_VERSION",
    ()=>CLAUDE_CODE_STAINLESS_VERSION,
    "CLAUDE_CODE_VERSION",
    ()=>CLAUDE_CODE_VERSION,
    "buildUserIdJson",
    ()=>buildUserIdJson,
    "fetchClaudeBootstrap",
    ()=>fetchClaudeBootstrap,
    "generateCliUserID",
    ()=>generateCliUserID,
    "getSessionId",
    ()=>getSessionId,
    "parseUpstreamMetadataUserId",
    ()=>parseUpstreamMetadataUserId,
    "passthroughUpstreamSessionId",
    ()=>passthroughUpstreamSessionId,
    "resolveAccountUUID",
    ()=>resolveAccountUUID,
    "resolveCliUserID",
    ()=>resolveCliUserID,
    "selectBetaFlags",
    ()=>selectBetaFlags,
    "shouldUseMidConversationSystem",
    ()=>shouldUseMidConversationSystem,
    "stainlessArch",
    ()=>stainlessArch,
    "stainlessOS",
    ()=>stainlessOS,
    "stainlessRuntimeVersion",
    ()=>stainlessRuntimeVersion,
    "stripProxyToolPrefix",
    ()=>stripProxyToolPrefix,
    "uuidV4FromHash",
    ()=>uuidV4FromHash
]);
/**
 * Claude Code identity helpers used by the native `claude` provider when
 * authenticating with an OAuth token. Anthropic's user:sessions:claude_code
 * scope expects request shape that matches a real claude-cli session;
 * everything in this module exists to produce that shape.
 *
 * Pinned to a captured claude-cli release. Bump in lockstep when a newer
 * release is captured.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/claudeCodeClient.ts [instrumentation] (ecmascript)");
;
;
const CLAUDE_CODE_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_CLIENT_VERSION"];
const CLAUDE_CODE_STAINLESS_VERSION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$claudeCodeClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_SDK_PACKAGE_VERSION"];
function stainlessOS() {
    switch(process.platform){
        case "win32":
            return "Windows";
        case "darwin":
            return "MacOS";
        case "linux":
            return "Linux";
        case "freebsd":
            return "FreeBSD";
        default:
            return "Unknown";
    }
}
function stainlessArch() {
    switch(process.arch){
        case "x64":
            return "x64";
        case "arm64":
            return "arm64";
        case "ia32":
            return "x32";
        default:
            return process.arch;
    }
}
function stainlessRuntimeVersion() {
    return process.version;
}
// ---------- Bounded-map helper -------------------------------------------
const IDENTITY_CACHE_LIMIT = 10_000;
const BOOTSTRAP_FETCH_TIMEOUT_MS = 10_000;
/** Insert with FIFO eviction once a Map reaches `max`. JS Maps preserve insertion order. */ function setBounded(m, key, value, max) {
    if (!m.has(key) && m.size >= max) {
        const oldest = m.keys().next().value;
        if (oldest !== undefined) m.delete(oldest);
    }
    m.set(key, value);
}
// ---------- Upstream session-id passthrough ------------------------------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function passthroughUpstreamSessionId(clientHeaders) {
    if (!clientHeaders) return null;
    const raw = clientHeaders["x-claude-code-session-id"] ?? clientHeaders["X-Claude-Code-Session-Id"];
    if (typeof raw !== "string") return null;
    const v = raw.trim();
    return UUID_RE.test(v) ? v : null;
}
// ---------- Session ID (per OAuth account, process lifetime) -------------
const sessionCache = new Map();
function getSessionId(seed) {
    let id = sessionCache.get(seed);
    if (id) return id;
    id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    setBounded(sessionCache, seed, id, IDENTITY_CACHE_LIMIT);
    return id;
}
function generateCliUserID() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("hex");
}
const lazyCliUserIDCache = new Map();
const HEX64_RE = /^[a-f0-9]{64}$/i;
function resolveCliUserID(providerSpecificData, seed) {
    const cli = providerSpecificData?.cliUserID;
    if (typeof cli === "string" && HEX64_RE.test(cli)) return cli;
    const alt = providerSpecificData?.userID;
    if (typeof alt === "string" && HEX64_RE.test(alt)) return alt;
    let cached = lazyCliUserIDCache.get(seed);
    if (cached) return cached;
    cached = generateCliUserID();
    setBounded(lazyCliUserIDCache, seed, cached, IDENTITY_CACHE_LIMIT);
    return cached;
}
// ---------- Account UUID -------------------------------------------------
const ACCOUNT_FETCH_RETRY_MS = 5 * 60 * 1000;
const accountUuidCache = new Map();
const inflightFetches = new Set();
async function fetchClaudeBootstrap(accessToken) {
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), BOOTSTRAP_FETCH_TIMEOUT_MS);
    try {
        const res = await fetch("https://api.anthropic.com/api/claude_cli/bootstrap", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                "User-Agent": `claude-cli/${CLAUDE_CODE_VERSION} (external, cli)`,
                "anthropic-beta": "oauth-2025-04-20"
            },
            signal: ctrl.signal
        });
        if (!res.ok) return null;
        const data = await res.json().catch(()=>null);
        const acct = data && typeof data === "object" ? data.oauth_account : null;
        if (!acct || typeof acct !== "object") return null;
        const account = acct;
        const stringOrNull = (value)=>typeof value === "string" ? value : null;
        return {
            account_uuid: stringOrNull(account.account_uuid),
            account_email: stringOrNull(account.account_email),
            organization_uuid: stringOrNull(account.organization_uuid),
            organization_name: stringOrNull(account.organization_name),
            organization_type: stringOrNull(account.organization_type),
            organization_rate_limit_tier: stringOrNull(account.organization_rate_limit_tier)
        };
    } catch  {
        return null;
    } finally{
        clearTimeout(timer);
    }
}
async function backgroundFetchAccountUUID(accessToken, seed) {
    if (inflightFetches.has(seed)) return;
    const cached = accountUuidCache.get(seed);
    if (cached?.uuid) return;
    if (cached && Date.now() - cached.fetchedAt < ACCOUNT_FETCH_RETRY_MS) return;
    inflightFetches.add(seed);
    try {
        const bootstrap = await fetchClaudeBootstrap(accessToken);
        setBounded(accountUuidCache, seed, {
            uuid: bootstrap?.account_uuid ?? null,
            fetchedAt: Date.now()
        }, IDENTITY_CACHE_LIMIT);
    } finally{
        inflightFetches.delete(seed);
    }
}
function uuidV4FromHash(hex64) {
    return [
        hex64.slice(0, 8),
        hex64.slice(8, 12),
        "4" + hex64.slice(13, 16),
        (parseInt(hex64.charAt(16), 16) & 0x3 | 0x8).toString(16) + hex64.slice(17, 20),
        hex64.slice(20, 32)
    ].join("-");
}
function resolveAccountUUID(providerSpecificData, seed, accessToken) {
    const camel = providerSpecificData?.accountUUID;
    if (typeof camel === "string" && camel.length >= 32) return camel;
    const snake = providerSpecificData?.account_uuid;
    if (typeof snake === "string" && snake.length >= 32) return snake;
    const cached = accountUuidCache.get(seed);
    if (cached?.uuid) return cached.uuid;
    if (accessToken) void backgroundFetchAccountUUID(accessToken, seed);
    // CodeQL: This is intentionally SHA-256 for deterministic UUID generation from
    // a seed string — NOT password hashing. The output is a format-correct UUIDv4
    // used as a fallback account identifier; no secrets are being protected.
    // lgtm[js/insufficient-password-hash]
    return uuidV4FromHash((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update("account:" + seed).digest("hex") // nosemgrep: insufficient-password-hash
    );
}
function buildUserIdJson(opts) {
    return JSON.stringify({
        device_id: opts.deviceId,
        account_uuid: opts.accountUUID,
        session_id: opts.sessionId
    });
}
function parseUpstreamMetadataUserId(body) {
    if (!body) return null;
    const md = body.metadata;
    const raw = md?.user_id;
    if (typeof raw !== "string" || raw.length === 0) return null;
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch  {
        return null;
    }
    if (!parsed || typeof parsed !== "object") return null;
    const { device_id, account_uuid, session_id } = parsed;
    if (typeof device_id !== "string" || !HEX64_RE.test(device_id) || typeof account_uuid !== "string" || !UUID_RE.test(account_uuid) || typeof session_id !== "string" || !UUID_RE.test(session_id)) {
        return null;
    }
    return {
        device_id,
        account_uuid,
        session_id
    };
}
// ---------- anthropic-beta selector --------------------------------------
/**
 * Models that support the heavy-agent beta tier (effort, advanced-tool-use).
 * Only Opus/Sonnet are eligible — Haiku with OAuth authentication rejects
 * heavy agent flags (issue #2454). Matches real Claude Code captures.
 */ const HEAVY_AGENT_BETA_MODEL_PREFIXES = [
    "claude-opus",
    "claude-sonnet"
];
/**
 * Models that support the context-1m beta tier. Only Opus is eligible;
 * Sonnet trips long-context credit gates under OAuth full-agent traffic.
 * Opus 5 is excluded because its 1M context window is native.
 */ const CONTEXT_1M_BETA_MODEL_PREFIXES = [
    "claude-opus"
];
const CONTEXT_1M_NATIVE_MODEL_PREFIXES = [
    "claude-opus-5"
];
function matchesModelPrefix(model, prefixes) {
    if (typeof model !== "string") return false;
    const normalized = model.toLowerCase();
    return prefixes.some((prefix)=>normalized.includes(prefix));
}
function isHeavyAgentModel(model) {
    return matchesModelPrefix(model, HEAVY_AGENT_BETA_MODEL_PREFIXES);
}
function isContext1mModel(model) {
    return matchesModelPrefix(model, CONTEXT_1M_BETA_MODEL_PREFIXES) && !matchesModelPrefix(model, CONTEXT_1M_NATIVE_MODEL_PREFIXES);
}
function shouldUseMidConversationSystem(body, model) {
    const payload = body || {};
    const hasSystem = !!payload.system && (typeof payload.system === "string" || Array.isArray(payload.system) && payload.system.length > 0);
    const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0;
    const effectiveModel = model ?? (typeof payload.model === "string" ? payload.model : "");
    return hasSystem && hasTools && matchesModelPrefix(effectiveModel, CONTEXT_1M_BETA_MODEL_PREFIXES);
}
function selectBetaFlags(body, model, // The client's inbound `anthropic-beta` header, when present. Real Claude Code
// clients negotiate their own beta set; forcing thinking/effort betas they never
// requested produced malformed opus tool_use streams (#3415). When this is a
// non-empty string we respect it and do NOT force those betas. For opaque clients
// (no header — the OAuth identity cloak) the full set is retained unchanged.
clientBeta) {
    const b = body || {};
    const clientBetaSet = typeof clientBeta === "string" && clientBeta.trim().length > 0 ? new Set(clientBeta.split(",").map((f)=>f.trim()).filter(Boolean)) : null;
    // When the client negotiated its own anthropic-beta, only emit the thinking / heavy
    // betas it actually asked for. Opaque clients (clientBetaSet === null) keep them all.
    const allowThinking = clientBetaSet === null || clientBetaSet.has("interleaved-thinking-2025-05-14");
    // effort-2025-11-24 must NOT imply advanced-tool-use-2025-11-20 (#9505): Claude
    // Code sends effort on every request and never sends ATU, so treating effort as
    // a proxy for ATU force-injects the heavy-agent pair the client never negotiated —
    // the same class of mutation #3415 closed. Opaque clients keep the full set.
    const allowHeavy = clientBetaSet === null || clientBetaSet.has("advanced-tool-use-2025-11-20");
    const hasSystem = !!b.system && (typeof b.system === "string" || Array.isArray(b.system) && b.system.length > 0);
    const tools = b.tools;
    const hasTools = Array.isArray(tools) && tools.length > 0;
    const outputCfg = b.output_config;
    const hasStructuredOutput = !!(outputCfg && outputCfg.format?.type === "json_schema") || !!b.response_format?.type;
    const isFullAgent = hasTools && hasSystem;
    const effectiveModel = model ?? (typeof b.model === "string" ? b.model : "");
    const isHeavyAgent = isFullAgent && isHeavyAgentModel(effectiveModel);
    const isOpusAgent = shouldUseMidConversationSystem(b, effectiveModel);
    const isContext1m = isFullAgent && isContext1mModel(effectiveModel);
    const flags = [];
    if (isFullAgent) flags.push("claude-code-20250219");
    flags.push("oauth-2025-04-20");
    if (isContext1m) flags.push("context-1m-2025-08-07");
    if (isOpusAgent) flags.push("mid-conversation-system-2026-04-07");
    // Thinking betas: gated on the client header (#3415). interleaved-thinking forces
    // interleaved-thinking semantics that conflict with a tool_choice-forced turn,
    // producing malformed opus tool_use streams when the client never asked for it.
    if (allowThinking) {
        flags.push("interleaved-thinking-2025-05-14", "redact-thinking-2026-02-12", "thinking-token-count-2026-05-13");
    }
    flags.push("context-management-2025-06-27", "prompt-caching-scope-2026-01-05");
    if (hasStructuredOutput || isFullAgent) flags.push("advisor-tool-2026-03-01");
    if (hasStructuredOutput && !isFullAgent) flags.push("structured-outputs-2025-12-15");
    // extended-cache-ttl is sent for all full-agent shapes (incl. Haiku); the
    // heavier afk-mode / advanced-tool-use / effort flags are Opus/Sonnet-only.
    if (isFullAgent) {
        flags.push("extended-cache-ttl-2025-04-11", "cache-diagnosis-2026-04-07");
    }
    if (isHeavyAgent && allowHeavy) {
        flags.push("advanced-tool-use-2025-11-20", "effort-2025-11-24");
    }
    return flags.join(",");
}
// ---------- Tool-name normalisation --------------------------------------
const TOOL_PREFIX = "proxy_";
function stripProxyToolPrefix(body) {
    const stripName = (n)=>{
        if (typeof n !== "string") return undefined;
        return n.startsWith(TOOL_PREFIX) ? n.slice(TOOL_PREFIX.length) : n;
    };
    const tools = body.tools;
    if (Array.isArray(tools)) {
        for (const t of tools){
            const stripped = stripName(t.name);
            if (stripped !== undefined) t.name = stripped;
        }
    }
    const tc = body.tool_choice;
    if (tc && typeof tc.name === "string") {
        const stripped = stripName(tc.name);
        if (stripped !== undefined) tc.name = stripped;
    }
    const messages = body.messages;
    if (Array.isArray(messages)) {
        for (const m of messages){
            const content = m.content;
            if (!Array.isArray(content)) continue;
            for (const block of content){
                if (block?.type === "tool_use") {
                    const stripped = stripName(block.name);
                    if (stripped !== undefined) block.name = stripped;
                }
            }
        }
    }
}
}),
"[project]/open-sse/executors/forceResponsesUpstream.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shouldForceResponsesUpstream",
    ()=>shouldForceResponsesUpstream,
    "withForcedResponsesUpstream",
    ()=>withForcedResponsesUpstream
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function shouldForceResponsesUpstream(provider, body, credentials) {
    if (!provider.startsWith("openai-compatible-")) return false;
    if (!isRecord(body)) return false;
    const providerSpecificData = credentials?.providerSpecificData ?? null;
    if (providerSpecificData?._omnirouteForceResponsesUpstream === true) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getOpenAICompatibleType"])(provider, providerSpecificData) === "responses") return false;
    const hasResponsesShape = body.input !== undefined || body.previous_response_id !== undefined || body.max_output_tokens !== undefined || body.reasoning !== undefined;
    if (!hasResponsesShape) return false;
    const tools = Array.isArray(body.tools) ? body.tools : [];
    return tools.some((toolValue)=>{
        if (!isRecord(toolValue)) return false;
        const toolType = typeof toolValue.type === "string" ? toolValue.type : "";
        return toolType === "namespace" || /^tool_search/.test(toolType);
    });
}
function withForcedResponsesUpstream(provider, body, credentials) {
    if (!shouldForceResponsesUpstream(provider, body, credentials)) return credentials;
    return {
        ...credentials,
        providerSpecificData: {
            ...credentials.providerSpecificData,
            _omnirouteForceResponsesUpstream: true
        }
    };
}
}),
"[project]/open-sse/executors/base/headers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure upstream header helpers (User-Agent, extra headers, OpenAI-compat stripping).
// Extracted verbatim from base.ts. Module-private JsonRecord kept local to avoid a cycle.
__turbopack_context__.s([
    "applyConfiguredUserAgent",
    ()=>applyConfiguredUserAgent,
    "getCustomUserAgent",
    ()=>getCustomUserAgent,
    "isOpenAICompatibleEndpoint",
    ()=>isOpenAICompatibleEndpoint,
    "mergeUpstreamExtraHeaders",
    ()=>mergeUpstreamExtraHeaders,
    "setUserAgentHeader",
    ()=>setUserAgentHeader,
    "stripStainlessHeadersForOpenAICompat",
    ()=>stripStainlessHeadersForOpenAICompat
]);
function mergeUpstreamExtraHeaders(headers, extra) {
    if (!extra) return;
    for (const [k, v] of Object.entries(extra)){
        if (typeof k === "string" && k.length > 0 && typeof v === "string") {
            if (k.toLowerCase() === "user-agent") {
                setUserAgentHeader(headers, v);
                continue;
            }
            headers[k] = v;
        }
    }
}
function getCustomUserAgent(providerSpecificData) {
    const customUserAgent = typeof providerSpecificData?.customUserAgent === "string" ? providerSpecificData.customUserAgent.trim() : "";
    return customUserAgent || null;
}
function setUserAgentHeader(headers, userAgent) {
    headers["User-Agent"] = userAgent;
    if ("user-agent" in headers) {
        headers["user-agent"] = userAgent;
    }
}
function applyConfiguredUserAgent(headers, providerSpecificData) {
    const customUserAgent = getCustomUserAgent(providerSpecificData);
    if (customUserAgent) {
        setUserAgentHeader(headers, customUserAgent);
    }
}
function isOpenAICompatibleEndpoint(provider, url) {
    if (provider?.startsWith?.("openai-compatible-")) return true;
    return url.includes("/v1/chat/completions") || url.includes("/v1/responses");
}
function stripStainlessHeadersForOpenAICompat(headers, provider, url) {
    if (!isOpenAICompatibleEndpoint(provider, url)) return [];
    const strippedKeys = [];
    for (const key of Object.keys(headers)){
        if (key.toLowerCase().startsWith("x-stainless-")) {
            delete headers[key];
            strippedKeys.push(key);
        }
    }
    // Normalize User-Agent: SDK-based clients send verbose product strings that some
    // upstreams block. Replace with a clean browser-like UA only when it looks SDK-derived.
    const ua = (headers["User-Agent"] || headers["user-agent"] || "").toLowerCase();
    if (ua.includes("openai") && (ua.includes("node") || ua.includes("axios") || ua.includes("undici"))) {
        setUserAgentHeader(headers, "Mozilla/5.0 (compatible; OpenAI Compatible)");
    }
    return strippedKeys;
}
}),
"[project]/open-sse/executors/base/reasoningEffort.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITHUB_NO_REASONING_EFFORT_PATTERN",
    ()=>GITHUB_NO_REASONING_EFFORT_PATTERN,
    "GITHUB_REASONING_EFFORT_OPT_IN_PATTERN",
    ()=>GITHUB_REASONING_EFFORT_OPT_IN_PATTERN,
    "MISTRAL_NO_REASONING_EFFORT_PATTERN",
    ()=>MISTRAL_NO_REASONING_EFFORT_PATTERN,
    "mapNvidiaGlm52ReasoningParams",
    ()=>mapNvidiaGlm52ReasoningParams,
    "sanitizeReasoningEffortForProvider",
    ()=>sanitizeReasoningEffortForProvider,
    "supportsMaxEffortForProvider",
    ()=>supportsMaxEffortForProvider
]);
// Provider-aware reasoning_effort sanitation (xhigh/max normalization + reject strip).
// Extracted verbatim from base.ts. Deps are config/services only (no host import → no cycle).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
;
;
;
const MISTRAL_NO_REASONING_EFFORT_PATTERN = /devstral/i;
const GITHUB_REASONING_EFFORT_OPT_IN_PATTERN = /claude[-_.]?(?:opus|sonnet)[-_.]?4[-_.]6/i;
const GITHUB_NO_REASONING_EFFORT_PATTERN = /(claude|haiku|oswe)/i;
const NVIDIA_GLM_52_PATTERN = /z-ai\/glm-5\.2\b/i;
function isNvidiaGlm52(provider, model) {
    return provider === "nvidia" && NVIDIA_GLM_52_PATTERN.test(model || "");
}
/** Pulls a normalized (lowercased) effort string out of top-level or nested `reasoning.effort`. */ function extractNvidiaGlm52Effort(b) {
    const reasoning = b.reasoning && typeof b.reasoning === "object" && !Array.isArray(b.reasoning) ? b.reasoning : null;
    const effort = b.reasoning_effort ?? reasoning?.effort;
    if (effort === undefined) return null;
    const effortStr = typeof effort === "string" ? effort.toLowerCase() : "";
    if (!effortStr) return null;
    return {
        reasoning,
        effortStr
    };
}
/** Builds `chat_template_kwargs.enable_thinking`, or null when the existing kwargs shape is unusable. */ function buildNvidiaGlm52TemplateKwargs(rawTemplateKwargs, effortStr) {
    if (rawTemplateKwargs !== undefined && (!rawTemplateKwargs || typeof rawTemplateKwargs !== "object" || Array.isArray(rawTemplateKwargs))) {
        return null;
    }
    const templateKwargs = {
        ...rawTemplateKwargs ?? {}
    };
    if (!Object.prototype.hasOwnProperty.call(templateKwargs, "enable_thinking")) {
        templateKwargs.enable_thinking = effortStr !== "none";
    }
    return templateKwargs;
}
/** Returns a copy of `b` with `reasoning_effort`/`reasoning.effort` replaced by `templateKwargs`. */ function withNvidiaGlm52TemplateKwargs(b, templateKwargs, reasoning) {
    const next = {
        ...b,
        chat_template_kwargs: templateKwargs
    };
    delete next.reasoning_effort;
    if (reasoning) {
        const nextReasoning = {
            ...reasoning
        };
        delete nextReasoning.effort;
        if (Object.keys(nextReasoning).length === 0) delete next.reasoning;
        else next.reasoning = nextReasoning;
    }
    return next;
}
function mapNvidiaGlm52ReasoningParams(body, provider, model, log) {
    if (!isNvidiaGlm52(provider, model)) return body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const b = body;
    const info = extractNvidiaGlm52Effort(b);
    if (!info) return body;
    const templateKwargs = buildNvidiaGlm52TemplateKwargs(b.chat_template_kwargs, info.effortStr);
    if (!templateKwargs) return body;
    const next = withNvidiaGlm52TemplateKwargs(b, templateKwargs, info.reasoning);
    log?.info?.("REASONING_SANITIZE", `nvidia/${model || ""}: mapped reasoning effort to enable_thinking`);
    return next;
}
function supportsMaxEffortForProvider(provider, model) {
    const isClaude = (provider === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(provider)) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsClaudeMaxEffort"])(model);
    // opencode-go proxies DeepSeek with the native DeepSeek API contract, which
    // accepts {high, max} literally. Without this opt-in, max would be
    // normalized to xhigh (the OmniRoute-internal top tier) and rejected by the
    // upstream. Scoped to opencode-go deliberately: OpenRouter's DeepSeek path
    // (pi#4055) is the documented inverse and expects xhigh, not max.
    // Ollama Cloud also accepts literal max (for example GLM 5.2 supports
    // low|medium|high|max|none) and rejects xhigh.
    const isOpencodeGoDeepSeek = provider === "opencode-go" && model.toLowerCase().includes("deepseek");
    const isOllamaCloud = provider === "ollama-cloud";
    const isMoonshotK3 = (provider === "moonshot" || provider === "kimi") && /^kimi-k3(?:$|-)/i.test(model);
    return isClaude || isOpencodeGoDeepSeek || isOllamaCloud || isMoonshotK3;
}
function readEffortCarriers(b) {
    const reasoning = b.reasoning && typeof b.reasoning === "object" && !Array.isArray(b.reasoning) ? b.reasoning : null;
    const outputConfig = b.output_config && typeof b.output_config === "object" && !Array.isArray(b.output_config) ? b.output_config : null;
    const hasTopLevelReasoningEffort = Object.prototype.hasOwnProperty.call(b, "reasoning_effort");
    const hasReasoningEffort = !!(reasoning && Object.prototype.hasOwnProperty.call(reasoning, "effort"));
    const hasOutputConfigEffort = !!(outputConfig && Object.prototype.hasOwnProperty.call(outputConfig, "effort"));
    const effort = b.reasoning_effort ?? reasoning?.effort ?? outputConfig?.effort;
    return {
        reasoning,
        outputConfig,
        hasTopLevelReasoningEffort,
        hasReasoningEffort,
        hasOutputConfigEffort,
        effort
    };
}
/** Write a normalized effort value back to every carrier that was present. */ function writeEffortValue(b, value, c) {
    const next = {
        ...b
    };
    if (c.hasTopLevelReasoningEffort) next.reasoning_effort = value;
    if (c.hasReasoningEffort && c.reasoning) next.reasoning = {
        ...c.reasoning,
        effort: value
    };
    if (c.hasOutputConfigEffort && c.outputConfig) next.output_config = {
        ...c.outputConfig,
        effort: value
    };
    return next;
}
/** Strip the effort field from every carrier that was present. */ function stripEffortValue(b, c) {
    const next = {
        ...b
    };
    if (c.hasTopLevelReasoningEffort) delete next.reasoning_effort;
    if (c.hasReasoningEffort && c.reasoning) {
        const r = {
            ...c.reasoning
        };
        delete r.effort;
        if (Object.keys(r).length === 0) delete next.reasoning;
        else next.reasoning = r;
    }
    if (c.hasOutputConfigEffort && c.outputConfig) {
        const oc = {
            ...c.outputConfig
        };
        delete oc.effort;
        if (Object.keys(oc).length === 0) delete next.output_config;
        else next.output_config = oc;
    }
    return next;
}
function sanitizeReasoningEffortForProvider(body, provider, model, log) {
    if (isNvidiaGlm52(provider, model)) {
        return mapNvidiaGlm52ReasoningParams(body, provider, model, log);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const b = body;
    const c = readEffortCarriers(b);
    if (c.effort === undefined) return body;
    const effortStr = typeof c.effort === "string" ? c.effort.toLowerCase() : "";
    const modelStr = model || "";
    // Oh My Pi exposes `minimal`, while Codex's Responses API starts at `low`.
    // Normalize every carrier before the Codex executor sends the upstream request.
    if (provider === "codex" && effortStr === "minimal") {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: normalized reasoning_effort minimal → low`);
        return writeEffortValue(b, "low", c);
    }
    const githubOptIn = provider === "github" && GITHUB_REASONING_EFFORT_OPT_IN_PATTERN.test(modelStr);
    const rejecting = provider === "mistral" && MISTRAL_NO_REASONING_EFFORT_PATTERN.test(modelStr) || provider === "github" && !githubOptIn && GITHUB_NO_REASONING_EFFORT_PATTERN.test(modelStr);
    if (rejecting) {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: removed unsupported reasoning_effort`);
        return stripEffortValue(b, c);
    }
    // Native DeepSeek (api.deepseek.com) — V4 thinking mode accepts reasoning_effort
    // ONLY as {high, max} (its own top tier is literally "max"). OmniRoute's internal
    // scale is low|medium|high|xhigh where xhigh is the top, so map onto DeepSeek's
    // vocabulary: xhigh → max (top→top), low|medium → high (below the enum floor).
    // high/max pass through unchanged. Without this, the claude→openai translator's
    // xhigh (and max-normalized-to-xhigh below) reaches DeepSeek as an unknown value,
    // silently dropping the client's requested effort. This is the INVERSE of the
    // OpenRouter-DeepSeek path, whose normalized API expects xhigh, not max (pi#4055).
    if (provider === "deepseek") {
        const mapped = effortStr === "xhigh" ? "max" : effortStr === "low" || effortStr === "medium" ? "high" : null;
        if (mapped && mapped !== effortStr) {
            log?.info?.("REASONING_SANITIZE", `deepseek/${modelStr}: normalized reasoning_effort ${effortStr} → ${mapped}`);
            return writeEffortValue(b, mapped, c);
        }
        return body;
    }
    const supportsXHigh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsXHighEffort"])(provider, modelStr);
    const shouldDowngradeXHigh = effortStr === "xhigh" && !supportsXHigh;
    const supportsXHighForMax = supportsXHigh;
    const supportsMax = supportsMaxEffortForProvider(provider, modelStr);
    const shouldNormalizeMaxToXHigh = effortStr === "max" && !supportsMax && supportsXHighForMax;
    const shouldDowngradeMax = effortStr === "max" && !supportsMax && !supportsXHighForMax;
    if (shouldNormalizeMaxToXHigh) {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: normalized reasoning_effort max → xhigh`);
        return writeEffortValue(b, "xhigh", c);
    }
    if (shouldDowngradeXHigh || shouldDowngradeMax) {
        log?.info?.("REASONING_SANITIZE", `${provider}/${modelStr}: downgraded reasoning_effort ${effortStr} → high`);
        return writeEffortValue(b, "high", c);
    }
    return body;
}
}),
"[project]/open-sse/executors/base.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "BaseExecutor",
    ()=>BaseExecutor,
    "default",
    ()=>__TURBOPACK__default__export__,
    "mergeAbortSignals",
    ()=>mergeAbortSignals,
    "stripVersionedToolModelPrefix",
    ()=>stripVersionedToolModelPrefix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/alternateFormats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/anthropicHeaders.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$contextEditing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/contextEditing.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerFieldStrips.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/learnedThinkingCaps.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/cliFingerprints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/thinkingBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/openrouterFreeWindow.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wafRateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wafRateLimit.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/sessionPool.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/poolRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/apiKeyRotator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh/shared.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCCH.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeConstraints.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/claudeCodeCompatibleIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeObfuscation.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/responsesInputSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/systemTransforms.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/providerRequestLogging.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/claudeIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$forceResponsesUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/forceResponsesUpstream.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/resilience/peerRouting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/clineAuth.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$reasoningEffort$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/reasoningEffort.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
/**
 * Sanitizes a custom API path to prevent path traversal attacks.
 * Valid paths must start with '/', contain no '..' segments,
 * no null bytes, and be reasonable in length.
 */ function sanitizePath(path) {
    if (typeof path !== "string") return false;
    if (!path.startsWith("/")) return false;
    if (path.includes("\0")) return false; // null byte
    if (path.includes("..")) return false; // path traversal
    if (path.length > 512) return false; // sanity limit
    return true;
}
function mergeAbortSignals(primary, secondary) {
    const controller = new AbortController();
    const abortFrom = (source)=>{
        if (!controller.signal.aborted) {
            controller.abort(source.reason);
        }
    };
    if (primary.aborted) {
        abortFrom(primary);
        return controller.signal;
    }
    if (secondary.aborted) {
        abortFrom(secondary);
        return controller.signal;
    }
    primary.addEventListener("abort", ()=>abortFrom(primary), {
        once: true
    });
    secondary.addEventListener("abort", ()=>abortFrom(secondary), {
        once: true
    });
    return controller.signal;
}
function hasActiveClaudeThinking(body) {
    const thinking = body.thinking;
    return thinking?.type === "enabled" || thinking?.type === "adaptive";
}
/**
 * Collect every `thinkingConfig` object in a transformed request body that holds
 * a thinking budget, wherever the provider's envelope nests it:
 *   - body.generationConfig.thinkingConfig            (native Gemini / openai→gemini)
 *   - body.request.generationConfig.thinkingConfig    (Antigravity Cloud Code envelope)
 * Returns only objects that actually carry a `thinkingBudget`/`thinking_budget`
 * field — a request without thinking config is never mutated.
 */ function collectThinkingConfigs(body) {
    if (!body || typeof body !== "object") return [];
    const root = body;
    const configs = [];
    const envelopes = [
        root.generationConfig,
        root.request?.generationConfig
    ];
    for (const env of envelopes){
        if (!env || typeof env !== "object") continue;
        const tc = env.thinkingConfig;
        if (tc && typeof tc === "object") {
            const tcr = tc;
            if ("thinkingBudget" in tcr || "thinking_budget" in tcr) configs.push(tcr);
        }
    }
    return configs;
}
/**
 * Read the first thinking budget found in the body (any supported nest / naming).
 * Returns null when the body carries no readable numeric budget.
 */ function readNestedThinkingBudget(body) {
    for (const tc of collectThinkingConfigs(body)){
        const raw = tc.thinkingBudget ?? tc.thinking_budget;
        const n = Number(raw);
        if (Number.isFinite(n)) return n;
    }
    return null;
}
/**
 * Clamp every thinking budget in the body down to `max` (only lowers; never
 * raises a budget already below max). Mutates in place. Returns true when at
 * least one budget was actually lowered (i.e. a retry would send a different
 * body) — false means the 400 was not caused by an over-max budget we hold, so
 * retrying would resend an identical body and loop.
 */ function clampNestedThinkingBudget(body, max) {
    let changed = false;
    for (const tc of collectThinkingConfigs(body)){
        for (const key of [
            "thinkingBudget",
            "thinking_budget"
        ]){
            const n = Number(tc[key]);
            if (Number.isFinite(n) && n > max) {
                tc[key] = max;
                changed = true;
            }
        }
    }
    return changed;
}
/**
 * Strip the OmniRoute provider prefix from tool model fields (e.g.
 * `cc/claude-opus-4-8` → `claude-opus-4-8`). Versioned built-in tool types carry
 * an 8-digit date suffix (`advisor_20260301`, `bash_20250124`); non-versioned
 * server tools (Task/subagent, web_search) carry the same prefixed model. The
 * real Claude CLI sends a bare model id there, never a prefixed one, so a leaked
 * OmniRoute prefix makes Anthropic reject the request.
 *
 * Two mechanisms, applied to any tool with a string `model`:
 * 1. Versioned built-in types (`type` matches `_\d{8}$`): strip the last path
 *    segment (`model.split("/").pop()`), matching legacy behavior for kiro/ etc.
 * 2. Any tool whose model starts with a 9router Claude provider prefix
 *    (`cc/`, `claude/`): strip exactly that prefix (`slice`), preserving foreign
 *    providers such as `openrouter/anthropic/...` — mirrors upstream
 *    normalizeClaudeServerToolModels (9router#2649).
 * Mutates in place.
 */ const CLAUDE_TOOL_MODEL_PREFIXES = [
    "cc/",
    "claude/"
];
function stripVersionedToolModelPrefix(tools) {
    if (!Array.isArray(tools)) return;
    for (const t of tools){
        if (typeof t.model !== "string") continue;
        const model = t.model;
        if (typeof t.type === "string" && /^[a-z][a-z0-9_]*_\d{8}$/.test(t.type) && model.includes("/")) {
            t.model = model.split("/").pop();
        } else {
            const prefix = CLAUDE_TOOL_MODEL_PREFIXES.find((candidate)=>model.startsWith(candidate));
            if (prefix) t.model = model.slice(prefix.length);
        }
    }
}
class BaseExecutor {
    provider;
    config;
    // Session pool support — subclasses can set poolConfig to opt in
    poolConfig;
    _pool = null;
    constructor(provider, config){
        this.provider = provider;
        this.config = config;
    }
    getProvider() {
        return this.provider;
    }
    getPool() {
        if (!this.poolConfig) return null;
        if (!this._pool) {
            const pool = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SessionPool"](this.provider, this.poolConfig);
            pool.warmUp(this.poolConfig.minSessions).catch(()=>{});
            __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$poolRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["PoolRegistry"].register(this.provider, pool);
            this._pool = pool;
        }
        return this._pool;
    }
    buildPoolHeaders(session) {
        if (!session) return {};
        return session.buildHeaders();
    }
    getBaseUrls() {
        return this.config.baseUrls || (this.config.baseUrl ? [
            this.config.baseUrl
        ] : []);
    }
    getFallbackCount() {
        return this.getBaseUrls().length || 1;
    }
    getTimeoutMs() {
        const configured = this.config?.timeoutMs;
        if (typeof configured !== "number" || !Number.isFinite(configured)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        }
        return Math.max(1, Math.floor(configured));
    }
    getCountTokensTimeoutMs() {
        return this.getTimeoutMs();
    }
    buildUrl(model, stream, urlIndex = 0, credentials = null) {
        void model;
        void stream;
        if (this.provider?.startsWith?.("openai-compatible-")) {
            const psd = credentials?.providerSpecificData;
            const baseUrl = typeof psd?.baseUrl === "string" ? psd.baseUrl : "https://api.openai.com/v1";
            const normalized = baseUrl.replace(/\/$/, "");
            // Sanitize custom path: must start with '/', no path traversal, no null bytes
            const rawPath = typeof psd?.chatPath === "string" && psd.chatPath ? psd.chatPath : null;
            const customPath = rawPath && sanitizePath(rawPath) ? rawPath : null;
            if (customPath) return `${normalized}${customPath}`;
            const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getOpenAICompatibleType"])(this.provider, psd) === "responses" ? "/responses" : "/chat/completions";
            return `${normalized}${path}`;
        }
        const baseUrls = this.getBaseUrls();
        return baseUrls[urlIndex] || baseUrls[0] || this.config.baseUrl || "";
    }
    /**
   * Resolve the effective base URL for a request, preferring per-connection
   * providerSpecificData.baseUrl over the static provider config baseUrl.
   */ resolveBaseUrl(credentials, fallback) {
        const psdBaseUrl = credentials?.providerSpecificData?.baseUrl;
        // Operator's manual override always wins (#6147).
        if (typeof psdBaseUrl === "string" && psdBaseUrl) return psdBaseUrl;
        // An alternate protocol selected on the connection carries its own URL.
        const alternate = this.resolveAlternate(credentials);
        if (alternate?.baseUrl) return alternate.baseUrl;
        return fallback || this.config.baseUrl || "";
    }
    /**
   * Alternate protocol selected on this connection, if the provider declares one
   * that matches. Centralizes the registry lookup so every call-site resolves the
   * same way.
   */ resolveAlternate(credentials) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$alternateFormats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlternateFormat"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(this.provider), credentials?.providerSpecificData);
    }
    usesClaudeCodeProtocol(credentials) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isClaudeCodeCompatible"])(this.provider)) return false;
        const format = this.resolveAlternate(credentials)?.format;
        return format !== "openai" && format !== "openai-responses";
    }
    /**
   * Resolve the effective API key via extra-keys round-robin rotation.
   * Mutates `credentials.providerSpecificData.selectedKeyId` on rotation.
   */ resolveEffectiveKey(credentials) {
        const extraKeys = credentials.providerSpecificData?.extraApiKeys ?? [];
        const selectedKeyId = credentials.providerSpecificData?.selectedKeyId;
        const validExtras = extraKeys.filter((k)=>typeof k === "string" && k.trim().length > 0);
        let effectiveKey = credentials.apiKey;
        // Rotate whenever extras exist — including empty primary + populated extras (#8467).
        // getValidApiKey already skips a blank primary and round-robins the extras alone.
        if (validExtras.length > 0 && credentials.connectionId) {
            const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$apiKeyRotator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveKeyForRequest"])(credentials.connectionId, credentials.apiKey || "", validExtras, selectedKeyId ?? null);
            effectiveKey = resolved?.key ?? credentials.apiKey;
            if (resolved && credentials.providerSpecificData) {
                credentials.providerSpecificData.selectedKeyId = resolved.keyId;
            }
        }
        return effectiveKey;
    }
    /**
   * Build the common header preamble shared by BaseExecutor and DefaultExecutor:
   * Content-Type, config.headers, per-provider User-Agent env override, and
   * resolved effective key (via extra-keys round-robin).
   */ buildHeadersPreamble(credentials, stream) {
        const alternate = this.resolveAlternate(credentials);
        const headers = {
            "Content-Type": "application/json",
            ...this.config.headers,
            ...alternate?.headers || {}
        };
        // Allow per-provider User-Agent override via environment variable.
        // Example: CLAUDE_USER_AGENT="my-agent/2.0" overrides the default for the Claude provider.
        const providerId = this.config?.id || this.provider;
        if (providerId) {
            const envKey = `${providerId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_USER_AGENT`;
            const envUA = process.env[envKey]?.trim();
            if (envUA) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setUserAgentHeader"])(headers, envUA);
            }
        }
        const effectiveKey = this.resolveEffectiveKey(credentials);
        void stream;
        return {
            headers,
            effectiveKey
        };
    }
    buildHeaders(credentials, stream = true, clientHeaders, model, health) {
        void clientHeaders;
        void model;
        const { headers, effectiveKey } = this.buildHeadersPreamble(credentials, stream);
        if (credentials.accessToken) {
            headers["Authorization"] = `Bearer ${credentials.accessToken}`;
        } else if (effectiveKey) {
            headers["Authorization"] = `Bearer ${effectiveKey}`;
        }
        headers["Accept"] = stream ? "text/event-stream" : "application/json";
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeAnthropicHeaderVariants"])(headers);
        return headers;
    }
    // Override in subclass for provider-specific transformations
    transformRequest(model, body, stream, credentials) {
        void model;
        void stream;
        void credentials;
        // Fix #1674: Remove empty string values from optional parameters
        // like tool descriptions to avoid upstream validation failures.
        if (body && typeof body === "object" && !Array.isArray(body)) {
            const cloned = {
                ...body
            };
            if (Array.isArray(cloned.input)) {
                cloned.input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeResponsesInputItems"])(cloned.input, false);
            }
            if (Array.isArray(cloned.tools)) {
                cloned.tools = cloned.tools.map((tool)=>{
                    if (tool && typeof tool === "object" && !Array.isArray(tool)) {
                        const toolRecord = tool;
                        const toolFunction = toolRecord.function;
                        if (toolFunction && typeof toolFunction === "object" && !Array.isArray(toolFunction)) {
                            const func = {
                                ...toolFunction
                            };
                            if (func.description === "") delete func.description;
                            if (typeof func.name !== "string" || func.name.trim() === "") {
                                func.name = "unnamed_tool";
                            }
                            return {
                                ...toolRecord,
                                function: func
                            };
                        }
                    }
                    return tool;
                });
            }
            // Fix #1884: Cursor sends prompt_cache_retention which breaks strict upstream endpoints
            delete cloned.prompt_cache_retention;
            // Also clean up top level optional fields that commonly cause issues when empty
            const optionalKeys = [
                "user",
                "stop",
                "seed",
                "response_format"
            ];
            for (const key of optionalKeys){
                if (cloned[key] === "") delete cloned[key];
            }
            return cloned;
        }
        return body;
    }
    shouldRetry(status, urlIndex) {
        return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && urlIndex + 1 < this.getFallbackCount();
    }
    // Intra-URL retry config: retry same URL before falling back to next node
    static RETRY_CONFIG = {
        maxAttempts: 2,
        delayMs: 2000
    };
    // WAF (400 content-blocked) retry config: agentrouter.org's WAF is burst-sensitive
    // and recovers after a short cooldown. Use exponential backoff with a higher
    // starting delay than the generic 429 retry (which is 2s) because the WAF
    // needs more time to clear its per-IP suspicion bucket.
    static WAF_RETRY_CONFIG = {
        maxAttempts: 2,
        delayMs: 1500,
        backoffMultiplier: 2
    };
    // Timeout for receiving the initial upstream response headers. Once the response
    // starts streaming, STREAM_IDLE_TIMEOUT_MS / Undici bodyTimeout handle stalls.
    static FETCH_START_TIMEOUT_MS = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    // Override in subclass for provider-specific refresh
    async refreshCredentials(credentials, log) {
        void credentials;
        void log;
        return null;
    }
    needsRefresh(credentials) {
        if (!credentials?.expiresAt) return false;
        const expiresAtMs = new Date(credentials.expiresAt).getTime();
        // Use the provider-specific lead time (REFRESH_LEAD_MS) so rotating-token
        // providers like Codex refresh proactively far ahead of expiry. Keeping the
        // refresh_token "warm" prevents Auth0 from marking it as stale and revoking
        // the token family on first use after long idle.
        const lead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRefreshLeadMs"])(this.provider);
        return expiresAtMs - Date.now() < lead;
    }
    parseError(response, bodyText) {
        return {
            status: response.status,
            message: bodyText || `HTTP ${response.status}`
        };
    }
    buildCountTokensUrl(model, credentials = null) {
        void model;
        void credentials;
        const baseUrl = this.buildUrl(model, false, 0, credentials);
        if (typeof baseUrl !== "string" || baseUrl.length === 0) return null;
        if (this.config?.format !== "claude" || !baseUrl.includes("/messages")) return null;
        const [path, query = ""] = baseUrl.split("?");
        const normalizedPath = path.endsWith("/messages") ? `${path}/count_tokens` : `${path}/count_tokens`;
        return query ? `${normalizedPath}?${query}` : normalizedPath;
    }
    async countTokens({ model, body, credentials, signal, log }) {
        const url = this.buildCountTokensUrl(model, credentials);
        if (!url) return null;
        const headers = this.buildHeaders(credentials, false);
        const requestBody = body && typeof body === "object" ? {
            ...body,
            model
        } : {
            model
        };
        let timeoutId = null;
        let activeSignal = signal || null;
        let controller = null;
        const timeoutMs = this.getCountTokensTimeoutMs();
        if (timeoutMs > 0) {
            controller = new AbortController();
            timeoutId = setTimeout(()=>controller?.abort(), timeoutMs);
            activeSignal = signal ? mergeAbortSignals(signal, controller.signal) : controller.signal;
        }
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(requestBody),
                signal: activeSignal || undefined
            });
            const text = await response.text();
            if (!response.ok) {
                const parsedError = this.parseError(response, text);
                throw new Error(parsedError.message);
            }
            const parsed = text ? JSON.parse(text) : {};
            const inputTokens = Number(parsed?.input_tokens);
            if (!Number.isFinite(inputTokens)) {
                throw new Error("Provider count_tokens response missing input_tokens");
            }
            return {
                input_tokens: inputTokens,
                provider: this.provider,
                source: "provider"
            };
        } catch (error) {
            log?.debug?.("COUNT_TOKENS", `${this.provider}/${model} real count unavailable: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        } finally{
            if (timeoutId) clearTimeout(timeoutId);
        }
    }
    async execute(input) {
        const { model, body, stream, credentials, signal, log, extendedContext, upstreamExtraHeaders, clientHeaders, skipUpstreamRetry = false, onCredentialsRefreshed, contextEditing } = input;
        const fallbackCount = this.getFallbackCount();
        let lastError = null;
        let lastStatus = 0;
        let activeCredentials = credentials;
        // Track per-URL intra-retry attempts to avoid infinite loops
        const retryAttemptsByUrl = {};
        if (this.needsRefresh(credentials)) {
            try {
                // Fix A: wire onCredentialsRefreshed through runWithOnPersist so it runs
                // INSIDE the per-connection mutex inside getAccessToken. Not every
                // executor routes through getAccessToken (e.g. github.ts), so use a flag
                // to detect whether the persist callback actually fired and fall back to
                // post-refresh mutation when it didn't.
                let proactivePersistRan = false;
                const proactiveOnPersist = onCredentialsRefreshed ? async (refreshResult)=>{
                    proactivePersistRan = true;
                    activeCredentials = {
                        ...credentials,
                        ...refreshResult
                    };
                    await onCredentialsRefreshed(refreshResult);
                } : null;
                const refreshed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["runWithOnPersist"])(proactiveOnPersist, ()=>this.refreshCredentials(credentials, log || null));
                if (refreshed && !proactivePersistRan) {
                    // ─────────────────────────────────────────────────────────────────────
                    // ⚠️ SOURCE OF TRUTH — do not flip the proactive path back to
                    //    "persist expired+inactive". Ask the operator first.
                    //
                    // History (do not repeat past regressions):
                    //   - ad3d4b696 (#2718, 2026-05-25): per-connection mutex + onPersist
                    //     wiring so multi-account Codex (rotating refresh tokens) stops
                    //     hitting refresh_token_reused under concurrent load.
                    //   - 0c94c397d (#2743, 2026-05-26): a multi-agent review added a
                    //     `await onCredentialsRefreshed({ testStatus: "expired",
                    //     isActive: false })` here. That BROKE multi-account Codex —
                    //     transient sentinels (refresh_token_reused recoverable via
                    //     rotation map; generic invalid_request blips) were treated as
                    //     terminal, so the proactive path sequentially disabled
                    //     working accounts in the DB before any upstream call confirmed
                    //     the failure. Reverted intentionally.
                    //
                    // Contract for the PROACTIVE refresh path:
                    //   - Classify the sentinel ONLY to avoid spreading it into
                    //     activeCredentials (which would send a non-token upstream).
                    //   - DO NOT persist `{ testStatus: "expired", isActive: false }`
                    //     from here. That decision belongs to the REACTIVE path in
                    //     open-sse/handlers/chatCore.ts:~3912, which runs AFTER the
                    //     upstream confirmed the auth failure. By then the rotation
                    //     map (tokenRefresh.ts:~1541) and the DB-staleness check have
                    //     already had their chance to recover the request.
                    //
                    // If a future review/agent thinks the expired-flip is "missing"
                    // here, STOP — flipping it here re-introduces the multi-account
                    // Codex regression. Discuss with the operator before touching.
                    // ─────────────────────────────────────────────────────────────────────
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUnrecoverableRefreshError"])(refreshed)) {
                        const refreshCode = refreshed.code;
                        log?.warn?.("TOKEN", `${this.provider.toUpperCase()} | proactive refresh returned unrecoverable sentinel (code=${String(refreshCode ?? "unknown")}); keeping stale credentials, deferring to reactive path.`);
                    // Intentionally NOT spreading the sentinel and NOT persisting
                    // expired status. The next upstream call either succeeds (rotation
                    // map / DB-staleness saved us) or fails — chatCore.ts then marks
                    // the account expired with confidence.
                    } else {
                        activeCredentials = {
                            ...credentials,
                            ...refreshed
                        };
                        if (onCredentialsRefreshed) {
                            await onCredentialsRefreshed(refreshed);
                        }
                    }
                }
            } catch (error) {
                // tokenRefresh.ts:1352 documents that onPersist throws are re-thrown so
                // the caller is aware of the persistence failure. Honor that contract:
                // log at error level (not warn), with sanitized message — and let the
                // request continue with stale credentials so the user-visible error
                // surfaces upstream rather than being silently absorbed here.
                log?.error?.("TOKEN", `Credential refresh failed for ${this.provider}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        // Set by the Context Editing 400-fallback below: once an upstream rejects the
        // `context_management` param, suppress its re-injection on every later
        // retry/fallback URL (each iteration rebuilds a fresh `transformedBody`).
        let contextEditingDisabled = false;
        // Tracks which request fields have already been stripped via the generic 400
        // field-downgrade below, so each known field is stripped at most once across
        // all fallback URLs (bounded retry loop).
        const strippedFields = new Set();
        // Set by the thinking_budget 400 clamp-and-retry below: the upstream's
        // advertised max (parsed from the error) is applied to every later
        // retry/fallback URL so they don't re-hit the same 400. The clamp itself
        // fires at most once per URL (guarded inline) so a persistent 400 cannot
        // loop. The learned cap is also recorded process-wide via
        // recordLearnedThinkingCap so future requests skip the 400 entirely.
        let thinkingBudgetClampedMax = null;
        for(let urlIndex = 0; urlIndex < fallbackCount; urlIndex++){
            const requestCredentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$forceResponsesUpstream$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withForcedResponsesUpstream"])(this.provider, body, activeCredentials);
            const url = this.buildUrl(model, stream, urlIndex, requestCredentials);
            const headers = this.buildHeaders(requestCredentials, stream, clientHeaders, model);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyConfiguredUserAgent"])(headers, requestCredentials?.providerSpecificData);
            // Strip OpenAI SDK (X-Stainless-*) metadata + normalize SDK-derived User-Agent
            // on OpenAI-compatible passthrough requests — some upstream gateways 403 on them.
            const strippedStainless = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripStainlessHeadersForOpenAICompat"])(headers, this.provider, url);
            if (strippedStainless.length > 0) {
                log?.debug?.("HEADERS", `Stripped X-Stainless-* from OpenAI-compatible request: ${strippedStainless.join(", ")}`);
            }
            const usesClaudeCodeProtocol = this.usesClaudeCodeProtocol(requestCredentials);
            const fingerprintProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(this.provider) && !usesClaudeCodeProtocol ? "codex" : this.provider;
            const ccRequestDefaults = usesClaudeCodeProtocol ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getClaudeCodeCompatibleRequestDefaults"])(requestCredentials?.providerSpecificData) : {};
            const shouldForwardExtendedContext = extendedContext && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["modelSupportsContext1mBeta"])(model) && !usesClaudeCodeProtocol;
            const shouldForwardCcCompatibleContext1m = usesClaudeCodeProtocol && ccRequestDefaults.context1m === true && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeCodeCompatibleIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["modelHasNativeContext1m"])(model);
            if (shouldForwardExtendedContext || shouldForwardCcCompatibleContext1m) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["appendAnthropicBetaHeader"])(headers, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CONTEXT_1M_BETA_HEADER"]);
            }
            const rawTransformedBody = await this.transformRequest(model, body, stream, requestCredentials);
            let transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$reasoningEffort$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeReasoningEffortForProvider"])(rawTransformedBody, this.provider, model, log);
            if (this.provider === "groq") {
                transformedBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripGroqUnsupportedFields"])(transformedBody);
            }
            // A previous URL in this execute() already hit a thinking_budget 400 and
            // recorded the upstream's max. Pre-clamp this URL's fresh transformedBody
            // so it doesn't re-hit the same 400 (avoids one wasted round-trip per
            // fallback URL). No-op when nothing has been learned this execute().
            if (thinkingBudgetClampedMax !== null) {
                clampNestedThinkingBudget(transformedBody, thinkingBudgetClampedMax);
            }
            try {
                // Timeout only covers response start; stream stalls are handled downstream.
                const fetchStartTimeoutMs = this.getTimeoutMs();
                const fetchWithStartTimeout = async (requestUrl, requestOptions)=>{
                    const timeoutController = fetchStartTimeoutMs > 0 ? new AbortController() : null;
                    let timeoutId = null;
                    if (timeoutController) {
                        timeoutId = setTimeout(()=>{
                            const timeoutError = new Error(`Fetch timeout after ${fetchStartTimeoutMs}ms on ${requestUrl}`);
                            timeoutError.name = "TimeoutError";
                            timeoutController.abort(timeoutError);
                        }, fetchStartTimeoutMs);
                    }
                    const timeoutSignal = timeoutController?.signal ?? null;
                    const combinedSignal = signal && timeoutSignal ? mergeAbortSignals(signal, timeoutSignal) : signal || timeoutSignal;
                    const optionsWithSignal = combinedSignal ? {
                        ...requestOptions,
                        signal: combinedSignal
                    } : requestOptions;
                    try {
                        return await fetch(requestUrl, optionsWithSignal);
                    } finally{
                        if (timeoutId) clearTimeout(timeoutId);
                    }
                };
                const isClaudeCodeClient = clientHeaders?.["x-app"] === "cli" || clientHeaders?.["user-agent"] && clientHeaders["user-agent"].toLowerCase().includes("claude-code") || clientHeaders?.["user-agent"] && clientHeaders["user-agent"].toLowerCase().includes("claude-cli");
                // Anthropic's user:sessions:claude_code OAuth scope expects CLI-shaped
                // traffic. Apply the cloak whenever we have an OAuth token, regardless
                // of upstream client.
                const hasClaudeOAuthToken = typeof activeCredentials?.accessToken === "string" && activeCredentials.accessToken.startsWith("sk-ant-oat") && !activeCredentials?.apiKey;
                if ((this.provider === "claude" && (isClaudeCodeClient || hasClaudeOAuthToken) || usesClaudeCodeProtocol) && typeof transformedBody === "object" && transformedBody !== null) {
                    const tb = transformedBody;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripProxyToolPrefix"])(tb);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["remapToolNamesInRequest"])(tb);
                    // Cloak third-party tool names + sanitize invalid tool schemas so
                    // Anthropic does not refuse native Claude OAuth traffic with a
                    // misleading "out of extra usage" placeholder. See Spec E.
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cloakThirdPartyToolNames"])(tb);
                    if (Array.isArray(tb.tools)) {
                        tb.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeClaudeToolSchemas"])(tb.tools);
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeObfuscation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["obfuscateInBody"])(tb);
                    // NOTE (issue #2260): This is the native `claude` provider OAuth path.
                    // It is intentionally NOT routed through applyCcBridgeTransformPipeline.
                    // The native OAuth path already prepends its own billing line + sentinel
                    // (see lines ~744-773 below, dayStamp-based, cc_entrypoint=cli, cch=00000
                    // placeholder, signed at body level). The CC bridge transforms DSL is
                    // wired into buildAndSignClaudeCodeRequest (claudeCodeCompatible.ts step 5b)
                    // which is the anthropic-compatible-cc-* relay path — a different,
                    // separately classified surface. Do not double-prepend here.
                    // Real CLI never sets cache_control on tools.
                    if (Array.isArray(tb.tools)) {
                        for (const t of tb.tools){
                            delete t.cache_control;
                        }
                        // Also strip OmniRoute provider prefix from versioned built-in tool
                        // model fields (e.g. cc/claude-opus-4-8 → claude-opus-4-8).
                        stripVersionedToolModelPrefix(tb.tools);
                    }
                    // Per-request behavior overrides via custom client headers.
                    //   x-omniroute-effort:   low | medium | high | xhigh | max | off
                    //   x-omniroute-thinking: adaptive | off
                    // A header value applies only when the corresponding body field is
                    // not already set; "off" force-strips the field.
                    const headerEffort = (clientHeaders?.["x-omniroute-effort"] ?? clientHeaders?.["X-OmniRoute-Effort"])?.trim().toLowerCase();
                    const headerThinking = (clientHeaders?.["x-omniroute-thinking"] ?? clientHeaders?.["X-OmniRoute-Thinking"])?.trim().toLowerCase();
                    let appliedEffort = null;
                    let appliedThinking = null;
                    if (headerEffort === "off") {
                        if (tb.output_config && typeof tb.output_config === "object") {
                            delete tb.output_config.effort;
                        }
                        appliedEffort = "off";
                    } else if (headerEffort && [
                        "low",
                        "medium",
                        "high",
                        "xhigh",
                        "max"
                    ].includes(headerEffort)) {
                        const oc = tb.output_config && typeof tb.output_config === "object" ? tb.output_config : {};
                        if (oc.effort === undefined) {
                            oc.effort = headerEffort;
                            tb.output_config = oc;
                            appliedEffort = headerEffort;
                        }
                    }
                    // Anthropic rejects `thinking` (enabled/adaptive) when tool_choice forces a
                    // specific tool ({type:"any"|"tool"}): "Thinking may not be enabled when
                    // tool_choice forces tool use". Treat forced tool_choice as an implicit
                    // `thinking: off` so neither the explicit-adaptive branch nor the default CC
                    // injection below produces the invalid combination (incl. client-sent thinking).
                    const toolChoiceForced = tb.tool_choice === "any" || typeof tb.tool_choice === "object" && tb.tool_choice !== null && (tb.tool_choice.type === "any" || tb.tool_choice.type === "tool");
                    const effThinking = toolChoiceForced ? "off" : headerThinking;
                    if (effThinking === "adaptive") {
                        if (tb.thinking === undefined) {
                            tb.thinking = {
                                type: "adaptive"
                            };
                            appliedThinking = "adaptive";
                        }
                        if (tb.context_management === undefined) {
                            tb.context_management = {
                                edits: [
                                    {
                                        type: "clear_thinking_20251015",
                                        keep: "all"
                                    }
                                ]
                            };
                        }
                    } else if (effThinking === "off") {
                        delete tb.thinking;
                        delete tb.context_management;
                        appliedThinking = "off";
                    } else if (!effThinking && !headerEffort && isClaudeCodeClient) {
                        // Default Claude Code logic when no override headers are present.
                        // Generic OpenAI-compatible clients that route through native Claude OAuth
                        // must opt in with x-omniroute-thinking; force-injecting adaptive thinking
                        // leaks non-standard reasoning replay fields back into those clients.
                        const isHaiku = typeof tb.model === "string" && tb.model.includes("haiku");
                        // #5312 RC-B: honor the operator's proxy-level Thinking-Budget mode.
                        // `auto` means "strip — let the provider decide", so suppress the default
                        // adaptive injection. Passthrough/no-config keeps the native Claude Code
                        // behavior (adaptive) so #4633 does not regress (request-side only).
                        const tbMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getThinkingBudgetConfig"])().mode;
                        if (isHaiku) {
                            // Keep tb.thinking — real Claude Desktop keeps thinking enabled for Haiku
                            // (issue #2454). Only strip output_config (effort) which Haiku rejects;
                            // context_management is re-paired with the preserved thinking below.
                            delete tb.output_config;
                            delete tb.context_management;
                        } else if (tbMode === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ThinkingMode"].AUTO) {
                            delete tb.thinking;
                            delete tb.context_management;
                            delete tb.output_config;
                        } else if (tb.thinking === undefined && tb.output_config === undefined) {
                            tb.thinking = {
                                type: "adaptive"
                            };
                            tb.context_management = {
                                edits: [
                                    {
                                        type: "clear_thinking_20251015",
                                        keep: "all"
                                    }
                                ]
                            };
                            tb.output_config = {
                                effort: "high"
                            };
                        }
                        // #5312: Opus 4.7/4.8 accept only thinking.type="adaptive" ("enabled" → 400).
                        // When an operator budget (custom/adaptive mode) produced an enabled block
                        // upstream, remap it to adaptive + output_config.effort here.
                        const th = tb.thinking;
                        if (th?.type === "enabled" && tbMode !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ThinkingMode"].PASSTHROUGH) {
                            const b = typeof th.budget_tokens === "number" ? th.budget_tokens : 0;
                            tb.thinking = {
                                type: "adaptive"
                            };
                            tb.output_config = {
                                effort: b <= 1024 ? "low" : b <= 10240 ? "medium" : b >= 131072 ? "max" : "high"
                            };
                            tb.context_management = {
                                edits: [
                                    {
                                        type: "clear_thinking_20251015",
                                        keep: "all"
                                    }
                                ]
                            };
                        }
                    }
                    // Real CLI always pairs context_management with thinking. Mirror
                    // that invariant so long sessions don't accumulate thinking blocks
                    // toward the context cap.
                    if (hasActiveClaudeThinking(tb) && !tb.context_management) {
                        tb.context_management = {
                            edits: [
                                {
                                    type: "clear_thinking_20251015",
                                    keep: "all"
                                }
                            ]
                        };
                    }
                    const seed = activeCredentials?.accessToken || activeCredentials?.apiKey || "anon";
                    const psd = activeCredentials?.providerSpecificData;
                    let identitySource = "synthesized";
                    let sessionId;
                    let deviceId;
                    let accountUUID;
                    // For any Claude OAuth request, ignore client-supplied metadata.user_id /
                    // X-Claude-Code-Session-Id and synthesize per-account: the CC device_id from
                    // ~/.claude.json is shared across every account on one machine, which lets
                    // Anthropic correlate accounts behind one OmniRoute.
                    const cloakIdentity = isClaudeCodeClient || hasClaudeOAuthToken;
                    const upstreamUserId = cloakIdentity ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUpstreamMetadataUserId"])(tb);
                    if (upstreamUserId) {
                        sessionId = upstreamUserId.session_id;
                        deviceId = upstreamUserId.device_id;
                        accountUUID = upstreamUserId.account_uuid;
                        identitySource = "upstream-metadata";
                    } else {
                        const headerSid = cloakIdentity ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["passthroughUpstreamSessionId"])(clientHeaders);
                        sessionId = headerSid ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSessionId"])(seed);
                        deviceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveCliUserID"])(psd, seed);
                        accountUUID = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountUUID"])(psd, seed, activeCredentials?.accessToken);
                        identitySource = headerSid ? "upstream-header" : cloakIdentity ? "synthesized-cloaked" : "synthesized";
                    }
                    // system[0] (billing) and system[1] (sentinel) must not carry
                    // cache_control — that belongs on upstream prompt blocks at [2..].
                    const billingLine = `x-anthropic-billing-header: cc_version=${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_BILLING_VERSION"]}; cc_entrypoint=cli; cch=00000;`;
                    const SENTINEL = "You are Claude Code, Anthropic's official CLI for Claude.";
                    const sysBlocks = Array.isArray(tb.system) ? tb.system : typeof tb.system === "string" ? [
                        {
                            type: "text",
                            text: tb.system
                        }
                    ] : [];
                    // Strip any pre-existing billing/sentinel before re-prepending — keeps
                    // retries idempotent and avoids stacking that breaks prompt-cache prefix
                    // matching (see issue #1712).
                    for(let i = sysBlocks.length - 1; i >= 0; i--){
                        const t = sysBlocks[i]?.text;
                        if (typeof t === "string" && t.startsWith("x-anthropic-billing-header:")) {
                            sysBlocks.splice(i, 1);
                        }
                    }
                    for(let i = sysBlocks.length - 1; i >= 0; i--){
                        const t = sysBlocks[i]?.text;
                        if (typeof t === "string" && t.startsWith(SENTINEL)) {
                            sysBlocks.splice(i, 1);
                        }
                    }
                    sysBlocks.unshift({
                        type: "text",
                        text: billingLine
                    }, {
                        type: "text",
                        text: SENTINEL
                    });
                    tb.system = sysBlocks;
                    // Run the configurable system-transforms pipeline for the native
                    // `claude` provider (issue #2260 / comment 4459544580). The default
                    // claude pipeline runs cosmetic ops only (Open WebUI paragraph
                    // anchors, identity-prefix paragraph drop, ZWJ obfuscation of
                    // sensitive words). It deliberately does NOT include
                    // `inject_billing_header` — billing + sentinel are already
                    // prepended above. Users can extend the pipeline via Settings UI.
                    {
                        const transformResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applySystemTransformPipeline"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$systemTransforms$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDER_CLAUDE"], tb);
                        if (transformResult.appliedOpKinds.length > 0) {
                            console.log(`[SystemTransforms] claude-native: ${transformResult.appliedOpKinds.join(", ")}`);
                        }
                    }
                    if (!tb.metadata || typeof tb.metadata !== "object") tb.metadata = {};
                    tb.metadata.user_id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildUserIdJson"])({
                        deviceId,
                        accountUUID,
                        sessionId
                    });
                    // Headers. Accept stays application/json even on streams (Stainless
                    // convention; SSE decoding is gated on body.stream). anthropic-beta
                    // is selected per request shape; the full set on a quota probe is
                    // itself a fingerprint.
                    // Respect the client's negotiated anthropic-beta (real Claude Code) instead
                    // of force-injecting thinking/effort betas it never requested (#3415).
                    const clientAnthropicBeta = clientHeaders?.["anthropic-beta"] ?? clientHeaders?.["Anthropic-Beta"] ?? null;
                    const ccHeaders = {
                        Accept: "application/json",
                        "anthropic-version": "2023-06-01",
                        // #3974: merge the client's allowlisted betas (e.g. tool-search-tool)
                        // on top of the shape-derived set so deferred-tool requests are not
                        // rejected; selectBetaFlags still gates thinking/effort per #3415.
                        "anthropic-beta": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeClientAnthropicBeta"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectBetaFlags"])(tb, null, clientAnthropicBeta), clientAnthropicBeta),
                        "anthropic-dangerous-direct-browser-access": "true",
                        "x-app": "cli",
                        "User-Agent": `claude-cli/${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_VERSION"]} (external, cli)`,
                        "X-Stainless-Package-Version": __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CODE_STAINLESS_VERSION"],
                        "X-Stainless-Timeout": "600",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        connection: "keep-alive",
                        "x-client-request-id": (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                        "X-Claude-Code-Session-Id": sessionId
                    };
                    // Drop case variants of the same header name before merging — undici
                    // would otherwise concatenate them (issue #1454).
                    const ccKeysLower = new Set(Object.keys(ccHeaders).map((k)=>k.toLowerCase()));
                    for (const key of Object.keys(headers)){
                        if (ccKeysLower.has(key.toLowerCase())) delete headers[key];
                    }
                    Object.assign(headers, ccHeaders);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["usesCcWireImage"])(this.provider) && usesClaudeCodeProtocol) {
                        delete headers["Authorization"];
                        headers["x-api-key"] = activeCredentials?.apiKey || activeCredentials?.accessToken || "";
                    }
                    delete headers["X-Stainless-Helper-Method"];
                    // OS/arch follow the host running the signed binary. Runtime version
                    // is pinned to the captured CLI wire image, not OmniRoute's Node.
                    headers["X-Stainless-Arch"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stainlessArch"])();
                    headers["X-Stainless-Lang"] = "js";
                    headers["X-Stainless-OS"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$claudeIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stainlessOS"])();
                    headers["X-Stainless-Runtime"] = "node";
                    headers["X-Stainless-Runtime-Version"] = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$anthropicHeaders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CLAUDE_CLI_STAINLESS_RUNTIME_VERSION"];
                    headers["X-Stainless-Retry-Count"] = "0";
                    delete headers["X-Stainless-Os"];
                    const overrideTag = appliedEffort || appliedThinking ? ` overrides=effort:${appliedEffort ?? "-"},thinking:${appliedThinking ?? "-"}` : "";
                    log?.debug?.("CLAUDE", `identity=${identitySource} sid=${sessionId.slice(0, 8)} dev=${deviceId.slice(0, 8)} acct=${accountUUID.slice(0, 8)}${overrideTag}`);
                }
                // CLI fingerprint ordering — always-on for native Claude OAuth, opt-in
                // for other providers. Header + body field order is itself a fingerprint.
                let finalHeaders = headers;
                // Strip internal sentinel fields set by remapToolNamesInRequest before
                // serializing — Anthropic rejects unknown top-level fields (issue #2260).
                delete transformedBody["_claudeCodeRequiresLowercaseToolNames"];
                // Guard against orphan tool_use / tool_result pairs. Clients can ship
                // truncated histories mid-tool-call which Anthropic rejects with
                // `messages.N: tool_use ids were found without tool_result blocks
                // immediately after: toolu_...`. fixToolPairs strips orphans, then
                // stripTrailingAssistantOrphanToolUse catches the case where the
                // request body itself ends on an unmatched assistant(tool_use) —
                // invalid for an upstream-send turn since the body must end on a
                // user message. Both are idempotent on clean histories.
                {
                    const tb = transformedBody;
                    if (Array.isArray(tb?.messages)) {
                        const fixed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])(tb.messages);
                        // fixToolAdjacency enforces Claude's strict adjacency rule
                        // (tool_result must be in immediately next message).
                        // Only apply for Claude/Claude-compatible — OpenAI allows results
                        // spread across multiple subsequent messages.
                        const isClaude = this.provider === "claude" || usesClaudeCodeProtocol;
                        // For Claude, fixToolAdjacency may strip tool_use blocks whose
                        // tool_result isn't in the next message; re-run fixToolPairs to
                        // drop any tool_result orphaned by that strip (discussion #2410).
                        const adjacent = isClaude ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolAdjacency"])(fixed)) : fixed;
                        const stripped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingAssistantOrphanToolUse"])(adjacent);
                        // Some providers (e.g. Mistral) require the last message to be user
                        // or tool and reject trailing assistant text messages with 400 (#3396).
                        tb.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripTrailingAssistantForProvider"])(stripped, this.provider);
                    }
                }
                // Anthropic's extended-thinking contract forbids non-default sampling
                // params: temperature must be 1 and top_p >= 0.95 (or unset) whenever
                // thinking is enabled/adaptive. Thinking can be injected by per-model
                // requestDefaults *after* the translator/constraint passes, so normalize
                // at this final dispatch point — the single chokepoint every Claude
                // routing mode (grouped/raw/combo) and the native passthrough share,
                // before fingerprinting and CCH signing serialize the body.
                if (this.provider === "claude" || usesClaudeCodeProtocol) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeConstraints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceThinkingTemperature"])(transformedBody);
                }
                // Delegated Context Editing (opt-in): attach the clear_tool_uses strategy so
                // the provider clears stale tool-use blocks server-side. Runs at this same
                // chokepoint, composing with the clear_thinking edit the fingerprint path may
                // have already set. Scoped to genuine `claude` (real Anthropic key/OAuth) and
                // `anthropic-compatible-cc-*` relays — the latter advertise Claude Code
                // compatibility, so they are the relays most likely to accept the beta. A
                // rejecting upstream is caught by the 400-fallback below. Deliberately
                // EXCLUDED: `claude-web` (a browser relay with a `create_conversation_params`
                // request shape that never sees `context_management`) and generic
                // `anthropic-compatible-*` (third-party endpoints with uncertain beta support).
                // `contextEditingDisabled` (set by the 400-fallback) suppresses re-injection
                // when a fresh `transformedBody` is built for a retry/fallback URL.
                if ((this.provider === "claude" || usesClaudeCodeProtocol) && contextEditing?.enabled && !contextEditingDisabled) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$contextEditing$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyContextEditingToBody"])(transformedBody, {
                        enabled: true
                    });
                    log?.debug?.("CONTEXT_EDITING", "Delegated context editing on — attached clear_tool_uses to the Claude request");
                }
                let bodyString = JSON.stringify(transformedBody);
                const shouldFingerprint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isCliCompatEnabled"])(fingerprintProvider) || this.provider === "claude" && (isClaudeCodeClient || hasClaudeOAuthToken);
                if (shouldFingerprint) {
                    const fingerprinted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$cliFingerprints$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyFingerprint"])(fingerprintProvider, headers, transformedBody);
                    finalHeaders = fingerprinted.headers;
                    bodyString = fingerprinted.bodyString;
                }
                // CCH signing — replaces the cch=00000 placeholder in the billing
                // header with an xxHash64 integrity token over the serialized body.
                if (usesClaudeCodeProtocol || this.provider === "claude") {
                    bodyString = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(bodyString);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeUpstreamExtraHeaders"])(finalHeaders, upstreamExtraHeaders);
                if (this.provider === "cline" || this.provider === "clinepass") {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$clineAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyClineProtocolHeaders"])(finalHeaders, {
                        taskId: headers["X-Task-ID"]
                    });
                }
                // Enforce peer tracing after all configurable headers have been merged so
                // operator/provider metadata cannot accidentally erase the loop guard.
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$resilience$2f$peerRouting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyPeerTraceHeader"])(finalHeaders, clientHeaders, url);
                const serializedBody = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseBody"](bodyString);
                // #4307 — Preserve the non-enumerable tool-name cloak/remap reverse map
                // (`_toolNameMap`, set on the live `transformedBody` by
                // remapToolNamesInRequest / cloakThirdPartyToolNames) that the JSON
                // round-trip above drops. chatCore's response-side un-cloak reads it off
                // `result.transformedBody` to restore the client's original tool-name
                // casing (e.g. `read`, not the cloaked `Read`). Without this re-attach the
                // map is lost and the client receives the cloaked casing — a regression
                // from #3941's serialized-body capture. Mirrors antigravity.ts's
                // `attachToolNameMap`; non-enumerable so it never re-serializes upstream.
                if (transformedBody && typeof transformedBody === "object" && serializedBody && typeof serializedBody === "object") {
                    const liveToolNameMap = transformedBody._toolNameMap;
                    if (liveToolNameMap instanceof Map && liveToolNameMap.size > 0 && !(serializedBody._toolNameMap instanceof Map)) {
                        Object.defineProperty(serializedBody, "_toolNameMap", {
                            value: liveToolNameMap,
                            enumerable: false,
                            configurable: true,
                            writable: true
                        });
                    }
                }
                const fetchOptions = {
                    method: "POST",
                    headers: finalHeaders,
                    body: bodyString
                };
                // OpenRouter `:free`-variant local window (#6842): record every real
                // dispatch attempt (failed attempts still consume a request slot per
                // OpenRouter's own accounting) and self-correct the local counters
                // from the upstream `X-RateLimit-*` headers on the response. Scoped
                // to `:free` models only — no-op (and no extra work) for every other
                // OpenRouter request or provider.
                const openrouterFreeWindowAccountKey = this.provider === "openrouter" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFreeVariantModel"])(model) && activeCredentials.connectionId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAccountKey"])(activeCredentials.connectionId, activeCredentials) : null;
                if (openrouterFreeWindowAccountKey) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordFreeWindowAttempt"])(openrouterFreeWindowAccountKey);
                }
                // WAF burst guard: agentrouter.org's content filter becomes more
                // aggressive after rapid requests. Enforce a small inter-request gap
                // to avoid tripping it. See open-sse/services/wafRateLimit.ts.
                if (this.provider === "agentrouter") {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wafRateLimit$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["gateOutboundRequest"])(`agentrouter:${url}`);
                }
                let response = await fetchWithStartTimeout(url, fetchOptions);
                if (openrouterFreeWindowAccountKey) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$openrouterFreeWindow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["correctFromRateLimitHeaders"])(openrouterFreeWindowAccountKey, response.headers);
                }
                // Context Editing 400-fallback for Claude-compatible relays.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && contextEditing?.enabled && !contextEditingDisabled && transformedBody && typeof transformedBody === "object" && transformedBody.context_management !== undefined) {
                    const errText = await response.clone().text().catch(()=>"");
                    if (/context[_-]management|context editing/i.test(errText)) {
                        contextEditingDisabled = true;
                        delete transformedBody.context_management;
                        let retryBody = JSON.stringify(transformedBody);
                        if (usesClaudeCodeProtocol || this.provider === "claude") {
                            retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                        }
                        log?.debug?.("CONTEXT_EDITING", `Upstream 400 rejected context_management on ${url} — retrying without it`);
                        response = await fetchWithStartTimeout(url, {
                            ...fetchOptions,
                            body: retryBody
                        });
                    }
                }
                // Thinking-budget 400 clamp-and-retry (Gemini-family, any provider).
                // The proactive capThinkingBudget clamp misses models outside MODEL_SPECS,
                // so an xhigh budget (131072) can reach the upstream and bounce with
                // "thinking_budget must be in the range [-1, N]". When that happens: parse
                // the advertised max, record it process-wide (so FUTURE requests clamp
                // proactively via capThinkingBudget → getLearnedThinkingCap), clamp the
                // nested budget in the live transformedBody, and retry the same URL once.
                // Subsequent requests never pay this 400→retry round-trip.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && thinkingBudgetClampedMax === null && transformedBody && typeof transformedBody === "object") {
                    const errText = await response.clone().text().catch(()=>"");
                    const upstreamMax = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseThinkingBudgetMax"])(errText);
                    if (upstreamMax !== null) {
                        const currentBudget = readNestedThinkingBudget(transformedBody);
                        // Record under the budget that actually failed so the learned step
                        // ladder advances correctly; fall back to upstreamMax when the body
                        // carries no readable budget (still record so we stop re-hitting).
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$learnedThinkingCaps$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordLearnedThinkingCap"])(this.provider, model, currentBudget ?? upstreamMax + 1);
                        thinkingBudgetClampedMax = upstreamMax;
                        if (clampNestedThinkingBudget(transformedBody, upstreamMax)) {
                            let retryBody = JSON.stringify(transformedBody);
                            if (usesClaudeCodeProtocol || this.provider === "claude") {
                                retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                            }
                            log?.info?.("THINKING_BUDGET", `Upstream 400 rejected thinking_budget on ${url} — clamped to ${upstreamMax} and retrying (learned for ${this.provider}/${model})`);
                            response = await fetchWithStartTimeout(url, {
                                ...fetchOptions,
                                body: retryBody
                            });
                        }
                    }
                }
                // Generic reactive 400 field-downgrade; each field is stripped at most once.
                if (response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && transformedBody && typeof transformedBody === "object") {
                    const errText = await response.clone().text().catch(()=>"");
                    const offending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findOffendingField"])(errText);
                    if (offending && !strippedFields.has(offending) && transformedBody[offending] !== undefined) {
                        strippedFields.add(offending);
                        delete transformedBody[offending];
                        let retryBody = JSON.stringify(transformedBody);
                        if (usesClaudeCodeProtocol || this.provider === "claude") {
                            retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                        }
                        log?.debug?.("FIELD_400", `Upstream 400 rejected ${offending} on ${url} — retrying without it`);
                        response = await fetchWithStartTimeout(url, {
                            ...fetchOptions,
                            body: retryBody
                        });
                    } else {
                        // Auto-learn: detect "Unsupported parameter" errors and persist to DB
                        // when the provider config has autoLearn enabled (#6625).
                        const autoLearned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerFieldStrips$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["detectUnsupportedParam"])(errText);
                        if (autoLearned && !strippedFields.has(autoLearned) && transformedBody[autoLearned] !== undefined) {
                            try {
                                const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getParamFilterConfig"])(this.provider);
                                const shouldAutoLearn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAutoLearnGloballyEnabled"])() || config?.autoLearn === true;
                                if (shouldAutoLearn) {
                                    strippedFields.add(autoLearned);
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["addParamToBlocklist"])(this.provider, autoLearned, model);
                                    delete transformedBody[autoLearned];
                                    let retryBody = JSON.stringify(transformedBody);
                                    if (usesClaudeCodeProtocol || this.provider === "claude") {
                                        retryBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCCH$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["signRequestBody"])(retryBody);
                                    }
                                    log?.info?.("AUTO_LEARN", `Auto-learned "${autoLearned}" for provider ${this.provider} (model: ${model}) from 400 on ${url} — retrying`);
                                    response = await fetchWithStartTimeout(url, {
                                        ...fetchOptions,
                                        body: retryBody
                                    });
                                }
                            } catch (learnError) {
                                log?.warn?.("AUTO_LEARN", `Failed to persist auto-learned param "${autoLearned}" for ${this.provider}: ${String(learnError)}`);
                            }
                        }
                    }
                }
                // Intra-URL retry: agentrouter.org WAF returns 400 content-blocked
                // intermittently (burst-sensitive, recovers after cooldown). Retry the
                // same URL with exponential backoff before falling through to the
                // 429/401/fallback chain. See docs/security/AGENTROUTER_WAF.md.
                if (!skipUpstreamRetry && response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].BAD_REQUEST && (retryAttemptsByUrl[urlIndex] ?? 0) < BaseExecutor.WAF_RETRY_CONFIG.maxAttempts) {
                    const wafErrText = await response.clone().text().catch(()=>"");
                    if (/content[_-]blocked/i.test(wafErrText)) {
                        retryAttemptsByUrl[urlIndex] = (retryAttemptsByUrl[urlIndex] ?? 0) + 1;
                        const wafAttempt = retryAttemptsByUrl[urlIndex];
                        const wafBackoff = BaseExecutor.WAF_RETRY_CONFIG.delayMs * Math.pow(BaseExecutor.WAF_RETRY_CONFIG.backoffMultiplier, wafAttempt - 1);
                        log?.debug?.("WAF_RETRY", `400 content-blocked intra-retry ${wafAttempt}/${BaseExecutor.WAF_RETRY_CONFIG.maxAttempts} on ${url} — waiting ${wafBackoff}ms`);
                        await new Promise((resolve)=>setTimeout(resolve, wafBackoff));
                        urlIndex--; // re-run this urlIndex on the next loop iteration
                        continue;
                    }
                }
                // Intra-URL retry: if 429 and we haven't exhausted per-URL retries, wait and retry the same URL
                if (!skipUpstreamRetry && response.status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].RATE_LIMITED && (retryAttemptsByUrl[urlIndex] ?? 0) < BaseExecutor.RETRY_CONFIG.maxAttempts) {
                    retryAttemptsByUrl[urlIndex] = (retryAttemptsByUrl[urlIndex] ?? 0) + 1;
                    const attempt = retryAttemptsByUrl[urlIndex];
                    log?.debug?.("RETRY", `429 intra-retry ${attempt}/${BaseExecutor.RETRY_CONFIG.maxAttempts} on ${url} — waiting ${BaseExecutor.RETRY_CONFIG.delayMs}ms`);
                    await new Promise((resolve)=>setTimeout(resolve, BaseExecutor.RETRY_CONFIG.delayMs));
                    urlIndex--; // re-run this urlIndex on the next loop iteration
                    continue;
                }
                // T07: Handle 401 authentication errors — log and continue to fallback
                if (response.status === 401 && credentials.connectionId && credentials.apiKey) {
                    log?.warn?.("AUTH", `401 on ${url} - API key may be invalid`);
                }
                if (!skipUpstreamRetry && this.shouldRetry(response.status, urlIndex)) {
                    log?.debug?.("RETRY", `${response.status} on ${url}, trying fallback ${urlIndex + 1}`);
                    lastStatus = response.status;
                    continue;
                }
                return {
                    response,
                    url,
                    headers: finalHeaders,
                    transformedBody: serializedBody
                };
            } catch (error) {
                // Distinguish timeout errors from other abort errors
                const err = error instanceof Error ? error : new Error(String(error));
                if (err.name === "TimeoutError") {
                    log?.warn?.("TIMEOUT", `Fetch timeout after ${this.getTimeoutMs()}ms on ${url}`);
                }
                lastError = err;
                if (!skipUpstreamRetry && urlIndex + 1 < fallbackCount) {
                    log?.debug?.("RETRY", `Error on ${url}, trying fallback ${urlIndex + 1}`);
                    continue;
                }
                throw err;
            }
        }
        throw lastError || new Error(`All ${fallbackCount} URLs failed with status ${lastStatus}`);
    }
}
const __TURBOPACK__default__export__ = BaseExecutor;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/executors/vertex.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "VERTEX_OAUTH_SCOPES",
    ()=>VERTEX_OAUTH_SCOPES,
    "VertexExecutor",
    ()=>VertexExecutor,
    "getAccessToken",
    ()=>getAccessToken,
    "isExpressApiKey",
    ()=>isExpressApiKey,
    "looksLikeServiceAccountJson",
    ()=>looksLikeServiceAccountJson,
    "parseSAFromApiKey",
    ()=>parseSAFromApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$key$2f$import$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/key/import.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const TOKEN_CACHE = new Map();
const VERTEX_OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/generative-language.retriever"
];
function parseSAFromApiKey(apiKey) {
    try {
        return JSON.parse(apiKey);
    } catch  {
        throw new Error("Vertex AI requires a valid Service Account JSON as the API key");
    }
}
function looksLikeServiceAccountJson(apiKey) {
    if (!apiKey || typeof apiKey !== "string") return false;
    try {
        const parsed = JSON.parse(apiKey);
        return !!parsed && typeof parsed === "object" && !Array.isArray(parsed);
    } catch  {
        return false;
    }
}
function isExpressApiKey(apiKey) {
    return typeof apiKey === "string" && apiKey.trim().length > 0 && !looksLikeServiceAccountJson(apiKey);
}
async function getAccessToken(sa) {
    if (!sa.client_email || !sa.private_key) {
        throw new Error("Service Account JSON is missing required fields (client_email or private_key)");
    }
    const cacheKey = sa.client_email;
    const cached = TOKEN_CACHE.get(cacheKey);
    // Buffer of 60 seconds
    if (cached && Date.now() < cached.expiresAt - 60_000) {
        return cached.token;
    }
    const privateKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$key$2f$import$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["importPKCS8"])(sa.private_key, "RS256");
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["SignJWT"]({
        iss: sa.client_email,
        sub: sa.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
        scope: VERTEX_OAUTH_SCOPES.join(" ")
    }).setProtectedHeader({
        alg: "RS256",
        kid: sa.private_key_id
    }).sign(privateKey);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt
        })
    });
    if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`Failed to exchange JWT for Vertex access token: ${tokenRes.status} ${errorText}`);
    }
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
        throw new Error("Vertex AI token exchange succeeded but no access_token found");
    }
    TOKEN_CACHE.set(cacheKey, {
        token: accessToken,
        expiresAt: (now + 3600) * 1000
    });
    return accessToken;
}
const PARTNER_MODELS = new Set([
    // Generic prefix, not pinned to a version: every Claude model on Vertex is an Anthropic
    // partner model, never a Google-publisher one. Pinned prefixes (e.g. "claude-3-5-sonnet")
    // silently break every time Anthropic ships a new generation — see issue #1985.
    "claude-",
    "deepseek-v3",
    "deepseek-v3.2",
    "deepseek-v4",
    "deepseek-deepseek-r1",
    "qwen3-next-80b",
    "qwen3.6-",
    "llama-3.1",
    "mistral-",
    "glm-5",
    "glm-5.1",
    "meta/llama"
]);
function isPartnerModel(model) {
    const normalizedModel = model.toLowerCase();
    return [
        ...PARTNER_MODELS
    ].some((prefix)=>normalizedModel.startsWith(prefix));
}
class VertexExecutor extends __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseExecutor"] {
    constructor(){
        super("vertex", __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].vertex);
    }
    async execute(input) {
        const { credentials, log } = input;
        // Defensive: trim stray surrounding whitespace from a pasted credential.
        if (typeof credentials.apiKey === "string") {
            credentials.apiKey = credentials.apiKey.trim();
        }
        // Service Account JSON → mint a short-lived OAuth token (Bearer). An Express-mode API key is
        // sent as-is via x-goog-api-key (see buildHeaders), so no token exchange is needed for it.
        if (credentials.apiKey && !credentials.accessToken && looksLikeServiceAccountJson(credentials.apiKey)) {
            try {
                const sa = parseSAFromApiKey(credentials.apiKey);
                credentials.accessToken = await getAccessToken(sa);
            } catch (err) {
                log?.error?.("VERTEX", `Failed to generate JWT token: ${err.message}`);
                throw err;
            }
        }
        return super.execute(input);
    }
    buildUrl(model, stream, urlIndex = 0, credentials = null) {
        // Vertex AI Express mode: project-less v1 publisher endpoint with the API key passed as a
        // ?key= query parameter (verified working contract — same as the CaptionAI GeminiClient). The
        // Express key is NOT accepted as a Bearer/OAuth credential or via x-goog-api-key on this API.
        if (isExpressApiKey(credentials?.apiKey) && !credentials?.accessToken) {
            const expressKey = encodeURIComponent(String(credentials.apiKey).trim());
            if (isPartnerModel(model)) {
                // Partner (Anthropic/etc.) models are not available via Express keys; best-effort.
                return `https://aiplatform.googleapis.com/v1/publishers/openapi/chat/completions?key=${expressKey}`;
            }
            const op = stream ? "streamGenerateContent?alt=sse&" : "generateContent?";
            return `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:${op}key=${expressKey}`;
        }
        const region = credentials?.providerSpecificData?.region || "us-central1";
        let project = "unknown-project";
        if (credentials?.apiKey) {
            try {
                const sa = parseSAFromApiKey(credentials.apiKey);
                if (sa.project_id) project = sa.project_id;
            } catch  {
            // Ignored, handled in execute
            }
        }
        if (isPartnerModel(model)) {
            return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/endpoints/openapi/chat/completions`;
        }
        return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${region}/publishers/google/models/${model}:${stream ? "streamGenerateContent?alt=sse" : "generateContent"}`;
    }
    buildHeaders(credentials, stream = true) {
        const headers = {
            "Content-Type": "application/json"
        };
        if (credentials.accessToken) {
            headers["Authorization"] = `Bearer ${credentials.accessToken}`;
        }
        // Express-mode keys are carried in the ?key= query parameter (see buildUrl), not a header.
        if (stream) {
            headers["Accept"] = "text/event-stream";
        }
        return headers;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_1m9-f79._.js.map