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
];

//# sourceMappingURL=open-sse_translator_helpers_0i8dq52._.js.map