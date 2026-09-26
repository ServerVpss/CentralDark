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
"[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Format identifiers
__turbopack_context__.s([
    "FORMATS",
    ()=>FORMATS
]);
const FORMATS = {
    OPENAI: "openai",
    OPENAI_RESPONSES: "openai-responses",
    OPENAI_RESPONSE: "openai-response",
    CLAUDE: "claude",
    GEMINI: "gemini",
    CODEX: "codex",
    ANTIGRAVITY: "antigravity",
    KIRO: "kiro",
    CURSOR: "cursor"
};
}),
"[project]/open-sse/translator/helpers/jsonUtil.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Safe JSON.parse helper shared by the translator layer.
//
// Behavior contract (must be preserved by all callers):
//   - non-string input is returned unchanged (passthrough)
//   - a valid JSON string is parsed and returned
//   - on parse error the caller-chosen `fallback` is returned
//
// The `fallback` is explicit so the two historical `tryParseJSON` variants
// can keep their distinct semantics: geminiHelper returns `null` on error,
// while openai-to-claude returns the raw input string (passthrough).
__turbopack_context__.s([
    "safeParseJSON",
    ()=>safeParseJSON
]);
function safeParseJSON(str, fallback) {
    if (typeof str !== "string") return str;
    try {
        return JSON.parse(str);
    } catch  {
        return fallback;
    }
}
}),
"[project]/open-sse/translator/helpers/geminiHelper.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_SAFETY_SETTINGS",
    ()=>DEFAULT_SAFETY_SETTINGS,
    "GEMINI_UNSUPPORTED_SCHEMA_KEYS",
    ()=>GEMINI_UNSUPPORTED_SCHEMA_KEYS,
    "UNSUPPORTED_SCHEMA_CONSTRAINTS",
    ()=>UNSUPPORTED_SCHEMA_CONSTRAINTS,
    "cleanJSONSchemaForAntigravity",
    ()=>cleanJSONSchemaForAntigravity,
    "convertOpenAIContentToParts",
    ()=>convertOpenAIContentToParts,
    "extractTextContent",
    ()=>extractTextContent,
    "generateRequestId",
    ()=>generateRequestId,
    "generateSessionId",
    ()=>generateSessionId,
    "tryParseJSON",
    ()=>tryParseJSON
]);
// Gemini helper functions for translator
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$jsonUtil$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/jsonUtil.ts [instrumentation] (ecmascript)");
;
const GEMINI_UNSUPPORTED_SCHEMA_KEYS = new Set([
    // Basic constraints (not supported by Gemini API)
    "minLength",
    "maxLength",
    "exclusiveMinimum",
    "exclusiveMaximum",
    // `multipleOf` is not part of the Gemini/antigravity OpenAPI 3.0 schema subset;
    // leaving it in function_declarations triggers a hard upstream 400
    // ("Unknown name \"multipleOf\""). `minimum`/`maximum` ARE accepted and kept.
    "multipleOf",
    // OpenAI "strict" tool-calling mode embeds `strict: true/false` directly inside
    // a function's `parameters` schema (RubyLLM and other OpenAI-convention clients
    // do this by default). Gemini's function_declarations schema doesn't recognize
    // it and 400s the same way ("Unknown name \"strict\" ... Cannot find field").
    "strict",
    // NOTE: `pattern` is intentionally NOT in this set. Antigravity (Gemini-derived
    // surface) accepts `pattern` on string constraints, and glob/grep/file-search
    // tools depend on it to express their argument regex. Removing it produced
    // upstream 400s and wrong-tool semantics (decolua/9router#1368).
    "minItems",
    "maxItems",
    "format",
    // Claude rejects these in VALIDATED mode
    "default",
    "examples",
    // JSON Schema meta keywords
    "$schema",
    "$id",
    "$anchor",
    "$dynamicRef",
    "$dynamicAnchor",
    "$vocabulary",
    "$comment",
    "$defs",
    "definitions",
    "const",
    "$ref",
    "ref",
    // Object validation keywords (not supported)
    "propertyNames",
    "patternProperties",
    "unevaluatedProperties",
    "unevaluatedItems",
    "contains",
    "minContains",
    "maxContains",
    // Complex schema keywords (handled by flattenAnyOfOneOf/mergeAllOf)
    "anyOf",
    "oneOf",
    "allOf",
    "not",
    // Dependency keywords (not supported)
    "dependencies",
    "dependentSchemas",
    "dependentRequired",
    // Other unsupported keywords
    "title",
    "if",
    "then",
    "else",
    "contentMediaType",
    "contentEncoding",
    "contentSchema",
    "readOnly",
    "writeOnly",
    // Non-standard schema fields (not recognized by Gemini API)
    "deprecated",
    "optional",
    // VS Code / JSON Language Service extensions injected by GitHub Copilot tools (#1175)
    "enumDescriptions",
    "markdownDescription",
    "markdownEnumDescriptions",
    "enumItemLabels",
    "tags",
    // UI/Styling properties (from Cursor tools - NOT JSON Schema standard)
    "cornerRadius",
    "fillColor",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "gap",
    "padding",
    "strokeColor",
    "strokeThickness",
    "textColor"
]);
const UNSUPPORTED_SCHEMA_CONSTRAINTS = [
    ...GEMINI_UNSUPPORTED_SCHEMA_KEYS
];
const DEFAULT_SAFETY_SETTINGS = [
    {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "OFF"
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "OFF"
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "OFF"
    },
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "OFF"
    }
];
function normalizeAudioMimeType(format) {
    const normalized = typeof format === "string" && format.trim() ? format.trim().toLowerCase() : "wav";
    if (normalized === "mp3") {
        return "audio/mpeg";
    }
    return `audio/${normalized}`;
}
function convertOpenAIContentToParts(content) {
    const parts = [];
    if (typeof content === "string") {
        parts.push({
            text: content
        });
    } else if (Array.isArray(content)) {
        for (const item of content){
            const rec = toRecord(item);
            if (rec.type === "text") {
                parts.push({
                    text: rec.text
                });
            } else if (rec.type === "input_audio" || rec.type === "audio") {
                const audio = toRecord(rec.input_audio || rec.audio);
                if (typeof audio.data === "string" && audio.data) {
                    parts.push({
                        inlineData: {
                            mimeType: normalizeAudioMimeType(audio.format),
                            data: audio.data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "")
                        }
                    });
                }
            } else if (rec.type === "audio_url") {
                // OpenAI-style audio_url (data: URI). Mirrors the image_url data-URL
                // parser below but produces an audio inlineData part (#913).
                const audioUrl = toRecord(rec.audio_url);
                const url = typeof audioUrl.url === "string" ? audioUrl.url : "";
                if (url.startsWith("data:")) {
                    const commaIndex = url.indexOf(",");
                    if (commaIndex !== -1) {
                        const mimePart = url.substring(5, commaIndex); // skip "data:"
                        const data = url.substring(commaIndex + 1);
                        const mimeType = mimePart.split(";")[0] || "audio/wav";
                        parts.push({
                            inlineData: {
                                mimeType,
                                data
                            }
                        });
                    }
                }
            } else {
                // 1. Handle Gemini native inline_data injected into OpenAI arrays (e.g. Cherry Studio)
                const geminiInline = toRecord(rec.inline_data || rec.inlineData);
                if (geminiInline?.data) {
                    parts.push({
                        inlineData: {
                            mimeType: String(geminiInline.mime_type || geminiInline.mimeType || "application/pdf"),
                            data: String(geminiInline.data).replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "")
                        }
                    });
                    continue;
                }
                // 2. Handle Claude-style source blocks commonly used by AI clients
                const source = toRecord(rec.source);
                if (source?.type === "base64" && source?.data) {
                    parts.push({
                        inlineData: {
                            mimeType: String(source.media_type || "application/pdf"),
                            data: String(source.data).replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "")
                        }
                    });
                    continue;
                }
                // 3. Handle raw data strings (e.g. {"type": "file", "data": "JVBER...", "mime_type": "..."}).
                //    Also accept the Responses-API shape {"type":"input_file","file_data":"JVBER...","filename":...}
                //    AND the OpenAI Chat Completions shape
                //    {"type":"file","file":{"filename":...,"file_data":"data:<mime>;base64,..."}} so PDFs and
                //    videos reach Gemini instead of being silently dropped (#2515). Gemini reads
                //    application/pdf and video/* natively via inlineData, exactly like images.
                const file = toRecord(rec.file);
                const doc = toRecord(rec.document);
                const rawDataStr = rec.data || rec.file_data || file?.data || file?.file_data || doc?.data || doc?.file_data;
                if (typeof rawDataStr === "string" && !rawDataStr.startsWith("http")) {
                    // Prefer the mime embedded in the data: URI (e.g. application/pdf, video/mp4) so
                    // documents and videos are not mislabeled as the fallback; the fallback applies
                    // only to bare base64 that carries no data: prefix.
                    let mimeType = rec.mime_type || rec.media_type || file?.mime_type || doc?.mime_type || "application/pdf";
                    if (rawDataStr.startsWith("data:")) {
                        const commaIndex = rawDataStr.indexOf(",");
                        if (commaIndex !== -1) {
                            const parsedMime = rawDataStr.substring(5, commaIndex).split(";")[0];
                            if (parsedMime) mimeType = parsedMime;
                        }
                    }
                    const rawData = rawDataStr.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
                    parts.push({
                        inlineData: {
                            mimeType: String(mimeType),
                            data: rawData
                        }
                    });
                    continue;
                }
                // 4. Standard OpenAI Data URIs
                const imageUrl = toRecord(rec.image_url);
                const imageObj = toRecord(rec.image);
                const fileUrl = toRecord(rec.file_url);
                const fileObj = toRecord(rec.file);
                const docObj = toRecord(rec.document);
                // `file_url` is a top-level string on the Responses-API input_file shape (#2515).
                // `rec.image` (with nested {url}) is emitted by some MCP tool wrappers and
                // translation layers as an alternative to `rec.image_url` (#2807).
                const fileData = (typeof rec.file_url === "string" ? rec.file_url : undefined) || // AI SDK-style image part: { type: "image", image: "data:...;base64,..." } (#1330)
                (typeof rec.image === "string" ? rec.image : undefined) || imageUrl?.url || imageObj?.url || fileUrl?.url || fileObj?.url || docObj?.url;
                if (typeof fileData === "string" && fileData.startsWith("data:")) {
                    const commaIndex = fileData.indexOf(",");
                    if (commaIndex !== -1) {
                        const mimePart = fileData.substring(5, commaIndex); // skip "data:"
                        const data = fileData.substring(commaIndex + 1);
                        const mimeType = mimePart.split(";")[0];
                        parts.push({
                            inlineData: {
                                mimeType,
                                data
                            }
                        });
                    }
                } else if (typeof fileData === "string" && /^https?:\/\//i.test(fileData)) {
                    // Remote URLs cannot be embedded as inlineData (which requires base64),
                    // but Gemini's Part schema natively accepts `fileData: { fileUri }` for
                    // HTTP/HTTPS sources — the model fetches the asset itself. Pass the URL
                    // through instead of dropping it (#2807; ported from upstream PR #344).
                    // The MIME type is intentionally `image/*` because we do not block on
                    // a HEAD request to sniff it; Gemini infers the concrete type on fetch.
                    parts.push({
                        fileData: {
                            fileUri: fileData,
                            mimeType: "image/*"
                        }
                    });
                }
            }
        }
    }
    return parts;
}
function extractTextContent(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.map((item)=>toRecord(item)).filter((c)=>c.type === "text").map((c)=>typeof c.text === "string" ? c.text : "").join("");
    }
    return "";
}
function tryParseJSON(str) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$jsonUtil$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeParseJSON"])(str, null);
}
function generateRequestId() {
    return `agent-${crypto.randomUUID()}`;
}
function generateSessionId() {
    const arr = new BigUint64Array(1);
    globalThis.crypto.getRandomValues(arr);
    const num = arr[0] % 9000000000000000000n;
    return `-${num.toString()}`;
}
function cloneSchemaValue(value) {
    if (Array.isArray(value)) {
        return value.map((item)=>cloneSchemaValue(item));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue])=>[
                key,
                cloneSchemaValue(nestedValue)
            ]));
    }
    return value;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function decodeJsonPointerSegment(segment) {
    return String(segment).replace(/~1/g, "/").replace(/~0/g, "~");
}
function resolveLocalReference(root, ref) {
    if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
    let current = root;
    const segments = ref.slice(2).split("/").filter(Boolean).map((segment)=>decodeJsonPointerSegment(segment));
    for (const segment of segments){
        const currentRecord = toRecord(current);
        if (!(segment in currentRecord)) {
            return null;
        }
        current = currentRecord[segment];
    }
    return current;
}
function inlineLocalSchemaRefs(node, root, activeRefs = new Set()) {
    if (Array.isArray(node)) {
        return node.map((item)=>inlineLocalSchemaRefs(item, root, activeRefs));
    }
    if (!node || typeof node !== "object") {
        return node;
    }
    const record = {
        ...toRecord(node)
    };
    const ref = typeof record.$ref === "string" ? record.$ref : "";
    if (ref.startsWith("#/$defs/") || ref.startsWith("#/definitions/")) {
        const rest = {
            ...record
        };
        delete rest.$ref;
        if (activeRefs.has(ref)) {
            return inlineLocalSchemaRefs(rest, root, activeRefs);
        }
        const resolved = resolveLocalReference(root, ref);
        if (!resolved || typeof resolved !== "object") {
            return inlineLocalSchemaRefs(rest, root, activeRefs);
        }
        activeRefs.add(ref);
        const merged = {
            ...toRecord(inlineLocalSchemaRefs(cloneSchemaValue(resolved), root, activeRefs)),
            ...rest
        };
        activeRefs.delete(ref);
        return inlineLocalSchemaRefs(merged, root, activeRefs);
    }
    return Object.fromEntries(Object.entries(record).map(([key, value])=>[
            key,
            inlineLocalSchemaRefs(value, root, activeRefs)
        ]));
}
// Helper: Remove unsupported keywords recursively from object/array
function removeUnsupportedKeywords(obj, keywords) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
        for (const item of obj){
            removeUnsupportedKeywords(item, keywords);
        }
        return;
    }
    const record = obj;
    // Delete unsupported *constraint* keywords at the current schema level.
    for (const key of Object.keys(record)){
        if (keywords.has(key) || key.startsWith("x-")) {
            delete record[key];
        }
    }
    // Recurse into remaining values. `properties` is a map keyed by arbitrary,
    // user-defined property NAMES — a tool may legitimately declare a property
    // called `pattern`, `enum`, `minLength`, etc. Descend into each property's
    // subschema, but never run keyword-deletion against the property names
    // themselves, or glob/grep-style tools lose their `pattern` argument (#1368).
    for (const [key, value] of Object.entries(record)){
        if (!value || typeof value !== "object") continue;
        if (key === "properties" && !Array.isArray(value)) {
            for (const subSchema of Object.values(value)){
                removeUnsupportedKeywords(subSchema, keywords);
            }
        } else {
            removeUnsupportedKeywords(value, keywords);
        }
    }
}
function normalizeAdditionalProperties(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
        for (const item of obj){
            normalizeAdditionalProperties(item);
        }
        return;
    }
    const record = obj;
    // Gemini API does not support `additionalProperties` at all in function_declarations
    // schemas (returns 400 "Unknown name"). Since Gemini defaults to allowing additional
    // properties anyway, stripping it unconditionally is safe and prevents errors (#1421).
    if ("additionalProperties" in record) {
        delete record.additionalProperties;
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") {
            normalizeAdditionalProperties(value);
        }
    }
}
// Convert const to enum
function convertConstToEnum(obj) {
    if (!obj || typeof obj !== "object") return;
    const record = obj;
    if (record.const !== undefined && !record.enum) {
        record.enum = [
            record.const
        ];
        delete record.const;
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") {
            convertConstToEnum(value);
        }
    }
}
// Convert enum values to strings (Gemini requires string enum values)
// For integer types, remove enum entirely as Gemini doesn't support it
function convertEnumValuesToStrings(obj) {
    if (!obj || typeof obj !== "object") return;
    const record = obj;
    if (record.enum && Array.isArray(record.enum)) {
        // Gemini only supports enum for string types, not integer
        if (record.type === "integer" || record.type === "number") {
            delete record.enum;
        } else {
            record.enum = record.enum.map((v)=>String(v));
            if (!record.type) {
                record.type = "string";
            }
        }
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") {
            convertEnumValuesToStrings(value);
        }
    }
}
// Merge allOf schemas
function mergeAllOf(obj) {
    if (!obj || typeof obj !== "object") return;
    const record = obj;
    if (record.allOf && Array.isArray(record.allOf)) {
        const merged = {};
        for (const item of record.allOf){
            const itemRecord = toRecord(item);
            const itemProperties = toRecord(itemRecord.properties);
            if (Object.keys(itemProperties).length > 0) {
                if (!merged.properties) merged.properties = {};
                Object.assign(merged.properties, itemProperties);
            }
            if (itemRecord.required && Array.isArray(itemRecord.required)) {
                if (!merged.required) merged.required = [];
                for (const req of itemRecord.required){
                    if (typeof req === "string" && !merged.required.includes(req)) {
                        merged.required.push(req);
                    }
                }
            }
        }
        delete record.allOf;
        if (merged.properties) record.properties = {
            ...toRecord(record.properties),
            ...merged.properties
        };
        if (merged.required) {
            const required = Array.isArray(record.required) ? record.required.filter((item)=>typeof item === "string") : [];
            record.required = [
                ...required,
                ...merged.required
            ];
        }
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") {
            mergeAllOf(value);
        }
    }
}
// Select best schema from anyOf/oneOf
function selectBest(items) {
    let bestIdx = 0;
    let bestScore = -1;
    for(let i = 0; i < items.length; i++){
        const item = toRecord(items[i]);
        let score = 0;
        const type = item.type;
        if (type === "object" || item.properties) {
            score = 3;
        } else if (type === "array" || item.items) {
            score = 2;
        } else if (type && type !== "null") {
            score = 1;
        }
        if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    }
    return bestIdx;
}
// Flatten anyOf/oneOf
function flattenAnyOfOneOf(obj) {
    if (!obj || typeof obj !== "object") return;
    const record = obj;
    if (record.anyOf && Array.isArray(record.anyOf) && record.anyOf.length > 0) {
        const nonNullSchemas = record.anyOf.filter((s)=>s && toRecord(s).type !== "null");
        if (nonNullSchemas.length > 0) {
            const bestIdx = selectBest(nonNullSchemas);
            const selected = nonNullSchemas[bestIdx];
            delete record.anyOf;
            Object.assign(record, toRecord(selected));
        }
    }
    if (record.oneOf && Array.isArray(record.oneOf) && record.oneOf.length > 0) {
        const nonNullSchemas = record.oneOf.filter((s)=>s && toRecord(s).type !== "null");
        if (nonNullSchemas.length > 0) {
            const bestIdx = selectBest(nonNullSchemas);
            const selected = nonNullSchemas[bestIdx];
            delete record.oneOf;
            Object.assign(record, toRecord(selected));
        }
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") {
            flattenAnyOfOneOf(value);
        }
    }
}
// Flatten type arrays
function flattenTypeArrays(obj) {
    if (!obj || typeof obj !== "object") return;
    const record = obj;
    if (record.type && Array.isArray(record.type)) {
        const nonNullTypes = record.type.filter((t)=>t !== "null");
        record.type = nonNullTypes.length > 0 ? nonNullTypes[0] : "string";
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") {
            flattenTypeArrays(value);
        }
    }
}
function cleanJSONSchemaForAntigravity(schema) {
    if (!schema || typeof schema !== "object") return schema;
    const root = cloneSchemaValue(schema);
    let cleaned = inlineLocalSchemaRefs(root, root);
    // Phase 1: Convert and prepare
    convertConstToEnum(cleaned);
    convertEnumValuesToStrings(cleaned);
    // Phase 2: Flatten complex structures
    mergeAllOf(cleaned);
    flattenAnyOfOneOf(cleaned);
    flattenTypeArrays(cleaned);
    // Phase 3: Preserve the only supported additionalProperties shape before keyword cleanup.
    normalizeAdditionalProperties(cleaned);
    // Phase 4: Remove all unsupported keywords at ALL levels (including inside arrays).
    removeUnsupportedKeywords(cleaned, GEMINI_UNSUPPORTED_SCHEMA_KEYS);
    // Phase 5: Cleanup required fields recursively.
    function cleanupRequired(obj) {
        if (!obj || typeof obj !== "object") return;
        const record = obj;
        if (record.required && Array.isArray(record.required) && record.properties) {
            const properties = toRecord(record.properties);
            const validRequired = record.required.filter((field)=>typeof field === "string" && Object.prototype.hasOwnProperty.call(properties, field));
            if (validRequired.length === 0) {
                delete record.required;
            } else {
                record.required = validRequired;
            }
        }
        // Recurse into nested objects
        for (const value of Object.values(record)){
            if (value && typeof value === "object") {
                cleanupRequired(value);
            }
        }
    }
    cleanupRequired(cleaned);
    // Phase 6: Add placeholder for empty object schemas (Antigravity requirement).
    function addPlaceholders(obj) {
        if (!obj || typeof obj !== "object") return;
        const record = obj;
        if (record.type === "object") {
            if (!record.properties || Object.keys(toRecord(record.properties)).length === 0) {
                record.properties = {
                    reason: {
                        type: "string",
                        description: "Brief explanation of why you are calling this tool"
                    }
                };
                record.required = [
                    "reason"
                ];
            }
        }
        // Recurse into nested objects
        for (const value of Object.values(record)){
            if (value && typeof value === "object") {
                addPlaceholders(value);
            }
        }
    }
    addPlaceholders(cleaned);
    return cleaned;
}
}),
"[project]/open-sse/translator/helpers/geminiToolsSanitizer.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGeminiTools",
    ()=>buildGeminiTools,
    "sanitizeGeminiToolName",
    ()=>sanitizeGeminiToolName
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/geminiHelper.ts [instrumentation] (ecmascript)");
;
;
const MAX_GEMINI_TOOL_NAME_LENGTH = 64;
const GEMINI_TOOL_HASH_LENGTH = 8;
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * Gemini/Vertex requires every functionDeclaration.parameters to be an OBJECT-typed schema
 * (#3357: "functionDeclaration parameters schema should be of type OBJECT"). Some clients
 * (e.g. GitHub Copilot's `terminal_last_command`) send a `parameters` that is present but
 * lacks a top-level `type: "object"` — just `{ properties }`, a scalar/array type, or `{}`.
 * Coerce the parameters root to an object schema before it is cleaned; a falsy/non-record
 * schema becomes an empty object schema. Only the top level is touched — nested property
 * schemas are left to cleanJSONSchemaForAntigravity.
 */ function toGeminiParametersSchema(raw) {
    if (!isRecord(raw)) {
        return {
            type: "object",
            properties: {}
        };
    }
    if (raw.type === "object") {
        return raw;
    }
    return {
        ...raw,
        type: "object",
        properties: isRecord(raw.properties) ? raw.properties : {}
    };
}
function normalizeGeminiToolName(name, options = {}) {
    const trimmed = name.trim();
    const namespaceStripped = !options.stripNamespace ? trimmed : (()=>{
        const namespaceIndex = trimmed.indexOf(":");
        return namespaceIndex >= 0 ? trimmed.slice(namespaceIndex + 1) : trimmed;
    })();
    return namespaceStripped.replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}
function buildHashedGeminiToolName(baseName, originalName, hashLength) {
    const effectiveBase = baseName || "tool";
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(originalName).digest("hex").slice(0, hashLength);
    const prefixLength = Math.max(1, MAX_GEMINI_TOOL_NAME_LENGTH - 1 - hash.length);
    return `${effectiveBase.slice(0, prefixLength)}_${hash}`;
}
function findSanitizedNameForOriginal(toolNameMap, originalName) {
    if (!(toolNameMap instanceof Map)) return null;
    for (const [sanitizedName, rawName] of toolNameMap.entries()){
        if (rawName === originalName) {
            return sanitizedName;
        }
    }
    return null;
}
function isSanitizedNameTaken(toolNameMap, sanitizedName, originalName) {
    if (!(toolNameMap instanceof Map)) return false;
    const mappedOriginalName = toolNameMap.get(sanitizedName);
    return typeof mappedOriginalName === "string" && mappedOriginalName !== originalName;
}
function sanitizeGeminiToolName(name, options = {}) {
    const normalizedName = normalizeGeminiToolName(name, options) || "tool";
    const toolNameMap = options.toolNameMap instanceof Map ? options.toolNameMap : null;
    const existingSanitizedName = findSanitizedNameForOriginal(toolNameMap, name);
    if (existingSanitizedName) {
        return existingSanitizedName;
    }
    let sanitizedName = normalizedName.length <= MAX_GEMINI_TOOL_NAME_LENGTH ? normalizedName : buildHashedGeminiToolName(normalizedName, name, GEMINI_TOOL_HASH_LENGTH);
    if (isSanitizedNameTaken(toolNameMap, sanitizedName, name)) {
        const conflictingOriginalName = toolNameMap?.get(sanitizedName);
        sanitizedName = buildHashedGeminiToolName(normalizedName, name, GEMINI_TOOL_HASH_LENGTH);
        let hashLength = GEMINI_TOOL_HASH_LENGTH + 2;
        while(isSanitizedNameTaken(toolNameMap, sanitizedName, name) && hashLength <= 32){
            sanitizedName = buildHashedGeminiToolName(normalizedName, name, hashLength);
            hashLength += 2;
        }
        if (isSanitizedNameTaken(toolNameMap, sanitizedName, name)) {
            sanitizedName = buildHashedGeminiToolName("tool", `${name}:${Date.now()}`, 12);
        }
        console.warn(`[GeminiTools] Tool name collision after sanitization: "${name}" conflicts with "${conflictingOriginalName}". Using "${sanitizedName}".`);
    }
    toolNameMap?.set(sanitizedName, name);
    return sanitizedName;
}
function toGeminiGoogleSearchTool(tool) {
    if (isRecord(tool.googleSearch)) {
        return {
            googleSearch: tool.googleSearch
        };
    }
    if (tool.googleSearch !== undefined) {
        return {
            googleSearch: {}
        };
    }
    if (isRecord(tool.google_search)) {
        return {
            googleSearch: tool.google_search
        };
    }
    if (tool.google_search !== undefined) {
        return {
            googleSearch: {}
        };
    }
    const toolType = typeof tool.type === "string" ? tool.type : "";
    if (toolType === "googleSearch" || toolType === "google_search" || toolType === "web_search" || toolType === "web_search_preview") {
        return {
            googleSearch: {}
        };
    }
    return null;
}
function buildGeminiTools(tools, options = {}) {
    if (!Array.isArray(tools) || tools.length === 0) {
        return undefined;
    }
    const functionDeclarations = [];
    // Track sanitized names already added to prevent Gemini rejection from duplicate
    // function declaration names (two different raw names that collapse to the same
    // sanitized form, or the same raw name repeated across tool groups).
    const seenToolNames = new Set();
    let googleSearchTool = null;
    for (const rawTool of tools){
        if (!isRecord(rawTool)) {
            continue;
        }
        const normalizedGoogleSearchTool = toGeminiGoogleSearchTool(rawTool);
        if (normalizedGoogleSearchTool) {
            googleSearchTool = normalizedGoogleSearchTool;
            continue;
        }
        if (Array.isArray(rawTool.functionDeclarations)) {
            for (const fn of rawTool.functionDeclarations){
                if (!isRecord(fn) || typeof fn.name !== "string" || !fn.name.trim()) {
                    continue;
                }
                const sanitizedName = sanitizeGeminiToolName(fn.name, options);
                if (seenToolNames.has(sanitizedName)) continue;
                seenToolNames.add(sanitizedName);
                functionDeclarations.push({
                    name: sanitizedName,
                    description: typeof fn.description === "string" ? fn.description : "",
                    parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanJSONSchemaForAntigravity"])(toGeminiParametersSchema(fn.parameters))
                });
            }
            continue;
        }
        if (typeof rawTool.name === "string" && rawTool.name.trim()) {
            const sanitizedName = sanitizeGeminiToolName(rawTool.name, options);
            if (!seenToolNames.has(sanitizedName)) {
                seenToolNames.add(sanitizedName);
                functionDeclarations.push({
                    name: sanitizedName,
                    description: typeof rawTool.description === "string" ? rawTool.description : "",
                    parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanJSONSchemaForAntigravity"])(toGeminiParametersSchema(rawTool.input_schema))
                });
            }
            continue;
        }
        if (rawTool.type === "function" && isRecord(rawTool.function)) {
            const fn = rawTool.function;
            if (typeof fn.name !== "string" || !fn.name.trim()) {
                continue;
            }
            const sanitizedName = sanitizeGeminiToolName(fn.name, options);
            if (!seenToolNames.has(sanitizedName)) {
                seenToolNames.add(sanitizedName);
                functionDeclarations.push({
                    name: sanitizedName,
                    description: typeof fn.description === "string" ? fn.description : "",
                    parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanJSONSchemaForAntigravity"])(toGeminiParametersSchema(fn.parameters))
                });
            }
        }
    }
    const result = [];
    if (googleSearchTool) {
        return [
            googleSearchTool
        ];
    }
    if (functionDeclarations.length > 0) {
        result.push({
            functionDeclarations
        });
    }
    return result.length > 0 ? result : undefined;
}
}),
"[project]/open-sse/translator/paramSupport.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__STRIP_RULES_FOR_TEST",
    ()=>__STRIP_RULES_FOR_TEST,
    "applyConfigFilters",
    ()=>applyConfigFilters,
    "stripUnsupportedParams",
    ()=>stripUnsupportedParams
]);
// Strip request params a given provider/model rejects upstream (e.g. HTTP 400).
// Config-driven: add a rule here instead of scattering `delete body.x` across
// executors. Port from 9router#7ae9fff6 (fixes upstream #1748).
//
// Rule semantics:
//   - `provider` (optional) limits the rule to a single provider id.
//   - `match` is a RegExp tested against the model id OR a predicate (model -> boolean).
//   - `drop` is the list of param keys to remove when the rule fires.
//   - `clampToModelMaxOutput` clamps max_tokens/max_completion_tokens/max_output_tokens
//     down to the model's catalog `maxOutputTokens` ceiling, when one is set.
//   - `maxOutputCap` clamps the same keys down to a fixed endpoint-imposed ceiling
//     (independent of the model's own advertised ceiling). When both are present on
//     the same rule, the lower of the two wins.
//
// A param is removed only when it is present (!== undefined). The helper never
// introduces new keys and never throws on null/undefined bodies — call sites
// can chain it without extra guards.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/paramFilters.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
;
;
const MAX_OUTPUT_TOKEN_KEYS = [
    "max_tokens",
    "max_completion_tokens",
    "max_output_tokens"
];
const STRIP_RULES = [
    // claude-opus-4 series: temperature is deprecated (Anthropic returns 400). #1748
    {
        match: /claude-opus-4/i,
        drop: [
            "temperature"
        ]
    },
    // GitHub Copilot gpt-5.4: temperature unsupported.
    {
        provider: "github",
        match: /gpt-5\.4/i,
        drop: [
            "temperature"
        ]
    },
    // GitHub Copilot Claude (except opus/sonnet 4.6): thinking + reasoning_effort rejected. #713
    {
        provider: "github",
        match: (m)=>/claude/i.test(m) && !/claude.*(opus|sonnet).*4\.6/i.test(m),
        drop: [
            "thinking",
            "reasoning_effort"
        ]
    },
    // NVIDIA NIM z-ai/glm-5.2: OpenAI-compatible wrapper rejects BOTH the `reasoning`
    // body field (#6102) and the Claude-style `thinking` field. A Claude-format
    // client (e.g. Claude Code) routed here leaves a `thinking:{type:"adaptive"}`
    // that the wrapper 400s on — same class already handled for minimax-m2.7 below.
    // 9router#2023.
    {
        provider: "nvidia",
        match: /z-ai\/glm-5\.2\b/i,
        drop: [
            "reasoning",
            "thinking"
        ]
    },
    // NVIDIA NIM minimaxai/minimax-m2.7: NVIDIA's OpenAI-compatible wrapper
    // (format:"openai") does not accept the Claude-style `thinking` body field
    // and returns 400 "Unsupported parameter(s): thinking". Upstream #2268.
    {
        provider: "nvidia",
        match: /minimax-m2\.7/i,
        drop: [
            "thinking"
        ]
    },
    // NVIDIA NIM: OpenAI-compatible wrapper 400s on `prompt_cache_key` (Codex CLI
    // injects it natively for its own prompt caching). NIM has no documented
    // support for this field (providerSupportsCaching already treats nvidia as
    // non-cache-capable) — safe to drop provider-wide, not model-specific. #7617.
    {
        provider: "nvidia",
        match: /.*/,
        drop: [
            "prompt_cache_key"
        ]
    },
    // VolcEngine Ark caps the Kimi coding-plan endpoint at max_tokens <= 32768
    // server-side ("integer above maximum value, expected a value <= 32768"),
    // independent of the model's own catalog ceiling. Confirmed against two
    // independent live-endpoint reports hitting the same Ark endpoint for both
    // kimi-k2.5 and kimi-k2.7-code (NousResearch/hermes-agent#51773,
    // MoonshotAI/kimi-cli#1124), and by upstream decolua/9router#2460. Scoped to
    // OmniRoute's actual volcengine Kimi id (not a broad /kimi/i regex) so it
    // never clamps an unrelated future Kimi listing whose Ark cap may differ.
    {
        provider: "volcengine",
        match: /^kimi-k2-5-260127$/,
        maxOutputCap: 32768,
        clampToModelMaxOutput: true
    },
    // #7364: Z.AI's glm-4.6v vision endpoint enforces a 32768 max_tokens ceiling
    // server-side and 400s when a client sends a larger explicit max_tokens (e.g. a
    // client defaulting to 65536). Scoped to both wire paths that can reach this
    // model: "zai" (DefaultExecutor, Claude format by default — glm-4.6v is only
    // reachable there as a custom model attached to the connection, so it is NOT in
    // PROVIDER_MODELS["zai"] and clampToModelMaxOutput would find no catalog ceiling
    // to clamp against, hence the fixed maxOutputCap) and "glm" (GlmExecutor, OpenAI
    // format — glm-4.6v IS in the registry catalog there, `GLM_SHARED_MODELS` in
    // glmProvider.ts, maxOutputTokens: 32768, so clampToModelMaxOutput suffices).
    {
        provider: "zai",
        match: /^glm-4\.6v$/i,
        maxOutputCap: 32768
    },
    {
        provider: "glm",
        match: /^glm-4\.6v$/i,
        clampToModelMaxOutput: true
    }
];
function matches(rule, model) {
    return typeof rule.match === "function" ? rule.match(model) : rule.match.test(model);
}
/**
 * When a rule requests it, clamp the max-output-token family of params down to
 * the lowest applicable ceiling: the model's own catalog `maxOutputTokens`
 * (`clampToModelMaxOutput`) and/or a fixed endpoint cap (`maxOutputCap`). Only
 * clamps keys that are present and numeric; never introduces a new key.
 */ function applyMaxOutputClamp(rule, provider, model, body) {
    if (!rule.clampToModelMaxOutput && !Number.isFinite(rule.maxOutputCap)) return;
    const candidates = [];
    if (rule.clampToModelMaxOutput) {
        const modelCeiling = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderModel"])(provider ?? "", model)?.maxOutputTokens;
        if (Number.isFinite(modelCeiling) && modelCeiling > 0) {
            candidates.push(modelCeiling);
        }
    }
    if (Number.isFinite(rule.maxOutputCap) && rule.maxOutputCap > 0) {
        candidates.push(rule.maxOutputCap);
    }
    if (candidates.length === 0) return;
    const ceiling = Math.min(...candidates);
    for (const key of MAX_OUTPUT_TOKEN_KEYS){
        const value = body[key];
        if (typeof value === "number" && Number.isFinite(value) && value > ceiling) {
            body[key] = ceiling;
        }
    }
}
function stripUnsupportedParams(provider, model, body) {
    if (!model || !body || typeof body !== "object") return body;
    const rec = body;
    // Snapshot the original body before any mutations so the allowlist can
    // restore params that were stripped by hardcoded or config-driven denylist.
    const snapshot = {
        ...rec
    };
    // Phase 1: Hardcoded rules (unchanged)
    for (const rule of STRIP_RULES){
        if (rule.provider && rule.provider !== provider) continue;
        if (!matches(rule, model)) continue;
        for (const key of rule.drop ?? []){
            if (rec[key] !== undefined) delete rec[key];
        }
        applyMaxOutputClamp(rule, provider, model, rec);
    }
    // Phase 2: Config-driven rules from DB
    applyConfigFilters(provider, model, rec, snapshot);
    return body;
}
/**
 * Restore keys from `snapshot` into `body` for every key listed in `allow`,
 * but only when the key was present in the original request. Shared by the
 * provider-level and model-level allowlist passes below.
 */ function restoreAllowedKeys(body, snapshot, allow) {
    for (const key of allow){
        if (key in snapshot) {
            body[key] = snapshot[key];
        }
    }
}
/**
 * Apply the provider-level denylist, then restore the provider-level
 * allowlist from `snapshot`. Runs BEFORE model-level operations so
 * model-level settings can override provider-level ones.
 */ function applyProviderLevelFilters(body, snapshot, config) {
    for (const key of config.block){
        delete body[key];
    }
    if (config.allow.length > 0) {
        restoreAllowedKeys(body, snapshot, config.allow);
    }
}
/**
 * Apply the model-level denylist (overrides the provider-level allowlist),
 * then restore the model-level allowlist from `snapshot` (final pass, most
 * specific wins).
 */ function applyModelLevelFilters(body, snapshot, modelCfg) {
    if (modelCfg?.block) {
        for (const key of modelCfg.block){
            delete body[key];
        }
    }
    if (modelCfg?.allow) {
        restoreAllowedKeys(body, snapshot, modelCfg.allow);
    }
}
function applyConfigFilters(provider, model, body, snapshot) {
    if (!provider || !body) return;
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$paramFilters$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getParamFilterConfig"])(provider);
    if (!config) return;
    applyProviderLevelFilters(body, snapshot, config);
    const modelCfg = config.models?.[model ?? ""];
    applyModelLevelFilters(body, snapshot, modelCfg);
}
const __STRIP_RULES_FOR_TEST = STRIP_RULES;
}),
"[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "caseInsensitiveToolNameLookup",
    ()=>caseInsensitiveToolNameLookup,
    "ensureToolCallIds",
    ()=>ensureToolCallIds,
    "fallbackToolCallId",
    ()=>fallbackToolCallId,
    "fixMissingToolResponses",
    ()=>fixMissingToolResponses,
    "generateToolCallId",
    ()=>generateToolCallId,
    "getToolCallIds",
    ()=>getToolCallIds,
    "hasToolResults",
    ()=>hasToolResults,
    "normalizeOpenAIToolNames",
    ()=>normalizeOpenAIToolNames,
    "restoreOpenAIToolNames",
    ()=>restoreOpenAIToolNames,
    "stripOrphanedToolResults",
    ()=>stripOrphanedToolResults
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
// Tool call helper functions for translator
const ALPHANUM9 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function aliasOpenAIToolName(name, maxLength, aliases) {
    if (typeof name !== "string" || name.length === 0) return name;
    const safe = name.replace(/[^A-Za-z0-9_-]/g, "_");
    if (safe === name && safe.length <= maxLength) return safe;
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(name).digest("hex").slice(0, 12);
    const prefixLength = Math.max(0, maxLength - hash.length - 1);
    const shortened = prefixLength > 0 ? `${safe.slice(0, prefixLength)}_${hash}` : hash.slice(0, maxLength);
    aliases.set(shortened, name);
    return shortened;
}
function normalizeOpenAIToolNames(body, maxLength) {
    const aliases = new Map();
    const root = toRecord(body);
    if (!root || !Number.isInteger(maxLength) || maxLength < 1) return aliases;
    const alias = (name)=>aliasOpenAIToolName(name, maxLength, aliases);
    if (Array.isArray(root.tools)) {
        for (const tool of root.tools){
            const fn = toRecord(toRecord(tool)?.function);
            if (fn && typeof fn.name === "string") fn.name = alias(fn.name);
        }
    }
    const toolChoiceFunction = toRecord(toRecord(root.tool_choice)?.function);
    if (toolChoiceFunction && typeof toolChoiceFunction.name === "string") {
        toolChoiceFunction.name = alias(toolChoiceFunction.name);
    }
    if (Array.isArray(root.messages)) {
        for (const message of root.messages){
            const msg = toRecord(message);
            if (!msg) continue;
            if (Array.isArray(msg.tool_calls)) {
                for (const toolCall of msg.tool_calls){
                    const fn = toRecord(toRecord(toolCall)?.function);
                    if (fn && typeof fn.name === "string") fn.name = alias(fn.name);
                }
            }
            if (msg.role === "tool" && typeof msg.name === "string") {
                msg.name = alias(msg.name);
            }
        }
    }
    return aliases;
}
function caseInsensitiveToolNameLookup(name, map) {
    if (!map || !name) return undefined;
    // Fast path: exact match (PascalCase-preserving providers)
    const exact = map.get(name);
    if (exact !== undefined) return exact;
    // Fallback: case-insensitive scan
    const lowerName = name.toLowerCase();
    for (const [key, value] of map){
        if (key.toLowerCase() === lowerName) {
            return value;
        }
    }
    return undefined;
}
function restoreOpenAIToolNames(body, aliases) {
    if (!(aliases instanceof Map) || aliases.size === 0) return false;
    const root = toRecord(body);
    if (!root || !Array.isArray(root.choices)) return false;
    let changed = false;
    const restoreCalls = (calls)=>{
        if (!Array.isArray(calls)) return;
        for (const toolCall of calls){
            const fn = toRecord(toRecord(toolCall)?.function);
            if (!fn || typeof fn.name !== "string") continue;
            const original = caseInsensitiveToolNameLookup(fn.name, aliases);
            if (typeof original !== "string" || original === fn.name) continue;
            fn.name = original;
            changed = true;
        }
    };
    for (const choice of root.choices){
        const record = toRecord(choice);
        if (!record) continue;
        restoreCalls(toRecord(record.delta)?.tool_calls);
        restoreCalls(toRecord(record.message)?.tool_calls);
    }
    return changed;
}
function fallbackToolCallId(index) {
    return index === undefined ? `call_${Date.now()}` : `call_${index}_${Date.now()}`;
}
function generateToolCallId() {
    return `call_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
// Generate 9-char [a-zA-Z0-9] id for providers that require it (e.g. Mistral)
function generateToolCallId9() {
    let s = "";
    for(let i = 0; i < 9; i++){
        s += ALPHANUM9[Math.floor(Math.random() * ALPHANUM9.length)];
    }
    return s;
}
function ensureToolCallIds(body, options) {
    if (!body.messages || !Array.isArray(body.messages)) return body;
    const use9CharId = options?.use9CharId === true;
    for(let i = 0; i < body.messages.length; i++){
        const msg = body.messages[i];
        if (msg.role !== "assistant" || !msg.tool_calls || !Array.isArray(msg.tool_calls)) continue;
        const used9 = new Set();
        const newIdsInOrder = [];
        for (const tc of msg.tool_calls){
            if (!tc.type) {
                tc.type = "function";
            }
            if (tc.function?.arguments && typeof tc.function.arguments !== "string") {
                tc.function.arguments = JSON.stringify(tc.function.arguments);
            }
            if (use9CharId) {
                let newId;
                do {
                    newId = generateToolCallId9();
                }while (used9.has(newId))
                used9.add(newId);
                newIdsInOrder.push(newId);
                tc.id = newId;
            } else {
                // Leave id as-is, only ensure it exists for later tool message matching
                const id = tc.id != null && String(tc.id).trim() !== "" ? String(tc.id) : generateToolCallId();
                tc.id = id;
                newIdsInOrder.push(id);
            }
        }
        // Tool responses (role "tool") follow in the same order as tool_calls. Rewrite
        // every id only when the provider requires generated 9-char ids; otherwise keep
        // explicit client ids and fill only missing ones. Overwriting a compacted orphan's
        // explicit id by position can make it impersonate a different parallel call.
        // Stop at the next assistant so we only link responses belonging to this turn.
        if (newIdsInOrder.length > 0) {
            let idx = 0;
            for(let j = i + 1; j < body.messages.length; j++){
                const later = body.messages[j];
                if (later.role === "assistant") break;
                if (later.role !== "tool") continue;
                if (idx < newIdsInOrder.length) {
                    if (use9CharId || later.tool_call_id == null || String(later.tool_call_id).trim() === "") {
                        later.tool_call_id = newIdsInOrder[idx];
                    }
                    idx++;
                }
            }
        }
    }
    return body;
}
function getToolCallIds(msg) {
    if (msg.role !== "assistant") return [];
    const ids = [];
    // OpenAI format: tool_calls array
    if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
        for (const tc of msg.tool_calls){
            if (tc.id) ids.push(String(tc.id));
        }
    }
    // Claude format: tool_use blocks in content
    if (Array.isArray(msg.content)) {
        for (const block of msg.content){
            if (block.type === "tool_use" && block.id) {
                ids.push(String(block.id));
            }
        }
    }
    return ids;
}
function hasToolResults(msg, toolCallIds) {
    if (!msg || !toolCallIds.length) return false;
    // OpenAI format: role = "tool" with tool_call_id
    if (msg.role === "tool" && msg.tool_call_id) {
        return toolCallIds.includes(String(msg.tool_call_id));
    }
    // Claude format: tool_result blocks in user message content
    if (msg.role === "user" && Array.isArray(msg.content)) {
        for (const block of msg.content){
            if (block.type === "tool_result" && block.tool_use_id && toolCallIds.includes(String(block.tool_use_id))) {
                return true;
            }
        }
    }
    return false;
}
function fixMissingToolResponses(body) {
    if (!body.messages || !Array.isArray(body.messages)) return body;
    const newMessages = [];
    for(let i = 0; i < body.messages.length; i++){
        const msg = body.messages[i];
        const nextMsg = body.messages[i + 1];
        newMessages.push(msg);
        // Check if this is assistant with tool_calls/tool_use
        const toolCallIds = getToolCallIds(msg);
        if (toolCallIds.length === 0) continue;
        // Check if next message has tool_result
        if (nextMsg && !hasToolResults(nextMsg, toolCallIds)) {
            const hasOpenAIToolCalls = Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0;
            if (hasOpenAIToolCalls) {
                for (const id of toolCallIds){
                    newMessages.push({
                        role: "tool",
                        tool_call_id: id,
                        content: ""
                    });
                }
            } else {
                newMessages.push({
                    role: "user",
                    content: toolCallIds.map((id)=>({
                            type: "tool_result",
                            tool_use_id: id,
                            content: ""
                        }))
                });
            }
        }
    }
    body.messages = newMessages;
    return body;
}
function stripOrphanedToolResults(body) {
    if (!body.messages || !Array.isArray(body.messages)) return body;
    const knownCallIds = new Set();
    for (const msg of body.messages){
        for (const id of getToolCallIds(msg)){
            knownCallIds.add(id);
        }
    }
    let changed = false;
    const filteredMessages = [];
    for (const msg of body.messages){
        if (msg.role === "tool" && msg.tool_call_id) {
            if (knownCallIds.has(String(msg.tool_call_id))) {
                filteredMessages.push(msg);
            } else {
                changed = true;
            }
            continue;
        }
        if (Array.isArray(msg.content)) {
            const cleanedContent = msg.content.filter((block)=>{
                if (block?.type !== "tool_result") return true;
                return typeof block.tool_use_id === "string" && knownCallIds.has(block.tool_use_id);
            });
            if (cleanedContent.length !== msg.content.length) {
                changed = true;
                if (cleanedContent.length === 0) continue;
                msg.content = cleanedContent;
            }
        }
        filteredMessages.push(msg);
    }
    if (!changed) return body;
    body.messages = filteredMessages;
    return body;
}
}),
"[project]/open-sse/translator/helpers/openaiHelper.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// OpenAI helper functions for translator
// Valid OpenAI content block types
// `input_audio` / `audio_url` ported from upstream decolua/9router#913 so audio
// parts survive `filterToOpenAIFormat()` on OpenAI-target passthrough routes.
__turbopack_context__.s([
    "VALID_OPENAI_CONTENT_TYPES",
    ()=>VALID_OPENAI_CONTENT_TYPES,
    "VALID_OPENAI_MESSAGE_TYPES",
    ()=>VALID_OPENAI_MESSAGE_TYPES,
    "filterToOpenAIFormat",
    ()=>filterToOpenAIFormat
]);
const VALID_OPENAI_CONTENT_TYPES = [
    "text",
    "image_url",
    "image",
    "file_url",
    "file",
    "document",
    "input_audio",
    "audio_url"
];
const VALID_OPENAI_MESSAGE_TYPES = [
    "text",
    "image_url",
    "image",
    "file_url",
    "file",
    "document",
    "image",
    "input_audio",
    "audio_url",
    "tool_calls",
    "tool_result"
];
const CLAUDE_TOOL_CHOICE_REQUIRED = "an" + "y";
function filterToOpenAIFormat(body, opts = {}) {
    // #2069 — when the routed provider honors OpenAI-format cache_control
    // breakpoints (DashScope/alibaba, Xiaomi MiMo, etc.) and preservation was
    // requested upstream, keep the `cache_control` field on each content block
    // instead of destructuring it away. `signature` is always stripped.
    const preserveCacheControl = opts?.preserveCacheControl === true;
    // Moonshot's native Chat API extends OpenAI content blocks with `video_url`.
    // Keep that extension opt-in so generic OpenAI-compatible providers still
    // receive only the standard allowlist below.
    const preserveVideoUrl = opts?.preserveVideoUrl === true;
    // #4849 strips reasoning_content from tool-call assistant turns to stop O(n^2)
    // context growth — but reasoning-replay providers (DeepSeek V4, Kimi K2, etc.)
    // REQUIRE the client's reasoning_content to be passed back, so keep it for them
    // (the caller sets this when the routed model needs reasoning replay).
    const preserveReasoningContent = opts?.preserveReasoningContent === true;
    if (!body.messages || !Array.isArray(body.messages)) return body;
    body.messages = body.messages.map((msg)=>{
        // Normalize OpenAI Responses-style `developer` role to `system` — many
        // OpenAI-compatible providers reject `developer` (ported from
        // decolua/9router#1011).
        if (msg.role === "developer") msg = {
            ...msg,
            role: "system"
        };
        // Keep tool messages as-is (OpenAI format)
        if (msg.role === "tool") return msg;
        // Keep assistant messages with tool_calls, but strip reasoning_content —
        // reasoning blobs inflate context on every subsequent agentic turn (O(n^2)).
        // Exception: reasoning-replay providers must keep client-provided
        // reasoning_content (they 400 without it), so preserve it when requested.
        if (msg.role === "assistant" && msg.tool_calls) {
            if (!preserveReasoningContent && msg.reasoning_content !== undefined) {
                const { reasoning_content, ...cleanMsg } = msg;
                return cleanMsg;
            }
            return msg;
        }
        // Handle string content
        if (typeof msg.content === "string") return msg;
        // Handle array content
        if (Array.isArray(msg.content)) {
            const filteredContent = [];
            let thinkingText = null;
            for (const block of msg.content){
                // Extract thinking blocks as reasoning_content (OpenAI extended thinking)
                if (block.type === "thinking") {
                    thinkingText = block.thinking || block.text || "";
                    continue;
                }
                // Skip redacted thinking
                if (block.type === "redacted_thinking") continue;
                // Only keep valid OpenAI content types
                if (VALID_OPENAI_CONTENT_TYPES.includes(block.type) || preserveVideoUrl && block.type === "video_url") {
                    // Strip `signature` always; strip `cache_control` unless the provider
                    // honors OpenAI-format cache breakpoints and preservation was requested (#2069).
                    const { signature, cache_control, ...rest } = block;
                    const cleanBlock = preserveCacheControl && cache_control !== undefined ? {
                        ...rest,
                        cache_control
                    } : rest;
                    if (cleanBlock.type === "text" && typeof cleanBlock.text === "string" && cleanBlock.text.length === 0) {
                        continue;
                    }
                    const fileData = cleanBlock.file_url ?? cleanBlock.file ?? cleanBlock.document;
                    if ((cleanBlock.type === "file" || cleanBlock.type === "document") && !fileData?.url && !fileData?.data) {
                        const fileContent = cleanBlock.file?.content ?? cleanBlock.file?.text ?? cleanBlock.content ?? cleanBlock.text;
                        const fileName = cleanBlock.file?.name ?? cleanBlock.name ?? "attachment";
                        if (typeof fileContent === "string" && fileContent.length > 0) {
                            filteredContent.push({
                                type: "text",
                                text: `[${fileName}]\n${fileContent}`
                            });
                            continue;
                        }
                    }
                    filteredContent.push(cleanBlock);
                } else if (block.type === "tool_use") {
                    continue;
                } else if (block.type === "tool_result") {
                    const resultContent = block.content ?? block.text ?? block.output ?? "";
                    const resultText = typeof resultContent === "string" ? resultContent : Array.isArray(resultContent) ? resultContent.filter((c)=>c?.type === "text").map((c)=>c.text).join("\n") : JSON.stringify(resultContent);
                    if (typeof resultText === "string" && resultText.length > 0) {
                        filteredContent.push({
                            type: "text",
                            text: `[Tool Result: ${block.tool_use_id ?? block.id ?? "unknown"}]\n${resultText}`
                        });
                    }
                }
            }
            // If all content was filtered, add empty text
            if (filteredContent.length === 0) {
                filteredContent.push({
                    type: "text",
                    text: ""
                });
            }
            const result = {
                ...msg,
                content: filteredContent
            };
            // Attach thinking as reasoning_content for OpenAI extended thinking format
            if (thinkingText && msg.role === "assistant") {
                result.reasoning_content = thinkingText;
            }
            return result;
        }
        return msg;
    });
    // Filter out messages with only empty text (but NEVER filter tool messages)
    body.messages = body.messages.filter((msg)=>{
        // Always keep tool messages
        if (msg.role === "tool") return true;
        // Always keep assistant messages with tool_calls
        if (msg.role === "assistant" && msg.tool_calls) return true;
        // Moonshot partial assistant messages are output prefixes, and an empty
        // prefix is valid when `name` supplies the constrained value.
        if (msg.role === "assistant" && msg.partial === true) return true;
        if (typeof msg.content === "string") return msg.content.trim() !== "";
        if (Array.isArray(msg.content)) {
            return msg.content.some((b)=>b.type === "text" && b.text?.trim() || b.type !== "text");
        }
        return true;
    });
    // Remove empty tools array (some providers like QWEN reject it)
    if (body.tools && Array.isArray(body.tools) && body.tools.length === 0) {
        delete body.tools;
    }
    // Strip Claude-specific fields that OpenAI-compatible providers reject
    delete body.metadata;
    delete body.anthropic_version;
    // Codex clients send a top-level `client_metadata` object; OpenAI rejects it
    // with 400 "Unknown parameter: 'client_metadata'" (9router#1157).
    delete body.client_metadata;
    // Map max_output_tokens (from Vercel AI SDK) to max_tokens logic
    if (body.max_output_tokens !== undefined) {
        if (body.max_tokens === undefined) {
            body.max_tokens = body.max_output_tokens;
        }
        delete body.max_output_tokens;
    }
    // Normalize tools to OpenAI format (from Claude, Gemini, etc.)
    if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
        body.tools = body.tools.map((tool)=>{
            // Already OpenAI format
            if (tool.type === "function" && tool.function) return tool;
            // Claude format: {name, description, input_schema}
            if (tool.name && (tool.input_schema || tool.description)) {
                return {
                    type: "function",
                    function: {
                        name: tool.name,
                        // Coerce: strict upstream validators (NVIDIA NIM, Codex) reject
                        // non-string descriptions. Ports decolua/9router#397.
                        description: String(tool.description ?? ""),
                        parameters: tool.input_schema || {
                            type: "object",
                            properties: {}
                        }
                    }
                };
            }
            // Gemini format: {functionDeclarations: [{name, description, parameters}]}
            if (tool.functionDeclarations && Array.isArray(tool.functionDeclarations)) {
                return tool.functionDeclarations.map((fn)=>({
                        type: "function",
                        function: {
                            name: fn.name,
                            description: String(fn.description ?? ""),
                            parameters: fn.parameters || {
                                type: "object",
                                properties: {}
                            }
                        }
                    }));
            }
            return tool;
        }).flat();
    }
    // Normalize tool_choice to OpenAI format
    if (body.tool_choice && typeof body.tool_choice === "object") {
        const choice = body.tool_choice;
        // Claude format: {type: "auto|required-tool|tool", name?: "..."}
        if (choice.type === "auto") {
            body.tool_choice = "auto";
        } else if (choice.type === CLAUDE_TOOL_CHOICE_REQUIRED) {
            body.tool_choice = "required";
        } else if (choice.type === "tool" && choice.name) {
            body.tool_choice = {
                type: "function",
                function: {
                    name: choice.name
                }
            };
        }
    }
    return body;
}
}),
"[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRequestTranslator",
    ()=>getRequestTranslator,
    "getResponseTranslator",
    ()=>getResponseTranslator,
    "register",
    ()=>register
]);
const requestRegistry = new Map();
const responseRegistry = new Map();
function makeKey(from, to) {
    return `${from}:${to}`;
}
function register(from, to, requestFn, responseFn) {
    const key = makeKey(from, to);
    if (requestFn) {
        requestRegistry.set(key, requestFn);
    }
    if (responseFn) {
        responseRegistry.set(key, responseFn);
    }
}
function getRequestTranslator(from, to) {
    return requestRegistry.get(makeKey(from, to));
}
function getResponseTranslator(from, to) {
    return responseRegistry.get(makeKey(from, to));
}
}),
"[project]/open-sse/translator/helpers/maxTokensHelper.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adjustMaxTokens",
    ()=>adjustMaxTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
;
function adjustMaxTokens(body) {
    const requestedMaxTokens = body.max_tokens ?? body.max_completion_tokens;
    let maxTokens = requestedMaxTokens || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_MAX_TOKENS"];
    // Auto-increase for tool calling to prevent truncated arguments
    // Tool calls with large content (like writing files) need more tokens
    if (body.tools && Array.isArray(body.tools) && body.tools.length > 0) {
        if (maxTokens < __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_MIN_TOKENS"]) {
            maxTokens = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_MIN_TOKENS"];
        }
    }
    return Math.max(1, maxTokens);
}
}),
"[project]/open-sse/translator/request/claude-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "claudeToOpenAIRequest",
    ()=>claudeToOpenAIRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/maxTokensHelper.ts [instrumentation] (ecmascript)");
;
;
;
const TOOL_CHOICE_ANY = [
    "a",
    "n",
    "y"
].join("");
/**
 * Port of decolua/9router commit 0aaa5ab3 (closes prompt-cache instability):
 * Anthropic injects a dynamic `x-anthropic-billing-header: <value>` line at
 * the top of some system prompts. When we translate Claude → OpenAI and
 * forward to a non-Anthropic upstream, that line both leaks into the
 * assistant prompt and rotates per request, destroying prompt-cache hits.
 * Strip it from each system entry before assembling the OpenAI request.
 */ function stripAnthropicBillingHeader(text) {
    if (typeof text !== "string") return "";
    return text.replace(/^x-anthropic-billing-header:[^\n]*(?:\r?\n)?/i, "");
}
/**
 * Normalize tool input schema for OpenAI compatibility.
 * OpenAI strict mode requires `properties: {}` on object-type schemas,
 * even for zero-argument tools. Anthropic/MCP tools may omit it (#1898).
 */ function normalizeToolSchema(schema) {
    const fallback = {
        type: "object",
        properties: {}
    };
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) return fallback;
    const s = schema;
    if (s.type === "object" && !s.properties) {
        return {
            ...s,
            properties: {}
        };
    }
    return s;
}
function normalizeOpenAIReasoningEffort(effort) {
    if (typeof effort !== "string") return undefined;
    const normalized = effort.toLowerCase();
    return normalized || undefined;
}
function isClaudeServerWebSearchTool(tool) {
    if (!tool || typeof tool !== "object" || Array.isArray(tool)) return false;
    const record = tool;
    return record.name === "web_search" && typeof record.type === "string" && /^web_search_\d{8}$/.test(record.type);
}
function toStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((entry)=>typeof entry === "string").map((entry)=>entry.trim()).filter(Boolean);
}
function convertClaudeServerWebSearchTool(tool) {
    const allowedDomains = toStringArray(tool.allowed_domains);
    const blockedDomains = toStringArray(tool.blocked_domains);
    const filters = {};
    if (allowedDomains.length > 0) filters.allowed_domains = allowedDomains;
    if (blockedDomains.length > 0) filters.blocked_domains = blockedDomains;
    return {
        type: "web_search",
        ...Object.keys(filters).length > 0 ? {
            filters
        } : {},
        ...tool.user_location && typeof tool.user_location === "object" && !Array.isArray(tool.user_location) ? {
            user_location: tool.user_location
        } : {}
    };
}
function hasClaudeServerWebSearchTool(tools) {
    return Array.isArray(tools) && tools.some((tool)=>isClaudeServerWebSearchTool(tool));
}
function shouldUseNativeResponsesWebSearch(credentials) {
    return credentials !== null && typeof credentials === "object" && !Array.isArray(credentials) && credentials._targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES;
}
function claudeToOpenAIRequest(model, body, stream, credentials = null) {
    // #2069 — when the routed provider honors OpenAI-format cache_control breakpoints
    // (DashScope/alibaba, etc.) and the upstream caller requested preservation, keep
    // the client's cache_control markers on system + message text blocks instead of
    // collapsing them away during the Claude→OpenAI conversion.
    const preserveCacheControl = credentials !== null && typeof credentials === "object" && !Array.isArray(credentials) && credentials._preserveCacheControl === true;
    const result = {
        model: model,
        messages: [],
        stream: stream
    };
    // Max tokens
    if (body.max_tokens) {
        result.max_tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adjustMaxTokens"])(body);
    }
    // Temperature
    if (body.temperature !== undefined) {
        result.temperature = body.temperature;
    }
    if (body.top_p !== undefined) {
        result.top_p = body.top_p;
    }
    if (body.stop_sequences !== undefined) {
        result.stop = body.stop_sequences;
    }
    // System message
    if (body.system) {
        // When preserving cache_control for a caching-capable provider, and the client
        // tagged any system block, keep the array-of-blocks shape so the breakpoint
        // survives (DashScope reads cache_control off content blocks). Otherwise fall
        // back to the joined-string form expected by generic OpenAI providers (#2069).
        const systemHasCacheControl = preserveCacheControl && Array.isArray(body.system) && body.system.some((s)=>s && typeof s === "object" && s.cache_control !== undefined);
        const systemContent = systemHasCacheControl ? body.system.map((s)=>{
            // body.system may be a mixed array — handle string elements (and
            // null/non-object) defensively so we never drop text or throw.
            if (typeof s === "string") return {
                type: "text",
                text: stripAnthropicBillingHeader(s)
            };
            const rawText = s && typeof s === "object" ? s.text || "" : "";
            const block = {
                type: "text",
                text: stripAnthropicBillingHeader(rawText)
            };
            if (s && typeof s === "object" && s.cache_control !== undefined) {
                block.cache_control = s.cache_control;
            }
            return block;
        }) : Array.isArray(body.system) ? body.system.map((s)=>stripAnthropicBillingHeader(s.text || "")).filter(Boolean).join("\n") : stripAnthropicBillingHeader(body.system);
        if (systemHasCacheControl || systemContent) {
            result.messages.push({
                role: "system",
                content: systemContent
            });
        }
    }
    // Convert messages
    if (body.messages && Array.isArray(body.messages)) {
        for(let i = 0; i < body.messages.length; i++){
            const msg = body.messages[i];
            const converted = convertClaudeMessage(msg, preserveCacheControl);
            if (converted) {
                // Handle array of messages (multiple tool results)
                if (Array.isArray(converted)) {
                    result.messages.push(...converted);
                } else {
                    result.messages.push(converted);
                }
            }
        }
    }
    // #4714 / #4385: re-group every role:"tool" message immediately after the
    // assistant turn whose tool_calls issued it (dropping genuine orphans), then
    // fill placeholders for any tool_call left unanswered.
    result.messages = regroupToolMessages(result.messages);
    // Fix missing tool responses - OpenAI requires every tool_call to have a response.
    // Runs after regrouping so real results are already adjacent and only a truly
    // unanswered tool_call receives a "[No response received]" placeholder.
    fixMissingToolResponses(result.messages);
    const useNativeResponsesWebSearch = shouldUseNativeResponsesWebSearch(credentials);
    // Tools
    if (body.tools && Array.isArray(body.tools)) {
        const normalizedTools = body.tools.map((tool)=>{
            if (useNativeResponsesWebSearch && isClaudeServerWebSearchTool(tool)) {
                return convertClaudeServerWebSearchTool(tool);
            }
            if (!tool || typeof tool !== "object" || Array.isArray(tool)) return null;
            const record = tool;
            const name = typeof record.name === "string" ? record.name.trim() : "";
            if (!name) return null; // skip tools with empty/invalid name
            return {
                type: "function",
                function: {
                    name,
                    description: typeof record.description === "string" ? record.description : "",
                    parameters: normalizeToolSchema(record.input_schema)
                }
            };
        }).filter((tool)=>Boolean(tool));
        if (normalizedTools.length > 0) {
            result.tools = normalizedTools;
        }
    }
    // Tool choice
    if (body.tool_choice) {
        result.tool_choice = convertToolChoice(body.tool_choice, useNativeResponsesWebSearch && hasClaudeServerWebSearchTool(body.tools));
    }
    // Reasoning effort: map Claude-side thinking controls to OpenAI reasoning_effort.
    // Priority: output_config.effort (Claude Code) > thinking.budget_tokens (Claude native).
    // Budget buckets match the reverse mapping in thinkingBudget.ts::setCustomBudget.
    const outputEffort = normalizeOpenAIReasoningEffort(body.output_config?.effort) || "";
    if (outputEffort) {
        result.reasoning_effort = outputEffort;
    } else if (body.thinking?.type === "enabled" && typeof body.thinking.budget_tokens === "number") {
        const budget = body.thinking.budget_tokens;
        if (budget <= 0) {
        // disabled — leave reasoning_effort unset
        } else if (budget <= 1024) {
            result.reasoning_effort = "low";
        } else if (budget <= 10240) {
            result.reasoning_effort = "medium";
        } else if (budget < 131072) {
            result.reasoning_effort = "high";
        } else {
            result.reasoning_effort = "xhigh";
        }
    }
    return result;
}
// #4714: Re-group tool result messages so every role:"tool" message sits
// immediately after the assistant message whose tool_calls issued it, in
// tool_calls order. Claude Code can issue parallel tool_use in one assistant turn
// but have their tool_result blocks arrive across SEPARATE user turns with
// interleaved text; the naive conversion then left a role:"tool" stranded after a
// user message, which OpenAI-compatible upstreams reject with 400 "Messages with
// role 'tool' must be a response to a preceding message with 'tool_calls'".
// Tool messages whose tool_call_id matches no assistant.tool_calls are dropped here
// (supersedes the standalone #4385 orphan filter — same drop behavior, plus ordering).
function regroupToolMessages(messages) {
    // tool_call_id -> index of the assistant message that issued it (first wins).
    const callIdToAssistant = new Map();
    messages.forEach((msg, idx)=>{
        if (msg.role === "assistant" && Array.isArray(msg.tool_calls)) {
            for (const tc of msg.tool_calls){
                if (tc.id && !callIdToAssistant.has(String(tc.id))) {
                    callIdToAssistant.set(String(tc.id), idx);
                }
            }
        }
    });
    // Collect tool messages per assistant index, keyed by tool_call_id (first result wins).
    const toolsByAssistant = new Map();
    for (const msg of messages){
        if (msg.role !== "tool") continue;
        const callId = String(msg.tool_call_id ?? "");
        const assistantIdx = callIdToAssistant.get(callId);
        if (assistantIdx === undefined) continue; // orphan -> drop
        let group = toolsByAssistant.get(assistantIdx);
        if (!group) {
            group = new Map();
            toolsByAssistant.set(assistantIdx, group);
        }
        if (!group.has(callId)) group.set(callId, msg);
    }
    // Rebuild: keep non-tool messages in order; attach each assistant's tool results
    // immediately after it, ordered by the assistant's own tool_calls sequence.
    const out = [];
    messages.forEach((msg, idx)=>{
        if (msg.role === "tool") return; // moved into its assistant's group
        out.push(msg);
        if (msg.role === "assistant" && Array.isArray(msg.tool_calls)) {
            const group = toolsByAssistant.get(idx);
            if (group) {
                for (const tc of msg.tool_calls){
                    const tool = tc.id ? group.get(String(tc.id)) : undefined;
                    if (tool) out.push(tool);
                }
            }
        }
    });
    return out;
}
// Fix missing tool responses - add empty responses for tool_calls without responses
function fixMissingToolResponses(messages) {
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        if (msg.role === "assistant" && msg.tool_calls && msg.tool_calls.length > 0) {
            const toolCallIds = msg.tool_calls.map((tc)=>tc.id);
            // Collect all tool response IDs that IMMEDIATELY follow this assistant message
            const respondedIds = new Set();
            let insertPosition = i + 1;
            for(let j = i + 1; j < messages.length; j++){
                const nextMsg = messages[j];
                if (nextMsg.role === "tool" && nextMsg.tool_call_id) {
                    respondedIds.add(nextMsg.tool_call_id);
                    insertPosition = j + 1;
                } else {
                    break;
                }
            }
            // Find missing responses and insert them
            const missingIds = toolCallIds.filter((id)=>!respondedIds.has(id));
            if (missingIds.length > 0) {
                const missingResponses = missingIds.map((id)=>({
                        role: "tool",
                        tool_call_id: id,
                        content: "[No response received]"
                    }));
                messages.splice(insertPosition, 0, ...missingResponses);
                i = insertPosition + missingResponses.length - 1;
            }
        }
    }
}
// Convert single Claude message - returns single message or array of messages
function convertClaudeMessage(msg, preserveCacheControl = false) {
    // Preserve system role for mid-conversation system turns (#6954).
    // Previously any role that wasn't "user" or "tool" was mapped to "assistant",
    // which misattributed system messages as assistant output.
    const role = msg.role === "user" || msg.role === "tool" ? "user" : msg.role === "system" ? "system" : "assistant";
    // Simple string content
    if (typeof msg.content === "string") {
        return {
            role,
            content: msg.content
        };
    }
    // Array content
    if (Array.isArray(msg.content)) {
        const parts = [];
        const toolCalls = [];
        const toolResults = [];
        let reasoningContent = null;
        for (const block of msg.content){
            switch(block.type){
                case "text":
                    {
                        const textPart = {
                            type: "text",
                            text: block.text
                        };
                        // #2069 — carry the client's cache_control breakpoint through to
                        // caching-capable OpenAI-format providers (DashScope/alibaba, etc.).
                        if (preserveCacheControl && block.cache_control !== undefined) {
                            textPart.cache_control = block.cache_control;
                        }
                        parts.push(textPart);
                        break;
                    }
                case "image":
                    if (block.source?.type === "base64") {
                        parts.push({
                            type: "image_url",
                            image_url: {
                                url: `data:${block.source.media_type};base64,${block.source.data}`
                            }
                        });
                    } else if (block.source?.type === "url" && typeof block.source.url === "string") {
                        parts.push({
                            type: "image_url",
                            image_url: {
                                url: block.source.url
                            }
                        });
                    }
                    break;
                case "thinking":
                    reasoningContent = block.thinking || block.text || "";
                    break;
                case "redacted_thinking":
                    if (reasoningContent == null) {
                        reasoningContent = "";
                    }
                    break;
                case "tool_use":
                    toolCalls.push({
                        id: block.id,
                        type: "function",
                        function: {
                            name: block.name,
                            arguments: typeof block.input === "string" ? block.input : JSON.stringify(block.input || {})
                        }
                    });
                    break;
                case "tool_result":
                    let resultContent = "";
                    if (typeof block.content === "string") {
                        resultContent = block.content;
                    } else if (Array.isArray(block.content)) {
                        // Keep text in the tool message; lift any images out as a following user
                        // turn (OpenAI `tool` messages can't carry images). Without this, an
                        // image-only tool_result is JSON.stringify'd → base64 as text, which
                        // causes "input exceeds the context window" errors in OpenAI-protocol
                        // upstreams (port of decolua/9router#2123 by alican532).
                        const textParts = [];
                        let hasImage = false;
                        for (const c of block.content){
                            if (c.type === "text") {
                                textParts.push(c.text);
                            } else if (c.type === "image" && c.source?.type === "base64") {
                                parts.push({
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${c.source.media_type};base64,${c.source.data}`
                                    }
                                });
                                hasImage = true;
                            }
                        }
                        resultContent = textParts.join("\n") || (hasImage ? "[tool returned an image; see attached]" : JSON.stringify(block.content));
                    } else if (block.content) {
                        resultContent = JSON.stringify(block.content);
                    }
                    toolResults.push({
                        role: "tool",
                        tool_call_id: block.tool_use_id,
                        content: resultContent
                    });
                    break;
            }
        }
        // If has tool results, return array of tool messages
        if (toolResults.length > 0) {
            if (parts.length > 0) {
                const textContent = parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts;
                return [
                    ...toolResults,
                    {
                        role: "user",
                        content: textContent
                    }
                ];
            }
            return toolResults;
        }
        // If has tool calls, return assistant message with tool_calls
        if (toolCalls.length > 0) {
            const result = {
                role: "assistant"
            };
            if (parts.length > 0) {
                result.content = parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts;
            }
            result.tool_calls = toolCalls;
            if (reasoningContent !== null) {
                result.reasoning_content = reasoningContent;
            }
            return result;
        }
        // Return content
        if (parts.length > 0) {
            const result = {
                role,
                content: parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts
            };
            if (reasoningContent !== null && role === "assistant") {
                result.reasoning_content = reasoningContent;
            }
            return result;
        }
        // Empty content array
        if (msg.content.length === 0) {
            const result = {
                role,
                content: ""
            };
            if (reasoningContent !== null && role === "assistant") {
                result.reasoning_content = reasoningContent;
            }
            return result;
        }
        if (reasoningContent !== null && role === "assistant") {
            return {
                role,
                content: "",
                reasoning_content: reasoningContent
            };
        }
    }
    return null;
}
// Convert tool choice
function convertToolChoice(choice, hasServerWebSearch = false) {
    if (!choice) return "auto";
    if (typeof choice === "string") return choice;
    switch(choice.type){
        case "auto":
            return "auto";
        case TOOL_CHOICE_ANY:
            return "required";
        case "tool":
            if (hasServerWebSearch && choice.name === "web_search") {
                return {
                    type: "web_search"
                };
            }
            return {
                type: "function",
                function: {
                    name: choice.name
                }
            };
        default:
            return "auto";
    }
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, claudeToOpenAIRequest, null);
}),
"[project]/open-sse/translator/request/openai-to-claude/thinkingBudget.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fitThinkingToMaxTokens",
    ()=>fitThinkingToMaxTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
;
// Anthropic constraints for the thinking + max_tokens contract:
//   - thinking.budget_tokens must be >= 1024 when thinking is enabled
//   - max_tokens must be > thinking.budget_tokens (covers thinking + response)
//   - max_tokens must be <= model output cap (e.g. 128000 for Opus 4.7)
const MIN_CLAUDE_THINKING_BUDGET = 1024;
const MIN_RESPONSE_ROOM = 1024;
function safeCapMaxOutputTokens(model) {
    try {
        const cap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMaxOutputTokens"])(model);
        return typeof cap === "number" && cap > 0 ? cap : null;
    } catch  {
        return null;
    }
}
function fitThinkingToMaxTokens(model, callerMaxTokens, thinking) {
    const modelCap = safeCapMaxOutputTokens(model);
    const requestedBudget = Number(thinking?.budget_tokens) || 0;
    // No budgeted thinking — just cap max_tokens to the model output ceiling.
    if (!thinking || requestedBudget <= 0) {
        return {
            maxTokens: modelCap === null ? Math.max(callerMaxTokens, 1) : Math.min(Math.max(callerMaxTokens, 1), modelCap),
            thinking
        };
    }
    let responseRoom = Math.max(callerMaxTokens, MIN_RESPONSE_ROOM);
    let target = modelCap === null ? responseRoom + requestedBudget : Math.min(responseRoom + requestedBudget, modelCap);
    let fittedBudget = target - responseRoom;
    // If the cap squeezed thinking below Anthropic's floor, try shrinking
    // response room to MIN_RESPONSE_ROOM to recover budget.
    if (fittedBudget < MIN_CLAUDE_THINKING_BUDGET && responseRoom > MIN_RESPONSE_ROOM) {
        responseRoom = MIN_RESPONSE_ROOM;
        target = modelCap === null ? responseRoom + requestedBudget : Math.min(responseRoom + requestedBudget, modelCap);
        fittedBudget = target - responseRoom;
    }
    // Cap too tight for any thinking — disable rather than send an invalid request.
    if (fittedBudget < MIN_CLAUDE_THINKING_BUDGET) {
        return {
            maxTokens: modelCap ?? Math.max(callerMaxTokens, 1),
            thinking: undefined
        };
    }
    const adjustedThinking = {
        ...thinking
    };
    if (fittedBudget < requestedBudget) {
        adjustedThinking.budget_tokens = fittedBudget;
    }
    return {
        maxTokens: target,
        thinking: adjustedThinking
    };
}
}),
"[project]/open-sse/translator/request/openai-to-claude/toolResultAdjacency.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "enforceToolResultAdjacency",
    ()=>enforceToolResultAdjacency
]);
function enforceToolResultAdjacency(messages) {
    const assistantByToolUseId = indexAssistantToolUses(messages);
    const resultsByAssistant = new Map();
    const strippedMessages = [];
    for (const msg of messages){
        stripAndCollectToolResults(msg, assistantByToolUseId, resultsByAssistant, strippedMessages);
    }
    return insertAdjacentToolResults(strippedMessages, resultsByAssistant);
}
function indexAssistantToolUses(messages) {
    const assistantByToolUseId = new Map();
    for (const msg of messages){
        if (msg.role !== "assistant" || !Array.isArray(msg.content)) continue;
        for (const block of msg.content){
            if (block.type === "tool_use" && block.id && !assistantByToolUseId.has(String(block.id))) {
                assistantByToolUseId.set(String(block.id), msg);
            }
        }
    }
    return assistantByToolUseId;
}
function stripAndCollectToolResults(msg, assistantByToolUseId, resultsByAssistant, strippedMessages) {
    if (msg.role !== "user" || !Array.isArray(msg.content)) {
        strippedMessages.push(msg);
        return;
    }
    const remainingBlocks = [];
    for (const block of msg.content){
        if (block.type !== "tool_result") {
            remainingBlocks.push(block);
            continue;
        }
        if (!collectMatchedToolResult(block, assistantByToolUseId, resultsByAssistant)) {
            const toolUseId = typeof block.tool_use_id === "string" ? block.tool_use_id : "";
            const serialized = typeof block.content === "string" ? block.content : JSON.stringify(block.content ?? "") ?? "";
            remainingBlocks.push({
                type: "text",
                text: `[Unpaired tool result ${toolUseId || "unknown"}]\n${serialized}`
            });
        }
    }
    if (remainingBlocks.length > 0) {
        strippedMessages.push({
            ...msg,
            content: remainingBlocks
        });
    }
}
function collectMatchedToolResult(block, assistantByToolUseId, resultsByAssistant) {
    const toolUseId = typeof block.tool_use_id === "string" ? block.tool_use_id : "";
    const assistant = toolUseId ? assistantByToolUseId.get(toolUseId) : undefined;
    if (!assistant) return false;
    const grouped = resultsByAssistant.get(assistant) ?? [];
    if (grouped.some((toolResult)=>toolResult.tool_use_id === toolUseId)) return false;
    grouped.push(block);
    resultsByAssistant.set(assistant, grouped);
    return true;
}
function insertAdjacentToolResults(messages, resultsByAssistant) {
    const reordered = [];
    for (const msg of messages){
        reordered.push(msg);
        const adjacentResults = orderedResultsForAssistant(msg, resultsByAssistant);
        if (adjacentResults.length > 0) reordered.push({
            role: "user",
            content: adjacentResults
        });
    }
    return reordered;
}
function orderedResultsForAssistant(msg, resultsByAssistant) {
    if (msg.role !== "assistant" || !Array.isArray(msg.content)) return [];
    const grouped = resultsByAssistant.get(msg) ?? [];
    return msg.content.flatMap((block)=>{
        if (block.type !== "tool_use" || !block.id) return [];
        return grouped.filter((toolResult)=>toolResult.tool_use_id === String(block.id));
    });
}
}),
"[project]/open-sse/translator/request/openai-to-claude/sanitizeToolResultId.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeToolResultId",
    ()=>sanitizeToolResultId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [instrumentation] (ecmascript)");
;
function sanitizeToolResultId(rawId) {
    if (!rawId) return null;
    // sanitizeToolId() takes a string; a non-string id would previously reach `.replace()`
    // and throw. Coerce instead so a numeric id (some clients send one) sanitizes normally.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolId"])(typeof rawId === "string" ? rawId : String(rawId));
}
}),
"[project]/open-sse/translator/request/openai-to-claude.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLAUDE_OAUTH_TOOL_PREFIX",
    ()=>CLAUDE_OAUTH_TOOL_PREFIX,
    "normalizeContentToString",
    ()=>normalizeContentToString,
    "openaiToClaudeRequest",
    ()=>openaiToClaudeRequest,
    "openaiToClaudeRequestForAntigravity",
    ()=>openaiToClaudeRequestForAntigravity,
    "stripEmptyTextBlocks",
    ()=>stripEmptyTextBlocks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
// CLAUDE_SYSTEM_PROMPT import removed — no longer injected unconditionally (#1966/#2130)
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/maxTokensHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$jsonUtil$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/jsonUtil.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/claudeHelper.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/defaultThinkingSignature.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-claude/thinkingBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2f$toolResultAdjacency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-claude/toolResultAdjacency.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2f$sanitizeToolResultId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-claude/sanitizeToolResultId.ts [instrumentation] (ecmascript)");
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
// Reasoning-effort levels Anthropic accepts on `output_config.effort`. Used to steer
// adaptive-only Claude models (Opus 4.7+/Fable 5) without ever emitting a manual budget.
const ADAPTIVE_EFFORT_LEVELS = new Set([
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
]);
const CLAUDE_OAUTH_TOOL_PREFIX = "proxy_";
const CLAUDE_TOOL_CHOICE_REQUIRED = "an" + "y";
const COPILOT_REASONING_SUMMARY_MARKER = "_omnirouteCopilotReasoningSummary";
function wantsCopilotSummarizedThinking(body) {
    return body?.[COPILOT_REASONING_SUMMARY_MARKER] === "summarized";
}
function applyCopilotSummarizedThinkingDisplay(thinking, body) {
    if (!thinking || !wantsCopilotSummarizedThinking(body) || thinking.type === "disabled") {
        return thinking;
    }
    return {
        ...thinking,
        display: "summarized"
    };
}
;
function stripEmptyTextBlocks(content) {
    if (!Array.isArray(content)) return content ?? [];
    return content.filter((block)=>{
        if (block && typeof block === "object" && block.type === "text") {
            const text = block.text;
            if (text === "" || text == null) return false;
        }
        return true;
    }).map((block)=>{
        if (block && typeof block === "object" && block.type === "tool_result" && Array.isArray(block.content)) {
            // Recurse into nested tool_result.content
            return {
                ...block,
                content: stripEmptyTextBlocks(block.content)
            };
        }
        return block;
    });
}
function normalizeContentToString(content) {
    if (!content) return "";
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.filter((b)=>b.type === "text").map((b)=>String(b.text ?? "")).join("\n");
    }
    return "";
}
function openaiToClaudeRequest(model, body, stream, credentials = null) {
    // Check if tool prefix should be disabled (configured per-provider or global)
    const disableToolPrefix = body?._disableToolPrefix === true;
    const routedProvider = credentials?._provider;
    const isKimiCoding = routedProvider === "kimi-coding" || routedProvider === "kimi-coding-apikey";
    // Tool name mapping for Claude OAuth (capitalizedName → originalName)
    const toolNameMap = new Map();
    const result = {
        model: model,
        max_tokens: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adjustMaxTokens"])(body),
        stream: stream,
        messages: []
    };
    // Temperature
    //
    // Claude's Messages API rejects `temperature` when extended thinking is active.
    // Two cases where thinking is on:
    //   (a) Caller passes `body.thinking` or `body.reasoning_effort` (handled later —
    //       `result.thinking` becomes truthy, and we strip temperature at the end).
    //   (b) The request targets Claude OAuth (claude-code), which always sends
    //       `Anthropic-Beta: ...,interleaved-thinking-2025-05-14,...` in headers.
    //       The model is forced into thinking server-side, but neither `body.thinking`
    //       nor `result.thinking` will be set, so we detect this by model name. This
    //       affects claude-opus-4.x and claude-sonnet-4.x (the families that support
    //       extended thinking).
    //
    // For models that don't force thinking (haiku, older sonnets), preserve temperature.
    // Note: Opus 4.7+/Fable 5 already drop sampling params upstream of the translator via
    // the registry `unsupportedParams` strip; this covers the remaining 4.x families.
    const modelForcesThinking = /claude-(?:opus|sonnet)-4/i.test(String(model));
    if (body.temperature !== undefined && !modelForcesThinking) {
        result.temperature = body.temperature;
    }
    if (body.temperature === undefined && body.top_p !== undefined) {
        result.top_p = body.top_p;
    }
    if (body.stop !== undefined) {
        result.stop_sequences = Array.isArray(body.stop) ? body.stop : [
            body.stop
        ];
    }
    // Thinking configuration
    // NOTE: computed BEFORE message-block conversion (below) so that
    // `getContentBlocksFromMessage` knows whether the outbound request actually has
    // extended thinking enabled — required to correctly gate the `redacted_thinking`
    // replay-placeholder injection (#5945). This block has no dependency on
    // `result.messages`/`toolNameMap`, so moving it earlier is safe.
    if (isKimiCoding) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyKimiCodingThinking"])(result, body);
    } else if (body.thinking) {
        result.thinking = {
            type: body.thinking.type || "enabled",
            ...body.thinking.budget_tokens && {
                budget_tokens: body.thinking.budget_tokens
            },
            ...body.thinking.max_tokens && {
                max_tokens: body.thinking.max_tokens
            }
        };
    } else if (body.reasoning_effort) {
        // Convert OpenAI reasoning_effort to Claude thinking format (#627)
        // Clients like OpenCode send reasoning_effort via @ai-sdk/openai-compatible
        const requestedEffort = String(body.reasoning_effort).toLowerCase();
        const normalizedEffort = requestedEffort === "max" && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsClaudeMaxEffort"])(model) ? "high" : requestedEffort === "xhigh" && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsXHighEffort"])("claude", model) ? "high" : requestedEffort;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAdaptiveThinkingOnly"])(model)) {
            // Opus 4.7+/Fable 5 removed manual extended thinking: a fixed `budget_tokens`
            // (or `type:"enabled"`) is a hard 400. Steer EVERY level via adaptive +
            // output_config.effort instead of the budget buckets below. Unrecognized levels
            // leave thinking unset so the model keeps its adaptive default rather than 400ing
            // on an invalid effort value.
            if (ADAPTIVE_EFFORT_LEVELS.has(normalizedEffort)) {
                result.thinking = {
                    type: "adaptive"
                };
                result.output_config = {
                    ...result.output_config || {},
                    effort: normalizedEffort
                };
            }
        } else if (normalizedEffort === "max" || normalizedEffort === "xhigh") {
            result.thinking = {
                type: "adaptive"
            };
            result.output_config = {
                ...result.output_config || {},
                effort: normalizedEffort
            };
        } else {
            const effortBudgetMap = {
                low: 1024,
                medium: 10240,
                high: 131072,
                max: 131072
            };
            const budget = effortBudgetMap[normalizedEffort];
            if (budget !== undefined && budget > 0) {
                result.thinking = {
                    type: "enabled",
                    budget_tokens: budget
                };
            }
        }
    }
    // Fit thinking budget within the model's output cap and ensure
    // max_tokens > budget_tokens for all thinking configurations (#627).
    // Replaces the previous unconditional `budget + 8192` inflation, which
    // could exceed model caps (e.g. Opus 4.7's 128000 ceiling) and trigger
    // HTTP 400 from Anthropic.
    if (!isKimiCoding) {
        const fitted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fitThinkingToMaxTokens"])(model, Number(result.max_tokens) || 0, result.thinking);
        result.max_tokens = fitted.maxTokens;
        if (fitted.thinking === undefined) {
            delete result.thinking;
        } else {
            result.thinking = applyCopilotSummarizedThinkingDisplay(fitted.thinking, body);
        }
    }
    delete result[COPILOT_REASONING_SUMMARY_MARKER];
    // Final guard: Claude rejects `temperature` whenever extended thinking is
    // enabled. If `result.thinking` was set above from `body.thinking` or
    // `body.reasoning_effort` (manual budget or adaptive effort), drop temperature
    // defensively. The model-name strip earlier already covers Claude OAuth's
    // forced-thinking case (claude-opus-4.x / claude-sonnet-4.x).
    if (result.thinking && result.temperature !== undefined) {
        delete result.temperature;
    }
    // Whether the OUTBOUND request actually has extended thinking enabled. Anthropic's
    // schema only requires a precursor thinking/redacted_thinking block before a tool_use
    // block when thinking mode is active for THIS request — never unconditionally (#5945).
    const thinkingEnabledForRequest = Boolean(result.thinking) && result.thinking.type !== "disabled";
    // Messages
    const systemParts = [];
    if (body.messages && Array.isArray(body.messages)) {
        // Extract system messages (T15: handle both string and array content)
        // Also treat "developer" role as system — OpenAI Responses API uses developer role
        // for system-level instructions, and it must reach the Claude system field, not become an assistant turn.
        for (const msg of body.messages){
            if (msg.role === "system" || msg.role === "developer") {
                systemParts.push(typeof msg.content === "string" ? msg.content : normalizeContentToString(msg.content));
            }
        }
        // Filter out system/developer messages for separate processing
        const nonSystemMessages = body.messages.filter((m)=>m.role !== "system" && m.role !== "developer");
        // Process messages with merging logic
        // CRITICAL: tool_result must be in separate message immediately after tool_use
        let currentRole = undefined;
        let currentParts = [];
        const flushCurrentMessage = ()=>{
            if (currentRole && currentParts.length > 0) {
                result.messages.push({
                    role: currentRole,
                    content: currentParts
                });
                currentParts = [];
            }
        };
        for (const msg of nonSystemMessages){
            const newRole = msg.role === "user" || msg.role === "tool" ? "user" : "assistant";
            const blocks = getContentBlocksFromMessage(msg, toolNameMap, disableToolPrefix, thinkingEnabledForRequest, isKimiCoding);
            const hasToolUse = blocks.some((b)=>b.type === "tool_use");
            const hasToolResult = blocks.some((b)=>b.type === "tool_result");
            // Separate tool_result from other content
            if (hasToolResult) {
                const toolResultBlocks = blocks.filter((b)=>b.type === "tool_result");
                const otherBlocks = blocks.filter((b)=>b.type !== "tool_result");
                flushCurrentMessage();
                if (toolResultBlocks.length > 0) {
                    result.messages.push({
                        role: "user",
                        content: toolResultBlocks
                    });
                }
                if (otherBlocks.length > 0) {
                    currentRole = newRole;
                    currentParts.push(...otherBlocks);
                }
                continue;
            }
            if (currentRole !== newRole) {
                flushCurrentMessage();
                currentRole = newRole;
            }
            currentParts.push(...blocks);
            if (hasToolUse) {
                flushCurrentMessage();
            }
        }
        flushCurrentMessage();
        // Remove assistant messages with empty content (can happen when all tool_use blocks were skipped)
        result.messages = result.messages.filter((msg)=>{
            if (msg.role === "assistant" && Array.isArray(msg.content) && msg.content.length === 0) {
                return false;
            }
            return true;
        });
        result.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2f$toolResultAdjacency$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["enforceToolResultAdjacency"])(result.messages);
        // Add cache_control to last assistant message
        for(let i = result.messages.length - 1; i >= 0; i--){
            const message = result.messages[i];
            if (message.role === "assistant" && Array.isArray(message.content) && message.content.length > 0) {
                const lastBlock = message.content[message.content.length - 1];
                if (lastBlock) {
                    lastBlock.cache_control = {
                        type: "ephemeral"
                    };
                    break;
                }
            }
        }
    }
    // Tools - convert from OpenAI format to Claude format with prefix for OAuth
    if (body.tools && Array.isArray(body.tools)) {
        result.tools = body.tools.map((tool)=>{
            // Function-shaped tools arrive in two flavors from real clients:
            //   (a) openai-spec: { type: "function", function: { name, ... } }
            //   (b) bare/loose:  { function: { name, ... } }   (no parent `type`)
            // Unwrap `tool.function` whenever it is present, regardless of the
            // parent `type` field — some OpenAI-shape clients omit the wrapper's
            // `type: "function"` entirely. Previously that bare shape fell
            // through to `toolData = tool` (the wrapper itself, with no `.name`),
            // producing an empty `originalName` and silently dropping the tool.
            const toolData = tool.function ?? tool;
            const originalName = typeof toolData.name === "string" ? toolData.name.trim() : "";
            if (!originalName) {
                return null;
            }
            // Claude OAuth requires prefixed tool names to avoid conflicts
            // When prefix is disabled (non-Claude backends), use original name
            const toolName = disableToolPrefix ? originalName : CLAUDE_OAUTH_TOOL_PREFIX + originalName;
            // Store mapping for response translation (prefixed → original)
            if (!disableToolPrefix) {
                toolNameMap.set(toolName, originalName);
            }
            // Normalize input_schema: Anthropic requires `properties` when type is "object" (#595).
            // MCP tools (e.g. pencil, computer_use) may omit properties on object-type schemas.
            const rawSchema = toolData.parameters || toolData.input_schema || {
                type: "object",
                properties: {},
                required: []
            };
            const normalizedSchema = rawSchema.type === "object" && !rawSchema.properties ? {
                ...rawSchema,
                properties: {}
            } : rawSchema;
            return {
                name: toolName,
                description: toolData.description || "",
                input_schema: normalizedSchema
            };
        }).filter((tool)=>Boolean(tool));
        // Filter out tools with empty names (would cause Claude 400 error)
        result.tools = result.tools.filter((tool)=>tool.name && tool.name?.trim());
        // Cache breakpoint on the last non-defer-loading tool — Anthropic
        // rejects cache_control on defer_loading tools.
        for(let i = result.tools.length - 1; i >= 0; i--){
            if (!result.tools[i].defer_loading) {
                result.tools[i].cache_control = {
                    type: "ephemeral",
                    ttl: "1h"
                };
                break;
            }
        }
    }
    // Tool choice
    if (body.tool_choice) {
        result.tool_choice = convertOpenAIToolChoice(body.tool_choice);
    }
    // response_format: inject JSON structured output instruction into system prompt.
    // Claude doesn't natively support response_format, so we insert a system-level instruction.
    // NOTE: systemParts are consumed later (after this block) — they're accumulated here.
    if (body.response_format) {
        const fmt = body.response_format;
        if (fmt.type === "json_schema" && fmt.json_schema?.schema) {
            const schemaJson = JSON.stringify(fmt.json_schema.schema, null, 2);
            systemParts.push(`You must respond with valid JSON that strictly follows this JSON schema:\n\`\`\`json\n${schemaJson}\n\`\`\`\nRespond ONLY with the JSON object, no other text.`);
        } else if (fmt.type === "json_object") {
            systemParts.push("You must respond with valid JSON. Respond ONLY with a JSON object, no other text.");
        }
    }
    // System messages and cache_control
    // Fix #2130: Preserve body.system when present (Claude Code sends system as native
    // Anthropic array through the /chat/completions endpoint). Without this, the system
    // prompt is silently dropped when no role="system" messages exist in body.messages.
    if (systemParts.length > 0) {
        const systemText = systemParts.join("\n");
        const systemBlock = {
            type: "text",
            text: systemText,
            cache_control: {
                type: "ephemeral",
                ttl: "1h"
            }
        };
        // Merge with existing body.system if present
        if (Array.isArray(body.system)) {
            result.system = [
                ...body.system,
                systemBlock
            ];
        } else if (typeof body.system === "string" && body.system.length > 0) {
            result.system = [
                {
                    type: "text",
                    text: body.system
                },
                systemBlock
            ];
        } else {
            result.system = [
                systemBlock
            ];
        }
    } else if (body.system) {
        // No role="system" messages, but body.system exists — pass through as-is
        result.system = Array.isArray(body.system) ? body.system : [
            {
                type: "text",
                text: String(body.system)
            }
        ];
    }
    // Attach toolNameMap to result for response translation
    if (toolNameMap.size > 0) {
        result._toolNameMap = toolNameMap;
    }
    // Empty-messages guard. Claude's Messages API rejects an empty `messages`
    // array with `400 messages: at least one message is required`. This happens
    // when the incoming OpenAI request carried only `system`/`developer` turns
    // (e.g. an all-system compaction or title-generation request from a client
    // like OpenCode): those are hoisted into `result.system` above, leaving
    // `messages` empty. Synthesize a minimal user turn so the request stays
    // valid — the system instructions still drive the response. (#5245)
    if (result.messages.length === 0) {
        result.messages.push({
            role: "user",
            content: [
                {
                    type: "text",
                    text: "."
                }
            ]
        });
    }
    return result;
}
// Get content blocks from single message
function getContentBlocksFromMessage(msg, toolNameMap = new Map(), disableToolPrefix = false, thinkingEnabledForRequest = false, isKimiCoding = false) {
    const blocks = [];
    if (msg.role === "tool") {
        const sanitizedToolUseId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2f$sanitizeToolResultId$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolResultId"])(msg.tool_call_id); // #7705
        if (!sanitizedToolUseId) return blocks;
        // T02: Strip empty text blocks from nested tool_result content to avoid Anthropic 400
        const toolContent = Array.isArray(msg.content) ? stripEmptyTextBlocks(msg.content) : msg.content;
        blocks.push({
            type: "tool_result",
            tool_use_id: sanitizedToolUseId,
            content: toolContent
        });
    } else if (msg.role === "user") {
        if (typeof msg.content === "string") {
            if (msg.content) {
                blocks.push({
                    type: "text",
                    text: msg.content
                });
            }
        } else if (Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (part.type === "text" && part.text) {
                    blocks.push({
                        type: "text",
                        text: part.text
                    });
                } else if (part.type === "tool_result") {
                    // Skip tool_result with no tool_use_id (would be useless and may cause errors)
                    if (!part.tool_use_id) continue;
                    // T02: strip empty text blocks from nested content before passing to Anthropic
                    const resultContent = Array.isArray(part.content) ? stripEmptyTextBlocks(part.content) : part.content;
                    blocks.push({
                        type: "tool_result",
                        tool_use_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolId"])(part.tool_use_id),
                        content: resultContent,
                        ...part.is_error && {
                            is_error: part.is_error
                        }
                    });
                } else if (part.type === "image_url") {
                    const url = part.image_url.url;
                    const match = url.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) {
                        blocks.push({
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: match[1],
                                data: match[2]
                            }
                        });
                    } else if (typeof url === "string" && url.trim()) {
                        blocks.push({
                            type: "image",
                            source: {
                                type: "url",
                                url
                            }
                        });
                    }
                } else if (part.type === "image" && part.source) {
                    blocks.push({
                        type: "image",
                        source: part.source
                    });
                } else if (part.type === "image" && typeof part.image === "string") {
                    // AI SDK-style image part: { type: "image", image: "data:...;base64,..." } (#1330)
                    const url = part.image;
                    const match = url.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) {
                        blocks.push({
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: match[1],
                                data: match[2]
                            }
                        });
                    } else if (url.trim()) {
                        blocks.push({
                            type: "image",
                            source: {
                                type: "url",
                                url
                            }
                        });
                    }
                } else if (part.type === "file" && (part.file?.file_data || part.file?.data)) {
                    // OpenAI Chat Completions file block:
                    // {type:"file", file:{filename, file_data:"data:<mime>;base64,..."}}.
                    // Map PDFs to a Claude document block and image mimes to an image block so the
                    // attachment reaches the model instead of being silently dropped. Claude has no
                    // native video input, so non-pdf/non-image files are skipped here.
                    const fileData = part.file.file_data || part.file.data;
                    const fmatch = typeof fileData === "string" ? fileData.match(/^data:([^;]+);base64,(.+)$/) : null;
                    if (fmatch) {
                        const mediaType = fmatch[1];
                        if (mediaType === "application/pdf") {
                            blocks.push({
                                type: "document",
                                source: {
                                    type: "base64",
                                    media_type: mediaType,
                                    data: fmatch[2]
                                },
                                ...part.file.filename ? {
                                    title: part.file.filename
                                } : {}
                            });
                        } else if (mediaType.startsWith("image/")) {
                            blocks.push({
                                type: "image",
                                source: {
                                    type: "base64",
                                    media_type: mediaType,
                                    data: fmatch[2]
                                }
                            });
                        }
                    } else if (typeof fileData === "string" && /^https?:\/\//i.test(fileData)) {
                        blocks.push({
                            type: "document",
                            source: {
                                type: "url",
                                url: fileData
                            },
                            ...part.file.filename ? {
                                title: part.file.filename
                            } : {}
                        });
                    }
                }
            }
        }
    } else if (msg.role === "assistant") {
        if (Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (part.type === "text" && part.text) {
                    blocks.push({
                        type: "text",
                        text: part.text
                    });
                } else if (part.type === "thinking" || part.type === "redacted_thinking") {
                    // #6953 — thinking blocks with signature:"" (empty string) come from non-Anthropic
                    // providers (codex/gpt-5.x).  Anthropic rejects replayed `thinking` blocks that
                    // carry a foreign or fabricated signature with HTTP 400.  Fabricating a default
                    // signature (the old behaviour) made the poisoning permanent: once a codex-served
                    // turn introduced a `signature:""` thinking block, every subsequent Anthropic leg
                    // attempt 400'd and the router silently fell back to codex forever.
                    //
                    // Fix: strip thinking blocks whose signature is the empty string — that explicit
                    // empty value is the hallmark of a synthesized block from a non-Anthropic provider.
                    // Thinking blocks with `signature: undefined` (field absent) are legitimate Claude-
                    // format messages and fall through to the DEFAULT_THINKING_CLAUDE_SIGNATURE fallback
                    // as before.
                    if (part.type === "thinking" && part.signature === "") {
                        continue; // drop — synthesized by non-Anthropic provider, no valid signature
                    }
                    if (part.type === "redacted_thinking" && part.data === "") {
                        continue; // drop — same: empty data from non-Anthropic provider
                    }
                    blocks.push({
                        ...part,
                        signature: part.signature || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"]
                    });
                } else if (part.type === "tool_use") {
                    // Tool name already has prefix from tool declarations, keep as-is
                    // CRITICAL: Skip tool_use blocks with empty name (causes Claude 400 error)
                    if (part.name && part.name.trim()) {
                        blocks.push({
                            type: "tool_use",
                            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolId"])(part.id),
                            name: part.name,
                            input: part.input
                        });
                    }
                }
            }
        } else if (msg.content) {
            const text = typeof msg.content === "string" ? msg.content : extractTextContent(msg.content);
            if (text) {
                blocks.push({
                    type: "text",
                    text
                });
            }
        }
        if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
            for (const tc of msg.tool_calls){
                if (tc.type === "function") {
                    // CRITICAL: Skip tool_calls with empty function name (causes Claude 400 error)
                    const fnName = tc.function?.name;
                    if (!fnName || !fnName.trim()) continue;
                    // Apply prefix to tool name (skip if disabled)
                    const toolName = disableToolPrefix ? fnName : CLAUDE_OAUTH_TOOL_PREFIX + fnName;
                    blocks.push({
                        type: "tool_use",
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolId"])(tc.id),
                        name: toolName,
                        input: tryParseJSON(tc.function.arguments)
                    });
                }
            }
        }
        // Add reasoning_content as a replay placeholder (OpenAI extended thinking format) —
        // ONLY when Anthropic's schema actually requires a precursor thinking block: the
        // outbound request has extended thinking enabled AND this assistant turn contains a
        // tool_use block (Anthropic rejects a tool_use turn without a preceding
        // thinking/redacted_thinking block when thinking is active). #5312 RC-D:
        // reasoning_content carries NO real Claude signature. Emitting a `thinking` block
        // with the fabricated DEFAULT signature makes Anthropic reject the replay with 400
        // "Invalid signature in thinking block" — and claudeHelper's latest-assistant guard
        // (prepareClaudeRequest) preserves it verbatim, so the fake signature leaks
        // upstream. Emit a signature-less redacted_thinking block instead (the same shape
        // prepareClaudeRequest produces for Anthropic-native replay, gated the same way at
        // claudeHelper.ts `thinkingEnabled && !hasThinking && hasToolUse`); Anthropic
        // accepts it without signature validation and non-Anthropic Claude-shape upstreams
        // re-hydrate the real text downstream from reasoningCache.
        // #5945: injecting this unconditionally — for ANY assistant turn carrying
        // reasoning_content, regardless of tool_use or thinking state — fabricates a content
        // block the client never sent. Some upstream clients (reported: Claude Sonnet 5 via
        // the "Pi" harness) detect the extra block and refuse the turn as prompt injection.
        // Drop reasoning_content silently when it is not required by the schema, mirroring
        // how other echo-only fields are dropped (see OPENAI_INCOMPATIBLE_ECHO_FIELDS).
        const hasThinkingBlock = blocks.some((b)=>b.type === "thinking" || b.type === "redacted_thinking");
        const hasToolUseBlock = blocks.some((b)=>b.type === "tool_use");
        if (isKimiCoding && typeof msg.reasoning_content === "string" && !hasThinkingBlock) {
            blocks.unshift({
                type: "thinking",
                thinking: msg.reasoning_content
            });
        } else if (msg.reasoning_content && thinkingEnabledForRequest && hasToolUseBlock && !hasThinkingBlock) {
            blocks.unshift({
                type: "redacted_thinking",
                data: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$defaultThinkingSignature$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_THINKING_CLAUDE_SIGNATURE"]
            });
        }
    }
    return blocks;
}
// Convert OpenAI tool choice to Claude format
function convertOpenAIToolChoice(choice) {
    if (!choice) return {
        type: "auto"
    };
    if (typeof choice === "object" && choice.type) {
        // OpenAI sends {type: "function", function: {name}} — convert to Claude {type: "tool", name}
        if (choice.type === "function" && choice.function?.name) {
            return {
                type: "tool",
                name: choice.function.name
            };
        }
        // Map OpenAI string types to Claude equivalents
        if (choice.type === "auto" || choice.type === "none") return {
            type: "auto"
        };
        if (choice.type === "required" || choice.type === "any") return {
            type: CLAUDE_TOOL_CHOICE_REQUIRED
        };
        // If type is "tool" already (Claude-native), pass through
        if (choice.type === "tool" && choice.name) return choice;
        // Fallback: unknown object type — default to auto to avoid 400 errors
        return {
            type: "auto"
        };
    }
    if (choice === "auto" || choice === "none") return {
        type: "auto"
    };
    if (choice === "required") return {
        type: CLAUDE_TOOL_CHOICE_REQUIRED
    };
    if (typeof choice === "object" && choice.function) {
        return {
            type: "tool",
            name: choice.function.name
        };
    }
    return {
        type: "auto"
    };
}
// Extract text from content
function extractTextContent(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.filter((c)=>c.type === "text").map((c)=>c.text).join("\n");
    }
    return "";
}
// Try parse JSON (passthrough fallback: return the raw input string on parse error).
function tryParseJSON(str) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$jsonUtil$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["safeParseJSON"])(str, str);
}
function stripCacheControl(value) {
    if (Array.isArray(value)) {
        return value.map((item)=>stripCacheControl(item));
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    const cleaned = {};
    for (const [key, child] of Object.entries(value)){
        if (key === "cache_control") continue;
        cleaned[key] = stripCacheControl(child);
    }
    return cleaned;
}
// OpenAI -> Claude format for Antigravity (without system prompt modifications)
function openaiToClaudeRequestForAntigravity(model, body, stream) {
    const result = stripCacheControl(openaiToClaudeRequest(model, body, stream));
    // Strip prefix from tool names for Antigravity (doesn't use Claude OAuth)
    if (result.tools && Array.isArray(result.tools)) {
        result.tools = result.tools.map((tool)=>{
            if (tool.name && tool.name.startsWith(CLAUDE_OAUTH_TOOL_PREFIX)) {
                return {
                    ...tool,
                    name: tool.name.slice(CLAUDE_OAUTH_TOOL_PREFIX.length)
                };
            }
            return tool;
        });
    }
    // Strip prefix from tool_use in messages
    if (result.messages && Array.isArray(result.messages)) {
        result.messages = result.messages.map((msg)=>{
            if (!msg.content || !Array.isArray(msg.content)) {
                return msg;
            }
            const updatedContent = msg.content.map((block)=>{
                const blockType = typeof block.type === "string" ? block.type : "";
                const blockName = typeof block.name === "string" ? block.name : "";
                if (blockType === "tool_use" && blockName && blockName.startsWith(CLAUDE_OAUTH_TOOL_PREFIX)) {
                    return {
                        ...block,
                        name: blockName.slice(CLAUDE_OAUTH_TOOL_PREFIX.length)
                    };
                }
                return block;
            });
            return {
                ...msg,
                content: updatedContent
            };
        });
    }
    return result;
}
;
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, openaiToClaudeRequest, null);
}),
"[project]/open-sse/translator/request/gemini-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "geminiToOpenAIRequest",
    ()=>geminiToOpenAIRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/maxTokensHelper.ts [instrumentation] (ecmascript)");
;
;
;
function geminiToOpenAIRequest(model, body, stream) {
    const result = {
        model: model,
        messages: [],
        stream: stream
    };
    // Generation config
    if (body.generationConfig) {
        const config = body.generationConfig;
        if (config.maxOutputTokens) {
            const tempBody = {
                max_tokens: config.maxOutputTokens,
                tools: body.tools
            };
            result.max_tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adjustMaxTokens"])(tempBody);
        }
        if (config.temperature !== undefined) {
            result.temperature = config.temperature;
        }
        if (config.topP !== undefined) {
            result.top_p = config.topP;
        }
    }
    // System instruction
    if (body.systemInstruction) {
        const systemText = extractGeminiText(body.systemInstruction);
        if (systemText) {
            result.messages.push({
                role: "system",
                content: systemText
            });
        }
    }
    // Convert contents to messages
    if (body.contents && Array.isArray(body.contents)) {
        for (const content of splitCoLocatedFunctionResponses(body.contents)){
            const converted = convertGeminiContentWithReasoning(content);
            if (converted) {
                result.messages.push(converted);
            }
        }
    }
    // Tools
    if (body.tools && Array.isArray(body.tools)) {
        result.tools = [];
        for (const tool of body.tools){
            if (tool.functionDeclarations) {
                for (const func of tool.functionDeclarations){
                    result.tools.push({
                        type: "function",
                        function: {
                            name: func.name,
                            description: func.description || "",
                            parameters: func.parameters || {
                                type: "object",
                                properties: {}
                            }
                        }
                    });
                }
            }
        }
    }
    return result;
}
// Convert Gemini content to OpenAI message
// convertGeminiContent() early-returns the tool message on the first
// `functionResponse` part in a content, dropping any co-located parts
// (another functionCall, or trailing text). Gemini clients can send those
// co-located. Pre-split each such content into: one single-part content per
// functionResponse (each early-returns cleanly as a tool message, emitted
// first to keep tool-result-before-next-turn ordering) plus one content for
// the remaining non-functionResponse parts.
function splitCoLocatedFunctionResponses(contents) {
    const out = [];
    for (const content of contents){
        if (!content || !Array.isArray(content.parts)) {
            out.push(content);
            continue;
        }
        const hasFunctionResponse = content.parts.some((p)=>p && p.functionResponse);
        if (!hasFunctionResponse) {
            out.push(content);
            continue;
        }
        for (const part of content.parts){
            if (part && part.functionResponse) {
                out.push({
                    ...content,
                    parts: [
                        part
                    ]
                });
            }
        }
        const nonFRParts = content.parts.filter((p)=>!(p && p.functionResponse));
        if (nonFRParts.length > 0) {
            out.push({
                ...content,
                parts: nonFRParts
            });
        }
    }
    return out;
}
function convertGeminiContent(content) {
    const role = content.role === "user" ? "user" : "assistant";
    if (!content.parts || !Array.isArray(content.parts)) {
        return null;
    }
    const parts = [];
    const toolCalls = [];
    for (const part of content.parts){
        if (part.text !== undefined) {
            parts.push({
                type: "text",
                text: part.text
            });
        }
        if (part.inlineData || part.inline_data) {
            const data = part.inlineData || part.inline_data;
            const mimeType = data.mimeType || data.mime_type || "image/png";
            parts.push({
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${data.data}`
                }
            });
        }
        if (part.functionCall) {
            toolCalls.push({
                id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                type: "function",
                function: {
                    name: part.functionCall.name,
                    arguments: JSON.stringify(part.functionCall.args || {})
                }
            });
        }
        if (part.functionResponse) {
            return {
                role: "tool",
                tool_call_id: part.functionResponse.id || part.functionResponse.name,
                content: JSON.stringify(part.functionResponse.response?.result || part.functionResponse.response || {})
            };
        }
    }
    if (toolCalls.length > 0) {
        const result = {
            role: "assistant"
        };
        if (parts.length > 0) {
            result.content = parts.length === 1 ? parts[0].text : parts;
        }
        result.tool_calls = toolCalls;
        return result;
    }
    if (parts.length > 0) {
        return {
            role,
            content: parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts
        };
    }
    return null;
}
// Gemini marks thinking-mode output with `part.thought === true` on the model's own
// `parts` array (no separate field on the content itself). Left alone,
// convertGeminiContent() treats a thought part exactly like a visible text part —
// merging the model's internal reasoning into the message's regular `content`, which
// both leaks the private reasoning to whatever the OpenAI pivot forwards to next and
// prevents Reasoning Replay Cache (docs/routing/REASONING_REPLAY.md) from ever seeing
// it as `reasoning_content`. Split thought parts out first and re-attach the joined
// text as `reasoning_content` on the resulting message instead.
function convertGeminiContentWithReasoning(content) {
    if (!content || !Array.isArray(content.parts)) {
        return convertGeminiContent(content);
    }
    let reasoningContent = "";
    const visibleParts = [];
    for (const part of content.parts){
        if (part && part.thought === true) {
            if (typeof part.text === "string") reasoningContent += part.text;
        } else {
            visibleParts.push(part);
        }
    }
    if (!reasoningContent) {
        return convertGeminiContent(content);
    }
    const converted = convertGeminiContent({
        ...content,
        parts: visibleParts
    });
    if (converted && converted.role !== "tool") {
        return {
            ...converted,
            reasoning_content: reasoningContent
        };
    }
    if (!converted) {
        const role = content.role === "user" ? "user" : "assistant";
        return {
            role,
            reasoning_content: reasoningContent
        };
    }
    // A `tool` message (functionResponse) can't carry reasoning_content — fall back to
    // returning it unchanged rather than fabricating a field the tool-message schema
    // doesn't expect.
    return converted;
}
// Extract text from Gemini content
function extractGeminiText(content) {
    if (typeof content === "string") return content;
    if (content.parts && Array.isArray(content.parts)) {
        return content.parts.map((p)=>p.text || "").join("");
    }
    return "";
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, geminiToOpenAIRequest, null);
}),
"[project]/open-sse/translator/request/openai-to-gemini/helpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure, self-contained helpers extracted verbatim from ../openai-to-gemini.ts
// (god-file decomposition): historical-tool-context string builders, undefined-
// pruning, thought-signature extraction, tool-name remapping, and the Vertex
// provider check + Antigravity generation-config defaults. No I/O or module state;
// the host imports them back internally (these were module-private — no public API
// change). The GeminiGenerationConfig shape lives here with its only mutator.
__turbopack_context__.s([
    "applyAntigravityGenerationDefaults",
    ()=>applyAntigravityGenerationDefaults,
    "buildChangedToolNameMap",
    ()=>buildChangedToolNameMap,
    "buildHistoricalToolResultContext",
    ()=>buildHistoricalToolResultContext,
    "buildInertHistoricalToolCallText",
    ()=>buildInertHistoricalToolCallText,
    "buildInertHistoricalToolResponseText",
    ()=>buildInertHistoricalToolResponseText,
    "deepCleanUndefined",
    ()=>deepCleanUndefined,
    "escapeHistoricalContextAttribute",
    ()=>escapeHistoricalContextAttribute,
    "escapeHistoricalContextContent",
    ()=>escapeHistoricalContextContent,
    "extractClientThoughtSignature",
    ()=>extractClientThoughtSignature,
    "isVertexGeminiProvider",
    ()=>isVertexGeminiProvider,
    "stringifyHistoricalToolArguments",
    ()=>stringifyHistoricalToolArguments
]);
function isVertexGeminiProvider(provider) {
    return provider === "vertex" || provider === "vertex-partner";
}
function buildChangedToolNameMap(toolNameMap) {
    if (toolNameMap.size === 0) return null;
    const result = new Map();
    for (const [sanitizedName, originalName] of toolNameMap.entries()){
        result.set(sanitizedName, originalName);
        // Add lowercase-keyed alias so Gemini's lowercased tool names find the original.
        // Gemini always lowercases tool names in functionCall responses, so even identity
        // entries (Bash → Bash) need a lowercase key ("bash" → "Bash") for the response
        // translator to look them up (#9568).
        const lower = sanitizedName.toLowerCase();
        if (lower !== sanitizedName && !result.has(lower)) {
            result.set(lower, originalName);
        }
    }
    return result;
}
function extractClientThoughtSignature(toolCall) {
    if (!toolCall || typeof toolCall !== "object") return null;
    const candidate = toolCall;
    const signature = candidate.thoughtSignature || candidate.thought_signature || candidate.function?.thoughtSignature || candidate.function?.thought_signature || null;
    return typeof signature === "string" && signature.length > 0 ? signature : null;
}
function deepCleanUndefined(value, depth = 0) {
    if (depth > 10 || !value || typeof value !== "object") {
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value){
            deepCleanUndefined(item, depth + 1);
        }
    } else {
        const obj = value;
        for (const key of Object.keys(obj)){
            const val = obj[key];
            if (typeof val === "string" && val === "[undefined]") {
                delete obj[key];
            } else {
                deepCleanUndefined(val, depth + 1);
            }
        }
    }
}
function applyAntigravityGenerationDefaults(generationConfig) {
    const config = {
        ...generationConfig
    };
    if (config.topK === undefined) {
        config.topK = 40;
    }
    if (config.topP === undefined) {
        config.topP = 1;
    }
    const thinkingBudget = Number(config.thinkingConfig?.thinkingBudget);
    const maxOutputTokens = Number(config.maxOutputTokens);
    if (Number.isFinite(thinkingBudget) && thinkingBudget > 0 && (!Number.isFinite(maxOutputTokens) || maxOutputTokens <= thinkingBudget)) {
        config.maxOutputTokens = Math.floor(thinkingBudget) + 1;
    }
    return config;
}
function stringifyHistoricalToolArguments(value) {
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value ?? {});
    } catch  {
        return String(value ?? "{}");
    }
}
function buildInertHistoricalToolCallText(name, args) {
    const toolName = name || "unknown";
    return `[tool_history_call: ${toolName}] ${stringifyHistoricalToolArguments(args || "{}")}`;
}
function buildInertHistoricalToolResponseText(name, response) {
    return `[tool_history_result: ${name || "unknown"}] ${typeof response === "string" ? response : stringifyHistoricalToolArguments(response)}`;
}
function escapeHistoricalContextAttribute(value) {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function escapeHistoricalContextContent(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function buildHistoricalToolResultContext(name, response) {
    const source = escapeHistoricalContextAttribute(name || "unknown");
    const rawResult = typeof response === "string" ? response : stringifyHistoricalToolArguments(response);
    const result = escapeHistoricalContextContent(rawResult);
    return [
        `<previous_tool_result_context source="${source}">`,
        result,
        "</previous_tool_result_context>"
    ].join("\n");
}
}),
"[project]/open-sse/translator/request/openai-to-gemini.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mergeConsecutiveSameRoleContents",
    ()=>mergeConsecutiveSameRoleContents,
    "openaiToAntigravityRequest",
    ()=>openaiToAntigravityRequest,
    "openaiToCloudCodeGeminiRequest",
    ()=>openaiToCloudCodeGeminiRequest,
    "openaiToGeminiRequest",
    ()=>openaiToGeminiRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/geminiHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/geminiToolsSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-gemini/helpers.ts [instrumentation] (ecmascript)");
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
// Observed Antigravity wrapper output cap, not an underlying model capability.
// Keep this bridge-local: Antigravity currently caps visible output around 16K.
// See: https://github.com/keisksw/antigravity-output-analysis
const ANTIGRAVITY_CLAUDE_MAX_OUTPUT_TOKENS = 16_384;
// Gemini built-in tool names that Antigravity's v1internal endpoint rejects with a
// 400 when they are mixed with functionDeclarations in the same request. These must
// be stripped from the Cloud Code envelope's functionDeclarations.
const GEMINI_BUILTIN_TOOL_NAMES = new Set([
    "google_search",
    "web_search",
    "search_web",
    "googleSearch"
]);
// Convert OpenAI tool_choice into Gemini's functionCallingConfig mode. Mirrors
// convertOpenAIToolChoice in openai-to-claude.ts (same enum shapes from the client).
// Gemini's modes: AUTO (model decides), ANY (must call a function — OpenAI's
// "required"), NONE (never call), VALIDATED (may call a function OR respond with
// plain text, but any call it makes is schema-validated — this was the unconditional
// hardcoded default before tool_choice was wired up at all, so it stays the fallback
// for "auto"/unset to avoid changing existing behavior for the common case).
//
// Live investigation: gemini-3.1-flash-lite frequently narrates an intended tool call
// in plain text ("I'm running python3 now...") instead of actually emitting one
// (dashboard log id 1784591483850-49c408) — VALIDATED mode never forces a call, so
// the model is always free to just talk instead of act. tool_choice: "required" (->
// ANY) is the lever a caller has to prevent that, but it was silently ignored until
// this fix — body.tool_choice was never read anywhere in this file.
function convertOpenAIToolChoiceToGemini(choice) {
    if (!choice) return {
        mode: "VALIDATED"
    };
    if (typeof choice === "string") {
        if (choice === "none") return {
            mode: "NONE"
        };
        if (choice === "required" || choice === "any") return {
            mode: "ANY"
        };
        return {
            mode: "VALIDATED"
        }; // "auto" or unrecognized string
    }
    if (typeof choice === "object") {
        const c = choice;
        if (c.type === "function" && c.function?.name) {
            return {
                mode: "ANY",
                allowedFunctionNames: [
                    c.function.name
                ]
            };
        }
        if (c.type === "none") return {
            mode: "NONE"
        };
        if (c.type === "required" || c.type === "any") return {
            mode: "ANY"
        };
    }
    return {
        mode: "VALIDATED"
    };
}
function mergeConsecutiveSameRoleContents(contents) {
    const merged = [];
    for (const entry of contents){
        const last = merged[merged.length - 1];
        if (last && last.role === entry.role) {
            last.parts.push(...entry.parts);
        } else {
            // Shallow-copy the entry and its `parts` array so a later same-role merge
            // (`last.parts.push(...)`) never mutates the caller's input objects.
            merged.push({
                ...entry,
                parts: [
                    ...entry.parts
                ]
            });
        }
    }
    return merged;
}
// Core: Convert OpenAI request to Gemini format (base for all variants)
function openaiToGeminiBase(model, body, stream, toolNameOptions = {}) {
    const result = {
        model: model,
        contents: [],
        generationConfig: {},
        safetySettings: body.safetySettings || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_SAFETY_SETTINGS"]
    };
    const toolNameMap = new Map();
    const sanitizeToolName = (name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeGeminiToolName"])(name, {
            ...toolNameOptions,
            toolNameMap
        });
    // Preserve cachedContent if provided by client (for explicit Gemini caching)
    if (body.cachedContent) {
        result.cachedContent = body.cachedContent;
    }
    // Generation config
    if (body.temperature !== undefined) {
        result.generationConfig.temperature = body.temperature;
    }
    if (body.top_p !== undefined) {
        result.generationConfig.topP = body.top_p;
    }
    if (body.top_k !== undefined) {
        result.generationConfig.topK = body.top_k;
    }
    if (body.stop !== undefined) {
        result.generationConfig.stopSequences = Array.isArray(body.stop) ? body.stop : [
            body.stop
        ];
    }
    const maxOutputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMaxOutputTokens"])(model, body.max_tokens ?? body.max_completion_tokens);
    if (maxOutputTokens !== null) {
        result.generationConfig.maxOutputTokens = maxOutputTokens;
    }
    // Thinking / Reasoning support (Google Gemini 2.0+ Thinking models)
    // gemma-4 models return - 400: Thinking budget is not supported for this model.
    // Mirrors the same guard in claude-to-gemini.ts. Port of the thinkingConfig
    // guard half of decolua/9router#2480 (the signature-replay half of that PR
    // is out of scope and not ported here).
    if (model.startsWith("gemma-4")) {
    // gemma-4 models returns - 400: Thinking budget is not supported for this model
    } else {
        // 1. OpenAI format: reasoning_effort (none/low/medium/high/auto/max/xhigh)
        // "auto", "max", and "xhigh" are clamped to the high-tier budget because Gemini
        // does not accept these strings directly. "auto" signals "use max reasonable effort"
        // which maps to high. "max"/"xhigh" exceed Gemini's accepted range and are clamped.
        // "none" maps to budget 0 — an explicit, documented off-switch (#6813 defect 2),
        // distinct from the no-knob-at-all default-injection case below (#4170).
        // Port of decolua/9router#2043 by @nguyenxvotanminh3.
        if (body.reasoning_effort) {
            const highBudget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, 32768);
            const budgetMap = {
                none: 0,
                low: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, 1024),
                medium: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDefaultThinkingBudget"])(model) || 8192),
                high: highBudget,
                auto: highBudget,
                max: highBudget,
                xhigh: highBudget
            };
            const budget = budgetMap[body.reasoning_effort] ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDefaultThinkingBudget"])(model) ?? 8192);
            // Always send thinkingConfig on this path — including for models with
            // thinkingBudgetCap:0 (e.g. gemini-3-flash), where the cap collapses the
            // requested budget down to 0. Omitting thinkingConfig entirely here regressed
            // the pre-#6943 native-defaults contract (thinkingBudget 0 / includeThoughts
            // false must still be present) and crashed callers that read
            // .thinkingConfig.thinkingBudget unconditionally.
            result.generationConfig.thinkingConfig = {
                thinkingBudget: budget,
                includeThoughts: budget !== 0
            };
        }
        // 2. Claude format: thinking (type: enabled, budget_tokens)
        // Use an explicit numeric check (not truthy) so an explicit `budget_tokens: 0` — the
        // natural way to disable thinking — is honored as thinkingBudget 0 instead of being
        // dropped and falling through to the default injection below (#6813). A zero budget
        // yields no thoughts, so includeThoughts is only set for a non-zero budget.
        const thinking = body.thinking;
        if (thinking?.type === "enabled" && typeof thinking.budget_tokens === "number") {
            // typeof check ensures only numeric budget_tokens triggers thinking path;
            // non-numeric values (e.g. string "auto") fall through to the effort-based path.
            const cappedBudget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, thinking.budget_tokens);
            // Only send thinkingConfig if the model supports thinking via budget.
            // Models with thinkingBudgetCap:0 (e.g. gemini-3-flash) reject
            // thinkingConfig even when capped to 0. The supportsThinking flag
            // tracks thinkingLevel support, not thinkingBudget; use thinkingBudgetCap
            // as the reliable indicator (gemini-2.5-flash has supportsThinking:false
            // but thinkingBudgetCap:24576, meaning it supports thinking via budget).
            // Models not in MODEL_SPECS (thinkingBudgetCap=undefined) default to allowed.
            if (cappedBudget > 0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(model)?.thinkingBudgetCap !== 0) {
                result.generationConfig.thinkingConfig = {
                    thinkingBudget: cappedBudget,
                    includeThoughts: cappedBudget !== 0
                };
            }
        }
    }
    // 3. Default: all modern Gemini models (2.5+) have thinking capability.
    // If the client didn't explicitly request thinking (via reasoning_effort or
    // thinking.type), still set includeThoughts so the upstream marks thought
    // parts with thought:true. Without this, the model's reasoning leaks into
    // visible content instead of being routed to reasoning_content by the
    // response translator. (#4170) — this default-injection case is intentionally
    // unconditional (no-knob-at-all still gets includeThoughts:true); the explicit
    // "reasoning_effort: none" off-switch above (#6813) is the supported opt-out.
    if (!result.generationConfig.thinkingConfig) {
        const modelLower = model.toLowerCase();
        if (modelLower.includes("gemini") && !modelLower.includes("gemini-1") && (!modelLower.includes("gemini-2.0") || modelLower.includes("thinking")) && // Skip thinkingConfig for models that don't support thinking via budget.
        // Models with thinkingBudgetCap:0 (e.g. gemini-3-flash) reject
        // thinkingConfig. Use thinkingBudgetCap (not supportsThinking) as the
        // reliable indicator; gemini-2.5-flash has supportsThinking:false but
        // thinkingBudgetCap:24576, meaning it supports thinking via budget.
        // Models not in MODEL_SPECS (thinkingBudgetCap=undefined) default to allowed.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(model)?.thinkingBudgetCap !== 0) {
            result.generationConfig.thinkingConfig = {
                thinkingBudget: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDefaultThinkingBudget"])(model) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, 24576),
                includeThoughts: true
            };
        }
    }
    // Build tool_call_id -> name map
    const tcID2Name = {};
    // #7752: strip any non-trailing tool_call whose id has no matching tool_result
    // anywhere in history — same guard `BaseExecutor.execute()` applies for the mainline
    // Claude path (#2382/#4714) and `antigravityToOpenAIRequest` applies for the mirror
    // incoming direction (#6026). Without this, an orphaned tool_call (e.g. left behind by
    // OpenCode's known abort/cancel bug) reaches Google's Cloud Code envelope as an unpaired
    // functionCall, which Vertex's Claude backend rejects with HTTP 400.
    const rawMessages = body.messages;
    const messages = rawMessages && Array.isArray(rawMessages) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])(rawMessages) : rawMessages;
    if (messages && Array.isArray(messages)) {
        for (const msg of messages){
            const toolCalls = msg.tool_calls;
            if (msg.role === "assistant" && toolCalls) {
                for (const tc of toolCalls){
                    const fn = tc.function;
                    if (tc.type === "function" && tc.id && fn?.name) {
                        tcID2Name[tc.id] = fn.name;
                    }
                }
            }
        }
    }
    // Build tool responses cache
    const toolResponses = {};
    if (messages && Array.isArray(messages)) {
        for (const msg of messages){
            if (msg.role === "tool" && msg.tool_call_id) {
                toolResponses[msg.tool_call_id] = msg.content;
            }
        }
    }
    // Convert messages
    if (messages && Array.isArray(messages)) {
        for (const msg of messages){
            const role = msg.role;
            const content = msg.content;
            if (role === "system" && messages.length > 1) {
                const systemText = typeof content === "string" ? content : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractTextContent"])(content);
                if (systemText) {
                    if (!result.systemInstruction) {
                        result.systemInstruction = {
                            role: "system",
                            parts: [
                                {
                                    text: systemText
                                }
                            ]
                        };
                    } else {
                        result.systemInstruction.parts.push({
                            text: systemText
                        });
                    }
                }
            } else if (role === "user" || role === "system" && messages.length === 1) {
                const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["convertOpenAIContentToParts"])(content);
                if (parts.length > 0) {
                    result.contents.push({
                        role: "user",
                        parts
                    });
                }
            } else if (role === "assistant") {
                const parts = [];
                // Thinking/reasoning → thought part with signature
                if (msg.reasoning_content) {
                    parts.push({
                        thought: true,
                        text: msg.reasoning_content
                    });
                }
                if (content) {
                    const text = typeof content === "string" ? content : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractTextContent"])(content);
                    if (text) {
                        parts.push({
                            text
                        });
                    }
                }
                const toolCalls = msg.tool_calls;
                if (toolCalls && Array.isArray(toolCalls)) {
                    const toolCallIds = [];
                    const resolvedSignatures = new Map();
                    let firstPersistedSignature;
                    for (const tc of toolCalls){
                        const id = tc.id;
                        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveGeminiThoughtSignature"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(toolNameOptions.signatureNamespace, id), (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractClientThoughtSignature"])(tc));
                        if (typeof resolved === "string" && resolved.length > 0) {
                            resolvedSignatures.set(id, resolved);
                            firstPersistedSignature ??= resolved;
                        }
                    }
                    let shouldUseEmbeddedSignature = !parts.some((p)=>p.thoughtSignature);
                    const signaturelessToolCallMode = toolNameOptions.signaturelessToolCallMode;
                    const stringifySignaturelessToolCalls = signaturelessToolCallMode === "text";
                    const contextualizeSignaturelessToolResponses = signaturelessToolCallMode === "text" || signaturelessToolCallMode === "context";
                    for (const tc of toolCalls){
                        if (tc.type !== "function") continue;
                        const id = tc.id;
                        const fn = tc.function;
                        if (!fn) continue;
                        const signatureForToolCall = resolvedSignatures.get(id);
                        // Non-bypass paths (standard Gemini direct, mode "text"/"context")
                        // cannot send a thoughtSignature and reject signature-less native tool
                        // parts, so historical signature-less tool calls are represented as
                        // inert text/context (#3358). The Antigravity/CLI bypass path
                        // (supportsSignatureBypass) instead emits native parts carrying the
                        // skip_thought_signature_validator sentinel below.
                        if (!toolNameOptions.supportsSignatureBypass) {
                            if (!signatureForToolCall && contextualizeSignaturelessToolResponses) {
                                if (!toolCallIds.includes(id)) toolCallIds.push(id);
                            }
                            if (!signatureForToolCall && stringifySignaturelessToolCalls) {
                                parts.push({
                                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildInertHistoricalToolCallText"])(fn.name, fn.arguments || "{}")
                                });
                                continue;
                            }
                            if (!signatureForToolCall && signaturelessToolCallMode === "context") {
                                continue;
                            }
                        }
                        const args = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tryParseJSON"])(fn.arguments || "{}");
                        const embeddedThoughtSignature = shouldUseEmbeddedSignature ? firstPersistedSignature || signatureForToolCall : undefined;
                        if (embeddedThoughtSignature) {
                            shouldUseEmbeddedSignature = false;
                        }
                        // Gemini expects the signature on the functionCall part itself.
                        // If we are in a mode where missing signatures cause 400s (and we couldn't find one),
                        // safely default to the bypass string to protect against 400s.
                        const finalSignature = embeddedThoughtSignature || (toolNameOptions.supportsSignatureBypass && signaturelessToolCallMode !== "text" ? "skip_thought_signature_validator" : undefined);
                        parts.push({
                            ...finalSignature ? {
                                thoughtSignature: finalSignature
                            } : {},
                            functionCall: {
                                ...toolNameOptions.stripFunctionCallId ? {} : {
                                    id: id
                                },
                                name: sanitizeToolName(fn.name),
                                args: args
                            }
                        });
                        // Bypass path always emits the native response; non-bypass keeps the
                        // contextualize-aware bookkeeping (signature-less ids handled as text).
                        if (toolNameOptions.supportsSignatureBypass || !contextualizeSignaturelessToolResponses || signatureForToolCall) {
                            toolCallIds.push(id);
                        }
                    }
                    if (parts.length > 0) {
                        result.contents.push({
                            role: "model",
                            parts
                        });
                    }
                    // Check if there are actual tool responses in the next messages
                    const hasSignaturelessTextResponses = contextualizeSignaturelessToolResponses && toolCalls.some((tc)=>{
                        const id = tc.id;
                        return tc.type === "function" && !resolvedSignatures.has(id) && toolResponses[id];
                    });
                    const hasActualResponses = toolCallIds.some((fid)=>toolResponses[fid]) || hasSignaturelessTextResponses;
                    if (hasActualResponses) {
                        const toolParts = [];
                        for (const fid of toolCallIds){
                            if (!toolResponses[fid]) continue;
                            if (!toolNameOptions.supportsSignatureBypass && contextualizeSignaturelessToolResponses && !resolvedSignatures.has(fid)) continue;
                            let name = tcID2Name[fid];
                            if (!name) {
                                const idParts = fid.split("-");
                                if (idParts.length > 2) {
                                    name = idParts.slice(0, -2).join("-");
                                } else {
                                    name = fid;
                                }
                            }
                            name = sanitizeToolName(name);
                            const resp = toolResponses[fid];
                            let parsedResp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tryParseJSON"])(resp);
                            if (parsedResp === null) {
                                parsedResp = {
                                    result: resp
                                };
                            } else if (typeof parsedResp !== "object") {
                                parsedResp = {
                                    result: parsedResp
                                };
                            }
                            toolParts.push({
                                functionResponse: {
                                    ...toolNameOptions.stripFunctionCallId ? {} : {
                                        id: fid
                                    },
                                    name: name,
                                    response: {
                                        result: parsedResp
                                    }
                                }
                            });
                        }
                        if (!toolNameOptions.supportsSignatureBypass && contextualizeSignaturelessToolResponses) {
                            // Signature-less historical tool responses are represented as text
                            // so strict standard-Gemini endpoints don't reject them as native
                            // functionResponse parts missing a matching thoughtSignature.
                            // In context mode the matching historical functionCall is omitted,
                            // avoiding pseudo tool-call records that Gemini Flash can repeat as
                            // the visible final answer.
                            for (const tc of toolCalls){
                                const id = tc.id;
                                if (tc.type !== "function" || !id) continue;
                                if (!resolvedSignatures.has(id) && toolResponses[id]) {
                                    const fn = tc.function;
                                    const name = tcID2Name[id] || fn?.name || "unknown";
                                    const resp = toolResponses[id];
                                    toolParts.push({
                                        text: signaturelessToolCallMode === "text" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildInertHistoricalToolResponseText"])(name, resp) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildHistoricalToolResultContext"])(name, resp)
                                    });
                                }
                            }
                        }
                        if (toolParts.length > 0) {
                            result.contents.push({
                                role: "user",
                                parts: toolParts
                            });
                        }
                    }
                } else if (parts.length > 0) {
                    result.contents.push({
                        role: "model",
                        parts
                    });
                }
            }
        }
    }
    // Collapse any consecutive same-role contents Gemini would reject (9router#2191).
    result.contents = mergeConsecutiveSameRoleContents(result.contents ?? []);
    // Convert tools
    const bodyTools = body.tools;
    const geminiTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiTools"])(bodyTools, {
        ...toolNameOptions,
        toolNameMap
    });
    // Support for Google Search grounding if requested via 'google_search' tool
    const hasGoogleSearch = bodyTools?.some((t)=>{
        const fn = t.function;
        return t.type === "function" && (fn?.name === "google_search" || fn?.name === "googleSearch");
    });
    if (geminiTools && geminiTools.length > 0) {
        result.tools = geminiTools;
        if (hasGoogleSearch) {
            result.tools.push({
                googleSearch: {}
            });
        }
        result.toolConfig = {
            functionCallingConfig: convertOpenAIToolChoiceToGemini(body.tool_choice)
        };
    } else if (hasGoogleSearch) {
        result.tools = [
            {
                googleSearch: {}
            }
        ];
    }
    // Convert response_format to Gemini's responseMimeType/responseSchema
    const responseFormat = body.response_format;
    if (responseFormat) {
        if (responseFormat.type === "json_schema" && responseFormat.json_schema) {
            result.generationConfig.responseMimeType = "application/json";
            // Extract the schema (may be nested under .schema key)
            const schema = responseFormat.json_schema.schema || responseFormat.json_schema;
            if (schema && typeof schema === "object") {
                result.generationConfig.responseSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanJSONSchemaForAntigravity"])(schema);
            }
        } else if (responseFormat.type === "json_object") {
            result.generationConfig.responseMimeType = "application/json";
        } else if (responseFormat.type === "text") {
            result.generationConfig.responseMimeType = "text/plain";
        }
    }
    const changedToolNameMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildChangedToolNameMap"])(toolNameMap);
    if (changedToolNameMap) {
        result._toolNameMap = changedToolNameMap;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deepCleanUndefined"])(result);
    return result;
}
function openaiToGeminiRequest(model, body, stream, credentials = null, options = {}) {
    // Thread the signature namespace so a thinking model's thoughtSignature (cached on the
    // response turn under `<connectionId>:<toolCallId>`) is found and re-attached to the
    // functionCall on the follow-up request. Without this the streaming lookup key didn't
    // match and Gemini rejected tool calls with 400 "missing thought_signature" (#2504).
    const signatureNamespace = credentials && typeof credentials["_signatureNamespace"] === "string" ? credentials["_signatureNamespace"] : null;
    return openaiToGeminiBase(model, body, stream, {
        signatureNamespace,
        signaturelessToolCallMode: options.signaturelessToolCallMode,
        stripFunctionCallId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isVertexGeminiProvider"])(credentials?._provider)
    });
}
function openaiToCloudCodeGeminiRequest(model, body, stream, options = {}) {
    const request = openaiToGeminiBase(model, body, stream, {
        stripNamespace: true,
        signatureNamespace: options.signatureNamespace,
        signaturelessToolCallMode: options.signaturelessToolCallMode,
        supportsSignatureBypass: true
    });
    // Standard Gemini requests retain the historical all-OFF defaults, but Cloud Code
    // must receive safety policy only when the caller explicitly supplied it.
    if (!Object.prototype.hasOwnProperty.call(body, "safetySettings")) {
        delete request.safetySettings;
    }
    return request;
}
function wrapInCloudCodeEnvelope(model, cloudCodeRequest, credentials = null) {
    // Fall back to providerSpecificData.projectId — some connections (and post-refresh
    // credentials) store it there rather than at the top level, which otherwise produced a
    // spurious 422 "Missing Google projectId" on the Antigravity /v1beta path (#2480).
    const providerSpecificProjectId = credentials?.providerSpecificData?.projectId;
    let projectId = credentials?.projectId || (typeof providerSpecificProjectId === "string" ? providerSpecificProjectId : "");
    if (!projectId) {
        console.warn(`[OmniRoute] Antigravity account is missing projectId. ` + `Attempting request with empty project — reconnect OAuth to resolve.`);
        projectId = "";
    }
    const cleanModel = model.includes("/") ? model.split("/").pop() : model;
    const envelope = {
        project: projectId,
        requestId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateAntigravityRequestId"])(),
        request: {
            sessionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravitySessionId"])(credentials),
            contents: cloudCodeRequest.contents,
            systemInstruction: cloudCodeRequest.systemInstruction,
            generationConfig: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyAntigravityGenerationDefaults"])(cloudCodeRequest.generationConfig),
            tools: cloudCodeRequest.tools,
            safetySettings: cloudCodeRequest.safetySettings
        },
        model: cleanModel,
        userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityEnvelopeUserAgent"])(credentials),
        requestType: "agent"
    };
    if (cloudCodeRequest._toolNameMap instanceof Map && cloudCodeRequest._toolNameMap.size > 0) {
        envelope._toolNameMap = cloudCodeRequest._toolNameMap;
    }
    const defaultPart = {
        text: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ANTIGRAVITY_DEFAULT_SYSTEM"]
    };
    if (envelope.request.systemInstruction?.parts) {
        envelope.request.systemInstruction.parts.unshift(defaultPart);
    } else {
        envelope.request.systemInstruction = {
            role: "system",
            parts: [
                defaultPart
            ]
        };
    }
    // Strip Gemini built-in tool *names* out of functionDeclarations: Antigravity's
    // v1internal endpoint returns 400 when a built-in tool (google_search etc.) is
    // mixed with functionDeclarations in the same request. Native grounding entries
    // (e.g. `{ googleSearch: {} }`) are left intact; only the functionDeclarations
    // arrays are cleaned, and a declarations entry that becomes empty is dropped.
    if (envelope.request.tools && envelope.request.tools.length > 0) {
        const cleanedTools = envelope.request.tools.map((tool)=>{
            if (!Array.isArray(tool.functionDeclarations)) {
                return tool;
            }
            const customDecls = tool.functionDeclarations.filter((fn)=>!GEMINI_BUILTIN_TOOL_NAMES.has(fn.name));
            return {
                ...tool,
                functionDeclarations: customDecls
            };
        }).filter((tool)=>!Array.isArray(tool.functionDeclarations) || tool.functionDeclarations.length > 0);
        envelope.request.tools = cleanedTools.length > 0 ? cleanedTools : undefined;
    }
    const hasCustomTools = envelope.request.tools?.some((tool)=>(tool.functionDeclarations?.length ?? 0) > 0);
    if (hasCustomTools) {
        // Reuse the toolConfig openaiToGeminiBase already computed from the caller's
        // tool_choice (cloudCodeRequest is that function's return value) instead of
        // re-deriving a hardcoded default here — see convertOpenAIToolChoiceToGemini.
        envelope.request.toolConfig = cloudCodeRequest.toolConfig ?? {
            functionCallingConfig: {
                mode: "VALIDATED"
            }
        };
    }
    return envelope;
}
function getAntigravityClaudeOutputTokens(body) {
    const requested = body.max_tokens ?? body.max_completion_tokens;
    if (typeof requested === "number" && Number.isFinite(requested) && requested >= 1) {
        return Math.min(Math.floor(requested), ANTIGRAVITY_CLAUDE_MAX_OUTPUT_TOKENS);
    }
    return ANTIGRAVITY_CLAUDE_MAX_OUTPUT_TOKENS;
}
function openaiToAntigravityRequest(model, body, stream, credentials = null) {
    const isClaude = model.toLowerCase().includes("claude");
    // All modern Gemini models (2.5+, 3.x, pro-agent, etc.) use thinking by default
    // and require thought_signature for multi-turn tool calls.
    // Safe default: all non-Claude models via Antigravity are thinking Gemini.
    const modelLower = model.toLowerCase();
    const isThinkingGemini = !isClaude && (modelLower.includes("thinking") || modelLower.includes("gemini-3") || modelLower.includes("gemini-2.5") || modelLower.includes("gemini-pro"));
    const signatureNamespace = credentials && typeof credentials === "object" && typeof credentials._signatureNamespace === "string" ? credentials._signatureNamespace : null;
    const cloudCodeRequest = openaiToCloudCodeGeminiRequest(model, body, stream, {
        signatureNamespace,
        signaturelessToolCallMode: isThinkingGemini ? "context" : "native"
    });
    if (isClaude) {
        cloudCodeRequest.generationConfig.maxOutputTokens = getAntigravityClaudeOutputTokens(body);
    }
    const envelope = wrapInCloudCodeEnvelope(model, cloudCodeRequest, credentials);
    // Match real Antigravity client: don't send maxOutputTokens when the user
    // hasn't explicitly specified max_tokens / max_completion_tokens.
    // The Cloud Code server decides the output limit on its own.
    // Note: read hasThinking BEFORE stripping thinkingConfig below — for Claude
    // models the Cloud Code envelope still carries a thinkingBudget set upstream
    // by applyAntigravityGenerationDefaults, which we must consult here so we
    // do not accidentally drop the maxOutputTokens it bumped for us.
    const clientRequestedMaxTokens = body.max_tokens ?? body.max_completion_tokens;
    const hasThinking = !!envelope.request?.generationConfig?.thinkingConfig?.thinkingBudget;
    if (clientRequestedMaxTokens === undefined && !hasThinking && envelope.request?.generationConfig) {
        delete envelope.request.generationConfig.maxOutputTokens;
    }
    // Claude models on Antigravity use their own native thinking — Gemini's thinkingConfig
    // is not understood by the Cloud Code Claude endpoint and must be stripped.
    // applyAntigravityGenerationDefaults (inside wrapInCloudCodeEnvelope) already bumped
    // maxOutputTokens to thinkingBudget+1 before we get here, so the budget is preserved.
    // Must run AFTER the hasThinking-derived maxOutputTokens decision above so the
    // budget is accounted for before the field is removed.
    if (isClaude && envelope.request?.generationConfig) {
        delete envelope.request.generationConfig.thinkingConfig;
    }
    return envelope;
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI, (model, body, stream = false, credentials = null)=>openaiToGeminiRequest(model, body, stream, credentials, {
        signaturelessToolCallMode: "context"
    }), null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY, openaiToAntigravityRequest, null);
}),
"[project]/open-sse/translator/request/antigravity-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "antigravityToOpenAIRequest",
    ()=>antigravityToOpenAIRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/maxTokensHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/reasoning/effortStandardization.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function antigravityToOpenAIRequest(model, body, stream) {
    const req = body.request || body;
    const result = {
        model: model,
        messages: [],
        stream: stream
    };
    // Explicit per-alias reasoning-effort override (Antigravity MITM layer only —
    // `src/mitm/aliasConfig.ts` / `src/mitm/_internal/aliasConfig.cjs`). Set at the same
    // envelope level as `model` (top-level `body`, sibling of `.request`), so it survives
    // regardless of which cloudcode envelope shape the caller used. When present it takes
    // priority over the thinkingConfig-derived value below: an explicit "none" suppresses
    // reasoning_effort entirely even if Antigravity's own thinkingConfig requested thinking;
    // any other explicit tier is emitted verbatim instead of the coarse budget-based guess.
    // Ported from upstream decolua/9router#2584 ("add Antigravity reasoning effort overrides").
    const effortOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$reasoning$2f$effortStandardization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeEffort"])(body.reasoningEffortOverride);
    // Generation config
    if (req.generationConfig) {
        const config = req.generationConfig;
        if (config.maxOutputTokens) {
            const tempBody = {
                max_tokens: config.maxOutputTokens,
                tools: req.tools
            };
            result.max_tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$maxTokensHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adjustMaxTokens"])(tempBody);
        }
        if (config.temperature !== undefined) {
            result.temperature = config.temperature;
        }
        if (config.topP !== undefined) {
            result.top_p = config.topP;
        }
        if (config.topK !== undefined) {
            result.top_k = config.topK;
        }
        // Thinking config → reasoning_effort (skipped when an explicit override is present).
        if (effortOverride === undefined && config.thinkingConfig) {
            const budget = config.thinkingConfig.thinkingBudget || 0;
            if (budget > 0) {
                if (budget <= 2048) {
                    result.reasoning_effort = "low";
                } else if (budget <= 16384) {
                    result.reasoning_effort = "medium";
                } else {
                    result.reasoning_effort = "high";
                }
            }
        }
    }
    if (effortOverride !== undefined && effortOverride !== "none") {
        result.reasoning_effort = effortOverride;
    } else if (effortOverride === "none") {
        delete result.reasoning_effort;
    }
    // System instruction
    if (req.systemInstruction) {
        const systemText = extractText(req.systemInstruction);
        if (systemText) {
            result.messages.push({
                role: "system",
                content: systemText
            });
        }
    }
    // Convert contents to messages
    if (req.contents && Array.isArray(req.contents)) {
        for (const content of req.contents){
            const converted = convertContent(content);
            if (converted) {
                if (Array.isArray(converted)) {
                    result.messages.push(...converted);
                } else {
                    result.messages.push(converted);
                }
            }
        }
    }
    // Tools
    if (req.tools && Array.isArray(req.tools)) {
        result.tools = [];
        for (const tool of req.tools){
            if (tool.functionDeclarations) {
                for (const func of tool.functionDeclarations){
                    result.tools.push({
                        type: "function",
                        function: {
                            name: func.name,
                            description: func.description || "",
                            parameters: cleanSchemaPreservingRequired(func.parameters) || {
                                type: "object",
                                properties: {}
                            }
                        }
                    });
                }
            }
        }
    }
    // Guard against orphan tool_result/tool_use pairs (#6026). Antigravity IDE can ship a
    // truncated history whose first turn is a `functionResponse` with no preceding
    // `functionCall`. Left untouched, that becomes an orphan `role:"tool"` message here and,
    // after the openai→claude step, an orphan `tool_result` block — which Anthropic (Vertex
    // `claude-opus-4.6`) rejects with `unexpected tool_use_id found in tool_result blocks`.
    // `fixToolPairs` strips only genuine orphans and is idempotent on well-formed histories,
    // so paired functionCall/functionResponse turns pass through unchanged. This mirrors the
    // executor-side guard in `executors/base.ts` / `services/claudeCodeCompatible.ts`; the
    // Antigravity MITM path did not run it (no `fixToolPairs` under `src/mitm/`). We do NOT
    // run `fixToolAdjacency` here because this stage still emits OpenAI-format messages and
    // Claude's adjacency rule is enforced downstream per provider.
    result.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixToolPairs"])(result.messages);
    return result;
}
// Recursively convert Antigravity schema types (OBJECT, STRING, etc.) to lowercase
// and strip unsupported fields like enumDescriptions.
function normalizeSchemaTypes(schema) {
    if (!schema || typeof schema !== "object") return schema;
    const result = Array.isArray(schema) ? [
        ...schema
    ] : {
        ...schema
    };
    if (typeof result.type === "string") {
        result.type = result.type.toLowerCase();
    }
    // Strip enumDescriptions — not supported by upstream APIs
    delete result.enumDescriptions;
    if (result.properties && typeof result.properties === "object") {
        const normalized = {};
        for (const [key, val] of Object.entries(result.properties)){
            normalized[key] = normalizeSchemaTypes(val);
        }
        result.properties = normalized;
    }
    if (result.items) {
        result.items = normalizeSchemaTypes(result.items);
    }
    return result;
}
// Clean a JSON Schema for Antigravity while PRESERVING the `required` array at every level.
// Unlike the type-lowering pass alone, this strips JSON Schema Draft 2020-12 meta keywords
// ($schema, $defs, $ref, additionalProperties, patternProperties, title, x-*, ...) that the
// Antigravity upstream does not accept, yet keeps `required` so the model still treats
// mandatory tool arguments as mandatory. Clients such as OpenCode send full Draft 2020-12
// tool schemas; dropping `required` lets the model call tools without their required args.
function cleanSchemaPreservingRequired(schema) {
    if (!schema || typeof schema !== "object") return schema;
    // Reuse the existing recursion to lowercase types + strip enumDescriptions, then
    // remove draft-meta keywords and reconcile `required` against the surviving properties.
    const normalized = normalizeSchemaTypes(structuredClone(schema));
    stripDraftMeta(normalized);
    preserveRequired(normalized);
    return normalized;
}
// Draft 2020-12 / JSON Schema meta keywords the Antigravity upstream does not accept.
const DRAFT_META_KEYS = new Set([
    "$schema",
    "$defs",
    "definitions",
    "$ref",
    "$comment",
    "const",
    "additionalProperties",
    "propertyNames",
    "patternProperties",
    "title"
]);
function stripDraftMeta(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
        for (const item of obj)stripDraftMeta(item);
        return;
    }
    const record = obj;
    for (const key of Object.keys(record)){
        if (DRAFT_META_KEYS.has(key) || key.startsWith("x-")) {
            delete record[key];
        }
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") stripDraftMeta(value);
    }
}
// Preserve `required` even when referenced fields were stripped from constraint blocks.
// At each node where both `required` and `properties` are present, keep only the entries
// that still exist in `properties`; drop `required` entirely if none survive. This avoids
// emitting a `required` array that references fields removed by stripDraftMeta.
function preserveRequired(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
        for (const item of obj)preserveRequired(item);
        return;
    }
    const record = obj;
    if (Array.isArray(record.required) && record.properties && typeof record.properties === "object") {
        const properties = record.properties;
        const valid = record.required.filter((field)=>typeof field === "string" && Object.prototype.hasOwnProperty.call(properties, field));
        if (valid.length === 0) {
            delete record.required;
        } else {
            record.required = valid;
        }
    }
    for (const value of Object.values(record)){
        if (value && typeof value === "object") preserveRequired(value);
    }
}
// Convert Antigravity content to OpenAI message
// Handles: text, thought, thoughtSignature, functionCall, functionResponse, inlineData
function convertContent(content) {
    const role = content.role === "model" ? "assistant" : content.role === "user" ? "user" : content.role;
    if (!content.parts || !Array.isArray(content.parts)) {
        return null;
    }
    const textParts = [];
    const toolCalls = [];
    const toolResults = [];
    let reasoningContent = "";
    for (const part of content.parts){
        // Thinking content (thought: true)
        if (part.thought === true && part.text) {
            reasoningContent += part.text;
            continue;
        }
        // Text with thoughtSignature = regular text after thinking.
        // Skip empty text — Anthropic rejects empty content blocks with a 400.
        if (part.thoughtSignature && part.text !== undefined) {
            if (part.text) {
                textParts.push({
                    type: "text",
                    text: part.text
                });
            }
            continue;
        }
        // Regular text — skip empty strings (Anthropic rejects empty content blocks).
        if (part.text !== undefined && part.text !== "") {
            textParts.push({
                type: "text",
                text: part.text
            });
        }
        // Inline data (images)
        if (part.inlineData) {
            textParts.push({
                type: "image_url",
                image_url: {
                    url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                }
            });
        }
        // Function call
        if (part.functionCall) {
            toolCalls.push({
                id: part.functionCall.id || `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                type: "function",
                function: {
                    name: part.functionCall.name,
                    arguments: JSON.stringify(part.functionCall.args || {})
                }
            });
        }
        // Function response → collect all, each becomes a separate tool message
        if (part.functionResponse) {
            toolResults.push({
                role: "tool",
                tool_call_id: part.functionResponse.id || part.functionResponse.name,
                content: JSON.stringify(part.functionResponse.response?.result || part.functionResponse.response || {})
            });
        }
    }
    // Function responses may be co-located with function calls / text / reasoning in
    // the same content. Emit the tool messages AND the accompanying assistant message so
    // nothing is dropped (previously only the tool messages survived).
    if (toolResults.length > 0) {
        if (toolCalls.length > 0 || textParts.length > 0 || reasoningContent) {
            const assistantMsg = {
                role: "assistant"
            };
            if (textParts.length > 0) {
                assistantMsg.content = textParts.length === 1 && textParts[0].type === "text" ? textParts[0].text : textParts;
            }
            if (reasoningContent) {
                assistantMsg.reasoning_content = reasoningContent;
            }
            if (toolCalls.length > 0) {
                assistantMsg.tool_calls = toolCalls;
            }
            return [
                ...toolResults,
                assistantMsg
            ];
        }
        return toolResults;
    }
    // Assistant with tool calls
    if (toolCalls.length > 0) {
        const msg = {
            role: "assistant"
        };
        if (textParts.length > 0) {
            msg.content = textParts.length === 1 && textParts[0].type === "text" ? textParts[0].text : textParts;
        }
        if (reasoningContent) {
            msg.reasoning_content = reasoningContent;
        }
        msg.tool_calls = toolCalls;
        return msg;
    }
    // Regular message
    if (textParts.length > 0 || reasoningContent) {
        const msg = {
            role
        };
        if (textParts.length > 0) {
            msg.content = textParts.length === 1 && textParts[0].type === "text" ? textParts[0].text : textParts;
        }
        if (reasoningContent) {
            msg.reasoning_content = reasoningContent;
        }
        return msg;
    }
    return null;
}
// Extract text from systemInstruction
function extractText(instruction) {
    if (typeof instruction === "string") return instruction;
    if (instruction.parts && Array.isArray(instruction.parts)) {
        return instruction.parts.map((p)=>p.text || "").join("");
    }
    return "";
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, antigravityToOpenAIRequest, null);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/translator/request/openai-responses/additionalTools.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectCustomToolNamesForSourceFormat",
    ()=>collectCustomToolNamesForSourceFormat,
    "collectResponsesCustomToolNames",
    ()=>collectResponsesCustomToolNames,
    "collectResponsesTools",
    ()=>collectResponsesTools
]);
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toolName(value) {
    const tool = toRecord(value);
    const nestedFunction = toRecord(tool.function);
    return typeof tool.name === "string" && tool.name.trim() ? tool.name.trim() : typeof nestedFunction.name === "string" && nestedFunction.name.trim() ? nestedFunction.name.trim() : "";
}
function toolIdentity(value) {
    const tool = toRecord(value);
    const name = toolName(value);
    if (!name) return null;
    // Namespace names are only containers. The Chat conversion flattens their nested
    // tools, so they do not collide with a top-level function of the same name.
    return tool.type === "namespace" ? `namespace:${name}` : `name:${name}`;
}
function mergeNamespaceTools(first, second) {
    const merged = [];
    const seenNames = new Set();
    for (const source of [
        first,
        second
    ]){
        if (!Array.isArray(source)) continue;
        for (const tool of source){
            const name = toolName(tool);
            if (name && seenNames.has(name)) continue;
            if (name) seenNames.add(name);
            merged.push(tool);
        }
    }
    return merged;
}
function collectResponsesTools(rootTools, inputItems) {
    const rootToolList = Array.isArray(rootTools) ? rootTools : [];
    const sources = [
        rootToolList
    ];
    for (const itemValue of inputItems){
        const item = toRecord(itemValue);
        if (item.type === "additional_tools" && Array.isArray(item.tools)) {
            sources.push(item.tools);
        }
    }
    const explicitNames = new Set(sources.flat().map((tool)=>{
        const record = toRecord(tool);
        return record.type === "namespace" ? "" : toolName(tool);
    }).filter(Boolean));
    const merged = [];
    const seen = new Set();
    const namespaceIndexes = new Map();
    for (const source of sources){
        for (const tool of source){
            const toolRecord = toRecord(tool);
            if (toolRecord.type === "namespace") {
                const namespaceName = toolName(tool);
                const existingIndex = namespaceName ? namespaceIndexes.get(namespaceName) : undefined;
                const namespaceTools = Array.isArray(toolRecord.tools) ? toolRecord.tools.filter((member)=>!explicitNames.has(toolName(member))) : toolRecord.tools;
                if (existingIndex !== undefined) {
                    const existing = toRecord(merged[existingIndex]);
                    merged[existingIndex] = {
                        ...toolRecord,
                        ...existing,
                        tools: mergeNamespaceTools(existing.tools, namespaceTools)
                    };
                    continue;
                }
                if (namespaceName) namespaceIndexes.set(namespaceName, merged.length);
                merged.push({
                    ...toolRecord,
                    tools: namespaceTools
                });
                continue;
            }
            const identity = toolIdentity(tool);
            if (identity && seen.has(identity)) continue;
            if (identity) seen.add(identity);
            merged.push(tool);
        }
    }
    return merged;
}
function collectResponsesCustomToolNames(rootTools, inputItems) {
    const names = new Set();
    const visit = (tools)=>{
        for (const toolValue of tools){
            const tool = toRecord(toolValue);
            const name = toolName(toolValue);
            if (tool.type === "custom" && name) names.add(name);
            if (tool.type === "namespace" && Array.isArray(tool.tools)) visit(tool.tools);
        }
    };
    visit(collectResponsesTools(rootTools, inputItems));
    return names;
}
function collectCustomToolNamesForSourceFormat(sourceFormat, responsesFormat, rootTools, inputItems) {
    return sourceFormat === responsesFormat ? collectResponsesCustomToolNames(rootTools, inputItems) : new Set();
}
}),
"[project]/open-sse/translator/request/openai-responses/namespaceFlatten.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "flattenNamespaceToolName",
    ()=>flattenNamespaceToolName
]);
// #8295 — deterministic wire-name qualification for Responses "namespace" tool
// groups flattened onto Chat Completions. See openai-responses.ts's
// `toolType === "namespace"` branch for the caller.
//
// Two different namespaces can declare a child tool with the same leaf name
// (e.g. `mcp__codex_apps__atlassian_rovo._search` and
// `mcp__codex_apps__linear._search`). Emitting both as the bare leaf `_search`
// produces duplicate Chat `tool.function.name` entries, which every
// strict-name-uniqueness upstream (DeepSeek, etc.) rejects with a 400. Folding
// the namespace into the wire name makes collisions structurally impossible.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
// Chat Completions function names must match ^[a-zA-Z0-9_-]+$ and are commonly
// capped at 64 chars by OpenAI-family providers.
const MAX_TOOL_NAME_LEN = 64;
function flattenNamespaceToolName(nsName, leaf) {
    if (!nsName) return leaf;
    if (leaf.includes("__")) return leaf;
    const prefix = nsName.endsWith("__") ? nsName : `${nsName}__`;
    const qualified = `${prefix}${leaf}`;
    if (qualified.length <= MAX_TOOL_NAME_LEN) return qualified;
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(qualified).digest("hex").slice(0, 7);
    return `${qualified.slice(0, MAX_TOOL_NAME_LEN - 8)}_${hash}`;
}
}),
"[project]/open-sse/translator/request/openai-responses/helpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure shared primitives for the OpenAI Responses <-> Chat Completions request
// translators. Extracted verbatim from openai-responses.ts (no host imports).
__turbopack_context__.s([
    "COPILOT_REASONING_SUMMARY_MARKER",
    ()=>COPILOT_REASONING_SUMMARY_MARKER,
    "IMAGE_GENERATION_TOOL_TYPES",
    ()=>IMAGE_GENERATION_TOOL_TYPES,
    "MAX_CALL_ID_LEN",
    ()=>MAX_CALL_ID_LEN,
    "RESPONSES_STORE_MARKER",
    ()=>RESPONSES_STORE_MARKER,
    "TOOL_SEARCH_TOOL_TYPES",
    ()=>TOOL_SEARCH_TOOL_TYPES,
    "VERBOSITY_LEVELS",
    ()=>VERBOSITY_LEVELS,
    "WEB_SEARCH_TOOL_TYPES",
    ()=>WEB_SEARCH_TOOL_TYPES,
    "X_SEARCH_TOOL_TYPES",
    ()=>X_SEARCH_TOOL_TYPES,
    "clampCallId",
    ()=>clampCallId,
    "imageUrlToText",
    ()=>imageUrlToText,
    "normalizeResponsesReasoningEffort",
    ()=>normalizeResponsesReasoningEffort,
    "normalizeVerbosity",
    ()=>normalizeVerbosity,
    "shouldRequestClaudeSummarizedThinking",
    ()=>shouldRequestClaudeSummarizedThinking,
    "toArray",
    ()=>toArray,
    "toRecord",
    ()=>toRecord,
    "toString",
    ()=>toString,
    "unsupportedFeature",
    ()=>unsupportedFeature
]);
const RESPONSES_STORE_MARKER = "_omnirouteResponsesStore";
const COPILOT_REASONING_SUMMARY_MARKER = "_omnirouteCopilotReasoningSummary";
const WEB_SEARCH_TOOL_TYPES = /^web_search/;
const X_SEARCH_TOOL_TYPES = /^x_search/;
const TOOL_SEARCH_TOOL_TYPES = /^tool_search/;
const IMAGE_GENERATION_TOOL_TYPES = /^image_generation/;
const VERBOSITY_LEVELS = new Set([
    "low",
    "medium",
    "high"
]);
function normalizeVerbosity(value) {
    if (typeof value !== "string") return undefined;
    const level = value.toLowerCase();
    return VERBOSITY_LEVELS.has(level) ? level : undefined;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
const MAX_CALL_ID_LEN = 64;
function clampCallId(id) {
    return id.length > MAX_CALL_ID_LEN ? id.slice(0, MAX_CALL_ID_LEN) : id;
}
function toArray(value) {
    return Array.isArray(value) ? value : [];
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function imageUrlToText(value) {
    if (typeof value === "string") return value;
    const record = toRecord(value);
    return toString(record.url);
}
const CODEX_GPT_5_6_MODEL_PATTERN = /^gpt-5\.6-(?:sol|terra|luna)(?:-(?:none|low|medium|high|xhigh|max|ultra))?$/;
const KIRO_GPT_5_6_MODEL_PATTERN = /^(?:kiro|kr)\/gpt-5\.6-(?:sol|terra|luna)(?:-(?:none|low|medium|high|xhigh|max))?$/;
function supportsNativeMaxReasoningEffort(model) {
    const normalizedModel = toString(model).trim().toLowerCase().replace(/^(?:codex|cx)\//, "");
    return CODEX_GPT_5_6_MODEL_PATTERN.test(normalizedModel) || KIRO_GPT_5_6_MODEL_PATTERN.test(toString(model).trim().toLowerCase());
}
function normalizeResponsesReasoningEffort(value, model) {
    const effort = toString(value).toLowerCase();
    if (effort !== "max") return effort;
    return supportsNativeMaxReasoningEffort(model) ? "max" : "xhigh";
}
function shouldRequestClaudeSummarizedThinking(value) {
    const summary = toString(value).toLowerCase();
    return !!summary && summary !== "off" && summary !== "none" && summary !== "disabled";
}
function unsupportedFeature(message) {
    const error = new Error(message);
    error.statusCode = 400;
    error.errorType = "unsupported_feature";
    return error;
}
}),
"[project]/open-sse/translator/request/openai-responses/toResponses.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openaiToOpenAIResponsesRequest",
    ()=>openaiToOpenAIResponsesRequest
]);
/**
 * Translator: OpenAI Chat Completions -> OpenAI Responses API
 *
 * Extracted verbatim from openai-responses.ts. Registration stays in the host.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/helpers.ts [instrumentation] (ecmascript)");
;
;
;
// A Chat-Completions client can only express reasoning via the top-level
// `reasoning_effort` hint; it has no way to request a reasoning summary. When we
// promote that hint to the Responses API's `reasoning.effort`, default the
// summary (plus the encrypted-content include that actually streams it) so a
// downstream chat client still sees a thinking stream instead of an empty
// summary. Mirrors the Codex executor's `ensureCodexReasoningSummary`. An
// explicit `reasoning` object from a Responses-shaped client is preserved as-is.
const DEFAULT_RESPONSES_REASONING_SUMMARY = "auto";
const RESPONSES_REASONING_ENCRYPTED_CONTENT_INCLUDE = "reasoning.encrypted_content";
// Chat Completions `response_format: { type: "json_schema" }` → Responses API `text.format`.
// Merges into any existing `result.text` (e.g. verbosity) so structured-output schemas from
// Chat clients survive the translation to the Responses/Codex upstream (#5933).
function mapChatResponseFormatToResponsesText(body, result) {
    const responseFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(body.response_format);
    if (responseFormat.type !== "json_schema") return;
    const jsonSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(responseFormat.json_schema);
    if (jsonSchema.schema === undefined) return;
    const existingText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(result.text);
    const format = {
        type: "json_schema",
        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(jsonSchema.name, "codex_output_schema"),
        schema: jsonSchema.schema
    };
    if (jsonSchema.description !== undefined) format.description = jsonSchema.description;
    if (jsonSchema.strict !== undefined) format.strict = jsonSchema.strict;
    result.text = {
        ...existingText,
        format
    };
}
// Convert a Chat-Completions content block (string or text-part array) into the
// Responses API `input_text` part array used by message input items.
function buildResponsesTextParts(content) {
    if (typeof content === "string") {
        return [
            {
                type: "input_text",
                text: content
            }
        ];
    }
    if (Array.isArray(content)) {
        const parts = [];
        for (const partValue of content){
            // A bare string inside the content array is a real text instruction
            // (e.g. a harness-injected system reminder), not a structured part.
            // Silently dropping it lost the instruction (#6954 follow-up).
            if (typeof partValue === "string") {
                parts.push({
                    type: "input_text",
                    text: partValue
                });
                continue;
            }
            const part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(partValue);
            if (part.type === "text" || typeof part.text === "string") {
                parts.push({
                    type: "input_text",
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(part.text)
                });
            }
        }
        return parts.length > 0 ? parts : [
            {
                type: "input_text",
                text: ""
            }
        ];
    }
    return [
        {
            type: "input_text",
            text: ""
        }
    ];
}
function openaiToOpenAIResponsesRequest(model, body, stream, credentials) {
    void stream;
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(body);
    const credentialRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(credentials);
    const storeEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isOpenAIResponsesStoreEnabled"])(credentialRecord.providerSpecificData);
    const result = {
        model,
        input: [],
        stream: true
    };
    if (!storeEnabled) {
        result.store = false;
    }
    const input = result.input;
    // Extract first system message as instructions
    let hasSystemMessage = false;
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toArray"])(root.messages);
    for (const messageValue of messages){
        const msg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(messageValue);
        const role = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(msg.role);
        if (role === "system" || role === "developer") {
            if (!hasSystemMessage) {
                result.instructions = typeof msg.content === "string" ? msg.content : "";
                hasSystemMessage = true;
                continue;
            }
            // Mid-conversation system/developer turns (e.g. harness-injected reminders
            // from Claude Code) must survive as developer-role input items. The
            // Responses API supports the `developer` role for exactly this; mapping
            // them to `assistant` misattributes harness instructions as model output,
            // and silently dropping them loses them entirely (#6954).
            input.push({
                type: "message",
                role: "developer",
                content: buildResponsesTextParts(msg.content),
                status: "completed"
            });
            continue;
        }
        // Convert user messages
        if (role === "user") {
            const content = typeof msg.content === "string" ? [
                {
                    type: "input_text",
                    text: msg.content
                }
            ] : Array.isArray(msg.content) ? msg.content.map((contentValue)=>{
                const contentItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(contentValue);
                if (contentItem.type === "text") {
                    return {
                        type: "input_text",
                        text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(contentItem.text)
                    };
                }
                if (contentItem.type === "image_url") {
                    const imgUrl = contentItem.image_url;
                    const imgResult = {
                        type: "input_image",
                        image_url: typeof imgUrl === "string" ? imgUrl : imgUrl?.url || ""
                    };
                    if (typeof imgUrl === "object" && imgUrl?.detail !== undefined) {
                        imgResult.detail = imgUrl.detail;
                    }
                    return imgResult;
                }
                if (contentItem.type === "image" && typeof contentItem.image === "string" && /^data:([^;]+);base64,(.+)$/.test(contentItem.image)) {
                    // AI SDK-style image part: { type: "image", image: "data:...;base64,..." } (#1330)
                    const imgResult = {
                        type: "input_image",
                        image_url: contentItem.image,
                        detail: contentItem.detail !== undefined ? contentItem.detail : "auto"
                    };
                    return imgResult;
                }
                if (contentItem.type === "file" || contentItem.type === "document") {
                    // Accept both the OpenAI `file` shape and the Gemini-style `document` shape,
                    // and map the bare `data`/`url` fields too, so a PDF reaches Codex/Responses
                    // regardless of which content-part name the client used (#2515).
                    const file = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(contentItem.type === "document" ? contentItem.document : contentItem.file);
                    const fileResult = {
                        type: "input_file"
                    };
                    if (file.file_data !== undefined) fileResult.file_data = file.file_data;
                    else if (file.data !== undefined) fileResult.file_data = file.data;
                    if (file.file_id !== undefined) fileResult.file_id = file.file_id;
                    if (file.file_url !== undefined) fileResult.file_url = file.file_url;
                    else if (file.url !== undefined) fileResult.file_url = file.url;
                    if (file.filename !== undefined) fileResult.filename = file.filename;
                    else if (file.name !== undefined) fileResult.filename = file.name;
                    return fileResult;
                }
                return contentValue;
            }) : [
                {
                    type: "input_text",
                    text: ""
                }
            ];
            input.push({
                type: "message",
                role: "user",
                content,
                status: "completed"
            });
        }
        // Convert assistant messages
        if (role === "assistant") {
            // Skip reasoning_content — OpenAI Responses API requires server-generated
            // rs_* IDs for reasoning items. Synthesizing client-side IDs (e.g. reasoning_N)
            // causes 400 errors from Responses-compatible upstreams. (#224)
            // Skip thinking blocks in array content — same rs_* ID constraint applies
            // Build assistant output content
            const outputContent = [];
            if (typeof msg.content === "string" && msg.content) {
                outputContent.push({
                    type: "output_text",
                    text: msg.content
                });
            } else if (Array.isArray(msg.content)) {
                for (const contentValue of msg.content){
                    const contentItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(contentValue);
                    if (contentItem.type === "text") {
                        outputContent.push({
                            type: "output_text",
                            text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(contentItem.text)
                        });
                    } else if (contentItem.type === "image_url") {
                        const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["imageUrlToText"])(contentItem.image_url);
                        outputContent.push({
                            type: "output_text",
                            text: url ? `[Image: ${url}]` : "[Image]"
                        });
                    } else if (contentItem.type === "thinking" || contentItem.type === "redacted_thinking") {
                        continue;
                    } else {
                        outputContent.push(contentValue);
                    }
                }
            }
            // Only add assistant message if content exists
            if (outputContent.length > 0) {
                input.push({
                    type: "message",
                    role: "assistant",
                    content: outputContent,
                    status: "completed"
                });
            }
            // Convert tool_calls to function_call items
            if (Array.isArray(msg.tool_calls)) {
                for (const toolCallValue of msg.tool_calls){
                    const toolCall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolCallValue);
                    const fn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolCall.function);
                    // Skip tool calls with empty names to avoid infinite placeholder_tool loops
                    const fnName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(fn.name).trim();
                    if (!fnName) {
                        continue;
                    }
                    input.push({
                        type: "function_call",
                        call_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clampCallId"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(toolCall.id).trim() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["generateToolCallId"])()),
                        name: fnName,
                        arguments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(fn.arguments, "{}"),
                        status: "completed"
                    });
                }
            }
            // Handle deprecated function_call field (pre-tool_calls API)
            if (msg.function_call && !msg.tool_calls) {
                const fc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(msg.function_call);
                const fnName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(fc.name).trim();
                if (fnName) {
                    input.push({
                        type: "function_call",
                        call_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clampCallId"])(`call_${fnName}`),
                        name: fnName,
                        arguments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(fc.arguments, "{}"),
                        status: "completed"
                    });
                }
            }
        }
        // Convert tool results
        if (role === "tool") {
            input.push({
                type: "function_call_output",
                call_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clampCallId"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(msg.tool_call_id)),
                output: typeof msg.content === "string" ? msg.content : Array.isArray(msg.content) ? msg.content.map((c)=>{
                    const part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(c);
                    if (part.type === "text") return {
                        type: "input_text",
                        text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(part.text)
                    };
                    return c;
                }) : String(msg.content ?? ""),
                status: "completed"
            });
        }
        // Handle deprecated function role messages
        if (role === "function") {
            input.push({
                type: "function_call_output",
                call_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clampCallId"])(`call_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(msg.name)}`),
                output: typeof msg.content === "string" ? msg.content : String(msg.content ?? ""),
                status: "completed"
            });
        }
    }
    // Filter orphaned function_call_output items (no matching function_call)
    // This happens when Claude Code compaction removes messages but leaves tool results
    const knownCallIds = new Set(input.filter((item)=>item.type === "function_call" && item.call_id).map((item)=>item.call_id));
    result.input = input.filter((item)=>{
        if (item.type === "function_call_output" && item.call_id) {
            return knownCallIds.has(item.call_id);
        }
        return true;
    });
    // If no system message, keep empty instructions
    if (!hasSystemMessage) {
        result.instructions = "";
    }
    // Convert tools format
    if (Array.isArray(root.tools)) {
        result.tools = root.tools.map((toolValue)=>{
            const tool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolValue);
            if (tool.type === "function") {
                const fn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(tool.function);
                const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(fn.name);
                return {
                    type: "function",
                    name,
                    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(fn.description),
                    parameters: fn.parameters,
                    strict: fn.strict
                };
            }
            return toolValue;
        });
    }
    // Translate tool_choice: Chat {type,function:{name}} → Responses {type,name}
    if (root.tool_choice !== undefined) {
        if (typeof root.tool_choice === "string") {
            result.tool_choice = root.tool_choice;
        } else if (typeof root.tool_choice === "object" && !Array.isArray(root.tool_choice)) {
            const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(root.tool_choice);
            if (tc.type === "function" && tc.function) {
                const fn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(tc.function);
                result.tool_choice = {
                    type: "function",
                    name: fn.name
                };
            } else {
                result.tool_choice = root.tool_choice;
            }
        } else {
            result.tool_choice = root.tool_choice;
        }
    }
    // Pass through relevant fields
    if (root.previous_response_id !== undefined) {
        result.previous_response_id = root.previous_response_id;
    }
    if (root.prompt_cache_key !== undefined) {
        result.prompt_cache_key = root.prompt_cache_key;
    }
    if (root.session_id !== undefined) {
        result.session_id = root.session_id;
    }
    if (root.conversation_id !== undefined) {
        result.conversation_id = root.conversation_id;
    }
    if (root.service_tier !== undefined) result.service_tier = root.service_tier;
    if (root.temperature !== undefined) result.temperature = root.temperature;
    // Translate max_tokens / max_completion_tokens → max_output_tokens for Responses API.
    // The Responses API does not accept max_tokens or max_completion_tokens; it requires
    // max_output_tokens. max_completion_tokens takes priority as the newer Chat Completions field.
    if (root.max_completion_tokens !== undefined) {
        result.max_output_tokens = root.max_completion_tokens;
    } else if (root.max_tokens !== undefined) {
        result.max_output_tokens = root.max_tokens;
    }
    if (root.top_p !== undefined) result.top_p = root.top_p;
    mapChatResponseFormatToResponsesText(root, result);
    // GPT-5 verbosity: Chat Completions `verbosity` → Responses `text.verbosity`.
    const chatVerbosity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeVerbosity"])(root.verbosity);
    if (chatVerbosity) {
        result.text = {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(result.text),
            verbosity: chatVerbosity
        };
    }
    let defaultedReasoningSummary = false;
    if (root.reasoning !== undefined) {
        result.reasoning = root.reasoning;
    } else if (root.reasoning_effort !== undefined) {
        const effort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeResponsesReasoningEffort"])(root.reasoning_effort, model ?? root.model);
        if (effort && effort !== "none") {
            // Effort-only chat request: default a reasoning summary so the upstream
            // streams thinking back (see the constant's note above).
            result.reasoning = {
                effort,
                summary: DEFAULT_RESPONSES_REASONING_SUMMARY
            };
            defaultedReasoningSummary = true;
        } else if (effort) {
            result.reasoning = {
                effort
            };
        }
    }
    // Propagate Responses-API-only fields when a chat client sent them.
    // Without this, e.g. `include: ["reasoning.encrypted_content"]` is lost on
    // the way upstream and Codex returns an empty reasoning summary, so clients
    // (OpenCode, Cursor, etc.) see no thinking stream.
    if (Array.isArray(root.include) && root.include.length > 0) {
        result.include = root.include;
    }
    // When we defaulted a reasoning summary above, also request the encrypted
    // reasoning content so the summary actually streams back to the chat client.
    if (defaultedReasoningSummary) {
        const include = Array.isArray(result.include) ? result.include : [];
        if (!include.includes(RESPONSES_REASONING_ENCRYPTED_CONTENT_INCLUDE)) {
            result.include = [
                ...include,
                RESPONSES_REASONING_ENCRYPTED_CONTENT_INCLUDE
            ];
        }
    }
    if (storeEnabled) {
        if (root[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RESPONSES_STORE_MARKER"]] !== undefined) {
            result.store = root[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RESPONSES_STORE_MARKER"]];
        } else if (root.store !== undefined) {
            result.store = root.store;
        }
    }
    return result;
}
}),
"[project]/open-sse/translator/request/openai-responses.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openaiResponsesToOpenAIRequest",
    ()=>openaiResponsesToOpenAIRequest
]);
/**
 * Translator: OpenAI Responses API -> OpenAI Chat Completions
 *
 * Responses API uses: { input: [...], instructions: "..." }
 * Chat API uses: { messages: [...] }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesInputNormalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesInputNormalization.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$additionalTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/additionalTools.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$namespaceFlatten$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/namespaceFlatten.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$toResponses$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/toResponses.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/helpers.ts [instrumentation] (ecmascript)");
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
 * #8459: Convert a tool output content-part array to a safe string for Chat Completions
 * tool content. Responses API tool outputs can contain `input_image` parts which have no
 * equivalent in Chat Completions `tool` messages — JSON.stringify would embed the raw
 * base64 as inert text. Instead, extract text parts and replace images with a placeholder.
 *
 * @param output - The tool output value (string, array of content parts, or other JSON)
 * @returns A plain string safe for Chat Completions `tool` message content.
 */ function toolOutputContentToString(output) {
    if (typeof output === "string") return output;
    if (!Array.isArray(output)) return JSON.stringify(output);
    const parts = [];
    for (const item of output){
        if (typeof item !== "object" || item === null) {
            parts.push(String(item));
            continue;
        }
        const rec = item;
        const type = typeof rec.type === "string" ? rec.type : "";
        if (type === "input_text" || type === "output_text") {
            const text = typeof rec.text === "string" ? rec.text : "";
            if (text) parts.push(text);
        } else if (type === "input_image") {
            parts.push("[Image omitted: not supported on Chat Completions tool results]");
        } else {
            // Unknown part type — stringify as fallback
            try {
                parts.push(JSON.stringify(item));
            } catch  {
                parts.push(String(item));
            }
        }
    }
    return parts.join("\n");
}
function openaiResponsesToOpenAIRequest(model, body, stream, credentials) {
    void stream;
    void credentials;
    const collapseToPlainString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["requiresPlainStringContent"])(extractProviderHint(model));
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(body);
    if (root.input === undefined) return body;
    const credentialRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(credentials);
    const storeEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isOpenAIResponsesStoreEnabled"])(credentialRecord.providerSpecificData);
    const rawInputItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesInputNormalization$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeResponsesInputForChat"])(root.input);
    // Tools may be declared at the Responses top level or in one or more
    // `additional_tools` input items. Normalize both forms before validation/conversion so
    // every downgraded provider receives the same available tool set.
    const tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$additionalTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collectResponsesTools"])(root.tools, rawInputItems);
    if (tools.length > 0) {
        for (const toolValue of tools){
            const tool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolValue);
            const toolType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.type);
            // Allow: function tools, tools already in Chat format (have .function property), CLI subagent tools,
            // namespace tools (MCP tool groups used by Codex/OpenAI Responses API), and web_search server tools
            // (Anthropic versioned: web_search_20250305, web_search_20250101, etc. — or plain web_search).
            // tool_search is a Responses API built-in sent by newer Codex clients; silently skip it here
            // (it will be filtered out during tools conversion below). x_search (#8964) same pattern.
            if (toolType && toolType !== "function" && toolType !== "custom" && toolType !== "command" && toolType !== "namespace" && toolType !== "local_shell" && !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_SEARCH_TOOL_TYPES"].test(toolType) && !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["X_SEARCH_TOOL_TYPES"].test(toolType) && !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["TOOL_SEARCH_TOOL_TYPES"].test(toolType) && !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["IMAGE_GENERATION_TOOL_TYPES"].test(toolType) && !tool.function) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])(`Unsupported Responses API feature: ${toolType} tool type is not supported by omniroute`);
            }
        }
    }
    const result = {
        ...root
    };
    // Request-scoped response-side identity for Responses namespace child tools.
    // The Chat wire `tool.function.name` is the namespace-qualified name (#8295:
    // folding the namespace in makes cross-namespace leaf collisions structurally
    // impossible), and the original `{namespace, name}` pair is retained in this
    // side-band map so the response translator can emit codex-compatible
    // `namespace` + `name` fields without reparsing the wire name.
    const namespaceToolIdentityMap = new Map();
    // #7533: `verbosity` and `prompt_cache_key` are GPT-5/OpenAI-only Chat Completions
    // parameters. A strict-protocol non-OpenAI upstream (NVIDIA confirmed by the reporter;
    // likely also GLM/Kimi/Deepseek direct endpoints) 400s on unrecognized top-level
    // parameters, so they must only survive the downgrade when the destination really is
    // an OpenAI-operated endpoint.
    //
    // Allowlist, NOT a denylist: over-stripping costs a cache hit, over-preserving costs a
    // hard 400. `codex` is in the list because it IS an OpenAI upstream
    // (chatgpt.com/backend-api/codex) and is precisely the destination #517 needed
    // `prompt_cache_key` preserved for — /v1/responses runs every request through this
    // downgrade (handleResponsesCore -> convertResponsesApiFormat) regardless of provider,
    // so gating on "openai" alone silently re-broke Codex prompt caching. Other
    // OpenAI-compatible passthroughs (e.g. Azure OpenAI) are deliberately NOT assumed in —
    // add them only with evidence that the endpoint accepts these fields.
    const OPENAI_PARAM_DESTINATIONS = new Set([
        "openai",
        "codex"
    ]);
    const isOpenAIDestination = OPENAI_PARAM_DESTINATIONS.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(credentialRecord.provider));
    // GPT-5 verbosity: Responses `text.verbosity` → Chat Completions top-level `verbosity`.
    // Chat has no `text` wrapper, so carry the level across and drop the Responses-only
    // `text` object (a strict Chat endpoint 400s on unknown fields).
    const responsesVerbosity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeVerbosity"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(result.text).verbosity);
    if (responsesVerbosity && isOpenAIDestination) result.verbosity = responsesVerbosity;
    const responsesTextFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(result.text).format);
    if (responsesTextFormat.type === "json_schema" && responsesTextFormat.schema !== undefined) {
        const jsonSchema = {
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(responsesTextFormat.name, "response"),
            schema: responsesTextFormat.schema
        };
        if (responsesTextFormat.description !== undefined) {
            jsonSchema.description = responsesTextFormat.description;
        }
        if (responsesTextFormat.strict !== undefined) jsonSchema.strict = responsesTextFormat.strict;
        result.response_format = {
            type: "json_schema",
            json_schema: jsonSchema
        };
    } else if (responsesTextFormat.type === "json_object") {
        result.response_format = {
            type: "json_object"
        };
    }
    delete result.text;
    // background: true requests a deferred Responses API run (the upstream
    // returns 202 with response_id and the client polls GET /responses/<id>).
    // OmniRoute is a forward proxy that streams responses synchronously —
    // implementing the queue/poll contract would require persistence and a
    // separate retrieval surface. Degrade: log a marker when true was
    // actually requested (operators can observe clients that should be
    // reconfigured) and strip the flag. Clients that set background=true
    // opportunistically (Capy Captain Pro, Codex agents) work unchanged.
    // Clients that strictly require the async contract still observe a
    // completed response on the first poll and can adapt.
    if (result.background === true) {
        const providerStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(credentialRecord.provider);
        const modelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(model);
        console.warn(`BACKGROUND_DEGRADE provider=${providerStr || "unknown"} model=${modelStr || "unknown"}`);
    }
    if (result.background !== undefined) {
        delete result.background;
    }
    const messages = [];
    result.messages = messages;
    // Convert instructions to system message
    if (typeof root.instructions === "string" && root.instructions.length > 0) {
        messages.push({
            role: "system",
            content: root.instructions
        });
    }
    // Group items by conversation turn
    let currentAssistantMsg = null;
    let pendingToolResults = [];
    // Upstream providers reject messages:[] with "400: at least one message is required".
    // When the client sends input:[] (empty), inject a placeholder user message — mirrors
    // upstream 9router#419 (and the existing empty-string handling elsewhere in this file).
    const inputItems = rawInputItems.length === 0 ? [
        {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "..."
                }
            ]
        }
    ] : rawInputItems;
    for (const itemValue of inputItems){
        const item = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(itemValue);
        // Determine item type - Droid CLI sends role-based items without 'type' field
        // Fallback: if no type but has role property, treat as message
        const itemType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.type) || (item.role ? "message" : "");
        if (itemType === "message") {
            // Flush pending assistant message with tool calls
            if (currentAssistantMsg) {
                messages.push(currentAssistantMsg);
                currentAssistantMsg = null;
            }
            // Flush pending tool results
            if (pendingToolResults.length > 0) {
                for (const toolResult of pendingToolResults){
                    messages.push(toolResult);
                }
                pendingToolResults = [];
            }
            // Convert content: input_text -> text, output_text -> text
            const content = Array.isArray(item.content) ? item.content.map((contentValue)=>{
                const contentItem = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(contentValue);
                if (contentItem.type === "input_text") {
                    return {
                        type: "text",
                        text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(contentItem.text)
                    };
                }
                if (contentItem.type === "output_text") {
                    return {
                        type: "text",
                        text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(contentItem.text)
                    };
                }
                if (contentItem.type === "refusal") {
                    return {
                        type: "text",
                        text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(contentItem.refusal)
                    };
                }
                if (contentItem.type === "input_image") {
                    const imgResult = {
                        type: "image_url",
                        image_url: {
                            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(contentItem.image_url)
                        }
                    };
                    if (contentItem.detail !== undefined) {
                        imgResult.image_url.detail = contentItem.detail;
                    }
                    return imgResult;
                }
                if (contentItem.type === "input_file") {
                    const fileObj = {};
                    if (contentItem.file_data !== undefined) fileObj.file_data = contentItem.file_data;
                    if (contentItem.file_id !== undefined) fileObj.file_id = contentItem.file_id;
                    if (contentItem.file_url !== undefined) fileObj.file_url = contentItem.file_url;
                    if (contentItem.filename !== undefined) fileObj.filename = contentItem.filename;
                    return {
                        type: "file",
                        file: fileObj
                    };
                }
                return contentValue;
            }) : item.content;
            messages.push({
                role: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.role),
                content
            });
            continue;
        }
        if (itemType === "function_call") {
            // Skip tool calls with empty names to avoid infinite placeholder_tool loops
            const fnName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.name).trim();
            if (!fnName) {
                continue;
            }
            // #2893: Skip tool calls with an empty call_id — they can never be matched
            // to their function_call_output, so the upstream rejects the orphaned tool
            // result with "Messages with role 'tool' must be a response to a preceding
            // message with 'tool_calls'". Dropping the unmatched pair avoids the 400.
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.call_id).trim()) {
                continue;
            }
            // Start or append assistant message with tool_calls
            if (!currentAssistantMsg) {
                currentAssistantMsg = {
                    role: "assistant",
                    content: null,
                    tool_calls: []
                };
            }
            const toolCalls = Array.isArray(currentAssistantMsg.tool_calls) ? currentAssistantMsg.tool_calls : [];
            toolCalls.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.call_id),
                type: "function",
                function: {
                    name: fnName,
                    arguments: typeof item.arguments === "string" ? item.arguments : JSON.stringify(item.arguments ?? {})
                }
            });
            currentAssistantMsg.tool_calls = toolCalls;
            continue;
        }
        if (itemType === "function_call_output") {
            // Flush assistant message first if present
            if (currentAssistantMsg) {
                messages.push(currentAssistantMsg);
                currentAssistantMsg = null;
            }
            // Flush pending tool results first
            if (pendingToolResults.length > 0) {
                for (const toolResult of pendingToolResults){
                    messages.push(toolResult);
                }
                pendingToolResults = [];
            }
            // Add tool result immediately
            messages.push({
                role: "tool",
                tool_call_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.call_id),
                content: toolOutputContentToString(item.output)
            });
            continue;
        }
        if (itemType === "custom_tool_call") {
            // Codex custom tool call (e.g. apply_patch): `input` is a raw string, not JSON
            // arguments. Map it onto the assistant tool_calls list as a function call whose
            // arguments wrap the raw string as { input }, matching the { input: string }
            // schema the request-side tools normalization advertises for custom tools.
            const fnName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.name).trim();
            if (!fnName) {
                continue;
            }
            if (!currentAssistantMsg) {
                currentAssistantMsg = {
                    role: "assistant",
                    content: null,
                    tool_calls: []
                };
            }
            const toolCalls = Array.isArray(currentAssistantMsg.tool_calls) ? currentAssistantMsg.tool_calls : [];
            toolCalls.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.call_id),
                type: "function",
                function: {
                    name: fnName,
                    arguments: JSON.stringify({
                        input: item.input
                    })
                }
            });
            currentAssistantMsg.tool_calls = toolCalls;
            continue;
        }
        if (itemType === "custom_tool_call_output") {
            // Result of a custom tool call — translate the same way as function_call_output.
            if (currentAssistantMsg) {
                messages.push(currentAssistantMsg);
                currentAssistantMsg = null;
            }
            if (pendingToolResults.length > 0) {
                for (const toolResult of pendingToolResults){
                    messages.push(toolResult);
                }
                pendingToolResults = [];
            }
            // Unwrap JSON-wrapped output {"output":"...","metadata":{...}} → plain string.
            // #8459: handle content-part arrays that may contain input_image without
            // stringifying raw base64 as text.
            const rawOut = toolOutputContentToString(item.output);
            let toolContent = rawOut;
            try {
                const parsed = JSON.parse(rawOut);
                if (parsed && typeof parsed.output === "string") toolContent = parsed.output;
            } catch  {
            // Not JSON — keep the raw output as the tool content.
            }
            messages.push({
                role: "tool",
                tool_call_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(item.call_id),
                content: toolContent
            });
            continue;
        }
        if (itemType === "reasoning") {
            continue;
        }
        // Skip tool_search_call items. These are Responses-API-only metadata items
        // emitted by Codex's dynamic tool-search optimization: they record that the
        // model queried a subset of available tools, but carry no content that Chat
        // Completions can represent. Throwing here would break every multi-turn
        // conversation where Codex previously used tool_search (the whole session
        // would carry tool_search_call items forward in `input`). Skipping matches
        // the reasoning-item policy: display-only metadata, no chat side-effect.
        if (itemType === "tool_search_call" || itemType === "tool_search_result") {
            continue;
        }
        if (itemType === "additional_tools") {
            continue;
        }
        throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])(`Unsupported Responses API feature: input item type '${itemType || "missing"}' cannot be represented in Chat Completions`);
    }
    // Flush remainder
    if (currentAssistantMsg) {
        messages.push(currentAssistantMsg);
    }
    if (pendingToolResults.length > 0) {
        for (const toolResult of pendingToolResults){
            messages.push(toolResult);
        }
    }
    // Convert tools format
    if (tools.length > 0) {
        result.tools = tools.filter((toolValue)=>{
            const tool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolValue);
            const toolType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.type);
            // image_generation (#2950) is a Responses API server-side hosted tool with no
            // Chat Completions equivalent; drop it silently. tool_search (#2766) used to be
            // dropped here too, but it is a CLIENT-executed tool (Codex sends it with
            // `execution: "client"`) — see the flatMap branch below (#7532) for why it is
            // now mapped onto a Chat function tool instead of discarded.
            return !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["IMAGE_GENERATION_TOOL_TYPES"].test(toolType);
        }).flatMap((toolValue)=>{
            const tool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolValue);
            if (tool.function) return toolValue;
            const toolType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.type);
            // MCP tool groups: Codex/OpenAI Responses clients declare each MCP server as a
            // `namespace` tool — { type:"namespace", name, tools:[{name, description, parameters}] }.
            // Non-Codex backends (Kiro/Claude) have no `namespace` type, so flatten each sub-tool
            // into a standalone Chat function (#1534). Without this the whole group collapsed into
            // one empty-schema function named `mcp__<server>__` and every MCP call failed with
            // `unsupported call: mcp__<server>__`.
            if (toolType === "namespace") {
                const nsName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.name);
                const subTools = Array.isArray(tool.tools) ? tool.tools : [];
                return subTools.map((subValue)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(subValue)).filter((sub)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(sub.name)).map((sub)=>{
                    const leaf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(sub.name);
                    // #8295: fold the namespace into the wire name so two namespaces
                    // sharing a leaf (e.g. two MCP servers both exposing `_search`)
                    // never collide into duplicate Chat tool names. Stamp the
                    // identity for the response-side seam keyed on that qualified
                    // wire name — qualified names cannot collide across namespaces,
                    // so there is no ambiguity to detect/drop here anymore.
                    const wireName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$namespaceFlatten$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["flattenNamespaceToolName"])(nsName, leaf);
                    if (nsName && leaf) {
                        namespaceToolIdentityMap.set(wireName, {
                            namespace: nsName,
                            name: leaf
                        });
                    }
                    return {
                        type: "function",
                        function: {
                            name: wireName,
                            description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(sub.description),
                            parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(sub.type) === "custom" ? {
                                type: "object",
                                properties: {
                                    input: {
                                        type: "string"
                                    }
                                },
                                required: [
                                    "input"
                                ],
                                additionalProperties: false
                            } : sub.parameters ?? sub.input_schema ?? {
                                type: "object",
                                properties: {}
                            },
                            strict: sub.strict
                        }
                    };
                });
            }
            // tool_search (#2766) is a Responses API built-in Codex sends with
            // `execution: "client"` — the CLIENT (Codex CLI) resolves the call locally,
            // regardless of whether the wire format is Responses `{type:"tool_search"}` or
            // Chat `{type:"function"}`. Dropping it silently (as before) hid the tool from
            // the model entirely and broke Codex's lazy/deferred tool-loading protocol for
            // any provider downgraded to Chat Completions (#7532). Map it onto a normal
            // Chat function tool instead, mirroring the local_shell -> shell pattern below.
            if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["TOOL_SEARCH_TOOL_TYPES"].test(toolType)) {
                return {
                    type: "function",
                    function: {
                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.name) || "tool_search",
                        description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.description) || "Search for additional deferred tools by query.",
                        parameters: tool.parameters ?? {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "Natural-language or keyword query over available tools."
                                }
                            },
                            required: [
                                "query"
                            ]
                        }
                    }
                };
            }
            // Pass web_search server tools through with their original type (versioned or plain).
            // These have no Chat Completions equivalent; preserve as-is so upstreams that understand
            // Anthropic-style web_search_YYYYMMDD naming receive the exact name they expect.
            if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_SEARCH_TOOL_TYPES"].test(toolType)) {
                return toolValue;
            }
            if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["X_SEARCH_TOOL_TYPES"].test(toolType)) {
                return [];
            }
            // local_shell is a Responses API built-in (Codex CLI injects it for shell
            // execution). Non-OpenAI upstreams (Kiro/Claude) have no local_shell type,
            // so map it to a regular "shell" function tool. The response translator
            // already emits these as function_call, which Codex maps back to a shell call.
            if (toolType === "local_shell") {
                return {
                    type: "function",
                    function: {
                        name: "shell",
                        description: "Run a shell command and return its output.",
                        parameters: {
                            type: "object",
                            properties: {
                                command: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "Command and arguments to execute."
                                },
                                workdir: {
                                    type: "string",
                                    description: "Working directory."
                                },
                                timeout_ms: {
                                    type: "number",
                                    description: "Timeout in milliseconds."
                                }
                            },
                            required: [
                                "command"
                            ]
                        }
                    }
                };
            }
            // Responses API "hosted" tools (e.g. Codex's request_user_input,
            // { type: "request_user_input" }) carry no explicit `name` and cannot be
            // represented as a Chat Completions function declaration. Emitting them with
            // an empty name produces an anonymous functionDeclaration that downstream
            // providers such as Gemini reject with a 400 ("Invalid function name").
            // Skip any tool without a non-empty string name; named tools are unaffected.
            const name = tool.name;
            if (typeof name !== "string" || name.trim() === "") return [];
            // Custom/freeform tools (e.g. Codex apply_patch with type:"custom" and a grammar
            // format) carry no `parameters` field. Converting them to an empty function schema
            // makes downstream models invoke them with {}, but the Codex runtime expects
            // { input: string }. Normalize all custom tools to a well-defined { input: string }
            // schema so the model produces valid arguments. (#1007)
            if (toolType === "custom") {
                return {
                    type: "function",
                    function: {
                        name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.name),
                        description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.description),
                        parameters: {
                            type: "object",
                            properties: {
                                input: {
                                    type: "string"
                                }
                            },
                            required: [
                                "input"
                            ],
                            additionalProperties: false
                        },
                        strict: tool.strict
                    }
                };
            }
            return {
                type: "function",
                function: {
                    name,
                    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tool.description),
                    parameters: tool.parameters,
                    strict: tool.strict
                }
            };
        });
    }
    // Filter orphaned tool results (no matching tool_call in assistant messages)
    const allToolCallIds = new Set();
    for (const m of messages){
        const rec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(m);
        if (Array.isArray(rec.tool_calls)) {
            for (const tc of rec.tool_calls){
                if (tc.id) allToolCallIds.add(String(tc.id));
            }
        }
    }
    result.messages = messages.filter((m)=>{
        const rec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(m);
        // #2893: drop ANY tool result whose tool_call_id has no matching tool_call —
        // including empty/missing ids (the previous `&& rec.tool_call_id` guard let
        // empty-id orphans slip through and triggered an upstream 400).
        if (rec.role === "tool") {
            return allToolCallIds.has(String(rec.tool_call_id ?? ""));
        }
        return true;
    });
    // Translate tool_choice object format: Responses {type,name} → Chat {type,function:{name}}
    if (result.tool_choice && typeof result.tool_choice === "object" && !Array.isArray(result.tool_choice)) {
        const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(result.tool_choice);
        const tcType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tc.type);
        if (tcType === "function" && tc.name !== undefined && !tc.function) {
            result.tool_choice = {
                type: "function",
                function: {
                    name: tc.name
                }
            };
        } else if (tcType === "local_shell") {
            result.tool_choice = {
                type: "function",
                function: {
                    name: "shell"
                }
            };
        } else if (tcType === "allowed_tools") {
            const mode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(tc.mode);
            if (mode !== "auto" && mode !== "required") {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])(`Unsupported Responses API feature: allowed_tools mode '${mode || "missing"}' is not supported by omniroute`);
            }
            if (!Array.isArray(tc.tools) || tc.tools.length === 0) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])("Unsupported Responses API feature: allowed_tools requires at least one function tool");
            }
            const allowedNames = new Set();
            for (const allowedValue of tc.tools){
                const allowed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(allowedValue);
                const allowedType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(allowed.type);
                const allowedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(allowed.name).trim();
                if (allowedType !== "function" || !allowedName) {
                    throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])(`Unsupported Responses API feature: allowed_tools descriptor type '${allowedType || "missing"}' cannot be represented in Chat Completions`);
                }
                allowedNames.add(allowedName);
            }
            const chatTools = Array.isArray(result.tools) ? result.tools : [];
            const availableNames = new Set(chatTools.map((toolValue)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolValue).function).name)).filter(Boolean));
            const missingNames = [
                ...allowedNames
            ].filter((name)=>!availableNames.has(name));
            if (missingNames.length > 0) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])(`Unsupported Responses API feature: allowed_tools references unavailable function tool(s): ${missingNames.join(", ")}`);
            }
            // Keep the filtered array in a local: `result` is a Record<string, unknown>, so
            // reading `result.tools` back gives `unknown` and `.length` does not type-check.
            const allowedTools = chatTools.filter((toolValue)=>allowedNames.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(toolValue).function).name)));
            result.tools = allowedTools;
            if (allowedTools.length === 0) {
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])("Unsupported Responses API feature: allowed_tools resolved to zero Chat Completions function tools");
            }
            result.tool_choice = mode;
        } else if (tcType && tcType !== "function") {
            // Built-in tool types (web_search_preview, file_search, etc.) have no Chat equivalent
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsupportedFeature"])(`Unsupported Responses API feature: tool_choice type '${tcType}' is not supported by omniroute`);
        }
    }
    // Cleanup Responses API specific fields
    // Note: prompt_cache_key is intentionally preserved for OpenAI destinations — it is
    // used by Codex as a cache-affinity signal and stripping it unconditionally broke
    // prompt caching (#517). But #517's fix never added a provider gate, so it leaked to
    // every destination, OpenAI or not — a strict non-OpenAI upstream (NVIDIA) 400s on the
    // unrecognized field (#7533). Strip it for any non-OpenAI destination.
    if (!isOpenAIDestination) delete result.prompt_cache_key;
    delete result.input;
    delete result.instructions;
    delete result.include;
    if (storeEnabled && root.store !== undefined) {
        result[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RESPONSES_STORE_MARKER"]] = root.store;
    }
    delete result.store;
    // Promote Responses `reasoning.effort` to the Chat-Completions-native
    // `reasoning_effort` field so OpenAI-family upstreams (and the downstream
    // openai-to-claude translator's extended-thinking path) keep the hint when a
    // Responses client is routed across formats. The Copilot-only `summary` ->
    // Claude summarized-thinking marker stays behind the UA gate from
    // translateRequest because it is Copilot-specific glue, not an OpenAI-native
    // field. Ported from upstream PR decolua/9router#1817 (ryanngit).
    if (root.reasoning && typeof root.reasoning === "object" && !Array.isArray(root.reasoning)) {
        const reasoningRec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toRecord"])(root.reasoning);
        const effort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toString"])(reasoningRec.effort);
        if (effort && result.reasoning_effort === undefined) {
            result.reasoning_effort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeResponsesReasoningEffort"])(effort, model);
        }
        if (credentialRecord._copilotClient === true && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldRequestClaudeSummarizedThinking"])(reasoningRec.summary)) {
            result[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["COPILOT_REASONING_SUMMARY_MARKER"]] = "summarized";
        }
    }
    delete result.reasoning;
    // Strip Responses-API-only fields that Chat Completions rejects with 400.
    // safety_identifier is sent by LobeHub and has no Chat Completions equivalent (#2770).
    delete result.safety_identifier;
    // client_metadata is sent by Codex CLI and has no Chat Completions equivalent.
    // Strict upstreams (e.g. Mistral) reject it with HTTP 422 extra_forbidden.
    delete result.client_metadata;
    // truncation ("auto"/"disabled") is a Responses-API-only field with no Chat
    // Completions equivalent. Strict non-OpenAI upstreams (e.g. NVIDIA NIM) reject
    // it with HTTP 400 "Unsupported parameter(s): truncation" (#2311).
    delete result.truncation;
    // These fields configure Responses-owned state, caching, and tool execution limits.
    // Chat Completions has no equivalent and strict compatible endpoints reject them.
    delete result.max_tool_calls;
    delete result.conversation;
    delete result.prompt_cache_options;
    delete result.prompt_cache_retention;
    if (namespaceToolIdentityMap.size > 0) {
        // chatCore extracts and deletes this transient side channel before dispatch.
        // Non-enumerability keeps internal request metadata off the upstream wire.
        Object.defineProperty(result, "_toolNameMap", {
            value: namespaceToolIdentityMap,
            enumerable: false,
            configurable: true,
            writable: true
        });
    }
    // Every Responses-API input — even a plain string — gets wrapped upstream as a
    // single-element content array (`[{ type: "input_text", text }]` via
    // normalizeResponsesInputForChat), which this function maps straight through to
    // `content: [{ type: "text", text }]`. That's spec-valid (OpenAI's own API
    // accepts both shapes) but several strict/naive OpenAI-compatible backends only
    // implement the plain-string form and reject the array form with a 500 — hit
    // live via AI Horde's Aphrodite facade rejecting every /v1/responses request,
    // including the simplest single-string input. A single-text-part array and a
    // plain string are semantically identical, so collapsing is safe there; real
    // multi-part messages (text+image, text+file) are left untouched. Scoped to
    // providers that declare `requiresPlainStringContent` — most OpenAI-compatible
    // backends (and several existing tests) expect the standard array shape to
    // survive translation unchanged.
    if (collapseToPlainString) {
        for (const message of messages){
            const content = message.content;
            if (Array.isArray(content) && content.length === 1) {
                const part = content[0];
                if (part && typeof part === "object" && !Array.isArray(part) && part.type === "text" && typeof part.text === "string") {
                    message.content = part.text;
                }
            }
        }
    }
    return result;
}
/**
 * `model` is sometimes a bare provider id (e.g. "aihorde"), sometimes a
 * provider-prefixed model string (e.g. "aihorde/aphrodite/..."), and often
 * null/a bare model id with no provider info at all (the generic translator
 * dispatcher passes model id alone; provider is tracked separately there).
 * Only the first two carry a usable provider hint.
 */ function extractProviderHint(model) {
    if (typeof model !== "string" || model.length === 0) return "";
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegisteredProviders"])().includes(model)) return model;
    const prefix = model.split("/")[0];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegisteredProviders"])().includes(prefix) ? prefix : "";
}
// Register both directions
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, openaiResponsesToOpenAIRequest, null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$toResponses$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["openaiToOpenAIResponsesRequest"], null);
}),
"[project]/open-sse/translator/request/openai-to-kiro/messageHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure message/tool helpers for the OpenAI -> Kiro request translator.
// Extracted verbatim from openai-to-kiro.ts (no host imports).
__turbopack_context__.s([
    "normalizeKiroToolSchema",
    ()=>normalizeKiroToolSchema,
    "parseToolInput",
    ()=>parseToolInput,
    "serializeToolResultContent",
    ()=>serializeToolResultContent
]);
function parseToolInput(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    if (typeof value !== "string") {
        return {};
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return {};
    }
    try {
        const parsed = JSON.parse(trimmed);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function normalizeKiroToolSchema(schema) {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        return {
            type: "object",
            properties: {}
        };
    }
    const result = {};
    const src = schema;
    for (const [key, value] of Object.entries(src)){
        // Skip empty required arrays — Kiro rejects them
        if (key === "required" && Array.isArray(value) && value.length === 0) {
            continue;
        }
        // Skip additionalProperties — Kiro doesn't support it
        if (key === "additionalProperties") {
            continue;
        }
        // Recursively process nested objects
        if (key === "properties" && typeof value === "object" && value !== null && !Array.isArray(value)) {
            const sanitizedProps = {};
            for (const [propName, propValue] of Object.entries(value)){
                sanitizedProps[propName] = normalizeKiroToolSchema(propValue);
            }
            result[key] = sanitizedProps;
        } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            result[key] = normalizeKiroToolSchema(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map((item)=>typeof item === "object" && item !== null && !Array.isArray(item) ? normalizeKiroToolSchema(item) : item);
        } else {
            result[key] = value;
        }
    }
    return result;
}
function serializeToolResultContent(content) {
    if (typeof content === "string") {
        return content || "(no output)";
    }
    if (!Array.isArray(content)) {
        if (content !== null && content !== undefined) {
            try {
                return JSON.stringify(content);
            } catch  {
                return "(no output)";
            }
        }
        return "(no output)";
    }
    const parts = [];
    for (const block of content){
        if (!block || typeof block !== "object") continue;
        if (block.type === "text" && typeof block.text === "string") {
            if (block.text) parts.push(block.text);
        } else if (block.type === "image" || block.type === "image_url") {
            const src = block.source;
            const mediaType = src?.media_type ?? block.media_type ?? "image";
            parts.push(`[image: ${mediaType}]`);
        } else {
            try {
                const str = JSON.stringify(block);
                if (str && str !== "{}") parts.push(str);
            } catch  {
            // skip unserializable block
            }
        }
    }
    return parts.join("\n") || "(no output)";
}
}),
"[project]/open-sse/translator/request/openai-to-kiro/adaptiveThinking.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveKiroModelAlias",
    ()=>resolveKiroModelAlias,
    "supportsKiroAdaptiveThinking",
    ()=>supportsKiroAdaptiveThinking,
    "supportsKiroNativeReasoning",
    ()=>supportsKiroNativeReasoning
]);
/**
 * Kiro/AWS CodeWhisperer only accepts the adaptive-thinking
 * `additionalModelRequestFields` envelope for a narrow allowlist of models —
 * NOT the same set the generic Anthropic-API capability table
 * (`supportsReasoning()` in `@/lib/modelCapabilities`) marks as
 * thinking-capable. That table is correct for Anthropic's own API, but Kiro
 * rejects the field for `claude-sonnet-4.5` and `claude-haiku-4.5` with a raw
 * upstream 400 (`additionalModelRequestFields is not supported for this
 * model`, issue #6576) even though both ARE thinking-capable on Anthropic's
 * direct API. `claude-sonnet-5` is confirmed to accept the adaptive envelope
 * on Kiro today. GPT-5.6 models use Kiro's separate `reasoning.effort` shape,
 * not this Claude adaptive envelope.
 */ const KIRO_ADAPTIVE_THINKING_MODELS = new Set([
    "claude-sonnet-5"
]);
const KIRO_NATIVE_REASONING_MODELS = new Set([
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna"
]);
function supportsKiroAdaptiveThinking(normalizedModel) {
    return KIRO_ADAPTIVE_THINKING_MODELS.has(normalizedModel);
}
function supportsKiroNativeReasoning(normalizedModel) {
    return KIRO_NATIVE_REASONING_MODELS.has(normalizedModel);
}
const KIRO_UNSUPPORTED_AGENTIC_MESSAGE = "Kiro agentic aliases are not supported. The '-agentic' suffix did not change the " + "upstream request; select a real Kiro model instead.";
const KIRO_UNSUPPORTED_THINKING_MESSAGE = "This Kiro model does not support the '-thinking' alias. Use a model returned by Kiro's " + "live catalog with Thinking capability.";
const KIRO_REMOVED_AUTO_ALIAS_MESSAGE = "'auto-kiro' is not a real Kiro upstream model. Select a model returned by the live catalog.";
function resolveKiroModelAlias(model) {
    let upstream = String(model || "");
    if (upstream.endsWith("-agentic")) throw new Error(KIRO_UNSUPPORTED_AGENTIC_MESSAGE);
    if (upstream === "auto-kiro") throw new Error(KIRO_REMOVED_AUTO_ALIAS_MESSAGE);
    const thinking = upstream.endsWith("-thinking");
    if (thinking) upstream = upstream.slice(0, -"-thinking".length);
    upstream = upstream.replace(/^(claude-(?:opus|sonnet|haiku|3-\d+)-\d+)-(\d{1,2})$/, "$1.$2");
    if (thinking && !supportsKiroAdaptiveThinking(upstream)) {
        throw new Error(KIRO_UNSUPPORTED_THINKING_MESSAGE);
    }
    return {
        upstream,
        thinking
    };
}
}),
"[project]/open-sse/translator/request/openai-to-kiro.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KIRO_UNSUPPORTED_CONTEXT_1M_MESSAGE",
    ()=>KIRO_UNSUPPORTED_CONTEXT_1M_MESSAGE,
    "KIRO_UNSUPPORTED_CONTEXT_1M_SUFFIX",
    ()=>KIRO_UNSUPPORTED_CONTEXT_1M_SUFFIX,
    "buildKiroPayload",
    ()=>buildKiroPayload,
    "hasUnsupportedKiroContextSuffix",
    ()=>hasUnsupportedKiroContextSuffix
]);
/**
 * OpenAI to Kiro Request Translator
 * Converts OpenAI Chat Completions format to Kiro/AWS CodeWhisperer format
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v5$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__v5$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v5.js [instrumentation] (ecmascript) <locals> <export default as v5>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$messageHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-kiro/messageHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$adaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-kiro/adaptiveThinking.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
const KIRO_UNSUPPORTED_CONTEXT_1M_SUFFIX = "[1m]";
const KIRO_UNSUPPORTED_CONTEXT_1M_MESSAGE = "[kr/*] '[1m]' suffix is not supported by Kiro upstream. Kiro is AWS " + "Bedrock-backed and does not honor Anthropic's context-1m beta. Use a " + "direct-Anthropic provider for 1M-context routing.";
function hasUnsupportedKiroContextSuffix(model) {
    return typeof model === "string" && model.toLowerCase().includes(KIRO_UNSUPPORTED_CONTEXT_1M_SUFFIX);
}
/**
 * Wrap system-prompt content in <system-reminder> tags before it is merged into
 * a Kiro user message. Kiro/CodeWhisperer has no `system` role, so without this
 * the system prompt would appear as raw user text (issue #2306).
 */ function wrapSystemReminder(text) {
    return `<system-reminder>\n${text}\n</system-reminder>`;
}
/** Kiro rejects a `toolSpecification.description` longer than ~10000 chars. */ const KIRO_TOOL_DESC_MAX = 10000;
/**
 * Build Kiro `toolSpecification` entries, relocating any oversized description
 * out of the schema and returning it separately.
 *
 * Kiro answers a raw upstream 400 for a description over
 * {@link KIRO_TOOL_DESC_MAX}, so the schema keeps a pointer and the full text is
 * handed back to be prepended to the current turn's content — the same
 * relocation kiro-gateway performs in
 * `converters_core.py::process_tools_with_long_descriptions`.
 *
 * The docs are *returned* rather than stashed on the message object, because the
 * tool-bearing user turn is moved into `history` on every multi-turn request
 * (see the currentMessage promotion below). Carrying them on the message lost
 * them there — the model then saw only the pointer and no documentation — and
 * also leaked an unknown `_toolDocs` field into the upstream payload, which Kiro
 * rejects.
 */ function buildKiroToolSpecs(tools) {
    const docs = [];
    const specs = tools.map((t)=>{
        const name = t.function?.name || t.name;
        let description = t.function?.description || t.description || "";
        if (!description.trim()) {
            description = `Tool: ${name}`;
        }
        if (description.length > KIRO_TOOL_DESC_MAX) {
            docs.push(`## Tool: ${name}\n\n${description}`);
            description = `[Full documentation in system prompt under '## Tool: ${name}']`;
        }
        return {
            toolSpecification: {
                name,
                description,
                inputSchema: {
                    json: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$messageHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeKiroToolSchema"])(t.function?.parameters || t.parameters || t.input_schema || {})
                }
            }
        };
    });
    return {
        specs,
        docs: docs.join("\n\n---\n\n")
    };
}
/**
 * Convert OpenAI messages to Kiro format
 * Rules: system/tool/user -> user role, merge consecutive same roles
 */ function convertMessages(messages, tools, model) {
    let history = [];
    let currentMessage = null;
    let pendingUserContent = [];
    let pendingAssistantContent = [];
    let pendingToolResults = [];
    let pendingImages = [];
    let currentRole = null;
    let toolsAttached = false;
    let toolDocs = "";
    // Only Claude models support images in Kiro. Kiro also routes non-Claude
    // models (deepseek, minimax, glm, qwen3-coder-next) that do not accept image
    // attachments — gate image extraction behind a Claude check so we never
    // attach images those models would reject.
    const supportsImages = typeof model === "string" && model.toLowerCase().includes("claude");
    const flushPending = ()=>{
        if (currentRole === "user") {
            // Kiro accepts an empty user `content` when the turn carries toolResults or
            // images (the agentic tool-loop case), so the "(empty)" placeholder is only
            // needed for a genuinely bare turn. Without this check, a trailing
            // tool-result-only turn (no follow-up user text) would get the literal
            // "(empty)" injected as if the user had typed it, which can confuse Kiro.
            // See decolua/9router#2183 for the same bug class.
            const text = pendingUserContent.join("\n\n").trim();
            const hasContext = pendingToolResults.length > 0 || pendingImages.length > 0;
            const content = text || (hasContext ? "" : "(empty)");
            const userMsg = {
                userInputMessage: {
                    content: content,
                    modelId: "",
                    origin: "AI_EDITOR"
                }
            };
            if (pendingToolResults.length > 0) {
                userMsg.userInputMessage.userInputMessageContext = {
                    toolResults: pendingToolResults
                };
            }
            // Attach images to userInputMessage (NOT userInputMessageContext)
            if (pendingImages.length > 0) {
                userMsg.userInputMessage.images = pendingImages;
            }
            // Add tools to the first emitted user turn. We track a flag instead of
            // relying on `history.length === 0` because the first few messages may
            // be assistant turns (e.g. when role=undefined collapses to a prior
            // assistant turn), in which case the first user flush would already see
            // a non-empty history and lose the tools schema.
            if (tools && tools.length > 0 && !toolsAttached) {
                if (!userMsg.userInputMessage.userInputMessageContext) {
                    userMsg.userInputMessage.userInputMessageContext = {};
                }
                const built = buildKiroToolSpecs(tools);
                userMsg.userInputMessage.userInputMessageContext.tools = built.specs;
                if (built.docs) toolDocs = built.docs;
                toolsAttached = true;
            }
            history.push(userMsg);
            currentMessage = userMsg;
            pendingUserContent = [];
            pendingToolResults = [];
            pendingImages = [];
        } else if (currentRole === "assistant") {
            const content = pendingAssistantContent.join("\n\n").trim() || "(empty)";
            const assistantMsg = {
                assistantResponseMessage: {
                    content: content
                }
            };
            history.push(assistantMsg);
            pendingAssistantContent = [];
        }
    };
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        let role = msg.role;
        // Normalize: system/tool -> user
        if (role === "system" || role === "tool") {
            role = "user";
        }
        // If role changes, flush pending
        if (role !== currentRole && currentRole !== null) {
            flushPending();
        }
        currentRole = role;
        if (role === "user") {
            // Extract content
            let content = "";
            if (typeof msg.content === "string") {
                content = msg.content;
            } else if (Array.isArray(msg.content)) {
                const textParts = msg.content.filter((c)=>c.type === "text" || c.text).map((c)=>c.text || "");
                content = textParts.join("\n");
                // Extract images (OpenAI image_url and Anthropic image formats).
                // Skip entirely for models that do not support images — see supportsImages.
                for (const block of msg.content){
                    if (supportsImages && block.type === "image_url") {
                        const url = block.image_url?.url || "";
                        if (url.startsWith("data:")) {
                            // data:image/jpeg;base64,<data>
                            const [header, bytes] = url.split(",", 2);
                            const mediaType = header.split(";")[0].replace("data:", ""); // e.g. "image/jpeg"
                            const format = mediaType.split("/")[1] || "jpeg";
                            if (bytes) pendingImages.push({
                                format,
                                source: {
                                    bytes
                                }
                            });
                        }
                    } else if (supportsImages && block.type === "image" && block.source?.type === "base64") {
                        const format = (block.source.media_type || "image/jpeg").split("/")[1] || "jpeg";
                        if (block.source.data) pendingImages.push({
                            format,
                            source: {
                                bytes: block.source.data
                            }
                        });
                    } else if (supportsImages && block.type === "image" && typeof block.image === "string") {
                        // AI SDK-style image part: { type: "image", image: "data:...;base64,..." } (#1330)
                        const url = block.image;
                        if (url.startsWith("data:")) {
                            const [header, bytes] = url.split(",", 2);
                            const mediaType = header.split(";")[0].replace("data:", "");
                            const format = mediaType.split("/")[1] || "jpeg";
                            if (bytes) pendingImages.push({
                                format,
                                source: {
                                    bytes
                                }
                            });
                        }
                    }
                }
                // Check for tool_result blocks
                const toolResultBlocks = msg.content.filter((c)=>c.type === "tool_result");
                if (toolResultBlocks.length > 0) {
                    toolResultBlocks.forEach((block)=>{
                        const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$messageHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeToolResultContent"])(block.content);
                        pendingToolResults.push({
                            toolUseId: block.tool_use_id,
                            status: block.is_error ? "error" : "success",
                            content: [
                                {
                                    text: text
                                }
                            ]
                        });
                    });
                }
            }
            // Handle tool role (from normalized)
            if (msg.role === "tool") {
                // Reuse the shared serializer so non-string content (arrays, structured/JSON
                // blocks, images) is never collapsed to an empty string. CodeWhisperer rejects a
                // toolResult whose content is [{ text: "" }] with 400 "Improperly formed request"
                // — the same failure mode that hit the Anthropic tool_result path (issue #2446).
                const toolContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$messageHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeToolResultContent"])(msg.content);
                pendingToolResults.push({
                    toolUseId: msg.tool_call_id,
                    status: "success",
                    content: [
                        {
                            text: toolContent
                        }
                    ]
                });
            } else if (content) {
                // #2306: Kiro/CodeWhisperer has no `system` role, so system messages are
                // normalized to `user`. Wrap their content in <system-reminder> tags so
                // the model can tell the system prompt apart from real user input instead
                // of treating the full Claude Code prompt as something the user typed.
                pendingUserContent.push(msg.role === "system" ? wrapSystemReminder(content) : content);
            }
        } else if (role === "assistant") {
            // Extract text content and tool uses
            let textContent = "";
            let toolUses = [];
            if (Array.isArray(msg.content)) {
                const textBlocks = msg.content.filter((c)=>c.type === "text");
                textContent = textBlocks.map((b)=>b.text).join("\n").trim();
                const toolUseBlocks = msg.content.filter((c)=>c.type === "tool_use");
                toolUses = toolUseBlocks;
            } else if (typeof msg.content === "string") {
                textContent = msg.content.trim();
            }
            if (msg.tool_calls && msg.tool_calls.length > 0) {
                toolUses = msg.tool_calls;
            }
            if (textContent) {
                pendingAssistantContent.push(textContent);
            }
            // Store tool uses in last assistant message
            if (toolUses.length > 0) {
                if (pendingAssistantContent.length === 0) {
                // pendingAssistantContent.push("Call tools");
                }
                // Flush to create assistant message with toolUses
                flushPending();
                const lastMsg = history[history.length - 1];
                if (lastMsg?.assistantResponseMessage) {
                    const NAMESPACE_KIRO_TOOLUSE = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
                    lastMsg.assistantResponseMessage.toolUses = toolUses.map((tc, idx)=>{
                        if (tc.function) {
                            const stableId = tc.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v5$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__v5$3e$__["v5"])(`${tc.function.name}:${idx}`, NAMESPACE_KIRO_TOOLUSE);
                            return {
                                toolUseId: stableId,
                                name: tc.function.name,
                                input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$messageHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseToolInput"])(tc.function.arguments)
                            };
                        } else {
                            const stableId = tc.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v5$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__v5$3e$__["v5"])(`${tc.name}:${idx}`, NAMESPACE_KIRO_TOOLUSE);
                            return {
                                toolUseId: stableId,
                                name: tc.name,
                                input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$messageHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseToolInput"])(tc.input)
                            };
                        }
                    });
                }
                currentRole = null;
            }
        }
    }
    // Flush remaining
    if (currentRole !== null) {
        flushPending();
    }
    // Kiro requires currentMessage to be a user turn. If the request ends with a
    // user turn, move that final turn into currentMessage. If it ends with an
    // assistant/tool turn, synthesize a neutral filler ("...") instead of the
    // literal "Continue", which Kiro can read as a real instruction (#5231).
    if (history.length > 0 && history[history.length - 1].userInputMessage) {
        currentMessage = history.pop();
    } else {
        currentMessage = {
            userInputMessage: {
                content: "...",
                modelId: model
            }
        };
    }
    // Promote the tools schema to currentMessage. Tools may have been attached
    // to any user turn in history (e.g. when the first message was assistant or
    // had an undefined role, the first user flush lands further down). Scan the
    // whole history so we never lose the schema.
    if (!currentMessage?.userInputMessage?.userInputMessageContext?.tools) {
        const carrier = history.find((item)=>item?.userInputMessage?.userInputMessageContext?.tools);
        if (carrier?.userInputMessage?.userInputMessageContext?.tools) {
            if (!currentMessage.userInputMessage.userInputMessageContext) {
                currentMessage.userInputMessage.userInputMessageContext = {};
            }
            currentMessage.userInputMessage.userInputMessageContext.tools = carrier.userInputMessage.userInputMessageContext.tools;
        }
    }
    // Fallback: if the schema was never attached to any user turn (e.g. the
    // input contained no user messages and currentMessage is a synthesized
    // neutral-filler turn), attach the provided tools directly to currentMessage so
    // Kiro still sees the schema it needs to validate assistant.toolUses in
    // history.
    if (!toolsAttached && tools && tools.length > 0 && !currentMessage?.userInputMessage?.userInputMessageContext?.tools) {
        if (!currentMessage.userInputMessage.userInputMessageContext) {
            currentMessage.userInputMessage.userInputMessageContext = {};
        }
        const built = buildKiroToolSpecs(tools);
        currentMessage.userInputMessage.userInputMessageContext.tools = built.specs;
        if (built.docs) toolDocs = built.docs;
        toolsAttached = true;
    }
    // Clean up history for Kiro API compatibility
    history.forEach((item)=>{
        if (item.userInputMessage?.userInputMessageContext?.tools) {
            delete item.userInputMessage.userInputMessageContext.tools;
        }
        if (item.userInputMessage?.userInputMessageContext && Object.keys(item.userInputMessage.userInputMessageContext).length === 0) {
            delete item.userInputMessage.userInputMessageContext;
        }
        if (item.userInputMessage && !item.userInputMessage.modelId) {
            item.userInputMessage.modelId = model;
        }
        // Kiro API requires `origin` on every userInputMessage
        if (item.userInputMessage && !item.userInputMessage.origin) {
            item.userInputMessage.origin = "AI_EDITOR";
        }
    });
    // Kiro expects history to alternate between user and assistant turns. After
    // normalizing `system`/`tool` roles into `userInputMessage`, the history can
    // contain adjacent user turns, which Kiro can reject. Merge consecutive
    // `userInputMessage` entries by concatenating their content and preserving
    // any attached `userInputMessageContext` (e.g. accumulated toolResults).
    //
    // Why this is not redundant with the `flushPending` grouping in the main
    // loop: the assistant branch resets `currentRole = null` after emitting
    // `toolUses`. Any following `tool` role (normalized to user) and a
    // subsequent `user` role therefore each open their own flush, producing
    // two adjacent `userInputMessage` entries in history. This pass collapses
    // those.
    const mergedHistory = [];
    for (const item of history){
        const previous = mergedHistory[mergedHistory.length - 1];
        if (item.userInputMessage && previous?.userInputMessage) {
            const previousContent = previous.userInputMessage.content || "";
            const currentContent = item.userInputMessage.content || "";
            previous.userInputMessage.content = previousContent ? `${previousContent}\n\n${currentContent}` : currentContent;
            if (item.userInputMessage.userInputMessageContext) {
                const previousContext = previous.userInputMessage.userInputMessageContext || {};
                const nextContext = item.userInputMessage.userInputMessageContext;
                const mergedContext = {
                    ...previousContext
                };
                for (const [key, value] of Object.entries(nextContext)){
                    const existing = previousContext[key];
                    if (Array.isArray(existing) && Array.isArray(value)) {
                        mergedContext[key] = [
                            ...existing,
                            ...value
                        ];
                    } else {
                        mergedContext[key] = value;
                    }
                }
                previous.userInputMessage.userInputMessageContext = mergedContext;
            }
        } else if (item.assistantResponseMessage && previous?.assistantResponseMessage) {
            // Kiro API also rejects consecutive assistant messages. Merge them.
            const previousContent = previous.assistantResponseMessage.content || "";
            const currentContent = item.assistantResponseMessage.content || "";
            previous.assistantResponseMessage.content = previousContent ? `${previousContent}\n\n${currentContent}` : currentContent;
            if (item.assistantResponseMessage.toolUses) {
                const existingToolUses = previous.assistantResponseMessage.toolUses || [];
                previous.assistantResponseMessage.toolUses = [
                    ...existingToolUses,
                    ...item.assistantResponseMessage.toolUses
                ];
            }
        } else {
            mergedHistory.push(item);
        }
    }
    // Ensure first message is user. Kiro API requires conversations to start
    // with a user message (fixes "Improperly formed request" for assistant-first).
    if (mergedHistory.length > 0 && mergedHistory[0].assistantResponseMessage) {
        const syntheticUserTurn = {
            userInputMessage: {
                content: "(empty)",
                modelId: model,
                origin: "AI_EDITOR"
            }
        };
        // Mark as synthetic (non-enumerable so it doesn't leak to upstream JSON)
        // so conversationId derivation can skip it — otherwise every
        // assistant-first conversation collapses onto the same uuidv5(empty)
        // namespace and leaks AWS Builder ID context across unrelated sessions.
        Object.defineProperty(syntheticUserTurn, "__synthetic", {
            value: true,
            enumerable: false,
            configurable: true
        });
        mergedHistory.unshift(syntheticUserTurn);
    }
    // Ensure assistant exists before toolResults. Kiro API validates that every
    // toolResults array has a preceding assistantResponseMessage with toolUses.
    // When the assistant message is missing (truncated conversation), we strip
    // the orphaned toolResults and convert them to text to preserve context.
    for(let i = 0; i < mergedHistory.length; i++){
        const item = mergedHistory[i];
        if (!item.userInputMessage?.userInputMessageContext?.toolResults) continue;
        const prev = mergedHistory[i - 1];
        const hasPrecedingAssistant = prev?.assistantResponseMessage?.toolUses && prev.assistantResponseMessage.toolUses.length > 0;
        if (!hasPrecedingAssistant) {
            const toolResults = item.userInputMessage.userInputMessageContext.toolResults;
            const toolResultTexts = toolResults.map((tr)=>{
                const id = tr.toolUseId || "";
                const text = tr.content?.map((c)=>c.text || "").join("\n") || "";
                return id ? `[Tool Result (${id})]\n${text}` : `[Tool Result]\n${text}`;
            }).join("\n\n");
            const originalContent = item.userInputMessage.content || "";
            item.userInputMessage.content = originalContent ? `${originalContent}\n\n${toolResultTexts}` : toolResultTexts;
            delete item.userInputMessage.userInputMessageContext.toolResults;
            if (Object.keys(item.userInputMessage.userInputMessageContext).length === 0) {
                delete item.userInputMessage.userInputMessageContext;
            }
        }
    }
    // Also check currentMessage for orphaned toolResults (not in history)
    if (currentMessage?.userInputMessage?.userInputMessageContext?.toolResults) {
        const lastHistory = mergedHistory[mergedHistory.length - 1];
        const hasPrecedingAssistant = lastHistory?.assistantResponseMessage?.toolUses && lastHistory.assistantResponseMessage.toolUses.length > 0;
        if (!hasPrecedingAssistant) {
            const toolResults = currentMessage.userInputMessage.userInputMessageContext.toolResults;
            const toolResultTexts = toolResults.map((tr)=>{
                const id = tr.toolUseId || "";
                const text = tr.content?.map((c)=>c.text || "").join("\n") || "";
                return id ? `[Tool Result (${id})]\n${text}` : `[Tool Result]\n${text}`;
            }).join("\n\n");
            const originalContent = currentMessage.userInputMessage.content || "";
            currentMessage.userInputMessage.content = originalContent ? `${originalContent}\n\n${toolResultTexts}` : toolResultTexts;
            delete currentMessage.userInputMessage.userInputMessageContext.toolResults;
            if (Object.keys(currentMessage.userInputMessage.userInputMessageContext).length === 0) {
                delete currentMessage.userInputMessage.userInputMessageContext;
            }
        }
    }
    // Ensure alternating roles by inserting synthetic assistant messages
    // between consecutive user turns that couldn't be merged.
    const alternatingHistory = [];
    for (const item of mergedHistory){
        const last = alternatingHistory[alternatingHistory.length - 1];
        if (item.userInputMessage && last?.userInputMessage) {
            const syntheticAssistantTurn = {
                assistantResponseMessage: {
                    content: "(empty)"
                }
            };
            Object.defineProperty(syntheticAssistantTurn, "__synthetic", {
                value: true,
                enumerable: false,
                configurable: true
            });
            alternatingHistory.push(syntheticAssistantTurn);
        }
        alternatingHistory.push(item);
    }
    return {
        history: alternatingHistory,
        currentMessage,
        toolsAttached,
        toolDocs
    };
}
/** Kiro's accepted reasoning-effort levels (`output_config.effort`). */ const KIRO_EFFORT_LEVELS = [
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
];
/**
 * Resolve the Kiro effort level for a request, or "" when no reasoning was asked
 * for. Effort sources, in priority order:
 *   1. OpenAI-style `reasoning_effort`
 *   2. Anthropic adaptive-thinking `output_config.effort` (the canonical field)
 *   3. Anthropic `thinking` block — `{type:"enabled", budget_tokens}` mapped to a
 *      level via {@link effortFromBudget}; `{type:"adaptive"}` (no explicit
 *      effort) defaults to `high`, matching Anthropic's documented default
 *      (omitting `effort` ≡ `high`).
 * OpenAI's `minimal` collapses to `low` (Kiro has no `minimal`).
 */ function resolveKiroEffort(body) {
    let effort = typeof body.reasoning_effort === "string" ? body.reasoning_effort.toLowerCase() : "";
    if (!effort) {
        const outputConfig = body.output_config;
        if (outputConfig && typeof outputConfig === "object" && typeof outputConfig.effort === "string") {
            effort = outputConfig.effort.toLowerCase();
        }
    }
    if (!effort) {
        const thinking = body.thinking;
        if (thinking && typeof thinking === "object") {
            if (thinking.type === "enabled") {
                effort = effortFromBudget(Number(thinking.budget_tokens) || 0);
            } else if (thinking.type === "adaptive") {
                effort = "high";
            }
        }
    }
    if (effort === "minimal") effort = "low";
    return KIRO_EFFORT_LEVELS.includes(effort) ? effort : "";
}
/** Map an Anthropic `thinking.budget_tokens` to a coarse Kiro effort level. */ function effortFromBudget(budget) {
    if (budget >= 32000) return "high";
    if (budget >= 16000) return "medium";
    if (budget > 0) return "low";
    return "";
}
/**
 * Soft `<max_thinking_length>` budget for the Kiro prompt directive, per effort
 * level. Anthropic publishes no effort→token mapping (effort is "a behavioral
 * signal, not a strict token budget"), so this is a heuristic tuned against the
 * live CodeWhisperer stream, where a larger budget measurably deepens reasoning
 * up to the model cap. It is a hint the model may honor, not a hard cap (the hard
 * enable signal is `<thinking_mode>`); the caller clamps it to the model's cap.
 */ function thinkingLengthForEffort(effort) {
    switch(effort){
        case "max":
            return 120000;
        case "xhigh":
            return 64000;
        case "high":
            return 32000;
        case "medium":
            return 16000;
        default:
            return 8000; // low
    }
}
function buildKiroPayload(model, body, stream, credentials) {
    // Reject the Anthropic-only `[1m]` context beta before it reaches Bedrock —
    // Kiro cannot honor it and a forwarded `kr/*[1m]` id is malformed upstream.
    if (hasUnsupportedKiroContextSuffix(model)) {
        throw new Error(KIRO_UNSUPPORTED_CONTEXT_1M_MESSAGE);
    }
    // Normalize model name: Claude Code sends dashes (claude-sonnet-4-6),
    // Kiro API expects dots (claude-sonnet-4.6). Convert trailing version segment.
    // The minor group is bounded to 1-2 digits so date-suffixed ids (e.g.
    // claude-opus-4-20250514) are never mistaken for a dash-separated minor
    // version and corrupted into claude-opus-4.20250514 (upstream 9router #2270).
    // The supported `-thinking` selector is a local alias: strip it before the request leaves
    // OmniRoute so Kiro only receives a real upstream model ID. Non-functional agentic and
    // auto-kiro aliases are rejected above instead of silently degrading to another model.
    const { upstream: normalizedModel, thinking: modelRequestsThinking } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$adaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveKiroModelAlias"])(model);
    const messages = body.messages || [];
    let tools = body.tools || [];
    const maxTokens = body.max_tokens ?? body.max_completion_tokens ?? 32000;
    const temperature = body.temperature;
    const topP = body.top_p;
    // Kiro rejects history that references toolUses/toolResults without a tools
    // schema in userInputMessageContext. When callers omit body.tools but the
    // message history still contains assistant.tool_calls / role=tool turns,
    // synthesize a minimal tool schema from the tool names present in history
    // so Kiro accepts the request instead of returning `Improperly formed
    // request`. This preserves tool-call history and is a no-op when body.tools
    // is already populated.
    if (tools.length === 0) {
        const seen = new Set();
        const synthesized = [];
        const pushName = (name)=>{
            if (typeof name === "string" && name && !seen.has(name)) {
                seen.add(name);
                synthesized.push({
                    type: "function",
                    function: {
                        name,
                        description: `Tool: ${name}`,
                        parameters: {
                            type: "object",
                            properties: {},
                            required: []
                        }
                    }
                });
            }
        };
        for (const msg of messages){
            if (msg?.role !== "assistant") continue;
            if (Array.isArray(msg.tool_calls)) {
                for (const tc of msg.tool_calls){
                    pushName(tc?.function?.name || tc?.name);
                }
            }
            // Anthropic-style assistant blocks: content:[{type:"tool_use", name, ...}]
            if (Array.isArray(msg.content)) {
                for (const block of msg.content){
                    if (block?.type === "tool_use") {
                        pushName(block.name);
                    }
                }
            }
        }
        if (synthesized.length > 0) {
            tools = synthesized;
        }
    }
    const { history, currentMessage, toolsAttached, toolDocs } = convertMessages(messages, tools, normalizedModel);
    const profileArn = credentials?.providerSpecificData?.profileArn || "";
    let finalContent = currentMessage?.userInputMessage?.content || "";
    const timestamp = new Date().toISOString();
    finalContent = `[Context: Current time is ${timestamp}]\n\n${finalContent}`;
    // Prepend documentation for tools whose description was relocated out of
    // `toolSpecification` (see buildKiroToolSpecs). Driven by convertMessages'
    // return value, not the message object, so the docs survive the tool-bearing
    // turn being moved into `history` on a multi-turn request.
    if (toolDocs) {
        finalContent = `# Tool Documentation\n\n${toolDocs}\n\n---\n\n${finalContent}`;
    }
    const payload = {
        conversationState: {
            chatTriggerType: "MANUAL",
            conversationId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            currentMessage: {
                userInputMessage: {
                    content: finalContent,
                    modelId: normalizedModel,
                    origin: "AI_EDITOR",
                    ...currentMessage?.userInputMessage?.images?.length && {
                        images: currentMessage.userInputMessage.images
                    },
                    ...currentMessage?.userInputMessage?.userInputMessageContext && {
                        userInputMessageContext: currentMessage.userInputMessage.userInputMessageContext
                    }
                }
            },
            history: history
        }
    };
    // Deterministic session caching for Kiro.
    // Skip synthetic placeholder turns ("(empty)" injected for assistant-first
    // conversations or alternating-role gaps) — otherwise unrelated assistant-
    // first chats would all hash to the same uuidv5(empty) and reuse the same
    // upstream Kiro/AWS conversation context, leaking prior state across
    // sessions. See conversionMessages() above for the `__synthetic` marker.
    const NAMESPACE_KIRO = "34f7193f-561d-4050-bc84-9547d953d6bf";
    // Priority 1: Extract first user message from pre-compression body (passed by chatCore before
    // compressContext runs). This keeps conversationId stable even when compression alters content.
    // Priority 2: Deterministic hash from first user message in translated history (fallback).
    const preCompressionBody = credentials?._preCompressionBody;
    const preCompressionMessages = Array.isArray(preCompressionBody?.messages) ? preCompressionBody.messages : null;
    const preCompressionFirstUser = preCompressionMessages?.find((m)=>m.role === "user");
    const seedFromPreCompression = preCompressionFirstUser ? typeof preCompressionFirstUser.content === "string" ? preCompressionFirstUser.content : Array.isArray(preCompressionFirstUser.content) ? preCompressionFirstUser.content.filter((b)=>b.type === "text").map((b)=>b.text || "").join(" ") : "" : "";
    const firstRealUserTurn = history.find((h)=>h?.userInputMessage?.content && !h.__synthetic);
    const firstContent = seedFromPreCompression || firstRealUserTurn?.userInputMessage?.content || finalContent;
    // Use uuidv5 with the hash of the system prompt / first message to maintain AWS Builder ID context cache
    payload.conversationState.conversationId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v5$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__default__as__v5$3e$__["v5"])((firstContent || "").substring(0, 4000), NAMESPACE_KIRO);
    if (profileArn) {
        payload.profileArn = profileArn;
    }
    if (maxTokens || temperature !== undefined || topP !== undefined) {
        payload.inferenceConfig = {};
        if (maxTokens) payload.inferenceConfig.maxTokens = maxTokens;
        if (temperature !== undefined) payload.inferenceConfig.temperature = temperature;
        if (topP !== undefined) payload.inferenceConfig.topP = topP;
    }
    // Thinking mode for Claude models on Kiro (ported from javargasm/pi-kiro).
    // Two coordinated signals steer reasoning on the CodeWhisperer surface:
    //   1. a `<thinking_mode>enabled</thinking_mode><max_thinking_length>N</...>`
    //      directive prepended to the user message — makes Claude emit reasoning
    //      INLINE, split back into `reasoning_content` by the executor (kiroThinking.ts);
    //   2. top-level `additionalModelRequestFields` (output_config.effort +
    //      thinking:{type:"adaptive"} + a clamped max_tokens), forwarded to AWS by
    //      the Kiro executor's transformRequest allowlist — the graded effort lever,
    //      gated on Kiro's adaptive-thinking allowlist (#6576), not supportsReasoning().
    // GPT-5.6 models use the native `reasoning:{effort}` field instead. They must
    // not receive the Claude `output_config`/`thinking` envelope: Kiro rejects it
    // as an unknown field for the GPT-5.6 family.
    const requestedEffort = resolveKiroEffort(body) || (modelRequestsThinking ? "high" : "");
    const usesNativeReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$adaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsKiroNativeReasoning"])(normalizedModel);
    const usesAdaptiveThinking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2f$adaptiveThinking$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsKiroAdaptiveThinking"])(normalizedModel);
    const kiroEffort = usesNativeReasoning || usesAdaptiveThinking ? requestedEffort : "";
    if (kiroEffort) {
        const fields = usesNativeReasoning ? {
            reasoning: {
                effort: kiroEffort
            }
        } : {
            output_config: {
                effort: kiroEffort
            },
            thinking: {
                type: "adaptive",
                display: "summarized"
            }
        };
        if (usesAdaptiveThinking) {
            // `<thinking_mode>` / `<max_thinking_length>` are Kiro/CodeWhisperer prompt
            // conventions (NOT Anthropic API params); the length is a soft hint (the hard
            // enable signal is `<thinking_mode>`), clamped to the model's thinking cap.
            const thinkingLength = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(normalizedModel, thinkingLengthForEffort(kiroEffort));
            const directive = `<thinking_mode>enabled</thinking_mode>` + `<max_thinking_length>${thinkingLength}</max_thinking_length>`;
            payload.conversationState.currentMessage.userInputMessage.content = `${directive}\n\n${payload.conversationState.currentMessage.userInputMessage.content}`;
        }
        // Forward max_tokens only when the client set one, clamped to the model's
        // output window (floor 1024) — matches pi-kiro and avoids an over-budget reject.
        if (usesAdaptiveThinking && maxTokens > 0) {
            const capped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMaxOutputTokens"])(normalizedModel, maxTokens) ?? maxTokens;
            fields.max_tokens = Math.max(Math.floor(capped), 1024);
        }
        payload.additionalModelRequestFields = fields;
        // Adaptive-only Claude models (Opus 4.7/4.8, Sonnet 5, Fable 5) reject a
        // non-default temperature / top_p with a 400 while thinking is active, so
        // strip both. Drop inferenceConfig entirely if nothing else remains.
        if (payload.inferenceConfig) {
            delete payload.inferenceConfig.temperature;
            delete payload.inferenceConfig.topP;
            if (Object.keys(payload.inferenceConfig).length === 0) {
                delete payload.inferenceConfig;
            }
        }
    }
    return payload;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].KIRO, buildKiroPayload, null);
}),
"[project]/open-sse/translator/request/openai-to-cursor.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCursorRequest",
    ()=>buildCursorRequest
]);
/**
 * OpenAI to Cursor Request Translator
 * Converts OpenAI messages to Cursor ask/agent format.
 *
 * Important: Cursor can loop when tool outputs are sent via protobuf tool_results
 * with partial schema mismatches. For stability, tool outputs are represented as
 * structured text blocks in user messages.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
/**
 * Pull the URL string out of an OpenAI `image_url` content part. Accepts both
 * the canonical `{ image_url: { url } }` and the shorthand `{ image_url: "..." }`.
 * Returns "" when no usable url is present.
 */ function extractImageUrl(part) {
    const iu = part.image_url;
    if (typeof iu === "string") return iu;
    if (iu && typeof iu === "object" && typeof iu.url === "string") return iu.url;
    return "";
}
function normalizeToolCallId(id) {
    return typeof id === "string" ? id.split("\n")[0] : "";
}
function extractContent(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.filter((part)=>{
            if (!part || typeof part !== "object") return false;
            const maybe = part;
            return maybe.type === "text" && typeof maybe.text === "string";
        }).map((part)=>part.text).join("");
    }
    return "";
}
function sanitizeToolResultText(text) {
    // Strip non-printable control chars that can produce backend request errors.
    return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}
function escapeXml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function buildToolResultBlock(toolName, toolCallId, resultText) {
    const cleanResult = sanitizeToolResultText(resultText || "");
    return [
        "<tool_result>",
        `<tool_name>${escapeXml(toolName || "tool")}</tool_name>`,
        `<tool_call_id>${escapeXml(toolCallId || "")}</tool_call_id>`,
        `<result>${escapeXml(cleanResult)}</result>`,
        "</tool_result>"
    ].join("\n");
}
function convertMessages(messages) {
    const result = [];
    // Build a map of tool_call_id -> tool name from assistant tool calls.
    const toolCallMetaMap = new Map();
    const rememberToolMeta = (toolCallId, toolName)=>{
        if (!toolCallId) return;
        const name = toolName || "tool";
        toolCallMetaMap.set(toolCallId, {
            name
        });
        const normalized = normalizeToolCallId(toolCallId);
        if (normalized && normalized !== toolCallId) {
            toolCallMetaMap.set(normalized, {
                name
            });
        }
    };
    for (const msg of messages){
        if (msg.role === "assistant" && msg.tool_calls) {
            for (const tc of msg.tool_calls){
                rememberToolMeta(tc.id || "", tc.function?.name || "tool");
            }
        }
        if (msg.role === "assistant" && Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (part?.type !== "tool_use") continue;
                rememberToolMeta(part.id || "", part.name || "tool");
            }
        }
    }
    for(let i = 0; i < messages.length; i++){
        const msg = messages[i];
        if (msg.role === "system") {
            result.push({
                role: "user",
                content: `[System Instructions]\n${extractContent(msg.content)}`
            });
            continue;
        }
        if (msg.role === "tool") {
            const toolContent = extractContent(msg.content);
            const toolCallId = msg.tool_call_id || "";
            const toolMeta = toolCallMetaMap.get(toolCallId) || {};
            const toolName = msg.name || toolMeta.name || "tool";
            result.push({
                role: "user",
                content: buildToolResultBlock(toolName, toolCallId, toolContent)
            });
            continue;
        }
        if (msg.role === "user" || msg.role === "assistant") {
            if (msg.role === "user" && Array.isArray(msg.content)) {
                const parts = [];
                // Preserve vision input: image_url parts are kept (the cursor executor
                // inlines them into the request — see resolveCursorImages). Without
                // this they'd be silently dropped here and never reach a vision model.
                const imageParts = [];
                for (const block of msg.content){
                    if (!block || typeof block !== "object") continue;
                    if (block.type === "text") {
                        if (typeof block.text === "string") {
                            parts.push(block.text || "");
                        }
                        continue;
                    }
                    if (block.type === "image_url") {
                        const url = extractImageUrl(block);
                        if (url) imageParts.push({
                            type: "image_url",
                            image_url: {
                                url
                            }
                        });
                        continue;
                    }
                    if (block.type === "tool_result") {
                        const tr = block;
                        const toolCallId = tr.tool_use_id || "";
                        const toolMeta = toolCallMetaMap.get(toolCallId) || toolCallMetaMap.get(normalizeToolCallId(toolCallId));
                        const toolName = toolMeta?.name || "tool";
                        const toolContent = extractContent(tr.content);
                        parts.push(buildToolResultBlock(toolName, toolCallId, toolContent));
                    }
                }
                const joined = parts.filter(Boolean).join("\n");
                if (imageParts.length > 0) {
                    // Emit an OpenAI content array so the executor sees both the text
                    // (via flattenMessages) and the images (via extractImageUrls). A
                    // leading text part keeps text extraction unchanged.
                    const contentArr = [];
                    if (joined) contentArr.push({
                        type: "text",
                        text: joined
                    });
                    contentArr.push(...imageParts);
                    result.push({
                        role: "user",
                        content: contentArr
                    });
                } else if (joined) {
                    result.push({
                        role: "user",
                        content: joined
                    });
                }
                continue;
            }
            const content = extractContent(msg.content);
            if (msg.role === "assistant" && msg.tool_calls && msg.tool_calls.length > 0) {
                const assistantMsg = {
                    role: "assistant",
                    content: content || ""
                };
                assistantMsg.tool_calls = msg.tool_calls.map((tc)=>{
                    const { index, ...rest } = tc || {};
                    return rest;
                });
                result.push(assistantMsg);
            } else if (msg.role === "assistant" && Array.isArray(msg.content)) {
                const extractedToolCalls = msg.content.filter((b)=>b?.type === "tool_use").map((b)=>({
                        id: b.id || "",
                        type: "function",
                        function: {
                            name: b.name || "tool",
                            arguments: JSON.stringify(b.input || {})
                        }
                    })).filter((tc)=>tc.id);
                if (extractedToolCalls.length > 0) {
                    result.push({
                        role: "assistant",
                        content: content || "",
                        tool_calls: extractedToolCalls
                    });
                } else if (content) {
                    result.push({
                        role: "assistant",
                        content
                    });
                }
            } else {
                if (content) {
                    result.push({
                        role: msg.role,
                        content
                    });
                }
            }
        }
    }
    return result;
}
function buildCursorRequest(model, body, stream, credentials) {
    const messages = convertMessages(body.messages || []);
    return {
        ...body,
        messages
    };
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CURSOR, buildCursorRequest, null);
}),
"[project]/open-sse/translator/request/claude-to-gemini.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "claudeToGeminiRequest",
    ()=>claudeToGeminiRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/geminiHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/geminiToolsSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-gemini/helpers.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
function claudeToGeminiRequest(model, body, stream, credentials = null) {
    const toolNameMap = new Map();
    const sanitizeToolName = (name)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeGeminiToolName"])(name, {
            toolNameMap
        });
    // Vertex AI rejects the `id` field inside function_call / function_response parts
    // (#3440). The public Gemini API keeps it for Gemini 3+ signature matching, so this
    // is scoped to the routed vertex provider only (threaded via credentials._provider).
    const provider = credentials && typeof credentials === "object" ? credentials._provider : null;
    const stripFunctionCallId = provider === "vertex" || provider === "vertex-partner";
    // Thread the signature namespace so a thinking model's thoughtSignature (cached on the
    // Gemini→Claude response turn under `<connectionId>:<toolUseId>`) is found and
    // re-attached on the follow-up Claude→Gemini request. Without this, Claude Desktop
    // combo turns hit HTTP 400 "missing thought_signature" (#8979 / #2504 parity).
    const signatureNamespace = credentials && typeof credentials === "object" && typeof credentials._signatureNamespace === "string" ? credentials._signatureNamespace : null;
    const result = {
        model: model,
        contents: [],
        generationConfig: {},
        // Honor an explicit caller-supplied safetySettings (including one that itself
        // requests HARM_CATEGORY_CIVIC_INTEGRITY — the caller's explicit choice), matching
        // the openai-to-gemini.ts standard-path behavior. See DEFAULT_SAFETY_SETTINGS (#8231).
        safetySettings: body.safetySettings || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_SAFETY_SETTINGS"]
    };
    // ── Generation config ──────────────────────────────────────────
    if (body.temperature !== undefined) {
        result.generationConfig.temperature = body.temperature;
    }
    if (body.top_p !== undefined) {
        result.generationConfig.topP = body.top_p;
    }
    if (body.top_k !== undefined) {
        result.generationConfig.topK = body.top_k;
    }
    if (body.max_tokens !== undefined) {
        const maxOutputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capMaxOutputTokens"])(model, body.max_tokens);
        if (maxOutputTokens !== null) {
            result.generationConfig.maxOutputTokens = maxOutputTokens;
        }
    }
    // ── System instruction ─────────────────────────────────────────
    if (body.system) {
        let systemText;
        if (Array.isArray(body.system)) {
            systemText = body.system.map((s)=>s.text || "").join("\n");
        } else {
            systemText = String(body.system);
        }
        if (systemText) {
            result.systemInstruction = {
                role: "system",
                parts: [
                    {
                        text: systemText
                    }
                ]
            };
        }
    }
    // ── Build tool_use name lookup + resolve thought signatures ────
    // Standard Gemini rejects signature-less native functionCall parts with
    // HTTP 400 (#8979). Match the OPENAI→GEMINI "context" policy (#3688): only
    // emit native functionCall/functionResponse when a real signature is
    // available; otherwise represent history as context text.
    const toolUseNames = {};
    const resolvedSignatures = new Map();
    if (body.messages && Array.isArray(body.messages)) {
        for (const msg of body.messages){
            if (msg.role === "assistant" && Array.isArray(msg.content)) {
                for (const block of msg.content){
                    if (block.type === "tool_use" && block.id && block.name) {
                        toolUseNames[block.id] = sanitizeToolName(block.name);
                        const clientSignature = typeof block.thoughtSignature === "string" && block.thoughtSignature || typeof block.thought_signature === "string" && block.thought_signature || null;
                        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveGeminiThoughtSignature"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(signatureNamespace, block.id), clientSignature);
                        if (typeof resolved === "string" && resolved.length > 0) {
                            resolvedSignatures.set(block.id, resolved);
                        }
                    }
                }
            }
        }
    }
    // ── Convert messages ───────────────────────────────────────────
    if (body.messages && Array.isArray(body.messages)) {
        // Tool-ids whose functionCall was omitted (no stored thought_signature) so the
        // matching tool_result becomes text instead of a Gemini-400'd functionResponse.
        const omittedToolCallIds = new Set();
        for (const msg of body.messages){
            const parts = [];
            let shouldUseEmbeddedSignature = true;
            if (Array.isArray(msg.content)) {
                for (const block of msg.content){
                    switch(block.type){
                        case "text":
                            if (block.text) parts.push({
                                text: block.text
                            });
                            break;
                        case "thinking":
                            // Preserve thinking blocks as thought parts
                            if (block.thinking) {
                                parts.push({
                                    thought: true,
                                    text: block.thinking
                                });
                            }
                            break;
                        case "tool_use":
                            {
                                const signatureForToolCall = resolvedSignatures.get(block.id);
                                // Signature-less historical tool_use → omit native functionCall
                                // (context mode). Matching tool_result becomes context text below.
                                if (!signatureForToolCall) {
                                    break;
                                }
                                const embeddedThoughtSignature = shouldUseEmbeddedSignature ? signatureForToolCall : undefined;
                                if (embeddedThoughtSignature) {
                                    shouldUseEmbeddedSignature = false;
                                }
                                parts.push({
                                    ...embeddedThoughtSignature ? {
                                        thoughtSignature: embeddedThoughtSignature
                                    } : {},
                                    functionCall: {
                                        ...stripFunctionCallId ? {} : {
                                            id: block.id
                                        },
                                        name: sanitizeToolName(block.name),
                                        args: block.input || {}
                                    }
                                });
                                break;
                            }
                        case "tool_result":
                            {
                                let content = block.content;
                                if (Array.isArray(content)) {
                                    content = content.map((c)=>c.type === "text" ? c.text : JSON.stringify(c)).join("\n");
                                }
                                let parsedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["tryParseJSON"])(content);
                                if (parsedContent === null) {
                                    parsedContent = {
                                        result: content
                                    };
                                } else if (typeof parsedContent !== "object") {
                                    parsedContent = {
                                        result: parsedContent
                                    };
                                }
                                const toolUseId = block.tool_use_id;
                                const name = toolUseNames[toolUseId] || "unknown";
                                // Signature-less history: represent as context text so Gemini 3+
                                // does not reject a native functionResponse without a matching
                                // signed functionCall (#8979 / #3688).
                                if (!resolvedSignatures.has(toolUseId)) {
                                    parts.push({
                                        text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildHistoricalToolResultContext"])(name, content)
                                    });
                                    break;
                                }
                                parts.push({
                                    functionResponse: {
                                        ...stripFunctionCallId ? {} : {
                                            id: toolUseId
                                        },
                                        name,
                                        response: {
                                            result: parsedContent
                                        }
                                    }
                                });
                                break;
                            }
                        case "image":
                            // Base64 image → Gemini inlineData
                            if (block.source?.type === "base64") {
                                parts.push({
                                    inlineData: {
                                        mimeType: block.source.media_type,
                                        data: block.source.data
                                    }
                                });
                            }
                            break;
                    }
                }
            } else if (typeof msg.content === "string" && msg.content) {
                parts.push({
                    text: msg.content
                });
            }
            if (parts.length > 0) {
                // Map Claude roles to Gemini roles
                const geminiRole = msg.role === "assistant" ? "model" : "user";
                result.contents.push({
                    role: geminiRole,
                    parts
                });
            }
        }
    }
    // ── Convert tools ──────────────────────────────────────────────
    const geminiTools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$geminiToolsSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiTools"])(body.tools, {
        toolNameMap
    });
    if (geminiTools) {
        result.tools = geminiTools;
    }
    // ── Thinking config ────────────────────────────────────────────
    // Priority: thinking.budget_tokens (Claude native) > output_config.effort (Claude Code).
    if (model.startsWith("gemma-4")) {
    // gemma-4 models returns - 400: Thinking budget is not supported for this model
    } else if (body.thinking?.type === "enabled" && typeof body.thinking.budget_tokens === "number") {
        // typeof check ensures only numeric budget_tokens triggers the thinking path;
        // non-numeric values (e.g. string "auto") fall through to the effort-based path.
        // #6813: a truthy check here dropped `budget_tokens: 0` (dynamic thinking).
        // `undefined` (no budget specified) still falls through to the effort branch.
        // #3842: cap to the model's real thinking-budget limit.
        const cappedBudget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, body.thinking.budget_tokens);
        // Only send thinkingConfig if the model supports thinking via budget.
        // Models with thinkingBudgetCap:0 (e.g. gemini-3-flash) reject
        // thinkingConfig even when capped to 0. The supportsThinking flag
        // tracks thinkingLevel support, not thinkingBudget; use thinkingBudgetCap
        // as the reliable indicator (gemini-2.5-flash has supportsThinking:false
        // but thinkingBudgetCap:24576, meaning it supports thinking via budget).
        // Models not in MODEL_SPECS (thinkingBudgetCap=undefined) default to allowed.
        if (cappedBudget > 0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(model)?.thinkingBudgetCap !== 0) {
            result.generationConfig.thinkingConfig = {
                thinkingBudget: cappedBudget,
                // #6813: `budget_tokens: 0` on this explicit path is the client's dynamic-thinking
                // sentinel, not an off-switch — includeThoughts stays true regardless of the
                // (possibly cap-clamped) budget value. Only the reasoning_effort/output_config.effort
                // paths below treat a resulting budget of 0 as "thinking disabled".
                includeThoughts: true
            };
        }
    } else if (typeof body.output_config?.effort === "string") {
        const effort = body.output_config.effort.toLowerCase();
        const effortBudgetMap = {
            none: 0,
            low: 1024,
            medium: 10240,
            high: 32768,
            max: 131072,
            xhigh: 131072
        };
        const rawBudget = effortBudgetMap[effort];
        // #3842: clamp to the model's real thinking-budget cap. This path previously
        // sent the raw value with no cap, so a Claude-Code client hitting a Flash-tier
        // Gemini target via output_config.effort="high" sent 32768 (> 24576) → 400.
        // capThinkingBudget narrows 32768 to e.g. gemini-2.5-flash's 24576 while leaving
        // pro-tier (real cap 32768) untouched.
        const budget = rawBudget !== undefined ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["capThinkingBudget"])(model, rawBudget) : undefined;
        if (budget !== undefined && budget > 0) {
            // Only send thinkingConfig if the model supports thinking via budget.
            // Models with thinkingBudgetCap:0 (e.g. gemini-3-flash) reject
            // thinkingConfig even for effort-based paths.
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelSpec"])(model)?.thinkingBudgetCap !== 0) {
                result.generationConfig.thinkingConfig = {
                    thinkingBudget: budget,
                    includeThoughts: true
                };
            }
        }
    }
    const changedToolNameMap = new Map([
        ...toolNameMap.entries()
    ].filter(([sanitizedName, originalName])=>sanitizedName !== originalName));
    if (changedToolNameMap.size > 0) {
        result._toolNameMap = changedToolNameMap;
    }
    return result;
}
// Register direct path only for plain Gemini API.
// Antigravity requires Cloud Code envelope wrapping,
// so they must use the existing hub path (Claude -> OpenAI -> target).
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI, claudeToGeminiRequest, null);
}),
"[project]/open-sse/translator/response/claude-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "claudeToOpenAIResponse",
    ()=>claudeToOpenAIResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
// Create OpenAI chunk helper
function createChunk(state, delta, finishReason = null) {
    return {
        id: `chatcmpl-${state.messageId}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: state.model,
        choices: [
            {
                index: 0,
                delta,
                finish_reason: finishReason
            }
        ]
    };
}
function claudeToOpenAIResponse(chunk, state) {
    if (!chunk) return null;
    const results = [];
    const event = chunk.type;
    switch(event){
        case "message_start":
            {
                state.messageId = chunk.message?.id || `msg_${Date.now()}`;
                state.model = chunk.message?.model;
                state.toolCallIndex = 0;
                results.push(createChunk(state, {
                    role: "assistant"
                }));
                break;
            }
        case "content_block_start":
            {
                const block = chunk.content_block;
                if (block?.type === "text") {
                    state.textBlockStarted = true;
                } else if (block?.type === "thinking") {
                    state.inThinkingBlock = true;
                    state.currentBlockIndex = chunk.index;
                    // Emit empty reasoning_content to signal thinking block start
                    // (clients like Claude Code look for reasoning_content, not <think> tags)
                    results.push(createChunk(state, {
                        reasoning_content: ""
                    }));
                } else if (block?.type === "tool_use") {
                    const toolCallIndex = state.toolCallIndex++;
                    // Restore original tool name from mapping (Claude OAuth)
                    const toolName = state.toolNameMap?.get(block.name) || block.name;
                    const toolCall = {
                        index: toolCallIndex,
                        id: block.id,
                        type: "function",
                        function: {
                            name: toolName,
                            arguments: ""
                        }
                    };
                    state.toolCalls.set(chunk.index, toolCall);
                    results.push(createChunk(state, {
                        tool_calls: [
                            toolCall
                        ]
                    }));
                }
                break;
            }
        case "content_block_delta":
            {
                const delta = chunk.delta;
                if (delta?.type === "text_delta" && delta.text) {
                    // Flush the deferred </think> close marker before the first text delta so
                    // clients like Claude Code / Cursor (that scan content for </think>) see it
                    // immediately before the assistant reply begins — but NOT in tool-use streams
                    // where no text_delta ever arrives (#5123).
                    if (state.pendingThinkClose) {
                        // Suppressed for clients that render the marker verbatim (#5245);
                        // still clear the flag so it never re-fires later in the stream.
                        if (!state.suppressThinkClose) {
                            results.push(createChunk(state, {
                                content: "</think>"
                            }));
                        }
                        state.pendingThinkClose = false;
                    }
                    results.push(createChunk(state, {
                        content: delta.text
                    }));
                } else if (delta?.type === "thinking_delta" && delta.thinking) {
                    // Map Claude thinking_delta → OpenAI reasoning_content
                    // Clients (Claude Code, Cursor, etc.) display reasoning_content as the thinking panel
                    results.push(createChunk(state, {
                        reasoning_content: delta.thinking
                    }));
                } else if (delta?.type === "input_json_delta" && delta.partial_json) {
                    const toolCall = state.toolCalls.get(chunk.index);
                    if (toolCall) {
                        toolCall.function.arguments += delta.partial_json;
                        results.push(createChunk(state, {
                            tool_calls: [
                                {
                                    index: toolCall.index,
                                    function: {
                                        arguments: delta.partial_json
                                    }
                                }
                            ]
                        }));
                    }
                }
                break;
            }
        case "content_block_stop":
            {
                if (state.inThinkingBlock && chunk.index === state.currentBlockIndex) {
                    // Defer the </think> close marker instead of emitting immediately.
                    // If the next block is tool_use there will be no text_delta, so the
                    // marker would appear as a spurious assistant text chunk before
                    // tool_calls, corrupting OpenAI-compatible clients (#5123).
                    // The marker is flushed in the text_delta branch (for pure-text
                    // thinking responses — preserving the #4633 / decolua/9router#454
                    // behavior) or in the message_delta finish path when no tool_calls
                    // were collected.
                    state.pendingThinkClose = true;
                    state.inThinkingBlock = false;
                }
                state.textBlockStarted = false;
                state.thinkingBlockStarted = false;
                break;
            }
        case "message_delta":
            {
                // Extract usage from message_delta event (Claude native format)
                // Normalize to OpenAI format (prompt_tokens/completion_tokens) for consistent logging
                if (chunk.usage && typeof chunk.usage === "object") {
                    const previousUsage = state.usage && typeof state.usage === "object" ? state.usage : {};
                    const previousInputTokens = typeof previousUsage.input_tokens === "number" ? previousUsage.input_tokens : typeof previousUsage.prompt_tokens === "number" ? previousUsage.prompt_tokens : 0;
                    const previousCacheReadTokens = typeof previousUsage.cache_read_input_tokens === "number" ? previousUsage.cache_read_input_tokens : 0;
                    const previousCacheCreationTokens = typeof previousUsage.cache_creation_input_tokens === "number" ? previousUsage.cache_creation_input_tokens : 0;
                    const inputTokens = typeof chunk.usage.input_tokens === "number" ? chunk.usage.input_tokens : 0;
                    const outputTokens = typeof chunk.usage.output_tokens === "number" ? chunk.usage.output_tokens : 0;
                    const thinkingTokens = typeof chunk.usage.output_tokens_details?.thinking_tokens === "number" ? chunk.usage.output_tokens_details.thinking_tokens : undefined;
                    const cacheReadTokens = typeof chunk.usage.cache_read_input_tokens === "number" ? chunk.usage.cache_read_input_tokens : 0;
                    const cacheCreationTokens = typeof chunk.usage.cache_creation_input_tokens === "number" ? chunk.usage.cache_creation_input_tokens : 0;
                    // Use OpenAI format keys for consistent logging in stream.js
                    // Issue #1426: Include cache_read tokens in prompt_tokens so cached input
                    // is visible to downstream billing systems.
                    // Issue #2215: Exclude cache_creation_input_tokens from prompt_tokens —
                    // Anthropic's cache-creation pads short prompts up to a 1024-token
                    // minimum, so a 2-token "hi" can be reported as ~2008 prompt_tokens and
                    // inflate downstream billing ~250x. cache_creation is still exposed
                    // separately via prompt_tokens_details.cache_creation_tokens below.
                    const billableInputTokens = inputTokens > 0 || cacheReadTokens > 0 || cacheCreationTokens > 0 ? inputTokens + cacheReadTokens : previousInputTokens;
                    state.usage = {
                        prompt_tokens: billableInputTokens,
                        completion_tokens: outputTokens,
                        input_tokens: billableInputTokens,
                        output_tokens: outputTokens
                    };
                    // Anthropic includes thinking in output_tokens. Surface the separately
                    // reported portion without adding it to completion_tokens a second time.
                    if (thinkingTokens !== undefined) {
                        state.usage.reasoning_tokens = thinkingTokens;
                        state.usage.completion_tokens_details = {
                            reasoning_tokens: thinkingTokens
                        };
                        state.usage.output_tokens_details = {
                            thinking_tokens: thinkingTokens
                        };
                    }
                    // Store cache tokens if present (needed for prompt_tokens_details in final chunk)
                    const effectiveCacheReadTokens = cacheReadTokens || previousCacheReadTokens;
                    const effectiveCacheCreationTokens = cacheCreationTokens || previousCacheCreationTokens;
                    if (effectiveCacheReadTokens > 0) {
                        state.usage.cache_read_input_tokens = effectiveCacheReadTokens;
                    }
                    if (effectiveCacheCreationTokens > 0) {
                        state.usage.cache_creation_input_tokens = effectiveCacheCreationTokens;
                    }
                }
                if (chunk.delta?.stop_reason) {
                    // Flush any deferred </think> close marker now that we know the stream
                    // is finishing. Only emit when there are no tool_calls — if tool_calls
                    // were collected the marker must stay suppressed (#5123). Text-based
                    // responses that had no text_delta (edge case: thinking-only with
                    // immediate stop) still receive the marker here.
                    if (state.pendingThinkClose && state.toolCalls.size === 0) {
                        // Suppressed for clients that render the marker verbatim (#5245).
                        if (!state.suppressThinkClose) {
                            results.push(createChunk(state, {
                                content: "</think>"
                            }));
                        }
                        state.pendingThinkClose = false;
                    }
                    state.finishReason = convertStopReason(chunk.delta.stop_reason);
                    const finalChunk = {
                        id: `chatcmpl-${state.messageId}`,
                        object: "chat.completion.chunk",
                        created: Math.floor(Date.now() / 1000),
                        model: state.model,
                        choices: [
                            {
                                index: 0,
                                delta: {},
                                finish_reason: state.finishReason
                            }
                        ]
                    };
                    // Include usage in final chunk if available
                    if (state.usage && typeof state.usage === "object") {
                        const inputTokens = state.usage.input_tokens || 0;
                        const outputTokens = state.usage.output_tokens || 0;
                        const cachedTokens = state.usage.cache_read_input_tokens || 0;
                        const cacheCreationTokens = state.usage.cache_creation_input_tokens || 0;
                        // prompt_tokens = input_tokens (input + cache_read, per #2215 —
                        // cache_creation is exposed separately in prompt_tokens_details below).
                        // completion_tokens = output_tokens
                        // total_tokens = prompt_tokens + completion_tokens
                        const promptTokens = inputTokens;
                        const completionTokens = outputTokens;
                        const totalTokens = promptTokens + completionTokens;
                        finalChunk.usage = {
                            prompt_tokens: promptTokens,
                            completion_tokens: completionTokens,
                            total_tokens: totalTokens
                        };
                        const reasoningTokens = state.usage.reasoning_tokens;
                        if (typeof reasoningTokens === "number") {
                            finalChunk.usage.reasoning_tokens = reasoningTokens;
                            finalChunk.usage.completion_tokens_details = {
                                reasoning_tokens: reasoningTokens
                            };
                        }
                        // Add prompt_tokens_details if cached tokens exist
                        if (cachedTokens > 0 || cacheCreationTokens > 0) {
                            finalChunk.usage.prompt_tokens_details = {};
                            if (cachedTokens > 0) {
                                finalChunk.usage.prompt_tokens_details.cached_tokens = cachedTokens;
                            }
                            if (cacheCreationTokens > 0) {
                                finalChunk.usage.prompt_tokens_details.cache_creation_tokens = cacheCreationTokens;
                            }
                        }
                    }
                    results.push(finalChunk);
                    state.finishReasonSent = true;
                }
                break;
            }
        case "message_stop":
            {
                if (!state.finishReasonSent) {
                    const finishReason = state.finishReason || (state.toolCalls?.size > 0 ? "tool_calls" : "stop");
                    const usageObj = state.usage && typeof state.usage === "object" ? {
                        usage: {
                            prompt_tokens: state.usage.input_tokens || 0,
                            completion_tokens: state.usage.output_tokens || 0,
                            total_tokens: (state.usage.input_tokens || 0) + (state.usage.output_tokens || 0),
                            ...typeof state.usage.reasoning_tokens === "number" ? {
                                reasoning_tokens: state.usage.reasoning_tokens,
                                completion_tokens_details: {
                                    reasoning_tokens: state.usage.reasoning_tokens
                                }
                            } : {}
                        }
                    } : {};
                    results.push({
                        id: `chatcmpl-${state.messageId}`,
                        object: "chat.completion.chunk",
                        created: Math.floor(Date.now() / 1000),
                        model: state.model,
                        choices: [
                            {
                                index: 0,
                                delta: {},
                                finish_reason: finishReason
                            }
                        ],
                        ...usageObj
                    });
                    state.finishReasonSent = true;
                }
                break;
            }
    }
    return results.length > 0 ? results : null;
}
// Convert Claude stop_reason to OpenAI finish_reason
function convertStopReason(reason) {
    switch(reason){
        case "end_turn":
            return "stop";
        case "max_tokens":
            return "length";
        case "tool_use":
            return "tool_calls";
        case "stop_sequence":
            return "stop";
        default:
            return "stop";
    }
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, null, claudeToOpenAIResponse);
}),
"[project]/open-sse/translator/helpers/toolCallShim.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Defensive shims for tool calls whose strict-schema fields can be malformed
// by upstream models (e.g. MiMo emitting empty objects/strings instead of
// arrays for Capy's submit_pr_review).
//
// Applied on the assembled OpenAI tool-call arguments after streaming, just
// before they are re-emitted as a single Claude input_json_delta.
//
// To add a new shim: register a (input) => input transformer in TOOL_SHIMS
// keyed by the tool name. The transformer must accept arbitrary input and
// return a JSON-safe value.
__turbopack_context__.s([
    "__test",
    ()=>__test,
    "applyToolCallShimToBuffer",
    ()=>applyToolCallShimToBuffer,
    "hasToolCallShim",
    ()=>hasToolCallShim
]);
function coerceToArray(v) {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    if (typeof v === "string") {
        if (v === "") return [];
        try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [];
        } catch  {
            return [];
        }
    }
    // Plain object or other non-array → empty
    return [];
}
// Claude Code's Read tool caps `limit` at 2000 lines per call. Non-Anthropic models
// (GPT-5.5, DeepSeek …) occasionally emit absurd values (e.g. `limit: 25999999999999999`)
// that Claude Code rejects, causing a retry loop that wastes tokens. Clamp here.
const READ_MAX_LIMIT = 2000;
// `pages` is only meaningful for PDFs and only as `"N"` or `"N-M"` (1-based).
// Reference: claude-code-tools docs + upstream decolua/9router#1144.
function isValidPdfPagesArg(filePath, pages) {
    return typeof filePath === "string" && filePath.toLowerCase().endsWith(".pdf") && typeof pages === "string" && /^\d+(?:-\d+)?$/.test(pages);
}
function sanitizeReadArgs(args) {
    // Coerce numeric-string limit/offset (some non-Anthropic models stringify everything).
    if (typeof args.limit === "string" && /^\d+$/.test(args.limit)) {
        args.limit = Number(args.limit);
    }
    if (typeof args.offset === "string" && /^-?\d+$/.test(args.offset)) {
        args.offset = Number(args.offset);
    }
    if (typeof args.limit === "number") {
        // Read into a local: assigning back to `args.limit` (declared `unknown`) resets the
        // `typeof` narrowing, so the second comparison would no longer see a number. The two
        // branches are mutually exclusive (READ_MAX_LIMIT is 2000), so testing the original
        // value keeps the behavior identical.
        const limit = args.limit;
        if (limit > READ_MAX_LIMIT) args.limit = READ_MAX_LIMIT;
        if (limit < 1) delete args.limit;
    }
    if (typeof args.offset === "number" && args.offset < 0) args.offset = 0;
    if ("pages" in args && !isValidPdfPagesArg(args.file_path, args.pages)) {
        delete args.pages;
    }
}
const TOOL_SHIMS = {
    // Claude Code Read rejects bad params and retries — wasting tokens with non-Anthropic
    // models that emit oversized limits, negative offsets, stringified numbers, or stray
    // `pages` on non-PDF files. Buffer and emit one cleaned JSON delta so the client never
    // sees the bad fields. See `sanitizeReadArgs` for the per-field rules.
    Read: (input)=>{
        if (typeof input !== "object" || input === null || Array.isArray(input)) return input;
        const patched = {
            ...input
        };
        sanitizeReadArgs(patched);
        return patched;
    },
    submit_pr_review: (input)=>{
        if (typeof input !== "object" || input === null || Array.isArray(input)) return input;
        const patched = {
            ...input
        };
        for (const key of [
            "functionalChanges",
            "findings"
        ]){
            patched[key] = coerceToArray(patched[key]);
        }
        return patched;
    }
};
function hasToolCallShim(name) {
    return typeof name === "string" && Object.prototype.hasOwnProperty.call(TOOL_SHIMS, name);
}
function applyToolCallShimToBuffer(name, raw) {
    const shim = TOOL_SHIMS[name];
    if (!shim) return raw;
    let parsed;
    try {
        parsed = raw && raw.length > 0 ? JSON.parse(raw) : {};
    } catch  {
        parsed = {};
    }
    const patched = shim(parsed);
    return JSON.stringify(patched);
}
const __test = {
    coerceToArray,
    TOOL_SHIMS
};
}),
"[project]/open-sse/translator/response/openai-to-claude.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openaiToClaudeResponse",
    ()=>openaiToClaudeResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-claude.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallShim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallShim.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolCallArguments$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/toolCallArguments.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
function normalizeToolName(name) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REVERSE_MAP"][name] ?? name;
}
/**
 * Extract complete XML <invoke> blocks from text content.
 * Some models (e.g. nvidia/abacusai/dracarys) emit tool calls as
 * XML blocks instead of JSON tool_calls. This function detects
 * <invoke name="ToolName"><parameter name="arg">value</parameter></invoke>
 * blocks, converts them to tool calls, and returns the cleaned text.
 * Incomplete XML is buffered in state for the next chunk.
 */ function extractXmlInvokeBlocks(text, state) {
    const toolCalls = [];
    // Prepend any incomplete content from previous chunk
    const combined = (state._xmlInvokeBuffer || "") + text;
    state._xmlInvokeBuffer = "";
    let remaining = combined;
    let cleaned = "";
    while(true){
        const startMatch = remaining.match(/<invoke\s+name="([^"]*)"\s*>/);
        if (!startMatch) {
            cleaned += remaining;
            break;
        }
        // Text before the <invoke> block
        cleaned += remaining.slice(0, startMatch.index);
        const blockStart = startMatch.index;
        const restAfterStart = remaining.slice(blockStart);
        const endMatch = restAfterStart.match(/<\/invoke>/);
        if (!endMatch) {
            // Incomplete block — buffer for next chunk
            state._xmlInvokeBuffer = restAfterStart;
            break;
        }
        // Complete block found
        const innerXml = restAfterStart.slice(startMatch[0].length, endMatch.index);
        const fullBlock = restAfterStart.slice(0, endMatch.index + endMatch[0].length);
        // Parse <parameter name="..." ...>value</parameter>
        const args = {};
        const paramRegex = /<parameter\s+name="([^"]*)"[^>]*>([\s\S]*?)<\/parameter>/g;
        let pm;
        while((pm = paramRegex.exec(innerXml)) !== null){
            args[pm[1]] = pm[2].trim();
        }
        toolCalls.push({
            id: `toolu_xml_${Date.now()}_${toolCalls.length}`,
            name: startMatch[1],
            args
        });
        // Continue scanning after the block
        remaining = remaining.slice(blockStart + fullBlock.length);
    }
    return {
        cleaned,
        toolCalls
    };
}
// Helper: stop thinking block if started
function stopThinkingBlock(state, results) {
    if (!state.thinkingBlockStarted) return;
    results.push({
        type: "content_block_stop",
        index: state.thinkingBlockIndex
    });
    state.thinkingBlockStarted = false;
}
// Helper: stop text block if started
function stopTextBlock(state, results) {
    if (!state.textBlockStarted || state.textBlockClosed) return;
    state.textBlockClosed = true;
    results.push({
        type: "content_block_stop",
        index: state.textBlockIndex
    });
    state.textBlockStarted = false;
}
function openaiToClaudeResponse(chunk, state) {
    if (!chunk || !chunk.choices?.[0]) return null;
    const results = [];
    const choice = chunk.choices[0];
    const delta = choice.delta;
    // Track usage from OpenAI chunk if available
    if (chunk.usage && typeof chunk.usage === "object") {
        const promptTokens = typeof chunk.usage.prompt_tokens === "number" ? chunk.usage.prompt_tokens : 0;
        const outputTokens = typeof chunk.usage.completion_tokens === "number" ? chunk.usage.completion_tokens : 0;
        // Extract cache tokens from prompt_tokens_details
        const cachedTokens = chunk.usage.prompt_tokens_details?.cached_tokens;
        const cacheCreationTokens = chunk.usage.prompt_tokens_details?.cache_creation_tokens;
        const cacheReadTokens = typeof cachedTokens === "number" ? cachedTokens : 0;
        const cacheCreateTokens = typeof cacheCreationTokens === "number" ? cacheCreationTokens : 0;
        // input_tokens = prompt_tokens - cached_tokens - cache_creation_tokens
        // Because OpenAI's prompt_tokens includes all prompt-side tokens
        const inputTokens = promptTokens - cacheReadTokens - cacheCreateTokens;
        state.usage = {
            input_tokens: inputTokens,
            output_tokens: outputTokens
        };
        // Add cache_read_input_tokens if present
        if (cacheReadTokens > 0) {
            state.usage.cache_read_input_tokens = cacheReadTokens;
        }
        // Add cache_creation_input_tokens if present
        if (cacheCreateTokens > 0) {
            state.usage.cache_creation_input_tokens = cacheCreateTokens;
        }
    // Note: completion_tokens_details.reasoning_tokens is already included in output_tokens
    // No need to add separately as Claude expects total output_tokens
    }
    // First chunk - ALWAYS send message_start first
    if (!state.messageStartSent) {
        state.messageStartSent = true;
        state.messageId = chunk.id?.replace("chatcmpl-", "") || `msg_${Date.now()}`;
        if (!state.messageId || state.messageId === "chat" || state.messageId.length < 8) {
            state.messageId = chunk.extend_fields?.requestId || chunk.extend_fields?.traceId || `msg_${Date.now()}`;
        }
        state.model = chunk.model || "unknown";
        state.nextBlockIndex = 0;
        state._pendingXmlToolCalls = [];
        state._xmlInvokeBuffer = "";
        results.push({
            type: "message_start",
            message: {
                id: state.messageId,
                type: "message",
                role: "assistant",
                model: state.model,
                content: [],
                stop_reason: null,
                stop_sequence: null,
                usage: {
                    input_tokens: 0,
                    output_tokens: 0
                }
            }
        });
    }
    // Handle reasoning_content (thinking) - GLM, DeepSeek, etc.
    // Also supports 'reasoning' field alias and reasoning_details[] (StepFun/OpenRouter)
    let reasoningContent = delta?.reasoning_content || delta?.reasoning;
    if (!reasoningContent && Array.isArray(delta?.reasoning_details)) {
        const parts = [];
        for (const detail of delta.reasoning_details){
            if (detail && typeof detail === "object") {
                const text = detail.text || detail.content;
                if (typeof text === "string" && text) parts.push(text);
            }
        }
        if (parts.length > 0) reasoningContent = parts.join("");
    }
    if (typeof reasoningContent === "string" && reasoningContent !== "" && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isInternalReasoningPlaceholder"])(reasoningContent)) {
        stopTextBlock(state, results);
        if (!state.thinkingBlockStarted) {
            state.thinkingBlockIndex = state.nextBlockIndex++;
            state.thinkingBlockStarted = true;
            results.push({
                type: "content_block_start",
                index: state.thinkingBlockIndex,
                content_block: {
                    type: "thinking",
                    thinking: ""
                }
            });
        }
        results.push({
            type: "content_block_delta",
            index: state.thinkingBlockIndex,
            delta: {
                type: "thinking_delta",
                thinking: reasoningContent
            }
        });
    }
    // Handle regular content — strip the internal reasoning placeholder if
    // the model echoed it through ordinary content (#8081). Only the content
    // block emission is skipped when nothing meaningful remains; the chunk
    // may still carry tool_calls / finish_reason below, which must still run.
    if (delta?.content) {
        const strippedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(delta.content);
        if (strippedContent) {
            stopThinkingBlock(state, results);
            // Check for XML <invoke> blocks that some models emit instead of JSON tool_calls
            const { cleaned, toolCalls: xmlToolCalls } = extractXmlInvokeBlocks(strippedContent, state);
            // Accumulate extracted tool calls for emission at finish
            if (xmlToolCalls.length > 0) {
                // Close any ongoing text block before tool calls
                stopTextBlock(state, results);
                state._pendingXmlToolCalls.push(...xmlToolCalls);
            }
            // Emit remaining non-XML text content
            if (!cleaned) {
            // All content was XML invoke blocks — skip text block entirely
            // (tool calls will be emitted at finish)
            } else if (xmlToolCalls.length > 0) {
                // Text before/between/after XML blocks — (re)start a text block
                if (!state.textBlockStarted) {
                    state.textBlockIndex = state.nextBlockIndex++;
                    state.textBlockStarted = true;
                    state.textBlockClosed = false;
                    results.push({
                        type: "content_block_start",
                        index: state.textBlockIndex,
                        content_block: {
                            type: "text",
                            text: ""
                        }
                    });
                }
                results.push({
                    type: "content_block_delta",
                    index: state.textBlockIndex,
                    delta: {
                        type: "text_delta",
                        text: cleaned
                    }
                });
            } else {
                // No XML — emit as regular text (original behaviour)
                if (!state.textBlockStarted) {
                    state.textBlockIndex = state.nextBlockIndex++;
                    state.textBlockStarted = true;
                    state.textBlockClosed = false;
                    results.push({
                        type: "content_block_start",
                        index: state.textBlockIndex,
                        content_block: {
                            type: "text",
                            text: ""
                        }
                    });
                }
                results.push({
                    type: "content_block_delta",
                    index: state.textBlockIndex,
                    delta: {
                        type: "text_delta",
                        text: cleaned
                    }
                });
            }
        }
    }
    // Tool calls
    if (delta?.tool_calls) {
        for (const tc of delta.tool_calls){
            const idx = tc.index ?? 0;
            // Strip the Claude OAuth prefix from an incoming tool name (if any).
            const incomingName = (()=>{
                let n = tc.function?.name || "";
                n = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(n, state.toolNameMap) ?? n;
                if (n.startsWith(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_OAUTH_TOOL_PREFIX"])) n = n.slice(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_OAUTH_TOOL_PREFIX"].length);
                return n;
            })();
            // A tool call is identified by its id. Some OpenAI-compatible upstreams
            // (GLM 5.2) stream the id and function.name in SEPARATE SSE chunks. The
            // Claude protocol cannot patch a content_block_start after it is emitted,
            // so we register the tool call on the id chunk but DEFER content_block_start
            // until the name arrives (#2077 / decolua/9router#2077).
            if (tc.id && !state.toolCalls.has(idx)) {
                stopThinkingBlock(state, results);
                stopTextBlock(state, results);
                state.toolCalls.set(idx, {
                    id: tc.id,
                    name: incomingName,
                    blockIndex: state.nextBlockIndex++,
                    // Shimmed tools buffer their raw args and emit a single corrected
                    // input_json_delta at content_block_stop time (see finish handler).
                    shimmed: incomingName ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallShim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasToolCallShim"])(incomingName) : false,
                    argBuffer: "",
                    startEmitted: false
                });
            }
            const toolInfo = state.toolCalls.get(idx);
            if (toolInfo) {
                // Capture a late-arriving id or name (streamed after the initial chunk).
                if (tc.id && !toolInfo.id) toolInfo.id = tc.id;
                if (incomingName && !toolInfo.startEmitted && !toolInfo.name) {
                    toolInfo.name = incomingName;
                    toolInfo.shimmed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallShim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasToolCallShim"])(incomingName);
                }
                // Emit content_block_start once we have a name. If arguments arrive before
                // any name was ever seen, start the block anyway with the (empty) name so
                // the input_json_delta stays well-formed.
                if (!toolInfo.startEmitted && (toolInfo.name || tc.function?.arguments != null)) {
                    toolInfo.startEmitted = true;
                    results.push({
                        type: "content_block_start",
                        index: toolInfo.blockIndex,
                        content_block: {
                            type: "tool_use",
                            id: toolInfo.id,
                            name: toolInfo.name || "",
                            input: {}
                        }
                    });
                }
            }
            if (tc.function?.arguments) {
                if (toolInfo) {
                    // Always buffer the raw stream so shimmed tools can re-emit a
                    // corrected JSON at stop time.
                    const existingArgs = toolInfo.argBuffer || "";
                    const nextArgs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolCallArguments$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["appendToolCallArgumentDelta"])(existingArgs, tc.function.arguments);
                    let deltaStr = nextArgs.slice(existingArgs.length);
                    toolInfo.argBuffer = nextArgs;
                    if (toolInfo.shimmed || !deltaStr) {
                        continue;
                    }
                    // NOTE: The regex-based "Fix #1852" strip that previously ran here was
                    // removed in #4951. That strip matched patterns like `"key":""` and
                    // `"key":[]` to remove spurious placeholder fields that some models emit
                    // as noise. However, since #3762 the snapshot-dedup logic in
                    // appendToolCallArgumentDelta already collapses repeated/growing snapshots
                    // into a single delta, so noise-only chunks are naturally suppressed.
                    // More critically, the regex unconditionally deleted any field whose value
                    // happened to be "" or [], silently corrupting intentional empty-string or
                    // empty-array arguments (e.g. {"file_path":"","content":"text"} →
                    // {"content":"text"}). Emit deltaStr as-is; the Claude client parses the
                    // assembled partial_json fragments and tolerates unknown extra fields.
                    results.push({
                        type: "content_block_delta",
                        index: toolInfo.blockIndex,
                        delta: {
                            type: "input_json_delta",
                            partial_json: deltaStr
                        }
                    });
                }
            }
        }
    }
    // Finish — guard against duplicate finish_reason chunks (common with OpenAI-compatible models).
    // Use a dedicated `claudeFinishEmitted` flag rather than `state.finishReason`: in the
    // Responses→Claude hub path the shared `state` object is also written by the
    // openai-responses→openai translator, which sets `state.finishReason` on
    // `response.completed` BEFORE this openai→claude step runs. Reusing `finishReason` as the
    // guard therefore misfired and silently dropped the terminal message_delta/message_stop
    // for Responses→Claude streams (#5828 regression).
    if (choice.finish_reason && !state.claudeFinishEmitted) {
        state.claudeFinishEmitted = true;
        stopThinkingBlock(state, results);
        stopTextBlock(state, results);
        for (const [, toolInfo] of state.toolCalls){
            // A tool call whose name/args never arrived (only an id chunk was seen)
            // still has a reserved block index but no content_block_start. Emit it now
            // so the terminal content_block_stop is not orphaned (#2077 edge case).
            if (!toolInfo.startEmitted) {
                toolInfo.startEmitted = true;
                results.push({
                    type: "content_block_start",
                    index: toolInfo.blockIndex,
                    content_block: {
                        type: "tool_use",
                        id: toolInfo.id,
                        name: toolInfo.name || "",
                        input: {}
                    }
                });
            }
            // For shimmed tools, emit one corrective input_json_delta with the
            // fully patched JSON before closing the block.
            if (toolInfo.shimmed) {
                const patched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallShim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyToolCallShimToBuffer"])(toolInfo.name, toolInfo.argBuffer || "");
                results.push({
                    type: "content_block_delta",
                    index: toolInfo.blockIndex,
                    delta: {
                        type: "input_json_delta",
                        partial_json: patched
                    }
                });
            }
            results.push({
                type: "content_block_stop",
                index: toolInfo.blockIndex
            });
        }
        // Emit any XML-extracted tool calls (from models like Dracarys that
        // emit <invoke> blocks in content instead of JSON tool_calls in delta)
        const xmlToolCalls = state._pendingXmlToolCalls || [];
        for (const tc of xmlToolCalls){
            const blockIndex = state.nextBlockIndex++;
            results.push({
                type: "content_block_start",
                index: blockIndex,
                content_block: {
                    type: "tool_use",
                    id: tc.id,
                    name: normalizeToolName(tc.name),
                    input: tc.args
                }
            });
            results.push({
                type: "content_block_stop",
                index: blockIndex
            });
        }
        // Override finish_reason to tool_use if XML tool calls were found
        const overrideFinishReason = xmlToolCalls.length > 0 ? "tool_calls" : choice.finish_reason;
        // Mark finish for later usage injection in stream.js
        state.finishReason = overrideFinishReason;
        // Use tracked usage (will be estimated in stream.js if not valid)
        const finalUsage = state.usage || {
            input_tokens: 0,
            output_tokens: 0
        };
        results.push({
            type: "message_delta",
            delta: {
                stop_reason: convertFinishReason(overrideFinishReason)
            },
            usage: finalUsage
        });
        results.push({
            type: "message_stop"
        });
    }
    return results.length > 0 ? results : null;
}
// Convert OpenAI finish_reason to Claude stop_reason
function convertFinishReason(reason) {
    switch(reason){
        case "stop":
            return "end_turn";
        case "length":
            return "max_tokens";
        case "tool_calls":
            return "tool_use";
        default:
            // Gemini/Antigravity abort reasons (e.g. MALFORMED_FUNCTION_CALL,
            // UNEXPECTED_TOOL_CALL — see isAbortFinishReason) reach here unrecognized
            // after the OpenAI hub normalization. Collapsing them to a clean
            // "end_turn" presents an aborted tool call to the client as a successful
            // completion (9router#2462 sub-bug #2). Surface them as "tool_use" —
            // the same non-clean-stop signal already used for real tool_calls above —
            // so the client does not treat the turn as done. Genuinely unknown future
            // reasons still fall back to "end_turn" so a benign new value does not
            // start misreporting every Gemini-family turn as an unfinished tool call.
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAbortFinishReason"])(reason) ? "tool_use" : "end_turn";
    }
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, null, openaiToClaudeResponse);
}),
"[project]/open-sse/translator/response/gemini-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "geminiToOpenAIResponse",
    ()=>geminiToOpenAIResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/textualToolCall.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHelpers.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
const REASONING_TAG_OPEN_REGEX = /<(think|thinking|thought|internal_thought)(?=\s|>|\r?\n)(?:\s[^>]*)?(?:>|\r?\n)/i;
const REASONING_TAG_OPEN_PREFIXES = [
    "<think",
    "<thinking",
    "<thought",
    "<internal_thought"
];
// Close-tag matchers are needed for every text delta of a streamed reasoning response.
// Building `new RegExp("</tag>", "i")` on each delta recompiles the pattern thousands of
// times over a long stream (pure CPU waste on the token hot path). The tag name comes from
// the fixed REASONING_TAG_OPEN_REGEX capture group, so the cache is naturally bounded to a
// handful of entries. The regexes are non-global, so reuse across calls is safe (no shared
// lastIndex state).
const reasoningCloseTagRegexCache = new Map();
function getReasoningCloseTagRegex(tagName) {
    let regex = reasoningCloseTagRegexCache.get(tagName);
    if (!regex) {
        regex = new RegExp(`</${tagName}>`, "i");
        reasoningCloseTagRegexCache.set(tagName, regex);
    }
    return regex;
}
function isIgnorableReasoningTagPrefix(value) {
    return /^(?:\s|§\d+§)*$/.test(value);
}
function getTrailingReasoningTagPrefixStart(text) {
    const lastOpen = text.lastIndexOf("<");
    if (lastOpen < 0) return -1;
    const suffix = text.slice(lastOpen).toLowerCase();
    if (!suffix || suffix.includes(">") || suffix.includes("\n") || suffix.includes("\r")) return -1;
    return REASONING_TAG_OPEN_PREFIXES.some((prefix)=>prefix.startsWith(suffix)) ? lastOpen : -1;
}
function getTrailingReasoningCloseTagPrefixStart(text, tagName) {
    const lastClose = text.lastIndexOf("</");
    if (lastClose < 0) return -1;
    const suffix = text.slice(lastClose).toLowerCase();
    if (!suffix || suffix.includes(">") || suffix.includes("\n") || suffix.includes("\r")) return -1;
    return `</${tagName.toLowerCase()}>`.startsWith(suffix) ? lastClose : -1;
}
function consumeTextualReasoningTags(text, state, results) {
    const pendingTagBuffer = state.textualReasoningTagBuffer || "";
    if (state.activeTextualReasoningTag && pendingTagBuffer.startsWith("</")) {
        const combinedClose = `${pendingTagBuffer}${text}`;
        const closeTag = `</${state.activeTextualReasoningTag}>`;
        const lowerCombinedClose = combinedClose.toLowerCase();
        const lowerCloseTag = closeTag.toLowerCase();
        if (lowerCombinedClose.startsWith(lowerCloseTag)) {
            emitTextDelta(state.textualReasoningContentBuffer || "", state, results, "reasoning_content");
            state.activeTextualReasoningTag = undefined;
            state.textualReasoningContentBuffer = undefined;
            state.textualReasoningTagBuffer = undefined;
            return combinedClose.slice(closeTag.length);
        }
        if (lowerCloseTag.startsWith(lowerCombinedClose)) {
            state.textualReasoningTagBuffer = combinedClose;
            return "";
        }
    }
    let remaining = `${state.textualReasoningTagBuffer || ""}${text}`;
    state.textualReasoningTagBuffer = undefined;
    while(remaining){
        if (state.activeTextualReasoningTag) {
            const bufferedReasoning = `${state.textualReasoningContentBuffer || ""}${remaining}`;
            const closeRegex = getReasoningCloseTagRegex(state.activeTextualReasoningTag);
            const closeMatch = closeRegex.exec(bufferedReasoning);
            if (!closeMatch || closeMatch.index < 0) {
                const partialCloseStart = getTrailingReasoningCloseTagPrefixStart(bufferedReasoning, state.activeTextualReasoningTag);
                if (partialCloseStart >= 0) {
                    state.textualReasoningContentBuffer = bufferedReasoning.slice(0, partialCloseStart);
                    state.textualReasoningTagBuffer = bufferedReasoning.slice(partialCloseStart);
                    return "";
                }
                state.textualReasoningContentBuffer = bufferedReasoning;
                return "";
            }
            emitTextDelta(bufferedReasoning.slice(0, closeMatch.index), state, results, "reasoning_content");
            state.activeTextualReasoningTag = undefined;
            state.textualReasoningContentBuffer = undefined;
            const closeEnd = bufferedReasoning.indexOf(">", closeMatch.index);
            remaining = bufferedReasoning.slice(closeEnd >= 0 ? closeEnd + 1 : closeMatch.index + closeMatch[0].length);
            continue;
        }
        const openMatch = REASONING_TAG_OPEN_REGEX.exec(remaining);
        if (!openMatch || openMatch.index < 0) {
            const partialStart = getTrailingReasoningTagPrefixStart(remaining);
            if (partialStart >= 0) {
                state.textualReasoningTagBuffer = remaining.slice(partialStart);
                const prefix = remaining.slice(0, partialStart);
                return isIgnorableReasoningTagPrefix(prefix) ? "" : prefix;
            }
            return remaining;
        }
        const before = remaining.slice(0, openMatch.index);
        if (before && !isIgnorableReasoningTagPrefix(before)) {
            emitTextDelta(before, state, results, "content");
        }
        const tagName = openMatch[1];
        const bodyStart = openMatch.index + openMatch[0].length;
        const afterOpen = remaining.slice(bodyStart);
        const closeRegex = getReasoningCloseTagRegex(tagName);
        const closeMatch = closeRegex.exec(afterOpen);
        if (!closeMatch || closeMatch.index < 0) {
            state.activeTextualReasoningTag = tagName;
            state.textualReasoningContentBuffer = afterOpen;
            return "";
        }
        emitTextDelta(afterOpen.slice(0, closeMatch.index), state, results, "reasoning_content");
        remaining = afterOpen.slice(closeMatch.index + closeMatch[0].length);
    }
    return "";
}
function flushOpenTextualReasoning(state, results) {
    if (!state.activeTextualReasoningTag && !state.textualReasoningContentBuffer) return;
    emitTextDelta(state.textualReasoningContentBuffer || "", state, results, "reasoning_content");
    state.activeTextualReasoningTag = undefined;
    state.textualReasoningContentBuffer = undefined;
    state.textualReasoningTagBuffer = undefined;
}
function emitTextDelta(content, state, results, field = "content") {
    if (!content) return;
    if (field === "content") state.hasEmittedContent = true;
    results.push({
        id: `chatcmpl-${state.messageId}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: state.model,
        choices: [
            {
                index: 0,
                delta: {
                    [field]: content
                },
                finish_reason: null
            }
        ]
    });
}
function normalizeToolCallArgs(args) {
    if (typeof args !== "string") return args;
    const trimmed = args.trim();
    if (!trimmed || !(trimmed.startsWith("{") || trimmed.startsWith("["))) return args;
    try {
        return JSON.parse(trimmed);
    } catch  {
        return args;
    }
}
function buildToolCallId(functionCall, toolName, toolCallIndex) {
    return typeof functionCall?.id === "string" && functionCall.id.length > 0 ? functionCall.id : `${toolName}-${Date.now()}-${toolCallIndex}`;
}
function getSignatureCacheKey(state, toolCallId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(state?.signatureNamespace, toolCallId);
}
function emitFunctionCallPart(part, state, results) {
    const rawToolName = part.functionCall.name;
    const fcName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawToolName, state.toolNameMap) ?? rawToolName;
    const fcArgs = normalizeToolCallArgs(part.functionCall.args || {});
    const toolCallIndex = state.functionIndex++;
    const toolCall = {
        id: buildToolCallId(part.functionCall, fcName, toolCallIndex),
        index: toolCallIndex,
        type: "function",
        function: {
            name: fcName,
            arguments: JSON.stringify(fcArgs)
        }
    };
    if (state.pendingThoughtSignature) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeGeminiThoughtSignature"])(getSignatureCacheKey(state, toolCall.id), state.pendingThoughtSignature);
        state.pendingThoughtSignature = null;
    }
    state.toolCalls.set(toolCallIndex, toolCall);
    results.push({
        id: `chatcmpl-${state.messageId}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: state.model,
        choices: [
            {
                index: 0,
                delta: {
                    tool_calls: [
                        toolCall
                    ]
                },
                finish_reason: null
            }
        ]
    });
}
function geminiToOpenAIResponse(chunk, state) {
    if (!chunk) return null;
    // Handle Antigravity wrapper
    const response = chunk.response || chunk;
    if (!response) return null;
    const modelVersion = typeof response.modelVersion === "string" ? response.modelVersion.toLowerCase() : "";
    const parseTextualReasoningTags = !chunk.response && !modelVersion.startsWith("antigravity/");
    const results = [];
    const candidate = response.candidates?.[0];
    if (!candidate) {
        // Mid-stream Gemini API error: the stream can emit an error object
        // `{ "error": { "code": 503, "message": "...", "status": "UNAVAILABLE" } }`
        // (optionally wrapped in `response`) instead of a candidates payload — typically
        // after some partial content. Without this branch the chunk has no candidates and
        // no promptFeedback, so it is dropped (return null) and the stream ends with a
        // default finish_reason "stop", masking the failure and skipping combo fallback.
        // Surface it as state.upstreamError so stream.ts errors the stream out (mirrors the
        // openai-responses translator's normalizeUpstreamFailure path).
        const errorObj = response.error || chunk.error;
        if (errorObj && typeof errorObj === "object") {
            const rawCode = errorObj.code;
            const rawStatus = errorObj.status;
            const status = typeof rawCode === "number" && rawCode >= 400 && rawCode <= 599 ? rawCode : rawStatus === "RESOURCE_EXHAUSTED" ? 429 : 502;
            const message = typeof errorObj.message === "string" ? errorObj.message : "Gemini upstream failure";
            state.upstreamError = {
                status,
                type: status === 429 ? "rate_limit_error" : "server_error",
                code: typeof rawStatus === "string" && rawStatus ? rawStatus : status === 429 ? "rate_limit_exceeded" : "bad_gateway",
                message
            };
            return null;
        }
        const promptFeedback = response.promptFeedback || chunk.promptFeedback;
        if (!promptFeedback) return null;
        if (!state.messageId) {
            state.messageId = response.responseId || `msg_${Date.now()}`;
            state.model = response.modelVersion || "gemini";
            results.push({
                id: `chatcmpl-${state.messageId}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: state.model,
                choices: [
                    {
                        index: 0,
                        delta: {
                            role: "assistant",
                            content: ""
                        },
                        finish_reason: null
                    }
                ]
            });
        }
        results.push({
            id: `chatcmpl-${state.messageId}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: state.model,
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: "content_filter"
                }
            ]
        });
        return results;
    }
    const content = candidate.content;
    // Initialize state
    if (!state.messageId) {
        state.messageId = response.responseId || `msg_${Date.now()}`;
        state.model = response.modelVersion || "gemini";
        state.functionIndex = 0;
        results.push({
            id: `chatcmpl-${state.messageId}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: state.model,
            choices: [
                {
                    index: 0,
                    delta: {
                        role: "assistant"
                    },
                    finish_reason: null
                }
            ]
        });
    }
    // Process parts
    if (content?.parts) {
        for (const part of content.parts){
            // Normalize the part text once: strip ANSI/VT100 escape codes that some
            // upstreams (gemini-cli terminal redraws) inject, so the `<thinking>` /
            // `[Tool call:]` textual parsers below never see stray control bytes (#2273).
            const partText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripAnsiCodes"])(part.text);
            const hasThoughtSig = part.thoughtSignature || part.thought_signature;
            const isThought = part.thought === true;
            if (hasThoughtSig && typeof hasThoughtSig === "string") {
                state.pendingThoughtSignature = hasThoughtSig;
            }
            // Handle thought signature (thinking mode) or native gemini thought flag
            if (hasThoughtSig || isThought) {
                const hasTextContent = partText !== undefined && partText !== "";
                const hasFunctionCall = !!part.functionCall;
                // Gemini/Antigravity can emit thoughtSignature as a standalone part
                // immediately before the functionCall part. Keep it pending so the
                // following functionCall is cached and can be re-attached on later
                // turns; otherwise OpenAI-format clients lose the signature and the
                // next Gemini request has to stringify historical tool calls.
                if (hasThoughtSig && !hasTextContent && !hasFunctionCall) {
                    continue;
                }
                if (hasTextContent) {
                    if (!isThought) {
                        state.hasEmittedContent = true;
                    }
                    results.push({
                        id: `chatcmpl-${state.messageId}`,
                        object: "chat.completion.chunk",
                        created: Math.floor(Date.now() / 1000),
                        model: state.model,
                        choices: [
                            {
                                index: 0,
                                delta: isThought ? {
                                    reasoning_content: partText
                                } : {
                                    content: partText
                                },
                                finish_reason: null
                            }
                        ]
                    });
                }
                if (hasFunctionCall) {
                    if (parseTextualReasoningTags) {
                        // Flush any still-open textual reasoning wrapper as reasoning_content BEFORE
                        // the tool call. A signed native functionCall arriving while a `<thinking>`
                        // (etc.) tag opened in an earlier chunk is still buffered must not silently
                        // drop that buffered reasoning — flushOpenTextualReasoning emits it and clears
                        // the active-tag/content buffers. (LEDGER-4 / #3821-review)
                        flushOpenTextualReasoning(state, results);
                        // Also drop any partial open-tag fragment buffered at a chunk boundary
                        // (flushOpenTextualReasoning early-returns when only this is set), matching the
                        // pre-fix branch which cleared all three buffers. (#3821-review convergence)
                        state.textualReasoningTagBuffer = undefined;
                    }
                    emitFunctionCallPart(part, state, results);
                }
                continue;
            }
            // Text content (non-thinking). Some Gemini/Antigravity turns can imitate
            // the request-side signatureless history fallback and emit a textual
            // "[Tool call: ...]" block instead of native functionCall. Convert that
            // back to a structured OpenAI tool call so clients/tools do not see it as
            // assistant prose.
            if (partText !== undefined && partText !== "") {
                const afterReasoning = parseTextualReasoningTags ? consumeTextualReasoningTags(partText, state, results) : partText;
                if (!afterReasoning) continue;
                let accumulated = (state.textualToolCallBuffer || "") + afterReasoning;
                let candidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(accumulated);
                if (candidate) {
                    accumulated = accumulated.replace(/[\u200B-\u200D\uFEFF]/g, "");
                    let toolCallIndex = accumulated.lastIndexOf("(empty)[Tool call:");
                    if (toolCallIndex < 0) {
                        toolCallIndex = accumulated.lastIndexOf("[Tool call:");
                    }
                    if (toolCallIndex < 0) {
                        const lastParen = accumulated.lastIndexOf("(");
                        if (lastParen !== -1 && "(empty)[Tool call:".startsWith(accumulated.slice(lastParen))) {
                            toolCallIndex = lastParen;
                        } else {
                            const lastBracket = accumulated.lastIndexOf("[");
                            if (lastBracket !== -1 && "[Tool call:".startsWith(accumulated.slice(lastBracket))) {
                                toolCallIndex = lastBracket;
                            }
                        }
                    }
                    if (toolCallIndex > 0) {
                        const leftPart = accumulated.slice(0, toolCallIndex);
                        state.hasEmittedContent = true;
                        results.push({
                            id: `chatcmpl-${state.messageId}`,
                            object: "chat.completion.chunk",
                            created: Math.floor(Date.now() / 1000),
                            model: state.model,
                            choices: [
                                {
                                    index: 0,
                                    delta: {
                                        content: leftPart
                                    },
                                    finish_reason: null
                                }
                            ]
                        });
                        accumulated = accumulated.slice(toolCallIndex);
                        candidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(accumulated);
                    }
                    if (candidate) {
                        if (candidate.kind === "complete") {
                            emitFunctionCallPart({
                                functionCall: {
                                    name: candidate.name,
                                    args: candidate.args
                                }
                            }, state, results);
                            state.textualToolCallBuffer = "";
                        } else {
                            state.textualToolCallBuffer = accumulated;
                        }
                        continue;
                    }
                }
                if (state.textualToolCallBuffer) {
                    const flushedText = state.textualToolCallBuffer + afterReasoning;
                    state.textualToolCallBuffer = "";
                    state.hasEmittedContent = true;
                    results.push({
                        id: `chatcmpl-${state.messageId}`,
                        object: "chat.completion.chunk",
                        created: Math.floor(Date.now() / 1000),
                        model: state.model,
                        choices: [
                            {
                                index: 0,
                                delta: {
                                    content: flushedText
                                },
                                finish_reason: null
                            }
                        ]
                    });
                    continue;
                }
                state.hasEmittedContent = true;
                results.push({
                    id: `chatcmpl-${state.messageId}`,
                    object: "chat.completion.chunk",
                    created: Math.floor(Date.now() / 1000),
                    model: state.model,
                    choices: [
                        {
                            index: 0,
                            delta: {
                                content: afterReasoning
                            },
                            finish_reason: null
                        }
                    ]
                });
            }
            // Function call
            if (part.functionCall) {
                emitFunctionCallPart(part, state, results);
            }
            // Inline data (images)
            const inlineData = part.inlineData || part.inline_data;
            if (inlineData?.data) {
                const mimeType = inlineData.mimeType || inlineData.mime_type || "image/png";
                results.push({
                    id: `chatcmpl-${state.messageId}`,
                    object: "chat.completion.chunk",
                    created: Math.floor(Date.now() / 1000),
                    model: state.model,
                    choices: [
                        {
                            index: 0,
                            delta: {
                                images: [
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:${mimeType};base64,${inlineData.data}`
                                        }
                                    }
                                ]
                            },
                            finish_reason: null
                        }
                    ]
                });
            }
        }
    }
    // Grounding Metadata (Google Search)
    const grounding = candidate.groundingMetadata || candidate.grounding_metadata;
    if (grounding && !state.groundingProcessed) {
        const citations = [];
        if (grounding.groundingChunks || grounding.grounding_chunks) {
            const chunks = grounding.groundingChunks || grounding.grounding_chunks;
            for (const chunk of chunks){
                if (chunk.web) {
                    citations.push({
                        title: chunk.web.title,
                        url: chunk.web.uri
                    });
                }
            }
        }
        if (citations.length > 0) {
            results.push({
                id: `chatcmpl-${state.messageId}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: state.model,
                choices: [
                    {
                        index: 0,
                        delta: {
                            citations
                        },
                        finish_reason: null
                    }
                ]
            });
            state.groundingProcessed = true;
        }
    }
    // Usage metadata - extract before finish reason so we can include it
    const usageMeta = response.usageMetadata || chunk.usageMetadata;
    if (usageMeta && typeof usageMeta === "object") {
        const cachedTokens = typeof usageMeta.cachedContentTokenCount === "number" ? usageMeta.cachedContentTokenCount : 0;
        const promptTokenCountRaw = typeof usageMeta.promptTokenCount === "number" ? usageMeta.promptTokenCount : 0;
        const thoughtsTokens = typeof usageMeta.thoughtsTokenCount === "number" ? usageMeta.thoughtsTokenCount : 0;
        let candidatesTokens = typeof usageMeta.candidatesTokenCount === "number" ? usageMeta.candidatesTokenCount : 0;
        const totalTokens = typeof usageMeta.totalTokenCount === "number" ? usageMeta.totalTokenCount : 0;
        // prompt_tokens = promptTokenCount (includes cached tokens, matching claude-to-openai.js behavior)
        const promptTokens = promptTokenCountRaw;
        // Fallback calculation if candidatesTokenCount is 0 but totalTokenCount exists
        if (candidatesTokens === 0 && totalTokens > 0) {
            candidatesTokens = totalTokens - promptTokenCountRaw - thoughtsTokens;
            if (candidatesTokens < 0) candidatesTokens = 0;
        }
        // completion_tokens = candidatesTokenCount + thoughtsTokenCount (match Go code)
        const completionTokens = candidatesTokens + thoughtsTokens;
        state.usage = {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens
        };
        // Add prompt_tokens_details if cached tokens exist
        if (cachedTokens > 0) {
            state.usage.prompt_tokens_details = {
                cached_tokens: cachedTokens
            };
        }
        // Add completion_tokens_details if reasoning tokens exist
        if (thoughtsTokens > 0) {
            state.usage.completion_tokens_details = {
                reasoning_tokens: thoughtsTokens
            };
        }
    }
    // Finish reason - include usage in final chunk
    if (candidate.finishReason) {
        if (parseTextualReasoningTags) {
            flushOpenTextualReasoning(state, results);
        }
        if (state.textualToolCallBuffer) {
            const remainingText = state.textualToolCallBuffer;
            state.textualToolCallBuffer = "";
            const textualToolCall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseTextualToolCallCandidate"])(remainingText);
            if (textualToolCall && textualToolCall.kind === "complete") {
                emitFunctionCallPart({
                    functionCall: {
                        name: textualToolCall.name,
                        args: textualToolCall.args
                    }
                }, state, results);
            } else if (state.hasEmittedContent || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["containsTextualToolCallMarker"])(remainingText)) {
                state.hasEmittedContent = true;
                results.push({
                    id: `chatcmpl-${state.messageId}`,
                    object: "chat.completion.chunk",
                    created: Math.floor(Date.now() / 1000),
                    model: state.model,
                    choices: [
                        {
                            index: 0,
                            delta: {
                                content: remainingText
                            },
                            finish_reason: null
                        }
                    ]
                });
            }
        }
        // Live incident (dashboard log id 1784489701456-d8c0e9): MALFORMED_FUNCTION_CALL /
        // UNEXPECTED_TOOL_CALL mean Gemini's OWN parser rejected an attempted tool call —
        // there is no real functionCall part to translate, only a human-readable
        // finishMessage. Passing "malformed_function_call" through raw as finish_reason
        // (the 9router#2462 fix below) is honest but useless to a real OpenAI-format
        // client: it isn't one of the 5 values the spec defines, so a client like OpenClaw
        // has no handling for it at all and just silently never notices the turn failed.
        // Synthesize a tool_calls entry instead so finish_reason becomes the standard
        // "tool_calls" — that routes the failure into the ordinary "tool call arguments
        // didn't parse" path every OpenAI-compatible agent loop already handles, instead
        // of an unrecognized enum value nothing is watching for.
        //
        // Follow-up live incident (log id 1784589106014-2a42f8): Gemini can emit a REAL,
        // valid functionCall (e.g. "openclaw") AND still finish the SAME candidate with
        // MALFORMED_FUNCTION_CALL — the model attempted multiple tool calls in one turn,
        // one parsed cleanly and another (e.g. "exec"+"cron") did not. The first version of
        // this fix skipped synthesis whenever state.toolCalls.size > 0, on the assumption
        // that a real call already existing meant the model was retrying a LATER, separate
        // attempt after an earlier one already succeeded — but that's indistinguishable,
        // from here, from a real call and a malformed one arriving in the very same turn.
        // Skipping silently discarded the malformed attempt's failure entirely: the client
        // saw "openclaw" succeed and never learned "exec"/"cron" were attempted and
        // rejected. Always synthesize instead — multiple tool_calls in one response is
        // normal, well-supported OpenAI behavior (parallel tool calls), so this adds the
        // failure as an additional entry rather than replacing or hiding the real one.
        const isMalformedToolCall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isMalformedToolCallFinishReason"])(candidate.finishReason);
        if (isMalformedToolCall) {
            emitFunctionCallPart({
                functionCall: {
                    name: "malformed_tool_call",
                    args: {
                        error: candidate.finishReason,
                        message: typeof candidate.finishMessage === "string" ? candidate.finishMessage : null
                    }
                }
            }, state, results);
        }
        // normalizeOpenAICompatibleFinishReasonString lowercases, maps max_tokens→length,
        // and folds Gemini safety reasons (safety/recitation/blocklist/...) → content_filter
        // so downstream clients can distinguish a blocked completion from a normal stop.
        // Abort reasons (MALFORMED_FUNCTION_CALL, UNEXPECTED_TOOL_CALL, ...) are NOT in
        // either mapped set, so they surface here unchanged (e.g. raw
        // "malformed_function_call") rather than being folded into a misleading "stop" —
        // isAbortFinishReason() (finishReason.ts) is what the openai→claude hub step
        // uses downstream to recognize this raw value and keep it off a clean end_turn
        // (9router#2462 sub-bug #2).
        let finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReasonString"])(candidate.finishReason);
        if ((finishReason === "stop" || isMalformedToolCall) && state.toolCalls.size > 0) {
            // Covers (1) a clean stop with tool calls already accumulated (pre-existing
            // behavior, unchanged) and (2) any malformed-tool-call abort — always true here
            // since the synthesis above guarantees state.toolCalls.size > 0 whenever
            // isMalformedToolCall is true.
            finishReason = "tool_calls";
        }
        const finalChunk = {
            id: `chatcmpl-${state.messageId}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: state.model,
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: finishReason
                }
            ]
        };
        // Include usage in final chunk for downstream translators
        if (state.usage) {
            finalChunk.usage = state.usage;
        }
        results.push(finalChunk);
        state.finishReason = finishReason;
    }
    return results.length > 0 ? results : null;
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, null, geminiToOpenAIResponse);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, null, geminiToOpenAIResponse);
}),
"[project]/open-sse/translator/response/gemini-to-claude.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "geminiToClaudeResponse",
    ()=>geminiToClaudeResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeToolRemapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
;
;
;
;
;
function normalizeToolName(name) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeToolRemapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["REVERSE_MAP"][name] ?? name;
}
function geminiToClaudeResponse(chunk, state) {
    if (!chunk) return null;
    // Handle Antigravity wrapper
    const response = chunk.response || chunk;
    if (!response || !response.candidates?.[0]) return null;
    const results = [];
    const candidate = response.candidates[0];
    const content = candidate.content;
    // ── Initialize: emit message_start ─────────────────────────────
    if (!state.messageId) {
        state.messageId = response.responseId || `msg_${Date.now()}`;
        state.model = response.modelVersion || "gemini";
        state.contentBlockIndex = 0;
        // Track open text block so we can keep it open across chunks
        state.openTextBlockIdx = null;
        results.push({
            type: "message_start",
            message: {
                id: state.messageId,
                type: "message",
                role: "assistant",
                model: state.model,
                content: [],
                stop_reason: null,
                stop_sequence: null,
                usage: {
                    input_tokens: 0,
                    output_tokens: 0
                }
            }
        });
    }
    // ── Process parts ──────────────────────────────────────────────
    if (content?.parts) {
        for (const part of content.parts){
            const hasThoughtSig = part.thoughtSignature || part.thought_signature;
            const isThought = part.thought === true;
            // Capture thoughtSignature so the next functionCall (or same-part call)
            // can persist it for Claude→Gemini follow-up turns (#8979 / #2504 parity).
            if (typeof hasThoughtSig === "string" && hasThoughtSig.length > 0) {
                state.pendingThoughtSignature = hasThoughtSig;
            }
            // Thinking content → thinking block (always open+close per chunk)
            if (isThought && part.text) {
                // Close any open text block first
                if (state.openTextBlockIdx !== null) {
                    results.push({
                        type: "content_block_stop",
                        index: state.openTextBlockIdx
                    });
                    state.openTextBlockIdx = null;
                }
                const idx = state.contentBlockIndex++;
                results.push({
                    type: "content_block_start",
                    index: idx,
                    content_block: {
                        type: "thinking",
                        thinking: ""
                    }
                });
                results.push({
                    type: "content_block_delta",
                    index: idx,
                    delta: {
                        type: "thinking_delta",
                        thinking: part.text
                    }
                });
                results.push({
                    type: "content_block_stop",
                    index: idx
                });
                continue;
            }
            // Standalone thoughtSignature part (no text / no functionCall): keep
            // pending and wait for the following functionCall — do not emit to Claude.
            if (typeof hasThoughtSig === "string" && hasThoughtSig.length > 0 && (part.text === undefined || part.text === "") && !part.functionCall) {
                continue;
            }
            // Function call → tool_use block
            if (part.functionCall) {
                // Close any open text block first
                if (state.openTextBlockIdx !== null) {
                    results.push({
                        type: "content_block_stop",
                        index: state.openTextBlockIdx
                    });
                    state.openTextBlockIdx = null;
                }
                const fc = part.functionCall;
                const rawToolName = fc.name;
                const mappedName = state.toolNameMap?.get(rawToolName);
                // When the toolNameMap provides a match (e.g., lowercase "bash" → "Bash"),
                // use it directly without passing through normalizeToolName(), which would
                // reverse TitleCase back to lowercase via REVERSE_MAP (#9568).
                const restoredToolName = mappedName || normalizeToolName(rawToolName);
                const idx = state.contentBlockIndex++;
                const toolId = fc.id || `toolu_${Date.now()}_${idx}`;
                const signatureForToolCall = (typeof hasThoughtSig === "string" && hasThoughtSig.length > 0 ? hasThoughtSig : null) || (typeof state.pendingThoughtSignature === "string" && state.pendingThoughtSignature.length > 0 ? state.pendingThoughtSignature : null);
                if (signatureForToolCall) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeGeminiThoughtSignature"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(state.signatureNamespace, toolId), signatureForToolCall);
                    state.pendingThoughtSignature = null;
                }
                results.push({
                    type: "content_block_start",
                    index: idx,
                    content_block: {
                        type: "tool_use",
                        id: toolId,
                        name: restoredToolName,
                        input: {}
                    }
                });
                const argsStr = JSON.stringify(fc.args || {});
                results.push({
                    type: "content_block_delta",
                    index: idx,
                    delta: {
                        type: "input_json_delta",
                        partial_json: argsStr
                    }
                });
                results.push({
                    type: "content_block_stop",
                    index: idx
                });
                if (!state.hasToolUse) state.hasToolUse = true;
                continue;
            }
            // Regular text content → keep text block open across streaming chunks
            const isRegularText = part.text !== undefined && part.text !== "" && !hasThoughtSig;
            const isTextAfterThinking = hasThoughtSig && part.text !== undefined && part.text !== "" && !isThought && !part.functionCall;
            if (isRegularText || isTextAfterThinking) {
                // Open a new text block only if none is open yet
                if (state.openTextBlockIdx === null) {
                    const idx = state.contentBlockIndex++;
                    state.openTextBlockIdx = idx;
                    results.push({
                        type: "content_block_start",
                        index: idx,
                        content_block: {
                            type: "text",
                            text: ""
                        }
                    });
                }
                // Always emit delta into the SAME open block (no open+close per chunk)
                results.push({
                    type: "content_block_delta",
                    index: state.openTextBlockIdx,
                    delta: {
                        type: "text_delta",
                        text: part.text
                    }
                });
            }
        }
    }
    // ── Usage metadata ─────────────────────────────────────────────
    const usageMeta = response.usageMetadata || chunk.usageMetadata;
    if (usageMeta && typeof usageMeta === "object") {
        const inputTokens = typeof usageMeta.promptTokenCount === "number" ? usageMeta.promptTokenCount : 0;
        const candidatesTokens = typeof usageMeta.candidatesTokenCount === "number" ? usageMeta.candidatesTokenCount : 0;
        const thoughtsTokens = typeof usageMeta.thoughtsTokenCount === "number" ? usageMeta.thoughtsTokenCount : 0;
        const cachedTokens = typeof usageMeta.cachedContentTokenCount === "number" ? usageMeta.cachedContentTokenCount : 0;
        state.usage = {
            input_tokens: inputTokens,
            output_tokens: candidatesTokens + thoughtsTokens
        };
        if (cachedTokens > 0) {
            state.usage.cache_read_input_tokens = cachedTokens;
        }
    }
    // ── Finish reason → close open blocks + message_delta + message_stop ──
    if (candidate.finishReason) {
        // Close any still-open text block before finishing
        if (state.openTextBlockIdx !== null) {
            results.push({
                type: "content_block_stop",
                index: state.openTextBlockIdx
            });
            state.openTextBlockIdx = null;
        }
        let stopReason;
        const reason = candidate.finishReason.toLowerCase();
        if (state.hasToolUse || reason === "tool_calls") {
            stopReason = "tool_use";
        } else if (reason === "max_tokens" || reason === "length") {
            stopReason = "max_tokens";
        } else if (reason === "safety" || reason === "recitation" || reason === "blocklist") {
            // Content blocked by Gemini safety. Any text streamed before this finish
            // reason has already been emitted to the client — this is unavoidable in
            // SSE streaming. Map to end_turn (Claude has no "content blocked" reason).
            stopReason = "end_turn";
        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAbortFinishReason"])(reason)) {
            // Aborted/malformed tool call (e.g. MALFORMED_FUNCTION_CALL,
            // UNEXPECTED_TOOL_CALL). Surface as tool_use rather than a clean end_turn
            // so the client sees the turn did not complete normally. Same fix as the
            // hub path (openai-to-claude.ts) — this direct Gemini→Claude translator is
            // the one Claude Code hits through an antigravity/Gemini-routed model.
            // Port of decolua/9router#2462 by @anhdiepmmk.
            stopReason = "tool_use";
        } else {
            stopReason = "end_turn";
        }
        results.push({
            type: "message_delta",
            delta: {
                stop_reason: stopReason,
                stop_sequence: null
            },
            usage: state.usage || {
                input_tokens: 0,
                output_tokens: 0
            }
        });
        results.push({
            type: "message_stop"
        });
    }
    return results.length > 0 ? results : null;
}
// Register as direct path: Gemini → Claude
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, null, geminiToClaudeResponse);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE, null, geminiToClaudeResponse);
}),
"[project]/open-sse/translator/response/openai-to-antigravity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openaiToAntigravityResponse",
    ()=>openaiToAntigravityResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
function openaiToAntigravityResponse(chunk, state) {
    if (!chunk) return null;
    const choice = chunk.choices?.[0];
    if (!choice) {
        if (chunk.usage) {
            state._usage = chunk.usage;
        }
        return null;
    }
    const delta = choice.delta || {};
    const finishReason = choice.finish_reason;
    // Init state
    if (!state._toolCallAccum) state._toolCallAccum = {};
    if (!state._responseId) state._responseId = chunk.id || `resp_${Date.now()}`;
    if (!state._modelVersion) state._modelVersion = chunk.model || "";
    const parts = [];
    // Thinking/reasoning → thought part
    if (delta.reasoning_content) {
        parts.push({
            thought: true,
            text: delta.reasoning_content
        });
    }
    // Text content
    if (delta.content) {
        parts.push({
            text: delta.content
        });
    }
    // Accumulate tool calls silently (no emit until finish)
    if (delta.tool_calls) {
        for (const tc of delta.tool_calls){
            const idx = tc.index ?? 0;
            if (!state._toolCallAccum[idx]) {
                state._toolCallAccum[idx] = {
                    id: "",
                    name: "",
                    arguments: ""
                };
            }
            const accum = state._toolCallAccum[idx];
            if (tc.id) accum.id = tc.id;
            if (tc.function?.name) accum.name += tc.function.name;
            if (tc.function?.arguments) accum.arguments += tc.function.arguments;
        }
        // Skip emit — wait for finish_reason
        if (parts.length === 0 && !finishReason) return null;
    }
    // On finish, emit accumulated tool calls as complete functionCall parts
    if (finishReason) {
        const indices = Object.keys(state._toolCallAccum);
        for (const idx of indices){
            const accum = state._toolCallAccum[idx];
            let args = {};
            try {
                args = JSON.parse(accum.arguments);
            } catch  {
            /* empty */ }
            parts.push({
                functionCall: {
                    name: accum.name,
                    args
                }
            });
        }
    }
    // Skip empty non-finish chunks
    if (parts.length === 0 && !finishReason) return null;
    // Ensure at least empty text part on finish with no content
    if (parts.length === 0 && finishReason) {
        parts.push({
            text: ""
        });
    }
    // Build candidate
    const candidate = {
        content: {
            role: "model",
            parts
        }
    };
    // Finish reason mapping
    if (finishReason) {
        const reasonMap = {
            stop: "STOP",
            length: "MAX_TOKENS",
            tool_calls: "STOP",
            content_filter: "SAFETY"
        };
        candidate.finishReason = reasonMap[finishReason] || "STOP";
    }
    // Build response
    const response = {
        candidates: [
            candidate
        ],
        modelVersion: state._modelVersion,
        responseId: state._responseId
    };
    // Usage metadata
    const usage = chunk.usage || state._usage;
    if (usage) {
        response.usageMetadata = {
            promptTokenCount: usage.prompt_tokens || 0,
            candidatesTokenCount: usage.completion_tokens || 0,
            totalTokenCount: usage.total_tokens || 0
        };
        if (usage.completion_tokens_details?.reasoning_tokens) {
            response.usageMetadata.thoughtsTokenCount = usage.completion_tokens_details.reasoning_tokens;
        }
        if (usage.prompt_tokens_details?.cached_tokens) {
            response.usageMetadata.cachedContentTokenCount = usage.prompt_tokens_details.cached_tokens;
        }
    }
    return {
        response
    };
}
// Register
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY, null, openaiToAntigravityResponse);
}),
"[project]/open-sse/translator/response/openai-to-gemini.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$to$2d$antigravity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-to-antigravity.ts [instrumentation] (ecmascript)");
;
;
;
// Gemini and Antigravity clients share the same Cloud Code
// `{ response: { candidates: [...] } }` envelope (see `unwrapGeminiChunk`
// callers in open-sse/utils/stream.ts, which treat FORMATS.GEMINI and
// FORMATS.ANTIGRAVITY identically). The response registry only had an
// OpenAI -> Antigravity projection registered, so an OpenAI-native provider
// serving a client whose request was detected as Gemini format (`sourceFormat`,
// e.g. a body-shape match on `contents: [...]`) streamed raw OpenAI
// `chat.completion.chunk` objects instead of the Gemini candidates envelope.
// Reuse the existing Antigravity projection — no new conversion logic needed.
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI, null, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$to$2d$antigravity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["openaiToAntigravityResponse"]);
}),
"[project]/open-sse/translator/response/openai-responses/pureHelpers.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure, stateless helpers for the OpenAI Responses <-> Chat response translator.
// Extracted verbatim from response/openai-responses.ts (no host imports, no stream state).
__turbopack_context__.s([
    "extractResponsesReasoningSummaryText",
    ()=>extractResponsesReasoningSummaryText,
    "getVisibleResponsesReasoningSummaryText",
    ()=>getVisibleResponsesReasoningSummaryText,
    "normalizeOutputIndex",
    ()=>normalizeOutputIndex,
    "normalizeToolName",
    ()=>normalizeToolName,
    "normalizeUpstreamFailure",
    ()=>normalizeUpstreamFailure,
    "stripEmptyOptionalToolArgs",
    ()=>stripEmptyOptionalToolArgs
]);
function normalizeToolName(value) {
    return typeof value === "string" ? value.trim() : "";
}
// Tools whose empty-string/empty-array optional args are safe to strip. Arbitrary
// tools are left untouched because an empty string/array can be a valid payload.
// - "Read": Claude Code's Read tool (empty `pages`) — #2937.
// - "Subagent": Cursor's local subagent tool emits a cloud-only `cloud_base_branch: ""`,
//   which Cursor rejects unless environment is cloud — ported from decolua/9router#2446.
const STRIPPABLE_EMPTY_ARG_TOOLS = new Set([
    "Read",
    "Subagent"
]);
// Deep-equal for JSON-shaped values (schema `default` comparison). Cheap and safe:
// tool args are always JSON-serializable, so a stringify comparison is exact.
function jsonValuesEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch  {
        return false;
    }
}
function hasUsableSchema(schema) {
    return !!(schema && typeof schema === "object" && !Array.isArray(schema));
}
function schemaProperties(schema) {
    return hasUsableSchema(schema) && schema.properties && typeof schema.properties === "object" ? schema.properties : null;
}
function schemaRequiredSet(schema) {
    return new Set(hasUsableSchema(schema) && Array.isArray(schema.required) ? schema.required : []);
}
function isEmptyToolArgValue(entry) {
    return entry === "" || Array.isArray(entry) && entry.length === 0;
}
// True when `entry` strictly equals the property's declared JSON Schema `default` — an
// emitted value indistinguishable from omission, safe to drop for any tool.
function matchesSchemaDefault(propSchema, entry) {
    if (!propSchema || !Object.prototype.hasOwnProperty.call(propSchema, "default")) return false;
    return jsonValuesEqual(entry, propSchema.default);
}
// True when `entry` is empty and either the tool is on the legacy allowlist, or the
// schema declares this property but does not mark it `required` (generalized #6951 rule).
function isDroppableEmptyEntry(entry, propSchema, required, key, allowlisted) {
    if (!isEmptyToolArgValue(entry)) return false;
    return allowlisted || propSchema != null && !required.has(key);
}
// #7023 — the request-side counterpart (injectOptionalEnumOmissionSentinel) widens
// no-default optional enum properties to accept `null`, meaning "omitted" (OpenAI's own
// nullable-union idiom for Responses-API strict mode). Drop the key when the model
// follows that idiom for a non-required, schema-declared property.
function isDroppableNullEntry(entry, propSchema, required, key) {
    return entry === null && propSchema != null && !required.has(key);
}
function stripEmptyOptionalToolArgsObject(value, toolName, schema) {
    const properties = schemaProperties(schema);
    const required = schemaRequiredSet(schema);
    const allowlisted = STRIPPABLE_EMPTY_ARG_TOOLS.has(toolName);
    const cleaned = {
        ...value
    };
    for (const [key, entry] of Object.entries(cleaned)){
        const propSchema = properties ? properties[key] : null;
        if (matchesSchemaDefault(propSchema, entry) || isDroppableEmptyEntry(entry, propSchema, required, key, allowlisted) || isDroppableNullEntry(entry, propSchema, required, key)) {
            delete cleaned[key];
        }
    }
    return cleaned;
}
function stripEmptyOptionalToolArgs(value, toolName, schema) {
    if (value == null) return value;
    if (typeof value === "string") {
        // JSON-string cleanup runs for allowlisted tools, or for any tool once a schema is
        // supplied (schema-aware normalization is not restricted to the allowlist).
        if (!hasUsableSchema(schema) && !STRIPPABLE_EMPTY_ARG_TOOLS.has(toolName)) return value;
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) || typeof parsed !== "object" || parsed === null) return value;
            const cleaned = stripEmptyOptionalToolArgs(parsed, toolName, schema);
            return JSON.stringify(cleaned ?? {});
        } catch  {
            return value;
        }
    }
    if (Array.isArray(value) || typeof value !== "object") return value;
    return stripEmptyOptionalToolArgsObject(value, toolName, schema);
}
function normalizeOutputIndex(outputIndex) {
    const normalized = Number(outputIndex);
    return Number.isInteger(normalized) && normalized >= 0 ? normalized : 0;
}
function normalizeUpstreamFailure(data, fallbackType = "server_error") {
    const response = data?.response && typeof data.response === "object" ? data.response : null;
    const error = response?.error && typeof response.error === "object" ? response.error : data?.error && typeof data.error === "object" ? data.error : null;
    const code = typeof error?.code === "string" ? error.code : "";
    const message = typeof error?.message === "string" ? error.message : typeof data?.message === "string" ? data.message : "Upstream failure";
    // Preserve upstream error semantics:
    // - context_length_exceeded → 400 (client can retry with smaller context)
    // - rate_limit_exceeded → 429 (client should back off)
    // - Everything else → 502 (upstream failure)
    const isContextOverflow = code === "context_length_exceeded";
    const isRateLimit = code === "rate_limit_exceeded" || code === "rate_limited";
    let status;
    let type;
    if (isRateLimit) {
        status = 429;
        type = "rate_limit_error";
    } else if (isContextOverflow) {
        status = 400;
        type = "invalid_request_error";
    } else {
        status = 502;
        type = fallbackType;
    }
    return {
        status,
        type,
        code: code || (isRateLimit ? "rate_limit_exceeded" : "bad_gateway"),
        message
    };
}
function extractResponsesReasoningSummaryText(item) {
    if (!item || !Array.isArray(item.summary)) return "";
    // #9500 — reasoning summary parts are discrete segments; join with "\n\n"
    // (matches extractThinkingFromContent convention). Filter empties so an
    // empty summary_text element does not produce a dangling separator.
    return item.summary.map((part)=>part && typeof part === "object" && typeof part.text === "string" ? part.text : "").filter((text)=>text.length > 0).join("\n\n");
}
function getVisibleResponsesReasoningSummaryText(item) {
    return extractResponsesReasoningSummaryText(item);
}
}),
"[project]/open-sse/translator/response/openai-responses/eventEmitter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Shared event-collector for the OpenAI Responses response translator's three emission
// sites (main per-chunk pass, the deferred-completion empty-choices branch introduced by
// #6906, and flushEvents at stream end) — avoids duplicating the events/emit boilerplate.
// Carries stream state (state.seq), so it lives outside the stateless pureHelpers.ts leaf.
__turbopack_context__.s([
    "createEventEmitter",
    ()=>createEventEmitter
]);
function createEventEmitter(state) {
    const events = [];
    const emit = (eventType, data)=>{
        data.sequence_number = ++state.seq;
        events.push({
            event: eventType,
            data
        });
    };
    return {
        events,
        emit
    };
}
}),
"[project]/open-sse/translator/response/responsesToolItem.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildResponsesToolCallItem",
    ()=>buildResponsesToolCallItem
]);
function buildResponsesToolCallItem(options) {
    const { callId, toolName, custom, namespace } = options;
    const item = {
        id: `fc_${callId}`,
        type: custom ? "custom_tool_call" : "function_call",
        ...custom ? {
            input: ""
        } : {
            arguments: ""
        },
        call_id: callId,
        name: toolName,
        status: "in_progress"
    };
    // Codex's ResponseItem::FunctionCall / CustomToolCall both accept an optional
    // `namespace` field and dispatch on it independently of `name` (see
    // codex-rs/protocol/src/models.rs and the `function_call_deserializes_optional_namespace`
    // round-trip test). Emit it whenever the request-side identity ledger resolved
    // the bare leaf back to a namespace sub-tool.
    if (namespace) item.namespace = namespace;
    return item;
}
}),
"[project]/open-sse/translator/response/openai-responses/requestToolIdentity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** * Resolve a flattened Chat function name back to the identity declared by the * request's Responses namespace tool. The request path supplies this map on * the response translation state; this resolver intentionally never parses a name. */ __turbopack_context__.s([
    "resolveRequestToolIdentity",
    ()=>resolveRequestToolIdentity
]);
function resolveRequestToolIdentity(identityMap, toolName) {
    if (!toolName || !identityMap) return null;
    const identity = identityMap instanceof Map ? identityMap.get(toolName) : typeof identityMap === "object" && !Array.isArray(identityMap) ? identityMap[toolName] : undefined;
    if (!identity || typeof identity !== "object" || Array.isArray(identity)) return null;
    const { namespace, name } = identity;
    return typeof namespace === "string" && namespace && typeof name === "string" && name ? {
        namespace,
        name
    } : null;
}
}),
"[project]/open-sse/translator/response/openai-responses/synthesizeCompletedToolCalls.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeFinishReason",
    ()=>computeFinishReason,
    "synthesizeCompletedToolCalls",
    ()=>synthesizeCompletedToolCalls,
    "withAssistantRoleOnFirstDelta",
    ()=>withAssistantRoleOnFirstDelta
]);
// Extracted from response/openai-responses.ts (file-size ratchet) — synthesizes
// tool_calls chunks from a response.completed event's output[] snapshot, for
// upstream providers that send a single batched completed event WITHOUT first
// emitting the individual response.output_item.added/.delta/.done events.
// Without this, state.toolCallIndex stays 0 and state.currentToolCallId stays
// null, so computeFinishReason returns "stop" instead of "tool_calls",
// breaking the agent loop for downstream Chat Completions clients.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/pureHelpers.ts [instrumentation] (ecmascript)");
;
;
function computeFinishReason(state) {
    return (state.toolCallIndex || 0) > 0 || state.currentToolCallId ? "tool_calls" : "stop";
}
/**
 * OpenAI Chat Completions streams announce the assistant role on the FIRST delta
 * (e.g. `{ "role": "assistant", "content": "" }` or `{ "role": "assistant",
 * "tool_calls": [...] }`). The Responses API has no role-announcement event, so when
 * translating Responses → Chat we must synthesize it on the first emitted chunk.
 *
 * Strict streaming clients — notably @langchain/openai's `_convertDeltaToMessageChunk`
 * (used by n8n's AI Agent) — key off the first chunk's role to build an AIMessageChunk.
 * Without it, streamed tool_call deltas are dropped and the agent returns an empty
 * response, even though the underlying tool call is well-formed.
 */ // Shared by both branches of withAssistantRoleOnFirstDelta below: stamps
// role: "assistant" onto a single delta object when eligible, returning
// whether it did so (used to short-circuit the array branch's loop).
function setAssistantRoleIfEligible(state, delta) {
    if (delta && typeof delta === "object" && !Array.isArray(delta)) {
        delta.role = "assistant";
        state.roleEmitted = true;
        return true;
    }
    return false;
}
function withAssistantRoleOnFirstDelta(state, result) {
    if (!result || state.roleEmitted) return result;
    // Handle arrays of chunks (e.g. synthesized from response.completed output[])
    if (Array.isArray(result)) {
        for (const chunk of result){
            if (setAssistantRoleIfEligible(state, chunk?.choices?.[0]?.delta)) break;
        }
        return result;
    }
    setAssistantRoleIfEligible(state, result.choices?.[0]?.delta);
    return result;
}
function baseChunk(state) {
    return {
        id: state.chatId,
        object: "chat.completion.chunk",
        created: state.created,
        model: state.model || "gpt-4"
    };
}
/** Resolve the arguments string to emit — may arrive as a string or object. */ function resolveArgsStr(rawArgs, toolName, toolSchema) {
    const argsToEmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripEmptyOptionalToolArgs"])(rawArgs, toolName, toolSchema);
    if (argsToEmit != null) {
        return typeof argsToEmit === "string" ? argsToEmit : JSON.stringify(argsToEmit);
    }
    if (rawArgs != null) {
        return typeof rawArgs === "string" ? rawArgs : JSON.stringify(rawArgs);
    }
    return "";
}
/**
 * Build the header + args chunks for one synthesized function_call item,
 * mutating `state` exactly as the incremental output_item.added/.done path
 * would (currentToolCallId, currentToolCallArgsBuffer, currentToolCallDeferred,
 * toolCallIndex), so downstream chunk math (computeFinishReason, subsequent
 * incremental events in the same turn) stays consistent.
 */ function buildToolCallChunks(state, fcItem) {
    const chunks = [];
    const callId = fcItem.call_id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fallbackToolCallId"])(state.toolCallIndex);
    const toolName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeToolName"])(fcItem.name);
    const toolSchema = state.toolSchemas?.get(toolName);
    // Set state as output_item.added would
    state.currentToolCallId = callId;
    state.currentToolCallArgsBuffer = "";
    state.currentToolCallDeferred = false;
    // Emit the tool call header chunk (id, type, function.name)
    const currentIndex = state.toolCallIndex;
    chunks.push({
        ...baseChunk(state),
        choices: [
            {
                index: 0,
                delta: {
                    tool_calls: [
                        {
                            index: currentIndex,
                            id: callId,
                            type: "function",
                            function: {
                                name: toolName || "",
                                arguments: ""
                            }
                        }
                    ]
                },
                finish_reason: null
            }
        ]
    });
    const argsStr = resolveArgsStr(fcItem.arguments, toolName, toolSchema);
    if (argsStr) {
        state.currentToolCallArgsBuffer = argsStr;
        chunks.push({
            ...baseChunk(state),
            choices: [
                {
                    index: 0,
                    delta: {
                        tool_calls: [
                            {
                                index: currentIndex,
                                function: {
                                    arguments: argsStr
                                }
                            }
                        ]
                    },
                    finish_reason: null
                }
            ]
        });
    }
    // Advance state as output_item.done would
    state.toolCallIndex++;
    state.currentToolCallArgsBuffer = "";
    state.currentToolCallId = null;
    return chunks;
}
/** Build the terminal chunk (finish_reason + usage) once all tool calls are synthesized. */ function buildFinalChunk(state) {
    state.finishReasonSent = true;
    const reason = computeFinishReason(state);
    state.finishReason = reason;
    const finalChunk = {
        ...baseChunk(state),
        choices: [
            {
                index: 0,
                delta: {},
                finish_reason: reason
            }
        ]
    };
    if (state.usage && typeof state.usage === "object") {
        finalChunk.usage = state.usage;
    }
    return finalChunk;
}
function synthesizeCompletedToolCalls(state, output) {
    const outputItems = Array.isArray(output) ? output : [];
    const functionCallItems = outputItems.filter((item)=>item?.type === "function_call" && !state.toolCallIdsSeen?.has(item.call_id));
    if (functionCallItems.length === 0 || state.finishReasonSent) return null;
    const synthesizedChunks = [];
    for (const fcItem of functionCallItems){
        synthesizedChunks.push(...buildToolCallChunks(state, fcItem));
    }
    synthesizedChunks.push(buildFinalChunk(state));
    return synthesizedChunks;
}
}),
"[project]/open-sse/translator/response/openai-responses.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openaiResponsesToOpenAIResponse",
    ()=>openaiResponsesToOpenAIResponse,
    "openaiToOpenAIResponsesResponse",
    ()=>openaiToOpenAIResponsesResponse
]);
/**
 * Translator: OpenAI Chat Completions → OpenAI Responses API (response)
 * Converts streaming chunks from Chat Completions to Responses API events
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolCallArguments$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/toolCallArguments.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer/reasoning.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/pureHelpers.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$eventEmitter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/eventEmitter.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$responsesToolItem$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/responsesToolItem.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$requestToolIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/requestToolIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$synthesizeCompletedToolCalls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses/synthesizeCompletedToolCalls.ts [instrumentation] (ecmascript)");
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
 * Escape control characters (newlines, tabs, carriage returns) that appear
 * inside JSON string values, ensuring the resulting string is valid JSON.
 * This handles upstream providers (e.g. Gemini/Gemma) that emit literal
 * newlines (0x0A) instead of \n escapes inside tool call argument JSON.
 * Only escapes characters inside string contexts to avoid double-escaping
 * already-proper JSON or corrupting structural newlines.
 */ function escapeJsonStringValues(json) {
    let result = "";
    let inString = false;
    for(let i = 0; i < json.length; i++){
        const ch = json[i];
        // Inside a string, skip over escape sequences
        if (inString && ch === "\\") {
            result += ch + (json[i + 1] ?? "");
            i++;
            continue;
        }
        // Toggle string state on unescaped double quotes
        if (ch === '"') {
            result += ch;
            inString = !inString;
            continue;
        }
        // Escape control characters only inside string values
        if (inString && (ch === "\n" || ch === "\r" || ch === "\t")) {
            result += ch === "\n" ? "\\n" : ch === "\r" ? "\\r" : "\\t";
            continue;
        }
        result += ch;
    }
    return result;
}
function openaiToOpenAIResponsesResponse(chunk, state) {
    if (!chunk) {
        return flushEvents(state);
    }
    // Normalize usage from any chunk so response.completed has Responses token fields.
    if (chunk.usage) {
        const u = chunk.usage;
        const input_tokens = u.input_tokens ?? u.prompt_tokens ?? 0;
        const output_tokens = u.output_tokens ?? u.completion_tokens ?? 0;
        state.usage = {
            input_tokens,
            output_tokens,
            total_tokens: u.total_tokens ?? input_tokens + output_tokens
        };
        const cachedTokens = u.input_tokens_details?.cached_tokens ?? u.prompt_tokens_details?.cached_tokens;
        if (cachedTokens) {
            state.usage.input_tokens_details = {
                cached_tokens: cachedTokens
            };
        }
        const reasoningTokens = u.output_tokens_details?.reasoning_tokens ?? u.completion_tokens_details?.reasoning_tokens;
        if (reasoningTokens) {
            state.usage.output_tokens_details = {
                reasoning_tokens: reasoningTokens
            };
        }
    }
    if (!chunk.choices?.length) {
        // Mid-stream aggregator error: OpenRouter (and similar OpenAI-compatible
        // aggregators) can send an HTTP 200 SSE stream whose body carries a chunk with
        // empty `choices` and a top-level `error` object instead of any delta — e.g. the
        // underlying provider hitting its own capacity limit mid-request. Without this
        // branch the chunk has no choices, so it falls into the awaitingTrailingUsage/
        // no-op path below and the stream silently ends with a false "completed, empty
        // output" response, masking the failure and skipping combo fallback. Surface it
        // as state.upstreamError so stream.ts errors the stream out (mirrors the
        // Gemini-to-OpenAI translator's #4177 fix).
        if (chunk.error && typeof chunk.error === "object") {
            const rawCode = chunk.error.code;
            const status = typeof rawCode === "number" && rawCode >= 400 && rawCode <= 599 ? rawCode : 502;
            state.upstreamError = {
                status,
                type: status === 429 ? "rate_limit_error" : "server_error",
                code: typeof chunk.error.metadata?.error_type === "string" ? chunk.error.metadata.error_type : status === 429 ? "rate_limit_exceeded" : "bad_gateway",
                message: typeof chunk.error.message === "string" ? chunk.error.message : "Upstream failure"
            };
            return [];
        }
        // #6906: a deferred finish_reason (awaitingTrailingUsage, see below) completes here —
        // the trailing usage-only chunk (choices: [], usage: {...}) is what real
        // stream_options.include_usage=true upstreams send after finish_reason (see the
        // "READ THIS" block in stream.ts); state.usage was already captured above.
        if (state.awaitingTrailingUsage && !state.completedSent) {
            const { events, emit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$eventEmitter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createEventEmitter"])(state);
            sendCompleted(state, emit);
            return events;
        }
        return [];
    }
    const { events, emit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$eventEmitter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createEventEmitter"])(state);
    const choice = chunk.choices[0];
    const idx = choice.index || 0;
    const delta = choice.delta || {};
    if (state.parseTextualReasoningTags !== true && typeof chunk.model === "string") {
        state.parseTextualReasoningTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldParseTextualReasoningTags"])(undefined, chunk.model);
    }
    const parseTextualReasoningTags = state.parseTextualReasoningTags === true;
    // #3697: remember the upstream-resolved model so response.created/in_progress/completed
    // can carry a `model` field (the Responses API spec has one; this translator previously
    // omitted it). Codex CLI compatibility shim (chatCore's echoModel pipeline) rewrites this
    // field to the client-requested effort-suffixed id for codex-originated requests.
    if (!state.model && typeof chunk.model === "string" && chunk.model.trim()) {
        state.model = chunk.model.trim();
    }
    // Emit initial events
    if (!state.started) {
        state.started = true;
        state.responseId = chunk.id ? `resp_${chunk.id}` : state.responseId;
        const createdResponse = {
            id: state.responseId,
            object: "response",
            created_at: state.created,
            status: "in_progress",
            background: false,
            error: null,
            output: []
        };
        if (state.model) createdResponse.model = state.model;
        emit("response.created", {
            type: "response.created",
            response: createdResponse
        });
        const inProgressResponse = {
            id: state.responseId,
            object: "response",
            created_at: state.created,
            status: "in_progress"
        };
        if (state.model) inProgressResponse.model = state.model;
        emit("response.in_progress", {
            type: "response.in_progress",
            response: inProgressResponse
        });
    }
    const reasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReadableReasoningValue"])(delta);
    if (reasoning && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isInternalReasoningPlaceholder"])(reasoning)) {
        startReasoning(state, emit, idx);
        emitReasoningDelta(state, emit, reasoning);
    }
    // Strip the internal reasoning placeholder if the model echoed it
    // through ordinary content (#8081). Only the text-content emission is
    // skipped when nothing meaningful remains; tool_calls / finish_reason
    // handling below must still run for this same chunk.
    if (delta.content) {
        const strippedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(delta.content);
        if (strippedContent) {
            if (state.reasoningId && !state.reasoningDone && (!parseTextualReasoningTags || !state.inThinking)) {
                closeReasoning(state, emit);
            }
            let content = strippedContent;
            if (parseTextualReasoningTags) {
                if (content.includes("<think>")) {
                    state.inThinking = true;
                    content = content.replaceAll("<think>", "");
                    startReasoning(state, emit, idx);
                }
                if (content.includes("</think>")) {
                    const parts = content.split("</think>");
                    const thinkPart = parts[0];
                    const textPart = parts.slice(1).join("</think>");
                    if (thinkPart) emitReasoningDelta(state, emit, thinkPart);
                    closeReasoning(state, emit);
                    state.inThinking = false;
                    content = textPart;
                }
                if (state.inThinking && content) {
                    emitReasoningDelta(state, emit, content);
                    // Pre-existing behaviour (unrelated to #8081): a still-open
                    // textual <think> block ends this chunk's handling early.
                    return events;
                }
            }
            if (content) {
                const msgIdx = state.reasoningId ? state.reasoningIndex + 1 : idx;
                emitTextContent(state, emit, msgIdx, content);
            }
        }
    }
    // Handle tool_calls
    if (delta.tool_calls) {
        // Close reasoning first so tool calls do not collide with an open
        // reasoning item, then close the message at its real index.
        if (state.reasoningId && !state.reasoningDone) {
            closeReasoning(state, emit);
        }
        const msgIdx = state.reasoningId ? state.reasoningIndex + 1 : idx;
        closeMessage(state, emit, msgIdx);
        for (const tc of delta.tool_calls){
            emitToolCall(state, emit, tc);
        }
    }
    // Handle finish_reason
    if (choice.finish_reason) {
        for(const i in state.msgItemAdded)closeMessage(state, emit, i);
        closeReasoning(state, emit);
        for(const i in state.funcCallIds)closeToolCall(state, emit, i);
        // #6906: usage already captured (same chunk or earlier) completes now; otherwise
        // defer for a trailing usage-only chunk, handled above and in flushEvents().
        if (state.usage) {
            sendCompleted(state, emit);
        } else {
            state.awaitingTrailingUsage = true;
        }
    }
    return events;
}
// Normalize output_index to a non-negative integer (replaces fragile parseInt calls)
// Record a finalized item keyed by output_index so buildDenseOutput can sort later
function recordCompletedItem(state, outputIndex, item) {
    if (!Array.isArray(state.completedOutputItems)) {
        state.completedOutputItems = [];
    }
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(outputIndex);
    state.completedOutputItems.push({
        output_index: normalized,
        item,
        seq: state.seq
    });
    return normalized;
}
// Build a dense, deterministic output array sorted by output_index then by seq
function buildDenseOutput(state) {
    const items = Array.isArray(state.completedOutputItems) ? state.completedOutputItems : [];
    return items.slice().sort((left, right)=>{
        if (left.output_index !== right.output_index) {
            return left.output_index - right.output_index;
        }
        return left.seq - right.seq;
    }).map(({ item })=>item);
}
// Helper functions
function startReasoning(state, emit, idx) {
    if (!state.reasoningId) {
        state.reasoningId = `rs_${state.responseId}_${idx}`;
        state.reasoningIndex = idx;
        emit("response.output_item.added", {
            type: "response.output_item.added",
            output_index: idx,
            item: {
                id: state.reasoningId,
                type: "reasoning",
                summary: []
            }
        });
        emit("response.reasoning_summary_part.added", {
            type: "response.reasoning_summary_part.added",
            item_id: state.reasoningId,
            output_index: idx,
            summary_index: 0,
            part: {
                type: "summary_text",
                text: ""
            }
        });
        state.reasoningPartAdded = true;
    }
}
function emitReasoningDelta(state, emit, text) {
    if (!text) return;
    state.reasoningBuf += text;
    emit("response.reasoning_summary_text.delta", {
        type: "response.reasoning_summary_text.delta",
        item_id: state.reasoningId,
        output_index: state.reasoningIndex,
        summary_index: 0,
        delta: text
    });
}
function closeReasoning(state, emit) {
    if (state.reasoningId && !state.reasoningDone) {
        state.reasoningDone = true;
        emit("response.reasoning_summary_text.done", {
            type: "response.reasoning_summary_text.done",
            item_id: state.reasoningId,
            output_index: state.reasoningIndex,
            summary_index: 0,
            text: state.reasoningBuf
        });
        emit("response.reasoning_summary_part.done", {
            type: "response.reasoning_summary_part.done",
            item_id: state.reasoningId,
            output_index: state.reasoningIndex,
            summary_index: 0,
            part: {
                type: "summary_text",
                text: state.reasoningBuf
            }
        });
        const reasoningItem = {
            id: state.reasoningId,
            type: "reasoning",
            summary: [
                {
                    type: "summary_text",
                    text: state.reasoningBuf
                }
            ]
        };
        emit("response.output_item.done", {
            type: "response.output_item.done",
            output_index: state.reasoningIndex,
            item: reasoningItem
        });
        recordCompletedItem(state, state.reasoningIndex, reasoningItem);
    }
}
function emitTextContent(state, emit, idx, content) {
    if (!state.msgItemAdded[idx]) {
        state.msgItemAdded[idx] = true;
        const msgId = `msg_${state.responseId}_${idx}`;
        emit("response.output_item.added", {
            type: "response.output_item.added",
            output_index: idx,
            item: {
                id: msgId,
                type: "message",
                content: [],
                role: "assistant"
            }
        });
    }
    if (!state.msgContentAdded[idx]) {
        state.msgContentAdded[idx] = true;
        emit("response.content_part.added", {
            type: "response.content_part.added",
            item_id: `msg_${state.responseId}_${idx}`,
            output_index: idx,
            content_index: 0,
            part: {
                type: "output_text",
                annotations: [],
                logprobs: [],
                text: ""
            }
        });
    }
    emit("response.output_text.delta", {
        type: "response.output_text.delta",
        item_id: `msg_${state.responseId}_${idx}`,
        output_index: idx,
        content_index: 0,
        delta: content,
        logprobs: []
    });
    if (!state.msgTextBuf[idx]) state.msgTextBuf[idx] = "";
    state.msgTextBuf[idx] += content;
}
function closeMessage(state, emit, idx) {
    if (state.msgItemAdded[idx] && !state.msgItemDone[idx]) {
        state.msgItemDone[idx] = true;
        const fullText = state.msgTextBuf[idx] || "";
        const normalizedIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(idx);
        const msgId = `msg_${state.responseId}_${normalizedIndex}`;
        emit("response.output_text.done", {
            type: "response.output_text.done",
            item_id: msgId,
            output_index: normalizedIndex,
            content_index: 0,
            text: fullText,
            logprobs: []
        });
        emit("response.content_part.done", {
            type: "response.content_part.done",
            item_id: msgId,
            output_index: normalizedIndex,
            content_index: 0,
            part: {
                type: "output_text",
                annotations: [],
                logprobs: [],
                text: fullText
            }
        });
        const msgItem = {
            id: msgId,
            type: "message",
            content: [
                {
                    type: "output_text",
                    annotations: [],
                    logprobs: [],
                    text: fullText
                }
            ],
            role: "assistant"
        };
        emit("response.output_item.done", {
            type: "response.output_item.done",
            output_index: normalizedIndex,
            item: msgItem
        });
        recordCompletedItem(state, normalizedIndex, msgItem);
    }
}
function emitToolCall(state, emit, tc) {
    const tcIdx = tc.index ?? 0;
    const outputIndex = state.reasoningId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(state.reasoningIndex) + 1 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(tcIdx) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(tcIdx);
    const newCallId = tc.id;
    const funcName = tc.function?.name;
    // T37: If we already have a tool call at this index but the ID changed,
    // we must close the current one and start a new one to prevent merging.
    if (state.funcCallIds[tcIdx] && newCallId && state.funcCallIds[tcIdx] !== newCallId) {
        // Superseded call: close and emit output_item.done but do NOT record as final output
        // since this call was replaced by a new one at the same index.
        closeToolCall(state, emit, tcIdx, false);
        delete state.funcCallIds[tcIdx];
        delete state.funcNames[tcIdx];
        delete state.funcArgsBuf[tcIdx];
        delete state.funcArgsDone[tcIdx];
        delete state.funcItemAdded[tcIdx];
        delete state.funcItemDone[tcIdx];
    }
    if (funcName) state.funcNames[tcIdx] = funcName;
    // Custom tools are surfaced as custom_tool_call items and stream raw input instead of the
    // function_call_arguments.* events used for regular function tools. (#1007)
    const toolName = state.funcNames[tcIdx] || funcName || "";
    const isCustomTool = toolName === "apply_patch" || state.customToolNames?.has?.(toolName) === true;
    if (!state.funcCallIds[tcIdx] && newCallId) state.funcCallIds[tcIdx] = newCallId;
    const callId = state.funcCallIds[tcIdx];
    if (callId && toolName && !state.funcItemAdded[tcIdx]) {
        // #7936 — restore the codex-side `{namespace, name}` pair when the bare
        // leaf on the Chat wire was flattened from a Responses namespace sub-tool.
        // Codex dispatches from `namespace` independently of `name` (no `__` split).
        const identity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$requestToolIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestToolIdentity"])(state.requestToolIdentityMap, toolName);
        emit("response.output_item.added", {
            type: "response.output_item.added",
            output_index: outputIndex,
            item: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$responsesToolItem$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildResponsesToolCallItem"])({
                callId,
                toolName: identity ? identity.name : toolName,
                custom: isCustomTool,
                namespace: identity ? identity.namespace : null
            })
        });
        state.funcItemAdded[tcIdx] = true;
        const bufferedArgs = state.funcArgsBuf[tcIdx] || "";
        if (bufferedArgs && !isCustomTool) {
            emit("response.function_call_arguments.delta", {
                type: "response.function_call_arguments.delta",
                item_id: `fc_${callId}`,
                output_index: outputIndex,
                delta: bufferedArgs
            });
        }
    }
    if (!state.funcArgsBuf[tcIdx]) state.funcArgsBuf[tcIdx] = "";
    if (tc.function?.arguments) {
        const refCallId = state.funcCallIds[tcIdx] || newCallId;
        const existingArgs = state.funcArgsBuf[tcIdx] || "";
        const sanitized = escapeJsonStringValues(tc.function.arguments);
        const nextArgs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$toolCallArguments$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["appendToolCallArgumentDelta"])(existingArgs, sanitized);
        const emittedDelta = nextArgs.slice(existingArgs.length);
        state.funcArgsBuf[tcIdx] = nextArgs;
        if (refCallId && emittedDelta && !isCustomTool && state.funcItemAdded[tcIdx]) {
            emit("response.function_call_arguments.delta", {
                type: "response.function_call_arguments.delta",
                item_id: `fc_${refCallId}`,
                output_index: outputIndex,
                delta: emittedDelta
            });
        }
    }
}
function closeToolCall(state, emit, idx, recordAsCompleted = true) {
    const callId = state.funcCallIds[idx];
    if (callId && !state.funcItemDone[idx]) {
        const normalizedIndex = state.reasoningId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(state.reasoningIndex) + 1 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(idx) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOutputIndex"])(idx);
        const args = state.funcArgsBuf[idx] || "{}";
        const toolName = state.funcNames[idx] || "";
        const isCustomTool = toolName === "apply_patch" || state.customToolNames?.has?.(toolName) === true;
        let funcItem;
        if (isCustomTool) {
            // The model produced JSON {"input":"..."} against the normalized custom-tool schema.
            // Unwrap it back to the raw patch string the Codex runtime expects. (#1007)
            let rawInput = args;
            try {
                const parsed = JSON.parse(args);
                if (parsed && typeof parsed.input === "string") rawInput = parsed.input;
            } catch  {
            // Not JSON — fall back to the raw buffered arguments.
            }
            emit("response.custom_tool_call_input.delta", {
                type: "response.custom_tool_call_input.delta",
                item_id: `fc_${callId}`,
                output_index: normalizedIndex,
                delta: rawInput
            });
            emit("response.custom_tool_call_input.done", {
                type: "response.custom_tool_call_input.done",
                item_id: `fc_${callId}`,
                output_index: normalizedIndex,
                input: rawInput
            });
            funcItem = {
                id: `fc_${callId}`,
                type: "custom_tool_call",
                input: rawInput,
                call_id: callId,
                name: state.funcNames[idx] || "",
                status: "completed"
            };
            // #7936 identity closure for custom_tool_call items (apply_patch stays
            // bare; namespace sub-tools get back their `namespace` + `name`).
            const customIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$requestToolIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestToolIdentity"])(state.requestToolIdentityMap, state.funcNames[idx] || "");
            if (customIdentity) {
                funcItem.namespace = customIdentity.namespace;
                funcItem.name = customIdentity.name;
            }
            emit("response.output_item.done", {
                type: "response.output_item.done",
                output_index: normalizedIndex,
                item: funcItem
            });
        } else {
            emit("response.function_call_arguments.done", {
                type: "response.function_call_arguments.done",
                item_id: `fc_${callId}`,
                output_index: normalizedIndex,
                arguments: args
            });
            funcItem = {
                id: `fc_${callId}`,
                type: "function_call",
                arguments: args,
                call_id: callId,
                name: state.funcNames[idx] || "",
                status: "completed"
            };
            // #7936 identity closure: rewrite the function_call item's `name` back to
            // its bare leaf and stamp the original `namespace` alongside it, matching
            // the codex ResponseItem::FunctionCall schema (independent `namespace`
            // field, NOT a `__` split on `name`).
            const fnIdentity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$requestToolIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestToolIdentity"])(state.requestToolIdentityMap, state.funcNames[idx] || "");
            if (fnIdentity) {
                funcItem.namespace = fnIdentity.namespace;
                funcItem.name = fnIdentity.name;
            }
            emit("response.output_item.done", {
                type: "response.output_item.done",
                output_index: normalizedIndex,
                item: funcItem
            });
        }
        // Only record as a completed output item when this is a final close (not a
        // superseded-call eviction where a new call replaced this one at the same index).
        if (recordAsCompleted) {
            recordCompletedItem(state, normalizedIndex, funcItem);
            // Mirror into the shared state.toolCalls map (populated by the other response
            // translators) so stream.ts's completion-log summary reports finish_reason
            // "tool_calls" and message.tool_calls instead of "stop" with no tool calls.
            if (state.toolCalls instanceof Map) {
                state.toolCalls.set(idx, {
                    id: callId,
                    index: normalizedIndex,
                    type: isCustomTool ? "custom_tool_call" : "function",
                    function: {
                        name: funcItem.name,
                        arguments: args
                    }
                });
            }
        }
        state.funcItemDone[idx] = true;
        state.funcArgsDone[idx] = true;
    }
}
function sendCompleted(state, emit) {
    if (!state.completedSent) {
        state.completedSent = true;
        // Build a dense, deterministic output array from items recorded as they were emitted
        // (each close*() call records its item via recordCompletedItem — including the
        // #1007 custom_tool_call shape for apply_patch). Sorted by output_index then by
        // emission sequence for stable ordering.
        const output = buildDenseOutput(state);
        // Surface upstream mid-stream errors (e.g. Gemini 503) in the
        // Responses-API `response.completed` event instead of silently emitting
        // `status: "completed"`. The error is set by the Gemini-to-OpenAI
        // translator or the OpenAI-Responses translator itself when the upstream
        // SSE stream emits a JSON error object after partial content.
        const upstreamErr = state.upstreamError;
        const response = {
            id: state.responseId,
            object: "response",
            created_at: state.created,
            status: upstreamErr ? "failed" : "completed",
            background: false,
            error: upstreamErr ? {
                code: String(upstreamErr.status ?? ""),
                message: upstreamErr.message ?? ""
            } : null,
            output
        };
        // #3697: same model echo as response.created/in_progress above.
        if (state.model) {
            response.model = state.model;
        }
        if (state.usage) {
            response.usage = state.usage;
        }
        emit("response.completed", {
            type: "response.completed",
            response
        });
    }
}
function flushEvents(state) {
    if (state.completedSent) return [];
    const { events, emit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$eventEmitter$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["createEventEmitter"])(state);
    for(const i in state.msgItemAdded)closeMessage(state, emit, i);
    closeReasoning(state, emit);
    for(const i in state.funcCallIds)closeToolCall(state, emit, i);
    sendCompleted(state, emit);
    return events;
}
// #5786 — remember that a reasoning delta was streamed for a given reasoning item, so
// the terminal `response.output_item.done` snapshot for that item is NOT re-emitted
// (which would duplicate the reasoning channel). Keyed by item_id when present, with a
// global fallback for streams whose deltas carry no item_id.
function markResponsesReasoningDeltaEmitted(state, itemId) {
    state.reasoningDeltaEmitted = true;
    const id = itemId != null ? String(itemId) : "";
    if (!id) return;
    if (!(state.reasoningItemsWithDelta instanceof Set)) {
        state.reasoningItemsWithDelta = new Set();
    }
    state.reasoningItemsWithDelta.add(id);
}
// #9500 — streaming separator helper. When summary_index increments mid-stream
// for a given item_id, a new reasoning segment begins; prefix "\n\n" so segments
// don't arrive back-to-back. Only prefixes when a delta was already emitted for
// the item AND the index advanced — never on the first segment. Lives here (not
// in pureHelpers.ts) because it reads and mutates stream state, which the pure
// leaf must not hold.
function buildResponsesReasoningSummaryDelta(state, data, reasoningDelta) {
    const itemId = data.item_id != null ? String(data.item_id) : "";
    const summaryIndex = typeof data.summary_index === "number" ? data.summary_index : null;
    if (!(state.reasoningSummaryIndex instanceof Map)) {
        state.reasoningSummaryIndex = new Map();
    }
    const lastIndex = itemId ? state.reasoningSummaryIndex.get(itemId) : undefined;
    const alreadyEmittedForItem = itemId ? state.reasoningItemsWithDelta instanceof Set && state.reasoningItemsWithDelta.has(itemId) : Boolean(state.reasoningDeltaEmitted);
    let deltaText = reasoningDelta;
    if (summaryIndex !== null && lastIndex !== undefined && summaryIndex > lastIndex && alreadyEmittedForItem) {
        deltaText = `\n\n${reasoningDelta}`;
    }
    if (itemId && (lastIndex === undefined || summaryIndex > lastIndex)) {
        state.reasoningSummaryIndex.set(itemId, summaryIndex);
    }
    return deltaText;
}
// #5786 — build a Chat-format reasoning delta chunk in the shape the client renders in
// its thinking panel (`reasoning_content`, or `reasoning_text` for Copilot-compatible
// clients). Mirrors the `response.reasoning_summary_text.delta` branch.
function buildResponsesReasoningDeltaChunk(state, text) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isInternalReasoningPlaceholder"])(text)) return null;
    const delta = state.copilotCompatibleReasoning ? {
        reasoning_text: text
    } : {
        reasoning_content: text
    };
    return {
        id: state.chatId,
        object: "chat.completion.chunk",
        created: state.created,
        model: state.model || "gpt-4",
        choices: [
            {
                index: 0,
                delta,
                finish_reason: null
            }
        ]
    };
}
function openaiResponsesToOpenAIResponse(chunk, state) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$synthesizeCompletedToolCalls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["withAssistantRoleOnFirstDelta"])(state, openaiResponsesToOpenAIResponseStream(chunk, state));
}
function openaiResponsesToOpenAIResponseStream(chunk, state) {
    if (!chunk) {
        // Flush: send final chunk with finish_reason
        if (!state.finishReasonSent && state.started) {
            state.finishReasonSent = true;
            const finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$synthesizeCompletedToolCalls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["computeFinishReason"])(state);
            return {
                id: state.chatId || `chatcmpl-${Date.now()}`,
                object: "chat.completion.chunk",
                created: state.created || Math.floor(Date.now() / 1000),
                model: state.model || "gpt-4",
                choices: [
                    {
                        index: 0,
                        delta: {},
                        finish_reason: finishReason
                    }
                ]
            };
        }
        return null;
    }
    // Handle different event types from Responses API
    const eventType = chunk.type || chunk.event;
    const data = chunk.data || chunk;
    if (!state.model) {
        const upstreamModel = data?.response && typeof data.response === "object" && data.response.model || data?.model || data?.modelVersion || data?.model_version || null;
        if (typeof upstreamModel === "string" && upstreamModel.trim().length > 0) {
            state.model = upstreamModel.trim();
        }
    }
    // Initialize state
    if (!state.started) {
        state.started = true;
        state.chatId = `chatcmpl-${Date.now()}`;
        state.created = Math.floor(Date.now() / 1000);
        state.toolCallIndex = 0;
        state.currentToolCallId = null;
    }
    // Text content delta
    if (eventType === "response.output_text.delta") {
        const delta = data.delta || "";
        if (!delta) return null;
        return {
            id: state.chatId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "gpt-4",
            choices: [
                {
                    index: 0,
                    delta: {
                        content: delta
                    },
                    finish_reason: null
                }
            ]
        };
    }
    // Text content done (ignore, we handle via delta)
    if (eventType === "response.output_text.done") {
        return null;
    }
    // Function call started
    if (eventType === "response.output_item.added" && data.item?.type === "function_call") {
        const item = data.item;
        state.currentToolCallId = item.call_id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fallbackToolCallId"])();
        state.currentToolCallArgsBuffer = ""; // reset per-call arg buffer
        state.currentToolCallDeferred = false;
        // Track this call_id so response.completed doesn't synthesize a duplicate
        if (!state.toolCallIdsSeen) state.toolCallIdsSeen = new Set();
        if (state.currentToolCallId) state.toolCallIdsSeen.add(state.currentToolCallId);
        const toolName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeToolName"])(item.name);
        if (!toolName) {
            // Some Responses providers briefly emit placeholder/empty tool names.
            // Defer emission until output_item.done in case the final name is populated there.
            state.currentToolCallDeferred = true;
            return null;
        }
        return {
            id: state.chatId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "gpt-4",
            choices: [
                {
                    index: 0,
                    delta: {
                        tool_calls: [
                            {
                                index: state.toolCallIndex,
                                id: state.currentToolCallId,
                                type: "function",
                                function: {
                                    name: toolName,
                                    arguments: ""
                                }
                            }
                        ]
                    },
                    finish_reason: null
                }
            ]
        };
    }
    // Function call arguments delta
    // NOTE: Do NOT include `id` or `type` here - only first chunk (response.output_item.added)
    // should have them. Including `id` on every chunk causes openai-to-claude.ts to emit
    // a new content_block_start for each delta, breaking Claude Code ACP sessions.
    if (eventType === "response.function_call_arguments.delta") {
        const argsDelta = data.delta || "";
        if (!argsDelta) return null;
        state.currentToolCallArgsBuffer = (state.currentToolCallArgsBuffer || "") + argsDelta;
        if (state.currentToolCallDeferred) return null;
        return {
            id: state.chatId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "gpt-4",
            choices: [
                {
                    index: 0,
                    delta: {
                        tool_calls: [
                            {
                                index: state.toolCallIndex,
                                function: {
                                    arguments: argsDelta
                                }
                            }
                        ]
                    },
                    finish_reason: null
                }
            ]
        };
    }
    // Function call done — emit args chunk from item.arguments when no deltas were received,
    // then advance the tool-call index. This handles Codex Responses API payloads that
    // carry the complete arguments only in output_item.done (no preceding delta events).
    if (eventType === "response.output_item.done" && data.item?.type === "function_call") {
        const item = data.item;
        const buffered = state.currentToolCallArgsBuffer || "";
        const currentIndex = state.toolCallIndex; // capture before increment
        const callId = item.call_id || state.currentToolCallId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fallbackToolCallId"])();
        const toolName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeToolName"])(item.name);
        const toolSchema = state.toolSchemas?.get(toolName);
        // Track this call_id so response.completed doesn't synthesize a duplicate
        if (!state.toolCallIdsSeen) state.toolCallIdsSeen = new Set();
        if (callId) state.toolCallIdsSeen.add(callId);
        if (state.currentToolCallDeferred) {
            state.currentToolCallDeferred = false;
            state.currentToolCallArgsBuffer = "";
            state.currentToolCallId = null;
            if (!toolName) {
                return null;
            }
            state.toolCallIndex++;
            const argsToEmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripEmptyOptionalToolArgs"])(item.arguments, toolName, toolSchema);
            const argsStr = argsToEmit != null ? typeof argsToEmit === "string" ? argsToEmit : JSON.stringify(argsToEmit) : buffered;
            return {
                id: state.chatId,
                object: "chat.completion.chunk",
                created: state.created,
                model: state.model || "gpt-4",
                choices: [
                    {
                        index: 0,
                        delta: {
                            tool_calls: [
                                {
                                    index: currentIndex,
                                    id: callId,
                                    type: "function",
                                    function: {
                                        name: toolName,
                                        arguments: argsStr || ""
                                    }
                                }
                            ]
                        },
                        finish_reason: null
                    }
                ]
            };
        }
        state.toolCallIndex++;
        state.currentToolCallArgsBuffer = ""; // reset for next tool call
        state.currentToolCallId = null;
        // Only emit if arguments exist in the done event AND they weren't already streamed via deltas
        if (item.arguments != null && !buffered) {
            const argsToEmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripEmptyOptionalToolArgs"])(item.arguments, toolName, toolSchema);
            const argsStr = typeof argsToEmit === "string" ? argsToEmit : JSON.stringify(argsToEmit);
            if (argsStr) {
                return {
                    id: state.chatId,
                    object: "chat.completion.chunk",
                    created: state.created,
                    model: state.model || "gpt-4",
                    choices: [
                        {
                            index: 0,
                            delta: {
                                tool_calls: [
                                    {
                                        index: currentIndex,
                                        function: {
                                            arguments: argsStr
                                        }
                                    }
                                ]
                            },
                            finish_reason: null
                        }
                    ]
                };
            }
        }
        return null;
    }
    // Response completed
    if (eventType === "response.completed") {
        // Extract usage from response.completed event
        const responseUsage = data.response?.usage;
        if (responseUsage && typeof responseUsage === "object") {
            const inputTokens = responseUsage.input_tokens || responseUsage.prompt_tokens || 0;
            const outputTokens = responseUsage.output_tokens || responseUsage.completion_tokens || 0;
            const cacheReadTokens = responseUsage.cache_read_input_tokens || responseUsage.input_tokens_details?.cached_tokens || responseUsage.prompt_tokens_details?.cached_tokens || 0;
            const cacheCreationTokens = responseUsage.cache_creation_input_tokens || 0;
            const reasoningTokens = responseUsage.output_tokens_details?.reasoning_tokens || responseUsage.completion_tokens_details?.reasoning_tokens || responseUsage.reasoning_tokens || 0;
            // prompt_tokens = input_tokens + cache_read + cache_creation (all prompt-side tokens)
            const promptTokens = inputTokens + cacheReadTokens + cacheCreationTokens;
            state.usage = {
                prompt_tokens: promptTokens,
                completion_tokens: outputTokens,
                total_tokens: promptTokens + outputTokens
            };
            // Add prompt_tokens_details if cache tokens exist
            if (cacheReadTokens > 0 || cacheCreationTokens > 0) {
                state.usage.prompt_tokens_details = {};
                if (cacheReadTokens > 0) {
                    state.usage.prompt_tokens_details.cached_tokens = cacheReadTokens;
                }
                if (cacheCreationTokens > 0) {
                    state.usage.prompt_tokens_details.cache_creation_tokens = cacheCreationTokens;
                }
            }
            // Add completion_tokens_details if reasoning tokens exist
            if (reasoningTokens > 0) {
                state.usage.completion_tokens_details = {
                    reasoning_tokens: reasoningTokens
                };
            }
        }
        // #fix: synthesize tool call chunks from response.completed output[] for
        // providers that batch everything into response.completed without prior
        // incremental output_item.* events — including the dedup guard against
        // providers that DO stream incrementally and also echo the same
        // function_call items here. See synthesizeCompletedToolCalls's own
        // doc-comment for the full rationale.
        const synthesized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$synthesizeCompletedToolCalls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["synthesizeCompletedToolCalls"])(state, data.response?.output);
        if (synthesized) return synthesized;
        if (!state.finishReasonSent) {
            state.finishReasonSent = true;
            const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$synthesizeCompletedToolCalls$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["computeFinishReason"])(state);
            state.finishReason = reason; // Mark for usage injection in stream.js
            const finalChunk = {
                id: state.chatId,
                object: "chat.completion.chunk",
                created: state.created,
                model: state.model || "gpt-4",
                choices: [
                    {
                        index: 0,
                        delta: {},
                        finish_reason: reason
                    }
                ]
            };
            // Include usage in final chunk if available
            if (state.usage && typeof state.usage === "object") {
                finalChunk.usage = state.usage;
            }
            return finalChunk;
        }
        return null;
    }
    if (eventType === "response.failed" || eventType === "error") {
        state.upstreamError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeUpstreamFailure"])(data);
        state.finishReasonSent = true;
        return null;
    }
    // Reasoning events — emit as reasoning_content in Chat format
    if (eventType === "response.reasoning_content_text.delta" || eventType === "response.reasoning_text.delta") {
        const reasoningDelta = data.delta || "";
        if (!reasoningDelta) return null;
        markResponsesReasoningDeltaEmitted(state, data.item_id);
        return {
            id: state.chatId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "gpt-4",
            choices: [
                {
                    index: 0,
                    delta: {
                        reasoning_content: reasoningDelta
                    },
                    finish_reason: null
                }
            ]
        };
    }
    // Handle true reasoning summary ("Thought for 15s"). Emit as `delta.reasoning_content`
    // — matches the `reasoning_content_text.delta` branch above and is what Chat clients
    // (OpenCode, Claude Code, Cursor, etc.) render in their thinking panel. A nested
    // `delta.reasoning.summary` object is swallowed by most stream mergers.
    if (eventType === "response.reasoning_summary_text.delta") {
        const reasoningDelta = data.delta || "";
        if (!reasoningDelta) return null;
        markResponsesReasoningDeltaEmitted(state, data.item_id);
        const deltaText = buildResponsesReasoningSummaryDelta(state, data, reasoningDelta);
        return buildResponsesReasoningDeltaChunk(state, deltaText);
    }
    // #5786 — reasoning summary exposed ONLY as a terminal snapshot on
    // `response.output_item.done` (no preceding reasoning_summary_text.delta events — e.g.
    // Codex reasoning models that surface the summary once at item close). Without this the
    // reasoning channel is silently dropped and never reaches the client's thinking panel.
    // Only synthesize when NO reasoning delta was already streamed for this item, so normal
    // delta streams are never duplicated.
    if (eventType === "response.output_item.done" && data.item?.type === "reasoning") {
        const item = data.item;
        const itemId = item.id != null ? String(item.id) : "";
        const emittedForItem = state.reasoningItemsWithDelta instanceof Set && itemId && state.reasoningItemsWithDelta.has(itemId);
        // Deltas were streamed but carried no item_id: fall back to the global flag and
        // suppress synthesis to avoid duplicating that same reasoning text.
        const emittedWithoutItemId = state.reasoningDeltaEmitted && !(state.reasoningItemsWithDelta instanceof Set && state.reasoningItemsWithDelta.size > 0);
        if (emittedForItem || emittedWithoutItemId) return null;
        // #7176/#7243: only synthesize from real upstream plaintext — never mutate
        // `item` and never fabricate placeholder text for encrypted-only reasoning.
        const summaryText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2f$pureHelpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVisibleResponsesReasoningSummaryText"])(item);
        if (!summaryText) return null;
        return buildResponsesReasoningDeltaChunk(state, summaryText);
    }
    // Ignore other events
    return null;
}
// Register both directions
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES, null, openaiToOpenAIResponsesResponse);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, null, openaiResponsesToOpenAIResponse);
}),
"[project]/open-sse/translator/response/kiro-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertKiroToOpenAI",
    ()=>convertKiroToOpenAI
]);
/**
 * Kiro to OpenAI Response Translator
 * Converts Kiro/AWS CodeWhisperer streaming events to OpenAI SSE format
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
;
;
;
function convertKiroToOpenAI(chunk, state) {
    if (!chunk) return null;
    // If chunk is already in OpenAI format (from executor transform), return as-is
    if (chunk.object === "chat.completion.chunk" && chunk.choices) {
        return chunk;
    }
    // Handle string chunk (raw SSE data)
    let data = chunk;
    if (typeof chunk === "string") {
        // Parse SSE format: event:xxx\ndata:xxx
        const lines = chunk.split("\n");
        let eventType = "";
        let eventData = "";
        for (const line of lines){
            if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
            } else if (line.startsWith(":event-type:")) {
                eventType = line.slice(12).trim();
            } else if (line.startsWith("data:")) {
                eventData = line.slice(5).trim();
            } else if (line.startsWith(":content-type:")) {
            // Skip content-type header
            } else if (line.trim() && !line.startsWith(":")) {
                // Raw JSON data
                eventData = line.trim();
            }
        }
        if (!eventData) return null;
        try {
            data = JSON.parse(eventData);
            data._eventType = eventType;
        } catch  {
            // Not JSON, might be raw text
            data = {
                text: eventData,
                _eventType: eventType
            };
        }
    }
    // Initialize state if needed
    if (!state.responseId) {
        state.responseId = `chatcmpl-${Date.now()}`;
        state.created = Math.floor(Date.now() / 1000);
        state.chunkIndex = 0;
    }
    const eventType = data._eventType || data.event || "";
    // Handle different Kiro event types
    if (eventType === "assistantResponseEvent" || data.assistantResponseEvent) {
        const content = data.assistantResponseEvent?.content || data.content || "";
        if (!content) return null;
        const openaiChunk = {
            id: state.responseId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "kiro",
            choices: [
                {
                    index: 0,
                    delta: {
                        ...state.chunkIndex === 0 ? {
                            role: "assistant"
                        } : {},
                        content: content
                    },
                    finish_reason: null
                }
            ]
        };
        state.chunkIndex++;
        return openaiChunk;
    }
    // Handle reasoning/thinking events
    if (eventType === "reasoningContentEvent" || data.reasoningContentEvent) {
        const content = data.reasoningContentEvent?.content || data.content || "";
        if (!content) return null;
        const openaiChunk = {
            id: state.responseId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "kiro",
            choices: [
                {
                    index: 0,
                    delta: {
                        ...state.chunkIndex === 0 ? {
                            role: "assistant"
                        } : {},
                        reasoning_content: content
                    },
                    finish_reason: null
                }
            ]
        };
        state.chunkIndex++;
        return openaiChunk;
    }
    // Handle tool use events
    if (eventType === "toolUseEvent" || data.toolUseEvent) {
        const toolUse = data.toolUseEvent || data;
        const toolCallId = toolUse.toolUseId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fallbackToolCallId"])();
        // #1375: long tool names were hash-truncated for Kiro (sanitizeKiroTools).
        // Map the streamed name back to the original so the client sees the name
        // it sent. `state.toolNameMap` carries truncated → original entries.
        const rawName = toolUse.name || "";
        const toolName = state.toolNameMap instanceof Map ? state.toolNameMap.get(rawName) || rawName : rawName;
        const toolInput = toolUse.input || {};
        // #3980: record that this stream produced tool calls so the terminal
        // event reports finish_reason: "tool_calls" instead of "stop" — otherwise
        // agent clients (Hermes) treat the tool-call turn as finished and break.
        state.sawToolUse = true;
        const openaiChunk = {
            id: state.responseId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "kiro",
            choices: [
                {
                    index: 0,
                    delta: {
                        ...state.chunkIndex === 0 ? {
                            role: "assistant"
                        } : {},
                        tool_calls: [
                            {
                                index: 0,
                                id: toolCallId,
                                type: "function",
                                function: {
                                    name: toolName,
                                    arguments: JSON.stringify(toolInput)
                                }
                            }
                        ]
                    },
                    finish_reason: null
                }
            ]
        };
        state.chunkIndex++;
        return openaiChunk;
    }
    // Handle completion/done events
    if (eventType === "messageStopEvent" || eventType === "done" || data.messageStopEvent) {
        // #3980: if the stream produced tool calls, the terminal finish_reason must
        // be "tool_calls" (OpenAI semantics), not "stop".
        const finishReason = state.sawToolUse ? "tool_calls" : "stop";
        state.finishReason = finishReason; // Mark for usage injection in stream.js
        const openaiChunk = {
            id: state.responseId,
            object: "chat.completion.chunk",
            created: state.created,
            model: state.model || "kiro",
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: finishReason
                }
            ]
        };
        // Include usage in final chunk if available
        if (state.usage && typeof state.usage === "object") {
            openaiChunk.usage = state.usage;
        }
        return openaiChunk;
    }
    // Handle usage events
    if (eventType === "usageEvent" || data.usageEvent) {
        const usage = data.usageEvent || data;
        if (usage && typeof usage === "object") {
            state.usage = {
                prompt_tokens: usage.inputTokens || 0,
                completion_tokens: usage.outputTokens || 0,
                total_tokens: (usage.inputTokens || 0) + (usage.outputTokens || 0)
            };
        }
        return null;
    }
    // Unknown event type - skip
    return null;
}
// Register translator
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].KIRO, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, null, convertKiroToOpenAI);
}),
"[project]/open-sse/translator/response/cursor-to-openai.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertCursorToOpenAI",
    ()=>convertCursorToOpenAI
]);
/**
 * Cursor to OpenAI Response Translator
 * CursorExecutor already emits OpenAI format - this is a passthrough
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
;
;
function convertCursorToOpenAI(chunk, state) {
    if (!chunk) return null;
    // If chunk is already in OpenAI format (from executor transform), return as-is
    if (chunk.object === "chat.completion.chunk" && chunk.choices) {
        return chunk;
    }
    // If chunk is a completion object (non-streaming), return as-is
    if (chunk.object === "chat.completion" && chunk.choices) {
        return chunk;
    }
    // Fallback: return chunk as-is (should not reach here)
    return chunk;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["register"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CURSOR, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, null, convertCursorToOpenAI);
}),
"[project]/open-sse/translator/bootstrap.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "bootstrapTranslatorRegistry",
    ()=>bootstrapTranslatorRegistry
]);
/**
 * Explicit translator bootstrap module.
 * Importing this file initializes all translator adapters via side-effect registration.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$claude$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/claude-to-openai.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-claude.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$gemini$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/gemini-to-openai.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$gemini$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-gemini.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$antigravity$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/antigravity-to-openai.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$kiro$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-kiro.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$to$2d$cursor$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-to-cursor.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$claude$2d$to$2d$gemini$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/claude-to-gemini.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$claude$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/claude-to-openai.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-to-claude.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$gemini$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/gemini-to-openai.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$gemini$2d$to$2d$claude$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/gemini-to-claude.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$to$2d$antigravity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-to-antigravity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$to$2d$gemini$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-to-gemini.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$openai$2d$responses$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/response/openai-responses.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$kiro$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/kiro-to-openai.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$response$2f$cursor$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/response/cursor-to-openai.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$antigravity$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$antigravity$2d$to$2d$openai$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function bootstrapTranslatorRegistry() {
// no-op by design; importing this module triggers translator self-registration once
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/translator/helpers/strictSystemHoist.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hoistLeadingSystemMessage",
    ()=>hoistLeadingSystemMessage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/memory/injection.ts [instrumentation] (ecmascript)");
;
function toTextContent(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content.filter((part)=>{
            return Boolean(part) && typeof part === "object" && part.type === "text";
        }).map((part)=>String(part.text ?? "")).join("\n");
    }
    return "";
}
function hoistLeadingSystemMessage(messages, provider) {
    if (!Array.isArray(messages) || messages.length === 0) return messages;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$memory$2f$injection$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["systemMessageMustBeFirst"])(provider)) return messages;
    const offendingIndices = [];
    for(let i = 1; i < messages.length; i++){
        if (messages[i]?.role === "system") offendingIndices.push(i);
    }
    if (offendingIndices.length === 0) return messages;
    const offending = offendingIndices.map((i)=>messages[i]);
    const rest = messages.filter((_, i)=>!offendingIndices.includes(i));
    const mergedText = [
        rest[0]?.role === "system" ? toTextContent(rest[0].content) : null,
        ...offending.map((m)=>toTextContent(m.content))
    ].filter((text)=>Boolean(text)).join("\n");
    if (rest[0]?.role === "system") {
        const mergedFirst = {
            ...rest[0],
            content: mergedText
        };
        return [
            mergedFirst,
            ...rest.slice(1)
        ];
    }
    const leadingSystem = {
        role: "system",
        content: mergedText
    };
    return [
        leadingSystem,
        ...rest
    ];
}
}),
"[project]/open-sse/translator/index.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "initState",
    ()=>initState,
    "initTranslators",
    ()=>initTranslators,
    "needsTranslation",
    ()=>needsTranslation,
    "translateRequest",
    ()=>translateRequest,
    "translateResponse",
    ()=>translateResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/claudeHelper.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$openaiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/openaiHelper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cacheControlPolicy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningContentInjector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningContentInjector.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/registry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$bootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/bootstrap.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/thinkingBudget.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoningRouting/policy.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/modelCapabilities.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$roleNormalizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/roleNormalizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$strictSystemHoist$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/strictSystemHoist.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/reasoningCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/request/openai-responses/helpers.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$bootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$bootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$bootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bootstrapTranslatorRegistry"])();
;
function normalizeResponsesInputItem(item) {
    if (typeof item === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: item
                }
            ]
        };
    }
    if (!item || typeof item !== "object") return item;
    if (item.type || item.role) {
        return item.type ? item : {
            type: "message",
            ...item
        };
    }
    if (typeof item.text === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: item.text
                }
            ]
        };
    }
    return item;
}
// Promote a stray top-level Chat-Completions-shaped `reasoning_effort` into the
// Responses-shaped `reasoning:{effort}` object, in place, removing the top-level key.
// No-op when `reasoning` is already present (an explicit Responses-shaped value always
// wins) or when `reasoning_effort` is absent.
//
// This exists for the SAME-FORMAT lane (source === target === OPENAI_RESPONSES), where
// translateRequest's hub-and-spoke translation block is skipped entirely (#7631): a
// caller that lands a top-level `reasoning_effort` there — e.g. applyNoThinkingAlias
// on the OpenAI path, which runs upstream of model-format resolution and cannot know
// yet whether the target lane is Responses-native — would otherwise reach the upstream
// with BOTH an unrecognized top-level field AND no `reasoning.effort`, so suppression
// silently does not take effect. The cross-format path (openai -> openai-responses)
// already performs the equivalent promotion in toResponses.ts; this covers the lane
// that promotion never runs on.
function promoteStrayReasoningEffort(body) {
    if (!body || typeof body !== "object") return body;
    if (body.reasoning !== undefined) return body;
    if (body.reasoning_effort === undefined) return body;
    const effort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$request$2f$openai$2d$responses$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeResponsesReasoningEffort"])(body.reasoning_effort);
    if (effort) {
        body.reasoning = {
            effort
        };
    }
    delete body.reasoning_effort;
    return body;
}
function normalizeOpenAIResponsesRequest(body) {
    if (!body || typeof body !== "object") return body;
    const normalized = promoteStrayReasoningEffort({
        ...body
    });
    if (typeof normalized.input === "string") {
        normalized.input = [
            {
                type: "message",
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: normalized.input
                    }
                ]
            }
        ];
        return normalized;
    }
    if (Array.isArray(normalized.input)) {
        normalized.input = normalized.input.map(normalizeResponsesInputItem);
        return normalized;
    }
    if (normalized.input && typeof normalized.input === "object") {
        normalized.input = [
            normalizeResponsesInputItem(normalized.input)
        ];
        return normalized;
    }
    return normalized;
}
function getReasoningCacheRequestId(body) {
    if (!body || typeof body !== "object") return "";
    const requestId = body._reasoningCacheRequestId ?? body.reasoningCacheRequestId ?? body.request_id ?? body.requestId;
    return typeof requestId === "string" ? requestId.trim() : "";
}
function getAssistantMessageCacheKey(body, messageIndex) {
    const requestId = getReasoningCacheRequestId(body);
    return requestId ? `request:${requestId}:message:${messageIndex}` : "";
}
function hasNonEmptyReasoningContent(message) {
    return typeof message.reasoning_content === "string" && message.reasoning_content.length > 0;
}
function isReasoningOnlyReplayTarget(provider, model) {
    const normalizedProvider = String(provider ?? "").trim().toLowerCase();
    const normalizedModel = String(model ?? "").trim().toLowerCase();
    // DeepSeek V4 and Xiaomi MiMo both enforce "pass reasoning_content back on
    // subsequent turns" even on PLAIN (non-tool-call) assistant turns. Without
    // replaying on those turns the upstream 400s with "Param Incorrect: The
    // reasoning_content in the thinking mode must be passed back to the API."
    // (deepseek #1682, xiaomi-mimo 9router#1321/#1337).
    return normalizedProvider === "deepseek" || /(^|\/)deepseek/i.test(normalizedModel) || normalizedProvider === "xiaomi-mimo" || /(^|\/)mimo/i.test(normalizedModel) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningContentInjector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requiresAuthenticReasoningContent"])(normalizedProvider, normalizedModel);
}
/** @param options.normalizeToolCallId - When true, use 9-char tool call ids (e.g. Mistral); when false, leave ids as-is */ /** @param options.preserveDeveloperRole - undefined/true: keep developer for OpenAI format (default); false: map to system */ /** @param options.preserveCacheControl - When true, preserve client-side cache_control markers (for Claude Code, etc.) */ // Translate request: source -> openai -> target
// Client-only assistant "echo" fields that strict OpenAI-compatible upstreams (e.g.
// Mistral) reject with 422 extra_forbidden when sent back as input history. They carry
// no value upstream and are dropped on the OpenAI target path (#1649). `audio` is
// deliberately NOT included: OpenAI audio models reference a prior assistant audio
// response by id on multi-turn, so stripping it would break that (Mistral never emits
// audio, so it is never present there).
const OPENAI_INCOMPATIBLE_ECHO_FIELDS = [
    "reasoning_content",
    "reasoning",
    "refusal",
    "annotations",
    "cache_control"
];
function translateRequest(sourceFormat, targetFormat, model, body, stream = true, credentials = null, provider = null, reqLogger = null, options) {
    let result = body;
    const use9CharId = options?.normalizeToolCallId === true;
    const preserveDeveloperRole = options?.preserveDeveloperRole;
    const connectionCacheOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveConnectionCacheOverride"])(credentials?.providerSpecificData);
    // Phase 2: Apply thinking budget control before normalization
    result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyThinkingBudget"])(result);
    // Explicit reasoning-routing policies are final. The marker is internal and is
    // consumed here before any provider translation can see it.
    result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoningRouting$2f$policy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyReasoningRuleDirective"])(result);
    // Normalize thinking config: remove if lastMessage is not user
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeThinkingConfig"])(result);
    // Ensure tool_calls have id; optionally normalize to 9-char for providers like Mistral
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureToolCallIds"])(result, {
        use9CharId
    });
    // Fix missing tool responses (insert empty tool_result if needed)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixMissingToolResponses"])(result);
    // Claude reconciliation preserves orphaned tool output as labelled user text.
    // Keep the raw result carriers until the target translator can perform that
    // lossless conversion; other target formats retain the strict orphan filter.
    if (targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripOrphanedToolResults"])(result);
    }
    // Normalize roles: developer→system unless preserved, system→user for incompatible models.
    // This handles (1) sourceFormat openai with messages containing developer → non-openai target
    // or preserveDeveloperRole=false, and (2) all other paths where result.messages already exists.
    if (result.messages && Array.isArray(result.messages)) {
        result.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$roleNormalizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRoles"])(result.messages, provider || "", model || "", targetFormat, preserveDeveloperRole);
    }
    // #7293: hoist any system message at index > 0 onto index 0 for providers that reject
    // a non-first system role (systemMessageMustBeFirst() — same source of truth as the
    // memory-injection half, #6135/PR#6225). Runs for every path — including same-format
    // (OpenAI→OpenAI) passthrough, where none of the format-specific translators below
    // execute — so a client-injected mid-array system message (OpenCode/Kilo Code style
    // clients) is still normalized before reaching the upstream. No-op for non-strict
    // providers and for already-compliant requests (prompt-cache prefix stability).
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && result.messages && Array.isArray(result.messages)) {
        result.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$strictSystemHoist$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hoistLeadingSystemMessage"])(result.messages, provider);
    }
    // If same format, skip translation steps
    if (sourceFormat !== targetFormat) {
        // Check for direct translation path first (e.g., Claude → Gemini)
        const directTranslator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRequestTranslator"])(sourceFormat, targetFormat);
        if (directTranslator && sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
            // Thread the routed provider id so target translators can apply provider-specific
            // quirks (e.g. Vertex rejects function_call.id — #3440).
            // Also thread signatureNamespace so Claude→Gemini can re-attach cached
            // thoughtSignature on tool-use history (#8979 / #2504 parity with the hub path).
            const hasNs = options?.signatureNamespace != null;
            const hasProvider = provider != null;
            const directCredentials = hasNs || hasProvider ? {
                ...credentials && typeof credentials === "object" ? credentials : {},
                ...hasProvider ? {
                    _provider: provider
                } : {},
                ...hasNs ? {
                    _signatureNamespace: options.signatureNamespace
                } : {}
            } : credentials;
            result = directTranslator(model, result, stream, directCredentials);
        } else {
            // Fallback: hub-and-spoke via OpenAI
            // Step 1: source -> openai (if source is not openai)
            if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
                const toOpenAI = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRequestTranslator"])(sourceFormat, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
                if (toOpenAI) {
                    // Forward Copilot UA marker to source→openai translators only.
                    const hasTargetHint = targetFormat != null;
                    // #2069 — forward the cache_control-preservation intent so the
                    // source→openai translator (e.g. claudeToOpenAIRequest) keeps the
                    // client's breakpoints — but ONLY for providers that honor explicit
                    // OpenAI-format cache_control (DashScope/alibaba, Xiaomi MiMo). Generic
                    // / implicit-cache OpenAI providers (openai/codex/azure) must still be
                    // stripped.
                    const preserveCacheControl = options?.preserveCacheControl === true && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerHonorsOpenAIFormatCacheControl"])(provider, connectionCacheOverride);
                    const step1Credentials = options?.copilotClient || hasTargetHint || preserveCacheControl ? {
                        ...credentials && typeof credentials === "object" ? credentials : {},
                        ...options?.copilotClient ? {
                            _copilotClient: true
                        } : {},
                        ...hasTargetHint ? {
                            _targetFormat: targetFormat
                        } : {},
                        ...preserveCacheControl ? {
                            _preserveCacheControl: true
                        } : {}
                    } : credentials;
                    result = toOpenAI(model, result, stream, step1Credentials);
                    // Log OpenAI intermediate format
                    reqLogger?.logOpenAIRequest?.(result);
                }
            }
            // Step 2: openai -> target (if target is not openai)
            if (targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
                const fromOpenAI = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRequestTranslator"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, targetFormat);
                if (fromOpenAI) {
                    const hasNs = options?.signatureNamespace != null;
                    const hasPreCompression = options?.preCompressionBody != null;
                    const hasCopilot = options?.copilotClient === true;
                    const hasProvider = provider != null;
                    const translationCredentials = hasNs || hasPreCompression || hasCopilot || hasProvider ? {
                        ...credentials && typeof credentials === "object" ? credentials : {},
                        ...hasNs ? {
                            _signatureNamespace: options.signatureNamespace
                        } : {},
                        ...hasPreCompression ? {
                            _preCompressionBody: options.preCompressionBody
                        } : {},
                        ...hasCopilot ? {
                            _copilotClient: true
                        } : {},
                        // Routed provider id so target translators can apply provider-specific
                        // quirks (e.g. Vertex rejects function_call.id — #3440).
                        ...hasProvider ? {
                            _provider: provider
                        } : {}
                    } : credentials;
                    result = fromOpenAI(model, result, stream, translationCredentials);
                }
            }
        }
    }
    // Resolve reasoning-replay status up-front: it gates both the reasoning_content
    // strip in filterToOpenAIFormat below (#4849 must NOT strip client reasoning for
    // replay providers) and the cache re-injection further down.
    const normalizedProvider = String(provider ?? "");
    const normalizedModel = String(model ?? "");
    const isKimiCoding = normalizedProvider === "kimi-coding" || normalizedProvider === "kimi-coding-apikey";
    const requiresAuthenticReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningContentInjector$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requiresAuthenticReasoningContent"])(normalizedProvider, normalizedModel);
    const resolvedCapabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])({
        provider: normalizedProvider,
        model: normalizedModel
    });
    const isReasoner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["requiresReasoningReplay"])({
        provider: normalizedProvider,
        model: normalizedModel,
        thinkingEnabled: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["hasThinkingConfig"])(result),
        supportsReasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["supportsReasoning"])({
            provider: normalizedProvider,
            model: normalizedModel
        }),
        interleavedField: resolvedCapabilities?.interleavedField ?? null
    });
    // Always normalize to clean OpenAI format when target is OpenAI
    // This handles hybrid requests (e.g., OpenAI messages + Claude tools)
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        // #2069 — preserve client cache_control breakpoints only for providers that
        // honor explicit OpenAI-format markers (DashScope/alibaba, Xiaomi MiMo) when
        // requested upstream; generic/implicit-cache OpenAI providers stay stripped.
        result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$openaiHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["filterToOpenAIFormat"])(result, {
            preserveCacheControl: options?.preserveCacheControl === true && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cacheControlPolicy$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerHonorsOpenAIFormatCacheControl"])(provider, connectionCacheOverride),
            // #4849 regression guard: keep client reasoning_content for replay providers.
            preserveReasoningContent: isReasoner,
            // Moonshot's Chat API accepts its own OpenAI-compatible `video_url` block.
            preserveVideoUrl: normalizedProvider === "moonshot" || normalizedProvider === "kimi"
        });
    }
    // Final step: prepare request for Claude format endpoints
    // Preserve cache_control when:
    // 1. Claude passthrough mode (Claude → Claude), OR
    // 2. Explicitly requested via options (for caching-aware clients like Claude Code)
    // When preserve-mode has nothing to preserve (the client sent no cache_control
    // anywhere), fall back to the standard heuristic so the request never ships
    // with zero prompt-cache breakpoints. Translator-path only — the CC relay
    // path keeps its "never supplement" contract.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        const isClaudePassthrough = sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE;
        const preserveCache = isClaudePassthrough || options?.preserveCacheControl === true;
        result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$claudeHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["prepareClaudeRequest"])(result, provider, preserveCache, model, {
            fallbackToHeuristicWhenNoMarkers: true
        });
    }
    // Normalize openai-responses input shape for providers that require list input.
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
        result = normalizeOpenAIResponsesRequest(result);
    }
    // Second role normalization: only for OPENAI_RESPONSES. Here messages are built from input
    // after the translation step, so the first normalizeRoles (above) did not see them. For
    // sourceFormat openai with messages already on the body, the first block handles developer
    // → system (non-openai target or preserveDeveloperRole=false); no second pass needed.
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES && result.messages && Array.isArray(result.messages)) {
        result.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$roleNormalizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeRoles"])(result.messages, provider || "", model || "", targetFormat, preserveDeveloperRole);
    }
    if (result.tools !== undefined) {
        result.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceToolSchemas"])(result.tools);
        result.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolDescriptions"])(result.tools);
        if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
            result.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectOptionalEnumOmissionForTools"])(result.tools);
        }
    }
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && !requiresAuthenticReasoning && result.messages && Array.isArray(result.messages)) {
        result.messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["injectEmptyReasoningContentForToolCalls"])(result.messages, provider, model);
    }
    // Ensure unique tool_call ids on final payload (translators may have introduced duplicates)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ensureToolCallIds"])(result, {
        use9CharId
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fixMissingToolResponses"])(result);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripOrphanedToolResults"])(result);
    if (result.tools) {
        result.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["coerceToolSchemas"])(result.tools);
        result.tools = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeToolDescriptions"])(result.tools);
    }
    // Reasoning Replay Cache (#1628): Re-inject cached reasoning_content for
    // thinking-mode models (DeepSeek V4, Kimi K2, Qwen-Thinking, etc.) when
    // clients omit it from the conversation history. Without this, DeepSeek V4
    // returns 400: "The reasoning_content in the thinking mode must be passed
    // back to the API."
    // isReasoner / normalizedProvider / normalizedModel / resolvedCapabilities were
    // resolved up-front (before the OpenAI-format filter) so the #4849 reasoning strip
    // could honor reasoning-replay providers.
    if (isReasoner && !isKimiCoding && result.messages && Array.isArray(result.messages)) {
        const canReplayReasoningOnly = isReasoningOnlyReplayTarget(normalizedProvider, normalizedModel);
        for (const [messageIndex, msg] of result.messages.entries()){
            if (msg.role !== "assistant") continue;
            // Moonshot `partial` messages are output prefixes, not completed prior
            // assistant turns. Never attach replayed or placeholder reasoning to them.
            if (msg.partial === true) {
                if (msg.reasoning_content === "") delete msg.reasoning_content;
                continue;
            }
            // Detect tool calls in either format
            const hasToolCalls = Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0;
            // Claude format: tool_use lives in content[] blocks, not msg.tool_calls
            const hasToolUseBlocks = !hasToolCalls && Array.isArray(msg.content) && msg.content.some((b)=>b?.type === "tool_use");
            // For DeepSeek replay targets, a plain (non-tool-call) assistant turn must
            // ALSO carry reasoning_content in thinking mode, or DeepSeek V4+ returns 400:
            // "The reasoning_content in the thinking mode must be passed back to the API."
            // Enter the replay path when the field is MISSING or empty (#1682) — not only
            // when it is already present (the previous gate only matched messages that
            // already had the field, so stripped-history turns from clients like Cursor
            // were skipped and forwarded without reasoning_content).
            const shouldReplayReasoningOnly = !hasToolCalls && !hasToolUseBlocks && canReplayReasoningOnly && !hasNonEmptyReasoningContent(msg);
            if (!hasToolCalls && !hasToolUseBlocks && !shouldReplayReasoningOnly) {
                // Strip empty reasoning_content on non-tool-call messages we are NOT
                // replaying (e.g. non-DeepSeek targets); an empty string has no meaningful
                // value to send and may confuse some upstreams.
                if (msg.reasoning_content === "") {
                    delete msg.reasoning_content;
                }
                continue;
            }
            if (hasToolUseBlocks) {
                // ── Claude-format message ──
                // Has tool_use blocks but no thinking block yet.
                // Reasoning models (Kimi K2, etc.) require a thinking block before tool_use
                // on multi-turn or they regenerate the same tool call infinitely.
                const hasThinkingBlock = msg.content.some((b)=>b?.type === "thinking" || b?.type === "redacted_thinking");
                if (hasThinkingBlock) continue;
                const toolUseBlocks = msg.content.filter((b)=>b?.type === "tool_use");
                const firstToolUseId = toolUseBlocks[0]?.id;
                const firstToolUseIdx = msg.content.findIndex((b)=>b?.type === "tool_use");
                // Try reasoning cache first
                if (firstToolUseId) {
                    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lookupReasoning"])(firstToolUseId);
                    if (cached) {
                        msg.content.splice(firstToolUseIdx, 0, {
                            type: "thinking",
                            thinking: cached
                        });
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordReplay"])();
                        continue;
                    }
                }
                if (requiresAuthenticReasoning) continue;
                // Fallback: inject placeholder (must be non-empty for kimi-coding)
                msg.content.splice(firstToolUseIdx, 0, {
                    type: "thinking",
                    thinking: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NON_ANTHROPIC_THINKING_PLACEHOLDER"]
                });
                continue;
            }
            // ── OpenAI-format message ──
            // Skip if client already provided real reasoning_content
            if (hasNonEmptyReasoningContent(msg)) {
                continue;
            }
            const cacheKey = hasToolCalls ? msg.tool_calls[0]?.id : getAssistantMessageCacheKey(result, 0);
            if (cacheKey) {
                const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["lookupReasoning"])(cacheKey);
                if (cached) {
                    msg.reasoning_content = cached;
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$reasoningCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["recordReplay"])();
                    continue;
                }
            }
            // Native Moonshot K3/K2.7 accepts only the real prior reasoning. If it
            // was not supplied and the cache missed, leave it absent so upstream can
            // enforce its contract instead of corrupting history with a placeholder.
            if (requiresAuthenticReasoning) {
                if (msg.reasoning_content === "") delete msg.reasoning_content;
                continue;
            }
            // Cache miss fallback — use a non-empty placeholder.
            // Empty string causes DeepSeek V4+ to reject with 400:
            // "reasoning_content in the thinking mode must be passed back to the API."
            // Note: injectEmptyReasoningContentForToolCalls may have pre-set
            // reasoning_content="" before the cache lookup, so we check for
            // both undefined AND empty string here.
            //
            // Applies to tool-call messages AND to plain (non-tool-call) assistant turns
            // on DeepSeek replay targets (#1682). Without the placeholder on plain turns,
            // a multi-turn text conversation whose reasoning_content the client stripped
            // is forwarded to DeepSeek without the field and rejected with 400.
            if ((hasToolCalls || shouldReplayReasoningOnly) && !msg.reasoning_content) {
                msg.reasoning_content = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["NON_ANTHROPIC_THINKING_PLACEHOLDER"];
            }
        }
    } else if (!isReasoner && targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && result.messages && Array.isArray(result.messages)) {
        for (const msg of result.messages){
            for (const field of OPENAI_INCOMPATIBLE_ECHO_FIELDS){
                if (msg[field] !== undefined) {
                    delete msg[field];
                }
            }
        }
    }
    return result;
}
function translateResponse(targetFormat, sourceFormat, chunk, state) {
    // If same format, return as-is — but never propagate the null/flush signal as a
    // literal `[null]`, which leaks an empty `data: null` SSE event between chunks and
    // crashes strict clients (#1052).
    if (sourceFormat === targetFormat) {
        return chunk == null ? [] : [
            chunk
        ];
    }
    let results = [
        chunk
    ];
    let openaiResults = null; // Store OpenAI intermediate results
    // Check for direct translation path first (e.g., Gemini → Claude)
    const directTranslator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResponseTranslator"])(targetFormat, sourceFormat);
    if (directTranslator && targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        const converted = directTranslator(chunk, state);
        if (converted) {
            results = Array.isArray(converted) ? converted : [
                converted
            ];
        } else {
            results = [];
        }
        return results;
    }
    // Fallback: hub-and-spoke via OpenAI
    // Step 1: target -> openai (if target is not openai)
    if (targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        const toOpenAI = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResponseTranslator"])(targetFormat, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI);
        if (toOpenAI) {
            results = [];
            const converted = toOpenAI(chunk, state);
            if (converted) {
                results = Array.isArray(converted) ? converted : [
                    converted
                ];
                openaiResults = results; // Store OpenAI intermediate
            }
        }
    }
    // Step 2: openai -> source (if source is not openai)
    if (sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        const fromOpenAI = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$registry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getResponseTranslator"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI, sourceFormat);
        if (fromOpenAI) {
            const finalResults = [];
            for (const r of results){
                const converted = fromOpenAI(r, state);
                if (converted) {
                    finalResults.push(...Array.isArray(converted) ? converted : [
                        converted
                    ]);
                }
            }
            // Flush: pass null to source-format translator even when Step 1 produced no output.
            // This is critical for formats like openai-responses that emit terminal events
            // (e.g., response.completed with total_tokens) in their flush handler.
            if (chunk === null && results.length === 0) {
                const converted = fromOpenAI(null, state);
                if (converted) {
                    finalResults.push(...Array.isArray(converted) ? converted : [
                        converted
                    ]);
                }
            }
            results = finalResults;
        }
    }
    // Attach OpenAI intermediate results for logging
    if (openaiResults && sourceFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI && targetFormat !== __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        results._openaiIntermediate = openaiResults;
    }
    return results;
}
function needsTranslation(sourceFormat, targetFormat) {
    return sourceFormat !== targetFormat;
}
function initState(sourceFormat) {
    // Base state for all formats
    const base = {
        messageId: null,
        model: null,
        textBlockStarted: false,
        thinkingBlockStarted: false,
        inThinkingBlock: false,
        currentBlockIndex: null,
        toolCalls: new Map(),
        finishReason: null,
        finishReasonSent: false,
        usage: null,
        contentBlockIndex: -1
    };
    // Add openai-responses specific fields
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
        return {
            ...base,
            seq: 0,
            responseId: `resp_${Date.now()}`,
            created: Math.floor(Date.now() / 1000),
            started: false,
            msgTextBuf: {},
            msgItemAdded: {},
            msgContentAdded: {},
            msgItemDone: {},
            reasoningId: "",
            reasoningIndex: -1,
            reasoningBuf: "",
            reasoningPartAdded: false,
            reasoningDone: false,
            inThinking: false,
            parseTextualReasoningTags: false,
            funcArgsBuf: {},
            funcNames: {},
            funcCallIds: {},
            funcArgsDone: {},
            funcItemAdded: {},
            funcItemDone: {},
            completedOutputItems: [],
            completedSent: false
        };
    }
    return base;
}
function initTranslators() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$bootstrap$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["bootstrapTranslatorRegistry"])();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/translator/response/openai-responses/toolSchemas.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure, stateless helper: build a Map<toolName, parametersSchema> from a request body's
// `tools[]` (Chat Completions `{type:"function",function:{name,parameters}}` shape or
// Responses API `{type:"function",name,parameters}` shape). Used to thread each tool's
// JSON Schema into response-side normalization (#6951 — stripEmptyOptionalToolArgs) so
// it can be schema-aware instead of allowlist-only. No stream state, no host import.
__turbopack_context__.s([
    "extractToolSchemaMap",
    ()=>extractToolSchemaMap
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function extractToolSchemaMap(body) {
    const record = asRecord(body);
    const tools = record?.tools;
    if (!Array.isArray(tools)) return null;
    const map = new Map();
    for (const tool of tools){
        const item = asRecord(tool);
        if (!item) continue;
        const fn = asRecord(item.function);
        const name = (typeof fn?.name === "string" ? fn.name : typeof item.name === "string" ? item.name : "").trim();
        if (!name) continue;
        const schema = asRecord(fn?.parameters ?? item.parameters);
        if (schema) map.set(name, schema);
    }
    return map.size > 0 ? map : null;
}
}),
"[project]/open-sse/translator/webTools.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Tool-call translation for web-cookie providers (deepseek-web, chatgpt-web, ...).
//
// The web UIs accept only a single plain prompt string and have no native function
// calling — they reply with tool invocations as raw text. To let agentic clients use
// these providers we (a) serialize the OpenAI `tools` array into a system-prompt
// contract on the request side, and (b) parse the upstream `<tool>{...}</tool>` text
// back into OpenAI `tool_calls` on the response side. (#2820)
__turbopack_context__.s([
    "buildToolAwareResult",
    ()=>buildToolAwareResult,
    "getRequestedToolNames",
    ()=>getRequestedToolNames,
    "getToolNonce",
    ()=>getToolNonce,
    "parseLooseJsonObject",
    ()=>parseLooseJsonObject,
    "parseToolCallsFromText",
    ()=>parseToolCallsFromText,
    "prepareToolMessages",
    ()=>prepareToolMessages,
    "resolveRequestedToolName",
    ()=>resolveRequestedToolName,
    "serializeToolsToPrompt",
    ()=>serializeToolsToPrompt,
    "stripRanges",
    ()=>stripRanges,
    "toArgumentsString",
    ()=>toArgumentsString
]);
const TOOL_BLOCK_RE = /<tool>\s*([\s\S]*?)\s*<\/tool>/g;
// Some web-cookie models (e.g. ds-web) wrap calls as `<tool_call name="...">{json}</tool_call>`
// instead of the canonical `<tool>{json}</tool>`. Capture the JSON body — the real tool name
// lives there, never in the tag's `name="..."` attribute (#3260).
const TOOL_CALL_TAG_RE = /<tool_call(?:\s+[^>]*)?\s*>\s*([\s\S]*?)\s*<\/tool_call>/g;
// Per-request nonce binding for tool envelopes (#9343). Associates a random nonce
// with each tools[] array reference so the serializer and parser can share it
// without threading extra parameters through executor call chains.
const toolNonceMap = new WeakMap();
function getToolNonce(tools) {
    if (!Array.isArray(tools) || tools.length === 0) return "";
    let nonce = toolNonceMap.get(tools);
    if (!nonce) {
        nonce = Math.random().toString(36).slice(2, 10);
        toolNonceMap.set(tools, nonce);
    }
    return nonce;
}
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function getRequestedToolNames(tools) {
    if (!Array.isArray(tools)) return [];
    const names = [];
    const seen = new Set();
    for (const tool of tools){
        const record = toRecord(tool);
        const fn = toRecord(record?.function);
        const name = typeof fn?.name === "string" ? fn.name.trim() : "";
        if (!name || seen.has(name)) continue;
        seen.add(name);
        names.push({
            original: name,
            normalized: normalizeToolName(name)
        });
    }
    return names;
}
function normalizeToolName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function levenshteinDistance(a, b) {
    if (a === b) return 0;
    if (!a) return b.length;
    if (!b) return a.length;
    let previous = Array.from({
        length: b.length + 1
    }, (_, i)=>i);
    let current = Array(b.length + 1);
    for(let i = 1; i <= a.length; i += 1){
        current[0] = i;
        for(let j = 1; j <= b.length; j += 1){
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
        }
        const temp = previous;
        previous = current;
        current = temp;
    }
    return previous[b.length];
}
function scoreToolName(emitted, requested) {
    if (emitted === requested.original) return 1;
    const normalized = normalizeToolName(emitted);
    if (!normalized || !requested.normalized) return 0;
    if (normalized === requested.normalized) return 0.98;
    const shorter = Math.min(normalized.length, requested.normalized.length);
    const longer = Math.max(normalized.length, requested.normalized.length);
    if (shorter >= 4) {
        if (normalized.includes(requested.normalized) || requested.normalized.includes(normalized)) {
            return 0.86 - (longer - shorter) / Math.max(longer, 1) / 4;
        }
    }
    const distance = levenshteinDistance(normalized, requested.normalized);
    const similarity = 1 - distance / Math.max(longer, 1);
    return similarity >= 0.72 ? similarity : 0;
}
function resolveRequestedToolName(emitted, requestedTools) {
    if (requestedTools.length === 0) return emitted;
    let best = null;
    let secondBest = 0;
    for (const requested of requestedTools){
        const score = scoreToolName(emitted, requested);
        if (!best || score > best.score) {
            secondBest = best?.score ?? 0;
            best = {
                name: requested.original,
                score
            };
        } else if (score > secondBest) {
            secondBest = score;
        }
    }
    if (!best || best.score < 0.72) return null;
    // Avoid correcting to an arbitrary tool when the fuzzy match is ambiguous.
    if (best.score < 0.98 && best.score - secondBest < 0.08) return null;
    return best.name;
}
function stripCodeFence(value) {
    return value.trim().replace(/^```(?:json|javascript|js|python)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
function convertSingleQuotedStrings(value) {
    let result = "";
    let inSingle = false;
    let inDouble = false;
    let escaped = false;
    for (const ch of value){
        if (escaped) {
            result += ch === '"' && inSingle ? '\\"' : ch;
            escaped = false;
            continue;
        }
        if (ch === "\\") {
            result += ch;
            escaped = true;
            continue;
        }
        if (ch === '"') {
            if (inSingle) {
                result += '\\"';
            } else {
                inDouble = !inDouble;
                result += ch;
            }
            continue;
        }
        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            result += '"';
            continue;
        }
        result += ch;
    }
    return result;
}
function replacePythonLiterals(value) {
    let result = "";
    let inString = false;
    let escaped = false;
    let token = "";
    const flushToken = ()=>{
        if (token === "True") result += "true";
        else if (token === "False") result += "false";
        else if (token === "None") result += "null";
        else result += token;
        token = "";
    };
    for (const ch of value){
        if (escaped) {
            if (token) flushToken();
            result += ch;
            escaped = false;
            continue;
        }
        if (ch === "\\") {
            if (token) flushToken();
            result += ch;
            escaped = inString;
            continue;
        }
        if (ch === '"') {
            if (token) flushToken();
            inString = !inString;
            result += ch;
            continue;
        }
        if (!inString && /[A-Za-z]/.test(ch)) {
            token += ch;
            continue;
        }
        if (token) flushToken();
        result += ch;
    }
    if (token) flushToken();
    return result;
}
function normalizeLooseJson(value) {
    return replacePythonLiterals(convertSingleQuotedStrings(value)).replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, '$1"$2"$3').replace(/,\s*([}\]])/g, "$1");
}
function parseLooseJsonObject(raw) {
    const trimmed = stripCodeFence(raw);
    for (const candidate of [
        trimmed,
        normalizeLooseJson(trimmed)
    ]){
        try {
            return toRecord(JSON.parse(candidate));
        } catch  {
        // Try the next, more permissive form.
        }
    }
    return null;
}
function findBareJsonCandidates(text) {
    const candidates = [];
    let start = -1;
    let depth = 0;
    let quote = "";
    let escaped = false;
    for(let i = 0; i < text.length; i += 1){
        const ch = text[i];
        if (depth === 0 && ch !== "{") {
            continue;
        }
        if (escaped) {
            escaped = false;
            continue;
        }
        if (quote) {
            if (ch === "\\") {
                escaped = true;
            } else if (ch === quote) {
                quote = "";
            }
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === "{") {
            if (depth === 0) start = i;
            depth += 1;
            continue;
        }
        if (ch === "}" && depth > 0) {
            depth -= 1;
            if (depth === 0 && start >= 0) {
                const raw = text.slice(start, i + 1);
                if (/[{,]\s*["']?(name|command)["']?\s*:/i.test(raw) && /[{,]\s*["']?arguments["']?\s*:/i.test(raw)) {
                    candidates.push({
                        raw,
                        start,
                        end: i + 1,
                        requireRequestedTool: true
                    });
                }
                start = -1;
            }
        }
    }
    return candidates;
}
function rangesOverlap(a, b) {
    return a.start < b.end && b.start < a.end;
}
function stripRanges(text, ranges) {
    let content = text;
    const sorted = [
        ...ranges
    ].sort((a, b)=>b.start - a.start);
    for (const range of sorted){
        const lineStart = content.lastIndexOf("\n", range.start - 1) + 1;
        const nextLineBreak = content.indexOf("\n", range.end);
        const lineEnd = nextLineBreak === -1 ? content.length : nextLineBreak;
        const beforeOnLine = content.slice(lineStart, range.start);
        const afterOnLine = content.slice(range.end, lineEnd);
        const removeWholeLine = beforeOnLine.trim() === "" && afterOnLine.trim() === "";
        const start = removeWholeLine ? lineStart : range.start;
        const end = removeWholeLine && nextLineBreak !== -1 ? nextLineBreak + 1 : removeWholeLine ? lineEnd : range.end;
        content = `${content.slice(0, start)}${content.slice(end)}`;
    }
    return content.replace(/\n{3,}/g, "\n\n").trim();
}
function toArgumentsString(value) {
    if (value === undefined) return "{}";
    if (typeof value === "string") {
        const parsed = parseLooseJsonObject(value);
        return parsed ? JSON.stringify(parsed) : value;
    }
    try {
        return JSON.stringify(value);
    } catch  {
        return "{}";
    }
}
function serializeToolsToPrompt(tools) {
    if (!Array.isArray(tools) || tools.length === 0) return "";
    const nonce = getToolNonce(tools);
    if (!nonce) return "";
    const lines = [];
    for (const t of tools){
        const fn = t?.function;
        if (!fn?.name) continue;
        const desc = typeof fn.description === "string" && fn.description ? fn.description : "";
        let params = "";
        try {
            params = fn.parameters ? JSON.stringify(fn.parameters) : "";
        } catch  {
            params = "";
        }
        lines.push(`- ${fn.name}${desc ? `: ${desc}` : ""}${params ? `\n  parameters: ${params}` : ""}`);
    }
    if (lines.length === 0) return "";
    return [
        "You can call tools. To call a tool, reply with a single line containing a <tool> block",
        `with JSON that includes the secret binding "_nonce": "${nonce}":`,
        `<tool>{"name": "<tool_name>", "arguments": { ... }, "_nonce": "${nonce}"}</tool>`,
        "Only emit the <tool> block when you actually want to call a tool; otherwise answer normally.",
        "",
        "Available tools:",
        ...lines
    ].join("\n");
}
function parseToolCallsFromText(text, idSeed = "call", requestedTools) {
    const requestedToolNames = getRequestedToolNames(requestedTools);
    if (typeof text !== "string" || !text.includes("<tool>") && !text.includes("<tool_call")) {
        return {
            content: text ?? "",
            toolCalls: null
        };
    }
    const nonce = getToolNonce(requestedTools);
    const candidates = [];
    let blockMatch;
    TOOL_BLOCK_RE.lastIndex = 0;
    while((blockMatch = TOOL_BLOCK_RE.exec(text)) !== null){
        candidates.push({
            raw: blockMatch[1].trim(),
            start: blockMatch.index,
            end: TOOL_BLOCK_RE.lastIndex,
            requireRequestedTool: false
        });
    }
    TOOL_CALL_TAG_RE.lastIndex = 0;
    while((blockMatch = TOOL_CALL_TAG_RE.exec(text)) !== null){
        candidates.push({
            raw: blockMatch[1].trim(),
            start: blockMatch.index,
            end: TOOL_CALL_TAG_RE.lastIndex,
            requireRequestedTool: false
        });
    }
    candidates.sort((a, b)=>a.start - b.start);
    const toolCalls = [];
    const acceptedRanges = [];
    for (const candidate of candidates){
        const parsed = parseLooseJsonObject(candidate.raw);
        const emittedName = parsed && typeof parsed.name === "string" ? parsed.name : parsed && typeof parsed.command === "string" ? parsed.command : null;
        if (!emittedName) continue;
        // Nonce binding check (#9343): when the tool prompt embedded a nonce, check
        // that any _nonce present in the JSON body matches. A wrong nonce (present but
        // does not match) means this is a copy-attack or hallucination — treat it as text
        // instead of executing it. A missing _nonce is tolerated for backward compatibility
        // with models that do not (yet) follow the nonce instruction.
        if (nonce && parsed && parsed._nonce !== undefined && parsed._nonce !== nonce) continue;
        const name = resolveRequestedToolName(emittedName, requestedToolNames) || (candidate.requireRequestedTool ? null : emittedName);
        if (!name || candidate.requireRequestedTool && requestedToolNames.length === 0) continue;
        const args = toArgumentsString(parsed?.arguments);
        toolCalls.push({
            id: `${idSeed}_${toolCalls.length}`,
            type: "function",
            function: {
                name,
                arguments: args
            }
        });
        acceptedRanges.push({
            start: candidate.start,
            end: candidate.end
        });
    }
    if (toolCalls.length === 0) {
        return {
            content: text,
            toolCalls: null
        };
    }
    const content = stripRanges(text, acceptedRanges);
    return {
        content,
        toolCalls
    };
}
function prepareToolMessages(bodyObj, messages) {
    const requestedTools = bodyObj.tools;
    const hasTools = Array.isArray(requestedTools) && requestedTools.length > 0;
    if (!hasTools) return {
        hasTools: false,
        requestedTools,
        effectiveMessages: messages
    };
    const toolPrompt = serializeToolsToPrompt(requestedTools);
    return {
        hasTools: true,
        requestedTools,
        effectiveMessages: [
            {
                role: "system",
                content: toolPrompt
            },
            ...messages
        ]
    };
}
function buildToolAwareResult(rawContent, requestedTools, idSeed = "call") {
    const { content, toolCalls } = parseToolCallsFromText(rawContent, `${idSeed}-${Date.now()}`, requestedTools);
    return {
        content,
        toolCalls,
        finishReason: toolCalls ? "tool_calls" : "stop"
    };
}
}),
"[project]/open-sse/translator/deepseekWebTools.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildToolConversationPrompt",
    ()=>buildToolConversationPrompt,
    "parseDeepSeekToolCalls",
    ()=>parseDeepSeekToolCalls,
    "serializeDeepSeekToolPrompt",
    ()=>serializeDeepSeekToolPrompt
]);
// DeepSeek-web-specific tool-call translation.
//
// chat.deepseek.com has no native function calling, so OmniRoute serializes the OpenAI
// `tools[]` into a prompt contract and parses the model's text reply back into OpenAI
// `tool_calls`. The canonical `webTools.ts` parser handles the well-behaved
// `<tool>{json}</tool>` / bare-JSON shapes used by most web-cookie providers, and it MUST
// stay untouched (it works for the others).
//
// DeepSeek, however, emits a much wider zoo of ad-hoc shapes:
//   <tool:todowrite>{json}</tool>            name in the tag suffix, body is the arguments
//   <tool_call>{id,type,params}</tool_call>  alternate key names (type → name, params → arguments)
//   <tool name="x">{json}</tool>             name in an attribute
//   <tool id="todo_write">{json}</tool>      tool name in the id attribute
//   <tool><tool ...>{json}</tool></tool>     doubled / nested wrappers
//   <tool id="1"><name>x</name><arguments>{json}</arguments></tool>   XML children
//   <tool:write><parameter name="content" content="...">             parameter style
//
// A single regex cannot robustly cover all of these (nesting + attributes + XML children),
// so this parser tokenizes the tool tags and walks them with a stack instead. It reuses the
// proven JSON-normalization / fuzzy-name-matching / range-stripping helpers from webTools.ts
// rather than duplicating them.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/webTools.ts [instrumentation] (ecmascript)");
;
function serializeDeepSeekToolPrompt(tools) {
    if (!Array.isArray(tools) || tools.length === 0) return "";
    const nonce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getToolNonce"])(tools);
    if (!nonce) return "";
    const lines = [];
    for (const t of tools){
        const fn = t?.function;
        if (!fn?.name) continue;
        const desc = typeof fn.description === "string" && fn.description ? fn.description : "";
        let params = "";
        try {
            params = fn.parameters ? JSON.stringify(fn.parameters) : "";
        } catch  {
            params = "";
        }
        lines.push(`- ${fn.name}${desc ? `: ${desc}` : ""}${params ? `\n  parameters: ${params}` : ""}`);
    }
    if (lines.length === 0) return "";
    return [
        "You can call tools. To call a tool, output ONLY this exact block (no markdown fence):",
        `<tool>{"name": "<tool_name>", "arguments": { ... }, "_nonce": "${nonce}"}</tool>`,
        "Rules:",
        "- Use exactly <tool>...</tool>. Do NOT use <tool:name>, <tool_call>, <name>, <parameter>, id=/name= attributes, or code fences.",
        `- Include the secret binding "_nonce": "${nonce}" exactly as shown.`,
        '- "name" must be one of the tools below; "arguments" must be a JSON object.',
        "- When a tool is needed, emit the <tool> block instead of only describing the plan.",
        "- Emit one <tool> block per call; you may put several blocks back to back.",
        "- If no tool is needed, just answer normally without any <tool> block.",
        "",
        "Available tools:",
        ...lines
    ].join("\n");
}
function extractText(content) {
    if (Array.isArray(content)) {
        return content.filter((item)=>item?.type === "text").map((item)=>item?.text ?? "").join("\n");
    }
    return content == null ? "" : String(content);
}
function buildToolConversationPrompt(messages, toolSystemPrompt) {
    const systemParts = [];
    if (toolSystemPrompt) systemParts.push(toolSystemPrompt);
    const lines = [];
    const callNameById = new Map();
    let sawToolActivity = false;
    for (const m of messages){
        if (m.role === "system") {
            const t = extractText(m.content).trim();
            if (t) systemParts.push(t);
        } else if (m.role === "user") {
            const t = extractText(m.content).trim();
            if (t) lines.push(`User: ${t}`);
        } else if (m.role === "assistant") {
            const t = extractText(m.content).trim();
            const calls = Array.isArray(m.tool_calls) ? m.tool_calls : [];
            const parts = [];
            if (t) parts.push(t);
            for (const c of calls){
                const name = typeof c?.function?.name === "string" ? c.function.name : "";
                const rawArgs = c?.function?.arguments;
                const args = typeof rawArgs === "string" && rawArgs ? rawArgs : JSON.stringify(rawArgs ?? {});
                if (c?.id) callNameById.set(c.id, name);
                parts.push(`<tool>{"name": ${JSON.stringify(name)}, "arguments": ${args}}</tool>`);
                sawToolActivity = true;
            }
            if (parts.length) lines.push(`Assistant: ${parts.join("\n")}`);
        } else if (m.role === "tool") {
            const t = extractText(m.content).trim();
            const name = m.tool_call_id && callNameById.get(m.tool_call_id) || m.name || "tool";
            lines.push(`Tool result (${name}): ${t || "(no output)"}`);
            sawToolActivity = true;
        }
    }
    const parts = [];
    if (systemParts.length) parts.push(systemParts.join("\n\n"));
    if (lines.length) parts.push(lines.join("\n\n"));
    if (sawToolActivity) {
        // Anchor the model to the work already done so it advances instead of repeating it.
        parts.push("Continue the task using the tool results above. Do NOT repeat tool calls that already " + "succeeded; perform the next step or give the final answer.");
    }
    return parts.join("\n\n").replace(/!\[.*?\]\(.*?\)/g, "");
}
// Matches an opening/closing <tool .../> or <tool_call .../> tag, optionally with a `:name`
// suffix and an attribute list. `tool_call` is listed first so it wins the alternation.
const TAG_TOKEN_RE = /<(\/?)(?:tool_call|tool)(:[A-Za-z0-9_.+-]+)?((?:\s[^>]*)?)\/?>/g;
function tokenizeToolTags(text) {
    const tokens = [];
    let m;
    TAG_TOKEN_RE.lastIndex = 0;
    while((m = TAG_TOKEN_RE.exec(text)) !== null){
        tokens.push({
            start: m.index,
            end: TAG_TOKEN_RE.lastIndex,
            closing: m[1] === "/",
            suffix: m[2] ? m[2].slice(1) : "",
            attrs: m[3] || ""
        });
    }
    return tokens;
}
// Pair tags with a stack: every closing tag pairs with the nearest unmatched open. An open
// left unmatched at the end (e.g. the stray outer `<tool>` of a doubled wrapper, or a
// never-closed `<tool:write>` followed by `<parameter ...>`) gets a synthetic close at the end
// of the text so its body is still parsed; the doubled-wrapper outer is then dropped by the
// leaf filter.
function pairToolBlocks(tokens, textLen) {
    const blocks = [];
    const stack = [];
    for (const tok of tokens){
        if (!tok.closing) {
            stack.push(tok);
            continue;
        }
        const open = stack.pop();
        if (!open) continue;
        blocks.push({
            open,
            close: tok,
            innerStart: open.end,
            innerEnd: tok.start
        });
    }
    for (const open of stack){
        const synthetic = {
            start: textLen,
            end: textLen,
            closing: true,
            suffix: "",
            attrs: ""
        };
        blocks.push({
            open,
            close: synthetic,
            innerStart: open.end,
            innerEnd: textLen
        });
    }
    return blocks;
}
// ── Attribute / XML-child helpers ────────────────────────────────────────────
/** Read an attribute value, tolerating backslash-escaped quotes inside the value. */ function getAttr(attrs, name) {
    const re = new RegExp(`\\b${name}\\s*=\\s*("|')`);
    const m = re.exec(attrs);
    if (!m) return null;
    const quote = m[1];
    let j = m.index + m[0].length;
    let out = "";
    while(j < attrs.length){
        const ch = attrs[j];
        if (ch === "\\") {
            out += attrs[j + 1] ?? "";
            j += 2;
            continue;
        }
        if (ch === quote) break;
        out += ch;
        j += 1;
    }
    return out;
}
function getXmlChild(inner, tag) {
    const m = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(inner);
    return m ? m[1].trim() : null;
}
// The body group is a tempered greedy token: `(?:(?!<parameter\b)[\s\S])*?` so an
// attribute-only `<parameter ...>` (no closing tag) cannot let the body matcher swallow a
// following `<parameter>...</parameter>` and drop that parameter.
const PARAM_TAG_RE = /<parameter\b([^>]*?)\/?>(?:((?:(?!<parameter\b)[\s\S])*?)<\/parameter>)?/gi;
/** Collect `<parameter name="x" content="y">` / `<parameter name="x">y</parameter>` into an object. */ function buildArgsFromParameters(inner) {
    const out = {};
    let found = false;
    let m;
    PARAM_TAG_RE.lastIndex = 0;
    while((m = PARAM_TAG_RE.exec(inner)) !== null){
        const attrs = m[1] || "";
        const body = m[2];
        const name = getAttr(attrs, "name");
        if (!name) continue;
        const value = getAttr(attrs, "content") ?? (typeof body === "string" ? body.trim() : "");
        out[name] = value;
        found = true;
    }
    return found ? out : null;
}
function asString(value) {
    return typeof value === "string" && value.length > 0 ? value : null;
}
/**
 * Build a map of tool name → set of parameter property keys from the requested tools array.
 * Used by the nameless-block fallback to do conservative schema-based name resolution.
 */ function buildSchemaParamMap(requestedTools) {
    const map = new Map();
    if (!Array.isArray(requestedTools)) return map;
    for (const tool of requestedTools){
        const fn = tool?.function;
        if (!fn?.name) continue;
        const params = fn.parameters;
        const props = params?.properties;
        if (props && typeof props === "object" && !Array.isArray(props)) {
            map.set(fn.name, new Set(Object.keys(props)));
        } else {
            map.set(fn.name, new Set());
        }
    }
    return map;
}
/**
 * Turn one tool block (tag name + inner text) into a name + JSON-string arguments.
 * Returns null when no plausible tool name can be recovered.
 */ function extractCall(tagName, innerRaw, requested, schemaMap) {
    const inner = innerRaw.trim();
    const nameChild = getXmlChild(inner, "name");
    const argsChild = getXmlChild(inner, "arguments") ?? getXmlChild(inner, "parameters");
    const paramObj = argsChild ? null : buildArgsFromParameters(inner);
    const hasXmlChildren = !!nameChild || !!argsChild || !!paramObj;
    const json = hasXmlChildren ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseLooseJsonObject"])(inner);
    const jsonName = json ? asString(json.name) ?? asString(json.type) : null;
    const childResolved = nameChild ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestedToolName"])(nameChild, requested) : null;
    const jsonResolved = jsonName ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestedToolName"])(jsonName, requested) : null;
    const tagResolved = tagName ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestedToolName"])(tagName, requested) : null;
    // Prefer a name that maps to a requested tool. The JSON body wins over the tag attribute
    // because DeepSeek sometimes emits a bogus tag name (e.g. name="skill", #3260).
    let name = null;
    let nameFromTag = false;
    const pick = (val, fromTag)=>{
        if (!name && val) {
            name = val;
            nameFromTag = fromTag;
        }
    };
    pick(childResolved, false);
    pick(jsonResolved, false);
    pick(tagResolved, true);
    pick(nameChild, false);
    pick(jsonName, false);
    pick(tagName, true);
    // Shell-style `{ "command": "..." }` with no tag name: treat command as the tool name only
    // if it actually resolves to a requested tool (the value is otherwise the command itself).
    if (!name && !tagName && json) {
        const command = asString(json.command);
        const resolved = command ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveRequestedToolName"])(command, requested) : null;
        if (resolved) {
            name = resolved;
            nameFromTag = false;
        }
    }
    // Nameless-block fallback (#5154): when all explicit name-resolution paths fail but the
    // block has <parameter> children, try a conservative schema-based match. If exactly ONE
    // requested tool's parameter-schema keys are a superset of every extracted param name,
    // adopt that tool name. Zero matches or ambiguous (>1) → keep returning null to avoid
    // misattributing calls.
    if (!name && paramObj && schemaMap && schemaMap.size > 0) {
        const extractedKeys = Object.keys(paramObj);
        if (extractedKeys.length > 0) {
            const candidates = [];
            for (const [toolName, schemaKeys] of schemaMap){
                if (schemaKeys.size > 0 && extractedKeys.every((k)=>schemaKeys.has(k))) {
                    candidates.push(toolName);
                }
            }
            if (candidates.length === 1) {
                name = candidates[0];
                nameFromTag = false;
            }
        }
    }
    if (!name) return null;
    let argsValue;
    if (argsChild) {
        argsValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseLooseJsonObject"])(argsChild) ?? argsChild;
    } else if (paramObj) {
        argsValue = paramObj;
    } else if (json) {
        if (json.arguments !== undefined) argsValue = json.arguments;
        else if (json.params !== undefined) argsValue = json.params;
        else if (nameFromTag) {
            // `<tool:bash>{"command": ...}` — the whole JSON object is the arguments payload.
            argsValue = json;
        } else {
            // Name came from the JSON body — the remaining keys are the arguments.
            const { name: _n, type: _t, id: _i, command: _c, arguments: _a, params: _p, ...rest } = json;
            argsValue = rest;
        }
    } else {
        argsValue = {};
    }
    return {
        name,
        arguments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toArgumentsString"])(argsValue)
    };
}
function parseDeepSeekToolCalls(text, idSeed = "call", requestedTools) {
    if (typeof text !== "string" || text.length === 0) {
        return {
            content: text ?? "",
            toolCalls: null
        };
    }
    const tokens = tokenizeToolTags(text);
    if (tokens.length === 0) {
        // No DeepSeek-specific tags — defer to the proven canonical parser (bare JSON, etc.).
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseToolCallsFromText"])(text, idSeed, requestedTools);
    }
    const requested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRequestedToolNames"])(requestedTools);
    const schemaMap = buildSchemaParamMap(requestedTools);
    const blocks = pairToolBlocks(tokens, text.length);
    // Only extract from leaf blocks (no other block nested inside), so a doubled
    // `<tool><tool>...</tool></tool>` wrapper yields a single call from the inner block.
    const isLeaf = (b)=>!blocks.some((o)=>o !== b && o.open.start >= b.innerStart && o.close.end <= b.innerEnd);
    const toolCalls = [];
    const acceptedRanges = [];
    const nonce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getToolNonce"])(requestedTools);
    for (const block of blocks.filter(isLeaf).sort((a, b)=>a.open.start - b.open.start)){
        const tagName = block.open.suffix || getAttr(block.open.attrs, "name") || getAttr(block.open.attrs, "id") || "";
        const inner = text.slice(block.innerStart, block.innerEnd);
        const call = extractCall(tagName, inner, requested, schemaMap);
        if (!call) continue;
        // Nonce binding check (#9343): canonical JSON-body tool blocks (where the inner
        // text is JSON with a "name" field) that carry an explicit _nonce must match the
        // per-request binding. A wrong nonce means this is a copy-attack or hallucination.
        //
        // XML children (<parameter>, <name>, <arguments>) and tag-suffix blocks do not
        // have a JSON body, so the nonce check does not apply to them.
        // A missing _nonce is tolerated for backward compatibility.
        if (nonce) {
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseLooseJsonObject"])(inner);
            if (parsed && typeof parsed.name === "string" && parsed._nonce !== undefined && parsed._nonce !== nonce) continue;
        }
        toolCalls.push({
            id: `${idSeed}_${toolCalls.length}`,
            type: "function",
            function: {
                name: call.name,
                arguments: call.arguments
            }
        });
        acceptedRanges.push({
            start: block.open.start,
            end: block.close.end
        });
    }
    if (toolCalls.length === 0) {
        // Tags were present but none parsed (e.g. malformed or nonce-rejected).
        // Do NOT fall back to parseToolCallsFromText — that would re-process content
        // already seen by this parser and potentially promote rejected tagged output
        // to tool_calls. (#9343)
        return {
            content: text,
            toolCalls: null
        };
    }
    // Strip the accepted blocks plus any stray tool tags left outside them (the unmatched outer
    // `<tool>` of a doubled wrapper, leftover `</tool>` of a non-leaf wrapper, etc.).
    const within = (tok)=>acceptedRanges.some((r)=>tok.start >= r.start && tok.end <= r.end);
    const ranges = [
        ...acceptedRanges,
        ...tokens.filter((t)=>!within(t)).map((t)=>({
                start: t.start,
                end: t.end
            }))
    ];
    return {
        content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$webTools$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripRanges"])(text, ranges),
        toolCalls
    };
}
}),
];

//# sourceMappingURL=open-sse_translator_13_0umz._.js.map